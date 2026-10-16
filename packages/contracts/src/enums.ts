import { z } from "zod";

export const RoleSchema = z.enum([
  "STUDENT",
  "ORGANIZER",
  "FACULTY",
  "ADMIN",
  "GUEST",
]);
export type Role = z.infer<typeof RoleSchema>;

export const EventStatusSchema = z.enum([
  "DRAFT",
  "PENDING_FACULTY",
  "PENDING_ADMIN",
  "PUBLISHED",
  "CANCELLED",
  "REJECTED",
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const RegistrationStatusSchema = z.enum([
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLED",
]);
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;

export const CategorySchema = z.enum([
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "WORKSHOP",
  "GUEST_LECTURE",
  "COMPETITION",
  "PLACEMENT",
  "SOCIAL_CLUB",
]);
export type Category = z.infer<typeof CategorySchema>;

export const ApprovalActionSchema = z.enum(["APPROVE", "REJECT"]);
export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;
