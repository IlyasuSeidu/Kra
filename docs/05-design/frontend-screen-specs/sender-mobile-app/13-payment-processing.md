# Payment Processing Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PaymentProcessing` |
| App | `apps/mobile` |
| Route | `/(sender)/payments/:deliveryId/processing` |
| Primary test ID | `screen-payment-processing` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `verify_payment`, `paymentVerifyRequestSchema`, `paymentVerifyResponseSchema`, initialized payment response, payment reconciliation policy |
| Related routes | `/(sender)/payments/:deliveryId/method`, `/(sender)/payments/:deliveryId/result`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home` |
| Required states | `loading`, `waiting_for_authorization`, `verifying`, `pending`, `confirmed`, `failed`, `under_review`, `verification_error`, `provider_timeout`, `no_payment_found`, `delivery_not_found`, `not_authorized`, `offline`, `app_resumed`, `manual_check_available` |

## Product Job
This screen waits for the MTN MoMo authorization and verifies the payment status without creating another payment or delivery. It is the sender's live payment checkpoint between sending the MoMo prompt and seeing the final payment result.

The sender should be able to:
- See that the MTN MoMo prompt was sent.
- Understand which phone should approve the prompt.
- Know that payment is not confirmed yet.
- Wait while Kra checks provider status.
- Manually check status when automatic checks are delayed.
- See confirmed, failed, or under-review outcomes.
- Move to recovery when payment fails.
- Leave safely without losing the pending payment reference.

This screen is not payment method selection, payment initialization, quote review, delivery creation, receipt display, refund flow, support chat, or finance reconciliation admin.

## Audience
Primary audience:
- Authenticated senders who have started MTN MoMo payment.
- Senders waiting for a USSD push or mobile money prompt.
- Senders on unstable mobile networks.
- Senders who may switch apps to approve payment.

Secondary audience:
- QA engineers validating verification and pending-state behavior.
- Claude Code implementing this route from the spec.
- Support teams explaining delayed provider callbacks.
- Finance reviewers confirming under-review expectations.

## User State
The sender has tapped `Send MTN MoMo prompt` on PaymentMethod. The backend returned a pending payment with `paymentId`, `providerReference`, and `checkoutMode=ussd_push`. The sender may need to approve the payment outside Kra before the backend can verify it.

The sender may be:
- Waiting for the prompt.
- Switching to a phone approval sheet or USSD surface.
- Returning after approving payment.
- Unsure whether the payment succeeded.
- Worried about being charged twice.
- Experiencing delayed provider callback.
- Offline after the prompt was sent.

The screen must:
- Preserve the pending payment reference.
- Check payment status with `verify_payment`.
- Never initialize another payment.
- Never create another delivery.
- Never show confirmed state until backend verification says confirmed.
- Provide clear waiting, failed, and under-review guidance.
- Avoid silently failing forward.

## Primary Action
Primary action changes by state:
- Waiting: `I have approved it`
- Pending after checks: `Check payment status`
- Confirmed: `View result`
- Failed: `Recover payment`
- Under review: `View review status`
- Offline: `Try again when online`

Secondary actions:
- `View delivery`
- `Go home`
- `Back to payment method` only if no pending payment exists.

CTA behavior:
- `I have approved it` calls `verify_payment`.
- `Check payment status` calls `verify_payment`.
- `View result` routes to `/(sender)/payments/:deliveryId/result`.
- `Recover payment` routes to `/(sender)/payments/:deliveryId/recover`.
- `View review status` routes to `/(sender)/payments/:deliveryId/result` with review context.
- `View delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Go home` routes to `/(sender)/home`.

CTA disabled conditions:
- No `deliveryId`.
- No pending payment reference and no recoverable delivery payment state.
- Verification is in flight.
- Device is offline and action requires backend.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- MTN MoMo prompt status.
- Payer phone target.
- Locked amount.
- Clear instruction to approve the prompt.
- Assurance that Kra will verify before dispatch.

The screen creates value by:
- Reducing panic while a provider prompt is pending.
- Preventing duplicate payment starts.
- Explaining what to do after approving the prompt.
- Making provider delay recoverable.
- Routing failed payment into a safe recovery flow.

## Main Tension
Payment processing is a waiting room with real money risk. The screen must keep the sender informed without inventing status, over-polling the backend, or encouraging duplicate payment attempts.

The screen must balance:
- Reassurance against false confirmation.
- Automatic checks against rate limits and provider delay.
- Clear recovery against accidental duplicate charges.
- App switching against state persistence.
- Provider uncertainty against a calm, trustworthy interface.

## Design Brief
User and job:
- An authenticated sender waits for provider authorization and verification.

Context of use:
- Financial, time-sensitive, interruption-prone mobile payment flow.

Entry point:
- `/(sender)/payments/:deliveryId/method` after `initialize_payment` response.

Success state:
- Backend verification returns confirmed and user routes to payment result.

Primary action:
- Verify current payment status.

Navigation model:
- Payment flow step 2 of 3: method, processing, result.

Density:
- Minimal waiting screen with strong status, phone target, amount, and recovery actions.

Visual thesis:
- A controlled verification cockpit: one live status, one next instruction, one safe check action.

Restraint rule:
- Avoid success celebration, receipt copy, provider grids, retry-payment CTAs, delivery details, or finance terminology in the main waiting state.

Product lens:
- Trust-critical provider handoff.

System stance:
- Native status screen with accessible progress and strong app-resume behavior.

Interaction thesis:
- The sender can approve externally, return, and ask Kra to check status without starting another payment.

Signature move:
- A three-stage status rail: prompt sent, sender approval, Kra verification.

Activation event:
- Payment status becomes `confirmed`, `failed`, or UI-derived `under_review`.

## Elite Quality Gate
This spec is not closed unless the resulting screen makes pending payment status clear without starting duplicate payment.

Non-negotiable quality requirements:
- The first viewport must show payment is pending or being checked.
- The first viewport must show locked `GHS` amount.
- The first viewport must show MTN MoMo as provider.
- The first viewport must show payer phone target when available.
- The screen must call `verify_payment` for status checks.
- The screen must not call `initialize_payment`.
- The screen must not call `create_delivery`.
- The screen must not show receipt actions.
- The screen must not show payment confirmed until backend verification returns `confirmed`.
- The screen must route failed payments to recovery.
- The screen must show under-review guidance after unresolved provider delay.
- The screen must preserve pending payment reference across app resume.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If sender can start a new payment from this screen, the screen remains open.
- If pending state looks like success, the screen remains open.
- If manual check can fire duplicate overlapping verify calls, the screen remains open.
- If app resume loses provider reference, the screen remains open.
- If under-review state has no path forward, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear progress, feedback, app state restoration, and interruption-safe task flows.
- Material Design 3 progress indicators and status surfaces support accessible waiting and retry states.
- W3C WCAG guidance supports status messages, focus order, error identification, and non-color-only state changes.
- Nielsen Norman Group progress indicator guidance supports explaining wait states and setting expectations.
- Kra MTN MoMo policy defines pending verification, delayed callback, reconciliation checkpoints, and duplicate callback safety.
- Kra API contracts define `paymentVerifyRequestSchema` and `paymentVerifyResponseSchema`.
- Kra payment spec requires under-review UI instead of silent failure when provider verification remains unresolved.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://m3.material.io/components/progress-indicators/overview
- https://m3.material.io/components/snackbar/overview
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.nngroup.com/articles/progress-indicators/
- `docs/09-payments/mtn-momo-flow.md`
- `docs/04-features/payments-spec.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- PaymentMethod already called `initialize_payment`.
- MTN MoMo is the only active provider.
- Payment initialization response is stored locally.
- `checkoutMode` is `ussd_push`.
- Provider authorization may happen outside the Kra app.
- `verify_payment` returns `pending`, `confirmed`, or `failed`.
- Under-review is a user-facing UI state derived from unresolved pending duration or future reconciliation flags.
- Backend reconciliation checks occur at `5 minutes`, `15 minutes`, and `30 minutes`.
- Payment still pending after the final reconciliation checkpoint should be shown as under review.
- PaymentResult owns final confirmed, failed, and review presentation.
- PaymentFailedRecovery owns retry or method recovery.

## Backend Contract
Primary operation:
- `verify_payment`

HTTP:
- `POST /v1/payments/verify`

Auth:
- Authenticated sender who owns the delivery.

Request schema:
- `paymentVerifyRequestSchema`

Request fields:
- `deliveryId`

Response schema:
- `paymentVerifyResponseSchema`

Response fields:
- `paymentId`
- `deliveryId`
- `provider`
- `paymentStatus`
- `providerReference`
- `verificationCheckedAt`

Response interpretation:
- `pending`: stay on processing or show manual check guidance.
- `confirmed`: route to `PaymentResult`.
- `failed`: route to `PaymentFailedRecovery` or `PaymentResult` failed state depending current navigation decision.

Must not call:
- `initialize_payment`
- `create_delivery`
- refund endpoints
- receipt endpoints

Allowed supporting data:
- Stored `paymentInitializeResponseSchema` from PaymentMethod.
- Stored locked amount from backend quote.
- Stored payer phone from PaymentMethod.
- Optional delivery detail for recovery display if payment response is missing.

## Data Read Model
Read from route:
- `deliveryId`

Read from route state or cache:
- `paymentId`
- `provider`
- `providerReference`
- `checkoutMode`
- `paymentStatus`
- `amountGhs`
- masked payer phone
- payment initiated timestamp

Read from backend:
- `verify_payment` for current payment status.

Write locally:
- Last verification check timestamp.
- Verification attempt count.
- Last known payment status.
- Under-review transition timestamp.
- App background and resume timestamps.

Write remotely:
- None except verification request.

Do not write:
- New payment initialization.
- Delivery mutation.
- Payment recovery request.
- Receipt data.

## Route Entry Conditions
Normal entry:
- `deliveryId` route param exists.
- Pending payment response exists from PaymentMethod.
- Provider is `mtn_momo`.
- Locked amount is known.

Recovery entry:
- Route has `deliveryId`.
- Payment response missing.
- App can call `verify_payment`.
- If backend says no payment exists, route to PaymentMethod or show no-payment state.

Blocked entry:
- Missing `deliveryId`.
- No payment exists for delivery.
- Sender not authorized.
- Delivery not found.

Blocked UI:
- No processing animation.
- Explain the recovery path.
- Do not initialize payment.

## Information Architecture
Top-level structure:
1. Processing header.
2. Live payment status card.
3. Prompt instruction panel.
4. Status rail.
5. Locked amount and reference details.
6. Manual check controls.
7. Safe exit actions.

Required first viewport:
- `Waiting for MTN MoMo approval`
- `GHS {amount}`
- `Prompt sent to {maskedPayerPhone}`
- `I have approved it`

Why this order:
- Status reduces anxiety.
- Amount reminds the sender what they are authorizing.
- Phone target helps find the prompt.
- Manual check gives control without starting another payment.

## Processing Header
Content:
- Eyebrow: `Payment step 2 of 3`
- Title: `Waiting for MTN MoMo approval`
- Subtitle: `Approve the prompt on your phone. Kra will verify before dispatch.`

Rules:
- Do not say payment is complete.
- Do not show receipt wording.
- Do not hide provider name.

Accessibility:
- Title is screen title.
- Pending state is announced on entry.

## Live Payment Status Card
Purpose:
- Show current known status and next action.

Waiting state:
- Label: `Prompt sent`
- Status: `Waiting for approval`
- Body: `Approve the MTN MoMo prompt on {maskedPayerPhone}.`

Verifying state:
- Label: `Checking payment`
- Status: `Verifying with MTN MoMo`
- Body: `This can take a short moment. Do not start another payment.`

Pending state:
- Label: `Still pending`
- Status: `MoMo has not confirmed yet`
- Body: `If you approved the prompt, keep this screen open or check again.`

Confirmed state:
- Label: `Payment confirmed`
- Status: `Kra verified your payment`
- Body: `Opening payment result.`

Failed state:
- Label: `Payment failed`
- Status: `MoMo did not approve this payment`
- Body: `You can recover payment without creating another delivery.`

Under-review state:
- Label: `Payment under review`
- Status: `Kra is reconciling this payment`
- Body: `Provider confirmation is delayed. Kra will not dispatch until payment is resolved.`

Rules:
- Status card must be text-first.
- Do not use color alone.
- Do not show success visuals for pending.
- Do not include payment retry CTA inside the card.

## Prompt Instruction Panel
Purpose:
- Explain what the sender should do outside Kra.

Content:
- Title: `Check your phone`
- Row 1: `Open the MTN MoMo prompt.`
- Row 2: `Confirm the amount.`
- Row 3: `Return here and tap check status.`

Alternative copy if payer phone unavailable:
- Title: `Approve the MoMo prompt`
- Body: `Use the phone that received the authorization request.`

Rules:
- Do not ask sender to share PIN inside Kra.
- Do not ask sender to type provider PIN into Kra.
- Do not ask sender to send cash to staff.

## Status Rail
Stages:
- `Prompt sent`
- `Sender approval`
- `Kra verification`

State mapping:
- Initial pending: first stage complete, second active.
- Verifying: first and second complete, third active.
- Confirmed: all complete.
- Failed: first complete, second failed or third failed based response.
- Under review: first complete, third review.

Visual:
- Vertical rail on small phones.
- Icons plus labels.
- Current stage uses strong emphasis.
- Completed stages use check marks.
- Failed/review states use text labels, not color only.

Accessibility:
- Rail must be read in order.
- Current stage must be announced.

## Locked Amount And Reference Details
Fields:
- Amount: `GHS {amount}`
- Provider: `MTN MoMo`
- Payment ID: `{paymentId}`
- Provider reference: `{providerReference}`
- Delivery ID: `{deliveryId}`

Display rules:
- Amount is visible.
- Payment ID may be collapsed under `Payment details`.
- Provider reference may be shown for support but not overemphasized.
- Do not expose sensitive provider authorization details.
- Do not show receiver personal data.

## Manual Check Controls
Purpose:
- Give sender control without triggering duplicate payment.

Primary controls:
- `I have approved it`
- `Check payment status`

Timing:
- Show `I have approved it` immediately after prompt sent.
- Change to `Check payment status` after first verification attempt.
- Disable while verification is in flight.
- Optional cool-down of `5` to `10` seconds between manual checks to avoid rate limits.

Rules:
- Manual check calls `verify_payment`.
- Manual check does not call `initialize_payment`.
- Manual check does not create a new payment.
- If offline, disable and show offline state.

## Safe Exit Actions
Actions:
- `View delivery`
- `Go home`

Rules:
- Exiting does not cancel payment.
- Exiting does not confirm payment.
- Home and delivery detail must show pending payment next action.
- If payment is in-flight, show a short guard: `Payment is still being checked. You can leave and return later.`

Do not include:
- `Cancel payment` unless backend later supports explicit cancellation.
- `Start new payment`.
- `Change amount`.
- `Cash payment`.

## Component Inventory
Required components:
- `PaymentFlowHeader`
- `LivePaymentStatusCard`
- `MomoPromptInstructionPanel`
- `PaymentStatusRail`
- `PaymentReferenceDetails`
- `ManualVerifyPaymentButton`
- `PaymentProcessingExitActions`
- `PaymentProcessingErrorCallout`
- `UnderReviewPanel`
- `StickyProcessingActionBar`

Reusable component requirements:
- Components must support dynamic status.
- Components must expose test IDs.
- Components must handle missing phone gracefully.
- Components must work in light and dark themes.
- Components must support reduced motion.

## Test IDs
Screen:
- `screen-payment-processing`

Header:
- `payment-processing-header`
- `payment-processing-step-label`

Status:
- `payment-processing-status-card`
- `payment-processing-status-label`
- `payment-processing-status-body`
- `payment-processing-status-rail`

Details:
- `payment-processing-amount`
- `payment-processing-provider`
- `payment-processing-payment-id`
- `payment-processing-provider-reference`
- `payment-processing-delivery-id`

Actions:
- `payment-processing-approved-cta`
- `payment-processing-check-status`
- `payment-processing-view-result`
- `payment-processing-recover-payment`
- `payment-processing-view-delivery`
- `payment-processing-go-home`

States:
- `payment-processing-loading`
- `payment-processing-waiting`
- `payment-processing-verifying`
- `payment-processing-pending`
- `payment-processing-confirmed`
- `payment-processing-failed`
- `payment-processing-under-review`
- `payment-processing-offline`
- `payment-processing-error`

## State Model
States:
- `loading`
- `waiting_for_authorization`
- `verifying`
- `pending`
- `confirmed`
- `failed`
- `under_review`
- `verification_error`
- `provider_timeout`
- `no_payment_found`
- `delivery_not_found`
- `not_authorized`
- `offline`
- `app_resumed`
- `manual_check_available`

Initial resolution:
- Read route `deliveryId`.
- Restore pending payment response.
- Restore locked amount and payer phone.
- Render waiting state.
- Optionally call `verify_payment` after app resume or if route says provider returned.

Verification resolution:
- Move to `verifying`.
- Call `verify_payment`.
- Parse `paymentVerifyResponseSchema`.
- If status is `confirmed`, route to result.
- If status is `failed`, route to recovery or result failed state.
- If status is `pending`, remain on processing and update last checked timestamp.

Under-review resolution:
- If payment remains pending after the local or backend reconciliation threshold, render under-review state.
- If backend later exposes reconciliation review state to sender, use backend state as authority.
- Do not invent confirmed or failed status.

## Loading State
Use when:
- Payment response is being restored.
- Route data is being validated.
- App is checking whether a verification response already exists.

Layout:
- Header skeleton.
- Status card skeleton.
- Status rail skeleton.
- Action bar disabled.

Copy:
- Title: `Preparing payment status`
- Body: `Checking the pending payment reference.`

Rules:
- Do not show confirmed or failed.
- Do not verify until required data is available.
- Do not initialize payment.

## Waiting For Authorization State
Use when:
- Payment was initialized.
- Sender has not indicated approval yet.
- No verification request is in flight.

Required content:
- Prompt sent status.
- Masked payer phone when available.
- Amount.
- Provider.
- `I have approved it` CTA.
- Instructions.

Rules:
- Do not auto-route.
- Do not show success.
- Do not start another payment.

## Verifying State
Use when:
- `verify_payment` request is in flight.

Layout:
- Status card says checking.
- CTA disabled.
- Progress indicator visible.

Copy:
- Title: `Checking payment`
- Body: `Kra is verifying this payment with MTN MoMo.`

Rules:
- Only one verification call in flight.
- Do not allow manual check during in-flight request.
- Do not initialize payment.
- Store verification attempt timestamp.

Accessibility:
- Announce `Checking payment status.`

## Pending State
Use when:
- `verify_payment` returns `pending`.

Layout:
- Status card says still pending.
- Show last checked timestamp.
- Manual check remains available after cool-down.

Copy:
- Title: `Still waiting for confirmation`
- Body: `MTN MoMo has not confirmed this payment yet. If you approved the prompt, check again soon.`
- CTA: `Check payment status`

Rules:
- Do not mark failed.
- Do not route to result unless product wants pending result page after long delay.
- Keep no-duplicate-payment copy visible.

## Confirmed State
Use when:
- `verify_payment` returns `confirmed`.

Behavior:
- Store response.
- Route to `/(sender)/payments/:deliveryId/result`.

Copy during transition:
- Title: `Payment confirmed`
- Body: `Opening payment result.`

Rules:
- Do not show receipt on this screen.
- Do not keep user on processing longer than necessary.

## Failed State
Use when:
- `verify_payment` returns `failed`.

Behavior:
- Store response.
- Route to `/(sender)/payments/:deliveryId/recover` or failed result depending app routing.

Copy during transition:
- Title: `Payment failed`
- Body: `Opening recovery options.`

Rules:
- Do not start retry automatically.
- Do not create another payment from processing.

## Under Review State
Use when:
- Payment remains pending after policy threshold.
- Provider callback is delayed beyond expected reconciliation timing.
- Future backend state indicates reconciliation review is required.

Layout:
- Under-review panel replaces active waiting card.
- Amount remains visible.
- Provider reference remains accessible.
- Primary routes to payment result review state.
- Secondary routes to delivery detail.

Copy:
- Title: `Payment under review`
- Body: `MTN MoMo has not provided a final result yet. Kra will keep checking and will not dispatch until payment is resolved.`
- Primary: `View review status`
- Secondary: `View delivery`

Rules:
- Do not call payment failed.
- Do not route to recovery unless backend says failed.
- Do not initialize another payment.
- Show support-safe reference details.

## Verification Error State
Use when:
- `verify_payment` fails due to generic API error.
- Response cannot be parsed.

Copy:
- Title: `Could not check payment`
- Body: `The payment may still be pending. Try checking again before starting any recovery.`
- Primary: `Check again`
- Secondary: `View delivery`

Rules:
- Do not mark failed.
- Do not start new payment.
- Keep payment reference visible.

## Provider Timeout State
Use when:
- Verify request times out against provider or backend reports provider timeout.

Copy:
- Title: `Provider check timed out`
- Body: `MTN MoMo took too long to respond. Do not start another payment yet.`
- Primary: `Check again`
- Secondary: `View delivery`

Rules:
- Apply cool-down before retry.
- Do not mark failed.
- Do not initialize another payment.

## No Payment Found State
Use when:
- `verify_payment` returns validation error indicating no payment exists.

Copy:
- Title: `No payment is active`
- Body: `Start payment again from the payment method screen.`
- Primary: `Choose payment method`
- Secondary: `View delivery`

Rules:
- This is the only state that may route back to PaymentMethod.
- Do not call initialize from this screen.

## Offline State
Use when:
- Device is offline.
- Sender attempts manual check.

Copy:
- Title: `Connect to check payment`
- Body: `Your payment reference is saved. Reconnect to verify with Kra.`

Rules:
- Show payment reference.
- Disable verify action.
- Do not queue verification if user has not requested it.
- Re-enable when online.

## App Resumed State
Use when:
- User returns after backgrounding app to approve MoMo prompt.

Behavior:
- Show `Welcome back. Checking payment status.`
- Call `verify_payment` once if online and no check is in flight.
- If offline, show offline state.

Rules:
- Do not initialize payment.
- Do not route until verification response is known.

## Visual System Direction
Visual thesis:
- Calm waiting room with operational clarity, not a spinning dead end.

Color:
- Pending uses trust blue or neutral.
- Verifying uses active accent.
- Confirmed uses success only after backend confirmation.
- Failed uses accessible red.
- Under review uses amber with text clarity.

Typography:
- One strong status headline.
- Amount uses numeric emphasis.
- Instructions use short body copy.
- Provider reference uses compact mono style.

Shape:
- Status card has strong containment.
- Rail uses simple lines and dots.
- Error panels use clear icons and text.

Spacing:
- Keep status and action in first viewport.
- Details can sit lower or collapsed.
- Safe-area padding around sticky controls.

Iconography:
- Use provider, phone, check, clock, warning, and review icons only when useful.
- Icons must not replace text.

## Layout Specifications
Base mobile layout:
- Header at top.
- Status card directly below.
- Status rail below status card.
- Instruction panel below rail.
- Amount and reference details below instructions.
- Sticky action bar at bottom.

Small phone:
- Status card and CTA must fit in first viewport.
- Reference details collapse under `Payment details`.
- Rail is vertical and compact.

Large phone:
- Status card can include amount and phone in side-by-side rows.
- Rail may use horizontal layout if labels remain readable.

Tablet:
- Center content column.
- Keep waiting surface compact.

Landscape:
- Reduce vertical spacing.
- Keep status and CTA visible.

## Motion Specifications
Allowed motion:
- Progress indicator while verifying.
- Status rail advances with opacity change.
- App-resume check may show a short status fade.

Disallowed motion:
- No endless decorative loops beyond a standard progress indicator.
- No success animation before confirmed.
- No shaking warning loops.
- No amount animation.

Timing:
- Verification state change: immediate.
- Status transition: 120ms to 180ms.
- Under-review panel entrance: 160ms.

Reduced motion:
- Use static progress text.
- Avoid moving rail transitions.

## Interaction Details
Screen open:
1. Read route and payment cache.
2. Validate pending payment reference.
3. Render waiting state.
4. If app resumed from provider approval, verify once.

Manual verify:
1. Tap `I have approved it` or `Check payment status`.
2. Move to verifying.
3. Call `verify_payment`.
4. Parse response.
5. Route or remain pending.

Auto check:
- Allowed on app resume.
- Allowed after provider return route hands off to processing.
- Optional timed check can run with strict cool-down.
- Do not run aggressive continuous polling.

Leave screen:
- User can view delivery or go home.
- Pending payment reference stays stored.
- No payment is cancelled.

## Polling And Retry Discipline
Default behavior:
- Do not poll continuously by default.
- Verify on user action.
- Verify once on app resume.
- Verify once after provider return.

Optional timed checks:
- Initial automatic check after `10` seconds if user remains on screen.
- Additional checks no more often than every `15` seconds while app is foregrounded.
- Stop automatic checks after a short visible waiting period and offer manual check.

Long pending handling:
- At `5 minutes`, show delayed provider copy.
- At `15 minutes`, strengthen delayed copy and recommend checking delivery later.
- At `30 minutes`, show under-review state.

Reason:
- Backend reconciliation policy uses `5`, `15`, and `30` minute checkpoints.
- UI must not create backend pressure or sender confusion.

## Copy Deck
Header:
- Eyebrow: `Payment step 2 of 3`
- Title: `Waiting for MTN MoMo approval`
- Subtitle: `Approve the prompt on your phone. Kra will verify before dispatch.`

Waiting:
- Title: `Prompt sent`
- Body: `Approve the MTN MoMo prompt on {maskedPayerPhone}.`
- CTA: `I have approved it`

Verifying:
- Title: `Checking payment`
- Body: `Kra is verifying this payment with MTN MoMo.`

Pending:
- Title: `Still waiting for confirmation`
- Body: `MTN MoMo has not confirmed this payment yet. If you approved the prompt, check again soon.`
- CTA: `Check payment status`

Confirmed:
- Title: `Payment confirmed`
- Body: `Opening payment result.`

Failed:
- Title: `Payment failed`
- Body: `Opening recovery options.`

Under review:
- Title: `Payment under review`
- Body: `MTN MoMo has not provided a final result yet. Kra will keep checking and will not dispatch until payment is resolved.`
- CTA: `View review status`

Offline:
- Title: `Connect to check payment`
- Body: `Your payment reference is saved. Reconnect to verify with Kra.`

Timeout:
- Title: `Provider check timed out`
- Body: `MTN MoMo took too long to respond. Do not start another payment yet.`

Error:
- Title: `Could not check payment`
- Body: `The payment may still be pending. Try checking again before starting any recovery.`

## Copy Rules
Tone:
- Calm.
- Precise.
- Protective.
- No blame.

Required terms:
- Use `pending` for unresolved payment.
- Use `confirmed` only after backend verification.
- Use `failed` only after backend verification.
- Use `under review` for unresolved long-pending state.
- Use `dispatch` for the operational gate.

Avoid:
- `Paid` before confirmation.
- `Complete` before confirmation.
- `Receipt`.
- `Try paying again` on processing.
- `Start new payment`.
- `Cash`.
- `Guaranteed`.
- `Instant`.

Localization:
- Keep strings short.
- Avoid idioms.
- Keep provider name centralized.
- Keep time thresholds configurable.

## Request Construction
Build request:
- `deliveryId`: route param.

Do not send:
- Amount.
- Payer phone.
- Provider reference unless backend later requires it.
- Receiver data.
- Package data.

Validation before verify:
- `deliveryId` matches schema.
- Pending payment reference exists or backend can resolve by delivery ID.
- No verify request currently in flight.
- Device is online.

## Response Handling
Valid response:
- Parse with `paymentVerifyResponseSchema`.
- Store `paymentId`.
- Store `providerReference`.
- Store `verificationCheckedAt`.
- Store `paymentStatus`.

Pending response:
- Remain on processing.
- Update last checked timestamp.
- Show manual check after cool-down.

Confirmed response:
- Route to payment result confirmed.

Failed response:
- Route to payment recovery or failed result.

Invalid response:
- Show verification error.
- Do not route.
- Do not mark failed.

No payment exists:
- Show no payment found state.
- Route to payment method.

## Analytics
Events:
- `payment_processing_viewed`
- `payment_processing_manual_check_tapped`
- `payment_verify_started`
- `payment_verify_pending`
- `payment_verify_confirmed`
- `payment_verify_failed`
- `payment_verify_error`
- `payment_processing_under_review_shown`
- `payment_processing_offline_shown`
- `payment_processing_view_delivery_tapped`
- `payment_processing_go_home_tapped`
- `payment_processing_app_resumed`

Required properties:
- `deliveryId`
- `paymentId`
- `provider`
- `checkoutMode`
- `elapsedSecondsSinceInitiated`
- `verificationAttemptCount`
- `paymentStatus`
- `hasProviderReference`
- `errorCode` when available.

Privacy:
- Do not log full payer phone.
- Do not log receiver data.
- Do not log package description.
- Do not log provider authorization secrets.

## Accessibility Requirements
Screen reader:
- Announce pending status on entry.
- Announce progress state changes.
- Announce confirmed, failed, and under-review transitions.
- Manual check button must state that it checks status, not starts payment.

Focus order:
- Header.
- Status card.
- Primary action.
- Status rail.
- Instructions.
- Amount and references.
- Safe exit actions.

Focus management:
- On verification error, move focus to error title.
- On under review, move focus to under-review title.
- On confirmed or failed, next screen owns focus.

Touch targets:
- Manual check meets platform target size.
- Safe exit actions are separated from primary action.

Color:
- Pending, failed, confirmed, and review states require text labels.
- Do not rely on color-only rail changes.

Text scaling:
- Status headline wraps.
- Amount does not truncate.
- Provider reference can wrap or collapse.
- CTA remains readable.

Reduced motion:
- Progress text must work without animation.

## Performance Requirements
Initial render:
- Render from stored payment response.
- Do not block on delivery detail if payment data is available.
- Avoid heavy graphics.

Network:
- One verification request at a time.
- Cool-down between manual checks.
- No initialization calls.

Persistence:
- Store payment response before leaving PaymentMethod.
- Persist last verification status.
- Restore after app resume.

Low bandwidth:
- Keep pending status readable offline.
- Verification requires connection.
- Do not show blank waiting screen while offline.

## Security And Trust Requirements
Do:
- Verify through backend only.
- Preserve provider reference.
- Prevent duplicate initialization.
- Keep pending distinct from confirmed.
- Warn against starting another payment during timeout.
- Keep under-review path visible.

Do not:
- Call `initialize_payment`.
- Call `create_delivery`.
- Show receipt.
- Ask for MoMo PIN inside Kra.
- Mark payment confirmed from client-side assumption.
- Mark payment failed from network error.
- Queue repeated verification calls aggressively.

## Edge Cases
User approves prompt then returns:
- App resume triggers one verification check.
- If pending remains, show pending state.

User never receives prompt:
- Keep waiting state.
- Offer view delivery and payment recovery only after policy-appropriate delay or no-payment state.

Provider callback delayed:
- `verify_payment` may still return pending.
- Show pending, then delayed, then under-review copy based elapsed time.

Payment already confirmed before screen opens:
- First verify returns confirmed.
- Route to result.

Payment failed before screen opens:
- First verify returns failed.
- Route to recovery or result failed state.

No payment exists:
- Show no payment found.
- Route to payment method.

App killed during processing:
- Restore pending response from storage.
- Verify on next open if online.

Device offline:
- Show offline state with saved reference.
- Do not clear pending state.

Verification timeout:
- Show timeout state.
- Do not mark failed.
- Do not start new payment.

## QA Scenarios
Happy confirmed:
1. Enter with pending payment response.
2. Tap `I have approved it`.
3. App calls `verify_payment`.
4. Backend returns `confirmed`.
5. App routes to payment result.

Pending:
1. Backend returns `pending`.
2. Screen stays on processing.
3. Last checked timestamp updates.
4. Manual check becomes available after cool-down.

Failed:
1. Backend returns `failed`.
2. App routes to recovery or failed result.
3. No new payment is started.

Under review:
1. Payment remains pending beyond review threshold.
2. Screen shows under-review copy.
3. App routes to review result on primary action.

Offline:
1. Device is offline.
2. Screen keeps saved payment reference.
3. Verify action disabled.

App resume:
1. User backgrounds app to approve prompt.
2. User returns.
3. App verifies once.
4. Status updates based on response.

Duplicate manual check:
1. Tap check repeatedly.
2. Only one verify request runs.
3. Button stays disabled during request.

No payment found:
1. Backend returns no payment validation error.
2. Screen routes or offers payment method.
3. No initialize call happens on processing.

Large text:
1. Enable largest accessibility text.
2. Status card and CTA remain readable.

Reduced motion:
1. Enable reduced motion.
2. State changes remain clear with text.

## Automated Test Expectations
Unit tests:
- Pending response stays on processing.
- Confirmed response routes to result.
- Failed response routes to recovery.
- Verification error does not mark failed.
- Timeout does not mark failed.
- Under-review threshold renders review state.
- Duplicate verify calls are blocked.
- Initialize payment is never called.

Component tests:
- Waiting state renders amount, provider, and phone target.
- Status rail shows current stage text.
- Manual check disabled while verifying.
- Offline state disables verify action.
- Under-review panel has review CTA.
- No receipt action appears.

E2E tests:
- PaymentMethod to Processing to Result confirmed works.
- Processing pending remains stable.
- Processing failed routes recovery.
- App resume triggers one verify call.
- Offline processing preserves reference.

Coverage requirements:
- Cover waiting, verifying, pending, confirmed, failed, under review, timeout, error, offline, no payment, and app resume.
- Include negative assertions for `initialize_payment` and `create_delivery`.

## Implementation Notes For Claude Code
Build order:
1. Create route shell for `/(sender)/payments/:deliveryId/processing`.
2. Add payment response reader from PaymentMethod.
3. Add status card and rail.
4. Add manual verify mutation.
5. Add app-resume verification.
6. Add cool-down and duplicate-check guard.
7. Add pending, confirmed, failed, and under-review routing.
8. Add offline and timeout states.
9. Add tests.

Do not build:
- Payment method selection.
- Payment initialization.
- Receipt.
- Refund.
- Delivery creation.
- Provider admin reconciliation UI.

Contract boundary:
- PaymentMethod initializes payment.
- PaymentProcessing verifies payment.
- PaymentResult shows outcome.
- PaymentFailedRecovery handles retry.

Data boundary:
- Pending payment response comes from PaymentMethod.
- Verification response comes from backend.
- Under-review UI is derived only from policy threshold or future backend reconciliation state.
- Client cannot decide confirmed status.

## Acceptance Checklist
- `screen-payment-processing` route renders.
- Pending payment reference is visible or recoverable.
- Locked `GHS` amount is visible.
- MTN MoMo provider is visible.
- Manual check calls `verify_payment`.
- `pending` response stays on processing.
- `confirmed` response routes to result.
- `failed` response routes to recovery or failed result.
- Under-review state appears after unresolved threshold.
- App resume triggers one safe verification.
- Offline state preserves payment reference.
- Duplicate manual checks are blocked.
- Screen does not call `initialize_payment`.
- Screen does not call `create_delivery`.
- Screen does not show receipt action.
- Large text does not break layout.
- Reduced motion remains usable.
- Analytics omit full phone and receiver data.

## Final Handoff Summary
Claude Code should build `PaymentProcessing` as the MTN MoMo waiting and verification screen. It must preserve the pending payment reference, call `verify_payment` safely, keep pending distinct from confirmed, route failed payments into recovery, show under-review guidance for long unresolved provider delay, and never initialize a new payment or create a delivery from this screen.
