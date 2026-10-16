import {
  mockEvents,
  mockFeed,
  mockHealth,
  mockUsers,
  mockXpSummary,
} from "./mock-data.js";

export interface MockRequest {
  method: string;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface MockResponse {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
}

export function handleMockRequest(req: MockRequest): MockResponse {
  const urlObj = new URL(req.url, "http://localhost:3001");
  const pathname = urlObj.pathname.replace(/^\/api\/v1/, "");
  const method = req.method.toUpperCase();

  // Health
  if (pathname === "/healthz" && method === "GET") {
    return { status: 200, data: mockHealth };
  }
  if (pathname === "/readyz" && method === "GET") {
    return {
      status: 200,
      data: {
        status: "ready",
        timestamp: new Date().toISOString(),
        checks: { database: "up", redis: "up" },
      },
    };
  }

  // Auth
  if (pathname === "/auth/login" && method === "POST") {
    return {
      status: 200,
      data: {
        accessToken: "mock_jwt_access_token_header.payload.signature",
        expiresIn: 900,
        user: mockUsers.student,
      },
    };
  }
  if (pathname === "/auth/signup" && method === "POST") {
    return {
      status: 201,
      data: {
        accessToken: "mock_jwt_access_token_header.payload.signature",
        expiresIn: 900,
        user: mockUsers.student,
      },
    };
  }
  if (pathname === "/auth/refresh" && method === "POST") {
    return {
      status: 200,
      data: {
        accessToken: "mock_refreshed_jwt_access_token",
        expiresIn: 900,
        user: mockUsers.student,
      },
    };
  }
  if (pathname === "/auth/logout" && method === "POST") {
    return { status: 200, data: { message: "Logged out successfully" } };
  }

  // Profile
  if (pathname === "/me" && method === "GET") {
    return { status: 200, data: mockUsers.student };
  }
  if (pathname === "/me/xp" && method === "GET") {
    return { status: 200, data: mockXpSummary };
  }

  // Discovery
  if (pathname === "/feed" && method === "GET") {
    return { status: 200, data: mockFeed };
  }
  if (pathname === "/events" && method === "GET") {
    return {
      status: 200,
      data: {
        items: mockEvents,
        nextCursor: null,
        totalCount: mockEvents.length,
      },
    };
  }

  // Event Detail
  const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
  if (eventMatch && method === "GET") {
    const event =
      mockEvents.find((e) => e.id === eventMatch[1]) || mockEvents[0];
    return { status: 200, data: event };
  }

  // Registration
  const registerMatch = pathname.match(/^\/events\/([^/]+)\/register$/);
  if (registerMatch && method === "POST") {
    return {
      status: 201,
      data: {
        registrationId: "018f3a12-8700-7000-8000-000000000301",
        eventId: registerMatch[1],
        userId: mockUsers.student.id,
        status: "CONFIRMED",
        waitlistPosition: null,
        message: "Registration confirmed for event",
        registeredAt: new Date().toISOString(),
      },
    };
  }
  if (registerMatch && method === "DELETE") {
    return {
      status: 200,
      data: {
        message: "Registration successfully cancelled",
        eventId: registerMatch[1],
        cancelledStatus: "CANCELLED",
      },
    };
  }

  // Fallback 404
  return {
    status: 404,
    data: {
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `No mock handler found for ${method} ${pathname}`,
      code: "RESOURCE_NOT_FOUND",
    },
  };
}
