import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  timestamp: z.string().datetime(),
  checks: z.object({
    database: z.enum(["up", "down"]),
    redis: z.enum(["up", "down"]),
  }),
});
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;
