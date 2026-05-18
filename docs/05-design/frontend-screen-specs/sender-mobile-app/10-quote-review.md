# Quote Review Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `QuoteReview` |
| App | `apps/mobile` |
| Route | `/(sender)/create/quote` |
| Primary test ID | `screen-quote-review` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `create_delivery`, `cancel_delivery`, `createDeliveryRequestSchema`, `createDeliveryResponseSchema`, `cancelDeliveryRequestSchema`, pricing rules, payment-before-dispatch policy |
| Related routes | `/(sender)/create/options`, `/(sender)/create/summary`, `/(sender)/payments/:deliveryId/method`, `/(sender)/home` |
| Required states | `loading`, `ready`, `invalid_draft`, `quote_locking`, `quote_changed`, `delivery_created`, `api_validation_error`, `network_error`, `offline`, `duplicate_submit_guard`, `stale_pricing_notice`, `cancel_created_delivery_error` |

## Product Job
This screen lets the sender review the final delivery facts and confirm the price before payment. It is the first point in the sender create flow where money becomes the dominant decision, so the screen must make the amount obvious, show the assumptions behind it, and prevent accidental delivery creation.

The sender should be able to:
- Review origin station, destination station, receiver, package, service speed, and final-mile option.
- See one clear `GHS` amount before payment.
- Understand that payment is required before dispatch.
- Confirm the quote once and create the delivery through `create_delivery`.
- See when backend pricing differs from the local preview.
- Correct delivery facts before confirming.
- Continue to delivery summary only after the backend returns a locked delivery quote.

This screen is not station selection, receiver entry, package entry, final-mile option selection, payment-method selection, provider processing, receipt display, station intake, or support.

## Audience
Primary audience:
- Authenticated senders who are about to create a paid delivery.
- First-time senders who need confidence that price and route are correct.
- Small-business senders who need predictable delivery costs.
- Senders operating on mobile data who need a low-friction final review.

Secondary audience:
- QA engineers validating quote locking and duplicate-submit protection.
- Claude Code implementing this route from the spec.
- Product and finance reviewers verifying quote display policy.
- Support teams who will later explain why a sender accepted a price.

## User State
The sender has completed station selection, receiver details, package details, and delivery options. They are ready to confirm the delivery if the final price and assumptions are acceptable.

The sender may be:
- Price-sensitive and checking that the total is not surprising.
- Booking urgently and trying to finish quickly.
- Concerned about whether doorstep delivery is included.
- Unsure whether payment happens now or later.
- Using a small phone or unstable network.
- Returning from an interrupted create-delivery flow.

The screen must:
- Show the amount before any payment flow begins.
- Show what facts the amount is based on.
- Explain that payment is required before dispatch.
- Make correction paths visible.
- Submit the backend create request only on explicit confirmation.
- Prevent duplicate delivery creation.
- Treat the backend response as authoritative.
- Never let the sender edit the amount.

## Primary Action
Primary CTA:
- `Confirm quote`

Secondary actions:
- `Edit route`
- `Edit receiver`
- `Edit package`
- `Edit options`
- `Back`
- `Cancel delivery` only after a backend delivery exists and the sender declines an updated backend quote.

CTA behavior:
- `Confirm quote` validates the local draft and calls `POST /v1/deliveries` through operation `create_delivery`.
- `Confirm quote` must send exactly one idempotent create request for one sender confirmation.
- `Confirm quote` must not initialize payment.
- `Confirm quote` must not navigate before a valid `createDeliveryResponseSchema` response is stored.
- `Confirm quote` must not stay enabled during `quote_locking`.
- `Confirm quote` must not create a second delivery after the app is resumed or retried.
- `Edit route` routes to `/(sender)/create/stations`.
- `Edit receiver` routes to `/(sender)/create/receiver`.
- `Edit package` routes to `/(sender)/create/package`.
- `Edit options` routes to `/(sender)/create/options`.
- `Back` routes to `/(sender)/create/options` when no backend delivery exists.
- `Cancel delivery` calls `cancel_delivery` only when a created pending-payment delivery exists and the sender refuses the changed backend quote.
- Changed-quote cancellation sends `reasonCode=pricing_dispute` and note `Sender declined updated quote before payment.`

Success behavior:
- Store `deliveryId`, `trackingCode`, `status`, `quote.currency`, `quote.amount`, and `paymentRequiredBeforeDispatch`.
- Store the request fingerprint used to create the delivery.
- Route to `/(sender)/create/summary`.
- Delivery summary must consume the stored created-delivery response.
- Delivery summary must not call `create_delivery` again for the same draft.

## First Meaningful Value
First meaningful value is reached when the sender sees one clear quote amount and can verify the facts that affect the quote.

The screen creates value by:
- Preventing price surprise before payment.
- Giving the sender a review-and-correct moment before a financial step.
- Locking the delivery quote only through backend rules.
- Showing the payment-before-dispatch rule before the sender enters payment.
- Turning a complex pricing model into a calm final decision.

## Main Tension
The sender needs speed, but the platform needs explicit consent before creating a delivery with a payment obligation. The UX must avoid two failures: making the review feel like a final confirmation page before the sender has actually confirmed, and hiding assumptions behind a single price.

The screen must balance:
- Fast confirmation against financial-error prevention.
- A single customer-facing total against enough assumption transparency.
- Backend authority against a smooth local preview.
- Payment urgency against no premature provider initialization.
- Low-bandwidth operation against visible progress and recovery.
- Trust-building detail against mobile clutter.

## Design Brief
User and job:
- An authenticated sender is checking the final delivery quote before creating a delivery.

Context of use:
- Mobile, transactional, money-sensitive, sometimes urgent.

Entry point:
- `/(sender)/create/options` after service speed and final-mile choice are valid.

Success state:
- Backend delivery is created once, quote is locked, and the app routes to delivery summary.

Primary action:
- `Confirm quote`

Navigation model:
- Step 6 of sender create-delivery stack flow.

Density:
- One dominant amount, compact assumption stack, direct edit links.

Visual thesis:
- A secure payment-airlock screen: quiet surface, strong amount, visible policy, one deliberate confirmation action.

Restraint rule:
- Avoid fee table clutter, route maps, payment-method controls, provider branding, courier promises, and receipt language.

Product lens:
- Trust-critical checkout review.

System stance:
- Native-plus mobile checkout: platform patterns with a distinct Kra custody and reliability feel.

Interaction thesis:
- The screen opens with a readable local quote preview, lets the sender correct facts, then performs one authoritative backend quote lock on confirmation.

Signature move:
- A "quote lock" panel that changes from local preview to backend-locked state without moving the amount away from the top focal area.

Activation event:
- Sender accepts the quote and backend returns `status=created`.

## Elite Quality Gate
This spec is not closed unless the resulting screen makes price, assumptions, payment timing, and backend authority unmistakable.

Non-negotiable quality requirements:
- The first viewport must show the final `GHS` amount.
- The first viewport must say payment is required before dispatch.
- The screen must show route, receiver, package, service speed, and final-mile assumptions.
- The screen must provide direct edit paths for every assumption group.
- The screen must call `create_delivery` only after explicit sender confirmation.
- The screen must not call `initialize_payment`.
- The screen must not call `verify_payment`.
- The screen must not create a payment intent.
- The screen must not show a payment method selector.
- The screen must not assign a driver or courier.
- The screen must not show station intake tasks.
- The screen must not show a receipt.
- The screen must not allow amount editing.
- The screen must not show processing fees as a separate customer charge.
- The screen must block duplicate create requests.
- The screen must handle backend amount changes without silent acceptance.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the amount is hidden below the fold, the screen remains open.
- If payment timing is unclear, the screen remains open.
- If a user can create two deliveries by double-tapping, the screen remains open.
- If the screen invents a quote-only backend endpoint, the screen remains open.
- If delivery summary can create the same delivery again, the screen remains open.
- If an updated backend quote is accepted without user acknowledgement, the screen remains open.
- If any assumption lacks an edit path, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear payment confirmation patterns, native navigation, and careful feedback around consequential actions.
- Material Design 3 cards, buttons, and progress indicators support touch-friendly review surfaces and visible in-progress states.
- W3C WCAG 2.2 Success Criterion 3.3.4 supports review, confirmation, correction, or reversal for financial and data-changing submissions.
- Baymard mobile review-order research reinforces that review and confirmation states must not look interchangeable, and total price should be clear before commitment.
- Kra pricing rules require one customer-facing final quoted amount in `GHS` and no separate payment-processing fee line.
- Kra payment policy requires payment confirmation before dispatch.
- Kra API contracts define delivery creation and payment initialization as separate operations.
- Kra shared pricing domain defines the local quote calculation used only as a pre-submit preview.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/apple-pay
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/progress-indicators/overview
- https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html
- https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/review-order
- `docs/03-business/pricing-rules.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/07-api/api-contracts.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `services/api/src/deliveries.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- Local draft is complete before the screen renders `ready`.
- Local draft contains station, receiver, package, service, and final-mile values accepted by previous steps.
- Backend has no quote-only endpoint in v1.
- Backend quote authority is obtained through `create_delivery`.
- `create_delivery` returns `deliveryId`, `trackingCode`, `status=created`, `quote`, and `paymentRequiredBeforeDispatch=true`.
- The quote currency is always `GHS` in v1.
- Quote amount is an integer positive number.
- Delivery is not dispatchable until payment is confirmed.
- Payment initialization happens after quote acceptance, not on screen load.
- Delivery summary consumes the created delivery response and prepares the sender for payment.
- If backend pricing differs from local preview, backend pricing wins.
- If sender declines a changed backend quote after creation, the app must offer cancellation before leaving the screen.

## Backend Contract
Operation:
- `create_delivery`

HTTP:
- `POST /v1/deliveries`

Auth:
- Authenticated sender.

Capability:
- `create_delivery`

Idempotency:
- Treat as idempotent from the client perspective.
- Send a stable request key for the current draft confirmation if the API client supports idempotency headers.
- Never generate a new request key while the same confirmation is in flight.
- Persist the request key until the response is resolved or the draft is intentionally changed.

Request schema:
- `createDeliveryRequestSchema`

Response schema:
- `createDeliveryResponseSchema`

Request fields:
- `originStationId`
- `destinationStationId`
- `receiver.name`
- `receiver.phone`
- `receiver.addressText` only when known and required for doorstep.
- `package.description`
- `package.weightKg`
- `package.sizeTier`
- `package.isFragile`
- `package.declaredValueGhs`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm` only when `doorstepRequested=true`.

Response fields:
- `deliveryId`
- `trackingCode`
- `status`
- `quote.currency`
- `quote.amount`
- `paymentRequiredBeforeDispatch`

Required response interpretation:
- `status` must be `created`.
- `quote.currency` must be `GHS`.
- `quote.amount` is the authoritative amount.
- `paymentRequiredBeforeDispatch` must be true.
- Any other shape is a contract error and must use the generic API error surface.

## Quote Authority Decision
Current backend reality:
- There is no v1 quote-only API.
- The authoritative backend quote is created when the delivery is created.
- The screen may show a local preview before confirmation using shared pricing code.
- The local preview is never a payment amount.
- The backend response amount is the only amount used for payment.

Decision:
- `QuoteReview` owns the first `create_delivery` call.
- `DeliverySummary` must not create the same delivery again.
- `DeliverySummary` starts from the stored `createDeliveryResponseSchema` output.
- Payment method screens must use the backend amount from this response.

Reason:
- This prevents invented API behavior.
- This prevents duplicate delivery records.
- This gives the sender an accessible financial review moment before payment.
- This keeps quote lock and delivery creation auditable.

Future backend improvement:
- If the backend adds a quote-only endpoint later, this screen can move authoritative quote preview before delivery creation.
- Until then, do not build a separate server quote request.

## Local Quote Preview Rules
Preview source:
- `calculateDeliveryQuote` or `calculateDeliveryQuoteBreakdown` from shared pricing domain.

Preview purpose:
- Let the sender understand the expected cost before tapping `Confirm quote`.
- Catch obvious local draft errors before submit.
- Reduce perceived waiting during backend confirmation.

Preview copy:
- `Estimated before final check`
- `Final amount locks when you confirm.`

Preview restrictions:
- Do not label the preview as locked.
- Do not use the preview for `initialize_payment`.
- Do not persist the preview as the delivery amount after backend response.
- Do not let the sender edit the preview.
- Do not show a separate processing fee.
- Do not show backend-only pricing internals unless product later approves a finance mode.

Display approach:
- Show one large amount using local preview while `ready`.
- Add a small status row beneath the amount.
- Change the status row to `Locked by backend` only after valid response.
- If the backend amount differs, show a changed quote panel before routing.

## Data Read Model
Read from local create-delivery draft:
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
- Last saved step timestamp.
- Draft schema version.

Read from shared domain:
- Station display names for selected station IDs.
- Pricing calculation function.
- Service type labels.
- Size tier labels.

Read from network:
- Nothing on initial render unless draft restoration requires server state.
- `create_delivery` only after sender confirmation.

Write locally:
- Draft review timestamp.
- Local preview amount.
- Confirmation request fingerprint.
- In-flight request key.
- Created delivery response.
- Backend amount difference status.

Write remotely:
- Delivery record through `create_delivery`.
- Cancellation through `cancel_delivery` only if sender declines an already-created changed quote.

## Route Entry Conditions
Normal entry:
- Sender arrives from `/(sender)/create/options`.
- Draft contains all required fields.
- Draft version matches current schema.

Invalid entry:
- Missing origin or destination sends user to `/(sender)/create/stations`.
- Missing receiver sends user to `/(sender)/create/receiver`.
- Missing package sends user to `/(sender)/create/package`.
- Missing service or final-mile selection sends user to `/(sender)/create/options`.
- Doorstep without address sends user to `/(sender)/create/receiver?focus=address`.
- Doorstep without distance sends user to `/(sender)/create/options?focus=doorstepDistance`.
- Origin equal to destination sends user to `/(sender)/create/stations?error=sameStation`.

Invalid entry UI:
- Show `Review needs one more detail`.
- Explain the missing group in one sentence.
- Show one primary CTA to the exact missing step.
- Do not render a price.
- Do not submit backend request.

## Information Architecture
Top-level structure:
1. Step header.
2. Quote hero.
3. Payment-before-dispatch policy strip.
4. Assumption summary.
5. Edit links.
6. Confirmation disclosure.
7. Sticky CTA.

Required viewport order:
- Header: `Review quote`
- Amount: `GHS {amount}`
- Status: preview or locked.
- Policy: `Payment is required before dispatch.`
- Primary route summary.
- CTA: `Confirm quote`

Why this order:
- The amount is the decision.
- Payment timing is the risk reducer.
- Assumptions justify the amount.
- Edit paths allow correction before submit.
- CTA creates delivery only after review.

## Header
Component:
- Native stack header with custom content inside page.

Content:
- Eyebrow: `Step 6 of 7`
- Title: `Review quote`
- Subtitle: `Check the amount and delivery facts before payment.`

Behavior:
- Back action returns to `/(sender)/create/options` if no backend delivery exists.
- Back action is disabled or guarded during `quote_locking`.
- If backend delivery exists after changed quote, back opens a confirmation sheet explaining that leaving does not cancel the created delivery.

Accessibility:
- Title must be the screen `h1` equivalent.
- Step text must not be the only indicator of progress.
- Back control label: `Back to delivery options`.

## Progress Indicator
Purpose:
- Orient the sender inside a multi-step flow without making the screen feel slow.

Visual:
- Thin horizontal progress bar below header.
- Six of seven segments filled.
- Current segment uses the accent token.
- Prior segments use muted success or neutral completion token.

Copy:
- `Quote review`
- `Payment comes next`

Rules:
- Do not show a dense stepper with all labels on small phones.
- Do not make prior step labels tappable in the progress indicator.
- Use edit links in the summary for correction.
- Respect reduced motion.

## Quote Hero
Purpose:
- Make the price decision impossible to miss.

Content:
- Label: `Your quote`
- Amount: `GHS {amount}`
- Status line before submit: `Estimated before final check`
- Status line after backend response: `Locked by backend`
- Supporting line: `Payment is required before dispatch.`

Visual:
- Large rounded surface, but not a heavy card stack.
- Amount set in the strongest type scale on the page.
- Currency `GHS` visually tied to amount, not separated.
- Status line uses a small lock or shield icon after backend lock.
- Use quiet confidence: no loud sales treatment.

Rules:
- Show integer amount with locale-appropriate grouping when needed.
- Do not show decimals for v1 integer GHS pricing.
- Do not show crossed-out prices.
- Do not show discount inputs.
- Do not show voucher inputs.
- Do not show taxes or provider charges as separate customer lines.

Screen reader:
- Announce as `Your quote, GHS {amount}, estimated before final check. Payment is required before dispatch.`
- After backend lock, announce `Quote locked by backend, GHS {amount}.`

## Payment Policy Strip
Purpose:
- Make payment timing clear before provider screens.

Content:
- Title: `Payment before dispatch`
- Body: `Kra will only dispatch after payment is confirmed. No driver or courier should collect cash for this booking.`

Visual:
- Compact inset strip below quote hero.
- Icon: shield, receipt, or verified lock.
- Background uses a soft finance-safe token, not warning red.

Rules:
- Do not imply payment has started.
- Do not show provider names here.
- Do not use receipt language.
- Do not make this strip dismissible.

## Assumption Summary
Purpose:
- Explain what the quote is based on, without turning the screen into a pricing spreadsheet.

Groups:
- Route
- Receiver
- Package
- Service
- Final mile
- Payment rule

Each group must include:
- Group title.
- Main value.
- One supporting fact.
- `Edit` action unless backend delivery already exists.

Route group:
- Main: `{originStationName} to {destinationStationName}`
- Supporting: `Station corridor used for this quote.`
- Edit route: `/(sender)/create/stations`

Receiver group:
- Main: `{receiver.name}`
- Supporting: `{receiver.phone}`
- Doorstep supporting when applicable: `{receiver.addressText}`
- Edit receiver: `/(sender)/create/receiver`

Package group:
- Main: `{package.description}`
- Supporting: `{weightKg} kg, {sizeTier}, {fragile or standard handling}`
- Declared value supporting: `Declared value: GHS {declaredValueGhs}`
- Edit package: `/(sender)/create/package`

Service group:
- Main: `Standard` or `Express`
- Supporting for standard: `Regular station-to-station handling.`
- Supporting for express: `Priority handling affects the quote.`
- Edit service: `/(sender)/create/options`

Final-mile group:
- Station pickup main: `Receiver collects at destination station`
- Station pickup supporting: `No doorstep distance is included.`
- Doorstep main: `Doorstep delivery requested`
- Doorstep supporting: `{doorstepDistanceKm} km from destination station`
- Edit final mile: `/(sender)/create/options`

Payment rule group:
- Main: `Payment required before dispatch`
- Supporting: `The payment screen comes after delivery summary.`
- No edit action.

## Assumption Display Rules
Allowed display:
- Show total amount.
- Show the facts behind the amount.
- Show whether the quote is preview or backend locked.
- Show special handling as text when fragile is true.
- Show declared value because it affects eligibility and pricing.

Disallowed display:
- Do not show a line-by-line surcharge table to senders in v1.
- Do not show internal route base fee.
- Do not show processing cost.
- Do not show finance-only pricing IDs.
- Do not show admin approval controls.
- Do not show operational cost model.

Reason:
- `pricing-rules.md` says the sender sees a single final quoted amount.
- The sender needs confidence and correction paths, not finance internals.

## Confirmation Disclosure
Purpose:
- Make the consequence of `Confirm quote` explicit.

Placement:
- Directly above the sticky CTA.

Content:
- Title: `What happens when you confirm`
- Bullets:
  - `Kra creates your delivery record.`
  - `The backend locks the quote for payment.`
  - `You will pay before the package can dispatch.`

Rules:
- Use three short rows, not a long paragraph.
- Do not require a checkbox in v1 unless legal review later requires it.
- If legal requires explicit acknowledgement later, add a single checkbox and keep CTA disabled until checked.

## Sticky CTA Area
Purpose:
- Keep the final action reachable while preserving review context.

Default state:
- Primary: `Confirm quote`
- Secondary text link: `Back to options`

In-flight state:
- Primary label: `Locking quote...`
- Activity indicator inside button.
- Secondary controls disabled.

Changed quote state:
- Primary: `Continue with GHS {backendAmount}`
- Secondary: `Cancel delivery`

Error state:
- Primary: `Try again`
- Secondary: `Review details`

Rules:
- CTA area sticks to bottom with safe-area padding.
- CTA area must not cover assumption content when keyboard, large text, or screen zoom is active.
- Button height must remain touch-friendly.
- Button must use active verb text, not vague `Next`.

## Component Inventory
Required components:
- `CreateFlowHeader`
- `CreateProgressBar`
- `QuoteAmountHero`
- `PaymentBeforeDispatchStrip`
- `AssumptionReviewGroup`
- `AssumptionReviewRow`
- `QuoteConfirmationDisclosure`
- `QuoteChangedPanel`
- `QuoteLockingOverlay`
- `InvalidDraftCallout`
- `ApiErrorCallout`
- `OfflineNotice`
- `StickyConfirmQuoteBar`

Reusable component requirements:
- Components must accept semantic labels.
- Components must support dynamic text length.
- Components must expose test IDs.
- Components must work in light and dark themes.
- Components must not hardcode launch-station names.
- Components must not hardcode amount values.

## Test IDs
Screen:
- `screen-quote-review`

Header:
- `quote-review-header`
- `quote-review-progress`

Quote:
- `quote-amount-hero`
- `quote-amount-value`
- `quote-status-label`
- `quote-payment-before-dispatch-strip`

Assumptions:
- `quote-assumptions`
- `quote-assumption-route`
- `quote-assumption-receiver`
- `quote-assumption-package`
- `quote-assumption-service`
- `quote-assumption-final-mile`
- `quote-assumption-payment-rule`

Edit actions:
- `quote-edit-route`
- `quote-edit-receiver`
- `quote-edit-package`
- `quote-edit-options`

Confirmation:
- `quote-confirmation-disclosure`
- `quote-confirm-cta`
- `quote-back-options`

States:
- `quote-loading-state`
- `quote-invalid-draft-state`
- `quote-locking-state`
- `quote-changed-state`
- `quote-api-error-state`
- `quote-offline-state`

## State Model
States:
- `loading`
- `ready`
- `invalid_draft`
- `quote_locking`
- `delivery_created`
- `quote_changed`
- `api_validation_error`
- `network_error`
- `offline`
- `duplicate_submit_guard`
- `cancel_created_delivery_error`

Initial resolution:
- Read local draft.
- Validate draft shape.
- Calculate local quote preview.
- Render `ready` if valid.
- Render `invalid_draft` if incomplete or invalid.

Submit resolution:
- Move from `ready` to `quote_locking`.
- Disable all route-changing actions.
- Call `create_delivery`.
- Compare response quote amount with local preview amount.
- If equal, store response and route to `/(sender)/create/summary`.
- If different, store response and render `quote_changed`.
- If validation error, render `api_validation_error`.
- If network failure, render `network_error`.
- If offline before request, render `offline`.

Post-submit:
- Once `deliveryId` exists, do not allow local draft edits without explicit cancellation or handoff to delivery detail.
- Delivery summary owns next-step education and payment route.

## Loading State
Use when:
- Local draft is being restored.
- Station display names are being resolved from local station data.
- Pricing function bundle is not ready.

Layout:
- Header stays visible.
- Quote hero skeleton appears in top position.
- Three assumption row skeletons appear below.
- Sticky CTA skeleton appears disabled.

Copy:
- Title: `Preparing quote review`
- Body: `Checking your delivery details on this device.`

Rules:
- Do not show an amount until local preview calculation succeeds.
- Do not call backend during loading.
- Do not block for remote content if local draft and station labels are available.

Motion:
- Use subtle shimmer only if reduced motion is not requested.
- Prefer static blocks when reduced motion is requested.

## Ready State
Use when:
- Draft is valid.
- Local quote preview is available.
- No backend delivery exists for this draft.

Required content:
- `GHS {previewAmount}`
- `Estimated before final check`
- Payment-before-dispatch strip.
- All assumption groups.
- Confirmation disclosure.
- `Confirm quote` CTA.

CTA:
- Enabled.
- Calls `create_delivery`.

Edit links:
- Enabled.
- Route to prior steps.

Analytics:
- Fire `quote_review_viewed` once per draft version.

## Invalid Draft State
Use when:
- Required data is missing.
- Draft data violates schema.
- Doorstep rules conflict.
- Local quote calculation throws because package or route is not self-serve.

Layout:
- Header remains.
- No amount shown.
- Blocking callout explains issue.
- One primary CTA routes to the required correction step.

Copy patterns:
- Missing route title: `Route needs review`
- Missing route body: `Choose two different stations before quote review.`
- Missing receiver title: `Receiver details need review`
- Missing receiver body: `Add receiver name and phone before quote review.`
- Missing package title: `Package details need review`
- Missing package body: `Add package description, weight, size, and declared value before quote review.`
- Doorstep address title: `Doorstep needs an address`
- Doorstep address body: `Add the receiver address before checking the quote.`
- Doorstep distance title: `Doorstep needs distance`
- Doorstep distance body: `Add a distance estimate within the v1 service range.`
- Manual quote title: `This package needs staff review`
- Manual quote body: `Self-serve quote review is not available for this package. Contact support or change package details.`

Rules:
- Do not show stale amount.
- Do not allow confirm.
- Do not call backend.

## Quote Locking State
Use when:
- Sender tapped `Confirm quote`.
- Backend create request is in flight.

Layout:
- Keep current review content visible.
- Lock sticky CTA.
- Show top status line: `Final check in progress`
- Show non-blocking overlay only if request lasts more than 800ms.

Copy:
- CTA: `Locking quote...`
- Status: `Kra is creating your delivery and locking the amount.`

Rules:
- Disable edit links.
- Disable back action or guard it.
- Prevent second submit.
- Persist in-flight request metadata.
- If app backgrounds, restore this state and query local persisted request result when available.

Accessibility:
- Announce `Locking quote. Please wait.`
- Activity indicator must have a label.

## Delivery Created State
Use when:
- Backend response is valid.
- Backend amount equals local preview or sender has accepted changed amount.

Behavior:
- Store response.
- Clear volatile in-flight state.
- Route to `/(sender)/create/summary`.

No visible long-lived state:
- This is a transition state, not a separate page.

Safety:
- If navigation fails, show a retry panel with `Continue to summary`.
- Do not call `create_delivery` again.

## Quote Changed State
Use when:
- Backend returns a valid response.
- Backend `quote.amount` differs from local preview amount.

Reason:
- Active pricing may have changed.
- Local pricing bundle may be stale.
- Pricing rule fallback may differ from active backend rule.

Layout:
- Keep amount hero at top.
- Replace preview amount with backend amount.
- Show changed quote panel directly under amount.
- Assumption summary stays visible.
- Sticky CTA changes to accept updated amount.

Copy:
- Title: `Quote updated during final check`
- Body: `The backend locked this delivery at GHS {backendAmount}. Your earlier estimate was GHS {previewAmount}.`
- Primary: `Continue with GHS {backendAmount}`
- Secondary: `Cancel delivery`
- Supporting: `Payment has not started.`

Rules:
- Do not silently route to summary.
- Do not initialize payment.
- Do not let sender edit the amount.
- Do not treat this as an error if the response is valid.
- If sender continues, store acknowledgement timestamp and route to summary.
- If sender cancels, call `cancel_delivery` for the created delivery.
- Cancellation request must use `reasonCode=pricing_dispute`.
- Cancellation request note must say `Sender declined updated quote before payment.`
- If cancellation succeeds, clear created response and route to `/(sender)/create/options`.
- If cancellation fails, keep user on screen and show `cancel_created_delivery_error`.

Accessibility:
- Announce the change as an assertive status.
- Amount difference must be text, not color alone.

## API Validation Error State
Use when:
- Backend rejects request due to schema or policy.

Layout:
- Inline callout above assumptions.
- Highlight affected group when path is known.
- CTA routes to affected edit step.

Copy:
- Title: `One detail needs correction`
- Body with known path: `The backend could not accept {fieldLabel}. Review it before confirming again.`
- Body without known path: `The backend could not accept this delivery request. Review the details and try again.`
- CTA route: `Review {group}`

Known mappings:
- `destinationStationId` routes to station selection.
- `receiver.name` routes to receiver details.
- `receiver.phone` routes to receiver details.
- `receiver.addressText` routes to receiver details.
- `package.description` routes to package details.
- `package.weightKg` routes to package details.
- `package.sizeTier` routes to package details.
- `package.declaredValueGhs` routes to package details.
- `serviceType` routes to delivery options.
- `doorstepDistanceKm` routes to delivery options.

Rules:
- Do not keep the same request key after draft fields change.
- Do not retry automatically after validation failure.
- Do not display raw stack traces.
- Do not mention internal schema names to the sender.

## Network Error State
Use when:
- Request was attempted and failed due to network or timeout.
- Backend response is unknown.

Layout:
- Keep review content.
- Show error callout above CTA.
- Primary CTA: `Check status and retry`
- Secondary: `Back to options`

Copy:
- Title: `Quote was not confirmed`
- Body: `We could not confirm whether the delivery was created. Keep this screen open and check again before retrying.`

Rules:
- Avoid immediate blind resubmit.
- First recovery action should check local persisted in-flight response if available.
- If API has idempotency support, retry with the same request key.
- If no safe retry exists, route to support-safe recovery instead of creating another delivery.
- Never create a new request key for the same user tap unless the previous request is known to have failed before reaching the backend.

## Offline State
Use when:
- Device is offline before request starts.

Layout:
- Amount and assumptions may remain visible.
- CTA disabled.
- Offline notice pinned above CTA.

Copy:
- Title: `Connect to confirm`
- Body: `You can review the quote offline, but delivery creation needs a connection.`

Rules:
- Do not queue `create_delivery` in an offline outbox.
- Do not create delivery later without a fresh user action.
- Re-enable CTA only when connectivity returns and draft is still valid.

## Duplicate Submit Guard
Use when:
- Sender taps CTA repeatedly.
- App receives multiple submit intents for same draft.
- App resumes while previous request is unresolved.

Rules:
- Use local in-flight flag and request fingerprint.
- Disable button immediately on first tap.
- Ignore repeated taps while request is in flight.
- Persist request fingerprint before network call starts.
- If app crashes after request starts, restore recovery state rather than creating a new request.

Fingerprint fields:
- Sender ID.
- Origin station.
- Destination station.
- Receiver phone.
- Package description.
- Package weight.
- Package size.
- Service type.
- Doorstep request.
- Doorstep distance.
- Draft version.

Do not include:
- Local preview amount as a duplicate-guard authority.
- UI-only labels.
- Timestamps that change per render.

## Cancel Created Delivery Error
Use when:
- Backend quote changed.
- Sender taps `Cancel delivery`.
- `cancel_delivery` fails.

Layout:
- Keep changed quote panel.
- Show error callout above bottom CTA.

Copy:
- Title: `Delivery was not cancelled`
- Body: `Keep this screen open and try again. Payment has not started.`
- Primary: `Try cancel again`
- Secondary: `Continue with quote`

Rules:
- Do not hide created `deliveryId`.
- Do not clear created response until cancellation succeeds.
- Do not route back to editable draft while created delivery remains active.

## Visual System Direction
Visual thesis:
- Secure, calm, and exact. The screen should feel like a financial checkpoint, not a marketing upsell.

Color:
- Background: warm off-white or deep charcoal depending theme.
- Primary text: high-contrast ink.
- Accent: Kra trust green or route amber, not generic purple.
- Policy strip: low-saturation secure green.
- Error: accessible red used sparingly.
- Changed quote: amber with strong text contrast.

Typography:
- Use the app display face for the amount only.
- Use body face for all labels and support text.
- Amount should be large enough to scan at arm length.
- Supporting text should stay short and literal.

Shape:
- Quote hero may use a distinctive radius larger than input rows.
- Assumption rows should feel like grouped review cells, not many floating tiles.
- Bottom CTA area should have a firm separation from scroll content.

Spacing:
- Prioritize top amount breathing room.
- Keep assumption groups compact.
- Use larger vertical space before confirmation disclosure.
- Safe area padding is mandatory.

Iconography:
- Use icons only when they clarify: lock, route, person, package, service, home, payment.
- Icons must not replace text labels.
- Avoid decorative icon clusters.

## Layout Specifications
Base mobile layout:
- Scroll container fills screen.
- Header and progress at top.
- Quote hero appears immediately below progress.
- Payment strip follows quote hero.
- Assumption groups follow in a single column.
- Confirmation disclosure appears before sticky CTA.
- Sticky CTA remains visible at bottom.

Small phone:
- Amount and status remain in first viewport.
- Assumption rows collapse supporting text to one line where safe.
- Edit links remain visible.
- Progress label reduces to current step only.

Large phone:
- Quote hero may include route mini-summary in the same surface.
- Assumption groups can use two-column row labels only if readability remains high.

Tablet:
- Keep a centered max-width content column.
- Do not stretch quote hero across entire width.
- Sticky CTA aligns to content column.

Landscape:
- Keep CTA visible.
- Reduce vertical padding.
- Do not hide policy strip.

## Motion Specifications
Allowed motion:
- Amount fades from skeleton to value on first load.
- Quote lock status changes with short opacity transition.
- Changed quote panel slides up slightly from beneath amount.
- CTA loading indicator rotates or pulses.

Disallowed motion:
- No bouncing amount.
- No animated currency counters.
- No looping decorative effects.
- No confetti.
- No constant pulsing policy strip.

Timing:
- Page content entrance: 160ms to 220ms.
- Changed quote panel entrance: 180ms.
- Error callout entrance: 120ms.
- CTA state change: immediate label and disabled state.

Reduced motion:
- Replace movement with instant state changes and opacity only.

## Interaction Details
Screen open:
1. Restore draft.
2. Validate local draft.
3. Calculate local preview.
4. Render ready or invalid state.

Edit route:
1. Tap `Edit route`.
2. Navigate to station selection.
3. Mark quote review as requiring recalculation.
4. On return, recalculate local preview.

Confirm quote:
1. Tap `Confirm quote`.
2. Persist request fingerprint.
3. Disable controls.
4. Call `create_delivery`.
5. Validate response with `createDeliveryResponseSchema`.
6. Compare backend amount to local preview.
7. Route to summary or show changed quote.

Accept changed quote:
1. Tap `Continue with GHS {backendAmount}`.
2. Store changed quote acknowledgement.
3. Route to summary.

Cancel changed quote:
1. Tap `Cancel delivery`.
2. Confirm cancellation intent if product risk requires it.
3. Call `cancel_delivery` with `reasonCode=pricing_dispute` and note `Sender declined updated quote before payment.`
4. On success, clear created delivery response.
5. Route back to options.

Back:
- Before create request, go to options.
- During create request, block and explain quote is being locked.
- After created response, guard against abandoning an active pending-payment delivery.

## Copy Deck
Header:
- Eyebrow: `Step 6 of 7`
- Title: `Review quote`
- Subtitle: `Check the amount and delivery facts before payment.`

Quote hero:
- Label: `Your quote`
- Preview status: `Estimated before final check`
- Locked status: `Locked by backend`
- Payment line: `Payment is required before dispatch.`

Payment strip:
- Title: `Payment before dispatch`
- Body: `Kra will only dispatch after payment is confirmed. No driver or courier should collect cash for this booking.`

Confirmation disclosure:
- Title: `What happens when you confirm`
- Row 1: `Kra creates your delivery record.`
- Row 2: `The backend locks the quote for payment.`
- Row 3: `You will pay before the package can dispatch.`

Primary CTA:
- Ready: `Confirm quote`
- In flight: `Locking quote...`
- Changed: `Continue with GHS {backendAmount}`
- Error retry: `Try again`

Secondary actions:
- `Edit route`
- `Edit receiver`
- `Edit package`
- `Edit options`
- `Back to options`
- `Cancel delivery`

Success transition:
- `Quote locked. Opening delivery summary.`

Offline:
- Title: `Connect to confirm`
- Body: `You can review the quote offline, but delivery creation needs a connection.`

Network unknown:
- Title: `Quote was not confirmed`
- Body: `We could not confirm whether the delivery was created. Keep this screen open and check again before retrying.`

Backend validation:
- Title: `One detail needs correction`
- Body: `Review the highlighted delivery detail before confirming again.`

Quote changed:
- Title: `Quote updated during final check`
- Body: `The backend locked this delivery at GHS {backendAmount}. Your earlier estimate was GHS {previewAmount}.`
- Support: `Payment has not started.`

Cancel failure:
- Title: `Delivery was not cancelled`
- Body: `Keep this screen open and try again. Payment has not started.`

## Copy Rules
Tone:
- Direct.
- Calm.
- Financially precise.
- No hype.

Required terms:
- Use `quote`, not `estimate`, after backend lock.
- Use `backend` only in status copy when needed for trust; otherwise use `Kra final check`.
- Use `dispatch`, not vague `send out`.
- Use `payment`, not `charge`, until provider flow begins.

Avoid:
- `Pay now` on this screen.
- `Order complete`.
- `Delivery confirmed` before backend response.
- `Receipt`.
- `Cash on delivery`.
- `Free`.
- `Instant`.
- `Guaranteed arrival`.
- `Almost done` if payment remains.

Localization:
- Keep strings short.
- Avoid idioms.
- Keep currency formatting centralized.
- Do not bake station names into static strings.

## Backend Request Construction
Build request from local draft:
- Copy only schema fields.
- Trim receiver and package strings before validation if previous steps did not.
- Omit `doorstepDistanceKm` when `doorstepRequested=false`.
- Include `doorstepDistanceKm` when `doorstepRequested=true`.
- Include receiver address when available.
- Reject submit if doorstep is true and address is missing.

Do not send:
- Local preview amount.
- UI labels.
- Step history.
- Device metadata unless required by API client policy.
- Payment method.
- Payment phone.
- Tracking link preference.

Validation before submit:
- Client must validate against shared schema when available.
- Client must map errors to edit groups.
- Client must not rely only on disabled CTA state.

## Response Handling
Valid response:
- Parse with `createDeliveryResponseSchema`.
- Store full response.
- Store final backend quote amount.
- Store request fingerprint.
- Store created timestamp from response if backend later provides it; otherwise use client receipt time only for UI freshness, not audit authority.

Invalid response:
- Treat as contract error.
- Show generic API error.
- Do not route.
- Do not initialize payment.
- Capture telemetry with operation ID and request fingerprint.

Changed amount:
- Compare `response.quote.amount` with local preview amount.
- If different, render `quote_changed`.
- Store backend amount as authoritative.
- Do not overwrite backend amount with local preview.

Payment handoff:
- Payment method route receives `deliveryId`.
- Payment request later uses `amountGhs` from backend locked quote.
- Payment screens must not ask the user to type amount.

## Analytics
Events:
- `quote_review_viewed`
- `quote_preview_calculated`
- `quote_confirm_tapped`
- `quote_create_delivery_started`
- `quote_create_delivery_succeeded`
- `quote_create_delivery_failed`
- `quote_changed_shown`
- `quote_changed_accepted`
- `quote_changed_cancel_requested`
- `quote_changed_cancel_succeeded`
- `quote_changed_cancel_failed`
- `quote_edit_route_tapped`
- `quote_edit_receiver_tapped`
- `quote_edit_package_tapped`
- `quote_edit_options_tapped`
- `quote_offline_blocked`
- `quote_duplicate_submit_blocked`

Required properties:
- `originStationId`
- `destinationStationId`
- `serviceType`
- `doorstepRequested`
- `hasDoorstepDistance`
- `sizeTier`
- `isFragile`
- `declaredValueBand`
- `previewAmountGhs`
- `backendAmountGhs` only after backend response.
- `amountChanged`
- `deliveryId` only after creation.
- `errorCode` when available.

Privacy:
- Do not log receiver name.
- Do not log receiver phone.
- Do not log full receiver address.
- Do not log package description text.

## Accessibility Requirements
Screen reader:
- Page title announced on route entry.
- Amount announced with currency.
- Preview versus locked status announced.
- Changed quote status announced assertively.
- In-flight status announced politely.
- Error callouts announce title and recovery action.

Focus order:
- Header.
- Quote amount.
- Payment policy.
- Assumption groups in visual order.
- Edit action within each group.
- Confirmation disclosure.
- CTA.

Focus management:
- On invalid draft, move focus to callout title.
- On quote changed, move focus to changed quote title.
- On API error, move focus to error title.
- On returning from edit step, restore focus to changed group.

Touch targets:
- Minimum target size must meet platform guidelines.
- Edit links must be large enough even when text is short.
- Sticky CTA must be reachable with one hand.

Color:
- Amount and status must not rely on color alone.
- Changed quote must include text and icon.
- Error states require text, icon, and accessible color.

Text scaling:
- Amount can wrap if necessary, but must not truncate.
- Assumption supporting text can wrap to two lines.
- CTA can wrap only if platform button pattern supports it; otherwise shorten string.

Reduced motion:
- No essential information conveyed only by animation.

## Performance Requirements
Initial render:
- Render local draft content without remote dependency.
- Calculate local preview synchronously if bundle is loaded.
- If calculation is deferred, show loading state without network call.

Network:
- One create request per confirmation.
- Timeout policy must surface recoverable error.
- Retry must reuse safe request key where supported.

Bundle:
- Reuse shared pricing code rather than duplicating formula strings.
- Do not import admin pricing UI code.
- Do not import payment provider screens.

Low bandwidth:
- Screen must be useful offline for review.
- Confirmation requires connection.
- Avoid large images or map tiles.

## Security And Trust Requirements
Do:
- Treat backend response as authoritative.
- Keep payment amount immutable after quote lock.
- Protect against duplicate create requests.
- Separate quote confirmation from payment authorization.
- Make no-cash policy visible.
- Keep receiver personal data out of analytics.

Do not:
- Trust local preview for payment.
- Send payment request from this screen.
- Allow amount editing.
- Hide changed amount.
- Route to payment if delivery creation failed.
- Continue if response schema parse fails.
- Expose internal pricing IDs to sender.

## Edge Cases
Draft changed in another tab or device:
- Refresh local draft if supported.
- If conflict is detected, show `Details changed`.
- Require sender to review updated assumptions before confirming.

Station paused after draft:
- Backend validation should block.
- UI routes to station selection with clear message.

Pricing changed during review:
- Show `quote_changed`.
- Require acknowledgement.

Doorstep distance now outside policy:
- Backend validation maps to options.
- No amount shown after invalidation.

Package above self-serve threshold:
- Show manual review state.
- Do not create delivery.

App killed during request:
- Restore in-flight request fingerprint.
- Check persisted result before allowing retry.

Backend returns created delivery but navigation fails:
- Show `Continue to summary`.
- Do not resubmit.

Sender taps Android back during request:
- Show guard: `Quote lock in progress. Wait for the result before leaving.`

Sender loses network after request reaches backend:
- Use network unknown recovery.
- Do not create a second request with a new key.

## QA Scenarios
Happy path:
1. Enter with valid station pickup draft.
2. See `GHS` amount in first viewport.
3. See payment-before-dispatch strip.
4. Tap `Confirm quote`.
5. `create_delivery` called once.
6. Response parsed.
7. App routes to delivery summary.

Doorstep path:
1. Enter with doorstep requested and valid distance.
2. See doorstep assumption with distance.
3. Confirm quote.
4. Request includes `doorstepDistanceKm`.
5. Response amount becomes backend authority.

Station pickup path:
1. Enter with station pickup.
2. Confirm quote.
3. Request omits `doorstepDistanceKm`.
4. Final-mile assumption says receiver collects at destination station.

Changed quote:
1. Local preview is `GHS 50`.
2. Backend returns `GHS 55`.
3. Screen shows changed quote panel.
4. No payment call occurs.
5. Sender accepts.
6. App routes to summary with backend amount.

Changed quote cancellation:
1. Backend returns changed amount.
2. Sender taps `Cancel delivery`.
3. App calls `cancel_delivery`.
4. On success, created response is cleared.
5. App routes to options.

Duplicate submit:
1. Sender taps confirm repeatedly.
2. Only one create request is sent.
3. CTA remains disabled while in flight.

Offline:
1. Device is offline.
2. Amount remains visible if draft is valid.
3. CTA disabled.
4. No create request is queued.

Validation error:
1. Backend rejects receiver phone.
2. Error maps to receiver group.
3. CTA routes to receiver details.
4. No payment call occurs.

Network unknown:
1. Request times out.
2. Screen shows unknown result copy.
3. Retry uses safe recovery.
4. No second delivery is created.

Large text:
1. Enable largest accessibility text.
2. Amount remains readable.
3. CTA remains reachable.
4. Assumption rows do not clip.

Reduced motion:
1. Enable reduced motion.
2. No slide or shimmer is required for understanding.

## Automated Test Expectations
Unit tests:
- Valid draft produces local preview amount.
- Station pickup request omits `doorstepDistanceKm`.
- Doorstep request includes `doorstepDistanceKm`.
- Invalid draft blocks submit.
- Backend response amount replaces preview amount.
- Changed backend amount triggers `quote_changed`.
- Duplicate submit sends one request.
- Payment initialization is not called.

Component tests:
- Renders amount in first viewport.
- Renders all assumption groups.
- Edit links route correctly.
- In-flight disables controls.
- Offline disables confirm.
- Validation error maps to correct edit step.
- Changed quote panel has accept and cancel controls.

E2E tests:
- Valid station pickup completes quote review and reaches summary.
- Valid doorstep completes quote review and reaches summary.
- Changed quote requires acknowledgement.
- Duplicate tap creates one delivery.
- Offline blocks backend create.
- Invalid receiver phone routes back to receiver step.

Coverage requirements:
- Include normal, changed quote, invalid draft, network, offline, and duplicate submit paths.
- Include screen reader label checks where testing stack supports it.

## Implementation Notes For Claude Code
Build order:
1. Create route shell for `/(sender)/create/quote`.
2. Add local draft selector and validation.
3. Add local quote preview calculation from shared pricing.
4. Render quote hero and payment policy.
5. Render assumption groups with edit actions.
6. Add submit state machine.
7. Integrate `create_delivery`.
8. Add changed quote handling.
9. Add duplicate-submit recovery.
10. Add invalid draft routing.
11. Add tests.

Do not build:
- Payment UI.
- Receipt UI.
- Provider callback UI.
- Station intake UI.
- Driver assignment UI.
- Finance pricing admin UI.

Contract boundary:
- This screen creates delivery.
- Next screen summarizes created delivery.
- Payment method screen initializes payment.

Data boundary:
- Local preview is not authoritative.
- Backend response is authoritative.
- Payment amount comes from backend response only.

## Acceptance Checklist
- `screen-quote-review` route renders.
- Amount appears as `GHS {amount}` in the first viewport.
- Payment-before-dispatch rule is visible.
- All assumptions are visible.
- Each editable assumption routes to the correct prior step.
- `Confirm quote` calls `create_delivery` exactly once.
- The request matches `createDeliveryRequestSchema`.
- The response matches `createDeliveryResponseSchema`.
- Backend quote is stored.
- Backend amount is used for downstream payment.
- Payment is not initialized on this screen.
- Changed quote blocks automatic route.
- Changed quote can be accepted.
- Changed quote can be cancelled through `cancel_delivery`.
- Changed quote cancellation uses `reasonCode=pricing_dispute`.
- Offline state blocks confirmation.
- Network unknown state avoids duplicate delivery.
- Large text does not break layout.
- Reduced motion remains usable.
- Analytics omit receiver personal data.
- Tests cover happy path, changed quote, invalid draft, offline, and duplicate submit.

## Final Handoff Summary
Claude Code should build `QuoteReview` as a mobile financial checkpoint. The screen must show one clear `GHS` amount, explain payment-before-dispatch, show the assumptions behind the quote, and call `create_delivery` only after the sender taps `Confirm quote`. The backend response is the source of truth. If backend pricing differs from the local preview, the screen must stop, show the updated amount, and require the sender to continue or cancel the created delivery before moving on.
