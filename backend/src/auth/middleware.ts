import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { verifyToken, type DecodedUser } from "./jwt.js";
import { checkPermission, type ScopeContext } from "../access/permissions.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: DecodedUser;
  }
  interface FastifyContextConfig {
    auth?: "public" | string[];
  }
}

export type ScopeResolver = (
  req: FastifyRequest,
) => Promise<ScopeContext> | ScopeContext;

export function requirePermission(
  permission: string,
  resolver?: ScopeResolver,
) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        type: "about:blank",
        title: "Unauthorized",
        status: 401,
        detail: "Bearer token required for this endpoint",
        code: "AUTH_TOKEN_REQUIRED",
      });
    }

    try {
      const token = authHeader.substring(7).trim();
      const user = await verifyToken(token);
      req.user = user;

      let scopeCtx: ScopeContext | undefined;
      if (resolver) {
        scopeCtx = await resolver(req);
      }

      const hasAccess = checkPermission(user.permissions, permission, scopeCtx);
      if (!hasAccess) {
        return reply.status(403).send({
          type: "about:blank",
          title: "Forbidden",
          status: 403,
          detail: `Permission denied: missing required permission "${permission}"`,
          code: "FORBIDDEN_INSUFFICIENT_PERMISSION",
        });
      }
    } catch (err: any) {
      return reply.status(401).send({
        type: "about:blank",
        title: "Unauthorized",
        status: 401,
        detail: err.message || "Invalid or expired token",
        code: "AUTH_TOKEN_INVALID",
      });
    }
  };
}

const authPluginCallback: FastifyPluginAsync = async (app) => {
  // Enforce Zero Trust: Fail boot if any route lacks explicit auth declaration
  app.addHook("onRoute", (routeOptions) => {
    // Exclude internal fastify docs or static routes if any
    if (
      routeOptions.url.startsWith("/docs") ||
      routeOptions.url === "/favicon.ico"
    ) {
      return;
    }

    if (!routeOptions.config || routeOptions.config.auth === undefined) {
      throw new Error(
        `[ZeroTrust Auth Enforcement] Route ${routeOptions.method} ${routeOptions.url} lacks explicit config.auth declaration! Boot halted.`,
      );
    }
  });

  // Global authentication preHandler: automatically parses token if present
  app.addHook("preHandler", async (req, _reply) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7).trim();
        req.user = await verifyToken(token);
      } catch {
        // Silently let route-level guard handle or leave as unauthenticated if public
      }
    }
  });
};

export const authPlugin = fp(authPluginCallback);
