import type { FastifyPluginAsync } from "fastify";
import { getAuthorizedScreens } from "../../access/screens.js";
import { eventsService } from "../../domain/events/events.service.js";

export const meRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/me
  app.get(
    "/me",
    {
      config: {
        auth: ["user:manage", "registration:read:own", "event:read:public"],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "Authentication required",
          code: "UNAUTHENTICATED",
        });
      }

      return reply.status(200).send({
        id: user.id,
        sub: user.sub,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        institution: user.institution,
        xp: 150,
        permissions: user.permissions,
      });
    },
  );

  // GET /api/v1/me/permissions
  app.get(
    "/me/permissions",
    {
      config: { auth: ["event:read:public"] },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "Authentication required",
          code: "UNAUTHENTICATED",
        });
      }

      return reply.status(200).send({
        sub: user.sub,
        role: user.role,
        permissions: user.permissions,
      });
    },
  );

  // GET /api/v1/me/navigation
  app.get(
    "/me/navigation",
    {
      config: { auth: ["event:read:public"] },
    },
    async (request, reply) => {
      const user = request.user;
      const permissions = user?.permissions || ["event:read:public"];
      const screens = getAuthorizedScreens(permissions);
      return reply.status(200).send(screens);
    },
  );

  // GET /api/v1/me/gamification (Story Card ST-06: Student XP & Badges)
  app.get(
    "/me/gamification",
    {
      config: { auth: ["event:read:public"] },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.status(401).send({
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "Authentication required",
          code: "UNAUTHENTICATED",
        });
      }
      const gamification = eventsService.getUserGamification(user.sub);
      return reply.status(200).send({
        userSub: user.sub,
        totalXp: gamification.totalXp,
        badges: gamification.badges,
        history: gamification.history,
      });
    },
  );
};
