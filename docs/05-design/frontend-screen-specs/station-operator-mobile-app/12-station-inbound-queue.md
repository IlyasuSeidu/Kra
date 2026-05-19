# Station Inbound Queue Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationInboundQueue` |
| App | `apps/mobile` |
| Route | `/(ops)/station/inbound` |
| Primary test ID | `screen-station-inbound-queue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `list_deliveries`, `get_delivery`, `get_delivery_timeline`, delivery status model, station access rules, local inbound read cache |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/inbound/:deliveryId/receive`, `/(ops)/station/inbound/:deliveryId/condition`, `/(ops)/station/final-mile`, `/(ops)/station/blocked`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `ready`, `refreshing`, `empty_expected`, `scan_entry_ready`, `detail_prefetching`, `receive_ready`, `offline_cached`, `offline_empty`, `stale_data`, `partial_failure`, `status_scope_filtered`, `arrival_attention`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen shows the destination station which packages are expected from drivers and which one should be received next.

The screen answers one operational question: `What packages are inbound to this station and need destination receipt control?`

The station operator should be able to:
- See all packages currently inbound to their station.
- Distinguish driver pickup confirmed packages from packages already in transit.
- Prioritize packages that have not moved recently.
- Start destination receipt scan for one package.
- Refresh the list before receiving a package.
- Open delivery detail, custody chain, support, or blocked queue when something looks wrong.
- Continue working from read-only cache when offline without claiming custody.

This screen is not:
- A destination receipt mutation screen.
- A condition check screen.
- A final-mile assignment queue.
- A receiver pickup queue.
- A driver live map.
- A route planning dashboard.
- A bulk receiving surface.
- A place to mark custody changed.

## Audience
Primary audience:
- Destination station operators preparing to receive packages from drivers.
- Station leads monitoring expected arrivals at a physical station.

Secondary audience:
- Claude Code implementing the station inbound queue.
- QA validating list filtering, empty states, offline behavior, and route handoff.
- Backend engineers validating query and status assumptions.
- Operations leads validating arrival discipline and loss prevention.
- Accessibility reviewers validating list navigation, status updates, and touch targets.

## User State
The operator is likely at a destination station counter, checking expected arrivals while handling walk-in receivers, driver handoffs, calls, and package storage. They need immediate clarity without opening every delivery.

The user may be:
- Coming from `StationOverview`.
- Checking inbound packages before a scheduled driver arrival.
- Searching a tracking code from a driver or package label.
- Preparing to receive a package from a driver.
- Investigating a package that has not arrived after driver pickup.
- Working with intermittent network at the station.
- Opening the screen after a push notification or internal escalation.

The screen must:
- Show only deliveries where the signed-in station is the destination station.
- Treat `dispatched_from_origin` and `in_transit` as inbound states.
- Never show `received at destination` unless the backend has recorded destination receipt.
- Never show `station custody` before `receive_destination` succeeds.
- Never call `receive_destination` directly from the list.
- Never require receiver phone or full address to operate the list.

## Backend Contract
Existing backend facts:
- `list_deliveries` exists as `GET /v1/deliveries`.
- The delivery list query supports one `status` filter per request.
- The delivery list query supports optional `paymentStatus` and `limit`.
- Station operators can access deliveries where their station is either origin or destination.
- Because station operators can see both origin and destination deliveries, this screen must client-filter rows by `destinationStationId === signedInStationId`.
- List rows include `deliveryId`, `trackingCode`, `currentStatus`, `paymentStatus`, `originStationId`, `destinationStationId`, `serviceType`, `receiverName`, `latestOccurredAt`, `latestTouchpointRole`, optional `latestTouchpointStationId`, and `doorstepRequested`.
- `get_delivery` exists for row preflight before entering the receipt scan.
- `get_delivery_timeline` exists for custody and movement evidence.
- `receive_destination` exists on the next screen, not this screen.

Destination receipt facts:
- `receive_destination` is `POST /v1/deliveries/:id/receive-destination`.
- It requires capability `confirm_destination_receipt`.
- Station operator role has `confirm_destination_receipt`.
- Backend station scope requires actor station to match `destinationStationId`.
- Request body requires `packageScanCode`, `condition`, and `nextStep`.
- `nextStep` can be `pickup`, `doorstep`, or `issue`.
- Package scan is checked against the package label registry when configured.
- Backend requires confirmed driver custody before destination receipt.
- If current status is `dispatched_from_origin` and custody is already driver, backend can transition through `in_transit` during destination receipt.
- Destination receipt records `delivery_received_at_destination`.
- Destination receipt records handoff type `driver_to_destination_station`.
- Destination receipt then routes to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.

Queue implication:
- This queue must list `dispatched_from_origin` and `in_transit`.
- This queue must not list `received_at_destination` as a normal active state because current backend routes beyond it during `receive_destination`.
- If a future backend splits destination receipt and routing into separate actions, `received_at_destination` should route to `StationConditionCheck`.

Current backend gap:
- No station-specific inbound endpoint exists.
- No ETA endpoint exists.
- No driver location endpoint exists.
- No arrival appointment endpoint exists.
- No server-provided inbound priority score exists.
- No station-safe driver display object is guaranteed.

Production-ready recommendation:
- Add `GET /v1/stations/:stationId/inbound-deliveries` with station-side filtering, inbound status grouping, driver-safe display fields, movement age, priority, and server-calculated receipt eligibility.
- Add optional arrival estimate fields only when they are operationally reliable.
- Keep destination receipt mutation separate and scanner-first.

## Status Authority
Inbound queue includes:
- `dispatched_from_origin`
- `in_transit`

Inbound queue excludes:
- `draft`
- `created`
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver`
- `received_at_destination`
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`
- `delivered`
- `issue_reported`
- `on_hold`
- `delivery_failed`
- `cancelled`
- `closed`

Status meanings:
- `dispatched_from_origin`: assigned driver pickup has been confirmed; the package has left origin custody.
- `in_transit`: driver has marked the package as moving through the network.

List copy:
- `dispatched_from_origin`: `Driver pickup confirmed`
- `in_transit`: `In transit to this station`

Forbidden copy:
- Do not label `dispatched_from_origin` as `At destination`.
- Do not label `in_transit` as `Ready for receiver`.
- Do not label either inbound state as `Station custody`.

## Data Sources
Primary status queries:
- `GET /v1/deliveries?status=dispatched_from_origin&limit=100`
- `GET /v1/deliveries?status=in_transit&limit=100`

Optional preflight before receive route:
- `GET /v1/deliveries/:id`

Optional evidence drawer:
- `GET /v1/deliveries/:id/timeline`

Local sources:
- Station auth session.
- Station overview cache.
- Last successful inbound queue payload.
- Row-level detail prefetch cache.
- Timeline cache for custody evidence.
- Offline connectivity state.

Filtering rules:
- Filter every list result to `destinationStationId === signedInStationId`.
- Exclude rows with `paymentStatus !== confirmed` from receive action readiness, but show them under attention if they appear.
- Exclude origin-station rows even if the same station is also visible through access rules.
- If `signedInStationId` is missing, show `not_authorized`.

Required list fields:
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

Required detail fields for preflight:
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `package`
- `receiver.name`
- `doorstepDistanceKm`
- `latestEvent`

Required timeline evidence:
- `driver_pickup_confirmed`
- `delivery_marked_in_transit`
- `origin_station_to_driver`
- `issue_event` entries that affect movement.

Sensitive data handling:
- `GET /v1/deliveries/:id` currently returns the full receiver object.
- This screen may receive receiver phone or address in detail payloads.
- Do not render receiver phone or full address.
- Do not write receiver phone or full address into durable station cache.
- Do not log receiver phone or full address.
- Do not send receiver phone or full address to analytics.
- If a future mobile-safe redacted delivery detail endpoint exists, prefer it for this screen.

Do not call:
- `receive_destination` from the queue.
- `assign_final_mile` from the queue.
- `complete_delivery_with_proof` from the queue.
- Admin user list.
- Driver location APIs unless explicitly created for station use.
- Payment provider endpoints.

## External Reference Inputs
Use these external references as design-quality inputs, not as product promises:
- GS1 traceability: identify actors, locations, objects, and capture events across custody.
- GS1 traceability support guidance: traceability requires identification, labeling, capture, recording, sharing, and data quality controls.
- Android offline-first guidance: local cache can be a read source, but online-only writes are required when near-real-time correctness matters.
- WCAG status messages: refresh, sync, and queue changes must be announced without moving focus unnecessarily.
- WCAG target size minimum: interactive targets must meet accessible sizing; mobile should exceed the minimum.
- Inbound Logistics inventory accuracy guidance: product movement should be authorized and recorded, and processes should remain simple and measurable.

Reference links:
- `https://www.gs1.org/standards/traceability`
- `https://support.gs1.org/support/solutions/articles/43000734475-how-does-traceability-work-`
- `https://developer.android.com/topic/architecture/data-layer/offline-first`
- `https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html`
- `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`
- `https://www.inboundlogistics.com/articles/improving-inventory-accuracy/`

## Screen Thesis
The screen should feel like an arrival control board for a serious station operation: calm, high-contrast, timestamp-led, and scanner-ready.

The operator should understand in three seconds:
- How many packages are expected.
- Which package needs attention first.
- Whether the data is fresh.
- Which package can move into destination receipt scan.

Visual direction:
- Dense but readable.
- Station-control tone, not consumer shopping tone.
- Strong status rails and movement age chips.
- No decorative map unless reliable route data exists.
- No driver avatar unless backend provides driver-safe identity.
- No receiver contact display.

## Information Architecture
Primary sections:
1. Station command header.
2. Freshness and sync banner.
3. Inbound summary cards.
4. Search and scan entry.
5. Priority filters.
6. Inbound delivery list.
7. Attention drawer.
8. Empty, stale, offline, and error recovery states.

Default focus order:
1. Header title.
2. Freshness state.
3. Primary scan/search action.
4. Summary cards.
5. Filter chips.
6. Delivery rows.
7. Secondary support action.

Do not start with:
- Large generic illustration.
- Marketing text.
- Full analytics dashboard.
- Dense table with tiny targets.

## Header
Title:
- `Inbound`

Subtitle:
- `{stationName} destination arrivals`

If station name is unavailable:
- `Destination arrivals`

Header must include:
- Station identity chip.
- Online/offline chip.
- Last refreshed timestamp.
- Manual refresh button.

Primary action:
- `Scan package`

Primary action behavior:
- Opens shared ops scanner or tracking-code lookup.
- If scanned package maps to an inbound delivery, route to `/(ops)/station/inbound/:deliveryId/receive`.
- If scanned package maps to a non-inbound delivery, show status-blocked result.
- If scanned code cannot be resolved by current local cache, call lookup if available; otherwise show `No inbound match yet`.

Header copy examples:
- Online: `Updated just now`
- Refreshing: `Checking latest arrivals`
- Offline: `Showing saved inbound list`
- Stale: `Last updated {relativeTime}. Refresh before receiving.`

## Summary Cards
Render four cards in a horizontal scroll on narrow screens and a 2x2 grid on larger screens.

Card 1:
- Label: `Expected`
- Value: count of `dispatched_from_origin` plus `in_transit` rows after destination filter.
- Helper: `Packages not yet received here`

Card 2:
- Label: `In transit`
- Value: count of `in_transit`
- Helper: `Driver marked moving`

Card 3:
- Label: `Pickup confirmed`
- Value: count of `dispatched_from_origin`
- Helper: `Left origin, not yet marked in transit`

Card 4:
- Label: `Needs attention`
- Value: count of stale, payment-blocked, or issue-adjacent rows.
- Helper: `Review before receipt`

Card behavior:
- Tapping a card applies the matching filter.
- Active card gets a left status rail and elevated contrast.
- Counts update immediately when local cache changes.
- Announce count changes through status message semantics.

Do not show revenue, payment references, full receiver contact, or staff performance metrics here.

## Priority Model
The backend does not provide ETA. The screen must not invent a precise arrival time.

Use movement age only:
- `latestOccurredAt` under 2 hours: normal.
- `latestOccurredAt` 2 to 6 hours: watch.
- `latestOccurredAt` over 6 hours: attention.
- `latestOccurredAt` over 24 hours: escalate.

These thresholds are pilot defaults, not contractual delivery promises.

Priority sort:
1. Attention rows over 24 hours.
2. Rows 6 to 24 hours.
3. Rows 2 to 6 hours.
4. `in_transit`.
5. `dispatched_from_origin`.
6. Newest latest event.

Priority labels:
- Under 2 hours: `Recent movement`
- 2 to 6 hours: `Watch`
- 6 to 24 hours: `Needs check`
- Over 24 hours: `Escalate`

Do not show:
- `Late` unless a backend SLA or ETA field exists.
- `Arriving soon` unless a reliable ETA exists.
- Driver distance unless live location exists.

## Filters
Filter chips:
- `All`
- `In transit`
- `Pickup confirmed`
- `Needs attention`
- `Doorstep`
- `Station pickup`

Filter rules:
- `All` shows all included rows.
- `In transit` shows `currentStatus=in_transit`.
- `Pickup confirmed` shows `currentStatus=dispatched_from_origin`.
- `Needs attention` shows stale, payment-blocked, or issue-adjacent rows.
- `Doorstep` shows `doorstepRequested=true`.
- `Station pickup` shows `doorstepRequested=false`.

Search fields:
- Tracking code.
- Delivery ID suffix.
- Origin station.
- Receiver name.

Search must not include:
- Receiver phone.
- Receiver full address.
- Payment provider reference.
- Raw package scan code beyond current scan session.

Search behavior:
- Debounce text input.
- Keep results local after payload is loaded.
- Clear search with one tap.
- Show count after filtering.
- Highlight matching text without changing row height.

## Delivery Row Anatomy
Each row must include:
- Tracking code.
- Status chip.
- Origin station.
- Destination station confirmation.
- Receiver name.
- Service type.
- Doorstep or station pickup chip.
- Movement age.
- Latest touchpoint.
- Primary action.
- More actions.

Row visual hierarchy:
- Tracking code is the strongest text.
- Movement age is visually close to status.
- Origin-to-destination route is one concise line.
- Receiver name is secondary.
- Action stays fixed at the bottom right of the card.

Primary action label:
- `Receive`

Primary action destination:
- `/(ops)/station/inbound/:deliveryId/receive`

Primary action availability:
- Enabled when online and row is in included inbound status.
- If stale beyond threshold, action label becomes `Review and receive`.
- If offline, action label becomes `Go online to receive`.

More actions:
- `Open delivery`
- `View custody chain`
- `Report issue`
- `Copy tracking code`

Forbidden row content:
- Receiver phone.
- Receiver full address.
- Driver personal phone.
- Internal actor IDs as primary copy.
- Payment reference.
- Raw proof reference.

## Row States
`dispatched_from_origin` row:
- Chip: `Pickup confirmed`
- Helper: `Driver accepted custody at origin`
- Action: `Receive`

`in_transit` row:
- Chip: `In transit`
- Helper: `Driver marked package moving`
- Action: `Receive`

`paymentStatus !== confirmed` row:
- Chip: `Payment attention`
- Helper: `Review before receipt`
- Action: `Review`
- Do not hide the row because the package may physically arrive.

Stale row:
- Chip: `Needs check`
- Helper: `No new movement for {duration}`
- Action: `Review and receive`

Destination scope mismatch after detail preflight:
- Chip: `Wrong station`
- Helper: `This package is not addressed to this station.`
- Action: `Open support`

Receipt already completed after refresh:
- Chip: `Already received`
- Helper: `This package moved to the next station queue.`
- Action: route to current status destination.

Issue detected:
- Chip: `Issue`
- Helper: `Review blocked queue before receipt.`
- Action: `Open issue`

## Receive Route Preflight
Before routing to `StationDestinationReceipt`, the UI should preflight delivery detail when online.

Preflight checks:
- Delivery still exists.
- Signed-in station equals `destinationStationId`.
- Current status is `dispatched_from_origin` or `in_transit`.
- Payment status is `confirmed`.
- Current custody is driver.
- Current custody actor equals assigned driver when both are available.
- No active issue blocks movement.

If preflight passes:
- Navigate to `/(ops)/station/inbound/:deliveryId/receive`.

If preflight cannot load:
- Show bottom sheet: `Could not confirm latest state`
- Actions: `Try again`, `Open delivery`, `Stay on list`

If preflight fails:
- Show exact blocker and do not navigate to receipt scan.

Preflight copy:
- Title: `Check before receiving`
- Body: `Kra will refresh this delivery before opening the receipt scan. Custody changes only after the scan is submitted.`

## Station Scan Entry
The `Scan package` action supports a fast physical workflow.

Scan entry behavior:
- Opens camera scanner with station inbound context.
- Uses the shared ops scan screen where available.
- Searches current inbound cache first.
- If no local match and online, performs delivery lookup if an endpoint exists.
- If no lookup endpoint exists, route to manual search field and show scanner result as text.

Successful scan match:
- Show delivery summary.
- Require tap `Open receipt scan`.
- Do not auto-submit receipt.

Wrong station scan:
- Show `This package is not for this station.`
- Offer `Open support`.

Wrong status scan:
- Show current status and next valid action.

Unknown scan:
- Show `No inbound match found`
- Offer `Search by tracking code`.

Scanner rules:
- Never persist scan text after session ends unless attached to a confirmed delivery action.
- Never use scan text in analytics.
- Never reveal package label code in screenshots or crash logs.

## Empty States
`empty_expected`:
- Title: `No inbound packages right now`
- Body: `Packages will appear here after driver pickup is confirmed for this destination station.`
- Primary action: `Refresh`
- Secondary action: `Open overview`

`empty_search`:
- Title: `No matching inbound package`
- Body: `Try the tracking code, receiver name, or origin station.`
- Primary action: `Clear search`

`offline_empty`:
- Title: `No saved inbound list`
- Body: `Connect to the network once to load expected arrivals for this station.`
- Primary action: `Retry`

Empty state must not say:
- `No deliveries exist`
- `Nothing to do`
- `All clear`

Reason:
- The absence of locally loaded inbound rows is not proof that no packages are moving.

## Offline Behavior
Read behavior:
- Show last successful inbound queue cache.
- Mark data with `Saved {relativeTime}`.
- Allow local search and filters.
- Allow delivery detail route only if cached detail exists.

Write behavior:
- Do not call or queue `receive_destination` from this screen.
- Do not allow receipt scan submit while offline.
- Do not claim custody while offline.

Offline primary action:
- `Go online to receive`

Offline banner:
- Title: `Offline read-only mode`
- Body: `You can review saved inbound packages. Destination receipt needs a live connection.`

Stale cache threshold:
- Under 10 minutes: normal saved state.
- 10 to 30 minutes: stale banner.
- Over 30 minutes: prominent stale banner.
- Over 4 hours: block receive route until refreshed.

Reason:
- Destination receipt is a chain-of-custody event and must use backend authority.

## Refresh Behavior
Refresh triggers:
- Screen focus.
- Pull to refresh.
- Return from receipt scan.
- Connectivity restoration.
- Push notification that delivery changed.
- Manual refresh button.

Refresh process:
1. Fetch `dispatched_from_origin`.
2. Fetch `in_transit`.
3. Merge rows by `deliveryId`.
4. Filter by destination station.
5. Deduplicate.
6. Sort by priority.
7. Persist safe list cache.
8. Announce count and freshness.

Partial failure:
- If one status query succeeds and the other fails, show successful rows with a partial failure banner.
- Banner copy: `Some inbound statuses could not refresh. Pull again before receiving.`

Rate limit:
- Show retry timer if available.
- Keep cached rows visible.
- Disable repeated refresh taps until allowed.

## Visual System
Art direction:
- `Arrival control tower`

Design principles:
- High signal density.
- Strong timestamp clarity.
- Route-oriented cards.
- Minimal ornament.
- Clear action boundaries.

Color roles:
- Background: warm off-white or pale sand.
- Surface: white with subtle border.
- Primary action: deep green.
- In transit: indigo or deep blue.
- Pickup confirmed: teal.
- Attention: amber.
- Escalate: red only for actual risk.
- Offline: charcoal and muted amber.

Do not use:
- Purple default gradients.
- Generic courier illustrations.
- Full-screen map decoration.
- Low-contrast pastel status chips.
- Confetti or celebration motion.

Typography:
- Use the app's established operations type scale.
- Tracking code should use a tabular or mono-style numeric treatment if available.
- Keep row metadata at least 13px equivalent.
- Keep primary action text at least 15px equivalent.

Spacing:
- Card padding: 16px minimum.
- Row gap: 12px minimum.
- Summary card gap: 10px minimum.
- Touch targets: 44px preferred minimum.

Motion:
- Refresh spinner should be restrained.
- New row enters with a short vertical fade.
- Status chip changes should animate color only, under 180ms.
- Respect reduce-motion settings.

## Component Inventory
Required components:
- `StationInboundHeader`
- `InboundFreshnessBanner`
- `InboundSummaryCards`
- `InboundFilterChips`
- `InboundSearchBar`
- `InboundDeliveryCard`
- `InboundStatusChip`
- `MovementAgeChip`
- `InboundAttentionDrawer`
- `InboundEmptyState`
- `InboundOfflineBanner`
- `InboundErrorState`
- `InboundScanEntrySheet`
- `ReceivePreflightSheet`

Shared components to reuse:
- Ops role shell.
- Station identity chip.
- Network status chip.
- Delivery status chip base.
- Tracking code display.
- Pull-to-refresh container.
- Accessible bottom sheet.
- Shared scanner route.

Do not build:
- Custom navigation shell.
- Custom auth guard.
- Custom scanner if shared scanner exists.
- Map component without reliable backend data.
- Admin user selector.

## Interaction Model
Open screen:
- Load cached list immediately if available.
- Start online refresh if connected.
- Show skeleton only when no cache exists.
- Preserve last selected filter.

Pull refresh:
- Keep existing rows visible.
- Show small refreshing state in header.
- Announce completion.

Tap row:
- Open row detail preview or delivery detail depending app pattern.
- Do not navigate directly to receipt unless tapping primary action.

Tap `Receive`:
- Run preflight.
- Navigate to receipt scan on pass.

Tap `Scan package`:
- Open scan entry.
- Match against inbound cache.
- Route to receive preflight on confirmed match.

Swipe actions:
- Avoid destructive swipe actions.
- Optional quick actions can be `Open` and `Copy`.

Long press:
- Copy tracking code only.
- Do not expose internal IDs by default.

## State Machine
`loading`:
- Initial network and no cache.

`ready`:
- Rows loaded and fresh.

`refreshing`:
- Rows visible while network refresh is running.

`empty_expected`:
- Fresh successful response with zero destination-filtered inbound rows.

`scan_entry_ready`:
- Scanner or manual scan entry open.

`detail_prefetching`:
- Row preflight detail request running.

`receive_ready`:
- Preflight passed and navigation is allowed.

`offline_cached`:
- Cache exists and device is offline.

`offline_empty`:
- No cache and device is offline.

`stale_data`:
- Cache age exceeds threshold.

`partial_failure`:
- One status query failed but at least one succeeded.

`status_scope_filtered`:
- Server returned rows, but none matched destination station after filtering.

`arrival_attention`:
- One or more rows are stale, payment-blocked, or issue-adjacent.

`not_authorized`:
- Session missing station role or station ID.

`session_expired`:
- Auth token expired.

`api_error`:
- Fetch failed for all required status queries.

`rate_limited`:
- Backend returns rate-limit response.

## Error Handling
All errors must include:
- What happened.
- What the operator can do next.
- Whether the package can be received.

Error: unauthorized
- Title: `Station access needed`
- Body: `This account is not linked to a station that can view inbound packages.`
- Action: `Sign in again`

Error: session expired
- Title: `Session expired`
- Body: `Sign in again before receiving packages.`
- Action: `Sign in`

Error: all fetches failed
- Title: `Inbound list did not load`
- Body: `Kra could not fetch expected arrivals. Saved rows are shown if available.`
- Action: `Retry`

Error: partial fetch failed
- Title: `Some rows may be missing`
- Body: `One inbound status could not refresh. Try again before receiving a package.`
- Action: `Refresh`

Error: preflight status changed
- Title: `Delivery state changed`
- Body: `This package is no longer waiting for destination receipt.`
- Action: `Open delivery`

Error: wrong destination station
- Title: `Wrong destination station`
- Body: `This package is addressed to another station. Do not receive it here.`
- Action: `Open support`

Error: payment attention
- Title: `Payment needs review`
- Body: `Do not complete destination receipt until the payment status is confirmed or support clears the case.`
- Action: `Open support`

## Copy System
Tone:
- Operational.
- Precise.
- Calm.
- No blame.

Preferred wording:
- `Expected`
- `Pickup confirmed`
- `In transit`
- `Receive`
- `Review and receive`
- `Saved inbound list`
- `Custody remains with driver`
- `Refresh before receiving`

Avoid wording:
- `Late`
- `Delivered`
- `Arrived` without backend receipt evidence.
- `Complete`
- `Hurry`
- `Driver is near` without location data.
- `No packages exist`

Primary CTA copy:
- `Receive`
- `Review and receive`
- `Scan package`
- `Go online to receive`

Support CTA copy:
- `Report issue`
- `Open support`
- `View custody chain`

## Privacy And Security
Privacy rules:
- Show receiver name only when needed to identify package.
- Do not show receiver phone.
- Do not show receiver full address.
- Do not show sender phone.
- Do not show driver phone.
- Do not show raw proof references.
- Do not show payment provider references.

Cache rules:
- Cache only fields needed for inbound queue display.
- Do not durable-cache detail payload receiver phone or full address.
- Encrypt local operations cache if platform storage supports it.
- Clear scan session data after route transition or cancel.

Logging rules:
- Log delivery ID, status, station ID, and error code.
- Do not log search text.
- Do not log receiver name unless required by approved operational logs.
- Do not log scan code.

Access rules:
- Only station operator shell can access route.
- Signed-in station must exist.
- Destination filtering must happen even though backend also enforces access for detail.

## Accessibility Requirements
Screen:
- Primary heading must be programmatically exposed.
- Refresh state must be announced as status.
- Count changes must be announced without stealing focus.
- Offline and stale banners must be reachable by screen reader.

Rows:
- Each row must have a concise accessible label.
- Row label format: `{trackingCode}, {statusLabel}, from {originStationId}, {movementAge}, {primaryActionAvailable}.`
- Primary action must be separate from row open action.
- More actions must have descriptive labels.

Touch:
- All interactive controls at least 44px high.
- Filter chips at least 36px high with 44px hit area.
- Primary receive button at least 44px high.

Color:
- Do not rely on color only for status.
- Attention and stale states require text labels.
- Contrast must meet WCAG AA minimum.

Motion:
- Respect reduce-motion.
- Do not animate list reordering while screen reader focus is inside the list.

Keyboard and hardware scanner:
- Hardware scanner input must focus search or scan entry reliably.
- External keyboard navigation must reach filters, rows, and actions in order.

## Analytics
Track:
- `station_inbound_queue_viewed`
- `station_inbound_queue_refreshed`
- `station_inbound_filter_changed`
- `station_inbound_search_used`
- `station_inbound_scan_entry_opened`
- `station_inbound_receive_preflight_started`
- `station_inbound_receive_preflight_passed`
- `station_inbound_receive_preflight_failed`
- `station_inbound_offline_cache_viewed`
- `station_inbound_partial_failure_seen`

Required event properties:
- `stationId`
- `visibleCount`
- `statusFilter`
- `isOffline`
- `cacheAgeSeconds`
- `screenVersion`

Allowed row properties:
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `doorstepRequested`
- `movementAgeBucket`

Forbidden analytics properties:
- Receiver phone.
- Receiver full address.
- Receiver free-text data.
- Search text.
- Package scan code.
- Payment provider reference.
- Driver phone.
- Raw proof reference.

## QA Acceptance Criteria
Screen loading:
- With no cache and online, skeleton renders then rows appear.
- With cache and online, cached rows appear immediately then refresh updates them.
- With no cache and offline, `offline_empty` renders.
- With cache and offline, `offline_cached` renders.

Filtering:
- Rows where `destinationStationId !== signedInStationId` never appear.
- `dispatched_from_origin` rows appear with `Pickup confirmed`.
- `in_transit` rows appear with `In transit`.
- Other statuses are excluded.
- Doorstep filter shows only `doorstepRequested=true`.
- Station pickup filter shows only `doorstepRequested=false`.

Search:
- Tracking code search finds a row.
- Receiver name search finds a row.
- Origin station search finds a row.
- Phone search is not supported.
- Clearing search restores prior filter.

Preflight:
- Online receive action fetches detail before routing.
- Preflight passes for destination station, confirmed payment, inbound status, and driver custody.
- Preflight blocks wrong station.
- Preflight blocks stale status.
- Preflight blocks unconfirmed payment.
- Preflight failure does not navigate to receipt scan.

Offline:
- Receive action is disabled or replaced with `Go online to receive`.
- Offline state never claims custody.
- Offline cache does not show receiver phone or full address.

Refresh:
- Pull refresh updates counts.
- Partial failure keeps successful rows visible.
- Rate limit disables repeated refresh briefly.
- Return from receipt scan removes successfully received row after refresh.

Accessibility:
- Header is announced.
- Refresh status is announced.
- Count changes are announced.
- Filter selection is announced.
- Each row exposes status, origin, age, and action.
- Touch targets meet size requirements.

## Test IDs
Screen:
- `screen-station-inbound-queue`

Header:
- `station-inbound-header`
- `station-inbound-station-chip`
- `station-inbound-network-chip`
- `station-inbound-refresh-button`
- `station-inbound-scan-button`

Summary:
- `station-inbound-summary-expected`
- `station-inbound-summary-in-transit`
- `station-inbound-summary-pickup-confirmed`
- `station-inbound-summary-attention`

Filters:
- `station-inbound-filter-all`
- `station-inbound-filter-in-transit`
- `station-inbound-filter-pickup-confirmed`
- `station-inbound-filter-attention`
- `station-inbound-filter-doorstep`
- `station-inbound-filter-station-pickup`

Search:
- `station-inbound-search-input`
- `station-inbound-search-clear`

List:
- `station-inbound-list`
- `station-inbound-row-{deliveryId}`
- `station-inbound-row-status-{deliveryId}`
- `station-inbound-row-age-{deliveryId}`
- `station-inbound-row-receive-{deliveryId}`
- `station-inbound-row-more-{deliveryId}`

States:
- `station-inbound-empty`
- `station-inbound-offline`
- `station-inbound-stale`
- `station-inbound-error`
- `station-inbound-partial-failure`
- `station-inbound-rate-limited`

Sheets:
- `station-inbound-scan-entry-sheet`
- `station-inbound-receive-preflight-sheet`
- `station-inbound-attention-drawer`

## Implementation Notes
Repository layer:
- Fetch both required statuses through the delivery list API.
- Merge by `deliveryId`.
- Filter by destination station.
- Persist only safe display fields.
- Expose list through local source first, then refresh from network.

View model:
- Keep filters, search, freshness, and row data separate.
- Derive summary counts from filtered destination rows.
- Derive attention count from movement age and payment status.
- Do not store raw scan codes in global state.

Navigation:
- Queue primary action routes to destination receipt only after preflight.
- Delivery detail route remains read-only.
- Custody chain route remains read-only.
- Support route carries delivery ID and category suggestion only.

Performance:
- Initial cached render under 300ms on common Android devices.
- Network refresh should not block local filtering.
- List virtualization required beyond 30 rows.
- Do not fetch timeline for every visible row.
- Fetch timeline only when attention drawer or custody chain is opened.

## Edge Cases
Same delivery returned by both status queries:
- Deduplicate by `deliveryId`.
- Prefer the row with the newest `latestOccurredAt`.

Server returns origin-access rows:
- Filter them out unless `destinationStationId` equals signed-in station.

Package status changes during preflight:
- Stop navigation.
- Update row or remove it.
- Show status-changed message.

Receipt completed on another device:
- Remove from inbound queue after refresh.
- Show `Already received` toast if user tapped the row.

Doorstep requested but distance missing:
- Show doorstep chip.
- Do not show distance.
- Next screen decides routing eligibility.

Payment not confirmed but package physically arrives:
- Keep visible under attention.
- Do not hide.
- Receipt screen or support policy decides next action.

Driver custody missing:
- Preflight blocks receipt route.
- Show `Driver custody not confirmed`.
- Offer `View custody chain`.

Long offline period:
- Show cache but block receive route.
- Require refresh before receiving.

## Content Quality Bar
The screen is complete only when:
- The operator can identify expected packages without opening every row.
- The operator cannot accidentally mark custody from the queue.
- Destination station filtering is explicit and tested.
- Offline mode is useful but read-only.
- Stale data is obvious.
- The receive path is scanner-first and preflighted.
- Receiver privacy is preserved.
- Accessibility states are fully specified.
- QA can validate every state without guessing.

## Open Product Questions
These questions do not block the first UI build because the spec provides safe current behavior:
- Should backend add a station-specific inbound endpoint?
- Should the station receive reliable ETA from driver app or route service?
- Should destination stations see driver display names?
- Should payment attention block destination receipt or only create support visibility?
- Should there be an arrival appointment concept for high-volume stations?

Default decisions until resolved:
- Use two delivery list status queries.
- Filter destination station on the client.
- Do not show ETA.
- Do not show driver identity beyond safe IDs when no display object exists.
- Treat destination receipt as an online-only, scanner-first mutation in the next screen.

## Final Implementation Directive For Claude Code
Build `StationInboundQueue` as a destination-station arrival control surface. It must load `dispatched_from_origin` and `in_transit` deliveries, filter them to the signed-in destination station, show movement age and attention priority, support local search and scanner entry, and route to `StationDestinationReceipt` only after online detail preflight. It must never call `receive_destination`, never claim station custody, never show receiver phone or full address, and never invent ETA or driver location.
