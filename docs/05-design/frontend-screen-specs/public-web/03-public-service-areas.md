# Public Service Areas Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicServiceAreas` |
| App | `apps/web` |
| Canonical route | `/service-areas` |
| Legacy alias | `/coverage` may redirect to `/service-areas` if the current app still exposes it |
| Primary test ID | `screen-public-service-areas` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `station data when exposed`; static approved launch content is allowed for v1 |
| Related routes | `/`, `/how-it-works`, `/pricing`, `/track`, `/trust-and-custody`, `/support` |
| Required states | `loading`, `empty`, `unavailable`, `normal` |

## Product Job
This page must tell visitors exactly where Kra works, how the station network is structured, and when doorstep delivery is available. It must make coverage feel trustworthy because it is explicit, not because it is broad.

The page must show:
- The approved launch stations.
- The approved launch corridors.
- The station-to-station operating model.
- The 10km doorstep rule around destination stations.
- What to do if a route or address is not covered.
- Why Kra limits coverage before expanding.

The page must not imply that Kra operates everywhere in Ghana or Africa at launch.

## Audience
Primary audience:
- Senders and small merchants checking whether their route is covered before creating a delivery.

Secondary audience:
- Receivers checking whether doorstep delivery is realistic.
- Business senders comparing station pickup versus doorstep completion.
- Support, operations, and partners who need public wording aligned to station policy.

## User State
Visitors arrive with a practical question: "Can Kra deliver between these places?" They may not know station names, may think city coverage means doorstep coverage, and may assume a map pin means exact door-to-door availability. The page must reduce those misunderstandings quickly.

## Primary Action
Primary CTA: `Check your route`

Secondary CTA: `Track a package`

Tertiary CTA: `See how Kra works`

CTA behavior:
- `Check your route` scrolls to the route availability section on this page until a production create-delivery or quote route exists.
- If a production sender flow exists, `Check your route` may route to the station selection step.
- `Track a package` routes to `/track`.
- `See how Kra works` routes to `/how-it-works`.

## Main Tension
The user wants broad coverage. Kra must be honest that v1 coverage is controlled:
- Station pairs are intentionally limited.
- Doorstep delivery is limited to 10km around destination stations.
- More coverage comes after operating quality is proven.
- A route being listed does not mean every final-mile address is serviceable.

## Visual Thesis
Design this page as a premium network map and station directory for a serious logistics system: precise, calm, spatial, and operationally transparent. The page should feel like a confident infrastructure product, not a courier poster or generic map search.

## Restraint Rule
Do not use a full interactive map unless the implementation has approved station coordinates, accessible list fallbacks, and performance control. Do not use speculative coverage circles, fake live vehicles, unapproved city pins, generic Africa maps, or "nationwide soon" decoration.

Every visual element must answer one of these:
- Which stations are active?
- Which corridors are active?
- Is doorstep delivery available?
- What should the user do if unsupported?
- Why is controlled coverage safer?

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of modern logistics, travel, mobility, and marketplace location pages.

Non-negotiable quality requirements:
- The first viewport must answer "where does Kra work now?" without forcing a scroll.
- The page must make the difference between city coverage, station coverage, corridor coverage, and doorstep coverage impossible to miss.
- The station directory must feel operationally real, not like a marketing list.
- The route matrix must make supported and unsupported combinations obvious.
- The page must never overpromise geography.
- The page must include clear states for loading, empty, and unavailable public station data.
- The page must work without a map.
- The page must be fully usable on mobile and low-bandwidth connections.
- The page must be accessible by keyboard and screen reader.
- The copy must be specific, direct, and trust-building through restraint.

Closure rule:
- If a visitor can walk away thinking Kra covers any route in Ghana, the screen remains open.
- If a visitor cannot distinguish station pickup from doorstep availability, the screen remains open.
- If the map/list interaction cannot be used without a mouse or perfect vision, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- Google Maps Platform store locator guidance: location discovery should combine map context with searchable, scannable location results.
- DHL Finder: delivery networks often need clear service-point search, pickup/dropoff context, and location-specific availability.
- FedEx location finder: location pages should prioritize practical details such as location, services, hours, and filters.
- UPS drop-off/access-point patterns: pickup/dropoff networks should explain service-point roles and practical next steps.
- W3C WCAG 2.2 quick reference: map/list controls, forms, focus, contrast, reduced motion, and responsive behavior must remain accessible.

Reference links:
- https://developers.google.com/maps/solutions/store-locator
- https://www.dhl.com/global-en/microsites/ec/dhl-finder.html
- https://local.fedex.com/en-us
- https://www.ups.com/dropoff/
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external layouts, map styling, wording, icons, colors, brand assets, animations, or location UI patterns.

## Required Page Outcomes
A successful visitor must be able to answer:
- Which Kra stations are active at launch?
- Which city-to-city corridors are covered?
- Does city coverage mean doorstep coverage?
- What does the 10km doorstep limit mean?
- What happens if my route is not covered?
- How do stations make the network safer?
- Where do I go next to track, price, understand the process, or contact support?

## Route And Navigation Rules
### Canonical Route
- Render at `/service-areas`.
- The page must be public and unauthenticated.
- The route must not require location permission.
- The route must not call authenticated APIs.

### Legacy Alias
The current public page registry may still expose `/coverage`. When implementing:
- Prefer `/service-areas` as canonical.
- `/coverage` may redirect to `/service-areas`.
- Do not maintain two divergent pages.
- Internal links should use `/service-areas`.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- `Service areas` must be active for `/service-areas`.
- If `/coverage` redirects, active state still belongs to `Service areas`.

Desktop header links:
- `How it works` -> `/how-it-works`
- `Service areas` -> `/service-areas`
- `Pricing` -> `/pricing`
- `Trust and custody` -> `/trust-and-custody`
- `Support` -> `/support`

Desktop actions:
- Primary: `Track package` -> `/track`
- Secondary: `Start delivery` -> sender entry route when available

Mobile header:
- Kra wordmark, `Track` action, and menu button.
- Full-height menu sheet with the same links as desktop.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Public routes.
- Support route.
- Policy links.
- Route to `/service-areas`, not `/coverage`.

## Page IA
Render sections in this exact order:

1. `PublicServiceAreasHeader`
2. `PublicServiceAreasHero`
3. `PublicServiceAreasCoverageSnapshot`
4. `PublicServiceAreasRouteChecker`
5. `PublicServiceAreasStationDirectory`
6. `PublicServiceAreasCorridorMatrix`
7. `PublicServiceAreasDoorstepZones`
8. `PublicServiceAreasUnsupportedGuidance`
9. `PublicServiceAreasExpansionPrinciples`
10. `PublicServiceAreasFaq`
11. `PublicServiceAreasFinalCta`
12. `PublicServiceAreasFooter`

Do not add a general marketing section between the route checker and station directory. Users are on this page to resolve coverage.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid for major sections.
- Hero min height: `600px`.
- Section spacing: `88px`.
- Use a split hero with coverage summary and compact network visual.
- Keep the route checker close enough to the hero that the user can act immediately.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Station directory can use two columns.
- Corridor matrix must remain readable without horizontal overflow.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Hero stacks with copy first.
- Network visual becomes a simple station list and corridor chips.
- Route checker controls stack vertically.
- Station directory becomes cards.
- Corridor matrix becomes route cards, not a squeezed table.

## Visual System Direction
Follow the public web design language from `PublicLanding` and `PublicHowItWorks`, with a more spatial and infrastructure-led tone.

Recommended art direction:
- Background: warm off-white with subtle latitude/route-line texture.
- Primary accent: operational green for active service.
- Secondary accent: amber for limited or doorstep-zone conditions.
- Neutral: deep ink for station names, route labels, and high-contrast text.
- Visual language: station boards, corridor lines, service-zone rings, route tickets, and coverage badges.

Do not use:
- Oversized map pin spam.
- Generic Africa silhouettes.
- Fake heatmaps.
- Fake "coming soon" city pins.
- Animated drivers or vehicles.
- Map tiles that require heavy third-party dependencies for static v1 content.

## Copy System
### Voice
- Clear.
- Practical.
- Honest.
- Geographic.
- Trust-building through limits.

### Forbidden Copy
Do not use:
- `nationwide`
- `everywhere`
- `all of Ghana`
- `all of Africa`
- `coming soon everywhere`
- `instant coverage`
- `live map`
- `near you` unless the user has explicitly searched a location and the result is true
- `guaranteed doorstep`

### Required Terms
Use these terms consistently:
- `launch station`
- `launch corridor`
- `origin station`
- `destination station`
- `station pickup`
- `doorstep delivery`
- `10km doorstep zone`
- `service area`
- `not covered yet`

### Plain-Language Rule
Use customer language while preserving policy.

Internal: `Doorstep delivery is limited to receiver addresses within 10km of approved destination stations.`

Public: `Doorstep delivery is available only when the receiver address is within 10km of the destination station.`

## Approved V1 Service Data
### Launch Stations
| Station ID | Public station name | City | Public status |
| --- | --- | --- | --- |
| `ST-ACC-01` | `Accra Central` | `Accra` | `Active launch station` |
| `ST-KMS-01` | `Kumasi Adum` | `Kumasi` | `Active launch station` |
| `ST-TML-01` | `Tamale Central` | `Tamale` | `Active launch station` |

### Launch Corridors
| Origin | Destination | Public status |
| --- | --- | --- |
| `Accra Central` | `Kumasi Adum` | `Active launch corridor` |
| `Kumasi Adum` | `Accra Central` | `Active launch corridor` |
| `Accra Central` | `Tamale Central` | `Active launch corridor` |
| `Tamale Central` | `Accra Central` | `Active launch corridor` |
| `Kumasi Adum` | `Tamale Central` | `Active launch corridor` |
| `Tamale Central` | `Kumasi Adum` | `Active launch corridor` |

### Doorstep Serviceability
- Doorstep delivery is available only after confirmed destination-station receipt.
- Doorstep delivery is limited to receiver addresses within `10km` of the destination station.
- Doorstep requires receiver name, receiver phone, usable address or landmark, and prepaid doorstep surcharge.
- Doorstep is not available for manual-quote packages or deliveries in return-to-sender/dispute-only handling.

### Public Data Redaction
The public page must not expose:
- Internal station capacity notes unless explicitly approved as public.
- Staff assignments.
- Driver slot counts.
- Internal queue pressure.
- Audit notes.
- Raw station validation records.

## Section Specs
### 1. `PublicServiceAreasHeader`
Purpose:
- Keep public navigation consistent.
- Make service areas the active page.

Required:
- Shared public header.
- Active nav item: `Service areas`.
- Primary header CTA: `Track package`.
- Header route links use `/service-areas`.

Acceptance:
- `Service areas` active state is visible.
- `/coverage` is not used as the primary visible route.

### 2. `PublicServiceAreasHero`
Purpose:
- Answer coverage scope immediately.
- Make controlled launch coverage feel intentional and trustworthy.

Hero content:
- Eyebrow: `Service areas`
- H1: `Kra launches route by route, station by station.`
- Subheadline: `Start with active corridors between Accra Central, Kumasi Adum, and Tamale Central, with doorstep delivery only inside approved 10km destination-station zones.`
- Primary CTA: `Check your route`
- Secondary CTA: `Track a package`
- Trust line: `Controlled stations. Clear corridors. No vague coverage promises.`

Hero visual:
- Use a compact `LaunchNetworkCard`.
- Show:
  - Three launch station nodes.
  - Three two-way corridor lines.
  - A small doorstep-zone indicator around each destination station.
- The visual must label nodes with station names.
- Do not show unapproved cities.
- Do not show a full Ghana map unless it is clearly conceptual and does not imply broad coverage.

Desktop composition:
- Copy left, network card right.

Mobile composition:
- Copy first.
- Network card becomes a vertical station/corridor summary.

Quality bar:
- First viewport must make it impossible to confuse launch corridors with national coverage.

### 3. `PublicServiceAreasCoverageSnapshot`
Purpose:
- Provide immediate facts before the user reaches details.

Layout:
- Four fact cards or a compact dashboard strip.

Required facts:

Fact 1:
- Label: `Launch stations`
- Value: `3`
- Detail: `Accra Central, Kumasi Adum, Tamale Central`

Fact 2:
- Label: `Launch corridors`
- Value: `3 two-way corridors`
- Detail: `Accra-Kumasi, Accra-Tamale, Kumasi-Tamale`

Fact 3:
- Label: `Doorstep zone`
- Value: `Within 10km`
- Detail: `Measured from the destination station when doorstep is available`

Fact 4:
- Label: `Station model`
- Value: `First-party controlled`
- Detail: `Partner-operated stations are deferred until after pilot stabilization`

Design:
- Cards should feel like an operating status panel, not decorative stats.
- Use exact language.
- Avoid fake volume or performance metrics.

Acceptance:
- Snapshot shows all four facts.
- Snapshot does not use unapproved metrics.

### 4. `PublicServiceAreasRouteChecker`
Purpose:
- Let the user quickly test whether a station pair is covered.
- Avoid pretending to validate an exact doorstep address if no public serviceability API exists.

Section heading:
- Eyebrow: `Route check`
- H2: `Choose an origin and destination station.`
- Intro: `Kra coverage is corridor-based. Select the station pair first, then confirm whether doorstep delivery is available at the destination.`

Fields:
- `Origin station`
- `Destination station`
- Optional future field: `Doorstep distance or address` only when a real serviceability endpoint exists.

Initial static station options:
- `Accra Central`
- `Kumasi Adum`
- `Tamale Central`

Supported route outcome:
- Title: `This corridor is active.`
- Body: `Kra can accept station-to-station deliveries between {originStation} and {destinationStation}. Doorstep delivery still depends on the receiver being within 10km of the destination station.`
- Primary action: `See pricing`
- Secondary action: `How delivery works`

Same-station outcome:
- Title: `Choose two different stations.`
- Body: `Kra v1 is built for intercity station corridors, not same-station delivery.`
- Action: `Review launch corridors`

Unsupported route outcome:
- Title: `This route is not covered yet.`
- Body: `Kra is launching with controlled station pairs. Use the listed corridors below or contact support if you need business coverage planning.`
- Primary action: `View covered corridors`
- Secondary action: `Contact support`

Doorstep caveat:
- Always show: `Doorstep delivery is checked after destination-station arrival and must be within 10km of the destination station.`

Interaction:
- Route checker can be purely client-side using approved static corridor data for v1.
- If public station data is exposed later, use the public endpoint as source of truth.
- Do not calculate pricing.
- Do not validate exact addresses without approved geocoding/serviceability logic.

Accessibility:
- Use native selects or accessible comboboxes.
- Labels must remain visible.
- Outcome must be announced with `aria-live="polite"` if it changes without navigation.
- Error copy must not rely on red alone.

Testing:
- Supported route displays active outcome.
- Same station displays same-station outcome.
- Unsupported route path is testable if future station data includes unsupported options.

### 5. `PublicServiceAreasStationDirectory`
Purpose:
- Make each station feel real, named, and operationally scoped.

Section heading:
- Eyebrow: `Launch stations`
- H2: `Three controlled stations start the network.`
- Intro: `Every launch station has a city, route membership, service role, and doorstep-zone boundary.`

Station cards:

Card 1:
- Station name: `Accra Central`
- Station ID: `ST-ACC-01`
- City: `Accra`
- Status: `Active launch station`
- Routes:
  - `Accra Central <-> Kumasi Adum`
  - `Accra Central <-> Tamale Central`
- Services:
  - `Origin drop-off`
  - `Destination pickup`
  - `Doorstep zone within 10km`
- Public note: `Use this station for Accra-origin or Accra-destination corridor deliveries.`

Card 2:
- Station name: `Kumasi Adum`
- Station ID: `ST-KMS-01`
- City: `Kumasi`
- Status: `Active launch station`
- Routes:
  - `Kumasi Adum <-> Accra Central`
  - `Kumasi Adum <-> Tamale Central`
- Services:
  - `Origin drop-off`
  - `Destination pickup`
  - `Doorstep zone within 10km`
- Public note: `Use this station for Kumasi-origin or Kumasi-destination corridor deliveries.`

Card 3:
- Station name: `Tamale Central`
- Station ID: `ST-TML-01`
- City: `Tamale`
- Status: `Active launch station`
- Routes:
  - `Tamale Central <-> Accra Central`
  - `Tamale Central <-> Kumasi Adum`
- Services:
  - `Origin drop-off`
  - `Destination pickup`
  - `Doorstep zone within 10km`
- Public note: `Use this station for Tamale-origin or Tamale-destination corridor deliveries.`

Do not show:
- Staff names.
- Internal staffing levels.
- Driver slots.
- Exact capacity notes.
- Internal station validation details.

Future public station fields:
- `stationId`
- `stationName`
- `city`
- `region`
- `publicOpeningHours`
- `publicServices`
- `publicRouteMembership`
- `publicStatus`
- `publicDirectionsUrl` if approved

Design:
- Station cards should resemble premium location cards with strong hierarchy.
- Use consistent station ID treatment, but keep station name dominant.
- If a map/list layout exists, cards must remain usable without map interaction.

### 6. `PublicServiceAreasCorridorMatrix`
Purpose:
- Make active station pairs explicit.
- Prevent unsupported route assumptions.

Section heading:
- Eyebrow: `Launch corridors`
- H2: `These station pairs are active at launch.`
- Intro: `Kra operates approved station-to-station corridors before expanding to additional cities and partners.`

Required matrix:

| Corridor | Direction | Status | Doorstep note |
| --- | --- | --- | --- |
| `Accra Central <-> Kumasi Adum` | Two-way | Active | Destination doorstep may be available within 10km |
| `Accra Central <-> Tamale Central` | Two-way | Active | Destination doorstep may be available within 10km |
| `Kumasi Adum <-> Tamale Central` | Two-way | Active | Destination doorstep may be available within 10km |

Unsupported explanation:
- Title: `Not listed means not covered yet.`
- Body: `Kra does not accept unsupported corridors in v1 because every active route needs known station ownership, driver capacity, and exception handling.`

Design:
- Desktop can use a matrix/table.
- Mobile must use route cards.
- Active status should be visible without color dependency.

Acceptance:
- All three two-way corridors are shown.
- Unsupported route explanation is visible.
- No future cities appear as active or coming soon.

### 7. `PublicServiceAreasDoorstepZones`
Purpose:
- Explain final-mile availability without overpromising address-level validation.

Section heading:
- Eyebrow: `Doorstep delivery`
- H2: `Doorstep starts from the destination station.`
- Intro: `Kra can extend a station delivery to the receiver's doorstep only where final-mile handoff and proof can be controlled.`

Required rule cards:

Card 1:
- Title: `10km from destination station`
- Body: `The receiver address must be within 10km of Accra Central, Kumasi Adum, or Tamale Central when that station is the destination.`

Card 2:
- Title: `Receiver details required`
- Body: `Doorstep delivery requires receiver name, phone number, and usable address or landmark instructions.`

Card 3:
- Title: `Prepaid before courier assignment`
- Body: `The doorstep surcharge must be collected before a final-mile courier can be assigned.`

Card 4:
- Title: `Proof closes the delivery`
- Body: `The courier completes doorstep delivery with OTP by default, or approved signature or photo proof when fallback is allowed.`

Doorstep not available cases:
- Address is outside the 10km zone.
- Receiver phone number is missing.
- Address or landmark instructions are unusable.
- Package requires manual quote.
- Delivery has moved into return-to-sender or dispute-only handling.

Design:
- Show doorstep as a smaller final-mile ring around destination stations.
- Do not use exact geofence circles unless approved coordinates are available.
- Use a caveat component: `Exact doorstep availability is confirmed during delivery setup or station review.`

Acceptance:
- The 10km rule appears in heading-level or card-level content.
- The page does not imply city-wide doorstep delivery.
- The page explains receiver details and prepaid surcharge requirements.

### 8. `PublicServiceAreasUnsupportedGuidance`
Purpose:
- Give users a path when their route is not covered.
- Avoid dead ends.

Section heading:
- Eyebrow: `If your route is not covered`
- H2: `Use the listed corridors or contact Kra before sending.`
- Intro: `Kra does not accept unsupported routes because unsupported routes create weak handoffs, unclear accountability, and poor support outcomes.`

Required guidance blocks:

Block 1:
- Title: `Choose a covered station pair`
- Body: `If your sender and receiver can use the listed stations, start with an active corridor.`
- Link: `View launch corridors`

Block 2:
- Title: `Use station pickup`
- Body: `If doorstep is outside the 10km zone, the package can still be collected at the destination station when the corridor is active.`
- Link: `How pickup works`

Block 3:
- Title: `Ask about business coverage`
- Body: `If you move repeated packages on an uncovered route, contact Kra so the team can evaluate future corridor demand.`
- Link: `Contact support`

Unsupported copy:
- `Not covered yet` is the preferred phrase.
- Do not use `coming soon` unless the route has an approved launch plan.

Acceptance:
- Unsupported users get a next action.
- Copy does not shame the user or overpromise expansion.

### 9. `PublicServiceAreasExpansionPrinciples`
Purpose:
- Explain why Kra starts with limited coverage and how expansion should be judged.

Section heading:
- Eyebrow: `Why coverage is controlled`
- H2: `Kra expands when operations can stay accountable.`
- Intro: `A corridor is not just a line on a map. It needs station readiness, driver capacity, handoff discipline, pricing, support ownership, and exception handling.`

Principles:

Principle 1:
- Title: `Quality before area`
- Body: `Route quality and station discipline matter more than raw geographic coverage.`

Principle 2:
- Title: `Stations before partners`
- Body: `All launch stations are first-party controlled in v1. Partner-operated station logic is deferred until after pilot stabilization.`

Principle 3:
- Title: `Known ownership`
- Body: `Each active route needs known travel expectations, driver assignment capacity, and exception handling ownership.`

Principle 4:
- Title: `Doorstep only where provable`
- Body: `Final-mile delivery is added only where receiver proof and return-to-station recovery can be controlled.`

Design:
- This should feel like operating philosophy, not a corporate manifesto.
- Keep it compact.

### 10. `PublicServiceAreasFaq`
Purpose:
- Resolve coverage, station, doorstep, and route misunderstandings.

Behavior:
- Use accessible accordion.
- FAQ headings must be literal.
- Answers must be short enough for mobile.

Required FAQ items:

FAQ 1:
- Question: `Which stations are active at launch?`
- Answer: `Accra Central, Kumasi Adum, and Tamale Central are the approved launch stations.`

FAQ 2:
- Question: `Which corridors are active?`
- Answer: `Kra launches with Accra Central to Kumasi Adum, Accra Central to Tamale Central, and Kumasi Adum to Tamale Central as two-way corridors.`

FAQ 3:
- Question: `Does Kra cover every address in these cities?`
- Answer: `No. Station-to-station corridor coverage is different from doorstep coverage. Doorstep delivery is limited to receiver addresses within 10km of the destination station.`

FAQ 4:
- Question: `Can I use Kra if doorstep is not available?`
- Answer: `Yes, if the station-to-station corridor is active. The receiver can collect from the destination station.`

FAQ 5:
- Question: `Why is my route not covered yet?`
- Answer: `Kra activates routes only when station ownership, driver capacity, pricing, and exception handling are ready.`

FAQ 6:
- Question: `Will Kra add more cities?`
- Answer: `The network should expand after pilot routes prove strong operations. Do not treat unlisted cities as active until Kra publishes them.`

FAQ 7:
- Question: `Can I request business coverage for a repeated route?`
- Answer: `Yes. Contact support with the route, expected volume, and station needs so Kra can evaluate demand.`

FAQ 8:
- Question: `Does the map show live packages?`
- Answer: `No. This page explains service coverage. Package progress belongs in tracking and is shown as receiver-safe delivery events.`

Required links below FAQ:
- `Track a package` -> `/track`
- `See pricing` -> `/pricing`
- `Contact support` -> `/support`

Acceptance:
- FAQ includes all required questions.
- FAQ does not imply national coverage.
- FAQ reinforces station-to-station versus doorstep distinction.

### 11. `PublicServiceAreasFinalCta`
Purpose:
- Convert coverage understanding into the next best action.

Copy:
- Eyebrow: `Check before you send`
- H2: `Start with a route Kra can operate well.`
- Body: `Use the active station corridors, confirm doorstep availability when needed, and track every package through the verified delivery chain.`
- Primary CTA: `Check your route`
- Secondary CTA: `Track a package`
- Tertiary text link: `See how Kra works`

Behavior:
- `Check your route` anchors to `#route-checker`.
- `Track a package` routes to `/track`.
- `See how Kra works` routes to `/how-it-works`.

### 12. `PublicServiceAreasFooter`
Purpose:
- Provide stable public navigation and legal/support routes.

Required:
- Same shared footer as public landing.
- Route links must use `/service-areas`.
- Support and policy links must be visible.

## Component Inventory
Claude Code should create or reuse components with these responsibilities:

### `PublicServiceAreasPage`
- Owns page composition.
- Sets route metadata.
- Renders `data-testid="screen-public-service-areas"`.
- Supports `normal`, `loading`, `empty`, and `unavailable` states.
- Does not call authenticated APIs.

### `LaunchNetworkCard`
- Renders approved launch stations and corridors.
- Uses conceptual visuals only unless approved coordinates exist.
- Has text equivalent for the network.

### `CoverageSnapshot`
- Renders four approved coverage facts.
- Does not include fake metrics.

### `RouteAvailabilityChecker`
- Lets users select origin and destination station.
- Uses approved static data or public station endpoint when exposed.
- Announces result changes accessibly.
- Does not calculate pricing or exact address serviceability.

### `StationDirectory`
- Renders station cards.
- Shows public station name, city, routes, services, and public status.
- Redacts staff, capacity, and internal validation details.

### `StationCard`
- Renders one station.
- Must support compact mobile layout.
- Can include directions link only if approved.

### `CorridorMatrix`
- Renders active corridors.
- Converts to route cards on mobile.
- Makes unsupported route principle visible.

### `DoorstepZoneExplainer`
- Explains 10km doorstep zones and preconditions.
- Does not perform geocoding unless approved.

### `UnsupportedRouteGuidance`
- Gives next actions for uncovered routes.
- Uses `not covered yet` language.

### `ExpansionPrinciples`
- Explains controlled expansion.
- Avoids speculative city lists.

### `PublicFaqAccordion`
- Shared accessible FAQ accordion.

### `PublicFinalCta`
- Shared final CTA pattern.

## Data And Content Source
### Static V1 Source
The approved v1 launch data may be local static content:
- Stations from `docs/03-business/service-areas-and-stations.md`.
- Doorstep rules from `docs/03-business/doorstep-delivery-rules.md`.

### Future Public Endpoint Source
If a public service-area endpoint is exposed later, it should return only public-safe fields.

Suggested public shape:

```ts
interface PublicServiceAreaResponse {
  stations: PublicStation[];
  corridors: PublicCorridor[];
  updatedAt: string;
}

interface PublicStation {
  stationId: string;
  name: string;
  city: string;
  region: string;
  publicStatus: "active" | "temporarily_unavailable";
  services: Array<"origin_dropoff" | "destination_pickup" | "doorstep_zone">;
  routes: string[];
  openingHours?: string;
  directionsUrl?: string;
}

interface PublicCorridor {
  originStationId: string;
  destinationStationId: string;
  publicStatus: "active" | "temporarily_unavailable";
  doorstepAvailableAtDestination: boolean;
}
```

Do not expose:
- Staff assignments.
- Internal capacity notes.
- Driver schedule slots.
- Admin override details.
- Station validation checklist.
- Raw audit data.

## State Handling
### `normal`
Use when static data is available or public station data loads successfully.

Required normal content:
- Hero.
- Coverage snapshot.
- Route checker.
- Station directory.
- Corridor matrix.
- Doorstep zone explainer.
- Unsupported guidance.
- FAQ.
- Final CTA.

### `loading`
Use only when a public station endpoint is being requested.

Loading behavior:
- Header and hero copy render immediately.
- Route checker and directory show skeletons or calm loading placeholders.
- Loading copy: `Loading current service areas...`
- Do not show fake stations while loading.
- If static approved fallback exists, it may render with a freshness note.

### `empty`
Use if a public station endpoint returns no active service areas.

Empty copy:
- Title: `No public service areas are active right now.`
- Body: `Kra has not published an active station corridor. Please contact support before sending a package.`
- Primary action: `Contact support`
- Secondary action: `How Kra works`

Rules:
- Empty state must not show old launch stations unless they are explicitly approved fallback content.
- Empty state must be visually serious, not playful.

### `unavailable`
Use if public station data cannot load and no approved static fallback can be used.

Unavailable copy:
- Title: `Service areas could not be loaded.`
- Body: `Try again, or contact support before sending a package. Do not assume a route is covered until Kra confirms it.`
- Primary action: `Try again`
- Secondary action: `Contact support`

Rules:
- Do not silently hide coverage failure.
- Do not show partial data without a freshness label.

## Interaction Rules
### Route Checker
- Origin and destination selectors must be labeled.
- Selecting the same station produces same-station guidance.
- Selecting an active station pair produces active-corridor guidance.
- If future data includes temporarily unavailable stations, route outcome must show unavailable state.
- Outcome region should use polite live announcement.

### Station Directory Filtering
Optional:
- Filter by city.
- Filter by service:
  - `Origin drop-off`
  - `Destination pickup`
  - `Doorstep zone`

Rules:
- Filters must not hide all stations without an empty-filter state.
- Filter reset must be obvious.
- Do not add fuzzy search unless it improves clarity.

### Map/List Toggle
Optional:
- `List` view must be the default or equally available.
- `Map` view must not be the only way to discover stations.
- Map markers must correspond exactly to station cards.
- If coordinates are not approved, use conceptual map only and do not expose a map toggle.

### Motion
Allowed:
- Gentle route-line reveal.
- Station card entrance.
- Result panel transition.

Rules:
- Motion must not imply live movement.
- Respect `prefers-reduced-motion`.
- No looping pulses on station pins.
- No animated vehicle paths.

## Accessibility Requirements
Baseline:
- One `h1`.
- Semantic `main`, header, footer.
- Logical heading order.
- Visible focus on all links, buttons, selectors, filters, and accordions.
- Native form controls where possible.
- Color contrast meets WCAG AA.
- Text remains readable at 200% zoom.
- No horizontal scroll at `320px`.
- No location permission required.

Route checker:
- Each select has visible label.
- Result changes are announced.
- Supported/unsupported status does not rely on color alone.

Station directory:
- Station cards have clear headings.
- If cards include route chips, chips have readable text.
- If a map exists, the list remains the accessible source of truth.

Tables:
- Corridor matrix uses table headers on desktop.
- Mobile route cards preserve header meaning.

Accordions:
- Button triggers.
- `aria-expanded` state.
- Predictable focus order.

Diagrams:
- Conceptual map must have text equivalent.
- Decorative route-line visuals use empty alt text.

## Performance Requirements
- Do not add a heavy map library for static v1 coverage.
- Prefer SVG, CSS, or lightweight static visual.
- No autoplay media.
- No third-party embeds.
- If using public station data, cache or memoize according to existing app data patterns.
- Page content must remain understandable if the diagram fails.
- Avoid layout shift in hero and route checker.

Performance acceptance:
- Route checker remains responsive on low-end mobile devices.
- Static station content renders without blocking on map assets.
- No large map tile payload is required for first render.

## SEO And Metadata
Page title:
- `Service Areas And Stations | Kra`

Meta description:
- `See Kra launch stations, active corridors, station pickup, and 10km doorstep delivery zones across Accra Central, Kumasi Adum, and Tamale Central.`

Open Graph:
- Title: `Kra service areas`
- Description: `Active launch stations, corridors, and doorstep delivery boundaries.`
- Image: approved public brand/social image only.

Structured content:
- Use semantic headings and station names.
- Do not add local business schema for stations unless exact public addresses, opening hours, and policy approval exist.
- Do not add service-area schema that implies unapproved coverage.

## Analytics Contract
Use analytics only if the public analytics layer already exists.

Events:

### `public_service_areas_viewed`
Fire when page renders.

Payload:
- `route`: `/service-areas`
- `screen_id`: `PublicServiceAreas`

### `public_service_route_checked`
Fire when the route checker returns an outcome.

Payload:
- `origin_station`
- `destination_station`
- `result`: `active` | `same_station` | `not_covered` | `temporarily_unavailable`

Do not include:
- Receiver address.
- Phone number.
- Tracking code.
- Exact coordinates.

### `public_service_station_card_viewed`
Fire when station card is visible if scroll analytics already exist.

Payload:
- `station_id`
- `station_city`

### `public_service_cta_clicked`
Fire when major CTA is clicked.

Payload:
- `cta_label`
- `destination_route`
- `section`

Privacy:
- Never collect exact address or device location from this page.
- Never include raw query strings.
- Never infer home/work location from route checker selections.

## Testing Contract
### Unit And Component Tests
Required tests:
- Renders `screen-public-service-areas`.
- Renders hero H1 exactly.
- Renders primary CTA.
- Renders all three launch station names.
- Renders all three two-way corridor names.
- Renders 10km doorstep rule.
- Route checker marks Accra Central to Kumasi Adum active.
- Route checker marks same station as same-station guidance.
- Station cards do not render staff or internal capacity fields.
- FAQ renders all required questions.
- Loading state renders approved loading copy when data is pending.
- Empty state renders approved empty copy.
- Unavailable state renders approved unavailable copy.

### Accessibility Tests
Required:
- Automated accessibility check has no critical violations.
- Keyboard can reach:
  - header links
  - route checker fields
  - station directory links
  - FAQ triggers
  - final CTA
- Route checker result is announced.
- Reduced motion does not hide route visual content.

### E2E Tests
Add or extend public web E2E coverage:

Test name:
- `e2e-public-service-areas-route-checker`

Flow:
- Visit `/service-areas`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Select `Accra Central` as origin.
- Select `Kumasi Adum` as destination.
- Assert active corridor outcome.
- Select `Accra Central` as destination.
- Assert same-station guidance.
- Click `Track a package`.
- Assert route is `/track`.

Test name:
- `e2e-public-service-areas-mobile`

Flow:
- Set mobile viewport.
- Visit `/service-areas`.
- Assert no horizontal overflow.
- Assert station cards are visible.
- Assert corridor cards are readable.
- Open FAQ about city-wide coverage.
- Assert answer says station coverage differs from doorstep coverage.

### Visual Regression
Capture:
- Desktop hero and coverage snapshot.
- Desktop route checker active outcome.
- Mobile route checker.
- Mobile station directory.
- Empty and unavailable states if component story or route fixture exists.

Do not accept:
- Map visual implying unapproved cities.
- Route matrix clipped on mobile.
- Hidden route checker labels.
- Low-contrast status badges.
- Fake "coming soon" pins.

## Content Acceptance Checklist
- The page uses `/service-areas` as canonical route.
- The page names `Accra Central`.
- The page names `Kumasi Adum`.
- The page names `Tamale Central`.
- The page names `ST-ACC-01`.
- The page names `ST-KMS-01`.
- The page names `ST-TML-01`.
- The page states `Accra Central <-> Kumasi Adum`.
- The page states `Accra Central <-> Tamale Central`.
- The page states `Kumasi Adum <-> Tamale Central`.
- The page states doorstep delivery is within `10km` of destination station.
- The page states city coverage is not the same as doorstep coverage.
- The page states unsupported routes are not covered yet.
- The page does not promise nationwide service.
- The page does not expose staff, capacity, audit, or validation internals.
- The page links to `/track`.
- The page links to `/how-it-works`.
- The page links to `/pricing`.
- The page links to `/support`.

## Design Quality Review Checklist
Before closing implementation, review the UI against five perspectives:

Founder:
- Does the page make controlled coverage feel like operational strength, not weakness?

Skeptical sender:
- Can I tell whether my route is covered without reading policy docs?

Receiver:
- Do I understand whether doorstep delivery is available or whether pickup is the right path?

Operator:
- Does the page avoid promises operations cannot fulfill?

Accessibility reviewer:
- Can I use route checker, station directory, corridor matrix, and FAQ without a mouse or map?

Creative director:
- Does the page have a strong network/station visual idea without becoming map clutter?

If any answer is weak, revise before moving to the next screen spec.

## Claude Code Build Notes
Claude Code should:
- Build only this screen and shared components required by this screen.
- Keep `/service-areas` as canonical.
- Redirect or alias `/coverage` only if needed for current app compatibility.
- Use static approved launch data for v1 unless a public station endpoint exists.
- Keep route checker honest and station-pair based.
- Add loading, empty, and unavailable states if public data integration exists.
- Reuse shared header, footer, FAQ, and final CTA patterns where available.
- Add tests at the same quality level as other public web routes.

Claude Code should not:
- Implement unrelated screens.
- Add exact address validation without approved serviceability logic.
- Add pricing calculation.
- Request browser location permission.
- Add heavy map dependencies for static data.
- Show unapproved cities.
- Add fake upcoming city pins.
- Expose staff assignments or internal capacity.
- Use demo or sample route data outside approved v1 launch data.

## Open Decisions
No product decision blocks the static v1 version of this screen.

Implementation may choose:
- Whether to render the route visual as CSS, SVG, or optimized image.
- Whether route checker is purely static or backed by a future public station endpoint.
- Whether `/coverage` redirects permanently or temporarily to `/service-areas`.

Implementation must not choose:
- Different launch stations.
- Different launch corridors.
- Doorstep distance above `10km`.
- Address-level doorstep promises without approved serviceability logic.
- National coverage language.
- Public exposure of internal station operations.

## Spec Quality Review
### Top-Tier Product Standard Pass
Pass. The spec turns coverage honesty into a premium product experience: clear hero, exact station data, route checker, station directory, corridor matrix, doorstep-zone explanation, unsupported guidance, and strict anti-overpromise rules.

### Industry Inspiration Translation Pass
Pass. External references are translated into directly relevant principles:
- Location pages need searchable/list-based discovery, not map-only interaction.
- Station/service-point pages should expose practical service details.
- Coverage pages must pair spatial visuals with explicit text.
- Accessibility must be preserved for map, form, list, and accordion interactions.

No external wording, assets, or layouts are copied.

### Implementation Readiness Pass
Pass. The spec defines route behavior, page IA, exact copy, static data, future public data shape, component contracts, states, interactions, accessibility, analytics, SEO, tests, and close criteria.

### Policy Consistency Pass
Pass. The spec aligns to service-area, station, doorstep, lifecycle, privacy, and frontend inventory constraints. It also records the `/coverage` versus `/service-areas` route mismatch as an implementation compatibility issue without changing the canonical route.

### Remaining Constraints Accepted
Accepted:
- Static v1 content is allowed.
- Public endpoint states are still specified for later station-data exposure.
- Exact address-level doorstep serviceability is not implemented here.
- No UI implementation is included.

### Close Decision
Ready for Claude Code implementation after this document is merged and CI is green.
