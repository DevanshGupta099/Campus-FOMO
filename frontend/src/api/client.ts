import { offlineStore } from "./mockStore";
import type {
  AttendeeRosterItem,
  AuditLogItem,
  AuthSessionResponse,
  BookmarkItem,
  CampusLeaderboard,
  CampusPulseItem,
  CheckinScanResult,
  CheckinStatsResponse,
  ClashReport,
  DemoPersonaSummary,
  EventItem,
  GalleryItem,
  GamificationLedger,
  LuckyCampaignItem,
  LuckyVerificationProof,
  OpsTelemetry,
  RbacMatrixResponse,
  RegistrationItem,
  RotatingQrResponse,
  ScreenItem,
  SponsorAnalytics,
  SponsorShowcase,
  UserProfile,
  VenueItem,
} from "./types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";
const FORCE_MOCK =
  import.meta.env.VITE_API_MODE === "mock" || import.meta.env.MODE === "test";

let activeAccessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  activeAccessToken = token;
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  offlineFallback?: () => T | Promise<T>,
): Promise<T> {
  if (FORCE_MOCK && offlineFallback) {
    return offlineFallback();
  }

  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (activeAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${activeAccessToken}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const problem = await response.json();
        detail = problem.detail || problem.message || detail;
      } catch {
        // Use fallback status text
      }
      throw new Error(detail);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    const errName =
      typeof err === "object" && err !== null && "name" in err
        ? String((err as { name?: unknown }).name)
        : "";
    const errMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "";
    const isNetworkError =
      err instanceof TypeError ||
      errName === "TypeError" ||
      errMessage.toLowerCase().includes("fetch") ||
      errMessage.includes("NetworkError") ||
      errMessage.includes("Load failed");

    if (isNetworkError && offlineFallback) {
      return offlineFallback();
    }
    throw err;
  }
}

export const apiClient = {
  getHealth: () =>
    requestJson<{ status: string; version: string; uptime: number }>(
      "/healthz",
      {},
      () => ({ status: "ok", version: "2.0.0-offline", uptime: 1 }),
    ),

  getDemoPersonas: () =>
    requestJson<DemoPersonaSummary[]>("/auth/personas", {}, () =>
      offlineStore.getPersonas(),
    ),

  login: (payload: {
    identifier: string;
    password?: string;
    otpCode?: string;
  }) =>
    requestJson<AuthSessionResponse>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(payload) },
      () => offlineStore.login(payload.identifier),
    ),

  signup: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    studentRegisterNumber?: string;
    department?: string;
    institution?: string;
    year?: number;
    accountType?: "student" | "guest";
  }) =>
    requestJson<AuthSessionResponse>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify(payload) },
      () => offlineStore.signup(payload),
    ),

  requestOtp: (destination: string, channel: "email" | "sms" = "email") =>
    requestJson<{
      message: string;
      expiresInSeconds: number;
      cooldownSeconds: number;
      devPasscodeHint?: string;
    }>(
      "/auth/otp/request",
      { method: "POST", body: JSON.stringify({ destination, channel }) },
      () => ({
        message: "Verification passcode dispatched",
        expiresInSeconds: 300,
        cooldownSeconds: 30,
        devPasscodeHint: "482910",
      }),
    ),

  logout: () =>
    requestJson<{ message: string }>(
      "/auth/logout",
      { method: "POST" },
      () => ({ message: "Logged out" }),
    ),

  getMe: () =>
    requestJson<UserProfile>("/me", {}, () => {
      const u = offlineStore.getUserFromToken(activeAccessToken);
      if (!u) throw new Error("Unauthenticated");
      return u;
    }),

  updateMe: (payload: {
    name?: string;
    department?: string;
    year?: number;
    institution?: string;
  }) =>
    requestJson<UserProfile>(
      "/me",
      { method: "PATCH", body: JSON.stringify(payload) },
      () => {
        const u = offlineStore.getUserFromToken(activeAccessToken);
        if (!u) throw new Error("Unauthenticated");
        return { ...u, ...payload };
      },
    ),

  getNavigation: () =>
    requestJson<ScreenItem[]>("/me/navigation", {}, () =>
      offlineStore.getNavigation(activeAccessToken),
    ),

  getGamification: () =>
    requestJson<GamificationLedger>("/me/gamification", {}, () => {
      const u = offlineStore.getUserFromToken(activeAccessToken);
      return offlineStore.getGamification(u?.sub || "student");
    }),

  getVenues: () =>
    requestJson<VenueItem[]>("/venues", {}, () => offlineStore.getVenues()),

  listEvents: (params?: {
    category?: string;
    external?: boolean;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "All") {
      qs.set("category", params.category);
    }
    if (params?.external) qs.set("external", "true");
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return requestJson<EventItem[]>(`/events${suffix}`, {}, () =>
      offlineStore.listEvents(params || {}, activeAccessToken),
    );
  },

  getEvent: (id: string) =>
    requestJson<EventItem>(`/events/${id}`, {}, () => {
      const found = offlineStore
        .listEvents({ status: "all" }, activeAccessToken)
        .find((e) => e.id === id);
      if (!found) throw new Error("Event not found");
      return found;
    }),

  checkVenueClash: (params: {
    venueId: string;
    startsAt: string;
    endsAt: string;
    excludeEventId?: string;
  }) => {
    const qs = new URLSearchParams({
      venueId: params.venueId,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
    });
    if (params.excludeEventId) qs.set("excludeEventId", params.excludeEventId);
    return requestJson<ClashReport>(
      `/events/clash-check?${qs.toString()}`,
      {},
      () =>
        offlineStore.checkClash(
          params.venueId,
          params.startsAt,
          params.endsAt,
          params.excludeEventId,
        ),
    );
  },

  createProposal: (payload: Record<string, unknown>) =>
    requestJson<EventItem>(
      "/events/proposals",
      { method: "POST", body: JSON.stringify(payload) },
      () => offlineStore.createProposal(payload, activeAccessToken),
    ),

  approveFaculty: (eventId: string) =>
    requestJson<EventItem>(
      `/events/${eventId}/approve-faculty`,
      { method: "POST", body: JSON.stringify({}) },
      () => offlineStore.approveFaculty(eventId),
    ),

  approveDean: (eventId: string, approvedBudget?: number) =>
    requestJson<EventItem>(
      `/events/${eventId}/approve-dean`,
      { method: "POST", body: JSON.stringify({ approvedBudget }) },
      () => offlineStore.approveDean(eventId, approvedBudget),
    ),

  rejectEvent: (eventId: string, reason: string) =>
    requestJson<EventItem>(
      `/events/${eventId}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) },
      () => offlineStore.rejectEvent(eventId, reason),
    ),

  cancelEvent: (eventId: string, reason: string) =>
    requestJson<EventItem>(
      `/events/${eventId}/cancel`,
      { method: "POST", body: JSON.stringify({ reason }) },
      () => offlineStore.cancelEvent(eventId, reason),
    ),

  assignVolunteer: (
    eventId: string,
    payload: { studentSub: string; roleTitle: string },
  ) =>
    requestJson<{
      eventId: string;
      studentSub: string;
      roleTitle: string;
      assignedAt: string;
      status: string;
    }>(
      `/events/${eventId}/volunteers`,
      { method: "POST", body: JSON.stringify(payload) },
      () => ({
        eventId,
        studentSub: payload.studentSub,
        roleTitle: payload.roleTitle,
        assignedAt: new Date().toISOString(),
        status: "ASSIGNED",
      }),
    ),

  listVolunteers: (eventId: string) =>
    requestJson<
      Array<{ studentSub: string; roleTitle: string; assignedAt: string }>
    >(`/events/${eventId}/volunteers`, {}, () => []),

  sendBroadcast: (eventId: string, message: string) =>
    requestJson<{
      eventId: string;
      eventTitle: string;
      message: string;
      recipientCount: number;
      dispatchedAt: string;
      recipientsMasked: boolean;
    }>(
      `/events/${eventId}/broadcast`,
      { method: "POST", body: JSON.stringify({ message }) },
      () => ({
        eventId,
        eventTitle: "Campus Event",
        message,
        recipientCount: 48,
        dispatchedAt: new Date().toISOString(),
        recipientsMasked: true,
      }),
    ),

  registerForEvent: (
    eventId: string,
    payload: { phone?: string; institution?: string; name?: string } = {},
  ) => {
    const idempotencyKey = `idem-${eventId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return requestJson<{
      registration: RegistrationItem;
      isWaitlisted: boolean;
    }>(
      `/events/${eventId}/register`,
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(payload),
      },
      () => offlineStore.registerEvent(eventId, payload, activeAccessToken),
    );
  },

  listMyRegistrations: () =>
    requestJson<RegistrationItem[]>("/registrations/me", {}, () =>
      offlineStore.listMyRegistrations(activeAccessToken),
    ),

  cancelRegistration: (registrationId: string) =>
    requestJson<{
      cancelled: RegistrationItem;
      promoted?: RegistrationItem;
    }>(
      `/registrations/${registrationId}/cancel`,
      { method: "POST", body: JSON.stringify({}) },
      () => offlineStore.cancelRegistration(registrationId),
    ),

  listEventAttendees: (eventId: string) =>
    requestJson<AttendeeRosterItem[]>(`/events/${eventId}/attendees`, {}, () =>
      offlineStore.listAttendees(eventId),
    ),

  exportEventAttendees: (eventId: string) =>
    requestJson<{
      eventId: string;
      exportedAt: string;
      recordCount: number;
      attendees: AttendeeRosterItem[];
    }>(`/events/${eventId}/export`, {}, () => {
      const attendees = offlineStore.listAttendees(eventId);
      return {
        eventId,
        exportedAt: new Date().toISOString(),
        recordCount: attendees.length,
        attendees,
      };
    }),

  getRotatingQrToken: (registrationId: string) =>
    requestJson<RotatingQrResponse>(
      `/checkin/token/${registrationId}`,
      {},
      () => offlineStore.getRotatingQr(registrationId),
    ),

  scanQrToken: (qrToken: string) =>
    requestJson<CheckinScanResult>(
      "/checkin/scan",
      { method: "POST", body: JSON.stringify({ qrToken }) },
      () => offlineStore.scanQr(qrToken),
    ),

  getCheckinStats: () =>
    requestJson<CheckinStatsResponse>("/checkin/stats", {}, () =>
      offlineStore.getCheckinStats(),
    ),

  listCampaigns: () =>
    requestJson<LuckyCampaignItem[]>("/luckydraw/campaigns", {}, () =>
      offlineStore.listCampaigns(),
    ),

  createCampaign: (payload: {
    eventId: string;
    title: string;
    prizeDescription?: string;
  }) =>
    requestJson<LuckyCampaignItem>(
      "/luckydraw/campaigns",
      { method: "POST", body: JSON.stringify(payload) },
      () => ({
        id: `draw-${Date.now()}`,
        eventId: payload.eventId,
        title: payload.title,
        prizeDescription: payload.prizeDescription,
        status: "OPEN",
        seedHash:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        totalEntries: 0,
        createdAt: new Date().toISOString(),
      }),
    ),

  enterLuckyDraw: async (campaignId: string) => {
    const session = await requestJson<{
      sessionId: string;
      campaignId: string;
    }>(
      `/luckydraw/campaigns/${campaignId}/session`,
      { method: "POST", body: JSON.stringify({}) },
      () => ({ sessionId: `sess-${Date.now()}`, campaignId }),
    );
    return requestJson<{
      message: string;
      campaignId: string;
      totalEntries: number;
    }>(
      `/luckydraw/campaigns/${campaignId}/enter`,
      {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId }),
      },
      () => offlineStore.enterCampaign(campaignId),
    );
  },

  executeLuckyDraw: (campaignId: string) =>
    requestJson<LuckyCampaignItem>(
      `/luckydraw/campaigns/${campaignId}/draw`,
      { method: "POST", body: JSON.stringify({}) },
      () => offlineStore.drawCampaign(campaignId),
    ),

  verifyLuckyDraw: (campaignId: string) =>
    requestJson<LuckyVerificationProof>(
      `/luckydraw/campaigns/${campaignId}/verify`,
      {},
      () => offlineStore.verifyCampaign(campaignId),
    ),

  getGallery: (category?: string) => {
    const suffix =
      category && category !== "All"
        ? `?category=${encodeURIComponent(category)}`
        : "";
    return requestJson<GalleryItem[]>(`/gallery${suffix}`, {}, () =>
      offlineStore.getGallery(category),
    );
  },

  getSponsorShowcase: () =>
    requestJson<SponsorShowcase>("/sponsors/showcase", {}, () =>
      offlineStore.getSponsorShowcase(),
    ),

  getSponsorAnalytics: () =>
    requestJson<SponsorAnalytics>("/sponsors/analytics", {}, () =>
      offlineStore.getSponsorAnalytics(),
    ),

  getRbacMatrix: () =>
    requestJson<RbacMatrixResponse>("/admin/rbac/roles", {}, () =>
      offlineStore.getRbacMatrix(),
    ),

  saveRbacRole: (name: string, permissions: string[]) =>
    requestJson<{ message: string; role: string; permissions: string[] }>(
      "/admin/rbac/roles",
      { method: "POST", body: JSON.stringify({ name, permissions }) },
      () => ({ message: "Saved", role: name, permissions }),
    ),

  grantUserPermissions: (sub: string, permissions: string[]) =>
    requestJson<{
      message: string;
      userSub: string;
      grantedPermissions: string[];
    }>(
      `/admin/rbac/users/${sub}/grant`,
      { method: "POST", body: JSON.stringify({ permissions }) },
      () => ({
        message: "Granted",
        userSub: sub,
        grantedPermissions: permissions,
      }),
    ),

  listAdminUsers: () =>
    requestJson<{ users: UserProfile[] }>("/admin/users", {}, () => ({
      users: offlineStore.getUsers(),
    })),

  getAuditLogs: () =>
    requestJson<{ auditLogs: AuditLogItem[] }>("/admin/audit", {}, () => ({
      auditLogs: offlineStore.getAuditLogs(),
    })),

  getOpsMetrics: () =>
    requestJson<OpsTelemetry>("/admin/ops", {}, () => offlineStore.getOps()),

  pollStream: (since: number) =>
    requestJson<{
      events: Array<{
        id: number;
        event: string;
        data: Record<string, unknown>;
        timestamp: string;
      }>;
      latestSeq?: number;
      pollIntervalMs: number;
    }>(`/stream/poll?since=${since}`, {}, () => ({
      events: [],
      pollIntervalMs: 15000,
    })),

  getBookmarks: () =>
    requestJson<BookmarkItem[]>("/me/bookmarks", {}, () =>
      offlineStore.getBookmarks(),
    ),

  toggleBookmark: (eventId: string) =>
    requestJson<{
      eventId: string;
      saved: boolean;
      bookmarks: BookmarkItem[];
    }>(
      `/me/bookmarks/${eventId}`,
      { method: "POST", body: JSON.stringify({}) },
      () => offlineStore.toggleBookmark(eventId),
    ),

  getLeaderboard: () =>
    requestJson<CampusLeaderboard>("/events/leaderboard", {}, () => ({
      deaneries: [
        {
          rank: 1,
          deanery: "Computer Science & Engineering",
          totalXp: 18420,
          activePasses: 612,
          badge: "Labyrinth Vanguard",
        },
        {
          rank: 2,
          deanery: "Commerce & Management",
          totalXp: 16890,
          activePasses: 540,
          badge: "Magnovite Strategist",
        },
        {
          rank: 3,
          deanery: "Performing Arts & Cultural",
          totalXp: 15110,
          activePasses: 498,
          badge: "Blossoms Laureate",
        },
        {
          rank: 4,
          deanery: "Humanities & Social Sciences",
          totalXp: 12740,
          activePasses: 415,
          badge: "Colloquium Fellow",
        },
      ],
      topParticipants: [
        {
          rank: 1,
          displayName: "Asha N.",
          department: "Computer Science",
          xp: 820,
          badgesCount: 4,
        },
        {
          rank: 2,
          displayName: "Rohan K.",
          department: "Commerce & Management",
          xp: 760,
          badgesCount: 3,
        },
        {
          rank: 3,
          displayName: "Diya M.",
          department: "Performing Arts",
          xp: 710,
          badgesCount: 3,
        },
        {
          rank: 4,
          displayName: "Pranav S.",
          department: "Sciences & Mathematics",
          xp: 640,
          badgesCount: 2,
        },
      ],
    })),

  getPulse: () =>
    requestJson<CampusPulseItem[]>("/events/pulse", {}, () => [
      {
        id: "pulse-1",
        kind: "SEAT_LOCK",
        label:
          "Labyrinth 24h Hackathon · 49/50 seats locked (Last 1 remaining)",
        venue: "Main Auditorium — Audi Block",
        ago: "12s ago",
      },
      {
        id: "pulse-2",
        kind: "CLASH_CLEAR",
        label: "Zero venue clash verified in 3ms · KE Auditorium Block IV",
        venue: "Block IV",
        ago: "38s ago",
      },
      {
        id: "pulse-3",
        kind: "QR_GATE",
        label: "HMAC-SHA256 rotating pass verified in 14ms · Gate-1 Hosur Rd",
        venue: "Gate-1 Precinct",
        ago: "1m ago",
      },
      {
        id: "pulse-4",
        kind: "COMMIT_REVEAL",
        label: "Third Wave Coffee Cold Brew Draw · SHA-256 seed pre-committed",
        venue: "Central Block Ground Floor",
        ago: "2m ago",
      },
    ]),
};
