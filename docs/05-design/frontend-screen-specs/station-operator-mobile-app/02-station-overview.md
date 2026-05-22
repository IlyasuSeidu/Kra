# Station Overview Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID          | `StationOverview`                                                                                                                                                                                                                                                 |
| App                | `apps/mobile`                                                                                                                                                                                                                                                     |
| Route              | `/(ops)/station/overview`                                                                                                                                                                                                                                         |
| Primary test ID    | `screen-station-overview`                                                                                                                                                                                                                                         |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                                                     |
| Build priority     | `P0 Station Critical`                                                                                                                                                                                                                                             |
| Backend dependency | `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, `AuthPrincipal`, `roleSchema`, `stationIdSchema`, station-scoped access policy, cached station queue summary                                                                          |
| Related routes     | `/(ops)/home`, `/(ops)/station/intake`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/station/blocked`, `/(ops)/station/handoffs`, `/(ops)/station/support`, `/(ops)/offline-outbox`, `/(ops)/deliveries/:deliveryId` |
| Required states    | `loading`, `ready`, `empty`, `offline_cached`, `stale_cache`, `partial_data`, `missing_station_scope`, `not_authorized`, `session_expired`, `api_error`, `refreshing`                                                                                             |

## Product Job

This screen is the station operator's workspace overview. It summarizes the station's active package workload and routes the operator to the right station queue without letting the overview mutate delivery state.

The screen answers one operational question: `What station work needs attention now?`

The station operator should be able to:

- Confirm they are operating inside the correct station scope.
- See active station workload across intake, outbound, inbound, final-mile, blocked, and handoff categories.
- Understand whether the data is fresh, cached, stale, partial, or offline.
- Open the highest-priority queue quickly.
- Open offline outbox when local station actions are waiting.
- Open support for station blockers.
- Refresh station workload.
- Recover from missing station scope, denied role, session expiry, offline, and backend errors.

This screen is not:

- A station dispatch mutation screen.
- A package intake scan screen.
- A driver assignment screen.
- A final-mile assignment screen.
- A handoff evidence detail screen.
- A station admin dashboard.
- A launch-readiness admin page.
- A route pricing or finance screen.
- A place to override station status.
- A place to show packages outside the authenticated station scope.

## Audience

Primary audience:

- Station operators starting a shift.
- Station leads monitoring active queues.
- Queue operators switching between intake, outbound, inbound, and final-mile work.

Secondary audience:

- Claude Code implementing the station overview.
- QA validating station-scoped read behavior.
- Operations leads validating station workload clarity.
- Security reviewers validating station-scope data isolation.
- Accessibility reviewers checking metrics, queue cards, and offline states.

## User State

The user has already passed station sign-in and should have `role = station_operator` plus a valid `stationId`. The user needs a fast station-specific work map, not a broad operations dashboard.

The user may be:

- Starting a shift at a launch station.
- Checking if intake has a backlog.
- Checking whether outbound packages need driver assignment or dispatch.
- Watching inbound packages expected from drivers.
- Moving packages into pickup or final-mile queues.
- Handling a blocked package.
- Returning after working offline.
- Checking whether local queued actions still need sync.

The screen must:

- Treat `AuthPrincipal.stationId` as required.
- Treat `list_deliveries` as read-only.
- Show only deliveries the backend permits for the station operator.
- Classify station workload locally from response fields without inventing backend statuses.
- Make cached or stale station data obvious.
- Route state-changing work to dedicated station screens.
- Never mutate status, custody, assignment, payment, issue, or proof from the overview.

## Backend Contract

Read operation:

- `list_deliveries`

Query schema:

- `status`: optional.
- `paymentStatus`: optional.
- `limit`: optional positive integer, maximum `100`.

Response schema:

- `deliveries`: array of delivery list rows.

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

Station scope:

- Station operator access is based on backend policy.
- Backend delivery access allows station operator when `principal.stationId` matches origin or destination station.
- Frontend must still show station scope in UI and never render non-accessible rows.

Read-only rule:

- This screen does not call lifecycle mutations.
- This screen does not call assignment mutations.
- This screen does not call issue creation directly.
- This screen can link to dedicated routes that perform those tasks.

## Station Workload Buckets

The overview groups station work into station-owned buckets.

`intake_pending`:

- Packages awaiting station intake or label binding.
- Route: `/(ops)/station/intake`
- Typical statuses: created or station-intake-ready states when represented by backend status.

`outbound_ready`:

- Packages at origin station needing driver assignment, dispatch readiness, or driver pickup coordination.
- Route: `/(ops)/station/outbound`
- Includes received-at-origin, awaiting-driver-assignment, assigned-to-driver, or dispatch-ready states when represented by backend status.

`driver_assigned`:

- Outbound packages with assigned driver where station needs dispatch/pickup visibility.
- Route: `/(ops)/station/outbound`
- Must not imply custody transferred before driver pickup confirms.

`inbound_pending_receipt`:

- Packages in transit to this station or awaiting destination receipt.
- Route: `/(ops)/station/inbound`
- Must surface receipt lag and scan requirement.

`pickup_ready`:

- Packages ready for receiver pickup at station.
- Route: destination station handling route when implemented, otherwise inbound/final-mile route based on service.

`final_mile_ready`:

- Doorstep-eligible packages needing final-mile assignment or courier handoff.
- Route: `/(ops)/station/final-mile`

`exception_hold`:

- Packages blocked by issue, payment, custody uncertainty, missing evidence, stale handoff, or local queued action conflict.
- Route: `/(ops)/station/blocked`

`handoff_review`:

- Packages where station needs to review handoff evidence.
- Route: `/(ops)/station/handoffs`

Bucket rules:

- Use backend status and station fields as inputs.
- Do not invent delivery statuses.
- If a delivery fits multiple risk groups, blocked/exception priority wins.
- If a delivery belongs to origin and destination station in different flows, use current status and latest station touchpoint to decide the visible bucket.
- Any ambiguous state routes to blocked or handoff review instead of pretending it is ready.

## Primary Action

Primary action by state:

- `loading`: wait.
- `ready`: open highest-priority station queue.
- `empty`: refresh or open support.
- `offline_cached`: open cached queue or offline outbox.
- `stale_cache`: refresh.
- `partial_data`: review loaded queues with warning.
- `missing_station_scope`: contact supervisor.
- `not_authorized`: return to role home.
- `session_expired`: sign in again.
- `api_error`: retry.
- `refreshing`: keep current content visible.

Primary action by workload:

- Any P1/blocked count: open blocked queue.
- Any offline queued station action: open offline outbox.
- Any intake count: open intake queue.
- Any inbound overdue count: open inbound queue.
- Any outbound ready count: open outbound queue.
- Any final-mile ready count: open final-mile queue.
- Otherwise open handoff log or support based on station state.

Secondary actions:

- `Open intake`
- `Open outbound`
- `Open inbound`
- `Open final-mile`
- `Open blocked`
- `Open handoff log`
- `Open offline outbox`
- `Open support`
- `Refresh`

Blocked behavior:

- Do not show mutation controls.
- Do not show assign driver button on overview.
- Do not show dispatch button on overview.
- Do not show receive button on overview.
- Do not show assign courier button on overview.
- Do not show payment or refund controls.
- Do not show non-station deliveries.
- Do not show station data when `stationId` is missing.

## First Meaningful Value

First meaningful value is reached when station operator sees:

- Station scope label.
- Freshness state.
- Active workload count.
- Blocked/exception count.
- Intake count.
- Outbound count.
- Inbound count.
- Final-mile count.
- Offline outbox indicator when relevant.

The first viewport must answer:

- `Which station am I working in?`
- `Is the data fresh?`
- `What queue needs attention first?`
- `Are any packages blocked?`
- `Are offline actions waiting?`

## Main Tension

Station operators need a fast control surface, but the overview must not become a mutation dashboard. The safest station overview acts like a routing board: it shows workload, risk, and freshness, then sends staff into dedicated scan and handoff workflows.

The design must balance:

- Fast queue routing against strict custody discipline.
- Workload summary against mobile readability.
- Fresh data against offline continuity.
- Local bucket classification against backend status authority.
- Station scope visibility against internal ID exposure.
- P1/blocked prominence against not hiding normal throughput work.

## Design Brief

User and job:

- Station operator needs to understand station workload and pick the next queue.

Context of use:

- Mobile station floor, shift handover, package counter, weak network, scanning workflows nearby.

Entry point:

- Station sign-in success.
- Shared ops role home.
- Session return.
- Push/deep link after station issue or outbox state.

Success state:

- Operator opens the correct station queue with station scope and freshness understood.

Primary action:

- Open the highest-priority queue.

Navigation model:

- Station pulse plus queue cards, blocked strip, and recent handoff/work preview.

Density:

- Medium. The screen needs counts and priority, not full package lists.

Visual thesis:

- A station command board in your hand: queue-first, scope-aware, fresh-state explicit, and stripped of unsafe controls.

Restraint rule:

- Avoid admin charts, map views, decorative cards, delivery tables, and mutation buttons.

Product lens:

- Station throughput, custody safety, and exception visibility.

System stance:

- Read-only station workload router.

Interaction thesis:

- Confirm station, check risk, open queue.

Signature move:

- A top `Station pulse` showing station scope, active workload, blocked count, freshness, and offline outbox count.

Activation event:

- User opens queue, blocked list, handoff log, outbox, support, refreshes, or signs out.

## Elite Quality Gate

This spec is not closed unless `StationOverview` is station-scoped, queue-first, and read-only.

Non-negotiable quality requirements:

- First viewport shows station scope and freshness.
- Blocked/exception count is visible when nonzero.
- Offline outbox count is visible when nonzero.
- Queue cards route to dedicated station screens.
- Overview does not mutate delivery state.
- Station operator without `stationId` sees blocked state.
- Wrong role sees unauthorized state.
- Cached/stale data cannot look fresh.
- Bucket logic does not invent backend statuses.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:

- If non-station data can render, the screen remains open.
- If mutation buttons appear, the screen remains open.
- If stale cached data looks live, the screen remains open.
- If blocked work can be hidden below normal queues, the screen remains open.
- If station scope is not visible, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [Nielsen Norman Group dashboard design guidance](https://www.nngroup.com/articles/dashboards-preattentive/): dashboards should make priority and status immediately scannable.
- [Material Design cards](https://m1.material.io/components/cards.html): cards should group related actions and content without becoming clutter.
- [Material Design lists](https://m1.material.io/components/lists.html): mobile operational lists need clear hierarchy and touchable actions.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): refresh, stale, offline, and count changes must be announced accessibly.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): queue cards and action rows need reliable touch targets.

Applied decisions:

- Use a station pulse instead of a generic KPI dashboard.
- Put blocked and offline work before normal queues.
- Keep queue cards high-signal with one primary route each.
- Show freshness in the first viewport.
- Keep full package details inside queue screens.

## Information Architecture

The screen uses six stacked regions.

Region 1: Station pulse

- Station label.
- Role label.
- Freshness.
- Active workload count.
- Blocked count.
- Offline outbox count.

Region 2: Priority action strip

- Highest-priority queue route.
- Offline outbox route when needed.
- Refresh.

Region 3: Queue cards

- Intake.
- Outbound.
- Inbound.
- Final-mile.
- Blocked.
- Handoff log.

Region 4: Recent work preview

- Top three newest accessible delivery rows.
- Only safe fields from `deliveryListResponseSchema`.
- Route to delivery detail.

Region 5: System states

- Empty.
- Offline cached.
- Stale cache.
- Partial data.
- Missing station scope.
- Not authorized.
- Session expired.
- API error.

Region 6: Support and guidance

- Station support route.
- Supervisor guidance.
- Read-only reminder when needed.

## Station Pulse

Purpose:

- Orient the operator and surface risk before normal queue routing.

Fields:

- Station display label.
- Role label: `Station operator`.
- Active workload count.
- Blocked/exception count.
- Offline queued action count.
- Last updated time.
- Network/freshness state.

Copy:

- `Station overview`
- `Station operator`
- `Active packages`
- `Blocked`
- `Queued actions`
- `Updated just now`
- `Offline: cached station data`
- `Station assignment missing`

Rules:

- Station display label may use station name if available, otherwise safe station label.
- Do not show raw station ID as the primary display unless no safe display label exists.
- If blocked count is nonzero, blocked count gets visual priority.
- If offline queued count is nonzero, outbox link is visible.

## Queue Card Specification

Each queue card must include:

- Queue name.
- Count.
- Short operational meaning.
- Freshness or offline marker when needed.
- Primary route.

Cards:

- `Intake`: packages needing station intake or label binding.
- `Outbound`: packages at origin station needing driver assignment, dispatch, or pickup visibility.
- `Inbound`: packages expected or awaiting destination receipt.
- `Final-mile`: doorstep packages needing station courier assignment or handoff readiness.
- `Blocked`: payment, issue, custody, or evidence blockers.
- `Handoff log`: recent station handoff evidence.

Queue card order:

- Blocked first if count is nonzero.
- Offline outbox strip above cards if count is nonzero.
- Intake.
- Outbound.
- Inbound.
- Final-mile.
- Handoff log.
- Blocked can also remain visible in its normal position for consistency.

Card behavior:

- Tap opens route.
- Count `0` cards stay visible but subdued.
- Disabled only when route is not available or scope missing.
- Offline cards can open cached queues if those screens support read cached behavior.

## Recent Work Preview

Purpose:

- Let operator recognize active station work without replacing queue screens.

Rows show:

- Tracking code.
- Current status.
- Payment status.
- Route role: origin, destination, or latest touchpoint when safe.
- Latest occurred time.
- Doorstep flag if relevant.

Rows do not show:

- Receiver phone.
- Receiver precise address.
- Raw scan code.
- Proof reference.
- Internal actor IDs.

Row action:

- Open `/(ops)/deliveries/:deliveryId`.

Limits:

- Show at most three rows on overview.
- Full lists live in station queue screens.

## Bucket Classification

Input fields:

- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`
- station scope from auth

Priority classification:

- Payment not confirmed for a transport-critical package maps to blocked.
- Issue-like status maps to blocked.
- Status or touchpoint mismatch maps to handoff review or blocked.
- Origin station active early lifecycle maps to intake/outbound.
- Destination station active route maps to inbound/pickup/final-mile.
- Doorstep requested and destination received maps to final-mile.
- Ambiguous state maps to blocked or handoff review.

Implementation guard:

- Do not add new backend statuses.
- Use known shared `deliveryStatusSchema` values only.
- Keep mapping in a pure function with unit tests.
- If mapping cannot classify, show in blocked/needs review, not hidden.

## Offline And Cache Behavior

Offline:

- Show cached station overview if available.
- Label as cached.
- Show last updated time.
- Disable refresh.
- Keep queue cards visible if cached counts exist.
- Open cached queue screens only if they support read-cached behavior.

Stale:

- Show stale warning.
- Keep content visible.
- Require refresh before actions that depend on current state in downstream screens.

Partial data:

- Show partial warning.
- Avoid total statements that imply completeness.
- Let user open available queues with warning.

Reconnect:

- Refresh automatically when screen foregrounds if policy allows.
- Preserve scroll and focus.
- Announce updated counts.

Offline outbox:

- If local station actions are queued, show outbox count.
- Outbox route is always visible when count is nonzero.
- Do not show queued action as backend-confirmed work.

## Error Mapping

`FORBIDDEN`:

- State: `not_authorized`.
- Hide station data.
- Route to role home or sign-in.

`VALIDATION_ERROR`:

- State: `api_error`.
- Show retry and support.

`NOT_FOUND`:

- State: `api_error`.
- Station overview should rarely receive this; show support.

`ROUTE_NOT_ENABLED`:

- State: `api_error`.
- Show support.

`PAYMENT_REQUIRED`:

- Do not block overview globally.
- If returned by list endpoint, show `api_error`.

`RATE_LIMITED`:

- State: `api_error` with wait guidance.
- Keep cached data if available.

`INTERNAL_ERROR`:

- State: `api_error`.
- Retry and support.

Missing station scope:

- State: `missing_station_scope`.
- Do not call station queues.

Session expired:

- State: `session_expired`.
- Sign in again.

Network timeout:

- State: `offline_cached` if cache exists, otherwise `api_error`.

## State Matrix

`loading`:

- Show station pulse skeleton and queue card skeleton.
- Do not show empty state until fetch completes.

`ready`:

- Show station pulse, priority strip, queue cards, recent work preview, support.

`empty`:

- Show zero active station workload.
- Keep support, refresh, handoff log, and outbox if queued actions exist.

`offline_cached`:

- Show cached content and offline banner.
- Disable refresh.

`stale_cache`:

- Show stale warning.
- Keep content.

`partial_data`:

- Show loaded counts with partial warning.

`missing_station_scope`:

- Show station assignment missing.
- Hide queue cards.

`not_authorized`:

- Show role/access denial.
- Hide station data.

`session_expired`:

- Prompt sign-in.
- Hide station data unless cache policy allows locked state.

`api_error`:

- Show retry and support.
- Keep cached content if safe.

`refreshing`:

- Keep current content visible.
- Show text refresh status.

## Copy System

Voice:

- Calm.
- Operational.
- Direct.
- Queue-first.
- No hype.

Primary headlines:

- `Station overview`
- `Station assignment missing`
- `No active station work`
- `Offline: cached station data`
- `Could not load station work`

Queue card labels:

- `Intake`
- `Outbound`
- `Inbound`
- `Final-mile`
- `Blocked`
- `Handoff log`

Button copy:

- `Open intake`
- `Open outbound`
- `Open inbound`
- `Open final-mile`
- `Open blocked`
- `Open handoff log`
- `Open offline outbox`
- `Refresh`
- `Open support`

Avoid:

- `Everything is done` unless empty state truly covers all station queues.
- Delivery mutation verbs like `Dispatch now` or `Receive now`.
- Internal status strings as primary copy.
- Decorative congratulation.

## Navigation

Entry routes:

- Station sign-in success.
- Shared ops home.
- Session return.
- Station notification.
- Offline outbox return.

Exit routes:

- Intake queue.
- Outbound queue.
- Inbound queue.
- Final-mile queue.
- Blocked queue.
- Handoff log.
- Support.
- Offline outbox.
- Delivery detail.

Back behavior:

- Back from station overview returns to shared ops home or exits app shell depending navigation policy.
- Back does not sign out.
- Missing station scope back returns to role home or sign-in.

Route guards:

- Require authenticated user.
- Require role `station_operator`.
- Require station scope.
- Downstream routes still perform their own guards.

## Privacy And Security

Station scope:

- Use authenticated `stationId`.
- Do not let user select or edit station scope.
- Do not render non-accessible deliveries.
- Cache is station and actor scoped.

Data minimization:

- Show receiver name only because it is part of `deliveryListResponseSchema`; do not expose phone or precise address.
- Show tracking code and status.
- Do not show proof references.
- Do not show raw scan code.
- Do not show internal actor IDs.

Cache:

- Clear or lock station cache on sign-out.
- Do not reuse cache across station operators.
- Label cached data.

Analytics:

- Use counts and route names, not delivery row payload.

## Accessibility Requirements

Screen reader:

- Announce title, station scope, active count, blocked count, and freshness.
- Queue cards announce name, count, meaning, and action.
- Offline/stale/partial changes are announced.
- Refresh result count is announced.

Focus:

- Initial focus lands on title.
- After refresh, focus stays stable and count update is announced.
- Error state moves focus to error heading.
- Opening a queue preserves return focus.

Touch:

- Queue cards meet target-size requirements.
- Refresh and outbox actions are not tiny icons.
- Recent work rows have clear tap targets.

Visual:

- Counts do not rely on color alone.
- Blocked state is label-visible.
- Large text preserves queue card meaning.
- High contrast mode keeps cards distinct.

Motion:

- Respect reduced motion.
- Avoid animated dashboards.
- Use text updates for refresh and offline status.

Localization:

- Use localized time/duration formatting.
- Avoid idioms.
- Keep queue labels stable.

## Analytics And Observability

Required analytics events:

- `station_overview_viewed`
- `station_overview_refreshed`
- `station_overview_queue_opened`
- `station_overview_delivery_opened`
- `station_overview_offline_outbox_opened`
- `station_overview_support_opened`
- `station_overview_missing_scope_viewed`
- `station_overview_error_viewed`
- `station_overview_cached_viewed`

Allowed analytics fields:

- `stationId`
- `activeCount`
- `blockedCount`
- `intakeCount`
- `outboundCount`
- `inboundCount`
- `finalMileCount`
- `handoffReviewCount`
- `offlineQueuedCount`
- `isCached`
- `isStale`
- `networkState`
- `openedRoute`
- `errorCode`

Do not send:

- Receiver name.
- Tracking code.
- Raw delivery row.
- Raw scan code.
- Proof reference.
- Payment provider reference.
- Internal actor IDs.

Operational metrics:

- Station overview load success rate.
- Queue route tap distribution.
- Blocked count by station.
- Offline cached view rate.
- Stale cache rate.
- Time from overview to first queue action.

## Performance Requirements

Initial render:

- Render shell immediately.
- Query practical limit not above `100`.
- Show cached summary while fetching if safe.

Classification:

- Bucket mapping must be pure and fast.
- Do not fetch every queue separately for overview if one station-scoped list can produce the summary.
- Avoid full delivery details on overview.

Refresh:

- Keep current content visible.
- Debounce repeated refresh taps.
- Cancel stale fetches where platform supports it.

Cache:

- Store summary and safe rows only.
- Mark cache timestamp.
- Keep cache actor/station scoped.

## Test IDs

Primary:

- `screen-station-overview`

Pulse:

- `station-overview-title`
- `station-overview-station-scope`
- `station-overview-role`
- `station-overview-active-count`
- `station-overview-blocked-count`
- `station-overview-offline-queued-count`
- `station-overview-freshness`

Actions:

- `station-overview-refresh`
- `station-overview-open-outbox`
- `station-overview-open-support`

Queue cards:

- `station-overview-card-intake`
- `station-overview-card-outbound`
- `station-overview-card-inbound`
- `station-overview-card-final-mile`
- `station-overview-card-blocked`
- `station-overview-card-handoff-log`
- `station-overview-card-count`

Recent work:

- `station-overview-recent-work`
- `station-overview-recent-row`
- `station-overview-recent-tracking`
- `station-overview-recent-status`
- `station-overview-recent-open-delivery`

States:

- `station-overview-loading`
- `station-overview-ready`
- `station-overview-empty`
- `station-overview-offline-cached`
- `station-overview-stale-cache`
- `station-overview-partial-data`
- `station-overview-missing-station-scope`
- `station-overview-not-authorized`
- `station-overview-session-expired`
- `station-overview-api-error`
- `station-overview-refreshing`

## API Integration Notes

Load flow:

- Verify authenticated session.
- Verify role `station_operator`.
- Verify `stationId` exists.
- Load cached station summary if available.
- Fetch `list_deliveries` with practical limit.
- Parse `deliveryListResponseSchema`.
- Classify rows into station buckets.
- Render overview.

Refresh flow:

- Refetch `list_deliveries`.
- Reclassify rows.
- Update cache.
- Announce updated counts.

Queue open flow:

- Navigate to route.
- Pass no sensitive data in params.
- Downstream screen fetches its own data and validates station scope.

Offline flow:

- Load actor/station-scoped cache.
- Label cached state.
- Open offline outbox when local queued actions exist.
- Avoid claiming complete station state.

## QA Acceptance Criteria

Functional:

- Station operator with station scope sees overview.
- Station operator without station scope sees missing station scope.
- Wrong role sees not authorized.
- Loading state appears before data resolves.
- Ready state shows station scope, counts, freshness, and queue cards.
- Empty state shows useful next action.
- Blocked count appears when nonzero.
- Offline outbox count appears when nonzero.
- Queue cards route to correct screens.
- Recent rows route to delivery detail.
- Refresh updates counts.
- Offline cached state is visibly cached.
- Stale cache state is visibly stale.
- API error keeps cached content if safe.

Backend alignment:

- Uses `list_deliveries` for read only.
- Parses `deliveryListResponseSchema`.
- Does not exceed query `limit` maximum.
- Does not invent statuses.
- Does not call mutations.

Security:

- No station data renders without station scope.
- No non-accessible delivery rows render.
- Receiver phone does not render.
- Receiver precise address does not render.
- Raw scan code does not render.
- Proof reference does not render.
- Cache is actor/station scoped.

Accessibility:

- Station scope is announced.
- Queue counts are announced.
- Offline/stale state is announced.
- Queue cards are keyboard/screen-reader reachable.
- Large text preserves queue card meaning.

Resilience:

- Network timeout falls back to cache when available.
- Refresh failure preserves current safe data.
- Classification failure sends row to blocked/review bucket.
- Outbox count remains available offline.

## Visual Quality Checklist

Before handoff, confirm:

- The screen looks like a station command board, not a generic mobile dashboard.
- Blocked work is visible before normal throughput.
- Queue cards are clear and not crowded.
- Freshness is visible in the first viewport.
- There are no mutation controls.
- The overview works on small phones and with large text.
- Cached data is visually different from fresh data.

## Implementation Guardrails For Claude Code

Build this as a read-only station routing screen only when frontend work begins.

Implementation rules:

- Keep station bucket mapping in a pure tested function.
- Keep route cards data-driven.
- Keep station scope checks before queries.
- Keep cache actor/station scoped.
- Keep overview read-only.
- Never place mutation buttons here.
- Never show non-accessible deliveries.
- Never treat cached rows as live.

Suggested file ownership:

- Screen route owns auth/station guard, query, cache, and navigation.
- Station pulse component owns counts and freshness.
- Queue card grid owns queue route cards.
- Recent work component owns safe recent rows.
- Bucket mapper owns classification.
- Cache service owns station-scoped summary cache.

Required implementation tests:

- Station scope required.
- Wrong role denied.
- Ready state counts.
- Blocked priority.
- Queue routes.
- No mutation calls.
- Cached state labeling.
- Stale state labeling.
- Bucket mapper ambiguity routes to blocked/review.
- Analytics redaction.

## Final Implementation Decisions

Station display labels must resolve through the shared typed station-label adapter. If a safe display label is unavailable, the UI must show the station ID with a `Station ID` label.

Cached station summary retention is fixed for v1. Read-only overview content is stale after 10 minutes; active handoff and action rows are stale after 2 minutes.

Overdue visual treatment can appear only when an SLA timestamp or backend overdue flag exists. The screen must not infer overdue state from local clock time unless the policy timestamp is present.

Recent work must show 3 rows on phones and 5 rows on large screens or tablets.

Platform follow-up decision: add a station overview aggregate endpoint that returns station bucket counts, overdue markers, blocked reasons, and freshness in one role-scoped response so mobile does not rely on local bucket mapping over list rows.

## Final Handoff Notes

`StationOverview` is the station operator's read-only routing board. It should show station workload, risk, and freshness, then move operators into dedicated queue screens for every state-changing workflow.

The safest implementation keeps bucket logic conservative: when a package cannot be confidently classified, route it to blocked or handoff review rather than hiding it or presenting it as ready.
