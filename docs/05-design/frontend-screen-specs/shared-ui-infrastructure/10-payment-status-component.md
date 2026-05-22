# Payment Status Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Payment status component |
| Component family | Shared UI infrastructure |
| Primary components | `PaymentStatusComponent`, `PaymentStatusController`, `PaymentStatusSeal`, `PaymentStatusPanel`, `PaymentStatusTimeline`, `PaymentActionBridge` |
| Supporting components | `PaymentAmountLine`, `PaymentProviderBadge`, `PaymentVerificationLine`, `PaymentTransportGateNotice`, `RefundStatusLine`, `PaymentReviewReasonChip`, `PaymentRoleRedactor`, `PaymentStatusAnnouncer` |
| Inventory behavior | Pending, confirmed, failed, under review, refunded, partially refunded |
| Repo targets | `apps/mobile`, `apps/admin`, limited safe payment policy references in `apps/web` where explicitly allowed |
| Primary surfaces | sender payment processing, sender payment result, sender delivery detail, sender receipt detail, sender refund status, operations blocked delivery, admin delivery detail, admin finance summary, admin payment reconciliation, admin refund review |
| Primary users | senders, station operators, drivers, final-mile couriers, support admins, finance admins, ops admins, super admins, QA, accessibility reviewers |
| Backend coverage | `initialize_payment`, `verify_payment`, delivery payment fields, reconciliation review fields, refund review fields, webhook status where admin-visible |
| Browser mutation operation | None; this component is read-only and emits refresh, recovery, receipt, reconciliation, refund, support, or delivery route intents |
| Data sensitivity | payment ID, provider reference, payer phone, amount, provider status, refund amount, reconciliation reason, review timestamps, delivery ID |
| Offline critical | Yes for operations because payment-gated actions must stay blocked when payment is not confirmed; sender and admin views may show cached status only with clear freshness treatment |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, offline outbox, timeline component, issue status component, empty/error library, analytics tracking, test harness |
| Related screen specs | `PaymentProcessing`, `PaymentResult`, `PaymentFailedRecovery`, `SenderDeliveryDetail`, `SenderReceiptDetail`, `SenderRefundStatus`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminRefundReview`, `AdminRefundSettlement`, `AdminBlockedDeliveryQueue` |
| Related state specs | blocked by payment, payment under review, refund pending, manual review required, webhook conflict, stale data, offline, not authorized, session expired |
| Design tokens | No unique tokens; component uses payment, refund, success, warning, danger, neutral, focus, offline, and admin evidence tokens |
| Accessibility target | Status, amount, verification result, refund state, transport lock, and recovery route must be perceivable without color, motion, or icon shape alone |

## Purpose
The payment status component is Kra's shared financial-state primitive.

It renders payment, verification, review, refund, and transport-lock state consistently across sender, operations, and admin surfaces without letting one role see another role's finance-sensitive fields.

The component must answer:

- What is the current user-safe payment state?
- Is payment confirmed enough for transport or receipt access?
- Is payment still pending provider verification?
- Is payment failed and recoverable?
- Is payment under reconciliation or finance review?
- Is a refund pending, settled, full, or partial?
- Which amount can this role safely see?
- Which payment provider can this role safely see?
- Which references can this role safely see or copy?
- Which route should the host open next?
- Is the status fresh, stale, cached, partial, or unavailable?

The most important rule is:

```text
The frontend must never present a payment as confirmed unless the backend payment status is confirmed, refund_pending, or refunded with valid prior confirmation context.
```

## Product Job
Kra depends on verified payment before goods enter transport. The payment status component gives every surface a common way to communicate that financial truth.

The component must:

- render backend payment state consistently
- derive user-facing review and partial-refund states without inventing finance outcomes
- keep operations blocked until payment is confirmed
- prevent receipt access before confirmed payment
- prevent retry pressure while provider verification is pending
- show failed-payment recovery only where the sender is authorized
- show reconciliation routes only where finance is authorized
- show refund routes only where the user has refund access
- hide provider references from field staff and receivers
- support cached and stale status without overclaiming
- expose accessible status updates when refresh changes the state
- provide testable state mapping for all payment surfaces

## Strategic Role
Payment state is one of the highest-trust areas of the product.

If payment status is inconsistent, Kra risks:

- moving goods before money is verified
- telling a sender to pay twice while provider verification is pending
- showing a receipt before payment is final
- hiding finance review from admins
- confusing refunds with failed charges
- leaking provider references to field roles
- allowing offline actions to bypass a live payment gate
- creating support disputes that cannot be reconciled against provider records

This component prevents those failures by making payment state explicit, role-scoped, and tied to backend authority.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared payment primitives across mobile and admin surfaces.

Surface type:

- Reusable financial status component, from compact seal to full evidence panel.

Primary action:

- Help the current user choose the safe next route based on verified payment truth.

Visual thesis:

- `Financial truth seal`: a clean, high-trust status surface that separates pending, confirmed, failed, review, refund, and partial refund without ambiguity.

Restraint rule:

- Do not include payment forms, provider checkout, refund approval controls, provider payload tables, or manual state mutation inside this component.

Density:

- Sender compact and card variants are low to medium density.
- Operations variants are compact and gate-focused.
- Admin variants are dense enough for finance review while still using disclosure for sensitive fields.

Platform stance:

- Mobile-first for sender and operations. Desktop-dense for admin finance. One shared state model powers all variants.

## External Research Used
Only directly relevant payment-state, refund-state, status-tag, and accessibility references were used:

- [Stripe PaymentIntent lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle): supports explicit payment lifecycle handling, especially the need to wait through asynchronous processing before fulfillment.
- [Stripe Refund object](https://docs.stripe.com/api/refunds/object): supports refund state treatment and the distinction between pending, succeeded, failed, and canceled provider outcomes.
- [Paystack verify payments](https://paystack.com/docs/payments/verify-payments/): supports server-side payment verification before treating a transaction as successful.
- [MTN MoMo API collections overview](https://momodeveloper.mtn.com/API-collections): supports the mobile-money collection provider family used by Kra v1.
- [GOV.UK Design System tag](https://design-system.service.gov.uk/components/tag/): supports short visible status labels with clear semantic meaning.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for refresh, confirmation, failure, review, and refund status changes.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear explanation when a payment state blocks an action.
- [WCAG 2.2 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html): supports preserving relationships among status, amount, provider, timestamp, and next action.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through status, details, and route actions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/04-features/payments-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/paystack-flow.md`
- `docs/09-payments/hubtel-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/08-blocked-by-payment-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/16-payment-under-review-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/17-refund-pending-state.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/13-payment-processing.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/14-payment-result.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/16-payment-failed-recovery.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/20-sender-receipt-detail.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/23-sender-refund-status.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/23-admin-finance-summary.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/24-admin-payment-reconciliation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/25-admin-payment-reconciliation-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/delivery-draft.ts`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/payments.ts`
- `services/api/src/payment-reconciliation.ts`
- `services/api/src/payment-webhooks.ts`
- `services/api/src/delivery-queries.ts`

## Non-Goals
The payment status component must not:

- implement actual frontend screens
- initialize payment
- verify payment directly unless the host injects a refresh intent
- start provider checkout
- collect card, mobile-money PIN, OTP, bank, or wallet details
- create a receipt
- approve a refund
- settle a refund
- call internal reconciliation workers
- replay webhooks
- mutate delivery state
- mutate payment state
- mutate refund state
- show raw provider payloads
- show provider references to roles that do not need them
- show payer phone to operations field users
- let offline data unlock transport
- imply cash settlement
- imply refund approval before policy decision
- infer partial refund without amount evidence

## Component Boundary
The payment status component owns:

- display-state derivation
- role-scoped redaction
- status seal rendering
- status panel rendering
- amount and refund line rendering
- provider label treatment
- review reason label treatment
- transport gate notice
- stale and offline state display
- accessible status announcements
- action intent emission
- test identifiers
- analytics payload shaping for display and action events

The host owns:

- route authorization
- data fetching
- cache freshness
- delivery detail query
- payment verification query
- reconciliation query
- refund query
- permission checks
- navigation routes
- mutation operations outside this component
- local outbox state
- actual analytics dispatch
- retry, receipt, support, finance, or refund route execution

## Backend Payment Statuses
Canonical backend payment enum:

```ts
type PaymentStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "refund_pending"
  | "refunded";
```

Payment verification response status:

```ts
type VerifyPaymentStatus =
  | "pending"
  | "confirmed"
  | "failed";
```

Admin reconciliation provider status:

```ts
type ProviderPaymentStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "unknown";
```

Reconciliation review reason:

```ts
type PaymentReconciliationReviewReason =
  | "verification_unresolved_after_30_minutes"
  | "provider_verification_error";
```

## Display Statuses
The component exposes a display status that is stricter than raw backend status.

```ts
type PaymentDisplayStatus =
  | "not_started"
  | "pending"
  | "confirmed"
  | "failed"
  | "under_review"
  | "refund_pending"
  | "refunded"
  | "partially_refunded"
  | "provider_unavailable"
  | "unknown";
```

Rules:

- `not_started` is host-derived when no payment attempt exists.
- `pending` maps to backend `pending` without review metadata.
- `confirmed` maps to backend `confirmed`.
- `failed` maps to backend `failed`.
- `under_review` is derived from pending status plus reconciliation review metadata or finance-owned unresolved context.
- `refund_pending` maps to backend `refund_pending`.
- `refunded` maps to backend `refunded` when refund amount is missing or equal to the paid amount.
- `partially_refunded` is derived only when refund amount is greater than `0` and less than the paid amount.
- `provider_unavailable` is host-derived from provider initialization or verification unavailability when payment is not confirmed.
- `unknown` is used only when the host lacks enough data to render a safe state.

## State Authority Rules
Payment state authority:

- Backend payment status is the only authority for payment confirmation.
- Provider status alone is not enough to unlock delivery movement.
- Webhook received status is not enough to unlock delivery movement.
- Reconciliation review state is not enough to unlock delivery movement.
- Cached confirmed status can be shown as cached, but cannot unlock a new offline operational mutation.
- Refund status does not erase the fact that payment was once confirmed.
- A partial refund does not automatically block delivery unless backend delivery state or refund policy says so.

Transport authority:

- Operations can continue only when backend delivery workflow permits and payment is confirmed where payment is required.
- `refund_pending`, `refunded`, and `partially_refunded` must be interpreted by the host with delivery state and refund policy.
- If the delivery is still pre-transport and payment is refunded, transport remains blocked.
- If the delivery is already completed and later refunded, the component must not imply the delivery can be reversed.

Receipt authority:

- Receipt access is allowed only for confirmed, refund pending, refunded, or partially refunded display states.
- Receipt must show refund annotation when refund state is active.
- Receipt must not appear for pending, failed, under review, provider unavailable, unknown, or not started states.

Retry authority:

- Payment retry is allowed only for sender-authorized failed state, not started state, or provider unavailable state when the host says retry is safe.
- Payment retry must not be shown for pending or under review.
- Payment retry must not be shown for confirmed, refund pending, refunded, or partially refunded.

Finance authority:

- Reconciliation route is shown only to finance-capable admin roles.
- Refund review route is shown only to roles with refund review capability.
- Provider reference copy is shown only in finance/admin variants.

## Display-State Derivation
Input:

```ts
type PaymentStatusInput = {
  paymentStatus?: "pending" | "confirmed" | "failed" | "refund_pending" | "refunded";
  paymentId?: string;
  provider?: "mtn_momo" | "paystack" | "hubtel";
  providerPaymentStatus?: "pending" | "confirmed" | "failed" | "unknown";
  providerReference?: string;
  amountGhs?: number;
  refundAmountGhs?: number;
  refundRequestedAt?: string;
  refundSettledAt?: string;
  reconciliationAttemptCount?: number;
  nextReconciliationAt?: string;
  lastReconciliationAt?: string;
  reconciliationReviewRequiredAt?: string;
  reconciliationReviewReason?: "verification_unresolved_after_30_minutes" | "provider_verification_error";
  verificationCheckedAt?: string;
  verifiedAt?: string;
  failureReason?: string;
  providerUnavailable?: boolean;
  paymentAttemptExists?: boolean;
  sourceFreshness: "fresh" | "refreshing" | "stale" | "offline_cached" | "partial" | "unknown";
};
```

Derivation:

```text
if paymentAttemptExists is false -> not_started
else if providerUnavailable and paymentStatus is not confirmed -> provider_unavailable
else if paymentStatus is pending and reviewRequiredAt exists -> under_review
else if paymentStatus is pending and reconciliationReviewReason exists -> under_review
else if paymentStatus is pending and reconciliationAttemptCount >= 3 and providerPaymentStatus is pending -> under_review
else if paymentStatus is pending -> pending
else if paymentStatus is confirmed -> confirmed
else if paymentStatus is failed -> failed
else if paymentStatus is refund_pending and refundAmountGhs is between 1 and amountGhs - 1 -> partially_refunded
else if paymentStatus is refund_pending -> refund_pending
else if paymentStatus is refunded and refundAmountGhs is between 1 and amountGhs - 1 -> partially_refunded
else if paymentStatus is refunded -> refunded
else -> unknown
```

Constraints:

- If `amountGhs` is missing, do not derive `partially_refunded`.
- If `refundAmountGhs` is `0`, do not derive `partially_refunded`.
- If `refundAmountGhs` is greater than or equal to `amountGhs`, derive `refunded`.
- If `reconciliationAttemptCount` is missing, do not assume final review solely from elapsed UI time.
- If `providerPaymentStatus=unknown`, prefer `under_review` only when finance review metadata exists.
- If source freshness is stale, append freshness treatment without changing financial meaning.

## Variant Model
Supported variants:

```ts
type PaymentStatusVariant =
  | "seal"
  | "inline"
  | "summary_card"
  | "transport_gate"
  | "receipt_header"
  | "refund_panel"
  | "finance_row"
  | "finance_detail"
  | "admin_evidence";
```

Variant jobs:

| Variant | Job | Primary Surfaces |
| --- | --- | --- |
| `seal` | Compact state label | delivery cards, list rows, admin tables |
| `inline` | One-line status and amount | detail headers, receipt link rows |
| `summary_card` | Sender-facing payment status with next action | payment result, delivery detail |
| `transport_gate` | Explain why movement is blocked or allowed | operations detail, blocked queue |
| `receipt_header` | Show paid/refund annotation on receipt | sender receipt detail |
| `refund_panel` | Show refund progress and amount | sender refund status, admin refund review |
| `finance_row` | Dense admin table cell state | reconciliation and finance queues |
| `finance_detail` | Evidence-rich admin payment state | reconciliation detail |
| `admin_evidence` | Support and audit payment block summary | admin delivery detail, audit views |

## Role Redaction
Role display rules:

| Role | Can See Amount | Can See Provider | Can See Payment ID | Can See Provider Reference | Can See Payer Phone | Can See Review Reason |
| --- | --- | --- | --- | --- | --- | --- |
| sender | Yes for own delivery | Yes | Yes | No by default | Masked own payer phone only where relevant | Plain-language only |
| receiver public | No | No | No | No | No | No |
| station operator | Payment gate only | Generic label only | No | No | No | Plain-language gate only |
| driver | Payment gate only | Generic label only | No | No | No | Plain-language gate only |
| final-mile courier | Payment gate only | Generic label only | No | No | No | Plain-language gate only |
| support admin | Yes when case-scoped | Yes | Yes | No by default | Masked only | Plain-language and case-safe |
| ops admin | Yes when delivery-scoped | Yes | Yes | No by default | No | Plain-language and operations-safe |
| finance admin | Yes | Yes | Yes | Yes | Masked by default, reveal only when audited | Full reason |
| super admin | Yes | Yes | Yes | Yes | Masked by default, reveal only when audited | Full reason |

Receiver rule:

- Receiver public flows must not use this component for payment internals.
- Public tracking may state that tracking does not show payment details.

Field role rule:

- Field roles see whether payment blocks work, not finance details.

Admin reveal rule:

- Provider reference reveal must be explicit, audited by the host, and never automatic on first render.

## Visual Language
Status color families:

| Display Status | Visual Family | Icon Meaning | Copy Tone |
| --- | --- | --- | --- |
| `not_started` | neutral with amber edge | hollow clock | action needed |
| `pending` | amber | clock | waiting for provider |
| `confirmed` | green | check seal | verified |
| `failed` | red | x in circle | payment did not go through |
| `under_review` | blue plus amber | magnifier and clock | Kra is checking |
| `refund_pending` | blue | return arrow | refund in progress |
| `refunded` | green-blue | receipt with return | refund completed |
| `partially_refunded` | blue with split mark | split receipt | part refunded |
| `provider_unavailable` | amber-red | disconnected plug | try later |
| `unknown` | neutral | question mark | status unavailable |

Visual rules:

- Use status text next to every icon.
- Use amount only when role allows it.
- Use provider name only when role allows it.
- Do not rely on color alone.
- Do not use celebratory motion for confirmed state in operations or admin contexts.
- Use one dominant status at a time.
- Keep finance detail dense but not visually noisy.
- Keep sender result emotional tone calm and exact.

Motion rules:

- Status change may use one short opacity or scale transition under `180ms`.
- Pending and review states must not use infinite spinners as the only visible cue.
- Use a static clock, pulse-free progress line, or refresh timestamp for long waits.
- Respect reduced motion by disabling all status transitions.

## Content Rules
Global copy principles:

- Use `payment` for sender-facing charge language.
- Use `provider verification` only in admin or support contexts.
- Use `Kra is checking this payment` for sender review state.
- Use `Payment not confirmed` for operations gate state.
- Use `Verified payment` for confirmed state.
- Use `Refund in progress` for refund pending state.
- Use `Part of this payment was refunded` for partial refund state.

Do not say:

- `Paid` unless backend is confirmed or confirmed with later refund context.
- `Successful` before backend verification.
- `Failed` for network or provider outage.
- `Try again now` for pending or under review.
- `Refund guaranteed` before approval.
- `Money returned` before settled refund context.
- `Cash refund available`.
- `Proceed anyway`.

Required microcopy by state:

| Display Status | Sender Copy | Operations Copy | Admin Copy |
| --- | --- | --- | --- |
| `not_started` | `Payment has not started yet.` | `Payment is not confirmed. Do not move this package.` | `No payment attempt is attached.` |
| `pending` | `Waiting for provider confirmation.` | `Payment is pending. Movement is blocked.` | `Payment pending provider verification.` |
| `confirmed` | `Payment verified.` | `Payment verified. Continue only if all other checks pass.` | `Internal payment status is confirmed.` |
| `failed` | `Payment did not go through.` | `Payment failed. Sender recovery is required.` | `Payment failed after verification.` |
| `under_review` | `Kra is checking this payment.` | `Payment under review. Movement remains blocked.` | `Finance review required.` |
| `refund_pending` | `Refund in progress.` | `Refund in progress. Follow delivery state and admin instruction.` | `Refund pending settlement.` |
| `refunded` | `Refund completed.` | `Payment was refunded. Follow current delivery state.` | `Refund settled.` |
| `partially_refunded` | `Part of this payment was refunded.` | `Partial refund recorded. Follow current delivery state.` | `Partial refund recorded.` |
| `provider_unavailable` | `Payment provider is unavailable right now.` | `Provider unavailable. Payment not confirmed.` | `Provider unavailable or verification failed.` |
| `unknown` | `Payment status is unavailable.` | `Payment status unavailable. Do not move package.` | `Payment status unavailable.` |

## Status Actions
The component emits intents. It does not navigate or mutate by itself.

```ts
type PaymentStatusIntent =
  | { type: "refresh_payment"; deliveryId: string }
  | { type: "start_payment"; deliveryId: string }
  | { type: "recover_payment"; deliveryId: string }
  | { type: "open_receipt"; deliveryId: string }
  | { type: "open_delivery"; deliveryId: string }
  | { type: "open_support"; deliveryId: string; category: "payment" }
  | { type: "open_reconciliation"; paymentId?: string; deliveryId?: string }
  | { type: "open_refund_status"; deliveryId: string }
  | { type: "open_refund_review"; paymentId?: string; deliveryId?: string }
  | { type: "copy_payment_id"; paymentId: string }
  | { type: "copy_provider_reference"; providerReference: string };
```

Action availability:

| Display Status | Sender Action | Operations Action | Admin Action |
| --- | --- | --- | --- |
| `not_started` | start payment | contact sender or open delivery | open delivery |
| `pending` | refresh status | refresh or open blocked queue | open delivery or reconciliation when due |
| `confirmed` | open receipt | continue only if host action allows | open payment evidence |
| `failed` | recover payment | open support context | open payment evidence |
| `under_review` | refresh or support | open blocked queue | open reconciliation |
| `refund_pending` | open refund status | open delivery | open refund review |
| `refunded` | open receipt or refund status | open delivery | open refund evidence |
| `partially_refunded` | open receipt or refund status | open delivery | open refund evidence |
| `provider_unavailable` | try later or support | open support context | open provider incident context |
| `unknown` | refresh | refresh or support | refresh or investigate |

Disabled rules:

- Disable refresh while refresh is in flight.
- Disable receipt when status is not confirmed or refund-related.
- Disable recovery while status is pending or under review.
- Disable provider reference copy unless role allows it.
- Disable all network actions when offline unless host has an allowed offline route.

## Layout Rules
Compact seal:

- One line.
- Status icon.
- Status label.
- Optional freshness dot.
- Optional amount only for sender or admin surfaces.
- Minimum touch target applies if interactive.

Inline:

- Status label first.
- Amount second.
- Provider third if allowed.
- Timestamp last.
- Wrap cleanly on small mobile width.

Summary card:

- Status headline.
- One-line explanation.
- Amount line.
- Provider and verification line when allowed.
- Freshness banner when stale or cached.
- One primary action.
- One secondary action at most.

Transport gate:

- Strong gate heading.
- Safe reason line.
- Current payment state.
- Required next actor or owner from host context if relevant.
- No payment retry for field roles.
- Route to support or blocked queue.

Receipt header:

- Confirmed or refund-related seal.
- Paid amount.
- Refunded amount when applicable.
- Net amount when host provides it.
- Payment ID for sender.
- Provider reference hidden from sender by default.

Refund panel:

- Refund state first.
- Refund amount line.
- Refund requested or settled time.
- Policy note from refund docs where host provides it.
- Route to support or review.

Finance row:

- Dense status chip.
- Internal status.
- Provider status.
- Amounts.
- Mismatch reason.
- Attempts count.
- Review age.

Finance detail:

- Payment status summary.
- Internal and provider comparison.
- Timeline of verification and review milestones.
- Copy controls for allowed identifiers.
- Clear statement that mutation is not available from the component.

## Information Architecture
Recommended order:

1. Status label.
2. State meaning.
3. Amount, if visible.
4. Provider, if visible.
5. Verification or refund timestamp.
6. Freshness or review marker.
7. Transport gate, if relevant.
8. Next action.
9. Sensitive details disclosure, admin only.

Do not lead with:

- provider reference
- payer phone
- raw failure reason
- webhook event ID
- reconciliation count
- internal worker status

Those details are secondary admin evidence, not primary user orientation.

## Data Freshness
Freshness states:

```ts
type PaymentFreshness =
  | "fresh"
  | "refreshing"
  | "stale"
  | "offline_cached"
  | "partial"
  | "unknown";
```

Freshness rules:

- `fresh`: no banner required.
- `refreshing`: announce refresh and keep previous status visible.
- `stale`: show `Status may have changed. Refresh before action.`
- `offline_cached`: show `Showing saved status. Confirm online before moving package.`
- `partial`: show `Payment summary loaded without all finance details.`
- `unknown`: show `Payment status source is unknown.`

Operations rule:

- Stale or offline cached confirmed payment cannot unlock a new custody, dispatch, or final-mile mutation.
- The host must require online confirmation before payment-gated operational mutation.

Sender rule:

- Stale confirmed status can show the last known receipt route only if the receipt route itself verifies current access.

Admin rule:

- Finance rows must show generated timestamp from backend response when available.

## Payment And Refund Amounts
Money input:

```ts
type PaymentMoney = {
  currency: "GHS";
  amountGhs?: number;
  refundAmountGhs?: number;
};
```

Formatting:

- Use `GHS` label.
- Use locale-aware thousands grouping.
- Use no fractional digits for integer backend amounts unless later backend contracts introduce pesewa-level precision.
- Never display negative refund amounts.
- Never calculate provider fees in the component.
- Never calculate policy eligibility in the component.

Amount display:

| Context | Amount Treatment |
| --- | --- |
| Sender charge | show charged or quoted amount when available |
| Sender refund | show refund amount when available |
| Operations gate | show no amount by default |
| Support admin | show amount when issue-scoped |
| Finance admin | show quoted, charged, and refunded amounts |
| Public receiver | show no amount |

Partial refund derivation:

```text
amountGhs > 0
refundAmountGhs > 0
refundAmountGhs < amountGhs
```

Full refund derivation:

```text
amountGhs > 0
refundAmountGhs >= amountGhs
```

If amounts are missing:

- show refund status label only
- do not show partial refund
- do not calculate net paid

## Provider Treatment
Supported provider labels:

| Provider | Display Label |
| --- | --- |
| `mtn_momo` | `MTN MoMo` |
| `paystack` | `Paystack` |
| `hubtel` | `Hubtel` |

Rules:

- MTN MoMo is the active v1 provider.
- Paystack and Hubtel may appear only if backend records or future enabled flows include them.
- Do not show unsupported provider labels from client-side assumptions.
- Unknown provider must render `Payment provider` for non-admins and `Unknown provider` for admins.

Provider references:

- Never show provider reference on public surfaces.
- Never show provider reference to field roles.
- Sender sees payment ID, not provider reference, unless product policy later approves it.
- Finance admin may copy provider reference.
- Reveal of payer phone requires host audit and should default to masked.

## Review Reasons
Internal reasons:

| Reason | Admin Label | Sender Label | Operations Label |
| --- | --- | --- | --- |
| `verification_unresolved_after_30_minutes` | `Unresolved after 30 minutes` | `Kra is checking this payment.` | `Payment under review.` |
| `provider_verification_error` | `Provider verification error` | `Kra could not confirm this yet.` | `Payment under review.` |

Rules:

- Do not show raw review reason to senders.
- Do not show provider error messages to field staff.
- Support admin can see plain-language reason, not raw stack or provider payload.
- Finance admin can see full reason and reconciliation attempt count.

## Failure Reasons
Failure reason input may exist from provider verification.

Display rules:

- Sender gets plain language only.
- Field roles get payment gate language only.
- Admins can see reason text only if backend already sanitized it.
- Raw provider error codes remain hidden unless finance detail surface explicitly supports them.

Allowed sender failure copy:

- `The provider did not confirm this payment. You can recover payment if the delivery is still eligible.`
- `The payment did not go through. No package movement can continue until payment is verified.`

Disallowed sender failure copy:

- Any provider blame without evidence.
- Any guarantee that the user was not charged.
- Any instruction to pay again while a pending payment exists.

## Transport Gate Rules
Payment status must integrate with operational gates.

Gate states:

| Display Status | Can Transport Continue |
| --- | --- |
| `not_started` | No |
| `pending` | No |
| `confirmed` | Yes if all other backend checks pass |
| `failed` | No |
| `under_review` | No |
| `refund_pending` | Host must check delivery state |
| `refunded` | Host must check delivery state |
| `partially_refunded` | Host must check delivery state |
| `provider_unavailable` | No |
| `unknown` | No |

Transport copy:

- `Payment is not confirmed. Do not move this package.`
- `Payment under review. Movement remains blocked.`
- `Payment verified. Continue only if scan, custody, station, and issue checks also pass.`

Operations must never see:

- `Override payment gate`
- `Proceed without payment`
- `Collect cash`
- `Mark as paid`

## Interaction Contracts
Props:

```ts
type PaymentStatusComponentProps = {
  variant: PaymentStatusVariant;
  role:
    | "sender"
    | "station_operator"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin"
    | "finance_admin"
    | "super_admin";
  deliveryId?: string;
  trackingCode?: string;
  payment: PaymentStatusInput;
  capabilities: {
    canRefreshPayment: boolean;
    canStartPayment: boolean;
    canRecoverPayment: boolean;
    canOpenReceipt: boolean;
    canOpenReconciliation: boolean;
    canOpenRefundReview: boolean;
    canCopyProviderReference: boolean;
  };
  transportGate?: {
    paymentRequiredBeforeDispatch: boolean;
    hostActionLabel?: string;
    hostActionBlocked: boolean;
  };
  onIntent: (intent: PaymentStatusIntent) => void;
};
```

Required test IDs:

- `payment-status-root`
- `payment-status-seal`
- `payment-status-label`
- `payment-status-amount`
- `payment-status-provider`
- `payment-status-freshness`
- `payment-status-review-reason`
- `payment-status-refund-line`
- `payment-status-transport-gate`
- `payment-status-primary-action`
- `payment-status-secondary-action`
- `payment-status-sensitive-disclosure`
- `payment-status-announcer`

## State Matrix
`not_started`:

- Label: `Payment not started`
- Severity: neutral warning
- Sender primary action: start payment
- Operations primary action: open blocked delivery or contact sender route
- Admin primary action: open delivery
- Receipt: hidden
- Recovery: allowed only for sender start route

`pending`:

- Label: `Payment pending`
- Severity: warning
- Sender primary action: refresh status
- Operations primary action: refresh or open blocked queue
- Admin primary action: open delivery or reconciliation context
- Receipt: hidden
- Recovery: hidden

`confirmed`:

- Label: `Payment verified`
- Severity: success
- Sender primary action: open receipt
- Operations primary action: none inside component
- Admin primary action: open payment evidence
- Receipt: visible when allowed
- Recovery: hidden

`failed`:

- Label: `Payment failed`
- Severity: danger
- Sender primary action: recover payment
- Operations primary action: open support context
- Admin primary action: open payment evidence
- Receipt: hidden
- Recovery: visible for sender if host allows

`under_review`:

- Label: `Payment under review`
- Severity: review
- Sender primary action: refresh status or open support
- Operations primary action: open blocked queue
- Admin primary action: open reconciliation
- Receipt: hidden
- Recovery: hidden

`refund_pending`:

- Label: `Refund in progress`
- Severity: info
- Sender primary action: open refund status
- Operations primary action: open delivery
- Admin primary action: open refund review
- Receipt: visible with refund annotation
- Recovery: hidden

`refunded`:

- Label: `Refund completed`
- Severity: success info
- Sender primary action: open receipt or refund status
- Operations primary action: open delivery
- Admin primary action: open refund evidence
- Receipt: visible with refund annotation
- Recovery: hidden

`partially_refunded`:

- Label: `Partially refunded`
- Severity: info
- Sender primary action: open receipt or refund status
- Operations primary action: open delivery
- Admin primary action: open refund evidence
- Receipt: visible with partial refund annotation
- Recovery: hidden

`provider_unavailable`:

- Label: `Provider unavailable`
- Severity: warning danger
- Sender primary action: try later or support
- Operations primary action: open support context
- Admin primary action: open finance incident context
- Receipt: hidden
- Recovery: host-controlled

`unknown`:

- Label: `Payment status unavailable`
- Severity: neutral warning
- Sender primary action: refresh
- Operations primary action: refresh or support
- Admin primary action: refresh or investigate
- Receipt: hidden
- Recovery: hidden unless host confirms no active payment

## Screen Integration Rules
Sender payment processing:

- Use summary card or inline status.
- `pending` shows provider wait.
- `confirmed` routes to result.
- `failed` routes to result or recovery.
- `under_review` routes to result with review state.

Sender payment result:

- Use summary card.
- First viewport must include display status, amount, provider, and next action.
- Confirmed shows receipt CTA.
- Failed shows recovery CTA.
- Review hides recovery.

Sender delivery detail:

- Use inline or summary card.
- Payment must appear near delivery readiness.
- Block cancellation or movement-related copy based on host policy.

Sender receipt detail:

- Use receipt header.
- Confirmed, refund pending, refunded, and partially refunded states allowed.
- Failed, pending, under review, and unknown states should route away or render receipt unavailable.

Sender refund status:

- Use refund panel.
- Show refund amount only if backend provides it.
- Do not infer policy decision inside the component.

Operations delivery detail:

- Use transport gate.
- Confirmed status can clear only the payment gate, not custody, scan, issue, or station gates.
- Non-confirmed status blocks action.

Admin finance summary:

- Use finance row or compact seal.
- Show counts from host, not component calculations.
- Open reconciliation or refund review routes from intents.

Admin payment reconciliation:

- Use finance row.
- Show internal status, provider status, mismatch reason, attempts, and review age.
- Provider reference copy only where capability allows.

Admin refund review:

- Use refund panel or admin evidence variant.
- Show full, partial, and pending refund labels based on amount evidence.
- Mutations live in refund decision or settlement modals, not this component.

Public web:

- Public marketing pages can mention policy, not delivery-specific payment status.
- Public receiver tracking must not include this component.

## Empty And Error States
No payment record:

- Sender: `Payment has not started yet.`
- Operations: `Payment is not confirmed. Do not move this package.`
- Admin: `No payment attempt is attached to this delivery.`

Partial data:

- `Payment status loaded without all finance details.`

Unavailable data:

- `Payment status is unavailable. Refresh before taking action.`

Permission denied:

- `You do not have access to payment details for this delivery.`

Offline:

- `Showing saved payment status. Confirm online before taking action.`

Provider unavailable:

- `Payment provider is unavailable right now.`

Rules:

- Do not collapse payment errors into generic delivery errors when the payment gate matters.
- Do not show raw API error codes to customers.
- Do show safe error code route in admin context if host provides it.

## Accessibility Requirements
Semantic structure:

- Use a heading when rendered as a card or panel.
- Use text label adjacent to every icon.
- Use `time` with machine-readable `dateTime` for timestamps.
- Use description lists for status details in admin panels.
- Use table semantics only when host table owns the row structure.

Status announcements:

- Refresh start announces `Checking payment status.`
- Refresh success announces the new status.
- Refresh failure announces `Payment status could not be refreshed.`
- Status change must use an `aria-live="polite"` region.
- Failed payment state must not use assertive announcement unless it appears after a user-triggered action.

Focus:

- Keep focus on the trigger after refresh unless a new route opens.
- If a status change reveals a primary action, do not auto-focus it.
- In finance detail, disclosure controls must be reachable in reading order.

Color and contrast:

- Status cannot rely on color alone.
- All status text must meet contrast requirements.
- Disabled actions must remain readable.

Large text:

- Compact seal must wrap without clipping.
- Summary card must keep status before amount.
- Finance row must allow horizontal table strategy from host; the component itself must not truncate critical status labels.

Reduced motion:

- Disable transitions.
- Do not animate pending or review continuously.

## Analytics Events
The component prepares analytics payloads; host dispatches them.

Display event:

```ts
type PaymentStatusViewedEvent = {
  eventName: "payment_status_viewed";
  surface: string;
  variant: PaymentStatusVariant;
  role: string;
  displayStatus: PaymentDisplayStatus;
  backendPaymentStatus?: string;
  provider?: string;
  sourceFreshness: PaymentFreshness;
  deliveryId?: string;
  paymentId?: string;
  hasRefundAmount: boolean;
  transportGateShown: boolean;
};
```

Action event:

```ts
type PaymentStatusActionEvent = {
  eventName: "payment_status_action_selected";
  surface: string;
  variant: PaymentStatusVariant;
  role: string;
  actionType: PaymentStatusIntent["type"];
  displayStatus: PaymentDisplayStatus;
  deliveryId?: string;
  paymentId?: string;
};
```

Privacy rules:

- Do not include provider reference in analytics.
- Do not include payer phone in analytics.
- Do not include raw failure reason in analytics.
- Do not include refund narrative in analytics.

## Performance Requirements
Rendering:

- Component should render from already fetched host data.
- Component must not cause its own polling loop.
- Component must not import provider SDKs.
- Component must not include heavy charting dependencies.
- Finance table usage must avoid per-row expensive date parsing on every render; host can pre-normalize where needed.

Refresh:

- Host handles dedupe, rate limit, and query invalidation.
- Refresh intent should include delivery or payment context only.
- Pending state should not refresh faster than host policy allows.

Offline:

- Component reads source freshness from host.
- Component must not store payment data locally itself.

## Security And Privacy
Hard rules:

- Do not expose provider references outside finance-capable admin surfaces.
- Do not expose payer phone unmasked by default.
- Do not expose raw provider payloads.
- Do not expose webhook event body.
- Do not expose internal task secrets.
- Do not expose admin review comments to senders.
- Do not expose refund evidence that belongs in refund review routes.
- Do not expose payment internals to receiver public flows.

Admin copy action rules:

- Copy payment ID can be allowed in admin and sender scopes.
- Copy provider reference can be allowed only for finance admin and super admin.
- Copy action must announce success in a safe live region.
- Copy action must not log sensitive value into analytics.

## Localization
String keys:

- `payment.status.not_started.label`
- `payment.status.pending.label`
- `payment.status.confirmed.label`
- `payment.status.failed.label`
- `payment.status.under_review.label`
- `payment.status.refund_pending.label`
- `payment.status.refunded.label`
- `payment.status.partially_refunded.label`
- `payment.status.provider_unavailable.label`
- `payment.status.unknown.label`
- `payment.status.refresh.action`
- `payment.status.recover.action`
- `payment.status.receipt.action`
- `payment.status.support.action`
- `payment.status.reconciliation.action`
- `payment.status.refund_status.action`
- `payment.status.transport_gate.blocked`
- `payment.status.offline_cached`
- `payment.status.stale`

Localization rules:

- Ghana launch copy is English-first.
- Keep labels short enough for mobile.
- Avoid idioms around money movement.
- Do not translate provider names unless provider requires a local label.
- Currency remains `GHS`.

## Test Matrix
Display derivation tests:

- no payment attempt -> `not_started`
- pending without review metadata -> `pending`
- pending with `reconciliationReviewRequiredAt` -> `under_review`
- pending with `verification_unresolved_after_30_minutes` -> `under_review`
- pending with `provider_verification_error` -> `under_review`
- confirmed -> `confirmed`
- failed -> `failed`
- refund pending without amount -> `refund_pending`
- refunded without amount -> `refunded`
- refunded with refund amount equal to amount -> `refunded`
- refunded with refund amount lower than amount -> `partially_refunded`
- refund pending with refund amount lower than amount -> `partially_refunded`
- provider unavailable before confirmation -> `provider_unavailable`
- missing authority -> `unknown`

Role tests:

- sender cannot see provider reference
- receiver public cannot see any payment detail
- station operator sees payment gate only
- driver sees payment gate only
- courier sees payment gate only
- support admin sees masked finance data
- ops admin cannot copy provider reference by default
- finance admin can copy provider reference when capability exists
- super admin follows finance-sensitive reveal rules

Action tests:

- receipt hidden for pending
- receipt visible for confirmed
- recovery visible for sender failed
- recovery hidden for pending
- recovery hidden for under review
- reconciliation visible for finance under review
- refund review visible for finance refund state
- copy provider reference hidden without capability

Freshness tests:

- stale state shows refresh warning
- offline cached confirmed state does not unlock transport gate
- partial data shows partial warning
- refreshing state preserves previous visible status

Accessibility tests:

- status label is text, not icon-only
- live region announces refresh result
- focus stays stable after refresh
- large text does not clip labels
- reduced motion disables transitions
- finance detail disclosure is keyboard accessible

Security tests:

- provider reference absent from sender HTML
- payer phone absent from field-role HTML
- raw failure reason absent from sender HTML
- provider payload absent from all variants
- analytics excludes provider reference and payer phone

## Acceptance Criteria
The spec is complete only if a future implementation can satisfy these checks:

- Every backend payment status maps to one safe display state.
- `under_review` is derived from reconciliation context, not invented from client timeout alone.
- `partially_refunded` is derived only from amount evidence.
- Sender, operations, support, finance, and public receiver redaction rules are explicit.
- Receipt access is never shown for pending, failed, under review, provider unavailable, unknown, or not started states.
- Retry/recovery is never shown for pending or under review.
- Field roles cannot bypass payment gates.
- Offline cached payment cannot unlock payment-gated operational mutations.
- Provider references are finance-only.
- Status changes are accessible.
- The component emits intents instead of mutating payment state.
- Test IDs cover status, amount, provider, freshness, review, refund, gate, and actions.

## Claude Code Build Notes
When implementing later:

- Build a pure display-state derivation function first.
- Unit test the derivation function before rendering variants.
- Keep the component read-only.
- Accept all data from typed API client or host adapters.
- Do not add provider SDKs.
- Do not implement checkout here.
- Do not implement refund approval here.
- Do not implement reconciliation worker calls here.
- Use explicit capabilities instead of role checks alone.
- Keep sender, operations, and admin variants in one shared model with role-specific redaction.

## Completion Checklist
- Component boundary is read-only.
- Backend statuses are mapped.
- Derived statuses are defined.
- Refund amount logic is explicit.
- Review reason logic is explicit.
- Role redaction is explicit.
- Transport gate behavior is explicit.
- Receipt and recovery rules are explicit.
- Admin finance behavior is explicit.
- Public receiver exclusion is explicit.
- Accessibility behavior is explicit.
- Analytics privacy is explicit.
- Testing matrix covers payment, refund, review, role, freshness, and action states.

## Final Quality Review
Product completeness:

- Pass. The spec covers pending, confirmed, failed, under review, refund pending, refunded, partially refunded, provider unavailable, and unknown states.

Backend alignment:

- Pass. The spec respects Kra's current payment enum and derives inventory-required display states without requiring immediate backend enum changes.

Operational safety:

- Pass. The spec blocks transport unless payment is confirmed and all other host checks pass.

Finance integrity:

- Pass. The spec separates internal payment status, provider status, reconciliation reason, refund amount, and role-scoped sensitive fields.

Accessibility:

- Pass. The spec requires text labels, live regions, focus stability, readable contrast, large-text resilience, and reduced-motion behavior.

Implementation boundary:

- Pass. The spec defines a shared component contract and does not implement actual frontend UI.
