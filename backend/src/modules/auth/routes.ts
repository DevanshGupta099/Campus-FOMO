import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authService } from "./service.js";
import { config } from "../../config.js";

const SignUpBodySchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(
      /^\+91[6-9]\d{9}$/,
      "Phone must follow E.164 Indian format (+91XXXXXXXXXX)",
    )
    .optional(),
  studentRegisterNumber: z
    .string()
    .regex(/^\d{7}$/, "CHRIST Register Number must be 7 digits")
    .optional(),
  department: z.string().max(80).optional(),
  institution: z.string().max(120).optional(),
  year: z.number().int().min(1).max(5).optional(),
  accountType: z.enum(["student", "guest"]).optional(),
});

const LoginBodySchema = z.object({
  identifier: z.string().min(3, "Enter your email or 7-digit register number"),
  password: z.string().optional(),
  otpCode: z
    .string()
    .regex(/^\d{6}$/, "OTP must be 6 digits")
    .optional(),
});

const OtpRequestBodySchema = z.object({
  destination: z.string().min(3),
  channel: z.enum(["sms", "email"]).default("email"),
});

const OtpVerifyBodySchema = z.object({
  destination: z.string().min(3),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

const RefreshBodySchema = z.object({
  refreshToken: z.string().trim().min(10, "refreshToken is required").max(4096),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/auth/personas (Non-production evaluator directory — zero secrets)
  app.get(
    "/auth/personas",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      if (config.NODE_ENV === "production") {
        return reply.status(200).send([]);
      }
      return reply.status(200).send(authService.getDemoPersonaDirectory());
    },
  );

  // POST /api/v1/auth/signup
  app.post(
    "/auth/signup",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const parsed = SignUpBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "Invalid signup payload",
          code: "VALIDATION_ERROR",
        });
      }

      try {
        const session = await authService.signUp(parsed.data);
        return reply.status(201).send(session);
      } catch (err: any) {
        const status = err.statusCode || 400;
        return reply.status(status).send({
          type: "about:blank",
          title: status === 409 ? "Conflict" : "Signup Failed",
          status,
          detail: err.message,
          code: err.code || "SIGNUP_FAILED",
        });
      }
    },
  );

  // POST /api/v1/auth/login
  app.post(
    "/auth/login",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const parsed = LoginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "Invalid login request",
          code: "VALIDATION_ERROR",
        });
      }

      try {
        const session = await authService.login(parsed.data);
        return reply.status(200).send(session);
      } catch (err: any) {
        const status = err.statusCode || 401;
        return reply.status(status).send({
          type: "about:blank",
          title: "Authentication Failed",
          status,
          detail: err.message,
          code: err.code || "INVALID_CREDENTIALS",
        });
      }
    },
  );

  // POST /api/v1/auth/otp/request
  app.post(
    "/auth/otp/request",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const parsed = OtpRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "Invalid OTP request",
          code: "VALIDATION_ERROR",
        });
      }

      try {
        const res = authService.requestOtp(
          parsed.data.destination,
          parsed.data.channel,
        );
        return reply.status(200).send(res);
      } catch (err: any) {
        const status = err.statusCode || 400;
        return reply.status(status).send({
          type: "about:blank",
          title: "OTP Request Rejected",
          status,
          detail: err.message,
          code: err.code || "OTP_REQUEST_FAILED",
        });
      }
    },
  );

  // POST /api/v1/auth/otp/verify
  app.post(
    "/auth/otp/verify",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const parsed = OtpVerifyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues[0]?.message || "Invalid OTP code",
          code: "VALIDATION_ERROR",
        });
      }

      try {
        const session = await authService.verifyOtpLogin(
          parsed.data.destination,
          parsed.data.code,
        );
        return reply.status(200).send(session);
      } catch (err: any) {
        const status = err.statusCode || 401;
        return reply.status(status).send({
          type: "about:blank",
          title: "OTP Verification Failed",
          status,
          detail: err.message,
          code: err.code || "INVALID_OTP",
        });
      }
    },
  );

  // POST /api/v1/auth/refresh
  app.post(
    "/auth/refresh",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const parsed = RefreshBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: parsed.error.issues[0]?.message || "refreshToken is required",
          code: "MISSING_REFRESH_TOKEN",
        });
      }

      try {
        const session = await authService.refreshSession(
          parsed.data.refreshToken,
        );
        return reply.status(200).send(session);
      } catch (err: any) {
        return reply.status(401).send({
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: err.message,
          code: err.code || "REFRESH_TOKEN_INVALID",
        });
      }
    },
  );

  // POST /api/v1/auth/logout
  app.post(
    "/auth/logout",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      if (request.user?.jti) {
        authService.revokeJti(request.user.jti);
      }
      return reply.status(200).send({
        message: "Session terminated and token revoked",
      });
    },
  );

  // POST /api/v1/auth/logout-all
  app.post(
    "/auth/logout-all",
    {
      config: { auth: ["event:read:public"] },
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "Authentication required",
          code: "UNAUTHENTICATED",
        });
      }
      authService.revokeAllForUser(request.user.sub);
      return reply.status(200).send({
        message: "All active sessions revoked",
      });
    },
  );
};
