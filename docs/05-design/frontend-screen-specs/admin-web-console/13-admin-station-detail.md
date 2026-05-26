# Admin Station Detail Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID              | `AdminStationDetail`                                                                                                                                                                                                                   |
| Route                  | `/admin/stations/:stationId`                                                                                                                                                                                                           |
| Primary test ID        | `screen-admin-station-detail`                                                                                                                                                                                                          |
| Surface                | Admin web console                                                                                                                                                                                                                      |
| Backend coverage       | `admin_stations`, optional `admin_launch_readiness`, optional latest `admin_deliveries` context                                                                                                                                        |
| Offline critical       | No                                                                                                                                                                                                                                     |
| Required read role     | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`                                                                                                                                                                        |
| Required mutation role | No direct mutation on this screen; owner flows require `ops_admin` or `super_admin` through `override_queue_state`                                                                                                                     |
| Required states        | `loading`, `ready`, `invalid_station`, `station_not_found`, `launch_context_unavailable`, `delivery_context_unavailable`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error`                                      |
| Parent screens         | `AdminStations`, `AdminLaunchReadiness`, protected admin shell                                                                                                                                                                         |
| Related screens        | `AdminStations`, `AdminStationValidation`, `AdminStationStatusOverride`, `AdminStationCapacity`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminLaunchReadinessDetail`, `AdminDeliveryDetail`, `AdminAuditEvents`, `AdminUsers` |

## Purpose

`AdminStationDetail` is the admin record page for one launch station. It turns a station row into a decision-grade view of operational status, intake state, service availability, validation evidence, launch blockers, queue pressure, issue pressure, and safe investigation links.

The page should answer:

- `Which station am I reviewing?`
- `Is the station active and open for intake?`
- `Which services are available?`
- `Is the station go-live eligible?`
- `Which validation evidence is complete?`
- `Which blockers still prevent launch?`
- `What operational pressure exists right now?`
- `Which owner screen handles the next action?`
- `Who can change station state?`

The page is not a station editor. It is a command detail that sends admins to the exact owner flow for validation, status override, capacity review, issue triage, and audit review.

## Backend Reality

There is no standalone station-detail endpoint today.

The screen must resolve a station by fetching:

```http
GET /v1/admin/stations
```

Operation:

```text
admin_stations
```

The route parameter is:

```text
:stationId
```

Valid station IDs in v1:

- `ST-ACC-01`
- `ST-KMS-01`
- `ST-TML-01`

Resolution rule:

1. Validate the route parameter against the shared station ID set.
2. Fetch `admin_stations`.
3. Find the station with matching `stationId`.
4. Render `invalid_station` if the route parameter is not a known station ID.
5. Render `station_not_found` if the backend response does not include the known station.

Optional context can come from:

```http
GET /v1/admin/launch-readiness
```

Optional delivery context can come from:

```http
GET /v1/admin/deliveries
```

Important limits:

- `admin_stations` returns the station record and station-level counts.
- `admin_launch_readiness` returns station-related launch blockers and unresolved P1 counts.
- `admin_deliveries` returns the latest admin delivery rows, not a complete station delivery ledger.
- There is no station-specific issue list endpoint.
- There is no station queue detail endpoint.
- There is no station operator roster endpoint.
- There is no station audit-event endpoint scoped by station.
- There is no capacity forecast endpoint.

Therefore:

- The page must not claim complete per-station queues.
- The page must not claim complete issue detail from `issueCount`.
- The page must not show operator rosters.
- The page must not expose mutation controls inline.
- The page must label latest delivery context as limited to loaded admin delivery rows.

## Primary Users

Primary:

- `ops_admin` reviewing station readiness, validation blockers, queue pressure, and service availability.
- `super_admin` checking whether a station can safely support pilot launch or expansion.

Secondary:

- `support_admin` checking station issue pressure before issue triage.
- `finance_admin` checking station readiness before launch, refunds, reconciliation, or risk review.
- QA validating station route behavior and role restrictions.
- Security reviewers validating that station notes, blockers, and operational signals are handled safely.
- Claude Code implementing the admin console later.

## User Goal

The main user goal is to understand one station quickly and open the right owner screen without guessing.

The screen should help admins decide:

- Whether validation is complete.
- Whether operations can receive and dispatch safely.
- Whether intake is restricted.
- Whether services are available.
- Whether active queue pressure needs attention.
- Whether unresolved station issues block launch.
- Whether the next action belongs to validation, status override, capacity, issue triage, or launch readiness.

The page should reduce ambiguity under launch pressure. It should not bury blockers inside decorative cards.

## Entry Points

The screen can open from:

- `AdminStations` row action.
- `AdminLaunchReadiness` station blocker action.
- `AdminLaunchReadinessDetail` affected station row.
- `AdminBlockedDeliveryQueue` station warning action.
- `AdminDeliveryDetail` origin or destination station link.
- `AdminPackageDetail` station context link.
- `AdminCustodyChain` station handoff link.
- `AdminStationCapacity` station row.
- Protected admin navigation.
- Direct route `/admin/stations/:stationId`.

The screen must not open from:

- Public web navigation.
- Public tracking.
- Sender station selection.
- Driver mobile workflow.
- Final-mile courier workflow.
- Station operator mobile workflow unless routed through admin auth.

## Scope

In scope:

- Station route validation.
- Station lookup from `admin_stations`.
- Station identity and city.
- Operating status.
- Intake status.
- Service availability.
- Active queue count.
- Issue count.
- Validation status.
- Dry-run day progress.
- Controlled pilot-volume day progress.
- Checklist evidence.
- Scan or manual-fallback success rate.
- Go-live eligibility.
- Backend blockers.
- Station note display.
- Last updated timestamps.
- Optional launch readiness station blockers.
- Optional latest loaded delivery context.
- Role-safe action routing.
- Refresh and stale states.
- Accessibility, analytics, and responsive behavior.

Out of scope:

- Inline station status update.
- Inline station validation update.
- Inline service enablement.
- Inline issue resolution.
- Inline delivery mutation.
- Staff roster.
- Time-clock records.
- Station cash records.
- Complete station queue ledger.
- Complete station issue ledger.
- Capacity forecasting beyond returned counts.
- Maps.
- Public station availability copy.
- Receiver or sender personal data expansion.
- Raw audit logs.

## Design Thesis

The page should feel like a station control dossier: a calm, high-density operations record with clear signal hierarchy, visible blockers, and obvious routes to owner flows.

Visual direction:

- Use a white operational workspace with graphite text and one strong status rail.
- Give the top third of the page to station identity, readiness, and action routing.
- Use evidence panels instead of generic cards.
- Use progress bars only for bounded backend evidence.
- Use check rows for validation checklist values.
- Use amber for incomplete evidence, red for blocked launch, green for eligible state, blue for neutral context, and gray for unavailable context.
- Use monospaced station IDs and timestamps.
- Use compact tables for delivery context rather than large marketing-style cards.

Restraint rule:

- No maps, photos, radial gauges, local readiness scores, route diagrams, or animated station graphics.

## Research Inputs

External research used for this screen:

- [Google SRE monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/): supports action-oriented operational signals and separating symptoms from owner actions.
- [Atlassian incident management handbook](https://www.atlassian.com/incident-management): supports clear severity, ownership, escalation, and triage paths for operational blockers.
- [IBM Carbon structured list](https://carbondesignsystem.com/components/structured-list/usage/): supports compact key-value evidence panels for enterprise review pages.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense related-record tables with row actions.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports concise scope notices and evidence summaries.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible load, refresh, and status announcements.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports strong keyboard focus in dense admin screens.

How the research affects the screen:

- Operational monitoring guidance shapes the page around signals that point to next action.
- Incident-management guidance shapes blockers into owner routes and severity language.
- Structured-list and table guidance shape compact evidence presentation.
- Summary-box guidance shapes route limits and partial-context notices.
- WCAG guidance shapes refresh announcements, focus behavior, and status updates.

## Backend Data Contract

### Primary Station Lookup

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

Response fields used:

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
- `stations[].validation.checklist.activeOperatorsCanSignIn`
- `stations[].validation.checklist.intakeDispatchReceiptAudited`
- `stations[].validation.checklist.scanOrManualFallbackTested`
- `stations[].validation.checklist.noUnresolvedP1Incidents`
- `stations[].validation.checklist.escalationAndRefundHandoffTested`
- `stations[].validation.checklist.openingHoursStorageAndHandoffConfirmed`
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

- Use `validation.goLiveEligible` as the readiness authority.
- Use backend blocker strings directly as user-visible evidence.
- Do not translate blocker meaning into new eligibility decisions.
- Do not calculate a local readiness score.
- Do not hide generated default station records.
- Treat missing optional note fields as absent, not empty.

### Optional Launch Readiness Context

Request:

```http
GET /v1/admin/launch-readiness
```

Operation:

```text
admin_launch_readiness
```

Fields used:

- `generatedAt`
- `status`
- `goLiveEligible`
- `blockers[].code`
- `blockers[].severity`
- `blockers[].message`
- `blockers[].stationId`
- `blockers[].count`
- `stations[].stationId`
- `stations[].goLiveEligible`
- `stations[].validationBlockerCount`
- `stations[].activeQueueCount`
- `stations[].unresolvedP1IssueCount`
- `systemChecks.stationValidation.readyStations`
- `systemChecks.stationValidation.totalStations`

Rules:

- Filter blockers to the active station where `blockers[].stationId` equals route `stationId`.
- Also show platform blockers as network context only when they affect station launch decisions.
- Do not block station detail rendering if launch readiness fails.
- Show a partial-context notice when launch readiness is unavailable.
- Do not replace `admin_stations` validation fields with launch-readiness summary fields.

### Optional Delivery Context

Request:

```http
GET /v1/admin/deliveries
```

Operation:

```text
admin_deliveries
```

Fields used when available:

- `generatedAt`
- `deliveries[].deliveryId`
- `deliveries[].status`
- `deliveries[].paymentStatus`
- `deliveries[].originStationId`
- `deliveries[].destinationStationId`
- `deliveries[].latestOccurredAt`
- `deliveries[].receiverName`

Rules:

- Filter loaded rows where `originStationId` or `destinationStationId` equals route `stationId`.
- Label this table as `Latest loaded admin deliveries touching this station`.
- Do not claim complete queue coverage.
- Do not expose receiver phone, address, or sender profile data.
- Link rows to `AdminDeliveryDetail`.
- The page remains valid if this optional request is not used.

### Status Owner Route

The station status owner flow uses:

```http
POST /v1/admin/stations/:id/status
```

Operation:

```text
admin_update_station_status
```

Request fields:

- `operatingStatus`
- `intakeStatus`
- `serviceAvailability.standard`
- `serviceAvailability.express`
- `serviceAvailability.doorstep`
- `note`

Capability:

```text
override_queue_state
```

This screen must route to:

```text
/admin/stations/:stationId/status
```

Do not perform this mutation directly on `AdminStationDetail`.

### Validation Owner Route

The station validation owner flow uses:

```http
POST /v1/admin/stations/:id/validation
```

Operation:

```text
admin_update_station_validation
```

Request fields:

- `dryRunBusinessDaysCompleted`
- `controlledPilotBusinessDaysCompleted`
- `checklist`
- `scanFallbackSuccessRatePercent`
- `manualBlockers`
- `startedAt`
- `completedAt`
- `note`

Capability:

```text
override_queue_state
```

This screen must route to:

```text
/admin/stations/:stationId/validation
```

Do not perform this mutation directly on `AdminStationDetail`.

## Role Rules

Read access:

- `ops_admin`
- `support_admin`
- `finance_admin`
- `super_admin`

Mutation entry points visible:

- `ops_admin`
- `super_admin`

Mutation entry points hidden:

- `support_admin`
- `finance_admin`

Role behavior:
| Role | Can view station detail | Can open validation owner flow | Can open status owner flow | Can open issue queue | Can open finance context |
| --- | --- | --- | --- | --- | --- |
| `ops_admin` | Yes | Yes | Yes | Yes | No, unless route permission exists elsewhere |
| `support_admin` | Yes | No | No | Yes | No |
| `finance_admin` | Yes | No | No | Read station context only | Yes, through finance screens |
| `super_admin` | Yes | Yes | Yes | Yes | Yes |

Read-only roles should see:

- Current status.
- Current validation evidence.
- Clear reason why mutation actions are unavailable.
- Links to screens they can access.

Read-only roles should not see:

- Disabled mutation forms.
- Hidden form values.
- Editable station notes.
- Submit controls.

## Station Readiness Model

Use backend values as authority.

### Eligibility

Eligible:

- `validation.goLiveEligible=true`
- `operatingStatus=active`
- `intakeStatus=open`
- At least one required service is available for launch policy.

Blocked:

- `validation.goLiveEligible=false`
- `validation.status=blocked`
- `operatingStatus=paused`
- `intakeStatus=restricted`
- Launch readiness includes station-specific P1 blockers.
- Backend blocker list is not empty.

In progress:

- `validation.status=in_progress`
- Some validation evidence exists but not all backend rules pass.

Not started:

- `validation.status=not_started`
- No meaningful validation evidence has been recorded.

Ready validation but operationally limited:

- `validation.status=ready`
- `validation.goLiveEligible=true`
- `operatingStatus=paused`, `intakeStatus=restricted`, or services are disabled.

### Validation Evidence Bounds

Dry run:

- Minimum for eligibility: `2`
- Maximum in contract: `2`
- Display as `0 of 2`, `1 of 2`, or `2 of 2`.

Controlled pilot-volume:

- Minimum for eligibility: `3`
- Maximum in contract: `3`
- Display as `0 of 3`, `1 of 3`, `2 of 3`, or `3 of 3`.

Scan or manual fallback success:

- Eligibility threshold: `95%`
- Contract range: `0` to `100`
- Display exact backend number.
- Do not round below one decimal if backend later returns decimals.

Checklist:

- Six backend checklist booleans.
- Each row must show label, status, and why it matters.
- Do not combine multiple checklist booleans into one local flag.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. Station header.
3. Readiness decision strip.
4. Primary evidence grid.
5. Validation evidence panel.
6. Operating and service panel.
7. Launch blockers panel.
8. Queue and issue pressure panel.
9. Optional delivery context.
10. Action rail.
11. Notes and timestamps.

Mobile order:

1. Breadcrumb.
2. Station header.
3. Readiness decision.
4. Primary next action.
5. Validation evidence.
6. Status and service evidence.
7. Blockers.
8. Pressure summary.
9. Delivery context.
10. Secondary actions.
11. Notes.

The route must preserve context on refresh.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main content max width `1440px`.
- Two-column layout after header.
- Left content column about `minmax(0, 1fr)`.
- Right action rail about `360px`.
- Sticky action rail below shell header.
- Evidence panels in a two-column grid.
- Delivery context table full width below evidence panels.

Spacing:

- Page padding `32px`.
- Header bottom margin `24px`.
- Evidence grid gap `16px`.
- Panel inner padding `20px`.
- Dense rows use `12px` vertical spacing.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Single-column header.
- Action rail becomes action panel below readiness strip.
- Evidence grid uses two columns only where labels remain readable.
- Delivery context switches to compact table.

### Mobile

Viewport:

- `<768px`

Layout:

- Single column.
- Sticky bottom action group for primary route action only.
- Evidence rows become stacked list sections.
- Delivery table becomes cards.
- No horizontal scroll for key evidence.
- Long blocker messages wrap with generous line height.

Mobile action rules:

- Show at most one primary action in sticky area.
- Keep secondary actions in `More station actions`.
- Do not hide readiness or blocker evidence behind accordions by default.

## Visual System

Typography:

- Use the admin console type tokens.
- Header station name: large, clear, no decorative treatment.
- Station ID: monospaced, compact.
- Evidence labels: medium weight.
- Counts: tabular numerals.

Color:

- `green`: go-live eligible and active.
- `red`: blocked validation, paused station, unresolved P1 context.
- `amber`: restricted intake, incomplete evidence, service-limited state.
- `blue`: neutral route context and links.
- `gray`: unavailable optional context.

Status surfaces:

- Use a left rail on the header to communicate overall state.
- Use badges only for canonical backend statuses.
- Use summary boxes for scope limits and partial context.
- Do not use more than two accent colors in one panel.

Motion:

- Fade in optional context after primary station data loads.
- Use a short loading skeleton for evidence rows.
- Avoid looping animation.
- Respect `prefers-reduced-motion`.

## Components

### `AdminStationDetailPage`

Responsibilities:

- Read route `stationId`.
- Validate station ID.
- Fetch `admin_stations`.
- Resolve current station.
- Fetch optional launch readiness context.
- Optionally fetch latest admin delivery context.
- Build derived view state.
- Render page states.
- Provide refresh.
- Provide route actions.

Props:

- None beyond router and auth context.

State:

- `routeStationId`
- `stationListStatus`
- `station`
- `launchReadinessStatus`
- `launchReadiness`
- `deliveryContextStatus`
- `touchingDeliveries`
- `refreshing`
- `stale`

Test id:

```text
screen-admin-station-detail
```

### `StationDetailBreadcrumb`

Purpose:

- Orient admins in the station workflow.

Content:

- `Admin`
- `Stations`
- Station name or station ID.

Rules:

- Station name appears only after successful station resolution.
- Invalid route shows station ID as text, not link.
- Breadcrumb links preserve admin shell state where supported.

### `StationDetailHeader`

Purpose:

- Identify the station and show the decision state immediately.

Content:

- Station name.
- Station ID.
- City.
- Overall readiness label.
- Operating status.
- Intake status.
- Last updated time.
- Generated time from station list response.

Primary labels:

- `Go-live eligible`
- `Validation blocked`
- `Validation in progress`
- `Not started`
- `Operationally paused`
- `Intake restricted`
- `Service limited`

Rules:

- If validation is ready but operating status is paused, lead with `Operationally paused`.
- If validation is ready but intake is restricted, lead with `Intake restricted`.
- If validation is blocked, lead with `Validation blocked`.
- Do not show conflicting green and red primary badges at the same hierarchy.

### `StationReadinessDecisionStrip`

Purpose:

- Provide the high-level decision in one scan.

Fields:

- `Readiness`
- `Validation status`
- `Operating status`
- `Intake status`
- `Service availability`
- `Open blockers`

Behavior:

- The first cell states the overall decision.
- Each cell has a short label and exact backend value.
- Cells link to the relevant evidence section.

Decision text:

- Eligible: `Station is eligible on recorded validation evidence.`
- Blocked: `Station is blocked by recorded validation or launch evidence.`
- Limited: `Station has valid evidence but operational state limits use.`
- In progress: `Station validation is not complete.`

### `StationValidationEvidencePanel`

Purpose:

- Show every validation field in a precise, auditable way.

Sections:

- Validation status.
- Dry-run business days.
- Controlled pilot-volume business days.
- Scan or manual-fallback success.
- Checklist.
- Backend blockers.
- Validation note.
- Validation timestamps.

Progress rows:
| Row | Source | Display |
| --- | --- | --- |
| Dry-run days | `validation.dryRunBusinessDaysCompleted` | `x of 2` |
| Controlled pilot days | `validation.controlledPilotBusinessDaysCompleted` | `x of 3` |
| Scan or fallback success | `validation.scanFallbackSuccessRatePercent` | `x%` with threshold marker at `95%` |

Checklist rows:

- `Active operators can sign in`
- `Intake, dispatch, and destination receipt audited`
- `Scan or manual fallback tested`
- `No unresolved P1 incidents`
- `Escalation and refund handoff tested`
- `Opening hours, storage, and handoff confirmed`

Checklist row states:

- Complete.
- Incomplete.

Rules:

- Do not collapse checklist rows into a single percentage.
- Do not convert note text into analytics.
- If blockers are empty and go-live eligible is true, show `No validation blockers returned.`
- If blockers are empty but go-live eligible is false, show `Backend returned no blocker text for this ineligible state` as an integrity warning.

### `StationOperationalStatePanel`

Purpose:

- Show whether the station can currently operate.

Fields:

- Operating status.
- Intake status.
- Standard service.
- Express service.
- Doorstep service.
- Station note.
- Station updated time.

Display:

- Operating status as active or paused.
- Intake status as open or restricted.
- Services as available or unavailable.

Rules:

- Service booleans are not eligibility rules by themselves unless launch readiness reports a station service blocker.
- Paused status must be visually stronger than service unavailability.
- Notes are visible but not editable on this screen.
- Route status changes to the owner flow.

### `StationLaunchContextPanel`

Purpose:

- Explain how this station affects current launch readiness.

Sources:

- `admin_launch_readiness.blockers`
- `admin_launch_readiness.stations`
- `admin_launch_readiness.systemChecks.stationValidation`

Content:

- Station-specific blocker rows.
- Network launch status.
- Ready station count.
- Station unresolved P1 count when available.
- Link to launch readiness detail by blocker code.

Blocker row fields:

- Severity.
- Code.
- Message.
- Count.
- Owner action.

Rules:

- Station-specific blockers appear first.
- Network-wide blockers appear in a separate `Network context` group.
- If launch readiness fails, show partial context notice.
- Do not duplicate every network blocker on the station page.
- Do not let launch readiness override station fields from `admin_stations`.

### `StationQueueIssuePressurePanel`

Purpose:

- Show current pressure without pretending to have complete queue details.

Fields:

- `activeQueueCount`
- `issueCount`
- Optional unresolved P1 count from launch readiness station summary.

Visual:

- Three compact metric blocks.
- Count values use tabular numerals.
- Each metric has one owner route.

Owner routes:

- Active queue count routes to `AdminStationCapacity` when available.
- Issue count routes to `AdminIssueQueue`.
- Unresolved P1 count routes to `AdminLaunchReadinessDetail` or `AdminIssueQueue`.

Rules:

- `issueCount` is a count, not a list.
- Do not show issue titles unless an issue endpoint returns them later.
- Do not fetch every issue from `list_issues` to approximate station issues.
- If target issue route does not support station filters yet, open the parent issue queue and preserve station context in the search text only if supported by the screen.

### `StationRelatedDeliveryContext`

Purpose:

- Provide optional operational context from latest loaded admin delivery rows.

Source:

- Optional `admin_deliveries`.

Columns:

- Delivery ID.
- Direction.
- Delivery status.
- Payment status.
- Latest event time.
- Receiver name.
- Row action.

Direction:

- `Origin` when station is `originStationId`.
- `Destination` when station is `destinationStationId`.
- `Origin and destination` only if both fields equal the station, which should be unusual and treated as an integrity signal.

Rules:

- Header must say `Latest loaded deliveries touching this station`.
- Subtext must say `This is limited to the admin delivery rows currently returned by the backend.`
- Do not show receiver phone or address.
- Do not add delivery actions on this screen.
- Link each row to `AdminDeliveryDetail`.
- If optional delivery context is not loaded, do not show an error by default; show context as unavailable only when the user requested it.

### `StationActionRail`

Purpose:

- Give admins the next safe routes.

Primary actions by state:
| State | Primary action | Route |
| --- | --- | --- |
| Validation blocked | `Review validation evidence` | `/admin/stations/:stationId/validation` |
| Validation in progress | `Continue validation` | `/admin/stations/:stationId/validation` |
| Not started | `Start validation review` | `/admin/stations/:stationId/validation` |
| Operationally paused | `Review station status` | `/admin/stations/:stationId/status` |
| Intake restricted | `Review station status` | `/admin/stations/:stationId/status` |
| Service limited | `Review station services` | `/admin/stations/:stationId/status` |
| Eligible | `Open capacity view` | `/admin/stations/capacity?stationId=:stationId` if supported, otherwise `/admin/stations/capacity` |

Secondary actions:

- `Open launch readiness`
- `Open issue queue`
- `Open capacity`
- `Open audit events`
- `Back to stations`

Rules:

- Hide validation and status owner actions for roles without `override_queue_state`.
- Do not render disabled owner actions as temptation controls.
- Show a read-only explanation for hidden owner actions.
- Keep finance-only actions out of this rail unless a finance route is explicitly supported.

### `StationNotesPanel`

Purpose:

- Show station and validation notes safely.

Fields:

- `station.note`
- `station.validation.note`
- `station.updatedAt`
- `station.validation.updatedAt`
- `station.validation.startedAt`
- `station.validation.completedAt`

Rules:

- Notes are read-only.
- Notes must support wrapping.
- Notes must not be sent to analytics.
- Empty notes show `No note recorded.`
- Timestamps use local display plus machine-readable `datetime`.

### `StationUnavailableState`

Purpose:

- Handle invalid or missing station references.

Invalid station:

- Title: `Station reference is not recognized`
- Body: `This route does not match a configured launch station.`
- Actions: `Back to stations`

Station not found:

- Title: `Station not returned`
- Body: `The station ID is configured, but the station list response did not include it.`
- Actions: `Refresh`, `Back to stations`

Rules:

- Do not call optional context endpoints for invalid station IDs.
- Log route validation error without sensitive data.
- Do not redirect automatically.

## Derived View Model

Build a pure helper:

```text
buildAdminStationDetailView(station, launchReadiness, deliveryRows, role)
```

Output:

- `stationIdentity`
- `primaryReadiness`
- `readinessSeverity`
- `validationEvidence`
- `operationalEvidence`
- `serviceEvidence`
- `launchBlockers`
- `networkContext`
- `pressure`
- `relatedDeliveries`
- `availableActions`
- `hiddenActionReasons`
- `analyticsSafeSummary`

Rules:

- Helper must not perform network calls.
- Helper must not mutate input.
- Helper must not read global auth state directly.
- Helper must keep blocker text and note text out of analytics-safe output.

## Data Loading Strategy

Initial load:

1. Validate route station ID.
2. If invalid, render `invalid_station`.
3. Fetch `admin_stations`.
4. Resolve station.
5. Render primary page as soon as station resolves.
6. Fetch optional launch readiness context in parallel where query framework supports it.
7. Fetch optional delivery context only when the product decides the context table is enabled.

Refresh:

- Refresh `admin_stations`.
- Refresh optional launch context.
- Refresh optional delivery context if enabled.
- Announce refresh completion through accessible status text.

Stale state:

- If data age exceeds admin console stale threshold, show `Station data may be stale`.
- Do not auto-refresh while forms in other owner routes are open.

Failure behavior:

- If `admin_stations` fails, render `api_error`.
- If optional launch readiness fails, keep station data and show `launch_context_unavailable`.
- If optional delivery context fails, keep station data and show delivery context unavailable only in that section.

## Loading State

Show:

- Header skeleton with station ID from route.
- Evidence row skeletons.
- Action rail skeleton.

Do not show:

- Randomized status.
- Assumed station name.
- Assumed readiness.
- Assumed queue counts.

Loading copy:

```text
Loading station record...
```

Accessibility:

- Use `aria-busy=true` on the main region.
- Announce `Loading station record` once.
- Do not repeatedly announce skeleton rows.

## Ready State

The ready state must show:

- Station identity.
- Primary readiness decision.
- Operating and intake state.
- Service availability.
- Validation evidence.
- Backend blocker list.
- Queue and issue pressure.
- Owner actions.
- Optional launch context.
- Optional delivery context.
- Notes and timestamps.

Ready state must not require optional delivery context.

## Empty And Partial States

No blockers:

- Show `No validation blockers returned.`

No related loaded deliveries:

- Show `No loaded admin delivery rows touch this station.`
- Include scope copy explaining the latest-row limit.

No note:

- Show `No note recorded.`

Launch context unavailable:

- Show summary-box notice:

```text
Launch readiness context is unavailable. Station evidence below is still current from the station list endpoint.
```

Delivery context unavailable:

- Show section notice:

```text
Latest delivery context is unavailable. Station readiness and pressure counts still come from the station endpoint.
```

## Error States

### Not Authorized

Cause:

- User lacks admin read access.

UI:

- Show admin auth error.
- Do not show station ID details beyond route text.
- Offer sign-in route.

### Session Expired

Cause:

- Admin token expired.

UI:

- Show session-expired state.
- Preserve route for return after sign-in.

### API Error

Cause:

- `admin_stations` fails.

UI:

- Show request-safe error message.
- Show `Refresh`.
- Show `Back to stations`.

Rules:

- Do not print raw backend payload.
- Do not expose stack traces.
- Do not expose auth tokens.

## Copy System

Tone:

- Direct.
- Operational.
- Calm.
- Evidence-led.

Preferred copy:

- `Station is go-live eligible.`
- `Validation evidence is incomplete.`
- `Station is paused.`
- `Intake is restricted.`
- `Service availability is limited.`
- `Review validation evidence.`
- `Review station status.`
- `Latest loaded delivery context only.`

Avoid:

- Hype.
- Blame.
- Public marketing language.
- Local guesses.
- Long paragraphs inside evidence panels.

## Interaction Rules

Keyboard:

- Breadcrumb links are keyboard reachable.
- Evidence section links are keyboard reachable.
- Action rail buttons are keyboard reachable in visual order.
- Delivery rows support row action buttons rather than full-row click only.

Pointer:

- Row hover states must not be the only affordance.
- Primary actions require visible labels.

Refresh:

- Refresh button uses exact label `Refresh station`.
- While refreshing, keep prior data visible.
- Show timestamp update when refresh completes.

Section navigation:

- Decision strip cells can jump to evidence sections.
- Focus must move to the section heading after jump.

## Accessibility

Landmarks:

- One `main` region.
- Page title as `h1`.
- Major panels as `section` with accessible names.
- Delivery context table has a caption.

Status messages:

- Loading, refreshing, stale, and partial context use polite live regions.
- Error state uses assertive live region only for the main failure.

Color:

- Never rely on color alone.
- Every status includes text.
- Use icons only with text labels.

Focus:

- Visible focus meets WCAG focus appearance guidance.
- Sticky action controls preserve focus order.
- Focus is not trapped on this read-only page.

Tables:

- Delivery context table uses real table headers on desktop.
- Mobile cards repeat labels.
- Row action has delivery-specific accessible name.

Motion:

- Respect `prefers-reduced-motion`.
- No constant animation.

## Privacy And Security

This screen must not expose:

- Receiver phone numbers.
- Receiver addresses.
- Sender profile details.
- Raw payment provider data.
- Raw proof assets.
- Auth tokens.
- Internal stack traces.

Station notes:

- Display to authorized admins.
- Do not send to analytics.
- Do not include in URLs.
- Do not copy into client logs.

Validation blocker text:

- Display to authorized admins.
- Do not send full blocker strings to analytics.
- Use blocker count and code only where possible.

Delivery context:

- Use receiver name only if already present in `admin_deliveries`.
- Do not derive or fetch more personal data.

## Analytics

Events:

- `admin_station_detail_viewed`
- `admin_station_detail_refreshed`
- `admin_station_detail_validation_opened`
- `admin_station_detail_status_opened`
- `admin_station_detail_launch_context_opened`
- `admin_station_detail_issue_queue_opened`
- `admin_station_detail_capacity_opened`
- `admin_station_detail_delivery_opened`
- `admin_station_detail_invalid_station`

Allowed properties:

- `station_id`
- `station_city`
- `readiness_state`
- `validation_status`
- `operating_status`
- `intake_status`
- `service_standard_available`
- `service_express_available`
- `service_doorstep_available`
- `active_queue_count_bucket`
- `issue_count_bucket`
- `validation_blocker_count`
- `role`
- `launch_context_available`
- `delivery_context_available`

Forbidden properties:

- Station note text.
- Validation note text.
- Blocker message text.
- Receiver name.
- Delivery IDs from related table unless product analytics policy later allows object IDs.
- Auth details.

Count buckets:

- `0`
- `1-5`
- `6-20`
- `21+`

## Performance

Targets:

- Initial meaningful station evidence within `1500ms` on normal admin network.
- Primary station data should not wait for optional delivery context.
- Render all v1 station data without virtualization.
- Delivery context table should cap visible rows to a small operational count, such as `10`, with link to delivery explorer if broader route exists.

Rules:

- Do not poll by default.
- Do not fetch optional delivery context on every focus unless the admin explicitly refreshes.
- Cache `admin_stations` consistently with station list screen.
- Invalidate station list cache after owner validation or status flow succeeds.
- Avoid expensive client-side joins beyond loaded arrays.

## Responsive Behavior

Desktop:

- Header plus sticky right action rail.
- Evidence grid in two columns.
- Delivery context table.

Tablet:

- Action rail becomes horizontal action panel.
- Evidence grid remains two columns where readable.
- Delivery table stays compact.

Mobile:

- Single-column sections.
- Primary action sticky at bottom.
- Delivery context cards.
- All metrics include labels.
- Blocker text wraps.
- Notes wrap.

Mobile constraints:

- Do not hide blockers behind tabs.
- Do not require horizontal scrolling for core evidence.
- Keep touch targets at least `44px`.

## Testing Requirements

Unit tests:

- Route station ID validation.
- Station resolution from `admin_stations`.
- Invalid station state.
- Station not found state.
- Primary readiness derivation.
- Validation evidence progress derivation.
- Service availability derivation.
- Launch blocker filtering by station.
- Network blocker grouping.
- Related delivery filtering by origin and destination.
- Role action visibility.
- Analytics sanitizer.

Integration tests:

- Loads station from `admin_stations`.
- Renders station identity and city.
- Shows go-live eligible state.
- Shows validation blocked state.
- Shows operating paused state.
- Shows intake restricted state.
- Shows service-limited state.
- Shows backend blockers.
- Shows empty blocker state.
- Shows launch context when available.
- Handles launch context failure.
- Shows delivery context when enabled.
- Handles delivery context failure.
- Hides mutation owner actions for `support_admin`.
- Hides mutation owner actions for `finance_admin`.
- Shows mutation owner actions for `ops_admin`.
- Shows mutation owner actions for `super_admin`.
- Routes validation action correctly.
- Routes status action correctly.

Accessibility tests:

- Page has one `h1`.
- Main region has expected test id.
- Loading state sets `aria-busy`.
- Refresh completion is announced.
- Decision strip links have accessible names.
- Validation checklist status is readable without color.
- Delivery context table has headers and caption.
- Mobile delivery cards repeat labels.
- Focus moves to section headings for decision-strip jumps.
- Sticky action group preserves keyboard order.

Visual regression states:

- Eligible station.
- Validation blocked station.
- Validation in progress station.
- Not-started station.
- Paused station.
- Restricted intake station.
- Service-limited station.
- Launch context unavailable.
- Delivery context unavailable.
- Invalid station.
- Station not found.
- Mobile blocked station.
- Mobile eligible station.

## Implementation Checklist

- Create route `/admin/stations/:stationId`.
- Use protected admin shell.
- Validate route `stationId`.
- Fetch `admin_stations`.
- Resolve station by exact ID.
- Render invalid station state before optional context calls.
- Render station not found state when list does not include known ID.
- Build pure station detail view helper.
- Build readiness decision strip.
- Build validation evidence panel.
- Build operational state panel.
- Build launch context panel.
- Build pressure panel.
- Build optional delivery context panel.
- Build role-safe action rail.
- Add notes and timestamp panel.
- Add refresh behavior.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Inline station status mutation.
- Inline station validation mutation.
- Inline service enablement.
- Local readiness scoring.
- Complete station queue ledger.
- Complete station issue ledger.
- Staff roster.
- Station map.
- Public station availability page.
- Receiver phone reveal.
- Receiver address reveal.
- Raw payment context.
- Raw proof assets.
- Route based on unsupported station query params.
- Background polling.

## Acceptance Criteria

The screen is complete when:

- `/admin/stations/:stationId` renders with test id `screen-admin-station-detail`.
- It validates route station IDs.
- It resolves station data from `admin_stations`.
- It shows station identity, status, service availability, queue count, issue count, validation evidence, blockers, notes, and timestamps.
- It uses `validation.goLiveEligible` as readiness authority.
- It handles optional launch readiness context without blocking station data.
- It labels delivery context as latest loaded context if used.
- It hides mutation owner actions from roles without `override_queue_state`.
- It routes station validation work to `/admin/stations/:stationId/validation`.
- It routes station status work to `/admin/stations/:stationId/status`.
- It does not mutate station data directly.
- It does not invent station issue or queue details.
- It protects notes and blocker text from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminStationDetail` as a serious read-only station command detail for `/admin/stations/:stationId`. Resolve the station from `admin_stations`, use optional launch readiness and latest delivery context only as enrichment, show validation and operational evidence precisely, route mutations to dedicated owner screens, and keep unsupported queue, issue, staff, and audit details out of the page.
