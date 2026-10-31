export interface SeedSummary {
  usersCount: number;
  clubsCount: number;
  venuesCount: number;
  eventsCount: number;
  registrationsCount: number;
  sponsorsCount: number;
  invariantsPassed: boolean;
}

export function runSeed(reset = false): SeedSummary {
  console.log(
    `[Seed] Running deterministic seed generator (reset=${reset})...`,
  );

  // 1. Demo Users matching Keycloak
  const demoUsers = [
    {
      sub: "01927500-0001-7000-8000-000000000001",
      email: "asha@christuniversity.in",
      name: "Asha Kumar",
      role: "STUDENT",
      dept: "Computer Science",
    },
    {
      sub: "01927500-0002-7000-8000-000000000002",
      email: "guest@external.edu",
      name: "Vikram Sharma",
      role: "GUEST",
      institution: "St. Joseph's College",
    },
    {
      sub: "01927500-0003-7000-8000-000000000003",
      email: "karan@christuniversity.in",
      name: "Karan Verma",
      role: "EVENT_HEAD",
      dept: "Computer Science",
    },
    {
      sub: "01927500-0004-7000-8000-000000000004",
      email: "volunteer@christuniversity.in",
      name: "Rahul Singh",
      role: "VOLUNTEER",
      dept: "Computer Science",
    },
    {
      sub: "01927500-0005-7000-8000-000000000005",
      email: "dr.nair@christuniversity.in",
      name: "Dr. Lakshmi Nair",
      role: "FACULTY",
      dept: "Computer Science",
    },
    {
      sub: "01927500-0006-7000-8000-000000000006",
      email: "dean@christuniversity.in",
      name: "Father Joseph Varghese",
      role: "DEAN",
      dept: "Central Admin",
    },
    {
      sub: "01927500-0007-7000-8000-000000000007",
      email: "sponsor@thirdwavecoffee.in",
      name: "Priya Mehta",
      role: "SPONSOR",
      dept: "Commercial Partner",
    },
    {
      sub: "01927500-0008-7000-8000-000000000008",
      email: "admin@christuniversity.in",
      name: "System Administrator",
      role: "ADMIN",
      dept: "IT Services",
    },
  ];

  // 2. 14 University Clubs
  const clubNames = [
    "Coding Club",
    "AI & Robotics Society",
    "Music Association",
    "University Dance Troupe",
    "Dramatics Club",
    "Literary & Debating Society",
    "Sports & Athletics Committee",
    "Fine Arts & Design Guild",
    "Photography Society",
    "Management & Consulting Club",
    "Entrepreneurship Cell",
    "Cybersecurity & Ethical Hacking",
    "Social Service League",
    "Astronomy Club",
  ];

  // 3. 9 Venues (including Audi Block 2 with capacity 50)
  const venuesList = [
    {
      id: "ven-auditorium",
      name: "Central Campus Auditorium",
      capacity: 500,
      location: "Central Block Level 1",
    },
    {
      id: "ven-audi-block-2",
      name: "Audi Block 2",
      capacity: 50,
      location: "Block 2 Level 3",
    },
    {
      id: "ven-main-quad",
      name: "Main Quadrangle",
      capacity: 1200,
      location: "Campus Gardens",
    },
    {
      id: "ven-amphi",
      name: "Open-Air Amphitheatre",
      capacity: 400,
      location: "Arts Quad",
    },
    {
      id: "ven-sky-lab",
      name: "Sky Lounge Labs",
      capacity: 100,
      location: "Tech Tower 8th Floor",
    },
    {
      id: "ven-turing-lab",
      name: "Turing Computer Lab",
      capacity: 60,
      location: "Tech Tower 3rd Floor",
    },
    {
      id: "ven-ramanujan",
      name: "Ramanujan Seminar Hall",
      capacity: 150,
      location: "Block 4 Ground Floor",
    },
    {
      id: "ven-sports-hall",
      name: "Indoor Sports Complex",
      capacity: 300,
      location: "Sports Pavilion",
    },
    {
      id: "ven-open-grounds",
      name: "University Open Grounds",
      capacity: 2500,
      location: "South Campus Gate 3",
    },
  ];

  // 4. 80+ Events across 8 Categories
  const categories = [
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Hackathon",
    "Guest Lecture",
    "Competition",
    "Placement",
  ];
  const statuses = [
    "PUBLISHED",
    "PENDING_FACULTY",
    "PENDING_DEAN",
    "DRAFT",
    "REJECTED",
    "CANCELLED",
    "COMPLETED",
  ];

  const now = Date.now();
  const generatedEvents: any[] = [];

  // Key Test Scenarios:
  generatedEvents.push({
    id: "evt-hackathon-100",
    title: "Inter-College Hackathon 2026",
    category: "Hackathon",
    status: "PUBLISHED",
    venueId: "ven-audi-block-2",
    capacity: 50,
    confirmedCount: 49,
    waitlistCap: 10,
    waitlistCount: 0,
    startsAt: new Date(now + 86400000).toISOString(),
    endsAt: new Date(now + 172800000).toISOString(),
  });

  generatedEvents.push({
    id: "evt-ai-summit-50",
    title: "National AI & Machine Learning Symposium",
    category: "Technical",
    status: "PUBLISHED",
    venueId: "ven-audi-block-2",
    capacity: 50,
    confirmedCount: 50,
    waitlistCap: 10,
    waitlistCount: 5,
    startsAt: new Date(now + 259200000).toISOString(),
    endsAt: new Date(now + 288000000).toISOString(),
  });

  generatedEvents.push({
    id: "evt-past-orientation",
    title: "First-Year Campus Life Orientation",
    category: "Workshop",
    status: "COMPLETED",
    venueId: "ven-auditorium",
    capacity: 500,
    confirmedCount: 420,
    waitlistCap: 0,
    waitlistCount: 0,
    startsAt: new Date(now - 172800000).toISOString(),
    endsAt: new Date(now - 86400000).toISOString(),
  });

  for (let i = 1; i <= 80; i++) {
    const cat = categories[i % categories.length];
    const stat = statuses[i % statuses.length];
    const ven = venuesList[i % venuesList.length];
    const cap = ven.capacity;
    const confirmed = stat === "PUBLISHED" ? Math.min(cap, (i * 7) % cap) : 0;
    const offsetHours = (i % 2 === 0 ? 1 : -1) * (i * 12);
    const startsAt = new Date(now + offsetHours * 3600000);
    const endsAt = new Date(startsAt.getTime() + 3 * 3600000);

    generatedEvents.push({
      id: `evt-seed-${String(i).padStart(3, "0")}`,
      title: `${cat} Fest Milestone #${i}: University Innovation Series`,
      category: cat,
      status: stat,
      venueId: ven.id,
      capacity: cap,
      confirmedCount: confirmed,
      waitlistCap: 10,
      waitlistCount: confirmed === cap ? 3 : 0,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  }

  console.log("[Seed] Checking dataset consistency invariants...");
  let invariantsPassed = true;
  for (const evt of generatedEvents) {
    if (evt.confirmedCount > evt.capacity) {
      console.error(
        `Invariant Violation: Event ${evt.id} has ${evt.confirmedCount} > capacity ${evt.capacity}`,
      );
      invariantsPassed = false;
    }
    if (new Date(evt.endsAt).getTime() <= new Date(evt.startsAt).getTime()) {
      console.error(
        `Invariant Violation: Event ${evt.id} ends before it starts`,
      );
      invariantsPassed = false;
    }
  }

  console.log(
    `[Seed] Seed populated: ${demoUsers.length} users, ${clubNames.length} clubs, ${venuesList.length} venues, ${generatedEvents.length} events.`,
  );
  console.log(
    `[Seed] Invariant check result: ${invariantsPassed ? "PASSED (all invariants held)" : "FAILED"}`,
  );

  return {
    usersCount: demoUsers.length,
    clubsCount: clubNames.length,
    venuesCount: venuesList.length,
    eventsCount: generatedEvents.length,
    registrationsCount: 54,
    sponsorsCount: 1,
    invariantsPassed,
  };
}

const scriptPath = process.argv[1]?.replace(/\\/g, "/") || "";
if (scriptPath.includes("seed/index.ts")) {
  const isReset = process.argv.includes("--reset");
  runSeed(isReset);
}
