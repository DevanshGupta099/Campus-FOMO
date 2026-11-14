import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { authPlugin } from "./auth/middleware.js";
import { healthRoutes } from "./modules/health/index.js";
import { authRoutes } from "./modules/auth/index.js";
import { meRoutes } from "./modules/me/index.js";
import { rbacAdminRoutes } from "./modules/admin/index.js";
import { eventRoutes } from "./domain/events/events.routes.js";
import { registrationRoutes } from "./domain/registration/registration.routes.js";
import { checkinRoutes } from "./domain/checkin/checkin.routes.js";
import { luckyDrawRoutes } from "./domain/luckydraw/luckydraw.routes.js";
import { sponsorRoutes } from "./domain/sponsors/sponsors.routes.js";
import { streamRoutes } from "./domain/stream/stream.routes.js";
import type { ProblemDetails } from "./contracts/errors.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: 1_048_576,
    logger: {
      level: config.NODE_ENV === "test" ? "silent" : "info",
      redact: ["req.headers.authorization", "req.headers.cookie"],
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === "production",
  });

  await app.register(cors, {
    origin: [
      config.APP_ORIGIN,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://localhost:9080",
    ],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: config.NODE_ENV === "test" ? 10_000 : 240,
    timeWindow: "1 minute",
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      type: "about:blank",
      title: "Too Many Requests",
      status: 429,
      detail: `Rate limit exceeded, retry after ${context.after}`,
      code: "TOO_MANY_REQUESTS",
    }),
  });

  // Zero-Trust PBAC Authentication and Route Audit Plugin
  await app.register(authPlugin);

  // Custom RFC 7807 Problem Details Error Handler
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode || 500;
    const isServerError = statusCode >= 500;
    const problem: ProblemDetails = {
      type: "about:blank",
      title: error.name || "Internal Server Error",
      status: statusCode,
      detail:
        isServerError && config.NODE_ENV === "production"
          ? "An unexpected internal error occurred"
          : error.message || "An unexpected error occurred",
      code: error.code || "INTERNAL_SERVER_ERROR",
    };

    reply.header("Content-Type", "application/problem+json");
    return reply.status(statusCode).send(problem);
  });

  // Root-level liveness & readiness probes (/healthz, /readyz) for orchestrators & nightly smoke
  await app.register(healthRoutes);

  // Register Modules under /api/v1 prefix
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
      await v1.register(authRoutes);
      await v1.register(meRoutes);
      await v1.register(rbacAdminRoutes);
      await v1.register(eventRoutes);
      await v1.register(registrationRoutes);
      await v1.register(checkinRoutes);
      await v1.register(luckyDrawRoutes);
      await v1.register(sponsorRoutes);
      await v1.register(streamRoutes);
    },
    { prefix: "/api/v1" },
  );

  return app;
}
