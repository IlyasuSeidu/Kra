# DriverMarkInTransit Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverMarkInTransit` |
| Route | `/(ops)/driver/runs/:deliveryId/in-transit` |
| Primary test ID | `screen-driver-mark-in-transit` |
| Surface | Driver mobile app |
| Backend coverage | `mark_in_transit` through `POST /v1/deliveries/:id/mark-in-transit` |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | `update_transit_status` |
| Required custody | Driver custody confirmed |
| Parent screen | `DriverRoute` |
| Primary mutation | `mark_in_transit` |
| Supporting reads | `get_delivery`, `get_delivery_timeline`, local outbox |
| Related routes | `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/runs/:deliveryId/destination-arrival`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Explicit driver transport status mutation using current API |

## Product Job
`DriverMarkInTransit` lets the assigned driver explicitly record that the package has started transport from origin toward destination after custody has already moved to the driver.

The screen answers:

- `Is this delivery eligible to become in transit?`
- `Am I the assigned driver and current custodian?`
- `What state will this action change?`
- `Can I add a concise operational note?`
- `Can this action be safely queued offline?`
- `What happens after the backend records in-transit status?`

## Product Standard
This screen is a lifecycle mutation gate. It must be clear, fast, auditable, and separate from route navigation.

The driver should be able to:

- Verify delivery identity.
- Confirm custody is already driver-held.
- Understand this action changes status to `in_transit`.
- Add an optional short note.
- Submit online with immediate feedback.
- Queue offline only when safe.
- Avoid duplicate in-transit submissions.
- Recover from status conflict, assignment change, network failure, and validation errors.

The screen must never:

- Mark in transit before pickup custody is confirmed.
- Mark in transit automatically when navigation opens.
- Use GPS as the only proof for this mutation.
- Let a station operator submit this driver action.
- Let an unassigned driver submit.
- Reveal raw package scan code.
- Treat queued offline state as server-confirmed until sync succeeds.
- Hide that this is a lifecycle status change.

## Audience
Primary audience:

- Assigned driver who has accepted custody and is ready to start transport.

Secondary audience:

- Destination station expecting inbound packages.
- Support agents reviewing transport timeline.
- QA validating state transition and offline behavior.
- Claude Code implementing mutation UI and tests.

## Context Of Use
The driver may open this screen:

- From `DriverRoute` after opening navigation.
- From active run detail.
- From an offline cached route screen.
- After returning from an external navigation app.
- While parked before departure.
- After a station delay or vehicle issue.

The screen should require little attention and no complex decision-making. It is a clear status update, not a route planning screen.

## Design Brief
User and job:

- A driver with custody needs to record that transport has started.

Context:

- Field use, low bandwidth, safety-sensitive, and audit-sensitive.

Entry point:

- `DriverRoute`, active run row, push notification, or offline outbox recovery.

Success state:

- Backend records `delivery_marked_in_transit`, status becomes `in_transit`, and custody remains with driver.

Primary action:

- `Mark in transit`

Navigation model:

- Focused mutation screen that returns to route workflow or destination arrival preparation after success.

Density level:

- Low: identity, status change explanation, optional note, one primary action.

Visual thesis:

- `Status checkpoint`: compact route card, custody badge, clear before/after status, and one explicit mutation action.

Restraint rule:

- Do not add scanner, map, destination receipt, or route optimization here.

## External Research Used
Only directly relevant sources were used:

- [Android WorkManager persistent work](https://developer.android.com/develop/background-work/background-tasks/persistent): supports reliable background work when a sync task must continue after leaving the screen, app exit, or device restart.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local data as visible source, queued writes, sync queues, and conflict resolution after reconnect.
- [Apple Human Interface Guidelines: Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback): supports clear status feedback for important actions without unnecessary confirmation noise.
- [WCAG status messages](https://w3c.github.io/wcag21/understanding/21/status-messages.html): supports accessible submit, success, and error updates.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large action targets for field use.
- [NHTSA visual-manual driver distraction guidelines](https://www.nhtsa.gov/document/visual-manual-nhtsa-driver-distraction-guidelines-vehicle-electronic-devices): supports minimizing visual-manual task burden around driving contexts.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-data/state-machine.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/09-driver-route.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Mutation:

- Operation key: `mark_in_transit`.
- HTTP route: `POST /v1/deliveries/:id/mark-in-transit`.
- Request schema: `markInTransitRequestSchema`.
- Response schema: `deliveryLifecycleResponseSchema`.
- Required capability: `update_transit_status`.

Request body:

```json
{
  "note": "optional operational note"
}
```

Validation:

- `note` is optional.
- `note` is trimmed.
- If present, `note` minimum length is `3`.
- If present, `note` maximum length is `240`.

Backend behavior:

- Requires actor role `driver`.
- Requires assigned driver to match `delivery.assignedDriverId`.
- Applies transition to `in_transit`.
- Emits event `delivery_marked_in_transit`.
- Keeps current custodian role as `driver`.
- Keeps current custodian actor as the driver actor ID.
- Returns lifecycle response with `eventId`, `deliveryId`, `status`, `paymentStatus`, and `occurredAt`.

State machine expectation:

- Normal transition is `dispatched_from_origin` -> `in_transit`.
- If delivery is already `in_transit`, UI should show already-active state rather than resubmitting.
- If delivery moved beyond `in_transit`, UI should route forward.

## Backend Non-Negotiables
- `mark_in_transit` is driver-owned.
- The source driver must be assigned to the delivery.
- Custody must remain driver-owned.
- The screen must not call destination receipt.
- The screen must not create proof assets.
- Server success is the only final in-transit confirmation.
- Offline queued state is not final until replay succeeds.

## Data Dependencies
Required:

- `deliveryId` route parameter.
- Authenticated actor ID.
- Authenticated role.
- Capability list.
- Delivery detail.
- Current status.
- Assigned driver ID.
- Custody role and actor when available.
- Origin station ID.
- Destination station ID.
- Outbox state.

Recommended:

- Tracking code.
- Station names.
- Cached route context.
- Latest timeline event.
- Network state.
- Last sync timestamp.

Optional:

- External navigation opened timestamp.
- Driver-local package-in-vehicle confirmation.
- Current coarse location if permission already exists and policy allows.

Never required:

- Raw package scan code.
- Receiver proof.
- Receiver private phone.
- Sender private ID.
- Background location.

## Route Parameters
Route:

- `/(ops)/driver/runs/:deliveryId/in-transit`

Required:

- `deliveryId`

Invalid parameter handling:

- Missing route parameter returns to run list.
- Malformed route parameter shows not found.
- Out-of-scope delivery shows scope denied.
- Not-yet-picked-up delivery routes to pickup scan.

## Entry Rules
Allow mutation when:

- User role is `driver`.
- User has `update_transit_status`.
- Delivery assigned driver is the current actor.
- Delivery status is `dispatched_from_origin`.
- Custody is driver-held when known.
- No matching pending outbox action exists.

Allow read-only continuation when:

- Delivery is already `in_transit`.
- Delivery is beyond `in_transit`.
- Offline cache is present but stale.

Block mutation when:

- Delivery is not assigned to current driver.
- Delivery status is before pickup.
- Delivery status is terminal.
- Delivery is routed to issue queue.
- Payment status blocks transport according to backend response.
- Outbox already contains pending `mark_in_transit`.

## Information Architecture
Primary sections:

- Mutation header.
- Delivery identity card.
- Before/after status card.
- Custody confirmation strip.
- Optional note field.
- Offline/outbox banner.
- Safety reminder.
- Primary action footer.

Screen order:

- Header: `Mark in transit`
- Status: `Ready to start transport`
- Route card: origin -> destination.
- Status change card: `Dispatched from origin` -> `In transit`.
- Note field.
- Primary CTA.
- Support/custody links.

## Visual Direction
This screen should feel like a checkpoint stamp: serious, fast, and auditable.

Art direction:

- Crisp route checkpoint card.
- Strong before/after state contrast.
- Large single primary button.
- Subtle stamp-style success after server response.
- Amber offline pending state.
- Red conflict state.

Typography:

- Header should be bold and short.
- Status labels should be readable at a glance.
- Note helper should be concise.
- Event ID after success uses mono or tabular styling.

Motion:

- Primary button loading state uses compact progress.
- Success receipt slides in once.
- No celebratory animation.
- No looping route motion.
- Reduced motion uses immediate state replacement.

## Layout
Mobile portrait:

- Top safe area: back, title, network badge.
- Identity card.
- Status change panel.
- Note input.
- Safety reminder.
- Sticky bottom CTA.

Small screen:

- Collapse station details.
- Keep status change and CTA visible.
- Put support in overflow.

Landscape:

- Left: identity and status change.
- Right: note, safety, action.

Driving or movement detected:

- Show safety compact mode.
- Hide note entry until driver confirms parked state.
- Keep `Mark in transit` visible only when safe policy allows one-tap status update.

## Component Inventory
Required components:

- `DriverMarkInTransitScreen`
- `TransitMutationHeader`
- `DeliveryRouteIdentityCard`
- `TransitStatusChangeCard`
- `DriverCustodyConfirmStrip`
- `TransitNoteField`
- `TransitOfflineBanner`
- `TransitPendingOutboxCard`
- `TransitSafetyReminder`
- `TransitSubmitFooter`
- `TransitSuccessReceipt`
- `TransitConflictPanel`
- `TransitSupportActions`

Shared component reuse:

- Reuse delivery identity strip.
- Reuse route spine.
- Reuse status chips.
- Reuse outbox action card.
- Reuse action recovery panel.
- Reuse lifecycle receipt pattern from custody accepted screen.

Do not create:

- Scanner.
- Map.
- Navigation provider sheet.
- Destination receipt flow.
- Proof upload flow.

## Primary Online Flow
1. Driver opens screen from route.
2. Screen loads cached delivery detail.
3. Screen verifies role, capability, assignment, status, and custody.
4. Screen shows status change summary.
5. Driver optionally adds note.
6. Driver taps `Mark in transit`.
7. UI submits `mark_in_transit`.
8. Server returns lifecycle response with status `in_transit`.
9. UI shows success receipt.
10. UI invalidates delivery, timeline, and driver queue.
11. UI routes to `DriverRoute` or `DriverDestinationArrival`.

## Offline Flow
Offline is allowed when the local state is fresh enough to safely queue the status update.

Offline prerequisites:

- Delivery detail exists in local cache.
- Cached delivery belongs to current driver.
- Cached status is `dispatched_from_origin`.
- Driver custody is confirmed in cache.
- No pending `mark_in_transit` action exists.
- Auth session is valid.
- Cache age is within configured freshness limit.

Recommended freshness limit:

- Default to `15 minutes` unless platform configuration provides a different value.

Queued action payload:

```json
{
  "localActionId": "generated local action id",
  "idempotencyKey": "generated transit idempotency key",
  "actorId": "current driver actor id",
  "role": "driver",
  "deliveryId": "route delivery id",
  "operation": "mark_in_transit",
  "note": "optional note",
  "localTimestamp": "device time in ISO format"
}
```

Offline copy:

- Title: `In-transit update saved`
- Body: `This update will sync when your connection returns. The server is final after sync succeeds.`
- Primary: `Open route`
- Secondary: `View outbox`

Offline rules:

- Queued state may show `Pending sync`.
- Do not show server event ID until sync succeeds.
- Do not submit duplicate queued action.
- Do not queue if current cache indicates issue-blocked or status conflict.

Reconnect:

- Drain outbox with idempotency key.
- On success, update status to `in_transit`.
- On conflict, preserve local action and route to recovery.
- On `INVALID_STATUS_TRANSITION`, refetch delivery and show latest state.
- On `FORBIDDEN`, preserve the failed local action, mark it scope-denied, and route to recovery so the driver or support can explicitly discard or resolve it.

## Note Field
Purpose:

- Capture concise operational context when needed.

Default:

- Empty.

Label:

- `Transit note`

Helper:

- `Optional. Add a short reason only if useful for operations.`

Validation:

- Empty is valid.
- Non-empty must trim to at least 3 characters.
- Maximum 240 characters.
- Reject only whitespace.

Suggested note use:

- Station departure delay.
- Vehicle loading issue.
- Route safety note.
- Weather or road condition note.

Do not use note for:

- Raw package scan code.
- Receiver private details.
- Payment references.
- Long incident report. Use support issue flow.

## Success State
Display after server success:

- Title: `Marked in transit`
- Body: `This package is now recorded as moving toward destination station.`
- Event label: `delivery_marked_in_transit`
- Status: `in_transit`
- Timestamp: server `occurredAt`
- Primary: `Continue route`
- Secondary: `Prepare destination arrival`

Post-success behavior:

- Save local lifecycle receipt.
- Invalidate delivery detail.
- Invalidate timeline.
- Invalidate driver queue.
- Clear matching outbox action.
- Announce success.

Do not:

- Show destination receipt success.
- Claim arrival.
- Change custody owner.

## State Model
Required states:

- `initializing`
- `loading_delivery`
- `ready_to_mark`
- `note_invalid`
- `submitting`
- `marked_in_transit`
- `offline_ready`
- `offline_queued`
- `offline_blocked`
- `pending_duplicate`
- `already_in_transit`
- `already_beyond_transit`
- `custody_required`
- `scope_denied`
- `payment_blocked`
- `issue_blocked`
- `status_conflict`
- `rate_limited`
- `session_expired`
- `not_found`
- `api_error`

State transitions:

- `loading_delivery` -> `ready_to_mark` when all gates pass.
- `ready_to_mark` -> `submitting` on CTA.
- `submitting` -> `marked_in_transit` on server success.
- `submitting` -> `status_conflict` on invalid transition.
- `ready_to_mark` -> `offline_queued` when offline safe queue succeeds.
- `offline_queued` -> `marked_in_transit` after sync success.
- `offline_queued` -> `status_conflict` after sync conflict.
- `ready_to_mark` -> `note_invalid` when note fails local validation.

## Error Handling
`FORBIDDEN`:

- Title: `Not assigned to you`
- Body: `Only the assigned driver can mark this package in transit. Do not continue movement.`
- Primary: `Back to runs`

`INVALID_STATUS_TRANSITION`:

- Title: `Status changed`
- Body: `This package can no longer be marked in transit from its current state. Refresh the run.`
- Primary: `Refresh`
- Secondary: `View custody chain`

`NOT_FOUND`:

- Title: `Delivery not found`
- Body: `This delivery could not be loaded. Contact support before changing route status.`
- Primary: `Back to runs`

`VALIDATION_ERROR`:

- Title: `Check note`
- Body: `The note must be 3 to 240 characters when provided.`
- Primary: `Edit note`

`RATE_LIMITED`:

- Title: `Too many attempts`
- Body: `Wait a moment before trying again.`
- Primary: `Try again`

Network timeout:

- If request is queued, show pending outbox.
- If request state is unknown, refetch delivery before allowing another submit.

Already in transit:

- Title: `Already in transit`
- Body: `This package is already recorded as moving toward destination station.`
- Primary: `Continue route`

## Copy System
Header:

- `Mark in transit`

Ready:

- `Record that transport has started.`
- `Custody stays with you until destination station receipt.`

Status change:

- `Dispatched from origin`
- `In transit`

CTA:

- `Mark in transit`

Submitting:

- `Updating status...`

Success:

- `Marked in transit`
- `Delivery status updated.`

Offline:

- `In-transit update saved`
- `Sync required before the server shows this status.`

Conflict:

- `Status changed`
- `Refresh before continuing.`

Safety:

- `Use this control while parked or before departure.`

## Safety Rules
This action should be quick, but it still changes backend lifecycle state.

Rules:

- Do not require typing while driving.
- Hide or disable note entry under movement safety mode.
- Keep CTA large.
- Use confirmation copy before submit.
- Do not force a modal unless the state is risky.
- Do not combine this action with opening navigation.
- Do not rely on GPS to decide the mutation.

Movement safety mode:

- If movement is detected, show compact view.
- Copy: `Pull over before adding a note.`
- Keep support access available for urgent safety issue if policy allows.

## Accessibility
Screen reader:

- Announce status change purpose on screen load.
- Announce submit progress.
- Announce success through status message.
- Announce validation errors with the field label.
- Do not announce raw package scan code.

Focus:

- Focus title on load.
- Focus note field when validation fails.
- Focus success title after success.
- Focus conflict title after conflict.

Touch targets:

- Primary CTA at least 48 by 48.
- Secondary CTAs at least 44 by 44.
- Note clear button at least 44 by 44.

Color:

- Before/after status must include text, not color only.
- Pending and conflict states must include icons plus text.

Reduced motion:

- Disable status card transition.
- Keep progress state visible through text.

## Privacy And Security
Rules:

- Do not expose package scan code.
- Do not write note to analytics verbatim.
- Redact note from crash logs.
- Store queued note securely.
- Do not pass note to external navigation.
- Do not collect background location for this mutation.
- Do not include private receiver details.

Audit:

- Backend event is `delivery_marked_in_transit`.
- Client analytics should record event ID after success.
- Client should record whether note was present, not note content.

## Analytics
Events:

- `driver_mark_in_transit_viewed`
- `driver_mark_in_transit_submitted`
- `driver_mark_in_transit_succeeded`
- `driver_mark_in_transit_failed`
- `driver_mark_in_transit_offline_queued`
- `driver_mark_in_transit_sync_succeeded`
- `driver_mark_in_transit_sync_failed`
- `driver_mark_in_transit_note_added`
- `driver_mark_in_transit_support_opened`

Required properties:

- `deliveryId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `actorRole`
- `isAssignedDriver`
- `networkState`
- `cacheAgeSeconds`
- `hasNote`
- `queuedActionId`
- `eventId`
- `errorCode`

Forbidden properties:

- Note text.
- Raw package scan code.
- Driver precise GPS.
- Receiver phone.
- Payment provider reference.

## Cache And Invalidation
On entry:

- Render cached delivery detail.
- Refresh delivery detail when online.
- Refresh timeline if status is unclear.
- Read pending outbox actions.

On submit success:

- Invalidate `Delivery`.
- Invalidate `DeliveryTimeline`.
- Invalidate `DriverQueue`.
- Store lifecycle receipt.
- Clear matching pending action.

On offline queue:

- Add pending action to delivery context.
- Add pending badge to driver route.
- Block duplicate submit.
- Show outbox link.

On conflict:

- Preserve queued action.
- Refetch delivery and timeline.
- Route to action recovery.

## Navigation
From this screen:

- Back to `DriverRoute`.
- Success to `DriverRoute`.
- Success secondary to `DriverDestinationArrival`.
- Recovery to `OpsActionRecovery`.
- Evidence to custody chain.
- Support to `DriverSupport`.
- Outbox to `/(ops)/offline-outbox`.

Back behavior:

- Before submit: normal back.
- While submitting: do not close if request is in flight unless request can be safely cancelled before send.
- After success: back routes to active route, not stale form.
- With queued action: back allowed, but route screen must show pending state.

Deep link behavior:

- If status is `dispatched_from_origin`, show form.
- If status is `in_transit`, show already active state.
- If status is before pickup, route to pickup scan.
- If status is beyond transit, route forward or custody chain.

## Implementation Notes For Claude Code
Build this as a dedicated lifecycle mutation form.

Required implementation sequence:

1. Read route `deliveryId`.
2. Load auth and delivery detail.
3. Enforce driver role, capability, assignment, and custody.
4. Check current status and outbox duplicate.
5. Render status change card.
6. Validate optional note locally.
7. Submit `mark_in_transit` online or queue offline when safe.
8. Parse `deliveryLifecycleResponseSchema`.
9. Invalidate caches.
10. Render success receipt.
11. Add accessibility announcements.
12. Add critical tests.

Suggested hook names:

- `useDriverMarkInTransitScreen`
- `useMarkInTransitMutation`
- `useTransitStatusGate`
- `useTransitOutboxAction`
- `useTransitNoteField`
- `useTransitSuccessReceipt`

Suggested component boundaries:

- `DriverMarkInTransitScreen` owns route, gates, and mutation orchestration.
- `TransitStatusChangeCard` owns before/after state.
- `TransitNoteField` owns note validation.
- `TransitSubmitFooter` owns CTA and loading state.
- `TransitSuccessReceipt` owns lifecycle response.
- `TransitConflictPanel` owns recovery state.

## API Mapping
Read:

- `GET /v1/deliveries/:id`

Mutation:

- `POST /v1/deliveries/:id/mark-in-transit`

Request mapping:

- Empty note -> omit `note`.
- Non-empty note -> trimmed `note`.

Response mapping:

- `eventId` -> success receipt.
- `status` -> must be `in_transit` for success state.
- `occurredAt` -> server timestamp.
- `paymentStatus` -> receipt payment state.

Cache invalidation:

- `Delivery:${deliveryId}`
- `DeliveryTimeline:${deliveryId}`
- `DriverQueue:${actorId}`

## QA Acceptance Criteria
Functional:

- Assigned driver with status `dispatched_from_origin` can submit.
- Success returns status `in_transit`.
- Success shows `delivery_marked_in_transit`.
- Optional note validates 3 to 240 characters when present.
- Empty note submits without `note`.
- Already in transit state does not resubmit.
- Unassigned driver is blocked.
- Missing custody is blocked.
- Duplicate pending outbox action blocks submit.

Offline:

- Fresh cache can queue action.
- Stale cache blocks offline queue.
- Queued action stores idempotency key.
- Reconnect success updates status.
- Reconnect conflict routes to recovery.

Safety:

- Opening navigation does not mark in transit.
- GPS does not auto-submit.
- Movement safety mode hides note entry.

Accessibility:

- Primary test ID is `screen-driver-mark-in-transit`.
- Submit progress is announced.
- Success is announced.
- Validation errors are announced.
- CTA targets meet minimum size.

Security:

- Note text is not sent to analytics.
- Raw package scan code is absent.
- Queued payload is protected.

## Test Matrix
Unit tests:

- `markInTransitRequestSchema` accepts empty body.
- `markInTransitRequestSchema` accepts valid note.
- `markInTransitRequestSchema` rejects short note.
- `markInTransitRequestSchema` rejects overlong note.
- Status gate allows `dispatched_from_origin`.
- Status gate routes `in_transit` to already active.
- Analytics redacts note text.

Component tests:

- Renders status change card.
- Renders note field.
- Renders offline queued panel.
- Renders success receipt.
- Renders already in-transit state.
- Renders custody-required state.
- Renders validation error.

Integration tests:

- Online success calls `mark_in_transit`.
- Offline safe queue stores action.
- Duplicate pending action disables submit.
- `FORBIDDEN` maps to scope denied.
- `INVALID_STATUS_TRANSITION` maps to conflict.
- Success invalidates delivery, timeline, and driver queue.

End-to-end tests:

- `e2e-driver-mark-in-transit-success`
- `e2e-driver-mark-in-transit-offline-queued`
- `e2e-driver-mark-in-transit-duplicate-pending`
- `e2e-driver-mark-in-transit-status-conflict`
- `e2e-driver-mark-in-transit-note-validation`
- `e2e-driver-mark-in-transit-custody-required`

## Performance
Targets:

- Screen shell visible under 500 milliseconds from cached route context.
- Submit feedback under 100 milliseconds after tap.
- Success receipt visible under 500 milliseconds after server response.
- Note validation immediate.
- Offline queue write under 250 milliseconds.

Low-bandwidth:

- Use cached delivery context.
- Avoid timeline fetch until needed.
- Do not load maps or media.
- Queue safely with local persistence.

Low-end device:

- Keep layout simple.
- Avoid heavy animation.
- Avoid frequent re-rendering while note input changes.

## Edge Cases
Delivery already `in_transit`:

- Show active state.
- Route back to DriverRoute or destination arrival.

Delivery received at destination:

- Show already moved forward.
- Route to custody chain or destination handoff result.

Network timeout after submit:

- Refetch delivery before retry when possible.
- If outbox accepted action, show pending.

Note entered then offline queue fails:

- Preserve note in local form.
- Show retry.

Session expires:

- Save unsent note locally only if policy allows secure draft storage.
- Route to sign-in.

Payment status changes:

- If backend blocks, show payment blocker.
- If already in transit, show latest state after refresh.

## Release Gates
This screen is not complete until:

- It calls `mark_in_transit` only from the dedicated screen.
- It blocks before custody is confirmed.
- It blocks unassigned drivers.
- It handles already-in-transit without duplicate mutation.
- It supports safe offline queue.
- It validates optional note exactly.
- It redacts note text from analytics.
- It never reveals scan code.
- It announces progress, success, and errors.
- It has unit, component, integration, and E2E coverage.
- CI remains green.

## Final Build Standard
The final UI should make one operational rule obvious:

`Navigation can start outside Kra, but transport status becomes official only when the assigned driver explicitly records in-transit status and the server or safe outbox accepts it.`

If the implementation preserves that rule across online, offline, duplicate, conflict, and safety states, this screen is ready for production build.
