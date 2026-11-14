import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { registrationService } from "./registration.service.js";
import { eventsService } from "../events/events.service.js";
import { requirePermission } from "../../auth/middleware.js";
import { isExternalParticipantScope } from "../../access/roles.js";

const RegisterEventBodySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+91[6-9]\d{9}$/,
      "Phone must follow E.164 Indian format (+91XXXXXXXXXX)",
    )
    .optional(),
  institution: z.string().trim().min(2).max(140).optional(),
});

export const registrationRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/registrations/me
  app.get(
    "/registrations/me",
    {
      config: { auth: ["registration:read:own"] },
      preHandler: [requirePermission("registration:read:own")],
    },
    async (request, reply) => {
      const user = request.user!;
      const list = registrationService.listUserRegistrations(user.sub);
      return reply.status(200).send(list);
    },
  );

  // POST /api/v1/events/:id/register
  app.post(
    "/events/:id/register",
    {
      config: { auth: ["registration:create"] },
      preHandler: [requirePermission("registration:create")],
    },
    async (request, reply) => {
      const parsed = RegisterEventBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid registration payload",
          code: "REGISTRATION_ERROR",
        });
      }
      try {
        const params = request.params as { id: string };
        const body = parsed.data;
        const user = request.user!;
        const rawKey = request.headers["idempotency-key"];
        const idempotencyKey =
          typeof rawKey === "string" && rawKey.length <= 128
            ? rawKey.trim() || undefined
            : undefined;

        const result = await registrationService.register({
          eventId: params.id,
          userSub: user.sub,
          userEmail: user.email,
          userName: body.name || user.name,
          userPhone: body.phone,
          isGuest: isExternalParticipantScope(user.permissions),
          guestInstitution: body.institution || user.institution,
          idempotencyKey,
        });

        const { ticketQrSecret: _secret, ...safeReg } = result.registration;

        return reply.status(201).send({
          registration: {
            ...safeReg,
            userPhone: safeReg.userPhone
              ? `+91******${safeReg.userPhone.slice(-2)}`
              : undefined,
          },
          isWaitlisted: result.isWaitlisted,
        });
      } catch (err: any) {
        const statusCode = err.message.includes("EVENT_FULL")
          ? 409
          : err.message.includes("EXTERNAL_CLOSED")
            ? 403
            : 400;
        return reply.status(statusCode).send({
          type: "about:blank",
          title: "Registration Failed",
          status: statusCode,
          detail: err.message,
          code: err.message.includes("EVENT_FULL")
            ? "EVENT_CAPACITY_FULL"
            : err.message.includes("EXTERNAL_CLOSED")
              ? "EXTERNAL_ACCESS_DENIED"
              : "REGISTRATION_ERROR",
        });
      }
    },
  );

  // POST /api/v1/registrations/:id/cancel
  app.post(
    "/registrations/:id/cancel",
    {
      config: { auth: ["registration:cancel:own"] },
      preHandler: [requirePermission("registration:cancel:own")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const user = request.user!;
        const result = await registrationService.cancel(params.id, user.sub);
        const { ticketQrSecret: _s1, ...safeCancelled } = result.cancelled;
        const safePromoted = result.promoted
          ? (() => {
              const { ticketQrSecret: _s2, ...rest } = result.promoted!;
              return rest;
            })()
          : undefined;
        return reply.status(200).send({
          cancelled: safeCancelled,
          promoted: safePromoted,
        });
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Cancellation Failed",
          status: 400,
          detail: err.message,
          code: "CANCEL_ERROR",
        });
      }
    },
  );

  // GET /api/v1/events/:id/attendees
  app.get(
    "/events/:id/attendees",
    {
      config: { auth: ["registration:manage:own-event"] },
      preHandler: [
        requirePermission("registration:manage:own-event", (req) => {
          const params = req.params as { id: string };
          const evt = eventsService.getEvent(params.id);
          return {
            userId: req.user?.sub,
            eventOwnerId: evt?.organizerSub ?? "__missing_event__",
          };
        }),
      ],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      if (!eventsService.getEvent(params.id)) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Event ${params.id} not found`,
          code: "EVENT_NOT_FOUND",
        });
      }
      const attendees = registrationService.listAttendees(params.id, true);
      return reply.status(200).send(attendees);
    },
  );

  // GET /api/v1/events/:id/export
  app.get(
    "/events/:id/export",
    {
      config: { auth: ["registration:export:own-event"] },
      preHandler: [
        requirePermission("registration:export:own-event", (req) => {
          const params = req.params as { id: string };
          const evt = eventsService.getEvent(params.id);
          return {
            userId: req.user?.sub,
            eventOwnerId: evt?.organizerSub ?? "__missing_event__",
          };
        }),
      ],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      if (!eventsService.getEvent(params.id)) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Event ${params.id} not found`,
          code: "EVENT_NOT_FOUND",
        });
      }
      const safeFileId = params.id.replace(/[^a-zA-Z0-9_-]/g, "") || "event";
      const attendees = registrationService.listAttendees(params.id, true);
      reply.header(
        "Content-Disposition",
        `attachment; filename="attendees-${safeFileId}.json"`,
      );
      return reply.status(200).send({
        eventId: params.id,
        exportedAt: new Date().toISOString(),
        exportedBy: request.user?.sub,
        recordCount: attendees.length,
        attendees,
      });
    },
  );
};
