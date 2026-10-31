import { z } from "zod";
import { RegistrationStatusSchema } from "../enums.js";

export const RegisterResponseSchema = z.object({
  registrationId: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  status: RegistrationStatusSchema,
  waitlistPosition: z.number().int().positive().nullable(),
  message: z.string(),
  registeredAt: z.string().datetime(),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const CancelRegistrationResponseSchema = z.object({
  message: z.string(),
  eventId: z.string().uuid(),
  cancelledStatus: z.literal("CANCELLED"),
});
export type CancelRegistrationResponse = z.infer<
  typeof CancelRegistrationResponseSchema
>;

export const CheckInRequestSchema = z.object({
  token: z.string().optional(),
  registrationId: z.string().uuid().optional(),
  manualOverrideReason: z.string().optional(),
});
export type CheckInRequest = z.infer<typeof CheckInRequestSchema>;

export const CheckInResponseSchema = z.object({
  success: z.boolean(),
  registrationId: z.string().uuid(),
  studentName: z.string(),
  checkedInAt: z.string().datetime(),
  alreadyCheckedIn: z.boolean().default(false),
  message: z.string(),
});
export type CheckInResponse = z.infer<typeof CheckInResponseSchema>;
