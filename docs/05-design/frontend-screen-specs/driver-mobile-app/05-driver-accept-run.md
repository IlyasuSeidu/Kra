# DriverAcceptRun Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverAcceptRun` |
| Route | `/(ops)/driver/runs/:deliveryId/accept` |
| Primary test ID | `screen-driver-accept-run` |
| Surface | Driver mobile app |
| Backend coverage | `accept_run` through `POST /v1/deliveries/:id/accept-run` |
| Offline critical | Yes |
| Required role | `driver` |
| Parent screen | `AssignedRunDetail` |
| Primary mutation | `accept_run` |
| Supporting read | `get_delivery` when detail is not fresh |
| Related routes | `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/manifest`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Accept-only current backend, reject path documented as backend gap |

## Product Job
`DriverAcceptRun` lets an assigned driver acknowledge that they will take the assigned inter-station run before any custody transfer occurs.

It answers:

- `Is this run still assigned to me?`
- `Am I inside the response window?`
- `What am I agreeing to do?`
- `What happens after I accept?`
- `Can I safely queue acceptance offline?`

## Product Standard
This screen must separate assignment acknowledgement from physical custody. Accepting a run means the driver commits to the work, but custody moves only after the assigned driver scans the correct package in the pickup scan flow.

The driver should be able to:

- Review the run identity.
- See the acceptance deadline when trusted.
- Understand that scan is required after acceptance.
- Add an optional note when useful.
- Accept without ambiguity.
- Recover if the assignment changed.
- Queue acceptance only when safe.

The screen must never:

- Move custody.
- Confirm pickup.
- Reveal package scan code.
- Let an unassigned driver accept.
- Let a non-driver accept.
- Claim rejection is implemented when current backend lacks a reject mutation.
- Compute the `15 minutes` deadline from screen render time.

## Audience
Primary audience:

- Driver assigned to a run and deciding whether to acknowledge it.

Secondary audience:

- Station staff expecting driver acknowledgement.
- QA validating accept-only backend behavior, offline queue, and custody separation.
- Claude Code implementing the mutation screen and tests.

## Context Of Use
The driver may be:

- At the origin station.
- Away from station but notified of assignment.
- In weak connectivity.
- Returning from a push notification.
- Near the `15 minutes` response limit.
- Trying to accept after the station changed assignment.

This screen must be fast and decisive. It is not a long form.

## Design Brief
User and job:

- A verified assigned driver must acknowledge a run and understand the next custody step.

Context:

- Time-sensitive operational decision.

Entry point:

- AssignedRunDetail, DriverHome, AssignedRuns row action, or assignment notification.

Success state:

- Backend records `driver_assignment_accepted`, or safe local outbox records the acceptance for sync.

Primary action:

- `Accept run`.

Navigation model:

- Focused stack screen with confirmation result and route to manifest or pickup scan.

Density level:

- Compact, decision-first.

Visual thesis:

- `Commit gate`: a clear assignment brief, deadline bar, custody warning, and one decisive accept action.

Restraint rule:

- Do not add route navigation, full manifest, or scanner UI here.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Start a Task](https://support.onfleet.com/hc/en-us/articles/10348790592020-Start-a-Task): supports opening an assigned task and using a clear start action from task detail.
- [Onfleet Route Load Task](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports package verification before route start and blocking route progress until load verification is complete.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local data as read source and explicit synchronization after network reconnect.
- [Android WorkManager background work](https://developer.android.com/topic/libraries/architecture/workmanager): supports deferrable reliable background work for queued sync when implementation uses native Android primitives.
- [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html): supports accessible submit progress, success, and error announcements.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible tap targets for the primary decision action.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`

## Backend Contract
Mutation:

- Operation key: `accept_run`.
- HTTP route: `POST /v1/deliveries/:id/accept-run`.
- Required capability: `accept_run`.
- Request schema: `acceptRunRequestSchema`.

Request body:

```json
{
  "note": "Run acknowledged by driver"
}
```

`note` rules:

- Optional.
- Trimmed string.
- Minimum length `3` if provided.
- Maximum length `240`.

Backend enforcement:

- Actor must have `accept_run`.
- Actor role must be `driver`.
- Delivery must exist.
- Delivery must be assigned to this driver.
- Delivery `currentStatus` must be `assigned_to_driver`.
- Backend records `driver_assignment_accepted`.
- Backend returns lifecycle response.

Current backend gap:

- Product policy says drivers must accept or reject within `15 minutes`.
- Current backend exposes `accept_run`, but no `reject_run` mutation is present.
- UI must not present a final reject submission as implemented.
- UI may offer `Cannot take this run` as a support/escalation action until backend reject exists.

Future backend improvement:

- Add `POST /v1/deliveries/:id/reject-run`.
- Add structured reject reasons.
- Add assignment response deadline fields:
  - `assignedAt`
  - `acceptanceDueAt`
  - `respondedAt`
  - `responseStatus`

## Authorization Rules
Required principal:

- `role === "driver"`.

Required scope:

- `assignedDriverId === principal.userId`.

Required status:

- `currentStatus === "assigned_to_driver"`.

Disallowed:

- Sender accepting.
- Station operator accepting through driver route.
- Final-mile courier accepting driver run.
- Admin accepting through driver route.
- Driver accepting another driver's run.
- Driver accepting after status changed.

Scope failure:

- Show `This run is not assigned to this account.`
- Route to AssignedRuns after acknowledgement.

Status failure:

- Show current safe state and route to detail.

## Acceptance Deadline
Policy:

- Driver must accept or reject within `15 minutes` of assignment.

Current data limitation:

- Detail response does not expose assignment time or due time.

Deadline behavior:

- If trusted `assignedAt` or `acceptanceDueAt` exists from notification payload, cached timeline, or future field, show countdown.
- If no trusted timestamp exists, show `Response deadline will appear after assignment sync.`
- Do not compute deadline from screen entry time.
- Do not compute deadline from `latestOccurredAt` unless event type is known to be `driver_assigned`.

Deadline states:

- More than `5 minutes`: neutral.
- `1` to `5 minutes`: amber.
- Under `1 minute`: red urgent.
- Expired: block direct accept until refresh confirms backend still allows it.

## Information Architecture
Top to bottom:

1. Header with route back.
2. Assignment identity card.
3. Deadline and sync status.
4. Commitment summary.
5. Custody separation warning.
6. Optional note field.
7. Primary accept CTA.
8. Cannot take run escalation link.
9. Offline/outbox state.

The first viewport must show run identity, deadline, and accept action.

## Layout Requirements
Compact phone:

- Single column.
- Sticky bottom primary CTA.
- Optional note collapses behind `Add note` until opened.
- Escalation link below CTA.

Large phone:

- Identity and commitment cards can show side-by-side style only if readable.

Foldable or tablet width:

- Left: assignment brief.
- Right: accept panel and warning.

System UI:

- Respect safe areas.
- Keyboard must not cover note field submit action.
- Sticky CTA must move above keyboard when note is open.

## Visual Direction
Mood:

- Serious, calm, and time-aware.

Hierarchy:

- Run identity first.
- Deadline second.
- Custody rule third.
- Accept action fourth but always visible.

Color:

- Green for safe accept.
- Amber for nearing deadline.
- Red for expired, blocked, or scope error.
- Blue-gray for offline queued state.

Typography:

- Tracking code prominent.
- Deadline uses tabular numerals.
- Custody rule uses plain language.
- Note field uses normal body size.

## Header
Title:

- `Review assignment`

Subtitle:

- `Accepting does not move custody`

Actions:

- Back.
- Refresh if online.

Do not show:

- Earnings.
- Receiver phone.
- Package scan code.
- Full route map.

## Assignment Identity Card
Required:

- Tracking code.
- Delivery ID.
- Origin station ID.
- Destination station ID.
- Service type.
- Doorstep requested flag.
- Latest update time.

Optional if from fresh detail:

- Package fragile flag.
- Size tier.
- Weight.

Do not include:

- Sender ID.
- Receiver phone.
- Payment provider reference.
- Package scan code.

## Commitment Summary
Copy:

- `Accept this run only if you can handle the station-to-station movement. Pickup still requires the package scan.`

Checklist:

- `Run is assigned to my driver account.`
- `I can go to the origin station.`
- `I understand pickup needs the scanner flow.`
- `I will report issues if package or timing is wrong.`

Checklist behavior:

- Display as information, not required checkboxes.
- Do not add friction unless compliance later requires explicit acknowledgements.

## Custody Separation Warning
Always visible before accept CTA.

Title:

- `Custody does not move here`

Body:

- `You accept the assignment on this screen. You take custody only after scanning the correct package at pickup.`

CTA link:

- `View custody rule` routes to custody chain or detail section if available.

## Optional Note
Use cases:

- Driver adds short operational note, such as arrival timing or station coordination.

Field:

- Label: `Note for station`
- Helper: `Optional. Do not include private phone numbers or payment details.`
- Max: `240` characters.

Validation:

- If empty, omit `note`.
- If non-empty and under `3` characters, show field error.
- If over `240`, prevent submit and show count.

Privacy:

- Do not log note content in analytics.

## Primary CTA
Label:

- `Accept run`

Busy label:

- `Accepting run`

Success label:

- `Run accepted`

Enabled only when:

- Role is driver.
- Delivery is assigned to this driver.
- Current status is `assigned_to_driver`.
- Payment is ready when detail is known.
- Cache is fresh enough or online refresh has confirmed status.
- No conflicting queued action for same delivery exists.

Disabled reasons:

- `Refresh this assignment before accepting.`
- `This run is no longer assigned to this account.`
- `This run cannot be accepted from its current status.`
- `Payment is not ready for movement.`
- `Resolve sync conflict first.`

## Cannot Take Run Path
Current backend:

- No reject mutation exists.

UI behavior:

- Secondary link: `Cannot take this run`
- Opens escalation sheet, not final reject mutation.

Escalation sheet:

- Title: `Tell station you cannot take this run`
- Body: `Kra does not yet have a driver rejection endpoint. This sends you to support so station staff can review the assignment.`
- Actions:
  - `Open support`
  - `Back`

Future behavior:

- Replace support escalation with `reject_run` mutation when backend exists.

## Offline Behavior
Offline allowed:

- Show cached assignment detail.
- Let driver prepare acceptance if cached detail is fresh.
- Queue `accept_run` only when safe.
- Open outbox.
- Open support draft.

Offline queue allowed only when:

- Delivery detail cache exists.
- Cache age is under `15 minutes`.
- Cached status is `assigned_to_driver`.
- Cached `assignedDriverId` matches current driver.
- No queued accept exists for same delivery.
- No conflicting queued action exists.

Offline queue payload:

- Route key: `accept_run`.
- Delivery ID.
- Optional note.
- Actor ID.
- Role.
- Local timestamp.
- Idempotency key.

Offline queue not allowed when:

- Cache missing.
- Cache stale.
- Scope not confirmed.
- Status not `assigned_to_driver`.
- Payment not ready.
- Existing queued accept for same delivery exists.

Copy:

- Allowed: `Queue acceptance`
- Not allowed: `Reconnect to accept`

## Success State
Online success:

- Show confirmation panel:
  - `Run accepted`
  - `Next: verify manifest or scan pickup.`

Primary next:

- If manifest is required or package summary missing: `Open manifest`
- Otherwise: `Open pickup scan`

Secondary:

- `Back to run detail`

Queued success:

- `Acceptance queued`
- `It will sync when connection returns. Do not accept the same run again.`
- CTA: `Open outbox`

Rules:

- Do not say custody moved.
- Do not route directly to in-transit.

## Error States
`loading`:

- Load cached detail or fetch fresh detail.

`ready`:

- Accept CTA available when conditions pass.

`submitting`:

- Disable inputs and primary CTA.
- Keep visible progress.

`accepted`:

- Success panel and next action routes.

`queued_offline`:

- Queued state with outbox link.

`stale_cache`:

- CTA disabled.
- Copy: `Refresh this assignment before accepting.`

`scope_denied`:

- Copy: `This run is not assigned to this account.`

`status_changed`:

- Copy: `This run cannot be accepted from its current status.`

`payment_blocked`:

- Copy: `Station must resolve payment before movement.`

`duplicate_queued`:

- Copy: `Acceptance is already waiting to sync.`

`api_error`:

- Copy: `Could not accept this run. Try again.`

`session_expired`:

- Route to sign-in with safe return route.

## API Request
Online submit:

```http
POST /v1/deliveries/:deliveryId/accept-run
Authorization: Bearer <token>
Idempotency-Key: <key>
Content-Type: application/json
```

Body without note:

```json
{}
```

Body with note:

```json
{
  "note": "Arriving at origin station shortly"
}
```

Client rules:

- Generate idempotency key before submit.
- Reuse same idempotency key for retry of same action.
- Do not retry automatically after scope or status errors.
- Refresh detail after successful response.

## Data Requirements
Required from detail or route state:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `assignedDriverId`
- `latestEvent`

Required from auth:

- `principal.userId`
- `principal.role`

Optional:

- `serviceType`
- `package`
- `doorstepRequested`
- trusted `assignedAt`
- trusted `acceptanceDueAt`

## State Model
```ts
type DriverAcceptRunState =
  | { kind: "loading" }
  | { kind: "ready"; detail: AcceptRunDetail; deadline?: AcceptanceDeadline }
  | { kind: "submitting"; detail: AcceptRunDetail }
  | { kind: "accepted"; deliveryId: string; responseEventId: string }
  | { kind: "queued_offline"; deliveryId: string; localActionId: string }
  | { kind: "stale_cache"; detail?: AcceptRunDetail }
  | { kind: "scope_denied" }
  | { kind: "status_changed"; currentStatus: string }
  | { kind: "payment_blocked" }
  | { kind: "duplicate_queued" }
  | { kind: "api_error"; recoverable: boolean };
```

## Interaction Flow
1. Driver opens accept route.
2. Screen validates role and delivery ID route param.
3. Screen loads cached detail.
4. Screen refreshes detail online when possible.
5. Screen validates scope, status, payment, cache age, and outbox conflicts.
6. Driver optionally adds note.
7. Driver taps `Accept run`.
8. Online path calls `accept_run`.
9. Offline safe path creates outbox action.
10. Success routes to manifest or pickup scan.
11. Failure keeps driver on screen with recovery.

## Navigation Rules
Back:

- Return to AssignedRunDetail.

Success:

- `Open manifest` routes to `/(ops)/driver/runs/:deliveryId/manifest`.
- `Open pickup scan` routes to `/(ops)/driver/runs/:deliveryId/pickup-scan`.

Support:

- `Cannot take this run` routes to `/(ops)/driver/support?deliveryId=<deliveryId>&reason=cannot_take_run`.

Outbox:

- Queued state routes to `/(ops)/offline-outbox`.

## Accessibility
Touch:

- Primary CTA minimum height: `56dp`.
- Secondary actions minimum target: `48dp`.

Screen reader:

- Announce screen title, tracking code, deadline, custody warning, and CTA.
- Submitting, accepted, queued, and error states use status announcements.
- Deadline threshold changes should be announced at meaningful thresholds only.

Focus:

- On validation error, focus note field if note is invalid.
- On API error, focus error banner.
- On success, focus success title.

Color:

- Deadline color must include text.
- Disabled CTA must include reason text.

Motion:

- Submit button can show contained progress.
- Success panel can slide up lightly.
- Respect reduced motion.

## Analytics
Events:

- `driver_accept_run_viewed`
- `driver_accept_run_deadline_shown`
- `driver_accept_run_note_opened`
- `driver_accept_run_submitted`
- `driver_accept_run_succeeded`
- `driver_accept_run_queued_offline`
- `driver_accept_run_failed`
- `driver_accept_run_scope_denied`
- `driver_accept_run_status_changed`
- `driver_accept_run_cannot_take_opened`
- `driver_accept_run_support_opened`

Allowed properties:

- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `networkState`
- `cacheAgeBucket`
- `deadlineBucket`
- `hasNote`
- `failureCode`

Forbidden properties:

- Note text.
- Receiver phone.
- Sender ID.
- Package scan code.
- Payment provider reference.
- Raw token.
- GPS coordinates.

## QA Acceptance Criteria
Routing:

- Screen route is `/(ops)/driver/runs/:deliveryId/accept`.
- Top-level test ID is `screen-driver-accept-run`.
- Back returns to assigned run detail.

Authorization:

- Assigned driver can accept.
- Driver assigned to another run cannot accept.
- Sender cannot accept.
- Station operator cannot accept through driver route.
- Final-mile courier cannot accept.

Mutation:

- Valid submit calls `accept_run`.
- Empty note omits `note`.
- Valid note sends `note`.
- Invalid note blocks submit.
- Duplicate submit is blocked while pending.
- Idempotency key is used.

State:

- Status must be `assigned_to_driver`.
- Non-paid payment state blocks movement.
- Status change error refreshes detail.
- Scope denial clears cached detail for that delivery.

Offline:

- Fresh cache allows queued acceptance.
- Stale cache blocks queued acceptance.
- Missing cache blocks queued acceptance.
- Duplicate queued accept is blocked.
- Queued success links to outbox.

Custody:

- Accept success does not say custody moved.
- Success routes to manifest or pickup scan.
- Pickup scan remains separate.

Accessibility:

- Status changes are announced.
- Error banner receives focus.
- Touch targets meet mobile standards.
- Keyboard does not cover note submit.

## Test Matrix
Happy path:

- Load fresh detail.
- Submit accept with no note.
- Submit accept with valid note.
- Show accepted success.
- Route to manifest.
- Route to pickup scan.

Error path:

- API network failure.
- Status changed.
- Scope denied.
- Not found.
- Payment blocked.
- Invalid note.
- Session expired.

Offline path:

- Fresh cached detail queue.
- Stale cache block.
- No cache block.
- Existing queued accept block.
- Outbox conflict block.

Deadline path:

- Trusted due time available.
- Deadline unknown.
- Near deadline.
- Expired deadline with refresh required.

Backend gap path:

- `Cannot take this run` opens escalation sheet.
- Escalation routes to support.
- No reject mutation is called.

## Component Inventory
`DriverAcceptRunScreen`:

- Owns route, role gate, detail load, mutation, and outbox path.

`AcceptRunAssignmentCard`:

- Run identity and route.

`AcceptRunDeadlineBar`:

- Deadline or unknown deadline state.

`AcceptRunCommitmentCard`:

- Driver commitment summary.

`AcceptRunCustodyWarning`:

- Explains acceptance versus custody.

`AcceptRunNoteField`:

- Optional note with validation.

`AcceptRunPrimaryAction`:

- Online submit or offline queue.

`AcceptRunCannotTakeSheet`:

- Current support escalation path.

`AcceptRunResultPanel`:

- Accepted or queued result.

`AcceptRunErrorBanner`:

- API, scope, status, payment, stale cache, duplicate queued errors.

## Implementation Notes For Claude Code
Create under:

- `apps/mobile/features/driver/accept-run`

Suggested files:

- `DriverAcceptRunScreen.tsx`
- `AcceptRunAssignmentCard.tsx`
- `AcceptRunDeadlineBar.tsx`
- `AcceptRunCommitmentCard.tsx`
- `AcceptRunCustodyWarning.tsx`
- `AcceptRunNoteField.tsx`
- `AcceptRunPrimaryAction.tsx`
- `AcceptRunCannotTakeSheet.tsx`
- `AcceptRunResultPanel.tsx`
- `AcceptRunErrorBanner.tsx`
- `useDriverAcceptRun.ts`
- `acceptRunMapping.ts`
- `acceptRunOutbox.ts`
- `acceptRun.analytics.ts`
- `DriverAcceptRunScreen.test.tsx`

Implementation requirements:

- Use typed mutation for `accept_run`.
- Validate note with shared request schema rules.
- Use detail cache and refresh before submit when online.
- Check role, assignment scope, status, payment, cache age, and outbox conflict before enabling submit.
- Use idempotency key for mutation and queued action.
- Do not implement rejection mutation.
- Do not implement pickup scan.
- Do not say custody moved.

## Out Of Scope
- Reject mutation.
- Driver reassignment.
- Pickup scan.
- Manifest verification.
- Route navigation.
- Destination handoff.
- Payment resolution.
- Full support thread.
- Admin override.

## Done Definition
DriverAcceptRun is complete when:

- It exists at `/(ops)/driver/runs/:deliveryId/accept`.
- It exposes `screen-driver-accept-run`.
- It calls `accept_run` for valid online acceptance.
- It can queue acceptance offline only when cache is fresh and scope-safe.
- It blocks stale, wrong-scope, wrong-status, duplicate, and payment-blocked acceptance.
- It shows the `15 minutes` deadline only when trusted timestamp data exists.
- It clearly states that custody moves only after pickup scan.
- It routes success to manifest or pickup scan.
- It escalates `Cannot take this run` to support until a reject endpoint exists.
- It passes authorization, mutation, offline, deadline, custody, accessibility, and backend-gap tests.

## Claude Code Handoff Summary
Build `DriverAcceptRun` as a focused acceptance gate. It must verify assigned-driver scope, show the assignment brief and custody warning, optionally capture a short note, call `accept_run` online, queue acceptance offline only when safe, and route success to manifest or pickup scan. Do not implement rejection, pickup scanning, route navigation, payment handling, or any claim that acceptance moved custody.
