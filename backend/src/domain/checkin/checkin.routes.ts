import type { FastifyPluginAsync } from "fastify";
import { checkinService } from "./checkin.service.js";
import { registrationService } from "../registration/registration.service.js";
import { requirePermission } from "../../auth/middleware.js";

export const checkinRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/checkin/scan
  app.post(
    "/checkin/scan",
    {
      config: { auth: ["checkin:scan:own-event"] },
      preHandler: [requirePermission("checkin:scan:own-event")],
    },
    async (request, reply) => {
      const body = request.body as { qrToken: string };
      if (!body?.qrToken) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "qrToken is required",
          code: "MISSING_QR_TOKEN",
        });
      }

      const result = checkinService.processScan(
        body.qrToken,
        request.user?.sub || "volunteer",
      );
      return reply.status(200).send(result);
    },
  );

  // GET /api/v1/checkin/token/:id (Ticket holder reads their dynamic rotating QR token)
  app.get(
    "/checkin/token/:id",
    {
      config: { auth: ["registration:read:own"] },
      preHandler: [requirePermission("registration:read:own")],
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

      const qrToken = checkinService.generateRotatingQrToken(
        reg.id,
        reg.ticketQrSecret,
      );
      return reply.status(200).send({
        registrationId: reg.id,
        qrToken,
        expiresInSeconds: 30,
      });
    },
  );
};
