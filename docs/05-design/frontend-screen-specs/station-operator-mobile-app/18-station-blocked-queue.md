# Station Blocked Queue Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationBlockedQueue` |
| App | `apps/mobile` |
| Route | `/(ops)/station/blocked` |
| Primary test ID | `screen-station-blocked-queue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, `list_issues`, `issueListQuerySchema`, `issueListResponseSchema`, local offline action blocker cache |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/station/handoffs`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `loading_cache`, `ready`, `ready_partial`, `ready_cached`, `empty`, `offline_cached`, `stale_cache`, `refreshing`, `search_active`, `search_empty`, `filter_active`, `issue_linked`, `payment_blocked`, `custody_blocked`, `scan_blocked`, `status_blocked`, `local_sync_blocked`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen gives station operators one controlled place to find packages that cannot continue through station work because a blocker exists.

The screen answers one operational question: `Which station packages are blocked, why are they blocked, and where should I go to clear the blocker safely?`

The station operator should be able to:
- See blocked packages touching the signed-in station.
- Separate issue, payment, custody, scan, status, hold, and local sync blockers.
- See the highest-risk blocked packages first.
- Open delivery detail for context.
- Open custody chain for handoff evidence.
- Open the issue creation route when no issue exists yet.
- Open the existing issue route or support route when issue data exists.
- Open the offline outbox when the blocker came from a failed local action.
- Understand whether rows are live, cached, stale, or locally derived.
- Work from cached blocked data offline without believing a blocker is resolved.
- Avoid unsafe resolution, override, or custody mutation from this queue.

This screen is not:
- An issue resolution screen.
- A support-admin escalation console.
- A payment verification screen.
- A custody mutation screen.
- A scan workflow.
- A delivery status override.
- A refund or dispute decision screen.
- A station-wide admin analytics page.
- A cross-station blocked package browser.
- A place to display raw proof references, raw scan codes, receiver phone, receiver address, or internal stack details.

## Audience
Primary audience:
- Station operators clearing station workflow blockers.
- Station leads checking whether packages are stuck during a shift.
- Operators coming from outbound, inbound, final-mile, handoff log, or offline outbox warnings.

Secondary audience:
- Claude Code implementing the blocked queue.
- QA validating blocker classification and offline behavior.
- Backend engineers validating endpoint gaps.
- Operations leads validating station loss-prevention rules.
- Security reviewers validating station-scope and redaction boundaries.
- Accessibility reviewers validating status, filter, and recovery messaging.

## User State
The operator is likely under operational pressure. A package is at a station, a sender or receiver may be waiting, and staff need a clear route to the right resolution surface without guessing.

The user may be:
- Investigating why a station queue row disappeared from normal work.
- Seeing `issue_reported` after destination receipt or condition check.
- Seeing `on_hold` after pickup aging or policy hold.
- Recovering from `PAYMENT_REQUIRED`.
- Recovering from `INVALID_STATUS_TRANSITION`.
- Investigating `PACKAGE_SCAN_MISMATCH`.
- Investigating repeated scan handling or an already received package.
- Checking local offline actions that failed replay.
- Looking for packages that need support before handoff continues.
- Working with weak network during a shift.

The screen must:
- Anchor every row to the authenticated station scope.
- Treat live backend data and local blocker data as different source classes.
- Make the blocker reason more prominent than decorative status labels.
- Route the user to safe recovery surfaces.
- Keep issue creation separate from issue resolution.
- Keep custody review separate from custody mutation.
- Keep payment visibility separate from finance authority.
- Preserve enough evidence context to prevent loss without exposing sensitive fields.
- Avoid implying that a blocked package can be cleared locally when backend or support must decide.

## Backend Contract
Existing delivery list operation:
- `list_deliveries`
- Method: `GET`
- Contract route: `/v1/deliveries`
- Query supports `status`, `paymentStatus`, and `limit`.
- `limit` is a positive integer with maximum `100`.
- Response returns `deliveries`.

Delivery list row fields:
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

Existing issue list operation:
- `list_issues`
- Method: `GET`
- Contract route: `/v1/issues`
- Query supports `deliveryId`, `status`, `severity`, and `limit`.
- Response returns `issues`.

Issue row fields:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description` when present
- `reporter.actorId`
- `reporter.actorRole`
- escalation fields when present
- resolution fields when present
- `createdAt`
- `updatedAt`

Issue enums:
- Status: `open`, `in_review`, `escalated`, `resolved`, `closed`.
- Severity: `p1`, `p2`, `p3`.
- Category: `delay`, `damage`, `loss`, `payment`, `handoff`, `other`.

Delivery statuses that define the direct blocked set:
- `issue_reported`
- `on_hold`
- `delivery_failed` only when current station still needs support visibility; the default list should not mix terminal failure with active blockers unless the backend returns a local station task.

State-machine facts:
- `issue_reported` can transition back to `awaiting_receiver_pickup` or `awaiting_final_mile_assignment`, or to `delivery_failed`.
- `on_hold` can transition back to `awaiting_receiver_pickup`, or to `delivery_failed`.
- Exception states must preserve package location and custody evidence visibility.

Known API error codes mapped into local blockers:
- `PAYMENT_REQUIRED`
- `INVALID_STATUS_TRANSITION`
- `PACKAGE_SCAN_MISMATCH`
- `PACKAGE_ALREADY_RECEIVED`
- `DUPLICATE_SCAN` as policy copy from inventory until backed by `apiErrorCodeSchema`
- `VALIDATION_ERROR` when idempotency or request fingerprint indicates unsafe replay
- `FORBIDDEN` when station scope or authority changed
- `NOT_FOUND` when a locally cached package no longer resolves
- `RATE_LIMITED` when recovery must wait

## Current Backend Gap
There is no single station blocked queue endpoint.

Missing endpoint:
- `GET /v1/station/blocked`

Current constraints:
- `list_deliveries` accepts one `status` at a time.
- `list_issues` returns issues accessible to the actor, but it does not join issue rows to delivery list rows.
- `list_issues` does not expose station filter parameters.
- `list_deliveries` does not expose blocker reason or issue severity.
- Payment blockers are surfaced through mutation failures and delivery/payment status, not a dedicated blocked-work feed.
- Custody blockers are detected from handoff/timeline flows and local failed actions, not a station aggregate feed.
- Scan blockers are detected from scan flows and local failed actions, not a station aggregate feed.
- Terminal failed deliveries need product policy before appearing in the active blocked queue.

Buildable client composition:
- Fetch `list_deliveries?status=issue_reported&limit=100`.
- Fetch `list_deliveries?status=on_hold&limit=100`.
- Fetch `list_issues?status=open&limit=100`.
- Fetch `list_issues?status=in_review&limit=100`.
- Fetch `list_issues?status=escalated&limit=100`.
- Read local offline action blockers from the encrypted local queue and recovery cache.
- Merge rows by `deliveryId`.
- Filter merged rows to deliveries where `originStationId`, `destinationStationId`, or `latestTouchpointStationId` matches the authenticated `stationId`.
- Show partial data when an issue exists but the corresponding delivery row is not in local cache.
- Do not fetch every delivery timeline on screen open.

Production-ready recommendation:
- Add `GET /v1/station/blocked?stationId=&status=&blockerType=&severity=&limit=&cursor=`.
- Return delivery row, blocker reason, open issue summary, payment blocker state, latest custody confidence, and source freshness.
- Add server-side station scoping, pagination, and stable sorting.
- Add `blockerCountByType` for overview badges.
- Add support for `resolvedSince` so recently cleared blockers can be shown briefly without active queue pollution.
- Add delivery timeline excerpts only when requested per row.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product claims beyond current backend:
- Android offline-first guidance says critical apps should support reads without reliable network access and use local data sources for network-backed repositories.
- WCAG 2.2 includes error identification, labels or instructions, and status messages as important criteria for accessible recovery and status updates.
- NIST SP 800-61 frames incident handling from preparation through lessons learned; this supports a triage-first blocked workflow instead of ad hoc local clearing.
- GS1 traceability standards frame supply-chain visibility around critical tracking events and key data elements, reinforcing that blocked packages need location, event, and reason context.
- GS1 Global Traceability Standard is sector neutral and emphasizes consistent data about object movement across lifecycle events.

Reference links:
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [NIST SP 800-61 Rev. 2](https://www.nist.gov/publications/computer-security-incident-handling-guide)
- [GS1 traceability standards](https://www.gs1.org/standards/traceability)
- [GS1 Global Traceability Standard 2.0](https://ref.gs1.org/standards/global-traceability/2.0.0/)

## Screen Thesis
The screen should feel like a station exception command list: calm, strict, evidence-oriented, and designed for fast routing to the correct recovery surface.

The operator should understand in three seconds:
- How many packages are blocked.
- Which blockers are most urgent.
- Which blockers are live versus local.
- Which package needs support, custody review, payment context, or outbox recovery.
- Which action is safe from this screen.

Visual thesis:
- Use a high-contrast operational ledger with compact risk bands, strong reason labels, and a warm amber caution system.
- Make the reason and next route more important than the package card chrome.
- Keep the page serious, almost incident-room calm, not alarmist.

Restraint rule:
- Do not turn the blocked queue into a dashboard of every possible detail. Show the blocker, evidence confidence, and route to resolution.

## Information Architecture
Top-level layout:
1. Header.
2. Data freshness and station scope banner.
3. Blocked summary strip.
4. Filter and search controls.
5. Prioritized blocked rows.
6. Row action sheet.
7. Empty, offline, stale, partial, and error states.

Header:
- Title: `Blocked queue`
- Subtitle: `{stationCode} packages needing review`
- Leading back action: station overview.
- Right action: refresh.
- Overflow actions: open handoff log, open support, open offline outbox.

Freshness banner:
- `Live station blockers`
- `Partly cached`
- `Offline cached`
- `Stale`
- `Local blockers only`
- `Station scope missing`

Blocked summary strip:
- `P1`
- `Payment`
- `Custody`
- `Scan`
- `On hold`
- `Local sync`

Filter controls:
- `All`
- `P1`
- `Payment`
- `Issue`
- `Custody`
- `Scan`
- `On hold`
- `Local sync`

Search:
- Search by tracking code or delivery ID.
- Search must run locally against loaded rows.
- Do not query arbitrary cross-station deliveries from this screen.

Row grouping:
- `Needs immediate review`
- `Blocked by payment or policy`
- `Waiting on issue review`
- `Local sync recovery`
- `Recently checked`

## Data Model
Blocked queue row:
- `deliveryId`
- `trackingCode`
- `stationId`
- `stationRelation`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `receiverDisplayName`
- `blockerType`
- `blockerReason`
- `blockerSeverity`
- `blockerSource`
- `issueId`
- `issueStatus`
- `issueSeverity`
- `issueCategory`
- `issueSummary`
- `localActionId`
- `lastErrorCode`
- `lastErrorMessage`
- `evidenceConfidence`
- `sourceUpdatedAt`
- `isOfflineDerived`
- `isStale`
- `nextRecommendedRoute`
- `safePrimaryAction`

`stationRelation` values:
- `origin_station`
- `destination_station`
- `latest_touchpoint`
- `cached_station_reference`
- `unknown_station_relation`

`blockerType` values:
- `issue`
- `hold`
- `payment`
- `custody`
- `scan`
- `status`
- `local_sync`
- `authorization`
- `missing_delivery`
- `unknown`

`blockerSeverity` values:
- `critical`
- `high`
- `medium`
- `low`

`blockerSource` values:
- `delivery_status`
- `issue_record`
- `api_error`
- `offline_outbox`
- `handoff_cache`
- `scan_recovery`
- `combined`

`evidenceConfidence` values:
- `delivery_and_issue`
- `delivery_only`
- `issue_only`
- `local_only`
- `stale`
- `missing`

## Data Composition Rules
Normalize delivery status rows:
- `currentStatus=issue_reported` creates `blockerType=issue`.
- `currentStatus=on_hold` creates `blockerType=hold`.
- `paymentStatus=failed` creates `blockerType=payment` when the delivery is still operationally active.
- `paymentStatus=pending` creates `blockerType=payment` only when a station action has already been blocked by payment policy.

Normalize issue rows:
- `severity=p1` maps to `critical`.
- `severity=p2` maps to `high`.
- `severity=p3` maps to `medium`.
- `category=payment` maps to payment issue context.
- `category=handoff` maps to custody context.
- `category=loss` maps to custody or missing delivery context.
- `status=open`, `in_review`, and `escalated` are active.
- `status=resolved` and `closed` should not appear as active blockers unless a delivery row remains `issue_reported` or `on_hold`.

Normalize local action blockers:
- `PAYMENT_REQUIRED` maps to payment.
- `INVALID_STATUS_TRANSITION` maps to status.
- `PACKAGE_SCAN_MISMATCH` maps to scan.
- `PACKAGE_ALREADY_RECEIVED` maps to custody.
- `DUPLICATE_SCAN` maps to scan.
- `FORBIDDEN` maps to authorization.
- `NOT_FOUND` maps to missing delivery.
- Repeated replay failure with same idempotency key maps to local sync.

Merge precedence:
1. Same `deliveryId` rows merge into one blocked row.
2. P1 issue severity wins over all other severity.
3. Local sync blocker stays visible until outbox confirms synced or user discards a safe local action.
4. Payment blockers remain visible if the last failed station action was blocked by payment.
5. Custody and scan blockers remain visible until a live delivery refresh or route-specific recovery clears them.
6. Resolved issue rows do not clear a delivery-status blocker by themselves.

Station scope filter:
- Include if `originStationId === principal.stationId`.
- Include if `destinationStationId === principal.stationId`.
- Include if `latestTouchpointStationId === principal.stationId`.
- Include if local cache row was created from a station route with matching `stationId`.
- Exclude if the only station reference is missing and the backend did not authorize delivery access.

Sorting:
1. `critical` blockers.
2. `local_sync` blockers with failed or conflict state.
3. `payment` blockers preventing active station work.
4. `custody` or `scan` blockers.
5. `issue` blockers by newest `updatedAt`.
6. `hold` blockers by oldest `latestOccurredAt`.
7. Stale or partial records after live records unless severity is critical.

## Primary Actions
Default primary action by blocker type:
- `issue`: `Open issue`
- `hold`: `Open support`
- `payment`: `View delivery`
- `custody`: `Open custody chain`
- `scan`: `Open scan recovery`
- `status`: `View current status`
- `local_sync`: `Open outbox`
- `authorization`: `Open support`
- `missing_delivery`: `Open support`
- `unknown`: `View delivery`

Secondary actions:
- `View delivery`
- `Open custody chain`
- `Report issue`
- `Open handoff log`
- `Open support`
- `Open offline outbox`
- `Refresh`

Forbidden actions:
- Do not resolve issue.
- Do not close issue.
- Do not escalate issue from this screen.
- Do not verify payment.
- Do not mutate delivery status.
- Do not mutate custody.
- Do not retry local queued actions directly from a row.
- Do not delete local action evidence.
- Do not bypass station scope.
- Do not call admin routes.

## Row Anatomy
Each row must show:
- Tracking code.
- Compact station relation label.
- Blocker reason title.
- Current delivery status label.
- Payment status when relevant.
- Issue severity when linked.
- Last updated time.
- Source freshness label.
- Primary action.
- Secondary overflow action.

Row title:
- Prefer blocker reason over generic status.
- Use tracking code as supporting identifier.
- Use receiver name only as a secondary label and keep it redacted to first name plus initial when policy requires.

Row reason copy:
- Payment: `Payment must be confirmed before this package can move.`
- Issue: `Issue review is open for this package.`
- Hold: `Package is on hold and needs support review.`
- Custody: `Custody evidence needs review before the next handoff.`
- Scan: `Package scan must be checked before work continues.`
- Status: `Current status no longer allows that action.`
- Local sync: `A local action has not been confirmed by the backend.`
- Authorization: `Your station access changed before the action completed.`
- Missing delivery: `This delivery could not be loaded from the backend.`

Source labels:
- `Live`
- `Cached`
- `Stale`
- `Local only`
- `Partial`

Evidence confidence labels:
- `Delivery and issue linked`
- `Delivery only`
- `Issue only`
- `Local action only`
- `Stale evidence`
- `Evidence missing`

## Empty State
Empty when all live and local sources return no active blockers.

Title:
- `No blocked station work`

Body:
- `Packages that need issue, payment, custody, scan, or sync review will appear here.`

Primary action:
- `Back to station overview`

Secondary actions:
- `Refresh`
- `Open handoff log`

Do not show a celebratory tone. This is an operations surface, not a consumer milestone.

## Offline Behavior
Offline mode must preserve read usefulness without allowing unsafe clearing.

Offline reads:
- Show cached blocked rows.
- Show local failed-action blockers.
- Allow search and filtering over local rows.
- Allow opening cached delivery context when available.
- Allow opening offline outbox.
- Allow opening issue creation only if `OpsIssueCreate` can queue issue creation with a stable idempotency key.

Offline restrictions:
- Do not mark a blocker as resolved.
- Do not remove a row because the user viewed it.
- Do not retry a local mutation directly from this screen.
- Do not claim payment, custody, status, or issue state changed.
- Do not fetch missing issue details until online.

Offline banner copy:
- Title: `Offline cached blockers`
- Body: `You can review local blockers, but clearing a blocker needs backend confirmation.`
- Action: `Open outbox`

Stale threshold:
- Mark live rows stale if last successful blocked queue refresh is older than `10 minutes`.
- Mark local-only rows stale if their source action is older than `24 hours` and still unresolved.
- Always show the exact relative age, such as `Updated 12 min ago`.

## Error And Recovery States
`not_authorized`:
- Title: `Station access required`
- Body: `This queue only shows blockers for the station assigned to your account.`
- Primary action: `Back to role home`
- Secondary action: `Contact support`

`session_expired`:
- Title: `Sign in again`
- Body: `Your session expired before blocked work could refresh.`
- Primary action: `Sign in`

`api_error`:
- Title: `Blocked queue could not refresh`
- Body: `Cached blockers are shown if available. Try again when the connection is stable.`
- Primary action: `Retry`
- Secondary action: `Open outbox`

`rate_limited`:
- Title: `Refresh paused`
- Body: `Too many refresh attempts were made. Wait briefly before trying again.`
- Primary action: `Use cached list`

`ready_partial`:
- Title: `Some blocker details are missing`
- Body: `The queue loaded delivery blockers, but issue or local action details could not be refreshed.`
- Primary action: `Retry details`

`search_empty`:
- Title: `No matching blocker`
- Body: `Try the full tracking code or clear filters to see all blocked station work.`
- Primary action: `Clear search`

## Accessibility Requirements
Structure:
- Use one `h1` equivalent for `Blocked queue`.
- Use headings for summary, filters, blocker groups, and recovery states.
- Each row must expose a single accessible name containing tracking code, blocker type, severity, and primary action.
- Filter chips must expose selected state.
- Search field must have a persistent visible label.

Status messages:
- Announce refresh results without moving focus.
- Announce filter result count changes.
- Announce offline and stale state changes.
- Announce row source changes when a local blocker becomes live-confirmed or cleared after refresh.

Touch targets:
- Primary row action minimum target: `44 x 44 dp`.
- Filter chip minimum target: `44 x 44 dp`.
- Overflow action minimum target: `44 x 44 dp`.

Color and contrast:
- Do not rely on color alone for severity.
- Pair every severity color with text and icon shape.
- Use high contrast for blocker title and primary action.
- Warning amber must meet text contrast on the chosen background.

Motion:
- Use short refresh and row insertion motion only.
- Respect reduced motion.
- Do not pulse critical blockers continuously.

## Visual Direction
Use a station operations visual language:
- Background: warm off-white or graphite-tinted surface with subtle grid or ledger texture.
- Critical accents: deep red-brown, not bright panic red.
- Warning accents: amber and ochre.
- Neutral accents: ink, slate, and muted blue for informational states.
- Typography: strong condensed heading face for operations hierarchy, highly legible text face for row detail.
- Shape: tight but tactile rounded rows, no heavy shadows.
- Density: compact rows with clear breathing room between groups.

Layout rules:
- Summary strip stays visible near the top but should not crowd the row list.
- Filters wrap horizontally with scroll affordance on small phones.
- Row action must be reachable with thumb on both iOS and Android.
- Long issue summaries clamp to two lines with route to detail.
- Critical rows use a left risk rail plus text, not full-card red fill.

## Copy System
Voice:
- Direct.
- Calm.
- Operational.
- No hype.
- No blame.

Preferred verbs:
- `Open`
- `Review`
- `Check`
- `Refresh`
- `Report`
- `Back`

Avoid:
- `Fix` when the screen cannot clear the blocker.
- `Resolve` unless the user is on an authorized support-admin resolution surface.
- `Clear` unless backend confirmation exists.
- `Ignore`.
- `Override`.

Header copy:
- Title: `Blocked queue`
- Subtitle live: `{count} packages need review at {stationCode}`
- Subtitle empty: `No blocked station work`
- Subtitle offline: `Showing cached blockers for {stationCode}`

Summary labels:
- `P1`
- `Payment`
- `Custody`
- `Scan`
- `On hold`
- `Local sync`

Primary action labels:
- `Open issue`
- `View delivery`
- `Open custody`
- `Open scan recovery`
- `Open outbox`
- `Open support`
- `Report issue`

## Privacy And Security
Do not show:
- Full receiver phone.
- Receiver address.
- Raw scan code.
- Raw proof reference.
- Raw actor ID.
- Internal stack trace.
- Full payment provider reference.
- Private issue description in the row when not needed for triage.

Allowed row information:
- Tracking code.
- Delivery ID when needed for staff.
- First name plus initial for receiver display if already available in delivery list.
- Station code.
- Current status.
- Payment status label.
- Issue severity and category.
- Short issue summary.
- Last updated time.
- Safe next action.

Station scope:
- Never render blockers for a station other than the authenticated `stationId`.
- If backend returns a row not matching station scope, suppress it and log a client diagnostic.
- Do not let search reveal inaccessible delivery existence.

## Analytics
Track:
- `station_blocked_queue_viewed`
- `station_blocked_queue_refreshed`
- `station_blocked_queue_filter_changed`
- `station_blocked_queue_search_used`
- `station_blocked_queue_row_opened`
- `station_blocked_queue_issue_opened`
- `station_blocked_queue_custody_opened`
- `station_blocked_queue_outbox_opened`
- `station_blocked_queue_support_opened`
- `station_blocked_queue_partial_data_seen`
- `station_blocked_queue_offline_seen`

Event payload rules:
- Include `stationId`.
- Include `blockerType`.
- Include `blockerSeverity`.
- Include `blockerSource`.
- Include `rowSourceState`.
- Include `hasIssueId` as boolean.
- Do not include receiver phone, receiver address, raw scan code, raw proof reference, or issue description.

## QA Acceptance Criteria
Backend integration:
- Screen calls `list_deliveries` for `issue_reported`.
- Screen calls `list_deliveries` for `on_hold`.
- Screen calls `list_issues` for `open`.
- Screen calls `list_issues` for `in_review`.
- Screen calls `list_issues` for `escalated`.
- Screen merges delivery and issue rows by `deliveryId`.
- Screen includes local offline action blockers.
- Screen filters all rows to authenticated station scope.
- Screen does not call issue resolution, escalation, payment verification, custody mutation, or lifecycle mutation endpoints.

Rendering:
- Root element exposes `screen-station-blocked-queue`.
- Live blocker rows show tracking code, reason, severity, source, updated time, and primary action.
- P1 issue rows sort above lower-severity blockers.
- Local sync blockers remain visible until outbox confirms success or a safe discard.
- Payment blockers show payment copy and route safely.
- Custody blockers route to custody chain.
- Scan blockers route to scan recovery or support.
- Empty state appears only when live and local sources have no active blockers.

Offline and stale:
- Offline cached mode renders without network.
- Offline mode does not allow blocker clearing.
- Stale banner appears after threshold.
- Partial data state appears when one source fails and another succeeds.
- Search and filters work offline against cached rows.

Accessibility:
- Screen reader announces refresh count.
- Filter chip selected state is exposed.
- Search field label remains visible.
- Row actions are keyboard and switch-access reachable.
- Status changes use accessible status messaging.
- Color is not the only severity signal.

Security:
- No inaccessible station rows render.
- No raw scan code renders.
- No raw proof reference renders.
- No receiver address renders.
- No internal backend error details render.

## Implementation Notes For Claude Code
Build this as a read-first operations queue.

Recommended component split:
- `StationBlockedQueueScreen`
- `BlockedQueueHeader`
- `BlockedFreshnessBanner`
- `BlockedSummaryStrip`
- `BlockedFilterBar`
- `BlockedSearchField`
- `BlockedGroupList`
- `BlockedQueueRow`
- `BlockedRowActionSheet`
- `BlockedQueueEmptyState`
- `BlockedQueueErrorState`

Recommended hooks/services:
- `useStationBlockedQueue`
- `useStationBlockedFilters`
- `useLocalActionBlockers`
- `mergeBlockedQueueRows`
- `classifyBlockedDelivery`
- `classifyBlockedIssue`
- `classifyLocalBlocker`
- `sortBlockedQueueRows`

Cache policy:
- Persist last successful merged rows by station.
- Store source freshness per source, not only for the merged list.
- Mark each row with its strongest evidence source.
- Invalidate on successful delivery refresh, issue refresh, outbox sync success, or role/station change.

Navigation policy:
- `Open issue` routes to issue detail if available; if issue detail route is not built, route to station support with issue context.
- `Report issue` routes to `/(ops)/deliveries/:deliveryId/issues/new`.
- `Open custody` routes to `/(ops)/deliveries/:deliveryId/custody`.
- `View delivery` routes to `/(ops)/deliveries/:deliveryId`.
- `Open outbox` routes to `/(ops)/offline-outbox`.
- `Open support` routes to `/(ops)/station/support`.

## Final Quality Bar
This screen is complete only when:
- A station operator can tell why every row is blocked without opening it.
- Every visible action routes to a safe owner surface.
- Offline mode is useful but cannot create false completion.
- Issue, payment, custody, scan, and local sync blockers are visually distinct without visual noise.
- Station scope is enforced in data and copy.
- The design feels like a serious station operations tool for preventing lost goods, not a generic list.
- QA can validate it with deterministic test IDs, source states, and blocker fixtures.
