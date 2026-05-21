# Scan Mismatch State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `scan_mismatch` |
| Component family | Shared screen state |
| Primary component | `SharedScanMismatchState` |
| Supporting components | `ScanMismatchCard`, `ScanRetryActions`, `ScanEvidenceNotice`, `ScanAuditWarning`, `ScanContextStrip`, `ScanEscalationRoute`, `ScannerRecoveryHints`, `ScanPrivacyGuard` |
| Primary surfaces | operations mobile app, station operator mobile app, driver mobile app, final-mile courier mobile app, admin web console |
| Required recovery | scan again, open custody chain, escalate issue, contact station lead, or return to safe parent flow |
| Test id root | `state-scan-mismatch` |
| Backend coverage | `PACKAGE_SCAN_MISMATCH`, unregistered scan code, scan bound to another delivery, package-label validation failure, custody handoff scan validation |
| Browser mutation operation | None directly; the state blocks the attempted handoff, dispatch, receipt, or assignment acceptance until a valid scan or authorized fallback is completed |
| Data sensitivity | raw scan code, redacted scan reference, bound delivery context, delivery label, custody holder, station context, scanner source, audit event |
| Offline critical | Yes because a mismatched scan must not be queued as a successful handoff or dispatch event |
| Related inventory state | `scan_mismatch` |
| Related state specs | duplicate package label, custody not confirmed, blocked by issue, manual review required, offline, stale data, error, not authorized, session expired |
| Design tokens | `scan.red.700`, `scan.amber.600`, `scan.blue.600`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear mismatch status, large rescan controls, non-color risk labels, and accessible scanner recovery |

## Purpose
`SharedScanMismatchState` is the shared UI state shown when a scanned package label does not match the delivery or action context the user is trying to operate on.

This state must answer:
- `What went wrong with the scan?`
- `Is the package label unregistered or bound to another delivery?`
- `Can the user scan again?`
- `Should the user stop and escalate?`
- `What action is blocked?`
- `What is the audit risk?`
- `What information can be shown without exposing raw scan codes?`
- `How should station, driver, and courier roles recover safely?`

The most important rule is:
```text
A scan mismatch blocks custody movement until a valid scan or authorized fallback is completed.
```

## Product Job
Kra uses package scan codes as custody-critical physical evidence. A mismatch means the user may be holding the wrong package, scanning a label from another delivery, scanning an unregistered label, using a damaged label, or operating in the wrong delivery context.

The scan mismatch state must:
- stop the attempted action
- explain the mismatch in plain language
- offer `Scan again` as the first safe recovery
- route staff to custody chain when rescan does not solve it
- route station leads or support to escalation when needed
- keep raw scan code out of visible UI, URLs, analytics, and logs
- distinguish unregistered scan from scan bound to another delivery when role allows
- prevent offline queue from storing the action as successful
- preserve audit warning for custody-sensitive actions
- help the user recover without encouraging comparison of raw codes

## Strategic Role
Scan mismatch is one of the strongest loss-prevention states in Kra. It prevents wrong-package dispatch, wrong driver pickup, wrong destination receipt, wrong final-mile handoff, and false delivery completion.

The design must be strict:
- no action can proceed on mismatched scan
- no optimistic success after scanner detection
- no hidden bypass
- no raw code exposure
- no cross-delivery data leak

The design must also be practical:
- scanning errors happen in busy stations and low-light environments
- damaged labels need a safe route
- camera access can fail
- a supervisor fallback exists, but it must be explicit and audited

This state is not a generic scanner error. It is an evidence mismatch.

## External Research Used
Only directly relevant barcode, scanner, and accessibility references were used:
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports stable, scannable identifiers for physical goods movement and human-readable label alignment.
- [Google ML Kit barcode scanning for Android](https://developers.google.com/ml-kit/vision/barcode-scanning/android): supports mobile barcode scanning behavior, supported formats, auto-zoom, and camera guidance.
- [Apple VisionKit data scanning](https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera): supports iOS camera scanning guidance, recognized data capture, and user-facing scan interaction patterns.
- [W3C WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable large controls for scan again, fallback, and escalation.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible scan result announcements without unexpected focus movement.
- [W3C WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear mismatch explanation and recovery guidance.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-data/firestore-schema.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/api-contracts.md`
- `docs/06-architecture/backend-architecture.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/04-wrong-package-scanned-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/05-package-label-already-used-modal.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/04-station-package-intake.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/10-station-dispatch-readiness.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/11-station-driver-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `services/api/src/package-labels.ts`
- `services/api/src/service-errors.ts`
- `packages/shared/src/contracts/api.ts`

## Visual Thesis
Scan mismatch should feel like a precise physical-evidence stop sign, not a scanner malfunction.

Use:
- strong red or amber warning panel
- large `Scan again` action
- clear blocked action label
- short scanner recovery hints
- audit warning for custody-sensitive flows
- custody chain route for staff
- redacted scan reference only when safe
- camera-safe layout with thumb-friendly controls

Do not use:
- generic `Scan failed`
- raw scan code text
- another delivery ID in staff field UI unless policy permits the route
- hidden retry action
- green success language
- `Continue` after mismatch
- automatic scanner resume without user intent
- loud animation that distracts from physical package check

## Audience
Primary users:
- station operator scanning package at intake
- station operator preparing dispatch
- station operator confirming destination receipt
- driver confirming origin pickup
- final-mile courier accepting assigned package
- support or admin reviewing custody evidence

Secondary users:
- station lead handling repeated mismatch
- ops admin investigating custody chain
- QA validating scan-state behavior
- backend engineer validating error mapping
- accessibility reviewer validating scanner recovery
- Claude Code implementing the shared state later

Non-users:
- sender
- receiver
- unauthenticated visitor
- payment provider
- unrelated station staff

## Non-Goals
Do not use scan mismatch for:
- duplicate scan in the same step
- package label already used during intake when the dedicated duplicate label state is stronger
- camera permission denial
- camera unavailable
- barcode too blurry before submission
- empty scan input
- manual entry supervisor approval
- proof required
- OTP required
- payment blocker
- active issue lock
- role authorization failure
- session expiry
- generic API failure

Use `duplicate_package_label` when the product meaning is already-bound or duplicate label. Use `scan_mismatch` when the immediate task failed because the scanned physical label does not match the current delivery context.

## State Definition
`scan_mismatch` is active when the client or backend has a scan result, and that result cannot be accepted for the current delivery action.

Canonical triggers:
- backend returns `PACKAGE_SCAN_MISMATCH`
- backend says scan code is not registered
- backend says scan code is bound to a different delivery
- package-label validation fails before dispatch readiness
- package-label validation fails before driver pickup
- package-label validation fails before destination receipt
- package-label validation fails before final-mile assignment acceptance
- scanner flow detects local scan context mismatch before submit using already-loaded safe binding data

Non-canonical triggers:
- camera cannot read barcode yet
- camera permission is denied
- scan field is empty
- user cancels scanner
- manual entry requires supervisor approval
- duplicate scan event was already recorded in same step
- issue lock is active
- custody owner mismatch with no scan attempt

## Scan Outcome Taxonomy
| Outcome | UI State | Meaning | Primary Recovery |
| --- | --- | --- | --- |
| `wrong_delivery_binding` | `scan_mismatch` | scanned label is bound to another delivery | `Scan again` |
| `unregistered_scan` | `scan_mismatch` | scanned label is not registered in package labels | `Open custody chain` or `Scan again` |
| `wrong_action_context` | `scan_mismatch` | scan may be valid but not for this action context | `Scan again` |
| `duplicate_step_scan` | `duplicate_package_label` or duplicate scan handling | same scan event already recorded for this step | `View custody chain` |
| `camera_unreadable` | scanner active error | scanner has not produced reliable value | `Hold steady` |
| `camera_denied` | scanner permission state | app cannot access camera | `Allow camera` |
| `manual_entry_review` | manual review required | fallback requires supervisor review | `Request approval` |

## Entry Rules
Enter scan mismatch when:
- action submit returns `PACKAGE_SCAN_MISMATCH`
- scan validation endpoint returns mismatch for current delivery
- current flow expected delivery A and server says scan belongs to a different delivery
- current flow expected a registered label and server says no registered label exists
- local scanner helper has authoritative safe binding data that says the scan cannot belong to this delivery

Do not enter when:
- no scan value exists
- scan value is still being read
- camera permission is blocked
- network failed before validation
- offline state prevents validation
- user selected wrong delivery row before scanning
- scan is duplicate within same valid step

## Exit Rules
Exit scan mismatch when:
- user scans again and backend validates the scan
- user opens custody chain and parent route changes context
- user escalates to issue or review and backend returns new state
- user cancels scanner and returns to safe parent flow
- refresh shows current action no longer requires scan

Never exit because:
- user closes the warning without leaving scan flow
- scanner resumes automatically
- local timer expires
- raw scan code is typed again without validation
- user says package looks right
- station is busy
- network comes back online without validation

## Recovery Promise
The state must always offer a safe recovery path.

Recovery order:
1. `Scan again`
2. `Check package label`
3. `Open custody chain` when authorized
4. `Escalate issue` when repeated mismatch or high-risk context
5. `Request supervisor fallback` when policy allows
6. `Back to delivery`

If no specific route exists, show:
```text
This scan code does not match the delivery. Scan again or contact support.
```

## Role Behavior Matrix
| Role | What They See | Primary Action | Secondary Action |
| --- | --- | --- | --- |
| station_operator | mismatch reason, blocked action, rescan, custody route | `Scan again` | `Open custody chain` |
| station_lead | mismatch reason, audit warning, escalation route | `Scan again` | `Escalate issue` |
| driver | safe mismatch reason, route impact, station contact | `Scan again` | `Contact station` |
| final_mile_courier | safe mismatch reason, job impact | `Scan again` | `Return to assignments` |
| support_admin | mismatch record, delivery context, custody route | `Open custody chain` | `Open issue` |
| ops_admin | mismatch record, audit warning, escalation route | `Open custody chain` | `Escalate issue` |

## Privacy Rules
Always safe:
- safe reason label
- current delivery label
- current action name
- redacted scan reference if generated by backend and allowed
- retry guidance
- custody route label

Staff-safe:
- mismatch category
- station context
- actor role
- timestamp
- redacted scan fingerprint
- current expected delivery label

Admin-safe:
- full audit event
- bound delivery reference if policy allows
- label registry event
- actor ID
- service error metadata after redaction

Never show in this shared state:
- raw scan code
- raw label code
- another delivery tracking code in a field-level error
- other sender or receiver information
- full phone number
- full address
- registry document path
- raw service error metadata

## Raw Scan Code Rule
Raw scan code is custody evidence and must be treated as sensitive.

Rules:
- keep raw scan value only in scanner submit memory
- do not render raw scan value
- do not put raw scan value in route params
- do not put raw scan value in analytics
- do not write raw scan value to support summary
- do not store raw scan value in global client state
- do not copy raw scan value to clipboard
- do not include raw scan value in accessible labels
- do not send raw scan value to support routes except through approved backend mutation body

If backend returns a redacted fingerprint, label it:
```text
Scan reference redacted
```

## Content Hierarchy
Top hierarchy:
1. Title: `Scan does not match`
2. Reason: `This package scan code does not match the delivery.`
3. Blocked action: `Driver pickup is blocked`
4. Audit warning: `Do not move custody until the package is verified.`
5. Primary action: `Scan again`
6. Secondary route: `Open custody chain`
7. Recovery hints
8. Support or escalation route

The user must understand the package should not move.

## Default Copy
Default title:
```text
Scan does not match
```

Default body:
```text
This package scan code does not match the delivery.
```

Default blocked-action line:
```text
This action is blocked until a matching package label is scanned.
```

Default audit warning:
```text
Do not move or release this package until the scan is verified.
```

Default primary action:
```text
Scan again
```

Default secondary action:
```text
Open custody chain
```

## Outcome Copy
| Outcome | Title | Body | Primary Action |
| --- | --- | --- | --- |
| wrong delivery binding | `Wrong package scanned` | `The scanned label is bound to a different delivery.` | `Scan again` |
| unregistered scan | `Label not registered` | `This package label is not registered for this delivery.` | `Scan again` |
| wrong action context | `Scan not valid here` | `This package scan cannot be used for the current action.` | `Scan again` |
| repeated mismatch | `Repeated mismatch` | `This package needs station review before another handoff attempt.` | `Escalate issue` |
| fallback required | `Supervisor fallback required` | `A supervisor must approve fallback handling before this can continue.` | `Request approval` |

## Blocked Action Copy
| Blocked Action | Inline Copy |
| --- | --- |
| origin intake | `Origin intake is blocked until this label is verified.` |
| dispatch readiness | `Dispatch readiness is blocked until the matching label is scanned.` |
| driver pickup | `Driver pickup is blocked until the matching label is scanned.` |
| destination receipt | `Destination receipt is blocked until the matching label is scanned.` |
| final-mile acceptance | `Courier acceptance is blocked until the matching label is scanned.` |
| package release | `Package release is blocked until the matching label is scanned.` |
| return handoff | `Return handoff is blocked until the matching label is scanned.` |

## Recovery Hints
Show short, practical hints:
- `Check that you are scanning the package label, not a receipt or shelf tag.`
- `Hold the phone steady and fill the frame with the label.`
- `If the label is damaged, contact the station lead.`
- `If the package looks wrong, stop and open the custody chain.`
- `Do not compare raw scan codes outside the scanner.`

Do not show more than three hints at once.

## Component Contract
`SharedScanMismatchState` receives normalized scan error context from the parent scanner or mutation flow.

Required fields:
```ts
type ScanMismatchStateView = {
  deliveryId: string;
  safeDeliveryLabel: string;
  currentAction:
    | "origin_intake"
    | "dispatch_readiness"
    | "driver_pickup"
    | "destination_receipt"
    | "final_mile_acceptance"
    | "package_release"
    | "return_handoff";
  mismatchOutcome:
    | "wrong_delivery_binding"
    | "unregistered_scan"
    | "wrong_action_context"
    | "repeated_mismatch"
    | "fallback_required";
  safeScanReference?: string;
  stationLabel?: string;
  actorRole:
    | "station_operator"
    | "station_lead"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin";
  canRescan: boolean;
  canOpenCustodyChain: boolean;
  canEscalateIssue: boolean;
  canRequestFallback: boolean;
  canContactStation: boolean;
  canRefresh: boolean;
  mismatchCount?: number;
  updatedAt?: string;
  isOffline?: boolean;
  isStale?: boolean;
};
```

Derived fields:
- `title`
- `body`
- `blockedActionLabel`
- `auditWarning`
- `primaryAction`
- `secondaryActions`
- `recoveryHints`
- `tone`
- `ariaLiveMessage`

## Component Rules
The component must:
- render without raw scan code
- show blocked action
- show `Scan again` when scanning can safely resume
- stop the current submit flow
- clear raw scan value from visible state after mismatch handling
- show custody route when authorized
- show escalation only after repeated mismatch or role policy allows it
- preserve safe delivery context
- support full-page, inline, modal, and row variants
- keep primary action large enough for mobile

The component must not:
- submit the same scan automatically
- accept local scan result without backend validation
- let user continue the blocked action
- expose another delivery ID by default
- store raw scan code in analytics
- mark custody transferred
- create issue automatically unless parent policy explicitly does so
- compare raw scan codes visually

## Layout Variants
### Full Page Variant
Use full page when:
- scan flow owns the entire screen
- scanner has stopped after mismatch
- the user must decide rescan or escalation
- camera route cannot remain active behind the panel

Structure:
- app shell header
- mismatch hero
- blocked action line
- audit warning
- primary rescan action
- custody/escalation actions
- recovery hints

### Inline Panel Variant
Use inline panel when:
- scanner appears in a modal
- action drawer submitted scan
- package detail remains visible
- mismatch appears inside a stepper

Structure:
- compact title
- body
- blocked action
- `Scan again`
- secondary route

### Modal Variant
Use modal when:
- scanner overlay detects mismatch
- route should not change yet
- user must choose rescan, custody chain, or cancel

Structure:
- alert title
- body
- scan recovery hints
- button group
- safe close/back action

### Row Badge Variant
Use row badge when:
- blocked queue includes scan mismatch
- audit list includes scan mismatch
- delivery timeline references scan failure

Structure:
- mismatch icon
- `Scan mismatch`
- action label
- timestamp
- route affordance

## Mobile Scanner Layout Rules
Mobile rules:
- primary action full width
- secondary actions stacked
- no raw scan value display
- reason text max three lines
- audit warning visible without scrolling
- camera preview stops or dims behind mismatch panel
- scanner resumes only after `Scan again`
- large touch controls
- station contact route visible after repeated mismatch

Camera overlay rules:
- do not keep scanning after mismatch
- pause scanner to prevent repeated error loop
- show a single clear panel
- refocus camera only after user requests rescan

## Desktop/Admin Layout Rules
Desktop rules:
- row badge may appear in audit table
- admin detail can show mismatch event in custody chain
- full state can sit in side panel
- redacted scan reference can appear as read-only row
- raw scan code remains hidden
- custody route is primary for admin investigation

## Visual System
### Color
Tone mapping:
- mismatch after scan submit: red
- unregistered label: amber
- repeated mismatch: red
- fallback required: amber
- recovered scan: green only after backend validation

Avoid:
- green before backend success
- red full-screen fill
- multiple alert colors
- color-only status

### Typography
Use:
- short direct title
- strong blocked-action line
- concise hint text
- semibold action labels
- small privacy note

Avoid:
- long technical explanation
- raw code references
- field-level detail that exposes another record

### Iconography
Use:
- scan frame with slash
- package icon with warning
- custody chain icon for secondary route
- shield/audit icon for warning

Icon must not replace the label.

## Motion Rules
Allowed:
- scanner pause dim
- panel entrance fade
- button progress state
- short red border pulse on mismatch

Not allowed:
- repeated flashing red
- camera shake effect
- auto retry animation
- moving primary action
- animation that hides accessible status update

Reduced motion:
- no pulse
- static panel
- text progress

## Accessibility Requirements
The component must:
- announce mismatch after validation result
- keep focus on mismatch panel or move to title when modal opens
- expose `Scan again` as a button
- keep `Open custody chain` reachable by keyboard
- identify blocked action in text
- use non-color cues
- maintain AA contrast
- provide large touch controls
- avoid raw scan code in accessible text
- announce scanner paused
- support hardware keyboard and switch access

Screen reader announcement after mismatch:
```text
Scan does not match. Driver pickup is blocked until the matching package label is scanned.
```

Screen reader announcement after rescan starts:
```text
Scanner active. Scan the package label again.
```

Screen reader announcement after successful rescan:
```text
Scan matched. Continue from the current step.
```

## API Mapping
| Backend Signal | UI State | Notes |
| --- | --- | --- |
| `PACKAGE_SCAN_MISMATCH` with missing label | `scan_mismatch` | Message: label not registered |
| `PACKAGE_SCAN_MISMATCH` with different binding | `scan_mismatch` or duplicate-label state | Use scan mismatch in active handoff context |
| `DUPLICATE_SCAN` | duplicate scan handling | Not this state unless host maps duplicate to scan review |
| `CONFLICTING_HANDOFF_STATE` | custody not confirmed or blocked by issue | Use this only if scan mismatch is immediate cause |
| `PACKAGE_ALREADY_RECEIVED` | already received state | Not this state |
| scanner local invalid result | scanner validation state | Not this state until value is submitted or validated |

## Error Handling
When mutation returns `PACKAGE_SCAN_MISMATCH`:
- stop current action
- clear pending submit state
- pause scanner
- show scan mismatch state
- clear raw scan value from visible state
- do not enqueue action offline
- log redacted analytics event
- keep user on the scan flow unless parent routes to custody chain

When rescan succeeds:
- remove scan mismatch state
- continue parent flow only after backend confirms
- announce success
- preserve audit trail through backend event

When rescan fails again:
- increment mismatch count if parent tracks it
- keep state visible
- show escalation route if threshold reached

When route to custody chain fails:
- keep state visible
- show retry or support route
- do not reveal scan code

## Navigation Routes
Recommended route targets:
- station scan flow: `/(ops)/station/scan`
- dispatch readiness: `/(ops)/station/dispatch/:deliveryId`
- driver pickup scan: `/(ops)/driver/pickup/:deliveryId/scan`
- destination receipt scan: `/(ops)/station/inbound/:deliveryId/scan`
- final-mile acceptance scan: `/(ops)/courier/assignments/:deliveryId/scan`
- custody chain: `/(ops)/deliveries/:deliveryId/custody`
- station support: `/(ops)/station/support?deliveryId=:deliveryId`
- issue create: `/(ops)/issues/new?deliveryId=:deliveryId&category=handoff`
- admin package detail: `/admin/packages/:deliveryId`

Route safety:
- never include raw scan code in URL
- never include bound delivery ID in query params unless route is admin-authorized and policy permits it
- use delivery ID from current context
- route to queue if detail ID is missing

## Station Operator Surface Rules
Station operator sees:
- mismatch title
- blocked action
- safe delivery label
- rescan action
- custody chain route if authorized
- support or station lead route after repeated mismatch

Station operator does not see:
- raw scan code
- other delivery sender or receiver
- registry path
- internal service metadata

Station copy:
```text
This scan does not match the delivery. Do not move the package until the label is verified.
```

## Driver Surface Rules
Driver sees:
- route item label
- mismatch reason
- blocked pickup action
- rescan action
- contact station route

Driver must not:
- accept custody
- mark pickup complete
- compare raw codes
- see another delivery reference

Driver copy:
```text
This package label does not match your pickup. Scan again or contact the station.
```

## Final-Mile Courier Surface Rules
Courier sees:
- assignment label
- mismatch reason
- blocked acceptance or completion action
- rescan action
- return to assignments
- contact station route when available

Courier must not:
- accept final-mile custody
- start doorstep delivery
- complete delivery
- see raw scan value

Courier copy:
```text
This package label does not match the assigned delivery. Scan again before accepting custody.
```

## Support Admin Surface Rules
Support admin sees:
- mismatch event summary
- delivery context
- custody chain route
- issue creation route if needed
- redacted scan reference if backend provides it

Support admin must:
- avoid raw scan code in support notes
- route repeated mismatch to issue or custody review
- not decide custody from this state alone

Support copy:
```text
The scan failed delivery binding validation. Review custody evidence before advising next action.
```

## Ops Admin Surface Rules
Ops admin sees:
- mismatch reason
- actor role
- station context
- custody chain route
- issue route
- audit warning
- redacted scan reference if available

Ops admin can:
- open custody chain
- open package detail
- escalate issue
- review station process

Ops admin cannot:
- reassign scan binding from this shared state
- transfer custody
- reveal raw scan code in general UI

Ops copy:
```text
Package label validation failed. Review custody chain before any override.
```

## Intake Interaction
At origin intake:
- scan code is reserved for the delivery
- if repository returns a binding for another delivery, show duplicate-label or scan mismatch according to host context
- if scan is unregistered during initial reservation, reservation may proceed only through intake contract
- if reservation fails because binding belongs elsewhere, block intake

Intake recovery:
- scan again
- verify physical label
- open delivery detail
- escalate if repeated

## Dispatch Interaction
At dispatch readiness:
- package scan must match immutable label binding
- dispatch readiness does not move custody
- mismatch blocks readiness
- idempotent readiness for same delivery and scan may succeed where backend permits
- mismatched scan routes to rescan and custody chain

Dispatch copy:
```text
Dispatch readiness is blocked until the matching package label is scanned.
```

## Driver Pickup Interaction
At driver pickup:
- assigned driver must scan registered package label
- custody moves only after backend validates scan and driver confirmation
- mismatch blocks pickup
- station remains accountable until valid pickup

Driver pickup copy:
```text
Pickup is blocked. This label does not match the assigned delivery.
```

## Destination Receipt Interaction
At destination receipt:
- station operator must scan registered package label
- destination receipt requires driver custody and matching scan
- mismatch blocks receipt
- package condition cannot be recorded as final receipt until scan matches

Destination receipt copy:
```text
Destination receipt is blocked until this package label matches the delivery.
```

## Final-Mile Interaction
At final-mile acceptance:
- assigned courier must scan registered package label
- custody transfers only after scan validation and courier confirmation
- mismatch blocks acceptance
- doorstep route must not start

Final-mile copy:
```text
Courier custody is blocked until the assigned package label is scanned.
```

## Fallback Interaction
Fallback exists for scanner hardware, label, or network limitations. It must not weaken mismatch handling.

Fallback can appear only when:
- policy permits manual entry
- receiving party confirmation is present
- supervisor approval is required
- backend records `fallback_used=true`
- current user has fallback route access

If mismatch occurred:
- fallback route must show audit warning
- fallback cannot silently accept mismatched scan
- fallback must be explicit and supervised

Fallback copy:
```text
Fallback handling requires supervisor approval and will be audited.
```

## Issue Interaction
If mismatch repeats or staff cannot resolve physically:
- route to issue creation with handoff category
- do not create issue automatically without parent policy
- keep mismatch state until issue is created
- after issue exists, use `blocked_by_issue`

Issue route copy:
```text
Escalate issue
```

## Custody Interaction
If mismatch could affect custody:
- show custody warning
- route to custody chain
- show current holder if role can see it
- do not change holder
- do not mark handoff complete

Custody warning:
```text
Custody does not move until the scan matches or a supervised fallback is approved.
```

## Duplicate Label Interaction
If scan code is already bound during origin intake:
- use `duplicate_package_label` if the user needs a registry-level explanation
- use `scan_mismatch` if the immediate handoff action is blocked because scanned label does not match current delivery

Rule:
```text
Duplicate package label explains label ownership. Scan mismatch explains failed scan validation for this action.
```

## Stale Data Interaction
If delivery or label state is stale:
- keep mismatch visible
- show `Delivery context may be out of date`
- do not enable blocked action
- refresh can update delivery context
- rescan still requires backend validation

Refresh success:
- if mismatch remains, update timestamp
- if expected delivery changed, parent flow decides route
- if another blocker appears, switch state

## Offline Interaction
If offline:
- keep mismatch visible
- show `You are offline. Scan validation cannot be verified right now.`
- disable handoff submit
- do not queue mismatched action
- allow rescan only as local camera capture if parent flow clearly marks it unsubmitted
- require online validation before custody movement

Offline primary action:
```text
Retry when online
```

## Loading Interaction
During rescan:
- scanner state owns loading
- mismatch panel can collapse only after user taps `Scan again`
- show scanner active state
- clear previous error only after new scan attempt starts

During submit:
- show validation progress
- keep action disabled
- do not show success before backend response

## Empty Interaction
If custody chain has no visible events:
- keep mismatch state visible
- show `No custody events are visible for this delivery yet.`
- offer refresh or support route

If scanner list is empty:
- use empty scanner state, not scan mismatch

## Authorization Interaction
If user cannot open custody chain:
- keep mismatch visible
- hide custody route
- show support or station contact route
- do not show `not_authorized` unless opening custody chain was the full-screen route

Copy:
```text
You can see the scan mismatch, but custody details are restricted.
```

## Session Interaction
If session expires:
- use `session_expired`
- preserve scan flow return path
- clear raw scan value from memory
- do not render scan mismatch details after auth is invalid

## State Machine Summary
Handoff validation path:
```text
scan_captured
  -> submit_for_validation
  -> PACKAGE_SCAN_MISMATCH
  -> scan_mismatch
  -> rescan | custody_chain | issue_escalation | supervised_fallback
```

Successful recovery path:
```text
scan_mismatch
  -> scan_again
  -> submit_for_validation
  -> scan_matched
  -> continue_parent_flow
```

Escalation path:
```text
scan_mismatch
  -> repeated_mismatch
  -> escalate_issue
  -> blocked_by_issue
```

Fallback path:
```text
scan_mismatch
  -> supervisor_fallback
  -> manual_review_required
  -> approved_fallback | rejected_fallback
```

## Analytics Events
Required events:
- `scan_mismatch_viewed`
- `scan_mismatch_blocked_action`
- `scan_mismatch_rescan_clicked`
- `scan_mismatch_custody_chain_clicked`
- `scan_mismatch_escalate_clicked`
- `scan_mismatch_supervisor_fallback_clicked`
- `scan_mismatch_refresh_clicked`
- `scan_mismatch_recovered`
- `scan_mismatch_repeated`
- `scan_mismatch_route_forbidden`

Event properties:
- `deliveryId`
- `currentAction`
- `mismatchOutcome`
- `actorRole`
- `stationId`
- `mismatchCount`
- `isOffline`
- `isStale`
- `recoveryAction`

Privacy rules:
- no raw scan code
- no bound delivery ID unless admin policy allows and event is admin-only
- no sender name
- no receiver name or phone
- no full address
- no evidence URL

## Observability
Monitor:
- scan mismatch rate by station
- scan mismatch rate by action
- repeated mismatch rate
- unregistered scan count
- scan mismatch to issue escalation rate
- scan mismatch to supervised fallback rate
- successful rescan recovery rate
- mismatch events outside expected station scope
- mismatch after label print
- mismatch in final-mile acceptance

Alert:
- mismatch spike at one station
- repeated mismatches on same delivery
- repeated unregistered scans after label printing
- scan mismatch followed by attempted custody bypass

## QA Strategy
QA must prove that a mismatch blocks movement and never leaks raw scan data.

Required QA dimensions:
- station intake
- dispatch readiness
- driver pickup
- destination receipt
- final-mile acceptance
- unregistered scan
- bound-to-other-delivery scan
- repeated mismatch
- offline state
- stale state
- authorized custody route
- restricted custody route
- camera resume
- keyboard and screen reader access

## Unit Test Checklist
Unit tests must cover:
- error code mapping
- outcome label mapping
- blocked action copy
- primary action selection
- secondary action selection
- privacy filtering
- role-specific copy
- offline behavior
- stale behavior
- repeated mismatch escalation
- fallback action visibility
- custody route visibility
- raw scan code redaction
- accessible status message

## Integration Test Checklist
Integration tests must cover:
- dispatch mutation returns `PACKAGE_SCAN_MISMATCH`
- driver pickup returns `PACKAGE_SCAN_MISMATCH`
- destination receipt returns `PACKAGE_SCAN_MISMATCH`
- final-mile acceptance returns `PACKAGE_SCAN_MISMATCH`
- unregistered scan shows label-not-registered copy
- bound scan shows wrong-package copy
- rescan clears mismatch only after backend success
- offline queue rejects mismatched action
- custody chain route hides raw scan code
- issue escalation route excludes raw scan code

## End-To-End Test Checklist
E2E tests must cover:
- station operator scans wrong package during dispatch
- driver scans wrong label during pickup
- destination station scans unregistered label during receipt
- courier scans wrong package during assignment acceptance
- user taps `Scan again` and recovers with correct label
- repeated mismatch routes to issue escalation
- custody chain opens without raw scan code
- restricted user sees safe route fallback
- offline validation prevents custody movement

## Visual QA Checklist
Visual QA must verify:
- scanner overlay mismatch panel
- full page scan mismatch
- inline action mismatch
- row badge in blocked queue
- red mismatch tone with text label
- amber unregistered tone with text label
- long delivery label wrapping
- no raw scan code visible
- repeated mismatch escalation visible
- offline subtext
- stale subtext
- reduced motion
- high contrast mode
- large text scaling

## Accessibility QA Checklist
Accessibility QA must verify:
- mismatch announced after validation
- focus lands on modal title when modal opens
- `Scan again` is reachable and clear
- custody route is reachable
- blocked action is visible and announced
- raw scan code is absent from accessible names
- target sizes pass
- contrast passes
- scanner paused status is announced
- screen reader order matches visual order

## Contract QA Checklist
Contract QA must verify:
- `PACKAGE_SCAN_MISMATCH` maps to this state
- unregistered scan maps to this state
- bound-to-other-delivery maps to this state or duplicate-label state according to host context
- `DUPLICATE_SCAN` does not incorrectly map here in duplicate-step context
- raw scan code never appears in analytics
- raw scan code never appears in route
- offline queue rejects blocked mutation
- scanner resume requires explicit action

## Content QA Checklist
Content QA must verify:
- no generic scanner failure copy
- no blame language
- no raw code display
- no cross-delivery leak
- no success copy before validation
- no bypass action
- audit warning is visible
- recovery action is clear
- escalation route is clear when needed

## Performance Requirements
Requirements:
- render from parent scanner state and API error
- no extra blocking fetch before showing mismatch
- pause scanner promptly
- avoid camera memory leak when modal opens
- no heavy visual asset dependency
- no layout shift after safe context loads
- row badge cheap in long lists

## Security Requirements
Security rules:
- raw scan code is sensitive
- issue/support routes receive only approved payloads
- custody route is server-authorized
- scan validation is backend-authoritative
- offline action cannot transfer custody
- local scanner value cannot approve action
- analytics exclude raw scan value
- admin detail can expose more only through authorized route

## Implementation Notes For Claude Code
Claude Code should implement this later as a shared scan-error gate used by scanner flows and mutation recovery flows.

Recommended file ownership:
- shared state component
- scan error mapper
- scan privacy sanitizer
- recovery action selector
- scanner pause/resume integration helper
- analytics helper
- tests for every scan action

Implementation sequence:
1. Add normalized scan mismatch view type.
2. Add mapper from API error and scanner context.
3. Add privacy sanitizer for scan data.
4. Add shared component variants.
5. Wire station intake.
6. Wire dispatch readiness.
7. Wire driver pickup scan.
8. Wire destination receipt scan.
9. Wire courier acceptance scan.
10. Wire blocked queue row badge.
11. Add tests before shipping.

## Required Test IDs
Use stable test IDs:
- `state-scan-mismatch`
- `state-scan-mismatch-title`
- `state-scan-mismatch-body`
- `state-scan-mismatch-blocked-action`
- `state-scan-mismatch-audit-warning`
- `state-scan-mismatch-primary-action`
- `state-scan-mismatch-secondary-action`
- `state-scan-mismatch-rescan`
- `state-scan-mismatch-custody-chain`
- `state-scan-mismatch-escalate`
- `state-scan-mismatch-fallback`
- `state-scan-mismatch-hints`
- `state-scan-mismatch-offline`
- `state-scan-mismatch-stale`
- `state-scan-mismatch-row-badge`
- `state-scan-mismatch-inline-panel`

## Failure Modes
### Unregistered Scan
Show:
```text
This package label is not registered for this delivery.
```

Actions:
- scan again
- open custody chain
- contact station lead

### Bound To Another Delivery
Show:
```text
The scanned label is bound to a different delivery.
```

Actions:
- scan again
- open custody chain
- escalate issue after repeated mismatch

### Scanner Still Active
Show:
```text
Scanner paused after mismatch.
```

Actions:
- scan again
- cancel

### Custody Route Restricted
Show:
```text
You can see the scan mismatch, but custody details are restricted.
```

Actions:
- contact station
- scan again

### Repeated Mismatch
Show:
```text
Repeated mismatch. Stop the handoff and escalate this package.
```

Actions:
- escalate issue
- open custody chain

### Offline After Mismatch
Show:
```text
You are offline. Scan validation cannot be verified right now.
```

Actions:
- retry when online
- back to delivery

## Anti-Patterns
Do not:
- show raw scan code
- ask staff to compare full scan codes
- continue custody after mismatch
- auto-resubmit the same scan
- keep scanner running behind warning
- show another delivery details in field UI
- treat mismatch as camera failure
- route to payment state
- hide audit warning
- let stale data clear mismatch
- queue mismatched action offline

## Acceptance Criteria
This spec is complete when the future implementation can prove:
- `PACKAGE_SCAN_MISMATCH` maps reliably to this state
- handoff and dispatch actions stay blocked
- `Scan again` is always available when scanning can safely resume
- raw scan code is never rendered or logged
- custody route appears only when authorized
- repeated mismatch routes to escalation
- offline queue cannot store a mismatched action
- accessibility status messages announce mismatch and recovery
- tests cover station, driver, courier, and admin contexts

## Definition Of Done
The future UI is not done until:
- shared component exists
- scan error mapper exists
- scan privacy sanitizer exists
- scanner pause/resume behavior exists
- full page, inline, modal, and row variants exist
- station intake uses it
- dispatch readiness uses it
- driver pickup scan uses it
- destination receipt scan uses it
- courier acceptance scan uses it
- blocked queue row badge uses it
- analytics exclude raw scan value
- accessibility checks pass
- visual QA passes on phone and desktop
- contract tests prove backend mapping
- E2E tests prove no custody bypass

## Open Product Decisions
These decisions do not block implementation but should be resolved before pilot polish:
- exact repeated-mismatch threshold before escalation appears
- whether station lead can approve fallback from mobile or only admin
- whether admin package detail can reveal bound delivery reference behind extra permission
- whether redacted scan fingerprint should be shown to station users
- whether damaged-label replacement creates issue or manual review first

## Build Handoff Summary
Claude Code should build `SharedScanMismatchState` as a strict custody-protection gate. It should pause scanner flow, explain the mismatch, offer rescan, protect raw scan code, route to custody or escalation when needed, and prevent every handoff or dispatch bypass until backend validation succeeds.

The intended experience is practical and firm:
- user knows the scan did not match
- user knows the package must not move
- user can scan again quickly
- user can escalate safely
- custody remains protected
