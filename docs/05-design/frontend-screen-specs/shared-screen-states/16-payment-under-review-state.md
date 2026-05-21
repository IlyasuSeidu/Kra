# Payment Under Review State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `payment_under_review` |
| Component family | Shared screen state |
| Primary component | `SharedPaymentUnderReviewState` |
| Supporting components | `PaymentReviewStatusPanel`, `PaymentReviewTimeline`, `PaymentProviderStatusCard`, `PaymentTransportLockNotice`, `PaymentReviewActions`, `PaymentReviewSlaBadge`, `PaymentReviewPrivacyNotice`, `PaymentReviewRouteBridge` |
| Primary surfaces | sender mobile app, operations mobile app, admin finance console, support workflow, launch readiness |
| Required recovery | show review status, refresh payment, open sender result, open support, open finance reconciliation, open payment detail, or open blocked delivery |
| Test id root | `state-payment-under-review` |
| Backend coverage | payment `pending`, reconciliation checkpoints, `reconciliationReviewRequiredAt`, `reconciliationReviewReason`, `GET /v1/admin/payment-reconciliation`, `PAYMENT_REQUIRED`, webhook `accepted_pending`, provider verification errors |
| Browser mutation operation | None directly; this state is read-only and must never confirm, fail, refund, or replay payment by itself |
| Data sensitivity | payment ID, provider reference, payer phone, amount, provider status, reconciliation reason, review deadline, delivery ID, sender identity |
| Offline critical | Yes for operations because transport must remain blocked; sender review copy can show cached status but cannot confirm payment offline |
| Related inventory state | `payment_under_review` |
| Related state specs | blocked by payment, manual review required, refund pending, webhook conflict, stale data, offline, error, not authorized, session expired |
| Design tokens | `payment.blue.700`, `payment.amber.700`, `payment.red.700`, `payment.green.700`, `neutral.950`, `neutral.700`, `neutral.500`, `surface`, spacing `4-40`, radius `10-18`, motion `review-fade-140` |
| Accessibility target | WCAG 2.2 AA equivalent with clear review status, non-color status markers, announced refresh results, and predictable focus order |

## Purpose
`SharedPaymentUnderReviewState` is the shared UI state shown when Kra cannot treat a payment as confirmed or failed because the provider result is unresolved and the record is waiting for automated reconciliation, finance review, or provider verification recovery.

This state is not a backend payment status. The backend payment status remains one of:

- `pending`
- `confirmed`
- `failed`
- `refund_pending`
- `refunded`

The UI derives `payment_under_review` from pending payment records with review context, unresolved verification, delayed callback, or reconciliation review metadata.

The most important rule is:

```text
Payment under review does not authorize transport, dispatch, final-mile movement, refund, or receipt success.
```

## Product Job
Kra must keep users informed while payment truth is unresolved. The sender needs to know that Kra is checking the provider result and that they should not start duplicate payment attempts. Operations needs to know that package movement remains blocked. Finance needs to know where to review unresolved records.

The payment under review state must:

- show that payment is not confirmed yet
- avoid treating provider uncertainty as failure
- avoid treating provider uncertainty as success
- prevent duplicate payment retry while the active payment is under review
- keep transport and final-mile actions blocked
- explain the reconciliation timeline
- show the right review owner and target time
- route finance admins to reconciliation
- route senders to review status or support
- route operations to payment detail or sender contact path
- protect provider references, payer phone, and internal reconciliation error detail
- distinguish unresolved provider results from failed payment, refund pending, and webhook conflict

## Strategic Role
Payment under review is a trust-preserving waiting state. Without it, the product would either fail too early and cause duplicate charges, or confirm too early and move packages before money is verified.

The state protects three things:

- sender trust, by avoiding duplicate-charge pressure
- operational discipline, by blocking transport until verified
- finance integrity, by routing unresolved provider state to review

The design must make uncertainty explicit without sounding careless. The user should feel that Kra has the payment record, is checking it, and will update the delivery only when provider and backend evidence agree.

## Design Brief
Audience:

- Sender waiting for a payment result, operators blocked by unresolved payment, and finance admins reviewing unresolved payment records.

Surface type:

- Shared financial state panel embedded in payment, delivery, operations, admin, and launch-readiness surfaces.

Primary action:

- Refresh review status or open the responsible review route.

Visual thesis:

- `Financial holding pattern`: a calm, clocked review surface with provider status, review owner, transport lock, and clear next route.

Restraint rule:

- Do not offer retry payment, receipt, dispatch, refund settlement, provider replay, or manual status mutation from this state.

Density:

- Sender view is concise. Finance view is evidence-rich. Operations view prioritizes the transport lock.

Platform stance:

- Mobile-first for sender and ops, table-adjacent compact panel for admin finance.

## External Research Used
Only directly relevant payment verification, asynchronous payment, mobile-money, and accessibility references were used:

- [Stripe PaymentIntent lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle): supports explicit payment lifecycle states and the need to wait during asynchronous processing before fulfillment.
- [Paystack verify payments](https://paystack.com/docs/payments/verify-payments/): supports server-side verification, separate transaction status values, and avoiding double fulfillment when webhooks and verification both exist.
- [MTN MoMo API collections overview](https://momodeveloper.mtn.com/API-collections): supports MTN MoMo collections as the provider family used by Kra's v1 payment path.
- [MTN MoMo developer community status guidance](https://momodevelopercommunity.mtn.com/product-updates/momo-api-error-response-enrichment-186): supports successful, pending, and failed transaction status interpretation for MoMo status checks.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports showing cached local data while keeping write authority explicit.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for refresh, waiting, review, and status changes.
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear explanation when attempted transport or retry is blocked.
- [WCAG 2.2 focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through review status, timeline, and actions.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable mobile actions for refresh and support.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/paystack-flow.md`
- `docs/09-payments/hubtel-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/06-architecture/backend-architecture.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/design-system.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/08-blocked-by-payment-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/10-manual-review-required-state.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/13-payment-processing.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/16-payment-failed-recovery.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/24-admin-payment-reconciliation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/25-admin-payment-reconciliation-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/36-admin-webhook-events.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/20-replay-webhook-modal.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`
- `services/api/src/payment-reconciliation.ts`
- `services/api/src/payment-webhooks.ts`
- `services/api/src/app.ts`

## Backend Contract
Primary sender payment status sources:

- initialized payment response
- verify payment response
- delivery detail payment status

Primary finance route:

- `GET /v1/admin/payment-reconciliation`

Internal reconciliation worker:

- `POST /v1/internal/payments/reconcile-due`

The frontend must not call the internal worker.

Payment status enum:

```ts
type PaymentStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "refund_pending"
  | "refunded";
```

Reconciliation review reasons:

```ts
type PaymentReconciliationReviewReason =
  | "verification_unresolved_after_30_minutes"
  | "provider_verification_error";
```

Admin reconciliation row:

```json
{
  "businessDate": "2026-05-21",
  "provider": "mtn_momo",
  "providerReference": "MTN-REF-8001",
  "paymentId": "PAY-8001",
  "deliveryId": "DEL-8001",
  "quotedAmountGhs": 35,
  "chargedAmountGhs": 0,
  "refundedAmountGhs": 0,
  "internalPaymentStatus": "pending",
  "providerPaymentStatus": "pending",
  "mismatchType": "verification_unresolved_after_30_minutes",
  "reconciliationAttemptCount": 3,
  "initiatedAt": "2026-05-21T08:00:00.000Z",
  "lastReconciliationAt": "2026-05-21T08:30:00.000Z",
  "reviewRequiredAt": "2026-05-21T08:30:00.000Z"
}
```

Review derivation:

- `paymentStatus=pending` with no review metadata means payment is still processing.
- `paymentStatus=pending` plus `nextReconciliationAt` means automated reconciliation is scheduled.
- `paymentStatus=pending` plus `reconciliationAttemptCount` under final threshold means verification is still in progress.
- `paymentStatus=pending` plus `reconciliationReviewRequiredAt` means finance review is required.
- `paymentStatus=pending` plus `reconciliationReviewReason=verification_unresolved_after_30_minutes` maps to unresolved review.
- `paymentStatus=pending` plus `reconciliationReviewReason=provider_verification_error` maps to provider verification error review.

## Local Payment Timeline
Approved v1 reconciliation schedule:

- first unresolved checkpoint at `5 minutes`
- second unresolved checkpoint at `15 minutes`
- third unresolved checkpoint at `30 minutes`
- after the `30 minute` checkpoint, unresolved payments stay `pending`
- after the `30 minute` checkpoint, unresolved payments enter finance review
- finance review target is by `10:00` on the same business day
- unresolved or conflicting provider events must be escalated within the next business day

Timeline UI rules:

- Show exact checkpoint times when supplied by backend.
- Show relative labels only when exact times are missing.
- Do not create an invented countdown after the final checkpoint.
- Do not promise a specific settlement result.
- Do not show retry payment while an active pending payment is under review.

## State Definition
`payment_under_review` is active when payment is unresolved beyond normal processing, or when the payment record has entered reconciliation review.

Canonical triggers:

- active payment remains `pending` after expected provider verification delay
- verification result remains unresolved after automated status checks
- payment has `nextReconciliationAt`
- payment has `reconciliationAttemptCount` greater than `0`
- payment has `reconciliationReviewRequiredAt`
- payment has `reconciliationReviewReason=verification_unresolved_after_30_minutes`
- payment has `reconciliationReviewReason=provider_verification_error`
- admin reconciliation row exists for payment
- webhook processing status is `accepted_pending`
- sender payment processing transitions to `under_review`
- operations attempts transport while payment result is unresolved
- launch readiness finds pending payment reconciliation review

Non-canonical triggers:

- no payment attempt exists
- payment was verified as `failed`
- payment was verified as `confirmed`
- refund is approved but unsettled
- webhook callback conflicts with a final internal state
- user lacks permission to view finance data
- payment provider is unavailable before payment initialization
- payment form validation failed
- delivery is blocked by issue
- session expired
- generic API error

State routing:

- Use `blocked_by_payment` when the core job is to explain why an operational action is blocked by payment.
- Use `payment_under_review` when the core job is to explain unresolved provider status and review progress.
- Use `manual_review_required` for broad non-payment review queues.
- Use `webhook_conflict` for provider callback conflicts with known final state.
- Use `refund_pending` for approved refunds waiting for settlement.
- Use `error` for unknown provider or server failures without review state.

## Supported Variants
| Variant | Trigger | Primary action | Secondary action |
| --- | --- | --- | --- |
| `sender_waiting_for_review` | Sender payment result is unresolved | `Check review status` | `Contact support` |
| `provider_result_pending` | Provider still reports pending | `Refresh status` | `View delivery` |
| `verification_checkpoint_pending` | Automated reconciliation has a next checkpoint | `Refresh status` | `View timeline` |
| `verification_unresolved_after_30_minutes` | Final checkpoint passed unresolved | `View review status` | `Contact support` |
| `provider_verification_error` | Provider verification failed after retry schedule | `View review status` | `Contact support` |
| `finance_review_queue` | Admin reconciliation row exists | `Open reconciliation` | `Copy payment ID` |
| `operations_transport_locked` | Staff action blocked by unresolved payment | `View payment` | `Contact sender` |
| `webhook_pending_signal` | Trusted webhook says pending | `Open webhook events` | `Open reconciliation` |
| `launch_readiness_blocked` | Pilot readiness blocked by payment review backlog | `Open reconciliation` | `View blockers` |
| `stale_review_status` | Review data is cached or stale | `Refresh status` | `Use cached view` |
| `offline_review_status` | Device offline with cached review context | `View cached status` | `Try later` |

## Required Props
```ts
type PaymentUnderReviewVariant =
  | "sender_waiting_for_review"
  | "provider_result_pending"
  | "verification_checkpoint_pending"
  | "verification_unresolved_after_30_minutes"
  | "provider_verification_error"
  | "finance_review_queue"
  | "operations_transport_locked"
  | "webhook_pending_signal"
  | "launch_readiness_blocked"
  | "stale_review_status"
  | "offline_review_status";

type PaymentReviewReason =
  | "verification_unresolved_after_30_minutes"
  | "provider_verification_error"
  | "provider_pending"
  | "callback_delayed"
  | "review_backlog";

type SharedPaymentUnderReviewStateProps = {
  variant: PaymentUnderReviewVariant;
  deliveryId?: string;
  paymentId?: string;
  provider?: "mtn_momo" | "paystack" | "hubtel";
  providerReferenceLabel?: string;
  amountGhs?: number;
  internalPaymentStatus?: "pending" | "confirmed" | "failed" | "refund_pending" | "refunded";
  providerPaymentStatus?: "pending" | "confirmed" | "failed" | "unknown";
  reviewReason?: PaymentReviewReason;
  reconciliationAttemptCount?: number;
  initiatedAt?: string;
  lastReconciliationAt?: string;
  nextReconciliationAt?: string;
  reviewRequiredAt?: string;
  reviewTargetAt?: string;
  reviewedAt?: string;
  reviewedByLabel?: string;
  isOffline?: boolean;
  isStale?: boolean;
  generatedAt?: string;
  actorRole?: "sender" | "station_operator" | "driver" | "final_mile_courier" | "finance_admin" | "support_admin" | "ops_admin" | "super_admin";
  onRefreshStatus?: () => void;
  onOpenPaymentResult?: () => void;
  onOpenDelivery?: () => void;
  onOpenSupport?: () => void;
  onOpenFinanceReconciliation?: () => void;
  onOpenPaymentDetail?: () => void;
  onOpenWebhookEvents?: () => void;
  onCopyPaymentId?: () => void;
};
```

Prop rules:

- `internalPaymentStatus` should be `pending` for active review variants.
- If `internalPaymentStatus=confirmed`, this state should exit to payment confirmed or receipt.
- If `internalPaymentStatus=failed`, this state should exit to failed recovery.
- If `internalPaymentStatus=refund_pending`, this state should exit to `refund_pending`.
- `providerReferenceLabel` must be masked unless actor has finance permission.
- `amountGhs` can be shown to sender, finance, and authorized support.
- `reviewRequiredAt` should appear for finance review variants.
- `nextReconciliationAt` should appear for checkpoint variants.
- `reviewTargetAt` should appear when policy or backend supplies it.
- `generatedAt` should be shown for admin reconciliation data.
- Do not pass payer phone unless host masks it before render.
- Do not pass provider secret, webhook signature, or raw webhook payload.

## Canonical Routes
Sender routes:

- `/(sender)/payments/:deliveryId/processing`
- `/(sender)/payments/:deliveryId/result`
- `/(sender)/payments/:deliveryId/recover`
- `/(sender)/deliveries/:deliveryId`
- `/(sender)/support?deliveryId=:deliveryId&paymentId=:paymentId`

Operations routes:

- `/(ops)/deliveries/:deliveryId`
- `/(ops)/deliveries/:deliveryId/payment`
- `/(ops)/station/support?deliveryId=:deliveryId`
- `/(ops)/blocked-queue?reason=payment`

Admin routes:

- `/admin/finance`
- `/admin/finance/reconciliation`
- `/admin/finance/reconciliation/:paymentId`
- `/admin/deliveries/:deliveryId`
- `/admin/webhook-events`
- `/admin/launch-readiness`

Route rules:

- Sender primary route opens payment result or processing status, not finance admin.
- Finance primary route opens reconciliation queue or detail.
- Operations primary route opens payment status context or blocked queue.
- Webhook pending route opens webhook events only for authorized admins.
- Launch readiness route opens reconciliation queue filtered by blockers.
- No route may call internal reconciliation worker from browser or mobile.

## Information Architecture
The component has six zones:

- Review status header
- Provider and internal status panel
- Review timeline
- Transport lock notice
- Recovery actions
- Privacy and no-duplicate-payment notice

Review status header:

- state title
- provider label
- delivery short reference
- payment short reference when allowed
- generated or refreshed timestamp
- stale/offline badge

Provider and internal status panel:

- internal payment status
- provider payment status
- amount when authorized
- review reason
- attempt count
- last checked time

Review timeline:

- payment initiated
- verification checkpoint one
- verification checkpoint two
- verification checkpoint three
- finance review required
- review target time

Transport lock notice:

- dispatch blocked
- driver pickup blocked
- final-mile movement blocked
- no cash workaround
- no duplicate payment retry

Recovery actions:

- refresh status
- view result
- open reconciliation
- open payment detail
- open delivery
- contact support
- copy payment ID when authorized

Privacy notice:

- provider data is restricted
- payer phone is masked
- no raw webhook payload
- no provider secret
- no browser replay

## Visual Design Standard
Payment under review must feel like a controlled financial hold, not a failure page.

Use:

- blue for active verification
- amber for unresolved review
- red only for provider verification error or transport lock severity
- green only after confirmed payment, which should exit this state
- a timeline with completed checkpoints and current review owner
- clear clock and owner labels
- compact amount display
- role-specific primary action
- muted finance metadata outside sender surfaces

Do not use:

- receipt styling
- success checkmark
- failure illustration
- retry payment button
- dispatch button
- refund button
- provider replay button
- vague `Pending` without explanation
- raw provider error body
- raw webhook body
- unmasked payer phone
- cash instruction

## Layout
Mobile sender layout:

- top status header
- short explanation
- amount and provider card
- review timeline collapsed to current step plus expansion
- sticky action area with refresh and support
- no finance-only identifiers in first viewport

Operations mobile layout:

- transport lock at top
- payment status below
- safe sender contact action where supported
- blocked workflow explanation
- link to support or delivery detail

Admin desktop layout:

- compact panel embeddable beside reconciliation table or detail
- visible provider reference for finance roles
- review reason and attempt count near top
- copy actions for safe identifiers
- no mutation controls

Launch readiness layout:

- summary card with count of payment review blockers
- primary action opens reconciliation
- no row-level provider details unless expanded in finance context

## Component Anatomy
```text
SharedPaymentUnderReviewState
  PaymentReviewStatusHeader
    PaymentReviewBadge
    PaymentReferenceLine
    DataFreshnessChip
  PaymentProviderStatusCard
    InternalStatus
    ProviderStatus
    AmountLine
    ReviewReason
  PaymentReviewTimeline
    Initiated
    Checkpoint5m
    Checkpoint15m
    Checkpoint30m
    FinanceReview
  PaymentTransportLockNotice
  PaymentReviewActions
  PaymentReviewPrivacyNotice
  PaymentReviewLiveRegion
```

Anatomy rules:

- `PaymentTransportLockNotice` appears on operations and delivery surfaces.
- `PaymentReviewTimeline` can be collapsed on small sender screens.
- `PaymentProviderStatusCard` must not show provider reference to unauthorized roles.
- `PaymentReviewActions` receives all callbacks from host.
- `PaymentReviewLiveRegion` announces refresh and state changes.

## Copy System
Primary titles:

- `Payment is under review`
- `Payment still being verified`
- `Provider result is pending`
- `Finance review required`
- `Payment review blocks transport`
- `Payment status needs refresh`
- `Review status available offline`

Primary explanations:

- `Kra has the payment record, but the provider result is not final yet.`
- `We will not dispatch this package until payment is confirmed.`
- `Do not start another payment while this one is under review.`
- `Finance review will compare provider and Kra records before the delivery can move.`
- `This payment is still pending after the automatic checks.`
- `Provider verification had an error and needs review before Kra can decide.`
- `Cached status is shown. Refresh when online before taking action.`

Button labels:

- `Check review status`
- `Refresh status`
- `View payment result`
- `Open reconciliation`
- `Open payment detail`
- `Open delivery`
- `Contact support`
- `Copy payment ID`
- `View blockers`

Do not use:

- `Payment successful`
- `Payment failed`
- `Try another payment`
- `Dispatch anyway`
- `Release package`
- `Force confirm`
- `Override review`
- `Replay callback`
- `Refund now`
- `Collect cash`

## Role-Specific Behavior
Sender:

- Show review status in plain language.
- Show amount and provider.
- Mask payer phone when shown.
- Do not show provider reference by default.
- Do not show finance queue names unless needed.
- Offer refresh, result view, delivery view, and support.
- Do not offer retry while active payment is pending or under review.

Station operator:

- Show transport lock first.
- Show payment not confirmed.
- Show contact sender or support path.
- Do not show provider reference.
- Do not show reconciliation internals.
- Do not allow dispatch, pickup, or release.

Driver:

- Show run cannot start or continue due to payment review.
- Route to assignment refresh or support.
- Do not show amount unless current app policy allows.
- Do not show provider reference.

Final-mile courier:

- Show completion cannot proceed if payment status is not confirmed.
- Route to delivery detail or support.
- Do not offer payment recovery actions.

Finance admin:

- Show provider reference.
- Show payment ID.
- Show delivery ID.
- Show review reason.
- Show attempt count.
- Show last reconciliation time.
- Show generated timestamp.
- Route to reconciliation queue or detail.
- Do not mutate payment state from this shared state.

Support admin:

- Show sender-safe explanation.
- Show masked provider reference if policy allows.
- Route to support case and delivery detail.
- Do not show webhook payload.

Super admin:

- Show finance data according to permission.
- Route to reconciliation, webhook events, launch readiness, or delivery.
- Do not bypass finance review from this state.

## Transport Lock Rules
Blocked actions:

- origin dispatch
- driver pickup
- mark in transit
- destination receipt if policy requires paid state before movement
- final-mile assignment
- out for delivery
- final proof completion
- delivery closure

Allowed actions:

- view delivery
- refresh payment status
- open support
- open finance reconciliation
- open webhook events if authorized
- sender status review
- sender cancellation if a separate policy allows it

Never allowed:

- dispatch while payment is under review
- mark payment confirmed locally
- create receipt locally
- collect cash as workaround
- start duplicate payment while active payment is unresolved
- refund unresolved payment before policy review
- replay webhook from the browser

## Review Owner And SLA
Owner rules:

- unresolved after `30 minutes`: `Finance review`
- provider verification error: `Finance review` plus backend support if repeated
- pending webhook signal: `Finance review`
- launch readiness payment backlog: `Finance review`
- delivery transport blocker: `Operations waits on finance review`

SLA rules:

- automated checkpoints at `5m`, `15m`, and `30m`
- finance review target by `10:00` same business day
- unmatched or conflicting payment events escalated within next business day
- sender copy must avoid promising exact provider settlement if backend lacks exact target

Review labels:

- `Automatic check scheduled`
- `Automatic checks complete`
- `Finance review required`
- `Provider verification error`
- `Review target today`
- `Review target next business day`

## Privacy And Security
Never display:

- provider secret
- webhook shared secret
- webhook signature
- raw webhook payload
- raw provider payload
- full payer phone
- full sender identity on operations surfaces
- bank or wallet account details
- internal task secret
- backend error stack trace
- finance-only CSV on sender surfaces

Allowed display:

- provider label
- masked provider reference for support when policy allows
- full provider reference for finance admins
- amount for sender and finance
- masked payer phone for sender
- payment ID for finance and support
- delivery short reference for operations
- review reason in safe language

## Analytics
Events:

- `payment_under_review_viewed`
- `payment_under_review_refresh_requested`
- `payment_under_review_refresh_result`
- `payment_under_review_open_result`
- `payment_under_review_open_support`
- `payment_under_review_open_reconciliation`
- `payment_under_review_open_delivery`
- `payment_under_review_copy_payment_id`
- `payment_under_review_transport_lock_seen`
- `payment_under_review_variant_changed`

Common event fields:

- `deliveryId`
- `paymentId`
- `surface`
- `actorRole`
- `variant`
- `provider`
- `internalPaymentStatus`
- `providerPaymentStatus`
- `reviewReason`
- `reconciliationAttemptCount`
- `isOffline`
- `isStale`
- `sourceRoute`
- `targetRoute`

Never send:

- full payer phone
- provider secret
- provider payload
- webhook payload
- webhook signature
- raw provider error body
- full sender identity
- full card or wallet data
- support note body

## Accessibility
Semantic structure:

- Component root uses `section`.
- Status title uses host-appropriate heading level.
- Provider and internal statuses are text, not color only.
- Review timeline uses an ordered list.
- Transport lock uses explicit text.
- Refresh results are announced through a polite live region.
- Provider verification error can use assertive announcement only after user action.

Focus order:

- state title
- short explanation
- amount and provider status
- review timeline
- transport lock
- primary action
- secondary actions
- privacy note

Keyboard behavior:

- `Tab` follows visual order.
- `Enter` and `Space` activate buttons.
- Copy actions announce copied status.
- Refresh action returns focus to itself after status update.
- Collapsed timeline expansion is keyboard accessible.

Touch behavior:

- mobile controls should be at least `44px`
- sticky action area must not cover status text
- refresh cannot double-submit while in flight
- support action remains available when refresh fails

Screen reader copy:

- `Payment is under review. Provider result is not final.`
- `Transport is blocked until payment is confirmed.`
- `Automatic checks completed. Finance review is required.`
- `Cached payment review status. Refresh when online.`

## Loading, Refresh, And Stale Data
Initial loading:

- Use shared loading state before payment review data is known.
- Do not show review copy without a payment or delivery reference.
- Do not show retry payment during loading.

Refresh:

- Sender refresh calls the host's safe status refresh or verify endpoint.
- Admin refresh refetches reconciliation rows.
- Operations refresh refetches delivery payment status.
- Disable duplicate refresh while request is in flight.
- Announce success, no change, or transition out of review.

Stale data:

- Show generated or refreshed timestamp.
- Show `Status may have changed`.
- Keep transport lock visible.
- Do not show completion or dispatch action.
- If refreshed state is confirmed, exit this state.
- If refreshed state is failed, route to failed recovery or failed state.

Offline:

- Show cached review state with timestamp.
- Hide or disable refresh if backend unreachable.
- Keep transport lock visible.
- Do not confirm payment offline.
- Do not fail payment offline.
- Do not enqueue payment confirmation.

## Error Mapping
| Backend or product condition | Shared state | Variant | Recovery |
| --- | --- | --- | --- |
| `paymentStatus=pending` after delay | `payment_under_review` | `provider_result_pending` | Refresh status |
| scheduled reconciliation checkpoint exists | `payment_under_review` | `verification_checkpoint_pending` | View timeline |
| `verification_unresolved_after_30_minutes` | `payment_under_review` | `verification_unresolved_after_30_minutes` | View review status |
| `provider_verification_error` | `payment_under_review` | `provider_verification_error` | Contact support or open reconciliation |
| admin reconciliation row exists | `payment_under_review` | `finance_review_queue` | Open reconciliation |
| staff action blocked by unresolved payment | `payment_under_review` or `blocked_by_payment` | `operations_transport_locked` | View payment |
| webhook `accepted_pending` | `payment_under_review` | `webhook_pending_signal` | Open webhook events |
| launch readiness payment review backlog | `payment_under_review` | `launch_readiness_blocked` | Open reconciliation |
| `PAYMENT_REQUIRED` with no review metadata | `blocked_by_payment` | not this state | View payment |
| verified `failed` | `blocked_by_payment` or failed recovery | not this state | Retry when safe |
| verified `confirmed` | confirmed receipt/result | not this state | Continue delivery |
| approved refund unsettled | `refund_pending` | not this state | Show target date |
| conflicting final provider callback | `webhook_conflict` | not this state | Route admin review |
| no permission | `not_authorized` | not this state | Go back |
| offline only | `offline` | not this state unless review-specific cache exists | Retry online |

## State Machine
```text
payment_processing
  -> provider_result_pending
  -> verification_checkpoint_pending
  -> verification_unresolved_after_30_minutes
  -> finance_review_queue
  -> confirmed | failed | support
```

Operational lock:

```text
transport_action_requested
  -> payment_not_confirmed
  -> payment_under_review
  -> refresh_status
  -> confirmed | still_under_review | failed
```

Admin review:

```text
reconciliation_row_created
  -> finance_review_queue
  -> open_reconciliation_detail
  -> finance_decision_outside_shared_state
```

Forbidden transitions:

- `payment_under_review` -> `confirmed` without backend verification
- `payment_under_review` -> `failed` without backend verification
- `payment_under_review` -> `refund_pending` without approved refund workflow
- `payment_under_review` -> transport dispatch
- `payment_under_review` -> duplicate payment retry
- `payment_under_review` -> browser webhook replay

## Host Integration
Sender payment processing host:

- Shows this state after unresolved verification delay.
- Keeps existing pending payment reference.
- Allows status refresh.
- Does not initialize another payment.
- Routes failed result to recovery only after backend says failed.
- Routes confirmed result to receipt only after backend says confirmed.

Sender payment failed recovery host:

- Uses this state when latest status check returns pending or under-review context.
- Hides retry payment CTA.
- Offers review status and support.

Operations delivery detail host:

- Shows transport lock when delivery payment status is unresolved.
- Uses `blocked_by_payment` for broad payment gating.
- Uses `payment_under_review` when the payment specifically has review metadata.

Admin finance reconciliation host:

- Shows this state inside reconciliation row detail.
- Enables safe identifier copy.
- Does not mutate payment state.
- Opens related delivery and webhook events when authorized.

Launch readiness host:

- Shows count of payment review blockers.
- Opens reconciliation queue.
- Does not include provider reference in summary card.

Support host:

- Shows sender-safe review explanation.
- Allows support case creation.
- Does not promise provider outcome.

## Content Rules By Variant
`sender_waiting_for_review`:

- Title: `Payment is under review`
- Body: `Kra has the payment record, but the provider result is not final yet. Do not start another payment for this delivery.`
- Primary: `Check review status`
- Secondary: `Contact support`

`provider_result_pending`:

- Title: `Provider result is pending`
- Body: `The provider has not returned a final result. Kra will keep checking before dispatch.`
- Primary: `Refresh status`
- Secondary: `View delivery`

`verification_checkpoint_pending`:

- Title: `Automatic check scheduled`
- Body: `Kra will check this payment again at the next reconciliation checkpoint.`
- Primary: `Refresh status`
- Secondary: `View timeline`

`verification_unresolved_after_30_minutes`:

- Title: `Finance review required`
- Body: `Automatic checks ended without a final provider result. Finance review will compare provider and Kra records.`
- Primary: `View review status`
- Secondary: `Contact support`

`provider_verification_error`:

- Title: `Provider verification needs review`
- Body: `Kra could not complete provider verification. Finance review is required before the payment can be decided.`
- Primary: `View review status`
- Secondary: `Contact support`

`finance_review_queue`:

- Title: `Payment in reconciliation`
- Body: `This row needs finance review before Kra changes the payment outcome.`
- Primary: `Open reconciliation`
- Secondary: `Copy payment ID`

`operations_transport_locked`:

- Title: `Payment review blocks transport`
- Body: `This package cannot move until payment is confirmed.`
- Primary: `View payment`
- Secondary: `Contact sender`

`webhook_pending_signal`:

- Title: `Provider sent pending status`
- Body: `Kra accepted the pending provider signal. Continue reconciliation before taking payment action.`
- Primary: `Open webhook events`
- Secondary: `Open reconciliation`

`launch_readiness_blocked`:

- Title: `Payment reviews block launch`
- Body: `Pilot readiness remains blocked while payment reconciliation review records are open.`
- Primary: `Open reconciliation`
- Secondary: `View blockers`

`offline_review_status`:

- Title: `Cached review status`
- Body: `Payment review status is shown from cache. Refresh online before taking action.`
- Primary: `View cached status`
- Secondary: `Try later`

## Motion
Use minimal motion:

- panel entrance fade over `140ms`
- timeline current step highlight over `120ms`
- refresh spinner only while request is active
- status change crossfade over `120ms`
- copy confirmation fade over `100ms`

Respect `prefers-reduced-motion`.

Do not:

- pulse payment amount
- animate warning badges indefinitely
- use success motion in review state
- shift layout while polling
- run background countdown loops without user value

## Responsive Behavior
At `320px`:

- one column
- amount and provider in compact card
- timeline collapsed by default
- primary action full width
- secondary action below primary

At `390px`:

- show current timeline step and next step
- show review reason badge
- keep support action visible

At `768px`:

- two-column layout allowed
- timeline can stay expanded
- transport lock can sit beside status panel

At `1024px` and above:

- admin finance can render as a side panel
- identifiers can appear in compact key-value rows
- action buttons can align right if reading order remains logical

## Empty And Edge Cases
No payment record:

- Use `blocked_by_payment` or payment recovery, not this state.

Payment confirmed during refresh:

- Exit to confirmed payment result.
- Remove review copy.

Payment failed during refresh:

- Exit to failed recovery.
- Keep duplicate-charge caution.

Refund pending:

- Use `refund_pending`.

Provider reference missing:

- Show support-safe review copy.
- Finance route should show row error if row is invalid.

Review reason missing:

- Use `provider_result_pending`.
- Do not invent a finance review reason.

Attempt count missing:

- Hide attempt count.
- Keep timeline based on known timestamps.

Generated timestamp missing:

- Show `Status time unavailable`.
- Prompt refresh.

User offline:

- Show cached state.
- Disable refresh.
- Keep transport lock visible.

## QA Matrix
Functional tests:

- renders sender review variant with no retry payment action
- renders provider pending variant with refresh action
- renders checkpoint pending variant with next checkpoint
- renders unresolved after 30 minutes variant
- renders provider verification error variant
- renders finance review queue variant with reconciliation route
- renders operations transport lock variant
- renders launch readiness variant
- exits to confirmed state when refreshed payment is confirmed
- exits to failed recovery when refreshed payment is failed
- keeps transport actions hidden while under review
- prevents duplicate refresh submissions
- masks provider reference for non-finance roles

Security tests:

- no provider secret is rendered
- no webhook secret is rendered
- no webhook signature is rendered
- no raw provider payload is rendered
- no raw webhook payload is rendered
- no full payer phone is rendered
- no internal task secret is rendered
- sender cannot see finance CSV
- operations role cannot see full provider reference
- browser never calls internal reconciliation worker

Accessibility tests:

- root has accessible name
- timeline is an ordered list
- status changes are announced
- refresh result is announced
- transport lock is expressed in text
- target sizes meet mobile minimum
- color is not the only indicator
- focus order is logical
- copy action announces copied status

Offline tests:

- cached review state renders with timestamp
- refresh is disabled or marked unavailable offline
- transport lock remains visible offline
- no payment outcome is decided offline
- stale status prompts refresh

Contract tests:

- `paymentStatus=pending` with review reason maps to this state
- `paymentStatus=pending` without review context can map to processing or blocked payment
- `paymentStatus=confirmed` exits this state
- `paymentStatus=failed` exits this state
- `paymentStatus=refund_pending` maps to refund pending
- `providerPaymentStatus=unknown` with provider error reason maps to provider verification error

## Acceptance Criteria
Claude Code implementation is complete when:

- `SharedPaymentUnderReviewState` is implemented as a reusable shared state component.
- All variants listed in this file are supported.
- The component never initializes a new payment.
- The component never verifies provider status directly unless host supplies refresh callback.
- The component never mutates payment state.
- The component never calls internal reconciliation worker.
- Sender surfaces do not show retry payment while active payment is under review.
- Operations surfaces show transport lock.
- Finance surfaces show reconciliation routes.
- Provider references are masked outside authorized finance context.
- Payer phone is masked everywhere it appears.
- Accessibility live regions announce refresh and state changes.
- Offline state never confirms or fails payment.
- Unit tests cover all variants.
- Analytics tests prove restricted fields are excluded.
- Documentation is added to shared state index when implementation begins.

## Claude Code Build Notes
Build this as a presentational state component with host-owned data refresh and navigation callbacks.

Recommended files when implementation begins:

- `apps/mobile/src/components/states/SharedPaymentUnderReviewState.tsx`
- `apps/mobile/src/components/states/PaymentReviewTimeline.tsx`
- `apps/mobile/src/components/states/PaymentTransportLockNotice.tsx`
- `apps/mobile/src/components/states/__tests__/SharedPaymentUnderReviewState.test.tsx`
- `apps/admin/src/components/states/SharedPaymentUnderReviewState.tsx` if admin has a separate component tree
- `packages/shared/src/ui-state/payment-under-review.ts` if shared UI-state types are extracted

Implementation sequence:

1. Add typed variant model.
2. Add role-aware display policy.
3. Add safe copy map.
4. Add status panel.
5. Add timeline.
6. Add transport lock notice.
7. Add action callbacks.
8. Add analytics field filter.
9. Add accessibility live region.
10. Add tests.

Do not build:

- provider status mutation inside this component
- payment retry inside this component
- refund action inside this component
- webhook replay inside this component
- finance CSV export inside sender surface
- provider payload viewer inside this component
- internal worker trigger inside frontend

## Design Quality Bar
This state must feel like a premium finance-control surface:

- no panic
- no false success
- no duplicate-charge pressure
- no transport bypass
- clear owner
- visible timeline
- strong privacy boundaries
- role-specific next action
- accessible refresh feedback
- clean mobile hierarchy

The best version of this state keeps trust intact while the system resolves payment truth.

## Final Implementation Checklist
- State ID matches `payment_under_review`.
- Primary component is `SharedPaymentUnderReviewState`.
- Backend status remains `pending`; UI derives review state.
- Sender copy avoids finance jargon in first viewport.
- Finance copy includes review reason and attempt count.
- Operations copy shows transport lock.
- Retry payment action is absent.
- Dispatch and movement actions are absent.
- Refund action is absent.
- Provider replay action is absent.
- Internal reconciliation worker is never called by frontend.
- Provider reference masking is role-based.
- Payer phone masking is enforced.
- Review timeline handles missing timestamps.
- Offline copy is explicit.
- Stale data copy is explicit.
- Refresh result can exit review state.
- Analytics excludes restricted fields.
- Accessibility state changes are announced.
