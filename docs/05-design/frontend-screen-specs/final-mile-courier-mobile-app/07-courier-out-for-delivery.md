# CourierOutForDelivery Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierOutForDelivery` |
| Route | `/(ops)/courier/assignments/:deliveryId/out-for-delivery` |
| Primary test ID | `screen-courier-out-for-delivery` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `mark_out_for_delivery` |
| Offline critical | Yes, can queue trip-start intent, but receiver notification and canonical status wait for server confirmation |
| Required role | `final_mile_courier` |
| Required prior state | Confirmed custody held by current courier after `accept_final_mile_assignment` |
| Primary mutation | `POST /v1/deliveries/:id/out-for-delivery` through route key `mark_out_for_delivery` |
| Request schema | `markOutForDeliveryRequestSchema` |
| Response schema | `deliveryLifecycleResponseSchema` |
| Next workflow | `/(ops)/courier/assignments/:deliveryId/route` |
| Related routes | `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/custody-accepted`, `/(ops)/courier/assignments/:deliveryId/route`, `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/courier/issues`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Custody-gated trip-start workflow with readiness checklist, optional note, idempotent mutation, notification authority, offline pending state, and route handoff |

## Product Job
`CourierOutForDelivery` is the courier's controlled transition from station-held readiness to active doorstep travel.

It answers eight operational questions:

- `Do I already hold confirmed custody?`
- `Am I physically ready to leave the station with this package?`
- `Will this action notify the receiver and sender?`
- `What delivery status will change?`
- `What address and receiver instructions should I verify before leaving?`
- `What happens if I am offline?`
- `What should I do if I cannot start the trip?`
- `Where do I go after the trip is started?`

The screen must ensure a courier starts final-mile travel only after custody is confirmed and only through the backend transition that changes status to `out_for_delivery`.

## Product Standard
This screen is a departure gate, not a route map.

The courier should be able to:

- Verify confirmed custody belongs to them.
- Verify destination station and receiver area.
- Review address and landmark readiness.
- Add an optional operational note.
- Understand that tapping the primary action changes the delivery status.
- Understand that the server sends out-for-delivery notifications after confirmation.
- Queue the action safely when offline without pretending notification has happened.
- Continue to the route screen after server confirmation.
- Recover when custody, assignment, payment, or status is unsafe.

The screen must never:

- Start travel before custody is confirmed.
- Accept package custody.
- Scan package codes.
- Complete delivery proof.
- Record failed attempt.
- Show OTP.
- Show proof asset reference.
- Collect cash.
- Trigger receiver notification locally.
- Mark `out_for_delivery` while offline before sync.
- Hide that the backend is the authority for status and notifications.

## Audience
Primary audience:

- Final-mile couriers who have custody and are preparing to leave a destination station.

Secondary audience:

- Station staff confirming the courier is ready to depart.
- Support staff reviewing why a trip did not start.
- QA validating lifecycle state, offline queueing, and notification authority.
- Security reviewers validating receiver data minimization.
- Claude Code implementing the React Native screen, mutation, and tests.

## Context Of Use
The courier may open this screen:

- From `CourierCustodyAccepted`.
- From assignment detail when custody is already confirmed.
- From active assignments if a job is ready to leave station.
- After a background sync confirms custody acceptance.
- After app restart while holding custody.
- After support asks the courier to retry trip start.

The courier may be at a station exit, beside a motorbike, in a vehicle, or under time pressure. The screen must be one-handed, direct, and clear enough to prevent accidental receiver notification.

## Design Brief
User and job:

- A final-mile courier with confirmed custody needs to start the doorstep trip and move the delivery into `out_for_delivery`.

Surface type:

- Mobile lifecycle transition screen.

Primary action:

- Submit `mark_out_for_delivery`.

Visual thesis:

- `Departure gate`: a crisp readiness checkpoint with a route-forward energy, a custody lock at the top, and a single guarded launch action.

Restraint rule:

- Do not include live map navigation, proof capture, package scan, earnings, or receiver chat. This screen changes status and hands off to route.

Density:

- Medium. It needs enough context to prevent wrong departure, but the primary action must remain obvious.

Platform stance:

- Native-plus mobile flow with large thumb action, compact readiness checklist, status authority strip, and offline-aware mutation handling.

## External Research Used
Only directly relevant links were used:

- [Uber delivering using the Driver app](https://www.uber.com/us/en/deliver/basics/making-deliveries/how-to-deliver/): supports step-by-step courier progression, matching physical order details, moving from pickup to delivery, using navigation, and accessing support during the trip.
- [DoorDash Dasher app usage](https://dasher.doordash.com/en-us/blog/how-to-use-dasher-app): supports courier operational tabs, directions for pickup and delivery, and support access inside active delivery work.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports explicit local state, synchronization, and careful presentation of queued writes when the network is unavailable.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing mutation progress, pending sync, and confirmation states.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable flow from readiness context to note to primary action and recovery.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large departure, retry, support, and route controls.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/06-courier-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/package-statuses.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/notifications.ts`
- `services/api/src/routes.ts`

## Backend Contract
Mutation:

```http
POST /v1/deliveries/:id/out-for-delivery
```

Route key:

```text
mark_out_for_delivery
```

Required capability:

```text
mark_out_for_delivery
```

Required actor role:

```text
final_mile_courier
```

Required custody:

```text
currentCustodyRole=final_mile_courier
currentCustodyActorId=current courier actor ID
```

Request body without note:

```json
{}
```

Request body with note:

```json
{
  "note": "Leaving station after supervisor confirmed receiver directions."
}
```

Field rules:

- `note` is optional.
- `note` must be trimmed.
- `note` must be 3 to 240 characters when sent.
- Empty note must be omitted from the request body.

Backend enforced rules:

- Missing delivery returns `NOT_FOUND`.
- Non-courier actor returns `FORBIDDEN`.
- Courier mismatch returns `FORBIDDEN`.
- Missing or mismatched final-mile custody returns a service error.
- Successful transition writes event type `delivery_marked_out_for_delivery`.
- Successful transition sets `nextStatus: out_for_delivery`.
- Successful transition keeps `currentCustodyRole: final_mile_courier`.
- Successful transition keeps `currentCustodyActorId` equal to the courier actor ID.
- Successful transition returns `deliveryLifecycleResponseSchema`.
- The route is idempotent through request fingerprint.
- The API calls `notifyDeliveryStatusChange` after success.

Response handling:

- Read `eventId`.
- Read `deliveryId`.
- Read `status`.
- Read `paymentStatus`.
- Read `occurredAt`.
- Require `status=out_for_delivery` before showing confirmed departure.
- Invalidate `Delivery`, `DeliveryTimeline`, and `CourierQueue`.
- Navigate to `CourierRoute` after confirmed success.

## Lifecycle Semantics
This screen transitions:

```text
assigned_for_final_mile -> out_for_delivery
```

The transition is valid only after:

- The package is assigned to the current courier.
- The current courier has confirmed custody.
- The courier is physically ready to leave the destination station.
- The package is still intended for doorstep delivery.
- Payment state allows final-mile continuation.

`out_for_delivery` means:

- The final-mile trip has started.
- Sender and receiver should be notified by backend status notification.
- The courier remains the accountable custodian.
- The next normal workflow is route navigation.

`out_for_delivery` does not mean:

- Delivery is completed.
- Proof is captured.
- Receiver has verified OTP.
- The courier is paid.
- A failed attempt has been recorded.

## Route Entry Preconditions
The screen can be opened when:

- `deliveryId` exists.
- User is authenticated.
- User role is `final_mile_courier`.
- Delivery is assigned to the current courier.
- Current custody is current courier.
- Current status is `assigned_for_final_mile`, or status is already `out_for_delivery` for idempotent recovery.

If preconditions fail:

- If custody is not accepted, route to `CourierAcceptAssignmentScan` or `CourierCustodyAccepted` based on known state.
- If another courier holds custody, route to `OpsActionRecovery`.
- If delivery is already out for delivery, route to `CourierRoute`.
- If delivery is delivered or closed, route to completed job detail when available.
- If session expired, pause and route to sign-in.

## Information Architecture
The screen has seven zones:

- Status authority strip.
- Custody lock header.
- Departure readiness checklist.
- Receiver direction preview.
- Optional note.
- Notification authority panel.
- Sticky action footer.

The first viewport must show custody lock, destination readiness, and the primary departure action. Receiver-sensitive details must be minimized but sufficient for safe departure.

## Status Authority Strip
Purpose:

- Explain whether trip start is live, saved, pending, or blocked.

States:

- `Ready`: confirmed custody and online or safe to submit.
- `Submitting`: mutation in flight.
- `Confirmed`: server changed status to `out_for_delivery`.
- `Queued`: trip start saved for sync.
- `Blocked`: preconditions are unsafe.
- `Already out`: status already `out_for_delivery`.

Copy:

- Ready: `Ready to start final-mile trip`
- Submitting: `Starting trip with server`
- Confirmed: `Out for delivery confirmed`
- Queued: `Trip start waiting to sync`
- Blocked: `Trip start blocked`
- Already out: `Delivery is already out for delivery`

Rules:

- Use green only after confirmed server success.
- Use amber for queued offline state.
- Use red for blocked.
- Use neutral or blue for submitting.

## Custody Lock Header
Purpose:

- Confirm the courier is allowed to start the trip.

Required content:

- Delivery reference.
- Current status.
- Current custody role.
- Current custodian label.
- Destination station.
- Accountability reminder.

Title:

- `Start final-mile trip`

Subtitle:

- `This will mark the package out for delivery and notify the receiver after server confirmation.`

Accountability line:

- `You remain responsible for this package until delivery proof or return handoff is confirmed.`

Do not show:

- package scan code.
- OTP.
- proof asset reference.
- raw payment provider references.

## Departure Readiness Checklist
Purpose:

- Stop accidental departure before the courier is actually ready.

Checklist items:

- `Package is with me`
- `Receiver address is usable`
- `Phone battery and network are sufficient`
- `Station release is complete`

Interaction model:

- The checklist can be informational when all preconditions are already satisfied.
- If product policy requires explicit confirmation, each item becomes a large checkbox.
- Primary action remains disabled until required confirmations are complete.

Default V1 rule:

- Use an informational checklist plus one primary action.
- Do not add extra taps unless analytics or safety incidents show accidental departure risk.

Warnings:

- If address is missing, block and route to action recovery.
- If receiver phone is missing, block because doorstep delivery requires receiver phone.
- If payment state is not paid, block and route to recovery.
- If delivery has pending acceptance sync, block and route to outbox.

## Receiver Direction Preview
Purpose:

- Give enough destination context before the courier starts travel.

Allowed fields:

- Receiver display name.
- Area or neighborhood.
- Address text when courier is authorized.
- Landmark instructions.
- Delivery note.
- Doorstep distance estimate when available.
- Proof method expectation.

Hidden fields:

- OTP.
- full phone number unless contact controls are explicitly allowed in later route.
- proof asset reference.
- raw GPS coordinates.
- package scan code.

Preview copy:

- Title: `Before leaving`
- Body: `Check the address and landmark now. Navigation opens after the trip is confirmed.`

Route handoff:

- After success, route screen can present navigation and contact policy.
- This screen must not become a live route map.

## Optional Note
Purpose:

- Let the courier add meaningful departure context.

Field:

- Label: `Departure note`
- Help text: `Optional. Add context only if it helps operations understand the trip start.`
- Minimum: 3 characters when used.
- Maximum: 240 characters.
- Autocorrect: allowed for prose.
- Submit empty: omit `note`.

Good note categories:

- station release issue.
- receiver direction clarification.
- weather or access risk.
- supervisor instruction.
- package handling concern.

Reject:

- one-character notes.
- empty whitespace.
- notes containing OTP.
- notes containing raw package scan code.
- abusive text if content moderation exists.

## Notification Authority Panel
Purpose:

- Make clear that receiver and sender notification is server-controlled.

Copy:

- Title: `Receiver notification`
- Body: `After the server confirms this action, sender and receiver updates can be sent for out-for-delivery status.`

Offline copy:

- `If this is queued offline, notifications wait until sync succeeds.`

Rules:

- Do not send local SMS.
- Do not show notification as sent until server confirms.
- Do not expose notification internals.
- Do not allow user to opt out of required operational notification.

## Primary Happy Path
1. Courier opens from custody accepted receipt.
2. App refreshes delivery detail.
3. App confirms current courier holds final-mile custody.
4. App shows readiness checklist and receiver direction preview.
5. Courier optionally enters note.
6. Courier taps `Start trip`.
7. UI disables duplicate taps.
8. Mutation sends `mark_out_for_delivery`.
9. Server asserts final-mile custody.
10. Server writes `delivery_marked_out_for_delivery`.
11. Server changes status to `out_for_delivery`.
12. Server triggers status notification flow.
13. UI receives lifecycle response.
14. UI invalidates delivery, timeline, and courier queue.
15. UI navigates to `CourierRoute`.

## Offline Path
Offline trip start is allowed only as a queued intent, not canonical status.

Allowed offline:

- Read confirmed custody from secure cache.
- Review address and landmark.
- Enter optional note.
- Save trip-start intent to encrypted outbox.
- Show pending sync state.
- Route to cached route preparation only if the route screen clearly labels notification pending.

Disallowed offline:

- Do not mark status as `out_for_delivery`.
- Do not tell receiver that notification was sent.
- Do not show green confirmation.
- Do not complete proof.
- Do not record failed attempt from this screen.
- Do not queue if custody acceptance is still pending.

Queued outbox row:

- Title: `Start final-mile trip`
- Subtitle: delivery reference and destination area.
- Status: `Waiting to notify receiver`
- Payload: delivery ID, note when present, idempotency key, actor ID, client creation time.
- Sensitive data: no OTP, no scan code, no raw phone.

Pending copy:

- Title: `Trip start waiting to sync`
- Body: `The package is not marked out for delivery and receiver updates are not sent until the server confirms this action.`

Sync success:

- Mark delivery as `out_for_delivery` in local cache only after server success.
- Navigate to route if this screen is foregrounded.
- Refresh courier home and assignments.

Sync rejection:

- Route to action recovery.
- Do not show out-for-delivery confirmation.

## Idempotency And Duplicate-Tap Protection
The backend route is idempotent. The UI must still prevent duplicate user actions.

Client requirements:

- Generate stable idempotency key per trip-start attempt.
- Disable `Start trip` after first tap.
- Preserve key on retry after network timeout with same note.
- Generate new key if note changes after failure.
- Treat duplicate successful response as success.
- Block multiple queued trip-start rows for the same delivery.

Duplicate route cases:

- If server says status is already `out_for_delivery` for current courier, route to `CourierRoute`.
- If server says delivery is already delivered, route to completed detail.
- If server says custody is not courier, route to action recovery.

## States
### Loading
Use when:

- Route is resolving.
- Delivery detail is loading.
- Custody authority is being checked.

UI:

- Header shell.
- Readiness card skeleton.
- Message: `Checking trip readiness...`

Rules:

- Do not show start action until custody is known.

### Ready
Use when:

- Current courier holds custody.
- Status is `assigned_for_final_mile`.
- No blocking delivery data is missing.

UI:

- Readiness checklist.
- Direction preview.
- Notification authority panel.
- Optional note.
- Primary `Start trip`.

### Submitting
Use when:

- Mutation is in flight.

UI:

- Disable note field.
- Disable back only if request interruption would cause unsafe duplicate behavior.
- Show `Starting trip with server...`

Rules:

- No duplicate taps.
- No route navigation until response.

### Confirmed
Use when:

- Server returns `status=out_for_delivery`.

UI:

- Brief confirmation.
- Navigate to `CourierRoute`.

Rules:

- Do not linger.
- Refresh data.

### Queued Offline
Use when:

- Trip-start intent is queued.

UI:

- Amber pending panel.
- Outbox link.
- Notification pending warning.

Primary:

- `Open offline outbox`

Secondary:

- `View cached route prep`

### Already Out For Delivery
Use when:

- Status is already `out_for_delivery`.

UI:

- Compact status.
- Primary `Open route`.

Rules:

- Do not submit mutation again.

### Blocked
Use when:

- Missing custody.
- Wrong courier.
- Missing address.
- Missing receiver phone.
- Payment unsafe.
- Delivery status not valid.
- Assignment changed.

UI:

- Blocking panel.
- Exact reason.
- Recovery action.

## Error Handling
### `NOT_FOUND`
Title:

- `Delivery not found`

Body:

- `This delivery is no longer available. Return to your active jobs.`

Actions:

- `Back to assignments`
- `Contact support`

### `FORBIDDEN`
Title:

- `Trip start not allowed`

Body:

- `This package is not assigned to your courier account. Do not leave with it.`

Actions:

- `Open recovery`
- `Contact support`

### Missing Custody
Title:

- `Custody must be accepted first`

Body:

- `Scan and accept the package before starting the final-mile trip.`

Actions:

- `Open accept scan`
- `Back to assignment`

### Invalid Status
Title:

- `Trip cannot start from this status`

Body:

- `The delivery status changed before the trip started. Refresh the assignment before leaving.`

Actions:

- `Refresh`
- `Open recovery`

### Network Timeout
Title:

- `Trip start did not finish`

Body:

- `Receiver updates are not sent until the server confirms. Retry or save this action for sync.`

Actions:

- `Retry`
- `Save for sync`
- `Cancel`

### Payment Unsafe
Title:

- `Payment status needs review`

Body:

- `Final-mile travel should not start until operations confirms payment.`

Actions:

- `Open recovery`
- `Contact support`

### Missing Receiver Data
Title:

- `Receiver details incomplete`

Body:

- `Doorstep delivery requires a receiver phone and usable address or landmark. Ask the station to review this assignment.`

Actions:

- `Open recovery`
- `Back to detail`

## Content System
Tone:

- Direct.
- Field-operational.
- Accountable.
- Calm under time pressure.

Preferred terms:

- `Start trip`
- `Out for delivery`
- `Receiver notification`
- `Server confirmation`
- `Current custody`
- `Route opens next`

Avoid:

- `Go`
- `Done`
- `Complete`
- `Delivered`
- `Notify now` unless server confirmed.

Primary copy:

- Title: `Start final-mile trip`
- Subtitle: `This will mark the package out for delivery and notify the receiver after server confirmation.`
- Primary action: `Start trip`
- Offline primary: `Save trip start for sync`
- Confirmed transition copy: `Out for delivery confirmed`

## Visual System
Overall look:

- Strong departure card.
- Custody lock at top.
- Direction preview in the middle.
- Notification authority near the action.
- Sticky launch footer.

Visual thesis:

- A serious dispatch checkpoint, not a map or celebration screen.

Color roles:

- Ready: neutral with strong primary action.
- Submitting: blue or neutral progress.
- Confirmed: green only after server response.
- Queued: amber.
- Blocked: red.

Layout:

- Top third: status and custody.
- Middle: readiness and address preview.
- Lower: note and notification authority.
- Footer: one primary action.

Motion:

- Button press can compress.
- Status strip can shift on submit.
- Confirmed state can quickly push to route.
- No confetti.
- No decorative map movement.

Haptics:

- Light haptic on submit.
- Success haptic only after server confirmation.
- Warning haptic on blocked state.

## Accessibility
Announcements:

- Ready: `Ready to start final-mile trip.`
- Submitting: `Starting trip with server.`
- Confirmed: `Out for delivery confirmed. Opening route.`
- Queued: `Trip start waiting to sync. Receiver updates are not sent yet.`
- Blocked: `Trip start blocked. Review required.`

Focus order:

- Back.
- Status authority.
- Custody lock.
- Readiness checklist.
- Receiver direction preview.
- Note field.
- Notification authority.
- Primary action.
- Secondary actions.

Touch targets:

- Minimum 44 by 44 points.
- Primary start action should be thumb-sized.
- Retry, outbox, recovery, and support actions must be full-width or large enough for station use.

Keyboard:

- Note field must support keyboard entry.
- Primary action must remain reachable when keyboard is open.
- Focus should move to error summary on validation failure.

Visual accessibility:

- Do not rely on color alone.
- Pair each state with label and icon.
- Support large text without hiding the footer.
- Avoid tiny address text.

Reduced motion:

- Remove route push animation flourish.
- Keep status text and navigation.

## Privacy And Security
Allowed visible data:

- delivery reference.
- receiver display name.
- receiver area.
- address and landmark if courier is authorized.
- station name.
- current status.
- custody state.

Disallowed visible data:

- OTP.
- raw package scan code.
- proof asset reference.
- payment provider reference.
- precise GPS coordinates on this screen.
- internal fraud flags.

Analytics:

- Track screen view, readiness state, submit, queued offline, success, error code, recovery opened, support opened.
- Do not track OTP.
- Do not track package scan code.
- Do not track receiver phone.
- Do not track full address.

Support payload:

- delivery ID.
- route key.
- current status.
- current custody role.
- actor ID.
- station ID.
- error code.
- note presence flag.

Do not include:

- note text unless support ticket explicitly needs it and policy allows.
- OTP.
- package scan code.
- full receiver phone.

## Data Requirements
Route params:

- `deliveryId`

Required auth data:

- actor ID.
- role.
- capabilities.

Required delivery fields:

- delivery ID.
- tracking code.
- current status.
- payment status.
- assigned final-mile courier ID.
- current custody role.
- current custody actor ID.
- destination station ID.
- destination station label.
- receiver display name.
- receiver phone presence flag.
- address text or landmark.
- doorstep requested flag.
- doorstep distance estimate when available.

Mutation input:

- optional `note`.

Mutation response:

- event ID.
- delivery ID.
- status.
- payment status.
- occurred time.

Local UI state:

- readiness status.
- optional note value.
- submit state.
- idempotency key.
- offline queued row ID.
- authority state.

## API Integration
Hook:

- `useMarkOutForDeliveryMutation`

Request:

- Send empty object when note is empty.
- Send `{ note }` only when valid.

Invalidates:

- `Delivery`
- `DeliveryTimeline`
- `CourierQueue`

Optimistic update:

- Do not optimistically mark status as `out_for_delivery`.
- Use a local pending banner only for queued offline state.

Success handling:

- Require response status `out_for_delivery`.
- Clear note field.
- Clear idempotency pending state.
- Invalidate relevant queries.
- Navigate to `CourierRoute`.

Failure handling:

- Keep note for retry when safe.
- Route to recovery on custody or assignment conflict.
- Route to sign-in on auth expiry.

## Navigation Rules
Entry:

- From `CourierCustodyAccepted`.
- From `CourierAssignmentDetail` when custody is current courier.
- From `CourierAssignments` ready-to-start row.
- From outbox sync success if trip start was confirmed.

Exit:

- Success: `/(ops)/courier/assignments/:deliveryId/route`.
- Back: `/(ops)/courier/assignments/:deliveryId/custody-accepted` or assignment detail depending source.
- Pending: `/(ops)/offline-outbox`.
- Blocked: `/(ops)/action-recovery`.
- Support: `/(ops)/courier/issues`.

Back behavior:

- Before note edit: normal back.
- After note edit: ask whether to discard note.
- During submit: prevent duplicate or show interruption warning.
- During queued state: allow back but keep parent pending banner.

Deep link behavior:

- Validate delivery before rendering.
- If not accepted custody, redirect to accept scan or custody receipt.
- If already `out_for_delivery`, redirect to route.
- If delivered, redirect to completed detail when available.
- If issue reported, route to issue recovery.

## Component Inventory
Screen-level components:

- `CourierOutForDeliveryScreen`
- `TripStartAuthorityStrip`
- `CourierCustodyLockHeader`
- `DepartureReadinessChecklist`
- `ReceiverDirectionPreview`
- `DepartureNoteField`
- `ReceiverNotificationPanel`
- `TripStartFooter`
- `TripStartPendingPanel`
- `TripStartBlockedPanel`
- `TripStartSubmitProgress`

Shared components:

- `StatusAuthorityStrip`
- `DeliveryReferenceBadge`
- `StationBadge`
- `CriticalWarningCard`
- `OfflineStateBadge`
- `ActionRecoveryLink`

## Component Responsibilities
`CourierOutForDeliveryScreen`:

- Own route params, delivery guard, custody guard, note state, mutation, offline queueing, and navigation.

`TripStartAuthorityStrip`:

- Show ready, submitting, confirmed, queued, blocked, or already-out state.

`CourierCustodyLockHeader`:

- Prove custody is held by this courier.

`DepartureReadinessChecklist`:

- Show departure readiness and blockers.

`ReceiverDirectionPreview`:

- Show address and landmark context without becoming a map.

`DepartureNoteField`:

- Capture optional note within schema rules.

`ReceiverNotificationPanel`:

- Explain server-side receiver and sender notification authority.

`TripStartFooter`:

- Render start, save-for-sync, outbox, route, or recovery actions.

`TripStartPendingPanel`:

- Explain queued offline state.

`TripStartBlockedPanel`:

- Explain unsafe precondition failures.

`TripStartSubmitProgress`:

- Lock duplicate actions during mutation.

## State Machine
```text
loading
  -> blocked
  -> ready
  -> already_out_for_delivery

ready
  -> submitting
  -> queued_offline
  -> blocked

submitting
  -> confirmed
  -> retryable_error
  -> blocked
  -> queued_offline

queued_offline
  -> outbox
  -> confirmed
  -> blocked

confirmed
  -> route

already_out_for_delivery
  -> route

retryable_error
  -> submitting
  -> queued_offline
  -> support

blocked
  -> action_recovery
  -> assignment_detail
  -> support
```

## Validation Rules
Pre-submit:

- Delivery ID must exist.
- User must be authenticated.
- User role must be `final_mile_courier`.
- User must have `mark_out_for_delivery`.
- Delivery must be assigned to current courier.
- Current custody must be current courier.
- Status must be `assigned_for_final_mile`.
- Payment status must be safe.
- Receiver phone must exist.
- Address or landmark must exist.

Note:

- Empty note is allowed and omitted.
- Non-empty note must be 3 to 240 characters after trim.
- Note must not contain OTP.
- Note must not contain package scan code when detectable.

Post-submit:

- Response status must be `out_for_delivery`.
- Event ID must be present.
- Occurred time must be valid.

## Test IDs
Screen:

- `screen-courier-out-for-delivery`

Authority:

- `courier-out-authority-strip`
- `courier-out-authority-label`

Custody:

- `courier-out-custody-lock`
- `courier-out-delivery-ref`
- `courier-out-current-status`
- `courier-out-current-custodian`
- `courier-out-station`

Readiness:

- `courier-out-readiness`
- `courier-out-package-with-me`
- `courier-out-address-usable`
- `courier-out-device-ready`
- `courier-out-station-release`

Receiver preview:

- `courier-out-receiver-preview`
- `courier-out-receiver-name`
- `courier-out-address`
- `courier-out-landmark`
- `courier-out-distance`

Note:

- `courier-out-note`
- `courier-out-note-error`

Notification:

- `courier-out-notification-panel`
- `courier-out-notification-copy`

Footer:

- `courier-out-start-trip`
- `courier-out-save-for-sync`
- `courier-out-open-route`
- `courier-out-open-outbox`
- `courier-out-open-recovery`
- `courier-out-contact-support`

States:

- `courier-out-pending-panel`
- `courier-out-blocked-panel`
- `courier-out-submit-progress`

## Automated Test Matrix
Render tests:

- Renders ready state for assigned courier with custody.
- Renders blocked state without custody.
- Renders already-out state when status is `out_for_delivery`.
- Renders missing receiver data blocker.
- Renders payment blocker.
- Does not render OTP.
- Does not render package scan code.
- Does not render proof controls.

Mutation tests:

- Calls `mark_out_for_delivery` on primary action.
- Sends empty body when note is empty.
- Sends note when valid.
- Rejects note under 3 characters.
- Rejects note over 240 characters.
- Disables duplicate submit.
- Requires response status `out_for_delivery`.
- Invalidates delivery, timeline, and courier queue.
- Navigates to route after success.

Offline tests:

- Queues trip-start intent while offline.
- Does not mark canonical status as `out_for_delivery` while queued.
- Shows receiver notification pending copy.
- Redacts sensitive data in outbox row.
- Routes to route after sync success.
- Routes to recovery after sync rejection.

Error tests:

- `NOT_FOUND` maps to assignments recovery.
- `FORBIDDEN` maps to custody or assignment recovery.
- Missing custody maps to accept-scan recovery.
- Invalid status maps to refresh or recovery.
- Network timeout allows retry or save for sync.
- Already-out status routes to route.

Accessibility tests:

- Status changes are announced.
- Focus order is logical.
- Error summary receives focus.
- Primary action meets target size.
- Large text keeps footer usable.
- Reduced motion removes decorative movement.

Security tests:

- Analytics excludes OTP, scan code, phone, and full address.
- Support payload excludes OTP and scan code.
- Note text is not sent to support by default.
- Offline payload excludes OTP and scan code.

## Manual QA Script
1. Sign in as final-mile courier.
2. Accept package custody.
3. Open out-for-delivery route.
4. Confirm custody lock is visible.
5. Confirm current status is `assigned_for_final_mile`.
6. Confirm receiver address or landmark is visible when authorized.
7. Confirm OTP is not visible.
8. Tap `Start trip`.
9. Confirm duplicate taps are ignored.
10. Confirm response status is `out_for_delivery`.
11. Confirm app navigates to `CourierRoute`.
12. Repeat with optional valid note.
13. Repeat with invalid short note.
14. Repeat while offline.
15. Confirm queued state says receiver updates are not sent yet.
16. Restore network.
17. Confirm sync success navigates or refreshes to route.
18. Force missing custody.
19. Confirm route to accept scan or recovery.
20. Force already-out state.
21. Confirm primary action opens route without mutation.
22. Test screen reader announcements.
23. Test large text.

## Implementation Notes For Claude Code
Build this as the only screen that starts the final-mile trip.

Required implementation approach:

- Use existing auth, delivery detail, mutation, outbox, and error primitives.
- Require confirmed custody before enabling trip start.
- Use `useMarkOutForDeliveryMutation`.
- Keep route and test IDs exact.
- Keep `CourierRoute` responsible for navigation and map behavior.
- Keep proof capture in later proof screens.
- Keep failed attempt in `CourierFailedAttempt`.
- Treat server response as the only source of `out_for_delivery`.

Expected file areas:

- Final-mile courier route registration.
- Screen component.
- Mutation hook wiring.
- Offline outbox integration.
- Error mapping utility.
- Navigation tests.
- Accessibility tests.
- Security redaction tests.

Do not invent:

- New backend transition.
- Local receiver notification.
- Trip-start plus proof combined flow.
- Route optimization engine.
- Cash collection.
- Earnings event.
- Public tracking controls.

## Acceptance Criteria
Functional:

- Current courier with confirmed custody can mark delivery out for delivery.
- Courier without custody cannot start trip.
- Wrong courier cannot start trip.
- Server success changes status to `out_for_delivery`.
- Receiver notification is described as server-confirmed only.
- Offline queued trip start is pending, not confirmed.
- Success routes to `CourierRoute`.

UX:

- Courier understands this action starts the trip.
- Courier understands receiver updates wait for server confirmation.
- The primary action is singular and guarded.
- Blocked states tell the courier what not to do.

Security:

- OTP and scan code are never visible.
- Analytics and support payloads are redacted.
- Offline outbox payload excludes unnecessary sensitive data.

Accessibility:

- Status changes are announced.
- Focus order is predictable.
- Large text and one-handed use are supported.

Testing:

- Render, mutation, offline, error, accessibility, and security tests cover this screen.
- Tests assert exact route and primary test ID.
- Tests assert no proof, scan, or route-map behavior exists on this screen.

## Quality Bar
This screen is ready for build only when:

- It cannot start travel without confirmed courier custody.
- It cannot show `out_for_delivery` before server confirmation.
- It makes backend notification authority explicit.
- It hands off to route only after the lifecycle transition is safe.
- It avoids receiver proof and navigation clutter.
- It works at station departure under pressure.

