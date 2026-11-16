export interface UserProfile {
  id: string;
  sub: string;
  email: string;
  phone: string | null;
  name: string;
  role: string;
  studentRegisterNumber?: string | null;
  department?: string | null;
  institution?: string | null;
  year?: number | null;
  xp?: number;
  permissions: string[];
  createdAt?: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserProfile;
}

export interface DemoPersonaSummary {
  email: string;
  name: string;
  roleLabel: string;
  department: string;
  summary: string;
}

export interface ScreenItem {
  key: string;
  path: string;
  title: string;
  section: "events" | "management" | "approvals" | "sponsors" | "admin";
  icon: string;
  requiredPermissions: string[];
  matchMode: "any" | "all";
}

export interface VenueItem {
  id: string;
  name: string;
  block: string;
  location: string;
  capacity: number;
  isOutdoor: boolean;
  resources: string[];
}

export interface EventItem {
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
  lastUpdateBanner?: string;
  createdAt: string;
}

export interface ClashReport {
  venueId: string;
  venueName: string;
  isOutdoor: boolean;
  requiresIndoorBackup: boolean;
  hasClash: boolean;
  conflictingEvents: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    status: string;
  }>;
  examBlackoutWarning: string | null;
  checkedInMs: number;
}

export interface RegistrationItem {
  id: string;
  eventId: string;
  userSub: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  waitlistPosition?: number;
  isGuest: boolean;
  guestInstitution?: string;
  createdAt: string;
  eventTitle?: string;
  venueName?: string;
  startsAt?: string;
  endsAt?: string;
  category?: string;
  fee?: number;
  lastUpdateBanner?: string;
}

export interface AttendeeRosterItem {
  id: string;
  eventId: string;
  userSub: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  waitlistPosition?: number;
  isGuest: boolean;
  guestInstitution?: string;
  createdAt: string;
}

export interface RotatingQrResponse {
  registrationId: string;
  qrToken: string;
  expiresInSeconds: number;
}

export interface CheckinScanResult {
  status: "ADMITTED" | "ALREADY_CHECKED_IN" | "INVALID_TICKET";
  registrationId: string;
  userName: string;
  eventTitle?: string;
  scannedAt: string;
  latencyMs: number;
  message: string;
}

export interface CheckinStatsResponse {
  totalAdmitted: number;
  recentAdmissions: Array<{
    registrationId: string;
    firstName: string;
    eventTitle: string;
    scannedAt: string;
  }>;
}

export interface LuckyCampaignItem {
  id: string;
  eventId: string;
  title: string;
  prizeDescription?: string;
  sponsorBrand?: string;
  status: "OPEN" | "DRAWN" | "CLAIMED" | "REDRAWN";
  seedHash: string;
  seedRevealed?: string;
  winnerSub?: string;
  winnerName?: string;
  winnerDept?: string;
  winnerIndex?: number;
  totalEntries: number;
  claimDeadline?: string;
  createdAt: string;
}

export interface LuckyVerificationProof {
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

export interface GalleryItem {
  id: string;
  title: string;
  festName?: string;
  venueName?: string;
  year?: number;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  aspectRatio: "16:9" | "4:3" | "1:1" | string;
  sizeKb: number;
  accentColor?: string;
  caption?: string;
}

export interface SponsorShowcase {
  brand: string;
  tagline: string;
  location: string;
  hours: string;
  studentPerk: string;
  menuHighlights: Array<{
    name: string;
    price: number;
    studentPrice: number;
  }>;
  activeCampaigns: Array<{
    id: string;
    title: string;
    prize: string;
  }>;
}

export interface SponsorAnalytics {
  sponsorName: string;
  totalImpressions: number;
  bannerClickThroughs: number;
  voucherClaims: number;
  privacyNote: string;
}

export interface GamificationLedger {
  userSub: string;
  totalXp: number;
  badges: string[];
  history: Array<{
    xp: number;
    reason: string;
    timestamp: string;
  }>;
}

export interface RbacMatrixResponse {
  availablePermissions: string[];
  roles: Record<string, string[]>;
}

export interface AuditLogItem {
  id?: string;
  action: string;
  actor: string;
  target: string;
  details?: string;
  timestamp: string;
}

export interface OpsTelemetry {
  uptimeSeconds: number;
  totalEvents: number;
  publishedEvents: number;
  pendingFacultyCount: number;
  pendingDeanCount: number;
  totalConfirmedSeats: number;
  totalWaitlisted: number;
  sseSeq: number;
  campus: string;
  timestamp: string;
}

export interface BookmarkItem {
  eventId: string;
  title: string;
  category: string;
  venueName: string;
  startsAt: string;
  isExternalOpen: boolean;
}

export interface CampusLeaderboard {
  deaneries: Array<{
    rank: number;
    deanery: string;
    totalXp: number;
    activePasses: number;
    badge: string;
  }>;
  topParticipants: Array<{
    rank: number;
    displayName: string;
    department: string;
    xp: number;
    badgesCount: number;
  }>;
}

export interface CampusPulseItem {
  id: string;
  kind: string;
  label: string;
  venue: string;
  ago: string;
}

export interface EventFeedbackItem {
  id: string;
  displayName: string;
  department: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface EventFeedbackResponse {
  eventId: string;
  averageRating: number;
  totalReviews: number;
  items: EventFeedbackItem[];
}

export interface ParticipationCertificate {
  certificateId: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  category: string;
  venueName: string;
  holderName: string;
  affiliation: string;
  issuedAt: string;
  xpCredited: number;
  verificationHash: string;
}
