# Requirements Specification — Campus FOMO

> **Compliance**: Formatted strictly in accordance with the _CampusFest Student Handbook (15 Oct 2026)_ Stage 1 specification (p. 4, 18).
> Every requirement is quantified with Given/When/Then acceptance criteria containing exact numbers, two explicit Non-Functional Requirements (Performance and Security/Privacy), and MoSCoW prioritization.

---

## 1. Validated Assumptions

- **[A1] No Cancellation Penalties in v1:** Students and guests may cancel registration up until event start time without penalties or XP demerits.
- **[A2] Irreversible Event Cancellation:** Once an event is cancelled by an organizer or admin, status transitions permanently to `CANCELLED`; registered participants receive real-time notices and the event cannot be re-opened.
- **[A3] Zero Trust Dual Verification:** Keycloak handles identity lifecycle; students authenticate with CHRIST institutional accounts (`@christuniversity.in`). External participants sign up with `GUEST` role and can only register for events explicitly flagged `is_external_open=true`.
- **[A4] Door Check-in Integrity:** Door admission strictly requires a pre-existing `CONFIRMED` registration. Walk-in unregistered attendees are rejected by the scanning engine.
- **[A5] Price Display Only:** Events may display an offline ticket/participation fee; v1 does not process credit/debit card transactions directly.
- **[A6] Two-Stage Approval Workflow:** Proposals require sequential approval: first by Department Faculty Coordinator (`PENDING_FACULTY` / `event:approve:dept`), second by Dean of Students (`PENDING_DEAN` / `event:approve:budget`), before reaching `PUBLISHED`.
- **[A7] Atomic Seat Allocation & Promotion:** Seat reservation and waitlist promotion are strictly atomic database operations (`UPDATE events SET confirmed_count = confirmed_count + 1 WHERE id = $1 AND confirmed_count < capacity`). No check-then-act in application memory.
- **[A8] PII Minimization:** Phone numbers and email addresses are masked everywhere (`+91******21`, `a***@college.edu`). Sponsors never receive or see student phone numbers or unmasked emails.
- **[A9] Resilient Real-Time Event Bus:** Server-Sent Events (SSE) provide live updates (seat counters, waitlists, draws). When network proxies buffer or disrupt SSE, clients automatically fall back to HTTP short-polling with `Last-Event-ID` deduplication.
- **[A10] Commit-Reveal Fair Lucky Draw:** Lucky draw winners are determined via a deterministic cryptographic commit-reveal protocol (`seed_hash = sha256(seed)` published before draw; `seed` revealed at draw; winner index computed from seed and sorted entrant IDs).

---

## 2. Personas

1. **Student (CHRIST University Student)**: Discovers campus activities, registers for events, tracks attendance, earns gamification XP/badges, and enters lucky draws.
2. **Guest (External Participant)**: Views external-eligible events, registers with name/email/institution, checks seat availability, and explores the campus gallery.
3. **Student Event Head**: Submits proposals, manages venue requests, delegates volunteer roles, monitors capacity, executes check-ins, and broadcasts announcements.
4. **Volunteer / Scanner**: Scans attendee QR codes at venue doors using mobile devices with fast (<500 ms) response times.
5. **Faculty Coordinator**: Departmental mentor who reviews event proposals, ensures academic alignment, checks venue conflicts, and approves or rejects with reason.
6. **Dean of Students**: Campus-wide authority reviewing financial budgets, granting final event clearance, auditing safety, and monitoring campus-wide analytics.
7. **Sponsor (Campus Partner / Cafe Chain)**: Brand partner (e.g. Third Wave Coffee Campus Lounge) managing dedicated showcase pages, banners, and lucky draw promotional campaigns without accessing student PII.
8. **Administrator**: System administrator managing RBAC/PBAC roles, Keycloak clients, emergency cancellations, and audit logs.

---

## 3. Comprehensive Story Cards (Handbook Format)

### Persona: Student Event Head (5 Core Cards)

#### Story Card EH-01: Event Proposal Submission

- **USER STORY**: As a Student Event Head, I want to submit an event proposal form, so that I can get official approval and budget allocation from the Faculty and Dean.
- **ACCEPTANCE CRITERIA**:
  - Given the campus fest dates are officially announced,
  - When I fill out all 5 required proposal fields (`Title`, `Description`, `Venue`, `Budget`, `Team Size`) and click submit,
  - Then the event status immediately changes to `"PENDING_FACULTY"` and 1 email/in-app notification is triggered to the designated department faculty approver.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Proposal form attachments (up to 5MB) must upload, validate MIME type, and save in under 3.0 seconds.
  2. _Security / Privacy_: Only the submitting event head, authorized faculty mentor, and Dean roles can view the draft proposal details before it goes public.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Student Event Head

#### Story Card EH-02: Volunteer Role Delegation

- **USER STORY**: As a Student Event Head, I want to assign volunteer roles to other registered students, so that I can delegate specific event-day tasks like ticket scanning.
- **ACCEPTANCE CRITERIA**:
  - Given my event has been approved by faculty,
  - When I search for a student's ID and assign them the `"volunteer:assign:own-event"` role as a `"QR Scanner"`,
  - Then that specific student instantly gains access to the scanning module on their personal dashboard within 1.0 second.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: The student ID search query must return exact matches in under 500 milliseconds.
  2. _Security / Privacy_: Volunteers assigned the scanner role are strictly restricted by PBAC from viewing event financial budgets or modifying event parameters.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Student Event Head

#### Story Card EH-03: Registration Monitoring & Capping

- **USER STORY**: As a Student Event Head, I want to monitor live registrations and enforce a maximum capacity cap, so that the event venue does not violate fire safety limits.
- **ACCEPTANCE CRITERIA**:
  - Given the assigned venue has a strict capacity of 50 people,
  - When the 50th participant successfully completes their registration,
  - Then the system automatically closes regular registration and offers the next 10 applicants a spot on an automated waitlist.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: The live registration counter on the dashboard must update via SSE within 1.0 second of a new ticket being confirmed in PostgreSQL.
  2. _Security / Privacy_: Participant email addresses and phone numbers are masked (`a***@college.edu`, `+91******21`) on the dashboard unless the head explicitly exports them for official mass communication.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Student Event Head

#### Story Card EH-04: Event Day Door Check-in

- **USER STORY**: As a Student Event Head or assigned volunteer, I want to use a mobile QR scanner interface to check in participants, so that the entry line moves rapidly and our attendance counts are accurate.
- **ACCEPTANCE CRITERIA**:
  - Given a participant presents a valid event QR code ticket at the venue door,
  - When I or my assigned volunteer scan it with our smartphone camera,
  - Then the app displays a green `"Verified"` checkmark and increments the live event attendance counter by exactly 1 in under 500 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: QR code validation must process and return a result in under 500 milliseconds over a standard 4G mobile network to prevent door bottlenecks.
  2. _Security / Privacy_: The web scanning interface must not store personal ticket data or participant PII in the local device cache or browser storage.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Student Event Head

#### Story Card EH-05: Broadcast Announcements

- **USER STORY**: As a Student Event Head, I want to send broadcast updates to all registered participants, so that I can immediately inform them of last-minute changes like a venue shift.
- **ACCEPTANCE CRITERIA**:
  - Given 100 participants are successfully registered for my event,
  - When I type an urgent update message and click `"Broadcast"`,
  - Then all 100 participants receive the update via email and push notification within 2 minutes.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: The broadcast messaging queue (BullMQ/Redis) must dispatch at least 1,000 messages per minute without lagging the core API.
  2. _Security / Privacy_: Bulk notifications must hide recipient addresses (BCC equivalent) so participants cannot see each other's contact information.
- **PRIORITY**: Should Have
- **ASKED FOR BY**: Student Event Head

---

### Persona: Guest User (All 10 Cards from Input)

#### Story Card GU-01: View Upcoming Events

- **USER STORY**: As a guest, I want to view all upcoming campus events that are open to external participants, so that I can discover events I am interested in.
- **ACCEPTANCE CRITERIA**:
  - Given 25 upcoming campus events where 10 are flagged `is_external_open=true`,
  - When a guest loads the public events discovery page,
  - Then exactly those 10 external events are displayed within 1.0 second, with internal-only events excluded.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Initial page load (LCP) under 1.5 seconds on a 4G mobile connection.
  2. _Security / Privacy_: Unauthenticated visitors are restricted to public read-only event endpoints (`event:read:public`).
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-02: View Event Gallery

- **USER STORY**: As a guest, I want to view photos and videos from previous campus events, so that I can learn about the college's activities and culture.
- **ACCEPTANCE CRITERIA**:
  - Given a completed annual cultural fest with 30 curated photos and video reels,
  - When a guest navigates to `/gallery`,
  - Then media thumbnails render in a responsive masonry grid with zero layout shift (CLS < 0.05).
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Media thumbnails are lazily loaded with modern WebP compression under 150 KB each.
  2. _Security / Privacy_: Photos containing unapproved student close-ups or sensitive campus zones are excluded by editorial publication flags.
- **PRIORITY**: Should Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-03: Register for Eligible Events

- **USER STORY**: As a guest, I want to register for events that allow participation from external students or other colleges, so that I can attend suitable events.
- **ACCEPTANCE CRITERIA**:
  - Given an external-open hackathon with 20 available public seats,
  - When a guest fills in their name, email, and institution and submits registration,
  - Then exactly 1 seat is reserved atomically and a unique ticket token is generated.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Registration transaction commits in under 400 milliseconds at 50 requests/sec.
  2. _Security / Privacy_: Guest input is sanitized against XSS and SQL injection; email address is validated against disposable email domain blacklists.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-04: View Event Details

- **USER STORY**: As a guest, I want to view event descriptions, dates, timings, venues, participation fees, eligibility criteria, and deadlines, so that I can decide whether to attend.
- **ACCEPTANCE CRITERIA**:
  - Given an external event with 7 metadata attributes (description, date, time, venue, fee, eligibility, deadline),
  - When a guest clicks an event card,
  - Then the detail view renders all 7 fields clearly formatted in Asia/Kolkata timezone within 300 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Event detail API p95 latency under 150 milliseconds via Redis cache.
  2. _Security / Privacy_: Confidential organizer notes and internal university budget figures are omitted from the public response payload.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-05: Search and Filter Events

- **USER STORY**: As a guest, I want to search for events and filter them by category, date, or event type, so that I can quickly find relevant events.
- **ACCEPTANCE CRITERIA**:
  - Given 50 published external events across 5 categories,
  - When a guest filters by category `"Technical"` and date range `"This Weekend"`,
  - Then the list updates instantly to display only matching events in under 200 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Keyset pagination cursor supports fast infinite scroll without SQL offset degradation.
  2. _Security / Privacy_: Search input is parameterized and escapes special characters to prevent SQL injection.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-06: Receive Registration Confirmation

- **USER STORY**: As a guest, I want to receive a confirmation message and email after successfully registering, so that I have proof of booking.
- **ACCEPTANCE CRITERIA**:
  - Given a guest completes registration for Event `E-202`,
  - When the database transaction commits,
  - Then a confirmation screen appears immediately, and a transactional confirmation email is queued and delivered within 60 seconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Confirmation email is dispatched via asynchronous worker queue within 30 seconds.
  2. _Security / Privacy_: Confirmation email contains an encrypted/signed ticket reference without exposing plaintext internal database keys.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-07: View Registration Details & Ticket

- **USER STORY**: As a guest, I want to view my registration confirmation and event ticket details, so that I can present them upon arrival.
- **ACCEPTANCE CRITERIA**:
  - Given a guest with confirmed registration `R-303`,
  - When they open their unique ticket link,
  - Then the screen displays their ticket QR code, entry gate instructions, and event time within 500 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Ticket view renders offline if service-worker cached.
  2. _Security / Privacy_: Ticket QR code incorporates a cryptographic HMAC signature preventing forged passes.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-08: View Event Announcements and Updates

- **USER STORY**: As a guest, I want to view updates about my registered events, including changes to timings or venues, so that I stay informed.
- **ACCEPTANCE CRITERIA**:
  - Given the venue for Event `E-202` shifts from `"Auditorium"` to `"Campus Amphitheatre"`,
  - When the organizer posts the change,
  - Then an amber update banner appears on the guest ticket page and an alert email is dispatched within 2 minutes.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: SSE event updates client displays in < 1.0 second.
  2. _Security / Privacy_: Announcements are broadcast to all registrants with recipient lists strictly concealed.
- **PRIORITY**: Should Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-09: Provide Registration Information

- **USER STORY**: As a guest, I want to enter my full name, email address, mobile number, and institution during registration, so that organizers can identify and contact me.
- **ACCEPTANCE CRITERIA**:
  - Given the registration modal for an external workshop,
  - When a guest submits 4 required fields (`name`, `email`, `phone`, `institution`),
  - Then client and server validate email format, normalize phone number to E.164 (`+91`), and reject invalid strings in < 100 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Validation runs synchronously on submit with zero UI stutter.
  2. _Security / Privacy_: Phone numbers are masked in all logs and dashboards; only the last 2 digits are ever visible in logs.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

#### Story Card GU-10: Check Event Availability (Seat Counter & Waitlist)

- **USER STORY**: As a guest, I want to see whether an event has available seats or is full, so that I know whether I can register or must join a waitlist.
- **ACCEPTANCE CRITERIA**:
  - Given an event with capacity 50 where 48 seats are taken,
  - When a guest views the card,
  - Then the badge displays `"2 seats left"`, and updates to `"Waitlist (3 of 10 taken)"` as soon as capacity hits 50.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Seat status updates via Server-Sent Events in under 2.0 seconds upon each booking.
  2. _Security / Privacy_: Live seat counters report aggregate numbers only; no individual student or guest identity is broadcast.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Guest User

---

### Persona: Sponsor (Cafe Chain Partner)

#### Story Card SP-01: Dedicated Brand Showcase & Banner Promotion

- **USER STORY**: As a Sponsor (e.g. Third Wave Coffee Campus Lounge), I want a dedicated brand showcase page and banner placements on high-traffic event screens, so that campus students learn about our products and special student offers.
- **ACCEPTANCE CRITERIA**:
  - Given 5 active campus fests with over 5,000 student impressions per day,
  - When a student or guest taps the sponsor banner on the main event feed,
  - Then they are routed to the dedicated sponsor page displaying the cafe's menu highlights, student discount vouchers, and cafe location within 800 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Sponsor banner and dedicated page assets load under 1.0 second, maintaining 60 fps responsive hover animations.
  2. _Security / Privacy_: The sponsor dashboard displays aggregated engagement analytics only (total impressions, click-through rates); **students' phone numbers and personal emails are NEVER shown to sponsors** (Handbook p. 4 NFR).
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Sponsor

#### Story Card SP-02: Sponsored Lucky Draw Campaign

- **USER STORY**: As a Sponsor, I want to sponsor an interactive lucky draw campaign during an event, so that attendees engage with our brand for a chance to win cafe gift cards.
- **ACCEPTANCE CRITERIA**:
  - Given a sponsored campaign offering 5 free coffee vouchers,
  - When 150 registered attendees enter the draw and the draw is triggered at event close,
  - Then the commit-reveal algorithm selects exactly 5 unique winners deterministically, displaying only the winner's first name and academic department on the public results banner.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Draw computation completes and commits within 500 milliseconds for up to 10,000 entries.
  2. _Security / Privacy_: Winner verification is public via cryptographic hash, but sponsor sees only masked winner profiles (`Asha (B.Tech CS)`).
- **PRIORITY**: Should Have
- **ASKED FOR BY**: Sponsor

---

### Persona: Student (CHRIST University Student)

#### Story Card ST-01: The Last Seat Concurrency Race

- **USER STORY**: As a student, I want to book a seat in a high-demand hackathon when only 1 seat remains, so that I receive an immediate and unambiguous confirmation or waitlist assignment.
- **ACCEPTANCE CRITERIA**:
  - Given Hackathon `H-101` has capacity 50 and 49 seats are taken,
  - When 50 students click `"Register"` at the exact same millisecond,
  - Then exactly 1 student receives `"CONFIRMED"`, exactly 10 students receive waitlist positions `1` through `10`, the remaining 39 receive `"EVENT_FULL"`, and `confirmed_count` never exceeds 50.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: All 50 concurrent transactions resolve within 600 milliseconds under high database contention.
  2. _Security / Privacy_: Atomicity enforced via database constraint `CHECK (confirmed_count <= capacity)` and row-level locking; no race conditions.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Student

#### Story Card ST-02: Gamification XP & Badge Unlocks

- **USER STORY**: As a student, I want to earn XP and profile badges when I attend campus events, so that my active campus participation is recognized.
- **ACCEPTANCE CRITERIA**:
  - Given a student has 450 XP,
  - When their QR code is scanned and checked into an approved technical workshop,
  - Then 50 XP is atomically credited to their ledger, their total reaches 500 XP, and the `"Tech Explorer"` badge unlocks with an animated notification in < 1.0 second.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: XP credit commits inside the check-in transaction in under 200 milliseconds.
  2. _Security / Privacy_: XP ledger is append-only and tamper-proof; client cannot fabricate or optimistically grant XP.
- **PRIORITY**: Should Have
- **ASKED FOR BY**: Student

---

### Persona: Volunteer / Door Scanner

#### Story Card VL-01: Rapid Entry Validation

- **USER STORY**: As a student volunteer, I want to scan attendee QR codes with immediate visual and audible feedback, so that 200 attendees can enter the auditorium in under 10 minutes.
- **ACCEPTANCE CRITERIA**:
  - Given an attendee approaches the venue door,
  - When I scan their dynamic ticket QR code,
  - Then the scanner screen displays green for `"Admitted"`, red for `"Invalid / Wrong Event"`, or yellow for `"Already Checked In at 10:15 AM"`, in under 400 milliseconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Average scan validation latency < 350 milliseconds on 4G campus Wi-Fi.
  2. _Security / Privacy_: Volunteers cannot access participant phone numbers or addresses; scanner displays only ticket status and attendee first name.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Volunteer

---

### Persona: Faculty Coordinator

#### Story Card FC-01: Departmental Proposal Review & Clash Prevention

- **USER STORY**: As a Faculty Coordinator, I want to review club event proposals for my department with automated venue clash warnings, so that I can endorse high-quality and safe campus activities.
- **ACCEPTANCE CRITERIA**:
  - Given a pending proposal submitted by Coding Club for `"Audi Block 2"` on Friday at 14:00,
  - When I open the review drawer,
  - Then the system checks the venue database and displays green `"Venue Available"` or red `"Conflict: Drama Club booked until 15:00"` before I click Approve.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Clash detection query executes in under 150 milliseconds.
  2. _Security / Privacy_: Only faculty assigned to that department have permission `event:approve:dept` for those proposals.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Faculty Coordinator

---

### Persona: Dean of Students

#### Story Card DS-01: Campus-Wide Budget Approval & Executive Governance

- **USER STORY**: As the Dean of Students, I want to review faculty-endorsed events with their requested budgets and campus resource allocations, so that university funds and venues are distributed equitably.
- **ACCEPTANCE CRITERIA**:
  - Given 8 events endorsed by faculty mentors,
  - When I review an event requesting ₹25,000 budget and click `"Approve Budget"`,
  - Then status transitions to `"PUBLISHED"`, the event appears in the student discovery feed, and an approval audit record is logged with my user ID and timestamp.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Approval transaction and public feed cache invalidation complete in under 500 milliseconds.
  2. _Security / Privacy_: Financial approvals require permission `event:approve:budget` and are recorded in an immutable audit log.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Dean of Students

---

### Persona: Administrator

#### Story Card AD-01: Emergency Incident Management & Cancellation Broadcast

- **USER STORY**: As an Administrator, I want to execute an emergency cancellation for an event during unexpected severe weather or campus closure, so that students are promptly kept safe.
- **ACCEPTANCE CRITERIA**:
  - Given an outdoor carnival with 400 registered students,
  - When I trigger `"Emergency Cancel"` and enter reason `"Severe Rain Alert"`,
  - Then the event status transitions to `"CANCELLED"`, the venue is released, and 400 notification emails/push alerts are dispatched in under 90 seconds.
- **NON-FUNCTIONAL REQUIREMENTS**:
  1. _Performance_: Multi-channel broadcast queue dispatches at least 500 notifications/minute.
  2. _Security / Privacy_: Emergency cancellations require `event:cancel:any` and trigger an immediate audit log entry.
- **PRIORITY**: Must Have
- **ASKED FOR BY**: Administrator

---

## 4. Hidden Requirements & Constraints

1. **Exam Week Blackouts**: The system automatically forbids scheduling extracurricular club events during mid-semester and end-semester university examination blocks.
2. **Rain & Weather Venue Fallbacks**: Outdoor venues (Amphitheatre, Quadrangle) require organizers to designate a secondary indoor backup venue during monsoon months.
3. **Campus Wi-Fi Proxy Buffering**: Campus proxies frequently drop idle persistent connections; Server-Sent Events must transmit an explicit `:heartbeat\n\n` comment every 15 seconds.
4. **Low-End Android Device Constraints**: Many students use budget smartphones (2 GB RAM); the frontend 3D canvas must run capability gating and offer a static CSS/SVG fallback (Tier 0).
5. **No Fake Walk-in Registrations**: In-line door staff cannot register friends on the spot; only pre-existing registrations with verified credentials gain door entry.

---

## 5. MoSCoW Prioritization Table

| Requirement ID | Title                                    | Persona    |   MoSCoW   |    Target Stage     |
| :------------- | :--------------------------------------- | :--------- | :--------: | :-----------------: |
| **EH-01**      | Event Proposal Submission (5 Fields)     | Event Head |  **MUST**  |   Stage 1 / PBAC    |
| **EH-02**      | Volunteer Scanner Delegation             | Event Head |  **MUST**  |   Stage 1 / PBAC    |
| **EH-03**      | Registration Monitoring & Capping        | Event Head |  **MUST**  | Stage 4 / Last Seat |
| **EH-04**      | QR Door Check-in (<500 ms)               | Event Head |  **MUST**  |   Stage 4 / Tests   |
| **EH-05**      | Broadcast Announcements Queue            | Event Head | **SHOULD** |       Stage 5       |
| **GU-01**      | View External Upcoming Events            | Guest      |  **MUST**  |       Stage 1       |
| **GU-02**      | View Campus Media Gallery                | Guest      | **SHOULD** |       Stage 1       |
| **GU-03**      | External Eligible Registration           | Guest      |  **MUST**  |       Stage 1       |
| **GU-04**      | View Event Details (7 Attributes)        | Guest      |  **MUST**  |       Stage 1       |
| **GU-05**      | Faceted Search & Filter                  | Guest      |  **MUST**  |       Stage 1       |
| **GU-06**      | Registration Confirmation Email          | Guest      |  **MUST**  |       Stage 1       |
| **GU-07**      | View Ticket & Signed QR Code             | Guest      |  **MUST**  |       Stage 4       |
| **GU-08**      | Real-time Update Notices                 | Guest      | **SHOULD** |       Stage 5       |
| **GU-09**      | Provide Registration & PII Masking       | Guest      |  **MUST**  |       Stage 1       |
| **GU-10**      | Seat Availability & Waitlist Badge       | Guest      |  **MUST**  |       Stage 4       |
| **SP-01**      | Dedicated Sponsor Page & Banner          | Sponsor    |  **MUST**  |       Stage 1       |
| **SP-02**      | Sponsored Fair Lucky Draw                | Sponsor    | **SHOULD** |  Stage 3 / Domain   |
| **ST-01**      | Atomic Last Seat Allocation (149 vs 100) | Student    |  **MUST**  |   Stage 4 / Tests   |
| **ST-02**      | Gamification XP Ledger & Badges          | Student    | **SHOULD** |       Stage 3       |
| **VL-01**      | Rapid Door Ticket Verification           | Volunteer  |  **MUST**  |       Stage 4       |
| **FC-01**      | Departmental Proposal Approval & Clashes | Faculty    |  **MUST**  |   Stage 1 / PBAC    |
| **DS-01**      | Dean Budget Clearance & Executive Audit  | Dean       |  **MUST**  |   Stage 1 / PBAC    |
| **AD-01**      | Emergency Cancellation Broadcast         | Admin      |  **MUST**  |   Stage 1 / PBAC    |
