import type {
  HealthResponse,
  UserProfile,
  NavigationScreen,
  EventItem,
} from "./types.js";

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
  protected setAccessTokenFn: (token: string | null) => void;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.mode = config.mode || "live";
    this.getAccessToken = config.getAccessToken || (() => null);
    this.setAccessTokenFn = config.setAccessToken || (() => {});
  }

  setAccessToken(token: string | null): void {
    this.setAccessTokenFn(token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (this.mode === "mock") {
      if (endpoint === "/healthz") {
        return {
          status: "ok",
          version: "1.0.0",
          uptime: 42,
          timestamp: new Date().toISOString(),
        } as unknown as T;
      }
      if (endpoint === "/me/navigation") {
        return [
          {
            key: "feed",
            path: "/",
            title: "Discover",
            section: "events",
            icon: "compass",
          },
          {
            key: "my-events",
            path: "/my-events",
            title: "My Events",
            section: "events",
            icon: "calendar",
          },
        ] as unknown as T;
      }
      return {} as T;
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errBody}`);
    }

    return response.json() as Promise<T>;
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/healthz");
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/me");
  }

  async getPermissions(): Promise<string[]> {
    return this.request<string[]>("/me/permissions");
  }

  async getNavigation(): Promise<NavigationScreen[]> {
    return this.request<NavigationScreen[]>("/me/navigation");
  }

  async listEvents(): Promise<EventItem[]> {
    return this.request<EventItem[]>("/events");
  }
}
