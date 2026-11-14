import { createHmac } from "node:crypto";
import { registrationService } from "../registration/registration.service.js";
import { eventsService } from "../events/events.service.js";
import { streamHub } from "../stream/stream.routes.js";
import { auditService } from "../../modules/audit/index.js";

export interface CheckinResult {
  status: "ADMITTED" | "ALREADY_CHECKED_IN" | "INVALID_TICKET";
  registrationId: string;
  userName: string;
  eventTitle?: string;
  scannedAt: string;
  latencyMs: number;
  message: string;
}

export class CheckinService {
  private admittedCheckins = new Map<
    string,
    {
      scannedBy: string;
      scannedAt: string;
      firstName: string;
      eventTitle: string;
    }
  >();

  generateRotatingQrToken(
    registrationId: string,
    secret: string,
    nowMs = Date.now(),
  ): string {
    const window = Math.floor(nowMs / 30000);
    const signature = createHmac("sha256", secret)
      .update(`${registrationId}:${window}`)
      .digest("hex");
    const payload = JSON.stringify({
      r: registrationId,
      w: window,
      s: signature,
    });
    return Buffer.from(payload).toString("base64url");
  }

  verifyQrToken(token: string): {
    registrationId: string;
    isValid: boolean;
    isExpired: boolean;
  } {
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const {
        r: registrationId,
        w: tokenWindow,
        s: signature,
      } = JSON.parse(decoded);

      const reg = registrationService.getRegistration(registrationId);
      if (!reg) return { registrationId, isValid: false, isExpired: false };

      const currentWindow = Math.floor(Date.now() / 30000);
      if (tokenWindow < currentWindow - 1 || tokenWindow > currentWindow + 1) {
        return { registrationId, isValid: false, isExpired: true };
      }

      const expectedSig = createHmac("sha256", reg.ticketQrSecret)
        .update(`${registrationId}:${tokenWindow}`)
        .digest("hex");
      const isValid = signature === expectedSig;

      return { registrationId, isValid, isExpired: false };
    } catch {
      return { registrationId: "", isValid: false, isExpired: false };
    }
  }

  processScan(token: string, scannerSub: string): CheckinResult {
    const start = Date.now();
    const verification = this.verifyQrToken(token);

    if (verification.isExpired) {
      return {
        status: "INVALID_TICKET",
        registrationId: verification.registrationId,
        userName: "Unknown",
        scannedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message:
          "Rotating 30s QR window expired. Ask attendee to refresh pass.",
      };
    }

    if (!verification.isValid || !verification.registrationId) {
      return {
        status: "INVALID_TICKET",
        registrationId: verification.registrationId,
        userName: "Unknown",
        scannedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: "Invalid or forged HMAC ticket signature.",
      };
    }

    const reg = registrationService.getRegistration(
      verification.registrationId,
    );
    const firstName = reg?.userName?.split(" ")[0] || "Unknown";
    const evt = reg ? eventsService.getEvent(reg.eventId) : undefined;

    if (!reg || reg.status !== "CONFIRMED") {
      return {
        status: "INVALID_TICKET",
        registrationId: verification.registrationId,
        userName: firstName,
        eventTitle: evt?.title,
        scannedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: `Pass status is ${reg?.status || "UNKNOWN"}, not CONFIRMED`,
      };
    }

    if (this.admittedCheckins.has(verification.registrationId)) {
      const prior = this.admittedCheckins.get(verification.registrationId)!;
      return {
        status: "ALREADY_CHECKED_IN",
        registrationId: verification.registrationId,
        userName: prior.firstName,
        eventTitle: prior.eventTitle,
        scannedAt: prior.scannedAt,
        latencyMs: Date.now() - start,
        message: `Attendee already admitted at ${prior.scannedAt}`,
      };
    }

    const scannedAt = new Date().toISOString();
    const eventTitle = evt?.title || "Campus Event";
    this.admittedCheckins.set(verification.registrationId, {
      scannedBy: scannerSub,
      scannedAt,
      firstName,
      eventTitle,
    });

    eventsService.awardXp(
      reg.userSub,
      100,
      `Verified gate admission: ${eventTitle}`,
    );

    auditService.record({
      action: "GATE_QR_ADMITTED",
      actor: scannerSub,
      target: reg.id,
      details: `Verified HMAC gate admission for ${eventTitle}.`,
    });

    streamHub.broadcast("checkin.verified", {
      registrationId: reg.id,
      eventId: reg.eventId,
      userName: firstName,
      checkedInCount: this.admittedCheckins.size,
    });

    return {
      status: "ADMITTED",
      registrationId: verification.registrationId,
      userName: firstName,
      eventTitle,
      scannedAt,
      latencyMs: Date.now() - start,
      message: `Verified and admitted: ${firstName}`,
    };
  }

  getStats() {
    const entries = Array.from(this.admittedCheckins.entries())
      .map(([regId, info]) => ({
        registrationId: regId,
        firstName: info.firstName,
        eventTitle: info.eventTitle,
        scannedAt: info.scannedAt,
      }))
      .reverse()
      .slice(0, 12);

    return {
      totalAdmitted: this.admittedCheckins.size,
      recentAdmissions: entries,
    };
  }
}

export const checkinService = new CheckinService();
