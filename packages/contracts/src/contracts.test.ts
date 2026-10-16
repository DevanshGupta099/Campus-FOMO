import { describe, it, expect } from "vitest";
import {
  HealthResponseSchema,
  ReadyResponseSchema,
  UserPublicSchema,
  SignUpRequestSchema,
  OtpRequestSchema,
  OtpResponseSchema,
  OtpVerifyRequestSchema,
  LoginRequestSchema,
  AuthTokenResponseSchema,
  EventSchema,
  EventsListResponseSchema,
  CreateEventRequestSchema,
  UpdateEventRequestSchema,
  RegisterResponseSchema,
  CancelRegistrationResponseSchema,
  CheckInResponseSchema,
  ApprovalsListResponseSchema,
  AdminUsersListResponseSchema,
  OpsMetricsResponseSchema,
  FeedResponseSchema,
  SearchSuggestResponseSchema,
  SeatUpdatedEventSchema,
  WaitlistPromotedEventSchema,
  EventApprovedEventSchema,
  EventCancelledEventSchema,
  PingEventSchema,
} from "./schemas/index.js";
import { ProblemDetailsSchema } from "./errors.js";
import {
  mockEvents,
  mockFeed,
  mockHealth,
  mockUsers,
  mockXpSummary,
} from "./mocks/mock-data.js";
import { getOpenApiSpec } from "./openapi.js";

describe("Contracts Schema Validation", () => {
  it("parses valid HealthResponse example", () => {
    const parsed = HealthResponseSchema.parse(mockHealth);
    expect(parsed.status).toBe("ok");
  });

  it("parses valid ReadyResponse example", () => {
    const example = {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: { database: "up", redis: "up" },
    };
    const parsed = ReadyResponseSchema.parse(example);
    expect(parsed.status).toBe("ready");
  });

  it("parses valid UserPublic examples across roles", () => {
    for (const user of Object.values(mockUsers)) {
      const parsed = UserPublicSchema.parse(user);
      expect(parsed.id).toBe(user.id);
    }
  });

  it("parses valid SignUpRequest with Indian phone and Christ UID", () => {
    const example = {
      email: "new.student@christuniversity.in",
      phone: "+919876543210",
      password: "StrongPassword123!",
      name: "New Student",
      studentRegisterNumber: "2440123",
      department: "Computer Science",
      year: 1,
    };
    const parsed = SignUpRequestSchema.parse(example);
    expect(parsed.name).toBe("New Student");
  });

  it("parses valid OTP Request and Response examples", () => {
    const req = OtpRequestSchema.parse({
      destination: "+919876543210",
      channel: "sms",
    });
    const res = OtpResponseSchema.parse({
      message: "OTP sent successfully",
      expiresInSeconds: 300,
      cooldownSeconds: 30,
    });
    expect(req.channel).toBe("sms");
    expect(res.expiresInSeconds).toBe(300);
  });

  it("parses valid Event schema examples", () => {
    for (const event of mockEvents) {
      const parsed = EventSchema.parse(event);
      expect(parsed.id).toBe(event.id);
      expect(parsed.capacity).toBeGreaterThan(0);
    }
  });

  it("parses valid FeedResponse layout spec", () => {
    const parsed = FeedResponseSchema.parse(mockFeed);
    expect(parsed.sections.length).toBeGreaterThan(0);
  });

  it("parses valid versioned SSE events (v: 1)", () => {
    const seatEvent = SeatUpdatedEventSchema.parse({
      id: "evt-1",
      v: 1,
      timestamp: new Date().toISOString(),
      type: "seat_updated",
      payload: {
        eventId: mockEvents[0].id,
        confirmedCount: 100,
        capacity: 100,
        remainingSeats: 0,
        isFull: true,
      },
    });
    expect(seatEvent.v).toBe(1);

    const promotedEvent = WaitlistPromotedEventSchema.parse({
      id: "evt-2",
      v: 1,
      timestamp: new Date().toISOString(),
      type: "waitlist_promoted",
      payload: {
        eventId: mockEvents[0].id,
        userId: mockUsers.student.id,
        eventTitle: "Demo Hack Night 2026",
        newStatus: "CONFIRMED",
      },
    });
    expect(promotedEvent.payload.newStatus).toBe("CONFIRMED");
  });

  it("parses RFC 7807 problem details", () => {
    const problem = ProblemDetailsSchema.parse({
      type: "about:blank",
      title: "Conflict",
      status: 409,
      detail: "Seat already taken",
      code: "SEAT_UNAVAILABLE",
    });
    expect(problem.code).toBe("SEAT_UNAVAILABLE");
  });
});

describe("Architecture Endpoint Contract Coverage", () => {
  it("verifies every endpoint in ARCHITECTURE §4 has an OpenAPI definition", () => {
    const spec = getOpenApiSpec();
    const requiredEndpoints = [
      "/healthz",
      "/readyz",
      "/auth/signup",
      "/auth/otp/request",
      "/auth/otp/verify",
      "/auth/login",
      "/auth/refresh",
      "/auth/logout",
      "/auth/logout-all",
      "/auth/phone/change/request",
      "/auth/phone/change/verify",
      "/me",
      "/me/registrations",
      "/me/bookmarks",
      "/me/xp",
      "/events",
      "/events/{id}",
      "/events/{id}/submit",
      "/events/{id}/cancel",
      "/events/{id}/attendees",
      "/events/{id}/qr",
      "/events/{id}/register",
      "/events/{id}/checkin",
      "/approvals",
      "/approvals/{id}/approve",
      "/approvals/{id}/reject",
      "/admin/users",
      "/admin/users/{id}",
      "/admin/audit",
      "/admin/ops",
      "/feed",
      "/search/suggest",
      "/stream",
    ];

    for (const endpoint of requiredEndpoints) {
      expect(spec.paths).toHaveProperty(endpoint);
    }
  });
});
