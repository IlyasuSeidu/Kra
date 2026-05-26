# Admin SLA Breach Dashboard Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID            | `AdminSlaBreachDashboard`                                                                                                                                                                                                                    |
| Route                | `/admin/sla-breaches`                                                                                                                                                                                                                        |
| Primary test ID      | `screen-admin-sla-breach-dashboard`                                                                                                                                                                                                          |
| Surface              | Admin web console                                                                                                                                                                                                                            |
| Backend coverage     | Composed read-only view from `admin_overview`, `admin_deliveries`, `admin_launch_readiness`, `admin_payment_reconciliation`, `admin_finance`, `list_issues`, and optional linked detail reads                                                |
| Offline critical     | No                                                                                                                                                                                                                                           |
| Required read role   | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`                                                                                                                                                                              |
| Required action role | None on this screen; action routes go to existing detail screens                                                                                                                                                                             |
| Required states      | `loading`, `ready`, `empty`, `breach`, `partial_data`, `backend_gap`, `refreshing`, `not_authorized`, `session_expired`, `api_error`                                                                                                         |
| Parent screens       | `AdminOverview`, `AdminLaunchReadiness`, `AdminIssueQueue`, `AdminPaymentReconciliation`, `AdminFinanceSummary`                                                                                                                              |
| Related screens      | `AdminDeliveryExplorer`, `AdminDeliveryDetail`, `AdminIssueDetail`, `AdminRefundEvidenceReview`, `AdminRefundSettlement`, `AdminPaymentReconciliationDetail`, `AdminLaunchReadinessDetail`, `AdminAuditEvents`, `AdminOutboundNotifications` |

## Purpose

`AdminSlaBreachDashboard` is the admin operations command surface for late work. It brings together visible service-level risk across intake, dispatch, station pickup, final mile, issue review, payment reconciliation, and refund settlement so the operations team can find the oldest and most harmful work first.

The screen should answer:

- `What is already outside policy?`
- `What is close to breaching policy?`
- `Which station, route, delivery, payment, refund, or issue owns the risk?`
- `Which items are visible from the current backend, and which need richer event timestamps?`
- `What should the admin open next to resolve the breach?`
- `Is this signal global, latest-list scoped, or partial?`
- `When was this dashboard last refreshed?`

This screen is not a state-changing workflow. It must not update delivery status, approve refunds, settle refunds, retry notifications, resolve issues, escalate issues, override custody, change station capacity, or edit pricing. It routes admins to the already specified action surfaces that own those decisions.

## Strategic Role

Delivery in Africa fails when exceptions stay invisible for too long: packages sit in stations, final-mile handoffs drift, support cases wait without owners, and refunds are delayed after customers already lost trust. This screen is the daily control tower for that risk.

The page must be strict, not decorative. It should treat every overdue item as an accountable operational object with:

- one policy clock
- one owner lane
- one data confidence label
- one next route
- one audit trail path

If the backend cannot prove a breach with a timestamp, the UI must say so and list the missing signal. A beautiful dashboard that overstates certainty is worse than no dashboard because it causes staff to work the wrong queue.

## Audience

Primary users:

- operations admins running morning and evening service reviews
- support admins triaging delivery, delay, and dispute issues
- finance admins clearing reconciliation and refund settlement clocks
- super admins reviewing pilot readiness and service health

Secondary users:

- engineering and product reviewers checking which backend signals are missing before scale
- station supervisors when a shared admin console is used in the station office

## User Context

Admins open this page under pressure. They may have calls from senders, station staff, drivers, couriers, and finance at the same time. The screen must help them choose the next highest-impact case without reading every delivery row.

Common moments:

- launch readiness review before enabling a station or corridor
- daily operations review at start of shift
- finance closeout review
- high-volume day after rain, market closures, holidays, or provider outages
- customer trust incident where a late refund or missing package is visible to leadership
- support queue review after several unresolved P1 issues appear

## Backend Reality

There is no dedicated `admin_sla_breaches` operation in the current backend contracts. The screen must compose existing reads and mark scope honestly.

Primary composed reads:

```http
GET /v1/admin/overview
GET /v1/admin/deliveries
GET /v1/admin/launch-readiness
GET /v1/admin/payment-reconciliation
GET /v1/admin/finance
GET /v1/issues
```

Optional contextual reads after a row opens or a details drawer is supported:

```http
GET /v1/deliveries/:deliveryId
GET /v1/deliveries/:deliveryId/timeline
GET /v1/issues/:issueId
GET /v1/admin/audit-events
```

Current backend facts:

- `admin_overview` returns generated time, delivery status counts, payment status counts, and operational alert counts.
- `admin_deliveries` returns the latest 100 deliveries only.
- `admin_deliveries` returns `latestOccurredAt`, not every transition timestamp.
- `admin_launch_readiness` returns blockers including station validation, unresolved P1 issues, payment reconciliation review, and receiver SMS dead-letter counts.
- `admin_payment_reconciliation` returns payment mismatch rows with `initiatedAt`, `lastReconciliationAt`, and `reviewRequiredAt`.
- `admin_finance` returns payment rows with `initiatedAt`, optional `verifiedAt`, optional `refundAmountGhs`, and payment status.
- `list_issues` returns issues with `createdAt`, `updatedAt`, optional `escalatedAt`, optional `resolvedAt`, optional `closedAt`, status, severity, and category.

Backend limits the UI must show:

- No global delivery SLA breach count exists.
- No exact intake due timestamp exists.
- No exact origin dispatch due timestamp exists.
- No exact final-mile assignment due timestamp exists.
- No courier assignment accepted timestamp exists in the admin delivery list.
- No final-mile failed-attempt timestamp exists in the admin delivery list.
- No refund approval timestamp exists in `admin_finance`.
- No refund settlement due timestamp exists in `admin_finance`.
- No issue acknowledgement timestamp exists separate from `updatedAt`.

## Source References

External references used for this screen:

- [Google SRE Workbook, Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/): supports actionable service-level alerting, grouped thresholds, and avoiding unique alert rules that do not scale.
- [Atlassian Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/check-out-your-queues/): supports SLA-sorted queues where work items show summary, status, customer, and target timing.
- [USWDS table guidance](https://designsystem.digital.gov/components/table/): supports structured breach tables, normalized units, captions with source and update time, sort where useful, and accessible narrow-screen table behavior.
- [GOV.UK Tag component](https://design-system.service.gov.uk/components/tag/): supports non-interactive status labels and warns that color cannot be the only information channel.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, filter, loading, and result-count changes without stealing focus.

Local policy references:

- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/accessibility-and-localization.md`

## Design Thesis

Design this as a high-command operations board: dense, calm, sober, and decisive. The strongest visual idea is an "aging clock wall" where every row is ordered by harm, time outside policy, and confidence. It should feel closer to an aviation operations board or emergency logistics desk than a generic analytics dashboard.

Visual direction:

- deep ivory or light stone background for long operating hours
- charcoal text with high-contrast red, amber, blue, and green tokens
- condensed numeric clock blocks for age and due status
- large breach count strip at the top
- left-side filter rail on desktop
- full-width stacked row cards on mobile
- minimal decoration

Restraint rule:

- Do not create decorative charts when a sortable queue makes the next decision clearer.

## Product Principles

- Every visible breach must have a policy basis or be labeled as an operational staleness signal.
- Every count must identify its data source and scope.
- Every row must route to a place where the admin can act.
- Every policy gap must be visible enough for backend planning.
- The first screenful must tell the admin whether today is clean, risky, or already failing.
- The interface must support fast keyboard work by shift leads.
- No color-only status communication.
- No mutation from this screen.

## SLA Vocabulary

Use `SLA` only for policy clocks documented in local business rules or backend readiness checks. Use `operational staleness` for aging signals that are useful but not yet backed by a specific policy due time.

Approved labels:

- `Breached`
- `Due soon`
- `On watch`
- `Unknown clock`
- `Needs event timestamp`
- `Policy gap`
- `Resolved`

Do not use:

- vague labels like `bad`, `late maybe`, or `problem`
- labels that imply a global count when the source is latest 100 deliveries
- labels that imply exact breach status when only `latestOccurredAt` exists

## SLA Classes

| Class                        | Label                           | Policy basis                    | Source status or object                                                             | Exactness                                                                                         |
| ---------------------------- | ------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pickup_hold_72h`            | Pickup hold over 72h            | Pickup hold policy              | `awaiting_receiver_pickup` or `on_hold`                                             | Approximate when derived from `latestOccurredAt`; exact when timeline supplies pickup-ready event |
| `return_to_sender_7d`        | Return-to-sender eligible       | Pickup hold policy              | `awaiting_receiver_pickup` or `on_hold`                                             | Approximate when derived from `latestOccurredAt`; exact when timeline supplies pickup-ready event |
| `doorstep_assignment`        | Final-mile assignment overdue   | Doorstep assignment policy      | `received_at_destination` or `awaiting_final_mile_assignment` with doorstep context | Approximate until backend exposes destination receipt and capacity signal                         |
| `courier_acceptance_15m`     | Courier acceptance overdue      | Doorstep assignment policy      | `assigned_for_final_mile`                                                           | Requires assignment timestamp; show as backend timestamp gap if absent                            |
| `out_for_delivery_2h`        | Out-for-delivery overdue        | Doorstep assignment policy      | `assigned_for_final_mile`                                                           | Requires accepted timestamp; show as backend timestamp gap if absent                              |
| `reattempt_24h`              | Doorstep reattempt overdue      | Failed attempt policy           | failed attempt timeline event                                                       | Requires failed-attempt timestamp; show only when timeline is loaded                              |
| `issue_ack_48h`              | Issue acknowledgement overdue   | Dispute SLA                     | `open` issue                                                                        | Approximate with `updatedAt` until explicit acknowledgement timestamp exists                      |
| `standard_dispute_5bd`       | Standard dispute overdue        | Dispute SLA                     | active issue with standard category                                                 | Approximate with `createdAt` and business-day helper                                              |
| `complex_dispute_10bd`       | Complex dispute overdue         | Dispute SLA                     | active loss, damage, provider-settlement, or custody issue                          | Approximate with `createdAt` and business-day helper                                              |
| `payment_reconciliation_30m` | Payment verification unresolved | Payment reconciliation mismatch | reconciliation row with mismatch type                                               | Exact when `reviewRequiredAt` exists                                                              |
| `refund_initiation_same_day` | Refund initiation due           | Refund execution rule           | approved refund context                                                             | Backend gap until refund approval timestamp exists                                                |
| `refund_completion_3bd`      | Original-method refund overdue  | Refund execution rule           | refund pending finance row                                                          | Backend gap until refund approval or initiation timestamp exists                                  |
| `alternate_refund_5bd`       | Alternate refund overdue        | Refund execution rule           | alternate refund context                                                            | Backend gap until alternate path fields exist                                                     |
| `launch_p1_blocker`          | Launch readiness blocker        | Launch readiness policy         | `admin_launch_readiness` blocker                                                    | Exact blocker count from backend                                                                  |
| `receiver_sms_dead_letter`   | Receiver notification blocker   | Launch readiness policy         | launch readiness blocker or outbound notifications                                  | Exact count when blocker exists; row details need outbound screen                                 |

## Data Scope Labels

Every summary tile and row group must show one of these data-scope labels:

- `Global backend count`: count is returned as an aggregate from backend.
- `Latest 100 deliveries`: count is derived from `admin_deliveries`.
- `Issue list scope`: count is derived from `list_issues` with current limit and filters.
- `Finance list scope`: count is derived from `admin_finance`.
- `Reconciliation list scope`: count is derived from `admin_payment_reconciliation`.
- `Launch readiness count`: count is returned by `admin_launch_readiness`.
- `Needs backend event`: screen cannot compute safely until backend exposes the timestamp or object.

Never mix these scopes in one number without a caption.

## Screen IA

Page regions in order:

- `Skip link`
- `Admin shell navigation`
- `Breadcrumb`
- `Page header`
- `Health strip`
- `Critical breach board`
- `Filter and scope bar`
- `Breach queue`
- `Policy clock matrix`
- `Backend gap panel`
- `Source freshness panel`
- `Related actions`

## Header

Header content:

- eyebrow: `Admin operations`
- title: `SLA breach dashboard`
- subtitle: `Find delivery, issue, payment, and refund clocks that need action.`
- refresh control: `Refresh`
- timestamp: `Updated <relative time> from backend`
- data scope: `Composed from admin reads`

Header actions:

- primary route button: `Open issue queue`
- secondary route button: `Open reconciliation`
- secondary route button: `Open launch readiness`

Do not show a mutation action in the header.

## Health Strip

The health strip is the first decision block.

Required tiles:

- `Critical breaches`
- `Due soon`
- `Issue SLA risk`
- `Payment review`
- `Refund risk`
- `Backend gaps`

Each tile must include:

- count
- trend text if available; otherwise show `No trend yet`
- data scope label
- source freshness
- click target that filters the queue

Tile severity rules:

- `Critical breaches` is red only when count is greater than zero.
- `Due soon` is amber when count is greater than zero.
- `Backend gaps` is blue-gray and never red unless a backend readiness blocker exists.
- `No trend yet` must be neutral and smaller than the count.

## Critical Breach Board

This is a compact top queue for the most urgent five items.

Sort order:

- breached P1 issue
- return-to-sender eligible package
- payment reconciliation review required
- refund pending with missing settlement clock
- final-mile or pickup overdue delivery
- launch readiness P1 blocker
- oldest `due soon` item

Each board item:

- severity label
- clock label
- object id
- route or station
- age outside policy or age since source timestamp
- data confidence
- primary route

If there are no critical breaches:

- Show `No breached clocks in the current visible scope.`
- Show `Continue checking due-soon and backend-gap panels before treating operations as clean.`

## Filter And Scope Bar

Desktop layout:

- left rail with filters
- main queue to the right

Tablet layout:

- top horizontal filters
- collapsible advanced filters

Mobile layout:

- sticky filter button
- selected filters as dismissible chips
- queue rows as stacked cards

Filter groups:

- severity: `critical`, `high`, `watch`, `backend_gap`
- SLA class
- owner lane: `operations`, `station`, `final_mile`, `support`, `finance`, `platform`
- station
- route
- object type: `delivery`, `issue`, `payment`, `refund`, `readiness`, `notification`
- confidence: `exact`, `approximate`, `needs_backend_event`
- age bucket: `breached`, `due_soon`, `on_watch`, `unknown`

Filter behavior:

- filters are client-side for composed rows unless a backend filter exists
- issue status and severity may call `list_issues` with backend filters
- reconciliation review reason may call `admin_payment_reconciliation` if exposed in route state
- all other filters must label scope as client-visible rows

Filter result message:

- Use a polite live region for `Showing 12 breach rows in latest 100 deliveries and issue list scope.`
- Do not move focus after filtering unless the user opened a modal filter sheet on mobile.

## Breach Queue

The breach queue is the main work surface.

Recommended columns:

- `Priority`
- `Clock`
- `Object`
- `Owner lane`
- `Status`
- `Age`
- `Confidence`
- `Source`
- `Next step`

Column rules:

- `Age` must use one consistent unit per visible sorted section.
- Numeric ages should be right aligned on desktop.
- Table caption must include source and last updated time.
- Sortable columns need a screen-reader announcement after sort.
- On mobile, stack each row with `Clock`, `Object`, `Age`, and `Next step` first.

Default sort:

- breached before due soon
- P1 before P2 before P3
- exact confidence before approximate confidence when severity is equal
- oldest age first
- backend gap rows after actionable breached rows unless the gap blocks launch readiness

## Row Anatomy

Every row must include:

- severity tag
- SLA class label
- object identifier
- object type
- current backend status
- owner lane
- station or route when known
- policy threshold
- source timestamp
- computed age or gap reason
- confidence label
- data scope label
- primary route
- secondary route when useful

Row content pattern:

```text
Critical
Pickup hold over 72h
DLV-...
Awaiting receiver pickup since 2026-05-18 09:30
Age: 3d 4h, threshold: 72h
Confidence: approximate from latest admin event
Next: Open delivery
```

Do not include customer phone number in the queue row.

## Severity Model

Severity is computed for display only. It must not be written to backend.

Display severity:

- `critical`: already outside policy or launch readiness P1 blocker
- `high`: due within 25 percent of its policy window or active P1 issue still open
- `watch`: aging but not yet outside policy
- `backend_gap`: policy exists but source timestamp is missing
- `resolved`: row remains only in a recently resolved filter view

Mapping examples:

- `awaiting_receiver_pickup` older than 72 hours: `critical`
- `awaiting_receiver_pickup` older than 54 hours: `high`
- `awaiting_receiver_pickup` older than 24 hours: `watch`
- `on_hold` older than 7 calendar days from pickup-ready event: `critical`
- `payment_reconciliation` row with `reviewRequiredAt`: `critical`
- open P1 issue older than 48 hours: `critical`
- open P1 issue under 48 hours: `high`
- `assigned_for_final_mile` without assignment timestamp: `backend_gap`

## Confidence Model

Confidence must be visible because several clocks are derived from incomplete backend data.

Confidence labels:

- `Exact`: source includes the event timestamp required by policy.
- `Approximate`: source uses `latestOccurredAt`, `createdAt`, or `updatedAt` as a safe proxy.
- `Needs backend event`: policy exists but required timestamp is absent.
- `Aggregate only`: count exists but row-level details are unavailable from current endpoint.

Tooltip copy:

- `Exact`: `This clock uses the policy event timestamp.`
- `Approximate`: `This clock uses the latest available backend timestamp and may need timeline review.`
- `Needs backend event`: `The policy exists, but this screen cannot compute the clock until backend exposes the required timestamp.`
- `Aggregate only`: `Backend exposes the count but not enough row detail on this screen.`

## Policy Clock Matrix

Show a matrix below the queue so admins understand why rows appear.

Columns:

- `Clock`
- `Threshold`
- `Owner lane`
- `Exact signal required`
- `Current source`
- `UI action`

Rows:

- pickup hold: `72 hours`, owner `station`, exact signal `pickup-ready timestamp`
- return-to-sender eligibility: `7 calendar days`, owner `station and support`, exact signal `pickup-ready timestamp`
- final-mile assignment: `same day before 15:00 or next business day`, owner `station and final mile`, exact signal `destination receipt timestamp plus doorstep request and capacity`
- courier acceptance: `15 minutes`, owner `final mile`, exact signal `assignment created timestamp`
- out-for-delivery movement: `2 hours`, owner `final mile`, exact signal `assignment accepted timestamp`
- doorstep reattempt: `24 hours`, owner `final mile`, exact signal `failed-attempt timestamp`
- issue acknowledgement: `48 hours`, owner `support`, exact signal `acknowledged timestamp`
- standard dispute: `5 business days`, owner `support`, exact signal `complete-evidence timestamp or issue created timestamp`
- complex dispute: `10 business days`, owner `support and leadership`, exact signal `complexity approval timestamp`
- payment reconciliation: `30 minutes`, owner `finance`, exact signal `reviewRequiredAt`
- original-method refund: `3 business days`, owner `finance`, exact signal `refund initiated timestamp`
- alternate refund: `5 business days`, owner `finance`, exact signal `alternate path approved timestamp`

## Backend Gap Panel

This panel is required. It prevents the frontend from pretending the backend is complete.

Show gaps grouped by owner:

- `Delivery timeline gaps`
- `Final-mile gaps`
- `Issue workflow gaps`
- `Refund gaps`
- `Analytics gaps`

Required gap rows:

- `Exact origin intake SLA clock needs an intake due timestamp or policy target.`
- `Exact origin dispatch SLA clock needs dispatch due timestamp and assignment history.`
- `Final-mile assignment SLA needs destination receipt timestamp, doorstep request flag, and capacity decision.`
- `Courier acceptance SLA needs assignment created timestamp and current assignment status.`
- `Out-for-delivery SLA needs assignment accepted timestamp.`
- `Doorstep reattempt SLA needs failed-attempt timestamp and attempt count.`
- `Issue acknowledgement SLA needs explicit acknowledged timestamp.`
- `Refund initiation and completion SLA need refund approval, initiation, route, and settlement timestamps.`
- `Global delivery breach counts need a backend aggregate or paginated breach query.`

Gap row actions:

- `Open API contracts`
- `Open delivery lifecycle`
- `Open refund rules`
- `Open issue queue`

Do not hide backend gaps behind an advanced panel. They are part of product truth.

## Empty State

The empty state appears only when all composed data loads and there are no breached or due-soon rows in the visible scope.

Title:

```text
No breached clocks in the current visible scope
```

Body:

```text
The current admin reads do not show late delivery, issue, payment, or refund work. Some exact clocks still require backend event timestamps, so keep the backend gap panel visible.
```

Actions:

- `Open overview`
- `Open launch readiness`
- `Review backend gaps`

Empty state must not claim the entire network is clean unless a future backend aggregate proves that.

## Partial Data State

Show partial data when at least one composed read fails while others succeed.

Banner title:

```text
Some breach signals could not load
```

Body:

```text
The queue is using the sources that loaded successfully. Counts may be incomplete until refresh succeeds.
```

Banner details:

- failed source name
- request id if returned
- retry action
- whether visible rows are still safe to act on

Rules:

- Do not discard successfully loaded rows.
- Mark summary tiles from failed sources as unavailable.
- Keep routes to related screens enabled only when source data for that route exists.

## Loading State

Use a staged loading pattern:

- header skeleton
- health strip skeleton
- queue skeleton with stable row height
- source freshness skeleton

Loading copy:

```text
Loading SLA breach signals...
```

Accessibility:

- expose loading state with `role="status"`
- do not announce every skeleton row
- keep focus on the triggering control

## Refreshing State

Refresh should be explicit and safe.

Refresh behavior:

- clicking `Refresh` refetches all composed reads
- existing rows stay visible while refresh is running
- refresh button changes to `Refreshing`
- show `Last refreshed` and `Refreshing now`
- after success, announce result count through a polite live region
- after failure, show partial data banner if any source failed

Do not auto-refresh aggressively by default. Operations dashboards can refresh on a moderate interval only if product enables it and the user can pause it.

## Error State

Full-page error appears only if all composed reads fail.

Title:

```text
SLA breach dashboard could not load
```

Body:

```text
The admin reads needed for this dashboard failed. Retry, or open the source screens directly if the issue continues.
```

Actions:

- `Retry`
- `Open admin overview`
- `Open issue queue`
- `Open reconciliation`

If an API error includes `requestId`, show it.

## Authorization State

If the principal lacks admin read access:

Title:

```text
You do not have access to SLA breach monitoring
```

Body:

```text
This dashboard is limited to authorized operations, support, finance, and super admin roles.
```

Action:

- `Back to admin home`

Do not reveal breach counts in this state.

## Session Expired State

Title:

```text
Session expired
```

Body:

```text
Sign in again to continue reviewing SLA breach signals.
```

Action:

- `Sign in`

Do not retain sensitive row data after session expiration.

## Route Mapping

| Row type                 | Primary route                                      | Secondary route                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| delivery breach          | `/admin/deliveries/:deliveryId`                    | `/admin/deliveries/:deliveryId/timeline` if supported               |
| pickup hold              | `/admin/deliveries/:deliveryId`                    | `/admin/issues?deliveryId=:deliveryId`                              |
| final-mile breach        | `/admin/deliveries/:deliveryId`                    | `/admin/stations/:stationId/capacity`                               |
| issue breach             | `/admin/issues/:issueId`                           | `/admin/deliveries/:deliveryId`                                     |
| payment reconciliation   | `/admin/finance/reconciliation/:paymentId`         | `/admin/finance`                                                    |
| refund risk              | `/admin/finance/refunds/:paymentId/evidence`       | `/admin/finance/refunds/:paymentId/settle`                          |
| launch blocker           | `/admin/launch-readiness`                          | `/admin/launch-readiness/:stationId` if station scoped route exists |
| receiver SMS dead letter | `/admin/outbound-notifications?status=dead_letter` | `/admin/launch-readiness`                                           |
| backend gap              | local docs route or engineering backlog link       | related admin source screen                                         |

The screen must never route to a non-existing path without an explicit route registry update.

## Data Composition

Create a frontend view model after all reads settle.

View model shape:

```ts
type SlaBreachRow = {
  rowId: string;
  objectType:
    | "delivery"
    | "issue"
    | "payment"
    | "refund"
    | "readiness"
    | "notification"
    | "backend_gap";
  objectId: string;
  deliveryId?: string;
  paymentId?: string;
  issueId?: string;
  stationId?: string;
  routeKey?: string;
  ownerLane: "operations" | "station" | "final_mile" | "support" | "finance" | "platform";
  slaClass: string;
  policyThresholdLabel: string;
  sourceTimestamp?: string;
  dueAt?: string;
  ageSeconds?: number;
  severity: "critical" | "high" | "watch" | "backend_gap" | "resolved";
  confidence: "exact" | "approximate" | "needs_backend_event" | "aggregate_only";
  dataScope:
    | "global_backend_count"
    | "latest_100_deliveries"
    | "issue_list_scope"
    | "finance_list_scope"
    | "reconciliation_list_scope"
    | "launch_readiness_count"
    | "needs_backend_event";
  currentStatus?: string;
  title: string;
  description: string;
  primaryRoute: string;
  secondaryRoute?: string;
  sourceName: string;
};
```

Rules:

- Use stable `rowId` values built from source and object id.
- Never use array index as row identity.
- Do not store row objects as backend truth.
- Rebuild rows after each successful refresh.
- Keep failed source metadata separate from row data.

## Computation Rules

Use UTC internally. Display local time with station or user context where applicable.

Helpers:

- `hoursSince(timestamp, now)`
- `calendarDaysSince(timestamp, now)`
- `businessDaysSince(timestamp, now, calendar)`
- `isBeforeLocalCutoff(timestamp, "15:00", stationTimezone)`
- `formatAge(seconds)`
- `formatDueWindow(dueAt, now)`

Pickup hold:

- If status is `awaiting_receiver_pickup` and `latestOccurredAt` is older than 72 hours, create a critical approximate row.
- If status is `on_hold`, create a critical row and use `latestOccurredAt` as approximate source unless timeline is available.
- If source age is older than 7 calendar days, add return-to-sender eligibility text.

Final-mile assignment:

- If status is `received_at_destination` or `awaiting_final_mile_assignment`, create watch or high rows only if doorstep context is known.
- Current admin delivery rows do not include `doorstep_requested`; if absent, show this as backend gap rather than assuming doorstep mode.

Courier acceptance:

- If status is `assigned_for_final_mile`, show a backend gap row because assignment timestamp is not available in the list read.

Out-for-delivery movement:

- If status is `assigned_for_final_mile`, show a backend gap row because acceptance timestamp is not available in the list read.

Issue acknowledgement:

- If issue status is `open`, use `createdAt` for age.
- If issue is P1 and older than 48 hours, mark critical.
- If issue is P1 and under 48 hours, mark high.
- If issue is P2 or P3 and older than 48 hours, mark high or watch depending on category.

Standard dispute:

- Categories `delay`, `payment`, `handoff`, and `other` use 5 business days unless category details indicate complex review.

Complex dispute:

- Categories `loss` and `damage` use 10 business days.
- `payment` rows tied to provider settlement review may also use complex path when reconciliation context exists.

Payment reconciliation:

- If mismatch type is `verification_unresolved_after_30_minutes` or `provider_verification_error`, create a critical finance row.
- Prefer `reviewRequiredAt` for exact source time.
- If `reviewRequiredAt` is absent, use `initiatedAt` and mark approximate.

Refund:

- If finance payment status is `refund_pending`, create a finance row.
- If refund approval or initiation timestamp is absent, mark `Needs backend event`.
- Do not compute 3-business-day or 5-business-day breach from `initiatedAt` because that is payment initiation, not refund initiation.

Launch readiness:

- Each blocker from `admin_launch_readiness` becomes one readiness row.
- P1 blockers are critical.
- P2 blockers are high or watch depending on blocker type.

Receiver SMS dead letters:

- If launch readiness reports `dead_letter_receiver_sms`, create a blocker row and route to outbound notifications.

## Business-Day Rules

Until a shared calendar service exists:

- business-day computations must use the configured operations calendar module if present
- if no calendar module exists, show `calendar age` and label business-day clock as `Needs calendar source`
- do not silently treat all days as business days for finance or dispute clocks

The UI can still show calendar age as context, but not as a definitive business-day breach.

## Owner Lanes

Owner lane mapping:

- `station`: pickup hold, return-to-sender eligibility, destination receipt aging
- `final_mile`: assignment, acceptance, out-for-delivery, reattempt
- `support`: issue acknowledgement, standard dispute, complex dispute
- `finance`: reconciliation, refund initiation, refund completion
- `operations`: launch readiness, station capacity, route-level backlog
- `platform`: backend event gaps, webhook signal gaps, analytics gaps

Use lane labels to route the admin, not to blame staff.

## Copy System

Tone:

- direct
- operational
- specific
- calm
- never punitive

Approved phrases:

- `Outside policy`
- `Due soon`
- `Needs timestamp`
- `Open delivery`
- `Open issue`
- `Open reconciliation`
- `Open refund evidence`
- `Backend signal missing`
- `Latest 100 delivery scope`
- `Aggregate only`

Avoid:

- casual language
- blame language
- customer-facing promises
- exact claims without exact source

## Visual Components

Required components:

- admin shell
- breadcrumb
- page header
- health metric strip
- severity tag
- scope badge
- confidence badge
- filter rail
- breach table
- stacked mobile row card
- backend gap panel
- source freshness list
- partial data banner
- empty state
- retry panel
- live region

Do not create:

- decorative radial charts
- animated maps
- excessive card grids
- interactive tags that look like buttons
- color-only severity

## Status Tags

Tags are non-interactive.

Severity tag styles:

- `Critical`: red border, red-tinted background, text includes `Critical`
- `High`: amber border, amber-tinted background, text includes `High`
- `Watch`: blue-gray border, blue-gray-tinted background, text includes `Watch`
- `Backend gap`: slate border, slate-tinted background, text includes `Backend gap`
- `Resolved`: green border, green-tinted background, text includes `Resolved`

Confidence tags:

- `Exact`
- `Approximate`
- `Needs backend event`
- `Aggregate only`

Never rely on hue alone.

## Interaction Details

Row click:

- primary click opens the primary route
- keyboard `Enter` on row action opens route
- row itself may be selectable only if it has clear focus styling and no nested conflicting controls

Row expand:

- allowed for a short evidence drawer
- drawer must not fetch heavy detail by default unless user expands
- drawer shows policy basis, source fields, and route actions

Filter chips:

- each chip has a remove control
- clear all is visible after two or more filters
- mobile filter sheet traps focus while open

Sorting:

- default sort is urgency
- support sort by age, owner lane, confidence, and object type
- sort state must be announced through a polite live region

Refresh:

- must preserve filters
- must preserve scroll unless rows materially change and user triggered a route
- must not clear queue during refresh

## Evidence Drawer

The row evidence drawer should show:

- policy basis
- source endpoint
- source fields used
- timestamp used
- missing timestamp if any
- current backend status
- route to detail
- route to audit when target id exists

Drawer sections:

- `Why this is here`
- `Data used`
- `What is missing`
- `Next step`

If a row is exact:

- `What is missing` may say `No required SLA signal is missing for this row.`

If a row is approximate:

- `What is missing` names the exact event timestamp needed.

## Source Freshness Panel

Show each composed source:

- source name
- endpoint
- loaded status
- generated time if returned
- response age
- row count used
- failed request id if any

Sources:

- `Admin overview`
- `Admin deliveries`
- `Launch readiness`
- `Payment reconciliation`
- `Finance`
- `Issues`

Panel copy:

```text
This dashboard composes existing admin reads. A row can be actionable while another source is unavailable.
```

## Analytics Events

Analytics must avoid sensitive customer content.

Events:

- `admin_sla_dashboard_viewed`
- `admin_sla_dashboard_refresh_clicked`
- `admin_sla_dashboard_refresh_succeeded`
- `admin_sla_dashboard_refresh_failed`
- `admin_sla_filter_changed`
- `admin_sla_sort_changed`
- `admin_sla_row_opened`
- `admin_sla_gap_panel_viewed`
- `admin_sla_source_failed`
- `admin_sla_partial_data_seen`

Event fields:

- `actor_role`
- `severity_filter`
- `sla_class_filter`
- `owner_lane_filter`
- `confidence_filter`
- `visible_row_count`
- `critical_count`
- `source_name`
- `route_target`
- `data_scope`

Do not send:

- receiver name
- receiver phone
- sender id
- free-text issue description
- provider reference

## Permissions

Read access:

- `ops_admin`: delivery, launch readiness, issue, and station SLA signals
- `support_admin`: issue, delivery, refund evidence, and notification SLA signals
- `finance_admin`: finance and reconciliation SLA signals; delivery rows may be visible only as finance context if policy permits
- `super_admin`: all signals

Role visibility:

- if a role cannot open a target detail screen, show the row as limited and route to the allowed parent screen
- do not hide global counts if role policy allows aggregate health but not row detail
- do not show raw provider references to non-finance roles

Action access:

- no mutation is available on this screen
- role-based action gating happens on target detail screens

## Security And Privacy

Protect sensitive data:

- no phone numbers in the breach queue
- no full receiver address in the breach queue
- no provider reference unless finance role is authorized
- no issue description in analytics
- no free-text support notes in table rows

Safe display:

- receiver name can appear only if existing admin delivery list already exposes it and role permits it
- prefer delivery id, tracking code, station id, route, and status in shared operating areas
- truncate long text but preserve full text in accessible label only when non-sensitive

## Accessibility Requirements

Required:

- one `h1`
- logical heading order
- skip link
- keyboard-accessible filters and rows
- focus visible on every interactive element
- no color-only status
- table caption with scope and freshness
- row actions with clear names such as `Open delivery DLV-...`
- live region for refresh, filter count, and sort state
- mobile filter sheet with focus trap
- no unexpected focus movement on refresh

Status messages:

- `Loading SLA breach signals`
- `Showing 14 breach rows`
- `Sorted by age descending`
- `Refresh failed for finance source`
- `No breached clocks in current visible scope`

Reduced motion:

- row reorder and refresh shimmer must respect reduced-motion settings
- no continuous animation
- no attention-grabbing pulse after first render

## Responsive Behavior

Desktop:

- 12-column grid
- fixed left filter rail
- health strip across top
- table with sticky header if content is long

Tablet:

- filter rail becomes top filter group
- table remains, with fewer visible columns
- less important fields move into row expansion

Mobile:

- queue becomes stacked cards
- health strip becomes horizontal scroll with visible labels
- filter sheet opens from bottom
- row actions remain thumb reachable
- source freshness panel appears after backend gap panel

Mobile row card order:

- severity and SLA class
- object id and status
- age and threshold
- owner lane and station
- confidence and scope
- primary route

## Performance Requirements

Targets:

- first meaningful shell under 1.5 seconds on broadband
- visible skeleton immediately after route load
- composed rows under 250 visible rows without lag
- filter update under 100 ms for current loaded rows
- avoid re-rendering all rows when one filter chip changes if the framework supports stable keyed rows

Data behavior:

- fetch reads in parallel
- use all-settled behavior for partial data
- cap initial issue and reconciliation reads according to backend limit
- do not fetch detail for every row on initial load
- prefetch detail only on row hover or intent if product framework supports it safely

## State Machine

States:

- `loading`: no source has returned yet
- `ready`: at least all required sources returned and rows exist
- `empty`: all required sources returned and no visible rows exist
- `breach`: one or more critical rows exist
- `partial_data`: one or more sources failed and one or more sources succeeded
- `backend_gap`: no breach rows but missing source timestamps prevent exact clocks
- `refreshing`: user or scheduled refresh in progress
- `not_authorized`: role lacks access
- `session_expired`: auth token invalid
- `api_error`: all source reads failed

Transitions:

- `loading -> breach` when critical rows exist
- `loading -> ready` when rows exist without critical breach
- `loading -> empty` when no rows and no blocking gap
- `loading -> backend_gap` when no rows but required event timestamps are absent
- `loading -> partial_data` when at least one source fails and one succeeds
- `refreshing -> breach` when refreshed rows include critical rows
- `refreshing -> partial_data` when at least one source fails
- `refreshing -> api_error` when all sources fail

## Test IDs

Root:

- `screen-admin-sla-breach-dashboard`

Header:

- `admin-sla-header`
- `admin-sla-refresh-action`
- `admin-sla-updated-at`

Health strip:

- `admin-sla-critical-count`
- `admin-sla-due-soon-count`
- `admin-sla-issue-risk-count`
- `admin-sla-payment-review-count`
- `admin-sla-refund-risk-count`
- `admin-sla-backend-gap-count`

Filters:

- `admin-sla-filter-rail`
- `admin-sla-filter-severity`
- `admin-sla-filter-owner-lane`
- `admin-sla-filter-sla-class`
- `admin-sla-filter-confidence`
- `admin-sla-filter-station`
- `admin-sla-filter-clear-all`

Queue:

- `admin-sla-breach-queue`
- `admin-sla-breach-row`
- `admin-sla-row-open-action`
- `admin-sla-row-expand-action`
- `admin-sla-row-confidence`
- `admin-sla-row-source-scope`

Panels:

- `admin-sla-policy-clock-matrix`
- `admin-sla-backend-gap-panel`
- `admin-sla-source-freshness-panel`
- `admin-sla-partial-data-banner`
- `admin-sla-empty-state`
- `admin-sla-error-state`
- `admin-sla-live-region`

## Acceptance Criteria

Functional:

- Loads composed data from existing admin and issue reads.
- Shows exact, approximate, aggregate, and backend-event-needed confidence labels.
- Shows no mutation controls.
- Routes every actionable row to an existing target screen.
- Shows backend gaps even when there are no breaches.
- Preserves visible rows during refresh.
- Handles partial data without erasing successful source rows.
- Labels scope on every count and row group.
- Does not compute refund completion breach without refund timestamp.
- Does not compute final-mile acceptance breach without assignment timestamp.

Policy:

- Pickup hold policy uses 72 hours.
- Return-to-sender eligibility uses 7 calendar days.
- Doorstep assignment policy uses before 15:00 same-day target and after 15:00 next-business-day target only when supporting data exists.
- Courier acceptance policy uses 15 minutes only when assignment timestamp exists.
- Out-for-delivery policy uses 2 hours only when accepted timestamp exists.
- Doorstep reattempt policy uses 24 hours only when failed-attempt timestamp exists.
- Dispute acknowledgement uses 48 hours with confidence label.
- Standard dispute policy uses 5 business days.
- Complex dispute policy uses 10 business days.
- Payment reconciliation uses backend mismatch types and `reviewRequiredAt`.
- Refund execution clocks are displayed as backend gaps until refund timestamps exist.

UX:

- First screenful identifies whether critical breach rows exist.
- Queue can be filtered by severity, SLA class, owner lane, object type, and confidence.
- Mobile cards preserve the same decision fields as desktop rows.
- Empty state does not overclaim global cleanliness.
- Partial data banner names the failed source.

Accessibility:

- Filter and refresh result changes are announced.
- Sort changes are announced.
- Tags are text-labeled and not color-only.
- Tables have captions.
- Focus order follows visual order.
- Mobile filter sheet traps focus and restores it on close.

Security:

- No phone numbers in queue rows.
- No provider reference in non-finance context.
- No sensitive free text in analytics.
- No row data shown when authorization fails.

## QA Scenarios

Core loading:

- User opens route with all sources healthy.
- User opens route and one source fails.
- User opens route and all sources fail.
- User refreshes while rows are visible.
- User signs out during refresh.

Pickup hold:

- Delivery in `awaiting_receiver_pickup` is 73 hours old.
- Delivery in `awaiting_receiver_pickup` is 54 hours old.
- Delivery in `on_hold` is older than 7 calendar days.
- Delivery has no exact pickup-ready event.

Final mile:

- Delivery is `received_at_destination` but doorstep request is unavailable.
- Delivery is `awaiting_final_mile_assignment` with missing capacity signal.
- Delivery is `assigned_for_final_mile` with missing assignment timestamp.
- Timeline-loaded detail provides assignment timestamp in a future contract.

Issues:

- Open P1 issue older than 48 hours.
- Open P1 issue under 48 hours.
- Loss issue older than 10 business days.
- Standard delay issue older than 5 business days.
- Resolved issue does not appear unless resolved filter is enabled.

Finance:

- Reconciliation row has `verification_unresolved_after_30_minutes`.
- Reconciliation row has `provider_verification_error`.
- Refund payment is `refund_pending` without refund initiation timestamp.
- Refunded payment does not appear as pending breach.

Launch readiness:

- Unresolved P1 issue blocker appears as critical.
- Payment reconciliation review blocker routes to reconciliation.
- Dead-letter receiver SMS blocker routes to outbound notifications.

Accessibility:

- Screen reader hears refresh result.
- Screen reader hears sort change.
- Keyboard user opens a row action.
- Keyboard user opens and closes mobile filter sheet.
- Reduced-motion user does not see animated row pulses.

## Implementation Notes

Recommended implementation sequence:

1. Add route and empty shell.
2. Wire composed read hooks with all-settled handling.
3. Build typed view model and source freshness metadata.
4. Implement policy clock helpers.
5. Render health strip and breach queue.
6. Add filter, sort, and live-region behavior.
7. Add backend gap panel and policy matrix.
8. Add partial data and full error states.
9. Add mobile card layout.
10. Add analytics events without sensitive content.
11. Add tests for policy clocks and confidence labels.
12. Add route integration tests.

Do not add backend mutations for this page.

## Test Plan

Unit tests:

- view model row creation from admin deliveries
- issue age classification
- reconciliation row classification
- refund backend gap classification
- launch blocker row creation
- confidence label mapping
- owner lane mapping
- sort order
- filter combinations

Component tests:

- loading state
- breach state
- empty state
- partial data banner
- backend gap panel
- queue row routing
- mobile filter sheet
- live-region messages

Integration tests:

- route `/admin/sla-breaches` renders root test id
- composed sources load in parallel
- one failed source produces partial data
- all failed sources produce full error
- refresh preserves filters
- role without access sees authorization state

Accessibility tests:

- axe scan for desktop and mobile layouts
- keyboard navigation across filters and row actions
- focus restore after mobile filter sheet
- no color-only severity reliance
- live region updates for refresh and sorting

## Open Backend Decisions

These are not blockers for building the read-only screen, but they are required for exact industry-grade SLA monitoring:

- Add a dedicated `admin_sla_breaches` endpoint with paginated rows.
- Add exact due timestamps for intake, dispatch, final-mile assignment, courier acceptance, out-for-delivery, reattempt, issue acknowledgement, refund initiation, and refund settlement.
- Add global breach aggregates by station, corridor, owner lane, and severity.
- Add business calendar service for finance and dispute business-day clocks.
- Add row-level links from launch readiness blockers to the exact affected objects.
- Add safe export endpoint for SLA breach review.

## Completion Standard

The screen is complete when:

- admins can see the oldest and most severe visible breach first
- every row has a route to action
- every count states scope
- every approximate clock states why it is approximate
- every missing backend signal is visible
- no mutation is available from the dashboard
- all accessibility and responsive requirements pass
- tests protect every policy clock rule listed above
