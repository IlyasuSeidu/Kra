# Payment Result Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PaymentResult` |
| App | `apps/mobile` |
| Route | `/(sender)/payments/:deliveryId/result` |
| Primary test ID | `screen-payment-result` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `verify_payment`, `paymentVerifyRequestSchema`, `paymentVerifyResponseSchema`, payment reconciliation policy, receipt route availability |
| Related routes | `/(sender)/payments/:deliveryId/processing`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/receipts/:deliveryId`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home` |
| Required states | `loading`, `confirmed`, `failed`, `review`, `pending_refresh`, `verification_error`, `delivery_not_found`, `not_authorized`, `offline`, `stale_result`, `receipt_unavailable` |

## Product Job
This screen gives the sender a clear final payment outcome after provider verification or a long unresolved review path. It is where Kra tells the sender what happened, what the delivery can do next, and which action is safe.

The sender should be able to:
- See whether payment is confirmed, failed, or under review.
- See the amount, provider, payment ID, delivery ID, and tracking code when available.
- Understand that dispatch can proceed only after confirmed payment.
- Open receipt only when payment is confirmed.
- Recover payment only when backend says failed.
- View delivery detail from any result state.
- Leave the flow without losing status.
- Refresh status when result context is stale or pending review.

This screen is not payment method selection, payment initialization, live provider waiting, refund request, finance reconciliation admin, delivery editing, station intake, or support chat.

## Audience
Primary audience:
- Senders who just completed payment processing.
- Senders whose payment failed and need safe recovery.
- Senders whose provider status is unresolved and needs review guidance.
- Returning senders opening a payment result from notifications or history.

Secondary audience:
- QA engineers validating outcome routing and copy boundaries.
- Claude Code implementing this route from the spec.
- Support teams explaining payment state to senders.
- Finance reviewers verifying review-state language.

## User State
The sender has already passed through payment method and processing. They need to know whether the delivery can move forward, whether they need to retry payment, or whether Kra is still reconciling the provider result.

The sender may be:
- Relieved after confirmed payment.
- Frustrated by a failed authorization.
- Unsure whether unresolved status means they were charged.
- Looking for a receipt.
- Trying to get back to delivery tracking.
- Returning later after provider delay.

The screen must:
- Be unambiguous about payment status.
- Never show receipt access before confirmation.
- Never offer retry before backend says failed or no active payment exists.
- Never mark pending or review as confirmed.
- Never mark network errors as failed.
- Route users to the correct next step.

## Primary Action
Primary CTA by state:
- Confirmed: `View receipt`
- Failed: `Recover payment`
- Review: `View delivery`
- Pending refresh: `Check status`
- Error: `Try again`

Secondary actions:
- Confirmed: `Track delivery`
- Failed: `View delivery`
- Review: `Go home`
- Error: `View delivery`

CTA behavior:
- `View receipt` routes to `/(sender)/receipts/:deliveryId`.
- `Track delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Recover payment` routes to `/(sender)/payments/:deliveryId/recover`.
- `View delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Check status` calls `verify_payment`.
- `Try again` calls `verify_payment` if a payment reference exists.

CTA disabled conditions:
- Missing `deliveryId`.
- Verification is in flight.
- Device is offline and action requires backend.
- Receipt route is unavailable.

## First Meaningful Value
First meaningful value is reached when the sender sees the payment outcome in the first viewport and knows the next safe action.

The screen creates value by:
- Closing the payment loop.
- Preventing false success after provider uncertainty.
- Making failed-payment recovery explicit.
- Exposing receipt access only when valid.
- Reassuring senders that unresolved provider states are being reviewed.

## Main Tension
Payment result must feel final when the backend is final and careful when the backend is not final. A beautiful success state is dangerous if shown too early, and a failed state is dangerous if based on timeout instead of verification.

The screen must balance:
- Confidence against overclaiming.
- Fast receipt access against final-state proof.
- Recovery urgency against duplicate payment risk.
- Review-state honesty against sender anxiety.
- Rich outcome visuals against clear operational truth.

## Design Brief
User and job:
- An authenticated sender needs the final or review-state outcome of a payment attempt.

Context of use:
- Post-verification, financial, high-trust mobile result page.

Entry point:
- PaymentProcessing after `verify_payment`.
- PaymentProviderReturn after normalized provider return.
- Payment history or delivery detail when status must be rechecked.

Success state:
- Sender sees confirmed payment and can open receipt or delivery detail.

Primary action:
- Outcome-specific next step.

Navigation model:
- Payment flow step 3 of 3: method, processing, result.

Density:
- Big outcome header, compact proof details, then next actions.

Visual thesis:
- A financial outcome certificate: strong status, proof reference, and one safe next action.

Restraint rule:
- Avoid provider dashboards, raw webhook data, refund forms, delivery operations, or retry payment controls in confirmed/review states.

Product lens:
- Trust-critical final outcome surface.

System stance:
- Native result screen with exact status semantics and strong accessibility.

Interaction thesis:
- The page answers "What happened?", "Can the delivery move?", and "What should I do next?"

Signature move:
- Outcome card changes material by state: confirmed certificate, failed recovery notice, review holding pattern.

Activation event:
- Sender taps the state-appropriate primary action.

## Elite Quality Gate
This spec is not closed unless the screen cannot confuse confirmed, failed, and review states.

Non-negotiable quality requirements:
- First viewport must show payment status.
- First viewport must show amount and provider when available.
- Confirmed state must show receipt CTA.
- Failed state must show recovery CTA.
- Review state must explain that dispatch waits for resolution.
- Receipt CTA must not appear for failed or review states.
- Recovery CTA must not appear for confirmed or review states.
- The screen may call `verify_payment` only for refresh or missing result.
- The screen must not call `initialize_payment`.
- The screen must not call `create_delivery`.
- The screen must not mark network errors as failed.
- The screen must not mark pending review as confirmed.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If receipt appears for non-confirmed status, the screen remains open.
- If failed payment copy suggests the package can dispatch, the screen remains open.
- If review state has no next step, the screen remains open.
- If retry payment starts on this screen, the screen remains open.
- If status relies on color alone, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear feedback, result states, and avoiding misleading transactional success.
- Material Design 3 status, button, card, and snackbar guidance supports clear outcome surfaces and action hierarchy.
- W3C WCAG guidance supports status messages, error identification, focus management, and accessible recovery actions.
- Baymard checkout research reinforces that payment confirmation, failure, and recovery should be explicit and not hidden in generic confirmation copy.
- Kra payment policy says failed payments block dispatch, confirmed payments surface receipts, and unresolved payments show under-review guidance.
- Kra API contracts define `paymentVerifyResponseSchema` with `pending`, `confirmed`, and `failed`.
- Kra reconciliation policy defines long-pending unresolved payment review.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/snackbar/overview
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://baymard.com/checkout-usability
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- MTN MoMo is the only active payment provider.
- PaymentProcessing normally passes the latest verification response into this screen.
- `paymentVerifyResponseSchema.paymentStatus` is `pending`, `confirmed`, or `failed`.
- `review` is a user-facing result state derived from long unresolved pending status or future reconciliation flags.
- Confirmed payments can show receipt entry point.
- Failed payments route to recovery.
- Review-state payments do not allow dispatch and do not allow immediate retry from this screen.
- Receipts live on a separate `SenderReceiptDetail` route.
- Payment recovery lives on `PaymentFailedRecovery`.

## Backend Contract
Primary dependency:
- Verification response from PaymentProcessing or PaymentProviderReturn.

Refresh operation:
- `verify_payment`

HTTP:
- `POST /v1/payments/verify`

Request schema:
- `paymentVerifyRequestSchema`

Response schema:
- `paymentVerifyResponseSchema`

Response interpretation:
- `confirmed`: confirmed result.
- `failed`: failed result.
- `pending`: pending refresh or review result depending elapsed time and reconciliation policy.

Must not call:
- `initialize_payment`
- `create_delivery`
- refund endpoints
- admin reconciliation endpoints

Allowed route actions:
- Receipt detail.
- Payment recovery.
- Sender delivery detail.
- Sender home.

## Data Read Model
Read from route:
- `deliveryId`
- Optional outcome query: `confirmed`, `failed`, `review`, or `pending`.

Read from route state or cache:
- `paymentId`
- `provider`
- `providerReference`
- `paymentStatus`
- `verificationCheckedAt`
- `amountGhs`
- `trackingCode`
- `initiatedAt`
- `underReviewReason`

Read from backend:
- `verify_payment` only if result state is missing, stale, pending, or user taps refresh.

Write locally:
- Result viewed timestamp.
- Last shown payment status.
- Receipt CTA viewed flag.
- Recovery CTA viewed flag.
- Review state acknowledgement.

Write remotely:
- None except optional verification refresh.

Do not write:
- New payment initialization.
- Delivery state.
- Refund request.
- Receipt generation.

## Route Entry Conditions
Normal entry:
- `deliveryId` exists.
- Verification response exists.
- Payment status is known.

Refresh entry:
- `deliveryId` exists.
- Result status missing or stale.
- Screen calls `verify_payment`.

Blocked entry:
- Missing `deliveryId`.
- Sender unauthorized.
- Delivery not found.
- No payment exists and no recovery route state exists.

Blocked UI:
- Show safe error.
- Do not show receipt.
- Do not show recovery unless no payment exists or failed state is known.

## Information Architecture
Top-level structure:
1. Result header.
2. Outcome card.
3. Payment proof details.
4. Delivery gate note.
5. Primary action area.
6. Secondary actions.

Required first viewport by status:
- Confirmed: `Payment confirmed`, amount, receipt CTA.
- Failed: `Payment failed`, amount, recovery CTA.
- Review: `Payment under review`, no dispatch note, delivery CTA.

Why this order:
- Status is the decision.
- Amount and provider prove which payment is referenced.
- Gate note explains delivery impact.
- CTA gives safe next action.

## Result Header
Confirmed:
- Eyebrow: `Payment complete`
- Title: `Payment confirmed`
- Subtitle: `Kra verified your MTN MoMo payment. Your delivery can move to the next operational step.`

Failed:
- Eyebrow: `Payment not completed`
- Title: `Payment failed`
- Subtitle: `MTN MoMo did not confirm this payment. You can recover without creating another delivery.`

Review:
- Eyebrow: `Payment pending review`
- Title: `Payment under review`
- Subtitle: `Provider confirmation is delayed. Kra will not dispatch until payment is resolved.`

Pending refresh:
- Eyebrow: `Checking payment`
- Title: `Confirming latest status`
- Subtitle: `Kra is checking the latest MTN MoMo result.`

Rules:
- Status words must be literal.
- No generic celebration for failed or review states.
- Confirmed is the only state that can feel celebratory.

## Outcome Card
Fields:
- Payment status.
- Amount.
- Provider.
- Payment ID.
- Provider reference.
- Verification checked time.
- Delivery ID.

Confirmed visual:
- Strong success icon.
- Green or success token.
- Certificate-like card.

Failed visual:
- Clear failed icon.
- Error token with restrained treatment.
- Recovery-focused card.

Review visual:
- Clock or review icon.
- Amber or neutral caution token.
- Holding-pattern card.

Rules:
- Text label must identify status.
- Amount must be visible when known.
- Provider reference can be collapsed under details.
- Do not expose provider secrets.
- Do not show receiver data.

## Delivery Gate Note
Confirmed:
- Title: `Dispatch can continue`
- Body: `Station and transport actions can proceed after operational checks.`

Failed:
- Title: `Dispatch is blocked`
- Body: `Kra cannot dispatch this delivery until payment is confirmed.`

Review:
- Title: `Dispatch waits for review`
- Body: `Kra is checking provider records before allowing this delivery to move.`

Rules:
- Always visible.
- Must not imply manual bypass.
- Must align with payment-before-dispatch policy.

## Primary Actions
Confirmed:
- Primary: `View receipt`
- Secondary: `Track delivery`
- Tertiary: `Go home`

Failed:
- Primary: `Recover payment`
- Secondary: `View delivery`
- Tertiary: `Go home`

Review:
- Primary: `View delivery`
- Secondary: `Go home`
- Optional: `Check status` when refresh is available.

Pending refresh:
- Primary disabled while checking.
- Secondary: `View delivery`

Rules:
- Receipt action only appears for confirmed.
- Recovery action only appears for failed.
- Review does not offer new payment.
- All actions must preserve delivery ID.

## Receipt Entry Rules
Show receipt CTA only when:
- `paymentStatus=confirmed`.
- `paymentId` exists.
- `deliveryId` exists.

Do not show receipt CTA when:
- `paymentStatus=failed`.
- Result is review.
- Result is pending.
- Verification failed due to network.
- Payment state is unknown.

Receipt route:
- `/(sender)/receipts/:deliveryId`

If receipt route is unavailable:
- Show `Receipt is being prepared`.
- Primary becomes `Track delivery`.
- Provide `View receipt later from delivery details.`

## Recovery Entry Rules
Show recovery CTA only when:
- `paymentStatus=failed`.
- Delivery is still payable.
- No confirmed payment exists.

Do not show recovery CTA when:
- Payment is confirmed.
- Payment is under review.
- Payment status is unknown.
- Delivery is cancelled.

Recovery route:
- `/(sender)/payments/:deliveryId/recover`

## Review State Rules
Use review state when:
- Payment remained pending beyond policy threshold.
- PaymentProcessing passed review context.
- Future backend state exposes reconciliation review requirement.

Review copy must:
- Say provider confirmation is delayed.
- Say dispatch waits.
- Say Kra is checking.
- Avoid blaming sender.

Review copy must not:
- Say payment failed.
- Say payment confirmed.
- Offer retry payment.
- Promise exact resolution time unless backend policy provides one.

## Component Inventory
Required components:
- `PaymentResultHeader`
- `PaymentOutcomeCard`
- `PaymentProofDetails`
- `PaymentDeliveryGateNote`
- `PaymentResultActionStack`
- `PaymentResultRefreshBanner`
- `PaymentResultErrorCallout`
- `PaymentReviewPanel`

Reusable component requirements:
- Components must accept status enum.
- Components must expose test IDs.
- Components must support long provider reference.
- Components must work in light and dark themes.
- Components must handle missing optional fields safely.

## Test IDs
Screen:
- `screen-payment-result`

Header:
- `payment-result-header`
- `payment-result-status-title`
- `payment-result-status-subtitle`

Outcome:
- `payment-result-outcome-card`
- `payment-result-status`
- `payment-result-amount`
- `payment-result-provider`
- `payment-result-payment-id`
- `payment-result-provider-reference`
- `payment-result-checked-at`

Gate:
- `payment-result-delivery-gate-note`

Actions:
- `payment-result-view-receipt`
- `payment-result-track-delivery`
- `payment-result-recover-payment`
- `payment-result-view-delivery`
- `payment-result-go-home`
- `payment-result-check-status`

States:
- `payment-result-loading`
- `payment-result-confirmed`
- `payment-result-failed`
- `payment-result-review`
- `payment-result-pending-refresh`
- `payment-result-verification-error`
- `payment-result-offline`

## State Model
States:
- `loading`
- `confirmed`
- `failed`
- `review`
- `pending_refresh`
- `verification_error`
- `delivery_not_found`
- `not_authorized`
- `offline`
- `stale_result`
- `receipt_unavailable`

Initial resolution:
- Read route and cached verification response.
- If response exists, render mapped result state.
- If response missing or stale, call `verify_payment`.
- If offline and no result exists, render offline.

Mapping:
- `paymentStatus=confirmed` maps to confirmed.
- `paymentStatus=failed` maps to failed.
- `paymentStatus=pending` maps to pending refresh or review based elapsed policy.
- Explicit review context maps to review.

## Loading State
Use when:
- Result context is being restored.
- Verification refresh is in flight.

Layout:
- Header skeleton.
- Outcome card skeleton.
- Actions disabled.

Copy:
- Title: `Checking payment result`
- Body: `Kra is loading the latest payment status.`

Rules:
- Do not show receipt.
- Do not show recovery.
- Do not initialize payment.

## Confirmed State
Use when:
- `verify_payment` returns `confirmed`.
- Cached response is confirmed and not stale.

Required content:
- Payment confirmed header.
- Amount.
- Provider.
- Payment ID.
- Verification checked time.
- Delivery gate note.
- Receipt CTA.
- Track delivery CTA.

Rules:
- Receipt CTA visible.
- Recovery CTA hidden.
- Dispatch copy may say operations can proceed.
- Do not show refund entry here.

## Failed State
Use when:
- `verify_payment` returns `failed`.
- Cached response is failed and not stale.

Required content:
- Payment failed header.
- Amount when known.
- Provider.
- Payment ID or provider reference when available.
- Dispatch blocked note.
- Recovery CTA.
- View delivery CTA.

Rules:
- Receipt CTA hidden.
- Recovery CTA visible.
- Do not auto retry.
- Do not initialize payment here.

## Review State
Use when:
- Processing passed review context.
- Pending has exceeded policy threshold.
- Future backend reconciliation flag exists.

Required content:
- Under-review header.
- Amount when known.
- Provider.
- Payment reference.
- Dispatch waits note.
- View delivery CTA.
- Go home CTA.
- Optional check status CTA.

Rules:
- Receipt CTA hidden.
- Recovery CTA hidden.
- Do not initialize payment.
- Do not call failed.
- Provide calm follow-up path.

## Pending Refresh State
Use when:
- `verify_payment` returns pending but review threshold has not passed.
- User landed here directly while status still pending.

Layout:
- Checking or pending outcome card.
- Primary: `Check status`.
- Secondary: `View delivery`.

Rules:
- Do not show final result language.
- Do not show receipt.
- Do not show recovery unless backend later returns failed.

## Verification Error State
Use when:
- Refresh fails.
- Response cannot be parsed.

Copy:
- Title: `Could not refresh result`
- Body: `The payment may still be pending. Try again or view the delivery.`
- Primary: `Try again`
- Secondary: `View delivery`

Rules:
- Do not change last known confirmed or failed status unless backend says so.
- Do not mark failed on network error.

## Offline State
Use when:
- No cached result exists and device is offline.
- User requests refresh while offline.

Copy:
- Title: `Connect to refresh payment`
- Body: `Kra needs a connection to check the latest provider status.`
- Primary: `Try again when online`
- Secondary: `View delivery`

Rules:
- If cached confirmed or failed result exists, render it with stale banner instead of blank offline.
- Do not initialize payment.

## Stale Result State
Use when:
- Cached result exists but is older than freshness policy.
- Device cannot refresh immediately.

Layout:
- Show cached state.
- Add banner: `Last checked {relativeTime}.`
- Provide refresh action if online.

Rules:
- Confirmed cached state can still show receipt if backend had confirmed earlier.
- Failed cached state can still show recovery if backend had failed earlier.
- Review cached state should recommend checking later.

## Receipt Unavailable State
Use when:
- Payment is confirmed.
- Receipt route or receipt data is not yet available.

Copy:
- Title: `Receipt is being prepared`
- Body: `Your payment is confirmed. The receipt will appear in delivery details shortly.`
- Primary: `Track delivery`
- Secondary: `Go home`

Rules:
- Do not hide payment confirmed status.
- Do not show failed or review copy.

## Visual System Direction
Visual thesis:
- Outcome clarity with operational seriousness. Confirmed can feel rewarding; failed and review must feel recoverable and safe.

Color:
- Confirmed: success green with high contrast.
- Failed: accessible red with restrained surface.
- Review: amber or neutral caution.
- Background: app surface, not a marketing gradient.

Typography:
- Status headline large and literal.
- Amount and provider reference use numeric and mono styles.
- Supporting copy stays short.

Shape:
- Outcome card uses strong status-specific border or header band.
- Details use compact rows.
- Actions stack vertically on mobile.

Iconography:
- Confirmed: check.
- Failed: alert.
- Review: clock or magnifier.
- Icons must be paired with labels.

## Layout Specifications
Base mobile layout:
- Result header.
- Outcome card.
- Delivery gate note.
- Proof details.
- Action stack.

Small phone:
- Status and primary CTA fit in first viewport.
- Proof details collapse under disclosure.
- Actions remain touch-friendly.

Large phone:
- Outcome card can include amount and status in two columns.
- Details remain readable.

Tablet:
- Center content column.
- Do not stretch result card too wide.

Landscape:
- Reduce vertical spacing.
- Keep status and primary CTA visible.

## Motion Specifications
Allowed motion:
- Confirmed state may use one short check reveal after backend confirmation.
- Failed and review states use no celebratory animation.
- Outcome card can fade in.

Disallowed motion:
- No confetti.
- No long loops.
- No shaking failure animation.
- No animated amount.

Timing:
- Outcome entrance: 160ms to 220ms.
- Error callout: immediate or 120ms opacity.

Reduced motion:
- Use static status changes.

## Interaction Details
Screen open with result:
1. Read route result context.
2. Map status.
3. Render outcome.

Screen open without result:
1. Call `verify_payment` if online.
2. Map response.
3. Render outcome.

Refresh:
1. Tap `Check status` or `Try again`.
2. Call `verify_payment`.
3. Update outcome only from parsed response.

Confirmed action:
1. Tap `View receipt`.
2. Route to receipt detail.

Failed action:
1. Tap `Recover payment`.
2. Route to recovery.

Review action:
1. Tap `View delivery`.
2. Route to delivery detail with review status visible there.

## Copy Deck
Confirmed:
- Title: `Payment confirmed`
- Body: `Kra verified your MTN MoMo payment. Your delivery can move to the next operational step.`
- Gate title: `Dispatch can continue`
- Gate body: `Station and transport actions can proceed after operational checks.`
- Primary: `View receipt`
- Secondary: `Track delivery`

Failed:
- Title: `Payment failed`
- Body: `MTN MoMo did not confirm this payment. You can recover without creating another delivery.`
- Gate title: `Dispatch is blocked`
- Gate body: `Kra cannot dispatch this delivery until payment is confirmed.`
- Primary: `Recover payment`
- Secondary: `View delivery`

Review:
- Title: `Payment under review`
- Body: `Provider confirmation is delayed. Kra will not dispatch until payment is resolved.`
- Gate title: `Dispatch waits for review`
- Gate body: `Kra is checking provider records before allowing this delivery to move.`
- Primary: `View delivery`
- Secondary: `Go home`

Pending refresh:
- Title: `Confirming latest status`
- Body: `Kra is checking the latest MTN MoMo result.`
- Primary: `Check status`

Error:
- Title: `Could not refresh result`
- Body: `The payment may still be pending. Try again or view the delivery.`

Receipt unavailable:
- Title: `Receipt is being prepared`
- Body: `Your payment is confirmed. The receipt will appear in delivery details shortly.`

## Copy Rules
Tone:
- Literal.
- Calm.
- Accountable.
- State-specific.

Required terms:
- `Payment confirmed`
- `Payment failed`
- `Payment under review`
- `Dispatch`
- `Receipt`
- `Recover payment`

Avoid:
- `All done` unless payment is confirmed and receipt route is ready.
- `Paid` without verified confirmation.
- `Try again` as payment retry in review state.
- `Cash`.
- `Guaranteed`.
- `Instant`.

Localization:
- Keep status headings short.
- Avoid idioms.
- Keep provider and currency centralized.

## Request Construction
Refresh request:
- `deliveryId` only.

Do not send:
- Amount.
- Payer phone.
- Provider reference.
- Receiver data.
- Package data.

Validation:
- `deliveryId` matches schema.
- No verification request already in flight.
- Device online.

## Response Handling
Valid response:
- Parse with `paymentVerifyResponseSchema`.
- Map to result state.
- Store status and checked time.

Confirmed:
- Show receipt CTA.
- Update cached payment status.

Failed:
- Show recovery CTA.
- Update cached payment status.

Pending:
- Show pending refresh or review based policy threshold.
- Do not show receipt or recovery.

Invalid response:
- Show verification error.
- Keep last safe status if available.

## Analytics
Events:
- `payment_result_viewed`
- `payment_result_confirmed_viewed`
- `payment_result_failed_viewed`
- `payment_result_review_viewed`
- `payment_result_refresh_tapped`
- `payment_result_refresh_succeeded`
- `payment_result_refresh_failed`
- `payment_result_view_receipt_tapped`
- `payment_result_recover_payment_tapped`
- `payment_result_track_delivery_tapped`
- `payment_result_go_home_tapped`

Required properties:
- `deliveryId`
- `paymentId`
- `provider`
- `paymentStatus`
- `amountGhs`
- `verificationCheckedAt`
- `isStale`
- `hasReceiptCta`
- `hasRecoveryCta`
- `errorCode` when available.

Privacy:
- Do not log payer phone.
- Do not log receiver data.
- Do not log package description.
- Do not log provider secrets.

## Accessibility Requirements
Screen reader:
- Announce result status on entry.
- Announce amount with currency.
- Announce whether dispatch can continue or is blocked.
- Announce errors assertively.

Focus order:
- Status header.
- Outcome card.
- Delivery gate note.
- Primary CTA.
- Secondary actions.
- Proof details.

Focus management:
- On confirmed, focus status title.
- On failed, focus status title.
- On review, focus status title.
- On refresh error, focus error title.

Touch targets:
- Primary and secondary actions meet platform target size.
- Action stack spacing prevents accidental taps.

Color:
- Status cannot rely on color alone.
- Confirmed, failed, and review must have text labels and icons.

Text scaling:
- Status title wraps.
- Amount does not truncate.
- Provider reference can wrap or collapse.
- CTA remains readable.

Reduced motion:
- No essential meaning depends on animation.

## Performance Requirements
Initial render:
- Render from cached result when available.
- Verify only when needed.
- Avoid heavy visuals.

Network:
- One refresh request at a time.
- Do not initialize payment.
- Do not poll continuously.

Persistence:
- Store last safe status.
- Store checked timestamp.
- Preserve result after app restart.

Low bandwidth:
- Cached final result should render offline.
- Refresh requires connection.

## Security And Trust Requirements
Do:
- Trust backend verification only.
- Keep dispatch gate copy visible.
- Restrict receipt CTA to confirmed.
- Restrict recovery CTA to failed.
- Preserve payment IDs for support.

Do not:
- Call `initialize_payment`.
- Call `create_delivery`.
- Show receipt for failed or review.
- Offer retry payment in review state.
- Treat network error as failed.
- Treat pending as confirmed.
- Expose provider authorization secrets.

## Edge Cases
Result route opened directly:
- If online, call `verify_payment`.
- If offline, show cached result or offline state.

Payment became confirmed after review:
- Refresh maps to confirmed.
- Show receipt CTA.

Payment became failed after review:
- Refresh maps to failed.
- Show recovery CTA.

Receipt route unavailable:
- Show receipt unavailable state.
- Keep confirmed status visible.

Cached failed result later confirmed:
- Backend refresh wins.
- Update to confirmed.

Cached confirmed result:
- Do not downgrade unless backend returns a trusted different final status and product policy defines conflict handling.
- If conflict appears, route to review state and capture telemetry.

No payment exists:
- Show error and route to payment method only if safe.
- Do not initialize from result.

## QA Scenarios
Confirmed:
1. Enter with `paymentStatus=confirmed`.
2. See confirmed status.
3. Receipt CTA appears.
4. Recovery CTA does not appear.

Failed:
1. Enter with `paymentStatus=failed`.
2. See failed status.
3. Recovery CTA appears.
4. Receipt CTA does not appear.

Review:
1. Enter with review context.
2. See under-review status.
3. Dispatch wait copy appears.
4. Receipt and recovery CTAs do not appear.

Pending refresh:
1. Enter with pending and no review threshold.
2. Tap check status.
3. App calls `verify_payment`.
4. UI maps response.

Refresh error:
1. Refresh fails.
2. Error state appears.
3. Last safe status remains if available.

Offline cached confirmed:
1. Open offline with cached confirmed response.
2. Confirmed result renders.
3. Refresh is disabled.

Receipt unavailable:
1. Confirmed state but receipt route unavailable.
2. Show receipt preparing copy.
3. Track delivery remains available.

Large text:
1. Enable largest accessibility text.
2. Status, amount, and actions remain readable.

Reduced motion:
1. Enable reduced motion.
2. Result remains clear without animation.

## Automated Test Expectations
Unit tests:
- Confirmed maps to receipt CTA.
- Failed maps to recovery CTA.
- Pending maps to refresh or review based threshold.
- Review hides receipt and recovery CTAs.
- Refresh calls `verify_payment`.
- Network error does not mark failed.
- Result screen never calls `initialize_payment`.
- Result screen never calls `create_delivery`.

Component tests:
- Confirmed card renders correct gate copy.
- Failed card renders blocked gate copy.
- Review card renders dispatch wait copy.
- Proof details handle missing provider reference.
- Receipt unavailable state preserves confirmed status.

E2E tests:
- Processing confirmed routes to result then receipt.
- Processing failed routes to result then recovery.
- Review result routes to delivery detail.
- Direct result route refreshes status.
- Offline cached result renders.

Coverage requirements:
- Cover confirmed, failed, review, pending refresh, verification error, offline, stale result, and receipt unavailable.
- Include negative assertions for `initialize_payment` and `create_delivery`.

## Implementation Notes For Claude Code
Build order:
1. Create route shell for `/(sender)/payments/:deliveryId/result`.
2. Add result state reader.
3. Add status mapping.
4. Add outcome card.
5. Add delivery gate note.
6. Add action stack.
7. Add refresh verify mutation.
8. Add stale/offline/error handling.
9. Add tests.

Do not build:
- Payment initialization.
- Payment processing wait loop.
- Refund request.
- Receipt detail itself.
- Admin reconciliation.
- Delivery operations.

Contract boundary:
- PaymentProcessing produces verification outcome.
- PaymentResult displays outcome and routes.
- ReceiptDetail shows receipt.
- PaymentFailedRecovery handles retry.

Data boundary:
- Backend verification is authoritative.
- Review is non-final unless backend later exposes final state.
- Receipt action requires confirmed status.
- Recovery action requires failed status.

## Acceptance Checklist
- `screen-payment-result` route renders.
- Confirmed state shows receipt CTA.
- Failed state shows recovery CTA.
- Review state shows dispatch wait guidance.
- Receipt CTA hidden for failed and review.
- Recovery CTA hidden for confirmed and review.
- Refresh calls `verify_payment` only.
- Screen does not call `initialize_payment`.
- Screen does not call `create_delivery`.
- Network errors do not become failed status.
- Pending does not become confirmed without backend response.
- Large text does not break layout.
- Reduced motion remains usable.
- Analytics omit personal data.

## Final Handoff Summary
Claude Code should build `PaymentResult` as the exact payment outcome screen. It must clearly separate confirmed, failed, and under-review states, show receipt access only after confirmed payment, route failed payments to recovery, keep review states honest, and never initialize a new payment or create a delivery from this route.
