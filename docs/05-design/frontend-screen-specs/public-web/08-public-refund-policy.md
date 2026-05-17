# Public Refund Policy Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicRefundPolicy` |
| App | `apps/web` |
| Route | `/refund-policy` |
| Primary test ID | `screen-public-refund-policy` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/track`, `/pricing`, `/delivery-policy`, `/support`, `/terms`, `/privacy` |
| Required states | `normal` |

## Product Job
This page must publish Kra's refund and dispute policy in plain public language. It must explain when a customer may receive a full refund, partial refund, surcharge refund, manual review, or dispute decision without making unsupported promises.

The page must help users understand:
- Refund eligibility depends on delivery stage, payment evidence, service evidence, and fault attribution.
- Eligible cancellation before origin intake can receive a full refund.
- Cancellation after origin intake but before dispatch can receive a refund minus a `GHS 5` handling fee.
- After dispatch, there is no automatic full refund unless policy evidence supports it.
- Duplicate charges, verified platform-side payment errors, and confirmed payment without origin intake are full-refund cases.
- Doorstep surcharge is refundable when no valid doorstep attempt occurred.
- Express surcharge is refundable when express handling was not performed because of Kra-side or staff-side failure.
- Loss and damage claims require evidence review.
- A confirmed total loss under verified Kra custody can include delivery-charge refund and compensation up to declared value, capped at `GHS 2,000` in standard v1 flow.
- Damage does not create automatic compensation in v1.
- The dispute window is `7 calendar days`.
- Internal acknowledgement target is `48 hours`.
- Standard complete-evidence dispute resolution target is `5 business days`.
- Complex loss, damage, or provider-settlement disputes may extend to `10 business days`.
- Approved refunds are initiated the same business day and target completion within `3 business days` when returned to the original payment method.
- Alternate approved refund paths target completion within `5 business days`.
- Cash refunds are not part of standard v1 workflow.

The page must not turn refund policy into legal fog. It must give users enough confidence to know whether to track, cancel, open support, or wait for finance settlement.

## Audience
Primary audience:
- Senders who paid for delivery and need to understand refund eligibility or dispute steps.

Secondary audience:
- Receivers affected by failed doorstep delivery, refusal, loss, damage, or pickup-hold outcomes.
- Visitors comparing Kra's trust and payment discipline before sending.
- Support, finance, and operations staff who need public wording that matches internal policy.

## User State
Users may be anxious, angry, or confused. They may believe any delay should create a refund. They may not know whether the issue is a payment problem, delivery problem, doorstep-service problem, loss claim, damage claim, or sender-created error. The page must reduce emotional load by showing clear policy paths and evidence needs without sounding defensive.

## Primary Action
Primary CTA: `Start refund or dispute review`

Secondary CTA: `Track a package`

Tertiary CTA: `Read delivery policy`

CTA behavior:
- `Start refund or dispute review` routes to `/support` with refund/dispute context when URL parameters or client routing support it.
- `Track a package` routes to `/track`.
- `Read delivery policy` routes to `/delivery-policy`.

## Main Tension
Refund policy must feel fair and accountable while protecting Kra from unsupported or premature commitments. The design must make eligible paths easy to understand, but it must not imply that all complaints become refunds or that compensation happens without evidence review.

## Visual Thesis
Design this page as a finance-grade policy desk: structured, calm, credible, and easy to scan. The best version should feel like a premium fintech dispute flow crossed with a high-trust logistics policy page, not a legal PDF or a generic FAQ.

## Restraint Rule
Do not create a dramatic claims page. Avoid legal clutter, generic empathy banners, dark warning panels, floating money graphics, excessive icons, invented case outcomes, and any message that sounds like refund approval before review.

Every visual element must help one of these:
- Identify the refund or dispute path.
- Show what evidence matters.
- Explain timing.
- Clarify what is not automatic.
- Route users to tracking, support, or delivery policy.
- Prevent wrong expectations before support review.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of public fintech, marketplace, consumer-protection, and logistics policy pages.

Non-negotiable quality requirements:
- The first viewport must state that the page explains refund eligibility, dispute windows, evidence, and timelines.
- The refund matrix must be visible before FAQ.
- Full refund, partial refund, surcharge refund, manual review, and non-automatic cases must be visually distinct.
- The page must make the `GHS 5`, `GHS 2,000`, `7 calendar days`, `48 hours`, `5 business days`, `10 business days`, `3 business days`, and `5 business days` rules explicit.
- Evidence hierarchy must be visible before the user is asked to contact support.
- The page must distinguish delivery-charge refunds, surcharge refunds, and compensation review.
- The page must say that damage claims require manual review and do not create automatic compensation in v1.
- The page must say cash refunds are not part of standard v1 workflow.
- The page must not expose internal refund IDs, provider payloads, payment provider references, staff IDs, audit records, or raw backend error details.
- The page must not imply insurance-backed outcomes.
- The page must work on mobile without table overflow.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, and large text.

Closure rule:
- If a sender cannot tell whether their case is full refund, partial refund, surcharge refund, or manual review, the screen remains open.
- If a user can reasonably think every delay means automatic money back, the screen remains open.
- If the page hides dispute timing in FAQ only, the screen remains open.
- If the page reads like internal finance documentation instead of customer guidance, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- FTC prompt delivery rule guidance: delayed or unavailable fulfillment policies should be clear about customer rights, timing, and refund obligations.
- GOV.UK refund guidance: public refund pages should use direct headings, clear eligibility language, and practical user actions.
- Stripe refund documentation: refund state communication should distinguish initiated, pending, settled, and failed provider outcomes.
- Paystack refund API documentation: payment-led refund systems need stable refund status, amount, currency, transaction linkage, and reference discipline.
- W3C WCAG 2.2 quick reference: policy tables, accordions, links, and status text must remain accessible.

Reference links:
- https://www.ftc.gov/business-guidance/resources/selling-internet-prompt-delivery-rules
- https://www.gov.uk/accepting-returns-and-giving-refunds
- https://docs.stripe.com/refunds
- https://paystack.com/docs/api/refund/
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external legal language, refund rules, dispute processes, page layout, diagrams, icons, illustrations, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- When can I get a full refund?
- When is only a partial refund available?
- When is a doorstep or express surcharge refundable?
- What happens after dispatch?
- What evidence does Kra review?
- How long do I have to open a dispute?
- How quickly will Kra acknowledge a dispute?
- How long can standard and complex reviews take?
- When does an approved refund get initiated?
- How long can refund settlement take?
- What is not refundable automatically?
- Where do I start a refund or dispute review?
- Should I track first or contact support?

## Route And Navigation Rules
### Route
- Render at `/refund-policy`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not create issues automatically.
- Must not request payment credentials.
- Must not ask for provider transaction references on this public policy page.
- Must not show backend refund status because this is a static policy page, not the sender refund status screen.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- No primary top-level nav item must be active unless the public navigation includes `Refund policy`.
- If nested under `Support`, `Pricing`, or footer policy links, breadcrumb/current page should show `Refund policy`.

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
- `Refund policy` must remain reachable from the mobile menu or footer.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Refund policy.
- Delivery policy.
- Support.
- Tracking.
- Pricing.
- Privacy.
- Terms.

## Page IA
Render sections in this exact order:

1. `PublicRefundPolicyHeader`
2. `PublicRefundPolicyHero`
3. `PublicRefundPolicySummary`
4. `PublicRefundEligibilityMatrix`
5. `PublicRefundStageRules`
6. `PublicSurchargeRefundRules`
7. `PublicLossDamageCompensationRules`
8. `PublicDisputeWindowAndSla`
9. `PublicEvidenceHierarchy`
10. `PublicRefundExecutionTimeline`
11. `PublicRefundNotAutomaticRules`
12. `PublicRefundSupportPath`
13. `PublicRefundPolicyFaq`
14. `PublicRefundPolicyFinalCta`
15. `PublicRefundPolicyFooter`

Do not put FAQ before the refund matrix. Users need the eligibility map first.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `540px`.
- Section spacing: `80px`.
- Refund matrix should use a responsive card-table hybrid, not a wide dense table.
- Evidence and timeline sections can sit in two balanced columns on wide screens.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Matrix cards should stack in two columns when room allows.
- Timeline labels must wrap without truncation.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Matrix rows become full-width cards.
- Timing chips should wrap.
- CTA stack order: primary, secondary, tertiary.
- No horizontal scroll.
- Tables must be replaced with semantic card groups or accessible stacked rows.

## Visual System Direction
Follow the public web design language from previous specs while shifting tone toward finance, evidence, and decision clarity.

Recommended art direction:
- Background: warm off-white with subtle ledger-grid texture.
- Primary accent: trust green for eligible and approved concepts.
- Secondary accent: amber for review, pending, and manual decision concepts.
- Severe accent: restrained red only for ineligible, rejected, or blocked expectations.
- Neutral accent: ink/charcoal for rules, numbers, and policy definitions.
- Visual motifs: decision matrix, evidence stack, payment trail, timeline ledger, calm support desk.

Do not use:
- Money flying out of boxes.
- Countdown pressure visuals.
- Aggressive red claims banners.
- Refund approval stamps.
- Insurance shield motifs unless legal coverage exists.
- Fake payment provider logos.
- Decorative charts without real policy meaning.

## Copy System
### Voice
- Calm.
- Direct.
- Fair.
- Evidence-led.
- Finance-grade.
- Plain-language.

### Forbidden Copy
Do not use:
- `instant refund`
- `guaranteed refund`
- `automatic compensation`
- `insurance included`
- `no questions asked`
- `always covered`
- `claim approved`
- `cash refund`
- `refund guaranteed`
- `we pay immediately`
- `every delay is refundable`

### Required Terms
Use these terms consistently:
- `refund review`
- `dispute review`
- `payment record`
- `handoff evidence`
- `proof`
- `delivery charge`
- `doorstep surcharge`
- `express surcharge`
- `declared value`
- `original payment method`
- `support request`
- `business days`
- `calendar days`

### Plain-Language Rule
Use public labels first. Internal reason codes may be referenced only in developer notes or tests, not user-facing copy.

Internal: `post_intake_handling_fee`

Public: `Refund minus the GHS 5 handling fee`

Internal: `manual_review_required`

Public: `Needs refund or dispute review`

## Policy Content Model
### Canonical Refund Paths
The UI must represent five high-level refund paths:

| Public Path | User Meaning | System Meaning |
| --- | --- | --- |
| `Full refund` | Customer may receive the full eligible delivery charge paid | `full_refund_pre_intake`, `duplicate_charge`, `platform_payment_error`, `never_received_at_origin` |
| `Partial refund` | Customer may receive amount paid minus policy fee | `post_intake_handling_fee` |
| `Surcharge refund` | Customer may receive unused doorstep or express surcharge only | `doorstep_surcharge_refund`, `express_surcharge_refund` |
| `Dispute review` | Finance/support needs evidence before decision | `manual_review_required` or issue workflow |
| `Not automatic` | Policy does not approve refund without review | post-dispatch, damage, delay, refusal, sender-error cases |

Do not expose system meanings in public UI.

### Customer-Facing Policy Labels
Use these exact labels in the matrix:
- `Before origin intake`
- `After origin intake, before dispatch`
- `After dispatch`
- `Duplicate charge`
- `Payment confirmed, package not received at origin`
- `Verified platform payment error`
- `Doorstep surcharge, no attempt occurred`
- `Express surcharge, service not performed`
- `Confirmed total loss under Kra custody`
- `Damage claim`
- `Receiver refusal`
- `Sender-provided error`

### Numeric Rules
The UI must show:
- `GHS 5` handling fee.
- `GHS 2,000` standard v1 compensation cap for confirmed total loss under verified Kra custody.
- `7 calendar days` dispute window.
- `48 hours` acknowledgement target.
- `5 business days` standard complete-evidence review target.
- `10 business days` complex review extension.
- `3 business days` original-method refund completion target after approval.
- `5 business days` alternate approved refund completion target.

## Component Specifications
### `PublicRefundPolicyHero`
Purpose:
- Establish that the page explains refund eligibility, dispute review, evidence, and timelines.

Layout:
- Two-column desktop hero.
- Left column: eyebrow, headline, subheadline, CTA row, trust note.
- Right column: visual decision card stack showing `Eligible`, `Review`, `Not automatic`, and `Timeline`.
- Mobile: stack content first, visual second.

Required copy:
- Eyebrow: `Refunds and dispute review`
- Headline: `Know when a refund applies before you open a case.`
- Subheadline: `Kra reviews refunds using payment records, delivery stage, handoff evidence, and proof. This policy explains what can be refunded, what needs review, and how long decisions should take.`
- Primary CTA: `Start refund or dispute review`
- Secondary CTA: `Track a package`
- Trust note: `Refund decisions are tied to delivery events and payment records, not guesswork.`

Visual requirements:
- Decision stack must avoid legal imagery.
- Use clear statuses:
  - `Full refund`
  - `Partial refund`
  - `Surcharge refund`
  - `Dispute review`
- Show one compact timing chip: `Dispute window: 7 calendar days`.

Interaction:
- Primary CTA routes to `/support`.
- Secondary CTA routes to `/track`.
- CTAs must be keyboard focusable.

Accessibility:
- Hero visual must be decorative unless each item is actual text.
- If visual contains text, it must be real DOM text.
- Do not rely on color alone to distinguish eligibility.

### `PublicRefundPolicySummary`
Purpose:
- Give users the highest-signal policy summary before the detailed matrix.

Layout:
- Four summary cards in a responsive grid.

Cards:
1. `Stage matters`
   - Body: `Refund rules change after origin intake and again after dispatch.`
2. `Evidence matters`
   - Body: `Kra reviews payment records, handoff events, proof, and support notes.`
3. `Some cases are automatic, some are not`
   - Body: `Duplicate charges and verified payment errors are different from delay, damage, or refusal claims.`
4. `Timing is visible`
   - Body: `Disputes can be opened within 7 calendar days and are acknowledged with a 48-hour target.`

Design:
- Each card must have one icon-like mark or number, one heading, one short body.
- Cards must not become generic marketing feature cards.

### `PublicRefundEligibilityMatrix`
Purpose:
- Make refund outcomes obvious without requiring users to read the entire page.

Layout:
- Desktop: accessible matrix with grouped cards, not a cramped table.
- Mobile: vertical decision cards.

Required groups:
1. `Usually eligible for full refund`
2. `Eligible for partial or surcharge refund`
3. `Requires dispute review`
4. `Not automatically refundable`

Group 1 rows:
- `Cancelled before origin intake`
  - Outcome: `Full refund of amount collected`
  - Evidence: `Payment record and no origin intake event`
- `Duplicate charge`
  - Outcome: `Full refund if verified`
  - Evidence: `Payment records showing duplicate charge`
- `Payment confirmed but no package was received at origin`
  - Outcome: `Full refund if confirmed`
  - Evidence: `Payment record and missing intake record`
- `Verified platform-side payment error`
  - Outcome: `Full refund if confirmed`
  - Evidence: `Payment and reconciliation review`

Group 2 rows:
- `Cancelled after origin intake but before dispatch`
  - Outcome: `Refund minus GHS 5 handling fee`
  - Evidence: `Intake event, payment record, no dispatch event`
- `Doorstep surcharge charged but no doorstep attempt occurred`
  - Outcome: `Doorstep surcharge refunded`
  - Evidence: `Doorstep fee and attempt history`
- `Express surcharge charged but express handling was not performed`
  - Outcome: `Express surcharge refunded`
  - Evidence: `Service selection and operation history`

Group 3 rows:
- `Confirmed total loss under Kra custody`
  - Outcome: `Delivery charge refund plus compensation review up to declared value, capped at GHS 2,000 in standard v1`
  - Evidence: `Custody chain, handoff proof, issue review`
- `Damage claim`
  - Outcome: `Manual review; service fee may be refunded in full or part if Kra-side fault is confirmed`
  - Evidence: `Condition records, proof, photos, handoff events`
- `Post-dispatch service failure`
  - Outcome: `Dispute review; no automatic full refund`
  - Evidence: `Delivery timeline, custody evidence, issue notes`
- `Receiver refusal`
  - Outcome: `Issue review; not automatic cancellation`
  - Evidence: `Courier event, station review, support notes`

Group 4 rows:
- `Sender entered incorrect receiver or package details`
  - Outcome: `Not automatically refundable`
  - Evidence: `Booking details and issue review`
- `At least one valid doorstep attempt occurred`
  - Outcome: `Doorstep surcharge treated as operationally consumed`
  - Evidence: `Attempt event and courier record`
- `General delay after dispatch`
  - Outcome: `Not automatically refundable unless evidence shows Kra-side service failure`
  - Evidence: `Timeline and support review`

Interaction:
- Each group can be an accordion on mobile only if the default expanded state still shows the group headings and at least the first-row summary.
- Desktop should avoid hiding policy behind accordion controls.

Accessibility:
- Use semantic headings for each group.
- If a table is used internally, include proper headers.
- If cards are used, every card must include label, outcome, and evidence.

### `PublicRefundStageRules`
Purpose:
- Explain refund timing by lifecycle stage.

Sections:
1. `Before origin intake`
2. `After origin intake, before dispatch`
3. `After dispatch`

Required copy:
- Before origin intake: `If an eligible delivery is cancelled before the origin station receives the package, the amount collected can be refunded in full.`
- After origin intake: `If cancellation is approved after origin intake but before dispatch, Kra refunds the amount collected minus the GHS 5 handling fee.`
- After dispatch: `After dispatch, there is no automatic full refund. A refund may still be approved for a verified Kra-side service failure, duplicate charge, platform payment error, or formal dispute ruling.`

Design:
- Use a horizontal staged rail on desktop.
- Use vertical stacked cards on mobile.
- Show each stage with:
  - `What changed`
  - `Refund expectation`
  - `Evidence needed`

Do not imply the sender can cancel any stage from this public page.

### `PublicSurchargeRefundRules`
Purpose:
- Separate delivery-charge refund from optional-service surcharge refund.

Required content:
- `Doorstep surcharge`
  - `Refundable when the surcharge was charged but no valid doorstep attempt occurred.`
  - `Not automatically refundable after at least one valid doorstep attempt.`
- `Express surcharge`
  - `Refundable when express handling was charged but was not performed because of platform-side or staff-side failure.`
  - `Not automatically refundable when express handling was performed but a later delivery issue needs separate review.`

Design:
- Use two prominent comparison cards.
- Each card includes `Refundable when`, `Not automatic when`, and `Evidence reviewed`.

Evidence reviewed:
- Doorstep: `service selection`, `destination receipt`, `attempt history`, `courier event`.
- Express: `service selection`, `route handling history`, `staff event`, `timeline`.

### `PublicLossDamageCompensationRules`
Purpose:
- Explain loss and damage with precision and without overclaiming.

Required content:
- `Confirmed total loss under verified Kra custody`
  - `Kra may refund the delivery charge and review compensation up to the declared value captured at booking, capped at GHS 2,000 in standard v1.`
- `Damage claim`
  - `Damage claims require manual review. Damage does not trigger automatic compensation in v1. The service fee may be refunded in full or in part if Kra-side fault is confirmed.`

Required caution:
- `Do not send prohibited items or misstate package contents. Sender-provided errors can affect refund and dispute outcomes.`

Design:
- Use a serious evidence panel, not an insurance-style promise.
- Show `Declared value`, `Custody evidence`, `Condition records`, and `Support notes` as the four review inputs.

### `PublicDisputeWindowAndSla`
Purpose:
- Publish the user-facing dispute window and response targets.

Required timeline:
1. `Open a dispute`
   - Text: `You may open a dispute within 7 calendar days of delivery completion, pickup-hold notification, or refund completion attempt.`
2. `Acknowledgement`
   - Text: `Internal acknowledgement target is 48 hours.`
3. `Standard review`
   - Text: `Standard disputes with complete evidence should be resolved within 5 business days.`
4. `Complex review`
   - Text: `Complex loss, damage, or provider-settlement disputes may extend to 10 business days with admin approval and a case note.`

Design:
- Use a timeline with clear milestones.
- Avoid progress bars that imply a user-specific case status.
- This page is policy, not live case tracking.

### `PublicEvidenceHierarchy`
Purpose:
- Make clear how disputes are decided.

Required intro:
`Kra reviews the strongest available record first. If digital evidence is complete, manual statements should not override it.`

Required ordered list:
1. `Confirmed handoff events`
2. `Payment verification and settlement records`
3. `Proof-of-delivery or proof-of-return artifacts`
4. `Issue thread and support notes`
5. `Manual witness statements when digital evidence is incomplete`

Design:
- Use an evidence stack or ranked list.
- Each item includes a short user explanation.

User explanations:
- Confirmed handoff events: `Who had the package, when it moved, and which scan or proof confirmed it.`
- Payment records: `What was charged, confirmed, duplicated, refunded, or still pending.`
- Proof artifacts: `Delivery, return, photo, signature, or OTP evidence where applicable.`
- Support notes: `What was reported, when, and by whom.`
- Witness statements: `Used only when digital records do not answer the case.`

### `PublicRefundExecutionTimeline`
Purpose:
- Explain what happens after a refund is approved.

Required content:
- `Approved refunds should return to the original payment method where technically possible.`
- `Once approved, the refund is initiated the same business day.`
- `Original-method refund completion target is within 3 business days.`
- `If the original method is unavailable, finance may use an alternate approved refund path only with adjustment reference, approver identity, and payout evidence.`
- `Alternate approved refund paths must complete within 5 business days.`
- `Cash refunds are not part of the standard v1 workflow.`

Design:
- Use a two-track timeline:
  - `Original payment method`
  - `Alternate approved path`
- Show `approved`, `initiated`, `settled`, and `completed` as conceptual steps.
- Do not show live provider state on this page.

### `PublicRefundNotAutomaticRules`
Purpose:
- Prevent false expectations and reduce support friction.

Required heading:
`What is not automatic`

Required bullets:
- `No automatic full refund after dispatch.`
- `No automatic compensation for damage in v1.`
- `No automatic refund for sender-provided incorrect receiver details.`
- `No automatic doorstep surcharge refund after a valid doorstep attempt.`
- `No cash refund in the standard v1 workflow.`
- `No provider reference or raw payment record is shown on this public page.`

Design:
- Use restrained warning styling.
- Avoid red-heavy alarm UI.
- Use short explanations, not legal paragraphs.

### `PublicRefundSupportPath`
Purpose:
- Route users to the right next action.

Layout:
- Three action panels:
  1. `Track first`
  2. `Start support review`
  3. `Read delivery policy`

Panel copy:
- Track first:
  - Title: `Track before you file`
  - Body: `Tracking can show whether the package is still moving, ready for pickup, on hold, or completed.`
  - CTA: `Track a package`
- Start support review:
  - Title: `Start refund or dispute review`
  - Body: `Use support when you have a payment issue, loss or damage claim, disputed proof, or refund question.`
  - CTA: `Start review`
- Read delivery policy:
  - Title: `Check the delivery stage`
  - Body: `Delivery stage affects refund eligibility, especially before intake, before dispatch, and after dispatch.`
  - CTA: `Read delivery policy`

Behavior:
- `Track a package` routes to `/track`.
- `Start review` routes to `/support`.
- `Read delivery policy` routes to `/delivery-policy`.

## FAQ Content
### Required Questions
Render these questions in this order:

1. `Can I get a full refund if I cancel?`
2. `What if my package was already received at the origin station?`
3. `What happens after dispatch?`
4. `Can I get the doorstep surcharge back?`
5. `What if express handling was not performed?`
6. `What if my package is lost?`
7. `What if my package is damaged?`
8. `How long do I have to open a dispute?`
9. `How long does refund settlement take?`
10. `Can Kra refund me in cash?`

### Required Answers
Question: `Can I get a full refund if I cancel?`

Answer: `If an eligible delivery is cancelled before origin intake, the amount collected can be refunded in full. After origin intake, the policy changes.`

Question: `What if my package was already received at the origin station?`

Answer: `If cancellation is approved after origin intake but before dispatch, Kra refunds the amount collected minus the GHS 5 handling fee.`

Question: `What happens after dispatch?`

Answer: `After dispatch, there is no automatic full refund. Refund outcomes require verified service failure, duplicate charge, platform payment error, or formal dispute ruling.`

Question: `Can I get the doorstep surcharge back?`

Answer: `The doorstep surcharge is refundable when it was charged but no valid doorstep attempt occurred. If at least one valid attempt occurred, the surcharge is treated as operationally consumed.`

Question: `What if express handling was not performed?`

Answer: `If express surcharge was charged but express handling was not performed because of Kra-side or staff-side failure, the express surcharge can be refunded.`

Question: `What if my package is lost?`

Answer: `Confirmed total loss under verified Kra custody can include a delivery-charge refund and compensation review up to the declared value, capped at GHS 2,000 in standard v1.`

Question: `What if my package is damaged?`

Answer: `Damage claims require manual review. Damage does not create automatic compensation in v1. The service fee may be refunded in full or part if Kra-side fault is confirmed.`

Question: `How long do I have to open a dispute?`

Answer: `You may open a dispute within 7 calendar days of delivery completion, pickup-hold notification, or refund completion attempt.`

Question: `How long does refund settlement take?`

Answer: `Once approved, refunds are initiated the same business day. Original-method refunds target completion within 3 business days. Approved alternate paths target completion within 5 business days.`

Question: `Can Kra refund me in cash?`

Answer: `Cash refunds are not part of the standard v1 workflow. Approved refunds should return to the original payment method where technically possible.`

## Final CTA
Component: `PublicRefundPolicyFinalCta`

Purpose:
- Convert policy understanding into the right action.

Required copy:
- Heading: `Need a refund or dispute review?`
- Body: `Start with your tracking code or delivery details. Kra will review payment records, delivery events, handoff evidence, and proof before a decision is made.`
- Primary CTA: `Start support request`
- Secondary CTA: `Track a package`

Design:
- Calm high-trust close.
- Do not repeat every policy rule.
- Use one compact evidence checklist.

## State Requirements
### Normal
Must render:
- Header.
- Hero.
- Summary.
- Eligibility matrix.
- Stage rules.
- Surcharge rules.
- Loss/damage rules.
- Dispute window and SLA.
- Evidence hierarchy.
- Refund execution timeline.
- Not-automatic rules.
- Support path.
- FAQ.
- Final CTA.
- Footer.

### Degraded Marketing Asset Load
If decorative images or textures fail:
- Content must remain fully usable.
- No layout shift larger than `0.1` CLS contribution.
- Decorative visuals may be replaced by CSS gradients or plain cards.

### No Backend Status State
This page must not render:
- `loading refund`
- `refund pending`
- `refund approved`
- `refund rejected`
- `settlement failed`

Those belong to authenticated sender/admin surfaces, not the public policy page.

## Interaction Requirements
### Matrix Interaction
- Matrix group headings must be visible on page load.
- Mobile accordions, if used, must default to expanded for `Usually eligible for full refund` and `Eligible for partial or surcharge refund`.
- Accordion buttons must expose `aria-expanded`.
- Keyboard users must be able to open and close every section.

### CTA Interaction
- Primary CTA routes to `/support`.
- Secondary CTA routes to `/track`.
- Delivery policy CTA routes to `/delivery-policy`.
- Links must preserve normal browser behavior:
  - open in current tab by default
  - support keyboard activation
  - show visible focus

### FAQ Interaction
- FAQ may use accordions.
- FAQ must be accessible by keyboard.
- FAQ open state must not be required for SEO-critical policy content; the matrix and timeline carry core content.

### Motion
Allowed:
- Hero content fade/slide on initial load.
- Matrix cards reveal with subtle stagger.
- Timeline milestone reveal on scroll.

Rules:
- All motion must use transform and opacity.
- Motion duration: `180ms` to `420ms`.
- Support `prefers-reduced-motion`.
- Do not animate money values in a way that resembles payout approval.

## Accessibility Requirements
### Structure
- Use one `h1`.
- Maintain logical heading order.
- Each policy group must have a descriptive heading.
- Matrix content must be understandable when read linearly.

### Contrast
- Body text contrast at least WCAG AA.
- Small labels must not use low-contrast grey.
- Amber review states need accessible text contrast.
- Do not rely on color alone for full, partial, review, or not-automatic states.

### Keyboard
- All links, accordions, and buttons must be keyboard accessible.
- Focus states must be visible against all backgrounds.
- Skip link should jump to main content.

### Screen Reader
- Decorative graphics must be `aria-hidden`.
- Timing chips must be real text.
- Eligibility cards must not be announced as meaningless icon groups.
- If using table markup, include column and row headers.

### Large Text
- Page must survive `200%` browser zoom.
- Matrix cards must wrap without clipping.
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
- Hero headline maximum visual line length should be controlled.
- Summary cards stack.
- Matrix groups stack.
- Evidence hierarchy becomes a numbered vertical list.
- Timeline becomes vertical.
- CTA group stacks.
- FAQ headings remain large enough for touch.

### Desktop Rules
- Hero uses 12-column grid.
- Matrix can use grouped card columns.
- Evidence and timeline can share one row only if neither loses scannability.
- Final CTA can use split layout with copy on left and actions on right.

## Data And Content Rules
### Static Policy Data
The page can define static policy data from docs:
- Refund eligibility groups.
- Stage descriptions.
- Surcharge rules.
- Loss/damage rules.
- Dispute windows.
- Evidence hierarchy.
- Settlement timing.

### No Client Calculation Authority
The page must not calculate:
- User-specific refund amount.
- User-specific compensation amount.
- Provider settlement timing.
- Case status.
- Final eligibility.

The page may show policy examples in words, but not a calculator.

### No Sensitive Data
Never render:
- raw provider reference
- payment provider payload
- customer phone
- receiver address
- actor ID
- refund ID
- audit event ID
- staff note
- internal finance note

## Analytics Requirements
Track only privacy-safe public events:
- `public_refund_policy_viewed`
- `public_refund_matrix_group_viewed`
- `public_refund_support_cta_clicked`
- `public_refund_track_cta_clicked`
- `public_refund_delivery_policy_cta_clicked`
- `public_refund_faq_opened`

Event properties:
- `screen_id`
- `route`
- `group_id` for matrix group views
- `faq_question_id` for FAQ opens
- `cta_id` for CTA clicks

Do not track:
- entered tracking code
- payment reference
- phone number
- support narrative
- refund claim text

## SEO Requirements
### Metadata
Title:
- `Refund Policy | Kra`

Description:
- `Understand Kra refund eligibility, dispute windows, evidence review, surcharge refunds, loss and damage review, and approved refund timing.`

Canonical:
- `/refund-policy`

### Open Graph
Title:
- `Kra Refund Policy`

Description:
- `Clear refund and dispute rules for Kra deliveries, including full refunds, partial refunds, surcharge refunds, evidence review, and settlement targets.`

### Structured Content
- Use semantic sections and headings.
- FAQ content may use FAQ structured data only if legal/product approves and answers exactly match visible content.
- Do not add structured data for guarantees or claims beyond policy text.

## Performance Requirements
- Page must not require JavaScript to read the policy.
- Initial content should be server-renderable or statically renderable.
- Avoid heavy animation libraries.
- Use CSS for visual texture where possible.
- Decorative images must be optimized and lazy-loaded.
- No third-party script should be added for this page.

Targets:
- Largest Contentful Paint target: under `2.5s` on a mid-tier mobile device.
- Cumulative Layout Shift target: under `0.1`.
- Interaction to Next Paint target: under `200ms` for accordion and CTA interactions.

## Security And Privacy Requirements
- This public page must not call authenticated refund endpoints.
- It must not expose backend error codes as public policy copy.
- It must not ask users to paste payment secrets.
- It must not show provider payloads.
- It must not imply that visiting the page starts a refund request.

## Error Prevention Rules
The UI must prevent these misunderstandings:
- User thinks refund is approved because a rule card says eligible.
- User thinks every post-dispatch delay is refundable.
- User thinks damage automatically creates compensation.
- User thinks cash refund is standard.
- User thinks the public page is a live refund status tracker.
- User thinks a receiver refusal cancels the sender contract.
- User thinks evidence order can be bypassed by manual statements.

Recommended copy qualifiers:
- `may be eligible`
- `requires review`
- `if verified`
- `when confirmed`
- `not automatic`
- `target`

Avoid:
- `approved`
- `guaranteed`
- `always`
- `immediate`
- `no questions asked`

## Testing Requirements
### Unit/Component Tests
Create tests that verify:
- Page renders `screen-public-refund-policy`.
- Hero headline is visible.
- Primary CTA links to `/support`.
- Secondary CTA links to `/track`.
- Delivery policy CTA links to `/delivery-policy`.
- Refund matrix groups render.
- `GHS 5` handling fee renders.
- `GHS 2,000` compensation cap renders.
- `7 calendar days` dispute window renders.
- `48 hours` acknowledgement target renders.
- `5 business days` standard review target renders.
- `10 business days` complex review target renders.
- `3 business days` original-method settlement target renders.
- `5 business days` alternate settlement target renders.
- Evidence hierarchy renders in correct order.
- FAQ renders the required questions.
- Page does not render a refund calculator.
- Page does not call authenticated refund endpoints.

### Accessibility Tests
Run automated checks for:
- No heading order violations.
- No unlabeled buttons.
- No inaccessible accordion controls.
- No low-contrast text.
- No keyboard traps.

Manual keyboard checklist:
- Tab through header, CTAs, matrix accordions if present, FAQ, and footer.
- Activate every accordion with keyboard.
- Confirm focus order follows visual order.
- Confirm focus returns logically after mobile menu close.

### Visual Regression Tests
Capture:
- Desktop normal.
- Tablet normal.
- Mobile normal.
- Mobile with one matrix group expanded.
- FAQ expanded state.
- Reduced motion.
- High contrast mode where supported.

### Content Regression Tests
Assert the page does not include:
- `instant refund`
- `guaranteed refund`
- `automatic compensation`
- `cash refund` except in the required negative policy statement
- `insurance included`
- `no questions asked`
- `claim approved`
- `every delay is refundable`

### Policy Alignment Tests
Assert:
- Full refund before origin intake is present.
- Partial refund after origin intake before dispatch includes `GHS 5`.
- Post-dispatch has no automatic full refund.
- Doorstep surcharge refund requires no valid attempt.
- Express surcharge refund requires express handling not performed because of Kra-side or staff-side failure.
- Total loss cap is `GHS 2,000`.
- Damage claim requires manual review.
- Dispute window is `7 calendar days`.
- Standard review target is `5 business days`.
- Complex review extension is `10 business days`.
- Original-method refund target is `3 business days`.
- Alternate approved path target is `5 business days`.

## Implementation Notes For Claude Code
### File Placement
Expected route implementation:
- `apps/web/src/routes/refund-policy` or the app's equivalent routing convention.

Expected shared components:
- Reuse public header/footer from prior public specs.
- Reuse public CTA/button primitives.
- Reuse policy card, accordion, and section primitives only if they preserve accessibility.

### Do Not Build
Do not build:
- Refund calculator.
- Case submission form on this page.
- Payment reference lookup.
- Live refund status tracker.
- Authenticated sender refund status UI.
- Admin refund approval UI.
- Finance settlement UI.

Those are separate screens in the inventory.

### Build With Real Policy Content
All user-facing content must be real policy wording from this spec and local docs. Do not insert invented cases, invented payout records, invented provider statuses, or illustrative user records.

### Copy Constants
Recommended content constants:
- `REFUND_POLICY_MATRIX_GROUPS`
- `REFUND_STAGE_RULES`
- `SURCHARGE_REFUND_RULES`
- `LOSS_DAMAGE_RULES`
- `DISPUTE_TIMELINE`
- `EVIDENCE_HIERARCHY`
- `REFUND_EXECUTION_RULES`
- `REFUND_POLICY_FAQ`

Keep constants close to the route unless the team already has a content module convention.

## Design Quality Review
Before closing implementation, review the screen from five perspectives:

Founder:
- Does this make Kra look financially disciplined and trustworthy?

Skeptical sender:
- Can I understand what I might get back and what proof matters?

Receiver:
- Can I understand refusal, damage, and failed delivery implications without sender-only language?

Finance/support operator:
- Does public copy match what the backend and policy docs can enforce?

Accessibility reviewer:
- Can I read, navigate, and understand the matrix without color, mouse, or animation?

If any answer is weak, revise before shipping.

## Content QA Checklist
- Headline is specific and not generic.
- Refund matrix appears before FAQ.
- Timelines use `target`, not guarantee language.
- Full refund cases match `docs/03-business/refund-and-dispute-rules.md`.
- Partial refund case matches `GHS 5` handling fee.
- Doorstep and express surcharge rules match policy.
- Loss cap is exactly `GHS 2,000`.
- Dispute timing matches policy.
- Evidence hierarchy matches policy order.
- Copy does not overpromise refunds, compensation, or settlement.
- Public labels do not expose internal reason codes.

## Source Alignment
This spec is grounded in:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/05-design/copy-deck.md`
- `packages/shared/src/domain/refunds.ts`

The screen must not contradict those sources.

## Spec Quality Review
### Completeness
Pass. The spec covers screen contract, route behavior, page IA, visual system, copy system, refund eligibility, stage rules, surcharge rules, loss/damage rules, dispute timing, evidence hierarchy, execution timeline, not-automatic rules, support routing, accessibility, analytics, SEO, testing, and implementation boundaries.

### Policy Accuracy
Pass. The spec uses the refund/dispute rules for full refund, partial refund, surcharge refund, post-dispatch review, loss, damage, dispute windows, evidence hierarchy, and settlement timing.

### Backend Boundary
Pass. The spec does not require live refund lookup, authenticated refund endpoints, issue creation, refund calculator, provider references, or admin finance workflows on the public page.

### UX Quality
Pass. The spec requires the matrix before FAQ, visible timing, clear evidence hierarchy, mobile-safe cards, and direct routing to support, tracking, and delivery policy.

### Copy Quality
Pass. The spec uses clear, accountable, low-hype policy language and explicitly rejects unsupported refund and compensation promises.

### Accessibility
Pass. The spec requires semantic headings, keyboard-safe accordions, accessible matrix content, contrast, reduced motion, large text, and no color-only meaning.

### Implementation Readiness
Pass. Claude Code can build this screen from the named components, content constants, interaction rules, and test requirements without needing hidden product decisions.

### Close Decision
Closed for implementation. This file is full enough for Claude Code to build `PublicRefundPolicy` end to end as a public, policy-accurate, high-trust refund and dispute page without creating frontend UI in this docs pass.
