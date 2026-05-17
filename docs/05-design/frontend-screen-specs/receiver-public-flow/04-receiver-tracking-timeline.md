# Receiver Tracking Timeline Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverTrackingTimeline` |
| App | `apps/web` |
| Route | `/r/:trackingCode/timeline` |
| Primary test ID | `screen-receiver-timeline` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/arrival`, `/r/:trackingCode/failed-attempt`, `/r/:trackingCode/refusal`, `/support`, `/delivery-policy`, `/privacy` |
| Required states | `loading`, `empty`, `stale`, `issue reported` |

## Product Job
This screen must show the receiver a safe, verified public tracking view after the receiver has opened a valid delivery link and, when required, completed phone verification. It must use the current public tracking backend contract, explain the latest verified status, show the next receiver action, and avoid inventing a detailed event history that the backend does not expose yet.

The page must help receivers:
- Understand the current package status.
- See the latest verified update.
- Know whether pickup, doorstep delivery, issue review, or no action is next.
- Continue to arrival instructions when receiver action is needed.
- Understand stale or unavailable tracking without assuming package loss.
- Contact support for issue states or missing updates.
- Trust that tracking is event-first, not live GPS.

This screen is not an authenticated sender delivery detail, staff custody chain, admin audit view, proof gallery, live map, payment page, or support case thread.

## Audience
Primary audience:
- Receivers who passed through a Kra receiver tracking link.
- Receivers who completed phone verification when the delivery stage required it.

Secondary audience:
- Senders checking what receiver-safe tracking looks like.
- Support staff helping receivers interpret public status.
- Business senders sharing tracking links with customers.

## User State
Receivers may be checking whether to go to a station, wait for doorstep delivery, prepare for OTP/signature/photo proof, or contact support after a problem. The page must be clear enough for a phone screen, honest about limited public data, and careful not to overstate ETA or movement.

## Primary Action
Primary CTA depends on status:
- `View pickup instructions` for `awaiting_receiver_pickup`.
- `View arrival instructions` for `awaiting_final_mile_assignment`, `assigned_for_final_mile`, or `out_for_delivery`.
- `Review issue status` for `issue_reported`.
- `Contact support` for `on_hold`, `delivery_failed`, or stale tracking.
- `Back to package status` for normal informational states.

Secondary CTA:
- `Contact support`

Tertiary CTA:
- `Read delivery policy`

CTA behavior:
- Pickup or arrival actions route to `/r/:trackingCode/arrival`.
- Failed doorstep state routes to `/r/:trackingCode/failed-attempt` when the status and public copy indicate failed attempt context.
- Receiver refusal state routes to `/r/:trackingCode/refusal` when the issue category is known through a future safe issue signal; until then use support.
- Support routes to `/support` without sensitive query values.
- Delivery policy routes to `/delivery-policy`.

## Main Tension
The receiver timeline must feel useful without pretending the public API has full event history. The UI can show the current status, latest verified update, stage progress, and next step, but it must not fabricate timestamps, scan locations, handoff actors, proof records, route progress, or issue details.

## Visual Thesis
Design this page as a clean receiver status board: one current status hero, one verified-update card, one simple stage timeline, and one decisive next action. It should feel like a premium carrier tracking detail view, but more disciplined about privacy and proof.

## Restraint Rule
Do not build a live logistics console. Avoid live maps, package dots, invented scan histories, raw station IDs, staff names, payment panels, proof thumbnails, dense admin timelines, and ETA countdowns.

Every visual element must help one of these:
- Explain current package state.
- Show latest verified update.
- Show receiver-safe stage progress.
- Clarify next action.
- Explain stale or issue states.
- Route to support or instructions.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of receiver tracking, carrier shipment-progress, and public-service timeline experiences.

Non-negotiable quality requirements:
- The first viewport must show current package status and next receiver action.
- The page must call only `get_public_tracking` unless future docs define a public timeline endpoint.
- The page must not call authenticated `get_delivery_timeline`.
- The page must not invent historical event timestamps.
- The page must not expose sender IDs, receiver phone, payment data, refund data, proof assets, staff names, staff IDs, raw station IDs, internal notes, or precise GPS.
- If `receiverVerificationRequired` is true and no active verification grant exists, route back to phone verification.
- Loading, empty, stale, and issue-reported states must be distinct.
- The stage timeline must clearly distinguish confirmed latest update from general status-stage guidance.
- The page must work on mobile as the primary viewport.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network conditions.

Closure rule:
- If the page implies unverified movement as fact, the screen remains open.
- If raw internal identifiers appear, the screen remains open.
- If stale tracking sounds like package loss without evidence, the screen remains open.
- If receiver action is not obvious, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- UPS tracking status guidance: tracking pages should explain common package statuses, exceptions, pickup readiness, and delivery action.
- DHL tracking guidance: tracking events may appear after network processing, so public copy should set expectations without overpromising.
- FedEx tracking patterns: detailed shipment views prioritize status, history, and actions, but Kra must only show fields in its contract.
- DWP Design System timeline notes: timeline components need simple time-series presentation and accessibility review.
- Home Office Design System timeline: event lists should show date, time, description, actor, and action only when those are real data.
- W3C WCAG 2.2 quick reference: timelines, status messages, focus, links, contrast, and reduced motion must remain accessible.

Reference links:
- https://wwwapps.ups.com/us/en/support/tracking-support/where-is-my-package/understanding-tracking-status
- https://www.dhl.com/global-en/home/tracking.html
- https://www.fedex.com/en-us/tracking.html
- https://design-system.dwp.gov.uk/components/timeline/design-notes
- https://design.homeoffice.gov.uk/design-system/components?name=Timeline
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external carrier statuses, labels, event wording, maps, icons, animations, layouts, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- What is the current package status?
- When was the latest verified update?
- What stage is the package in?
- What should I do next?
- Do I need to pick up, wait, prepare for doorstep delivery, or contact support?
- Is the tracking stale?
- Is an issue under review?
- Why am I not seeing live GPS or staff names?
- Where can I get help?

## Route And Access Rules
### Route
- Render at `/r/:trackingCode/timeline`.
- Must be public and unauthenticated.
- Must remain delivery-scoped.
- Must not require receiver account creation.

### Route Parameter
`trackingCode` must:
- Match `^KRA-[A-Z0-9-]+$`.
- Never be recorded raw in analytics.

If malformed:
- Route to `/track` or show invalid link recovery.
- Do not call API.

### Verification Gate
When `get_public_tracking` returns `receiverVerificationRequired: true`:
- If active receiver verification grant exists for this tracking code, render timeline.
- If no active grant exists, route to `/r/:trackingCode/verify-phone`.
- If grant is expired, route to phone verification with expired-session copy.

When `receiverVerificationRequired` is false:
- Render timeline without phone verification.

Rules:
- Do not pass verification token in URL.
- Do not display token.
- Do not call completion endpoints from this page.

## Backend Contract
### Public Tracking Lookup
Operation:
- `get_public_tracking`

Endpoint:
- `GET /v1/public/track/:trackingCode`

Current response:
```ts
type PublicTrackingResponse = {
  deliveryId: string;
  trackingCode: string;
  status: DeliveryStatus;
  publicLabel: string;
  latestTouchpoint: {
    role: "system" | "station_operator" | "driver" | "final_mile_courier";
    stationId?: string;
    occurredAt: string;
  };
  receiverVerificationRequired: boolean;
  etaLabel?: string;
};
```

Renderable fields:
- `trackingCode`, formatted safely.
- `publicLabel`.
- Public role label derived from `latestTouchpoint.role`.
- Formatted `latestTouchpoint.occurredAt`.
- `etaLabel` exactly as provided.
- `receiverVerificationRequired` for route gating.

Do not render:
- `deliveryId`.
- Raw `status`.
- Raw `stationId`.
- Raw role enum.
- Raw ISO timestamp.

### Timeline Limitation
Current `get_public_tracking` does not return a full array of historical public timeline entries.

Therefore:
- The UI may render a status-stage guide.
- The UI may mark stages complete based on current status order.
- The UI may mark the current stage based on `status`.
- The UI may display one actual latest verified update using `latestTouchpoint`.
- The UI must not assign timestamps to previous stages unless backend provides them.
- The UI must not call authenticated `get_delivery_timeline`.

If a future public timeline endpoint is added:
- Update this spec and API contracts before implementation uses it.
- Keep receiver privacy rules intact.

## Status Stage Model
### Stage Groups
Use these receiver-safe stage groups:
- `Booking`
- `Origin station`
- `In transit`
- `Destination station`
- `Receiver action`
- `Delivered or closed`

Mapping:
- `draft`, `created` -> `Booking`
- `received_at_origin`, `awaiting_driver_assignment`, `assigned_to_driver` -> `Origin station`
- `dispatched_from_origin`, `in_transit` -> `In transit`
- `received_at_destination` -> `Destination station`
- `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, `assigned_for_final_mile`, `out_for_delivery` -> `Receiver action`
- `delivered`, `cancelled`, `closed` -> `Delivered or closed`
- `issue_reported`, `on_hold`, `delivery_failed` -> issue or blocked state outside normal progression

Rules:
- Completed stages are visual guide only unless timestamp exists.
- The current stage must use `publicLabel`.
- Do not show exact station names unless public station data is available.
- Do not show internal station IDs.

## State Model
### `loading`
Use when:
- Tracking lookup is in flight.

Required UI:
- Skeleton status card.
- Text: `Loading receiver tracking...`
- No blank page.
- No internal data.

Test ID:
- `state-receiver-timeline-loading`

### `ready`
Use when:
- Public tracking loads.
- No stale or issue state applies.

Required UI:
- Current status hero.
- Latest verified update card.
- Stage timeline guide.
- Next action card.
- Privacy note.

Test ID:
- `state-receiver-timeline-ready`

### `empty`
Use when:
- Public tracking response is structurally valid but lacks enough safe data to render status.
- Future public timeline entries are empty and no current status can be displayed.

Required UI:
- Title: `Tracking update not available yet`
- Body: `Kra has not published a receiver-safe update for this package yet. Check again later.`
- CTA: `Try again`

Test ID:
- `state-receiver-timeline-empty`

### `stale`
Use when:
- Latest verified update is older than the public freshness threshold.

Recommended threshold:
- `24 hours` for active movement states.
- `72 hours` for `awaiting_receiver_pickup`.
- Do not show stale state for terminal statuses unless policy requires it.

Required UI:
- Title: `Tracking has not updated recently`
- Body: `The latest verified update may be delayed. This does not mean the package is lost.`
- CTA: `Contact support`
- Secondary CTA: `Try again`

Test ID:
- `state-receiver-timeline-stale`

### `issue_reported`
Use when:
- `status` is `issue_reported`, `on_hold`, or `delivery_failed`.

Required UI:
- Title: `Package issue under review`
- Body: `Kra is reviewing this package status. Public updates will appear when available.`
- CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Privacy rule:
- Do not show internal issue category or notes unless future public issue contract exists.

Test ID:
- `state-receiver-timeline-issue-reported`

### `verification_required`
Use when:
- Backend requires verification and no active grant exists.

Required UI:
- Title: `Verify phone to view receiver tracking`
- CTA: `Verify phone`
- Route to `/r/:trackingCode/verify-phone`.

Test ID:
- `state-receiver-timeline-verification-required`

### `service_unavailable`
Use when:
- API returns 5xx, timeout, maintenance, or route unavailable.

Required UI:
- Title: `Tracking is temporarily unavailable`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-timeline-unavailable`

### `offline`
Use when:
- Browser is offline or cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- CTA: `Try again`

Test ID:
- `state-receiver-timeline-offline`

## Layout Blueprint
### Mobile
Order:
- Header.
- Current status hero.
- Primary next action.
- Latest verified update.
- Stage timeline.
- Receiver guidance.
- Support and policy links.
- Privacy note.

Rules:
- Current status and action must be above fold.
- Stage timeline uses vertical layout.
- Avoid tables.
- Avoid horizontal scroll.

### Desktop
Use a two-zone layout:
- Main column: status hero, stage timeline, latest update.
- Side column: next action, support, privacy.

Keep max content width around `1120px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Receiver tracking`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in prompt.
- Admin links.
- Pricing CTA.

## Visual Direction
### Mood
Clear, reassuring, operational, and honest.

### Composition
- Strong status hero.
- Simple vertical stage timeline.
- One decisive next action card.
- Small privacy note.

### Color Rules
- `brand.blue.600` for active normal progress.
- `success.green.600` for delivered.
- `warning.amber.600` for waiting, stale, or issue review.
- `danger.red.600` only for blocked or unavailable states.
- Neutrals for supporting cards and dividers.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, status labels, dates, and data.
- Current status should be the dominant text.
- Dates and secondary labels should be readable but not over-emphasized.

### Motion
- Use subtle reveal only if it helps orientation.
- No live movement animation.
- No pulsing map dots.
- Respect `prefers-reduced-motion`.

## Content Structure
### Current Status Hero
Required fields:
- Tracking code.
- Public label.
- ETA label if provided.
- Latest update relative time.
- Next action.

Copy:
- Title uses backend `publicLabel`.
- Supporting line: `Latest verified update from {roleLabel}.`
- ETA line: use `etaLabel` exactly.

Do not show:
- Raw status enum.
- Raw station ID.
- Internal role.

### Latest Verified Update Card
Title:
- `Latest verified update`

Fields:
- `Role`: public role label.
- `Time`: formatted latest touchpoint time.
- `Location`: only if public station name exists.

Fallback location:
- `Kra network update`

### Stage Timeline
Title:
- `Package journey`

Important copy:
- `Only the latest update has a verified timestamp on this page. Earlier stages show the general journey based on the current package status.`

Stage item fields:
- Label.
- State: `Complete`, `Current`, `Next`, `Blocked`, or `Not started`.
- Description.

Rules:
- Do not attach timestamps to stages without data.
- Do not show actor names.
- Do not show proof.

### Next Action Card
Title depends on state:
- `Next: pick up package`
- `Next: prepare for doorstep delivery`
- `Next: wait for the next update`
- `Issue under review`
- `Delivery complete`

Actions:
- `View pickup instructions`
- `View arrival instructions`
- `Contact support`
- `Read delivery policy`

### Privacy Note
Title:
- `Why tracking is limited`

Copy:
- `Kra shows verified package milestones here. Receiver phone, address, payment details, staff identities, proof files, and live GPS are not public.`

## Public Role Copy
Map roles:
- `system`: `Kra system update`
- `station_operator`: `Kra station update`
- `driver`: `Line-haul update`
- `final_mile_courier`: `Doorstep delivery update`
- Unknown: `Kra update`

Rules:
- Never show raw enum.
- Never show staff identity.

## Next Action Mapping
### `created`
Action:
- `Wait for origin station intake`

Copy:
- `The delivery has been created. Tracking updates begin as Kra records verified package movement.`

### `received_at_origin`, `awaiting_driver_assignment`, `assigned_to_driver`
Action:
- `Wait for dispatch`

Copy:
- `The package is moving through origin station processing.`

### `dispatched_from_origin`, `in_transit`
Action:
- `Wait for destination arrival`

Copy:
- `The package is moving between Kra stations.`

### `received_at_destination`
Action:
- `Wait for receiver action`

Copy:
- `The package has reached the destination station.`

### `awaiting_receiver_pickup`
Action:
- `View pickup instructions`

Route:
- `/r/:trackingCode/arrival`

### `awaiting_final_mile_assignment`, `assigned_for_final_mile`, `out_for_delivery`
Action:
- `View arrival instructions`

Route:
- `/r/:trackingCode/arrival`

### `delivered`
Action:
- `Delivery complete`

Copy:
- `This package has been marked delivered with accepted proof.`

Do not show proof assets here.

### `issue_reported`, `on_hold`, `delivery_failed`
Action:
- `Contact support`

Copy:
- `Kra is reviewing the package status.`

## Component Requirements
### `ReceiverTrackingTimelineScreen`
Responsibilities:
- Validate route code.
- Enforce verification gate.
- Fetch public tracking.
- Map response to receiver-safe status.
- Render current status, latest update, stage guide, and next action.
- Emit privacy-safe analytics.

### `ReceiverCurrentStatusHero`
Props:
- `trackingCode`
- `publicLabel`
- `etaLabel`
- `latestUpdatedAt`
- `nextAction`

Behavior:
- Shows current status and action.
- Does not render raw backend fields.

### `ReceiverLatestUpdateCard`
Props:
- `role`
- `occurredAt`
- `stationDisplayName`

Behavior:
- Maps role to public copy.
- Hides station ID if no public name exists.
- Formats time.

### `ReceiverStageTimeline`
Props:
- `status`
- `latestTouchpoint`

Behavior:
- Renders general journey stages.
- Marks current stage.
- Makes timestamp limitation explicit.
- Avoids invented historical timestamps.

### `ReceiverNextActionCard`
Props:
- `status`
- `receiverVerificationRequired`
- `trackingCode`

Behavior:
- Routes to arrival, failed attempt, support, or policy.
- Keeps action copy specific.

### `ReceiverTrackingPrivacyNote`
Behavior:
- Explains what is not public.
- Links to privacy.

### `ReceiverTimelineErrorState`
Behavior:
- Handles empty, stale, issue, unavailable, offline, and verification-required states.

## Data Handling
### Local State
May store:
- Public tracking response.
- Loading state.
- Error bucket.
- Verification grant presence.
- Last refresh timestamp.

Must not store:
- Proof assets.
- Payment data.
- Sender data.
- Raw station IDs in analytics.
- Verification token beyond approved ephemeral receiver state.

### Refresh
Manual refresh:
- `Try again`

Optional automatic refresh:
- No more often than every `60 seconds`.
- Pause in hidden tab.
- Do not poll aggressively.

Rules:
- Do not show movement that was not returned by backend.
- Do not reset focus during background refresh.

## Stale Tracking Rules
### Freshness Thresholds
Recommended thresholds:
- Active movement statuses: stale after `24 hours`.
- Receiver pickup hold: stale after `72 hours`.
- Issue statuses: use issue state, not stale.
- Delivered/cancelled/closed: terminal, not stale.

### Stale Copy
Title:
- `Tracking has not updated recently`

Body:
- `The latest verified update may be delayed. This does not mean the package is lost.`

Actions:
- `Try again`
- `Contact support`

Do not:
- Declare package lost.
- Promise a callback.
- Invent next scan time.

## Security And Privacy
### Public Data Rule
This page is receiver-scoped but still public-link accessible. Treat it as sensitive.

Do not display:
- Sender ID.
- Sender name.
- Receiver phone.
- Receiver address.
- Payment status.
- Refund status.
- Proof images.
- Signature.
- OTP status beyond verified session state.
- Staff names.
- Staff IDs.
- Raw station IDs.
- Audit metadata.
- Internal issue notes.
- Precise GPS.

### Verification Token Rule
If verification token is required:
- Read only from approved ephemeral state.
- Never show token.
- Never send token to analytics.
- Never put token in query/hash.
- Clear expired token.

### Support Link Rule
Support route must not include sensitive values.

Allowed:
- Generic source bucket such as `source=receiver_tracking` if app uses it.

Not allowed:
- tracking code.
- token.
- phone.
- delivery ID.
- issue details.

## Analytics Requirements
Required events:
- `receiver_timeline_viewed`
- `receiver_timeline_refresh_clicked`
- `receiver_timeline_next_action_clicked`
- `receiver_timeline_support_clicked`
- `receiver_timeline_stale_shown`
- `receiver_timeline_issue_shown`

Allowed properties:
- `statusBucket`
- `stage`
- `verificationRequired`
- `hasActiveVerification`
- `etaShown`
- `resultState`
- `stale`
- `trackingCodePrefix` or approved non-raw tracking reference

Do not record:
- full tracking code.
- delivery ID.
- token.
- phone.
- raw station ID.
- proof data.
- payment data.
- full URL.

## Accessibility Requirements
### Semantics
- Use one `h1`.
- Use `main`.
- Timeline should be a list.
- Current stage must be announced as current.
- Status updates use polite live region.
- Error states use clear headings.

### Timeline Accessibility
- Do not rely on connector lines alone.
- Stage state must be text.
- Use `aria-current="step"` or equivalent for current stage.
- Dates must be human-readable.
- Avoid hover-only detail.

### Focus
- On manual refresh, keep focus on refresh button or move to status summary with clear announcement.
- Do not move focus during background refresh.
- Primary action must be reachable before long detail on mobile.

### Motion
- No auto-scrolling timeline.
- No moving package marker.
- Respect reduced motion.

## SEO And Metadata
This route is delivery-scoped and must not be indexed.

Set:
- `robots: noindex, nofollow`
- `title`: `Receiver Tracking Timeline | Kra`
- `description`: `View receiver-safe Kra package tracking status and next steps.`

Open graph:
- Generic Kra tracking metadata only.
- Do not include status or tracking code.

## Error Recovery Matrix
| State | User Message | Primary Action | Secondary Action | Data Exposure |
| --- | --- | --- | --- | --- |
| `loading` | Loading receiver tracking | none | none | none |
| `empty` | Tracking update not available | `Try again` | support | no delivery detail |
| `stale` | Tracking has not updated recently | `Try again` | support | safe status only |
| `issue_reported` | Package issue under review | support | policy | safe status only |
| `verification_required` | Verify phone to view tracking | verify phone | package status | no sensitive detail |
| `service_unavailable` | Tracking unavailable | retry | support | none |
| `offline` | Connection offline | retry | policy | cached public policy only |

## Testing Requirements
### Unit Tests
Test:
- Valid route calls `get_public_tracking`.
- Malformed route does not call API.
- Verification required without active grant routes to phone verification.
- Verification required with active grant renders timeline.
- Raw `deliveryId` is not rendered.
- Raw `stationId` is not rendered.
- Raw status enum is not rendered.
- Stage timeline does not render invented timestamps.
- `issue_reported` renders issue state.
- Stale threshold renders stale state.
- Terminal statuses do not render stale state.
- Support link omits sensitive data.

### Integration Tests
Test:
- `/r/:trackingCode/timeline` renders `screen-receiver-timeline`.
- `awaiting_receiver_pickup` primary action routes to arrival instructions.
- `out_for_delivery` primary action routes to arrival instructions.
- `issue_reported` primary action routes to support.
- Refresh calls only `get_public_tracking`.
- No authenticated delivery timeline endpoint is called.

### Accessibility Tests
Test:
- One `h1`.
- Timeline is a list.
- Current step is announced.
- Stage states are text-visible.
- Primary action is keyboard reachable.
- Refresh does not steal focus unexpectedly.
- Page works at `200%` zoom.
- Reduced motion removes nonessential transitions.

### End-To-End Tests
Test name: `receiver_timeline_ready`
- Visit `/r/KRA-0001/timeline` with non-sensitive status.
- Stub `get_public_tracking` success.
- Assert `screen-receiver-timeline` is visible.
- Assert public label is visible.
- Assert no raw station ID is visible.

Test name: `receiver_timeline_verification_required`
- Visit `/r/KRA-0001/timeline`.
- Stub public tracking with `receiverVerificationRequired: true`.
- Do not provide active grant.
- Assert route goes to `/r/KRA-0001/verify-phone`.

Test name: `receiver_timeline_issue_reported`
- Stub status `issue_reported`.
- Assert issue state is visible.
- Assert issue details are not visible.

Test name: `receiver_timeline_stale`
- Stub old latest touchpoint timestamp.
- Assert stale copy is visible.
- Assert package loss copy is not visible.

Test name: `receiver_timeline_no_authenticated_timeline`
- Visit timeline.
- Assert no call is made to `/v1/deliveries/:id/timeline`.

## Implementation Notes For Claude Code
### Build Scope
Build only the receiver tracking timeline screen and its receiver-safe supporting components. Do not implement arrival instructions, failed-attempt details, refusal details, support case flow, admin timelines, or staff custody chain in this task.

### Files To Consider
Likely implementation areas:
- `apps/web` route for `/r/:trackingCode/timeline`.
- Receiver public tracking components.
- Public tracking API client.
- Receiver verification state reader.
- Stage timeline component.
- Public analytics wrapper.
- Receiver public tests.

### Contract Discipline
Use existing shared contracts:
- `trackingCodeSchema`
- `publicTrackingResponseSchema`

Do not:
- Add frontend-only public event history as fact.
- Call authenticated timeline endpoints.
- Add backend fields.
- Show internal status enums.
- Show raw station IDs.
- Use verification token outside approved state.

## Acceptance Criteria
The screen is complete when:
- `/r/:trackingCode/timeline` renders `screen-receiver-timeline`.
- Current public status is visible.
- Latest verified update is visible.
- Stage guide is shown without invented timestamps.
- Required states are covered: loading, empty, stale, issue reported.
- Verification-required gate routes to phone verification when no active grant exists.
- Next action routes match status.
- Sensitive fields are excluded from DOM, URL, and analytics.
- Accessibility tests pass.
- E2E tests cover ready, verification-required, issue, stale, and no authenticated timeline calls.

## Source Alignment Checklist
This spec aligns with:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/tracking-spec.md`
- `docs/08-security/authentication-flows.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/public-tracking.ts`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/routes.ts`

## Anti-Patterns To Reject
Reject any implementation that:
- Calls authenticated `get_delivery_timeline`.
- Invents tracking events.
- Adds timestamps to stages without backend data.
- Shows raw station IDs.
- Shows staff identities.
- Shows live GPS.
- Shows payment or refund state.
- Shows proof assets.
- Shows issue notes.
- Treats stale tracking as package loss.
- Polls aggressively.
- Hides next action below long detail on mobile.

## Final Quality Review
Before closing implementation, review the built screen from five viewpoints:
- Receiver: understands status and next action.
- Sender: sees public tracking is useful but privacy-safe.
- Support agent: can explain stale and issue states.
- Security reviewer: sees no internal or sensitive data.
- Accessibility reviewer: can understand the timeline without color or motion.

Pass condition:
- The page feels like a trustworthy receiver tracking detail screen.
- It is honest about what is verified.
- It does not overstate the current backend contract.
- It moves the receiver to the correct next action without leaking private data.
