import type { FastifyPluginAsync } from "fastify";
import { luckyDrawService } from "./luckydraw.service.js";
import { requirePermission } from "../../auth/middleware.js";

export const luckyDrawRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/luckydraw/campaigns (Create draw)
  app.post(
    "/luckydraw/campaigns",
    {
      config: { auth: ["luckydraw:run"] },
      preHandler: [requirePermission("luckydraw:run")],
    },
    async (request, reply) => {
      const body = request.body as { eventId: string; title: string };
      const campaign = luckyDrawService.createCampaign(
        body.eventId,
        body.title,
      );
      return reply.status(201).send(campaign);
    },
  );

  // POST /api/v1/luckydraw/campaigns/:id/session (Start entry session)
  app.post(
    "/luckydraw/campaigns/:id/session",
    {
      config: { auth: ["luckydraw:enter"] },
      preHandler: [requirePermission("luckydraw:enter")],
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const session = luckyDrawService.createSession(
        params.id,
        request.user!.sub,
      );
      return reply.status(200).send(session);
    },
  );

  // POST /api/v1/luckydraw/campaigns/:id/enter (Submit entry)
  app.post(
    "/luckydraw/campaigns/:id/enter",
    {
      config: { auth: ["luckydraw:enter"] },
      preHandler: [requirePermission("luckydraw:enter")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const body = request.body as { sessionId: string };
        const user = request.user!;

        const result = await luckyDrawService.enterCampaign({
          campaignId: params.id,
          sessionId: body.sessionId,
          userSub: user.sub,
          userName: user.name,
          department: user.department || "General",
        });
        return reply.status(201).send(result);
      } catch (err: any) {
        return reply.status(409).send({
          type: "about:blank",
          title: "Entry Rejected",
          status: 409,
          detail: err.message,
          code: "LUCKY_DRAW_ENTRY_ERROR",
        });
      }
    },
  );

  // POST /api/v1/luckydraw/campaigns/:id/draw (Trigger commit-reveal draw)
  app.post(
    "/luckydraw/campaigns/:id/draw",
    {
      config: { auth: ["luckydraw:run"] },
      preHandler: [requirePermission("luckydraw:run")],
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const drawn = luckyDrawService.executeDraw(params.id);
        return reply.status(200).send(drawn);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Draw Failed",
          status: 400,
          detail: err.message,
          code: "DRAW_EXECUTION_ERROR",
        });
      }
    },
  );

  // GET /api/v1/luckydraw/campaigns/:id/verify (Public cryptographic proof)
  app.get(
    "/luckydraw/campaigns/:id/verify",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      try {
        const params = request.params as { id: string };
        const verification = luckyDrawService.verifyDraw(params.id);
        return reply.status(200).send(verification);
      } catch (err: any) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Verification Failed",
          status: 400,
          detail: err.message,
          code: "VERIFICATION_ERROR",
        });
      }
    },
  );
};
