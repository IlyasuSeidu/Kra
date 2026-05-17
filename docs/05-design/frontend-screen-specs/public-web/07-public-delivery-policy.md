# Public Delivery Policy Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicDeliveryPolicy` |
| App | `apps/web` |
| Route | `/delivery-policy` |
| Primary test ID | `screen-public-delivery-policy` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/track`, `/how-it-works`, `/service-areas`, `/pricing`, `/trust-and-custody`, `/support`, `/refund-policy` |
| Required states | `normal` |

## Product Job
This page must publish Kra's delivery lifecycle and failed-attempt policy in plain public language. It must explain what each major delivery state means, what must happen before movement, how station pickup works, when doorstep delivery is attempted, what happens after missed attempts, and when support review starts.

The page must help users understand:
- Payment must be confirmed before transport.
- Origin intake must happen before dispatch.
- Destination receipt happens before pickup or doorstep.
- Doorstep delivery is limited by serviceability and proof rules.
- A missed doorstep attempt is not automatically a failed delivery.
- One doorstep reattempt is allowed within `24 hours`.
- After a second failed doorstep attempt, the package returns to destination-station pickup.
- Pickup hold lasts `72 hours` before `on_hold`.
- After `7 calendar days` unclaimed, return-to-sender eligibility begins.
- Final delivery requires accepted proof.

## Audience
Primary audience:
- Senders and receivers who need to understand what will happen to a package during delivery.

Secondary audience:
- Business senders planning customer communication.
- Support users trying to understand failed attempts, pickup hold, or return-to-sender.
- Operators and partners checking public wording against policy.

## User State
Users may arrive before sending, while tracking a package, after a missed attempt, or while disputing a status. The page must be specific enough to reduce support load but calm enough not to sound punitive.

## Primary Action
Primary CTA: `Track a package`

Secondary CTA: `Contact support`

Tertiary CTA: `Read refund policy`

CTA behavior:
- `Track a package` routes to `/track`.
- `Contact support` routes to `/support`.
- `Read refund policy` routes to `/refund-policy`.

## Main Tension
Delivery policy must be simple enough for customers and precise enough for operations. The page must avoid vague delivery promises while clearly explaining what happens next at each step.

## Visual Thesis
Design the page as a public operating policy that feels approachable: a clear lifecycle map, plain-language status cards, and recovery paths for missed delivery. It should feel like a premium logistics policy page, not legal boilerplate.

## Restraint Rule
Do not turn policy into dense legal copy or a decorative timeline. Avoid fake ETAs, broad guarantee claims, vague "we always try our best" language, and unsupported live-map promises.

Every visual element must explain one of these:
- Current delivery stage.
- Required gate before the next stage.
- Customer action needed.
- Failed-attempt recovery.
- Pickup hold or return-to-sender expectation.
- Proof required for completion.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of public logistics, support, and policy pages.

Non-negotiable quality requirements:
- The first viewport must tell users this page explains delivery lifecycle, attempts, pickup, and proof.
- The lifecycle must be readable without internal status knowledge.
- Failed-attempt policy must be visible before FAQ.
- Pickup hold and return-to-sender rules must be explicit.
- Proof-before-delivered must be explicit.
- The page must not imply guaranteed arrival times.
- The page must not call a normal missed doorstep attempt `delivery_failed`.
- The page must work on mobile without timeline or table overflow.
- The page must be accessible with keyboard, screen reader, high contrast, and reduced motion needs.
- The copy must use public labels, not raw internal states as the primary language.

Closure rule:
- If a receiver cannot understand what happens after a missed doorstep attempt, the screen remains open.
- If a sender cannot understand when return-to-sender may begin, the screen remains open.
- If policy reads like backend documentation instead of customer guidance, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- UPS delivery notice guidance: missed delivery pages should tell users what happened, what options exist, and where pickup may happen.
- FedEx missed delivery and hold-at-location guidance: policy content should distinguish attempted delivery, pickup, hold, and redelivery options.
- FedEx tracking and managing deliveries guidance: public status labels should explain what delivery events mean.
- GOV.UK service/content guidance: public policy content should use plain language, clear headings, and task-oriented structure.
- W3C WCAG 2.2 quick reference: timelines, accordions, links, and policy content must remain accessible.

Reference links:
- https://www.ups.com/us/en/support/tracking-support/where-is-my-package/how-to-use-infonotice
- https://www.fedex.com/en-us/customer-support/faqs/receiving/tracking-questions/missed-delivery.html
- https://www.fedex.com/en-us/tracking/guide-for-tracking-managing-deliveries.html
- https://www.gov.uk/service-manual/design/writing-for-user-interfaces
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external wording, delivery-attempt rules, carrier policies, layout, illustrations, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- What are the major delivery stages?
- What does each public status mean?
- When can a package move into transport?
- When is doorstep available?
- What happens after a failed doorstep attempt?
- How long can pickup wait at destination station?
- When can return-to-sender begin?
- What proof is needed before delivered?
- When should I contact support?
- Where can I read refund policy?

## Route And Navigation Rules
### Route
- Render at `/delivery-policy`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not render internal actor IDs, audit metadata, provider references, or raw proof asset IDs.
- Must not calculate ETA.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- No primary top-level nav item must be active unless the public navigation includes `Delivery policy`.
- If nested under `Support` or footer policy links, the breadcrumb/current page should show `Delivery policy`.

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
- Policy page must remain reachable from menu or footer.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Delivery policy.
- Refund policy.
- Support.
- Tracking.
- Privacy.
- Terms.

## Page IA
Render sections in this exact order:

1. `PublicDeliveryPolicyHeader`
2. `PublicDeliveryPolicyHero`
3. `PublicDeliveryPolicySummary`
4. `PublicDeliveryLifecycleMap`
5. `PublicDeliveryStatusGuide`
6. `PublicDeliveryMovementGates`
7. `PublicDoorstepAttemptPolicy`
8. `PublicPickupHoldPolicy`
9. `PublicProofCompletionPolicy`
10. `PublicDeliveryPolicySupportGuide`
11. `PublicDeliveryPolicyFaq`
12. `PublicDeliveryPolicyFinalCta`
13. `PublicDeliveryPolicyFooter`

Do not hide failed-attempt or pickup-hold rules only inside FAQ.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `560px`.
- Section spacing: `80px`.
- Lifecycle map can use a horizontal rail only if all labels remain readable.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Lifecycle map can become two-column grouped stages.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Lifecycle map becomes vertical cards.
- Tables become cards.
- No horizontal overflow at `320px`.

## Visual System Direction
Follow public web design language from prior specs with a policy/operations tone.

Recommended art direction:
- Background: warm policy-paper neutral.
- Green: completed or accepted proof.
- Amber: waiting, hold, retry, support review.
- Red: reserved only for terminal failed or severe issue explanations.
- Visual motifs: status rail, policy cards, attempt counter, pickup clock, proof stamp.

Do not use:
- Fake live tracking maps.
- Fake ETA countdowns.
- Legal dense text walls.
- Generic courier stock photos.
- Red warning styling for every policy section.

## Copy System
### Voice
- Clear.
- Calm.
- Operational.
- Policy-backed.
- Customer-readable.

### Forbidden Copy
Do not use:
- `guaranteed arrival`
- `always on time`
- `instant redelivery`
- `delivery failed` for ordinary missed doorstep attempt
- `automatic refund`
- `automatic compensation`
- `cash on delivery`
- `pay on delivery`
- `live GPS`

### Required Terms
Use these terms consistently:
- `delivery lifecycle`
- `origin station`
- `destination station`
- `station pickup`
- `doorstep delivery`
- `failed doorstep attempt`
- `reattempt`
- `pickup hold`
- `return-to-sender`
- `receiver proof`
- `support review`

### Plain-Language Rule
Internal status values may be included as secondary implementation references, but public labels must lead.

Internal: `awaiting_receiver_pickup`

Public: `Ready for pickup at the destination station`

## Section Specs
### 1. `PublicDeliveryPolicyHeader`
Purpose:
- Provide consistent public navigation and policy access.

Required:
- Shared public header.
- `Track package` CTA.
- Breadcrumb or page label if policy pages are grouped under footer/support.

Acceptance:
- `/delivery-policy` is visible in policy/footer navigation.

### 2. `PublicDeliveryPolicyHero`
Purpose:
- Explain what this policy covers.

Hero content:
- Eyebrow: `Delivery policy`
- H1: `How delivery moves, waits, and completes.`
- Subheadline: `Kra delivery moves through controlled stations, payment gates, handoff checks, pickup or doorstep delivery, and receiver proof before completion.`
- Primary CTA: `Track a package`
- Secondary CTA: `Contact support`
- Trust line: `Missed attempts have a recovery path. Delivered requires proof.`

Hero visual:
- Use a `DeliveryPolicyLifecyclePreview`.
- Show:
  - `Booking`
  - `Origin station`
  - `Transport`
  - `Destination station`
  - `Pickup or doorstep`
  - `Proof`
- Do not use fake package data.

### 3. `PublicDeliveryPolicySummary`
Purpose:
- Give users the most important rules immediately.

Required summary cards:

Card 1:
- Title: `Payment before transport`
- Body: `A package can be created and received while payment is pending, but it cannot enter transport until payment is confirmed.`

Card 2:
- Title: `Proof before delivered`
- Body: `A package cannot be marked delivered without accepted receiver proof and timestamp.`

Card 3:
- Title: `One doorstep reattempt`
- Body: `One doorstep reattempt is allowed within 24 hours of the first failed attempt.`

Card 4:
- Title: `Pickup hold`
- Body: `A package may remain ready for pickup for 72 hours before being flagged on hold.`

Acceptance:
- All four policy cards render above the full lifecycle map.

### 4. `PublicDeliveryLifecycleMap`
Purpose:
- Translate the delivery lifecycle into customer-readable stages.

Section heading:
- Eyebrow: `Lifecycle`
- H2: `From booking to closed delivery.`
- Intro: `These are the major states a package can move through. Some states appear only when the sender chooses doorstep delivery.`

Required stages:

1. `Booking created`
- Internal: `created`
- Meaning: `The delivery exists, but payment and intake may still need to happen.`

2. `Received at origin station`
- Internal: `received_at_origin`
- Meaning: `The station has received the package.`

3. `Awaiting dispatch`
- Internal: `awaiting_driver_assignment`
- Meaning: `The package is waiting for transport readiness and assignment.`

4. `Assigned to driver`
- Internal: `assigned_to_driver`
- Meaning: `A driver is selected, but custody moves only after confirmed pickup.`

5. `Left origin station`
- Internal: `dispatched_from_origin`
- Meaning: `The package has left origin after required checks.`

6. `In transit`
- Internal: `in_transit`
- Meaning: `The package is moving between stations.`

7. `Arrived at destination station`
- Internal: `received_at_destination`
- Meaning: `Destination station has received and checked the package.`

8. `Ready for pickup`
- Internal: `awaiting_receiver_pickup`
- Meaning: `The receiver can collect at destination station.`

9. `Waiting for doorstep courier`
- Internal: `awaiting_final_mile_assignment`
- Meaning: `Doorstep was requested and the package is waiting for final-mile assignment.`

10. `Assigned for doorstep delivery`
- Internal: `assigned_for_final_mile`
- Meaning: `A courier is selected, but custody moves only after scan and acceptance.`

11. `Out for delivery`
- Internal: `out_for_delivery`
- Meaning: `A courier has accepted the package for doorstep delivery.`

12. `Delivered`
- Internal: `delivered`
- Meaning: `Accepted receiver proof has been recorded.`

13. `Closed`
- Internal: `closed`
- Meaning: `Delivery workflow is complete.`

Design:
- Use customer labels as primary.
- Internal values can appear in small developer/spec labels only if useful for Claude Code, not as user-facing copy.
- Mobile must use vertical cards.

### 5. `PublicDeliveryStatusGuide`
Purpose:
- Explain exception states and derived flags.

Section heading:
- Eyebrow: `Status notes`
- H2: `Some states need review, not panic.`

Required status notes:

`Delayed`:
- Public meaning: `An expected timing signal is late.`
- Policy: `Delayed is a derived operational flag, not a canonical delivery status.`

`Failed doorstep attempt`:
- Public meaning: `Kra could not complete a doorstep attempt.`
- Policy: `A simple failed doorstep attempt is not the same as terminal delivery failure.`

`Issue reported`:
- Public meaning: `A support or operations review is open.`
- Policy: `The package may stay in review until the next action is decided.`

`On hold`:
- Public meaning: `The package needs attention before normal progress continues.`
- Policy: `Pickup hold moves here after the approved waiting period.`

`Cancelled`:
- Public meaning: `The delivery was cancelled according to policy.`

`Delivery failed`:
- Public meaning: `Reserved for terminal exception outcomes such as confirmed loss, irrecoverable damage, or admin-closed failed delivery.`
- Policy: `Do not use for ordinary missed doorstep attempts.`

### 6. `PublicDeliveryMovementGates`
Purpose:
- Explain what must happen before the package moves.

Required gates:

Gate 1:
- Title: `Origin receipt before dispatch`
- Body: `A package cannot be dispatched before origin station receipt is confirmed.`

Gate 2:
- Title: `Payment before transport`
- Body: `Payment must be confirmed before driver assignment, dispatch, in-transit, or later transport states.`

Gate 3:
- Title: `Destination receipt before pickup or doorstep`
- Body: `Destination station receipt and condition check happen before receiver pickup or final-mile assignment.`

Gate 4:
- Title: `Proof before delivered`
- Body: `Delivery cannot be completed without accepted proof and timestamp.`

Design:
- Use checkpoint cards.
- Do not make them look optional.

### 7. `PublicDoorstepAttemptPolicy`
Purpose:
- Explain doorstep assignment, failed attempts, and reattempt policy.

Section heading:
- Eyebrow: `Doorstep attempts`
- H2: `Missed doorstep delivery has a recovery path.`
- Intro: `Doorstep delivery starts only after destination-station receipt and only where the receiver address is serviceable.`

Required policy:
- Doorstep delivery is limited to receiver addresses within `10km` of the destination station.
- Doorstep requires receiver name, phone, and usable address or landmark.
- Doorstep surcharge must be collected before courier assignment.
- If a package reaches destination station before `15:00` local time and courier capacity exists, the system should target same-day final-mile assignment.
- If it reaches destination station at or after `15:00`, the default target is next-business-day assignment.
- Courier must accept or reject assignment within `15 minutes`.
- Once accepted, the courier should move delivery to `out_for_delivery` within `2 hours` unless reassigned.
- One reattempt is allowed within `24 hours` of the first failed doorstep attempt.
- The first reattempt does not create a new doorstep surcharge.
- After the second failed attempt, the courier returns package to destination station and delivery moves to `awaiting_receiver_pickup`.
- If receiver refuses package, delivery moves to `issue_reported` until station review decides next step.

Failed attempt reasons:
- `receiver_unreachable`
- `receiver_unavailable`
- `address_not_found`
- `unsafe_to_complete`
- `receiver_refused`
- `proof_failed`
- `package_issue_detected`

Public rendering:
- Convert reasons to readable labels.
- Do not show raw snake_case codes as primary copy.

### 8. `PublicPickupHoldPolicy`
Purpose:
- Explain how long pickup waits and when return-to-sender can begin.

Section heading:
- Eyebrow: `Station pickup`
- H2: `Pickup has a hold window.`

Required policy:
- A package may remain in `Ready for pickup` for `72 hours`.
- After `72 hours`, the package is flagged `on hold` and the sender is notified.
- After `7 calendar days` unclaimed, the package becomes eligible for return-to-sender.
- Return-to-sender is created as a linked new delivery on the same corridor at the standard base route fee.
- Return-to-sender must be prepaid before dispatch.

Design:
- Use a time-window rail:
  - `Ready for pickup`
  - `72 hours`
  - `On hold`
  - `7 calendar days`
  - `Eligible for return-to-sender`

Acceptance:
- Pickup hold and return-to-sender rules are visible before FAQ.

### 9. `PublicProofCompletionPolicy`
Purpose:
- Explain proof required to complete delivery.

Section heading:
- Eyebrow: `Completion proof`
- H2: `Delivered means proof was accepted.`

Required content:
- OTP is default final-mile proof method.
- If OTP cannot be completed, approved fallback may be receiver signature or delivery photo.
- A delivery cannot be marked delivered without one accepted proof method plus timestamp.
- Public policy must not expose proof asset references.
- Proof supports support/dispute review but does not promise automatic compensation.

Required link:
- `Read trust and custody` -> `/trust-and-custody`

### 10. `PublicDeliveryPolicySupportGuide`
Purpose:
- Tell users when to use support.

Support triggers:
- Tracking has not changed and package appears delayed.
- Receiver cannot pick up within hold window.
- Doorstep attempt failed and instructions are unclear.
- OTP, signature, or photo proof failed.
- Package appears damaged or missing.
- Receiver refused package.
- Return-to-sender is needed.

Required link:
- `Contact support` -> `/support`

Copy:
- `Support review uses delivery timeline, handoff evidence, proof, payment records, and case notes.`

### 11. `PublicDeliveryPolicyFaq`
Purpose:
- Resolve lifecycle and attempt questions.

Required FAQ items:

FAQ 1:
- Question: `Can my package move before payment is confirmed?`
- Answer: `No. A delivery can exist and be received while payment is pending, but it cannot enter transport states until payment is confirmed.`

FAQ 2:
- Question: `Is a failed doorstep attempt the same as delivery failed?`
- Answer: `No. A simple failed doorstep attempt is not terminal failure. Kra allows one reattempt within 24 hours, then returns the package to destination-station pickup after a second failed attempt.`

FAQ 3:
- Question: `How long can a package wait for pickup?`
- Answer: `A package may remain ready for pickup for 72 hours. After that it is flagged on hold and the sender is notified.`

FAQ 4:
- Question: `When can return-to-sender begin?`
- Answer: `After 7 calendar days unclaimed, the package becomes eligible for return-to-sender as a linked new delivery that must be prepaid before dispatch.`

FAQ 5:
- Question: `What proof is needed to mark delivered?`
- Answer: `Delivery requires accepted proof and timestamp. Doorstep uses OTP by default, with signature or photo proof as approved fallback.`

FAQ 6:
- Question: `What if the receiver refuses the package?`
- Answer: `Receiver refusal moves the delivery into issue review until station support decides pickup, return-to-sender, or dispute outcome.`

FAQ 7:
- Question: `Does delayed mean the package is lost?`
- Answer: `No. Delayed is an operational timing signal. Contact support if the tracking status does not explain the next step.`

FAQ 8:
- Question: `Can I get an automatic refund after a missed attempt?`
- Answer: `No. Refunds depend on timing, payment records, handoff evidence, proof, and policy review.`

### 12. `PublicDeliveryPolicyFinalCta`
Purpose:
- Route users to tracking or support.

Copy:
- Eyebrow: `Need the current status?`
- H2: `Track the package, then use policy for the next step.`
- Body: `Delivery status shows where the package is. This policy explains what each stage means and when support review is needed.`
- Primary CTA: `Track a package`
- Secondary CTA: `Contact support`
- Tertiary text link: `Read refund policy`

Behavior:
- Primary routes to `/track`.
- Secondary routes to `/support`.
- Tertiary routes to `/refund-policy`.

### 13. `PublicDeliveryPolicyFooter`
Purpose:
- Provide stable public navigation and policy links.

Required:
- Shared public footer.
- Delivery policy, refund policy, terms, privacy, support, and tracking routes visible when available.

## Component Inventory
Claude Code should create or reuse components with these responsibilities:

### `PublicDeliveryPolicyPage`
- Owns page composition.
- Sets metadata.
- Renders `data-testid="screen-public-delivery-policy"`.
- Does not fetch authenticated data.

### `DeliveryPolicyLifecyclePreview`
- Renders hero lifecycle summary.
- Uses public labels only.

### `PolicySummaryCards`
- Renders four top rules.

### `DeliveryLifecycleMap`
- Renders lifecycle stages.
- Converts to vertical cards on mobile.

### `StatusGuideCards`
- Explains exception states and derived flags.

### `MovementGateCards`
- Explains origin, payment, destination, and proof gates.

### `DoorstepAttemptPolicyPanel`
- Explains final-mile assignment, failed attempt reasons, and reattempt policy.

### `PickupHoldTimeline`
- Explains 72-hour hold and 7-day return-to-sender eligibility.

### `ProofCompletionPanel`
- Explains OTP/signature/photo proof.

### `PolicySupportGuide`
- Routes users to support when policy is not enough.

### `PublicFaqAccordion`
- Shared accessible FAQ accordion.

### `PublicFinalCta`
- Shared final CTA pattern.

## Data And Content Source
This page is static public content.

Allowed local sources:
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/package-statuses.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/copy-deck.md`

Do not fetch:
- Delivery records.
- Staff records.
- Proof assets.
- Audit metadata.
- Payment provider data.
- Live ETAs.

## State Handling
Required page state:
- `normal`

No full-page states required:
- No loading.
- No empty.
- No unavailable.
- No authenticated error state.

Non-blocking component fallback:
- If lifecycle visual asset fails, render all status cards and policy text normally.
- Fallback text: `Delivery stages are listed below.`

## Interaction Rules
### In-Page Navigation
Optional desktop nav:
- `Lifecycle`
- `Gates`
- `Doorstep`
- `Pickup`
- `Proof`
- `FAQ`

Rules:
- Anchor links only.
- Active state must not rely on color alone.

### Lifecycle And Status Cards
- Cards may expand for details.
- Required rules must not be hidden behind hover.
- Mobile must show core meaning without interaction.

### Motion
Allowed:
- Subtle lifecycle reveal.
- Attempt timeline reveal.
- CTA hover/focus transitions.

Rules:
- Respect `prefers-reduced-motion`.
- No fake live tracking movement.
- No countdown timers.

## Accessibility Requirements
- One `h1`.
- Semantic `main`, header, footer.
- Logical heading order.
- Keyboard-reachable links, accordions, and expandable cards.
- Visible focus states.
- Color contrast meets WCAG AA.
- Text remains readable at 200% zoom.
- No horizontal scroll at `320px`.
- Lifecycle diagrams need text equivalents.
- Accordions use button triggers and `aria-expanded`.
- Do not rely on color alone for status meanings.

## Performance Requirements
- No map library.
- No live tracking script.
- No autoplay media.
- No heavy timeline library.
- Static content renders immediately.
- Diagrams should be CSS, SVG, or optimized assets.

## SEO And Metadata
Page title:
- `Delivery Policy | Kra`

Meta description:
- `Read Kra delivery lifecycle, payment-before-transport rule, doorstep failed-attempt policy, station pickup hold, return-to-sender timing, and proof requirements.`

Open Graph:
- Title: `Kra delivery policy`
- Description: `Delivery lifecycle, missed attempts, pickup hold, return-to-sender, and proof rules.`
- Image: approved public brand/social image only.

Structured content:
- Use semantic headings.
- FAQ schema may be used only if existing public SEO tooling supports it.

## Analytics Contract
Use analytics only if public analytics layer exists.

Events:

### `public_delivery_policy_viewed`
Payload:
- `route`: `/delivery-policy`
- `screen_id`: `PublicDeliveryPolicy`

### `public_delivery_policy_section_viewed`
Payload:
- `section`

### `public_delivery_policy_cta_clicked`
Payload:
- `cta_label`
- `destination_route`
- `section`

### `public_delivery_policy_faq_opened`
Payload:
- `question_key`

Privacy:
- Do not collect tracking codes, delivery IDs, phone numbers, locations, or issue content from this static page.

## Testing Contract
### Unit And Component Tests
Required tests:
- Renders `screen-public-delivery-policy`.
- Renders hero H1 exactly.
- Renders payment-before-transport policy.
- Renders proof-before-delivered policy.
- Renders all public lifecycle labels.
- Renders failed doorstep attempt policy.
- Renders one reattempt within `24 hours`.
- Renders second failed attempt returns to destination-station pickup.
- Renders `72 hours` pickup hold.
- Renders `7 calendar days` return-to-sender eligibility.
- Renders final proof requirements.
- Renders all FAQ questions.
- Does not render fake live ETA or GPS promise.

### Accessibility Tests
Required:
- Automated accessibility check has no critical violations.
- Keyboard can reach all links, FAQ triggers, and optional cards.
- Lifecycle map has text equivalent.
- Mobile cards preserve stage meaning.
- Reduced motion does not hide content.

### E2E Tests
Test name:
- `e2e-public-delivery-policy-content`

Flow:
- Visit `/delivery-policy`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Assert `Payment before transport` is visible.
- Assert `One doorstep reattempt is allowed within 24 hours` is visible.
- Assert `72 hours` is visible.
- Assert `7 calendar days` is visible.
- Click `Track a package`.
- Assert route is `/track`.

Test name:
- `e2e-public-delivery-policy-mobile`

Flow:
- Set mobile viewport.
- Visit `/delivery-policy`.
- Assert no horizontal overflow.
- Assert lifecycle cards are readable.
- Open FAQ about failed doorstep attempt.
- Assert answer says missed attempt is not terminal delivery failure.

## Content Acceptance Checklist
- Page renders `/delivery-policy`.
- Page renders `screen-public-delivery-policy`.
- Page states payment must be confirmed before transport.
- Page states origin receipt before dispatch.
- Page states destination receipt before pickup or doorstep.
- Page states one doorstep reattempt within `24 hours`.
- Page states second failed attempt returns to destination-station pickup.
- Page states simple failed doorstep attempt is not `delivery_failed`.
- Page states pickup hold is `72 hours`.
- Page states return-to-sender eligibility begins after `7 calendar days` unclaimed.
- Page states return-to-sender is linked new delivery and prepaid before dispatch.
- Page states delivered requires proof and timestamp.
- Page does not promise guaranteed arrival.
- Page does not promise automatic refund or compensation.
- Page links to `/track`.
- Page links to `/support`.
- Page links to `/refund-policy`.

## Design Quality Review Checklist
Before closing implementation, review the UI against five perspectives:

Founder:
- Does the page make Kra's delivery policy feel disciplined and fair?

Sender:
- Can I understand what must happen before my package moves?

Receiver:
- Can I understand missed attempts, pickup, and proof?

Support operator:
- Does the policy reduce avoidable support confusion?

Accessibility reviewer:
- Can I read lifecycle and attempt rules without a wide screen or animation?

Creative director:
- Does the page feel like premium operational policy rather than legal boilerplate?

If any answer is weak, revise before moving to the next screen spec.

## Claude Code Build Notes
Claude Code should:
- Build only this screen and shared components required by this screen.
- Keep content static and public-safe.
- Reuse shared public header, footer, FAQ, and final CTA components.
- Convert lifecycle/tables into accessible mobile cards.
- Add tests for lifecycle labels, failed attempt rules, pickup hold, and CTA routing.

Claude Code should not:
- Implement unrelated screens.
- Add live ETA or GPS behavior.
- Add fake tracking data.
- Add guaranteed delivery copy.
- Add refund promise copy.
- Expose internal actor IDs, audit details, or proof asset references.
- Add demo or sample delivery records.

## Open Decisions
No product decision blocks this static delivery policy page.

Implementation may choose:
- Whether lifecycle stages are always expanded or expandable.
- Whether the pickup hold timeline is rail or cards.
- Whether in-page navigation is sticky on desktop.

Implementation must not choose:
- Different lifecycle stages.
- Different failed-attempt rules.
- Different pickup hold or return-to-sender timing.
- Guaranteed arrival promises.
- Automatic refund or compensation promises.

## Spec Quality Review
### Top-Tier Product Standard Pass
Pass. The spec defines a clear public delivery policy with lifecycle, movement gates, failed-attempt recovery, pickup hold, return-to-sender, proof completion, support routing, accessibility, and strict anti-overpromise rules.

### Industry Inspiration Translation Pass
Pass. External references are translated into directly relevant principles:
- Missed-delivery content should explain what happened and the next action.
- Hold/pickup guidance should distinguish attempt, pickup, and redelivery paths.
- Public status labels should explain delivery events without internal jargon.
- Policy content must be plain, structured, and accessible.

No external carrier policy, wording, layout, or assets are copied.

### Implementation Readiness Pass
Pass. The spec gives route contract, page IA, exact copy, components, interaction rules, accessibility, analytics, SEO, tests, and close criteria.

### Policy Consistency Pass
Pass. The spec aligns to delivery lifecycle, package statuses, doorstep delivery rules, handoff proof policy, refund/dispute expectations, copy constraints, and frontend inventory boundaries.

### Remaining Constraints Accepted
Accepted:
- This page is static and public-safe.
- It does not show real tracking or ETA data.
- It does not implement UI.
- It does not expose internal evidence records.

### Close Decision
Ready for Claude Code implementation after this document is merged and CI is green.
