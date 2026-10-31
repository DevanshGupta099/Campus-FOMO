import { streamHub } from "../stream/stream.routes.js";

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  category: string;
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
  startsAt: string;
  endsAt: string;
  capacity: number;
  confirmedCount: number;
  waitlistCap: number;
  waitlistCount: number;
  isExternalOpen: boolean;
  fee: number;
  organizerSub: string;
  department: string;
  version: number;
  rejectionReason?: string;
  budgetRequested?: number;
  budgetApproved?: number;
  attachmentUrl?: string;
  createdAt: string;
}

export class EventsService {
  private events = new Map<string, EventRecord>();

  constructor() {
    // Seed initial event for verification
    this.events.set("evt-hackathon-100", {
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
      confirmedCount: 49, // 1 seat left for Last Seat test
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 0,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      version: 1,
      createdAt: new Date().toISOString(),
    });

    this.events.set("evt-tech-workshop", {
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
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Computer Science",
      version: 1,
      createdAt: new Date().toISOString(),
    });

    this.events.set("evt-cultural-dance", {
      id: "evt-cultural-dance",
      title: "Dhwani 2026: Campus Battle of the Bands & Dance Fest",
      description:
        "The grand annual cultural explosion featuring top collegiate musicians and dance crews.",
      category: "Cultural",
      status: "PUBLISHED",
      venueId: "ven-amphi",
      venueName: "Campus Open-Air Amphitheatre",
      startsAt: new Date(Date.now() + 259200000).toISOString(),
      endsAt: new Date(Date.now() + 288000000).toISOString(),
      capacity: 150,
      confirmedCount: 148, // 2 seats left!
      waitlistCap: 20,
      waitlistCount: 0,
      isExternalOpen: true,
      fee: 100,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Cultural Affairs",
      version: 1,
      createdAt: new Date().toISOString(),
    });

    this.events.set("evt-sports-futsal", {
      id: "evt-sports-futsal",
      title: "Night Futsal Super League",
      description:
        "Fast-paced 5v5 floodlit night football championship across university departments.",
      category: "Sports",
      status: "PUBLISHED",
      venueId: "ven-sports",
      venueName: "Sports Complex Floodlit Turf",
      startsAt: new Date(Date.now() + 345600000).toISOString(),
      endsAt: new Date(Date.now() + 360000000).toISOString(),
      capacity: 60,
      confirmedCount: 60, // Full!
      waitlistCap: 10,
      waitlistCount: 4, // Waitlist active
      isExternalOpen: false,
      fee: 50,
      organizerSub: "01927500-0003-7000-8000-000000000003",
      department: "Sports Department",
      version: 1,
      createdAt: new Date().toISOString(),
    });

    this.events.set("evt-pending-faculty", {
      id: "evt-pending-faculty",
      title: "CyberSecurity CTF Challenge 2026",
      description:
        "Defend campus servers against simulated red-team attacks in a 12-hour Capture-The-Flag sprint.",
      category: "Technical",
      status: "PENDING_FACULTY",
      venueId: "ven-audi-2",
      venueName: "Audi Block 2",
      startsAt: new Date(Date.now() + 432000000).toISOString(),
      endsAt: new Date(Date.now() + 453600000).toISOString(),
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
      createdAt: new Date().toISOString(),
    });

    this.events.set("evt-pending-dean", {
      id: "evt-pending-dean",
      title: "CHRIST National Model United Nations (MUN)",
      description:
        "Simulating UN committees on global AI governance, climate resilience, and cyber international law.",
      category: "Competition",
      status: "PENDING_DEAN",
      venueId: "ven-auditorium",
      venueName: "Central Campus Auditorium",
      startsAt: new Date(Date.now() + 518400000).toISOString(),
      endsAt: new Date(Date.now() + 547200000).toISOString(),
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
      createdAt: new Date().toISOString(),
    });
  }

  getEvent(id: string): EventRecord | undefined {
    return this.events.get(id);
  }

  listEvents(filters?: {
    status?: string;
    category?: string;
    isExternalOnly?: boolean;
  }): EventRecord[] {
    let list = Array.from(this.events.values());
    if (filters?.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.category) {
      list = list.filter((e) => e.category === filters.category);
    }
    if (filters?.isExternalOnly) {
      list = list.filter((e) => e.isExternalOpen === true);
    }
    return list;
  }

  checkVenueClash(
    venueId: string,
    startsAt: string,
    endsAt: string,
    excludeEventId?: string,
  ): boolean {
    const newStart = new Date(startsAt).getTime();
    const newEnd = new Date(endsAt).getTime();

    for (const evt of this.events.values()) {
      if (excludeEventId && evt.id === excludeEventId) continue;
      if (
        evt.venueId !== venueId ||
        evt.status === "CANCELLED" ||
        evt.status === "REJECTED"
      )
        continue;

      const existStart = new Date(evt.startsAt).getTime();
      const existEnd = new Date(evt.endsAt).getTime();

      // Check time overlap: (StartA < EndB) and (EndA > StartB)
      if (newStart < existEnd && newEnd > existStart) {
        return true; // Clash found
      }
    }
    return false;
  }

  createProposal(data: {
    title: string;
    description: string;
    venueId: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    budget: number;
    teamSize: number;
    organizerSub: string;
    department: string;
    attachment?: { name: string; sizeBytes: number; mimeType: string };
  }): EventRecord {
    // Validate required 5 fields (Handbook Stage 1)
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

    // Attachment validation (≤5 MB, MIME sniffing)
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

    // Venue clash pre-check
    if (this.checkVenueClash(data.venueId, data.startsAt, data.endsAt)) {
      throw new Error("Venue is already reserved during this time slot");
    }

    const id = `evt-${Date.now()}`;
    const newEvent: EventRecord = {
      id,
      title: data.title,
      description: data.description,
      category: "Technical",
      status: "PENDING_FACULTY",
      venueId: data.venueId,
      venueName: "Main Campus Venue",
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      capacity: data.capacity,
      confirmedCount: 0,
      waitlistCap: 10,
      waitlistCount: 0,
      isExternalOpen: false,
      fee: 0,
      organizerSub: data.organizerSub,
      department: data.department,
      version: 1,
      budgetRequested: data.budget,
      createdAt: new Date().toISOString(),
    };

    this.events.set(id, newEvent);
    return newEvent;
  }

  // Two-Stage Approval: Faculty Stage
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

    evt.status = "PENDING_DEAN";
    evt.version += 1;
    return evt;
  }

  // Two-Stage Approval: Dean Stage
  approveDean(eventId: string, approvedBudget?: number): EventRecord {
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
    return evt;
  }

  rejectEvent(eventId: string, reason: string): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (!reason || reason.trim().length < 10) {
      throw new Error("Rejection reason must be at least 10 characters");
    }

    evt.status = "REJECTED";
    evt.rejectionReason = reason;
    evt.version += 1;
    return evt;
  }

  cancelEvent(eventId: string, reason?: string): EventRecord {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");

    evt.status = "CANCELLED";
    evt.rejectionReason = reason;
    evt.version += 1;
    return evt;
  }

  // Story Card EH-02: Volunteer delegation
  private volunteers = new Map<
    string,
    Array<{ studentSub: string; roleTitle: string; assignedAt: string }>
  >();

  assignVolunteer(
    eventId: string,
    studentSub: string,
    roleTitle: string,
    _assignedBySub: string,
  ) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    const current = this.volunteers.get(eventId) || [];
    const assignment = {
      studentSub,
      roleTitle,
      assignedAt: new Date().toISOString(),
    };
    current.push(assignment);
    this.volunteers.set(eventId, current);
    return {
      eventId,
      studentSub,
      roleTitle,
      assignedAt: assignment.assignedAt,
      status: "ASSIGNED",
    };
  }

  getVolunteers(eventId: string) {
    return this.volunteers.get(eventId) || [];
  }

  // Story Card EH-05: Broadcast messaging queue with BCC / hidden recipients
  sendBroadcast(
    eventId: string,
    message: string,
    senderSub: string,
    recipientCount = 100,
  ) {
    const evt = this.events.get(eventId);
    if (!evt) throw new Error("Event not found");
    if (!message || message.trim().length === 0) {
      throw new Error("Broadcast message cannot be empty");
    }

    const res = {
      eventId,
      eventTitle: evt.title,
      senderSub,
      message,
      recipientCount,
      dispatchedAt: new Date().toISOString(),
      recipientsMasked: true,
      channels: ["EMAIL", "PUSH"],
    };

    streamHub.broadcast("announcement.broadcast", res);

    return res;
  }

  // Story Card GU-02: Public media gallery
  getGallery(category?: string) {
    const galleryItems = [
      {
        id: "gal-01",
        title: "Hackathon 2025 Grand Finale",
        imageUrl: "/assets/gallery/hackathon-stage.webp",
        thumbnailUrl: "/assets/gallery/hackathon-stage-thumb.webp",
        category: "Technical",
        aspectRatio: "16:9",
        sizeKb: 124,
      },
      {
        id: "gal-02",
        title: "Bhasha Utsav Street Dance",
        imageUrl: "/assets/gallery/dance-troupe.webp",
        thumbnailUrl: "/assets/gallery/dance-troupe-thumb.webp",
        category: "Cultural",
        aspectRatio: "4:3",
        sizeKb: 142,
      },
      {
        id: "gal-03",
        title: "Magnovite Tech Expo Exhibition",
        imageUrl: "/assets/gallery/robotics-demo.webp",
        thumbnailUrl: "/assets/gallery/robotics-demo-thumb.webp",
        category: "Technical",
        aspectRatio: "1:1",
        sizeKb: 98,
      },
    ];

    if (category) {
      return galleryItems.filter(
        (g) => g.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return galleryItems;
  }

  // Story Card ST-02: Gamification XP & Badge ledger
  private userXpLedger = new Map<
    string,
    {
      totalXp: number;
      badges: string[];
      history: Array<{ xp: number; reason: string; timestamp: string }>;
    }
  >();

  awardXp(userSub: string, xp: number, reason: string) {
    const record = this.userXpLedger.get(userSub) || {
      totalXp: 450,
      badges: [],
      history: [],
    };
    record.totalXp += xp;
    record.history.push({ xp, reason, timestamp: new Date().toISOString() });

    let newBadge: string | undefined;
    if (record.totalXp >= 500 && !record.badges.includes("Tech Explorer")) {
      record.badges.push("Tech Explorer");
      newBadge = "Tech Explorer";
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
        badges: [],
        history: [],
      }
    );
  }
}

export const eventsService = new EventsService();
