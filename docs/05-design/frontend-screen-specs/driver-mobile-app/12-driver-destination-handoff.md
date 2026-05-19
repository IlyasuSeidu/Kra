# DriverDestinationHandoff Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverDestinationHandoff` |
| Route | `/(ops)/driver/runs/:deliveryId/destination-handoff` |
| Primary test ID | `screen-driver-destination-handoff` |
| Surface | Driver mobile app |
| Backend coverage | `get_delivery`, `get_delivery_timeline`, and station-owned `receive_destination` result observation |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | `view_own_delivery` |
| Required custody before success | Driver custody confirmed |
| Parent screen | `DriverDestinationArrival` |
| Primary mutation | None in driver app |
| Station mutation observed | `receive_destination` through `POST /v1/deliveries/:id/receive-destination` |
| Supporting reads | `get_delivery`, `get_delivery_timeline`, local station directory, local route cache |
| Related routes | `/(ops)/driver/runs/:deliveryId/destination-arrival`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/history`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Driver-side handoff witness and receipt-result screen using current API |

## Product Job
`DriverDestinationHandoff` lets the assigned driver coordinate the physical handoff with a destination station operator and wait for server-confirmed station receipt before leaving the package.

The screen answers:

- `What exactly must the station operator do now?`
- `Can I leave the package yet?`
- `Has the backend recorded driver-to-destination-station receipt?`
- `Did custody move from driver to station?`
- `Where did the station route the package after receipt?`
- `What do I do if station receipt is delayed, queued, mismatched, or blocked?`

This screen is not the station receipt form. It is the driver-visible witness and result surface for a station-owned custody transfer.

## Product Standard
This screen protects the riskiest part of inter-station transport: the driver physically gives the package to a station while the app must prove the backend also moved custody.

The driver should be able to:

- Keep the destination station handoff instructions visible.
- See that station receipt must be done by a station operator.
- Show the package label to the station operator without exposing the raw scan code in the driver UI.
- Wait while the station app scans, records condition, chooses route, and submits.
- Refresh or poll for receipt evidence.
- See a clear success result only when backend evidence exists.
- Understand whether the package moved to receiver pickup, final-mile assignment, or issue review.
- Escalate if station receipt cannot be completed.
- Work safely when connectivity is weak.

The screen must never:

- Call `receive_destination` from the driver app.
- Let a driver enter the destination receipt scan code.
- Let a driver choose package condition or `nextStep`.
- Claim station receipt from a local tap.
- Claim station receipt from GPS proximity.
- Claim station receipt from station verbal confirmation.
- Mark driver custody complete until backend evidence is present.
- Show receiver phone number or full receiver address.
- Show raw package scan code or timeline `proofReference`.
- Send scan code, receiver contact data, or free text to analytics.

## Audience
Primary audience:

- Assigned driver standing with the package at the destination station counter.

Secondary audience:

- Destination station operator performing the receipt scan in the station app.
- Support agent resolving handoff delay or scan mismatch.
- QA validating driver app does not mutate station receipt.
- Claude Code implementing the driver-side handoff witness.
- Operations leaders validating loss-prevention and accountability.
- Accessibility reviewers validating scan-adjacent instructions, status updates, and recovery actions.

## Context Of Use
The driver may be:

- Standing at a station counter with staff present.
- Holding one or more packages.
- Handling a queue of customers or station staff interruptions.
- Under pressure to leave quickly.
- On weak mobile data inside or near the station.
- Watching station staff complete scanner and condition steps.
- Dealing with an unreadable label, station app outage, or scan mismatch.
- Being told the station receipt is queued offline.

The UI must be explicit: until server confirmation exists, the driver should treat the package as still under driver accountability.

## Design Brief
Audience:

- Field driver in a high-accountability physical handoff moment.

Surface type:

- Mobile handoff witness and result screen.

Primary action:

- `Wait for station receipt`

Visual thesis:

- `Custody witness`: a bold custody ledger at the top, a counter protocol in the middle, and a server-confirmation result panel anchored at the bottom.

Restraint rule:

- Do not add a driver scanner, station receipt form, condition form, map, payment content, receiver delivery flow, or earnings.

Interaction density:

- Medium: the screen must show instructions, live status, evidence, and recovery without crowding the driver.

Trust posture:

- Treat backend timeline and custody fields as the source of truth. Treat everything else as local guidance only.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Proof of Delivery](https://onfleet.com/proof-of-delivery): supports verified delivery documentation, barcode proof, photos, signatures, notes, accountability, and dispute reduction.
- [Onfleet Route Load Task support](https://support.onfleet.com/hc/en-us/articles/47743836771732-Route-Load-Task): supports package verification, chain of custody, manual verification fallback for unreadable barcodes or camera issues, and real-time alerts for expected-package problems.
- [Onfleet Barcode Scanning API reference](https://docs.onfleet.com/reference/barcode-scanning): supports barcode capture as part of pickup and dropoff tracking in driver workflows.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local cache, queued writes where writes exist, and explicit conflict resolution after reconnect.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible status updates for waiting, refresh, success, and conflict states.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): supports large action targets and spacing for touch use.
- [NHTSA visual-manual distraction guidance](https://www.transportation.gov/regulations/federal-register-documents/2013-09883): supports keeping handoff tasks parked/counter-only and reducing visual-manual burden.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-data/state-machine.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/06-architecture/realtime-events-architecture.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/11-driver-destination-arrival.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/12-station-inbound-queue.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/13-station-destination-receipt.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/14-station-condition-check.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`

## Backend Contract
Driver reads:

- `GET /v1/deliveries/:id`
- Operation ID: `get_delivery`
- Capability: `view_own_delivery`
- Response: `deliveryDetailResponseSchema`

Timeline reads:

- `GET /v1/deliveries/:id/timeline`
- Operation ID: `get_delivery_timeline`
- Capability: `view_own_delivery`
- Response: `deliveryTimelineResponseSchema`

Station mutation this screen observes:

- `POST /v1/deliveries/:id/receive-destination`
- Operation ID: `receive_destination`
- Capability: `confirm_destination_receipt`
- Actor role: `station_operator`
- Request fields: `packageScanCode`, `condition`, `nextStep`, optional `fallbackUsed`, optional `supervisorOverrideActorId`
- Response: `deliveryLifecycleResponseSchema`

Driver app must not call the station mutation.

## Delivery Detail Fields Used
Use these fields from `deliveryDetailResponseSchema`:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `package.sizeTier`
- `package.fragile`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `latestTouchpoint.role`
- `latestTouchpoint.stationId`
- `latestTouchpoint.occurredAt`

The response may include receiver data. This screen must not render receiver phone or full receiver address.

## Timeline Fields Used
Use these fields from `deliveryTimelineResponseSchema`:

- `deliveryId`
- `trackingCode`
- `entries[].entryId`
- `entries[].entryType`
- `entries[].occurredAt`
- `entries[].label`
- `entries[].actorId`
- `entries[].actorRole`
- `entries[].stationId`
- `entries[].metadata.condition`
- `entries[].metadata.proofType`

Do not render:

- `entries[].metadata.proofReference`

Important current API limitation:

- Timeline entries expose human-readable `label`, not a dedicated structured event type.
- Until a structured timeline event type is exposed, the client may infer receipt evidence from labels such as `delivery received at destination` and `driver to destination station`, but this must be isolated in a single resolver and covered by tests.

Production-ready recommendation:

- Add structured `eventType` or `handoffType` to timeline entries so clients do not depend on labels.
- Add a dedicated driver-visible handoff result endpoint when real-time station-driver coordination matures.

## Station Receipt Facts This Screen Must Respect
`receive_destination` does this on success:

- Validates station operator capability.
- Validates station scope against `destinationStationId`.
- Validates package scan code.
- Requires current custody role `driver`.
- Requires custody actor to match `assignedDriverId`.
- Can move `dispatched_from_origin` through `in_transit` when driver custody is already confirmed.
- Records delivery event `delivery_received_at_destination`.
- Records handoff event `driver_to_destination_station`.
- Moves current custody to station operator.
- Routes the package to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.

Driver implication:

- The driver is not done when the station starts scanning.
- The driver is not done when the station says it submitted.
- The driver is done only when the driver app observes server evidence that station receipt or a later routed state exists.

## Receipt Evidence Resolver
Implement a single resolver named conceptually `deriveDriverDestinationHandoffState`.

Inputs:

- Delivery detail.
- Timeline entries.
- Current user ID.
- Network state.
- Cache age.
- Optional station directory.

Core booleans:

- `assignmentMatchesDriver`
- `custodyIsDriver`
- `custodyIsStation`
- `statusIsPreReceipt`
- `statusIsPostReceipt`
- `timelineHasReceiptEvent`
- `timelineHasDriverToStationHandoff`
- `receiptEvidenceExists`
- `receiptRoutedToPickup`
- `receiptRoutedToFinalMile`
- `receiptRoutedToIssue`
- `issueBeforeReceipt`
- `dataIsFresh`

Receipt evidence exists when at least one high-confidence condition is true:

- Timeline has delivery receipt evidence at destination station.
- Timeline has `driver_to_destination_station` handoff evidence.
- Delivery detail shows station custody and a post-receipt status.

Post-receipt statuses:

- `received_at_destination`
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`
- `delivered`
- `closed`

Issue nuance:

- `issue_reported` with receipt timeline evidence means station received and routed to issue review.
- `issue_reported` without receipt evidence means normal handoff is blocked and driver custody may still be unresolved.

Do not treat as receipt evidence:

- Driver tapping `I am at counter`.
- Driver tapping `Station is scanning`.
- GPS near station.
- Offline cached station instructions.
- A station operator verbal statement.
- Local station offline queue not synced to server.

## Handoff State Matrix
| Derived state | Meaning | Primary action | Can driver leave package |
| --- | --- | --- | --- |
| `loading` | Detail and timeline loading | `Loading` | No |
| `ready_to_witness` | Driver custody and station destination are ready | `Start waiting for receipt` | No |
| `waiting_for_station` | Driver is at counter, station has not submitted receipt yet | `Refresh receipt status` | No |
| `receipt_pending_network` | Driver app cannot verify because it is offline | `Retry when online` | No by app confirmation |
| `receipt_confirmed_pickup` | Backend routed to receiver pickup | `Finish run` | Yes |
| `receipt_confirmed_final_mile` | Backend routed to final-mile assignment | `Finish run` | Yes |
| `receipt_confirmed_issue` | Backend received package and routed to issue review | `Finish run` or `View issue` | Yes after station accepts issue custody |
| `already_handed_off` | Package was already received before entering screen | `View custody chain` | Yes |
| `wrong_assignment` | Delivery is not assigned to current driver | `Contact support` | No |
| `custody_mismatch` | Driver is not current custodian and no receipt evidence exists | `View custody chain` | No |
| `status_not_ready` | Origin pickup or transit prerequisite missing | `Back to arrival` | No |
| `stale_data` | Data too old for safe handoff decision | `Refresh` | No |
| `issue_blocked` | Issue exists before receipt evidence | `Contact support` | No |
| `terminal` | Delivery cannot continue | `Back to runs` | No normal handoff |

## Screen Information Architecture
Top-to-bottom structure:

1. Authority strip.
2. Handoff title and station code.
3. Custody ledger.
4. Counter protocol.
5. Receipt watcher.
6. Result panel.
7. Recovery panel.
8. Sticky action dock.

The top viewport must show:

- Destination station.
- Current custody.
- Whether the driver may leave.
- Primary action.

## Layout Anatomy
### 1. Authority Strip
Purpose:

- Tell the driver whether the screen is showing live, stale, offline, or confirmed state.

Copy:

- Live: `Live server state`
- Refreshing: `Checking station receipt`
- Offline: `Offline - receipt cannot be verified here`
- Stale: `Refresh before leaving package`
- Confirmed: `Station receipt confirmed by server`

Accessibility:

- Use accessible status semantics for changes.
- Do not steal focus on each polling tick.

### 2. Handoff Title And Station Code
Purpose:

- Anchor the physical location.

Content:

- Title: `Destination handoff`
- Station name when available.
- Destination station ID.
- Tracking code.
- Package size and fragile indicator.

Visual:

- Large station ID or station name.
- Small route rail from origin to destination.
- One server-state badge.

### 3. Custody Ledger
Purpose:

- Make accountability visible.

Rows:

- `Before receipt`: driver custody.
- `Station action`: scan, condition, route.
- `After receipt`: station custody.

Ready copy:

- `You still hold custody. Wait for station receipt.`

Success copy:

- `Custody moved to destination station.`

Blocked copy:

- `Custody is unclear. Do not leave the package.`

### 4. Counter Protocol
Purpose:

- Guide the driver through the physical process without adding a driver-side form.

Steps:

1. Confirm destination station ID with operator.
2. Keep the package with you until the station app is ready.
3. Ask operator to open destination receipt.
4. Present package label for station scan.
5. Wait for operator condition and route decision.
6. Wait for server-confirmed receipt result.
7. Leave only after this screen shows confirmed station receipt.

Local-only acknowledgements:

- Driver may check `Station operator is scanning now`.
- Driver may check `Operator is reviewing condition`.
- These checks are local visual aids only.
- They must not alter delivery state.

### 5. Receipt Watcher
Purpose:

- Poll and interpret server state.

Visible states:

- `Waiting for station scan`
- `Checking receipt status`
- `Receipt not found yet`
- `Receipt confirmed`
- `Receipt routed to pickup`
- `Receipt routed to doorstep queue`
- `Receipt routed to issue review`
- `Cannot verify while offline`

Polling rule:

- Start polling after the driver taps `Start waiting for receipt`.
- Poll `get_delivery` and `get_delivery_timeline`.
- Poll every `5 seconds` for `2 minutes`.
- After `2 minutes`, slow to `30 seconds`.
- Stop polling on success, terminal state, app background, or explicit user stop.
- Always offer manual refresh.

No real-time dependency:

- If a realtime event stream is later available, use it to trigger refresh.
- Do not require realtime delivery for correctness.
- Delivery detail and timeline remain the confirmation source.

### 6. Result Panel
Purpose:

- Show final outcome after station receipt evidence.

Pickup result:

- Title: `Station received package`
- Body: `The package is now waiting for receiver pickup at the destination station.`
- Next: `Finish run`

Final-mile result:

- Title: `Station received package`
- Body: `The package is now waiting for final-mile assignment.`
- Next: `Finish run`

Issue result:

- Title: `Station received package for review`
- Body: `The station accepted custody and routed the package to issue review.`
- Next: `View issue or finish run`

No receipt:

- Title: `Receipt not confirmed yet`
- Body: `Do not leave the package until station receipt appears here.`
- Next: `Refresh receipt status`

### 7. Recovery Panel
Purpose:

- Give safe next steps when receipt cannot be confirmed.

Scenarios:

- Station app cannot find the delivery.
- Station scan mismatch.
- Station says receipt is queued offline.
- Driver app offline.
- Driver assignment mismatch.
- Custody mismatch.
- Issue before receipt.
- Receipt status delayed beyond `2 minutes`.

Actions:

- `Refresh receipt status`
- `Open custody chain`
- `Ask station to search inbound queue`
- `Contact support`
- `Back to arrival`
- `Open offline outbox`

### 8. Sticky Action Dock
Purpose:

- Keep the next safe action reachable.

Actions by state:

- `ready_to_witness`: primary `Start waiting for receipt`; secondary `Back to arrival`.
- `waiting_for_station`: primary `Refresh receipt status`; secondary `Open custody chain`; tertiary `Support`.
- `receipt_pending_network`: primary `Retry when online`; secondary `Read handoff policy`.
- `receipt_confirmed_pickup`: primary `Finish run`; secondary `View custody chain`.
- `receipt_confirmed_final_mile`: primary `Finish run`; secondary `View custody chain`.
- `receipt_confirmed_issue`: primary `View issue`; secondary `Finish run`.
- `wrong_assignment`: primary `Contact support`.
- `custody_mismatch`: primary `View custody chain`; secondary `Contact support`.
- `status_not_ready`: primary `Back to arrival`.
- `stale_data`: primary `Refresh`.
- `terminal`: primary `Back to runs`.

## Interaction Flow
### Flow 1: Normal Online Handoff
1. Driver enters from `DriverDestinationArrival`.
2. Screen loads detail and timeline.
3. Resolver returns `ready_to_witness`.
4. Driver confirms station operator is ready.
5. Driver taps `Start waiting for receipt`.
6. Station operator completes receipt in station app.
7. Driver screen polls detail and timeline.
8. Resolver finds `driver_to_destination_station` or receipt event evidence.
9. Screen shows station receipt confirmed.
10. Driver taps `Finish run`.

### Flow 2: Station Receipt Routes To Pickup
1. Station calls `receive_destination` with `nextStep=pickup`.
2. Backend routes status to `awaiting_receiver_pickup`.
3. Driver screen sees post-receipt status and timeline receipt evidence.
4. Result panel says package is waiting for receiver pickup.
5. Driver may leave after confirmed result.

### Flow 3: Station Receipt Routes To Final Mile
1. Station calls `receive_destination` with `nextStep=doorstep`.
2. Backend routes status to `awaiting_final_mile_assignment`.
3. Driver screen shows final-mile assignment waiting state.
4. Driver finishes run.

### Flow 4: Station Receipt Routes To Issue
1. Station calls `receive_destination` with `nextStep=issue`.
2. Backend routes status to `issue_reported`.
3. Driver screen checks timeline evidence.
4. If receipt evidence exists, screen shows station received package for review.
5. If receipt evidence does not exist, screen shows issue before receipt and blocks package release.

### Flow 5: Station Offline Receipt Queue
1. Station operator says receipt is queued offline.
2. Driver app cannot see server receipt evidence.
3. Screen remains `receipt_pending_network`.
4. Copy says server receipt is not verified.
5. Driver follows station supervisor policy and support guidance.
6. App does not mark run complete until server evidence appears.

### Flow 6: Scan Mismatch At Station
1. Station operator reports scan mismatch.
2. Driver screen offers `Open custody chain` and `Contact support`.
3. Driver must not leave package until resolved.
4. No driver scan form appears.

### Flow 7: Already Received Before Entry
1. Driver opens this route after station receipt completed elsewhere.
2. Screen loads detail and timeline.
3. Resolver returns confirmed state.
4. Screen shows result and next routed status.
5. Driver can finish run.

## Data Loading
Initial load:

- Read cached delivery detail if available.
- Read cached timeline if available.
- Start online `get_delivery`.
- Start online `get_delivery_timeline`.
- Resolve station directory cache.

Refresh:

- Pull to refresh triggers detail and timeline reload.
- Primary refresh button triggers both reads.
- Foreground return triggers both reads.
- After station says submitted, immediate refresh triggers both reads.

Polling:

- Poll only while screen is active.
- Poll only after user enters waiting state.
- Use exponential quieting after `2 minutes`.
- Stop on success.
- Stop when network is offline.
- Resume on reconnect.

Cache:

- Cached state may support instruction reading.
- Cached state must never confirm station receipt unless the cached data already includes receipt evidence and the cache age is clearly shown.
- If cache is older than `5 minutes`, require refresh before `Finish run`.

## Offline Behavior
This screen is offline-assisted, not offline-completing.

Allowed offline:

- Show cached destination station.
- Show cached handoff protocol.
- Show cached custody ledger with cache age.
- Let driver read recovery guidance.
- Let driver open offline outbox.
- Let driver start a support report if support flow queues issues.

Blocked offline:

- Do not mark handoff complete.
- Do not show `Finish run` unless cached receipt evidence is fresh enough and explicitly labeled as cached.
- Do not call station mutation.
- Do not accept scan code.
- Do not choose condition or next route.

Offline copy:

- `Offline - this phone cannot verify station receipt right now. Do not leave the package based on this screen alone.`

Reconnect:

- Automatically refresh detail and timeline.
- If receipt evidence appears, show confirmed result.
- If conflict appears, show recovery panel.

## Result Logic
### Receipt Confirmed To Pickup
Conditions:

- Receipt evidence exists.
- Current status is `awaiting_receiver_pickup`.
- Current custody role is `station_operator` or later non-driver role.

Result:

- Driver accountability ends.
- Show receiver pickup next step.
- Route driver to active runs or history.

### Receipt Confirmed To Final Mile
Conditions:

- Receipt evidence exists.
- Current status is `awaiting_final_mile_assignment` or `assigned_for_final_mile`.
- Current custody role is `station_operator` or final-mile courier if assignment has already advanced.

Result:

- Driver accountability ends.
- Show final-mile next step.
- Route driver to active runs or history.

### Receipt Confirmed To Issue
Conditions:

- Receipt evidence exists.
- Current status is `issue_reported`.

Result:

- Driver accountability ends if station custody is recorded.
- Show issue review message.
- Offer support context.

### Handoff Still Pending
Conditions:

- Current status is `dispatched_from_origin` or `in_transit`.
- Current custody role is `driver`.
- No receipt evidence.

Result:

- Driver remains accountable.
- Keep waiting and recovery actions visible.

### Conflicting State
Conditions:

- Current custody is not driver.
- Current custody is not station.
- No receipt evidence.
- Status does not explain custody.

Result:

- Block completion.
- Route to custody chain and support.

## Visual Design System
### Visual Direction
The screen should feel like a custody receipt terminal:

- Calm neutral canvas.
- High-contrast custody ledger.
- Strong station ID.
- Timestamped evidence cards.
- Minimal decoration.
- Green only for server-confirmed receipt.
- Amber for driver-held custody.
- Red for blocked or conflict state.

### Color Tokens
Suggested semantic tokens:

- `--handoff-bg`: warm neutral.
- `--handoff-surface`: clean elevated surface.
- `--handoff-ink`: primary text.
- `--handoff-muted`: secondary text.
- `--handoff-driver-custody`: amber.
- `--handoff-station-confirmed`: deep green.
- `--handoff-blocked`: red.
- `--handoff-waiting`: slate blue.
- `--handoff-offline`: graphite.
- `--handoff-focus`: high-contrast blue.

### Typography
Use:

- Large station code or station name as first visual anchor.
- Tabular time for receipt timestamps.
- Strong status label in the custody ledger.
- Short direct sentences.

Avoid:

- Long paragraphs in the primary viewport.
- Decorative display type.
- Small status text for critical custody decisions.

### Motion
Motion should clarify:

- Polling progress.
- Receipt confirmation.
- State conflict.
- Action dock arrival.

Motion rules:

- No continuous spinner as the only waiting signal.
- Show text state beside progress.
- Use reduced motion path.
- Keep success transition short and final.

## Component Specification
### `DriverDestinationHandoffScreen`
Responsibilities:

- Own route params.
- Load detail and timeline.
- Derive handoff state.
- Own polling lifecycle.
- Render status, instructions, result, and actions.

Test IDs:

- `screen-driver-destination-handoff`
- `driver-handoff-scroll`
- `driver-handoff-action-dock`

### `HandoffAuthorityStrip`
Responsibilities:

- Show live, refreshing, offline, stale, or confirmed authority.

Test IDs:

- `driver-handoff-authority-strip`
- `driver-handoff-cache-age`

### `HandoffIdentityHeader`
Responsibilities:

- Show station and delivery identity.

Content:

- Destination station.
- Tracking code.
- Package size.
- Fragile flag.
- Route pair.

Test IDs:

- `driver-handoff-identity-header`
- `driver-handoff-destination-station`
- `driver-handoff-tracking-code`

### `CustodyLedger`
Responsibilities:

- Show before, station action, and after custody states.

Test IDs:

- `driver-handoff-custody-ledger`
- `driver-handoff-current-custody`
- `driver-handoff-can-leave`

### `CounterProtocolCard`
Responsibilities:

- Explain physical station handoff steps.
- Keep local-only progress separate from backend evidence.

Test IDs:

- `driver-handoff-counter-protocol`
- `driver-handoff-protocol-step`
- `driver-handoff-local-step`

### `ReceiptWatcher`
Responsibilities:

- Show waiting and refresh state.
- Start and stop polling.
- Display last check time.

Test IDs:

- `driver-handoff-receipt-watcher`
- `driver-handoff-last-check`
- `driver-handoff-refresh-status`

### `ReceiptResultPanel`
Responsibilities:

- Show server-confirmed result and next route.

Test IDs:

- `driver-handoff-result-panel`
- `driver-handoff-result-title`
- `driver-handoff-result-next-step`

### `HandoffRecoveryPanel`
Responsibilities:

- Show recovery when receipt cannot be confirmed.

Test IDs:

- `driver-handoff-recovery-panel`
- `driver-handoff-recovery-action`

### `HandoffActionDock`
Responsibilities:

- Render context-aware safe actions.

Test IDs:

- `driver-handoff-primary-action`
- `driver-handoff-secondary-action`
- `driver-handoff-support-action`

## Content System
### Header Copy
Ready:

- Title: `Destination handoff`
- Subtitle: `Stay with the package until station receipt is confirmed.`

Waiting:

- Title: `Waiting for station receipt`
- Subtitle: `The station operator must scan and submit from the station app.`

Confirmed:

- Title: `Station receipt confirmed`
- Subtitle: `Custody has moved from driver to destination station.`

Offline:

- Title: `Cannot verify receipt offline`
- Subtitle: `Use this screen for instructions only until connection returns.`

Blocked:

- Title: `Handoff blocked`
- Subtitle: `Do not leave the package until this is resolved.`

### Custody Copy
Driver custody:

- `You still hold custody.`
- `Do not leave the package yet.`

Station action:

- `Station operator scans package, records condition, and chooses next route.`

Station custody:

- `Destination station custody recorded.`
- `You can finish this run.`

Conflict:

- `Custody does not match the expected handoff path.`
- `Open custody chain or contact support.`

### Watcher Copy
Not started:

- `Start waiting when the station operator opens destination receipt.`

Waiting:

- `Checking for station receipt.`

No receipt yet:

- `No station receipt found yet. Keep the package with you.`

Confirmed:

- `Receipt found in server timeline.`

Offline:

- `Receipt cannot be checked while offline.`

### Result Copy
Pickup:

- `Package is now waiting for receiver pickup at destination station.`

Final mile:

- `Package is now waiting for final-mile assignment.`

Issue:

- `Package is now with station issue review.`

Terminal:

- `This delivery is no longer active.`

## State Specifications
### `loading`
Trigger:

- No cached detail and no timeline loaded.

UI:

- Show skeleton custody ledger.
- Disable primary action.
- Announce loading.

### `ready_to_witness`
Trigger:

- Assignment matches current driver.
- Custody is driver.
- Status is `in_transit` or `dispatched_from_origin`.
- Destination station is known.
- No receipt evidence yet.

UI:

- Amber custody ledger.
- Counter protocol visible.
- Primary CTA `Start waiting for receipt`.

### `waiting_for_station`
Trigger:

- Driver tapped `Start waiting for receipt`.
- No receipt evidence yet.
- Network available.

UI:

- Active watcher.
- Last check timestamp.
- Refresh action.
- Clear `Do not leave package` message.

### `receipt_pending_network`
Trigger:

- Network unavailable before confirmation.

UI:

- Offline authority strip.
- Stop polling.
- Show policy guidance.
- No `Finish run` unless fresh cached receipt evidence already exists.

### `receipt_confirmed_pickup`
Trigger:

- Receipt evidence exists.
- Status is `awaiting_receiver_pickup`.

UI:

- Green confirmation.
- Pickup result panel.
- Primary CTA `Finish run`.

### `receipt_confirmed_final_mile`
Trigger:

- Receipt evidence exists.
- Status is `awaiting_final_mile_assignment`, `assigned_for_final_mile`, or `out_for_delivery`.

UI:

- Green confirmation.
- Final-mile result panel.
- Primary CTA `Finish run`.

### `receipt_confirmed_issue`
Trigger:

- Receipt evidence exists.
- Status is `issue_reported`.

UI:

- Green confirmation with issue review tone.
- Primary CTA `View issue` if route exists, otherwise `Finish run`.

### `already_handed_off`
Trigger:

- Receipt evidence exists before driver starts watcher.

UI:

- Confirmation result.
- View custody chain.

### `wrong_assignment`
Trigger:

- `assignedDriverId` does not match current user.

UI:

- Blocked panel.
- Primary CTA `Contact support`.

### `custody_mismatch`
Trigger:

- No receipt evidence.
- Current custody is not current driver.

UI:

- Blocked panel.
- Primary CTA `View custody chain`.
- Secondary CTA `Contact support`.

### `status_not_ready`
Trigger:

- Status is before `dispatched_from_origin`.

UI:

- Send driver back to prior workflow.
- No handoff watcher.

### `stale_data`
Trigger:

- Detail or timeline older than freshness threshold while online.

UI:

- Primary CTA `Refresh`.
- Do not show `Finish run`.

### `issue_blocked`
Trigger:

- Status is `issue_reported`.
- No receipt evidence.

UI:

- Warning that issue is active before station receipt.
- Primary CTA `Contact support`.

### `terminal`
Trigger:

- Status is `cancelled`, `delivery_failed`, or `closed` without active handoff work.

UI:

- Terminal panel.
- Primary CTA `Back to runs`.

## Error Handling
| Error | UI title | UI action |
| --- | --- | --- |
| `AUTH_REQUIRED` | `Sign in again` | Route to sign in |
| `FORBIDDEN_ROLE` | `Driver access required` | Back to home |
| `ASSIGNMENT_SCOPE_VIOLATION` | `This job is not assigned to you` | Contact support |
| `DELIVERY_NOT_FOUND` | `Delivery not found` | Back to runs |
| `CONFLICTING_HANDOFF_STATE` | `Handoff state changed` | View custody chain |
| `ISSUE_LOCK_ACTIVE` | `Issue review active` | Contact support |
| `PACKAGE_SCAN_MISMATCH` | `Station scan did not match` | Ask station to rescan or contact support |
| `DUPLICATE_SCAN` | `Scan already recorded` | Refresh receipt status |
| `UNKNOWN_INTERNAL_ERROR` | `Could not check receipt` | Retry |

Driver-facing station scan errors:

- Show only when the station app or backend result is safely surfaced to the driver.
- Do not expose raw scan values.
- Do not let the driver correct scan values in this screen.

## Accessibility Requirements
Structure:

- One `h1`.
- Status strip uses accessible status semantics.
- Custody ledger is readable in source order.
- Result panel gets focus only after confirmed receipt if the user initiated waiting.
- Poll updates should not announce every tick.

Touch:

- Primary and secondary actions must be large and spaced.
- Local checklist toggles must be clearly labeled.
- Do not place `Finish run` next to `Contact support` without separation.

Screen reader:

- Announce when receipt is confirmed.
- Announce when offline prevents verification.
- Announce when the driver may or may not leave package.
- Hide decorative progress graphics.

Reduced motion:

- Replace animated progress with text status.
- Keep confirmation transition non-motion dependent.

## Security And Privacy
Do:

- Show only safe operational fields.
- Use station ID and tracking code.
- Use package size and fragile alert.
- Display receipt condition only when it is already part of safe timeline metadata.
- Omit receiver phone and full address.
- Omit raw scan code.
- Omit timeline `proofReference`.

Do not:

- Let driver submit station proof.
- Store station scan value in driver app state.
- Send scan values to analytics.
- Send receiver contact data to analytics.
- Persist local handoff progress as delivery facts.
- Store station operator identity beyond what backend returns safely.

## Analytics
Allowed events:

- `driver_destination_handoff_viewed`
- `driver_destination_handoff_wait_started`
- `driver_destination_handoff_refresh_started`
- `driver_destination_handoff_refresh_succeeded`
- `driver_destination_handoff_refresh_failed`
- `driver_destination_handoff_receipt_confirmed`
- `driver_destination_handoff_receipt_pending`
- `driver_destination_handoff_blocked`
- `driver_destination_handoff_finish_tapped`
- `driver_destination_handoff_support_tapped`

Allowed payload:

- `deliveryId`
- `currentStatus`
- `originStationId`
- `destinationStationId`
- `custodyRole`
- `assignmentMatch`
- `receiptEvidence`
- `receiptResult`
- `offline`
- `cacheAgeBucket`
- `blockedReason`

Forbidden payload:

- Receiver phone.
- Receiver full address.
- Package scan code.
- Timeline `proofReference`.
- Free-text station notes.
- Free-text driver notes unless support policy explicitly allows it.

## QA Acceptance Criteria
### Driver Mutation Boundary
- The screen never calls `receive_destination`.
- The screen never renders a scan-code input.
- The screen never lets the driver choose `condition`.
- The screen never lets the driver choose `nextStep`.

### Ready To Witness
- Given matching driver assignment, driver custody, and `in_transit`, the screen shows `Start waiting for receipt`.
- Given ready state, copy says driver still holds custody.
- Given ready state, `Finish run` is not visible.

### Waiting
- Given waiting state, the screen polls detail and timeline.
- Given no receipt evidence, the screen says not to leave package.
- Given offline during waiting, polling stops and offline guidance appears.

### Receipt Confirmed
- Given timeline receipt evidence and status `awaiting_receiver_pickup`, the result says receiver pickup.
- Given timeline receipt evidence and status `awaiting_final_mile_assignment`, the result says final-mile assignment.
- Given timeline receipt evidence and status `issue_reported`, the result says station issue review.
- Given confirmed receipt, `Finish run` appears.

### Issue Nuance
- Given `issue_reported` without receipt evidence, the screen blocks release.
- Given `issue_reported` with receipt evidence, the screen shows station received for review.

### Privacy
- Receiver phone never renders.
- Receiver full address never renders.
- Timeline `proofReference` never renders.
- Scan code never enters analytics.

### Offline
- Cached instructions are visible offline.
- Offline without receipt evidence does not show `Finish run`.
- Reconnect refresh updates confirmation state.

## Automated Test Plan
Unit tests:

- `deriveDriverDestinationHandoffState` returns `ready_to_witness` for matching driver custody and `in_transit`.
- Resolver returns `waiting_for_station` after local wait state without receipt evidence.
- Resolver returns `receipt_confirmed_pickup` for receipt evidence plus `awaiting_receiver_pickup`.
- Resolver returns `receipt_confirmed_final_mile` for receipt evidence plus `awaiting_final_mile_assignment`.
- Resolver returns `receipt_confirmed_issue` for receipt evidence plus `issue_reported`.
- Resolver returns `issue_blocked` for `issue_reported` without receipt evidence.
- Resolver blocks wrong assignment.
- Resolver blocks custody mismatch without receipt evidence.
- Resolver never treats local wait flags as receipt evidence.
- Analytics sanitizer removes receiver data and proof reference.

Component tests:

- Renders `screen-driver-destination-handoff`.
- Renders destination station.
- Renders custody ledger.
- Renders counter protocol.
- Does not render receiver phone.
- Does not render full receiver address.
- Does not render timeline proof reference.
- Does not render scan-code input.
- Shows `Finish run` only after receipt evidence.
- Shows offline warning when network is unavailable.

Integration tests:

- Initial load reads detail and timeline.
- Wait start triggers polling.
- Polling stops after receipt confirmation.
- Polling stops offline and resumes on reconnect.
- Timeline receipt evidence updates result.
- Station-routed issue result differs from pre-receipt issue block.
- Stale data blocks finish.

End-to-end tests:

- Driver reaches destination, opens handoff, waits, station receipt succeeds, driver finishes run.
- Driver opens handoff and station routes to final-mile assignment.
- Driver opens handoff and station routes to issue after receipt.
- Driver opens handoff offline and cannot finish without confirmed evidence.
- Driver with wrong assignment cannot continue.

## Test IDs
Required test IDs:

- `screen-driver-destination-handoff`
- `driver-handoff-scroll`
- `driver-handoff-action-dock`
- `driver-handoff-authority-strip`
- `driver-handoff-cache-age`
- `driver-handoff-identity-header`
- `driver-handoff-destination-station`
- `driver-handoff-tracking-code`
- `driver-handoff-custody-ledger`
- `driver-handoff-current-custody`
- `driver-handoff-can-leave`
- `driver-handoff-counter-protocol`
- `driver-handoff-protocol-step`
- `driver-handoff-local-step`
- `driver-handoff-receipt-watcher`
- `driver-handoff-last-check`
- `driver-handoff-refresh-status`
- `driver-handoff-result-panel`
- `driver-handoff-result-title`
- `driver-handoff-result-next-step`
- `driver-handoff-recovery-panel`
- `driver-handoff-recovery-action`
- `driver-handoff-primary-action`
- `driver-handoff-secondary-action`
- `driver-handoff-support-action`

## Implementation Notes For Claude Code
Build `DriverDestinationHandoff` as the driver-side witness screen for station-owned destination receipt. It must load `get_delivery` and `get_delivery_timeline`, derive whether station receipt evidence exists, poll while the driver waits at the counter, and show `Finish run` only after backend evidence confirms driver-to-destination-station handoff or a later station-routed state. It must never call `receive_destination`, never render scan-code input, never let the driver choose condition or next route, never expose timeline `proofReference`, and never mark custody complete from local state.

## Done Definition
This screen is complete when:

- The route renders behind `screen-driver-destination-handoff`.
- The screen reads delivery detail and timeline.
- The receipt evidence resolver is covered by unit tests.
- The screen distinguishes pending, confirmed pickup, confirmed final-mile, confirmed issue, and pre-receipt issue states.
- Polling starts only after wait intent and stops on success, offline, background, or timeout policy.
- `Finish run` appears only after server-confirmed receipt evidence.
- No driver-side code calls `receive_destination`.
- No scan-code input appears in driver UI.
- No receiver phone, full address, scan code, or timeline `proofReference` is displayed or logged.
- Offline mode is instruction-only unless fresh cached server receipt evidence exists.
- Accessibility, privacy, analytics, and recovery tests pass.
- The implementation matches this markdown file and the frontend screen inventory.
