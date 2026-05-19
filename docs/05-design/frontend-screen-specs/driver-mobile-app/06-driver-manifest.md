# DriverManifest Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverManifest` |
| Route | `/(ops)/driver/runs/:deliveryId/manifest` |
| Primary test ID | `screen-driver-manifest` |
| Surface | Driver mobile app |
| Backend coverage | `get_delivery` for current delivery package; `list_deliveries` for assigned run context |
| Offline critical | Yes |
| Required role | `driver` |
| Parent screen | `AssignedRunDetail` |
| Related routes | `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Single-delivery package manifest using current API, with future multi-package run manifest documented |

## Product Job
`DriverManifest` lets an assigned driver review the package profile before pickup scan and route movement. It is the driver-facing loading checklist for the current delivery package.

The screen answers:

- `Which package belongs to this run?`
- `What should I check before pickup scan?`
- `Is the package fragile or high value?`
- `Is this route station pickup or doorstep after destination?`
- `Can I review the manifest offline?`
- `What is missing from current backend for a true multi-package run manifest?`

## Product Standard
The manifest must reduce wrong-package handling. It should make the driver verify the package profile and route context before opening the pickup scanner, without replacing the scanner itself.

The driver should be able to:

- Confirm delivery and tracking identity.
- Review package description, weight, size, fragile state, and declared value alert.
- Review origin and destination station IDs.
- See current status and payment blocker.
- Understand that pickup scan is still required.
- Open pickup scan when safe.
- Report missing, damaged, or mismatched package concerns.

The screen must never:

- Mark package verified without scan.
- Move custody.
- Reveal package scan code.
- Pretend multi-package aggregation exists when backend returns one delivery package.
- Let an unassigned driver view package manifest.
- Hide stale offline data.

## Audience
Primary audience:

- Assigned driver preparing to collect or verify a package at origin station.

Secondary audience:

- Station staff relying on the driver to spot package mismatch before handoff.
- QA validating scan-before-custody policy.
- Claude Code implementing manifest UI and tests.

## Context Of Use
The driver may open this screen:

- After accepting a run.
- Before pickup scan.
- From run detail.
- While standing near packages at origin station.
- While offline with previously loaded package detail.
- After station staff asks the driver to verify package attributes.

This is a field checklist, not an inventory management dashboard.

## Design Brief
User and job:

- A driver needs to verify the assigned package profile before scanner-based pickup.

Context:

- Operational, custody-sensitive, and often one-hand field use.

Entry point:

- AssignedRunDetail, DriverAcceptRun success, or AssignedRuns row route.

Success state:

- Driver understands what package to look for and opens pickup scan when safe.

Primary action:

- `Open pickup scan`.

Navigation model:

- Stack screen between detail/accept and pickup scanner.

Density level:

- Compact checklist with strong package facts.

Visual thesis:

- `Load check`: one package identity sheet with route spine, risk badges, and a scan-required action.

Restraint rule:

- Do not add scanner capture, route navigation, or station inventory editing here.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Route Load Task](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports package verification before route movement, barcode scanning, and manual fallback when barcode is unreadable.
- [Onfleet Route Load Task overview](https://support.onfleet.com/hc/en-us/articles/47743836771732-Route-Load-Task): supports consolidating package barcodes into a pre-route activity and blocking downstream tasks until verification is complete.
- [Onfleet barcode scanning API](https://docs.onfleet.com/reference/barcode-scanning): supports barcode capture at pickup and dropoff as chain-of-custody evidence.
- [Material Design lists](https://m1.material.io/components/lists.html): supports homogeneous item presentation and row hierarchy for manifest-style content.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local cached reads and explicit stale/empty cache handling.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible touch targets for scan/support actions.

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
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Current detail read:

- Operation key: `get_delivery`.
- HTTP route: `GET /v1/deliveries/:id`.
- Response schema: `deliveryDetailResponseSchema`.

Current list read when needed:

- Operation key: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Driver scope: assignment-scoped.

Manifest fields available today from detail:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver.name`
- `package.description`
- `package.weightKg`
- `package.sizeTier`
- `package.isFragile`
- `package.declaredValueGhs`
- `currentCustodyRole`
- `assignedDriverId`
- `latestEvent`
- `latestTouchpoint`

Current backend limitation:

- There is no run aggregate object.
- There is no multi-package manifest list.
- There is no package label ID in driver-safe response.
- There is no package scan code in manifest response.
- There is no per-package scanned/verified state.
- There is no missing-package reason mutation on this screen.

Implementation decision:

- V1 DriverManifest renders one delivery package as one manifest row.
- If future assigned runs aggregate multiple deliveries, this screen should expand to multiple manifest rows.
- Do not invent package IDs or scan states.
- Do not reveal package scan code.

Future backend improvement:

- Add `GET /v1/driver/runs/:runId/manifest` with:
  - `runId`
  - `packages[]`
  - `deliveryId`
  - `packageLabelId`
  - `trackingCode`
  - `originStationId`
  - `destinationStationId`
  - `sizeTier`
  - `weightKg`
  - `isFragile`
  - `declaredValueGhs`
  - `verificationStatus`
  - `issueFlag`
  - `scanRequired`

## Authorization Rules
Required principal:

- `role === "driver"`.

Required scope:

- Delivery must be assigned to current driver.

Allowed:

- View package manifest for assigned delivery.
- Open pickup scan for assigned delivery when state allows.
- Open support with delivery context.

Disallowed:

- Viewing unassigned delivery package detail.
- Viewing station package inventory.
- Editing package details.
- Marking package missing through unsupported endpoint.
- Completing pickup without scanner flow.

Scope failure:

- Clear cached manifest for this delivery.
- Show `This package is not assigned to this driver account.`
- Route back to AssignedRuns.

## Information Architecture
Top to bottom:

1. Header and route identity.
2. Scan-required banner.
3. Package manifest row.
4. Risk and handling badges.
5. Route and service context.
6. Custody and status summary.
7. Report concern actions.
8. Offline/cache strip.
9. Sticky pickup scan CTA.

The first viewport must show package facts and the scan-required rule.

## Layout Requirements
Compact phone:

- Single column.
- Large package fact panel.
- Sticky bottom `Open pickup scan`.
- Support action below package concern section.

Large phone:

- Package facts and route context can sit in a two-card grid if readability holds.

Foldable or tablet width:

- Left: manifest rows.
- Right: selected package facts and actions.

System UI:

- Respect safe areas.
- Avoid bottom CTA overlap with tab bar.
- Keep report concern reachable but secondary.

## Visual Direction
Mood:

- Physical checklist, strong labels, low decoration.

Hierarchy:

- Package description first.
- Risk badges second.
- Route and status third.
- Secondary actions lower.

Color:

- Green for scan-ready.
- Amber for fragile, high value, or stale cache.
- Red for blocker or scope mismatch.
- Blue-gray for offline state.

Typography:

- Package description large and clear.
- Weight and size use tabular numerals.
- Tracking code uses monospaced or tabular style.
- Badges use concise labels.

## Header
Title:

- `Manifest`

Subtitle:

- `Check package before pickup scan`

Header content:

- Tracking code.
- Delivery ID.
- Status chip.
- Sync/cache indicator.

Actions:

- Back.
- Refresh.

Do not show:

- Receiver phone.
- Sender ID.
- Payment provider reference.
- Scan code.

## Scan-Required Banner
Always visible unless package already left origin and driver custody is confirmed.

Title:

- `Pickup scan is required`

Body:

- `Use the scanner flow to confirm this package before custody moves to you.`

CTA:

- `Open pickup scan`

Rules:

- This banner must not mark anything verified.
- This banner must not show scan code.

## Manifest Row
Required row fields:

- Delivery ID.
- Tracking code.
- Package description.
- Origin station ID.
- Destination station ID.
- Service type.
- Fragile flag.
- Declared value alert.
- Current status.

Package fields:

- `description`
- `weightKg`
- `sizeTier`
- `isFragile`
- `declaredValueGhs`

Badges:

- `Fragile`
- `Declared value`
- `Doorstep after station`
- `Payment blocked`
- `Issue reported`
- `Saved offline`

Row action:

- Tap row expands package fact details if collapsed.

No row action may verify package.

## Package Fact Details
Show:

- Description.
- Weight in kg.
- Size tier.
- Fragile handling.
- Declared value alert.

Declared value:

- Show risk alert if greater than `0`.
- Do not show finance calculations.
- Copy: `Handle as declared-value package.`

Fragile:

- Copy: `Avoid stacking or rough handling.`

Missing fields:

- Since schema requires fields, missing package data means schema failure.
- Do not render partial manifest from invalid package object.

## Route And Service Context
Show:

- Origin station ID.
- Destination station ID.
- Service type.
- Doorstep requested status.
- Latest touchpoint.

Doorstep:

- If true: `Doorstep after destination station`
- If false: `Receiver pickup at destination station`

Do not show:

- Full route map.
- ETA.
- Live GPS.
- Distance unless backend exposes it.

## Custody And Status Summary
Show:

- Current status.
- Payment status as driver-safe readiness.
- Current custody role.
- Latest event time.

Custody copy:

- `Station has custody until pickup scan succeeds.`
- `You have custody after successful pickup scan.`
- `Custody not confirmed yet.`

Rules:

- Assignment does not equal custody.
- Manifest review does not equal custody.
- Pickup scan flow owns custody transfer.

## Report Concern
Use cases:

- Package not physically found.
- Package looks damaged.
- Package attributes do not match.
- Station says package is not ready.

Current backend:

- `create_issue` can report run problem in support flow.

UI behavior:

- Secondary action: `Report package concern`
- Route: `/(ops)/driver/support?deliveryId=<deliveryId>&category=package_issue`

Do not:

- Submit issue from manifest inline.
- Mark package missing without backend mutation.
- Change delivery status.

## Offline Behavior
Offline allowed:

- Render cached manifest package.
- Show package facts and route context.
- Open support draft.
- Open cached detail.
- Open pickup scan only if scanner flow confirms it can operate from fresh cached binding.

Offline restricted:

- Refresh package facts.
- Mark manifest verified.
- Confirm pickup from this screen.
- Start route without pickup confirmation.

Cache age policy:

- Under `15 minutes`: manifest is usable for review.
- `15` to `60 minutes`: show stale warning.
- Over `60 minutes`: block direct pickup scan CTA until refresh unless scanner flow has its own fresh binding.

Offline copy:

- `Offline - showing saved manifest`
- `Saved package details may be old`

## Cache Rules
Cache keys:

- `driverManifest:<driverUserId>:<deliveryId>`
- `driverManifestLastSyncedAt:<driverUserId>:<deliveryId>`
- `driverManifestConcernDraft:<driverUserId>:<deliveryId>`

Storage:

- Durable encrypted storage where available.

Invalidation:

- Clear on sign-out.
- Clear on driver user ID change.
- Clear on confirmed scope failure.
- Replace only after schema-valid `get_delivery`.
- Refresh after pickup scan success.

Privacy:

- Do not store receiver phone for manifest.
- Do not store package scan code.
- Do not store payment provider reference.

## API Request Shape
Read:

```http
GET /v1/deliveries/:deliveryId
Authorization: Bearer <token>
```

Optional list context:

```http
GET /v1/deliveries?limit=50
Authorization: Bearer <token>
```

V1 guidance:

- Use detail read as the manifest source.
- Use assigned list only for return navigation or stale scope repair.
- Do not call timeline by default.
- Do not call support issue list by default.

## Data Mapping
Map `deliveryDetailResponseSchema` into:

```ts
type DriverManifestView = {
  deliveryId: string;
  trackingCode: string;
  originStationId: string;
  destinationStationId: string;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  serviceType: ServiceType;
  doorstepRequested: boolean;
  package: {
    description: string;
    weightKg: number;
    sizeTier: SizeTier;
    isFragile: boolean;
    declaredValueGhs: number;
  };
  custodyRole: DeliveryCustodyRole | null;
  latestEvent: {
    type: string;
    occurredAt: string;
  };
  latestTouchpoint: {
    role: PublicTouchpointRole;
    stationId?: string;
    occurredAt: string;
  };
  cacheMeta: {
    source: "network" | "local";
    lastSyncedAt?: string;
    isStale: boolean;
  };
};
```

Derived fields:

- `manifestRows`
- `riskBadges`
- `scanCtaState`
- `blocker`
- `routeLabel`
- `accessibilityLabel`

## State Model
```ts
type DriverManifestState =
  | { kind: "loading_first_time" }
  | { kind: "ready"; manifest: DriverManifestView }
  | { kind: "offline_cached"; manifest: DriverManifestView }
  | { kind: "offline_empty" }
  | { kind: "refresh_failed"; manifest?: DriverManifestView }
  | { kind: "scope_denied" }
  | { kind: "not_found" }
  | { kind: "schema_error" };
```

## Interaction Flow
1. Driver opens manifest.
2. Screen validates role and route param.
3. Screen renders cached manifest if present.
4. Screen fetches `get_delivery` when online.
5. Screen validates scope and response schema.
6. Screen maps package into manifest row.
7. Driver reviews package facts.
8. Driver opens pickup scan or reports concern.
9. Child screen handles scan or support workflow.
10. Manifest refreshes when driver returns.

## Navigation Rules
Back:

- Return to AssignedRunDetail.

Primary CTA:

- `Open pickup scan` routes to `/(ops)/driver/runs/:deliveryId/pickup-scan`.

Support:

- `Report package concern` routes to driver support with delivery context.

Blocked:

- If payment is not paid or status no longer allows pickup, route back to detail with blocker visible.

## Error States
`loading_first_time`:

- Skeleton package card and route card.

`offline_empty`:

- Title: `Manifest not saved`
- Body: `Reconnect once to load this package manifest.`
- CTA: `Retry`

`refresh_failed`:

- Keep cached manifest if present.
- Banner: `Could not refresh manifest`

`scope_denied`:

- Title: `Package not assigned to this driver account`
- CTA: `Back to assigned runs`

`not_found`:

- Title: `Package not found`

`schema_error`:

- Title: `Manifest data could not be read`
- Body: `Refresh or contact station before pickup.`

`payment_blocked`:

- Banner: `Payment is not ready for movement.`

`wrong_status`:

- Banner: `Pickup scan is not available from this status.`

## Copy
Title:

- `Manifest`

Subtitle:

- `Check package before pickup scan`

Scan banner:

- `Pickup scan is required`
- `Use the scanner flow to confirm this package before custody moves to you.`

Badges:

- `Fragile`
- `Declared value`
- `Doorstep after station`
- `Payment blocked`
- `Saved offline`

Actions:

- `Open pickup scan`
- `Report package concern`
- `Refresh`
- `Back to run detail`

## Component Inventory
`DriverManifestScreen`:

- Route, role gate, detail fetch, cache, and state composition.

`ManifestHeader`:

- Title, tracking code, sync indicator.

`ScanRequiredBanner`:

- Scanner requirement and CTA.

`ManifestPackageRow`:

- Package summary row.

`ManifestPackageFacts`:

- Weight, size, fragile, declared value.

`ManifestRouteContext`:

- Origin, destination, service, doorstep.

`ManifestCustodySummary`:

- Status and custody rule.

`ManifestConcernActions`:

- Support route for package issues.

`ManifestOfflineStrip`:

- Cache age and offline state.

`ManifestErrorState`:

- Scope, offline, not found, schema, refresh failures.

## Accessibility
Touch:

- Primary CTA minimum height: `56dp`.
- Secondary actions minimum target: `48dp`.

Screen reader:

- Manifest row announces tracking code, package description, route, fragile state, declared value alert, and scan requirement.
- Offline/stale status is announced.
- Error banners use status announcements.

Focus:

- First focus on screen title.
- After refresh failure, focus stays stable and banner is next in order.
- After expanding package facts, focus moves to expanded heading.

Color:

- Fragile and declared value badges must include text.
- Scan-required state must not rely on color.

Motion:

- Row expansion can use height/opacity transition.
- Avoid heavy animation.
- Respect reduced motion.

## Analytics
Events:

- `driver_manifest_viewed`
- `driver_manifest_cache_rendered`
- `driver_manifest_refresh_started`
- `driver_manifest_refresh_succeeded`
- `driver_manifest_refresh_failed`
- `driver_manifest_pickup_scan_opened`
- `driver_manifest_package_concern_opened`
- `driver_manifest_scope_denied`
- `driver_manifest_offline_rendered`
- `driver_manifest_stale_warning_shown`

Allowed properties:

- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `isFragile`
- `declaredValueBucket`
- `networkState`
- `cacheAgeBucket`

Forbidden properties:

- Receiver phone.
- Sender ID.
- Package scan code.
- Payment provider reference.
- Proof reference.
- Raw actor ID.
- Free-text concern.

## QA Acceptance Criteria
Routing:

- Screen route is `/(ops)/driver/runs/:deliveryId/manifest`.
- Top-level test ID is `screen-driver-manifest`.
- Back returns to AssignedRunDetail.

Data:

- Screen uses `get_delivery`.
- Screen validates `deliveryDetailResponseSchema`.
- Screen renders package description, weight, size, fragile, and declared value.
- Screen renders route and service context.
- Screen does not show package scan code.
- Screen does not show receiver phone.

Scope:

- Assigned driver can view.
- Unassigned driver cannot view.
- Non-driver roles cannot view.

Custody:

- Manifest review does not move custody.
- Screen states pickup scan is required.
- Primary CTA opens scanner flow only.

Offline:

- Cached manifest renders offline.
- Offline empty state appears with no cache.
- Stale cache warning appears.
- Stale cache blocks unsafe scanner entry when binding freshness is unknown.

Concern handling:

- Report package concern routes to support.
- Manifest does not submit issue inline.

Accessibility:

- Manifest row has meaningful screen reader label.
- Risk badges include text.
- Primary CTA and secondary actions meet touch target standards.

## Test Matrix
Data tests:

- Normal package.
- Fragile package.
- Declared value package.
- Doorstep requested.
- Payment blocked.
- Issue status.
- Schema error.

Scope tests:

- Assigned driver.
- Wrong driver.
- Sender.
- Station operator.
- Final-mile courier.

Offline tests:

- Fresh cache.
- Stale cache.
- No cache.
- Refresh failure with cache.
- Scope failure clears cache.

Action tests:

- Open pickup scan.
- Report package concern.
- Back to detail.
- Refresh.

## Implementation Notes For Claude Code
Create under:

- `apps/mobile/features/driver/manifest`

Suggested files:

- `DriverManifestScreen.tsx`
- `ManifestHeader.tsx`
- `ScanRequiredBanner.tsx`
- `ManifestPackageRow.tsx`
- `ManifestPackageFacts.tsx`
- `ManifestRouteContext.tsx`
- `ManifestCustodySummary.tsx`
- `ManifestConcernActions.tsx`
- `ManifestOfflineStrip.tsx`
- `ManifestErrorState.tsx`
- `useDriverManifest.ts`
- `driverManifestMapping.ts`
- `driverManifestCache.ts`
- `driverManifest.analytics.ts`
- `DriverManifestScreen.test.tsx`

Implementation requirements:

- Use typed API client for `get_delivery`.
- Validate response with shared schema.
- Read cache before network refresh.
- Scope cache by driver `userId` and `deliveryId`.
- Render one manifest row from current delivery package.
- Keep future multi-package support data-model-friendly.
- Route scan to pickup scan screen.
- Route concerns to support.
- Do not implement scan capture here.
- Do not reveal package scan code.
- Do not add new backend endpoint.

## Out Of Scope
- Scanner capture.
- Pickup confirmation.
- Multi-package run aggregate endpoint.
- Station inventory editing.
- Missing package mutation.
- Route navigation.
- Destination handoff.
- Full support thread.

## Done Definition
DriverManifest is complete when:

- It exists at `/(ops)/driver/runs/:deliveryId/manifest`.
- It exposes `screen-driver-manifest`.
- It uses `get_delivery`.
- It renders package facts and route context.
- It renders cached manifest offline.
- It states pickup scan is required before custody transfer.
- It routes primary CTA to pickup scan.
- It routes package concerns to support.
- It blocks wrong-scope and stale unsafe use.
- It hides receiver phone, sender ID, scan code, provider reference, proof reference, and raw actor IDs.
- It passes data, scope, custody, offline, action, accessibility, and privacy tests.

## Claude Code Handoff Summary
Build `DriverManifest` as the package review checklist before pickup scan. It must use `get_delivery`, render one current package row from the delivery detail, show route/service/risk context, work from cache offline, and route scan work to `DriverOriginPickupScan`. Do not verify packages, move custody, show scan code, edit package data, or pretend multi-package manifests exist before backend support exists.
