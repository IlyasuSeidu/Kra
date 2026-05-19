# DriverEarnings Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverEarnings` |
| Route | `/(ops)/driver/earnings` |
| Primary test ID | `screen-driver-earnings` |
| Surface | Driver mobile app |
| Backend coverage | Payout and earning events when exposed |
| Offline critical | No |
| Required role | `driver` |
| Required capability | Own earnings visibility |
| Primary mutation | None |
| Current backend status | No driver earnings endpoint is exposed in the current API contracts |
| Supporting reads | Future `earning_events`, future payout status, optional `list_deliveries` cache for navigation context only |
| Related routes | `/(ops)/driver/history`, `/(ops)/driver/runs`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Read-only earnings shell plus future-ready ledger contract; no payout execution in app |

## Product Job
`DriverEarnings` gives drivers a trustworthy view of what they earned, what is pending weekly finance processing, and where to go if an earning looks wrong.

The screen answers:

- `How much have I earned from completed inter-station assignments?`
- `Which assignments created earning records?`
- `Which amounts are pending weekly payout processing?`
- `Which amounts are adjusted, withheld, or disputed?`
- `When is the next finance payout cycle?`
- `What should I do if an earning is missing or incorrect?`

This screen must not execute payouts. In the pilot, finance and operations process payouts weekly outside the app.

## Product Standard
Driver earnings is a trust surface. It must be clear, conservative, and finance-safe.

The driver should be able to:

- See a clear weekly earnings summary when earning data exists.
- Understand that payout execution happens weekly outside the app during pilot.
- Review assignment-level earning rows.
- See payout status labels without confusing pending visibility with money movement.
- Open history or support when an earning does not match a completed run.
- See unsupported-state copy if the backend has not exposed earnings yet.

The screen must never:

- Promise an amount that is not backed by an earning record.
- Mark money as paid without payout status evidence.
- Let the driver trigger payout execution.
- Collect bank, wallet, or payout account details.
- Display provider settlement references unless a driver-safe contract adds them.
- Mix refund settlement language with driver payout language.
- Show receiver phone number or full receiver address.
- Infer earnings from route distance, package count, delivery fee, or quote amount.
- Use `list_deliveries` to calculate payable amounts.

## Audience
Primary audience:

- Driver reviewing their own earnings and payout visibility.

Secondary audience:

- Finance team reconciling driver-visible earning records.
- Support team handling missing earning questions.
- QA validating unsupported backend behavior.
- Claude Code implementing future-ready read-only earning UI.
- Product leadership validating trust and payout wording.
- Accessibility reviewer validating amount, status, filter, and ledger readability.

## Context Of Use
The driver may open this screen:

- After completing a destination handoff.
- At end of shift.
- Before the weekly payout cycle.
- During a support call.
- After noticing a missing run in history.
- While offline with saved earning rows.
- Before finance has processed the weekly payout.

The screen must reduce anxiety without overpromising. If backend data is unavailable, it should say that clearly and point to history and support.

## Design Brief
Audience:

- Driver who needs money visibility and evidence, not a finance console.

Surface type:

- Mobile finance visibility ledger.

Primary action:

- `Review earning records`

Visual thesis:

- `Pay ledger`: a serious finance card with week summary, status rail, and transaction-grade assignment rows.

Restraint rule:

- Do not add payout execution, payout method editing, bank collection, route maps, delivery mutation controls, or settlement documents.

Interaction density:

- Medium: money totals, payout status, filters, and row evidence must fit without feeling like a spreadsheet.

Trust posture:

- Every amount must trace to an earning event or explicitly say it is unavailable.

## External Research Used
Only directly relevant sources were used:

- [Uber driver earnings tracking](https://www.uber.com/us/en/drive/basics/tracking-your-earnings/): supports earnings hub patterns such as session summaries, weekly summaries, weekly statements, and transaction breakdowns for driver trust.
- [Uber Help: viewing trip earnings](https://help.uber.com/driving-and-delivering/article/-view-my-earnings?nodeId=ceebe501-e329-4891-98dd-f1cc026137ad): supports day/week/trip detail and weekly statements as established driver earnings concepts.
- [DoorDash Dasher pay](https://dasher.doordash.com/en-us/pay?hsLang=en-us): supports driver-facing earnings history, weekly pay visibility, and clear payout timing communication.
- [Stripe Connect overview](https://stripe.com/connect): supports showing payout timing and payment status in marketplace-style platforms while separating payout execution from visibility.
- [Stripe payouts documentation](https://docs.stripe.com/payouts): supports careful payout status language because payout timing and failure states can change after initiation.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh, loading, payout-status, and ledger updates.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): supports large touch targets for filters, period controls, and row actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/09-payments/payouts-and-driver-earnings.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/11-analytics/dashboard-metrics.md`
- `docs/13-project/decision-log.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/08-security/authorization-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/13-driver-history.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/02-driver-home.md`

## Business Rules
Approved V1 decisions:

- Drivers earn per completed inter-station assignment, not per scan event.
- Earnings appear in-app after the qualifying completion event.
- Pilot payouts are processed weekly by finance and operations outside the app.
- The app is an earnings ledger and visibility surface, not the payout execution system.
- Reversals or deductions require finance-admin adjustment records.
- Original earning events are never deleted.

Finance trust rules:

- Gross earning events and adjustments must remain separate.
- Net payable amount is the user-facing total.
- Payout status must be explicit.
- Provider settlement records are money-movement truth.
- Internal delivery and earning records are service-entitlement truth.

## Backend Contract
Current API:

- No `driver_earnings` route exists in current API route definitions.
- No earning event response schema exists in current shared contracts.
- No payout status response schema exists for drivers.
- `list_deliveries` cannot calculate earnings.
- `list_deliveries` may be used only to route to history or support context.

Future recommended route:

- `GET /v1/driver/earnings`
- Auth scope: authenticated
- Role: `driver`
- Capability: own earnings visibility
- Query: `periodStart`, `periodEnd`, `status`, `limit`, `cursor`
- Response: driver-safe earnings summary and ledger rows

Future recommended detail route:

- `GET /v1/driver/earnings/:earningEventId`
- Shows one earning event, adjustments, payout batch, and linked delivery.

Future recommended support route:

- `POST /v1/issues`
- Existing support issue flow can carry `category=payment_or_earning` or equivalent when available.

## Future Data Model
The screen should be designed around a future driver-safe schema, not around delivery quote data.

Summary fields:

- `periodStart`
- `periodEnd`
- `currency`
- `grossEarned`
- `adjustmentsTotal`
- `netPayable`
- `pendingPayout`
- `paidAmount`
- `withheldAmount`
- `disputedAmount`
- `nextPayoutWindow`
- `lastUpdatedAt`

Ledger row fields:

- `earningEventId`
- `deliveryId`
- `assignmentId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `earningReason`
- `grossAmount`
- `adjustmentAmount`
- `netAmount`
- `payoutStatus`
- `earnedAt`
- `payoutBatchId`
- `payoutScheduledFor`
- `paidAt`
- `adjustmentReason`
- `disputeStatus`

Allowed payout statuses:

- `not_available`
- `earned`
- `pending_weekly_payout`
- `scheduled`
- `paid`
- `withheld`
- `adjusted`
- `disputed`
- `failed`

Implementation note:

- Until this schema exists, render the unavailable state and route to history/support. Do not calculate amounts.

## Unsupported Backend State
Because the current backend does not expose earnings, the initial implementation must support an explicit unavailable mode.

Unavailable state title:

- `Earnings ledger not connected yet`

Unavailable body:

- `Kra records driver earnings policy, but this app does not yet have a driver earnings API. Use run history for completed assignments and contact support for payout questions.`

Primary action:

- `Open run history`

Secondary action:

- `Contact support`

Do not:

- Show `GHS 0` as if it is the driver total.
- Show estimated earnings.
- Show a blank finance card without explanation.
- Use delivery quote amounts as driver earnings.
- Promise payout dates without payout records.

## Screen Information Architecture
Top-to-bottom structure:

1. Backend authority strip.
2. Earnings summary card.
3. Weekly payout rail.
4. Filter and period controls.
5. Assignment earning ledger.
6. Adjustment and dispute panel.
7. Empty, unavailable, or error state.
8. Support and policy footer.

When backend is unavailable, structure becomes:

1. Backend authority strip.
2. Unavailable explanation.
3. Run history and support actions.
4. Policy footer.

## Layout Anatomy
### 1. Backend Authority Strip
Purpose:

- Show whether earnings data is live, saved, stale, or not connected.

States:

- `live`: `Live earnings ledger`
- `refreshing`: `Refreshing earnings`
- `saved`: `Showing saved earnings`
- `stale`: `Earnings may be outdated`
- `unavailable`: `Earnings API not connected`
- `error`: `Could not load earnings`

### 2. Earnings Summary Card
Purpose:

- Give one clear net payable view.

Content when data exists:

- Net payable.
- Gross earned.
- Adjustments.
- Pending payout.
- Paid this period.
- Last updated.

Rules:

- Make `netPayable` the largest number.
- Put adjustment amounts close to the gross-to-net explanation.
- Do not animate money totals.
- Always show currency label `GHS`.

### 3. Weekly Payout Rail
Purpose:

- Explain where the driver is in the weekly finance cycle.

Steps:

1. `Earned`
2. `Reviewed`
3. `Scheduled`
4. `Paid`

Pilot copy:

- `Pilot payouts are processed weekly by finance. This screen shows records and status, not payout execution.`

Do not show:

- Bank account details.
- Cash-out button.
- Instant payout option.
- Finance admin controls.

### 4. Filter And Period Controls
Purpose:

- Help drivers inspect a week or payout state.

Controls:

- Current week.
- Previous week.
- Custom period when backend supports it.
- Status filter.
- Search by tracking code or station ID.

Default:

- Current weekly cycle.

Unsupported state:

- Hide period controls if no earnings API exists.

### 5. Assignment Earning Ledger
Row content:

- Route pair.
- Tracking code.
- Earning reason.
- Net amount.
- Payout status.
- Earned date.
- Adjustment indicator if present.

Row actions:

- `View run`
- `Ask about this earning`

Rows must not show:

- Receiver phone.
- Full address.
- Package scan code.
- Provider settlement reference.

### 6. Adjustment And Dispute Panel
Purpose:

- Make adjustments visible without making them look like hidden deductions.

Content:

- Adjustment reason.
- Amount.
- Finance status.
- Linked support issue when available.

Rules:

- Original earning remains visible.
- Adjustment appears as separate row or expansion.
- Withheld and disputed states need support CTA.

### 7. Empty, Unavailable, Or Error State
Empty with API:

- `No earnings for this period`
- `Completed assignments with earning records will appear here.`

Unavailable without API:

- `Earnings ledger not connected yet`
- `Use run history for completed assignments and support for payout questions.`

Error:

- `Could not load earnings`
- `Try again. Saved earnings may still be shown.`

### 8. Support And Policy Footer
Purpose:

- Reduce confusion and route issues.

Content:

- `Earnings are based on completed inter-station assignments.`
- `Weekly payout processing is handled by finance during the pilot.`
- `If an earning is missing, open support with the related delivery.`

## Interaction Flow
### Flow 1: Backend Not Available
1. Driver opens earnings route.
2. App sees no configured earnings endpoint.
3. Screen renders unavailable state.
4. Driver can open run history or support.
5. No amount is shown.

### Flow 2: Earnings Available
1. Driver opens earnings route.
2. Screen loads current weekly earning summary.
3. Summary card shows net payable, gross, adjustments, and pending payout.
4. Ledger lists earning events.
5. Driver opens a row to inspect delivery context.

### Flow 3: Weekly Payout Pending
1. Finance has not processed weekly payout yet.
2. Summary shows pending amount.
3. Payout rail highlights `Reviewed` or `Scheduled`.
4. Copy says payout is pending finance processing.
5. No cash-out control appears.

### Flow 4: Paid
1. Payout status returns `paid`.
2. Summary shows paid amount.
3. Ledger rows show paid status.
4. Screen may show paid date if driver-safe.
5. Driver can open support if paid amount is disputed.

### Flow 5: Adjustment
1. Finance adds an adjustment record.
2. Summary shows gross, adjustment, and net.
3. Ledger row shows adjustment indicator.
4. Row detail shows reason and support path.
5. Original earning remains visible.

### Flow 6: Offline Saved Earnings
1. Driver opens screen offline after previous successful load.
2. Screen shows saved earnings with cache age.
3. It does not mark pending payouts as paid.
4. Search and filters work locally.
5. Refresh resumes when online.

## Data Loading
Initial available state:

- Load saved sanitized earnings cache if present.
- Call future `GET /v1/driver/earnings`.
- Render authority strip based on result.

Initial unavailable state:

- Detect missing endpoint or feature flag.
- Render unavailable state.
- Do not call unrelated finance endpoints.

Refresh:

- Pull to refresh calls future earnings endpoint when enabled.
- Foreground refresh if cache older than `5 minutes`.
- Retry after error.

Cache:

- Cache only driver-safe earning rows.
- Do not cache payout account details.
- Do not cache provider settlement references.
- Do not cache receiver data.

## Visual Design System
### Visual Direction
This screen should feel like a trusted pay statement:

- Serious, high-contrast, finance-safe.
- Strong amount hierarchy.
- Route ledger rows.
- Small status rail.
- Quiet filters.
- No celebratory money graphics.

### Color Tokens
Suggested semantic tokens:

- `--earnings-bg`: warm neutral.
- `--earnings-surface`: clean surface.
- `--earnings-ink`: primary text.
- `--earnings-muted`: secondary text.
- `--earnings-payable`: deep green.
- `--earnings-pending`: amber.
- `--earnings-paid`: green.
- `--earnings-disputed`: red.
- `--earnings-unavailable`: graphite.
- `--earnings-focus`: high-contrast blue.

### Typography
Use:

- Large tabular amount for net payable.
- Clear currency label.
- Strong weekly period label.
- Route pair as ledger row anchor.
- Status labels in readable text.

Avoid:

- Tiny financial fine print.
- Overly decorative money typography.
- Unlabeled color-only finance statuses.

### Spacing
Rules:

- Summary card must breathe.
- Ledger rows need enough vertical spacing for scanability.
- Period controls must be reachable.
- Footer policy copy must not compete with the summary.

### Motion
Motion should be restrained:

- Subtle summary refresh state.
- No number count-up animation.
- No looping money animation.
- Respect reduced motion.

## Component Specification
### `DriverEarningsScreen`
Responsibilities:

- Detect earnings feature availability.
- Load future earnings data when available.
- Render unavailable, loading, ready, saved, error, and empty states.

Test IDs:

- `screen-driver-earnings`
- `driver-earnings-scroll`

### `EarningsAuthorityStrip`
Responsibilities:

- Show live, refreshing, saved, stale, unavailable, or error state.

Test IDs:

- `driver-earnings-authority-strip`
- `driver-earnings-cache-age`

### `EarningsUnavailablePanel`
Responsibilities:

- Explain missing backend support.
- Route to history and support.

Test IDs:

- `driver-earnings-unavailable-panel`
- `driver-earnings-open-history`
- `driver-earnings-open-support`

### `EarningsSummaryCard`
Responsibilities:

- Show net payable and supporting totals.

Test IDs:

- `driver-earnings-summary-card`
- `driver-earnings-net-payable`
- `driver-earnings-gross-total`
- `driver-earnings-adjustment-total`
- `driver-earnings-pending-payout`

### `WeeklyPayoutRail`
Responsibilities:

- Show pilot weekly payout progression.

Test IDs:

- `driver-earnings-payout-rail`
- `driver-earnings-payout-step`

### `EarningsFilterBar`
Responsibilities:

- Period selection, status filters, and search when data exists.

Test IDs:

- `driver-earnings-period-control`
- `driver-earnings-status-filter`
- `driver-earnings-search-input`

### `EarningLedgerList`
Responsibilities:

- Render earning event rows.

Test IDs:

- `driver-earnings-ledger`
- `driver-earnings-ledger-row`

### `EarningLedgerRow`
Responsibilities:

- Show assignment earning row and row actions.

Test IDs:

- `driver-earnings-row-route`
- `driver-earnings-row-amount`
- `driver-earnings-row-status`
- `driver-earnings-row-view-run`
- `driver-earnings-row-support`

### `EarningsPolicyFooter`
Responsibilities:

- Explain pilot payout policy.

Test IDs:

- `driver-earnings-policy-footer`

## Content System
### Header Copy
Available:

- Title: `Earnings`
- Subtitle: `Track completed assignment earnings and weekly payout status.`

Unavailable:

- Title: `Earnings`
- Subtitle: `Earnings records are not connected in this build yet.`

### Summary Labels
Use:

- `Net payable`
- `Gross earned`
- `Adjustments`
- `Pending payout`
- `Paid`
- `Withheld`
- `Disputed`

### Payout Status Labels
Use:

- `Earned`
- `Pending weekly payout`
- `Scheduled`
- `Paid`
- `Withheld`
- `Adjusted`
- `Disputed`
- `Failed`
- `Not available`

### Policy Copy
Primary:

- `Pilot payouts are processed weekly by finance. The app shows earning records and payout status when available.`

Missing data:

- `Earnings data is not connected yet. Completed assignments are still visible in run history.`

No earning:

- `No earnings for this period. Completed assignments with earning records will appear here.`

Dispute:

- `If this earning looks wrong, contact support with the related delivery.`

## State Specifications
### `unavailable`
Trigger:

- Earnings endpoint or feature flag is absent.

UI:

- Unavailable panel.
- Open run history CTA.
- Contact support CTA.
- No amount card.

### `loading`
Trigger:

- Earnings endpoint exists and no cache is loaded yet.

UI:

- Summary skeleton.
- Ledger skeleton.
- Announce loading.

### `ready`
Trigger:

- Earnings response loads successfully.

UI:

- Summary card.
- Weekly rail.
- Filter bar.
- Ledger rows.

### `empty`
Trigger:

- Earnings response exists but no records in selected period.

UI:

- Empty panel.
- Period controls remain visible.

### `saved`
Trigger:

- Offline or refresh failed but sanitized cache exists.

UI:

- Show saved data with cache age.
- No status upgrades from cache.

### `stale`
Trigger:

- Cache older than freshness threshold.

UI:

- Stale strip.
- Refresh CTA.

### `error`
Trigger:

- Earnings endpoint fails and no cache exists.

UI:

- Error panel.
- Retry CTA.
- Support secondary.

### `not_authorized`
Trigger:

- User is not a driver or lacks own earnings visibility.

UI:

- Safe access message.
- No finance data.

### `session_expired`
Trigger:

- Auth required.

UI:

- Sign-in CTA.

## Error Handling
| Error | UI title | UI action |
| --- | --- | --- |
| `AUTH_REQUIRED` | `Sign in again` | Route to sign in |
| `FORBIDDEN_ROLE` | `Driver access required` | Back to role home |
| `NOT_FOUND` | `Earnings record not found` | Back to earnings |
| `VALIDATION_ERROR` | `Earnings filter is invalid` | Reset filters |
| `RATE_LIMITED` | `Too many refreshes` | Wait and retry |
| `UNKNOWN_INTERNAL_ERROR` | `Could not load earnings` | Retry |

Do not expose provider or finance internal errors to drivers.

## Accessibility Requirements
Structure:

- One `h1`.
- Summary amounts have accessible labels with currency.
- Period and status controls have group labels.
- Ledger rows have complete accessible labels.
- Status changes use accessible status messaging.

Amount accessibility:

- Read `GHS 120` as `120 Ghana cedis`.
- Do not rely on color to distinguish paid, pending, disputed, or withheld.

Touch:

- Period controls meet target size.
- Filter chips meet target size.
- Row actions meet target size.

Screen reader:

- Announce refresh completion.
- Announce unavailable state clearly.
- Announce ledger result count after filters.

## Security And Privacy
Do:

- Show only current driver's earning records.
- Keep payout account data out of this screen.
- Keep provider settlement references out of driver UI unless future policy allows.
- Sanitize cached earning rows.
- Route missing earning questions through support.

Do not:

- Show receiver phone.
- Show full receiver address.
- Show package scan code.
- Show payment provider references.
- Collect bank or mobile wallet payout details.
- Log exact search terms.
- Log payout references.

## Analytics
Allowed events:

- `driver_earnings_viewed`
- `driver_earnings_unavailable_viewed`
- `driver_earnings_refresh_started`
- `driver_earnings_refresh_succeeded`
- `driver_earnings_refresh_failed`
- `driver_earnings_period_changed`
- `driver_earnings_status_filter_changed`
- `driver_earnings_row_opened`
- `driver_earnings_support_opened`

Allowed payload:

- `driverUserId`
- `featureAvailable`
- `periodBucket`
- `statusFilter`
- `resultCountBucket`
- `offline`
- `cacheAgeBucket`
- `payoutStatus`

Forbidden payload:

- Exact payout account.
- Provider settlement reference.
- Receiver data.
- Package scan code.
- Raw search term.
- Full earning adjustment note.

## QA Acceptance Criteria
### Backend Unavailable
- Given no earnings endpoint is configured, the screen shows unavailable state.
- Given unavailable state, no amount is shown.
- Given unavailable state, primary CTA opens run history.
- Given unavailable state, secondary CTA opens support.
- Given unavailable state, no unrelated finance endpoint is called.

### Ready State
- Given a valid earnings response, net payable appears as primary amount.
- Gross, adjustments, pending payout, and paid amounts are visible.
- Weekly payout rail appears.
- Ledger rows show route, tracking code, amount, status, and earned date.

### Financial Safety
- The screen never calculates earnings from delivery quote.
- The screen never calculates earnings from distance.
- The screen never calls payout execution.
- The screen never collects payout account details.
- Pending payout is not labeled paid.
- Saved cache does not upgrade status to paid.

### Privacy
- Receiver phone never renders.
- Full receiver address never renders.
- Package scan code never renders.
- Provider settlement reference never renders unless future driver-safe schema explicitly allows it.

### Offline
- Saved earnings show cache age.
- Offline unavailable mode does not invent amounts.
- Refresh resumes when online.

### Accessibility
- Amounts have currency-aware labels.
- Filters and period controls are accessible.
- Result counts are announced.
- Status is not color-only.

## Automated Test Plan
Unit tests:

- `deriveDriverEarningsFeatureState` returns unavailable without endpoint flag.
- `deriveNetPayable` uses backend values and never delivery quote.
- `mapPayoutStatusToLabel` maps all statuses.
- `sanitizeDriverEarningsCacheRow` removes provider and receiver fields.
- `buildDriverEarningsAnalyticsPayload` removes exact search and payout references.

Component tests:

- Renders `screen-driver-earnings`.
- Renders unavailable panel when backend is absent.
- Does not render `GHS 0` in unavailable state.
- Renders summary when data exists.
- Renders weekly payout rail.
- Renders ledger rows.
- Does not render payout execution button.
- Does not render payout account form.
- Does not render receiver phone or full address.

Integration tests:

- Pull to refresh loads earnings endpoint when enabled.
- Refresh failure keeps saved rows visible.
- Period filter updates result count.
- Support action carries safe earning or delivery context.
- Run history action routes to `/(ops)/driver/history`.

End-to-end tests:

- Driver opens earnings before backend exists and sees unavailable state.
- Driver opens earnings with future backend data and sees weekly summary.
- Driver filters disputed earnings and opens support.
- Driver opens earnings offline and sees saved data with cache warning.

## Test IDs
Required test IDs:

- `screen-driver-earnings`
- `driver-earnings-scroll`
- `driver-earnings-authority-strip`
- `driver-earnings-cache-age`
- `driver-earnings-unavailable-panel`
- `driver-earnings-open-history`
- `driver-earnings-open-support`
- `driver-earnings-summary-card`
- `driver-earnings-net-payable`
- `driver-earnings-gross-total`
- `driver-earnings-adjustment-total`
- `driver-earnings-pending-payout`
- `driver-earnings-payout-rail`
- `driver-earnings-payout-step`
- `driver-earnings-period-control`
- `driver-earnings-status-filter`
- `driver-earnings-search-input`
- `driver-earnings-ledger`
- `driver-earnings-ledger-row`
- `driver-earnings-row-route`
- `driver-earnings-row-amount`
- `driver-earnings-row-status`
- `driver-earnings-row-view-run`
- `driver-earnings-row-support`
- `driver-earnings-policy-footer`

## Implementation Notes For Claude Code
Build `DriverEarnings` as a read-only, finance-safe earnings visibility screen. It must render a clear unavailable state until a driver earnings API exists, then use only backend earning event and payout status records for amounts. It must never calculate earnings from delivery quote, distance, package count, or run history; never execute payouts; never collect payout account details; never show receiver phone, full address, scan codes, or provider settlement references; and always separate gross earnings, adjustments, net payable, pending payout, paid, withheld, and disputed states.

## Done Definition
This screen is complete when:

- The route renders behind `screen-driver-earnings`.
- The unavailable state renders when no earnings backend is configured.
- No amount is shown in unavailable state.
- Future ready, empty, saved, stale, error, unauthorized, and session states are specified and testable.
- Summary and ledger use only earning event and payout status records.
- No payout execution, payout account collection, or finance-admin action appears.
- Support and run-history actions work with safe context.
- Cached rows are sanitized.
- Accessibility and analytics tests pass.
- The implementation matches this markdown file and the frontend screen inventory.
