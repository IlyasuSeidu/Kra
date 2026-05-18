# Create Delivery Stations Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CreateDeliveryStations` |
| App | `apps/mobile` |
| Route | `/(sender)/create/stations` |
| Primary test ID | `screen-create-delivery-stations` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Shared station catalog, local draft, route-price key validation |
| Related routes | `/(sender)/create`, `/(sender)/create/receiver`, `/(sender)/home` |
| Required states | `loading`, `normal`, `origin_only`, `destination_only`, `same_station_error`, `unavailable_route`, `catalog_unavailable`, `offline`, `stale_draft` |

## Product Job
This screen lets an authenticated sender choose the origin and destination stations for a delivery draft. It must make the launch network feel clear, trustworthy, and fast while staying honest about what is already known. The sender is not buying anything on this screen. The sender is choosing the station pair that will power later receiver, package, option, quote, and payment steps.

The sender should be able to:
- See the launch station network.
- Choose the station where the package will enter the Kra network.
- Choose the station where the receiver will collect or where final-mile service may start later.
- Understand which station pair is selected.
- Understand that the exact price appears later before payment.
- Continue only when origin and destination are both valid and different.
- Recover if a selected route is not enabled.
- Preserve progress in the local create-delivery draft.

This screen is not the receiver form, package form, doorstep option selector, quote screen, payment screen, map-tracking screen, support screen, or admin station management screen.

## Audience
Primary audience:
- Authenticated senders creating a delivery.
- Small-business senders who repeat routes and need low-friction station choice.
- First-time senders who need confidence that Kra operates on clear station corridors.
- Senders using low-bandwidth phones where maps may be slow or unavailable.

Secondary audience:
- Senders resuming a local draft from the start screen.
- QA engineers validating draft state and route validation.
- Claude Code implementing this route from the spec.
- Operations and product reviewers confirming that sender-facing station logic does not expose admin controls.

## User State
The sender has already chosen to start or resume a delivery draft. They are deciding where the package starts and where the receiver should collect or receive onward service. The screen must keep the decision concrete and narrow: choose two stations, then continue.

The sender may be:
- In a shop preparing multiple parcels.
- At home before visiting a station.
- Near an origin station and checking whether the destination city is supported.
- On weak connectivity and expecting the app to remain clear.
- Returning to a draft after interruption.

The screen must:
- Make the two-station task obvious.
- Show all launch stations without hiding the list behind a required search.
- Support fast search when the station list grows.
- Prevent same-station continuation.
- Prevent continuation for disabled route pairs.
- Avoid showing quote amount.
- Avoid implying doorstep availability before the delivery options step.
- Avoid calling admin-only station endpoints.

## Primary Action
Primary CTA:
- `Continue to receiver`

Secondary actions:
- `Back`
- `Clear`
- `Change origin`
- `Change destination`

CTA behavior:
- `Continue to receiver` saves `originStationId` and `destinationStationId` to the local create-delivery draft, then routes to `/(sender)/create/receiver`.
- `Back` routes to `/(sender)/create`.
- `Clear` removes both selected station IDs from this screen and draft section only.
- `Change origin` focuses the origin station picker.
- `Change destination` focuses the destination station picker.

Rules:
- `Continue to receiver` must stay disabled until origin and destination are selected.
- `Continue to receiver` must stay disabled when both selected IDs are the same.
- `Continue to receiver` must stay disabled when the route key is not present in the approved route pricing map.
- The CTA must not call `create_delivery`.
- The CTA must not call `initialize_payment`.
- The CTA must not calculate or reveal quote amount.
- The CTA must not call `/v1/admin/stations`.

## First Meaningful Value
First meaningful value is reached when the sender sees that Kra supports clear station-to-station corridors and can select a valid route for the delivery.

The screen creates value by:
- Reducing route uncertainty before the sender enters receiver details.
- Making station names and cities easy to scan.
- Making invalid station pairs impossible to submit.
- Showing a short route summary before continuing.
- Preserving the choice locally.

This screen does not create backend delivery value yet. Backend delivery state begins only when `create_delivery` succeeds later in the flow.

## Main Tension
The station task looks simple, but it controls pricing, service availability, station custody, pickup expectations, and later payment. The screen must feel quick while preventing the sender from selecting a route that the backend cannot price. The right UX is a focused two-step station selector with a visible selected route, not a dense logistics console.

The screen must balance:
- Speed against route correctness.
- Local launch catalog against future network expansion.
- Trust-building context against mobile brevity.
- Touch-friendly station cards against list density.
- Offline clarity against no false availability claim.

## Design Brief
User and job:
- An authenticated sender wants to choose where a package enters and leaves the Kra station network.

Context of use:
- Transactional, mobile-first, sometimes interrupted, often time-sensitive.

Entry point:
- `/(sender)/create` after a new or resumed local draft.

Success state:
- Local draft contains a valid `originStationId` and `destinationStationId`, and the app routes to `/(sender)/create/receiver`.

Primary action:
- `Continue to receiver`

Navigation model:
- Step 2 of the sender create-delivery stack flow.

Density:
- Balanced and scannable.

Visual thesis:
- A route board for a serious logistics product: crisp station choices, a clear corridor line, and low-noise operational confidence.

Restraint rule:
- Avoid maps, price previews, dense service badges, admin status language, and route-marketing copy.

Product lens:
- Trust-critical guided transaction.

System stance:
- Match the sender create-delivery flow language while introducing a more operational route-selection surface.

Interaction thesis:
- Tap-to-select station cards, route line updates instantly, and errors appear inline where the decision happens.

Signature move:
- A compact "corridor spine" at the top that draws origin and destination into one visual route summary.

Activation event:
- Sender continues from a valid station pair into receiver details.

## Elite Quality Gate
This spec is not closed unless the resulting screen lets a sender choose a valid station pair quickly without exposing backend-only station controls or premature pricing.

Non-negotiable quality requirements:
- The first viewport must identify the current step as station selection.
- Origin and destination must be separate, obvious controls.
- All launch stations must be visible without requiring typing.
- Search must be optional and useful when station count grows.
- The selected route must be summarized before continuation.
- Same-station selection must produce a clear inline error.
- Unpriced route selection must produce a clear inline error.
- The screen must not call `create_delivery`.
- The screen must not call `initialize_payment`.
- The screen must not call `/v1/admin/stations`.
- The screen must not display quote amount.
- The screen must not display doorstep eligibility as final.
- The screen must not expose station validation blockers to senders.
- The screen must update only the local draft station fields.
- The screen must support screen reader, large text, high contrast, reduced motion, and one-hand use.
- The screen must remain useful on small phones and weak connectivity.

Closure rule:
- If the sender can continue with the same station as both origin and destination, the screen remains open.
- If the sender sees a price on this screen, the screen remains open.
- If an admin station endpoint is required for sender rendering, the screen remains open.
- If the route summary can contradict the selected cards, the screen remains open.
- If an unavailable route looks selectable without explanation, the screen remains open.
- If the selected station IDs are not persisted into the local draft, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support focused mobile controls, search fields, lists, progressive disclosure, and predictable navigation.
- Material Design guidance for search, lists, radio selection, and cards supports touch-friendly selection and clear chosen states.
- GOV.UK and public-sector form guidance supports asking one clear decision at a time and reducing field complexity.
- W3C WCAG 2.2 supports target size, visible focus, error identification, input labels, and status messaging.
- DHL service-point flows show that logistics location choice should prioritize location names, availability cues, and clear next actions over decoration.
- Kra pricing rules define the launch station corridors and require price display before payment, not on this station step.
- Kra shared domain code defines the v1 station IDs, station names, route keys, and enabled base-fee corridors.
- Kra sender app spec defines station selection as the first create-delivery form step after the start screen.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/search/overview
- https://m3.material.io/components/lists/overview
- https://m3.material.io/components/radio-button/overview
- https://m3.material.io/components/cards/overview
- https://designsystem.gov.scot/guidance/forms/form-design
- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.dhl.com/us-en/home/express/locations/drop-and-ship.html
- `docs/03-business/pricing-rules.md`
- `docs/04-features/sender-app-spec.md`
- `packages/shared/src/domain/pricing.ts`
- `packages/shared/src/domain/delivery-draft.ts`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/routes.ts`
- `services/api/src/stations.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- A local create-delivery draft shell exists or can be repaired from the previous step.
- V1 launch stations are defined in `stationCatalog`.
- V1 route enablement is represented by route keys in `defaultPricingConfig.routeBaseFees` or a future sender-safe pricing manifest with the same key shape.
- All self-serve route pairs must pass through `originStationId !== destinationStationId`.
- The screen can use route key presence to determine whether a corridor can move forward.
- The exact quote appears later on `/(sender)/create/quote`.
- Operational station validation is controlled by admin surfaces and launch readiness, not this sender screen.
- Admin station validation details must not be exposed to senders.
- Doorstep availability is decided later after destination, receiver address, service options, and policy checks are known.
- Payment remains unavailable until quote acceptance and delivery creation.

If a sender-safe station availability endpoint is added later, it must be documented separately before this screen depends on it. Until then, this spec uses the shared launch station catalog and route-pricing key validation only.

## Non-Goals
Do not implement these in this screen:
- Receiver name entry.
- Receiver phone entry.
- Receiver address entry.
- Package description entry.
- Package size or weight entry.
- Fragile or declared value entry.
- Service speed selector.
- Doorstep selector.
- Quote amount display.
- Quote breakdown display.
- Payment method display.
- Payment initialization.
- Backend delivery creation.
- Tracking code display.
- Delivery ID display.
- Admin station status controls.
- Admin station validation details.
- Staff queue counts.
- Issue counts.
- Live maps.
- GPS permission requests.
- Route tracking.
- Support issue creation.

## Route Rules
### Route
- Render at `/(sender)/create/stations`.
- Must require authenticated sender session.
- Must require sender role.
- Must not render for unauthenticated users.
- Must not render for staff/admin roles.
- Must be reachable from `/(sender)/create`.
- Must route forward to `/(sender)/create/receiver` only after valid station selection.

### Accepted Query Params
Allowed:
- `source`: `create_start`, `resume`, `back`, `unknown`.
- `focus`: `origin`, `destination`, or omitted.

Ignored safely:
- Unknown query params.

Rules:
- `focus=origin` should move initial focus to origin search or origin list heading after first render.
- `focus=destination` should move initial focus to destination search or destination list heading after first render.
- Query params must not override saved draft station IDs without user action.

### Entry Preconditions
Before rendering normal state:
- Confirm sender session is valid.
- Load local create-delivery draft shell.
- Load station catalog from shared app bundle.
- Load route-key map from shared pricing config or equivalent sender-safe manifest.

If no local draft shell exists:
- Create a local draft shell with no station IDs.
- Do not create a backend delivery.
- Continue rendering the normal station screen.

If the local draft is stale or corrupted:
- Show stale draft state.
- Offer `Start again` and `Back to home`.
- Do not silently discard station choices.

### Exit Rules
On valid continue:
- Persist `originStationId`.
- Persist `destinationStationId`.
- Persist `stationSelectionCompletedAt`.
- Route to `/(sender)/create/receiver`.

On back:
- Preserve existing station selections.
- Route to `/(sender)/create`.

On clear:
- Remove `originStationId`.
- Remove `destinationStationId`.
- Remove `stationSelectionCompletedAt`.
- Keep draft shell.
- Stay on the same route.

## Backend And Data Contract
### Current Backend Boundary
This route must not call backend write operations. The only allowed data operations are local draft read/write and reading bundled shared domain data.

Allowed:
- Read `stationCatalog` from `packages/shared/src/domain/pricing.ts` or generated app equivalent.
- Read `defaultPricingConfig.routeBaseFees` route keys or generated app equivalent.
- Use `getRoutePricingKey(originStationId, destinationStationId)` logic.
- Save station IDs to local draft storage.
- Restore station IDs from local draft storage.

Not allowed:
- `POST /v1/deliveries`
- `POST /v1/payments/initialize`
- `POST /v1/payments/verify`
- `GET /v1/admin/stations`
- `POST /v1/admin/stations/:id/status`
- `POST /v1/admin/stations/:id/validation`
- Any admin station endpoint.
- Any staff-only endpoint.

### Shared Station Catalog
V1 station IDs:
- `ST-ACC-01`
- `ST-KMS-01`
- `ST-TML-01`

V1 station cards:
- `Accra Central`, city `Accra`, code `ACC`, ID `ST-ACC-01`.
- `Kumasi Adum`, city `Kumasi`, code `KMS`, ID `ST-KMS-01`.
- `Tamale Central`, city `Tamale`, code `TML`, ID `ST-TML-01`.

Display rules:
- Show public station name.
- Show city.
- Show station code as a supporting identifier.
- Do not show internal IDs in primary UI.
- Internal IDs may be used in accessibility value only if needed for QA builds, never as sender-facing copy.

### Route Enablement
The screen must derive route availability from route keys, not from price amount display.

Enabled V1 route keys:
- `ST-ACC-01:ST-KMS-01`
- `ST-KMS-01:ST-ACC-01`
- `ST-ACC-01:ST-TML-01`
- `ST-TML-01:ST-ACC-01`
- `ST-KMS-01:ST-TML-01`
- `ST-TML-01:ST-KMS-01`

Validation rules:
- If either station is missing, route is incomplete.
- If both station IDs match, route is invalid.
- If route key is absent, route is unavailable.
- If route key exists, route can continue.

Do not reveal base fees on this screen.

### Local Draft Shape
The screen owns these draft fields:

```ts
type StationDraftPatch = {
  originStationId?: "ST-ACC-01" | "ST-KMS-01" | "ST-TML-01";
  destinationStationId?: "ST-ACC-01" | "ST-KMS-01" | "ST-TML-01";
  stationSelectionCompletedAt?: string;
};
```

Draft write rules:
- Save each selected station immediately after user selection.
- Save `stationSelectionCompletedAt` only after pressing `Continue to receiver`.
- Preserve receiver, package, options, and quote fields if they still match the selected route policy.
- If route change invalidates later draft steps, mark those later steps for review instead of deleting silently.

Later-step invalidation policy:
- If station pair changes after receiver/package/options are already entered, keep the values but set `needsRouteReview: true` in local draft metadata.
- Route to receiver step after continue.
- Future quote step must recalculate from current station pair.

### Error Code Mapping
Because this route does not call backend operations, most errors are local UI errors.

Local error codes:
- `station_catalog_unavailable`
- `origin_station_required`
- `destination_station_required`
- `same_station_pair`
- `route_key_unavailable`
- `draft_write_failed`
- `draft_stale`
- `offline_station_catalog_cached`

If a future sender-safe station endpoint exists:
- Map `401` to auth recovery.
- Map `403` to role access denied.
- Map `404` station to catalog mismatch.
- Map `409` station paused to unavailable route state.
- Map `429` to retry later.
- Map `5xx` to retry state.

## Information Architecture
### Screen Regions
1. Top navigation
2. Step header
3. Corridor spine
4. Origin selector
5. Destination selector
6. Route validation message
7. Continue action
8. Low-bandwidth note

### Priority Order
The visual hierarchy must be:
- Current step and task.
- Selected corridor summary.
- Origin station picker.
- Destination station picker.
- Inline route state.
- Continue CTA.
- Secondary help note.

### First Viewport
On an iPhone-sized viewport, the first screen view should include:
- Back affordance.
- `Stations` or equivalent step title.
- Short task copy.
- Route spine with origin and destination slots.
- At least the origin selector start.
- Primary CTA visible or reachable without long scroll on common devices.

If the station list takes vertical space:
- Keep the primary CTA sticky at bottom.
- Ensure it does not cover list items.
- Add bottom padding equal to sticky CTA height plus safe-area inset.

## Layout System
### Screen Frame
Use a mobile stack layout:
- Safe-area top padding.
- Header area.
- Scrollable content.
- Sticky bottom CTA bar.
- Safe-area bottom padding.

Recommended content width:
- Full phone width with `20px` side padding on compact phones.
- `24px` side padding on larger phones.
- Max content width `430px` for tablet-like phone windows.

### Top Navigation
Elements:
- Back icon button.
- Center or left-aligned step label.
- Optional step indicator `Step 2 of 6`.

Rules:
- Back target is `/(sender)/create`.
- Back button hit area minimum `44px` by `44px`.
- The step label must not wrap into more than two lines.
- Avoid crowded right-side actions.

### Step Header
Content:
- Eyebrow: `Create delivery`
- Title: `Choose stations`
- Body: `Pick where Kra receives the package and where the receiver collects it. Price appears before payment.`

Rules:
- Body copy must stay under 130 characters.
- Do not mention quote amount.
- Do not mention doorstep eligibility as final.

### Corridor Spine
Purpose:
- Show the current route as one understandable object.

Visual structure:
- Vertical or compact horizontal route line.
- Origin node.
- Destination node.
- Connecting line.
- Status chip.

Default empty state:
- Origin node label: `Origin`
- Origin value: `Choose station`
- Destination node label: `Destination`
- Destination value: `Choose station`
- Status chip: `Select two stations`

Origin selected only:
- Origin value: selected station name.
- Destination value: `Choose destination`
- Status chip: `Destination needed`

Both selected and valid:
- Origin value: selected origin name.
- Destination value: selected destination name.
- Status chip: `Route available`

Both selected and invalid:
- Status chip: `Route needs attention`

Rules:
- Use status chip color sparingly.
- Do not include price.
- Do not include travel time.
- Do not include distance unless future verified data exists.

### Station Selector Pattern
Use two grouped selectors:
- Origin group.
- Destination group.

Each group contains:
- Group heading.
- Search input.
- Station card list.
- Selected station summary.

When station count is three:
- Show all station cards by default.
- Search can be visually compact and optional.

When station count grows:
- Search becomes more prominent.
- Keep recent/frequent stations only if real user history exists.

Do not show empty personalization areas without real data.

### Station Cards
Each card should include:
- Station name.
- City.
- Station code.
- Selection state.
- Public support text.

Recommended card copy:
- Name: `Accra Central`
- Meta: `Accra - ACC`
- Support: `Launch station`

Card rules:
- Entire card must be tappable.
- Touch target minimum `44px` high, target `48px` or higher.
- Selected card must be visible by color, border, icon, and accessibility state.
- Disabled card must not look selected.
- Do not use color alone to communicate state.
- Avoid dense badges.
- Avoid showing internal validation fields.

### Route Validation Message
Position:
- Immediately below the corridor spine and above the sticky CTA, or inside a persistent validation panel near the CTA.

Normal valid copy:
- `This station pair can continue. You will see the final price before payment.`

Missing station copy:
- `Choose both stations to continue.`

Same station copy:
- `Origin and destination must be different stations.`

Unavailable route copy:
- `This route is not available right now. Choose another station pair.`

Catalog unavailable copy:
- `Station list could not load. Try again or return to home.`

Rules:
- Error copy must include what happened and what to do next.
- Valid copy must not feel like a purchase confirmation.
- Do not show green success celebration for merely choosing stations.

### Sticky Bottom CTA
Elements:
- Primary button `Continue to receiver`
- Optional supporting line.

Supporting line variants:
- Disabled missing: `Choose origin and destination first.`
- Disabled invalid: `Fix station selection to continue.`
- Enabled: `Next: receiver details`

Rules:
- CTA remains visible at bottom.
- CTA respects safe-area inset.
- CTA must not overlap scroll content.
- Disabled state must be clear and accessible.
- Loading state must use button-level progress, not full screen if only saving local draft.

## Visual Direction
### Design Character
The screen should feel like a modern transport route board translated into a calm mobile booking step.

Use:
- Clear route-line composition.
- Strong type hierarchy.
- Crisp station cards.
- Minimal color accents.
- Gentle material surfaces.
- High contrast.
- Sparse iconography.

Avoid:
- Decorative maps.
- Large hero artwork.
- Dense dashboard panels.
- Tiny station chips.
- Excess badges.
- Multiple accent colors.
- Cartoon travel metaphors.
- Public marketing copy.

### Color Tokens
Recommended token roles:
- `surface.base`: app background.
- `surface.raised`: station card background.
- `surface.selected`: selected card tint.
- `border.default`: quiet dividers.
- `border.selected`: selected station outline.
- `text.primary`: titles and station names.
- `text.secondary`: city, code, support copy.
- `accent.route`: route spine and primary CTA.
- `state.success`: valid route indicator.
- `state.warning`: missing station hint.
- `state.danger`: invalid route error.

Rules:
- Use `accent.route` for the route spine and CTA only.
- Use state colors only for state messages.
- Keep contrast at or above WCAG AA.
- Ensure selected state remains clear in high contrast mode.

### Typography
Recommended hierarchy:
- Screen title: 28 to 34px, strong weight.
- Section headings: 17 to 20px, strong weight.
- Station names: 16 to 18px, medium to strong weight.
- Body copy: 15 to 16px.
- Meta copy: 13 to 14px.
- Button label: 16 to 17px, strong weight.

Rules:
- Do not use all caps for long labels.
- Station codes may be uppercase.
- Keep copy short enough for translation.
- Support dynamic type without clipping.

### Spacing
Recommended spacing:
- Screen side padding: `20px`.
- Header bottom gap: `20px`.
- Corridor spine padding: `16px`.
- Station group top gap: `24px`.
- Card gap: `10px`.
- Sticky CTA padding: `16px` plus safe area.
- Error message top gap: `10px`.

Rules:
- Keep group spacing consistent.
- Give selected route summary more breathing room than individual cards.
- Avoid packing both station lists into one unstructured card.

### Iconography
Allowed icons:
- Back chevron.
- Station or building glyph.
- Route connector or arrow.
- Check mark for selected station.
- Alert icon for route errors.
- Search icon inside search field.

Rules:
- Icons must support meaning.
- Do not mix icon styles.
- Do not rely on icon alone.
- All icon-only buttons require accessible labels.

## Component Inventory
### `CreateDeliveryStationsScreen`
Responsibilities:
- Own route rendering.
- Load local draft.
- Load station catalog.
- Coordinate selection state.
- Persist station fields.
- Navigate forward/back.
- Render all states.

Required props if implemented as a pure screen component:
- `session`
- `initialDraft`
- `stationCatalog`
- `routeBaseFees`
- `onPatchDraft`
- `onNavigate`
- `now`

### `CreateFlowHeader`
Responsibilities:
- Back navigation.
- Step label.
- Title region.

States:
- Default.
- Loading.
- Reduced text on small screen.

### `RouteSpine`
Responsibilities:
- Show origin and destination nodes.
- Show route connector.
- Show status chip.

Inputs:
- `originStation`
- `destinationStation`
- `routeStatus`

Route statuses:
- `incomplete`
- `valid`
- `same_station`
- `unavailable`
- `catalog_error`

### `StationSelectorGroup`
Responsibilities:
- Render heading.
- Render optional search.
- Render station list.
- Manage focus within group.

Instances:
- Origin.
- Destination.

### `StationCard`
Responsibilities:
- Display station identity.
- Handle selection.
- Expose selected state.
- Render disabled state when needed.

Required test IDs:
- `station-card-origin-ST-ACC-01`
- `station-card-origin-ST-KMS-01`
- `station-card-origin-ST-TML-01`
- `station-card-destination-ST-ACC-01`
- `station-card-destination-ST-KMS-01`
- `station-card-destination-ST-TML-01`

### `StationSearchField`
Responsibilities:
- Filter visible station cards.
- Clear search.
- Preserve accessibility labels.

Required test IDs:
- `station-search-origin`
- `station-search-destination`

### `RouteValidationPanel`
Responsibilities:
- Render missing, valid, and error copy.
- Provide accessible status updates.

Required test ID:
- `station-route-validation`

### `StickyContinueBar`
Responsibilities:
- Render CTA and support text.
- Handle disabled/loading states.
- Respect safe area.

Required test ID:
- `station-continue-bar`

## Content Specification
### Header Copy
Eyebrow:
- `Create delivery`

Title:
- `Choose stations`

Body:
- `Pick where Kra receives the package and where the receiver collects it. Price appears before payment.`

### Step Indicator
Preferred:
- `Step 2 of 6`

Allowed if design system uses labels:
- `Stations`

Do not show:
- `Route quote`
- `Payment`
- `Dispatch`

### Origin Section
Heading:
- `Origin station`

Supporting copy:
- `Where you will hand over the package to Kra.`

Search label:
- `Search origin station`

Empty search copy:
- `No origin station matches that search.`

### Destination Section
Heading:
- `Destination station`

Supporting copy:
- `Where the receiver collects, or where final-mile service may start later.`

Search label:
- `Search destination station`

Empty search copy:
- `No destination station matches that search.`

### Corridor Spine Copy
Default:
- `Select two stations`

Origin selected:
- `Destination needed`

Destination selected:
- `Origin needed`

Valid:
- `Route available`

Same station:
- `Choose a different station`

Unavailable:
- `Route unavailable`

### Validation Copy
Missing both:
- `Choose both stations to continue.`

Missing origin:
- `Choose an origin station to continue.`

Missing destination:
- `Choose a destination station to continue.`

Same station:
- `Origin and destination must be different stations.`

Unavailable route:
- `This route is not available right now. Choose another station pair.`

Valid route:
- `This station pair can continue. You will see the final price before payment.`

Draft write failed:
- `Your station choice was not saved. Try again before continuing.`

Catalog unavailable:
- `Station list could not load. Try again or return to home.`

Offline cached:
- `Using saved station list. You can choose stations now; final checks happen before payment.`

### Button Copy
Primary enabled:
- `Continue to receiver`

Primary disabled:
- `Continue to receiver`

Primary loading:
- `Saving stations`

Clear:
- `Clear`

Back:
- `Back`

Retry:
- `Try again`

Start again:
- `Start again`

### Copy Tone
The copy must be:
- Direct.
- Calm.
- Operational.
- Specific.
- Low-hype.
- Short.

Avoid:
- `Fastest route`
- `Guaranteed delivery`
- `Cheapest route`
- `Doorstep available`
- `Pay now`
- `Book now`
- `Finalize`

## State Model
### `loading`
When:
- Local draft is being restored.
- Station catalog bundle is being initialized.

UI:
- Show header skeleton.
- Show route spine skeleton with two nodes.
- Show three station card skeletons.
- Keep bottom CTA disabled.

Copy:
- `Loading stations`

Rules:
- Loading state must not flash for less than 300ms if data is immediate.
- If local data is available instantly, render normal state directly.
- Do not block on admin APIs.

### `normal`
When:
- Catalog is available.
- Draft is valid.
- No station selected or both can be changed.

UI:
- Show header.
- Show corridor spine.
- Show origin and destination groups.
- Show disabled CTA until valid.

### `origin_only`
When:
- Origin is selected.
- Destination is missing.

UI:
- Origin node filled.
- Destination node empty.
- Destination group visually next in flow.
- CTA disabled.

Copy:
- `Choose a destination station to continue.`

### `destination_only`
When:
- Destination is selected.
- Origin is missing.

UI:
- Destination node filled.
- Origin node empty.
- Origin group visually next in flow.
- CTA disabled.

Copy:
- `Choose an origin station to continue.`

### `valid_route`
When:
- Origin selected.
- Destination selected.
- IDs are different.
- Route key exists.

UI:
- Route spine shows selected station names.
- Validation panel shows valid route copy.
- CTA enabled.

Rules:
- Do not show price.
- Do not show payment controls.

### `same_station_error`
When:
- Origin and destination are the same station ID.

UI:
- Both cards may remain selected in their respective groups.
- Route spine uses error state.
- Validation panel explains the issue.
- CTA disabled.

Copy:
- `Origin and destination must be different stations.`

Recovery:
- User changes either origin or destination.

### `unavailable_route`
When:
- Origin and destination are different.
- Route key is absent.

UI:
- Route spine uses warning or error state.
- Validation panel explains the issue.
- CTA disabled.
- Cards remain selected so the sender can understand what failed.

Copy:
- `This route is not available right now. Choose another station pair.`

Recovery:
- User changes origin or destination.

### `catalog_unavailable`
When:
- Station catalog cannot be loaded from app bundle or generated manifest.

UI:
- Show error panel in content area.
- CTA hidden or disabled.
- Provide `Try again`.
- Provide `Back to home`.

Rules:
- This should be rare because station catalog is bundled.
- Do not show partial empty content without explanation.

### `offline`
When:
- Device is offline but bundled station catalog and local draft are available.

UI:
- Render stations normally.
- Show small offline cached note.
- CTA can continue because this step is local.

Copy:
- `Using saved station list. You can choose stations now; final checks happen before payment.`

Rules:
- Do not claim live station status.
- Do not block station selection solely because network is offline.

### `stale_draft`
When:
- Local draft has station IDs not in current catalog.
- Local draft format is invalid.
- Draft version is unsupported.

UI:
- Show repair panel.
- Offer `Start again`.
- Offer `Back to home`.

Copy:
- `This draft uses old station data. Start again to choose from the current launch stations.`

Rules:
- Do not silently discard.
- Do not route forward.

### `draft_write_failed`
When:
- Local storage write fails after station selection or continue.

UI:
- Keep selected stations in memory.
- Show inline error near CTA.
- Disable CTA until retry succeeds or user retries.

Copy:
- `Your station choice was not saved. Try again before continuing.`

## Interaction Rules
### Station Selection
On station card tap:
- Set selected station for the active group.
- Persist draft patch immediately.
- Update route spine instantly.
- Re-run route validation.
- Move focus only if platform pattern makes it natural.

Auto-advance:
- After selecting origin, visually guide to destination group.
- Do not automatically scroll so far that the user loses context.
- If destination group is below fold, a soft scroll is allowed.

Deselection:
- Tapping selected card again may keep it selected.
- Use `Clear` for explicit clearing.
- Do not make accidental deselection easy.

### Search
Search behavior:
- Filter by station name.
- Filter by city.
- Filter by station code.
- Case-insensitive.
- Trim leading and trailing spaces.

Search empty:
- Show empty search copy inside the group.
- Keep selected station visible if it does not match search, either pinned above results or visible in corridor spine.

Search clear:
- Provide clear button when text exists.
- Clear button must have accessible label `Clear station search`.

### Continue
On press:
1. Revalidate station IDs.
2. Persist draft patch.
3. Set `stationSelectionCompletedAt`.
4. Navigate to `/(sender)/create/receiver`.

Failure:
- If local write fails, stay on screen.
- If route validation fails, show inline error and stay on screen.
- If session expires, route to sender sign-in with return destination.

### Back
On press:
- Save current selections if storage is available.
- Navigate to `/(sender)/create`.

If save fails:
- Still allow back.
- Keep draft repair responsibility on re-entry.

### Clear
On press:
- Clear selected station IDs.
- Clear local search text.
- Remove station completion timestamp.
- Keep user on screen.

Confirmation:
- Not required if only station fields exist.
- Required if later draft steps contain receiver, package, options, or quote data that could become stale.

Confirmation copy:
- Title: `Clear selected stations?`
- Body: `This will remove the route for this draft. Details you entered later may need review.`
- Confirm: `Clear stations`
- Cancel: `Keep route`

## Accessibility Requirements
### Semantics
Screen:
- Main container has test ID `screen-create-delivery-stations`.
- Screen title is the primary heading.
- Origin and destination groups use accessible headings.
- Validation panel uses status or alert semantics depending on severity.

Station cards:
- Role: radio option or button with selected state.
- Label format: `{Station name}, {City}, station code {Code}`.
- Selected value: `Selected as origin` or `Selected as destination`.
- Disabled value: include reason if disabled.

Search fields:
- Each has visible label.
- Each supports screen-reader label.
- Clear button is labelled.

CTA:
- Disabled reason must be available through nearby text, not only button disabled state.

### Focus Order
Focus order:
1. Back button.
2. Step label/title.
3. Corridor spine summary.
4. Origin heading.
5. Origin search.
6. Origin station cards.
7. Destination heading.
8. Destination search.
9. Destination station cards.
10. Route validation message.
11. Continue CTA.

Rules:
- Error messages must be announced when validation state changes after user action.
- Do not trap focus.
- Do not move focus unexpectedly on every selection.

### Target Size
Minimum target sizes:
- Back button: `44px` by `44px`.
- Station card: full card target, minimum height `56px`.
- Clear search button: `44px` by `44px`.
- Continue button: minimum height `52px`.

### Contrast
Required:
- Text contrast at least WCAG AA.
- State chips at least WCAG AA for text.
- Focus ring visible on all actionable elements.
- Selected card border visible in high contrast.

### Large Text
At large text sizes:
- Station cards can grow vertically.
- Corridor spine can stack.
- CTA remains visible.
- No text truncates station names unless there is an accessible full label.

### Reduced Motion
If `prefers-reduced-motion` is enabled:
- Remove springy route-line animations.
- Use instant or short fade updates.
- Keep validation state changes clear.

## Performance And Offline Rules
### Performance
Targets:
- Initial render under `1s` on mid-range Android when local data is present.
- Station card tap feedback under `100ms`.
- Draft write should not block visual selection feedback.
- Search filter should update under `100ms` for launch catalog and future moderate growth.

Rules:
- Do not load map SDKs.
- Do not request GPS permission.
- Do not call admin APIs.
- Do not add heavy animation libraries for this screen.
- Keep list virtualization ready if station count grows beyond practical mobile list size.

### Offline
Offline behavior:
- Allow selection from bundled catalog.
- Save to local draft if storage works.
- Show offline cached note.
- Warn that final checks happen before payment.

Offline must not:
- Claim live station availability.
- Claim operational readiness.
- Start payment.
- Create delivery.

### Low Bandwidth
Low-bandwidth posture:
- Text and cards render without remote assets.
- Icons should come from local vector set.
- No remote images.
- No map tiles.

## Security And Privacy
### Data Minimization
This screen collects only station IDs. It must not collect:
- Receiver phone.
- Receiver address.
- Package contents.
- Payment phone.
- Location permission.
- User GPS coordinates.

### Local Storage
Local draft storage must:
- Store station IDs only.
- Avoid storing internal admin status.
- Avoid storing price amount from this screen.
- Respect logout cleanup policy.

### Access Control
Required:
- Sender session.
- Sender role.

Unauthorized:
- Route to sender sign-in.
- Preserve intended return path when safe.

Forbidden role:
- Route to role-appropriate home or show access denied according to app shell policy.

## Analytics And Observability
Analytics must respect privacy and avoid sensitive user data.

Recommended events:
- `sender_create_stations_viewed`
- `sender_create_origin_selected`
- `sender_create_destination_selected`
- `sender_create_station_search_used`
- `sender_create_station_route_valid`
- `sender_create_station_route_invalid`
- `sender_create_stations_continue_pressed`
- `sender_create_stations_draft_write_failed`

Event properties:
- `originStationId`
- `destinationStationId`
- `routeStatus`
- `source`
- `isOffline`
- `draftAgeBucket`

Do not send:
- Receiver data.
- Package data.
- Payment data.
- Search text if it could reveal personal notes.
- GPS coordinates.

## Test IDs
Required test IDs:
- `screen-create-delivery-stations`
- `create-stations-back`
- `create-stations-step-label`
- `create-stations-title`
- `create-stations-route-spine`
- `create-stations-origin-node`
- `create-stations-destination-node`
- `create-stations-route-status`
- `station-search-origin`
- `station-search-destination`
- `station-card-origin-ST-ACC-01`
- `station-card-origin-ST-KMS-01`
- `station-card-origin-ST-TML-01`
- `station-card-destination-ST-ACC-01`
- `station-card-destination-ST-KMS-01`
- `station-card-destination-ST-TML-01`
- `station-route-validation`
- `station-clear`
- `station-continue`
- `station-continue-bar`
- `station-catalog-error`
- `station-stale-draft`
- `station-offline-note`

## QA Scenarios
### Happy Path
1. Open `/(sender)/create/stations` with authenticated sender.
2. Confirm title is visible.
3. Select `Accra Central` as origin.
4. Select `Kumasi Adum` as destination.
5. Confirm route spine shows `Accra Central` to `Kumasi Adum`.
6. Confirm validation says route can continue.
7. Confirm no price is visible.
8. Press `Continue to receiver`.
9. Confirm draft stores `ST-ACC-01` and `ST-KMS-01`.
10. Confirm route changes to `/(sender)/create/receiver`.

### Reverse Corridor
1. Select `Kumasi Adum` as origin.
2. Select `Accra Central` as destination.
3. Confirm route is valid.
4. Continue.

### Same Station Error
1. Select `Tamale Central` as origin.
2. Select `Tamale Central` as destination.
3. Confirm CTA is disabled.
4. Confirm validation says origin and destination must differ.
5. Change destination to `Accra Central`.
6. Confirm CTA enables.

### Missing Origin
1. Select destination only.
2. Confirm CTA disabled.
3. Confirm validation asks for origin.

### Missing Destination
1. Select origin only.
2. Confirm CTA disabled.
3. Confirm validation asks for destination.

### Route Unavailable
1. Configure route-key map without a selected pair.
2. Select that origin and destination.
3. Confirm unavailable route message.
4. Confirm CTA disabled.
5. Select an enabled route.
6. Confirm CTA enabled.

### Search Origin
1. Type `kum` in origin search.
2. Confirm `Kumasi Adum` remains visible.
3. Confirm unrelated stations are hidden or visually filtered.
4. Clear search.
5. Confirm all launch stations return.

### Search Destination By Code
1. Type `tml` in destination search.
2. Confirm `Tamale Central` appears.
3. Select it.

### Offline Cached Catalog
1. Start screen with offline flag and bundled catalog available.
2. Confirm station list renders.
3. Confirm offline note appears.
4. Confirm valid route can continue locally.

### Catalog Unavailable
1. Force station catalog load failure.
2. Confirm error panel appears.
3. Confirm CTA disabled or hidden.
4. Confirm `Try again` is available.

### Stale Draft
1. Start with saved `originStationId` not in catalog.
2. Confirm stale draft panel appears.
3. Confirm screen does not continue.
4. Choose `Start again`.
5. Confirm station selection resets.

### Draft Write Failure
1. Force local storage write failure.
2. Select origin and destination.
3. Press continue.
4. Confirm write failure copy appears.
5. Confirm route does not advance.

### No Backend Mutation
1. Open the screen.
2. Select valid station pair.
3. Continue.
4. Confirm no `POST /v1/deliveries` call occurred.
5. Confirm no payment endpoint call occurred.

### No Admin Endpoint
1. Open the screen.
2. Confirm no `/v1/admin/stations` request is made.
3. Confirm no station validation details are shown.

## Implementation Notes For Claude Code
### File Placement
Claude Code should implement this screen under the sender create-delivery stack when the actual mobile app UI is built. Suggested conceptual placement:
- `apps/mobile/src/screens/sender/create/CreateDeliveryStationsScreen.tsx`
- `apps/mobile/src/screens/sender/create/components/RouteSpine.tsx`
- `apps/mobile/src/screens/sender/create/components/StationSelectorGroup.tsx`
- `apps/mobile/src/screens/sender/create/components/StationCard.tsx`

If the repo structure differs when UI implementation begins, preserve the route and test IDs from this spec.

### Data Source Adapter
Create a small adapter that converts `stationCatalog` into renderable station items:

```ts
type StationOption = {
  stationId: StationId;
  name: string;
  city: string;
  code: string;
};
```

Sort order:
- Use launch network order unless product defines another order.
- Current v1 order: Accra, Kumasi, Tamale.

Do not sort by distance because this screen does not request location.

### Route Status Function
Use a pure function:

```ts
type RouteStatus =
  | "incomplete"
  | "same_station"
  | "unavailable"
  | "valid";

function getStationRouteStatus(
  originStationId: StationId | undefined,
  destinationStationId: StationId | undefined,
  routeBaseFees: Record<string, number>
): RouteStatus {
  if (!originStationId || !destinationStationId) return "incomplete";
  if (originStationId === destinationStationId) return "same_station";
  return routeBaseFees[`${originStationId}:${destinationStationId}`]
    ? "valid"
    : "unavailable";
}
```

Rules:
- Use route key presence only.
- Do not expose the number.
- Keep the function covered by unit tests.

### Draft Patch Function
Use a single station patch function:

```ts
type PatchStationDraftInput = {
  originStationId?: StationId;
  destinationStationId?: StationId;
  stationSelectionCompletedAt?: string;
};
```

Rules:
- Patch origin and destination independently as the user selects.
- Add completion timestamp only on continue.
- Handle local write failure.

### Navigation
Forward route:
- `/(sender)/create/receiver`

Back route:
- `/(sender)/create`

Auth failure route:
- Sender sign-in with return destination.

## Visual QA Checklist
Before closing implementation, inspect:
- Header does not feel like a marketing page.
- Route spine is understandable without reading all body copy.
- Station card selection is visible at a glance.
- CTA disabled reason is visible.
- Same-station error is attached to the route decision.
- No price appears anywhere.
- No admin station terms appear anywhere.
- Offline note does not sound like live availability.
- Search fields do not dominate the three-station launch list.
- Sticky CTA does not hide content.
- Large text keeps cards readable.
- Reduced motion remains clear.

## Engineering QA Checklist
Before closing implementation, verify:
- Route exists at `/(sender)/create/stations`.
- Primary test ID is present.
- All listed test IDs are present.
- Station catalog loads from shared domain data or generated equivalent.
- Route validation uses route key presence.
- Same-station validation works.
- Unavailable route validation works.
- CTA writes local draft fields.
- CTA routes only after successful local write.
- No backend delivery is created.
- No payment is initialized.
- No admin endpoint is called.
- Offline state renders with bundled station data.
- Stale draft is blocked and recoverable.
- Search filters by name, city, and code.
- Accessibility labels are present.
- Unit tests cover route status.
- Screen tests cover happy path, same-station, route unavailable, and draft write failure.

## Acceptance Criteria
The screen is complete when:
- Authenticated sender can select origin and destination station.
- Selected station pair is visible in the corridor spine.
- Origin and destination cannot be the same.
- Route pair must exist in route-key map to continue.
- CTA remains disabled with clear reason until route is valid.
- Continuing stores `originStationId` and `destinationStationId` in local draft.
- Continuing routes to `/(sender)/create/receiver`.
- No price is displayed.
- No backend delivery is created.
- No payment operation is called.
- No admin station endpoint is called.
- Loading, offline, catalog unavailable, stale draft, same-station, and unavailable-route states exist.
- The screen passes accessibility checks for focus order, labels, target size, contrast, dynamic type, and reduced motion.
- Tests verify all critical behaviors.

