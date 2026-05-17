# Public Landing Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicLanding` |
| App | `apps/web` |
| Route | `/` |
| Primary test ID | `screen-public-landing` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related action routes | `/track`, `/how-it-works`, `/service-areas`, `/pricing`, `/trust-and-custody`, `/support` |
| Required states | `normal`, `degraded_marketing_asset_load` |

## Product Job
The landing page must explain Kra in less than one viewport: a Ghana-first delivery operating system for intercity package movement across Africa, built around stations, verified handoffs, package tracking, payment discipline, and receiver proof.

The page must convert three user intents without making the first viewport noisy:
- A sender wants to create or understand a delivery.
- A receiver wants to track a package safely.
- A business or repeat sender wants to trust Kra enough to continue reading.

## Audience
Primary audience:
- Ghana-based senders and small merchants evaluating whether Kra can move packages between launch cities.

Secondary audience:
- Receivers arriving from search or a shared link.
- Station, driver, courier, and partner prospects validating that Kra is operationally serious.
- Press, investors, and early hires checking product maturity.

## User State
Most visitors are cold or lightly aware. They do not yet trust Kra with a package, payment, or recipient relationship. The page must build trust before asking for commitment.

## Primary Action
Primary CTA: `Track a package`

Rationale:
- Tracking is the fastest trust proof for public visitors.
- It serves both senders and receivers.
- It is lower-friction than account creation before the sender app is fully implemented.

Secondary CTA: `See how Kra works`

Tertiary CTA for conversion sections: `Start a delivery`

If `Start a delivery` cannot route to a production sender flow at build time, route it to the approved sender onboarding route or a waitlist route only if that route is defined elsewhere. Do not point it to a demo form.

## Visual Thesis
Design Kra as a modern logistics command surface for everyday people: bright, precise, fast, trustworthy, and grounded in real African city movement. The page should feel closer to Stripe-level clarity and Uber-level mobility confidence than a generic courier brochure.

## Restraint Rule
Do not overload the page with generic icons, fake dashboards, decorative map noise, or inflated promises. Every visual element must prove one of four things: route coverage, handoff accountability, delivery status clarity, or payment/support trust.

## Elite Quality Gate
This screen spec is not considered complete unless the resulting UI can stand beside the top `0.1%` of modern logistics, fintech, marketplace, and commerce landing pages. The implementation must be judged against this bar before Claude Code moves to the next screen.

Non-negotiable quality requirements:
- The first viewport must communicate value, geography, trust model, and primary action without requiring the user to scroll.
- The page must feel intentionally designed, not assembled from a generic SaaS template.
- Every section must earn its place by improving comprehension, trust, desire, or action.
- Every visual object must be specific to Kra's delivery model: stations, corridors, scans, proof, receiver-safe tracking, payment readiness, support policy, or route coverage.
- The design must avoid generic courier stock imagery, abstract blob decoration, fake metrics, demo dashboards, and placeholder UI.
- The page must be visually premium while staying fast, accessible, and realistic for mobile networks.
- The copy must be concrete, low-hype, and operationally honest.
- The final UI must pass a reduction pass: remove any element that does not increase trust, understanding, or conversion.

Closure rule:
- If any requirement in this gate is not met during implementation review, the screen must remain open and be revised before moving to the next screen spec.

## Inspiration And Context Inputs
Use these references as direction, not as copy sources:
- Stripe: crisp product explanation, dense but controlled hero composition, strong CTA hierarchy.
- Shopify: business-outcome-first page rhythm and merchant-friendly framing.
- Uber Courier: delivery page framing around simple action, speed, and practical package movement.
- WCAG: accessible color, focus, reduced-motion, and keyboard requirements.

Do not copy layouts, illustrations, brand assets, wording, gradients, or component styling from any external site.

## Required Page Outcomes
A successful implementation must let a first-time visitor answer:
- What does Kra do?
- Where does it launch?
- How does Kra prevent packages from getting lost?
- How can I track a package?
- Why should I trust Kra more than an informal handoff?
- Where do I learn about pricing, stations, proof, support, and policy?

## Route And Navigation Rules
### Route
- Render at `/`.
- Must be accessible without authentication.
- Must not call authenticated APIs.
- Must not expose any internal admin, staff, payment provider, audit, or raw operations data.

### Header Navigation
Desktop header links:
- `How it works` -> `/how-it-works`
- `Service areas` -> `/service-areas`
- `Pricing` -> `/pricing`
- `Trust and custody` -> `/trust-and-custody`
- `Support` -> `/support`

Desktop actions:
- Primary action: `Track package` -> `/track`
- Secondary action: `Start delivery` -> sender entry route when available. Until then, route to `/how-it-works#start-delivery` only if that anchor exists.

Mobile header:
- Use a compact top bar with Kra wordmark, `Track` action, and menu button.
- Menu opens a full-height sheet, not a tiny dropdown.
- Mobile menu must contain the same links as desktop.
- Closing the menu must return focus to the menu button.

## Page IA
Render sections in this exact order:
1. `PublicLandingHeader`
2. `PublicLandingHero`
3. `PublicLandingTrustBar`
4. `PublicLandingNetworkProof`
5. `PublicLandingHowItWorksPreview`
6. `PublicLandingCustodyProof`
7. `PublicLandingPricingPreview`
8. `PublicLandingBusinessUseCases`
9. `PublicLandingReceiverPromise`
10. `PublicLandingSupportAndPolicy`
11. `PublicLandingFaq`
12. `PublicLandingFinalCta`
13. `PublicLandingFooter`

Do not add unrelated sections before the final CTA. If content feels long, reduce text inside sections rather than adding a new section.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid for major sections.
- Hero height: minimum `680px`, but do not force full viewport if content overflows.
- Section vertical spacing: `96px` desktop, `72px` tablet, `56px` mobile.
- Use asymmetric compositions: hero copy on left, operational preview on right; later sections may alternate.

### Tablet
- Max content width: `920px`.
- Collapse complex grids to 2 columns.
- Keep tracking entry card visible above the fold if possible.

### Mobile
- Single-column layout.
- Page gutters: `20px`.
- Hero must lead with headline, subheadline, CTA row, then a compact operational preview summary.
- Avoid horizontal scroll.
- Use accordions for FAQ only. Do not hide core trust or coverage content behind accordions.

## Visual System
### Color
Use existing approved tokens as base:
- `brand.blue.600` `#0F5FE8`
- `success.green.600` `#1F9D55`
- `warning.amber.600` `#D98E04`
- `danger.red.600` `#D64545`
- `neutral.900` `#111827`
- `neutral.700` `#374151`
- `neutral.500` `#6B7280`
- `neutral.100` `#F3F4F6`
- `surface` `#FFFFFF`

Landing-specific art direction:
- Background base: warm off-white, not pure gray.
- Hero accent: trusted blue.
- Operational proof accents: green for completed handoff, amber for attention, red only for warnings.
- Use color sparingly. Status color must always be paired with text or icon shape.

### Typography
Use approved typography:
- Headings: `Manrope`
- Body: `Inter`
- Numeric emphasis: `Inter` semibold

Desktop type scale:
- Hero eyebrow: `14px`, uppercase or small-caps, letter spacing `0.08em`.
- Hero H1: `64px`, line-height `0.96`, weight `800`.
- Hero subheadline: `20px`, line-height `1.55`, max width `640px`.
- Section heading: `40px` to `48px`, line-height `1.08`, weight `750`.
- Body: `16px` to `18px`, line-height `1.6`.

Mobile type scale:
- Hero H1: `42px`, line-height `1.0`.
- Section heading: `30px` to `34px`.
- Body: `16px`.

### Shape And Depth
- Use radius `16px` for large panels.
- Use radius `12px` for cards.
- Use radius `8px` for inputs and chips.
- Shadows must be soft and sparse. Prefer borders, tint, and spacing for hierarchy.

### Motion
Motion must be meaningful:
- Hero operational preview may animate in once on page load with opacity and vertical transform.
- Timeline line may draw in as it enters viewport.
- CTA buttons may use subtle hover lift and focus ring.
- Tracking input must not animate while user types.
- Respect `prefers-reduced-motion` by disabling non-essential motion.

## Section Specs
### 1. PublicLandingHeader
Purpose:
- Orient visitors.
- Make tracking immediately available.
- Avoid looking like a SaaS dashboard before users understand the service.

Required elements:
- Kra wordmark text `Kra`.
- Navigation links listed above.
- `Track package` button.
- `Start delivery` secondary button or link.

Behavior:
- Header is sticky after the user scrolls past `96px`.
- Initial header overlays or sits above hero with transparent or very light background.
- Sticky header uses solid surface with bottom border.
- Active link state only appears on route match. On `/`, no nav link is active.

Test IDs:
- `nav-public-header`
- `nav-public-logo`
- `nav-public-link-how-it-works`
- `nav-public-link-service-areas`
- `nav-public-link-pricing`
- `nav-public-link-trust-custody`
- `nav-public-link-support`
- `action-public-track-package`
- `action-public-start-delivery`
- `action-public-mobile-menu`
- `modal-public-mobile-menu`

### 2. PublicLandingHero
Purpose:
- Explain Kra, launch geography, and trust model.
- Route users to tracking or how-it-works.

Hero copy:
- Eyebrow: `Ghana-first delivery infrastructure for Africa`
- H1: `Move packages between cities without losing sight of them.`
- Subheadline: `Kra connects senders, stations, drivers, couriers, and receivers through verified handoffs, clear tracking, and proof at delivery. Launching first across Accra, Kumasi, and Tamale.`
- Primary CTA: `Track a package`
- Secondary CTA: `See how Kra works`

Hero proof chips:
- `Station-based handoffs`
- `Package scans at every custody change`
- `Receiver proof before completion`
- `Mobile money-ready payments`

Hero operational preview:
- Build a non-interactive visual called `LandingDeliveryPathCard`.
- It must show one package journey from `Accra Central` to `Kumasi Adum`.
- It must include 5 visible steps:
  - `Booked`
  - `Received at origin`
  - `Left origin station`
  - `Arrived at destination`
  - `Ready for pickup`
- It must show current highlighted step as `In transit` only if the preview clearly labels itself as illustrative.
- It must not look like live data.
- Add visible label: `Example delivery path`.

Do not:
- Do not use fake customer names.
- Do not use fake live counters.
- Do not claim guaranteed arrival.
- Do not show raw coordinates or operational IDs.

Test IDs:
- `section-public-hero`
- `copy-public-hero-eyebrow`
- `copy-public-hero-title`
- `copy-public-hero-subtitle`
- `action-public-hero-track`
- `action-public-hero-how-it-works`
- `component-landing-delivery-path-card`
- `component-landing-delivery-step-booked`
- `component-landing-delivery-step-origin`
- `component-landing-delivery-step-dispatch`
- `component-landing-delivery-step-destination`
- `component-landing-delivery-step-ready`

### 3. PublicLandingTrustBar
Purpose:
- Establish why Kra is not informal delivery.

Required content:
- `3 launch cities`
- `3 controlled station corridors`
- `10km doorstep radius in launch cities`
- `Proof required before delivery is marked complete`

Design:
- Use a full-width strip directly below hero.
- On desktop, render as 4 metrics.
- On mobile, render as a 2x2 grid.
- Every metric must include one explanatory sentence.

Copy:
- `3 launch cities`: `Accra, Kumasi, and Tamale form the pilot network.`
- `3 controlled station corridors`: `Routes start with known stations, drivers, and exception owners.`
- `10km doorstep radius`: `Doorstep delivery is available only where final-mile completion can be controlled.`
- `Proof required`: `OTP, signature, or photo proof is needed before completion.`

Test IDs:
- `section-public-trust-bar`
- `metric-public-launch-cities`
- `metric-public-corridors`
- `metric-public-doorstep-radius`
- `metric-public-proof-required`

### 4. PublicLandingNetworkProof
Purpose:
- Show launch coverage honestly and invite users to inspect routes.

Required layout:
- Left: section copy.
- Right: `LaunchCorridorPanel`.

Section copy:
- Heading: `Built around stations, not guesswork.`
- Body: `Kra starts with controlled city corridors, known station teams, and visible package movement. Coverage expands only when the route can be operated with accountable handoffs.`
- CTA: `View service areas`

LaunchCorridorPanel content:
- Origin/destination pairs:
  - `Accra Central <-> Kumasi Adum`
  - `Accra Central <-> Tamale Central`
  - `Kumasi Adum <-> Tamale Central`
- Station cards:
  - `Accra Central`, city `Accra`
  - `Kumasi Adum`, city `Kumasi`
  - `Tamale Central`, city `Tamale`
- Doorstep note: `Doorstep available within 10km of the destination station during pilot operations.`

Design:
- Use a clean line-map abstraction, not a geographic map unless accurate station coordinates exist.
- If using a map-like visual, label it `Pilot corridor diagram`.
- Do not imply nationwide coverage.

Test IDs:
- `section-public-network-proof`
- `component-launch-corridor-panel`
- `row-corridor-accra-kumasi`
- `row-corridor-accra-tamale`
- `row-corridor-kumasi-tamale`
- `action-public-view-service-areas`

### 5. PublicLandingHowItWorksPreview
Purpose:
- Explain operational flow in human terms.

Heading:
- `A delivery chain you can actually follow.`

Intro:
- `Each package moves through defined roles. Every important handoff creates a record, so support teams can see where the package is and who is responsible next.`

Steps:
1. `Book and pay`
   - `The sender creates a delivery, sees the route price, and completes payment before transport.`
2. `Drop at origin station`
   - `Station staff receive the package and bind its scan code to the delivery.`
3. `Move between stations`
   - `Assigned drivers scan before custody changes and update the route state.`
4. `Pickup or doorstep`
   - `The receiver picks up at the destination station or gets doorstep delivery where available.`
5. `Complete with proof`
   - `Delivery is completed only after OTP, signature, or photo proof is captured.`

CTA:
- `See the full process` -> `/how-it-works`

Design:
- Use a horizontal stepper on desktop.
- Use vertical cards on mobile.
- Include one small proof indicator per step: payment, scan, custody, receiver, proof.

Test IDs:
- `section-public-how-it-works-preview`
- `step-public-book-pay`
- `step-public-origin-dropoff`
- `step-public-station-transfer`
- `step-public-pickup-doorstep`
- `step-public-proof-completion`
- `action-public-see-full-process`

### 6. PublicLandingCustodyProof
Purpose:
- Make loss-prevention concrete.

Heading:
- `Every handoff has an owner.`

Body:
- `Kra does not treat assignment as custody. A package changes hands only when the next actor confirms it with the registered package scan code or approved receiver proof.`

Required cards:
- `Package scan`
  - `The package label is bound once at origin intake and checked at later handoffs.`
- `Custody owner`
  - `The current responsible role stays visible until the next confirmed handoff.`
- `Condition check`
  - `Destination station receipt includes package condition and exceptions.`
- `Delivery proof`
  - `OTP, signature, or photo proof is required before final completion.`

CTA:
- `Read trust and custody rules` -> `/trust-and-custody`

Design:
- Use a strong split layout.
- Left: copy and CTA.
- Right: `CustodyEvidenceStack`, a stacked set of evidence cards.
- Evidence cards must show labels and timestamps in example form, but must be visibly illustrative.

Test IDs:
- `section-public-custody-proof`
- `card-public-package-scan`
- `card-public-custody-owner`
- `card-public-condition-check`
- `card-public-delivery-proof`
- `component-custody-evidence-stack`
- `action-public-read-custody-rules`

### 7. PublicLandingPricingPreview
Purpose:
- Reduce pricing anxiety without duplicating quote logic.

Heading:
- `Pricing starts with the route, then changes only when the delivery choices change.`

Body:
- `Launch pricing is based on corridor, package size, weight tier, service speed, doorstep distance, and special handling. The final quote is shown before payment.`

Required content:
- Show the three base corridor prices:
  - `Accra Central -> Kumasi Adum: GHS 35`
  - `Accra Central -> Tamale Central: GHS 65`
  - `Kumasi Adum -> Tamale Central: GHS 50`
- Include note: `Prices are one-way launch base fees for standard packages. Final quotes are confirmed in the sender flow.`
- Include policy note: `Pay on delivery is not supported in v1.`

CTA:
- `Understand pricing` -> `/pricing`

Do not:
- Do not implement local quote calculation on this page.
- Do not let users edit route, weight, or size here.
- Do not show unofficial discounts.

Test IDs:
- `section-public-pricing-preview`
- `price-public-accra-kumasi`
- `price-public-accra-tamale`
- `price-public-kumasi-tamale`
- `action-public-understand-pricing`

### 8. PublicLandingBusinessUseCases
Purpose:
- Speak to merchants and repeat senders without turning the page into a merchant portal.

Heading:
- `For sellers who cannot afford delivery uncertainty.`

Body:
- `Whether you send customer orders, replacement parts, documents, or family packages, Kra gives each package a visible route, support path, and delivery outcome.`

Use cases:
- `Online sellers`
  - `Send customer orders across launch corridors with tracking customers can understand.`
- `Retail restock`
  - `Move small stock between cities without relying only on informal driver calls.`
- `Documents and essentials`
  - `Use station-based pickup or controlled doorstep delivery where available.`

CTA:
- `Start a delivery`

Test IDs:
- `section-public-business-use-cases`
- `card-public-use-case-online-sellers`
- `card-public-use-case-retail-restock`
- `card-public-use-case-documents`
- `action-public-business-start-delivery`

### 9. PublicLandingReceiverPromise
Purpose:
- Explain receiver-safe tracking and proof without exposing private data.

Heading:
- `Receivers get clarity without needing a full account.`

Body:
- `A receiver can open a secure tracking link, verify their phone when needed, see safe delivery progress, and understand what proof is required at pickup or doorstep delivery.`

Required mini-flow:
1. `Open tracking link`
2. `Verify phone when required`
3. `See receiver-safe status`
4. `Show OTP or proof at delivery`

Privacy note:
- `Receiver pages never show internal payment provider data, staff IDs, audit metadata, or sender account details.`

CTA:
- `Track package` -> `/track`

Test IDs:
- `section-public-receiver-promise`
- `flow-public-receiver-open-link`
- `flow-public-receiver-verify-phone`
- `flow-public-receiver-safe-status`
- `flow-public-receiver-proof`
- `action-public-receiver-track`

### 10. PublicLandingSupportAndPolicy
Purpose:
- Show that exceptions are expected and governed.

Heading:
- `When something goes wrong, the package does not disappear into silence.`

Body:
- `Issues, failed attempts, payment review, refunds, and custody exceptions have support paths. Kra shows the next accountable step instead of hiding operational uncertainty.`

Required links:
- `Contact support` -> `/support`
- `Delivery policy` -> `/delivery-policy`
- `Refund policy` -> `/refund-policy`

Required cards:
- `Failed doorstep attempt`
  - `One reattempt is allowed within 24 hours when policy conditions are met.`
- `Unclaimed pickup`
  - `Destination pickup has a 72-hour hold before on-hold handling begins.`
- `Refund and dispute`
  - `Refunds follow payment, status, and evidence review.`

Test IDs:
- `section-public-support-policy`
- `card-public-failed-attempt-policy`
- `card-public-unclaimed-pickup-policy`
- `card-public-refund-dispute-policy`
- `action-public-contact-support`
- `action-public-delivery-policy`
- `action-public-refund-policy`

### 11. PublicLandingFaq
Purpose:
- Answer conversion-blocking questions without bloating earlier sections.

Required FAQ items:
1. `Where does Kra operate first?`
   - `Kra launches first with stations in Accra, Kumasi, and Tamale, connected by controlled pilot corridors.`
2. `Can I get doorstep delivery?`
   - `Doorstep delivery is available only within 10km of the destination station during pilot operations.`
3. `Can I pay on delivery?`
   - `No. Payment must be confirmed before a package can move into transport states.`
4. `How does Kra reduce lost-package risk?`
   - `Kra uses package scan binding, confirmed handoffs, custody ownership, condition checks, and delivery proof.`
5. `What proof is required at delivery?`
   - `Depending on the delivery path, Kra may use receiver OTP, signature, or delivery photo proof.`
6. `Are delivery times guaranteed?`
   - `No. Kra uses expected and estimated timing language during pilot operations and avoids guaranteed-delivery promises.`

Behavior:
- Desktop may render as two columns.
- Mobile must use accessible accordion controls.
- Accordion buttons must be keyboard reachable and screen-reader labeled.
- Default mobile state: first item open, others closed.

Test IDs:
- `section-public-faq`
- `faq-public-operating-cities`
- `faq-public-doorstep-delivery`
- `faq-public-pay-on-delivery`
- `faq-public-lost-package-risk`
- `faq-public-delivery-proof`
- `faq-public-delivery-times`

### 12. PublicLandingFinalCta
Purpose:
- Close with the two strongest actions.

Heading:
- `Ready to move a package with a visible chain of responsibility?`

Body:
- `Track an existing package or learn how Kra moves packages through stations, drivers, couriers, and receiver proof.`

Primary CTA:
- `Track a package` -> `/track`

Secondary CTA:
- `See how Kra works` -> `/how-it-works`

Design:
- Use a bold but calm panel.
- Avoid fake urgency.
- Do not use countdowns, promotional banners, or discount language.

Test IDs:
- `section-public-final-cta`
- `action-public-final-track`
- `action-public-final-how-it-works`

### 13. PublicLandingFooter
Purpose:
- Provide navigation, policy, and trust closure.

Required columns:
- `Product`
  - `How it works`
  - `Track package`
  - `Service areas`
  - `Pricing`
- `Trust`
  - `Trust and custody`
  - `Delivery policy`
  - `Refund policy`
  - `Support`
- `Company`
  - `About Kra` if route exists
  - `Partners` if route exists
- `Legal`
  - `Privacy`
  - `Terms`

Footer microcopy:
- `Kra is building delivery infrastructure for Africa, starting with controlled city corridors in Ghana.`

Test IDs:
- `footer-public`
- `footer-public-product`
- `footer-public-trust`
- `footer-public-company`
- `footer-public-legal`

## Component Inventory For This Screen
Claude Code should create reusable components only if they will be used by later public screens. Otherwise keep the component local to the public landing feature.

Required page-specific components:
- `PublicLandingHeader`
- `PublicLandingHero`
- `LandingDeliveryPathCard`
- `PublicLandingTrustBar`
- `LaunchCorridorPanel`
- `PublicLandingHowItWorksPreview`
- `CustodyEvidenceStack`
- `PublicLandingPricingPreview`
- `PublicLandingBusinessUseCases`
- `PublicLandingReceiverPromise`
- `PublicLandingSupportAndPolicy`
- `PublicLandingFaq`
- `PublicLandingFinalCta`
- `PublicLandingFooter`

Reusable component candidates:
- `PublicPageShell`
- `PublicSection`
- `PublicCtaButton`
- `PublicMetric`
- `PublicAccordion`
- `PublicLinkCard`
- `PublicStatusPill`

## Data And Content Sources
Hardcoded public marketing content is allowed for this first screen if it comes from approved docs.

Allowed source docs:
- `docs/03-business/service-areas-and-stations.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/pricing-rules.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/design-system.md`
- `docs/05-design/frontend-screen-inventory.md`

Disallowed sources:
- Raw backend repositories at runtime.
- Admin-only endpoints.
- Payment provider internals.
- Fake analytics or fake live delivery data.

## State Handling
### Normal
Render all sections with static approved content and working links.

### Degraded Marketing Asset Load
Trigger when optional illustration, map art, image, animation, or decorative asset fails.

Required behavior:
- Page still renders all copy, CTAs, links, and trust content.
- Hide broken visual asset.
- Replace asset region with a low-noise fallback panel using text and simple CSS primitives.
- Do not show a red error state to public users for decorative asset failure.
- Log client-side asset failure as non-PII diagnostic event if analytics infrastructure exists.

Fallback copy:
- Title: `Delivery path preview unavailable`
- Body: `The page content is still available. You can continue to tracking, pricing, service areas, or support.`

Test IDs:
- `state-public-landing-normal`
- `state-public-landing-degraded-assets`

## Interaction Requirements
### CTA Behavior
- All CTAs must be real navigation actions.
- Buttons must not use `#` placeholder hrefs.
- Disabled CTAs are not allowed unless the target route is truly unavailable and the copy explains why.

### Tracking CTA
- `Track a package` always routes to `/track`.
- Do not put a tracking input in the hero for this first spec unless `PublicTrackingEntry` has already been built. Keep this page focused and route to the dedicated tracking screen.

### Scroll Behavior
- Section links may scroll to anchors only if anchors exist and focus updates correctly.
- Sticky header must not hide anchor headings.

### Mobile Menu
- Trap focus while open.
- Close on `Escape`.
- Close on route navigation.
- Prevent background scroll while open.

## Analytics Contract
Use analytics only if the frontend analytics foundation exists. Do not block page render if analytics fails.

Events:
- `public_landing_viewed`
  - Props: `route`, `locale`, `referrerType`, `viewportClass`
- `public_landing_cta_clicked`
  - Props: `ctaId`, `destinationRoute`, `sectionId`
- `public_landing_section_viewed`
  - Props: `sectionId`, `viewportClass`
- `support_opened`
  - Props: `source`, `route`
- `tracking_viewed`
  - Fire only after the user lands on `/track`, not on the landing CTA click.

Privacy rules:
- Do not send phone numbers.
- Do not send tracking codes from this page.
- Do not send full URL query strings.
- Do not send raw user agent if analytics policy later forbids it.

## SEO And Metadata
Page title:
- `Kra - Delivery infrastructure for Africa`

Meta description:
- `Kra moves packages through verified stations, drivers, couriers, tracking, and delivery proof, starting with Accra, Kumasi, and Tamale.`

Open Graph:
- `og:title`: `Kra - Delivery infrastructure for Africa`
- `og:description`: same as meta description.
- `og:type`: `website`
- `og:locale`: `en_GH`

Structured data:
- Add `Organization` JSON-LD only if real organization URL, logo, and contact data exist.
- Do not invent social links, addresses, or phone numbers.

SEO content requirements:
- H1 appears exactly once.
- Use clear H2 headings for each major section.
- Links must have descriptive text.
- Do not hide meaningful text inside images.

## Accessibility Requirements
Follow WCAG 2.2 AA intent.

Required:
- Keyboard navigation for header, mobile menu, CTAs, FAQ accordions, and footer links.
- Visible focus state for every interactive element.
- Text contrast at least AA.
- Touch targets at least `44px` high/wide on mobile.
- Reduced motion support.
- Logical heading order.
- Landmark structure: `header`, `main`, `section`, `footer`.
- Mobile menu must announce expanded/collapsed state.
- FAQ accordion must use `aria-expanded` and `aria-controls`.

Forbidden:
- Color-only status communication.
- Autoplay motion that cannot be reduced.
- Text embedded inside non-decorative images without accessible equivalent.
- Keyboard traps outside the mobile menu while it is open.

## Performance Requirements
Targets:
- Largest Contentful Paint target: under `2.5s` on a mid-tier mobile connection.
- Cumulative Layout Shift target: under `0.1`.
- First Input Delay or INP must stay within good Core Web Vitals targets.

Implementation guidance:
- Render critical hero content as text and CSS, not a heavy image.
- Lazy-load below-the-fold decorative assets.
- Avoid map libraries on the landing page unless they are static and lightweight.
- Do not block rendering on analytics.
- Use CSS gradients and vector primitives where possible.

## Responsive Acceptance Matrix
Viewport coverage:
- `360px` mobile narrow.
- `390px` iPhone common.
- `768px` tablet.
- `1024px` small desktop.
- `1440px` wide desktop.

Must pass:
- No horizontal scroll.
- Header actions remain reachable.
- Hero CTA and route explanation are visible without excessive scrolling.
- Operational preview collapses below copy on mobile.
- FAQ remains keyboard accessible.
- Footer columns stack cleanly.

## Copy Rules
Use approved terms:
- `package`
- `pickup`
- `delivery`
- `station`
- `tracking`
- `proof`

Avoid in public customer copy:
- `custody` unless in a trust/education section with explanation.
- `projection`
- `workflow`
- `internal`
- `webhook`
- `provider reference`

Do not promise:
- Guaranteed delivery time.
- Automatic compensation.
- Insurance-backed outcome.
- Everywhere-to-everywhere service.
- Pay on delivery.

Use:
- `expected`
- `estimated`
- `pilot`
- `launch corridors`
- `where available`

## Error And Edge Copy
Decorative asset fallback:
- `Delivery path preview unavailable`
- `The page content is still available. You can continue to tracking, pricing, service areas, or support.`

Unavailable target route fallback:
- `This page is not available yet. You can still track a package or contact support.`

Support route fallback:
- `Support is not available from this link right now. Try again or use the support page from the footer.`

## Testing Contract
### Unit Or Component Tests
Required assertions:
- Renders exactly one H1.
- Renders all required sections in order.
- Header desktop nav links point to correct routes.
- Hero primary CTA points to `/track`.
- Service area CTA points to `/service-areas`.
- Pricing CTA points to `/pricing`.
- Trust CTA points to `/trust-and-custody`.
- FAQ accordion toggles with keyboard.
- Degraded asset state hides broken visual and preserves CTAs.

### E2E Tests
Test name: `public_landing_primary_navigation`
- Visit `/`.
- Assert `screen-public-landing` is visible.
- Click hero `Track a package`.
- Assert browser navigates to `/track`.

Test name: `public_landing_mobile_menu`
- Set mobile viewport.
- Open mobile menu.
- Assert focus is inside menu.
- Click `Pricing`.
- Assert browser navigates to `/pricing`.

Test name: `public_landing_content_trust`
- Visit `/`.
- Assert launch cities, corridors, doorstep radius, and proof requirement are visible.
- Assert no guaranteed-delivery language appears.

Test name: `public_landing_degraded_assets`
- Simulate optional asset load failure.
- Assert `state-public-landing-degraded-assets` is visible.
- Assert navigation and CTAs still work.

## Acceptance Criteria
The screen is complete only when:
- It renders at `/` without authentication.
- It includes every section in the required IA order.
- It uses the exact approved route targets and primary test IDs.
- It does not include fake live data, fake counters, placeholder links, or demo forms.
- It explains stations, launch corridors, package scans, payment gate, tracking, receiver proof, support, and policy in customer-safe language.
- It passes responsive checks across the viewport matrix.
- It passes accessibility checks for keyboard, focus, headings, color contrast, and reduced motion.
- It handles degraded marketing assets without breaking the page.
- It does not implement local pricing calculation.
- It does not implement tracking lookup inside the landing page.
- It does not expose internal IDs, staff data, provider data, audit data, or raw operational data.

## Spec Quality Review
This section must be reviewed before Claude Code treats the spec as implementation-ready.

### Top-Tier Product Standard
Status: `pass`

Review notes:
- The first viewport has one clear promise, one dominant action, and an operational proof object.
- The page structure avoids generic feature-grid marketing and instead explains route coverage, handoffs, proof, pricing, receiver access, and support policy.
- The visual direction is specific to Kra's station-and-corridor operating model.
- The copy avoids guaranteed-delivery claims, automatic compensation claims, and nationwide coverage claims.
- The page has a clear mobile simplification path instead of shrinking a desktop layout.

### Industry Inspiration Translation
Status: `pass`

Review notes:
- Stripe-inspired clarity is translated into a dense but controlled hero with a proof card, not copied styling.
- Shopify-inspired merchant framing appears in business use cases without turning the page into a merchant dashboard.
- Uber Courier-inspired practical delivery framing appears in action-led package movement and tracking CTAs.
- WCAG guidance is translated into concrete keyboard, focus, contrast, motion, landmark, and accordion requirements.

### Implementation Readiness
Status: `pass`

Review notes:
- The spec names each required section, component, route, CTA, test ID, state, copy block, and E2E expectation.
- The spec blocks demos, placeholder links, fake live data, fake counters, and local pricing calculation.
- The spec includes degraded asset behavior so the page remains usable if optional visuals fail.
- The spec gives Claude Code enough instruction to build the screen without asking product questions.

### Remaining Constraints
Status: `accepted`

Constraints:
- Final visual design quality still depends on Claude Code executing the art direction with taste and restraint.
- Real brand assets, logo artwork, and photography are not defined yet, so the implementation should use text wordmark, CSS primitives, and custom vector-like interface art rather than stock assets.
- If sender onboarding route is unavailable at implementation time, `Start delivery` must not become a fake form or dead link.

### Close Decision
Decision: `PublicLanding` spec is ready for implementation and can be closed as the first screen spec.

## Claude Code Build Notes
- Build the UI seriously and production-ready, but do not invent backend routes or fake dynamic data.
- Prefer precise layout, strong hierarchy, and calm motion over decorative complexity.
- Keep the page fast on mobile.
- If any target route is missing, create the route shell only if that is part of the active task; otherwise keep the link target correct and let routing fail tests until the route is implemented.
- Do not add sample packages, sample customer names, mock live deliveries, or demo dashboards.
- Do not create a marketing page that contradicts delivery, pricing, refund, station, or custody rules.

## Reference Links Used For Design Context
- `https://www.stripe.com/`
- `https://www.shopify.com/`
- `https://www.uber.com/us/en/item-delivery/`
- `https://www.w3.org/WAI/WCAG22/quickref/`
