# Admin Refund Evidence Review Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminRefundEvidenceReview` |
| Route | `/admin/finance/refunds/:paymentId/evidence` |
| Test id | `screen-admin-refund-evidence-review` |
| Surface | Admin web console |
| Backend coverage | Read-only composition from `admin_finance`, `admin_payment_reconciliation`, `get_delivery`, `get_delivery_timeline`, `list_issues`, `get_issue`, and `admin_audit_events` where context is available |
| Offline critical | No |
| Required read role | `finance_admin`, `support_admin`, `operations_admin`, or `super_admin` with access to the delivery context |
| Required submit role | None |
| Required states | `loading`, `ready_complete`, `ready_partial`, `evidence_missing`, `payment_not_found`, `delivery_not_found`, `policy_conflict`, `not_authorized`, `session_expired`, `stale_context`, `api_error` |
| Parent screens | `AdminRefundReview`, `AdminRefundSettlement`, `AdminFinanceSummary`, `AdminPaymentReconciliationDetail`, `AdminDeliveryDetail`, `AdminIssueDetail` |
| Related screens | `AdminRefundReview`, `AdminRefundSettlement`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminAuditEvents`, `AdminStaffActivityLog`, `SenderRefundStatus` |

## Purpose
`AdminRefundEvidenceReview` is the read-only finance evidence file for one refund-related payment. It lets finance, support, operations, and audit reviewers inspect the exact evidence used to approve, settle, dispute, or challenge a refund outcome.

The screen should answer:
- `Which payment is under refund review?`
- `Is the refund only approved, already settled, or not supported by current evidence?`
- `What amount, reason, reference, and timestamps are known?`
- `Which delivery stage and custody events support the decision?`
- `Which handoff or final proof records exist?`
- `Which support issues, disputes, or loss and damage signals are connected?`
- `Which audit and staff activity records should a reviewer open next?`
- `Which evidence is missing before a human can trust the refund file?`
- `Which screen owns the next action, if any?`

This screen is not an approval or settlement screen. It must not move money, approve refunds, settle refunds, reject refunds, edit payment state, resolve support issues, override custody, or upload evidence. Its job is to make the record trustworthy before or after those actions happen elsewhere.

## Backend Reality
There is no dedicated backend endpoint named `get_refund_evidence`.

The route provides only:
```text
paymentId
```

The screen must compose its evidence from existing read contracts.

Primary payment sources:
- `GET /v1/admin/finance`
- `GET /v1/admin/payment-reconciliation`
- Navigation state from `AdminRefundReview`
- Navigation state from `AdminRefundSettlement`
- Query cache from finance and reconciliation screens

Delivery sources:
- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`

Issue sources:
- `GET /v1/issues?deliveryId=:deliveryId&limit=100`
- `GET /v1/issues/:id` only when an issue ID is already known from navigation or issue list

Audit sources:
- `GET /v1/admin/audit-events?targetType=payment&targetId=:paymentId`
- `GET /v1/admin/audit-events?targetType=delivery&targetId=:deliveryId`
- `GET /v1/admin/audit-events?targetType=issue&targetId=:issueId` for selected issues

Refund approval endpoint, for context only:
```http
POST /v1/payments/refund
```

Refund settlement endpoint, for context only:
```http
POST /v1/payments/refund/settle
```

This screen must not call either mutation endpoint.

## Known Refund Fields
From payment and refund contracts, the frontend may encounter:
- `paymentId`
- `deliveryId`
- `provider`
- `providerReference`
- `status`
- `amountGhs`
- `initiatedAt`
- `verifiedAt`
- `refundAmountGhs`
- `refundReason`
- `refundRequestedAt`
- `refundReference`
- `refundSettledAt`

From `refund_payment` success state:
- `refundStatus = refund_pending`
- `refundAmountGhs`
- `refundReason`
- `requiresManualReview = false`
- `requestedAt`

From `settle_refund_payment` success state:
- `refundStatus = refunded`
- `refundAmountGhs`
- `refundReason`
- `refundReference`
- `settledAt`

Known refund reasons:
- `full_refund_pre_intake`
- `duplicate_charge`
- `platform_payment_error`
- `never_received_at_origin`
- `post_intake_handling_fee`
- `doorstep_surcharge_refund`
- `express_surcharge_refund`

Payment statuses relevant here:
- `confirmed`
- `refund_pending`
- `refunded`
- `failed`
- `pending`

Evidence completeness must depend on the exact fields present. The UI must label absent backend fields as unavailable in this view, not infer them.

## Context Reality
The screen should hydrate in this order:
- Navigation state from the previous refund review, settlement, finance, reconciliation, delivery, or issue screen.
- Query cache keyed by payment ID from admin finance rows.
- Query cache keyed by payment ID from reconciliation rows.
- Delivery detail if a delivery ID is known.
- Delivery timeline if a delivery ID is known.
- Issue list if a delivery ID is known.
- Audit event list for payment, delivery, and selected issue targets.

If `paymentId` cannot be found in any loaded payment source:
- Show `payment_not_found`.
- Do not invent payment or delivery evidence.
- Offer route to finance summary and payment reconciliation.

If payment is found but delivery ID is not known:
- Show `ready_partial`.
- Display payment evidence only.
- Mark delivery, custody, proof, issue, and audit sections as unavailable in this view.
- Offer route to finance summary and reconciliation detail.

If delivery ID is known but delivery fetch fails with `NOT_FOUND`:
- Show `delivery_not_found`.
- Display payment evidence and the failed delivery lookup state.
- Offer route to issue queue and finance summary.

If evidence sources partially fail:
- Keep the screen usable.
- Mark each failed evidence group with source, timestamp, retry action, and reviewer impact.
- Do not hide successful evidence groups.

## Primary Users
Primary:
- `finance_admin` verifying refund approval and settlement evidence.
- `support_admin` explaining refund status to a customer without exposing provider secrets.
- `operations_admin` checking custody and proof facts behind a dispute.
- `super_admin` auditing high-risk financial outcomes.

Secondary:
- QA validating policy and data coverage.
- Security reviewer validating read-only boundaries.
- Product owner validating refund and dispute workflows.
- Claude Code implementing the admin console later.

Non-users:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- Public web visitors.

## User Intent Model
A reviewer lands here with one of these intents:
- Confirm settlement evidence after `AdminRefundSettlement`.
- Check why a payment is still `refund_pending`.
- Compare refund reason against delivery stage and policy.
- Check whether a duplicate charge or provider issue exists.
- Check whether a package was received, dispatched, handed off, delivered, returned, lost, damaged, or disputed.
- Check whether final proof exists and whether it is acceptable.
- Check whether issues and audit events explain the refund path.
- Route the case to the correct next screen without performing the action here.

The design must support fast triage and deep investigation. The first viewport should answer the status in less than five seconds; the full page should support evidence review without sending the reviewer to several tabs unless needed.

## UX Thesis
This page should feel like a high-integrity refund case file, not a generic record page.

The visual system should use:
- A strong evidence status header.
- A left-side evidence completeness rail.
- A central timeline and proof comparison area.
- A right-side policy and next-action rail.
- Dense but readable summaries.
- Risk color only where it changes reviewer judgment.
- Stable section anchors for audit, finance, support, and operations handoff.

The screen must look serious, premium, and operational. It should not look like a marketing page or a loose dashboard. Every visual treatment should help answer whether the refund record is complete, incomplete, conflicting, or settled.

## Design Inspiration And Evidence
Use these external standards as design inputs:
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/) supports key-value evidence review, metadata display, and grouped summary cards for facts that must be checked.
- [GOV.UK Task list](https://design-system.service.gov.uk/components/task-list/) supports a completeness rail where each evidence group can be marked complete, incomplete, blocked, or not applicable.
- [GOV.UK Warning text](https://design-system.service.gov.uk/components/warning-text/) supports prominent warnings when evidence conflicts or the reviewer could misread a financial record.
- [GOV.UK Tag](https://design-system.service.gov.uk/components/tag/) supports compact status labels for evidence groups and refund state.
- [USWDS Table](https://designsystem.digital.gov/components/table/) supports accessible dense tabular records for timelines, issue lists, and audit events.
- [W3C WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) requires status changes to be programmatically announced without moving focus unexpectedly.
- [W3C WCAG 2.2 error prevention for legal, financial, data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) reinforces that financial evidence screens need review, correction, and confirmation patterns around high-risk actions. This screen is read-only, but it must still route high-risk actions to dedicated confirmation screens.

Kra-specific sources:
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/27-admin-refund-settlement.md`

## Information Architecture
Page sections, top to bottom:
- Evidence status header.
- Critical record strip.
- Evidence completeness rail.
- Refund policy decision card.
- Payment and provider evidence.
- Delivery stage and quote evidence.
- Custody and handoff evidence.
- Proof and final-mile evidence.
- Issues and dispute evidence.
- Audit and staff activity evidence.
- Next action routing.
- Implementation diagnostics.

Desktop layout:
- Header spans full width.
- Main body uses three columns.
- Left column width: `280px` completeness rail.
- Center column min width: `640px` evidence body.
- Right column width: `360px` policy and route rail.
- Sticky right rail begins below header.
- Evidence body uses cards with section anchors.

Tablet layout:
- Header full width.
- Completeness rail becomes horizontal segmented control.
- Right rail moves below payment card.
- Evidence cards remain stacked.

Mobile web fallback:
- Single-column layout.
- Sticky bottom anchor bar with `Summary`, `Payment`, `Timeline`, `Issues`, `Audit`.
- No hover-only information.
- Tables become card rows with visible labels.

## First Viewport
The first viewport must show:
- Screen title: `Refund evidence`
- Payment ID.
- Delivery ID when known.
- Refund state label.
- Evidence completeness score.
- Highest-risk missing or conflicting evidence.
- Refund amount if known.
- Refund reason if known.
- Refund reference if settled and known.
- Primary route action for next step.
- Last refreshed timestamp.

Header example:
```text
Refund evidence
PAY-7006
Refund settled
Evidence complete: 7 of 7 groups
GHS 35 refund for full refund before origin intake
Reference RFD-MTN-7006 recorded 20 May 2026, 10:30
```

Partial example:
```text
Refund evidence
PAY-7006
Refund pending
Evidence partial: 4 of 7 groups
Delivery timeline is not loaded, so custody and proof cannot be verified here.
```

Conflict example:
```text
Refund evidence
PAY-7006
Policy conflict
Refund reason says doorstep surcharge refund, but timeline shows a completed doorstep attempt.
```

## Evidence Status Model
The screen derives a display state from all loaded evidence.

| Derived state | Trigger | Primary label | Primary action |
| --- | --- | --- | --- |
| `ready_complete` | Payment, delivery, timeline, issue, and audit evidence loaded with no conflict | `Evidence complete` | `Open delivery detail` |
| `ready_partial` | Payment exists, but one or more context sources are unavailable | `Evidence partial` | `Retry missing evidence` |
| `evidence_missing` | Required evidence for the current refund state is absent | `Evidence missing` | `Open source record` |
| `payment_not_found` | No payment source can resolve route `paymentId` | `Payment not found` | `Open finance summary` |
| `delivery_not_found` | Payment has delivery ID, but delivery lookup fails | `Delivery not found` | `Open issue queue` |
| `policy_conflict` | Refund reason conflicts with loaded delivery or timeline evidence | `Policy conflict` | `Open refund review` or `Open issue detail` |
| `not_authorized` | Backend returns `FORBIDDEN` | `Access denied` | `Request access` |
| `session_expired` | Auth token is expired or missing | `Session expired` | `Sign in again` |
| `stale_context` | Cached refund state differs from fresh source response | `Record changed` | `Refresh evidence` |
| `api_error` | Unexpected read failure | `Could not load evidence` | `Retry` |

State priority:
- `not_authorized`
- `session_expired`
- `payment_not_found`
- `delivery_not_found`
- `policy_conflict`
- `evidence_missing`
- `stale_context`
- `ready_partial`
- `ready_complete`
- `api_error`

## Evidence Completeness Groups
Show seven evidence groups in a rail.

Groups:
- Payment identity.
- Refund decision.
- Settlement record.
- Delivery stage.
- Custody chain.
- Proof records.
- Issues and audit.

Group statuses:
- `complete`
- `partial`
- `missing`
- `conflict`
- `not_applicable`
- `unavailable`

Completeness rules:
- Payment identity is complete when `paymentId`, `deliveryId`, `provider`, `providerReference`, `amountGhs`, and `status` are known.
- Refund decision is complete when `refundAmountGhs`, `refundReason`, and approval/request timestamp are known from success state, payment metadata, audit, or related issue.
- Settlement record is complete when payment is `refunded` and `refundReference` plus settlement timestamp are known.
- Settlement record is not applicable when payment is `confirmed`, `pending`, or `failed` with no approved refund.
- Settlement record is partial when payment is `refunded` but reference or settlement timestamp is not available in this view.
- Delivery stage is complete when `get_delivery` returns delivery status, payment status, quote, service type, latest event, and latest touchpoint.
- Custody chain is complete when timeline includes expected handoff events for the delivery stage.
- Proof records are complete when final proof is present for delivered jobs or proof is not required for the refund path.
- Issues and audit are complete when related issue list and target audit records are loaded.

Do not compress completeness into one badge only. Reviewers must see which group is incomplete and why.

## Policy Evidence Mapping
Map refund reason to expected evidence:

| Refund reason | Expected supporting evidence | Conflict trigger |
| --- | --- | --- |
| `full_refund_pre_intake` | Delivery never reached confirmed origin intake, or cancellation before intake with confirmed payment | Timeline shows accepted origin intake before refund approval |
| `duplicate_charge` | More than one provider or internal payment record for the same delivery amount | Only one payment row is known and no provider mismatch exists |
| `platform_payment_error` | Provider or internal reconciliation indicates payment system failure | Payment is confirmed without reconciliation issue or provider error context |
| `never_received_at_origin` | Sender paid, but station intake event is absent or issue confirms origin non-receipt | Timeline shows station accepted package and no loss issue exists |
| `post_intake_handling_fee` | Cancellation after origin intake but before dispatch, with handling fee retained | Timeline shows dispatch or delivery after intake |
| `doorstep_surcharge_refund` | Doorstep surcharge charged, but no valid doorstep attempt occurred | Timeline shows out-for-delivery, failed doorstep attempt, or final-mile completion |
| `express_surcharge_refund` | Express surcharge charged, but express handling was not performed because of platform-side or staff-side failure | Service type and timeline show express handling completed |

When evidence conflicts:
- Show `policy_conflict`.
- Explain the exact mismatch in one sentence.
- Link to `AdminRefundReview`, `AdminIssueDetail`, and `AdminDeliveryDetail`.
- Do not provide local override controls.

## Payment Evidence Card
Fields:
- Payment ID.
- Delivery ID.
- Provider.
- Provider reference.
- Internal payment status.
- Charged amount.
- Refund amount if known.
- Refund reason if known.
- Initiated at.
- Verified at.
- Refund requested at if known.
- Refund reference if known.
- Refund settled at if known.
- Reconciliation status if known.

Presentation:
- Use a summary-card pattern with no edit controls.
- Show copy actions only for IDs and references.
- Copy actions must use accessible labels such as `Copy payment ID PAY-7006`.
- Copy success must announce through a live region.
- Do not expose raw provider credentials.
- Do not mask provider reference for finance admin, but do not expose payer phone unless required by an existing source and role permits it.

Status labels:
- `confirmed`: `Confirmed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`
- `failed`: `Failed`
- `pending`: `Pending`

Payment evidence warnings:
- `Payment status is refund pending but no refund amount is visible in this view.`
- `Payment status is refunded but no refund reference is visible in this view.`
- `Payment amount and refund amount differ. Check the policy reason before customer communication.`
- `Provider status differs from internal status. Open reconciliation.`

## Refund Decision Card
Show:
- Decision state.
- Refund reason.
- Refund amount.
- Request timestamp.
- Approval source if known.
- Manual review flag if known.
- Policy path.
- Settlement requirement.

Decision states:
- `No refund activity`
- `Review needed`
- `Approved, pending settlement`
- `Settled`
- `Conflicting evidence`
- `Incomplete record`

Copy:
```text
This card explains the refund decision recorded by Kra. Use the linked source screens for actions.
```

For `refund_pending`:
```text
Refund is approved and waiting for finance settlement.
```

For `refunded`:
```text
Refund is recorded as settled in Kra.
```

For missing evidence:
```text
Kra does not have enough loaded evidence on this page to explain the refund decision.
```

## Settlement Evidence Card
Show when payment is `refund_pending` or `refunded`.

Fields:
- Settlement status.
- Required action.
- Refund reference.
- Settlement timestamp.
- Notification expectation.
- Settlement source route.

For `refund_pending`:
- Label: `Settlement pending`.
- Action: `Open refund settlement`.
- Explain that `AdminRefundSettlement` owns the `settle_refund_payment` mutation.

For `refunded`:
- Label: `Settlement recorded`.
- Show `refundReference`.
- Show `refundSettledAt` or settlement response timestamp.
- State that backend queues sender notification type `refund_completed` when settlement succeeds.

Missing settlement reference:
- Show a high-risk warning.
- Route to audit events and payment reconciliation.
- Do not add a manual reference editor.

## Delivery Evidence Card
Use `get_delivery` when delivery ID is known.

Fields:
- Delivery ID.
- Tracking code.
- Sender ID.
- Origin station.
- Destination station.
- Current status.
- Payment status.
- Service type.
- Doorstep requested.
- Doorstep distance if present.
- Quote total.
- Current custody role.
- Current custody actor.
- Assigned driver if present.
- Assigned final-mile courier if present.
- Latest event type.
- Latest event timestamp.
- Latest touchpoint role.
- Latest touchpoint station if present.
- Final proof if present.
- Created at.

Evidence flags:
- Delivery payment status differs from payment status.
- Delivery status is before origin intake.
- Delivery status is after dispatch.
- Delivery has final proof.
- Delivery lacks final proof where final delivery is claimed.
- Doorstep was requested.
- Doorstep was converted to station pickup.
- Issue reported.

Do not show receiver phone or private receiver verification tokens on this screen unless an existing admin contract explicitly provides them and role policy allows it.

## Timeline Evidence Card
Use `get_delivery_timeline` when delivery ID is known.

Timeline entry fields:
- Entry ID.
- Entry type.
- Label.
- Occurred at.
- Actor ID.
- Actor role.
- Station ID.
- Metadata.

Entry groups:
- Delivery events.
- Handoff events.
- Issue events.

Sort:
- Default newest first to match backend response.
- Offer reviewer toggle for oldest first.
- Preserve keyboard focus when sorting.

Important event detection:
- Origin intake.
- Origin dispatch.
- Driver pickup.
- In transit.
- Destination receipt.
- Final-mile assignment.
- Out for delivery.
- Failed doorstep attempt.
- Return to station.
- Final delivery.
- Issue reported.

Timeline empty state:
```text
No timeline entries were returned for this delivery. Open delivery detail before making customer or finance decisions.
```

Timeline partial state:
```text
Timeline loaded, but handoff or proof metadata needed for this refund reason is absent.
```

## Custody And Handoff Evidence
Use timeline `handoff_event` entries and metadata.

Show:
- Handoff event ID.
- Handoff type.
- From actor when available.
- To actor when available.
- Actor role.
- Station.
- Proof type.
- Proof reference.
- Condition if available.
- Occurred at.

Custody chain tests:
- Origin station is accountable from intake until driver handoff.
- Driver is accountable from origin pickup until destination receipt.
- Destination station is accountable from receipt until receiver pickup or final-mile handoff.
- Final-mile courier is accountable from final-mile handoff until delivered or returned.

Evidence rules:
- A refund involving loss must identify the last accountable custody segment.
- A refund involving damage must show condition evidence when available.
- A refund involving doorstep surcharge must show whether a valid doorstep attempt occurred.
- A refund involving final delivery must show final proof or explain why final proof is absent.

Do not allow custody edits, overrides, or issue resolution here.

## Proof Evidence Card
Show final proof from delivery detail when available.

Fields:
- Proof type.
- Proof reference.
- Received by name.
- Captured at.

Supported final proof types should align with backend delivery proof rules:
- `otp`
- `signature`
- `delivery_photo`

Proof interpretation:
- `otp` is default final-mile proof.
- `signature` and `delivery_photo` require backend proof asset references where used by completion flows.
- A delivery cannot be treated as complete without accepted proof and timestamp.
- Missing final proof is acceptable only if the delivery was not in a delivered state.

Visual treatment:
- Show proof as a sealed evidence card with a lock icon or equivalent admin-safe symbol.
- Do not render private asset URLs from raw storage paths.
- If proof asset preview is unavailable through a frontend-safe URL, show reference and metadata only.

## Issue Evidence Card
Use issue list by delivery ID when available.

Issue fields:
- Issue ID.
- Delivery ID.
- Status.
- Severity.
- Category.
- Summary.
- Reporter actor role.
- Created at.
- Updated at.
- Escalated at if present.
- Resolved at if present.
- Resolution code if present.
- Resolution note if present.

Issue categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Important issue resolution codes:
- `refund_approved`
- Any code containing payment, loss, damage, handoff, or compensation terms exposed by the backend.

Issue filtering:
- Default show all related issues.
- Provide chips for `payment`, `loss`, `damage`, `handoff`.
- Provide severity filter.
- Do not hide resolved issues by default; refund evidence often depends on resolved history.

Issue actions:
- `Open issue detail`.
- `Open issue queue`.
- `Open delivery detail`.

Do not provide issue resolve, escalate, close, or edit actions here.

## Audit Evidence Card
Use admin audit events where access allows.

Target queries:
- Payment target for `paymentId`.
- Delivery target for `deliveryId`.
- Issue target for issue IDs when needed.

Audit fields:
- Audit event ID.
- Action.
- Actor ID.
- Actor role.
- Occurred at.
- Station ID if present.
- Target type.
- Target ID.
- Metadata summary.

Audit grouping:
- Refund approval.
- Refund settlement.
- Payment reconciliation review.
- Delivery status changes.
- Custody handoff operations.
- Issue escalation or resolution.
- Staff access changes when relevant.

Audit empty state:
```text
No audit events were returned for this target. Use delivery detail and issue detail before relying on this record alone.
```

Audit security:
- Do not expose raw secrets in metadata.
- Collapse unknown metadata keys behind `View technical metadata`.
- Only show metadata values already returned by the admin audit contract.

## Critical Missing Evidence Logic
For each refund path, missing evidence should be explicit.

Full refund before intake:
- Missing payment confirmation.
- Missing delivery stage.
- Missing origin intake absence evidence.

Duplicate charge:
- Missing second payment or provider duplicate evidence.
- Missing reconciliation context.

Platform payment error:
- Missing reconciliation reason or provider failure record.
- Missing payment provider reference.

Never received at origin:
- Missing station intake absence evidence.
- Missing issue or timeline support.

Post-intake handling fee:
- Missing origin intake event.
- Missing dispatch absence evidence.
- Missing quote or handling fee context.

Doorstep surcharge refund:
- Missing doorstep request state.
- Missing doorstep attempt timeline.
- Missing quote context for surcharge.

Express surcharge refund:
- Missing service type.
- Missing express handling evidence.
- Missing staff or platform failure issue.

Each missing evidence item must include:
- What is missing.
- Why it matters.
- Source screen to open.
- Whether this blocks approval, settlement, customer communication, or only audit completeness.

## Next Action Routing
This screen routes actions to owner screens.

| Condition | Action label | Route | Notes |
| --- | --- | --- | --- |
| Payment is `confirmed` and refund may be eligible | `Open refund review` | `/admin/finance/refunds/:paymentId/review` | Approval belongs there |
| Payment is `refund_pending` | `Open refund settlement` | `/admin/finance/refunds/:paymentId/settle` | Settlement belongs there |
| Payment is `refunded` | `View settlement evidence` | Current route | Keep reviewer here |
| Provider mismatch exists | `Open reconciliation` | `/admin/finance/reconciliation/:paymentId` | Hydrate from reconciliation list |
| Delivery ID is known | `Open delivery detail` | `/admin/deliveries/:deliveryId` | Delivery source of truth |
| Issue ID is known | `Open issue detail` | `/admin/issues/:issueId` | Issue action owner |
| Audit evidence needed | `Open audit events` | `/admin/audit-events?targetType=payment&targetId=:paymentId` | Audit source |
| Payment cannot be found | `Open finance summary` | `/admin/finance` | Payment list source |

Disable action buttons when the target ID is unknown.

Action labels must be specific. Do not use vague labels like `Continue`.

## Read-Only Boundary
This screen must never include:
- Refund approval submit button.
- Refund settlement form.
- Refund reference editor.
- Refund amount editor.
- Payment status editor.
- Provider status editor.
- Cash refund control.
- Alternate payout path control.
- Payer phone editor.
- Receiver verification controls.
- Custody override controls.
- Proof upload controls.
- Issue resolve or escalation submit controls.
- Audit metadata editor.
- Manual notification send button.
- Raw provider credential display.

If a future backend mutation is added, it must get its own screen or modal spec before this screen is changed.

## Data Fetching Contract
Recommended fetch sequence:
1. Resolve payment context from navigation state or cache.
2. Fetch `admin_finance` if payment is not in cache.
3. Fetch `admin_payment_reconciliation?limit=100` if payment is still unresolved or provider status is needed.
4. If delivery ID is known, fetch `get_delivery`.
5. If delivery fetch succeeds, fetch `get_delivery_timeline`.
6. If delivery ID is known, fetch `list_issues?deliveryId=:deliveryId&limit=100`.
7. Fetch audit events for payment target.
8. Fetch audit events for delivery target if delivery ID is known.
9. Fetch audit events for selected issue targets as user expands the issue section.

Do not block the first meaningful paint on audit events.

Use separate loading states:
- Payment loading.
- Delivery loading.
- Timeline loading.
- Issue loading.
- Audit loading.

Use separate retry controls:
- Retry payment.
- Retry delivery.
- Retry timeline.
- Retry issues.
- Retry audit.

Do not retry mutations because this screen has none.

## Cache And Freshness
Freshness rules:
- Show cached navigation state immediately.
- Trigger background refresh for source records.
- Mark source cards as `Refreshing` while refresh is active.
- If refreshed state differs from cached state, show `Record changed`.
- If payment moves from `refund_pending` to `refunded`, update status and settlement evidence.
- If payment moves from `confirmed` to `refund_pending`, show refund approval evidence as partial until amount and reason are known.

Stale warning:
```text
This evidence changed since you opened the page. Review the refreshed values before acting elsewhere.
```

Cache invalidation:
- Invalidate payment context after returning from refund review.
- Invalidate payment context after returning from refund settlement.
- Invalidate delivery context after custody or issue actions from other screens.
- Invalidate issue context after issue detail changes from other screens.

## Empty States
Payment not found:
```text
We could not find payment PAY-7006 in finance or reconciliation records.
```

Delivery unknown:
```text
Payment evidence is loaded, but this view does not know the delivery ID yet.
```

No issues:
```text
No support issues are linked to this delivery.
```

No audit events:
```text
No audit events were returned for this target.
```

No final proof:
```text
No final proof is visible for this delivery in the current delivery state.
```

No timeline:
```text
No delivery timeline entries were returned.
```

## Error States
Access denied:
```text
You do not have access to this refund evidence.
```

Session expired:
```text
Your session expired. Sign in again to review refund evidence.
```

API error:
```text
Kra could not load this evidence group. Retry or open the source record.
```

Policy conflict:
```text
The loaded evidence conflicts with the recorded refund reason.
```

Delivery not found:
```text
The payment links to a delivery that could not be found.
```

Error rendering:
- Keep successful cards visible.
- Place error messages inside the affected evidence group.
- Do not replace the whole page unless payment identity itself is unavailable.
- All errors must be screen-reader visible.

## Visual Design System
Art direction:
- High-trust operations case file.
- Warm neutral background.
- Ink-heavy text.
- Crisp evidence cards.
- Fine-grid separators.
- Minimal motion.
- Strong status color only for risk.

Color tokens:
- `--refund-bg`: `#F6F2EA`
- `--refund-surface`: `#FFFCF5`
- `--refund-surface-raised`: `#FFFFFF`
- `--refund-ink`: `#15110B`
- `--refund-muted`: `#6B6258`
- `--refund-line`: `#DED4C6`
- `--refund-good`: `#187A4D`
- `--refund-warn`: `#A15C00`
- `--refund-danger`: `#B3261E`
- `--refund-info`: `#245B84`
- `--refund-action`: `#17324D`
- `--refund-action-hover`: `#0F253B`
- `--refund-focus`: `#F6C84C`

Typography:
- Use the admin product font already selected by the app.
- If the admin console has no committed type system yet, use `IBM Plex Sans` for interface and `IBM Plex Mono` for IDs.
- Do not use default browser font stacks unless the app design system requires them.
- IDs and references use tabular or monospace numerals.
- Status labels use sentence case.

Spacing:
- Page max width: `1440px`.
- Header padding desktop: `32px`.
- Card padding desktop: `24px`.
- Card radius: `18px`.
- Dense timeline row min height: `56px`.
- Section gap: `20px`.
- Evidence card internal gap: `16px`.

Motion:
- Fade in evidence cards once per source group load.
- Use a 140ms status pulse only when stale data is replaced by fresh data.
- Do not animate numeric IDs.
- Respect reduced motion.

## Component Inventory
Required components:
- `AdminEvidencePageShell`
- `RefundEvidenceHeader`
- `RefundStatusBadge`
- `EvidenceCompletenessRail`
- `EvidenceCompletenessItem`
- `PaymentEvidenceCard`
- `RefundDecisionCard`
- `SettlementEvidenceCard`
- `DeliveryEvidenceCard`
- `TimelineEvidenceTable`
- `CustodyEvidenceCard`
- `ProofEvidenceCard`
- `IssueEvidenceTable`
- `AuditEvidenceTable`
- `PolicyConflictBanner`
- `MissingEvidenceList`
- `EvidenceSourceError`
- `EvidenceSourceRetry`
- `EvidenceRouteActions`
- `CopyEvidenceValueButton`
- `RecordChangedNotice`
- `TechnicalMetadataDisclosure`

Shared components may be reused if they meet this spec:
- Admin shell.
- Status badge.
- Table.
- Summary card.
- Empty state.
- Error state.
- Copy button.
- Section anchor navigation.

Component boundaries:
- Payment evidence owns payment formatting only.
- Refund decision card owns policy interpretation only.
- Timeline card owns event ordering only.
- Custody card owns accountable segment interpretation only.
- Issue table owns linked issues only.
- Audit table owns audit event display only.
- Next action routing owns navigation only.

## Accessibility Requirements
The page must meet WCAG 2.2 AA.

Required:
- Main `h1` is `Refund evidence`.
- Payment ID must be visible near `h1`.
- Evidence group headings use semantic heading order.
- Completeness rail uses buttons or links with accessible names.
- Status changes use `aria-live="polite"`.
- Critical conflicts use `role="alert"` only when first detected after load.
- Copy buttons announce success without moving focus.
- Tables have captions.
- Timeline sort controls have visible labels.
- Section anchors are keyboard reachable.
- Focus remains on retry button if retry fails.
- Focus moves to evidence group heading after successful retry only if the user requested it.
- Color cannot be the only indicator of status.
- All status badges include text.
- High-risk warnings include icon plus text.
- Reduced-motion users must not receive pulsing or sliding transitions.

Keyboard behavior:
- `Tab` moves through header actions, rail, section actions, and tables in visual order.
- `Enter` activates section navigation and route actions.
- `Escape` closes metadata disclosure.
- Arrow keys may move within segmented controls only when implemented with appropriate ARIA patterns.

## Privacy And Security
Do:
- Show only fields returned by authorized admin APIs.
- Redact payer phone unless an explicit admin contract and role policy permits display.
- Keep provider reference copyable for finance roles.
- Collapse raw metadata by default.
- Treat proof asset references as sensitive operational evidence.
- Respect `FORBIDDEN` from every source independently.

Do not:
- Store provider references in local storage.
- Persist copied values beyond clipboard action.
- Render raw storage object paths as public links.
- Expose receiver phone verification tokens.
- Expose provider credentials.
- Log raw evidence metadata to analytics.
- Send evidence payloads to non-Kra third-party analytics.

## Analytics
Track only operational events without sensitive payload values.

Events:
- `admin_refund_evidence_viewed`
- `admin_refund_evidence_group_opened`
- `admin_refund_evidence_retry_clicked`
- `admin_refund_evidence_route_clicked`
- `admin_refund_evidence_copy_clicked`
- `admin_refund_evidence_conflict_seen`
- `admin_refund_evidence_stale_context_seen`

Event properties:
- `paymentStatus`
- `refundState`
- `evidenceCompleteness`
- `missingGroupCount`
- `conflictCount`
- `sourceScreen`
- `role`

Never track:
- Provider reference.
- Payer phone.
- Receiver data.
- Proof reference.
- Raw issue description.
- Raw audit metadata.
- Staff note text.

## Performance
Targets:
- First meaningful paint under `1.8s` on a normal admin connection.
- Payment evidence visible before audit evidence.
- Timeline renders first `50` rows immediately.
- Longer tables use progressive rendering or pagination.
- Section navigation remains responsive during background refresh.

Data strategy:
- Parallelize independent reads after delivery ID is known.
- Defer issue audit details until issue row expansion.
- Avoid repeated full reconciliation fetches if cache already has current payment row.
- Use query cancellation when leaving the route.
- Preserve existing cached evidence while refreshing.

## Responsive Requirements
Desktop:
- Three-column case-file layout.
- Sticky completeness rail.
- Sticky policy rail.
- Dense evidence tables.

Tablet:
- Two-column layout where policy rail moves below header.
- Completeness rail becomes horizontal.
- Timeline remains table if width permits.

Mobile:
- Single column.
- Tables become labeled record cards.
- Copy buttons remain available.
- Sticky bottom section nav.
- No horizontal scrolling except inside code-like metadata blocks.

## Copy System
Voice:
- Precise.
- Calm.
- Operational.
- Evidence-first.
- No blame language.
- No customer-facing promises beyond backend state.

Preferred words:
- `evidence`
- `record`
- `source`
- `loaded`
- `unavailable`
- `conflict`
- `settled`
- `pending settlement`
- `open source record`

Avoid:
- `guaranteed`
- `paid out` unless backend says settled and business language chooses that term.
- `lost forever`
- `fraud` unless a formal issue or policy record supports it.
- `manual fix`
- `quick refund`

CTA examples:
- `Open refund review`
- `Open refund settlement`
- `Open reconciliation`
- `Open delivery detail`
- `Open issue detail`
- `Open audit events`
- `Retry timeline`
- `Copy payment ID`

## Acceptance Criteria
Functional:
- Route renders with `data-testid="screen-admin-refund-evidence-review"`.
- Route reads `paymentId` from URL params.
- Screen resolves payment evidence from cache, navigation state, finance, or reconciliation.
- Screen does not call unsupported single-payment endpoint.
- Screen fetches delivery detail only when delivery ID is known.
- Screen fetches delivery timeline only when delivery ID is known.
- Screen fetches issues by delivery ID only when delivery ID is known.
- Screen fetches audit events by target when access allows.
- Screen shows `payment_not_found` when payment cannot be resolved.
- Screen shows `delivery_not_found` when linked delivery cannot be fetched.
- Screen shows `ready_partial` when at least payment evidence exists but context is incomplete.
- Screen shows `ready_complete` when all required groups for the current refund path are loaded.
- Screen shows `policy_conflict` when refund reason conflicts with loaded evidence.
- Screen routes action ownership to other screens.
- Screen never calls `refund_payment`.
- Screen never calls `settle_refund_payment`.
- Screen never edits payment, delivery, issue, proof, or audit data.

Evidence:
- Payment evidence card shows payment ID, delivery ID, provider, provider reference, status, amount, and timestamps when available.
- Refund decision card shows reason and amount when available.
- Settlement card shows refund reference and timestamp when available.
- Delivery card shows status, payment status, service type, quote, custody role, and final proof when available.
- Timeline card shows delivery, handoff, and issue entries.
- Custody card identifies accountable segment from handoff records.
- Proof card shows final proof metadata when available.
- Issue card shows related issues and links to issue detail.
- Audit card shows target audit events and links to audit events screen.
- Missing evidence list explains source, impact, and route.

Accessibility:
- Screen has semantic headings.
- All tables have captions.
- Status changes are announced.
- Copy success is announced.
- Keyboard access works for all controls.
- No information is color-only.
- Reduced motion is respected.

Security:
- Provider credentials are never displayed.
- Raw metadata is collapsed.
- Sensitive IDs are copied only by explicit user action.
- Analytics excludes sensitive payload values.
- Unauthorized source errors do not leak restricted data.

## Test Matrix
Unit tests:
- Derives `ready_complete`.
- Derives `ready_partial`.
- Derives `payment_not_found`.
- Derives `delivery_not_found`.
- Derives `policy_conflict`.
- Maps all refund reasons to expected evidence.
- Flags missing settlement reference for `refunded`.
- Flags missing refund amount for `refund_pending`.
- Blocks mutation actions from rendering.
- Builds route actions with required IDs only.
- Redacts disallowed fields.

Integration tests:
- Opens from refund settlement success and shows settled evidence.
- Opens from refund review success and shows pending settlement evidence.
- Opens from finance summary row and resolves payment context.
- Opens from reconciliation detail and shows provider mismatch.
- Loads delivery and timeline after delivery ID is known.
- Shows issue list for delivery.
- Shows audit event groups.
- Retries failed timeline without clearing payment evidence.
- Refreshes stale cached state and shows record changed notice.
- Handles `FORBIDDEN` for audit while payment and delivery remain visible.

End-to-end tests:
- `e2e-admin-refund-evidence-settled`: Finance opens settled refund and sees reference, amount, reason, delivery, timeline, and audit routes.
- `e2e-admin-refund-evidence-pending`: Finance opens pending refund and routes to settlement.
- `e2e-admin-refund-evidence-conflict`: Reviewer sees policy conflict and routes to issue or review screen.
- `e2e-admin-refund-evidence-partial`: Reviewer sees payment-only evidence and source-specific missing evidence.
- `e2e-admin-refund-evidence-access`: Restricted user sees access denial without leaked data.

Visual tests:
- Desktop three-column layout.
- Tablet horizontal completeness rail.
- Mobile single-column evidence cards.
- Long timeline rows.
- Long issue summaries.
- Long provider reference.
- Conflict banner.
- Partial source failure.
- Reduced-motion mode.

## Implementation Notes For Claude Code
Build this as a read-only composed evidence route.

Use existing API hooks where available:
- `useAdminFinanceQuery`
- `useAdminPaymentReconciliationQuery`
- `useDeliveryQuery`
- `useDeliveryTimelineQuery`
- `useIssuesQuery`
- `useIssueQuery`
- `useAdminAuditEventsQuery`

If these hooks do not exist yet, create hooks that match the existing API client conventions. Do not create backend endpoints from the frontend implementation.

Recommended files:
- `apps/admin/src/routes/admin-refund-evidence-review.tsx`
- `apps/admin/src/features/refunds/AdminRefundEvidenceReview.tsx`
- `apps/admin/src/features/refunds/refundEvidenceModel.ts`
- `apps/admin/src/features/refunds/refundEvidenceModel.test.ts`
- `apps/admin/src/features/refunds/components/RefundEvidenceHeader.tsx`
- `apps/admin/src/features/refunds/components/EvidenceCompletenessRail.tsx`
- `apps/admin/src/features/refunds/components/PaymentEvidenceCard.tsx`
- `apps/admin/src/features/refunds/components/RefundDecisionCard.tsx`
- `apps/admin/src/features/refunds/components/SettlementEvidenceCard.tsx`
- `apps/admin/src/features/refunds/components/DeliveryEvidenceCard.tsx`
- `apps/admin/src/features/refunds/components/TimelineEvidenceTable.tsx`
- `apps/admin/src/features/refunds/components/IssueEvidenceTable.tsx`
- `apps/admin/src/features/refunds/components/AuditEvidenceTable.tsx`

Model helpers:
- `deriveRefundEvidenceState`
- `deriveEvidenceCompleteness`
- `mapRefundReasonToEvidenceNeeds`
- `detectPolicyConflicts`
- `buildMissingEvidenceItems`
- `buildRefundEvidenceActions`
- `redactRefundEvidenceForRole`

Do not couple display components directly to raw API responses. Normalize to a `RefundEvidenceViewModel` first.

## Open Backend Gaps
The current backend can support this screen as a composed read-only view, but these gaps should remain visible:
- No dedicated `GET /v1/admin/refunds/:paymentId/evidence` endpoint.
- Admin finance rows do not expose `refundReason`, `refundReference`, or `refundSettledAt`.
- Reconciliation rows expose refunded amount but not refund reason or settlement reference.
- Delivery detail exposes final proof metadata but not public proof preview URLs.
- Audit event filtering depends on current audit query capabilities.
- There is no backend refund rejection endpoint.
- There is no backend alternate refund path endpoint.

Frontend must not paper over these gaps with invented values.

## Final Instruction To Claude Code
Build `AdminRefundEvidenceReview` as a read-only, high-trust refund case file. Resolve payment evidence from navigation state, cache, finance, or reconciliation; load delivery, timeline, issues, and audit when IDs are known; derive completeness and policy conflict states; show exact missing evidence; route actions to owner screens; and never call refund approval, settlement, payment editing, issue mutation, custody override, or proof upload operations from this route.
