import { createHmac, randomBytes } from "node:crypto";
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

  // Lock primitive to guarantee strict sequential atomicity during concurrency tests
  private lockPromise: Promise<void> = Promise.resolve();

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
    // Idempotency check
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

      // Check for existing active registration by this user
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

      // Atomic seat check: capacity condition
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
        if (params.idempotencyKey)
          this.idempotencyStore.set(params.idempotencyKey, reg);

        streamHub.broadcast("seat.updated", {
          eventId: event.id,
          confirmedCount: event.confirmedCount,
          capacity: event.capacity,
          remaining: event.capacity - event.confirmedCount,
        });

        return { registration: reg, isWaitlisted: false };
      }

      // Seat full — check waitlist cap
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
        if (params.idempotencyKey)
          this.idempotencyStore.set(params.idempotencyKey, reg);

        streamHub.broadcast("waitlist.updated", {
          eventId: event.id,
          waitlistCount: event.waitlistCount,
          waitlistCap: event.waitlistCap,
        });

        return { registration: reg, isWaitlisted: true };
      }

      // Event is completely full (capacity and waitlist exhausted)
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
      if (reg.userSub !== userSub)
        throw new Error("Cannot cancel another user's registration");
      if (reg.status === "CANCELLED")
        throw new Error("Registration is already cancelled");

      const event = eventsService.getEvent(reg.eventId);
      if (!event) throw new Error("Event not found");

      const wasConfirmed = reg.status === "CONFIRMED";
      reg.status = "CANCELLED";

      let promoted: RegistrationRecord | undefined;

      if (wasConfirmed) {
        event.confirmedCount -= 1;

        // Atomic waitlist promotion: find waitlist position 1
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
          event.waitlistCount -= 1;
          promoted = first;

          // Re-index remaining waitlisted attendees
          for (let i = 1; i < waitlisted.length; i++) {
            if (waitlisted[i].waitlistPosition) {
              waitlisted[i].waitlistPosition = i;
            }
          }
        }
      } else {
        // Was waitlisted
        event.waitlistCount -= 1;
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

  listUserRegistrations(userSub: string): RegistrationRecord[] {
    return Array.from(this.registrations.values()).filter(
      (r) => r.userSub === userSub,
    );
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
