# Duplicate Package Label State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `duplicate_package_label` |
| Component family | Shared screen state |
| Primary component | `SharedDuplicatePackageLabelState` |
| Supporting components | `DuplicateLabelLockCard`, `DuplicateLabelEvidenceStrip`, `DuplicateLabelRecoveryActions`, `DuplicateLabelPrivacyGuard`, `DuplicateLabelCustodyNotice`, `DuplicateLabelAdminRoutePanel`, `DuplicateLabelOfflineReplayPanel`, `DuplicateLabelAuditWarning` |
| Primary surfaces | station operator mobile app, operations mobile app, admin web console |
| Required recovery | block intake, open custody chain, report issue, open admin package detail, open package label registry when allowed, or return to safe parent queue |
| Test id root | `state-duplicate-package-label` |
| Backend coverage | `PACKAGE_SCAN_MISMATCH`, `PACKAGE_ALREADY_RECEIVED`, `DUPLICATE_SCAN`, package label registry reuse, same-step duplicate scan, already-received package state |
| Browser mutation operation | None directly; this state explains and routes after a protected scan or intake mutation is rejected |
| Data sensitivity | raw scan code, scan-code fingerprint, bound delivery context, selected delivery, tracking code, station scope, current custody holder, issue context, registry access |
| Offline critical | Yes because duplicate label detection must stop queued intake or replay from creating a false custody event |
| Related inventory state | `duplicate_package_label` |
| Related modal | `PackageLabelAlreadyUsedModal` |
| Related state specs | scan mismatch, blocked by issue, manual review required, custody not confirmed, offline, stale data, error, not authorized, session expired |
| Design tokens | `label.amber.700`, `label.red.700`, `label.ink.950`, `label.slate.700`, `label.slate.500`, `label.paper.50`, `surface`, spacing `4-40`, radius `8-18` |
| Accessibility target | WCAG 2.1 AA equivalent with clear duplicate state, large recovery controls, non-color risk indicators, and focus-safe modal or page behavior |

## Purpose
`SharedDuplicatePackageLabelState` is the shared UI state shown when a package label scan code has already been bound, already received, or already recorded in a way that makes the attempted intake or custody action unsafe.

This state must answer:
- `Why can this label not be used here?`
- `Did the attempted action change custody?`
- `Is this a label reuse risk or an already-recorded scan?`
- `What should the field user do with the physical package now?`
- `What evidence route should the user open next?`
- `Which recovery paths are allowed for this role?`
- `What registry detail must remain hidden?`
- `How does offline replay recover without double intake?`

The most important rule is:
```text
A package label can bind to only one delivery, and a duplicate label event never creates a new custody movement.
```

## Product Job
Kra uses package labels as custody-critical physical evidence. If the same scan code can be reused across deliveries, copied across parcels, replayed after an offline sync, or submitted twice for the same protected step, the system can no longer prove which physical package moved.

The duplicate package label state must:
- stop the attempted intake or scan action
- tell the user that the label cannot be used again
- confirm that no new custody event was created by this attempt
- preserve the last known custody holder as the source of truth
- route field users to custody chain, issue creation, support, or the parent queue
- route admins to package detail, custody exception, or package label registry when authorized
- keep raw scan values out of visible UI, URLs, analytics, crash reports, and general logs
- differentiate same-delivery duplicate action from cross-delivery label reuse when role allows
- recover offline replay conflicts without treating them as success
- make label integrity feel strict but operationally usable in busy station conditions

## Strategic Role
Duplicate package label is a loss-prevention state, not a normal form error. It protects the binding between a physical label and a delivery record.

The design must be strict:
- no second binding
- no optimistic success after duplicate detection
- no label rebind from field UI
- no raw scan-code reveal to station staff
- no other-delivery identity leak to unauthorized roles
- no retry loop that repeatedly submits the same unsafe value

The design must also be practical:
- station counters are busy
- labels can be damaged
- labels can be scanned twice by mistake
- offline actions can replay after another device already confirmed a binding
- admins need enough evidence to investigate without weakening scan-code secrecy
- support needs a safe issue trail when the package in hand is confusing

This state is the product's visible commitment that custody proof matters more than speed.

## External Research Used
Only directly relevant label, scanner, and accessibility references were used:
- [GS1 Serial Shipping Container Code](https://www.gs1.org/standards/id-keys/sscc): supports the logistics principle that a transport unit should use a unique identifier.
- [GS1 Logistic Label Guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3): supports label design that connects scannable code, human-readable context, and logistics-unit identity.
- [Google ML Kit barcode scanning for Android](https://developers.google.com/ml-kit/vision/barcode-scanning/android): supports mobile barcode scanning behavior, supported formats, auto-zoom, and scanner guidance on Android.
- [Apple VisionKit data scanning](https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera): supports iOS camera scanning interaction patterns for recognized data capture.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports interruptive dialog behavior for a high-priority custody blocker.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background content, Escape behavior, and focus return.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports text that identifies what failed and how to recover.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing duplicate label status without moving focus unexpectedly.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch target sizing for field recovery actions.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-data/firestore-schema.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/api-contracts.md`
- `docs/06-architecture/backend-architecture.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/04-wrong-package-scanned-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/05-package-label-already-used-modal.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/11-scan-mismatch-state.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/04-station-package-intake.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/05-station-intake-confirmation.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/18-station-blocked-queue.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/07-admin-package-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/08-admin-package-label-registry.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `services/api/src/package-labels.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/service-errors.ts`
- `packages/shared/src/contracts/api.ts`

## Visual Thesis
Duplicate package label should feel like a sealed evidence lock: controlled, precise, and urgent without visual panic.

Use:
- a strong label-lock header
- amber for blocked duplicate state
- red only for cross-delivery reuse or active custody risk
- one dominant recovery action
- a compact evidence strip showing safe context
- clear statement that custody did not move
- role-aware action row
- quiet admin-only registry links
- large touch targets for station staff

Do not use:
- generic `Something went wrong`
- success color
- raw scan code
- another delivery ID for field staff
- retry as the only option
- automatic submit after scan retry
- scanner animation that competes with the warning
- long registry internals in field UI
- route links that include scan-code query values

## Audience
Primary users:
- station operator receiving a package at origin
- station operator reviewing a blocked intake row
- station lead helping resolve label conflict
- support admin reviewing field issue context
- ops admin investigating package label registry and custody chain

Secondary users:
- driver or courier only when a repeated scan recovery uses the same shared state
- QA validating registry uniqueness behavior
- backend engineer validating error mapping
- security reviewer validating scan-code redaction
- accessibility reviewer validating interruptive duplicate state behavior
- Claude Code implementing the shared state later

Non-users:
- sender
- receiver
- unauthenticated visitor
- payment provider
- finance-only admin
- unrelated station staff

## Non-Goals
Do not use duplicate package label for:
- camera permission denial
- blurry scanner frame before a value is read
- unsupported barcode format before submission
- package scan mismatch with no reuse evidence
- normal loading state
- generic API error
- payment blocker
- active issue lock
- proof required
- receiver OTP required
- role authorization failure
- session expiry
- package label printing
- package label reprint approval
- label rebinding
- manual custody exception decision

Use `scan_mismatch` when the immediate product meaning is wrong package for the current action. Use `duplicate_package_label` when the product meaning is label reuse, same-step duplicate scan, already-received state, or immutable binding conflict.

## State Definition
`duplicate_package_label` is active when the client or backend has evidence that the scanned label cannot be accepted because it is already bound, already received, or already recorded for the protected operation.

Canonical triggers:
- backend returns `PACKAGE_SCAN_MISMATCH` with metadata indicating `boundDeliveryId` differs from selected delivery
- backend returns `PACKAGE_ALREADY_RECEIVED`
- backend returns `DUPLICATE_SCAN`
- station intake detects local outbox already has the same label scan code pending for another delivery
- offline replay rejects queued intake because the label was bound before sync completed
- package label repository returns an existing label for another delivery during origin intake
- current delivery already has a confirmed intake or receipt event and the user repeats the action
- admin review opens a delivery blocker classified as label reuse

Non-canonical triggers:
- scanner has not read a code yet
- camera cannot focus
- scan code length is invalid before submit
- network fails before registry validation
- offline state prevents validation and no local conflict exists
- user is outside station scope
- custody owner is wrong but no duplicate label evidence exists
- user lacks permission to view delivery

## Duplicate Outcome Taxonomy
| Outcome | UI State | Meaning | Primary Recovery |
| --- | --- | --- | --- |
| `cross_delivery_label` | `duplicate_package_label` | scanned label is already bound to another delivery | `Report issue` |
| `same_delivery_duplicate_scan` | `duplicate_package_label` | same delivery and step already recorded this scan | `Open custody chain` |
| `already_received_origin` | `duplicate_package_label` | origin intake already happened | `View handoff log` |
| `already_received_destination` | `duplicate_package_label` | destination receipt already happened | `Open custody chain` |
| `offline_replay_conflict` | `duplicate_package_label` | queued action synced after another accepted action | `Open action recovery` |
| `local_outbox_duplicate` | `duplicate_package_label` | local device has conflicting pending label use | `Open offline outbox` |
| `unknown_registry_conflict` | `duplicate_package_label` | backend blocked label use but safe detail is limited | `Contact support` |
| `unregistered_scan` | `scan_mismatch` | label is not registered for any delivery | `Scan again` |
| `wrong_delivery_context` | `scan_mismatch` | label does not match current delivery but reuse is not the main state | `Scan again` |

## Entry Rules
Enter duplicate package label when:
- an intake attempt tried to reserve a label and backend says it belongs elsewhere
- a protected scan was replayed and backend rejects it as duplicate
- host screen knows the delivery has already completed the protected receipt step
- local outbox detects a label code collision before sync
- admin opens a blocked row with label reuse classification
- package label already used modal needs a full-page state host

Do not enter when:
- no scan value exists
- scan value has not been submitted or locally checked
- scan format validation failed only on length or unsupported format
- user can simply scan again and there is no reuse signal
- payment state blocks progress
- issue lock blocks progress
- route guard blocks access
- custody owner mismatch is the only problem

## Exit Rules
Exit duplicate package label only when:
- user routes to custody chain
- user routes to issue creation
- user routes to admin package detail
- user routes to admin package label registry
- user returns to safe parent queue
- user opens offline action recovery
- user dismisses the modal into a non-submitting scanner state
- parent delivery refresh proves the duplicate state no longer applies

Never exit into:
- a success state for the rejected action
- automatic resubmission
- custody transfer confirmation
- package label print
- package label reprint
- direct label edit
- hidden background retry

## Relationship To Package Label Already Used Modal
`PackageLabelAlreadyUsedModal` is the modal implementation for many duplicate label cases.

`SharedDuplicatePackageLabelState` is the shared state contract that can render as:
- full-screen mobile state
- scanner overlay state
- modal body state
- admin panel state
- offline outbox recovery state
- blocked queue row detail state

Use the modal when:
- the user is inside a scanner or intake flow
- the host can stay in place safely
- the duplicate event is immediate and recoverable

Use the full shared state when:
- the parent screen is a blocked queue
- the parent screen is an admin evidence review
- the state persists across refresh
- offline replay created a failed queued action
- the user opened a deep link to a blocker

## Relationship To Scan Mismatch
`scan_mismatch` is for wrong or unregistered scan in the current action context.

`duplicate_package_label` is for immutable label reuse or duplicate protected action.

Decision rules:
- If backend says `scan code is not registered`, show `scan_mismatch`.
- If backend says `scan code is bound to a different delivery`, prefer `duplicate_package_label` during intake and admin review.
- If backend says `this package was already received`, show `duplicate_package_label`.
- If backend says `same scan event was already recorded`, show `duplicate_package_label`.
- If scanner only saw multiple barcodes or unclear barcode, keep scanner helper state.
- If the user selected wrong delivery but the label itself is valid elsewhere, show `scan_mismatch` first unless backend metadata confirms reuse.

## Backend Reality
Implemented backend facts:
- `PackageLabelRecord` includes `scanCode`, `deliveryId`, `trackingCode`, `originStationId`, `destinationStationId`, `createdAt`, `createdByUserId`, and `createdByRole`.
- `PackageLabelRepository` exposes `getByScanCode(scanCode)` and `reserveForDelivery(label)`.
- `reservePackageLabelForDelivery` creates or returns a label record through the repository.
- If the returned label belongs to another delivery, `assertLabelMatchesDelivery` throws `PACKAGE_SCAN_MISMATCH`.
- `assertPackageScanMatchesDelivery` rejects unregistered scans and labels bound to another delivery.
- Package label collection is `package_labels` in backend implementation.
- Station intake uses `labelScanCode`.
- Later handoff scans use `packageScanCode`.

Current frontend implication:
- The frontend should treat `PACKAGE_SCAN_MISMATCH` with cross-delivery metadata as a duplicate label state when the attempted action is origin intake.
- The frontend must not require a dedicated `DUPLICATE_PACKAGE_LABEL` backend code in v1.
- The frontend can map `PACKAGE_ALREADY_RECEIVED` and `DUPLICATE_SCAN` into this state.
- The frontend must not show `boundDeliveryId` to field staff.
- The frontend must not read package label registry directly from the client.
- The frontend must not store raw scan code in analytics.

## Error Code Mapping
| Backend code | State mapping | Field message | Admin message |
| --- | --- | --- | --- |
| `PACKAGE_SCAN_MISMATCH` with bound delivery evidence | `duplicate_package_label` at intake | `This label is already tied to another delivery.` | `Label binding conflict detected.` |
| `PACKAGE_SCAN_MISMATCH` without bound delivery evidence | `scan_mismatch` | `This scan code does not match this delivery.` | `Package scan mismatch.` |
| `PACKAGE_ALREADY_RECEIVED` | `duplicate_package_label` | `This package was already received.` | `Duplicate receive attempt blocked.` |
| `DUPLICATE_SCAN` | `duplicate_package_label` | `This package scan was already recorded.` | `Duplicate scan event blocked.` |
| `CONFLICTING_HANDOFF_STATE` with label collision | `duplicate_package_label` or `manual_review_required` | `This package needs review before it can move.` | `Conflicting handoff state with label evidence.` |
| `ISSUE_LOCK_ACTIVE` | `blocked_by_issue` | `This delivery is locked while an issue is being reviewed.` | `Issue lock active.` |
| `VALIDATION_ERROR` | `error` or form field error | `Some required information is missing or invalid.` | `Validation failed.` |
| `STATION_SCOPE_VIOLATION` | `not_authorized` | `This delivery is outside your station scope.` | `Station scope violation.` |

## State Variants
| Variant | Applies when | Tone | Primary action |
| --- | --- | --- | --- |
| `label_bound_elsewhere` | same scan code belongs to another delivery | severe | `Report issue` |
| `label_already_on_this_delivery` | label is already bound to selected delivery | caution | `Open custody chain` |
| `intake_already_done` | origin intake already recorded | caution | `View handoff log` |
| `receipt_already_done` | destination receipt already recorded | caution | `Open custody chain` |
| `duplicate_step_scan` | current handoff step already has accepted scan | caution | `Open custody chain` |
| `offline_conflict` | queued action failed after replay | severe | `Open action recovery` |
| `local_outbox_collision` | local pending actions use same label | severe | `Open offline outbox` |
| `admin_registry_conflict` | admin sees label conflict evidence | investigative | `Open package detail` |
| `safe_detail_limited` | backend blocks action without safe conflict detail | cautious | `Contact support` |

## Role-Based Disclosure
| Role | Can see state | Can see raw scan code | Can see bound delivery ID | Can open registry | Preferred action |
| --- | --- | --- | --- | --- | --- |
| `station_operator` | Yes | No | No | No | `Report issue` or `Open custody chain` |
| `station_lead` | Yes when role exists in app policy | No | No | No | `Report issue` |
| `driver` | Limited repeated-scan recovery only | No | No | No | `Open custody chain` |
| `final_mile_courier` | Limited repeated-scan recovery only | No | No | No | `Open custody chain` |
| `support_admin` | Yes | No by default | Safe delivery link when authorized | Maybe when permission exists | `Open admin review` |
| `ops_admin` | Yes | No by default | Yes when route permission allows | Yes | `Open package detail` |
| `super_admin` | Yes | Only through future audited reveal flow | Yes | Yes | `Open label registry` |
| `sender` | No | No | No | No | Not applicable |
| `receiver` | No | No | No | No | Not applicable |

Raw scan-code reveal is not part of this state in v1.

## Information Architecture
The state has five regions:

1. Status header
- lock icon
- title
- short blocked statement
- duplicate label severity

2. Evidence strip
- selected delivery tracking code
- attempted action
- station or route context
- last confirmed custody owner when available
- safe label reference only when provided

3. Custody truth card
- `No new custody movement was recorded.`
- last known owner
- last confirmed event time
- next safe action

4. Recovery actions
- primary evidence route
- secondary issue or support route
- safe back route
- admin route when allowed

5. Privacy and audit notice
- no raw scan code shown
- duplicate event tracked without exposing value
- custody remains unchanged until backend confirms a valid handoff

## Component Anatomy
`SharedDuplicatePackageLabelState` should compose:

- `StateShell`
- `DuplicateLabelLockCard`
- `DuplicateLabelEvidenceStrip`
- `DuplicateLabelCustodyNotice`
- `DuplicateLabelRecoveryActions`
- `DuplicateLabelAdminRoutePanel`
- `DuplicateLabelOfflineReplayPanel`
- `DuplicateLabelAuditWarning`
- `DuplicateLabelPrivacyGuard`

Recommended DOM or native order:
1. heading
2. severity text
3. custody notice
4. evidence strip
5. recovery actions
6. admin-only panel
7. privacy notice
8. support text

## Visual System
Base palette:
- background: `label.paper.50`
- foreground: `label.ink.950`
- supporting text: `label.slate.700`
- muted text: `label.slate.500`
- warning: `label.amber.700`
- severe: `label.red.700`
- safe route: `label.blue.700`
- border: `neutral.200`
- focus: `focus.ring`

Layout:
- mobile: single-column card, sticky action footer when content scrolls
- tablet: centered state panel with compact evidence strip
- admin web: split panel with left evidence summary and right action rail
- scanner overlay: bottom sheet with title, custody notice, and two actions

Spacing:
- header gap: `12`
- section gap: `20`
- action gap: `12`
- card padding mobile: `20`
- card padding desktop: `28`
- footer safe-area padding on mobile

## Tone And Copy Principles
Copy must be:
- direct
- operational
- non-accusatory
- specific about the blocked action
- clear that custody did not move
- careful with sensitive data

Copy must not:
- blame the station operator
- imply fraud without investigation
- expose another delivery identity to field roles
- tell user to compare raw codes
- say the package is lost
- say action succeeded
- encourage repeated submission

## Canonical Copy
### Default Title
```text
Package label already used
```

### Cross-Delivery Field Body
```text
This label is already tied to another delivery. Intake has stopped and custody did not change.
```

### Same-Delivery Duplicate Body
```text
This scan was already recorded for this delivery. Check custody history before continuing.
```

### Already Received Body
```text
This package was already received. Open the custody chain to confirm the last recorded owner.
```

### Offline Replay Body
```text
This queued action could not sync because the label was already used before replay completed.
```

### Admin Body
```text
The package label registry rejected this action because the scan binding conflicts with the selected delivery.
```

### Custody Notice
```text
No new custody movement was recorded from this attempt.
```

### Privacy Notice
```text
Raw label codes stay hidden. Use the custody chain or registry review for investigation.
```

## Variant Copy Matrix
| Variant | Title | Body | Primary action |
| --- | --- | --- | --- |
| `label_bound_elsewhere` | `Package label already used` | `This label is already tied to another delivery. Intake has stopped and custody did not change.` | `Report issue` |
| `label_already_on_this_delivery` | `Label already bound` | `This label is already registered to this delivery. Check custody history before continuing.` | `Open custody chain` |
| `intake_already_done` | `Package already received` | `Origin intake was already recorded for this package.` | `View handoff log` |
| `receipt_already_done` | `Package already received` | `Destination receipt was already recorded for this package.` | `Open custody chain` |
| `duplicate_step_scan` | `Scan already recorded` | `This handoff scan was already accepted. Review the custody chain before trying again.` | `Open custody chain` |
| `offline_conflict` | `Queued action blocked` | `This queued action could not sync because the label was already used before replay completed.` | `Open action recovery` |
| `local_outbox_collision` | `Label already queued` | `Another pending action on this device is using this label. Resolve the queued action first.` | `Open offline outbox` |
| `admin_registry_conflict` | `Label conflict detected` | `The registry rejected this action because the label binding conflicts with the selected delivery.` | `Open package detail` |
| `safe_detail_limited` | `Label could not be used` | `This label cannot be accepted for this action. Contact support before moving the package.` | `Contact support` |

## Action Hierarchy
Default action order:
1. `Open custody chain`
2. `Report issue`
3. `Contact support`
4. `Back to queue`
5. `Scan another label`

Cross-delivery label order:
1. `Report issue`
2. `Open custody chain`
3. `Back to queue`
4. `Contact support`

Already received order:
1. `Open custody chain`
2. `View delivery`
3. `Back to queue`

Offline replay order:
1. `Open action recovery`
2. `Open custody chain`
3. `Back to queue`

Admin order:
1. `Open package detail`
2. `Open custody chain`
3. `Open label registry`
4. `Open admin review`

Primary action rules:
- Never use `Retry submit` as primary action.
- Never use `Continue` as primary action.
- Never use `Print label` as primary action.
- Never use `Rebind label` anywhere.
- `Scan another label` is allowed only if the attempted action can safely restart.
- `Open label registry` is visible only for authorized admin surfaces.

## Navigation Routes
Use existing route contracts:

- station intake: `/(ops)/station/intake/:deliveryId`
- station intake queue: `/(ops)/station/intake`
- station intake confirmation: `/(ops)/station/intake/:deliveryId/confirmation`
- station blocked queue: `/(ops)/station/blocked`
- delivery detail: `/(ops)/deliveries/:deliveryId`
- custody chain: `/(ops)/deliveries/:deliveryId/custody`
- issue create: `/(ops)/deliveries/:deliveryId/issues/new`
- offline outbox: `/(ops)/offline-outbox`
- offline action recovery: `/(ops)/offline-outbox/:queuedActionId/recover`
- station support: `/(ops)/station/support?deliveryId=:deliveryId`
- admin package detail: `/admin/deliveries/:deliveryId/package`
- admin package label registry: `/admin/package-labels`
- admin manual custody exception: `/admin/custody-exceptions/:issueId`

Route safety:
- do not put `scanCode`, `labelScanCode`, or `packageScanCode` in route params
- do not put raw scan code in query string
- pass only safe `deliveryId`, `issueId`, `queuedActionId`, `source`, and `reason`
- use `reason=duplicate_package_label` when route accepts safe reason
- sanitize any host route that already contains raw scan data
- preserve parent return route only when it is in the same allowed app shell

## Route Payloads
### Issue Create Payload
Safe context:
```ts
type DuplicateLabelIssueContext = {
  deliveryId: string;
  category: "handoff" | "loss";
  severity: "high";
  source: "duplicate_package_label";
  attemptedAction: "origin_intake" | "dispatch_scan" | "destination_receipt" | "final_mile_acceptance" | "offline_replay";
  safeLabelReference?: string;
  lastKnownCustodyRole?: string;
  lastKnownCustodyActorId?: string;
  occurredAt: string;
};
```

Forbidden context:
- raw scan code
- bound delivery ID for field roles
- provider payment reference
- receiver phone
- receiver address
- unredacted audit metadata

### Admin Route Payload
Safe admin context:
```ts
type DuplicateLabelAdminContext = {
  deliveryId: string;
  source: "duplicate_package_label";
  issueId?: string;
  safeLabelReference?: string;
  conflictKind: "cross_delivery" | "same_delivery_duplicate" | "already_received" | "offline_replay";
};
```

Admin context still must not include raw scan code.

## Component Props
```ts
type DuplicateLabelVariant =
  | "label_bound_elsewhere"
  | "label_already_on_this_delivery"
  | "intake_already_done"
  | "receipt_already_done"
  | "duplicate_step_scan"
  | "offline_conflict"
  | "local_outbox_collision"
  | "admin_registry_conflict"
  | "safe_detail_limited";

type DuplicateLabelActorRole =
  | "station_operator"
  | "driver"
  | "final_mile_courier"
  | "support_admin"
  | "ops_admin"
  | "super_admin";

type SharedDuplicatePackageLabelStateProps = {
  variant: DuplicateLabelVariant;
  deliveryId?: string;
  trackingCode?: string;
  actorRole: DuplicateLabelActorRole;
  attemptedAction: string;
  currentCustodyRole?: string;
  currentCustodyActorLabel?: string;
  lastConfirmedEventAt?: string;
  safeLabelReference?: string;
  issueId?: string;
  queuedActionId?: string;
  canOpenCustodyChain: boolean;
  canReportIssue: boolean;
  canContactSupport: boolean;
  canOpenAdminPackageDetail: boolean;
  canOpenLabelRegistry: boolean;
  canOpenOfflineRecovery: boolean;
  onOpenCustodyChain?: () => void;
  onReportIssue?: () => void;
  onContactSupport?: () => void;
  onBackToQueue?: () => void;
  onScanAnotherLabel?: () => void;
  onOpenAdminPackageDetail?: () => void;
  onOpenLabelRegistry?: () => void;
  onOpenOfflineRecovery?: () => void;
  onDismiss?: () => void;
};
```

Prop rules:
- `safeLabelReference` must be server-generated or locally redacted.
- `safeLabelReference` must never equal raw scan code.
- `trackingCode` may render for staff and admin roles with delivery access.
- `deliveryId` may render for admin; field UI should prefer tracking code.
- `boundDeliveryId` is not a prop for this component.
- route callbacks must be supplied by host screens.
- no callback should submit the same mutation again.

## Local Derivation API
Host screens can derive this state using:

```ts
type DuplicateLabelInput = {
  errorCode?: string;
  errorMetadata?: Record<string, unknown>;
  attemptedAction: string;
  deliveryId?: string;
  currentStatus?: string;
  queuedActionId?: string;
  hasLocalOutboxCollision?: boolean;
  role: string;
};

type DuplicateLabelDerivation = {
  shouldShowDuplicateLabel: boolean;
  variant?: DuplicateLabelVariant;
  sourceCode?: string;
};
```

Derivation rules:
- `PACKAGE_ALREADY_RECEIVED` maps to `intake_already_done` or `receipt_already_done` based on attempted action.
- `DUPLICATE_SCAN` maps to `duplicate_step_scan`.
- `PACKAGE_SCAN_MISMATCH` maps here only when metadata or host context indicates label reuse.
- `hasLocalOutboxCollision` maps to `local_outbox_collision`.
- offline replay failure maps to `offline_conflict`.
- otherwise keep the original state mapping.

## State Machine
```text
idle
  -> scan_submitted
  -> validating_label
  -> duplicate_detected
  -> duplicate_state_visible
  -> recovery_route_pending
  -> recovery_route_opened

duplicate_state_visible
  -> scan_again_ready
  -> scanner_idle

duplicate_state_visible
  -> issue_route_pending
  -> issue_create_opened

duplicate_state_visible
  -> custody_route_pending
  -> custody_chain_opened

duplicate_state_visible
  -> admin_route_pending
  -> admin_review_opened

duplicate_state_visible
  -> route_failed
  -> duplicate_state_visible
```

Forbidden transitions:
- `duplicate_detected -> success`
- `duplicate_state_visible -> package_label_print`
- `duplicate_state_visible -> confirm_handoff`
- `duplicate_state_visible -> rebind_label`
- `offline_conflict -> confirmed`
- `route_failed -> hidden_success`

## Mobile Layout
Mobile full-screen state:
- top safe area
- compact title row with lock icon
- one-line severity badge
- title
- body
- custody notice
- evidence strip
- primary action
- secondary action stack
- privacy note
- support line

Mobile scanner overlay:
- bottom sheet from scanner host
- title no longer than two lines
- `No custody changed` notice visible above actions
- primary action fixed at bottom
- `Scan another label` only after user chooses it
- camera preview paused behind overlay
- focus goes to title when opened
- background scanner controls are inert

Mobile blocked queue detail:
- persistent state card in row detail
- recovery actions in row action area
- route to custody chain and issue create
- do not expose scan value in row title

## Admin Web Layout
Admin web state:
- constrained evidence panel inside admin shell
- left column: status, selected delivery, attempted action, last custody
- right column: recovery actions and registry boundary
- table-compatible compact variant for issue queues
- deep links to package detail and custody chain
- label registry link only when registry route permission exists

Admin web should feel like an investigation control:
- dense enough for experienced operators
- restrained enough to avoid noise
- exact about what is known and what is not known
- honest when direct registry endpoint is unavailable

## Empty And Missing Data Behavior
If delivery ID is missing:
- show `Delivery context is missing. Return to the queue and reopen the package.`
- primary action: `Back to queue`
- hide custody and issue routes

If last custody is missing:
- show `Current custody is unavailable. Open custody chain to verify.`
- primary action: `Open custody chain` if route exists
- show caution style

If safe label reference is missing:
- do not render label reference row
- show privacy note
- keep route actions available

If issue route is unavailable:
- hide `Report issue`
- show `Contact support` when available

If admin registry route is unavailable:
- hide `Open label registry`
- show admin boundary text:
```text
Direct registry lookup is not available in this console yet.
```

## Offline And Outbox Rules
Offline rules:
- never mark duplicate label action as successful from local state
- local outbox must block a second queued action using the same label value when safe local comparison exists
- queued action replay that returns conflict must become `offline_conflict`
- offline conflict must remain visible until user opens recovery or clears the failed queued action through policy
- show sync timestamp and queue ID when safe
- do not show raw scan code from queued payload

Offline copy:
```text
This queued action did not sync because the label was already used before replay completed.
```

Outbox row status:
- `blocked_duplicate_label`

Outbox row actions:
- `Open action recovery`
- `Open custody chain`
- `Report issue`
- `Back to queue`

Outbox recovery must never:
- silently delete the failed action
- submit a second intake
- change custody locally
- expose raw queued scan code

## Privacy And Security Rules
The component must not render:
- raw scan code
- full registry document path
- bound delivery ID for field roles
- receiver phone
- receiver address
- payment provider reference
- staff private notes
- unredacted proof references
- stack traces
- raw error metadata

The component may render:
- selected delivery tracking code
- selected delivery ID for admin roles
- redacted label fingerprint
- attempted action
- last confirmed custody role
- last confirmed custody actor label when already visible to that role
- station ID when already visible on the parent screen
- issue ID when route access allows

Data handling:
- scan values must stay in mutation body only
- scan values must not enter route params
- scan values must not enter analytics payloads
- scan values must not enter toast text
- scan values must not enter crash report breadcrumbs
- scan values must not enter screenshot-friendly visible text

## Analytics
Event names:
- `duplicate_package_label_viewed`
- `duplicate_package_label_action_selected`
- `duplicate_package_label_issue_started`
- `duplicate_package_label_custody_opened`
- `duplicate_package_label_admin_opened`
- `duplicate_package_label_offline_recovery_opened`

Required properties:
- `deliveryId`
- `actorRole`
- `attemptedAction`
- `variant`
- `surface`
- `sourceErrorCode`
- `hasSafeLabelReference`
- `hasIssueId`
- `hasQueuedActionId`

Forbidden properties:
- `scanCode`
- `labelScanCode`
- `packageScanCode`
- `boundDeliveryId` for field roles
- receiver phone
- receiver address
- provider reference
- raw error message

Analytics rules:
- fire viewed event once per duplicate state presentation
- fire action event when user selects a recovery action
- do not fire repeated viewed events on re-render
- include route outcome only after route success or route failure
- scrub metadata before sending

## Accessibility Requirements
For modal rendering:
- use alert-dialog semantics
- focus title on open
- trap focus while modal is active
- return focus to invoking control on close when safe
- make background scanner inert
- support Escape only when a safe return action exists
- announce `No new custody movement was recorded from this attempt.`

For full-screen rendering:
- use one `h1`
- place status text immediately after heading
- actions must be reachable by keyboard and screen reader
- status updates must be announced through live region
- focus route errors back to the action group

Target sizes:
- primary action at least 44 by 44 CSS pixels
- secondary touch targets at least 44 by 44 CSS pixels
- destructive or severe actions separated by at least `12`

Motion:
- entrance can use short opacity and vertical transform
- no shaking animation
- no constant pulsing
- support reduced motion
- scanner overlay should pause camera animation behind state

Color:
- do not rely on amber or red alone
- include text label `Blocked`
- include lock icon or label marker
- maintain strong contrast for all text

## Content States
### Ready Duplicate State
Show:
- title
- duplicate reason
- custody unchanged notice
- safe evidence
- recovery actions
- privacy notice

Do not show:
- loading spinner
- retry submit
- success check

### Route Pending
Show:
- same state card
- disabled action buttons
- inline progress on selected action
- no duplicate toast

Copy:
```text
Opening recovery route...
```

### Route Failed
Show:
- route failure message
- original duplicate warning
- action retry for route only
- support action if available

Copy:
```text
Could not open that recovery route. The label is still blocked.
```

### Stale Context
Show:
- stale marker
- refresh action
- custody chain route if online

Copy:
```text
This conflict may have changed. Refresh before moving the package.
```

### Not Authorized
Use shared `not_authorized` state if the entire delivery is inaccessible.

If only registry route is unauthorized:
- keep duplicate state visible
- hide registry action
- show `Registry review is restricted to authorized admins.`

### Session Expired
Use shared `session_expired` state. Do not keep scan metadata visible after session expiry.

## Interaction Details
When user taps `Open custody chain`:
- close modal if modal host
- navigate to `/(ops)/deliveries/:deliveryId/custody`
- pass no raw scan value
- preserve return route if safe

When user taps `Report issue`:
- navigate to `/(ops)/deliveries/:deliveryId/issues/new`
- pass safe duplicate context
- category should be `handoff` unless host has a stronger `loss` classification
- severity should default to `high`

When user taps `Contact support`:
- navigate to `/(ops)/station/support?deliveryId=:deliveryId`
- pass safe reason in state, not raw scan code

When user taps `Back to queue`:
- return to station intake queue or blocked queue based on source
- do not keep scanner active in background

When user taps `Scan another label`:
- clear rejected scan from local field state
- leave delivery context intact
- resume scanner only after user intent
- never submit automatically

When admin taps `Open package detail`:
- navigate to `/admin/deliveries/:deliveryId/package`
- include no raw scan query

When admin taps `Open label registry`:
- navigate to `/admin/package-labels`
- use safe filters only such as `deliveryId` or `trackingCode`
- do not include scan-code query values

When admin taps `Open admin review`:
- navigate to `/admin/custody-exceptions/:issueId` when issue ID exists
- otherwise use package detail and show issue creation action

## Form And Scanner Integration
Station intake integration:
- when `confirm_intake` rejects label reuse, replace submit area with duplicate state
- keep measured weight, size tier, and condition in memory until user leaves
- do not clear all form data automatically
- clear rejected `labelScanCode` only when user chooses `Scan another label`
- show custody unchanged notice above form controls
- disable submit while duplicate state is active

Scan package modal integration:
- pause scanner
- render duplicate state inside modal body
- keep camera permission state
- return to scanner only on explicit action

Blocked queue integration:
- show persistent duplicate label card
- include last failed action timestamp
- include issue link when available
- include custody route

Admin package detail integration:
- show duplicate label evidence panel
- route to custody chain and registry boundary
- avoid raw scan display

## State Persistence
Persist:
- variant
- attempted action
- source error code
- failed queued action ID
- issue ID when created
- last seen timestamp
- safe label reference when provided

Do not persist:
- raw scan code in UI storage
- full backend error metadata
- bound delivery ID in field storage
- camera frame
- scanner buffer

Storage rules:
- field state may keep duplicate status in memory
- offline outbox may store mutation body per existing encrypted or protected persistence policy
- visible duplicate state must read only safe projection
- admin state can read safe server response

## Error Recovery
If route action fails:
- keep duplicate state visible
- show route error
- allow route retry
- provide support fallback

If refresh succeeds and duplicate no longer applies:
- return to parent screen ready state
- do not auto-submit
- show refreshed status

If refresh fails:
- keep duplicate state visible
- show stale warning
- preserve safe actions

If issue creation fails:
- keep duplicate state visible
- show issue failure text
- allow retry of issue route
- do not repeat intake mutation

If admin registry route is not available:
- show admin boundary
- provide package detail and custody chain actions

## Severity Rules
Severity `warning`:
- same-delivery duplicate scan
- intake already done
- receipt already done

Severity `severe`:
- label bound to another delivery
- local outbox collision
- offline replay conflict
- conflict with unknown safe detail

Severity `investigative`:
- admin registry conflict
- admin package detail evidence panel

Visual mapping:
- warning uses amber
- severe uses red accent plus lock marker
- investigative uses charcoal plus amber signal

## Custody Truth Rules
Always state whether custody changed.

If backend rejected action:
```text
No new custody movement was recorded from this attempt.
```

If offline action failed on replay:
```text
The queued action did not become a confirmed custody event.
```

If current custody known:
```text
Current recorded custody: {currentCustodyRole}
```

If current custody unknown:
```text
Current custody is unavailable. Open custody chain to verify.
```

Never say:
- `Package accepted`
- `Custody updated`
- `Delivery received`
- `Pickup confirmed`
- `Assignment accepted`
- `Ready to dispatch`

unless backend has returned the relevant success response from a separate valid action.

## Copy For Field Staff
Short field card:
```text
Package label already used
This label cannot be used for this delivery. No custody movement was recorded.
```

Long field card:
```text
Package label already used
This label is already tied to another delivery. Stop intake and report the issue before moving the package.
```

Same delivery:
```text
Scan already recorded
This scan was already accepted for this delivery. Open custody chain to confirm the next step.
```

Already received:
```text
Package already received
This package was already received. Check the handoff log before continuing.
```

Offline:
```text
Queued action blocked
This queued action could not sync because the label was already used before replay completed.
```

## Copy For Admins
Admin panel:
```text
Label conflict detected
The package label registry rejected this action because the scan binding conflicts with the selected delivery.
```

Admin registry boundary:
```text
Direct registry lookup is not available in this console yet. Use package detail and custody chain for current evidence.
```

Admin privacy notice:
```text
Raw scan codes are hidden by default. Use audited registry tooling when a future reveal workflow is approved.
```

Admin action note:
```text
Investigate the selected delivery. Do not reassign the package label from this state.
```

## Design Quality Bar
This state must feel like a premium operations control:
- exact status label
- calm but strict visual treatment
- no overloaded paragraphs
- no hidden critical text below the fold on mobile
- one obvious next action
- evidence before action
- privacy note after evidence
- admin controls separated from field controls
- consistent with scan mismatch and blocked issue states

The signature detail:
- a lock strip reading `This label cannot be used again` with a small `No custody changed` secondary line.

The restraint rule:
- never expose internal registry details just to make the state feel technical.

## Implementation Notes For Claude Code
Build `SharedDuplicatePackageLabelState` as a shared state component, not as a one-off station screen fragment.

Required implementation structure:
- export component from shared state library
- support mobile and admin density props
- support modal and full-screen rendering
- accept route callbacks from host screens
- never import navigation directly into the shared component
- use design-system tokens
- reuse shared button, banner, state shell, and alert primitives
- map backend errors through a small pure derivation helper
- keep raw scan values outside component props

Suggested file ownership:
- shared component: `components/states/SharedDuplicatePackageLabelState`
- derivation helper: `features/package-labels/deriveDuplicateLabelState`
- mobile integration: station intake, scan package modal, blocked queue
- admin integration: package detail, package label registry boundary, custody exception
- tests: shared component tests plus integration tests on critical hosts

Do not add:
- frontend-only label rebind
- direct Firestore read
- raw scan-code display
- raw scan-code route query
- repeated mutation retry button
- success state from local duplicate detection

## Integration Checklist
Station package intake:
- map duplicate intake response to this state
- disable submit while visible
- preserve safe form data
- clear scan only on explicit rescan
- route issue creation with safe context
- show custody unchanged notice

Scan package modal:
- pause scanner while visible
- render alert-dialog mode
- return to scanner only on `Scan another label`
- keep background inert

Station blocked queue:
- classify row as duplicate label blocker
- show route to custody chain
- show route to issue create
- show outbox recovery when queued action exists

Operations custody chain:
- link back from duplicate state
- highlight last accepted scan event
- keep raw label values redacted

Admin package detail:
- render admin panel variant
- link to custody chain
- link to registry route only when available
- show registry boundary if endpoint missing

Admin package label registry:
- support safe `deliveryId` and `trackingCode` filters
- reject raw scan query params
- use unavailable state until backend endpoint exists

Offline outbox:
- classify replay failure as `blocked_duplicate_label`
- preserve failed queued action safely
- never resubmit automatically

## Test Requirements
Unit tests:
- renders default duplicate title
- renders cross-delivery field copy without bound delivery ID
- renders same-delivery duplicate copy
- renders already received copy
- renders offline replay copy
- hides label registry action for station operator
- shows label registry action for authorized admin
- never renders raw scan-code prop because raw scan code is not accepted
- disables submit actions while visible
- announces custody unchanged notice

Derivation tests:
- maps `PACKAGE_ALREADY_RECEIVED` to already received variant
- maps `DUPLICATE_SCAN` to duplicate step scan variant
- maps cross-delivery `PACKAGE_SCAN_MISMATCH` to label bound elsewhere
- maps unregistered `PACKAGE_SCAN_MISMATCH` to scan mismatch instead
- maps local outbox collision to local outbox variant
- maps offline replay conflict to offline conflict

Integration tests:
- station intake duplicate label opens state and blocks submit
- station intake issue route receives safe context only
- scanner overlay pauses camera behind alert state
- blocked queue opens custody chain from duplicate row
- offline outbox failed action routes to recovery
- admin package detail opens package label registry only when authorized
- admin registry route removes raw scan query params

Accessibility tests:
- alert-dialog has labelled title
- focus lands on title or first safe action
- keyboard can reach all actions
- Escape behavior follows host policy
- route failure is announced
- reduced motion removes entrance transform
- target sizes pass mobile threshold

Privacy tests:
- no raw scan code in rendered text
- no raw scan code in analytics payload
- no raw scan code in route
- no receiver phone or address
- no bound delivery ID for station role
- no raw backend metadata displayed

## Acceptance Criteria
The state is complete when:
- every supported variant renders clear copy
- no duplicate label event can proceed to success from this component
- field roles see no raw scan code or other-delivery identity
- admins get safe investigation routes
- route contracts match inventory and existing specs
- offline replay conflicts remain blocked until recovered
- scanner and submit controls are paused while state is active
- issue creation receives only safe context
- analytics excludes scan values
- accessibility behavior works in modal and full-screen modes
- tests cover error mapping, action visibility, privacy, and route safety

## Anti-Patterns To Reject
Reject implementation if it:
- treats duplicate label as normal form validation
- shows `Try again` as the only action
- exposes raw scan code to field staff
- exposes another delivery ID to field staff
- routes registry lookup with raw scan query
- lets station staff rebind label
- prints a new label from duplicate state
- clears all intake form data without user action
- marks queued action as successful after replay conflict
- hides custody unchanged copy
- uses vague copy like `Unable to process`
- sends scan code to analytics
- retries mutation in background

## QA Scenarios
### Origin Intake Cross-Delivery Label
Given station operator is on `/(ops)/station/intake/:deliveryId`
When `confirm_intake` returns cross-delivery label conflict
Then duplicate package label state appears
And submit is disabled
And custody unchanged notice appears
And primary action is `Report issue`
And raw scan value is not visible

### Same Delivery Repeat
Given delivery already has origin intake event
When station attempts same intake again
Then state title is `Package already received`
And primary action is `Open custody chain`
And no new custody event is shown

### Offline Replay Conflict
Given queued intake action replays later
When backend rejects because label is already bound
Then outbox row status becomes `blocked_duplicate_label`
And duplicate state opens from action recovery
And no confirmed intake state appears

### Admin Review
Given ops admin opens package detail for a delivery with label conflict
When duplicate state renders in admin panel
Then package detail and custody chain actions are visible
And package label registry action is visible only when permission exists
And raw scan code is not visible

### Registry Route Safety
Given a route tries to open `/admin/package-labels?scanCode=value`
When registry screen loads
Then raw scan parameter is removed
And duplicate label state never displays that value

## Observability
Operational metrics:
- duplicate label events per station
- duplicate label events per attempted action
- offline replay conflicts
- issue creation rate from duplicate state
- custody chain open rate from duplicate state
- admin registry open rate
- repeated duplicate attempts by device

Alerting:
- spike in cross-delivery duplicate labels by station
- repeated local outbox collisions on one device
- duplicate label state with no recovery action available
- duplicate label issue creation failures
- raw scan-code scrubber violation in client telemetry

Dashboard grouping:
- station ID
- attempted action
- actor role
- variant
- source error code
- app version
- online or offline origin

## Launch Readiness
Before pilot:
- station intake uses this state for label reuse
- blocked queue can show duplicate label blockers
- issue route supports safe duplicate context
- custody chain opens from duplicate state
- offline outbox classifies replay conflict
- analytics scrubber is tested
- privacy tests prove scan values are not rendered
- admin package detail has safe investigation panel
- package label registry route rejects raw scan params

Before scale:
- admin package label registry endpoint exists or unavailable state remains explicit
- support playbook covers duplicate label triage
- station training covers `No custody changed`
- device logs prove scan-code scrubbing
- operations dashboard monitors duplicate label spikes
- QA covers low-bandwidth replay conflict

## Open Backend Boundaries
Current backend does not expose a dedicated public `DUPLICATE_PACKAGE_LABEL` error code. The frontend should map existing approved codes through context.

Current admin package label registry endpoint is not implemented. Admin UI should route to existing package detail and custody chain, and show registry boundary until backend adds a read-only endpoint.

Current raw scan-code reveal workflow is not approved. Do not design one in this state.

Current package label reprint is governed by a separate screen. Do not connect duplicate label state to reprint as an immediate recovery.

## Final Build Brief For Claude Code
Build `SharedDuplicatePackageLabelState` as the authoritative shared UI state for package label reuse, already-received package actions, duplicate protected scans, and offline replay label conflicts. It must block success, state that custody did not change, show safe role-based evidence, route users to custody chain, issue creation, support, offline recovery, admin package detail, or registry review when allowed, and never expose raw scan code or cross-delivery identity to field users. Integrate it first with station intake, scan package modal, station blocked queue, offline outbox recovery, admin package detail, and admin package label registry boundary.
