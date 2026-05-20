# CourierEarnings Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierEarnings` |
| Route | `/(ops)/courier/earnings` |
| Primary test ID | `screen-courier-earnings` |
| Surface | Final-mile courier mobile app |
| Backend coverage | Future courier earnings ledger endpoint required; current backend has no courier earnings or payout API |
| Offline critical | No mutation; yes for cached read continuity after ledger endpoint exists |
| Required role | `final_mile_courier` |
| Primary job | Give couriers a trustworthy weekly earnings ledger without pretending payout execution exists in the app |
| Parent screens | `CourierHome`, `CourierCompletedJobs`, `CourierIssues` |
| Related screens | `CourierAssignments`, `CourierAssignmentDetail`, `CourierProofCapture`, `CourierOtpCompletion`, `CourierSignatureProof`, `CourierPhotoProof`, `AdminFinanceOverview` |
| Current implementation mode | Backend-required ledger shell with honest unavailable state until courier earnings contract exists |

## Outcome
`CourierEarnings` gives a final-mile courier a clear answer to `what have I earned, why, and when should I expect payment?`

The screen must answer:
- `What is my net payable amount for the selected week?`
- `Which completed doorstep deliveries created earnings?`
- `Which adjustments changed my net payable amount?`
- `What is the payout status for this weekly period?`
- `When is finance expected to process this payout during the pilot?`
- `Which items are held for review?`
- `How do I raise a payment issue without exposing finance internals?`
- `Why are earnings not visible yet if the backend ledger is unavailable?`

The screen must not answer these by guessing. Money values must come only from an authoritative backend ledger.

## Product Definition
This screen allows couriers to:
- See weekly earnings once the backend exposes courier ledger records.
- See net payable amount, gross earned amount, total adjustments, and payout status.
- Inspect earning rows tied to completed doorstep deliveries.
- Inspect finance-admin adjustment rows without changing them.
- Filter ledger rows by period, status, and row type.
- Open a completed job from an earning row.
- Open `CourierIssues` for earnings questions or dispute follow-up.
- Read a clear pilot note that payouts are processed weekly by finance and operations outside the app.
- Use cached read-only ledger data when offline after a successful fetch.

It does not allow couriers to:
- Execute a payout.
- Cash out.
- Edit payout destination.
- Add bank, mobile money, or wallet details.
- Calculate earnings from completed deliveries in the client.
- View admin finance dashboards.
- See other couriers' earnings.
- Override adjustments.
- Delete earning events.
- Treat an estimated amount as payable.
- Use delivery list data as a money source.

## Users
Primary:
- Final-mile couriers checking what they earned from completed doorstep deliveries.

Secondary:
- Finance operators explaining weekly pilot payouts.
- Support staff helping couriers understand held or adjusted rows.
- QA validating that the mobile app does not expose unsupported payment behavior.

## Entry Points
The screen can open from:
- `CourierHome` earnings card.
- `CourierCompletedJobs` payment question link.
- Completion success screens after a delivered final-mile handoff.
- `CourierIssues` when an issue references earnings.
- Push notification or inbox item when future payout status notifications exist.

## Real-World Context
Couriers will open this screen after a shift, at the end of a week, after a finance payment delay, or while asking support why a completed delivery did not create earnings. The UI must be calm and exact because money confusion quickly becomes trust loss.

The screen must support:
- Low-bandwidth loading.
- Bright outdoor usage.
- Short visits after each delivery.
- End-of-week reconciliation.
- Honest unavailable state before backend ledger support exists.
- Strict separation between earnings visibility and payout execution.

## User Goal
Primary goal:
- Understand earned, adjusted, and payable amounts for the selected weekly payout period.

Secondary goals:
- Confirm which deliveries created earnings.
- See whether payment is pending, paid, held, or adjusted.
- Know whether to wait for weekly finance processing or open an issue.
- Avoid contacting support because of unclear ledger wording.

## Scope
In scope:
- Weekly earnings summary.
- Ledger rows for completed doorstep delivery earnings.
- Adjustment rows.
- Payout status display.
- Current backend-unavailable state.
- Cached read-only state after ledger exists.
- Link to completed jobs.
- Link to issue creation.
- Backend contract required for implementation.

Out of scope:
- Payout execution.
- Cash-out.
- Bank account management.
- Mobile money onboarding.
- Tax documents.
- Driver inter-station earnings.
- Station operator settlement.
- Carrier partner invoicing.
- Admin finance approval.
- Customer refunds.
- Rate-card management.

## Design Thesis
This screen should feel like a premium mobile finance ledger for field operators: sharp numbers, transparent row-level reasoning, and zero decorative confusion around money.

Design principles:
- Money must be sourced, not inferred.
- Weekly payout timing must be visible without overpromising exact bank arrival.
- Each earning row must explain the operational reason behind the amount.
- Adjustments must be separate from original earnings.
- The current backend limitation must be stated clearly enough that Claude Code cannot hide it behind empty charts.
- The visual system should feel serious, stable, and finance-grade rather than promotional.

Visual thesis:
- `calm ledger`: dark ink typography, warm neutral surfaces, high-contrast amount cards, restrained green for earned money, amber for pending review, red only for failed or reversed items.

Restraint rule:
- No celebratory confetti, cash graphics, speculative charts, animated counters, or rate teasers.

## Research Inputs
Relevant external references:
- [DoorDash Dasher pay](https://dasher.doordash.com/en-us/pay?hsLang=en-us): supports a dedicated earnings area that tracks daily and historical earnings while separating payout methods from earning history.
- [Uber cash out help](https://help.uber.com/en/driving-and-delivering/article/get-your-earnings-fast-with-cash-out?nodeId=a4e5494c-85a5-4c1c-a095-2c71552e596b): supports clear weekly earnings, automatic deposit timing, and review holds when some fares are not immediately eligible.
- [Stripe Connect payouts](https://docs.stripe.com/connect/payouts-connected-accounts?locale=en-GB): supports explicit payout lifecycle states, platform-controlled schedules, manual payouts, and payout webhooks for future automation.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports immediate local read models, stale indicators, and network-conscious refresh behavior.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing loading, refresh, filter, unavailable, payout status, and error changes without moving focus.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible period controls, row taps, filter chips, and issue actions.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/09-payments/payouts-and-driver-earnings.md`
- `docs/13-project/decision-log.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/02-courier-home.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/15-courier-completed-jobs.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/routes.ts`
- `services/api/src/admin.ts`
- `services/api/src/payment-reconciliation.ts`
- `services/api/src/refunds.ts`

## Approved Policy
The local payment policy is already decided for pilot v1:
- Drivers earn per completed inter-station assignment.
- Final-mile couriers earn per completed doorstep delivery.
- Final-mile courier earnings are not kilometer-based in v1.
- Earnings appear in-app immediately after the qualifying completion event.
- Pilot payouts are processed weekly by finance and operations outside the app.
- The app is an earnings ledger and visibility surface in v1.
- The app is not a payout execution system in v1.
- Reversals and deductions require finance-admin adjustment records.
- Original earning events are never deleted.

This screen must encode those decisions directly in IA, copy, state names, and tests.

## Current Backend Reality
Current backend coverage does not include a courier earnings endpoint.

Available backend areas:
- Sender payment initiation and verification.
- Admin finance overview.
- Payment reconciliation.
- Refund request and refund settlement.
- Delivery list and detail.
- Issue creation and issue listing.

Unavailable for this screen today:
- Courier earning event collection.
- Courier payout period summary.
- Courier payout status endpoint.
- Courier adjustment endpoint.
- Courier payout batch record.
- Courier payout reference.
- Courier-safe finance summary.
- Courier-facing rate or earning amount field.

Important implementation boundary:
- `list_deliveries` must not be used to calculate money.
- `admin_finance` must not be called from this courier screen.
- Refund endpoints must not be used for courier earnings.
- Payment reconciliation endpoints must not be exposed to couriers.
- Completed job count must not be multiplied by any client-side rate.

## Current UI Mode
Until the backend ledger exists, the production screen must render an honest unavailable state.

Unavailable state copy:
- Title: `Earnings ledger not available yet`
- Body: `Kra has approved weekly courier earnings visibility, but the courier earnings ledger API is not exposed yet. Completed jobs are still visible in job history. Money values will appear here only when they come from the finance ledger.`
- Primary action: `View completed jobs`
- Secondary action: `Report an earnings issue`
- Policy note: `Pilot payouts are processed weekly by finance and operations outside the app.`

The unavailable state must still:
- Render the screen route.
- Render `screen-courier-earnings`.
- Show the weekly payout policy note.
- Link to `CourierCompletedJobs`.
- Link to `CourierIssues`.
- Avoid all amount cards unless amounts are available from the future ledger endpoint.
- Avoid charts that imply hidden values.

## Target Backend Contract
The following contract is required before the screen can show real amounts.

Operation ID:
```text
get_courier_earnings
```

Endpoint:
```http
GET /v1/courier/earnings?periodStart=YYYY-MM-DD&periodEnd=YYYY-MM-DD
```

Required authorization:
- Authenticated user.
- Role `final_mile_courier`.
- Response scoped to the authenticated courier.

Period constraints:
- `periodStart` must be start of local payout week.
- `periodEnd` must be inclusive end of local payout week or exclusive next-period boundary, but backend must define one convention.
- Client must not infer period closure rules beyond backend metadata.

Required response shape:
```json
{
  "courierId": "usr_123",
  "currency": "GHS",
  "periodStart": "2026-05-18",
  "periodEnd": "2026-05-24",
  "periodLabel": "May 18-24",
  "grossEarnedAmountGhs": 0,
  "adjustmentAmountGhs": 0,
  "netPayableAmountGhs": 0,
  "heldAmountGhs": 0,
  "payoutStatus": "not_ready",
  "payoutTargetDate": "2026-05-29",
  "paidAt": null,
  "payoutReference": null,
  "lastUpdatedAt": "2026-05-20T12:00:00.000Z",
  "items": []
}
```

Required item shape:
```json
{
  "earningEventId": "earn_123",
  "deliveryId": "del_123",
  "trackingCode": "KRA-123",
  "completedAt": "2026-05-20T12:00:00.000Z",
  "earningReason": "completed_doorstep_delivery",
  "rowType": "earning",
  "status": "pending_finance_review",
  "grossAmountGhs": 0,
  "adjustmentAmountGhs": 0,
  "netAmountGhs": 0,
  "explanation": "Completed doorstep delivery",
  "financeNoteVisibleToCourier": null,
  "sourceEventId": "handoff_123",
  "createdAt": "2026-05-20T12:00:00.000Z"
}
```

Required response rules:
- Currency must be `GHS` for Ghana pilot unless backend introduces multi-currency support.
- Amount fields must be integers representing Ghana pesewas or clearly documented major-unit numbers. The response must not mix units.
- `items` must be sorted newest first by `completedAt` or `createdAt`.
- `netPayableAmountGhs` must equal backend-owned calculation, not client-owned calculation.
- `heldAmountGhs` must be separate from `netPayableAmountGhs`.
- Adjustments must be rows, not silent mutations of original earning rows.
- Original earning event rows must remain visible after adjustment.
- Backend must expose enough row text to explain the amount without exposing admin-only notes.

## Target Payout Status Values
The UI must support these target values:
- `not_ready`: Period is open or finance has not reviewed it.
- `pending_finance_review`: Finance review is required before weekly payout.
- `approved_for_weekly_payout`: Finance approved this period for weekly processing.
- `included_in_weekly_payout`: The period is included in a weekly payout batch.
- `paid`: Finance marked the weekly payout as paid.
- `partially_paid`: Some payable rows were paid and others are still pending or held.
- `held`: The period has money held for review.
- `adjusted`: The period includes finance-admin adjustments.
- `failed`: Payout attempt failed in a future automated payout rail.

If backend later integrates Stripe Connect, these UI values can map to provider states such as pending, in transit, paid, failed, or canceled. Provider raw status must not appear to couriers without product-owned wording.

## Target Earning Reasons
The UI must support these target reason codes:
- `completed_doorstep_delivery`
- `adjustment_credit`
- `adjustment_debit`
- `manual_hold`
- `manual_release`
- `payout_batch_inclusion`
- `payout_failure_reversal`

V1 visible copy:
- `completed_doorstep_delivery`: `Completed doorstep delivery`
- `adjustment_credit`: `Finance credit`
- `adjustment_debit`: `Finance adjustment`
- `manual_hold`: `Held for review`
- `manual_release`: `Released after review`
- `payout_batch_inclusion`: `Included in weekly payout`
- `payout_failure_reversal`: `Payout retry required`

## Information Architecture
When ledger is available, top-to-bottom order:
- Header and period selector.
- Pilot payout policy note.
- Net payable card.
- Payout status card.
- Week summary strip.
- Ledger filters.
- Ledger list.
- Adjustment explanation block when adjustments exist.
- Support path.
- Backend freshness footer.

When ledger is unavailable, top-to-bottom order:
- Header.
- Unavailable state block.
- Pilot payout policy note.
- Completed jobs action.
- Earnings issue action.
- Backend requirement note for internal builds.

## Header
Content:
- Title: `Earnings`
- Subtitle when ledger exists: `Weekly courier ledger`
- Subtitle when ledger is unavailable: `Ledger API required`
- Optional right action: help icon leading to `CourierIssues` with reason `earnings_question`.

Behavior:
- Header remains pinned only if the platform pattern already uses pinned headers.
- Avoid a wallet balance treatment because the app does not hold funds.
- Avoid words that imply cash-out or immediate payment.

## Period Selector
Purpose:
- Let courier inspect a weekly payout period.

Required behavior:
- Default to current local week.
- Show previous and next week controls.
- Disable next week beyond current week unless backend supports future periods.
- Show period label from backend when available.
- If backend returns a period boundary different from client expectation, render backend period.
- Preserve selected period through app backgrounding.

States:
- `current_week`
- `previous_week`
- `loading_period`
- `period_unavailable`
- `period_closed`
- `period_paid`

Accessibility:
- Each period button must include the full date range.
- Selected week must be programmatically exposed.
- Changing week must announce ledger loading and result count.

## Pilot Policy Note
Always render a concise policy note.

Copy:
```text
Pilot payouts are processed weekly by finance and operations outside the app. This screen is your earnings ledger, not a payout execution tool.
```

Rules:
- Do not hide the note after first view.
- Keep the note near the top because it prevents mistaken cash-out expectations.
- If future payout automation is implemented, replace this note only after policy docs change.

## Net Payable Card
Render only when ledger amount fields are present.

Content:
- Label: `Net payable`
- Amount: backend `netPayableAmountGhs`
- Currency: `GHS`
- Subtext: `For May 18-24` or backend period label.
- Secondary metrics:
  - `Gross earned`
  - `Adjustments`
  - `Held`

Rules:
- Use backend totals exactly.
- Format money consistently.
- Never animate the amount from zero to value.
- Never show plus signs on net payable.
- Show negative adjustment with clear wording, not only red color.
- If `heldAmountGhs` is greater than zero, show amber hold chip.

Empty money state:
- If all totals are zero and period is open, write `No payable earnings in this week yet.`
- If all totals are zero and period is closed, write `No earnings were recorded for this week.`

## Payout Status Card
Render only when ledger status exists.

Content:
- Status label.
- Status explanation.
- Target date or paid date.
- Finance note when safe.

Status copy:
- `not_ready`: `This week is still building.`
- `pending_finance_review`: `Finance review pending.`
- `approved_for_weekly_payout`: `Approved for weekly payout.`
- `included_in_weekly_payout`: `Included in this week's payout batch.`
- `paid`: `Marked paid by finance.`
- `partially_paid`: `Partially paid. Some rows still need review.`
- `held`: `Held for review.`
- `adjusted`: `Adjusted by finance.`
- `failed`: `Payout needs attention.`

Rules:
- A paid status is not a bank guarantee. If future provider arrival date exists, label it as provider or bank timing.
- A failed status must offer `Report an earnings issue`.
- A held status must show row-level held reasons if backend exposes courier-safe text.

## Week Summary Strip
Purpose:
- Give fast shift-level confidence without clutter.

Metrics:
- `Completed deliveries counted`
- `Earning rows`
- `Adjustment rows`
- `Held rows`

Rules:
- Metrics must come from ledger response.
- Do not count `list_deliveries` rows for money.
- If count fields are absent, derive counts from `items` only after ledger response exists.

## Ledger Filters
Filters:
- `All`
- `Earnings`
- `Adjustments`
- `Held`
- `Paid`

Rules:
- Filters operate on returned ledger rows only.
- Filter chips must not call new backend queries unless the future endpoint supports server filtering.
- Selected filter must be visible and announced.
- Empty filter result must explain the filter, not the entire period.

## Ledger Row
Each row must show:
- Reason label.
- Tracking code when `deliveryId` exists.
- Completion or row creation timestamp.
- Status chip.
- Net row amount.
- Short explanation.
- Tap affordance when delivery detail is available.

Row types:
- Earning row.
- Adjustment credit row.
- Adjustment debit row.
- Hold row.
- Release row.
- Payout batch row.
- Failure/retry row.

Rules:
- Earning row amount uses `grossAmountGhs` or `netAmountGhs` depending on backend contract.
- If both gross and net are available, show net as main amount and gross in expanded detail.
- Adjustment rows must show the affected delivery when linked.
- Rows without a linked delivery must not show a broken link.
- Red color alone must never communicate negative adjustment.
- Tap target must meet mobile accessibility size.

Expanded row detail:
- Delivery tracking code.
- Delivery completion time.
- Source event ID if safe.
- Finance-visible explanation.
- Adjustment relationship if linked.
- Action: `Open completed job` when delivery detail is available.
- Action: `Ask about this earning` leading to `CourierIssues` with row context.

## Empty States
No earnings in current week:
- Title: `No earnings recorded this week`
- Body: `Completed doorstep deliveries will appear here after the finance ledger records them.`
- Action: `View assignments`

No earnings in previous week:
- Title: `No earnings for this week`
- Body: `There are no courier earnings recorded for the selected period.`
- Action: `View completed jobs`

Filtered empty:
- Title: `No rows match this filter`
- Body: `Try another earnings status or return to all rows.`
- Action: `Show all`

Backend unavailable:
- Use the current UI mode copy defined above.

## Loading State
Loading behavior:
- Show skeletons for summary cards and first ledger rows only when ledger endpoint exists.
- Do not show money-shaped skeletons in current unavailable mode.
- Keep prior period visible while refreshing if prior data exists.
- Announce `Loading earnings` through a status message.

Timeout:
- If fetch exceeds app timeout, keep cached data when available.
- Show `Could not refresh earnings`.
- Do not clear last known ledger unless user signs out.

## Offline State
Before ledger endpoint exists:
- Offline state mirrors backend unavailable and says earnings require the finance ledger.

After ledger endpoint exists:
- If cached ledger exists, show cached ledger with stale banner.
- If no cached ledger exists, show offline empty state.

Cached banner copy:
```text
Offline. Showing last saved earnings from May 20, 2026 at 12:00.
```

Rules:
- Offline cached values must be visibly marked stale.
- User cannot submit payout actions offline because payout actions do not exist.
- Issue creation can follow `CourierIssues` offline rules when that screen supports it.

## Error States
Unauthorized:
- Title: `Sign in again`
- Body: `Your session expired. Sign in to view courier earnings.`
- Action: `Sign in`

Forbidden:
- Title: `Earnings unavailable for this role`
- Body: `This screen is only for final-mile couriers.`
- Action: `Go home`

Endpoint missing:
- Title: `Earnings ledger not available yet`
- Body: `The courier earnings API is not exposed yet. Completed jobs remain available in job history.`
- Action: `View completed jobs`

Server error:
- Title: `Could not load earnings`
- Body: `Try again. If this continues, report an earnings issue.`
- Actions: `Retry`, `Report issue`

Partial ledger:
- Title: `Some earnings data could not load`
- Body: `Showing the available ledger rows. Refresh before acting on this amount.`
- Action: `Refresh`

Held period:
- Title: `Some earnings are held for review`
- Body: `Finance must review held rows before they become payable.`
- Action: `View held rows`

## Business Rules
Money source rules:
- All amount fields must come from the courier earnings ledger endpoint.
- Client must not calculate delivery earnings from completed job count.
- Client must not use local rate cards.
- Client must not infer payout status from dates alone.
- Client must not show provider references unless backend returns courier-safe payout copy.

Ledger integrity rules:
- Original earning event rows are immutable in the UI.
- Adjustment rows are additive.
- Held rows must remain visible.
- Paid rows remain visible for history.
- Negative adjustments must require explanation text.
- A delivery can have multiple ledger rows only when backend returns distinct events.

Pilot payout rules:
- Weekly payout is handled outside the app.
- The app can show finance status but cannot execute payment.
- Target payout date is informational unless backend marks paid.
- Paid status means finance marked paid, not necessarily that the courier's bank or wallet has posted funds.

## Navigation Rules
Primary actions:
- `View completed jobs` routes to `/(ops)/courier/completed`.
- `Report an earnings issue` routes to `/(ops)/courier/issues/new?reason=earnings_question` or closest app route.
- Ledger row `Open completed job` routes to read-only completed delivery detail.

Back behavior:
- Return to prior screen preserving selected period.
- If opened from notification, back routes to `CourierHome`.

Deep link behavior:
- `/courier/earnings?periodStart=YYYY-MM-DD` opens selected week if valid.
- Invalid period returns current week and shows non-blocking message.

## Visual System
Layout:
- Single-column mobile ledger.
- Use high-density but readable rows.
- Summary cards use strong alignment and generous vertical spacing.
- Amount cards must not compete with payout status card.

Color:
- Neutral background.
- Deep ink for text.
- Green only for earned or paid states.
- Amber for review or pending states.
- Red only for failed or negative adjustment emphasis.
- Blue or slate for informational policy notes.

Typography:
- Amount uses tabular numerals.
- Row amounts use tabular numerals.
- Status labels use concise title case.
- Body copy stays direct and low-hype.

Motion:
- Period change may crossfade rows.
- Pull-to-refresh uses platform-native behavior.
- Status change should not animate the amount itself.
- Respect reduced motion.

Density:
- Summary area should fit within the first mobile viewport with status visible.
- Ledger rows should show at least four rows on common phone heights after summary collapse, if platform supports collapsing.
- Avoid wide charts because weekly courier ledger is row-driven.

## Copy System
Voice:
- Precise.
- Calm.
- Accountable.
- No hype.

Approved phrases:
- `Net payable`
- `Gross earned`
- `Finance adjustment`
- `Held for review`
- `Included in weekly payout`
- `Marked paid by finance`
- `Pilot payouts are processed weekly outside the app`
- `Money values come from the finance ledger`

Avoid:
- `Cash out`
- `Withdraw now`
- `Guaranteed payout`
- `Instant payment`
- `Estimated earnings`
- `Expected cash`
- `Wallet balance`
- `Bank confirmed`
- `You will receive today`

## Data Privacy
Do not show:
- Other courier names.
- Other courier earnings.
- Admin-only finance notes.
- Bank account numbers.
- Mobile money account numbers.
- Raw provider references unless explicitly safe.
- Internal reconciliation IDs as primary user copy.
- Customer payment details.
- Refund reasoning.

Allowed:
- Courier-safe payout reference after finance marks paid.
- Delivery tracking code.
- Completion timestamp.
- Courier-safe adjustment explanation.
- Row source type.

## Analytics
Events:
- `courier_earnings_viewed`
- `courier_earnings_period_changed`
- `courier_earnings_filter_selected`
- `courier_earnings_row_opened`
- `courier_earnings_completed_jobs_clicked`
- `courier_earnings_issue_clicked`
- `courier_earnings_refresh_attempted`
- `courier_earnings_refresh_failed`
- `courier_earnings_unavailable_viewed`

Required properties:
- `period_start`
- `period_end`
- `payout_status`
- `row_count`
- `held_row_count`
- `has_adjustments`
- `is_cached`
- `backend_available`

Forbidden properties:
- Full receiver name.
- Receiver phone.
- Admin finance note.
- Bank or wallet destination.
- Raw payment provider response.

## Accessibility
Requirements:
- Root has `screen-courier-earnings`.
- Main heading is first logical heading.
- Amounts have accessible labels including currency.
- Status chips are not color-only.
- Filter chips expose selected state.
- Period controls expose full date range.
- Refresh, unavailable, error, and filter result changes use status messages.
- Touch targets meet WCAG minimum and platform mobile guidance.
- Rows remain readable at large text sizes.
- Focus order follows visual order.
- Back and issue actions are keyboard and switch accessible.

Screen reader amount format:
- Visual: `GHS 124.00`
- Accessible: `Net payable, 124 Ghana cedis`

Negative adjustment format:
- Visual: `-GHS 8.00`
- Accessible: `Finance adjustment, minus 8 Ghana cedis`

## Performance
Requirements:
- Initial route shell renders immediately.
- Ledger fetch must not block app navigation.
- Cached ledger read should appear before network refresh after endpoint exists.
- Row list should virtualize after 50 rows.
- Avoid heavy chart libraries.
- Avoid repeated money formatting allocations during scroll.

## Security
Requirements:
- All requests require authenticated courier session.
- Backend must scope response to authenticated courier.
- Client must not accept `courierId` query override for this screen.
- Logs must not include ledger item amounts beyond safe analytics totals approved by policy.
- Error messages must not expose finance internals.
- Deep links must not reveal another courier's ledger.

## Testing Requirements
Unit tests:
- Renders unavailable state when ledger endpoint is absent.
- Does not call `admin_finance`.
- Does not calculate earnings from `list_deliveries`.
- Formats positive, zero, and negative amounts.
- Maps each payout status to approved copy.
- Maps each earning reason to approved copy.
- Filters ledger rows locally.
- Preserves selected period.
- Shows held amount separately.

Integration tests:
- Loads current week ledger from target endpoint when available.
- Opens completed job from earning row.
- Opens issue flow with earnings context.
- Handles unauthorized, forbidden, server error, and endpoint missing.
- Shows cached stale state when offline after a successful fetch.
- Shows no amount cards in current unavailable mode.

Accessibility tests:
- Root test ID exists.
- Status messages are announced.
- Period selector is keyboard accessible.
- Filter selected state is exposed.
- Row actions have accessible names.
- Amounts include currency in labels.

Policy tests:
- Weekly payout note appears.
- No cash-out action appears.
- No payout destination editing appears.
- No estimated earnings appear.
- Original earning and adjustment rows both render when linked.

## Acceptance Criteria
The screen is acceptable when:
- `/(ops)/courier/earnings` renders under courier auth.
- `screen-courier-earnings` is present.
- Current backend-unavailable state is honest and actionable.
- No money value is invented from completed jobs.
- Future ledger contract is specified clearly enough for backend implementation.
- Weekly pilot payout policy is visible.
- Finance adjustment behavior is represented.
- Held and paid statuses are distinct.
- Issue routing exists.
- Completed jobs routing exists.
- The design can be built without frontend code guessing about payout rules.

## Implementation Notes For Claude Code
Build this screen as a real production route, but do not fabricate backend data.

Current implementation:
- Render the route.
- Render the unavailable state.
- Wire navigation to completed jobs and issues.
- Keep ledger components behind a real feature flag or endpoint availability check.
- Do not create local earning records.
- Do not create a client rate table.
- Do not use completed job count for amount display.

Future implementation:
- Add typed client contract for `get_courier_earnings`.
- Render summary cards only from ledger response.
- Render rows only from ledger response.
- Cache ledger response for read-only offline continuity.
- Keep payout execution out of this route until policy changes.

## Open Backend Work
Required before real earnings display:
- Add courier earnings domain model.
- Add earning event persistence on completed doorstep delivery.
- Add finance-admin adjustment model.
- Add weekly payout period model.
- Add courier-safe earnings endpoint.
- Add payout status lifecycle.
- Add paid or payout reference field.
- Add authorization tests for courier scoping.
- Add API contract schemas in shared package.
- Add webhooks only if an automated payout provider is integrated later.

## Open Product Work
Required before launch of real money values:
- Confirm final-mile courier flat earning amount per completed doorstep delivery.
- Confirm who approves weekly payout batches.
- Confirm cutoff timezone.
- Confirm payout week start day.
- Confirm whether held rows reduce net payable immediately or remain outside net payable.
- Confirm exact copy for finance-admin adjustments.
- Confirm support SLA for earnings issues.
- Confirm whether paid status means finance sent money or provider confirmed arrival.

## Quality Bar
This spec is not closed unless the resulting UI:
- Feels as serious as a finance app ledger.
- Is clearer than common gig-worker payout screens.
- Never hides backend limitations.
- Never turns job history into a money calculator.
- Makes weekly pilot payout operations understandable.
- Gives couriers a clear path when money is missing, held, or adjusted.
- Can survive poor network conditions without confusing stale values for live values.

## Handoff Checklist
- Screen contract is complete.
- Current backend limitation is explicit.
- Future API contract is defined.
- Approved payment policy is encoded.
- UI states are complete.
- Error states are complete.
- Offline behavior is complete.
- Accessibility requirements are complete.
- Analytics are complete.
- Security boundaries are complete.
- Tests reject client-side earnings invention.

## Final Self-Review
Backend honesty:
- Pass. The spec states that the current backend lacks a courier earnings endpoint and requires an unavailable state until the ledger exists.

Payment policy:
- Pass. The spec encodes per-completed-doorstep earning, weekly pilot payout, out-of-app payout execution, and immutable earning events with separate adjustments.

UI quality:
- Pass. The spec defines a premium, serious, low-noise ledger with amount hierarchy, status clarity, row-level explanations, and no unsupported payout affordances.

Implementation readiness:
- Pass. Claude Code can build the current route safely now and add real ledger rendering later only when the backend contract exists.

Closed for implementation:
- This file is full enough for Claude Code to build `CourierEarnings` end to end as a production-grade courier earnings ledger shell today, and as a real ledger when backend support is added, without creating unsupported payout behavior.
