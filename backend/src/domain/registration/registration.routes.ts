import type { FastifyPluginAsync } from "fastify";
import { registrationService } from "./registration.service.js";
import { requirePermission } from "../../auth/middleware.js";

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
      try {
        const params = request.params as { id: string };
        const body = (request.body as any) || {};
        const user = request.user!;
        const idempotencyKey =
          (request.headers["idempotency-key"] as string) || undefined;

        const result = await registrationService.register({
          eventId: params.id,
          userSub: user.sub,
          userEmail: user.email,
          userName: user.name,
          userPhone: body.phone,
          isGuest: user.role === "GUEST",
          guestInstitution: body.institution || user.institution,
          idempotencyKey,
        });

        return reply.status(201).send(result);
      } catch (err: any) {
        const statusCode = err.message.includes("EVENT_FULL") ? 409 : 400;
        return reply.status(statusCode).send({
          type: "about:blank",
          title: "Registration Failed",
          status: statusCode,
          detail: err.message,
          code: err.message.includes("EVENT_FULL")
            ? "EVENT_CAPACITY_FULL"
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
        return reply.status(200).send(result);
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
      preHandler: [requirePermission("registration:manage:own-event")],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const attendees = registrationService.listAttendees(params.id, true); // Masked PII
      return reply.status(200).send(attendees);
    },
  );

  // GET /api/v1/events/:id/export
  app.get(
    "/events/:id/export",
    {
      config: { auth: ["registration:export:own-event"] },
      preHandler: [requirePermission("registration:export:own-event")],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const attendees = registrationService.listAttendees(params.id, true);
      reply.header(
        "Content-Disposition",
        `attachment; filename="attendees-${params.id}.json"`,
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
