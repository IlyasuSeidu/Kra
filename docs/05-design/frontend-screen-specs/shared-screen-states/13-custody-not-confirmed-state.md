# Custody Not Confirmed State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `custody_not_confirmed` |
| Component family | Shared screen state |
| Primary component | `SharedCustodyNotConfirmedState` |
| Supporting components | `CustodyOwnerCard`, `RequiredHandoffPanel`, `CustodyProofGapStrip`, `CustodyRecoveryActions`, `CustodyOfflineTruthPanel`, `CustodyRouteGuardNotice`, `CustodyAdminEvidencePanel`, `CustodyPrivacyGuard` |
| Primary surfaces | operations mobile app, station operator mobile app, driver mobile app, final-mile courier mobile app, admin web console |
| Required recovery | show current owner, show required handoff, open custody chain, open required scan or acceptance route, open issue, open offline recovery, or return to safe parent flow |
| Test id root | `state-custody-not-confirmed` |
| Backend coverage | `INVALID_STATUS_TRANSITION`, `HANDOFF_PROOF_REQUIRED`, `CONFLICTING_HANDOFF_STATE`, current custody role mismatch, current custody actor mismatch, missing handoff proof, queued custody action not yet synced |
| Browser mutation operation | None directly; this state blocks a downstream workflow until backend-confirmed custody exists |
| Data sensitivity | current custody actor ID, current custody role, assignment IDs, proof references, handoff event metadata, station scope, actor identity, receiver proof context |
| Offline critical | Yes because local queued custody must not look backend-confirmed |
| Related inventory state | `custody_not_confirmed` |
| Related state specs | manual review required, blocked by issue, scan mismatch, duplicate package label, proof required, otp required, offline, stale data, error, not authorized |
| Design tokens | `custody.blue.700`, `custody.amber.700`, `custody.red.700`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-18` |
| Accessibility target | WCAG 2.1 AA equivalent with explicit owner status, large recovery targets, non-color proof gap indicators, and accessible route changes |

## Purpose
`SharedCustodyNotConfirmedState` is the shared UI state shown when the acting party is trying to perform an action that requires custody, but the delivery record does not confirm that the actor currently holds custody.

This state must answer:
- `Who currently has custody according to the backend?`
- `What handoff is required before this actor can continue?`
- `Is the actor assigned but not yet custodian?`
- `Is custody queued locally but not confirmed by the backend?`
- `What action is blocked until custody is confirmed?`
- `Which route can capture or verify the required handoff?`
- `Should this become an issue or manual review?`
- `What sensitive actor or proof data must stay hidden?`

The most important rule is:
```text
Assignment is not custody. Custody is confirmed only after the backend records the required handoff proof.
```

## Product Job
Kra prevents package loss by separating work assignment from package accountability. A driver can be assigned before pickup. A courier can be assigned before final-mile acceptance. A station can prepare dispatch before the driver owns the package. A courier can prepare proof only after courier custody is accepted.

The custody not confirmed state must:
- stop downstream work that requires current custody
- show the current recorded custody owner
- show the required handoff that must happen next
- explain that queued or local actions are not final until synced
- route users to the correct scan or acceptance screen
- route users to custody chain when evidence is unclear
- route users to issue creation when ownership is disputed or unsafe
- keep raw actor IDs and proof references out of normal field UI
- preserve backend authority over custody truth
- prevent false success language from local state

## Strategic Role
This state is a core loss-prevention guardrail. It prevents a party from acting as custodian without a confirmed handoff.

The design must be strict:
- no route movement before driver pickup custody
- no destination handoff preparation without driver custody
- no final-mile route or proof before courier custody
- no delivery completion without courier custody
- no local queued action displayed as confirmed custody
- no assignment badge displayed as custody proof
- no inferred custody from role, schedule, GPS, or verbal confirmation

The design must also be practical:
- field teams need a clear next step, not a vague blocked error
- drivers and couriers need to know whether to scan, wait, or call station support
- station operators need to know who should hand over the package
- offline users need truthful pending status
- admins need evidence context without exposing sensitive IDs broadly

The state turns a dangerous ambiguity into a concrete recovery path.

## External Research Used
Only directly relevant traceability, event, and accessibility references were used:
- [GS1 Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard): supports capturing and sharing traceability data across parties in a supply chain.
- [GS1 EPCIS and CBV](https://www.gs1.org/standards/epcis): supports event-based visibility for what happened, where, when, why, and which business step applies.
- [GS1 Core Business Vocabulary](https://www.gs1.org/standards/epcis/core-business-vocabulary-cbv/current-standard): supports consistent business-step and disposition language for logistics event data.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports interruptive custody blocker behavior when a response is required.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment and background inertness for modal custody blockers.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing custody status changes without unexpected focus movement.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear explanation of why the current action cannot continue.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for field recovery actions.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/api-contracts.md`
- `docs/07-data/data-model.md`
- `docs/08-security/authorization-rules.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/02-ops-delivery-detail.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/07-driver-origin-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/08-driver-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/09-driver-route.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/11-driver-destination-arrival.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/13-station-destination-receipt.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/06-courier-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/07-admin-package-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/09-admin-custody-chain.md`
- `services/api/src/handoffs.ts`
- `services/api/src/delivery-queries.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`

## Visual Thesis
Custody not confirmed should feel like a locked operational checkpoint: calm, legible, and exact about who owns the package right now.

Use:
- a blue custody-owner card for neutral current ownership
- amber when custody is pending, queued, missing, or stale
- red only when action is unsafe or conflicting
- a required-handoff panel with the next role and route
- a proof gap strip that explains what is missing
- role-aware action buttons
- clear `Assignment is not custody` copy where relevant
- strong offline truth language

Do not use:
- generic `Not allowed`
- green success color
- `Start route` or `Complete delivery` while custody is missing
- current assignment as proof of custody
- raw actor IDs in field UI
- proof reference strings in visible copy
- GPS or location as proof of custody
- automatic retry that changes custody silently

## Audience
Primary users:
- driver trying to start route before pickup custody is confirmed
- driver trying to prepare destination arrival while not current custodian
- final-mile courier trying to start route, proof, OTP, signature, photo, failed attempt, or completion before courier custody is confirmed
- station operator trying to receive a package when driver custody is not confirmed or not transferable
- station operator trying to dispatch while handoff evidence is incomplete
- support or ops admin investigating missing custody proof

Secondary users:
- QA validating custody gates
- backend engineer validating error mapping
- security reviewer validating actor data redaction
- accessibility reviewer validating high-priority blocked states
- Claude Code implementing the shared state later

Non-users:
- unauthenticated public visitor
- sender acting outside support context
- receiver acting outside proof context
- finance-only admin
- payment provider
- unrelated station staff

## Non-Goals
Do not use custody not confirmed for:
- package scan mismatch
- duplicate package label
- payment blocker
- proof file upload failure
- receiver OTP required after custody is confirmed
- active issue lock
- station scope violation
- assignment scope violation where actor is not assigned at all
- session expiry
- generic API failure
- camera permission denial
- rate limiting
- label print or reprint
- package condition review

Use `not_authorized` when the actor cannot access the delivery. Use `blocked_by_issue` when an active issue is the blocker. Use `proof_required` when custody is valid but proof is missing. Use `otp_required` when final proof requires receiver verification.

## State Definition
`custody_not_confirmed` is active when the user can see the delivery or workflow context, but the action they are trying to take requires a backend-confirmed current custodian that does not match the actor or required role.

Canonical triggers:
- `get_delivery` returns `currentCustodyRole` not matching required role
- `get_delivery` returns `currentCustodyActorId` not matching current actor where actor match is required
- backend returns `INVALID_STATUS_TRANSITION` with message or metadata indicating custody must be confirmed first
- backend returns `HANDOFF_PROOF_REQUIRED`
- backend returns `CONFLICTING_HANDOFF_STATE` because handoff events are out of order
- offline outbox contains a custody action that is queued or syncing but not confirmed
- route guard checks delivery detail before entering driver route or courier proof screen and custody is missing
- custody chain shows current custody unavailable while non-terminal status needs an owner

Non-canonical triggers:
- delivery is not visible to user
- payment is not confirmed
- package label is wrong
- proof upload is missing after custody is confirmed
- issue lock is active
- user has not selected a delivery
- scanner has not returned a value
- receiver verification token is missing after courier custody is confirmed

## Custody Truth Model
Backend authority fields:
- `currentCustodyRole`
- `currentCustodyActorId`
- `currentStatus`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- timeline handoff entries

Field UI can show:
- current custody role
- human-safe owner label
- station or role label
- current status
- required next handoff
- latest verified event time
- whether actor match is confirmed

Field UI must hide:
- raw `currentCustodyActorId`
- raw proof reference
- raw timeline metadata
- supervisor PIN
- receiver phone
- receiver address unless already allowed by that route
- unrelated actor IDs

Admin UI may show:
- delivery ID
- current custody role
- current custody actor ID only where the admin screen already permits it
- handoff event IDs when audit route permits
- issue IDs
- evidence confidence

## Assignment Versus Custody Rules
Assignment is a planning state. Custody is an accountability state.

Driver:
- `assignedDriverId = current driver` does not mean driver has custody.
- Driver custody begins only after `confirm_pickup` succeeds.
- Driver route requires `currentCustodyRole = driver` and `currentCustodyActorId = current driver`.

Final-mile courier:
- `assignedFinalMileCourierId = current courier` does not mean courier has custody.
- Courier custody begins only after `accept_final_mile_assignment` succeeds.
- Courier route, proof, OTP, signature, photo, failed attempt, and completion require `currentCustodyRole = final_mile_courier` and `currentCustodyActorId = current courier`.

Station operator:
- Dispatch readiness does not transfer custody to driver.
- Destination receipt requires confirmed driver custody before station receives from driver.
- Station may hold custody after origin intake or destination receipt based on backend state.

Receiver:
- Receiver proof completes the final handoff and clears active courier custody after backend success.

## Handoff Requirements Matrix
| Required handoff | Required backend proof | Acting party after success | Recovery route |
| --- | --- | --- | --- |
| sender to origin station | origin intake with label and intake timestamp | station operator | `/(ops)/station/intake/:deliveryId` |
| origin station to driver | driver pickup scan and driver confirmation | driver | `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| driver to destination station | package scan, station receipt, condition check | station operator | `/(ops)/station/inbound/:deliveryId/receive` |
| destination station to final-mile courier | courier acceptance scan and courier confirmation | final-mile courier | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| final-mile courier to receiver | OTP, signature, or delivery photo with completion response | no active internal custodian | `/(ops)/courier/assignments/:deliveryId/proof` |

## State Variants
| Variant | Applies when | Tone | Primary action |
| --- | --- | --- | --- |
| `driver_pickup_required` | driver is assigned but has not confirmed pickup | amber | `Scan pickup label` |
| `driver_custody_missing` | route, destination arrival, or destination handoff needs driver custody | red | `Open pickup scan` |
| `station_receipt_blocked` | destination receipt needs confirmed driver custody first | red | `Open custody chain` |
| `courier_acceptance_required` | courier is assigned but has not accepted custody | amber | `Accept custody` |
| `courier_custody_missing` | proof, route, or completion needs courier custody | red | `Open acceptance scan` |
| `queued_custody_pending` | local custody action is queued or syncing | amber | `Open offline outbox` |
| `handoff_proof_missing` | backend says required handoff proof is absent | red | `Open custody chain` |
| `custody_conflict` | timeline and delivery state conflict | red | `Report issue` |
| `custody_unknown` | current custody is null or unavailable before terminal status | amber | `Open custody chain` |
| `admin_evidence_review` | admin sees missing or conflicting custody evidence | investigative | `Open admin custody chain` |

## Error Code Mapping
| Backend code | State mapping | Field message | Admin message |
| --- | --- | --- | --- |
| `INVALID_STATUS_TRANSITION` with custody-first metadata | `custody_not_confirmed` | `Custody is not confirmed for this action yet.` | `Action requires confirmed custody first.` |
| `HANDOFF_PROOF_REQUIRED` | `custody_not_confirmed` or `proof_required` based on context | `Required handoff proof is missing.` | `Required handoff proof is missing.` |
| `CONFLICTING_HANDOFF_STATE` | `custody_not_confirmed` or `manual_review_required` | `The custody record conflicts with this action.` | `Conflicting handoff state.` |
| `ASSIGNMENT_SCOPE_VIOLATION` | `not_authorized` or assignment blocked state | `This job is not assigned to you.` | `Assignment scope violation.` |
| `STATION_SCOPE_VIOLATION` | `not_authorized` | `This delivery is outside your station scope.` | `Station scope violation.` |
| `PACKAGE_SCAN_MISMATCH` | `scan_mismatch` | `This scan code does not match the delivery.` | `Package scan mismatch.` |
| `ISSUE_LOCK_ACTIVE` | `blocked_by_issue` | `This delivery is locked while an issue is being reviewed.` | `Issue lock active.` |
| `PAYMENT_REQUIRED` | `blocked_by_payment` | `Payment must be confirmed before this action.` | `Payment gate active.` |

## Role-Based Behavior
| Role | What to show | Primary recovery | Sensitive data rule |
| --- | --- | --- | --- |
| `station_operator` | current custody role, required station or driver handoff, route to custody chain | `Open custody chain` or required station workflow | hide actor IDs |
| `driver` | assignment versus custody, pickup requirement, route blocked state | `Open pickup scan` | hide other actor IDs |
| `final_mile_courier` | assignment versus custody, acceptance requirement, proof blocked state | `Open acceptance scan` | hide other actor IDs |
| `support_admin` | current custody role, issue route, custody chain | `Open custody chain` | show only admin-safe actor labels |
| `ops_admin` | custody evidence panel, current role, actor match, issue links | `Open admin custody chain` | actor IDs only when screen policy allows |
| `super_admin` | admin evidence panel and audit routes | `Open admin custody chain` | follow audit visibility rules |
| `sender` | not applicable | not applicable | no custody internals |
| `receiver` | not applicable | not applicable | no custody internals |

## Information Architecture
The state has six regions:

1. Status header
- title
- blocked action label
- severity badge
- short status message

2. Current owner card
- current custody role
- safe actor label when allowed
- latest verified touchpoint
- freshness marker

3. Required handoff panel
- missing handoff name
- required actor
- required proof
- recovery route

4. Assignment warning
- visible when assignment exists but custody does not
- copy: `Assigned, not custodian`
- explanation that backend handoff proof is still required

5. Recovery actions
- open required scan or acceptance route
- open custody chain
- report issue
- open offline outbox or recovery
- return to parent

6. Privacy and audit notice
- explains hidden actor IDs and proof references
- states that backend custody is source of truth

## Component Anatomy
`SharedCustodyNotConfirmedState` should compose:

- `StateShell`
- `CustodyOwnerCard`
- `RequiredHandoffPanel`
- `CustodyProofGapStrip`
- `CustodyRecoveryActions`
- `CustodyOfflineTruthPanel`
- `CustodyRouteGuardNotice`
- `CustodyAdminEvidencePanel`
- `CustodyPrivacyGuard`

Recommended DOM or native order:
1. heading
2. blocked action explanation
3. current owner card
4. required handoff panel
5. recovery actions
6. offline or stale warning
7. privacy notice
8. support text

## Visual System
Base palette:
- background: `surface`
- foreground: `neutral.950`
- supporting text: `neutral.700`
- muted text: `neutral.500`
- neutral custody: `custody.blue.700`
- pending custody: `custody.amber.700`
- unsafe custody gap: `custody.red.700`
- border: `neutral.200`
- focus: `focus.ring`

Layout:
- mobile: single-column card with current owner above actions
- scanner host: bottom sheet with current owner and required handoff
- route guard screen: full-screen blocker before workflow content
- admin web: two-column evidence and actions panel
- offline outbox: compact row detail state

Spacing:
- header gap: `12`
- owner card padding: `20`
- panel gap: `16`
- action gap: `12`
- bottom safe-area padding on mobile

## Tone And Copy Principles
Copy must be:
- direct
- ownership-focused
- non-accusatory
- clear about current backend truth
- clear about the next required handoff
- exact about local versus synced state

Copy must not:
- blame the user
- imply theft or loss without review
- overstate certainty when timeline is missing
- call assignment custody
- call queued local action confirmed
- reveal raw actor IDs
- expose proof references
- say `complete` before backend success

## Canonical Copy
### Default Title
```text
Custody not confirmed
```

### Default Body
```text
This action requires confirmed custody first. Open the required handoff or review the custody chain.
```

### Assignment Body
```text
You are assigned to this package, but custody has not been confirmed yet.
```

### Driver Pickup Body
```text
Driver custody starts after pickup scan is confirmed by the backend.
```

### Courier Acceptance Body
```text
Courier custody starts after assignment acceptance scan is confirmed by the backend.
```

### Offline Pending Body
```text
The custody action is saved on this device, but it is not final until sync succeeds.
```

### Conflict Body
```text
The custody record conflicts with this action. Review the custody chain before moving the package.
```

### Current Owner Unknown Body
```text
Current custody is unavailable. Open custody chain before continuing.
```

## Variant Copy Matrix
| Variant | Title | Body | Primary action |
| --- | --- | --- | --- |
| `driver_pickup_required` | `Pickup not confirmed` | `You are assigned to this run, but driver custody starts after pickup scan is confirmed.` | `Scan pickup label` |
| `driver_custody_missing` | `Driver custody not confirmed` | `Route movement requires confirmed driver custody first.` | `Open pickup scan` |
| `station_receipt_blocked` | `Driver custody required` | `Destination receipt requires confirmed driver custody before the station can receive the package.` | `Open custody chain` |
| `courier_acceptance_required` | `Courier custody not accepted` | `You are assigned, but courier custody starts after acceptance scan is confirmed.` | `Accept custody` |
| `courier_custody_missing` | `Courier custody not confirmed` | `Proof and completion require confirmed courier custody first.` | `Open acceptance scan` |
| `queued_custody_pending` | `Custody sync pending` | `The custody action is saved on this device, but it is not final until sync succeeds.` | `Open offline outbox` |
| `handoff_proof_missing` | `Handoff proof missing` | `Required handoff proof is missing. Review custody evidence before continuing.` | `Open custody chain` |
| `custody_conflict` | `Custody conflict detected` | `The custody record conflicts with this action. Report an issue or open custody chain.` | `Report issue` |
| `custody_unknown` | `Custody owner unavailable` | `Current custody is unavailable. Open custody chain before moving the package.` | `Open custody chain` |
| `admin_evidence_review` | `Custody evidence needs review` | `This action is blocked because current custody does not match the required actor.` | `Open admin custody chain` |

## Action Hierarchy
Driver route blocker:
1. `Open pickup scan`
2. `Open custody chain`
3. `Report issue`
4. `Back to run`

Courier proof blocker:
1. `Open acceptance scan`
2. `Open custody chain`
3. `Report issue`
4. `Back to assignment`

Station receipt blocker:
1. `Open custody chain`
2. `Report issue`
3. `Back to inbound queue`

Offline pending blocker:
1. `Open offline outbox`
2. `Open custody chain`
3. `Back to work`

Admin review:
1. `Open admin custody chain`
2. `Open package detail`
3. `Open issue`

Primary action rules:
- Use the route that can create or verify the missing handoff when safe.
- Use custody chain when the next handoff is unclear.
- Use issue creation when records conflict or package movement is unsafe.
- Never use `Continue` while custody is missing.
- Never use `Complete delivery` while courier custody is missing.
- Never use `Start route` while driver or courier custody is missing.

## Navigation Routes
Use existing route contracts:

- delivery detail: `/(ops)/deliveries/:deliveryId`
- custody chain: `/(ops)/deliveries/:deliveryId/custody`
- issue create: `/(ops)/deliveries/:deliveryId/issues/new`
- offline outbox: `/(ops)/offline-outbox`
- offline action recovery: `/(ops)/offline-outbox/:queuedActionId/recover`
- station support: `/(ops)/station/support?deliveryId=:deliveryId`
- driver pickup scan: `/(ops)/driver/runs/:deliveryId/pickup-scan`
- driver custody accepted: `/(ops)/driver/runs/:deliveryId/custody-accepted`
- driver route: `/(ops)/driver/runs/:deliveryId/route`
- driver destination arrival: `/(ops)/driver/runs/:deliveryId/destination-arrival`
- station destination receipt: `/(ops)/station/inbound/:deliveryId/receive`
- courier acceptance scan: `/(ops)/courier/assignments/:deliveryId/accept-scan`
- courier custody accepted: `/(ops)/courier/assignments/:deliveryId/custody-accepted`
- courier proof selector: `/(ops)/courier/assignments/:deliveryId/proof`
- courier OTP proof: `/(ops)/courier/assignments/:deliveryId/proof/otp`
- admin package detail: `/admin/deliveries/:deliveryId/package`
- admin custody chain: `/admin/deliveries/:deliveryId/custody`
- admin custody exception: `/admin/custody-exceptions/:issueId`

Route safety:
- do not include raw actor IDs in query string
- do not include proof references in query string
- do not include receiver phone or address in query string
- pass safe `deliveryId`, `issueId`, `queuedActionId`, `source`, and `requiredHandoff`
- use `source=custody_not_confirmed` when supported
- validate route access before showing admin links
- preserve parent return route only within same app shell

## Route Payloads
### Issue Create Payload
Safe context:
```ts
type CustodyNotConfirmedIssueContext = {
  deliveryId: string;
  category: "handoff" | "loss";
  severity: "high";
  source: "custody_not_confirmed";
  attemptedAction: "driver_route" | "destination_receipt" | "courier_proof" | "delivery_completion" | "offline_replay";
  currentCustodyRole?: string | null;
  requiredCustodyRole: "station_operator" | "driver" | "final_mile_courier";
  requiredHandoff: string;
  queuedActionId?: string;
  occurredAt: string;
};
```

Forbidden context:
- raw `currentCustodyActorId` for field issue body
- proof reference
- receiver phone
- receiver address
- raw timeline metadata
- stack trace

### Offline Recovery Payload
Safe context:
```ts
type CustodyOfflineRecoveryContext = {
  queuedActionId: string;
  deliveryId: string;
  source: "custody_not_confirmed";
  routeKey: string;
  lastErrorCode?: string;
  requiredCustodyRole?: string;
};
```

## Component Props
```ts
type CustodyNotConfirmedVariant =
  | "driver_pickup_required"
  | "driver_custody_missing"
  | "station_receipt_blocked"
  | "courier_acceptance_required"
  | "courier_custody_missing"
  | "queued_custody_pending"
  | "handoff_proof_missing"
  | "custody_conflict"
  | "custody_unknown"
  | "admin_evidence_review";

type CustodyActorRole =
  | "station_operator"
  | "driver"
  | "final_mile_courier"
  | "support_admin"
  | "ops_admin"
  | "super_admin";

type SharedCustodyNotConfirmedStateProps = {
  variant: CustodyNotConfirmedVariant;
  deliveryId?: string;
  trackingCode?: string;
  actorRole: CustodyActorRole;
  attemptedAction: string;
  currentCustodyRole?: "station_operator" | "driver" | "final_mile_courier" | null;
  currentCustodyActorLabel?: string;
  requiredCustodyRole: "station_operator" | "driver" | "final_mile_courier";
  requiredHandoffLabel: string;
  requiredProofLabel?: string;
  latestVerifiedEventAt?: string;
  isAssignmentMatch?: boolean;
  isActorCustodyMatch?: boolean;
  isOfflineQueued?: boolean;
  isStale?: boolean;
  queuedActionId?: string;
  issueId?: string;
  canOpenRequiredHandoff: boolean;
  canOpenCustodyChain: boolean;
  canReportIssue: boolean;
  canOpenOfflineRecovery: boolean;
  canOpenAdminEvidence: boolean;
  onOpenRequiredHandoff?: () => void;
  onOpenCustodyChain?: () => void;
  onReportIssue?: () => void;
  onOpenOfflineRecovery?: () => void;
  onOpenAdminEvidence?: () => void;
  onBack?: () => void;
  onRefresh?: () => void;
};
```

Prop rules:
- `currentCustodyActorLabel` must be safe for the current role.
- raw `currentCustodyActorId` must not be passed to field rendering props.
- `isAssignmentMatch` must not unlock protected actions.
- route callbacks are host-owned.
- component must not import navigation directly.
- component must not submit custody mutations directly.

## Derivation Helper
Host screens should use a pure helper:

```ts
type CustodyRequirementInput = {
  deliveryId?: string;
  actorId: string;
  actorRole: string;
  attemptedAction: string;
  currentStatus?: string;
  currentCustodyRole?: string | null;
  currentCustodyActorId?: string | null;
  assignedDriverId?: string;
  assignedFinalMileCourierId?: string;
  lastErrorCode?: string;
  lastErrorMetadata?: Record<string, unknown>;
  queuedActionStatus?: "queued" | "syncing" | "failed" | "conflict";
};

type CustodyRequirementResult = {
  shouldBlock: boolean;
  variant?: CustodyNotConfirmedVariant;
  requiredCustodyRole?: string;
  requiredHandoffLabel?: string;
};
```

Derivation rules:
- driver route requires `currentCustodyRole = driver` and actor match.
- driver destination arrival requires `currentCustodyRole = driver` and actor match.
- station destination receipt requires driver custody before station receipt.
- courier proof requires `currentCustodyRole = final_mile_courier` and actor match.
- courier completion requires `currentCustodyRole = final_mile_courier` and actor match.
- assigned driver or courier match alone is insufficient.
- queued custody action blocks downstream success until synced.
- `HANDOFF_PROOF_REQUIRED` maps to handoff proof missing.
- conflicting current custody maps to custody conflict.

## State Machine
```text
idle
  -> route_requested
  -> custody_checked
  -> custody_missing
  -> custody_not_confirmed_visible
  -> recovery_route_pending
  -> recovery_route_opened

custody_not_confirmed_visible
  -> refresh_pending
  -> custody_checked

custody_not_confirmed_visible
  -> offline_recovery_pending
  -> offline_recovery_opened

custody_not_confirmed_visible
  -> issue_route_pending
  -> issue_create_opened

custody_not_confirmed_visible
  -> route_failed
  -> custody_not_confirmed_visible
```

Forbidden transitions:
- `custody_missing -> route_started`
- `custody_missing -> proof_capture_started`
- `custody_missing -> delivery_completed`
- `queued_custody_pending -> custody_confirmed`
- `assignment_match -> custody_confirmed`
- `route_failed -> hidden_success`

## Mobile Layout
Mobile route guard:
- show before protected workflow content
- current owner card above required handoff
- one dominant action
- secondary custody chain action
- issue action as tertiary
- support or back route in quiet row

Mobile scanner recovery:
- bottom sheet with title, current owner, required scan
- scanner paused behind state
- background controls inert
- focus on title

Mobile offline state:
- show sync pending strip
- show queued action ID only when safe
- route to offline outbox
- do not show protected action button

Mobile action footer:
- primary action full width
- secondary actions stacked
- safe-area padding
- no dense table layout

## Admin Web Layout
Admin panel:
- top status row with blocked action and current owner
- left evidence column with current custody and latest event
- right recovery column with admin custody chain, package detail, issue route
- compact state for queue rows
- route to audit only if admin screen policy allows

Admin copy must be precise:
- distinguish current custody state from assignment state
- show whether actor mismatch or role mismatch caused block
- avoid blaming field staff before evidence review
- call out missing handoff proof clearly

## Empty And Missing Data Behavior
If delivery ID is missing:
- show `Delivery context is missing. Return to the previous screen.`
- primary action: `Back`
- hide custody chain and issue routes

If current custody role is missing:
- show `Current custody is unavailable. Open custody chain before continuing.`
- primary action: `Open custody chain`
- severity: amber unless attempted action is high-risk completion

If current custody actor is missing:
- show role-level owner only
- do not infer actor from latest event
- use `Actor not exposed` in admin contexts only when allowed

If latest event is missing:
- show `Latest verified event is unavailable.`
- promote refresh and custody chain

If required handoff route is unavailable:
- hide the route action
- primary action becomes `Open custody chain`
- support action appears if available

If issue route is unavailable:
- hide `Report issue`
- show support route

## Offline And Outbox Rules
Offline rules:
- local queued pickup or acceptance is not confirmed custody
- downstream route, proof, or completion remains blocked until sync succeeds
- outbox rows must say `Not confirmed yet`
- synced result must refresh delivery before showing custody accepted
- failed replay must route to offline recovery
- conflict replay must not retry automatically

Offline copy:
```text
The custody action is saved on this device, but it is not final until sync succeeds.
```

Offline states:
- `queued`: action saved locally, no backend confirmation
- `syncing`: backend confirmation pending
- `failed`: action did not apply
- `conflict`: backend state differs from queued action
- `synced`: can refresh delivery and leave this state only if custody fields match

Outbox actions:
- `Open offline outbox`
- `Open action recovery`
- `Open custody chain`
- `Report issue`

Do not:
- call queued action confirmed
- start driver route while pickup is queued
- start courier proof while acceptance is queued
- clear failed custody action automatically
- hide sync pending status below the fold

## Privacy And Security Rules
The component must not render:
- raw `currentCustodyActorId`
- raw handoff event IDs in field UI
- raw proof references
- receiver phone
- receiver full address unless allowed by the active courier route
- supervisor PIN
- raw package scan code
- raw timeline metadata
- backend stack traces

The component may render:
- current custody role
- safe actor display label when parent already exposes it
- current station or role label
- selected delivery tracking code
- required handoff name
- latest verified event time
- issue ID when user can access the issue route
- queued action ID when local outbox already displays it

Data handling:
- derive action visibility from backend state and capability policy
- do not infer custody from GPS
- do not infer custody from assignment
- do not infer custody from local scan field alone
- analytics must not include raw actor IDs for field roles

## Analytics
Event names:
- `custody_not_confirmed_viewed`
- `custody_not_confirmed_action_selected`
- `custody_required_handoff_opened`
- `custody_chain_opened_from_blocker`
- `custody_issue_started_from_blocker`
- `custody_offline_recovery_opened`

Required properties:
- `deliveryId`
- `actorRole`
- `attemptedAction`
- `variant`
- `requiredCustodyRole`
- `currentCustodyRole`
- `surface`
- `sourceErrorCode`
- `isAssignmentMatch`
- `isOfflineQueued`
- `isStale`

Forbidden properties:
- raw actor ID
- proof reference
- package scan code
- receiver phone
- receiver address
- supervisor PIN
- raw backend message

Analytics rules:
- fire viewed once per visible blocker
- fire selected action once per user action
- scrub all metadata before sending
- include route success or route failure only after outcome
- never fire success analytics for blocked downstream action

## Accessibility Requirements
For modal rendering:
- use alert-dialog semantics
- title must identify custody blocker
- focus title on open
- trap focus while modal is active
- return focus to invoking route action if dismissed
- keep background controls inert
- Escape allowed only when safe back route exists

For full-screen rendering:
- use one `h1`
- current owner card follows title
- required handoff panel follows current owner
- route actions are grouped with accessible labels
- live region announces refresh result and route failure

Target sizes:
- all primary and secondary actions at least 44 by 44 CSS pixels
- separate destructive or issue action from scan/route action by at least `12`

Motion:
- short opacity or vertical transform on entry
- no pulsing warning loops
- no shake motion
- support reduced motion

Color:
- do not rely on red or amber alone
- include text labels such as `Not confirmed`, `Assigned only`, and `Sync pending`
- maintain strong text contrast

## Content States
### Ready Blocked State
Show:
- title
- blocked action
- current custody owner
- required handoff
- recovery actions
- privacy notice

Do not show:
- protected workflow controls
- success check
- local confirmed language

### Refreshing
Show:
- disabled route actions that depend on fresh state
- progress on refresh action
- original custody explanation remains visible

Copy:
```text
Checking latest custody...
```

### Refresh Success Still Blocked
Show:
- updated owner card
- unchanged blocked explanation if still invalid
- route to required handoff

Copy:
```text
Custody is still not confirmed for this action.
```

### Refresh Success Cleared
Show:
- return to parent workflow only after custody fields match
- do not auto-submit the downstream mutation

Copy:
```text
Custody is now confirmed. Review the action before continuing.
```

### Route Pending
Show:
- selected action loading state
- no duplicate toast
- blocker remains visible

Copy:
```text
Opening required handoff...
```

### Route Failed
Show:
- route error
- blocker remains visible
- alternate custody chain or support route

Copy:
```text
Could not open that route. Custody is still not confirmed.
```

### Stale Context
Show:
- stale marker
- refresh action
- custody chain route

Copy:
```text
This custody information may be outdated. Refresh before moving the package.
```

## Integration Rules By Surface
### Driver Pickup Scan
Use this state when:
- pickup has not been confirmed
- route screen opens before backend confirms driver custody
- local pickup action is queued but not synced

Primary route:
- `/(ops)/driver/runs/:deliveryId/pickup-scan`

### Driver Route
Use this state when:
- driver opens route without `currentCustodyRole = driver`
- actor mismatch exists
- queued pickup exists but backend refresh has not confirmed

Blocked actions:
- open navigation
- mark in transit
- destination arrival preparation

### Driver Destination Arrival
Use this state when:
- driver destination arrival route loads but current custody is not driver
- backend rejects destination arrival due to missing driver custody

Primary route:
- `Open custody chain`

### Station Destination Receipt
Use this state when:
- destination station tries to receive package but driver custody is not confirmed
- backend rejects because current custody is not driver or actor does not match assigned driver

Primary route:
- `Open custody chain`

### Courier Acceptance Scan
Use this state when:
- courier is assigned but acceptance scan has not confirmed custody
- local acceptance is queued

Primary route:
- `/(ops)/courier/assignments/:deliveryId/accept-scan`

### Courier Route And Proof
Use this state when:
- route, proof selector, OTP proof, signature proof, photo proof, failed attempt, or completion opens before courier custody is confirmed
- backend rejects completion because final-mile custody is missing

Blocked actions:
- route movement
- OTP proof
- signature proof
- photo proof
- complete delivery
- failed attempt mutation if policy requires current custody

### Offline Outbox
Use this state when:
- queued custody action is pending
- replay fails because current backend state does not match required custody
- replay conflicts with another accepted handoff

Primary route:
- `/(ops)/offline-outbox/:queuedActionId/recover`

### Admin Package Detail And Custody Chain
Use this state when:
- admin sees current custody inconsistent with status
- required handoff event is missing
- actor mismatch requires review
- custody is null before terminal status

Primary route:
- admin custody chain
- package detail
- issue detail or custody exception

## Acceptance Criteria
The state is complete when:
- every variant renders exact copy
- assignment does not unlock custody actions
- queued local custody does not look confirmed
- current owner appears above the fold
- required handoff appears above the fold
- driver route and courier proof are blocked when custody is missing
- issue and custody-chain routes receive only safe context
- raw actor IDs and proof references are hidden in field UI
- analytics excludes sensitive IDs and proof references
- route contracts match existing specs
- tests cover derivation, action visibility, offline pending, route safety, and accessibility

## Test Requirements
Unit tests:
- renders default title
- renders assignment copy for assigned driver without custody
- renders assignment copy for assigned courier without custody
- renders current owner role
- renders required handoff panel
- hides raw actor ID in field role
- shows admin evidence action only when authorized
- disables protected action
- announces sync pending

Derivation tests:
- driver assigned but not custodian maps to `driver_pickup_required`
- driver route with wrong actor maps to `driver_custody_missing`
- courier assigned but not custodian maps to `courier_acceptance_required`
- courier proof with wrong actor maps to `courier_custody_missing`
- queued action maps to `queued_custody_pending`
- `HANDOFF_PROOF_REQUIRED` maps to `handoff_proof_missing`
- `CONFLICTING_HANDOFF_STATE` maps to `custody_conflict`
- `ASSIGNMENT_SCOPE_VIOLATION` does not map to this state

Integration tests:
- driver route blocks navigation before pickup custody
- driver route opens pickup scan from blocker
- courier proof blocks proof paths before acceptance custody
- courier proof opens acceptance scan from blocker
- station receipt blocks when driver custody is missing
- offline queued pickup shows not confirmed
- offline queued courier acceptance shows not confirmed
- admin package detail shows evidence review variant

Accessibility tests:
- heading identifies blocker
- current owner is announced before actions
- route failure is announced
- keyboard reaches all actions
- reduced motion removes entrance transform
- target sizes meet minimum
- focus returns to source route action when dismissed

Privacy tests:
- raw actor ID not visible for field roles
- proof reference not visible
- receiver phone not visible
- package scan code not visible
- analytics payload excludes forbidden fields

## QA Scenarios
### Driver Assigned But Not Custodian
Given driver is assigned to delivery
And `currentCustodyRole` is `station_operator`
When driver opens route screen
Then custody not confirmed state appears
And primary action is `Open pickup scan`
And `Open navigation` is not visible

### Driver Pickup Queued Offline
Given driver pickup scan was queued offline
When driver opens route before sync succeeds
Then state shows `Custody sync pending`
And route movement remains blocked
And primary action is `Open offline outbox`

### Courier Assigned But Not Accepted
Given courier is assigned for final mile
And `currentCustodyRole` is `station_operator`
When courier opens proof selector
Then custody not confirmed state appears
And primary action is `Open acceptance scan`
And OTP proof is not visible as a start action

### Station Destination Receipt Missing Driver Custody
Given destination station opens receipt
And backend says current custody is not driver
When receipt action is attempted
Then state shows driver custody required
And station cannot receive package until custody chain is reviewed

### Admin Evidence Review
Given admin opens package detail
And current custody is null before terminal status
When state renders
Then admin sees custody evidence review
And raw proof reference is not visible
And admin can open custody chain

## Observability
Operational metrics:
- custody not confirmed views by role
- blocked driver route attempts
- blocked courier proof attempts
- queued custody pending blockers
- custody conflict blockers
- issue creation rate from custody blocker
- required handoff route open rate
- refresh cleared blocker rate

Alerting:
- spike in custody conflicts by station
- repeated driver route attempts before pickup
- repeated courier proof attempts before acceptance
- queued custody actions older than policy threshold
- custody unknown before non-terminal status
- field telemetry includes forbidden actor or proof data

Dashboard grouping:
- station ID where safe
- actor role
- attempted action
- variant
- current custody role
- required custody role
- online or offline origin
- app version

## Launch Readiness
Before pilot:
- driver route blocks before confirmed pickup custody
- courier proof blocks before confirmed courier custody
- station destination receipt blocks when driver custody is missing
- offline outbox shows queued custody as not confirmed
- custody chain opens from every blocker
- issue route accepts safe custody blocker context
- analytics scrubs actor IDs and proof references
- accessibility behavior passes modal and full-screen variants

Before scale:
- support playbook includes assignment versus custody explanation
- operations dashboard monitors custody blockers
- admin custody chain has evidence review route
- offline recovery policy covers stale queued custody actions
- QA validates every role-specific route guard

## Open Backend Boundaries
The backend currently uses `INVALID_STATUS_TRANSITION` for several custody-first failures. Frontend should map to this state only when metadata, message, or route context indicates custody is the blocker.

The backend exposes `currentCustodyRole` and `currentCustodyActorId` in delivery detail. Field UI must not render raw actor ID.

The backend does not expose every handoff proof detail in every list response. Use delivery detail and timeline where available, and mark evidence partial when timeline is missing.

Offline queued custody remains a frontend persistence concern until synced. It must never become backend truth without a successful response.

## Anti-Patterns To Reject
Reject implementation if it:
- treats assignment as custody
- lets route movement start before pickup custody
- lets courier proof start before acceptance custody
- calls queued pickup confirmed
- calls queued acceptance confirmed
- hides current owner
- hides required handoff
- displays raw actor IDs in field UI
- displays proof reference strings
- infers custody from GPS
- infers custody from latest event when `currentCustodyRole` disagrees
- offers `Continue` while custody is missing
- retries a custody mutation in background
- changes local delivery status to confirmed before backend success

## Final Build Brief For Claude Code
Build `SharedCustodyNotConfirmedState` as the authoritative shared UI state for actions that require backend-confirmed custody but do not have it. It must distinguish assignment from custody, show the current recorded owner, show the required handoff, block protected route/proof/completion actions, route to pickup scan, courier acceptance scan, custody chain, issue creation, offline recovery, or admin evidence review, and never expose raw actor IDs or proof references in field UI.
