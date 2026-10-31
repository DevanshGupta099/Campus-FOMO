export interface HealthResponse {
  status: "ok";
  version: string;
  uptime: number;
  timestamp: string;
}

export type UserRole =
  | "GUEST"
  | "STUDENT"
  | "EVENT_HEAD"
  | "VOLUNTEER"
  | "FACULTY"
  | "DEAN"
  | "SPONSOR"
  | "ADMIN";

export interface UserProfile {
  id: string;
  sub: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  department?: string;
  institution?: string;
  xp: number;
  permissions: string[];
}

export interface NavigationScreen {
  key: string;
  path: string;
  title: string;
  section: "events" | "management" | "approvals" | "sponsors" | "admin";
  icon: string;
  badge?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category:
    | "Technical"
    | "Cultural"
    | "Sports"
    | "Workshop"
    | "Hackathon"
    | "Guest Lecture"
    | "Competition"
    | "Placement";
  status:
    | "DRAFT"
    | "PENDING_FACULTY"
    | "PENDING_DEAN"
    | "PUBLISHED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";
  venueId: string;
  venueName?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  confirmedCount: number;
  waitlistCap: number;
  waitlistCount: number;
  isExternalOpen: boolean;
  fee: number;
  bannerUrl?: string;
  version: number;
}

export interface RegistrationItem {
  id: string;
  eventId: string;
  userId: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  waitlistPosition?: number;
  ticketQrToken?: string;
  createdAt: string;
}

export interface LuckyDrawCampaign {
  id: string;
  eventId: string;
  title: string;
  status: "OPEN" | "DRAWN" | "CLAIMED" | "REDRAWN";
  seedHash: string;
  seedRevealed?: string;
  winnerRegistrationId?: string;
  winnerName?: string;
  winnerDept?: string;
  claimDeadline?: string;
  totalEntries?: number;
}

export interface SponsorShowcase {
  brand: string;
  tagline: string;
  location: string;
  hours: string;
  studentPerk: string;
  menuHighlights: Array<{ name: string; price: number; studentPrice: number }>;
  activeCampaigns: Array<{ id: string; title: string; prize: string }>;
}

export interface SponsorAnalytics {
  sponsorName: string;
  totalImpressions: number;
  bannerClickThroughs: number;
  voucherClaims: number;
  privacyNote: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  likes: number;
}

export interface DrawVerification {
  campaignId: string;
  seedHash: string;
  seedRevealed: string;
  isSeedValid: boolean;
  totalEntries: number;
  winnerIndex: number;
  isWinnerIndexExact: boolean;
  winnerFirstname?: string;
  winnerDepartment?: string;
  verificationFormula: string;
}

export interface ScanResult {
  status: "VERIFIED" | "ALREADY_CHECKED_IN" | "INVALID";
  message: string;
  attendeeName?: string;
  department?: string;
  admittedAt?: string;
}
