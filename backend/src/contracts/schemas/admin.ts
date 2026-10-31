import { z } from "zod";
import { RoleSchema } from "../enums.js";
import { UserPublicSchema } from "./auth.js";

export const AdminUsersQuerySchema = z.object({
  q: z.string().optional(),
  role: RoleSchema.optional(),
  limit: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional(),
  cursor: z.string().optional(),
});
export type AdminUsersQuery = z.infer<typeof AdminUsersQuerySchema>;

export const AdminUsersListResponseSchema = z.object({
  users: z.array(
    UserPublicSchema.extend({
      isActive: z.boolean(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
export type AdminUsersListResponse = z.infer<
  typeof AdminUsersListResponseSchema
>;

export const AdminUserUpdateRequestSchema = z.object({
  role: RoleSchema.optional(),
  isActive: z.boolean().optional(),
});
export type AdminUserUpdateRequest = z.infer<
  typeof AdminUserUpdateRequestSchema
>;

export const AuditLogItemSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  actorName: z.string(),
  action: z.string(),
  targetId: z.string().nullable(),
  targetType: z.string(),
  details: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type AuditLogItem = z.infer<typeof AuditLogItemSchema>;

export const AuditLogsResponseSchema = z.object({
  items: z.array(AuditLogItemSchema),
  nextCursor: z.string().nullable(),
});
export type AuditLogsResponse = z.infer<typeof AuditLogsResponseSchema>;

export const OpsMetricsResponseSchema = z.object({
  p95LatencyMs: z.number().nonnegative(),
  queueDepth: z.number().int().nonnegative(),
  activeSseConnections: z.number().int().nonnegative(),
  smsProvider: z.object({
    currentProvider: z.string(),
    isHealthy: z.boolean(),
    p95DeliveryLatencyMs: z.number().nonnegative(),
    failureRatePercent: z.number().nonnegative(),
  }),
  dbPool: z.object({
    totalConnections: z.number().int().nonnegative(),
    idleConnections: z.number().int().nonnegative(),
    activeConnections: z.number().int().nonnegative(),
  }),
});
export type OpsMetricsResponse = z.infer<typeof OpsMetricsResponseSchema>;
