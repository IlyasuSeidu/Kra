# Create Delivery Start Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CreateDeliveryStart` |
| App | `apps/mobile` |
| Route | `/(sender)/create` |
| Primary test ID | `screen-create-delivery-start` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Local draft only |
| Related routes | `/(sender)/home`, `/(sender)/create/stations`, `/(sender)/create/receiver`, `/(sender)/create/package`, `/(sender)/create/options`, `/(sender)/create/quote`, `/(sender)/create/summary` |
| Required states | `normal` |

## Product Job
This screen begins the sender delivery creation flow. It must help the sender understand the booking steps, start or resume a local draft, and move into station selection without creating backend delivery state or presenting unverified price, payment, route, or doorstep claims.

The sender should be able to:
- Start a new delivery draft.
- Resume an existing local draft when safe.
- Understand the booking sequence.
- Know what information will be needed.
- Understand that final price appears before payment.
- Understand that payment is required before dispatch.
- Move to station selection confidently.

This screen is not station selection, receiver details, package details, delivery options, quote review, delivery confirmation, payment, delivery detail, tracking, support, or a policy article.

## Audience
Primary audience:
- Authenticated senders starting a new delivery.
- First-time senders arriving from onboarding and sign-in.
- Repeat senders creating another package booking.
- Small-business senders who need a fast, predictable booking start.

Secondary audience:
- Senders returning to an incomplete local draft.
- Senders on weak mobile data who need clarity before entering fields.
- QA engineers validating flow boundaries.
- Claude Code implementing the delivery creation route.

## User State
The sender has decided to create a delivery but may not yet have all details ready. They need to know the flow is short, that price appears before payment, that receiver phone matters, and that station and package rules will be checked later. The screen must reduce uncertainty without asking for everything at once.

The screen must:
- Show one clear primary action.
- Explain the required steps without overwhelming the sender.
- Make resume/new-draft behavior explicit.
- Avoid collecting fields on this route.
- Avoid creating server state.
- Avoid showing local price math.

## Primary Action
Primary CTA:
- `Start delivery`

Secondary CTA when a safe local draft exists:
- `Resume draft`

Tertiary action:
- `Back to home`

CTA behavior:
- `Start delivery` creates or resets a local draft shell and routes to `/(sender)/create/stations`.
- `Resume draft` routes to the furthest valid draft step.
- `Back to home` routes to `/(sender)/home`.

Rules:
- Starting a new draft must not call `create_delivery`.
- Starting a new draft must not create `deliveryId`.
- Starting a new draft must not create `trackingCode`.
- Starting a new draft must not initialize payment.

## First Meaningful Value
First meaningful value on this screen is confidence to begin the booking flow:
- Sender understands the steps.
- Sender knows price comes before payment.
- Sender knows what to prepare.
- Sender can continue to station selection.

The actual delivery is not created until the backend `create_delivery` operation succeeds later in the flow.

## Main Tension
The screen must feel fast and actionable while avoiding premature commitments. If it shows too much policy, it slows the sender down. If it shows too little, the sender may abandon later when receiver phone, package details, doorstep limits, or payment requirements appear. The right answer is a compact start screen that sets expectations and routes into the next step quickly.

## Design Brief
User and job:
- An authenticated sender wants to begin a package delivery booking.

Context of use:
- Transactional, mobile-first, sometimes in a station, sometimes preparing at home or shop.

Entry point:
- Sender home CTA, onboarding post-auth destination, repeat booking future route, or payment recovery backtrack.

Success state:
- Sender reaches `/(sender)/create/stations` with a valid local draft shell.

Primary action:
- `Start delivery`

Navigation model:
- Sender stack flow, first step of create-delivery wizard.

Density:
- Calm and compact.

Visual thesis:
- A confident launch pad for booking: one strong action, a visible path, and a short proof-led promise about price and handoffs.

Restraint rule:
- Avoid field collection, quote display, route lists, maps, policy walls, and dense stepper controls.

Product lens:
- Guided transactional start.

System stance:
- Match sender home visual language but shift into a focused booking flow.

Interaction thesis:
- Fast tap-to-start, clear resume behavior, and a short route-line step preview.

Signature move:
- A "booking path" rail showing the exact next steps: Stations, Receiver, Package, Options, Quote, Payment.

Activation event:
- Sender enters station selection with local draft shell available.

## Elite Quality Gate
This spec is not closed unless the resulting screen makes booking feel trustworthy and fast without creating premature backend state.

Non-negotiable quality requirements:
- The first viewport must show `Start delivery`.
- The screen must not call `create_delivery`.
- The screen must not call station APIs unless future product explicitly preloads station availability here.
- The screen must not show a price.
- The screen must not show route availability.
- The screen must not ask for receiver or package fields.
- The screen must explain that price appears before payment.
- The screen must explain that payment is required before dispatch.
- The screen must make receiver phone expectation visible before later form fields.
- Local draft handling must be explicit and recoverable.
- The screen must remain usable offline only as a draft entry explanation; actual route validation belongs later.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If a backend delivery can be created from this screen, the screen remains open.
- If sender can see a locally calculated price here, the screen remains open.
- If the sender cannot understand the next step, the screen remains open.
- If an existing draft can be overwritten without confirmation, the screen remains open.
- If the UI implies doorstep is always available, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, or branding to copy:

- Apple Human Interface Guidelines support progressive disclosure, focused task flows, clear controls, and platform-native mobile form entry.
- Material Design guidance for buttons, progress indicators, and text fields supports clear step starts and predictable form progression.
- Nielsen Norman Group mobile form guidance supports reducing cognitive load, breaking complex forms into clear steps, and avoiding unnecessary early fields.
- W3C WCAG 2.2 guidance supports accessible form structure, target size, focus order, labels, and error prevention.
- Kra sender app spec defines the create-delivery flow sequence and field requirements.
- Kra pricing rules define that final price is shown before payment and is backend-authoritative later in the flow.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/progress-indicators/overview
- https://m3.material.io/components/text-fields/overview
- https://www.nngroup.com/articles/mobile-forms/
- https://www.w3.org/WAI/WCAG22/quickref/
- `docs/04-features/sender-app-spec.md`
- `docs/03-business/pricing-rules.md`

Do not copy external checkout screens, delivery app screens, operating-system examples, brand assets, icons, or source code.

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- This route starts a local client draft only.
- Backend delivery is created later through `create_delivery`.
- Station selection is the next required step.
- Quote review happens after stations, receiver, package, and options are known.
- Payment initialization happens after quote acceptance.
- Receiver phone is mandatory for pickup notifications and OTP proof flows.
- Doorstep is available only when policy and serviceability allow it.
- Pay on delivery is not supported in v1.

If the backend later supports server-side draft reservations, that must be specified as a new contract before this screen calls any server mutation.

## Non-Goals
Do not implement these in this screen:
- Station picker.
- Receiver form.
- Package form.
- Service option selector.
- Quote display.
- Payment method.
- Payment processing.
- Delivery summary confirmation.
- Tracking link sharing.
- Support issue creation.
- Doorstep address validation.
- Route availability lookup.
- Local price calculation.
- Backend delivery creation.
- Proof upload.

## Route Rules
### Route
- Render at `/(sender)/create`.
- Must require authenticated sender session.
- Must be accessible from sender home.
- Must not render for unauthenticated users.
- Must not render for staff/admin roles.

### Accepted Query Params
Allowed:
- `source`: `home`, `onboarding`, `repeat`, `payment_recovery`, `unknown`.
- `resume`: `true` or omitted.

Rules:
- `resume=true` may show resume-first ordering if a valid local draft exists.
- Unknown params are ignored.
- Do not pass sender phone, receiver phone, delivery ID, tracking code, payment ID, or station ID in route params.

### Outbound Routes
Allowed:
- `/(sender)/create/stations`
- `/(sender)/home`

Blocked:
- `/(sender)/create/quote` unless all prior draft steps are valid.
- `/(sender)/create/summary` unless all prior draft steps are valid.
- Payment routes.
- Delivery detail routes.
- Staff routes.
- Admin routes.

## Local Draft Contract
This screen owns only the first local draft shell.

Draft shell fields allowed at this route:
- `draftId`
- `createdAt`
- `updatedAt`
- `currentStep`
- `source`
- `version`

Fields not collected here:
- `originStationId`
- `destinationStationId`
- `receiver.name`
- `receiver.phone`
- `receiver.addressText`
- `package.description`
- `package.weightKg`
- `package.sizeTier`
- `package.isFragile`
- `package.declaredValueGhs`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`

Server identifiers not allowed here:
- `deliveryId`
- `trackingCode`
- `paymentId`
- `quoteId`

Rules:
- Local draft ID is not backend delivery ID.
- Local draft does not authorize any delivery action.
- Local draft can be discarded by sender confirmation.
- Local draft is cleared on sign-out.
- Local draft should expire or be reviewed after a product-defined stale window.

## Existing Draft Rules
If no local draft exists:
- Show normal start state.
- Primary CTA: `Start delivery`.

If a valid local draft exists:
- Show resume panel.
- Primary CTA: `Resume draft`.
- Secondary CTA: `Start new delivery`.

If a stale or incompatible draft exists:
- Show safe recovery panel.
- Primary CTA: `Start new delivery`.
- Secondary CTA: `Discard old draft`.

Confirmation:
- Starting new while a valid draft exists must ask confirmation.
- Copy: `Starting a new delivery will clear the draft on this device.`
- Primary: `Start new`
- Secondary: `Keep draft`

Rules:
- Do not silently delete a valid draft.
- Do not resume a draft if required prior step state is invalid.
- Do not merge two local drafts.

## State Model
Required inventory state:
- `normal`

Recommended internal variants:
- `normal_no_draft`
- `normal_valid_draft`
- `normal_stale_draft`
- `normal_offline`
- `normal_session_restoring`

Rules:
- These are all variants of normal, not separate error states.
- No backend load is required.
- If session expires, route guard owns redirect to sign-in.
- If local storage fails, show non-blocking draft warning and allow start only if in-memory state can continue safely.

## Information Architecture
Screen order:
1. Create flow header.
2. Main promise and CTA.
3. Booking path rail.
4. What to prepare.
5. Trust rules.
6. Resume/new draft panel when applicable.
7. Policy note and back route.

First viewport must include:
- Title.
- Brief explanation.
- Primary CTA.
- Booking path rail start.
- Price-before-payment reassurance.

Below fold:
- What to prepare.
- Draft resume details.
- Policy note.

Do not add:
- Full terms.
- Route price table.
- Station availability list.
- Map.
- Package category selector.
- Payment options.

## Layout Blueprint
### Phone Baseline
Target widths:
- `320px`
- `360px`
- `393px`
- `430px`

Safe area:
- Respect top and bottom safe areas.
- Keep primary CTA above bottom navigation or home indicator.
- If bottom tabs remain visible, make route start feel modal enough to preserve flow focus.

Scroll:
- Use vertical scroll.
- Primary action can be sticky only when it does not fight bottom tabs.
- Content must not require horizontal swipe.

### Header
Content:
- Back action to home.
- Title: `Create delivery`
- Step context: `Step 1 of 6`

Rules:
- Do not show notification bell.
- Do not show settings action.
- Keep focus on booking start.

### Hero
Content:
- Eyebrow: `New delivery`
- Headline: `Start with stations. We will guide the rest.`
- Body: `Choose where the package starts and where it should arrive. Kra shows the price before payment and tracks each verified handoff.`
- CTA: `Start delivery`

Rules:
- Headline no more than three lines on common phone width.
- Body no more than four lines.
- CTA visible without scrolling.

### Booking Path Rail
Steps:
1. `Stations`
2. `Receiver`
3. `Package`
4. `Options`
5. `Quote`
6. `Payment`

Purpose:
- Show flow length and reduce uncertainty.

Rules:
- Do not make all steps tappable from start.
- Only the current and completed valid steps are navigable.
- Future steps are informational.

### What To Prepare
Items:
- `Origin and destination stations`
- `Receiver name and phone`
- `Package size, weight, and value`
- `Doorstep address if needed`

Rules:
- Keep as concise checklist.
- Do not collect these fields here.

### Trust Rules Panel
Content:
- `Price before payment`
- `Payment before dispatch`
- `Verified handoffs`

Rules:
- Each item gets one short sentence.
- Do not mention internal implementation.
- Do not overpromise delivery time.

## Component Contract
### `CreateDeliveryStartScreen`
Responsibilities:
- Require authenticated sender session.
- Read local draft metadata.
- Start local draft shell.
- Resume valid local draft.
- Confirm before replacing local draft.
- Route to station selection.
- Emit safe analytics.

Dependencies:
- Session provider.
- Router.
- Local draft store.
- Analytics client.
- Network status provider only for offline note.

Must not depend on:
- Delivery create API.
- Station API.
- Pricing API.
- Payment API.
- Issue API.
- Notification API.

### `CreateFlowHeader`
Purpose:
- Orient sender in create flow.

Content:
- Back action.
- `Create delivery`
- `Step 1 of 6`

Rules:
- Back returns to home unless there is unsaved local draft confirmation.
- Do not expose protected stack internals.

### `CreateStartHero`
Purpose:
- Explain the flow and drive start.

Content:
- Eyebrow.
- Headline.
- Body.
- Primary CTA.

Rules:
- No form fields.
- No price.
- No route availability.

### `BookingPathRail`
Purpose:
- Show all major flow steps.

Rules:
- Future steps are not tappable.
- Current step is visually active.
- Use accessible text for step count.
- Reduced motion disables rail drawing.

### `PreparationChecklist`
Purpose:
- Tell sender what information will be needed.

Rules:
- Four items max.
- No text inputs.
- No validation.

### `DraftResumePanel`
Purpose:
- Let sender resume or replace local draft.

Visible when:
- Valid local draft exists.

Content:
- Title: `Draft in progress`
- Body based on last valid step.
- Primary: `Resume draft`
- Secondary: `Start new delivery`

Rules:
- Do not show receiver phone.
- Do not show package value.
- Do not show local draft internals.

### `StartNewConfirmationSheet`
Purpose:
- Prevent accidental draft deletion.

Content:
- Title.
- Body.
- Primary.
- Secondary.

Rules:
- Must be accessible.
- Must be dismissible.
- Must not use destructive styling unless actual deletion occurs.

## Exact Copy
### Header
Title:
- `Create delivery`

Step:
- `Step 1 of 6`

Back:
- `Back to home`

### Hero
Eyebrow:
- `New delivery`

Headline:
- `Start with stations. We will guide the rest.`

Body:
- `Choose where the package starts and where it should arrive. Kra shows the price before payment and tracks each verified handoff.`

Primary CTA:
- `Start delivery`

### Booking Path
Section title:
- `How booking works`

Steps:
- `Stations`
- `Receiver`
- `Package`
- `Options`
- `Quote`
- `Payment`

### Preparation
Section title:
- `What to have ready`

Items:
- `Origin and destination stations`
- `Receiver name and phone`
- `Package size, weight, and value`
- `Doorstep address if needed`

### Trust Rules
Item 1:
- Title: `Price before payment`
- Body: `You review the final quote before choosing payment.`

Item 2:
- Title: `Payment before dispatch`
- Body: `Kra moves the package into transport after payment is confirmed.`

Item 3:
- Title: `Verified handoffs`
- Body: `Each package move is recorded through the delivery lifecycle.`

### Valid Draft Panel
Title:
- `Draft in progress`

Body:
- `Continue the delivery draft saved on this device.`

Primary:
- `Resume draft`

Secondary:
- `Start new delivery`

### Stale Draft Panel
Title:
- `Draft needs a fresh start`

Body:
- `This saved draft can no longer continue safely. Start a new delivery to use the current booking rules.`

Primary:
- `Start new delivery`

Secondary:
- `Discard old draft`

### Replace Draft Confirmation
Title:
- `Start a new delivery?`

Body:
- `Starting a new delivery will clear the draft on this device.`

Primary:
- `Start new`

Secondary:
- `Keep draft`

### Offline Note
Text:
- `You can start reviewing the steps offline. Station availability and price need a connection later.`

## Copy Rules
Use:
- `delivery`
- `package`
- `stations`
- `receiver`
- `quote`
- `payment`
- `handoff`
- `draft`

Avoid:
- `order`
- `shipment`
- `booking ID`
- `delivery ID`
- `tracking code`
- `price estimate`
- `guaranteed route`
- `same-day`
- `cash on delivery`
- `manual quote`
- `admin approval`

Tone:
- Confident.
- Brief.
- Guided.
- Practical.

## Visual System Direction
### Overall Style
This screen should feel like stepping into a premium guided workflow. It should be calm, forward-moving, and lightweight, with a stronger sense of structure than a marketing page.

Visual keywords:
- Guided.
- Clean.
- Focused.
- Warm.
- Precise.
- Trustworthy.

Do not make it:
- Dense form.
- Policy page.
- Checkout page.
- Station directory.
- Map screen.
- Decorative welcome screen.

### Color Tokens
Recommended semantic usage:
- `surface.base`: warm off-white.
- `surface.panel`: clean raised white.
- `surface.path`: light route tint.
- `ink.primary`: deep charcoal.
- `ink.secondary`: slate.
- `accent.primary`: route green.
- `accent.progress`: deep navy.
- `state.warning`: only for stale draft notice.
- `state.error`: not used in normal state unless local storage fails.

Rules:
- Do not use error color for normal start.
- Do not use payment warning color before payment step.
- Draft resume panel can use calm accent, not alert styling.
- Maintain WCAG contrast.

### Typography
Hierarchy:
- Header title: `20-24px`.
- Hero headline: `30-38px`.
- Body: `15-17px`.
- Section title: `18-20px`.
- Checklist item: `15-16px`.
- Button: `16-17px`.

Rules:
- Step labels must remain legible on narrow phones.
- Avoid tiny captions for required information.
- Do not truncate primary CTA.

### Spacing
Use:
- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Rules:
- CTA must remain visually tied to hero.
- Booking path rail needs breathing room but cannot dominate.
- Checklist should be compact.
- Bottom content must clear navigation.

### Surfaces
Use:
- One hero surface.
- One path rail.
- One checklist panel.
- One draft panel only when needed.

Avoid:
- Nested cards.
- More than two panels in first viewport.
- Heavy shadows.
- Large map art.
- Full stepper occupying the screen.

## Interaction And Motion
Allowed interactions:
- Start delivery.
- Resume draft.
- Start new with confirmation.
- Back to home.
- Scroll.

Motion:
- Hero content can fade in.
- Booking path rail can reveal steps once.
- Start button uses native press feedback.
- Confirmation sheet slides from bottom using platform convention.

Reduced motion:
- Disable rail reveal.
- Use instant confirmation sheet presentation where possible.

Rules:
- Do not delay route navigation for animation.
- Do not animate future steps as if completed.
- Do not use celebratory motion before a delivery exists.

## Offline And Low-Bandwidth Behavior
Offline:
- Screen can render because it uses local content.
- If no local draft exists, sender can see the steps.
- Starting a local draft can proceed only if app product decision allows offline shell creation.
- Station selection must own online requirement for station data.

Recommended behavior:
- Allow `Start delivery` offline only to enter a local shell with an offline note.
- The next screen must block route validation until connection exists.
- If product wants stricter behavior, keep CTA enabled but show connection-needed notice before routing.

Rules:
- Do not call APIs from this screen.
- Do not promise station availability offline.
- Do not promise price offline.
- Do not queue backend creation offline.

## Accessibility Requirements
Structure:
- One main heading.
- Step count announced.
- CTA labels clear.
- Booking path exposed as ordered steps.
- Draft confirmation sheet accessible.

Screen reader:
- Read title, body, primary action, then booking path.
- Booking path reads `Step 1 of 6, Stations` etc.
- Draft panel announces saved draft state without sensitive details.
- Confirmation sheet traps focus only while open and returns focus after dismissal.

Focus:
- On route entry, focus lands on title or first meaningful content per app convention.
- After closing confirmation sheet, focus returns to triggering button.
- No hidden focusable future steps.

Touch:
- Primary CTA at least `52` height.
- Secondary actions at least `44x44` effective target.
- Checklist rows are not tappable unless implemented as info links.

Large text:
- Hero wraps without clipping.
- CTA remains readable.
- Path rail may become vertical list.
- Confirmation sheet scrolls if needed.

Motion:
- Reduced motion disables decorative transitions.
- Progress must not be motion-only.

## Data And Storage
Local draft shell should store:
- `draftId`
- `version`
- `createdAt`
- `updatedAt`
- `currentStep`
- `source`

Local draft shell should not store:
- Backend delivery ID.
- Tracking code.
- Payment ID.
- Quote amount.
- Receiver phone.
- Package value.
- Station IDs until station step.
- Any staff or admin identifiers.

Storage rules:
- Draft belongs to authenticated sender device state.
- Clear draft on sign-out.
- Protect against cross-sender draft leakage on shared devices.
- If authenticated sender changes, do not show previous sender draft.
- If draft schema version changes, mark draft stale and require restart.

## Backend Alignment
This screen aligns with:
- `docs/04-features/sender-app-spec.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `packages/shared/src/domain/delivery-draft.ts`
- `docs/05-design/frontend-screen-inventory.md`

Backend facts:
- `create_delivery` requires stations, receiver, package, service options, and quote-producing data.
- Delivery record starts with `currentStatus=created` only after backend creation.
- Payment status begins as `pending` after backend delivery creation.
- Payment is required before dispatch.
- Price is shown before payment in quote review.

Authority rules:
- This screen starts only client-side draft state.
- Backend quote remains authoritative later.
- Backend delivery creation remains authoritative later.
- Payment remains owned by payment screens.

## Analytics
Allowed events:
- `create_delivery_start_viewed`
- `create_delivery_start_tapped`
- `create_delivery_resume_tapped`
- `create_delivery_start_new_tapped`
- `create_delivery_draft_replace_confirmed`
- `create_delivery_draft_replace_cancelled`
- `create_delivery_start_back_tapped`

Required fields:
- `screenId`
- `route`
- `source`
- `platform`
- `appVersion`
- `hasLocalDraft`
- `draftStep`
- `isOffline`

Forbidden fields:
- Receiver phone.
- Receiver name.
- Package description.
- Declared value.
- Delivery ID.
- Tracking code.
- Payment ID.
- Station IDs before station step.
- Sender phone.

Rules:
- Do not emit events for every scroll.
- Do not include local draft ID unless analytics policy approves.
- Do not block navigation on analytics.

## Implementation Notes For Claude Code
Build only the create delivery start route and local start/resume components.

Expected implementation files later:
- Route file for `/(sender)/create`.
- Component for create flow header.
- Component for start hero.
- Component for booking path rail.
- Component for preparation checklist.
- Component for draft resume panel.
- Component for start-new confirmation sheet.
- Tests for route, start, resume, replace confirmation, offline note, accessibility, and analytics safety.

Do not implement:
- Station selection.
- Receiver details.
- Package details.
- Delivery options.
- Quote review.
- Delivery summary.
- Payment.
- Backend delivery creation.
- Station data query.
- Pricing query.

Testing requirements:
- Root test ID renders.
- Primary CTA routes to station selection.
- Starting new creates only local draft shell.
- Valid draft shows resume panel.
- Start new with existing draft asks confirmation.
- Stale draft shows fresh-start panel.
- No backend API call occurs.
- Analytics excludes sensitive fields.
- Large text and screen reader flow work.

## Test IDs
Primary:
- `screen-create-delivery-start`

Recommended child IDs:
- `create-delivery-start-header`
- `create-delivery-start-hero`
- `create-delivery-start-button`
- `create-delivery-booking-path`
- `create-delivery-preparation-checklist`
- `create-delivery-trust-rules`
- `create-delivery-draft-resume-panel`
- `create-delivery-start-new-button`
- `create-delivery-replace-draft-sheet`
- `create-delivery-offline-note`

Test ID rules:
- Stable.
- Lowercase kebab case.
- No dynamic values in base IDs.
- No delivery ID, tracking code, phone, or payment ID.

## QA Acceptance Criteria
Route:
- Screen renders at `/(sender)/create`.
- Root has test ID `screen-create-delivery-start`.
- Unauthenticated users are redirected.
- Non-sender roles are denied.

Normal no draft:
- Hero renders.
- Start delivery CTA is visible without scrolling.
- Booking path rail renders.
- Preparation checklist renders.
- No backend API call occurs.

Valid draft:
- Resume panel renders.
- Resume routes to furthest valid draft step.
- Start new asks confirmation.
- Keeping draft dismisses confirmation.

Stale draft:
- Fresh-start panel renders.
- Old draft can be discarded with explicit action.
- Stale draft does not route into later steps.

Offline:
- Offline note renders when device is offline.
- No backend mutation is queued.
- No price or route availability is shown.

Data safety:
- No delivery ID exists.
- No tracking code exists.
- No quote amount appears.
- No receiver phone appears.
- No station ID appears before station step.

Accessibility:
- Screen reader can understand step count.
- Primary action has descriptive label.
- Confirmation sheet focus behavior is correct.
- Large text does not clip CTA.
- Touch targets meet minimum size.

## Visual QA Checklist
Founder lens:
- Does starting a delivery feel fast and trustworthy?
- Does the flow feel guided rather than heavy?
- Is price-before-payment clear?

Skeptical sender lens:
- Do I know what information I need?
- Do I know price comes later before payment?
- Do I know this has not created a delivery yet?

Operator lens:
- Does the screen avoid backend state creation?
- Does it avoid local pricing authority?
- Does it avoid doorstep overclaiming?

Accessibility lens:
- Can screen reader users understand the step sequence?
- Can large-text users start and resume?
- Is the confirmation sheet accessible?

Creative director lens:
- Is the booking path rail useful and distinctive?
- Is the visual system clean and serious?
- Is the screen focused enough?

## Build Boundaries
In scope:
- Create delivery start route.
- Auth guard.
- Local draft shell start.
- Resume valid local draft.
- Replace draft confirmation.
- Booking path explanation.
- Preparation checklist.
- Offline note.
- Safe analytics.

Out of scope:
- Station validation.
- Receiver form.
- Package form.
- Doorstep serviceability.
- Quote.
- Backend delivery creation.
- Payment.
- Tracking.
- Support.

## Open Decisions
No blocking product decisions remain for this screen.

Implementation-time decisions:
- Exact local draft stale window.
- Exact local draft store key.
- Whether offline local shell creation is allowed or route is blocked until connected.
- Whether the create flow uses bottom tabs hidden or visible.
- Final booking path rail visual treatment.

These must not change backend creation authority, price authority, or data-safety rules.

## Definition Of Done
This screen is done when:
- It renders at the inventory route.
- It uses the inventory test ID.
- It starts only a local draft shell.
- It routes to station selection.
- It handles valid and stale local drafts.
- It confirms before replacing a draft.
- It does not call backend delivery, station, pricing, payment, issue, or notification APIs.
- It does not show price, delivery ID, tracking code, or route availability.
- It explains price-before-payment and payment-before-dispatch.
- It supports screen reader, large text, high contrast, reduced motion, and weak network.
- It feels like a premium, guided booking start for Kra.

