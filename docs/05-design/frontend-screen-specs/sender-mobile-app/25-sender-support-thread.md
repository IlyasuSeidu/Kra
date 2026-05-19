# Sender Support Thread Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderSupportThread` |
| App | `apps/mobile` |
| Route | `/(sender)/support/:issueId` |
| Primary test ID | `screen-sender-support-thread` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_issue`, `list_issues`, `issueResponseSchema`, `issueListResponseSchema`, issue status policy |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/deliveries/:deliveryId/issues/new`, `/(sender)/history`, `/(sender)/notifications` |
| Required states | `loading`, `status_open`, `status_in_review`, `status_escalated`, `status_resolved`, `status_closed`, `empty_context`, `refreshing`, `stale_cache`, `not_found`, `not_authorized`, `offline`, `api_error`, `session_expired` |

## Product Job
This screen lets a sender track one support issue connected to a delivery. In v1, it is a read-only issue status thread, not a live chat. It must show the issue summary, category, urgency, current status, decision or resolution details when available, and safe next actions.

The sender should be able to:
- Understand what issue they reported.
- See the current support status.
- See whether the issue is open, in review, escalated, resolved, or closed.
- See customer-safe resolution information if one exists.
- Refresh the issue state.
- Open the delivery detail.
- Open the delivery timeline.
- Open refund status for payment/refund issues.
- Create a new issue only when they need to report a different concern.
- Recover from offline, stale, missing, unauthorized, and API error states.

This screen is not:
- A chat composer.
- A message reply screen.
- A staff inbox.
- An admin resolution screen.
- A refund approval screen.
- A refund settlement screen.
- A proof upload screen.
- A delivery handoff screen.
- A payment recovery screen.
- A replacement for delivery timeline.

## Audience
Primary audience:
- Authenticated senders who created or opened a delivery support issue.
- Senders checking whether support has reviewed a delay, damage, loss, payment, refund, handoff, proof, or other issue.
- Senders arriving from issue creation success, delivery detail, notifications, refund status, or history.

Secondary audience:
- Claude Code implementing the route.
- QA validating status mapping and privacy.
- Support reviewers checking sender-safe copy.
- Operations reviewers checking custody and handoff context.
- Finance reviewers checking refund wording.

## User State
The sender wants progress, not internal workflow. They may expect chat, but the backend currently exposes issue records, not message replies. The screen must be honest: it can show issue status and resolution, but it must not show a composer that cannot submit.

The sender may be:
- Checking a newly submitted issue.
- Returning after a notification.
- Checking whether a refund or payment issue is resolved.
- Reviewing a denied refund decision.
- Checking an escalated loss or damage issue.
- Reopening app while offline.
- Trying to understand what they should do next.

The screen must:
- Fetch `get_issue` for the route `issueId`.
- Use `issueResponseSchema` as the source of truth.
- Optionally call `list_issues` for related active issues on the same delivery after `deliveryId` is known.
- Display status and resolution in customer-safe language.
- Avoid reply UI until a sender reply endpoint exists.
- Avoid attachment UI until an issue evidence endpoint exists.
- Hide actor IDs, internal escalation metadata, raw notes, and staff identifiers.
- Route follow-up actions to existing screens.

## Primary Action
Primary action by state:
- `status_open`: `Refresh status`
- `status_in_review`: `Refresh status`
- `status_escalated`: `Refresh status`
- `status_resolved`: `Open delivery`
- `status_closed`: `Open delivery`
- `empty_context`: `Open delivery`
- `offline`: `Try again`
- `api_error`: `Try again`
- `not_found`: `Go to history`
- `not_authorized`: `Go back`

Secondary actions:
- `Open delivery`
- `View timeline`
- `Track refund`
- `Report another issue`
- `Go to notifications`
- `Go back`

CTA behavior:
- `Refresh status` refetches `get_issue` and related `list_issues` if used.
- `Open delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `View timeline` routes to `/(sender)/deliveries/:deliveryId/timeline`.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund` when category is `payment` or resolution involves refund.
- `Report another issue` routes to `/(sender)/deliveries/:deliveryId/issues/new`.
- `Go to notifications` routes to `/(sender)/notifications`.
- `Try again` retries the failed read.

Blocked behavior:
- Do not show a text composer.
- Do not show a reply button that implies in-app reply exists.
- Do not upload photos, signatures, or documents.
- Do not call `create_issue` from this route.
- Do not call `resolve_issue`.
- Do not call `escalate_issue`.
- Do not call `refund_payment`.
- Do not call `settle_refund_payment`.
- Do not call handoff, proof, payment, cancellation, or delivery mutation endpoints.
- Do not show raw `resolutionNote` if it contains staff-only details in future.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Issue status.
- Issue summary.
- Issue category.
- Issue urgency.
- Delivery association.
- Last updated time.
- Next action.

The first viewport must answer:
- `What issue is this?`
- `Where is it in support?`
- `Was it resolved or closed?`
- `What can I do next?`

## Main Tension
The route is named support thread, but v1 backend only supports issue status records. The design must feel like a useful support thread while being honest that there is no message/reply endpoint yet.

The design must balance:
- Sender expectation of conversation against read-only backend reality.
- Status clarity against internal workflow complexity.
- Resolution visibility against staff-note privacy.
- Progress reassurance against unsupported SLA claims.
- Follow-up needs against duplicate issue spam.
- Mobile simplicity against delivery, issue, and policy context.

## Design Brief
User and job:
- An authenticated sender wants to check progress on one support issue.

Context of use:
- Mobile, support-sensitive, often after something went wrong with money, custody, proof, or delivery timing.

Entry point:
- SenderIssueCreate success.
- SenderNotifications.
- SenderRefundStatus.
- SenderDeliveryDetail.
- SenderDeliveryHistory.

Success state:
- Sender understands issue status and moves to delivery, timeline, refund status, or another issue route if needed.

Primary action:
- State-driven refresh or delivery context navigation.

Navigation model:
- Read-only issue status surface with links to delivery, timeline, refund, and new issue creation.

Density:
- Medium. The screen needs enough status and resolution detail to reduce support confusion, but no message wall.

Visual thesis:
- A quiet support dossier: issue status at the top, a readable lifecycle rail, then customer-safe details and next actions.

Restraint rule:
- Avoid chat bubbles, empty reply boxes, agent avatars, internal notes, admin controls, and file upload affordances.

Product lens:
- Trust-critical customer support visibility.

System stance:
- Native mobile status detail with timeline-style sections.

Interaction thesis:
- Sender checks status, understands the next step, refreshes when needed, or routes to the right delivery/refund context.

Signature move:
- A support status rail that translates backend issue status into plain progress states without pretending messages exist.

Activation event:
- Sender opens delivery, timeline, refund status, or creates a separate issue from this screen.

## Elite Quality Gate
This spec is not closed unless support state is contract-accurate, customer-safe, and honest about v1 limits.

Non-negotiable quality requirements:
- First viewport shows status, summary, category, urgency, update time, and next action.
- `get_issue` is the primary read.
- `issueResponseSchema` is the source of truth.
- `list_issues` is optional related context only.
- No chat composer appears.
- No reply mutation is called.
- No attachment upload appears.
- Issue statuses map exactly from `issueStatusSchema`.
- Category and severity are translated from backend enum values into customer language.
- Resolution fields are rendered only when present.
- Closed and resolved states are visually distinct.
- Sender-safe support next steps are clear.
- Staff IDs, actor IDs, escalation actor IDs, resolved-by IDs, closed-by IDs, and raw metadata are hidden.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the screen implies a sender can reply in-app, it remains open.
- If it displays internal actor IDs, it remains open.
- If it shows raw status enum values as the main copy, it remains open.
- If it calls admin issue mutations, it remains open.
- If it hides resolution status from the sender when present, it remains open.
- If it does not explain read-only limitations, it remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, code, or visual assets to copy:

- [Zendesk customer portal ticket statuses](https://support.zendesk.com/hc/en-us/articles/4408825864858--What-are-the-customer-portal-ticket-statuses): supports making request states understandable from the end-user perspective.
- [Zendesk ticket lifecycle and statuses](https://support.zendesk.com/hc/en-us/articles/8263915942938-About-the-ticket-lifecycle-and-ticket-statuses): supports showing lifecycle stages and keeping requesters updated as state changes.
- [Intercom support best practices](https://www.intercom.com/help/en/articles/198-our-best-practice-guide-to-customer-support): supports customer support as clear ongoing conversation, while this v1 screen must avoid unsupported reply UI.
- [W3C WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh, success, and status-update announcements.
- Kra `packages/shared/src/contracts/api.ts`: defines issue status, category, severity, and response fields.
- Kra `services/api/src/issues.ts`: defines access control and issue response behavior.
- Kra `docs/03-business/refund-and-dispute-rules.md`: defines refund, dispute, loss, damage, and evidence context.

## Backend Contract Alignment
Primary read:
- Operation: `get_issue`.
- Method: `GET`.
- Path: `/v1/issues/:id`.
- Response schema: `issueResponseSchema`.
- Auth scope: authenticated.
- Access: sender can access only issues tied to deliveries they can access.

Primary response fields:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- optional `description`
- `reporter.actorRole`
- optional `escalatedAt`
- optional `escalationReasonCode`
- optional `resolvedAt`
- optional `closedAt`
- optional `resolutionCode`
- optional `resolutionNote`
- `createdAt`
- `updatedAt`

Optional related read:
- Operation: `list_issues`.
- Query:
- `deliveryId`
- `limit=50`
- Purpose:
- Show other active issues for the same delivery.
- Help user avoid filing duplicates from this screen.
- Not required to render main issue.

Forbidden mutations:
- `create_issue`
- `resolve_issue`
- `escalate_issue`
- `refund_payment`
- `settle_refund_payment`
- `cancel_delivery`
- `initialize_payment`
- `verify_payment`
- `record_handoff`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`

Do not require:
- Message list.
- Agent reply.
- Sender reply endpoint.
- Attachment list.
- SLA timestamp.
- Delivery tracking code.
- Station names.
- Proof assets.
- Payment ID.

## Status Mapping
Backend issue status values:
- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Customer labels:
| Backend status | Customer label | Meaning | Primary action |
| --- | --- | --- | --- |
| `open` | `Issue received` | Support has the issue but review may not have started. | `Refresh status` |
| `in_review` | `Support is reviewing` | Support is actively reviewing the issue record. | `Refresh status` |
| `escalated` | `Escalated for review` | The issue needs higher-priority or specialist review. | `Refresh status` |
| `resolved` | `Resolved` | Support recorded a resolution. | `Open delivery` |
| `closed` | `Closed` | The issue is closed and no longer active. | `Open delivery` |

Status rail:
- `Received`
- `Review`
- `Resolution`
- `Closed`

Rail mapping:
- `open`: Received active, Review inactive, Resolution inactive, Closed inactive.
- `in_review`: Received complete, Review active, Resolution inactive, Closed inactive.
- `escalated`: Received complete, Review active with escalation marker, Resolution inactive, Closed inactive.
- `resolved`: Received complete, Review complete, Resolution active or complete, Closed inactive.
- `closed`: Received complete, Review complete, Resolution complete if `resolutionCode` exists, Closed complete.

Resolution mapping:
| `resolutionCode` | Customer label | Sender-safe meaning |
| --- | --- | --- |
| `station_confirmed` | `Station confirmed` | Station review confirmed the recorded state. |
| `delivery_completed` | `Delivery completed` | Support marked the delivery concern as completed. |
| `refund_approved` | `Refund approved` | Refund review was approved. Track refund for settlement. |
| `sender_withdrew` | `Withdrawn by sender` | Sender no longer needs support on this issue. |
| `duplicate_report` | `Duplicate issue` | Support linked this to an existing issue. |
| `policy_denied` | `Not approved under policy` | Support did not approve the requested outcome under policy. |

Severity mapping:
| Backend severity | Customer label | Visual treatment |
| --- | --- | --- |
| `p1` | `Urgent` | Strong outline and priority marker. |
| `p2` | `Important` | Medium emphasis. |
| `p3` | `Standard` | Neutral emphasis. |

Category mapping:
| Backend category | Customer label |
| --- | --- |
| `delay` | `Delivery delay` |
| `damage` | `Package damage` |
| `loss` | `Possible loss` |
| `payment` | `Payment or refund` |
| `handoff` | `Handoff or proof` |
| `other` | `Other issue` |

## Read-Only Limitation Copy
The screen must set expectations without sounding like an excuse.

Placement:
- Compact info row below the status rail.

Copy:
- `This view shows the support status recorded for your issue. If support needs more information, they will update the issue or contact you through the supported channel.`

For active issues:
- `Refresh to check for new status updates.`

For resolved or closed issues:
- `If this is not the right outcome, report another issue from the delivery page.`

Do not say:
- `Chat is unavailable.`
- `Messaging is not built yet.`
- `Reply disabled.`

## Information Architecture
Top-to-bottom order:
1. Header.
2. Status hero.
3. Issue summary card.
4. Support status rail.
5. Resolution card.
6. Issue details.
7. Related delivery actions.
8. Other active issues.
9. Read-only support notice.
10. Error, offline, or stale banners when applicable.

Header:
- Back control.
- Title: `Support issue`.
- Optional overflow only if app standard pattern exists.

Status hero:
- Customer label.
- Category.
- Severity.
- Last updated.
- Primary action.

Issue summary card:
- Summary.
- Optional description.
- Created date.
- Issue ID only in secondary copy, not dominant.

Status rail:
- Four progress steps.
- Plain labels.
- Current step highlighted.

Resolution card:
- Visible only for resolved or closed states, or when `resolutionCode` exists.
- Shows customer-safe resolution label.
- Shows `resolvedAt` or `closedAt` if present.
- Shows customer-safe resolution note only if product privacy rules allow it.

Issue details:
- Category, urgency, created, updated.
- Escalated date if present.
- Do not show actor IDs.

Related delivery actions:
- Open delivery.
- View timeline.
- Track refund for payment/refund issues.
- Report another issue.

Other active issues:
- Optional list from `list_issues`.
- Only show issue summary, status, category, update time.
- Link to each issue.

## Visual System
Visual thesis:
- A composed support dossier with one strong status card and a calm timeline rail.

Design direction:
- White or warm-neutral surface.
- Hero card with status color edge, not full saturated background.
- Use navy/ink for trust, amber for open/review, red only for urgent unresolved risk, green for resolved.
- Timeline rail must be clear without decoration overload.
- Use separators and spacing instead of nested card stacks.

Color roles:
- `support.surface`
- `support.hero`
- `support.open`
- `support.review`
- `support.escalated`
- `support.resolved`
- `support.closed`
- `support.warning`
- `support.error`
- `support.divider`

Color constraints:
- Do not use color alone for status.
- Every status has label, icon, and text.
- High contrast mode must add outlines.
- Resolved and closed must not look identical.

Typography:
- Status headline largest.
- Summary next strongest.
- Metadata smaller but readable.
- Avoid long all-caps labels.

Spacing:
- Keep hero and rail in the first viewport.
- Use compact rows for metadata.
- Give resolution card enough space when present.

Motion:
- Refresh indicator can be subtle.
- Rail changes can fade in.
- No constant animation.
- Respect reduced motion.

## Layout
Base layout:
- Safe-area aware.
- Scrollable content.
- Sticky footer only when primary action is not visible in first viewport.
- Pull-to-refresh may be supported if app standard exists.

Small phones:
- Status rail becomes vertical.
- Metadata rows stack.
- Actions become full-width.
- Other issues list uses compact rows.

Large phones:
- Hero can show category and urgency side by side.
- Rail can be horizontal if labels fit.

Landscape:
- Keep single column.
- Avoid two-pane chat layout.

Keyboard:
- No keyboard needed on this screen.
- If future reply endpoint exists, keyboard design belongs to a future spec update.

## Component Inventory
Screen components:
- `SenderSupportThreadScreen`
- `SupportThreadHeader`
- `SupportIssueStatusHero`
- `SupportIssueSummaryCard`
- `SupportStatusRail`
- `SupportResolutionCard`
- `SupportIssueDetailList`
- `SupportRelatedDeliveryActions`
- `SupportRelatedIssueList`
- `SupportReadOnlyNotice`
- `SupportThreadSkeleton`
- `SupportThreadErrorPanel`
- `SupportThreadOfflinePanel`
- `SupportThreadStaleBanner`

Shared components allowed:
- App header.
- Status badge.
- Timeline rail.
- Button.
- Inline alert.
- Skeleton.
- Toast.
- Pull-to-refresh wrapper.

Components not allowed:
- Chat composer.
- Reply input.
- Agent avatar row.
- File uploader.
- Admin resolution form.
- Escalation form.
- Refund decision form.
- Proof asset viewer.
- Raw JSON viewer.

## Screen States
### Loading
Trigger:
- `get_issue` pending with no cache.

UI:
- Header visible.
- Hero skeleton.
- Summary skeleton.
- Rail skeleton.
- Action skeleton.

Copy:
- `Loading support issue`
- `Checking the latest support status.`

Accessibility:
- Announce loading once.

### Status Open
Trigger:
- `status=open`.

Hero label:
- `Issue received`

Headline:
- `Support has received this issue.`

Body:
- `Refresh to check whether review has started.`

Primary action:
- `Refresh status`

Secondary actions:
- `Open delivery`
- `View timeline`

Rail:
- Received active.
- Review, Resolution, Closed inactive.

### Status In Review
Trigger:
- `status=in_review`.

Hero label:
- `Support is reviewing`

Headline:
- `This issue is under review.`

Body:
- `Support is reviewing the issue record and delivery context.`

Primary action:
- `Refresh status`

Rail:
- Received complete.
- Review active.
- Resolution and Closed inactive.

### Status Escalated
Trigger:
- `status=escalated`.

Hero label:
- `Escalated for review`

Headline:
- `This issue has been escalated.`

Body:
- `A higher-priority review is needed before the issue can be resolved.`

Primary action:
- `Refresh status`

Show:
- `escalatedAt` if present.
- Customer-safe escalation label if available.

Do not show:
- `escalatedByActorId`.
- Raw escalation metadata.

### Status Resolved
Trigger:
- `status=resolved`.

Hero label:
- `Resolved`

Headline:
- `Support recorded a resolution.`

Body:
- `Review the outcome below and open the delivery record if you need more context.`

Primary action:
- `Open delivery`

Secondary actions:
- `View timeline`
- `Report another issue`

Resolution card:
- Show `resolutionCode` customer label if present.
- Show `resolvedAt` if present.
- Show `resolutionNote` only if sender-safe rendering is approved by product.

### Status Closed
Trigger:
- `status=closed`.

Hero label:
- `Closed`

Headline:
- `This support issue is closed.`

Body:
- `The issue is no longer active. You can still review the delivery or report a separate concern.`

Primary action:
- `Open delivery`

Secondary actions:
- `Report another issue`
- `View timeline`

Resolution card:
- Show `resolutionCode` if present.
- Show `closedAt` if present.

### Empty Context
Trigger:
- Issue loads but optional details are sparse.

UI:
- Still render status, category, urgency, created, updated, delivery link.
- Hide missing optional sections.

Copy:
- `No extra details were added to this issue.`

### Refreshing
Trigger:
- Pull-to-refresh or `Refresh status`.

UI:
- Keep current content.
- Show compact top progress indicator.
- Disable repeated refresh while active.

Success announcement:
- `Support issue updated.`

Failure banner:
- `Could not refresh. Last loaded status is still shown.`

### Stale Cache
Trigger:
- Cached issue state is shown while refresh failed or network is unavailable.

Banner:
- `Showing last loaded issue status.`

Body:
- `Refresh when online to confirm the latest support update.`

### Offline
Trigger:
- Device offline and no usable cached issue.

Headline:
- `Support issue needs internet.`

Body:
- `Connect to the internet to load the latest support status.`

Primary action:
- `Try again`

### API Error
Trigger:
- Non-auth, non-not-found read failure.

Headline:
- `We could not load this support issue.`

Body:
- `Try again. If this continues, open the delivery and report another issue if needed.`

Primary action:
- `Try again`

### Not Found
Trigger:
- `get_issue` returns `NOT_FOUND`.

Headline:
- `Support issue not found.`

Body:
- `This issue may no longer be available, or the link may be wrong.`

Primary action:
- `Go to history`

### Not Authorized
Trigger:
- `FORBIDDEN`.

Headline:
- `You cannot view this support issue.`

Body:
- `Sign in with the sender account tied to the delivery, or contact support.`

Primary action:
- `Go back`

### Session Expired
Trigger:
- Auth token expired or missing.

Headline:
- `Sign in to view support.`

Body:
- `Support issue details are private to the account that can access the delivery.`

Primary action:
- `Sign in`

## Copy System
Voice:
- Calm.
- Direct.
- Supportive without overpromising.
- Specific.
- Operationally honest.

Words to prefer:
- `issue`
- `support`
- `status`
- `review`
- `resolved`
- `closed`
- `delivery record`
- `timeline`
- `refund status`

Words to avoid:
- `chat`
- `message support`
- `reply`
- `agent is typing`
- `live`
- `guaranteed`
- `immediate`
- `compensation approved`
- Raw status enum labels as primary copy.

Primary headlines:
- Open: `Support has received this issue.`
- In review: `This issue is under review.`
- Escalated: `This issue has been escalated.`
- Resolved: `Support recorded a resolution.`
- Closed: `This support issue is closed.`
- Error: `We could not load this support issue.`

Button labels:
- `Refresh status`
- `Open delivery`
- `View timeline`
- `Track refund`
- `Report another issue`
- `Go to notifications`
- `Try again`

Read-only notice:
- `This view shows the support status recorded for your issue.`

Follow-up copy:
- `If this is not the right outcome, report another issue from the delivery page.`
- `For refund outcomes, track settlement from refund status.`
- `For package movement, review the delivery timeline.`

## Data Formatting
Dates:
- Show `createdAt` as `Reported {date}`.
- Show `updatedAt` as `Last updated {date}`.
- Show `resolvedAt` as `Resolved {date}` when present.
- Show `closedAt` as `Closed {date}` when present.
- Use local timezone display.

Issue ID:
- Show only in secondary details or copy action.
- Label: `Issue ID`.
- Do not make it the headline.

Delivery ID:
- Show as delivery association only if tracking code is unavailable.
- Label: `Delivery`.

Category:
- Use customer labels from mapping.

Severity:
- Use customer labels from mapping.

Resolution note:
- If rendered, preserve line breaks but limit vertical expansion with `Show more`.
- Do not render markdown unless a future contract defines formatting.

## Interaction Rules
Refresh:
- Calls `get_issue`.
- Also refreshes `list_issues` if related issue list is mounted.
- Keeps prior content visible.
- Announces success or failure.

Open delivery:
- Uses `deliveryId` from issue response.

View timeline:
- Uses `deliveryId` from issue response.

Track refund:
- Show when:
- `category=payment`.
- Or `resolutionCode=refund_approved`.
- Or `resolutionCode=policy_denied`.
- Routes to refund status for the same delivery.

Report another issue:
- Routes to issue creation for same delivery.
- Does not create a new issue automatically.

Other active issues:
- If user taps another issue row, route to `/(sender)/support/:issueId`.

Back:
- No unsaved state exists, so back is immediate.

## Accessibility
Screen reader:
- Announce loaded status headline.
- Announce refresh progress and result.
- Rail steps have labels and states.
- Resolution card has heading.
- Related action buttons have clear labels.

Rail labels:
- `Received, complete`
- `Review, current`
- `Resolution, not reached`
- `Closed, not reached`

Focus order:
1. Back button.
2. Screen title.
3. Status hero.
4. Primary action.
5. Issue summary.
6. Status rail.
7. Resolution card if present.
8. Details.
9. Related actions.
10. Other issues.
11. Read-only notice.

Dynamic type:
- Hero headline wraps.
- Rail becomes vertical.
- Metadata rows stack.
- Buttons stay readable.

Reduced motion:
- Disable rail animation.
- Use static transitions.
- Keep refresh indicator accessible.

High contrast:
- Add outlines to status chips.
- Do not rely on color.
- Resolution and closed states must remain distinct.

Touch targets:
- Minimum `44x44` points.
- Issue rows full-width tappable.

## Privacy And Security
Hide:
- `reporter.actorId`.
- `escalatedByActorId`.
- `resolvedByActorId`.
- `closedByActorId`.
- Staff IDs.
- Admin role names if not customer-safe.
- Provider references.
- Payment IDs.
- Receiver phone.
- Payer phone.
- Custody actor IDs.
- Proof asset references.
- Raw metadata.

Show:
- Issue status.
- Category label.
- Severity label.
- Summary.
- Optional sender-entered description.
- Customer-safe resolution label.
- Dates.
- Delivery association.

Resolution note policy:
- Render only if product confirms notes are sender-safe.
- Until then, prefer resolution label and date.
- If rendered, do not show internal actor names or IDs.

Analytics must not include:
- Summary.
- Description.
- Resolution note.
- Actor IDs.
- Receiver phone.
- Payment IDs.
- Provider references.

## Analytics
Events:
- `sender_support_thread_viewed`
- `sender_support_thread_loaded`
- `sender_support_thread_refresh_tapped`
- `sender_support_thread_refreshed`
- `sender_support_thread_refresh_failed`
- `sender_support_thread_delivery_tapped`
- `sender_support_thread_timeline_tapped`
- `sender_support_thread_refund_tapped`
- `sender_support_thread_new_issue_tapped`
- `sender_support_thread_related_issue_tapped`
- `sender_support_thread_offline_shown`
- `sender_support_thread_error_shown`

Allowed properties:
- `issueId`
- `deliveryId`
- `status`
- `category`
- `severity`
- `resolutionCode`
- `hasResolution`
- `hasRelatedIssues`
- `isStale`
- `entryPoint`

Forbidden properties:
- `summary`
- `description`
- `resolutionNote`
- `actorId`
- `receiverPhone`
- `paymentId`
- `providerReference`
- `rawMetadata`

Activation:
- Sender refreshes issue successfully.
- Sender opens delivery.
- Sender opens refund status from payment/refund issue.
- Sender reports another issue.

## Error Mapping
Backend error mapping:
| Error | UI title | Primary action | Notes |
| --- | --- | --- | --- |
| `FORBIDDEN` | `You cannot view this support issue.` | `Go back` | Offer delivery/history fallback only if safe. |
| `NOT_FOUND` | `Support issue not found.` | `Go to history` | Do not reveal whether another account owns it. |
| `RATE_LIMITED` | `Too many refresh attempts.` | `Try later` | Preserve current issue if cached. |
| `INTERNAL_ERROR` | `We could not load this support issue.` | `Try again` | Secondary delivery route only if deliveryId is known. |
| `VALIDATION_ERROR` | `We could not load this support issue.` | `Try again` | Usually route param issue. |

Related issue list failure:
- Do not fail the main screen.
- Show compact banner:
- `Related issues could not load.`

Offline with cache:
- Show cached issue and stale banner.

Offline without cache:
- Show offline panel.

## Edge Cases
Issue has no description:
- Hide description section.
- Show summary and status only.

Issue is duplicate:
- If `resolutionCode=duplicate_report`, show:
- `Support marked this as a duplicate issue.`
- Offer related issues list if available.

Refund approved:
- If `resolutionCode=refund_approved`, show `Track refund`.
- Do not show settlement amount unless refund status screen has it.

Policy denied:
- If `resolutionCode=policy_denied`, show customer-safe denial and route to refund status or report another issue.
- Do not accuse sender.

Sender withdrew:
- Show withdrawn outcome.
- Primary action `Open delivery`.

Closed without resolution code:
- Show closed state.
- Do not invent reason.
- Secondary action `Report another issue`.

Escalated without escalation reason:
- Show escalated state only.
- Do not invent reason.

Multiple active related issues:
- Show up to three.
- Link to full support list only when future list route exists.

Issue category payment with delivery payment failed:
- Show payment/refund category.
- Route to refund status only if refund-related signal exists; otherwise route to delivery.

Long summary:
- Already constrained by schema to `160`.
- Wrap cleanly.

Long resolution note:
- Collapse after reasonable height.
- Provide `Show more`.

## Performance
Initial load:
- Fetch `get_issue` first.
- After issue returns, optionally fetch `list_issues` by `deliveryId`.
- Do not block main issue rendering on related issue list.

Refresh:
- Refresh issue and related issues.
- Debounce repeated refresh.
- Keep current content visible.

Caching:
- Cache per `issueId`.
- Invalidate after notification deep link.
- Invalidate after returning from issue creation.
- Clear sensitive cache on sign out.

Rendering:
- No heavy images.
- No chat virtualization needed.
- Related issue list is small.

## Testing Requirements
Unit tests:
- Maps all issue statuses to customer labels.
- Maps all categories to customer labels.
- Maps all severity values to customer labels.
- Maps all known resolution codes to customer labels.
- Shows refund action for payment/refund outcomes.
- Hides refund action for unrelated outcomes.
- Hides actor IDs.
- Does not render composer state.

Component tests:
- `screen-sender-support-thread` renders loading.
- Open status renders received state.
- In-review status renders review state.
- Escalated status renders escalation state.
- Resolved status renders resolution card.
- Closed status renders closed state.
- Related issue list failure does not fail main screen.
- Offline cache renders stale banner.
- No-cache offline renders offline panel.

Integration tests:
- Calls `get_issue` for route issue ID.
- Optionally calls `list_issues` after delivery ID is known.
- Does not call `create_issue`.
- Does not call `resolve_issue`.
- Does not call `escalate_issue`.
- Does not call refund mutation endpoints.
- Handles `FORBIDDEN`.
- Handles `NOT_FOUND`.
- Handles `RATE_LIMITED`.

E2E tests:
- Sender opens newly submitted issue and sees open state.
- Sender opens resolved refund issue and sees refund route.
- Sender opens escalated loss issue and sees escalation state.
- Sender refreshes issue status successfully.
- Sender opens another issue from related issues.
- Sender cannot reply in-app because no composer exists.

Accessibility tests:
- Status is announced.
- Rail has accessible state.
- Refresh updates are announced.
- Large text does not clip.
- High contrast distinguishes statuses.
- Reduced motion disables rail animation.

## Test IDs
Screen:
- `screen-sender-support-thread`

Hero:
- `support-thread-hero`
- `support-thread-status-label`
- `support-thread-headline`
- `support-thread-category`
- `support-thread-severity`
- `support-thread-updated-at`

Summary:
- `support-thread-summary-card`
- `support-thread-summary`
- `support-thread-description`
- `support-thread-created-at`
- `support-thread-issue-id`

Rail:
- `support-thread-status-rail`
- `support-rail-received`
- `support-rail-review`
- `support-rail-resolution`
- `support-rail-closed`

Resolution:
- `support-thread-resolution-card`
- `support-thread-resolution-code`
- `support-thread-resolution-date`
- `support-thread-resolution-note`

Actions:
- `support-thread-refresh-action`
- `support-thread-delivery-action`
- `support-thread-timeline-action`
- `support-thread-refund-action`
- `support-thread-new-issue-action`
- `support-thread-notifications-action`

Related:
- `support-thread-related-issues`
- `support-thread-related-issue-row`

States:
- `support-thread-loading-state`
- `support-thread-offline-state`
- `support-thread-stale-banner`
- `support-thread-error-state`
- `support-thread-not-found-state`
- `support-thread-unauthorized-state`

## Implementation Notes For Claude Code
Data hooks:
- Use `useGetIssueQuery(issueId)`.
- Use `useListIssuesQuery({ deliveryId, limit: 50 })` only after `get_issue` returns `deliveryId`.
- Do not add mutation hooks to this screen.

Route params:
- `issueId` required.
- Validate issue ID shape if shared validator exists.

State mapper:
- Build pure function:
- `deriveSenderSupportThreadView(issue, relatedIssues, relatedIssueError)`.

Return:
- `uiState`
- `statusLabel`
- `headline`
- `body`
- `railSteps`
- `resolution`
- `primaryAction`
- `secondaryActions`
- `relatedIssues`

Recommended types:
- `SenderSupportThreadUiState`
- `SupportThreadStatusModel`
- `SupportRailStep`
- `SupportResolutionModel`
- `SupportThreadAction`
- `RelatedIssueListItem`

Do not implement:
- Message composer.
- Reply API.
- Attachment upload.
- Staff inbox.
- Admin status updates.
- Refund approval.
- Issue escalation.
- Issue resolution.

## QA Review Checklist
Contract:
- Uses `issueResponseSchema`.
- Uses `issueListResponseSchema` only for related context.
- Does not require message fields.
- Does not require delivery tracking code.
- Does not call mutation endpoints.

UX:
- First viewport has status, category, urgency, summary, update time, and action.
- Open, review, escalated, resolved, and closed are distinct.
- Read-only limitation is clear without sounding broken.
- Refund-related issue can route to refund status.
- Resolved and closed states show next steps.

Copy:
- No unsupported chat/reply wording.
- No raw enum as primary label.
- No internal actor language.
- No refund settlement promise.

Accessibility:
- Status rail is accessible.
- Refresh updates are announced.
- Dynamic type works.
- High contrast works.
- Reduced motion works.

Privacy:
- No actor IDs.
- No staff IDs.
- No receiver phone.
- No payment IDs.
- No provider references.
- No raw metadata.

## Open Backend Gaps To Track Outside This Screen
These are not blockers for this read-only v1 screen:

- Sender reply endpoint.
- Issue message list.
- Support-agent public replies.
- Evidence upload tied to an issue.
- Sender-safe resolution note classification.
- Issue SLA target fields.
- Support list route for all sender issues.

Current decision:
- Build the screen as read-only issue status.
- Use `get_issue` for the main record.
- Use `list_issues` only for optional related context.
- Route follow-up to existing delivery, timeline, refund, or issue creation screens.

## Build Sequence
1. Add route file for `/(sender)/support/:issueId`.
2. Add typed `get_issue` query hook usage.
3. Add optional related `list_issues` query after `deliveryId` is known.
4. Add issue status mapper.
5. Add category, severity, and resolution label mappers.
6. Add status hero.
7. Add issue summary card.
8. Add status rail.
9. Add resolution card.
10. Add related delivery actions.
11. Add optional related issues list.
12. Add read-only support notice.
13. Add loading, offline, stale, error, not found, unauthorized, and session states.
14. Add analytics with safe properties only.
15. Add accessibility labels and status announcements.
16. Add unit, component, integration, and E2E coverage.
17. Run lint, typecheck, coverage, and critical coverage.

## Final Acceptance Statement
Claude Code should build `SenderSupportThread` as a read-only, sender-safe issue status screen. It must load `get_issue`, map backend status/category/severity/resolution fields into customer language, optionally show related issues from `list_issues`, provide refresh and delivery/refund/timeline/new-issue routes, avoid unsupported chat replies and uploads, never call admin or finance mutations, and hide actor IDs, staff IDs, receiver phone, payment IDs, provider references, raw metadata, and internal-only details.
