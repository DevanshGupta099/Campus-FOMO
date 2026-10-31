import type { FastifyPluginAsync } from "fastify";
import { healthService } from "./service.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/healthz",
    { config: { auth: "public" } },
    async (_request, reply) => {
      const health = healthService.getHealth();
      return reply.status(200).send(health);
    },
  );

  app.get(
    "/readyz",
    { config: { auth: "public" } },
    async (_request, reply) => {
      const ready = healthService.getReadiness();
      return reply.status(200).send(ready);
    },
  );
};
