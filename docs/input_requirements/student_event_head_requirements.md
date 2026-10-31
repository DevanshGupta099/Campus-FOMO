# Campus Fest Application: Student Event Head Persona

This document outlines the software requirements and core use cases for the **Student Event Head** persona. This persona requires a specialized dashboard that balances operational control (managing volunteers, checking in participants) with bureaucratic workflows (getting faculty approvals, requesting campus venues).

## Functional Requirements

- **Event Proposal & Approval Workflow:** The system must allow the head to submit detailed event proposals (descriptions, rules, team size limits, required venues) and track the approval status from the Faculty/Dean in real-time.
- **Resource & Venue Management:** The ability to request specific campus locations (e.g., mapping out specific zones for a campus-wide treasure hunt) and reserve technical resources (AV equipment, lab computers, Wi-Fi access codes).
- **Volunteer Role Delegation:** The head must be able to invite other students as sub-coordinators or volunteers, assigning them specific permissions (e.g., only allowing a volunteer to scan entry QR codes, but not alter the event description).
- **Participant Management & Analytics:** A dashboard to monitor live registration counts, cap ticket sales, approve/reject specific team entries, and view participant demographics.
- **Live Event Execution:** A rapid check-in interface (such as a built-in QR code scanner) to mark attendees as present, and a system to push live announcements or technical riddles via SMS/email to registered participants.
- **Budgeting & Sponsorship Tracking:** A module to submit expense receipts for reimbursement and track how much of the allocated sponsor budget has been utilized.

## Non-Functional Requirements

- **Mobile-First Responsiveness:** Event heads are rarely at a desk during the fest; the dashboard must be fully functional on a smartphone over a potentially congested campus cellular network.
- **High Availability & Low Latency:** QR code check-ins and live leaderboard updates must process in under a second to prevent bottlenecks at venue doors.
- **Data Isolation:** The event head must only have read/write access to their specific event's data, strictly isolated from other ongoing fest activities.

## Core Use Cases

| Use Case ID | Use Case Name                | Description                                                                                                                         | Triggers & Pre-conditions                                                                     |
| :---------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **UC-01**   | Submit Event Proposal        | The head fills out a structured form detailing the event scope, budget, and logistical needs for administrative review.             | _Pre-condition:_ Authenticated as Student Event Head.<br>_Trigger:_ Fest dates are announced. |
| **UC-02**   | Allocate Volunteer Roles     | The head searches for registered students and assigns them "Volunteer" permissions for their specific event.                        | _Pre-condition:_ Event is approved.<br>_Trigger:_ Head needs team assistance.                 |
| **UC-03**   | Manage Registrations         | The head monitors incoming sign-ups, enforces team-size limits, and manually approves waitlisted teams if dropouts occur.           | _Pre-condition:_ Event registration is live.                                                  |
| **UC-04**   | Broadcast Updates            | The head sends push notifications or emails to all registered participants (e.g., venue changes or rule clarifications).            | _Trigger:_ Unforeseen logistical changes or scheduled event milestones.                       |
| **UC-05**   | Execute Participant Check-in | The head or assigned volunteers scan attendee QR codes at the venue door to validate tickets and update the live attendance roster. | _Pre-condition:_ Event day has arrived; participant has a valid ticket.                       |
| **UC-06**   | Submit Post-Event Report     | The head uploads final attendance numbers, expenditure receipts, and winner details to close out the event.                         | _Trigger:_ Event concludes.                                                                   |
