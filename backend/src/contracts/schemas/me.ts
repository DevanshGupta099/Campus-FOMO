import { z } from "zod";
import { UserPublicSchema } from "./auth.js";
import { RegistrationStatusSchema } from "../enums.js";

export const ProfileUpdateRequestSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(5).optional(),
  interests: z.array(z.string()).max(10).optional(),
});
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;

export const MyRegistrationItemSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  eventTitle: z.string(),
  eventStartsAt: z.string().datetime(),
  eventEndsAt: z.string().datetime(),
  venueName: z.string(),
  status: RegistrationStatusSchema,
  waitlistPosition: z.number().int().positive().nullable(),
  registeredAt: z.string().datetime(),
  checkedInAt: z.string().datetime().nullable(),
});
export type MyRegistrationItem = z.infer<typeof MyRegistrationItemSchema>;

export const MyBookmarkItemSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  eventTitle: z.string(),
  eventStartsAt: z.string().datetime(),
  venueName: z.string(),
  bookmarkedAt: z.string().datetime(),
});
export type MyBookmarkItem = z.infer<typeof MyBookmarkItemSchema>;

export const XpLedgerItemSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid().nullable(),
  kind: z.enum(["REGISTER", "ATTEND", "STREAK", "EARLY_BIRD", "BONUS"]),
  amount: z.number().int(),
  reason: z.string(),
  awardedAt: z.string().datetime(),
});
export type XpLedgerItem = z.infer<typeof XpLedgerItemSchema>;

export const MyXpSummarySchema = z.object({
  totalXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  nextLevelXp: z.number().int().positive(),
  currentStreakDays: z.number().int().nonnegative(),
  badges: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      unlockedAt: z.string().datetime(),
    }),
  ),
  history: z.array(XpLedgerItemSchema),
});
export type MyXpSummary = z.infer<typeof MyXpSummarySchema>;
