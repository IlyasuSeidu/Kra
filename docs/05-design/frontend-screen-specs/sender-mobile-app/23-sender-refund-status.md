# Sender Refund Status Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderRefundStatus` |
| App | `apps/mobile` |
| Route | `/(sender)/deliveries/:deliveryId/refund` |
| Primary test ID | `screen-sender-refund-status` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `list_issues`, `deliveryDetailResponseSchema`, `issueListResponseSchema`, `paymentStatusSchema`, refund and dispute policy |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/receipts/:deliveryId`, `/(sender)/support`, `/(sender)/issues/new`, `/(sender)/notifications` |
| Required states | `loading`, `no_refund_activity`, `refund_review_pending`, `refund_approved_pending_settlement`, `refund_settled`, `refund_rejected`, `late_settlement`, `refreshing`, `stale_cache`, `not_found`, `not_authorized`, `offline`, `api_error`, `session_expired` |

## Product Job
This screen lets a sender understand the current refund state for one delivery. It must show whether refund review exists, whether a refund is approved and waiting settlement, whether settlement is complete, or whether refund was denied by policy. It must do this with backend-authoritative fields only.

The sender should be able to:
- See whether a refund exists for the selected delivery.
- Understand whether review is pending, approved, settled, or denied.
- See what backend state created that conclusion.
- See the original delivery amount from the locked quote.
- Understand the policy timing for approved refunds.
- Open delivery detail for operational context.
- Open the receipt for payment context.
- Open the timeline for custody context.
- Open support if the refund is denied, late, unclear, or absent.
- Recover safely from offline, stale, unauthorized, missing, or failed states.

This screen is not:
- A refund request form.
- A payment method screen.
- A payment retry screen.
- A finance admin refund review.
- A finance settlement console.
- A provider payout tracker.
- A manual refund calculator.
- A support chat transcript.
- A cancellation form.
- A receipt export route.

## Audience
Primary audience:
- Authenticated senders checking refund progress after cancellation.
- Senders whose payment status is `refund_pending`.
- Senders whose payment status is `refunded`.
- Senders with a payment issue or refund request under review.
- Senders with a policy-denied refund issue.

Secondary audience:
- Senders opening this route before any refund exists.
- Claude Code implementing the mobile route.
- QA validating refund-state mapping.
- Finance reviewers validating settlement wording.
- Support reviewers validating escalation wording.
- Product reviewers confirming no unsupported finance fields are shown.

## User State
The sender is checking money. They may be anxious, angry, or trying to reconcile business records. The screen must be calm, exact, and transparent about what Kra knows now. It must not turn a refund into a mystery, but it must also avoid pretending that the current sender contract exposes finance-only details.

The sender may be:
- Coming from a successful cancellation result.
- Coming from receipt detail after seeing `refund_pending`.
- Coming from a notification that refund was completed.
- Coming from support after refund review.
- Opening the route before any refund exists.
- Checking a refund on slow network.
- Offline with older cached delivery state.
- Trying to understand why a refund was denied.

The screen must:
- Treat `get_delivery` as the authority for delivery and payment status.
- Treat `list_issues` as the authority for sender-visible refund review or denial context.
- Never call `refund_payment`.
- Never call `settle_refund_payment`.
- Never ask the sender to enter provider or payout details.
- Never show internal provider reference, admin actor IDs, staff IDs, raw notes, or custody actor IDs.
- Never calculate a refund amount unless the backend exposes the amount in a sender-safe response.
- Clearly state when exact refund amount or settlement reference is not available in the current sender contract.

## Primary Action
Primary action by state:
- `no_refund_activity`: `Open delivery`
- `refund_review_pending`: `Open support thread`
- `refund_approved_pending_settlement`: `Refresh status`
- `refund_settled`: `View receipt`
- `refund_rejected`: `Open support thread`
- `late_settlement`: `Contact support`
- `offline`: `Try again`
- `api_error`: `Try again`

Secondary actions:
- `View receipt`
- `View timeline`
- `Open delivery`
- `Report refund issue`
- `Go to notifications`
- `Go back`

CTA behavior:
- `Open delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `View receipt` routes to `/(sender)/receipts/:deliveryId`.
- `View timeline` routes to `/(sender)/deliveries/:deliveryId/timeline`.
- `Open support thread` routes to the latest relevant issue when an issue exists.
- `Report refund issue` routes to `/(sender)/issues/new` with delivery context and category intent `payment`.
- `Contact support` routes to support with delivery context.
- `Go to notifications` routes to `/(sender)/notifications`.
- `Refresh status` refetches `get_delivery` and `list_issues`.
- `Try again` retries the failed read requests.

Blocked behavior:
- Do not allow refund approval from this screen.
- Do not allow refund settlement from this screen.
- Do not show admin finance forms.
- Do not show provider references or payout references unless a future sender-safe contract adds them.
- Do not show payment ID as primary user copy.
- Do not collect bank, wallet, or phone payout details.
- Do not request a new refund from this route.
- Do not infer rejection from lack of refund alone.
- Do not infer settlement delay unless the policy clock can be anchored.
- Do not route to cancellation when delivery is no longer eligible.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Refund status label.
- Delivery tracking code.
- Original charged quote amount.
- Payment status.
- Relevant policy timing.
- The next useful action.

For `refund_pending`, first meaningful value must answer:
- `Your refund is approved and waiting settlement.`
- `Target: within 3 business days after approval.`
- `We will show completion when finance marks it settled.`

For `refunded`, first meaningful value must answer:
- `Your refund is complete.`
- `Receipt and delivery records are still available.`

For denied refund issue, first meaningful value must answer:
- `Refund was not approved under policy.`
- `Open support to review the decision.`

For no refund activity, first meaningful value must answer:
- `No refund is active for this delivery.`
- `Open support if you think there should be one.`

## Main Tension
Refund status needs to feel like a finance-grade tracker even though the current sender contract exposes limited refund detail. The design must be honest about what is known, clear about what happens next, and strict about not leaking finance/admin fields.

The design must balance:
- Money anxiety against calm explanation.
- Progress clarity against missing sender-safe refund reference.
- Fast scanning against policy precision.
- Customer support access against unnecessary issue creation.
- Trustworthy status against unsupported provider tracking.
- Mobile simplicity against refund evidence context.

## Design Brief
User and job:
- An authenticated sender wants to know what is happening with refund money for one delivery.

Context of use:
- Mobile, payment-sensitive, often after cancellation or support review.

Entry point:
- CancelDeliveryRequest success.
- SenderReceiptDetail.
- SenderDeliveryDetail.
- SenderNotifications.
- SenderSupportThread.
- SenderDeliveryHistory.

Success state:
- Sender understands current refund status and knows whether to wait, refresh, view receipt, or contact support.

Primary action:
- State-driven: support for review/denial, refresh for pending settlement, receipt for settled refund.

Navigation model:
- Refund status is a read-only money-status surface. Support, receipt, delivery detail, and timeline remain separate routes.

Density:
- Medium. Money status needs enough detail to reduce support pressure, but the first viewport must stay clean.

Visual thesis:
- A precise refund command card: quiet financial seriousness, clear status rail, and direct support handoff.

Restraint rule:
- Avoid provider dashboards, admin tables, dense legal copy, celebratory graphics, payout forms, and speculative countdowns.

Product lens:
- Trust-critical finance visibility.

System stance:
- Native mobile status tracker with policy context and issue handoff.

Interaction thesis:
- The sender reads the status in one glance, then either waits, refreshes, views records, or opens support.

Signature move:
- A four-step refund rail that maps `review`, `approved`, `settlement`, and `complete` to real backend evidence.

Activation event:
- Sender opens receipt, support thread, timeline, or successfully refreshes to a newer refund state.

## Elite Quality Gate
This spec is not closed unless refund state is honest, contract-accurate, and customer-safe.

Non-negotiable quality requirements:
- First viewport shows status, tracking code, original quote, payment status, and next action.
- `paymentStatus=refund_pending` maps to approved pending settlement.
- `paymentStatus=refunded` maps to settled refund.
- `issue.resolutionCode=policy_denied` maps to rejected only when tied to the same delivery.
- Open or escalated payment issue maps to review pending only when tied to the same delivery.
- `issue.resolutionCode=refund_approved` maps to approved review only when payment status has not yet caught up.
- Exact refund amount is shown only if a sender-safe response includes it.
- Settlement reference is shown only if a sender-safe response includes it.
- The screen calls read endpoints only.
- The screen does not call `refund_payment` or `settle_refund_payment`.
- The screen hides provider references, payment IDs, staff IDs, actor IDs, raw metadata, and internal notes.
- The screen avoids implying refund denial when there is simply no refund activity.
- The screen supports screen reader, large text, high contrast, reduced motion, and small phones.
- All refresh, offline, stale, unauthorized, missing, and API error states are defined.

Closure rule:
- If a sender can approve or settle a refund here, the spec remains open.
- If no-refund activity looks like rejection, the spec remains open.
- If pending settlement looks settled, the spec remains open.
- If exact amount is invented from policy rather than returned data, the spec remains open.
- If support handoff is hidden for denied or late refunds, the spec remains open.
- If provider or staff references appear, the spec remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, code, or visual assets to copy:

- [Stripe refunds documentation](https://docs.stripe.com/refunds): reinforces that refund state and settlement are separate finance concepts and that refunds should return to the original payment path where possible.
- [W3C WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, error, and status changes without stealing focus.
- [Apple Human Interface Guidelines: progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators): supports clear progress feedback and avoiding ambiguous wait states.
- [Material Design progress indicators](https://m3.material.io/components/progress-indicators/overview): supports determinate versus indeterminate progress decisions and reduced uncertainty.
- Kra `docs/03-business/refund-and-dispute-rules.md`: defines refund cases, dispute windows, and settlement target.
- Kra `docs/03-business/cancellation-rules.md`: defines refund consequences after cancellation.
- Kra `packages/shared/src/contracts/api.ts`: defines available sender-safe schemas.
- Kra `services/api/src/refunds.ts`: defines admin finance execution behavior that this sender screen must not call.

## Backend Contract Alignment
Primary read:
- Operation: `get_delivery`.
- Response schema: `deliveryDetailResponseSchema`.
- Required fields:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `quote.amount`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `doorstepRequested`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `createdAt`

Secondary read:
- Operation: `list_issues`.
- Query:
- `deliveryId`
- `limit=50`
- Response schema: `issueListResponseSchema`.
- Client filters:
- `category=payment`
- `resolutionCode=refund_approved`
- `resolutionCode=policy_denied`
- `status=open`
- `status=in_review`
- `status=escalated`
- `status=resolved`
- `status=closed`

Read-only optional context:
- `list_notifications` may be used by the notifications screen, but this route does not require it.
- If a notification deep links here, this screen still refetches `get_delivery`.

Forbidden mutations:
- `refund_payment`
- `settle_refund_payment`
- `cancel_delivery`
- `initialize_payment`
- `verify_payment`
- `create_issue`, unless user taps `Report refund issue` and leaves this route.
- `resolve_issue`
- `escalate_issue`

No local calculation authority:
- Do not calculate refund amount from quote and policy.
- Do not calculate settlement date unless a backend time anchor exists.
- Do not calculate provider settlement status.
- Do not calculate compensation.

## Status Derivation
Status derivation must be deterministic and tested.

Inputs:
- Delivery detail.
- Relevant payment issues for the delivery.
- Freshness state.
- Network state.
- Session state.

Priority order:
1. Session expired or unauthorized.
2. Delivery not found.
3. No network and no cached data.
4. API error with no usable cached data.
5. `paymentStatus=refunded`.
6. `paymentStatus=refund_pending`.
7. Latest relevant payment issue has `resolutionCode=policy_denied`.
8. Latest relevant payment issue has `resolutionCode=refund_approved`.
9. Latest relevant payment issue is `open`, `in_review`, or `escalated`.
10. Payment status has no refund activity.

Payment state mapping:
| Backend state | UI state | Meaning | Primary action |
| --- | --- | --- | --- |
| `refund_pending` | `refund_approved_pending_settlement` | Refund approved and finance settlement pending | `Refresh status` |
| `refunded` | `refund_settled` | Refund completed in Kra records | `View receipt` |
| `confirmed` with open payment issue | `refund_review_pending` | Support/finance review exists | `Open support thread` |
| `confirmed` with `refund_approved` issue | `refund_approved_pending_settlement` | Review approved but payment status has not yet reflected settlement workflow | `Refresh status` |
| `confirmed` with `policy_denied` issue | `refund_rejected` | Refund was denied under policy | `Open support thread` |
| `pending` | `no_refund_activity` | Payment is not confirmed yet | `Open delivery` |
| `failed` | `no_refund_activity` | No confirmed charge is available for refund | `Open delivery` |
| `confirmed` with no relevant issue | `no_refund_activity` | No active refund is visible | `Open delivery` |

Issue recency:
- Sort relevant payment issues by `updatedAt` descending.
- Prefer issues with `status=open`, `status=in_review`, or `status=escalated` over older resolved issues.
- If multiple resolved issues exist, use the latest `updatedAt`.
- If an issue is not for this `deliveryId`, ignore it.
- If an issue category is not `payment`, ignore it for refund status.
- If issue data fails but delivery data loads, show refund state from delivery and a compact support-context warning.

State conflict rules:
- `paymentStatus=refunded` always wins over a denied issue.
- `paymentStatus=refund_pending` wins over a denied issue unless the denied issue is newer and explicitly tied to another refund request. Current backend does not expose separate request IDs, so do not show the denied issue as the primary state in that conflict.
- `policy_denied` does not mean payment failed.
- `refund_approved` issue without `refund_pending` means review is approved but finance status is not yet visible.
- `no_refund_activity` does not mean denied.

## Refund Policy Mapping
The UI must explain refund policy in customer-safe language.

Policy labels:
- `Full refund`: refund of collected delivery charge when policy allows.
- `Partial refund`: refund of an eligible component or amount after policy deductions.
- `Manual review`: staff or finance review required before a money outcome is final.
- `Policy denied`: refund not approved under current rules.

Known policy cases:
- Delivery cancelled before origin intake can qualify for full refund.
- Duplicate charge can qualify for full refund.
- Payment confirmed but package never received at origin can qualify for full refund.
- Verified platform-side payment error can qualify for full refund.
- Doorstep surcharge can be refunded if charged and no valid doorstep attempt occurred.
- Express surcharge can be refunded if charged and express handling was not performed because of Kra-side or platform-side failure.
- After dispatch, automatic full refund is not available.
- Loss and damage require support/admin review.

Execution timing:
- Approved refunds should be initiated the same business day.
- Original-method refund completion target is within `3 business days`.
- Alternate-path refund target is within `5 business days`.
- Cash refunds are not standard v1 workflow.

Timing display:
- If a refund is pending but no approval timestamp is sender-safe, show policy target text without a specific due date.
- If a future sender-safe `refundRequestedAt` exists, show the target business-day date.
- If settlement is complete but no settled timestamp is sender-safe, show complete state without exact date.
- If a future sender-safe `refundSettledAt` exists, show completion date.

## Information Architecture
Top-to-bottom order:
1. App header.
2. Refund status hero.
3. Status rail.
4. Money summary.
5. Policy timing panel.
6. Evidence and issue context.
7. Actions.
8. Help and legal safety copy.

Header:
- Left: back control.
- Title: `Refund status`.
- Right: overflow only if the app already has a standard overflow pattern.

Hero:
- Status icon.
- Status eyebrow.
- Main status headline.
- Delivery tracking code.
- Original quote amount.
- Primary action.

Status rail:
- `Requested`
- `Reviewed`
- `Approved`
- `Settled`

Money summary:
- Original quote.
- Current payment state.
- Refund amount status.
- Settlement reference status.

Policy timing:
- Settlement target.
- What happens next.
- When to contact support.

Evidence and issue context:
- Relevant support issue status.
- Last issue update time.
- Resolution code as customer-safe label.
- Link to support thread.

Actions:
- Primary CTA.
- Secondary links.

Help copy:
- Calm statement that provider settlement timing can vary.
- Clear support route.

## Visual System
Visual thesis:
- Quiet finance tracker with strong status contrast and no unnecessary ornament.

Design direction:
- Use a deep ink background only for the hero card, not the whole screen.
- Use warm amber for pending settlement.
- Use green for settled.
- Use red only for denied or blocking errors.
- Use neutral slate for no activity.
- Use a precise timeline rail rather than many stacked cards.

Color roles:
- `refund.surface`: base screen background.
- `refund.hero`: dark status card.
- `refund.pending`: amber status accent.
- `refund.settled`: green status accent.
- `refund.rejected`: red status accent.
- `refund.review`: blue status accent.
- `refund.muted`: secondary text.
- `refund.divider`: separators.

Color constraints:
- Do not use color alone to communicate status.
- Every status uses label, icon, and copy.
- Ensure contrast meets WCAG AA for body and controls.
- High contrast mode must strengthen outlines and labels.

Typography:
- Hero status headline: largest text on screen.
- Amount: large, but secondary to state.
- Tracking code: monospace or tabular style if available.
- Body copy: short lines.
- Policy labels: medium weight.
- Timestamps: small but readable.

Spacing:
- First viewport must fit hero, status, amount, and primary action on common phone heights.
- Use generous vertical space around the hero.
- Use tighter spacing inside evidence rows.
- Avoid dense table layout.

Shape:
- Hero card radius can be larger than ordinary cards.
- Status rail items can be rounded rows.
- Do not overuse nested cards.

Iconography:
- Pending review: clock or document-review icon.
- Approved pending settlement: shield/check with clock.
- Settled: check seal.
- Rejected: stop or policy icon.
- No activity: receipt or neutral circle.
- Icons must be decorative with text labels, or have clear accessible labels when interactive.

## Layout
Base screen:
- Safe-area aware.
- Scrollable content.
- Sticky footer only for primary action when content is long.
- Pull-to-refresh can be supported if already used in the app.

Small phone layout:
- Header remains compact.
- Hero reduces vertical padding.
- Status rail uses vertical list.
- Secondary actions become stacked buttons.
- Avoid side-by-side rows for amount and status if text wraps.

Large phone layout:
- Hero can show amount and tracking code on one horizontal row if width allows.
- Status rail can use connected horizontal steps only if labels remain legible.

Landscape:
- Keep single-column content.
- Footer does not cover support copy.

Keyboard:
- No keyboard required on this route.
- If support route opens a compose screen, keyboard handling belongs there.

## Component Inventory
Screen components:
- `SenderRefundStatusScreen`
- `RefundStatusHeader`
- `RefundStatusHero`
- `RefundProgressRail`
- `RefundMoneySummary`
- `RefundPolicyTimingCard`
- `RefundIssueContextCard`
- `RefundStateActions`
- `RefundOfflineBanner`
- `RefundStaleDataBanner`
- `RefundErrorPanel`
- `RefundEmptyActivityPanel`
- `RefundSkeleton`

Shared components allowed:
- App header.
- Status badge.
- Money amount.
- Delivery route label.
- Timeline rail.
- Button.
- Toast.
- Inline alert.
- Pull-to-refresh wrapper.
- Support link row.

Components not allowed:
- Admin finance table.
- Provider payout panel.
- Payment edit form.
- Bank detail form.
- Staff note viewer.
- Raw issue JSON.
- Refund mutation form.

## Screen States
### Loading
Trigger:
- `get_delivery` and `list_issues` are pending with no cache.

UI:
- Header skeleton.
- Hero skeleton.
- Four-step rail skeleton.
- Money summary skeleton.

Copy:
- `Loading refund status`
- `Checking payment and support records for this delivery.`

Accessibility:
- Announce loading once.
- Do not announce every skeleton element.

Exit:
- Both read requests resolve, or delivery resolves and issue request fails.

### No Refund Activity
Trigger:
- `paymentStatus` is `pending`, `failed`, or `confirmed`.
- No relevant payment issue indicates refund review, approval, or denial.

Hero label:
- `No active refund`

Headline:
- `No refund is active for this delivery.`

Body:
- `We do not have an active refund review or settlement record for this delivery right now.`

Primary action:
- `Open delivery`

Secondary action:
- `Report refund issue`

Money summary:
- Original quote: `GHS {quote.amount}`
- Payment state:
- `pending`: `Payment is still pending.`
- `failed`: `No confirmed payment is available for refund.`
- `confirmed`: `Payment is confirmed.`

Guardrail:
- Do not say rejected.
- Do not say approved.
- Do not show a refund amount.

### Refund Review Pending
Trigger:
- Latest relevant payment issue is `open`, `in_review`, or `escalated`.
- Payment status is not `refund_pending` or `refunded`.

Hero label:
- `Review in progress`

Headline:
- `Your refund request is being reviewed.`

Body:
- `Support is reviewing the payment issue tied to this delivery. We will update the refund state when a decision is recorded.`

Primary action:
- `Open support thread`

Secondary actions:
- `View timeline`
- `View receipt`

Status rail:
- Requested: complete.
- Reviewed: active.
- Approved: inactive.
- Settled: inactive.

Issue card:
- Show issue status.
- Show issue category as `Payment`.
- Show updated date.
- Show support thread link.

Do not show:
- Staff actor IDs.
- Resolved-by IDs.
- Internal notes.
- Raw issue fields.

### Refund Approved Pending Settlement
Trigger:
- `paymentStatus=refund_pending`.
- Or latest relevant payment issue has `resolutionCode=refund_approved` and delivery payment status has not yet reached `refunded`.

Hero label:
- `Refund approved`

Headline:
- `Your refund is approved and waiting settlement.`

Body:
- `Kra has recorded this refund as pending. We will show completion when finance marks it settled.`

Primary action:
- `Refresh status`

Secondary actions:
- `View receipt`
- `Open support thread`

Status rail:
- Requested: complete.
- Reviewed: complete.
- Approved: active or complete.
- Settled: inactive.

Money summary:
- Original quote: `GHS {quote.amount}`
- Refund amount:
- If sender-safe amount exists: `GHS {refundAmountGhs}`
- If not: `Amount will appear when available in the refund record.`

Policy timing:
- `Approved refunds are targeted to complete within 3 business days when returned to the original payment method.`
- `If another approved refund path is needed, the target is within 5 business days.`

Late settlement:
- Only show late state when an approval timestamp is available and policy target has passed.
- Current contract does not expose a sender-safe approval timestamp on delivery detail.
- Without timestamp, do not display a due-date breach.

### Refund Settled
Trigger:
- `paymentStatus=refunded`.

Hero label:
- `Refund complete`

Headline:
- `Your refund is marked complete.`

Body:
- `Kra records show this delivery payment has been refunded. Keep the receipt for your records.`

Primary action:
- `View receipt`

Secondary actions:
- `Open delivery`
- `View timeline`

Status rail:
- Requested: complete.
- Reviewed: complete.
- Approved: complete.
- Settled: complete.

Money summary:
- Original quote: `GHS {quote.amount}`
- Refund state: `Refunded`
- Refund amount:
- Show only if sender-safe amount exists.
- Otherwise: `Exact refund amount is not shown in this view yet.`

Do not show:
- Settlement reference unless sender-safe contract provides it.
- Provider reference.
- Finance actor.

### Refund Rejected
Trigger:
- Latest relevant payment issue has `resolutionCode=policy_denied`.
- Payment status is not `refund_pending` or `refunded`.

Hero label:
- `Refund not approved`

Headline:
- `This refund was not approved under policy.`

Body:
- `The latest support decision for this delivery did not approve a refund. Open the support thread if you need to review the reason or add context.`

Primary action:
- `Open support thread`

Secondary actions:
- `View delivery`
- `View policy`

Status rail:
- Requested: complete.
- Reviewed: complete.
- Approved: denied.
- Settled: inactive.

Issue card:
- Resolution label: `Policy denied`
- Updated date.
- Link to support thread.

Guardrail:
- Do not display denial if the only signal is no refund activity.
- Do not show raw `resolutionNote` by default.
- Do not accuse sender or staff.

### Late Settlement
Trigger:
- Future sender-safe refund approval timestamp exists.
- Computed business-day target has passed.
- Payment status is still `refund_pending`.

Current v1 behavior:
- Do not show this state unless the timestamp exists.
- Show policy timing only.

Hero label:
- `Needs support follow-up`

Headline:
- `This refund may need a finance follow-up.`

Primary action:
- `Contact support`

Support copy:
- `We will include the delivery and refund context so support can review the status.`

### Refreshing
Trigger:
- User pulls to refresh or taps `Refresh status`.

UI:
- Keep current content visible.
- Show compact top progress bar.
- Disable repeated refresh taps for the active request.

Success:
- Announce `Refund status updated.`

Failure:
- Preserve old content.
- Show inline banner: `Could not refresh. Your last loaded status is still shown.`

### Stale Cache
Trigger:
- Cached delivery or issue data is shown while network refetch failed or is pending past the app stale threshold.

Banner:
- `Showing last loaded status.`

Body:
- `Refresh when you are online to confirm the latest refund state.`

Constraints:
- Do not mark settled from stale cache if latest known state is pending and the user expects current status.
- Always label stale data.

### Offline
Trigger:
- Device has no network and no usable cached refund status.

Headline:
- `Refund status needs internet.`

Body:
- `Connect to the internet to check payment and support records for this delivery.`

Primary action:
- `Try again`

Secondary action:
- `Open delivery` only if delivery cache exists.

### API Error
Trigger:
- `get_delivery` fails with non-auth, non-not-found error.

Headline:
- `We could not load refund status.`

Body:
- `Try again. If this continues, support can check the delivery and refund record.`

Primary action:
- `Try again`

Secondary action:
- `Contact support`

### Issue Context Error
Trigger:
- `get_delivery` succeeds but `list_issues` fails.

UI:
- Render delivery-based refund state.
- Show compact banner:
- `Support context could not load.`

Body:
- `Refund state from payment status is still shown. Try refreshing for support review details.`

### Not Found
Trigger:
- `get_delivery` returns `NOT_FOUND`.

Headline:
- `Delivery not found.`

Body:
- `This refund status cannot be shown because the delivery record was not found.`

Primary action:
- `Go to history`

### Not Authorized
Trigger:
- `get_delivery` or `list_issues` returns `FORBIDDEN`.

Headline:
- `You cannot view this refund status.`

Body:
- `Sign in with the sender account that created this delivery, or contact support.`

Primary action:
- `Go back`

Secondary action:
- `Contact support`

### Session Expired
Trigger:
- Auth token expired or missing.

Headline:
- `Sign in to view refund status.`

Body:
- `Refund records are private to the sender account.`

Primary action:
- `Sign in`

## Copy System
Voice:
- Calm.
- Exact.
- Low-hype.
- Accountable.
- Money-aware.

Words to prefer:
- `refund`
- `review`
- `approved`
- `settlement`
- `complete`
- `not approved`
- `original payment method`
- `support thread`
- `delivery record`

Words to avoid:
- `instant`
- `guaranteed today`
- `paid out`
- `reversed` unless backend uses it later.
- `failed refund` unless the provider contract exposes that status.
- `denied` without saying `under policy`.

Primary headlines:
- No activity: `No refund is active for this delivery.`
- Review pending: `Your refund request is being reviewed.`
- Approved pending settlement: `Your refund is approved and waiting settlement.`
- Settled: `Your refund is marked complete.`
- Rejected: `This refund was not approved under policy.`
- Offline: `Refund status needs internet.`
- Error: `We could not load refund status.`

Button labels:
- `Open delivery`
- `Open support thread`
- `Refresh status`
- `View receipt`
- `Report refund issue`
- `View timeline`
- `Try again`
- `Contact support`

Support handoff copy:
- `Support will see the delivery context when you continue.`
- `Include any payment message or provider notice you received.`

Policy copy:
- `Approved refunds are targeted to complete within 3 business days when returned to the original payment method.`
- `Alternate approved refund paths may take up to 5 business days.`
- `Cash refunds are not part of the standard v1 workflow.`

Amount fallback copy:
- `Exact refund amount is not shown in this view yet.`
- `Open support if you need a finance review of the amount.`

Settlement reference fallback:
- `Settlement reference is not available in this sender view yet.`

## Data Formatting
Money:
- Format as `GHS {amount}`.
- Use no more precision than backend amount supports.
- Do not convert currency.
- Do not local-calculate refund amounts.

Dates:
- Use local device formatting for display.
- Store and compare ISO datetime strings.
- Use absolute dates for finance milestones when available.
- Avoid vague due dates without an anchor.

Tracking:
- Show `trackingCode`.
- Copy action copies `trackingCode` only.
- Do not copy delivery ID by default.

Station labels:
- Use station display-name mapping if available in app data.
- If not available, show station ID as a technical route label only in secondary area.

Issue labels:
- `open`: `Open`
- `in_review`: `In review`
- `escalated`: `Escalated`
- `resolved`: `Resolved`
- `closed`: `Closed`
- `refund_approved`: `Refund approved`
- `policy_denied`: `Refund not approved`

Payment labels:
- `pending`: `Payment pending`
- `confirmed`: `Payment confirmed`
- `failed`: `Payment failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

## Interactions
Refresh:
- Tapping `Refresh status` refetches delivery and issues in parallel.
- Disable refresh while active.
- Use optimistic UI only for loading indicator, not status.
- On success, update status from response.
- On failure, keep prior status and show banner.

Open support:
- If relevant issue exists, route to that issue thread.
- If no issue exists, route to issue creation with delivery context.
- Do not create an issue automatically.

Report refund issue:
- Route to `SenderIssueCreate`.
- Preselect or prefill route context only if the target screen supports it.
- Do not submit issue from this screen.

View receipt:
- Route to receipt detail.
- Receipt route decides whether receipt is available.

View timeline:
- Route to timeline.
- Timeline route owns custody display.

Copy tracking code:
- Show toast: `Tracking code copied.`
- Do not copy receiver phone.

Pull-to-refresh:
- Optional if already used in app.
- Must call same refresh logic as button.

## Accessibility
Screen reader:
- Announce the main status headline after load.
- Announce refresh success and failure via status message.
- Do not move focus on background refresh.
- Move focus to hero headline after state changes caused by explicit user action.
- Give each rail step a label and state.

Rail accessibility labels:
- `Requested, complete`
- `Reviewed, active`
- `Approved, not reached`
- `Settled, not reached`
- `Approved, not approved under policy`

Focus order:
1. Back button.
2. Screen title.
3. Status hero.
4. Primary action.
5. Status rail.
6. Money summary.
7. Policy timing.
8. Issue context.
9. Secondary actions.

Dynamic type:
- Hero headline wraps to three lines.
- Amount wraps without clipping.
- Rail becomes vertical if labels exceed width.
- Sticky footer does not cover content.

Reduced motion:
- Disable animated rail progression.
- Use opacity and static state swap.
- Progress indicator remains clear without movement.

High contrast:
- Add visible rail outlines.
- Increase icon stroke.
- Avoid relying on soft amber alone.

Touch targets:
- Minimum `44x44` points.
- Keep support and receipt links clearly separated.

## Privacy And Security
Hide:
- Provider references.
- Payment IDs.
- Payer phone.
- Receiver phone.
- Staff actor IDs.
- Admin user IDs.
- Driver IDs.
- Courier IDs.
- Custody actor IDs.
- Raw issue metadata.
- Raw event metadata.
- Internal notes by default.
- Refund settlement reference unless future sender-safe schema provides it.

Show:
- Tracking code.
- Delivery route.
- Original quote amount.
- Payment status.
- Refund status.
- Relevant issue status.
- Customer-safe resolution label.

Security:
- Require authenticated sender access.
- Respect `FORBIDDEN` from backend.
- Do not cache sensitive refund state beyond app cache policy.
- Clear sensitive cached screen state on sign out.
- Do not include amount or status in push notification deep-link query strings.

Analytics must not include:
- Provider reference.
- Payment ID.
- Receiver phone.
- Staff IDs.
- Raw issue note.
- Raw metadata.

## Analytics
Events:
- `sender_refund_status_viewed`
- `sender_refund_status_loaded`
- `sender_refund_status_refresh_tapped`
- `sender_refund_status_refreshed`
- `sender_refund_status_refresh_failed`
- `sender_refund_status_support_tapped`
- `sender_refund_status_receipt_tapped`
- `sender_refund_status_timeline_tapped`
- `sender_refund_status_issue_create_tapped`
- `sender_refund_status_offline_shown`
- `sender_refund_status_error_shown`

Allowed properties:
- `deliveryId`
- `paymentStatus`
- `uiRefundState`
- `hasRelevantIssue`
- `issueStatus`
- `resolutionCode`
- `isStale`
- `entryPoint`

Forbidden properties:
- `paymentId`
- `providerReference`
- `receiverPhone`
- `payerPhone`
- `actorId`
- `resolutionNote`
- `rawMetadata`

Activation:
- Sender opens support thread from review, rejected, or late state.
- Sender refreshes pending settlement successfully.
- Sender opens receipt from settled state.

## Error Mapping
Backend error mapping:
| Error | UI title | Primary action | Notes |
| --- | --- | --- | --- |
| `FORBIDDEN` | `You cannot view this refund status.` | `Go back` | Offer support. |
| `NOT_FOUND` | `Delivery not found.` | `Go to history` | Do not reveal whether another user owns it. |
| `RATE_LIMITED` | `Too many refresh attempts.` | `Try later` | Keep current status visible. |
| `INTERNAL_ERROR` | `We could not load refund status.` | `Try again` | Support secondary. |
| `VALIDATION_ERROR` | `We could not load refund status.` | `Try again` | Usually query issue. |

Issue query failure:
- Do not fail the whole screen if delivery state is available.
- Show banner only.

Delivery query failure:
- Fail the primary content unless cache exists.

Offline:
- No mutation queue.
- Read-only cache may display stale state with banner.

## Empty And Edge Cases
No relevant issues:
- Show state from payment status.
- Do not create issue automatically.

Multiple relevant issues:
- Use recency and active-status priority.
- Show one primary issue card.
- Link to support thread.

Refund completed notification but delivery still `refund_pending`:
- Treat delivery as authority.
- Show pending settlement.
- Add refresh path.

Refund pending but issue denied:
- Treat payment status as authority.
- Show pending settlement.
- Do not show denied as primary.

Refund approved issue but payment still confirmed:
- Show approved review pending finance reflection.
- Encourage refresh/support.

Payment failed:
- No refund activity.
- Open delivery or payment recovery path from delivery detail.

Payment pending:
- No refund activity.
- Explain payment must confirm before refund can exist.

Delivery cancelled without confirmed payment:
- No refund activity.
- Explain no confirmed payment is visible.

Delivered delivery with refund request:
- Show review pending if issue exists.
- Do not promise automatic refund.

Doorstep surcharge dispute:
- Show review pending through payment issue.
- Do not calculate surcharge refund locally.

Express surcharge dispute:
- Show review pending through payment issue.
- Do not calculate surcharge refund locally.

Loss or damage claim:
- If issue category is not payment, do not use it as refund status primary.
- Route to support thread for claim details.

## Performance
Initial fetch:
- Fetch delivery and issues in parallel.
- Render delivery-based state as soon as delivery arrives.
- Merge issue context when issues arrive.

Caching:
- Cache per `deliveryId`.
- Invalidate on notification deep link.
- Invalidate after returning from support thread.
- Invalidate after returning from receipt route only if app data changed.

Refresh:
- Debounce repeated refresh taps.
- Use no-store server behavior where backend already applies it.
- Keep screen interactive during background refresh except refresh button.

Rendering:
- Avoid heavy animation.
- Avoid large images.
- Use vector icons.
- Keep list small.

## Testing Requirements
Unit tests:
- Derives `refund_settled` from `paymentStatus=refunded`.
- Derives `refund_approved_pending_settlement` from `paymentStatus=refund_pending`.
- Derives `refund_rejected` from latest relevant `policy_denied` issue.
- Derives `refund_review_pending` from active payment issue.
- Derives `no_refund_activity` from confirmed payment with no relevant issue.
- Ignores non-payment issues.
- Prioritizes `refunded` over denied issue conflict.
- Shows amount fallback when sender-safe refund amount is absent.
- Does not calculate refund amount locally.

Component tests:
- `screen-sender-refund-status` renders on ready state.
- Rail labels have accessible names.
- Refresh button disables while refreshing.
- Issue query failure banner appears without hiding delivery status.
- Offline no-cache state shows retry.
- Stale cache banner appears.
- Rejected state routes to support.
- Settled state routes to receipt.

Integration tests:
- Loads delivery detail and issues for route `/(sender)/deliveries/:deliveryId/refund`.
- Does not call refund mutation endpoints.
- Handles `FORBIDDEN`.
- Handles `NOT_FOUND`.
- Handles `RATE_LIMITED`.
- Preserves prior state on refresh failure.

E2E tests:
- Sender opens refund status from cancellation success and sees pending settlement.
- Sender opens refund status after finance settlement and sees complete state.
- Sender opens refund status with policy-denied payment issue and sees support action.
- Sender opens refund status with no refund and sees no active refund state.
- Sender refreshes on weak network and sees stale-state protection.

Accessibility tests:
- Status headline is announced.
- Refresh update uses status message.
- Rail is navigable and understandable.
- Dynamic type does not clip.
- High contrast has visible state differences.
- Reduced motion disables rail animation.

## Test IDs
Screen:
- `screen-sender-refund-status`

Hero:
- `refund-status-hero`
- `refund-status-label`
- `refund-status-headline`
- `refund-status-tracking-code`
- `refund-status-original-amount`

Rail:
- `refund-progress-rail`
- `refund-rail-requested`
- `refund-rail-reviewed`
- `refund-rail-approved`
- `refund-rail-settled`

Money:
- `refund-money-summary`
- `refund-original-quote`
- `refund-payment-state`
- `refund-amount-row`
- `refund-reference-row`

Issue:
- `refund-issue-context`
- `refund-issue-status`
- `refund-issue-resolution`
- `refund-issue-updated-at`

Actions:
- `refund-primary-action`
- `refund-refresh-action`
- `refund-receipt-action`
- `refund-support-action`
- `refund-timeline-action`
- `refund-report-issue-action`

System:
- `refund-loading-state`
- `refund-offline-state`
- `refund-stale-banner`
- `refund-error-state`
- `refund-issue-context-error-banner`

## Implementation Notes For Claude Code
Data hooks:
- Use `useGetDeliveryQuery(deliveryId)`.
- Use `useListIssuesQuery({ deliveryId, limit: 50 })`.
- If the query layer does not exist, add typed read hooks only.
- Do not add refund mutation hooks to this screen.

State mapper:
- Build a pure function:
- `deriveSenderRefundStatus({ delivery, issues, issueError, isStale, now })`.
- Return:
- `uiState`
- `headline`
- `body`
- `railSteps`
- `primaryAction`
- `secondaryActions`
- `issueContext`
- `moneySummary`

Recommended UI types:
- `SenderRefundUiState`
- `RefundRailStep`
- `RefundIssueContext`
- `RefundMoneySummary`
- `RefundActionModel`

Route params:
- `deliveryId` required.
- Validate route param shape before fetch if a shared validator exists.

Navigation:
- Keep route read-only.
- Route issue creation/support actions out of this screen.
- Route receipt action out of this screen.

Do not implement:
- Admin refund review.
- Admin refund settlement.
- Provider payout status.
- New backend endpoints.
- New refund mutation from sender.
- Local refund amount calculator.

## QA Review Checklist
Contract:
- Uses `deliveryDetailResponseSchema`.
- Uses `issueListResponseSchema`.
- Uses `paymentStatusSchema`.
- Does not require missing refund fields.
- Does not call `refund_payment`.
- Does not call `settle_refund_payment`.

Policy:
- Shows 3 business day original-method target.
- Shows 5 business day alternate-path target only as policy text.
- Does not promise exact date without anchor.
- Does not infer denial from no activity.
- Does not infer amount from quote.

UX:
- First viewport has status, amount, tracking code, and action.
- Pending, settled, rejected, and no activity are visually distinct.
- Support route is visible for review and rejected states.
- Settled state routes to receipt.
- Refresh keeps prior state on failure.

Accessibility:
- Screen reader status update works.
- Rail is not color-only.
- Large text survives.
- High contrast works.
- Reduced motion works.

Privacy:
- No provider reference.
- No payment ID.
- No receiver phone.
- No payer phone.
- No staff ID.
- No raw issue note.

## Open Backend Gaps To Track Outside This Screen
These are not blockers for implementing this screen, but they should be tracked for later finance transparency:

- Sender-safe refund amount in delivery or payment detail.
- Sender-safe refund requested timestamp.
- Sender-safe refund settled timestamp.
- Sender-safe settlement reference.
- Dedicated sender refund detail endpoint.
- Refund request ID when multiple refund reviews can exist on one payment.

Current decision:
- Build the screen without these fields.
- Use clear fallback copy.
- Do not infer exact values locally.

## Build Sequence
1. Add route file for `/(sender)/deliveries/:deliveryId/refund`.
2. Add typed delivery query usage.
3. Add typed issue list query usage.
4. Add pure status derivation mapper.
5. Add status hero.
6. Add progress rail.
7. Add money summary.
8. Add policy timing card.
9. Add issue context card.
10. Add state-based action model.
11. Add loading, offline, stale, error, unauthorized, and not-found states.
12. Add analytics with allowed properties only.
13. Add accessibility labels and status announcements.
14. Add unit, component, integration, and E2E coverage.
15. Run lint, typecheck, coverage, and critical coverage.

## Final Acceptance Statement
Claude Code should build `SenderRefundStatus` as a read-only, finance-safe refund tracker. It must fetch delivery detail and relevant payment issues, map `refund_pending` to approved pending settlement, map `refunded` to settled, map payment issue review or policy denial to customer-safe review/rejected states, avoid unsupported amount/reference claims, never call refund mutation endpoints, and protect provider, payment, staff, receiver, and raw issue details while giving the sender clear actions to refresh, view receipt, open delivery, or contact support.
