# Sender Notifications Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderNotifications` |
| App | `apps/mobile` |
| Route | `/(sender)/notifications` |
| Primary test ID | `screen-sender-notifications` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `list_notifications`, `notificationListQuerySchema`, `notificationListResponseSchema`, `notificationResponseSchema`, `notificationTypeSchema`, `notificationStatusSchema` |
| Related routes | `/(sender)/home`, `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/support/:issueId`, `/(sender)/history`, `/(sender)/settings` |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `refreshing`, `stale_cache`, `offline`, `api_error`, `not_authorized`, `session_expired` |

## Product Job
This screen lets a sender review delivery, payment, refund, and issue notices in one place. It must provide a clear inbox that is fast to scan, routes each notification to the right product screen, and respects the current backend contract: notifications can be listed, but the app does not yet have a sender-facing mark-read mutation.

The sender should be able to:
- See recent notifications.
- Distinguish unread and read records returned by backend.
- Filter by all, unread, delivery, payment, refund, and issue notices.
- Open the relevant delivery, refund, payment recovery, or support route.
- Understand when there are no notifications.
- Refresh safely.
- Recover from offline, stale, unauthorized, session, and API failure states.
- Avoid seeing receiver, provider, staff, or internal delivery metadata.

This screen is not:
- A push notification permission screen.
- A device notification settings screen.
- An admin outbound notification console.
- A notification retry tool.
- A support chat.
- A payment verification screen.
- A refund tracker.
- A delivery timeline replacement.
- A mark-read management console.

## Audience
Primary audience:
- Authenticated senders who want to review recent delivery, payment, refund, and support updates.
- Senders returning after receiving a push, SMS, or in-app alert.
- Senders with active deliveries or open support issues.

Secondary audience:
- Claude Code implementing the sender inbox route.
- QA validating read/unread and routing behavior.
- Support reviewers validating issue notification copy.
- Finance reviewers validating refund completion routing.
- Privacy reviewers validating notification content exposure.

## User State
The sender is scanning for what changed. They may be checking whether a package moved, a payment failed, a refund completed, or support updated an issue. The screen must prioritize freshness, clarity, and action over decorative inbox chrome.

The sender may be:
- Opening from a home unread badge.
- Opening after a push or SMS.
- Checking if a payment needs action.
- Checking if a refund completed.
- Checking if a support issue changed.
- Looking for an older delivery update.
- Offline with previously loaded notifications.

The screen must:
- Call `list_notifications`.
- Use `notificationListResponseSchema`.
- Render only fields returned by `notificationResponseSchema`.
- Use backend `status` as the only persistent read/unread authority.
- Avoid marking notifications read locally as if backend persisted it.
- Route based on `type` and `deliveryId`.
- Handle notifications without `deliveryId`.
- Avoid showing provider references, payment IDs, receiver phone, staff IDs, raw dedupe keys, or outbound delivery logs.

## Primary Action
Primary action by state:
- `ready`: tap a notification row.
- `empty`: `Open home`.
- `filtered_empty`: `Clear filter`.
- `offline`: `Try again`.
- `api_error`: `Try again`.
- `not_authorized`: `Go back`.
- `session_expired`: `Sign in`.

Secondary actions:
- `Refresh`
- `Open history`
- `Open settings`
- `Go home`

CTA behavior:
- Tapping a delivery movement notification routes to delivery detail or timeline.
- Tapping `payment_failed` routes to payment recovery when `deliveryId` exists.
- Tapping `payment_confirmed` routes to receipt or delivery detail depending app route availability.
- Tapping `refund_completed` routes to refund status when `deliveryId` exists.
- Tapping `issue_updated` routes to support thread only if future notification includes issue ID; current contract does not. Without issue ID, route to delivery detail with issue context.
- Tapping a notification without `deliveryId` opens an inline detail sheet instead of dead navigation.
- `Refresh` refetches `list_notifications`.

Blocked behavior:
- Do not call a mark-read endpoint; none exists in v1.
- Do not mutate `status` locally as persistent read.
- Do not call admin outbound notification endpoints.
- Do not retry outbound notifications.
- Do not expose SMS provider delivery state.
- Do not expose dedupe keys.
- Do not expose payment IDs or provider references.
- Do not show raw notification type as customer copy.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Inbox title.
- Unread count based on backend status.
- Latest notification title.
- Latest notification body.
- Created time.
- Filter tabs.
- Clear row action or route affordance.

The first viewport must answer:
- `What changed recently?`
- `Which updates still need attention?`
- `Where should I tap next?`

## Main Tension
Notifications are both information and navigation. The backend gives enough for an inbox, but not enough for persistent mark-read, notification detail, issue ID deep links, or outbound delivery diagnostics. The design must feel complete without inventing missing notification operations.

The design must balance:
- Fast scanning against enough context.
- Read/unread clarity against no mark-read mutation.
- Deep links against missing issue ID in notification payload.
- Notification freshness against offline cache.
- Delivery/payment/refund urgency against calm UI.
- Sender privacy against useful update copy.

## Design Brief
User and job:
- An authenticated sender wants to review recent updates and jump to the right delivery, payment, refund, or support screen.

Context of use:
- Mobile, interrupt-driven, often after receiving an external alert or home badge.

Entry point:
- SenderHome.
- Push or SMS deep link.
- App header badge.
- Delivery detail.
- Settings.

Success state:
- Sender understands the update and opens the relevant screen or clears a filter.

Primary action:
- Tap notification row.

Navigation model:
- Inbox list with type filters and deterministic deep-link routing.

Density:
- Medium. Notifications should be scan-dense but not cramped.

Visual thesis:
- A crisp operational inbox: recent updates grouped by attention, with strong unread affordance and direct routes.

Restraint rule:
- Avoid social-feed styling, noisy badges, swipe-action clutter, admin outbox diagnostics, and pretend read-state controls.

Product lens:
- Trust-critical status visibility for delivery and money changes.

System stance:
- Native mobile list with filter chips, clear row hierarchy, and accessible unread markers.

Interaction thesis:
- Sender scans unread updates first, taps the one that matters, and lands on the screen that can resolve it.

Signature move:
- A compact "attention stack" header that shows unread count, latest critical type, and refresh state without becoming a dashboard.

Activation event:
- Sender opens a notification target route from the inbox.

## Elite Quality Gate
This spec is not closed unless the inbox is fast, accessible, honest about read state, and contract-accurate.

Non-negotiable quality requirements:
- First viewport shows unread count, filters, and latest notification rows.
- Uses only `list_notifications`.
- Uses `notificationListResponseSchema`.
- Displays read/unread from backend `status` only.
- Does not implement persistent mark-read behavior.
- Routes all known notification types deterministically.
- Handles missing `deliveryId`.
- Handles empty and filtered-empty states.
- Handles offline and stale cache without implying current status.
- Does not call admin outbound notification routes.
- Does not expose provider, payment, receiver, staff, dedupe, or outbound metadata.
- Supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If read state changes without backend support, the screen remains open.
- If `issue_updated` opens a support issue without issue ID, the screen remains open.
- If notification type enum appears as primary copy, the screen remains open.
- If admin outbound delivery statuses appear, the screen remains open.
- If empty state does not tell the sender what notifications are for, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, code, or visual assets to copy:

- [Apple Human Interface Guidelines: notifications](https://developer.apple.com/design/human-interface-guidelines/notifications): supports timely, useful, non-noisy notification behavior.
- [Apple Human Interface Guidelines: lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables): supports scan-friendly mobile list structure.
- [Material Design badges](https://m3.material.io/components/badges/overview): supports count and unread indicators without overloading the row.
- [Material Design lists](https://m3.material.io/components/lists/overview): supports list row hierarchy and touch targets.
- [W3C WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh and status update announcements.
- Kra `packages/shared/src/contracts/api.ts`: defines notification type, status, query, and response fields.
- Kra `services/api/src/notification-feed.ts`: defines list behavior and notification record shape.

## Backend Contract Alignment
Primary read:
- Operation: `list_notifications`.
- Method: `GET`.
- Path: `/v1/notifications`.
- Query schema: `notificationListQuerySchema`.
- Response schema: `notificationListResponseSchema`.
- Auth scope: authenticated.

Supported query:
- `limit`
- Positive integer.
- Maximum `100`.
- Default backend limit is `50`.

Notification response fields:
- `notificationId`
- `type`
- `status`
- `title`
- `body`
- optional `deliveryId`
- `createdAt`
- optional `readAt`

Allowed notification type values:
- `delivery_created`
- `payment_confirmed`
- `payment_failed`
- `received_at_origin`
- `dispatched`
- `received_at_destination`
- `ready_for_pickup`
- `out_for_delivery`
- `delivered`
- `issue_updated`
- `refund_completed`

Allowed notification status values:
- `unread`
- `read`

Forbidden assumptions:
- No mark-read mutation exists.
- No mark-all-read mutation exists.
- No delete notification mutation exists.
- No notification detail endpoint exists.
- No issue ID exists in notification payload.
- No provider delivery status exists in sender payload.

Forbidden endpoints:
- `admin_outbound_notifications`
- `dispatch_due_outbound_notifications`
- `create_issue`
- `resolve_issue`
- `escalate_issue`
- `refund_payment`
- `settle_refund_payment`
- Payment and delivery mutation endpoints.

## Type Mapping
Customer-facing notification groups:
| Notification type | Group | Row icon | Default target |
| --- | --- | --- | --- |
| `delivery_created` | Delivery | package | Delivery detail |
| `received_at_origin` | Delivery | station | Delivery timeline |
| `dispatched` | Delivery | truck | Delivery timeline |
| `received_at_destination` | Delivery | station | Delivery timeline |
| `ready_for_pickup` | Delivery | pickup | Delivery detail |
| `out_for_delivery` | Delivery | courier | Delivery timeline |
| `delivered` | Delivery | check | Delivery detail |
| `payment_confirmed` | Payment | receipt | Receipt detail or delivery detail |
| `payment_failed` | Payment | warning | Payment recovery |
| `issue_updated` | Issue | support | Delivery detail issue section |
| `refund_completed` | Refund | refund | Refund status |

Target rules:
- If `deliveryId` is missing, open inline notification detail.
- If type is `payment_failed` and `deliveryId` exists, route to `/(sender)/payments/:deliveryId/recover`.
- If type is `payment_confirmed` and `deliveryId` exists, route to `/(sender)/receipts/:deliveryId`.
- If receipt route rejects unavailable state, it owns fallback.
- If type is `refund_completed` and `deliveryId` exists, route to `/(sender)/deliveries/:deliveryId/refund`.
- If type is `issue_updated` and no issue ID exists, route to delivery detail, not support thread.
- Delivery movement types route to timeline when movement context matters.
- `delivery_created`, `ready_for_pickup`, and `delivered` route to delivery detail.

Type label mapping:
- `delivery_created`: `Delivery created`
- `payment_confirmed`: `Payment confirmed`
- `payment_failed`: `Payment failed`
- `received_at_origin`: `Received at origin`
- `dispatched`: `Dispatched`
- `received_at_destination`: `Received at destination`
- `ready_for_pickup`: `Ready for pickup`
- `out_for_delivery`: `Out for delivery`
- `delivered`: `Delivered`
- `issue_updated`: `Issue updated`
- `refund_completed`: `Refund completed`

## Information Architecture
Top-to-bottom order:
1. Header.
2. Attention summary.
3. Filter chips.
4. Notification list.
5. Empty, filtered-empty, offline, stale, or error panel.

Header:
- Back control or tab header depending app navigation.
- Title: `Notifications`.
- Optional settings action routes to settings.

Attention summary:
- Unread count.
- Latest notification time.
- Refresh state.
- Compact copy explaining inbox purpose.

Filter chips:
- `All`
- `Unread`
- `Delivery`
- `Payment`
- `Refund`
- `Issues`

List rows:
- Unread marker.
- Type icon.
- Title.
- Body.
- Time.
- Route hint.
- Optional delivery context if available from `deliveryId` only.

Inline detail sheet:
- Used only for notifications without target route.
- Shows title, body, created time, and status.
- Does not show raw type.

## Visual System
Visual thesis:
- A clear operational inbox with strong unread hierarchy and restrained status color.

Design direction:
- Use a calm neutral surface.
- Unread rows use a left rail, dot, or bold title.
- Read rows reduce emphasis but remain legible.
- Filter chips use strong selected state.
- Critical payment failed rows can use warning accent.
- Refund complete uses success accent.
- Delivery movement uses neutral blue or ink.

Color roles:
- `notifications.surface`
- `notifications.row`
- `notifications.unread`
- `notifications.read`
- `notifications.delivery`
- `notifications.payment`
- `notifications.refund`
- `notifications.issue`
- `notifications.warning`
- `notifications.divider`

Color constraints:
- Do not use color alone for unread.
- Unread has text weight, marker, and accessibility label.
- Payment failed uses warning icon plus text.
- High contrast mode adds outlines.

Typography:
- Header title medium-large.
- Row title medium weight.
- Unread row title stronger.
- Body copy two lines maximum by default.
- Time stamp compact but readable.

Spacing:
- Rows must be tall enough for touch targets.
- Filter chips horizontal scroll only if they do not fit.
- Empty state should not feel like an error.

Motion:
- Pull-to-refresh uses platform-native motion.
- New data can fade in.
- No attention-stealing unread animation.
- Respect reduced motion.

## Layout
Base layout:
- Safe-area aware.
- Scrollable list.
- Sticky filter bar optional only if app standard exists.
- Pull-to-refresh optional if app standard exists.

Small phones:
- Filter chips horizontal scroll.
- Row body clamps to two lines.
- Route hint moves below time if needed.

Large phones:
- Rows can show group label and time on same line.

Landscape:
- Single-column list.
- Avoid two-pane notification detail.

Offline:
- Cached list can render with stale banner.
- No-cache offline renders offline panel.

## Component Inventory
Screen components:
- `SenderNotificationsScreen`
- `NotificationsHeader`
- `NotificationsAttentionSummary`
- `NotificationFilterChips`
- `NotificationList`
- `NotificationRow`
- `NotificationInlineDetailSheet`
- `NotificationsEmptyPanel`
- `NotificationsFilteredEmptyPanel`
- `NotificationsOfflinePanel`
- `NotificationsErrorPanel`
- `NotificationsStaleBanner`
- `NotificationsSkeleton`

Shared components allowed:
- App header.
- Badge.
- Chip.
- List row.
- Pull-to-refresh wrapper.
- Inline alert.
- Empty state.
- Toast.

Components not allowed:
- Admin outbound notification table.
- Retry outbound notification action.
- Mark-read button.
- Delete notification button.
- Push permission prompt.
- Notification settings form.
- Provider delivery status card.

## Screen States
### Loading
Trigger:
- `list_notifications` pending with no cache.

UI:
- Header.
- Attention summary skeleton.
- Filter chip skeleton.
- List row skeletons.

Copy:
- `Loading notifications`
- `Checking recent delivery and account updates.`

Accessibility:
- Announce loading once.

### Ready
Trigger:
- Notifications loaded and current filter has rows.

UI:
- Summary.
- Filters.
- Rows sorted newest first as returned or by `createdAt` descending if response order is not guaranteed.
- Refresh control.

Unread count:
- Count notifications where `status=unread`.
- Do not count local row taps as read.

### Empty
Trigger:
- Response contains no notifications.

Headline:
- `No notifications yet.`

Body:
- `Delivery, payment, refund, and support updates will appear here.`

Primary action:
- `Open home`

Secondary action:
- `Open history`

### Filtered Empty
Trigger:
- Notifications exist, but selected filter has no rows.

Headline:
- `No updates in this filter.`

Body:
- `Try All or refresh to check for recent updates.`

Primary action:
- `Clear filter`

### Refreshing
Trigger:
- Pull-to-refresh or refresh action.

UI:
- Keep current rows visible.
- Show top progress indicator.
- Disable repeated refresh taps.

Success:
- Announce `Notifications updated.`

Failure:
- Keep current rows.
- Show banner: `Could not refresh. Last loaded notifications are still shown.`

### Stale Cache
Trigger:
- Cached notifications shown while refresh failed or network is unavailable.

Banner:
- `Showing last loaded notifications.`

Body:
- `Refresh when online to confirm the latest updates.`

### Offline
Trigger:
- Device offline and no usable cached list.

Headline:
- `Notifications need internet.`

Body:
- `Connect to the internet to load recent delivery, payment, refund, and support updates.`

Primary action:
- `Try again`

### API Error
Trigger:
- Non-auth read failure.

Headline:
- `We could not load notifications.`

Body:
- `Try again. Your delivery and support records are still available from their screens.`

Primary action:
- `Try again`

Secondary action:
- `Open history`

### Not Authorized
Trigger:
- `FORBIDDEN`.

Headline:
- `You cannot view these notifications.`

Body:
- `Sign in with the sender account tied to these deliveries.`

Primary action:
- `Go back`

### Session Expired
Trigger:
- Auth token expired or missing.

Headline:
- `Sign in to view notifications.`

Body:
- `Notifications are private to your sender account.`

Primary action:
- `Sign in`

## Copy System
Voice:
- Brief.
- Specific.
- Operational.
- Calm.
- Action-oriented.

Words to prefer:
- `updates`
- `delivery`
- `payment`
- `refund`
- `support`
- `unread`
- `recent`
- `open`
- `refresh`

Words to avoid:
- `blast`
- `campaign`
- `outbound`
- `provider`
- `retry delivery`
- `dead letter`
- `mark all read` until backend supports it.

Headlines:
- Inbox: `Notifications`
- Empty: `No notifications yet.`
- Filtered empty: `No updates in this filter.`
- Offline: `Notifications need internet.`
- Error: `We could not load notifications.`

Summary copy:
- `You have {count} unread update.`
- `You have {count} unread updates.`
- `All caught up.`

Route hints:
- Delivery movement: `Open timeline`
- Delivery created: `Open delivery`
- Payment failed: `Resolve payment`
- Payment confirmed: `View receipt`
- Refund completed: `Track refund`
- Issue updated: `Open delivery`
- Missing delivery ID: `View update`

## Data Formatting
Time:
- Use relative time for recent updates under 24 hours.
- Use short absolute date after 24 hours.
- Preserve ISO datetime internally.

Unread:
- Backend `status=unread`.
- `readAt` appears only for backend read records.
- If `readAt` missing for `read`, show read styling without read date.

Title:
- Use backend `title` after validating schema.
- Do not rewrite title unless localization layer requires it.

Body:
- Use backend `body`.
- Clamp to two lines in list.
- Full body appears in inline detail sheet.

Delivery:
- Use `deliveryId` only for routing.
- Do not show delivery ID as dominant copy unless no other context exists.

## Interaction Rules
Filter:
- Default filter: `All`.
- Filter does not refetch.
- Filter operates on loaded notifications.
- Filter selection persists during current screen session only.

Filter mapping:
- `Unread`: `status=unread`
- `Delivery`: delivery movement and delivery created types.
- `Payment`: `payment_confirmed`, `payment_failed`
- `Refund`: `refund_completed`
- `Issues`: `issue_updated`

Row tap:
- Determine target from type and delivery ID.
- If target exists, navigate.
- If no target exists, open inline detail sheet.
- Do not mutate persistent read state.

Refresh:
- Refetch `list_notifications`.
- Preserve selected filter.
- Preserve scroll position if result set is materially the same.
- If new rows arrive, keep user near current position and show small banner: `New updates loaded.`

Inline detail sheet:
- Shows title, body, time, status.
- Action button only when a safe target exists.
- Close button.

Unread visual state:
- Read from backend only.
- Tapping row can add ephemeral pressed state, not read state.

## Accessibility
Screen reader:
- Announce unread count after load.
- Each row includes title, body, time, group, and read state.
- Filter chips are accessible tabs or radio options.
- Refresh result uses status message.

Row labels:
- `Unread, Payment failed, Payment could not be confirmed, 10 minutes ago, Resolve payment.`
- `Read, Delivered, Your delivery was delivered, May 19, Open delivery.`

Focus order:
1. Header.
2. Attention summary.
3. Filter chips.
4. Notification rows.
5. Empty/error actions.

Dynamic type:
- Rows grow vertically.
- Body can expand to three lines at larger text.
- Filter chips remain tappable.

Reduced motion:
- Disable row insert animations.
- Keep refresh feedback accessible.

High contrast:
- Unread marker has shape and text.
- Selected filter has border.
- Critical rows use icon and label.

Touch targets:
- Row minimum `44x44`.
- Filter chips minimum `44` points high.

## Privacy And Security
Hide:
- Receiver phone.
- Payer phone.
- Payment ID.
- Provider reference.
- Outbound notification ID.
- Dedupe key.
- Staff IDs.
- Actor IDs.
- Raw delivery metadata.
- SMS provider status.
- Retry counts.
- Internal dispatch errors.

Show:
- Sender-safe notification title.
- Sender-safe body.
- Type group.
- Read/unread status.
- Created time.
- Delivery route action when `deliveryId` exists.

Security:
- Require authenticated sender.
- Respect backend `FORBIDDEN`.
- Clear notification cache on sign out.
- Do not put sensitive body text in analytics.
- Do not include notification body in route params.

## Analytics
Events:
- `sender_notifications_viewed`
- `sender_notifications_loaded`
- `sender_notifications_filter_selected`
- `sender_notification_tapped`
- `sender_notification_inline_detail_opened`
- `sender_notifications_refresh_tapped`
- `sender_notifications_refreshed`
- `sender_notifications_refresh_failed`
- `sender_notifications_empty_shown`
- `sender_notifications_offline_shown`
- `sender_notifications_error_shown`

Allowed properties:
- `notificationId`
- `type`
- `status`
- `hasDeliveryId`
- `targetRouteType`
- `selectedFilter`
- `unreadCount`
- `isStale`
- `entryPoint`
- `errorCode`

Forbidden properties:
- `title`
- `body`
- `deliveryId` in broad analytics if policy treats it as sensitive.
- `paymentId`
- `providerReference`
- `receiverPhone`
- `dedupeKey`
- `outboundNotificationId`
- `rawMetadata`

Activation:
- Sender taps a notification with a target route.
- Sender resolves a payment failed update by opening recovery.
- Sender opens refund status from refund completed update.

## Error Mapping
Backend error mapping:
| Error | UI title | Primary action | Notes |
| --- | --- | --- | --- |
| `FORBIDDEN` | `You cannot view these notifications.` | `Go back` | Avoid revealing account existence. |
| `RATE_LIMITED` | `Too many refresh attempts.` | `Try later` | Keep current list if cached. |
| `INTERNAL_ERROR` | `We could not load notifications.` | `Try again` | Open history secondary. |
| `VALIDATION_ERROR` | `We could not load notifications.` | `Try again` | Usually invalid query limit. |

No not-found:
- List endpoint should not have item-level not found behavior.

Offline with cache:
- Show cached list with stale banner.

Offline without cache:
- Show offline panel.

## Edge Cases
Notification without delivery ID:
- Open inline detail sheet.
- No broken route.

Unknown future notification type:
- Current schema rejects unknown values.
- If future type appears after contract update, show fallback group only after shared schema update.

Read notification with no `readAt`:
- Style as read.
- Hide read date.

Unread notification older than current page:
- Still unread.
- Keep unread priority regardless of age.

More than 100 notifications:
- Current query max is `100`.
- Use backend limit.
- Do not implement cursor pagination unless backend adds it.

Long body:
- Clamp in list.
- Full body in detail sheet.

Duplicate notifications:
- Backend dedupe handles queue creation.
- If duplicates still appear, render what backend returns; do not locally dedupe unless product defines it.

Payment confirmed without receipt ready:
- Route to receipt detail.
- Receipt route owns unavailable state.

Issue updated without issue ID:
- Route to delivery detail.
- Do not invent support issue route.

Refund completed without delivery ID:
- Inline detail sheet.
- Do not route to refund screen.

## Performance
Initial load:
- Call `list_notifications` with default limit or `limit=50`.
- Render skeleton quickly.

Refresh:
- Refetch list.
- Debounce repeated refresh.
- Preserve selected filter.

Caching:
- Cache per authenticated user.
- Invalidate after app receives push deep link.
- Clear on sign out.
- Stale cache must be labeled.

Rendering:
- Use virtualized list if available.
- Avoid heavy icons.
- Avoid loading delivery detail for every row.
- Do not enrich every notification by fetching delivery detail.

## Testing Requirements
Unit tests:
- Maps notification types to groups.
- Maps notification types to route targets.
- Handles missing delivery ID with inline detail.
- Computes unread count from backend status.
- Does not change read status on row tap.
- Filters all, unread, delivery, payment, refund, and issues.
- Clamps long body in list model.

Component tests:
- `screen-sender-notifications` renders loading.
- Ready state renders unread count.
- Empty state renders copy and actions.
- Filtered empty state appears.
- Offline no-cache state appears.
- Stale cache banner appears.
- Row tap routes payment failed to recovery.
- Row tap routes refund completed to refund status.
- Row tap for issue updated routes to delivery detail.
- Missing delivery ID opens detail sheet.

Integration tests:
- Calls `list_notifications`.
- Sends only supported `limit`.
- Does not call mark-read mutation.
- Does not call admin outbound notification endpoints.
- Handles `FORBIDDEN`.
- Handles `RATE_LIMITED`.
- Handles API failure with cached list.

E2E tests:
- Sender opens notifications from home badge and sees unread notifications.
- Sender filters unread notifications.
- Sender opens payment failed notification and lands on payment recovery.
- Sender opens refund completed notification and lands on refund status.
- Sender opens delivery movement notification and lands on timeline or delivery detail.
- Sender refreshes notifications successfully.

Accessibility tests:
- Unread count announced.
- Rows announce read/unread state.
- Filter chips are navigable.
- Refresh result announced.
- Large text does not clip rows.
- High contrast shows unread markers.
- Reduced motion disables row animations.

## Test IDs
Screen:
- `screen-sender-notifications`

Header and summary:
- `notifications-header`
- `notifications-attention-summary`
- `notifications-unread-count`
- `notifications-latest-time`

Filters:
- `notifications-filter-all`
- `notifications-filter-unread`
- `notifications-filter-delivery`
- `notifications-filter-payment`
- `notifications-filter-refund`
- `notifications-filter-issues`

List:
- `notifications-list`
- `notification-row`
- `notification-row-unread-marker`
- `notification-row-title`
- `notification-row-body`
- `notification-row-time`
- `notification-row-route-hint`

Detail:
- `notification-detail-sheet`
- `notification-detail-title`
- `notification-detail-body`
- `notification-detail-action`

States:
- `notifications-loading-state`
- `notifications-empty-state`
- `notifications-filtered-empty-state`
- `notifications-offline-state`
- `notifications-error-state`
- `notifications-stale-banner`

Actions:
- `notifications-refresh-action`
- `notifications-open-home-action`
- `notifications-open-history-action`
- `notifications-settings-action`

## Implementation Notes For Claude Code
Data hooks:
- Use `useListNotificationsQuery({ limit: 50 })`.
- If the query hook does not exist, add typed read hook only.
- Do not add notification mutation hooks until backend supports them.

State model:
- `selectedFilter`
- `isRefreshing`
- `isStale`
- `inlineDetailNotification`

Pure helpers:
- `getNotificationGroup(type)`.
- `getNotificationTypeLabel(type)`.
- `getNotificationTarget(notification)`.
- `filterNotifications(notifications, selectedFilter)`.
- `getUnreadCount(notifications)`.
- `formatNotificationTime(createdAt)`.

Target model:
- `delivery_detail`
- `delivery_timeline`
- `payment_recovery`
- `receipt_detail`
- `refund_status`
- `inline_detail`

Do not implement:
- Mark read.
- Mark all read.
- Delete notification.
- Admin outbound notification monitoring.
- Push permission prompt.
- Notification preference settings.
- Delivery detail enrichment per row.

## QA Review Checklist
Contract:
- Uses `notificationListResponseSchema`.
- Uses `notificationResponseSchema`.
- Uses only `list_notifications`.
- Does not require mark-read endpoint.
- Does not require notification detail endpoint.

UX:
- Unread count is obvious.
- Filters are understandable.
- Rows route correctly.
- Missing delivery ID opens detail sheet.
- Empty state explains value.
- Stale state is clearly labeled.

Accessibility:
- Read/unread is announced.
- Filter chips are accessible.
- Refresh updates are announced.
- Large text works.
- High contrast works.

Privacy:
- No provider references.
- No payment IDs.
- No receiver phone.
- No outbound notification IDs.
- No dedupe keys.
- No body text in analytics.

## Open Backend Gaps To Track Outside This Screen
These are not blockers for v1:

- Mark notification read.
- Mark all notifications read.
- Notification detail endpoint.
- Notification deletion or archive.
- Issue ID in `issue_updated` notification payload.
- Cursor pagination.
- Notification preferences.
- Push permission and device token registration.

Current decision:
- Build a read-only sender inbox.
- Use backend `status` as persistent read/unread authority.
- Route only when `deliveryId` and type support a safe target.
- Use inline detail for non-routable notifications.

## Build Sequence
1. Add route file for `/(sender)/notifications`.
2. Add typed `list_notifications` query usage.
3. Add notification type/group/target mapping helpers.
4. Add attention summary.
5. Add filter chips.
6. Add virtualized notification list.
7. Add inline detail sheet for non-routable rows.
8. Add empty, filtered-empty, loading, offline, stale, error, unauthorized, and session states.
9. Add analytics with safe properties only.
10. Add accessibility labels and status announcements.
11. Add unit, component, integration, and E2E coverage.
12. Run lint, typecheck, coverage, and critical coverage.

## Final Acceptance Statement
Claude Code should build `SenderNotifications` as a read-only sender inbox powered by `list_notifications`. It must show unread/read state from backend status, filter notification groups, route known types safely, handle missing delivery IDs with an inline detail sheet, avoid unsupported mark-read/delete/admin-outbound behavior, protect provider/payment/receiver/staff/internal metadata, and cover loading, empty, filtered-empty, refresh, stale, offline, error, unauthorized, and session states.
