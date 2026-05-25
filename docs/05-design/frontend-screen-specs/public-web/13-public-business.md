# Public Business Screen Spec

## Screen Contract

| Field              | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Screen ID          | `PublicBusiness`                                                                        |
| App                | `apps/web`                                                                              |
| Route              | `/business`                                                                             |
| Primary test ID    | `screen-public-business`                                                                |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                           |
| Build priority     | `P1 Operational Completeness`                                                           |
| Backend dependency | none for v1; business inquiry routes through public support contact until API exists    |
| Related routes     | `/`, `/how-it-works`, `/service-areas`, `/coverage`, `/pricing`, `/support`, `/terms`   |
| Required states    | `normal`, `degraded_marketing_asset_load`, `support_unavailable`, `reduced_motion_mode` |

## Product Job

This page explains how Kra works for repeat senders, small merchants, pharmacies, repair shops, document runners, and local businesses that need accountable intercity delivery without building their own logistics operation.

The page must answer:

- What business senders get from Kra.
- Which business use cases fit v1.
- Which business use cases are outside v1.
- How station drop-off, payment confirmation, custody scans, tracking, and proof protect business shipments.
- How repeat senders can start without a separate enterprise portal.
- What Kra will not promise before the backend supports it.

The page must convert serious business senders into the next safe action: start a delivery flow if available, or contact support with business intent.

## Audience

Primary audience:

- Small merchants sending paid customer orders across launch corridors.
- Repair shops sending devices or parts between cities.
- Pharmacies and clinics sending non-emergency approved items where policy allows.
- Offices sending documents or internal packages.
- Repeat senders comparing Kra to informal bus, rider, or friend-based delivery.

Secondary audience:

- Operations leads checking public promises against actual station and custody policy.
- Support staff using public copy to answer business sender questions.
- Finance admins verifying pricing, refund, and payment copy does not overpromise.
- Claude Code implementing the public business page.

## User State

Business visitors are pragmatic. They care about delivery reliability, proof, repeatability, price clarity, and escalation paths. They do not need abstract brand claims; they need to know whether Kra can reduce package loss, reduce customer support pressure, and make delivery status easier to explain.

The page must respect that the user may be skeptical because informal delivery already exists and is cheaper in some cases. Kra must compete on accountability, tracking, custody evidence, station discipline, and payment controls rather than vague speed claims.

## Primary Action

Primary CTA: `Start a business delivery`

Secondary CTA: `Talk to support`

Tertiary CTA: `See covered routes`

CTA behavior:

- `Start a business delivery` routes to the sender app entry or create-delivery entry when enabled.
- If the sender app entry is unavailable on web, route to `/support?intent=business_delivery`.
- `Talk to support` routes to `/support?intent=business`.
- `See covered routes` routes to `/service-areas`.
- No CTA can imply enterprise invoicing, merchant account approval, bulk API access, or guaranteed credit terms in v1.

## Visual Thesis

Design this page as a serious operating manual for business delivery, with the polish of a premium logistics product and the clarity of a public service page. The visual feel should be structured, confident, and evidence-led: route lines, custody checkpoints, business use cases, and proof outcomes should carry the page more than decorative hero art.

## Restraint Rule

Do not use generic warehouse photos, unapproved merchant logos, invented testimonials, speculative volume discounts, enterprise-dashboard imagery, or map animation that implies nationwide coverage. The page must feel operationally real.

## Research Inputs

Use these principles without copying layout:

- GOV.UK interface writing guidance: use user language, clear labels, and direct action copy.
- GOV.UK service navigation guidance: help users understand where they are and where to go next.
- W3C WCAG 2.2: preserve section headings, focus visibility, readable labels, and non-pointer access.
- NN/g company and navigation research: make key facts scannable and use familiar navigation labels.

## Page Information Architecture

1. Hero: business outcome, launch scope, and primary CTA.
2. Fit cards: which business deliveries Kra is built for.
3. Operating chain: sender to station to driver to destination station to receiver.
4. Accountability proof: payment, scan, custody, timeline, issue, refund, and receipt.
5. Coverage and service limits: corridors, station model, doorstep rule, unsupported cases.
6. Pricing and payment: backend quote authority and payment-before-dispatch rule.
7. Support path: how business senders ask for help.
8. FAQ: honest answers before signup.
9. Closing CTA: start delivery or contact support.

## Hero Requirements

Hero headline:

`Delivery accountability for serious local businesses`

Hero body must explain:

- Kra helps business senders move packages through a station-based delivery chain.
- Every critical handoff is scan-backed.
- Payment must be confirmed before transport.
- Receiver tracking and proof reduce status confusion.
- Launch coverage is controlled by approved routes and station readiness.

Hero CTAs:

- Primary: `Start a business delivery`
- Secondary: `Check coverage`

Hero trust row must include:

- `Scan-backed custody`
- `Payment-before-dispatch`
- `Receiver-safe tracking`
- `Issue and refund review`

Hero must not include:

- `same-day everywhere`
- `nationwide`
- `guaranteed delivery time`
- `business credit`
- `merchant portal`
- `bulk API`

## Business Fit Section

Fit cards must include:

| Use Case             | Required Copy                                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| Retail orders        | Good for paid customer packages moving between launch corridors.              |
| Documents            | Good for office, legal, school, and internal documents that need tracking.    |
| Repair and parts     | Good for devices, parts, and accessories when packaging policy allows.        |
| Pharmacy or clinic   | Good only for approved non-emergency items that meet legal and policy limits. |
| Repeat local senders | Good for predictable station drop-off and receiver tracking.                  |

Each card must include:

- Use-case title.
- One-sentence fit statement.
- One custody or proof benefit.
- One limitation where relevant.

## Unsupported Business Claims

The page must clearly state that v1 does not provide:

- Enterprise invoicing.
- Business credit terms.
- Dedicated merchant dashboard.
- API integration.
- Insurance product.
- Cross-border delivery.
- Cold-chain delivery.
- Medical emergency transport.
- Warehousing or inventory management.

Unsupported items must appear as honest limits, not as a negative wall. The copy should explain that Kra is choosing operational discipline before breadth.

## Operating Chain Section

Show the chain as five steps:

1. Sender creates delivery and receives backend quote.
2. Sender pays through supported provider.
3. Origin station confirms intake and label binding.
4. Driver transports between stations with custody evidence.
5. Destination station or courier completes receiver handoff with proof.

Each step must include:

- Actor.
- Evidence produced.
- What the business sender can see.
- What happens if the step is blocked.

The section must not imply live vehicle location unless a verified route/location contract exists.

## Accountability Section

Required modules:

- `Quote authority`: backend quote locks delivery amount.
- `Payment gate`: package cannot move to transport until payment is confirmed.
- `Scan evidence`: package label scan validates handoffs.
- `Timeline`: sender sees delivery lifecycle status.
- `Proof`: receiver OTP, signature, or photo proof can complete delivery depending on policy.
- `Issue path`: support issues create a structured record.
- `Refund path`: refund review follows the policy, evidence, and finance workflow.

Each module must include a direct link to the relevant public page when available:

- Pricing: `/pricing`
- Trust and custody: `/trust-and-custody`
- Delivery policy: `/delivery-policy`
- Refund policy: `/refund-policy`
- Support: `/support`

## Coverage And Service Limits

Coverage copy must route users to:

- `/coverage` for coverage model.
- `/service-areas` for specific approved station and corridor information.

Required statements:

- Coverage is route and station based.
- Doorstep delivery depends on destination station serviceability and distance policy.
- A route being listed does not guarantee every address is serviceable.
- If a route is unavailable, users should contact support or wait for expansion.

## Pricing And Payment Rules

The page must state:

- Price is calculated by backend quote rules.
- Public pages do not calculate final prices.
- Sender must review the quote before payment.
- Payment must be confirmed before dispatch.
- Failed or under-review payments block transport.
- Refund eligibility follows refund policy and evidence review.

Do not show a price calculator unless it calls an approved backend quote endpoint. Since no quote-only endpoint exists, the page must not present interactive quote math in v1.

## Support Path

The support section must include:

- Business intent preselection when routing to `/support?intent=business`.
- Required details for useful support: route, package type, sending frequency, station preference, and timing needs.
- Privacy copy: do not put receiver OTP, payment PIN, or sensitive package contents in public support messages.

If support is unavailable:

- Show a calm unavailable state.
- Preserve the business intent if the user retries.
- Provide non-sensitive next steps.

## Content Tone

Tone rules:

- Concrete over inspirational.
- Evidence over promises.
- Useful limits over vague ambition.
- Africa delivery focus without claiming continental coverage.
- Business value without enterprise SaaS language unless that product exists.

Use words like:

- `route`
- `station`
- `handoff`
- `proof`
- `tracking`
- `payment confirmation`
- `support record`

Avoid words like:

- `nationwide`
- `instant`
- `guaranteed`
- `AI-powered logistics`
- `fully automated`
- `enterprise-grade portal`

## Visual System Rules

Layout:

- Desktop uses a strong two-column hero: message and operating proof rail.
- Mobile stacks hero, CTAs, and proof rail in that order.
- Use route-line motifs sparingly to show custody movement.
- Use business fit cards only where each card carries a real decision.
- Use evidence panels instead of decorative icon grids.

Color:

- Use public web design tokens only.
- Use one primary accent for action and one operational accent for proof.
- Do not introduce business-page-only colors.

Typography:

- Use design-system type tokens.
- Hero headline must be concise enough to wrap cleanly on small phones.
- Body copy must stay scannable.

Motion:

- Use a single entrance reveal for the operating chain.
- Disable non-essential motion under reduced motion.
- No looping package, vehicle, or map animations.

## Accessibility Requirements

The page must:

- Use one `h1`.
- Use ordered lists for process steps.
- Use semantic sections with visible headings.
- Preserve visible focus states.
- Keep CTA labels unique and descriptive.
- Provide text alternatives only for informative visuals.
- Avoid communicating route status by color alone.
- Keep support intent controls keyboard accessible.
- Respect reduced motion.
- Maintain readable line length at desktop width.

## SEO Requirements

Page title:

`Business Delivery For Local Senders | Kra`

Meta description:

`Kra helps local businesses send packages through scan-backed station delivery, payment confirmation, receiver tracking, and proof-based handoff.`

Canonical URL:

`/business`

Structured content must include:

- Business delivery use cases.
- Station delivery model.
- Coverage limitations.
- Support contact route.

## Analytics Events

Required events:

| Event Name                     | Trigger                         | Properties                                        |
| ------------------------------ | ------------------------------- | ------------------------------------------------- |
| `public_business_viewed`       | page view                       | `route`, `surface`                                |
| `public_business_cta_clicked`  | primary or secondary CTA click  | `cta`, `destination`, `businessIntent`            |
| `public_business_fit_expanded` | user expands a business fit row | `useCase`                                         |
| `public_business_support`      | support CTA click               | `intent`, `sourceRoute`                           |
| `public_business_policy_open`  | policy link clicked             | `policyRoute`, `sourceSection`, `businessUseCase` |

Analytics must not capture receiver phone, business customer names, package contents, payment references, or free-text support descriptions.

## Test Requirements

Unit and component tests:

- Renders root with `screen-public-business`.
- Primary CTA routes according to configured sender entry availability.
- Support CTA appends business intent.
- Unsupported claims section renders.
- Pricing section contains no local price calculator.
- Reduced-motion mode disables chain animation.
- All policy links have accessible names.

Accessibility tests:

- One `h1`.
- Landmark structure exists.
- Keyboard reaches every CTA.
- Focus indicators visible.
- Use-case cards expose expanded state where expandable.
- Text contrast passes token thresholds.

End-to-end checks:

- Visitor opens `/business`.
- Visitor opens coverage from the business page.
- Visitor opens support with business intent.
- Visitor can reach pricing, delivery policy, refund policy, and trust/custody pages.
- No restricted delivery, payment, station, or user data renders.

## Final Implementation Decisions

`/business` is a public marketing and education page, not a merchant portal. It must not create business accounts, calculate prices, promise volume discounts, or imply enterprise invoicing.

Business inquiry submission routes through public support until a dedicated backend contract exists.

Coverage, pricing, custody, and refund claims must link to the canonical public policy pages instead of repeating conflicting policy details.

## Definition Of Done

The screen is complete when:

- It renders at `/business`.
- It exposes `screen-public-business`.
- It is listed in the public web inventory and exact route map.
- It routes to sender entry or support according to configured availability.
- It explains fit, limits, pricing authority, payment gating, custody evidence, and support path.
- It avoids unsupported enterprise, invoicing, coverage, SLA, and automation claims.
- It passes accessibility, responsive, SEO, analytics, and policy-link tests.

## Final Build Instruction

Build `PublicBusiness` as Kra's public business-sender education page. It must feel premium and commercially serious, but every claim must stay inside v1 operational truth: station-based routes, backend quote authority, payment-before-dispatch, scan-backed custody, receiver-safe tracking, and support-led business inquiry.
