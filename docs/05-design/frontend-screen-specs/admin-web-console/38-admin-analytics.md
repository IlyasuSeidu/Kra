# Admin Analytics Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID            | `AdminAnalytics`                                                                                                                                                                                               |
| Route                | `/admin/analytics`                                                                                                                                                                                             |
| Primary test ID      | `screen-admin-analytics`                                                                                                                                                                                       |
| Surface              | Admin web console                                                                                                                                                                                              |
| Backend coverage     | `admin_overview`; KPI definitions from analytics docs                                                                                                                                                          |
| Offline critical     | No                                                                                                                                                                                                             |
| Required read role   | `ops_admin`, `finance_admin`, `support_admin`, or `super_admin`                                                                                                                                                |
| Required action role | None on this screen                                                                                                                                                                                            |
| Required states      | `loading`, `ready`, `empty`, `partial_data`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error`                                                                                           |
| Parent screens       | `AdminOverview`, `AdminLaunchReadiness`, `AdminSlaBreachDashboard`, `AdminFinanceSummary`                                                                                                                      |
| Related screens      | `AdminOverview`, `AdminLaunchReadiness`, `AdminDeliveryExplorer`, `AdminSlaBreachDashboard`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminWebhookEvents`, `AdminIssueQueue`, `AdminExportReport` |

## Purpose

`AdminAnalytics` is the pilot KPI review surface for Kra admins. It gathers the currently implemented `admin_overview` snapshot, documented KPI targets, SLO expectations, and launch reporting rules into one honest analytics workspace.

The screen should answer:

- `Is the pilot operating inside the approved KPI targets?`
- `Which KPI groups are measurable today from implemented backend data?`
- `Which KPI groups are documented but waiting for dedicated metric endpoints?`
- `Are delivery, payment, and webhook risk signals trending toward launch concern?`
- `Which admin owner should act on a weak signal?`
- `Which deeper screen owns the next review?`
- `When was the current analytics snapshot generated?`
- `Which values are real backend values versus documented targets?`

This screen is a read-only executive and operations analytics surface. It must not mutate delivery state, approve refunds, change pricing, edit KPI targets, export data directly, or invent trend values from unavailable endpoints.

## Strategic Role

Admin overview is the operating pulse. `AdminAnalytics` is the structured KPI review room. It translates the pulse into pilot management questions without pretending that every KPI is already measurable through a backend endpoint.

The screen must separate:

- implemented metrics from `GET /v1/admin/overview`
- targets from KPI and success-metric documents
- SLOs from platform reliability docs
- unsupported trend lines that require future analytics endpoints

That separation is essential. A serious analytics screen is not a decorative chart wall; it is a governed decision surface.

## Audience

Primary users:

- super admins reviewing pilot health
- ops admins reviewing reliability and speed signals
- finance admins reviewing payment and webhook signals
- support admins reviewing issue pressure signals

Secondary users:

- business owner reviewing route expansion readiness
- QA reviewers validating metric boundaries
- engineering leads reviewing observability gaps
- Claude Code implementing the frontend later

Non-users:

- senders
- receivers
- drivers
- station operators
- final-mile couriers
- public web visitors

## Backend Reality

Implemented endpoint:

```http
GET /v1/admin/overview
```

Operation:

```text
admin_overview
```

Auth:

- admin-scoped
- accepts authenticated admin roles
- current route guard uses `requireAdmin`

Response:

```json
{
  "generatedAt": "2026-05-16T09:00:00.000Z",
  "deliveryStatusCounts": [
    {
      "status": "delivered",
      "count": 120
    }
  ],
  "paymentStatusCounts": [
    {
      "status": "confirmed",
      "count": 118
    }
  ],
  "operationalAlerts": {
    "openIssueLikeDeliveries": 3,
    "unmatchedWebhookEvents": 1,
    "manualReviewWebhookEvents": 2
  }
}
```

Implemented fields:

- `generatedAt`
- `deliveryStatusCounts`
- `paymentStatusCounts`
- `operationalAlerts.openIssueLikeDeliveries`
- `operationalAlerts.unmatchedWebhookEvents`
- `operationalAlerts.manualReviewWebhookEvents`

Current backend limits:

- No dedicated analytics endpoint exists.
- No time-series endpoint exists.
- No route KPI endpoint exists.
- No station KPI endpoint exists.
- No refund KPI endpoint exists.
- No proof capture KPI endpoint exists.
- No repeat sender KPI endpoint exists.
- No export generation endpoint exists from this route.
- No date-range query exists for `admin_overview`.
- No KPI target mutation endpoint exists.
- No chart-ready history is returned.

Therefore:

- The screen can render current snapshot analytics from `admin_overview`.
- The screen can render documented KPI targets as target cards.
- The screen can mark non-measurable KPIs as `Endpoint required`.
- The screen must not draw historical charts unless data is supplied later.

## Source References

External references used for this screen:

- [USWDS Data visualizations](https://designsystem.digital.gov/components/data-visualizations/): supports accessible chart labels, tabular alternatives, and responsible use of visual data.
- [Google Cloud Monitoring Dashboards overview](https://docs.cloud.google.com/monitoring/dashboards): supports dashboard design choices, grouping, avoiding performance issues, and choosing tables, scorecards, gauges, and charts by data shape.
- [Google Cloud Monitoring charts and tables](https://cloud.google.com/monitoring/charts): supports chart, table, gauge, and scorecard distinctions for recent values versus time-series data.
- [Material Design Cards](https://m3.material.io/components/cards/overview): supports grouped metric cards with clear action surfaces.
- [Material Design Progress indicators](https://m3.material.io/components/progress-indicators/overview): supports loading and refresh presentation without losing user orientation.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, stale, error, and filtered metric states.
- [Google SRE Workbook, Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/): supports SLO-backed alert thinking and avoiding noisy non-actionable signals.

Local references:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/02-admin-overview.md`
- `docs/11-analytics/kpis.md`
- `docs/11-analytics/dashboard-metrics.md`
- `docs/01-product/goals-and-success-metrics.md`
- `docs/14-platform/slo-sla.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/04-features/admin-dashboard-spec.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/admin.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Design Thesis

Design this as a pilot performance board: quiet, executive-grade, target-led, and brutally honest about data completeness. The page should feel like a serious operating review deck inside the admin console, not a colorful vanity analytics page.

Visual direction:

- editorial dashboard layout
- target cards first
- current backend snapshot second
- coverage warnings near each unsupported KPI
- sparing charts with text alternatives
- owner labels beside each KPI
- route-to-action links
- soft neutral background
- high-contrast status accents

Restraint rule:

- Do not draw trend lines, route rankings, station rankings, or growth curves without implemented data. Use `Endpoint required` and route to the appropriate owner screen instead.

## Product Principle

Every number must have a source and an owner.

Each metric must identify:

- source: backend endpoint or local document
- measurement window
- owner role
- target
- current value when available
- confidence level
- next route

If any of these are unknown, the UI must say so.

## Information Architecture

Desktop structure:

- Admin shell and breadcrumb.
- Page header with freshness and refresh.
- Pilot KPI health strip.
- Data coverage notice.
- KPI group tabs or sections.
- Current snapshot cards from `admin_overview`.
- Documented target matrix.
- Operational alert drill-down section.
- Measurement gaps section.
- Owner review cadence section.

Mobile structure:

- Header stack.
- KPI health cards in one column.
- Snapshot cards.
- KPI group accordions.
- Gap cards.
- Owner routes.

Recommended sections:

1. `Pilot health`
2. `Current snapshot`
3. `Reliability KPIs`
4. `Speed KPIs`
5. `Trust KPIs`
6. `Growth KPIs`
7. `SLO and operations`
8. `Measurement gaps`

## Routing

Primary route:

```text
/admin/analytics
```

No route query parameters are required for v1.

Optional future query parameters:

- `group=reliability`
- `group=speed`
- `group=trust`
- `group=growth`
- `window=daily`
- `window=weekly`
- `window=monthly`

Do not implement optional query parameters until the corresponding UI behavior and data are ready.

Entry routes:

- admin shell navigation
- `AdminOverview` analytics link
- `AdminLaunchReadiness` KPI review link
- `AdminSlaBreachDashboard` analytics link
- `AdminFinanceSummary` finance KPI link

Exit routes:

- `/admin`
- `/admin/deliveries`
- `/admin/sla-breaches`
- `/admin/finance`
- `/admin/payment-reconciliation`
- `/admin/webhook-events`
- `/admin/issues`
- `/admin/exports/new`

## Data Contract Mapping

| API field                                     | Analytics usage             | Treatment                    |
| --------------------------------------------- | --------------------------- | ---------------------------- |
| `generatedAt`                                 | Snapshot freshness          | Header and stale warning     |
| `deliveryStatusCounts`                        | Delivery mix and risk cards | Current snapshot only        |
| `paymentStatusCounts`                         | Payment mix cards           | Current snapshot only        |
| `operationalAlerts.openIssueLikeDeliveries`   | Support/ops pressure        | Alert card and issue route   |
| `operationalAlerts.unmatchedWebhookEvents`    | Finance webhook risk        | Alert card and webhook route |
| `operationalAlerts.manualReviewWebhookEvents` | Finance review risk         | Alert card and webhook route |

Derived from current snapshot:

- total deliveries represented by status counts
- delivered count
- issue-like delivery count
- payment total represented by status counts
- confirmed payment count
- pending payment count
- failed payment count
- webhook review count
- unmatched webhook count

Must not derive:

- delivery completion rate if denominator semantics are not guaranteed
- lost package rate
- failed handoff rate
- dispatch turnaround compliance
- final-mile completion time
- proof capture completion rate
- repeat sender rate
- route growth
- station performance ranking
- revenue

Those require dedicated source data.

## KPI Groups

### Reliability

Documented KPIs:

- delivery completion rate, target `>= 97%`
- lost package rate, target `<= 0.5%`
- failed handoff rate, target `<= 1%`

Current screen behavior:

- show targets
- show owner `ops_admin`
- show measurement window `weekly`
- show `Endpoint required` for exact values until dedicated sources exist
- show current delivery status mix as supporting context

Primary routes:

- `/admin/deliveries`
- `/admin/sla-breaches`
- `/admin/issues`

### Speed

Documented KPIs:

- dispatch turnaround compliance, target `>= 90%`
- on-time destination receipt confirmation, target `>= 95%`
- median support acknowledgement time, target `< 15 minutes`

Current screen behavior:

- show targets
- show owner roles
- show measurement window
- show `Endpoint required`
- route to SLA breach dashboard and issue queue

Primary routes:

- `/admin/sla-breaches`
- `/admin/issues`

### Trust

Documented KPIs:

- dispute rate, target `<= 3%`
- refund resolution within policy window, target `>= 90%`
- proof capture completion rate, target `>= 98%`
- successful receipt generation, target `100%`

Current screen behavior:

- show targets
- show finance and ops owners
- use current payment status counts and webhook alert counts as supporting context
- avoid exact trust KPI claims without dedicated data

Primary routes:

- `/admin/finance`
- `/admin/payment-reconciliation`
- `/admin/webhook-events`
- `/admin/issues`

### Growth

Documented KPIs:

- repeat sender rate
- active station count
- delivery volume per route
- monthly active stations
- revenue per completed delivery

Current screen behavior:

- show as documented targets or monitored goals where targets exist
- mark current value as `Endpoint required`
- route to export flow if a manual analysis is needed

Primary routes:

- `/admin/exports/new`
- `/admin/deliveries`
- `/admin/settings`

## Pilot Health Strip

Cards:

- `Delivery snapshot`
- `Payment snapshot`
- `Issue pressure`
- `Webhook review`
- `Data coverage`

Delivery snapshot:

- current total from `deliveryStatusCounts`
- top risk states if present: `issue_reported`, `on_hold`, `delivery_failed`
- route to delivery explorer

Payment snapshot:

- current total from `paymentStatusCounts`
- confirmed, pending, failed values when present
- route to finance summary

Issue pressure:

- value from `openIssueLikeDeliveries`
- route to issue queue or SLA breach dashboard

Webhook review:

- unmatched plus manual-review values
- route to webhook events

Data coverage:

- value label: `Current snapshot only`
- body: `Trends and exact KPI rates require dedicated analytics endpoints.`
- route to measurement gaps

## Current Snapshot Section

Purpose:

- show implemented backend facts from `admin_overview`

Cards:

- Delivery status mix
- Payment status mix
- Operational alerts
- Snapshot freshness

Delivery status mix:

- render as stacked bar or compact table
- always include text table alternative
- count total returned statuses
- sort by product lifecycle order, not alphabetically

Payment status mix:

- render as status cards or compact bar
- include confirmed, pending, failed, refunded, refund pending if present
- do not convert to success rate unless denominator semantics are approved

Operational alerts:

- open issue-like deliveries
- unmatched webhook events
- manual-review webhook events
- each card routes to owner screen

Snapshot freshness:

- show generated timestamp
- show relative age
- show stale warning if older than admin refresh target

## KPI Target Matrix

Columns:

- KPI
- Target
- Owner
- Cadence
- Current value
- Source
- Status
- Route

Current value states:

- numeric value
- `Current snapshot only`
- `Endpoint required`
- `Not measured in v1`

Status labels:

- `On track`
- `Watch`
- `Action needed`
- `Not measurable yet`
- `Documented target`

Rules:

- `On track`, `Watch`, and `Action needed` require a real current value and target comparison.
- If there is no real current value, use `Not measurable yet`.
- Do not use green for a target-only row.
- Do not hide unsupported KPIs.

## Data Coverage Notice

Always show a compact coverage notice near the top:

```text
This analytics screen uses the current admin overview snapshot and documented KPI targets. Trend lines, route rankings, station rankings, and exact KPI rates require future analytics endpoints.
```

Rules:

- Keep the notice visible in ready state.
- It can be collapsed after the user reads it, but should remain accessible.
- It must reappear after a major data-contract change.

## Empty State

Trigger:

- overview endpoint returns empty status arrays and zero operational alerts

Copy:

```text
No operational snapshot values are available yet.
KPI targets are documented, but current values will appear after delivery, payment, and webhook data is recorded.
```

Actions:

- `Refresh`
- `Open admin overview`
- `Open delivery explorer`

Rules:

- Still show KPI target matrix.
- Mark current values as unavailable.
- Do not imply the pilot is healthy because there are no rows.

## Partial Data State

Trigger:

- overview returns one metric family but not another
- data arrays are empty for one section
- derived status totals are zero but alerts exist

Copy:

```text
Some analytics values are unavailable in the current snapshot.
Use the available values for orientation and open owner screens for row-level review.
```

Rules:

- Render available sections.
- Mark missing sections clearly.
- Do not block the page if one family is empty.

## Loading State

Trigger:

- first `admin_overview` request pending

Layout:

- header skeleton
- health strip skeleton
- target matrix skeleton
- snapshot chart skeleton

Copy:

```text
Loading analytics snapshot...
```

Rules:

- Do not show chart axes without values.
- Do not animate counters.
- Preserve page layout.

## Refreshing State

Trigger:

- manual refresh or background refetch

Behavior:

- keep current values visible
- show `Refreshing analytics...`
- keep focus on refresh button
- announce completion and generated time

Copy after completion:

```text
Analytics snapshot refreshed.
```

Rules:

- Do not clear KPI group selection.
- Do not clear expanded sections.
- Do not treat older generated time as success without stale notice.

## Stale State

Trigger:

- `generatedAt` exceeds admin dashboard freshness threshold

Recommended threshold:

- use admin dashboard refresh cadence from dashboard metrics: `5 minutes`

Copy:

```text
This analytics snapshot may be stale.
Refresh before making launch or staffing decisions.
```

Actions:

- `Refresh`

Rules:

- Stale values remain visible.
- Stale state must not hide critical counts.
- Stale warning must be announced if it appears after refresh.

## API Error State

Trigger:

- overview request fails
- backend returns non-success response

Copy:

```text
Analytics could not be loaded.
Retry, or use the admin overview and owner screens while this dashboard is unavailable.
```

Actions:

- `Retry`
- `Open admin overview`
- `Open export report`

Rules:

- Do not show stale values as current unless they are labeled stale.
- Do not expose backend stack traces.
- Do not block navigation to owner screens.

## Not Authorized State

Trigger:

- authenticated user is not an admin
- backend returns forbidden

Copy:

```text
You do not have permission to view admin analytics.
Use the role-specific app for your account.
```

Actions:

- `Back to home`

Rules:

- No metrics remain visible.
- Do not preserve cached analytics values after authorization failure.

## Session Expired State

Trigger:

- backend returns unauthorized
- admin session expires

Copy:

```text
Your admin session expired.
Sign in again to view analytics.
```

Actions:

- `Sign in`

Rules:

- Clear visible analytics values.
- Preserve intended return route.

## Visualization Rules

Allowed current visualizations:

- scorecards
- compact stacked bars
- status tables
- target matrix
- owner chips
- data coverage callouts

Avoid until endpoints exist:

- time-series line charts
- route ranking charts
- station ranking charts
- heatmaps
- conversion funnels
- cohort charts
- revenue charts

Chart rules:

- Every chart has a text equivalent.
- Every chart has a data source label.
- Every chart has a measurement window label.
- Colors are consistent across the admin console.
- Do not use red/green alone.
- Do not show a chart if a table is clearer.

## Role Personalization

`ops_admin` emphasis:

- reliability KPIs
- speed KPIs
- delivery snapshot
- issue pressure
- SLA breach route

`finance_admin` emphasis:

- trust KPIs
- payment snapshot
- webhook review
- refund and reconciliation routes

`support_admin` emphasis:

- issue pressure
- support acknowledgement target
- customer trust signals
- issue queue route

`super_admin` emphasis:

- all KPI groups
- data coverage
- launch readiness
- export report

Rules:

- Personalization changes ordering and emphasis only.
- It must not hide critical cross-functional alerts.
- It must not bypass backend authorization.

## Owner Routes

| Signal                       | Owner                  | Route                                                  |
| ---------------------------- | ---------------------- | ------------------------------------------------------ |
| delivery risk                | `ops_admin`            | `/admin/deliveries`                                    |
| SLA breach risk              | `ops_admin`            | `/admin/sla-breaches`                                  |
| open issue-like deliveries   | `support_admin`        | `/admin/issues`                                        |
| payment risk                 | `finance_admin`        | `/admin/finance`                                       |
| reconciliation risk          | `finance_admin`        | `/admin/payment-reconciliation`                        |
| unmatched webhook events     | `finance_admin`        | `/admin/webhook-events?processingStatus=unmatched`     |
| manual-review webhook events | `finance_admin`        | `/admin/webhook-events?processingStatus=manual_review` |
| export-needed analysis       | `super_admin` or owner | `/admin/exports/new`                                   |

## Privacy And Analytics

This is an analytics screen, but it still must be privacy safe.

Do not send to product analytics:

- delivery IDs
- tracking codes
- payment IDs
- provider references
- user IDs
- station IDs unless approved as aggregated dimension
- issue text
- raw counts tied to a single customer
- route-specific sensitive records

Allowed analytics payload fields:

- role class
- selected KPI group
- snapshot age bucket
- metric coverage class
- visible section count
- has delivery risk
- has payment risk
- has webhook risk
- has issue risk

Frontend events:

- `admin_analytics_viewed`
- `admin_analytics_refreshed`
- `admin_analytics_kpi_group_selected`
- `admin_analytics_owner_route_clicked`
- `admin_analytics_coverage_notice_opened`
- `admin_analytics_error_seen`

Rules:

- Analytics events must not block UI.
- Analytics events must not include exact sensitive IDs.
- If exact counts are sensitive in a future deployment, bucket them before logging.

## Accessibility

Required:

- one `h1`: `Analytics`
- clear section headings
- semantic tables for KPI matrix
- chart text alternatives
- visible focus states
- keyboard-accessible KPI group controls
- live region for refresh and stale status
- no color-only meaning
- status labels include text

Status messages:

- refresh completion announces `Analytics snapshot refreshed`
- stale warning announces once when it appears
- errors announce assertively only when values cannot render

Chart alternatives:

- stacked bars have adjacent count table
- scorecards include labels, values, owner, and source
- target matrix is the source of truth for screen readers

## Responsive Behavior

Desktop, `>= 1200px`:

- KPI health strip in one row
- snapshot and target matrix side by side where useful
- owner routes in right rail

Laptop, `900px - 1199px`:

- health strip wraps to two rows
- target matrix remains full width
- owner rail becomes horizontal card group

Tablet, `700px - 899px`:

- section cards stack
- charts use simplified bars
- KPI matrix becomes horizontally scrollable only if labels remain accessible

Mobile, `< 700px`:

- one-column layout
- KPI group accordions
- matrix rows become cards
- chart alternatives appear before decorative bars
- refresh remains near header

## Performance

Rules:

- Fetch `admin_overview` only once per route load unless refreshing.
- Avoid heavy chart libraries for current data shape.
- Prefer CSS bars and tables.
- Keep derived computations small.
- Do not prefetch export data.
- Do not load all admin lists to approximate missing KPIs.

Target:

- first meaningful dashboard content from cached shell quickly
- overview fetch visible within admin read SLO expectations
- no blocking third-party analytics calls

## Error And Empty Matrix

| State             | Trigger                 | UI                            | Action         |
| ----------------- | ----------------------- | ----------------------------- | -------------- |
| `loading`         | first fetch pending     | skeleton dashboard            | wait           |
| `ready`           | snapshot returned       | analytics board               | review         |
| `empty`           | no snapshot values      | target matrix plus empty copy | refresh        |
| `partial_data`    | some values unavailable | partial board plus notice     | route to owner |
| `stale`           | old generated time      | stale banner                  | refresh        |
| `refreshing`      | refetch active          | retained values plus progress | wait           |
| `not_authorized`  | forbidden               | permission state              | back           |
| `session_expired` | unauthorized            | sign-in state                 | sign in        |
| `api_error`       | request failure         | error panel                   | retry          |

## QA Scenarios

1. Any admin role can open `/admin/analytics`.
2. Non-admin user cannot see analytics values.
3. The page calls only `GET /v1/admin/overview`.
4. Delivery status counts render in current snapshot.
5. Payment status counts render in current snapshot.
6. Open issue-like delivery count routes to issue queue.
7. Unmatched webhook count routes to webhook events filtered to unmatched.
8. Manual-review webhook count routes to webhook events filtered to manual review.
9. KPI target matrix renders documented reliability targets.
10. KPI target matrix renders documented speed targets.
11. KPI target matrix renders documented trust targets.
12. Growth rows show endpoint-required state where values are unavailable.
13. No time-series chart appears without time-series data.
14. Empty overview arrays show empty state while target matrix remains.
15. Partial data state labels missing metric families.
16. Stale generated time shows stale warning.
17. Refresh keeps current values visible.
18. Refresh announces completion.
19. API error shows retry and owner-screen alternatives.
20. Session expiry clears metric values.
21. Role emphasis changes ordering but not critical alert visibility.
22. Chart text alternatives are present.
23. KPI matrix is keyboard reachable.
24. No sensitive identifiers appear in analytics payload.
25. Mobile layout converts matrix rows to readable cards.

## Acceptance Criteria

Functional:

- Route is `/admin/analytics`.
- Root test id is `screen-admin-analytics`.
- Uses `useAdminOverviewQuery` or equivalent `admin_overview` query.
- Does not call unsupported analytics endpoints.
- Shows implemented overview values.
- Shows documented KPI targets.
- Labels unsupported KPI values as endpoint-required or not measurable yet.
- Shows data source and owner for each KPI.
- Routes every risk signal to a real owner screen.

Accessibility:

- One page heading.
- KPI matrix is semantic.
- Chart alternatives exist.
- Status is not color-only.
- Refresh and stale messages use live regions.
- Keyboard can reach all KPI group controls and owner routes.

Privacy:

- No sensitive IDs in analytics events.
- No row-level data is fetched to approximate unavailable KPIs.
- Authorization failure clears visible metrics.

Quality:

- Handles empty values.
- Handles partial values.
- Handles stale snapshot.
- Handles all admin role emphasis modes.
- Avoids unsupported trend charts.

## Component Inventory

Required components:

- `AdminPageShell`
- `AdminBreadcrumb`
- `AdminAnalyticsHeader`
- `PilotHealthStrip`
- `AnalyticsCoverageNotice`
- `CurrentSnapshotSection`
- `DeliveryStatusMix`
- `PaymentStatusMix`
- `OperationalAlertCards`
- `KpiTargetMatrix`
- `KpiGroupSection`
- `MeasurementGapList`
- `OwnerRouteCard`
- `AdminEmptyState`
- `AdminErrorState`
- `AdminPermissionState`
- `AdminLiveRegion`

Optional components:

- `KpiGroupTabs`
- `KpiGroupAccordion`
- `SnapshotFreshnessBadge`
- `DataSourceBadge`
- `MetricConfidenceBadge`

Do not build:

- time-series chart without time-series data
- route ranking without route data
- station ranking without station KPI endpoint
- revenue chart without finance aggregate endpoint
- target-editing form
- export generation inside this route

## Implementation Notes For Claude Code

Build sequence:

1. Add route `/admin/analytics`.
2. Wire `admin_overview` query.
3. Render page header, freshness, and refresh.
4. Render data coverage notice.
5. Render pilot health strip from overview values.
6. Render current snapshot cards.
7. Render KPI target matrix from docs-backed constants.
8. Label unsupported current values honestly.
9. Add owner route cards.
10. Add empty, partial, stale, error, unauthorized, and expired states.
11. Add privacy-safe analytics events.
12. Add accessibility and responsive tests.

Implementation boundaries:

- Do not add backend endpoints.
- Do not compute exact KPI rates without approved denominators.
- Do not fetch all list endpoints to build analytics in the browser.
- Do not persist analytics values in local storage.
- Do not implement target editing.

## Test Plan

Unit tests:

- maps overview fields to snapshot cards
- derives delivery and payment totals
- maps KPI target constants
- returns endpoint-required state for unsupported KPIs
- builds owner route links
- buckets snapshot age
- sanitizes analytics payloads

Component tests:

- renders loading state
- renders ready state
- renders empty state
- renders partial data state
- renders stale banner
- renders API error state
- renders not-authorized state
- renders KPI target matrix
- renders chart alternatives
- renders role emphasis ordering

Integration tests:

- admin role loads analytics
- non-admin cannot view metrics
- refresh calls overview once
- unmatched webhook card routes correctly
- manual-review webhook card routes correctly
- issue pressure card routes correctly
- export-needed gap routes to export flow

Visual regression:

- desktop ready state
- desktop partial data state
- desktop KPI matrix
- mobile KPI accordion
- mobile empty state

Accessibility tests:

- heading order
- matrix semantics
- chart alternatives
- keyboard route cards
- live region refresh
- contrast for status badges

## Content Checklist

Before implementation is accepted:

- The page never says unsupported KPI current values are measured.
- Every KPI has target, owner, cadence, source, and current-value state.
- Current overview values show generated time.
- Data coverage notice is visible.
- No unsupported trend chart appears.
- No sensitive IDs are sent to analytics.
- Empty state still shows documented targets.
- Owner routes are real.

## Open Backend Gaps For Future Work

Not required for current analytics screen:

- dedicated admin analytics endpoint
- date range query
- time-series metric endpoint
- route KPI endpoint
- station KPI endpoint
- refund KPI endpoint
- proof capture KPI endpoint
- repeat sender KPI endpoint
- export job endpoint integration
- target governance endpoint
- chart-ready metric aggregates

These gaps must be visible on the screen as measurement gaps, not hidden as design omissions.

## Final Screen Contract

`AdminAnalytics` is complete when it gives admins a premium, accessible, source-labeled pilot KPI dashboard that uses implemented overview metrics, shows approved targets, routes every weak signal to an owner screen, and clearly marks every unsupported KPI or trend as requiring a future analytics endpoint.
