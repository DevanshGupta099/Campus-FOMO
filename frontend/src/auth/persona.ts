export interface PersonaConfig {
  id: string;
  role: string;
  name: string;
  email: string;
  department: string;
  institution: string;
  avatar: string;
  token: string;
  description: string;
}

export const DEMO_PERSONAS: PersonaConfig[] = [
  {
    id: "student-devansh",
    role: "STUDENT",
    name: "Devansh Gupta (Student)",
    email: "devansh.gupta@christuniversity.in",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University)",
    avatar: "🎓",
    token:
      "test-token:STUDENT:01927500-0001-7000-8000-000000000001:Computer Science",
    description:
      "Can register for all events, view passes, enter lucky draws, earn XP & badges",
  },
  {
    id: "guest-alex",
    role: "GUEST",
    name: "Alex Mathew (External Guest)",
    email: "alex.mathew@external.edu",
    department: "Information Technology",
    institution: "St. Joseph's College",
    avatar: "🌐",
    token:
      "test-token:GUEST:01927500-0002-7000-8000-000000000002:Information Technology",
    description:
      "Can discover and register for external-open campus events only",
  },
  {
    id: "event-head-priya",
    role: "EVENT_HEAD",
    name: "Priya Nair (Event Head)",
    email: "priya.nair@christuniversity.in",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University)",
    avatar: "⚡",
    token:
      "test-token:EVENT_HEAD:01927500-0003-7000-8000-000000000003:Computer Science",
    description:
      "Can submit proposals, delegate volunteers, manage capacity, and broadcast alerts",
  },
  {
    id: "volunteer-rahul",
    role: "VOLUNTEER",
    name: "Rahul Sharma (Door Volunteer)",
    email: "rahul.sharma@christuniversity.in",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University)",
    avatar: "📱",
    token:
      "test-token:VOLUNTEER:01927500-0004-7000-8000-000000000004:Computer Science",
    description:
      "Assigned QR scanner access for fast door entry validation (<500 ms)",
  },
  {
    id: "faculty-abraham",
    role: "FACULTY",
    name: "Dr. K. Abraham (Faculty Mentor)",
    email: "abraham.k@christuniversity.in",
    department: "Computer Science",
    institution: "CHRIST (Deemed to be University)",
    avatar: "🏛️",
    token:
      "test-token:FACULTY:01927500-0005-7000-8000-000000000005:Computer Science",
    description:
      "Reviews department proposals with automated venue clash prevention",
  },
  {
    id: "dean-george",
    role: "DEAN",
    name: "Fr. Dr. V. George (Dean of Students)",
    email: "dean.students@christuniversity.in",
    department: "Deanery of Student Affairs",
    institution: "CHRIST (Deemed to be University)",
    avatar: "👑",
    token:
      "test-token:DEAN:01927500-0006-7000-8000-000000000006:Deanery of Student Affairs",
    description:
      "Campus-wide executive budget clearance, publishes approved events",
  },
  {
    id: "sponsor-thirdwave",
    role: "SPONSOR",
    name: "Third Wave Coffee Campus Lounge",
    email: "campus.lounge@thirdwavecoffee.in",
    department: "Sponsorship & Partnerships",
    institution: "Third Wave Coffee Roasters",
    avatar: "☕",
    token:
      "test-token:SPONSOR:01927500-0007-7000-8000-000000000007:Sponsorship & Partnerships",
    description:
      "Brand showcase, student discount vouchers, and sponsored lucky draws (zero student PII)",
  },
  {
    id: "admin-system",
    role: "ADMIN",
    name: "System Governance Administrator",
    email: "admin@christuniversity.in",
    department: "Centre for Digital Innovation",
    institution: "CHRIST (Deemed to be University)",
    avatar: "🛡️",
    token:
      "test-token:ADMIN:01927500-0008-7000-8000-000000000008:Centre for Digital Innovation",
    description:
      "Full PBAC client permissions, audit logs, emergency cancellations",
  },
];
