# Sender Delivery Detail Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderDeliveryDetail` |
| App | `apps/mobile` |
| Route | `/(sender)/deliveries/:deliveryId` |
| Primary test ID | `screen-sender-delivery-detail` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `deliveryDetailResponseSchema`, payment status policy, lifecycle policy, custody policy, cancellation policy, issue policy |
| Related routes | `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/payments/:deliveryId/method`, `/(sender)/payments/:deliveryId/processing`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/payments/:deliveryId/result`, `/(sender)/receipts/:deliveryId`, `/(sender)/deliveries/:deliveryId/cancel`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/issues/new`, `/(sender)/support` |
| Required states | `loading`, `ready`, `refreshing`, `stale_cache`, `payment_required`, `payment_failed`, `payment_under_review`, `payment_confirmed`, `in_progress`, `awaiting_receiver`, `delivered`, `cancelled`, `refund_pending`, `refunded`, `issue_open`, `proof_available`, `not_found`, `not_authorized`, `offline`, `api_error` |

## Product Job
This screen gives the sender a complete, accurate view of one delivery without exposing staff-only operational noise. It must summarize delivery status, payment status, custody position, receiver-safe progress, package details, proof state, issue state, and the next safe action.

The sender should be able to:
- Understand where the delivery stands now.
- See whether payment is blocking movement.
- Open the correct payment action when needed.
- See the latest verified handoff or milestone.
- Open the full tracking timeline.
- See package, route, quote, receiver, and service summary.
- Open receipt after confirmed payment when available.
- Open refund status when refund is pending or settled.
- Cancel only when policy allows it.
- Report an issue or continue support when something is wrong.
- See final proof when delivery is complete.

This screen is not the full timeline, payment checkout, payment result, cancellation form, refund tracker, issue creation form, receiver public tracking page, staff custody console, courier proof capture screen, or admin delivery detail.

## Audience
Primary audience:
- Authenticated senders checking one delivery.
- Small-business senders monitoring active packages.
- Senders resolving payment blocks.
- Senders checking proof, receipt, refund, cancellation, or issue status.

Secondary audience:
- Claude Code implementing the detail route.
- QA engineers validating state-driven actions.
- Support teams using sender-visible language.
- Operations reviewers confirming sender-safe custody display.
- Finance reviewers confirming receipt/refund entry rules.

## User State
The sender has selected a delivery from home, history, notification, payment result, receipt, support, or deep link. They want the truth fast. The screen must orient them in one scan and then expose the correct action without letting them mutate backend state from the detail page itself.

The sender may be:
- Trying to pay for a newly created delivery.
- Checking a package in transit.
- Waiting for receiver pickup or doorstep completion.
- Reviewing proof after delivery.
- Looking for receipt.
- Checking refund state after cancellation.
- Reporting a delay, damage, payment issue, or proof concern.
- Returning after being offline.
- Opening a delivery that no longer exists or is not theirs.

The screen must:
- Treat backend delivery detail as authoritative.
- Never infer unsupported actions from local state.
- Hide staff-only actor IDs from the sender.
- Show payment gating before transport actions.
- Show latest event and link to full timeline.
- Show cancellation and refund entry only by policy state.
- Keep issue/report action available without implying immediate resolution.
- Avoid exposing receiver-private data beyond sender-owned delivery details.

## Primary Action
Primary action changes by state:
- Payment pending: `Complete payment`
- Payment failed: `Recover payment`
- Payment under review: `View payment review`
- Payment confirmed and active delivery: `View timeline`
- Awaiting receiver: `View timeline`
- Delivered: `View receipt`
- Refund pending: `Track refund`
- Refunded: `View refund`
- Issue open: `View support`
- Cancel-eligible before intake: `Cancel delivery`
- Offline with cache: `Refresh when online`
- Error: `Try again`

Secondary actions:
- `View timeline`
- `Report an issue`
- `Copy tracking code`
- `View receipt`
- `Track refund`
- `Cancel delivery`
- `Go home`

CTA behavior:
- `Complete payment` routes to payment method or processing based on payment context.
- `Recover payment` routes to `/(sender)/payments/:deliveryId/recover`.
- `View payment review` routes to `/(sender)/payments/:deliveryId/result` with review context.
- `View timeline` routes to `/(sender)/deliveries/:deliveryId/timeline`.
- `View receipt` routes to `/(sender)/receipts/:deliveryId`.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `Cancel delivery` routes to `/(sender)/deliveries/:deliveryId/cancel`.
- `Report an issue` routes to issue creation with delivery context.
- `Copy tracking code` copies the public tracking code only.
- `Try again` refetches `get_delivery`.

CTA disabled conditions:
- Delivery detail is loading.
- Delivery is not found.
- Sender is not authorized.
- Device is offline and action requires fresh backend data.
- The relevant policy state blocks the requested action.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Current delivery status.
- Payment status.
- The next safe action.
- Route from origin station to destination station.
- Latest verified event time.

The screen creates value by:
- Turning many backend states into one clear sender view.
- Making payment blockers impossible to miss.
- Showing custody progress without staff-only detail.
- Giving the sender the right next action instead of a list of all actions.
- Preventing unsafe cancellation, refund, or payment shortcuts.

## Main Tension
Delivery detail is naturally dense. The screen must be complete enough to build trust, but not so crowded that the sender misses the one thing they must do now.

The screen must balance:
- Status clarity against information overload.
- Sender-safe custody visibility against staff privacy.
- Payment urgency against delivery tracking.
- Issue escalation against normal progress.
- Receipt/refund access against payment status truth.
- Fast scanning against deep operational context.

## Design Brief
User and job:
- An authenticated sender wants the current truth and next action for one delivery.

Context of use:
- Mobile, operational, payment-aware, often checked while moving.

Entry point:
- SenderHome active card.
- SenderDeliveryHistory.
- PaymentResult.
- PaymentFailedRecovery.
- Notification.
- Support thread.
- Receipt.

Success state:
- Sender understands status and takes the correct next action.

Primary action:
- State-specific action driven by payment and delivery status.

Navigation model:
- Delivery detail is the hub. Timeline, payment, receipt, cancellation, refund, and issues are spokes.

Density:
- First viewport carries status, payment, route, and primary action. Details are grouped below.

Visual thesis:
- A sender command sheet: one bold status, one payment truth, one custody clue, one next action.

Restraint rule:
- Avoid staff dashboards, raw audit logs, internal actor IDs, provider payloads, dense maps, and multi-action toolbars.

Product lens:
- Trust-critical delivery visibility.

System stance:
- Native detail screen with strong progressive disclosure.

Interaction thesis:
- The sender can scan current truth in seconds and then go to the right focused workflow.

Signature move:
- A compact "status spine" that combines payment, custody, and latest event in one vertical path.

Activation event:
- Sender opens the state-appropriate action.

## Elite Quality Gate
This spec is not closed unless delivery detail is complete, sender-safe, and action-gated.

Non-negotiable quality requirements:
- First viewport must show current delivery status.
- First viewport must show payment status.
- First viewport must show the next safe action.
- First viewport must show route summary.
- Latest event must be visible without opening the full timeline.
- Full timeline must be reachable.
- Payment pending must show payment CTA.
- Payment failed must show recovery CTA.
- Payment under review must not show retry CTA.
- Confirmed payment may show receipt entry when appropriate.
- Refund pending/refunded must show refund status entry.
- Cancellation action must route to cancellation form and not mutate here.
- Issue action must route to issue flow and not mutate here.
- Staff-only actor IDs must not be visible.
- The screen must not call payment, cancellation, refund, issue, or delivery mutation endpoints.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If payment blockers are below the fold, the screen remains open.
- If all actions have equal weight, the screen remains open.
- If staff IDs are visible to sender, the screen remains open.
- If the screen mutates delivery state directly, the screen remains open.
- If receipt appears before confirmed payment, the screen remains open.
- If timeline is not reachable, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Nielsen Norman Group system-status guidance supports making current system state visible and timely.
- Material Design 3 lists, cards, badges, buttons, and progress indicators support mobile detail hierarchy, state labels, and action grouping.
- Apple Human Interface Guidelines for navigation, lists, and feedback support clear drill-down behavior and state feedback.
- W3C WCAG status-message and error-identification guidance supports accessible status updates and blocked-action feedback.
- Kra sender app policy requires sender confidence, control, and fast issue visibility without internal operational noise.
- Kra tracking policy defines sender/receiver-safe timeline language.
- Kra API contracts define `deliveryDetailResponseSchema` and `deliveryTimelineResponseSchema`.

Reference links:
- https://www.nngroup.com/articles/visibility-system-status/
- https://m3.material.io/components/lists/overview
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/badges/overview
- https://m3.material.io/components/buttons/overview
- https://developer.apple.com/design/human-interface-guidelines/navigation-bars
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- `docs/04-features/sender-app-spec.md`
- `docs/04-features/tracking-spec.md`
- `docs/04-features/payments-spec.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/delivery-queries.ts`

## Product Assumptions
Assumptions for v1:
- Delivery detail is read-only.
- `get_delivery` returns `deliveryDetailResponseSchema`.
- Full timeline is a separate route.
- Sender can see receiver details for their own delivery.
- Sender cannot see raw staff actor IDs.
- Sender can see current custody role in sender-safe wording.
- Payment status controls payment, receipt, and refund entry points.
- Cancellation eligibility is evaluated on the cancellation screen, but detail can show an entry point when likely eligible.
- Refund detail is a separate route.
- Issue creation and support are separate routes.
- Final proof appears only if `finalProof` exists.
- Doorstep fields appear only when `doorstepRequested=true`.

Non-assumptions:
- Do not assume `currentCustodyActorId` is safe to show.
- Do not assume every status has ETA.
- Do not assume latest event is the full timeline.
- Do not assume refund eligibility from payment status alone.
- Do not assume cancellation can be completed from this page.
- Do not assume payment result is confirmed from local state.

## Backend Contract
Primary operation:
- `get_delivery`

HTTP:
- `GET /v1/deliveries/:id`

Auth:
- Authenticated sender who owns the delivery.

Response schema:
- `deliveryDetailResponseSchema`

Fields:
- `deliveryId`
- `trackingCode`
- `senderId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver`
- `package`
- `quote`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- `finalProof`
- `createdAt`

Allowed reads from this screen:
- `get_delivery`
- Optional notification count query when already available from app shell.

Forbidden mutations from this screen:
- `create_delivery`
- `initialize_payment`
- `verify_payment`
- `cancel_delivery`
- `refund_payment`
- `create_issue`
- `complete_delivery`
- Any custody transfer endpoint.
- Any proof upload endpoint.

Mutation routing rule:
- Detail screen may route to a focused workflow that performs a mutation.
- Detail screen itself must not perform those mutations.

## Status Mapping
Delivery status display:
- `created`: `Created`
- `awaiting_payment`: `Waiting for payment`
- `awaiting_station_intake`: `Waiting for station intake`
- `station_received`: `At origin station`
- `assigned_driver`: `Driver assigned`
- `in_transit`: `In transit`
- `destination_received`: `At destination station`
- `assigned_final_mile`: `Courier assigned`
- `out_for_delivery`: `Out for delivery`
- `awaiting_receiver_pickup`: `Ready for receiver pickup`
- `delivered`: `Delivered`
- `cancelled`: `Cancelled`

Payment status display:
- `pending`: `Payment pending`
- `confirmed`: `Payment confirmed`
- `failed`: `Payment failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

Custody role display:
- `null`: `Not yet in Kra custody`
- `station_operator`: `Kra station`
- `driver`: `Kra driver`
- `final_mile_courier`: `Kra courier`

Do not display:
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`

Latest touchpoint display:
- Sender-safe role label.
- Station ID if station-based.
- Occurred time.
- Link to timeline.

## Action Decision Rules
Payment action priority:
- If `paymentStatus=failed`, primary action is `Recover payment`.
- If `paymentStatus=pending` and no active processing context is known, primary action is `Complete payment`.
- If `paymentStatus=pending` and active pending payment context exists, primary action is `Continue payment check`.
- If payment is under review by derived context, primary action is `View payment review`.
- If `paymentStatus=confirmed`, delivery action can become primary.
- If `paymentStatus=refund_pending`, primary action can be `Track refund`.
- If `paymentStatus=refunded`, primary action can be `View refund`.

Delivery action priority:
- If payment blocks movement, payment action wins.
- If active issue blocks trust, issue/support action can be primary.
- If delivered and payment confirmed or refunded, receipt or proof action can be primary.
- If in active transport and payment confirmed, timeline action is primary.
- If status allows cancellation, cancellation is secondary unless user entered from cancellation intent.

Cancellation entry visibility:
- Show `Cancel delivery` if delivery has not reached irreversible transport/proof stage according to policy.
- Label as `Request cancellation` if policy needs review.
- Never cancel directly from this screen.

Receipt entry visibility:
- Show when payment is confirmed, refund pending, refunded, or delivered with payment record.
- Hide for pending, failed, and review states.

Refund entry visibility:
- Show when `paymentStatus=refund_pending` or `refunded`.
- Do not infer refund eligibility otherwise.

Issue entry visibility:
- Always show `Report an issue` for active or completed delivery.
- If issue context exists from notifications/support, show `View support` as stronger action.

## State Model
State names:
- `loading`
- `ready`
- `refreshing`
- `stale_cache`
- `payment_required`
- `payment_failed`
- `payment_under_review`
- `payment_confirmed`
- `in_progress`
- `awaiting_receiver`
- `delivered`
- `cancelled`
- `refund_pending`
- `refunded`
- `issue_open`
- `proof_available`
- `not_found`
- `not_authorized`
- `offline`
- `api_error`

Initial state:
- `loading`

State derivation:
- Fetching without cache maps to `loading`.
- Fetching with cache maps to `refreshing`.
- Offline with cached delivery maps to `stale_cache`.
- `404` maps to `not_found`.
- `403` maps to `not_authorized`.
- Network unavailable without cache maps to `offline`.
- `paymentStatus=pending` maps to `payment_required`.
- `paymentStatus=failed` maps to `payment_failed`.
- Derived payment review context maps to `payment_under_review`.
- `paymentStatus=confirmed` maps to `payment_confirmed`.
- Active delivery states map to `in_progress`.
- `currentStatus=awaiting_receiver_pickup` maps to `awaiting_receiver`.
- `currentStatus=delivered` maps to `delivered`.
- `currentStatus=cancelled` maps to `cancelled`.
- `paymentStatus=refund_pending` maps to `refund_pending`.
- `paymentStatus=refunded` maps to `refunded`.
- Existing open issue context maps to `issue_open`.
- `finalProof` present maps to `proof_available`.

State persistence:
- Cache last fetched delivery detail.
- Mark cache as stale when offline or older than app freshness policy.
- Persist last opened delivery ID for return navigation.
- Do not persist staff IDs in sender-visible store.

## Information Architecture
Screen sections in order:
1. Status hero.
2. Primary action panel.
3. Payment card.
4. Route and custody spine.
5. Latest event preview.
6. Package summary.
7. Receiver and delivery options.
8. Proof and receipt entry.
9. Issue, cancellation, refund, and support actions.
10. Technical IDs and copy controls.

First viewport:
- Current status.
- Payment status.
- Origin-to-destination route.
- Next safe action.
- Latest event timestamp.

Second viewport:
- Payment details and quote.
- Custody role.
- Package summary.
- Receiver summary.

Lower page:
- Proof.
- Receipt/refund/support/cancellation routes.
- Created time.
- Tracking code copy.

## Visual Direction
Visual thesis:
- A high-trust delivery command sheet with a compact status spine.

Mood:
- Controlled.
- Clear.
- Operational.
- Warm.
- Serious when blocked.

Material language:
- Warm neutral background.
- Strong dark status hero.
- Route spine as a vertical line with station endpoints.
- Payment card uses state color only in a restrained edge.
- Proof card uses calm green only when final proof exists.
- Issue card uses amber/red according to severity if known.

Typography:
- Status title large and literal.
- Amount uses tabular numerals.
- IDs use monospace or tabular style but not oversized.
- Body copy stays short.

Spacing:
- First viewport must not become a card pile.
- Use grouped blocks with clear section headers.
- Details use rows, not many isolated cards.
- Sticky primary action appears only when it helps reachability.

Motion:
- Refresh uses pull-to-refresh and subtle progress.
- Status spine can animate once on first load.
- No constant motion in active delivery.
- Reduced motion uses static spine.

## Layout Specification
Mobile portrait layout:
- Safe-area-aware screen.
- Scrollable detail.
- Sticky bottom primary action when primary action is not already visible.
- Pull-to-refresh.

Status hero:
- Eyebrow: `Delivery detail`
- Title: status label.
- Subtitle: sender-safe status explanation.
- Payment chip.
- Tracking code with copy action.

Primary action panel:
- One primary CTA.
- One secondary route if needed.
- Inline reason when action is blocked.

Payment card:
- Payment status.
- Quote amount.
- Receipt/refund/payment action.
- Payment-before-dispatch note when not confirmed.

Route and custody spine:
- Origin station.
- Current custody role.
- Destination station.
- Doorstep leg if requested.
- Latest touchpoint.

Latest event preview:
- Event label.
- Occurred time.
- Link: `View full timeline`

Package summary:
- Description.
- Size tier.
- Weight.
- Fragile flag.
- Declared value.

Receiver summary:
- Receiver name.
- Receiver phone masked or visible according to sender policy.
- Address only when doorstep requested.
- Receiver pickup or doorstep instruction if applicable.

Proof and receipt:
- Final proof summary when available.
- Receipt route when payment status permits.
- Refund route when refund status permits.

Support actions:
- Report issue.
- View support if issue context exists.
- Cancel delivery if eligible entry is visible.

## Component Structure
Root component:
- `SenderDeliveryDetailScreen`

Child components:
- `DeliveryDetailStatusHero`
- `DeliveryPrimaryActionPanel`
- `DeliveryPaymentCard`
- `DeliveryRouteCustodySpine`
- `DeliveryLatestEventPreview`
- `DeliveryPackageSummary`
- `DeliveryReceiverSummary`
- `DeliveryProofSummary`
- `DeliveryPolicyActionList`
- `DeliveryOfflineBanner`
- `DeliveryErrorState`

Component responsibilities:
- `SenderDeliveryDetailScreen` owns fetch, refresh, state mapping, and navigation.
- `DeliveryDetailStatusHero` owns current status and tracking code copy.
- `DeliveryPrimaryActionPanel` owns one state-specific action.
- `DeliveryPaymentCard` owns payment status, amount, and payment routes.
- `DeliveryRouteCustodySpine` owns origin, current custody role, destination, and doorstep leg.
- `DeliveryLatestEventPreview` owns latest event and timeline link.
- `DeliveryPackageSummary` owns package facts.
- `DeliveryReceiverSummary` owns sender-visible receiver details.
- `DeliveryProofSummary` owns final proof summary and proof route when available.
- `DeliveryPolicyActionList` owns cancellation, refund, and issue routes.
- `DeliveryOfflineBanner` owns stale cache state.
- `DeliveryErrorState` owns not found, unauthorized, offline, and API error states.

Forbidden component behavior:
- No component calls mutation endpoints.
- No component shows staff actor IDs.
- No component shows receipt before payment permits it.
- No component shows retry-payment CTA for payment review.
- No component displays provider raw payload.
- No component displays full internal audit data.

## Test IDs
Screen:
- `screen-sender-delivery-detail`

Status:
- `sender-delivery-detail-hero`
- `sender-delivery-detail-status`
- `sender-delivery-detail-payment-chip`
- `sender-delivery-detail-tracking-code`
- `sender-delivery-detail-copy-tracking`

Actions:
- `sender-delivery-detail-primary-action`
- `sender-delivery-detail-secondary-action`
- `sender-delivery-detail-view-timeline`
- `sender-delivery-detail-payment-action`
- `sender-delivery-detail-receipt-action`
- `sender-delivery-detail-refund-action`
- `sender-delivery-detail-cancel-action`
- `sender-delivery-detail-issue-action`
- `sender-delivery-detail-support-action`

Sections:
- `sender-delivery-detail-payment-card`
- `sender-delivery-detail-route-spine`
- `sender-delivery-detail-latest-event`
- `sender-delivery-detail-package`
- `sender-delivery-detail-receiver`
- `sender-delivery-detail-proof`
- `sender-delivery-detail-policy-actions`

States:
- `sender-delivery-detail-loading`
- `sender-delivery-detail-ready`
- `sender-delivery-detail-refreshing`
- `sender-delivery-detail-stale-cache`
- `sender-delivery-detail-payment-required`
- `sender-delivery-detail-payment-failed`
- `sender-delivery-detail-payment-review`
- `sender-delivery-detail-payment-confirmed`
- `sender-delivery-detail-in-progress`
- `sender-delivery-detail-awaiting-receiver`
- `sender-delivery-detail-delivered`
- `sender-delivery-detail-cancelled`
- `sender-delivery-detail-refund-pending`
- `sender-delivery-detail-refunded`
- `sender-delivery-detail-issue-open`
- `sender-delivery-detail-proof-available`
- `sender-delivery-detail-not-found`
- `sender-delivery-detail-not-authorized`
- `sender-delivery-detail-offline`
- `sender-delivery-detail-api-error`

## Interaction Flow
Default load:
1. User opens delivery detail route.
2. Screen validates `deliveryId`.
3. Screen fetches `get_delivery`.
4. Screen parses `deliveryDetailResponseSchema`.
5. Screen maps status, payment, custody, proof, and actions.
6. User sees status hero and primary action.

Payment pending:
1. Detail loads with `paymentStatus=pending`.
2. Payment card says payment is required before dispatch.
3. Primary action routes to PaymentMethod or PaymentProcessing.
4. No receipt action appears.

Payment failed:
1. Detail loads with `paymentStatus=failed`.
2. Payment card says payment was not confirmed.
3. Primary action routes to PaymentFailedRecovery.
4. No receipt action appears.

Payment under review:
1. Detail receives derived review context or pending review signal.
2. Detail shows review copy.
3. Retry action is hidden.
4. Primary action routes to PaymentResult review.

Payment confirmed:
1. Detail loads with `paymentStatus=confirmed`.
2. Payment card says payment confirmed.
3. Transport status becomes primary context.
4. Receipt route appears if payment record supports it.

Delivered:
1. Detail loads with `currentStatus=delivered`.
2. Hero says delivered.
3. Final proof appears if available.
4. Receipt and timeline actions appear.

Refund pending:
1. Detail loads with `paymentStatus=refund_pending`.
2. Refund status action appears.
3. Receipt remains available if policy allows.
4. Payment retry is hidden.

Refunded:
1. Detail loads with `paymentStatus=refunded`.
2. Refund complete status appears.
3. Receipt/refund route remains available.
4. Payment retry is hidden.

Cancellation:
1. Detail shows cancellation entry only when policy likely allows it.
2. User taps cancellation.
3. App routes to cancellation request screen.
4. No cancellation mutation is sent from detail.

Issue:
1. User taps `Report an issue`.
2. App routes to issue creation with delivery context.
3. No issue mutation is sent from detail.

Offline:
1. App opens with cached delivery.
2. Banner says data may be stale.
3. Sender can view cached details and non-network routes.
4. Refresh waits for connectivity.

Not authorized:
1. Backend returns forbidden.
2. Screen shows access blocked.
3. No delivery facts are shown.
4. User can go home or support.

Not found:
1. Backend returns not found.
2. Screen shows not found.
3. User can go home or history.

## State Copy
Loading:
- Title: `Opening delivery`
- Body: `Kra is loading the latest delivery details.`

Ready:
- Title: `{statusLabel}`
- Body: `{senderSafeStatusSummary}`

Refreshing:
- Title: `Refreshing delivery`
- Body: `Kra is checking for the latest update.`

Stale cache:
- Title: `Showing last saved update`
- Body: `Reconnect to refresh this delivery. Actions that need the server are paused.`

Payment required:
- Title: `Payment needed`
- Body: `This delivery cannot move until payment is confirmed.`
- Primary: `Complete payment`

Payment failed:
- Title: `Payment was not confirmed`
- Body: `Recover payment before Kra can move this delivery.`
- Primary: `Recover payment`

Payment under review:
- Title: `Payment under review`
- Body: `Kra is reconciling the provider result. Dispatch waits for payment resolution.`
- Primary: `View payment review`

Payment confirmed:
- Title: `Payment confirmed`
- Body: `This delivery can continue through the verified custody path.`

In progress:
- Title: `Delivery in progress`
- Body: `Kra is moving this package through the verified route.`
- Primary: `View timeline`

Awaiting receiver:
- Title: `Ready for receiver`
- Body: `The delivery is waiting for receiver pickup or final handoff.`
- Primary: `View timeline`

Delivered:
- Title: `Delivered`
- Body: `Final delivery proof has been captured when available.`
- Primary: `View receipt`

Cancelled:
- Title: `Delivery cancelled`
- Body: `This delivery is no longer moving. Check refund status if payment was already confirmed.`

Refund pending:
- Title: `Refund pending`
- Body: `Kra has approved a refund action and settlement is still in progress.`
- Primary: `Track refund`

Refunded:
- Title: `Refunded`
- Body: `Refund settlement is complete for this delivery.`
- Primary: `View refund`

Issue open:
- Title: `Issue under review`
- Body: `Kra support is reviewing an issue connected to this delivery.`
- Primary: `View support`

Proof available:
- Title: `Proof available`
- Body: `Delivery proof is attached to this delivery.`

Not found:
- Title: `Delivery not found`
- Body: `Kra could not find this delivery for your account.`
- Primary: `Go home`

Not authorized:
- Title: `Access blocked`
- Body: `This delivery is not available on your sender account.`
- Primary: `Go home`

Offline:
- Title: `You are offline`
- Body: `Reconnect to load the latest delivery detail.`
- Primary: `Try again`

API error:
- Title: `Could not load delivery`
- Body: `Kra could not load this delivery right now. Try again or contact support.`
- Primary: `Try again`

## Copy Rules
Use:
- `current status`
- `payment status`
- `verified update`
- `latest event`
- `custody`
- `proof`
- `tracking code`
- `dispatch waits`

Do not use:
- Staff names or actor IDs.
- Internal audit terms.
- Provider raw references.
- Receipt language before payment permits it.
- Refund promise when refund is not pending or complete.
- Cancellation promise before cancellation screen confirms eligibility.
- Any copy that suggests package movement before payment confirmation.

Tone:
- Direct.
- Operational.
- Calm.
- Sender-safe.
- Low hype.

## Data Handling Rules
Safe to display:
- Delivery ID.
- Tracking code.
- Origin station ID.
- Destination station ID.
- Current status.
- Payment status.
- Service type.
- Doorstep requested flag.
- Doorstep distance when present.
- Receiver details owned by sender context.
- Package details.
- Quote.
- Current custody role in safe wording.
- Latest event label/time.
- Latest touchpoint role/station/time.
- Final proof summary.
- Created time.

Not safe to display:
- `currentCustodyActorId`.
- `assignedDriverId`.
- `assignedFinalMileCourierId`.
- Internal audit records.
- Provider raw payment payloads.
- Support notes not meant for sender.
- Proof storage paths.
- Receiver verification token.

Tracking code copy:
- Copy only `trackingCode`.
- Show toast: `Tracking code copied`.
- Do not copy receiver phone, address, or internal IDs.

## Privacy And Safety Rules
Sender-visible receiver data:
- Name can show.
- Phone can show because sender provided it, but consider masking in collapsed row.
- Address shows only for doorstep delivery.
- Receiver verification data must not show.

Sender-visible custody data:
- Show role and station touchpoint.
- Hide actor IDs.
- Hide staff assignment IDs.
- Hide internal exception notes.

Sender-visible proof data:
- Show proof type, received-by name, and captured time when final proof exists.
- Do not show private storage references.
- Do not show proof image inline unless future proof viewer is explicitly built.

## Accessibility Requirements
Screen reader:
- Announce current status and payment status early.
- Tracking code copy button must have explicit label.
- Status chips must have text labels.
- Route spine must have text equivalent.
- Latest event preview must read label and time.

Focus:
- Initial focus on status title.
- Error states focus title.
- After refresh, announce status changed if it changed.
- Copy tracking action returns focus to button.

Touch:
- All buttons minimum 44 by 44 px.
- Sticky action avoids home indicator.
- Collapsible sections have large hit areas.

Contrast:
- Status colors meet WCAG AA.
- Payment warnings include icon and text.
- High contrast mode increases outlines.

Reduced motion:
- No moving route line.
- Refresh indicator remains minimal.
- Status updates happen without animation dependency.

Large text:
- Hero wraps cleanly.
- Payment card stacks.
- Route spine switches to text list.
- Sticky action does not cover content.

## Performance Requirements
Initial render:
- Show skeleton with route context.
- Use cached delivery detail if available.
- Fetch fresh detail immediately when online.

Network:
- One `get_delivery` request at a time.
- Pull-to-refresh cancels stale request.
- Do not refetch timeline on this screen unless dedicated preview requires fresh data.
- Do not poll continuously.

Caching:
- Cache last delivery detail.
- Mark stale by timestamp.
- Show stale banner offline.
- Do not cache staff-only IDs in sender-visible state.

Rendering:
- Avoid heavy map.
- Avoid large proof media in base detail.
- Use virtualized lists only if sections expand substantially.

## Analytics
Events:
- `sender_delivery_detail_viewed`
- `sender_delivery_detail_refreshed`
- `sender_delivery_detail_primary_action_tapped`
- `sender_delivery_detail_timeline_tapped`
- `sender_delivery_detail_payment_tapped`
- `sender_delivery_detail_receipt_tapped`
- `sender_delivery_detail_refund_tapped`
- `sender_delivery_detail_cancel_tapped`
- `sender_delivery_detail_issue_tapped`
- `sender_delivery_detail_tracking_copied`
- `sender_delivery_detail_error_viewed`

Required properties:
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `primaryAction`
- `hasFinalProof`
- `isStale`

Forbidden properties:
- Receiver full phone in analytics.
- Receiver address.
- Staff actor IDs.
- Provider raw references.
- Proof storage references.
- Support notes.

Success metric:
- Sender reaches the correct focused workflow from detail without starting an invalid mutation.

Risk metric:
- Payment-blocked deliveries where sender taps non-payment actions first.

Operational metric:
- Detail refresh error rate by network state.

## QA Scenarios
Payment pending:
1. Open delivery detail with `paymentStatus=pending`.
2. First viewport shows payment needed.
3. Primary action routes to payment.
4. Receipt action is hidden.

Payment failed:
1. Open delivery detail with `paymentStatus=failed`.
2. First viewport shows recover payment.
3. Primary action routes to recovery.
4. Timeline remains available as secondary.

Payment review:
1. Open delivery detail with review context.
2. Retry payment is hidden.
3. Primary action routes to payment review.

Confirmed in progress:
1. Open delivery detail with `paymentStatus=confirmed` and active status.
2. Primary action is timeline.
3. Payment card says confirmed.

Delivered:
1. Open delivered delivery.
2. Hero says delivered.
3. Proof summary appears if `finalProof` exists.
4. Receipt action appears when payment permits it.

Refund pending:
1. Open delivery with `paymentStatus=refund_pending`.
2. Refund action appears.
3. Payment retry is hidden.

Refunded:
1. Open delivery with `paymentStatus=refunded`.
2. Refund complete copy appears.
3. Payment retry is hidden.

Cancellation entry:
1. Open eligible delivery.
2. Cancellation entry appears.
3. Tap routes to cancellation screen.
4. Detail sends no cancellation mutation.

Issue entry:
1. Tap report issue.
2. App routes to issue creation.
3. Detail sends no issue mutation.

Offline cached:
1. Open cached delivery while offline.
2. Stale banner appears.
3. Server-required actions are disabled or route with warning.

Not authorized:
1. Backend returns forbidden.
2. No delivery facts show.
3. Go home/support actions show.

Not found:
1. Backend returns not found.
2. Not found state appears.
3. History/home route appears.

Staff IDs:
1. Backend response includes `currentCustodyActorId`.
2. UI does not render the actor ID.
3. UI shows role label only.

## Automated Test Requirements
Unit tests:
- Status mapper maps every delivery status.
- Payment action mapper handles pending, failed, confirmed, refund pending, and refunded.
- Custody role mapper hides actor IDs.
- Receipt action is hidden before allowed payment states.
- Cancellation action routes but does not mutate.
- Issue action routes but does not mutate.
- Offline cache maps to stale state.

Component tests:
- Loading state renders.
- Payment pending state renders CTA.
- Payment failed state renders recovery CTA.
- Delivered state renders proof when present.
- Refund pending renders refund CTA.
- Not authorized hides details.
- Not found hides details.
- Route spine has text equivalent.
- Tracking copy button has accessible label.
- Large text keeps primary action visible.

Integration tests:
- Screen calls `get_delivery` on open.
- Pull-to-refresh refetches `get_delivery`.
- Payment pending action routes to payment flow.
- Payment failed action routes to recovery.
- Timeline action routes to timeline.
- Receipt action routes to receipt only when permitted.
- Cancel action routes to cancellation screen.
- Issue action routes to issue creation.
- No mutation endpoint is called from detail.

End-to-end tests:
- Sender opens active delivery from home.
- Sender opens timeline from detail.
- Sender opens payment recovery from failed detail.
- Sender opens receipt from delivered detail.
- Sender opens cancellation request from eligible detail.
- Sender opens issue creation from detail.
- Offline cached detail displays stale state.

## Implementation Notes For Claude Code
Build order:
1. Add route file for `/(sender)/deliveries/:deliveryId`.
2. Implement `useSenderDeliveryDetail`.
3. Implement `mapSenderDeliveryDetailState`.
4. Implement `getSenderDeliveryPrimaryAction`.
5. Implement status hero.
6. Implement payment card.
7. Implement route and custody spine.
8. Implement latest event preview.
9. Implement package and receiver summaries.
10. Implement proof, receipt, refund, cancellation, and issue action routes.
11. Add analytics with safe properties.
12. Add unit, component, integration, and end-to-end tests.

Required invariants:
- Detail screen calls only read endpoints.
- Detail screen never mutates delivery, payment, refund, cancellation, issue, proof, or custody state.
- Payment blocked states make payment action primary.
- Staff IDs never render.
- Receipt hides before payment permits it.
- Timeline route is always reachable when delivery detail exists.
- Offline state makes staleness visible.

Suggested module boundaries:
- `mapDeliveryStatusLabel`
- `mapPaymentStatusLabel`
- `mapCustodyRoleLabel`
- `getSenderDeliveryPrimaryAction`
- `useSenderDeliveryDetail`
- `SenderDeliveryDetailScreen`
- `DeliveryPaymentCard`
- `DeliveryRouteCustodySpine`

Suggested input contract:
- `deliveryId`
- `cachedDelivery`
- `networkState`
- `authState`
- `now`

Suggested output contract:
- `delivery`
- `state`
- `primaryAction`
- `secondaryActions`
- `safeAnalyticsPayload`
- `stale`

Do not implement:
- Map tracking.
- Staff detail panel.
- Payment retry logic.
- Cancellation mutation.
- Refund mutation.
- Issue mutation.
- Proof upload.
- Provider diagnostics.

## Design QA Checklist
Before closing implementation:
- Current status is above the fold.
- Payment status is above the fold.
- Primary action is obvious.
- Route summary is above the fold.
- Latest event is visible.
- Timeline link works.
- Pending payment routes to payment.
- Failed payment routes to recovery.
- Payment review hides retry.
- Receipt hides until permitted.
- Refund route appears only for refund states.
- Cancellation routes to cancellation screen.
- Issue routes to issue flow.
- No mutation happens on detail.
- Staff IDs are hidden.
- Receiver verification data is hidden.
- Offline stale state is clear.
- Not authorized hides facts.
- Not found hides facts.
- Screen works on small phones.
- Screen works with large text.
- Screen works with screen reader.
- Screen works with reduced motion.

## Handoff Summary
Claude Code should build `SenderDeliveryDetail` as the sender's read-only delivery hub. It must fetch `get_delivery`, show status, payment, route, custody role, latest event, package, receiver, quote, proof, and policy actions, then route users to payment, timeline, receipt, cancellation, refund, issue, or support flows as separate focused screens. It must never mutate backend state directly, expose staff-only actor IDs, show receipt before permitted payment states, or hide payment blockers below less important delivery details.
