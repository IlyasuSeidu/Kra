# RTK Query Cache Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | RTK Query cache |
| Component family | Shared UI infrastructure |
| Primary modules | `kraApi`, `kraApiTags`, `cacheTagPolicy`, `cacheFreshnessPolicy`, `cacheInvalidationPolicy`, `cachePersistencePolicy`, `cacheTelemetry` |
| Supporting modules | `DeliveryCacheAdapter`, `TimelineCacheAdapter`, `PaymentCacheAdapter`, `IssueCacheAdapter`, `NotificationCacheAdapter`, `StationQueueCacheAdapter`, `AdminCacheAdapter`, `PublicTrackingCacheAdapter`, `CacheFreshnessBadge`, `CacheSafetyGate` |
| Inventory behavior | Normalize server state and invalidate by delivery, issue, payment, station, notification |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, optional shared frontend API package |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, admins, support, finance, operations leads |
| Backend coverage | typed API client, `/v1` REST operations, delivery lifecycle, handoff mutations, payment mutations, issue mutations, notification list, station/admin lists, public tracking |
| Browser mutation operation | None directly; cache rules govern reads, mutation invalidation, optimistic patches when approved, and offline replay refresh |
| Data sensitivity | delivery IDs, tracking codes, receiver data, payment state, issue state, station queue data, staff assignments, proof status, notification state, admin data |
| Offline critical | Yes for operations mobile read continuity; no for admin mutations; limited for sender read continuity |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, offline outbox, role routing, app shells, timeline component, custody chain component, payment status component, issue status component, test harness |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, payment under review, refund pending, custody not confirmed, scan mismatch |
| Design tokens | No unique visual tokens; cache states must use existing stale, offline, loading, warning, and success tokens |
| Accessibility target | Cache freshness and background refresh changes must be conveyed through accessible state components without focus theft |

## Purpose
The RTK Query cache is Kra's server-state coordination layer.

It decides how public, sender, operations, and admin screens share fetched data, when they refresh, what they invalidate after mutations, how stale data is marked, and how offline-capable field screens continue without pretending cached data is live.

The cache must answer:

- Which endpoint owns each server state record?
- Which tags represent delivery, payment, timeline, issue, notification, station, and admin records?
- Which mutations invalidate which records and lists?
- Which data can be shown while stale?
- Which data must be refreshed before action?
- Which operation can patch cache optimistically?
- Which operations must wait for backend confirmation?
- Which cache data can be persisted for offline reads?
- Which cache data must clear on sign-out, role change, or station scope change?
- Which public cache data must never hydrate authenticated app data?

The most important rule is:

```text
Kra may use cached data for orientation, but backend-confirmed fresh data or approved offline outbox policy is required before package custody, proof, payment, refund, station validation, pricing, or access-control action.
```

## Product Job
Kra will have many screens reading the same backend facts.

The RTK Query cache must:

- prevent duplicate fetch logic across screens
- keep sender, staff, and admin views consistent after mutations
- keep operations mobile useful on weak networks
- mark cached and stale data visibly
- prevent stale data from authorizing risky actions
- keep public tracking data privacy-safe and separate
- keep admin data isolated from mobile users
- invalidate only the affected entity and queue families when possible
- preserve request lifecycle metadata for loading and error states
- support polling where the product truly needs it
- integrate with offline outbox replay without causing duplicate package actions
- support CI tests that prove cache policy matches the frontend inventory

The cache must be strict enough for operations and light enough for public pages.

## Strategic Role
Kra's delivery chain depends on several people seeing the same truth at different times:

- sender sees payment and delivery progress
- station operator sees intake, outbound, inbound, final-mile, and blocked queues
- driver sees assigned runs and custody status
- final-mile courier sees doorstep assignments and proof requirements
- admin sees launch readiness, finance, issues, stations, users, webhooks, and audit events
- receiver sees only public-safe tracking facts

If cache invalidation is weak, a screen can show a package in the wrong queue after a handoff. If it is too broad, every action creates slow refetch storms. If stale data is hidden, field workers cannot operate in low-bandwidth environments. If stale data is trusted too much, goods can be lost.

The cache is therefore part of operational safety, not just performance.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing the Kra frontend data layer.

Surface type:

- Non-visual cache infrastructure with small visible freshness indicators used by screens.

Primary action:

- Keep each screen reading the right server state and refreshing the right dependent state after each mutation.

Visual thesis:

- `Verified freshness`: data can be fast and cached, but the UI always shows whether it is live, refreshing, stale, offline, or blocked from action.

Restraint rule:

- Do not make every screen show cache internals. Show freshness only where it changes trust, action safety, or recovery.

Density:

- Cache policy is detailed in infrastructure; screen usage should be simple.

Platform stance:

- Use one RTK Query API slice per Kra backend base URL per app runtime, with endpoint injection allowed by domain. Use typed API client endpoints as the only transport path.

## External Research Used
Only directly relevant RTK Query cache references were used:

- [Redux Toolkit `createApi`](https://redux-toolkit.js.org/rtk-query/api/createApi): supports API slices, endpoint definitions, tag types, generated hooks, `keepUnusedDataFor`, refetch options, and code-splitting through endpoint injection.
- [RTK Query cache behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior): supports query cache keys, reference-counted subscriptions, cache lifetimes, and reuse of cached data for matching endpoint arguments.
- [RTK Query automated re-fetching](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching): supports tag-based invalidation and re-fetching based on `providesTags` and `invalidatesTags`.
- [RTK Query manual cache updates](https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates): supports `updateQueryData`, `upsertQueryData`, optimistic updates, and pessimistic updates where cache should change after server success.
- [RTK Query polling](https://redux-toolkit.js.org/rtk-query/usage/polling): supports query polling for screens that need periodic refresh.
- [RTK Query persistence and rehydration](https://redux-toolkit.js.org/rtk-query/usage/persistence-and-rehydration): supports rehydrating API slice state, with stronger fit for native apps than browser tabs.
- [RTK Query code splitting](https://redux-toolkit.js.org/rtk-query/usage/code-splitting): supports injecting endpoints into one API slice while keeping domain files separate.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/06-architecture/frontend-architecture.md`
- `docs/06-architecture/system-architecture.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/09-operations/delivery-lifecycle.md`
- `docs/09-operations/handoff-scan-policy.md`
- `docs/09-operations/proof-of-delivery-policy.md`
- `docs/10-payments/payment-architecture.md`
- `docs/10-payments/refund-and-dispute-rules.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/14-platform/observability-and-alerting.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/routes.ts`
- existing screen specs for sender, operations, station, driver, courier, admin, receiver, shared states, and shared operational modals

## Non-Goals
The RTK Query cache must not:

- implement actual frontend screens
- replace the typed API client
- replace backend authorization
- become local custody authority
- calculate pricing locally
- approve refunds locally
- decide station validation locally
- store raw proof files
- store receiver verification tokens
- persist admin data into mobile storage
- hydrate public tracking into authenticated delivery detail
- hide stale risk from field users
- retry dangerous mutations by itself
- resolve offline outbox conflicts by itself
- infer user permissions from cached navigation alone

## Cache Architecture
Each app runtime must use one primary `kraApi` slice for the Kra API base URL.

Required properties:

- `reducerPath`: stable per app runtime, such as `kraApi`
- `baseQuery`: typed API client base query
- `tagTypes`: full Kra tag list
- `serializeQueryArgs`: stable where filter object ordering could differ
- `keepUnusedDataFor`: app-specific default
- `refetchOnReconnect`: enabled for mobile operations and sender app
- `refetchOnFocus`: enabled where platform supports it safely
- endpoint injection by domain allowed

Rules:

- Do not create one API slice per feature when the base URL is the same.
- Do not create separate API slices that need cross-domain invalidation.
- Domain files may inject endpoints into the same API slice.
- Store setup must include exactly one middleware for the Kra API slice per runtime.
- Public web, mobile, and admin may have different endpoint subsets, but each runtime keeps its own slice.
- Server-only operations must not be injected into frontend slices.

## Tag Taxonomy
The canonical tag list:

```ts
type KraApiTag =
  | "Delivery"
  | "DeliveryList"
  | "DeliveryTimeline"
  | "PublicTracking"
  | "Payment"
  | "ProofAsset"
  | "Issue"
  | "IssueList"
  | "Notification"
  | "NotificationList"
  | "Station"
  | "StationQueue"
  | "DriverQueue"
  | "CourierQueue"
  | "AdminOverview"
  | "AdminDeliveryList"
  | "AdminStationList"
  | "AdminFinance"
  | "PricingRules"
  | "AdminUserList"
  | "User"
  | "LaunchReadiness"
  | "AuditEventList"
  | "OutboundNotificationList"
  | "PaymentReconciliation"
  | "WebhookEventList";
```

Rules:

- Entity tags should use IDs when response data provides stable IDs.
- List tags should use route and filter classes when the query has filters.
- Public tags must not share IDs with private tags in a way that hydrates private data.
- Admin list tags must not invalidate mobile list tags unless the underlying delivery or station entity truly changed.
- Queue tags represent operational list membership, not a new backend entity.

## Query Cache Keys
Query cache keys must be stable.

Rules:

- cache keys must include operation ID.
- path params must be included in a stable object.
- query params must be sorted or serialized deterministically.
- undefined query params must be omitted.
- role, user ID, and station scope must participate in cache isolation where the endpoint response is scoped by principal.
- public tracking cache key must include tracking code only after it passes tracking code validation.
- receiver verification token must never be part of a serialized cache key.
- admin filters must produce stable keys even if the filter object is built in different property order.

Required cache key classes:

| Class | Key shape |
| --- | --- |
| public tracking | `get_public_tracking:trackingCode` |
| delivery detail | `get_delivery:deliveryId:userScope` |
| delivery list | `list_deliveries:role:stationScope:filters` |
| timeline | `get_delivery_timeline:deliveryId:userScope` |
| issue detail | `get_issue:issueId:userScope` |
| issue list | `list_issues:role:filters` |
| notification list | `list_notifications:userId:filters` |
| admin list | `operationId:adminRole:filters` |
| station list | `admin_stations:adminRole` |

## Freshness States
Every cache-backed screen must be able to derive freshness.

Canonical freshness states:

```ts
type CacheFreshnessState =
  | "first_load"
  | "live"
  | "refreshing"
  | "cached_fresh"
  | "cached_stale"
  | "offline_cached"
  | "offline_empty"
  | "refresh_failed_with_cache"
  | "blocked_until_refresh";
```

Rules:

- `first_load` means no cached data and network request is running.
- `live` means data came from current successful network response.
- `refreshing` means data is visible while an explicit refresh is running.
- `cached_fresh` means cached data is within the route freshness threshold.
- `cached_stale` means cached data exists but is beyond the freshness threshold.
- `offline_cached` means no network is available and cached data exists.
- `offline_empty` means no network and no safe cached data exists.
- `refresh_failed_with_cache` means last refresh failed but existing cached data can remain visible.
- `blocked_until_refresh` means cached data exists but action safety requires a successful refresh.

## Freshness Thresholds
Freshness thresholds must be conservative for custody and payment.

| Data family | Fresh for | Stale after | Action safety |
| --- | --- | --- | --- |
| Public tracking | 2 minutes | 5 minutes | read-only |
| Sender delivery list | 2 minutes | 10 minutes | read-only actions may continue |
| Sender delivery detail | 1 minute | 5 minutes | payment, cancel, support action must refresh first when stale |
| Delivery timeline | 2 minutes | 15 minutes | read-only timeline may remain visible |
| Station queue | 30 seconds | 2 minutes | handoff actions require live or offline-approved action path |
| Driver queue | 30 seconds | 2 minutes | pickup and transit actions require live or offline-approved action path |
| Courier queue | 30 seconds | 2 minutes | proof and completion require live or offline-approved action path |
| Payment status | 15 seconds while processing | 1 minute | payment result actions require refresh |
| Issue detail | 2 minutes | 10 minutes | admin/support action requires refresh if stale |
| Notification list | 5 minutes | 30 minutes | read-only |
| Admin overview | 1 minute | 5 minutes | read-only |
| Admin finance | 30 seconds | 2 minutes | refund actions require refresh |
| Admin station list | 1 minute | 5 minutes | station override requires refresh |
| Pricing rules | 5 minutes | 15 minutes | updates require fresh active rules |
| User list | 2 minutes | 10 minutes | access mutation requires fresh user detail |
| Webhook events | 1 minute | 5 minutes | replay action requires detail refresh if added later |

Screens may choose stricter thresholds, never looser thresholds, unless this spec is updated.

## Persistence Policy
RTK Query state persistence is allowed only for approved native operations reads.

Allowed to persist on operations mobile:

- role-scoped delivery list summaries
- delivery detail fields needed for field orientation
- timeline labels and timestamps
- station, driver, and courier queue summaries
- issue summaries needed for blocked queue and support context
- notification summaries without sensitive bodies where policy permits
- cache timestamps and stale markers

Not allowed to persist:

- auth tokens
- receiver verification tokens
- OTPs
- raw proof files
- proof upload URLs
- raw proof URLs
- full receiver addresses unless the route screen policy explicitly needs cached route context
- admin finance data
- payment provider references outside approved finance context
- webhook payloads
- internal task data
- user-management admin data in mobile storage

Rules:

- persisted cache must be keyed by authenticated user ID and role.
- station-scoped cache must be keyed by station ID.
- role mismatch must clear role cache.
- sign-out must clear authenticated cache.
- station scope change must clear station queue cache.
- app version or schema version change may invalidate persisted cache.
- public web should not persist RTK Query state beyond normal browser memory unless a specific policy approves it.
- admin web should not persist sensitive admin query data across sign-out.

## Cache Isolation
Cache isolation prevents data leakage across users and roles.

Required isolation dimensions:

- app surface
- authenticated user ID
- role
- station scope
- admin capability family where applicable
- tracking code for public tracking

Clear cache when:

- user signs out
- auth token cannot refresh
- `kra_role` changes
- `kra_station_id` changes
- user status becomes inactive
- admin role changes
- receiver public flow ends or token expires
- app detects schema version mismatch

Do not clear cache when:

- background refresh fails and safe cached data exists
- network temporarily drops
- user opens a child route that reads the same delivery
- an offline outbox action is queued but not replayed yet

## Loading Policy
RTK Query states must map to shared loading components.

Rules:

- first load with no data shows a loading state.
- refetch with existing data shows current data plus refreshing indicator.
- background refetch must not replace the entire screen with a spinner.
- operations queue screens must show cache age during refetch.
- public pages can use subtle loading if data is non-critical.
- admin list screens should preserve filters and table structure during refetch.

## Stale Data Policy
Stale data is allowed for orientation, not for unsafe authority.

Allowed while stale:

- view delivery summary
- view timeline labels
- view queue rows with stale badge
- open read-only detail where cached detail exists
- review issue summary
- review notification summary
- open public tracking with stale marker

Blocked while stale unless offline policy allows the mutation:

- package custody transfer
- package scan confirmation
- proof completion
- payment initialization
- refund decision
- refund settlement
- pricing rule update
- station status override
- station validation mutation
- user access mutation
- issue escalation or resolution

## Offline Read Policy
Operations mobile must support offline read continuity.

Allowed offline:

- read cached assigned work
- read cached station queues
- read cached driver run detail
- read cached courier assignment detail
- read cached handoff timeline
- read cached issue context
- open offline outbox
- prepare an approved queued action when the screen policy permits it

Blocked offline:

- first-time protected data load without cache
- admin actions
- sender payment actions
- refund actions
- pricing updates
- station validation
- user access changes
- any action missing an idempotency key
- any action missing required cached evidence

Rules:

- offline state must show cache age.
- offline state must show queued action count when relevant.
- stale cache must never look like live data.
- reconnect must trigger targeted refetch for active work.
- outbox drain must invalidate affected tags.

## Tag Provision Rules
Every query must provide tags.

Required query tags:

| Operation | Provides tags |
| --- | --- |
| `get_public_tracking` | `PublicTracking:{trackingCode}` |
| `list_deliveries` | `DeliveryList:{scope}`, `Delivery:{deliveryId}` for each row |
| `get_delivery` | `Delivery:{deliveryId}`, `Payment:{deliveryId}` |
| `get_delivery_timeline` | `DeliveryTimeline:{deliveryId}` |
| `list_issues` | `IssueList:{scope}`, `Issue:{issueId}` for each row |
| `get_issue` | `Issue:{issueId}`, `Delivery:{deliveryId}` when present |
| `list_notifications` | `NotificationList:{userId}`, `Notification:{notificationId}` for each row |
| `admin_overview` | `AdminOverview` |
| `admin_deliveries` | `AdminDeliveryList:{filters}`, `Delivery:{deliveryId}` for each row |
| `admin_stations` | `AdminStationList`, `Station:{stationId}` for each row |
| `admin_launch_readiness` | `LaunchReadiness`, `Station:{stationId}` when blockers reference stations |
| `admin_finance` | `AdminFinance`, `Payment:{paymentId}` when present |
| `admin_pricing_rules` | `PricingRules` |
| `admin_users` | `AdminUserList:{filters}`, `User:{userId}` for each row |
| `admin_audit_events` | `AuditEventList:{filters}` |
| `admin_outbound_notifications` | `OutboundNotificationList:{filters}` |
| `admin_payment_reconciliation` | `PaymentReconciliation:{filters}`, `Payment:{paymentId}` when present |
| `admin_webhook_events` | `WebhookEventList:{filters}` |

If a response does not include row IDs, provide the list tag and update this spec when IDs are added.

## Mutation Invalidation Rules
Every mutation must invalidate targeted tags.

Required invalidation:

| Operation | Invalidates tags |
| --- | --- |
| `create_delivery` | `DeliveryList:{senderScope}` |
| `cancel_delivery` | `Delivery:{deliveryId}`, `DeliveryList:{senderScope}`, `Payment:{deliveryId}`, `DeliveryTimeline:{deliveryId}` |
| `request_public_tracking_phone_challenge` | `PublicTracking:{trackingCode}` after verified grant response |
| `verify_public_tracking_phone` | `PublicTracking:{trackingCode}` |
| `initialize_payment` | `Payment:{deliveryId}`, `Delivery:{deliveryId}` |
| `verify_payment` | `Payment:{deliveryId}`, `Delivery:{deliveryId}`, `DeliveryList:{senderScope}` |
| `refund_payment` | `Payment:{paymentId}`, `AdminFinance`, `Delivery:{deliveryId}` |
| `settle_refund_payment` | `Payment:{paymentId}`, `AdminFinance`, `Delivery:{deliveryId}` |
| `confirm_intake` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `StationQueue:{originStationId}`, `DeliveryList:{stationScope}` |
| `assign_driver` | `Delivery:{deliveryId}`, `StationQueue:{originStationId}`, `DriverQueue:{driverUserId}` |
| `accept_run` | `Delivery:{deliveryId}`, `DriverQueue:{driverUserId}` |
| `dispatch_delivery` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `StationQueue:{originStationId}` |
| `confirm_pickup` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `DriverQueue:{driverUserId}`, `StationQueue:{originStationId}` |
| `mark_in_transit` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `DriverQueue:{driverUserId}` |
| `receive_destination` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `StationQueue:{destinationStationId}`, `DriverQueue:{driverUserId}` |
| `assign_final_mile` | `Delivery:{deliveryId}`, `StationQueue:{destinationStationId}`, `CourierQueue:{courierUserId}` |
| `accept_final_mile_assignment` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `CourierQueue:{courierUserId}` |
| `mark_out_for_delivery` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `CourierQueue:{courierUserId}`, `PublicTracking:{trackingCode}` |
| `record_failed_attempt` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `CourierQueue:{courierUserId}`, `IssueList:{opsScope}`, `PublicTracking:{trackingCode}` |
| `create_delivery_proof_asset` | `ProofAsset:{proofAssetId}`, `Delivery:{deliveryId}` |
| `confirm_delivery_proof_asset_upload` | `ProofAsset:{proofAssetId}`, `Delivery:{deliveryId}` |
| `complete_delivery` | `Delivery:{deliveryId}`, `DeliveryTimeline:{deliveryId}`, `CourierQueue:{courierUserId}`, `PublicTracking:{trackingCode}` |
| `create_issue` | `IssueList:{scope}`, `Delivery:{deliveryId}` |
| `escalate_issue` | `Issue:{issueId}`, `IssueList:{scope}` |
| `resolve_issue` | `Issue:{issueId}`, `IssueList:{scope}`, `Delivery:{deliveryId}` |
| `admin_update_pricing_rules` | `PricingRules`, `AdminOverview`, `LaunchReadiness` |
| `admin_upsert_user` | `AdminUserList:{filters}`, `User:{userId}` |
| `admin_update_user_access` | `AdminUserList:{filters}`, `User:{userId}` |
| `admin_update_station_status` | `AdminStationList`, `Station:{stationId}`, `LaunchReadiness`, `StationQueue:{stationId}` |
| `admin_update_station_validation` | `AdminStationList`, `Station:{stationId}`, `LaunchReadiness` |

Rules:

- exact IDs must be used when response or args provide them.
- when a mutation response returns `deliveryLifecycleResponseSchema`, update or invalidate delivery detail and timeline.
- if exact station or actor IDs are missing, invalidate the relevant scoped list and add a contract gap note.
- invalidation must happen after mutation success or confirmed offline replay, not when an offline action is only queued.

## Optimistic Update Policy
Optimistic cache changes are allowed only for low-risk interface responsiveness.

Allowed optimistic updates:

- mark notification item as read if backend read endpoint exists later
- add local queued-action indicator to operation screen
- set payment screen to `pending verification` after initialize request starts
- display new issue in sender or ops issue list only as pending local item before confirmed create response

Blocked optimistic updates:

- custody owner change
- delivery status transition
- proof completion
- package condition
- payment confirmed
- refund approved
- refund settled
- pricing rule active state
- station validation status
- user role or access status
- webhook processing result

For high-risk mutations, use pessimistic updates:

- wait for backend success
- parse response schema
- update cache from returned data or invalidate tags
- show transition only after confirmed response

## Manual Cache Patch Rules
Manual cache patching must be rare and audited in code review.

Allowed manual patch cases:

- after a mutation returns a complete updated delivery lifecycle object
- after an issue mutation returns a complete updated issue object
- after an admin user mutation returns a complete updated user object
- after notification read state exists and returns complete notification state

Rules:

- patch only the entity returned by backend.
- do not infer missing fields.
- do not patch list membership if backend status transition rules could move the item between filtered lists; invalidate lists instead.
- on patch failure, invalidate relevant tags.
- optimistic patches must retain undo behavior through RTK Query patch result.

## Polling Policy
Polling must be intentional.

Allowed polling:

- payment processing screen during pending payment verification
- payment provider return while normalizing provider result
- admin webhook events while the detail drawer is open, if operator chooses live mode
- admin outbound notifications while monitoring failure queue, if operator chooses live mode
- courier proof upload status while upload is in progress, if upload transport requires it

Blocked polling:

- public landing pages
- static policy pages
- role routing
- station queues by default
- driver queues by default
- courier queues by default
- admin finance by default
- pricing rules
- user lists

Rules:

- polling interval must be screen-owned but within cache policy.
- polling must stop on terminal states.
- polling must pause when app is backgrounded where platform supports it.
- polling must show visible waiting state when user is blocked.
- polling must not replace webhook or reconciliation truth.

## Refetch Policy
Use targeted refetching.

Refetch on:

- app foreground for active operations mobile work
- reconnect after offline state
- user pull-to-refresh
- returning from a mutation child route
- outbox drain success
- session refresh after expired-token recovery
- admin filter change
- payment verification screen active wait

Do not refetch on:

- every render
- every tab switch when data is fresh
- background route groups not visible
- public page scroll
- modal open when parent data is fresh and sufficient

## Screen State Mapping
Screens must map RTK Query cache state into shared screen states.

| RTK/cache condition | Shared state |
| --- | --- |
| no data, request pending | loading |
| data exists, request pending | refreshing |
| request failed, no data | error or offline |
| request failed, cached data exists | stale data with error strip |
| cache over freshness threshold | stale data |
| offline and cache exists | offline cached |
| offline and no cache | offline empty |
| forbidden | not authorized |
| token expired | session expired |
| rate limited | rate limited |
| schema mismatch | service error |

Rules:

- full-screen loading only on first load.
- full-screen error only when no safe data exists.
- cached data with failed refresh remains visible if privacy and role scope still match.
- stale operational data must show visible age.
- action buttons must consult `CacheSafetyGate` before enabling risky actions.

## Public Tracking Cache
Public tracking cache must stay privacy-safe.

Rules:

- cache only `publicTrackingResponseSchema` fields.
- cache key uses tracking code, not receiver phone or token.
- never merge public tracking cache into `Delivery` tag data.
- receiver verification result may invalidate public tracking, but token is not cached in RTK Query.
- public tracking cache may be short-lived.
- public tracking not found and access denied responses must not create a long-lived cache entry that helps probe tracking codes.

## Sender Cache
Sender cache supports delivery creation, payment, history, receipt, refund, and support flows.

Rules:

- delivery list and detail share `Delivery` entity tags.
- payment mutations invalidate both payment and delivery.
- receipt detail reads from parsed delivery/payment fields, not a separate local receipt truth.
- cancellation invalidates delivery, timeline, list, and payment tags.
- refund status must refresh delivery/payment tags after admin actions where visible to sender.
- sender issue creation invalidates issue list and delivery detail.
- sender cache clears on sign-out or user ID change.

## Operations Cache
Operations cache supports field work under low-bandwidth conditions.

Rules:

- station, driver, and courier queue lists are separate tag families.
- detail records are shared by delivery ID but isolated by role and user scope.
- handoff mutations invalidate delivery, timeline, queue, and actor-specific queue tags.
- accepted offline actions do not update authoritative delivery status until replay success.
- queue rows must show pending local action state when outbox contains a matching delivery action.
- stale queues block new handoff action unless offline action policy approves that screen.
- cache must clear when role or station scope changes.

## Admin Cache
Admin cache must be accurate, scoped, and easy to refresh.

Rules:

- admin web does not persist sensitive admin cache after sign-out.
- admin list filters participate in cache key.
- admin mutations invalidate precise list and detail tags.
- finance and reconciliation data use short freshness thresholds.
- pricing rules and station validation require refresh before update.
- user access changes invalidate user detail, user list, and affected role routes where possible.
- webhook and outbound notification views are admin-only and never available in mobile app cache.

## Notification Cache
Notification cache must support inbox and deep links without bypassing routing.

Rules:

- notification list is keyed by user ID.
- notification deep links must go through role routing.
- notification row cache must not grant access to target delivery or issue.
- unread/read state remains server truth when backend read mutation exists.
- notification cache clears on sign-out.

## Payment Cache
Payment cache must avoid premature certainty.

Rules:

- pending payment can be cached and shown as pending.
- confirmed payment requires parsed backend success.
- failed payment requires parsed backend success or error state.
- under-review payment must not be collapsed into failed.
- refund pending and refunded states must invalidate sender receipt and admin finance.
- provider references must be shown only in approved finance/admin contexts.
- payment polling stops at terminal state or review state.

## Issue Cache
Issue cache supports support and admin workflows.

Rules:

- issue list and issue detail must share `Issue` tags.
- issue creation invalidates list and linked delivery.
- escalation invalidates detail and list.
- resolution invalidates issue detail, issue list, and linked delivery.
- receiver public screens must not read private issue cache.
- issue action buttons require fresh issue detail when stale.

## Station Cache
Station cache supports service areas, station operations, and admin validation.

Rules:

- public service-area station data, if exposed, uses public-safe station fields only.
- operations station queue cache is scoped to station operator station ID.
- admin station list includes validation and status data.
- station status override invalidates station list, station detail, launch readiness, and affected station queue.
- station validation invalidates station list and launch readiness.
- station cache clears when station scope changes.

## Outbox Integration
The offline outbox owns queued writes. RTK Query owns fetched server state.

Rules:

- queueing an action must not pretend the server state changed.
- queueing an action may add a local pending marker to the affected row.
- replay success invalidates affected tags.
- replay conflict maps to action recovery and invalidates affected detail.
- replay failure stores request ID and error code in outbox, not only in RTK Query state.
- outbox drain should trigger a targeted refetch for current active route.
- outbox state and RTK Query cache must be separate stores with explicit bridges.

## Cache Metadata
Every cached entry used by screens must expose:

```ts
type CacheEntryMeta = {
  operationId: string;
  cacheKey: string;
  fetchedAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  freshnessState: CacheFreshnessState;
  source: "network" | "memory_cache" | "persisted_cache";
  staleAfterMs: number;
  offlineUsable: boolean;
  actionSafe: boolean;
};
```

Rules:

- metadata must not include sensitive values.
- screens can render cache age from metadata.
- action gating can use `actionSafe`.
- cache source must be available for telemetry and QA.

## Analytics Contract
Allowed cache events:

- `api_cache_hit`
- `api_cache_miss`
- `api_cache_stale_rendered`
- `api_cache_refresh_started`
- `api_cache_refresh_succeeded`
- `api_cache_refresh_failed`
- `api_cache_invalidated`
- `api_cache_persisted_restored`
- `api_cache_persisted_rejected`
- `api_cache_cleared`

Required properties:

- `operationId`
- `tagType`
- `surface`
- `role`
- `freshnessState`
- `durationBucket` where relevant
- `cacheAgeBucket`
- `offline`
- `reason`

Forbidden properties:

- raw request args
- raw path IDs
- phone
- address
- scan code
- OTP
- token
- proof URL
- provider payload
- webhook payload

## Security And Privacy Rules
The cache must enforce privacy by construction.

Rules:

- public cache cannot contain private delivery detail.
- mobile cache cannot contain admin finance or user-management data.
- admin cache cannot persist after sign-out.
- cache clear must run on role mismatch.
- query args with sensitive values must be redacted before logging.
- cache persistence must have schema versioning.
- cache rehydration must validate app surface, user ID, role, station ID, and schema version.
- stale persisted cache cannot enable risky actions by itself.

## Accessibility Requirements
Cache-driven UI changes must remain accessible.

Rules:

- first load uses normal loading state.
- background refresh uses status text, not focus movement.
- stale and offline warnings must be announced when they materially change action safety.
- action disabled due to stale cache must explain the reason.
- retry controls must be keyboard accessible.
- pull-to-refresh cannot be the only refresh path.
- reduced motion users must not see constant refresh animation.

## Performance Requirements
The cache must improve performance without hiding correctness risk.

Rules:

- avoid broad invalidation when entity tags are available.
- avoid polling by default.
- avoid duplicate API slices per base URL.
- avoid persisting high-volume admin data.
- avoid storing full proof assets in Redux state.
- avoid deriving expensive grouped queues during render when memoized selectors can do it.
- avoid cache keys that change due to object property order.
- keep cache metadata small.

## Store Setup Requirements
Each app store must:

- include `kraApi.reducer`
- include `kraApi.middleware`
- include listener setup for refetch on focus and reconnect where supported
- include cache clear action on sign-out
- include cache clear action on role mismatch
- include cache persistence only for approved mobile slices
- expose test utilities for resetting API state

Store must not:

- include duplicate Kra API middleware
- persist admin cache in mobile storage
- persist public receiver verification token
- allow components to dispatch raw cache mutations outside approved utilities

## Test Requirements
Claude Code must add tests when implementing this cache.

Unit tests:

- cache key serialization is stable for equivalent filter objects.
- public tracking cache key excludes phone and token.
- sign-out clears authenticated cache.
- role change clears role-scoped cache.
- station scope change clears station queue cache.
- freshness thresholds map to expected freshness states.
- risky action gate blocks stale data.
- safe read gate allows approved stale orientation.
- redaction removes sensitive args from cache analytics.
- webhook and internal endpoints are absent from frontend cache.

Endpoint tests:

- every query provides at least one tag.
- every mutation invalidates required tags.
- handoff mutations invalidate delivery and timeline tags.
- payment mutations invalidate payment and delivery tags.
- issue mutations invalidate issue and linked delivery tags.
- admin station mutations invalidate launch readiness.
- admin user mutations invalidate user list and user detail.
- public tracking verification invalidates public tracking only.

Offline tests:

- persisted operations cache restores for same user, role, station, and schema version.
- persisted operations cache is rejected for a different user.
- persisted operations cache is rejected for a different role.
- stale persisted queue renders stale marker.
- offline with no cache renders offline empty state.
- outbox replay success invalidates affected tags.
- outbox replay conflict keeps cache safe and routes to action recovery.

Integration tests:

- sender payment verification refreshes delivery detail.
- station intake moves delivery out of intake queue after backend success.
- driver pickup invalidates origin station and driver queues.
- destination receipt invalidates driver and destination station queues.
- courier completion invalidates courier queue, delivery detail, timeline, and public tracking.
- admin station validation refreshes launch readiness.
- admin pricing update refreshes pricing rules and launch readiness.

End-to-end tests after UI exists:

- first load shows loading, refresh shows inline refreshing, stale data shows stale state.
- operations mobile opens cached queue offline with visible age.
- operations mobile blocks unsafe action when cache is too stale and no outbox policy applies.
- sender sees payment status update after verification.
- receiver public tracking never receives private delivery detail from cache.
- admin finance data clears on sign-out.

## Implementation Sequence
Claude Code should implement in this order when frontend build starts:

1. Define `KraApiTag` list.
2. Create `kraApi` single-slice base setup per runtime.
3. Implement stable query arg serialization.
4. Implement cache metadata helper.
5. Add public tracking endpoint tags.
6. Add sender delivery and payment endpoint tags.
7. Add operations handoff and queue tags.
8. Add proof asset cache behavior.
9. Add issue and notification tags.
10. Add admin tags.
11. Add freshness thresholds.
12. Add cache safety gates.
13. Add persistence only for approved operations mobile reads.
14. Add cache clear policies.
15. Add outbox replay invalidation bridge.
16. Add analytics redaction.
17. Add tests for tags, freshness, persistence, redaction, and outbox integration.

## Claude Code Build Instructions
When Claude Code implements this spec:

- do not build actual frontend UI from this file.
- do not add a second Kra API slice for the same base URL.
- do not persist admin cache into mobile storage.
- do not persist receiver verification tokens.
- do not optimistically change custody, payment confirmation, refund, station validation, pricing, or access-control state.
- do not make stale data look live.
- do not invalidate every tag when one entity tag is enough.
- do not let public tracking hydrate authenticated delivery detail.
- do not let notification cache bypass route guards.
- do not poll by default.
- do not use cache as authorization.
- do not drop outbox failures silently after cache invalidation.

## Completion Checklist
This infrastructure item is complete only when:

- `kraApi` exists as one API slice per app runtime.
- all frontend endpoints provide tags.
- all mutations invalidate documented tags.
- cache keys are stable and scoped.
- freshness states are derived consistently.
- stale and offline state mapping is available to screens.
- risky actions are blocked when cached data is unsafe.
- operations mobile can restore approved persisted cache.
- cache clears on sign-out, role change, station scope change, and schema mismatch.
- outbox replay invalidates targeted tags.
- public tracking cache remains privacy-safe.
- admin cache remains admin-only and clears on sign-out.
- tests prove tag, freshness, redaction, and persistence behavior.

## Quality Bar
Pass conditions:

- A screen can show cached data fast without pretending it is live.
- A handoff mutation refreshes every affected queue and detail.
- A payment result updates sender delivery detail without manual screen patching.
- An admin station validation update refreshes launch readiness.
- Operations mobile can work from approved cached reads in weak network conditions.
- Stale data cannot authorize risky package movement.
- Public tracking data cannot leak private delivery fields.
- CI catches missing tag or invalidation coverage.

Fail conditions:

- any endpoint has no tag policy.
- any mutation invalidates only its own screen and leaves other surfaces stale.
- stale cache enables custody, proof, payment, refund, pricing, station validation, or access mutation without approved policy.
- public tracking shares cache data with authenticated delivery detail.
- admin cache persists after sign-out.
- operations cache survives role or station scope change.
- cache analytics includes sensitive values.

## Spec Closure Review
This file is closed when it provides a complete cache contract for Claude Code to implement without inventing frontend data policy.

Review questions:

- Can every frontend endpoint be assigned a tag?
- Can every mutation refresh the affected screens without broad refetch storms?
- Can field workers tell when cached data is stale?
- Can risky actions be blocked by freshness policy?
- Can operations mobile restore only approved cached data?
- Can public, sender, operations, and admin caches remain isolated?
- Can CI prove the cache remains aligned with the route inventory?

If any answer is no, the cache layer is not ready for screen implementation.
