import { z } from "zod";
import {
  CategorySchema,
  EventStatusSchema,
  RegistrationStatusSchema,
} from "../enums.js";

export const AccessibilityNotesSchema = z.object({
  wheelchairAccessible: z.boolean().default(false),
  elevatorAvailable: z.boolean().default(false),
  assistiveListening: z.boolean().default(false),
  signLanguageInterpreter: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});
export type AccessibilityNotes = z.infer<typeof AccessibilityNotesSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  clubName: z.string(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(5000),
  category: CategorySchema,
  tags: z.array(z.string()).max(10),
  venueId: z.string().uuid(),
  venueName: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().positive(),
  confirmedCount: z.number().int().nonnegative(),
  price: z.number().int().nonnegative().default(0),
  posterUrl: z.string().optional(),
  status: EventStatusSchema,
  version: z.number().int().positive(),
  accessibility: AccessibilityNotesSchema,
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Event = z.infer<typeof EventSchema>;

export const EventsQuerySchema = z.object({
  category: CategorySchema.optional(),
  startsAfter: z.string().datetime().optional(),
  startsBefore: z.string().datetime().optional(),
  venueId: z.string().uuid().optional(),
  freeOnly: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  hasSeats: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  q: z.string().max(100).optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50))
    .optional(),
});
export type EventsQuery = z.infer<typeof EventsQuerySchema>;

export const EventsListResponseSchema = z.object({
  items: z.array(EventSchema),
  nextCursor: z.string().nullable(),
  totalCount: z.number().int().nonnegative().optional(),
});
export type EventsListResponse = z.infer<typeof EventsListResponseSchema>;

export const CreateEventRequestSchema = z.object({
  clubId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(5000),
  category: CategorySchema,
  tags: z.array(z.string()).max(10).default([]),
  venueId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().positive().max(5000),
  price: z.number().int().nonnegative().default(0),
  posterUrl: z.string().optional(),
  accessibility: AccessibilityNotesSchema.optional(),
});
export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;

export const UpdateEventRequestSchema =
  CreateEventRequestSchema.partial().extend({
    version: z.number().int().positive(),
  });
export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;

export const CancelEventRequestSchema = z.object({
  reason: z.string().min(10).max(500),
});
export type CancelEventRequest = z.infer<typeof CancelEventRequestSchema>;

export const EventAttendeeSchema = z.object({
  registrationId: z.string().uuid(),
  userId: z.string().uuid(),
  studentName: z.string(),
  department: z.string().nullable().optional(),
  maskedRegisterNumber: z.string().nullable().optional(),
  status: RegistrationStatusSchema,
  waitlistPosition: z.number().int().positive().nullable(),
  registeredAt: z.string().datetime(),
  checkedInAt: z.string().datetime().nullable(),
});
export type EventAttendee = z.infer<typeof EventAttendeeSchema>;

export const EventAttendeesResponseSchema = z.object({
  eventId: z.string().uuid(),
  confirmedCount: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  attendees: z.array(EventAttendeeSchema),
});
export type EventAttendeesResponse = z.infer<
  typeof EventAttendeesResponseSchema
>;

export const EventQrResponseSchema = z.object({
  eventId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.string().datetime(),
  refreshIntervalSeconds: z.number().int().default(30),
});
export type EventQrResponse = z.infer<typeof EventQrResponseSchema>;
