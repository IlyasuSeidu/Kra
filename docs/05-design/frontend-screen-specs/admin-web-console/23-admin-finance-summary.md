# Admin Finance Summary Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminFinanceSummary` |
| Route | `/admin/finance` |
| Test id | `screen-admin-finance-summary` |
| Surface | Admin web console |
| Backend coverage | `admin_finance`; links to `admin_payment_reconciliation`, refund review, refund settlement, pricing rules, and audit screens |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` through backend finance admin policy |
| Required mutation role | No mutation on this screen |
| Required states | `loading`, `ready`, `empty`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error`, `partial_navigation_unavailable` |
| Parent screens | Protected admin shell |
| Related screens | `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminRefundReview`, `AdminRefundSettlement`, `AdminRefundEvidenceReview`, `AdminPricingRules`, `AdminPricingRuleEdit`, `AdminStaffActivityLog`, `AdminOverview`, `SenderReceiptDetail`, `SenderRefundStatus` |

## Purpose
`AdminFinanceSummary` is the finance command view for customer money movement visibility. It gives an authorized finance admin a trustworthy read-only view of confirmed collections, pending refund liability, completed refunds, recent payment rows, and the next finance actions that belong in deeper specialist screens.

The screen should answer:
- `How much confirmed customer collection value is currently visible?`
- `How much refund liability is pending?`
- `How much has already been recorded as refunded?`
- `Which recent payments need review?`
- `Which payments are confirmed, pending, failed, refund-pending, or refunded?`
- `Which records should be opened in reconciliation or refund workflows?`
- `When was this finance view generated?`
- `Is this view stale enough to require refresh before acting?`
- `What finance work is not supported here?`

This screen is not a ledger writer, payout execution surface, refund approval form, reconciliation detail view, pricing editor, or accounting export. It is a high-trust triage cockpit that routes finance staff to the right next screen without inventing unsupported capabilities.

## Backend Reality
The concrete endpoint is:
```http
GET /v1/admin/finance
```

Operation:
```text
admin_finance
```

Server behavior:
- The endpoint requires authenticated admin access and `requireFinanceAdmin`.
- The endpoint sets no-store cache behavior.
- The endpoint reads recent payment metrics through `payments.listRecent(100)`.
- The endpoint returns backend-computed totals and recent payment rows.
- The endpoint is idempotent and read-only.
- The endpoint does not accept filters or query parameters.
- The endpoint does not expose payout records.
- The endpoint does not expose station-operator compensation.
- The endpoint does not execute refunds.
- The endpoint does not reconcile provider records.
- The endpoint does not update pricing rules.
- The endpoint does not export reports.

Response shape:
```json
{
  "generatedAt": "2026-05-20T08:30:00.000Z",
  "totals": {
    "confirmedAmountGhs": 420,
    "refundPendingAmountGhs": 70,
    "refundedAmountGhs": 35
  },
  "payments": [
    {
      "paymentId": "PAY-0001",
      "deliveryId": "DEL-0001",
      "provider": "mtn_momo",
      "providerReference": "MTN-REF-0001",
      "status": "confirmed",
      "amountGhs": 35,
      "initiatedAt": "2026-05-20T08:00:00.000Z",
      "verifiedAt": "2026-05-20T08:02:00.000Z",
      "refundAmountGhs": 0
    }
  ]
}
```

Important backend facts:
- Payment statuses are `pending`, `confirmed`, `failed`, `refund_pending`, and `refunded`.
- Provider is currently `mtn_momo`.
- `amountGhs` is a positive integer per row.
- `refundAmountGhs` is optional and nonnegative when present.
- `verifiedAt` is optional.
- `generatedAt`, `initiatedAt`, and `verifiedAt` are ISO date-time strings.
- `providerReference` is present in full for finance admins.
- `payments` contains up to 100 recent records.
- Backend totals are authoritative for this screen.
- Row-level grouping can be computed client-side for display, but money totals must not override backend totals.
- Refund approval and settlement happen in dedicated refund endpoints and screens.
- Payment reconciliation review happens in `GET /v1/admin/payment-reconciliation`.
- Pilot driver and courier payouts are weekly manual finance operations outside the app.
- Station-operator compensation is not finalized in the current docs or backend.
- Partner and carrier payout automation is deferred outside V1.

Therefore:
- This screen must fetch only `admin_finance` for the primary view.
- This screen must display backend totals exactly.
- This screen must not calculate replacement totals from visible rows.
- This screen may compute row counts and visual percentages for orientation.
- This screen must route deeper work to specialist screens.
- This screen must clearly state that payout execution is outside this surface.
- This screen must not expose finance controls to non-finance roles.

## Primary Users
Primary:
- `finance_admin` monitoring customer payment health.
- `super_admin` reviewing finance health during launch or incident response.

Secondary:
- Operations lead asking whether payment blockers affect dispatch.
- Support lead asking whether refund liability needs customer messaging.
- Product owner checking launch finance readiness.
- QA validating finance contract behavior.
- Security reviewer validating finance-only data exposure.
- Claude Code implementing the admin console later.

Non-users:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without finance access.
- `ops_admin` without finance access.
- Public visitor.

## User Goal
Authorized finance users use this screen to:
- Check customer collection value.
- Check pending refund liability.
- Check refunded value.
- Identify recent payment rows that need attention.
- Open reconciliation review for unresolved or provider-conflict rows.
- Open refund review or settlement for refund-pending rows.
- Open delivery detail when context is required.
- Open pricing rules when quote policy needs review.
- Refresh stale finance data before making an operational decision.
- Confirm no unsupported payout action exists in the UI.

The screen should reduce finance uncertainty without pretending to be a full accounting system.

## Entry Points
The screen can open from:
- Admin shell navigation under `Finance`.
- `AdminOverview` finance card.
- `AdminLaunchReadiness` finance signal.
- `AdminPaymentReconciliation` back link.
- `AdminRefundReview` back link.
- `AdminRefundSettlement` back link.
- `AdminPricingRules` finance shortcut.
- Direct route `/admin/finance`.

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
- Finance summary loading.
- Generated timestamp display.
- Confirmed amount total display.
- Refund-pending amount total display.
- Refunded amount total display.
- Recent payment table.
- Status grouping.
- Provider label display.
- Provider reference display for finance users.
- Delivery link per row.
- Reconciliation link for rows that need deeper finance review.
- Refund review link for confirmed rows when policy and route are available.
- Refund settlement link for refund-pending rows.
- Refresh action.
- Empty state.
- Error state.
- Unauthorized state.
- Session-expired state.
- Stale-data warning.
- Accessibility and keyboard support.

Out of scope:
- Creating a payment.
- Verifying a sender payment.
- Approving a refund inline.
- Settling a refund inline.
- Running the reconciliation worker.
- Downloading provider CSV from this screen.
- Editing pricing.
- Executing driver payouts.
- Executing courier payouts.
- Collecting payout account details.
- Station-operator compensation.
- Carrier partner settlements.
- Provider credential configuration.
- Raw webhook replay.
- Raw audit metadata display.

## Product Position
`AdminFinanceSummary` should feel like a control-room finance board, not a decorative dashboard. The main job is to make risk, liability, and next action clear at a glance.

Design principles:
- Lead with money state.
- Separate collection value from refund liability.
- Treat pending refund as a liability, not income.
- Give rows strong status language.
- Avoid unsupported accounting claims.
- Route action to the correct workflow.
- Make stale data obvious.
- Keep the page serious, compact, and calm.

Restraint rule:
- Do not add charts unless they explain a decision better than numbers and table rows.
- Do not use decorative financial graphics.
- Do not show payout controls.
- Do not present row-derived totals as source of truth.

## External UX Research And References
Only use references that apply directly to finance summary, status, and data-table design:
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports using tables for structured data, accessible headers, captions, small-screen handling, and sortable-table live announcements.
- [USWDS summary box component](https://designsystem.digital.gov/components/summary-box/): supports calling out three to five key details from dense pages.
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports using a single high-priority banner for service-wide or user-specific notices and accessible region labeling.
- [GOV.UK summary list](https://design-system.service.gov.uk/components/summary-list/): supports key-value display for metadata such as last updated time.
- [GOV.UK task list](https://design-system.service.gov.uk/components/task-list/): relevant only for the action rail because finance work spans multiple specialist tasks; use the idea of clear task state, not the full component unless research supports it.
- [W3C WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): dynamic loading, refresh, filtered-count, and error status text must be programmatically available without forcing focus.
- [MTN MoMo API](https://momo.mtn.com/api/): confirms MoMo supports collection flows and transaction status concepts, matching Kra's provider reference and reconciliation approach.

How these references affect this screen:
- Use a summary zone for the three finance totals and generated timestamp.
- Use tables for recent payment records on desktop.
- Use stacked row cards or horizontal scroll on narrow screens.
- Use one high-priority banner for stale or system-wide finance warnings.
- Use live regions for refresh results and status changes.
- Use key-value metadata for provider, generated time, and row detail.

## UX Thesis
The page should feel like a finance-grade command ledger: dense enough for operators, calm enough for high-stakes review, and strict enough that no one can confuse monitoring with settlement.

Visual direction:
- Clean ivory or warm gray canvas.
- Dark ink text.
- Deep green for confirmed money.
- Amber for pending refund liability.
- Slate or blue for pending verification.
- Red reserved for failed or high-risk states.
- Tables and metric panels should feel precise, not flashy.
- Use subtle dividers, generous column alignment, and strong numeric hierarchy.

Motion direction:
- Refresh should show a restrained progress state.
- Metric changes may softly crossfade.
- Row status changes may highlight once for no more than `1200ms`.
- Respect `prefers-reduced-motion`.
- Never animate money numbers in a way that makes exact values hard to read.

## Information Architecture
Order from top to bottom:
1. Admin shell header and finance breadcrumb.
2. Optional high-priority finance banner.
3. Page title, generated timestamp, and refresh action.
4. Three primary finance totals.
5. Finance work queue shortcuts.
6. Recent payment status overview.
7. Recent payments table.
8. Finance policy notes.
9. Unsupported actions note.

The desktop layout should use a two-column composition:
- Left wide column for totals and recent payments.
- Right narrow rail for finance work queues, policy notes, and unsupported actions.

The mobile layout should use one column:
- Header.
- Totals.
- Work queue shortcuts.
- Status chips.
- Payment row cards.
- Policy notes.

## Header
The header must include:
- Breadcrumb: `Admin` -> `Finance`.
- H1: `Finance summary`.
- Supporting text: `Monitor customer collections, refund liability, and recent MTN MoMo payment records.`
- Generated timestamp key-value: `Generated 20 May 2026, 08:30 GMT`.
- Refresh button: `Refresh finance data`.
- Optional last refresh status live text.

Header behavior:
- On first load, show loading skeleton for timestamp and totals.
- On refresh, keep existing data visible while the refresh is in progress.
- If refresh succeeds, update timestamp and announce `Finance summary refreshed`.
- If refresh fails, keep previous data visible and show `Could not refresh finance summary`.
- If no previous data exists, show the full error state.

Stale rule:
- Data less than `5 minutes` old: no stale warning.
- Data `5` to `15 minutes` old: show quiet text `Review before acting: data is more than 5 minutes old.`
- Data more than `15 minutes` old: show warning banner `Refresh finance data before making refund or reconciliation decisions.`
- Staleness is calculated from `generatedAt` using the client clock.
- If client clock is unavailable or invalid, show `Generated time could not be compared. Refresh before acting.`

## Finance Banner
Only one banner may appear above the H1.

Banner priority:
1. Session or authorization issue.
2. More than `15 minutes` stale.
3. Partial navigation unavailable.
4. Backend finance error.

Banner content rules:
- Keep the banner specific.
- Include one primary action.
- Do not duplicate the page title.
- Do not use color alone.
- Use `role="region"` for nonurgent finance notices.
- Use `role="alert"` only for urgent errors or refresh failure that blocks action.

Stale banner copy:
```text
Refresh finance data before making refund or reconciliation decisions.
```

Partial navigation banner copy:
```text
Some finance workflows are unavailable in this build. Recent payment visibility is still available.
```

## Primary Totals
Render three top-level metric cards using backend totals:

Card 1:
- Label: `Confirmed collections`.
- Value: `GHS {totals.confirmedAmountGhs}`.
- Meaning: money collected and confirmed internally.
- Tone: positive, stable.
- Secondary text: `Customer payments confirmed by Kra records.`

Card 2:
- Label: `Pending refund liability`.
- Value: `GHS {totals.refundPendingAmountGhs}`.
- Meaning: payments marked refund pending.
- Tone: amber or caution.
- Secondary text: `Approved or pending settlement amount requiring finance follow-through.`

Card 3:
- Label: `Refunded`.
- Value: `GHS {totals.refundedAmountGhs}`.
- Meaning: payments recorded as refunded.
- Tone: neutral or settled.
- Secondary text: `Refunds recorded as settled in Kra records.`

Metric card requirements:
- Use `GHS` prefix consistently.
- Use thousands separators when needed.
- Do not show decimal places unless backend later supports fractional money.
- Do not calculate or overwrite these totals from rows.
- Include a tooltip or help text: `Totals come from the finance API, not client-side row sums.`
- Include accessible labels with the full amount and meaning.

Metric card hierarchy:
- Confirmed collections is largest.
- Pending refund liability is visually distinct.
- Refunded is stable and secondary.
- Never make refunded appear like available cash.

## Derived Row Orientation
The UI may compute row orientation values from `payments`:
- Total recent rows.
- Count by status.
- Count missing `verifiedAt`.
- Count with `refundAmountGhs > 0`.
- Oldest initiated timestamp visible.
- Newest initiated timestamp visible.

These values are for navigation only.

Rules:
- Label the section `Recent records only`.
- Do not imply counts cover all historical records.
- Do not use row counts for accounting totals.
- Do not call this a complete ledger.

Recommended status chips:
- `Confirmed`
- `Pending verification`
- `Failed`
- `Refund pending`
- `Refunded`

Status-chip labels:
- `confirmed`: `Confirmed`
- `pending`: `Pending verification`
- `failed`: `Failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

## Work Queue Shortcuts
Right rail or mobile section title:
```text
Finance work queues
```

Cards:

### Reconciliation Review
Purpose:
- Route to payment reconciliation for records that need provider/internal review.

Primary action:
- `Open reconciliation`

Destination:
- `/admin/finance/reconciliation`

Display:
- Use available row orientation to show `Pending verification rows visible: {count}`.
- If separate reconciliation count is unavailable, say `Use reconciliation view for authoritative review count.`

Rules:
- Do not claim exact unmatched count on this screen.
- Do not run internal reconciliation worker.
- Do not expose internal task secret.

### Refund Review
Purpose:
- Route to refund review for confirmed payments that may need policy review.

Primary action:
- `Review refunds`

Destination:
- If a selected row is present: `/admin/finance/refunds/:paymentId/review`.
- If no selected row is present: show guidance to select a payment row.

Rules:
- Refund approval does not happen here.
- Use confirmed rows only for review entry.
- If a row is already `refund_pending`, use settlement route instead.

### Refund Settlement
Purpose:
- Route to settlement for records already marked `refund_pending`.

Primary action:
- `Settle pending refund`

Destination:
- `/admin/finance/refunds/:paymentId/settle`.

Rules:
- Only enable from a selected `refund_pending` row.
- Do not display this as a bulk settlement action.
- Do not collect provider transfer details here.

### Pricing Rules
Purpose:
- Route to active pricing review.

Primary action:
- `View pricing rules`

Destination:
- `/admin/pricing-rules`.

Rules:
- Do not edit prices here.
- Do not imply pricing changes affect existing quotes.

### Audit Events
Purpose:
- Route to finance audit evidence.

Primary action:
- `Open audit log`

Destination:
- `/admin/staff-activity?targetType=payment`.

Rules:
- This route is a best-effort query link.
- If audit filtering by target type is not supported in the built frontend, route to `/admin/staff-activity`.

## Recent Payment Table
Desktop table columns:
1. `Payment`
2. `Delivery`
3. `Status`
4. `Amount`
5. `Refund amount`
6. `Provider`
7. `Provider reference`
8. `Initiated`
9. `Verified`
10. `Action`

Column details:
- `Payment`: `paymentId`, copy action, row detail link when available.
- `Delivery`: `deliveryId`, link to `/admin/deliveries/:deliveryId`.
- `Status`: semantic badge using status mapping.
- `Amount`: `GHS {amountGhs}`.
- `Refund amount`: `GHS {refundAmountGhs}` or `No refund recorded`.
- `Provider`: `MTN MoMo`.
- `Provider reference`: full string for finance users with copy action.
- `Initiated`: localized absolute date-time.
- `Verified`: localized absolute date-time or `Not verified yet`.
- `Action`: context-specific route.

Table requirements:
- Include a visible caption: `Recent finance payment records`.
- Use column headers with proper scope.
- Provide stable row keys by `paymentId`.
- Keep provider reference copy accessible by keyboard.
- Preserve row focus when refreshing if the row remains present.
- Sort newest initiated first if backend order is not guaranteed.
- If frontend sorting is added, announce sort changes through a polite live region.
- On mobile, use stacked payment cards with the same field labels.
- If horizontal scroll is used, the scroll container must be keyboard focusable.

Default row ordering:
1. Rows with `refund_pending`.
2. Rows with `pending`.
3. Rows with `failed`.
4. Rows with `confirmed`.
5. Rows with `refunded`.
6. Within each group, newest `initiatedAt` first.

Reason:
- Finance should see liability and unresolved verification before settled history.

If backend later returns authoritative sort order, preserve backend order and remove client priority sort only after product approval.

## Row Actions
Row action by status:

| Status | Primary row action | Destination | Notes |
| --- | --- | --- | --- |
| `pending` | `Open reconciliation` | `/admin/finance/reconciliation/:paymentId` | Use detail route when implemented; otherwise route to reconciliation list with payment context |
| `confirmed` | `Open delivery` | `/admin/deliveries/:deliveryId` | Refund review can appear in overflow if policy allows |
| `failed` | `Open delivery` | `/admin/deliveries/:deliveryId` | Do not show refund action |
| `refund_pending` | `Settle refund` | `/admin/finance/refunds/:paymentId/settle` | Finance settlement belongs in settlement screen |
| `refunded` | `View refund` | `/admin/finance/refunds/:paymentId/evidence` | If evidence route is unavailable, route to delivery detail |

Overflow actions:
- `Copy payment ID`.
- `Copy provider reference`.
- `Open delivery`.
- `Open reconciliation`.
- `Open refund review` when status is `confirmed`.
- `Open refund settlement` when status is `refund_pending`.
- `Open refund evidence` when status is `refunded`.

Rules:
- Disable unavailable routes with explanatory text.
- Do not show disabled actions without reason.
- Do not show settlement for `confirmed`, `pending`, `failed`, or `refunded`.
- Do not show refund approval for `refund_pending` or `refunded`.
- Do not allow bulk actions.

## Status Semantics
Use exact backend status values and finance-safe labels:

| Backend status | Label | Meaning | Tone | Primary concern |
| --- | --- | --- | --- | --- |
| `pending` | `Pending verification` | Payment started but not final | Blue or slate | Reconciliation review if old |
| `confirmed` | `Confirmed` | Payment confirmed internally | Green | Dispatch entitlement and receipt |
| `failed` | `Failed` | Payment did not complete | Red | Sender retry or support context |
| `refund_pending` | `Refund pending` | Refund has been approved or recorded pending settlement | Amber | Finance settlement |
| `refunded` | `Refunded` | Refund recorded as settled | Neutral | Evidence and audit |

Status display rules:
- Use label plus icon or text marker.
- Never rely on color alone.
- Include status in row accessible name.
- Keep `refund_pending` visually distinct from `pending`.
- Do not call `refund_pending` a completed refund.
- Do not call `confirmed` provider settled unless provider reconciliation confirms it elsewhere.

## Provider Reference Handling
Finance users may see full provider references on this screen.

Rules:
- Display provider reference in a monospaced, wrap-safe style.
- Provide `Copy reference` action.
- Copy action must announce success through a live region.
- Do not truncate without full value available through accessible label.
- Do not expose provider reference in sender, receiver, driver, courier, or public surfaces.
- Do not include provider credentials or callback secrets.

Copy success text:
```text
Provider reference copied.
```

Copy failure text:
```text
Could not copy provider reference. Select and copy it manually.
```

## Date And Time Rules
Display:
- Use absolute date and time.
- Include timezone abbreviation.
- Prefer user locale formatting while preserving exact meaning.
- Use `Not verified yet` when `verifiedAt` is absent.
- Show generated timestamp near the page title.

Do not:
- Use vague relative-only text such as `just now` without absolute timestamp.
- Hide timezone.
- Treat absent `verifiedAt` as failed.

Recommended format:
```text
20 May 2026, 08:30 GMT
```

## Empty State
Trigger:
- Endpoint succeeds.
- `payments` is an empty array.
- Totals are all zero.

Empty title:
```text
No recent finance records yet
```

Empty body:
```text
Customer payment records will appear here after senders initialize MTN MoMo payments. Finance can still open pricing rules and reconciliation.
```

Actions:
- `Refresh finance data`.
- `View pricing rules`.
- `Open reconciliation`.

Rules:
- Do not show an empty table with no explanation.
- Do not show payout setup.
- Do not show speculative revenue copy.

## Partial Empty State
Trigger:
- Endpoint succeeds.
- `payments` is empty.
- One or more totals is nonzero.

Interpretation:
- Backend totals and recent rows are not the same reporting scope.

Copy:
```text
Totals are available, but no recent payment rows were returned.
```

Required behavior:
- Show totals.
- Show the empty recent-records section.
- Show a note: `Use export or reconciliation views for broader finance history when available.`

Do not:
- Treat this as a data integrity failure.
- Set totals to zero.

## Loading State
Initial load:
- Show page header skeleton.
- Show three metric skeleton cards.
- Show recent table skeleton with `6` rows on desktop.
- Show `5` payment cards on mobile.
- Announce `Loading finance summary`.

Refresh load:
- Keep existing data visible.
- Disable refresh button.
- Show inline progress text: `Refreshing finance data`.
- Do not collapse the table.
- Do not clear selected row until refresh completes.

Loading accessibility:
- Use `aria-busy="true"` on the finance content region.
- Use polite live region for loading state.
- Do not move focus on background refresh.

## Error State
Full error title:
```text
Finance summary could not load
```

Full error body:
```text
Kra could not load the finance summary. Refresh, or open reconciliation if you need to continue a payment review.
```

Actions:
- `Try again`.
- `Open reconciliation`.
- `Return to admin overview`.

Inline refresh error:
```text
Could not refresh finance summary. Current data is still shown.
```

Error rules:
- Preserve prior successful data when refresh fails.
- Show request ID when backend error includes it.
- Do not expose stack traces.
- Do not expose provider credentials.
- Do not show raw unknown details by default.

## Authorization State
If backend returns forbidden:

Title:
```text
Finance access required
```

Body:
```text
This screen is restricted to finance admins and super admins with finance access.
```

Actions:
- `Return to admin overview`.
- `Sign in with another account`.

Rules:
- Do not render totals.
- Do not render provider references.
- Do not render payment rows.
- Do not call reconciliation or refund endpoints.
- Clear any cached finance data from visible UI.

## Session Expired State
If bearer auth expires:

Title:
```text
Sign in again to view finance data
```

Body:
```text
Finance records are protected. Sign in again to continue.
```

Actions:
- `Sign in`.
- `Return to admin overview`.

Rules:
- Do not retry indefinitely.
- Do not show stale finance data after logout.
- Preserve intended return route after successful sign-in.

## Data Integrity Checks
Client validation should reject or quarantine impossible display data:
- Missing `generatedAt`.
- Missing `totals`.
- Negative total.
- Missing `paymentId`.
- Missing `deliveryId`.
- Missing `providerReference`.
- Unknown provider.
- Unknown status.
- Missing `initiatedAt`.
- Nonpositive `amountGhs`.
- Negative `refundAmountGhs`.
- Invalid date-time.

Quarantine behavior:
- Do not crash the whole screen for one bad row.
- Hide invalid row from the table.
- Show inline warning: `{n} payment record could not be displayed because it failed client validation.`
- Keep backend totals visible.
- Route user to support or engineering issue process if invalid rows appear.

Full failure:
- If root response fails contract validation, show full error state.

## Finance Policy Notes
Show a compact policy panel:

Title:
```text
Finance policy guardrails
```

Rows:
- `MTN MoMo is the primary production payment path for pilot.`
- `Payment must be confirmed before dispatch.`
- `Unresolved pending payments move to reconciliation after 5, 15, and 30 minute checks.`
- `Refund settlement is handled in the refund settlement screen.`
- `Pilot driver and courier payouts are processed weekly by finance outside the app.`

Rules:
- Keep this panel short.
- Link to docs or internal policy only if app navigation supports it.
- Do not bury primary payment records below long policy text.

## Unsupported Actions Panel
Show a clear but quiet panel:

Title:
```text
Not handled on this screen
```

Items:
- `Approving refunds`.
- `Settling refunds`.
- `Running reconciliation jobs`.
- `Executing driver or courier payouts`.
- `Station-operator compensation`.
- `Carrier partner settlements`.
- `Editing pricing rules`.
- `Provider credential changes`.

Body:
```text
This screen is for monitoring and routing. Specialist finance workflows handle decisions and settlement.
```

Purpose:
- Prevent Claude Code from adding unsupported UI.
- Prevent admins from expecting payout or settlement execution here.

## Search And Filtering
Backend does not support query parameters for `admin_finance`.

Allowed client-side filters:
- Status.
- Provider.
- Payment ID.
- Delivery ID.
- Provider reference.
- Initiated date quick range over visible rows.
- Missing verification.

Rules:
- Label filters `Filter recent records`.
- State clearly that filters apply to visible recent rows only.
- Do not send unsupported query parameters to backend.
- Do not persist provider references into analytics.
- Announce filtered result count through a polite live region.

Filter result copy:
```text
12 recent records shown.
```

No filter result copy:
```text
No recent records match these filters.
```

Actions:
- `Clear filters`.
- `Refresh finance data`.

## Selection Model
The screen may support single-row selection for contextual right rail actions.

Rules:
- Only one row may be selected at a time.
- Selection must be keyboard reachable.
- Selection must be announced.
- Refresh must preserve selection by `paymentId` when the row still exists.
- If selected row disappears after refresh, clear selection and announce `Selected payment is no longer in recent records.`

Do not:
- Add multi-select.
- Add bulk refund actions.
- Add bulk reconciliation actions.

## Navigation Rules
Routes:
- `/admin/finance/reconciliation`
- `/admin/finance/reconciliation/:paymentId`
- `/admin/finance/refunds/:paymentId/review`
- `/admin/finance/refunds/:paymentId/settle`
- `/admin/finance/refunds/:paymentId/evidence`
- `/admin/pricing-rules`
- `/admin/staff-activity`
- `/admin/deliveries/:deliveryId`

If a route is not implemented yet:
- Hide the action or disable it with copy.
- Do not route to a broken page.
- Add a TODO only in code comments if the route constant is absent; do not surface internal TODO text to users.

Fallback route behavior:
- If reconciliation detail is unavailable, route to `/admin/finance/reconciliation` with selected payment context in UI state or query if supported.
- If refund evidence route is unavailable, route to delivery detail.
- If audit target filters are unavailable, route to `/admin/staff-activity`.

## Copy System
Tone:
- Precise.
- Calm.
- Accountable.
- Short.
- No marketing language.
- No jokes.
- No vague optimism.

Preferred terms:
- `Confirmed collections`.
- `Pending refund liability`.
- `Refunded`.
- `Recent payment records`.
- `Provider reference`.
- `Pending verification`.
- `Finance review`.
- `Settlement`.

Avoid:
- `Revenue` unless accounting approves the term.
- `Profit`.
- `Cash on hand`.
- `Paid out`.
- `Wallet`.
- `Balance` unless provider account balance is actually shown.
- `Payout now`.
- `Instant settlement`.

## Content Inventory
Required static labels:
- `Finance summary`
- `Monitor customer collections, refund liability, and recent MTN MoMo payment records.`
- `Confirmed collections`
- `Pending refund liability`
- `Refunded`
- `Finance work queues`
- `Recent records only`
- `Recent finance payment records`
- `Finance policy guardrails`
- `Not handled on this screen`
- `Refresh finance data`
- `Open reconciliation`
- `View pricing rules`

Required status labels:
- `Pending verification`
- `Confirmed`
- `Failed`
- `Refund pending`
- `Refunded`

Required unavailable labels:
- `Not verified yet`
- `No refund recorded`
- `Unavailable`
- `Finance access required`

## Accessibility Requirements
Landmarks:
- Main content landmark.
- Finance summary region.
- Metric cards grouped under an H2.
- Work queue rail grouped under an H2.
- Recent payments table grouped under an H2.

Keyboard:
- All actions reachable by keyboard.
- Table row copy actions reachable.
- Row selection reachable.
- Refresh button reachable.
- Focus order follows visual order.

Screen reader:
- Metrics expose label, amount, and meaning.
- Status badges expose text labels.
- Copy actions include object in accessible name, such as `Copy provider reference for PAY-0001`.
- Refresh result uses live region.
- Filter count uses live region.
- Table has caption.
- Stale warning uses region or alert based on severity.

Contrast:
- Text contrast at least WCAG AA.
- Status colors have text labels.
- Focus ring visible against all surfaces.
- Amber liability card must remain legible.

Reduced motion:
- Disable metric crossfade.
- Disable row highlight animation.
- Keep progress indication textual.

## Responsive Design
Desktop:
- Two-column layout.
- Sticky right rail optional only if it does not obscure content.
- Table can use compact density.
- Provider reference may wrap over two lines.

Tablet:
- Two columns may collapse below `1024px`.
- Work queue rail moves below totals.
- Table may horizontally scroll with focusable container.

Mobile:
- One-column layout.
- Metric cards stack.
- Status chips wrap.
- Payments render as cards.
- Each payment card shows payment ID, status, amount, delivery, provider reference, initiated time, verified time, and one primary action.
- Copy actions must have minimum touch target.

Do not:
- Hide provider reference without an accessible way to view it for finance users.
- Squeeze ten columns into unreadable mobile table.
- Place primary row action below policy notes.

## Performance Requirements
Targets:
- Initial finance content should render quickly after auth.
- Refresh should not block page chrome.
- Table of 100 rows should not require virtualization.
- Client filtering over 100 rows should be instant.

Rules:
- Do not poll by default.
- Do not refetch on every filter keystroke if it causes re-render jank.
- Keep provider references out of analytics payloads.
- Use memoized derived counts only if needed by the frontend framework.
- Avoid heavy chart libraries for this screen.

Refresh policy:
- Manual refresh required.
- Optional background stale indicator may check time locally.
- Do not auto-refresh while user is copying references or selecting rows.

## Security And Privacy
Sensitive fields:
- `providerReference`.
- `paymentId`.
- `deliveryId`.
- Refund amounts.
- Payment status.

Rules:
- Only render for authorized finance roles.
- Do not log provider references in client analytics.
- Do not include provider references in error tracking breadcrumbs.
- Do not store full finance response in local storage.
- Do not show finance data after logout.
- Do not expose finance data in public metadata tags.
- Do not copy provider reference automatically.
- Do not reveal raw backend error details.
- Do not show provider secrets, tokens, callback secrets, or internal task secrets.

Clipboard:
- User must trigger copy.
- Show copied state for no more than `3 seconds`.
- Clear copied state when route changes.

## Analytics
Allowed events:
- `admin_finance_viewed`
- `admin_finance_refreshed`
- `admin_finance_refresh_failed`
- `admin_finance_filter_changed`
- `admin_finance_row_action_clicked`
- `admin_finance_copy_payment_id_clicked`
- `admin_finance_copy_provider_reference_clicked`
- `admin_finance_route_opened`

Event payload rules:
- Include role category only if allowed by privacy policy.
- Include status filter.
- Include row status.
- Include destination route family.
- Do not include payment ID.
- Do not include delivery ID.
- Do not include provider reference.
- Do not include amount unless approved as aggregated metric.

## Testing Requirements
Unit tests:
- Renders three backend totals.
- Does not recompute totals from rows.
- Maps all five payment statuses.
- Shows `Not verified yet` when `verifiedAt` is absent.
- Shows `No refund recorded` when `refundAmountGhs` is absent.
- Displays provider as `MTN MoMo`.
- Preserves prior data after refresh failure.
- Clears finance data on unauthorized state.
- Applies client filters only to visible rows.
- Does not send unsupported query parameters.
- Does not show payout actions.
- Does not show inline refund approval.
- Does not show inline settlement.

Integration tests:
- Loads `/admin/finance` with finance role.
- Blocks non-finance admin.
- Handles empty state.
- Handles partial empty state.
- Handles stale data warning.
- Routes pending payment to reconciliation.
- Routes refund-pending payment to settlement.
- Routes confirmed payment to delivery detail.
- Copies provider reference without analytics leakage.

Accessibility tests:
- Page has one H1.
- Metric cards have accessible names.
- Table has caption and scoped headers.
- Refresh status is announced.
- Filter result count is announced.
- Keyboard can reach every action.
- Focus remains stable after refresh.
- Color is not the only status indicator.

Visual tests:
- Desktop finance summary.
- Desktop empty state.
- Desktop stale state.
- Mobile stacked payment cards.
- Mobile work queue cards.
- Unauthorized state.
- Error state.

## Acceptance Criteria
1. A finance admin can open `/admin/finance` and see the three backend totals.
2. The page displays the `generatedAt` timestamp in an absolute format with timezone.
3. The page displays up to 100 recent payment records.
4. Each payment row shows payment ID, delivery ID, provider, provider reference, status, amount, initiated time, verified time, and context action.
5. Missing `verifiedAt` displays `Not verified yet`.
6. Missing `refundAmountGhs` displays `No refund recorded`.
7. Pending verification rows route toward reconciliation.
8. Refund-pending rows route toward settlement.
9. Confirmed rows do not show settlement as the primary action.
10. Refunded rows do not show approval or settlement as active actions.
11. Refresh keeps previous successful data visible while loading.
12. Refresh failure preserves previous data and shows a clear error.
13. More than `15 minutes` stale data shows a warning banner.
14. Empty response shows useful empty state and no blank table.
15. Unauthorized users see no finance totals or provider references.
16. The screen has no inline refund approval or settlement form.
17. The screen has no payout execution UI.
18. The screen has no station-operator compensation UI.
19. The screen has no partner settlement UI.
20. Accessibility checks pass for headings, table semantics, live regions, contrast, and keyboard navigation.

## Implementation Notes For Claude Code
Build `AdminFinanceSummary` as a read-only finance command view. Use `useAdminFinanceQuery` or the app's equivalent query wrapper for `GET /v1/admin/finance`. Render backend totals as authoritative, render recent payment rows with status-safe actions, and route deeper work to reconciliation, refund, delivery, pricing, and audit screens. Do not add inline refund decisions, settlement forms, payout execution, station-operator compensation, partner settlements, provider credential controls, or unsupported backend query parameters. Keep provider references finance-only, exclude them from analytics, and make refresh, filtering, stale state, and table interactions accessible.
