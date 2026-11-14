import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getAuthorizedScreens } from "../../access/screens.js";
import { eventsService } from "../../domain/events/events.service.js";
import { authService, maskPhoneSafe } from "../auth/index.js";

const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(2).max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
  institution: z.string().trim().min(2).max(140).optional(),
});

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

      const stored = authService.getUserBySub(user.sub);
      const gamification = eventsService.getUserGamification(user.sub);

      return reply.status(200).send({
        id: user.id,
        sub: user.sub,
        email: user.email,
        name: stored?.name || user.name,
        phone: maskPhoneSafe(stored?.phone),
        role: user.role,
        studentRegisterNumber: stored?.studentRegisterNumber || null,
        department: stored?.department || user.department || null,
        institution:
          stored?.institution ||
          user.institution ||
          "CHRIST (Deemed to be University) — Central Campus",
        year: stored?.year ?? null,
        xp: gamification.totalXp,
        permissions: user.permissions,
        createdAt: stored?.createdAt || new Date().toISOString(),
      });
    },
  );

  // PATCH /api/v1/me
  app.patch(
    "/me",
    {
      config: {
        auth: ["event:read:public"],
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

      const parsed = UpdateProfileSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail:
            parsed.error.issues[0]?.message || "Invalid profile update payload",
          code: "VALIDATION_ERROR",
        });
      }
      const body = parsed.data;

      const updated = authService.updateOwnProfile(user.sub, body);
      const gamification = eventsService.getUserGamification(user.sub);

      return reply.status(200).send({
        id: user.id,
        sub: user.sub,
        email: user.email,
        name: updated?.name || body.name || user.name,
        phone: updated?.phone || null,
        role: user.role,
        studentRegisterNumber: updated?.studentRegisterNumber || null,
        department: updated?.department || body.department || user.department,
        institution:
          updated?.institution || body.institution || user.institution,
        year: updated?.year ?? null,
        xp: gamification.totalXp,
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

  // GET /api/v1/me/gamification (Story Card ST-02: Student XP & Badges)
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

  // GET /api/v1/me/xp (Contract alias matching OpenAPI /me/xp)
  app.get(
    "/me/xp",
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

  // GET /api/v1/me/bookmarks
  app.get(
    "/me/bookmarks",
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
      return reply.status(200).send(eventsService.getBookmarks(user.sub));
    },
  );

  // POST /api/v1/me/bookmarks/:eventId
  app.post(
    "/me/bookmarks/:eventId",
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
      try {
        const params = request.params as { eventId: string };
        return reply
          .status(200)
          .send(eventsService.toggleBookmark(user.sub, params.eventId));
      } catch (err: unknown) {
        return reply.status(404).send({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: err instanceof Error ? err.message : "Event not found",
          code: "EVENT_NOT_FOUND",
        });
      }
    },
  );
};
