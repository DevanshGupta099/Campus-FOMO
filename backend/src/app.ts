import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config.js";
import { authPlugin } from "./auth/middleware.js";
import { healthRoutes } from "./modules/health/index.js";
import { meRoutes } from "./modules/me/routes.js";
import { rbacAdminRoutes } from "./modules/admin/rbac-routes.js";
import { eventRoutes } from "./domain/events/events.routes.js";
import { registrationRoutes } from "./domain/registration/registration.routes.js";
import { checkinRoutes } from "./domain/checkin/checkin.routes.js";
import { luckyDrawRoutes } from "./domain/luckydraw/luckydraw.routes.js";
import { sponsorRoutes } from "./domain/sponsors/sponsors.routes.js";
import { streamRoutes } from "./domain/stream/stream.routes.js";
import type { ProblemDetails } from "./contracts/errors.js";

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
    origin: [
      config.APP_ORIGIN,
      "http://localhost:5173",
      "http://localhost:9080",
    ],
    credentials: true,
  });

  // Zero-Trust PBAC Authentication and Route Audit Plugin
  await app.register(authPlugin);

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
