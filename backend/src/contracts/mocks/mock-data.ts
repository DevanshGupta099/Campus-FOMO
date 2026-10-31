import type {
  Event,
  UserPublic,
  FeedResponse,
  HealthResponse,
  EventAttendeesResponse,
  MyXpSummary,
} from "../schemas/index.js";

export const mockUsers: Record<string, UserPublic> = {
  student: {
    id: "018f3a12-8700-7000-8000-000000000001",
    email: "asha.student@demo.test",
    phone: "+919876543210",
    name: "Asha Student",
    role: "STUDENT",
    studentRegisterNumber: "2440001",
    department: "Computer Science",
    year: 1,
    createdAt: "2026-01-15T09:00:00Z",
  },
  organizer: {
    id: "018f3a12-8700-7000-8000-000000000002",
    email: "karan.organizer@demo.test",
    phone: "+919876543211",
    name: "Karan Organizer",
    role: "ORGANIZER",
    studentRegisterNumber: "2240002",
    department: "Electronics",
    year: 3,
    createdAt: "2025-06-10T10:00:00Z",
  },
  faculty: {
    id: "018f3a12-8700-7000-8000-000000000003",
    email: "nair.faculty@demo.test",
    phone: "+919876543212",
    name: "Dr. Nair Faculty",
    role: "FACULTY",
    studentRegisterNumber: null,
    department: "Computer Science",
    year: null,
    createdAt: "2024-01-01T08:00:00Z",
  },
  admin: {
    id: "018f3a12-8700-7000-8000-000000000004",
    email: "admin@demo.test",
    phone: "+919876543213",
    name: "Dean Office Admin",
    role: "ADMIN",
    studentRegisterNumber: null,
    department: "Student Affairs",
    year: null,
    createdAt: "2023-01-01T08:00:00Z",
  },
};

export const mockEvents: Event[] = [
  {
    id: "018f3a12-8700-7000-8000-000000000101",
    clubId: "018f3a12-8700-7000-8000-000000000011",
    clubName: "Christ Coding Club",
    title: "Demo Hack Night 2026",
    description:
      "An overnight hackathon building AI and WebGL campus projects. Free snacks, mentors, and prizes.",
    category: "TECHNICAL",
    tags: ["hackathon", "ai", "webgl", "first-year-friendly"],
    venueId: "018f3a12-8700-7000-8000-000000000021",
    venueName: "Central Auditorium",
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 115200000).toISOString(),
    capacity: 100,
    confirmedCount: 99,
    price: 0,
    posterUrl: "/assets/posters/hack-night.svg",
    status: "PUBLISHED",
    version: 1,
    accessibility: {
      wheelchairAccessible: true,
      elevatorAvailable: true,
      assistiveListening: false,
      signLanguageInterpreter: false,
      notes: "Ground floor access via Gate 1",
    },
    rejectionReason: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "018f3a12-8700-7000-8000-000000000102",
    clubId: "018f3a12-8700-7000-8000-000000000012",
    clubName: "Christ Cultural Association",
    title: "Acoustic Sunset unplugged",
    description:
      "Annual intra-college music evening featuring student bands, classical fusion, and open-mic slots.",
    category: "CULTURAL",
    tags: ["music", "cultural", "acoustic"],
    venueId: "018f3a12-8700-7000-8000-000000000022",
    venueName: "Main Amphitheatre",
    startsAt: new Date(Date.now() + 172800000).toISOString(),
    endsAt: new Date(Date.now() + 187200000).toISOString(),
    capacity: 250,
    confirmedCount: 180,
    price: 0,
    posterUrl: "/assets/posters/acoustic-sunset.svg",
    status: "PUBLISHED",
    version: 1,
    accessibility: {
      wheelchairAccessible: true,
      elevatorAvailable: false,
      assistiveListening: true,
      signLanguageInterpreter: false,
      notes: "Ramps available at amphitheatre east wing",
    },
    rejectionReason: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const mockFeed: FeedResponse = {
  timestamp: new Date().toISOString(),
  sections: [
    {
      id: "section-hero",
      type: "hero",
      title: "Featured Event",
      subtitle: "Experience the signature overnight hackathon",
      reason: "Trending this week",
      events: [mockEvents[0]],
    },
    {
      id: "section-this-week",
      type: "this_week",
      title: "Happening This Week",
      subtitle: "Explore campus events happening in the next 7 days",
      events: mockEvents,
    },
  ],
};

export const mockHealth: HealthResponse = {
  status: "ok",
  timestamp: new Date().toISOString(),
  version: "1.0.0",
  uptime: 120.45,
};

export const mockXpSummary: MyXpSummary = {
  totalXp: 320,
  level: 3,
  nextLevelXp: 500,
  currentStreakDays: 4,
  badges: [
    {
      id: "badge-first-timer",
      name: "First Timer",
      description: "Registered for your very first campus event",
      unlockedAt: "2026-02-01T10:00:00Z",
    },
  ],
  history: [
    {
      id: "018f3a12-8700-7000-8000-000000000201",
      eventId: mockEvents[0].id,
      kind: "REGISTER",
      amount: 50,
      reason: "Registered for Demo Hack Night 2026",
      awardedAt: "2026-02-01T10:00:00Z",
    },
  ],
};
