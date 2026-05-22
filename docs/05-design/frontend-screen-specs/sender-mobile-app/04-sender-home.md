# Sender Home Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID            | `SenderHome`                                                                                                                                                                                                             |
| App                  | `apps/mobile`                                                                                                                                                                                                            |
| Route                | `/(sender)/home`                                                                                                                                                                                                         |
| Primary test ID      | `screen-sender-home`                                                                                                                                                                                                     |
| Source inventory     | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                            |
| Build priority       | `P0 Launch Critical`                                                                                                                                                                                                     |
| Backend dependencies | `list_deliveries`, `list_notifications`                                                                                                                                                                                  |
| Related routes       | `/(sender)/create`, `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/history`, `/(sender)/notifications`, `/(sender)/profile`, `/(sender)/settings`, `/(auth)/sender/sign-in` |
| Required states      | `loading`, `empty`, `offline`, `error`                                                                                                                                                                                   |

## Product Job

This screen is the authenticated sender command center. It must show the sender what needs attention now, summarize active deliveries, surface recent notifications, and provide a clear route to create a new delivery without letting the home screen invent status, pricing, payment, proof, refund, or issue authority.

The sender should be able to:

- Start a new delivery quickly.
- See whether any delivery needs payment, pickup, tracking review, or issue attention.
- Open active delivery details.
- Open the full tracking timeline for a delivery.
- See unread or recent notifications.
- Recover when data is loading, empty, offline, or unavailable.
- Understand when data is cached and may be stale.

This screen is not the delivery creation form, payment checkout, delivery detail, timeline, notification inbox, support thread, receipt, refund tracker, cancellation form, or profile editor.

## Audience

Primary audience:

- Authenticated senders with one or more active deliveries.
- First-time senders who just completed phone sign-in.
- Repeat small-business senders checking package status and next actions.

Secondary audience:

- Senders on weak mobile data.
- Senders with no deliveries yet.
- Senders with unresolved payment or issue notifications.
- QA engineers validating authenticated mobile data surfaces.
- Claude Code implementing the sender mobile app.

## User State

The sender is task-oriented. They may be opening the app to create a delivery, check whether payment is done, see if a package reached a station, share status with a receiver, or understand why something is delayed. The screen must prioritize actions and current truth over decorative dashboard content.

The screen must:

- Lead with the next sender action.
- Show active deliveries before historical content.
- Make stale/offline data explicit.
- Avoid hiding payment or issue blockers.
- Avoid showing staff-only custody details.
- Avoid pretending notifications are real-time if data is cached.

## Primary Action

Primary CTA:

- `Create delivery`

Secondary actions:

- `View all deliveries`
- `View notifications`

Delivery-card actions:

- `Open delivery`
- `View timeline`
- `Complete payment` when `paymentStatus=pending` or `paymentStatus=failed`
- `View issue` only when issue route/context exists

CTA behavior:

- `Create delivery` routes to `/(sender)/create`.
- `View all deliveries` routes to `/(sender)/history`.
- `View notifications` routes to `/(sender)/notifications`.
- Delivery card tap routes to `/(sender)/deliveries/:deliveryId`.
- Timeline action routes to `/(sender)/deliveries/:deliveryId/timeline`.

## First Meaningful Value

First meaningful value on sender home is immediate orientation:

- What should I do next?
- Which deliveries are active?
- Are there payment, issue, or delivery updates?
- Can I start a new delivery?

The screen must deliver that value even when the sender has no deliveries:

- Empty state must make `Create delivery` obvious.
- It must explain what happens next after creating a delivery.
- It must not feel like a blank account.

## Main Tension

The home screen must be useful without becoming a noisy mini-admin console. It needs enough operational truth to support trust, but not so much detail that senders see internal staff data, raw audit metadata, or confusing lifecycle mechanics. The right design is action-first, not metric-first.

## Design Brief

User and job:

- A sender wants to manage active deliveries and start the next one.

Context of use:

- Authenticated, repeatable, mobile-first, status-checking, often on weak networks.

Entry point:

- Successful sign-in, app launch with valid session, protected route fallback, bottom tab, or return from delivery creation.

Success state:

- Sender starts a delivery, opens an active delivery, opens notifications, or understands there is nothing active yet.

Primary action:

- `Create delivery`

Navigation model:

- Authenticated sender tab or stack root.

Density:

- Balanced. The home screen should scan fast but carry real status.

Visual thesis:

- A premium sender control board: warm, compact, route-aware, and focused on the next action rather than decorative charts.

Restraint rule:

- Avoid map walls, metric panels, staff labels, long lifecycle tables, and too many equal cards.

Product lens:

- Trust-critical operational overview.

System stance:

- Extend the sender mobile language from onboarding and auth into a real product workspace.

Interaction thesis:

- Pull-to-refresh, stable create CTA, tactile delivery cards, and clear stale-data indicators.

Signature move:

- A "Next move" panel that converts backend status into a sender-readable action without changing backend authority.

Activation event:

- Sender opens `/(sender)/create` or an active delivery detail from home.

## Elite Quality Gate

This spec is not closed unless the resulting screen feels like a serious operational home for package sending in Africa, not a generic delivery app dashboard.

Non-negotiable quality requirements:

- The first viewport must show `Create delivery` and current delivery orientation.
- The screen must call only authenticated sender-safe read queries on load.
- The screen must not perform delivery, payment, cancellation, refund, or issue mutations.
- The screen must use backend response state as authority.
- The screen must show cached/stale markers when offline or serving cached reads.
- The empty state must drive first delivery creation.
- Active deliveries must be prioritized over closed history.
- Payment blockers must be visible when returned by delivery list state.
- Notification preview must not expose internal outbound notification metadata.
- Staff IDs, provider references, audit metadata, and raw issue internals must not appear.
- The screen must remain usable on low bandwidth and small phones.
- The screen must support screen reader, large text, high contrast, reduced motion, and pull-to-refresh accessibility.

Closure rule:

- If a sender cannot tell what to do next within 10 seconds, the screen remains open.
- If the screen hides pending or failed payment behind decorative status, the screen remains open.
- If offline data is not marked as cached/stale, the screen remains open.
- If the screen exposes staff-only fields, the screen remains open.
- If any mutation occurs from home without moving to the owning screen, the screen remains open.

## Inspiration And Context Inputs

Use these sources as product and UX context, not as copy, layout, or branding to copy:

- Apple Human Interface Guidelines support clear navigation, lists, controls, status feedback, and platform-native mobile behavior.
- Material Design list and card guidance supports scannable item rows, explicit actions, and consistent hierarchy.
- Nielsen Norman Group mobile dashboard guidance supports showing action-oriented summaries instead of dense desktop-style dashboards.
- W3C WCAG 2.2 guidance supports loading/status messaging, target size, focus order, accessible names, and error identification.
- Kra offline-first strategy defines the sender app as online-first with cached read fallback, while operational roles own durable offline action queues.

Reference links:

- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/lists/overview
- https://m3.material.io/components/cards/overview
- https://www.nngroup.com/articles/dashboard-design/
- https://www.w3.org/WAI/WCAG22/quickref/
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`

Do not copy external app layouts, courier app screenshots, brand assets, icons, maps, or source code.

## Product Assumptions

Assumptions for v1:

- Sender is authenticated before this screen renders.
- Delivery reads use `GET /v1/deliveries`.
- Notification reads use `GET /v1/notifications`.
- Sender app is online-first with cached read fallback.
- Offline mutations are not supported for sender home.
- Staff and courier offline action outboxes do not apply to this screen.
- Sender can start a new delivery from home.
- History and full notification inbox are separate screens.

If sender offline delivery creation becomes a future requirement, it must be specified separately and must not be implied by this screen.

## Non-Goals

Do not implement these in this screen:

- Delivery creation form.
- Station selection.
- Receiver details.
- Package details.
- Quote calculation.
- Payment initialization.
- Payment verification.
- Cancellation request.
- Refund status.
- Issue creation.
- Support conversation.
- Full delivery history filters.
- Full notification inbox.
- Profile editing.
- Settings.
- Staff custody operations.
- Offline mutation outbox.
- Map navigation.

## Route Rules

### Route

- Render at `/(sender)/home`.
- Must require authenticated sender session.
- Must not render for staff, admin, receiver, or unauthenticated users.
- Must redirect unauthenticated users to `/(auth)/sender/sign-in` with safe `next=/(sender)/home`.

### Accepted Query Params

Allowed:

- `source`: `signin`, `create_success`, `payment_return`, `notification`, `session_restore`, `unknown`.
- `highlightDeliveryId`: optional only if it matches a delivery returned by `list_deliveries`.

Rules:

- Unknown params are ignored.
- Do not trust `highlightDeliveryId` unless it appears in authenticated response data.
- Do not show delivery details from query params.
- Do not include phone, tracking code, payment references, receiver phone, or staff data in params.

### Outbound Routes

Allowed:

- `/(sender)/create`
- `/(sender)/deliveries/:deliveryId`
- `/(sender)/deliveries/:deliveryId/timeline`
- `/(sender)/history`
- `/(sender)/notifications`
- `/(sender)/profile`
- `/(sender)/settings`
- `/(auth)/sender/sign-in` only for sign-out or session expiry

Blocked:

- Staff routes.
- Admin routes.
- Receiver private routes.
- Payment provider routes unless routed through the payment method/processing screens.
- Issue creation unless tied to a specific delivery route.

## Data Contract

### `list_deliveries`

Operation:

- `GET /v1/deliveries`

Auth:

- `authenticated`

Query:

- `status` optional.
- `paymentStatus` optional.
- `limit` optional, max `100`.

Home usage:

- Initial home query should request a capped list suitable for active overview.
- Recommended limit: `10`.
- Home may not filter by status initially unless product chooses active-only tabs.
- Full filtering belongs to `SenderDeliveryHistory`.

Response fields available:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Fields not available from list response:

- Package description.
- Package value.
- Receiver phone.
- Quote detail.
- Current custody actor ID.
- Driver ID.
- Courier ID.
- Final proof.
- Issue detail.

Rules:

- Do not invent missing detail.
- Link to delivery detail for more.
- Do not show staff actor IDs.
- Do not show receiver phone on home.

### `list_notifications`

Operation:

- `GET /v1/notifications`

Auth:

- `authenticated`

Query:

- `limit` optional, max `100`.

Home usage:

- Recommended limit: `5`.
- Show unread count if available from returned records.
- Show latest notification preview.
- Full notification management belongs to `SenderNotifications`.

Response fields available:

- `notificationId`
- `type`
- `status`
- `title`
- `body`
- `deliveryId`
- `createdAt`
- `readAt`

Rules:

- Do not show outbound provider status.
- Do not show dedupe keys.
- Do not show internal recipient identifiers.
- Do not mark notifications read from home unless explicit backend mutation exists and user action owns it.

## Data Loading Rules

Initial load:

- Fetch deliveries and notifications in parallel after session validation.
- Show skeleton state if no cached data is available.
- Show cached data immediately if safe and mark it stale while refreshing.

Refresh:

- Pull-to-refresh triggers both reads.
- Refresh indicator must be accessible.
- Do not block existing content while refreshing.
- Errors during refresh show non-blocking banner if stale content remains.

No-store backend:

- Backend sets no-store responses for authenticated reads.
- Client may still maintain in-app cache for UX, but must mark cached/stale state explicitly when offline.

Data priority:

1. Session validity.
2. Cached/stale visible data if available.
3. Fresh deliveries.
4. Fresh notifications.
5. Error/empty/offline state.

## Status Interpretation

Home must translate backend status into sender-readable next actions without changing backend authority.

Delivery status labels should align with public tracking labels:

- `created`: `Booking created`
- `received_at_origin`: `Received at origin station`
- `awaiting_driver_assignment`: `Awaiting dispatch`
- `assigned_to_driver`: `Assigned to driver`
- `dispatched_from_origin`: `Left origin station`
- `in_transit`: `In transit`
- `received_at_destination`: `Arrived at destination station`
- `awaiting_receiver_pickup`: `Ready for pickup`
- `awaiting_final_mile_assignment`: `Waiting for doorstep courier`
- `assigned_for_final_mile`: `Assigned for doorstep delivery`
- `out_for_delivery`: `Out for delivery`
- `delivered`: `Delivered`

Payment status labels:

- `pending`: `Payment pending`
- `confirmed`: `Payment confirmed`
- `failed`: `Payment failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

Next-action rules:

- If `paymentStatus=pending`, next action is `Complete payment`.
- If `paymentStatus=failed`, next action is `Retry payment`.
- If `currentStatus=created` and payment is confirmed, next action is `Prepare for station intake`.
- If `currentStatus=received_at_origin`, next action is `Track dispatch`.
- If `currentStatus=in_transit`, next action is `View timeline`.
- If `currentStatus=received_at_destination`, next action depends on doorstep flag and status.
- If `currentStatus=awaiting_receiver_pickup`, next action is `Share pickup update`.
- If `currentStatus=out_for_delivery`, next action is `Track delivery`.
- If `currentStatus=delivered`, next action is `View receipt` or `View timeline`.

Rules:

- Do not infer refund eligibility from home.
- Do not infer issue detail from list response unless notification says issue updated.
- Do not show exact ETA unless backend exposes it.
- Do not calculate route time locally.

## State Model

Required states:

- `loading`
- `empty`
- `offline`
- `error`

Recommended internal states:

- `initial_loading`
- `ready`
- `refreshing`
- `empty`
- `offline_with_cache`
- `offline_without_cache`
- `partial_error`
- `full_error`
- `session_expired`
- `unauthorized`

State mapping:

- `initial_loading` maps to `loading`.
- `empty` maps to `empty`.
- `offline_with_cache` and `offline_without_cache` map to `offline`.
- `partial_error` and `full_error` map to `error`.

Rules:

- Use cached content when available.
- Show empty only when fresh delivery list returns no deliveries and no active cached deliveries exist.
- Show full error only when no usable content can be shown.
- Show partial error as a banner when one query fails and the other succeeds.

## State Details

### Loading

Purpose:

- Orient while first authenticated reads load.

UI:

- Header skeleton.
- Next move skeleton.
- Delivery card skeleton.
- Notification preview skeleton.
- Primary create button remains visible if session is valid.

Copy:

- Status label: `Loading your sender home.`

Rules:

- Do not show spinner-only page.
- Do not show old unauthenticated data.
- Do not block sign-out/settings route if shell owns it.

### Empty

Purpose:

- Convert a new sender into first delivery creation.

UI:

- Calm empty hero.
- Primary CTA.
- Three-step explanation.
- Optional policy links.

Copy:

- Title: `No deliveries yet`
- Body: `Create your first delivery to get a price, pay, and track each handoff from station intake to receiver update.`
- Primary CTA: `Create delivery`
- Secondary: `How Kra works`

Rules:

- Empty state must not look like an error.
- Do not show blank list.
- Do not require scrolling to find create action.
- Do not show delivery history route as primary.

### Offline With Cache

Purpose:

- Keep sender oriented with last-known data.

UI:

- Offline banner.
- Stale marker near timestamp.
- Cached delivery cards.
- Disabled or caution-styled refresh action.

Copy:

- Banner title: `You are viewing cached updates`
- Banner body: `Reconnect to refresh delivery and notification status.`
- Timestamp: `Last updated {relativeTime}`

Rules:

- Keep delivery cards openable only if detail cache exists or route can show its own offline state.
- Do not allow payment, cancellation, or issue actions directly from cached home.
- Create delivery CTA may remain visible, but route must handle online requirement before submission.

### Offline Without Cache

Purpose:

- Explain why home cannot show authenticated data.

Copy:

- Title: `Connection needed`
- Body: `Reconnect to load your deliveries and notifications.`
- Primary CTA: `Try again`
- Secondary CTA: `Create delivery` if route can show offline-safe start only; otherwise hide.

Rules:

- Do not show empty state when offline and no cache exists.
- Do not sign out automatically.
- Do not say there are no deliveries.

### Error

Purpose:

- Recover from unavailable backend or authorization failures.

Full error copy:

- Title: `Home could not load`
- Body: `We could not load your deliveries and notifications. Check your connection and try again.`
- Primary CTA: `Try again`

Partial error:

- Banner: `Some updates could not refresh. Pull down to try again.`

Auth error:

- Title: `Sign in again to continue`
- Primary CTA: `Sign in`

Rules:

- Distinguish session expiry from backend unavailable.
- Do not show internal error codes.
- Do not erase cached content on refresh error.

## Information Architecture

Screen order:

1. Sender shell header.
2. Next move panel.
3. Primary create delivery CTA.
4. Active deliveries section.
5. Notification preview section.
6. Secondary links.
7. Safe footer state markers where needed.

First viewport must include:

- Greeting or context title.
- Create delivery CTA.
- Next move panel or empty state.
- At least one active delivery card when available.

Below fold:

- Additional active deliveries.
- Notification preview.
- History link.

Do not add:

- Dense charts.
- Revenue-style metrics.
- Internal queue counts.
- Staff workload.
- Payment provider diagnostics.
- Admin notices.

## Layout Blueprint

### Phone Baseline

Target widths:

- `320px`
- `360px`
- `393px`
- `430px`

Safe area:

- Respect top and bottom safe areas.
- If bottom tabs exist, content must clear tab bar.
- Floating create action must not block delivery cards or notifications.

Scroll:

- Use vertical scroll.
- Pull-to-refresh where platform supports it.
- Sticky action only if it does not compete with bottom tab.

### Header

Content:

- Title: `Home`
- Context line: `Your deliveries`
- Notification icon with unread indicator.
- Profile/settings action.

Rules:

- Do not show full phone number.
- Do not show sender ID.
- Do not show staff role.

### Next Move Panel

Purpose:

- Convert current backend state into one sender-readable priority.

Priority order:

1. Failed payment.
2. Pending payment.
3. Issue notification.
4. Ready for pickup or out for delivery.
5. Most recently updated active delivery.
6. Empty create-delivery prompt.

Rules:

- One priority only.
- Include delivery receiver name only if from `list_deliveries`.
- No receiver phone.
- No internal staff detail.

### Active Deliveries Section

Title:

- `Active deliveries`

Card content:

- Receiver name.
- Corridor summary using station display names if catalog is available.
- Status label.
- Payment label.
- Latest update relative time.
- Doorstep requested indicator when true.
- Primary card action.

Rules:

- Show up to `3` active delivery cards on home.
- Link to history for more.
- Delivered/closed deliveries may appear only if recently updated and product wants a recent activity section; primary home section remains active.

### Notification Preview Section

Title:

- `Recent updates`

Content:

- Up to `3` latest notifications.
- Unread indicator.
- Notification title.
- Short body.
- Time.
- Delivery link if `deliveryId` exists.

Rules:

- Do not show all notifications.
- Do not mark as read unless user opens notification detail/inbox and backend supports it.
- Do not expose provider delivery state.

### Empty State

Content:

- Title.
- Body.
- Primary CTA.
- Mini steps:
  - `Choose stations`
  - `Review price`
  - `Track handoffs`

Rules:

- Use empty state only for fresh successful zero-delivery response.
- Do not show while offline without cache.

## Component Contract

### `SenderHomeScreen`

Responsibilities:

- Require authenticated sender session.
- Query deliveries.
- Query notifications.
- Merge query states into home state.
- Render loading, empty, offline, and error.
- Render next move.
- Route to create, delivery detail, timeline, history, notifications, settings.
- Emit safe analytics.

Dependencies:

- Session provider.
- Router.
- API query hooks for deliveries and notifications.
- Network status provider.
- Cache/stale-state utility.
- Station display-name catalog.
- Analytics client.

Must not depend on:

- Payment mutation.
- Delivery mutation.
- Cancellation mutation.
- Issue mutation.
- Admin APIs.
- Staff route data.

### `SenderHomeHeader`

Purpose:

- Orient and provide top-level navigation.

Content:

- `Home`
- Optional greeting by safe display name if profile exists.
- Notification action.
- Profile/settings action.

Rules:

- Do not show phone number by default.
- Do not show account ID.
- Do not show role claim.

### `NextMovePanel`

Purpose:

- Show the most important action now.

Inputs:

- Delivery list.
- Notification list.
- Offline/stale state.

Outputs:

- Title.
- Body.
- Primary action.
- Related delivery ID when available.

Rules:

- Derived from backend data only.
- No local status authority.
- No unsupported ETA.
- No hidden mutation.

### `CreateDeliveryAction`

Purpose:

- Make new delivery creation obvious.

Behavior:

- Route to `/(sender)/create`.
- If offline, route may still open draft start only if create flow explicitly supports offline draft. Otherwise show online-required notice in create flow.

Rules:

- Keep visually dominant.
- Do not require scrolling to find on empty state.

### `DeliverySummaryCard`

Purpose:

- Show active delivery overview.

Inputs from `deliveryListResponseSchema`:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Rules:

- Do not show fields unavailable from list response.
- Do not show receiver phone.
- Do not show actor IDs.
- Do not show proof detail.
- Do not show issue detail.
- Do not calculate quote.

### `NotificationPreviewList`

Purpose:

- Surface recent sender updates without replacing inbox.

Inputs:

- `notificationId`
- `type`
- `status`
- `title`
- `body`
- `deliveryId`
- `createdAt`
- `readAt`

Rules:

- Show latest three.
- Preserve backend title/body unless copy layer has approved mapping.
- Do not expose internal notification metadata.

### `OfflineBanner`

Purpose:

- Mark stale data or no connection.

Variants:

- `with_cache`
- `without_cache`

Rules:

- Always visible when offline.
- Include last refresh time when known.
- Do not block scroll.

### `HomeErrorState`

Purpose:

- Recover from full load failure.

Content:

- Title.
- Body.
- Retry CTA.
- Sign-in CTA only for auth/session errors.

Rules:

- Avoid technical codes.
- Keep cached content if available.

## Exact Copy

### Header

Title:

- `Home`

Subtitle:

- `Your deliveries`

Notification action label:

- `Notifications`

Settings action label:

- `Settings`

### Primary CTA

Button:

- `Create delivery`

Accessibility label:

- `Create a new delivery`

### Next Move Panel

Default title:

- `Your next move`

Empty next move:

- Title: `Send your first package`
- Body: `Create a delivery to choose stations, review the price, and track each handoff.`
- CTA: `Create delivery`

Pending payment:

- Title: `Payment needed`
- Body: `Complete payment so Kra can move this package into transport.`
- CTA: `Complete payment`

Failed payment:

- Title: `Payment failed`
- Body: `Retry payment or choose another supported method before dispatch.`
- CTA: `Retry payment`

In transit:

- Title: `Package in transit`
- Body: `Open the timeline for the latest verified handoff.`
- CTA: `View timeline`

Ready for pickup:

- Title: `Receiver pickup ready`
- Body: `The package is ready at the destination station. Share the update with the receiver if needed.`
- CTA: `Open delivery`

Out for delivery:

- Title: `Out for delivery`
- Body: `Track the final-mile update and proof status.`
- CTA: `View timeline`

No urgent move:

- Title: `All active deliveries are moving`
- Body: `Open a delivery to view status, payment, and handoff updates.`
- CTA: `View deliveries`

### Active Deliveries

Section title:

- `Active deliveries`

View all:

- `View all`

Card labels:

- `Status`
- `Payment`
- `Latest update`
- `Doorstep`

Doorstep true:

- `Doorstep requested`

Doorstep false:

- `Station pickup`

### Notifications

Section title:

- `Recent updates`

View all:

- `View notifications`

Empty notification preview:

- `No new updates.`

Unread label:

- `Unread`

### Loading

Status:

- `Loading your sender home.`

### Empty

Title:

- `No deliveries yet`

Body:

- `Create your first delivery to get a price, pay, and track each handoff from station intake to receiver update.`

Primary CTA:

- `Create delivery`

Secondary:

- `How Kra works`

Mini steps:

- `Choose stations`
- `Review price`
- `Track handoffs`

### Offline With Cache

Title:

- `You are viewing cached updates`

Body:

- `Reconnect to refresh delivery and notification status.`

Timestamp:

- `Last updated {relativeTime}`

### Offline Without Cache

Title:

- `Connection needed`

Body:

- `Reconnect to load your deliveries and notifications.`

Primary CTA:

- `Try again`

### Error

Title:

- `Home could not load`

Body:

- `We could not load your deliveries and notifications. Check your connection and try again.`

Primary CTA:

- `Try again`

Partial error banner:

- `Some updates could not refresh. Pull down to try again.`

Session expired:

- `Sign in again to continue.`

## Copy Rules

Use:

- `delivery`
- `package`
- `handoff`
- `payment`
- `status`
- `timeline`
- `receiver`
- `station`
- `updates`

Avoid:

- `job`
- `manifest`
- `assignment`
- `dispatch console`
- `actor ID`
- `provider reference`
- `audit event`
- `internal queue`
- `reconciliation`
- `webhook`
- `administrator`
- `operator-only`

Tone:

- Operational.
- Clear.
- Short.
- Calm.
- Action-first.

## Visual System Direction

### Overall Style

Sender home should feel like a real mobile workspace: clear next action, active delivery cards, and compact updates. It should be beautiful through hierarchy, spacing, and precision, not heavy decoration.

Visual keywords:

- Operational.
- Warm.
- Trustworthy.
- Scannable.
- Modern.
- Grounded.

Do not make it:

- Decorative dashboard.
- Map-heavy.
- Finance app.
- Social feed.
- Admin panel.
- Card soup.

### Color Tokens

Recommended semantic usage:

- `surface.base`: warm off-white.
- `surface.panel`: clean raised white.
- `surface.active`: subtle green tint.
- `ink.primary`: deep charcoal.
- `ink.secondary`: slate.
- `accent.primary`: route green.
- `accent.warning`: amber for payment/attention.
- `state.error`: only for errors and failed payment label.
- `state.success`: confirmed payment or delivered.
- `state.info`: in-transit/updates.

Rules:

- Do not color every status differently.
- Use payment attention color sparingly.
- Offline/stale markers must be visible but not alarming.
- Maintain WCAG contrast.

### Typography

Hierarchy:

- Header title: `28-34px`.
- Next move title: `22-26px`.
- Section title: `18-20px`.
- Card title: `16-18px`.
- Body: `14-16px`.
- Metadata: `13-14px`.
- Button: `16-17px`.

Rules:

- Active delivery receiver names must be readable.
- Metadata must not fall below accessible size.
- Use tabular numerals for times only if useful.
- Avoid long uppercase labels.

### Spacing

Use:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Rules:

- First viewport must not feel crowded.
- Active delivery cards need enough spacing for touch.
- Notification previews can be denser than delivery cards.
- Keep bottom content clear of navigation.

### Surfaces

Use:

- One strong next move panel.
- Delivery cards as tactile rows.
- Notification preview as a compact list.
- Offline/error banners as slim panels.

Avoid:

- Nested cards.
- Three-column metrics.
- Heavy shadows.
- Full-bleed map as home hero.
- Large decorative illustration when active data exists.

## Interaction And Motion

Allowed interactions:

- Pull-to-refresh.
- Tap delivery card.
- Tap timeline action.
- Tap create delivery.
- Tap notification preview.
- Tap view all.

Motion:

- Home content fades in after first data load.
- Delivery cards can reveal with a subtle stagger under `500ms`.
- Pull-to-refresh uses native interaction.
- Offline banner slides/fades in only once.

Reduced motion:

- Disable stagger and slide.
- Keep native refresh indicator if platform requires it.

Haptics:

- Light impact on create delivery tap if available.
- No haptic for every card tap unless product system standardizes it.

Rules:

- Do not animate live route lines continuously.
- Do not use motion to imply real-time tracking.
- Do not update content in ways that cause layout jumps during refresh.

## Offline And Cache Rules

Sender app model:

- Online-first with cached read fallback.

Allowed offline behavior:

- Show cached delivery summaries.
- Show cached notification previews.
- Show stale marker.
- Allow navigation to cached delivery detail only if detail screen can handle cache/stale state.
- Allow create delivery entry only if create flow owns online requirement and draft rules.

Disallowed offline behavior from home:

- Queue payment.
- Queue cancellation.
- Queue issue creation.
- Queue delivery creation.
- Queue notification read.
- Queue profile updates.

Rules:

- Offline home must not pretend data is fresh.
- Offline without cache must not show empty state.
- Reconnect should refresh deliveries and notifications.
- Cache should be cleared on sign-out.

## Accessibility Requirements

Structure:

- One main heading.
- Sections have explicit headings.
- Delivery cards have accessible names.
- Notification previews have accessible names.
- Offline/error banners are announced.

Screen reader:

- Next move panel reads title, body, and action.
- Delivery card reads receiver name, status, payment status, latest update, and action.
- Unread notification state is announced.
- Pull-to-refresh must be accessible through platform convention or alternate retry button.

Focus:

- On initial load, focus remains stable.
- On full error, focus can move to error title.
- On refresh complete, do not steal focus unless user initiated refresh from an explicit button.
- Modal-free navigation preferred.

Touch:

- Delivery card tap target at least `44x44`.
- Create delivery button at least `52` height.
- View-all links have padded hit zones.
- Notification rows are tappable if they navigate.

Large text:

- Cards expand vertically.
- No clipped status chips.
- Bottom navigation does not cover content.
- Next move panel remains readable.

Motion:

- Reduced motion disables nonessential animation.
- Status changes are not communicated by motion alone.

## Backend Alignment

This screen aligns with:

- `GET /v1/deliveries`
- `GET /v1/notifications`
- `deliveryListResponseSchema`
- `notificationListResponseSchema`
- `docs/03-business/delivery-lifecycle.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-inventory.md`

Backend facts:

- Delivery list is authenticated.
- Notification list is authenticated.
- Both list responses are read-only.
- Delivery list exposes summary only.
- Notification list exposes sender-safe notification records.
- Payment must be confirmed before transport states.
- Sender app is online-first with cached read fallback.

Authority rules:

- Backend status is source of truth.
- Home can derive display labels but cannot change state.
- Home can route to action owners but cannot perform their mutations.

## Error Mapping

| Source condition                       | UI state     | User copy                                                 |
| -------------------------------------- | ------------ | --------------------------------------------------------- |
| Both queries loading with no cache     | loading      | `Loading your sender home.`                               |
| Delivery list empty fresh success      | empty        | `No deliveries yet`                                       |
| Offline with cache                     | offline      | `You are viewing cached updates`                          |
| Offline without cache                  | offline      | `Connection needed`                                       |
| Deliveries fail, notifications succeed | error banner | `Some updates could not refresh. Pull down to try again.` |
| Notifications fail, deliveries succeed | error banner | `Some updates could not refresh. Pull down to try again.` |
| Both queries fail with no cache        | error        | `Home could not load`                                     |
| Auth expired                           | error/auth   | `Sign in again to continue.`                              |
| Forbidden role                         | error/auth   | `You do not have permission for this action.`             |

Rules:

- Do not show raw error codes in primary copy.
- Do not sign out automatically on transient network error.
- Do not show empty if load failed.
- Do not show cached data without marker.

## Analytics

Allowed events:

- `sender_home_viewed`
- `sender_home_create_delivery_tapped`
- `sender_home_delivery_opened`
- `sender_home_timeline_opened`
- `sender_home_history_tapped`
- `sender_home_notifications_tapped`
- `sender_home_refreshed`
- `sender_home_offline_shown`
- `sender_home_error_shown`

Required fields:

- `screenId`
- `route`
- `platform`
- `appVersion`
- `deliveryCount`
- `activeDeliveryCount`
- `unreadNotificationCount`
- `isOffline`
- `isStale`

Allowed delivery event fields:

- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `serviceType`

Forbidden fields:

- Receiver phone.
- Sender phone.
- Staff actor ID.
- Driver ID.
- Courier ID.
- Payment provider reference.
- Tracking code in analytics unless analytics policy explicitly allows it.
- Package description.
- Package declared value.
- Issue body.
- GPS.

Rules:

- Do not block navigation on analytics.
- Do not emit one event per card render.
- Use aggregate counts for home view.
- Use explicit tap events for navigation.

## Implementation Notes For Claude Code

Build only the sender home route and its local presentation/data orchestration components.

Expected implementation files later:

- Route file for `/(sender)/home`.
- Component for sender home header.
- Component for next move panel.
- Component for active delivery cards.
- Component for notification preview.
- Component for offline banner.
- Component for empty state.
- Component for home error state.
- Tests for loading, empty, offline, error, cached/stale, navigation, and analytics safety.

Do not implement:

- Delivery creation form.
- Payment method or payment processing.
- Delivery detail screen.
- Timeline screen.
- Notification inbox.
- Cancellation.
- Refund.
- Issue creation.
- Profile/settings.
- Offline action outbox.

Testing requirements:

- Auth guard redirects unauthenticated user.
- Loading state renders.
- Empty state renders only after fresh zero response.
- Offline with cache shows stale marker.
- Offline without cache does not show empty state.
- Partial query error shows banner.
- Full query error shows full error.
- Delivery cards route correctly.
- Notification preview routes correctly.
- Create delivery CTA routes correctly.
- Analytics excludes sensitive fields.

## Test IDs

Primary:

- `screen-sender-home`

Recommended child IDs:

- `sender-home-header`
- `sender-home-create-delivery-button`
- `sender-home-next-move-panel`
- `sender-home-active-deliveries`
- `sender-home-delivery-card`
- `sender-home-notification-preview`
- `sender-home-notification-row`
- `sender-home-empty-state`
- `sender-home-offline-banner`
- `sender-home-error-state`
- `sender-home-refresh-control`
- `sender-home-history-link`
- `sender-home-notifications-link`

Test ID rules:

- Stable.
- Lowercase kebab case.
- No dynamic values in base IDs.
- If indexing repeated items, use stable list patterns approved by test strategy.
- Never include receiver phone, tracking code, or provider reference.

## QA Acceptance Criteria

Route and auth:

- Screen renders at `/(sender)/home`.
- Root has test ID `screen-sender-home`.
- Unauthenticated users route to sender sign-in.
- Non-sender roles cannot access the screen.

Loading:

- Loading state renders while both initial queries load and no cache exists.
- Create delivery CTA remains available only after session validation.
- Screen is not spinner-only.

Ready:

- Delivery list renders active delivery cards.
- Notification preview renders recent notifications.
- Next move panel selects one priority.
- Create delivery CTA routes to create route.
- View all routes to history.
- View notifications routes to notifications inbox.

Empty:

- Fresh zero-delivery response renders empty state.
- Empty state has `Create delivery` CTA.
- Empty state does not appear during offline/no-cache state.

Offline:

- Offline with cache renders cached cards and stale marker.
- Offline without cache renders connection-needed state.
- Offline state does not queue mutations.
- Reconnect refreshes deliveries and notifications.

Error:

- Partial error keeps usable content.
- Full error shows retry.
- Session expired routes to sign-in.
- Raw error codes are not shown.

Data safety:

- Receiver phone is not shown.
- Staff IDs are not shown.
- Payment provider reference is not shown.
- Package description is not shown from list response.
- Issue body is not shown from notifications preview unless safe notification body explicitly contains it.

Accessibility:

- Sections have headings.
- Delivery cards are readable by screen reader.
- Pull-to-refresh has accessible fallback or platform support.
- Large text does not clip cards or CTAs.
- Offline and error banners are announced.
- Touch targets meet minimum size.

## Visual QA Checklist

Founder lens:

- Does the home screen make Kra feel operationally serious?
- Is create delivery obvious?
- Does the next move panel create real product value?

Skeptical sender lens:

- Do I know what is happening with my package?
- Do I know if payment is blocking movement?
- Do I know when data is stale?

Operator lens:

- Does the screen respect backend status authority?
- Does it avoid staff-only fields?
- Does it route mutations to owning screens?

Accessibility lens:

- Can a screen reader user understand next action and delivery cards?
- Can large-text users scan cards?
- Is refresh accessible?

Creative director lens:

- Is the screen distinctive without being noisy?
- Is there one strong visual idea?
- Are cards and panels disciplined?

## Build Boundaries

In scope:

- Sender home route.
- Auth guard behavior.
- Delivery list read.
- Notification list read.
- Loading, empty, offline, error states.
- Cached/stale display.
- Next move derivation.
- Navigation to owning screens.
- Safe analytics.

Out of scope:

- Delivery creation.
- Delivery detail.
- Timeline detail.
- Payment.
- Refund.
- Cancellation.
- Issue creation.
- Notification read mutation.
- Profile/settings.
- Staff operations.
- Admin workflows.

## Final Implementation Decisions

Station names must resolve through the shared typed station-label adapter. If a safe display name is unavailable, the UI must show the station ID with a `Station ID` label.

Home must show 3 active delivery cards on standard phones. Large phones and tablets can show 5 active delivery cards when the layout has enough vertical space without hiding primary actions.

Create delivery must be an inline primary card in the home feed. A sticky footer CTA can appear only after scroll depth hides the inline card.

Notification preview appears below active blockers and above history. If there are no active blockers, it appears below the active delivery list.

Status chip colors must use the shared lifecycle token map. The screen must not define local status colors.

## Definition Of Done

This screen is done when:

- It renders at the inventory route.
- It uses the inventory test ID.
- It requires authenticated sender session.
- It reads `list_deliveries` and `list_notifications`.
- It renders loading, empty, offline, and error states.
- It shows active deliveries and recent notifications.
- It makes `Create delivery` obvious.
- It marks cached/offline data.
- It never performs mutations from home.
- It does not expose receiver phone, staff IDs, provider references, raw audit data, or unavailable delivery details.
- It supports screen reader, large text, high contrast, reduced motion, and low bandwidth.
- It feels like a premium, action-first sender home for Kra.
