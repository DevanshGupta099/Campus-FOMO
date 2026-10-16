import { z } from "zod";

export const SseEventBaseSchema = z.object({
  id: z.string(),
  v: z.literal(1),
  timestamp: z.string().datetime(),
});

export const SeatUpdatedEventSchema = SseEventBaseSchema.extend({
  type: z.literal("seat_updated"),
  payload: z.object({
    eventId: z.string().uuid(),
    confirmedCount: z.number().int().nonnegative(),
    capacity: z.number().int().positive(),
    remainingSeats: z.number().int().nonnegative(),
    isFull: z.boolean(),
  }),
});
export type SeatUpdatedEvent = z.infer<typeof SeatUpdatedEventSchema>;

export const EventApprovedEventSchema = SseEventBaseSchema.extend({
  type: z.literal("event_approved"),
  payload: z.object({
    eventId: z.string().uuid(),
    title: z.string(),
    clubName: z.string(),
    startsAt: z.string().datetime(),
    venueName: z.string(),
  }),
});
export type EventApprovedEvent = z.infer<typeof EventApprovedEventSchema>;

export const WaitlistPromotedEventSchema = SseEventBaseSchema.extend({
  type: z.literal("waitlist_promoted"),
  payload: z.object({
    eventId: z.string().uuid(),
    userId: z.string().uuid(),
    eventTitle: z.string(),
    newStatus: z.literal("CONFIRMED"),
  }),
});
export type WaitlistPromotedEvent = z.infer<typeof WaitlistPromotedEventSchema>;

export const EventCancelledEventSchema = SseEventBaseSchema.extend({
  type: z.literal("event_cancelled"),
  payload: z.object({
    eventId: z.string().uuid(),
    reason: z.string(),
  }),
});
export type EventCancelledEvent = z.infer<typeof EventCancelledEventSchema>;

export const PingEventSchema = SseEventBaseSchema.extend({
  type: z.literal("ping"),
  payload: z.object({
    serverTime: z.string().datetime(),
  }),
});
export type PingEvent = z.infer<typeof PingEventSchema>;

export const SseEventSchema = z.discriminatedUnion("type", [
  SeatUpdatedEventSchema,
  EventApprovedEventSchema,
  WaitlistPromotedEventSchema,
  EventCancelledEventSchema,
  PingEventSchema,
]);
export type SseEvent = z.infer<typeof SseEventSchema>;
