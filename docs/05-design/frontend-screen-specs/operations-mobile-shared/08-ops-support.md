# Ops Support Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID          | `OpsSupport`                                                                                                                                                                                                                                                                   |
| App                | `apps/mobile`                                                                                                                                                                                                                                                                  |
| Route              | `/(ops)/support`                                                                                                                                                                                                                                                               |
| Primary test ID    | `screen-ops-support`                                                                                                                                                                                                                                                           |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                                                                  |
| Build priority     | `P0 Operations Critical`                                                                                                                                                                                                                                                       |
| Backend dependency | `GET /v1/issues`, `POST /v1/issues`, `issueListQuerySchema`, `issueListResponseSchema`, `issueResponseSchema`, `createIssueRequestSchema`, `apiErrorResponseSchema`, role-scoped delivery access, local SQLite queue for offline issue create                                  |
| Related routes     | `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/offline-outbox`, `/(ops)/offline-outbox/:queuedActionId/recover`, role-specific station/driver/courier support routes, future issue detail route |
| Required states    | `loading`, `ready`, `empty`, `filtered_empty`, `refreshing`, `offline_cached`, `stale_cache`, `create_entry`, `queued_offline`, `not_authorized`, `session_expired`, `rate_limited`, `api_error`, `partial_data`                                                               |

## Product Job

This screen is the shared staff support hub for operations mobile. It lets station operators, drivers, final-mile couriers, and authorized admins see relevant issues, understand what needs attention, and open the right issue creation or delivery context.

The screen answers one operational question: `What support issues are open for my work, and what should I open or report next?`

The staff member should be able to:

- See open issues relevant to their role and accessible deliveries.
- Filter issues by status and severity where backend supports it.
- Identify P1 issues quickly.
- Open delivery context for an issue.
- Open issue creation for a delivery.
- Continue from an offline action recovery support handoff.
- See whether issue data is fresh, cached, empty, partial, or unavailable.
- Open offline outbox when issue creation is queued.
- Understand when broader issue queues are admin-only.
- Recover from authorization, session, offline, rate-limit, empty, and backend-error states.

This screen is not:

- A support-admin resolution console.
- An admin issue queue replacement.
- A chat conversation view.
- A refund approval surface.
- A custody override surface.
- A delivery status mutation surface.
- A proof upload or scan screen.
- A place to expose private receiver details.
- A place to escalate or resolve issues unless a future role-specific route explicitly adds that action.

## Audience

Primary audience:

- Station operators checking station-relevant issues before intake, dispatch, receipt, or final-mile handoff.
- Drivers checking issues tied to their accessible deliveries.
- Final-mile couriers checking delivery or proof issues tied to their assignments.
- Ops admins, support admins, finance admins, and super admins using mobile for quick triage.

Secondary audience:

- Claude Code implementing the support route.
- QA validating issue list behavior and permission boundaries.
- Operations leads validating P1 visibility and issue routing.
- Security reviewers checking issue data exposure.
- Accessibility reviewers checking filters, lists, status updates, and empty states.

## User State

The user is likely trying to unblock work. They may not know whether to report a new issue, inspect an existing issue, or return to the delivery workflow.

The user may be:

- Starting a shift and checking active blockers.
- Returning from an issue creation confirmation.
- Opening support after a scan mismatch.
- Opening support after a custody chain warning.
- Opening support after offline action recovery.
- Working offline and checking cached support guidance.
- Seeing a P1 issue affecting station launch readiness.
- Looking for a delivery-specific issue.
- Trying to understand why they cannot see a broader issue queue.

The screen must:

- Be role-aware.
- Keep issue visibility scoped to backend policy.
- Prioritize active and serious issues.
- Make freshness visible.
- Show clear empty states.
- Route new reports through `OpsIssueCreate`.
- Keep issue resolution and escalation out of this shared route unless policy later adds it.
- Avoid exposing restricted issue summaries.
- Avoid implying that issue visibility is complete when offline or partially cached.

## Backend Contract

List endpoint:

- `GET /v1/issues`

List query:

- `deliveryId`: optional.
- `status`: optional issue status.
- `severity`: optional issue severity.
- `limit`: optional positive integer, maximum `100`.

List response:

- `issues`: array of `issueResponseSchema`.

Issue response:

- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description` when present
- `reporter.actorId`
- `reporter.actorRole`
- optional escalation fields
- optional resolution fields
- `createdAt`
- `updatedAt`

Issue statuses:

- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Issue severity:

- `p1`
- `p2`
- `p3`

Issue categories:

- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Creation endpoint:

- `POST /v1/issues`

Creation route:

- This screen links to `OpsIssueCreate` instead of embedding the full form.
- If a quick support entry creates an issue in the future, it must use `createIssueRequestSchema`, `Idempotency-Key`, and the same offline queue rules as `OpsIssueCreate`.

Permission behavior:

- Admin-like roles can list recent issues and filter by status/severity.
- Staff roles list issues only for accessible deliveries.
- Delivery-specific list requires delivery access.
- Backend remains the authority for visibility.

## Role Scope Model

Station operator:

- Sees issues for accessible station deliveries.
- Should prioritize P1, handoff, loss, damage, and blocked station issues.
- Can open delivery detail and issue creation for accessible deliveries.

Driver:

- Sees issues for accessible assigned or recently handled deliveries.
- Should prioritize handoff, delay, loss, and damage issues tied to pickup, transit, or destination receipt.
- Can open delivery detail and issue creation for accessible deliveries.

Final-mile courier:

- Sees issues for accessible final-mile assignments.
- Should prioritize proof, receiver, loss, delay, and handoff issues.
- Can open delivery detail and issue creation for accessible deliveries.

Ops admin:

- Can view broader operational issue list where backend permits.
- Can open delivery detail and issue creation.
- Must not resolve or escalate from this shared mobile route unless routed to admin surface.

Support admin:

- Can view broader support list where backend permits.
- Can open delivery and issue context.
- Escalation/resolution belongs to admin/support tools, not this route unless future screen spec adds it.

Finance admin:

- Can view issues where backend permits, especially payment-related issues.
- Must not perform refund or settlement actions from this route.

Super admin:

- Can view broader issue list where backend permits.
- Must still follow safe routing boundaries.

Unauthorized or unsupported role:

- Show a safe access state.
- Do not show issue summaries.
- Route to role home or sign-in.

## Issue Priority Model

Default sorting:

- P1 open or escalated issues first.
- Open issues before in-review issues.
- In-review before escalated only when severity is equal and product policy wants active staff follow-up first.
- Recent updated time within each group.
- Resolved and closed issues are hidden by default.

Visible priority factors:

- Severity.
- Status.
- Category.
- Updated time.
- Delivery context.
- Role relevance.
- Stale or cached state.

P1 treatment:

- P1 issues receive a clear urgent treatment.
- P1 copy must be serious, not dramatic.
- P1 issue rows should state operational impact.
- P1 list counts should be visible in the first viewport when present.

Resolved/closed treatment:

- Hidden by default.
- Available through filters if backend query supports it.
- Visually subdued.
- Never mixed with active issues without a clear section label.

## Primary Action

Primary action by state:

- `loading`: wait.
- `ready`: open highest-priority issue or report new issue.
- `empty`: report issue or return to role home.
- `filtered_empty`: clear filters.
- `refreshing`: keep list visible.
- `offline_cached`: use cached list, open outbox, or create offline issue when delivery context exists.
- `stale_cache`: refresh or continue with caution.
- `create_entry`: choose delivery before issue creation if none is provided.
- `queued_offline`: open offline outbox.
- `not_authorized`: return to role home or sign in.
- `session_expired`: sign in.
- `rate_limited`: wait and retry.
- `api_error`: retry or open cached guidance.
- `partial_data`: show loaded issues and partial warning.

Secondary actions:

- `Report issue`
- `Open delivery`
- `Open custody chain`
- `Open offline outbox`
- `Refresh`
- `Clear filters`
- `Back to role home`

Blocked behavior:

- Do not show issues outside backend scope.
- Do not show raw receiver contact data.
- Do not let staff resolve, close, or escalate from this shared route.
- Do not show cached list as complete.
- Do not create an issue without delivery context.
- Do not queue a new issue offline without idempotency data.
- Do not expose admin-only filter results to staff roles.

## First Meaningful Value

First meaningful value is reached when staff sees:

- Support title.
- Active issue count.
- P1 count when present.
- Freshness state.
- Filter state.
- Top issue rows or empty state.
- Primary report-issue entry.

The first viewport must answer:

- `Do I have active support issues?`
- `Are any P1?`
- `Is this list fresh?`
- `Can I report a new issue?`
- `What is the most urgent item?`

## Main Tension

Support needs to be accessible from everywhere, but a shared support screen can become unsafe if it becomes a broad admin queue or unscoped chat surface. The design must help field staff act while preserving role boundaries.

The design must balance:

- Fast issue visibility against data minimization.
- P1 prominence against alarm fatigue.
- Filter power against mobile simplicity.
- Offline continuity against stale list risk.
- New issue entry against duplicate issue creation.
- Shared route reuse against role-specific workflows.

## Design Brief

User and job:

- Staff needs to view relevant support issues and start the right support action.

Context of use:

- Mobile, field operations, station or delivery context, intermittent network, high consequence for P1 issues.

Entry point:

- Role home support card.
- Delivery detail support action.
- Custody chain support action.
- Scan mismatch support action.
- Offline outbox storage error.
- Action recovery support action.
- Manual support navigation.

Success state:

- Staff sees relevant active issues, opens the right delivery/issue route, or starts a new issue report.

Primary action:

- Review active issue or report issue.

Navigation model:

- Role-scoped issue hub with summary counts, filters, issue list, and context-aware issue creation entry.

Density:

- Medium. The screen should feel like a triage board compressed for mobile, not a dense admin table.

Visual thesis:

- A calm operations support desk: prioritized, role-safe, fresh-state aware, and built around actionable issue cards.

Restraint rule:

- Avoid chat UI, admin table density, decorative support graphics, and resolution controls.

Product lens:

- Triage clarity, support routing, and permission safety.

System stance:

- Read-mostly staff support hub with safe creation entry.

Interaction thesis:

- Summarize active risk, filter quickly, open context, or report a new issue.

Signature move:

- A top `Support pulse` showing active count, P1 count, freshness, and offline queued support actions.

Activation event:

- User opens an issue row, reports issue, opens delivery, opens custody chain, opens outbox, refreshes, or clears filters.

## Elite Quality Gate

This spec is not closed unless `OpsSupport` gives staff useful support visibility without leaking issue data or becoming an admin console.

Non-negotiable quality requirements:

- First viewport shows active count, P1 count, freshness, and primary action.
- Staff roles only see accessible-delivery issues.
- Admin-like roles can see broader lists only when backend permits.
- P1 issues are visually prominent and accessible.
- Empty state tells user what to do next.
- Cached/offline state cannot look complete or fresh.
- Issue creation routes through `OpsIssueCreate`.
- Escalation, resolution, refund, custody override, and delivery mutation actions are absent.
- Sensitive receiver, scan, proof, payment, and internal reference data are not exposed.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:

- If staff can see issues they should not access, the screen remains open.
- If cached data can look fresh, the screen remains open.
- If P1 issues are buried, the screen remains open.
- If issue creation can happen without delivery context and idempotency, the screen remains open.
- If the screen includes resolve/escalate controls, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [Atlassian incident severity levels](https://www.atlassian.com/incident-management/kpis/severity-levels): severity labels need shared operational meaning and consistent triage behavior.
- [Zendesk ticket statuses](https://support.zendesk.com/hc/en-us/articles/4408843475354-About-ticket-statuses): support queues need clear status distinctions so users understand what is open, pending, solved, or closed.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): refresh, filter, empty, and error changes must be announced without stealing focus.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): filters and row actions need reliable touch targets on mobile.
- [Material Design lists](https://m1.material.io/components/lists.html): issue rows should support quick scanning, hierarchy, and clear primary actions.

Applied decisions:

- Use severity and status as the primary scanning model.
- Put freshness and scope in the first viewport.
- Keep issue cards action-oriented and redacted.
- Route creation to the dedicated issue form.
- Avoid admin-only resolution controls.

## Information Architecture

The screen uses six stacked regions.

Region 1: Support pulse

- Title.
- Active issue count.
- P1 issue count.
- Freshness label.
- Offline queued issue count.

Region 2: Primary actions

- Report issue.
- Open offline outbox when queued issue exists.
- Refresh.

Region 3: Filters

- Status filter.
- Severity filter.
- Category filter when local filter is used.
- Delivery filter when context provides delivery ID.

Region 4: Issue list

- Priority group.
- Active group.
- In review or escalated group.
- Recently resolved group when filter selected.

Region 5: Empty and system states

- Empty.
- Filtered empty.
- Offline cached.
- Stale.
- Partial.
- Error.
- Unauthorized.

Region 6: Support guidance

- What this screen can do.
- What requires admin/support tools.
- Safe contact or support escalation route.

## Support Pulse

Purpose:

- Give staff a one-screen read of support pressure.

Fields:

- Active issues count.
- P1 count.
- Updated time.
- Filter scope.
- Offline queued issue count.

Copy:

- `Support`
- `Active issues`
- `P1 urgent`
- `Updated just now`
- `Showing your accessible deliveries`
- `Showing admin issue list`
- `Offline: cached issues only`
- `Queued reports waiting to sync`

Behavior:

- P1 count appears only when greater than zero.
- Admin scope label appears only for roles with broader access.
- Staff scope label must be explicit.
- Offline queued count links to outbox.

## Filter Model

Backend-supported filters:

- `status`
- `severity`
- `deliveryId`
- `limit`

Local-only filters after fetch:

- `category`
- search by visible tracking code when safe and already available.

Status filter options:

- `Active`
- `Open`
- `In review`
- `Escalated`
- `Resolved`
- `Closed`
- `All visible`

Severity filter options:

- `All`
- `P1`
- `P2`
- `P3`

Category filter options:

- `All`
- `Delay`
- `Damage`
- `Loss`
- `Payment`
- `Handoff`
- `Other`

Filter behavior:

- Default status filter is active issues.
- Default severity filter is all.
- Filters must show selected state in text.
- Clearing filters returns to default active view.
- Filter changes keep focus stable and announce result count.
- If backend filter fails, keep current list and show error.

## Issue Row Specification

Each row must show:

- Severity.
- Status.
- Category.
- Summary.
- Delivery tracking code when safe and available.
- Updated time.
- Created time only in expanded detail.
- Reporter role when safe.
- Primary action.

Primary row actions:

- `Open delivery`
- `View issue` when issue detail route exists.
- `Report related issue`

Secondary row actions:

- `Open custody chain`
- `Open support guidance`

Row must not show:

- Receiver phone.
- Receiver precise address.
- Raw scan code.
- Raw proof reference.
- Payment provider reference.
- Raw internal actor IDs.
- Description text if role policy restricts it.

Row grouping:

- `P1 urgent`
- `Open`
- `In review`
- `Escalated`
- `Resolved`
- `Closed`

Row ordering:

- P1 before P2 before P3.
- Active before resolved.
- Newer updated time before older within same severity/status group.

## Issue Detail Preview

Until a dedicated issue detail route exists, the shared support screen may show a compact preview sheet.

Preview includes:

- Issue ID.
- Status.
- Severity.
- Category.
- Summary.
- Description only when role allows and length is safe.
- Reporter role.
- Created and updated times.
- Delivery action.

Preview actions:

- `Open delivery`
- `Report related issue`
- `Open custody chain`
- `Close preview`

Preview must not include:

- Resolve.
- Close.
- Escalate.
- Refund.
- Custody override.
- Raw sensitive fields.

When a future route exists:

- Row primary action can route to issue detail.
- This screen remains a queue/hub.

## Report Issue Entry

When delivery context is known:

- Primary action routes directly to `/(ops)/deliveries/:deliveryId/issues/new`.

When delivery context is not known:

- Show `Choose delivery first`.
- Route to role-specific delivery search/list when available.
- Offer guidance: `Open a delivery, then report the issue from that delivery.`

When opened from action recovery:

- Pass redacted context to `OpsIssueCreate`.
- Keep related local action ID only as safe navigation state.

When offline:

- If delivery context is known, route to `OpsIssueCreate` with offline queue path.
- If delivery context is unknown, show guidance and cached accessible delivery list only if available.

Do not:

- Create issue directly from this screen without delivery ID.
- Ask the user to type delivery ID manually unless a validated search route exists.
- Create unscoped general support issues.

## Empty States

`empty`:

- Title: `No active issues`
- Body: `There are no visible active support issues for your current role and scope.`
- Primary action: `Report issue`
- Secondary action: `Refresh`

`filtered_empty`:

- Title: `No issues match these filters`
- Body: `Clear filters or choose another status or severity.`
- Primary action: `Clear filters`

`offline_cached_empty`:

- Title: `No cached issues`
- Body: `Issue data is unavailable offline unless it was opened before. You can still report a delivery issue from a delivery screen when offline queueing is available.`
- Primary action: `Back to role home`

`not_authorized`:

- Title: `Support access unavailable`
- Body: `This account cannot view support issues for this scope.`
- Primary action: `Back to role home`

`api_error`:

- Title: `Could not load support issues`
- Body: `Try again. If this keeps happening, report from the delivery screen or contact support through your supervisor path.`
- Primary action: `Retry`

## Offline And Cache Behavior

Offline read:

- Show cached issue list only if present.
- Label it as cached.
- Show last updated time.
- Disable backend refresh.
- Do not claim list is complete.

Offline create:

- Route through `OpsIssueCreate`.
- Queue only if delivery context and local queue policy allow it.
- Outbox handles sync and recovery.

Stale cache:

- Show stale warning when list is older than product threshold.
- Keep issue rows visible.
- Disable decisions that require fresh issue status if any are later added.

Partial data:

- Show loaded rows.
- Show partial warning.
- Avoid calculating global totals from partial data.

Reconnect:

- Refresh list on foreground if safe.
- Preserve filters.
- Announce updated count.

## Error Mapping

`VALIDATION_ERROR`:

- State: `api_error` for list query.
- Show filter reset guidance if query parameters caused the issue.

`FORBIDDEN`:

- State: `not_authorized`.
- Hide issue rows.

`NOT_FOUND`:

- If delivery-specific filter: show delivery unavailable.
- Otherwise show `api_error`.

`ROUTE_NOT_ENABLED`:

- State: `api_error`.
- Show support route guidance.

`PAYMENT_REQUIRED`:

- State: `api_error`.
- Payment requirement should not normally block support list; route to delivery if returned.

`INVALID_STATUS_TRANSITION`:

- Not expected for list.
- Show `api_error`.

`PHONE_VERIFICATION_REQUIRED`:

- Not handled here.
- Show `api_error` and route to delivery/support guidance.

`PACKAGE_SCAN_MISMATCH`:

- Not expected for list.
- Show `api_error`.

`RATE_LIMITED`:

- State: `rate_limited`.
- Show wait guidance and keep cached list.

`INTERNAL_ERROR`:

- State: `api_error`.
- Show retry and cached list when available.

Network timeout:

- State: `offline_cached` or `api_error` depending connection.
- Keep current list and freshness label.

## State Matrix

`loading`:

- Show support pulse skeleton and row skeleton.
- Do not show empty state until fetch completes.

`ready`:

- Show support pulse, filters, and issue rows.
- Report issue entry visible.

`empty`:

- Show no active issues.
- Report issue remains visible.

`filtered_empty`:

- Show clear filters.
- Preserve filter controls.

`refreshing`:

- Keep current rows visible.
- Show refresh status text.
- Disable duplicate refresh.

`offline_cached`:

- Show cached rows and offline banner.
- Disable online-only refresh.

`stale_cache`:

- Show stale warning.
- Keep rows visible.

`create_entry`:

- Guide user to choose delivery first if no delivery context exists.

`queued_offline`:

- Show queued issue count and outbox link.

`not_authorized`:

- Hide issue content.
- Provide safe exit.

`session_expired`:

- Prompt sign-in.
- Hide issue content.

`rate_limited`:

- Show wait guidance.
- Keep cached or current list visible if safe.

`api_error`:

- Show retry and support guidance.
- Keep cached list if available.

`partial_data`:

- Show loaded subset.
- Warn that totals may be incomplete.

## Copy System

Voice:

- Calm.
- Operational.
- Direct.
- Role-aware.
- No blame.

Primary headlines:

- `Support`
- `Active issues`
- `No active issues`
- `Issue data is cached`
- `Could not load support issues`
- `Choose delivery first`

Button copy:

- `Report issue`
- `Open delivery`
- `Open custody chain`
- `Open offline outbox`
- `Refresh`
- `Clear filters`
- `Back to role home`
- `View issue`
- `Report related issue`

Status copy:

- `Showing your accessible deliveries`
- `Showing admin issue list`
- `Offline: cached issues only`
- `Issue list may be incomplete`
- `Queued reports waiting to sync`
- `Resolved and closed issues are hidden by default`

Avoid:

- Casual chat language.
- Promises that support has already acted.
- Copy that says an issue fixes delivery state.
- Admin-only terms for staff unless necessary.

## Navigation

Entry routes:

- Role home support card.
- Delivery detail support action.
- Custody chain support action.
- Scan support action.
- Offline outbox support action.
- Action recovery support action.
- Manual support route.

Exit routes:

- Role home.
- Delivery detail.
- Custody chain.
- Issue creation.
- Offline outbox.

Back behavior:

- Back returns to source when available.
- If opened directly, back returns to role home.
- Preview sheet back closes preview.
- Filter state persists while screen remains mounted.

Deep link behavior:

- If signed out, route to sign-in.
- If role lacks access, show not authorized.
- If delivery-specific support context is unavailable, show choose-delivery guidance.

## Privacy And Security

Visibility:

- Backend policy controls issue scope.
- Frontend must not merge cached issue records across users.
- Local cache is scoped to authenticated actor and device.
- Cached issue list locks or clears on sign-out according to security policy.

Redaction:

- Hide receiver phone.
- Hide receiver precise address.
- Hide raw package scan code.
- Hide raw proof reference.
- Hide payment provider reference.
- Hide internal actor IDs in normal UI.
- Hide issue description when role policy restricts it.

Analytics:

- Do not send summary text.
- Do not send description text.
- Do not send receiver, scan, proof, or payment secrets.

Admin scope:

- Show explicit scope label for broader admin issue lists.
- Staff users must never see admin-only issue rows through cached data.

## Accessibility Requirements

Screen reader:

- Announce support title, active count, P1 count, freshness, and scope.
- Filter controls announce selected state.
- Issue rows announce severity, status, category, summary, updated time, and primary action.
- Refresh, filter, empty, and error state changes use status messages.

Focus:

- Initial focus lands on title.
- After filter change, focus remains on filter control and result count is announced.
- After refresh success, focus stays stable.
- After error, focus moves to error summary.
- Preview sheet traps focus and returns focus to invoking row.

Touch:

- Filter chips or controls meet target-size requirements.
- Row primary action is not icon-only.
- Refresh and outbox actions are reachable without tiny tap targets.

Visual:

- P1, P2, P3 use labels and contrast, not color alone.
- Status labels are text-visible.
- Large text preserves row hierarchy.
- High contrast mode keeps filters and cards distinguishable.

Motion:

- Respect reduced motion.
- Avoid spinning loaders after cached data is already visible.
- Use text for refresh and error states.

Localization:

- Avoid idioms.
- Use localized date and duration formatting.
- Keep severity labels stable.
- Avoid concatenating labels into fragile strings.

## Analytics And Observability

Required analytics events:

- `ops_support_viewed`
- `ops_support_refreshed`
- `ops_support_filter_changed`
- `ops_support_issue_opened`
- `ops_support_delivery_opened`
- `ops_support_custody_opened`
- `ops_support_report_issue_started`
- `ops_support_outbox_opened`
- `ops_support_empty_viewed`
- `ops_support_error_viewed`
- `ops_support_cached_viewed`

Allowed analytics fields:

- `actorRole`
- `scopeType`
- `activeIssueCount`
- `p1IssueCount`
- `statusFilter`
- `severityFilter`
- `categoryFilter`
- `networkState`
- `isCached`
- `isPartial`
- `errorCode`
- `issueId`
- `deliveryId`

Do not send:

- Issue summary text.
- Issue description text.
- Receiver phone.
- Receiver address.
- Package scan code.
- Proof reference.
- Payment provider reference.
- Internal actor IDs.

Operational metrics:

- Support screen view rate by role.
- Active issue count by role scope.
- P1 visibility rate.
- Filter usage.
- Empty state rate.
- Cached/offline view rate.
- Issue creation entry rate.
- Outbox support queue rate.
- Error rate by backend code.

## Performance Requirements

Initial render:

- Support shell renders immediately.
- Cached support pulse can render before network response if available.
- First issue list fetch uses backend limit default or product-selected limit not above `100`.

List:

- Virtualize if issue count grows.
- Keep row layout stable while refreshing.
- Avoid rendering full descriptions in list rows.
- Filter changes should feel instant for local filters.

Network:

- Debounce rapid filter changes.
- Cancel stale fetches where platform supports it.
- Keep previous list while fetching new filters unless scope changed.

Cache:

- Store only role-safe issue summaries.
- Mark cache timestamp.
- Clear or lock cache on sign-out.

## Test IDs

Primary:

- `screen-ops-support`

Pulse:

- `ops-support-title`
- `ops-support-active-count`
- `ops-support-p1-count`
- `ops-support-freshness`
- `ops-support-scope`
- `ops-support-offline-queued-count`

Actions:

- `ops-support-report-issue`
- `ops-support-refresh`
- `ops-support-open-outbox`
- `ops-support-back-role-home`

Filters:

- `ops-support-status-filter`
- `ops-support-severity-filter`
- `ops-support-category-filter`
- `ops-support-clear-filters`

Rows:

- `ops-support-issue-row`
- `ops-support-issue-severity`
- `ops-support-issue-status`
- `ops-support-issue-category`
- `ops-support-issue-summary`
- `ops-support-issue-updated`
- `ops-support-open-delivery`
- `ops-support-open-custody-chain`
- `ops-support-view-issue`
- `ops-support-report-related`

Preview:

- `ops-support-preview-sheet`
- `ops-support-preview-close`
- `ops-support-preview-open-delivery`
- `ops-support-preview-report-related`

States:

- `ops-support-loading`
- `ops-support-ready`
- `ops-support-empty`
- `ops-support-filtered-empty`
- `ops-support-refreshing`
- `ops-support-offline-cached`
- `ops-support-stale-cache`
- `ops-support-create-entry`
- `ops-support-queued-offline`
- `ops-support-not-authorized`
- `ops-support-session-expired`
- `ops-support-rate-limited`
- `ops-support-api-error`
- `ops-support-partial-data`

## API Integration Notes

Load flow:

- Load authenticated session.
- Determine role scope.
- Read optional delivery context.
- Build `issueListQuerySchema` query.
- Fetch `GET /v1/issues`.
- Parse `issueListResponseSchema`.
- Apply local category filter if selected.
- Render support pulse and issue list.

Refresh flow:

- Preserve filters.
- Fetch latest issue list.
- Parse response.
- Update cache timestamp.
- Announce result count.

Create issue entry:

- If delivery context exists, route to `OpsIssueCreate`.
- If delivery context does not exist, route to role-specific delivery chooser when available.
- Otherwise show choose-delivery guidance.

Issue row action:

- Open delivery detail with `deliveryId`.
- Open custody chain when issue category is `handoff`, `loss`, or `damage`, or when context entry asks for custody review.
- Open issue preview or future issue detail route.

Offline flow:

- Load cached issue list.
- Label as cached.
- Route new issue creation through `OpsIssueCreate` only when delivery context is known.
- Open outbox for queued issue reports.

Error flow:

- Parse `apiErrorResponseSchema`.
- Map error state.
- Keep cached rows if safe.
- Hide rows on authorization error.

## QA Acceptance Criteria

Functional:

- Loading state renders before fetch completes.
- Ready state renders active count and issue rows.
- Empty state renders when no active visible issues exist.
- Filtered empty state renders after filter returns no rows.
- Status filter applies backend query where supported.
- Severity filter applies backend query.
- Category filter applies local filtering.
- P1 count is visible when P1 issues exist.
- Staff users see only accessible-delivery issues.
- Admin-like users show broader scope label when backend permits.
- Issue row opens delivery detail.
- Report issue routes to `OpsIssueCreate` when delivery context exists.
- No delivery context shows choose-delivery guidance.
- Offline cached state labels data as cached.
- Queued offline issue count opens offline outbox.
- Authorization error hides issue rows.

Backend alignment:

- Query respects `issueListQuerySchema`.
- Response parses `issueListResponseSchema`.
- Issue rows use `issueResponseSchema`.
- `limit` never exceeds `100`.
- `FORBIDDEN` maps to not authorized.
- `RATE_LIMITED` maps to rate-limited state.
- `NOT_FOUND` on delivery-specific list maps to delivery unavailable.

Security:

- Receiver phone does not render.
- Receiver precise address does not render.
- Raw scan code does not render.
- Raw proof reference does not render.
- Payment provider reference does not render.
- Summary and description are not sent to analytics.
- Cached issue rows clear or lock on sign-out.

Accessibility:

- Active count is announced.
- P1 count is announced.
- Filters announce selected state.
- Result count changes are announced.
- Issue rows announce severity and status.
- Empty/error states are announced.
- Large text preserves row action access.

Resilience:

- Network timeout keeps cached list when available.
- Refresh failure preserves previous list.
- Filter change failure restores previous valid filter state.
- Offline create entry routes through outbox-safe issue form.
- Partial data warning prevents false completeness.

## Visual Quality Checklist

Before handoff, confirm:

- The screen feels like a serious field support hub, not a casual inbox.
- P1 issues are impossible to miss but not overdramatic.
- Staff scope is explicit.
- Admin scope is explicit.
- Cached and stale states are visually clear.
- Empty state is useful.
- Filters are reachable and not crowded.
- Issue rows are scannable under field pressure.
- No admin-only resolution controls appear.

## Implementation Guardrails For Claude Code

Build this as a role-scoped support hub only when frontend work begins.

Implementation rules:

- Keep issue list query aligned with `issueListQuerySchema`.
- Keep response parsing aligned with `issueListResponseSchema`.
- Keep row rendering aligned with `issueResponseSchema`.
- Keep scope label derived from authenticated role and backend result behavior.
- Keep cached data actor-scoped.
- Keep filter state serializable.
- Keep offline issue creation routed through `OpsIssueCreate`.
- Keep resolution, close, escalation, refund, and custody override actions out of this screen.
- Never render issue rows after `FORBIDDEN`.
- Never treat cached data as complete.

Suggested file ownership:

- Screen route owns query, scope, filters, and navigation.
- Support pulse component owns counts and freshness.
- Filter component owns status, severity, and category filters.
- Issue row component owns compact row display.
- Preview sheet owns read-only issue preview.
- Issue service owns list query.
- Cache service owns role-scoped cached summaries.

Required implementation tests:

- Staff role accessible issue list.
- Admin role broader scope label.
- P1 count rendering.
- Empty state.
- Filtered empty state.
- Status filter query.
- Severity filter query.
- Category local filter.
- Offline cached label.
- Report issue route with delivery context.
- Choose-delivery guidance without context.
- Forbidden hides rows.
- Analytics redaction.
- Cached data clears or locks on sign-out.

## Final Implementation Decisions

Compact issue rows must show status, severity, category, delivery short code, last update time, and one primary action. Rows must not expose restricted support notes in list view.

When no delivery context exists, the delivery chooser must route to the shared ops delivery search or list route. If that route is unavailable for the role, the fallback is the role home queue.

Support list cache is stale after 5 minutes. Linked active-delivery context is stale after 2 minutes and must show a refresh requirement before action.

Category filters must render as horizontal chips on mobile. No hidden default filter is allowed; the active filter must always be visible.

Until a typed issue-detail route exists, issue preview must open as a read-only bottom sheet with role-safe fields and route to create or update actions only when those routes are available.

Platform follow-up decision: add a staff-safe issue detail endpoint and issue-by-delivery summary endpoint so mobile can show richer previews without over-fetching or exposing restricted admin support data.

## Final Handoff Notes

`OpsSupport` is the shared operations support hub. It must make active issues visible, scoped, and actionable without becoming an admin console or leaking sensitive delivery data.

The safest implementation treats issue list data as role-scoped, freshness-sensitive operational context and routes all state-changing support work to dedicated screens.
