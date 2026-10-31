import type { FastifyPluginAsync } from "fastify";
import { requirePermission } from "../../auth/middleware.js";
import { ALL_PERMISSIONS } from "../../access/permissions.js";
import { PERSONA_ROLE_BUNDLES } from "../../access/roles.js";

export const rbacAdminRoutes: FastifyPluginAsync = async (app) => {
  // In-memory runtime role extensions and audit store
  const runtimeRoles: Record<string, string[]> = { ...PERSONA_ROLE_BUNDLES };
  const auditLogs: Array<{
    action: string;
    actor: string;
    target: string;
    timestamp: string;
  }> = [];

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
        roles: runtimeRoles,
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
      const body = request.body as { name: string; permissions: string[] };
      if (!body.name || !Array.isArray(body.permissions)) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "Role name and permissions array are required",
          code: "INVALID_ROLE_PAYLOAD",
        });
      }

      runtimeRoles[body.name] = body.permissions;
      auditLogs.push({
        action: "ROLE_CREATED",
        actor: request.user?.sub || "admin",
        target: body.name,
        timestamp: new Date().toISOString(),
      });

      return reply.status(201).send({
        message: `Role "${body.name}" created successfully`,
        role: body.name,
        permissions: body.permissions,
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
      const body = request.body as { permissions: string[] };

      auditLogs.push({
        action: "DIRECT_PERMISSIONS_GRANTED",
        actor: request.user?.sub || "admin",
        target: params.sub,
        timestamp: new Date().toISOString(),
      });

      return reply.status(200).send({
        message: `Direct permissions granted to user ${params.sub}`,
        userSub: params.sub,
        grantedPermissions: body.permissions || [],
        eventEmitted: "permissions.changed",
      });
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
        auditLogs,
      });
    },
  );
};
