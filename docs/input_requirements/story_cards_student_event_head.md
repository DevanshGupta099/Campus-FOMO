# Story Cards: Student Event Head

## Story Card 1: Event Proposal Submission

**USER STORY**
As a Student Event Head, I want to submit an event proposal form, so that I can get official approval and budget allocation from the Faculty/Dean.

**ACCEPTANCE CRITERIA**
Given the campus fest dates are officially announced,
When I fill out all 5 required proposal fields (Title, Description, Venue, Budget, Team Size) and click submit,
Then the event status immediately changes to "Pending Review" and 1 email notification is triggered to the designated faculty approver.

**NON-FUNCTIONAL REQUIREMENTS**

- Performance: Proposal form attachments (up to 5MB) must upload and save in under 3 seconds.
- Security / privacy: Only the submitting event head and authorized faculty/dean roles can view the draft proposal details before it goes public.

**PRIORITY:** Must
**ASKED FOR BY:** Student Event Head

---

## Story Card 2: Volunteer Delegation

**USER STORY**
As a Student Event Head, I want to assign volunteer roles to other registered students, so that I can delegate specific event-day tasks like ticket scanning.

**ACCEPTANCE CRITERIA**
Given my event has been approved by the faculty,
When I search for a student's ID and assign them the "QR Scanner" role,
Then that specific student instantly gains access to the scanning module on their personal dashboard.

**NON-FUNCTIONAL REQUIREMENTS**

- Performance: The student ID search query must return exact matches in under 500 milliseconds.
- Security / privacy: Volunteers assigned the "Scanner" role are strictly restricted by RBAC (Role-Based Access Control) from viewing the event's financial budget or modifying event rules.

**PRIORITY:** Must
**ASKED FOR BY:** Student Event Head

---

## Story Card 3: Registration Monitoring & Capping

**USER STORY**
As a Student Event Head, I want to monitor live registrations and set a maximum capacity cap, so that the event venue does not violate fire safety limits.

**ACCEPTANCE CRITERIA**
Given the assigned venue has a strict capacity of 50 people,
When the 50th participant successfully completes their registration,
Then the system automatically closes regular registration and offers the next 10 applicants a spot on an automated waitlist.

**NON-FUNCTIONAL REQUIREMENTS**

- Performance: The live registration counter on the dashboard must update within 1 second of a new ticket being confirmed in the database.
- Security / privacy: Participant email addresses and phone numbers are masked (e.g., a***@college.edu) on the dashboard unless the head explicitly exports them for official mass communication.

**PRIORITY:** Must
**ASKED FOR BY:** Student Event Head

---

## Story Card 4: Event Day Check-in

**USER STORY**
As a Student Event Head, I want to use a mobile QR scanner interface to check in participants, so that the entry line moves rapidly and our attendance counts are accurate.

**ACCEPTANCE CRITERIA**
Given a participant presents a valid event QR code ticket at the venue door,
When I or my volunteer scan it with our smartphone camera,
Then the app displays a green "Verified" checkmark and increments the live event attendance counter by exactly 1.

**NON-FUNCTIONAL REQUIREMENTS**

- Performance: QR code validation must process and return a result in under 500 milliseconds over a standard 4G mobile network to prevent bottlenecks.
- Security / privacy: The web/mobile scanning interface must not store personal ticket data or participant PII in the local device cache.

**PRIORITY:** Must
**ASKED FOR BY:** Student Event Head

---

## Story Card 5: Broadcast Announcements

**USER STORY**
As a Student Event Head, I want to send broadcast updates to all registered participants, so that I can immediately inform them of last-minute changes like a venue shift.

**ACCEPTANCE CRITERIA**
Given 100 participants are successfully registered for my event,
When I type an urgent update message and click "Broadcast",
Then all 100 participants receive the update via email and push notification within 2 minutes.

**NON-FUNCTIONAL REQUIREMENTS**

- Performance: The broadcast messaging queue must be able to dispatch at least 1,000 messages per minute without lagging the main application's performance.
- Security / privacy: Bulk emails must be routed through a service that hides recipient addresses (BCC equivalent) so participants cannot see each other's contact information.

**PRIORITY:** Should
**ASKED FOR BY:** Student Event Head
