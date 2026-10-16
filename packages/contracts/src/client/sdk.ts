import type {
  HealthResponse,
  AuthTokenResponse,
  LoginRequest,
  SignUpRequest,
  EventsListResponse,
  Event,
  FeedResponse,
  RegisterResponse,
  CancelRegistrationResponse,
  MyXpSummary,
} from "../schemas/index.js";
import { handleMockRequest } from "../mocks/handlers.js";

export interface ClientConfig {
  baseUrl: string;
  mode?: "live" | "mock";
  getAccessToken?: () => string | null;
  setAccessToken?: (token: string | null) => void;
}

export class CampusFomoClient {
  private baseUrl: string;
  private mode: "live" | "mock";
  private getAccessToken: () => string | null;
  private setAccessToken: (token: string | null) => void;
  private isRefreshing = false;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.mode = config.mode || "live";
    this.getAccessToken = config.getAccessToken || (() => null);
    this.setAccessToken = config.setAccessToken || (() => {});
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401 = true,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (this.mode === "mock") {
      const mockReq = {
        method: options.method || "GET",
        url,
        body: options.body ? JSON.parse(options.body as string) : undefined,
        headers: options.headers as Record<string, string>,
      };
      const mockRes = handleMockRequest(mockReq);
      if (mockRes.status >= 400) {
        throw new Error(
          `Mock Error ${mockRes.status}: ${JSON.stringify(mockRes.data)}`,
        );
      }
      return mockRes.data as T;
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // send HttpOnly cookies for auth refresh
    });

    if (
      res.status === 401 &&
      retryOn401 &&
      !this.isRefreshing &&
      endpoint !== "/auth/refresh"
    ) {
      this.isRefreshing = true;
      try {
        const refreshed = await this.refreshToken();
        this.setAccessToken(refreshed.accessToken);
        this.isRefreshing = false;
        // Retry original request once with new token
        return this.request<T>(endpoint, options, false);
      } catch (err) {
        this.isRefreshing = false;
        this.setAccessToken(null);
        throw err;
      }
    }

    if (!res.ok) {
      const errorJson = await res
        .json()
        .catch(() => ({ detail: res.statusText }));
      throw new Error(`API Error ${res.status}: ${JSON.stringify(errorJson)}`);
    }

    return res.json() as Promise<T>;
  }

  // Health
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/healthz");
  }

  // Auth
  async login(payload: LoginRequest): Promise<AuthTokenResponse> {
    const res = await this.request<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.setAccessToken(res.accessToken);
    return res;
  }

  async signUp(payload: SignUpRequest): Promise<AuthTokenResponse> {
    const res = await this.request<AuthTokenResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.setAccessToken(res.accessToken);
    return res;
  }

  async refreshToken(): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>(
      "/auth/refresh",
      {
        method: "POST",
      },
      false,
    );
  }

  async logout(): Promise<{ message: string }> {
    const res = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
    this.setAccessToken(null);
    return res;
  }

  // Discovery
  async getFeed(): Promise<FeedResponse> {
    return this.request<FeedResponse>("/feed");
  }

  async getEvents(query?: Record<string, string>): Promise<EventsListResponse> {
    const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
    return this.request<EventsListResponse>(`/events${qs}`);
  }

  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  // Registrations
  async register(
    eventId: string,
    idempotencyKey: string,
  ): Promise<RegisterResponse> {
    return this.request<RegisterResponse>(`/events/${eventId}/register`, {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  }

  async cancelRegistration(
    eventId: string,
  ): Promise<CancelRegistrationResponse> {
    return this.request<CancelRegistrationResponse>(
      `/events/${eventId}/register`,
      {
        method: "DELETE",
      },
    );
  }

  // Gamification
  async getMyXp(): Promise<MyXpSummary> {
    return this.request<MyXpSummary>("/me/xp");
  }
}
