# Manual Review Required State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `manual_review_required` |
| Component family | Shared screen state |
| Primary component | `SharedManualReviewRequiredState` |
| Supporting components | `ReviewOwnerCard`, `ReviewSlaBadge`, `ReviewReasonPanel`, `ReviewEvidenceChecklist`, `ReviewRouteActions`, `ReviewStatusRail`, `ReviewScopeNotice`, `ReviewSafetyLock` |
| Primary surfaces | sender mobile app, operations mobile app, station operator mobile app, driver mobile app, final-mile courier mobile app, admin web console, finance admin console |
| Required recovery | show owner and SLA, open review route, open evidence context, refresh status, or contact support |
| Test id root | `state-manual-review-required` |
| Backend coverage | refund decision `manual_review_required`, webhook `manual_review`, reconciliation review, admin review queue, policy review, validation response requiring review, high-risk booking review |
| Browser mutation operation | None directly; the state blocks irreversible decisions until the configured owner completes review |
| Data sensitivity | review reason, owner role, SLA deadline, evidence status, payment or refund context, webhook identifiers, package risk reason, custody exception context |
| Offline critical | Yes for operations and finance workflows because review-required decisions must not be approved through offline queue |
| Related inventory state | `manual_review_required` |
| Related state specs | error, offline, stale data, not authorized, session expired, blocked by issue, blocked by payment, payment under review, refund pending, webhook conflict |
| Design tokens | `review.red.700`, `review.amber.600`, `review.blue.600`, `review.indigo.600`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with status updates, explicit owner and deadline text, non-color risk markers, keyboard-safe recovery actions |

## Purpose
`SharedManualReviewRequiredState` is the shared UI state shown when backend policy says an action cannot continue until a configured staff, admin, finance, or operations owner reviews the record.

This state must answer:
- `Why can this not continue now?`
- `Who owns the review?`
- `What is the SLA or target time?`
- `What evidence or context is required?`
- `What can this user do next?`
- `What must not be changed until review is complete?`
- `How is this different from an active issue lock?`
- `How is this different from payment under review?`

The most important rule is:
```text
Review-required workflows cannot approve, dispatch, refund, replay, release, or close themselves.
```

## Product Job
Kra must route exceptional cases to the right accountable owner without confusing users or encouraging unsafe workarounds. This state is the product guardrail for cases where backend logic has enough information to stop a workflow, but not enough authority to decide automatically.

The manual-review-required state must:
- identify the review reason
- identify the owner role or queue
- show the SLA or target review time
- route the user to the correct review surface
- protect irreversible actions until review completes
- distinguish review from issue locks, payment review, webhook conflict, and generic errors
- keep sender-facing language safe and non-committal
- prevent offline approvals
- preserve audit expectations
- give staff a practical next step instead of a dead end

## Strategic Role
Manual review is where Kra protects the platform from unsafe automation. It is used when the cost of a wrong decision is higher than the cost of asking the right owner to review evidence.

Examples:
- refund policy cannot approve automatically
- payment provider callback conflicts with internal state
- provider reference is trusted but unmatched
- package size or declared value requires operational review
- custody exception needs admin review
- webhook processing exhausted retries
- launch readiness has unresolved review blockers
- sensitive support or finance decision needs audit-backed approval

This state should feel controlled and accountable. It should not feel like the product is stuck. The user should know who owns the next step, what the clock is, and what they can do safely.

## External Research Used
Only directly relevant review, ticket lifecycle, SLA, and accessibility references were used:
- [Stripe Radar reviews](https://docs.stripe.com/radar/reviews): supports routing elevated-risk or unusual payment work into a review queue before final action.
- [Stripe Reviews API](https://docs.stripe.com/api/radar/reviews): supports the idea that review objects can be open and require action before approval.
- [Zendesk ticket lifecycle and ticket statuses](https://support.zendesk.com/hc/en-us/articles/8263915942938-About-the-ticket-lifecycle-and-ticket-statuses): supports clear lifecycle labels for review progress and requester communication.
- [Atlassian incident management KPIs](https://www.atlassian.com/incident-management/kpis): supports owner, timeline, response, and SLA-oriented incident tracking.
- [Atlassian SLA, SLO, and SLI guidance](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli): supports measurable review targets and responsibility boundaries.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible updates when review status changes without moving focus.
- [W3C WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear blocked-action explanation and recovery guidance.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/02-users/support-and-escalation-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/06-architecture/integration-architecture.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/36-admin-webhook-events.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/37-admin-webhook-event-detail.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/13-refund-decision-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/20-replay-webhook-modal.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/08-create-package-details.md`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/refunds.ts`
- `services/api/src/payment-webhooks.ts`
- `packages/shared/src/contracts/api.ts`

## Visual Thesis
Manual review required should feel like a controlled checkpoint with a named owner and deadline, not a vague rejection.

Use:
- structured review card
- owner role visible near the top
- SLA badge beside owner
- reason panel below the header
- evidence checklist where relevant
- one primary route to the review surface
- calm amber or indigo tone for most cases
- red tone only for urgent or risky review
- clear disabled state for the attempted action

Do not use:
- generic error card
- panic copy
- blame copy
- refund promise
- delivery movement promise
- raw provider payload in shared state
- hidden owner
- missing SLA when policy provides one
- approval verbs before review completes
- actions that imply bypass

## Audience
Primary users:
- sender whose package booking, cancellation, refund, or support path needs review
- station operator facing a policy-controlled package exception
- driver or courier trying to proceed on a route item that needs review
- support admin triaging review queue
- finance admin reviewing refund, duplicate charge, webhook, or reconciliation exception
- operations admin reviewing custody, station, or delivery exception
- backend or platform operator inspecting webhook dead-letter or unmatched provider events

Secondary users:
- station lead watching SLA-owned exceptions
- launch readiness owner checking unresolved blockers
- QA validating review routing
- backend engineer validating review contracts
- accessibility reviewer validating status and owner feedback
- Claude Code implementing shared state later

Non-users:
- unauthenticated visitor
- unrelated station staff
- public receiver without secure access
- provider callback sender
- scheduled reconciliation worker

## Non-Goals
Do not use manual review required for:
- active issue lock
- payment pending with no review queue
- payment failed
- refund already pending
- session expiry
- role permission denial
- generic server failure
- stale data alone
- offline state alone
- proof requirement
- OTP requirement
- package scan mismatch before escalation
- duplicate scan before escalation
- custody not confirmed without configured review owner
- webhook conflict when the dedicated webhook conflict state is more specific
- launch blocker list outside a review-owned item

Use the most specific state available. Manual review required is for review-owned exceptions, not every serious condition.

## State Definition
`manual_review_required` is active when backend policy requires a named role, queue, or admin surface to review a record before the attempted action can continue.

Canonical triggers:
- refund decision reason is `manual_review_required`
- refund endpoint rejects approval with manual-review validation
- provider webhook processing status is `manual_review`
- unmatched provider reference is persisted for reconciliation
- conflicting final payment state is routed to review
- internal processing retries exhausted and event entered review/dead-letter handling
- high-risk package details exceed self-serve thresholds
- custody exception requires admin review
- station status override requires review
- launch readiness item has review-owned blocker
- AI or integration fallback requires support or admin review with no customer-facing automation promise

Non-canonical triggers:
- user simply wants help
- form validation failed
- role lacks permission
- active issue exists
- payment is merely pending
- refund is already processing
- package is offline
- data is stale

## Review Ownership Model
Every manual review state must have an owner. If the backend cannot provide a specific actor, the UI must show an owner queue.

Allowed owner labels:
- `Support review`
- `Finance review`
- `Operations review`
- `Station lead review`
- `Admin review`
- `Backend review`
- `Review owner pending`

Owner selection guidance:
- refund policy exception: `Finance review`
- payment reconciliation mismatch: `Finance review`
- webhook processing conflict: `Finance review` plus `Backend review` where reliability is involved
- custody exception: `Operations review`
- package oversize or high declared value: `Operations review`
- station override: `Admin review`
- sender support escalation: `Support review`
- launch readiness blocker: owner from readiness item

Do not show staff names in customer-facing surfaces unless policy later permits it.

## SLA Model
The review state must show a time expectation whenever policy provides one.

Supported SLA fields:
- `acknowledgementTargetAt`
- `resolutionTargetAt`
- `businessHoursOnly`
- `ownerTimezone`
- `slaStatus`: `within_sla`, `near_sla`, `breached`, `not_available`
- `severity`: `p1`, `p2`, `p3`, or domain-specific priority

Default review targets from local policy:
- P1 acknowledgement within 10 minutes during operating hours
- P2 acknowledgement within 30 minutes
- P3 acknowledgement within 4 business hours
- finance review for reconciliation by 10:00 on the same business day
- unmatched or conflicting payment events escalated within the next business day
- standard dispute acknowledgement target within 48 hours
- standard dispute resolution within 5 business days when evidence is complete
- complex loss, damage, or provider-settlement dispute can extend to 10 business days with approval and case note

SLA labels:
- `Due in 10 min`
- `Due today by 10:00`
- `Due next business day`
- `Within SLA`
- `Near SLA`
- `SLA breached`
- `SLA not available`

## Review Reason Taxonomy
| Reason ID | Safe Label | Owner | Blocks |
| --- | --- | --- | --- |
| `refund_policy_review` | `Refund review required` | finance | refund execution |
| `post_dispatch_refund_review` | `Post-dispatch refund review` | finance | refund execution |
| `damage_claim_review` | `Damage claim review` | support/ops | refund and compensation decision |
| `loss_claim_review` | `Loss claim review` | ops/admin | delivery closure and compensation decision |
| `payment_reconciliation_review` | `Payment reconciliation review` | finance | payment finalization and dispatch entitlement |
| `webhook_manual_review` | `Provider callback review` | finance/backend | replay, payment mutation, reconciliation closure |
| `unmatched_provider_reference` | `Provider reference review` | finance | payment match decision |
| `custody_exception_review` | `Custody exception review` | operations | custody override and movement |
| `package_risk_review` | `Package review required` | operations | self-serve booking continuation |
| `station_override_review` | `Station override review` | admin | station override |
| `launch_readiness_review` | `Launch review blocker` | ops/admin | go-live eligibility |
| `integration_fallback_review` | `Integration review required` | support/admin | dependent workflow continuation |

## Reason Display Rules
Sender-safe reason:
- use plain terms
- avoid internal codes
- avoid blame
- avoid provider internals
- show support path

Staff-safe reason:
- show reason label
- show owner queue
- show SLA
- show evidence requirement
- show record links

Admin-safe reason:
- show internal reason code
- show audit implications
- show dependent systems
- show review queue route
- show blocked mutation

## Entry Rules
Enter manual review required when:
- backend returns a review-required result
- refund policy result has `requiresManualReview === true`
- endpoint returns validation message that the action requires review before execution
- webhook `processingStatus === "manual_review"`
- reconciliation row has unresolved mismatch that needs finance review
- package details are above configured self-serve bounds
- custody exception cannot be resolved by current role
- station override requires admin review
- launch readiness row marks review blocker
- integration fallback says admin/support review is needed

Do not enter when:
- issue lock is active
- review reason is unknown and a safer generic error is required
- caller lacks permission to know the record exists
- action failed due to network timeout
- session is expired
- payment provider is unavailable
- payment is simply pending
- refund is already pending

## Exit Rules
Exit manual review required only when backend confirms:
- review decision approved continuation
- review decision rejected continuation and parent state changes to terminal or denied state
- refund moved to pending or denied state
- webhook moved to processed, duplicate, accepted pending, or unmatched-specific state
- package review converted booking into allowed flow or blocked flow
- custody exception moved into issue, resolved custody state, or terminal state
- station override completed or rejected
- launch blocker cleared

Never exit because:
- user dismisses the panel
- local timer expires
- review page is opened
- comment or note is added
- evidence upload starts
- client believes data is fresh enough
- offline queue has stored an action

## Recovery Promise
The state must always provide a safe route.

Recovery order:
1. Open review route if authorized.
2. Open evidence or reconciliation context if authorized.
3. Contact support if user is customer-facing.
4. Refresh status if review may have changed.
5. Return to safe parent screen.

If no specific route exists, show:
```text
This needs review before it can continue. Refresh status or contact support.
```

## Role Behavior Matrix
| Role | What They See | Primary Action | Secondary Action |
| --- | --- | --- | --- |
| sender | safe reason, owner category, broad timing if available | `Contact support` | `Refresh status` |
| receiver | public-safe status only if secure tracking supports it | `View tracking` | none |
| station_operator | review reason, owner queue, blocked action | `Open review` if authorized | `Contact station lead` |
| station_lead | review reason, evidence checklist, SLA | `Open review` | `Open delivery` |
| driver | safe route impact, station contact | `Contact station` | `Refresh` |
| final_mile_courier | safe job impact, support route | `Contact station` | `Return to jobs` |
| support_admin | review reason, owner, SLA, evidence status | `Open review` | `Escalate` if allowed |
| ops_admin | operations review route and audit note | `Open review` | `Open delivery` |
| finance_admin | payment/refund/reconciliation review | `Open finance review` | `Open payment context` |
| platform_admin | webhook or integration review context | `Open event detail` | `Open reconciliation` |

## Privacy Rules
Always safe:
- safe review label
- owner category
- broad SLA phrase
- safe next action
- safe delivery or payment context label

Staff-safe:
- internal reason label
- severity
- queue owner
- SLA target
- evidence checklist
- delivery ID
- issue ID if linked and visible
- payment ID if role allows it

Admin-safe:
- internal reason code
- provider reference
- webhook event ID
- processing note
- audit note
- resolution requirements
- owner assignment detail

Never show in this shared state:
- raw provider payload
- provider secret
- full card or mobile money account detail
- private phone numbers
- full address unless needed for current staff workflow
- free-text dispute body in analytics
- blame assignment before review
- compensation decision before approval

## Content Hierarchy
Top hierarchy:
1. Review title: `Manual review required`
2. Reason line: `This action needs finance review before it can continue.`
3. Owner and SLA: `Finance review`, `Due today by 10:00`
4. Blocked action: `Refund approval is blocked`
5. Primary action: `Open finance review`
6. Evidence checklist or context rows
7. Secondary actions
8. Safe help note

The owner and SLA must be visually close to the title. A user should not need to scroll to know who owns the decision.

## Default Copy
Default title:
```text
Manual review required
```

Default body:
```text
This action needs review before it can continue.
```

Default staff body:
```text
This record needs review by the assigned owner before this action can continue.
```

Default sender body:
```text
Kra needs to review this request before the next step is confirmed.
```

Default owner fallback:
```text
Review owner pending
```

Default SLA fallback:
```text
SLA not available
```

Default primary action for staff:
```text
Open review
```

Default primary action for sender:
```text
Contact support
```

Default secondary action:
```text
Refresh status
```

## Reason Copy
| Reason | Title | Body | Primary Action |
| --- | --- | --- | --- |
| refund policy | `Refund review required` | `This refund needs finance review before approval.` | `Open refund review` |
| post-dispatch refund | `Post-dispatch refund review` | `Post-dispatch refunds require evidence review before approval.` | `Open evidence review` |
| damage claim | `Damage claim review` | `Damage claims need review before any refund or compensation decision.` | `Open claim review` |
| loss claim | `Loss claim review` | `Loss claims need operations review before closure or compensation.` | `Open claim review` |
| reconciliation | `Payment reconciliation review` | `Payment records do not fully match and need finance review.` | `Open reconciliation` |
| webhook | `Provider callback review` | `This provider callback needs review before payment state changes.` | `Open event detail` |
| unmatched provider | `Provider reference review` | `The provider reference does not match a known Kra payment record.` | `Open reconciliation` |
| custody exception | `Custody exception review` | `Custody evidence needs operations review before movement continues.` | `Open custody review` |
| package risk | `Package review required` | `This package needs operations review before self-serve booking can continue.` | `Contact support` |
| station override | `Station override review` | `This station change needs admin review before it can apply.` | `Open station review` |

## Blocked Action Copy
| Blocked Action | Inline Copy |
| --- | --- |
| refund approval | `Refund approval is blocked until finance review is complete.` |
| payment finalization | `Payment finalization is blocked until reconciliation review is complete.` |
| webhook replay | `Replay is unavailable while this callback requires review.` |
| dispatch | `Dispatch is blocked until review clears the delivery.` |
| custody override | `Custody override is blocked until operations review is complete.` |
| package booking | `Self-serve booking is blocked until support reviews this package.` |
| station override | `Station override is blocked until admin review is complete.` |
| launch readiness | `Go-live eligibility is blocked until this review item is cleared.` |

## SLA Copy
| SLA Status | Label | Tone | Body |
| --- | --- | --- | --- |
| `within_sla` | `Within SLA` | blue | `The review is still inside the target window.` |
| `near_sla` | `Near SLA` | amber | `The review target is approaching.` |
| `breached` | `SLA breached` | red | `This review has passed its target time.` |
| `not_available` | `SLA not available` | neutral | `No review target was returned.` |

Customer-facing SLA copy should be broader:
- `Support will update this request after review.`
- `Finance review runs during business hours.`
- `We will update you when the next step is ready.`

## Component Contract
`SharedManualReviewRequiredState` receives a normalized view object. It must not fetch or mutate directly unless a parent passes explicit refresh or navigation handlers.

Required fields:
```ts
type ManualReviewRequiredStateView = {
  subjectId: string;
  subjectType:
    | "delivery"
    | "refund"
    | "payment"
    | "webhook_event"
    | "package"
    | "custody_exception"
    | "station"
    | "launch_readiness";
  safeSubjectLabel: string;
  reviewReason:
    | "refund_policy_review"
    | "post_dispatch_refund_review"
    | "damage_claim_review"
    | "loss_claim_review"
    | "payment_reconciliation_review"
    | "webhook_manual_review"
    | "unmatched_provider_reference"
    | "custody_exception_review"
    | "package_risk_review"
    | "station_override_review"
    | "launch_readiness_review"
    | "integration_fallback_review";
  ownerLabel: string;
  slaLabel?: string;
  slaStatus?: "within_sla" | "near_sla" | "breached" | "not_available";
  severity?: "p1" | "p2" | "p3";
  blockedAction?: string;
  evidenceStatus?: "not_required" | "missing" | "partial" | "complete";
  updatedAt?: string;
  canOpenReview: boolean;
  canOpenEvidence: boolean;
  canContactSupport: boolean;
  canRefresh: boolean;
  roleSurface:
    | "sender"
    | "receiver"
    | "station_operator"
    | "station_lead"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin"
    | "finance_admin"
    | "platform_admin";
};
```

Derived fields:
- `title`
- `body`
- `ownerDisplay`
- `slaDisplay`
- `reasonDisplay`
- `blockedActionDisplay`
- `tone`
- `primaryAction`
- `secondaryActions`
- `ariaLiveMessage`
- `safeContextRows`

## Component Rules
The component must:
- show owner label near the top
- show SLA label when provided
- use fallback owner if owner is missing
- use fallback SLA if review target is missing
- select one primary route
- keep blocked action visible when present
- show evidence checklist only when useful
- render safely with partial data
- protect sensitive fields by role
- support full-page, inline, and row variants
- keep visual structure stable during refresh

The component must not:
- approve, reject, resolve, replay, refund, or dispatch
- call review mutation endpoints directly
- infer authorization from role only
- show raw provider payload
- show internal reason code to sender
- promise a decision time if no SLA exists
- hide the owner when owner is known
- let offline state enable approval

## Layout Variants
### Full Page Variant
Use full page when:
- current screen cannot proceed without review
- sender enters a blocked request detail
- package booking cannot continue self-serve
- refund review route returns review-required state
- admin route opens a review-owned blocker

Structure:
- app shell header
- review gate panel
- owner/SLA strip
- blocked action line
- evidence or context rows
- recovery actions
- safe explanation

### Inline Panel Variant
Use inline panel when:
- action fails inside a detail page
- modal decision routes to review
- webhook event detail shows review result
- delivery detail has safe read-only context

Structure:
- compact title
- reason line
- owner/SLA badges
- primary action
- secondary refresh

### Row Badge Variant
Use row badge when:
- admin review queue
- refund list
- webhook events list
- blocked queue
- launch readiness table

Structure:
- review icon
- review label
- owner
- SLA status
- route affordance

## Mobile Layout Rules
Mobile rules:
- owner and SLA must appear before evidence rows
- primary action is full width
- secondary actions no more than two visible before overflow
- reason body max three lines before expansion
- evidence checklist uses short labels
- no wide tables
- review status rail stacks vertically
- long subject labels wrap without hiding owner
- stale/offline subtext appears below owner strip

Touch rules:
- action target minimum 44 px
- badges are not interactive unless route is available
- disabled action reason remains readable

## Desktop Layout Rules
Desktop rules:
- admin console can render review state in a side panel
- finance console can render owner/SLA as right rail
- table rows use compact review badge
- full-page layout uses constrained width
- evidence checklist can sit beside context summary at wide widths
- primary action stays near title

## Visual System
### Color
Tone mapping:
- finance/reconciliation review: indigo or blue
- package/custody review: amber
- P1 or breached SLA: red
- within SLA: blue
- neutral review with no SLA: neutral

Avoid:
- green before review completion
- red for every review
- full-screen alert fill
- color-only owner or SLA

### Typography
Use:
- direct title
- compact owner line
- clear reason text
- short evidence labels
- strong action labels

Avoid:
- long legal-style paragraphs in the hero
- vague headings
- repeated status wording

### Iconography
Use:
- clipboard-check or review icon for general review
- clock icon for SLA
- shield icon for risk or P1
- receipt icon for finance review
- link or event icon for webhook review

Icon rules:
- icons are supporting cues only
- labels carry meaning
- one primary icon in hero

## Motion Rules
Allowed:
- short panel entrance fade
- SLA badge update pulse after refresh
- evidence checklist row reveal
- refresh progress on button

Not allowed:
- looping alert motion
- flashing breached state
- moving owner/SLA strip
- hiding review reason during loading

Reduced motion:
- static panel
- no pulse
- text-only progress

## Accessibility Requirements
The component must:
- use a parent-appropriate heading
- announce review-required result after blocked action
- use `role="status"` for non-focus-changing refresh results
- use focus movement when opening review route
- provide clear disabled-action reason
- expose owner and SLA in text
- avoid hidden sensitive detail in aria labels
- not rely on color for SLA or priority
- keep buttons keyboard reachable
- maintain AA contrast
- support large text
- preserve logical reading order

Screen reader announcement after mutation block:
```text
Manual review required. Refund approval is blocked until finance review is complete.
```

Screen reader announcement after refresh:
```text
Review status refreshed.
```

Screen reader announcement after review clears:
```text
Review cleared. Continue from the updated status.
```

## API Mapping
| Backend Signal | UI State | Notes |
| --- | --- | --- |
| `requiresManualReview: true` | `manual_review_required` | Use returned reason and owner where available |
| refund reason `manual_review_required` | `manual_review_required` | Route to refund or evidence review |
| validation message `Refund requires manual review before execution.` | `manual_review_required` | Finance-safe route; sender gets support route |
| webhook `processingStatus=manual_review` | `manual_review_required` | Admin/finance event route |
| webhook after fifth failed processing attempt | `manual_review_required` | Dead-letter/review queue route |
| unmatched provider reference | `manual_review_required` or `webhook_conflict` | Use `webhook_conflict` when conflict details are primary |
| reconciliation unresolved mismatch | `manual_review_required` | Finance review route |
| package over self-serve bounds | `manual_review_required` | Sender support route |
| custody exception review | `manual_review_required` | Ops review route unless active issue lock exists |
| station override review | `manual_review_required` | Admin route |

## Error Handling
When mutation returns review-required:
- stop the mutation flow
- do not retry automatically
- roll back optimistic state
- show the review state near the attempted action
- preserve any submitted data if safe
- route to review context if authorized
- log analytics event

When review route fails:
- keep the review state visible
- show restricted route copy if forbidden
- show refresh and support route
- do not reveal restricted fields

When refresh fails:
- keep review state as last known truth
- add stale/offline substate
- do not enable blocked action

## Navigation Routes
Recommended route targets:
- sender support route: `/(sender)/support?subjectId=:subjectId`
- sender delivery detail: `/(sender)/deliveries/:deliveryId`
- package support route: `/(sender)/support/package-review`
- operations delivery review: `/(ops)/deliveries/:deliveryId/review`
- custody review: `/admin/custody-exceptions/:exceptionId`
- refund review: `/admin/refunds/:refundId/review`
- finance reconciliation: `/admin/payment-reconciliation`
- webhook event detail: `/admin/webhook-events/:eventId`
- station review: `/admin/stations/:stationId/review`
- launch readiness detail: `/admin/launch-readiness`

Route safety:
- no sensitive reason in query params
- no provider payload in URL
- route requires server authorization
- return path preserves parent context
- if ID is unavailable, route to queue not detail

## Sender Surface Rules
Sender sees:
- safe review title
- safe reason
- broad owner category
- broad timing only if policy allows
- support route
- refresh
- delivery or request context

Sender does not see:
- internal reason code
- provider reference
- webhook event ID
- staff notes
- audit trail
- exact compensation calculation before approval
- raw policy engine detail

Sender copy:
```text
Kra needs to review this request before the next step is confirmed.
```

Sender primary action:
```text
Contact support
```

## Station Surface Rules
Station operator sees:
- review reason if station-scoped
- owner queue
- SLA
- blocked action
- delivery context
- station lead route when available

Station operator must not:
- approve admin review
- change custody exception from this state
- dispatch package under review
- hide review state after route attempt

Station copy:
```text
This delivery needs review before station action can continue.
```

## Driver Surface Rules
Driver sees:
- safe route impact
- station contact route
- broad owner label
- refresh action

Driver must not see:
- finance review detail
- provider references
- internal refund details
- admin audit detail

Driver copy:
```text
This route item needs review before movement can continue.
```

## Final-Mile Courier Surface Rules
Courier sees:
- job impact
- support or station contact route
- broad reason if safe
- refresh action

Courier must not:
- complete delivery under review
- retry proof flow under review
- release package under review
- view internal review notes

Courier copy:
```text
This job needs review before doorstep delivery can continue.
```

## Support Admin Surface Rules
Support admin sees:
- reason label
- owner queue
- SLA
- evidence checklist
- subject context
- route to review
- escalation route if allowed

Support admin must:
- use review route for decisions
- not approve finance-only decisions
- not expose internal notes to sender
- record support communication in the proper support surface

Support copy:
```text
This record needs review before the requested action can continue.
```

## Finance Admin Surface Rules
Finance admin sees:
- payment or refund review reason
- payment ID where allowed
- provider reference where allowed
- reconciliation status
- webhook event status
- SLA
- review route
- evidence completeness

Finance admin can:
- open reconciliation
- open refund review
- open webhook event detail
- open payment context

Finance admin cannot:
- dispatch delivery
- release custody
- override operations blocker without ops review
- approve from this shared state

Finance copy:
```text
Finance review is required before money or payment state changes.
```

## Operations Admin Surface Rules
Ops admin sees:
- custody or delivery review reason
- owner
- SLA
- station or corridor context
- evidence checklist
- delivery route
- issue route if linked

Ops admin can:
- open custody review
- open delivery review
- open station review
- route to issue when review becomes issue-owned

Ops admin cannot:
- execute finance decision
- hide review blocker without backend state change
- bypass evidence requirement

Ops copy:
```text
Operations review is required before this delivery or custody decision can continue.
```

## Platform Admin Surface Rules
Platform admin sees:
- webhook event ID
- processing status
- retry count
- processing note
- matched payment or delivery ID if known
- owner queue
- review route

Platform admin can:
- open event detail
- open reconciliation
- inspect processing context

Platform admin cannot:
- replay if replay tooling is unavailable
- mutate payment state from this shared state
- expose provider payload to non-admin surfaces

Platform copy:
```text
This provider event requires review before processing can continue.
```

## Package Review Rules
Use manual review required when package details exceed self-serve limits or policy requires staff review.

Triggers:
- package above self-serve weight limit
- package above self-serve dimension limit
- declared value requiring support review
- package category requiring operations approval
- prohibited-item ambiguity requiring support

Sender copy:
```text
This package needs review before self-serve booking can continue.
```

Actions:
- contact support
- edit package details when policy allows
- save draft if supported

Do not:
- let user continue payment
- create dispatchable delivery
- imply approval is guaranteed

## Refund Review Rules
Use manual review required when refund policy cannot automatically approve.

Triggers:
- post-dispatch refund without automatic eligibility
- damage claim
- loss claim
- compensation review
- refund amount is zero and evidence review is needed
- requested refund outside policy

Finance copy:
```text
This refund needs finance review before approval.
```

Sender copy:
```text
Kra needs to review this refund request before a decision is confirmed.
```

Do not:
- show refund pending
- show approved amount as final
- promise compensation
- run refund mutation from this state

## Webhook Review Rules
Use manual review required when provider event processing must stop for review.

Triggers:
- processing status is `manual_review`
- verified provider event cannot be matched
- conflicting final payment state
- processing retries exhausted
- event moved to dead-letter handling

Admin copy:
```text
This provider callback needs review before payment state changes.
```

Actions:
- open event detail
- open reconciliation
- open payment context if matched

Do not:
- offer replay when backend says unavailable
- mutate payment state from this shared state
- show raw payload to unauthorized roles

## Reconciliation Review Rules
Use manual review required when finance must compare provider truth and internal truth.

Triggers:
- unresolved mismatch after checkpoints
- still-pending charge after 30 minute verification
- provider verification error after retry schedule
- duplicate charge
- unmatched events from same provider threshold
- mismatch of GHS 50 or more

Finance copy:
```text
Payment records need finance review before Kra changes entitlement or settlement state.
```

Do not:
- confirm payment from this state
- fail payment from this state
- dispatch delivery based only on provider payload
- hide provider/internal mismatch

## Custody Review Rules
Use manual review required when evidence is incomplete or authority is too high-risk for current role.

Triggers:
- manual custody exception
- handoff evidence conflict without active issue lock
- station correction request
- fallback proof limitation that policy requires review for

Ops copy:
```text
Custody evidence needs operations review before this action can continue.
```

Do not:
- move custody from this state
- reassign holder from this state
- approve release from this state
- hide missing evidence

## Station Review Rules
Use manual review required when station status or availability change requires admin review.

Triggers:
- station intake override
- service availability override
- validation status conflict
- launch readiness station blocker

Admin copy:
```text
This station change needs admin review before it can apply.
```

Do not:
- apply override locally
- hide station impact
- route to generic error

## Launch Readiness Rules
Use manual review required for review-owned launch blockers, not for every launch failure.

Show:
- blocker code
- owner
- severity
- station if relevant
- SLA or target date
- review route

Do not show:
- unrelated blocker categories
- unassigned action with no owner
- launch approval action from this state

## Stale Data Interaction
If data is stale:
- keep review state visible
- add `Status may be out of date`
- make refresh visible
- do not enable blocked action
- do not hide owner or SLA
- do not change tone until refresh succeeds

Refresh success:
- if review remains, update SLA and timestamp
- if review clears, announce update and let parent route decide
- if another blocker appears, switch to the more specific state

## Offline Interaction
If offline:
- keep last known review state visible
- add `You are offline. Review status cannot be verified right now.`
- disable approval and irreversible actions
- disable offline queue for review-owned actions
- allow cached read-only context where safe
- allow return to list

Offline primary action:
```text
Retry when online
```

## Loading Interaction
During refresh:
- keep review state visible
- show loading text in refresh control
- keep owner and SLA visible
- do not show full-page spinner over review state
- do not reorder actions

During route to review:
- show normal route loading
- return to review state if route fails

## Empty Interaction
If review route returns no record:
- keep state visible
- show `Review record is not available yet.`
- offer refresh
- offer queue route if authorized
- log consistency event

If list route has no review rows:
- use empty state, not manual review required

## Authorization Interaction
If user lacks review detail permission:
- keep safe review state visible
- hide detail route
- show support, queue, or refresh action
- do not show `not_authorized` unless the whole screen was the restricted review detail

Copy:
```text
You can see that review is required, but this review detail is restricted.
```

## Session Interaction
If session expires:
- replace review route with sign-in
- preserve return path
- do not expose review data after expiry
- use `session_expired` when auth is the immediate blocker

## Issue Interaction
If active issue lock exists:
- use `blocked_by_issue`

If review later creates an issue:
- switch to `blocked_by_issue` after backend returns issue ownership

If issue detail includes review-needed substep:
- issue detail owns that substep, but shared blocker remains `blocked_by_issue`

## Payment Interaction
If provider result is unresolved but finance review owns it:
- use `manual_review_required` for admin/finance surfaces
- use `payment_under_review` for sender-facing payment status when the product surface is about payment processing
- use `blocked_by_payment` when operational movement is blocked by payment not confirmed

If payment under review has a specific owner and SLA:
- manual review can appear inside admin finance context
- sender should not see internal review owner unless policy allows

## Webhook Conflict Interaction
If conflict detail is primary:
- use `webhook_conflict`

If general review ownership is primary:
- use `manual_review_required`

Rule:
```text
Webhook conflict explains what disagrees. Manual review required explains who must decide next.
```

## State Machine Summary
Refund path:
```text
refund_requested
  -> policy_checked
  -> manual_review_required
  -> approved_refund | rejected_refund | more_evidence_needed
```

Webhook path:
```text
provider_event_received
  -> verified_and_persisted
  -> processing_conflict
  -> manual_review_required
  -> processed | duplicate | reconciliation_action | rejected
```

Package review path:
```text
package_details_entered
  -> policy_threshold_exceeded
  -> manual_review_required
  -> support_approved | support_rejected | edit_required
```

Custody path:
```text
custody_exception_detected
  -> manual_review_required
  -> issue_created | custody_corrected | terminal_decision
```

## Evidence Checklist
Show evidence checklist only where useful.

Evidence states:
- `not_required`
- `missing`
- `partial`
- `complete`

Checklist labels:
- `Delivery timeline`
- `Payment record`
- `Provider reference`
- `Proof artifact`
- `Custody chain`
- `Support note`
- `Admin note`
- `Station context`

Rules:
- sender sees no internal checklist unless future policy allows it
- staff sees checklist names, not restricted payload
- admin sees route to full evidence surface
- evidence upload is not done from this shared state

## Owner And SLA Placement
Owner and SLA must be immediately visible.

Recommended order:
1. Title.
2. Reason.
3. Owner badge.
4. SLA badge.
5. Blocked action.
6. Primary action.

Owner badge text:
```text
Owner: Finance review
```

SLA badge text:
```text
Due today by 10:00
```

If SLA is breached:
```text
SLA breached. Escalate this review.
```

## Analytics Events
Required events:
- `manual_review_required_viewed`
- `manual_review_required_blocked_action`
- `manual_review_required_open_review_clicked`
- `manual_review_required_open_evidence_clicked`
- `manual_review_required_contact_support_clicked`
- `manual_review_required_refresh_clicked`
- `manual_review_required_refresh_cleared`
- `manual_review_required_refresh_still_required`
- `manual_review_required_route_forbidden`
- `manual_review_required_missing_record`

Event properties:
- `subjectId`
- `subjectType`
- `reviewReason`
- `ownerLabel`
- `slaStatus`
- `severity`
- `blockedAction`
- `roleSurface`
- `sourceSurface`
- `isOffline`
- `isStale`
- `recoveryAction`

Privacy rules:
- no raw provider payload
- no free-text dispute body
- no private phone number
- no address
- no evidence URL
- no staff note body

## Observability
Monitor:
- review states without owner
- review states without SLA where policy requires one
- breached review SLA
- repeated blocked action attempts
- sender support contact rate from review state
- finance review queue age
- webhook manual-review backlog
- refund review backlog
- package review conversion rate
- route forbidden rate for staff review actions
- refresh-cleared review count

Alert:
- P1 review near SLA
- breached P1 review
- webhook manual-review queue not cleared by next business day
- finance reconciliation unresolved after target time
- review state with missing subject record

## QA Strategy
QA must prove the state routes review work correctly without enabling unsafe action.

Required QA dimensions:
- subject type
- review reason
- owner
- SLA status
- role
- evidence state
- online/offline
- stale/fresh
- authorized/restricted route
- mobile/desktop layout
- keyboard navigation
- screen reader status

## Unit Test Checklist
Unit tests must cover:
- reason label mapping
- owner label rendering
- SLA label rendering
- SLA tone mapping
- primary action selection
- secondary action selection
- sender-safe copy
- staff-safe copy
- finance copy
- operations copy
- evidence checklist visibility
- blocked action copy
- route fallback when review ID missing
- offline behavior
- stale behavior
- review cleared refresh behavior
- forbidden route behavior

## Integration Test Checklist
Integration tests must cover:
- refund decision returns review-required and shows finance review state
- refund validation message maps to review state
- webhook event with `manual_review` shows event review state
- reconciliation mismatch shows finance owner and SLA
- package threshold block shows sender-safe review state
- custody exception shows operations review state
- station override shows admin review state
- review route forbidden hides restricted details
- offline mode disables irreversible action
- refresh clears state only after backend changes

## End-To-End Test Checklist
E2E tests must cover:
- sender enters package details above self-serve limit
- finance admin attempts post-dispatch refund requiring review
- admin opens webhook event in manual review
- finance admin opens reconciliation row from review state
- station operator sees review block and cannot dispatch
- ops admin opens custody review from shared state
- sender contacts support from review-required refund state
- review clears after admin action and parent screen updates
- breached SLA review remains visible and escalates route priority

## Visual QA Checklist
Visual QA must verify:
- full page variant on small phone width
- inline panel inside modal or detail surface
- row badge inside admin table
- finance admin side panel variant
- owner/SLA strip near title
- breached SLA red with text label
- within-SLA blue with text label
- no-SLA neutral fallback
- long reason wrapping
- missing owner fallback
- missing review record fallback
- offline subtext
- stale subtext
- reduced motion
- high contrast mode
- large text scaling

## Accessibility QA Checklist
Accessibility QA must verify:
- heading level fits parent context
- live status announces review-required result
- refresh result announces without focus theft
- keyboard reaches primary route
- keyboard reaches refresh
- owner and SLA are text, not visual-only
- disabled action reason is available
- evidence checklist is announced clearly
- sender-safe labels do not leak internal detail
- contrast passes
- target sizes pass
- screen reader order matches visual order

## Contract QA Checklist
Contract QA must verify:
- refund `manual_review_required` reason maps to this state
- webhook `manual_review` maps to this state
- reconciliation mismatch maps to finance owner
- package threshold maps to support/operations owner
- owner enum or label is handled safely
- SLA status values are exhaustive
- unsupported reason falls back safely
- analytics exclude free text and provider payload
- offline queue rejects review-owned mutations
- review route requires authorization

## Content QA Checklist
Content QA must verify:
- no promise before review
- no refund approval copy before approval
- no compensation promise
- no dispatch promise
- no provider payload in user copy
- no blame language
- no vague dead-end copy
- owner is visible
- SLA is visible or safe fallback appears
- primary action is useful

## Performance Requirements
Requirements:
- render from existing parent data
- avoid blocking extra fetch for initial display
- review route can fetch detail after user action
- no heavy visual dependency
- row badge is cheap in long lists
- refresh keeps layout stable
- no layout shift when SLA updates
- no large table in mobile variant

## Security Requirements
Security rules:
- review route requires server authorization
- client role does not grant detail access
- sensitive fields are not passed to sender state
- analytics exclude review text bodies
- provider payload stays in authorized admin surfaces
- approval mutations are not part of this state
- offline queue cannot approve or replay
- refresh must revalidate before enabling parent action

## Implementation Notes For Claude Code
Claude Code should implement this later as a shared review gate, not as scattered copy.

Recommended file ownership:
- shared state component
- review reason mapper
- owner/SLA formatter
- role-safe copy helper
- recovery action selector
- analytics helper
- tests for every reason and role

Implementation sequence:
1. Add normalized view type.
2. Add mapper from refund, webhook, reconciliation, package, custody, and station states.
3. Add reason copy helper.
4. Add owner/SLA formatter.
5. Add shared component variants.
6. Wire refund review flows.
7. Wire webhook event flows.
8. Wire reconciliation flows.
9. Wire package review blocker.
10. Wire custody and station review blockers.
11. Add tests before shipping.

## Required Test IDs
Use stable test IDs:
- `state-manual-review-required`
- `state-manual-review-required-title`
- `state-manual-review-required-body`
- `state-manual-review-required-reason`
- `state-manual-review-required-owner`
- `state-manual-review-required-sla`
- `state-manual-review-required-blocked-action`
- `state-manual-review-required-primary-action`
- `state-manual-review-required-secondary-action`
- `state-manual-review-required-refresh`
- `state-manual-review-required-evidence`
- `state-manual-review-required-context`
- `state-manual-review-required-offline`
- `state-manual-review-required-stale`
- `state-manual-review-required-row-badge`
- `state-manual-review-required-inline-panel`

## Failure Modes
### Owner Missing
Show:
```text
Review owner pending.
```

Actions:
- refresh
- open review queue if authorized
- contact support

### SLA Missing
Show:
```text
SLA not available.
```

Actions:
- open review
- refresh

### Review Record Missing
Show:
```text
Review record is not available yet.
```

Actions:
- refresh
- open queue
- contact support

### Route Forbidden
Show:
```text
You can see that review is required, but this review detail is restricted.
```

Actions:
- contact support
- refresh
- return to parent

### SLA Breached
Show:
```text
SLA breached. Escalate this review.
```

Actions:
- open review
- escalate where authorized

### Review Cleared But Parent Still Blocked
Show:
```text
Review has changed, but the record still needs a fresh status check.
```

Actions:
- refresh
- open parent record

## Anti-Patterns
Do not:
- show manual review as a generic error
- hide owner or SLA below long text
- let user approve from the shared state
- show `Continue anyway`
- show `Force approve`
- show `Replay now` if review is active
- show refund approved before decision
- show payment confirmed from provider payload alone
- show raw provider payload in shared state
- use red for every review state
- let stale data clear review
- let offline queue store review-owned mutation

## Acceptance Criteria
This spec is complete when the future implementation can prove:
- every review-required flow has owner and SLA display
- sender receives safe non-committal copy
- staff gets a useful review route
- finance review is distinct from sender payment state
- webhook review is distinct from webhook conflict where appropriate
- refund review does not show refund pending
- package review blocks self-serve continuation
- offline and stale states never re-enable blocked action
- analytics capture reason and owner without sensitive text
- tests cover reasons, roles, owner, SLA, and routes

## Definition Of Done
The future UI is not done until:
- shared component exists
- review mapper exists
- owner/SLA formatter exists
- role-safe copy helper exists
- full page, inline, and row variants exist
- refund review flows use it
- webhook review flows use it
- reconciliation flows use it
- package review blocker uses it
- custody and station review blockers use it
- offline queue rejects review-owned actions
- accessibility checks pass
- visual QA passes on phone and desktop
- contract tests prove backend mapping
- E2E tests prove no bypass

## Open Product Decisions
These decisions do not block implementation but should be resolved before pilot polish:
- whether sender sees broad SLA windows for finance review or only support update copy
- whether package review can save draft before support approval
- whether station lead can claim review ownership from mobile or only admin
- whether review owner labels should include city/station name for staff
- whether webhook manual-review counts should create finance on-call alerts outside business hours

## Build Handoff Summary
Claude Code should build `SharedManualReviewRequiredState` as a strict shared review gate. It should show reason, owner, SLA, blocked action, safe context, and recovery route while preventing approval, refund, dispatch, replay, custody override, or package continuation until backend state changes.

The intended experience is calm, accountable, and precise:
- user knows review is required
- user knows who owns it
- user knows the timing when available
- user gets the right route
- unsafe action remains impossible
