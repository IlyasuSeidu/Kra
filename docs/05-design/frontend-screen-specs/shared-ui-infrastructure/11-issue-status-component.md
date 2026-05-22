# Issue Status Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Issue status component |
| Component family | Shared UI infrastructure |
| Primary components | `IssueStatusComponent`, `IssueStatusController`, `IssueStatusSeal`, `IssueStatusPanel`, `IssueSeverityBadge`, `IssueActionBridge` |
| Supporting components | `IssueCategoryChip`, `IssueOwnerLine`, `IssueAgeLine`, `IssueResolutionLine`, `IssueGateNotice`, `IssuePrivacyRedactor`, `IssueStatusAnnouncer`, `IssueEvidenceRouteList` |
| Inventory behavior | Open, escalated, resolved, blocked, manual review |
| Repo targets | `apps/mobile`, `apps/admin`, limited sender-safe support status in `apps/mobile`; public receiver flows excluded unless a future verified support route explicitly permits it |
| Primary surfaces | sender support thread, sender delivery detail, operations delivery detail, station blocked queue, station support, driver support, courier issues, admin issue queue, admin issue detail, admin blocked delivery queue, admin manual custody exception, admin refund evidence review |
| Primary users | senders, station operators, drivers, final-mile couriers, support admins, ops admins, finance admins, super admins, QA, accessibility reviewers |
| Backend coverage | `list_issues`, `get_issue`, `create_issue`, `escalate_issue`, `resolve_issue`, delivery `issue_reported`, delivery `on_hold`, issue fields in delivery and timeline contexts |
| Browser mutation operation | None; this component is read-only and emits open issue, create issue, escalate route, resolve route, support route, blocked queue route, or refresh intents |
| Data sensitivity | issue ID, delivery ID, summary, description, reporter actor ID, reporter role, category, severity, escalation reason, resolution note, resolution code, custody evidence, payment/refund context |
| Offline critical | Yes for operations because issue-blocked actions must not be queued as valid offline mutations; cached issue state can be shown only with freshness treatment |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, offline outbox, timeline component, custody chain component, payment status component, empty/error library, analytics tracking, test harness |
| Related screen specs | `SenderSupportThread`, `OpsIssueCreate`, `OpsSupport`, `StationBlockedQueue`, `StationSupport`, `DriverSupport`, `CourierIssues`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminBlockedDeliveryQueue`, `AdminManualCustodyException`, `AdminRefundEvidenceReview` |
| Related state specs | blocked by issue, manual review required, stale data, offline, not authorized, session expired, error, blocked by payment, custody not confirmed, webhook conflict |
| Design tokens | No unique tokens; component uses issue, severity, success, warning, danger, neutral, focus, offline, admin evidence, and privacy-redaction tokens |
| Accessibility target | Issue status, severity, category, owner, blocked state, manual-review state, and recovery action must be perceivable without color, icon, motion, or row position alone |

## Purpose
The issue status component is Kra's shared issue-lifecycle primitive.

It renders support and operational issue status consistently across sender, field staff, and admin surfaces while preserving role-specific privacy boundaries.

The component must answer:

- What is the issue status?
- Is the issue active, in review, escalated, resolved, closed, blocked, or manual review?
- What severity is attached?
- What category is attached?
- Is this issue blocking package movement?
- Who owns the next action?
- What can this user safely see?
- What action route should this user open next?
- Is the issue status fresh, stale, cached, partial, or unavailable?
- Does resolution release the workflow, or does delivery status still need refresh?

The most important rule is:

```text
Issue status alone must not release a delivery. Delivery state and backend-allowed next actions must also permit recovery.
```

## Product Job
Kra's issue system protects packages, customers, operations, and finance decisions when normal delivery flow is no longer safe.

The component must:

- normalize backend issue status into user-safe display states
- expose the inventory-required blocked and manual-review states as derived display states
- show severity without relying on color alone
- keep category and summary role-safe
- make issue gates clear to field staff
- show sender-safe support progress without internal evidence leakage
- show admin-rich issue status without making the status chip interactive
- route actions to owner screens, not mutate state inside the component
- prevent offline issue blockers from looking like confirmed recovery
- support accessible status updates on refresh and route actions
- provide stable test IDs and state mapping for all host screens

## Strategic Role
Issue status is a trust and loss-prevention surface.

If it is weak, Kra risks:

- moving a package while loss, damage, payment, or custody investigation is active
- exposing internal investigation notes to a sender or field role
- showing resolved status as if delivery movement is automatically unblocked
- hiding escalated work inside low-priority lists
- confusing manual review with generic in-progress support
- letting offline queued actions bypass issue gates
- creating finance or refund decisions without the correct issue context

The component prevents those failures by separating status, severity, category, role visibility, delivery gate, and route ownership.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared issue status primitives across mobile and admin surfaces.

Surface type:

- Reusable status seal, blocker panel, support-progress panel, and admin evidence status element.

Primary action:

- Help the user understand issue state and open the correct route without bypassing issue ownership.

Visual thesis:

- `Case signal system`: a crisp issue marker that pairs lifecycle state with severity, category, and owner, then routes the user to the safest next screen.

Restraint rule:

- Do not add issue mutation controls, chat composers, refund approval, custody override, payment verification, delivery status override, or full evidence viewers inside this component.

Density:

- Sender view is low density.
- Field staff view is medium and gate-focused.
- Admin row view is compact.
- Admin detail view is medium-high and evidence-aware.

Platform stance:

- Mobile-first for sender and operations. Desktop-dense for admin. One shared state model powers all variants.

## External Research Used
Only directly relevant issue lifecycle, severity, queue status, status-label, and accessibility references were used:

- [Zendesk ticket lifecycle and statuses](https://support.zendesk.com/hc/en-us/articles/8263915942938-About-the-ticket-lifecycle-and-ticket-statuses): supports explicit ticket stages, open work, pending/on-hold distinctions, solved state, and closed state semantics.
- [Atlassian incident severity levels](https://www.atlassian.com/incident-management/kpis/severity-levels): supports severity as an impact measure and the need for clear severity definitions.
- [Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/check-out-your-queues/): supports queues that help agents view, triage, and assign work items with summary and status.
- [GOV.UK Design System tag](https://design-system.service.gov.uk/components/tag/): supports compact non-interactive status labels and warns against making tags act as buttons or links.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for refresh, transition, blocked, and recovery states.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear explanation when issue status blocks a user action.
- [WCAG 2.2 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html): supports preserving relationships among status, severity, category, owner, and timestamps.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through issue panels, disclosures, and route actions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/09-blocked-by-issue-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/10-manual-review-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/11-escalate-issue-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/12-resolve-issue-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/18-station-blocked-queue.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/20-station-support.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/15-driver-support.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/17-courier-issues.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/24-sender-issue-create.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/25-sender-support-thread.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/29-admin-issue-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/30-admin-issue-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/11-admin-blocked-delivery-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/issues.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Non-Goals
The issue status component must not:

- implement actual frontend screens
- create an issue
- escalate an issue
- resolve an issue
- close an issue
- edit severity
- edit category
- edit summary
- edit description
- compose support replies
- approve refunds
- settle refunds
- verify payments
- override custody
- upload proof
- mutate delivery state
- show raw internal evidence to unauthorized roles
- reveal reporter actor ID to sender-facing views
- reveal resolution notes to sender-facing views unless policy explicitly approves later
- treat resolved status as automatic delivery release
- treat stale cached issue status as safe to proceed
- turn status tags into links or buttons

## Component Boundary
The issue status component owns:

- display-state derivation
- status label mapping
- severity label mapping
- category label mapping
- role redaction
- issue gate notice rendering
- manual-review notice rendering
- resolution summary rendering
- owner line rendering
- age and timestamp display
- stale and offline state display
- accessible status announcements
- action intent emission
- analytics payload shaping
- test identifiers

The host owns:

- route authorization
- data fetching
- mutation routes
- issue creation
- escalation and resolution modals
- support thread routing
- delivery detail routing
- custody, proof, payment, refund, and audit evidence routing
- outbox state
- issue counts
- queue filters
- actual analytics dispatch
- navigation execution

## Backend Issue Statuses
Canonical backend issue status enum:

```ts
type IssueStatus =
  | "open"
  | "in_review"
  | "escalated"
  | "resolved"
  | "closed";
```

Canonical severity enum:

```ts
type IssueSeverity =
  | "p1"
  | "p2"
  | "p3";
```

Canonical category enum:

```ts
type IssueCategory =
  | "delay"
  | "damage"
  | "loss"
  | "payment"
  | "handoff"
  | "other";
```

## Display Statuses
The component exposes a display status that includes backend states and derived operating states.

```ts
type IssueDisplayStatus =
  | "open"
  | "in_review"
  | "escalated"
  | "resolved"
  | "closed"
  | "blocked"
  | "manual_review"
  | "unknown";
```

Inventory-specific mapping:

- `open` maps directly to backend `open`.
- `escalated` maps directly to backend `escalated`.
- `resolved` maps directly to backend `resolved`.
- `blocked` is derived when active issue state blocks delivery or the host passes an active issue gate.
- `manual_review` is derived when issue state requires admin or support review before next workflow action.

Backend-specific mapping:

- `in_review` remains visible for admin and staff views.
- `closed` remains visible for admin and support history views.
- Sender views may simplify `closed` to `Resolved` if policy requires a less technical label.
- `unknown` is shown only when status cannot be safely determined.

## Display-State Derivation
Input:

```ts
type IssueStatusInput = {
  issueId?: string;
  deliveryId?: string;
  issueStatus?: "open" | "in_review" | "escalated" | "resolved" | "closed";
  severity?: "p1" | "p2" | "p3";
  category?: "delay" | "damage" | "loss" | "payment" | "handoff" | "other";
  summary?: string;
  description?: string;
  reporterRole?: string;
  reporterActorId?: string;
  escalatedAt?: string;
  escalationReasonCode?: string;
  resolvedAt?: string;
  resolutionCode?: string;
  closedAt?: string;
  deliveryStatus?: string;
  issueLockActive?: boolean;
  manualReviewRequired?: boolean;
  actionBlockedByIssue?: boolean;
  sourceFreshness: "fresh" | "refreshing" | "stale" | "offline_cached" | "partial" | "unknown";
};
```

Derivation:

```text
if issueLockActive is true -> blocked
else if actionBlockedByIssue is true -> blocked
else if deliveryStatus is issue_reported and issueStatus is open -> blocked
else if deliveryStatus is on_hold and issueStatus is open -> blocked
else if issueStatus is escalated -> escalated
else if manualReviewRequired is true -> manual_review
else if issueStatus is in_review -> in_review
else if issueStatus is open -> open
else if issueStatus is resolved -> resolved
else if issueStatus is closed -> closed
else -> unknown
```

Constraints:

- Do not derive `resolved` from delivery status alone.
- Do not derive `closed` from missing active issues.
- Do not derive `manual_review` solely from elapsed time.
- Do not derive `blocked` from stale cached issue count alone.
- If multiple active issues exist, host should provide the highest-risk issue or a grouped issue input.
- If the host passes an issue group, the component must surface group count and highest severity.

## Grouped Issue Input
For delivery detail and blocked queue surfaces, the host may provide grouped issue context.

```ts
type IssueGroupInput = {
  deliveryId: string;
  issues: IssueStatusInput[];
  activeIssueCount: number;
  highestSeverity?: "p1" | "p2" | "p3";
  highestDisplayStatus?: IssueDisplayStatus;
  sourceFreshness: IssueStatusInput["sourceFreshness"];
};
```

Group rules:

- `p1` outranks `p2`.
- `p2` outranks `p3`.
- `blocked` outranks `manual_review`.
- `escalated` outranks `open`.
- `open` outranks `in_review` only when no manual review context exists.
- `resolved` and `closed` do not outrank active states.
- Group card must show `activeIssueCount` when greater than `1`.

## State Authority Rules
Issue authority:

- Backend issue status is the source of truth for issue lifecycle.
- Delivery status is the source of truth for whether the delivery itself remains blocked.
- UI cannot infer issue closure from a missing issue row unless the backend response explicitly confirms no active issue.
- UI cannot release transport from issue status alone.
- UI cannot lower severity.
- UI cannot reclassify category.

Blocked authority:

- `ISSUE_LOCK_ACTIVE` and active delivery issue states block unsafe actions.
- `blocked` display state is a delivery gate, not a backend issue status.
- `blocked` must show owner route or recovery route when possible.

Manual review authority:

- `manual_review` is a display state for cases that need admin/support judgment.
- It must not create a new backend status.
- It must route to issue detail, manual custody exception, refund evidence review, or support as host supplies.

Resolution authority:

- `resolved` means an issue decision exists.
- `closed` means issue work is complete or archived.
- Neither status automatically changes delivery state.
- Host must refresh delivery and allowed next actions after issue resolution.

## Variant Model
Supported variants:

```ts
type IssueStatusVariant =
  | "seal"
  | "inline"
  | "summary_card"
  | "gate_panel"
  | "support_progress"
  | "queue_row"
  | "detail_header"
  | "admin_evidence"
  | "timeline_chip";
```

Variant jobs:

| Variant | Job | Primary Surfaces |
| --- | --- | --- |
| `seal` | Compact lifecycle label | delivery cards, list rows, table cells |
| `inline` | One-line status with severity | detail headers, thread rows |
| `summary_card` | Sender or staff overview with next route | sender delivery detail, support thread |
| `gate_panel` | Explain issue blocker and required next action | operations detail, blocked queue |
| `support_progress` | Customer-safe progress through support | sender support thread |
| `queue_row` | Dense status, severity, category, age | admin issue queue |
| `detail_header` | Case header status and authority | admin issue detail |
| `admin_evidence` | Evidence-rich issue state | manual custody exception, refund evidence review |
| `timeline_chip` | Small chip inside timeline entry | timeline component |

## Role Redaction
Role display rules:

| Role | Can See Summary | Can See Description | Can See Reporter Actor ID | Can See Resolution Note | Can Act From Component |
| --- | --- | --- | --- | --- | --- |
| sender | safe summary only | no internal description | no | no, unless future policy says otherwise | route only |
| receiver public | no issue internals | no | no | no | no |
| station operator | safe operational summary | limited if station-scoped | no raw actor ID | no | route only |
| driver | safe operational summary | limited if assignment-scoped | no raw actor ID | no | route only |
| final-mile courier | safe operational summary | limited if assignment-scoped | no raw actor ID | no | route only |
| support admin | yes | yes | yes when needed | yes | route only |
| ops admin | yes | yes | yes when needed | yes | route only |
| finance admin | payment/refund scoped | yes when finance-scoped | yes when needed | yes when finance-scoped | route only |
| super admin | yes | yes | yes | yes | route only |

Rules:

- Receiver public flows must not show issue internals.
- Sender sees status, safe category, and safe support progress.
- Field staff sees operational gate state and safe route.
- Admin sees issue facts and routes to specialized actions.
- The component does not perform the action even when the role is allowed.

## Visual Language
Status color families:

| Display Status | Visual Family | Icon Meaning | Copy Tone |
| --- | --- | --- | --- |
| `open` | amber | open circle | needs attention |
| `in_review` | blue | magnifier | being reviewed |
| `escalated` | red | upward arrow | higher attention |
| `resolved` | green | check | decision made |
| `closed` | neutral | archive | complete |
| `blocked` | red amber | stop sign | movement blocked |
| `manual_review` | blue amber | person reviewing | admin review needed |
| `unknown` | neutral | question mark | unavailable |

Severity visual language:

| Severity | Visual Family | Label | Meaning |
| --- | --- | --- | --- |
| `p1` | red | `P1 critical` | loss, safety, severe custody, severe payment, or major service risk |
| `p2` | amber | `P2 high` | active blocker requiring timely staff action |
| `p3` | blue-neutral | `P3 normal` | issue active but less urgent |

Visual rules:

- Status tag is never a link or button.
- Severity badge is never a link or button.
- Adjacent action buttons carry route behavior.
- Use text, icon, and shape together.
- Do not use badge soup.
- If both status and severity appear, status comes first and severity second.
- If status is `blocked`, gate notice must appear near the blocked action.
- If status is `manual_review`, owner route must be clear.

## Content Rules
Global copy principles:

- Use `issue` for sender and staff surfaces.
- Use `case` only in admin or support contexts.
- Use `review` for manual/admin attention.
- Use `blocked` only when a workflow action is actually blocked.
- Avoid blame language until resolution.
- Avoid exposing internal escalation reasons to senders.
- Avoid exposing resolution notes to senders by default.

Do not say:

- `Problem solved` unless backend issue status is resolved or closed.
- `Package can move now` based only on issue status.
- `Fault confirmed` before resolution.
- `Refund approved` unless refund tooling or issue resolution code confirms it.
- `Driver caused this`.
- `Station caused this`.
- `Ignore issue`.
- `Proceed anyway`.

Required microcopy by state:

| Display Status | Sender Copy | Operations Copy | Admin Copy |
| --- | --- | --- | --- |
| `open` | `Issue open.` | `Issue open. Check the next safe route.` | `Issue open.` |
| `in_review` | `Kra is reviewing this issue.` | `Issue in review. Wait for the next action.` | `Issue in review.` |
| `escalated` | `This issue has been escalated.` | `Escalated issue. Follow admin instruction.` | `Escalated issue.` |
| `resolved` | `Issue resolved.` | `Issue resolved. Refresh delivery before action.` | `Issue resolved.` |
| `closed` | `Issue closed.` | `Issue closed. Refresh delivery before action.` | `Issue closed.` |
| `blocked` | `Delivery is paused because an issue is active.` | `Issue active. Do not move this package.` | `Issue lock active.` |
| `manual_review` | `Kra is checking this before the next step.` | `Manual review required.` | `Manual review required.` |
| `unknown` | `Issue status is unavailable.` | `Issue status unavailable. Do not proceed.` | `Issue status unavailable.` |

## Category Labels
Category label mapping:

| Category | Sender Label | Staff Label | Admin Label |
| --- | --- | --- | --- |
| `delay` | `Delivery delay` | `Delay` | `Delay` |
| `damage` | `Package condition` | `Damage` | `Damage` |
| `loss` | `Package location` | `Loss` | `Loss` |
| `payment` | `Payment issue` | `Payment` | `Payment` |
| `handoff` | `Handoff issue` | `Handoff` | `Handoff` |
| `other` | `Support issue` | `Other` | `Other` |

Category rules:

- Sender category must not imply confirmed fault.
- Staff category must be operationally clear.
- Admin category must match backend enum.
- Policy dispute categories are mapped by host, not by this component unless supplied.

## Owner And Route Model
Owner labels:

```ts
type IssueOwnerDisplay =
  | "support"
  | "operations"
  | "finance"
  | "station"
  | "custody_review"
  | "manual_review"
  | "unknown";
```

Owner derivation is host-supplied.

Default routing:

| Category | Default Admin Route |
| --- | --- |
| `delay` | issue detail |
| `damage` | issue detail or refund evidence review |
| `loss` | issue detail or manual custody exception |
| `payment` | issue detail or payment reconciliation |
| `handoff` | issue detail or custody chain |
| `other` | issue detail |

Field route:

- station operator opens station blocked queue or issue detail where scoped.
- driver opens support or assigned delivery issue.
- courier opens courier issues or assigned delivery issue.

Sender route:

- sender opens support thread or delivery detail.

## Issue Actions
The component emits intents. It does not mutate issue state.

```ts
type IssueStatusIntent =
  | { type: "refresh_issue"; issueId?: string; deliveryId?: string }
  | { type: "open_issue"; issueId: string }
  | { type: "open_delivery"; deliveryId: string }
  | { type: "open_support_thread"; deliveryId: string; issueId?: string }
  | { type: "create_issue"; deliveryId: string; category?: string }
  | { type: "open_blocked_queue"; deliveryId?: string; stationId?: string }
  | { type: "open_escalation"; issueId: string }
  | { type: "open_resolution"; issueId: string }
  | { type: "open_custody_review"; deliveryId: string; issueId?: string }
  | { type: "open_refund_review"; deliveryId: string; issueId?: string }
  | { type: "open_payment_review"; deliveryId: string; issueId?: string }
  | { type: "copy_issue_id"; issueId: string };
```

Action availability:

| Display Status | Sender Action | Operations Action | Admin Action |
| --- | --- | --- | --- |
| `open` | open support thread | open issue/support route | open issue detail |
| `in_review` | open support thread | wait or open issue route | open issue detail |
| `escalated` | open support thread | follow admin route | open issue detail |
| `resolved` | open support thread or delivery | refresh delivery | close or open detail if allowed |
| `closed` | open history where allowed | refresh delivery | open history detail |
| `blocked` | open support thread | open blocked queue | open issue detail or specialist review |
| `manual_review` | open support thread | open support route | open review owner route |
| `unknown` | refresh | refresh or support | refresh or investigate |

Disabled rules:

- Disable mutation-like routes when role lacks capability.
- Disable copy issue ID when no issue ID exists.
- Disable network refresh when offline.
- Do not show escalation for sender or field roles.
- Do not show resolution from this component; show route intent only for host modal.

## Layout Rules
Compact seal:

- Status label only.
- Optional severity badge if space permits.
- Optional active issue count for grouped issues.
- No action inside tag.

Inline:

- Status.
- Severity.
- Category.
- Updated time.
- Single route action if host supplies one.

Summary card:

- Status headline.
- Safe explanation.
- Severity and category.
- Last updated time.
- Owner line.
- One primary route.
- One secondary route at most.

Gate panel:

- Strong blocker heading.
- Safe reason line.
- Current issue status.
- Severity and category.
- Required next owner.
- Route to blocked queue, issue detail, support, or specialist review.
- No movement CTA inside component.

Support progress:

- Sender-safe lifecycle: `Received`, `In review`, `Escalated`, `Resolved`.
- Do not expose closed vs archived detail unless copy policy approves.
- Do not show internal notes.

Queue row:

- Status tag.
- Severity badge.
- Category.
- Summary.
- Updated age.
- Owner route.
- No inline mutation controls.

Detail header:

- Issue ID.
- Status.
- Severity.
- Category.
- Reporter role.
- Created and updated time.
- Escalation or resolution evidence if present.

Admin evidence:

- Status and severity.
- Category and reason context.
- Reporter and owner.
- Escalation and resolution metadata.
- Linked delivery and specialist route list.

Timeline chip:

- Short status and category.
- No description.
- No actor ID.

## Information Architecture
Recommended order:

1. Status label.
2. Severity.
3. Category.
4. Safe issue summary.
5. Gate or review meaning.
6. Owner or route.
7. Timestamp.
8. Admin-only evidence metadata.
9. Actions.

Do not lead with:

- reporter actor ID
- raw description
- resolution note
- escalation reason
- linked payment reference
- proof reference
- custody evidence ID

Those details are evidence fields, not primary status orientation.

## Data Freshness
Freshness states:

```ts
type IssueFreshness =
  | "fresh"
  | "refreshing"
  | "stale"
  | "offline_cached"
  | "partial"
  | "unknown";
```

Freshness rules:

- `fresh`: no banner required.
- `refreshing`: keep previous status visible and announce refresh.
- `stale`: show `Issue status may have changed. Refresh before action.`
- `offline_cached`: show `Showing saved issue status. Confirm online before moving package.`
- `partial`: show `Issue status loaded without all linked context.`
- `unknown`: show `Issue status source is unknown.`

Operations rule:

- Stale or offline cached resolved status cannot unlock a new custody, dispatch, final-mile, return, proof, or completion mutation.

Sender rule:

- Stale issue status can remain visible but must not promise a final outcome.

Admin rule:

- Queue rows must show loaded-scope and generated time from host when available.

## Issue Gate Rules
Gate applies when:

- delivery status is `issue_reported`
- delivery status is `on_hold`
- backend returns `ISSUE_LOCK_ACTIVE`
- active issue has status `open`, `in_review`, or `escalated`
- host passes `actionBlockedByIssue=true`
- manual custody, refund evidence, payment, or support review owns next action

Gate does not apply when:

- all linked issues are `resolved` and delivery has refreshed into an allowed state
- all linked issues are `closed` and delivery has refreshed into an allowed state
- issue history exists but no active issue remains
- only a stale cached issue row is present

Gate copy:

- `Issue active. Do not move this package.`
- `Manual review required before this action.`
- `Refresh delivery after resolution before continuing.`

Disallowed gate copy:

- `Resolved, continue now` without delivery refresh.
- `Ignore issue`.
- `Proceed anyway`.
- `Force complete`.

## Manual Review State
`manual_review` is a display state, not a backend issue status.

Use it when:

- custody evidence needs admin review
- refund or dispute evidence needs support/admin review
- payment-related issue needs finance review
- delivery is on hold and the next route is a human review screen
- issue has `in_review` status but the host needs the inventory label `manual review`
- backend error maps to manual review required

Do not use it when:

- issue is simply open with no review owner
- issue is already escalated
- issue is resolved
- issue is closed
- payment is under review with no issue context
- station validation is pending without an issue

Manual review copy:

- Sender: `Kra is checking this before the next step.`
- Field staff: `Manual review required.`
- Admin: `Manual review required. Open the owner screen.`

## Severity Rules
Severity is impact, not the same thing as status.

Rules:

- Always render severity when provided.
- If missing, show no severity badge rather than guessing.
- P1 must always be visible above the fold in card and panel variants.
- P1 gate panels must not use subtle styling.
- P2 and P3 must remain readable and not rely on muted contrast.
- Do not allow severity edits from this component.

Severity copy:

- `P1 critical`
- `P2 high`
- `P3 normal`

Severity helper text:

- P1: `Immediate attention required.`
- P2: `High-priority issue.`
- P3: `Standard issue.`

## Status Transition Awareness
Backend transition rules:

- `open` can move to `in_review`.
- `open`, `in_review`, or `escalated` can move to `resolved`.
- `resolved` can move to `closed`.
- `closed` cannot be resolved again.

Component behavior:

- Show action routes according to host capabilities.
- Do not perform transition.
- When status is `resolved`, show `Refresh delivery before continuing`.
- When status is `closed`, show history treatment and no active blocker unless delivery remains blocked.
- When status is `escalated`, show escalation evidence if role allows.

## Privacy Redaction
Sender-safe fields:

- status label
- safe category
- safe summary
- support progress
- updated time
- safe next action

Sender-hidden fields:

- reporter actor ID
- internal description
- escalation reason
- resolution note
- custody proof references
- payment provider references
- admin-only comments

Field-safe fields:

- status label
- severity
- category
- safe operational summary
- blocked route
- updated time
- station or delivery context if scoped

Field-hidden fields:

- unrelated actor IDs
- sender dispute notes unless needed for the job
- finance details
- internal admin notes
- raw proof references

Admin fields:

- full issue fields as allowed by route.
- reveal of sensitive evidence remains host-owned.

## Interaction Contracts
Props:

```ts
type IssueStatusComponentProps = {
  variant: IssueStatusVariant;
  role:
    | "sender"
    | "station_operator"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin"
    | "finance_admin"
    | "super_admin";
  issue?: IssueStatusInput;
  issueGroup?: IssueGroupInput;
  capabilities: {
    canRefreshIssue: boolean;
    canOpenIssue: boolean;
    canCreateIssue: boolean;
    canEscalateIssue: boolean;
    canResolveIssue: boolean;
    canOpenBlockedQueue: boolean;
    canOpenSupportThread: boolean;
    canCopyIssueId: boolean;
  };
  gate?: {
    blockedActionLabel?: string;
    hostActionBlocked: boolean;
    ownerDisplay?: IssueOwnerDisplay;
  };
  onIntent: (intent: IssueStatusIntent) => void;
};
```

Required test IDs:

- `issue-status-root`
- `issue-status-seal`
- `issue-status-label`
- `issue-status-severity`
- `issue-status-category`
- `issue-status-summary`
- `issue-status-owner`
- `issue-status-age`
- `issue-status-freshness`
- `issue-status-gate`
- `issue-status-manual-review`
- `issue-status-primary-action`
- `issue-status-secondary-action`
- `issue-status-sensitive-disclosure`
- `issue-status-announcer`

## State Matrix
`open`:

- Label: `Issue open`
- Severity: from issue
- Blocks workflow: yes when issue is active and delivery context says blocked
- Sender action: open support thread
- Operations action: open issue or support route
- Admin action: open issue detail

`in_review`:

- Label: `In review`
- Severity: from issue
- Blocks workflow: yes for active delivery issues
- Sender action: open support thread
- Operations action: wait or open issue route
- Admin action: open issue detail

`escalated`:

- Label: `Escalated`
- Severity: from issue
- Blocks workflow: yes
- Sender action: open support thread
- Operations action: follow admin route
- Admin action: open issue detail

`resolved`:

- Label: `Resolved`
- Severity: optional or muted
- Blocks workflow: no unless delivery still blocked
- Sender action: open support thread or delivery
- Operations action: refresh delivery
- Admin action: open issue detail or close route

`closed`:

- Label: `Closed`
- Severity: muted
- Blocks workflow: no unless delivery still blocked for another reason
- Sender action: support history if allowed
- Operations action: refresh delivery
- Admin action: open history detail

`blocked`:

- Label: `Issue blocked`
- Severity: from highest active issue
- Blocks workflow: yes
- Sender action: open support thread
- Operations action: open blocked queue
- Admin action: open issue detail or specialist review

`manual_review`:

- Label: `Manual review`
- Severity: from issue or host
- Blocks workflow: yes if host action is blocked
- Sender action: open support thread
- Operations action: open support route
- Admin action: open owner review route

`unknown`:

- Label: `Issue status unavailable`
- Severity: none
- Blocks workflow: yes for safety if action depends on issue state
- Sender action: refresh or support
- Operations action: refresh or support
- Admin action: refresh or investigate

## Screen Integration Rules
Sender support thread:

- Use support progress or summary card.
- Hide internal notes, reporter actor IDs, escalation reason, and resolution notes.
- Show safe status and route to support messages.

Sender delivery detail:

- Use inline or summary card.
- If active issue blocks delivery progress, show gate summary.
- Do not show admin issue routes.

Operations delivery detail:

- Use gate panel when active issue blocks a scan, custody, dispatch, final-mile, return, proof, or completion action.
- Field roles see safe operational summary and route only.
- No mutation from component.

Station blocked queue:

- Use queue row or gate panel.
- Show severity, category, status, age, and owner route.
- Keep stale and offline states visible.

Driver support and courier issues:

- Use summary card or inline.
- Show assigned-delivery issue only.
- No admin status action.

Admin issue queue:

- Use queue row.
- Show status, severity, category, age, loaded-scope owner, and route.
- Do not include resolve or escalate inline mutation.

Admin issue detail:

- Use detail header.
- Route action buttons open the correct modal or specialist screen.
- Component shows transition hints only.

Admin blocked delivery queue:

- Use gate panel with grouped issue support.
- Show highest severity and active issue count.
- Route to issue detail or specialist evidence screens.

Admin manual custody exception:

- Use admin evidence variant.
- `manual_review` and `blocked` states are primary.
- Show custody review route supplied by host.

Admin refund evidence review:

- Use admin evidence variant.
- Show payment/refund issue category, status, severity, and route to refund decision or issue detail.

Timeline component:

- Use timeline chip.
- Show status/category only.
- Do not reveal descriptions or notes.

## Empty And Error States
No issue:

- Sender: `No issue is open for this delivery.`
- Operations: `No active issue is attached. Refresh if the action is still blocked.`
- Admin: `No issue record is attached to this context.`

Partial data:

- `Issue status loaded without all linked context.`

Unavailable data:

- `Issue status is unavailable. Refresh before taking action.`

Permission denied:

- `You do not have access to this issue.`

Offline:

- `Showing saved issue status. Confirm online before moving package.`

Stale:

- `Issue status may have changed. Refresh before action.`

Rules:

- Do not collapse issue blockers into generic errors.
- Do not show raw API errors to sender-facing users.
- Admin can see safe backend error code if host supplies it.
- If issue cannot be loaded but delivery says `issue_reported`, render a conservative gate.

## Accessibility Requirements
Semantic structure:

- Use a heading for card, panel, and detail header variants.
- Use text adjacent to status icons.
- Use `time` with machine-readable `dateTime` for timestamps.
- Use description lists for admin metadata.
- Use table semantics only when host table owns row structure.
- Status tag itself must not be interactive.

Status announcements:

- Refresh start announces `Checking issue status.`
- Refresh success announces the new status.
- Refresh failure announces `Issue status could not be refreshed.`
- Blocked action announces the safe reason.
- Status changes use an `aria-live="polite"` region.

Focus:

- Keep focus stable after refresh.
- If route action appears after status change, do not auto-focus it.
- If opening a modal through host intent, host handles focus in that modal.
- Detail disclosures must follow reading order.

Color and contrast:

- Status and severity cannot rely on color alone.
- Labels must meet contrast requirements.
- Disabled route actions must remain readable.
- P3 neutral treatment must not be too low contrast.

Large text:

- Status seal wraps without clipping.
- Summary card keeps status before summary.
- Queue row must not truncate status or severity without accessible full text.

Reduced motion:

- Disable transitions.
- Do not pulse open, escalated, or blocked states continuously.

## Analytics Events
The component prepares analytics payloads; host dispatches them.

Display event:

```ts
type IssueStatusViewedEvent = {
  eventName: "issue_status_viewed";
  surface: string;
  variant: IssueStatusVariant;
  role: string;
  displayStatus: IssueDisplayStatus;
  backendIssueStatus?: string;
  severity?: string;
  category?: string;
  sourceFreshness: IssueFreshness;
  deliveryId?: string;
  issueId?: string;
  activeIssueCount?: number;
  gateShown: boolean;
};
```

Action event:

```ts
type IssueStatusActionEvent = {
  eventName: "issue_status_action_selected";
  surface: string;
  variant: IssueStatusVariant;
  role: string;
  actionType: IssueStatusIntent["type"];
  displayStatus: IssueDisplayStatus;
  severity?: string;
  category?: string;
  deliveryId?: string;
  issueId?: string;
};
```

Privacy rules:

- Do not include issue description in analytics.
- Do not include reporter actor ID in analytics.
- Do not include resolution note in analytics.
- Do not include escalation note in analytics.
- Do not include proof, payment provider, or custody evidence reference in analytics.

## Performance Requirements
Rendering:

- Component renders from host data.
- Component must not fetch issue data directly.
- Component must not run polling loops.
- Component must not import admin-only modal code into mobile bundles.
- Grouped issue derivation should be linear in loaded issues.
- Queue row rendering must keep date formatting and severity mapping cheap.

Refresh:

- Host handles query invalidation.
- Host handles rate limits.
- Host handles stale result reconciliation.
- Refresh intent includes delivery or issue context only.

Offline:

- Component reads freshness from host.
- Component does not store issue data itself.
- Offline cached state never unlocks a blocked operational action.

## Security And Privacy
Hard rules:

- Do not expose reporter actor ID to sender-facing or public receiver surfaces.
- Do not expose internal issue description to sender-facing views by default.
- Do not expose resolution note to sender-facing views by default.
- Do not expose escalation reason to sender-facing views.
- Do not expose proof references.
- Do not expose payment provider references.
- Do not expose raw custody evidence IDs.
- Do not expose admin-only issue routes to unauthorized roles.
- Do not allow copy issue ID unless role and host capability permit it.

Sender-safe summary:

- Must be generated from approved copy or safe host field.
- Must not include blame, actor IDs, internal station notes, raw proof IDs, or payment provider references.

Field-safe summary:

- Must be short and actionable.
- Must not include unrelated customer notes.
- Must not include finance-sensitive data unless route policy permits it.

Admin-sensitive fields:

- Shown only in admin variants.
- Sensitive reveal remains host-owned and audited if needed.

## Localization
String keys:

- `issue.status.open.label`
- `issue.status.in_review.label`
- `issue.status.escalated.label`
- `issue.status.resolved.label`
- `issue.status.closed.label`
- `issue.status.blocked.label`
- `issue.status.manual_review.label`
- `issue.status.unknown.label`
- `issue.severity.p1.label`
- `issue.severity.p2.label`
- `issue.severity.p3.label`
- `issue.category.delay.label`
- `issue.category.damage.label`
- `issue.category.loss.label`
- `issue.category.payment.label`
- `issue.category.handoff.label`
- `issue.category.other.label`
- `issue.action.refresh`
- `issue.action.open_issue`
- `issue.action.open_support_thread`
- `issue.action.open_blocked_queue`
- `issue.action.open_review`
- `issue.freshness.stale`
- `issue.freshness.offline_cached`
- `issue.gate.blocked`
- `issue.manual_review.required`

Localization rules:

- Ghana launch copy is English-first.
- Keep field-worker labels short.
- Avoid legal blame language.
- Avoid idioms around loss, damage, or fault.
- Keep severity labels stable across locales.

## Test Matrix
Display derivation tests:

- backend `open` -> `open`.
- backend `in_review` -> `in_review`.
- backend `escalated` -> `escalated`.
- backend `resolved` -> `resolved`.
- backend `closed` -> `closed`.
- `issueLockActive=true` -> `blocked`.
- `actionBlockedByIssue=true` -> `blocked`.
- delivery `issue_reported` plus active issue -> `blocked`.
- delivery `on_hold` plus active issue -> `blocked`.
- `manualReviewRequired=true` -> `manual_review` when no higher blocker applies.
- missing status -> `unknown`.

Group tests:

- active P1 issue outranks P2 and P3.
- blocked issue outranks manual review.
- escalated issue outranks open.
- resolved issue does not outrank active issue.
- closed issue does not create active gate.
- group count renders when active issue count is greater than `1`.

Role tests:

- sender cannot see reporter actor ID.
- sender cannot see internal description.
- sender cannot see resolution note.
- receiver public sees no issue internals.
- station operator sees gate and safe summary only.
- driver sees assigned-delivery gate only.
- courier sees assigned-delivery gate only.
- finance admin sees finance-scoped issue context.
- support admin sees issue detail context.
- ops admin sees operational issue context.

Action tests:

- status tag is not interactive.
- seal does not navigate by itself.
- sender route opens support thread intent.
- operations gate opens blocked queue intent.
- admin queue row opens issue detail intent.
- escalation route is hidden for sender and field roles.
- resolution route is hidden for sender and field roles.
- copy issue ID is hidden without capability.

Freshness tests:

- stale state shows refresh warning.
- offline cached resolved state does not unlock operational action.
- refreshing state preserves previous status.
- partial state shows linked context warning.
- unknown freshness shows source warning.

Accessibility tests:

- status label has visible text.
- severity has visible text.
- live region announces refresh result.
- blocked action explains reason.
- focus remains stable after refresh.
- large text does not clip status or severity.
- reduced motion disables transitions.

Security tests:

- sender HTML excludes reporter actor ID.
- sender HTML excludes resolution note.
- field role HTML excludes finance references.
- receiver public HTML excludes issue internals.
- analytics excludes description, notes, and evidence references.

## Acceptance Criteria
The spec is complete only if a future implementation can satisfy these checks:

- Every backend issue status maps to one safe display state.
- `blocked` is derived from delivery gate or issue lock context, not guessed.
- `manual_review` is derived from explicit host or issue-review context, not guessed.
- Status and severity are visually and textually distinct.
- Status tags are not interactive.
- Sender, field, support, ops, finance, and super-admin redaction rules are explicit.
- Active issue state blocks unsafe operational mutations.
- Resolved or closed issue status does not automatically release delivery.
- Offline cached issue status cannot unlock issue-gated operational actions.
- Admin routes are emitted as intents and not performed inside the component.
- Accessibility behavior covers labels, announcements, focus, contrast, large text, and reduced motion.
- Analytics excludes sensitive issue content.
- Test IDs cover status, severity, category, owner, freshness, gates, manual review, and actions.

## Claude Code Build Notes
When implementing later:

- Build a pure display-state derivation function first.
- Unit test derivation before rendering variants.
- Keep the component read-only.
- Accept data from typed API client or host adapters.
- Use explicit capabilities instead of role checks alone.
- Do not import admin modal code into mobile variant bundles.
- Do not make tags interactive.
- Keep issue gate, status, severity, and route action as separate elements.
- Keep sender-safe and admin-rich views in one shared state model with role redaction.

## Completion Checklist
- Component boundary is read-only.
- Backend statuses are mapped.
- Derived `blocked` and `manual_review` statuses are defined.
- Severity and category labels are defined.
- Role redaction is explicit.
- Issue gate behavior is explicit.
- Resolution release rule is explicit.
- Offline and stale behavior is explicit.
- Admin routing behavior is explicit.
- Public receiver exclusion is explicit.
- Accessibility behavior is explicit.
- Analytics privacy is explicit.
- Testing matrix covers status, severity, category, role, freshness, gate, manual review, and action states.

## Final Quality Review
Product completeness:

- Pass. The spec covers open, in review, escalated, resolved, closed, blocked, manual review, and unknown states.

Backend alignment:

- Pass. The spec respects Kra's current issue enum and derives inventory-required display states without requiring immediate backend enum changes.

Operational safety:

- Pass. The spec blocks unsafe movement when an active issue gate exists and requires delivery refresh after resolution.

Privacy:

- Pass. The spec separates sender-safe, field-safe, support/admin, finance, and super-admin issue visibility.

Accessibility:

- Pass. The spec requires visible labels, live regions, focus stability, readable contrast, large-text resilience, and reduced-motion behavior.

Implementation boundary:

- Pass. The spec defines a shared component contract and does not implement actual frontend UI.
