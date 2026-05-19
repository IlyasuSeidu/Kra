# Station Final-Mile Assignment Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationFinalMileAssignment` |
| App | `apps/mobile` |
| Route | `/(ops)/station/final-mile/:deliveryId/assign` |
| Primary test ID | `screen-station-final-mile-assignment` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `assign_final_mile`, `assignFinalMileRequestSchema`, local final-mile assignment outbox, doorstep policy |
| Related routes | `/(ops)/station/final-mile`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/blocked`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `preflight_ready`, `courier_required`, `courier_selected`, `courier_scan_active`, `courier_scan_invalid`, `courier_manual_entry`, `assignment_review`, `submitting`, `queued_offline`, `sync_pending`, `assignment_success`, `assignment_conflict`, `status_blocked`, `scope_blocked`, `payment_blocked`, `serviceability_blocked`, `custody_blocked`, `issue_blocked`, `courier_validation_unavailable`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen assigns one eligible doorstep package to one final-mile courier without moving custody.

The screen answers one operational question: `Which courier should be responsible for accepting this package next?`

The station operator should be able to:
- Verify the delivery is eligible for final-mile assignment.
- Confirm the package is still in destination-station custody.
- Select or scan the courier identity that will accept the package.
- Review assignment consequences before submitting.
- Submit `assign_final_mile` with exactly one `courierUserId`.
- Queue the assignment only when the offline policy is satisfied.
- See that custody remains with the station until the courier scans and accepts.
- Recover from stale status, wrong station, payment blocker, serviceability blocker, and assignment conflicts.
- Return to the final-mile queue after success.

This screen is not:
- A final-mile queue.
- A courier availability dashboard.
- A route optimization screen.
- A live map.
- A package scanner for custody transfer.
- A courier accept screen.
- A receiver contact screen.
- A support case workspace.
- A reassign workflow.
- A staff provisioning screen.

## Audience
Primary audience:
- Destination station operators assigning doorstep work.
- Station leads supervising same-day final-mile throughput.

Secondary audience:
- Claude Code implementing the assignment workflow.
- QA validating mutation, offline queue, conflict, and privacy behavior.
- Backend engineers validating current endpoint limits.
- Operations leads validating courier accountability.
- Accessibility reviewers validating form labels, review copy, errors, and status updates.

## User State
The operator is at the destination station, package is physically present, and a courier may be nearby or ready to accept work. The operator is making an accountability decision, not a custody transfer. The assignment tells the system who should scan and accept next.

The user may be:
- Coming from `StationFinalMileQueue`.
- Handling a package received before the `15:00` same-day target cutoff.
- Reassigning work operationally after a failed attempt returned the package to `awaiting_final_mile_assignment`.
- Working with weak network and a fresh cached delivery.
- Scanning a courier badge or entering a controlled courier user ID.
- Discovering that the package moved while the screen was open.
- Discovering that current backend cannot validate courier capacity or station roster.

The screen must:
- Fetch current delivery detail before enabling submit.
- Require status `awaiting_final_mile_assignment`.
- Require signed-in station to match `destinationStationId`.
- Require `doorstepRequested=true`.
- Require `paymentStatus=confirmed`.
- Require current custody to remain with station operator at destination station when detail includes custody fields.
- Require a non-empty `courierUserId`.
- Explain that assignment does not move custody.
- Submit only `courierUserId` to `assign_final_mile`.
- Never ask the station operator to scan the package for final-mile custody on this screen.
- Never mark courier custody as accepted locally.

## Backend Contract
Existing backend facts:
- `assign_final_mile` exists at `POST /v1/deliveries/:id/assign-final-mile`.
- Route capability is `assign_final_mile`.
- Station operator role has `assign_final_mile`.
- Request schema is `assignFinalMileRequestSchema`.
- Request body requires only `courierUserId`.
- `courierUserId` must satisfy shared `userIdSchema`.
- Mutation is idempotent through the backend mutation framework.
- Backend station scope requires actor station to match delivery `destinationStationId`.
- Backend applies transition from `awaiting_final_mile_assignment` to `assigned_for_final_mile`.
- Backend validates payment through shared transition enforcement.
- Backend records event type `final_mile_courier_assigned`.
- Backend sets `assignedFinalMileCourierId`.
- Backend sends receiver delivery SMS for `final_mile_assigned`.
- Backend response is `deliveryLifecycleResponseSchema`.
- Backend does not change `currentCustodyRole` or `currentCustodyActorId`.
- Courier custody moves only after `accept_final_mile_assignment` by the assigned final-mile courier.

Mutation request:
```json
{
  "courierUserId": "USR-COR-001"
}
```

Successful response implication:
- Response status should be `assigned_for_final_mile`.
- Delivery remains physically and operationally at destination station until courier acceptance scan succeeds.
- Final-mile queue should move the delivery from `Needs courier` to `Assigned`.
- Courier app should show the package in assignments if list access supports assigned courier scope.

Current backend gaps:
- No station-safe courier roster endpoint exists.
- No final-mile courier availability endpoint exists.
- No courier capacity endpoint exists.
- No courier current-location or route endpoint exists.
- No server-side validation that `courierUserId` belongs to an active `final_mile_courier` account is visible in `assignFinalMileCourier`.
- No server-side validation that selected courier belongs to the same destination station is visible in `assignFinalMileCourier`.
- No assignment expiry timestamp is returned.
- No reassign endpoint exists for station operators.
- No server-computed readiness object exists.

Implementation boundary:
- This screen can use a station-provided courier ID source.
- This screen can scan a staff badge if the app has a staff-badge scan component.
- This screen can accept controlled manual courier ID entry for pilot operations.
- This screen must not call admin user APIs from a station operator session.
- This screen must not claim courier is available unless a future endpoint supplies that fact.
- This screen must not claim route fit or capacity fit unless backend supplies those facts.

Production-ready recommendation:
- Add `GET /v1/station/final-mile-couriers` returning station-scoped active couriers with safe display fields and availability.
- Add server validation that assigned user is active, has `final_mile_courier` role, and is eligible for the destination station.
- Add assignment expiry and acceptance deadline fields.
- Add station operator reassign workflow with strict audit and conflict protection.
- Add final-mile capacity rules before any route or workload scoring.

## Doorstep Policy Contract
Doorstep delivery v1 rules from `docs/03-business/doorstep-delivery-rules.md`:
- Doorstep assignment occurs after confirmed destination-station receipt.
- Eligible delivery status is `received_at_destination` or `awaiting_final_mile_assignment`; current backend normally routes to `awaiting_final_mile_assignment`.
- `doorstepRequested` must be true.
- Payment must be collected before assignment.
- Receiver name and phone must be present.
- Address text or recognizable landmark must be present.
- Doorstep surcharge must already be collected.
- Same-day assignment is targeted before `15:00` local time when capacity exists.
- Courier acceptance or rejection target is `15 minutes`.
- Courier should move to `out_for_delivery` within `2 hours` after acceptance unless reassigned.
- No cash collection is allowed during final-mile completion.

Policy-to-UI decisions:
- Require a readiness section before courier selection.
- Show payment, doorstep request, distance, address readiness, and custody as separate checks.
- Show `Same-day target` only as station guidance when capacity data is absent.
- Show `Next business day target` after `15:00` local time.
- Show `Courier must scan to accept custody` in review and success states.
- Show no cash collection reminder in assignment review because it affects courier handoff expectations.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product promises beyond current backend:
- Android offline-first guidance says offline writes require more care than reads because local and network data can conflict, and queues plus connectivity monitors can drain pending work when the app reconnects.
- W3C error identification guidance requires detected input errors to be described in text.
- W3C labels and instructions guidance requires clear labels or instructions when user input is expected, including selection controls.
- W3C status message guidance requires important status changes to be exposed to assistive technologies without forcing focus.
- Google Route Optimization API documentation describes assignment, time windows, vehicle capacity, and constraints as inputs to route planning, which supports why this screen must not invent capacity or route fit locally.
- Google Maps Platform logistics guidance separates address validation, route planning, dispatch, navigation, and asset tracking into distinct capabilities.

Reference links:
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WCAG labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [Google Route Optimization API overview](https://developers.google.com/maps/documentation/route-optimization/overview)
- [Google Route Optimization response interpretation](https://developers.google.com/maps/documentation/route-optimization/interpret-response)
- [Google Maps Platform transportation and logistics](https://mapsplatform.google.com/solutions/transportation-and-logistics/)

## Screen Thesis
The screen should feel like a secure assignment handoff card: one package, one courier, one review, one clear consequence.

The operator should understand in three seconds:
- Which package is being assigned.
- Whether the package is eligible.
- Which courier will be responsible next.
- That custody stays with the station until courier scan acceptance.
- Whether the assignment is live, queued, blocked, or failed.

Visual thesis:
- Use a focused single-record layout, not a dense dashboard.
- Make eligibility checks feel like an operating checklist.
- Make courier identity selection prominent but restrained.
- Make the final review feel consequential without feeling scary.

Restraint rule:
- Do not show route maps, capacity scores, courier rankings, or receiver contact data without backend support.

## Information Architecture
Top-level layout:
1. Header and delivery identity.
2. Eligibility checklist.
3. Courier identity section.
4. Assignment consequence panel.
5. Review and submit area.
6. Offline or conflict recovery area.

Header:
- Title: `Assign courier`
- Subtitle: tracking code.
- Back route: `/(ops)/station/final-mile`.
- Overflow actions: delivery detail, custody chain, support.

Delivery identity card:
- Tracking code.
- Receiver safe display name.
- Destination station code.
- Current status label.
- Latest event age.
- Doorstep distance if present and within policy.
- No receiver phone.
- No full address.

Eligibility checklist:
- `Destination station matched`
- `Package in station custody`
- `Doorstep requested`
- `Payment confirmed`
- `Within doorstep zone`
- `Receiver contact ready`
- `Address or landmark ready`
- `No active blocker`

Courier identity section:
- Primary input mode: `Scan courier badge` when staff badge scan exists.
- Secondary input mode: `Enter courier ID`.
- Future mode: station-safe courier roster once endpoint exists.
- Selected courier summary uses `courierUserId` and safe display name only if provided by a trusted source.

Assignment consequence panel:
- `This assignment does not move custody.`
- `Courier must scan this package to accept custody.`
- `Receiver will be notified that doorstep delivery is being prepared.`
- `No cash collection is allowed at delivery.`

Review and submit area:
- Primary action: `Assign courier`
- Secondary action: `Cancel`
- Disabled until preflight and courier identity are valid.
- Online submit should call `assign_final_mile`.
- Offline submit can queue only under the offline assignment policy below.

## Data Loading Model
Initial load:
1. Load cached delivery detail if available.
2. Render read-only summary with stale state if cache exists.
3. Fetch `GET /v1/deliveries/:id`.
4. Fetch `GET /v1/deliveries/:id/timeline` when eligibility needs event context.
5. Recalculate eligibility.
6. Enable courier selection only after current detail passes blocking checks.

Required delivery fields:
- `deliveryId`
- `trackingCode`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver.name`
- `receiver.phone` presence only
- `receiver.addressText` presence only
- `package.isFragile`
- `package.sizeTier`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`

Sensitive field handling:
- Delivery detail currently returns full receiver object.
- This screen may receive receiver phone and address in memory.
- Do not render receiver phone.
- Do not render full address.
- Do not durable-cache receiver phone.
- Do not durable-cache full address.
- Do not log receiver phone or full address.
- Do not send receiver phone or full address to analytics.
- Store only boolean readiness flags for receiver contact and address readiness.

Timeline use:
- Use timeline to confirm destination receipt event when detail is ambiguous.
- Use timeline to explain why status is blocked.
- Do not require timeline for the happy path if detail is fresh and complete.
- If timeline fails but detail is assignable, allow assignment and show `Timeline unavailable` as a non-blocking note.

Freshness rules:
- `fresh`: detail fetched under `2 minutes` ago.
- `aging`: detail fetched `2` to `5 minutes` ago.
- `stale`: detail fetched over `5 minutes` ago.
- `unsafe_for_submit`: detail fetched over `5 minutes` ago and device is online but refresh failed.

## Eligibility Rules
Submit is allowed only when:
- User role is `station_operator`.
- User has `assign_final_mile`.
- User station equals `destinationStationId`.
- Delivery status is `awaiting_final_mile_assignment`.
- `doorstepRequested` is true.
- `paymentStatus` is `confirmed`.
- `currentCustodyRole` is `station_operator` when backend populated custody.
- Current custody station context is destination station.
- Receiver name exists.
- Receiver phone exists, checked as a boolean only.
- Address or landmark exists, checked as a boolean only.
- `doorstepDistanceKm` is absent with warning or present and `<= 10`.
- No active issue or hold state is detected.
- `courierUserId` passes client schema validation.
- Review checkbox is acknowledged.

Submit is blocked when:
- Delivery status is not `awaiting_final_mile_assignment`.
- Payment is not confirmed.
- Delivery is outside station scope.
- Doorstep was not requested.
- Package already assigned to a courier.
- Package is already out for delivery.
- Package is in issue state or on hold.
- Detail data is stale and cannot refresh.
- Courier identity is missing or invalid.
- Session lacks permission.

Distance behavior:
- If `doorstepDistanceKm <= 10`, show `Within doorstep zone`.
- If `doorstepDistanceKm > 10`, block assignment and route to support or pickup conversion.
- If `doorstepDistanceKm` is missing, show `Distance not verified`.
- Missing distance can be warning-only only if business policy allows manual station handling; default v1 behavior should block until support resolves.

Current backend-compatible courier identity:
- Accept `courierUserId` from a trusted staff badge scan or controlled manual entry.
- Validate basic format using shared user ID rules in client code if available.
- Do not invent courier full name, phone, availability, or capacity.
- Show `Courier identity not server-verified before assignment` when no roster endpoint is available.
- Rely on courier acceptance scan to complete custody transfer.

## Courier Selection Model
Preferred future model:
- Station-safe courier roster endpoint.
- Active courier status.
- Station eligibility.
- Capacity.
- Current assigned count.
- Acceptance history.
- Distance or route context.

Current buildable model:
- Badge scan or controlled ID entry.
- Optional local recent-courier list from previously successful assignments on the same device.
- Safe courier display only when sourced from trusted local assignment history or future roster API.
- No phone display.
- No unverified availability display.

Courier identity input:
- Label: `Courier ID`
- Helper: `Assigns responsibility only. Courier custody starts after package scan acceptance.`
- Error when empty: `Enter or scan the courier ID.`
- Error when invalid format: `Courier ID format is not valid.`
- Warning when no roster validation exists: `Current backend accepts the ID, then the courier must confirm in their app.`

Recent courier list:
- Optional.
- Store only `courierUserId`, safe display label, and last assignment time.
- Scope to signed-in station and device.
- Never store courier phone.
- Clear on sign out.

Scan behavior:
- Staff badge scan intent must be distinct from package scan intent.
- If package scan is detected on this screen, show `This is the package label. Scan the courier badge or enter courier ID.`
- If scanned data contains no valid courier identifier, show field error in text.
- Do not send scanned badge data to analytics.

## Offline Assignment Policy
The inventory marks this screen offline-critical, but assignment writes are conflict-prone. Offline assignment must be narrow and explicit.

Offline queue is allowed only when:
- Delivery detail was fetched fresh while online under `2 minutes` before connectivity loss.
- Delivery passed all eligibility checks at that time.
- `courierUserId` is captured.
- Operator confirms the offline warning.
- A unique idempotency key is stored.
- The queued request stores only `deliveryId`, `courierUserId`, station ID, status at queue time, fetched timestamp, and idempotency key.

Offline queue is not allowed when:
- Delivery detail is stale.
- Delivery came only from list row cache.
- Payment status is not confirmed.
- Doorstep distance is missing or outside zone.
- Custody state is not station operator.
- Package is already assigned.
- Courier ID is not validated locally.
- There is an active blocker.

Offline UI language:
- Queued state title: `Assignment queued`
- Queued state body: `This package is not assigned on the server yet. Keep it at the station until sync succeeds and the courier scans it.`
- Sync pending chip: `Pending sync`
- Conflict title: `Assignment did not sync`
- Conflict body: `The package changed before this device reconnected. Review the current delivery state.`

Outbox behavior:
- Use `assign_final_mile` operation key.
- Include backend `Idempotency-Key`.
- Retry only when network returns.
- Stop retrying on status conflict, scope conflict, payment conflict, or validation error.
- Show conflict in `OpsActionRecovery`.
- Do not silently rewrite `courierUserId`.

After offline sync success:
- Move local delivery status to `assigned_for_final_mile`.
- Mark assignment as server-confirmed.
- Route back to final-mile queue or success state.
- Announce status change.

## Review And Submit
Review panel must show:
- Tracking code.
- Safe receiver display name.
- Destination station.
- Courier ID.
- Current custody owner: destination station.
- Next required actor: assigned courier.
- Required next proof: package scan by courier.
- Receiver notification: final-mile assignment message.
- Cash rule: no cash collection.

Required acknowledgement:
- Text: `I confirm this courier is the intended final-mile courier for this package.`
- Required before online or offline submit.
- This acknowledgement is local UI confirmation, not a backend audit event.

Submit button:
- Default label: `Assign courier`
- Loading label: `Assigning`
- Offline label: `Queue assignment`
- Disabled label should not be used; disabled state needs visible reason.

Online success:
- Title: `Courier assigned`
- Body: `Custody is still with the station. The courier must scan the package to accept it.`
- Primary action: `Back to final-mile queue`
- Secondary action: `View custody`

Queued success:
- Title: `Assignment queued`
- Body: `Sync must succeed before the courier can accept this package.`
- Primary action: `View outbox`
- Secondary action: `Back to queue`

Conflict success:
- Do not show success.
- Show conflict with current server status and correct next route.

## Visual Design Requirements
The screen must look precise and serious, like an accountable operational form.

Layout:
- Single-column mobile layout.
- Package summary stays compact at top.
- Eligibility checklist appears before courier input.
- Courier input area gets the strongest visual weight after eligibility.
- Review panel appears only after courier identity is valid.
- Sticky bottom submit area shows current blocker or primary action.

Color:
- Use neutral base surfaces.
- Use green for passed checks.
- Use amber for missing non-sensitive context or offline queue warning.
- Use red for blockers and conflicts.
- Use blue or brand accent only for the primary action.
- Do not overload the page with many chip colors.

Typography:
- Use tracking code as the largest operational identifier.
- Use direct labels, not sentence-length headings.
- Error copy must be plain and specific.
- Consequence copy must be short enough to read while standing at the counter.

Touch:
- Primary action must be large and thumb-reachable.
- Scan and manual entry actions must be clearly separate.
- Review acknowledgement must have a large accessible hit target.
- Avoid placing `Cancel` directly beside `Assign courier` with equal weight.

Motion:
- Use short state transitions between preflight, courier input, and review.
- Use no continuous animation.
- Respect reduced motion.
- Keep submit progress stable and non-jumping.

## Components
Required components:
- `OpsScreenScaffold`
- `AssignmentHeader`
- `DeliveryIdentityCard`
- `EligibilityChecklist`
- `EligibilityCheckRow`
- `CourierIdentityInput`
- `CourierBadgeScanButton`
- `CourierRecentList`
- `AssignmentConsequencePanel`
- `AssignmentReviewPanel`
- `AssignmentAcknowledgement`
- `OfflineAssignmentWarning`
- `AssignmentSubmitBar`
- `AssignmentSuccessState`
- `AssignmentConflictSheet`
- `AssignmentBlockerSheet`
- `AccessibleStatusAnnouncer`

Component contracts:
- `DeliveryIdentityCard` receives safe delivery summary, not raw receiver phone or address.
- `EligibilityChecklist` receives booleans and short reasons.
- `CourierIdentityInput` owns value, validation, and scan result handling.
- `AssignmentReviewPanel` receives only the final `courierUserId`, safe package identifiers, and consequence copy.
- `AssignmentSubmitBar` receives `canSubmit`, `blockedReason`, `networkState`, and `pendingState`.
- `AccessibleStatusAnnouncer` announces loading, field errors, queued state, success, and conflict.

## State Machine
Initial:
- `loading` when delivery detail is not yet available.
- `preflight_ready` when delivery detail is fresh and eligibility can be evaluated.

Courier input:
- `courier_required` when no courier ID is present.
- `courier_selected` when courier ID is valid.
- `courier_scan_active` when staff badge scanner is open.
- `courier_scan_invalid` when scanned data is not a courier ID.
- `courier_manual_entry` when operator chooses typed entry.

Review and mutation:
- `assignment_review` when all checks pass and acknowledgement is pending or complete.
- `submitting` while online mutation is in flight.
- `queued_offline` when offline assignment policy accepts the local request.
- `sync_pending` when request is waiting in outbox.
- `assignment_success` when backend confirms status `assigned_for_final_mile`.
- `assignment_conflict` when backend rejects because delivery changed.

Blocked:
- `status_blocked` when status is not `awaiting_final_mile_assignment`.
- `scope_blocked` when station does not match destination station.
- `payment_blocked` when payment is not confirmed.
- `serviceability_blocked` when doorstep rules fail.
- `custody_blocked` when custody is not station operator.
- `issue_blocked` when issue or hold state blocks assignment.
- `courier_validation_unavailable` when station operator cannot validate the courier against a roster.
- `not_authorized` when capability is missing.
- `session_expired` when auth cannot refresh.
- `api_error` for retryable failures.
- `rate_limited` for throttled mutation or fetch.

## Error And Recovery Copy
Use calm, specific copy.

Missing courier:
- Title: `Courier required`
- Body: `Scan the courier badge or enter the courier ID before assigning this package.`
- Action: `Scan courier badge`

Invalid courier ID:
- Title: `Courier ID is not valid`
- Body: `Check the ID and try again.`
- Action: `Edit ID`

Roster validation unavailable:
- Title: `Courier roster unavailable`
- Body: `Current backend cannot confirm courier availability here. Assign only a verified station courier.`
- Action: `Continue with ID`

Wrong status:
- Title: `Package cannot be assigned`
- Body: `This package is no longer waiting for final-mile assignment.`
- Action: `View delivery`

Wrong station:
- Title: `Wrong station`
- Body: `Only the destination station can assign final-mile courier work for this package.`
- Action: `View custody`

Payment blocker:
- Title: `Payment not confirmed`
- Body: `Do not assign a final-mile courier until the backend confirms payment.`
- Action: `View delivery`

Serviceability blocker:
- Title: `Doorstep eligibility failed`
- Body: `This delivery is missing required doorstep data or is outside the v1 service zone.`
- Action: `Open support`

Custody blocker:
- Title: `Station custody not confirmed`
- Body: `Courier assignment requires the package to remain in destination-station custody.`
- Action: `View custody`

Conflict:
- Title: `Assignment could not be completed`
- Body: `The package changed before this assignment reached the server. Review the latest state.`
- Action: `Refresh delivery`

Rate limit:
- Title: `Too many attempts`
- Body: `Wait a moment before trying again.`
- Action: `Retry later`

Generic API failure:
- Title: `Assignment failed`
- Body: `No courier was assigned. Check connection and try again.`
- Action: `Retry`

## Privacy And Safety
Privacy rules:
- Do not render receiver phone.
- Do not render full receiver address.
- Do not render courier phone.
- Do not render staff personal email.
- Do not log staff badge raw payload.
- Do not send courier badge raw payload to analytics.
- Do not store receiver phone or full address in outbox.
- Do not store full delivery detail in assignment outbox.

Safety rules:
- Show custody does not move.
- Show courier scan is required next.
- Show no cash collection rule.
- Show offline assignment remains unconfirmed until sync.
- Prevent assignment from stale detail.
- Prevent assignment after current status changes.
- Prevent accidental double submit.
- Use idempotency key for every submitted assignment.

## Analytics And Audit
Allowed analytics events:
- `station_final_mile_assignment_opened`
- `station_final_mile_assignment_preflight_loaded`
- `station_final_mile_assignment_courier_scan_started`
- `station_final_mile_assignment_courier_selected`
- `station_final_mile_assignment_review_shown`
- `station_final_mile_assignment_submitted`
- `station_final_mile_assignment_queued_offline`
- `station_final_mile_assignment_succeeded`
- `station_final_mile_assignment_conflicted`
- `station_final_mile_assignment_blocked`

Allowed analytics properties:
- `deliveryId`
- `stationId`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `hasDoorstepDistance`
- `distanceBand`
- `networkState`
- `sourceRoute`
- `blockerType`
- `queuedOffline`
- `syncAgeSeconds`

Forbidden analytics properties:
- Receiver phone.
- Receiver full address.
- Courier phone.
- Staff badge raw payload.
- Package scan code.
- Full package description.
- Declared value.
- Raw API error text.

Audit note:
- The backend lifecycle event is the source of truth for assignment.
- The local acknowledgement is UI safety state, not an audit event.
- Do not invent local audit rows for assignment success.

## Navigation Rules
Entry points:
- `StationFinalMileQueue` assign action.
- `OpsDeliveryDetail` when station operator views `awaiting_final_mile_assignment`.
- `StationBlockedQueue` after an issue is resolved back to final-mile assignment.

Exit routes:
- `/(ops)/station/final-mile` after success or cancel.
- `/(ops)/deliveries/:deliveryId` for delivery detail.
- `/(ops)/deliveries/:deliveryId/custody` for custody chain.
- `/(ops)/station/blocked` for issue or hold.
- `/(ops)/station/support` for serviceability or courier identity help.
- `/(ops)/offline-outbox` for queued assignment.

Back behavior:
- If no courier ID entered, back returns to queue.
- If courier ID entered but not submitted, confirm discard.
- If assignment is submitting, block back until request resolves or allow safe background state if implemented.
- If assignment queued offline, back returns to queue with sync-pending banner.
- If success, back returns to queue and active tab should refresh.

## QA Acceptance Criteria
Functional:
- Route renders root test ID `screen-station-final-mile-assignment`.
- Screen fetches delivery detail on open.
- Submit remains disabled until delivery is eligible and courier ID is valid.
- Submit sends only `courierUserId` to `assign_final_mile`.
- Submit includes idempotency key.
- Successful response moves local state to `assigned_for_final_mile`.
- Success copy states custody is still with station.
- Screen never calls `accept_final_mile_assignment`.
- Screen never changes custody locally.
- Wrong status blocks submit.
- Wrong station blocks submit.
- Payment not confirmed blocks submit.
- Doorstep not requested blocks submit.
- Missing or outside-zone distance blocks submit unless product overrides policy later.
- Offline queue follows the strict offline assignment policy.
- Conflict sends user to refresh or detail.

Privacy:
- Receiver phone is not displayed.
- Full address is not displayed.
- Courier phone is not displayed.
- Outbox stores no receiver phone or full address.
- Analytics excludes sensitive fields.

Accessibility:
- Courier ID input has visible label and accessible name.
- Field errors are described in text.
- Assignment success and queued states are announced.
- Conflict and blocker sheets move focus safely.
- Review acknowledgement is reachable and has a large touch target.
- Submit disabled reason is visible in text.

Visual:
- First viewport shows package identity, eligibility status, and courier input.
- Review consequence panel is clear and short.
- Offline warning cannot be missed.
- Success state does not imply custody transfer.

## Implementation Notes For Claude Code
Build this as a strict mutation screen:
- Create route `/(ops)/station/final-mile/:deliveryId/assign`.
- Use `screen-station-final-mile-assignment` as root test ID.
- Reuse delivery detail and timeline hooks.
- Reuse `useAssignFinalMileMutation`.
- Keep request body limited to `{ courierUserId }`.
- Do not call admin user APIs from this screen.
- Add a narrow `AssignmentDeliverySummary` type with safe fields only.
- Keep raw receiver detail out of render props.
- Keep outbox payload minimal and idempotent.
- Invalidate `Delivery`, `StationQueue`, and `CourierQueue` after success.
- Route back to `StationFinalMileQueue` after success.
- Ensure all error branches are testable with controlled API responses.

Recommended component test IDs:
- `station-final-mile-assignment-header`
- `station-final-mile-assignment-delivery-card`
- `station-final-mile-assignment-eligibility`
- `station-final-mile-assignment-courier-input`
- `station-final-mile-assignment-scan-courier`
- `station-final-mile-assignment-manual-courier`
- `station-final-mile-assignment-review`
- `station-final-mile-assignment-acknowledgement`
- `station-final-mile-assignment-submit`
- `station-final-mile-assignment-offline-warning`
- `station-final-mile-assignment-success`
- `station-final-mile-assignment-conflict`
- `station-final-mile-assignment-blocker`

## Open Backend Follow-Ups
The screen is buildable with current backend, but these follow-ups are important before a large pilot:
- Add station-safe final-mile courier roster endpoint.
- Validate `courierUserId` role and active status server-side inside `assignFinalMileCourier`.
- Validate courier station eligibility or service area server-side.
- Return assignment deadline and acceptance deadline.
- Return server-side final-mile readiness blockers.
- Add reassign or unassign workflow with audit protection.
- Add courier workload and capacity endpoint.
- Add route optimization only after locations, time windows, vehicle constraints, and capacity exist in backend.
- Add notification result visibility for final-mile assignment SMS.

## Completion Standard
This spec is complete when Claude Code can build the assignment screen without adding product policy:
- Route and test ID are explicit.
- Backend request body is explicit.
- Eligibility blockers are explicit.
- Courier identity source limits are explicit.
- Offline assignment policy is explicit.
- Custody boundary is explicit.
- Privacy boundaries are explicit.
- Success, queued, conflict, and error states are explicit.
- QA checks are explicit.
