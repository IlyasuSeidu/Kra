# Sender Tracking Timeline Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderTrackingTimeline` |
| App | `apps/mobile` |
| Route | `/(sender)/deliveries/:deliveryId/timeline` |
| Primary test ID | `screen-sender-tracking-timeline` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery_timeline`, `deliveryTimelineResponseSchema`, tracking policy, custody policy, issue policy |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/issues/new`, `/(sender)/support`, `/(sender)/home` |
| Required states | `loading`, `ready`, `refreshing`, `empty`, `stale`, `issue_visible`, `handoff_visible`, `proof_visible`, `not_found`, `not_authorized`, `offline`, `api_error` |

## Product Job
This screen shows the sender the verified lifecycle events for one delivery. It must make progress and custody understandable without turning the sender app into an internal audit console. The screen should emphasize what changed, when it changed, who held custody at a sender-safe level, whether proof was attached, and whether an issue is affecting the delivery.

The sender should be able to:
- See the latest verified update.
- Review the sequence of delivery, handoff, and issue events.
- Understand custody movement in sender-safe language.
- See proof type where proof is safe to reveal.
- See when issue events occurred.
- Refresh for a newer timeline.
- Return to delivery detail.
- Report an issue if the timeline does not match what they expect.
- Use cached timeline carefully when offline.

This screen is not the delivery detail hub, public receiver timeline, staff custody chain, admin audit log, proof upload screen, issue creation form, support thread, payment screen, receipt screen, or live map.

## Audience
Primary audience:
- Authenticated senders tracking one delivery.
- Senders checking whether a package has moved.
- Senders looking for proof or issue context.
- Senders sharing current progress with a receiver or business customer.

Secondary audience:
- Claude Code implementing the timeline route.
- QA engineers validating event rendering.
- Support teams using sender-visible event language.
- Operations reviewers confirming sender-safe custody wording.
- Accessibility reviewers checking chronological lists.

## User State
The sender has opened the timeline from delivery detail, home, notification, or support. They need clear progress, not internal mechanics. They may be anxious, offline, or checking whether a handoff happened.

The sender may be:
- Looking for the newest update.
- Checking whether the package left a station.
- Checking whether a courier has custody.
- Confirming proof after delivery.
- Investigating a delay.
- Reviewing an issue event.
- Returning after being offline.
- Opening a delivery they cannot access.

The screen must:
- Render backend timeline entries exactly as verified events.
- Never invent missing steps.
- Never show staff actor IDs.
- Never show private proof references or storage paths.
- Make stale cached data obvious.
- Show issue events without implying resolution.
- Keep timeline readable on a small phone.

## Primary Action
Primary action changes by state:
- Ready: `Refresh timeline`
- Stale: `Refresh when online`
- Empty: `Back to delivery`
- Issue visible: `View support`
- Offline: `Try again when online`
- Error: `Try again`
- Not found: `Go home`
- Not authorized: `Go home`

Secondary actions:
- `Back to delivery`
- `Report an issue`
- `Copy tracking code`
- `Go home`

CTA behavior:
- `Refresh timeline` calls `get_delivery_timeline`.
- `Back to delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Report an issue` routes to issue creation with delivery context.
- `View support` routes to support context if issue data exists.
- `Copy tracking code` copies only `trackingCode`.
- `Try again` refetches `get_delivery_timeline`.

CTA disabled conditions:
- Timeline request is in flight.
- Device is offline and action requires backend.
- Delivery is not found.
- Sender is not authorized.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Tracking code.
- Latest verified event.
- Event time.
- Whether timeline data is fresh or stale.
- A clear route back to delivery detail.

The screen creates value by:
- Making delivery movement verifiable.
- Separating real events from guesses.
- Turning custody handoffs into understandable sender language.
- Making issue events visible.
- Avoiding a live-map illusion when the backend is event-first.

## Main Tension
Senders often expect a moving dot. Kra's tracking model is event-first: verified state and custody are more important than showing imprecise motion. The screen must make event tracking feel trustworthy and premium instead of sparse.

The screen must balance:
- Chronology against newest-update urgency.
- Proof visibility against privacy.
- Custody clarity against internal actor exposure.
- Issue visibility against fear.
- Refresh control against noisy polling.
- Visual richness against accessibility.

## Design Brief
User and job:
- An authenticated sender wants the verified progress history for one delivery.

Context of use:
- Mobile tracking, often revisited, sometimes under stress.

Entry point:
- SenderDeliveryDetail.
- SenderHome active delivery card.
- Notification.
- Support context.

Success state:
- Sender understands the latest update and the chain of verified events.

Primary action:
- Refresh or return to delivery detail.

Navigation model:
- Timeline is a detail spoke from SenderDeliveryDetail.

Density:
- Timeline rail with compact event cards and strong latest event emphasis.

Visual thesis:
- A verified custody rail: precise event cards connected by a calm line of proof.

Restraint rule:
- Avoid live maps, staff audit tables, raw metadata, private proof references, and animated route dots.

Product lens:
- Trust-critical tracking.

System stance:
- Native timeline list with event grouping and accessible status.

Interaction thesis:
- The sender can scan the newest event, then scroll through the verified record.

Signature move:
- The newest event is a strong "current update" card, followed by a proof-aware event rail.

Activation event:
- Sender refreshes, reports an issue, or returns to delivery detail.

## Elite Quality Gate
This spec is not closed unless timeline progress is verified, readable, and sender-safe.

Non-negotiable quality requirements:
- First viewport must show tracking code.
- First viewport must show latest verified event when present.
- First viewport must show freshness state.
- Events must come from `deliveryTimelineResponseSchema`.
- Timeline must include delivery, handoff, and issue event types.
- Empty state must explain that no events are available yet.
- Stale state must be visually and textually obvious.
- Staff actor IDs must not render.
- Private proof references must not render.
- Full delivery detail must be reachable.
- Issue reporting must be reachable.
- The screen must not call mutation endpoints.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If event order is unclear, the screen remains open.
- If stale cached data looks fresh, the screen remains open.
- If raw metadata appears, the screen remains open.
- If actor IDs appear, the screen remains open.
- If proof references appear, the screen remains open.
- If the timeline implies unverified movement, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Nielsen Norman Group system-status guidance supports visible, timely current status.
- Material Design 3 lists, cards, badges, buttons, and progress indicators support structured event lists and refresh feedback.
- Apple Human Interface Guidelines for lists, navigation, and feedback support clear chronological drill-down behavior.
- W3C WCAG status-message and error-identification guidance supports accessible updates and error states.
- Kra tracking policy says tracking should be event-first, not location-first.
- Kra custody rules require handoff evidence and timestamp clarity.
- Kra API contracts define `deliveryTimelineResponseSchema`.

Reference links:
- https://www.nngroup.com/articles/visibility-system-status/
- https://m3.material.io/components/lists/overview
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/badges/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/progress-indicators/overview
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://developer.apple.com/design/human-interface-guidelines/navigation-bars
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- `docs/04-features/tracking-spec.md`
- `docs/04-features/sender-app-spec.md`
- `docs/07-api/api-contracts.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/delivery-queries.ts`

## Product Assumptions
Assumptions for v1:
- Timeline is read-only.
- `get_delivery_timeline` returns `deliveryTimelineResponseSchema`.
- Backend returns events sorted newest first.
- UI may group by date but must keep ordering clear.
- `entryType` can be `delivery_event`, `handoff_event`, or `issue_event`.
- Handoff metadata may include proof fields.
- Sender can see proof type, but not private proof references.
- Sender can see actor role labels, but not actor IDs.
- Full custody/audit detail belongs to staff/admin screens.
- Empty timeline is possible for a new delivery or backend delay.
- Timeline can be cached for offline read with stale warning.

Non-assumptions:
- Do not assume live GPS exists.
- Do not assume every delivery has handoff events yet.
- Do not assume proof media is viewable here.
- Do not assume issue events are resolved.
- Do not assume actor IDs are safe.
- Do not assume metadata is sender-safe by default.

## Backend Contract
Primary operation:
- `get_delivery_timeline`

HTTP:
- `GET /v1/deliveries/:id/timeline`

Auth:
- Authenticated sender who owns the delivery.

Response schema:
- `deliveryTimelineResponseSchema`

Response fields:
- `deliveryId`
- `trackingCode`
- `entries`

Entry schema:
- `entryId`
- `entryType`
- `occurredAt`
- `label`
- `actorId`
- `actorRole`
- `stationId`
- `metadata`

Entry types:
- `delivery_event`
- `handoff_event`
- `issue_event`

Allowed reads from this screen:
- `get_delivery_timeline`

Forbidden mutations from this screen:
- `create_delivery`
- `initialize_payment`
- `verify_payment`
- `cancel_delivery`
- `refund_payment`
- `create_issue`
- `confirm_pickup`
- `accept_final_mile_assignment`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`

Mutation routing rule:
- `Report an issue` may route to issue creation.
- Timeline itself must not create the issue.

## Event Mapping
Delivery event:
- Source: `entryType=delivery_event`.
- Visual: neutral milestone dot.
- Sender label: use backend label with title casing when needed.
- Details: occurred time, station if present, sender-safe role if present.

Handoff event:
- Source: `entryType=handoff_event`.
- Visual: custody handoff dot with proof chip.
- Sender label: use backend label.
- Details: occurred time, sender-safe role, station if present.
- Proof: show proof type if safe.
- Do not show proof reference.

Issue event:
- Source: `entryType=issue_event`.
- Visual: issue dot and callout.
- Sender label: use backend label.
- Details: occurred time, issue category and severity if safe.
- Summary: show short summary only if backend metadata is sender-safe.
- Action: support or report issue route.

Actor display:
- `actorRole` maps to sender-safe role label.
- `actorId` never renders.

Station display:
- `stationId` can render as station code until station display names are available.
- Do not invent station names.

Metadata display:
- Default hidden.
- Allowlist only `proofType`, `condition`, `severity`, `category`, and sender-safe `summary`.
- Hide `proofReference`.
- Hide unknown metadata keys.

## State Model
State names:
- `loading`
- `ready`
- `refreshing`
- `empty`
- `stale`
- `issue_visible`
- `handoff_visible`
- `proof_visible`
- `not_found`
- `not_authorized`
- `offline`
- `api_error`

Initial state:
- `loading`

State derivation:
- Fetching without cache maps to `loading`.
- Fetching with cache maps to `refreshing`.
- Offline with cache maps to `stale`.
- Offline without cache maps to `offline`.
- Response with zero entries maps to `empty`.
- Response with entries maps to `ready`.
- Any issue event maps to `issue_visible`.
- Any handoff event maps to `handoff_visible`.
- Any safe proof metadata maps to `proof_visible`.
- `404` maps to `not_found`.
- `403` maps to `not_authorized`.
- Recoverable API failure maps to `api_error`.

State persistence:
- Cache last timeline response by delivery ID.
- Store last fetched time.
- Mark cached response stale after app freshness threshold or offline state.
- Do not persist raw metadata beyond allowlisted display fields.
- Do not persist actor IDs in sender-visible store.

## Information Architecture
Screen sections in order:
1. Timeline header.
2. Freshness banner.
3. Latest update card.
4. Filter chips.
5. Event rail.
6. Empty/error/offline state.
7. Detail/support actions.

First viewport:
- Tracking code.
- Latest verified event.
- Last refreshed time.
- Primary action.

Event rail:
- Newest-first default because backend sorts newest first.
- Each card shows type, label, time, station, sender-safe role, and proof/issue chips.
- Date separators appear when events span days.

Filter chips:
- `All`
- `Handoffs`
- `Issues`
- `Proof`

Filter rules:
- Filters are local view controls only.
- Filters must not imply hidden events are gone.
- Active filter count must be visible.
- `All` is default.

## Visual Direction
Visual thesis:
- A verified event rail with a strong current update card.

Mood:
- Trustworthy.
- Precise.
- Calm.
- Operational.
- Easy to scan.

Material language:
- Warm neutral surface.
- Dark latest-update card.
- Timeline rail in muted ink.
- Proof chips in green.
- Issue chips in amber or red.
- Stale banner in amber.

Typography:
- Latest event title is large and literal.
- Event labels are medium weight.
- Times use compact, readable format.
- IDs use tabular style.

Spacing:
- Latest update card gets breathing room.
- Timeline event cards use consistent vertical rhythm.
- Date separators are small and sticky only if platform supports safely.
- Chips stay compact.

Motion:
- Refresh uses native pull-to-refresh.
- Event cards can fade in once after initial load.
- No moving package dots.
- Reduced motion uses immediate rendering.

## Layout Specification
Mobile portrait layout:
- Safe-area-aware header.
- Scrollable timeline.
- Pull-to-refresh.
- Sticky bottom action only for error/offline states.

Header:
- Back button.
- Title: `Tracking timeline`
- Tracking code with copy control.
- Delivery ID in secondary row only if needed.

Freshness banner:
- Shows `Updated just now`, `Updated {time}`, or `Showing saved timeline`.
- Uses text and icon.
- Does not rely on color alone.

Latest update card:
- Displays newest entry.
- Includes event type chip.
- Includes occurred time.
- Includes station/role if safe.
- Includes issue/proof chip if applicable.

Event rail:
- Vertical line.
- Dot or icon per event.
- Event cards with label and detail rows.
- Handoff events show proof chip.
- Issue events show support action when relevant.

Empty state:
- Title: `No timeline events yet`
- Body: `Kra has not recorded a verified event for this delivery yet. Check delivery detail or refresh later.`
- Primary: `Back to delivery`

## Component Structure
Root component:
- `SenderTrackingTimelineScreen`

Child components:
- `TimelineHeader`
- `TimelineFreshnessBanner`
- `TimelineLatestUpdateCard`
- `TimelineFilterChips`
- `TimelineEventRail`
- `TimelineEventCard`
- `TimelineProofChip`
- `TimelineIssueChip`
- `TimelineEmptyState`
- `TimelineErrorState`
- `TimelineOfflineState`

Component responsibilities:
- `SenderTrackingTimelineScreen` owns fetch, refresh, state mapping, filtering, and navigation.
- `TimelineHeader` owns title, back action, and tracking code copy.
- `TimelineFreshnessBanner` owns stale/fresh messaging.
- `TimelineLatestUpdateCard` owns newest event emphasis.
- `TimelineFilterChips` owns local filter state.
- `TimelineEventRail` owns ordered list and date separators.
- `TimelineEventCard` owns one event.
- `TimelineProofChip` shows safe proof type only.
- `TimelineIssueChip` shows issue severity/category if safe.
- `TimelineEmptyState` handles zero entries.
- `TimelineErrorState` handles not found, unauthorized, and API error.
- `TimelineOfflineState` handles no network.

Forbidden component behavior:
- No component mutates backend state.
- No component displays actor IDs.
- No component displays proof reference.
- No component displays raw metadata.
- No component creates issue directly.
- No component invents future events.
- No component shows live GPS.

## Test IDs
Screen:
- `screen-sender-tracking-timeline`

Header:
- `sender-timeline-header`
- `sender-timeline-title`
- `sender-timeline-tracking-code`
- `sender-timeline-copy-tracking`
- `sender-timeline-back`

Freshness:
- `sender-timeline-freshness`
- `sender-timeline-refresh`
- `sender-timeline-stale-banner`

Latest:
- `sender-timeline-latest-card`
- `sender-timeline-latest-label`
- `sender-timeline-latest-time`
- `sender-timeline-latest-type`

Filters:
- `sender-timeline-filter-all`
- `sender-timeline-filter-handoffs`
- `sender-timeline-filter-issues`
- `sender-timeline-filter-proof`

Rail:
- `sender-timeline-event-rail`
- `timeline-entry-{entry-id}`
- `sender-timeline-event-label`
- `sender-timeline-event-time`
- `sender-timeline-event-role`
- `sender-timeline-event-station`
- `sender-timeline-proof-chip`
- `sender-timeline-issue-chip`

Actions:
- `sender-timeline-back-to-delivery`
- `sender-timeline-report-issue`
- `sender-timeline-view-support`
- `sender-timeline-try-again`

States:
- `sender-timeline-loading`
- `sender-timeline-ready`
- `sender-timeline-refreshing`
- `sender-timeline-empty`
- `sender-timeline-stale`
- `sender-timeline-issue-visible`
- `sender-timeline-handoff-visible`
- `sender-timeline-proof-visible`
- `sender-timeline-not-found`
- `sender-timeline-not-authorized`
- `sender-timeline-offline`
- `sender-timeline-api-error`

## Interaction Flow
Default load:
1. User opens timeline route.
2. Screen validates delivery ID.
3. Screen calls `get_delivery_timeline`.
4. Screen parses `deliveryTimelineResponseSchema`.
5. Screen renders latest update card.
6. Screen renders event rail.

Refresh:
1. User pulls to refresh or taps refresh.
2. Screen calls `get_delivery_timeline`.
3. Screen updates last refreshed time.
4. If events changed, announce update.

Filter:
1. User taps `Handoffs`, `Issues`, or `Proof`.
2. Event rail filters locally.
3. Active chip shows count.
4. User can return to `All`.

Issue event:
1. Timeline contains issue event.
2. Issue chip appears.
3. Support/report action appears.
4. Tap routes to support or issue flow.

Proof event:
1. Timeline contains handoff proof metadata.
2. Proof chip shows proof type.
3. Proof reference remains hidden.

Offline with cache:
1. Screen opens offline with cached timeline.
2. Stale banner appears.
3. Timeline renders cached entries.
4. Refresh waits for connectivity.

Offline without cache:
1. Screen opens offline without cached timeline.
2. Offline state appears.
3. Back to delivery/home actions appear.

Not authorized:
1. Backend returns forbidden.
2. Timeline entries are not shown.
3. User routes home or support.

Not found:
1. Backend returns not found.
2. Not found state appears.
3. User routes home or delivery history.

## State Copy
Loading:
- Title: `Opening timeline`
- Body: `Kra is loading verified events for this delivery.`

Ready:
- Title: `Tracking timeline`
- Body: `Verified events are shown newest first.`

Refreshing:
- Title: `Refreshing timeline`
- Body: `Kra is checking for newer verified events.`

Empty:
- Title: `No timeline events yet`
- Body: `Kra has not recorded a verified event for this delivery yet.`
- Primary: `Back to delivery`

Stale:
- Title: `Showing saved timeline`
- Body: `Reconnect to refresh. These events may not include the latest update.`
- Primary: `Refresh when online`

Issue visible:
- Title: `Issue on timeline`
- Body: `An issue event appears in this delivery history. Open support if you need help.`
- Primary: `View support`

Not found:
- Title: `Timeline not found`
- Body: `Kra could not find timeline events for this delivery.`
- Primary: `Go home`

Not authorized:
- Title: `Access blocked`
- Body: `This timeline is not available on your sender account.`
- Primary: `Go home`

Offline:
- Title: `You are offline`
- Body: `Reconnect to load the latest verified timeline.`
- Primary: `Try again when online`

API error:
- Title: `Could not load timeline`
- Body: `Kra could not load verified events right now. Try again or return to delivery detail.`
- Primary: `Try again`
- Secondary: `Back to delivery`

## Copy Rules
Use:
- `verified event`
- `newest first`
- `handoff`
- `proof`
- `issue`
- `saved timeline`
- `refresh`
- `custody`

Do not use:
- `live location`.
- `real-time map`.
- Staff IDs.
- Internal audit wording.
- Private proof references.
- Raw metadata.
- Any copy that implies unverified movement.

Tone:
- Clear.
- Precise.
- Calm.
- Operational.
- Sender-safe.

## Data Handling Rules
Safe to display:
- `deliveryId`
- `trackingCode`
- `entryType`
- `occurredAt`
- `label`
- Sender-safe `actorRole`
- `stationId`
- Allowlisted metadata: `proofType`, `condition`, `severity`, `category`, sender-safe `summary`

Not safe to display:
- `actorId`
- `proofReference`
- Unknown metadata keys.
- Storage bucket/path.
- Receiver verification token.
- Staff assignment IDs.
- Internal audit IDs.

Copy tracking:
- Copies only `trackingCode`.
- Toast: `Tracking code copied`.
- Do not copy entry metadata.

## Accessibility Requirements
Screen reader:
- Header announces tracking code.
- Freshness banner is read before timeline events.
- Latest update card has accessible summary.
- Timeline rail is a list.
- Each event card reads event type, label, time, station, and safe role.
- Proof and issue chips have text labels.

Focus:
- Initial focus on screen title.
- Refresh completion announces changed count if events changed.
- Error states focus title.
- Filter changes announce number of visible events.

Touch:
- Filter chips minimum 44 px height.
- Event cards do not require precision taps.
- Back/report actions are reachable.

Contrast:
- Event type chips meet WCAG AA.
- Timeline rail does not rely on color alone.
- Stale banner uses icon and text.

Reduced motion:
- No moving route line.
- No animated event dots.
- Refresh indicator uses native or static fallback.

Large text:
- Event cards wrap.
- Timeline rail remains aligned.
- Filters can wrap to two rows.
- Latest card does not truncate important label.

## Performance Requirements
Initial render:
- Show header and skeleton quickly.
- Use cached timeline if available.
- Fetch fresh timeline when online.

Network:
- One `get_delivery_timeline` request at a time.
- Pull-to-refresh cancels stale request.
- Do not poll continuously.
- Do not fetch delivery detail unless parent context requires it.

Rendering:
- Use list virtualization if event count grows.
- Keep date separator rendering cheap.
- Avoid large media.
- Avoid map.

Offline:
- Show cached timeline with stale banner.
- Avoid retry loop.
- Refresh after reconnect only on user action or app-level policy.

## Analytics
Events:
- `sender_tracking_timeline_viewed`
- `sender_tracking_timeline_refreshed`
- `sender_tracking_timeline_filter_changed`
- `sender_tracking_timeline_issue_tapped`
- `sender_tracking_timeline_report_issue_tapped`
- `sender_tracking_timeline_back_to_delivery_tapped`
- `sender_tracking_timeline_tracking_copied`
- `sender_tracking_timeline_error_viewed`

Required properties:
- `deliveryId`
- `trackingCode`
- `entryCount`
- `latestEntryType`
- `hasHandoff`
- `hasIssue`
- `hasProof`
- `isStale`
- `activeFilter`

Forbidden properties:
- `actorId`
- `proofReference`
- Raw metadata.
- Receiver phone.
- Receiver address.
- Staff IDs.

Success metric:
- Sender opens timeline and returns to detail/support without confusion or invalid mutation.

Risk metric:
- Timeline error or stale state viewed without successful refresh.

Operational metric:
- Average event count and refresh latency by network state.

## QA Scenarios
Timeline ready:
1. Open timeline for accessible delivery.
2. Backend returns entries.
3. Latest update card shows newest event.
4. Event rail shows entries newest first.

Empty timeline:
1. Backend returns zero entries.
2. Empty state appears.
3. Back to delivery action works.

Handoff event:
1. Backend returns handoff event.
2. Handoff card appears.
3. Proof type chip appears if metadata has safe proof type.
4. Proof reference does not appear.

Issue event:
1. Backend returns issue event.
2. Issue chip appears.
3. Support/report action appears.
4. Raw issue metadata does not appear.

Actor safety:
1. Backend returns actor ID.
2. Actor ID does not render.
3. Role label can render.

Filter handoffs:
1. Tap handoff filter.
2. Only handoff events show.
3. Count is announced.
4. All filter restores events.

Offline cached:
1. Open with cached timeline offline.
2. Stale banner appears.
3. Events render.
4. Refresh is blocked until online.

Offline no cache:
1. Open offline without cache.
2. Offline state appears.
3. No stale events are invented.

Not authorized:
1. Backend returns forbidden.
2. No timeline entries render.
3. Go home/support route appears.

Not found:
1. Backend returns not found.
2. Not found state appears.
3. Home/history route appears.

## Automated Test Requirements
Unit tests:
- Timeline parser accepts `deliveryTimelineResponseSchema`.
- Event mapper handles `delivery_event`.
- Event mapper handles `handoff_event`.
- Event mapper handles `issue_event`.
- Actor IDs are omitted.
- Proof references are omitted.
- Unknown metadata keys are omitted.
- Filters return correct event subsets.
- Stale state derives from cached offline response.

Component tests:
- Loading state renders.
- Ready state renders latest card and rail.
- Empty state renders.
- Stale banner renders.
- Issue chip renders.
- Proof chip renders only safe proof type.
- Not authorized hides entries.
- Not found hides entries.
- Large text keeps event labels visible.
- Screen reader labels exist for event cards.

Integration tests:
- Screen calls `get_delivery_timeline` on open.
- Pull-to-refresh calls `get_delivery_timeline`.
- Back to delivery routes correctly.
- Report issue routes to issue creation.
- Timeline screen never calls mutation endpoints.
- Cached timeline shows stale banner when offline.

End-to-end tests:
- Sender opens delivery detail.
- Sender opens timeline.
- Timeline shows latest verified event.
- Sender filters handoffs.
- Sender copies tracking code.
- Sender reports issue from timeline.
- Offline cached timeline shows stale state.

## Implementation Notes For Claude Code
Build order:
1. Add route file for `/(sender)/deliveries/:deliveryId/timeline`.
2. Implement `useSenderTrackingTimeline`.
3. Implement event mapper with sender-safe metadata allowlist.
4. Implement freshness state.
5. Implement latest update card.
6. Implement event rail and event card.
7. Implement filter chips.
8. Implement offline, empty, not found, unauthorized, and API error states.
9. Add analytics with safe properties.
10. Add unit, component, integration, and end-to-end tests.

Required invariants:
- Timeline reads only `get_delivery_timeline`.
- Timeline never mutates backend state.
- Timeline never shows actor IDs.
- Timeline never shows proof references.
- Timeline never shows raw metadata.
- Timeline never invents events.
- Stale cached data is clearly marked.
- Issue reporting routes to another screen.

Suggested module boundaries:
- `mapTimelineEntryForSender`
- `getTimelineEntryTypeLabel`
- `filterTimelineEntries`
- `useSenderTrackingTimeline`
- `SenderTrackingTimelineScreen`
- `TimelineEventRail`
- `TimelineEventCard`

Suggested input contract:
- `deliveryId`
- `cachedTimeline`
- `networkState`
- `authState`
- `now`

Suggested output contract:
- `timeline`
- `state`
- `latestEntry`
- `visibleEntries`
- `activeFilter`
- `stale`
- `safeAnalyticsPayload`

Do not implement:
- Live map.
- Staff custody audit view.
- Proof media viewer.
- Issue creation mutation.
- Payment action.
- Cancellation/refund action.
- Raw event metadata panel.

## Design QA Checklist
Before closing implementation:
- Tracking code is visible.
- Latest event is visible.
- Freshness state is visible.
- Events are newest first or order is clearly labeled.
- Empty state is useful.
- Stale state is clear.
- Issue event is visible.
- Handoff event is visible.
- Proof type appears when safe.
- Proof reference is hidden.
- Actor ID is hidden.
- Raw metadata is hidden.
- Report issue routes out.
- Back to delivery works.
- No mutation endpoint is called.
- Screen works on small phones.
- Screen works with large text.
- Screen works with screen reader.
- Screen works with reduced motion.

## Handoff Summary
Claude Code should build `SenderTrackingTimeline` as the sender-safe, read-only verified event history. It must call `get_delivery_timeline`, render delivery, handoff, and issue events from `deliveryTimelineResponseSchema`, show newest update and freshness, support local filtering, hide actor IDs and private proof references, handle empty/stale/offline/error states, and route issue reporting or delivery detail navigation to separate screens without mutating backend state.
