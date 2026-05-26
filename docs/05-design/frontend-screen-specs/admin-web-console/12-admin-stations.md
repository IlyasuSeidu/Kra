# Admin Stations Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID              | `AdminStations`                                                                                                                                                                                                                 |
| Route                  | `/admin/stations`                                                                                                                                                                                                               |
| Primary test ID        | `screen-admin-stations`                                                                                                                                                                                                         |
| Surface                | Admin web console                                                                                                                                                                                                               |
| Backend coverage       | `admin_stations`, optional `admin_launch_readiness`, route actions to `admin_update_station_status` and `admin_update_station_validation` owner screens                                                                         |
| Offline critical       | No                                                                                                                                                                                                                              |
| Required read role     | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`                                                                                                                                                                 |
| Required mutation role | `ops_admin` or `super_admin` through `override_queue_state` capability                                                                                                                                                          |
| Required states        | `loading`, `ready`, `empty`, `filtered_empty`, `launch_blocked`, `all_ready`, `partial_launch_context`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error`                                                 |
| Parent screens         | `AdminOverview`, `AdminLaunchReadiness`, protected admin shell                                                                                                                                                                  |
| Related screens        | `AdminStationDetail`, `AdminStationValidation`, `AdminStationStatusOverride`, `AdminStationCapacity`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminLaunchReadinessDetail`, `AdminStaffActivityLog`, `AdminAuditEvents` |

## Purpose

This screen is the admin station command list. It shows every configured launch station, its operational status, intake status, service availability, active queue count, issue count, validation readiness, and go-live eligibility.

The screen should help admins answer whether stations are ready to receive, store, hand off, and dispatch packages without hiding validation blockers. It should not become a deep station editor; detailed station work belongs in station detail, validation, and status override screens.

## Backend Reality

The current backend has a concrete station list endpoint:

- `GET /v1/admin/stations`
- Operation key: `admin_stations`
- Admin auth required.
- Response includes all configured stations, including generated default records when a station has no stored override.

The backend also exposes station mutation endpoints:

- `POST /v1/admin/stations/:id/status`
- `POST /v1/admin/stations/:id/validation`

Those mutation endpoints require `override_queue_state` capability. In the current permission matrix, `ops_admin` and `super_admin` have that capability. `support_admin` and `finance_admin` can read station list data but cannot update station status or validation.

This list screen should primarily route to the proper owner flows. If it opens station status or validation modals, those modals must follow their own dedicated specs and backend transition rules.

## Primary Users

Primary:

- `ops_admin` monitoring station readiness, blockers, queue pressure, and validation progress.
- `super_admin` reviewing network readiness and making high-impact station decisions.

Secondary:

- `support_admin` checking station issue pressure before triage.
- `finance_admin` checking station readiness before launch, refund, or reconciliation context.
- Claude Code implementing the admin console later.

## User Goal

Admins use this screen to answer:

- `Which stations are active, paused, open, or restricted?`
- `Which stations are go-live eligible?`
- `Which station has validation blockers?`
- `Which station has issue or queue pressure?`
- `Which services are available per station?`
- `Which station should I open next?`
- `Can I safely launch or expand service?`
- `Who is allowed to change station state?`

The screen should create operational clarity in seconds.

## Entry Points

The screen can open from:

- `AdminOverview` station card.
- `AdminLaunchReadiness` station validation blocker.
- `AdminLaunchReadinessDetail` station owner action.
- `AdminBlockedDeliveryQueue` station warning action.
- `AdminDeliveryDetail` station context links.
- `AdminPackageDetail` station context links.
- Protected admin navigation.
- Direct route `/admin/stations`.

The screen must not open from:

- Sender station selection.
- Public service area pages.
- Staff mobile station views.
- Receiver tracking routes.

## Scope

In scope:

- Station list.
- Readiness summary.
- Validation summary.
- Operating and intake status.
- Service availability.
- Active queue count.
- Open issue count.
- Search and local filters.
- Sorting.
- Route actions to station detail, validation, status override, blocked queue, and issue queue.
- Role-aware mutation entry visibility.
- Loading, empty, stale, partial, and error states.

Out of scope:

- Inline station status mutation.
- Inline station validation mutation.
- Deep station queue details.
- Operator roster detail.
- Audit event detail.
- Delivery row list per station.
- Finance records.
- Public station availability copy.
- Sender-facing service area rules.
- Maps.
- Capacity forecasting beyond returned counts.

## Design Thesis

The screen should feel like an airport operations board for launch stations: compact, structured, status-forward, and calm. It should make station readiness legible without turning every station into a noisy card.

Visual direction:

- Use a crisp white canvas with graphite typography and restrained status color.
- Use a readiness band above the table.
- Use station rows with a left status rail.
- Use compact service chips for `standard`, `express`, and `doorstep`.
- Use validation progress bars only where they encode real backend counts.
- Use monospaced station IDs.
- Use red for blocked readiness, amber for in-progress validation or restricted intake, blue for neutral station context, and green for go-live eligible.

Restraint rule:

- No maps, no large cards for every station, no decorative station photos, no animated gauges, and no readiness score invented by the frontend.

## Research Inputs

External research used for this screen:

- [Google SRE monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/): supports clear operational health signals and avoiding dashboards that hide actionability.
- [Atlassian incident management handbook](https://www.atlassian.com/incident-management): supports status clarity, ownership, triage, and escalation paths.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense enterprise station rows, row actions, sorting, and filtering.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports concise readiness and scope notices.
- [USWDS table](https://designsystem.digital.gov/components/table/): supports accessible tabular station data.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible load, refresh, and filter result announcements.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports visible focus in dense admin tables.

How the research affects the screen:

- Operational monitoring guidance shapes readiness signals into action-oriented states, not decorative metrics.
- Incident-management guidance shapes station blockers into ownership paths.
- Data-table references shape row density and keyboard access.
- Summary-box and WCAG references shape notices, announcements, and focus behavior.

## Data Contract

### Station List

Request:

```http
GET /v1/admin/stations
```

Operation:

```text
admin_stations
```

Auth:

- Admin read access.

Response fields:

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
- `stations[].validation.dryRunBusinessDaysCompleted`
- `stations[].validation.controlledPilotBusinessDaysCompleted`
- `stations[].validation.checklist`
- `stations[].validation.scanFallbackSuccessRatePercent`
- `stations[].validation.goLiveEligible`
- `stations[].validation.blockers`
- `stations[].validation.startedAt`
- `stations[].validation.completedAt`
- `stations[].validation.note`
- `stations[].validation.updatedAt`
- `stations[].note`
- `stations[].updatedAt`

Rules:

- Use `validation.goLiveEligible` as the station-level readiness authority.
- Use `validation.blockers` as backend-owned blocker copy.
- Do not derive blocker text from frontend-only copy.
- Do not hide default generated station records.
- Do not show station validation note in analytics.

### Optional Launch Readiness

Request:

```http
GET /v1/admin/launch-readiness
```

Purpose:

- Provide system-level launch gate context above the station table.
- Compare station list readiness to launch-readiness blockers.
- Route to `AdminLaunchReadinessDetail` for system blockers.

Fields used:

- `status`
- `goLiveEligible`
- `blockers`
- `systemChecks.stationValidation.readyStations`
- `systemChecks.stationValidation.totalStations`

Rules:

- The station list can work without launch readiness data.
- If launch readiness fails, show station rows and a partial context notice.
- Do not block station list rendering on launch readiness.

## Station Readiness Model

Use backend fields directly.

Station readiness states:
| State | Source | Meaning |
| --- | --- | --- |
| `ready` | `validation.goLiveEligible=true` and operating/intake/service are usable | Station can support launch constraints |
| `validation_blocked` | `validation.goLiveEligible=false` or `validation.status=blocked` | Validation is incomplete or blocked |
| `in_progress` | `validation.status=in_progress` | Validation evidence is underway |
| `not_started` | `validation.status=not_started` | Validation has not started |
| `operationally_paused` | `operatingStatus=paused` | Station is not currently active |
| `intake_restricted` | `intakeStatus=restricted` | Intake is restricted |
| `service_limited` | one or more service availability values are false | Some services unavailable |
| `issue_pressure` | `issueCount > 0` | Open station issues exist |
| `queue_pressure` | `activeQueueCount > threshold` | Active queue needs review |

Thresholds:

- Do not invent hard capacity thresholds unless product policy exists.
- For this screen, `activeQueueCount > 0` is visible but not automatically critical.
- If the UI needs a pressure accent, use:
  - `0`: none.
  - `1-10`: normal active workload.
  - `11+`: elevated workload label until a formal capacity policy exists.

## Validation Rules

Backend readiness facts:

- Dry-run business days must be `2`.
- Controlled pilot-volume business days must be `3`.
- All checklist values must be true.
- Scan or manual fallback success must be at least `95%`.
- Manual blockers keep the station blocked.
- Unresolved P1 issue confirmation keeps validation blocked.

Checklist labels:

- `activeOperatorsCanSignIn`: Active operators can sign in.
- `intakeDispatchReceiptAudited`: Intake, dispatch, and destination receipt audited.
- `scanOrManualFallbackTested`: Scan or manual fallback tested.
- `noUnresolvedP1Incidents`: No unresolved P1 incidents.
- `escalationAndRefundHandoffTested`: Escalation and refund handoff tested.
- `openingHoursStorageAndHandoffConfirmed`: Opening hours, storage, and handoff confirmed.

Rules:

- The frontend can show incomplete checklist items.
- The frontend must not override `goLiveEligible`.
- The frontend must not mark a station ready when backend says blocked.
- Manual blockers display as backend-owned blocker text.

## Role And Permissions

| Role            | Can read list | Can open detail | Can open validation edit | Can open status override | Notes                             |
| --------------- | ------------- | --------------- | ------------------------ | ------------------------ | --------------------------------- |
| `ops_admin`     | Yes           | Yes             | Yes                      | Yes                      | Has `override_queue_state`        |
| `support_admin` | Yes           | Yes             | No                       | No                       | Can use issue and station context |
| `finance_admin` | Yes           | Yes             | No                       | No                       | Read-only for finance context     |
| `super_admin`   | Yes           | Yes             | Yes                      | Yes                      | Full station management           |

Rules:

- Hide mutation entry points when role lacks capability.
- Do not rely on client role checks only; backend must authorize mutations.
- If a mutation owner screen returns `FORBIDDEN`, refetch session and show a permission error.

## Layout

### Desktop

Use a 12-column layout.

Top zone:

- Breadcrumbs.
- Page title `Stations`.
- Generated timestamp.
- Refresh button.
- Launch readiness context pill when available.

Readiness summary:

- Total stations.
- Go-live eligible stations.
- Blocked validation stations.
- Paused stations.
- Restricted intake stations.
- Open issue count total.
- Active queue total.

Filter bar:

- Search.
- Readiness filter.
- Operating status filter.
- Intake status filter.
- Service availability filter.
- City filter.
- Sort selector.
- Reset button.

Main table columns:

- Station.
- Readiness.
- Operating.
- Intake.
- Services.
- Queues and issues.
- Validation evidence.
- Updated.
- Action.

Right rail:

- Launch readiness summary.
- Validation rules.
- Quick links to launch readiness, blocked queue, issue queue, and audit events.

### Tablet

- Summary metrics wrap into two rows.
- Table hides validation detail until row expansion.
- Filters wrap.

### Mobile

- One-column station cards.
- Readiness first.
- Station ID and name second.
- Status and services third.
- Validation progress and blockers fourth.
- Actions last.

Rules:

- No horizontal table scrolling on mobile.
- Cards must preserve all labels.
- Action buttons must be full width.

## Components

### `AdminStationsPage`

Responsibilities:

- Fetch station list.
- Optionally fetch launch readiness.
- Manage filters, search, sort, and refresh.
- Derive readiness summary.
- Render route-level states.

Queries:

- `useAdminStationsQuery`
- Optional `useAdminLaunchReadinessQuery`

Test id:

- `screen-admin-stations`

### `StationReadinessSummary`

Metrics:

- Total stations.
- Go-live eligible.
- Validation blocked.
- In progress.
- Paused.
- Restricted intake.
- Total active queue count.
- Total open issue count.

Rules:

- Metrics derive from loaded station rows.
- Clicking a metric applies the corresponding filter.
- Do not call backend on metric click.

Test id:

- `admin-stations-readiness-summary`

### `StationFilterBar`

Controls:

- Search by station name, station ID, city.
- Readiness filter.
- Operating status filter.
- Intake status filter.
- Service availability filter.
- Sort.
- Reset.

Rules:

- Search is local only.
- Search does not include validation notes or blocker text.
- Active filters appear as removable chips.

Test ids:

- `admin-stations-search`
- `admin-stations-readiness-filter`
- `admin-stations-operating-filter`
- `admin-stations-intake-filter`
- `admin-stations-service-filter`
- `admin-stations-sort`
- `admin-stations-reset`

### `StationTable`

Columns:

- Station.
- Readiness.
- Operating.
- Intake.
- Services.
- Queues and issues.
- Validation.
- Updated.
- Action.

Station cell:

- Name.
- City.
- Station ID.

Readiness cell:

- Go-live eligible label.
- Validation status.
- Blocker count.

Services cell:

- `Standard`
- `Express`
- `Doorstep`

Validation cell:

- Dry-run days.
- Pilot-volume days.
- Scan fallback percentage.
- Checklist progress.

Action cell:

- Primary action.
- Secondary action menu.

Test ids:

- `admin-stations-table`
- `admin-stations-row`
- `admin-stations-primary-action`

### `StationMobileCardList`

Purpose:

- Mobile rendering of station rows.

Rules:

- Same row model as table.
- Readiness and blocker count must remain visible.
- Validation details can collapse but must be available.

Test id:

- `admin-stations-mobile-list`

### `StationRowActions`

Primary action mapping:
| Condition | Primary action | Target |
| --- | --- | --- |
| Station validation blocked | `Review validation` | `/admin/stations/:stationId/validation` or validation modal owner |
| Station paused or restricted | `Review status` | `/admin/stations/:stationId/status` or status override owner |
| Station has issue count | `Open issues` | `/admin/issues?stationId=:stationId` when supported, otherwise `/admin/issues` |
| Station has active queue count | `Open blocked queue` | `/admin/deliveries/blocked?stationId=:stationId` when supported, otherwise `/admin/deliveries/blocked` |
| Station ready | `Open station detail` | `/admin/stations/:stationId` |

Secondary actions:

- `Open station detail`.
- `Open launch readiness`.
- `Open audit events`.

Rules:

- Hide validation and status mutation entry points for roles without `override_queue_state`.
- If query-param filtering is not implemented on target routes, route to the parent and let that screen handle unsupported params safely.
- Do not mutate directly from the station row.

Test id:

- `admin-stations-row-actions`

### `LaunchContextPanel`

Purpose:

- Connect station list to launch readiness.

Content:

- Launch readiness status.
- Ready station count.
- Total station count.
- Top station blockers.
- Link to launch readiness detail.

Rules:

- If launch readiness fails, show `Launch readiness context unavailable` and keep station list visible.
- Do not duplicate every launch blocker when station rows already show station validation blockers.

Test id:

- `admin-stations-launch-context`

## Data Loading Strategy

Initial load:

1. Fetch `admin_stations`.
2. Fetch `admin_launch_readiness` in parallel when this screen includes launch context.
3. Render shell with skeleton rows.
4. If station list succeeds, render rows even if launch readiness fails.
5. If station list returns empty, render empty state.
6. If station list returns `FORBIDDEN`, clear data and show not authorized.

Refresh:

- Refetch station list and launch readiness.
- Keep current filters and sort.
- Mark rows stale while refreshing.
- Announce `Refreshing station readiness`.
- Announce loaded station count after completion.

Caching:

- Use authenticated admin query cache.
- Invalidate station list after station status or validation mutation owner screen succeeds.
- Clear cache on sign-out.
- Do not persist validation notes or blockers in local storage.

## Search, Filter, Sort

Search fields:

- Station ID.
- Name.
- City.

Do not search:

- Validation note.
- Manual blocker text.
- Internal issue text.

Readiness filters:

- All.
- Go-live eligible.
- Validation blocked.
- In progress.
- Not started.
- Paused.
- Restricted intake.
- Service limited.
- Issue pressure.
- Queue activity.

Sort options:

- Readiness risk.
- Station name A-Z.
- City A-Z.
- Highest active queue.
- Highest issue count.
- Recently updated.
- Validation progress.

Default sort:

1. Validation blocked.
2. Paused.
3. Restricted intake.
4. Service limited.
5. Issue count descending.
6. Active queue count descending.
7. Name A-Z.

Rules:

- All filters are local.
- Filters are reversible.
- Reset clears search and filters and restores default sort.

## Empty And Error States

### Loading

UI:

- Skeleton summary strip.
- Skeleton table rows.
- Announce `Loading stations`.

### Empty

Trigger:

- `admin_stations` returns zero stations.

Title:

```text
No stations configured
```

Body:

```text
Station data is required before launch readiness can be reviewed.
```

Actions:

- `Refresh`
- `Open launch readiness`

### Filtered Empty

Title:

```text
No stations match these filters
```

Actions:

- `Reset filters`

### Partial Launch Context

Trigger:

- `admin_stations` succeeds but launch readiness fails.

UI:

- Show station list.
- Show banner `Launch readiness context unavailable`.
- Keep refresh action.

### Not Authorized

Title:

```text
You do not have access to station management
```

Body:

```text
Use an authorized admin account to review station readiness.
```

Actions:

- `Back to admin overview`

### API Error

Title:

```text
Stations could not load
```

Body:

```text
Station readiness data did not respond. Refresh before making launch decisions.
```

Actions:

- `Refresh`

## Privacy And Security

Never show:

- Operator personal data.
- Sender data.
- Receiver data.
- Proof references.
- Payment provider references.
- Auth tokens.
- Internal validation note in analytics.

Allowed display:

- Station ID.
- Station name.
- City.
- Status fields.
- Service availability.
- Queue count.
- Issue count.
- Validation blockers.
- Validation note in station row expansion only when returned by backend.

Analytics forbidden:

- Validation note.
- Manual blocker text.
- Any future operator name.
- Any future phone or email.

## Analytics

Events:

- `admin_stations_viewed`
- `admin_stations_refreshed`
- `admin_stations_filtered`
- `admin_station_row_opened`
- `admin_station_validation_action_opened`
- `admin_station_status_action_opened`
- `admin_stations_launch_context_opened`

Required properties:

- `visible_count`
- `total_count`
- `go_live_eligible_count`
- `blocked_validation_count`
- `paused_count`
- `restricted_intake_count`
- `role`
- `filter_readiness`
- `sort`

Row action properties:

- `stationId`
- `readiness_state`
- `operatingStatus`
- `intakeStatus`
- `validationStatus`
- `goLiveEligible`
- `action`

Do not send:

- `note`
- `blockers`
- operator data
- customer data
- payment data

## Accessibility

Structure:

- One `h1`: `Stations`.
- Summary metrics are buttons only when they filter rows.
- Table headers are semantic.
- Mobile cards include visible labels.

Announcements:

- Load complete announces station count.
- Filter changes announce visible station count.
- Refresh start and completion use polite status.
- API error uses assertive status.

Keyboard:

- Filter controls reachable in logical order.
- Table row actions reachable without hover.
- Enter on a focused row opens primary action.
- Action menu items use standard menu keyboard behavior.

Focus:

- Visible focus for all controls.
- Focus must remain stable after refresh.
- Mutation owner screens or modals must return focus to row action after close.

Color:

- Status must not rely on color alone.
- Every status pill includes text.
- Contrast meets WCAG AA.

## Performance

Targets:

- Render station shell immediately.
- Render up to all configured launch stations without virtualization.
- Filter and sort within 100 ms for expected station count.
- Avoid per-station detail fetches.
- Avoid polling.

Data:

- One station list request.
- Optional one launch readiness request.
- Manual refresh only.
- Invalidate list after station mutation owner screen succeeds.

## Testing Requirements

Unit tests:

- Readiness state derivation.
- Validation progress derivation.
- Role action visibility.
- Filter logic.
- Sort logic.
- Analytics sanitizer.
- Launch context partial-state handling.

Integration tests:

- Loads station rows from `admin_stations`.
- Shows generated default station data correctly.
- Shows validation blockers.
- Shows go-live eligible stations.
- Shows paused and restricted stations.
- Hides mutation entry points for support and finance roles.
- Shows mutation entry points for ops and super roles.
- Handles launch readiness failure.
- Handles station list authorization failure.

Accessibility tests:

- Heading order.
- Summary metric button labels.
- Table headers.
- Keyboard row action flow.
- Filter announcements.
- Mobile card labels.

Visual regression states:

- All stations ready.
- Mixed validation states.
- Paused station.
- Restricted intake station.
- Service-limited station.
- Launch context unavailable.
- Empty state.
- Mobile station cards.

## Implementation Checklist

- Create route `/admin/stations`.
- Use protected admin shell.
- Fetch `admin_stations`.
- Optionally fetch `admin_launch_readiness`.
- Build pure readiness derivation helper.
- Build pure validation progress helper.
- Build role action helper for station mutation entry points.
- Build local search, filter, and sort.
- Build desktop table and mobile card list from same row model.
- Add scope and launch context panel.
- Add partial launch context state.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Inline station status mutation inside the row.
- Inline validation mutation inside the row.
- A frontend-only readiness score.
- Map-based station browsing.
- Public station availability copy.
- Operator roster detail.
- Per-station delivery list in this screen.
- Payment or refund actions.
- Hidden validation note analytics.
- Backend query params not supported by `admin_stations`.

## Acceptance Criteria

The screen is complete when:

- `/admin/stations` renders with test id `screen-admin-stations`.
- It reads station rows from `admin_stations`.
- It displays readiness, status, services, active queues, issue counts, validation progress, and blockers.
- It uses backend `goLiveEligible` as readiness authority.
- It shows role-safe actions.
- It does not mutate station status or validation directly from a row.
- It handles launch readiness context as optional.
- It supports local search, filters, and sorting.
- It protects notes, blockers, and any future personal data from analytics.
- It passes accessibility and responsive checks.

## Claude Code Build Brief

Build `AdminStations` as a serious station readiness command list for `/admin/stations`. Use `admin_stations` as the source of truth, optionally load launch readiness context, and show each station's readiness, queue pressure, issue pressure, status, service availability, and validation evidence. Keep mutations in dedicated station status or validation owner flows, hide those entry points from roles without `override_queue_state`, and never invent frontend readiness scores.
