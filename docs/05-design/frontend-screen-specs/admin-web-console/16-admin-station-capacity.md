# Admin Station Capacity Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID              | `AdminStationCapacity`                                                                                                                                                                                                                           |
| Route                  | `/admin/stations/capacity`                                                                                                                                                                                                                       |
| Primary test ID        | `screen-admin-station-capacity`                                                                                                                                                                                                                  |
| Surface                | Admin web console                                                                                                                                                                                                                                |
| Backend coverage       | `admin_stations`, optional `admin_launch_readiness`, optional latest `admin_deliveries` context                                                                                                                                                  |
| Offline critical       | No                                                                                                                                                                                                                                               |
| Required read role     | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`                                                                                                                                                                                  |
| Required mutation role | None on this screen                                                                                                                                                                                                                              |
| Required states        | `loading`, `ready`, `empty`, `all_clear`, `pressure_detected`, `partial_launch_context`, `delivery_context_unavailable`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error`                                                 |
| Parent screens         | `AdminStations`, `AdminStationDetail`, `AdminOverview`, protected admin shell                                                                                                                                                                    |
| Related screens        | `AdminStations`, `AdminStationDetail`, `AdminStationStatusOverride`, `AdminStationValidation`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminDeliveryExplorer`, `AdminAuditEvents` |

## Purpose

`AdminStationCapacity` is the station pressure monitor for the admin console. It helps admins see which launch stations have queue pressure, issue pressure, service constraints, restricted intake, paused operations, and launch blockers.

The screen should answer:

- `Which station needs attention first?`
- `Which station has the most active queue pressure?`
- `Which station has issue pressure?`
- `Which station is paused, restricted, or service limited?`
- `Which station is blocked for launch readiness?`
- `Which station should I inspect next?`
- `Which owner screen handles the next action?`

The screen is a monitoring and routing surface. It is not a capacity planning engine and not a dispatch optimizer.

## Backend Reality

There is no dedicated capacity endpoint today.

Primary data must come from:

```http
GET /v1/admin/stations
```

Operation:

```text
admin_stations
```

Optional launch context can come from:

```http
GET /v1/admin/launch-readiness
```

Operation:

```text
admin_launch_readiness
```

Optional latest delivery context can come from:

```http
GET /v1/admin/deliveries
```

Operation:

```text
admin_deliveries
```

Important limits:

- `admin_stations` returns `activeQueueCount` and `issueCount`.
- `admin_launch_readiness` returns station unresolved P1 counts and blocker context.
- `admin_deliveries` returns latest admin delivery rows, not a complete station queue.
- There is no station capacity maximum field.
- There is no station throughput endpoint.
- There is no station backlog age endpoint.
- There is no station staffing endpoint.
- There is no route optimizer endpoint.
- There is no per-station delivery ledger endpoint.

Therefore:

- The page must not claim true capacity utilization percentage.
- The page must not claim overload based on missing capacity limits.
- The page must not auto-dispatch or reassign work.
- The page must label pressure bands as display guidance derived from returned counts.
- The page must route admins to owner screens for action.

## Primary Users

Primary:

- `ops_admin` monitoring station queue and service pressure.
- `super_admin` reviewing launch-station operational readiness across the network.

Secondary:

- `support_admin` checking issue pressure by station.
- `finance_admin` checking station pressure before refund or reconciliation review.
- QA validating count display and route actions.
- Engineering leads validating backend boundary honesty.
- Claude Code implementing the admin console later.

## User Goal

Admins use this screen to:

- Compare all launch stations quickly.
- Sort stations by active queue count.
- Sort stations by issue count.
- See paused, restricted, and service-limited stations.
- See validation and launch-readiness pressure.
- Open station detail.
- Open status override when authorized.
- Open blocked delivery queue.
- Open issue queue.
- Open launch readiness detail.

The page should support a fast morning operations review and a live incident scan without pretending to have forecasting data.

## Entry Points

The screen can open from:

- `AdminStations` capacity action.
- `AdminStationDetail` capacity action.
- `AdminOverview` station pressure card.
- `AdminBlockedDeliveryQueue` station warning context.
- `AdminLaunchReadiness` station blocker context.
- Protected admin navigation.
- Direct route `/admin/stations/capacity`.

The route can accept optional query context:

```text
?stationId=ST-ACC-01
```

Rules:

- Query context only highlights a station row.
- Query context must not filter out other stations by default.
- Invalid query station IDs are ignored with a non-blocking notice.

## Scope

In scope:

- All configured station pressure summary.
- Active queue count.
- Issue count.
- Optional unresolved P1 count.
- Operating status.
- Intake status.
- Service availability.
- Validation status.
- Go-live eligibility.
- Local display pressure bands.
- Sorting.
- Filtering.
- Highlight from query station ID.
- Optional latest delivery context by station.
- Route actions to owner screens.
- Partial context and stale states.
- Accessibility, analytics, and responsive behavior.

Out of scope:

- Capacity limit editing.
- Throughput forecasting.
- Staffing schedules.
- Driver assignment.
- Courier assignment.
- Delivery reassignment.
- Issue resolution.
- Station status mutation.
- Station validation mutation.
- Public availability copy.
- Maps.
- Heat maps that imply precise geography.
- SLA prediction not backed by backend data.

## Design Thesis

The screen should feel like a network pressure board: compact, decisive, and built for operations scanning. It should help an admin see pressure gradients without creating false precision.

Visual direction:

- Use a wide pressure table with a strong summary band.
- Use horizontal bars for returned counts, not percentages.
- Use direct labels for paused, restricted, service-limited, and validation-blocked states.
- Use small multiples for station count comparison.
- Use color sparingly: red for stopped or high pressure, amber for watch states, green for stable state, gray for unavailable context.
- Use station IDs in monospaced text.
- Use tabular numerals for all counts.

Restraint rule:

- No maps, no animated gauges, no capacity percentages, no prediction curves, and no local dispatch recommendations.

## Research Inputs

External research used for this screen:

- [Google SRE practical alerting](https://sre.google/sre-book/practical-alerting/): supports aggregated operational signals with drill-down rather than noisy per-object alerts.
- [Google SRE monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/): supports actionable monitoring and separation between dashboards and response paths.
- [IBM data visualization basics](https://www.ibm.com/design/language/data-visualization/design/basics/): supports concise chart titles, readable axes, restrained color, and overview-first interaction.
- [Atlassian incident severity levels](https://www.atlassian.com/incident-management/kpis/severity-levels): supports clear severity language and prioritization.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense enterprise rows, sorting, filtering, and row actions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh and filter result announcements.

How the research affects the screen:

- SRE guidance shapes the page around aggregated station signals with drill-down.
- Data-visualization guidance prevents decorative charts and false precision.
- Incident severity guidance shapes pressure band language.
- Data-table guidance shapes row density, sorting, and keyboard row actions.
- WCAG guidance shapes refresh, stale, and filter announcements.

## Data Contract

### Station Pressure Source

Request:

```http
GET /v1/admin/stations
```

Fields used:

- `generatedAt`
- `stations[].stationId`
- `stations[].name`
- `stations[].city`
- `stations[].operatingStatus`
- `stations[].intakeStatus`
- `stations[].serviceAvailability.standard`
- `stations[].serviceAvailability.express`
- `stations[].serviceAvailability.doorstep`
- `stations[].activeQueueCount`
- `stations[].issueCount`
- `stations[].validation.status`
- `stations[].validation.goLiveEligible`
- `stations[].validation.blockers`
- `stations[].validation.updatedAt`
- `stations[].updatedAt`

Rules:

- `activeQueueCount` is the primary queue pressure count.
- `issueCount` is the primary issue pressure count.
- `validation.goLiveEligible` is the readiness authority.
- Do not calculate utilization percentages.
- Do not assume capacity maximums.

### Optional Launch Context

Request:

```http
GET /v1/admin/launch-readiness
```

Fields used:

- `generatedAt`
- `status`
- `goLiveEligible`
- `blockers[].code`
- `blockers[].severity`
- `blockers[].stationId`
- `blockers[].message`
- `blockers[].count`
- `stations[].stationId`
- `stations[].unresolvedP1IssueCount`
- `stations[].validationBlockerCount`
- `systemChecks.stationValidation.readyStations`
- `systemChecks.stationValidation.totalStations`

Rules:

- Use station-specific launch blockers as context.
- Do not block pressure board rendering when unavailable.
- Do not replace station count fields with launch summary fields.
- Do not send blocker messages to analytics.

### Optional Latest Delivery Context

Request:

```http
GET /v1/admin/deliveries
```

Fields used:

- `generatedAt`
- `deliveries[].deliveryId`
- `deliveries[].status`
- `deliveries[].paymentStatus`
- `deliveries[].originStationId`
- `deliveries[].destinationStationId`
- `deliveries[].latestOccurredAt`

Rules:

- Use only for optional latest-row context.
- Group loaded rows by origin and destination station.
- Label scope as latest loaded admin delivery rows.
- Do not claim complete queue coverage.
- Do not display receiver details on this screen.

## Pressure Band Model

The screen can derive display bands from returned counts.

Bands:
| Band | Count guidance | Meaning |
| --- | --- | --- |
| `clear` | Queue `0` and issues `0` | No returned pressure |
| `watch` | Queue `1-5` or issues `1-5` | Low pressure; monitor |
| `elevated` | Queue `6-20` or issues `6-20` | Needs operations review |
| `high` | Queue `21+` or issues `21+` | Prioritize investigation |
| `blocked` | Paused, restricted, service unavailable, validation blocked, or station P1 blocker | Operational or launch blocker present |

Rules:

- Bands are display guidance only.
- Bands must be named `display pressure` in implementation docs.
- Bands must not be used to mutate backend state.
- When operational blockers exist, show blocker label even if queue count is low.
- The highest severity visible state wins for sorting by default.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. Capacity header.
3. Network pressure summary.
4. Filters and sort.
5. Station pressure table.
6. Optional selected-station context drawer.
7. Scope and data freshness notice.

Mobile order:

1. Header.
2. Network pressure summary.
3. Filters.
4. Station pressure cards.
5. Selected-station actions.
6. Scope notice.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main content max width `1440px`.
- Summary band across top.
- Table fills page width.
- Optional side drawer for selected station context.

Table columns:

- Station.
- Display pressure.
- Active queue.
- Issues.
- P1 context.
- Operating.
- Intake.
- Services.
- Validation.
- Updated.
- Actions.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Summary band wraps to two rows.
- Table uses fewer columns.
- Secondary detail appears in row expansion.

### Mobile

Viewport:

- `<768px`

Layout:

- Station cards instead of table.
- Primary metrics at top of each card.
- Actions collapse into compact action group.
- Filters become bottom sheet or inline collapsible section.

Mobile rules:

- Do not hide pressure state.
- Do not require horizontal scroll.
- Preserve row action labels.

## Components

### `AdminStationCapacityPage`

Responsibilities:

- Fetch `admin_stations`.
- Fetch optional launch readiness.
- Optionally fetch latest deliveries.
- Build station pressure rows.
- Apply sorting and filtering.
- Highlight query station.
- Render responsive table or cards.
- Route actions to owner screens.

Test id:

```text
screen-admin-station-capacity
```

### `CapacityHeader`

Content:

- Page title.
- Generated time.
- Refresh action.
- Scope statement.

Copy:

```text
Station capacity and queue pressure
```

Scope statement:

```text
This board uses returned station queue and issue counts. It does not show true capacity percentage or forecasted backlog.
```

### `NetworkPressureSummary`

Fields:

- Total active queues.
- Total issues.
- Stations with high display pressure.
- Stations paused or restricted.
- Stations service limited.
- Stations go-live eligible.
- Launch context state.

Rules:

- Totals are sums of returned station counts.
- Do not show capacity percentages.
- Link summary metrics to filtered table states.

### `CapacityFilters`

Controls:

- Search by station name, city, or station ID.
- Display pressure filter.
- Operating status filter.
- Intake status filter.
- Service availability filter.
- Validation status filter.
- Launch blocker filter when launch context exists.

Rules:

- Filtering is client-side.
- Announce result counts.
- Do not add unsupported backend query params.
- Reset returns to all stations.

### `StationPressureTable`

Purpose:

- Show every station with pressure signals.

Rules:

- Use real table headers.
- Default sort by display pressure severity, active queue count, then issue count.
- Station row action buttons must be explicit.
- Highlight query station once on initial load.

Row actions:

- `Open station detail`
- `Open status override`
- `Open validation`
- `Open issue queue`
- `Open blocked deliveries`

Role rules:

- `Open status override` visible for `ops_admin` and `super_admin`.
- `Open validation` visible for `ops_admin` and `super_admin`.
- Read-only roles see view routes only.

### `StationPressureBar`

Purpose:

- Compare returned counts without false percentages.

Inputs:

- Count.
- Maximum returned count in current list.
- Label.

Rules:

- Bar length is relative to visible returned counts.
- Text count is always visible.
- Do not label as utilization.
- Do not hide zero counts.

### `ServiceAvailabilityCell`

Fields:

- `standard`
- `express`
- `doorstep`

Rules:

- Show all three service states.
- Use labels and icons, not color alone.
- If all disabled, mark high impact.

### `SelectedStationContextDrawer`

Purpose:

- Give focused context without navigating.

Content:

- Station identity.
- Counts.
- Launch blockers.
- Latest loaded delivery direction counts if enabled.
- Owner routes.

Rules:

- Drawer is read-only.
- Drawer must not show receiver names.
- Drawer must not mutate station status or validation.

### `CapacityScopeNotice`

Purpose:

- Keep data honesty visible.

Copy:

```text
Capacity limits, staffing, backlog age, and route optimization are not available in the current backend. Use this board as a pressure monitor and open owner screens for action.
```

Rules:

- Show near bottom on desktop.
- Show near top on mobile after summary.

## Routing Rules

Routes:

- Station detail: `/admin/stations/:stationId`
- Status override: `/admin/stations/:stationId/status`
- Validation: `/admin/stations/:stationId/validation`
- Issue queue: `/admin/issues`
- Blocked deliveries: `/admin/deliveries/blocked`
- Launch readiness: `/admin/launch-readiness`
- Launch readiness detail: `/admin/launch-readiness/:blockerCode`

Rules:

- Do not pass unsupported backend filters as API params.
- Query params may prefill UI filters only when target screen supports them.
- If target screen lacks station filter, pass station context through route state where framework supports it, or open the parent screen.

## Data Loading Strategy

Initial load:

1. Fetch `admin_stations`.
2. Render primary board.
3. Fetch optional launch readiness in parallel where supported.
4. Fetch optional latest deliveries only if product enables that section.

Refresh:

- Refresh primary station list.
- Refresh optional context.
- Keep prior rows visible during refresh.
- Announce refresh completion.

Partial failure:

- If `admin_stations` fails, render page-level error.
- If launch readiness fails, render board with partial launch context notice.
- If latest delivery context fails, render board and section-level notice only.

## Empty And State Handling

Empty:

- `admin_stations` returns zero stations.
- Show empty state and scope explanation.

All clear:

- All stations have queue `0`, issue `0`, active/open state, services available, and no validation blockers.
- Show calm all-clear summary.
- Still show rows.

Pressure detected:

- One or more stations has queue, issue, operational, service, or validation pressure.
- Show prioritized table.

Stale:

- Data older than admin stale threshold.
- Show stale notice.
- Keep rows visible.

## Copy System

Tone:

- Operational.
- Precise.
- Honest about limits.

Preferred labels:

- `Display pressure`
- `Active queue`
- `Issue count`
- `Launch blocker`
- `Service limited`
- `Open station detail`
- `Review status override`
- `Review validation`

Avoid:

- `Capacity utilization`
- `Forecast`
- `Overloaded` unless backend later supplies capacity limits.
- `Reassign now`
- `Safe to launch`

## Analytics

Events:

- `admin_station_capacity_viewed`
- `admin_station_capacity_refreshed`
- `admin_station_capacity_filtered`
- `admin_station_capacity_sorted`
- `admin_station_capacity_station_opened`
- `admin_station_capacity_status_opened`
- `admin_station_capacity_validation_opened`
- `admin_station_capacity_issue_queue_opened`
- `admin_station_capacity_blocked_deliveries_opened`

Allowed properties:

- `station_count`
- `total_active_queue_bucket`
- `total_issue_bucket`
- `high_pressure_station_count`
- `paused_station_count`
- `restricted_station_count`
- `service_limited_station_count`
- `validation_blocked_station_count`
- `launch_context_available`
- `delivery_context_available`
- `role`
- `filter_type`
- `sort_key`

Forbidden properties:

- Station notes.
- Validation notes.
- Blocker message text.
- Receiver names.
- Delivery IDs.
- Auth tokens.
- Raw error payloads.

Count buckets:

- `0`
- `1-5`
- `6-20`
- `21+`

## Accessibility

Landmarks:

- One `main` region.
- One `h1`.
- Summary metrics are grouped in a labeled section.
- Table has caption and headers.

Status messages:

- Loading, refreshing, filtering, and stale states use polite live regions.
- Page-level API error uses assertive live region.

Data visualization:

- Bars include visible numeric labels.
- Color is never the only indicator.
- Pressure bands include text.
- Relative bars include accessible descriptions.

Keyboard:

- Filters reachable before table.
- Table row actions reachable in DOM order.
- Drawer can be opened and closed by keyboard.
- Focus returns to trigger after drawer close.

Mobile:

- Cards repeat labels.
- Action groups have accessible names.
- Touch targets at least `44px`.

## Privacy And Security

This screen must not expose:

- Receiver phone numbers.
- Receiver addresses.
- Sender profile data.
- Raw payment data.
- Raw proof assets.
- Auth tokens.
- Internal stack traces.

Rules:

- Do not send station blocker text to analytics.
- Do not send delivery IDs to analytics.
- Do not log optional delivery context payloads.
- Do not expose mutation controls on this read-only screen.

## Performance

Targets:

- Initial board visible within `1500ms` on normal admin network.
- Filtering and sorting within `100ms` for expected station count.
- Optional context must not block primary board.

Rules:

- Do not poll.
- Do not virtualize v1 station count.
- Do not fetch per-station details.
- Avoid charts that require heavy libraries.
- Prefer CSS bars and table rows.

## Responsive Behavior

Desktop:

- Summary band and table.
- Optional station drawer.

Tablet:

- Summary wraps.
- Table drops lower-priority columns into expansion.

Mobile:

- Summary cards.
- Filter section.
- Station cards.
- Action group per card.

Mobile rules:

- No horizontal scroll.
- Display pressure remains visible.
- Scope notice remains visible.

## Testing Requirements

Unit tests:

- Pressure row derivation.
- Display pressure band derivation.
- Total count derivation.
- Service-limited derivation.
- Launch blocker merge.
- Optional latest delivery grouping.
- Filter logic.
- Sort logic.
- Query station highlight.
- Role action visibility.
- Analytics sanitizer.

Integration tests:

- Loads station rows from `admin_stations`.
- Shows active queue counts.
- Shows issue counts.
- Shows operating and intake states.
- Shows service availability.
- Shows validation status.
- Shows launch context when available.
- Handles launch context failure.
- Handles delivery context failure.
- Filters by pressure.
- Sorts by queue count.
- Routes to station detail.
- Hides mutation owner routes for read-only roles.
- Shows owner routes for `ops_admin` and `super_admin`.

Accessibility tests:

- Page has one `h1`.
- Table caption exists.
- Table headers exist.
- Bars have text labels.
- Filter result count is announced.
- Drawer focus returns to trigger.
- Mobile cards repeat labels.

Visual regression states:

- All clear.
- High queue pressure.
- High issue pressure.
- Paused station.
- Restricted intake.
- Service limited.
- Validation blocked.
- Partial launch context.
- Mobile pressure cards.
- Empty state.

## Implementation Checklist

- Create route `/admin/stations/capacity`.
- Use protected admin shell.
- Fetch `admin_stations`.
- Optionally fetch `admin_launch_readiness`.
- Optionally fetch latest `admin_deliveries`.
- Build pure station pressure row helper.
- Build pure display pressure band helper.
- Build summary totals.
- Build filters and sorting.
- Build desktop table.
- Build mobile cards.
- Build optional selected-station drawer.
- Add route actions.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Capacity utilization percentages.
- Forecast charts.
- Staffing model.
- Driver assignment.
- Courier assignment.
- Delivery reassignment.
- Issue resolution.
- Station status mutation.
- Station validation mutation.
- Map heat layer.
- Public station availability copy.
- Unsupported backend query params.
- Background polling.

## Acceptance Criteria

The screen is complete when:

- `/admin/stations/capacity` renders with test id `screen-admin-station-capacity`.
- It uses `admin_stations` as the source of station counts and states.
- It shows queue pressure, issue pressure, operating status, intake status, service availability, validation status, and go-live eligibility.
- It labels pressure bands as display guidance.
- It handles optional launch readiness and delivery context as enrichment only.
- It supports filtering, sorting, and station highlighting.
- It routes to owner screens without mutating station data.
- It hides mutation-owner routes from read-only roles.
- It does not claim true capacity utilization or forecast.
- It protects sensitive data and blocker text from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminStationCapacity` as a read-only station pressure board for `/admin/stations/capacity`. Use `admin_stations` for queue counts, issue counts, status, service availability, and validation state; optionally enrich with launch readiness and latest delivery context; present display pressure bands without claiming true capacity utilization; route admins to station detail, status, validation, issue, blocked-delivery, and launch-readiness owner screens.
