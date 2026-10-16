import { stringify } from "yaml";

export function getOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Campus FOMO API",
      version: "1.0.0",
      description:
        "Discovery and registration platform for CHRIST University campus events.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "V1 Base API Path",
      },
    ],
    paths: {
      "/healthz": {
        get: {
          summary: "Health probe",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                },
              },
            },
          },
        },
      },
      "/readyz": {
        get: {
          summary: "Readiness probe",
          responses: {
            "200": {
              description: "Service dependencies are ready",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReadyResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/signup": {
        post: {
          summary: "Register a new student/user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignUpRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/otp/request": {
        post: {
          summary: "Request OTP via SMS or Email",
          responses: {
            "200": {
              description: "OTP dispatched",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OtpResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/otp/verify": {
        post: {
          summary: "Verify OTP code",
          responses: {
            "200": {
              description: "OTP verified successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Login with password or OTP",
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          summary: "Rotate refresh token cookie and receive new access token",
          responses: {
            "200": {
              description: "Token refreshed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/logout": {
        post: {
          summary: "Log out current session",
          responses: {
            "200": {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/logout-all": {
        post: {
          summary: "Revoke all sessions for the user",
          responses: {
            "200": {
              description: "All sessions revoked",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/phone/change/request": {
        post: {
          summary: "Request OTP to change registered phone number",
          responses: {
            "200": {
              description: "OTP sent to new phone",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OtpResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/phone/change/verify": {
        post: {
          summary: "Verify OTP and update phone number",
          responses: {
            "200": {
              description: "Phone number updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/me": {
        get: {
          summary: "Get current user profile",
          responses: {
            "200": {
              description: "Profile data",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserPublic" },
                },
              },
            },
          },
        },
        patch: {
          summary: "Update current user profile",
          responses: {
            "200": {
              description: "Profile updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserPublic" },
                },
              },
            },
          },
        },
      },
      "/me/registrations": {
        get: {
          summary: "Get current user registrations",
          responses: {
            "200": {
              description: "User registrations list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/MyRegistrationItem" },
                  },
                },
              },
            },
          },
        },
      },
      "/me/bookmarks": {
        get: {
          summary: "Get user bookmarks",
          responses: {
            "200": {
              description: "User bookmarks list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/MyBookmarkItem" },
                  },
                },
              },
            },
          },
        },
      },
      "/me/xp": {
        get: {
          summary: "Get user XP, streak, and badges",
          responses: {
            "200": {
              description: "User XP summary",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MyXpSummary" },
                },
              },
            },
          },
        },
      },
      "/events": {
        get: {
          summary: "List and filter published events",
          responses: {
            "200": {
              description: "List of events with pagination cursor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/EventsListResponse" },
                },
              },
            },
          },
        },
        post: {
          summary: "Create event draft",
          responses: {
            "201": {
              description: "Event draft created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/events/{id}": {
        get: {
          summary: "Get event by ID",
          responses: {
            "200": {
              description: "Event details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
        patch: {
          summary: "Update event draft or details",
          responses: {
            "200": {
              description: "Event updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/events/{id}/submit": {
        post: {
          summary: "Submit event draft for two-stage approval",
          responses: {
            "200": {
              description: "Event submitted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/events/{id}/cancel": {
        post: {
          summary: "Cancel an event",
          responses: {
            "200": {
              description: "Event cancelled",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/events/{id}/attendees": {
        get: {
          summary: "List attendees for an event",
          responses: {
            "200": {
              description: "Attendees roster",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/EventAttendeesResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/events/{id}/qr": {
        get: {
          summary: "Generate rotating QR check-in token",
          responses: {
            "200": {
              description: "QR token data",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/EventQrResponse" },
                },
              },
            },
          },
        },
      },
      "/events/{id}/register": {
        post: {
          summary:
            "Register for event or join waitlist (requires Idempotency-Key header)",
          responses: {
            "201": {
              description: "Registration outcome (CONFIRMED or WAITLISTED)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RegisterResponse" },
                },
              },
            },
          },
        },
        delete: {
          summary: "Cancel registration and promote waitlist",
          responses: {
            "200": {
              description: "Registration cancelled",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CancelRegistrationResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/events/{id}/checkin": {
        post: {
          summary: "Check in attendee by QR or manual override",
          responses: {
            "200": {
              description: "Check-in result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckInResponse" },
                },
              },
            },
          },
        },
      },
      "/approvals": {
        get: {
          summary: "Get events pending faculty or admin approval",
          responses: {
            "200": {
              description: "Approvals queue",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApprovalsListResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/approvals/{id}/approve": {
        post: {
          summary: "Approve pending event stage",
          responses: {
            "200": {
              description: "Event approved",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/approvals/{id}/reject": {
        post: {
          summary: "Reject pending event with reason",
          responses: {
            "200": {
              description: "Event rejected",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Event" },
                },
              },
            },
          },
        },
      },
      "/admin/users": {
        get: {
          summary: "List users for administration",
          responses: {
            "200": {
              description: "User list",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AdminUsersListResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/admin/users/{id}": {
        patch: {
          summary: "Update user role or active status",
          responses: {
            "200": {
              description: "User updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserPublic" },
                },
              },
            },
          },
        },
      },
      "/admin/audit": {
        get: {
          summary: "View immutable system audit logs",
          responses: {
            "200": {
              description: "Audit log entries",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuditLogsResponse" },
                },
              },
            },
          },
        },
      },
      "/admin/ops": {
        get: {
          summary: "Live operations and provider health metrics",
          responses: {
            "200": {
              description: "Ops telemetry",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OpsMetricsResponse" },
                },
              },
            },
          },
        },
      },
      "/feed": {
        get: {
          summary: "Get server-driven layout feed spec",
          responses: {
            "200": {
              description: "Feed layout spec",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FeedResponse" },
                },
              },
            },
          },
        },
      },
      "/search/suggest": {
        get: {
          summary: "Typo-tolerant search suggestions",
          responses: {
            "200": {
              description: "Suggestions and matching clubs",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SearchSuggestResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/stream": {
        get: {
          summary: "Real-time Server-Sent Events stream",
          responses: {
            "200": {
              description: "SSE event stream",
              content: { "text/event-stream": {} },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          required: ["status", "timestamp", "version", "uptime"],
          properties: {
            status: { type: "string", enum: ["ok"] },
            timestamp: { type: "string", format: "date-time" },
            version: { type: "string" },
            uptime: { type: "number" },
          },
        },
        ProblemDetails: {
          type: "object",
          required: ["type", "title", "status", "detail", "code"],
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            status: { type: "integer" },
            detail: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
  };
}

export function generateOpenApiYaml(): string {
  const spec = getOpenApiSpec();
  return stringify(spec);
}
