# Public Pricing Explainer Screen Spec

## Screen Contract

| Field              | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Screen ID          | `PublicPricingExplainer`                                                           |
| App                | `apps/web`                                                                         |
| Route              | `/pricing`                                                                         |
| Primary test ID    | `screen-public-pricing`                                                            |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                      |
| Build priority     | `P0 Launch Critical`                                                               |
| Backend dependency | Public copy only; no local pricing math authority                                  |
| Related routes     | `/`, `/how-it-works`, `/service-areas`, `/track`, `/trust-and-custody`, `/support` |
| Required states    | `normal`                                                                           |

## Product Job

This page must explain how Kra pricing works before a sender starts a delivery. It should make pricing feel predictable without pretending the page is the final quote authority.

The page must explain:

- Route base fees.
- What is included in a standard package.
- Weight, size, express, doorstep, and special-handling surcharges.
- Manual-quote boundaries.
- Quote locking.
- Payment before transport.
- Cancellation, refund, and dispute expectations.
- Why the backend quote flow is the final pricing authority.

The page must not calculate final delivery prices locally or invite bargaining.

## Audience

Primary audience:

- Senders and small merchants comparing delivery cost before creating a booking.

Secondary audience:

- Receivers who need to understand doorstep surcharge and pickup alternatives.
- Business senders checking whether repeated routes are predictable.
- Support and operations staff who need public wording aligned to pricing and refund policy.

## User State

Visitors are evaluating cost and fairness. They may be worried about surprise fees, informal negotiation, cash collection, or paying twice for failed doorstep attempts. The page must answer those concerns with exact rules and clear boundaries.

## Primary Action

Primary CTA: `Check service areas`

Secondary CTA: `Start a delivery`

Tertiary CTA: `Track a package`

CTA behavior:

- `Check service areas` routes to `/service-areas`.
- `Start a delivery` routes to the approved sender entry route when available.
- If no production sender entry route exists, `Start a delivery` routes only to `/service-areas` or another production-approved route.
- `Track a package` routes to `/track`.

## Main Tension

The user wants a simple price but delivery cost depends on route, package size, weight, speed, doorstep need, and special handling. The page must reduce confusion by showing the exact parts of the price while making clear that the checkout quote is final.

## Visual Thesis

Design the page as a premium price board for a serious logistics network: clear route tariffs, calm surcharge chips, strong quote-lock explanation, and no hidden-fee ambiguity. It should feel more like a modern fintech pricing page than a courier rate PDF.

## Restraint Rule

Do not build an invented pricing calculator. Do not add sliders, estimated totals, invented discounts, countdown offers, animated savings meters, or comparison charts against unnamed competitors.

Every visual element must explain one of these:

- Which route is being priced.
- Which package tier changes the price.
- Which optional service adds cost.
- Which cases require manual quote.
- Which refund rule applies.
- Why payment and quote locking protect the sender.

## Elite Quality Gate

This spec is not closed unless the resulting UI can stand beside the top `0.1%` of modern fintech, logistics, marketplace, and pricing pages.

Non-negotiable quality requirements:

- The first viewport must explain that Kra uses transparent route-based pricing with a final quote shown before payment.
- Route fees must be readable without opening a calculator.
- Surcharges must be grouped by user decision: weight, size, speed, doorstep, and special handling.
- Manual quote boundaries must be obvious.
- Refund and cancellation expectations must be visible before the FAQ.
- The page must not imply local frontend calculations are authoritative.
- The page must not promise automatic compensation, guaranteed arrival, or hidden discounts.
- The page must work on mobile without wide table overflow.
- The page must be accessible with keyboard, screen reader, high contrast, and reduced motion needs.
- The copy must be concrete, exact, and low hype.

Closure rule:

- If a visitor cannot explain what can change the price after reading the page, the screen remains open.
- If a visitor can mistake this page for the final quote engine, the screen remains open.
- If refund expectations are hidden only in FAQ, the screen remains open.

## Inspiration And Context Inputs

Use these sources as product and UX context, not as copy or layout to clone:

- UPS shipping cost and rates guidance: shipping price depends on origin, destination, service, package weight, and other considerations; cost tools should make inputs explicit.
- DHL Ghana quote entry: shipping quote flows should start from shipment details and help users continue to booking only after quote context is clear.
- FedEx rates and delivery-times entry: shipping pricing UX commonly pairs rate estimates with service choice and shipment creation.
- Stripe pricing: transparent pricing pages should make standard fees, custom pricing paths, and hidden-fee expectations explicit.
- W3C WCAG 2.2 quick reference: tables, accordions, buttons, focus states, and responsive price content must remain accessible.

Reference links:

- https://wwwapps.ups.com/us/en/support/shipping-support/shipping-costs-rates
- https://www.dhl.com/gh-en/home/get-a-quote.html
- https://www.fedex.com/en-us/online/rating.html
- https://stripe.com/pricing
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external layouts, pricing tables, wording, brand assets, colors, or calculator behavior.

## Required Page Outcomes

A successful visitor must be able to answer:

- What are the launch route base fees?
- What does the base price include?
- Which package weights change the price?
- Which sizes change the price?
- How does express pricing work?
- How does doorstep pricing work?
- Which packages require manual quote?
- When is payment required?
- When does a quote lock?
- What refund expectations apply before intake, after intake, and after dispatch?
- Why is the backend quote the final authority?

## Route And Navigation Rules

### Route

- Render at `/pricing`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not perform authoritative final-price calculation.
- Must not render internal pricing rule IDs except where the spec explicitly references `PRC-*` as an internal backend concept.

### Header

Reuse the public web header behavior defined by `PublicLanding`.

Header active state:

- `Pricing` must be active for `/pricing`.

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
- `Pricing` route active only in the main page context, not footer.

## Page IA

Render sections in this exact order:

1. `PublicPricingHeader`
2. `PublicPricingHero`
3. `PublicPricingQuotePromise`
4. `PublicPricingRouteFees`
5. `PublicPricingIncludedPackage`
6. `PublicPricingSurcharges`
7. `PublicPricingManualQuoteBoundaries`
8. `PublicPricingQuoteLockAndPayment`
9. `PublicPricingRefundExpectations`
10. `PublicPricingFaq`
11. `PublicPricingFinalCta`
12. `PublicPricingFooter`

Do not put FAQ before route fees or refund expectations. Pricing pages must answer the core cost question before objection handling.

## Global Layout

### Desktop

- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `600px`.
- Section spacing: `88px`.
- Route fee table should use a wide desktop layout.
- Surcharge groups can use cards or segmented panels.

### Tablet

- Gutters: `28px`.
- Section spacing: `72px`.
- Route fee table can remain a table if readable.
- Surcharge cards may be two columns.

### Mobile

- Gutters: `20px`.
- Section spacing: `56px`.
- Route fees become route cards.
- Tables must not overflow horizontally.
- CTA buttons stack when needed.
- Refund rules become compact timeline cards.

## Visual System Direction

Follow public web design language from prior public specs, with a sharper pricing/finance tone.

Recommended art direction:

- Background: warm off-white or light ledger paper tone.
- Primary accent: operational green for included/locked/paid.
- Secondary accent: amber for optional surcharge and manual quote.
- Neutral: deep ink for money values and rule labels.
- Visual motifs: route tickets, price locks, fee stack, receipt summary, policy board.

Do not use:

- Invented checkout screenshots.
- Invented discount badges.
- Generic SaaS pricing columns.
- Three-tier subscription cards.
- Animated calculators.
- Competitor comparison tables.

## Copy System

### Voice

- Clear.
- Calm.
- Exact.
- Low-pressure.
- Financially accountable.

### Forbidden Copy

Do not use:

- `cheap`
- `free delivery`
- `best price`
- `lowest price`
- `guaranteed cheapest`
- `no fees ever`
- `instant refund`
- `automatic compensation`
- `pay on delivery`
- `cash on delivery`
- `estimate only` without explaining final quote authority

### Required Terms

Use these terms consistently:

- `route base fee`
- `final quote`
- `quote lock`
- `standard package`
- `weight surcharge`
- `size surcharge`
- `express surcharge`
- `doorstep surcharge`
- `special handling`
- `manual quote`
- `refund review`

### Plain-Language Rule

Use public-friendly wording while preserving policy.

Internal: `Delivery quotes store the final amount at booking time.`

Public: `Once you accept and pay the delivery quote, that amount is stored with the delivery and later route-price changes do not change it.`

## Approved V1 Pricing Data

### Launch Corridor Base Fees

All launch prices are one-way and customer-facing in `GHS`.

| Corridor                          | Standard base fee |
| --------------------------------- | ----------------- |
| `Accra Central -> Kumasi Adum`    | `GHS 35`          |
| `Kumasi Adum -> Accra Central`    | `GHS 35`          |
| `Accra Central -> Tamale Central` | `GHS 65`          |
| `Tamale Central -> Accra Central` | `GHS 65`          |
| `Kumasi Adum -> Tamale Central`   | `GHS 50`          |
| `Tamale Central -> Kumasi Adum`   | `GHS 50`          |

### Included Standard Package

- Weight: `0kg to 2kg`
- Size: `standard`
- Service: `standard`
- Final-mile delivery: `not included`

### Weight Surcharges

| Weight tier     | Surcharge                                 |
| --------------- | ----------------------------------------- |
| `>2kg to 5kg`   | `+GHS 8`                                  |
| `>5kg to 10kg`  | `+GHS 18`                                 |
| `>10kg to 20kg` | `+GHS 35`                                 |
| `>20kg`         | `manual quote only, not self-serve in v1` |

### Size Surcharges

| Size tier   | Rule                                | Surcharge                                 |
| ----------- | ----------------------------------- | ----------------------------------------- |
| `standard`  | longest side `<= 40cm`              | `included`                                |
| `bulky`     | longest side `> 40cm` and `<= 70cm` | `+GHS 15`                                 |
| `oversized` | longest side `> 70cm`               | `manual quote only, not self-serve in v1` |

### Service Surcharges

- `Express`: `+40%` of the route base fee with a minimum express surcharge of `GHS 15`
- `Doorstep within 5km of destination station`: `+GHS 15`
- `Doorstep above 5km and up to 10km`: `+GHS 25`
- `Doorstep above 10km`: `not available in v1`

### Special Handling

- `Fragile`: `+GHS 10`, requires intake photo and destination condition check.
- `Declared value above GHS 2,000`: `+GHS 20` and manual operator approval.
- `Declared value above GHS 5,000`: `not accepted through self-serve v1`.

### Taxes, Fees, And Price Display

- Sender sees a single final quoted amount in the app.
- Payment-processing cost is absorbed into the public quote in v1 and is not shown as a separate fee line.
- Applicable tax treatment is considered included in the displayed customer price for pilot.

## Section Specs

### 1. `PublicPricingHeader`

Purpose:

- Keep public navigation consistent.
- Make pricing easy to find from any public route.

Required:

- Shared public header.
- Active nav item: `Pricing`.
- Primary header CTA: `Track package`.

Acceptance:

- Header links match public web navigation.
- `Pricing` active state is visible.

### 2. `PublicPricingHero`

Purpose:

- Explain the pricing model in the first viewport.
- Set trust by rejecting hidden fee ambiguity.

Hero content:

- Eyebrow: `Pricing`
- H1: `Know the route price before you pay.`
- Subheadline: `Kra uses route base fees, clear package surcharges, and prepaid options so every delivery quote is visible before transport starts.`
- Primary CTA: `Check service areas`
- Secondary CTA: `Start a delivery`
- Trust line: `No bargaining in the app. No pay-on-delivery in v1. Final quote shown before payment.`

Hero visual:

- Use a `PricingReceiptPreview` visual, not a real checkout screenshot.
- Show a conceptual receipt with:
  - Route base fee.
  - Package tier.
  - Optional doorstep or express line.
  - Final quote lock.
- Do not show a computed total unless using one exact approved example with a clear label.

Quality bar:

- First viewport must make clear that final price is shown before payment and that transport starts only after payment is confirmed.

### 3. `PublicPricingQuotePromise`

Purpose:

- Explain how Kra avoids surprise pricing.

Section heading:

- Eyebrow: `Price discipline`
- H2: `The quote is built from visible parts.`
- Intro: `Kra keeps pricing simple enough for senders to understand and strict enough for station operations to enforce.`

Required cards:

Card 1:

- Title: `Route first`
- Body: `Every quote starts with the approved one-way base fee between the selected origin and destination stations.`

Card 2:

- Title: `Package details next`
- Body: `Weight, size, speed, doorstep need, and special handling can add approved surcharges.`

Card 3:

- Title: `Final quote before payment`
- Body: `The sender sees one final amount before confirming payment.`

Card 4:

- Title: `Locked at booking`
- Body: `Once accepted and paid, the quote is stored with the delivery so later route-price changes do not alter that delivery.`

Design:

- Use a four-step fee stack.
- Keep copy tight.

Acceptance:

- Section states final quote before payment.
- Section states quote lock.

### 4. `PublicPricingRouteFees`

Purpose:

- Show launch corridor base fees directly.

Section heading:

- Eyebrow: `Route base fees`
- H2: `Start with the station pair.`
- Intro: `All launch route prices are one-way and customer-facing in GHS.`

Required table:

- Use the exact base fee table from approved v1 pricing data.

Desktop:

- Use a readable table with columns:
  - `Origin`
  - `Destination`
  - `Standard base fee`

Mobile:

- Use route fee cards:
  - Origin.
  - Destination.
  - Standard base fee.

Required note:

- `The route base fee covers a standard package from origin station to destination station. Optional services and larger packages may add surcharges.`

Required link:

- `Check service areas` -> `/service-areas`

Acceptance:

- All six one-way route fees render.
- GHS values match pricing rules exactly.
- No local total calculator appears in this section.

### 5. `PublicPricingIncludedPackage`

Purpose:

- Explain what the base fee includes.

Section heading:

- Eyebrow: `Included`
- H2: `The base fee includes one standard package.`
- Intro: `A standard launch package stays within the basic weight, size, and service assumptions.`

Required content:

Included row 1:

- Label: `Weight`
- Value: `0kg to 2kg`

Included row 2:

- Label: `Size`
- Value: `Standard, longest side <= 40cm`

Included row 3:

- Label: `Service`
- Value: `Standard station-to-station delivery`

Included row 4:

- Label: `Final-mile delivery`
- Value: `Not included`

Required note:

- `Doorstep delivery can be added only where the destination address is within the approved doorstep zone.`

Design:

- Use a compact included-package card, not a generic feature list.
- Make `not included` visually clear without making it feel like a penalty.

### 6. `PublicPricingSurcharges`

Purpose:

- Explain every approved surcharge group without requiring math.

Section heading:

- Eyebrow: `Surcharges`
- H2: `Some choices add to the base fee.`
- Intro: `The app quote applies approved surcharges when the package or service needs more handling.`

Required groups:

#### Weight

| Weight tier     | Surcharge           |
| --------------- | ------------------- |
| `>2kg to 5kg`   | `+GHS 8`            |
| `>5kg to 10kg`  | `+GHS 18`           |
| `>10kg to 20kg` | `+GHS 35`           |
| `>20kg`         | `manual quote only` |

#### Size

| Size tier   | Rule                                | Surcharge           |
| ----------- | ----------------------------------- | ------------------- |
| `standard`  | longest side `<= 40cm`              | `included`          |
| `bulky`     | longest side `> 40cm` and `<= 70cm` | `+GHS 15`           |
| `oversized` | longest side `> 70cm`               | `manual quote only` |

#### Service

- `Express`: `+40%` of route base fee with a minimum express surcharge of `GHS 15`
- `Doorstep within 5km of destination station`: `+GHS 15`
- `Doorstep above 5km and up to 10km`: `+GHS 25`
- `Doorstep above 10km`: `not available in v1`

#### Special handling

- `Fragile`: `+GHS 10`, requires intake photo and destination condition check.
- `Declared value above GHS 2,000`: `+GHS 20` and manual operator approval.
- `Declared value above GHS 5,000`: not accepted through self-serve v1.

Rules:

- Do not compute example totals from these tables unless the example is static and explicitly labeled non-authoritative.
- Keep the backend quote as source of truth.

Acceptance:

- Every approved surcharge appears.
- Manual quote boundaries are visible.
- Doorstep above 10km is visibly not available.

### 7. `PublicPricingManualQuoteBoundaries`

Purpose:

- Make self-serve limits clear.

Section heading:

- Eyebrow: `Manual quote`
- H2: `Some packages need review before pricing.`
- Intro: `Manual quote keeps unusual packages out of the standard flow until operations can confirm handling, custody, and cost.`

Manual quote cases:

- Weight above `20kg`.
- Oversized package with longest side above `70cm`.
- Doorstep above `10km` is not available in v1, not manual quote.
- Declared value above `GHS 5,000` is not accepted through self-serve v1.
- Manual-quote packages are not eligible for doorstep delivery in v1.

Design:

- Use a boundary panel with `Self-serve`, `Manual quote`, and `Not available` categories.
- Avoid harsh error styling.

Acceptance:

- Page distinguishes manual quote from not available.
- Page does not suggest doorstep can be negotiated above 10km.

### 8. `PublicPricingQuoteLockAndPayment`

Purpose:

- Explain quote authority, payment timing, and no cash collection.

Section heading:

- Eyebrow: `Quote and payment`
- H2: `The app quote is the pricing authority.`
- Intro: `This page explains pricing. The delivery quote shown during booking is the final amount for that delivery once accepted and paid.`

Required rules:

- The backend reads the active route pricing table before creating every delivery quote.
- Delivery quotes store the final amount at booking time.
- Later route-price changes do not change existing delivery obligations.
- Payment must be confirmed before a package enters transport states.
- Pay-on-delivery is not supported in v1.
- No cash collection is allowed during final-mile completion in v1.
- The sender sees a single final quoted amount in the app.
- Payment-processing cost is absorbed into the public quote in v1.

Public wording:

- `This page is an explainer. Your booking quote is the final price to review before payment.`

Design:

- Use a quote-lock receipt or checkpoint panel.
- Make the authority distinction prominent.

Acceptance:

- Page says no pay-on-delivery.
- Page says no cash collection during final-mile completion.
- Page says booking quote is final authority.

### 9. `PublicPricingRefundExpectations`

Purpose:

- Publish practical refund expectations before users pay.

Section heading:

- Eyebrow: `Refund expectations`
- H2: `Refunds depend on timing and evidence.`
- Intro: `Kra uses delivery status, payment records, handoff evidence, and support review to decide refund outcomes.`

Required refund table:

| Situation                                                                                           | Public expectation                                  |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `Before origin intake`                                                                              | Full refund of the amount collected                 |
| `After origin intake but before dispatch`                                                           | Refund minus a `GHS 5` handling fee                 |
| `After dispatch`                                                                                    | No automatic refund; handled through dispute review |
| `Duplicate charge`                                                                                  | Full refund if verified                             |
| `Payment confirmed but no origin intake`                                                            | Full refund if package was never received           |
| `Doorstep surcharge charged but no doorstep attempt occurred`                                       | Refund the full doorstep surcharge component        |
| `Express surcharge charged but express handling was not performed due to platform or staff failure` | Refund the express surcharge component only         |

Required dispute expectations:

- Customers may open a dispute within `7 calendar days` of delivery completion, pickup-hold notification, or refund completion attempt.
- Internal acknowledgement target is `48 hours`.
- Standard disputes with complete evidence should be resolved within `5 business days`.
- Complex loss, damage, or provider-settlement disputes may extend to `10 business days` with admin approval and a case note.

Required legal/copy caution:

- `Refund and compensation outcomes depend on policy review. Kra does not promise automatic compensation.`

Required link:

- `Contact support` -> `/support`

Acceptance:

- Refund table appears before FAQ.
- Page does not promise instant refund.
- Page does not promise automatic compensation.

### 10. `PublicPricingFaq`

Purpose:

- Resolve pricing objections and support questions.

Behavior:

- Use accessible accordion.
- Multiple panels may be open if implementation supports it cleanly.

Required FAQ items:

FAQ 1:

- Question: `Is this page the final quote?`
- Answer: `No. This page explains the approved pricing rules. The booking quote shown in the app is the final amount to review before payment.`

FAQ 2:

- Question: `What does the route base fee include?`
- Answer: `It includes standard station-to-station delivery for a package from 0kg to 2kg, standard size, and standard service. Doorstep is not included.`

FAQ 3:

- Question: `Can I pay on delivery?`
- Answer: `No. Pay-on-delivery is not supported in v1. Payment must be confirmed before the package can enter transport.`

FAQ 4:

- Question: `Can station staff change the price?`
- Answer: `The app quote is the pricing authority. Staff-approved adjustments require approved operations and finance handling; ad hoc bargaining is not supported.`

FAQ 5:

- Question: `What if my package is over 20kg?`
- Answer: `Packages above 20kg require manual quote and are not self-serve in v1.`

FAQ 6:

- Question: `What if doorstep is more than 10km from the destination station?`
- Answer: `Doorstep above 10km is not available in v1. The receiver can use destination-station pickup if the corridor is active.`

FAQ 7:

- Question: `Do I pay another doorstep fee after a failed attempt?`
- Answer: `The first failed doorstep reattempt does not create a second doorstep surcharge when it happens within policy.`

FAQ 8:

- Question: `Are payment-processing costs added separately?`
- Answer: `No. Payment-processing cost is absorbed into the public quote in v1 and is not shown as a separate customer fee line.`

FAQ 9:

- Question: `When can I get a refund?`
- Answer: `Refunds depend on timing and evidence. Before origin intake, eligible cancellation can receive a full refund. After dispatch, refund outcomes require dispute review unless there is a verified duplicate charge or platform-side failure.`

Required links below FAQ:

- `Check service areas` -> `/service-areas`
- `Contact support` -> `/support`
- `Track a package` -> `/track`

### 11. `PublicPricingFinalCta`

Purpose:

- Move the user from price understanding to route/action.

Copy:

- Eyebrow: `Ready to check your route?`
- H2: `Start with the station pair, then review the final quote.`
- Body: `Kra shows the route fee, package surcharges, and optional services before payment so the delivery can move with a clear price.`
- Primary CTA: `Check service areas`
- Secondary CTA: `Start a delivery`
- Tertiary text link: `How Kra works`

Behavior:

- Primary routes to `/service-areas`.
- Secondary routes to sender entry route when available, otherwise approved fallback.
- Tertiary routes to `/how-it-works`.

### 12. `PublicPricingFooter`

Purpose:

- Provide stable public navigation and support routes.

Required:

- Same shared footer as public landing.
- Support and policy links visible.
- Pricing route present.

## Component Inventory

Claude Code should create or reuse components with these responsibilities:

### `PublicPricingPage`

- Owns page composition.
- Sets metadata.
- Renders `data-testid="screen-public-pricing"`.
- Does not fetch authenticated data.
- Does not calculate authoritative final prices.

### `PricingReceiptPreview`

- Renders conceptual receipt in hero.
- Uses approved labels only.
- Avoids invented live checkout data.

### `QuotePromiseCards`

- Renders route/package/final quote/quote lock principles.

### `RouteBaseFeeTable`

- Renders six one-way route base fees.
- Converts to cards on mobile.
- Uses exact approved GHS values.

### `IncludedPackageCard`

- Renders included standard package assumptions.

### `SurchargeGroup`

- Renders one surcharge category.
- Supports table or compact card layout.

### `ManualQuoteBoundaryPanel`

- Distinguishes self-serve, manual quote, and not available cases.

### `QuoteLockPaymentPanel`

- Explains backend quote authority, no pay-on-delivery, and no final-mile cash.

### `RefundExpectationTable`

- Renders refund/cancellation outcomes.
- Converts to cards on mobile.

### `PublicFaqAccordion`

- Shared accessible FAQ accordion.

### `PublicFinalCta`

- Shared final CTA pattern.

## Data And Content Source

This page is public static content for v1.

Allowed local sources:

- `docs/03-business/pricing-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/copy-deck.md`

Do not fetch:

- Active admin pricing rules from authenticated endpoints.
- Payment provider fee records.
- Customer quote history.
- Delivery IDs.
- Sender accounts.

Future behavior:

- If a public quote preview endpoint is approved, it must be clearly labeled and must not expose internal pricing rule IDs.
- Until then, this page remains an explainer only.

## State Handling

Required page state:

- `normal`

No full-page states required:

- No loading.
- No empty.
- No unavailable.
- No authenticated error state.

Non-blocking component fallback:

- If an illustration or receipt visual fails, render all price tables and explanations normally.
- Use fallback text: `Pricing rules are listed below.`

## Interaction Rules

### In-Page Navigation

Optional but recommended on desktop:

- `Route fees`
- `Included`
- `Surcharges`
- `Manual quote`
- `Refunds`
- `FAQ`

Rules:

- Anchor links only.
- Active section must not rely on color alone.
- Do not create route changes.

### Tables And Cards

- Desktop route fees may render as tables.
- Mobile route fees must render as cards or accessible responsive tables.
- Surcharge groups may use tabs only if tabs are accessible.
- Prefer always-visible groups over hidden content if page length remains reasonable.

### No Calculator Rule

Do not implement:

- Price calculator.
- Total estimator.
- Sliders.
- Package dimension math.
- Hidden formulas.
- "Savings" calculator.

Allowed:

- Static tables.
- Static example only if clearly labeled and approved.
- Link to sender booking flow where backend quote is generated.

### Motion

Allowed:

- Subtle receipt stack reveal.
- Table/card entrance.
- CTA hover/focus transitions.

Rules:

- Respect `prefers-reduced-motion`.
- No animated counters for money.
- No fluctuating price animations.

## Accessibility Requirements

Baseline:

- One `h1`.
- Semantic `main`, header, footer.
- Logical heading order.
- Tables have headers.
- Mobile card conversion preserves header meaning.
- Keyboard can reach all links, accordions, and optional in-page nav.
- Visible focus states.
- Color contrast meets WCAG AA.
- Text remains readable at 200% zoom.
- No horizontal scroll at `320px`.

Pricing content:

- Do not communicate included/excluded state by color alone.
- Currency values must be visible as text.
- Avoid tiny footnote text.
- Refund warnings must be readable and not hidden behind icons.

FAQ:

- Button triggers.
- `aria-expanded` reflects state.
- Focus order remains predictable.

## Performance Requirements

- No heavy charting library.
- No checkout SDK on this page.
- No payment provider script.
- No third-party pricing embed.
- No autoplay media.
- Tables render as text, not images.
- Page remains understandable if the receipt illustration fails.

Performance acceptance:

- Static pricing content renders immediately.
- No dependency is added solely for pricing visuals.
- Mobile route fee cards remain lightweight.

## SEO And Metadata

Page title:

- `Pricing | Kra`

Meta description:

- `See Kra launch route fees, standard package rules, weight and doorstep surcharges, manual quote boundaries, and refund expectations.`

Open Graph:

- Title: `Kra pricing`
- Description: `Clear route-based pricing with visible package surcharges and refund expectations.`
- Image: approved public brand/social image only.

Structured content:

- Use semantic headings and tables.
- Do not add product pricing schema if it cannot represent route-specific fees accurately.

## Analytics Contract

Use analytics only if the public analytics layer already exists.

Events:

### `public_pricing_viewed`

Fire when page renders.

Payload:

- `route`: `/pricing`
- `screen_id`: `PublicPricingExplainer`

### `public_pricing_section_viewed`

Fire when major pricing sections become visible if scroll analytics already exist.

Payload:

- `section`

### `public_pricing_cta_clicked`

Fire when major CTA is clicked.

Payload:

- `cta_label`
- `destination_route`
- `section`

### `public_pricing_faq_opened`

Fire when FAQ opens.

Payload:

- `question_key`

Privacy:

- Never collect package dimensions, declared value, phone number, exact route selections, or tracking codes from this static page.
- Do not include raw query strings.

## Testing Contract

### Unit And Component Tests

Required tests:

- Renders `screen-public-pricing`.
- Renders hero H1 exactly.
- Renders primary CTA linking to `/service-areas`.
- Renders all six one-way route base fees.
- Renders included standard package rules.
- Renders every weight surcharge.
- Renders every size surcharge.
- Renders express surcharge rule.
- Renders doorstep surcharge rules.
- Renders fragile and declared-value handling rules.
- Renders no pay-on-delivery copy.
- Renders refund expectation table.
- Renders all FAQ questions.
- Does not render a price calculator test ID.

### Accessibility Tests

Required:

- Automated accessibility check has no critical violations.
- Keyboard can reach:
  - header links
  - route fee section links
  - FAQ triggers
  - final CTA
- Tables or mobile cards preserve label/value relationships.
- Reduced motion does not hide content.

### E2E Tests

Add or extend public web E2E coverage:

Test name:

- `e2e-public-pricing-content`

Flow:

- Visit `/pricing`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Assert `Accra Central -> Kumasi Adum` and `GHS 35` are visible.
- Assert `Doorstep above 10km` and `not available in v1` are visible.
- Assert `Pay-on-delivery is not supported in v1` is visible.
- Click `Check service areas`.
- Assert route is `/service-areas`.

Test name:

- `e2e-public-pricing-mobile`

Flow:

- Set mobile viewport.
- Visit `/pricing`.
- Assert no horizontal overflow.
- Assert route fees are readable.
- Open FAQ about final quote.
- Assert answer says booking quote is final amount to review before payment.

### Visual Regression

Capture:

- Desktop hero and quote promise.
- Desktop route fee table.
- Mobile route fee cards.
- Refund expectation section.
- FAQ open state.

Do not accept:

- Clipped tables.
- Tiny money values.
- Hidden manual quote boundaries.
- Invented calculator UI.
- Generic subscription pricing cards.

## Content Acceptance Checklist

- Page renders `/pricing`.
- Page names all six one-way route fees.
- Page states standard package is `0kg to 2kg`.
- Page states standard size longest side `<= 40cm`.
- Page states doorstep is not included in base fee.
- Page states express surcharge is `+40%` with minimum `GHS 15`.
- Page states doorstep within `5km` is `+GHS 15`.
- Page states doorstep above `5km` and up to `10km` is `+GHS 25`.
- Page states doorstep above `10km` is not available.
- Page states package above `20kg` requires manual quote.
- Page states oversized above `70cm` requires manual quote.
- Page states declared value above `GHS 5,000` is not self-serve.
- Page states final quote is shown before payment.
- Page states quote locks at booking.
- Page states no pay-on-delivery.
- Page states no final-mile cash collection.
- Page states refund before origin intake is full refund.
- Page states after origin intake but before dispatch refund has `GHS 5` handling fee.
- Page states after dispatch has no automatic refund.
- Page does not contain an authoritative local calculator.

## Design Quality Review Checklist

Before closing implementation, review the UI against five perspectives:

Founder:

- Does the page make Kra feel financially disciplined and trustworthy?

Skeptical sender:

- Do I understand what can increase my price before I start?

Merchant:

- Can I plan repeated delivery costs without needing to call support for every standard route?

Operator:

- Does the page avoid promises that station staff cannot enforce?

Accessibility reviewer:

- Can I read route fees, surcharges, and refund rules without a mouse, wide screen, or perfect vision?

Creative director:

- Does the page feel like a premium pricing system rather than a rate sheet pasted into cards?

If any answer is weak, revise before moving to the next screen spec.

## Claude Code Build Notes

Claude Code should:

- Build only this screen and shared components required by this screen.
- Keep the page static unless an approved public quote endpoint exists.
- Reuse shared public header, footer, FAQ, and final CTA components.
- Convert tables to accessible mobile cards.
- Add tests at the same quality level as the other public web routes.

Claude Code should not:

- Implement unrelated screens.
- Add a local calculator.
- Add payment provider scripts.
- Add invented checkout data.
- Add discounts, coupons, or promotional pricing.
- Add competitor comparison.
- Add unapproved route fees.
- Add prototype pricing outside approved v1 rules.

## Final Implementation Decisions

No product decision blocks this static pricing explainer.

Claude Code must implement these decisions:

- Surcharge groups render as always-visible decision cards grouped by weight, size, speed, doorstep, and special handling. Do not hide core pricing rules behind tabs.
- The hero receipt visual includes one approved illustrative receipt made only from policy labels and explicitly marked as `How the quote is built`, not as a live quote.
- Route fee tables become stacked mobile cards below `720px`; each card repeats origin, destination, base fee, included package rule, and quote-authority note.

Implementation guardrails:

- Different fees.
- Different surcharge rules.
- Different refund expectations.
- Local pricing math authority.
- Pay-on-delivery.
- Cash collection.
- Automatic compensation promises.

## Spec Quality Review

### Top-Tier Product Standard Pass

Pass. The spec defines a precise pricing explainer with exact route fees, surcharge groups, manual quote boundaries, quote authority, payment discipline, refund expectations, accessibility, and a strict no-calculator rule.

### Industry Inspiration Translation Pass

Pass. External references are translated into directly relevant principles:

- Shipping prices depend on route, package, service, and other considerations.
- Quote flows should collect shipment details before booking.
- Transparent pricing pages should make fees and custom paths explicit.
- Accessibility must apply to tables, accordions, and pricing controls.

No external wording, assets, fee values, or layouts are copied.

### Implementation Readiness Pass

Pass. The spec gives route contract, page IA, exact copy, pricing data, component inventory, interaction rules, accessibility, analytics, SEO, tests, and close criteria.

### Policy Consistency Pass

Pass. The spec aligns to pricing rules, doorstep rules, refund/dispute rules, delivery lifecycle payment gate, copy deck legal constraints, and frontend inventory boundaries.

### Remaining Constraints Accepted

Accepted:

- This page is an explainer, not the final quote engine.
- The backend quote flow remains final pricing authority.
- No UI implementation is included.
- No authenticated data is required.

### Close Decision

Ready for Claude Code implementation after this document is merged and CI is green.
