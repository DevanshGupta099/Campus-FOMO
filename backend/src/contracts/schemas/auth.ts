import { z } from "zod";
import { RoleSchema } from "../enums.js";

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  name: z.string().min(2).max(100),
  role: RoleSchema,
  studentRegisterNumber: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  year: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: z.string().datetime(),
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  phone: z
    .string()
    .regex(
      /^\+91[6-9]\d{9}$/,
      "Must be a valid Indian phone number (+91XXXXXXXXXX)",
    )
    .optional(),
  password: z.string().min(10, "Password must be at least 10 characters"),
  name: z.string().min(2).max(100),
  studentRegisterNumber: z
    .string()
    .regex(/^\d{7}$/, "Student Register Number must be 7 digits")
    .optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(5).optional(),
});
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

export const OtpRequestSchema = z.object({
  destination: z.string().min(3),
  channel: z.enum(["sms", "email"]),
});
export type OtpRequest = z.infer<typeof OtpRequestSchema>;

export const OtpResponseSchema = z.object({
  message: z.string(),
  expiresInSeconds: z.number().int().positive(),
  cooldownSeconds: z.number().int().positive(),
});
export type OtpResponse = z.infer<typeof OtpResponseSchema>;

export const OtpVerifyRequestSchema = z.object({
  destination: z.string().min(3),
  code: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
export type OtpVerifyRequest = z.infer<typeof OtpVerifyRequestSchema>;

export const LoginRequestSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().optional(),
  otpCode: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().int().positive(),
  user: UserPublicSchema,
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

export const PhoneChangeRequestSchema = z.object({
  newPhone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Must be a valid Indian phone number"),
});
export type PhoneChangeRequest = z.infer<typeof PhoneChangeRequestSchema>;

export const PhoneChangeVerifySchema = z.object({
  newPhone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Must be a valid Indian phone number"),
  code: z.string().regex(/^\d{6}$/),
});
export type PhoneChangeVerify = z.infer<typeof PhoneChangeVerifySchema>;

export const MessageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
