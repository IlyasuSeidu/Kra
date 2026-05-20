# AdminOverview Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminOverview` |
| Route | `/admin` |
| Primary test ID | `screen-admin-overview` |
| Surface | Admin web console |
| Backend coverage | `admin_overview` through `GET /v1/admin/overview` |
| Offline critical | No |
| Required role | `ops_admin`, `finance_admin`, `support_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `empty`, `stale`, `refreshing`, `partial_unavailable`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminSignIn`, protected admin shell |
| Related screens | `AdminLaunchReadiness`, `AdminDeliveryExplorer`, `AdminBlockedDeliveryQueue`, `AdminStations`, `AdminFinance`, `AdminPaymentReconciliation`, `AdminIssueQueue`, `AdminWebhookEvents`, `AdminOutboundNotifications` |
| Current implementation mode | Top-level admin command center from overview counts; deeper station, launch, finance, delivery, issue, and webhook work happens in child screens |

## Outcome
`AdminOverview` gives admins a fast, honest operational readout of platform health without pretending the overview endpoint contains every detail.

The screen must answer:
- `Is the network healthy enough to operate right now?`
- `Which delivery states need attention?`
- `Which payment states need attention?`
- `Are there issue-like deliveries that need triage?`
- `Are webhook events unmatched or in manual review?`
- `When was this snapshot generated?`
- `Where should I go next to resolve the most important problem?`

The screen is a command center, not a work queue. It summarizes and routes. It does not replace the deeper admin tools.

## Product Definition
This screen allows admins to:
- View a generated operational snapshot.
- Review delivery status distribution.
- Review payment status distribution.
- See operational alert counts.
- Detect issue-like delivery volume.
- Detect unmatched webhook events.
- Detect manual-review webhook events.
- Navigate to launch readiness.
- Navigate to delivery explorer.
- Navigate to blocked delivery queue.
- Navigate to station management.
- Navigate to finance and reconciliation.
- Navigate to issue queue.
- Refresh the snapshot.
- Understand when a signal is unavailable from `admin_overview`.

It does not allow admins to:
- Mutate delivery state.
- Override station status.
- Approve or settle refunds.
- Resolve issues.
- Reassign deliveries.
- Edit pricing.
- Manage users.
- View receiver phone numbers.
- View payment provider references.
- View raw webhook payloads.
- Claim launch readiness if not fetched from launch endpoint.
- Invent station or launch counts from unrelated data.

## Users
Primary:
- `ops_admin` monitoring delivery state, blocked work, launch risk, and incidents.
- `finance_admin` monitoring payment state, refund risk, and reconciliation signals.
- `support_admin` monitoring issue-like deliveries and unresolved support pressure.
- `super_admin` monitoring cross-functional platform readiness.

Secondary:
- QA validating admin data boundaries.
- Security reviewers validating no sensitive details leak in top-level overview.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- Successful admin sign-in.
- Admin shell logo or home link.
- Protected route fallback.
- Session refresh redirect after reauthentication.
- Browser reload at `/admin`.

The screen must not be reachable:
- Without authenticated admin role validation.
- From sender, driver, station operator, or final-mile courier sessions.
- From public web navigation.

## Real-World Context
Admins use this screen at the start of shift, during launch reviews, after alerts, and while checking whether the network is stable. The page must support scanning across operations, finance, support, and platform signals in under a minute.

The screen must support:
- Large desktop monitors.
- Laptop screens.
- Tablet-width browser layouts.
- Keyboard navigation.
- Screen readers.
- Low-noise incident scanning.
- Fast routing to the screen that owns the problem.

## User Goal
Primary goal:
- Decide what needs attention first.

Secondary goals:
- Confirm system freshness.
- Spot delivery state buildup.
- Spot payment review risk.
- Spot issue-like delivery pressure.
- Spot webhook integrity problems.
- Open the correct deeper admin screen.

## Scope
In scope:
- Overview API fetch.
- Snapshot freshness.
- Delivery counts by status.
- Payment counts by status.
- Operational alert cards.
- Link cards to child admin screens.
- Loading, empty, stale, error, and unauthorized states.
- Accessibility for metrics and charts.
- Security boundaries for top-level metrics.

Out of scope:
- Delivery table.
- Station table.
- Issue table.
- Finance ledger table.
- Launch blocker table.
- Webhook payload viewer.
- Notification dead-letter table.
- Mutations.
- Admin exports.
- User management.

## Design Thesis
This screen should feel like a premium logistics control room: calm, dense, direct, and tuned for operational decision-making rather than visual spectacle.

Visual thesis:
- `network pulse board`: white-stone canvas, graphite typography, status-color sparingly used, precise metric tiles, compact distribution bars, and a strong action rail.

Design principles:
- Put attention signals before broad totals.
- Show counts with clear labels and backend source.
- Use charts only when they improve scanning.
- Every alert card must route to a real owner screen.
- Unknown or unavailable data must be labeled, not hidden.
- No sensitive delivery, receiver, staff, or payment details appear on the overview.

Restraint rule:
- No vanity charts, live maps, animated counters, decorative fleet graphics, or unsupported station/launch numbers.

## Research Inputs
Relevant external references:
- [Material Design cards](https://m3.material.io/components/cards/overview): supports dashboard card grouping, hierarchy, and click targets for summarized content.
- [Material Design progress indicators](https://m3.material.io/components/progress-indicators/overview): supports loading and refresh states without blocking orientation.
- [USWDS data visualizations](https://designsystem.digital.gov/components/data-visualizations/): supports accessible chart presentation, clear labels, and tabular alternatives.
- [Microsoft Fluent data visualization](https://fluent2.microsoft.design/data-visualization): supports color discipline, categorical data, and enterprise dashboard readability.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, error, stale, and loaded states.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard movement through dashboard cards and links.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/01-admin-sign-in.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `docs/13-project/decision-log.md`
- `docs/13-project/implementation-roadmap.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/admin.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Backend Contract
Endpoint:
```http
GET /v1/admin/overview
```

Operation:
```text
admin_overview
```

Auth:
- Authenticated admin only.
- Backend uses `requireAdmin`.
- Response must use no-store caching behavior.

Response:
```json
{
  "generatedAt": "2026-05-20T12:00:00.000Z",
  "deliveryStatusCounts": [
    {
      "status": "received_at_origin",
      "count": 10
    }
  ],
  "paymentStatusCounts": [
    {
      "status": "confirmed",
      "count": 20
    }
  ],
  "operationalAlerts": {
    "openIssueLikeDeliveries": 2,
    "unmatchedWebhookEvents": 1,
    "manualReviewWebhookEvents": 3
  }
}
```

Fields:
- `generatedAt`: backend snapshot time.
- `deliveryStatusCounts`: array of delivery status/count pairs.
- `paymentStatusCounts`: array of payment status/count pairs.
- `operationalAlerts.openIssueLikeDeliveries`: count of deliveries in issue-like states.
- `operationalAlerts.unmatchedWebhookEvents`: unmatched payment webhook count.
- `operationalAlerts.manualReviewWebhookEvents`: manual-review webhook count.

Delivery issue-like backend definition:
- `issue_reported`
- `on_hold`
- `delivery_failed`

Current endpoint limitations:
- No station list.
- No launch readiness status.
- No issue queue rows.
- No delivery rows.
- No finance amounts.
- No reconciliation row list.
- No receiver SMS dead-letter count.
- No trend history.
- No SLA timers.
- No role-specific summary tailoring.

UI implication:
- Do not show station readiness numbers from this endpoint.
- Do not show launch readiness status from this endpoint.
- Do not show finance amounts from this endpoint.
- Use link cards to route to deeper screens that own those details.

## Admin Role Behavior
Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Role-specific emphasis:
- `ops_admin`: delivery and issue-like alerts first.
- `finance_admin`: payment and webhook alerts first.
- `support_admin`: issue-like delivery alerts first.
- `super_admin`: launch and network links first, while still showing all overview metrics.

Rules:
- Role emphasis may reorder cards but must not hide backend overview data.
- Do not show controls the role cannot use.
- Finance admin can see overview counts but should route to finance and reconciliation for details.
- Support admin can see overview counts but should route to issue queue for details.

## Information Architecture
Top-to-bottom order:
- Admin shell header.
- Snapshot status row.
- Attention rail.
- Delivery pipeline section.
- Payment health section.
- Operational alerts section.
- Network links section.
- Empty or unavailable explanations.

Desktop layout:
- 12-column grid.
- Attention rail spans full width.
- Delivery and payment sections sit side by side.
- Operational alerts and navigation cards sit below.

Tablet layout:
- 2-column card grid.
- Charts collapse into stacked bars.

Narrow layout:
- Single-column.
- Attention rail first.
- Tables available below charts for accessibility.

## Admin Shell Header
Content:
- Page title: `Overview`
- Subtitle: `Network snapshot`
- Generated time.
- Refresh action.
- Current admin role badge only if product permits role display.

Rules:
- Header is inside authenticated admin shell.
- Sign-in state must never render this header before auth validation.
- Refresh action must not mutate data.
- Generated time must come from backend.

## Snapshot Status Row
Purpose:
- Make freshness explicit.

Fields:
- `Generated`
- `Last refreshed`
- `Data source`
- `Refresh status`

Copy:
- Fresh: `Generated at 12:00`
- Refreshing: `Refreshing overview`
- Stale: `Showing older overview. Refresh before acting.`
- Error with cached data: `Could not refresh. Showing last loaded overview.`

Rules:
- `generatedAt` is backend snapshot time.
- `last refreshed` is client fetch completion time.
- If backend time is older than freshness threshold, show stale state.
- Default stale threshold: `5 minutes` unless product sets a different value.

## Attention Rail
Purpose:
- Surface the biggest action signals immediately.

Cards:
- `Issue-like deliveries`
- `Manual-review webhooks`
- `Unmatched webhooks`
- `Payment exceptions`

Payment exceptions:
- Derived from payment counts where status is `failed`, `refund_pending`, or other non-confirmed review status.
- Label as derived from payment status counts.

Card states:
- Normal: count is zero.
- Warning: count is greater than zero.
- Critical: open issue-like deliveries or manual-review webhook events exceed product threshold.

Default thresholds:
- Issue-like deliveries greater than `0` is warning.
- Manual-review webhooks greater than `0` is warning.
- Unmatched webhooks greater than `0` is warning.
- Payment failed greater than `0` is warning.

Rules:
- Thresholds must be visible in code constants or config, not buried in styling.
- Cards link to deeper owner screens.
- Cards must not imply automatic resolution.

## Delivery Pipeline Section
Purpose:
- Show distribution of deliveries across lifecycle states.

Data:
- `deliveryStatusCounts`

Display:
- Compact horizontal bar or grouped count grid.
- Table alternative below or accessible to screen readers.

Recommended groups:
- Intake.
- In transit.
- Destination station.
- Final mile.
- Delivered or closed.
- Issue or failed.
- Cancelled.

Rules:
- Grouping is display-only.
- Raw status counts remain available in tooltip, table, or expanded detail.
- Do not merge counts in a way that hides issue states.
- If a status is absent, render zero only if the app has a complete known status list from shared domain.
- Link section to `AdminDeliveryExplorer`.

Primary action:
- `Open deliveries`

Secondary action:
- `View blocked deliveries`

## Payment Health Section
Purpose:
- Let admins see whether payment state needs finance attention.

Data:
- `paymentStatusCounts`

Statuses:
- `pending`
- `confirmed`
- `failed`
- `refund_pending`
- `refunded`

Display:
- Count grid with status labels.
- Small distribution bar.
- Finance action strip.

Rules:
- Do not show payment amounts.
- Do not show provider references.
- Do not show sender payment details.
- Failed and refund-pending counts must route to finance or reconciliation screens.
- Confirmed count is informational.

Primary action:
- `Open finance`

Secondary action:
- `Review reconciliation`

## Operational Alerts Section
Purpose:
- Show backend-computed operational alert counts.

Alerts:
- `openIssueLikeDeliveries`
- `unmatchedWebhookEvents`
- `manualReviewWebhookEvents`

Copy:
- `Issue-like deliveries`
- `Unmatched webhooks`
- `Manual review webhooks`

Rules:
- Each alert must show count and owner route.
- Do not show raw webhook payloads.
- Do not show issue descriptions.
- If count is zero, show calm success state.

Routes:
- Issue-like deliveries -> `/admin/deliveries/blocked` or `/admin/issues` when implemented.
- Unmatched webhooks -> `/admin/webhooks`.
- Manual review webhooks -> `/admin/webhooks?processingStatus=manual_review`.

## Network Links Section
Purpose:
- Provide clear paths to admin surfaces not fully represented in overview data.

Cards:
- `Launch readiness`
- `Stations`
- `Delivery explorer`
- `Issue queue`
- `Finance`
- `Users`

Rules:
- Cards may show availability labels such as `Open`.
- Cards must not show counts that are not in `admin_overview`.
- Launch readiness card must not claim ready or blocked without `admin_launch_readiness` data.
- Station card must not claim station counts without `admin_stations` data.

Copy for unavailable summary:
- `Open launch readiness for current blockers.`
- `Open stations for station status and validation.`

## Empty State
Trigger:
- Backend returns no delivery status counts, no payment status counts, and all alert counts zero.

Copy:
- Title: `No overview activity yet`
- Body: `Delivery, payment, and operational counts will appear here after the backend records activity.`
- Primary action: `Open deliveries`

Rules:
- Empty state must still show generated time.
- Empty state must not hide network link cards.

## Loading State
Behavior:
- Render admin shell.
- Show skeleton cards with real labels.
- Keep navigation available if shell already loaded.
- Announce `Loading admin overview`.

Rules:
- Do not show old values as current during first load.
- If cached prior overview exists, show stale banner and refresh indicator.

## Error States
Session expired:
- Title: `Sign in again`
- Body: `Your admin session expired. Sign in to continue.`
- Action: `Sign in`

Forbidden:
- Title: `Admin access required`
- Body: `This account cannot view the admin overview.`
- Action: `Use another account`

API error:
- Title: `Could not load overview`
- Body: `Refresh the page or open a specific admin tool if needed.`
- Actions: `Retry`, `Go to deliveries`

Partial unavailable:
- Title: `Some signals are unavailable`
- Body: `Overview counts loaded, but related admin routes may need their own refresh.`

Rules:
- Do not expose stack traces.
- Do not show raw request IDs unless the support workflow defines them.
- Preserve admin shell if auth is still valid.

## Refresh Behavior
Manual refresh:
- Re-fetch `GET /v1/admin/overview`.
- Update generated time and client refresh time.
- Keep prior values visible during refresh.
- Disable repeated refresh only while a request is in flight.

Auto refresh:
- Optional.
- If implemented, use conservative interval no shorter than `60 seconds`.
- Pause when tab is hidden.
- Announce changes only when material counts change.

Rules:
- No optimistic updates.
- No client-side mutation.
- No polling faster than backend and ops policy allow.

## Data Transformation Rules
Delivery status:
- Use shared delivery status enum for label mapping.
- Unknown status from backend should render as `Unknown status` and raise telemetry.
- Do not discard unknown status counts.

Payment status:
- Use shared payment status enum for label mapping.
- Unknown payment status should render as `Unknown payment status` and raise telemetry.
- Do not discard unknown payment counts.

Sorting:
- Delivery statuses should follow lifecycle order, not alphabetical order.
- Payment statuses should follow action priority: failed, refund pending, pending, confirmed, refunded.
- Alerts should sort by severity and count.

## Status Label Copy
Delivery labels must use product language from lifecycle docs.

Examples:
- `received_at_origin`: `At origin station`
- `dispatched`: `Dispatched`
- `in_transit`: `In transit`
- `received_at_destination`: `At destination station`
- `awaiting_final_mile_assignment`: `Awaiting final mile`
- `out_for_delivery`: `Out for delivery`
- `delivered`: `Delivered`
- `issue_reported`: `Issue reported`
- `delivery_failed`: `Delivery failed`
- `closed`: `Closed`

Payment labels:
- `pending`: `Pending`
- `confirmed`: `Confirmed`
- `failed`: `Failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

## Visual System
Layout:
- Authenticated admin shell.
- Dense metric grid.
- Strong section headers.
- Minimal borders.
- Clear clickable card affordances.
- Table alternative for every chart-like visualization.

Color:
- Neutral admin canvas.
- Graphite text.
- Green for healthy zero-risk states.
- Amber for review or warning.
- Red for failed or critical states.
- Blue or slate for navigation.

Typography:
- Large, tabular numerals for counts.
- Compact labels.
- Section headings with clear hierarchy.
- No oversized marketing copy.

Charts:
- Prefer horizontal bars or segmented strips.
- Avoid pie charts for lifecycle data.
- Include text labels and values.
- Do not rely on color alone.

Motion:
- Subtle loading shimmer or opacity transition only.
- No animated counters.
- Respect reduced motion.

## Copy System
Voice:
- Operational.
- Concise.
- Action-oriented.
- Honest about source and limits.

Approved phrases:
- `Network snapshot`
- `Generated at`
- `Issue-like deliveries`
- `Manual review webhooks`
- `Open deliveries`
- `Review reconciliation`
- `Open launch readiness`
- `Open stations`
- `Showing older overview`

Avoid:
- `All systems perfect`
- `Launch ready` unless fetched from launch endpoint.
- `Station ready` unless fetched from station or launch endpoint.
- `Revenue`
- `Profit`
- `Live map`
- `Real-time` unless refresh and backend semantics support it.

## Privacy And Redaction
Do not show:
- Receiver names.
- Receiver phones.
- Sender names.
- Staff names.
- Staff IDs.
- Payment provider references.
- Refund references.
- Raw webhook payloads.
- Issue descriptions.
- Proof assets.

Allowed:
- Aggregated delivery status counts.
- Aggregated payment status counts.
- Aggregated alert counts.
- Backend generated time.

## Security
Requirements:
- Protected by admin shell and backend admin route.
- Never render before admin role validation.
- Use bearer token through approved auth provider.
- Treat `FORBIDDEN` as denied state.
- Do not cache response in browser storage unless approved for admin read models.
- Do not expose overview response to non-admin route state.
- Do not log raw response payload if logs could expose future sensitive fields.

## Accessibility
Requirements:
- Root has `screen-admin-overview`.
- Page has one H1: `Overview`.
- Metric cards have descriptive names.
- Counts include labels, not color-only meaning.
- Alert cards expose severity in text.
- Refresh has accessible name and busy state.
- Charts have table alternatives.
- Loaded, refreshing, stale, and error states use status messages.
- Keyboard focus order follows header, attention rail, sections, navigation cards.
- Cards are links or buttons with clear names.
- Layout remains usable at 200% zoom.

Metric accessible name pattern:
```text
Issue-like deliveries, 3, warning, opens blocked delivery queue.
```

## Analytics
Events:
- `admin_overview_viewed`
- `admin_overview_refreshed`
- `admin_overview_refresh_failed`
- `admin_overview_card_clicked`
- `admin_overview_stale_viewed`
- `admin_overview_error_viewed`

Required properties:
- `admin_role`
- `generated_at_age_seconds`
- `issue_like_count`
- `unmatched_webhook_count`
- `manual_review_webhook_count`
- `delivery_status_count_total`
- `payment_status_count_total`
- `target_route`

Forbidden properties:
- Receiver data.
- Sender data.
- Staff identifiers.
- Payment references.
- Raw webhook payload.
- Issue text.

## Performance
Requirements:
- First meaningful shell render within normal admin app budget.
- Overview fetch should not block admin navigation shell.
- Cards render from one API response.
- No heavy chart library required.
- Table alternative generated from same arrays.
- Refresh should not layout-shift major sections.

## Testing Requirements
Unit tests:
- Renders `screen-admin-overview`.
- Shows loading state.
- Maps delivery status labels.
- Maps payment status labels.
- Computes payment exception count from status counts.
- Renders issue-like alert count.
- Renders unmatched webhook alert count.
- Renders manual-review webhook alert count.
- Shows generated time from backend.
- Does not show station readiness count from overview.
- Does not show launch readiness status from overview.
- Does not render sensitive fields.

Integration tests:
- Calls `GET /v1/admin/overview`.
- Handles success response.
- Handles empty response.
- Handles forbidden response.
- Handles session expired response.
- Handles server error.
- Refresh re-fetches overview.
- Alert cards route to owner screens.
- Link cards route to child admin screens.

Accessibility tests:
- H1 exists.
- Metric cards have accessible names.
- Chart data has table alternative.
- Refresh announces busy and completion.
- Error state receives focus only when appropriate.
- Keyboard can reach every card and action.

Policy tests:
- No mutation endpoint is called.
- No admin child endpoint is required for initial overview.
- No PII appears.
- No raw webhook payload appears.
- Launch readiness card does not claim ready or blocked without launch endpoint data.

## Acceptance Criteria
The screen is acceptable when:
- `/admin` renders after admin auth.
- Root test ID is `screen-admin-overview`.
- Data comes from `admin_overview`.
- Snapshot generated time is visible.
- Delivery status counts render.
- Payment status counts render.
- Operational alert counts render.
- Empty, loading, stale, error, forbidden, and session-expired states are covered.
- Child screen links are visible.
- Station and launch signals do not invent unsupported counts.
- No mutation or sensitive detail appears on this page.

## Implementation Notes For Claude Code
Build this as the admin landing route when frontend implementation begins.

Use:
- Admin shell auth guard from `AdminSignIn`.
- `GET /v1/admin/overview`.
- Shared delivery and payment status label maps.
- Accessible cards and table-backed charts.
- Stable links to child admin routes.

Do not use:
- Admin delivery rows on this page.
- Admin station rows on this page.
- Finance amount tables on this page.
- Issue queue rows on this page.
- Webhook payloads on this page.
- Mutations.

Recommended components:
- `AdminOverviewPage`
- `OverviewSnapshotHeader`
- `OverviewAttentionRail`
- `DeliveryPipelineCard`
- `PaymentHealthCard`
- `OperationalAlertsCard`
- `AdminNavigationGrid`
- `OverviewMetricTable`
- `OverviewErrorState`

## Open Backend Work
Potential future improvements:
- Add station summary counts to `admin_overview`.
- Add launch readiness summary to `admin_overview`.
- Add receiver SMS dead-letter count to overview.
- Add trend deltas for delivery and payment counts.
- Add SLA risk counts.
- Add role-tailored overview payload if needed.

Until then:
- Route to child admin screens for those signals.
- Do not fill gaps with client guesses.

## Open Product Work
Decisions to confirm before frontend build:
- Exact stale threshold for admin overview.
- Whether overview auto-refresh is allowed.
- Alert severity thresholds beyond greater-than-zero.
- Role-specific card ordering.
- Whether non-production environment chip appears in admin shell.
- Whether overview should include incident banner from platform status later.

## Quality Bar
This spec is not closed unless the resulting UI:
- Lets an admin identify top operational risk in under one minute.
- Shows source and freshness clearly.
- Uses aggregated data responsibly.
- Routes each problem to an owner screen.
- Avoids unsupported station and launch claims.
- Avoids sensitive details.
- Feels like a serious logistics command center, not a generic analytics page.

## Handoff Checklist
- Screen contract is complete.
- Backend contract is explicit.
- Current endpoint limitations are explicit.
- Delivery, payment, and alert sections are complete.
- Empty, loading, stale, and error states are complete.
- Security and privacy boundaries are complete.
- Accessibility requirements are complete.
- Tests reject unsupported station and launch numbers.

## Final Self-Review
Backend honesty:
- Pass. The spec only uses `admin_overview` for overview data and routes to child screens for unsupported details.

Admin usefulness:
- Pass. The spec prioritizes issue-like deliveries, payment exceptions, webhook review counts, delivery distribution, and owner routes.

UI quality:
- Pass. The spec defines a high-density, low-noise command center with accessible metric cards and chart alternatives.

Implementation readiness:
- Pass. Claude Code can build `AdminOverview` from this file without inventing child-screen data or adding admin mutations.

Closed for implementation:
- This file is full enough for Claude Code to build `AdminOverview` end to end as a production-grade admin command center landing page once frontend UI work begins.
