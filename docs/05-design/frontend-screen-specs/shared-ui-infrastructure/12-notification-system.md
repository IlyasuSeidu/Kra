# Notification System Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Notification system |
| Component family | Shared UI infrastructure |
| Primary components | `NotificationSystemProvider`, `NotificationInbox`, `NotificationRow`, `NotificationBadge`, `ToastManager`, `NotificationDeepLinkResolver`, `NotificationRouteGuard` |
| Supporting components | `NotificationUnreadDot`, `NotificationTypeIcon`, `NotificationFilterBar`, `NotificationDetailSheet`, `ToastViewport`, `ToastItem`, `OutboundNotificationStatusChip`, `NotificationPrivacyRedactor`, `NotificationAnnouncer` |
| Inventory behavior | Inbox, read/unread, toast, deep links to delivery/task |
| Repo targets | `apps/mobile`, `apps/admin`, limited admin observability in `apps/admin`; public web receiver SMS flow is observed through admin outbox, not a public inbox |
| Primary surfaces | sender notifications, sender home unread badge, sender delivery detail, sender payment result, sender refund status, sender support thread, operations role home, operations action recovery, admin outbound notifications, admin notification detail, admin overview, admin launch readiness |
| Primary users | senders, station operators, drivers, final-mile couriers, support admins, ops admins, super admins, QA, accessibility reviewers |
| Backend coverage | `list_notifications`, sender notification records, backend notification copy, delivery status notification queueing, payment status notification queueing, issue status notification queueing, receiver SMS outbound outbox, admin outbound notification list |
| Browser mutation operation | None in v1 for inbox; toast lifecycle is client-only; outbound notification retry is not exposed to frontend |
| Data sensitivity | notification title, body, status, delivery ID, outbound recipient phone, tracking code, SMS provider, provider error, dedupe key, receiver event type |
| Offline critical | Yes for field toasts and cached notification visibility; no offline mutation may mark server notifications read or dispatch outbound SMS |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, payment status component, issue status component, empty/error library, accessibility foundation, localization foundation, analytics tracking, test harness |
| Related screen specs | `SenderNotifications`, `SenderHome`, `SenderDeliveryDetail`, `PaymentResult`, `SenderRefundStatus`, `SenderSupportThread`, `OpsOfflineOutbox`, `OpsActionRecovery`, `AdminOutboundNotifications`, `AdminNotificationDetail`, `AdminLaunchReadiness` |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, payment under review, blocked by issue, webhook conflict |
| Design tokens | No unique tokens; system uses notification, delivery, payment, issue, refund, success, warning, danger, neutral, focus, offline, and admin evidence tokens |
| Accessibility target | Notification counts, read/unread state, toasts, refresh results, and route changes must be perceivable without color, animation, sound, or badge position alone |

## Purpose
The notification system is Kra's shared product update and transient feedback layer.

It covers:

- sender notification inbox
- sender read and unread display from backend records
- notification badges and counts
- deterministic deep links from notification types to delivery, payment, refund, or issue routes
- local in-app toasts for action feedback
- operations-safe field toasts
- admin outbound SMS observability
- privacy and accessibility rules for all notification surfaces

The most important rule is:

```text
Stored notifications are backend records. Toasts are local UI feedback. The frontend must not treat one as the other.
```

## Product Job
Kra uses notifications to keep senders, receivers, staff, and admins oriented across a delivery network where important state changes happen asynchronously.

The notification system must:

- list sender notifications from `list_notifications`
- show backend-provided read/unread status honestly
- avoid local persistent read-state claims when no backend mutation exists
- route notification taps to the correct screen
- handle missing delivery IDs safely
- render client-only toasts for action results
- keep toasts non-blocking unless the host uses a modal or alert-dialog for high-risk decisions
- show admin outbound SMS status without exposing send controls
- avoid exposing provider references, full phone numbers, dedupe keys, staff IDs, or raw provider errors to unauthorized roles
- support accessible live announcements and predictable focus behavior
- provide stable test IDs and route resolution rules for Claude Code

## Strategic Role
Delivery networks fail when users do not know what happened, what changed, or what action is needed.

Weak notification infrastructure would cause:

- senders missing payment failures
- senders missing refund completion
- delivery movement hidden inside timeline only
- staff missing queued action failures
- admins missing dead-letter receiver SMS
- users seeing stale badge counts as live truth
- screen readers missing toasts or refresh results
- privacy leaks through notification titles or deep links
- duplicate communication if toasts and stored inbox records are mixed

The system must be calm, precise, and source-aware. Every visible notification has to say what changed and where to go next without overexposing data.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared notification primitives across mobile and admin surfaces.

Surface type:

- Shared inbox, badge, toast, and deep-link infrastructure.

Primary action:

- Help the current user understand an update and open the correct route.

Visual thesis:

- `Operational signal layer`: quiet but sharp updates, with unread state, route intent, freshness, and privacy boundaries clearly encoded.

Restraint rule:

- Do not add chat, provider dashboards, notification resend controls, device permission prompts, or persistent read mutations that the backend does not expose.

Density:

- Sender inbox is medium density.
- Toasts are low density and transient.
- Admin outbox observation is dense and table-first.

Platform stance:

- Mobile-first for sender and operations. Desktop-dense for admin observability. Public receiver flow has SMS links, not an inbox.

## External Research Used
Only directly relevant notification, alert, live-region, and accessibility references were used:

- [Android Developers notifications](https://developer.android.com/develop/ui/views/notifications): supports treating notifications as messages surfaced outside the app UI and routing users into app activities.
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports sparing use of page-level notifications, priority handling, and accessible region behavior.
- [USWDS alert](https://designsystem.digital.gov/components/alert/): supports alerts for important and sometimes time-sensitive changes.
- [MDN `aria-live`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live): supports live-region behavior for dynamic content updates and choosing polite versus assertive announcement priority.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing status changes without moving focus.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation from notifications to target routes.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear recovery when notification routing or refresh fails.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/26-sender-notifications.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/34-admin-outbound-notifications.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/35-admin-notification-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/03-admin-launch-readiness.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/10-payment-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/11-issue-status-component.md`
- `docs/07-api/api-contracts.md`
- `docs/07-data/firestore-schema.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/notification-feed.ts`
- `services/api/src/notifications.ts`
- `services/api/src/outbound-notifications.ts`
- `services/api/src/admin.ts`
- `services/api/src/app.ts`

## Non-Goals
The notification system must not:

- implement actual frontend screens
- create backend notification records from the frontend
- mark notification read when no backend mutation exists
- mark all notifications read
- delete notifications
- dispatch outbound SMS
- retry outbound SMS
- edit receiver phone numbers
- expose internal task routes
- expose Hubtel credentials or provider secrets
- expose raw dedupe keys to sender-facing surfaces
- expose full receiver phone numbers outside admin surfaces
- show provider error payloads outside authorized admin views
- turn a toast into a persisted inbox record
- turn an inbox record into a toast without host intent
- use notification badges as payment, issue, custody, or proof authority
- implement device push permissions in this shared spec

## Component Boundary
The notification system owns:

- inbox rendering primitives
- notification row rendering
- unread badge rendering
- notification grouping and filters from loaded rows
- deep-link resolution
- local toast queue and viewport
- toast duration policy
- toast accessibility policy
- notification privacy redaction
- outbound notification status display primitives
- accessible announcements
- analytics payload shaping
- test identifiers

The host owns:

- route authorization
- data fetching
- query invalidation
- mobile navigation
- admin navigation
- push registration if added later
- background message delivery if added later
- notification read mutation if backend adds it later
- outbound notification dispatch workers
- retry routes if backend adds them later
- local storage or cache policy
- actual analytics dispatch

## Backend Sender Notification Contract
Sender inbox operation:

```http
GET /v1/notifications
```

Supported query:

```ts
type NotificationListQuery = {
  limit?: number;
};
```

Rules:

- `limit` is optional.
- `limit` is a positive integer.
- maximum `limit` is `100`.
- default backend limit is `50`.
- no cursor exists in v1.
- no status filter exists in v1.
- no type filter exists in v1.
- no mark-read mutation exists in v1.

Response:

```ts
type NotificationResponse = {
  notificationId: string;
  type:
    | "delivery_created"
    | "payment_confirmed"
    | "payment_failed"
    | "received_at_origin"
    | "dispatched"
    | "received_at_destination"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "issue_updated"
    | "refund_completed";
  status: "unread" | "read";
  title: string;
  body: string;
  deliveryId?: string;
  createdAt: string;
  readAt?: string;
};
```

Authority:

- `status` is backend authority for read/unread.
- `readAt` is backend authority for read timestamp.
- Frontend local row focus or tap must not be shown as persisted read.
- If the app wants visual session-read behavior later, it must be labeled as local and must not overwrite backend status.

## Backend Outbound Notification Contract
Admin outbound list operation:

```http
GET /v1/admin/outbound-notifications
```

Supported query:

```ts
type AdminOutboundNotificationListQuery = {
  status?: "pending" | "sent" | "failed" | "dead_letter";
  limit?: number;
};
```

Response includes:

- generated timestamp
- outbound notification ID
- SMS channel
- Hubtel provider
- receiver SMS kind
- outbound status
- delivery ID
- recipient phone
- tracking code
- receiver event type
- attempt count
- next attempt time
- sent time
- last error

Authority:

- Admin outbound list is observability only.
- Frontend must not call internal dispatch.
- Frontend must not offer retry until a public admin mutation exists.
- Sent means gateway accepted send, not receiver read.
- Dead letter means automatic attempts stopped.

## Notification Types
Sender notification type mapping:

| Type | Group | User Label | Primary Target |
| --- | --- | --- | --- |
| `delivery_created` | delivery | `Delivery created` | delivery detail |
| `received_at_origin` | delivery | `Package received at origin` | delivery timeline |
| `dispatched` | delivery | `Package dispatched` | delivery timeline |
| `received_at_destination` | delivery | `Arrived at destination station` | delivery timeline |
| `ready_for_pickup` | delivery | `Ready for pickup` | delivery detail |
| `out_for_delivery` | delivery | `Out for delivery` | delivery timeline |
| `delivered` | delivery | `Delivery completed` | delivery detail |
| `payment_confirmed` | payment | `Payment confirmed` | receipt detail |
| `payment_failed` | payment | `Payment failed` | payment recovery |
| `issue_updated` | issue | `Issue updated` | delivery detail issue section |
| `refund_completed` | refund | `Refund completed` | refund status |

Type rules:

- Never show raw enum as primary user copy.
- Use backend `title` and `body` when present, but keep fallback labels for route and filter UI.
- Unknown future type must render as `Notification` and open detail sheet.
- `issue_updated` does not include issue ID in v1; route to delivery detail, not support thread, unless host supplies issue context separately.

## Read And Unread Model
Backend statuses:

```ts
type NotificationStatus =
  | "unread"
  | "read";
```

Display states:

```ts
type NotificationDisplayReadState =
  | "unread"
  | "read"
  | "local_opened"
  | "unknown";
```

Rules:

- `unread` maps to backend `unread`.
- `read` maps to backend `read`.
- `local_opened` can be used only as transient visual treatment during current session if host chooses, and must not change unread count.
- `unknown` is used only when status is missing or invalid.
- Unread count uses backend `unread` only.
- Tapping a row does not persist read state in v1.
- Returning from a target route must not silently change backend read state.

Unread visual:

- unread dot
- bold or stronger title
- `Unread` accessible label
- count badge in header or shell

Read visual:

- no unread dot
- normal title weight
- optional `Read` accessible label for screen-reader row metadata

Do not rely on:

- color alone
- row position alone
- badge count alone
- animation alone

## Deep Link Resolver
The resolver converts notification records into route intents.

```ts
type NotificationRouteIntent =
  | { type: "open_delivery_detail"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_delivery_timeline"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_payment_recovery"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_receipt"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_refund_status"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_delivery_issue_context"; deliveryId: string; sourceNotificationId: string }
  | { type: "open_notification_detail"; notificationId: string }
  | { type: "unsupported_notification"; notificationId: string; reason: string };
```

Route mapping:

| Type | deliveryId Present | Route Intent |
| --- | --- | --- |
| `delivery_created` | yes | `open_delivery_detail` |
| `received_at_origin` | yes | `open_delivery_timeline` |
| `dispatched` | yes | `open_delivery_timeline` |
| `received_at_destination` | yes | `open_delivery_timeline` |
| `ready_for_pickup` | yes | `open_delivery_detail` |
| `out_for_delivery` | yes | `open_delivery_timeline` |
| `delivered` | yes | `open_delivery_detail` |
| `payment_confirmed` | yes | `open_receipt` |
| `payment_failed` | yes | `open_payment_recovery` |
| `issue_updated` | yes | `open_delivery_issue_context` |
| `refund_completed` | yes | `open_refund_status` |
| any type | no | `open_notification_detail` |
| unknown type | any | `unsupported_notification` |

Route guard rules:

- If target route rejects due to permission, show not-authorized route state.
- If target route rejects because delivery no longer exists, show delivery-not-found state.
- If receipt route rejects because receipt is unavailable, fallback to delivery detail.
- If payment recovery rejects because payment is no longer failed, fallback to payment status or delivery detail.
- If refund status route rejects because no refund exists, fallback to delivery detail.

Deep link rules:

- Do not include receiver phone, provider reference, dedupe key, or raw tracking code in analytics route payload.
- Include source notification ID where safe.
- Clear route intent if session expires.
- Validate route params with shared schemas.

## Toast System
Toasts are client-only feedback for local UI actions.

Toast use cases:

- action saved
- action queued offline
- action synced
- action failed with safe recovery
- payment status refreshed
- proof upload started or completed
- scan mismatch routed to modal
- issue created
- notification route unavailable

Toast non-goals:

- support chat
- required confirmation
- destructive action confirmation
- long policy explanation
- sensitive evidence display
- provider error detail
- payment provider reference display
- proof media preview

Toast severity:

```ts
type ToastTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "offline"
  | "syncing";
```

Toast shape:

```ts
type ToastMessage = {
  toastId: string;
  tone: ToastTone;
  title: string;
  body?: string;
  actionLabel?: string;
  actionIntent?: unknown;
  durationMs?: number;
  persistent?: boolean;
  createdAt: string;
};
```

Toast rules:

- Default duration is `5000ms`.
- Danger toasts with recovery action may persist until dismissed.
- Offline queued action toasts may persist until route change or user dismissal.
- Never show more than three visible toasts at once.
- New toasts queue behind visible toasts.
- Toasts must not cover primary mobile action buttons.
- Toast action must have a route or recovery intent.
- Toast close must be keyboard accessible.
- Toasts must not steal focus.

Accessibility:

- Use `aria-live="polite"` for neutral, success, offline, and syncing toasts.
- Use assertive announcement only for immediate destructive or safety-critical failure.
- Do not overuse assertive announcements.
- Provide visible title text.
- Do not rely on icon or color.
- Reduced motion disables slide or spring animation.

## Inbox System
Inbox components:

- `NotificationInbox`
- `NotificationFilterBar`
- `NotificationRow`
- `NotificationUnreadDot`
- `NotificationDetailSheet`
- `NotificationEmptyState`
- `NotificationOfflineState`
- `NotificationStaleState`

Inbox source:

- `GET /v1/notifications`.

Inbox filters are client-side in v1:

- `all`
- `unread`
- `delivery`
- `payment`
- `refund`
- `issue`

Filter rules:

- Do not send type or status filters to backend.
- Label counts as loaded-scope counts.
- If loaded rows are limited, show `Showing latest loaded notifications`.
- Do not claim full historical count.

Sorting:

- Preserve backend order.
- If host must sort, use `createdAt` descending and keep stable order for ties.
- Do not group in a way that hides latest unread.

Empty states:

- no notifications: `No notifications yet. Delivery, payment, refund, and support updates will appear here.`
- filtered empty: `No notifications match this filter.`
- offline empty: `Notifications are unavailable offline until they have been loaded once.`

## Badge System
Badge sources:

- unread count from loaded notification rows
- shell may display loaded-scope unread count
- admin outbox badge from loaded admin rows only

Rules:

- Badge count is not global unless backend returns a global count.
- Badge count should cap visual display at `99+`.
- Badge must have accessible label, such as `3 unread notifications`.
- Badge must not use color alone.
- Badge must not trigger a fetch on every render.
- Badge must not appear on receiver public tracking.

Unread count derivation:

```text
count notifications where status is unread in the loaded response
```

Do not include:

- local opened rows
- outbound SMS records
- toasts
- admin alerts
- issue counts
- payment blockers

## Admin Outbound Notification Observability
Outbound notification status mapping:

| Backend Status | UI Label | Meaning |
| --- | --- | --- |
| `pending` | `Queued` | waiting for first dispatch or due dispatch |
| `failed` | `Retry scheduled` | previous attempt failed and automatic retry may still run |
| `dead_letter` | `Dead letter` | max attempts reached; automatic retry stopped |
| `sent` | `Sent` | provider accepted the send request |

Admin rules:

- Show SMS status in admin only.
- Mask recipient phone by default.
- Show provider as `Hubtel`.
- Show event type using safe labels.
- Show next attempt time for failed and pending records.
- Show dead-letter records prominently.
- Do not show retry button.
- Do not show internal task route.
- Do not expose provider credentials.
- Do not interpret sent as receiver read.

Receiver event labels:

| Event Type | Label |
| --- | --- |
| `ready_for_pickup` | `Ready for pickup SMS` |
| `final_mile_assigned` | `Final-mile assigned SMS` |
| `out_for_delivery` | `Out for delivery SMS` |
| `failed_attempt` | `Failed attempt SMS` |
| `delivered` | `Delivered SMS` |

## Page-Level Notification Banners
Use page-level banners sparingly.

Allowed use:

- service-wide outage
- stale notification source
- outbound SMS dead-letter risk
- permission state that affects the whole page
- successful completion after prior page action

Disallowed use:

- form validation errors
- every small action result
- repeated unread count reminders
- duplicate with toast for same event
- delivery-specific status better shown in main content

Rules:

- One banner per page region.
- Use highest-priority banner if multiple events compete.
- Place near page heading where web layout applies.
- Use `role="region"` for neutral informational banners.
- Use `role="alert"` only for urgent outcomes that need immediate announcement.

## Notification Priority
Priority controls visual order, not backend authority.

Priority levels:

```ts
type NotificationPriority =
  | "critical"
  | "high"
  | "normal"
  | "low";
```

Default priority mapping:

| Type | Priority |
| --- | --- |
| `payment_failed` | high |
| `issue_updated` with active issue context | high |
| `refund_completed` | high |
| `out_for_delivery` | high |
| `delivered` | normal |
| `ready_for_pickup` | normal |
| `payment_confirmed` | normal |
| `dispatched` | normal |
| `received_at_origin` | normal |
| `received_at_destination` | normal |
| `delivery_created` | low |

Rules:

- Priority does not reorder backend list unless host explicitly uses an attention stack.
- Attention stack may highlight high-priority unread items above the list.
- Main list still shows chronological order.
- Critical priority is reserved for future safety or fraud notifications with approved backend support.

## Privacy Redaction
Sender inbox must not show:

- receiver phone
- receiver address
- staff names
- staff IDs
- provider references
- payment IDs unless a receipt screen owns it
- proof asset IDs
- raw tracking URL tokens
- dedupe key
- outbound SMS status
- internal error names
- provider error messages

Admin outbound list may show:

- delivery ID
- tracking code
- provider label
- masked recipient phone
- event type
- safe last error summary
- attempt count
- next attempt time

Admin outbound list must not show:

- full provider secrets
- raw provider authentication parameters
- full phone number unless audited reveal exists
- internal task secret
- raw SMS provider payload unless future admin detail route adds audited reveal

Toast privacy:

- Toasts must not contain full phone numbers.
- Toasts must not contain proof references.
- Toasts must not contain provider references.
- Toasts must not contain raw scan codes unless already visible and safe on the host screen.

## Interaction Contracts
Provider props:

```ts
type NotificationSystemProviderProps = {
  role:
    | "sender"
    | "station_operator"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "ops_admin"
    | "finance_admin"
    | "super_admin";
  capabilities: {
    canListNotifications: boolean;
    canListOutboundNotifications: boolean;
    canOpenDelivery: boolean;
    canOpenPaymentRecovery: boolean;
    canOpenReceipt: boolean;
    canOpenRefundStatus: boolean;
    canOpenSupport: boolean;
    canOpenAdminOutboundDetail: boolean;
  };
  onRouteIntent: (intent: NotificationRouteIntent) => void;
};
```

Toast API:

```ts
type NotificationToastApi = {
  showToast: (message: Omit<ToastMessage, "toastId" | "createdAt">) => string;
  dismissToast: (toastId: string) => void;
  clearToasts: () => void;
};
```

Inbox row intent:

```ts
type NotificationRowIntent =
  | { type: "open"; notificationId: string }
  | { type: "open_detail"; notificationId: string }
  | { type: "refresh" };
```

Required test IDs:

- `notification-system-root`
- `notification-inbox-root`
- `notification-inbox-filter`
- `notification-row`
- `notification-row-unread`
- `notification-row-read`
- `notification-row-title`
- `notification-row-body`
- `notification-row-time`
- `notification-row-target`
- `notification-badge`
- `notification-detail-sheet`
- `toast-viewport`
- `toast-item`
- `toast-action`
- `toast-dismiss`
- `notification-announcer`
- `outbound-notification-status`

## State Matrix
Inbox loading:

- show skeleton rows or loading state
- no invented notification content
- announce `Loading notifications`

Inbox ready:

- show loaded rows
- show loaded unread count
- show refresh control
- show filters

Inbox empty:

- explain what appears here
- primary route to home
- no illustration that implies hidden notifications

Inbox filtered empty:

- show active filter
- offer clear filter

Inbox stale:

- show previous rows
- show stale warning
- allow refresh

Inbox offline:

- show cached rows if available
- no mark-read behavior
- deep links require route availability check

Inbox api error:

- show retry
- keep cached rows if present and label them

Toast queued:

- add to queue
- announce when visible
- auto-dismiss based on policy

Toast action:

- action button triggers host intent
- toast remains or closes based on host policy

Toast dismissed:

- remove from viewport
- if queue exists, show next toast

Outbound ready:

- show status rows
- show generated time
- show no retry controls

Outbound dead letter:

- show high-priority admin banner
- route to delivery or notification detail

## Role Rules
Sender:

- can list own inbox.
- can see title, body, type, status, delivery ID only as route context.
- cannot see outbound SMS status.
- cannot see provider details.
- cannot persist read state in v1.

Station operator:

- does not use sender inbox.
- can use toasts for operational feedback.
- can open offline outbox/action recovery through host routes.

Driver:

- does not use sender inbox.
- can use assignment and scan toasts.
- push notifications, if added later, route through assignment screens.

Final-mile courier:

- does not use sender inbox.
- can use proof, route, failed-attempt, and sync toasts.

Support admin:

- can observe outbound notifications where route allows.
- can use admin toasts.
- can route from outbound records to delivery/support context.

Ops admin:

- can observe outbound notifications where route allows.
- can see communication risk and launch blockers.

Finance admin:

- does not own outbound notification list under current backend guard.
- may see finance-related sender notification context only inside delivery/payment/refund screens where authorized.

Super admin:

- can observe all admin notification surfaces that backend permits.

Receiver public:

- no inbox.
- receives SMS link only.
- public tracking must not expose notification internals.

## Offline And Low-Bandwidth Rules
Sender inbox:

- cache last successful list.
- label cached rows as saved if offline.
- do not change read status while offline.
- do not display outbound delivery status.

Field toasts:

- offline action queued toast is allowed.
- offline sync failure toast is allowed.
- action recovery route should be available from toast.
- toast must not claim backend success before sync.

Admin outbound:

- online-first.
- if stale data is shown, generated time must be visible.
- no offline retry.

Low-bandwidth:

- avoid loading heavy icons.
- keep row layout text-first.
- show relative time plus exact time in accessible text.

## Accessibility Requirements
Inbox:

- List has clear heading.
- Each row has a stable accessible name.
- Unread state is textually available.
- Created time uses machine-readable time.
- Filter chips are buttons or tabs with correct selected state.
- Refresh result uses live region.

Badge:

- Badge has accessible label.
- Badge count update is announced only when user is on relevant shell or inbox.
- Do not announce every background count change.

Toasts:

- Toast viewport uses live-region strategy.
- Toasts do not steal focus.
- Toast action is keyboard reachable.
- Toast dismiss is keyboard reachable.
- Danger toasts with action remain long enough to read and operate.

Admin outbound:

- Table has caption.
- Status chips have text labels.
- Phone masking is visible and announced.
- Generated time is visible.

Live region policy:

- `polite` for refresh, success, sync, and normal updates.
- `assertive` only for safety-critical failure or destructive action failure.
- Avoid multiple simultaneous live announcements.

Reduced motion:

- Disable toast slide, bounce, and stagger.
- Preserve opacity-only change only if it does not distract.

## Analytics Events
The system prepares analytics payloads; host dispatches them.

Inbox display:

```ts
type NotificationInboxViewedEvent = {
  eventName: "notification_inbox_viewed";
  role: string;
  loadedCount: number;
  unreadCount: number;
  sourceFreshness: "fresh" | "stale" | "offline_cached" | "partial" | "unknown";
};
```

Notification open:

```ts
type NotificationOpenedEvent = {
  eventName: "notification_opened";
  role: string;
  notificationId: string;
  notificationType: string;
  notificationStatus: "unread" | "read";
  routeIntentType: NotificationRouteIntent["type"];
  deliveryId?: string;
};
```

Toast display:

```ts
type ToastDisplayedEvent = {
  eventName: "toast_displayed";
  role: string;
  tone: ToastTone;
  surface: string;
  hasAction: boolean;
};
```

Admin outbound viewed:

```ts
type OutboundNotificationViewedEvent = {
  eventName: "outbound_notification_viewed";
  role: string;
  status: "pending" | "sent" | "failed" | "dead_letter";
  provider: "hubtel";
  channel: "sms";
  deliveryId?: string;
};
```

Privacy rules:

- Do not send title or body text to analytics.
- Do not send full phone number.
- Do not send tracking code.
- Do not send dedupe key.
- Do not send provider error message.
- Do not send toast body.

## Performance Requirements
Inbox:

- Render from host query data.
- Virtualization is optional for v1 because limit is at most `100`.
- Keep row icons lightweight.
- Do not poll continuously.
- Refresh is user-initiated or host-scheduled.

Toast:

- Toast manager stores only active and queued toasts.
- Remove dismissed toasts from memory.
- Avoid timers when reduced motion or persistence requires manual dismissal.

Deep link resolver:

- Pure function.
- No network calls.
- No side effects.
- Host performs route availability checks.

Admin outbound:

- Keep table row formatting cheap.
- Do not fetch provider details per row.
- Do not call internal dispatch endpoint.

## Security And Privacy
Hard rules:

- Sender inbox is scoped to authenticated principal.
- Sender cannot fetch another user's notifications.
- Frontend must not expose notification dedupe keys.
- Frontend must not expose full receiver phone outside authorized admin contexts.
- Frontend must not expose provider secrets.
- Frontend must not expose internal task secret.
- Frontend must not expose raw provider error payload to sender.
- Deep links must validate route params.
- Deep links must not bypass route authorization.
- Toasts must not leak sensitive context.

Notification copy rules:

- Keep title under backend max length.
- Keep body under backend max length.
- Do not put full phone numbers in title or body.
- Do not put provider references in title or body.
- Do not put staff IDs in title or body.
- Do not put proof IDs in title or body.

## Localization
String keys:

- `notification.inbox.title`
- `notification.inbox.empty.title`
- `notification.inbox.empty.body`
- `notification.inbox.filter.all`
- `notification.inbox.filter.unread`
- `notification.inbox.filter.delivery`
- `notification.inbox.filter.payment`
- `notification.inbox.filter.refund`
- `notification.inbox.filter.issue`
- `notification.status.unread`
- `notification.status.read`
- `notification.badge.unread_count`
- `notification.route.unavailable`
- `notification.toast.dismiss`
- `notification.toast.action`
- `notification.outbound.status.pending`
- `notification.outbound.status.sent`
- `notification.outbound.status.failed`
- `notification.outbound.status.dead_letter`
- `notification.freshness.stale`
- `notification.freshness.offline_cached`

Localization rules:

- Ghana launch copy is English-first.
- Keep notification title and body direct.
- Avoid idioms.
- Keep SMS-friendly copy separate from app notification copy.
- Do not localize provider names unless provider policy requires it.

## Test Matrix
Inbox tests:

- renders backend notification rows.
- computes unread count from backend `unread`.
- read rows render without unread dot.
- unread rows expose accessible unread label.
- filters are client-side.
- filter counts are loaded-scope only.
- missing delivery ID opens detail sheet.
- unknown type opens unsupported state.
- refresh announces result.
- offline cache shows saved status.

Deep link tests:

- delivery movement types route to delivery timeline or detail as specified.
- payment confirmed routes to receipt.
- payment failed routes to payment recovery.
- refund completed routes to refund status.
- issue updated routes to delivery issue context when no issue ID exists.
- missing delivery ID does not route to invalid path.
- target route failure falls back safely.

Read/unread tests:

- tapping row does not mutate backend status.
- local opened state does not reduce unread count.
- readAt displays only when backend provides it.
- unread badge caps display at `99+`.

Toast tests:

- toasts queue when more than visible maximum.
- success toast auto-dismisses.
- danger toast with action can persist.
- toast action emits intent.
- dismiss removes toast.
- reduced motion disables animation.
- live region announces visible toast.

Admin outbound tests:

- pending maps to `Queued`.
- failed maps to `Retry scheduled`.
- dead letter maps to `Dead letter`.
- sent maps to `Sent`.
- retry button is absent.
- full phone number is masked by default.
- internal dispatch route is absent.
- sent does not render as receiver read.

Security tests:

- sender HTML excludes dedupe key.
- sender HTML excludes provider fields.
- sender HTML excludes receiver phone.
- analytics excludes title and body.
- analytics excludes phone and tracking code.
- toasts exclude provider references.

Accessibility tests:

- inbox rows have accessible names.
- unread state is available to screen readers.
- badge has accessible count label.
- refresh result announced.
- toasts do not steal focus.
- toast close and action are keyboard reachable.
- admin table has caption.
- large text does not clip notification title.

## Acceptance Criteria
The spec is complete only if a future implementation can satisfy these checks:

- Sender inbox uses only `list_notifications`.
- Read/unread state comes from backend status.
- No persistent mark-read behavior is built without a backend route.
- Deep links are deterministic for every known notification type.
- Missing delivery ID has a safe detail fallback.
- Toasts are local UI feedback only.
- Toasts do not become inbox records.
- Inbox records do not become toasts without host intent.
- Admin outbound SMS is read-only observability.
- Outbound retry and dispatch controls are absent.
- Sensitive notification fields are redacted by role.
- Accessibility covers unread labels, live regions, focus behavior, reduced motion, and keyboard actions.
- Analytics excludes sensitive notification content.

## Claude Code Build Notes
When implementing later:

- Build the deep-link resolver as a pure function first.
- Unit test notification type to route mapping.
- Keep backend inbox and toast store separate.
- Do not add mark-read UI until backend supports it.
- Do not add outbound retry UI until backend supports it.
- Use loaded-scope labels for counts.
- Mask admin phone fields by default.
- Route all sensitive admin details through dedicated admin screens.
- Keep toasts short and action-oriented.
- Keep sender rows text-first and scan-friendly.

## Completion Checklist
- Backend notification contract is documented.
- Outbound admin contract is documented.
- Read/unread authority is explicit.
- Deep link mapping is explicit.
- Toast boundary is explicit.
- Badge count rules are explicit.
- Admin outbound rules are explicit.
- Role redaction is explicit.
- Offline behavior is explicit.
- Accessibility behavior is explicit.
- Analytics privacy is explicit.
- Test matrix covers inbox, deep links, read/unread, toast, admin outbound, security, and accessibility.

## Final Quality Review
Product completeness:

- Pass. The spec covers inbox, read/unread display, badges, toasts, deep links, page banners, outbound SMS observability, and admin notification statuses.

Backend alignment:

- Pass. The spec respects current sender notification and admin outbound notification contracts and does not invent missing read, retry, or delete mutations.

Operational safety:

- Pass. The spec keeps outbound SMS dispatch internal, blocks retry controls, and prevents toast/inbox source confusion.

Privacy:

- Pass. The spec redacts receiver phone, provider fields, dedupe keys, tracking codes, raw error messages, and sensitive toast content by role.

Accessibility:

- Pass. The spec requires readable labels, live regions, focus stability, keyboard actions, large-text resilience, and reduced-motion behavior.

Implementation boundary:

- Pass. The spec defines shared notification infrastructure and does not implement actual frontend UI.
