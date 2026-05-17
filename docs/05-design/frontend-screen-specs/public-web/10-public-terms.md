# Public Terms Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicTerms` |
| App | `apps/web` |
| Route | `/terms` |
| Primary test ID | `screen-public-terms` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/track`, `/support`, `/pricing`, `/service-areas`, `/delivery-policy`, `/refund-policy`, `/privacy` |
| Required states | `normal` |

## Product Job
This page must publish Kra's public terms in customer-readable language. It must explain what service Kra provides, where the service is available, what senders and receivers are responsible for, how payment and pricing work, what custody and proof mean, when cancellation/refund/dispute rules apply, how privacy policy connects, and what users must not do.

The page must help users understand:
- Kra v1 is a station-and-route delivery service, not an everywhere-to-everywhere logistics promise.
- Launch service is limited to approved stations, corridors, and doorstep zones.
- Payment must be confirmed before transport.
- Pay on delivery is not supported in v1.
- Sender must provide accurate package, receiver, payment, and delivery details.
- Receiver cannot unilaterally cancel the sender's service contract.
- Receiver refusal creates issue review, not automatic cancellation.
- Custody transfers only after required scan/proof confirmation.
- Assignment does not equal custody.
- Final delivery requires accepted receiver proof.
- Doorstep delivery is available only where serviceable and within policy limits.
- Failed doorstep attempt, pickup hold, and return-to-sender rules follow delivery policy.
- Cancellation and refund outcomes follow cancellation and refund policy.
- Data handling follows privacy policy.
- Support issues should tie to delivery or payment records where possible.
- No page or UI can promise guaranteed arrival, automatic compensation, or insurance-backed outcomes unless policy changes.

This page is the implementation-ready baseline for the public terms surface. Formal legal copy may replace the text later, but the frontend must preserve these product boundaries unless the product docs change.

## Audience
Primary audience:
- Senders preparing to create and pay for deliveries.

Secondary audience:
- Receivers using tracking links or pickup/doorstep delivery.
- Business senders evaluating operational accountability.
- Support, finance, and operations staff checking public rules against backend policy.
- Visitors reviewing Kra before trusting the service.

## User State
Users may skim terms before sending, after a failed attempt, during a refund question, or when a support issue escalates. They want clear obligations, not dense legal fog. The page must be readable enough for normal users and precise enough to avoid dangerous product promises.

## Primary Action
Primary CTA: `Track a package`

Secondary CTA: `Contact support`

Tertiary CTA: `Read refund policy`

CTA behavior:
- `Track a package` routes to `/track`.
- `Contact support` routes to `/support`.
- `Read refund policy` routes to `/refund-policy`.

## Main Tension
Terms must protect Kra's operational model without sounding hostile or evasive. The page must be clear about limits, payment, serviceability, proof, and disputes while still helping good users understand what happens next.

## Visual Thesis
Design this page as an operational agreement in plain language: serious, structured, easy to scan, and connected to policy pages. It should feel like a premium logistics terms center, not a copied legal document.

## Restraint Rule
Do not create a dense legal wall. Avoid vague legalese, decorative law icons, invented seals, unsupported guarantee language, and buried critical rules.

Every visual element must help one of these:
- Explain service scope.
- Clarify user responsibility.
- Show payment and cancellation rules.
- Explain custody/proof.
- Route to related policy.
- Prevent false expectations.
- Support accessibility and comprehension.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of public terms, trust-center, logistics, marketplace, and fintech policy pages.

Non-negotiable quality requirements:
- The first viewport must explain that these terms govern Kra delivery use and link to tracking/support.
- Service scope must be visible before long obligations.
- Payment-before-transport and no pay-on-delivery must be explicit.
- Sender and receiver responsibilities must be visually distinct.
- Custody, scan, and proof rules must be explicit.
- Cancellation, refund, delivery policy, and privacy links must be visible before FAQ.
- The page must not imply guaranteed delivery time.
- The page must not promise automatic compensation or insurance-backed outcome.
- The page must not expose internal IDs, provider references, audit records, staff IDs, proof asset IDs, or backend errors.
- The page must work on mobile without table overflow.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, and large text.

Closure rule:
- If a sender cannot understand their payment and package responsibilities, the screen remains open.
- If a receiver can think refusal cancels the service automatically, the screen remains open.
- If service limits are buried below legal copy, the screen remains open.
- If the page reads like generic copied terms instead of Kra's operating model, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- GOV.UK service/content guidance: terms and public policy pages should use plain language, direct headings, and task-oriented structure.
- FTC online disclosure guidance: important conditions should be clear, visible, and not hidden behind confusing presentation.
- UNCTAD consumer protection guidance: public consumer terms should support transparency, fair treatment, and accessible information.
- GOV.UK refund guidance: refund and returns expectations should be explicit and connected to user action.
- W3C WCAG 2.2 quick reference: long policy pages, links, accordions, tables, and navigation aids must remain accessible.

Reference links:
- https://www.gov.uk/service-manual/design/writing-for-user-interfaces
- https://www.ftc.gov/business-guidance/resources/advertising-marketing-internet-rules-road
- https://unctad.org/topic/competition-and-consumer-protection/un-guidelines-for-consumer-protection
- https://www.gov.uk/accepting-returns-and-giving-refunds
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external legal language, legal clauses, page layout, disclosure wording, illustrations, icons, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- What is Kra's v1 service?
- Where is the service available?
- What must the sender do?
- What can the receiver do?
- When is payment required?
- Does Kra support pay on delivery?
- How does custody transfer?
- What proof is needed?
- What happens if doorstep delivery fails?
- When can I cancel?
- Where do refund and dispute rules live?
- What privacy policy applies?
- What behavior is prohibited?
- Where can I get support?

## Route And Navigation Rules
### Route
- Render at `/terms`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not create account state.
- Must not collect acceptance on this page unless the product implements a real terms acceptance flow elsewhere.
- Must not include jurisdiction-specific legal clauses that are not approved in local docs.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- No primary top-level nav item must be active unless the public navigation includes `Terms`.
- If nested under footer policy links, breadcrumb/current page should show `Terms`.

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
- Shared public mobile header.
- `Terms` must remain reachable from the mobile menu or footer.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Terms.
- Privacy.
- Refund policy.
- Delivery policy.
- Support.
- Tracking.
- Pricing.
- Service areas.

## Page IA
Render sections in this exact order:

1. `PublicTermsHeader`
2. `PublicTermsHero`
3. `PublicTermsSummary`
4. `PublicTermsServiceScope`
5. `PublicTermsUserResponsibilities`
6. `PublicTermsPaymentPricing`
7. `PublicTermsPackageAndServiceRules`
8. `PublicTermsCustodyProof`
9. `PublicTermsCancellationRefundDispute`
10. `PublicTermsPrivacyData`
11. `PublicTermsSupportAndMisuse`
12. `PublicTermsPolicyLinks`
13. `PublicTermsFaq`
14. `PublicTermsFinalCta`
15. `PublicTermsFooter`

Do not place FAQ before service scope and responsibilities.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `520px`.
- Section spacing: `80px`.
- Use a sticky in-page section nav only if it does not cover content and remains keyboard accessible.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Responsibility cards can use two columns.
- Policy links should wrap cleanly.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- In-page nav becomes a horizontal scroll-free list or simple jump menu.
- Responsibility, payment, custody, and policy cards stack.
- No horizontal scroll.

## Visual System Direction
Follow the public web design language from prior specs while moving toward contract clarity.

Recommended art direction:
- Background: warm neutral with subtle document-grid texture.
- Primary accent: trust green for accepted/allowed obligations.
- Secondary accent: charcoal or deep blue for rules and definitions.
- Amber: review, exception, and policy-bound actions.
- Red: prohibited behavior or unsupported expectations only.
- Visual motifs: agreement map, service boundary, responsibility ledger, proof chain, linked policy cards.

Do not use:
- courthouse or gavel imagery
- invented compliance badges
- generic lock shield as main visual
- dense legal paragraphs without structure
- red-heavy threat styling
- decorative money or map art that implies guarantees

## Copy System
### Voice
- Direct.
- Operational.
- Fair.
- Plain-language.
- Serious.
- Low-hype.

### Forbidden Copy
Do not use:
- `guaranteed delivery`
- `always on time`
- `automatic compensation`
- `insured by default`
- `pay on delivery`
- `no responsibility`
- `unlimited liability`
- `doorstep everywhere`
- `delete anytime`
- `live GPS tracking`
- `receiver can cancel`

### Required Terms
Use these terms consistently:
- `sender`
- `receiver`
- `delivery`
- `package`
- `tracking code`
- `station`
- `handoff`
- `proof`
- `payment`
- `refund review`
- `dispute review`
- `support request`
- `service area`
- `doorstep delivery`
- `return-to-sender`

### Plain-Language Rule
Use customer-facing labels before internal terms.

Internal: `awaiting_receiver_pickup`

Public: `Ready for pickup`

Internal: `payment_status=paid`

Public: `Payment confirmed`

Internal: `delivery_failed`

Public: `Failed delivery after review`

## Terms Content Model
### Public Terms Baseline
The page must include these top-level topics:

1. Service scope.
2. Account and access.
3. Sender responsibility.
4. Receiver access and refusal.
5. Pricing and payment.
6. Package/service eligibility.
7. Custody, scans, and proof.
8. Doorstep delivery and failed attempts.
9. Cancellation.
10. Refunds and disputes.
11. Privacy and data.
12. Support.
13. Prohibited misuse.
14. Policy changes.

### Required Cross-Links
Include these policy links in the content and final policy section:
- `/service-areas`
- `/pricing`
- `/delivery-policy`
- `/refund-policy`
- `/privacy`
- `/support`
- `/track`

Do not duplicate every detail from related policy pages when a linked policy page is the source of truth. Summarize and link.

## Component Specifications
### `PublicTermsHero`
Purpose:
- Establish what the terms govern and route users to tracking or support.

Layout:
- Two-column desktop hero.
- Left column: eyebrow, headline, subheadline, CTA row, effective-date note.
- Right column: terms map visual showing `Service`, `Payment`, `Custody`, `Proof`, `Support`.
- Mobile: content first, visual second.

Required copy:
- Eyebrow: `Terms of service`
- Headline: `The operating rules for using Kra delivery.`
- Subheadline: `These terms explain how Kra's station-based delivery service works, what senders and receivers are responsible for, when payment is required, and which policies apply when something needs review.`
- Primary CTA: `Track a package`
- Secondary CTA: `Contact support`
- Effective note: `These public terms are the active product baseline for the v1 pilot.`

Visual requirements:
- Terms map must use real text labels.
- Do not show legal seals or court imagery.

### `PublicTermsSummary`
Purpose:
- Give the top five rules before the full terms.

Layout:
- Five compact rule cards.

Cards:
1. `Service is route-based`
   - Body: `Kra v1 serves approved launch stations, corridors, and doorstep zones.`
2. `Payment before transport`
   - Body: `A package cannot enter transport until payment is confirmed.`
3. `Sender details must be accurate`
   - Body: `Sender-provided package, receiver, and address details affect delivery and refund outcomes.`
4. `Proof completes the job`
   - Body: `Custody and delivery require scan, handoff, OTP, signature, or photo proof where policy requires it.`
5. `Policy review decides exceptions`
   - Body: `Refunds, refusals, damage, loss, and late-stage cancellations follow support or dispute review.`

### `PublicTermsServiceScope`
Purpose:
- Explain what Kra provides and what is outside v1.

Required content:
- `Kra operates a station-and-route delivery network.`
- `V1 launch corridors are Accra Central, Kumasi Adum, and Tamale Central station pairs.`
- `Doorstep delivery is available only within 10km of the destination station in launch cities and only where final-mile completion can be controlled.`
- `Partner-operated station logic is deferred until after pilot stabilization.`
- `Kra does not promise service everywhere.`
- `Kra does not provide dynamic marketplace courier matching in v1.`
- `Kra does not provide enterprise billing or custom invoicing in v1.`

Required linked CTA:
- `Check service areas` -> `/service-areas`

Design:
- Use a service boundary card with allowed and not-in-v1 columns.
- Include launch stations as visible chips:
  - `Accra Central`
  - `Kumasi Adum`
  - `Tamale Central`

### `PublicTermsUserResponsibilities`
Purpose:
- Separate sender and receiver responsibilities.

Layout:
- Two main cards:
  - `Sender responsibilities`
  - `Receiver responsibilities`

Sender responsibilities:
- Provide accurate receiver name and phone.
- Provide usable address or landmark instructions when doorstep delivery is requested.
- Provide accurate package description, size, weight estimate, fragile flag, and declared value where required.
- Pay the final quote before transport.
- Present the package for origin intake.
- Avoid prohibited, illegal, unsafe, or misrepresented items.
- Keep tracking, receipt, and support information available.
- Open support promptly when a package, payment, or proof issue occurs.

Receiver responsibilities:
- Use delivery-scoped tracking access responsibly.
- Complete phone verification when required for sensitive receiver actions.
- Be available for pickup or doorstep proof when needed.
- Provide OTP, signature, or accepted proof only when receiving the package.
- Refuse delivery only when appropriate; refusal creates review, not automatic cancellation.
- Do not misuse tracking links or attempt to access another person's delivery.

Required note:
`A receiver cannot unilaterally cancel the sender's original service contract. Receiver refusal creates an issue workflow for station review.`

### `PublicTermsPaymentPricing`
Purpose:
- Explain price, payment, and quote authority.

Required content:
- `The sender sees a final quoted amount before payment.`
- `Payment-processing cost is absorbed into the public quote in v1 and is not shown as a separate fee line.`
- `Payment must be confirmed before transport.`
- `Pay on delivery is not supported in v1.`
- `Ad hoc bargaining inside the app is not supported.`
- `Delivery quotes store the final amount at booking time, so later route-price changes do not mutate existing payment obligations.`
- `Non-emergency price changes require 7 calendar days notice before going live.`

Required linked CTA:
- `Read pricing` -> `/pricing`

Do not include a pricing calculator on this page.

### `PublicTermsPackageAndServiceRules`
Purpose:
- Explain package and service eligibility.

Required content:
- `V1 supports exactly one package per delivery.`
- `Package details must match the item accepted at origin intake.`
- `Fragile items require fragile handling rules, intake photo, and destination condition check where configured.`
- `Declared value above GHS 2,000 requires manual operator approval in v1.`
- `Declared value above GHS 5,000 is not accepted through self-serve v1.`
- `Oversized and over-20kg deliveries are manual quote only or unavailable in self-serve v1 depending on policy.`
- `Doorstep above 10km from the destination station is not available in v1.`

Prohibited item baseline:
- `Users must not send illegal, unsafe, hazardous, stolen, counterfeit, or intentionally misdeclared items.`
- `Kra may refuse, hold, or escalate a package when the package description, condition, legality, safety, or payment status creates a risk.`

Do not build a full prohibited-items legal list unless product/legal creates that source file later. The UI should use the baseline above and route unclear cases to support.

### `PublicTermsCustodyProof`
Purpose:
- Make the loss-prevention operating model contractual and public.

Required content:
- `No handoff should rely on memory, paper alone, or verbal confirmation.`
- `Origin intake reserves the package scan code for one delivery only.`
- `Later scans must match the registered package label before handoff can proceed.`
- `Assignment is not custody.`
- `Station dispatch does not transfer custody by itself.`
- `Custody transfers when the receiving party confirms with the registered package scan code or accepted receiver proof.`
- `Final delivery requires courier confirmation plus one strong receiver proof method.`
- `If proof is missing, the handoff remains operationally incomplete and should trigger review rather than silent success.`
- `The last fully confirmed custodian remains accountable by default.`

Required linked CTA:
- `Read trust and custody` -> `/trust-and-custody`

Design:
- Use a five-step handoff rail:
  1. `Sender to origin station`
  2. `Origin station to driver`
  3. `Driver to destination station`
  4. `Destination station to courier`
  5. `Courier to receiver`

### `PublicTermsDoorstepAndDeliveryRules`
Purpose:
- Explain delivery attempt and pickup expectations in terms context.

This can be a subsection inside `PublicTermsCustodyProof` or its own internal block.

Required content:
- `Doorstep delivery requires destination-station receipt, serviceable address, paid doorstep surcharge, receiver phone, and courier assignment.`
- `One doorstep reattempt is allowed within 24 hours of the first failed attempt.`
- `After the second failed doorstep attempt, the package returns to destination-station pickup.`
- `A package may remain ready for pickup for 72 hours before being flagged on hold.`
- `After 7 calendar days unclaimed, the package becomes eligible for return-to-sender.`
- `Return-to-sender is created as a linked new delivery on the same corridor at the standard base route fee, prepaid before dispatch.`

Required linked CTA:
- `Read delivery policy` -> `/delivery-policy`

### `PublicTermsCancellationRefundDispute`
Purpose:
- Summarize cancellation, refund, and dispute rules without duplicating the policy page.

Required content:
- `Before origin intake, eligible sender cancellation can be self-service and fully voided or refunded.`
- `After origin intake but before dispatch, cancellation requires operator confirmation and refund is amount collected minus the GHS 5 handling fee.`
- `After dispatch, cancellation is an exception workflow that requires admin review.`
- `No automatic full refund applies after dispatch.`
- `Receiver refusal creates issue review rather than direct cancellation.`
- `Customers may open a dispute within 7 calendar days of delivery completion, pickup-hold notification, or refund completion attempt.`
- `Standard complete-evidence disputes target resolution within 5 business days.`
- `Complex loss, damage, or provider-settlement disputes may extend to 10 business days with admin approval and a case note.`
- `Confirmed total loss under verified Kra custody can include delivery-charge refund and compensation review up to declared value, capped at GHS 2,000 in standard v1.`
- `Damage claims require manual review and do not create automatic compensation in v1.`

Required linked CTA:
- `Read refund policy` -> `/refund-policy`

### `PublicTermsPrivacyData`
Purpose:
- Link terms to privacy and data handling.

Required content:
- `Kra stores data needed to move packages, confirm payment, resolve issues, and maintain accountability.`
- `Customer data is not used for unrelated marketing automation in the pilot.`
- `Public tracking shows receiver-safe delivery progress and does not show internal notes, staff IDs, precise live GPS trails, payment internals, refund reasoning, raw proof photos, or signatures.`
- `Data retention follows the privacy policy.`
- `Deletion requests are reviewed against dispute, audit, and payment-retention obligations.`

Required linked CTA:
- `Read privacy policy` -> `/privacy`

### `PublicTermsSupportAndMisuse`
Purpose:
- Explain support and prohibited misuse.

Support content:
- `Support should be delivery-centric. Significant support interactions should tie back to a delivery or payment record when possible.`
- `Launch support channels include in-app support for senders, delivery-linked support for receivers, WhatsApp support line, and phone escalation for urgent P1 issues.`
- `Support hours are 07:00-19:00 daily.`
- `Payment and refund review owner is finance_admin.`
- `Lost package and operational issue owner is ops_admin.`

Public wording must not expose internal role IDs directly in customer copy. Use:
- `finance review team`
- `operations review team`
- `support team`

Misuse rules:
- Do not submit false delivery, damage, loss, payment, or refund claims.
- Do not misuse tracking links or phone verification.
- Do not attempt to access another user's delivery.
- Do not harass staff, couriers, station operators, senders, or receivers.
- Do not interfere with handoff, scan, proof, or payment verification.
- Do not upload harmful files or content as proof.
- Do not send illegal, unsafe, hazardous, stolen, counterfeit, or intentionally misdeclared items.

Required linked CTA:
- `Contact support` -> `/support`

### `PublicTermsPolicyLinks`
Purpose:
- Provide a clear policy hub at the end of the terms.

Required cards:
- `Service areas` -> `/service-areas`
- `Pricing` -> `/pricing`
- `Delivery policy` -> `/delivery-policy`
- `Refund policy` -> `/refund-policy`
- `Privacy` -> `/privacy`
- `Support` -> `/support`
- `Track package` -> `/track`

Each card must include one sentence explaining why the user might open it.

## FAQ Content
### Required Questions
Render these questions in this order:

1. `What service does Kra provide?`
2. `Can I use Kra outside the listed service areas?`
3. `Can I pay on delivery?`
4. `Can a receiver cancel my delivery?`
5. `When does Kra take custody of a package?`
6. `What proof is needed to complete delivery?`
7. `What happens after a failed doorstep attempt?`
8. `Can I cancel after the package is dispatched?`
9. `Are refunds automatic?`
10. `How does Kra handle my data?`

### Required Answers
Question: `What service does Kra provide?`

Answer: `Kra v1 provides station-and-route package delivery across approved launch corridors, with controlled handoffs, tracking, payment discipline, support, and proof at completion.`

Question: `Can I use Kra outside the listed service areas?`

Answer: `Not by default. Kra v1 is limited to approved launch stations, corridors, and doorstep zones. Check service areas before creating a delivery.`

Question: `Can I pay on delivery?`

Answer: `No. Pay on delivery is not supported in v1. Payment must be confirmed before a package enters transport.`

Question: `Can a receiver cancel my delivery?`

Answer: `No. A receiver cannot unilaterally cancel the sender's original service contract. Receiver refusal creates an issue workflow for station review.`

Question: `When does Kra take custody of a package?`

Answer: `Custody changes only after required confirmation. Assignment is not custody. Scan, handoff, or receiver proof must match the policy step.`

Question: `What proof is needed to complete delivery?`

Answer: `Final delivery requires courier confirmation plus accepted receiver proof, such as verified OTP, signature, or delivery photo where policy allows.`

Question: `What happens after a failed doorstep attempt?`

Answer: `One doorstep reattempt is allowed within 24 hours. After a second failed attempt, the package returns to destination-station pickup.`

Question: `Can I cancel after the package is dispatched?`

Answer: `After dispatch, cancellation is an exception workflow that requires admin review. No automatic full refund applies after dispatch.`

Question: `Are refunds automatic?`

Answer: `Some cases are eligible under policy, but refunds and compensation depend on timing, payment records, delivery events, handoff evidence, proof, and review.`

Question: `How does Kra handle my data?`

Answer: `Kra stores data needed to move packages, confirm payment, resolve issues, and maintain accountability. Privacy and retention rules are published in the privacy policy.`

## Final CTA
Component: `PublicTermsFinalCta`

Purpose:
- Route terms readers to the most likely next action.

Required copy:
- Heading: `Need help with a delivery rule?`
- Body: `Track your package for current status, or contact support if your question is about payment, refusal, proof, refund, damage, loss, or account access.`
- Primary CTA: `Track a package`
- Secondary CTA: `Contact support`

Design:
- Calm and practical.
- Include policy chips linking to:
  - `Delivery policy`
  - `Refund policy`
  - `Privacy`

## State Requirements
### Normal
Must render:
- Header.
- Hero.
- Summary.
- Service scope.
- User responsibilities.
- Payment/pricing.
- Package/service rules.
- Custody/proof.
- Doorstep/delivery rules.
- Cancellation/refund/dispute.
- Privacy/data.
- Support/misuse.
- Policy links.
- FAQ.
- Final CTA.
- Footer.

### Degraded Marketing Asset Load
If decorative visuals fail:
- Content must remain fully readable.
- No layout shift larger than `0.1` CLS contribution.
- Visual panels may become plain cards.

### No Acceptance State
This page does not include:
- accept terms button
- terms consent checkbox
- account creation state
- payment state
- support submission state

Those belong to authenticated flows when implemented.

## Interaction Requirements
### In-Page Navigation
- Optional sticky section nav must be keyboard accessible.
- Current section indication must not rely on color alone.
- Mobile jump menu must not trap focus.

### CTA Interaction
- `Track a package` routes to `/track`.
- `Contact support` routes to `/support`.
- `Read refund policy` routes to `/refund-policy`.
- Related policy cards route to their declared links.
- Links preserve normal browser behavior.
- Visible focus required.

### FAQ Interaction
- FAQ may use accordions.
- FAQ must be keyboard accessible.
- Core terms must be visible outside FAQ.

### Motion
Allowed:
- Hero reveal.
- Section card reveal.
- Policy link hover/focus motion.

Rules:
- Motion must use transform and opacity.
- Duration: `180ms` to `420ms`.
- Respect `prefers-reduced-motion`.
- Do not animate legal-critical content in a way that delays reading.

## Accessibility Requirements
### Structure
- Use one `h1`.
- Maintain logical heading order.
- Use semantic sections.
- In-page nav links must have descriptive labels.

### Contrast
- Body text contrast at least WCAG AA.
- Warning/prohibited sections must meet contrast requirements.
- Do not use pale grey for legal-critical rules.

### Keyboard
- All links, accordions, menu controls, and jump links must be keyboard accessible.
- Focus state must be visible.
- Skip link should jump to main content.

### Screen Reader
- Decorative visuals must be `aria-hidden`.
- Policy cards must have real headings.
- Responsibility comparison must read in logical order.
- Tables, if used, must include headers.

### Large Text
- Page must survive `200%` browser zoom.
- Policy cards must wrap without clipping.
- CTA buttons must not overlap.

### Reduced Motion
- Disable staggered reveals.
- Keep content visible without waiting for animation.

## Responsive Requirements
### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px` to `1023px`
- Desktop: `1024px+`

### Mobile Rules
- Hero headline line length must stay controlled.
- Summary cards stack.
- Responsibility cards stack sender first, receiver second.
- Policy links stack.
- FAQ accordion hit areas must be touch-safe.
- No horizontal scroll.

### Desktop Rules
- Hero uses 12-column grid.
- Summary can use five compact cards across two rows.
- Service scope can use allowed/not-in-v1 columns.
- Responsibilities can use two balanced columns.
- Policy hub can use card grid.

## Data And Content Rules
### Static Terms Data
The page can define static terms content from docs:
- Service scope.
- Launch stations and corridors.
- Payment rules.
- Package/service limits.
- Handoff/proof rules.
- Doorstep/fail-attempt rules.
- Cancellation/refund/dispute summaries.
- Privacy summary.
- Support channels.
- Misuse rules.
- Policy links.

### No Live Data
The page must not load:
- user profile
- delivery record
- payment record
- support issue
- proof asset
- station capacity
- route availability API
- admin data

### No Sensitive Examples
Do not include illustrative personal data. No names, phone numbers, addresses, payment references, tracking codes, staff IDs, proof IDs, or audit IDs.

## Analytics Requirements
Track only privacy-safe public events:
- `public_terms_viewed`
- `public_terms_section_viewed`
- `public_terms_track_cta_clicked`
- `public_terms_support_cta_clicked`
- `public_terms_policy_link_clicked`
- `public_terms_faq_opened`

Event properties:
- `screen_id`
- `route`
- `section_id`
- `cta_id`
- `policy_link_id`
- `faq_question_id`

Do not track:
- user identity
- phone number
- address
- tracking code
- delivery ID
- payment reference
- support message
- proof content
- provider payload

## SEO Requirements
### Metadata
Title:
- `Terms of Service | Kra`

Description:
- `Read Kra's public service terms for delivery scope, sender and receiver responsibilities, payment, custody, proof, cancellation, refunds, privacy, and support.`

Canonical:
- `/terms`

### Open Graph
Title:
- `Kra Terms of Service`

Description:
- `The operating rules for using Kra delivery, including service areas, payment, package responsibility, handoffs, proof, refunds, privacy, and support.`

### Structured Content
- Use semantic sections and headings.
- FAQ structured data may be added only if product/legal approves and visible answers match exactly.
- Do not add structured data that implies legal warranties or guarantees beyond approved content.

## Performance Requirements
- Page must not require JavaScript to read the terms.
- Initial content should be server-renderable or statically renderable.
- Avoid heavy animation libraries.
- Use CSS for visual texture where possible.
- Decorative assets must be optimized and lazy-loaded.
- No third-party legal widget should be added for this page.

Targets:
- Largest Contentful Paint target: under `2.5s` on a mid-tier mobile device.
- Cumulative Layout Shift target: under `0.1`.
- Interaction to Next Paint target: under `200ms` for accordions, jump links, and CTA interactions.

## Security And Privacy Requirements
- Public page must not call authenticated APIs.
- Public page must not expose internal IDs or sensitive records.
- Public page must not collect terms acceptance.
- Public page must not embed unapproved trackers.
- Public page must not include real operational records.
- Public page must not expose security implementation secrets.

## Error Prevention Rules
The UI must prevent these misunderstandings:
- User thinks Kra delivers everywhere.
- User thinks pay on delivery is supported.
- User thinks assignment transfers custody.
- User thinks receiver refusal cancels the delivery automatically.
- User thinks refund is automatic after dispatch.
- User thinks damage creates automatic compensation.
- User thinks public tracking shows precise live GPS.
- User thinks terms page is a support request form.
- User thinks terms page replaces pricing, refund, delivery, or privacy policy.

Recommended copy qualifiers:
- `where available`
- `when serviceable`
- `if verified`
- `requires review`
- `not automatic`
- `policy-controlled`
- `delivery-scoped`

Avoid:
- `guaranteed`
- `always`
- `everywhere`
- `automatic`
- `insured`
- `live GPS`

## Testing Requirements
### Unit/Component Tests
Create tests that verify:
- Page renders `screen-public-terms`.
- Hero headline is visible.
- Primary CTA links to `/track`.
- Secondary CTA links to `/support`.
- Refund policy CTA links to `/refund-policy`.
- Service scope section renders.
- Sender responsibilities render.
- Receiver responsibilities render.
- Payment-before-transport rule renders.
- No pay-on-delivery rule renders.
- Custody/proof section renders.
- Assignment-is-not-custody rule renders.
- Doorstep 10km service limit renders.
- Failed-attempt `24 hours` rule renders.
- Pickup hold `72 hours` rule renders.
- Return-to-sender `7 calendar days` rule renders.
- Cancellation/refund/dispute section renders.
- Privacy/data section links to `/privacy`.
- Policy links render all required routes.
- Page does not render an acceptance form.
- Page does not call authenticated APIs.

### Accessibility Tests
Run automated checks for:
- No heading order violations.
- No unlabeled buttons.
- No inaccessible accordion controls.
- No low-contrast text.
- No keyboard traps.
- In-page navigation is keyboard reachable if used.

Manual keyboard checklist:
- Tab through header, jump links, CTAs, policy cards, FAQ, and footer.
- Activate every accordion with keyboard.
- Confirm focus order follows visual order.
- Confirm mobile menu close returns focus correctly.

### Visual Regression Tests
Capture:
- Desktop normal.
- Tablet normal.
- Mobile normal.
- Mobile with FAQ expanded.
- Sticky in-page nav if implemented.
- Reduced motion.
- High contrast mode where supported.

### Content Regression Tests
Assert the page does not include:
- `guaranteed delivery`
- `always on time`
- `automatic compensation`
- `insured by default`
- `doorstep everywhere`
- `unlimited liability`
- `live GPS tracking`
- `receiver can cancel` except in negative-rule context

### Policy Alignment Tests
Assert:
- Terms state launch service is route-and-station based.
- Terms state launch stations are Accra Central, Kumasi Adum, and Tamale Central.
- Terms state doorstep is limited to `10km`.
- Terms state payment must be confirmed before transport.
- Terms state pay on delivery is not supported.
- Terms state sender must provide accurate receiver and package information.
- Terms state receiver refusal creates issue review.
- Terms state assignment is not custody.
- Terms state final delivery requires proof.
- Terms state cancellation before intake can be full refund.
- Terms state post-dispatch cancellation requires review.
- Terms link to refund policy and privacy policy.

## Implementation Notes For Claude Code
### File Placement
Expected route implementation:
- `apps/web/src/routes/terms` or the app's equivalent routing convention.

Expected shared components:
- Reuse public header/footer from prior public specs.
- Reuse public CTA/button primitives.
- Reuse policy card, accordion, comparison, and section primitives only if accessible.

### Do Not Build
Do not build:
- legal e-sign acceptance
- checkout terms checkbox
- account terms acceptance log
- support submission form
- refund calculator
- live route checker
- package prohibited-item classifier
- admin policy editor

Those are separate surfaces if approved later.

### Build With Real Policy Content
All user-facing content must come from this spec and local docs. Do not insert invented legal clauses, invented case records, invented payment references, invented addresses, invented staff identities, or invented support outcomes.

### Copy Constants
Recommended content constants:
- `TERMS_SUMMARY_CARDS`
- `TERMS_SERVICE_SCOPE`
- `TERMS_RESPONSIBILITIES`
- `TERMS_PAYMENT_RULES`
- `TERMS_PACKAGE_RULES`
- `TERMS_CUSTODY_RULES`
- `TERMS_DELIVERY_RULES`
- `TERMS_CANCELLATION_REFUND_RULES`
- `TERMS_SUPPORT_MISUSE_RULES`
- `TERMS_POLICY_LINKS`
- `TERMS_FAQ`

Keep constants close to the route unless the team already has a content module convention.

## Design Quality Review
Before closing implementation, review the screen from five perspectives:

Founder:
- Does this make Kra look disciplined, fair, and operationally serious?

Skeptical sender:
- Can I understand what I am responsible for before paying?

Receiver:
- Can I understand tracking, proof, and refusal without believing I own the sender contract?

Support/admin operator:
- Does public copy match service scope, payment, custody, cancellation, refund, privacy, and support constraints?

Accessibility reviewer:
- Can I navigate and understand the terms without color, mouse, animation, or wide screen?

If any answer is weak, revise before shipping.

## Content QA Checklist
- Headline is specific and not generic.
- Service scope appears before obligations.
- Payment-before-transport is visible.
- Pay-on-delivery is denied explicitly.
- Sender and receiver responsibilities are separate.
- Assignment-is-not-custody is explicit.
- Final proof is explicit.
- Cancellation/refund/dispute copy matches policy.
- Privacy copy links to privacy policy.
- Terms do not promise guaranteed delivery, automatic compensation, insurance, or live GPS.
- Public labels do not expose internal IDs.

## Source Alignment
This spec is grounded in:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/01-product/scope-v1-v2-v3.md`
- `docs/03-business/service-areas-and-stations.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/cancellation-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-ops/customer-support-workflows.md`
- `docs/05-design/copy-deck.md`

The screen must not contradict those sources.

## Spec Quality Review
### Completeness
Pass. The spec covers screen contract, route behavior, page IA, visual system, copy system, service scope, sender and receiver responsibilities, payment, package/service rules, custody/proof, doorstep rules, cancellation/refund/dispute, privacy, support, misuse, policy links, FAQ, accessibility, SEO, testing, and implementation boundaries.

### Policy Accuracy
Pass. The spec uses the approved launch service areas, payment gate, pricing, lifecycle, doorstep, custody, cancellation, refund, privacy, and support workflow baselines.

### Backend Boundary
Pass. The spec does not require authenticated APIs, live route lookup, terms acceptance, checkout state, account state, support submission, refund calculation, or admin policy editing on the public page.

### UX Quality
Pass. The spec requires service scope and top rules before detailed terms, separate sender/receiver obligations, policy links before FAQ, and mobile-safe content structure.

### Copy Quality
Pass. The spec uses clear, operational, low-hype language and explicitly rejects unsupported guarantees, insurance, automatic compensation, and live GPS claims.

### Accessibility
Pass. The spec requires semantic headings, accessible navigation, keyboard-safe accordions, contrast, reduced motion, large text, and no color-only meaning.

### Implementation Readiness
Pass. Claude Code can build this screen from the named components, content constants, interaction rules, and test requirements without needing hidden product decisions.

### Close Decision
Closed for implementation. This file is full enough for Claude Code to build `PublicTerms` end to end as a public, policy-accurate, high-trust terms page without creating frontend UI in this docs pass.
