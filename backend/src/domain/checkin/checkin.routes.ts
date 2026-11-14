import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { checkinService } from "./checkin.service.js";
import { registrationService } from "../registration/registration.service.js";
import { requirePermission } from "../../auth/middleware.js";

const CheckinScanBodySchema = z.object({
  qrToken: z.string().trim().min(1, "qrToken is required").max(512),
});

export const checkinRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/checkin/scan
  app.post(
    "/checkin/scan",
    {
      config: { auth: ["checkin:scan:own-event"] },
      preHandler: [requirePermission("checkin:scan:own-event")],
    },
    async (request, reply) => {
      const parsed = CheckinScanBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: parsed.error.issues[0]?.message || "qrToken is required",
          code: "MISSING_QR_TOKEN",
        });
      }

      const result = checkinService.processScan(
        parsed.data.qrToken,
        request.user?.sub || "volunteer",
      );
      return reply.status(200).send(result);
    },
  );

  // GET /api/v1/checkin/stats (Zero-PII gate telemetry for volunteers & event heads)
  app.get(
    "/checkin/stats",
    {
      config: { auth: ["checkin:scan:own-event"] },
      preHandler: [requirePermission("checkin:scan:own-event")],
    },
    async (_request, reply) => {
      return reply.status(200).send(checkinService.getStats());
    },
  );

  // GET /api/v1/checkin/token/:id (Ticket holder reads their OWN dynamic rotating QR token)
  app.get(
    "/checkin/token/:id",
    {
      config: { auth: ["registration:read:own", "checkin:scan:own-event"] },
      preHandler: [
        requirePermission(["registration:read:own", "checkin:scan:own-event"]),
      ],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const reg = registrationService.getRegistration(params.id);
      if (!reg) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: "Ticket not found",
          code: "TICKET_NOT_FOUND",
        });
      }

      const caller = request.user!;
      const isOwner = reg.userSub === caller.sub;
      const isAuthorizedStaff = caller.permissions.some((p) =>
        [
          "rbac:manage",
          "checkin:manage:own-event",
          "checkin:scan:own-event",
        ].includes(p),
      );

      if (!isOwner && !isAuthorizedStaff) {
        return reply.status(403).send({
          type: "about:blank",
          title: "Forbidden",
          status: 403,
          detail:
            "Cannot generate rotating QR token for another attendee's pass",
          code: "FORBIDDEN_TICKET_OWNER_MISMATCH",
        });
      }

      const nowMs = Date.now();
      const qrToken = checkinService.generateRotatingQrToken(
        reg.id,
        reg.ticketQrSecret,
        nowMs,
      );
      const secondsRemaining = 30 - (Math.floor(nowMs / 1000) % 30);

      return reply.status(200).send({
        registrationId: reg.id,
        qrToken,
        expiresInSeconds: secondsRemaining,
      });
    },
  );
};
