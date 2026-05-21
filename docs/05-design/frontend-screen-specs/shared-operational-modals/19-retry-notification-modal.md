# Retry Notification Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `RetryNotificationModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screen | `AdminNotificationDetail` |
| Secondary host screens | `AdminOutboundNotifications`, `AdminLaunchReadiness`, `AdminDeliveryDetail`, `AdminIssueDetail` |
| Test id root | `modal-retry-notification` |
| Backend coverage | `admin_outbound_notifications`, `dispatch_due_outbound_notifications` as internal reference only |
| Read operation | `admin_outbound_notifications` |
| Browser mutation operation | None in current backend |
| Internal operation | `dispatch_due_outbound_notifications` |
| Read endpoint | `GET /v1/admin/outbound-notifications` |
| Internal endpoint | `POST /v1/internal/outbound-notifications/dispatch-due` |
| Required read roles | `ops_admin`, `support_admin`, `super_admin` |
| Required retry role | None available in current backend |
| Offline critical | No |
| Data sensitivity | Receiver phone, delivery ID, tracking code, provider error, communication event |
| Required modal states | `closed`, `opening`, `retry_unavailable`, `automatic_retry_pending`, `due_for_internal_retry`, `dead_lettered`, `sent`, `limited_context`, `not_authorized`, `session_expired`, `api_error` |
| Related specs | `AdminOutboundNotifications`, `AdminNotificationDetail`, `AdminDeliveryDetail`, `AdminIssueQueue`, `AdminLaunchReadiness`, `ConfirmDestructiveActionModal` |

## Purpose
`RetryNotificationModal` is the honest recovery-decision modal for outbound receiver SMS records. In the current backend, admins can inspect failed or dead-lettered notification records, but they cannot manually retry a specific notification from the browser.

The modal must answer:
- `Which notification is being considered for retry?`
- `What is its current backend status?`
- `Is automatic retry still scheduled?`
- `Is the record due for the secured internal dispatch task?`
- `Has automatic retry stopped because the record is dead-lettered?`
- `Can this admin trigger a retry today?`
- `What safe next action should the admin take?`
- `Which backend capability is missing for browser manual retry?`

The most important answer is:
```text
Manual retry is not available in the current frontend/backend contract.
```

This modal exists to prevent Claude Code or later frontend work from creating an unsafe retry button that calls an internal task route from the browser.

## Product Job
Operations and support admins need to recover receiver communication failures without making SMS delivery less reliable or less auditable. When a message fails, the admin should know whether to wait for automatic retry, open the delivery, open support handling, or escalate the missing backend capability.

The modal should:
- Show the notification state.
- Explain automatic retry rules.
- Explain dead-letter state.
- Prevent unsupported manual retry.
- Route admins to the next safe operational surface.
- Keep receiver phone and provider error data protected.

## Strategic Role
Receiver SMS is part of delivery trust. Missed pickup readiness, out-for-delivery, failed-attempt, or delivered messages can increase station dwell time and support disputes. But manual retry is also risky: repeated SMS can annoy receivers, expose phone data, bypass internal rate controls, and create audit gaps.

The modal should feel like a communication reliability gate, not a message composer.

## Primary Users
Primary users:
- `ops_admin` investigating receiver SMS recovery.
- `support_admin` handling a receiver communication complaint.
- `super_admin` checking launch readiness or communication incidents.

Secondary users:
- Engineering reviewers validating retry limits.
- Security reviewers validating internal route separation.
- QA validating failed, due, sent, and dead-letter states.
- Product reviewers deciding whether to add browser-safe retry later.
- Claude Code implementing the frontend later.

Non-users:
- `finance_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`
- `receiver`
- public visitor

## User Goals
Admins use the modal to:
- Understand why a retry action is unavailable.
- See whether automatic retry is still scheduled.
- See when the next automatic attempt is due.
- See whether max attempts were reached.
- Open the related delivery.
- Open issue/support handling.
- Return to the outbox.
- Avoid duplicate or unauthorized SMS sends.

They should never believe they retried a message if no backend mutation exists.

## Non-Goals
Do not build these into the modal:
- Active manual retry submit.
- Browser call to internal dispatch route.
- SMS composer.
- Recipient phone edit.
- Full phone reveal.
- Provider credential display.
- Provider raw payload display.
- Provider receipt lookup.
- Delivery state mutation.
- Issue creation directly inside the modal.
- Retry reason submission.
- Retry all.
- Retry selected.
- Cancel retry.
- Delete notification.
- Reset attempt count.
- Change `nextAttemptAt`.
- Change `maxAttempts`.
- Change notification status.

If any of these are needed, backend contracts and audit rules must be added first.

## Hard Backend Reality
Browser-safe read endpoint:
```http
GET /v1/admin/outbound-notifications
```

Browser-safe operation:
```text
admin_outbound_notifications
```

Supported query:
```ts
{
  status?: "pending" | "sent" | "failed" | "dead_letter";
  limit?: number;
}
```

Response record:
```ts
{
  outboundNotificationId: string;
  channel: "sms";
  provider: "hubtel";
  kind: "receiver_delivery_sms";
  status: "pending" | "sent" | "failed" | "dead_letter";
  dedupeKey: string;
  deliveryId: string;
  recipientPhone: string;
  trackingCode: string;
  eventType:
    | "ready_for_pickup"
    | "final_mile_assigned"
    | "out_for_delivery"
    | "failed_attempt"
    | "delivered";
  stationName?: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  lastError?: {
    name: string;
    message: string;
    code?: string;
  };
}
```

Internal dispatch endpoint:
```http
POST /v1/internal/outbound-notifications/dispatch-due
```

Internal operation:
```text
dispatch_due_outbound_notifications
```

Internal route rules:
- Auth scope is `internal`.
- Requires internal task secret.
- Dispatches due `pending` and `failed` records.
- Limit max is `50`.
- Sends through notification gateway.
- Updates status to `sent`, `failed`, or `dead_letter`.
- Is not idempotent.
- Is not an admin browser action.

Retry engine constants:
- `receiverSmsMaxAttempts = 2`
- `receiverSmsRetryDelayMinutes = 30`

State transitions:
- `pending` due and send succeeds -> `sent`
- `pending` due and send fails -> `failed`
- `failed` due and attempt count reaches max -> `dead_letter`
- `failed` due and attempt count remains below max -> `failed` with next attempt in 30 minutes
- `dead_letter` does not retry automatically
- `sent` does not retry

Critical frontend rule:
```text
Never call /v1/internal/outbound-notifications/dispatch-due from browser UI.
```

## External Research Inputs
Only directly relevant references should inform this modal:
- [Hubtel API Documentation](https://docs-developers.hubtel.com/): supports provider context for Ghana SMS delivery, gateway behavior, and error interpretation.
- [Google Cloud Pub/Sub handling failures](https://cloud.google.com/pubsub/docs/handling-failures): supports retry-policy and dead-letter reasoning for failed message delivery.
- [Google Cloud Pub/Sub dead-letter topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics): supports the distinction between retryable failures and dead-letter recovery.
- [GOV.UK Notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports clear status and warning presentation.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports modal use only for focused decisions.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): defines accessible modal behavior.
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible status updates without unexpected focus movement.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports masking and avoiding sensitive value exposure in operational logs.

How the research changes the modal:
- Dead-letter records should be treated as recovery decisions, not automatic retry candidates.
- Retry controls must not bypass safe backend ownership.
- Warnings must be direct and accessible.
- Provider error details must be sanitized.
- Modal focus and status announcements must be predictable.

## Local Source References
Use these local files as implementation authority:
- `packages/shared/src/contracts/api.ts`
- `services/api/src/outbound-notifications.ts`
- `services/api/src/notifications.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/outbound-notifications.test.ts`
- `services/api/src/__tests__/admin.test.ts`
- `services/api/src/__tests__/routes.test.ts`
- `docs/07-api/api-contracts.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/34-admin-outbound-notifications.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/35-admin-notification-detail.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/audit-trail-spec.md`

## Information Architecture
The modal has five layers:
1. Notification identity.
2. Current retry state.
3. Backend retry rule explanation.
4. Manual retry unavailability.
5. Next safe actions.

If the record is already `sent`, the modal becomes an explanatory state and must not offer retry.

## Modal Variants
### `automatic_retry_pending`
Use when:
- status is `failed`
- `nextAttemptAt > now`
- `attemptCount < maxAttempts`

Core message:
```text
Automatic retry is already scheduled.
```

Primary action:
```text
Back to notification detail
```

Secondary action:
```text
Open delivery
```

### `due_for_internal_retry`
Use when:
- status is `pending` or `failed`
- `nextAttemptAt <= now`
- `attemptCount < maxAttempts`

Core message:
```text
This notification is due for the secured internal dispatch task.
```

Explain:
```text
The browser cannot trigger this task. Refresh the outbox after the internal dispatcher runs.
```

### `dead_lettered`
Use when:
- status is `dead_letter`
- `attemptCount >= maxAttempts`

Core message:
```text
Automatic retry has stopped.
```

Explain:
```text
This record reached the configured receiver SMS retry limit. Open the delivery or support queue for manual recovery.
```

### `sent`
Use when:
- status is `sent`

Core message:
```text
This notification was sent.
```

Explain:
```text
Gateway send success does not prove that the receiver read the SMS.
```

### `retry_unavailable`
Use when:
- user opens retry action from any unsupported state.

Core message:
```text
Manual retry is not available in the current backend.
```

## Notification Identity
Show:
- Outbound notification ID.
- Status.
- Channel.
- Provider.
- Kind.
- Delivery ID.
- Tracking code.
- Receiver event type.
- Station name if present.
- Recipient phone masked by default.

Masked phone format:
```text
+233 24 *** 0000
```

Do not reveal full phone by default.

Do not show:
- raw SMS body
- provider credentials
- internal task secret
- provider raw payload
- stack trace

## Retry State Summary
Show a compact status grid:
- `Current status`
- `Attempt count`
- `Max attempts`
- `Next attempt`
- `Last attempt`
- `Sent time`
- `Last error`

Derived labels:
- `attemptCount / maxAttempts`
- `Due now` if retryable and `nextAttemptAt <= now`
- `Scheduled for <time>` if retryable and `nextAttemptAt > now`
- `No more automatic retries` if dead-lettered
- `Not sent yet` if `sentAt` is absent

Last error display:
- show error name
- show error code if present
- show sanitized short message
- truncate message at 160 characters
- show `Provider error hidden` if message appears sensitive

## Backend Rule Panel
Title:
```text
Current retry rules
```

Content:
- Receiver SMS max attempts: `2`.
- Failed SMS retry delay: `30 minutes`.
- Automatic retry is handled by secured internal dispatch.
- Dead-letter records do not retry automatically.
- Browser manual retry is not implemented.

Copy:
```text
Kra retries due pending and failed receiver SMS records through a secured internal dispatcher. Admin users can inspect records and open recovery routes, but cannot manually resend a specific SMS from the browser today.
```

## Manual Retry Unavailable Panel
Title:
```text
Manual retry unavailable
```

Body:
```text
There is no admin retry mutation for outbound notifications in the current backend. The internal dispatch endpoint requires an internal task secret and must not be called from frontend code.
```

Required actions:
- `Open delivery`
- `Open issue queue`
- `Back to outbox`

Optional action:
- `Open backend gap` only if a project issue or roadmap page exists.

Do not render:
- `Retry now`
- `Send again`
- `Force retry`
- `Reset attempts`
- `Retry all`

## Payload Section
Because there is no browser mutation, the modal must not show a retry request payload.

Instead show:
```text
No browser retry payload exists for this action.
```

If product later adds an endpoint, the spec must be updated before implementation.

Future endpoint requirements before activation:
- admin mutation operation ID
- route path
- request schema
- response schema
- capability
- audit event
- idempotency rule
- provider rate-limit rule
- recipient privacy rule
- retry reason field

## Action Routing
Primary safe routes:
- Open delivery detail by `deliveryId`.
- Open issue queue filtered by delivery if supported.
- Return to outbound notifications list.
- Refresh notification context through list query.
- Open launch readiness when dead-letter count blocks launch.

Route rules:
- Delivery route must use delivery ID.
- Issue route must not create an issue silently.
- Outbox route should preserve status filter when possible.
- Refresh should call `GET /v1/admin/outbound-notifications` only.

## Direct Route And Limited Context
If the modal opens without a selected notification record:
- show `limited_context`
- ask user to return to outbox
- do not call unsupported single-record endpoint
- do not scan all pages endlessly

Copy:
```text
This notification record is not available in the current context. Open it from the outbound notifications list.
```

Actions:
- `Open outbound notifications`
- `Close`

## Current Status Logic
Pseudo-code:
```ts
function getRetryModalState(record, now) {
  if (!record) return "limited_context";
  if (record.status === "sent") return "sent";
  if (record.status === "dead_letter") return "dead_lettered";
  if (record.status === "failed" && record.nextAttemptAt > now) {
    return "automatic_retry_pending";
  }
  if (
    (record.status === "pending" || record.status === "failed") &&
    record.nextAttemptAt <= now
  ) {
    return "due_for_internal_retry";
  }
  return "retry_unavailable";
}
```

Do not submit from any state.

## Modal Layout
Desktop:
- Width max `760px`.
- Header fixed.
- Footer fixed.
- Body scrolls.
- Two-column status grid on wide screens.
- Backend rule and unavailable panels full width.

Tablet:
- Width `min(92vw, 760px)`.
- Status grid can be two columns.

Mobile:
- Full-screen sheet.
- Status grid becomes stacked cards.
- Actions stack vertically.
- Recipient and error text wrap.
- No horizontal scroll.

## Header Content
Title variants:
- `Notification retry status`
- `Automatic retry scheduled`
- `Notification due for internal retry`
- `Notification dead-lettered`
- `Notification already sent`

Subtitle:
```text
Review receiver SMS retry state and safe recovery routes.
```

Badges:
- `SMS`
- `Hubtel`
- `Read-only recovery`
- status badge

Do not use a send icon as the primary visual. It suggests an action that is unavailable.

## Visual Design Direction
The modal should feel like an incident-control card:
- Clean admin surface.
- Strong status header.
- Amber for retry pending or due.
- Red for dead-lettered.
- Green for sent.
- Neutral gray for unavailable action.
- Monospace for IDs.
- Clear route actions.

Avoid:
- Message composer styling.
- Marketing campaign visuals.
- Chat bubbles.
- Large phone icons.
- Retry button styling.
- Countdown drama.

## Typography
Use admin console typography.

Fallback:
- Title: 24px, 700.
- Section title: 16px, 700.
- Body: 14px, 400.
- Metadata label: 12px, 600.
- Metadata value: 14px, 500.
- IDs: 13px monospace.
- Warning text: 14px, 600.

Keep provider error messages compact.

## Spacing
Desktop:
- Modal padding: 24px.
- Section gap: 24px.
- Status grid gap: 12px.
- Action gap: 12px.

Mobile:
- Sheet padding: 16px.
- Section gap: 20px.
- Card gap: 12px.
- Button gap: 10px.

The backend rule panel must appear before action buttons.

## Interaction Rules
Open behavior:
- Focus title.
- Background inert.
- Body scroll starts at top.

Close behavior:
- `Escape` closes.
- Backdrop can close because no mutation is in progress.
- Restore focus to launch element.

Refresh behavior:
- If modal has selected record context, `Refresh context` refetches list query.
- If refreshed record not found, show limited context.
- If refreshed status changes, update variant.

Action behavior:
- `Open delivery` navigates to delivery detail.
- `Open issue queue` navigates only if route exists.
- `Back to outbox` closes and returns to list.
- No submit or retry action exists.

## Accessibility Requirements
Dialog:
- Use `role="dialog"` or native dialog.
- Set accessible name from title.
- Set `aria-modal="true"` when using ARIA dialog.
- Tie description to retry-state summary.
- Trap focus.
- Restore focus.

Screen reader:
- Announce status and attempt count.
- Read masked phone as text, not individual symbols if possible.
- Do not rely on color to explain status.
- Use live region for refresh result.

Keyboard:
- All actions reachable.
- Refresh reachable.
- Close reachable.
- No hidden disabled retry button in tab order.

Touch:
- Buttons at least `44px` high.
- Cards have adequate spacing.

Reduced motion:
- Simple fade only.
- No pulsing retry indicator.

## Error States
### `not_authorized`
Use when admin lacks issue-management scope.

Copy:
```text
Your account cannot inspect outbound notification recovery.
```

### `session_expired`
Use when auth expires.

Copy:
```text
Your session expired before notification context could be refreshed.
```

### `api_error`
Use when list refresh fails.

Copy:
```text
Notification context could not be refreshed. The current record may be stale.
```

Action:
```text
Try refresh again
```

### `limited_context`
Use when selected row data is unavailable.

Copy:
```text
Open this retry review from the outbound notifications list to inspect the selected record.
```

## Privacy And Data Protection
The modal may show:
- Outbound notification ID.
- Delivery ID.
- Tracking code.
- Event type.
- Masked recipient phone.
- Provider name.
- Sanitized error name/code/message.
- Attempt timestamps.

The modal must not show:
- Full phone by default.
- SMS body.
- Provider credentials.
- Raw provider response.
- Internal task secret.
- Stack traces.
- Receiver identity beyond phone unless loaded elsewhere with permission.

Analytics and logs must not include:
- full phone
- error message
- raw payload
- tracking code unless policy allows
- delivery ID unless policy allows

## Security Requirements
Frontend must:
- Never call internal dispatch endpoint.
- Never embed internal task secret.
- Never create local retry status.
- Never change attempt count.
- Never mutate notification status.
- Never show full provider errors without sanitization.
- Never expose provider secret or auth headers.
- Treat backend list response as read-only.

Backend remains final authority.

## Analytics
Privacy-safe events:
- `retry_notification_modal_opened`
- `retry_notification_modal_state_viewed`
- `retry_notification_modal_refresh_clicked`
- `retry_notification_modal_refresh_failed`
- `retry_notification_modal_open_delivery_clicked`
- `retry_notification_modal_open_issue_queue_clicked`
- `retry_notification_modal_closed`

Allowed properties:
- `status`
- `attemptCount`
- `maxAttempts`
- `isDue`
- `hasLastError`
- `eventType`
- `provider`
- `channel`

Do not send:
- phone
- tracking code
- delivery ID
- error message
- dedupe key

## Copy System
Tone:
- Honest.
- Operational.
- Calm.
- Specific.

Avoid:
- `Retry now`
- `Send again`
- `Failed forever`
- `SMS delivered`
- `Receiver notified`
- `Guaranteed`
- `One click`

Preferred phrases:
```text
Automatic retry is scheduled.
This record is due for internal dispatch.
Manual retry is not available in the current backend.
Automatic retry has stopped.
Gateway send success does not prove receiver read.
```

## Edge Cases
### Sent Record
Show:
```text
This notification was already sent. No retry action is available.
```

### Pending Due Now
Show:
```text
This notification is pending and due for the internal dispatcher.
```

### Failed Future Retry
Show:
```text
Automatic retry is scheduled for <time>.
```

### Failed Due Now
Show:
```text
This failed notification is due for the internal dispatcher.
```

### Dead Letter
Show:
```text
Automatic retry stopped after the configured attempts.
```

### Missing Last Error
Show:
```text
No provider error summary was recorded.
```

### Max Attempts Lower Than Attempt Count
Show integrity warning:
```text
Attempt count is higher than max attempts. Refresh the outbox before deciding next action.
```

Do not infer new backend rules.

## Future Backend Requirements For Active Retry
Before this modal can offer manual retry, backend must add:
- `admin_retry_outbound_notification` operation.
- Browser-safe admin route.
- Request schema.
- Response schema.
- Role/capability rule.
- Idempotency behavior.
- Rate limit.
- Max retry policy.
- Dead-letter override policy.
- Audit event.
- Retry reason field.
- Provider response redaction.
- Delivery/support notification side effects.

Until then, the modal remains read-only.

## Testing Requirements
Unit tests:
- Renders pending due state.
- Renders failed future retry state.
- Renders failed due state.
- Renders dead-letter state.
- Renders sent state.
- Renders limited context without selected record.
- Masks recipient phone.
- Shows attempt count and max attempts.
- Shows next attempt label.
- Shows sanitized last error.
- Does not render active retry button.
- Does not build a mutation payload.
- Does not call internal dispatch route.
- Refresh updates modal state when status changes.
- Refresh missing record shows limited context.
- Unauthorized state renders.
- API error state renders.
- Focus restores on close.

Integration tests:
- Opens from outbound notifications list row.
- Opens from notification detail.
- Opens delivery action.
- Preserves outbox filter when returning.
- Dead-letter route opens delivery or issue queue.
- Refresh calls only admin outbound notifications list endpoint.

Accessibility tests:
- Dialog has accessible name.
- Focus trap works.
- Status is not color-only.
- Refresh status is announced.
- Keyboard can operate all actions.
- Mobile stacked layout preserves reading order.

End-to-end test:
- Admin opens dead-letter outbound notification detail.
- Opens retry modal.
- Sees manual retry unavailable.
- Sees max attempts reached.
- Opens related delivery.
- No retry network mutation is sent.

## Acceptance Criteria
The modal is complete when:
- It never sends or retries SMS.
- It never calls the internal dispatch endpoint.
- It explains current automatic retry rules.
- It distinguishes pending, failed, sent, and dead-letter states.
- It masks receiver phone.
- It shows safe provider error summary.
- It routes to delivery, issue queue, outbox, or launch readiness.
- It handles limited context.
- It handles refresh errors.
- It is accessible by keyboard and screen reader.
- It works on desktop, tablet, and mobile.
- It documents backend requirements before manual retry can exist.

## Implementation Notes For Claude Code
Build `RetryNotificationModal` as a read-only recovery modal. It must be safe even if a user opens it from a row action named `Retry`. The modal's job is to prevent unsafe action and guide the admin to a supported recovery route.

Do not import or call the internal dispatch endpoint in frontend API clients. If an API client generator sees `dispatch_due_outbound_notifications`, mark it internal-only and unavailable to browser code.

The modal should make the absence of a manual retry endpoint explicit without sounding like a crash or defect.

## Build Checklist
1. Define modal props for selected outbound notification record and source context.
2. Derive modal state from status, attempt count, max attempts, and next attempt time.
3. Render identity summary.
4. Render retry state summary.
5. Render backend rule panel.
6. Render manual retry unavailable panel.
7. Render safe route actions.
8. Add refresh through `admin_outbound_notifications` only.
9. Mask phone number.
10. Sanitize provider error display.
11. Add no active retry button.
12. Add accessibility attributes and focus management.
13. Add responsive stacked layout.
14. Add unit and integration tests proving no retry mutation occurs.
15. Add E2E test for dead-letter recovery route.

## Final Directive
`RetryNotificationModal` must be a read-only communication recovery modal until the backend exposes a browser-safe admin retry mutation. It must never call the internal dispatch endpoint, never send SMS, never reveal sensitive provider data, and never imply manual retry succeeded. It should explain automatic retry state, show dead-letter risk, and route admins to supported recovery surfaces.
