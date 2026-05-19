# AssignedRunDetail Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AssignedRunDetail` |
| Route | `/(ops)/driver/runs/:deliveryId` |
| Primary test ID | `screen-assigned-run-detail` |
| Surface | Driver mobile app |
| Backend coverage | `get_delivery` through `GET /v1/deliveries/:id` |
| Offline critical | Yes |
| Required role | `driver` |
| Parent screens | `DriverHome`, `AssignedRuns` |
| Related routes | `/(ops)/driver/runs`, `/(ops)/driver/runs/:deliveryId/accept`, `/(ops)/driver/runs/:deliveryId/manifest`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/runs/:deliveryId/in-transit`, `/(ops)/driver/runs/:deliveryId/destination-arrival`, `/(ops)/driver/support`, `/(ops)/deliveries/:deliveryId/custody-chain` |
| Current implementation mode | Contract-backed detail screen, cache-first read, no new backend endpoint |

## Product Job
`AssignedRunDetail` is the driver decision screen for one assigned inter-station run. It gives the driver enough verified context to choose the next safe workflow without exposing unnecessary private or financial data.

The screen answers:

- `Is this run assigned to me?`
- `Where is it going?`
- `What is the package and service profile?`
- `Who currently has custody?`
- `What is the next safe action?`
- `What must not happen yet?`

## Product Standard
This detail screen must prevent wrong-package pickup and unsafe state movement. It should make custody, package profile, route, blockers, and next action explicit before the driver opens accept, manifest, pickup scan, route, or support.

The driver should be able to:

- Confirm the run identity.
- Confirm origin and destination station IDs.
- Understand package size, weight, fragile state, and declared value alert.
- See whether doorstep handling is part of downstream flow.
- See current status, payment readiness, and custody state.
- Open the next workflow with confidence.
- Review cached details offline with stale-state warnings.
- Report a run issue without leaving context.

The screen must never:

- Allow actions on a delivery not assigned to the driver.
- Treat assignment as custody transfer.
- Show full payment internals.
- Encourage calling the receiver before the correct stage.
- Expose sender ID as visible UI.
- Expose package scan code before scanner flow.
- Hide stale cached detail while offline.

## Audience
Primary audience:

- Assigned inter-station driver who is preparing or continuing a run.

Secondary audience:

- Station staff relying on the driver to verify the right package and route.
- QA validating custody, scope, stale cache, and next-action behavior.
- Claude Code implementing the React Native detail surface and tests.

## Context Of Use
The driver may open this screen:

- From DriverHome active card.
- From AssignedRuns row tap.
- From a push notification for a new assignment.
- Before accepting a run.
- While standing at the origin station.
- After pickup confirmation.
- During transit with weak connectivity.
- When a blocker or issue appears.

The design must be readable in noisy, rushed field conditions. It should not require the driver to infer business rules from raw status names.

## Design Brief
User and job:

- A verified driver needs one assigned run explained well enough to choose the correct next action.

Context:

- Operational, custody-sensitive, field-based, and sometimes offline.

Entry point:

- DriverHome, AssignedRuns, notification, or return from child workflow.

Success state:

- Driver understands identity, route, package profile, custody state, blockers, and next action.

Primary action:

- Open the safest next workflow for this run.

Navigation model:

- Stack detail with child workflow routes.

Density level:

- Balanced detail. More context than AssignedRuns, less density than admin package detail.

Visual thesis:

- `Custody decision brief`: a command header, route band, package facts, custody truth, and one clear next action.

Restraint rule:

- Do not make this a full timeline, full manifest scanner, payment ledger, map, or support thread.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Start a Task](https://support.onfleet.com/hc/en-us/articles/10348790592020-Start-a-Task): supports opening an assigned task detail from list view and using the detail screen to navigate to destination.
- [Onfleet Route Load Task](https://support.onfleet.com/hc/en-us/articles/47743836771732-Route-Load-Task): supports pre-route package verification, scan fallback, missing package reason capture, and route-start blocking until load verification is complete.
- [Material Design cards](https://m1.material.io/components/cards.html): supports using cards as entry points to robust detail while avoiding overloaded card content and nested scroll areas on mobile.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local data as read source, network refresh into local cache, and explicit conflict/stale handling.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible touch target sizing and spacing.
- [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html): supports dynamic status announcements without moving focus.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `services/api/src/delivery-queries.ts`
- `services/api/src/handoffs.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Current read operation:

- Operation key: `get_delivery`.
- HTTP route: `GET /v1/deliveries/:id`.
- Response schema: `deliveryDetailResponseSchema`.
- Access rule: `assertCanAccessDelivery(principal, delivery)`.
- Driver access: assigned driver only.

Returned fields:

- `deliveryId`
- `trackingCode`
- `senderId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver`
- `package`
- `quote`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- `finalProof`
- `createdAt`

Driver display policy:

- Show route, package, service, custody, and next action.
- Show receiver name only when operationally useful.
- Hide receiver phone on this screen unless future policy explicitly permits it for a stage.
- Hide `senderId`.
- Hide full quote internals except payment readiness and declared-value alert.
- Hide raw actor IDs in primary UI.
- Hide proof reference unless it is driver-safe and needed for an active investigation.

## Backend Limitations
Current detail response does not include:

- Assignment created timestamp.
- Acceptance due timestamp.
- Accepted timestamp.
- Manifest row list.
- Driver route distance.
- Expected station arrival time.
- Open issue count.
- Station display names.
- Package label scan code.

Implementation decision:

- Use available detail fields.
- Use cached timeline or issue indicators only if already loaded by related screens.
- Do not fabricate assignment deadlines, package label codes, issue counts, or ETA.
- Route to manifest, pickup scan, route, or support when exact child workflow data is required.

Future backend improvement:

- Add driver-detail-safe fields:
  - `assignedAt`
  - `acceptedAt`
  - `acceptanceDueAt`
  - `manifestSummary`
  - `openIssueSummary`
  - `stationNames`
  - `routeSummary`
  - `nextAction`
  - `nextActionDueAt`

The current implementation must remain shippable without these.

## Authorization Rules
Required role:

- `driver`.

Required scope:

- `assignedDriverId === principal.userId`.

If unauthorized:

- Clear cached detail for this delivery.
- Show scope-safe error.
- Route back to AssignedRuns after acknowledgement.

If not found:

- Show `Run not found or no longer available.`
- Offer `Back to assigned runs`.

If role mismatch:

- Clear driver cache.
- Route to driver sign-in.

Do not:

- Keep showing cached details after a confirmed scope failure.
- Let a non-driver deep link remain on this detail.
- Show other assignment details for investigation.

## Information Architecture
Top to bottom:

1. Status and identity header.
2. Next action command band.
3. Route and station section.
4. Package profile.
5. Custody and handoff truth section.
6. Receiver and doorstep context.
7. Operational blockers.
8. Secondary links.
9. Offline and cache footer.

The first viewport must show identity, status, route, and next action.

## Layout Requirements
Compact phone:

- Single column.
- Sticky bottom primary action.
- Header compresses after scroll.
- Important blockers stay above fold.

Large phone:

- Command band can include route strip.
- Package and custody sections can sit as paired cards.

Foldable or tablet width:

- Two-pane layout:
  - Left: route, package, receiver.
  - Right: custody, blockers, actions.
- Keep primary action visible in right pane.

System UI:

- Respect safe areas.
- Do not hide sticky action behind tab bar or gesture nav.
- Keep support action reachable without overcrowding primary CTA.

## Visual Direction
Mood:

- Controlled, trustworthy, field-ready, and direct.

Hierarchy:

- Next action first.
- Custody truth second.
- Package profile third.
- Receiver and quote details lower.

Color:

- Green for allowed next progress.
- Amber for caution or stale cache.
- Red for blocked, mismatch, or scope denial.
- Blue-gray for offline and neutral status.
- Deep ink for identifiers and route.

Typography:

- Tracking code and delivery ID use tabular/monospace styling.
- Route names use clear body type.
- Package facts use compact labels.
- Business rule notes use plain language, not raw enum wording.

Cards:

- Use section cards because detail contains varied content.
- Do not nest scrollable areas inside cards.
- Keep card actions restrained.

## Header
Header content:

- Back action.
- Title: `Run detail`
- Tracking code.
- Status chip.
- Sync/cache state if cached.

Header secondary:

- `Delivery <deliveryId>`
- `Updated <relative time>`

Header actions:

- Refresh.
- More menu only if required for support or copy ID.

Do not show:

- Sender ID.
- Full receiver phone.
- Payment reference.

## Next Action Command Band
Purpose:

- Give one safe, role-correct action.

Primary CTA mapping:

| Condition | CTA | Route |
| --- | --- | --- |
| `paymentStatus !== "paid"` | `Contact station` | `/(ops)/driver/support` |
| `currentStatus === "issue_reported"` | `Open issue` | `/(ops)/driver/support` |
| `currentStatus === "assigned_to_driver"` and no local accepted flag | `Review assignment` | `/(ops)/driver/runs/:deliveryId/accept` |
| `currentStatus === "assigned_to_driver"` and local accepted flag exists | `Scan pickup` | `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| `currentStatus === "dispatched_from_origin"` | `Continue route` | `/(ops)/driver/runs/:deliveryId/route` |
| `currentStatus === "in_transit"` | `Continue route` | `/(ops)/driver/runs/:deliveryId/route` |
| received or terminal | `View custody chain` | `/(ops)/deliveries/:deliveryId/custody-chain` |

Secondary CTAs:

- `Manifest`
- `Report issue`
- `Back to runs`

Rules:

- Only one primary CTA.
- Max two secondary CTAs visible.
- If cached data is stale, primary CTA may route to detail child with warning only when safe.
- Handoff mutations must not start from stale detail.

## Route Section
Required content:

- Origin station ID.
- Destination station ID.
- Latest touchpoint role.
- Latest touchpoint station ID if present.
- Service type.
- Doorstep requested flag.

Doorstep copy:

- If `doorstepRequested === true`: `Doorstep after destination station`
- If false: `Station pickup after destination receipt`

Route limitations:

- Do not show ETA if backend does not return it.
- Do not show distance if backend does not return it.
- Do not render live map on this screen.
- Route navigation belongs to DriverRoute.

## Package Profile
Required content from `package`:

- Description.
- Weight.
- Size tier.
- Fragile flag.
- Declared value alert when present.

Rules:

- Use `Fragile` as a visible badge when true.
- Declared value should show as alert level, not full finance detail.
- If package data is missing due schema issue, block action and show data error.

Package scan:

- Do not reveal scan code.
- Show copy: `Pickup requires package scan in the scanner flow.`
- Link to `Manifest` or `Pickup scan` depending current state.

## Custody Section
Required content:

- Current custody role.
- Current custody actor type, not raw ID.
- Current status.
- Latest event type as driver-safe label.
- Latest event time.

Driver-facing custody truth:

- If `currentStatus === "assigned_to_driver"`:
  - `Assigned, but custody is not yours yet. Scan pickup to take custody.`
- If `currentCustodyRole === "driver"`:
  - `You are the current custodian.`
- If `currentCustodyRole === "station_operator"`:
  - `Station still has custody.`
- If current custody is null:
  - `Custody not confirmed yet.`

Rules:

- Do not show raw `currentCustodyActorId` in primary UI.
- Do not claim custody from assignment alone.
- Do not let driver mark in transit unless current state supports it.

## Receiver And Destination Context
Show:

- Receiver name.
- Doorstep requested status.
- Receiver address only if doorstep is requested and policy allows driver visibility for current stage.

Hide by default:

- Receiver phone.
- Full address if not needed for inter-station driver task.
- Receiver verification token.

Reason:

- The inter-station driver primarily moves package station-to-station. Final-mile or receiver contact is a separate role unless policy expands driver responsibility.

## Payment And Quote Context
Show:

- Payment readiness:
  - `Payment confirmed`
  - `Payment not ready`
- Service type.
- Declared value alert from package profile.

Do not show:

- Provider reference.
- Full quote calculation.
- Refund status.
- Finance-only fields.

Rule:

- If payment is not paid, block driver movement CTA and route to support/station contact.

## Timeline Teaser
This screen may show only a short latest-event teaser.

Allowed:

- Latest event type.
- Latest event time.
- Latest touchpoint.
- Link: `View custody chain`.

Not allowed:

- Full timeline rendering.
- Raw metadata.
- Proof references.
- Internal issue descriptions.

Full timeline belongs to shared custody chain or dedicated timeline screen.

## Offline Behavior
Offline allowed:

- Render cached detail.
- Open cached manifest.
- Open cached custody chain if already cached.
- Open support draft.
- Show previously known next action as read-only guidance.

Offline restricted:

- Accept run if detail cache is too old or missing assignment snapshot.
- Confirm pickup if package scan binding is not cached by scanner flow.
- Mark in transit if current state is stale.
- Resolve scope mismatch.

Cache age policy:

- Under `15 minutes`: allow read and safe child navigation.
- `15` to `60 minutes`: show caution and require child screen to revalidate before mutation.
- Over `60 minutes`: block new handoff mutations until refresh.

Offline strip:

- `Offline - showing saved run detail`
- `Last synced <relative time>`

## Cache Rules
Cache keys:

- `assignedRunDetail:<driverUserId>:<deliveryId>`
- `assignedRunDetailLastSyncedAt:<driverUserId>:<deliveryId>`
- `assignedRunDetailAcceptedFlag:<driverUserId>:<deliveryId>`
- `driverOutboxSummary`

Storage:

- Durable encrypted storage where available.

Invalidation:

- Clear on sign-out.
- Clear on driver user ID change.
- Clear on confirmed scope failure.
- Replace only after schema-valid response.
- Refresh after successful child mutation.

Privacy:

- Do not persist data outside driver scoped key.
- Do not persist receiver phone for this screen.
- Do not persist package scan code here.

## API Request Shape
Initial read:

```http
GET /v1/deliveries/:deliveryId
Authorization: Bearer <token>
```

Refresh:

```http
GET /v1/deliveries/:deliveryId
Authorization: Bearer <token>
```

V1 strategy:

- Render cached detail first if available.
- Fetch detail on screen entry when online.
- Do not call timeline by default.
- Do not call issue list by default.
- Child screens can fetch their own required data.

## Data Mapping
Map `deliveryDetailResponseSchema` into:

```ts
type AssignedRunDetailView = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  originStationId: string;
  destinationStationId: string;
  serviceType: ServiceType;
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  receiverName: string;
  packageSummary: {
    description: string;
    weightKg: number;
    sizeTier: SizeTier;
    isFragile: boolean;
    declaredValueGhs?: number;
  };
  custody: {
    role: DeliveryCustodyRole | null;
    actorVisibleLabel: string;
  };
  latestEvent: {
    type: string;
    occurredAt: string;
  };
  latestTouchpoint: {
    role: PublicTouchpointRole;
    stationId?: string;
    occurredAt: string;
  };
  createdAt: string;
  cacheMeta: {
    source: "network" | "local";
    lastSyncedAt?: string;
    isStale: boolean;
  };
};
```

Derived fields:

- `statusLabel`
- `paymentLabel`
- `custodyTruth`
- `nextAction`
- `primaryRoute`
- `blocker`
- `routeLabel`
- `accessibilitySummary`

## State Model
```ts
type AssignedRunDetailState =
  | { kind: "loading_first_time" }
  | { kind: "ready"; detail: AssignedRunDetailView; sync: DetailSyncState }
  | { kind: "offline_cached"; detail: AssignedRunDetailView; sync: DetailSyncState }
  | { kind: "offline_empty" }
  | { kind: "refresh_failed"; detail?: AssignedRunDetailView; reason: string; sync: DetailSyncState }
  | { kind: "not_found" }
  | { kind: "scope_denied" }
  | { kind: "unauthorized" };
```

```ts
type DetailSyncState = {
  network: "online" | "offline" | "unknown";
  refresh: "idle" | "refreshing" | "failed";
  lastSyncedAt?: string;
  cacheAgeMinutes?: number;
  queuedActionCount: number;
  hasConflict: boolean;
};
```

## Interaction Flow
1. Driver opens run detail.
2. Screen validates driver role.
3. Screen validates `deliveryId` route param shape.
4. Screen reads cached detail for this driver and delivery.
5. Screen fetches `GET /v1/deliveries/:deliveryId` when online.
6. Screen validates response against shared schema.
7. Screen derives custody truth and next action.
8. Driver taps primary CTA.
9. App routes to child workflow.
10. Child workflow returns with updated status or queued action.
11. Detail refreshes and updates local cache.

## Navigation Rules
Back:

- Returns to AssignedRuns if opened from list.
- Returns to DriverHome if opened from active card and no list stack exists.

Primary CTA:

- Routes to next action screen, not an inline mutation.

Manifest:

- Routes to `/(ops)/driver/runs/:deliveryId/manifest`.

Support:

- Routes to `/(ops)/driver/support?deliveryId=<deliveryId>`.

Custody:

- Routes to custody chain when available.

Deep link:

- If detail cannot validate scope, show scope-safe error and route back to AssignedRuns.

## Error States
`loading_first_time`:

- Show skeleton command band, route, package, custody sections.

`offline_empty`:

- Title: `Run detail not saved`
- Body: `Reconnect once to load this assigned run on this device.`
- CTA: `Retry`

`refresh_failed`:

- Keep cached detail if present.
- Banner: `Could not refresh run detail`
- CTA: `Retry`

`scope_denied`:

- Title: `Run not assigned to this account`
- Body: `Refresh assigned runs or contact station if this looks wrong.`
- CTA: `Back to assigned runs`

`not_found`:

- Title: `Run not found`
- CTA: `Back to assigned runs`

`schema_error`:

- Preserve cache.
- Do not write invalid detail.
- Show refresh failure.

`blocked_payment`:

- Inline blocker above command band.
- CTA: `Contact station`

`blocked_issue`:

- Inline blocker above command band.
- CTA: `Open issue`

## Copy
Title:

- `Run detail`

Primary titles:

- `Review this assigned run`
- `Pickup scan required`
- `You have custody`
- `Continue to destination`
- `Run needs attention`

Custody copy:

- `Assigned, but custody is not yours yet.`
- `Station still has custody.`
- `You are the current custodian.`
- `Custody not confirmed yet.`

Package scan copy:

- `Pickup requires the package scan in the scanner flow.`

Payment copy:

- `Payment confirmed`
- `Payment not ready`

Offline copy:

- `Offline - showing saved run detail`
- `Saved detail may be old`

Scope copy:

- `Run not assigned to this account`

## Component Inventory
`AssignedRunDetailScreen`:

- Route owner, role gate, data orchestration.

`AssignedRunCommandBand`:

- Status, next action, primary CTA.

`AssignedRunRouteCard`:

- Origin, destination, service type, latest touchpoint.

`AssignedRunPackageCard`:

- Package description, weight, size, fragile, declared value.

`AssignedRunCustodyCard`:

- Current custody truth and latest event.

`AssignedRunReceiverCard`:

- Receiver name and doorstep context.

`AssignedRunBlockerBanner`:

- Payment, issue, stale cache, or scope blockers.

`AssignedRunSecondaryActions`:

- Manifest, custody chain, support.

`AssignedRunOfflineStrip`:

- Cache age and outbox status.

`AssignedRunDetailSkeleton`:

- First-load skeleton.

`AssignedRunDetailErrorState`:

- Scope, not found, offline empty, refresh failure.

## Accessibility
Touch:

- Primary CTA minimum height: `56dp`.
- Secondary actions minimum touch target: `48dp`.
- More menu items minimum touch target: `48dp`.

Screen reader:

- First announcement includes tracking code, status, route, custody truth, and next action.
- Refresh state changes use status announcements.
- Blockers announce before action controls.
- Package fragile and declared value alerts are announced.

Focus:

- First focus on screen title.
- After refresh failure, error banner is next in focus order.
- After returning from child workflow, focus returns to command band.

Color:

- Custody and blocker states must include text, not color alone.
- Fragile and declared value alerts need visible labels.

Motion:

- Command band may settle in with short transform/opacity.
- No looping route animation.
- Respect reduced motion.

## Performance
Targets:

- Cached detail paint under `700ms`.
- Network refresh visible feedback under `100ms`.
- Detail sections should not cause layout shift after cache load.

Network:

- One detail request on entry when online.
- No timeline request by default.
- No issue list request by default.

Rendering:

- Avoid nested scroll cards.
- Keep cards simple.
- Avoid map component on this screen.

## Analytics
Events:

- `assigned_run_detail_viewed`
- `assigned_run_detail_cache_rendered`
- `assigned_run_detail_refresh_started`
- `assigned_run_detail_refresh_succeeded`
- `assigned_run_detail_refresh_failed`
- `assigned_run_detail_primary_action_tapped`
- `assigned_run_detail_manifest_opened`
- `assigned_run_detail_support_opened`
- `assigned_run_detail_custody_opened`
- `assigned_run_detail_scope_denied`
- `assigned_run_detail_offline_rendered`
- `assigned_run_detail_stale_warning_shown`

Allowed properties:

- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `custodyRole`
- `nextAction`
- `networkState`
- `cacheAgeBucket`

Forbidden properties:

- Receiver phone.
- Sender ID.
- Package scan code.
- Payment provider reference.
- Proof reference.
- Raw actor ID.
- Free-text issue content.

## QA Acceptance Criteria
Routing:

- Screen route is `/(ops)/driver/runs/:deliveryId`.
- Top-level test ID is `screen-assigned-run-detail`.
- Valid assigned driver can open detail.
- Non-driver roles cannot open detail.

Data:

- Screen calls `get_delivery`.
- Screen validates response with `deliveryDetailResponseSchema`.
- Screen does not show sender ID.
- Screen does not show receiver phone by default.
- Screen does not show package scan code.
- Screen does not show payment provider reference.

Custody:

- `assigned_to_driver` says custody is not driver yet.
- Driver custody state says driver is current custodian.
- Station custody state says station still has custody.
- Null custody shows not confirmed.

Actions:

- Payment blocker routes to support.
- Issue status routes to support.
- Assigned run routes to accept.
- Accepted local state routes to pickup scan.
- Dispatched and in-transit routes to route screen.
- Terminal state routes to custody chain or detail-only state.

Offline:

- Cached detail renders offline.
- Cache age is visible.
- Offline empty state appears when no cache exists.
- Stale cache blocks new handoff mutations.
- Refresh failure preserves cache.

Accessibility:

- Command band is first meaningful content after title.
- Blocker is announced before CTA.
- Touch targets meet mobile standards.
- Large text keeps route, custody, and CTA usable.

## Test Matrix
Role tests:

- Driver assigned to delivery can view.
- Driver not assigned receives scope-safe denial.
- Sender denied.
- Station operator denied.
- Final-mile courier denied.

Status tests:

- `assigned_to_driver`.
- `dispatched_from_origin`.
- `in_transit`.
- `issue_reported`.
- Payment not paid.
- Received or terminal.

Data tests:

- Fragile package.
- Declared value package.
- Doorstep requested.
- No doorstep.
- Latest touchpoint with station ID.
- Latest touchpoint without station ID.
- Final proof present but hidden unless safe link exists.

Offline tests:

- Cached detail offline.
- No cached detail offline.
- Stale cached detail.
- Refresh failure with cache.
- Refresh failure without cache.

Privacy tests:

- Receiver phone hidden.
- Sender ID hidden.
- Package scan code hidden.
- Raw custody actor ID hidden.
- Payment provider reference hidden.

## Implementation Notes For Claude Code
Create under:

- `apps/mobile/features/driver/assigned-run-detail`

Suggested files:

- `AssignedRunDetailScreen.tsx`
- `AssignedRunCommandBand.tsx`
- `AssignedRunRouteCard.tsx`
- `AssignedRunPackageCard.tsx`
- `AssignedRunCustodyCard.tsx`
- `AssignedRunReceiverCard.tsx`
- `AssignedRunBlockerBanner.tsx`
- `AssignedRunSecondaryActions.tsx`
- `AssignedRunOfflineStrip.tsx`
- `AssignedRunDetailSkeleton.tsx`
- `AssignedRunDetailErrorState.tsx`
- `useAssignedRunDetail.ts`
- `assignedRunDetailMapping.ts`
- `assignedRunDetailCache.ts`
- `assignedRunDetail.analytics.ts`
- `AssignedRunDetailScreen.test.tsx`

Implementation requirements:

- Use typed API client for `get_delivery`.
- Validate response with shared schema.
- Read cache before network refresh.
- Scope cache by driver `userId` and `deliveryId`.
- Keep mapping pure and unit tested.
- Hide fields prohibited by this spec.
- Route mutations to child screens only.
- Do not implement scanner behavior here.
- Do not implement route map here.
- Do not add new backend endpoints.

## Out Of Scope
- Accept/reject submission.
- Package scan capture.
- Full manifest verification.
- Live route navigation.
- Destination receipt mutation.
- Full custody timeline.
- Full support thread.
- Earnings.
- Admin investigation tools.
- New backend aggregation endpoint.

## Done Definition
AssignedRunDetail is complete when:

- It exists at `/(ops)/driver/runs/:deliveryId`.
- It exposes `screen-assigned-run-detail`.
- It calls `get_delivery`.
- It validates and caches detail data safely.
- It renders cached detail offline.
- It shows route, package, service, custody, blocker, and next action.
- It hides sender ID, receiver phone, scan code, provider reference, and raw actor IDs.
- It routes primary and secondary actions to correct driver workflows.
- It handles not found, scope denied, offline empty, stale cache, and refresh failure states.
- It passes role, data, custody, action, offline, accessibility, and privacy tests.

## Claude Code Handoff Summary
Build `AssignedRunDetail` as the driver-safe decision screen for one assigned run. It must call `get_delivery`, render cached detail first, explain package and route context, make custody truth explicit, show one next safe action, and route to child workflows for accept, scan, manifest, route, custody, or support. It must not expose sender ID, receiver phone, package scan code, payment provider reference, proof reference, or raw actor IDs, and it must block unsafe handoff actions when detail data is stale.
