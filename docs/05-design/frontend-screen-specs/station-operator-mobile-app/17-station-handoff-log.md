# Station Handoff Log Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationHandoffLog` |
| App | `apps/mobile` |
| Route | `/(ops)/station/handoffs` |
| Primary test ID | `screen-station-handoff-log` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery_timeline`, `get_delivery`, `deliveryTimelineResponseSchema`, `deliveryTimelineEntrySchema`, local station handoff cache |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/intake`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading_cache`, `ready_cached`, `ready_live_detail`, `empty_cache`, `offline_cached`, `stale_cache`, `refreshing`, `timeline_loading`, `timeline_ready`, `timeline_empty`, `partial_timeline`, `missing_handoff_evidence`, `conflict_detected`, `issue_present`, `search_active`, `search_empty`, `not_found`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen gives station operators a station-scoped, read-only handoff evidence log so they can quickly review package custody activity that touched their station.

The screen answers one operational question: `Which custody handoffs touched this station, and what evidence exists for each one?`

The station operator should be able to:
- See recent handoff evidence cached for the signed-in station.
- Search by tracking code or delivery ID.
- Open a delivery timeline for one package.
- Distinguish delivery events, handoff events, and issue events.
- See proof type and condition when the timeline exposes them.
- See missing, partial, stale, or conflicting evidence warnings.
- Open the shared custody chain for full delivery-level evidence.
- Open an issue route when evidence is missing or disputed.
- Use cached handoff evidence offline with clear stale warnings.
- Understand that this screen is read-only and cannot repair custody records.

This screen is not:
- A custody mutation screen.
- A scan workflow.
- A proof upload workflow.
- A station queue.
- A full admin audit console.
- A cross-network reporting dashboard.
- A raw database event browser.
- A place to expose raw proof references or raw actor IDs.
- A way to override handoff records.
- A substitute for the shared `OpsCustodyChain` screen when one delivery needs deep review.

## Audience
Primary audience:
- Station operators checking recent custody evidence.
- Station leads looking for handoff anomalies during a shift.

Secondary audience:
- Claude Code implementing the station handoff log.
- QA validating read-only evidence states and cache behavior.
- Backend engineers validating station aggregate endpoint gaps.
- Operations leads validating accountability and loss prevention.
- Accessibility reviewers validating timeline navigation and status messaging.

## User State
The station operator is usually checking this screen because a package, driver, courier, sender, or receiver created uncertainty. The operator needs quick station-level context first, then delivery-level evidence when needed.

The user may be:
- Coming from `StationOverview`.
- Investigating a duplicate scan or scan mismatch.
- Checking whether a destination receipt handoff was recorded.
- Checking whether courier acceptance created the final-mile custody handoff.
- Working offline after opening several delivery timelines earlier.
- Looking for a package by tracking code.
- Reviewing a shift handoff before leaving the station.
- Preparing to escalate a missing, damaged, or disputed package.

The screen must:
- Scope all visible log rows to the signed-in station.
- Show current cache freshness.
- Treat `get_delivery_timeline` as delivery-level evidence, not as a station-wide feed.
- Show station-wide live coverage as unavailable until backend supplies an aggregate endpoint.
- Never create, edit, reorder, or delete handoff records.
- Never display raw actor IDs or raw proof references in normal UI.
- Never claim that cached evidence is complete when it may be partial.

## Backend Contract
Existing backend facts:
- `get_delivery_timeline` exists at `GET /v1/deliveries/:id/timeline`.
- `get_delivery_timeline` returns `deliveryTimelineResponseSchema`.
- `deliveryTimelineResponseSchema` includes `deliveryId`, `trackingCode`, and `entries`.
- Timeline entries have `entryId`, `entryType`, `occurredAt`, `label`, optional `actorId`, optional `actorRole`, optional `stationId`, and optional `metadata`.
- `entryType` is one of `delivery_event`, `handoff_event`, or `issue_event`.
- Handoff timeline entries expose metadata with `proofType`, `proofReference`, and optional `condition`.
- Issue timeline entries expose metadata with `severity`, `category`, and `summary`.
- Delivery events expose metadata when available.
- Timeline entries are sorted newest first by backend.
- `get_delivery` exists and returns current delivery state for one delivery.
- Access is governed by delivery access rules; station operators can access deliveries touching their station.

Known handoff event types in backend:
- `sender_to_origin_station`
- `origin_station_to_driver`
- `driver_to_destination_station`
- `destination_station_to_final_mile_courier`
- `final_mile_courier_to_destination_station`
- `delivery_completion`

Current backend gap:
- No station-wide handoff log endpoint exists.
- No endpoint exists for `GET /v1/station/handoffs`.
- No timeline search endpoint exists by tracking code from this route.
- No list endpoint returns handoff event rows directly.
- No backend field marks whether a timeline row is station-visible, beyond `stationId` on entries and access rules.
- No backend aggregate count exists for missing handoff evidence by station.

Current buildable mode:
- Use local station handoff cache populated when station workflows fetch delivery details and timelines.
- Allow search against locally cached tracking codes and delivery IDs.
- Allow opening a specific delivery from cached rows to fetch fresh `get_delivery` and `get_delivery_timeline`.
- If no cache exists, show `empty_cache` and route to station queues or delivery search surfaces that can identify a delivery.
- Do not attempt to call `get_delivery_timeline` without a delivery ID.
- Do not fetch timelines for every station delivery on screen open.

Production-ready recommendation:
- Add `GET /v1/station/handoffs?stationId=&from=&to=&limit=&cursor=`.
- Return redacted station-scoped handoff rows with tracking code, handoff type, delivery ID, occurredAt, station ID, proof type, condition, and issue flags.
- Add station-scoped search by tracking code.
- Add handoff confidence indicators server-side.
- Add pagination and date filters for shift review.
- Add export through admin console, not station mobile.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product promises beyond current backend:
- GS1 traceability standards describe critical tracking events and key data elements for objects moving through supply chains.
- GS1 EPCIS describes event data for what, when, where, why, and how products or assets move, including chain of custody visibility.
- GS1 Global Traceability Standard frames visibility event data as records of business process steps with object, time, location, and business context.
- NIST SP 800-92 frames log management as a discipline for developing, implementing, and maintaining effective event log practices.
- Android offline-first guidance says critical apps should present local data immediately and support reads without reliable network access.
- W3C status message guidance requires important status changes to be programmatically available without forcing focus.
- W3C target size guidance requires interactive targets to be at least `24 by 24 CSS pixels` or sufficiently spaced.

Reference links:
- [GS1 traceability standards](https://www.gs1.org/standards/traceability)
- [GS1 EPCIS and CBV](https://www.gs1.org/standards/epcis)
- [GS1 Global Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard)
- [NIST SP 800-92 log management](https://csrc.nist.gov/pubs/sp/800/92/final)
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## Screen Thesis
The screen should feel like a station custody ledger: calm, chronological, filtered to the station, and strict about evidence confidence.

The operator should understand in three seconds:
- Whether the log is live, cached, empty, or stale.
- Which handoffs recently touched the station.
- Which rows have complete evidence.
- Which rows need custody-chain or issue review.
- How to open one delivery for full evidence.

Visual thesis:
- Use a ledger-style mobile surface with clear time grouping, strong evidence status, and restrained warning treatment.
- Make the page practical for a station counter, not a legal archive.
- Keep each row scannable while preserving enough context for loss prevention.

Restraint rule:
- Do not build a database table on mobile. Show enough to route the operator to the right evidence action.

## Information Architecture
Top-level layout:
1. Header.
2. Data source banner.
3. Handoff confidence summary.
4. Search and filters.
5. Time-grouped handoff rows.
6. Selected delivery timeline drawer or route.
7. Empty, stale, offline, or partial states.

Header:
- Title: `Handoff log`
- Subtitle: station code and current shift date.
- Right action: refresh cache.
- Overflow actions: open custody chain by delivery, support, offline outbox.

Data source banner:
- `Cached station evidence`
- `Live delivery timeline`
- `Offline`
- `Stale`
- `Station feed unavailable`

Handoff confidence summary:
- `Verified`: handoff rows with handoff event and proof type.
- `Partial`: delivery event exists but handoff event or proof metadata is missing.
- `Issue`: issue event exists in the timeline.
- `Stale`: cache older than threshold.

Search and filters:
- Search input for tracking code or delivery ID.
- Filter chips:
  - `All`
  - `Intake`
  - `Driver pickup`
  - `Destination receipt`
  - `Final-mile`
  - `Issues`
  - `Missing evidence`
- Date selector:
  - `Today`
  - `Yesterday`
  - `Last 7 days`
  - Future custom date range when station feed endpoint exists.

Row groups:
- `Today`
- `Yesterday`
- `Older`
- Use local station timezone when available; otherwise use `Africa/Accra`.

## Data Model
Station handoff cache row:
- `cacheRowId`
- `deliveryId`
- `trackingCode`
- `stationId`
- `handoffType`
- `entryType`
- `entryId`
- `occurredAt`
- `label`
- `proofType`
- `condition`
- `actorRole`
- `issueSeverity`
- `issueCategory`
- `issueSummary`
- `source`
- `fetchedAt`
- `isPartial`
- `isConflict`
- `isStale`

Allowed cache sources:
- `StationPackageIntake`
- `StationDispatchReadiness`
- `StationDriverPickupScan`
- `StationDestinationReceipt`
- `StationFinalMileAssignment`
- `StationFinalMileQueue`
- `OpsDeliveryDetail`
- `OpsCustodyChain`
- `OpsActionRecovery`
- `OpsOfflineOutbox`

Cache storage rules:
- Scope rows by signed-in station ID.
- Store only station-visible rows.
- Store only timeline fields needed for display.
- Store no receiver phone.
- Store no full receiver address.
- Store no raw proof reference in normal log cache.
- Store no raw actor ID in normal log cache.
- Clear cache on sign out.
- Keep cache bounded by row count and age.

Timeline-to-log mapping:
- `handoff_event` rows become primary handoff rows.
- `delivery_event` rows can support context rows when no matching handoff row exists.
- `issue_event` rows become warning rows attached to the delivery.
- Rows with `stationId` matching signed-in station are directly station-scoped.
- Rows without `stationId` can be included only if delivery detail confirms the delivery touches signed-in station.

Proof metadata handling:
- Show `proofType`.
- Show `condition` when exposed.
- Do not show `proofReference` in normal row UI.
- Route to custody chain for deeper proof context.
- If `proofReference` is needed for support, only support/admin routes should expose it according to their own specs.

## Data Loading Model
Initial load:
1. Read local station handoff cache.
2. Render cached rows immediately.
3. Mark rows with `fetchedAt` and stale state.
4. Do not fetch every possible delivery timeline.
5. Offer refresh for rows that have delivery IDs.
6. If station aggregate endpoint exists in future, use it as the live source and refresh cache.

Refresh behavior with current backend:
- Refresh selected row: call `get_delivery` and `get_delivery_timeline` for that delivery.
- Refresh visible cached rows: optional sequential refresh with strict limit, not automatic bulk fan-out.
- Pull-to-refresh should refresh only the most recent safe number of cached delivery IDs.
- If a row fails refresh, preserve cached row and mark partial.

Recommended safe refresh limits:
- Active row: always allowed online.
- Visible rows: max `10` delivery timelines per manual refresh.
- Background refresh: disabled until station aggregate endpoint exists.

Offline behavior:
- Show cached rows.
- Show last cache update.
- Allow search and filtering.
- Allow opening cached delivery evidence summary.
- Do not claim evidence is live.
- Do not create issues offline from this screen unless the shared issue route handles its own outbox.

Staleness rules:
- `fresh`: fetched under `5 minutes` ago.
- `aging`: fetched `5` to `30 minutes` ago.
- `stale`: fetched over `30 minutes` ago.
- `archive`: fetched over `24 hours` ago.

## Evidence Confidence Rules
Verified handoff:
- Timeline has `entryType=handoff_event`.
- Row has `handoffType` label.
- Row has `occurredAt`.
- Row has station scope or confirmed delivery station relationship.
- Metadata includes `proofType`.

Partial handoff:
- Delivery lifecycle event suggests a handoff should exist.
- Matching handoff event is missing in cached timeline.
- Timeline fetch failed after detail loaded.
- Metadata lacks proof type.
- Event has no station context and delivery detail was unavailable.

Issue handoff:
- Timeline includes `issue_event`.
- Issue category is `handoff`, `loss`, `damage`, `delay`, or another operational blocker.
- Issue severity is `p1` or `p2`.

Conflict:
- Current delivery detail contradicts latest cached handoff row.
- Cached row says station has custody but detail says driver or courier has custody without expected handoff evidence.
- Cached row says assignment exists but current status returned to queue after failed attempt.
- Timeline order contains impossible sequence according to state machine.

Stale:
- Cache row is older than threshold.
- Device is offline.
- Last refresh failed.

Unknown:
- Row was created from partial local state.
- Backend timeline did not expose enough metadata to classify.

## Handoff Types And Copy
`sender_to_origin_station`:
- Label: `Sender to origin station`
- Meaning: sender package was received at origin station.
- Primary route: custody chain.
- Risk if missing: origin intake proof missing.

`origin_station_to_driver`:
- Label: `Origin station to driver`
- Meaning: assigned driver scanned and accepted package custody.
- Primary route: custody chain.
- Risk if missing: driver pickup not proven.

`driver_to_destination_station`:
- Label: `Driver to destination station`
- Meaning: destination station received the package from driver.
- Primary route: destination receipt or custody chain.
- Risk if missing: destination receipt not proven.

`destination_station_to_final_mile_courier`:
- Label: `Destination station to courier`
- Meaning: assigned courier scanned and accepted final-mile custody.
- Primary route: final-mile queue or custody chain.
- Risk if missing: courier has not accepted custody.

`final_mile_courier_to_destination_station`:
- Label: `Courier returned to station`
- Meaning: courier returned package after failed attempt or issue path.
- Primary route: blocked queue or custody chain.
- Risk if missing: return handoff not proven.

`delivery_completion`:
- Label: `Delivery completed`
- Meaning: final proof closed package custody.
- Primary route: delivery detail or custody chain.
- Risk if missing: completion proof not proven.

## Row Content
Every handoff row must show:
- Handoff label.
- Tracking code.
- Occurred time.
- Evidence state.
- Proof type when exposed.
- Condition when exposed.
- Station code when useful.
- Actor role, not raw actor ID.
- Primary action.

Primary action by row:
- Verified: `Open custody`
- Partial: `Review evidence`
- Missing: `Report issue`
- Issue: `Open issue`
- Stale: `Refresh`
- Conflict: `Review conflict`

Secondary row actions:
- `View delivery`
- `Open support`
- `Copy tracking code`

Do not show:
- Raw actor IDs.
- Raw proof references.
- Receiver phone.
- Full receiver address.
- Courier phone.
- Full internal metadata object.
- Backend stack traces.

## Interaction Model
Default flow:
1. Operator opens handoff log.
2. App renders local cache.
3. Operator sees data source banner and freshness.
4. Operator searches or filters.
5. Operator taps one row.
6. App fetches fresh delivery detail and timeline if online.
7. App opens custody chain or shows row detail drawer.

Search flow:
1. Operator enters tracking code or delivery ID.
2. App searches local cache.
3. If match exists, show matched row.
4. If no match exists, show `search_empty`.
5. Offer routes to relevant station queues or delivery detail lookup if available.

Offline flow:
1. Operator opens screen offline.
2. App shows cached rows with offline banner.
3. Operator can filter and open cached row detail.
4. Refresh and live timeline fetch are disabled.
5. UI prompts retry when network returns.

Missing evidence flow:
1. Row shows partial or missing evidence.
2. Operator opens row.
3. App tries fresh timeline fetch.
4. If still missing, route to `OpsIssueCreate` with delivery context.
5. The issue route owns any backend mutation or outbox.

Conflict flow:
1. Cached row conflicts with fresh delivery detail.
2. App shows conflict sheet.
3. Sheet explains what changed.
4. Primary action opens custody chain.
5. Secondary action opens support.

## Visual Design Requirements
The screen must feel like a trustworthy operating log, not a decorative timeline.

Layout:
- Header and data source banner stay visible above the list.
- Confidence summary appears above filters.
- Search is prominent but compact.
- Rows are grouped by date.
- Row density should support quick shift review.
- Row detail should open in a bottom sheet or route to custody chain.

Color:
- Neutral for regular log rows.
- Green for verified evidence.
- Amber for partial or stale evidence.
- Red for conflict or missing critical evidence.
- Blue or brand accent for selected filter and primary action.
- Do not rely on color without text.

Typography:
- Handoff type is the row title.
- Tracking code is highly visible.
- Time and station are secondary.
- Evidence state is short and plain.
- Avoid long explanatory paragraphs inside list rows.

Touch:
- Row tap target must be large enough for station use.
- Compact action icons need text alternatives or visible labels.
- Filter chips need enough spacing.
- Pull-to-refresh must have visible refresh control alternative.

Motion:
- Use subtle row refresh state only.
- No looping animation.
- No dramatic timeline motion.
- Respect reduced motion.

## Components
Required components:
- `OpsScreenScaffold`
- `StationHandoffHeader`
- `HandoffDataSourceBanner`
- `HandoffConfidenceSummary`
- `HandoffSearchField`
- `HandoffFilterChips`
- `HandoffDateGroup`
- `HandoffLogRow`
- `HandoffEvidenceStateChip`
- `HandoffRowActions`
- `HandoffDetailDrawer`
- `MissingEvidenceCallout`
- `ConflictEvidenceSheet`
- `OfflineEvidenceBanner`
- `StaleEvidenceBanner`
- `HandoffEmptyState`
- `AccessibleStatusAnnouncer`

Component contracts:
- `HandoffLogRow` receives station-safe row DTO only.
- `HandoffLogRow` never receives raw actor ID or proof reference.
- `HandoffDetailDrawer` can show proof type, condition, role, station, and timestamps.
- `ConflictEvidenceSheet` receives current detail summary and cached row summary.
- `HandoffConfidenceSummary` receives counts only.
- `AccessibleStatusAnnouncer` announces refresh, offline, stale, missing evidence, and conflict states.

## State Machine
Initial:
- `loading_cache` when local cache read is in progress.
- `empty_cache` when no handoff rows exist for this station.
- `ready_cached` when cached rows render.

Live detail:
- `timeline_loading` when one row is refreshing.
- `timeline_ready` when fresh timeline is available for a selected delivery.
- `timeline_empty` when timeline returns no entries.
- `ready_live_detail` when selected row is backed by fresh detail and timeline.

Offline and stale:
- `offline_cached` when cache renders without network.
- `stale_cache` when cache is older than threshold.
- `refreshing` when a row or visible group is refreshing.

Evidence states:
- `partial_timeline` when detail or timeline is missing.
- `missing_handoff_evidence` when expected handoff is absent.
- `conflict_detected` when detail and timeline disagree.
- `issue_present` when timeline includes issue evidence.

Search:
- `search_active` while query is non-empty.
- `search_empty` when no cached row matches query.

Errors:
- `not_found` when selected delivery no longer exists or is inaccessible.
- `not_authorized` when station scope denies access.
- `session_expired` when auth refresh fails.
- `api_error` when network or server fails.
- `rate_limited` when fetch is throttled.

## Empty States
No cached handoffs:
- Title: `No handoffs saved on this device`
- Body: `Open package workflows or custody chains to build the station handoff cache. A live station-wide feed needs backend support.`
- Primary action: `Open station overview`
- Secondary action: `Open support`

Search empty:
- Title: `No matching handoff`
- Body: `This device has no saved handoff for that tracking code. Check the package queue or delivery detail.`
- Primary action: `Clear search`
- Secondary action: `Open overview`

Timeline empty:
- Title: `No timeline entries`
- Body: `The backend returned no events for this delivery. Review support before acting on custody.`
- Primary action: `Open support`
- Secondary action: `Back to log`

Offline empty:
- Title: `No offline handoff log`
- Body: `Connect once and open handoff evidence before this device can show saved rows offline.`
- Primary action: `Retry when online`

## Error And Recovery Copy
Network failure:
- Title: `Could not refresh handoff`
- Body: `Saved evidence remains visible. Refresh before relying on this row for a custody decision.`
- Action: `Retry`

Stale cache:
- Title: `Evidence may be old`
- Body: `This handoff row was saved more than 30 minutes ago. Refresh before releasing or receiving a package.`
- Action: `Refresh`

Missing evidence:
- Title: `Handoff evidence missing`
- Body: `The expected handoff record is not visible in this timeline. Open custody chain or report an issue.`
- Action: `Open custody`

Conflict:
- Title: `Evidence conflict`
- Body: `Current delivery state does not match the saved handoff row. Review custody chain before acting.`
- Action: `Open custody`

Unauthorized:
- Title: `You cannot view this handoff`
- Body: `This delivery is outside your station scope or your session no longer has access.`
- Action: `Go back`

Rate limited:
- Title: `Too many refresh attempts`
- Body: `Wait a moment, then try again.`
- Action: `Retry later`

## Privacy And Safety
Privacy rules:
- Do not show receiver phone.
- Do not show full receiver address.
- Do not show courier phone.
- Do not show raw actor IDs in normal UI.
- Do not show raw proof references in normal UI.
- Do not write raw proof references to station handoff cache.
- Do not send raw actor IDs or proof references to analytics.
- Do not expose internal metadata object dumps.

Safety rules:
- Always label cached evidence.
- Always label partial evidence.
- Always route missing or conflicting evidence to custody chain or issue route.
- Never let this screen mutate custody.
- Never hide issue rows from evidence confidence.
- Never treat final-mile assignment as custody transfer.
- Never treat a delivery event as a handoff event when handoff evidence is absent.

## Offline And Sync
Offline-critical scope is read access.

Allowed offline behavior:
- Read cached station handoff rows.
- Search cached rows.
- Filter cached rows.
- Open cached row detail.
- Open offline outbox.

Forbidden offline behavior:
- Do not create handoff records.
- Do not edit timeline rows.
- Do not mark evidence verified from local state.
- Do not generate local proof references.
- Do not sync a station-wide handoff feed because no backend endpoint exists.

Cache invalidation:
- Refresh row after any station custody mutation succeeds.
- Refresh row when returning from custody chain.
- Remove rows for signed-out user.
- Mark rows stale after threshold, do not delete immediately.

## Accessibility Requirements
Screen reader:
- Announce data source banner.
- Announce evidence state on each row.
- Announce refresh completion and failure.
- Announce stale and offline state changes.
- Make tracking code readable in a useful format.

Keyboard and switch control:
- Search, filters, rows, and row actions must be reachable in predictable order.
- Row primary action must be separate from row expansion when possible.
- Pull-to-refresh must have a visible button alternative.

Visual accessibility:
- Evidence state must use text and icon, not color alone.
- Text contrast must meet WCAG AA.
- Large text must not hide evidence state or action.
- Focus state must remain visible on sticky header controls.

Touch:
- Row actions must meet native touch target guidance.
- Compact disclosure controls must meet WCAG minimum size or spacing.

Reduced motion:
- Disable animated timeline movement.
- Keep status and refresh messages visible in text.

## Analytics And Audit
Allowed analytics events:
- `station_handoff_log_opened`
- `station_handoff_log_cache_loaded`
- `station_handoff_log_refresh_started`
- `station_handoff_log_refresh_succeeded`
- `station_handoff_log_refresh_failed`
- `station_handoff_log_search_changed`
- `station_handoff_log_filter_changed`
- `station_handoff_log_row_opened`
- `station_handoff_log_custody_opened`
- `station_handoff_log_issue_opened`
- `station_handoff_log_conflict_seen`

Allowed analytics properties:
- `stationId`
- `rowCount`
- `cacheAgeSeconds`
- `networkState`
- `activeFilter`
- `deliveryId`
- `entryType`
- `handoffType`
- `evidenceState`
- `source`

Forbidden analytics properties:
- Receiver phone.
- Receiver full address.
- Raw actor ID.
- Raw proof reference.
- Raw metadata object.
- Package scan code.
- Courier phone.

Audit note:
- Viewing this screen is not a custody audit event.
- Backend delivery and handoff events remain the source of truth.
- Issue creation, scan, and custody mutations are logged by their own backend workflows.

## Navigation Rules
Entry points:
- `StationOverview` handoff log action.
- `StationPackageIntake` after intake evidence.
- `StationDispatchReadiness` after dispatch evidence.
- `StationDestinationReceipt` after receipt evidence.
- `StationFinalMileQueue` assigned monitoring.
- `OpsActionRecovery` after a failed queued action.
- `OpsDeliveryDetail` custody summary.
- `OpsCustodyChain` return path.

Exit routes:
- `/(ops)/station/overview`
- `/(ops)/deliveries/:deliveryId`
- `/(ops)/deliveries/:deliveryId/custody`
- `/(ops)/deliveries/:deliveryId/issues/new`
- `/(ops)/offline-outbox`
- `/(ops)/station/support`

Back behavior:
- Back from row detail returns to same filter and search.
- Back from custody chain refreshes that delivery row if online.
- Back from issue route marks row as issue-present if new issue is visible.
- App restart restores last filter only when cache exists.

## QA Acceptance Criteria
Functional:
- Route renders root test ID `screen-station-handoff-log`.
- Screen reads local station handoff cache on open.
- Screen does not call `get_delivery_timeline` without a delivery ID.
- Screen does not fetch all timelines on open.
- Row refresh calls `get_delivery` and `get_delivery_timeline` for one delivery.
- Cached rows show freshness.
- Offline cached state is visible.
- Missing evidence routes to custody chain or issue route.
- Conflict state routes to custody chain.
- No mutation endpoint is called from this screen.
- No raw actor ID is shown in normal UI.
- No raw proof reference is shown in normal UI.

Privacy:
- Receiver phone is not displayed.
- Full address is not displayed.
- Raw proof reference is not cached for normal log rows.
- Analytics excludes raw actor IDs and proof references.

Accessibility:
- Data source state is announced.
- Evidence state is announced per row.
- Refresh status is announced.
- Search has a visible label.
- Filter chips are reachable and sufficiently sized.
- Large text preserves row meaning.

Visual:
- First viewport shows title, data source, confidence summary, and at least one row or a precise empty state.
- Stale and offline states are obvious.
- Evidence states are clear without visual clutter.
- Row density supports station shift review.

## Implementation Notes For Claude Code
Build this as a read-only station evidence surface:
- Create route `/(ops)/station/handoffs`.
- Use root test ID `screen-station-handoff-log`.
- Build a station-scoped local handoff cache if one does not already exist.
- Populate cache from delivery timelines fetched by existing station and shared ops screens.
- Keep cache DTOs narrow and redacted.
- Do not call mutation hooks from this screen.
- Do not call admin audit endpoints.
- Use `get_delivery` and `get_delivery_timeline` only for selected delivery refresh.
- Route full review to `OpsCustodyChain`.
- Route issue creation to `OpsIssueCreate`.
- Clearly show current backend gap for live station-wide feed in empty/cache copy.

Recommended component test IDs:
- `station-handoff-log-header`
- `station-handoff-data-source-banner`
- `station-handoff-confidence-summary`
- `station-handoff-search`
- `station-handoff-filter-chip`
- `station-handoff-date-group`
- `station-handoff-row`
- `station-handoff-row-open-custody`
- `station-handoff-row-open-issue`
- `station-handoff-detail-drawer`
- `station-handoff-offline-banner`
- `station-handoff-stale-banner`
- `station-handoff-conflict-sheet`
- `station-handoff-empty`

## Open Backend Follow-Ups
The current screen is useful as a cached station evidence surface, but a complete station handoff log needs backend support:
- Add station-wide handoff feed endpoint.
- Add station-scoped tracking code search.
- Add backend handoff confidence classification.
- Add pagination and date filters.
- Add redacted actor display names for station view.
- Add issue flags directly to station handoff rows.
- Add server-side export only in admin console.
- Add alerting for missing critical handoff evidence.

## Completion Standard
This spec is complete when Claude Code can build the screen without adding product policy:
- Route and test ID are explicit.
- Current backend limitation is explicit.
- Local cache behavior is explicit.
- Timeline use is explicit.
- Read-only boundary is explicit.
- Privacy boundaries are explicit.
- Offline behavior is explicit.
- Evidence confidence rules are explicit.
- QA checks are explicit.
