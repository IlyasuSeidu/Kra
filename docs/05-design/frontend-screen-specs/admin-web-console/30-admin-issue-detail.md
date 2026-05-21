# Admin Issue Detail Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminIssueDetail` |
| Route | `/admin/issues/:issueId` |
| Test id | `screen-admin-issue-detail` |
| Surface | Admin web console |
| Backend coverage | `get_issue`, `escalate_issue`, `resolve_issue`; supporting reads from `get_delivery`, `get_delivery_timeline`, `list_issues`, and `admin_audit_events` where available |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, `finance_admin`, `super_admin`, or scoped authenticated actor allowed by delivery access |
| Required action role | `ops_admin`, `support_admin`, or `super_admin` depending on capability and transition |
| Required states | `loading`, `ready`, `not_found`, `delivery_missing`, `action_unavailable`, `review`, `confirm_escalation`, `confirm_resolution`, `submitting`, `saved`, `transition_rejected`, `not_authorized`, `session_expired`, `stale_issue`, `api_error` |
| Parent screens | `AdminIssueQueue`, `AdminBlockedDeliveryQueue`, `AdminDeliveryDetail`, `AdminManualCustodyException`, `AdminRefundEvidenceReview`, `AdminLaunchReadinessDetail` |
| Related screens | `AdminIssueQueue`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminRefundEvidenceReview`, `AdminPaymentReconciliation`, `AdminAuditEvents`, `AdminStaffActivityLog`, `SenderSupportThread`, `OpsIssueCreate` |

## Purpose
`AdminIssueDetail` is the controlled admin case screen for one support or operational issue. It lets authorized admins inspect the issue record, understand delivery context, route to specialist evidence, escalate when the case needs higher attention, and move the issue through backend-supported resolution states with required notes.

The screen should answer:
- `What issue is this?`
- `What delivery does it affect?`
- `What is the current status, severity, and category?`
- `Who reported it and when?`
- `Is it already escalated, resolved, or closed?`
- `What actions are allowed for my role and this status?`
- `What exact request will be sent if I escalate or resolve?`
- `Which linked evidence screens should I open before acting?`
- `What changed after a successful action?`

This screen is not a chat thread. It is not a customer reply composer. It must not approve refunds, settle refunds, override custody, upload proof, change payment status, or edit delivery state. It owns only the backend issue actions that are already exposed: escalation and status resolution.

## Backend Reality
Primary read endpoint:
```http
GET /v1/issues/:id
```

Operation:
```text
get_issue
```

Escalation endpoint:
```http
POST /v1/issues/:id/escalate
```

Operation:
```text
escalate_issue
```

Capability:
```text
escalate_case
```

Resolve endpoint:
```http
POST /v1/issues/:id/resolve
```

Operation:
```text
resolve_issue
```

Capabilities accepted by service:
- `manage_issue_thread`
- `resolve_operational_issue`

Route param:
```text
issueId
```

Issue response fields:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description`
- `reporter.actorId`
- `reporter.actorRole`
- `escalatedAt`
- `escalatedByActorId`
- `escalationReasonCode`
- `resolvedAt`
- `resolvedByActorId`
- `closedAt`
- `closedByActorId`
- `resolutionCode`
- `resolutionNote`
- `createdAt`
- `updatedAt`

Supported statuses:
- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Supported severities:
- `p1`
- `p2`
- `p3`

Supported categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

## Escalation Contract
Request:
```json
{
  "reasonCode": "sla_breach",
  "note": "P1 issue has passed the same-day review target."
}
```

Supported reason codes:
- `sender_request`
- `sla_breach`
- `payment_dispute`
- `loss_investigation`
- `fraud_review`
- `management_attention`

Validation:
- `reasonCode` is required.
- `note` is required.
- `note` must be trimmed and `5..400` characters.

Backend behavior:
- Requires admin principal.
- Requires escalation capability.
- Fetches issue.
- Fetches linked delivery.
- Saves status as `escalated`.
- Saves `escalatedAt`.
- Saves `escalatedByActorId`.
- Saves `escalationReasonCode`.
- Updates `updatedAt`.

Frontend guardrails:
- Show escalation only to roles with `escalate_case`.
- Do not offer escalation for `closed`.
- Do not offer escalation for `resolved` unless product explicitly adds reopen behavior later.
- If already `escalated`, show current escalation evidence instead of another primary escalate action.
- Always use a confirmation modal or panel.
- Always include `Idempotency-Key`.

## Resolution Contract
Request for moving to review:
```json
{
  "nextStatus": "in_review",
  "note": "Support has accepted this issue for review."
}
```

Request for resolving:
```json
{
  "nextStatus": "resolved",
  "resolutionCode": "delivery_completed",
  "note": "Delivery was completed and proof was verified."
}
```

Request for closing:
```json
{
  "nextStatus": "closed",
  "resolutionCode": "delivery_completed",
  "note": "Resolved case closed after review."
}
```

Supported `nextStatus` values:
- `in_review`
- `resolved`
- `closed`

Supported resolution codes:
- `station_confirmed`
- `delivery_completed`
- `refund_approved`
- `sender_withdrew`
- `duplicate_report`
- `policy_denied`

Validation:
- `nextStatus` is required.
- `note` is required.
- `note` must be trimmed and `5..400` characters.
- `resolutionCode` is required when `nextStatus` is `resolved` or `closed`.
- `resolutionCode` is optional when `nextStatus` is `in_review`.

Backend transition rules:
- `in_review` is allowed only from `open`.
- `resolved` is rejected if current status is `closed`.
- `closed` is allowed only from `resolved`.

Backend behavior:
- Requires admin principal.
- Requires issue management capability.
- Fetches issue.
- Fetches linked delivery.
- Saves `nextStatus`.
- Saves `resolutionNote`.
- Saves `resolutionCode` when provided.
- If resolving, saves `resolvedAt` and `resolvedByActorId`.
- If closing, saves `closedAt` and `closedByActorId`.
- Updates `updatedAt`.

Frontend guardrails:
- Show `Start review` only when status is `open`.
- Show `Resolve issue` when status is `open`, `in_review`, or `escalated`.
- Show `Close issue` only when status is `resolved`.
- Do not show resolve actions to `finance_admin`.
- Always show review and confirmation before mutation.
- Always include `Idempotency-Key`.
- Refetch issue after success.

## Role And Capability Matrix
| Role | Can read admin detail | Can escalate | Can start review | Can resolve | Can close |
| --- | --- | --- | --- | --- | --- |
| `ops_admin` | Yes | Yes | Yes | Yes | Yes |
| `support_admin` | Yes | Yes | Yes | Yes | Yes |
| `finance_admin` | Yes | No | No | No | No |
| `super_admin` | Yes | Yes | Yes | Yes | Yes |
| `sender` | Only through scoped support screen, not admin shell | No | No | No | No |
| `driver` | Only through scoped operational surfaces | No | No | No | No |
| `station_operator` | Only through scoped operational surfaces | No | No | No | No |
| `final_mile_courier` | Only through scoped operational surfaces | No | No | No | No |

If a role cannot act:
- Show read-only mode.
- Explain which role owns action.
- Keep evidence and route actions visible where access allows.

## Context Reality
The route provides only:
```text
issueId
```

Primary flow:
1. Fetch `get_issue`.
2. If issue returns `deliveryId`, fetch `get_delivery`.
3. If delivery returns, fetch `get_delivery_timeline`.
4. Fetch related issues with `list_issues?deliveryId=:deliveryId&limit=100`.
5. Fetch audit events for issue target if admin access allows.
6. Fetch audit events for delivery target if needed.

If linked delivery is missing:
- Show `delivery_missing`.
- Keep issue record visible.
- Disable delivery-dependent actions.
- Allow escalation or resolution only if the action does not require delivery evidence for the chosen reason and role policy allows it.

If issue is not found:
- Show `not_found`.
- Offer route back to `AdminIssueQueue`.

If issue changes during action:
- Show `stale_issue`.
- Refetch and require the reviewer to re-open the action panel.

## Primary Users
Primary:
- `support_admin` managing support cases.
- `ops_admin` managing operational, custody, delay, loss, or damage cases.
- `super_admin` handling escalated or sensitive cases.

Secondary:
- `finance_admin` reading payment and refund issues before finance action.
- QA validating issue lifecycle.
- Security reviewer validating role boundaries.
- Product owner validating support operations.
- Claude Code implementing the admin console later.

Non-users:
- Public tracking users.
- Sender app users in this admin route.
- Driver or courier issue reporters outside admin shell.

## User Intent Model
Admins open this screen to:
- Understand the issue.
- Check related delivery evidence.
- Decide whether to start review.
- Escalate a case with a reason and note.
- Resolve a case with a resolution code and note.
- Close a resolved case.
- Route to custody, refund, payment, audit, or delivery evidence.
- Verify that an action succeeded.

The page must focus the user on safe case decisions, not loose note-taking.

## UX Thesis
This screen should feel like an incident case file with controlled action zones.

Design priorities:
- Issue facts first.
- Linked delivery evidence second.
- Allowed action controls clearly separated from evidence.
- Every mutation uses review and confirmation.
- Role-disabled actions are explained, not hidden silently.
- Notes are concise, validated, and attached to the correct backend field.
- High-risk categories route to specialist evidence before action.

The screen must avoid:
- Chat-style reply feed.
- Unbounded comments.
- Unclear state transitions.
- Inline one-click resolution.
- Finance actions inside issue management.
- Custody override controls.

## Design Inspiration And Evidence
Use these external standards as design inputs:
- [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/) for validation on escalation and resolution forms.
- [GOV.UK Warning text](https://design-system.service.gov.uk/components/warning-text/) for high-risk transition warnings.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/) for case facts and delivery facts.
- [GOV.UK Notification banner](https://design-system.service.gov.uk/components/notification-banner/) for saved-state and stale-record messages.
- [USWDS Modal](https://designsystem.digital.gov/components/modal/) for confirmation dialogs around high-impact changes.
- [USWDS Table](https://designsystem.digital.gov/components/table/) for related issues and audit event lists.
- [W3C WCAG 2.2 error prevention for legal, financial, data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) for review and confirmation before consequential case updates.
- [W3C WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) for announcing saves, refreshes, and validation outcomes.

Kra-specific sources:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/29-admin-issue-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`

## Information Architecture
Page sections:
- Case header.
- Status and action rail.
- Issue facts.
- Delivery context.
- Evidence routes.
- Action panels.
- Related issues.
- Audit trail.
- Save and error feedback.

Desktop layout:
- Header full width.
- Left column: issue facts and delivery evidence.
- Right rail: status, role permissions, and actions.
- Lower full-width area: related issues and audit.

Tablet layout:
- Header full width.
- Action rail moves below issue facts.
- Evidence route cards become two-column grid.

Mobile web fallback:
- Single column.
- Sticky bottom action bar only when an action is allowed.
- Action forms open in full-screen modal or sheet.

## First Viewport
The first viewport must show:
- Title: `Issue detail`.
- Issue ID.
- Status badge.
- Severity badge.
- Category badge.
- Summary.
- Delivery ID.
- Age.
- Reporter role.
- Last updated.
- Allowed primary action.
- Read-only explanation if no action is allowed.

Example:
```text
Issue detail
ISS-1001
P1 critical
Escalated
Loss
Package missing after destination handoff
Delivery DEL-1001
Updated 20 May 2026, 10:00
```

## Case Header
Header fields:
- Issue ID.
- Summary.
- Status.
- Severity.
- Category.
- Delivery ID.
- Created at.
- Updated at.
- Reporter role.
- Current action availability.

Header actions:
- `Back to issue queue`.
- `Open delivery`.
- `Open audit events`.
- `Refresh`.

Header must not include mutation buttons unless the role and status allow them. Even when allowed, mutation buttons should live in the action rail to separate evidence from action.

## Issue Facts Card
Show:
- Issue ID.
- Delivery ID.
- Status.
- Severity.
- Category.
- Summary.
- Description if present.
- Reporter actor role.
- Reporter actor ID when role policy allows.
- Created at.
- Updated at.
- Escalated at.
- Escalated by.
- Escalation reason.
- Resolved at.
- Resolved by.
- Closed at.
- Closed by.
- Resolution code.
- Resolution note.

Copy actions:
- Copy issue ID.
- Copy delivery ID.

Copy success must announce through live region.

## Delivery Context Card
Fetch delivery detail after issue load.

Show:
- Delivery ID.
- Tracking code.
- Origin station.
- Destination station.
- Current status.
- Payment status.
- Service type.
- Doorstep requested.
- Current custody role.
- Current custody actor.
- Latest event.
- Latest touchpoint.
- Final proof summary if present.

If delivery is missing:
```text
The issue was found, but its linked delivery could not be loaded.
```

Delivery route actions:
- `Open delivery detail`.
- `Open custody chain`.
- `Open blocked delivery queue`.
- `Open refund evidence` for payment or refund issue when payment ID is known from context.
- `Open payment reconciliation` for payment issue when payment ID is known from context.

If payment ID is not known:
```text
Payment ID is not part of this issue record. Open delivery or reconciliation context first.
```

## Timeline Context
Fetch delivery timeline when delivery ID is known.

Show compact evidence:
- Latest delivery event.
- Latest handoff event.
- Latest issue event.
- Final proof event if present.
- Any handoff or proof gap relevant to category.

For category `handoff`:
- Highlight handoff entries.
- Link to `AdminManualCustodyException`.

For category `loss`:
- Highlight last known custody segment.
- Link to custody chain and manual custody exception.

For category `damage`:
- Highlight condition metadata where available.
- Link to custody and delivery detail.

For category `payment`:
- Highlight payment status and finance route actions.

Do not require timeline to load before showing issue facts.

## Action Rail
Action rail states:
- `No action allowed`
- `Can start review`
- `Can escalate`
- `Can resolve`
- `Can close`
- `Already closed`
- `Read-only finance`

Primary actions by status:
- `open`: `Start review`, `Escalate`, `Resolve`
- `in_review`: `Escalate`, `Resolve`
- `escalated`: `Resolve`
- `resolved`: `Close issue`
- `closed`: no mutation action

Role rules:
- `finance_admin`: read-only action rail.
- `ops_admin`: escalation and resolution actions.
- `support_admin`: escalation and resolution actions.
- `super_admin`: escalation and resolution actions.

Action rail must show disabled explanations:
- `Finance can review this issue but cannot change issue status.`
- `Closed issues cannot be changed from this screen.`
- `Only resolved issues can be closed.`
- `Only open issues can move to in review.`

## Start Review Flow
Backend call:
```http
POST /v1/issues/:id/resolve
```

Request:
```json
{
  "nextStatus": "in_review",
  "note": "Support accepted this issue for review."
}
```

Allowed when:
- Current status is `open`.
- Role can manage issue thread or resolve operational issue.

Form fields:
- Note.

Validation:
- Note required.
- Note length `5..400`.
- Note must be specific to review start.

Review step:
- Show issue ID.
- Show current status.
- Show next status.
- Show note.
- Confirm with `Start review`.

Success:
- Status becomes `in_review`.
- Show saved banner.
- Refetch issue.
- Invalidate issue list.

## Escalate Flow
Backend call:
```http
POST /v1/issues/:id/escalate
```

Request:
```json
{
  "reasonCode": "management_attention",
  "note": "P1 loss issue needs leadership review before resolution."
}
```

Allowed when:
- Role can escalate.
- Issue is not `resolved`.
- Issue is not `closed`.
- Issue is not already `escalated`.

Fields:
- Escalation reason.
- Note.

Reason labels:
- `sender_request`: `Sender requested escalation`
- `sla_breach`: `SLA breach`
- `payment_dispute`: `Payment dispute`
- `loss_investigation`: `Loss investigation`
- `fraud_review`: `Fraud review`
- `management_attention`: `Management attention`

Validation:
- Reason required.
- Note required.
- Note length `5..400`.

Review step:
- Show current issue state.
- Show escalation reason.
- Show note.
- Explain that status will become `escalated`.
- Confirm with `Escalate issue`.

Success:
- Status becomes `escalated`.
- `escalatedAt` appears.
- `escalatedByActorId` appears if returned.
- `escalationReasonCode` appears.
- Invalidate issue and issue list.

## Resolve Flow
Backend call:
```http
POST /v1/issues/:id/resolve
```

Request:
```json
{
  "nextStatus": "resolved",
  "resolutionCode": "station_confirmed",
  "note": "Station confirmed package was collected by receiver."
}
```

Allowed when:
- Role can manage issue thread or resolve operational issue.
- Issue status is `open`, `in_review`, or `escalated`.
- Issue status is not `closed`.

Fields:
- Resolution code.
- Note.

Resolution labels:
- `station_confirmed`: `Station confirmed`
- `delivery_completed`: `Delivery completed`
- `refund_approved`: `Refund approved`
- `sender_withdrew`: `Sender withdrew`
- `duplicate_report`: `Duplicate report`
- `policy_denied`: `Policy denied`

Validation:
- Resolution code required.
- Note required.
- Note length `5..400`.

Policy hints:
- `refund_approved` must route finance to refund review or refund evidence if payment context is needed.
- `policy_denied` must be supported by issue notes and evidence.
- `delivery_completed` should link to delivery proof where available.
- `station_confirmed` should link to station or custody evidence where available.

Review step:
- Show issue ID.
- Show current status.
- Show next status `resolved`.
- Show resolution code.
- Show note.
- Confirm with `Resolve issue`.

Success:
- Status becomes `resolved`.
- Resolution code and note are visible.
- `resolvedAt` and `resolvedByActorId` appear if returned.
- Invalidate issue, issue list, and delivery context.

## Close Flow
Backend call:
```http
POST /v1/issues/:id/resolve
```

Request:
```json
{
  "nextStatus": "closed",
  "resolutionCode": "delivery_completed",
  "note": "Resolved case closed after final check."
}
```

Allowed when:
- Role can manage issue thread or resolve operational issue.
- Current status is `resolved`.

Fields:
- Resolution code.
- Note.

Validation:
- Resolution code required even when a previous resolution code exists.
- Note required.
- Note length `5..400`.

Review step:
- Show resolved evidence.
- Show close note.
- Confirm with `Close issue`.

Success:
- Status becomes `closed`.
- `closedAt` and `closedByActorId` appear if returned.
- Issue becomes read-only.
- Invalidate issue and issue list.

## Validation UX
Use an error summary at the top of the action panel when validation fails.

Validation errors:
- `Choose an escalation reason.`
- `Enter a note.`
- `Note must be at least 5 characters.`
- `Note must be 400 characters or fewer.`
- `Choose a resolution code.`
- `This issue changed. Refresh before acting.`

Validation behavior:
- Move focus to error summary.
- Link each error to its field.
- Keep typed values.
- Do not submit while invalid.
- Disable confirm action only after showing clear reason.

## Confirmation UX
Every mutation needs review and confirmation.

Confirmation content:
- Issue ID.
- Current status.
- Next status.
- Reason or resolution code.
- Note.
- Expected effect.
- Idempotency statement.

Escalation warning:
```text
Escalation marks this issue for higher attention and changes its status to escalated.
```

Resolution warning:
```text
Resolution records an outcome on this issue. Review the delivery and evidence before continuing.
```

Close warning:
```text
Closing finalizes a resolved issue. Reopening is not available in the current backend.
```

Buttons:
- Primary: action-specific label.
- Secondary: `Cancel`.

## Success And Failure States
Saved banner:
```text
Issue updated.
```

Escalated success:
```text
Issue escalated. The case now needs higher attention.
```

Resolved success:
```text
Issue resolved. The outcome is now recorded.
```

Closed success:
```text
Issue closed. No further issue actions are available here.
```

Transition rejected:
```text
The issue status changed before this action completed. Refresh and review the current state.
```

Mutation failure:
```text
Kra could not update this issue. Retry after checking the current status.
```

Failure behavior:
- Keep form values.
- Show server error.
- Refetch issue if error indicates invalid transition.
- Do not assume mutation succeeded.

## Evidence Routes
Route cards:
- `Open delivery detail`
- `Open custody chain`
- `Open custody exception`
- `Open refund evidence`
- `Open refund review`
- `Open refund settlement`
- `Open payment reconciliation`
- `Open audit events`
- `Open related issues`

Route rules:
- Custody exception route appears for `handoff`, `loss`, or `damage`.
- Refund routes appear for `payment` or rows whose resolution code is `refund_approved`.
- Payment reconciliation requires known payment ID.
- Refund evidence requires known payment ID.
- Audit events can use `targetType=issue&targetId=:issueId`.
- Delivery detail requires delivery ID.

If payment ID is missing:
- Disable payment and refund routes.
- Explain source gap.

## Related Issues
Fetch `list_issues?deliveryId=:deliveryId&limit=100`.

Show:
- Issue ID.
- Status.
- Severity.
- Category.
- Summary.
- Updated at.
- Current issue marker.

Use cases:
- Detect duplicates.
- Avoid closing one issue while related P1 remains open.
- Find payment/refund companions.
- Find custody or proof companions.

Do not merge issues because backend has no merge endpoint.

## Audit Trail
Fetch audit events when admin access allows.

Targets:
- `issueId`
- `deliveryId`

Show:
- Action.
- Actor.
- Actor role.
- Occurred at.
- Target.
- Metadata summary.

Security:
- Collapse raw metadata.
- Do not expose secrets.
- Do not send audit metadata to analytics.

Audit empty copy:
```text
No audit events were returned for this issue.
```

## Read-Only Boundary
This screen must never include:
- Customer reply composer.
- Free-form internal comments unrelated to a backend mutation.
- Refund approval form.
- Refund settlement form.
- Payment status editor.
- Provider status editor.
- Custody override.
- Proof upload.
- Delivery state mutation.
- Station status override.
- User access controls.
- Bulk issue actions.
- Reopen issue control.
- Issue assignment control unless backend adds assignment.

Allowed mutations:
- `escalate_issue`.
- `resolve_issue`.

Only show allowed mutations when role and status allow them.

## Data Fetching Contract
Initial fetch:
```http
GET /v1/issues/:issueId
```

Supporting reads:
```http
GET /v1/deliveries/:deliveryId
GET /v1/deliveries/:deliveryId/timeline
GET /v1/issues?deliveryId=:deliveryId&limit=100
GET /v1/admin/audit-events?targetType=issue&targetId=:issueId
GET /v1/admin/audit-events?targetType=delivery&targetId=:deliveryId
```

Mutation requests:
```http
POST /v1/issues/:issueId/escalate
POST /v1/issues/:issueId/resolve
```

Do not call:
```http
POST /v1/payments/refund
POST /v1/payments/refund/settle
POST /v1/deliveries/:id/complete
POST /v1/deliveries/:id/dispatch
POST /v1/admin/stations/:id/status
```

After mutation success:
- Refetch `get_issue`.
- Invalidate `list_issues`.
- Invalidate `get_delivery` when resolution may affect delivery context.
- Invalidate audit events if audit writes are visible.

## Idempotency
Both `escalate_issue` and `resolve_issue` are idempotent routes.

Frontend requirements:
- Generate one idempotency key per user-confirmed action.
- Reuse the same key during retry of the same submitted action.
- Generate a new key only when the user changes action payload.
- Do not submit double clicks.
- Disable primary confirm button while submitting.

## Cache And Freshness
Freshness:
- Show cached issue immediately if available.
- Refetch on route entry.
- Mark stale after `60s`.
- Refetch before showing a mutation confirmation if cached record is stale.
- If backend response differs from local issue state, show `stale_issue`.

Stale copy:
```text
This issue changed since you opened it. Review the latest status before acting.
```

## Visual Design System
Art direction:
- Incident case file.
- Evidence-rich, action-controlled.
- Strong status rail.
- Low visual noise.
- Risk color reserved for severity and destructive transitions.

Color tokens:
- `--issue-detail-bg`: `#F4F1EA`
- `--issue-detail-surface`: `#FFFCF5`
- `--issue-detail-raised`: `#FFFFFF`
- `--issue-detail-ink`: `#17130D`
- `--issue-detail-muted`: `#6B6258`
- `--issue-detail-line`: `#DDD4C7`
- `--issue-detail-p1`: `#B3261E`
- `--issue-detail-p2`: `#9A5B00`
- `--issue-detail-p3`: `#245B84`
- `--issue-detail-action`: `#17324D`
- `--issue-detail-success`: `#187A4D`
- `--issue-detail-focus`: `#F6C84C`

Typography:
- Use admin console type system.
- If no committed type system exists yet, use `IBM Plex Sans` for interface and `IBM Plex Mono` for IDs.
- Notes should use readable body text, not code font.
- IDs and timestamps use tabular numerals.

Spacing:
- Page max width: `1440px`.
- Header padding: `32px`.
- Card padding: `24px`.
- Action rail width: `360px`.
- Section gap: `20px`.
- Modal max width: `640px`.

Motion:
- Minimal page load fade.
- No motion on status change except saved banner.
- Respect reduced motion.

## Component Inventory
Required components:
- `AdminIssueDetailPage`
- `IssueDetailHeader`
- `IssueStatusRail`
- `IssueFactsCard`
- `IssueDeliveryContextCard`
- `IssueTimelineContext`
- `IssueEvidenceRoutes`
- `IssueActionRail`
- `StartReviewPanel`
- `EscalateIssueModal`
- `ResolveIssueModal`
- `CloseIssueModal`
- `IssueActionReview`
- `IssueActionErrorSummary`
- `RelatedIssuesTable`
- `IssueAuditTrail`
- `IssueReadOnlyNotice`
- `IssueTransitionRejectedNotice`
- `IssueSavedBanner`

Shared components may be reused:
- Admin shell.
- Summary card.
- Table.
- Modal.
- Status badge.
- Severity badge.
- Error summary.
- Warning banner.
- Copy button.

## Accessibility Requirements
The page must meet WCAG 2.2 AA.

Required:
- Main `h1` is `Issue detail`.
- Issue ID appears near the heading.
- Status, severity, and category are text.
- Action panels have explicit headings.
- Forms have labels.
- Validation errors show error summary and field-level errors.
- Confirmation modal traps focus while open.
- Modal returns focus to opener on close.
- Save and refresh status use `aria-live="polite"`.
- Failed mutation errors are announced.
- Destructive or finalizing actions have visible warnings.
- Keyboard can complete every allowed action.
- Read-only reason is visible and announced.

Keyboard behavior:
- `Tab` moves through header, facts, routes, action rail, related issues, and audit.
- `Enter` activates buttons and links.
- `Escape` closes modals.
- Focus moves to saved banner only when the action completes and the user needs confirmation.

## Privacy And Security
Do:
- Show only fields returned by authorized APIs.
- Show reporter actor ID only for roles allowed by admin policy.
- Protect issue descriptions from analytics.
- Protect resolution notes from analytics.
- Collapse audit metadata.
- Use idempotency keys for mutations.

Do not:
- Store issue notes in local storage.
- Send note text to analytics.
- Expose receiver phone.
- Expose payer phone.
- Expose provider credentials.
- Render raw storage paths.
- Show action controls to unauthorized roles.
- Submit unsupported payload fields.

## Analytics
Track:
- `admin_issue_detail_viewed`
- `admin_issue_detail_route_clicked`
- `admin_issue_detail_action_opened`
- `admin_issue_detail_action_validation_failed`
- `admin_issue_detail_action_submitted`
- `admin_issue_detail_action_succeeded`
- `admin_issue_detail_action_failed`
- `admin_issue_detail_stale_seen`

Properties:
- `issueStatus`
- `issueSeverity`
- `issueCategory`
- `actionType`
- `role`
- `sourceScreen`
- `deliveryContextLoaded`

Never track:
- Issue ID.
- Delivery ID.
- Reporter actor ID.
- Summary.
- Description.
- Note.
- Resolution note.
- Audit metadata.
- Payment reference.
- Provider reference.

## Performance
Targets:
- Issue facts visible under `1.5s`.
- Supporting delivery evidence loads independently.
- Action rail visible as soon as issue is loaded.
- Mutation confirmation opens under `100ms`.

Optimization:
- Do not block issue facts on delivery timeline.
- Do not fetch audit before issue facts.
- Do not fetch unrelated payment records unless user opens a finance route.
- Keep previous issue visible while refreshing.

## Responsive Requirements
Desktop:
- Two-column case layout with sticky action rail.
- Related issues and audit below.

Tablet:
- Action rail below facts.
- Route cards two columns.

Mobile:
- Single column.
- Action buttons in sticky bottom bar when allowed.
- Modals become full-screen sheets.
- Related issue rows become cards.

## Copy System
Voice:
- Specific.
- Calm.
- Evidence-led.
- Direct.
- No blame language.

Preferred terms:
- `issue`
- `case`
- `status`
- `resolution`
- `escalation`
- `evidence`
- `review`
- `closed`

Avoid:
- `fixed` unless resolution code supports it.
- `guilty`
- `fraud` unless reason code is `fraud_review`.
- `customer was wrong`
- `permanent` except when describing current lack of reopen endpoint.

## Acceptance Criteria
Functional:
- Route renders with `data-testid="screen-admin-issue-detail"`.
- Route reads `issueId` from URL.
- Screen calls `get_issue`.
- Screen shows issue fields from response.
- Screen fetches delivery context when delivery ID is present.
- Screen fetches timeline after delivery ID is present.
- Screen fetches related issues by delivery ID.
- Screen shows audit route and audit events where available.
- Screen shows read-only mode for `finance_admin`.
- Screen shows `Start review` only for open issues and capable roles.
- Screen shows escalation only for capable roles and active non-escalated issues.
- Screen shows resolve only for open, in-review, or escalated issues and capable roles.
- Screen shows close only for resolved issues and capable roles.
- Screen includes review and confirmation for every mutation.
- Screen uses idempotency keys.
- Screen refetches issue after mutation success.
- Screen handles invalid transition errors.
- Screen never calls refund, payment, delivery, custody, proof, station, or user mutations.

Accessibility:
- Forms are labeled.
- Error summary links to fields.
- Modals trap and restore focus.
- Status changes are announced.
- Buttons have specific accessible names.

Security:
- Unauthorized action controls do not render.
- Sensitive notes are not tracked.
- Unsupported fields are not submitted.

## Test Matrix
Unit tests:
- Maps role and status to allowed actions.
- Hides actions for `finance_admin`.
- Allows `Start review` only from `open`.
- Allows `Resolve` from `open`, `in_review`, and `escalated`.
- Allows `Close` only from `resolved`.
- Blocks escalation for `resolved`, `closed`, and already `escalated`.
- Validates escalation reason.
- Validates note length.
- Requires resolution code for `resolved`.
- Requires resolution code for `closed`.
- Builds escalation payload.
- Builds review payload.
- Builds resolution payload.
- Builds close payload.
- Builds route actions from issue and delivery context.

Integration tests:
- Loads issue detail.
- Handles issue not found.
- Handles linked delivery missing.
- Loads delivery and timeline after issue returns.
- Loads related issues.
- Escalates issue with confirmation.
- Starts review with confirmation.
- Resolves issue with confirmation.
- Closes resolved issue with confirmation.
- Handles invalid transition error.
- Handles stale issue before confirmation.
- Keeps form values after server error.

End-to-end tests:
- `e2e-admin-issue-detail-start-review`: Support admin moves open issue to in review.
- `e2e-admin-issue-detail-escalate`: Ops admin escalates an active issue.
- `e2e-admin-issue-detail-resolve`: Support admin resolves an issue with resolution code.
- `e2e-admin-issue-detail-close`: Super admin closes a resolved issue.
- `e2e-admin-issue-detail-finance-read-only`: Finance admin can inspect but cannot mutate.
- `e2e-admin-issue-detail-transition-rejected`: Stale status produces refresh path.

Visual tests:
- Open issue.
- Escalated issue.
- Resolved issue.
- Closed issue.
- Finance read-only.
- Delivery missing.
- Validation errors.
- Confirmation modal.
- Mobile action sheet.
- Reduced-motion mode.

## Implementation Notes For Claude Code
Build this as the issue action owner screen for `/admin/issues/:issueId`.

Use existing hooks where available:
- `useGetIssueQuery`
- `useEscalateIssueMutation`
- `useResolveIssueMutation`
- `useGetDeliveryQuery`
- `useDeliveryTimelineQuery`
- `useListIssuesQuery`
- `useAdminAuditEventsQuery`

If hooks do not exist, create them using existing API client conventions. Do not add new backend endpoints from frontend code.

Recommended files:
- `apps/admin/src/routes/admin-issue-detail.tsx`
- `apps/admin/src/features/issues/AdminIssueDetail.tsx`
- `apps/admin/src/features/issues/issueDetailModel.ts`
- `apps/admin/src/features/issues/issueDetailModel.test.ts`
- `apps/admin/src/features/issues/components/IssueDetailHeader.tsx`
- `apps/admin/src/features/issues/components/IssueActionRail.tsx`
- `apps/admin/src/features/issues/components/EscalateIssueModal.tsx`
- `apps/admin/src/features/issues/components/ResolveIssueModal.tsx`
- `apps/admin/src/features/issues/components/IssueDeliveryContextCard.tsx`
- `apps/admin/src/features/issues/components/RelatedIssuesTable.tsx`

Model helpers:
- `deriveIssueActionAvailability`
- `buildEscalateIssuePayload`
- `buildStartReviewPayload`
- `buildResolveIssuePayload`
- `buildCloseIssuePayload`
- `validateIssueActionForm`
- `buildIssueEvidenceRoutes`
- `mapIssueStatusLabel`
- `mapIssueSeverityLabel`
- `mapIssueCategoryOwner`

Do not couple action panels directly to raw route params. Normalize the loaded issue, role, and related context into an `IssueDetailViewModel`.

## Open Backend Gaps
Current backend supports detail actions, but these gaps should remain visible:
- No issue comments endpoint.
- No assignee field.
- No issue reopen endpoint.
- No issue merge endpoint.
- No issue attachment endpoint.
- No payment ID on issue response.
- No station ID on issue response.
- No explicit SLA field.
- No separate close endpoint.
- No backend guard preventing escalation of already escalated issues, so frontend should avoid presenting that duplicate action.

Frontend must not hide these gaps with local-only state that appears saved.

## Final Instruction To Claude Code
Build `AdminIssueDetail` as the controlled issue action screen. Load `get_issue`, show issue and delivery evidence, route to specialist records, and allow only `escalate_issue` and `resolve_issue` actions where role and current status permit. Every mutation needs validation, review, confirmation, idempotency, success refetch, and clear stale-state handling. Do not add chat replies, notes outside backend mutation payloads, refund execution, payment editing, custody override, proof upload, or unsupported issue lifecycle controls.
