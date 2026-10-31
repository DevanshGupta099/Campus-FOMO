import { z } from "zod";

export const ProblemDetailsSchema = z.object({
  type: z.string().url().default("about:blank"),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string(),
  instance: z.string().optional(),
  code: z.string(),
  invalidParams: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      }),
    )
    .optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

export const ErrorCodes = {
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  FORBIDDEN: "AUTH_FORBIDDEN",
  NOT_FOUND: "RESOURCE_NOT_FOUND",
  CONFLICT: "RESOURCE_CONFLICT",
  VALIDATION_ERROR: "VALIDATION_FAILED",
  RATE_LIMITED: "RATE_LIMIT_EXCEEDED",
  SEAT_UNAVAILABLE: "SEAT_UNAVAILABLE",
  EVENT_NOT_ACTIVE: "EVENT_NOT_ACTIVE",
  REFRESH_RACE: "REFRESH_RACE",
  INTERNAL_ERROR: "INTERNAL_SERVER_ERROR",
} as const;
