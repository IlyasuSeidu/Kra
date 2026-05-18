# Delivery Summary Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DeliverySummary` |
| App | `apps/mobile` |
| Route | `/(sender)/create/summary` |
| Primary test ID | `screen-delivery-summary` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Created delivery handoff, `get_delivery`, `deliveryDetailResponseSchema`, `createDeliveryResponseSchema`, payment-before-dispatch policy |
| Related routes | `/(sender)/create/quote`, `/(sender)/payments/:deliveryId/method`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home` |
| Required states | `loading`, `ready`, `handoff_missing`, `handoff_invalid`, `delivery_fetching`, `delivery_fetch_error`, `delivery_not_found`, `not_authorized`, `payment_already_started`, `payment_required`, `stale_local_summary`, `offline_recovery` |

## Product Job
This screen confirms that the delivery has been created, shows the locked quote and delivery identifiers, and moves the sender into payment without creating a second delivery. It is the bridge between quote acceptance and payment method selection.

The sender should be able to:
- See that the delivery was created.
- See `deliveryId` and `trackingCode`.
- Confirm the locked `GHS` amount.
- Understand that payment is still required before dispatch.
- Review the route, receiver, package, service, and final-mile summary.
- Continue to payment method selection.
- Recover if the app reloads after QuoteReview.
- Avoid duplicate delivery creation.

This screen is not quote review, local pricing preview, delivery creation, payment initialization, provider processing, payment result, receipt display, station intake, tracking timeline, or issue support.

## Audience
Primary audience:
- Authenticated senders who have just confirmed a quote.
- Senders who need assurance that their delivery exists before paying.
- Small-business senders who need the tracking code and payment next step.
- Senders on unstable networks who may need recovery after creation.

Secondary audience:
- QA engineers validating post-create handoff behavior.
- Claude Code implementing this route from the spec.
- Support teams helping senders who created a delivery but have not paid.
- Product and finance reviewers validating payment-before-dispatch messaging.

## User State
The sender has accepted the backend quote on `QuoteReview`. They now have a created delivery with `paymentStatus=pending` and must choose a payment method before the package can dispatch.

The sender may be:
- Relieved that the delivery has been created.
- Unsure whether the delivery is already paid.
- Looking for the tracking code.
- Ready to pay immediately.
- Recovering after app backgrounding or reload.
- Worried that tapping again could create another delivery.

The screen must:
- Make the created-delivery status clear.
- Make unpaid status clear.
- Keep the payment CTA dominant.
- Show tracking code without implying receiver notification has already happened.
- Preserve all locked quote data from backend response.
- Fetch delivery detail only when local handoff is missing or stale.
- Never call `create_delivery`.
- Never initialize payment until the payment method screen.

## Primary Action
Primary CTA:
- `Continue to payment`

Secondary actions:
- `View delivery details`
- `Back to quote` only before payment and only when handoff state is recoverable.
- `Go home`
- `Copy tracking code`

CTA behavior:
- `Continue to payment` routes to `/(sender)/payments/:deliveryId/method`.
- `Continue to payment` must not call `initialize_payment`.
- `Continue to payment` must not call `create_delivery`.
- `Continue to payment` must pass `deliveryId` and locked amount through route state or cache.
- Payment method screen owns provider choice and payment initialization.
- `View delivery details` routes to `/(sender)/deliveries/:deliveryId`.
- `Copy tracking code` copies only `trackingCode`, not receiver private data.
- `Go home` routes to `/(sender)/home` and keeps the pending-payment delivery visible there.

CTA disabled conditions:
- Missing `deliveryId`.
- Missing locked quote.
- `paymentRequiredBeforeDispatch` not true when using QuoteReview handoff.
- Delivery detail fetch still in progress.
- Delivery current status is not payable.
- Delivery already cancelled.
- Delivery not authorized.

Success behavior:
- The sender lands on payment method selection with the same backend amount.
- No additional delivery record is created.
- The summary state remains recoverable if the sender comes back.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Delivery created.
- Locked quote amount.
- Payment required before dispatch.
- Tracking code.
- A clear button to payment.

The screen creates value by:
- Turning quote acceptance into a visible delivery record.
- Preventing duplicate booking anxiety.
- Making payment the obvious next step.
- Giving the sender a stable reference code.
- Setting the expectation that dispatch is blocked until payment confirmation.

## Main Tension
The sender has created a delivery but has not paid. The screen must celebrate progress without implying the job is complete. It must also avoid a dangerous second create action while preserving recovery if the app state is lost.

The screen must balance:
- Completion feeling against unpaid status accuracy.
- Tracking code visibility against premature receiver-sharing pressure.
- Fast payment movement against enough delivery facts to trust the payment amount.
- Local handoff speed against server recovery through `get_delivery`.
- Operational truth against a calm sender experience.

## Design Brief
User and job:
- An authenticated sender needs to confirm a created delivery and continue to payment.

Context of use:
- Post-create, pre-payment, mobile, money-sensitive.

Entry point:
- `/(sender)/create/quote` after valid `createDeliveryResponseSchema`.

Success state:
- Sender routes to payment method selection for the created delivery.

Primary action:
- `Continue to payment`

Navigation model:
- Step 7 of sender create-delivery stack flow.

Density:
- Clear success header, compact locked quote, actionable next-step panel, delivery facts below.

Visual thesis:
- A boarding-pass style confirmation: created record, locked amount, next action, and reference code in a calm operational layout.

Restraint rule:
- Avoid payment provider controls, receipt language, route maps, courier assignment, receiver sharing prompts, and celebratory visuals that imply payment is complete.

Product lens:
- Trust-critical post-create checkpoint.

System stance:
- Native-plus summary surface with strong status hierarchy and low cognitive load.

Interaction thesis:
- The screen should answer "What exists now?", "What must I do next?", and "What reference should I keep?"

Signature move:
- A compact delivery passport card with tracking code, route, locked quote, and unpaid status in one scannable surface.

Activation event:
- Sender taps `Continue to payment`.

## Elite Quality Gate
This spec is not closed unless the resulting screen makes created status and unpaid status equally clear.

Non-negotiable quality requirements:
- The first viewport must say the delivery was created.
- The first viewport must show the locked `GHS` amount.
- The first viewport must say payment is still required.
- The first viewport must show the primary payment CTA.
- The screen must show `trackingCode`.
- The screen must not call `create_delivery`.
- The screen must not call `initialize_payment`.
- The screen must not show a payment method selector.
- The screen must not show payment success.
- The screen must not show receipt wording.
- The screen must not imply dispatch can happen before payment.
- The screen must recover from missing local handoff by using `get_delivery` when a persisted `deliveryId` exists.
- The screen must not expose receiver phone in copy-to-clipboard actions.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the sender can tap a control that creates another delivery, the screen remains open.
- If payment status is ambiguous, the screen remains open.
- If the tracking code is absent, the screen remains open.
- If the CTA initializes payment on this screen, the screen remains open.
- If a user can reach payment without a backend locked amount, the screen remains open.
- If the screen cannot recover after app reload, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear post-action feedback, careful payment handoff, and native navigation.
- Material Design 3 guidance for cards, buttons, lists, and progress indicators supports scannable mobile summary pages.
- W3C WCAG guidance supports clear status messages, focus order, and error recovery.
- Baymard order confirmation guidance reinforces clear order reference, total, and next steps after checkout actions.
- Kra QuoteReview spec resolves that delivery creation happens before this screen.
- Kra API contracts define `createDeliveryResponseSchema`, `deliveryDetailResponseSchema`, `get_delivery`, and `initialize_payment` boundaries.
- Kra payment policy requires payment confirmation before dispatch and no standard cash collection.
- Kra sender app policy requires secure tracking support without confusing unpaid delivery state.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/apple-pay
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/lists/overview
- https://www.w3.org/WAI/WCAG22/quickref/
- https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/order-confirmation
- `docs/05-design/frontend-screen-specs/sender-mobile-app/10-quote-review.md`
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/07-api/api-contracts.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/delivery-queries.ts`

## Product Assumptions
Assumptions for v1:
- QuoteReview has already called `create_delivery`.
- DeliverySummary receives or restores a created delivery response.
- Created delivery starts unpaid.
- `paymentRequiredBeforeDispatch=true` for the create response.
- Payment method selection happens on the next route.
- `MTN MoMo` is the first production payment path, but provider choice is not shown here.
- Receiver notification and tracking sharing should not be pushed before payment confirmation unless product later decides otherwise.
- Tracking code can be shown as a sender reference before payment.
- Local draft may still exist, but backend detail is authoritative after creation.
- If local handoff is lost, a persisted `deliveryId` can be used to fetch `get_delivery`.

## Resolved Flow Decision
Inventory context:
- The inventory lists `DeliverySummary` with `create_delivery`.
- `QuoteReview` now owns `create_delivery` to lock the authoritative quote after explicit sender confirmation.

Decision:
- `DeliverySummary` must not call `create_delivery`.
- `DeliverySummary` consumes the created response from QuoteReview.
- `DeliverySummary` may call `get_delivery` for recovery or freshness.
- `DeliverySummary` routes to payment method selection.

Reason:
- Prevents duplicate bookings.
- Keeps quote lock auditable.
- Keeps payment initialization in the payment flow.
- Preserves the user's review-before-create moment on QuoteReview.

Implementation consequence:
- The route must require either a created delivery handoff or a persisted `deliveryId`.
- If neither exists, show handoff recovery instead of creating a new delivery.

## Backend Contract
Primary source:
- Created delivery handoff from `createDeliveryResponseSchema`.

Recovery source:
- `get_delivery`

Recovery HTTP:
- `GET /v1/deliveries/:id`

Recovery response:
- `deliveryDetailResponseSchema`

Payment next route:
- `/(sender)/payments/:deliveryId/method`

Must not call:
- `POST /v1/deliveries`
- `POST /v1/payments/initialize`
- `POST /v1/payments/verify`

Created handoff fields:
- `deliveryId`
- `trackingCode`
- `status`
- `quote.currency`
- `quote.amount`
- `paymentRequiredBeforeDispatch`

Delivery detail fields when fetched:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver`
- `package`
- `quote`
- `latestEvent`
- `latestTouchpoint`

Required checks:
- `deliveryId` must match any persisted handoff ID.
- `quote.currency` must be `GHS`.
- `quote.amount` must be positive.
- `paymentStatus` must be `pending` before routing to payment method.
- `currentStatus` should be `created` for the normal fresh summary path.

## Data Read Model
Read from handoff cache:
- Created delivery response from QuoteReview.
- Quote changed acknowledgement when applicable.
- Request fingerprint.
- Local draft summary for route and package display.

Read from persisted state:
- Last created `deliveryId`.
- Last created `trackingCode`.
- Last locked quote.
- Handoff timestamp.

Read from backend:
- `get_delivery` only if handoff is missing, invalid, stale, or app restored after termination.

Write locally:
- Summary viewed timestamp.
- Payment CTA tapped timestamp.
- Delivery summary freshness marker.
- Copied tracking code timestamp.

Write remotely:
- None on normal screen load.
- None on `Continue to payment`.

## Route Entry Conditions
Normal entry:
- Created response exists from QuoteReview.
- Response passes `createDeliveryResponseSchema`.
- `paymentRequiredBeforeDispatch=true`.
- Quote amount is present.

Recovery entry:
- Created response missing.
- Persisted `deliveryId` exists.
- Fetch `get_delivery`.
- Render summary if fetch returns accessible delivery.
- Created response fails validation but persisted `deliveryId` exists.
- Fetch `get_delivery` instead of treating the invalid handoff as terminal.

Blocked entry:
- No created response.
- No persisted `deliveryId`.
- Created response fails validation and no persisted `deliveryId` exists.
- Fetched delivery is not accessible.
- Fetched delivery is cancelled.

Blocked UI:
- No amount hero.
- Show recovery callout.
- Primary action routes to home or quote review depending what data exists.
- Do not create delivery.

## Information Architecture
Top-level structure:
1. Success header.
2. Delivery passport card.
3. Payment-required next-step panel.
4. Delivery facts.
5. Sender reference actions.
6. Sticky payment CTA.

Required first viewport:
- `Delivery created`
- `Pay before dispatch`
- `GHS {amount}`
- `Tracking code {trackingCode}`
- `Continue to payment`

Why this order:
- Created status answers "did it work?"
- Payment status answers "what is left?"
- Amount anchors financial trust.
- Tracking code gives sender a reference.
- CTA moves the flow forward.

## Success Header
Purpose:
- Confirm backend creation without implying payment completion.

Content:
- Eyebrow: `Delivery created`
- Title: `Pay before dispatch`
- Subtitle: `Your delivery is saved. Complete payment so Kra can dispatch it.`

Visual:
- Use a check icon paired with a payment-required badge.
- Check icon confirms creation only.
- Payment badge prevents false completion.

Rules:
- Do not say `Payment complete`.
- Do not say `Order complete`.
- Do not say `All set`.
- Do not use confetti.
- Do not hide unpaid state below the fold.

Screen reader:
- Announce `Delivery created. Payment is required before dispatch.`

## Delivery Passport Card
Purpose:
- Provide the essential delivery reference and locked quote in one scannable block.

Fields:
- Tracking code.
- Delivery ID.
- Locked quote amount.
- Current payment status.
- Route summary.
- Created status.

Primary visual hierarchy:
- Tracking code.
- Locked quote.
- Payment required.
- Route.
- Delivery ID.

Content:
- Label: `Tracking code`
- Value: `{trackingCode}`
- Action: `Copy`
- Amount label: `Locked quote`
- Amount value: `GHS {amount}`
- Payment label: `Payment status`
- Payment value: `Pending`
- Status label: `Delivery status`
- Status value: `Created`

Rules:
- Copy action copies only `trackingCode`.
- Delivery ID can be smaller than tracking code.
- Payment pending must be visible.
- Do not show receiver phone in this card.
- Do not show provider reference before payment initialization.

## Payment Required Panel
Purpose:
- Make the next action and operational gate explicit.

Content:
- Title: `Payment is the next step`
- Body: `Kra will not dispatch this package until payment is confirmed. Choose a payment method to continue.`
- CTA inline or sticky anchor: `Continue to payment`

Optional support line:
- `No cash collection is part of the standard v1 flow.`

Rules:
- This panel must appear above detailed facts.
- It must not show provider buttons.
- It must not show payment processing state.
- It must not say payment has started.

## Delivery Facts
Purpose:
- Let the sender confirm that the created delivery matches what they intended.

Groups:
- Route
- Receiver
- Package
- Service
- Final mile
- Quote

Route group:
- Main: `{originStationName} to {destinationStationName}`
- Supporting: `Created under tracking code {trackingCode}.`

Receiver group:
- Main: `{receiver.name}`
- Supporting: `Receiver phone saved for notices and proof checks.`
- Do not show full phone by default; mask middle digits.

Package group:
- Main: `{package.description}`
- Supporting: `{weightKg} kg, {sizeTier}, {fragile or standard handling}`
- Declared value: `Declared value: GHS {declaredValueGhs}`

Service group:
- Main: `Standard` or `Express`
- Supporting: `Payment must confirm before this service can begin.`

Final-mile group:
- Station pickup main: `Receiver collects at destination station`
- Doorstep main: `Doorstep delivery requested`
- Doorstep supporting: `{doorstepDistanceKm} km from destination station`

Quote group:
- Main: `GHS {amount}`
- Supporting: `Locked from backend quote.`

Rules:
- Facts are review-only on this screen.
- No inline editing after creation.
- To change facts, sender must use cancellation or support flow later.
- Do not imply the sender can freely edit a created delivery.

## Sender Reference Actions
Actions:
- `Copy tracking code`
- `View delivery details`
- `Go home`

Copy tracking code:
- Shows transient confirmation: `Tracking code copied`
- Does not copy receiver verification links.
- Does not copy receiver phone.

View delivery details:
- Routes to sender delivery detail.
- Useful if sender does not want to pay immediately.

Go home:
- Routes to sender home.
- Home must show this delivery as pending payment.

Do not include:
- Share receiver tracking link as primary action before payment.
- Receipt sharing.
- Provider support.
- Courier contact.

## Sticky CTA Area
Purpose:
- Keep payment movement obvious.

Default:
- Primary: `Continue to payment`
- Secondary: `View delivery details`

Loading:
- Primary disabled: `Preparing summary...`

Fetch error:
- Primary: `Try again`
- Secondary: `Go home`

Already paid:
- Primary: `View delivery`
- Secondary: `Go home`

Already cancelled:
- Primary: `Go home`
- Secondary: `View delivery`

Rules:
- Sticky CTA must respect safe area.
- CTA must not hide delivery facts.
- CTA must not initialize payment.
- CTA route must include `deliveryId`.

## Component Inventory
Required components:
- `CreateFlowHeader`
- `DeliveryCreatedHeader`
- `DeliveryPassportCard`
- `PaymentRequiredPanel`
- `DeliveryFactGroup`
- `TrackingCodeCopyButton`
- `SummaryRecoveryCallout`
- `SummaryStatusBanner`
- `StickyPaymentCtaBar`

Reusable component requirements:
- Components must support dynamic station and receiver names.
- Components must accept backend status values.
- Components must handle masked personal data.
- Components must expose test IDs.
- Components must work in light and dark themes.
- Components must support long tracking codes.

## Test IDs
Screen:
- `screen-delivery-summary`

Header:
- `delivery-summary-header`
- `delivery-created-status`
- `delivery-payment-required-status`

Passport:
- `delivery-passport-card`
- `delivery-summary-tracking-code`
- `delivery-summary-copy-tracking-code`
- `delivery-summary-delivery-id`
- `delivery-summary-locked-quote`
- `delivery-summary-payment-status`

Facts:
- `delivery-summary-facts`
- `delivery-summary-route`
- `delivery-summary-receiver`
- `delivery-summary-package`
- `delivery-summary-service`
- `delivery-summary-final-mile`
- `delivery-summary-quote`

Actions:
- `delivery-summary-continue-payment`
- `delivery-summary-view-delivery`
- `delivery-summary-go-home`

States:
- `delivery-summary-loading`
- `delivery-summary-handoff-missing`
- `delivery-summary-handoff-invalid`
- `delivery-summary-fetch-error`
- `delivery-summary-not-found`
- `delivery-summary-not-authorized`
- `delivery-summary-offline-recovery`

## State Model
States:
- `loading`
- `ready`
- `handoff_missing`
- `handoff_invalid`
- `delivery_fetching`
- `delivery_fetch_error`
- `delivery_not_found`
- `not_authorized`
- `payment_required`
- `payment_already_started`
- `already_paid`
- `already_cancelled`
- `stale_local_summary`
- `offline_recovery`

Initial resolution:
- Read created delivery handoff.
- Validate response shape.
- Read local draft summary for display.
- If handoff is valid, render `ready`.
- If handoff is missing but persisted `deliveryId` exists, fetch `get_delivery`.
- If handoff is invalid but persisted `deliveryId` exists, fetch `get_delivery`.
- If neither exists, render `handoff_missing`.

Payment status resolution:
- `pending` renders payment-required CTA.
- `confirmed` routes or offers delivery detail.
- `failed` routes to payment recovery if a payment record exists.
- `refund_pending` or `refunded` renders delivery detail route, not payment CTA.

Delivery status resolution:
- `created` is normal.
- `cancelled` blocks payment CTA.
- Later lifecycle statuses should generally route to delivery detail because summary is no longer the right surface.

## Loading State
Use when:
- Created response is being read.
- Local display facts are being restored.
- Recovery fetch is not yet started.

Layout:
- Header skeleton.
- Passport skeleton.
- Payment panel skeleton.
- Sticky CTA disabled.

Copy:
- Title: `Preparing delivery summary`
- Body: `Checking the created delivery on this device.`

Rules:
- Do not show stale amount until validated.
- Do not call `create_delivery`.
- Do not show payment CTA until `deliveryId` is known.

## Ready State
Use when:
- Created delivery handoff is valid.
- Locked quote exists.
- Payment is required and not started on this screen.

Required content:
- Created status.
- Payment required status.
- Tracking code.
- Delivery ID.
- Locked amount.
- Delivery facts.
- `Continue to payment` CTA.

Rules:
- Payment CTA routes only.
- No provider operation runs here.
- No editable delivery facts appear.
- Copy tracking code works.

Analytics:
- Fire `delivery_summary_viewed`.

## Handoff Missing State
Use when:
- Route opens without created response.
- No persisted `deliveryId` exists.

Layout:
- Blocking recovery callout.
- No amount.
- No tracking code.

Copy:
- Title: `Delivery summary is not ready`
- Body: `We could not find the created delivery for this step. Return to quote review or go home to check active deliveries.`
- Primary: `Back to quote review`
- Secondary: `Go home`

Rules:
- Do not create delivery.
- Do not initialize payment.
- Do not infer delivery from local draft.

## Handoff Invalid State
Use when:
- Created response exists but fails schema validation.
- Required quote fields are missing.
- `paymentRequiredBeforeDispatch` is false or absent.
- No persisted `deliveryId` is available for recovery fetch.

If a persisted `deliveryId` exists:
- Do not render this as terminal.
- Enter `delivery_fetching`.
- Recover through `get_delivery`.

Layout:
- Blocking callout.
- Show technical-safe user copy.
- Offer home and quote review recovery.

Copy:
- Title: `Delivery summary needs refresh`
- Body: `The created delivery response was incomplete. Refresh from your deliveries before payment.`
- Primary: `Go home`
- Secondary: `Back to quote review`

Rules:
- Do not show amount.
- Do not route to payment.
- Capture telemetry with handoff validation failure.

## Delivery Fetching State
Use when:
- Local handoff is missing or stale.
- Persisted `deliveryId` exists.
- App is fetching `get_delivery`.

Layout:
- Keep recovery skeleton.
- Show status text.

Copy:
- Title: `Restoring delivery`
- Body: `Checking the created delivery before payment.`

Rules:
- Fetch once per route entry unless user retries.
- Do not start payment while fetch is pending.
- If offline, render `offline_recovery`.

## Delivery Fetch Error State
Use when:
- `get_delivery` fails due to network or server error.

Layout:
- Error callout.
- Primary retry.
- Secondary home.

Copy:
- Title: `Could not load delivery`
- Body: `We could not refresh the created delivery. Try again before payment.`
- Primary: `Try again`
- Secondary: `Go home`

Rules:
- Do not route to payment.
- Do not create delivery.
- Keep persisted `deliveryId` for retry.

## Delivery Not Found State
Use when:
- `get_delivery` returns not found.

Copy:
- Title: `Delivery was not found`
- Body: `This reference is not available. Check your delivery history or return home.`
- Primary: `Go home`

Rules:
- Do not show local draft facts as if delivery exists.
- Do not route to payment.

## Not Authorized State
Use when:
- `get_delivery` returns forbidden or unauthorized.

Copy:
- Title: `You cannot view this delivery`
- Body: `Sign in with the sender account that created this delivery.`
- Primary: `Go home`

Rules:
- Do not show receiver or package data.
- Do not show quote amount.

## Offline Recovery State
Use when:
- Handoff is missing or stale.
- Fetch is needed.
- Device is offline.

Copy:
- Title: `Connect to restore summary`
- Body: `Your delivery may already exist. Connect before payment so Kra can verify it.`
- Primary: `Try again when online`
- Secondary: `Go home`

Rules:
- Do not show payment CTA.
- Do not create delivery.
- Do not clear persisted ID.

## Payment Already Started State
Use when:
- Sender returns to summary after payment initialization started.
- Payment status is pending but provider payment exists in local payment state.

Copy:
- Title: `Payment is already in progress`
- Body: `Continue to payment processing to avoid starting another payment.`
- Primary: `Continue payment`
- Secondary: `View delivery`

Rules:
- Route to payment processing or recovery based on stored payment state.
- Do not route to payment method if it could create another payment intent.
- Do not initialize payment here.

## Already Paid State
Use when:
- Delivery fetch returns `paymentStatus=confirmed`.

Copy:
- Title: `Payment confirmed`
- Body: `This delivery is ready for the next operational step.`
- Primary: `View delivery`
- Secondary: `Go home`

Rules:
- Do not show payment CTA.
- Do not initialize payment again.
- Do not show receipt actions on this screen.

## Already Cancelled State
Use when:
- Delivery fetch returns `currentStatus=cancelled`.

Copy:
- Title: `Delivery cancelled`
- Body: `This delivery is no longer payable.`
- Primary: `Go home`
- Secondary: `View delivery`

Rules:
- Do not show payment CTA.
- Do not show receiver-sharing actions.

## Visual System Direction
Visual thesis:
- Operational confirmation, not celebration. The page should feel exact, official, and ready for payment.

Color:
- Created status uses calm success.
- Payment required uses secure amber or trust green, not warning red unless blocked.
- Amount and tracking code use high-contrast text.
- Background uses a clean app surface with subtle depth.

Typography:
- Title is strong but not oversized.
- Tracking code uses a legible mono or tabular style.
- Amount uses large numeric style.
- Payment status uses concise label text.

Shape:
- Passport card may use a distinctive clipped or ticket-like corner treatment if design system supports it.
- Fact groups use quiet separators.
- Sticky CTA uses strong containment.

Spacing:
- Header and passport card need generous top spacing.
- Fact groups should be compact after the first viewport.
- Payment panel should sit above fold.

Iconography:
- Use check for created.
- Use lock or shield for payment gate.
- Use route, package, person, and home icons for facts.
- Icons must never replace labels.

## Layout Specifications
Base mobile layout:
- Scroll container.
- Created header at top.
- Passport card immediately below.
- Payment required panel below passport.
- Fact groups below panel.
- Reference actions near bottom.
- Sticky CTA always visible.

Small phone:
- Header title and subtitle must fit without clipping.
- Passport card may stack fields vertically.
- Tracking code may wrap with preserved copy action.
- Sticky CTA remains visible.

Large phone:
- Passport card can show quote and payment status side by side.
- Fact groups remain single column for scan quality.

Tablet:
- Center content column.
- Passport card max width.
- Sticky CTA aligns with content column.

Landscape:
- Reduce vertical spacing.
- Keep payment CTA visible.
- Do not hide tracking code.

## Motion Specifications
Allowed motion:
- Created header fades in after handoff validation.
- Passport card rises slightly into place.
- Copy confirmation fades out.
- Payment CTA state changes immediately.

Disallowed motion:
- No confetti.
- No animated checkmark that implies full completion.
- No looping payment urgency animation.
- No amount counter animation.

Timing:
- Initial content entrance: 160ms to 220ms.
- Copy confirmation: 120ms in, 140ms out.
- Error callout: immediate with minor opacity change.

Reduced motion:
- Use static state changes.
- No vertical movement.

## Interaction Details
Screen open with valid handoff:
1. Validate created response.
2. Merge display facts from local draft.
3. Render ready.
4. Fire viewed analytics.

Screen open with persisted ID:
1. Render delivery fetching.
2. Call `get_delivery`.
3. Parse `deliveryDetailResponseSchema`.
4. Render ready or blocked state.

Continue to payment:
1. Validate `deliveryId`.
2. Validate locked amount.
3. Confirm status is payable.
4. Route to `/(sender)/payments/:deliveryId/method`.
5. Do not call payment API.

Copy tracking code:
1. Tap copy.
2. Copy `trackingCode`.
3. Show `Tracking code copied`.
4. Announce copy result to assistive tech.

Go home:
1. Tap `Go home`.
2. Route to sender home.
3. Home should show pending payment next action.

Back behavior:
- If coming directly from QuoteReview and no payment started, back can return to QuoteReview in read-only locked mode if implemented.
- If no safe QuoteReview state exists, back routes home.
- Hardware back should not recreate draft or delivery.

## Copy Deck
Header:
- Eyebrow: `Delivery created`
- Title: `Pay before dispatch`
- Subtitle: `Your delivery is saved. Complete payment so Kra can dispatch it.`

Passport:
- `Tracking code`
- `Delivery ID`
- `Locked quote`
- `Payment status`
- `Pending`
- `Delivery status`
- `Created`

Payment panel:
- Title: `Payment is the next step`
- Body: `Kra will not dispatch this package until payment is confirmed. Choose a payment method to continue.`
- Support: `No cash collection is part of the standard v1 flow.`

Primary CTA:
- `Continue to payment`

Secondary actions:
- `Copy tracking code`
- `View delivery details`
- `Go home`

Copy confirmation:
- `Tracking code copied`

Handoff missing:
- Title: `Delivery summary is not ready`
- Body: `We could not find the created delivery for this step. Return to quote review or go home to check active deliveries.`

Handoff invalid:
- Title: `Delivery summary needs refresh`
- Body: `The created delivery response was incomplete. Refresh from your deliveries before payment.`

Fetch error:
- Title: `Could not load delivery`
- Body: `We could not refresh the created delivery. Try again before payment.`

Offline recovery:
- Title: `Connect to restore summary`
- Body: `Your delivery may already exist. Connect before payment so Kra can verify it.`

Already paid:
- Title: `Payment confirmed`
- Body: `This delivery is ready for the next operational step.`

Already cancelled:
- Title: `Delivery cancelled`
- Body: `This delivery is no longer payable.`

## Copy Rules
Tone:
- Clear.
- Operational.
- Calm.
- No hype.

Required terms:
- Use `delivery created` for backend creation.
- Use `payment required` for unpaid state.
- Use `locked quote` for backend amount.
- Use `dispatch` for transport gate.
- Use `tracking code` for sender reference.

Avoid:
- `Order complete`
- `All set`
- `Paid`
- `Receipt`
- `Driver assigned`
- `Courier assigned`
- `Package on the way`
- `Share with receiver` as a primary action before payment.

Localization:
- Keep strings short.
- Avoid idioms.
- Keep currency formatting centralized.
- Do not hardcode station labels.
- Mask personal data using locale-safe utilities.

## Backend Recovery Rules
When to fetch:
- Handoff is missing and persisted `deliveryId` exists.
- Handoff parse fails but persisted `deliveryId` exists.
- Handoff timestamp is stale by app policy.
- User manually refreshes.

When not to fetch:
- Valid handoff exists and is fresh.
- No persisted `deliveryId` exists.
- Device is offline.

Fetch handling:
- Parse with `deliveryDetailResponseSchema`.
- If unauthorized, show not authorized.
- If not found, show not found.
- If status is cancelled, show already cancelled.
- If payment is confirmed, show already paid.
- If payment is pending and status is created, render payment required.

Do not:
- Recreate delivery from local draft.
- Use local draft as authority after handoff failure.
- Route to payment without backend amount.

## Payment Boundary
This screen may:
- Route to payment method selection.
- Display locked amount.
- Display payment required.
- Display payment pending.

This screen must not:
- Choose provider.
- Initialize payment.
- Verify payment.
- Poll provider status.
- Show provider return state.
- Show payment failure recovery.
- Show receipt.

Payment handoff data:
- `deliveryId`
- `amountGhs` from backend locked quote.
- `currency=GHS`
- Optional `trackingCode` for display only.

The payment method screen must:
- Read backend locked amount.
- Submit `paymentInitializeRequestSchema`.
- Prevent amount editing.

## Tracking Code Rules
Show:
- Tracking code in passport card.
- Copy action.
- Explanation: `Use this code when contacting Kra about this delivery.`

Do not show by default:
- Receiver verification URL.
- Receiver OTP.
- Receiver phone in full.
- Public tracking link as the main action before payment.

Reason:
- The delivery exists, but payment is still required.
- Receiver-facing communication should not confuse unpaid status.

Future option:
- If product later allows pre-payment receiver sharing, add a separate gated share component with explicit unpaid-state language.

## Analytics
Events:
- `delivery_summary_viewed`
- `delivery_summary_handoff_valid`
- `delivery_summary_handoff_missing`
- `delivery_summary_handoff_invalid`
- `delivery_summary_get_delivery_started`
- `delivery_summary_get_delivery_succeeded`
- `delivery_summary_get_delivery_failed`
- `delivery_summary_continue_payment_tapped`
- `delivery_summary_copy_tracking_code_tapped`
- `delivery_summary_view_delivery_tapped`
- `delivery_summary_go_home_tapped`
- `delivery_summary_offline_recovery_shown`

Required properties:
- `deliveryId`
- `trackingCodePresent`
- `quoteAmountGhs`
- `paymentStatus`
- `currentStatus`
- `source`
- `handoffAgeSeconds`
- `usedRecoveryFetch`
- `errorCode` when available.

Privacy:
- Do not log receiver name.
- Do not log receiver phone.
- Do not log receiver address.
- Do not log package description.

## Accessibility Requirements
Screen reader:
- Announce created status and payment required status on entry.
- Read tracking code as grouped characters if platform allows.
- Amount announced with currency.
- Copy success announced politely.
- Fetch errors announced assertively.

Focus order:
- Header.
- Tracking code.
- Locked amount.
- Payment status.
- Payment CTA.
- Delivery facts.
- Reference actions.

Focus management:
- On ready, focus title.
- On fetch error, focus error title.
- On copy, keep focus on copy button and announce success.
- On already paid or cancelled, focus status title.

Touch targets:
- Copy button must meet platform target size.
- Sticky CTA must be one-hand reachable.
- Secondary actions must not be too close to primary CTA.

Color:
- Payment pending must not rely on color alone.
- Created check and payment gate need text labels.
- Error states need text plus icon.

Text scaling:
- Tracking code may wrap.
- Amount must not truncate.
- CTA must stay readable.
- Fact rows must allow two-line values.

Reduced motion:
- No status meaning depends on animation.

## Performance Requirements
Initial render:
- Valid handoff path renders without network.
- Recovery fetch only runs when needed.
- No images required.

Network:
- `get_delivery` is the only allowed recovery network call.
- Payment APIs are not called.
- Delivery creation API is not called.

Persistence:
- Store enough handoff state for app resume.
- Do not persist receiver full details beyond existing app policy.
- Clear create-flow draft only after summary is recoverable through delivery ID.

Low bandwidth:
- Summary must render from handoff offline.
- Recovery fetch requires connection.
- Payment CTA can route only when enough backend data is present.

## Security And Trust Requirements
Do:
- Treat backend quote as authoritative.
- Keep unpaid status visible.
- Mask receiver phone in facts.
- Avoid logging personal data.
- Route payment through payment method screen.
- Protect against duplicate delivery creation.

Do not:
- Call `create_delivery`.
- Call `initialize_payment`.
- Expose full receiver phone in analytics.
- Show receiver verification data.
- Show receipt before payment confirmation.
- Promise dispatch before payment.
- Allow local draft edits after creation on this screen.

## Edge Cases
App reload after QuoteReview:
- Use persisted delivery ID.
- Fetch `get_delivery`.
- Render summary if accessible.

Handoff response exists but draft summary is gone:
- Render passport and payment panel from created response.
- Fetch delivery detail for full facts if online.
- Keep payment CTA disabled until backend detail confirms payable state if policy requires.

Created delivery already paid:
- Show already paid state.
- Route to delivery detail or home.

Created delivery cancelled:
- Show already cancelled state.
- Route home or delivery detail.

Payment started elsewhere:
- Show payment already started state.
- Route to processing or recovery.

Receiver phone too long for row:
- Mask and truncate safely.
- Keep full value out of clipboard.

Tracking code too long:
- Wrap code or use horizontal code container with accessible label.

Station labels unavailable:
- Show station IDs only with clear fallback: `Station {stationId}`.
- Fetch station labels when available.

Network fetch returns newer quote:
- Backend detail quote wins.
- Show refreshed locked quote.
- Do not compare to local draft as an error.

## QA Scenarios
Happy path from QuoteReview:
1. QuoteReview stores created response.
2. Navigate to summary.
3. Header says delivery created.
4. Payment required is visible.
5. Locked `GHS` amount is visible.
6. Tracking code is visible.
7. Continue routes to payment method.
8. No `create_delivery` call occurs.
9. No `initialize_payment` call occurs.

Recovery path:
1. Clear handoff but keep persisted `deliveryId`.
2. Open summary.
3. App calls `get_delivery`.
4. Delivery detail parses.
5. Summary renders from backend detail.

Missing handoff:
1. Open summary without handoff or persisted ID.
2. Show handoff missing state.
3. No backend create call occurs.

Invalid handoff:
1. Created response lacks quote amount.
2. Show invalid handoff state.
3. Payment CTA disabled.

Already paid:
1. `get_delivery` returns `paymentStatus=confirmed`.
2. Summary shows payment confirmed state.
3. Continue payment CTA is hidden.

Already cancelled:
1. `get_delivery` returns `currentStatus=cancelled`.
2. Summary shows cancelled state.
3. Payment CTA is hidden.

Copy tracking code:
1. Tap copy.
2. Clipboard receives `trackingCode`.
3. UI shows copied status.
4. Receiver data is not copied.

Offline valid handoff:
1. Open summary offline with valid handoff.
2. Summary renders.
3. Payment CTA may route only if payment route can handle connectivity check.

Offline recovery:
1. Open summary offline without valid handoff.
2. Show offline recovery.
3. No backend call occurs.

Large text:
1. Enable largest accessibility text.
2. Header and passport card do not clip.
3. Sticky CTA remains reachable.

Reduced motion:
1. Enable reduced motion.
2. No movement is required to understand status.

## Automated Test Expectations
Unit tests:
- Valid create response renders ready summary.
- Invalid create response renders handoff invalid.
- Missing handoff without persisted ID renders handoff missing.
- Missing handoff with persisted ID calls `get_delivery`.
- Pending payment renders continue-to-payment CTA.
- Confirmed payment hides payment CTA.
- Cancelled delivery hides payment CTA.
- Continue CTA routes without calling payment API.
- No code path calls `create_delivery`.

Component tests:
- Tracking code appears.
- Locked quote appears.
- Payment required panel appears.
- Copy button copies tracking code.
- Receiver phone is masked.
- Fetch error state has retry.
- Offline recovery disables payment route.

E2E tests:
- QuoteReview to DeliverySummary to PaymentMethod route works.
- App reload after created delivery recovers through `get_delivery`.
- Missing handoff does not create delivery.
- Payment confirmed state routes to delivery detail or home.
- Cancelled state routes home.

Coverage requirements:
- Cover handoff valid, handoff missing, fetch success, fetch failure, already paid, already cancelled, and payment CTA route.
- Include negative assertions for `create_delivery` and `initialize_payment`.

## Implementation Notes For Claude Code
Build order:
1. Create route shell for `/(sender)/create/summary`.
2. Add created delivery handoff reader.
3. Validate handoff with shared contract.
4. Add passport card and payment-required panel.
5. Add delivery facts display.
6. Add `get_delivery` recovery path.
7. Add payment CTA route.
8. Add copy tracking code action.
9. Add blocked states.
10. Add tests.

Do not build:
- Payment provider selector.
- Payment initialization.
- Provider processing.
- Payment result.
- Receipt.
- Tracking timeline.
- Delivery edit flow.
- Receiver public sharing flow.

Contract boundary:
- QuoteReview creates the delivery.
- DeliverySummary displays created delivery and routes to payment.
- PaymentMethod initializes payment.

Data boundary:
- Created response is valid for fast display.
- `get_delivery` is valid for recovery.
- Local draft is only display support after creation.
- Backend detail wins over local draft.

## Acceptance Checklist
- `screen-delivery-summary` route renders.
- First viewport shows delivery created.
- First viewport shows payment required.
- First viewport shows locked `GHS` amount.
- First viewport shows `trackingCode`.
- Continue CTA routes to payment method.
- Continue CTA does not call `initialize_payment`.
- Screen does not call `create_delivery`.
- Valid handoff renders without network.
- Missing handoff with persisted ID uses `get_delivery`.
- Missing handoff without ID shows recovery.
- Invalid handoff blocks payment route.
- Already paid state hides payment CTA.
- Cancelled state hides payment CTA.
- Tracking code copy excludes receiver data.
- Receiver phone is masked.
- Large text does not break layout.
- Reduced motion remains usable.
- Analytics omit receiver personal data.
- Tests cover success, recovery, blocked, and no-duplicate-create paths.

## Final Handoff Summary
Claude Code should build `DeliverySummary` as a created-but-unpaid delivery checkpoint. It must consume the QuoteReview-created backend response, show the locked quote and tracking code, make payment-before-dispatch unavoidable, and route to payment method selection without creating another delivery or initializing payment on this screen.
