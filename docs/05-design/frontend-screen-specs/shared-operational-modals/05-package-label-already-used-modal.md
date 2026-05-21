# Package Label Already Used Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `PackageLabelAlreadyUsedModal` |
| Component target | shared label-reuse and repeated-scan recovery modal for operations mobile and admin review surfaces |
| Primary test ID | `modal-package-label-already-used` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 custody and label-integrity component |
| Used by | station package intake, scan package modal, station blocked queue, admin package detail, manual custody exception review |
| Backend coverage | package label registry, `PACKAGE_SCAN_MISMATCH`, `PACKAGE_ALREADY_RECEIVED`, `DUPLICATE_SCAN` |
| Trigger source | `ScanPackageModal`, `StationPackageIntake`, `OpsScanPackage`, `OpsActionRecovery`, admin package review |
| Required states | `closed`, `opening`, `label_reuse_detected`, `already_bound_to_other_delivery`, `already_received`, `duplicate_scan`, `same_delivery_label`, `cross_delivery_label`, `scan_value_hidden`, `scan_value_redacted`, `custody_chain_available`, `issue_route_available`, `support_route_available`, `admin_review_available`, `label_registry_available`, `offline_replay_context`, `stale_context`, `submitting_issue_context`, `issue_context_created`, `network_error`, `closing` |

## Product Job
`PackageLabelAlreadyUsedModal` stops station intake or scan progression when a package label has already been bound, received, or recorded for a protected step. It must prevent label reuse, make clear that no new intake or custody movement happened, and route staff to custody review or escalation without exposing sensitive registry details.

The modal answers:
- `Why can this label not be used now?`
- `Was this delivery already received?`
- `Is the label already tied to another delivery?`
- `Did this scan repeat an already recorded step?`
- `Did custody change as a result of this attempt?`
- `Who should review the conflict next?`
- `What registry detail must stay hidden from field staff?`

The user should be able to:
- Understand that the scanned label cannot create another binding.
- See whether this is a repeated same-delivery action, an already-received state, or a cross-delivery label conflict.
- Open custody chain to verify the last confirmed state.
- Return to the queue or delivery without losing safe context.
- Report an issue when the physical package or label appears wrong.
- Contact support when field recovery is unclear.
- Route to admin review when authorized.
- Avoid seeing raw scan code or another delivery identity unless policy allows it in an admin surface.

This modal is not:
- A scanner.
- A label printer.
- A label rebind form.
- A package search surface.
- A custody override.
- A delivery merge tool.
- A manual exception approval form.
- A package label registry editor.
- A place to reveal another delivery to field staff.
- A way to make repeated scan submission succeed.

## Strategic Role
A package label is a physical key in Kra's custody system. If a label can be reused freely, two delivery records can point to one physical package code, which weakens custody proof and increases loss risk. This modal is the field-facing control that turns a duplicate label event into an explicit stop, review, and escalation path.

Core principle:
- One package label binds to one delivery.
- A repeated scan does not create another event.
- A received package cannot be received again without review.
- Cross-delivery label conflicts stop intake immediately.
- Custody remains with the last confirmed owner.
- Field staff get recovery options, not registry secrets.
- Admin users investigate through review surfaces, not through this modal alone.

## Audience
Primary users:
- Station operators receiving packages at origin.
- Station operators reviewing blocked intake rows.
- Station leads helping resolve duplicate label events.
- Support staff receiving label-conflict issue context.
- Ops admins reviewing label registry and custody exceptions.

Secondary users:
- QA validating label reuse protection.
- Security reviewers validating registry data redaction.
- Operations leads measuring repeated label incidents.
- Accessibility reviewers validating interruptive conflict dialog behavior.
- Claude Code implementing the modal later.

Non-users:
- Senders.
- Receivers.
- Public tracking visitors.
- Drivers outside station intake context.
- Final-mile couriers outside repeated scan recovery.
- Finance-only admins.
- Webhook processors.
- Scheduled jobs.
- AI agents acting without human confirmation.

## Current Backend Reality
Implemented package label registry:
- Collection: `package_labels`.
- Document identity: encoded scan code.
- Fields include `scanCode`, `deliveryId`, `trackingCode`, `originStationId`, `destinationStationId`, `createdAt`, `createdByUserId`, and `createdByRole`.
- `reserveForDelivery` uses a transaction.
- If the label document already exists, the existing record is returned.
- `reservePackageLabelForDelivery` then checks whether the returned label belongs to the current delivery.
- If the existing label belongs to another delivery, backend throws `PACKAGE_SCAN_MISMATCH`.

Implemented scan fields:
- Origin intake uses `labelScanCode`.
- Later handoff scans use `packageScanCode`.

Implemented policy codes in docs:
- `PACKAGE_ALREADY_RECEIVED`: duplicate intake or receipt operation attempted.
- `DUPLICATE_SCAN`: same scan event submitted again for the same package step.
- `PACKAGE_SCAN_MISMATCH`: scan code missing, unknown, or bound to another delivery.

Current shared API enum note:
- Some policy codes are documented before every route exposes them as a stable schema enum.
- Frontend must not assume a new backend enum exists until `packages/shared/src/contracts/api.ts` exposes it.
- Host screens may derive this modal from known delivery status, idempotent response shape, or `PACKAGE_SCAN_MISMATCH` metadata.

Frontend implication:
- Use this modal when the conflict is label reuse, repeated same-step scan, or package already received.
- Use `WrongPackageScannedModal` when the main user problem is that the package in hand does not match the selected delivery.
- Do not expose raw scan code or `boundDeliveryId` in field UI.
- Do not let field staff rebind the label from this modal.
- Do not show a success state for a blocked label-reuse attempt.

## Source References
External references used for this modal:
- [GS1 Serial Shipping Container Code](https://www.gs1.org/standards/id-keys/sscc): supports using a unique logistics-unit identifier for parcels, cases, and other transport units.
- [GS1 Logistic Label Guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3): supports the logistics label expectation that each logistics unit is identified by a unique serial number.
- [WAI-ARIA Alert and Message Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports interruptive alert dialogs with labelled title, described message, and required response.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background content, Escape behavior, and focus return.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports describing detected input and submission errors in text.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports assistive technology awareness of status changes that do not take focus.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch target sizing for field recovery actions.
- [Material Design Dialogs](https://m3.material.io/components/dialogs/overview): supports focused, decision-oriented dialogs for blocking conditions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/04-wrong-package-scanned-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/04-station-package-intake.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/17-station-handoff-log.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/18-station-blocked-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/07-admin-package-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/08-admin-package-label-registry.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/firestore/repositories.ts`
- `services/api/src/app.ts`

## Design Brief
Audience:
- Station and operations users responding to a label conflict at intake or scan recovery.

Context of use:
- A physical label was scanned in a station or field workflow, but the backend or host context says the label cannot be used for the attempted action.

Entry point:
- Host receives a duplicate-label, already-received, duplicate-scan, or cross-delivery binding signal.

Success state:
- User routes to custody chain, issue creation, support, admin review, label registry, or a safe return path without creating a new binding.

Primary action:
- `Open custody chain`

Secondary actions:
- `Scan another label`
- `Report issue`
- `Contact support`
- `Back to queue`
- `Open admin review`
- `Open label registry`

Navigation model:
- Alert-style modal over scanner or intake workflow.
- Mobile uses a high-priority bottom sheet or full modal depending scanner host.
- Admin uses centered alert dialog with evidence links.

Density:
- Low for field staff.
- Medium for admin review surfaces.

Visual thesis:
- A label-lock warning that makes the duplicate physical-code risk clear, then offers one evidence-first path.

Restraint rule:
- Do not display raw scan code, another delivery ID, other tracking code, registry document path, or long internal policy text.

Product lens:
- Label-integrity and custody-loss prevention.

System stance:
- Shared alert dialog powered by design-system modal primitives and host-provided route callbacks.

Interaction thesis:
- Stop reuse, preserve custody truth, route to evidence, and keep sensitive bindings protected.

Signature move:
- A label lock strip that says `This label cannot be used again` before any action buttons.

Activation event:
- Host derives label reuse, duplicate scan, or already-received state from backend or local recovery context.

## Relationship To Other Shared Modals
`ScanPackageModal` captures the scan.

`PackageLabelAlreadyUsedModal` explains why a captured label cannot be used again.

`WrongPackageScannedModal` explains when the scanned label does not belong to the selected delivery.

`AcceptCustodyModal` confirms intentional custody transfer after a valid scan.

`AuditSensitiveActionAckModal` handles explicit acknowledgement for privileged override flows.

Routing distinction:
- Use `PackageLabelAlreadyUsedModal` when the label exists already, the package was already received, or the same step was already recorded.
- Use `WrongPackageScannedModal` when the staff member likely has the wrong package for this delivery.
- Use `AdminManualCustodyException` when an authorized admin must decide how to correct a record.
- Use `AdminPackageLabelRegistry` when an admin needs registry evidence.

Do not:
- Stack this modal on top of `ScanPackageModal`.
- Hide this conflict in a generic error banner.
- Send field users directly to package label registry.
- Let a support route change label binding.
- Convert a repeated scan into a silent success unless the host has a server-confirmed idempotent result and explicitly shows it outside this modal.

## Host Responsibilities
The host must provide:
- `deliveryId`
- delivery reference
- scan intent
- actor role
- current delivery status
- current custody label
- conflict type
- safe user-facing error code
- whether label binding is same-delivery or cross-delivery when safe
- whether already-received status is server confirmed
- whether duplicate scan was same-step or derived from stale context
- custody chain callback
- issue creation callback where allowed
- support route callback where allowed
- scan-another-label callback where allowed
- admin review callback where allowed
- label registry callback where allowed
- back callback
- close callback

The host may provide:
- redacted label preview
- scan intent label
- current station label
- last confirmed event label
- last confirmed event timestamp
- last confirmed custodian label
- active issue count
- offline queue item ID when conflict came from sync recovery
- stale data timestamp
- registry evidence summary for admin only

The host must not provide to field UI:
- raw scan code
- bound delivery ID
- bound tracking code
- sender or receiver private fields from another delivery
- internal actor IDs from another delivery
- registry document path
- raw backend metadata
- stack trace

## Modal Responsibilities
The modal must:
- Render a high-priority label conflict message.
- Explain that this label cannot be used again for the attempted action.
- Explain that no new intake, receipt, readiness, or custody movement was recorded.
- Offer only role-safe recovery actions.
- Use alert dialog semantics for the blocking state.
- Preserve focus and return focus safely on close.
- Announce conflict and route failures accessibly.
- Hide sensitive registry values.
- Route admin users to deeper review only when authorized.
- Keep field users on evidence-first actions.

The modal must not:
- Retry automatically.
- Submit fallback entry.
- Rebind package labels.
- Move custody.
- Mark package received.
- Record dispatch readiness.
- Print or reprint labels.
- Reveal where the label is already bound for normal field users.
- Ask staff to manually compare full scan codes.
- Treat label reuse as a harmless duplicate.
- Offer `Continue anyway`.
- Offer `Use this label`.
- Offer `Override` to field roles.

## Trigger Conditions
Open this modal when:
- Station intake receives `PACKAGE_SCAN_MISMATCH` and host context indicates the scan code is already bound.
- Station intake receives or derives `PACKAGE_ALREADY_RECEIVED`.
- Scan flow receives or derives `DUPLICATE_SCAN`.
- Offline replay rejects an intake or scan action because the label was already used or the step was already recorded.
- Admin package detail opens a label-conflict event.
- Station blocked queue opens a row with duplicate label context.
- Host detects same scan value submitted again after server-confirmed success and wants a visible recovery path.

Do not open this modal when:
- Camera permission is denied.
- Scan code length is invalid before backend submit.
- Scan value is unknown and not tied to label reuse.
- Package in hand is simply wrong for the selected delivery without duplicate label evidence.
- Station scope blocks the action.
- Assignment scope blocks the action.
- Payment blocks transport progression.
- Lifecycle status changed for reasons unrelated to label reuse.

Routing:
- Camera and manual entry errors stay in `ScanPackageModal`.
- Unknown or other-delivery mismatches without label-reuse framing go to `WrongPackageScannedModal`.
- Scope and permission errors go to role-specific blocked states.
- Admin-only registry inspection goes to `AdminPackageLabelRegistry`.

## Conflict Types
`already_bound_to_other_delivery`:
- The scanned label exists in the package label registry for a different delivery.
- Field copy: `This label is already tied to another delivery record.`
- Recovery: stop intake, open custody chain, report issue, contact support.
- Admin recovery: open label registry or manual custody exception.
- Field staff must not see the other delivery ID.

`already_received`:
- The selected delivery already has an origin intake or receipt recorded.
- Field copy: `This package has already been received.`
- Recovery: open custody chain or back to queue.
- Do not create another intake event.

`duplicate_scan`:
- The same scan event was already recorded for this step.
- Field copy: `This package scan was already recorded.`
- Recovery: open custody chain, refresh delivery, or back to delivery.
- Do not submit the same mutation again.

`same_delivery_label`:
- The label is already bound to the selected delivery.
- If the attempted step is intake, show already-received or already-bound guidance.
- If the attempted step is a later handoff, route to host-specific duplicate or status handling.
- Copy must distinguish safe same-delivery repeat from cross-delivery conflict.

`cross_delivery_label`:
- The label is bound to a different delivery.
- Treat as higher risk than same-delivery repeat.
- Recovery should include issue creation and admin review availability.
- Never reveal another delivery identity to field staff.

`offline_replay_label_conflict`:
- Queued scan or intake synced later and failed because label state changed.
- Field copy: `The queued scan could not be applied because this label was already used when it synced.`
- Recovery: open action recovery, custody chain, issue, or support.

`admin_review_label_conflict`:
- Admin opens an existing label conflict record.
- Admin copy: `Review the label binding and custody evidence before taking action.`
- Recovery: open label registry, manual custody exception, issue detail, or custody chain.

## Severity Model
`low_recovery`:
- Same delivery, same step, repeated submission after already recorded server success.
- Recommended action is custody chain or back to delivery.

`operational_blocker`:
- Intake or receipt cannot continue because package is already received.
- Recommended action is custody chain and queue refresh.

`investigation_required`:
- Label appears bound to another delivery.
- Recommended action is issue creation and admin review.

`offline_conflict`:
- Queued action rejected during sync.
- Recommended action is action recovery.

`security_review`:
- Repeated cross-delivery label conflicts or suspicious scan pattern.
- Recommended action is admin review and issue escalation.

Severity changes:
- Field users cannot downgrade severity.
- Support/admin can classify in a separate issue or exception workflow.
- This modal routes; it does not adjudicate final blame or fraud.

## Information Architecture
Default field layout:
1. Alert title.
2. Label lock strip.
3. Plain-language conflict explanation.
4. Selected delivery identity.
5. Safe status summary.
6. Recovery actions.
7. Optional issue or support hint.

Admin layout:
1. Alert title.
2. Label conflict summary.
3. Current binding evidence summary.
4. Custody evidence links.
5. Admin recovery actions.

Mobile priority:
- Keep `This label cannot be used again` visible above fold.
- Keep selected delivery reference visible.
- Keep primary action visible without scrolling on common phone sizes.
- Hide admin-only evidence behind a disclosure.

Admin priority:
- Show conflict type and evidence timestamp.
- Show registry route only when authorized.
- Keep privacy warning visible near evidence links.

Small-screen reduction:
- Collapse supporting explanation after first sentence.
- Show only primary, one secondary, and a more-actions disclosure.
- Keep back action visible.

## Header
Default title:
- `Package label already used`

Already received title:
- `Package already received`

Duplicate scan title:
- `Scan already recorded`

Cross-delivery title:
- `Label already tied to another delivery`

Subtitle:
- `This label cannot be used for another intake or handoff without review.`

Icon:
- Use label lock, shield, or warning icon.
- Do not use success icon.
- Do not use a generic question icon.

Header must:
- Be direct.
- Avoid blame.
- Avoid raw code.
- Avoid saying package is lost.
- Avoid implying admin approval is automatic.

## Label Lock Strip
Required copy:
- `This label cannot be used again.`

Supporting copy:
- `No new package receipt or custody movement was recorded from this scan.`

Already received copy:
- `This package was already received. Review the custody chain before taking action.`

Duplicate scan copy:
- `This scan was already recorded for this step.`

Cross-delivery copy:
- `This label is already linked elsewhere. Stop intake and escalate.`

Offline replay copy:
- `The queued scan was rejected during sync. Custody did not change.`

The strip must:
- Use danger or caution styling.
- Stay above action buttons.
- Be announced as part of the alert description.
- Avoid showing raw scan value.
- Avoid exposing another delivery identity.

## Delivery Identity Strip
Show:
- selected delivery reference
- scan intent
- current delivery status
- current custody owner label
- current station label when role-safe
- last confirmed event when available

Do not show:
- raw scanned code
- bound delivery ID
- other delivery tracking code
- full receiver phone
- full receiver address
- provider reference
- internal actor IDs
- registry document path

Identity copy:
- `Selected delivery: {deliveryReference}`
- `Scan step: {scanIntentLabel}`
- `Current status: {statusLabel}`
- `Current custody: {custodyLabel}`

If data is stale:
- `Delivery details may be out of date. Refresh before another intake attempt.`

If offline replay:
- `This came from a queued action that synced later.`

## Conflict Summary Card
The card must show:
- conflict type label
- direct plain-language explanation
- what did not happen
- safest next step

Default conflict label:
- `Label conflict`

Already bound explanation:
- `This label already belongs to a package record and cannot be used for this delivery.`

Already received explanation:
- `The selected delivery already has a received package event.`

Duplicate scan explanation:
- `This scan was already recorded for this step, so Kra did not create another event.`

Cross-delivery explanation:
- `The label is linked outside this selected delivery. Keep the package aside and escalate.`

No-change message:
- `Kra did not create another label binding from this attempt.`

The card must not:
- show raw scan code
- reveal other delivery details
- imply the staff member made a mistake
- tell the user to continue scanning the same label repeatedly

## Action Model
Default primary action:
- `Open custody chain`

Already received primary action:
- `Open custody chain`

Duplicate scan primary action:
- `Open custody chain`

Cross-delivery primary action:
- `Report issue`

Offline replay primary action:
- `Open action recovery`

Admin review primary action:
- `Open label registry`

Secondary actions:
- `Scan another label`
- `Report issue`
- `Contact support`
- `Back to queue`
- `Back to delivery`
- `Open admin review`
- `Open label registry`
- `Open action recovery`

Action availability:
- `Open custody chain`: show when selected delivery is known and user has delivery access.
- `Scan another label`: show when host scanner can reopen and workflow allows another intake attempt.
- `Report issue`: show for station, support, and admin when issue creation is available.
- `Contact support`: show for field roles when support route is available.
- `Back to queue`: show for station intake and blocked queue hosts.
- `Back to delivery`: show for delivery detail or scan hosts.
- `Open admin review`: show only for admin/support contexts with exception access.
- `Open label registry`: show only for admin contexts with package registry access.
- `Open action recovery`: show for offline replay conflicts.

Action behavior:
- `Open custody chain` closes modal and routes to custody chain for selected delivery.
- `Scan another label` closes modal and returns to scanner in fresh scan state.
- `Report issue` passes safe context into issue creation.
- `Contact support` opens support route with redacted conflict context.
- `Back to queue` closes modal and returns to the station queue.
- `Back to delivery` closes modal and returns to host delivery.
- `Open admin review` routes to manual custody exception or package detail.
- `Open label registry` routes to admin package label registry.
- `Open action recovery` routes to failed queued action record.

Primary action selection:
- Use `Open action recovery` for offline replay conflicts.
- Use `Open label registry` for admin review when registry access is available.
- Use `Report issue` for cross-delivery label conflicts in field mode.
- Use `Open custody chain` for already received, same-delivery, and duplicate scan states.
- If preferred primary action is unavailable, choose the safest available action in this order: `Open custody chain`, `Report issue`, `Contact support`, `Back to queue`, `Back to delivery`.

Actions must not:
- Use `Continue`.
- Use `Ignore`.
- Use `Use anyway`.
- Use `Rebind label`.
- Use `Approve`.
- Use `Override` for field roles.
- Trigger a mutation directly from this modal.

## Role Behavior
Station operator:
- See custody chain, scan another label, report issue, contact support, back to queue.
- Do not see bound delivery ID.
- Do not see other tracking code.
- Do not see label registry route.
- Cross-delivery conflict should guide package set-aside and escalation.

Station lead:
- See station operator actions plus admin review only if role permissions allow.
- Do not get silent override.
- May help confirm physical package location in issue route.

Support:
- See custody chain, report issue, admin review when permissions allow.
- Do not show `Contact support`.
- May see conflict type.
- Must not see raw scan code by default.

Ops admin:
- See custody chain, admin review, label registry, issue route, back to admin package.
- May see redacted binding summary.
- Full registry access belongs to `AdminPackageLabelRegistry`, not this modal.

Driver:
- Usually should not trigger this modal except repeated scan recovery.
- See custody chain, report issue, contact support, back to delivery.
- Do not see station label registry details.

Final-mile courier:
- Usually should not trigger this modal except repeated scan recovery.
- See custody chain, report issue, contact support, back to assignment.
- Do not see origin label registry details.

Sender and receiver:
- Must not see this modal.

## State Machine
`closed`:
- Modal is not rendered.
- No conflict context is visible.

`opening`:
- Host passes conflict context.
- Focus moves to alert title.
- Background scanner or host action is inert.

`label_reuse_detected`:
- Default state for label reuse conflict.
- Label lock strip is visible.

`already_bound_to_other_delivery`:
- Label exists for another delivery.
- Field staff see protected copy.
- Admin may see redacted registry summary.

`already_received`:
- Selected delivery is already received for the attempted step.
- Custody chain action is primary.

`duplicate_scan`:
- Scan was already recorded for the same step.
- User is directed to custody evidence.

`same_delivery_label`:
- Label belongs to selected delivery but cannot be used for another intake.
- Copy says the label is already recorded for this delivery.

`cross_delivery_label`:
- Label belongs outside selected delivery.
- Issue route is emphasized.
- Other delivery identity remains hidden from field staff.

`scan_value_hidden`:
- No scan-code preview is shown.

`scan_value_redacted`:
- Redacted preview is shown only if host policy permits.

`custody_chain_available`:
- Custody chain action is enabled.

`issue_route_available`:
- Report issue action is enabled.

`support_route_available`:
- Contact support action is enabled for field roles.

`admin_review_available`:
- Admin review action is enabled.

`label_registry_available`:
- Label registry action is enabled for admin users.

`offline_replay_context`:
- Conflict came from queued action sync or action recovery.

`stale_context`:
- Host delivery data may be stale.
- Refresh guidance is visible.

`submitting_issue_context`:
- Host prepares issue context.
- Buttons lock except safe close when host permits.

`issue_context_created`:
- Host routes to issue screen.

`network_error`:
- Route action or refresh failed.
- Conflict remains visible.

`closing`:
- Modal closes and focus returns to safe host control.

## Data Contract
Component props:
- `isOpen: boolean`
- `deliveryId: string`
- `deliveryReference: string`
- `scanIntent: ScanPackageIntent`
- `actorRole: "station_operator" | "driver" | "final_mile_courier" | "support" | "admin" | string`
- `currentStatus: DeliveryStatus`
- `currentCustodyLabel?: string`
- `currentStationLabel?: string`
- `lastConfirmedEventLabel?: string`
- `lastConfirmedEventAt?: string`
- `conflictType: "already_bound_to_other_delivery" | "already_received" | "duplicate_scan" | "same_delivery_label" | "cross_delivery_label" | "offline_replay_label_conflict" | "admin_review_label_conflict" | "unspecified"`
- `severity: "low_recovery" | "operational_blocker" | "investigation_required" | "offline_conflict" | "security_review"`
- `safeErrorCode: "PACKAGE_SCAN_MISMATCH" | "PACKAGE_ALREADY_RECEIVED" | "DUPLICATE_SCAN" | "INVALID_STATUS_TRANSITION" | string`
- `redactedLabelPreview?: string`
- `canShowRedactedLabel: boolean`
- `canOpenCustodyChain: boolean`
- `canScanAnotherLabel: boolean`
- `canReportIssue: boolean`
- `canContactSupport: boolean`
- `canOpenAdminReview: boolean`
- `canOpenLabelRegistry: boolean`
- `canOpenActionRecovery: boolean`
- `isOfflineReplay?: boolean`
- `isStale?: boolean`
- `onOpenCustodyChain: () => void`
- `onScanAnotherLabel: () => void`
- `onReportIssue: (context: PackageLabelAlreadyUsedIssueContext) => void`
- `onContactSupport: (context: PackageLabelAlreadyUsedSupportContext) => void`
- `onOpenAdminReview: () => void`
- `onOpenLabelRegistry: () => void`
- `onOpenActionRecovery: () => void`
- `onBack: () => void`
- `onClose: () => void`

Issue context:
- `deliveryId`
- `deliveryReference`
- `category=handoff`
- `source=package_label_already_used`
- `scanIntent`
- `conflictType`
- `severity`
- `safeErrorCode`
- `currentStatus`
- `currentCustodyLabel`
- `currentStationLabel`
- `lastConfirmedEventLabel`
- `lastConfirmedEventAt`

Never pass to issue context from this modal:
- raw scan code
- bound delivery ID
- other tracking code
- sender private fields
- receiver private fields
- internal actor IDs
- raw backend metadata
- stack trace

Support context:
- `deliveryId`
- `deliveryReference`
- `source=package_label_already_used`
- `scanIntent`
- `conflictType`
- `severity`
- `safeErrorCode`
- `currentStatus`
- `currentCustodyLabel`
- `hostRoute`
- `offlineQueueItemId` only when it is the current failed queue record and not a scan value

Never pass to support context from this modal:
- raw scan code
- bound delivery ID
- other tracking code
- receiver phone
- full receiver address
- raw backend metadata
- stack trace

Admin context:
- selected delivery ID
- scan intent
- conflict type
- safe error code
- event time when available
- actor role
- current custody role
- safe custody chain link
- safe issue link when available
- registry lookup handle only when authorized

## Redaction Rules
Default:
- Hide scan code entirely.

If host permits redacted preview:
- Show only a redacted value.
- Use a format such as `PKG...481`.
- Do not allow copy.
- Do not expose more information in the accessibility label than visible text.

Field staff:
- Do not show raw scan code.
- Do not show bound delivery ID.
- Do not show other delivery tracking code.
- Do not show registry path.

Support:
- May see conflict type and redacted label preview if policy allows.
- Must not see raw scan code by default.

Admin:
- May see redacted binding summary inside this modal.
- Full raw registry inspection must happen only in authorized registry screens.

Never:
- Put raw scan code in route params.
- Put raw scan code in telemetry.
- Put raw scan code in issue summary.
- Put raw backend metadata in visible UI.

## Already Bound Flow
When label is already bound to another delivery:
- Title: `Label already tied to another delivery`.
- Label lock strip says no new binding was created.
- Field body says `This label is already tied to another delivery record. Stop intake and escalate.`
- Primary action is `Report issue`.
- Custody chain remains available for selected delivery.
- Admin review is available only for authorized users.

Field recovery:
- Set physical package aside.
- Open issue with current station and package location.
- Contact support if issue route is unavailable.
- Do not scan the same label again until instructed.

Admin recovery:
- Open label registry.
- Open manual custody exception.
- Review active issue.
- Review custody chain.

Do not:
- Show other delivery reference to field users.
- Rebind the label.
- Print a replacement label automatically.
- Continue intake with fallback.

## Already Received Flow
When package is already received:
- Title: `Package already received`.
- Body: `This delivery already has a received package event.`
- Primary action is `Open custody chain`.
- Secondary action is `Back to queue`.

Field recovery:
- Confirm current custody owner.
- Return to queue after reviewing status.
- Report issue only if physical package is still at the counter and state is confusing.

Queue behavior:
- Host should refresh station intake queue after close.
- The delivery should no longer appear as a normal intake item when current status is beyond intake.
- If stale cache caused the action, show stale context message.

Do not:
- Create a second intake event.
- Print another first label.
- Move package to outbound without evidence.

## Duplicate Scan Flow
When scan was already recorded:
- Title: `Scan already recorded`.
- Body: `This package scan was already recorded for this step.`
- Primary action is `Open custody chain`.
- Secondary action is `Back to delivery`.

Same-step duplicate:
- Use low recovery severity when backend confirms no second mutation happened.
- Show no-change message.
- Do not encourage repeated submit.

Cross-step duplicate:
- If same label is being used in a different workflow step, host must decide whether this is correct package progression or conflict.
- If correct progression, do not use this modal.
- If conflict, use already-bound or status-blocked state.

Offline duplicate:
- If duplicate came from queued action replay, use offline replay flow.
- Show action recovery route.

## Same Delivery Label Flow
When label belongs to selected delivery:
- Copy: `This label is already recorded for this delivery.`
- If current step is origin intake, explain that intake is already complete or status must be refreshed.
- If current step is later handoff and the label is expected, host should not open this modal unless the step was already recorded.
- Primary action is custody chain.

Allowed actions:
- Open custody chain.
- Refresh delivery.
- Back to delivery.
- Report issue only if package state is unclear.

Do not:
- Treat same-delivery label as cross-delivery conflict.
- Hide the difference between already recorded and bound elsewhere.
- Re-run intake.

## Offline Replay Behavior
When conflict comes from offline queued action:
- Title stays conflict-specific.
- Body explains queued action was rejected after sync.
- Primary action should be `Open action recovery`.
- Custody lock strip must say no new event was recorded.
- `Open custody chain` should remain available if online.
- `Report issue` should be available when physical package state needs review.

Offline replay copy:
- `The queued scan could not be applied because this label was already used when it synced.`

Offline replay actions:
- `Open action recovery`
- `Open custody chain`
- `Report issue`
- `Contact support`
- `Back to delivery`

Do not:
- Requeue the same scan automatically.
- Mark queue item resolved without user action.
- Hide failed queue record.
- Claim the package moved.

## Issue Creation Handoff
When user taps `Report issue`:
- Host opens `OpsIssueCreate` or admin issue route.
- Preselect issue category `handoff`.
- Include safe context only.
- Do not include raw scan code.
- Do not include bound delivery ID.
- Do not include other delivery details.

Suggested issue summary:
- `Package label was already used.`

Suggested issue severity:
- `high` for cross-delivery label conflict.
- `medium` for same-delivery duplicate scan.
- `medium` for already received state with confusing physical package.
- `high` for repeated label conflicts from the same station or actor.
- `high` for offline replay that may affect custody accountability.

Issue route should ask staff to describe:
- package location
- who currently has the package
- whether label is damaged
- whether another package is present
- whether this happened after offline recovery
- whether supervisor or station lead is present

## Support Route Handoff
When user taps `Contact support`:
- Host opens the support route for the selected delivery, station, or assignment context.
- The support route receives redacted conflict context only.
- The support route should start from a label-conflict category.
- The support route must preserve the no-new-binding message.
- The support route must not expose raw scan code or another delivery identity.

Support route entry points:
- station help drawer
- delivery support thread
- station incident intake
- blocked queue support flow
- offline action recovery support panel

Support route should show:
- selected delivery reference
- scan intent
- current custody label
- conflict type
- safe user-facing error code
- timestamp if host provides one
- whether offline replay is involved

Support route must not allow:
- custody override
- label rebinding
- package search by raw scan code
- direct access to another delivery record
- bypass of issue creation when issue evidence is required

Support-route availability rules:
- `support_route_available` is true only when `canContactSupport=true` and `onContactSupport` is supplied.
- Field roles can see `Contact support` when support routing is enabled for the host surface.
- Support and admin roles should use `Open admin review`, `Open custody chain`, or `Report issue`.
- Offline replay can offer `Contact support` as a secondary action after `Open action recovery`.
- If support routing fails, keep the modal open and show route error recovery.

## Admin Review Handoff
Admin review route may be:
- manual custody exception
- admin package detail
- admin package label registry
- issue detail if an issue exists
- audit event detail if conflict came from admin review

Admin context should include:
- selected delivery ID
- scan intent
- conflict type
- safe error code
- event time when available
- actor role
- current custody role
- safe link to custody chain
- safe issue link when available

Admin review must not:
- Auto-resolve conflict.
- Rebind label from modal.
- Mutate custody from modal.
- Show registry data to users lacking registry permission.
- Hide the field staff redaction policy.

## Label Registry Handoff
When user taps `Open label registry`:
- Route only if user is admin with registry permission.
- Use selected delivery context and registry lookup handle supplied by host.
- Do not pass raw scan code through URL params.
- Prefer internal route state or server lookup by event ID when available.
- Show registry evidence in `AdminPackageLabelRegistry`, not in this modal.

Registry route should inspect:
- label binding delivery
- label creation timestamp
- creator role
- origin and destination station IDs
- related custody events
- related issue or exception records

Registry route must not:
- Allow editing package label binding in v1.
- Expose registry route to station operator.
- Expose another delivery to field staff through browser history.

## Copy System
Tone:
- Calm.
- Direct.
- Evidence-oriented.
- No blame.
- No speculation.

Preferred words:
- `already used`
- `already recorded`
- `cannot be used again`
- `no new event was recorded`
- `review custody chain`
- `report issue`

Avoid words:
- `lost`
- `stolen`
- `fraud` in field copy
- `wrong person`
- `mistake`
- `override`
- `force`

Default title:
- `Package label already used`

Default body:
- `This label is already recorded in Kra. No new intake or custody movement was created from this scan.`

Already received body:
- `This package was already received. Review custody chain before taking action.`

Cross-delivery body:
- `This label is already tied to another delivery record. Stop intake and escalate.`

Duplicate scan body:
- `This package scan was already recorded for this step.`

Stale data body:
- `The delivery status may have changed since this screen loaded. Refresh before another scan attempt.`

Offline replay body:
- `The queued scan could not be applied because this label was already used when it synced.`

Admin body:
- `Review label binding and custody evidence before changing package state.`

## Visual Design
Visual thesis:
- Use a strong label-lock motif, not generic danger styling alone.

Structure:
- Header uses icon, title, and one-sentence summary.
- Lock strip uses high contrast caution surface.
- Identity strip uses neutral surface with tight labels.
- Actions use one dominant primary button and restrained secondary actions.

Color:
- Use semantic danger for cross-delivery conflict.
- Use caution for already received or duplicate scan.
- Use neutral surface for identity.
- Do not use success green.

Typography:
- Title should be decisive and readable in field conditions.
- Body should be short enough for a quick glance.
- Evidence labels should use compact, high-contrast text.

Spacing:
- Keep top section dense but breathable.
- Avoid card soup.
- Give the lock strip enough vertical space to be visually unmissable.
- On mobile, keep action buttons within thumb reach.

Motion:
- Modal entrance should be short and firm.
- Lock strip may use one restrained emphasis pulse on open.
- No looping warning animation.
- Respect reduced motion.

## Mobile UX
Mobile behavior:
- Prefer bottom sheet if opened from active scanner and scanner closes behind it.
- Prefer full modal if conflict needs more text or offline recovery context.
- Trap focus while open.
- Return focus to scan trigger or queue row on close.

Touch behavior:
- Minimum action target should meet or exceed WCAG target guidance.
- Primary and secondary actions must not be adjacent without spacing.
- Destructive or irreversible labels must not be near scan-again action.

One-handed use:
- Primary action at bottom.
- Back action visible.
- More actions can open a compact sheet.

Low-connectivity behavior:
- Preserve conflict context in memory.
- Do not require another network request to read the message.
- Route actions that require network show loading and failure recovery.

Station conditions:
- Text must remain readable under glare.
- Redaction must remain clear without relying on color alone.
- Haptic feedback should indicate conflict only once per modal opening.

## Admin UX
Admin behavior:
- Use centered alert dialog.
- Show conflict type and evidence summary.
- Show admin-only links with explicit permission gating.
- Keep field redaction warning visible.

Admin evidence summary may include:
- conflict type
- selected delivery ID
- selected tracking code only if already visible in admin package detail
- label binding age range such as `created earlier today`
- creator role
- related station scope

Admin evidence summary must not include:
- raw scan code unless registry policy permits and route is secure
- another delivery ID in field-compatible variant
- registry path
- raw backend metadata

## Accessibility
Semantics:
- Use `role="alertdialog"` for blocking label conflict.
- Use `aria-modal="true"`.
- Use `aria-labelledby` pointing to visible title.
- Use `aria-describedby` pointing to concise conflict explanation and lock strip.
- Use semantic buttons for all actions.

Focus:
- On open, focus the title or least risky primary action depending platform behavior.
- If cross-delivery conflict is severe, initial focus should not land on `Scan another label`.
- Trap focus inside modal.
- Escape closes only if host permits safe return.
- On close, return focus to invoking control or safe queue row.

Announcements:
- Announce conflict title.
- Announce no-new-binding message.
- Announce route loading and route failure.
- Announce stale context warning.

Keyboard:
- Tab order follows visual order.
- Primary action is first actionable control after explanation on desktop.
- Back or close remains reachable.

Screen reader copy:
- Do not read hidden raw scan code.
- Do not include hidden bound delivery detail.
- Redacted preview is read exactly as visible.

Reduced motion:
- Remove entrance emphasis.
- Do not use shake animation.
- Keep status changes textual.

## Error Handling
Known code mapping:
- `PACKAGE_SCAN_MISMATCH` with bound-label context maps to `already_bound_to_other_delivery` or `cross_delivery_label`.
- `PACKAGE_ALREADY_RECEIVED` maps to `already_received`.
- `DUPLICATE_SCAN` maps to `duplicate_scan`.
- `INVALID_STATUS_TRANSITION` may map to `already_received` only when host status confirms already-received state.
- `VALIDATION_ERROR` stays in scanner or host form unless label conflict context exists.
- `FORBIDDEN` stays in permission state, not this modal.

Route errors:
- If custody chain route fails, keep modal open and show `Could not open custody chain. Try again or go back to delivery.`
- If issue route fails, keep modal open and show `Could not start issue report. Try again or contact support.`
- If support route fails, keep modal open and show `Could not open support. Try again from delivery detail.`
- If admin route fails, keep modal open and show `Could not open admin review. Check permissions and try again.`

Error rules:
- Never replace conflict copy with route failure alone.
- Always keep no-new-binding message visible.
- Do not retry route action automatically.
- Do not clear conflict context until user leaves the modal or host route.

## Security And Privacy
Security requirements:
- This modal must not expose cross-delivery label binding to unauthorized field roles.
- This modal must not enable label rebinding.
- This modal must not turn duplicate label into manual fallback approval.
- This modal must not write scan values to analytics.
- This modal must not include raw backend metadata in route params.

Privacy requirements:
- Hide receiver details not already visible in the host.
- Hide full package scan code.
- Hide other delivery identity.
- Hide staff actor IDs.
- Hide registry internals.

Operational safety:
- Last confirmed custodian remains accountable.
- Next handoff remains blocked if state is unresolved.
- Package should be set aside when cross-delivery conflict is suspected.
- Issue route should capture physical location before staff moves package.

Fraud and abuse signals:
- Repeated cross-delivery label conflicts by actor.
- Multiple labels reused at same station.
- Offline replay conflicts after long delay.
- Label conflict followed by manual fallback request.
- Label conflict with damaged or unreadable label report.

Fraud copy:
- Field copy must not accuse the staff user.
- Admin copy may say `security review` when policy and role allow.

## Telemetry
Events:
- `package_label_already_used_modal_opened`
- `package_label_already_used_custody_chain_tapped`
- `package_label_already_used_scan_another_tapped`
- `package_label_already_used_issue_tapped`
- `package_label_already_used_support_tapped`
- `package_label_already_used_admin_review_tapped`
- `package_label_already_used_registry_tapped`
- `package_label_already_used_action_recovery_tapped`
- `package_label_already_used_closed`
- `package_label_reuse_blocked`

Required properties:
- `deliveryId`
- `actorRole`
- `scanIntent`
- `currentStatus`
- `conflictType`
- `severity`
- `safeErrorCode`
- `source`
- `isOfflineReplay`
- `isStale`

Allowed derived properties:
- `hasRedactedPreview`
- `hasCustodyChainRoute`
- `hasIssueRoute`
- `hasAdminReviewRoute`
- `hasRegistryRoute`
- `hostSurface`
- `stationId` only when already scoped and allowed

Never include:
- raw scan code
- redacted scan code if avoidable
- bound delivery ID
- other tracking code
- receiver phone
- full address
- internal actor ID
- registry document path
- raw backend metadata

Analytics rules:
- Emit open once per conflict display.
- Emit action event only after user action.
- Emit no success event from this modal.
- Host scan flow emits later success only if a different valid action succeeds.

## Loading And Pending States
Opening:
- Show modal only after conflict type is known enough for safe copy.
- If conflict type is still resolving, host should show scanner submit loading.

Route pending:
- Disable the tapped action.
- Keep other risky actions disabled.
- Keep safe close only if route can be cancelled.
- Show inline progress text.

Issue pending:
- Show `Preparing issue report`.
- Do not clear conflict context.
- Do not include raw scan code.

Support pending:
- Show `Opening support`.
- Keep custody chain visible when route fails.

Admin pending:
- Show `Opening admin review`.
- If permission denied, return to modal with admin action hidden.

## Empty And Missing Context
Missing delivery reference:
- Show `Selected delivery unavailable`.
- Hide station and receiver details.
- Primary action becomes `Back to queue` or `Back to delivery`.

Missing custody label:
- Show `Current custody unavailable. Open custody chain to verify.`

Missing conflict type:
- Use `Package label already used`.
- Body: `This label cannot be used for this action. Review custody chain before continuing.`

Missing route callback:
- Hide corresponding action.
- Do not render disabled action without reason unless product needs visibility.

Missing online status:
- Do not show offline replay copy.
- Use default route failure handling.

## Stale Context
Stale state opens when:
- Delivery data was loaded before a successful server event elsewhere.
- Queue row was cached.
- Offline action replay returns a conflict.
- Host detects outdated delivery status.

Stale copy:
- `This screen may be behind the latest delivery status. Review custody chain or refresh before another scan.`

Stale actions:
- `Open custody chain`
- `Refresh delivery`
- `Back to queue`

Stale rules:
- Do not allow scan-another-label as primary.
- Do not show confident cross-delivery copy without backend evidence.
- Do not clear stale warning after failed refresh.

## Permissions Matrix
Station operator:
- Custody chain: allowed when delivery visible.
- Scan another label: allowed when host scanner permits.
- Report issue: allowed when issue route exists.
- Support route: allowed when support route exists.
- Admin review: hidden.
- Label registry: hidden.

Driver:
- Custody chain: allowed when assigned or delivery visible.
- Scan another label: host-specific.
- Report issue: allowed when issue route exists.
- Support route: allowed when support route exists.
- Admin review: hidden.
- Label registry: hidden.

Courier:
- Custody chain: allowed when assigned or delivery visible.
- Scan another label: host-specific.
- Report issue: allowed when issue route exists.
- Support route: allowed when support route exists.
- Admin review: hidden.
- Label registry: hidden.

Support:
- Custody chain: allowed.
- Report issue: allowed.
- Support route: hidden.
- Admin review: allowed when permission exists.
- Label registry: hidden unless specifically granted.

Admin:
- Custody chain: allowed.
- Report issue: allowed.
- Admin review: allowed.
- Label registry: allowed when permission exists.
- Scan another label: hidden unless in station support mode.

Sender and receiver:
- Modal unavailable.

## Host Integration
`ScanPackageModal` integration:
- Scanner submits or returns scan to host.
- Host receives duplicate signal.
- Scanner closes.
- This modal opens with conflict context.
- On `Scan another label`, scanner reopens in fresh state with previous value cleared.

`StationPackageIntake` integration:
- Intake submit receives conflict.
- Intake form remains intact behind modal.
- Label field is cleared only when user chooses `Scan another label`.
- Queue refresh happens on close or after custody chain return.

`OpsActionRecovery` integration:
- Failed queued action opens this modal from recovery detail.
- Primary action is action recovery.
- Modal must show queued action context without raw scan value.

`AdminPackageDetail` integration:
- Admin opens conflict event.
- Modal shows admin review and label registry action when allowed.
- Closing returns to package detail event row.

`StationBlockedQueue` integration:
- Queue row opens modal with current conflict summary.
- Back action returns to same queue filter.
- Host should not remove row until server state changes.

## QA Requirements
Functional QA:
- Opens for label already bound to another delivery.
- Opens for already received state.
- Opens for duplicate scan state.
- Opens for offline replay label conflict.
- Does not open for camera permission denial.
- Does not open for plain invalid scan length.
- Does not open for unrelated scope violation.
- Does not show raw scan code.
- Does not show bound delivery ID to field staff.
- Routes to custody chain.
- Routes to issue creation with safe context.
- Routes to support with safe context.
- Routes to admin review only when allowed.
- Routes to label registry only when allowed.
- Reopens scanner in fresh state for scan another label.

Accessibility QA:
- Alert dialog has accessible name.
- Alert dialog has accessible description.
- Focus is trapped.
- Escape behavior follows host policy.
- Focus returns after close.
- Screen reader announces no-new-binding message.
- Route errors are announced.
- Buttons meet target size.
- Reduced motion removes emphasis animation.

Privacy QA:
- Inspect telemetry payload.
- Inspect issue context.
- Inspect support context.
- Inspect route params.
- Inspect logs available to client.
- Confirm raw scan code is absent.
- Confirm other delivery identity is absent for field roles.

Responsive QA:
- Fits compact phone without hiding primary action.
- Supports large text.
- Works in landscape station tablet.
- Works in admin desktop modal.
- Handles long delivery reference without overflow.

## E2E Coverage
Required E2E scenarios:
- `e2e-station-intake-label-binding`: first intake binds label once.
- `e2e-station-intake-duplicate-label-blocked`: second delivery cannot reuse label.
- `e2e-station-intake-already-received`: already received package opens custody chain recovery.
- `e2e-scan-duplicate-step`: repeated scan shows already recorded state.
- `e2e-offline-replay-label-conflict`: queued action rejected by label conflict opens action recovery.
- `e2e-admin-label-conflict-review`: admin can open label registry when authorized.
- `e2e-field-redaction`: station operator never sees raw scan or bound delivery ID.
- `e2e-support-redaction`: support context excludes raw scan and bound delivery ID.

Component tests:
- Conflict type selects correct title.
- Severity selects correct primary action.
- Permission matrix hides admin actions.
- Route callbacks receive safe context only.
- Missing callbacks hide actions.
- Stale context copy appears.
- Redacted preview never includes full code.
- Close returns focus.

Negative tests:
- `Scan another label` is hidden when scanner cannot reopen.
- `Open label registry` hidden for station operator.
- `Open admin review` hidden for field roles.
- `Report issue` hidden when issue route unavailable.
- `Contact support` hidden for support role.
- Raw scan code passed accidentally is not rendered.

## Implementation Notes For Claude Code
Build this as a shared component:
- `PackageLabelAlreadyUsedModal`.
- Consume design-system modal, alert, button, status strip, and action-list primitives.
- Keep component presentational with host-owned routing.
- Treat all backend mutations as host responsibility.
- Use typed props for conflict type, severity, capabilities, and callbacks.
- Prefer discriminated unions for field, support, and admin contexts.

Implementation must:
- Clear previous scan value before reopening scanner.
- Keep previous scan value out of React state after close where possible.
- Never log raw scan code.
- Use safe analytics helper.
- Use role capability checks from host.
- Support mobile bottom sheet and admin dialog variants through one contract.

Implementation must not:
- Fetch package registry directly from field app.
- Call backend from inside this modal except through host callback if project architecture requires it.
- Create issue without explicit user action.
- Create custody event.
- Create label binding.
- Print or reprint label.

## Completion Checklist
Claude Code can mark this modal complete only when:
- All required states are represented.
- All conflict types have copy and actions.
- All role permissions are enforced.
- All route callbacks are tested.
- Raw scan code never renders.
- Bound delivery ID never renders for field roles.
- Admin registry route is permission gated.
- Offline replay path is covered.
- Stale context path is covered.
- Issue and support context exclude sensitive fields.
- Accessibility behavior passes keyboard and screen reader checks.
- E2E tests cover label reuse, already received, duplicate scan, and redaction.

## Build Handoff Summary
Claude Code should build `PackageLabelAlreadyUsedModal` as the dedicated recovery modal for package label reuse, already-received package state, and repeated scan events. It must stop duplicate label binding, show that no new intake or custody movement happened, route field users to custody chain, issue, support, or queue recovery, route admins to review or registry only when authorized, protect scan-code and cross-delivery identity, support offline replay recovery, and use alert-dialog accessibility behavior for a high-priority custody blocker.
