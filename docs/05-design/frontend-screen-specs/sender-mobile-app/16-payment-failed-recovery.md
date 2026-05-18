# Payment Failed Recovery Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PaymentFailedRecovery` |
| App | `apps/mobile` |
| Route | `/(sender)/payments/:deliveryId/recover` |
| Primary test ID | `screen-payment-failed-recovery` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `verify_payment`, `initialize_payment`, `paymentVerifyRequestSchema`, `paymentVerifyResponseSchema`, `paymentInitializeRequestSchema`, `paymentInitializeResponseSchema`, locked quote, payment-before-dispatch policy |
| Related routes | `/(sender)/payments/:deliveryId/result`, `/(sender)/payments/:deliveryId/method`, `/(sender)/payments/:deliveryId/processing`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home`, `/(sender)/support` |
| Required states | `loading`, `checking_latest_status`, `failed`, `retry_ready`, `phone_entry`, `phone_invalid`, `retrying`, `retry_started`, `still_pending`, `already_confirmed`, `under_review`, `provider_unavailable`, `provider_timeout`, `amount_mismatch`, `delivery_not_found`, `not_authorized`, `not_payable`, `offline`, `rate_limited`, `api_error`, `duplicate_retry_guard` |

## Product Job
This screen helps the sender recover from a failed payment without creating a duplicate charge, changing the locked delivery amount, or moving the delivery before payment is confirmed. It verifies the latest backend status, explains why dispatch is blocked, lets the sender choose a safe retry path, and sends them back to processing only after a new payment prompt is initialized.

The sender should be able to:
- Understand that the previous payment was not confirmed.
- See the locked amount and delivery being recovered.
- Know that dispatch remains blocked until payment is confirmed.
- Check whether the provider status changed before retrying.
- Retry MTN MoMo only when backend says retry is safe.
- Change the payer phone before retry.
- Avoid repeated taps that create competing payment attempts.
- Continue to payment processing after retry starts.
- View delivery or contact support when recovery is blocked.

This screen is not the first payment method screen, payment result screen, receipt screen, provider return screen, refund screen, cancellation screen, delivery edit screen, support conversation, or finance reconciliation admin.

## Audience
Primary audience:
- Authenticated senders whose payment is failed.
- Senders who need to retry MTN MoMo after authorization failure, insufficient funds, provider error, timeout, or cancelled prompt.
- Senders who need to use a different payer phone.
- Senders with poor network who need safe retry guidance.

Secondary audience:
- Claude Code implementing the recovery route.
- QA engineers validating duplicate-charge and status-check behavior.
- Support teams explaining why a delivery cannot dispatch yet.
- Finance reviewers checking failed-payment recovery and reconciliation boundaries.

## User State
The sender has seen a failed payment result or is routed here from processing/provider-return after Kra backend reports failure. They may feel charged, confused, or impatient. They need confidence that retry is safe and that Kra will not charge the old attempt again.

The sender may be:
- Returning immediately after a failed payment.
- Recovering from a stale failed state.
- Unsure whether their provider account was debited.
- Trying a different phone number.
- Facing provider unavailability.
- Offline after a failed attempt.
- Blocked because the previous status is now pending or under review.
- Already confirmed after a delayed provider callback.

The screen must:
- Verify latest payment status before presenting retry as safe.
- Never allow retry while payment is pending or under review.
- Never allow retry after payment is confirmed.
- Never change the locked amount.
- Never create a delivery.
- Start a new payment prompt only through `initialize_payment`.
- Route retry success to PaymentProcessing.
- Show support-safe recovery when retry is blocked.

## Primary Action
Primary action changes by state:
- Checking latest status: `Checking latest payment status`
- Failed/retry ready: `Try MTN MoMo again`
- Phone entry: `Send prompt to this phone`
- Retrying: `Sending MTN MoMo prompt`
- Retry started: `Continue to payment check`
- Still pending: `Continue checking`
- Already confirmed: `View result`
- Under review: `View review status`
- Provider unavailable: `Try again later`
- Offline: `Try again when online`
- Rate limited: `Wait and retry`
- Error: `Check status again`

Secondary actions:
- `Change payment phone`
- `Check status`
- `View delivery`
- `Go home`
- `Contact support`

CTA behavior:
- `Check status` calls `verify_payment`.
- `Try MTN MoMo again` calls `initialize_payment` only after latest status is failed or no active payment exists and delivery remains payable.
- `Send prompt to this phone` validates payer phone, then calls `initialize_payment`.
- `Continue to payment check` routes to `/(sender)/payments/:deliveryId/processing`.
- `Continue checking` routes to `/(sender)/payments/:deliveryId/processing`.
- `View result` routes to `/(sender)/payments/:deliveryId/result`.
- `View review status` routes to `/(sender)/payments/:deliveryId/result` with review context.
- `View delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Contact support` opens authenticated support with delivery and payment recovery context.

CTA disabled conditions:
- Latest status check is in flight.
- Retry initialization is in flight.
- Device is offline and action requires backend.
- Delivery is not payable.
- Payment is pending, confirmed, or under review.
- Locked amount is missing.
- Payer phone is empty or invalid.
- Retry cooldown is active.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- The previous payment is not confirmed.
- Dispatch is blocked until payment is confirmed.
- The locked `GHS` amount.
- The active provider: `MTN MoMo`.
- Whether retry is safe now.
- The next action to recover.

The screen creates value by:
- Reducing panic after payment failure.
- Separating failed, pending, confirmed, and review states.
- Preventing duplicate charges.
- Making payer-phone change clear.
- Moving the sender back to processing only after a real retry starts.

## Main Tension
A failed payment needs fast recovery, but fast recovery can be dangerous if the provider later confirms the previous attempt or if the user starts multiple attempts. The screen must make recovery feel easy while enforcing backend status truth.

The screen must balance:
- Speed against duplicate-charge prevention.
- Clear retry against pending-status uncertainty.
- Direct copy against financial sensitivity.
- One-provider simplicity against future provider expansion.
- Error detail against user comprehension.
- Support escalation against self-serve completion.

## Design Brief
User and job:
- An authenticated sender needs to safely recover payment for an existing delivery.

Context of use:
- Post-failure, financial, emotionally tense, mobile network prone.

Entry point:
- PaymentResult failed state.
- PaymentProcessing failed state.
- PaymentProviderReturn failed state.
- Sender delivery detail payment-blocked action.

Success state:
- `initialize_payment` returns pending payment response and routes to PaymentProcessing.

Primary action:
- Retry MTN MoMo after latest status is proven recoverable.

Navigation model:
- Recovery branch of payment flow: result or processing -> recovery -> processing -> result.

Density:
- Status-first recovery screen with one main action and one phone-control path.

Visual thesis:
- A financial recovery desk: serious failed-payment proof, calm explanation, and a guarded retry launch.

Restraint rule:
- Avoid celebratory visuals, receipts, refund forms, provider lists, delivery editing, route changes, and raw provider diagnostics.

Product lens:
- Trust-critical payment recovery.

System stance:
- Native financial recovery form with status guardrails.

Interaction thesis:
- The sender can retry only after Kra confirms retry is safe.

Signature move:
- A guarded retry panel that visibly checks latest status before unlocking the payment prompt.

Activation event:
- New `initialize_payment` response with `paymentStatus=pending`.

## Elite Quality Gate
This spec is not closed unless failed-payment recovery cannot create duplicate payment attempts.

Non-negotiable quality requirements:
- First viewport must show failed-payment context.
- First viewport must show locked `GHS` amount.
- First viewport must explain dispatch is blocked until payment is confirmed.
- The screen must call `verify_payment` before enabling retry when status may be stale.
- The screen may call `initialize_payment` only when latest status is failed or no active pending payment exists.
- The screen must not call `create_delivery`.
- The screen must not show receipt actions.
- The screen must not allow retry when payment is pending.
- The screen must not allow retry when payment is confirmed.
- The screen must not allow retry when payment is under review.
- The screen must not let sender edit amount.
- The screen must use stable idempotency for one retry attempt.
- The screen must route retry success to PaymentProcessing.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the screen can start retry without latest status proof, the screen remains open.
- If duplicate taps can initialize two payment prompts, the screen remains open.
- If confirmed payment still shows retry, the screen remains open.
- If pending or review state still shows retry, the screen remains open.
- If amount can be edited, the screen remains open.
- If failure copy implies dispatch can continue unpaid, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Baymard checkout research reinforces clear payment failure explanation, visible recovery actions, and preserving payment context after errors.
- W3C WCAG guidance requires errors to be identified and supported with suggestions when possible.
- W3C financial-data error prevention guidance supports careful review and confirmation for consequential financial actions.
- Material Design 3 guidance for buttons, snackbars, progress indicators, and text fields supports retry, cooldown, and form recovery patterns.
- Apple Human Interface Guidelines support clear feedback, direct recovery actions, and avoiding misleading transactional status.
- Kra payment policy blocks dispatch after failed payment and requires under-review UI for unresolved provider status.
- Kra backend contracts define payment initialization, verification, and payment status boundaries.

Reference links:
- https://baymard.com/checkout-usability
- https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/payment-method
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/snackbar/overview
- https://m3.material.io/components/progress-indicators/overview
- https://m3.material.io/components/text-fields/overview
- https://developer.apple.com/design/human-interface-guidelines/feedback
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- `MTN MoMo` is the only enabled provider.
- Payment retry means starting a new MTN MoMo prompt through `initialize_payment`.
- Payer phone can be changed before retry.
- Payment amount stays locked to backend quote.
- The delivery already exists.
- The screen can read delivery detail or cached locked amount.
- `verify_payment` returns latest payment truth.
- A failed status can become confirmed later if provider callback arrives late, so latest check is required.
- A pending status can become review after reconciliation threshold.
- Backend returns an existing pending payment instead of starting a duplicate prompt when one is active.
- Retry success returns `paymentStatus=pending`.
- PaymentProcessing owns waiting after retry starts.

Non-assumptions:
- Do not assume the failure reason is always known.
- Do not assume failed provider status is final if status is stale.
- Do not assume payer phone should equal receiver phone.
- Do not assume the user wants refund flow from this screen.
- Do not assume future providers are enabled.

## Backend Contract
Primary operations:
- `verify_payment`
- `initialize_payment`

Verification request:
- `paymentVerifyRequestSchema`

Verification request fields:
- `deliveryId`

Verification response:
- `paymentVerifyResponseSchema`

Verification response fields:
- `paymentId`
- `deliveryId`
- `provider`
- `paymentStatus`
- `providerReference`
- `verificationCheckedAt`

Initialization request:
- `paymentInitializeRequestSchema`

Initialization request fields:
- `deliveryId`
- `provider`
- `payerPhone`
- `amountGhs`

Initialization required values:
- `provider=mtn_momo`
- `amountGhs` from backend locked quote.
- `payerPhone` normalized to E.164.
- `deliveryId` from route.

Initialization response:
- `paymentInitializeResponseSchema`

Initialization response fields:
- `paymentId`
- `deliveryId`
- `provider`
- `paymentStatus=pending`
- `providerReference`
- `checkoutMode`

Forbidden operations:
- `create_delivery`
- `refund_payment`
- `dispatch_delivery`
- `complete_delivery`
- Provider-direct charge from the client.

Backend truth rule:
- Retry is allowed only after backend status check says latest payment is failed or there is no active pending payment for the delivery.

## Recovery Eligibility Rules
Retry is allowed when:
- Sender owns the delivery.
- Delivery is payable.
- Locked quote exists.
- Latest payment status is `failed`.
- No active pending payment exists.
- Payment is not under review.
- Payment is not confirmed.
- Payer phone is valid.
- Device is online.
- Retry cooldown is not active.

Retry is blocked when:
- Latest payment status is `pending`.
- Latest payment status is `confirmed`.
- Payment is under review.
- Delivery is cancelled.
- Delivery has moved into transport without confirmed payment due to legacy exception.
- Quote amount is missing.
- Quote amount differs from attempted amount.
- Payer phone is invalid.
- Provider is unavailable.
- Rate limit is active.
- Auth session is invalid.

Retry guardrails:
- Always disable retry button after first tap.
- Use stable idempotency key per delivery, payer phone, amount, and retry attempt.
- Do not rotate idempotency key while request is in flight.
- Recheck latest status after app resume if retry was not started.
- Route to PaymentProcessing after initialization, not to result.

## State Model
State names:
- `loading`
- `checking_latest_status`
- `failed`
- `retry_ready`
- `phone_entry`
- `phone_invalid`
- `retrying`
- `retry_started`
- `still_pending`
- `already_confirmed`
- `under_review`
- `provider_unavailable`
- `provider_timeout`
- `amount_mismatch`
- `delivery_not_found`
- `not_authorized`
- `not_payable`
- `offline`
- `rate_limited`
- `api_error`
- `duplicate_retry_guard`

Initial state:
- `loading`

State derivation:
- Route missing valid delivery ID maps to `delivery_not_found` or route-level error.
- Auth forbidden maps to `not_authorized`.
- Delivery cannot accept payment maps to `not_payable`.
- Device offline maps to `offline`.
- Latest status check in flight maps to `checking_latest_status`.
- `verify_payment` returns failed maps to `failed` then `retry_ready`.
- `verify_payment` returns pending maps to `still_pending`.
- `verify_payment` returns confirmed maps to `already_confirmed`.
- Pending beyond reconciliation threshold maps to `under_review`.
- Payer phone edit maps to `phone_entry`.
- Invalid payer phone maps to `phone_invalid`.
- `initialize_payment` in flight maps to `retrying`.
- Initialization success maps to `retry_started`.
- Provider unavailable maps to `provider_unavailable`.
- Provider timeout maps to `provider_timeout`.
- Locked quote mismatch maps to `amount_mismatch`.
- Rate limit maps to `rate_limited`.
- Other recoverable failure maps to `api_error`.
- Duplicate tap maps to `duplicate_retry_guard`.

State persistence:
- Persist delivery ID.
- Persist locked amount source.
- Persist payer phone draft locally.
- Persist latest verification response.
- Persist retry attempt ID.
- Persist retry cooldown expiry.
- Do not persist full provider failure payload.
- Do not persist unsupported provider selections.

## Information Architecture
Screen sections in order:
1. Failed-payment header.
2. Blocked-dispatch explanation.
3. Locked amount and delivery proof.
4. Latest status check strip.
5. Recovery action panel.
6. Payer phone editor.
7. Support and delivery links.

First viewport:
- Failed status.
- Locked amount.
- Why delivery cannot move.
- Primary recovery action.

Second viewport:
- Payer phone editor.
- Explanation of retry safety.
- Latest check time.
- Support route.

Do not include:
- Receipt CTA.
- Refund request CTA.
- Delivery route editing.
- Package editing.
- Provider technical payload.
- Future provider selection as active options.

## Visual Direction
Visual thesis:
- A calm recovery desk with a guarded retry button.

Mood:
- Serious.
- Clear.
- Repair-focused.
- Not punitive.
- Not celebratory.

Material language:
- Cream surface.
- Charcoal headline.
- Red-orange failed strip.
- Amber caution band for pending or review.
- Green only for already-confirmed redirect.
- Strong white action panel with security edge.

Typography:
- Failed state headline should be firm, not dramatic.
- Amount uses tabular numerals.
- Button labels use active verbs.
- Support copy uses short sentences.

Spacing:
- Failure explanation has breathing room.
- Retry panel is visually distinct from status header.
- Phone input has enough spacing for keyboard-open state.
- Sticky bottom action remains reachable.

Motion:
- Status check uses one restrained progress indicator.
- Retry button shows inline loading label, not a screen takeover.
- Retry-started transition routes to processing after readable confirmation.
- Reduced motion uses static state changes.

## Layout Specification
Mobile portrait layout:
- Full-screen route.
- Safe-area-aware top header.
- Scrollable content.
- Sticky bottom action area.
- Keyboard-aware payer phone field.

Header:
- Eyebrow: `Payment recovery`
- Title by state.
- Body by state.
- Provider chip.
- Delivery ID.

Blocked-dispatch explanation:
- Title: `Delivery waits for payment`
- Body: `Kra cannot dispatch this delivery until payment is confirmed.`
- Icon: lock or shield.

Locked amount card:
- Label: `Amount to pay`
- Value: `GHS {amount}`
- Supporting: `This amount comes from the locked delivery quote.`
- No edit affordance.

Latest status strip:
- Shows `Checked just now`, `Check needed`, or `Check failed`.
- Shows last verification time when available.
- Includes `Check status` secondary action when safe.

Recovery panel:
- Shows retry action only when eligible.
- Shows phone target.
- Shows why retry is safe.
- Shows cooldown if active.

Phone editor:
- E.164 normalized phone field.
- Ghana local entry can be normalized.
- Validation is inline and accessible.
- Receiver phone is not used unless sender explicitly enters it.

Action bar:
- Primary button full width.
- Secondary action below.
- Disabled button includes reason in accessible hint.

## Component Structure
Root component:
- `PaymentFailedRecoveryScreen`

Child components:
- `FailedRecoveryHeader`
- `PaymentBlockedNotice`
- `RecoveryAmountCard`
- `LatestPaymentStatusStrip`
- `RecoveryEligibilityPanel`
- `RecoveryPhoneEditor`
- `RecoveryActionBar`
- `RecoverySupportLink`
- `RecoveryBlockedState`

Component responsibilities:
- `PaymentFailedRecoveryScreen` owns route state, latest status checks, retry state, and navigation.
- `FailedRecoveryHeader` owns headline and high-level status.
- `PaymentBlockedNotice` explains dispatch gating.
- `RecoveryAmountCard` displays locked amount.
- `LatestPaymentStatusStrip` shows verification status and time.
- `RecoveryEligibilityPanel` explains why retry is allowed or blocked.
- `RecoveryPhoneEditor` validates payer phone.
- `RecoveryActionBar` renders state-specific CTAs.
- `RecoverySupportLink` routes to support.
- `RecoveryBlockedState` handles confirmed, pending, review, not payable, and provider-unavailable states.

Forbidden component behavior:
- No component edits amount.
- No component creates delivery.
- No component shows receipt.
- No component starts retry without eligibility.
- No component stores raw provider payload.
- No component displays future providers as enabled.

## Test IDs
Screen:
- `screen-payment-failed-recovery`

Header:
- `payment-recovery-header`
- `payment-recovery-eyebrow`
- `payment-recovery-title`
- `payment-recovery-body`
- `payment-recovery-provider-chip`

Payment proof:
- `payment-recovery-amount-card`
- `payment-recovery-amount-value`
- `payment-recovery-delivery-id`
- `payment-recovery-payment-id`
- `payment-recovery-status-strip`
- `payment-recovery-last-checked`

Eligibility:
- `payment-recovery-eligibility-panel`
- `payment-recovery-blocked-notice`
- `payment-recovery-safe-retry-note`
- `payment-recovery-cooldown`

Phone:
- `payment-recovery-phone-editor`
- `payment-recovery-phone-input`
- `payment-recovery-phone-error`
- `payment-recovery-change-phone`

Actions:
- `payment-recovery-primary-action`
- `payment-recovery-check-status`
- `payment-recovery-view-delivery`
- `payment-recovery-support`
- `payment-recovery-go-home`

States:
- `payment-recovery-loading`
- `payment-recovery-checking-status`
- `payment-recovery-failed`
- `payment-recovery-ready`
- `payment-recovery-phone-entry`
- `payment-recovery-phone-invalid`
- `payment-recovery-retrying`
- `payment-recovery-retry-started`
- `payment-recovery-still-pending`
- `payment-recovery-already-confirmed`
- `payment-recovery-under-review`
- `payment-recovery-provider-unavailable`
- `payment-recovery-provider-timeout`
- `payment-recovery-amount-mismatch`
- `payment-recovery-not-found`
- `payment-recovery-not-authorized`
- `payment-recovery-not-payable`
- `payment-recovery-offline`
- `payment-recovery-rate-limited`
- `payment-recovery-api-error`
- `payment-recovery-duplicate-guard`

## Interaction Flow
Default recovery:
1. User opens recovery route.
2. Screen loads delivery and payment context.
3. Screen calls `verify_payment` unless fresh failed state is already available.
4. Backend returns latest status.
5. Screen maps status.
6. If failed, retry panel unlocks.
7. User confirms payer phone.
8. User taps retry.
9. Screen calls `initialize_payment`.
10. Successful response routes to PaymentProcessing.

Stale failed state:
1. User opens recovery from old failed result.
2. Screen checks latest status.
3. If confirmed, route to PaymentResult confirmed.
4. If pending, route to PaymentProcessing or pending state.
5. If failed, show recovery.

Change payer phone:
1. User taps `Change payment phone`.
2. Phone editor opens.
3. User enters payer phone.
4. Screen validates and normalizes.
5. Retry uses new payer phone.
6. Receiver phone is not auto-inserted as payment phone.

Retry success:
1. `initialize_payment` returns pending.
2. Screen stores payment response.
3. Screen routes to PaymentProcessing.
4. Processing waits for provider result.

Provider unavailable:
1. Retry call fails with provider unavailable.
2. Screen shows provider-unavailable state.
3. User can check status, view delivery, or try later.
4. No additional retry fires automatically.

Pending status found:
1. Latest status check returns pending.
2. Screen hides retry.
3. Screen shows still-pending guidance.
4. User can continue to PaymentProcessing.

Confirmed status found:
1. Latest status check returns confirmed.
2. Screen hides retry.
3. Screen routes to PaymentResult confirmed.

Under-review status:
1. Latest status remains pending after review threshold.
2. Screen hides retry.
3. Screen routes to PaymentResult review.

Duplicate tap:
1. User taps retry.
2. Button disables immediately.
3. Second tap is ignored.
4. In-flight guard prevents a second initialization request.

Offline:
1. Screen opens offline.
2. Screen shows offline state.
3. Retry is disabled.
4. User can view delivery if cached.
5. On reconnect, user can check status.

## State Copy
Loading:
- Eyebrow: `Payment recovery`
- Title: `Opening recovery`
- Body: `Kra is checking this delivery before another payment prompt can start.`

Checking latest status:
- Eyebrow: `Payment recovery`
- Title: `Checking latest status`
- Body: `Kra is making sure the last payment is not pending or confirmed.`
- Button: `Checking latest payment status`

Failed:
- Eyebrow: `Payment failed`
- Title: `Payment was not confirmed`
- Body: `This delivery cannot move until payment is confirmed. You can retry safely after Kra checks the latest status.`

Retry ready:
- Eyebrow: `Ready to recover`
- Title: `Try MTN MoMo again`
- Body: `Kra verified the last attempt is not active. A new prompt can be sent to the payment phone.`
- Primary: `Try MTN MoMo again`
- Secondary: `Change payment phone`

Phone entry:
- Eyebrow: `Payment phone`
- Title: `Choose where to send the prompt`
- Body: `Enter the phone that should receive the MTN MoMo authorization request.`
- Primary: `Send prompt to this phone`

Phone invalid:
- Eyebrow: `Check phone`
- Title: `Enter a valid payment phone`
- Body: `Use a Ghana mobile number that can receive the MTN MoMo prompt.`

Retrying:
- Eyebrow: `Sending prompt`
- Title: `Starting a new payment check`
- Body: `Do not close this screen. Kra is sending one MTN MoMo prompt for this recovery attempt.`
- Button: `Sending MTN MoMo prompt`

Retry started:
- Eyebrow: `Prompt sent`
- Title: `Continue to payment check`
- Body: `Kra sent the prompt. Continue to the payment check screen to verify the result.`
- Primary: `Continue to payment check`

Still pending:
- Eyebrow: `Payment still pending`
- Title: `Do not retry yet`
- Body: `Kra is still waiting for the provider to finish the previous payment. Starting another prompt could cause confusion.`
- Primary: `Continue checking`
- Secondary: `View delivery`

Already confirmed:
- Eyebrow: `Payment confirmed`
- Title: `No retry needed`
- Body: `Kra verified this payment. Open the result to continue.`
- Primary: `View result`

Under review:
- Eyebrow: `Payment under review`
- Title: `Retry is paused`
- Body: `Kra is reconciling the provider result. Dispatch and retry wait until review is resolved.`
- Primary: `View review status`
- Secondary: `Contact support`

Provider unavailable:
- Eyebrow: `Provider unavailable`
- Title: `MTN MoMo is not ready`
- Body: `Kra cannot send a new prompt right now. Check again later without changing the delivery amount.`
- Primary: `Try again later`
- Secondary: `View delivery`

Provider timeout:
- Eyebrow: `Provider delayed`
- Title: `Prompt did not start clearly`
- Body: `Kra could not confirm whether the provider accepted the new prompt. Check status before retrying.`
- Primary: `Check status again`
- Secondary: `View delivery`

Amount mismatch:
- Eyebrow: `Amount blocked`
- Title: `Payment amount needs review`
- Body: `The locked delivery amount does not match the payment request, so retry is blocked.`
- Primary: `Contact support`
- Secondary: `View delivery`

Not payable:
- Eyebrow: `Payment blocked`
- Title: `This delivery cannot accept payment`
- Body: `The delivery status no longer allows a payment retry from this screen.`
- Primary: `View delivery`
- Secondary: `Contact support`

Offline:
- Eyebrow: `Offline`
- Title: `Reconnect to retry`
- Body: `Kra needs a connection to check payment status and send a new prompt.`
- Primary: `Try again when online`
- Secondary: `View delivery`

Rate limited:
- Eyebrow: `Wait before retry`
- Title: `Too many recovery attempts`
- Body: `Kra is protecting this delivery from repeated payment prompts. Try again after the timer ends.`
- Primary: `Wait and retry`

API error:
- Eyebrow: `Recovery interrupted`
- Title: `Kra could not recover payment`
- Body: `The status check or prompt request did not complete. Check status before trying again.`
- Primary: `Check status again`
- Secondary: `Contact support`

Duplicate retry guard:
- Eyebrow: `Prompt already starting`
- Title: `One retry is in progress`
- Body: `Kra is already sending a prompt for this recovery attempt.`

## Copy Rules
Use:
- `not confirmed`
- `retry safely`
- `latest status`
- `one prompt`
- `locked amount`
- `dispatch waits`
- `check status`

Do not use:
- `paid` unless backend says confirmed.
- `success` on this screen.
- `receipt` on this screen.
- `charge again` without explaining protection.
- `try until it works`.
- `ignore pending`.
- Any copy that suggests package movement before confirmed payment.

Tone:
- Calm.
- Practical.
- Accountable.
- No blame.
- No panic.

## Navigation Rules
Entry routes:
- PaymentResult failed.
- PaymentProcessing failed.
- PaymentProviderReturn failed.
- SenderDeliveryDetail payment blocked.

Exit routes:
- Retry started -> PaymentProcessing.
- Already confirmed -> PaymentResult confirmed.
- Under review -> PaymentResult review.
- Pending -> PaymentProcessing or PaymentResult pending/review according to policy.
- Delivery blocked -> SenderDeliveryDetail.
- Support -> SupportEntry with payment recovery context.

Back behavior:
- Back from retry-ready returns to PaymentResult failed or delivery detail.
- Back during retrying asks user to wait or stays on screen.
- Back after retry-started should route to PaymentProcessing.
- Back must not reopen provider surface.

Stack hygiene:
- Replace recovery route after retry-started when routing to processing.
- Do not stack multiple recovery screens for the same delivery.
- Do not preserve failed recovery state after confirmed route.

## Data Handling Rules
Safe to display:
- Delivery ID.
- Payment ID from Kra backend.
- Provider display name.
- Locked amount.
- Last checked time.
- Payer phone entered by sender, masked except last digits where practical.

Not safe to display:
- Full provider response.
- Raw provider failure payload.
- Provider tokens.
- Full phone number in non-editing summary.
- Payment gateway diagnostic codes that do not help user action.

Safe analytics fields:
- `deliveryId`
- `paymentId`
- `provider`
- `failureReasonCategory`
- `latestStatus`
- `retryEligible`
- `attemptIndex`
- `cooldownActive`
- `networkState`

Unsafe analytics fields:
- Full phone number.
- Raw provider payload.
- Full address.
- Support notes.
- Provider token.

## Accessibility Requirements
Screen reader:
- Announce latest status check results.
- Failed, pending, confirmed, review, and blocked states must have clear text labels.
- Phone validation error must be tied to input.
- Retry cooldown must announce remaining time when it changes meaningfully.

Focus:
- Initial focus on title.
- After latest status check, focus state title.
- After phone error, focus phone field.
- After retry success, focus retry-started title before navigation if auto-route delay exists.

Touch:
- Buttons minimum 44 by 44 px.
- Phone field remains visible with keyboard.
- Sticky CTA stays above keyboard and home indicator.

Contrast:
- Failed red-orange must meet contrast with text.
- State must not rely on color alone.
- Disabled button must include readable reason text nearby.

Reduced motion:
- No shaking phone field.
- No repeated warning animation.
- Use static progress and clear text.

Large text:
- Failure header wraps.
- Amount card remains readable.
- Action bar can stack buttons.
- Phone field label remains visible.

## Performance Requirements
Initial render:
- Render skeleton and status text immediately.
- Do not block first paint on support data.
- Start latest status check after route and auth are ready.

Network:
- Only one `verify_payment` request at a time.
- Only one `initialize_payment` request at a time.
- Abort stale requests when delivery ID changes.
- Respect rate limit and cooldown.
- Reuse latest fresh verification response.

Local state:
- Persist phone draft during screen session.
- Persist retry attempt ID while in flight.
- Clear phone draft after successful retry start if policy says so.

Offline:
- Avoid retry loops.
- Do not call initialize while offline.
- Allow manual check when online.

## Analytics
Events:
- `payment_recovery_viewed`
- `payment_recovery_status_check_started`
- `payment_recovery_status_failed`
- `payment_recovery_status_pending`
- `payment_recovery_status_confirmed`
- `payment_recovery_retry_unlocked`
- `payment_recovery_phone_changed`
- `payment_recovery_retry_started`
- `payment_recovery_retry_succeeded`
- `payment_recovery_retry_blocked`
- `payment_recovery_support_tapped`
- `payment_recovery_delivery_tapped`

Required properties:
- `deliveryId`
- `paymentId`
- `provider`
- `latestStatus`
- `retryEligible`
- `failureReasonCategory`
- `attemptIndex`
- `networkState`
- `cooldownActive`

Forbidden properties:
- Raw provider payload.
- Full phone number.
- Raw error body.
- Address.
- Receiver name.

Success metric:
- Failed payments recovered without duplicate active payment attempts.

Risk metric:
- Retry taps blocked due to pending, confirmed, under-review, or duplicate guard.

Operational metric:
- Time from recovery screen view to retry-started processing route.

## QA Scenarios
Failed payment retry:
1. Open recovery with failed status.
2. Screen checks latest status.
3. Backend returns failed.
4. Retry unlocks.
5. User taps retry.
6. `initialize_payment` is called once.
7. App routes to PaymentProcessing.

Change phone retry:
1. Open failed recovery.
2. Tap `Change payment phone`.
3. Enter valid Ghana mobile number.
4. Tap `Send prompt to this phone`.
5. Request uses normalized E.164 phone.
6. App routes to PaymentProcessing after pending response.

Invalid phone:
1. Open phone editor.
2. Enter invalid number.
3. Tap send.
4. Inline error appears.
5. No initialization request is sent.

Pending latest status:
1. Open recovery from stale failed state.
2. Latest status returns pending.
3. Retry is hidden.
4. User can continue checking.

Confirmed latest status:
1. Open recovery from stale failed state.
2. Latest status returns confirmed.
3. Retry is hidden.
4. User routes to PaymentResult.

Review latest status:
1. Open recovery after reconciliation threshold.
2. Latest status maps to review.
3. Retry is hidden.
4. User routes to review result.

Provider unavailable:
1. Retry eligible.
2. User taps retry.
3. Backend returns provider unavailable.
4. Screen shows provider unavailable.
5. No automatic retry starts.

Provider timeout:
1. Retry eligible.
2. User taps retry.
3. Initialization times out.
4. Screen asks user to check status before retrying.

Duplicate tap:
1. Retry eligible.
2. User taps retry twice quickly.
3. Button disables on first tap.
4. Only one initialization request is sent.

Offline:
1. Open recovery offline.
2. Screen shows offline.
3. Retry disabled.
4. Reconnect and check status.
5. Retry unlocks only after latest failed status.

Amount mismatch:
1. Delivery quote differs from payment amount.
2. Retry blocked.
3. Support route appears.
4. No initialization request is sent.

Not payable:
1. Delivery is cancelled or otherwise not payable.
2. Screen blocks retry.
3. User can view delivery or support.

## Automated Test Requirements
Unit tests:
- State mapper unlocks retry only for failed.
- State mapper blocks retry for pending.
- State mapper blocks retry for confirmed.
- State mapper blocks retry for review.
- Phone normalizer accepts valid Ghana numbers.
- Phone validator rejects invalid numbers.
- Amount mismatch blocks initialization.
- Duplicate tap guard prevents second request.
- Retry idempotency key remains stable while in flight.
- Network offline blocks backend calls.

Component tests:
- Failed state shows locked amount.
- Failed state shows dispatch blocked notice.
- Retry-ready state shows retry CTA.
- Pending state hides retry CTA.
- Confirmed state hides retry CTA.
- Review state hides retry CTA.
- Phone error is accessible.
- Loading state renders status copy.
- Provider unavailable state renders later retry guidance.
- Rate-limited state renders cooldown.

Integration tests:
- Screen calls `verify_payment` on open when status is stale.
- Latest failed status enables `initialize_payment`.
- Latest pending status routes to processing or pending state.
- Latest confirmed status routes to result.
- Initialization success routes to PaymentProcessing.
- Initialization timeout does not start a second request.
- Recovery screen never calls `create_delivery`.
- Recovery screen never shows receipt CTA.

End-to-end tests:
- Failed payment result routes to recovery.
- Recovery checks latest status.
- Sender retries MTN MoMo once.
- Processing receives pending payment response.
- Confirmed late callback from stale failed state routes to result.
- Pending latest status blocks retry.

## Implementation Notes For Claude Code
Build order:
1. Add route file for `/(sender)/payments/:deliveryId/recover`.
2. Implement recovery state machine.
3. Implement latest status verification guard.
4. Implement payer phone editor and validation.
5. Implement retry eligibility function.
6. Implement idempotent `initialize_payment` retry action.
7. Implement blocked-state panels.
8. Implement navigation to processing, result, delivery, and support.
9. Add analytics with safe properties.
10. Add unit, component, integration, and end-to-end tests.

Required state machine invariants:
- Retry unlocks only after latest failed status.
- Pending blocks retry.
- Confirmed blocks retry and routes to result.
- Review blocks retry and routes to review status.
- Offline blocks backend mutation.
- Duplicate tap does not send a second initialization request.
- Amount is never editable.
- Recovery never creates delivery.
- Recovery never shows receipt.

Suggested module boundaries:
- `mapPaymentRecoveryState`
- `getPaymentRetryEligibility`
- `usePaymentFailedRecovery`
- `PaymentFailedRecoveryScreen`
- `RecoveryPhoneEditor`
- `RecoveryActionBar`

Suggested input contract:
- `deliveryId`
- `storedPaymentContext`
- `lockedQuote`
- `currentUser`
- `networkState`
- `now`

Suggested output contract:
- `state`
- `latestStatus`
- `retryEligible`
- `payerPhone`
- `idempotencyKey`
- `nextRoute`

Do not implement:
- Delivery creation.
- Refund request.
- Receipt view.
- Provider webview.
- Active future provider selection.
- Raw provider diagnostics.
- Delivery amount editing.

## Design QA Checklist
Before closing implementation:
- Failed context appears above the fold.
- Locked amount appears above the fold.
- Dispatch-blocked notice is clear.
- Latest status check happens before retry when stale.
- Retry is hidden for pending.
- Retry is hidden for confirmed.
- Retry is hidden for review.
- Retry uses `initialize_payment`.
- Status check uses `verify_payment`.
- No `create_delivery` call exists.
- No receipt CTA appears.
- Duplicate taps are ignored.
- Idempotency key is stable while retry is in flight.
- Phone validation is accessible.
- Offline state is safe.
- Rate-limit state has wait guidance.
- Provider timeout asks for status check before another retry.
- Screen works on small phones.
- Screen works with large text.
- Screen works with screen reader.
- Screen works with reduced motion.

## Handoff Summary
Claude Code should build `PaymentFailedRecovery` as the guarded payment retry screen. It must verify latest payment status, unlock MTN MoMo retry only for failed recoverable status, allow payer-phone change, call `initialize_payment` once per retry attempt, route successful retry to PaymentProcessing, and block retry for pending, confirmed, under-review, not-payable, offline, rate-limited, and amount-mismatch states. It must never create a delivery, show receipt access, or allow duplicate active payment prompts.
