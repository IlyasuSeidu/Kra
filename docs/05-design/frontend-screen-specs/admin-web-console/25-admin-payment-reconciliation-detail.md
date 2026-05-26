# Admin Payment Reconciliation Detail Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID              | `AdminPaymentReconciliationDetail`                                                                                                                                                                                           |
| Route                  | `/admin/finance/reconciliation/:paymentId`                                                                                                                                                                                   |
| Primary test ID        | `screen-admin-payment-reconciliation-detail`                                                                                                                                                                                 |
| Surface                | Admin web console                                                                                                                                                                                                            |
| Backend coverage       | `admin_payment_reconciliation` row context                                                                                                                                                                                   |
| Offline critical       | No                                                                                                                                                                                                                           |
| Required read role     | `finance_admin` or `super_admin` with `review_reconciliation` capability                                                                                                                                                     |
| Required mutation role | No mutation on this screen                                                                                                                                                                                                   |
| Required states        | `loading`, `ready`, `conflict`, `resolved`, `row_not_found`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error`, `invalid_row`                                                                          |
| Parent screens         | `AdminPaymentReconciliation`, `AdminFinanceSummary`                                                                                                                                                                          |
| Related screens        | `AdminPaymentReconciliation`, `AdminFinanceSummary`, `AdminRefundReview`, `AdminRefundSettlement`, `AdminRefundEvidenceReview`, `AdminWebhookEvents`, `AdminStaffActivityLog`, `AdminDeliveryDetail`, `AdminLaunchReadiness` |

## Purpose

`AdminPaymentReconciliationDetail` is the single-record evidence view for a reconciliation row. It lets finance inspect one payment mismatch in depth, compare internal and provider status, verify the amount trail, review attempt history fields exposed by the backend, copy finance identifiers, and route to delivery, webhook, audit, refund, or finance summary screens.

The screen should answer:

- `Which payment is being reviewed?`
- `Why is this record in reconciliation review?`
- `What does Kra know about quoted, charged, and refunded amounts?`
- `What is the internal payment status?`
- `What is the provider status?`
- `How many reconciliation attempts occurred?`
- `When was the payment initiated?`
- `When was reconciliation last checked?`
- `When did review become required?`
- `Has this record already been reviewed?`
- `What should finance open next?`

This screen is an evidence and routing surface. It must not approve refunds, settle refunds, manually mark a payment confirmed or failed, run the internal worker, edit provider references, or resolve reconciliation state unless a backend mutation is added later.

## Backend Reality

There is no dedicated single-payment reconciliation endpoint in the current backend.

The available endpoint is:

```http
GET /v1/admin/payment-reconciliation
```

Operation:

```text
admin_payment_reconciliation
```

Capability:

```text
review_reconciliation
```

Current route reality:

- The frontend route includes `:paymentId`.
- The backend endpoint returns an array of rows.
- The screen must locate the target `paymentId` from navigation state, query cache, or a fresh reconciliation response.
- The backend query supports only `reviewReason` and `limit`.
- The backend query does not support `paymentId`.
- The backend response includes structured rows and backend CSV text.
- The screen may use the structured row for detail display.
- The screen must not generate a new backend query parameter for `paymentId`.
- The screen must not call the internal worker endpoint.

Reconciliation row shape:

```json
{
  "businessDate": "2026-05-20",
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
  "initiatedAt": "2026-05-20T08:00:00.000Z",
  "lastReconciliationAt": "2026-05-20T08:30:00.000Z",
  "reviewRequiredAt": "2026-05-20T08:30:00.000Z",
  "reviewedBy": "USR-FIN-001",
  "reviewedAt": "2026-05-20T09:00:00.000Z"
}
```

Important backend facts:

- `reviewedBy` and `reviewedAt` are optional.
- If both are present, the UI may display `Reviewed`.
- If either is absent, the UI must not claim the record is resolved.
- `mismatchType` can be `none`, `verification_unresolved_after_30_minutes`, or `provider_verification_error`.
- Provider payment status can be `pending`, `confirmed`, `failed`, or `unknown`.
- Internal payment status can be `pending`, `confirmed`, `failed`, `refund_pending`, or `refunded`.
- Amount fields are integer GHS values.
- `providerReference` is finance-only data.
- Backend CSV is owned by the list endpoint, not this route.

Therefore:

- This screen must hydrate from known reconciliation row data.
- This screen must show a clear row-not-found state if the payment ID is not in the available response.
- This screen must not call unsupported endpoint shapes.
- This screen must not add `paymentId` query parameter.
- This screen must route decisions to supported detail, refund, delivery, webhook, or audit screens.

## Primary Users

Primary:

- `finance_admin` investigating one reconciliation mismatch.
- `super_admin` reviewing a finance launch blocker.

Secondary:

- Backend engineer reviewing provider verification failure context.
- Support lead checking whether customer messaging is needed.
- Operations lead checking whether dispatch should remain blocked.
- Product owner checking readiness blockers.
- QA validating detail-state behavior.
- Security reviewer validating provider-reference handling.
- Claude Code implementing the admin console later.

Non-users:

- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without reconciliation capability.
- `ops_admin` without reconciliation capability.
- Public visitor.

## User Goal

Authorized finance users use this screen to:

- Inspect one reconciliation row.
- Compare provider and internal payment states.
- Check whether the row is unresolved, provider-error, no-reason, or reviewed.
- Confirm quoted, charged, and refunded values.
- Copy safe finance identifiers.
- Open the related delivery.
- Open webhook event review.
- Open audit evidence.
- Open refund review or settlement only when status makes that route sensible.
- Return to the filtered reconciliation queue.

The screen should reduce ambiguity around one payment without giving finance unsupported write controls.

## Entry Points

The screen can open from:

- `AdminPaymentReconciliation` row action.
- `AdminFinanceSummary` selected payment context if available.
- `AdminLaunchReadiness` finance blocker context.
- `AdminWebhookEvents` matched payment context.
- `AdminStaffActivityLog` payment target context.
- Direct route `/admin/finance/reconciliation/:paymentId`.

The screen must not open from:

- Public web.
- Sender mobile app.
- Receiver tracking.
- Driver mobile app.
- Station operator mobile app.
- Final-mile courier mobile app.
- Unauthenticated routes.

## Scope

In scope:

- Payment ID route parsing.
- Reconciliation row hydration.
- Row-not-found state.
- Mismatch summary.
- Internal vs provider status comparison.
- Amount evidence.
- Timeline evidence from exposed timestamps.
- Review state display.
- Copy actions.
- Navigation to related screens.
- Refresh of reconciliation response.
- Error and authorization states.
- Accessibility and keyboard support.

Out of scope:

- Single-payment backend fetch.
- Payment state mutation.
- Provider status mutation.
- Reconciliation worker execution.
- Refund approval.
- Refund settlement.
- Webhook replay.
- Provider credential changes.
- Provider console embedding.
- CSV editing.
- Payout execution.
- Station-operator compensation.
- Partner settlement.

## Product Position

`AdminPaymentReconciliationDetail` should feel like an evidence dossier. It should be exact, narrow, and sober: one payment, one mismatch, one set of facts, clear next routes.

Design principles:

- Put the mismatch reason first.
- Keep internal and provider facts visually separate.
- Show money values with strict labels.
- Make reviewed state explicit but not editable.
- Show worker boundary.
- Keep provider reference copyable but protected.
- Prefer key-value evidence over decorative visuals.
- Route all decisions to supported workflows.

Restraint rule:

- No graphs.
- No inline state editing.
- No bulk actions.
- No free-text notes unless backend supports them.
- No worker controls.

## External UX Research And References

Use only references that directly apply to evidence review details:

- [GOV.UK summary list](https://design-system.service.gov.uk/components/summary-list/): supports key-value evidence blocks for payment, provider, amount, and timestamp facts.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-action layouts where users need to verify captured information and reduce errors.
- [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/): supports a concise warning for high-impact provider-error or stale finance evidence.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports small related-row tables when detail view includes compact status or amount comparisons.
- [W3C WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): refresh, copy, and row-location feedback must be available to assistive technology.
- [MTN MoMo API](https://momo.mtn.com/api/): relevant to provider reference and transaction-status context for MoMo collection reviews.

How these references affect this screen:

- Use summary lists for evidence.
- Use a check-review structure before routing to high-impact follow-up.
- Use warning text for provider verification errors.
- Use table only for compact status or amount comparison.
- Announce dynamic feedback without moving focus unnecessarily.

## UX Thesis

The page should feel like a finance case file: a clear top risk statement, two columns of evidence, a timeline of checks, and a restrained action rail that routes to the next system of record.

Visual direction:

- Neutral case-file canvas.
- Strong dark headings.
- Amber or red risk panel depending on mismatch.
- Monospace identifiers.
- Side-by-side internal/provider comparison on desktop.
- Stacked evidence cards on mobile.
- Minimal icon use.

Motion direction:

- Use no decorative motion.
- Refresh progress is textual.
- Copy success fades after `3 seconds`.
- Row found after refresh may receive one subtle highlight.
- Respect `prefers-reduced-motion`.

## Information Architecture

Order from top to bottom:

1. Breadcrumb and back link.
2. H1 with payment ID.
3. Risk summary panel.
4. Review state panel.
5. Internal vs provider comparison.
6. Amount evidence.
7. Reconciliation attempt timeline.
8. Identifier and provider evidence.
9. Related actions rail.
10. Worker boundary note.

Desktop layout:

- Left wide column for evidence.
- Right narrow rail for actions and policy boundaries.

Mobile layout:

- One column.
- Risk summary.
- Primary actions.
- Evidence sections.
- Boundary note.

## Header

Required content:

- Breadcrumb: `Admin` -> `Finance` -> `Reconciliation` -> `{paymentId}`.
- Back link: `Back to reconciliation queue`.
- H1: `Payment reconciliation detail`.
- Subheading: `{paymentId}`.
- Refresh action: `Refresh evidence`.
- Generated timestamp from source response when available.

Header behavior:

- If row came from navigation state, show it immediately.
- If row came from cache, show it immediately and refresh in background when appropriate.
- If direct route has no cached row, fetch reconciliation response with current default query and search for `paymentId`.
- If row cannot be found, show row-not-found state.

Do not:

- Call `/v1/admin/payment-reconciliation/:paymentId`.
- Add `paymentId` to query params.
- Show stale row as final truth without timestamp.

## Hydration Strategy

Priority order:

1. Navigation state from list row.
2. Query cache for `admin_payment_reconciliation`.
3. Fresh `GET /v1/admin/payment-reconciliation?limit=100`.
4. Row-not-found state.

Rules:

- Validate row before rendering.
- Preserve source generated timestamp.
- Show source label: `From reconciliation response generated at {time}`.
- If route payment ID differs from row payment ID, discard row and fetch.
- If multiple rows with same payment ID appear, show data integrity error and route to queue.

Row-not-found copy:

```text
This payment is not in the current reconciliation response.
```

Row-not-found body:

```text
The backend does not yet expose a single-payment reconciliation lookup. Return to the queue, change filters, or open the delivery if you have the delivery ID.
```

Actions:

- `Back to reconciliation queue`.
- `Refresh evidence`.
- `Back to finance summary`.

## Risk Summary Panel

Panel content:

- Mismatch label.
- One-sentence meaning.
- Primary concern.
- Suggested next route.

For `verification_unresolved_after_30_minutes`:

- Label: `Unresolved after 30 minutes`.
- Meaning: `Provider verification did not produce a final state after the 5, 15, and 30 minute checks.`
- Tone: amber.
- Suggested route: `Review provider reference and webhook events.`

For `provider_verification_error`:

- Label: `Provider verification error`.
- Meaning: `The provider verification path failed or returned unknown status.`
- Tone: red.
- Suggested route: `Open webhook events and engineering escalation context.`

For `none`:

- Label: `No mismatch reason`.
- Meaning: `The row has no backend mismatch reason. Validate context before acting.`
- Tone: slate.
- Suggested route: `Return to queue or open delivery context.`

Rules:

- Put this panel above all details.
- Use text and color together.
- Do not call unresolved rows failed.
- Do not call provider errors confirmed.
- Do not show completion language unless review fields are present.

## Review State Panel

Display state:

- `Reviewed` when both `reviewedBy` and `reviewedAt` are present.
- `Review required` when `reviewRequiredAt` is present and reviewed fields are absent.
- `Review context incomplete` when neither reviewed nor review-required fields are present.

Reviewed copy:

```text
Reviewed by {reviewedBy} on {reviewedAt}.
```

Review required copy:

```text
Finance review has been required since {reviewRequiredAt}.
```

Incomplete copy:

```text
This row does not include review completion fields. Treat it as unresolved until detail is confirmed elsewhere.
```

Rules:

- Do not provide a `Mark reviewed` button.
- Do not collect review notes.
- Do not invent reviewer names.
- Show user ID exactly if no profile lookup exists.

## Internal Vs Provider Comparison

Display a two-column comparison:

Internal column:

- Internal payment status.
- Payment ID.
- Delivery ID.
- Service entitlement warning.

Provider column:

- Provider status.
- Provider name.
- Provider reference.
- Provider truth warning.

Internal status labels:

- `pending` -> `Internal pending`.
- `confirmed` -> `Internal confirmed`.
- `failed` -> `Internal failed`.
- `refund_pending` -> `Refund pending`.
- `refunded` -> `Refunded`.

Provider status labels:

- `pending` -> `Provider pending`.
- `confirmed` -> `Provider confirmed`.
- `failed` -> `Provider failed`.
- `unknown` -> `Provider unknown`.

Required principle:

```text
Provider records indicate whether money moved. Internal records indicate whether Kra advanced service entitlement.
```

Rules:

- Do not merge statuses into one badge.
- Do not infer provider state from internal state.
- Do not infer internal entitlement from provider state.
- Keep provider reference visible for authorized finance users.

## Amount Evidence

Display a compact table or summary list:

Fields:

- `Quoted amount`: `GHS {quotedAmountGhs}`.
- `Charged amount`: `GHS {chargedAmountGhs}`.
- `Refunded amount`: `GHS {refundedAmountGhs}`.

Flags:

- If charged is greater than quoted, show `Charged amount exceeds quoted amount`.
- If charged is zero and provider status is `confirmed`, show `Provider/internal amount conflict`.
- If refunded is greater than charged, show `Refunded amount exceeds charged amount`.
- If refund exists while internal status is not `refund_pending` or `refunded`, show `Refund status conflict`.

Rules:

- Use integer GHS values.
- Do not calculate revenue.
- Do not calculate profit.
- Do not calculate provider fees.
- Do not calculate payouts.
- Do not hide `GHS 0`.
- Do not turn flags into automatic decisions.

## Reconciliation Timeline

Render known events from exposed fields:

Events:

- `Payment initiated`: `initiatedAt`.
- `Last reconciliation check`: `lastReconciliationAt` or `Not checked yet`.
- `Review required`: `reviewRequiredAt` or `Review not marked`.
- `Reviewed`: `reviewedAt` if present.

Attempt count:

- Label: `Reconciliation attempts`.
- Value: `reconciliationAttemptCount`.

Rules:

- Use absolute times with timezone.
- Do not use relative-only time.
- If attempt count is `0`, show `No recorded reconciliation attempts`.
- If last check is absent but attempt count is greater than `0`, show a validation warning.
- Do not fabricate the 5, 15, 30 minute timestamps unless backend exposes them.

## Identifier Evidence

Display copyable identifiers:

- Payment ID.
- Delivery ID.
- Provider reference.
- Provider.
- Business date.

Rules:

- Provider reference uses monospace and wraps safely.
- Copy actions must be keyboard reachable.
- Copy actions must announce success.
- Do not include copied values in analytics.
- Do not persist provider reference in local storage.
- Do not place provider reference in page title.

Copy success:

- `Payment ID copied.`
- `Delivery ID copied.`
- `Provider reference copied.`

Copy failure:

```text
Could not copy. Select and copy it manually.
```

## Related Actions Rail

Primary action:

- `Back to reconciliation queue`.

Context actions:

- `Open delivery` -> `/admin/deliveries/:deliveryId`.
- `Open webhook events` -> `/admin/webhook-events` if route exists.
- `Open audit log` -> `/admin/staff-activity`.
- `Open finance summary` -> `/admin/finance`.
- `Open refund review` -> `/admin/finance/refunds/:paymentId/review` only when internal status is `confirmed`.
- `Open refund settlement` -> `/admin/finance/refunds/:paymentId/settle` only when internal status is `refund_pending`.
- `Open refund evidence` -> `/admin/finance/refunds/:paymentId/evidence` only when internal status is `refunded`.

Rules:

- Do not show refund actions when status does not allow them.
- Do not show disabled actions without reason.
- Do not show state mutation actions.
- Do not show worker controls.
- Do not show bulk actions.

## Worker Boundary

Show boundary note:

```text
Automated reconciliation is run by backend operations. This detail screen shows evidence and routes follow-up only.
```

Forbidden controls:

- `Run reconciliation`.
- `Retry provider verification`.
- `Mark confirmed`.
- `Mark failed`.
- `Resolve mismatch`.
- `Replay webhook`.
- `Edit provider reference`.
- `Settle refund` inline.

Rules:

- Do not expose `X-Kra-Internal-Task-Secret`.
- Do not expose provider credentials.
- Do not call internal endpoints.

## Stale State

Stale calculation uses source `generatedAt`.

States:

- Less than `5 minutes`: normal.
- `5` to `15 minutes`: quiet warning.
- More than `15 minutes`: high-priority warning.

Quiet copy:

```text
Evidence is more than 5 minutes old. Refresh before acting.
```

High-priority copy:

```text
Refresh evidence before making finance decisions for this payment.
```

Rules:

- Keep stale data visible.
- Disable high-impact route actions only if product decides stale evidence is blocking.
- Always allow back navigation.

## Loading State

Initial direct-route load:

- Show skeleton risk panel.
- Show skeleton evidence sections.
- Show text `Finding reconciliation row`.

Cached-row refresh:

- Keep existing evidence visible.
- Show inline text `Refreshing evidence`.
- Disable refresh button.
- Do not clear copy actions unless row becomes invalid.

Accessibility:

- Mark evidence region `aria-busy="true"`.
- Announce loading with a polite live region.
- Do not move focus on background refresh.

## Error State

Full error title:

```text
Reconciliation evidence could not load
```

Full error body:

```text
Kra could not load the reconciliation response needed for this payment. Try again or return to the queue.
```

Actions:

- `Try again`.
- `Back to reconciliation queue`.
- `Back to finance summary`.

Refresh error:

```text
Could not refresh evidence. Current data is still shown.
```

Rules:

- Preserve prior valid row after refresh failure.
- Show request ID if available.
- Do not show raw error details.
- Do not show provider credentials.
- Do not show internal secrets.

## Authorization State

If forbidden:

Title:

```text
Reconciliation access required
```

Body:

```text
This payment evidence is restricted to admins with reconciliation review access.
```

Actions:

- `Return to finance summary`.
- `Sign in with another account`.

Rules:

- Do not render payment evidence.
- Do not render provider reference.
- Do not render copy actions.
- Clear cached finance data from visible UI.

## Session Expired State

If auth expires:

Title:

```text
Sign in again to view reconciliation evidence
```

Body:

```text
Payment evidence is protected. Sign in again to continue.
```

Actions:

- `Sign in`.
- `Back to finance summary`.

Rules:

- Do not retry indefinitely.
- Preserve intended route after sign-in.
- Do not show stale provider references after logout.

## Invalid Row State

Trigger:

- Row exists but fails client validation.

Title:

```text
This reconciliation row cannot be displayed
```

Body:

```text
The row for this payment failed client validation. Return to the queue and escalate the contract issue.
```

Actions:

- `Back to reconciliation queue`.
- `Back to finance summary`.

Validation failures include:

- Route `paymentId` mismatch.
- Invalid payment ID.
- Invalid delivery ID.
- Missing provider reference.
- Unknown provider.
- Unknown status.
- Unknown mismatch type.
- Negative amount.
- Invalid timestamp.
- Duplicate row for same payment ID.

## Row Not Found State

Trigger:

- No cached row.
- Fresh default reconciliation response returns no row matching route `paymentId`.

Title:

```text
Payment is not in the current reconciliation response
```

Body:

```text
This can happen when the queue was cleared, filters changed, the row moved out of the latest 100 records, or the backend has not added a single-payment lookup yet.
```

Actions:

- `Back to reconciliation queue`.
- `Refresh evidence`.
- `Back to finance summary`.

Rules:

- Do not show as 404 delivery not found.
- Do not call unsupported endpoint.
- Do not invent row data.

## Date And Time Rules

Display:

- Business date as `YYYY-MM-DD` or localized date.
- All timestamps as absolute date-time with timezone.
- Missing `lastReconciliationAt` as `Not checked yet`.
- Missing `reviewRequiredAt` as `Review not marked`.
- Missing `reviewedAt` as `Not reviewed`.

Recommended timestamp:

```text
20 May 2026, 09:00 GMT
```

Do not:

- Use relative-only time.
- Hide timezone.
- Treat missing review fields as completed.

## Security And Privacy

Sensitive fields:

- Payment ID.
- Delivery ID.
- Provider reference.
- Amounts.
- Internal status.
- Provider status.
- Review reason.
- Reviewer user ID.

Rules:

- Render only for authorized reconciliation users.
- Do not log provider reference.
- Do not include identifiers in analytics.
- Do not store row in local storage.
- Do not expose row after logout.
- Do not expose provider reference in route path beyond payment ID route.
- Do not expose internal worker secret.
- Do not expose provider credentials.

## Analytics

Allowed events:

- `admin_payment_reconciliation_detail_viewed`.
- `admin_payment_reconciliation_detail_refreshed`.
- `admin_payment_reconciliation_detail_refresh_failed`.
- `admin_payment_reconciliation_detail_copy_clicked`.
- `admin_payment_reconciliation_detail_route_clicked`.
- `admin_payment_reconciliation_detail_row_not_found`.

Payload rules:

- Include mismatch type.
- Include internal status.
- Include provider status.
- Include destination route family.
- Include whether reviewed fields are present.
- Do not include payment ID.
- Do not include delivery ID.
- Do not include provider reference.
- Do not include amount unless approved as aggregated metrics.

## Accessibility Requirements

Landmarks:

- Main content landmark.
- Risk summary region.
- Evidence region.
- Actions region.
- Boundary note region.

Headings:

- One H1.
- H2 for mismatch summary.
- H2 for review state.
- H2 for status comparison.
- H2 for amount evidence.
- H2 for reconciliation timeline.
- H2 for related actions.

Keyboard:

- Back link reachable first after skip link.
- Refresh reachable.
- Copy actions reachable.
- Related actions reachable.
- Focus order follows visual order.

Screen reader:

- Risk panel announces mismatch label.
- Status comparison exposes internal and provider labels.
- Amounts include currency.
- Copy feedback uses live region.
- Refresh feedback uses live region.
- Row-not-found state has clear heading.

Contrast:

- Amber and red panels meet WCAG AA.
- Warning icon has text alternative.
- Focus ring visible.
- Color is not the only status indicator.

Reduced motion:

- No decorative motion.
- Text feedback for refresh and copy.
- No auto-scrolling after background refresh.

## Responsive Design

Desktop:

- Two-column evidence layout.
- Side rail for actions.
- Internal/provider comparison side by side.
- Summary lists use consistent key widths.

Tablet:

- Evidence sections stack if width is constrained.
- Action rail moves under risk panel.

Mobile:

- One-column layout.
- Risk summary first.
- Primary actions next.
- Evidence sections stacked.
- Copy actions full-width or clearly tappable.

Do not:

- Hide provider status on mobile.
- Hide provider reference from authorized finance users.
- Make the action rail appear before the risk summary.

## Testing Requirements

Unit tests:

- Parses route payment ID.
- Uses navigation row when payment ID matches.
- Uses cached row when navigation state is absent.
- Fetches reconciliation response without unsupported `paymentId` query.
- Shows row-not-found when target row is absent.
- Maps all mismatch types.
- Maps all internal statuses.
- Maps all provider statuses.
- Shows reviewed state when `reviewedBy` and `reviewedAt` are present.
- Shows review-required state when only `reviewRequiredAt` is present.
- Shows incomplete state when review fields are absent.
- Shows amount flags for conflict cases.
- Does not show worker controls.
- Does not show state mutation controls.
- Does not show provider reference when unauthorized.

Integration tests:

- List row opens detail route.
- Direct route without cache fetches list response and finds row.
- Direct route with absent row shows row-not-found.
- Refresh preserves prior row on failure.
- Open delivery routes to delivery detail.
- Refund review action appears only for `confirmed`.
- Refund settlement action appears only for `refund_pending`.
- Refund evidence action appears only for `refunded`.
- Copy provider reference does not emit sensitive analytics.

Accessibility tests:

- One H1.
- Risk panel has accessible label.
- Summary lists expose key-value relationships.
- Copy result announced.
- Refresh result announced.
- Keyboard reaches every action.
- Statuses are not color-only.
- Row-not-found state is announced.

Visual tests:

- Unresolved after 30 minutes detail.
- Provider verification error detail.
- Reviewed detail.
- Row-not-found detail.
- Unauthorized state.
- Mobile stacked evidence.

## Acceptance Criteria

1. The screen renders at `/admin/finance/reconciliation/:paymentId`.
2. The screen never calls an unsupported single-payment reconciliation endpoint.
3. The screen never sends `paymentId` as an unsupported backend query parameter.
4. The screen displays one validated reconciliation row when available.
5. The screen displays row-not-found when the row is not in the available response.
6. The screen shows mismatch reason above all evidence.
7. The screen shows internal and provider statuses separately.
8. The screen shows quoted, charged, and refunded amounts separately.
9. The screen shows reconciliation attempt count and exposed timestamps.
10. The screen shows reviewed state only when reviewed fields are present.
11. The screen exposes provider reference only to authorized finance users.
12. The screen provides copy actions with accessible feedback.
13. The screen routes delivery, webhook, audit, refund, and finance summary actions without inline mutation.
14. The screen never calls the internal worker endpoint.
15. The screen never exposes internal task secret or provider credentials.
16. The screen has no inline refund approval or settlement form.
17. The screen has no payment state mutation controls.
18. The screen has no payout execution UI.
19. The screen handles stale, loading, error, unauthorized, session-expired, invalid-row, and row-not-found states.
20. Accessibility checks pass for headings, summary evidence, statuses, copy feedback, refresh feedback, and keyboard navigation.

## Implementation Notes For Claude Code

Build `AdminPaymentReconciliationDetail` as a read-only evidence view over a single row from `admin_payment_reconciliation`. Hydrate the row from navigation state, query cache, or a fresh `GET /v1/admin/payment-reconciliation?limit=100` response, then match by route `paymentId`. Do not call unsupported single-payment endpoints or send unsupported query parameters. Display mismatch, reviewed state, internal/provider statuses, amounts, timeline, identifiers, and related routes. Never add worker controls, state mutation, refund settlement forms, provider credential controls, payout execution, or local storage of provider references.
