# Admin Payment Reconciliation Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID              | `AdminPaymentReconciliation`                                                                                                                                                                          |
| Route                  | `/admin/finance/reconciliation`                                                                                                                                                                       |
| Primary test ID        | `screen-admin-payment-reconciliation`                                                                                                                                                                 |
| Surface                | Admin web console                                                                                                                                                                                     |
| Backend coverage       | `admin_payment_reconciliation`; detail route uses the same endpoint response row context                                                                                                              |
| Offline critical       | No                                                                                                                                                                                                    |
| Required read role     | `finance_admin` or `super_admin` with `review_reconciliation` capability                                                                                                                              |
| Required mutation role | No mutation on this screen                                                                                                                                                                            |
| Required states        | `loading`, `ready`, `empty`, `filtered_empty`, `conflict`, `stale`, `refreshing`, `csv_ready`, `not_authorized`, `session_expired`, `api_error`, `invalid_row_quarantine`                             |
| Parent screens         | `AdminFinanceSummary`, protected admin shell                                                                                                                                                          |
| Related screens        | `AdminFinanceSummary`, `AdminPaymentReconciliationDetail`, `AdminRefundReview`, `AdminRefundSettlement`, `AdminWebhookEvents`, `AdminStaffActivityLog`, `AdminDeliveryDetail`, `AdminLaunchReadiness` |

## Purpose

`AdminPaymentReconciliation` is the finance review queue for payment records where Kra's internal payment state and provider state need human attention. It lets a finance admin review unresolved MTN MoMo records, filter by review reason, inspect mismatch severity, open payment detail, copy safe identifiers, and download the backend-provided CSV text for daily finance review.

The screen should answer:

- `Which payment records require reconciliation review?`
- `Why is each record in the queue?`
- `What does Kra believe happened internally?`
- `What does the provider status appear to be?`
- `How much was quoted, charged, or refunded?`
- `When was the payment initiated?`
- `When was reconciliation last attempted?`
- `When did review become required?`
- `How many reconciliation attempts occurred?`
- `Can finance export the exact backend queue data?`
- `Where should finance open the detailed record?`

This screen is a review queue and export surface. It is not the internal reconciliation worker, not a settlement tool, not a refund approval form, not a provider console, and not a place to manually change payment state.

## Backend Reality

The concrete endpoint is:

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

Supported query:

```json
{
  "reviewReason": "verification_unresolved_after_30_minutes",
  "limit": 20
}
```

Supported query facts:

- `reviewReason` is optional.
- `reviewReason` can be `verification_unresolved_after_30_minutes`.
- `reviewReason` can be `provider_verification_error`.
- `limit` is optional.
- `limit` is coerced to a positive integer.
- `limit` has a maximum of `100`.
- No other query parameters are supported.

Response shape:

```json
{
  "generatedAt": "2026-05-20T09:00:00.000Z",
  "rows": [
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
      "reviewRequiredAt": "2026-05-20T08:30:00.000Z"
    }
  ],
  "csv": "businessDate,provider,providerReference,paymentId,deliveryId,..."
}
```

Important backend facts:

- The endpoint is read-only.
- The endpoint sets no-store cache behavior.
- The endpoint returns structured rows plus fixed-column CSV text.
- The backend builds `businessDate` from `initiatedAt.slice(0, 10)`.
- Provider is currently `mtn_momo`.
- Provider payment status can be `pending`, `confirmed`, `failed`, or `unknown`.
- Internal payment status uses Kra payment statuses: `pending`, `confirmed`, `failed`, `refund_pending`, `refunded`.
- `mismatchType` can be `none`, `verification_unresolved_after_30_minutes`, or `provider_verification_error`.
- `chargedAmountGhs` is `amountGhs` only when internal status is `confirmed`, `refund_pending`, or `refunded`; otherwise it is `0`.
- `refundedAmountGhs` falls back to `0`.
- `lastReconciliationAt`, `reviewRequiredAt`, `reviewedBy`, and `reviewedAt` are optional.
- Current list rows come from `payments.listReconciliationReview`.
- The internal worker endpoint is `POST /v1/internal/payments/reconcile-due`.
- The internal worker is protected by `X-Kra-Internal-Task-Secret`.
- This screen must not call the internal worker endpoint.
- This screen must not expose the internal task secret.
- This screen must not alter payment state.

Therefore:

- The screen may call only `GET /v1/admin/payment-reconciliation`.
- The screen may pass only supported `reviewReason` and `limit`.
- The screen must render the backend CSV text exactly for export actions.
- The screen must not generate a competing CSV from visible table rows.
- The screen must not invent reviewed status if `reviewedBy` and `reviewedAt` are absent.
- The screen must route detail work to `/admin/finance/reconciliation/:paymentId`.
- The screen must route refund and delivery work to their dedicated screens.

## Primary Users

Primary:

- `finance_admin` clearing the daily reconciliation queue.
- `super_admin` reviewing finance blockers during launch or incident response.

Secondary:

- Backend engineer investigating provider verification failures.
- Support lead checking customer impact.
- Operations lead checking dispatch blockers.
- Product owner reviewing launch readiness blockers.
- QA validating payment reconciliation behavior.
- Security reviewer validating finance-only provider reference exposure.
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

- See all visible reconciliation review rows.
- Filter by review reason.
- Limit the review result set safely.
- Identify unresolved verification rows.
- Identify provider verification error rows.
- Compare quoted, charged, refunded, internal status, and provider status.
- Copy identifiers needed for provider or internal follow-up.
- Download the backend-provided CSV.
- Open detail review for a single payment.
- Open related delivery detail.
- Return to finance summary after review.
- Confirm the queue is empty before launch readiness sign-off.

The screen should make the next finance action obvious while keeping payment state immutable from this surface.

## Entry Points

The screen can open from:

- Admin shell navigation under `Finance`.
- `AdminFinanceSummary` reconciliation card.
- `AdminLaunchReadiness` finance blocker.
- `AdminOverview` finance alert.
- `AdminPaymentReconciliationDetail` back link.
- `AdminWebhookEvents` unmatched provider event context.
- `AdminStaffActivityLog` finance audit context.
- Direct route `/admin/finance/reconciliation`.

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

- Reconciliation queue loading.
- Review reason filter.
- Result limit selector.
- Generated timestamp.
- Queue counts.
- Mismatch grouping.
- Reconciliation rows table.
- CSV download or copy from backend `csv`.
- Detail navigation.
- Delivery navigation.
- Identifier copy actions.
- Empty state.
- Filtered empty state.
- Error state.
- Unauthorized state.
- Session expired state.
- Stale data warning.
- Accessibility and keyboard support.

Out of scope:

- Calling `POST /v1/internal/payments/reconcile-due`.
- Showing internal task secret.
- Manually verifying payment provider status.
- Mutating payment status.
- Approving refunds.
- Settling refunds.
- Replaying webhooks.
- Editing provider references.
- Creating provider adjustments.
- Editing pricing rules.
- Executing payouts.
- Exporting custom accounting files beyond backend `csv`.
- Bulk actions.

## Product Position

`AdminPaymentReconciliation` should feel like a finance exception queue. The job is not to make payments look tidy; the job is to expose mismatch evidence clearly enough that finance can act without guessing.

Design principles:

- Lead with queue risk.
- Use exact reason labels.
- Keep internal and provider statuses side by side.
- Make stale data obvious.
- Preserve provider references for finance users.
- Route all decisions to detail or specialist screens.
- Keep the CSV export anchored to the backend response.
- Do not use color as the only sign of risk.

Restraint rule:

- No decorative charts.
- No bulk action toolbar.
- No inline status update controls.
- No provider-status editing.
- No payout language.

## External UX Research And References

Use only references that directly apply to reconciliation queue design:

- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible tabular data, captions, sorting announcements, and responsive table behavior.
- [GOV.UK task list](https://design-system.service.gov.uk/components/task-list/): relevant for representing queue tasks and review states with clear status labels.
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports a single prominent notice for stale or blocked finance review states.
- [GOV.UK summary list](https://design-system.service.gov.uk/components/summary-list/): supports key-value display for row metadata and generated timestamps.
- [W3C WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): refresh, filtered-count, download, and copy feedback must be announced without forcing focus.
- [MTN MoMo API](https://momo.mtn.com/api/): relevant to the provider-facing collection context and transaction status review pattern.

How these references affect this screen:

- Use a table for desktop queue rows.
- Use labeled row cards on mobile.
- Use one banner for stale or high-priority queue risk.
- Use key-value metadata in the detail drawer or row expansion.
- Use live regions for filter counts, refresh outcomes, copy success, and CSV download readiness.

## UX Thesis

The page should feel like a disciplined payment exception room: strict columns, explicit states, no decoration that weakens trust, and one clear path from queue row to evidence review.

Visual direction:

- Neutral finance canvas.
- High-contrast black or deep slate text.
- Amber for review-required.
- Red for provider errors or failed statuses.
- Blue or slate for pending.
- Green only for confirmed or settled states.
- Monospace treatment for IDs and provider references.
- Dense but breathable table layout.

Motion direction:

- Refresh progress is subtle.
- New or changed rows may receive a one-time highlight for up to `1200ms`.
- CSV-ready feedback may fade after `3 seconds`.
- Respect `prefers-reduced-motion`.
- Do not animate numbers or statuses in a way that reduces precision.

## Information Architecture

Order from top to bottom:

1. Admin shell header and breadcrumb.
2. Optional priority banner.
3. Page title, generated timestamp, and refresh action.
4. Queue summary metrics.
5. Filter and limit controls.
6. CSV export card.
7. Reconciliation table.
8. Policy and worker boundary notes.

Desktop layout:

- Wide left column for filters and table.
- Right rail for CSV export, policy notes, and unsafe actions not allowed.

Mobile layout:

- Single column.
- Summary metrics.
- Filter controls.
- CSV action.
- Row cards.
- Policy notes.

## Header

Required content:

- Breadcrumb: `Admin` -> `Finance` -> `Reconciliation`.
- H1: `Payment reconciliation`.
- Supporting text: `Review unresolved or conflicting MTN MoMo payment records before finance sign-off.`
- Generated timestamp: `Generated 20 May 2026, 09:00 GMT`.
- Refresh action: `Refresh queue`.
- Back link: `Back to finance summary`.

Header behavior:

- First load shows skeleton content.
- Refresh keeps previous rows visible.
- Refresh disables the refresh button.
- Refresh success announces `Payment reconciliation queue refreshed`.
- Refresh failure keeps previous rows and announces `Could not refresh reconciliation queue`.

Stale rule:

- Less than `5 minutes` old: no warning.
- `5` to `15 minutes` old: quiet text `Review before acting: queue data is more than 5 minutes old.`
- More than `15 minutes` old: warning banner `Refresh the reconciliation queue before closing finance review.`
- If client clock cannot compare `generatedAt`, show `Generated time could not be compared. Refresh before acting.`

## Priority Banner

Only one priority banner appears above the H1.

Priority order:

1. Unauthorized or session issue.
2. More than `15 minutes` stale.
3. Rows with `provider_verification_error`.
4. CSV unavailable or invalid.
5. General API error.

Provider error banner:

```text
Provider verification errors need same-business-day finance review.
```

Stale banner:

```text
Refresh the reconciliation queue before closing finance review.
```

Rules:

- Use `role="alert"` only for urgent blocking states.
- Use a region with accessible label for nonurgent notices.
- Do not show multiple competing banners.
- Do not hide the table unless authorization fails.

## Queue Summary Metrics

Render four compact metrics:

Metric 1:

- Label: `Rows in review`.
- Value: count of `rows`.
- Meaning: visible queue rows returned by backend.

Metric 2:

- Label: `Unresolved after 30 minutes`.
- Value: count where `mismatchType = verification_unresolved_after_30_minutes`.
- Meaning: provider verification did not resolve after scheduled attempts.

Metric 3:

- Label: `Provider errors`.
- Value: count where `mismatchType = provider_verification_error`.
- Meaning: provider verification failed or returned unknown state.

Metric 4:

- Label: `Total charged value`.
- Value: sum of visible `chargedAmountGhs`.
- Meaning: visible row orientation only.

Rules:

- Label all derived metrics `Visible rows`.
- Do not claim these are all historical mismatches.
- Do not replace backend finance summary totals with these values.
- Show `GHS` for charged value.
- Do not show hidden rows in derived metrics after client-side filtering unless the label says `Filtered rows`.

Recommended copy under metrics:

```text
Counts apply to the current reconciliation response, not the complete payment ledger.
```

## Filters

Backend-supported controls:

- Review reason.
- Limit.

Review reason options:

- `All review reasons` -> omit `reviewReason`.
- `Unresolved after 30 minutes` -> `verification_unresolved_after_30_minutes`.
- `Provider verification error` -> `provider_verification_error`.

Limit options:

- `20`.
- `50`.
- `100`.

Default:

- Review reason omitted.
- Limit `100`.

Client-only filters over returned rows:

- Payment ID.
- Delivery ID.
- Provider reference.
- Internal payment status.
- Provider payment status.
- Business date.

Rules:

- Clearly separate server filters from client filters.
- Server filter changes call the backend.
- Client filters do not call the backend.
- Do not send unsupported query keys.
- Do not store provider references in URL query by default.
- Announce result count after filters.

Filter result copy:

```text
18 reconciliation rows shown.
```

Filtered empty copy:

```text
No reconciliation rows match these filters.
```

## CSV Export

The endpoint returns a `csv` string.

CSV actions:

- `Download CSV`.
- `Copy CSV`.

Rules:

- Use backend `csv` exactly.
- Do not regenerate the CSV from visible rows.
- Do not change column order.
- Do not remove columns.
- Do not add local-only columns.
- Do not include filtered state unless backend later supports filtered CSV.
- If server filters changed the response, CSV belongs to that server-filtered response.
- If only client filters changed the table, CSV still represents the server response.
- Show this distinction clearly.

CSV note:

```text
CSV comes from the backend response for the current server filter and limit.
```

Download filename:

```text
kra-payment-reconciliation-YYYY-MM-DD.csv
```

Copy success:

```text
Reconciliation CSV copied.
```

Copy failure:

```text
Could not copy CSV. Try download instead.
```

Invalid CSV behavior:

- If `csv` is empty while rows exist, show warning.
- Keep table visible.
- Disable download and copy CSV actions.
- Show `CSV is unavailable for this response.`

## Reconciliation Table

Desktop table columns:

1. `Review reason`
2. `Payment`
3. `Delivery`
4. `Provider reference`
5. `Business date`
6. `Quoted`
7. `Charged`
8. `Refunded`
9. `Internal status`
10. `Provider status`
11. `Attempts`
12. `Last checked`
13. `Review required`
14. `Action`

Table requirements:

- Visible caption: `Payment reconciliation review rows`.
- Header cells use proper scope.
- Rows keyed by `paymentId`.
- Provider reference is wrap-safe and copyable.
- Amounts are right-aligned.
- Statuses are text-labeled badges.
- Action column has one primary action.
- Sort newest `reviewRequiredAt` first when present, then newest `initiatedAt`.
- If sorting controls are implemented, announce sort changes.
- On mobile, convert each row into a labeled card.

Default row priority:

1. `provider_verification_error`.
2. `verification_unresolved_after_30_minutes`.
3. `none`.
4. Newest `reviewRequiredAt`.
5. Newest `initiatedAt`.

Reason:

- Provider errors are the highest review risk.
- Unresolved after 30 minutes is next.
- `none` rows are lower priority and should be rare in this queue.

## Row Cards On Mobile

Each mobile card must include:

- Review reason.
- Payment ID.
- Delivery ID.
- Provider status.
- Internal status.
- Charged amount.
- Quoted amount.
- Refund amount.
- Attempts.
- Review required time.
- One primary action.
- Copy actions in a compact overflow.

Rules:

- Do not hide provider status.
- Do not hide review reason.
- Do not place copy actions before primary review action.
- Use labels, not just values.
- Keep touch targets at least platform minimum.

## Review Reason Semantics

| Mismatch type                              | Label                         | Meaning                                                                       | Tone  | Action                         |
| ------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------- | ----- | ------------------------------ |
| `verification_unresolved_after_30_minutes` | `Unresolved after 30 minutes` | Provider status stayed unresolved after scheduled 5, 15, and 30 minute checks | Amber | Open detail                    |
| `provider_verification_error`              | `Provider verification error` | Provider verification path failed or returned unknown state                   | Red   | Open detail                    |
| `none`                                     | `No mismatch reason`          | Backend row has no mismatch reason                                            | Slate | Open detail and verify context |

Rules:

- Do not hide `none`.
- Do not relabel `provider_verification_error` as provider failure unless detail confirms it.
- Do not relabel unresolved rows as failed.
- Do not call any row resolved unless `reviewedAt` is present.

## Status Semantics

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

Rules:

- Show internal and provider status side by side.
- Never merge the two into one badge.
- Never infer provider settled status from internal confirmed status.
- Never infer internal delivery entitlement from provider status alone.
- Use text and color together.

## Amount Semantics

Fields:

- `quotedAmountGhs`.
- `chargedAmountGhs`.
- `refundedAmountGhs`.

Rules:

- Use `GHS` prefix.
- Use integer display unless backend changes currency precision.
- Right-align table amounts.
- Keep quoted, charged, and refunded separate.
- Do not compute revenue.
- Do not compute profit.
- Do not compute payout values.
- Do not show provider fee unless backend adds it.
- If `chargedAmountGhs = 0`, show `GHS 0`, not blank.

Potential flags:

- Charged greater than quoted: show `Amount mismatch` flag.
- Refunded greater than charged: show `Refund exceeds charged amount` flag and route detail.
- Charged is zero with provider confirmed: show `Provider/internal conflict` flag.

These flags are UI review aids. They must not mutate state.

## Row Actions

Primary action:

- `Open detail`.

Destination:

- `/admin/finance/reconciliation/:paymentId`.

Secondary actions:

- `Open delivery` -> `/admin/deliveries/:deliveryId`.
- `Copy payment ID`.
- `Copy delivery ID`.
- `Copy provider reference`.
- `Open webhook events` -> `/admin/webhook-events` with supported context only.
- `Open audit log` -> `/admin/staff-activity` with supported context only.

Rules:

- Do not show `Resolve` on this list screen.
- Do not show `Mark confirmed`.
- Do not show `Mark failed`.
- Do not show `Run reconciliation`.
- Do not show `Settle refund` unless routing from detail or refund screen supports it.
- Do not show bulk actions.

## Detail Navigation Context

When opening detail:

- Pass `paymentId` in the route.
- Preserve current filter state in navigation state when the app supports it.
- Detail screen may refetch the reconciliation list or use cached row context.
- Back link should return to the same filtered queue.

If detail route is unavailable:

- Keep `Open detail` disabled.
- Show `Detail screen is not available in this build.`
- Still allow CSV export and delivery navigation.

## Empty State

Trigger:

- Endpoint succeeds.
- `rows` is empty.
- No client filters are active.

Title:

```text
No reconciliation rows need review
```

Body:

```text
The current server filter returned no payment reconciliation rows. Continue checking finance summary and webhook events before final launch sign-off.
```

Actions:

- `Refresh queue`.
- `Back to finance summary`.
- `Open webhook events`.

Rules:

- Empty does not mean all historical finance work is complete.
- Empty only applies to the current server filter and limit.
- Show generated timestamp.
- Keep CSV card visible only if backend returned useful CSV.

## Filtered Empty State

Trigger:

- Endpoint succeeds.
- Rows exist before client filters.
- Client filters hide all rows.

Title:

```text
No rows match these filters
```

Body:

```text
Clear filters or change the server review reason to see more reconciliation rows.
```

Actions:

- `Clear filters`.
- `Refresh queue`.

Rules:

- Do not show the full empty state.
- Do not clear server filters unless user chooses.

## Loading State

Initial load:

- Skeleton header.
- Skeleton metrics.
- Skeleton filters.
- Skeleton table with `8` rows on desktop.
- Skeleton cards with `5` rows on mobile.
- Announce `Loading reconciliation queue`.

Refresh load:

- Keep previous rows visible.
- Disable server filters while request is in flight.
- Disable refresh button.
- Show inline text `Refreshing reconciliation queue`.
- Do not clear client filters until server response arrives.

Accessibility:

- Mark content region `aria-busy="true"`.
- Use polite live region for loading and refresh.
- Do not force focus during background refresh.

## Error State

Full error title:

```text
Reconciliation queue could not load
```

Full error body:

```text
Kra could not load payment reconciliation rows. Try again or return to finance summary.
```

Actions:

- `Try again`.
- `Back to finance summary`.
- `Open webhook events`.

Inline refresh error:

```text
Could not refresh reconciliation queue. Current rows are still shown.
```

Rules:

- Preserve prior rows after refresh failure.
- Show backend request ID when available.
- Do not expose stack traces.
- Do not expose provider credentials.
- Do not expose internal task secret.

## Authorization State

If backend returns forbidden:

Title:

```text
Reconciliation access required
```

Body:

```text
This queue is restricted to admins with reconciliation review access.
```

Actions:

- `Return to finance summary`.
- `Sign in with another account`.

Rules:

- Do not render rows.
- Do not render CSV.
- Do not render provider references.
- Do not call webhook or audit endpoints.
- Clear cached reconciliation data from visible UI.

## Session Expired State

If auth expires:

Title:

```text
Sign in again to view reconciliation rows
```

Body:

```text
Payment reconciliation data is protected. Sign in again to continue.
```

Actions:

- `Sign in`.
- `Return to finance summary`.

Rules:

- Do not retry indefinitely.
- Preserve intended route after successful sign-in.
- Do not show stale provider references after logout.

## Invalid Row Quarantine

Client validation should quarantine a row when any required field is invalid:

- Invalid `businessDate`.
- Unknown `provider`.
- Missing `providerReference`.
- Invalid `paymentId`.
- Invalid `deliveryId`.
- Negative amount.
- Unknown internal status.
- Unknown provider status.
- Unknown mismatch type.
- Invalid `initiatedAt`.
- Invalid optional timestamp.

Behavior:

- Hide invalid row from table.
- Show warning: `{n} reconciliation row could not be displayed because it failed validation.`
- Keep valid rows visible.
- Keep backend CSV export available only if `csv` is valid.
- Do not rewrite CSV to remove invalid rows.

Full response failure:

- If `generatedAt`, `rows`, or `csv` root fields fail validation, show full error state.

## CSV Data Handling

Backend CSV columns currently include:

- `businessDate`.
- `provider`.
- `providerReference`.
- `paymentId`.
- `deliveryId`.
- `quotedAmountGhs`.
- `chargedAmountGhs`.
- `refundedAmountGhs`.
- `internalPaymentStatus`.
- `providerPaymentStatus`.
- `mismatchType`.
- `reviewedBy`.
- `reviewedAt`.

Rules:

- Show a compact column list in the CSV card.
- Do not promise columns not returned by backend.
- Do not append local-only filters to CSV.
- Do not parse CSV for table rendering.
- Use structured `rows` for table rendering.
- Treat CSV as export artifact only.

## Worker Boundary

The internal worker endpoint exists:

```http
POST /v1/internal/payments/reconcile-due
```

This screen must not call it.

Required worker-boundary note:

```text
Automated reconciliation is run by backend operations. This screen shows review rows and CSV export only.
```

Rules:

- Do not expose `X-Kra-Internal-Task-Secret`.
- Do not show a button called `Run worker`.
- Do not show a button called `Reconcile now`.
- Do not show worker retry controls.
- Do not show provider credential controls.

## Policy Notes

Show a compact policy panel:

Title:

```text
Review rules
```

Items:

- `Pending charges are checked at 5, 15, and 30 minutes.`
- `Unresolved after 30 minutes enters finance review.`
- `Provider verification errors require same-business-day review.`
- `Provider records indicate whether money moved.`
- `Internal payment and delivery records indicate service entitlement.`

Rules:

- Keep policy notes short.
- Do not replace row data with policy text.
- Do not bury the queue below long explanations.

## Search And Filtering UX

Search input label:

```text
Search visible rows
```

Search can match:

- Payment ID.
- Delivery ID.
- Provider reference.

Rules:

- Search only visible server response rows.
- Debounce if needed for performance.
- Do not send search query to backend.
- Do not persist provider reference search terms in URL.
- Show `Clear search` when active.

Filter chips:

- Review reason.
- Internal status.
- Provider status.
- Date.

Rules:

- Chips must be removable by keyboard.
- Removing a server filter triggers backend refresh.
- Removing a client filter updates locally.

## Copy Actions

Copyable fields:

- Payment ID.
- Delivery ID.
- Provider reference.

Copy success messages:

- `Payment ID copied.`
- `Delivery ID copied.`
- `Provider reference copied.`

Copy failure message:

```text
Could not copy. Select and copy it manually.
```

Rules:

- User must trigger copy.
- Do not auto-copy on row selection.
- Do not log copied values.
- Do not include copied values in analytics.
- Keep success state visible for no more than `3 seconds`.

## Date And Time Rules

Display:

- `businessDate` as `YYYY-MM-DD` or localized date.
- `initiatedAt` as absolute date-time with timezone.
- `lastReconciliationAt` as absolute date-time or `Not checked yet`.
- `reviewRequiredAt` as absolute date-time or `Review not marked`.
- `reviewedAt` as absolute date-time only if backend provides it.

Do not:

- Use relative-only time.
- Hide timezone.
- Treat missing `lastReconciliationAt` as no issue.
- Treat missing `reviewRequiredAt` as resolved.

Recommended date-time format:

```text
20 May 2026, 09:00 GMT
```

## Data Refresh

Manual refresh:

- Button label: `Refresh queue`.
- Reuses current server filters.
- Keeps client filters unless server response makes them invalid.

Auto refresh:

- Do not poll by default.
- Optional soft stale indicator may update from client time.
- Do not refresh while CSV download is in progress.

After refresh:

- Preserve selected row by `paymentId` if present.
- If selected row disappears, announce `Selected payment is no longer in this queue.`
- Recompute derived counts.
- Keep scroll position unless the user changed server filters.

## Selection Model

The screen may support one selected row for contextual side-panel actions.

Rules:

- Single selection only.
- Selection uses `paymentId`.
- Selection is keyboard reachable.
- Side panel repeats key fields.
- Side panel offers `Open detail`, `Open delivery`, and copy actions.
- No bulk actions.
- No inline mutation.

If no row is selected:

- Side panel shows CSV card and policy notes.

## Security And Privacy

Sensitive fields:

- Provider reference.
- Payment ID.
- Delivery ID.
- Amounts.
- Internal payment status.
- Provider payment status.
- Review reason.
- CSV content.

Rules:

- Render only for authorized reconciliation users.
- Do not log provider references.
- Do not include identifiers in analytics.
- Do not store CSV in local storage.
- Do not cache the endpoint in browser storage.
- Do not expose finance rows after logout.
- Do not include provider reference in document title.
- Do not include provider reference in route path.
- Do not expose raw backend errors.
- Do not expose provider secrets.
- Do not expose internal worker secret.

## Analytics

Allowed events:

- `admin_payment_reconciliation_viewed`.
- `admin_payment_reconciliation_refreshed`.
- `admin_payment_reconciliation_refresh_failed`.
- `admin_payment_reconciliation_server_filter_changed`.
- `admin_payment_reconciliation_client_filter_changed`.
- `admin_payment_reconciliation_csv_downloaded`.
- `admin_payment_reconciliation_csv_copied`.
- `admin_payment_reconciliation_row_opened`.
- `admin_payment_reconciliation_delivery_opened`.
- `admin_payment_reconciliation_copy_clicked`.

Payload rules:

- Include mismatch type.
- Include internal status.
- Include provider status.
- Include server limit.
- Include route family.
- Do not include payment ID.
- Do not include delivery ID.
- Do not include provider reference.
- Do not include CSV content.
- Do not include exact amount unless approved as aggregated metrics.

## Accessibility Requirements

Landmarks:

- Main content landmark.
- Queue summary region.
- Filter region.
- CSV export region.
- Reconciliation table region.

Headings:

- One H1.
- H2 for summary metrics.
- H2 for filters.
- H2 for CSV export.
- H2 for review rows.
- H2 for policy notes.

Keyboard:

- Filters reachable.
- Table row actions reachable.
- Copy actions reachable.
- CSV actions reachable.
- Row selection reachable if implemented.
- Focus order matches visual order.

Screen reader:

- Table has caption.
- Headers are scoped.
- Status badges expose full text.
- Amounts include currency.
- Copy feedback announced.
- Filter counts announced.
- Refresh status announced.
- CSV download state announced.
- Stale banner accessible.

Contrast:

- Review and error tones meet WCAG AA.
- Red and amber states include text labels.
- Focus ring visible across table, cards, and controls.

Reduced motion:

- Disable row highlight motion.
- Use text for progress.
- No constantly moving indicators.

## Responsive Design

Desktop:

- Full table with compact columns.
- Sticky header allowed only if accessible.
- Right rail for CSV and policy.
- Monospace IDs wrap safely.

Tablet:

- Table may horizontally scroll.
- Scroll container must be focusable.
- Right rail moves below filters if width is constrained.

Mobile:

- Use stacked cards.
- Keep review reason at top of each card.
- Keep primary action visible.
- Put copy actions in card overflow.
- Keep CSV action near top before long row list.

Do not:

- Hide provider status on mobile.
- Hide provider reference from authorized finance users.
- Require horizontal scroll inside a row card.

## Performance Requirements

Targets:

- Render 100 rows without virtualization.
- Client filters should feel immediate.
- CSV download should not block table interaction.
- Refresh should not clear the page.

Rules:

- Avoid heavy chart libraries.
- Avoid repeated date parsing on every keystroke if it causes jank.
- Use stable row keys.
- Do not poll.
- Do not fetch unrelated finance endpoints on initial load.

## Testing Requirements

Unit tests:

- Renders generated timestamp.
- Renders rows from `admin_payment_reconciliation`.
- Sends only supported `reviewReason` and `limit`.
- Does not send client filters to backend.
- Maps both review reasons.
- Maps `none`.
- Maps all internal payment statuses.
- Maps all provider payment statuses.
- Shows `Not checked yet` when `lastReconciliationAt` is absent.
- Shows `Review not marked` when `reviewRequiredAt` is absent.
- Uses backend `csv` for download.
- Does not regenerate CSV from filtered rows.
- Hides provider references on unauthorized state.
- Shows empty state when rows are empty.
- Shows filtered empty state after client filters.
- Does not render run-worker controls.
- Does not render inline status mutation controls.

Integration tests:

- Finance admin opens `/admin/finance/reconciliation`.
- Non-reconciliation user is blocked.
- Server review reason filter triggers API request.
- Limit selector triggers API request.
- Client search does not trigger API request.
- CSV copy uses backend `csv`.
- CSV download filename includes business date.
- Row `Open detail` routes to `/admin/finance/reconciliation/:paymentId`.
- Row `Open delivery` routes to `/admin/deliveries/:deliveryId`.
- Refresh preserves old rows on failure.

Accessibility tests:

- One H1.
- Table caption present.
- Header scopes present.
- Filter result count announced.
- Refresh result announced.
- Copy result announced.
- CSV result announced.
- Keyboard reaches every action.
- Status is not color-only.
- Mobile cards expose labels.

Visual tests:

- Desktop queue with mixed mismatch types.
- Desktop empty state.
- Desktop provider error banner.
- Desktop stale warning.
- Mobile card list.
- Mobile filtered empty state.
- Unauthorized state.
- Error state.

## Acceptance Criteria

1. A finance admin can open `/admin/finance/reconciliation`.
2. The screen fetches `GET /v1/admin/payment-reconciliation`.
3. The screen can send `reviewReason` and `limit` only.
4. The screen displays generated timestamp.
5. The screen displays reconciliation rows with payment, delivery, provider reference, amounts, statuses, attempts, timestamps, and action.
6. The screen labels `verification_unresolved_after_30_minutes` as `Unresolved after 30 minutes`.
7. The screen labels `provider_verification_error` as `Provider verification error`.
8. The screen shows internal and provider statuses separately.
9. The screen uses backend `csv` exactly for CSV actions.
10. The screen does not regenerate CSV from client-filtered rows.
11. The screen shows empty and filtered-empty states correctly.
12. The screen preserves prior data after refresh failure.
13. Unauthorized users see no provider references, rows, or CSV.
14. The screen never calls `POST /v1/internal/payments/reconcile-due`.
15. The screen never exposes `X-Kra-Internal-Task-Secret`.
16. The screen has no inline payment-status mutation.
17. The screen has no refund approval or settlement form.
18. The screen has no payout execution UI.
19. The screen provides accessible table, filters, refresh, copy, and CSV feedback.
20. The screen routes detail review to `/admin/finance/reconciliation/:paymentId`.

## Implementation Notes For Claude Code

Build `AdminPaymentReconciliation` as a read-only finance review queue. Use `useAdminPaymentReconciliationQuery` or the app's equivalent query wrapper for `GET /v1/admin/payment-reconciliation`, with only `reviewReason` and `limit` as backend query parameters. Render the structured rows for the queue and use the backend `csv` string exactly for CSV copy and download. Keep provider references finance-only, separate internal and provider statuses, route row review to the detail screen, and never add internal worker controls, payment status mutation, refund settlement, payout execution, provider credential handling, or unsupported query parameters.
