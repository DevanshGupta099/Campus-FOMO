import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { luckyDrawService } from "./luckydraw.service.js";
import { requirePermission } from "../../auth/middleware.js";

const CampaignCreateBodySchema = z.object({
  eventId: z.string().trim().min(1, "eventId is required").max(64),
  title: z
    .string()
    .trim()
    .min(3, "Campaign title must be at least 3 characters")
    .max(160),
});

const CampaignEnterBodySchema = z.object({
  sessionId: z.string().trim().min(3, "sessionId is required").max(128),
});

export const luckyDrawRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/luckydraw/campaigns (List campaigns)
  app.get(
    "/luckydraw/campaigns",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      const list = luckyDrawService.listCampaigns();
      return reply.status(200).send(list);
    },
  );

  // POST /api/v1/luckydraw/campaigns (Create draw)
  app.post(
    "/luckydraw/campaigns",
    {
      config: { auth: ["luckydraw:run"] },
      preHandler: [requirePermission("luckydraw:run")],
    },
    async (request, reply) => {
      const parsed = CampaignCreateBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "Invalid campaign payload",
          code: "VALIDATION_ERROR",
        });
      }
      const campaign = luckyDrawService.createCampaign(
        parsed.data.eventId,
        parsed.data.title,
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
      const parsed = CampaignEnterBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "sessionId is required",
          code: "VALIDATION_ERROR",
        });
      }
      try {
        const params = request.params as { id: string };
        const user = request.user!;

        const result = await luckyDrawService.enterCampaign({
          campaignId: params.id,
          sessionId: parsed.data.sessionId,
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
