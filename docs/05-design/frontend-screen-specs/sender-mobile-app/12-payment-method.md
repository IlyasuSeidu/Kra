# Payment Method Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PaymentMethod` |
| App | `apps/mobile` |
| Route | `/(sender)/payments/:deliveryId/method` |
| Primary test ID | `screen-payment-method` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `initialize_payment`, `paymentInitializeRequestSchema`, `paymentInitializeResponseSchema`, `get_delivery`, locked quote, payment-before-dispatch policy |
| Related routes | `/(sender)/create/summary`, `/(sender)/payments/:deliveryId/processing`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home` |
| Required states | `loading`, `ready`, `method_selected`, `payer_phone_entry`, `phone_invalid`, `initializing`, `provider_unavailable`, `provider_timeout`, `amount_mismatch`, `already_pending`, `already_confirmed`, `delivery_not_found`, `not_authorized`, `not_payable`, `offline`, `rate_limited`, `api_error` |

## Product Job
This screen lets the sender choose the supported v1 payment path and start the MTN MoMo authorization request for a locked delivery quote. It is the first screen in the sender flow that may call `initialize_payment`.

The sender should be able to:
- See the locked `GHS` amount from the backend quote.
- Understand that payment is required before dispatch.
- Choose the supported v1 provider: `MTN MoMo`.
- Confirm or enter the payer phone number.
- Start payment initialization once.
- Recover if a pending payment already exists.
- Understand provider outage, timeout, validation, and offline states.
- Continue to payment processing only after backend initialization succeeds.

This screen is not quote review, delivery creation, provider authorization result, payment verification, receipt display, refund flow, station intake, or support chat.

## Audience
Primary audience:
- Authenticated senders paying for a newly created delivery.
- Small-business senders who need predictable mobile-money payment flow.
- First-time senders who need clear instructions before an MTN MoMo prompt.
- Senders using mobile data who need reliable retry and recovery.

Secondary audience:
- QA engineers validating payment initialization boundaries.
- Claude Code implementing this route from the spec.
- Finance reviewers checking amount immutability and provider-state copy.
- Support teams explaining why payment did not start.

## User State
The sender has a created delivery with a locked backend quote. They are ready to pay, but may not understand the difference between choosing a payment method, receiving an MTN MoMo prompt, and payment being confirmed.

The sender may be:
- Ready to authorize MTN MoMo immediately.
- Using a different phone number for payment than the receiver phone.
- Unsure whether the current number can receive the MoMo prompt.
- On unstable network.
- Returning after an earlier pending payment attempt.
- Concerned that paying twice could happen.

The screen must:
- Show the locked amount before initializing payment.
- Never allow the amount to be edited.
- Use `provider=mtn_momo` in v1.
- Require payer phone in E.164 form before submit.
- Prevent duplicate payment initialization.
- Reuse existing pending payment response when backend returns it.
- Route to processing after successful initialization.
- Keep failed or unresolved provider states out of this screen when processing owns them.

## Primary Action
Primary CTA:
- `Send MTN MoMo prompt`

Secondary actions:
- `Change payment phone`
- `View delivery`
- `Back to summary`
- `Go home`

CTA behavior:
- `Send MTN MoMo prompt` validates payer phone, reads locked amount, and calls `POST /v1/payments/initialize`.
- Request uses `deliveryId`, `provider=mtn_momo`, `payerPhone`, and `amountGhs`.
- `amountGhs` must come from backend locked quote.
- Sender must not type, edit, or override amount.
- CTA disables immediately after first valid tap.
- Successful response routes to `/(sender)/payments/:deliveryId/processing`.
- Payment processing route receives or restores `paymentId`, `providerReference`, `checkoutMode`, and `paymentStatus`.

CTA disabled conditions:
- Delivery detail is loading.
- Delivery is not found.
- Sender is not authorized.
- Delivery is not payable.
- Locked quote is missing.
- Payment is already confirmed.
- Payer phone is empty or invalid.
- Device is offline.
- Payment initialization is already in flight.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- The locked amount.
- MTN MoMo as the active provider.
- The payer phone that will receive the authorization prompt.
- A clear action to send the prompt.

The screen creates value by:
- Making the payment amount trusted and immutable.
- Preventing accidental duplicate payment starts.
- Explaining what happens after the sender taps the CTA.
- Separating provider choice from provider result.
- Keeping unsupported providers out of the critical v1 path.

## Main Tension
The sender wants to pay quickly, but payment initialization is consequential and provider-dependent. The UX must be fast while still preventing wrong phone numbers, duplicate pending payments, amount mismatch, and false confidence before provider confirmation.

The screen must balance:
- Speed against phone-number correctness.
- Provider simplicity against future provider expansion.
- Strong CTA against no accidental duplicate charge.
- Backend amount authority against local display speed.
- Provider outage transparency against calm recovery.
- Payment urgency against accessibility and low-bandwidth resilience.

## Design Brief
User and job:
- An authenticated sender wants to start payment for a locked delivery quote.

Context of use:
- Mobile, financial, provider-dependent, post-delivery-creation.

Entry point:
- `/(sender)/create/summary` or sender delivery detail pending-payment action.

Success state:
- `initialize_payment` returns pending payment response and app routes to payment processing.

Primary action:
- `Send MTN MoMo prompt`

Navigation model:
- Payment flow step 1 of 3: method, processing, result.

Density:
- Focused provider selection with amount and payer phone above the fold.

Visual thesis:
- A secure payment launch pad: locked amount, one active provider, exact phone target, and a deliberate authorization prompt.

Restraint rule:
- Avoid provider grids, receipt language, payment success language, discounts, amount fields, route editing, and provider result states.

Product lens:
- Trust-critical payment initialization.

System stance:
- Native financial form with strong accessibility and provider failure recovery.

Interaction thesis:
- The user chooses MTN MoMo, confirms phone, taps once, then leaves this screen for processing.

Signature move:
- A MoMo prompt preview card that shows the phone target and what the sender should expect next without claiming payment has succeeded.

Activation event:
- Backend returns `paymentStatus=pending`.

## Elite Quality Gate
This spec is not closed unless the resulting screen starts payment safely without letting the sender alter the locked amount.

Non-negotiable quality requirements:
- The first viewport must show locked `GHS` amount.
- The first viewport must show MTN MoMo as the active v1 provider.
- The first viewport must show payer phone entry or confirmation.
- The primary CTA must call `initialize_payment`.
- The request must use `provider=mtn_momo`.
- The request must use backend locked `amountGhs`.
- The sender must not edit amount.
- The screen must not call `create_delivery`.
- The screen must not call `verify_payment`.
- The screen must not show payment success.
- The screen must not show receipt actions.
- The screen must not allow cash collection as a standard option.
- The screen must handle existing pending payment without creating a second payment intent.
- The screen must handle provider unavailable and timeout states.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the amount is editable, the screen remains open.
- If unsupported providers are active, the screen remains open.
- If duplicate taps can initialize two payments, the screen remains open.
- If payment result appears on this screen, the screen remains open.
- If payer phone is not validated before submit, the screen remains open.
- If provider failure copy gives no recovery path, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear payment confirmation, feedback, form controls, and secure transactional flows.
- Material Design 3 radio buttons, cards, buttons, text fields, and progress indicators support accessible payment-method selection.
- W3C WCAG 2.2 supports review and confirmation for financial submissions, error identification, focus order, and visible labels.
- Baymard mobile checkout research reinforces clear total price, payment method clarity, and avoiding unexpected costs before payment.
- Kra payment policy sets MTN MoMo as the v1 production payment path and blocks dispatch until payment confirmation.
- Kra API contracts require `deliveryId`, `provider=mtn_momo`, `payerPhone`, and `amountGhs` for payment initialization.
- Kra backend returns existing pending payment for the same delivery instead of creating a new one.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/apple-pay
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://m3.material.io/components/radio-button/overview
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/text-fields/overview
- https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html
- https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/payment-method
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- `MTN MoMo` is the only enabled provider.
- `Paystack` is not enabled in the pilot payment UI.
- `Hubtel` is not enabled in the pilot payment UI.
- Cash collection is not a standard digital payment option.
- Payment amount is locked by backend quote.
- Payer phone may differ from receiver phone.
- Payer phone must be submitted in E.164 format.
- Ghana numbers should be accepted after normalization to E.164 when valid.
- Payment initialization returns `checkoutMode=ussd_push`.
- Backend returns existing pending payment if one already exists for the delivery.
- Payment verification happens on `PaymentProcessing`, not here.
- Payment result appears on `PaymentResult`, not here.

## Backend Contract
Primary operation:
- `initialize_payment`

HTTP:
- `POST /v1/payments/initialize`

Auth:
- Authenticated sender who owns the delivery.

Capability:
- `create_delivery`

Idempotency:
- Backend route is idempotent.
- Client must use a stable idempotency key for one delivery and one payer phone submission.
- Do not rotate idempotency key while request is in flight.
- Do not create a second request after app resume until previous request state is resolved.

Request schema:
- `paymentInitializeRequestSchema`

Request fields:
- `deliveryId`
- `provider`
- `payerPhone`
- `amountGhs`

Required request values:
- `provider` must be `mtn_momo`.
- `payerPhone` must be E.164.
- `amountGhs` must equal backend locked quote.

Response schema:
- `paymentInitializeResponseSchema`

Response fields:
- `paymentId`
- `deliveryId`
- `provider`
- `paymentStatus`
- `providerReference`
- `checkoutMode`

Required response interpretation:
- `provider` must be `mtn_momo`.
- `paymentStatus` must be `pending`.
- `checkoutMode` must be `ussd_push`.
- `providerReference` must be stored for processing display and reconciliation references.

Allowed supporting operation:
- `get_delivery` for loading delivery amount and status when not supplied by route cache.

Must not call:
- `create_delivery`
- `verify_payment`
- refund endpoints
- tracking endpoints

## Data Read Model
Read from route:
- `deliveryId`

Read from route state or query cache:
- Locked quote amount.
- Tracking code.
- Payment status.
- Sender phone if available.
- Delivery summary freshness timestamp.

Read from backend when needed:
- `get_delivery` to fetch quote, status, payment status, and sender ownership confirmation.

Read from local account state:
- Sender phone, if available.
- Last successful payer phone, if allowed by privacy policy.

Write locally:
- Selected provider.
- Payer phone draft.
- Payment initialization in-flight fingerprint.
- Last initialized payment response.
- Provider unavailable timestamp.

Write remotely:
- Payment initialization through `initialize_payment`.

Do not write:
- Delivery details.
- Quote amount.
- Payment verification result.
- Receipt data.

## Route Entry Conditions
Normal entry:
- `deliveryId` route param exists.
- Locked quote amount is available from cache or `get_delivery`.
- Delivery belongs to signed-in sender.
- Payment status is `pending`.
- Delivery current status is payable.

Recovery entry:
- Route has only `deliveryId`.
- Fetch `get_delivery`.
- Render ready if delivery is payable and quote is valid.

Blocked entry:
- Missing `deliveryId`.
- Delivery not found.
- Sender not authorized.
- Delivery transport has already started.
- Delivery is cancelled.
- Payment is already confirmed.
- Locked amount cannot be retrieved.

Blocked UI:
- No payment CTA.
- Explain the state.
- Route to delivery detail or home.
- Do not initialize payment.

## Information Architecture
Top-level structure:
1. Payment header.
2. Locked amount strip.
3. Payment method card.
4. Payer phone section.
5. What happens next panel.
6. Security and no-cash note.
7. Sticky payment CTA.

Required first viewport:
- `Choose payment method`
- `GHS {amount}`
- `MTN MoMo`
- Payer phone value or input.
- `Send MTN MoMo prompt`

Why this order:
- Amount is the financial anchor.
- Provider choice defines what happens.
- Phone target prevents failed prompts.
- CTA starts backend initialization.

## Header
Purpose:
- Orient sender inside payment flow.

Content:
- Eyebrow: `Payment step 1 of 3`
- Title: `Choose payment method`
- Subtitle: `Send a mobile money prompt for this locked quote.`

Rules:
- Do not say payment is complete.
- Do not show payment result badges.
- Back routes to delivery summary or delivery detail.

Accessibility:
- Title must be the screen title.
- Step text must not be the only progress indicator.

## Locked Amount Strip
Purpose:
- Keep the backend amount visible and immutable.

Content:
- Label: `Locked quote`
- Amount: `GHS {amount}`
- Supporting: `This amount comes from the backend quote and cannot be edited.`

Visual:
- High-contrast compact strip under header.
- Amount uses strong numeric style.
- Lock icon allowed with text.

Rules:
- Do not use input styling.
- Do not show keyboard on amount tap.
- Do not expose amount override controls.
- Do not show provider fee line unless backend later returns explicit customer-facing fee policy.

Screen reader:
- Announce `Locked quote, GHS {amount}. Amount cannot be edited.`

## Payment Method Card
Purpose:
- Show MTN MoMo as the only enabled v1 option while keeping future providers out of the primary path.

Enabled option:
- Provider: `MTN MoMo`
- Label: `MTN MoMo`
- Supporting: `You will receive a prompt to authorize payment.`
- Badge: `Available now`
- Selected by default.

Deferred providers:
- Do not show Paystack or Hubtel as selectable in v1.
- If product wants future awareness, show under `Other methods coming later` below the primary flow, disabled and non-interactive.
- Disabled future methods must not appear above the CTA.

Cash:
- Do not show as a payment method.
- No staff, driver, or courier should collect cash for the standard v1 digital flow.

Interaction:
- MTN MoMo selected by default.
- If only one enabled provider exists, no radio group is necessary.
- If using a selection control for future compatibility, it must have one selected enabled option.

## Payer Phone Section
Purpose:
- Ensure the MoMo prompt goes to the correct phone.

Content:
- Label: `MTN MoMo phone`
- Field value: sender phone or last payer phone if available.
- Helper: `Use the phone that can approve the MoMo prompt.`
- Action when value exists: `Change`

Input behavior:
- Accept local Ghana format and normalize to E.164.
- Accept already formatted E.164.
- Submit normalized E.164 only.
- Validate before enabling CTA.
- Keep receiver phone separate from payer phone.

Validation copy:
- Empty: `Enter the phone that will approve the MoMo prompt.`
- Invalid: `Enter a valid mobile money phone number.`
- Non-E.164 after normalization: `Use a phone number with country code.`

Rules:
- Do not default to receiver phone.
- Do not expose receiver phone as a suggested payment phone.
- Do not submit raw unnormalized phone.
- Do not hide validation until after submit if the user leaves the field.

Accessibility:
- Phone field must have visible label.
- Error must be tied to input.
- Keyboard type should be phone.

## What Happens Next Panel
Purpose:
- Set expectations before the sender receives an external authorization prompt.

Content:
- Title: `What happens next`
- Row 1: `Kra sends an MTN MoMo authorization prompt.`
- Row 2: `Approve it on the payer phone.`
- Row 3: `Kra verifies payment before dispatch.`

Rules:
- Do not mention receipt here.
- Do not imply confirmation is instant.
- Do not say the package is dispatching now.
- Keep copy concise.

## Security And No-Cash Note
Purpose:
- Reduce fraud and operational confusion.

Content:
- Title: `Pay only through Kra`
- Body: `No driver, courier, or station staff should collect cash for this booking.`

Visual:
- Compact security note with shield icon.
- Use trust color, not danger-heavy styling.

Rules:
- Always visible in ready state.
- Do not make dismissible.
- Do not place below long secondary content.

## Sticky CTA Area
Default:
- Primary: `Send MTN MoMo prompt`
- Secondary: `View delivery`

In-flight:
- Primary: `Sending prompt...`
- Secondary disabled.

Provider unavailable:
- Primary: `Try again`
- Secondary: `View delivery`

Existing pending payment:
- Primary: `Continue payment`
- Secondary: `View delivery`

Offline:
- Primary disabled: `Connect to pay`
- Secondary: `View delivery`

Rules:
- CTA area sticks to bottom with safe-area padding.
- CTA disabled state must explain why.
- CTA must not move amount out of view on small phones.
- CTA must use a specific verb.

## Component Inventory
Required components:
- `PaymentFlowHeader`
- `LockedAmountStrip`
- `PaymentMethodCard`
- `MtnMomoProviderCard`
- `PayerPhoneInput`
- `PaymentNextStepsPanel`
- `NoCashSecurityNote`
- `PaymentMethodErrorCallout`
- `PaymentProviderUnavailablePanel`
- `StickyInitializePaymentBar`

Reusable component requirements:
- Components must support dynamic amount.
- Components must support long provider names.
- Components must handle masked phone display.
- Components must expose test IDs.
- Components must work in light and dark themes.
- Components must not hardcode non-v1 providers as active.

## Test IDs
Screen:
- `screen-payment-method`

Header:
- `payment-method-header`
- `payment-method-step-label`

Amount:
- `payment-method-locked-amount`
- `payment-method-locked-amount-value`

Provider:
- `payment-method-provider-list`
- `payment-method-provider-mtn-momo`
- `payment-method-provider-selected`

Phone:
- `payment-method-payer-phone-section`
- `payment-method-payer-phone-input`
- `payment-method-payer-phone-change`
- `payment-method-payer-phone-error`

Education:
- `payment-method-next-steps`
- `payment-method-no-cash-note`

Actions:
- `payment-method-send-prompt`
- `payment-method-view-delivery`
- `payment-method-go-home`

States:
- `payment-method-loading`
- `payment-method-ready`
- `payment-method-initializing`
- `payment-method-provider-unavailable`
- `payment-method-provider-timeout`
- `payment-method-amount-mismatch`
- `payment-method-already-pending`
- `payment-method-already-confirmed`
- `payment-method-not-payable`
- `payment-method-offline`
- `payment-method-api-error`

## State Model
States:
- `loading`
- `ready`
- `method_selected`
- `payer_phone_entry`
- `phone_invalid`
- `initializing`
- `provider_unavailable`
- `provider_timeout`
- `amount_mismatch`
- `already_pending`
- `already_confirmed`
- `delivery_not_found`
- `not_authorized`
- `not_payable`
- `offline`
- `rate_limited`
- `api_error`

Initial resolution:
- Read `deliveryId` from route.
- Read locked amount from route state or cache.
- If locked amount missing, call `get_delivery`.
- Confirm delivery is payable.
- Pre-fill payer phone only from sender-owned payment phone source.
- Render ready.

Submit resolution:
- Validate phone.
- Disable CTA.
- Persist payment request fingerprint.
- Call `initialize_payment`.
- Parse response.
- Store payment response.
- Route to `/(sender)/payments/:deliveryId/processing`.

Blocked resolution:
- Not found, unauthorized, cancelled, already confirmed, or transport-started states block payment initialization.

## Loading State
Use when:
- Route data is being validated.
- Locked amount is being restored.
- `get_delivery` is fetching required data.

Layout:
- Header skeleton.
- Amount skeleton.
- Provider card skeleton.
- Phone section skeleton.
- Sticky CTA disabled.

Copy:
- Title: `Preparing payment`
- Body: `Checking the locked quote before payment.`

Rules:
- Do not show CTA enabled.
- Do not initialize payment.
- Do not show stale amount until validated.

## Ready State
Use when:
- Delivery is payable.
- Locked amount is known.
- Payer phone is valid or ready for entry.
- MTN MoMo is available.

Required content:
- Locked amount.
- MTN MoMo provider card.
- Payer phone section.
- What happens next panel.
- No-cash note.
- CTA.

Rules:
- Provider selected by default.
- Amount not editable.
- CTA enabled only with valid phone.
- Analytics fire `payment_method_viewed`.

## Payer Phone Entry State
Use when:
- Sender taps `Change`.
- No valid payer phone is available.
- Phone field has focus.

Layout:
- Phone field expands in place.
- CTA reflects validation.
- Helper remains visible.

Rules:
- Keep amount and provider visible above or near input.
- Normalize to E.164 on blur and submit.
- Preserve user input if network call fails.
- Do not use receiver phone suggestions.

## Phone Invalid State
Use when:
- Phone is empty after touch.
- Phone cannot normalize to E.164.
- Phone fails shared `phoneSchema`.

Copy:
- Title: `Check payment phone`
- Body: `The MoMo prompt can only be sent to a valid phone number.`

Rules:
- Error appears next to field.
- CTA disabled.
- No network call.

## Initializing State
Use when:
- Sender taps CTA and request is in flight.

Layout:
- Keep amount, provider, and phone visible.
- Button label changes to `Sending prompt...`.
- Disable phone edit.
- Disable provider selection.

Copy:
- Status: `Sending MTN MoMo prompt to {maskedPayerPhone}.`

Rules:
- Prevent second submit.
- Persist in-flight fingerprint.
- If app backgrounds, restore in-flight state.
- Do not route until valid response.

Accessibility:
- Announce `Sending MTN MoMo prompt.`

## Existing Pending Payment State
Use when:
- Backend returns an existing pending payment for this delivery.
- Local state already has pending payment response.

Layout:
- Show payment already started callout.
- CTA: `Continue payment`.

Copy:
- Title: `Payment prompt already sent`
- Body: `Continue to processing to check the MoMo authorization.`

Rules:
- Do not call `initialize_payment` again.
- Route to processing with existing payment response.
- Do not change payer phone for the existing pending payment.

## Provider Unavailable State
Use when:
- API returns `PAYMENT_PROVIDER_UNAVAILABLE`.
- Payment provider dependency is down.

Layout:
- Keep amount and phone visible.
- Show provider outage callout.
- Primary retry.
- Secondary delivery detail.

Copy:
- Title: `MTN MoMo is temporarily unavailable`
- Body: `Your delivery is still created and unpaid. Try again soon or check the delivery later.`
- Primary: `Try again`
- Secondary: `View delivery`

Rules:
- Do not mark payment failed.
- Do not route to processing without payment response.
- Do not offer cash workaround.

## Provider Timeout State
Use when:
- API returns `PROVIDER_TIMEOUT`.
- Network request reaches backend but provider response times out.

Copy:
- Title: `MoMo took too long to respond`
- Body: `Do not start another payment yet. Check payment status or try again with the same request.`
- Primary: `Check status`
- Secondary: `View delivery`

Rules:
- Prefer recovery route if backend may have created pending payment.
- Do not create a new request key blindly.
- Do not show failure result here.

## Amount Mismatch State
Use when:
- Backend rejects `amountGhs` because it does not match locked quote.

Copy:
- Title: `Amount needs refresh`
- Body: `The payment amount no longer matches the locked quote. Refresh the delivery before paying.`
- Primary: `Refresh delivery`
- Secondary: `View delivery`

Rules:
- Do not retry with local amount.
- Fetch `get_delivery`.
- Replace amount only from backend response.
- Capture telemetry.

## Already Confirmed State
Use when:
- Backend or delivery fetch says payment is already confirmed.

Copy:
- Title: `Payment already confirmed`
- Body: `This delivery no longer needs payment.`
- Primary: `View delivery`
- Secondary: `Go home`

Rules:
- Do not initialize payment.
- Do not show provider card as actionable.
- Do not show receipt action on this screen.

## Not Payable State
Use when:
- Delivery is cancelled.
- Delivery transport has already started.
- Delivery status is not eligible for new payment initialization.

Copy:
- Title: `Payment is not available`
- Body: `This delivery cannot start a new payment from this step.`
- Primary: `View delivery`
- Secondary: `Go home`

Rules:
- Do not initialize payment.
- Show status reason when safe.

## Offline State
Use when:
- Device is offline before payment initialization.

Copy:
- Title: `Connect to pay`
- Body: `You can review the amount, but sending a MoMo prompt needs a connection.`

Rules:
- CTA disabled.
- Do not queue payment initialization offline.
- Re-enable only after connection returns and phone remains valid.

## Rate Limited State
Use when:
- API returns `RATE_LIMITED`.

Copy:
- Title: `Too many payment attempts`
- Body: `Wait a moment before trying again. Your delivery is still unpaid.`

Rules:
- Respect retry-after if provided.
- Do not rotate request key during lockout.

## API Error State
Use when:
- Unknown backend or schema error occurs.

Copy:
- Title: `Payment could not start`
- Body: `We could not send the MoMo prompt. Try again or view the delivery.`
- Primary: `Try again`
- Secondary: `View delivery`

Rules:
- Do not show internal stack details.
- Do not clear locked amount.
- Keep payer phone for retry.

## Visual System Direction
Visual thesis:
- Serious mobile payment surface: exact, restrained, and confidence-building.

Color:
- Amount uses primary text.
- Active MTN MoMo card uses trust green or brand-safe neutral accent.
- Provider unavailable uses amber or red depending severity.
- No-cash note uses secure green.

Typography:
- Amount uses large numeric style.
- Provider label uses strong body title.
- Helper text is compact and readable.
- Errors use plain language.

Shape:
- Payment method card should feel tappable but not flashy.
- Phone field should use native form affordance.
- Sticky CTA should be visually dominant.

Spacing:
- Amount, provider, and phone must be visible without dense stacking.
- Keep enough spacing around the CTA to avoid accidental taps.

Iconography:
- Use phone, shield, lock, provider, and prompt icons only when clarifying.
- Icons must not replace labels.

## Layout Specifications
Base mobile layout:
- Header at top.
- Locked amount strip directly below.
- MTN MoMo card below amount.
- Phone section below provider.
- Next steps panel below phone.
- No-cash note below next steps.
- Sticky CTA at bottom.

Small phone:
- Amount strip remains compact.
- Provider card is single column.
- Phone field takes full width.
- CTA remains visible.

Large phone:
- Provider card may show icon, label, and status in one row.
- Next steps can use three compact rows.

Tablet:
- Center content column.
- Keep payment controls within comfortable width.
- Do not stretch phone input edge to edge.

Landscape:
- Reduce vertical padding.
- Keep CTA visible.
- Keep amount and phone in view.

## Motion Specifications
Allowed motion:
- Provider card selection settles with short color or border transition.
- Phone field expands with opacity and height transition.
- In-flight spinner inside CTA.
- Error callout appears with quick opacity transition.

Disallowed motion:
- No animated money counters.
- No provider logo bounce.
- No looping urgency animation.
- No success animation on this screen.

Timing:
- State transition: 120ms to 180ms.
- Error callout: 120ms.
- Button loading: immediate.

Reduced motion:
- Use static transitions and no movement.

## Interaction Details
Screen open:
1. Read `deliveryId`.
2. Restore locked amount from cache or fetch delivery.
3. Restore payer phone source.
4. Render ready or blocked state.

Change phone:
1. Tap `Change`.
2. Focus payer phone input.
3. Validate on blur and submit.
4. Normalize to E.164.

Initialize payment:
1. Tap `Send MTN MoMo prompt`.
2. Validate phone.
3. Read backend locked amount.
4. Persist request fingerprint.
5. Call `initialize_payment`.
6. Parse `paymentInitializeResponseSchema`.
7. Store response.
8. Route to payment processing.

Existing pending payment:
1. Backend returns pending payment response.
2. Store response.
3. Route to processing.
4. Do not let payer phone change this pending payment.

Back:
- Before initialization, back routes to delivery summary or delivery detail.
- During initialization, back is guarded.
- After pending payment exists, back routes to processing or delivery detail with pending status.

## Copy Deck
Header:
- Eyebrow: `Payment step 1 of 3`
- Title: `Choose payment method`
- Subtitle: `Send a mobile money prompt for this locked quote.`

Amount:
- Label: `Locked quote`
- Support: `This amount comes from the backend quote and cannot be edited.`

Provider:
- Label: `MTN MoMo`
- Support: `You will receive a prompt to authorize payment.`
- Badge: `Available now`

Phone:
- Label: `MTN MoMo phone`
- Helper: `Use the phone that can approve the MoMo prompt.`
- Change: `Change`

Next steps:
- Title: `What happens next`
- Row 1: `Kra sends an MTN MoMo authorization prompt.`
- Row 2: `Approve it on the payer phone.`
- Row 3: `Kra verifies payment before dispatch.`

Security:
- Title: `Pay only through Kra`
- Body: `No driver, courier, or station staff should collect cash for this booking.`

CTA:
- Ready: `Send MTN MoMo prompt`
- Loading: `Sending prompt...`
- Existing pending: `Continue payment`
- Offline: `Connect to pay`

Errors:
- Phone empty: `Enter the phone that will approve the MoMo prompt.`
- Phone invalid: `Enter a valid mobile money phone number.`
- Provider unavailable title: `MTN MoMo is temporarily unavailable`
- Provider unavailable body: `Your delivery is still created and unpaid. Try again soon or check the delivery later.`
- Timeout title: `MoMo took too long to respond`
- Timeout body: `Do not start another payment yet. Check payment status or try again with the same request.`
- Amount mismatch title: `Amount needs refresh`
- Amount mismatch body: `The payment amount no longer matches the locked quote. Refresh the delivery before paying.`

## Copy Rules
Tone:
- Direct.
- Financially precise.
- Calm.
- Low hype.

Required terms:
- Use `locked quote`.
- Use `MTN MoMo prompt`.
- Use `authorize`.
- Use `payment confirmed` only for already-confirmed state.
- Use `dispatch` for the operational gate.

Avoid:
- `Pay now` if prompt still needs external authorization.
- `Payment complete`.
- `Receipt`.
- `Cash option`.
- `Instant`.
- `Guaranteed`.
- `Try another provider` in v1.

Localization:
- Keep phone validation strings concise.
- Avoid idioms.
- Keep provider names centralized.
- Use currency formatter for `GHS`.

## Request Construction
Build request:
- `deliveryId`: route param.
- `provider`: `mtn_momo`.
- `payerPhone`: normalized E.164 phone.
- `amountGhs`: backend locked quote amount.

Do not send:
- Receiver phone unless explicitly selected as payer phone by future policy.
- Receiver name.
- Package description.
- Tracking code.
- Provider label text.
- Local amount override.

Validation before submit:
- `deliveryId` matches delivery ID schema.
- Provider is exactly `mtn_momo`.
- Payer phone passes shared phone schema.
- Amount is positive integer.
- Amount source is backend quote.
- Delivery is payable.

## Response Handling
Valid response:
- Parse with `paymentInitializeResponseSchema`.
- Store `paymentId`.
- Store `providerReference`.
- Store `checkoutMode`.
- Store `paymentStatus=pending`.
- Route to processing.

Existing pending response:
- Treat as successful recovery.
- Route to processing.
- Do not show error.

Invalid response:
- Treat as contract error.
- Do not route.
- Show API error.
- Capture telemetry.

Provider unavailable:
- Stay on method screen.
- Allow retry.
- Do not mark payment failed.

Provider timeout:
- Prefer status recovery.
- Do not blindly create a new request.

Amount mismatch:
- Fetch delivery detail.
- Use backend amount after refresh.
- Require user to submit again.

## Analytics
Events:
- `payment_method_viewed`
- `payment_provider_selected`
- `payment_phone_changed`
- `payment_phone_validation_failed`
- `payment_initialize_tapped`
- `payment_initialize_started`
- `payment_initialize_succeeded`
- `payment_initialize_existing_pending`
- `payment_initialize_failed`
- `payment_provider_unavailable_shown`
- `payment_provider_timeout_shown`
- `payment_amount_mismatch_shown`
- `payment_method_offline_blocked`
- `payment_method_view_delivery_tapped`

Required properties:
- `deliveryId`
- `provider`
- `amountGhs`
- `hasPayerPhone`
- `payerPhoneCountryCode`
- `paymentStatus`
- `checkoutMode`
- `usedDeliveryFetch`
- `errorCode` when available.

Privacy:
- Do not log full payer phone.
- Do not log receiver phone.
- Do not log receiver name.
- Do not log package description.
- Do not log provider authorization details beyond provider reference where policy permits.

## Accessibility Requirements
Screen reader:
- Announce screen title.
- Announce locked amount and immutability.
- Announce selected provider.
- Announce phone field label and validation errors.
- Announce in-flight state.
- Announce provider errors assertively.

Focus order:
- Header.
- Locked amount.
- Provider card.
- Payer phone.
- Next steps.
- Security note.
- CTA.

Focus management:
- On phone invalid, move focus to phone error.
- On provider unavailable, move focus to error title.
- On timeout, move focus to timeout title.
- On successful initialization, route to processing and let processing screen own focus.

Touch targets:
- Provider card target meets platform size guidance.
- Phone change action meets target size.
- CTA meets target size and safe-area rules.

Color:
- Provider selected state must not rely on color alone.
- Error states need text and icon.
- Disabled CTA must include reason text nearby.

Text scaling:
- Amount must not truncate.
- Phone field must remain usable.
- Provider copy can wrap.
- CTA remains readable.

Reduced motion:
- No essential status depends on animation.

## Performance Requirements
Initial render:
- Use cached locked amount when fresh.
- Fetch delivery only if amount or status is missing.
- Avoid provider asset downloads before render.

Network:
- One initialize request per user submit.
- Retry uses stable request key.
- Do not poll verification here.

Low bandwidth:
- Render amount and phone from local state when valid.
- Show offline state before request.
- Do not load heavy provider visuals.

Persistence:
- Persist in-flight payment fingerprint.
- Persist payment response after success.
- Restore existing pending state on app resume.

## Security And Trust Requirements
Do:
- Use backend locked amount.
- Validate payer phone.
- Keep amount immutable.
- Use idempotency.
- Store provider reference securely.
- Keep no-cash note visible.
- Route to processing after pending response.

Do not:
- Let sender edit amount.
- Call `create_delivery`.
- Call `verify_payment`.
- Offer unsupported providers.
- Offer cash collection.
- Initialize payment offline.
- Log full phone.
- Show receipt or success state.
- Treat provider timeout as confirmed failure.

## Edge Cases
Delivery not found:
- Show not found state.
- Route home or delivery detail if available.
- Do not initialize payment.

Sender not authorized:
- Show not authorized state.
- Hide amount if backend did not authorize access.
- Route home.

Payment already confirmed:
- Show already confirmed state.
- Route delivery detail.
- Do not initialize payment.

Delivery cancelled:
- Show not payable.
- Route delivery detail.
- Do not initialize payment.

Transport started:
- Show not payable.
- Explain payment cannot start from this step.
- Route delivery detail.

Pending payment exists:
- Backend returns existing pending response.
- Route processing.
- Do not initialize another payment.

Phone changed during in-flight request:
- Block changes while in flight.
- If request fails, allow edit again.

App killed after submit:
- Restore in-flight fingerprint.
- Check stored payment response first.
- If none, retry safely with same key or route to recovery.

Provider timeout after backend created payment:
- Processing or recovery must verify status.
- Do not start a new payment with new key.

Amount changed after refresh:
- Backend quote wins.
- Show amount mismatch or refreshed amount.
- Require new user submit.

## QA Scenarios
Happy path:
1. Open route with payable delivery and locked amount.
2. See `GHS` amount.
3. See MTN MoMo selected.
4. Enter valid payer phone.
5. Tap `Send MTN MoMo prompt`.
6. `initialize_payment` called once with `provider=mtn_momo`.
7. Response parses as pending.
8. App routes to payment processing.

Existing pending:
1. Backend already has pending payment.
2. Tap CTA.
3. Backend returns existing pending response.
4. App routes to processing.
5. No error appears.

Invalid phone:
1. Enter invalid phone.
2. CTA disabled or validation blocks submit.
3. No network call occurs.
4. Error points to phone field.

Amount mismatch:
1. Client sends stale amount.
2. Backend rejects mismatch.
3. Screen shows amount refresh state.
4. No processing route occurs.

Provider unavailable:
1. Backend returns `PAYMENT_PROVIDER_UNAVAILABLE`.
2. Screen shows provider unavailable state.
3. Delivery remains unpaid.
4. Retry is available.

Provider timeout:
1. Backend returns timeout.
2. Screen warns not to start another payment blindly.
3. User can check status or view delivery.

Offline:
1. Device offline.
2. CTA disabled.
3. No initialize request is queued.

Already confirmed:
1. Delivery fetch returns confirmed payment.
2. Screen hides CTA.
3. User can view delivery.

Duplicate tap:
1. User taps CTA repeatedly.
2. Only one initialize request is sent.
3. Button remains disabled while in flight.

Large text:
1. Enable largest accessibility text.
2. Amount, provider, phone, and CTA remain readable.

Reduced motion:
1. Enable reduced motion.
2. No animation is required to understand state.

## Automated Test Expectations
Unit tests:
- Valid phone normalizes to E.164.
- Invalid phone blocks submit.
- Request uses `provider=mtn_momo`.
- Request uses backend locked amount.
- Amount cannot be edited.
- Existing pending response routes to processing.
- Provider unavailable renders retry state.
- Timeout renders recovery state.
- Amount mismatch triggers refresh state.
- Duplicate submit sends one request.

Component tests:
- Locked amount renders.
- MTN MoMo selected.
- Phone field error is accessible.
- CTA disabled when phone invalid.
- CTA disabled when offline.
- No unsupported provider is active.
- No cash option appears.

E2E tests:
- Delivery summary to payment method to processing works.
- Invalid phone prevents network call.
- Existing pending payment routes to processing.
- Provider unavailable stays on method screen.
- Already confirmed delivery hides payment CTA.

Coverage requirements:
- Cover ready, invalid phone, initializing, provider unavailable, timeout, existing pending, amount mismatch, not payable, offline, and duplicate submit paths.
- Include negative assertions for `create_delivery` and `verify_payment`.

## Implementation Notes For Claude Code
Build order:
1. Create route shell for `/(sender)/payments/:deliveryId/method`.
2. Add delivery and locked amount loader.
3. Add MTN MoMo provider card.
4. Add payer phone input and normalization.
5. Add payment next-steps panel.
6. Add no-cash note.
7. Add initialize payment mutation.
8. Add idempotent submit guard.
9. Add provider error states.
10. Add tests.

Do not build:
- Delivery creation.
- Payment verification.
- Provider result screen.
- Receipt screen.
- Refund screen.
- Multi-provider active selection.
- Cash collection flow.

Contract boundary:
- DeliverySummary routes here.
- PaymentMethod initializes payment.
- PaymentProcessing verifies or waits for provider result.
- PaymentResult shows final outcome.

Data boundary:
- Backend quote amount is authoritative.
- Payer phone is payment-only input.
- Provider response is stored for processing.
- Verification result does not belong here.

## Acceptance Checklist
- `screen-payment-method` route renders.
- Locked `GHS` amount is visible.
- MTN MoMo is selected and enabled.
- Unsupported providers are not active.
- Cash option is absent.
- Payer phone validates before submit.
- Submit calls `initialize_payment`.
- Request uses `provider=mtn_momo`.
- Request uses backend locked amount.
- Amount cannot be edited.
- Duplicate taps send one request.
- Existing pending response routes to processing.
- Provider unavailable state is recoverable.
- Timeout state avoids blind duplicate payment.
- Amount mismatch refreshes from backend.
- Screen does not call `create_delivery`.
- Screen does not call `verify_payment`.
- Screen does not show receipt or success state.
- Large text does not break layout.
- Reduced motion remains usable.
- Analytics omit full phone and receiver personal data.

## Final Handoff Summary
Claude Code should build `PaymentMethod` as the v1 MTN MoMo payment-launch screen. It must show the backend locked amount, validate the payer phone, call `initialize_payment` exactly once per submit, route pending responses to processing, and never allow amount editing, duplicate payment starts, cash collection, or payment result handling on this screen.
