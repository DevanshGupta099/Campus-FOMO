import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  sub: text("sub").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("GUEST"),
  department: text("department"),
  institution: text("institution"),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  resources: text("resources").array(),
  isActive: boolean("is_active").notNull().default(true),
});

export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  leadSub: text("lead_sub").notNull(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("DRAFT"),
    venueId: uuid("venue_id").references(() => venues.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    capacity: integer("capacity").notNull(),
    confirmedCount: integer("confirmed_count").notNull().default(0),
    waitlistCap: integer("waitlist_cap").notNull().default(10),
    waitlistCount: integer("waitlist_count").notNull().default(0),
    isExternalOpen: boolean("is_external_open").notNull().default(false),
    fee: integer("fee").notNull().default(0),
    organizerSub: text("organizer_sub").notNull(),
    department: text("department").notNull(),
    version: integer("version").notNull().default(1),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    capacityCheck: check(
      "capacity_check",
      sql`${table.confirmedCount} <= ${table.capacity}`,
    ),
  }),
);

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  submittedBy: text("submitted_by").notNull(),
  facultyApproverSub: text("faculty_approver_sub"),
  deanApproverSub: text("dean_approver_sub"),
  budgetRequested: integer("budget_requested").notNull(),
  budgetApproved: integer("budget_approved"),
  attachmentUrl: text("attachment_url"),
  attachmentMime: text("attachment_mime"),
  attachmentSizeBytes: integer("attachment_size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    userSub: text("user_sub").notNull(),
    userEmail: text("user_email").notNull(),
    status: text("status").notNull(), // CONFIRMED, WAITLISTED, CANCELLED
    waitlistPosition: integer("waitlist_position"),
    isGuest: boolean("is_guest").notNull().default(false),
    guestName: text("guest_name"),
    guestEmail: text("guest_email"),
    guestInstitution: text("guest_institution"),
    ticketQrSecret: text("ticket_qr_secret").notNull(),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userEventUnique: unique().on(table.eventId, table.userSub),
  }),
);

export const eventVolunteers = pgTable(
  "event_volunteers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    userSub: text("user_sub").notNull(),
    role: text("role").notNull().default("QR_SCANNER"),
    assignedBy: text("assigned_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    volunteerUnique: unique().on(table.eventId, table.userSub),
  }),
);

export const checkins = pgTable(
  "checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id),
    scannedBy: text("scanned_by").notNull(),
    scannedAt: timestamp("scanned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    checkinUnique: unique().on(table.registrationId),
  }),
);

export const luckyDrawCampaigns = pgTable("lucky_draw_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("OPEN"), // OPEN, DRAWN, CLAIMED, REDRAWN
  seedHash: text("seed_hash").notNull(),
  seedRevealed: text("seed_revealed"),
  winnerRegistrationId: uuid("winner_registration_id").references(
    () => registrations.id,
  ),
  winnerSub: text("winner_sub"),
  winnerName: text("winner_name"),
  winnerDept: text("winner_dept"),
  claimDeadline: timestamp("claim_deadline", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const luckyDrawEntries = pgTable(
  "lucky_draw_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => luckyDrawCampaigns.id),
    userSub: text("user_sub").notNull(),
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCampaignUnique: unique().on(table.campaignId, table.userSub),
    sessionCampaignUnique: unique().on(table.campaignId, table.sessionId),
  }),
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorSub: text("actor_sub").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
