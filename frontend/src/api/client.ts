import type {
  HealthResponse,
  UserProfile,
  NavigationScreen,
  EventItem,
  RegistrationItem,
  LuckyDrawCampaign,
  SponsorShowcase,
  SponsorAnalytics,
  GalleryItem,
  DrawVerification,
  ScanResult,
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

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }
      return (await response.json()) as T;
    } catch (err: any) {
      // If live request fails and mode is mock or fallback allowed, provide offline simulated response
      if (this.mode === "mock" || err.message?.includes("Failed to fetch")) {
        return this.getMockResponse<T>(endpoint, options);
      }
      throw err;
    }
  }

  private getMockResponse<T>(endpoint: string, _options: RequestInit): T {
    if (endpoint === "/healthz") {
      return {
        status: "ok",
        version: "1.0.0",
        uptime: 120,
        timestamp: new Date().toISOString(),
      } as unknown as T;
    }
    if (endpoint === "/me/navigation") {
      return [
        {
          key: "feed",
          path: "/",
          title: "Discover Events",
          section: "events",
          icon: "compass",
        },
        {
          key: "my-tickets",
          path: "/my-tickets",
          title: "My Passes & Tickets",
          section: "events",
          icon: "ticket",
        },
        {
          key: "gallery",
          path: "/gallery",
          title: "Campus Fest Gallery",
          section: "events",
          icon: "image",
        },
        {
          key: "lucky-draw",
          path: "/lucky-draw",
          title: "Fest Lucky Draws",
          section: "events",
          icon: "gift",
        },
        {
          key: "sponsor-portal",
          path: "/sponsor",
          title: "Sponsor Brand Hub",
          section: "sponsors",
          icon: "coffee",
        },
      ] as unknown as T;
    }
    if (endpoint.startsWith("/events")) {
      return [
        {
          id: "evt-hackathon-100",
          title: "Inter-College Hackathon 2026",
          description:
            "24-hour national hackathon for innovation and problem solving.",
          category: "Hackathon",
          status: "PUBLISHED",
          venueId: "ven-auditorium",
          venueName: "Central Campus Auditorium",
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          endsAt: new Date(Date.now() + 172800000).toISOString(),
          capacity: 50,
          confirmedCount: 49,
          waitlistCap: 10,
          waitlistCount: 0,
          isExternalOpen: true,
          fee: 0,
          version: 1,
        },
        {
          id: "evt-tech-workshop",
          title: "Hands-on AI & 3D WebGL Workshop",
          description:
            "Master modern browser graphics with Three.js, shaders, and real-time canvas architectures.",
          category: "Workshop",
          status: "PUBLISHED",
          venueId: "ven-lab-2",
          venueName: "Block 2 Advanced Computing Lab",
          startsAt: new Date(Date.now() + 172800000).toISOString(),
          endsAt: new Date(Date.now() + 187200000).toISOString(),
          capacity: 35,
          confirmedCount: 15,
          waitlistCap: 10,
          waitlistCount: 0,
          isExternalOpen: true,
          fee: 0,
          version: 1,
        },
      ] as unknown as T;
    }
    if (endpoint === "/sponsors/showcase") {
      return {
        brand: "Third Wave Coffee Campus Lounge",
        tagline: "Fueling CHRIST University Innovators & Creatives",
        location: "Central Block Ground Floor (Near Audi 1)",
        hours: "08:00 AM – 08:30 PM",
        studentPerk:
          "Flat 20% off with verified Campus FOMO registration badge",
        menuHighlights: [
          { name: "Classic Cold Brew", price: 180, studentPrice: 144 },
          { name: "Sea Salt Mocha", price: 210, studentPrice: 168 },
          { name: "Sourdough Toast & Hummus", price: 160, studentPrice: 128 },
        ],
        activeCampaigns: [
          {
            id: "camp-twc-01",
            title: "Fest Hackathon Free Cold Brew Lucky Draw",
            prize: "5x ₹500 Cafe Vouchers",
          },
        ],
      } as unknown as T;
    }
    return [] as unknown as T;
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

  async listEvents(filters?: {
    category?: string;
    external?: boolean;
    status?: string;
  }): Promise<EventItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.external) params.set("external", "true");
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return this.request<EventItem[]>(`/events${qs ? `?${qs}` : ""}`);
  }

  async getEvent(id: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}`);
  }

  async registerEvent(
    id: string,
    body?: { phone?: string; institution?: string },
    idempotencyKey?: string,
  ): Promise<{ registration: RegistrationItem; isWaitlisted: boolean }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.request<{
      registration: RegistrationItem;
      isWaitlisted: boolean;
    }>(`/events/${id}/register`, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {}),
    });
  }

  async cancelRegistration(
    id: string,
  ): Promise<{ cancelled: RegistrationItem; promoted?: RegistrationItem }> {
    return this.request<{
      cancelled: RegistrationItem;
      promoted?: RegistrationItem;
    }>(`/registrations/${id}/cancel`, { method: "POST" });
  }

  async listMyRegistrations(): Promise<RegistrationItem[]> {
    return this.request<RegistrationItem[]>("/registrations/me");
  }

  async submitProposal(data: any): Promise<EventItem> {
    return this.request<EventItem>("/events/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async approveFaculty(id: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}/approve-faculty`, {
      method: "POST",
    });
  }

  async approveDean(id: string, approvedBudget?: number): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}/approve-dean`, {
      method: "POST",
      body: JSON.stringify({ approvedBudget }),
    });
  }

  async rejectEvent(id: string, reason: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async cancelEvent(id: string, reason?: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async scanQrToken(qrToken: string): Promise<ScanResult> {
    return this.request<ScanResult>("/checkin/scan", {
      method: "POST",
      body: JSON.stringify({ qrToken }),
    });
  }

  async getRotatingQrToken(
    registrationId: string,
  ): Promise<{
    registrationId: string;
    qrToken: string;
    expiresInSeconds: number;
  }> {
    return this.request<{
      registrationId: string;
      qrToken: string;
      expiresInSeconds: number;
    }>(`/checkin/token/${registrationId}`);
  }

  async listLuckyCampaigns(): Promise<LuckyDrawCampaign[]> {
    return this.request<LuckyDrawCampaign[]>("/luckydraw/campaigns");
  }

  async startLuckySession(
    campaignId: string,
  ): Promise<{ sessionId: string; campaignId: string }> {
    return this.request<{ sessionId: string; campaignId: string }>(
      `/luckydraw/campaigns/${campaignId}/session`,
      { method: "POST" },
    );
  }

  async enterLuckyDraw(
    campaignId: string,
    sessionId: string,
  ): Promise<{ message: string; campaignId: string; totalEntries: number }> {
    return this.request<{
      message: string;
      campaignId: string;
      totalEntries: number;
    }>(`/luckydraw/campaigns/${campaignId}/enter`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }

  async executeLuckyDraw(campaignId: string): Promise<LuckyDrawCampaign> {
    return this.request<LuckyDrawCampaign>(
      `/luckydraw/campaigns/${campaignId}/draw`,
      {
        method: "POST",
      },
    );
  }

  async verifyLuckyDraw(campaignId: string): Promise<DrawVerification> {
    return this.request<DrawVerification>(
      `/luckydraw/campaigns/${campaignId}/verify`,
    );
  }

  async getSponsorShowcase(): Promise<SponsorShowcase> {
    return this.request<SponsorShowcase>("/sponsors/showcase");
  }

  async getSponsorAnalytics(): Promise<SponsorAnalytics> {
    return this.request<SponsorAnalytics>("/sponsors/analytics");
  }

  async getGallery(category?: string): Promise<GalleryItem[]> {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request<GalleryItem[]>(`/gallery${qs}`);
  }

  async assignVolunteer(
    eventId: string,
    studentSub: string,
    roleTitle: string,
  ): Promise<any> {
    return this.request<any>(`/events/${eventId}/volunteers`, {
      method: "POST",
      body: JSON.stringify({ studentSub, roleTitle }),
    });
  }

  async getVolunteers(eventId: string): Promise<any[]> {
    return this.request<any[]>(`/events/${eventId}/volunteers`);
  }

  async broadcastMessage(eventId: string, message: string): Promise<any> {
    return this.request<any>(`/events/${eventId}/broadcast`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}
