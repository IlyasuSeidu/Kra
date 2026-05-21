# Accept Custody Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `AcceptCustodyModal` |
| Component target | shared custody-acceptance confirmation modal for driver and final-mile courier flows |
| Primary test ID | `modal-accept-custody` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 custody-transfer control |
| Used by | driver pickup scan, courier assignment acceptance scan, action recovery, offline outbox review |
| Backend coverage | `confirm_pickup`, `accept_final_mile_assignment` |
| Trigger source | `ScanPackageModal`, `DriverOriginPickupScan`, `CourierAcceptAssignmentScan`, `OpsActionRecovery` |
| Required states | `closed`, `opening`, `reviewing_custody`, `driver_pickup_context`, `courier_acceptance_context`, `scan_verified`, `fallback_context`, `offline_blocked`, `offline_queue_available`, `stale_context`, `assignment_blocked`, `scope_blocked`, `status_blocked`, `payment_blocked`, `submitting`, `server_confirmed`, `queued_pending_sync`, `server_rejected`, `network_error`, `closing` |

## Product Job
`AcceptCustodyModal` asks the receiving driver or final-mile courier to explicitly accept package custody after a valid package scan context is available and before the host submits the custody-moving mutation. It turns a scan result into an intentional accountability decision.

The modal answers:
- `Which package am I accepting custody for?`
- `Which role is releasing custody and which role receives it?`
- `What backend action will happen if I accept?`
- `Is this server-confirmed, queued, or blocked?`
- `What responsibility begins after acceptance?`
- `What should happen if the scan, assignment, status, or network state is unsafe?`

The user should be able to:
- Review the delivery reference and handoff type.
- See the current custodian and receiving custodian.
- Understand that accepting custody creates accountability.
- Confirm only after scan verification or approved fallback context.
- Cancel without moving custody.
- Queue only when host policy explicitly allows pending sync.
- Navigate to custody accepted receipt only after server confirmation or later sync success.
- Avoid seeing raw scan code after review.

This modal is not:
- A scanner.
- A route screen.
- A proof-of-delivery screen.
- A label registry.
- A package search tool.
- A station dispatch readiness screen.
- A driver run acceptance screen.
- A final-mile assignment details screen.
- A custody receipt screen.
- A manual custody override.
- A support conversation.

## Strategic Role
Assignment is not custody. Dispatch readiness is not custody. A valid scan is still not custody until the responsible receiving party confirms and the backend records the handoff. This modal is the last intentional human checkpoint before the package becomes the driver's or courier's responsibility.

Core principle:
- Scan proves package identity.
- Assignment proves who may act.
- Acceptance proves the receiving party intentionally takes custody.
- Backend confirmation proves custody moved.
- Offline queued acceptance is pending evidence, not final custody.
- The last confirmed custodian stays accountable until the server accepts the transfer.

## Audience
Primary users:
- Assigned drivers accepting package custody at origin station.
- Assigned final-mile couriers accepting package custody at destination station.

Secondary users:
- Station operators witnessing release.
- Station leads supporting fallback handoffs.
- Support staff helping with blocked custody transfer.
- Ops admins reviewing custody conflicts.
- QA validating the custody authority boundary.
- Accessibility reviewers validating confirmation, focus, and status semantics.
- Claude Code implementing the modal later.

Non-users:
- Senders.
- Receivers.
- Public tracking visitors.
- Finance-only admins.
- Webhook processors.
- Scheduled jobs.
- AI agents acting without physical package confirmation.

## Current Backend Reality
Driver pickup mutation:
- Operation key: `confirm_pickup`.
- Route: `POST /v1/deliveries/:id/confirm-pickup`.
- Required actor role: `driver`.
- Required capability: `confirm_pickup`.
- Required current status: `assigned_to_driver`.
- Required assigned driver match: `delivery.assignedDriverId === actor.actorId`.
- Required proof: `packageScanCode`.
- Success status: `dispatched_from_origin`.
- Success event: `driver_pickup_confirmed`.
- Handoff type: `origin_station_to_driver`.
- Current custody role after success: `driver`.
- Current custody actor after success: driver actor ID.

Final-mile acceptance mutation:
- Operation key: `accept_final_mile_assignment`.
- Route: `POST /v1/deliveries/:id/accept-final-mile-assignment`.
- Required actor role: `final_mile_courier`.
- Required capability: `accept_final_mile_assignment`.
- Required current status: `assigned_for_final_mile`.
- Required assigned courier match: `delivery.assignedFinalMileCourierId === actor.actorId`.
- Required proof: `packageScanCode`.
- Success event: `final_mile_assignment_accepted`.
- Handoff type: `destination_station_to_final_mile_courier`.
- Current custody role after success: `final_mile_courier`.
- Current custody actor after success: courier actor ID.
- Delivery status may remain `assigned_for_final_mile`; `out_for_delivery` is a separate later action.

Shared backend behavior:
- Package scan code is validated against immutable package label binding when configured.
- `fallbackUsed` may be recorded.
- `supervisorOverrideActorId` may be recorded.
- Handoff proof type is `package_scan`.
- Response is `deliveryLifecycleResponseSchema`.
- Mutation response does not include raw handoff proof details.
- Host must refresh delivery detail or timeline to show complete custody evidence.

Frontend implication:
- This modal must not scan.
- This modal must not show final receipt.
- This modal must submit through host-owned mutations only.
- This modal must not show confirmed custody until server confirms or approved queued action later syncs successfully.
- This modal must distinguish driver pickup from courier acceptance.

## Source References
External references used for this modal:
- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final): supports chain-of-custody discipline for evidence handling, accountability, and documentation.
- [Onfleet Route Load Task driver guide](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports package verification before route loading, barcode scanning, and manual verification when a code cannot be scanned.
- [Onfleet Route Load Task dispatcher guide](https://support.onfleet.com/hc/en-us/articles/47743836771732-Route-Load-Task): supports hub-side chain-of-custody visibility and package-issue alerts before downstream work.
- [DoorDash merchant-to-dasher pickup verification](https://help.doordash.com/en-ca/dashers/article/merchant-to-dasher-pickup-verification): supports pickup verification with QR or order code, wrong-code retry, and manual entry recovery.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert and Message Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports high-importance confirmation and error dialogs requiring explicit user response.
- [WCAG 2.2 Error Prevention: Legal, Financial, Data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review and confirmation before important stored data changes.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit, queue, confirmation, and rejection announcements.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable action targets for field conditions.
- [Material Design Dialogs](https://m3.material.io/components/dialogs/overview): supports decision-focused modal patterns for blocking or confirming important actions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/04-wrong-package-scanned-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/05-package-label-already-used-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/07-driver-origin-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/08-driver-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/06-courier-custody-accepted.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Design Brief
Audience:
- Receiving driver or final-mile courier holding the physical package at a handoff point.

Context of use:
- Mobile, station counter or loading area, one package in hand, station staff nearby, possible low signal, pressure to leave quickly.

Entry point:
- A scanner or host flow has captured a valid package scan context and asks for explicit custody acceptance.

Success state:
- Backend accepts `confirm_pickup` or `accept_final_mile_assignment`, records a handoff event, and host routes to the corresponding custody accepted receipt screen.

Primary action:
- `Accept custody`

Secondary actions:
- `Review scan`
- `Cancel`
- `Open custody chain`
- `Report issue`
- `Open offline outbox`

Navigation model:
- High-priority confirmation modal over scanner or acceptance host.
- On mobile, use bottom sheet only if all required accountability copy fits without scroll; otherwise use full modal.
- On action recovery, use centered modal or blocking panel.

Density:
- Medium. The user must read enough to understand accountability, but not a full policy document.

Visual thesis:
- A formal custody gate with a physical-package handoff spine, accountability language, and one decisive acceptance action.

Restraint rule:
- Do not add maps, earnings, receiver proof, route lists, broad package history, or full scan-code display.

Product lens:
- Accountability transfer, not success decoration.

System stance:
- Host owns mutation and navigation; modal owns review, confirmation, and blocked-state clarity.

Interaction thesis:
- Show what is being accepted, who becomes accountable, what will be submitted, and whether confirmation will be live or pending.

Signature move:
- A transfer spine that reads `Current custody -> You` with role-specific labels before the accept button.

Activation event:
- User taps `Accept custody` after reviewing verified scan context.

## Relationship To Other Shared Modals
`ScanPackageModal` captures package code.

`AcceptCustodyModal` confirms receiving-party intent.

`WrongPackageScannedModal` handles mismatch.

`PackageLabelAlreadyUsedModal` handles repeated or reused label states.

`AuditSensitiveActionAckModal` handles supervised fallback acknowledgement when host policy requires it.

Do not:
- Let this modal open a camera.
- Let this modal approve fallback by itself.
- Stack this modal on top of scanner.
- Show a confirmed receipt inside this modal after success.
- Route to out-for-delivery directly without a confirmed custody receipt.

## Host Responsibilities
The host must provide:
- `deliveryId`
- delivery reference
- scan intent
- custody acceptance kind
- actor role
- actor display label
- current custody role label
- current custodian display label when safe
- receiving custody role label
- receiving actor display label
- current delivery status
- expected success status or event type
- verified scan state
- fallback state
- offline policy state
- assignment validation state
- station or route context label
- accept callback
- cancel callback
- review scan callback
- issue callback where allowed
- custody chain callback where allowed
- offline outbox callback where allowed
- action recovery callback where allowed

The host may provide:
- redacted scan preview
- station staff witness label
- supervisor override actor display
- fallback reason summary
- stale data timestamp
- outbox queue policy explanation
- recent issue count
- last custody event timestamp

The host must not provide to the modal for rendering:
- raw scan code
- registered package scan code
- receiver OTP
- receiver phone
- proof asset references
- supervisor credential secret
- raw backend metadata
- stack trace

## Modal Responsibilities
The modal must:
- Render one clear acceptance decision.
- Explain that custody will move only after backend acceptance or approved queue sync.
- Show who currently holds custody.
- Show who will become accountable.
- Show whether acceptance is live, blocked, or pending sync.
- Show fallback context if fallback is part of the request.
- Disable accept when preconditions are unsafe.
- Route unsafe scan, assignment, status, payment, and stale states to recovery.
- Announce submit and result states accessibly.
- Never expose raw scan code.

The modal must not:
- Capture scan code.
- Mutate custody without user action.
- Show a server-confirmed receipt before success.
- Submit if assignment does not match.
- Submit if status is unsafe.
- Submit if payment blocks transport.
- Submit if offline policy blocks custody movement.
- Submit if scan verification is missing.
- Reveal receiver proof data.
- Let station staff accept on behalf of driver or courier.
- Treat assignment acceptance as custody.
- Treat dispatch readiness as custody.

## Trigger Conditions
Open this modal when:
- Driver scan host has a verified package scan for `confirm_pickup`.
- Courier scan host has a verified package scan for `accept_final_mile_assignment`.
- Manual fallback path is approved by host and requires final receiving-party confirmation.
- Offline queue policy allows pending custody acceptance and user must review pending authority.
- Action recovery asks user to retry a custody acceptance with safe context.

Do not open this modal when:
- Camera permission is denied before scan.
- Scan code is invalid.
- Scan code does not match delivery.
- Label is already used.
- Actor is not assigned to the delivery.
- User role is not driver or final-mile courier.
- Delivery status is not eligible.
- Payment is not confirmed when payment blocks movement.
- Host cannot identify current custody owner.
- Host cannot provide a custody-moving callback.

Routing:
- Scanner errors stay in scanner.
- Mismatch routes to `WrongPackageScannedModal`.
- Reused label routes to `PackageLabelAlreadyUsedModal`.
- Permission errors route to permission state.
- Status conflicts route to action recovery or custody chain.

## Acceptance Kinds
`driver_pickup`:
- Mutation: `confirm_pickup`.
- From role: origin station.
- To role: driver.
- Required actor: assigned driver.
- Required status: `assigned_to_driver`.
- Success status: `dispatched_from_origin`.
- Success event: `driver_pickup_confirmed`.
- Receipt route: `DriverCustodyAccepted`.

`final_mile_courier_acceptance`:
- Mutation: `accept_final_mile_assignment`.
- From role: destination station.
- To role: final-mile courier.
- Required actor: assigned final-mile courier.
- Required status: `assigned_for_final_mile`.
- Success event: `final_mile_assignment_accepted`.
- Status may remain `assigned_for_final_mile`.
- Receipt route: `CourierCustodyAccepted`.

`offline_retry`:
- Mutation depends on original queued action.
- User confirms retry only after host validates current context.
- Success route depends on action kind.
- Pending state routes to outbox.

`fallback_acceptance`:
- Uses package code manual entry or fallback context from host.
- Requires supervisor override actor ID when host policy requires it.
- Must show fallback accountability language.
- May require `AuditSensitiveActionAckModal` before this modal or inside host flow.

## Preconditions
Accept action is enabled only when:
- delivery ID is present
- actor is authenticated
- actor role matches acceptance kind
- actor is assigned to the delivery
- current status is eligible
- scan is verified or fallback is approved
- current custody owner is known enough for user copy
- host accept callback exists
- no conflicting pending outbox action exists
- offline policy allows current mode

Accept action is disabled when:
- delivery context is stale
- scan verification is missing
- assignment mismatch exists
- current status changed
- payment is blocking movement
- package label conflict exists
- network is offline and live confirmation is required
- user role is not receiving party
- fallback approval is missing
- another acceptance submit is in progress

Disabled accept must show a reason.

## Information Architecture
Default layout:
1. Title and authority chip.
2. Transfer spine.
3. Delivery identity.
4. Scan evidence summary.
5. Accountability statement.
6. Acceptance impact.
7. Actions.
8. Recovery links.

Mobile layout:
1. Title: `Accept custody?`
2. Transfer spine: `Station -> You`
3. One-sentence accountability copy.
4. Delivery reference and scan verification.
5. Primary action.
6. Secondary actions.

Fallback layout:
1. Title: `Accept custody with fallback?`
2. Transfer spine.
3. Fallback reason summary.
4. Supervisor acknowledgement summary.
5. Accountability statement.
6. Actions.

Offline layout:
1. Title: `Queue custody acceptance?`
2. Pending-sync warning.
3. Transfer spine.
4. Offline policy copy.
5. Primary action.
6. Outbox link.

## Header
Default title:
- `Accept custody?`

Driver title:
- `Accept driver custody?`

Courier title:
- `Accept final-mile custody?`

Fallback title:
- `Accept custody with fallback?`

Offline title:
- `Queue custody acceptance?`

Subtitle:
- `You become accountable only after Kra records this handoff.`

Authority chips:
- `Live confirmation`
- `Pending sync`
- `Fallback`
- `Review required`
- `Blocked`

Header rules:
- Use direct language.
- Avoid celebration.
- Avoid legal overload.
- Avoid raw scan values.
- Avoid ambiguous `Confirm` alone.

## Transfer Spine
Required labels:
- `Current custody`
- `Receiving custody`

Driver pickup spine:
- `Origin station -> Assigned driver`

Courier acceptance spine:
- `Destination station -> Assigned courier`

Each side must show:
- role label
- safe actor display when available
- station label when available

If current custodian is missing:
- Show `Current custodian unavailable`.
- Disable accept.
- Offer custody chain.

If receiving actor mismatch:
- Show `This package is assigned to another receiver`.
- Disable accept.
- Offer back and support.

The transfer spine must:
- Be visible before action buttons.
- Use directional layout.
- Avoid avatar clusters.
- Avoid decorative map imagery.

## Delivery Identity
Show:
- delivery reference
- scan intent label
- origin station for driver pickup
- destination station for courier acceptance
- current status label
- package summary if already visible in host

Do not show:
- raw scan code
- registered package code
- receiver phone
- receiver OTP
- full receiver address
- provider reference
- private sender details

Identity copy:
- `Delivery: {deliveryReference}`
- `Handoff: {handoffLabel}`
- `Status: {statusLabel}`
- `Station: {stationLabel}`

## Scan Evidence Summary
Default verified copy:
- `Package scan verified for this delivery.`

Redacted preview:
- Show only host-provided redacted value when allowed.
- Use visible label `Verified scan`.
- Do not allow copy.

Fallback copy:
- `Fallback will be recorded on this handoff.`

Manual entry copy:
- `Manual package code entry is recorded as fallback evidence.`

No scan copy:
- `Package scan is missing. Scan again before accepting custody.`

Rules:
- Verified scan enables acceptance only when host says it is valid.
- Fallback enables acceptance only when host says fallback is approved.
- Redacted preview is optional.
- Raw code never renders.

## Accountability Statement
Default:
- `After this is recorded, package issues are reviewed against your custody period until the next confirmed handoff.`

Driver:
- `After pickup is confirmed, the package leaves origin station custody and becomes your responsibility until destination receipt.`

Courier:
- `After acceptance is confirmed, the package becomes your responsibility until delivery proof or return handoff.`

Offline:
- `Until sync succeeds, the last server-confirmed custodian remains accountable.`

Fallback:
- `Because fallback is used, accountability includes the receiving party and authorizing supervisor until the next fully confirmed handoff.`

Copy rules:
- Say `responsibility`.
- Say `server-confirmed`.
- Do not say `liable` in field copy.
- Do not blame the user.

## Action Model
Default primary action:
- `Accept custody`

Driver primary action:
- `Accept driver custody`

Courier primary action:
- `Accept final-mile custody`

Offline primary action:
- `Queue acceptance`

Blocked primary action:
- disabled with visible reason

Secondary actions:
- `Review scan`
- `Cancel`
- `Open custody chain`
- `Report issue`
- `Open offline outbox`
- `Open action recovery`

Action behavior:
- `Accept custody` calls host accept callback.
- `Queue acceptance` calls host queue callback only when offline queue is allowed.
- `Review scan` closes modal and returns to scanner review state.
- `Cancel` closes modal without mutation.
- `Open custody chain` routes to custody evidence.
- `Report issue` opens issue creation with safe context.
- `Open offline outbox` routes to queued actions.
- `Open action recovery` routes to failed action recovery.

Actions must not:
- Use `Yes`.
- Use `OK`.
- Use `Continue` for custody movement.
- Use `Force`.
- Use `Override`.
- Call mutation twice.
- Hide cancellation.

## Role Behavior
Driver:
- Can accept driver pickup only when assigned.
- Sees origin station to driver transfer copy.
- Sees route-to-driver receipt after success.
- Cannot accept courier custody.

Final-mile courier:
- Can accept final-mile custody only when assigned.
- Sees destination station to courier transfer copy.
- Sees courier receipt after success.
- Cannot accept driver pickup.

Station operator:
- Does not accept receiving custody in this modal.
- May witness in host copy only.
- Should not see accept CTA.

Support:
- Should not perform acceptance.
- May open custody chain or issue route in read-only context.

Admin:
- Should not perform field acceptance through this modal.
- May see review-only variant from action recovery.

Sender and receiver:
- Must not see this modal.

## State Machine
`closed`:
- Modal is not rendered.

`opening`:
- Host passes safe context.
- Focus moves to title.

`reviewing_custody`:
- Default ready state.
- Transfer spine and accountability statement visible.

`driver_pickup_context`:
- Driver-specific copy and mutation labels are active.

`courier_acceptance_context`:
- Courier-specific copy and mutation labels are active.

`scan_verified`:
- Scan evidence summary confirms safe verification.
- Accept may be enabled.

`fallback_context`:
- Fallback summary is visible.
- Accept requires approved fallback context.

`offline_blocked`:
- Host requires live confirmation.
- Accept is disabled.
- Offline copy explains reconnect requirement.

`offline_queue_available`:
- Host allows queued acceptance.
- Primary action is queue acceptance.
- Copy says custody remains pending until sync.

`stale_context`:
- Delivery or assignment data is outdated.
- Accept disabled until refresh or recovery.

`assignment_blocked`:
- Actor is not assigned.
- Accept disabled.

`scope_blocked`:
- Actor lacks role or station/assignment scope.
- Accept disabled.

`status_blocked`:
- Delivery status is not eligible.
- Accept disabled.

`payment_blocked`:
- Payment state blocks custody movement.
- Accept disabled.

`submitting`:
- Host mutation is running.
- Buttons lock except non-destructive safe cancel only if host can abort.

`server_confirmed`:
- Server accepted mutation.
- Host routes to receipt screen.

`queued_pending_sync`:
- Host queued action.
- Host routes to offline outbox.

`server_rejected`:
- Backend rejected acceptance.
- Modal shows safe error and recovery.

`network_error`:
- Network failed before authoritative result.
- User can retry, queue if allowed, or open outbox.

`closing`:
- Modal closes without custody mutation unless success or queue path already occurred.

## Data Contract
Component props:
- `isOpen: boolean`
- `deliveryId: string`
- `deliveryReference: string`
- `acceptanceKind: "driver_pickup" | "final_mile_courier_acceptance" | "offline_retry" | "fallback_acceptance"`
- `actorRole: "driver" | "final_mile_courier" | "station_operator" | "support" | "admin" | string`
- `actorDisplayLabel: string`
- `currentStatus: DeliveryStatus`
- `currentCustodyLabel: string`
- `currentCustodianDisplayLabel?: string`
- `receivingCustodyLabel: string`
- `receivingActorDisplayLabel: string`
- `stationLabel?: string`
- `scanState: "verified" | "missing" | "fallback_approved" | "fallback_missing" | "conflict"`
- `redactedScanPreview?: string`
- `canShowRedactedScan: boolean`
- `isFallback: boolean`
- `fallbackReasonLabel?: string`
- `supervisorDisplayLabel?: string`
- `isOffline: boolean`
- `offlinePolicy: "live_required" | "queue_allowed" | "online"`
- `isStale: boolean`
- `blockReason?: "assignment" | "scope" | "status" | "payment" | "scan" | "fallback" | "offline" | "conflict"`
- `canAccept: boolean`
- `canQueue: boolean`
- `canReviewScan: boolean`
- `canOpenCustodyChain: boolean`
- `canReportIssue: boolean`
- `canOpenOutbox: boolean`
- `canOpenActionRecovery: boolean`
- `onAccept: (context: AcceptCustodyContext) => Promise<AcceptCustodyResult>`
- `onQueueAcceptance?: (context: AcceptCustodyContext) => Promise<AcceptCustodyQueueResult>`
- `onReviewScan: () => void`
- `onOpenCustodyChain: () => void`
- `onReportIssue: (context: AcceptCustodyIssueContext) => void`
- `onOpenOutbox: () => void`
- `onOpenActionRecovery: () => void`
- `onCancel: () => void`
- `onClose: () => void`

Accept custody context:
- `deliveryId`
- `acceptanceKind`
- `actorRole`
- `scanState`
- `isFallback`
- `offlinePolicy`
- `currentStatus`

Issue context:
- `deliveryId`
- `deliveryReference`
- `category=handoff`
- `source=accept_custody_modal`
- `acceptanceKind`
- `currentStatus`
- `currentCustodyLabel`
- `receivingCustodyLabel`
- `blockReason`
- `isFallback`
- `isOffline`

Never pass to issue context:
- raw scan code
- registered package code
- receiver OTP
- receiver phone
- supervisor credential secret
- raw backend metadata
- stack trace

## Redaction Rules
Default:
- Hide scan code entirely.

If host permits redacted preview:
- Show only a redacted value.
- Do not allow copy.
- Read only the visible redacted string.

Never render:
- raw package scan code
- registered package code
- camera frame data
- receiver OTP
- receiver phone
- supervisor credential secret

Telemetry must not include:
- raw scan code
- redacted scan code
- registered package code
- receiver details
- supervisor credential secret

## Driver Pickup Behavior
Driver modal copy:
- Title: `Accept driver custody?`
- Body: `This records that you received the package from the origin station.`
- Primary action: `Accept driver custody`
- Transfer spine: `Origin station -> Assigned driver`

Driver acceptance means:
- Origin station releases custody.
- Driver becomes accountable.
- Delivery moves to `dispatched_from_origin` after server success.
- Receipt route is `DriverCustodyAccepted`.

Driver acceptance does not mean:
- Delivery is already in transit.
- Destination station has received package.
- Final-mile courier has custody.
- Package is delivered.

Driver blocked states:
- not assigned driver
- wrong role
- status not `assigned_to_driver`
- scan not verified
- payment not confirmed when transport is blocked
- offline live confirmation required

## Courier Acceptance Behavior
Courier modal copy:
- Title: `Accept final-mile custody?`
- Body: `This records that you received the package from the destination station.`
- Primary action: `Accept final-mile custody`
- Transfer spine: `Destination station -> Assigned courier`

Courier acceptance means:
- Destination station releases custody.
- Courier becomes accountable.
- Handoff event `destination_station_to_final_mile_courier` is recorded.
- Receipt route is `CourierCustodyAccepted`.

Courier acceptance does not mean:
- Delivery is out for delivery.
- Receiver has been notified of arrival.
- Proof has been captured.
- Courier earning is settled.

Courier blocked states:
- not assigned courier
- wrong role
- status not `assigned_for_final_mile`
- scan not verified
- package label conflict
- offline live confirmation required

## Fallback Behavior
Fallback path is allowed only when host says fallback is approved.

Fallback panel must show:
- fallback method
- fallback reason summary
- supervisor display label when available
- warning that fallback is audit-sensitive
- accountability statement

Fallback primary copy:
- `Accept custody with fallback`

Fallback warning:
- `Fallback will be marked on this handoff and may be reviewed if there is a dispute.`

Fallback rules:
- Require explicit user acceptance.
- Require supervisor context when policy requires it.
- Require no raw supervisor secret in UI.
- Do not ask user to enter supervisor credential in this modal.
- Do not let fallback bypass package mismatch.
- Do not let fallback bypass assignment mismatch.

## Offline Behavior
Live-required offline state:
- Title: `Reconnect to accept custody`
- Body: `This custody transfer needs a live server check before accountability can move.`
- Primary action disabled.
- Secondary action: `Open offline outbox` when available.

Queue-allowed offline state:
- Title: `Queue custody acceptance?`
- Body: `This will stay pending until Kra syncs it. The last confirmed custodian remains accountable until sync succeeds.`
- Primary action: `Queue acceptance`
- Secondary action: `Open offline outbox`

Queued state:
- Host routes to `OpsOfflineOutbox`.
- Modal does not show confirmed custody.
- Receipt route opens only after sync succeeds.

Offline rules:
- Do not claim custody moved while queued.
- Do not hide pending sync.
- Do not allow duplicate queued action for same delivery and action kind.
- Do not queue if delivery context is stale.
- Do not queue if assignment status is unknown.

## Error Handling
`PACKAGE_SCAN_MISMATCH`:
- State: `server_rejected`.
- Copy: `This scan code does not match the delivery.`
- Route to `WrongPackageScannedModal`.

`DUPLICATE_SCAN`:
- State: `server_rejected`.
- Copy: `This package scan was already recorded.`
- Route to `PackageLabelAlreadyUsedModal` or custody chain.

`PACKAGE_ALREADY_RECEIVED`:
- State: `server_rejected`.
- Copy: `This package was already received.`
- Route to `PackageLabelAlreadyUsedModal`.

`FORBIDDEN`:
- State: `scope_blocked` or `assignment_blocked`.
- Copy: `You are not allowed to accept custody for this delivery.`

`INVALID_STATUS_TRANSITION`:
- State: `status_blocked`.
- Copy: `This delivery cannot move through this custody step now.`

`PAYMENT_REQUIRED`:
- State: `payment_blocked`.
- Copy: `Payment must be confirmed before this action.`

`VALIDATION_ERROR`:
- State: `server_rejected`.
- Copy: `Some required information is missing or invalid.`

Network timeout:
- State: `network_error`.
- Copy: `Kra could not confirm whether custody moved. Check outbox or retry after status refresh.`

Error rules:
- Do not show confirmed custody on unknown network outcome.
- Prefer status refresh before retry if request may have reached server.
- Keep accept disabled while duplicate request risk exists.
- Route ambiguous outcome to action recovery or outbox.

## Accessibility
Semantics:
- Use `role="dialog"` for normal confirmation.
- Use `role="alertdialog"` when accepting fallback, queuing offline, or showing blocked states.
- Use `aria-modal="true"`.
- Use visible title as accessible name.
- Use accountability copy as part of description.

Focus:
- On open, focus title or least-risk primary review control.
- Do not initially focus `Accept custody` for fallback or offline pending state.
- Trap focus.
- Return focus to scanner review or host CTA on close.

Announcements:
- Announce transfer type.
- Announce scan verified or fallback context.
- Announce submit progress.
- Announce queue pending state.
- Announce server rejection.

Keyboard:
- Tab order follows visual order.
- Primary action appears after transfer and accountability copy.
- Cancel remains reachable.

Reduced motion:
- Remove emphasis movement.
- Keep state changes textual.

Touch:
- Buttons meet target size guidance.
- Primary and cancel have enough separation.
- In field mode, bottom actions stay reachable.

## Visual Design
Visual thesis:
- Formal custody gate, not casual confirmation.

Components:
- Modal shell.
- Authority chip.
- Transfer spine.
- Delivery identity card.
- Scan evidence row.
- Accountability panel.
- Action footer.
- Blocked-state notice.

Color:
- Use neutral authority surface.
- Use success only after server confirmation, not before submit.
- Use caution for fallback and offline queue.
- Use danger for blocked or rejected states.

Typography:
- Short title.
- One-sentence body.
- Bold role labels in transfer spine.
- Compact metadata labels.

Motion:
- Modal entrance is quick.
- Transfer spine can settle in once.
- No looping motion.
- No celebratory animation.

## Telemetry
Events:
- `accept_custody_modal_opened`
- `accept_custody_review_scan_tapped`
- `accept_custody_accept_tapped`
- `accept_custody_queue_tapped`
- `accept_custody_cancelled`
- `accept_custody_custody_chain_tapped`
- `accept_custody_issue_tapped`
- `accept_custody_submit_started`
- `accept_custody_submit_confirmed`
- `accept_custody_submit_rejected`
- `accept_custody_network_error`

Required properties:
- `deliveryId`
- `acceptanceKind`
- `actorRole`
- `currentStatus`
- `scanState`
- `isFallback`
- `offlinePolicy`
- `blockReason`
- `source`

Never include:
- raw scan code
- redacted scan code
- registered package code
- receiver phone
- receiver OTP
- supervisor credential secret
- raw backend metadata

Telemetry rules:
- Emit accept tapped before host mutation starts.
- Emit confirmed only after host reports server success.
- Emit queued only after host accepts queue insertion.
- Emit rejected only after authoritative rejection.
- Do not emit success when modal merely closes.

## QA Requirements
Functional QA:
- Driver sees driver pickup copy.
- Courier sees final-mile acceptance copy.
- Accept disabled without verified scan.
- Accept disabled when actor role mismatches acceptance kind.
- Accept disabled when assignment mismatches.
- Accept disabled when status is ineligible.
- Accept disabled when offline live confirmation is required.
- Queue action appears only when queue allowed.
- Fallback copy appears only when fallback context exists.
- Accept calls host once.
- Submit state blocks repeat taps.
- Server success routes to correct receipt.
- Queued success routes to outbox, not receipt.
- Rejection routes to correct recovery.
- Cancel closes without mutation.
- Raw scan code never renders.

Accessibility QA:
- Dialog has accessible name and description.
- Focus is trapped.
- Focus returns after close.
- Accept is not first focus target for fallback/offline states.
- Submit progress is announced.
- Rejection is announced.
- Buttons meet target size.
- Reduced motion works.

Privacy QA:
- Inspect route params.
- Inspect issue context.
- Inspect telemetry.
- Inspect client logs.
- Confirm raw scan and receiver proof data are absent.

Offline QA:
- Live-required offline blocks accept.
- Queue-allowed offline creates outbox item.
- Queued state does not show custody receipt.
- Duplicate queue action is blocked.
- Sync success opens receipt from outbox.
- Sync conflict routes to action recovery.

## E2E Coverage
Required E2E scenarios:
- `e2e-driver-accept-custody-online`: driver accepts pickup after verified scan and routes to driver receipt.
- `e2e-courier-accept-custody-online`: courier accepts final-mile custody after verified scan and routes to courier receipt.
- `e2e-accept-custody-assignment-blocked`: wrong actor cannot accept.
- `e2e-accept-custody-status-blocked`: stale status disables accept and routes recovery.
- `e2e-accept-custody-offline-live-required`: offline blocks live-required custody transfer.
- `e2e-accept-custody-offline-queued`: queue allowed state routes to outbox and keeps custody pending.
- `e2e-accept-custody-fallback`: fallback acceptance shows supervisor and audit copy.
- `e2e-accept-custody-scan-mismatch`: backend mismatch routes to wrong-package recovery.
- `e2e-accept-custody-redaction`: raw package scan never appears.

Component tests:
- `acceptanceKind` selects title, copy, route expectation, and success target.
- `scanState` controls accept availability.
- `offlinePolicy` controls primary action.
- `blockReason` controls disabled reason.
- fallback context controls alertdialog role.
- callbacks receive safe context.
- route callbacks hide when unavailable.

## Implementation Notes For Claude Code
Build this as a shared component:
- `AcceptCustodyModal`.
- Keep it presentational.
- Host owns mutation, queue insertion, refresh, and navigation.
- Use typed discriminated union for `acceptanceKind`.
- Use typed state for offline policy.
- Use design-system modal primitives.
- Use status chip, transfer spine, and action footer primitives.

Implementation must:
- Disable repeated submit immediately.
- Clear volatile scan context on close when host requires it.
- Never render raw scan code.
- Never log raw scan code.
- Never call out-for-delivery.
- Never show receipt in the modal.
- Route to receipt only after host success.

Implementation must not:
- Fetch registry directly.
- Open camera.
- Create issue automatically.
- Create custody event outside host mutation.
- Accept for another role.
- Override backend authority.

## Completion Checklist
Claude Code can mark this modal complete only when:
- Driver and courier variants are implemented.
- All required states are represented.
- Accept disabled reasons are visible.
- Offline live-required and queue-allowed paths are distinct.
- Fallback acceptance has audit copy.
- Host callback fires once.
- Server success routes to correct receipt.
- Queued acceptance routes to outbox.
- Raw scan code never renders.
- Receiver proof data never renders.
- Accessibility behavior passes keyboard and screen reader checks.
- E2E tests cover online, offline, blocked, fallback, mismatch, and redaction states.

## Build Handoff Summary
Claude Code should build `AcceptCustodyModal` as the shared driver and courier custody-acceptance gate that appears after a valid scan context and before the host submits `confirm_pickup` or `accept_final_mile_assignment`. It must make accountability explicit, keep assignment and status authority in the host, block unsafe offline and stale states, support approved fallback without leaking secrets, prevent duplicate submit, route confirmed server success to the correct custody receipt, route pending sync to outbox, and never expose raw scan code or receiver proof data.
