# Public How It Works Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicHowItWorks` |
| App | `apps/web` |
| Route | `/how-it-works` |
| Primary test ID | `screen-public-how-it-works` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/track`, `/service-areas`, `/pricing`, `/trust-and-custody`, `/support` |
| Required states | `normal` |

## Product Job
This page must explain how Kra moves a package from booking to final proof through a controlled operating chain:

- Sender creates a delivery and confirms payment.
- Origin station receives the package and binds the package scan code.
- Assigned driver receives custody only after the correct scan.
- Package moves through an approved launch corridor.
- Destination station receives the package, checks condition, and prepares pickup or doorstep delivery.
- Final-mile courier receives custody only after the correct scan when doorstep is selected.
- Receiver pickup or doorstep delivery closes only with accepted proof.
- Exceptions move into support or station review instead of silent success.

This screen exists because Kra is not selling "a rider will take it somehow." Kra is selling controlled, accountable delivery for African corridors where informal handoffs often lose context, proof, and accountability.

## Audience
Primary audience:
- Senders and small merchants who need to understand whether Kra is safer than informal delivery.

Secondary audience:
- Receivers who want to know why they may receive an OTP or pickup instruction.
- Business senders evaluating operational reliability.
- Station, driver, courier, investor, and hiring prospects checking whether Kra is serious.

## User State
Most visitors arrive evaluating trust. They may not know the station model, they may worry about loss, and they may assume delivery means a single rider. The page must make the chain simple enough to remember and serious enough to trust.

## Primary Action
Primary CTA: `Track a package`

Secondary CTA: `Check service areas`

Tertiary CTA: `Start a delivery`

CTA behavior:
- `Track a package` routes to `/track`.
- `Check service areas` routes to `/service-areas`.
- `Start a delivery` routes to the approved sender entry route when available.
- If no production sender entry route exists, `Start a delivery` must route to `/service-areas` or an approved waitlist route, not a demo or placeholder.

## Main Tension
The visitor wants speed but fears losing a package. The page must explain that Kra's speed comes from operating discipline:

- Known corridors.
- Controlled stations.
- Payment before transport.
- Scan-bound custody.
- Role-specific handoffs.
- Receiver proof.
- Evidence-backed support.

## Visual Thesis
Design the page as a premium operating manual for everyday delivery: part clean mobility explainer, part custody ledger, part station network guide. It should feel polished enough for a top fintech/logistics brand and practical enough for a first-time sender in Accra, Kumasi, or Tamale.

## Restraint Rule
Do not create a decorative timeline that looks impressive but teaches nothing. Avoid generic courier icons, fake GPS maps, fake tracking records, motion-heavy animations, stock delivery photos, and empty "seamless" language.

Every visual object must teach one of these:
- Who has the package.
- What proof moves custody.
- Where stations fit.
- What the sender or receiver does next.
- What happens when something goes wrong.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of modern logistics, fintech, marketplace, and mobility product pages.

Non-negotiable quality requirements:
- A first-time visitor must understand the full Kra delivery chain within one page.
- The first viewport must explain the mechanism, not only the promise.
- The process section must make payment, station intake, scan binding, custody transfer, destination receipt, and receiver proof visibly distinct.
- The page must avoid "magic delivery" language. Every outcome must be connected to a responsible actor and proof point.
- The design must feel premium and composed, not like a generic FAQ page.
- The page must use motion only to clarify sequence, not to decorate.
- The page must work fully on mobile with no horizontal timeline overflow.
- The page must be accessible with keyboard, screen reader, reduced motion, and high contrast needs.
- The copy must be plain, specific, and operationally honest.
- The page must not promise live GPS, everywhere coverage, instant delivery, or pay-on-delivery.

Closure rule:
- If an implementation reviewer cannot explain how Kra prevents package loss after reading the page, the screen remains open.
- If any section exists only because it looks nice, remove or rewrite it.
- If the process chain is unclear on mobile, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- GOV.UK step-by-step navigation: use process navigation only when it helps people understand a sequence and move through related guidance.
- UPS tracking support: public tracking content should clarify status meaning, not expose internal operations.
- FedEx picture proof of delivery: delivery evidence and delivery-attempt evidence should be framed as confidence, dispute reduction, and next-step guidance.
- Uber item delivery pages: package movement can be explained through simple roles and clear user actions.
- W3C WCAG 2.2 quick reference: visible focus, contrast, reduced motion, semantics, and robust interaction are baseline requirements.

Reference links:
- https://design-system.service.gov.uk/patterns/step-by-step-navigation/
- https://www.ups.com/us/en/support/tracking-support.page
- https://www.fedex.com/en-us/tracking/picture-proof-delivery.html
- https://www.uber.com/us/en/item-delivery/
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external layouts, brand assets, wording, gradients, illustrations, animation timing, or component styling.

## Required Page Outcomes
A successful visitor must be able to answer:

- What is Kra's delivery model?
- Why does Kra use stations?
- What must happen before a package enters transport?
- Who owns the package at each point?
- Why is assignment different from custody?
- What does the receiver need for pickup or doorstep delivery?
- What proof closes the delivery?
- What happens when a handoff, scan, proof, or doorstep attempt fails?
- Where can I check service coverage, pricing, trust rules, support, and tracking?

## Route And Navigation Rules
### Route
- Render at `/how-it-works`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not render internal audit IDs, raw staff IDs, payment provider references, or internal issue notes.
- Must not invent live delivery examples or fake package data.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- `How it works` must be active for `/how-it-works`.

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
- Policy links.
- Support link.
- Contact path if defined elsewhere.

## Page IA
Render sections in this exact order:

1. `PublicHowItWorksHeader`
2. `PublicHowItWorksHero`
3. `PublicHowItWorksOperatingPromise`
4. `PublicHowItWorksProcessRail`
5. `PublicHowItWorksPaymentGate`
6. `PublicHowItWorksStationModel`
7. `PublicHowItWorksHandoffModel`
8. `PublicHowItWorksReceiverOptions`
9. `PublicHowItWorksExceptionHandling`
10. `PublicHowItWorksRoleMatrix`
11. `PublicHowItWorksFaq`
12. `PublicHowItWorksFinalCta`
13. `PublicHowItWorksFooter`

Do not add extra marketing sections before the FAQ. If the page feels long, reduce section copy rather than adding more chrome.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid for major sections.
- Hero min height: `620px`.
- Section vertical spacing: `96px`.
- Use asymmetric layouts:
  - Hero copy left, custody/process visual right.
  - Process rail full width.
  - Station model and handoff model may use split layouts.
- Keep the page clean enough that the process rail is the dominant teaching object.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Process rail may become a two-column step grid if readability improves.
- Avoid cramming long lines into a horizontal timeline.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Hero should be stacked.
- Process rail becomes a vertical sequence with strong step numbers.
- Sticky in-page navigation is optional on mobile. If used, it must not cover headings or CTAs.
- All accordions, tabs, and step controls must have `44px` minimum touch target height.

## Visual System Direction
Follow the public web design language from `PublicLanding`, but make this page more instructional.

Recommended art direction:
- Background: warm off-white or very light sand with subtle route-line texture.
- Accent: operational green for confirmed proof, deep ink for authority, limited amber for pending gates.
- Geometry: structured rails, checkpoints, station cards, and custody stamps.
- Illustration style: abstracted station-to-station route diagrams and evidence cards, not people-heavy stock imagery.
- Motion: one restrained sequence reveal as steps enter viewport; disabled or reduced to opacity-only under reduced motion.

Do not introduce a separate brand language for this page. It must feel like the same Kra public site.

## Copy System
### Voice
- Clear.
- Direct.
- Specific.
- Operationally confident.
- Low hype.

### Forbidden Copy
Do not use:
- `seamless`
- `revolutionary`
- `AI-powered`
- `instant delivery`
- `guaranteed fastest`
- `anywhere in Africa`
- `live GPS` unless the actual route supports it
- `pay on delivery`
- `zero risk`
- `no delays ever`

### Required Terms
Use these terms consistently:
- `origin station`
- `destination station`
- `package scan code`
- `handoff`
- `custody`
- `receiver proof`
- `OTP`
- `doorstep delivery`
- `service areas`
- `support review`

### Plain-Language Rule
If a sentence sounds like internal operations documentation, rewrite it for a sender or receiver while preserving the policy. Example:

Internal: `Transport state transitions require payment_status=paid.`

Public: `A package can be received at the station while payment is pending, but it cannot leave for transport until payment is confirmed.`

## Section Specs
### 1. `PublicHowItWorksHeader`
Purpose:
- Orient the user.
- Keep tracking and service areas one click away.
- Show that this is part of the public trust journey.

Required behavior:
- Same shared header implementation as landing page.
- Active nav item: `How it works`.
- Primary header CTA: `Track package`.
- Header must stay visually calm. Do not add process-specific badges in the nav.

Acceptance:
- `getByTestId("public-header")` exists if shared test ID is defined.
- `How it works` link has active state.
- `Track package` links to `/track`.

### 2. `PublicHowItWorksHero`
Purpose:
- Explain Kra's operating mechanism in the first viewport.
- Establish that Kra prevents loss by making custody visible and verifiable.

Hero content:
- Eyebrow: `How Kra works`
- H1: `A delivery chain you can verify from booking to proof.`
- Subheadline: `Kra moves packages through controlled stations, assigned drivers, optional doorstep couriers, and receiver proof so every important step has an owner.`
- Primary CTA: `Track a package`
- Secondary CTA: `Check service areas`
- Trust line: `Payment before transport. Scan-bound handoffs. Proof before completion.`

Hero visual:
- Use a `CustodyRoutePreview` visual, not a fake dashboard.
- The visual should show:
  - Booking.
  - Origin station.
  - Driver handoff.
  - Destination station.
  - Receiver pickup or doorstep.
  - Proof complete.
- Each checkpoint needs a short label and proof marker.
- The visual must not use real customer data.

Desktop composition:
- Left: copy and CTAs.
- Right: route/custody visual in a contained panel.
- Use one dominant visual, not many floating mini-cards.

Mobile composition:
- Copy first.
- CTAs stacked or side-by-side only if both fit comfortably.
- Route visual below copy with vertical step path.

Quality bar:
- The hero must teach the mechanism, not just sell trust.
- A visitor should not need the next section to learn that stations and proof are central.

### 3. `PublicHowItWorksOperatingPromise`
Purpose:
- Turn the hero promise into three concrete operating principles before the full process begins.

Layout:
- Three principle cards or a compact horizontal proof band.
- Use restrained visual treatment. This is a bridge, not the main event.

Required cards:

Card 1:
- Title: `Known corridors`
- Body: `Kra launches route by route so each delivery has a defined origin station, destination station, and operating owner.`

Card 2:
- Title: `Confirmed custody`
- Body: `Assignment does not move custody. Custody changes only after the right person confirms the right package.`

Card 3:
- Title: `Proof to close`
- Body: `A delivery is not complete until accepted receiver proof is recorded.`

Interaction:
- None beyond normal links if cards include supporting links.

Link options:
- `See service areas` -> `/service-areas`
- `Read trust rules` -> `/trust-and-custody`

### 4. `PublicHowItWorksProcessRail`
Purpose:
- Provide the canonical page teaching model.
- Explain the delivery lifecycle as a scannable sequence.
- Make loss prevention visible at each step.

This is the most important section on the page.

Section heading:
- Eyebrow: `The delivery chain`
- H2: `Every move has a next owner.`
- Intro: `Kra uses payment gates, station checks, package scans, and receiver proof to keep the package state clear from start to finish.`

Required process steps:

Step 1:
- Title: `Create delivery and confirm payment`
- Actor: `Sender`
- Public copy: `The sender chooses the route, package details, pickup option, and pays the quoted amount.`
- Proof/control: `Quote and payment status`
- Policy note: `No pay-on-delivery in v1.`

Step 2:
- Title: `Drop package at origin station`
- Actor: `Sender and origin station`
- Public copy: `The station receives the package, checks the booking, and records intake.`
- Proof/control: `Intake timestamp and sender acknowledgement`
- Policy note: `A package cannot be dispatched before origin receipt.`

Step 3:
- Title: `Bind the package scan code`
- Actor: `Origin station`
- Public copy: `The station binds one package scan code to one delivery so later scans must match the same delivery.`
- Proof/control: `Registered package scan code`
- Policy note: `Duplicate or mismatched labels must block the handoff.`

Step 4:
- Title: `Assigned driver scans and accepts custody`
- Actor: `Driver`
- Public copy: `The driver may be assigned before pickup, but custody moves only after the assigned driver scans the correct package.`
- Proof/control: `Driver confirmation and dispatch timestamp`
- Policy note: `Assignment is not custody.`

Step 5:
- Title: `Package moves between stations`
- Actor: `Driver`
- Public copy: `The package travels through the approved corridor from the origin station to the destination station.`
- Proof/control: `Transport status and route context`
- Policy note: `Transport states require confirmed payment.`

Step 6:
- Title: `Destination station receives and checks condition`
- Actor: `Destination station`
- Public copy: `The destination station scans the package, confirms receipt, and records condition before pickup or doorstep delivery.`
- Proof/control: `Receipt scan and condition check`
- Policy note: `Destination receipt makes the station accountable again.`

Step 7:
- Title: `Receiver pickup or doorstep assignment`
- Actor: `Receiver, station, or final-mile courier`
- Public copy: `The receiver can collect at the station, or Kra can assign doorstep delivery where the address is serviceable.`
- Proof/control: `Pickup instruction or courier assignment`
- Policy note: `Doorstep is available only within approved final-mile zones.`

Step 8:
- Title: `Delivery closes with receiver proof`
- Actor: `Receiver and courier or station`
- Public copy: `The delivery closes only after accepted proof such as OTP, signature, or photo proof is recorded.`
- Proof/control: `Receiver proof and completion timestamp`
- Policy note: `No final proof means no silent completion.`

Visual requirements:
- Each step must show:
  - Step number.
  - Main actor.
  - User-facing status label.
  - Proof/control chip.
  - One short policy note.
- Use a rail, chapter stack, or controlled stepper.
- Do not render as eight identical cards in a generic grid.
- Show custody-changing steps more strongly than informational steps.

Recommended desktop design:
- Left sticky chapter list with steps.
- Right detail panel that changes or scrolls through step cards.
- A thin route line connects station and custody moments.

Recommended mobile design:
- Vertical step cards with a clear connector.
- Each card expands only if needed.
- Expanded state must not hide the next step.

Interaction:
- Step cards may be clickable to reveal details.
- On keyboard focus, the active step detail must be reachable.
- The page must still explain the process if JavaScript-enhanced interaction is unavailable.

Accessibility:
- Use ordered list semantics if possible.
- If using tabs or stepper buttons, implement ARIA correctly.
- Do not rely on color alone to distinguish custody, payment, or proof.

Testing:
- Assert eight steps render.
- Assert required policy notes are present.
- Assert mobile layout does not overflow horizontally.
- Assert keyboard navigation reaches each step.

### 5. `PublicHowItWorksPaymentGate`
Purpose:
- Make payment rules clear before the user starts a delivery.
- Prevent false expectations around cash, bargaining, or pay-on-delivery.

Section heading:
- Eyebrow: `Payment gate`
- H2: `Payment is confirmed before transport.`
- Intro: `Kra can create and receive a package while payment is pending, but the package cannot enter transport until payment is confirmed.`

Required content blocks:

Block 1:
- Title: `Quote first`
- Body: `The sender sees the route, weight, size, service, and doorstep components before payment.`

Block 2:
- Title: `Locked at booking`
- Body: `The final quoted amount is stored with the delivery so later route-price changes do not change existing obligations.`

Block 3:
- Title: `No pay-on-delivery`
- Body: `Pay-on-delivery is not supported in v1 because it weakens dispatch control and refund accountability.`

Required link:
- `See pricing rules` -> `/pricing`

Design:
- Use a strong but calm gate motif: a checkpoint, lock, or "cleared for dispatch" card.
- Do not make the section feel punitive.
- The copy should make payment control feel like customer protection, not just Kra policy.

Acceptance:
- Page states `No pay-on-delivery in v1`.
- Page states package cannot enter transport until payment is confirmed.
- Page links to pricing explainer.

### 6. `PublicHowItWorksStationModel`
Purpose:
- Explain why Kra uses stations and corridors.
- Prevent misunderstanding that Kra promises everywhere-to-everywhere delivery at launch.

Section heading:
- Eyebrow: `Station network`
- H2: `Stations keep delivery accountable.`
- Intro: `Kra starts with controlled station pairs so routes, package checks, and support ownership are clear before wider expansion.`

Required launch network content:
- Launch stations:
  - `Accra Central`
  - `Kumasi Adum`
  - `Tamale Central`
- Launch corridors:
  - `Accra Central <-> Kumasi Adum`
  - `Accra Central <-> Tamale Central`
  - `Kumasi Adum <-> Tamale Central`
- Doorstep availability:
  - `Doorstep delivery is available only within 10km of the destination station in each launch city.`

Visual:
- Use a simplified corridor map or station board.
- Map must be conceptual unless exact GIS data is already approved.
- Do not imply national coverage beyond approved launch corridors.
- Do not use animated moving vehicles unless the motion clearly supports route comprehension.

Cards:

Card 1:
- Title: `Origin station`
- Body: `Receives the package, binds the scan code, and prepares dispatch.`

Card 2:
- Title: `Destination station`
- Body: `Receives the package, checks condition, and prepares pickup or doorstep delivery.`

Card 3:
- Title: `Doorstep zone`
- Body: `Available only where final-mile handoff and proof can be controlled.`

Required link:
- `Check service areas` -> `/service-areas`

Acceptance:
- No copy promises unapproved cities.
- 10km doorstep rule is visible.
- Launch stations are named exactly as approved.

### 7. `PublicHowItWorksHandoffModel`
Purpose:
- Explain the core loss-prevention system.
- Teach the difference between assignment and custody.

Section heading:
- Eyebrow: `Handoffs`
- H2: `The package changes owners only after proof.`
- Intro: `A staff assignment tells the next person what to do. A confirmed handoff changes who is accountable for the package. Kra keeps those separate.`

Required explanation:
- `Assignment` means a person has been selected for the next task.
- `Custody` means that person has accepted the correct package through a confirmed proof event.
- The last fully confirmed custodian remains accountable by default.
- Fallback handoffs require manual package ID, receiving-party confirmation, supervisor PIN, and a fallback flag.

Required handoff table:

| Handoff | Required public explanation | Required proof/control |
| --- | --- | --- |
| Sender -> Origin station | Station receives the package and records intake. | Package ID, intake timestamp, sender acknowledgement |
| Origin station -> Driver | Assigned driver scans the correct package before pickup. | Package scan, driver confirmation, dispatch timestamp |
| Driver -> Destination station | Destination station scans and checks condition. | Package scan, operator confirmation, condition check |
| Destination station -> Final-mile courier | Assigned courier scans before doorstep custody starts. | Package scan, courier confirmation, assignment timestamp |
| Final-mile courier -> Receiver | Receiver proof closes the delivery. | OTP, signature, or delivery photo plus timestamp |

Visual:
- Use a `HandoffEvidenceCard` pattern.
- Show evidence items as tangible chips:
  - `scan`
  - `timestamp`
  - `actor`
  - `condition`
  - `receiver proof`
- Do not expose internal actor IDs or admin audit terms.

Interaction:
- Table can become accordion cards on mobile.
- Each handoff card can reveal "What blocks it?" details.

Blocker examples:
- `Wrong scan code`
- `Payment not confirmed`
- `Missing receiver proof`
- `Doorstep zone unavailable`
- `Second failed attempt reached`

Acceptance:
- Page explicitly says assignment is not custody.
- Page explains the last confirmed custodian rule in public language.
- Page does not expose internal audit identifiers.

### 8. `PublicHowItWorksReceiverOptions`
Purpose:
- Explain what the receiver experiences.
- Support receiver trust without requiring a full account model.

Section heading:
- Eyebrow: `Receiver options`
- H2: `The receiver can pick up or receive doorstep delivery where available.`
- Intro: `Once the package reaches the destination station, Kra guides the receiver through station pickup or approved doorstep delivery.`

Required option cards:

Option 1:
- Title: `Station pickup`
- Best for: `Receivers near the destination station or senders who prefer lower delivery cost.`
- Process:
  - Receiver receives pickup instruction.
  - Station verifies the package and recipient context.
  - Pickup closes with accepted handoff proof.
- Copy note: `Use this for simple, predictable pickup.`

Option 2:
- Title: `Doorstep delivery`
- Best for: `Receivers within the approved 10km final-mile zone.`
- Process:
  - Destination station assigns a courier.
  - Courier scans the package before custody moves.
  - Courier completes delivery with OTP, signature, or photo proof.
- Copy note: `Use this when final-mile completion can be controlled.`

Receiver privacy rule:
- Public receiver flows must not expose sender IDs, staff IDs, payment provider references, raw issue descriptions, or internal audit details.
- Receiver-safe tracking should show meaningful delivery progress and instructions only.

Required proof explanation:
- `OTP is the default doorstep proof method.`
- `Signature or delivery photo can be used when policy allows fallback proof.`
- `Proof must be accepted before completion.`

Required link:
- `Learn about tracking` -> `/track`

Acceptance:
- Section clearly distinguishes pickup from doorstep.
- Section states doorstep distance limit.
- Section states receiver proof options without exposing internal proof asset IDs.

### 9. `PublicHowItWorksExceptionHandling`
Purpose:
- Show what happens when delivery is not perfect.
- Build trust by explaining recovery, not pretending exceptions do not happen.

Section heading:
- Eyebrow: `When something needs attention`
- H2: `Exceptions go to review instead of disappearing.`
- Intro: `If a scan, proof, address, payment, or handoff does not meet policy, Kra keeps the package in a controlled state and routes the issue to the right queue.`

Required exception cards:

Card 1:
- Title: `Wrong package scan`
- What it means: `The scanned code does not match the delivery.`
- What happens next: `The handoff is blocked and the staff member must scan again or escalate.`

Card 2:
- Title: `Payment not confirmed`
- What it means: `The package can be received but cannot move into transport.`
- What happens next: `The sender resolves payment before dispatch.`

Card 3:
- Title: `Receiver unavailable`
- What it means: `The courier could not complete doorstep delivery.`
- What happens next: `One reattempt is allowed within 24 hours. After a second failed attempt, the package returns to destination-station pickup.`

Card 4:
- Title: `Receiver refusal`
- What it means: `The receiver refused the package.`
- What happens next: `The delivery enters support review to decide pickup, return-to-sender, or dispute outcome.`

Card 5:
- Title: `Missing final proof`
- What it means: `The delivery does not have accepted OTP, signature, or photo proof.`
- What happens next: `The package cannot be silently marked delivered.`

Card 6:
- Title: `Damage, loss, or dispute`
- What it means: `A customer reports a serious delivery issue.`
- What happens next: `Support reviews handoff events, proof, payment, and case notes before deciding the outcome.`

Required policy statements:
- `One doorstep reattempt is allowed within 24 hours of the first failed attempt.`
- `After the second failed doorstep attempt, the package returns to destination-station pickup.`
- `Customers can open a dispute within 7 calendar days of delivery completion, pickup-hold notification, or refund completion attempt.`
- `Standard disputes with complete evidence should be resolved within 5 business days.`

Required link:
- `Contact support` -> `/support`

Design:
- Use a calm exception board, not red-alert styling everywhere.
- Reserve red for destructive or severe states.
- Use amber for needs attention.
- Use green only for resolved or accepted proof.

Acceptance:
- The page explains exception recovery without promising automatic refunds.
- The failed-attempt policy is exact.
- The dispute window and standard resolution target are visible.

### 10. `PublicHowItWorksRoleMatrix`
Purpose:
- Summarize who does what without requiring the visitor to read operations docs.
- Make accountability legible.

Section heading:
- Eyebrow: `Who does what`
- H2: `Each role has a clear job.`
- Intro: `Kra reduces ambiguity by assigning each part of the delivery chain to a specific role.`

Required role rows:

| Role | Main job | What they must not bypass |
| --- | --- | --- |
| Sender | Create delivery, confirm payment, give accurate receiver and package details. | Cannot expect transport before payment is confirmed. |
| Origin station | Receive package, bind scan code, prepare dispatch. | Cannot dispatch before origin receipt and payment gate are satisfied. |
| Driver | Move package between approved stations. | Cannot take custody without assigned pickup and correct scan. |
| Destination station | Receive package, check condition, prepare pickup or doorstep. | Cannot treat assignment as final delivery. |
| Final-mile courier | Deliver doorstep packages where serviceable. | Cannot complete without accepted receiver proof. |
| Receiver | Pick up or receive package and provide required proof. | Cannot access internal sender, staff, payment, or audit information. |
| Support and admin | Review exceptions, disputes, refunds, and operational blockers. | Cannot decide outcomes without evidence hierarchy. |

Visual:
- Matrix on desktop.
- Accordion cards on mobile.
- Role names must be scannable.

Acceptance:
- Every role above appears.
- Matrix remains readable at `320px` width.
- No role card includes internal-only IDs.

### 11. `PublicHowItWorksFaq`
Purpose:
- Resolve objections that remain after the main process.
- Reduce support load.

Behavior:
- Use accessible accordion.
- Multiple panels may be open if implementation supports it cleanly.
- Headings must be literal and searchable.
- Accordion must be keyboard reachable.

Required FAQ items:

FAQ 1:
- Question: `Where does Kra work at launch?`
- Answer: `Kra starts with Accra Central, Kumasi Adum, and Tamale Central station corridors. Doorstep delivery is limited to approved final-mile zones within 10km of the destination station.`

FAQ 2:
- Question: `Why does Kra use stations?`
- Answer: `Stations give each package a controlled place for intake, dispatch, receipt, condition checks, pickup, and support review.`

FAQ 3:
- Question: `When do I pay?`
- Answer: `The sender sees the quote before payment. A package can be received while payment is pending, but it cannot enter transport until payment is confirmed.`

FAQ 4:
- Question: `What happens if the wrong package is scanned?`
- Answer: `The handoff is blocked. The staff member must scan again or follow the approved escalation path.`

FAQ 5:
- Question: `What if the receiver is unavailable for doorstep delivery?`
- Answer: `Kra allows one reattempt within 24 hours. After the second failed attempt, the package returns to the destination station for pickup.`

FAQ 6:
- Question: `What proof is required at delivery?`
- Answer: `Doorstep delivery uses OTP by default. Signature or photo proof may be used as fallback proof when policy allows. A delivery is not complete until accepted proof is recorded.`

FAQ 7:
- Question: `Does Kra show live GPS?`
- Answer: `Kra's public tracking is event-first. It shows meaningful package progress and receiver-safe instructions without exposing unnecessary internal movement or staff data.`

FAQ 8:
- Question: `Can I get a refund if something goes wrong?`
- Answer: `Refunds depend on timing and evidence. Before origin intake, eligible cancellations can receive a full refund. After dispatch, refund decisions require support or dispute review.`

FAQ 9:
- Question: `Who is accountable if a package is lost?`
- Answer: `Kra reviews the last confirmed custody event, payment records, proof, and support notes. The last fully confirmed custodian is accountable by default unless evidence shows otherwise.`

Required links below FAQ:
- `See pricing` -> `/pricing`
- `Read trust and custody` -> `/trust-and-custody`
- `Contact support` -> `/support`

Acceptance:
- FAQ includes all required questions.
- FAQ does not contradict pricing, refund, delivery lifecycle, or handoff docs.
- FAQ answers are short enough for mobile.

### 12. `PublicHowItWorksFinalCta`
Purpose:
- Close with action after the visitor understands the model.

Layout:
- Full-width CTA band or strong split panel.
- Keep it focused. Do not add more process explanation here.

Copy:
- Eyebrow: `Ready when your route is covered`
- H2: `Move packages through a chain you can check.`
- Body: `Track an existing package, check active service areas, or start a delivery when your route is available.`
- Primary CTA: `Track a package`
- Secondary CTA: `Check service areas`
- Tertiary text link: `See pricing`

Behavior:
- Primary routes to `/track`.
- Secondary routes to `/service-areas`.
- Tertiary routes to `/pricing`.

Quality bar:
- This section must feel like a confident close, not a newsletter block or generic sales banner.

### 13. `PublicHowItWorksFooter`
Purpose:
- Provide stable public navigation and legal/support paths.

Required:
- Same shared footer as public landing.
- Route links remain crawlable.
- Support path visible.
- Policy links visible if defined.

## Component Inventory
Claude Code should create or reuse components with these responsibilities:

### `PublicHowItWorksPage`
- Owns page composition.
- Sets route metadata.
- Renders `data-testid="screen-public-how-it-works"`.
- Does not fetch authenticated data.

### `PublicProcessRail`
- Renders the eight canonical process steps.
- Supports desktop enhanced sequence and mobile stacked sequence.
- Preserves ordered semantics.
- Accepts static step content from a local constants file.

### `ProcessStepCard`
- Renders step number, title, actor, copy, proof/control, and policy note.
- Provides expanded details if interaction is used.
- Supports keyboard focus and visible focus style.

### `OperatingPromiseBand`
- Renders the three operating principles.
- Links to service areas and trust/custody where helpful.

### `PaymentGatePanel`
- Explains quote, locked booking price, and no pay-on-delivery.
- Links to pricing.

### `StationModelDiagram`
- Renders launch station/corridor explanation.
- Uses conceptual map or station board.
- Must not imply unapproved geography.

### `HandoffEvidenceCard`
- Renders evidence required by each handoff.
- Must not expose internal actor IDs.

### `ReceiverPathSwitcher`
- Compares station pickup and doorstep delivery.
- If implemented as tabs, must meet accessible tab behavior.
- If implemented as cards, no JS state is required.

### `ExceptionOutcomePanel`
- Renders exception cards with "what it means" and "what happens next."
- Uses calm severity styling.

### `RoleResponsibilityMatrix`
- Renders role/accountability table on desktop.
- Renders accordion cards or stacked rows on mobile.

### `PublicFaqAccordion`
- Reusable public FAQ accordion.
- Must support keyboard access.
- Must preserve heading hierarchy.

### `PublicFinalCta`
- Shared final CTA pattern from public pages if available.
- Accepts page-specific copy and links.

## Data And Content Source
This page is static content for v1.

Allowed local sources:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/service-areas-and-stations.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/07-api/error-codes.md`

Do not fetch:
- Authenticated delivery data.
- Admin settings.
- Real customer examples.
- Payment provider state.
- Staff records.
- Live driver location.

If station or service-area data later becomes public API data, this screen can link to or embed the approved public service-area component, but it must not independently calculate coverage.

## State Handling
Required page state:
- `normal`

Non-blocking component fallback:
- If a decorative or instructional route diagram asset fails to load, render the process rail and text content normally.
- Do not show a page-level error for a missing illustration.
- Use a text fallback: `The delivery chain is still shown below as steps.`

No states required:
- No loading state for the full page.
- No empty state for the full page.
- No authenticated error state.
- No API error state.

## Interaction Rules
### In-Page Navigation
Optional but recommended on desktop:
- Sticky mini-nav with:
  - `Process`
  - `Stations`
  - `Handoffs`
  - `Receiver`
  - `Exceptions`
  - `FAQ`
- It must not compete with the global header.
- It must use anchor links, not hidden route changes.
- Active section highlight must not rely on color alone.

Mobile:
- In-page nav may be omitted if it creates clutter.
- If included, use horizontal scroll with visible affordance and no hidden critical actions.

### Process Step Interaction
Allowed:
- Click a step to reveal detail.
- Scroll-spy active step.
- Gentle line progress as steps enter viewport.

Not allowed:
- Fake live tracking.
- Animated vehicles racing across a map.
- Overly complex parallax.
- Required hover interaction.
- Hidden key policy details behind icons only.

### FAQ Interaction
- Use button elements for accordion triggers.
- `aria-expanded` must reflect state.
- Panel content must be reachable by screen readers.

### Motion
Allowed:
- Step reveal on first viewport entry.
- Subtle connector line draw.
- CTA hover/focus transitions.

Rules:
- Motion duration should generally stay under `300ms`.
- Use transform and opacity.
- Respect `prefers-reduced-motion`.
- No looping motion.
- No motion that delays reading.

## SEO And Metadata
Page title:
- `How Kra Works | Verified Delivery Chain Across Stations`

Meta description:
- `Learn how Kra moves packages through controlled stations, scan-bound handoffs, confirmed payment, receiver proof, and support review.`

Open Graph:
- Title: `How Kra works`
- Description: `A verified delivery chain from booking to receiver proof.`
- Image: use approved public brand/social image only.

Structured content:
- Use semantic headings.
- FAQ content may use FAQ schema only if the implementation already supports schema safely.
- Do not add schema that claims service coverage beyond approved launch corridors.

## Analytics Contract
Use analytics only if the public analytics layer already exists. Do not add a new provider from this screen.

Events:

### `public_how_it_works_viewed`
Fire when the page renders.

Payload:
- `route`: `/how-it-works`
- `screen_id`: `PublicHowItWorks`

### `public_how_it_works_step_viewed`
Fire when a process step becomes active or visible for the first time.

Payload:
- `step_number`
- `step_key`
- `actor`

Do not include:
- Tracking codes.
- Phone numbers.
- Delivery IDs.
- Sender or receiver identity.

### `public_how_it_works_cta_clicked`
Fire when a major CTA is clicked.

Payload:
- `cta_label`
- `destination_route`
- `section`

### `public_how_it_works_faq_opened`
Fire when a FAQ item opens.

Payload:
- `question_key`

Privacy:
- Never include personal data.
- Never include raw query strings.
- Never include tracking codes.

## Accessibility Requirements
Baseline:
- One `h1`.
- Logical heading order.
- Semantic `main`.
- Header and footer landmarks.
- All interactive elements reachable by keyboard.
- Visible focus on links, buttons, accordions, tabs, and step controls.
- Color contrast must meet WCAG AA for normal and large text.
- Text must remain readable at 200% zoom.
- No horizontal page scroll at `320px`.
- No required hover.
- `prefers-reduced-motion` must disable non-essential motion.

Process rail:
- Prefer `ol` for the eight steps.
- If a custom stepper is used, expose labels and selected state clearly.
- Do not use icons as the only label.

Tables:
- Handoff and role tables must have headers.
- On mobile, if tables become cards, preserve the header meaning inside each card.

Accordion:
- Use button triggers.
- Keep focus order predictable.
- Do not trap focus.

Images and diagrams:
- Decorative visuals use empty alt text.
- Informational diagrams need concise alt text and nearby text equivalent.

## Performance Requirements
- Static page render must be fast on mobile networks.
- Avoid large map libraries for this page.
- Prefer CSS/vector diagrams or optimized local assets.
- No autoplay video.
- No heavy third-party embeds.
- Use responsive images if images are added.
- Keep JavaScript interaction progressive.
- Content must be understandable before animation completes.

Performance acceptance:
- Page should remain usable without the route diagram asset.
- First contentful content should be dominated by text, not by a blocked hero image.
- Do not add dependencies solely for this page's decorative visuals.

## Responsive Acceptance
### 1440px
- Hero feels composed, not stretched.
- Process rail is the visual anchor.
- In-page nav, if present, has enough breathing room.

### 1024px
- Hero and route visual remain balanced.
- Process rail still reads in order.
- Role matrix remains scannable or cleanly adapts.

### 768px
- Split layouts stack where needed.
- No cramped multi-column table.
- CTAs remain visible above or immediately after hero copy.

### 390px
- Process cards are vertical.
- FAQ answers do not overflow.
- Station/corridor content remains literal and readable.
- Touch targets meet size requirements.

### 320px
- No horizontal scroll.
- No clipped CTA text.
- Step labels wrap cleanly.
- Diagram fallback still allows full understanding.

## Testing Contract
### Unit And Component Tests
Required tests:
- Renders `screen-public-how-it-works`.
- Renders hero H1 exactly.
- Renders primary CTA linking to `/track`.
- Renders secondary CTA linking to `/service-areas`.
- Renders all eight process steps.
- Renders payment gate copy including `No pay-on-delivery`.
- Renders launch stations exactly.
- Renders assignment-versus-custody explanation.
- Renders receiver proof options.
- Renders failed-attempt policy.
- Renders all FAQ questions.
- Accordion or stepper controls expose correct accessibility attributes.

### Accessibility Tests
Required:
- Axe or equivalent automated check has no critical violations.
- Keyboard can reach:
  - header links
  - hero CTAs
  - process step controls if interactive
  - FAQ triggers
  - final CTA
- Reduced motion snapshot does not depend on animation for content.

### E2E Tests
Add or extend public web E2E coverage:

Test name:
- `e2e-public-how-it-works-process`

Flow:
- Visit `/how-it-works`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Assert all eight process steps are visible or reachable.
- Assert `Track a package` opens `/track`.
- Return to `/how-it-works`.
- Assert `Check service areas` opens `/service-areas`.
- Return to `/how-it-works`.
- Open FAQ item about live GPS.
- Assert answer says tracking is event-first.

Test name:
- `e2e-public-how-it-works-mobile`

Flow:
- Set mobile viewport.
- Visit `/how-it-works`.
- Assert no horizontal overflow.
- Assert process steps are stacked or reachable.
- Assert FAQ can be opened by keyboard or tap.

### Visual Regression
Capture:
- Desktop hero and process rail.
- Mobile hero and first three steps.
- Mobile FAQ open state.

Do not accept:
- Timeline text collisions.
- Clipped cards.
- Low contrast proof chips.
- Generic placeholder imagery.

## Content Acceptance Checklist
- The page names all launch stations correctly.
- The page names all launch corridors correctly.
- The page states doorstep is only within `10km` of destination station.
- The page states payment is required before transport.
- The page states no pay-on-delivery in v1.
- The page states assignment is not custody.
- The page states custody moves only after proof.
- The page states final delivery requires OTP, signature, or photo proof.
- The page states one reattempt is allowed within `24 hours`.
- The page states second failed doorstep attempt returns to destination-station pickup.
- The page states public tracking is event-first, not fake live GPS.
- The page links to tracking, service areas, pricing, trust/custody, and support.

## Design Quality Review Checklist
Before closing implementation, review the UI against five perspectives:

Founder:
- Does the page make Kra feel like a serious operating company, not a courier brochure?

Skeptical sender:
- Can I understand why my package is safer than with informal handoff?

Receiver:
- Do I know what proof I may need and why?

Operator:
- Does the page accurately describe the custody chain without undermining policy?

Accessibility reviewer:
- Can the page be understood and operated without mouse, animation, or perfect vision?

Creative director:
- Is there one memorable visual idea, or just generic cards?

If any answer is weak, revise the page before moving to the next spec.

## Claude Code Build Notes
Claude Code should:
- Build only this screen and shared components required by this screen.
- Reuse public header/footer where possible.
- Keep content constants near the page or in a public content module.
- Avoid adding real API calls.
- Avoid demo data files that look like production state.
- Avoid fake delivery IDs, fake people, fake tracking records, or fake map pins.
- Use approved route links only.
- Follow existing project patterns for routing, metadata, tests, and styling.
- Add tests at the same quality level as other public web routes.

Claude Code should not:
- Implement unrelated screens.
- Invent UI states outside this spec.
- Add a tracking form to this page.
- Add live map dependencies.
- Add placeholder "coming soon" sections.
- Add stock photography.
- Copy external site layouts.

## Open Decisions
No product decision blocks this screen.

Implementation may choose:
- Whether process details are always visible or progressively expanded.
- Whether the route diagram is pure CSS, SVG, or an optimized static asset.
- Whether desktop uses sticky chapter navigation.

Implementation must not choose:
- Different lifecycle steps.
- Different launch stations.
- Different doorstep distance limit.
- Pay-on-delivery copy.
- Fake GPS tracking promise.
- Internal data exposure.

## Spec Quality Review
### Top-Tier Product Standard Pass
Pass. The spec defines a precise visual thesis, a clear restraint rule, a serious process teaching model, non-generic visual requirements, and a closure rule tied to user comprehension.

### Industry Inspiration Translation Pass
Pass. External references are translated into principles:
- Process navigation should clarify sequence.
- Tracking should explain status without leaking internal data.
- Proof should be framed as evidence and resolution support.
- Accessibility is built into component requirements.

No external wording, assets, or layout are copied.

### Implementation Readiness Pass
Pass. The spec gives route contract, page IA, exact copy, components, interactions, responsive behavior, analytics, accessibility, SEO, and tests.

### Policy Consistency Pass
Pass. The spec is aligned to lifecycle, handoff, pricing, station, doorstep, refund, dispute, and public privacy constraints.

### Remaining Constraints Accepted
Accepted:
- The page is static for v1.
- It does not calculate serviceability or pricing.
- It does not show live GPS.
- It does not expose internal records.
- It leaves UI implementation to Claude Code.

### Close Decision
Ready for Claude Code implementation after this document is merged and CI is green.
