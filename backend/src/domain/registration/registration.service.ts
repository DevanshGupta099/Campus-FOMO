import { randomBytes } from "node:crypto";
import { eventsService } from "../events/events.service.js";
import { streamHub } from "../stream/stream.routes.js";

export interface RegistrationRecord {
  id: string;
  eventId: string;
  userSub: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  waitlistPosition?: number;
  isGuest: boolean;
  guestInstitution?: string;
  ticketQrSecret: string;
  idempotencyKey?: string;
  createdAt: string;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone?: string): string {
  if (!phone || phone.length < 4) return "+91******00";
  const last2 = phone.slice(-2);
  return `+91******${last2}`;
}

export class RegistrationService {
  private registrations = new Map<string, RegistrationRecord>();
  private idempotencyStore = new Map<string, RegistrationRecord>();

  private lockPromise: Promise<void> = Promise.resolve();

  constructor() {
    // Seed one confirmed pass for demo student Asha on Workshop so My Passes has an immediate live QR pass
    const workshop = eventsService.getEvent("evt-tech-workshop");
    if (workshop) {
      const seedId = "reg-seed-asha-workshop";
      this.registrations.set(seedId, {
        id: seedId,
        eventId: "evt-tech-workshop",
        userSub: "01927500-0001-7000-8000-000000000001",
        userEmail: "asha@christuniversity.in",
        userName: "Asha Kumar",
        userPhone: "+919000000011",
        status: "CONFIRMED",
        isGuest: false,
        ticketQrSecret: "seed-hmac-secret-christ-central-asha-01",
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      });
    }
  }

  private async acquireLock(): Promise<() => void> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lockPromise;
    this.lockPromise = nextLock;
    await currentLock;
    return release!;
  }

  async register(params: {
    eventId: string;
    userSub: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    isGuest?: boolean;
    guestInstitution?: string;
    idempotencyKey?: string;
  }): Promise<{ registration: RegistrationRecord; isWaitlisted: boolean }> {
    if (
      params.idempotencyKey &&
      this.idempotencyStore.has(params.idempotencyKey)
    ) {
      const existing = this.idempotencyStore.get(params.idempotencyKey)!;
      return {
        registration: existing,
        isWaitlisted: existing.status === "WAITLISTED",
      };
    }

    const release = await this.acquireLock();
    try {
      const event = eventsService.getEvent(params.eventId);
      if (!event) throw new Error("Event not found");
      if (event.status !== "PUBLISHED") {
        throw new Error(
          `Cannot register for event with status: ${event.status}`,
        );
      }
      if (params.isGuest && !event.isExternalOpen) {
        throw new Error(
          "EXTERNAL_CLOSED: This event is open exclusively to CHRIST University members",
        );
      }

      for (const reg of this.registrations.values()) {
        if (
          reg.eventId === params.eventId &&
          reg.userSub === params.userSub &&
          reg.status !== "CANCELLED"
        ) {
          throw new Error("User is already registered for this event");
        }
      }

      const id = `reg-${randomBytes(8).toString("hex")}`;
      const ticketQrSecret = randomBytes(16).toString("hex");

      if (event.confirmedCount < event.capacity) {
        event.confirmedCount += 1;
        const reg: RegistrationRecord = {
          id,
          eventId: params.eventId,
          userSub: params.userSub,
          userEmail: params.userEmail,
          userName: params.userName,
          userPhone: params.userPhone,
          status: "CONFIRMED",
          isGuest: params.isGuest || false,
          guestInstitution: params.guestInstitution,
          ticketQrSecret,
          idempotencyKey: params.idempotencyKey,
          createdAt: new Date().toISOString(),
        };
        this.registrations.set(id, reg);
        if (params.idempotencyKey) {
          this.idempotencyStore.set(params.idempotencyKey, reg);
        }

        eventsService.awardXp(
          params.userSub,
          50,
          `Confirmed seat for ${event.title}`,
        );

        streamHub.broadcast("seat.updated", {
          eventId: event.id,
          confirmedCount: event.confirmedCount,
          capacity: event.capacity,
          remaining: event.capacity - event.confirmedCount,
        });

        return { registration: reg, isWaitlisted: false };
      }

      if (event.waitlistCount < event.waitlistCap) {
        event.waitlistCount += 1;
        const waitlistPosition = event.waitlistCount;
        const reg: RegistrationRecord = {
          id,
          eventId: params.eventId,
          userSub: params.userSub,
          userEmail: params.userEmail,
          userName: params.userName,
          userPhone: params.userPhone,
          status: "WAITLISTED",
          waitlistPosition,
          isGuest: params.isGuest || false,
          guestInstitution: params.guestInstitution,
          ticketQrSecret,
          idempotencyKey: params.idempotencyKey,
          createdAt: new Date().toISOString(),
        };
        this.registrations.set(id, reg);
        if (params.idempotencyKey) {
          this.idempotencyStore.set(params.idempotencyKey, reg);
        }

        streamHub.broadcast("waitlist.updated", {
          eventId: event.id,
          waitlistCount: event.waitlistCount,
          waitlistCap: event.waitlistCap,
        });

        return { registration: reg, isWaitlisted: true };
      }

      throw new Error("EVENT_FULL: Capacity and waitlist limit reached");
    } finally {
      release();
    }
  }

  async cancel(
    registrationId: string,
    userSub: string,
  ): Promise<{ cancelled: RegistrationRecord; promoted?: RegistrationRecord }> {
    const release = await this.acquireLock();
    try {
      const reg = this.registrations.get(registrationId);
      if (!reg) throw new Error("Registration not found");
      if (reg.userSub !== userSub) {
        throw new Error("Cannot cancel another user's registration");
      }
      if (reg.status === "CANCELLED") {
        throw new Error("Registration is already cancelled");
      }

      const event = eventsService.getEvent(reg.eventId);
      if (!event) throw new Error("Event not found");

      if (Date.now() >= new Date(event.startsAt).getTime()) {
        throw new Error("Cancellations close once the event has started");
      }

      const wasConfirmed = reg.status === "CONFIRMED";
      reg.status = "CANCELLED";

      let promoted: RegistrationRecord | undefined;

      if (wasConfirmed) {
        event.confirmedCount = Math.max(0, event.confirmedCount - 1);

        const waitlisted = Array.from(this.registrations.values())
          .filter((r) => r.eventId === reg.eventId && r.status === "WAITLISTED")
          .sort(
            (a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0),
          );

        if (waitlisted.length > 0) {
          const first = waitlisted[0];
          first.status = "CONFIRMED";
          first.waitlistPosition = undefined;
          event.confirmedCount += 1;
          event.waitlistCount = Math.max(0, event.waitlistCount - 1);
          promoted = first;

          for (let i = 1; i < waitlisted.length; i++) {
            if (waitlisted[i].waitlistPosition) {
              waitlisted[i].waitlistPosition = i;
            }
          }
        }
      } else {
        event.waitlistCount = Math.max(0, event.waitlistCount - 1);
        const waitlisted = Array.from(this.registrations.values())
          .filter(
            (r) =>
              r.eventId === reg.eventId &&
              r.status === "WAITLISTED" &&
              r.id !== reg.id,
          )
          .sort(
            (a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0),
          );
        for (let i = 0; i < waitlisted.length; i++) {
          waitlisted[i].waitlistPosition = i + 1;
        }
      }

      streamHub.broadcast("seat.updated", {
        eventId: event.id,
        confirmedCount: event.confirmedCount,
        capacity: event.capacity,
        remaining: event.capacity - event.confirmedCount,
      });

      if (promoted) {
        streamHub.broadcast("waitlist.promoted", {
          eventId: event.id,
          eventTitle: event.title,
          promotedRegistrationId: promoted.id,
          userSub: promoted.userSub,
        });
      }

      return { cancelled: reg, promoted };
    } finally {
      release();
    }
  }

  getRegistration(id: string): RegistrationRecord | undefined {
    return this.registrations.get(id);
  }

  listUserRegistrations(userSub: string) {
    return Array.from(this.registrations.values())
      .filter((r) => r.userSub === userSub)
      .map((r) => {
        const evt = eventsService.getEvent(r.eventId);
        const { ticketQrSecret: _secret, userPhone, userEmail, ...rest } = r;
        return {
          ...rest,
          userEmail: maskEmail(userEmail),
          userPhone: userPhone ? maskPhone(userPhone) : undefined,
          eventTitle: evt?.title || "Campus Event",
          venueName: evt?.venueName || "Central Campus",
          startsAt: evt?.startsAt || r.createdAt,
          endsAt: evt?.endsAt || r.createdAt,
          category: evt?.category || "General",
          fee: evt?.fee ?? 0,
          lastUpdateBanner: evt?.lastUpdateBanner,
        };
      });
  }

  listAttendees(eventId: string, maskPII = true) {
    const list = Array.from(this.registrations.values()).filter(
      (r) => r.eventId === eventId,
    );
    if (!maskPII) return list;

    return list.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      userSub: r.userSub,
      userName: r.userName,
      userEmail: maskEmail(r.userEmail),
      userPhone: maskPhone(r.userPhone),
      status: r.status,
      waitlistPosition: r.waitlistPosition,
      isGuest: r.isGuest,
      guestInstitution: r.guestInstitution,
      createdAt: r.createdAt,
    }));
  }
}

export const registrationService = new RegistrationService();
