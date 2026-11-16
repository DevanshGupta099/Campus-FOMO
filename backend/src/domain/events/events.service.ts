import { streamHub } from "../stream/stream.routes.js";
import { auditService } from "../../modules/audit/index.js";

export interface VenueRecord {
  id: string;
  name: string;
  block: string;
  location: string;
  capacity: number;
  isOutdoor: boolean;
  resources: string[];
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  clubName?: string;
  status:
    | "DRAFT"
    | "PENDING_FACULTY"
    | "PENDING_DEAN"
    | "PUBLISHED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";
  venueId: string;
  venueName: string;
  indoorBackupVenueId?: string;
  indoorBackupVenueName?: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline?: string;
  eligibility?: string;
  capacity: number;
  confirmedCount: number;
  waitlistCap: number;
  waitlistCount: number;
  isExternalOpen: boolean;
  fee: number;
  organizerSub: string;
  department: string;
  teamSize?: number;
  version: number;
  rejectionReason?: string;
  budgetRequested?: number;
  budgetApproved?: number;
  attachmentUrl?: string;
  lastUpdateBanner?: string;
  createdAt: string;
}

export class EventsService {
  private events = new Map<string, EventRecord>();
  private venues = new Map<string, VenueRecord>();

  constructor() {
    this.seedCentralCampusVenues();
    this.seedCentralCampusEvents();
  }

  private seedCentralCampusVenues() {
    const list: VenueRecord[] = [
      {
        id: "ven-auditorium",
        name: "Main Auditorium — Audi Block",
        block: "Audi Block",
        location: "Central Campus, Level 1 (Adjacent to Central Block)",
        capacity: 850,
        isOutdoor: false,
        resources: [
          "Dolby Line Array",
          "4K Laser Projection",
          "Green Rooms",
          "Live Broadcast Rig",
        ],
      },
      {
        id: "ven-ke-audi",
        name: "K.E. Auditorium — Block IV",
        block: "Block IV",
        location: "Block IV, 4th Floor",
        capacity: 450,
        isOutdoor: false,
        resources: [
          "Dual Stage Projectors",
          "Digital Mixer",
          "Acoustic Paneling",
        ],
      },
      {
        id: "ven-audi-2",
        name: "Campus View Auditorium — Block II",
        block: "Block II",
        location: "Block II, 3rd Floor",
        capacity: 180,
        isOutdoor: false,
        resources: ["Podium Array", "Interactive Display", "Lecture Capture"],
      },
      {
        id: "ven-lab-2",
        name: "Block II Advanced Computing Lab",
        block: "Block II",
        location: "Block II, 2nd Floor (Dept. of Computer Science)",
        capacity: 60,
        isOutdoor: false,
        resources: ["RTX Workstations", "10Gbps Campus Fiber", "Dual Monitors"],
      },
      {
        id: "ven-skyview",
        name: "Skyview Conclave Hall — Central Block",
        block: "Central Block",
        location: "Central Block, 10th Floor",
        capacity: 120,
        isOutdoor: false,
        resources: [
          "Executive Roundtable",
          "Hybrid Conferencing",
          "Press Backdrop",
        ],
      },
      {
        id: "ven-panel-1",
        name: "Panel Room & Seminar Hall — Block I",
        block: "Block I",
        location: "Block I, Ground Floor",
        capacity: 90,
        isOutdoor: false,
        resources: ["Debate Timers", "Wireless Microphones", "LED Display"],
      },
      {
        id: "ven-amphi",
        name: "Birds Park Open-Air Amphitheatre",
        block: "Birds Park Precinct",
        location: "East Canopy Courtyard",
        capacity: 400,
        isOutdoor: true,
        resources: [
          "Tiered Stone Seating",
          "Stage Truss Lighting",
          "Acoustic Shell",
        ],
      },
      {
        id: "ven-quad",
        name: "Central Block Main Quadrangle",
        block: "Central Concourse",
        location: "Hosur Road Heritage Forecourt",
        capacity: 1200,
        isOutdoor: true,
        resources: ["Concert Stage Grid", "Crowd Barricades", "3-Phase Power"],
      },
      {
        id: "ven-sports",
        name: "Central Campus Floodlit Turf & Arena",
        block: "Sports Complex",
        location: "South Gate Athletic Grounds",
        capacity: 250,
        isOutdoor: true,
        resources: ["FIFA Turf", "Electronic Scoreboard", "First-Aid Bay"],
      },
    ];

    for (const v of list) {
      this.venues.set(v.id, v);
    }
  }

  private seedCentralCampusEvents() {
    const now = Date.now();
    const hour = 3_600_000;
    const day = 86_400_000;

    // 1. Test-critical Last-Seat Race event (exact capacity 50, confirmedCount 49, waitlistCap 10, waitlistCount 0)
    this.events.set("evt-hackathon-100", {
      id: "evt-hackathon-100",
      title: "Inter-College Hackathon 2026: Labyrinth Edition",
      description:
        "CHRIST Central Campus's flagship 24-hour national systems & AI engineering sprint hosted by ASCII and Labyrinth. Build resilient civic, fintech, and campus infrastructure prototypes evaluated by industry architects.",
      category: "Hackathon",
      clubName: "ASCII & Labyrinth — Computer Science",
      status: "PUBLISHED",
      venueId: "ven-auditorium",
      venueName: "Main Auditorium — Audi Block",
      startsAt: new Date(now + day).toISOString(),
      endsAt: new Date(now + 2 * day).toISOString(),
      registrationDeadline: new Date(now + 18 * hour).toISOString(),
      eligibility:
        "Open to CHRIST students & external university teams (ID card mandatory at Gate 1)",
      capacity: 50,
      confirmedCount: 49,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 12,
      budgetRequested: 45000,
      budgetApproved: 45000,
      version: 1,
      createdAt: new Date(now - 5 * day).toISOString(),
    });

    this.events.set("evt-tech-workshop", {
      id: "evt-tech-workshop",
      title: "Real-Time Distributed Systems & WebGL Shaders Studio",
      description:
        "Hands-on engineering workshop covering deterministic seat reservation engines, PostgreSQL row-level locking, and interactive GPU shader pipelines in modern browsers.",
      category: "Workshop",
      clubName: "ASCII Technical Guild",
      status: "PUBLISHED",
      venueId: "ven-lab-2",
      venueName: "Block II Advanced Computing Lab",
      startsAt: new Date(now + 2 * day).toISOString(),
      endsAt: new Date(now + 2 * day + 4 * hour).toISOString(),
      registrationDeadline: new Date(now + 36 * hour).toISOString(),
      eligibility: "Open to UG/PG students across Indian universities",
      capacity: 35,
      confirmedCount: 15,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 6,
      budgetRequested: 12000,
      budgetApproved: 12000,
      version: 1,
      createdAt: new Date(now - 4 * day).toISOString(),
    });

    this.events.set("evt-cultural-dance", {
      id: "evt-cultural-dance",
      title: "Dhwani & In-Bloom 2026: Acoustic & Contemporary Showcase",
      description:
        "An evening under the Central Campus canopy celebrating original collegiate compositions, percussion ensembles, and contemporary choreography curated by Student Welfare Office (SWO).",
      category: "Cultural",
      clubName: "SWO University Cultural Team",
      status: "PUBLISHED",
      venueId: "ven-amphi",
      venueName: "Birds Park Open-Air Amphitheatre",
      indoorBackupVenueId: "ven-ke-audi",
      indoorBackupVenueName: "K.E. Auditorium — Block IV",
      startsAt: new Date(now + 3 * day).toISOString(),
      endsAt: new Date(now + 3 * day + 5 * hour).toISOString(),
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
      teamSize: 18,
      budgetRequested: 60000,
      budgetApproved: 55000,
      lastUpdateBanner:
        "Monsoon contingency verified: K.E. Auditorium (Block IV) stands by as indoor backup venue.",
      version: 2,
      createdAt: new Date(now - 6 * day).toISOString(),
    });

    this.events.set("evt-sports-futsal", {
      id: "evt-sports-futsal",
      title: "Inter-Deanery Floodlit Futsal Championship",
      description:
        "High-tempo 5-a-side knockout football under the South Gate floodlights featuring 16 departmental squads competing for the Central Campus Chancellor's Shield.",
      category: "Sports",
      clubName: "Department of Physical Education",
      status: "PUBLISHED",
      venueId: "ven-sports",
      venueName: "Central Campus Floodlit Turf & Arena",
      indoorBackupVenueId: "ven-auditorium",
      indoorBackupVenueName: "Indoor Sports Pavilion",
      startsAt: new Date(now + 4 * day).toISOString(),
      endsAt: new Date(now + 4 * day + 4 * hour).toISOString(),
      registrationDeadline: new Date(now + 3.5 * day).toISOString(),
      eligibility:
        "CHRIST Central Campus students only (Valid Smart Card required)",
      capacity: 60,
      confirmedCount: 60,
      waitlistCap: 10,
      waitlistCount: 4,
      isExternalOpen: false,
      fee: 50,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Physical Education",
      teamSize: 10,
      version: 1,
      createdAt: new Date(now - 5 * day).toISOString(),
    });

    this.events.set("evt-blossoms-finale", {
      id: "evt-blossoms-finale",
      title: "Blossoms Inter-Deanery Grand Literary & Debate Conclave",
      description:
        "Parliamentary debate, extempore rhetoric, and theatrical monologues bringing together the top finalists across Science, Humanities, Commerce, and Law deaneries.",
      category: "Competition",
      clubName: "CHRIST Debating Society (DebSoc)",
      status: "PUBLISHED",
      venueId: "ven-ke-audi",
      venueName: "K.E. Auditorium — Block IV",
      startsAt: new Date(now + 5 * day).toISOString(),
      endsAt: new Date(now + 5 * day + 4 * hour).toISOString(),
      registrationDeadline: new Date(now + 4.5 * day).toISOString(),
      eligibility: "CHRIST University Central Campus students",
      capacity: 220,
      confirmedCount: 164,
      waitlistCap: 25,
      waitlistCount: 0,
      isExternalOpen: false,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Humanities & Social Sciences",
      teamSize: 14,
      budgetRequested: 28000,
      budgetApproved: 28000,
      version: 1,
      createdAt: new Date(now - 3 * day).toISOString(),
    });

    this.events.set("evt-magnovite-conclave", {
      id: "evt-magnovite-conclave",
      title: "Magnovite 2026: Product Design & Urban Systems Conclave",
      description:
        "National inter-university symposium exploring human-centered industrial design, sustainable campus architecture, and applied robotics installations.",
      category: "Technical",
      clubName: "Magnovite Organizing Committee",
      status: "PUBLISHED",
      venueId: "ven-skyview",
      venueName: "Skyview Conclave Hall — Central Block",
      startsAt: new Date(now + 6 * day).toISOString(),
      endsAt: new Date(now + 6 * day + 6 * hour).toISOString(),
      registrationDeadline: new Date(now + 5 * day).toISOString(),
      eligibility:
        "Open to all Indian university students & design researchers",
      capacity: 120,
      confirmedCount: 92,
      waitlistCap: 15,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 150,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 16,
      budgetRequested: 38000,
      budgetApproved: 38000,
      version: 1,
      createdAt: new Date(now - 3 * day).toISOString(),
    });

    this.events.set("evt-darpan-theatre", {
      id: "evt-darpan-theatre",
      title: "Darpan Heritage Proscenium & Street Play Showcase",
      description:
        "Original multilingual stage productions examining contemporary urban memory, staged at the Central Block Quadrangle with full acoustic reinforcement.",
      category: "Cultural",
      clubName: "Darpan Theatre Collective",
      status: "PUBLISHED",
      venueId: "ven-quad",
      venueName: "Central Block Main Quadrangle",
      indoorBackupVenueId: "ven-auditorium",
      indoorBackupVenueName: "Main Auditorium — Audi Block",
      startsAt: new Date(now + 7 * day).toISOString(),
      endsAt: new Date(now + 7 * day + 3 * hour).toISOString(),
      registrationDeadline: new Date(now + 6.5 * day).toISOString(),
      eligibility: "Open to students, alumni, and registered external visitors",
      capacity: 400,
      confirmedCount: 312,
      waitlistCap: 30,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Media Studies",
      teamSize: 22,
      budgetRequested: 32000,
      budgetApproved: 32000,
      version: 1,
      createdAt: new Date(now - 2 * day).toISOString(),
    });

    this.events.set("evt-guest-colloquium", {
      id: "evt-guest-colloquium",
      title: "Distinguished Colloquium: Sovereign AI & Zero-Trust Systems",
      description:
        "Fireside lecture and technical Q&A on building verifiable cryptographic protocols, PBAC authorization architectures, and privacy-preserving campus platforms.",
      category: "Guest Lecture",
      clubName: "Centre for Research — Central Campus",
      status: "PUBLISHED",
      venueId: "ven-panel-1",
      venueName: "Panel Room & Seminar Hall — Block I",
      startsAt: new Date(now + 3.5 * day).toISOString(),
      endsAt: new Date(now + 3.5 * day + 2 * hour).toISOString(),
      registrationDeadline: new Date(now + 3 * day).toISOString(),
      eligibility: "Open to UG/PG students, scholars, and external researchers",
      capacity: 90,
      confirmedCount: 74,
      waitlistCap: 15,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 5,
      budgetRequested: 10000,
      budgetApproved: 10000,
      version: 1,
      createdAt: new Date(now - 2 * day).toISOString(),
    });

    this.events.set("evt-placement-grill", {
      id: "evt-placement-grill",
      title: "Daksh Placement Cell: Systems Design & Case Architecture Clinic",
      description:
        "Structured whiteboarding and live architecture review conducted with final-year placement coordinators and visiting engineering leads.",
      category: "Placement",
      clubName: "Placement & Career Guidance Cell",
      status: "PUBLISHED",
      venueId: "ven-audi-2",
      venueName: "Campus View Auditorium — Block II",
      startsAt: new Date(now + 8 * day).toISOString(),
      endsAt: new Date(now + 8 * day + 3 * hour).toISOString(),
      registrationDeadline: new Date(now + 7.5 * day).toISOString(),
      eligibility: "Final & Pre-final year CHRIST Central Campus students",
      capacity: 140,
      confirmedCount: 118,
      waitlistCap: 20,
      waitlistCount: 0,
      isExternalOpen: false,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Commerce & Management",
      teamSize: 8,
      budgetRequested: 8000,
      budgetApproved: 8000,
      version: 1,
      createdAt: new Date(now - day).toISOString(),
    });

    this.events.set("evt-pending-faculty", {
      id: "evt-pending-faculty",
      title: "CyberSecurity Red-Team CTF Sprint 2026",
      description:
        "Defend simulated university infrastructure against binary exploitation, OIDC token replay, and SQL concurrency attacks in a 12-hour Capture-The-Flag sprint.",
      category: "Technical",
      clubName: "Cybersecurity & Ethical Hacking Guild",
      status: "PENDING_FACULTY",
      venueId: "ven-audi-2",
      venueName: "Campus View Auditorium — Block II",
      startsAt: new Date(now + 5 * day).toISOString(),
      endsAt: new Date(now + 5 * day + 6 * hour).toISOString(),
      registrationDeadline: new Date(now + 4.5 * day).toISOString(),
      eligibility: "Open to CHRIST & external engineering students",
      capacity: 40,
      confirmedCount: 0,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 8,
      budgetRequested: 15000,
      version: 1,
      createdAt: new Date(now - 12 * hour).toISOString(),
    });

    this.events.set("evt-pending-dean", {
      id: "evt-pending-dean",
      title: "CHRIST National Model United Nations (MUN) — Central Chapter",
      description:
        "Three-committee diplomatic simulation addressing global AI safety treaties, maritime trade security, and climate finance frameworks.",
      category: "Competition",
      clubName: "International Relations & MUN Society",
      status: "PENDING_DEAN",
      venueId: "ven-auditorium",
      venueName: "Main Auditorium — Audi Block",
      startsAt: new Date(now + 6 * day).toISOString(),
      endsAt: new Date(now + 6 * day + 8 * hour).toISOString(),
      registrationDeadline: new Date(now + 5.5 * day).toISOString(),
      eligibility: "Open to collegiate delegates nationwide",
      capacity: 80,
      confirmedCount: 0,
      waitlistCap: 15,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 250,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      teamSize: 15,
      budgetRequested: 35000,
      version: 1,
      createdAt: new Date(now - 18 * hour).toISOString(),
    });
  }

  listVenues(): VenueRecord[] {
    return Array.from(this.venues.values());
  }

  getVenue(id: string): VenueRecord | undefined {
    return this.venues.get(id);
  }

  getEvent(id: string): EventRecord | undefined {
    return this.events.get(id);
  }

  listEvents(filters?: {
    status?: string;
    category?: string;
    isExternalOnly?: boolean;
    search?: string;
  }): EventRecord[] {
    let list = Array.from(this.events.values());
    if (filters?.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.category && filters.category !== "All") {
      list = list.filter(
        (e) => e.category.toLowerCase() === filters.category!.toLowerCase(),
      );
    }
    if (filters?.isExternalOnly) {
      list = list.filter((e) => e.isExternalOpen === true);
    }
    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          (e.clubName && e.clubName.toLowerCase().includes(q)),
      );
    }
    return list;
  }

  inspectVenueClash(
    venueId: string,
    startsAt: string,
    endsAt: string,
    excludeEventId?: string,
  ) {
    const startMs = Date.now();
    const newStart = new Date(startsAt).getTime();
    const newEnd = new Date(endsAt).getTime();
    const venue = this.venues.get(venueId);

    const conflicts: Array<{
      id: string;
      title: string;
      startsAt: string;
      endsAt: string;
      status: string;
    }> = [];

    for (const evt of this.events.values()) {
      if (excludeEventId && evt.id === excludeEventId) continue;
      if (
        evt.venueId !== venueId ||
        evt.status === "CANCELLED" ||
        evt.status === "REJECTED"
      ) {
        continue;
      }

      const existStart = new Date(evt.startsAt).getTime();
      const existEnd = new Date(evt.endsAt).getTime();

      if (newStart < existEnd && newEnd > existStart) {
        conflicts.push({
          id: evt.id,
          title: evt.title,
          startsAt: evt.startsAt,
          endsAt: evt.endsAt,
          status: evt.status,
        });
      }
    }

    const startDate = new Date(startsAt);
    const month = startDate.getUTCMonth();
    const dayOfMonth = startDate.getUTCDate();
    const examBlackoutWarning =
      (month === 11 && dayOfMonth <= 15) || (month === 3 && dayOfMonth >= 15)
        ? "Falls near End-Semester Examination window — requires Controller of Examinations clearance."
        : null;

    return {
      venueId,
      venueName: venue?.name || venueId,
      isOutdoor: Boolean(venue?.isOutdoor),
      requiresIndoorBackup: Boolean(venue?.isOutdoor),
      hasClash: conflicts.length > 0,
      conflictingEvents: conflicts,
      examBlackoutWarning,
      checkedInMs: Date.now() - startMs,
    };
  }

  checkVenueClash(
    venueId: string,
    startsAt: string,
    endsAt: string,
    excludeEventId?: string,
  ): boolean {
    return this.inspectVenueClash(venueId, startsAt, endsAt, excludeEventId)
      .hasClash;
  }

  createProposal(data: {
    title: string;
    description: string;
    category?: string;
    clubName?: string;
    venueId: string;
    indoorBackupVenueId?: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    waitlistCap?: number;
    budget: number;
    teamSize: number;
    isExternalOpen?: boolean;
    fee?: number;
    eligibility?: string;
    organizerSub: string;
    department: string;
    attachment?: { name: string; sizeBytes: number; mimeType: string };
  }): EventRecord {
    if (
      !data.title ||
      !data.description ||
      !data.venueId ||
      data.budget === undefined ||
      !data.teamSize
    ) {
      throw new Error(
        "Missing required proposal fields (Title, Description, Venue, Budget, Team Size)",
      );
    }

    const startMs = new Date(data.startsAt).getTime();
    const endMs = new Date(data.endsAt).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
      throw new Error("End time must be after start time");
    }

    const venue = this.venues.get(data.venueId);
    if (venue?.isOutdoor && !data.indoorBackupVenueId) {
      throw new Error(
        "Outdoor Central Campus venues require an indoor monsoon backup venue",
      );
    }

    if (data.attachment) {
      if (data.attachment.sizeBytes > 5 * 1024 * 1024) {
        throw new Error("Attachment size exceeds maximum limit of 5MB");
      }
      const allowedMimes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/zip",
      ];
      if (!allowedMimes.includes(data.attachment.mimeType)) {
        throw new Error(
          `Invalid attachment MIME type: ${data.attachment.mimeType}`,
        );
      }
    }

    if (this.checkVenueClash(data.venueId, data.startsAt, data.endsAt)) {
      throw new Error("Venue is already reserved during this time slot");
    }

    const backupVenue = data.indoorBackupVenueId
      ? this.venues.get(data.indoorBackupVenueId)
      : undefined;

    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newEvent: EventRecord = {
      id,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || "Technical",
      clubName: data.clubName || `${data.department} Association`,
      status: "PENDING_FACULTY",
      venueId: data.venueId,
      venueName: venue?.name || "Main Auditorium — Audi Block",
      indoorBackupVenueId: data.indoorBackupVenueId,
      indoorBackupVenueName: backupVenue?.name,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      registrationDeadline: new Date(startMs - 3_600_000).toISOString(),
      eligibility:
        data.eligibility ||
        (data.isExternalOpen
          ? "Open to CHRIST students & external university participants"
          : "CHRIST University Central Campus students"),
      capacity: Math.max(1, Number(data.capacity) || 50),
      confirmedCount: 0,
      waitlistCap: Math.max(0, Number(data.waitlistCap ?? 10)),
      waitlistCount: 0,
      isExternalOpen: Boolean(data.isExternalOpen),
      fee: Math.max(0, Number(data.fee ?? 0)),
      organizerSub: data.organizerSub,
      department: data.department,
      teamSize: data.teamSize,
      version: 1,
      budgetRequested: Number(data.budget),
      createdAt: new Date().toISOString(),
    };

    this.events.set(id, newEvent);
    auditService.record({
      action: "PROPOSAL_SUBMITTED",
      actor: data.organizerSub,
      target: id,
      details: `Submitted "${newEvent.title}" (${newEvent.department}) requesting INR ${newEvent.budgetRequested}.`,
    });
    return newEvent;
  }

  approveFaculty(
    eventId: string,
    facultySub: string,
    dept: string,
  ): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (evt.status !== "PENDING_FACULTY") {
      throw new Error(
        `Event is not awaiting faculty approval (current status: ${evt.status})`,
      );
    }
    if (evt.department !== dept) {
      throw new Error(
        "Faculty cannot endorse events outside their own department",
      );
    }
    if (this.checkVenueClash(evt.venueId, evt.startsAt, evt.endsAt, evt.id)) {
      throw new Error(
        "Cannot endorse proposal: venue clash detected on selected time slot",
      );
    }

    evt.status = "PENDING_DEAN";
    evt.version += 1;

    auditService.record({
      action: "FACULTY_ENDORSED",
      actor: facultySub,
      target: eventId,
      details: `Departmental endorsement granted for "${evt.title}" (${dept}).`,
    });

    return evt;
  }

  approveDean(
    eventId: string,
    approvedBudget?: number,
    deanSub = "dean",
  ): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (evt.status !== "PENDING_DEAN") {
      throw new Error(
        `Event is not awaiting Dean approval (current status: ${evt.status})`,
      );
    }

    evt.status = "PUBLISHED";
    evt.budgetApproved = approvedBudget ?? evt.budgetRequested;
    evt.version += 1;

    auditService.record({
      action: "DEAN_APPROVED_PUBLISHED",
      actor: deanSub,
      target: eventId,
      details: `Cleared budget INR ${evt.budgetApproved ?? 0} and published "${evt.title}".`,
    });

    streamHub.broadcast("event.published", {
      eventId: evt.id,
      title: evt.title,
      venueName: evt.venueName,
    });

    return evt;
  }

  rejectEvent(
    eventId: string,
    reason: string,
    actorSub = "approver",
  ): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (!reason || reason.trim().length < 10) {
      throw new Error("Rejection reason must be at least 10 characters");
    }

    evt.status = "REJECTED";
    evt.rejectionReason = reason.trim();
    evt.version += 1;

    auditService.record({
      action: "PROPOSAL_REJECTED",
      actor: actorSub,
      target: eventId,
      details: `Rejected "${evt.title}": ${evt.rejectionReason}`,
    });

    return evt;
  }

  cancelEvent(
    eventId: string,
    reason?: string,
    actorSub = "organizer",
  ): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (evt.status === "CANCELLED") {
      throw new Error("Event is already cancelled");
    }

    evt.status = "CANCELLED";
    evt.rejectionReason = reason?.trim() || "Cancelled by governance authority";
    evt.lastUpdateBanner = `EVENT CANCELLED: ${evt.rejectionReason}`;
    evt.version += 1;

    auditService.record({
      action: "EVENT_CANCELLED",
      actor: actorSub,
      target: eventId,
      details: `Cancelled "${evt.title}" and released venue ${evt.venueName}. Reason: ${evt.rejectionReason}`,
    });

    streamHub.broadcast("announcement.broadcast", {
      eventId: evt.id,
      eventTitle: evt.title,
      senderSub: actorSub,
      message: `Cancellation Notice — ${evt.title}: ${evt.rejectionReason}`,
      dispatchedAt: new Date().toISOString(),
      recipientsMasked: true,
    });

    return evt;
  }

  private volunteers = new Map<
    string,
    Array<{ studentSub: string; roleTitle: string; assignedAt: string }>
  >([
    [
      "evt-hackathon-100",
      [
        {
          studentSub: "2440315",
          roleTitle: "Main Auditorium Gate-A QR Marshal",
          assignedAt: new Date(Date.now() - 86_400_000).toISOString(),
        },
      ],
    ],
  ]);

  assignVolunteer(
    eventId: string,
    studentSub: string,
    roleTitle: string,
    assignedBySub: string,
  ) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (!studentSub || !studentSub.trim()) {
      throw new Error("Student Register Number or ID is required");
    }
    const current = this.volunteers.get(eventId) || [];
    const cleanSub = studentSub.trim();
    const cleanRole = (roleTitle || "QR Gate Marshal").trim();

    const existingIdx = current.findIndex((v) => v.studentSub === cleanSub);
    const assignment = {
      studentSub: cleanSub,
      roleTitle: cleanRole,
      assignedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      current[existingIdx] = assignment;
    } else {
      current.push(assignment);
    }
    this.volunteers.set(eventId, current);

    auditService.record({
      action: "VOLUNTEER_DELEGATED",
      actor: assignedBySub,
      target: `${eventId}:${cleanSub}`,
      details: `Delegated ${cleanRole} scanner access for "${evt.title}".`,
    });

    return {
      eventId,
      studentSub: cleanSub,
      roleTitle: cleanRole,
      assignedAt: assignment.assignedAt,
      status: "ASSIGNED",
    };
  }

  getVolunteers(eventId: string) {
    return this.volunteers.get(eventId) || [];
  }

  sendBroadcast(
    eventId: string,
    message: string,
    senderSub: string,
    recipientCount?: number,
  ) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (!message || message.trim().length === 0) {
      throw new Error("Broadcast message cannot be empty");
    }

    const cleanMessage = message.trim();
    evt.lastUpdateBanner = cleanMessage;

    const res = {
      eventId,
      eventTitle: evt.title,
      senderSub,
      message: cleanMessage,
      recipientCount:
        recipientCount ?? Math.max(1, evt.confirmedCount + evt.waitlistCount),
      dispatchedAt: new Date().toISOString(),
      recipientsMasked: true,
      channels: ["EMAIL", "SSE_STREAM"],
    };

    auditService.record({
      action: "BROADCAST_DISPATCHED",
      actor: senderSub,
      target: eventId,
      details: `BCC-masked announcement sent to ${res.recipientCount} registrants of "${evt.title}".`,
    });

    streamHub.broadcast("announcement.broadcast", res);

    return res;
  }

  getGallery(category?: string) {
    const galleryItems = [
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
      {
        id: "gal-07",
        title: "Main Auditorium Flagship Symposium & Parliamentary Conclave",
        festName: "Blossoms & MUN",
        venueName: "Main Auditorium — Audi Block",
        year: 2026,
        imageUrl: "/media/auditorium-keynote-conclave.jpg",
        thumbnailUrl: "/media/auditorium-keynote-conclave.jpg",
        category: "Theatre",
        aspectRatio: "16:9",
        sizeKb: 54,
        accentColor: "#FF4D1C",
        caption:
          "Tungsten stage illumination inside the 1,800-seat Main Auditorium during inter-deanery finals.",
      },
      {
        id: "gal-08",
        title: "South Gate Floodlit Inter-Deanery Futsal Championship",
        festName: "Chancellor's Shield",
        venueName: "Central Campus Floodlit Turf & Arena",
        year: 2026,
        imageUrl: "/media/southgate-floodlit-futsal.jpg",
        thumbnailUrl: "/media/southgate-floodlit-futsal.jpg",
        category: "Sports",
        aspectRatio: "16:9",
        sizeKb: 111,
        accentColor: "#2EE59D",
        caption:
          "Knockout 5-a-side futsal action under the South Gate stadium floodlights.",
      },
    ];

    if (category && category !== "All") {
      return galleryItems.filter(
        (g) => g.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return galleryItems;
  }

  private userBookmarks = new Map<string, Set<string>>([
    [
      "01927500-0001-7000-8000-000000000001",
      new Set(["evt-hackathon-100", "evt-blossoms-dance"]),
    ],
  ]);

  getBookmarks(userSub: string) {
    const ids = Array.from(this.userBookmarks.get(userSub) || []);
    return ids
      .map((id) => this.events.get(id))
      .filter((e): e is EventRecord => Boolean(e))
      .map((evt) => ({
        eventId: evt.id,
        title: evt.title,
        category: evt.category,
        venueName: evt.venueName,
        startsAt: evt.startsAt,
        isExternalOpen: evt.isExternalOpen,
      }));
  }

  toggleBookmark(userSub: string, eventId: string) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    const set = this.userBookmarks.get(userSub) || new Set<string>();
    let saved = false;
    if (set.has(eventId)) {
      set.delete(eventId);
      saved = false;
    } else {
      set.add(eventId);
      saved = true;
    }
    this.userBookmarks.set(userSub, set);
    return {
      eventId,
      saved,
      bookmarks: this.getBookmarks(userSub),
    };
  }

  getCampusLeaderboard() {
    return {
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
    };
  }

  getCampusPulse() {
    return [
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
    ];
  }

  private userXpLedger = new Map<
    string,
    {
      totalXp: number;
      badges: string[];
      history: Array<{ xp: number; reason: string; timestamp: string }>;
    }
  >([
    [
      "01927500-0001-7000-8000-000000000001",
      {
        totalXp: 450,
        badges: ["Central Concourse Pioneer", "Verified Pass Holder"],
        history: [
          {
            xp: 250,
            reason: "Completed Blossoms & ASCII orientation pass verification",
            timestamp: new Date(Date.now() - 172_800_000).toISOString(),
          },
          {
            xp: 200,
            reason: "Attended Distinguished Colloquium at Block I Panel Room",
            timestamp: new Date(Date.now() - 86_400_000).toISOString(),
          },
        ],
      },
    ],
  ]);

  awardXp(userSub: string, xp: number, reason: string) {
    const record = this.userXpLedger.get(userSub) || {
      totalXp: 450,
      badges: ["Verified Pass Holder"],
      history: [],
    };
    record.totalXp += xp;
    record.history.unshift({
      xp,
      reason,
      timestamp: new Date().toISOString(),
    });

    let newBadge: string | undefined;
    if (record.totalXp >= 500 && !record.badges.includes("Tech Explorer")) {
      record.badges.push("Tech Explorer");
      newBadge = "Tech Explorer";
    }
    if (
      record.totalXp >= 700 &&
      !record.badges.includes("Christite Laureate")
    ) {
      record.badges.push("Christite Laureate");
      newBadge = "Christite Laureate";
    }

    this.userXpLedger.set(userSub, record);
    return {
      userSub,
      awardedXp: xp,
      totalXp: record.totalXp,
      badges: record.badges,
      newBadgeUnlocked: newBadge,
    };
  }

  getUserGamification(userSub: string) {
    return (
      this.userXpLedger.get(userSub) || {
        totalXp: 450,
        badges: ["Verified Pass Holder"],
        history: [
          {
            xp: 450,
            reason: "CHRIST Central Campus initial semester standing",
            timestamp: new Date(Date.now() - 86_400_000).toISOString(),
          },
        ],
      }
    );
  }

  private eventFeedback = new Map<
    string,
    Array<{
      id: string;
      userSub: string;
      displayName: string;
      department: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>
  >([
    [
      "evt-hackathon-100",
      [
        {
          id: "fb-seed-1",
          userSub: "01927500-0001-7000-8000-000000000001",
          displayName: "Asha K.",
          department: "Computer Science",
          rating: 5,
          comment:
            "Zero gate queue with the 30-second rotating QR pass and rock-solid Wi-Fi across Main Auditorium.",
          createdAt: new Date(Date.now() - 72_000_000).toISOString(),
        },
        {
          id: "fb-seed-2",
          userSub: "01927500-0041-7000-8000-000000000041",
          displayName: "Pranav S.",
          department: "Data Science",
          rating: 5,
          comment:
            "Systems mentorship track and midnight Third Wave pour-over station made the 24-hour sprint unforgettable.",
          createdAt: new Date(Date.now() - 36_000_000).toISOString(),
        },
      ],
    ],
  ]);

  private maskDisplayName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "Attendee";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase() || ""}.`;
  }

  getEventFeedback(eventId: string) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    const list = this.eventFeedback.get(eventId) || [];
    const sum = list.reduce((acc, item) => acc + item.rating, 0);
    const averageRating =
      list.length > 0 ? Math.round((sum / list.length) * 10) / 10 : 5.0;
    return {
      eventId,
      averageRating,
      totalReviews: list.length,
      items: list.map(({ userSub: _sub, ...pub }) => pub),
    };
  }

  submitEventFeedback(params: {
    eventId: string;
    userSub: string;
    userName: string;
    department: string;
    rating: number;
    comment: string;
  }) {
    const evt = this.events.get(params.eventId);
    if (!evt) throw new Error("Event not found");

    const list = this.eventFeedback.get(params.eventId) || [];
    const masked = this.maskDisplayName(params.userName);
    const existingIdx = list.findIndex((i) => i.userSub === params.userSub);
    const entry = {
      id:
        existingIdx >= 0
          ? list[existingIdx].id
          : `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userSub: params.userSub,
      displayName: masked,
      department: params.department || "Central Campus",
      rating: params.rating,
      comment: params.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = entry;
    } else {
      list.unshift(entry);
    }
    this.eventFeedback.set(params.eventId, list);
    return this.getEventFeedback(params.eventId);
  }
}

export const eventsService = new EventsService();
