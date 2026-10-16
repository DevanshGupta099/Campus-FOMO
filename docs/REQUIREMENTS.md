# Requirements — Campus FOMO

> "Nobody knows what they want until they see it." This document is versioned; each phase gate may revise it.
> Validated at Phase 0 Gate. All assumptions are classified and verified against architectural and stakeholder constraints.

---

## 1. Validated Assumptions

- **[A1] No Cancellation Penalties in v1:** Students may cancel their registration at any time up until the event start time without demerit points, attendance bans, or XP deductions.
- **[A2] Irreversible Event Cancellation:** Once an event is cancelled by an organizer or admin, status transitions permanently to `CANCELLED`. All registrants are immediately notified, and the event cannot be un-cancelled.
- **[A3] Dual-Channel Verification with Student Register Number:** Sign-up is permitted via mobile phone or personal email with OTP verification. To attain the `STUDENT` role and claim event seats, users must provide and verify a valid CHRIST University Student Register Number (UID). External users retain the `GUEST` role with view-only permissions.
- **[A4] No Unregistered Walk-Ins in v1:** Door check-in requires a valid, pre-existing `CONFIRMED` registration. Walk-in unregistered attendees are rejected by the scanner; organizers may not register students on the fly at the door.
- **[A5] Price Display Only (No In-App Payments):** Events may display a fee/ticket price, but v1 integrates no payment gateway. Any fee collection occurs through official offline university desks or department counters.
- **[A6] Single-Campus Venue Scope:** Initial deployment targets the main university campus cluster. Venues are modelled with fixed capacity and clash boundaries without cross-city inter-campus travel buffers.
- **[A7] Direct Atomic Waitlist Promotion:** When a confirmed attendee cancels, the #1 waitlisted student is instantly and atomically promoted to `CONFIRMED` inside the database transaction. No claim-window timer or delayed BullMQ worker is required for v1.
- **[A8] Two-Stage Approval Workflow:** Event publication requires a sequential two-stage sign-off: first by the Club Faculty Mentor (`PENDING_FACULTY`), then by the Central Dean's Office / Venue Admin (`PENDING_ADMIN`), after which status transitions to `PUBLISHED`.
- **[A9] SSE with Resilient HTTP Polling Fallback:** Campus Wi-Fi networks and proxies that terminate or buffer persistent Server-Sent Events degrade automatically to HTTP short-polling (30-second interval) with `Last-Event-ID` offset replay.
- **[A10] SMS Spend Guard & Email Fallback:** Production SMS providers enforce circuit breakers. If SMS delivery receipts indicate DND blocking or provider failure, the platform automatically fails over to transactional email OTP.

---

## 2. Personas & Comprehensive User Stories

### Persona 1: Asha — First-Year Student

_Goal:_ Discover campus life, overcome social friction, make friends, join clubs.  
_Pain today:_ Notices on physical noticeboards get missed; fragmented WhatsApp groups; intimidations around prerequisites.  
_Primary Panel:_ Student Web Panel (Mobile View).

- **US-DIS-01 (Must)** _This Week Discovery:_ Given 12 published events scheduled for the current calendar week, when Asha opens the discovery feed, then exactly those 12 events are displayed sorted chronologically by start time, with initial render < 1.0 s on 4G throttle.
- **US-DIS-02 (Must)** _Multi-Facet Filtering:_ Given 50 published events, when Asha filters by categories `["Cultural", "Club"]`, free-only `price=0`, and `has_seats=true`, then the feed returns only events matching all active criteria, and URL search parameters mirror the filter state for bookmarking.
- **US-DIS-03 (Must)** _Typo-Tolerant Search:_ Given an event titled "Hackathon 2026", when Asha searches "hakathon" or "hckthn", then Postgres `pg_trgm` matching returns "Hackathon 2026" with matched query substrings highlighted, executing in < 150 ms.
- **US-DIS-06 (Must)** _Beginner-Friendly & No-Prerequisite Filter:_ Given events tagged with `no-experience-needed`, when Asha toggles the "First-Year Friendly" filter chip, the feed filters to events requiring no departmental prerequisites or auditions within 300 ms.
- **US-REG-07 (Must)** _Peer Seat Transparency Before Sharing:_ Given an event with capacity 60 and 58 confirmed registrations, when Asha views the event detail card to invite a batchmate, then the UI displays a live badge: "Only 2 seats remaining" updating via SSE in < 2.0 s.
- **US-NOT-02 (Should)** _Personalized Orientation Event Reminders:_ Given Asha bookmarks 3 orientation week events, when an event is 15 minutes from starting, then Asha receives an in-app and browser push notification containing the venue room number and entry gate directions.

---

### Persona 2: Rohan — Final-Year Placement-Focused Student

_Goal:_ Attend placement prep, tech workshops, guest lectures; strictly avoid academic timetable conflicts.  
_Pain today:_ Irrelevant cultural fest noise; events scheduled during mandatory lab hours causing attendance shortages.  
_Primary Panel:_ Student Web Panel.

- **US-DIS-04 (Should)** _Algorithmic Feed Personalization:_ Given Rohan's profile indicates `Department: Computer Science`, `Year: 4`, and `Interests: ["AI", "Placement"]`, when he opens the feed, events tagged with these attributes are scored higher via SQL ranking and display an explanatory chip: "Because you are in Final Year CS".
- **US-DIS-07 (Must)** _Academic Timetable Clash Warning:_ Given Rohan's registered academic schedule is 09:00–16:00, when he views an event running from 14:00–17:00, the event card displays a amber badge: "Academic Class Clash (14:00–16:00)", and registration modal prompts: "This overlaps with your regular classes. Proceed anyway?".
- **US-REG-08 (Must)** _Verified Duty-Leave Attendance Log:_ Given Rohan attends an approved pre-placement seminar and checks in via QR code, when the event finishes, Rohan can download a digitally signed attendance receipt PDF with hashed registration ID for college duty-leave submission within 5 minutes.
- **US-DIS-08 (Should)** _Placement Eligibility Gate Check:_ Given a competitive coding hackathon restricted to Semesters 6 and 8, when a Semester 2 student attempts registration, the modal halts them with a clear error: "Registration restricted to Semesters 6+".

---

### Persona 3: Meera — Cultural & Sports Enthusiast

_Goal:_ Never miss auditions, inter-college cultural fest trials, basketball league fixtures.  
_Pain today:_ Schedule clashes between concurrent auditions; notifications buried under WhatsApp chat floods.  
_Primary Panel:_ Student Web Panel.

- **US-DIS-09 (Must)** _Multi-Track Fest Schedule View:_ Given an annual 3-day cultural fest with 40 events across 4 stages, when Meera selects "Fest Mode", the feed renders an interactive multi-track schedule matrix allowing side-by-side time slot comparison with zero layout shifts (CLS < 0.05).
- **US-REG-09 (Must)** _Multi-Slot Audition Reservation:_ Given a dance audition with 10-minute audition slots (capacity 3 candidates per slot), when Meera selects 15:20–15:30, the slot counter decrements from 3 to 2 atomically; once filled, the slot becomes disabled for other candidates.
- **US-GAM-03 (Should)** _Cultural Fanatic Badge & XP Award:_ Given Meera successfully checks into 3 cultural events within a 30-day window, when the 3rd check-in is logged, the gamification engine atomically commits 150 XP and unlocks the "Cultural Fanatic" profile badge.

---

### Persona 4: Karan — Student Club Organizer

_Goal:_ Create events quickly, secure faculty approval, maximize turnout, prevent overbooking, check in attendees seamlessly.  
_Pain today:_ Google Forms overfilling, venue clashes discovered on the day of the event, fake check-ins.  
_Primary Panel:_ Organizer Management Panel.

- **US-ORG-01 (Must)** _Draft Creation Wizard:_ Given Karan has organizer rights for "Coding Club", when he creates an event with title, description, category, venue, start/end timestamps, max capacity, and procedural poster, then a draft is saved with version `1`.
- **US-ORG-06 (Must)** _Real-Time Venue Collision Pre-Check:_ Given venue "Main Quadrangle" is already booked on Friday 14:00–17:00 by another club, when Karan selects that venue and overlapping time window in the wizard, the form immediately warns: "Venue already reserved by Music Club (14:00–17:00)" and disables the submit button.
- **US-ORG-07 (Must)** _Two-Stage Submission & Revision Resubmission:_ Given Karan submits draft event `E-101`, status transitions `DRAFT -> PENDING_FACULTY`. If Faculty Mentor requests revisions with a feedback note, Karan can edit the draft and resubmit, resetting the version counter without losing attendee limits.
- **US-ORG-04 (Must)** _Rotating Dynamic QR Code Check-In:_ Given Karan opens the door scanner, the system displays/reads a dynamic TOTP QR code rotating every 30 seconds; duplicate scans return an idempotent message: "Already checked in at 10:04 AM", preventing screenshot sharing.
- **US-ORG-08 (Must)** _Offline Queue Check-In Scanner:_ Given the auditorium basement experiences Wi-Fi loss, when Karan scans attendee QR codes, the browser app writes check-in payloads to an IndexedDB queue; once connectivity is restored, 50 cached scans sync in a single HTTP batch with zero duplicates.

---

### Persona 5: Dr. Nair — Faculty Coordinator & Club Mentor

_Goal:_ Provide quick oversight, ensure events comply with university guidelines, verify safety and budget.  
_Pain today:_ Cluttered email approval requests; lack of context on venue conflicts; last-minute event cancellations.  
_Primary Panel:_ Faculty Approval Panel.

- **US-APR-01 (Must)** _Approval Queue with Conflict Highlighting:_ Given 5 pending club events, when Dr. Nair opens the approval queue, each item details the club name, organizer contact, expected attendance, and a green "Zero Clashes" or red "Venue Clash" tag.
- **US-APR-02 (Must)** _Stage-1 Faculty Sign-Off:_ Given Dr. Nair reviews an event draft submitted by Coding Club, she can either approve (transitioning status to `PENDING_ADMIN`) or reject with a mandatory written reason (≥ 15 characters) which notifies the organizer.
- **US-APR-03 (Must)** _Safety & Faculty Escort Compliance Check:_ Given an event scheduled past 18:30 or located off-campus, when submitted, the system forces Dr. Nair to check a mandatory confirmation box: "Faculty Mentor attendance confirmed" before Stage-1 approval can be executed.
- **US-APR-04 (Should)** _Club Health & Engagement Metrics:_ Dr. Nair can view an aggregate dashboard showing total events hosted, total registered students, and average no-show rates (target < 15%) across her assigned clubs.

---

### Persona 6: Dean's Office / Central Admin

_Goal:_ Campus-wide oversight, emergency safety controls, role governance, system auditability.  
_Pain today:_ No unified dashboard; inability to halt events during university crises; unmonitored privilege escalation.  
_Primary Panel:_ Central Admin Panel.

- **US-ADM-01 (Must)** _User Role Management & Session Invalidation:_ Given a student is suspended, when Admin changes their role or toggles `is_active=false`, the server revokes their refresh token family immediately and blacklists current access tokens in Redis within 500 ms.
- **US-ADM-03 (Must)** _Stage-2 Final Publication Gate:_ Given an event has received Stage-1 faculty approval, when Central Admin approves it, the event atomically transitions to `PUBLISHED`, enters the discovery feed, and triggers feed cache invalidation.
- **US-ADM-04 (Must)** _Campus Emergency Event Cancellation Broadcast:_ Given severe rain or campus closure, when Admin executes "Emergency Cancel" on an event, the status changes to `CANCELLED`, freeing the venue, and an automated SMS/email notice is dispatched to all confirmed registrants in < 60 seconds.
- **US-ADM-05 (Must)** _Immutable Audit Trail:_ Every status change, role grant, event cancellation, and manual check-in override is recorded in an append-only `audit_log` table capturing `actor_id`, `action`, `target_id`, `ip_address`, and UTC timestamp.

---

### Persona 7: Visitor & Guest Speaker

_Goal:_ View public symposiums, access venue directions, enter campus without friction.  
_Pain today:_ Restricted gate access; lack of public links; complicated app installation barriers.  
_Primary Panel:_ Public Landing Page (Unauthenticated).

- **US-PUB-01 (Must)** _Public Shareable Event Micro-Site:_ Given an event marked `is_public=true`, when an unauthenticated guest opens `/events/:slug`, the page loads full details, schedule, speaker bios, and campus gate directions with first paint < 800 ms.
- **US-PUB-02 (Should)** _Visitor Entry QR Pass:_ Given a public guest registers with full name, phone number, and government ID type, they receive a digital guest entry pass with encrypted QR code readable by security guards at campus entry gates.
- **US-PUB-03 (Could)** _Speaker Profile Card & Agenda Deep Link:_ Public symposium pages provide speakers with dedicated read-only agenda cards displaying their speech timeslot, co-panelists, and session venue room.

---

### Persona 8: Student with Accessibility Needs

_Goal:_ Navigate the entire application independently using assistive devices, keyboards, or screen readers.  
_Pain today:_ Inaccessible 3D canvases trapping focus; missing venue accessibility information; illegible contrast.  
_Primary Panel:_ All Panels (Student, Organizer, Admin).

- **US-ACC-01 (Must)** _Venue Accessibility Disclosures:_ Every venue and event detail page prominently specifies physical accessibility attributes: Wheelchair Ramp, Elevator Access, Assistive Listening Loops, and Accessible Restroom proximity.
- **US-ACC-02 (Must)** _Automated WCAG 2.2 AA Compliance:_ Every interactive button, input field, and modal passes axe-core validation with zero critical or serious violations, provides visible focus rings (`ring-2 ring-primary`), and supports full Tab/Shift-Tab keyboard navigation.
- **US-ACC-03 (Must)** _Zero-Motion Sensory Safe Mode:_ When the user toggles "Sensory Safe / Reduce Motion" or when `prefers-reduced-motion: reduce` is detected, the WebGL 3D canvas is completely omitted and replaced by an accessible semantic HTML hero banner.

---

### Persona 9: Student on Low-End Phone or Weak Campus Wi-Fi

_Goal:_ Discover and register for events quickly without battery drain, app crashes, or connection timeouts.  
_Pain today:_ 3D graphics freezing budget phones; college Wi-Fi blocking persistent connections.  
_Primary Panel:_ Student Web Panel (Lite Mode).

- **US-PERF-01 (Must)** _Tier-0 Capability Gating:_ When device memory ≤ 2 GB or CPU cores ≤ 2 or data-saver mode is active, the app boots into Tier-0 mode: WebGL bundles are never fetched, keeping total initial JavaScript bundle < 250 KB gzipped.
- **US-PERF-02 (Must)** _Resilient SSE-to-Polling Fallback:_ When campus Wi-Fi proxy blocks Server-Sent Events or terminates the streaming connection after 3 retries, the client transparently switches to HTTP polling (every 30 s) with zero interruption to active user workflows.
- **US-PERF-03 (Must)** _Offline Stale-While-Revalidate Reading:_ Given a student loses network connectivity after opening the app, cached events remain readable via TanStack Query and local service worker cache with a clear UI banner: "Offline Mode — Showing cached events".

---

## 3. Hidden Requirements Matrix (The Unspoken Constraints)

| Domain                      | Hidden Constraint                     | Architectural & Engineering Mitigation                                                                                                                                                      |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Academic Calendar**       | Exam Week Blackout                    | Admin configures mid-semester and end-semester blackout date ranges; organizers are blocked from submitting events during blackout windows unless explicit Dean override is provided.       |
| **Timetable Clashes**       | Mandatory Lecture Hours               | Events scheduled Monday–Friday between 09:00 and 16:00 show an explicit "Class Time Warning" badge to students during registration to prevent attendance debarment.                         |
| **Monsoon / Weather**       | Last-Minute Venue Shifts              | Organizers can update venue for a published event without triggering registration cancellation; all confirmed registrants receive an instant SMS/email "Venue Relocated" push alert.        |
| **Inter-Club Politics**     | Duplicate Events by Rival Clubs       | Title and tag similarity checker alerts faculty reviewers during Stage-1 approval if another club has submitted a similar theme event within a 7-day window.                                |
| **Organizer Spam**          | Queue Flooding Denial of Service      | Club organizers are rate-limited to creating a maximum of 3 pending event drafts per 24 hours to prevent spamming the faculty approval queue.                                               |
| **Student Safety**          | Mandatory Emergency Contacts          | Events ending after 20:00 require faculty advisor physical escort confirmation, and check-in logs remain accessible to campus security until all students depart.                           |
| **Privacy / DPDP Act 2023** | Minimal Data Exposure                 | Organizers and fellow students can never view student phone numbers or personal emails. The attendee roster displays only Student Name, Department, and masked Register Number (`2240***`). |
| **Campus Wi-Fi Proxies**    | Long-Lived Connection Drops           | University firewall drops idle TCP connections after 60 seconds; SSE endpoint sends heartbeat comment (`: ping\n\n`) every 15 seconds to prevent proxy termination.                         |
| **SMS Gateway DND/DLT**     | SMS Delivery Drops on Indian Telecoms | Promotional routes drop messages; transactional OTP uses pre-registered TRAI DLT templates; if DLR fails within 20 s, UI presents 1-click "Send OTP via Email".                             |
| **Device Diversity**        | Memory Thrashing on Budget Phones     | R3F 3D Canvas unloads unrendered assets and monitors FPS via `PerformanceMonitor`; if frame rate drops below 30 FPS for 3 consecutive seconds, graphics drop down one tier.                 |

---

## 4. MoSCoW Prioritization & Scope Management

| Priority       | Feature / Epic                   | Stories Included                                                                             | Scope Cut & Guardrails                                                                                               |
| -------------- | -------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **MUST**       | **Core Discovery**               | US-DIS-01, US-DIS-02, US-DIS-03, US-DIS-06                                                   | Strictly relational DB queries using `pg_trgm` and composite indexes. No external Elasticsearch or vector DB in MVP. |
| **MUST**       | **The Last Seat (Registration)** | US-REG-01, US-REG-02, US-REG-03, US-REG-04, US-REG-07                                        | Atomic database transactions using `SELECT ... FOR UPDATE` and SQL-level capacity check constraints.                 |
| **MUST**       | **Organizer Lifecycle**          | US-ORG-01, US-ORG-02, US-ORG-03, US-ORG-04, US-ORG-06, US-ORG-07, US-ORG-08                  | 2-stage approval workflow; QR check-in with dynamic 30s tokens and offline local cache sync.                         |
| **MUST**       | **Two-Stage Approval & Admin**   | US-APR-01, US-APR-02, US-APR-03, US-ADM-01, US-ADM-03, US-ADM-04, US-ADM-05                  | Club Faculty Mentor sign-off followed by Central Admin final publication; session revocation on user deactivation.   |
| **MUST**       | **Auth & Security**              | US-AUTH-01, US-AUTH-02, US-AUTH-03, US-AUTH-04, US-AUTH-05                                   | Dual-channel auth (Email/Phone OTP) with mandatory Student UID verification, rotating refresh tokens, rate limits.   |
| **MUST**       | **Resilient Realtime & Ops**     | US-LIV-01, US-PERF-02, US-ACC-01, US-ACC-02, US-ACC-03, US-PERF-01                           | SSE with 15s keep-alive ping and 30s HTTP polling fallback; Tier-0 non-WebGL fallback; WCAG 2.2 AA compliant.        |
| **SHOULD**     | **Gamification & Engagement**    | US-GAM-01, US-GAM-03, US-NOT-01, US-NOT-02, US-DIS-04, US-DIS-08, US-ORG-05                  | XP awards, streaks, and attendance badges; server-driven recommendation section; basic organizer metrics.            |
| **COULD**      | **Campus Enhancements**          | US-PUB-02, US-PUB-03, US-REG-06, US-UX-03                                                    | Guest QR entry passes; `.ics` calendar file downloads; Command Palette (Cmd+K).                                      |
| **WON'T (v1)** | **External Complexities**        | Payment Gateway, Native App Builds, Multi-Campus Transit Buffers, AI Natural Language Search | Deferred to v2 after MVP Gate G4 is fully achieved and certified.                                                    |

---

## 5. Story Cards for the 5 Riskiest Stories

### Story Card 1: The Last Seat Concurrency Race

```yaml
Card ID: SC-01 (covers: US-REG-01, US-REG-03)
Title: High-Concurrency Seat Allocation with Zero Overbooking
Epic: E2 Registration
Risk Level: CRITICAL (Race conditions, overbooking, reputation loss)
Complexity: 8 Story Points

Story:
  As a student (Asha / Rohan),
  I want to register for a high-demand event with 1 seat remaining,
  So that I am guaranteed either a confirmed ticket or an accurate waitlist position without overbooking.

Technical Architecture & Invariants:
  - Atomic database execution: Single PostgreSQL transaction.
  - Invariant 1: confirmed_count <= capacity enforced by CHECK constraint and SQL condition:
      UPDATE events SET confirmed_count = confirmed_count + 1
      WHERE id = $1 AND confirmed_count < capacity RETURNING *;
  - Invariant 2: Exactly 1 registrant confirmed, all remaining concurrent requests assigned sequential waitlist_pos.
  - Idempotency: Duplicate submissions with identical Idempotency-Key return original result.

Given/When/Then Acceptance Criteria:
  Given an event with capacity 100 has 99 confirmed attendees,
  When 50 students attempt to register simultaneously via Promise.all within a 100 ms window,
  Then:
    1. Exactly 1 student receives HTTP 201 with status="CONFIRMED".
    2. Exactly 49 students receive HTTP 201 with status="WAITLISTED" with positions 1 through 49 in arrival order.
    3. confirmed_count in DB equals exactly 100.
    4. Zero database deadlocks occur; p95 latency < 400 ms.

Negative & Edge Cases:
  - User submits duplicate request: returns existing registration idempotently.
  - Event cancelled during transaction: returns HTTP 409 "Event no longer active".
```

---

### Story Card 2: Atomic Cancellation & Instant Waitlist Promotion

```yaml
Card ID: SC-02 (covers: US-REG-02)
Title: Atomic Attendee Cancellation and Deterministic Waitlist Promotion
Epic: E2 Registration
Risk Level: HIGH (Orphaned seats, duplicate promotions, lost notifications)
Complexity: 5 Story Points

Story:
  As a confirmed attendee,
  I want to cancel my ticket before the event starts,
  So that my seat is immediately passed to the #1 waitlisted student without leaving an empty seat.

Technical Architecture & Invariants:
  - Execution: Single SQL transaction containing cancellation and promotion.
  - Query:
      SELECT id, user_id FROM registrations
      WHERE event_id = $1 AND status = 'WAITLISTED'
      ORDER BY waitlist_pos ASC FOR UPDATE SKIP LOCKED LIMIT 1;
  - If row found: UPDATE registrations SET status = 'CONFIRMED', waitlist_pos = NULL WHERE id = $winner_id;
  - If no waitlist: UPDATE events SET confirmed_count = confirmed_count - 1 WHERE id = $1;
  - Transactional Outbox: Insert event `registration.waitlist_promoted` to outbox table in same transaction.

Given/When/Then Acceptance Criteria:
  Given an event with capacity 50 is full (confirmed=50) and has 5 students on the waitlist (positions 1–5),
  When confirmed student A cancels their registration,
  Then:
    1. Student A status becomes "CANCELLED".
    2. Waitlist student #1 status immediately updates to "CONFIRMED".
    3. Remaining waitlist students (positions 2–5) re-index to positions 1–4.
    4. Promoted student receives an instant outbox-backed SSE alert and email notification.
    5. Database confirmed_count remains exactly 50 throughout.

Negative & Edge Cases:
  - Two confirmed users cancel at the exact same millisecond: two waitlisted users promoted cleanly.
  - Cancellation occurs when waitlist is empty: confirmed_count safely decrements to 49.
```

---

### Story Card 3: Dual-Channel Auth with Student UID Verification

```yaml
Card ID: SC-03 (covers: US-AUTH-01, US-AUTH-04, US-AUTH-05)
Title: Dual-Channel OTP Authentication with Student UID Upgrade
Epic: E5 Auth
Risk Level: HIGH (Credential stuffing, SMS billing drain, identity spoofing)
Complexity: 8 Story Points

Story:
  As an aspiring attendee,
  I want to sign up using either my mobile number or email and verify my Student Register Number,
  So that I can claim the STUDENT role and register for campus events securely.

Technical Architecture & Invariants:
  - OTP Generation: 6-digit CSPRNG, stored as HMAC-SHA256(code, secret + challengeId).
  - Rate Limiting (Redis Lua): 1 request per 30s, max 5 per hour per phone/email, max 10/day per IP.
  - UID Verification: Check that Register Number matches institutional format (e.g. 7 digits) and is not claimed by another active user.
  - JWT Security: Short-lived access token (15m in-memory) + rotating refresh token (HttpOnly, SameSite=Lax cookie).
  - Refresh Family: Reuse of an already-used refresh token revokes all tokens in that family immediately.

Given/When/Then Acceptance Criteria:
  Given an unverified user signs up with phone number `+919876543210`,
  When they enter the valid 6-digit OTP within 5 minutes and input their CHRIST Student UID `2240123`,
  Then:
    1. Account is activated with role="STUDENT".
    2. Response sets HttpOnly Secure refresh token cookie and returns 15-minute access JWT in payload.
    3. Plaintext OTP and full phone number never appear in logs (masked to `+91******10`).
    4. Registering a duplicate phone or duplicate UID returns generic error without leaking account existence.

Negative & Edge Cases:
  - 5 incorrect OTP attempts: challenge invalidated, destination locked for 15 minutes.
  - SMS gateway fails or blocks DND: automatic 1-click fallback to Email OTP.
```

---

### Story Card 4: Two-Stage Approval with Venue Clash Prevention

```yaml
Card ID: SC-04 (covers: US-ORG-02, US-APR-01, US-APR-02, US-ADM-03)
Title: Sequential Two-Stage Event Approval with Venue Conflict Lockout
Epic: E4 Approval
Risk Level: HIGH (Venue double-booking, unauthorized event publication)
Complexity: 5 Story Points

Story:
  As an organizer and faculty coordinator,
  I want a structured two-stage review process that blocks venue double-bookings,
  So that only verified, conflict-free events are published on the campus calendar.

Technical Architecture & Invariants:
  - State Machine: `DRAFT -> PENDING_FACULTY -> PENDING_ADMIN -> PUBLISHED` (or `REJECTED`).
  - Clash Detection Constraint:
      SELECT id FROM events
      WHERE venue_id = $venue
        AND status IN ('PENDING_ADMIN', 'PUBLISHED')
        AND tstzrange(starts_at, ends_at) && tstzrange($start, $end)
        AND id != $current_event_id;
  - Optimistic Concurrency: Every event row has a `version` integer column; updates increment version and check `WHERE version = $expected`.

Given/When/Then Acceptance Criteria:
  Given Organizer Karan submits an event for "Central Auditorium" on Friday 14:00–18:00,
  When Club Faculty Mentor Dr. Nair signs off (Stage 1),
  Then:
    1. Event transitions to `PENDING_ADMIN`.
    2. Another club attempting to book Central Auditorium overlapping Friday 16:00–19:00 is flagged with a Red Clash Warning.
    3. When Central Admin issues Stage 2 approval, event status becomes `PUBLISHED`.
    4. Discovery feed cache is purged, and SSE broadcast publishes event creation to student feeds.

Negative & Edge Cases:
  - Faculty Mentor attempts to approve their own club's event as organizer: HTTP 403 Forbidden.
  - Rejection without reason: HTTP 422 Unprocessable Entity (min 15 chars reason required).
```

---

### Story Card 5: Realtime Seat Sync with Resilient Polling Fallback

```yaml
Card ID: SC-05 (covers: US-LIV-01, US-PERF-02)
Title: SSE Live Seat Synchronization with Campus Firewall Polling Fallback
Epic: E6 Live Updates & E8 Experience
Risk Level: HIGH (Connection buffering on college Wi-Fi, UI desynchronization)
Complexity: 5 Story Points

Story:
  As a student browsing the event feed,
  I want seat availability counts to update in real time without refreshing the page,
  So that I never attempt to register for an event that has already been filled.

Technical Architecture & Invariants:
  - Server Transport: Fastify SSE stream via Redis Pub/Sub outbox worker.
  - Heartbeat: Server sends `: ping\n\n` every 15 seconds to prevent intermediate proxy timeouts.
  - Reconnection: SSE client sends `Last-Event-ID` header on reconnect; Redis stream replays missed events.
  - Fallback Strategy: If SSE connection fails 3 consecutive times, client switches to HTTP polling `GET /feed` every 30 seconds.

Given/When/Then Acceptance Criteria:
  Given Student A and Student B have the event feed open on separate devices,
  When Student C registers for the last seat of "Robotics Workshop",
  Then:
    1. Within 1.5 seconds, the seat badge on both Student A and Student B's screens transitions from "1 seat left" to "Full (Waitlist Open)" without full page reload.
    2. When tested behind a restrictive firewall blocking long-lived HTTP streams, the client falls back to 30s polling within 10 seconds of connection failure.

Negative & Edge Cases:
  - Client device enters sleep/background mode: on foreground resume, reconnects and requests missed events via `Last-Event-ID`.
```

---

## 6. Seed Data Specification

- Deterministic seed generation with fixed seed parameter `SEED=42`.
- Relative timestamps computed dynamically (`NOW() + interval '1 day'`, `NOW() - interval '2 days'`) so "This Week" is perpetually populated regardless of execution date.
- 14 distinct student clubs and 9 campus venues.
- 80+ events across all 8 standard categories (`Technical`, `Cultural`, `Sports`, `Workshop`, `Guest Lecture`, `Competition`, `Placement`, `Social/Club`).
- Complete event state distribution: `DRAFT`, `PENDING_FACULTY`, `PENDING_ADMIN`, `PUBLISHED`, `CANCELLED`, `REJECTED`.
- At least 1 event at capacity with a waitlist of 5 students, 1 event with exactly 1 seat remaining, and 3 clashing venue pairs.
- 60+ seeded users across all personas with verified demo credentials (e.g. `asha.student@demo.test`, `karan.organizer@demo.test`, `nair.faculty@demo.test`, `admin@demo.test`, default password `Demo@12345`).
- Procedurally generated vector/SVG poster metadata; zero broken external image links.
