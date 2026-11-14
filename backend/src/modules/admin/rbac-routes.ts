import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requirePermission } from "../../auth/middleware.js";
import { ALL_PERMISSIONS } from "../../access/permissions.js";
import { authService } from "../auth/index.js";
import { auditService } from "../audit/index.js";
import { eventsService } from "../../domain/events/events.service.js";
import { streamHub } from "../../domain/stream/stream.routes.js";

const VALID_PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

const RoleUpsertBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(48)
    .regex(/^[A-Za-z0-9_ -]+$/, "Role name contains unsupported characters"),
  permissions: z
    .array(
      z
        .string()
        .refine((p) => VALID_PERMISSION_SET.has(p), "Unknown permission key"),
    )
    .max(ALL_PERMISSIONS.length),
});

const DirectGrantBodySchema = z.object({
  permissions: z
    .array(
      z
        .string()
        .refine((p) => VALID_PERMISSION_SET.has(p), "Unknown permission key"),
    )
    .max(ALL_PERMISSIONS.length)
    .default([]),
});

const UserPatchBodySchema = z.object({
  role: z.string().trim().min(2).max(48).optional(),
  isActive: z.boolean().optional(),
});

export const rbacAdminRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/admin/rbac/roles
  app.get(
    "/admin/rbac/roles",
    {
      config: { auth: ["rbac:manage"] },
      preHandler: [requirePermission("rbac:manage")],
    },
    async (_request, reply) => {
      return reply.status(200).send({
        availablePermissions: ALL_PERMISSIONS,
        roles: authService.getRuntimeRoles(),
      });
    },
  );

  // POST /api/v1/admin/rbac/roles
  app.post(
    "/admin/rbac/roles",
    {
      config: { auth: ["rbac:manage"] },
      preHandler: [requirePermission("rbac:manage")],
    },
    async (request, reply) => {
      const parsed = RoleUpsertBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail:
            parsed.error.issues[0]?.message ||
            "Role name and valid permissions array are required",
          code: "INVALID_ROLE_PAYLOAD",
        });
      }

      const normalizedName = parsed.data.name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
      authService.upsertRuntimeRole(
        normalizedName,
        parsed.data.permissions,
        request.user?.sub || "admin",
      );

      streamHub.broadcast("permissions.changed", {
        role: normalizedName,
        count: parsed.data.permissions.length,
      });

      return reply.status(201).send({
        message: `Role "${normalizedName}" saved successfully`,
        role: normalizedName,
        permissions: parsed.data.permissions,
        eventEmitted: "permissions.changed",
      });
    },
  );

  // POST /api/v1/admin/rbac/users/:sub/grant
  app.post(
    "/admin/rbac/users/:sub/grant",
    {
      config: { auth: ["rbac:manage"] },
      preHandler: [requirePermission("rbac:manage")],
    },
    async (request, reply) => {
      const params = request.params as { sub: string };
      const parsed = DirectGrantBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid direct grant payload",
          code: "INVALID_PERMISSION_GRANT",
        });
      }
      const perms = parsed.data.permissions;

      authService.grantDirectPermissions(
        params.sub,
        perms,
        request.user?.sub || "admin",
      );

      streamHub.broadcast("permissions.changed", {
        userSub: params.sub,
        grantedPermissions: perms,
      });

      return reply.status(200).send({
        message: `Direct permissions granted to user ${params.sub}`,
        userSub: params.sub,
        grantedPermissions: perms,
        eventEmitted: "permissions.changed",
      });
    },
  );

  // GET /api/v1/admin/users
  app.get(
    "/admin/users",
    {
      config: { auth: ["user:manage", "rbac:manage"] },
      preHandler: [requirePermission(["user:manage", "rbac:manage"])],
    },
    async (_request, reply) => {
      return reply.status(200).send({
        users: authService.listUsersForAdmin(),
      });
    },
  );

  // PATCH /api/v1/admin/users/:id
  app.patch(
    "/admin/users/:id",
    {
      config: { auth: ["user:manage", "rbac:manage"] },
      preHandler: [requirePermission(["user:manage", "rbac:manage"])],
    },
    async (request, reply) => {
      const parsed = UserPatchBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid user update payload",
          code: "VALIDATION_ERROR",
        });
      }
      try {
        const params = request.params as { id: string };
        const updated = authService.updateUserRoleOrStatus(
          params.id,
          parsed.data,
          request.user?.sub || "admin",
        );
        return reply.status(200).send(updated);
      } catch (err: any) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: err.message,
          code: "USER_NOT_FOUND",
        });
      }
    },
  );

  // GET /api/v1/admin/audit
  app.get(
    "/admin/audit",
    {
      config: { auth: ["audit:read"] },
      preHandler: [requirePermission("audit:read")],
    },
    async (_request, reply) => {
      return reply.status(200).send({
        auditLogs: auditService.list(),
      });
    },
  );

  // GET /api/v1/admin/ops
  app.get(
    "/admin/ops",
    {
      config: { auth: ["ops:view", "analytics:view:campus"] },
      preHandler: [requirePermission(["ops:view", "analytics:view:campus"])],
    },
    async (_request, reply) => {
      const allEvents = eventsService.listEvents();
      return reply.status(200).send({
        uptimeSeconds: Math.round(process.uptime()),
        totalEvents: allEvents.length,
        publishedEvents: allEvents.filter((e) => e.status === "PUBLISHED")
          .length,
        pendingFacultyCount: allEvents.filter(
          (e) => e.status === "PENDING_FACULTY",
        ).length,
        pendingDeanCount: allEvents.filter((e) => e.status === "PENDING_DEAN")
          .length,
        totalConfirmedSeats: allEvents.reduce(
          (sum, e) => sum + e.confirmedCount,
          0,
        ),
        totalWaitlisted: allEvents.reduce((sum, e) => sum + e.waitlistCount, 0),
        sseSeq: streamHub.getCurrentSeq(),
        campus: "CHRIST (Deemed to be University) — Central Campus, Bengaluru",
        timestamp: new Date().toISOString(),
      });
    },
  );
};
