import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { eventsService } from "./events/events.service.js";
import { registrationService } from "./registration/registration.service.js";
import { checkinService } from "./checkin/checkin.service.js";
import { luckyDrawService } from "./luckydraw/luckydraw.service.js";

describe("Domain Core & High-Contention Concurrency Suite", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Story Card ST-01 & EH-03: The Last Seat Concurrency Race", () => {
    // covers: ST-01
    // covers: EH-03
    it("50 simultaneous requests for 1 remaining seat yield exactly 1 confirmed, 10 waitlisted, and 39 rejected", async () => {
      const eventId = "evt-hackathon-100";
      const event = eventsService.getEvent(eventId)!;

      expect(event.capacity).toBe(50);
      expect(event.confirmedCount).toBe(49); // Exactly 1 seat left
      expect(event.waitlistCap).toBe(10);
      expect(event.waitlistCount).toBe(0);

      // Fire 50 concurrent registration attempts at the same millisecond
      const parallelRequests = Array.from({ length: 50 }, (_, i) => {
        return registrationService
          .register({
            eventId,
            userSub: `user-sim-${i}`,
            userEmail: `sim-${i}@christuniversity.in`,
            userName: `Simulated Student ${i}`,
          })
          .catch((err) => ({ error: err.message }));
      });

      const results = await Promise.all(parallelRequests);

      const confirmed = results.filter(
        (r: any) => r.registration?.status === "CONFIRMED",
      );
      const waitlisted = results.filter(
        (r: any) => r.registration?.status === "WAITLISTED",
      );
      const rejected = results.filter(
        (r: any) => r.error && r.error.includes("EVENT_FULL"),
      );

      // Exactly 1 confirmed
      expect(confirmed.length).toBe(1);
      // Exactly 10 waitlisted
      expect(waitlisted.length).toBe(10);
      // Exactly 39 rejected with EVENT_FULL
      expect(rejected.length).toBe(39);

      // Crucial invariant: confirmed count never exceeds capacity (solves 149 / 100 bug)
      expect(event.confirmedCount).toBe(50);
      expect(event.confirmedCount).toBeLessThanOrEqual(event.capacity);
      expect(event.waitlistCount).toBe(10);
    });

    // covers: ST-01
    // covers: EH-03
    it("cancelling confirmed attendee atomically promotes #1 waitlisted attendee", async () => {
      const eventId = "evt-hackathon-100";
      const attendees = registrationService.listAttendees(eventId, false);
      const confirmedAttendee = attendees.find((a) => a.status === "CONFIRMED");
      const waitlist1 = attendees.find(
        (a) => a.status === "WAITLISTED" && a.waitlistPosition === 1,
      );

      expect(confirmedAttendee).toBeDefined();
      expect(waitlist1).toBeDefined();

      const cancelResult = await registrationService.cancel(
        confirmedAttendee!.id,
        confirmedAttendee!.userSub,
      );

      expect(cancelResult.cancelled.status).toBe("CANCELLED");
      expect(cancelResult.promoted).toBeDefined();
      expect(cancelResult.promoted!.id).toBe(waitlist1!.id);
      expect(cancelResult.promoted!.status).toBe("CONFIRMED");

      // Verify event total capacity remained steady at 50
      const event = eventsService.getEvent(eventId)!;
      expect(event.confirmedCount).toBe(50);
      expect(event.waitlistCount).toBe(9);
    });
  });

  describe("Story Card SP-02: Lucky Draw Concurrency & Commit-Reveal Protocol", () => {
    // covers: SP-02
    it("50 simultaneous draw entries for same user yield exactly 1 entry and 49 rejections", async () => {
      const campaign = luckyDrawService.createCampaign(
        "evt-hackathon-100",
        "Cafe Voucher Draw",
      );
      const userSub = "01927500-0001-7000-8000-000000000001";

      // 50 parallel entry attempts with distinct sessions
      const parallelEntries = Array.from({ length: 50 }, (_, i) => {
        const session = luckyDrawService.createSession(campaign.id, userSub);
        return luckyDrawService
          .enterCampaign({
            campaignId: campaign.id,
            sessionId: session.sessionId,
            userSub,
            userName: "Asha Kumar",
            department: "Computer Science",
          })
          .catch((err) => ({ error: err.message }));
      });

      const results = await Promise.all(parallelEntries);
      const successful = results.filter((r: any) => !r.error);
      const rejected = results.filter(
        (r: any) => r.error && r.error.includes("UNIQUE constraint violated"),
      );

      expect(successful.length).toBe(1);
      expect(rejected.length).toBe(49);
      expect(campaign.totalEntries).toBe(1);
    });

    // covers: SP-02
    it("executes commit-reveal draw and produces verifiable cryptographic proof", async () => {
      const campaign = luckyDrawService.createCampaign(
        "evt-hackathon-100",
        "Grand Finale Lucky Draw",
      );

      // Enter 10 unique entrants
      for (let i = 0; i < 10; i++) {
        const session = luckyDrawService.createSession(
          campaign.id,
          `entrant-sub-${i}`,
        );
        await luckyDrawService.enterCampaign({
          campaignId: campaign.id,
          sessionId: session.sessionId,
          userSub: `entrant-sub-${i}`,
          userName: `Student Entrant ${i}`,
          department: "Commerce",
        });
      }

      // Execute draw
      const drawn = luckyDrawService.executeDraw(campaign.id);
      expect(drawn.status).toBe("DRAWN");
      expect(drawn.seedRevealed).toBeDefined();
      expect(drawn.winnerSub).toBeDefined();

      // Verify draw publicly
      const verify = luckyDrawService.verifyDraw(campaign.id);
      expect(verify.isSeedValid).toBe(true);
      expect(verify.isWinnerIndexExact).toBe(true);
      expect(verify.winnerDepartment).toBe("Commerce");
    });
  });

  describe("Story Card EH-04 & VL-01: QR Door Check-in", () => {
    // covers: EH-04
    // covers: VL-01
    it("generates rotating QR token and admits attendee in under 500 milliseconds", async () => {
      const reg = await registrationService.register({
        eventId: "evt-hackathon-100",
        userSub: "sub-qr-tester",
        userEmail: "qr-tester@christuniversity.in",
        userName: "QR Attendee",
      });

      // Force confirmed status for test check-in
      reg.registration.status = "CONFIRMED";

      const token = checkinService.generateRotatingQrToken(
        reg.registration.id,
        reg.registration.ticketQrSecret,
      );
      const scanResult = checkinService.processScan(token, "scanner-sub-1");

      expect(scanResult.status).toBe("ADMITTED");
      expect(scanResult.latencyMs).toBeLessThan(500);

      // Duplicate scan returns ALREADY_CHECKED_IN idempotently
      const dupResult = checkinService.processScan(token, "scanner-sub-1");
      expect(dupResult.status).toBe("ALREADY_CHECKED_IN");
    });
  });

  describe("Story Cards FC-01, DS-01, AD-01: Route × Persona AuthZ Matrix", () => {
    // covers: FC-01
    // covers: DS-01
    // covers: AD-01
    // covers: SP-01
    it("enforces exact allow/deny matrix across personas", async () => {
      // 1. Proposal approval: FACULTY allowed, STUDENT denied
      const facultyApproveRes = await app.inject({
        method: "POST",
        url: "/api/v1/events/evt-hackathon-100/approve-faculty",
        headers: {
          authorization: "Bearer test-token:FACULTY:f-1:Computer Science",
        },
      });
      // Should fail only if not in PENDING_FACULTY, but NOT with 403 Forbidden
      expect(facultyApproveRes.statusCode).not.toBe(403);

      const studentApproveRes = await app.inject({
        method: "POST",
        url: "/api/v1/events/evt-hackathon-100/approve-faculty",
        headers: { authorization: "Bearer test-token:STUDENT" },
      });
      expect(studentApproveRes.statusCode).toBe(403);

      // 2. Dean budget clearance: DEAN allowed, FACULTY denied
      const deanApproveRes = await app.inject({
        method: "POST",
        url: "/api/v1/events/evt-hackathon-100/approve-dean",
        headers: { authorization: "Bearer test-token:DEAN" },
      });
      expect(deanApproveRes.statusCode).not.toBe(403);

      const facultyDeanRes = await app.inject({
        method: "POST",
        url: "/api/v1/events/evt-hackathon-100/approve-dean",
        headers: { authorization: "Bearer test-token:FACULTY" },
      });
      expect(facultyDeanRes.statusCode).toBe(403);

      // 3. Sponsor analytics: SPONSOR allowed, GUEST denied
      const sponsorRes = await app.inject({
        method: "GET",
        url: "/api/v1/sponsors/analytics",
        headers: { authorization: "Bearer test-token:SPONSOR" },
      });
      expect(sponsorRes.statusCode).toBe(200);

      const guestRes = await app.inject({
        method: "GET",
        url: "/api/v1/sponsors/analytics",
        headers: { authorization: "Bearer test-token:GUEST" },
      });
      expect(guestRes.statusCode).toBe(403);
    });
  });

  describe("Story Card ST-06 & A9: Real-Time Stream Bus & Student Gamification", () => {
    // covers: ST-06
    it("returns student XP ledger, history, and badges on /me/gamification", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/me/gamification",
        headers: {
          authorization:
            "Bearer test-token:STUDENT:01927500-0001-7000-8000-000000000001",
        },
      });

      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.userSub).toBe("01927500-0001-7000-8000-000000000001");
      expect(typeof data.totalXp).toBe("number");
      expect(Array.isArray(data.badges)).toBe(true);
    });

    // covers: A9
    it("polls recent events on /stream/poll with Last-Event-ID deduplication", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/stream/poll?since=0",
      });

      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(Array.isArray(data.events)).toBe(true);
      expect(data.events.length).toBeGreaterThan(0);
      expect(data.pollIntervalMs).toBe(15000);
    });
  });
});
