import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config.js";
import { healthRoutes } from "./modules/health/index.js";
import type { ProblemDetails } from "@campus-fomo/contracts";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "test" ? "silent" : "info",
      redact: ["req.headers.authorization", "req.headers.cookie"],
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === "production",
  });

  await app.register(cors, {
    origin: [config.APP_ORIGIN],
    credentials: true,
  });

  // Custom RFC 7807 Problem Details Error Handler
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode || 500;
    const problem: ProblemDetails = {
      type: "about:blank",
      title: error.name || "Internal Server Error",
      status: statusCode,
      detail: error.message || "An unexpected error occurred",
      code: error.code || "INTERNAL_SERVER_ERROR",
    };

    reply.header("Content-Type", "application/problem+json");
    return reply.status(statusCode).send(problem);
  });

  // Register Modules under /api/v1 prefix
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
    },
    { prefix: "/api/v1" },
  );

  return app;
}
