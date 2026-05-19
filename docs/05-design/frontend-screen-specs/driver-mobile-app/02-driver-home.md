# DriverHome Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverHome` |
| Route | `/(ops)/driver/home` |
| Primary test ID | `screen-driver-home` |
| Surface | Driver mobile app |
| Backend coverage | `list_deliveries` with driver assignment scope |
| Offline critical | Yes, read cached |
| Required role | `driver` |
| Related routes | `/(auth)/driver/sign-in`, `/(ops)/driver/runs`, `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/accept`, `/(ops)/driver/runs/:deliveryId/manifest`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Primary data source | `GET /v1/deliveries` through route key `list_deliveries` |
| Current implementation mode | Contract-backed screen with cache-first read behavior and no new backend mutation |

## Product Job
`DriverHome` is the driver command center after sign-in. It answers four field questions in one glance:

- `What run is assigned to me now?`
- `What is the next safe action?`
- `What deadline or blocker can make this run fail?`
- `Can I continue if network quality drops?`

The screen must help an inter-station driver move from login to assigned work without guessing, calling the station, or opening unrelated screens first.

## Product Standard
This screen is part of the custody-control system, not a decorative dashboard. It must reduce package loss risk by making ownership, deadlines, and handoff readiness visible before the driver touches any package.

The driver should be able to:

- See the active assigned run first.
- Understand whether they must accept, load, scan, depart, continue route, or hand off.
- Open the exact next workflow with one thumb action.
- See offline cache age and queued action health.
- Reach support without losing context.
- Avoid acting on stale or wrong assignments.

The screen must never:

- Show deliveries assigned to another driver.
- Let the driver self-assign work.
- Treat station dispatch readiness as custody transfer.
- Hide a missed acceptance deadline.
- Present map-heavy UI before the driver has a clear operational action.
- Depend on live network for already cached assigned work.

## Audience
Primary audience:

- Inter-station drivers transporting packages between approved Kra stations.

Secondary audience:

- Station leads watching whether the driver can act without manual explanation.
- QA engineers validating role scope, offline behavior, and route integrity.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The driver may be:

- Standing at the station counter while packages are being prepared.
- Inside a vehicle with weak network.
- In daylight glare or night conditions.
- Using one hand while carrying package bags.
- Under time pressure because assignment acceptance expires after `15 minutes`.
- Returning to the app after backgrounding, battery saver, or network loss.

The screen must be compact, high contrast, and direct. It should read like a flight deck for a driver run: one current situation, one required next move, and no extra noise.

## Design Brief
User and job:

- A verified driver needs to start or continue assigned inter-station work safely.

Context:

- Urgent, repetitive, operational, field-based, and connectivity-variable.

Entry point:

- Successful driver sign-in.
- Bottom tab or role home shortcut.
- Push notification for assigned run.
- Deep link back from accept, pickup, manifest, route, or support.

Success state:

- Driver knows the current run, next action, deadline, and sync state.
- Driver can open the next workflow without searching.
- Driver cannot see or mutate unassigned deliveries.

Primary action:

- Continue the next required run step.

Navigation model:

- Top-level tab or role home in the driver operations shell.

Density level:

- Balanced and operational. More focused than sender home, less dense than station queues.

Visual thesis:

- `Field cockpit`: bold status strip, one active run command card, deadline-forward action rail, restrained route map hint, and rugged offline status.

Restraint rule:

- Do not turn the home screen into a full route, manifest, earnings, or support workspace. It should route to those screens after answering what matters now.

## External Research Used
Only directly relevant sources were used:

- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local data as the app read source, network sync into local storage, and explicit conflict handling after reconnect.
- [Android adaptive Material layout guidance](https://developer.android.com/codelabs/adaptive-material-guidance): supports compact, medium, and expanded layout treatment instead of fixed phone-only dimensions.
- [Onfleet App Task View](https://support.onfleet.com/hc/en-us/articles/360023670292-App-Task-View): confirms that driver apps should show assigned tasks in list and map views, and that dispatchers assign the work.
- [Onfleet Route Load Task](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports route-start package verification, barcode scanning, missing package escalation, and no route start before load verification.
- [Onfleet Driver App Settings](https://support.onfleet.com/hc/en-us/articles/10228814951060-Driver-App-Settings): supports enforcing driver workflow through app settings and requiring proof before completion.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): requires at least `24 x 24` CSS pixel target sizing or equivalent spacing; Kra should exceed this for field actions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html): supports programmatic status announcements without moving focus.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `services/api/src/delivery-queries.ts`
- `services/api/src/firestore/repositories.ts`
- `services/api/src/handoffs.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Current backend read:

- Operation key: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Driver scope: repository filters by `assignedDriverId == principal.userId`.
- Sorting: `latestEvent.occurredAt desc`.
- Supported filters: `status`, `paymentStatus`, `limit`.
- Default limit: `50`.
- Response schema: `deliveryListResponseSchema`.

Fields available today per delivery:

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
- `latestTouchpointStationId` when present
- `doorstepRequested`

Current backend limitations:

- `list_deliveries` does not return assignment creation timestamp.
- `list_deliveries` does not return package count.
- `list_deliveries` does not return acceptance deadline timestamp.
- `list_deliveries` does not return route distance, expected travel time, or stop order.
- `list_deliveries` does not return open issue count.
- `list_deliveries` does not return whether the assignment has already been accepted.

Implementation decision for v1:

- DriverHome must build its current view from `list_deliveries` and local cached detail summaries only.
- DriverHome may show exact package counts only when a cached `AssignedRunDetail` or `DriverManifest` summary exists for the active delivery.
- DriverHome must not fabricate missing fields.
- DriverHome must route to detail, manifest, pickup scan, or support when exact data is required.
- DriverHome should document future backend needs, but it must remain implementable with the current API.

Future backend improvement:

- Add `GET /v1/driver/home` or extend `list_deliveries` with driver-safe fields:
  - `assignedAt`
  - `assignmentAcceptanceDueAt`
  - `acceptedAt`
  - `packageCount`
  - `verifiedLoadCount`
  - `openIssueCount`
  - `routeSequence`
  - `originStationName`
  - `destinationStationName`
  - `nextAction`
  - `nextActionDueAt`
  - `offlineSafeUntil`

Claude Code must not block DriverHome implementation waiting for that endpoint.

## Authorization Rules
Required principal:

- `role === "driver"`.

Driver scope:

- Use only deliveries returned by `list_deliveries`.
- Do not request unassigned work.
- Do not request station queues.
- Do not request admin launch readiness.
- Do not request other driver rosters.

Role failure:

- If role is missing, stale, or not `driver`, clear driver workspace cache and route to `/(auth)/driver/sign-in`.

Station ID:

- Driver principal does not require `stationId`.
- UI must not infer station authority from a driver session.

Privacy:

- Do not show receiver phone on DriverHome.
- Do not show sender ID.
- Do not show payment provider reference.
- Do not show assigned driver ID because it is the current user.
- Do not show other staff IDs.

## Data Loading Strategy
Initial load:

- Render shell instantly from local cache.
- Start `list_deliveries` refresh in background.
- Show cache age if cached records exist.
- Replace local data only after schema-valid response returns.

Online refresh:

- Pull to refresh calls `list_deliveries?limit=50`.
- Home should request no more than `50` records.
- If app supports active-only filters, first call should favor active statuses.

Offline read:

- Read from durable local cache.
- Show an offline banner with last successful sync timestamp.
- Keep action routing enabled only for screens that can operate from cached data and local outbox.

Stale data:

- If cache age is under `15 minutes`, show `Recently synced`.
- If cache age is `15` to `60 minutes`, show `Review before acting`.
- If cache age is over `60 minutes`, show `Reconnect before new handoff actions`.

Outbox:

- If queued driver actions exist, show count and oldest age.
- DriverHome must link to `/(ops)/offline-outbox`.
- Duplicate queued action protection belongs to action screens, but home must surface risk.

Conflict:

- If a queued action conflicts after reconnect, show an urgent conflict banner.
- Banner CTA: `Review sync conflict`.
- DriverHome must not silently remove conflicted work from the screen.

## Status Classification
DriverHome groups returned deliveries into operational lanes.

`new_assignment`:

- `currentStatus === "assigned_to_driver"`
- No local record of `driver_assignment_accepted`.
- Primary next action: `Review assignment`.

`pickup_required`:

- `currentStatus === "assigned_to_driver"`
- Local record indicates assignment accepted or station dispatch readiness has happened.
- Primary next action: `Scan pickup`.

`driver_custody`:

- `currentStatus === "dispatched_from_origin"` or `currentStatus === "in_transit"`.
- `currentCustodyRole` is not available from list response, so exact custody state must come from cached detail when present.
- Primary next action: `Continue route`.

`destination_ready`:

- `currentStatus === "in_transit"` and destination station is near or selected by driver from route screen.
- Home may show this only if route screen cached destination readiness.
- Primary next action: `Prepare handoff`.

`blocked`:

- `currentStatus === "issue_reported"` or `paymentStatus !== "paid"`.
- Primary next action: `Open issue` or `Contact station`.

`completed_or_inactive`:

- `currentStatus` in terminal or non-active states.
- Do not show as primary active card.
- Include in compact recent history strip only when useful.

## Active Run Selection
Home must select one active focus card.

Priority order:

1. Conflicted queued action.
2. Active driver custody run.
3. Assignment waiting for acceptance.
4. Pickup-ready assignment.
5. Blocked assigned run.
6. Most recent assigned delivery.
7. Empty state.

If more than one active run is returned:

- Show the most urgent run as the focus card.
- Show a small `Multiple assigned runs` warning.
- Link to `AssignedRuns`.
- Do not let the driver start unrelated actions from multiple cards on home.

One active inter-station run rule:

- The driver may hold only one active inter-station run at a time unless `ops_admin` overrides.
- Home should treat multiple active runs as operationally unusual and make it visible.

## Acceptance Deadline
Product rule:

- Drivers must accept or reject within `15 minutes` of assignment.

Current data limitation:

- `list_deliveries` does not expose `assignedAt`.

V1 screen behavior:

- If local notification payload or cached detail includes `assignedAt`, compute deadline as `assignedAt + 15 minutes`.
- If no trusted assigned timestamp exists, show `Acceptance deadline pending sync`.
- Never compute the acceptance timer from local screen render time.
- Never compute the acceptance timer from `latestOccurredAt` unless that event is known to be `driver_assigned`.

Visual treatment:

- Under `5 minutes`: amber countdown.
- Expired: red blocked state with CTA `Refresh assignment`.
- Unknown due time: neutral gray with CTA `Open assignment`.

## Information Architecture
Top to bottom:

1. Driver status header.
2. Sync and outbox strip.
3. Active run command card.
4. Next action rail.
5. Assignment summary and queue preview.
6. Recent route context.
7. Support and safety row.
8. Bottom navigation.

The top half of the screen must answer the active run and next action. Everything else is secondary.

## Layout Requirements
Compact phone:

- Single column.
- Sticky bottom action for the active next action.
- Sync strip sits below header and above active run.
- Queue preview is a compact vertical list.

Large phone:

- Single column with more breathing room.
- Active card can include a route mini-strip.

Foldable or tablet width:

- Two-pane layout.
- Left pane: active run and next action rail.
- Right pane: assigned queue and sync state.
- Bottom navigation may become navigation rail if the app shell supports it.

System UI:

- Respect safe areas.
- Do not place critical CTAs under gesture navigation.
- Keep bottom CTA above tab bar.

## Visual Direction
Mood:

- Reliable, rugged, clear, high-contrast, logistics-grade.

Color roles:

- Deep road ink for primary text.
- Warm amber for deadline pressure.
- Signal green for ready to continue.
- Red only for blockers, expired assignments, or conflicts.
- Blue-gray for offline and neutral sync states.

Material:

- Use strong surfaces with low visual noise.
- Use one command card, not many equal cards.
- Use thin dividers and spacing before heavy shadows.
- Avoid decorative map chrome.

Typography:

- Large operational headline for current next action.
- Tabular numerals for countdown and queued action counts.
- Compact but readable metadata.
- Never reduce body copy below accessible mobile size.

Icon style:

- Functional icons only:
  - route
  - scan
  - warning
  - sync
  - support
  - package
- No decorative vehicle illustrations.

## Header
Header content:

- Greeting: `Driver workspace`
- Secondary line: driver display name if available, otherwise `Assigned runs only`
- Duty status chip:
  - `Ready`
  - `Offline`
  - `Syncing`
  - `Action needed`
  - `Blocked`

Header actions:

- Notifications icon when unread driver notifications exist.
- Profile or sign-out entry as a small secondary action.

Header must not show:

- Earnings.
- Driver score.
- Fleet rank.
- Marketing copy.

## Sync Strip
Purpose:

- Tell the driver whether the visible assignments are current enough to act on.

States:

`online_fresh`:

- Label: `Synced just now`
- Tone: calm.
- Action: none.

`online_syncing`:

- Label: `Checking assignments`
- Include progress shimmer only in strip, not over the whole screen.

`offline_cached`:

- Label: `Offline - showing saved assignments`
- Secondary: `Last synced <relative time>`
- CTA: `Open outbox` if queued actions exist.

`stale_cache`:

- Label: `Saved assignments may be old`
- CTA: `Retry sync`

`outbox_pending`:

- Label: `<count> action(s) waiting to sync`
- Secondary: `Oldest <relative age>`
- CTA: `Review`

`sync_conflict`:

- Label: `Sync conflict needs review`
- CTA: `Resolve now`
- Tone: urgent.

Accessibility:

- Sync state changes must be announced as status messages.
- Do not move focus when sync state changes unless the user tapped a retry action.

## Active Run Command Card
This is the main component on the screen.

Required content:

- Status eyebrow.
- Primary next action headline.
- Tracking code.
- Origin station ID.
- Destination station ID.
- Service type.
- Doorstep flag if `doorstepRequested === true`.
- Latest update relative time.
- Deadline when trusted.
- Blocker if present.

Primary CTA by state:

- `Review assignment`
- `Open pickup scan`
- `Continue route`
- `Prepare handoff`
- `Open issue`
- `Refresh assignments`

Secondary actions:

- `View details`
- `Manifest`
- `Support`

Card hierarchy:

- Next action headline is largest.
- Tracking code is secondary but persistent.
- Stations are shown as route chips.
- Metadata is low emphasis.

Do not include:

- Full receiver profile.
- Full payment detail.
- Full package manifest.
- Long timeline.
- Large static map.

## Next Action Rail
The action rail is a horizontal or vertical set of up to three driver tasks.

Allowed actions:

- `Review assignment`
- `Scan pickup`
- `View manifest`
- `Continue route`
- `Mark in transit`
- `Prepare destination`
- `Report issue`

Ordering:

- Required next action first.
- Safety or blocker action second.
- Context action third.

Disabled action behavior:

- Disabled actions must explain why.
- Use a short reason:
  - `Needs assignment acceptance`
  - `Package scan required`
  - `Reconnect first`
  - `Station must receive this package`

No destructive actions are allowed on DriverHome.

## Assignment Queue Preview
Purpose:

- Show whether there is more assigned work without forcing a full list screen.

Content:

- Up to `3` assigned deliveries after the active focus card.
- Each row shows:
  - tracking code
  - status label
  - origin -> destination station IDs
  - latest update relative time
  - compact blocker mark if applicable

CTA:

- `View all assigned runs`

Empty behavior:

- If no assigned deliveries exist, replace preview with empty state.

## Empty State
Title:

- `No assigned runs right now`

Body:

- `Assigned station work appears here after a dispatcher assigns it to your driver account.`

Actions:

- `Refresh`
- `Contact station`

Rules:

- Do not imply the driver can claim work.
- Do not show unassigned station packages.
- Do not show route map.

## Blocked State
Triggers:

- `paymentStatus !== "paid"`.
- `currentStatus === "issue_reported"`.
- API returns `FORBIDDEN`, `ASSIGNMENT_SCOPE_VIOLATION`, or `INVALID_STATUS_TRANSITION` after action route returns.
- Sync conflict exists.
- Cache too stale for a new handoff action.

Blocked card content:

- Clear reason.
- Last trusted update.
- Owning next party if known.
- Safe CTA.

CTA rules:

- Payment blocker: `Contact station`.
- Issue blocker: `Open issue`.
- Scope blocker: `Refresh assignments`.
- Sync conflict: `Resolve now`.

## Offline Behavior
Home must be useful offline, but not reckless.

Allowed offline:

- Read cached assigned runs.
- Open cached run detail.
- Open cached manifest.
- View outbox.
- Prepare route context if previously cached.
- Start support issue draft for later sync when linked delivery is cached.

Blocked offline:

- Fetch new assignments.
- Accept a run if no fresh assignment snapshot exists.
- Confirm pickup if package scan binding is not cached.
- Mark in transit if required prior action is missing locally.
- Clear sync conflict.

Offline CTA rules:

- If an action can be queued, label it honestly: `Queue action`.
- If an action cannot be safely queued, label it: `Reconnect to continue`.
- Never show `Done` until server response or durable local queue exists, depending on the action policy.

## Cache Rules
Local cache objects:

- `driverHomeDeliveryList`
- `driverHomeLastSyncedAt`
- `driverHomeDerivedActiveRun`
- `driverOutboxSummary`
- `driverCachedRunSummaries`

Cache storage:

- Durable encrypted app storage where available.
- Must be cleared on sign-out or role mismatch.

Cache invalidation:

- Clear driver cache when authenticated `userId` changes.
- Clear driver cache when role is not `driver`.
- Refresh cache after any successful driver action.
- Mark cache stale after `15 minutes` for deadline-sensitive actions.

Privacy:

- Do not persist receiver phone on DriverHome cache.
- Do not persist payment provider metadata.

## API Request Shape
Initial read:

```http
GET /v1/deliveries?limit=50
Authorization: Bearer <token>
```

Optional filtered reads:

```http
GET /v1/deliveries?status=assigned_to_driver&limit=50
GET /v1/deliveries?status=dispatched_from_origin&limit=50
GET /v1/deliveries?status=in_transit&limit=50
GET /v1/deliveries?status=issue_reported&limit=50
```

Recommended v1 approach:

- Use one unfiltered `limit=50` read unless performance proves a need for segmented reads.
- Derive groups locally.
- Avoid four parallel reads by default because low-bandwidth conditions matter.

## Data Mapping
Map `deliveryListResponseSchema.deliveries[]` into:

```ts
type DriverHomeRunRow = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  originStationId: string;
  destinationStationId: string;
  serviceType: ServiceType;
  receiverName: string;
  latestOccurredAt: string;
  latestTouchpointRole: DeliveryTouchpointRole;
  latestTouchpointStationId?: string;
  doorstepRequested: boolean;
};
```

Derived fields:

- `statusLabel`
- `urgency`
- `nextAction`
- `nextRoute`
- `blockedReason`
- `isActiveCandidate`
- `isStale`

Derived status labels:

- `assigned_to_driver`: `Assigned`
- `dispatched_from_origin`: `Picked up`
- `in_transit`: `In transit`
- `arrived_at_destination`: `At destination`
- `received_at_destination`: `Received by station`
- `issue_reported`: `Issue reported`
- `cancelled`: `Cancelled`
- Other statuses: use safe shared status label if available.

## Next Action Decision Table
| Condition | Next action | Route | CTA label |
| --- | --- | --- | --- |
| No cached or server deliveries | Refresh or contact station | same screen | `Refresh` |
| `paymentStatus !== "paid"` | Stop and contact station | `/(ops)/driver/support` | `Contact station` |
| `currentStatus === "assigned_to_driver"` and no trusted accepted state | Review assignment | `/(ops)/driver/runs/:deliveryId/accept` | `Review assignment` |
| `currentStatus === "assigned_to_driver"` and accepted locally | Scan pickup | `/(ops)/driver/runs/:deliveryId/pickup-scan` | `Open pickup scan` |
| `currentStatus === "dispatched_from_origin"` | Continue route | `/(ops)/driver/runs/:deliveryId/route` | `Continue route` |
| `currentStatus === "in_transit"` | Route or destination prep | `/(ops)/driver/runs/:deliveryId/route` | `Continue route` |
| `currentStatus === "issue_reported"` | Review issue | `/(ops)/driver/support` | `Open issue` |
| `currentStatus` terminal | View detail | `/(ops)/driver/runs/:deliveryId` | `View details` |

## Interaction Flow
1. Driver opens home.
2. App renders cached shell and sync strip.
3. App validates role from auth state.
4. App reads cached driver delivery list.
5. App starts `list_deliveries` refresh.
6. App groups returned assigned deliveries.
7. App chooses active focus run.
8. Driver taps primary CTA.
9. App routes to next screen with `deliveryId`.
10. Returned action result refreshes home cache and outbox summary.

## Navigation Rules
Primary CTA:

- Must always route to one next screen, not open an action menu.

Back behavior:

- Back from home exits role shell or returns to shared ops role home depending app shell.
- Back from downstream driver routes returns to home with updated cache.

Deep links:

- If deep link references delivery not present in driver assigned list, route to home and show `That run is not assigned to this account.`
- If deep link references cached delivery while offline, allow read-only detail and block unsafe actions.

Tab reselection:

- Reselecting DriverHome scrolls to top and triggers refresh if online.

## Error States
`loading_first_time`:

- No cache.
- Show skeleton for header, sync strip, and command card.
- No blank screen.

`offline_first_time`:

- No cache and no network.
- Title: `No saved assignments on this device`
- Body: `Reconnect once to load assigned runs.`
- CTA: `Retry`

`api_error`:

- Keep cached data if present.
- Banner: `Could not refresh assignments`
- CTA: `Retry`

`unauthorized`:

- Clear driver cache.
- Route to sign-in.

`forbidden_scope`:

- Clear affected delivery from active focus.
- Banner: `This run is not assigned to this driver account.`
- CTA: `Refresh assignments`

`schema_error`:

- Do not write response into cache.
- Show cached data if present.
- Log non-sensitive validation event.

`empty_online`:

- Show empty state.
- Keep support contact action.

`sync_conflict`:

- Highest priority state.
- CTA routes to outbox conflict detail.

## Copy
Screen title:

- `Driver workspace`

Primary active title variants:

- `Your assigned run is ready`
- `Pickup scan needed`
- `You have custody`
- `Continue to destination`
- `Run needs attention`

Sync messages:

- `Synced just now`
- `Checking assignments`
- `Offline - showing saved assignments`
- `Saved assignments may be old`
- `Action waiting to sync`
- `Sync conflict needs review`

Empty state:

- `No assigned runs right now`
- `Assigned station work appears here after a dispatcher assigns it to your driver account.`

Blocked copy:

- Payment: `Station must resolve payment before driver movement.`
- Issue: `This run has an issue that needs review before the next action.`
- Scope: `This run is not assigned to this driver account.`
- Stale: `Reconnect before starting a new handoff action.`

CTA labels:

- `Review assignment`
- `Open pickup scan`
- `Continue route`
- `View manifest`
- `Report issue`
- `Refresh`
- `Open outbox`

## Content Rules
Use exact operational words:

- `Assigned`
- `Picked up`
- `In transit`
- `Handoff pending`
- `Issue reported`
- `Offline`
- `Synced`

Avoid vague words:

- `Ready` without saying ready for what.
- `Complete` unless backend state is terminal.
- `On the way` when backend status is not `in_transit`.
- `Delivered` unless receiver completion exists.

## Component Inventory
`DriverHomeScreen`:

- Owns page route, data hook, and state composition.

`DriverHomeHeader`:

- Shows title, duty chip, profile action, and notification action.

`DriverSyncStrip`:

- Shows connectivity, cache age, outbox count, and conflict state.

`ActiveRunCommandCard`:

- Shows current run and primary CTA.

`DriverNextActionRail`:

- Shows up to three allowed next actions.

`DriverAssignedQueuePreview`:

- Shows remaining assigned runs.

`DriverEmptyAssignments`:

- Handles no assigned work.

`DriverBlockedRunNotice`:

- Shows blockers and safe CTA.

`DriverSafetySupportRow`:

- Links support, issue reporting, and emergency station contact if exposed.

`DriverHomeSkeleton`:

- First-load only.

`DriverHomeErrorBanner`:

- Non-blocking refresh, schema, and scope errors.

## State Model
```ts
type DriverHomeState =
  | { kind: "loading_first_time" }
  | { kind: "ready"; activeRun?: DriverHomeRun; queue: DriverHomeRun[]; sync: DriverSyncState }
  | { kind: "empty_online"; sync: DriverSyncState }
  | { kind: "offline_cached"; activeRun?: DriverHomeRun; queue: DriverHomeRun[]; sync: DriverSyncState }
  | { kind: "offline_first_time" }
  | { kind: "api_error"; recoverable: boolean; cached?: DriverHomeReadyData }
  | { kind: "unauthorized" }
  | { kind: "sync_conflict"; conflictCount: number; cached?: DriverHomeReadyData };
```

Sync state:

```ts
type DriverSyncState = {
  network: "online" | "offline" | "unknown";
  refresh: "idle" | "refreshing" | "failed";
  lastSyncedAt?: string;
  cacheAgeMinutes?: number;
  queuedActionCount: number;
  oldestQueuedActionAgeMinutes?: number;
  conflictCount: number;
};
```

## Accessibility
Targets:

- Primary CTA minimum visual height: `56dp`.
- Secondary row actions minimum touch height: `48dp`.
- Icon-only actions require accessible labels.
- Do not cluster two tap targets closer than comfortable thumb spacing.

Screen reader:

- Header announces role and sync state.
- Active run card announces next action, tracking code, route, status, and deadline.
- Sync changes use programmatic status announcements.
- Countdown should not announce every second. Announce only threshold changes.

Focus:

- First focus after screen load: screen heading.
- Pull-to-refresh completion should not steal focus.
- Error banner action should be reachable immediately after banner content.

Color:

- Status cannot rely on color alone.
- Every status chip needs text.
- Deadline states need icon and copy.

Motion:

- Use short entrance transition for active card only.
- Sync strip changes should crossfade.
- Respect reduced motion.
- No looping route animation.

## Field Ergonomics
One-hand use:

- Primary CTA must sit in lower comfortable thumb zone on compact phones.
- Secondary actions can sit inside card but must not crowd primary CTA.

Glare:

- High contrast text.
- Avoid thin low-contrast gray text for deadlines.

Vehicle context:

- The screen must not require typing.
- Main actions should be tap or scan driven.

Low-end devices:

- Avoid large map rendering on home.
- Avoid heavy animation.
- Use flat list rendering for queue preview.

## Analytics
Events:

- `driver_home_viewed`
- `driver_home_refresh_started`
- `driver_home_refresh_succeeded`
- `driver_home_refresh_failed`
- `driver_home_cache_rendered`
- `driver_home_offline_rendered`
- `driver_home_active_run_opened`
- `driver_home_primary_action_tapped`
- `driver_home_manifest_opened`
- `driver_home_outbox_opened`
- `driver_home_sync_conflict_opened`
- `driver_home_support_opened`
- `driver_home_scope_denied`
- `driver_home_stale_cache_warning_shown`

Required event properties:

- `deliveryId` when action is delivery-linked.
- `currentStatus`
- `paymentStatus`
- `nextAction`
- `networkState`
- `cacheAgeBucket`
- `queuedActionCountBucket`
- `conflictCountBucket`

Forbidden analytics properties:

- Receiver name.
- Receiver phone.
- Sender ID.
- Raw token.
- Payment provider reference.
- Package scan code.
- Exact location.

## QA Acceptance Criteria
Routing:

- Root screen exposes `screen-driver-home`.
- Route is `/(ops)/driver/home`.
- Driver role can access screen.
- Non-driver roles are redirected to sign-in or role home.

Data:

- Screen calls `list_deliveries`.
- Screen does not call station queue APIs.
- Screen does not call admin APIs.
- Screen shows only returned driver-scoped deliveries.
- Screen handles empty response.
- Screen handles schema-invalid response without corrupting cache.

Active run:

- Active run appears before queue preview.
- Next action changes according to status.
- Payment blocker prevents movement CTA.
- Issue blocker routes to support.
- Multiple active runs show warning and link to full assigned runs.

Offline:

- Cached assigned runs render offline.
- Cache age is visible.
- First-time offline state is clear.
- Outbox count is visible when queued actions exist.
- Sync conflict outranks normal active run card.

Accessibility:

- Primary CTA is reachable by screen reader.
- Sync updates are announced as status messages.
- Countdown threshold change is announced without noisy per-second updates.
- All icon-only buttons have accessible names.
- Large text does not hide primary CTA.

Performance:

- First cached paint target under `700ms` on average field device.
- Pull refresh does not block scroll.
- Queue preview renders at most `3` rows.
- No home map tile download is required.

## Test Matrix
Role tests:

- Driver sees assigned deliveries.
- Sender cannot access DriverHome.
- Station operator cannot access DriverHome.
- Final-mile courier cannot access DriverHome.
- Admin does not see driver-only home through driver route.

Data tests:

- Empty assigned list shows empty state.
- One assigned delivery shows active command card.
- Multiple assigned deliveries show active card plus queue preview.
- `paymentStatus !== "paid"` shows blocker.
- `issue_reported` shows issue route.
- `assigned_to_driver` routes to accept screen.
- `dispatched_from_origin` routes to route screen.
- `in_transit` routes to route screen.

Offline tests:

- With cache and offline, screen renders cached assigned runs.
- Without cache and offline, screen shows first-time offline state.
- Stale cache disables unsafe handoff actions.
- Queued action count links to outbox.
- Conflict banner routes to conflict review.

Cache tests:

- Cache clears after sign-out.
- Cache clears when user ID changes.
- Cache is not replaced by invalid response.
- Successful refresh updates `lastSyncedAt`.

Accessibility tests:

- Screen reader announces heading and sync state.
- Primary CTA label includes action and destination when available.
- Countdown threshold changes are announced.
- Touch targets meet or exceed mobile standards.

## Implementation Notes For Claude Code
Create under:

- `apps/mobile/features/driver/home`

Suggested files:

- `DriverHomeScreen.tsx`
- `DriverHomeHeader.tsx`
- `DriverSyncStrip.tsx`
- `ActiveRunCommandCard.tsx`
- `DriverNextActionRail.tsx`
- `DriverAssignedQueuePreview.tsx`
- `DriverHomeEmptyState.tsx`
- `DriverHomeErrorBanner.tsx`
- `useDriverHome.ts`
- `driverHomeState.ts`
- `driverHomeMapping.ts`
- `driverHomeCache.ts`
- `driverHome.analytics.ts`
- `DriverHomeScreen.test.tsx`

Required implementation behavior:

- Use typed API client for `list_deliveries`.
- Use local cache as first paint source.
- Use backend response as source of truth after refresh.
- Validate response through shared schema.
- Keep mapping pure and testable.
- Keep UI components presentational where possible.
- Route actions through existing driver route constants.
- Do not implement new backend endpoints.
- Do not add actual map rendering to home.

## Out Of Scope
- Building full assigned-runs list.
- Building accept/reject workflow.
- Building pickup scanner.
- Building route navigation.
- Building destination handoff.
- Building earnings.
- Building support thread detail.
- Adding backend driver home aggregate endpoint.
- Showing live driver GPS on home.
- Letting driver claim unassigned work.

## Done Definition
DriverHome is complete when:

- The screen is implemented at `/(ops)/driver/home`.
- The top-level test ID is `screen-driver-home`.
- It reads `list_deliveries` with authenticated driver scope.
- It renders cached assigned runs offline.
- It shows one active run command card with the correct next action.
- It surfaces cache age, queued actions, and sync conflicts.
- It protects assignment scope and role boundaries.
- It avoids unsupported backend assumptions.
- It routes every primary action to the correct next driver screen.
- It passes role, data, offline, accessibility, and cache tests.

## Claude Code Handoff Summary
Build `DriverHome` as a serious driver operations cockpit. It must use `list_deliveries` as the only current backend read, render driver-scoped cached assigned runs before refresh, choose one active run, show the next safe action, expose sync and outbox health, and prevent unsafe work when cache or assignment data is stale. Do not add new backend endpoints, do not show unassigned work, do not show sensitive receiver or payment data, and do not make home a full route, manifest, earnings, or support screen.
