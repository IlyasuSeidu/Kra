# Sender Delivery History Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderDeliveryHistory` |
| App | `apps/mobile` |
| Route | `/(sender)/history` |
| Primary test ID | `screen-sender-delivery-history` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, sender search and filter policy |
| Related routes | `/(sender)/home`, `/(sender)/create`, `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/receipts/:deliveryId`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/issues/new`, `/(sender)/support` |
| Required states | `loading`, `ready`, `refreshing`, `empty`, `filtered_empty`, `searching`, `stale_cache`, `offline`, `api_error`, `not_authorized`, `session_expired` |

## Product Job
This screen is the sender's searchable delivery ledger. It must help a sender find any delivery they have created, understand its current state, and open the correct next screen without turning history into an operations console.

The sender should be able to:
- Review active, completed, cancelled, failed, refunded, and issue-affected deliveries.
- Search by sender-approved fields.
- Filter by payment state, delivery state, service type, route, station, and doorstep selection when those values are available in the returned list.
- See the newest delivery activity first.
- Identify payment blockers fast.
- Identify issue or hold states fast.
- Open a delivery detail.
- Open the verified timeline for a delivery.
- Recover failed or pending payment from the correct payment route.
- Open receipts and refund status only when policy allows.
- Start a new delivery when history is empty.
- Recover safely from offline, empty, filtered-empty, expired-session, and API failure states.

This screen is not:
- The sender home dashboard.
- The delivery detail screen.
- The verified timeline screen.
- The payment checkout or recovery screen.
- The receipt detail screen.
- The refund tracker.
- The issue creation flow.
- The support inbox.
- A staff queue.
- An admin search console.
- A raw audit log.

## Audience
Primary audience:
- Authenticated senders checking current and previous deliveries.
- Small-business senders who create many deliveries and need fast retrieval.
- Senders investigating payment, issue, refund, or proof status.
- Returning senders who remember the receiver, route, or tracking code but not the delivery ID.

Secondary audience:
- Claude Code implementing the sender mobile app.
- QA engineers validating search, filter, empty, and recovery states.
- Support teams reviewing sender-visible history language.
- Product and compliance reviewers checking privacy boundaries.

## User State
The sender is usually in one of these modes:
- "Where is my package?"
- "Which delivery still needs payment?"
- "Did the receiver get it?"
- "Which one had the issue?"
- "I need the receipt for a previous delivery."
- "I want to repeat a route."
- "I need to prove what happened without calling support."

The screen must assume partial attention, weak mobile data, and mixed literacy with logistics language. It must lead with clear status, receiver, route, and next action rather than dense filters or internal lifecycle vocabulary.

## Primary Action
Primary action:
- `Search deliveries`

Secondary actions:
- `Filter`
- `Open delivery`
- `View timeline`
- `Recover payment`
- `View receipt`
- `Track refund`
- `Report issue`
- `Create delivery`
- `Clear filters`
- `Refresh`

CTA behavior:
- Search updates the local result set over the returned delivery list.
- Filter opens a bottom sheet or native modal with accessible grouped controls.
- Open delivery routes to `/(sender)/deliveries/:deliveryId`.
- View timeline routes to `/(sender)/deliveries/:deliveryId/timeline`.
- Recover payment routes to `/(sender)/payments/:deliveryId/recover`.
- View receipt routes to `/(sender)/receipts/:deliveryId`.
- Track refund routes to `/(sender)/deliveries/:deliveryId/refund`.
- Report issue routes to `/(sender)/issues/new?deliveryId=:deliveryId` if the app uses query context.
- Create delivery routes to `/(sender)/create`.
- Refresh calls `list_deliveries` again.

Blocked behavior:
- Do not mutate delivery state from history.
- Do not initialize payment from history unless the user routes into payment recovery or payment method flow.
- Do not cancel a delivery from history.
- Do not create an issue directly from history.
- Do not expose staff actor IDs, provider references, proof references, or raw backend metadata.
- Do not show receiver phone in list rows.
- Do not offer global search across other senders.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Total returned deliveries or an explicit empty state.
- Newest deliveries first.
- Search field.
- Fast status filters.
- At least one delivery row with receiver, route, current status, payment status, latest activity time, and next action.

For an empty account, first meaningful value is reached when the sender sees:
- A clear statement that no deliveries exist yet.
- A route into `Create delivery`.
- A short explanation that completed deliveries and receipts will appear here after they exist.

## Main Tension
History must be powerful enough for repeat senders and calm enough for first-time senders. A small-business sender may need search and filters, while a new sender may only need one active delivery. The screen must scale without becoming a table squeezed into a phone.

The design must balance:
- Search power against small-screen simplicity.
- Operational truth against sender-safe privacy.
- Payment urgency against neutral history browsing.
- Completed delivery review against active delivery action.
- Fast load against backend query limits.
- Local filtering against future server-side search.

## Design Brief
User and job:
- An authenticated sender wants to find a delivery and take the right follow-up action.

Context of use:
- Mobile, repeatable, often on weak data, often during customer-service or business operations.

Entry point:
- SenderHome `View all deliveries`.
- Bottom tab or sender menu.
- Payment result return.
- Notification context.
- Delivery detail back navigation.
- Receipt or support return.

Success state:
- Sender finds the delivery and opens detail, timeline, payment recovery, receipt, refund status, issue creation, or create delivery.

Primary action:
- Search and inspect delivery list.

Navigation model:
- History is a sender-owned list screen. Delivery detail remains the hub for a single delivery.

Density:
- Medium. Show enough operational truth per row, but keep detailed proof, receiver phone, audit, and package details in child screens.

Visual thesis:
- A precise delivery ledger with a warm mobile command surface: chronological, searchable, trustworthy, and action-aware.

Restraint rule:
- Avoid data-table styling, map walls, excessive badges, raw lifecycle logs, staff labels, and equal-weight action clutter.

Product lens:
- Trust-critical self-service history.

System stance:
- Native mobile list with strong search, compact filters, and high-contrast status signaling.

Interaction thesis:
- The sender can search, narrow, scan, and open a delivery without losing context or being forced through unnecessary screens.

Signature move:
- A sticky "history lens" header that combines search, active filter chips, result count, and data freshness in one calm control zone.

Activation event:
- Sender opens a delivery or timeline from a filtered/search result.

## Elite Quality Gate
This spec is not closed unless history can support heavy real-world delivery volume without hiding urgent states.

Non-negotiable quality requirements:
- First viewport must show search and at least one way to narrow results.
- Results must be sorted newest `latestOccurredAt` first.
- Payment blockers must be visible in list rows.
- Issue, hold, failed, cancelled, refund, and delivered states must be distinguishable.
- Delivery rows must expose receiver name, tracking code, route, service type, current status, payment status, latest activity time, and the right next action.
- Search must use only sender-approved fields.
- Search must never expose unrelated identities.
- Filters must never imply server capabilities that the current API does not have.
- History must call `list_deliveries` only for reads.
- History must not call mutation endpoints.
- Empty, filtered-empty, offline, stale-cache, session-expired, and API-error states must be complete.
- The screen must support screen reader, large text, high contrast, reduced motion, one-handed use, and small phones.
- The screen must perform well with `limit=100`.

Closure rule:
- If the sender cannot find a delivery by tracking code, receiver name, station, or status within 10 seconds, the screen remains open.
- If payment-failed deliveries blend into normal rows, the screen remains open.
- If filters create a dead end without a clear reset, the screen remains open.
- If the UI shows fields not returned by `deliveryListResponseSchema`, the screen remains open.
- If the UI performs local status grouping but labels it as server search, the screen remains open.
- If a row needs more than two visible CTAs, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Material Design 3 search, chips, and lists support visible search entry, compact filtering, and scannable mobile rows.
- Apple Human Interface Guidelines for search fields and lists support native search behavior, row hierarchy, and predictable drill-down.
- W3C WCAG status-message guidance supports announcing result count changes, loading, no results, and errors without moving focus.
- Baymard's ecommerce design catalogue includes order overview and tracking page patterns that reinforce status-first post-purchase history.
- Adobe Commerce storefront order management shows a common self-service pattern: account orders can be viewed, filtered, tracked, and opened by the customer.
- Kra sender app policy requires delivery history to support search, filter, and repeat booking.
- Kra search policy restricts sender-facing search scope and protects unrelated identities.
- Kra API contracts define exactly what `list_deliveries` can return today.

Reference links:
- https://m3.material.io/components/search/overview
- https://m3.material.io/components/chips/overview
- https://m3.material.io/components/lists/overview
- https://developer.apple.com/design/human-interface-guidelines/search-fields
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://baymard.com/ecommerce-design-examples
- https://experienceleague.adobe.com/en/docs/commerce-admin/stores-sales/order-management/orders/orders-storefront
- `docs/04-features/sender-app-spec.md`
- `docs/04-features/search-and-filters-spec.md`
- `docs/04-features/tracking-spec.md`
- `docs/04-features/payments-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/app.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before this screen renders.
- Data comes from `GET /v1/deliveries`.
- Request query is validated by `deliveryListQuerySchema`.
- Response is validated by `deliveryListResponseSchema`.
- Backend supports `status`, `paymentStatus`, and `limit`.
- Backend limit maximum is `100`.
- Backend does not expose cursor pagination yet.
- Backend does not expose date range query yet.
- Backend does not expose search query yet.
- Backend does not expose payment reference in delivery list rows.
- Backend does not expose station names in delivery list rows, but the app may map `stationCatalog` IDs to names.
- Backend sorts accessible deliveries by latest event time descending.
- Backend sends `setNoStore` for the route.
- Sender app may use local cached read fallback, but stale cache must be visibly marked.
- Delivery detail is the source for detailed receiver, package, quote, proof, and custody data.
- Timeline is the source for verified event history.

If server-side search, cursor pagination, station names, or date range filters are added later, this spec must be amended before Claude Code changes the UX contract.

## Non-Goals
Do not implement these in this screen:
- Delivery creation form.
- Payment method collection.
- Payment provider return handling.
- Receipt rendering.
- Refund timeline.
- Cancellation form.
- Issue form fields.
- Support thread.
- Full proof viewer.
- Full package details.
- Staff custody operations.
- Admin audit search.
- Driver run history.
- Station queue.
- CSV export.
- Multi-sender account switching.
- Receiver public tracking.
- Offline mutation queue.

## Backend Contract
### Endpoint
- Operation name: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Access: authenticated.
- Server handler: `rateLimitedApp.get("/v1/deliveries", authenticated read prehandler, require authenticated)`.
- Server response policy: `setNoStore(reply)`.

### Query Contract
Allowed query fields:
- `status`: optional `deliveryStatusSchema`.
- `paymentStatus`: optional `paymentStatusSchema`.
- `limit`: optional positive integer up to `100`.

Current supported delivery statuses:
- `draft`
- `created`
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`
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

Current supported payment statuses:
- `pending`
- `confirmed`
- `failed`
- `refund_pending`
- `refunded`

Default request:
- Use `limit=100` for history unless product or performance telemetry shows this is too heavy.
- Do not request unsupported query fields.

Do not send:
- `q`
- `search`
- `cursor`
- `page`
- `dateFrom`
- `dateTo`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `doorstepRequested`
- `receiverName`
- `trackingCode`
- `paymentReference`

### Response Contract
Each row in `deliveries` contains:
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
- `latestTouchpointStationId` when available
- `doorstepRequested`

Derived UI fields allowed:
- Station display names from `stationCatalog`.
- Route label from `originStationId` and `destinationStationId`.
- Relative latest activity label from `latestOccurredAt`.
- Status group from `currentStatus`.
- Payment action from `paymentStatus`.
- Delivery action from `currentStatus`.
- Touchpoint label from `latestTouchpointRole` and `latestTouchpointStationId`.

Do not render:
- Receiver phone.
- Sender phone.
- Package contents.
- Declared value.
- Quote amount.
- Payment provider reference.
- Proof asset reference.
- Actor ID.
- Audit metadata.
- Handoff proof data.
- Internal issue notes.

## Data Loading Model
### Initial Load
On screen mount:
- Require authenticated sender session.
- Call `list_deliveries` with `limit=100`.
- Render loading skeleton until either fresh data or marked cached data is available.
- Sort defensively by `latestOccurredAt` descending on client as a guard.
- Build local search index from returned rows only.
- Build filter counts from returned rows only.

### Refresh
Pull-to-refresh:
- Keeps current search and filters visible.
- Calls `list_deliveries` again.
- Announces refresh status.
- Preserves scroll position when possible.
- Re-sorts returned rows.
- Updates result count.

### Cached Read Fallback
If the mobile app has local cached read data:
- Show cached results only when network request fails or device is offline.
- Mark the header with `Last updated {time}`.
- Show a stale banner: `Showing saved history. Refresh when your connection returns.`
- Disable actions that require fresh state if policy requires fresh state.
- Allow opening cached delivery detail only if detail route can handle stale reads.

### Error Recovery
If fresh data fails:
- Keep cached rows if available.
- If no cache, show API error state with `Try again`.
- Do not clear search/filter state on transient errors.

## Information Architecture
### Top App Bar
Contains:
- Back or menu affordance depending on app shell.
- Title: `Delivery history`
- Result freshness label.
- Optional notification/profile affordance only if app shell requires it.

Rules:
- Title remains stable.
- Do not show financial totals in the top bar.
- Do not show admin controls.

### History Lens Header
Sticky control zone:
- Search field.
- Active filter chips.
- Result count.
- Filter button.
- Clear filters action when filters are active.
- Offline/stale status when applicable.

Search field:
- Label: `Search deliveries`
- Hint: `Tracking code, receiver, station, or delivery ID`
- Clear button.
- Submit key: `Search`
- Debounce: `250ms` to `350ms`.
- Minimum visible target size: `44px`.

Result count copy:
- `23 deliveries`
- `4 need attention`
- `No matching deliveries`
- `Showing saved history`

### Quick Filter Row
Recommended quick filters:
- `All`
- `Needs payment`
- `Active`
- `Completed`
- `Issues`
- `Refunds`
- `Doorstep`

Rules:
- Quick filters are local groupings over the returned list unless a single server-supported query is explicitly selected.
- `Needs payment` includes `paymentStatus=pending` and `paymentStatus=failed`.
- `Active` includes non-terminal operational statuses that are not cancelled, closed, delivered, failed, or refunded.
- `Completed` includes `delivered` and `closed`.
- `Issues` includes `currentStatus=issue_reported`, `on_hold`, or `delivery_failed`.
- `Refunds` includes `paymentStatus=refund_pending` or `refunded`.
- `Doorstep` includes `doorstepRequested=true`.

Do not use more than seven visible quick filters.

### Advanced Filter Sheet
Open from `Filter`.

Filter groups:
- Delivery status.
- Payment status.
- Service type.
- Route.
- Origin station.
- Destination station.
- Doorstep.
- Latest activity range.

Backend truth:
- Only delivery status, payment status, and limit are currently server-supported.
- Service type, route, station, doorstep, and latest activity range are local filters over returned rows.
- Multi-status filters are local unless the backend adds multi-status query support.

Filter sheet controls:
- Search within filter options only if there are more than eight options.
- Apply button with result count.
- Reset button.
- Close button.

Filter sheet copy:
- Title: `Narrow deliveries`
- Support: `Filters use the deliveries already loaded on this device.`
- Apply: `Show results`
- Reset: `Reset filters`
- Empty preview: `No deliveries match these filters. Change or reset them.`

Accessibility:
- Trap focus while sheet is open.
- Announce when filter count changes.
- Preserve selected values when sheet closes.
- Return focus to `Filter` button after close.

## Search Rules
### Approved Sender Search Fields
Search may match:
- `deliveryId`
- `trackingCode`
- `receiverName`
- `originStationId`
- Origin station display name from `stationCatalog`.
- Origin city from `stationCatalog`.
- `destinationStationId`
- Destination station display name from `stationCatalog`.
- Destination city from `stationCatalog`.
- `serviceType`
- Sender-owned payment reference only if a future list contract returns it.

Search must not match:
- Receiver phone.
- Sender phone.
- Staff actor ID.
- Driver ID.
- Courier ID.
- Admin notes.
- Internal issue notes.
- Payment provider raw reference unless the sender-owned field is explicitly returned by a future contract.
- Proof reference.
- Data not present in authenticated sender response.

### Matching Behavior
Ranking:
- Exact tracking code match first.
- Exact delivery ID match second.
- Prefix tracking code or delivery ID third.
- Receiver name prefix fourth.
- Station code/name/city fifth.
- Fuzzy receiver name last.

Rules:
- Search is case-insensitive.
- Search trims leading and trailing spaces.
- Search tolerates hyphen omission for tracking code only when safe.
- Do not run fuzzy matching on phone numbers.
- Do not expose a suggestion list of unrelated users.
- Do not persist raw search text beyond the session unless product explicitly approves it.

### Result Announcements
Use accessible status messages for:
- Search started.
- Results count changed.
- No results.
- Filters applied.
- Filters reset.
- Refresh completed.
- Network failure.

Screen reader phrasing:
- `Searching deliveries.`
- `8 deliveries found.`
- `No deliveries match this search.`
- `Filters reset. Showing 23 deliveries.`
- `History refreshed. Latest update 2 minutes ago.`

## Sorting Rules
Default sort:
- Newest latest activity first using `latestOccurredAt`.

Secondary sort:
- If two deliveries share the same timestamp, sort by `deliveryId` descending as stable fallback.

Do not add visible sort control in v1 unless product adds user need. The screen should stay focused on search and filters.

## Delivery Row Anatomy
Each delivery row must include:
- Receiver name.
- Tracking code.
- Route label.
- Current delivery status label.
- Payment status label.
- Latest activity time.
- Service type.
- Doorstep marker when requested.
- Latest touchpoint role label.
- Primary row action.
- Overflow or secondary action only when needed.

Recommended row hierarchy:
- First line: receiver name and urgent status marker.
- Second line: route and tracking code.
- Third line: delivery status plus latest activity.
- Fourth line: payment state or next action when urgent.

Visual treatment:
- Large tap target across full row.
- One primary action visible when action is urgent.
- Secondary actions behind disclosure or detail route.
- Use color and text together; never color alone.
- Use compact separators and spacing rather than heavy card chrome.

Row tap:
- Opens delivery detail.

Long press:
- No required behavior for v1.

Swipe actions:
- Avoid destructive swipe actions.
- If platform pattern is used, only allow non-destructive actions such as `Copy tracking code`.

## Row Status Mapping
### Payment Status Labels
| Payment status | Sender label | Tone | Row action |
| --- | --- | --- | --- |
| `pending` | `Payment pending` | attention | `Complete payment` or `Recover payment` based on payment route state |
| `failed` | `Payment failed` | critical | `Recover payment` |
| `confirmed` | `Paid` | positive | none unless receipt is available |
| `refund_pending` | `Refund pending` | attention | `Track refund` |
| `refunded` | `Refunded` | neutral-positive | `View refund` |

### Delivery Status Labels
| Current status | Sender label | Group |
| --- | --- | --- |
| `draft` | `Draft` | inactive |
| `created` | `Created` | active |
| `received_at_origin` | `At origin station` | active |
| `awaiting_driver_assignment` | `Waiting for driver` | active |
| `assigned_to_driver` | `Driver assigned` | active |
| `dispatched_from_origin` | `Left origin station` | active |
| `in_transit` | `In transit` | active |
| `received_at_destination` | `At destination station` | active |
| `awaiting_receiver_pickup` | `Ready for receiver` | active |
| `awaiting_final_mile_assignment` | `Waiting for doorstep courier` | active |
| `assigned_for_final_mile` | `Doorstep courier assigned` | active |
| `out_for_delivery` | `Out for delivery` | active |
| `delivered` | `Delivered` | completed |
| `issue_reported` | `Issue reported` | issue |
| `on_hold` | `On hold` | issue |
| `delivery_failed` | `Delivery failed` | issue |
| `cancelled` | `Cancelled` | closed |
| `closed` | `Closed` | completed |

### Touchpoint Role Labels
| Role | Sender label |
| --- | --- |
| `system` | `System update` |
| `station_operator` | `Station update` |
| `driver` | `Driver update` |
| `final_mile_courier` | `Courier update` |

If `latestTouchpointStationId` exists:
- Append station display name when available.
- Use station ID only if no display name exists.

## Route Label Rules
Route label format:
- `{origin city or station code} to {destination city or station code}`

Known station mapping from `stationCatalog`:
- `ST-ACC-01`: `Accra Central`, city `Accra`, code `ACC`.
- `ST-KMS-01`: `Kumasi Adum`, city `Kumasi`, code `KMS`.
- `ST-TML-01`: `Tamale Central`, city `Tamale`, code `TML`.

Display priority:
- Use city names in compact row text.
- Use full station names in row expanded text or detail route.
- Fall back to station IDs if mapping fails.

Do not block rendering if station mapping is missing.

## State Specifications
### Loading
Trigger:
- Initial request is pending and no cache is available.

UI:
- Header skeleton.
- Search field skeleton.
- Five row skeletons with varied widths.
- No blank white screen.

Copy:
- `Loading delivery history`

Accessibility:
- Announce `Loading delivery history.`
- Do not repeatedly announce skeleton row changes.

### Ready
Trigger:
- Request succeeds with one or more deliveries and current filters/search show at least one row.

UI:
- Sticky history lens header.
- Result list.
- Pull-to-refresh affordance.
- Bottom safe-area spacing.

Copy:
- Header: `Delivery history`
- Count: `{count} deliveries`

### Refreshing
Trigger:
- User pulls to refresh or taps retry while data is already visible.

UI:
- Keep rows visible.
- Show refresh indicator.
- Disable duplicate refresh triggers.

Copy:
- `Refreshing history`

### Empty
Trigger:
- Fresh request succeeds with `deliveries=[]` and no filters/search.

UI:
- Empty state with one clear action.
- Optional illustration can be abstract package path, but must not be required for comprehension.

Copy:
- Title: `No deliveries yet`
- Body: `Create your first delivery and it will appear here with tracking, payment, receipt, and support history.`
- CTA: `Create delivery`

Rules:
- Do not show filter controls as the dominant element.
- Keep search available only if product wants layout consistency; disabled search is acceptable when empty.

### Filtered Empty
Trigger:
- Fresh list has deliveries, but active search/filter produces no visible rows.

UI:
- Show active chips.
- Show empty result state.
- Provide `Clear filters`.
- Preserve search text for editing.

Copy:
- Title: `No deliveries match`
- Body: `Change the search or reset filters to see more deliveries.`
- CTA: `Clear filters`

### Searching
Trigger:
- User types into search field and local result calculation is running.

UI:
- Keep previous results until calculation completes if calculation is visible.
- Show small progress affordance only if delay exceeds `300ms`.

Copy:
- Status message: `Searching deliveries`

### Stale Cache
Trigger:
- Cached results are shown after failed fresh request or offline startup.

UI:
- Persistent banner below header.
- Result rows remain interactive only according to stale-data policy.

Copy:
- Banner: `Showing saved history. Refresh when your connection returns.`
- Action: `Try again`

Rules:
- Do not hide stale state after scrolling.
- Do not imply latest status is verified.

### Offline
Trigger:
- Device is offline.

UI:
- If cached rows exist, show stale cache state.
- If no cached rows exist, show offline empty state.

Copy:
- Title: `History needs a connection`
- Body: `Connect to the internet to load your delivery history.`
- CTA: `Try again`

### API Error
Trigger:
- API fails and no cache is available.

UI:
- Inline full-screen error state.
- Retry button.
- Support entry only if repeated failures occur.

Copy:
- Title: `History did not load`
- Body: `We could not load your deliveries. Check your connection and try again.`
- CTA: `Try again`

### Not Authorized
Trigger:
- API returns authorization failure for current session role.

UI:
- Protected-route error with sign-in route.

Copy:
- Title: `You cannot view this history`
- Body: `Sign in with the sender account that created these deliveries.`
- CTA: `Sign in`

### Session Expired
Trigger:
- API returns session expiry or app auth state is invalid.

UI:
- Session expired state.

Copy:
- Title: `Session expired`
- Body: `Sign in again to view your delivery history.`
- CTA: `Sign in`

## Action Gating
### Open Delivery
Allowed:
- Every row with valid `deliveryId`.

Route:
- `/(sender)/deliveries/:deliveryId`

### View Timeline
Allowed:
- Every row with valid `deliveryId`.

Route:
- `/(sender)/deliveries/:deliveryId/timeline`

Placement:
- Inline for active deliveries if space allows.
- Otherwise in overflow or detail route.

### Recover Payment
Allowed when:
- `paymentStatus=failed`.
- `paymentStatus=pending` and product wants history-level payment rescue.

Route:
- `/(sender)/payments/:deliveryId/recover`

Rules:
- Do not call payment mutation from row.
- Do not show for `confirmed`, `refund_pending`, or `refunded`.

### View Receipt
Allowed when:
- `paymentStatus=confirmed`, `refund_pending`, or `refunded`.
- Receipt route exists for the delivery.

Route:
- `/(sender)/receipts/:deliveryId`

Rules:
- If receipt availability is not guaranteed by list row, keep receipt action in delivery detail instead of showing inline.

### Track Refund
Allowed when:
- `paymentStatus=refund_pending` or `refunded`.

Route:
- `/(sender)/deliveries/:deliveryId/refund`

### Report Issue
Allowed:
- From row overflow or delivery detail route.

Recommended v1:
- Keep issue creation in delivery detail unless row status is clearly blocked or failed.

Route:
- `/(sender)/issues/new?deliveryId=:deliveryId`

Rules:
- Do not create issue directly from history.

### Create Delivery
Allowed:
- Always when authenticated sender session is valid.

Route:
- `/(sender)/create`

Placement:
- Empty state.
- Optional floating or header action only if it does not fight search.

## Visual System
### Art Direction
Use a serious logistics ledger style:
- Calm background.
- High-contrast text.
- Warm operational accents.
- Subtle route line motif.
- Strong list rhythm.
- Minimal shadows.

Avoid:
- Consumer shopping cart styling.
- Playful package icons as primary identity.
- Dense spreadsheets.
- Glowing map backgrounds.
- Overuse of colored chips.
- Decorative graphs.

### Color Tokens
Use existing app tokens when available. If Claude Code creates design tokens later, map to these roles:
- `surface.history.base`
- `surface.history.raised`
- `surface.history.control`
- `text.primary`
- `text.secondary`
- `text.muted`
- `border.subtle`
- `accent.route`
- `status.payment.pending`
- `status.payment.failed`
- `status.payment.confirmed`
- `status.refund`
- `status.issue`
- `status.completed`
- `status.closed`

Color behavior:
- Failed payment and delivery failed use critical tone.
- Pending payment and on hold use attention tone.
- Confirmed payment and delivered use positive tone.
- Cancelled and closed use neutral tone.
- Always pair color with text.

### Typography
Use app typography tokens.

Hierarchy:
- Screen title: strong, compact.
- Search text: readable at base size.
- Receiver name: row primary.
- Tracking code: monospaced or tabular style only if existing system supports it.
- Status labels: small but legible.
- Time label: secondary.

Do not make tracking code visually louder than receiver and status.

### Spacing
Rules:
- Header sticks without crowding.
- Search field has enough top/bottom padding for thumb use.
- Rows have at least `64px` height, more when status/action wraps.
- Keep visible gap between quick filters and first row.
- Maintain bottom safe area for navigation.

### Motion
Use motion only for:
- Search result count change.
- Filter sheet open/close.
- Pull-to-refresh.
- Row press feedback.
- Empty state entrance.

Motion rules:
- Respect reduced motion.
- Avoid animated route lines in list rows.
- Avoid looping motion.
- Keep transitions under `250ms` unless platform default says otherwise.

## Mobile Ergonomics
One-handed use:
- Search field remains reachable near top but not hidden behind unreachable chrome.
- Filter button remains near search.
- Common row action is row tap, not tiny icon.
- Urgent row CTA must be large enough for thumb use.

Small phones:
- Search remains full width.
- Quick filter row scrolls horizontally.
- Row text wraps to two lines before truncating critical status.
- Delivery ID/tracking code can truncate middle only if copy action or detail route reveals full value.

Large phones:
- Do not add extra columns.
- Use slightly larger row spacing and maintain same hierarchy.

Keyboard:
- When search field is focused, keep first results visible above keyboard when possible.
- Clear button remains visible.
- Filter sheet avoids being hidden by keyboard.

## Accessibility Requirements
### Screen Reader
Screen must expose:
- Screen title.
- Search field label and hint.
- Active filters and count.
- Result count status.
- Row accessible name.
- Row accessible hint.
- Payment and issue urgency.
- Refresh state.
- Empty/error state heading and action.

Row accessible name format:
- `{receiverName}, {trackingCode}, {routeLabel}, {deliveryStatusLabel}, {paymentStatusLabel}, latest update {relativeTime}.`

Row accessible hint:
- `Opens delivery details.`

Urgent row hint:
- `Payment action available.` or `Issue state shown.`

### Focus Order
Default focus order:
- Top bar.
- Search field.
- Filter button.
- Active chips.
- Result count.
- Rows in visual order.
- Empty/error actions.

When filters apply:
- Announce result count without moving focus.

When filter sheet closes:
- Return focus to `Filter`.

### Contrast And Text Size
Requirements:
- Text contrast meets WCAG AA.
- Critical status text must meet AA on its background.
- Layout survives large text.
- Rows expand vertically as needed.
- No text is only available through hover.

### Reduced Motion
When reduced motion is enabled:
- Disable animated count transitions.
- Use instant filter sheet or platform reduced-motion behavior.
- Keep pull-to-refresh accessible.

## Copy System
Voice:
- Clear.
- Direct.
- Operational.
- Low hype.
- Reassuring without hiding constraints.

Do:
- Say what happened.
- Say what is needed.
- Use sender language.
- Keep row labels short.

Do not:
- Say `your package is safe` unless backend state supports it.
- Say `live` unless data is live.
- Say `guaranteed` unless policy says so.
- Use internal lifecycle names as visible labels.
- Use staff role jargon without sender-friendly translation.

### Core Strings
Screen title:
- `Delivery history`

Search label:
- `Search deliveries`

Search hint:
- `Tracking code, receiver, station, or delivery ID`

Filter button:
- `Filter`

Clear search:
- `Clear search`

Clear filters:
- `Clear filters`

Refresh:
- `Refresh`

Open row:
- `Open delivery`

Timeline:
- `View timeline`

Payment:
- `Recover payment`

Receipt:
- `View receipt`

Refund:
- `Track refund`

Create:
- `Create delivery`

### Empty State Copy
Title:
- `No deliveries yet`

Body:
- `Create your first delivery and it will appear here with tracking, payment, receipt, and support history.`

CTA:
- `Create delivery`

### Filtered Empty Copy
Title:
- `No deliveries match`

Body:
- `Change the search or reset filters to see more deliveries.`

CTA:
- `Clear filters`

### Offline Copy
Title:
- `History needs a connection`

Body:
- `Connect to the internet to load your delivery history.`

CTA:
- `Try again`

### Stale Copy
Banner:
- `Showing saved history. Refresh when your connection returns.`

### Error Copy
Title:
- `History did not load`

Body:
- `We could not load your deliveries. Check your connection and try again.`

CTA:
- `Try again`

## Component Inventory
Claude Code should build or reuse these components:
- `SenderHistoryScreen`
- `HistoryTopBar`
- `HistoryLensHeader`
- `DeliveryHistorySearchField`
- `QuickFilterRail`
- `ActiveFilterChip`
- `HistoryResultCount`
- `DeliveryHistoryList`
- `DeliveryHistoryRow`
- `DeliveryStatusLabel`
- `PaymentStatusLabel`
- `RouteLabel`
- `TouchpointLabel`
- `HistoryFilterSheet`
- `FilterGroup`
- `FilterOptionRow`
- `HistoryEmptyState`
- `HistoryFilteredEmptyState`
- `HistoryOfflineState`
- `HistoryErrorState`
- `HistoryStaleBanner`
- `HistorySkeletonRows`

Component constraints:
- Components must be data-driven from `deliveryListResponseSchema`.
- Components must not require fields from delivery detail.
- Components must not embed backend mutations.
- Components must expose test IDs.

## Test IDs
Required test IDs:
- `screen-sender-delivery-history`
- `sender-history-search`
- `sender-history-filter-button`
- `sender-history-filter-sheet`
- `sender-history-filter-apply`
- `sender-history-filter-reset`
- `sender-history-clear-search`
- `sender-history-clear-filters`
- `sender-history-result-count`
- `sender-history-quick-filter-all`
- `sender-history-quick-filter-needs-payment`
- `sender-history-quick-filter-active`
- `sender-history-quick-filter-completed`
- `sender-history-quick-filter-issues`
- `sender-history-quick-filter-refunds`
- `sender-history-quick-filter-doorstep`
- `sender-history-list`
- `sender-history-row-{deliveryId}`
- `sender-history-row-open-{deliveryId}`
- `sender-history-row-timeline-{deliveryId}`
- `sender-history-row-payment-{deliveryId}`
- `sender-history-row-receipt-{deliveryId}`
- `sender-history-row-refund-{deliveryId}`
- `sender-history-empty`
- `sender-history-filtered-empty`
- `sender-history-offline`
- `sender-history-error`
- `sender-history-stale-banner`
- `sender-history-refresh`

Test ID rules:
- Replace `{deliveryId}` with the exact `deliveryId`.
- Do not use tracking code in test ID because it may be copied outside UI.
- Keep IDs stable across visual changes.

## Analytics Events
Recommended events:
- `sender_history_viewed`
- `sender_history_loaded`
- `sender_history_load_failed`
- `sender_history_refreshed`
- `sender_history_search_started`
- `sender_history_search_cleared`
- `sender_history_filter_opened`
- `sender_history_filter_applied`
- `sender_history_filter_reset`
- `sender_history_quick_filter_selected`
- `sender_history_delivery_opened`
- `sender_history_timeline_opened`
- `sender_history_payment_recovery_opened`
- `sender_history_receipt_opened`
- `sender_history_refund_opened`
- `sender_history_create_delivery_tapped`

Analytics payload:
- `resultCount`
- `activeFilterCount`
- `quickFilter`
- `hasSearchText` boolean
- `deliveryStatus` for row action
- `paymentStatus` for row action
- `serviceType` for row action
- `doorstepRequested` boolean
- `isStale` boolean

Do not send:
- Receiver name.
- Tracking code.
- Delivery ID unless analytics policy approves hashed IDs.
- Station pair if analytics policy treats it as sensitive.
- Search text.
- Phone numbers.

## Performance Requirements
Targets:
- Initial useful render with cached shell: under `1 second` on normal device.
- Fresh list response reflected: under `2 seconds` p95 per search policy.
- Local search/filter response: under `150ms` for `100` rows.
- Pull-to-refresh starts immediately.
- Row press response: under `100ms`.

Rules:
- Use memoized local filtering only if needed by framework performance.
- Do not render all heavy child routes in each row.
- Avoid loading proof images in history.
- Avoid map rendering in history.
- Avoid expensive fuzzy search for short inputs.
- Defer non-critical analytics work.

## Privacy And Security
Sender history privacy rules:
- The sender sees only deliveries accessible to their authenticated principal.
- Sender-facing search is scoped to returned sender deliveries.
- Sender-facing search never reveals unrelated senders, receivers, staff, drivers, or couriers.
- Receiver phone must not appear in list rows.
- Payment references must not appear unless a future sender-owned field is returned and approved.
- Raw provider data must not appear.
- Staff IDs and actor IDs must not appear.
- Proof references must not appear.
- Internal issue notes must not appear.

Route safety:
- Do not trust `deliveryId` from navigation unless detail route confirms access.
- Do not infer access from a row cached locally.
- Session expiry must force sign-in.

## Edge Cases
### Long Receiver Name
Behavior:
- Show first line with truncation after two lines.
- Keep tracking code and status visible.
- Full receiver name appears in delivery detail.

### Unknown Station Mapping
Behavior:
- Show station ID.
- Do not crash.
- Search should still match station ID.

### Invalid Date
Behavior:
- Treat as API data error.
- Show row with `Latest update unavailable`.
- Capture telemetry without exposing stack trace.

### Duplicate Latest Timestamps
Behavior:
- Use stable `deliveryId` fallback sort.

### Large History Count
Behavior:
- Show first returned `100` records.
- If product wants more, require backend cursor spec before infinite scroll.
- Do not fabricate paging controls.

### Delivery Missing Action Eligibility
Behavior:
- Default row tap to detail.
- Keep payment/receipt/refund actions in detail if list row lacks enough data.

### Payment Pending On Closed Delivery
Behavior:
- Show payment status truth.
- Open detail for resolution.
- Do not expose payment recovery unless backend policy confirms it.

### Refund Pending With Delivered Status
Behavior:
- Show refund state prominently.
- Route to refund tracker.

### Doorstep Requested With Station Touchpoint
Behavior:
- Show doorstep marker.
- Latest touchpoint may still be station update.
- Do not imply doorstep courier is assigned unless status says so.

### Issue State With Confirmed Payment
Behavior:
- Show issue status more prominently than paid badge.
- Keep paid visible but not dominant.

## QA Acceptance Criteria
Functional:
- Screen renders at `/(sender)/history`.
- Unauthenticated user is routed to sign-in.
- Initial load calls `GET /v1/deliveries?limit=100` or equivalent typed client call.
- Screen renders all fields returned by `deliveryListResponseSchema` that are required for row summary.
- Search matches tracking code.
- Search matches delivery ID.
- Search matches receiver name.
- Search matches station display names when mapped.
- Search does not require server query.
- Quick filters narrow local rows correctly.
- Filter sheet applies and resets filters.
- Empty state appears for zero deliveries.
- Filtered empty state appears when filters remove all rows.
- Pull-to-refresh reloads list.
- Row tap routes to delivery detail.
- Timeline action routes to timeline.
- Failed payment action routes to payment recovery.
- Refund action routes to refund status.

Contract:
- No unsupported query params are sent.
- No delivery mutation endpoint is called.
- No payment mutation endpoint is called.
- No cancellation endpoint is called.
- No issue creation endpoint is called directly.
- No fields outside `deliveryListResponseSchema` are required for initial row render.

Privacy:
- Receiver phone is absent.
- Staff actor IDs are absent.
- Proof references are absent.
- Provider references are absent.
- Search text is not sent in analytics.

Accessibility:
- Search field has label and hint.
- Result count changes are announced.
- Filter sheet is focus-managed.
- Rows have accessible names.
- Large text keeps critical status visible.
- High contrast mode distinguishes status through text.
- Reduced motion disables nonessential animation.

Visual:
- History looks like a premium operational ledger, not a dense admin table.
- Payment failures are immediately visible.
- Issue states are immediately visible.
- Empty state drives create delivery.
- Filter controls do not dominate the screen.

## Implementation Notes For Claude Code
Build this screen as a read-only sender history surface.

Use:
- `list_deliveries`.
- `deliveryListQuerySchema`.
- `deliveryListResponseSchema`.
- `stationCatalog`.
- `deliveryStatuses`.
- `paymentStatusSchema`.

Do not use:
- `get_delivery` for every row on initial list render.
- `get_delivery_timeline` for every row on initial list render.
- Payment mutation endpoints.
- Delivery mutation endpoints.
- Cancellation endpoints.
- Issue mutation endpoints.
- Admin list endpoints.
- Staff queue endpoints.

Implementation sequence:
1. Add typed data hook for `list_deliveries` with `limit=100`.
2. Add defensive client sort by `latestOccurredAt`.
3. Add local search index over approved fields.
4. Add local quick filters.
5. Add filter sheet.
6. Add row rendering with status/action mapping.
7. Add loading, empty, filtered-empty, offline, stale, and error states.
8. Add accessibility announcements.
9. Add analytics with privacy-safe payloads.
10. Add screen tests and route tests.

## Open Product Decisions
No blocking decisions for v1.

Future decisions:
- Whether to add server-side search query.
- Whether to add cursor pagination.
- Whether to add server-supported date range.
- Whether to expose sender-owned payment references in list rows.
- Whether to expose receipt availability in list rows.
- Whether to expose repeat-delivery action in history.
- Whether small-business senders need export in a separate business portal.

These future decisions must not be implied by this screen.

## Final Handoff Summary
Claude Code should build `SenderDeliveryHistory` as the sender's read-only searchable delivery ledger. It must call `list_deliveries`, render newest deliveries first from `deliveryListResponseSchema`, provide local search and filters over sender-approved returned fields, expose urgent payment/issue/refund states, route all detail actions to owning screens, handle empty/offline/stale/error states, and protect sender privacy by hiding receiver phone, staff IDs, provider references, proof references, and raw metadata.
