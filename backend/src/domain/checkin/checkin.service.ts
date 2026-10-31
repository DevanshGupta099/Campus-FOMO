import { createHmac } from "node:crypto";
import { registrationService } from "../registration/registration.service.js";
import { eventsService } from "../events/events.service.js";
import { streamHub } from "../stream/stream.routes.js";

export interface CheckinResult {
  status: "ADMITTED" | "ALREADY_CHECKED_IN" | "INVALID_TICKET";
  registrationId: string;
  userName: string;
  scannedAt: string;
  latencyMs: number;
  message: string;
}

export class CheckinService {
  private admittedCheckins = new Map<
    string,
    { scannedBy: string; scannedAt: string }
  >();

  generateRotatingQrToken(
    registrationId: string,
    secret: string,
    nowMs = Date.now(),
  ): string {
    const window = Math.floor(nowMs / 30000); // 30-second rotating time slice
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
      // Valid if in current 30s window or immediate previous 30s window
      if (tokenWindow < currentWindow - 1) {
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
        message: "QR code has expired. Please refresh the ticket.",
      };
    }

    if (!verification.isValid || !verification.registrationId) {
      return {
        status: "INVALID_TICKET",
        registrationId: verification.registrationId,
        userName: "Unknown",
        scannedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: "Invalid or forged QR ticket.",
      };
    }

    const reg = registrationService.getRegistration(
      verification.registrationId,
    );
    if (!reg || reg.status !== "CONFIRMED") {
      return {
        status: "INVALID_TICKET",
        registrationId: verification.registrationId,
        userName: reg?.userName || "Unknown",
        scannedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: `Ticket status is ${reg?.status || "UNKNOWN"}, not CONFIRMED`,
      };
    }

    // Idempotent duplicate check
    if (this.admittedCheckins.has(verification.registrationId)) {
      const prior = this.admittedCheckins.get(verification.registrationId)!;
      return {
        status: "ALREADY_CHECKED_IN",
        registrationId: verification.registrationId,
        userName: reg.userName,
        scannedAt: prior.scannedAt,
        latencyMs: Date.now() - start,
        message: `Attendee already admitted at ${prior.scannedAt}`,
      };
    }

    const scannedAt = new Date().toISOString();
    this.admittedCheckins.set(verification.registrationId, {
      scannedBy: scannerSub,
      scannedAt,
    });

    eventsService.awardXp(reg.userSub, 100, "Attended event via door check-in");

    streamHub.broadcast("checkin.verified", {
      registrationId: reg.id,
      eventId: reg.eventId,
      userName: reg.userName,
      checkedInCount: this.admittedCheckins.size,
    });

    return {
      status: "ADMITTED",
      registrationId: verification.registrationId,
      userName: reg.userName,
      scannedAt,
      latencyMs: Date.now() - start,
      message: `Verified and admitted: ${reg.userName}`,
    };
  }
}

export const checkinService = new CheckinService();
