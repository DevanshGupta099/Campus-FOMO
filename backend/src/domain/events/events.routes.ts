import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { eventsService } from "./events.service.js";
import { requirePermission } from "../../auth/middleware.js";
import { isExternalParticipantScope } from "../../access/roles.js";

const ProposalCreateBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(160),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(4000),
  category: z.string().trim().min(1).max(60).optional(),
  clubName: z.string().trim().min(1).max(120).optional(),
  venueId: z.string().trim().min(1, "venueId is required").max(64),
  indoorBackupVenueId: z.string().trim().max(64).optional(),
  startsAt: z.string().trim().min(1, "startsAt is required").max(64),
  endsAt: z.string().trim().min(1, "endsAt is required").max(64),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(10_000),
  waitlistCap: z.number().int().min(0).max(5_000).optional(),
  budget: z.number().min(0, "Budget cannot be negative").max(10_000_000),
  teamSize: z
    .number()
    .int("Team size must be an integer")
    .min(1, "Team size must be at least 1")
    .max(500),
  isExternalOpen: z.boolean().optional(),
  fee: z.number().min(0, "Fee cannot be negative").max(50_000).optional(),
  eligibility: z.string().trim().max(240).optional(),
  department: z.string().trim().max(120).optional(),
  attachment: z
    .object({
      name: z.string().trim().min(1).max(200),
      sizeBytes: z.number().int().min(0),
      mimeType: z.string().trim().min(1).max(100),
    })
    .optional(),
});

const DeanApproveBodySchema = z.object({
  approvedBudget: z.number().min(0).max(10_000_000).optional(),
});

const RejectBodySchema = z.object({
  reason: z.string().trim().max(600).default(""),
});

const CancelBodySchema = z.object({
  reason: z.string().trim().max(600).optional(),
});

const VolunteerAssignBodySchema = z.object({
  studentSub: z.string().trim().min(2, "studentSub is required").max(128),
  roleTitle: z.string().trim().min(2, "roleTitle is required").max(120),
});

const BroadcastBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Broadcast message must be at least 3 characters")
    .max(600),
});

export const eventRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/events/leaderboard (Privacy-safe deanery & student XP standings)
  app.get(
    "/events/leaderboard",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      return reply.status(200).send(eventsService.getCampusLeaderboard());
    },
  );

  // GET /api/v1/events/pulse (Anonymized live concourse telemetry)
  app.get(
    "/events/pulse",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      return reply.status(200).send(eventsService.getCampusPulse());
    },
  );

  // GET /api/v1/venues (Public Central Campus Venue Directory)
  app.get(
    "/venues",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      return reply.status(200).send(eventsService.listVenues());
    },
  );

  // GET /api/v1/events/clash-check (<150ms automated clash & monsoon check)
  app.get(
    "/events/clash-check",
    {
      config: {
        auth: ["event:create", "event:approve:dept", "event:approve:budget"],
      },
      preHandler: [
        requirePermission([
          "event:create",
          "event:approve:dept",
          "event:approve:budget",
        ]),
      ],
    },
    async (request, reply) => {
      const query = request.query as {
        venueId?: string;
        startsAt?: string;
        endsAt?: string;
        excludeEventId?: string;
      };
      if (!query.venueId || !query.startsAt || !query.endsAt) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "venueId, startsAt, and endsAt query parameters are required",
          code: "MISSING_CLASH_PARAMS",
        });
      }
      const report = eventsService.inspectVenueClash(
        query.venueId,
        query.startsAt,
        query.endsAt,
        query.excludeEventId,
      );
      return reply.status(200).send(report);
    },
  );

  // GET /api/v1/events (Public read, enforces external-only filter when user is GUEST)
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
        search?: string;
      };
      const isGuestCaller = request.user
        ? isExternalParticipantScope(request.user.permissions)
        : false;
      const isExternalOnly = isGuestCaller || query.external === "true";

      const events = eventsService.listEvents({
        status:
          query.status === "all"
            ? isGuestCaller
              ? "PUBLISHED"
              : undefined
            : query.status ||
              (request.user && !isGuestCaller ? undefined : "PUBLISHED"),
        category: query.category,
        isExternalOnly,
        search: query.search,
      });
      return reply.status(200).send(events);
    },
  );

  // GET /api/v1/events/:id (Public read, redacts internal budget fields unless authorized)
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

      if (
        request.user &&
        isExternalParticipantScope(request.user.permissions) &&
        !event.isExternalOpen
      ) {
        return reply.status(403).send({
          type: "about:blank",
          title: "Forbidden",
          status: 403,
          detail:
            "This event is restricted to CHRIST University internal members",
          code: "EXTERNAL_ACCESS_DENIED",
        });
      }

      const perms = request.user?.permissions || [];
      const canSeeBudget = perms.some((p) =>
        [
          "budget:read:own-event",
          "event:approve:dept",
          "event:approve:budget",
          "rbac:manage",
        ].includes(p),
      );

      if (!canSeeBudget) {
        const {
          budgetRequested: _br,
          budgetApproved: _ba,
          ...publicEvent
        } = event;
        return reply.status(200).send(publicEvent);
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
      const parsed = ProposalCreateBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid event proposal payload",
          code: "INVALID_PROPOSAL",
        });
      }
      try {
        const body = parsed.data;
        const user = request.user!;
        const proposal = eventsService.createProposal({
          ...body,
          organizerSub: user.sub,
          department: body.department || user.department || "Computer Science",
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
      const parsed = DeanApproveBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message ||
            "Invalid budget approval payload",
          code: "DEAN_APPROVAL_FAILED",
        });
      }
      try {
        const params = request.params as { id: string };
        const event = eventsService.approveDean(
          params.id,
          parsed.data.approvedBudget,
          request.user?.sub,
        );
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
      const parsed = RejectBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid rejection payload",
          code: "REJECTION_FAILED",
        });
      }
      try {
        const params = request.params as { id: string };
        const event = eventsService.rejectEvent(
          params.id,
          parsed.data.reason,
          request.user?.sub,
        );
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
        requirePermission(["event:cancel:own", "event:cancel:any"], (req) => {
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
      const parsed = CancelBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid cancellation payload",
          code: "EVENT_CANCEL_FAILED",
        });
      }
      try {
        const params = request.params as { id: string };
        const event = eventsService.cancelEvent(
          params.id,
          parsed.data.reason,
          request.user?.sub,
        );
        return reply.status(200).send(event);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Cancellation Failed",
          status: 400,
          detail: err.message,
          code: "EVENT_CANCEL_FAILED",
        });
      }
    },
  );

  // POST /api/v1/events/:id/volunteers (Story Card EH-02)
  app.post(
    "/events/:id/volunteers",
    {
      config: { auth: ["volunteer:assign:own-event"] },
      preHandler: [
        requirePermission("volunteer:assign:own-event", (req) => {
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
      const parsed = VolunteerAssignBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message ||
            "studentSub and roleTitle are required",
          code: "VOLUNTEER_ASSIGNMENT_FAILED",
        });
      }
      try {
        const params = request.params as { id: string };
        const user = request.user!;
        const result = eventsService.assignVolunteer(
          params.id,
          parsed.data.studentSub,
          parsed.data.roleTitle,
          user.sub,
        );
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Assignment Failed",
          status: 400,
          detail: err.message,
          code: "VOLUNTEER_ASSIGNMENT_FAILED",
        });
      }
    },
  );

  // GET /api/v1/events/:id/volunteers
  app.get(
    "/events/:id/volunteers",
    {
      config: { auth: ["volunteer:assign:own-event", "event:update:own"] },
      preHandler: [
        requirePermission(
          ["volunteer:assign:own-event", "event:update:own"],
          (req) => {
            const params = req.params as { id: string };
            const evt = eventsService.getEvent(params.id);
            return {
              userId: req.user?.sub,
              eventOwnerId: evt?.organizerSub ?? "__missing_event__",
            };
          },
        ),
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
      const volunteers = eventsService.getVolunteers(params.id);
      return reply.status(200).send(volunteers);
    },
  );

  // POST /api/v1/events/:id/broadcast (Story Card EH-05)
  app.post(
    "/events/:id/broadcast",
    {
      config: { auth: ["broadcast:send:own-event", "event:update:own"] },
      preHandler: [
        requirePermission(
          ["broadcast:send:own-event", "event:update:own"],
          (req) => {
            const params = req.params as { id: string };
            const evt = eventsService.getEvent(params.id);
            return {
              userId: req.user?.sub,
              eventOwnerId: evt?.organizerSub ?? "__missing_event__",
            };
          },
        ),
      ],
    },
    async (request, reply) => {
      const parsed = BroadcastBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message ||
            "Broadcast message must be at least 3 characters",
          code: "BROADCAST_FAILED",
        });
      }
      try {
        const params = request.params as { id: string };
        const user = request.user!;
        const result = eventsService.sendBroadcast(
          params.id,
          parsed.data.message,
          user.sub,
        );
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Broadcast Failed",
          status: 400,
          detail: err.message,
          code: "BROADCAST_FAILED",
        });
      }
    },
  );

  // GET /api/v1/gallery (Story Card GU-02)
  app.get(
    "/gallery",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const query = request.query as { category?: string };
      const items = eventsService.getGallery(query.category);
      return reply.status(200).send(items);
    },
  );
};
