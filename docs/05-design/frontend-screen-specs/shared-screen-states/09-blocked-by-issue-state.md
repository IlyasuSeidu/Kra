# Blocked By Issue State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `blocked_by_issue` |
| Component family | Shared screen state |
| Primary component | `SharedBlockedByIssueState` |
| Supporting components | `IssueLockCard`, `IssueSeveritySeal`, `IssueStatusRail`, `IssueRecoveryActions`, `IssueOwnerStrip`, `IssueEvidenceNudge`, `IssueSafeSummary`, `IssueRouteLink` |
| Primary surfaces | sender mobile app, operations mobile app, station operator mobile app, driver mobile app, final-mile courier mobile app, admin web console |
| Required recovery | open issue detail, open blocked queue, contact support, refresh delivery, or wait for assigned issue owner |
| Test id root | `state-blocked-by-issue` |
| Backend coverage | `ISSUE_LOCK_ACTIVE`, delivery `issue_reported`, delivery `on_hold`, active support issue status, handoff conflict routed to issue, receiver refusal routed to issue |
| Browser mutation operation | None directly; this state blocks unsafe delivery, custody, dispatch, receipt, return, cancellation, and completion actions until backend state allows recovery |
| Data sensitivity | issue summary, category, severity, issue owner, reporter role, resolution note, location context, custody evidence, dispute context |
| Offline critical | Yes for operations mobile because issue-blocked actions must not be queued as if they can proceed |
| Related inventory state | `blocked_by_issue` |
| Related state specs | error, offline, stale data, not authorized, session expired, manual review required, scan mismatch, custody not confirmed, proof required |
| Design tokens | `issue.red.700`, `issue.red.600`, `issue.amber.600`, `issue.blue.600`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with status announcements, non-color severity, keyboard recovery actions, and no hidden issue meaning |

## Purpose
`SharedBlockedByIssueState` is the shared UI state shown when a delivery, package, handoff, station action, driver action, courier action, sender action, or admin workflow cannot proceed because an active issue or hold owns the next decision.

This state must answer:
- `Why is this delivery blocked?`
- `What kind of issue is active?`
- `How severe is it?`
- `Who owns the next action?`
- `Can I continue, wait, escalate, or open the issue?`
- `Can I still see package location and custody?`
- `What should a sender see without exposing internal details?`
- `What should staff see without creating an unsafe bypass?`
- `What changes when the issue is resolved?`

The most important rule is:
```text
No delivery workflow can bypass an active issue lock.
```

## Product Job
Kra must protect goods, customers, staff, and the custody chain whenever a delivery enters `issue_reported`, `on_hold`, or an active support issue state. The UI has to make the block unmistakable while giving the correct role a precise path to resolution.

The blocked-by-issue state must:
- stop unsafe dispatch, receipt, handoff, final-mile movement, pickup release, return, cancellation, refund, and completion actions
- preserve visibility into safe delivery context
- avoid leaking internal issue detail to senders, receivers, or unrelated staff
- point authorized staff to the issue detail
- point station teams to the blocked queue when a station owns next action
- point senders to safe support or tracking context
- show severity without relying on color alone
- show status and owner without implying that the user can fix every issue
- prevent local offline writes for blocked transport actions
- recover cleanly when backend moves the delivery out of the blocked state

## Strategic Role
The issue blocker is one of the core trust surfaces in Kra. It prevents loss, misdelivery, dispute confusion, duplicate handling, and unsafe release of goods. It also gives operations a shared language for urgent problems across stations, drivers, couriers, support, and admin.

If this state is weak, staff will treat issue locks as vague errors and try to work around them. If it is too broad, it will hide real next actions and slow the network. The design must be strict and specific:
- strict enough to prevent movement during investigation
- specific enough to show who owns recovery
- calm enough to reduce panic during high-severity events
- privacy-safe enough to avoid exposing blame or sensitive evidence

This state is not a generic error. It is a decision gate.

## External Research Used
Only directly relevant incident, ticket-state, HTTP lock, and accessibility references were used:
- [Atlassian incident severity levels](https://www.atlassian.com/incident-management/kpis/severity-levels): supports consistent severity language and urgency ordering for operational triage.
- [Zendesk ticket lifecycle and ticket statuses](https://support.zendesk.com/hc/en-us/articles/8263915942938-About-the-ticket-lifecycle-and-ticket-statuses): supports issue status clarity across open, pending, solved, and closed support work.
- [MDN HTTP 423 Locked](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/423): supports the locked-resource meaning behind `ISSUE_LOCK_ACTIVE`.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible status updates after refresh, retry, escalation, and resolution checks.
- [W3C WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear identification of blocked actions and recovery guidance.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/cancellation-rules.md`
- `docs/03-business/package-statuses.md`
- `docs/07-data/state-machine.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/04-features/tracking-spec.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/02-ops-delivery-detail.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/18-station-blocked-queue.md`
- `services/api/src/issues.ts`
- `services/api/src/public-tracking.ts`
- `packages/shared/src/domain/state-machine.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/contracts/api.ts`

## Visual Thesis
Blocked by issue should feel like a sealed operations gate with a clear owner, not a crash screen.

Use:
- red for urgent P1 lock
- amber for P2 and hold states
- blue for safe routing actions
- neutral rails for status history
- a strong top seal with issue status, severity, and owner
- one dominant recovery action
- a short, concrete reason line
- clear disabled action treatment near the action that was blocked
- quiet supporting context below the gate

Do not use:
- generic `Something went wrong`
- vague `Issue found`
- blame language
- raw investigation notes for unauthorized roles
- full evidence detail in the shared state
- transport CTAs beside the block
- hidden recovery links
- color-only severity
- celebratory resolution language before backend state changes

## Audience
Primary users:
- sender checking why a delivery is not moving
- station operator trying to dispatch, receive, release, or return a blocked package
- driver trying to accept, pick up, transfer, or complete a route segment
- final-mile courier trying to accept, start, deliver, retry, or return a blocked job
- support admin triaging the issue
- operations admin resolving or escalating the issue
- finance admin when the issue is connected to payment, refund, or compensation

Secondary users:
- station lead monitoring blocked work
- ops lead watching issue volume and severity
- QA validating blocked-state routing
- backend engineer validating API error mapping
- accessibility reviewer validating status feedback
- Claude Code implementing the shared state later

Non-users:
- public receiver without verified delivery access
- unauthenticated visitor
- unrelated station staff
- payment provider
- webhook sender
- scheduled worker

## Non-Goals
Do not use blocked by issue for:
- payment not confirmed
- payment under review without an active operational issue
- refund waiting for settlement
- session expiry
- permission denial
- missing proof when no issue lock exists
- OTP requirement
- package scan mismatch before an issue is created
- duplicate label before an issue is created
- stale data warning alone
- offline-only warning
- generic server failure
- route pricing error
- station service validation blocker
- launch readiness blocker outside delivery-level context

If a block is caused by issue investigation, use `blocked_by_issue`. If a block is caused by payment status, use `blocked_by_payment` or `payment_under_review`. If a block is caused by authority, use `not_authorized`.

## State Definition
`blocked_by_issue` is active when the current workflow cannot proceed because backend state says an issue, hold, or investigation owns the next decision.

Canonical triggers:
- delivery status is `issue_reported`
- delivery status is `on_hold`
- API returns `ISSUE_LOCK_ACTIVE`
- current delivery has an active support issue with status `open`, `in_review`, or `escalated`
- handoff conflict has been escalated into an issue
- receiver refusal has been routed into issue review
- loss or damage claim has opened a support issue
- custody mismatch has opened a support issue

Non-canonical triggers:
- local optimistic client state alone
- route parameter alone
- stale cached issue count alone
- issue history where all linked issues are `resolved` or `closed`

## Issue Status Model
Use the backend issue status enum as the source of truth.

| Issue Status | UI Label | Blocks Workflow | Primary Meaning |
| --- | --- | --- | --- |
| `open` | `Issue open` | yes | A new issue exists and has not been reviewed enough for movement |
| `in_review` | `In review` | yes | Staff are checking evidence or deciding next step |
| `escalated` | `Escalated` | yes | Higher authority owns the next decision |
| `resolved` | `Resolved` | no, unless delivery status remains blocked | Issue decision exists but delivery state must still be refreshed |
| `closed` | `Closed` | no | Issue work is complete and archived |

UI rule:
```text
Issue status alone does not release a delivery. Delivery status and allowed next actions must also permit recovery.
```

## Delivery Status Model
Delivery status affects whether the issue blocker appears.

| Delivery Status | UI Label | Blocker Behavior |
| --- | --- | --- |
| `issue_reported` | `Issue reported` | show full blocker and route to issue detail |
| `on_hold` | `On hold` | show hold-focused blocker and route to station/support recovery |
| `delivery_failed` | `Delivery failed` | show terminal failure UI, not this shared state unless an active issue action is being attempted |
| any active status with `ISSUE_LOCK_ACTIVE` | current status label plus issue seal | show inline blocker for the attempted action |

`issue_reported` means the delivery cannot continue until an authorized actor resolves or redirects the issue. `on_hold` means movement is paused by policy or unresolved condition, usually after pickup delay, refusal, or support handling.

## Issue Severity Model
Use `p1`, `p2`, and `p3` as stable severity values.

| Severity | Label | Tone | Meaning |
| --- | --- | --- | --- |
| `p1` | `P1 critical` | red | Loss, safety, severe custody conflict, high-value risk, or urgent service stop |
| `p2` | `P2 high` | amber | Delivery cannot proceed and staff action is required soon |
| `p3` | `P3 normal` | blue-neutral | Issue is active but not urgent if the package remains safe |

Severity display rules:
- show severity as text, shape, and color
- never rely on red, amber, or blue alone
- keep severity labels stable across all role surfaces
- never let a user lower severity from this shared state
- route severity changes to issue detail where authorized
- show P1 confirmation only on issue creation or escalation flows, not here

## Issue Category Model
Backend issue categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Policy dispute categories that may map into issue handling:
- `payment_dispute`
- `refund_request`
- `service_delay`
- `loss_claim`
- `damage_claim`
- `receiver_refusal`
- `custody_mismatch`

Category display rules:
- sender sees safe category label only
- operations staff sees category and safe summary
- support/admin can open full issue detail
- receiver public tracking should not expose category unless policy explicitly allows it later
- category must not imply blame before resolution

## Category Copy
| Category | Safe Label | Staff Label | Sender Detail |
| --- | --- | --- | --- |
| `delay` | `Delivery delay` | `Delay issue` | `Kra is checking the delay before the delivery continues.` |
| `damage` | `Package condition review` | `Damage issue` | `Kra is reviewing the package condition before next steps.` |
| `loss` | `Package location review` | `Loss issue` | `Kra is checking package location before movement continues.` |
| `payment` | `Payment support issue` | `Payment issue` | `Kra is checking a payment-related issue for this delivery.` |
| `handoff` | `Custody review` | `Handoff issue` | `Kra is reviewing custody records before movement continues.` |
| `other` | `Support review` | `Other issue` | `Kra is reviewing this delivery before it can continue.` |

## Entry Rules
Enter blocked by issue when:
- `delivery.currentStatus === "issue_reported"`
- `delivery.currentStatus === "on_hold"` and current action requires movement or release
- mutation response code is `ISSUE_LOCK_ACTIVE`
- mutation response says active issue prevents transition
- linked active issue status is `open`, `in_review`, or `escalated`
- blocked queue row has `blockerType === "issue"`
- support list row is opened from a delivery action and issue remains active
- public tracking label is `Issue under review` and the user is inside authenticated sender detail

Do not enter when:
- issue status is `resolved` and delivery has a valid next action
- issue status is `closed` and delivery status is not blocked
- the only signal is old issue history
- the user lacks permission to know issue context
- the error is purely network failure
- the block is payment-only
- the block is proof-only
- the block is scan-only

## Exit Rules
Exit blocked by issue only when backend says one of these is true:
- delivery status moved from `issue_reported` to `awaiting_receiver_pickup`
- delivery status moved from `issue_reported` to `delivery_failed`
- delivery status moved from `on_hold` to `awaiting_receiver_pickup`
- delivery status moved from `on_hold` to `delivery_failed`
- attempted mutation succeeds after refresh
- active issue changed to `resolved` or `closed` and delivery state now allows the action
- backend returns a different blocker state with higher specificity

Never exit because:
- client timer expired
- user dismissed the panel
- local issue cache is empty but delivery status remains blocked
- issue detail route failed to load
- support note was added
- escalation was submitted
- sender acknowledged the message

## Recovery Promise
The state must always provide at least one useful recovery route.

Recovery order:
1. Open issue detail when the user is authorized.
2. Open blocked queue when station or operations role owns recovery.
3. Refresh delivery when the user may be seeing stale state.
4. Contact support when the sender cannot view issue detail.
5. Return to safe previous screen when no recovery route is available.

If all specific recovery actions are unavailable, show:
```text
This delivery is locked while an issue is being reviewed. Refresh the delivery or contact support.
```

## Role Behavior Matrix
| Role | What They See | Primary Action | Secondary Action |
| --- | --- | --- | --- |
| sender | safe issue label, status, expected next update if known | `Contact support` or `View tracking` | `Refresh` |
| receiver | public-safe tracking label only when authenticated later | `View tracking` | none |
| station_operator | issue seal, category, severity, owner, delivery context | `Open issue` | `Open blocked queue` |
| station_supervisor | issue seal, severity, station scope, escalation hint | `Open issue` | `Assign owner` if supported later |
| driver | safe issue label and route impact | `Open issue` if assigned | `Call station` |
| final_mile_courier | safe issue label and job impact | `Open issue` if assigned | `Return to assignments` |
| support_admin | full issue route, status, severity, category | `Open issue` | `Escalate` where allowed |
| ops_admin | full issue route and operational block summary | `Open issue` | `Review delivery` |
| finance_admin | payment/refund issue context if category is payment | `Open issue` | `Open payment record` |

## Privacy Rules
The shared state must protect issue detail.

Always safe:
- delivery label
- safe delivery status
- safe issue status
- safe category label
- severity label when role is staff or sender
- issue created or updated timestamp
- safe next action

Staff-safe:
- issue ID
- category
- severity
- owner
- reporter role
- issue summary if marked safe for staff
- station context
- custody context

Admin-safe:
- internal resolution note
- escalation reason
- reporter actor ID
- linked dispute record
- linked payment reference where authorized
- full custody evidence path

Never show in this shared state:
- raw evidence attachment content
- private phone numbers
- full address if not needed for the current role
- blame assignment before resolution
- security or fraud signals
- provider secrets
- internal audit trail details

## Content Hierarchy
Top hierarchy:
1. Status seal: `Delivery locked`
2. Reason line: `This delivery is locked while an issue is being reviewed.`
3. Severity and status: `P2 high`, `In review`
4. Owner line: `Support owns the next action` or `Station owns the next action`
5. Primary action: `Open issue`
6. Secondary action: `Refresh`
7. Safe context: delivery label, station, last safe status, last updated

Avoid competing panels. The issue gate is the focal point.

## Default Copy
Default title:
```text
Delivery locked by issue review
```

Default body:
```text
This delivery cannot continue until the active issue is reviewed.
```

Default staff body:
```text
This delivery is locked while an issue is being reviewed. Open the issue before taking the next action.
```

Default sender body:
```text
Kra is reviewing an issue on this delivery before it can continue. We will update the delivery when the review is complete.
```

Default primary action for staff:
```text
Open issue
```

Default primary action for sender:
```text
Contact support
```

Default secondary action:
```text
Refresh status
```

## Severity Copy
| Severity | Title Modifier | Body Detail | Action Priority |
| --- | --- | --- | --- |
| `p1` | `Critical issue` | `Do not move or release this package until the issue owner resolves the lock.` | issue detail first |
| `p2` | `High-priority issue` | `This delivery needs staff review before it can continue.` | issue detail first |
| `p3` | `Issue review` | `This delivery is paused until support confirms the next step.` | refresh and issue detail |

## Status Copy
| Status | Staff Copy | Sender Copy |
| --- | --- | --- |
| `open` | `The issue is open and waiting for review.` | `Kra has opened a review for this delivery.` |
| `in_review` | `The issue is being reviewed.` | `Kra is reviewing this delivery.` |
| `escalated` | `The issue has been escalated.` | `A specialist team is reviewing this delivery.` |
| `resolved` | `The issue is resolved. Refresh delivery state before continuing.` | `The review has a decision. Refresh for the latest status.` |
| `closed` | `The issue is closed. Refresh if the delivery still appears blocked.` | `The review is complete. Refresh for the latest status.` |

## Blocked Action Copy
When a user attempted a blocked action, show the action context near the state.

| Attempted Action | Inline Copy |
| --- | --- |
| assign driver | `Driver assignment is locked until this issue is reviewed.` |
| dispatch | `Dispatch is locked until this issue is reviewed.` |
| receive at destination | `Destination receipt is locked until this issue is reviewed.` |
| release to receiver | `Receiver release is locked until this issue is reviewed.` |
| start final-mile | `Doorstep delivery is locked until this issue is reviewed.` |
| complete delivery | `Completion is locked until this issue is reviewed.` |
| return to station | `Return handling is locked until this issue is reviewed.` |
| cancel delivery | `Cancellation is locked until this issue is reviewed.` |
| refund delivery | `Refund action is locked until this issue is reviewed.` |

## Component Contract
`SharedBlockedByIssueState` receives a normalized view object. The component must not fetch data by itself unless the app shell explicitly passes a refresh function.

Required fields:
```ts
type BlockedByIssueStateView = {
  deliveryId: string;
  deliveryLabel: string;
  currentStatus: string;
  issueId?: string;
  issueStatus?: "open" | "in_review" | "escalated" | "resolved" | "closed";
  issueSeverity?: "p1" | "p2" | "p3";
  issueCategory?: "delay" | "damage" | "loss" | "payment" | "handoff" | "other";
  safeSummary?: string;
  ownerLabel?: string;
  updatedAt?: string;
  lastSafeLocationLabel?: string;
  canOpenIssue: boolean;
  canEscalateIssue: boolean;
  canContactSupport: boolean;
  canOpenBlockedQueue: boolean;
  canRefresh: boolean;
  attemptedAction?: string;
  roleSurface:
    | "sender"
    | "receiver"
    | "station_operator"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin"
    | "finance_admin";
};
```

Derived fields:
- `title`
- `body`
- `severityTone`
- `statusLabel`
- `categoryLabel`
- `primaryAction`
- `secondaryActions`
- `safeContextRows`
- `ariaLiveMessage`

## Component Rules
The component must:
- render without issue ID for sender-safe views
- render without category if category is not visible to the current role
- render with status-only copy if severity is unavailable
- disable blocked workflow action outside the state, not inside the state
- show one primary recovery action
- show no more than three secondary actions
- place refresh last unless stale data is detected
- never expose hidden data in aria labels
- use the same visible text and accessible text for sensitive labels
- support compact inline use and full-page use

The component must not:
- call issue mutation endpoints directly
- resolve issues directly
- lower severity
- mark issue complete
- start transport action after a refresh unless the parent flow reruns backend authorization
- create a new issue if an active issue already exists
- display internal notes in sender or receiver scope

## Layout Variants
### Full Page Variant
Use full page when:
- screen cannot show any safe primary content
- route opened directly into a blocked delivery
- sender delivery detail is issue-blocked
- mobile assignment detail is blocked by active issue
- admin opens a delivery where issue lock owns the page

Structure:
- app shell header
- issue lock hero
- safe delivery context strip
- recovery actions
- issue status rail if visible
- support or blocked queue link

### Inline Panel Variant
Use inline panel when:
- user attempts one blocked action inside a larger detail page
- delivery detail still has safe content to inspect
- action drawer is blocked
- admin list row needs expanded state

Structure:
- compact title
- reason line
- severity/status chip
- primary action
- refresh action

### Row Badge Variant
Use row badge when:
- blocked queue row
- assignments list row
- delivery history row
- admin table row

Structure:
- status icon
- `Issue open`, `In review`, or `On hold`
- severity marker if visible
- updated time
- route affordance

## Full Page Wire Structure
The future UI should follow this order:
1. Top app bar with back action and safe delivery label.
2. Large lock panel with title and reason.
3. Severity/status strip.
4. Owner and next-action line.
5. Primary action.
6. Secondary actions.
7. Safe delivery context.
8. Issue timeline preview when authorized.
9. Help or support note.

The top panel should use strong vertical spacing and clear type scale. Avoid cramming issue detail into the hero. The hero exists to stop unsafe action and route the user.

## Mobile Layout Rules
Mobile rules:
- hero title max two lines
- reason body max three short lines before expansion
- primary action full width
- secondary actions stacked or in a two-button row
- status chips wrap below the title
- safe context appears in a two-column grid only at wider mobile widths
- issue route remains visible without scrolling when opened after a blocked mutation
- refresh does not move the primary action after completion

Touch rules:
- action target minimum 44 px
- severity chip target only if interactive
- row badge has clear hit area
- disabled transport action keeps its disabled reason available

## Desktop Layout Rules
Desktop rules:
- full page variant centers the issue gate in a constrained content column
- admin console can place issue gate inside a side panel
- table row variant must not exceed row height unless expanded
- blocked queue can group by severity and age
- support console can show issue detail route beside delivery context
- primary action stays near the reason, not at page bottom

## Motion Rules
Motion should clarify the gate, not dramatize it.

Allowed:
- short entrance fade and 8 px vertical settle for the lock panel
- severity chip color fill after content appears
- refresh status progress indicator
- row expansion transition for issue context

Not allowed:
- looping alert animation
- shaking disabled action
- flashing red area
- moving primary action
- animation that hides status change from assistive tech

Reduced motion:
- no movement
- instant panel appearance
- spinner may be replaced by static loading text

## Accessibility Requirements
The component must:
- use a logical heading level from parent context
- announce blocked state through `role="status"` or polite live region after mutation failure
- use assertive announcement only for P1 safety-critical lock after direct user action
- identify the blocked action in visible text
- expose primary action as a normal button or link
- keep disabled actions focusable only when the product pattern includes accessible disabled reason
- use non-color severity labels
- keep contrast at AA or better
- support keyboard route to issue detail
- avoid hidden internal detail in accessible labels
- provide `aria-describedby` from action to reason where helpful

Screen reader announcement after mutation block:
```text
Delivery locked by issue review. Dispatch is blocked. Open issue for next steps.
```

Screen reader announcement after refresh clears blocker:
```text
Issue lock cleared. Delivery status refreshed.
```

## API Mapping
| Backend Signal | UI State | Notes |
| --- | --- | --- |
| `ISSUE_LOCK_ACTIVE` | `blocked_by_issue` | Use safe message from error catalog and route to issue detail if possible |
| delivery `issue_reported` | `blocked_by_issue` | Full issue blocker on detail and blocked queues |
| delivery `on_hold` | `blocked_by_issue` | Hold-focused copy, route to station/support |
| issue `open` | `blocked_by_issue` | Issue exists but needs review |
| issue `in_review` | `blocked_by_issue` | Review active |
| issue `escalated` | `blocked_by_issue` | Escalated owner active |
| issue `resolved` | refresh required | Do not unblock until delivery state confirms |
| issue `closed` | refresh required | Do not unblock until delivery state confirms |
| `CONFLICTING_HANDOFF_STATE` | usually `blocked_by_issue` after issue creation | If no issue exists yet, use custody conflict handling first |
| `INVALID_STATUS_TRANSITION` | maybe `error` or `blocked_by_issue` | Use issue blocker only when response includes issue lock reason |

## Error Handling
When mutation returns `ISSUE_LOCK_ACTIVE`:
- stop optimistic action
- roll back local action state
- show inline blocked-by-issue state near the action
- add full-page state only if the current screen cannot continue safely
- refresh delivery and issue summary if online
- do not queue the mutation offline
- log event `issue_lock_blocked_action`

When issue detail cannot load:
- keep blocked state visible
- replace primary action with `Refresh status` if user has no route
- show support path if role allows
- do not hide the reason

When refresh fails:
- show stale/offline substate
- keep blocked state as last known truth
- do not re-enable blocked action

## Navigation Routes
Recommended route targets:
- sender delivery detail: `/(sender)/deliveries/:deliveryId`
- sender support contact: `/(sender)/support?deliveryId=:deliveryId`
- operations delivery detail: `/(ops)/deliveries/:deliveryId`
- operations issue detail: `/(ops)/issues/:issueId`
- station blocked queue: `/(ops)/station/blocked`
- driver issue route: `/(ops)/driver/issues?deliveryId=:deliveryId`
- courier issue route: `/(ops)/courier/issues?deliveryId=:deliveryId`
- admin issue detail: `/admin/issues/:issueId`
- admin delivery detail: `/admin/deliveries/:deliveryId`
- finance payment issue route: `/admin/finance/issues/:issueId`

Route safety rules:
- never construct issue detail URL without an issue ID
- if issue ID is hidden, route to support or delivery detail
- do not put sensitive issue summary in query params
- return path should point back to the blocked action context
- preserve delivery ID in support context

## Sender Surface Rules
Sender sees:
- title: `Delivery under review`
- safe body
- safe status
- safe category label if allowed
- no internal owner identity
- no reporter actor ID
- no custody blame
- no evidence details
- support route
- tracking route
- refresh

Sender does not see:
- internal resolution note
- station staff identity
- driver or courier accusation
- provider references unless payment support owns the issue and payment spec allows it
- issue escalation reason
- admin audit trail

Sender copy:
```text
Kra is reviewing an issue on this delivery before it can continue.
```

Sender primary action:
```text
Contact support
```

## Station Operator Surface Rules
Station operator sees:
- issue seal
- delivery label
- category and severity
- current blocked status
- station scope
- last safe custody holder if visible
- primary action to open issue
- secondary action to blocked queue
- contact support route if issue is out of scope

Station operator must not see:
- issue detail outside station scope
- admin-only resolution notes
- unrelated station evidence
- finance-only provider details

Station copy:
```text
This package cannot move until the active issue is reviewed.
```

## Driver Surface Rules
Driver sees:
- delivery label
- safe issue status
- route impact
- station contact route
- issue route only if assigned and authorized
- safe current package holder

Driver must not:
- accept a blocked assignment
- dispatch a blocked package
- mark in transit while issue lock is active
- complete a station receipt while issue lock is active
- create duplicate issue for same active blocker without warning

Driver copy:
```text
This route item is locked by issue review. Contact the station before moving the package.
```

## Final-Mile Courier Surface Rules
Courier sees:
- job label
- delivery issue status
- safe category if authorized
- return or assignment route
- support route
- current station or route context

Courier must not:
- start doorstep delivery while locked
- complete delivery while locked
- retry final-mile attempt while locked
- hand package to receiver while locked
- bypass proof requirements after issue recovery

Courier copy:
```text
Doorstep delivery is paused while Kra reviews this issue.
```

## Support Admin Surface Rules
Support admin sees:
- issue ID
- delivery ID
- category
- severity
- status
- reporter role
- safe issue summary
- issue timeline route
- escalation route when allowed
- resolve route when allowed

Support admin must:
- keep the lock visible while issue remains active
- see stale state warning if delivery and issue disagree
- have a direct route to delivery context
- never resolve from this shared state if resolution requires evidence capture

Support copy:
```text
This delivery is locked until the support issue is resolved or routed to a terminal outcome.
```

## Operations Admin Surface Rules
Ops admin sees:
- issue owner
- severity
- station impact
- blocked queue context
- delivery state
- custody state
- route to issue detail
- route to delivery detail
- escalation path

Ops admin must:
- never bypass lock without backend transition
- keep issue and delivery state consistent
- verify custody before recovery transition
- route terminal loss or irrecoverable failure to `delivery_failed`

Ops copy:
```text
Review the active issue and choose the approved next delivery state.
```

## Finance Admin Surface Rules
Finance admin sees payment or refund context only when issue category is payment or refund-related and finance scope allows it.

Finance admin can:
- open issue
- open payment record
- open refund record
- add finance note in issue detail if supported later

Finance admin cannot:
- dispatch delivery
- resolve custody issue without ops owner
- expose provider detail to sender through this state

Finance copy:
```text
Payment or refund handling is linked to an active delivery issue.
```

## Public Tracking Rules
Public tracking should stay minimal.

Allowed labels:
- `Issue under review`
- `On hold`

Public tracking must not show:
- severity
- category
- issue ID
- reporter
- internal issue summary
- evidence
- owner
- resolution note

Public route should point to support only if the user has verified access.

## Issue Lock Rules
The lock is stronger than UI action availability.

When issue lock is active:
- disable dispatch
- disable receipt
- disable pickup release
- disable doorstep start
- disable delivery completion
- disable return flow unless backend says return is the recovery path
- disable cancellation unless backend says cancellation is the recovery path
- disable refund execution unless finance policy allows issue-linked refund flow
- disable offline queue for these actions
- keep safe read-only context visible

Allowed read-only context:
- delivery label
- safe status
- last known station
- safe custody holder label
- created time
- updated time
- safe issue status
- safe support route

## Custody Interaction
Issue locks often protect custody.

If current blocker is custody-related:
- show `Custody review` as category
- show current holder if role can see it
- show `View custody chain` as secondary action when authorized
- do not allow holder change from this state
- do not allow manual custody override from this state
- route conflicting handoff to issue or custody chain according to backend signal

If custody holder is unknown:
- show `Current holder is under review`
- avoid naming a party
- route staff to issue detail

## Payment Interaction
If issue category is `payment`:
- do not replace this state with `blocked_by_payment` unless payment status is the primary blocker and no support issue owns the workflow
- show finance route only to finance or admin roles
- sender sees support-safe copy
- provider references remain hidden here
- refund action stays blocked unless policy says the issue decision approved refund work

If payment is not confirmed and issue is active:
- prioritize `blocked_by_issue` when backend returns `ISSUE_LOCK_ACTIVE`
- show secondary `Payment also needs review` only if role can see payment state
- never show a pay button inside this state

## Refund And Dispute Interaction
Issue review may connect to formal dispute policy.

Rules:
- loss and damage claims stay blocked until evidence review is complete
- receiver refusal creates `issue_reported` and station review decides next flow
- service delay disputes can keep delivery blocked if operational state requires it
- refund requests do not release package movement
- compensation decisions must stay in admin or finance detail surfaces
- sender-safe copy must not promise refund before decision

Sender dispute copy:
```text
Kra is reviewing this delivery. Support will update you when the next step is ready.
```

Staff dispute copy:
```text
Review the issue evidence before changing delivery state or refund handling.
```

## Doorstep Delivery Interaction
Doorstep delivery must obey issue locks.

Blocked by issue appears when:
- receiver refusal creates issue review
- package condition issue is reported during doorstep attempt
- package cannot be located during doorstep run
- courier reports custody or handoff problem
- reattempt requires review before another attempt

Doorstep actions disabled:
- start route
- mark arrived
- verify receiver
- capture final proof
- complete delivery
- return package unless backend selected return as recovery path

## Scan And Label Interaction
If scan mismatch occurs before issue creation:
- use `scan_mismatch` state first
- offer rescan and escalation according to scan spec

If scan mismatch created an issue:
- use `blocked_by_issue`
- category should be `handoff` or `other` depending backend
- primary action should open issue
- secondary action may open custody chain

If duplicate label created an issue:
- use `duplicate_package_label` first at intake
- use `blocked_by_issue` only after active issue owns delivery movement

## Proof And OTP Interaction
If proof is missing and no issue is active:
- use `proof_required`

If proof failure caused issue review:
- use `blocked_by_issue`
- keep proof action disabled
- route to issue detail or support

If OTP verification fails repeatedly and issue is opened:
- show `blocked_by_issue`
- do not offer another OTP attempt until backend permits it

## Stale Data Interaction
If data is stale:
- keep blocked state visible
- add stale indicator: `Status may be out of date`
- primary action remains issue route if authorized
- refresh becomes secondary or primary only when no issue route exists
- never re-enable action due to stale data

Refresh success rules:
- if blocker remains, update timestamps and keep state
- if blocker clears, announce status update and return to parent flow
- if blocker changes to another blocker, replace state with more specific state

## Offline Interaction
If offline:
- keep last known issue blocker visible
- show offline subtext: `You are offline. Issue status cannot be verified right now.`
- disable mutation actions
- keep safe navigation to cached issue detail only if the app has local issue cache
- never enqueue dispatch, receipt, release, final proof, cancellation, or refund from a blocked state
- allow user to return to list

Offline primary action:
```text
Retry when online
```

## Loading Interaction
Loading should never hide the lock without replacement.

During refresh:
- keep blocker panel visible
- show refresh progress inside secondary action
- do not show full-page spinner over the lock
- do not move the primary action
- announce refresh completion

During route to issue detail:
- issue route can show normal route loading
- if route fails, return to blocker with error substate

## Empty Interaction
If issue list returns empty but delivery is `issue_reported`:
- show blocker with `Issue detail unavailable`
- route to refresh
- route staff to support or blocked queue
- log consistency event

If issue list is empty and delivery is not blocked:
- do not show blocked-by-issue
- show normal empty state for issue list

## Authorization Interaction
If user lacks issue detail permission:
- show sender-safe or staff-safe blocker
- hide `Open issue`
- show `Contact support`, `Open delivery`, or `Refresh`
- do not use `not_authorized` as the whole state unless the only user intent was opening restricted issue detail

If issue detail route returns `FORBIDDEN_ROLE`:
- return to blocked-by-issue with restricted recovery path
- show `You can see the delivery status, but not this issue detail.`

## Session Interaction
If session expires:
- replace primary recovery with sign-in route
- preserve intended action after sign-in
- do not reveal issue detail after token expiry
- use `session_expired` when authentication is the blocker

## Manual Review Interaction
If backend specifically returns manual review without active issue:
- use `manual_review_required`

If manual review is inside an active issue:
- use `blocked_by_issue`
- show status or owner line: `Issue review owns the next action`
- route to issue detail

## State Machine Summary
Issue path:
```text
active_delivery_state
  -> issue_reported
  -> blocked_by_issue
  -> issue_resolved
  -> awaiting_receiver_pickup | delivery_failed
```

Hold path:
```text
awaiting_receiver_pickup
  -> on_hold
  -> blocked_by_issue
  -> awaiting_receiver_pickup | delivery_failed
```

Mutation block path:
```text
staff_action
  -> ISSUE_LOCK_ACTIVE
  -> blocked_by_issue
  -> open_issue | refresh | blocked_queue
```

Sender path:
```text
sender_delivery_detail
  -> issue_reported
  -> blocked_by_issue
  -> contact_support | view_tracking | refresh
```

## Visual System
### Color
Use a controlled severity palette:
- P1: deep red accent with high contrast text
- P2: amber accent with dark text
- P3: blue-neutral accent with high contrast text
- resolved refresh warning: neutral with blue action

Avoid:
- pure red full-screen fills
- color-only status
- multiple alert colors in one panel
- green until backend confirms recovery

### Typography
Use strong hierarchy:
- title: large, direct, sentence case
- reason: medium, plain language
- severity and status: compact semibold labels
- context rows: smaller but readable
- actions: clear verbs

Do not use dense paragraphs in the hero.

### Spacing
Use spacing to create seriousness:
- generous top padding in full page variant
- tight relationship between status seal and title
- action group separated from context
- context rows grouped under a divider or quiet surface
- avoid packed chip rows

### Iconography
Use one primary lock or stop icon.

Icon rules:
- P1 can use shield or lock plus critical label
- hold can use pause icon plus `On hold`
- issue can use alert-circle or case icon
- do not use warning triangle alone for every state
- icon must be decorative unless it adds text meaning

## Action Rules
Primary action selection:
1. `Open issue` if `canOpenIssue`
2. `Open blocked queue` if station role and `canOpenBlockedQueue`
3. `Contact support` if sender and `canContactSupport`
4. `Refresh status` if `canRefresh`
5. `Back to delivery`

Secondary actions:
- `Refresh status`
- `View delivery`
- `View custody chain`
- `Open blocked queue`
- `Contact station`
- `Contact support`

Never show:
- `Continue anyway`
- `Override`
- `Force dispatch`
- `Release package`
- `Mark resolved`
- `Close issue`
- `Pay now`
- `Complete delivery`

## Action States
Primary action idle:
- visible and enabled if route available
- label includes destination

Primary action loading:
- show progress text
- keep layout stable
- disable duplicate activation

Primary action failure:
- keep state visible
- show inline error
- preserve secondary refresh

Refresh success:
- if still blocked, update status line
- if unblocked, parent screen decides next step
- if route changed, show new state

## Owner Rules
Owner line should be short and role-safe.

Allowed owner labels:
- `Support owns the next action`
- `Station owns the next action`
- `Operations owns the next action`
- `Finance owns the next action`
- `Issue owner pending`

Do not show:
- employee names in sender scope
- private actor IDs in sender or driver scope
- unresolved blame

Owner line position:
- directly below severity/status strip
- above primary action
- hidden only when unknown and no safe fallback exists

## Timeline Preview
Authorized staff can see a short status rail:
- issue created
- issue updated
- escalated
- resolved
- closed

Rules:
- max four rail entries
- full detail route owns complete timeline
- sender sees no internal rail unless future policy allows sender-safe updates
- rail uses timestamps and status labels
- rail should not show evidence content

## Evidence Nudge
When role can contribute evidence:
- show a nudge only if issue detail route supports evidence
- copy: `Add evidence in the issue detail.`
- action: `Open issue`

When role cannot contribute:
- do not show evidence nudge
- show owner line instead

Evidence nudge must not upload anything from this shared state.

## Data Normalization
The parent view layer should normalize backend state before rendering.

Normalization steps:
1. Read delivery current status.
2. Read linked active issues visible to the role.
3. Read latest mutation error if present.
4. Select issue blocker if delivery is blocked or error code is `ISSUE_LOCK_ACTIVE`.
5. Select issue ID only if visible.
6. Select safe category label.
7. Select severity if visible.
8. Select recovery actions from role capability.
9. Pass a complete view object to the component.

Never let the component infer authorization from role string alone. Use server-provided capability or route permission data.

## Analytics Events
Required events:
- `blocked_by_issue_viewed`
- `issue_lock_blocked_action`
- `blocked_by_issue_open_issue_clicked`
- `blocked_by_issue_contact_support_clicked`
- `blocked_by_issue_refresh_clicked`
- `blocked_by_issue_refresh_cleared`
- `blocked_by_issue_refresh_still_blocked`
- `blocked_by_issue_route_forbidden`
- `blocked_by_issue_empty_issue_inconsistency`

Event properties:
- `deliveryId`
- `issueId` only if allowed
- `roleSurface`
- `deliveryStatus`
- `issueStatus`
- `issueSeverity`
- `issueCategory`
- `attemptedAction`
- `sourceSurface`
- `isOffline`
- `isStale`
- `recoveryAction`

Privacy rules:
- no raw issue summary in analytics
- no personal phone or address data
- no evidence URL
- no resolution note
- no free-text description

## Observability
Log and monitor:
- repeated `ISSUE_LOCK_ACTIVE` for same delivery and action
- delivery `issue_reported` with no visible active issue for staff
- active issue with resolved delivery state
- issue resolved but delivery remains blocked longer than policy threshold
- P1 issue older than SLA threshold
- issue route forbidden for staff who should have access
- offline mutation attempt blocked by issue state

Admin dashboards should group:
- P1 active issues
- P2 active issues
- holds over threshold
- issue locks by station
- repeated issue categories by corridor

## QA Strategy
QA must prove that the state blocks unsafe action and routes the user to the right recovery path.

Required QA dimensions:
- role
- severity
- issue status
- delivery status
- attempted action
- online/offline state
- stale/fresh state
- issue ID visible/hidden
- category visible/hidden
- mobile/desktop layout
- keyboard navigation
- screen reader status

## Unit Test Checklist
Unit tests must cover:
- title generation for each role
- body generation for each role
- severity label mapping
- status label mapping
- category label mapping
- primary action selection
- fallback action selection
- hidden issue ID behavior
- hidden category behavior
- active issue status blocks workflow
- resolved issue does not clear delivery status alone
- `ISSUE_LOCK_ACTIVE` maps to issue blocker
- `on_hold` maps to hold-focused blocker
- stale data keeps blocker visible
- offline data keeps blocker visible
- sender copy excludes internal detail
- staff copy includes safe operational route

## Integration Test Checklist
Integration tests must cover:
- dispatch mutation returns `ISSUE_LOCK_ACTIVE` and shows inline blocker
- receipt mutation returns `ISSUE_LOCK_ACTIVE` and rolls back local state
- final-mile completion returns `ISSUE_LOCK_ACTIVE` and disables proof submit
- sender delivery detail shows safe blocker for `issue_reported`
- station blocked queue opens issue detail from issue blocker
- support admin opens issue detail from issue blocker
- unauthorized issue route returns safe blocker with no leak
- refresh keeps blocker when issue remains active
- refresh clears blocker only after delivery state changes
- offline action is not queued while issue blocker is active

## End-To-End Test Checklist
E2E tests must cover:
- station attempts dispatch on issue-blocked delivery
- driver attempts pickup on issue-blocked route item
- courier attempts completion on issue-blocked final-mile job
- sender opens delivery with active issue
- support admin escalates issue in issue detail and returns to blocker
- admin resolves issue then delivery state refresh allows approved next route
- hold state after pickup threshold appears as blocked-by-issue
- receiver refusal creates issue path and blocks movement
- issue route forbidden does not reveal issue summary
- P1 issue state announces critical status accessibly

## Visual QA Checklist
Visual QA must verify:
- full page variant on small phone width
- inline panel inside delivery detail
- row badge inside blocked queue
- admin side panel variant
- P1 red severity with text label
- P2 amber severity with text label
- P3 neutral-blue severity with text label
- long delivery label wrapping
- missing issue ID fallback
- missing owner fallback
- offline subtext
- stale subtext
- reduced motion
- large text scaling
- high contrast mode

## Accessibility QA Checklist
Accessibility QA must verify:
- heading level is correct in parent context
- live region announces mutation block
- live region announces refresh result
- keyboard reaches primary action
- keyboard reaches secondary actions
- focus returns to triggering area after close or back
- severity is readable without color
- disabled action has accessible reason
- sender-safe accessible label does not leak staff detail
- contrast passes
- target sizes pass mobile requirements
- screen reader order matches visual order

## Contract QA Checklist
Contract QA must verify:
- `ISSUE_LOCK_ACTIVE` maps to this state
- issue status enum values are exhaustive
- issue severity enum values are exhaustive
- issue category enum values are exhaustive
- unsupported issue status fails safely
- route generation requires issue ID
- analytics do not include free-text issue body
- sender view cannot receive admin-only fields
- offline queue rejects blocked actions
- stale refresh revalidates delivery before enabling action

## Content QA Checklist
Content QA must verify:
- no blame copy
- no refund promise
- no compensation promise
- no movement promise before backend state changes
- no internal notes in sender copy
- no vague generic error language
- no action label that implies bypass
- no panic language
- recovery action is clear
- issue owner is clear when known

## Performance Requirements
The state must render quickly because it appears after blocked mutations.

Requirements:
- render from existing delivery and issue data without extra blocking fetch where possible
- issue route fetch can happen after user action
- refresh must have clear progress
- no heavy visual asset dependency
- no layout shift after severity loads
- no large client bundle dependency for icon
- row badge variant must be cheap inside long lists

## Security Requirements
Security rules:
- all issue detail access must be server-authorized
- route guards are not enough
- issue ID must not reveal inaccessible detail
- sender copy must use safe fields only
- analytics must not include issue text
- logs must not include secret provider or evidence tokens
- action re-enable must depend on fresh backend permission
- no offline bypass

## Implementation Notes For Claude Code
Claude Code should implement this later as a shared state component, not as one-off screen code.

Recommended file ownership:
- shared UI primitive for state layout
- role-specific copy helper
- issue state mapper
- recovery action selector
- analytics helper
- test fixture builder

Implementation sequence:
1. Add normalized state type.
2. Add mapper from delivery, issue, and error state.
3. Add copy helpers.
4. Add shared component.
5. Add inline, full page, and row variants.
6. Wire sender delivery detail.
7. Wire operations delivery detail.
8. Wire station blocked queue.
9. Wire driver and courier assignment blockers.
10. Wire admin support detail.
11. Add tests before shipping.

## Required Test IDs
Use stable test IDs:
- `state-blocked-by-issue`
- `state-blocked-by-issue-title`
- `state-blocked-by-issue-body`
- `state-blocked-by-issue-severity`
- `state-blocked-by-issue-status`
- `state-blocked-by-issue-category`
- `state-blocked-by-issue-owner`
- `state-blocked-by-issue-primary-action`
- `state-blocked-by-issue-secondary-action`
- `state-blocked-by-issue-refresh`
- `state-blocked-by-issue-context`
- `state-blocked-by-issue-timeline`
- `state-blocked-by-issue-offline`
- `state-blocked-by-issue-stale`
- `state-blocked-by-issue-row-badge`
- `state-blocked-by-issue-inline-panel`

## Failure Modes
### Issue ID Missing
Show:
```text
Issue detail is not available yet.
```

Actions:
- refresh
- contact support
- blocked queue for station if available

### Issue Resolved But Delivery Still Blocked
Show:
```text
The issue has a decision, but the delivery status still needs to refresh.
```

Actions:
- refresh
- open delivery

### User Cannot Open Issue
Show:
```text
You can see the delivery status, but this issue detail is restricted.
```

Actions:
- contact support
- view delivery
- refresh

### Delivery And Issue Conflict
Show staff-safe:
```text
Delivery status and issue status do not match. Refresh before acting.
```

Actions:
- refresh
- open issue
- open delivery

### P1 Lock
Show:
```text
Critical issue. Do not move or release this package until the issue owner resolves the lock.
```

Actions:
- open issue
- contact operations

### Hold With No Issue
Show:
```text
This delivery is on hold. Review the delivery before taking the next action.
```

Actions:
- open delivery
- open blocked queue
- refresh

## Anti-Patterns
Do not:
- show issue blocker as a generic error
- hide the lock below normal actions
- allow action retry without refresh
- show `Continue` beside lock
- bury issue route in a menu
- show raw issue summary to sender by default
- use red-only status
- show full audit details in a shared state
- let stale data clear the lock
- let offline queue store blocked action
- use issue state for payment-only blockers
- use payment state for active issue locks

## Acceptance Criteria
This spec is complete when the future implementation can prove:
- every role sees safe and useful blocked-by-issue copy
- staff can open issue detail when authorized
- sender can contact support without seeing internal details
- unsafe actions remain blocked while issue is active
- stale and offline states never re-enable blocked action
- issue resolved state does not release delivery without delivery-state confirmation
- severity is visible without color dependence
- `ISSUE_LOCK_ACTIVE` maps reliably to the component
- analytics capture blocker behavior without sensitive text
- tests cover role, severity, status, and action selection

## Definition Of Done
The future UI is not done until:
- shared component exists
- mapper exists
- copy helper exists
- full page, inline, and row variants exist
- sender detail uses sender-safe state
- operations detail uses staff-safe state
- station blocked queue uses row and detail states
- driver and courier assignment flows block unsafe actions
- support/admin can open issue detail
- refresh behavior is implemented
- offline queue rejects blocked actions
- accessibility checks pass
- visual QA passes on phone and desktop
- contract tests prove backend error mapping
- E2E tests prove no bypass

## Open Product Decisions
These are the remaining decisions that do not block implementation but must be resolved before final pilot polish:
- whether sender can see issue severity for all categories or only delay/payment-safe categories
- whether station operator can assign owner from blocked queue or only support/admin can
- whether hold states need a separate countdown for pickup and return-to-sender timelines
- whether receiver-authenticated tracking will ever expose issue labels beyond `Issue under review`
- whether finance payment issues should show a finance route from general support admin surfaces

## Build Handoff Summary
Claude Code should build `SharedBlockedByIssueState` as a strict shared blocker. It should read normalized issue and delivery state, show one clear recovery route, protect sensitive issue detail, and prevent every transport or release bypass until backend state changes.

The intended experience is serious, calm, and operationally precise:
- user knows the delivery is locked
- user knows why at a safe level
- user knows who owns the next action
- user gets the correct route
- unsafe movement remains impossible
