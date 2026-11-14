import type {
  AttendeeRosterItem,
  AuditLogItem,
  AuthSessionResponse,
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

const ALL_PERMS = [
  "event:read:public",
  "event:read:any",
  "event:create",
  "event:update:own",
  "event:submit:own",
  "event:cancel:own",
  "event:cancel:any",
  "event:approve:dept",
  "event:approve:budget",
  "event:reject",
  "proposal:read:own",
  "proposal:read:dept",
  "proposal:read:any",
  "venue:request",
  "venue:manage",
  "resource:request",
  "registration:create",
  "registration:cancel:own",
  "registration:read:own",
  "registration:manage:own-event",
  "registration:export:own-event",
  "checkin:scan:own-event",
  "checkin:manage:own-event",
  "volunteer:assign:own-event",
  "broadcast:send:own-event",
  "budget:read:own-event",
  "budget:submit-receipt:own-event",
  "budget:approve",
  "report:submit:own-event",
  "analytics:view:own-event",
  "analytics:view:campus",
  "gallery:read",
  "gallery:manage",
  "sponsor:profile:manage:own",
  "sponsor:campaign:manage:own",
  "sponsor:analytics:view:own",
  "luckydraw:enter",
  "luckydraw:run",
  "luckydraw:audit",
  "notification:read:own",
  "gamification:read:own",
  "rbac:manage",
  "user:manage",
  "audit:read",
  "ops:view",
];

const BUNDLES: Record<string, string[]> = {
  GUEST: [
    "event:read:public",
    "gallery:read",
    "registration:create",
    "registration:cancel:own",
    "registration:read:own",
    "notification:read:own",
  ],
  STUDENT: [
    "event:read:public",
    "gallery:read",
    "registration:create",
    "registration:cancel:own",
    "registration:read:own",
    "luckydraw:enter",
    "notification:read:own",
    "gamification:read:own",
  ],
  EVENT_HEAD: [
    "event:read:public",
    "event:create",
    "event:update:own",
    "event:submit:own",
    "event:cancel:own",
    "proposal:read:own",
    "venue:request",
    "resource:request",
    "registration:manage:own-event",
    "registration:export:own-event",
    "volunteer:assign:own-event",
    "broadcast:send:own-event",
    "checkin:scan:own-event",
    "checkin:manage:own-event",
    "budget:read:own-event",
    "budget:submit-receipt:own-event",
    "report:submit:own-event",
    "analytics:view:own-event",
    "luckydraw:run",
    "notification:read:own",
  ],
  VOLUNTEER: [
    "event:read:public",
    "checkin:scan:own-event",
    "notification:read:own",
  ],
  FACULTY: [
    "event:read:public",
    "event:read:any",
    "event:approve:dept",
    "event:reject",
    "proposal:read:dept",
    "analytics:view:own-event",
    "notification:read:own",
  ],
  DEAN: [
    "event:read:public",
    "event:read:any",
    "event:approve:budget",
    "event:reject",
    "budget:approve",
    "proposal:read:any",
    "venue:manage",
    "analytics:view:campus",
    "audit:read",
    "notification:read:own",
  ],
  SPONSOR: [
    "event:read:public",
    "sponsor:profile:manage:own",
    "sponsor:campaign:manage:own",
    "sponsor:analytics:view:own",
    "luckydraw:audit",
  ],
  ADMIN: [...ALL_PERMS],
};

const SCREENS: ScreenItem[] = [
  {
    key: "feed",
    path: "/",
    title: "Discover Events",
    section: "events",
    icon: "compass",
    requiredPermissions: ["event:read:public"],
    matchMode: "any",
  },
  {
    key: "campus-map",
    path: "/map",
    title: "3D Precinct Radar",
    section: "events",
    icon: "map",
    requiredPermissions: ["event:read:public"],
    matchMode: "any",
  },
  {
    key: "my-tickets",
    path: "/my-tickets",
    title: "My Passes & Tickets",
    section: "events",
    icon: "ticket",
    requiredPermissions: ["registration:read:own"],
    matchMode: "any",
  },
  {
    key: "gallery",
    path: "/gallery",
    title: "Campus Fest Gallery",
    section: "events",
    icon: "image",
    requiredPermissions: ["gallery:read"],
    matchMode: "any",
  },
  {
    key: "lucky-draw",
    path: "/lucky-draw",
    title: "Fest Lucky Draws",
    section: "events",
    icon: "gift",
    requiredPermissions: [
      "luckydraw:enter",
      "luckydraw:run",
      "luckydraw:audit",
    ],
    matchMode: "any",
  },
  {
    key: "event-head-dashboard",
    path: "/manage-events",
    title: "Event Operations",
    section: "management",
    icon: "calendar-cog",
    requiredPermissions: [
      "event:create",
      "event:update:own",
      "event:submit:own",
    ],
    matchMode: "any",
  },
  {
    key: "door-scanner",
    path: "/scanner",
    title: "Ticket Scanner",
    section: "management",
    icon: "qr-code",
    requiredPermissions: ["checkin:scan:own-event"],
    matchMode: "any",
  },
  {
    key: "faculty-approvals",
    path: "/approvals/department",
    title: "Faculty Endorsements",
    section: "approvals",
    icon: "check-circle-2",
    requiredPermissions: ["event:approve:dept"],
    matchMode: "any",
  },
  {
    key: "dean-governance",
    path: "/approvals/executive",
    title: "Deanery Approvals",
    section: "approvals",
    icon: "shield-check",
    requiredPermissions: ["event:approve:budget"],
    matchMode: "any",
  },
  {
    key: "sponsor-portal",
    path: "/sponsor",
    title: "Sponsor Brand Hub",
    section: "sponsors",
    icon: "coffee",
    requiredPermissions: ["sponsor:profile:manage:own"],
    matchMode: "any",
  },
  {
    key: "admin-rbac",
    path: "/admin/rbac",
    title: "Access & Roles (PBAC)",
    section: "admin",
    icon: "shield-alert",
    requiredPermissions: ["rbac:manage"],
    matchMode: "any",
  },
  {
    key: "admin-audit",
    path: "/admin/audit",
    title: "Security Audit Logs",
    section: "admin",
    icon: "file-lock-2",
    requiredPermissions: ["audit:read"],
    matchMode: "any",
  },
];

const VENUES: VenueItem[] = [
  {
    id: "ven-auditorium",
    name: "Main Auditorium — Audi Block",
    block: "Audi Block",
    location: "Central Campus, Level 1 (Adjacent to Central Block)",
    capacity: 850,
    isOutdoor: false,
    resources: ["Dolby Line Array", "4K Laser Projection", "Green Rooms"],
  },
  {
    id: "ven-ke-audi",
    name: "K.E. Auditorium — Block IV",
    block: "Block IV",
    location: "Block IV, 4th Floor",
    capacity: 450,
    isOutdoor: false,
    resources: ["Dual Stage Projectors", "Digital Mixer", "Acoustic Paneling"],
  },
  {
    id: "ven-audi-2",
    name: "Campus View Auditorium — Block II",
    block: "Block II",
    location: "Block II, 3rd Floor",
    capacity: 180,
    isOutdoor: false,
    resources: ["Podium Array", "Interactive Display"],
  },
  {
    id: "ven-lab-2",
    name: "Block II Advanced Computing Lab",
    block: "Block II",
    location: "Block II, 2nd Floor",
    capacity: 60,
    isOutdoor: false,
    resources: ["RTX Workstations", "10Gbps Campus Fiber"],
  },
  {
    id: "ven-skyview",
    name: "Skyview Conclave Hall — Central Block",
    block: "Central Block",
    location: "Central Block, 10th Floor",
    capacity: 120,
    isOutdoor: false,
    resources: ["Executive Roundtable", "Hybrid Conferencing"],
  },
  {
    id: "ven-amphi",
    name: "Birds Park Open-Air Amphitheatre",
    block: "Birds Park Precinct",
    location: "East Canopy Courtyard",
    capacity: 400,
    isOutdoor: true,
    resources: ["Tiered Stone Seating", "Stage Truss Lighting"],
  },
  {
    id: "ven-quad",
    name: "Central Block Main Quadrangle",
    block: "Central Concourse",
    location: "Hosur Road Heritage Forecourt",
    capacity: 1200,
    isOutdoor: true,
    resources: ["Concert Stage Grid", "3-Phase Power"],
  },
  {
    id: "ven-sports",
    name: "Central Campus Floodlit Turf & Arena",
    block: "Sports Complex",
    location: "South Gate Athletic Grounds",
    capacity: 250,
    isOutdoor: true,
    resources: ["FIFA Turf", "Electronic Scoreboard"],
  },
];

const now = Date.now();
const day = 86_400_000;

const MOCK_USERS: Record<string, UserProfile> = {
  "asha@christuniversity.in": {
    id: "01927500-0001-7000-8000-000000000001",
    sub: "01927500-0001-7000-8000-000000000001",
    email: "asha@christuniversity.in",
    phone: "+91******11",
    name: "Asha Kumar",
    role: "STUDENT",
    studentRegisterNumber: "2340118",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    year: 3,
    xp: 450,
    permissions: [...BUNDLES.STUDENT],
  },
  "guest@external.edu": {
    id: "01927500-0002-7000-8000-000000000002",
    sub: "01927500-0002-7000-8000-000000000002",
    email: "guest@external.edu",
    phone: "+91******22",
    name: "Vikram Sharma",
    role: "GUEST",
    department: "External Participant",
    institution: "St. Joseph's University, Bengaluru",
    permissions: [...BUNDLES.GUEST],
  },
  "karan@christuniversity.in": {
    id: "01927500-0003-7000-8000-000000000003",
    sub: "01927500-0003-7000-8000-000000000003",
    email: "karan@christuniversity.in",
    phone: "+91******33",
    name: "Karan Verma",
    role: "EVENT_HEAD",
    studentRegisterNumber: "2240209",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    year: 4,
    permissions: [...BUNDLES.EVENT_HEAD],
  },
  "volunteer@christuniversity.in": {
    id: "01927500-0004-7000-8000-000000000004",
    sub: "01927500-0004-7000-8000-000000000004",
    email: "volunteer@christuniversity.in",
    phone: "+91******44",
    name: "Rahul Singh",
    role: "VOLUNTEER",
    studentRegisterNumber: "2440315",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    year: 2,
    permissions: [...BUNDLES.VOLUNTEER],
  },
  "dr.nair@christuniversity.in": {
    id: "01927500-0005-7000-8000-000000000005",
    sub: "01927500-0005-7000-8000-000000000005",
    email: "dr.nair@christuniversity.in",
    phone: "+91******55",
    name: "Dr. Lakshmi Nair",
    role: "FACULTY",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    permissions: [...BUNDLES.FACULTY],
  },
  "dean@christuniversity.in": {
    id: "01927500-0006-7000-8000-000000000006",
    sub: "01927500-0006-7000-8000-000000000006",
    email: "dean@christuniversity.in",
    phone: "+91******66",
    name: "Dr. Fr. Joseph Varghese",
    role: "DEAN",
    department: "Central Administration",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    permissions: [...BUNDLES.DEAN],
  },
  "sponsor@thirdwavecoffee.in": {
    id: "01927500-0007-7000-8000-000000000007",
    sub: "01927500-0007-7000-8000-000000000007",
    email: "sponsor@thirdwavecoffee.in",
    phone: "+91******77",
    name: "Priya Mehta",
    role: "SPONSOR",
    department: "Commercial Partner",
    institution: "Third Wave Coffee Lounge — Central Block",
    permissions: [...BUNDLES.SPONSOR],
  },
  "admin@christuniversity.in": {
    id: "01927500-0008-7000-8000-000000000008",
    sub: "01927500-0008-7000-8000-000000000008",
    email: "admin@christuniversity.in",
    phone: "+91******88",
    name: "Arjun Menon",
    role: "ADMIN",
    department: "IT Services (OITS)",
    institution: "CHRIST (Deemed to be University) — Central Campus",
    permissions: [...BUNDLES.ADMIN],
  },
};

class OfflineMockStore {
  private events: EventItem[] = [
    {
      id: "evt-hackathon-100",
      title: "Inter-College Hackathon 2026: Labyrinth Edition",
      description:
        "CHRIST Central Campus's flagship 24-hour national systems & AI engineering sprint hosted by ASCII and Labyrinth.",
      category: "Hackathon",
      clubName: "ASCII & Labyrinth — Computer Science",
      status: "PUBLISHED",
      venueId: "ven-auditorium",
      venueName: "Main Auditorium — Audi Block",
      startsAt: new Date(now + day).toISOString(),
      endsAt: new Date(now + 2 * day).toISOString(),
      registrationDeadline: new Date(now + 18 * 3_600_000).toISOString(),
      eligibility: "Open to CHRIST students & external university teams",
      capacity: 50,
      confirmedCount: 49,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      budgetRequested: 45000,
      budgetApproved: 45000,
      version: 1,
      createdAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: "evt-tech-workshop",
      title: "Real-Time Distributed Systems & WebGL Shaders Studio",
      description:
        "Hands-on engineering workshop covering deterministic seat reservation engines and GPU shader pipelines.",
      category: "Workshop",
      clubName: "ASCII Technical Guild",
      status: "PUBLISHED",
      venueId: "ven-lab-2",
      venueName: "Block II Advanced Computing Lab",
      startsAt: new Date(now + 2 * day).toISOString(),
      endsAt: new Date(now + 2 * day + 4 * 3_600_000).toISOString(),
      registrationDeadline: new Date(now + 36 * 3_600_000).toISOString(),
      eligibility: "Open to UG/PG students across Indian universities",
      capacity: 35,
      confirmedCount: 15,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      version: 1,
      createdAt: new Date(now - 4 * day).toISOString(),
    },
    {
      id: "evt-cultural-dance",
      title: "Dhwani & In-Bloom 2026: Acoustic & Contemporary Showcase",
      description:
        "An evening under the Central Campus canopy celebrating original collegiate compositions and contemporary choreography.",
      category: "Cultural",
      clubName: "SWO University Cultural Team",
      status: "PUBLISHED",
      venueId: "ven-amphi",
      venueName: "Birds Park Open-Air Amphitheatre",
      indoorBackupVenueId: "ven-ke-audi",
      indoorBackupVenueName: "K.E. Auditorium — Block IV",
      startsAt: new Date(now + 3 * day).toISOString(),
      endsAt: new Date(now + 3 * day + 5 * 3_600_000).toISOString(),
      registrationDeadline: new Date(now + 2.5 * day).toISOString(),
      eligibility:
        "Open to CHRIST Central Campus & external college pass holders",
      capacity: 150,
      confirmedCount: 148,
      waitlistCap: 20,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 100,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Performing Arts",
      lastUpdateBanner:
        "Monsoon contingency verified: K.E. Auditorium (Block IV) stands by as indoor backup venue.",
      version: 2,
      createdAt: new Date(now - 6 * day).toISOString(),
    },
    {
      id: "evt-sports-futsal",
      title: "Inter-Deanery Floodlit Futsal Championship",
      description:
        "High-tempo 5-a-side knockout football under the South Gate floodlights competing for the Chancellor's Shield.",
      category: "Sports",
      clubName: "Department of Physical Education",
      status: "PUBLISHED",
      venueId: "ven-sports",
      venueName: "Central Campus Floodlit Turf & Arena",
      startsAt: new Date(now + 4 * day).toISOString(),
      endsAt: new Date(now + 4 * day + 4 * 3_600_000).toISOString(),
      eligibility: "CHRIST Central Campus students only",
      capacity: 60,
      confirmedCount: 60,
      waitlistCap: 10,
      waitlistCount: 4,
      isExternalOpen: false,
      fee: 50,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Physical Education",
      version: 1,
      createdAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: "evt-pending-faculty",
      title: "CyberSecurity Red-Team CTF Sprint 2026",
      description:
        "Defend simulated university infrastructure against binary exploitation and OIDC token replay in a 12-hour sprint.",
      category: "Technical",
      clubName: "Cybersecurity & Ethical Hacking Guild",
      status: "PENDING_FACULTY",
      venueId: "ven-audi-2",
      venueName: "Campus View Auditorium — Block II",
      startsAt: new Date(now + 5 * day).toISOString(),
      endsAt: new Date(now + 5 * day + 6 * 3_600_000).toISOString(),
      capacity: 40,
      confirmedCount: 0,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      budgetRequested: 15000,
      version: 1,
      createdAt: new Date(now - day).toISOString(),
    },
    {
      id: "evt-pending-dean",
      title: "CHRIST National Model United Nations (MUN) — Central Chapter",
      description:
        "Three-committee diplomatic simulation addressing global AI safety treaties and climate finance frameworks.",
      category: "Competition",
      clubName: "International Relations & MUN Society",
      status: "PENDING_DEAN",
      venueId: "ven-auditorium",
      venueName: "Main Auditorium — Audi Block",
      startsAt: new Date(now + 6 * day).toISOString(),
      endsAt: new Date(now + 6 * day + 8 * 3_600_000).toISOString(),
      capacity: 80,
      confirmedCount: 0,
      waitlistCap: 15,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 250,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      budgetRequested: 35000,
      version: 1,
      createdAt: new Date(now - day).toISOString(),
    },
  ];

  private registrations: RegistrationItem[] = [
    {
      id: "reg-seed-asha-workshop",
      eventId: "evt-tech-workshop",
      userSub: "01927500-0001-7000-8000-000000000001",
      userEmail: "a***a@christuniversity.in",
      userName: "Asha Kumar",
      userPhone: "+91******11",
      status: "CONFIRMED",
      isGuest: false,
      createdAt: new Date(now - day).toISOString(),
      eventTitle: "Real-Time Distributed Systems & WebGL Shaders Studio",
      venueName: "Block II Advanced Computing Lab",
      startsAt: new Date(now + 2 * day).toISOString(),
      endsAt: new Date(now + 2 * day + 4 * 3_600_000).toISOString(),
      category: "Workshop",
      fee: 0,
    },
  ];

  private campaigns: LuckyCampaignItem[] = [
    {
      id: "draw-twc-central-01",
      eventId: "evt-hackathon-100",
      title: "Labyrinth Hackathon Cold Brew Voucher Draw",
      prizeDescription: "5x INR 500 Third Wave Coffee Central Block Vouchers",
      sponsorBrand: "Third Wave Coffee — Central Block",
      status: "OPEN",
      seedHash:
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      totalEntries: 12,
      createdAt: new Date(now - day).toISOString(),
    },
  ];

  private auditLogs: AuditLogItem[] = [
    {
      id: "aud-1",
      action: "REALM_PBAC_SYNCED",
      actor: "system:access-studio",
      target: "campus-fomo:central-campus",
      details:
        "Synchronized 44 canonical PBAC permissions across 8 institutional bundles.",
      timestamp: new Date(now - 7_200_000).toISOString(),
    },
  ];

  private tokenMap = new Map<string, UserProfile>();
  private scannedIds = new Set<string>();

  getPersonas(): DemoPersonaSummary[] {
    return [
      {
        email: "asha@christuniversity.in",
        name: "Asha Kumar",
        roleLabel: "CHRIST Student",
        department: "Computer Science",
        summary:
          "Discover all campus events, atomic seat booking, rotating QR pass, XP & lucky draws",
      },
      {
        email: "guest@external.edu",
        name: "Vikram Sharma",
        roleLabel: "External Fest Guest",
        department: "St. Joseph's University",
        summary:
          "Browse external-open fests only, book inter-collegiate passes, masked PII",
      },
      {
        email: "karan@christuniversity.in",
        name: "Karan Verma",
        roleLabel: "Student Event Head",
        department: "Computer Science",
        summary:
          "Submit proposals, venue clash check, delegate gate volunteers, broadcast & export",
      },
      {
        email: "volunteer@christuniversity.in",
        name: "Rahul Singh",
        roleLabel: "Gate QR Marshal",
        department: "Computer Science",
        summary:
          "Rapid <500ms rotating QR check-in verification with strict zero-PII isolation",
      },
      {
        email: "dr.nair@christuniversity.in",
        name: "Dr. Lakshmi Nair",
        roleLabel: "Faculty Coordinator",
        department: "Computer Science",
        summary:
          "Departmental proposal review, automated clash inspection, Stage-1 endorsement",
      },
      {
        email: "dean@christuniversity.in",
        name: "Dr. Fr. Joseph Varghese",
        roleLabel: "Dean of Students",
        department: "Central Administration",
        summary:
          "Executive budget clearance, Stage-2 publication sign-off, governance audit trail",
      },
      {
        email: "sponsor@thirdwavecoffee.in",
        name: "Priya Mehta",
        roleLabel: "Campus Partner",
        department: "Third Wave Coffee Lounge",
        summary:
          "Central Block showcase, student perks & anonymized engagement analytics",
      },
      {
        email: "admin@christuniversity.in",
        name: "Arjun Menon",
        roleLabel: "OITS Administrator",
        department: "IT Services (OITS)",
        summary:
          "Dynamic PBAC role studio, direct permission grants, audit ledger & emergency cancel",
      },
    ];
  }

  login(identifier: string): AuthSessionResponse {
    const key = identifier.trim().toLowerCase();
    const user =
      MOCK_USERS[key] ||
      Object.values(MOCK_USERS).find(
        (u) => u.studentRegisterNumber === identifier.trim(),
      );
    if (!user) {
      throw new Error("Invalid institutional identifier or credentials");
    }
    const token = `offline-jwt-${user.sub}-${Date.now()}`;
    this.tokenMap.set(token, user);
    return { accessToken: token, expiresIn: 3600, user };
  }

  signup(payload: {
    email: string;
    name: string;
    phone?: string;
    studentRegisterNumber?: string;
    department?: string;
    institution?: string;
    year?: number;
    accountType?: "student" | "guest";
  }): AuthSessionResponse {
    const email = payload.email.trim().toLowerCase();
    const isStudent =
      payload.accountType !== "guest" && email.endsWith("@christuniversity.in");
    const role = isStudent ? "STUDENT" : "GUEST";
    const sub = `usr-${Date.now()}`;
    const user: UserProfile = {
      id: sub,
      sub,
      email,
      phone: payload.phone ? `+91******${payload.phone.slice(-2)}` : null,
      name: payload.name,
      role,
      studentRegisterNumber: isStudent ? payload.studentRegisterNumber : null,
      department: isStudent
        ? payload.department || "Computer Science"
        : "External Participant",
      institution: isStudent
        ? "CHRIST (Deemed to be University) — Central Campus"
        : payload.institution || "Visiting Institution",
      year: isStudent ? (payload.year ?? 1) : null,
      xp: 450,
      permissions: [...(BUNDLES[role] || BUNDLES.GUEST)],
    };
    MOCK_USERS[email] = user;
    const token = `offline-jwt-${sub}`;
    this.tokenMap.set(token, user);
    return { accessToken: token, expiresIn: 3600, user };
  }

  getUserFromToken(token?: string | null): UserProfile | undefined {
    if (!token) return undefined;
    return this.tokenMap.get(token);
  }

  getNavigation(token?: string | null): ScreenItem[] {
    const user = this.getUserFromToken(token);
    const perms = user?.permissions || ["event:read:public"];
    if (perms.includes("rbac:manage")) return SCREENS;
    return SCREENS.filter((s) =>
      s.requiredPermissions.some((p) => perms.includes(p)),
    );
  }

  getVenues(): VenueItem[] {
    return VENUES;
  }

  listEvents(
    params: {
      category?: string;
      external?: boolean;
      status?: string;
      search?: string;
    },
    token?: string | null,
  ): EventItem[] {
    const caller = this.getUserFromToken(token);
    const isExternalRestricted = Boolean(
      caller &&
      !caller.permissions.includes("luckydraw:enter") &&
      !caller.permissions.includes("event:create") &&
      !caller.permissions.includes("event:read:any") &&
      !caller.permissions.includes("checkin:scan:own-event") &&
      !caller.permissions.includes("sponsor:profile:manage:own") &&
      !caller.permissions.includes("rbac:manage"),
    );
    const forceExternal = isExternalRestricted || params.external === true;
    let list = [...this.events];
    if (params.status !== "all") {
      const targetStatus =
        params.status ||
        (caller && !isExternalRestricted ? undefined : "PUBLISHED");
      if (targetStatus) {
        list = list.filter((e) => e.status === targetStatus);
      }
    }
    if (forceExternal) {
      list = list.filter((e) => e.isExternalOpen);
    }
    if (params.category && params.category !== "All") {
      list = list.filter(
        (e) => e.category.toLowerCase() === params.category!.toLowerCase(),
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q),
      );
    }
    return list;
  }

  checkClash(
    venueId: string,
    startsAt: string,
    endsAt: string,
    excludeEventId?: string,
  ): ClashReport {
    const venue = VENUES.find((v) => v.id === venueId);
    const s = new Date(startsAt).getTime();
    const e = new Date(endsAt).getTime();
    const conflicts = this.events.filter((evt) => {
      if (excludeEventId && evt.id === excludeEventId) return false;
      if (
        evt.venueId !== venueId ||
        evt.status === "CANCELLED" ||
        evt.status === "REJECTED"
      )
        return false;
      return (
        s < new Date(evt.endsAt).getTime() &&
        e > new Date(evt.startsAt).getTime()
      );
    });
    return {
      venueId,
      venueName: venue?.name || venueId,
      isOutdoor: Boolean(venue?.isOutdoor),
      requiresIndoorBackup: Boolean(venue?.isOutdoor),
      hasClash: conflicts.length > 0,
      conflictingEvents: conflicts.map((c) => ({
        id: c.id,
        title: c.title,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        status: c.status,
      })),
      examBlackoutWarning: null,
      checkedInMs: 4,
    };
  }

  registerEvent(
    eventId: string,
    body: { phone?: string; institution?: string },
    token?: string | null,
  ) {
    const user = this.getUserFromToken(token);
    if (!user) throw new Error("Sign in required");
    const evt = this.events.find((e) => e.id === eventId);
    if (!evt) throw new Error("Event not found");
    const isExternalParticipant =
      !user.permissions.includes("luckydraw:enter") &&
      !user.permissions.includes("rbac:manage");
    if (isExternalParticipant && !evt.isExternalOpen) {
      throw new Error(
        "This event is restricted to CHRIST University internal members",
      );
    }
    if (
      this.registrations.some(
        (r) =>
          r.eventId === eventId &&
          r.userSub === user.sub &&
          r.status !== "CANCELLED",
      )
    ) {
      throw new Error("Already registered for this event");
    }

    const isWaitlisted = evt.confirmedCount >= evt.capacity;
    if (isWaitlisted && evt.waitlistCount >= evt.waitlistCap) {
      throw new Error("EVENT_FULL: Capacity and waitlist limit reached");
    }

    if (isWaitlisted) {
      evt.waitlistCount += 1;
    } else {
      evt.confirmedCount += 1;
    }

    const reg: RegistrationItem = {
      id: `reg-${Date.now()}`,
      eventId,
      userSub: user.sub,
      userEmail: `${user.email[0]}***@${user.email.split("@")[1]}`,
      userName: user.name,
      userPhone: body.phone
        ? `+91******${body.phone.slice(-2)}`
        : user.phone || undefined,
      status: isWaitlisted ? "WAITLISTED" : "CONFIRMED",
      waitlistPosition: isWaitlisted ? evt.waitlistCount : undefined,
      isGuest: isExternalParticipant,
      guestInstitution: body.institution || user.institution || undefined,
      createdAt: new Date().toISOString(),
      eventTitle: evt.title,
      venueName: evt.venueName,
      startsAt: evt.startsAt,
      endsAt: evt.endsAt,
      category: evt.category,
      fee: evt.fee,
    };
    this.registrations.unshift(reg);
    return { registration: reg, isWaitlisted };
  }

  listMyRegistrations(token?: string | null): RegistrationItem[] {
    const user = this.getUserFromToken(token);
    if (!user) return [];
    return this.registrations.filter((r) => r.userSub === user.sub);
  }

  cancelRegistration(regId: string) {
    const reg = this.registrations.find((r) => r.id === regId);
    if (!reg) throw new Error("Registration not found");
    reg.status = "CANCELLED";
    const evt = this.events.find((e) => e.id === reg.eventId);
    if (evt && evt.confirmedCount > 0) evt.confirmedCount -= 1;
    return { cancelled: reg };
  }

  getRotatingQr(regId: string): RotatingQrResponse {
    return {
      registrationId: regId,
      qrToken: btoa(
        JSON.stringify({
          r: regId,
          w: Math.floor(Date.now() / 30000),
          s: "hmac-offline",
        }),
      ),
      expiresInSeconds: 30 - (Math.floor(Date.now() / 1000) % 30),
    };
  }

  scanQr(qrToken: string): CheckinScanResult {
    try {
      const parsed = JSON.parse(atob(qrToken));
      const reg = this.registrations.find((r) => r.id === parsed.r);
      if (!reg || reg.status !== "CONFIRMED") {
        return {
          status: "INVALID_TICKET",
          registrationId: parsed.r || "",
          userName: "Unknown",
          scannedAt: new Date().toISOString(),
          latencyMs: 12,
          message: "Invalid or unconfirmed pass.",
        };
      }
      if (this.scannedIds.has(reg.id)) {
        return {
          status: "ALREADY_CHECKED_IN",
          registrationId: reg.id,
          userName: reg.userName.split(" ")[0],
          eventTitle: reg.eventTitle,
          scannedAt: new Date().toISOString(),
          latencyMs: 9,
          message: "Attendee already admitted at gate.",
        };
      }
      this.scannedIds.add(reg.id);
      return {
        status: "ADMITTED",
        registrationId: reg.id,
        userName: reg.userName.split(" ")[0],
        eventTitle: reg.eventTitle,
        scannedAt: new Date().toISOString(),
        latencyMs: 14,
        message: `Verified and admitted: ${reg.userName.split(" ")[0]}`,
      };
    } catch {
      return {
        status: "INVALID_TICKET",
        registrationId: "",
        userName: "Unknown",
        scannedAt: new Date().toISOString(),
        latencyMs: 8,
        message: "Invalid or forged HMAC ticket signature.",
      };
    }
  }

  getCheckinStats(): CheckinStatsResponse {
    return {
      totalAdmitted: this.scannedIds.size,
      recentAdmissions: [],
    };
  }

  createProposal(
    body: Record<string, unknown>,
    token?: string | null,
  ): EventItem {
    const user = this.getUserFromToken(token);
    const venue = VENUES.find((v) => v.id === body.venueId) || VENUES[0];
    const created: EventItem = {
      id: `evt-${Date.now()}`,
      title: String(body.title || "Untitled Proposal"),
      description: String(body.description || ""),
      category: String(body.category || "Technical"),
      status: "PENDING_FACULTY",
      venueId: venue.id,
      venueName: venue.name,
      startsAt: String(body.startsAt || new Date(now + 3 * day).toISOString()),
      endsAt: String(
        body.endsAt || new Date(now + 3 * day + 7_200_000).toISOString(),
      ),
      capacity: Number(body.capacity || 60),
      confirmedCount: 0,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: Boolean(body.isExternalOpen),
      fee: Number(body.fee || 0),
      organizerSub: user?.sub || "organizer",
      department: user?.department || "Computer Science",
      budgetRequested: Number(body.budget || 10000),
      version: 1,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(created);
    return created;
  }

  approveFaculty(id: string): EventItem {
    const evt = this.events.find((e) => e.id === id);
    if (!evt) throw new Error("Event not found");
    evt.status = "PENDING_DEAN";
    return evt;
  }

  approveDean(id: string, approvedBudget?: number): EventItem {
    const evt = this.events.find((e) => e.id === id);
    if (!evt) throw new Error("Event not found");
    evt.status = "PUBLISHED";
    evt.budgetApproved = approvedBudget ?? evt.budgetRequested;
    return evt;
  }

  rejectEvent(id: string, reason: string): EventItem {
    const evt = this.events.find((e) => e.id === id);
    if (!evt) throw new Error("Event not found");
    evt.status = "REJECTED";
    evt.rejectionReason = reason;
    return evt;
  }

  cancelEvent(id: string, reason?: string): EventItem {
    const evt = this.events.find((e) => e.id === id);
    if (!evt) throw new Error("Event not found");
    evt.status = "CANCELLED";
    evt.rejectionReason = reason || "Emergency governance cancellation";
    return evt;
  }

  listAttendees(eventId: string): AttendeeRosterItem[] {
    return this.registrations
      .filter((r) => r.eventId === eventId)
      .map((r) => ({
        id: r.id,
        eventId: r.eventId,
        userSub: r.userSub,
        userName: r.userName,
        userEmail: r.userEmail,
        userPhone: r.userPhone || "+91******00",
        status: r.status,
        waitlistPosition: r.waitlistPosition,
        isGuest: r.isGuest,
        guestInstitution: r.guestInstitution,
        createdAt: r.createdAt,
      }));
  }

  listCampaigns(): LuckyCampaignItem[] {
    return this.campaigns;
  }

  enterCampaign(id: string): {
    message: string;
    campaignId: string;
    totalEntries: number;
  } {
    const c = this.campaigns.find((item) => item.id === id);
    if (!c) throw new Error("Campaign not found");
    c.totalEntries += 1;
    return {
      message: "Entered draw",
      campaignId: id,
      totalEntries: c.totalEntries,
    };
  }

  drawCampaign(id: string): LuckyCampaignItem {
    const c = this.campaigns.find((item) => item.id === id);
    if (!c) throw new Error("Campaign not found");
    c.status = "DRAWN";
    c.seedRevealed = "test";
    c.winnerName = "Asha";
    c.winnerDept = "Computer Science";
    c.winnerIndex = 0;
    return c;
  }

  verifyCampaign(id: string): LuckyVerificationProof {
    const c = this.campaigns.find((item) => item.id === id);
    return {
      campaignId: id,
      seedHash: c?.seedHash || "",
      seedRevealed: c?.seedRevealed || "test",
      isSeedValid: true,
      totalEntries: c?.totalEntries || 1,
      winnerIndex: c?.winnerIndex || 0,
      isWinnerIndexExact: true,
      winnerFirstname: c?.winnerName || "Asha",
      winnerDepartment: c?.winnerDept || "Computer Science",
      verificationFormula:
        "BigInt('0x' + sha256(seedRevealed + ':' + totalEntries)) % BigInt(totalEntries)",
    };
  }

  getGallery(category?: string): GalleryItem[] {
    const items: GalleryItem[] = [
      {
        id: "gal-01",
        title: "Labyrinth 24-Hour Systems Finale at Main Auditorium",
        festName: "Labyrinth",
        venueName: "Main Auditorium — Audi Block",
        year: 2025,
        imageUrl: "/media/fest-labyrinth-hackathon.jpg",
        thumbnailUrl: "/media/fest-labyrinth-hackathon.jpg",
        category: "Technical",
        aspectRatio: "16:9",
        sizeKb: 966,
        accentColor: "#FF4D1C",
        caption:
          "420 builders across 68 collegiate squads demoing live distributed prototypes at Audi Block.",
      },
      {
        id: "gal-02",
        title: "Blossoms Inter-Deanery Choreography Showcase",
        festName: "Blossoms",
        venueName: "Central Block Main Quadrangle",
        year: 2025,
        imageUrl: "/media/fest-blossoms-stage.jpg",
        thumbnailUrl: "/media/fest-blossoms-stage.jpg",
        category: "Cultural",
        aspectRatio: "4:3",
        sizeKb: 998,
        accentColor: "#E2B45A",
        caption:
          "Evening stage illumination across the Hosur Road heritage forecourt during Blossoms.",
      },
      {
        id: "gal-03",
        title: "Magnovite Autonomous Robotics & Industrial Design Pavilion",
        festName: "Magnovite",
        venueName: "Skyview Conclave Hall — Central Block",
        year: 2025,
        imageUrl: "/media/fest-magnovite-robotics.jpg",
        thumbnailUrl: "/media/fest-magnovite-robotics.jpg",
        category: "Technical",
        aspectRatio: "1:1",
        sizeKb: 777,
        accentColor: "#2EE59D",
        caption:
          "Kinetic architectural models and autonomous rover trials on the 10th floor conclave.",
      },
      {
        id: "gal-04",
        title: "Central Campus Heritage Colonnade & Glass Library Twilight",
        festName: "Concourse Architecture",
        venueName: "Central Block & Knowledge Centre",
        year: 2026,
        imageUrl: "/media/hero-central-campus.jpg",
        thumbnailUrl: "/media/hero-central-campus.jpg",
        category: "Cultural",
        aspectRatio: "16:9",
        sizeKb: 1016,
        accentColor: "#FF4D1C",
        caption:
          "Dusk across the Hosur Road sandstone colonnade and illuminated central library atrium.",
      },
      {
        id: "gal-05",
        title: "Skyview 10th-Floor Executive Conclave Over Bengaluru Canopy",
        festName: "Daksh & Colloquia",
        venueName: "Skyview Conclave Hall — Central Block",
        year: 2026,
        imageUrl: "/media/campus-skyview-atrium.jpg",
        thumbnailUrl: "/media/campus-skyview-atrium.jpg",
        category: "Technical",
        aspectRatio: "16:9",
        sizeKb: 831,
        accentColor: "#E2B45A",
        caption:
          "Panoramic architectural glass conclave overlooking the central Bengaluru banyan canopy.",
      },
      {
        id: "gal-06",
        title: "Third Wave Coffee Roastery Lounge at Central Block",
        festName: "Campus Partner Lounge",
        venueName: "Central Block Ground Floor",
        year: 2026,
        imageUrl: "/media/thirdwave-roastery-lounge.jpg",
        thumbnailUrl: "/media/thirdwave-roastery-lounge.jpg",
        category: "Music",
        aspectRatio: "16:9",
        sizeKb: 882,
        accentColor: "#E2B45A",
        caption:
          "Specialty pour-over bar and midnight hackathon fuel station adjacent to Main Auditorium.",
      },
    ];
    if (category && category !== "All") {
      return items.filter(
        (g) => g.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return items;
  }

  private bookmarks = new Set<string>(["evt-hackathon-100"]);

  getBookmarks() {
    return Array.from(this.bookmarks)
      .map((id) => this.events.find((e) => e.id === id))
      .filter((e): e is EventItem => Boolean(e))
      .map((e) => ({
        eventId: e.id,
        title: e.title,
        category: e.category,
        venueName: e.venueName,
        startsAt: e.startsAt,
        isExternalOpen: e.isExternalOpen,
      }));
  }

  toggleBookmark(eventId: string) {
    let saved = false;
    if (this.bookmarks.has(eventId)) {
      this.bookmarks.delete(eventId);
    } else {
      this.bookmarks.add(eventId);
      saved = true;
    }
    return { eventId, saved, bookmarks: this.getBookmarks() };
  }

  getSponsorShowcase(): SponsorShowcase {
    return {
      brand: "Third Wave Coffee Campus Lounge",
      tagline: "Fueling CHRIST University Innovators & Creatives",
      location: "Central Block Ground Floor (Near Main Auditorium)",
      hours: "08:00 AM – 08:30 PM IST",
      studentPerk: "Flat 20% off with verified Campus FOMO registration badge",
      menuHighlights: [
        { name: "Classic Cold Brew", price: 180, studentPrice: 144 },
        { name: "Sea Salt Mocha", price: 210, studentPrice: 168 },
        { name: "Sourdough Toast & Hummus", price: 160, studentPrice: 128 },
      ],
      activeCampaigns: [
        {
          id: "camp-twc-01",
          title: "Labyrinth Hackathon Cold Brew Lucky Draw",
          prize: "5x INR 500 Cafe Vouchers",
        },
      ],
    };
  }

  getSponsorAnalytics(): SponsorAnalytics {
    return {
      sponsorName: "Third Wave Coffee Campus Lounge",
      totalImpressions: 436,
      bannerClickThroughs: 89,
      voucherClaims: 34,
      privacyNote:
        "Strict PII Minimization enforced: Student phone numbers and emails are never shared with sponsors.",
    };
  }

  getGamification(sub: string): GamificationLedger {
    return {
      userSub: sub,
      totalXp: 450,
      badges: ["Central Concourse Pioneer", "Verified Pass Holder"],
      history: [
        {
          xp: 250,
          reason: "Completed Blossoms & ASCII orientation pass verification",
          timestamp: new Date(now - 2 * day).toISOString(),
        },
        {
          xp: 200,
          reason: "Attended Distinguished Colloquium at Block I Panel Room",
          timestamp: new Date(now - day).toISOString(),
        },
      ],
    };
  }

  getRbacMatrix(): RbacMatrixResponse {
    return {
      availablePermissions: ALL_PERMS,
      roles: BUNDLES,
    };
  }

  getUsers(): UserProfile[] {
    return Object.values(MOCK_USERS);
  }

  getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  getOps(): OpsTelemetry {
    return {
      uptimeSeconds: 1840,
      totalEvents: this.events.length,
      publishedEvents: this.events.filter((e) => e.status === "PUBLISHED")
        .length,
      pendingFacultyCount: 1,
      pendingDeanCount: 1,
      totalConfirmedSeats: 272,
      totalWaitlisted: 4,
      sseSeq: 4,
      campus: "CHRIST (Deemed to be University) — Central Campus, Bengaluru",
      timestamp: new Date().toISOString(),
    };
  }
}

export const offlineStore = new OfflineMockStore();
