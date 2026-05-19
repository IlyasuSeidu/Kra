# Station Destination Receipt Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationDestinationReceipt` |
| App | `apps/mobile` |
| Route | `/(ops)/station/inbound/:deliveryId/receive` |
| Primary test ID | `screen-station-destination-receipt` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `receive_destination`, `receiveDestinationRequestSchema`, package label registry validation, local destination receipt outbox |
| Related routes | `/(ops)/station/inbound`, `/(ops)/station/inbound/:deliveryId/condition`, `/(ops)/station/final-mile`, `/(ops)/station/blocked`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `preflight_ready`, `condition_required`, `scan_ready`, `scan_active`, `scan_detected`, `scan_mismatch`, `manual_entry_required`, `supervisor_required`, `review_ready`, `submitting`, `queued_offline`, `sync_pending`, `receipt_success`, `receipt_conflict`, `status_blocked`, `custody_blocked`, `scope_blocked`, `payment_blocked`, `issue_blocked`, `stale_data`, `not_found`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen receives a physical package from the assigned driver at the destination station by validating station scope, driver custody, package scan, condition, and next routing decision.

The screen answers one operational question: `Can this destination station accept custody for this exact package now?`

The station operator should be able to:
- Verify the package is expected at this destination station.
- Verify custody is currently with the assigned driver.
- Confirm condition and next route are present before submitting.
- Scan the package label or use supervised manual entry.
- Review the receipt action before custody changes.
- Submit `receive_destination`.
- Queue the receipt only when offline policy permits and all evidence is captured.
- See exactly where the package goes next after sync success.
- Recover from wrong station, wrong status, scan mismatch, missing condition, stale data, and conflict states.

This screen is not:
- An inbound list.
- A condition-only inspection screen.
- A final-mile assignment screen.
- A receiver pickup completion screen.
- A driver app handoff screen.
- A support case editor.
- A bulk receiving surface.
- A place to bypass scan evidence.

## Audience
Primary audience:
- Destination station operators receiving packages from drivers.
- Station leads validating destination receipt discipline.

Secondary audience:
- Claude Code implementing the destination receipt workflow.
- QA validating scan, condition handoff, offline queue, and conflict handling.
- Backend engineers validating request construction and state transitions.
- Operations leads validating custody and loss prevention.
- Accessibility reviewers validating scanner, confirmation, and recovery states.

## User State
The station operator is likely at the destination station counter with a driver and package present. The moment is high risk: if the station accepts the wrong package, a damaged package without review, or a package from the wrong driver, Kra loses accountability.

The user may be:
- Coming from `StationInboundQueue`.
- Coming from a scanner result.
- Returning from `StationConditionCheck` with `condition` and `nextStep`.
- Recovering a queued offline receipt.
- Handling a damaged package.
- Seeing a driver arrive before the app has refreshed.
- Trying to receive a package that has already moved to a later queue.

The screen must:
- Require signed-in station to match `destinationStationId`.
- Require status `dispatched_from_origin` or `in_transit`.
- Require confirmed driver custody before receipt.
- Require package scan code.
- Require `condition`.
- Require `nextStep`.
- Require review before submission.
- Use `receive_destination` only when the full request can be built.
- Never mark package fully received from local state alone.

## Backend Contract
Existing backend facts:
- `receive_destination` exists at `POST /v1/deliveries/:id/receive-destination`.
- Route capability is `confirm_destination_receipt`.
- Station operator role has `confirm_destination_receipt`.
- Backend station scope requires actor station to match `destinationStationId`.
- Request schema is `receiveDestinationRequestSchema`.
- Request body requires `packageScanCode`, `condition`, and `nextStep`.
- `packageScanCode` must be 4 to 80 trimmed characters.
- `condition` is package condition.
- `nextStep` is `pickup`, `doorstep`, or `issue`.
- Optional fields are `fallbackUsed` and `supervisorOverrideActorId`.
- Backend validates package scan code against package label registry when configured.
- Backend rejects doorstep routing when `doorstepRequested` is false.
- Backend requires current custody role `driver`.
- Backend requires current custody actor to match `assignedDriverId`.
- Backend can receive from `dispatched_from_origin` by first moving through `in_transit` when driver custody is already confirmed.
- Backend records event `delivery_received_at_destination`.
- Backend records handoff event `driver_to_destination_station`.
- Backend then routes to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.
- Backend response is `deliveryLifecycleResponseSchema` with final routed status.

Important response implication:
- Successful `receive_destination` will usually return `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.
- The UI must not expect `received_at_destination` to remain the current status after the mutation.
- The timeline is the evidence source for `delivery_received_at_destination`.

Shared scan contract:
- `destination_receipt` scan intent uses `receive_destination`.
- `condition` and `nextStep` must exist before submit.
- If either field is missing, capture the scan if useful, then route to parent condition workflow instead of calling the endpoint.

Current backend gap:
- No two-party driver/operator live handoff session exists.
- No station-safe driver display object is guaranteed.
- No server endpoint returns a precomputed destination receipt readiness object.
- No dedicated condition-review mutation exists separate from `receive_destination`.

Production-ready recommendation:
- Add `GET /v1/deliveries/:id/destination-receipt-readiness` to return receipt eligibility, safe driver display, condition requirements, allowed next steps, and conflict reasons.
- Add a station handoff session endpoint later if real-time driver/operator coordination becomes necessary.
- Keep package scan and final receive mutation tied to backend idempotency.

## Relationship To StationConditionCheck
`StationDestinationReceipt` is the scan and submit surface for destination receipt.

`StationConditionCheck` is the detailed condition and routing decision surface.

This screen may submit only when:
- `condition` is present.
- `nextStep` is present.
- Package scan has been captured.
- Review confirmation is complete.

If `condition` or `nextStep` is missing:
- Show `condition_required`.
- Route to `/(ops)/station/inbound/:deliveryId/condition`.
- Preserve any captured scan code in same-session secure form state only.
- Do not call `receive_destination`.

Recommended flow:
1. Open destination receipt.
2. Preflight delivery and custody.
3. If condition and next step are missing, open condition check.
4. Return to receipt with `condition` and `nextStep`.
5. Scan package.
6. Review and submit.

Allowed alternate flow:
1. Scan first.
2. Store scan in volatile session state.
3. Open condition check.
4. Return with condition and next step.
5. Review and submit.

Forbidden:
- Submit with default condition.
- Auto-select `pickup` because doorstep is not requested.
- Auto-select `issue` because condition is damaged without operator review.
- Submit scan from shared scan screen without parent fields.

## Receipt Authority
Receipt is allowed when:
- User role is `station_operator`.
- User station equals delivery `destinationStationId`.
- Delivery status is `dispatched_from_origin` or `in_transit`.
- Payment status is `confirmed`.
- Current custody role is `driver`.
- Current custody actor equals `assignedDriverId`.
- Package scan code matches immutable package label binding.
- `condition` is present.
- `nextStep` is present and allowed.
- No active issue blocks movement.

Receipt is blocked when:
- User station is not destination station.
- Delivery is still at origin.
- Driver pickup was not confirmed.
- Current custody is not driver.
- Current custody actor does not match assigned driver.
- Payment is not confirmed.
- Package scan mismatches delivery.
- Condition is missing.
- Next step is missing.
- Doorstep next step is selected for a non-doorstep delivery.
- Data is too stale for safe offline queue.
- Server conflict says delivery moved.

Result of online success:
- Driver-to-destination-station handoff is recorded.
- Station operator becomes current custodian.
- Package is routed to receiver pickup, final-mile assignment, or issue queue.
- Inbound queue no longer shows the package.

Result of offline queue:
- Local receipt intent is stored with evidence and idempotency key.
- Package is not considered fully received by server until sync succeeds.
- UI must show `Sync pending`.
- Physical package must go to a controlled pending-receipt shelf or bin.

## Eligible Delivery States
Allowed current statuses:
- `dispatched_from_origin`
- `in_transit`

Blocked current statuses:
- `draft`: not active.
- `created`: origin intake missing.
- `received_at_origin`: origin station custody.
- `awaiting_driver_assignment`: driver assignment missing.
- `assigned_to_driver`: driver pickup missing.
- `received_at_destination`: receipt event already exists or future split state.
- `awaiting_receiver_pickup`: already routed for station pickup.
- `awaiting_final_mile_assignment`: already routed to final-mile queue.
- `assigned_for_final_mile`: courier assignment active.
- `out_for_delivery`: courier workflow.
- `delivered`, `closed`, `cancelled`, `delivery_failed`: terminal or closed.
- `issue_reported`, `on_hold`: issue workflow.

Status copy:
- `dispatched_from_origin`: `Driver pickup confirmed`
- `in_transit`: `Ready for destination receipt`
- `assigned_to_driver`: `Driver pickup not confirmed`
- `awaiting_receiver_pickup`: `Already received for pickup`
- `awaiting_final_mile_assignment`: `Already received for doorstep`
- `issue_reported`: `Issue review required`

## Data Sources
Required delivery source:
- `GET /v1/deliveries/:id`

Required timeline source:
- `GET /v1/deliveries/:id/timeline`

Mutation:
- `POST /v1/deliveries/:id/receive-destination`

Local sources:
- Inbound queue handoff state.
- Condition check session state.
- Shared scan session state.
- Destination receipt outbox.
- Station auth session.
- Connectivity state.

Required delivery fields:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver.name`
- `package`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `latestEvent`
- `latestTouchpoint`

Required timeline evidence:
- `driver_pickup_confirmed`
- `delivery_marked_in_transit`
- `origin_station_to_driver`
- Existing `driver_to_destination_station` if already received.
- Issue events that block movement.

Sensitive data handling:
- `GET /v1/deliveries/:id` currently returns the full receiver object.
- This screen may receive receiver phone or address in the delivery detail payload.
- Do not render receiver phone or full address.
- Do not write receiver phone or full address into durable station cache.
- Do not log receiver phone or full address.
- Do not send receiver phone or full address to analytics.
- If a future mobile-safe redacted delivery detail endpoint exists, prefer it for this screen.

Do not call:
- `assign_final_mile` from this screen.
- `complete_delivery_with_proof` from this screen.
- `create_issue` unless handed off to the condition or support workflow.
- Admin user list.
- Driver location endpoints.
- Payment provider endpoints.

## External Reference Inputs
Use these external references as design-quality inputs, not as product promises:
- GS1 traceability: receipt events should capture who, what, when, where, and why.
- GS1 logistic label guideline: logistics receiving depends on scannable labels, label quality, and matching physical units with receiving information.
- GS1 logistic label receiving guidance: receivers should have scanning capability and systems to support receiving.
- ML Kit barcode scanning: configure scanner formats deliberately, ensure readable image quality, and release scanner resources.
- Android offline-first guidance: online-only writes are appropriate for near-real-time critical transactions; queued writes require synchronization and conflict handling.
- WCAG status messages and target size requirements: scan, submit, sync, and error states must be perceivable and operable.

Reference links:
- `https://www.gs1.org/standards/traceability`
- `https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard`
- `https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3`
- `https://ref.gs1.org/guidelines/logistic-label/`
- `https://developers.google.com/ml-kit/vision/barcode-scanning/android`
- `https://developers.google.com/android/reference/com/google/mlkit/vision/barcode/BarcodeScanning`
- `https://developer.android.com/topic/architecture/data-layer/offline-first`
- `https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html`
- `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`

## Screen Thesis
The screen should feel like a controlled receiving checkpoint: exact, deliberate, and serious. It should reduce loss by making the operator verify the package, the driver custody chain, the package condition, and the next route before accepting station custody.

The operator should understand in three seconds:
- Whether this station can receive the package.
- Whether condition and routing are complete.
- Whether the package scan is still needed.
- Whether submitting will change custody now or queue for sync.

Visual direction:
- Scanner-first, but not camera-only.
- Strong custody banner at top.
- Condition and next-route summary always visible before submit.
- High-contrast risk states.
- Minimal visual noise around the camera.
- Clear distinction between `queued` and `confirmed`.

## Information Architecture
Primary sections:
1. Receipt status header.
2. Custody and station eligibility banner.
3. Condition and next-route summary.
4. Package scan module.
5. Review card.
6. Submit and offline queue decision.
7. Success, conflict, and recovery states.

Default focus order:
1. Screen heading.
2. Eligibility status.
3. Condition summary or condition required action.
4. Scanner action.
5. Review details.
6. Submit action.
7. Secondary support/custody actions.

Do not start with:
- A large map.
- Receiver contact card.
- Driver profile card.
- Full timeline list.
- A submit button before required evidence exists.

## Header
Title:
- `Receive package`

Subtitle:
- `{trackingCode}`

Status chip:
- `Destination receipt`

Header metadata:
- Destination station.
- Origin station.
- Current status.
- Last refreshed timestamp.
- Online/offline chip.

Header primary action:
- `Refresh`

Header secondary action:
- `Custody chain`

Header copy:
- Fresh: `Ready to verify receipt`
- Condition missing: `Condition check needed`
- Offline: `Receipt can be queued only after evidence is complete`
- Stale: `Refresh before custody changes`
- Confirmed: `Destination receipt synced`

## Custody Banner
The custody banner is mandatory and must stay visible above scan review.

States:
- `Driver custody confirmed`
- `Driver custody missing`
- `Wrong station`
- `Already received`
- `Issue review required`
- `Sync pending`
- `Receipt confirmed`

`Driver custody confirmed` copy:
- Title: `Driver custody confirmed`
- Body: `This package can be received here after condition check and package scan.`

`Driver custody missing` copy:
- Title: `Driver pickup is not confirmed`
- Body: `Do not receive this package until driver custody is recorded.`

`Wrong station` copy:
- Title: `Wrong destination station`
- Body: `This package is addressed to {destinationStationId}. Do not receive it here.`

`Sync pending` copy:
- Title: `Receipt queued, not synced`
- Body: `Keep the package in the pending-receipt area until Kra confirms sync.`

Forbidden banner copy:
- Do not say `received` while queued offline.
- Do not say `station has custody` before online success or synced queued action.
- Do not say `driver completed delivery`.

## Condition And Routing Summary
This screen requires condition and next route before submit.

If condition is missing:
- Show state `condition_required`.
- Primary action: `Check condition`
- Route: `/(ops)/station/inbound/:deliveryId/condition`
- Body: `Record package condition and choose the next route before receiving.`

If condition is present:
- Show summary card.

Summary fields:
- Condition: `OK` or `Damaged`
- Next route: `Station pickup`, `Doorstep assignment`, or `Issue review`
- Doorstep requested: yes/no
- Doorstep distance if available
- Captured by station operator
- Captured at timestamp

Condition rules:
- `condition=ok` can route to `pickup` or `doorstep` if allowed.
- `condition=damaged` should default next recommendation to `issue`, but operator must still confirm.
- `nextStep=doorstep` allowed only when `doorstepRequested=true`.
- `nextStep=pickup` routes to `awaiting_receiver_pickup`.
- `nextStep=doorstep` routes to `awaiting_final_mile_assignment`.
- `nextStep=issue` routes to `issue_reported`.

Do not infer:
- Doorstep routing from address alone.
- Pickup routing from non-doorstep status alone.
- Issue routing without operator action.

## Scanner Module
Preferred mode:
- Camera scan of package label.

Secondary mode:
- Hardware scanner keyboard input.

Fallback mode:
- Manual entry with supervisor override.

Scanner states:
- `scan_ready`
- `scan_active`
- `scan_detected`
- `scan_mismatch`
- `manual_entry_required`
- `supervisor_required`

Scanner requirements:
- Show package identity context before camera opens.
- Stop repeated scan reads after first valid detection.
- Validate code length locally: 4 to 80 characters.
- Trim leading and trailing whitespace.
- Never show full package scan code after confirmation except masked suffix.
- Clear scan value on route exit unless queued action needs it.

Camera copy:
- Title: `Scan the package label`
- Body: `Use the label on the physical package the driver is handing over.`

Manual fallback copy:
- Title: `Manual code needs supervisor approval`
- Body: `Use this only when the package label cannot be scanned.`

Mismatch copy:
- Title: `Scan does not match this delivery`
- Body: `Do not receive this package. Check the label or open custody chain.`

## Review Before Submit
The review card is mandatory before online submit or offline queue.

Review card fields:
- Tracking code.
- Origin station.
- Destination station.
- Current status.
- Custody from `driver`.
- Custody to `station_operator`.
- Condition.
- Next route.
- Package scan verified.
- Fallback used yes/no.
- Supervisor override if fallback was used.

Review confirmation copy:
- `Submitting this receipt transfers custody from driver to destination station and routes the package to {nextRouteLabel}.`

If offline queue is active:
- `Queueing this receipt stores evidence locally. Custody is not confirmed by Kra until sync succeeds.`

Review checkbox:
- Label: `I have the physical package at this station.`
- Required before submit.

Second confirmation for damaged condition:
- Label: `Damage has been checked and routed correctly.`
- Required when `condition=damaged`.

Do not require:
- Receiver phone confirmation.
- Driver phone confirmation.
- Payment provider confirmation.
- Admin approval for normal scan.

## Submit Behavior
Online submit:
- Call `POST /v1/deliveries/:id/receive-destination`.
- Use idempotency key through the existing mutation layer.
- Pass `packageScanCode`.
- Pass `condition`.
- Pass `nextStep`.
- Pass `fallbackUsed` only when true.
- Pass `supervisorOverrideActorId` only after supervisor approval.

Offline queue:
- Allowed only if platform offline receipt policy is enabled.
- Allowed only when fresh cached detail exists.
- Allowed only when station scope was verified before going offline.
- Allowed only when package scan, condition, next step, review confirmations, actor ID, station ID, and idempotency key exist.
- Must store request fingerprint.
- Must store local timestamp.
- Must store safe delivery identifiers.
- Must not store receiver phone or full address.

Offline queue block:
- Block when cache is stale.
- Block when condition is missing.
- Block when next step is missing.
- Block when package scan is missing.
- Block when status was not verified as eligible.
- Block when station scope was not verified.

Submit disabled reasons:
- `Condition check needed`
- `Scan package first`
- `Review required`
- `Wrong station`
- `Driver custody missing`
- `Payment not confirmed`
- `Package issue blocks receipt`
- `Refresh required`
- `Offline queue unavailable`

## Success Routing
Online success status mapping:
- `awaiting_receiver_pickup`: show pickup queue success and route to inbound queue or delivery detail.
- `awaiting_final_mile_assignment`: show doorstep preparation success and route to final-mile queue.
- `issue_reported`: show issue queue success and route to blocked queue.

Success screen card:
- Title: `Destination receipt confirmed`
- Body: `Kra recorded the driver-to-station handoff and routed the package to {nextRouteLabel}.`

Success actions:
- Primary: route based on response status.
- Secondary: `Receive another package`
- Tertiary: `View custody chain`

Queued success card:
- Title: `Receipt queued`
- Body: `Keep the package in the pending-receipt area until sync confirms custody.`
- Primary: `Open offline outbox`
- Secondary: `Back to inbound`

Do not show:
- Raw event ID.
- Raw scan code.
- Receiver full contact.

## Error Handling
All errors must explain:
- What happened.
- Whether custody changed.
- What to do next.

`PACKAGE_SCAN_MISMATCH`:
- Title: `Wrong package label`
- Body: `The scanned label does not match this delivery. Do not receive the package.`
- Actions: `Scan again`, `View custody chain`, `Open support`

`INVALID_STATUS_TRANSITION`:
- Title: `Cannot receive from this state`
- Body: `This delivery is no longer waiting for destination receipt.`
- Actions: `Refresh`, `Open delivery`

`PAYMENT_REQUIRED`:
- Title: `Payment must be confirmed`
- Body: `Destination receipt is blocked until payment is confirmed or support clears the case.`
- Actions: `Open support`, `Refresh`

`FORBIDDEN` station scope:
- Title: `Wrong station access`
- Body: `This account cannot receive the package at this station.`
- Actions: `Back to inbound`, `Sign in again`

`VALIDATION_ERROR` for doorstep:
- Title: `Doorstep route not available`
- Body: `This delivery is not eligible for doorstep routing. Choose station pickup or issue review.`
- Actions: `Change route`, `Open condition check`

`NOT_FOUND`:
- Title: `Delivery not found`
- Body: `Kra could not find this delivery. Do not receive the package until support reviews it.`
- Actions: `Open support`, `Back`

Network failure online:
- Title: `Receipt did not submit`
- Body: `Custody was not confirmed. Retry or queue only if offline receipt is enabled.`
- Actions: `Retry`, `Queue receipt`, `Back`

Offline sync conflict:
- Title: `Receipt conflict`
- Body: `The server state changed before this queued receipt synced. Review before retrying.`
- Actions: `Open recovery`, `View custody chain`

## Visual System
Art direction:
- `Controlled receiving bay`

Design principles:
- Strong custody warning at the top.
- Scanner area with minimal distraction.
- Big review card before mutation.
- Clear state distinction between queued and synced.
- High-contrast failure states.

Color roles:
- Background: pale sand or station neutral.
- Camera surface: dark charcoal.
- Success: deep operational green.
- Driver custody: blue.
- Station custody: green.
- Pending sync: amber.
- Error: red only for blocking risk.

Do not use:
- Purple default gradients.
- Celebration visuals.
- Generic courier art.
- Low-contrast warning chips.
- Map visuals without data.

Typography:
- Tracking code must be highly legible.
- Use tabular numeric treatment for code suffixes where available.
- Review card labels must be compact but readable.
- Error text must not be smaller than supporting metadata.

Motion:
- Scanner frame may pulse subtly while scanning.
- Successful scan locks with a short check transition.
- Submit loading uses deterministic progress language.
- Reduce-motion users get no camera frame animation.

## Component Inventory
Required components:
- `DestinationReceiptHeader`
- `ReceiptCustodyBanner`
- `ConditionRouteSummary`
- `DestinationReceiptScanner`
- `ManualScanFallback`
- `SupervisorOverrideSheet`
- `ReceiptReviewCard`
- `ReceiptSubmitBar`
- `ReceiptSuccessState`
- `ReceiptQueuedState`
- `ReceiptConflictState`
- `ReceiptErrorState`

Shared components to reuse:
- Ops scanner package module.
- Station identity chip.
- Network status chip.
- Delivery status chip.
- Custody chain link.
- Offline outbox badge.
- Accessible bottom sheet.
- Action recovery route.

Do not build:
- New scanner engine if shared scanner exists.
- New auth guard.
- New final-mile assignment component.
- New support form inside this screen.

## Offline Queue Detail
Queue payload must include:
- `operationId=receive_destination`
- `deliveryId`
- `packageScanCode`
- `condition`
- `nextStep`
- `fallbackUsed`
- `supervisorOverrideActorId` if used
- `actorId`
- `stationId`
- `idempotencyKey`
- `requestFingerprint`
- `createdAtLocal`
- `deliveryVersionHint` when available

Queue payload must not include:
- Receiver phone.
- Receiver full address.
- Sender phone.
- Driver phone.
- Payment provider reference.
- Raw timeline metadata not needed for recovery.

Queued receipt UI:
- Show package as `Sync pending`.
- Show exact age of queued action.
- Show `Open outbox`.
- Show `Do not release to receiver or courier until synced`.

Sync success:
- Replace queued state with confirmed state.
- Invalidate delivery detail, timeline, inbound queue, final-mile queue, and blocked queue caches.

Sync conflict:
- Preserve local evidence.
- Route to action recovery.
- Do not auto-discard.

## Privacy And Security
Privacy:
- Render receiver name only if needed for package identification.
- Do not render receiver phone.
- Do not render receiver full address.
- Do not render sender phone.
- Do not render driver phone.
- Do not render raw proof reference.

Security:
- Station operator must be authenticated.
- Station ID must match destination station.
- Manual entry requires supervisor override.
- Package scan code is same-session sensitive data.
- Clear scan code after success, conflict closure, route exit, or sign-out.

Logging:
- Log delivery ID, station ID, status, action result, and error code.
- Do not log scan code.
- Do not log receiver contact data.
- Do not log condition notes if later added as free text.

Analytics:
- Never send scan code.
- Never send receiver phone or full address.
- Never send free-text issue details.

## Accessibility Requirements
Screen:
- Heading is exposed as `Receive package`.
- Custody banner is announced on load.
- Scanner permission and active states are announced.
- Scan success is announced with status semantics.
- Submit success, queued state, and conflict state are announced.

Camera:
- Provide non-camera fallback.
- Manual entry input must have clear label.
- Scanner frame must not rely on color only.
- Torch button must have label and state.

Review:
- Checkbox labels must be complete and specific.
- Submit button disabled reason must be available to assistive tech.
- Confirmation changes must not move focus unexpectedly.

Touch:
- Primary controls at least 44px high.
- Scanner controls at least 44px.
- Condition route CTA at least 44px.
- Error recovery actions at least 44px.

Motion:
- Respect reduce-motion.
- No blinking scanner state.
- No rapid repeated success announcements.

## Analytics Events
Track:
- `station_destination_receipt_viewed`
- `station_destination_receipt_preflight_passed`
- `station_destination_receipt_preflight_failed`
- `station_destination_receipt_condition_required`
- `station_destination_receipt_scan_started`
- `station_destination_receipt_scan_captured`
- `station_destination_receipt_manual_fallback_started`
- `station_destination_receipt_supervisor_override_used`
- `station_destination_receipt_review_confirmed`
- `station_destination_receipt_submit_started`
- `station_destination_receipt_submit_succeeded`
- `station_destination_receipt_submit_failed`
- `station_destination_receipt_queued_offline`
- `station_destination_receipt_sync_conflict`

Allowed properties:
- `deliveryId`
- `stationId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `condition`
- `nextStep`
- `fallbackUsed`
- `offline`
- `screenVersion`

Forbidden properties:
- `packageScanCode`
- Receiver phone.
- Receiver full address.
- Sender phone.
- Driver phone.
- Payment provider reference.
- Free-text notes.

## QA Acceptance Criteria
Preflight:
- Correct destination station passes.
- Wrong destination station blocks.
- Missing assigned driver blocks.
- Current custody not driver blocks.
- Current custody actor not assigned driver blocks.
- `dispatched_from_origin` with driver custody passes.
- `in_transit` with driver custody passes.
- `assigned_to_driver` blocks.
- `awaiting_receiver_pickup` shows already received route.
- `issue_reported` routes to blocked queue.

Condition:
- Missing condition routes to condition check.
- Missing next step routes to condition check.
- `doorstep` next step blocks when `doorstepRequested=false`.
- Damaged condition requires second confirmation.
- Condition summary appears before scan review.

Scan:
- Camera scan captures code.
- Hardware scanner input captures code.
- Manual fallback requires supervisor override.
- Code shorter than 4 characters blocks local submit.
- Code longer than 80 characters blocks local submit.
- Mismatch maps to scan mismatch error.
- Scan code clears after success.

Submit:
- Online success calls `receive_destination`.
- Request includes `packageScanCode`, `condition`, and `nextStep`.
- Request includes fallback fields only when fallback is used.
- Success with `awaiting_receiver_pickup` routes toward pickup handling.
- Success with `awaiting_final_mile_assignment` routes to final-mile queue.
- Success with `issue_reported` routes to blocked queue.
- Success never displays raw scan code.

Offline:
- Queue is available only when offline receipt policy is enabled.
- Queue requires fresh cached detail.
- Queue requires scan, condition, nextStep, review, actor, station, and idempotency key.
- Queued state says not synced.
- Queued state routes to offline outbox.
- Sync conflict routes to action recovery.

Accessibility:
- Custody banner announced.
- Scanner state announced.
- Disabled submit reason announced.
- Success and queued states announced.
- Manual entry is operable without camera.

Privacy:
- Receiver phone never renders.
- Receiver full address never renders.
- Scan code never enters analytics.
- Offline queue excludes receiver contact data.

## Test IDs
Screen:
- `screen-station-destination-receipt`

Header:
- `destination-receipt-header`
- `destination-receipt-refresh`
- `destination-receipt-custody-chain`

Custody:
- `destination-receipt-custody-banner`
- `destination-receipt-scope-blocked`
- `destination-receipt-custody-blocked`

Condition:
- `destination-receipt-condition-required`
- `destination-receipt-condition-check-button`
- `destination-receipt-condition-summary`
- `destination-receipt-next-step-summary`

Scanner:
- `destination-receipt-scanner`
- `destination-receipt-camera-start`
- `destination-receipt-scan-detected`
- `destination-receipt-manual-entry`
- `destination-receipt-supervisor-sheet`
- `destination-receipt-scan-mismatch`

Review:
- `destination-receipt-review-card`
- `destination-receipt-physical-package-checkbox`
- `destination-receipt-damage-confirmation-checkbox`
- `destination-receipt-submit`

States:
- `destination-receipt-loading`
- `destination-receipt-stale`
- `destination-receipt-payment-blocked`
- `destination-receipt-status-blocked`
- `destination-receipt-queued-offline`
- `destination-receipt-sync-pending`
- `destination-receipt-success`
- `destination-receipt-conflict`
- `destination-receipt-error`

## Implementation Notes
Repository layer:
- Load detail first.
- Load timeline only for evidence and duplicate receipt checks.
- Use shared mutation client for idempotency.
- Persist safe receipt queue payload only when offline queue is allowed.
- Invalidate delivery, timeline, inbound queue, final-mile queue, and blocked queue after success.

View model:
- Model scan, condition, next step, preflight, review, and submit as separate states.
- Do not derive condition or nextStep silently.
- Keep scan code in volatile secure state.
- Convert API errors to explicit screen states.
- Preserve queued receipt evidence after app restart.

Navigation:
- Missing condition or nextStep opens `StationConditionCheck`.
- Successful `pickup` route returns to inbound or delivery detail with pickup success state.
- Successful `doorstep` route opens final-mile queue.
- Successful `issue` route opens blocked queue.
- Conflict route opens action recovery.

Performance:
- Detail load should render critical status under 500ms from cache.
- Scanner should open only after preflight and condition state are known.
- Avoid fetching full timeline unless needed.
- Camera processing should avoid repeated frames after detection.

## Edge Cases
Receipt already synced on another device:
- Show `Already received`.
- Offer route to current queue based on status.
- Do not resubmit.

Driver arrives with wrong package:
- Scan mismatch.
- Do not receive.
- Offer custody chain and support.

Driver custody missing but package is physically present:
- Block receipt.
- Route support.
- Do not create local receipt queue unless driver custody was previously verified and backend policy allows recovery.

Condition changed after scan:
- Keep scan only in session.
- Require review again.
- Submit with latest condition and next step.

Doorstep requested but station chooses pickup:
- Allowed when policy permits station pickup fallback.
- Show next route clearly.

Doorstep selected but package damaged:
- Require damaged confirmation.
- Recommend issue route.
- Do not block if policy allows operational discretion; backend may still enforce.

Offline queue sync succeeds after operator leaves screen:
- Push local notification or in-app banner.
- Update delivery caches.
- Remove from pending receipt shelf list.

Offline queue sync fails:
- Keep local evidence.
- Mark conflict.
- Require recovery review.

## Content Quality Bar
The screen is complete only when:
- A station operator cannot submit without condition, next step, scan, and review.
- The custody transition is explicit before submit.
- Offline queue never looks like confirmed receipt.
- Scan mismatch blocks custody change.
- Wrong station is impossible to miss.
- Success routes to the correct next operational queue.
- Sensitive receiver and scan data are protected.
- Accessibility and scanner fallback are fully covered.

## Open Product Questions
These questions do not block the first UI build because safe defaults are defined:
- Should destination receipt always force condition check before scanner, or allow scan first?
- Should damaged condition always force `nextStep=issue`?
- Should offline receipt queue be enabled for all stations or only verified pilot stations?
- Should the driver co-sign destination receipt in driver app?
- Should the backend expose a receipt readiness endpoint?

Default decisions until resolved:
- Allow scan first or condition first, but submit only when both scan and condition/routing exist.
- Recommend issue for damaged packages but require operator confirmation.
- Treat queued offline receipt as pending, never confirmed.
- Use delivery detail and timeline for readiness until a dedicated endpoint exists.

## Final Implementation Directive For Claude Code
Build `StationDestinationReceipt` as the station-side driver-to-destination custody transfer screen. It must preflight delivery scope and driver custody, require condition and next route from `StationConditionCheck` when missing, capture a package label scan, require review confirmation, call `receive_destination` with `packageScanCode`, `condition`, and `nextStep`, and route based on the returned status. Offline queue is allowed only under strict policy and must display `sync pending`, not confirmed receipt. The screen must never show receiver phone or full address, never send scan code to analytics, and never mark station custody from local state alone.
