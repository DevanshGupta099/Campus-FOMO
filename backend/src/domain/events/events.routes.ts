import type { FastifyPluginAsync } from "fastify";
import { eventsService } from "./events.service.js";
import { requirePermission } from "../../auth/middleware.js";

export const eventRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/events (Public read)
  app.get(
    "/events",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const query = request.query as {
        category?: string;
        external?: string;
        status?: string;
      };
      const isExternalOnly = query.external === "true";
      const events = eventsService.listEvents({
        status: query.status || "PUBLISHED",
        category: query.category,
        isExternalOnly,
      });
      return reply.status(200).send(events);
    },
  );

  // GET /api/v1/events/:id (Public read)
  app.get(
    "/events/:id",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const event = eventsService.getEvent(params.id);
      if (!event) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Event ${params.id} not found`,
          code: "EVENT_NOT_FOUND",
        });
      }
      return reply.status(200).send(event);
    },
  );

  // POST /api/v1/events/proposals
  app.post(
    "/events/proposals",
    {
      config: { auth: ["event:create"] },
      preHandler: [requirePermission("event:create")],
    },
    async (request, reply) => {
      try {
        const body = request.body as any;
        const user = request.user!;
        const proposal = eventsService.createProposal({
          ...body,
          organizerSub: user.sub,
          department: user.department || "General",
        });
        return reply.status(201).send(proposal);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: err.message,
          code: "INVALID_PROPOSAL",
        });
      }
    },
  );

  // POST /api/v1/events/:id/approve-faculty
  app.post(
    "/events/:id/approve-faculty",
    {
      config: { auth: ["event:approve:dept"] },
      preHandler: [requirePermission("event:approve:dept")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const user = request.user!;
        const event = eventsService.approveFaculty(
          params.id,
          user.sub,
          user.department || "",
        );
        return reply.status(200).send(event);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Approval Failed",
          status: 400,
          detail: err.message,
          code: "FACULTY_APPROVAL_FAILED",
        });
      }
    },
  );

  // POST /api/v1/events/:id/approve-dean
  app.post(
    "/events/:id/approve-dean",
    {
      config: { auth: ["event:approve:budget"] },
      preHandler: [requirePermission("event:approve:budget")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const body = (request.body as { approvedBudget?: number }) || {};
        const event = eventsService.approveDean(params.id, body.approvedBudget);
        return reply.status(200).send(event);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Approval Failed",
          status: 400,
          detail: err.message,
          code: "DEAN_APPROVAL_FAILED",
        });
      }
    },
  );

  // POST /api/v1/events/:id/reject
  app.post(
    "/events/:id/reject",
    {
      config: { auth: ["event:reject"] },
      preHandler: [requirePermission("event:reject")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const body = (request.body as { reason: string }) || { reason: "" };
        const event = eventsService.rejectEvent(params.id, body.reason);
        return reply.status(200).send(event);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Rejection Failed",
          status: 400,
          detail: err.message,
          code: "REJECTION_FAILED",
        });
      }
    },
  );

  // POST /api/v1/events/:id/cancel
  app.post(
    "/events/:id/cancel",
    {
      config: { auth: ["event:cancel:own", "event:cancel:any"] },
      preHandler: [
        requirePermission("event:cancel:own", (req) => {
          const params = req.params as { id: string };
          const evt = eventsService.getEvent(params.id);
          return { userId: req.user?.sub, eventOwnerId: evt?.organizerSub };
        }),
      ],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = (request.body as { reason?: string }) || {};
      const event = eventsService.cancelEvent(params.id, body.reason);
      return reply.status(200).send(event);
    },
  );
};
