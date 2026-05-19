# Station Driver Assignment Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationDriverAssignment` |
| App | `apps/mobile` |
| Route | `/(ops)/station/outbound/:deliveryId/assign-driver` |
| Primary test ID | `screen-station-driver-assignment` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `assign_driver`, station-scoped active driver lookup before production driver selection, local assignment outbox |
| Related routes | `/(ops)/station/outbound`, `/(ops)/station/outbound/:deliveryId/dispatch`, `/(ops)/station/outbound/:deliveryId/driver-pickup`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `driver_lookup_ready`, `driver_lookup_unavailable`, `driver_searching`, `driver_selected`, `assignment_review`, `assigning`, `assignment_success`, `offline_queue_ready`, `offline_queued`, `payment_blocked`, `status_blocked`, `issue_blocked`, `scope_blocked`, `stale_data`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen assigns a confirmed origin-station package to a driver without moving custody. It gives station operators a controlled way to choose or verify the driver who will later handle origin pickup.

The screen answers one operational question: `Can this station safely assign this package to a verified driver now?`

The station operator should be able to:
- Confirm the delivery is eligible for driver assignment.
- See the package, destination, service, and payment readiness.
- Select a verified active driver or scan a verified driver badge.
- Understand that assignment does not move custody.
- Review the assignment before submitting.
- Submit `assign_driver` only with a valid `driverUserId`.
- Queue the assignment offline only when cached facts are fresh and safe.
- Recover from payment, status, station scope, stale data, driver lookup, or API errors.
- Continue to dispatch readiness after assignment succeeds.

This screen is not:
- A driver run acceptance screen.
- A dispatch readiness scan screen.
- A driver pickup custody screen.
- A driver management admin screen.
- A bulk assignment board.
- A payment recovery screen.
- A support case detail screen.

## Audience
Primary audience:
- Station operators assigning outbound packages to line-haul drivers.
- Station leads supervising origin dispatch throughput.

Secondary audience:
- Claude Code implementing the assignment flow.
- QA validating assignment gates and offline behavior.
- Backend engineers closing driver lookup gaps.
- Operations leads validating driver selection policy.
- Security reviewers validating role and station boundaries.
- Accessibility reviewers validating search, selection, review, and confirmation states.

## User State
The operator likely has a physical package nearby and may have a driver waiting at the station. The screen must make the next action obvious while protecting against assigning the wrong driver, wrong package, unpaid package, or stale record.

The user may be:
- Opening from `StationOutboundQueue`.
- Assigning a driver after intake and first label print.
- Scanning a driver QR or station badge.
- Selecting from a roster of active drivers.
- Reassigning after a previous status changed before submit.
- Working with weak network and a recent cached queue.
- Recovering when the driver list cannot load.

The screen must:
- Require station scope.
- Require payment confirmed.
- Require allowed status.
- Require verified driver identity.
- Keep custody with station after assignment.
- Never use admin user APIs in the station app.
- Never accept free-text driver IDs in production.
- Never call `dispatch_delivery` or `confirm_pickup`.

## Backend Reality Check
Existing backend facts:
- `assign_driver` exists at `POST /v1/deliveries/:id/assign-driver`.
- Request body is `{ driverUserId }`.
- `assign_driver` can move `received_at_origin` through queueing into `assigned_to_driver`.
- `assign_driver` requires station operator capability.
- Station scope is checked against `originStationId`.
- Payment is required before entering transport states.
- The delivery list response does not include active driver roster data.
- `GET /v1/admin/users` exists but requires admin capability and must not be called from station operator mobile UI.

Current backend gap:
- No station-scoped active driver lookup endpoint exists for station operators.
- No station driver availability response exists.
- No assignment preview endpoint exists.
- Driver identity and active status must be verified by backend before production assignment.

Production rule:
- The station UI may call `assign_driver` only after driver identity comes from a trusted roster endpoint or trusted driver badge verification flow.
- If neither trusted source exists, show `driver_lookup_unavailable` and block assignment.

Required backend contract before full production driver selection:
- `GET /v1/station/drivers?status=active&stationId=current`
- Response fields: `driverUserId`, `fullName`, `status`, `homeStationId`, `availability`, `activeRunCount`, `lastSeenAt`, `eligibleForAssignment`, `blockedReason`
- `POST /v1/station/drivers/verify-assignment-code`
- Request fields: `assignmentCode`, `deliveryId`
- Response fields: `driverUserId`, `fullName`, `status`, `eligibleForAssignment`, `expiresAt`
- `assign_driver` should reject inactive users, non-driver roles, missing users, and blocked drivers.

Station app must not work around these gaps by exposing admin user management.

## Assignment Authority
Assignment is allowed when:
- User role is `station_operator`.
- User station matches delivery `originStationId`.
- Delivery status is `received_at_origin` or `awaiting_driver_assignment`.
- Delivery payment status is `confirmed`.
- Delivery is not in active `issue_reported` or `on_hold` branch.
- Driver identity is verified by trusted source.
- App has fresh delivery data or valid offline queue conditions.

Assignment is blocked when:
- Payment status is `pending`, `failed`, `refund_pending`, or `refunded`.
- Delivery status is `created`, `assigned_to_driver`, `dispatched_from_origin`, `in_transit`, destination, final-mile, terminal, or issue state.
- Station scope mismatches origin station.
- Driver lookup is unavailable.
- Selected driver is inactive, blocked, already over capacity, or not verified.
- Cached data is older than allowed offline threshold.
- App cannot create an idempotent assignment action.

Assignment result:
- Delivery becomes `assigned_to_driver`.
- Driver ID is assigned.
- Custody remains with station operator.
- Next route is `StationDispatchReadiness`.
- Driver pickup custody happens later in `StationDriverPickupScan` or driver pickup scan flow.

## Eligible Delivery States
Allowed:
- `received_at_origin`
- `awaiting_driver_assignment`

Blocked:
- `created`: not yet received at origin.
- `assigned_to_driver`: already assigned; open dispatch readiness.
- `dispatched_from_origin`: package has left origin after pickup confirmation.
- `in_transit`: driver workflow.
- `received_at_destination`: inbound queue.
- `awaiting_receiver_pickup`: destination pickup.
- `awaiting_final_mile_assignment`: final-mile queue.
- `assigned_for_final_mile`: final-mile workflow.
- `out_for_delivery`: courier workflow.
- `delivered`, `closed`, `cancelled`, `delivery_failed`: terminal or closed work.
- `issue_reported`, `on_hold`: blocked queue.

Status copy:
- `received_at_origin`: `Ready to assign`
- `awaiting_driver_assignment`: `Waiting for driver`
- `assigned_to_driver`: `Already assigned`
- `created`: `Not received yet`
- blocked status: `Cannot assign from this state`

## Data Sources
Required delivery source:
- `GET /v1/deliveries/:id`

Timeline source:
- `GET /v1/deliveries/:id/timeline`

Assignment mutation:
- `POST /v1/deliveries/:id/assign-driver`

Required future driver source:
- Station-scoped active driver roster endpoint.
- Driver assignment code verification endpoint.

Local source:
- Outbound queue cache.
- Recently selected station driver cache.
- Offline assignment outbox.

Required delivery fields:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `receiver.name`
- `package.sizeTier`
- `package.weightKg`
- `currentCustodyRole`
- `currentCustodyActorId`
- `latestEvent`

Required driver fields:
- `driverUserId`
- `fullName`
- `status`
- `availability`
- `activeRunCount`
- `eligibleForAssignment`
- `blockedReason`
- `lastSeenAt`

Do not fetch:
- Receiver phone.
- Receiver full address.
- Payment provider reference.
- Admin-only user list from station app.

## Driver Selection Model
Preferred mode:
- Search and select from station-scoped active driver roster.

Secondary mode:
- Scan verified driver assignment code from the driver's app or station-issued badge.

Forbidden mode:
- Free-text `driverUserId` entry in production.
- Admin user search from station app.
- Selecting inactive users.
- Selecting non-driver roles.

Driver roster row shows:
- Driver full name.
- Availability.
- Active run count.
- Last seen time.
- Eligibility label.

Driver roster row hides:
- Driver phone.
- Driver email.
- Admin role data.
- Internal access status beyond eligibility.

Driver badge scan:
- Must verify assignment code with backend.
- Must show returned driver name before submit.
- Must expire old assignment codes.
- Must not treat a raw QR string as a driver ID without verification.

## Screen Structure
Order:
1. Assignment readiness banner.
2. Delivery identity.
3. Eligibility checklist.
4. Driver lookup or scan.
5. Selected driver card.
6. Assignment review.
7. Confirmation action.
8. Recovery and support actions.
9. Audit notes.

### Assignment Readiness Banner
Ready:
- Title: `Ready to assign`
- Body: `Choose a verified driver. Custody stays with station until pickup scan.`

Driver lookup unavailable:
- Title: `Driver lookup unavailable`
- Body: `Assignment needs a verified driver source before this package can be assigned.`

Payment blocked:
- Title: `Payment blocks assignment`
- Body: `Payment must be confirmed before this package enters transport.`

Status blocked:
- Title: `Cannot assign from this state`
- Body: `Open the correct workflow for the current package status.`

Offline:
- Title: `Offline assignment needs fresh cache`
- Body: `You can queue assignment only with fresh delivery and verified driver data.`

### Delivery Identity
Show:
- Tracking code.
- Delivery ID.
- Destination station.
- Receiver name.
- Service type.
- Doorstep indicator.
- Package size and weight when available.
- Current status.
- Payment status label.

Do not show:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full package label code.

### Eligibility Checklist
Checklist items:
- `Origin station matches your station`
- `Package received at origin`
- `Payment confirmed`
- `Package not issue-blocked`
- `Driver identity verified`
- `Custody remains with station`

Checklist behavior:
- Each item shows pass, fail, or unknown.
- Any fail blocks assignment.
- Unknown driver verification keeps assignment disabled.
- Unknown delivery state after stale cache requires refresh.

### Driver Lookup
Search field:
- Label: `Find active driver`
- Search by driver name or driver code.
- Do not search phone numbers.

Roster filters:
- `Available`
- `At station`
- `Low active runs`
- `Recently seen`

Empty roster:
- Title: `No eligible drivers`
- Body: `No active drivers are available for this station. Ask support or wait for a driver to check in.`

Driver lookup unavailable:
- Title: `No driver source`
- Body: `This build needs station driver lookup or badge verification before assignment can be used.`

### Driver Badge Scan
Primary scan action:
- `Scan driver code`

Scan success:
- Title: `Driver verified`
- Body: `{driverName} can be assigned to this package.`

Scan failure:
- Title: `Driver code not valid`
- Body: `Ask the driver to refresh their code or choose another verified driver.`

Scan expired:
- Title: `Driver code expired`
- Body: `Ask the driver to show a new code.`

### Selected Driver Card
Show:
- Driver name.
- Driver status.
- Active run count.
- Last seen time.
- Eligibility label.

Do not show:
- Driver phone.
- Driver email.
- Driver internal access history.

Selected driver warning:
- `This assigns the package to the driver queue. It does not transfer custody.`

### Assignment Review
Review items:
- Package tracking code.
- Destination station.
- Selected driver.
- Current station.
- Payment confirmed.
- Current status.
- Next workflow after assignment.

Review confirmation:
- Checkbox label: `I verified the package and selected driver.`
- Required before submit.

Primary action:
- `Assign driver`

Success action:
- `Continue to dispatch`

## Primary Action Logic
Primary action by state:
- `loading`: wait.
- `driver_lookup_ready`: `Select driver`
- `driver_lookup_unavailable`: `Open support`
- `driver_searching`: wait.
- `driver_selected`: `Review assignment`
- `assignment_review`: `Assign driver`
- `assigning`: wait.
- `assignment_success`: `Continue to dispatch`
- `offline_queue_ready`: `Queue assignment`
- `offline_queued`: `Open offline outbox`
- `payment_blocked`: `Open blocked queue`
- `status_blocked`: route by current status.
- `issue_blocked`: `Open blocked queue`
- `scope_blocked`: `Back to role home`
- `stale_data`: `Refresh`
- `not_found`: `Back to outbound`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Secondary actions:
- `Open delivery detail`
- `Open custody chain`
- `Scan driver code`
- `Change driver`
- `Open support`
- `Back to outbound`

Blocked behavior:
- Do not enable `Assign driver` without selected verified driver.
- Do not enable `Assign driver` with stale delivery data.
- Do not allow production free-text driver ID.
- Do not assign if payment is not confirmed.
- Do not assign if status is already `assigned_to_driver`.
- Do not assign if station scope mismatches.
- Do not call dispatch or pickup routes.

## Offline Rules
This screen is offline-critical only when assignment can be safely queued.

Offline queue allowed when:
- Delivery snapshot is less than `5 minutes` old.
- Delivery status is `received_at_origin` or `awaiting_driver_assignment`.
- Payment status is `confirmed`.
- Station scope is verified from auth context.
- Driver identity was verified online in the same station session and is not expired.
- Outbox can store idempotent route key `assign_driver`.

Offline queue blocked when:
- Driver identity is not verified.
- Driver verification expired.
- Delivery data is older than `5 minutes`.
- Payment is not confirmed.
- Status is not assignment-eligible.
- Existing assignment is visible in cache.
- Outbox is unhealthy.

Offline queued copy:
- Title: `Assignment queued`
- Body: `The app will assign this driver when network returns. Keep the package at station until sync completes.`
- Action: `Open offline outbox`

Queued action payload:
- `deliveryId`
- `driverUserId`
- `snapshotStatus`
- `snapshotPaymentStatus`
- `snapshotOriginStationId`
- `verifiedAt`
- `idempotencyKey`

Conflict on replay:
- If delivery is already assigned to same driver, mark outbox action succeeded.
- If delivery is assigned to another driver, show conflict and route custody.
- If payment is no longer confirmed, mark blocked and route blocked queue.
- If status advanced, mark stale and route outbound queue.

## Error Mapping
Payment not confirmed:
- State: `payment_blocked`
- Message: `Payment must be confirmed before driver assignment.`
- Action: `Open blocked queue`

Invalid status:
- State: `status_blocked`
- Message: `This package cannot be assigned from its current status.`
- Action: `Back to outbound`

Already assigned:
- State: `status_blocked`
- Message: `A driver is already assigned. Continue to dispatch.`
- Action: `Continue to dispatch`

Driver lookup missing:
- State: `driver_lookup_unavailable`
- Message: `Station driver lookup is required before assignment can be used.`
- Action: `Open support`

Driver ineligible:
- State: `driver_lookup_ready`
- Message: `This driver is not eligible for assignment.`
- Action: `Choose another driver`

Stale data:
- State: `stale_data`
- Message: `Delivery data may have changed. Refresh before assigning.`
- Action: `Refresh`

Offline queue blocked:
- State: `stale_data`
- Message: `Reconnect to verify the driver and delivery before assigning.`
- Action: `Back to outbound`

Station scope violation:
- State: `scope_blocked`
- Message: `This package is outside your station scope.`
- Action: `Back to role home`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to assign drivers.`
- Action: `Back to role home`

Delivery not found:
- State: `not_found`
- Message: `Delivery record not found.`
- Action: `Back to outbound`

Session expired:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

API failure:
- State: `api_error`
- Message: `Driver assignment could not be completed.`
- Action: `Retry`

## Copy System
Voice:
- Precise.
- Low-drama.
- Action-oriented.
- Custody-aware.

Screen title:
- `Assign driver`

Subtitle:
- `Choose the verified driver for this package. Custody stays with station.`

Primary CTA:
- `Assign driver`

Success title:
- `Driver assigned`

Success body:
- `The driver can now prepare for pickup. Dispatch readiness is next.`

Offline queued title:
- `Assignment queued`

Driver lookup unavailable title:
- `Driver lookup required`

Critical reminder:
- `Assignment is not handoff. Driver pickup scan moves custody.`

## Visual System Direction
This screen should feel like a high-trust assignment checkpoint, not a contact picker.

Visual thesis:
- A focused, verification-first assignment flow with one package, one driver, and one clear custody boundary.

Layout:
- Single delivery context at top.
- Eligibility checklist before driver search.
- Driver selection in a focused panel.
- Review card before submit.
- Sticky bottom action.

Color:
- Ready: controlled green or blue.
- Warning: amber.
- Blocked: rust/red.
- Verified driver: green-blue.
- Offline queued: neutral blue-gray.

Typography:
- Tracking code uses tabular numerals.
- Driver name uses strong body text.
- Status and eligibility labels are short.

Motion:
- Driver selection uses subtle panel transition.
- Success routes forward with standard navigation.
- No decorative animation.
- Respect reduced motion.

Density:
- Do not show a long roster without search and filters.
- Do not show more than one primary action.
- Keep support and custody actions secondary.

## Component Inventory
Components:
- `DriverAssignmentHeader`
- `AssignmentReadinessBanner`
- `AssignmentDeliveryCard`
- `AssignmentEligibilityChecklist`
- `DriverLookupPanel`
- `DriverSearchField`
- `DriverRosterList`
- `DriverRosterRow`
- `DriverBadgeScanButton`
- `SelectedDriverCard`
- `AssignmentReviewCard`
- `AssignmentOfflineBanner`
- `AssignmentResultPanel`
- `AssignmentBlockedState`

### `DriverAssignmentHeader`
Props:
- `trackingCode`
- `stationId`
- `lastUpdatedAt`
- `isOffline`

Responsibilities:
- Orient the user.
- Show freshness.
- Keep station scope visible.

### `AssignmentDeliveryCard`
Props:
- `deliveryId`
- `trackingCode`
- `destinationStationId`
- `receiverName`
- `serviceType`
- `doorstepRequested`
- `packageSizeTier`
- `packageWeightKg`
- `currentStatus`
- `paymentStatus`

Responsibilities:
- Confirm the package being assigned.
- Avoid private receiver and payment details.

### `AssignmentEligibilityChecklist`
Props:
- `stationScopeState`
- `statusState`
- `paymentState`
- `issueState`
- `driverVerificationState`
- `custodyState`

Responsibilities:
- Make blockers visible before driver selection.
- Keep the disabled action explainable.

### `DriverLookupPanel`
Props:
- `lookupMode`
- `drivers`
- `searchValue`
- `selectedDriverId`
- `driverLookupState`

Responsibilities:
- Let station operator find or scan a verified driver.
- Show lookup unavailable state when backend is missing.

### `DriverRosterRow`
Props:
- `driverUserId`
- `fullName`
- `availability`
- `activeRunCount`
- `lastSeenAt`
- `eligibleForAssignment`
- `blockedReason`

Responsibilities:
- Show driver suitability.
- Disable ineligible drivers with reason.

### `AssignmentReviewCard`
Props:
- `deliverySummary`
- `driverSummary`
- `confirmationChecked`
- `isOfflineQueue`

Responsibilities:
- Prevent accidental assignment.
- Reinforce custody boundary.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Readiness banner.
3. Delivery card.
4. Eligibility checklist.
5. Driver lookup controls.
6. Driver roster or badge scan.
7. Selected driver.
8. Assignment review.
9. Primary action.
10. Secondary actions.

Required labels:
- Driver search announces result count.
- Driver rows announce eligibility and active run count.
- Ineligible driver rows announce reason.
- Confirmation checkbox explains assignment impact.
- Success and offline queue states are announced as status messages.

Touch targets:
- Driver rows must be easy to tap.
- Scan button must meet target size.
- Primary action must be bottom reachable.
- Checkbox and secondary actions must not be icon-only.

Focus:
- Initial focus lands on screen title.
- Validation errors move focus to first failing checklist item.
- Driver selection moves focus to selected driver card.
- Success moves focus to success heading.
- Offline queued moves focus to outbox link.

Reduced motion:
- No animated roster loops.
- No celebratory success motion.
- Use instant state changes when reduced motion is enabled.

## Security And Privacy
Allowed on screen:
- Driver name.
- Driver assignment eligibility.
- Driver active run count.
- Driver last seen relative time.
- Delivery tracking code.
- Destination station.
- Receiver name.
- Service type.
- Payment confirmed label.

Not allowed on screen:
- Driver phone.
- Driver email.
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full package label code.
- Admin-only user access fields.

Allowed in analytics:
- `deliveryId`
- `stationId`
- `driverUserId`
- `driverEligibility`
- `currentStatus`
- `paymentStatus`
- `assignmentMode`
- `isOfflineQueued`

Disallowed in analytics:
- Driver phone.
- Driver email.
- Receiver name.
- Receiver phone.
- Receiver address.
- Search query text.
- Payment provider reference.

## Analytics
Events:
- `station_driver_assignment_viewed`
- `station_driver_assignment_driver_search_used`
- `station_driver_assignment_driver_selected`
- `station_driver_assignment_scan_started`
- `station_driver_assignment_scan_succeeded`
- `station_driver_assignment_scan_failed`
- `station_driver_assignment_reviewed`
- `station_driver_assignment_started`
- `station_driver_assignment_succeeded`
- `station_driver_assignment_failed`
- `station_driver_assignment_offline_queued`
- `station_driver_assignment_blocked`
- `station_driver_assignment_support_opened`
- `station_driver_assignment_custody_opened`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `driverUserId`
- `currentStatus`
- `paymentStatus`
- `assignmentMode`
- `driverEligibility`
- `blockReason`
- `isOffline`
- `sourceRoute`

Disallowed payload fields:
- `driverName`
- `driverPhone`
- `driverEmail`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `searchQuery`
- `paymentProviderReference`

## QA Acceptance Criteria
Eligibility:
- `received_at_origin` with confirmed payment allows driver selection.
- `awaiting_driver_assignment` with confirmed payment allows driver selection.
- Pending payment blocks assignment.
- Failed payment blocks assignment.
- `assigned_to_driver` routes to dispatch readiness.
- Wrong station scope blocks assignment.
- Issue status routes to blocked queue.

Driver lookup:
- Station app does not call `GET /v1/admin/users`.
- Missing driver lookup shows `driver_lookup_unavailable`.
- Verified roster driver can be selected.
- Ineligible driver cannot be selected.
- Expired badge code fails verification.
- Driver full name is shown after verification.
- Free-text driver ID is not available in production.

Assignment:
- `assign_driver` is called only with verified `driverUserId`.
- Submit is disabled until review confirmation is checked.
- Success routes to dispatch readiness.
- Assignment success does not show custody transfer.
- API `PAYMENT_REQUIRED` maps to payment blocked.
- API `INVALID_STATUS_TRANSITION` maps to status blocked.
- API `FORBIDDEN` maps to scope or authorization block.

Offline:
- Fresh eligible snapshot and verified driver can queue assignment.
- Stale snapshot blocks offline queue.
- Unverified driver blocks offline queue.
- Outbox conflict with same driver resolves as success.
- Outbox conflict with different driver routes custody.

Accessibility:
- Driver search result count is announced.
- Ineligible rows announce reason.
- Confirmation checkbox has explicit label.
- Success state is announced.
- Large text keeps selected driver and CTA visible.

Privacy:
- Driver phone and email never appear.
- Receiver phone and address never appear.
- Admin user fields never appear.
- Search text is not sent to analytics.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/driver-assignment`

Recommended state holder:
- `useStationDriverAssignmentScreen`

Recommended selectors:
- `selectAssignmentEligibility`
- `selectDriverLookupState`
- `selectVerifiedDriverOptions`
- `selectAssignmentReviewState`
- `selectAssignmentPrimaryAction`
- `selectAssignmentOfflinePolicy`
- `selectAssignmentErrorState`

Recommended API hooks:
- `useGetDeliveryQuery`
- `useGetDeliveryTimelineQuery`
- `useAssignDriverMutation`
- `useStationDriversQuery` when backend endpoint exists.
- `useVerifyDriverAssignmentCodeMutation` when backend endpoint exists.

Do not use:
- `useAdminUsersQuery` from station app.
- Admin user management routes.
- Free-text driver ID entry.

Offline action:
- Route key: `assign_driver`
- Fingerprint: `deliveryId + driverUserId`
- Revalidate snapshot before replay.

## Implementation Guardrails
Must use:
- Delivery detail.
- Station scope.
- Payment gate.
- Verified driver source.
- Review step before submit.
- Dedicated `assign_driver` mutation.

Must show:
- Package identity.
- Eligibility checklist.
- Driver verification state.
- Custody boundary.
- Offline queue state.
- Success next step.

Must not:
- Move custody.
- Call dispatch or pickup mutation.
- Call admin user list from station app.
- Assign unverified driver IDs.
- Allow stale offline assignment.
- Show sensitive driver, receiver, payment, or label data.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [Onfleet auto assignment](https://support.onfleet.com/hc/en-us/articles/360023669852-Auto-Assignment): supports using active driver eligibility and assignment criteria before assigning work.
- [Onfleet route optimization operating](https://support.onfleet.com/hc/en-us/articles/360023910351-Route-Optimization-Operating): supports showing route/task assignment as a dispatch decision with warning and error handling.
- [Samsara driver assignment](https://www.samsara.com/products/safety/driver-assignment): supports verified driver identification through app, QR code, or physical assignment methods.
- [Material Design lists](https://m3.material.io/components/lists/overview): supports clear mobile roster rows and selection behavior.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): supports explicit cached data, stale state, and sync behavior.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review before high-impact assignment.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible assignment, failure, and offline queued state changes.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports usable roster rows, scan buttons, and primary actions.

Design translation:
- Driver assignment needs verified driver identity, not arbitrary text entry.
- Assignment selection should show availability and eligibility.
- Assignment is operationally important enough to require a review step.
- Offline assignment must be tied to fresh, verified cache.
- Custody wording must stay precise because assignment is not handoff.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/outbound/:deliveryId/assign-driver`.
- The top-level test ID is `screen-station-driver-assignment`.
- Station app does not call admin user APIs.
- Driver selection comes from verified roster or verified assignment code.
- `assign_driver` is called only after payment, status, station scope, and driver checks pass.
- Success routes to dispatch readiness, not pickup.
- Copy says assignment does not move custody.
- Offline queue requires fresh delivery and verified driver data.
- Sensitive driver, receiver, payment, and label data are excluded.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Assignment is allowed only for eligible statuses and confirmed payment.
- Driver lookup gap is handled safely.
- Verified driver identity is required.
- `assign_driver` mutation is wired with idempotent behavior.
- Offline queue policy is conservative and conflict-aware.
- Custody remains with station after assignment.
- Success leads to dispatch readiness.
- Accessibility covers search, selection, review, success, and errors.
- Analytics exclude private driver, receiver, payment, and search data.
