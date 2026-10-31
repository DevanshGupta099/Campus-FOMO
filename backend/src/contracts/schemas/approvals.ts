import { z } from "zod";
import { EventSchema } from "./events.js";

export const PendingApprovalItemSchema = z.object({
  event: EventSchema,
  hasVenueClash: z.boolean(),
  clashingEvents: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      clubName: z.string(),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }),
  ),
  currentStage: z.enum(["FACULTY", "ADMIN"]),
});
export type PendingApprovalItem = z.infer<typeof PendingApprovalItemSchema>;

export const ApprovalsListResponseSchema = z.object({
  items: z.array(PendingApprovalItemSchema),
  totalCount: z.number().int().nonnegative(),
});
export type ApprovalsListResponse = z.infer<typeof ApprovalsListResponseSchema>;

export const ApproveEventRequestSchema = z.object({
  remarks: z.string().max(500).optional(),
});
export type ApproveEventRequest = z.infer<typeof ApproveEventRequestSchema>;

export const RejectEventRequestSchema = z.object({
  reason: z
    .string()
    .min(15, "Rejection reason must be at least 15 characters")
    .max(500),
});
export type RejectEventRequest = z.infer<typeof RejectEventRequestSchema>;
