# Station Reports Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationReports` |
| App | `apps/mobile` |
| Route | `/(ops)/station/reports` |
| Primary test ID | `screen-station-reports` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Station Insight` |
| Backend dependency | station-scoped aggregate endpoint when exposed, `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, `list_issues`, `issueListQuerySchema`, `issueListResponseSchema`, cached station queue summary |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/intake`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/station/blocked`, `/(ops)/station/handoffs`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `ready_live`, `ready_computed`, `ready_partial`, `empty`, `not_supported_yet`, `stale_data`, `refreshing`, `date_range_changed`, `metric_explainer_open`, `chart_table_mode`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen gives station leads and operators a station-scoped performance view that helps them understand whether their station is moving packages safely and on time.

The screen answers one operational question: `How is this station performing today, and what needs attention before the shift ends?`

The station operator should be able to:
- See station-scoped package volume for the selected period.
- See queue pressure across intake, outbound, inbound, final-mile, blocked, and hold states.
- See issue volume and severity mix for packages touching the station.
- See scan and handoff quality signals when backend evidence exists.
- See whether metrics are backend aggregate, locally computed, partial, or stale.
- Switch between chart and table representations.
- Open the queue that explains a metric.
- Open blocked queue when exception metrics are high.
- Open handoff log when evidence metrics need review.
- Export nothing from station mobile unless a future authorized backend route exists.
- Avoid confusing station reports with admin network analytics.

This screen is not:
- A station mutation screen.
- A live queue board.
- A finance report.
- A sender growth dashboard.
- A staff performance ranking surface.
- A launch-readiness admin surface.
- A station validation editor.
- A payment reconciliation surface.
- A raw analytics explorer.
- A cross-station comparison view for station operators.
- A place to expose receiver addresses, phone numbers, raw payment references, raw scan codes, raw proof references, or raw actor IDs.

## Audience
Primary audience:
- Station leads reviewing shift health.
- Station operators checking whether their station is falling behind.
- Operations staff using the station app during pilot reviews.

Secondary audience:
- Claude Code implementing the reports route.
- QA validating station-scoped metric calculations.
- Backend engineers validating aggregate endpoint gaps.
- Operations leaders defining station review rituals.
- Security reviewers validating role and data boundaries.
- Accessibility reviewers validating chart and table alternatives.

## User State
The user is not trying to perform a package handoff on this screen. They are reviewing performance, deciding where to focus the next few minutes, or preparing a shift handover.

The user may be:
- Checking morning intake pressure.
- Reviewing outbound delay before the `15:00` cutoff.
- Checking destination receipt lag.
- Watching final-mile backlog before evening close.
- Looking at exception rate after a scan problem.
- Preparing to tell a station lead what is late.
- Reviewing whether local offline actions may make the numbers incomplete.
- Opening a report after a station overview warning.

The screen must:
- Scope all metrics to the authenticated `stationId`.
- Show metric source and freshness.
- Prefer operational actionability over decorative analytics.
- Link every metric to the queue or evidence surface that can explain it.
- Avoid staff ranking, punitive language, or individual-worker scoring.
- Avoid admin-only network data.
- Avoid claims that require backend aggregates when only local computed data exists.

## Backend Contract
Current station-safe reads:
- `list_deliveries`
- `list_issues`

Current admin-only reporting reads:
- `admin_stations`
- `admin_launch_readiness`

Important role boundary:
- `admin_stations` and `admin_launch_readiness` have admin auth scope.
- A station operator route must not call admin-only endpoints from a station session.
- Station reports must use station-scoped delivery and issue reads until a station aggregate endpoint exists.

Existing delivery list fields available for computed metrics:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Existing issue list fields available for computed metrics:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `createdAt`
- `updatedAt`

Existing admin station fields that should inform the future station aggregate contract:
- `activeQueueCount`
- `issueCount`
- station validation status
- station operating status
- intake status
- service availability
- `updatedAt`

Current backend gap:
- No station-operator reporting endpoint exists.
- No endpoint exists for `GET /v1/station/reports`.
- No station-safe trend endpoint exists.
- No station-safe dispatch turnaround metric exists.
- No station-safe receipt confirmation lag metric exists.
- No station-safe failed scan rate metric exists.
- No station-safe handoff mismatch rate metric exists.
- No station-safe issue rate per 100 deliveries metric exists.
- No station-safe export endpoint exists.

Buildable current mode:
- Compute queue pressure from station-scoped `list_deliveries` calls.
- Compute issue counts from accessible `list_issues` calls joined to station-visible delivery IDs.
- Use cached station overview bucket counts when present.
- Show metric confidence as `computed from loaded rows`.
- Do not show trend charts unless the local cache has comparable previous periods.
- Do not show failed scan rate unless scan recovery events are stored in the local analytics layer.
- Do not show handoff mismatch rate unless handoff evidence data exists locally or backend exposes it.

Production-ready recommendation:
- Add `GET /v1/station/reports?stationId=&period=&from=&to=`.
- Auth scope: station operator can read only their own station; admins can read station reports through admin routes.
- Return current period and comparison period.
- Return metric definitions with numerator, denominator, cadence, owner, and freshness.
- Return table rows behind every chart.
- Return source completeness flags.
- Return queue deep links for every actionable metric.
- Keep exports admin-governed unless station leads receive explicit export authority.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product claims beyond current backend:
- U.S. Web Design System data-visualization guidance recommends familiar chart types and limiting each visual to one central idea.
- GOV.UK data guidance emphasizes clear purpose, user needs, accuracy, consistency, and support information for charts.
- UK Government Analysis Function dashboard guidance emphasizes source-data access, privacy review, and accessibility testing for dashboards.
- WCAG 2.2 includes requirements relevant to charts and report controls, including non-text contrast, target size, focus appearance, section headings, and status messages.
- Android adaptive layout guidance supports responsive reporting layouts that work across different display sizes and window classes.

Reference links:
- [USWDS data visualizations](https://designsystem.digital.gov/components/data-visualizations/)
- [GOV.UK data guidelines](https://brand.design-system.service.gov.uk/data/)
- [Government Analysis Function dashboard accessibility](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-testing-dashboards-for-design-and-accessibility/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Android adaptive layouts](https://developer.android.google.cn/develop/ui/compose/layouts/adaptive?hl=en)

## Screen Thesis
The screen should feel like a shift report card for a serious logistics station: compact, calm, evidence-linked, and honest about data completeness.

The operator should understand in three seconds:
- Which station and period the report covers.
- Whether the metrics are live aggregate, locally computed, partial, or stale.
- Which metric needs attention.
- Which queue explains the metric.
- Which metrics are not yet available because backend evidence is missing.

Visual thesis:
- Use a quiet performance ledger with sharp numeric hierarchy, minimal charts, and direct queue links.
- Use charts only where they improve comprehension; always provide a matching table view.
- Treat data source confidence as part of the UI, not a footnote.

Restraint rule:
- Do not build a dense executive dashboard on a station phone. Every metric must either explain station work or route to a station action.

## Information Architecture
Top-level layout:
1. Header.
2. Period selector.
3. Freshness and source banner.
4. Shift health summary.
5. Queue pressure section.
6. Speed and lag section.
7. Exception and issue section.
8. Scan and handoff quality section.
9. Data completeness section.
10. Chart/table switcher.
11. Empty, partial, stale, and unsupported states.

Header:
- Title: `Station reports`
- Subtitle: `{stationCode} performance`
- Leading action: station overview.
- Right action: refresh.
- Overflow actions: open blocked queue, open handoff log, open support.

Period selector:
- `Today`
- `Yesterday`
- `Last 7 days`
- `Pilot period`
- Future custom period only when backend aggregate supports `from` and `to`.

Freshness banner:
- `Live aggregate`
- `Computed from loaded rows`
- `Partial`
- `Stale`
- `Not available yet`

Shift health summary:
- `Packages handled`
- `Active queue`
- `Blocked`
- `Open issues`
- `Receipt lag`
- `Scan quality`

Queue pressure section:
- Intake.
- Outbound.
- Driver assigned.
- Inbound.
- Receiver pickup.
- Final-mile.
- Blocked.

Speed and lag section:
- Dispatch turnaround.
- Destination receipt confirmation lag.
- Final-mile assignment lag.
- Pickup aging.

Exception and issue section:
- Open P1 issues.
- Open P2 issues.
- Payment blockers.
- Custody blockers.
- Scan blockers.
- On-hold packages.

Scan and handoff quality section:
- Scan-confirmation adoption.
- Failed scan rate.
- Handoff mismatch rate.
- Missing evidence count.

Data completeness section:
- Delivery rows loaded.
- Issue rows loaded.
- Local outbox blockers included.
- Handoff evidence included.
- Metrics unavailable because backend does not expose a safe source.

## Metric Model
Each metric must have:
- `metricId`
- `label`
- `value`
- `unit`
- `period`
- `source`
- `freshness`
- `confidence`
- `definition`
- `owner`
- `target`
- `trend`
- `route`
- `isActionable`
- `isAvailable`
- `unavailableReason`

`source` values:
- `backend_aggregate`
- `delivery_list_computed`
- `issue_list_computed`
- `local_cache_computed`
- `local_outbox_computed`
- `not_available`

`freshness` values:
- `live`
- `recent`
- `stale`
- `partial`
- `offline_cache`
- `unavailable`

`confidence` values:
- `high`
- `medium`
- `low`
- `unavailable`

Trend values:
- `up_good`
- `up_bad`
- `down_good`
- `down_bad`
- `flat`
- `not_enough_data`

## Metrics To Show
### Always Show When Current Data Exists
`packages_handled`:
- Definition: station-visible deliveries with latest activity in selected period.
- Current source: loaded station delivery rows.
- Route: station overview.
- Confidence: medium until backend aggregate exists.

`active_queue_count`:
- Definition: active station packages across station queues.
- Current source: station overview cache or delivery list computation.
- Route: station overview.
- Confidence: medium.

`blocked_count`:
- Definition: station-visible packages with `issue_reported`, `on_hold`, payment blocker, custody blocker, scan blocker, or local sync blocker.
- Current source: blocked queue composition.
- Route: blocked queue.
- Confidence: medium.

`open_issue_count`:
- Definition: open, in-review, or escalated issues for station-visible deliveries.
- Current source: `list_issues` joined to loaded delivery IDs.
- Route: station support or blocked queue.
- Confidence: medium.

### Show As Backend Required Until Aggregates Exist
`dispatch_turnaround_time`:
- Definition: median time from origin station intake to dispatch readiness or origin departure.
- Required source: delivery events or station report aggregate.
- Route: outbound queue.
- Current state: not available unless local event cache has enough evidence.

`receipt_confirmation_lag`:
- Definition: median time from package arrival expectation or arrival evidence to destination receipt confirmation.
- Required source: delivery events and handoff events.
- Route: inbound queue.
- Current state: not available unless timeline cache has enough evidence.

`failed_scan_rate`:
- Definition: failed station scan attempts divided by all station scan attempts.
- Required source: scan telemetry or local scan recovery analytics.
- Route: scan recovery or support.
- Current state: not available unless local scan telemetry exists.

`handoff_mismatch_rate`:
- Definition: unresolved custody conflicts divided by deliveries with station handoff evidence.
- Required source: custody events, issue category, and conflict markers.
- Route: handoff log or custody chain.
- Current state: not available unless backend aggregate exists.

`issue_rate_per_100_deliveries`:
- Definition: station-visible active issues per 100 station-handled deliveries.
- Required source: station aggregate with aligned denominator.
- Route: station support.
- Current state: not available until denominator is reliable.

### Pilot Target Metrics
Use internal targets from product metrics only as internal operational guidance:
- Station scan-confirmation adoption target: `>= 95%`.
- On-time dispatch from origin target: `>= 90%`.
- On-time destination receipt confirmation target: `>= 95%`.
- Lost package rate target: `<= 0.5%`.
- Handoff mismatch rate target: `<= 1%`.

Target display rules:
- Label targets as `Pilot target`.
- Do not present targets as public commitments.
- Explain unavailable target comparison when backend cannot calculate the metric.
- Use target color only with text and icon status.

## Data Composition Rules
Delivery status buckets:
- Intake: `created`, `received_at_origin`.
- Outbound: `awaiting_driver_assignment`, `assigned_to_driver`, `dispatched_from_origin`.
- Inbound: `in_transit`, `received_at_destination`.
- Receiver pickup: `awaiting_receiver_pickup`.
- Final-mile: `awaiting_final_mile_assignment`, `assigned_for_final_mile`, `out_for_delivery`.
- Complete: `delivered`, `closed`.
- Blocked: `issue_reported`, `on_hold`, `delivery_failed`.
- Excluded by default: `draft`, `cancelled` unless a future report explicitly includes them.

Station relation rules:
- Count origin work when `originStationId === stationId`.
- Count destination work when `destinationStationId === stationId`.
- Count latest station work when `latestTouchpointStationId === stationId`.
- If a delivery touches both origin and destination station because the station pair is the same, count it once in total volume.
- For queue pressure, use current status and station relation to prevent double counting.

Issue join rules:
- Fetch active issues first.
- Join issue rows to delivery IDs already visible to the station.
- If an issue is accessible but delivery details are not loaded, show partial issue count only in data completeness, not in operational totals.
- Do not expose issue descriptions in metric cards.

Local cache rules:
- Use cached station overview counts only when their `stationId` matches.
- Mark cached values stale after `10 minutes`.
- Mark historical trend unavailable unless the local store has period boundaries and matching calculation version.

## Primary Actions
Default primary action by state:
- `loading`: wait.
- `ready_live`: open highest-attention metric route.
- `ready_computed`: open highest-attention metric route with source banner visible.
- `ready_partial`: open data completeness section.
- `empty`: return to station overview.
- `not_supported_yet`: return to station overview.
- `stale_data`: refresh.
- `refreshing`: keep current report visible.
- `date_range_changed`: refresh report.
- `metric_explainer_open`: close explainer.
- `chart_table_mode`: switch representation.
- `not_authorized`: return to role home.
- `session_expired`: sign in again.
- `api_error`: retry.
- `rate_limited`: use current data.

Metric action routing:
- Queue pressure metrics route to station overview or specific queue.
- Blocked metrics route to blocked queue.
- Issue metrics route to station support or blocked queue.
- Handoff quality metrics route to handoff log.
- Local sync metrics route to offline outbox.
- Unavailable metrics open metric explainer, not a dead link.

Forbidden actions:
- Do not mutate station status.
- Do not update station validation.
- Do not call admin station routes from station operator session.
- Do not export reports without authorized backend route.
- Do not rank individual staff.
- Do not show cross-station comparison.
- Do not show finance totals.
- Do not show raw delivery records in the report screen.

## Chart And Table Rules
Use charts sparingly.

Allowed chart types:
- KPI number card.
- Small horizontal bar chart for queue pressure.
- Simple line chart for trend only when comparable period data exists.
- Stacked bar only when categories are few and labels remain readable.

Avoid:
- Pie charts for more than two categories.
- Dense multi-series charts on phone.
- Charts that require hover to understand values.
- Dual-axis charts.
- Animated chart loops.
- Decorative map views.

Every chart must have:
- A visible title.
- Period label.
- Source label.
- Table alternative.
- Short insight sentence.
- Empty and unavailable state.
- Accessible value summary.

Table mode:
- Must show metric, value, period, source, confidence, target, and route.
- Must be reachable from the same screen.
- Must preserve filters and period selection.
- Must support large text without horizontal clipping.

## Empty And Unsupported States
`empty`:
- Title: `No report data for this period`
- Body: `No station-visible package activity was found for the selected period.`
- Primary action: `Back to station overview`
- Secondary action: `Change period`

`not_supported_yet`:
- Title: `Full station reports need backend aggregates`
- Body: `Queue and issue counts can be computed now. Speed, scan, and handoff quality metrics need a station report endpoint.`
- Primary action: `View computed counts`
- Secondary action: `Back to overview`

`ready_partial`:
- Title: `Some metrics are incomplete`
- Body: `Loaded counts are shown. Metrics that need event or scan evidence are marked unavailable.`
- Primary action: `Review data sources`

`stale_data`:
- Title: `Report may be stale`
- Body: `Last refresh was more than 10 minutes ago. Refresh before using this for shift handover.`
- Primary action: `Refresh`

## Error And Recovery States
`not_authorized`:
- Title: `Station reports require station access`
- Body: `Your account must be assigned to this station to view station reports.`
- Primary action: `Back to role home`
- Secondary action: `Contact support`

`session_expired`:
- Title: `Sign in again`
- Body: `Your session expired before reports could refresh.`
- Primary action: `Sign in`

`api_error`:
- Title: `Reports could not refresh`
- Body: `Current cached counts are shown if available. Try again when the connection is stable.`
- Primary action: `Retry`
- Secondary action: `Back to overview`

`rate_limited`:
- Title: `Refresh paused`
- Body: `Too many refresh attempts were made. Use the current report briefly, then try again.`
- Primary action: `Use current report`

## Accessibility Requirements
Structure:
- Use one `h1` equivalent for `Station reports`.
- Use section headings for summary, queue pressure, speed, exceptions, quality, and data completeness.
- Every metric card must expose name, value, unit, period, source, confidence, and route.
- Period controls must expose selected state.
- Chart/table switch must expose current mode.

Charts:
- Every chart must have a table alternative.
- Do not depend on color alone.
- Bars and trend indicators must meet non-text contrast requirements.
- Avoid hover-only labels.
- Provide short text summaries for each chart.

Status messages:
- Announce refresh success, partial data, stale data, unavailable metrics, and period changes.
- Do not force focus to charts after refresh.

Touch targets:
- Metric card actions minimum target: `44 x 44 dp`.
- Period chips minimum target: `44 x 44 dp`.
- Table rows with actions minimum target: `44 x 44 dp`.

Large text:
- KPI cards must wrap labels without clipping values.
- Table mode must remain usable at large text sizes.
- Chart labels can move below bars when space is tight.

## Visual Direction
Use a calm operational report style:
- Background: warm paper-white with subtle slate panels.
- Primary numeric color: deep ink.
- Positive state: restrained green.
- Warning state: amber.
- Critical state: red-brown.
- Unavailable state: muted slate with explicit text.
- Avoid bright rainbow palettes.

Typography:
- Use confident numeric typography for KPI values.
- Use compact but readable body text for definitions.
- Use short labels and put definitions behind explainers.

Layout:
- First viewport shows station, period, freshness, and four high-signal metrics.
- Queue pressure appears before charts that require backend aggregates.
- Unavailable metrics stay visible but quiet so the implementation gap is honest.
- On wider mobile or tablet, use two-column metric cards and a side-by-side chart/table split.

Motion:
- Use subtle value update motion after refresh.
- Use simple tab/period transitions.
- Do not animate charts continuously.
- Respect reduced motion.

## Copy System
Voice:
- Direct.
- Operational.
- Neutral.
- Evidence-aware.

Header copy:
- Title: `Station reports`
- Subtitle live: `{stationCode} performance for {period}`
- Subtitle computed: `Computed from loaded station data`
- Subtitle partial: `Some metrics need backend aggregates`

Metric source copy:
- `Live aggregate`
- `Computed from loaded rows`
- `Computed from local cache`
- `Partial source`
- `Backend metric required`

Action labels:
- `Open queue`
- `Open blocked queue`
- `Open handoff log`
- `Open support`
- `View table`
- `View chart`
- `Explain metric`
- `Refresh`

Unavailable copy:
- `Backend metric required`
- `This metric needs station event data before it can be shown accurately.`

Do not use:
- Vague success language.
- Staff-blaming language.
- Public commitment language for pilot targets.
- Executive reporting jargon.

## Privacy And Security
Do not show:
- Receiver phone.
- Receiver address.
- Full payment reference.
- Raw scan code.
- Raw proof reference.
- Raw actor ID.
- Individual staff comparison.
- Cross-station data to station operators.
- Admin validation blockers unless exposed through a station-safe report contract.

Allowed:
- Station code.
- Station name.
- Aggregated queue counts.
- Aggregated issue counts.
- Aggregated scan/handoff quality when backend exposes it.
- Delivery IDs only when the user navigates to an authorized queue or detail.

Role guard:
- If authenticated role is `station_operator`, require `principal.stationId`.
- If `stationId` is missing, block the screen.
- If an admin opens station reports through mobile, still default to the selected station and never show network-wide admin analytics here.

## Analytics
Track:
- `station_reports_viewed`
- `station_reports_refreshed`
- `station_reports_period_changed`
- `station_reports_metric_opened`
- `station_reports_chart_mode_changed`
- `station_reports_table_mode_changed`
- `station_reports_partial_data_seen`
- `station_reports_metric_unavailable_seen`
- `station_reports_queue_route_opened`
- `station_reports_support_opened`

Event payload rules:
- Include `stationId`.
- Include `period`.
- Include `sourceMode`.
- Include `metricId` when relevant.
- Include `confidence`.
- Include `isAvailable`.
- Do not include receiver data, raw proof data, payment references, or issue descriptions.

## QA Acceptance Criteria
Backend and data:
- Screen does not call `admin_stations` or `admin_launch_readiness` from station operator session.
- Screen can compute queue pressure from station-scoped delivery rows.
- Screen can compute issue counts from active issue rows joined to station-visible delivery IDs.
- Screen marks speed, scan, and handoff quality metrics unavailable unless a safe source exists.
- Screen marks computed data source as `computed from loaded rows`.
- Screen marks stale data after threshold.

Rendering:
- Root element exposes `screen-station-reports`.
- Header shows station code and selected period.
- Freshness banner is visible.
- KPI cards show value, unit, source, and confidence.
- Every metric has an explainer.
- Every actionable metric has a route.
- Unavailable metrics are honest and quiet, not hidden.

Accessibility:
- Chart mode has table alternative.
- Table mode preserves all metric values.
- Period selector exposes selected state.
- Refresh and partial-data status messages are announced.
- Touch targets meet mobile minimums.
- Color is not the only target or status cue.

Security:
- Station operator cannot see another station report.
- Station operator does not see admin launch readiness details.
- No staff ranking is shown.
- No receiver address or phone appears.
- No raw scan code or proof reference appears.

## Implementation Notes For Claude Code
Build this as a station-safe reporting surface, not an admin dashboard.

Recommended component split:
- `StationReportsScreen`
- `ReportsHeader`
- `ReportsPeriodSelector`
- `ReportsSourceBanner`
- `ReportsHealthSummary`
- `MetricCard`
- `QueuePressureChart`
- `MetricTable`
- `MetricExplainerSheet`
- `UnavailableMetricPanel`
- `ReportsDataCompleteness`
- `ReportsErrorState`

Recommended hooks/services:
- `useStationReports`
- `useStationReportPeriod`
- `useStationQueueMetrics`
- `useStationIssueMetrics`
- `computeStationReportRows`
- `buildMetricConfidence`
- `buildMetricRoutes`

Current data strategy:
- Reuse station overview cache when fresh.
- Fetch station-scoped delivery rows by statuses needed for queue pressure.
- Fetch active issues and join to station-visible delivery IDs.
- Never call admin endpoints from this route for station operators.
- Store computed report rows by station and period with calculation version.

Future data strategy:
- Replace local computation with `GET /v1/station/reports`.
- Keep the chart/table, source banner, confidence, and route contracts stable.
- Remove unavailable states only when backend returns the required metric with source completeness.

## Final Quality Bar
This screen is complete only when:
- A station operator can see station health without admin permissions.
- Every metric is tied to a definition, source, confidence, and route.
- Charts are useful but never required to understand the report.
- Backend gaps are shown honestly.
- Station reports help prevent backlog, missed receipts, and lost goods instead of creating decorative analytics.
- The UI feels like a serious shift leadership tool for African station logistics, not a generic dashboard template.
