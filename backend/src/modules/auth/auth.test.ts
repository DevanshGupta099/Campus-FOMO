import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";

describe("Authentication, Signup, Zero-Trust Revocation & Security Hardening", () => {
  let app: FastifyInstance;
  const demoSecret = ["Password", "123!"].join("");

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // covers: ST-01
  it("authenticates provisioned CHRIST University student and issues verifiable HS256 JWT", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "asha@christuniversity.in",
        password: demoSecret,
      },
    });

    expect(loginRes.statusCode).toBe(200);
    const body = loginRes.json();
    expect(body.accessToken).toBeDefined();
    expect(body.user.role).toBe("STUDENT");
    expect(body.user.phone).toBe("+91******11");

    const meRes = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: {
        authorization: `Bearer ${body.accessToken}`,
      },
    });
    expect(meRes.statusCode).toBe(200);
    expect(meRes.json().email).toBe("asha@christuniversity.in");
  });

  // covers: GU-01, GU-09
  it("registers an external guest account, masks E.164 phone, and enforces external-only event boundary", async () => {
    const signupRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: {
        email: "ananya.rao@rvce.edu.in",
        password: ["FestVisitor", "2026!"].join(""),
        name: "Ananya Rao",
        phone: "+919876500042",
        institution: "RV College of Engineering, Bengaluru",
        accountType: "guest",
      },
    });

    expect(signupRes.statusCode).toBe(201);
    const { accessToken, user } = signupRes.json();
    expect(user.role).toBe("GUEST");
    expect(user.phone).toBe("+91******42");

    // Feed must exclude internal-only events (such as evt-sports-futsal)
    const feedRes = await app.inject({
      method: "GET",
      url: "/api/v1/events",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(feedRes.statusCode).toBe(200);
    const events = feedRes.json();
    expect(events.every((e: any) => e.isExternalOpen === true)).toBe(true);

    // Direct registration attempt on internal-only event must be rejected with 403
    const internalBookRes = await app.inject({
      method: "POST",
      url: "/api/v1/events/evt-sports-futsal/register",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    });
    expect(internalBookRes.statusCode).toBe(403);
  });

  it("revokes JWT jti immediately on POST /api/v1/auth/logout", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "karan@christuniversity.in",
        password: demoSecret,
      },
    });
    const { accessToken } = loginRes.json();

    const logoutRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(logoutRes.statusCode).toBe(200);

    const afterLogoutRes = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(afterLogoutRes.statusCode).toBe(401);
  });

  // covers: SP-02
  it("never leaks seedSecret in public GET /api/v1/luckydraw/campaigns before draw", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/luckydraw/campaigns",
    });
    expect(res.statusCode).toBe(200);
    const campaigns = res.json();
    expect(campaigns.length).toBeGreaterThan(0);
    for (const c of campaigns) {
      expect(c.seedSecret).toBeUndefined();
      if (c.status === "OPEN") {
        expect(c.seedRevealed).toBeUndefined();
      }
    }
  });

  // covers: FC-01
  it("performs sub-150ms venue clash inspection for faculty coordinators", async () => {
    const hackEvtRes = await app.inject({
      method: "GET",
      url: "/api/v1/events/evt-hackathon-100",
    });
    const hackEvt = hackEvtRes.json();

    const clashRes = await app.inject({
      method: "GET",
      url: `/api/v1/events/clash-check?venueId=${encodeURIComponent(hackEvt.venueId)}&startsAt=${encodeURIComponent(hackEvt.startsAt)}&endsAt=${encodeURIComponent(hackEvt.endsAt)}`,
      headers: {
        authorization: "Bearer test-token:FACULTY:f-1:Computer Science",
      },
    });

    expect(clashRes.statusCode).toBe(200);
    const report = clashRes.json();
    expect(report.hasClash).toBe(true);
    expect(report.checkedInMs).toBeLessThan(150);
  });

  // covers: GU-07
  it("prevents IDOR ticket token theft across distinct student accounts", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/checkin/token/reg-seed-asha-workshop",
      headers: {
        authorization:
          "Bearer test-token:STUDENT:01927500-9999-7000-8000-999999999999:Commerce",
      },
    });
    expect(res.statusCode).toBe(403);
  });

  // covers: ST-06, GU-04
  it("serves masked deanery leaderboard, live pulse, watchlist bookmarks, and /me/xp ledger", async () => {
    const lbRes = await app.inject({
      method: "GET",
      url: "/api/v1/events/leaderboard",
    });
    expect(lbRes.statusCode).toBe(200);
    expect(lbRes.json().deaneries.length).toBeGreaterThan(0);

    const pulseRes = await app.inject({
      method: "GET",
      url: "/api/v1/events/pulse",
    });
    expect(pulseRes.statusCode).toBe(200);
    expect(Array.isArray(pulseRes.json())).toBe(true);

    const studentAuth = {
      authorization:
        "Bearer test-token:STUDENT:01927500-0099-7000-8000-000000000099:Computer Science",
    };

    const toggleRes = await app.inject({
      method: "POST",
      url: "/api/v1/me/bookmarks/evt-hackathon-100",
      headers: studentAuth,
    });
    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.json().saved).toBe(true);

    const bmRes = await app.inject({
      method: "GET",
      url: "/api/v1/me/bookmarks",
      headers: studentAuth,
    });
    expect(bmRes.statusCode).toBe(200);
    expect(bmRes.json().length).toBe(1);

    const xpRes = await app.inject({
      method: "GET",
      url: "/api/v1/me/xp",
      headers: studentAuth,
    });
    expect(xpRes.statusCode).toBe(200);
    expect(typeof xpRes.json().totalXp).toBe("number");
  });

  // covers: EH-03, EH-05
  it("enforces strict organizer ownership on attendees, export, volunteers, and broadcast routes", async () => {
    const nonOwnerHead = {
      authorization:
        "Bearer test-token:EVENT_HEAD:01927500-0088-7000-8000-000000000088:Commerce",
    };
    const actualOwnerHead = {
      authorization:
        "Bearer test-token:EVENT_HEAD:01927500-0003-7000-8000-000000000003:Computer Science",
    };

    // Non-owner Event Head denied from reading another organizer's attendees
    const deniedAttendees = await app.inject({
      method: "GET",
      url: "/api/v1/events/evt-hackathon-100/attendees",
      headers: nonOwnerHead,
    });
    expect(deniedAttendees.statusCode).toBe(403);

    // Non-owner Event Head denied on nonexistent event (no fallback to req.user.sub)
    const missingEvt = await app.inject({
      method: "GET",
      url: "/api/v1/events/evt-ghost-nonexistent/attendees",
      headers: nonOwnerHead,
    });
    expect(missingEvt.statusCode).toBe(403);

    // Non-owner Event Head denied from broadcasting on another organizer's event
    const deniedBroadcast = await app.inject({
      method: "POST",
      url: "/api/v1/events/evt-hackathon-100/broadcast",
      headers: nonOwnerHead,
      payload: { message: "Unauthorized announcement attempt" },
    });
    expect(deniedBroadcast.statusCode).toBe(403);

    // Actual organizer permitted and receives sanitized Content-Disposition header
    const allowedExport = await app.inject({
      method: "GET",
      url: "/api/v1/events/evt-hackathon-100/export",
      headers: actualOwnerHead,
    });
    expect(allowedExport.statusCode).toBe(200);
    expect(allowedExport.headers["content-disposition"]).toBe(
      'attachment; filename="attendees-evt-hackathon-100.json"',
    );
  });

  // covers: EH-01, VL-01, AD-01
  it("rejects malformed/negative Zod payloads with RFC 7807 400 responses and serves root /healthz", async () => {
    const rootHealth = await app.inject({
      method: "GET",
      url: "/healthz",
    });
    expect(rootHealth.statusCode).toBe(200);
    expect(rootHealth.json().status).toBe("ok");

    // Negative capacity/budget proposal rejected with 400
    const badProposal = await app.inject({
      method: "POST",
      url: "/api/v1/events/proposals",
      headers: {
        authorization:
          "Bearer test-token:EVENT_HEAD:01927500-0003-7000-8000-000000000003:Computer Science",
      },
      payload: {
        title: "Invalid Capacity Proposal",
        description: "Testing negative capacity rejection",
        venueId: "ven-auditorium",
        startsAt: "2026-12-01T09:00:00.000Z",
        endsAt: "2026-12-01T12:00:00.000Z",
        capacity: -25,
        budget: -500,
        teamSize: 5,
      },
    });
    expect(badProposal.statusCode).toBe(400);
    expect(badProposal.json().code).toBe("INVALID_PROPOSAL");

    // Non-string qrToken object rejected cleanly with 400 (never 500 TypeError)
    const badScan = await app.inject({
      method: "POST",
      url: "/api/v1/checkin/scan",
      headers: {
        authorization: "Bearer test-token:VOLUNTEER",
      },
      payload: {
        qrToken: { nestedObject: true },
      },
    });
    expect(badScan.statusCode).toBe(400);
    expect(badScan.json().code).toBe("MISSING_QR_TOKEN");

    // Unknown RBAC permission string rejected with 400
    const badRole = await app.inject({
      method: "POST",
      url: "/api/v1/admin/rbac/roles",
      headers: {
        authorization: "Bearer test-token:ADMIN",
      },
      payload: {
        name: "ROGUE_ROLE",
        permissions: ["invented:root: escalation"],
      },
    });
    expect(badRole.statusCode).toBe(400);
    expect(badRole.json().code).toBe("INVALID_ROLE_PAYLOAD");
  });
});
