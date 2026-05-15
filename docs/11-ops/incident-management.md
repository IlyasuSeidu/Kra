# Incident Management

## Incident Types
- Lost package.
- Damaged package.
- Failed payment.
- Delayed route.
- Incorrect handoff.
- Final-mile delivery failure.
- Station backlog.

## Response Model
1. Create issue record.
2. Assign owner based on custody or system domain.
3. Triage severity.
4. Resolve or escalate.
5. Close with resolution note and evidence.

## Operations Rule
Serious incidents should result in both a support resolution and a data review to prevent recurrence.

## Approved V1 Pilot Readiness Rule
- No launch station may go live with an unresolved `p1` incident.
- A `p1` incident for pilot-readiness purposes includes:
  - inability to complete intake, dispatch, or receipt in the live system
  - repeated authentication failure for active station staff
  - repeated custody logging failure
  - payment state progressing incorrectly into transport
- Any `p1` during the validation window resets the affected station to remediation status until the flow is revalidated.

## Severity Definitions
- `P1`: active package loss, payment integrity breach, safety issue, or system outage affecting core flow
- `P2`: major delay, repeated station backlog, damaged package, or final-mile failure requiring human review
- `P3`: non-blocking support or UI issue

## Response Windows
- `P1`: acknowledge in `10 minutes`, active owner immediately
- `P2`: acknowledge in `30 minutes`
- `P3`: acknowledge in `4 business hours`

## Category Owners
- package and route incidents: `ops_admin`
- payment incidents: `finance_admin`
- support process incidents: `support_admin`
- system incidents: `technical owner`

## Post-Incident Review Template
- incident summary
- impacted deliveries or payments
- root cause
- containment action
- follow-up action
- owner
- due date

## Escalation Trigger
- escalate to executive or business owner on:
  - repeated `P1` in same week
  - confirmed fraud pattern
  - route shutdown
  - severe payment integrity event

## Baseline Status
This file is now concrete enough to guide incident response and review.
