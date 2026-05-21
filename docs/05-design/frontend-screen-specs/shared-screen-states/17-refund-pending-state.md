# Refund Pending State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `refund_pending` |
| Component family | Shared screen state |
| Primary component | `SharedRefundPendingState` |
| Supporting components | `RefundPendingStatusPanel`, `RefundSettlementTimeline`, `RefundAmountCard`, `RefundTargetDateBadge`, `RefundPolicyNotice`, `RefundSettlementActions`, `RefundReceiptStamp`, `RefundPrivacyNotice`, `RefundRouteBridge` |
| Primary surfaces | sender mobile app, admin finance console, support workflow, receipt surfaces, delivery detail, cancellation outcome |
| Required recovery | show target date, track refund, open settlement, open finance summary, open delivery, open receipt, contact support, or refresh status |
| Test id root | `state-refund-pending` |
| Backend coverage | `refund_payment`, `settle_refund_payment`, payment `refund_pending`, payment `refunded`, refund amount, refund reason, refund requested time, refund settlement reference |
| Browser mutation operation | None directly; this state is read-only and routes to settlement only for authorized finance hosts |
| Data sensitivity | payment ID, provider reference, refund amount, refund reason, refund reference, payer phone, sender identity, delivery ID, issue context |
| Offline critical | Yes for sender and support visibility; no refund approval or settlement can be completed offline |
| Related inventory state | `refund_pending` |
| Related state specs | payment under review, blocked by payment, manual review required, webhook conflict, stale data, offline, not authorized, session expired |
| Design tokens | `refund.amber.700`, `refund.green.700`, `refund.blue.700`, `refund.red.700`, `neutral.950`, `neutral.700`, `neutral.500`, `surface`, spacing `4-40`, radius `10-18`, motion `refund-fade-140` |
| Accessibility target | WCAG 2.2 AA equivalent with explicit pending status, financial-action prevention, status announcements, target dates in text, and predictable focus order |

## Purpose
`SharedRefundPendingState` is the shared UI state shown after a refund has been approved and recorded by Kra, but before the refund has been settled and marked `refunded`.

The state must clearly separate three moments:

- refund requested or disputed
- refund approved and pending settlement
- refund settled and completed

The most important rule is:

```text
Refund pending means approved by Kra, not yet settled to the customer.
```

## Product Job
Kra must show approved refunds transparently while avoiding overclaiming settlement. The sender needs to know the refund is in progress, when to expect it, and where to check status. Finance needs to know the refund still needs settlement. Support needs sender-safe language and evidence routes. Receipt surfaces need to stamp the payment as refund pending.

The refund pending state must:

- show that refund approval has happened
- show refund amount when authorized
- show refund reason in safe language
- show requested time when available
- show target settlement window
- explain that funds have not completed yet
- route senders to track refund or support
- route finance admins to settlement
- route support to delivery, issue, or refund context
- stamp receipts as refund pending
- prevent duplicate refund approval
- prevent settlement from non-finance surfaces
- prevent refund-completed language before backend settlement
- protect provider references, payer phone, and finance-only data

## Strategic Role
Refund pending protects customer trust during the gap between a decision and settlement. A weak implementation creates two failures: the sender thinks money already landed, or finance loses track of settlement work.

The state should be direct:

- `approved` is good news
- `pending` means not finished
- `target` sets expectation
- `settlement` is owned by finance
- `support` can explain but not promise faster provider processing

This is a financial status, not a marketing success state.

## Design Brief
Audience:

- Sender waiting for an approved refund, finance admin settling the refund, support admin explaining the state, and any user viewing a receipt with refund state.

Surface type:

- Shared financial status state and receipt stamp.

Primary action:

- Track refund for sender, settle refund for finance, or refresh status for support.

Visual thesis:

- `Approved, not finished`: a precise amber financial state with a visible settlement timeline, amount card, and a firm distinction between pending and completed.

Restraint rule:

- Do not show celebration, cash promise, settlement success, or refund reference until backend settlement exists.

Density:

- Sender view is concise. Finance view shows settlement evidence. Receipt view is compact and stamped.

Platform stance:

- Mobile-first sender status, admin-ready finance panel, compact receipt badge.

## External Research Used
Only directly relevant refund lifecycle, provider status, and accessibility references were used:

- [Stripe refund documentation](https://docs.stripe.com/refunds?dashboard-or-api=api&locale=en-GB): supports refund pending behavior when balances or payment method processing prevent immediate completion, plus refund failure webhook awareness.
- [Stripe Refunds API](https://docs.stripe.com/api/refunds?locale=en-GB): supports explicit refund status values such as pending, requires action, succeeded, failed, and canceled.
- [Stripe refund status support](https://support.stripe.com/questions/understanding-refund-statuses?locale=en-GB): supports explaining that refund pending can mean bank processing, unsettled payment, or insufficient balance, and that processing time can remain after initiation.
- [Paystack refunds documentation](https://paystack.com/docs/payments/refunds/): supports refund initiation, status updates, partial/full refunds, and refund webhook events such as pending, processing, needs attention, failed, and processed.
- [Paystack refund errors](https://paystack.com/docs/api/errors/refund/): supports handling already-refunded and insufficient-balance refund conditions.
- [Adyen refund documentation](https://docs.adyen.com/online-payments/refund/): supports the idea that a refund request can pass initial validations and still later fail or reverse through webhooks.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refund status refresh and settlement updates.
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear financial-state error and action-blocking explanations.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable mobile tap targets for tracking, support, and finance actions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/04-features/payments-spec.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/10-ai/guardrails-and-escalation.md`
- `docs/10-ai/prompt-behavior.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/design-system.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/23-admin-finance-summary.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/27-admin-refund-settlement.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/21-sender-receipt-share.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/22-cancel-delivery-request.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/refunds.ts`
- `services/api/src/cancellations.ts`
- `services/api/src/payments.ts`

## Backend Contract
Refund approval route:

- `POST /v1/payments/refund`

Refund settlement route:

- `POST /v1/payments/refund/settle`

Approval request:

```json
{
  "paymentId": "PAY-7001",
  "duplicateCharge": true,
  "platformPaymentError": false,
  "packageNeverReceivedAtOrigin": false,
  "doorstepAttemptOccurred": false,
  "expressHandlingPerformed": true
}
```

Approval response:

```json
{
  "paymentId": "PAY-7001",
  "deliveryId": "DEL-7001",
  "refundStatus": "refund_pending",
  "refundAmountGhs": 35,
  "refundReason": "duplicate_charge",
  "requiresManualReview": false,
  "requestedAt": "2026-05-21T10:00:00.000Z"
}
```

Settlement request:

```json
{
  "paymentId": "PAY-7001",
  "refundReference": "RFD-MTN-7001",
  "settledAt": "2026-05-21T12:00:00.000Z"
}
```

Settlement response:

```json
{
  "paymentId": "PAY-7001",
  "deliveryId": "DEL-7001",
  "refundStatus": "refunded",
  "refundAmountGhs": 35,
  "refundReason": "duplicate_charge",
  "refundReference": "RFD-MTN-7001",
  "settledAt": "2026-05-21T12:00:00.000Z"
}
```

Payment states:

- `confirmed` before refund approval
- `refund_pending` after approval
- `refunded` after settlement

Backend rules:

- Only confirmed payments can enter refund approval.
- Refund approval rejects payments already `refund_pending` or `refunded`.
- Refund approval rejects manual-review or zero-amount decisions.
- Refund approval updates payment and delivery payment status to `refund_pending`.
- Refund settlement requires payment status `refund_pending`.
- Refund settlement requires refund amount, reason, and requested timestamp to already exist.
- Refund settlement updates payment and delivery payment status to `refunded`.
- Refund settlement queues sender notification `refund_completed`.

## Current Backend Gaps To Preserve
The product policy defines:

- original-method refund target: `3 business days`
- alternate-path refund target: `5 business days`
- alternate-path refund requires adjustment reference, approver identity, and payout evidence

Current backend response for refund approval includes:

- `paymentId`
- `deliveryId`
- `refundStatus`
- `refundAmountGhs`
- `refundReason`
- `requiresManualReview`
- `requestedAt`

Current backend response does not include:

- refund target date
- refund method
- original-method versus alternate-path indicator
- assigned finance owner
- provider settlement status
- refund reference before settlement

Frontend behavior:

- Show policy window from `requestedAt` when target date is missing.
- Show exact target date only when backend or host supplies it.
- Do not invent a settlement reference.
- Do not claim original-method settlement unless backend or finance context confirms it.
- Mark target-date calculation as policy-derived when exact backend field is absent.

## State Definition
`refund_pending` is active when Kra has approved a refund and the payment has not yet been settled.

Canonical triggers:

- refund approval response has `refundStatus=refund_pending`
- delivery payment status is `refund_pending`
- payment status is `refund_pending`
- payment has `refundAmountGhs`
- payment has `refundReason`
- payment has `refundRequestedAt`
- cancellation outcome includes `refundStatus=refund_pending`
- receipt share surface sees `paymentStatus=refund_pending`
- finance summary row has payment status `refund_pending`
- admin settlement screen has known pending refund evidence

Non-canonical triggers:

- refund request requires manual review
- refund is denied
- refund is already settled
- payment is still pending provider verification
- payment is failed
- payment is confirmed with no approved refund
- payment is under review
- active issue lock exists without approved refund
- webhook conflict exists
- user asks for refund but backend has not approved it
- cancellation result has no refund

State routing:

- Use `manual_review_required` when refund policy requires review before approval.
- Use `payment_under_review` when payment result is unresolved.
- Use `webhook_conflict` when provider callback conflicts with known payment state.
- Use `blocked_by_payment` when payment is not confirmed and no refund has been approved.
- Use `refund_pending` only after backend approval or known persisted state.
- Use completed/refunded status after backend settlement.

## Supported Variants
| Variant | Trigger | Primary action | Secondary action |
| --- | --- | --- | --- |
| `sender_refund_pending` | Sender sees approved but unsettled refund | `Track refund` | `Contact support` |
| `cancellation_refund_pending` | Cancellation outcome includes refund pending | `Track refund` | `View delivery` |
| `receipt_refund_pending` | Receipt/export sees refund-pending payment | `Track refund` | `Share receipt` |
| `finance_settlement_pending` | Finance sees refund-pending payment | `Settle refund` | `Open evidence` |
| `settlement_reference_required` | Finance settlement lacks reference | `Add reference` | `Open evidence` |
| `settlement_in_progress` | Finance submitted settlement and awaits response | `Settling refund` | none |
| `support_refund_pending` | Support explains approved refund | `Open delivery` | `Contact finance` |
| `policy_target_known` | Host supplies exact target date | `Track refund` | `View receipt` |
| `policy_window_only` | Only requestedAt and policy window are known | `Track refund` | `Contact support` |
| `stale_refund_status` | Cached refund-pending state may be outdated | `Refresh status` | `Use cached status` |
| `offline_refund_status` | Device offline with cached refund pending | `View cached status` | `Try later` |
| `settlement_metadata_missing` | Backend or host lacks required pending metadata | `Open finance summary` | `Contact support` |

## Required Props
```ts
type RefundPendingVariant =
  | "sender_refund_pending"
  | "cancellation_refund_pending"
  | "receipt_refund_pending"
  | "finance_settlement_pending"
  | "settlement_reference_required"
  | "settlement_in_progress"
  | "support_refund_pending"
  | "policy_target_known"
  | "policy_window_only"
  | "stale_refund_status"
  | "offline_refund_status"
  | "settlement_metadata_missing";

type RefundReason =
  | "full_refund_pre_intake"
  | "duplicate_charge"
  | "platform_payment_error"
  | "never_received_at_origin"
  | "post_intake_handling_fee"
  | "doorstep_surcharge_refund"
  | "express_surcharge_refund";

type RefundTargetKind =
  | "original_method_3_business_days"
  | "alternate_path_5_business_days"
  | "policy_window_unknown"
  | "exact_target";

type SharedRefundPendingStateProps = {
  variant: RefundPendingVariant;
  deliveryId?: string;
  paymentId?: string;
  provider?: "mtn_momo" | "paystack" | "hubtel";
  refundAmountGhs?: number;
  refundReason?: RefundReason;
  requestedAt?: string;
  targetDate?: string;
  targetKind?: RefundTargetKind;
  refundReference?: string;
  providerReferenceLabel?: string;
  paymentStatus?: "refund_pending" | "refunded" | "confirmed" | "pending" | "failed";
  actorRole?: "sender" | "finance_admin" | "support_admin" | "ops_admin" | "super_admin";
  isOffline?: boolean;
  isStale?: boolean;
  generatedAt?: string;
  onRefreshStatus?: () => void;
  onTrackRefund?: () => void;
  onOpenDelivery?: () => void;
  onOpenReceipt?: () => void;
  onOpenSupport?: () => void;
  onOpenFinanceSummary?: () => void;
  onOpenRefundSettlement?: () => void;
  onOpenEvidence?: () => void;
  onCopyPaymentId?: () => void;
};
```

Prop rules:

- `paymentStatus` should be `refund_pending` for active pending variants.
- If `paymentStatus=refunded`, exit to refunded/completed state.
- `refundAmountGhs` is required for amount card unless context is missing.
- `refundReason` is required for finance and support variants.
- `requestedAt` should be present for timeline and target window.
- `targetDate` should be shown only when supplied or safely derived by host policy helper.
- `refundReference` should not be shown until backend settlement response exists.
- `providerReferenceLabel` must be masked outside finance.
- Sender surfaces must not require payment ID visibility.
- Finance surfaces can show payment ID and settlement route.

## Canonical Routes
Sender routes:

- `/(sender)/deliveries/:deliveryId/refund`
- `/(sender)/deliveries/:deliveryId`
- `/(sender)/receipts/:deliveryId`
- `/(sender)/receipts/:deliveryId/share`
- `/(sender)/support?deliveryId=:deliveryId`

Cancellation routes:

- `/(sender)/deliveries/:deliveryId/cancel`
- `/(sender)/deliveries/:deliveryId/cancel/result`

Admin routes:

- `/admin/finance`
- `/admin/finance/refunds/:paymentId/review`
- `/admin/finance/refunds/:paymentId/settle`
- `/admin/finance/refunds/:paymentId/evidence`
- `/admin/deliveries/:deliveryId`
- `/admin/issues/:issueId`

Support routes:

- `/admin/support/deliveries/:deliveryId`
- `/admin/support/issues/:issueId`

Route rules:

- Sender `Track refund` opens sender refund status.
- Receipt `Track refund` opens sender refund status.
- Finance `Settle refund` opens admin settlement route.
- Support `Contact finance` opens support workflow or finance handoff, not settlement mutation.
- Public receivers do not get refund-pending route.
- Non-finance roles do not open settlement route.

## Information Architecture
The component has six zones:

- Refund status header
- Amount and reason card
- Settlement timeline
- Target date panel
- Recovery actions
- Privacy and policy notice

Refund status header:

- `Refund pending`
- delivery short reference
- payment short reference when authorized
- refreshed timestamp
- offline or stale badge

Amount and reason card:

- refund amount
- refund reason label
- approved/requested time
- provider label when relevant

Settlement timeline:

- refund approved
- settlement pending
- target window
- settled state preview disabled until backend response

Target date panel:

- exact target date when supplied
- policy-derived target window when exact date is missing
- original-method target: within `3 business days`
- alternate-path target: within `5 business days`

Recovery actions:

- track refund
- refresh status
- open support
- open receipt
- open delivery
- open settlement
- open evidence

Privacy and policy notice:

- funds are not marked complete yet
- provider settlement may take time
- finance owns settlement
- no cash refund in standard v1

## Visual Design Standard
Refund pending should feel precise, accountable, and calm.

Use:

- amber for pending settlement
- green only for settled/refunded state outside this component
- blue for tracking and support routes
- red only for metadata missing or settlement error
- clock or timeline metaphor in restrained form
- amount card with clear refund label
- target window as text and date
- receipt stamp with plain wording

Do not use:

- confetti
- success checkmark for pending
- `completed` label
- cash imagery
- provider logo clutter
- settlement reference before settlement
- refund guarantee wording
- duplicate approval CTA
- refund settlement CTA on sender surfaces

## Layout
Mobile sender layout:

- compact status header
- amount card
- target date panel
- short timeline
- sticky action row with `Track refund` and `Contact support`
- receipt link below actions

Admin finance layout:

- amount and reason left
- settlement readiness right
- evidence links below
- settlement route as primary action only for authorized finance
- payment ID copy action in secondary group

Receipt layout:

- small amber stamp
- `Refund pending`
- amount when allowed
- link to refund status
- note that receipt is not a settled-refund proof

Support layout:

- sender-safe explanation
- amount and requested time
- contact finance action
- issue or delivery links

## Component Anatomy
```text
SharedRefundPendingState
  RefundPendingStatusHeader
    RefundStatusBadge
    RefundReferenceLine
    DataFreshnessChip
  RefundAmountCard
    Amount
    Reason
    RequestedAt
  RefundSettlementTimeline
    Approved
    PendingSettlement
    Target
    SettledDisabledStep
  RefundTargetDateBadge
  RefundPolicyNotice
  RefundSettlementActions
  RefundPrivacyNotice
  RefundPendingLiveRegion
```

Anatomy rules:

- `RefundSettlementTimeline` should render as an ordered list.
- `RefundTargetDateBadge` must include text, not color only.
- `RefundSettlementActions` receives host callbacks.
- `RefundReceiptStamp` can be used in receipt export screens without full panel.
- `RefundPendingLiveRegion` announces refresh and settlement transition.

## Copy System
Primary titles:

- `Refund pending`
- `Refund approved, settlement pending`
- `Refund is being settled`
- `Refund target date`
- `Finance settlement required`
- `Refund status may be outdated`
- `Cached refund status`

Primary explanations:

- `Kra approved this refund. Settlement is still pending.`
- `This refund is not marked completed yet.`
- `Finance will settle this refund and record a refund reference.`
- `The expected settlement window starts from the approval time.`
- `Connect and refresh before sharing or acting on this refund status.`
- `This receipt will show refund pending, not refunded.`

Button labels:

- `Track refund`
- `Refresh status`
- `Open receipt`
- `Open delivery`
- `Contact support`
- `Settle refund`
- `Open evidence`
- `Open finance summary`
- `Copy payment ID`

Do not use:

- `Refund completed`
- `Money returned`
- `Paid back`
- `Cash refund`
- `Guaranteed by`
- `Instant refund`
- `Already settled`
- `Close refund`
- `Approve again`

## Refund Reason Labels
| Reason | Sender-safe label | Finance label |
| --- | --- | --- |
| `full_refund_pre_intake` | Full refund before station intake | Full refund before origin intake |
| `duplicate_charge` | Duplicate charge refund | Duplicate charge |
| `platform_payment_error` | Payment error refund | Platform payment error |
| `never_received_at_origin` | Package not received at origin | Never received at origin |
| `post_intake_handling_fee` | Refund minus handling fee | Post-intake handling fee |
| `doorstep_surcharge_refund` | Doorstep surcharge refund | Doorstep surcharge refund |
| `express_surcharge_refund` | Express surcharge refund | Express surcharge refund |

Label rules:

- Sender labels should be clear and non-legalistic.
- Finance labels can match policy terms.
- Do not expose unsupported reason values.
- Manual review is not a refund-pending reason.

## Settlement Target Rules
Original-method refund:

- Target copy: `Expected within 3 business days.`
- Use when backend or finance context confirms original-method settlement.

Alternate-path refund:

- Target copy: `Expected within 5 business days after finance confirms payout evidence.`
- Use when backend or finance context confirms alternate path.

Unknown method:

- Target copy: `Refunds usually settle within the approved refund window. Kra support can confirm the current path.`
- Use when method is not known.

Exact target:

- Show date and timezone.
- Show source: `Target from Kra refund policy` or `Target from finance record`.

Do not:

- count weekends as business days unless shared date helper supports it
- show exact target if requested time is missing
- show provider settlement date before provider or finance confirms it

## Role-Specific Behavior
Sender:

- Show refund pending title.
- Show amount when available.
- Show reason in sender-safe language.
- Show target window.
- Offer track refund, receipt, delivery, and support.
- Do not show provider reference.
- Do not show finance-only settlement form.

Finance admin:

- Show payment ID.
- Show provider reference.
- Show amount, reason, requested time.
- Show settlement route.
- Show evidence route.
- Show copy actions.
- Do not approve again.

Support admin:

- Show sender-safe status and amount.
- Show support notes only outside this shared state.
- Offer delivery and issue routes.
- Hand off to finance for settlement.

Operations admin:

- Show payment state as refund pending.
- Do not show settlement controls.
- Link delivery and support context.

Super admin:

- Show finance features only when capability permits.
- Use same settlement discipline as finance admin.

## Privacy And Security
Never display:

- full payer phone
- provider secret
- webhook payload
- raw provider payload
- bank account details
- wallet account details
- internal task secret
- private support notes
- staff IDs as user-facing labels
- refund reference before settlement

Allowed display:

- refund amount
- refund reason label
- requested time
- target date or policy window
- payment ID for finance/support
- masked provider reference for support
- full provider reference for finance
- delivery short reference

## Analytics
Events:

- `refund_pending_viewed`
- `refund_pending_track_selected`
- `refund_pending_refresh_requested`
- `refund_pending_refresh_result`
- `refund_pending_open_receipt`
- `refund_pending_open_delivery`
- `refund_pending_open_support`
- `refund_pending_open_settlement`
- `refund_pending_open_evidence`
- `refund_pending_copy_payment_id`
- `refund_pending_variant_changed`

Common event fields:

- `deliveryId`
- `paymentId`
- `surface`
- `actorRole`
- `variant`
- `refundReason`
- `refundAmountGhs`
- `targetKind`
- `isOffline`
- `isStale`
- `sourceRoute`
- `targetRoute`

Never send:

- full payer phone
- provider reference outside finance analytics scope
- bank or wallet details
- provider payload
- webhook payload
- refund reference before settlement
- support note body
- private evidence body

## Accessibility
Semantic structure:

- Component root uses `section`.
- Status title uses host-appropriate heading level.
- Timeline uses ordered list.
- Amount and target date are text, not color only.
- Refresh and settlement status changes use live region.
- Finance settlement route is labelled as a financial action.

Focus order:

- title
- amount and reason
- target date
- timeline
- policy notice
- primary action
- secondary actions
- privacy note

Keyboard behavior:

- `Tab` follows visual order.
- `Enter` and `Space` activate buttons.
- Copy payment ID announces success.
- Refresh keeps focus stable.
- Timeline expansion is keyboard accessible.

Screen reader copy:

- `Refund pending. Kra approved this refund, but settlement is not complete.`
- `Expected settlement window is three business days from approval.`
- `This receipt will show refund pending, not refunded.`
- `Finance settlement is required before this refund is marked completed.`

Touch behavior:

- mobile actions should be at least `44px`
- sticky action area must not cover target date
- settlement action must not appear on sender surfaces
- support action remains available when refresh fails

## Loading, Refresh, And Stale Data
Initial loading:

- Use shared loading state before refund data is known.
- Do not show refund pending unless status is known.
- Do not show settlement action without pending evidence.

Refresh:

- Sender refresh refetches delivery or refund status.
- Admin refresh refetches finance summary or refund context.
- Support refresh refetches delivery/payment context.
- Disable duplicate refresh.
- Announce if state changes to `refunded`.

Stale:

- Show cached timestamp.
- Show `Refund status may have changed`.
- Keep pending stamp visible.
- Require refresh before sharing receipt if stale.

Offline:

- Show cached pending status.
- Disable settlement.
- Disable refresh or mark it unavailable.
- Do not show completed refund offline unless cached state is explicitly `refunded`.

## Error Mapping
| Backend or product condition | Shared state | Variant | Recovery |
| --- | --- | --- | --- |
| `refundStatus=refund_pending` | `refund_pending` | `sender_refund_pending` | Track refund |
| cancellation result has refund pending | `refund_pending` | `cancellation_refund_pending` | Track refund |
| receipt sees `paymentStatus=refund_pending` | `refund_pending` | `receipt_refund_pending` | Track refund |
| finance row has `status=refund_pending` | `refund_pending` | `finance_settlement_pending` | Settle refund |
| settlement form lacks reference | `refund_pending` | `settlement_reference_required` | Add reference |
| settlement mutation in flight | `refund_pending` | `settlement_in_progress` | Wait |
| `paymentStatus=refunded` | refunded/completed state | not this state | View refund |
| refund requires manual review | `manual_review_required` | not this state | Open review |
| payment not confirmed | `blocked_by_payment` or `payment_under_review` | not this state | View payment |
| refund already processed | refunded/completed state | not this state | View refund |
| webhook conflict on refund | `webhook_conflict` | not this state | Admin review |
| stale refund data | `refund_pending` | `stale_refund_status` | Refresh |
| offline with cached pending status | `refund_pending` | `offline_refund_status` | Try later |

## State Machine
```text
confirmed_payment
  -> refund_review
  -> refund_pending
  -> refund_settlement
  -> refunded
```

Sender path:

```text
refund_approved
  -> refund_pending
  -> track_refund
  -> refunded | support
```

Finance path:

```text
refund_pending
  -> open_settlement
  -> enter_refund_reference
  -> submit_settlement
  -> refunded
```

Receipt path:

```text
receipt_ready
  -> refund_pending_stamp
  -> share_with_pending_status
```

Forbidden transitions:

- `refund_pending` -> `refunded` without backend settlement response
- `refund_pending` -> new refund approval
- `refund_pending` -> sender settlement action
- `refund_pending` -> cash refund instruction
- `refund_pending` -> completed receipt without pending stamp

## Host Integration
Sender refund status host:

- Shows `sender_refund_pending`.
- Allows refresh, receipt, delivery, and support.
- Does not show provider reference.
- Does not show settlement reference before settlement.

Cancel delivery result host:

- Shows `cancellation_refund_pending` only after backend cancellation or refund response includes pending refund.
- Does not preclaim refund before backend outcome.

Receipt share host:

- Shows `receipt_refund_pending`.
- Stamps generated receipt as refund pending.
- Blocks stale sharing until refreshed when policy requires.
- Does not export provider reference.

Admin finance summary host:

- Shows `finance_settlement_pending`.
- Routes to settlement.
- Shows pending amount in finance totals.

Admin refund settlement host:

- Shows pending evidence before settlement.
- Requires refund reference.
- Moves to refunded state only after settlement response.

Support host:

- Shows `support_refund_pending`.
- Explains status using sender-safe copy.
- Routes to finance for settlement questions.

## Content Rules By Variant
`sender_refund_pending`:

- Title: `Refund pending`
- Body: `Kra approved this refund. Settlement is still pending.`
- Primary: `Track refund`
- Secondary: `Contact support`

`cancellation_refund_pending`:

- Title: `Delivery cancelled. Refund pending`
- Body: `Your delivery was cancelled and the approved refund is pending settlement.`
- Primary: `Track refund`
- Secondary: `View delivery`

`receipt_refund_pending`:

- Title: `Receipt shows refund pending`
- Body: `This receipt will say refund pending and link back to refund status for settlement details.`
- Primary: `Track refund`
- Secondary: `Share receipt`

`finance_settlement_pending`:

- Title: `Refund needs settlement`
- Body: `This refund is approved and needs a settlement reference before it can be marked refunded.`
- Primary: `Settle refund`
- Secondary: `Open evidence`

`settlement_reference_required`:

- Title: `Refund reference required`
- Body: `Enter the provider or adjustment reference before settlement.`
- Primary: `Add reference`
- Secondary: `Open evidence`

`policy_window_only`:

- Title: `Refund window in progress`
- Body: `Exact settlement target is not available. Use the approved refund window from policy.`
- Primary: `Track refund`
- Secondary: `Contact support`

`stale_refund_status`:

- Title: `Refund status may be outdated`
- Body: `Refresh before sharing or acting on this refund status.`
- Primary: `Refresh status`
- Secondary: `Use cached status`

`offline_refund_status`:

- Title: `Cached refund status`
- Body: `You are viewing cached refund pending status. Connect to refresh.`
- Primary: `View cached status`
- Secondary: `Try later`

## Motion
Use minimal motion:

- panel entrance fade over `140ms`
- target badge fade when date appears
- timeline step highlight over `120ms`
- refresh spinner only during refresh
- settlement in-progress state uses static progress with text

Respect `prefers-reduced-motion`.

Do not:

- celebrate pending refunds
- use looping warning animation
- move amount card during refresh
- animate timeline every second
- use success animation before settlement response

## Responsive Behavior
At `320px`:

- one column
- amount card full width
- target date full width
- primary action full width
- timeline collapsed to current and next step

At `390px`:

- show amount, reason, and requested time in one card
- show support action below track action

At `768px`:

- two-column layout allowed
- timeline can remain expanded
- finance actions can sit beside settlement evidence

At `1024px` and above:

- admin detail can render as side panel
- finance metadata can use compact key-value grid
- receipt stamp remains compact

## Empty And Edge Cases
Missing payment ID:

- Sender can still show delivery-level pending state if delivery status says `refund_pending`.
- Finance settlement must show metadata missing and route to finance summary.

Missing refund amount:

- Show `Refund amount unavailable`.
- Route to support or finance.
- Do not show settlement action in finance unless evidence exists elsewhere.

Missing refund reason:

- Show safe generic reason.
- Finance should open evidence.

Missing requested time:

- Do not compute target date.
- Show policy window only.

Payment already refunded:

- Exit to refunded state.

Payment confirmed with no refund:

- Do not show this state.

Payment pending provider review:

- Use `payment_under_review`.

Manual review required:

- Use `manual_review_required`.

## QA Matrix
Functional tests:

- renders sender refund pending with amount and target window
- renders cancellation refund pending after backend outcome
- renders receipt refund pending stamp
- renders finance settlement pending with settlement route
- hides settlement route from sender
- hides provider reference from sender
- shows policy window when exact target date missing
- shows exact target date when supplied
- exits to refunded state after refreshed settlement
- blocks duplicate refund approval action
- blocks settlement when payment is not refund pending
- renders metadata missing state safely

Security tests:

- no full payer phone is rendered
- no provider secret is rendered
- no raw provider payload is rendered
- no webhook payload is rendered
- no settlement reference appears before settlement
- provider reference is masked outside finance
- sender analytics excludes provider reference
- support analytics excludes private notes

Accessibility tests:

- root has accessible name
- timeline is ordered
- target date is text
- pending status is not color only
- refresh result is announced
- copy action announces copied status
- mobile actions meet target size
- focus order follows layout

Offline tests:

- cached refund pending renders with timestamp
- settlement action disabled offline
- refresh unavailable offline
- stale receipt sharing prompts refresh
- no offline transition to refunded

Contract tests:

- refund approval response maps to `refund_pending`
- settle refund response exits to `refunded`
- manual-review refund decision maps to `manual_review_required`
- already refunded maps to refunded state
- confirmed payment without refund does not map to this state

## Acceptance Criteria
Claude Code implementation is complete when:

- `SharedRefundPendingState` is implemented as a reusable shared state component.
- All variants listed in this file are supported.
- The component never approves a refund.
- The component never settles a refund directly except through host-owned finance settlement route callback.
- Sender surfaces never show settlement controls.
- Sender surfaces never claim refund completion.
- Finance surfaces show settlement route only with `execute_refund` capability.
- Receipt surfaces stamp refund pending clearly.
- Target date is exact only when supplied or safely derived.
- Provider references are masked outside finance.
- Accessibility live regions announce refresh and state changes.
- Offline state never marks refund settled.
- Unit tests cover every variant.
- Analytics tests prove restricted fields are excluded.

## Claude Code Build Notes
Build this as a presentational state component with host-owned data refresh and route callbacks.

Recommended files when implementation begins:

- `apps/mobile/src/components/states/SharedRefundPendingState.tsx`
- `apps/mobile/src/components/states/RefundSettlementTimeline.tsx`
- `apps/mobile/src/components/states/RefundReceiptStamp.tsx`
- `apps/mobile/src/components/states/__tests__/SharedRefundPendingState.test.tsx`
- `apps/admin/src/components/states/SharedRefundPendingState.tsx` if admin has a separate component tree
- `packages/shared/src/ui-state/refund-pending.ts` if shared UI-state types are extracted

Implementation sequence:

1. Add typed variant model.
2. Add refund reason label map.
3. Add role-aware visibility policy.
4. Add amount and reason card.
5. Add settlement timeline.
6. Add target date badge.
7. Add action callbacks.
8. Add receipt stamp variant.
9. Add analytics field filter.
10. Add tests.

Do not build:

- refund approval inside this shared state
- refund settlement form inside this shared state
- provider refund integration inside this shared state
- cash refund flow
- raw provider payload viewer
- settlement reference display before settlement

## Design Quality Bar
This state must feel like a premium refund-status surface:

- clear pending status
- no overclaiming
- visible amount
- visible reason
- visible target window
- finance-owned settlement path
- strong privacy
- calm mobile layout
- receipt-safe stamp
- accessible refresh feedback

The best version of this state prevents refund anxiety while keeping finance execution disciplined.

## Final Implementation Checklist
- State ID matches `refund_pending`.
- Primary component is `SharedRefundPendingState`.
- Payment status is `refund_pending`.
- Refunded status exits this state.
- Manual review exits to manual review state.
- Payment review exits to payment under review state.
- Sender cannot settle refund.
- Finance can route to settlement only with capability.
- Receipt stamp says refund pending.
- Target date is not overclaimed.
- Provider reference is masked outside finance.
- Refund reference is hidden before settlement.
- Offline copy is explicit.
- Stale data copy is explicit.
- Analytics excludes restricted fields.
- Accessibility state changes are announced.
