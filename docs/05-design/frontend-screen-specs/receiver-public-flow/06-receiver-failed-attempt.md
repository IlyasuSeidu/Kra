# Receiver Failed Attempt Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverFailedAttempt` |
| App | `apps/web` |
| Route | `/r/:trackingCode/failed-attempt` |
| Primary test ID | `screen-receiver-failed-attempt` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/r/:trackingCode/arrival`, `/r/:trackingCode/refusal`, `/support`, `/delivery-policy`, `/privacy` |
| Required states | `attempt recorded`, `rerouted`, `issue queue` |

## Product Job
This screen explains what happens when a doorstep handoff cannot be completed and the receiver opens the failed-attempt path. It must translate the current public tracking status into a safe next-step explanation without exposing courier notes, internal reason codes, attempt counts, proof records, station IDs, or issue details.

The page must help receivers:
- Understand that the doorstep handoff did not complete or cannot continue from the current route.
- See the current receiver-safe package status.
- Know whether Kra is preparing another doorstep attempt, routing the package to pickup, or sending the case to support review.
- Understand the one-reattempt policy and pickup fallback.
- Understand when refusal or package issues move the delivery into review.
- Avoid paying cash, sharing OTP remotely, or relying on old screenshots.
- Contact support when the public status is blocked or does not match what happened.

This screen is not a courier report, support investigation, proof gallery, dispute form, refund workflow, address editor, payment page, live map, station admin page, or final-mile completion tool.

## Audience
Primary audience:
- Receivers who got a failed-attempt notice, SMS, or tracking prompt.
- Receivers who missed a doorstep courier or could not complete proof.
- Receivers whose package was moved back to pickup or support review after a failed doorstep flow.

Secondary audience:
- Senders trying to understand why the receiver cannot complete doorstep delivery.
- Support staff guiding receivers through policy-safe next steps.
- Couriers and station staff who need public receiver copy to match backend routing.

## User State
The receiver may be frustrated, worried the courier never arrived, unsure whether another attempt will happen, or unclear whether they must now pick up from a station. The page must be direct, emotionally calm, and operational. It should not over-defend the courier or expose private notes. It should acknowledge the missed handoff and give the next safe action.

## Primary Action
Primary CTA depends on status:
- `Back to tracking timeline` for status context.
- `View arrival instructions` when pickup or doorstep handoff is again actionable.
- `Contact support` for issue, hold, terminal failure, mismatch, or unavailable status.
- `Read delivery policy` as policy support.

CTA behavior:
- `Back to tracking timeline` routes to `/r/:trackingCode/timeline`.
- `View arrival instructions` routes to `/r/:trackingCode/arrival`.
- `Contact support` routes to `/support` without sensitive query values.
- `Read delivery policy` routes to `/delivery-policy`.
- No CTA on this page may mutate delivery state or record an attempt.

## Main Tension
The inventory requires `attempt recorded`, `rerouted`, and `issue queue`, but the current public tracking contract does not expose failed-attempt reason, failed-attempt count, delivery note, proof state, or event type. The UI must be honest about the public data it has. It can explain the policy and current next path, but it must not claim a specific reason, exact attempt number, or courier action unless a future public-safe failed-attempt field exists.

## Visual Thesis
Design this page as a recovery command center for receivers: one status explanation, one next-path card, one policy timeline, and one support escape hatch. It should feel serious, calm, and evidence-led, not accusatory or defensive.

## Restraint Rule
Do not build a complaint wall. Avoid courier blame language, driver photos, route maps, internal notes, attempt receipts, proof files, payment panels, refund promises, and broad apology copy.

Every element must help one of these:
- Explain the current next path.
- Clarify reattempt, pickup, or support review.
- Protect receiver data and OTP.
- Prevent wrong actions after a missed handoff.
- Route to support or policy.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside top-tier carrier missed-delivery experiences while being more honest about data limits and more protective of receiver privacy.

Non-negotiable quality requirements:
- First viewport must state the current package status and next receiver action.
- The page must call only `get_public_tracking`.
- The page must never call `record_failed_attempt`, `complete_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `create_issue`, `refund_payment`, or any staff endpoint.
- The page must not expose failed-attempt reason, count, note, courier ID, staff identity, station ID, receiver phone, address, proof asset, payment state, refund state, GPS, or issue notes.
- Attempt copy must be policy-based unless a future public contract exposes safe attempt data.
- The first failed-attempt policy must explain one reattempt within `24 hours`.
- The second failed-attempt policy must explain return to pickup flow.
- Refusal or package-issue path must explain support review without revealing internal category.
- The page must not promise automatic refunds.
- The page must not imply a simple missed doorstep attempt sets `delivery_failed`.
- The page must work first on mobile.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network.

Closure rule:
- If the page names a reason the backend did not expose publicly, the screen remains open.
- If the page reveals attempt count from private delivery data, the screen remains open.
- If the page makes receiver action unclear, the screen remains open.
- If the page sounds like a final investigation ruling, the screen remains open.
- If any staff-only endpoint is called, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- FedEx missed-delivery help shows that missed delivery pages should explain notice-based next steps, pickup holding, redirection, and support without requiring the receiver to understand internal operations.
- UPS Delivery Notice guidance shows that missed-delivery pages should center tracking status, delivery details, reattempt possibility, pickup fallback, and support.
- DHL missed-courier guidance shows a simple receiver path: reattempt after a missed visit, then pickup from a center after repeated failure.
- W3C WCAG 2.2 guidance requires clear status, instructions, focus order, error identification, and accessible recovery actions.

Reference links:
- https://www.fedex.com/en-us/customer-support/faqs/receiving/tracking-questions/missed-delivery.html
- https://www.ups.com/us/en/support/tracking-support/where-is-my-package/how-to-use-infonotice
- https://www.dhlecommerce.nl/en/business/support/delivering/missed-delivery
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external carrier notices, ID rules, holding periods, release forms, COD wording, account flows, page layouts, maps, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Did doorstep handoff complete?
- What does the current status say now?
- Is another doorstep attempt possible?
- Has the package moved to pickup?
- Is this in support review?
- What should I do next?
- Should I share OTP now?
- Do I owe cash?
- Where do I get help?
- Why are courier notes and exact reason not shown?

## Route And Access Rules
### Route
- Render at `/r/:trackingCode/failed-attempt`.
- Must be public and unauthenticated.
- Must remain delivery-scoped.
- Must not require receiver account creation.
- Must not expose staff tools.

### Route Parameter
`trackingCode` must:
- Match `^KRA-[A-Z0-9-]+$`.
- Never be recorded raw in analytics.
- Never be included in page title metadata.
- Be displayed only as receiver reference, not as access credential.

If malformed:
- Show invalid tracking recovery or route to `/track`.
- Do not call API.

### Verification Gate
When `get_public_tracking` returns `receiverVerificationRequired: true`:
- If active receiver verification grant exists for this tracking code, render failed-attempt page.
- If no active grant exists, route to `/r/:trackingCode/verify-phone`.
- If grant is expired, route to phone verification with expired-session copy.

When `receiverVerificationRequired` is false:
- Render status-appropriate public copy.

Rules:
- Do not pass verification token in URL.
- Do not render verification token.
- Do not call completion, attempt-recording, proof, issue, or refund endpoints.

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
- `etaLabel` exactly as returned.
- `receiverVerificationRequired` for route gating.

Do not render:
- `deliveryId`.
- Raw `status`.
- Raw `stationId`.
- Raw role enum.
- Raw ISO timestamp.
- Any value not returned by the endpoint.

### Current Contract Limitation
The current endpoint does not return:
- Failed-attempt event type.
- Failed-attempt reason.
- Failed-attempt count.
- Attempt timestamp separate from `latestTouchpoint`.
- Courier note.
- Courier identity.
- Receiver address.
- Proof failure detail.
- Refusal detail.
- Issue category.
- Support case ID.
- Pickup station display name or address.

Therefore:
- The UI must not claim `first attempt` or `second attempt` as fact.
- The UI must not show a reason such as unavailable, unreachable, unsafe, address not found, proof failed, receiver refused, or package issue unless a future public-safe signal is available.
- The UI may explain policy paths and current status.
- The UI may infer next path only from current status group.
- The UI may say `A failed doorstep handoff can move to this status` rather than `This happened because...`.

If a future public failed-attempt summary endpoint is added:
- Update this spec and API contracts before implementation renders reason, count, timestamp, or next reattempt window.
- Keep receiver privacy restrictions intact.

## Authorized And Forbidden Operations
### Authorized
This screen may call:
- `get_public_tracking`

This screen may read from local client state:
- Active receiver verification grant existence.
- Verification grant expiry timestamp.
- Browser online/offline state.
- Route source if provided by the app shell, but not as evidence of a failed attempt.

### Forbidden
This screen must never call:
- `record_failed_attempt`
- `get_delivery`
- `get_delivery_timeline`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `create_issue`
- `list_issues`
- `refund_payment`
- Any account, staff, admin, courier, station, finance, support-admin, or sender endpoint.

This screen must never render controls for:
- Recording a failed attempt.
- Selecting failed-attempt reason.
- Editing courier notes.
- Marking receiver unavailable.
- Marking receiver refused.
- Uploading proof.
- Completing delivery.
- Changing address.
- Requesting refund.
- Opening formal dispute.
- Reassigning courier.

## Backend Failed-Attempt Policy Summary
Backend behavior:
- A courier may record a failed final-mile attempt only through staff-authenticated `record_failed_attempt`.
- Allowed reason codes are `receiver_unreachable`, `receiver_unavailable`, `address_not_found`, `unsafe_to_complete`, `receiver_refused`, `proof_failed`, and `package_issue_detected`.
- If the current status is `assigned_for_final_mile`, recording an attempt first moves it through `out_for_delivery`.
- Refusal or package issue routes to `issue_reported`.
- A non-issue first attempt routes to `awaiting_final_mile_assignment`.
- A non-issue second attempt routes to `awaiting_receiver_pickup`.
- Final-mile custody returns to station after failed-attempt handling.
- A simple failed doorstep attempt must not set canonical status to `delivery_failed`.

Public UI implications:
- Show `another doorstep attempt may be prepared` when status is `awaiting_final_mile_assignment`.
- Show `pickup is the next safe path` when status is `awaiting_receiver_pickup`.
- Show `support review is needed` when status is `issue_reported`, `on_hold`, or `delivery_failed`.
- Do not display reason code, note, or count.

## Status Interpretation
### `attempt_recorded`
Use when:
- Current status is `awaiting_final_mile_assignment` and the user is on the failed-attempt route.

Meaning:
- A failed doorstep handoff may have returned the package to final-mile assignment.
- The public API does not confirm the reason or count.

Receiver action:
- Watch tracking for a new courier assignment.
- Keep phone available.
- Do not share OTP until a courier physically arrives with the package.

### `rerouted_to_pickup`
Use when:
- Current status is `awaiting_receiver_pickup`.

Meaning:
- Pickup is now the current receiver-safe path.
- This may happen after repeated failed doorstep handling or direct destination-station routing.

Receiver action:
- View arrival instructions.
- Prepare to pick up at the destination Kra station when practical.
- Contact support if pickup is not possible.

### `issue_queue`
Use when:
- Current status is `issue_reported`, `on_hold`, or `delivery_failed`.

Meaning:
- The package needs support or operations review before normal handoff can continue.

Receiver action:
- Contact support.
- Read delivery policy if needed.
- Do not go to pickup or share proof until status changes.

### `not_failed_attempt_context`
Use when:
- Current status does not support failed-attempt explanation.

Meaning:
- The package may not currently be in a failed-attempt path.

Receiver action:
- Return to tracking timeline or arrival instructions based on status.

## State Model
### `loading`
Use when:
- Tracking lookup is in flight.

Required UI:
- Skeleton status card.
- Skeleton next-path card.
- Text: `Loading missed-delivery information...`

Test ID:
- `state-receiver-failed-attempt-loading`

### `verification_required`
Use when:
- Backend requires verification and no active grant exists.

Required UI:
- Title: `Verify phone to view missed-delivery information`
- Body: `This package is in a receiver-sensitive stage. Verify the receiver phone before viewing next steps.`
- CTA: `Verify phone`

Test ID:
- `state-receiver-failed-attempt-verification-required`

### `attempt_recorded`
Use when:
- Current status is `awaiting_final_mile_assignment`.

Required UI:
- Title: `Doorstep handoff did not complete`
- Body: `The package is waiting for the next doorstep assignment. Watch tracking for the next update.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Required guidance:
- One reattempt is allowed within `24 hours` after the first failed doorstep attempt.
- No new doorstep surcharge is added for the first policy reattempt.
- OTP should not be shared until physical handoff.
- No cash collection is allowed.

Test ID:
- `state-receiver-failed-attempt-recorded`

### `rerouted_to_pickup`
Use when:
- Current status is `awaiting_receiver_pickup`.

Required UI:
- Title: `Pickup is now the next path`
- Body: `The package is ready for pickup at the destination Kra station. View arrival instructions before you go.`
- Primary CTA: `View arrival instructions`
- Secondary CTA: `Contact support`

Required guidance:
- After repeated failed doorstep handling, pickup rules may apply.
- Pickup is normally held for `72 hours` before hold review.
- Do not rely on a previous doorstep OTP or screenshot.
- If pickup is not possible, contact support.

Test ID:
- `state-receiver-failed-attempt-rerouted`

### `issue_queue`
Use when:
- Current status is `issue_reported`, `on_hold`, or `delivery_failed`.

Required UI:
- Title: `Support review is needed`
- Body: `Kra is reviewing this package status before normal handoff can continue.`
- Primary CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Required guidance:
- Receiver refusal or package issue can route a package to review.
- Public tracking does not show internal notes.
- Do not attempt pickup or proof handoff until status changes or support advises.

Test ID:
- `state-receiver-failed-attempt-issue-queue`

### `out_for_delivery`
Use when:
- Current status is `out_for_delivery`.

Required UI:
- Title: `Delivery is active now`
- Body: `The package is currently out for delivery. Prepare for physical handoff and OTP proof.`
- Primary CTA: `View arrival instructions`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-failed-attempt-out-for-delivery`

### `delivered`
Use when:
- Current status is `delivered`.

Required UI:
- Title: `Delivery is complete`
- Body: `This package has been marked delivered with accepted proof. Contact support if you did not receive it.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Rules:
- Do not show proof content.
- Do not show proof type unless future public proof contract allows it.

Test ID:
- `state-receiver-failed-attempt-delivered`

### `not_failed_attempt_context`
Use when:
- Status is before receiver action or otherwise not a failed-attempt path.

Required UI:
- Title: `No missed-delivery action is available`
- Body: `Current tracking does not show a receiver missed-delivery path. Return to tracking for the latest status.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-failed-attempt-not-context`

### `closed`
Use when:
- Current status is `cancelled` or `closed`.

Required UI:
- Title: `Delivery is closed`
- Body: `This tracking code is not open for receiver handoff. Contact support if you believe this is incorrect.`
- Primary CTA: `Contact support`
- Secondary CTA: `Back to tracking timeline`

Test ID:
- `state-receiver-failed-attempt-closed`

### `service_unavailable`
Use when:
- API returns 5xx, timeout, maintenance, or route unavailable.

Required UI:
- Title: `Missed-delivery information is temporarily unavailable`
- Body: `Try again. If a courier is waiting with your package, contact support before sharing OTP or personal information.`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-failed-attempt-unavailable`

### `offline`
Use when:
- Browser is offline or cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect to load the current package status. Do not rely on an old missed-delivery screenshot.`
- CTA: `Try again`

Test ID:
- `state-receiver-failed-attempt-offline`

### `invalid_tracking_code`
Use when:
- Route parameter fails validation.

Required UI:
- Title: `Tracking link is not valid`
- Body: `Check the tracking link and try again.`
- CTA: `Track another package`

Test ID:
- `state-receiver-failed-attempt-invalid`

## Layout Blueprint
### Mobile
Order:
- Header.
- Current status hero.
- Next path card.
- Policy timeline.
- What not to do card.
- Support card.
- Privacy note.

Rules:
- Status and next step must be above the fold.
- Use short, plain headings.
- Keep policy as three compact steps.
- No tables on mobile.
- Avoid horizontal scroll.
- Keep tap targets at least `44px`.

### Desktop
Use a two-zone layout:
- Main column: status hero, next path, policy timeline.
- Side column: support, safety reminders, privacy note.

Keep max content width around `1120px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Missed delivery`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in.
- Staff sign-in.
- Admin links.
- Pricing CTA.

## Visual Direction
### Mood
Calm, accountable, practical, and recovery-focused.

### Composition
- Strong current-state hero.
- Large next-path card with one CTA.
- Three-step policy timeline.
- Safety panel for OTP and cash.
- Compact privacy note.

### Color Rules
- `warning.amber.600` for missed handoff and waiting.
- `brand.blue.600` for next valid action.
- `success.green.600` for delivered.
- `danger.red.600` only for blocked, unavailable, or unsafe-sharing warnings.
- Neutral surfaces for policy explanation.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and policy text.
- Next path heading must be visually dominant after status.
- Policy timeline labels must be short enough for mobile.

### Iconography
Allowed icon ideas:
- Missed handoff.
- Reattempt.
- Station pickup.
- Support review.
- Shield for OTP safety.

Rules:
- Icons must not imply a confirmed event not present in public data.
- Do not use courier face, vehicle route, exact address pin, or proof image icon as factual data.

### Motion
- Use subtle entry animation only for status and next-path card.
- No moving route line.
- No courier animation.
- No countdown timer.
- Respect `prefers-reduced-motion`.

## Content Structure
### Status Hero
Required fields:
- Eyebrow: `Missed delivery`
- Tracking code, formatted safely.
- Public status label from `publicLabel`.
- Latest verified update source.
- ETA label if backend provides `etaLabel`.

Copy:
- Supporting line: `Latest verified update from {roleLabel}.`
- Data-limit line: `This page shows receiver-safe missed-delivery guidance based on the current tracking status.`

Do not show:
- Raw status enum.
- Raw station ID.
- Raw ISO time.
- Raw role enum.
- Delivery ID.
- Attempt reason or count.

### Next Path Card
Purpose:
- Tell the receiver what to do now.

Required variants:
- `attempt_recorded`: wait for next doorstep assignment.
- `rerouted_to_pickup`: view arrival instructions for pickup.
- `issue_queue`: contact support.
- `out_for_delivery`: view arrival instructions.
- `delivered`: contact support only if package was not received.
- `not_failed_attempt_context`: return to timeline.
- `closed`: contact support.

Rules:
- Exactly one dominant CTA.
- Secondary CTA only for support or policy.
- Do not place policy text before the next action.

### Policy Timeline
Title:
- `What happens after a missed doorstep handoff`

Steps:
- `Attempt recorded`: `Kra records that doorstep handoff did not complete.`
- `One reattempt`: `One policy reattempt may happen within 24 hours after the first failed doorstep attempt.`
- `Pickup or review`: `After repeated failure, pickup rules may apply. Refusal or package issues move to review.`

Rules:
- Use `may` where current public data does not confirm this specific delivery path.
- Do not show exact attempt count.
- Do not show reason code.
- Do not show courier note.

### What Not To Do Card
Title:
- `Do not use old proof or cash`

Content:
- `Do not share an OTP from an old message unless the courier is physically handing over the package.`
- `Do not pay cash to complete final-mile delivery.`
- `Do not rely on an old screenshot if tracking has changed.`
- `Contact support if the package status does not match what happened.`

### Reroute Explanation Card
Use when state is `rerouted_to_pickup`.

Title:
- `Why pickup may be next`

Copy:
- `If doorstep handoff cannot complete within policy, the package can return to destination-station pickup. Public tracking shows pickup as the current next path.`

Rules:
- Do not state this was the second attempt unless future public field confirms it.
- Do not show station ID or address.

### Issue Queue Explanation Card
Use when state is `issue_queue`.

Title:
- `Why support review may be needed`

Copy:
- `Receiver refusal, package issue, hold review, or terminal delivery problem can pause normal handoff. Kra support must review before the next public handoff step is shown.`

Rules:
- Do not reveal the internal issue category.
- Do not imply compensation or refund.
- Do not show support case ID unless future public contract exists.

### Support Card
Title:
- `Need help with this attempt?`

Copy:
- `Contact support if the courier did not arrive, the status looks wrong, pickup is not possible, or you believe the package was marked incorrectly.`

CTA:
- `Contact support`

Rules:
- Do not prefill support with raw tracking code in URL.
- Do not expose phone or address.

### Privacy Note
Title:
- `Why attempt details are limited`

Copy:
- `Kra shows the receiver-safe package status here. Courier notes, exact failed-attempt reason, attempt count, receiver phone, address, proof files, payment details, staff identities, and GPS are not public.`

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
- Never show courier identity.

## Status Copy Matrix
### `awaiting_final_mile_assignment`
State:
- `attempt_recorded`

Hero title:
- Backend `publicLabel`.

Action title:
- `Doorstep handoff did not complete`

Body:
- `The package is waiting for the next doorstep assignment. Watch tracking for the next update.`

Primary CTA:
- `Back to tracking timeline`

Secondary CTA:
- `Contact support`

### `awaiting_receiver_pickup`
State:
- `rerouted_to_pickup`

Hero title:
- Backend `publicLabel`.

Action title:
- `Pickup is now the next path`

Body:
- `View arrival instructions before going to the destination Kra station.`

Primary CTA:
- `View arrival instructions`

Secondary CTA:
- `Contact support`

### `issue_reported`
State:
- `issue_queue`

Hero title:
- Backend `publicLabel`.

Action title:
- `Support review is needed`

Body:
- `Kra is reviewing this package status before normal handoff can continue.`

Primary CTA:
- `Contact support`

Secondary CTA:
- `Read delivery policy`

### `on_hold`
State:
- `issue_queue`

Hero title:
- Backend `publicLabel`.

Action title:
- `Handoff is on hold`

Body:
- `Contact support before attempting pickup or doorstep proof.`

Primary CTA:
- `Contact support`

### `delivery_failed`
State:
- `issue_queue`

Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery cannot continue from this page`

Body:
- `Contact support for the next step.`

Primary CTA:
- `Contact support`

### `out_for_delivery`
State:
- `out_for_delivery`

Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is active now`

Body:
- `Prepare for physical handoff and OTP proof.`

Primary CTA:
- `View arrival instructions`

### `delivered`
State:
- `delivered`

Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is complete`

Body:
- `This package has been marked delivered with accepted proof.`

Primary CTA:
- `Back to tracking timeline`

Secondary CTA:
- `Contact support`

### `cancelled`
State:
- `closed`

Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is cancelled`

Body:
- `This package is not open for receiver handoff.`

Primary CTA:
- `Contact support`

### `closed`
State:
- `closed`

Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is closed`

Body:
- `This tracking code is not open for receiver handoff.`

Primary CTA:
- `Contact support`

### All pre-receiver statuses
Statuses:
- `created`
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`
- `received_at_destination`

State:
- `not_failed_attempt_context`

Action title:
- `No missed-delivery action is available`

Body:
- `Current tracking does not show a receiver missed-delivery path.`

Primary CTA:
- `Back to tracking timeline`

## Information Architecture
### Required Components
`ReceiverPublicShell`
- Shared receiver public header and safe page frame.

`ReceiverFailedAttemptStatusHero`
- Renders public label, tracking code, ETA label, latest update source, and data-limit copy.

`ReceiverFailedAttemptNextPathCard`
- Renders status-specific next action and CTA.

`ReceiverFailedAttemptPolicyTimeline`
- Renders policy steps without private attempt data.

`ReceiverFailedAttemptSafetyCard`
- Renders OTP, cash, and screenshot safety copy.

`ReceiverFailedAttemptRerouteCard`
- Renders pickup reroute explanation when state is `rerouted_to_pickup`.

`ReceiverFailedAttemptIssueCard`
- Renders support review explanation when state is `issue_queue`.

`ReceiverFailedAttemptSupportCard`
- Renders support route and help criteria.

`ReceiverFailedAttemptPrivacyNote`
- Renders public-data limitation.

### Component Boundaries
Do not build:
- Courier failed-attempt form.
- Reason selector.
- Attempt count display.
- Courier note view.
- Address correction form.
- Reattempt scheduler.
- Proof upload.
- Signature capture.
- Photo capture.
- Refund request.
- Dispute case form.
- Support ticket composer.
- Station directory.
- Live map.

Small shared components are allowed only when they support receiver public screens.

## Data Handling Rules
### Tracking Code
- Show as public receiver reference.
- Mask in analytics.
- Do not include in support URL.
- Do not include in metadata.

### Verification Grant
- Use only to decide access.
- Do not render token.
- Do not send token to analytics.
- Do not store beyond expiry.
- Do not convert into account session.

### Latest Touchpoint
- Format time in local readable form.
- Use role label mapping.
- Do not infer failed-attempt timestamp from latest touchpoint unless future contract says the latest event is the failed attempt.

### Attempt Data
- Do not show reason.
- Do not show count.
- Do not show note.
- Do not show evidence.
- Do not show courier identity.
- Do not show return handoff reference.

### ETA
- Render `etaLabel` exactly if provided.
- Do not convert into a reattempt promise.
- If missing, omit ETA.

### Station
- Do not show raw `stationId`.
- Do not infer city, name, or address from station ID.
- Use `destination Kra station` where needed.

### Payment And Refund
- Do not show payment status.
- Do not show refund eligibility.
- Do not promise automatic refund.
- Show only: no cash collection during final-mile completion.

## Accessibility Requirements
### Semantics
- Page has one `h1`.
- Major sections use ordered heading levels.
- Policy timeline uses semantic list markup.
- Status changes after retry use appropriate live region.
- CTA labels must be specific without surrounding copy.

### Keyboard
- All CTAs are reachable by keyboard.
- Focus moves to page heading after route transition.
- Retry returns focus to status region after request resolves.
- Support link is reachable in every blocked state.

### Screen Reader
- Status hero announces current status and next action.
- Policy timeline should announce as three ordered steps.
- Warning card must be text-first, not icon-only.
- Tracking code must be grouped for readable announcement.

### Contrast And Text
- All normal text meets WCAG AA contrast.
- Warning and issue states must not rely only on color.
- Minimum body text `16px`.
- Large text must not clip CTAs or policy timeline.

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Disable decorative reveal animation.
- Keep focus indicators visible.

### Error Identification
- Invalid link, unavailable service, offline state, and verification-required state must identify the issue in text.
- Recovery action must be adjacent to explanation.
- Do not expose raw backend error or stack trace.

## Responsive Requirements
### Mobile
- Primary target viewport is `360px` to `430px`.
- No horizontal scrolling.
- Current status and next action above fold.
- Policy timeline appears before support on valid failed-attempt states.
- Support CTA remains easy to reach.

### Tablet
- Preserve mobile reading order.
- Use two cards per row only where content remains readable.

### Desktop
- Use two-column layout only above reasonable width.
- Keep main reading line under `74` characters.
- Side column must not contain unique critical information.

## Empty, Error, And Edge Cases
### API 404
Title:
- `Tracking code was not found`

Body:
- `Check the tracking code and try again.`

CTA:
- `Track another package`

Test ID:
- `state-receiver-failed-attempt-not-found`

### API 429
Title:
- `Too many tracking attempts`

Body:
- `Wait a short time before trying again.`

CTA:
- `Try again later`

Test ID:
- `state-receiver-failed-attempt-rate-limited`

### API 5xx
Title:
- `Missed-delivery information is temporarily unavailable`

Body:
- `Try again. If a courier is waiting with your package, contact support before sharing OTP or personal information.`

CTA:
- `Try again`

Test ID:
- `state-receiver-failed-attempt-unavailable`

### Expired Verification Grant
Title:
- `Verify phone again`

Body:
- `Your receiver verification expired. Verify the receiver phone again to view missed-delivery information.`

CTA:
- `Verify phone`

Test ID:
- `state-receiver-failed-attempt-grant-expired`

### Status Changed While Page Is Open
If refresh returns a new status:
- Update state mapping.
- Announce status update through a polite live region.
- Do not keep old failed-attempt text if status moved to delivered, pickup, or issue.

### Route Opened Without Failed-Attempt Context
If the user opens this route directly and current status does not support failed-attempt guidance:
- Render `not_failed_attempt_context`.
- Route them back to tracking or arrival instructions.
- Do not claim an attempt occurred.

## Copy System
### Voice
- Calm.
- Direct.
- Accountable.
- Policy-clear.
- Non-accusatory.

### Words To Prefer
- `missed handoff`
- `doorstep handoff`
- `next path`
- `reattempt`
- `pickup`
- `support review`
- `current tracking status`
- `accepted proof`

### Words To Avoid
- `guaranteed`
- `driver failed`
- `courier lied`
- `automatic refund`
- `cash on delivery`
- `delivery failed` for simple missed attempts
- `first attempt` unless future public contract confirms it
- `second attempt` unless future public contract confirms it
- `reason was` unless future public contract confirms it

### Microcopy Rules
- Use `missed doorstep handoff`, not blame language.
- Use `may` when explaining possible policy routes.
- Use `current status`, not `investigation result`.
- Use `support review`, not `internal issue queue`, in customer-facing copy.
- Use `view arrival instructions`, not `claim package`.

## Analytics
Events must not include raw tracking code, phone, verification token, station ID, delivery ID, proof reference, address, failed-attempt reason, failed-attempt count, courier ID, or issue category.

Allowed events:
- `receiver_failed_attempt_viewed`
- `receiver_failed_attempt_state_rendered`
- `receiver_failed_attempt_timeline_clicked`
- `receiver_failed_attempt_arrival_clicked`
- `receiver_failed_attempt_support_clicked`
- `receiver_failed_attempt_policy_clicked`
- `receiver_failed_attempt_retry_clicked`
- `receiver_failed_attempt_verification_redirected`

Allowed properties:
- `status_group`: `attempt_recorded`, `rerouted_to_pickup`, `issue_queue`, `out_for_delivery`, `delivered`, `not_context`, `closed`, `unavailable`
- `verification_required`: boolean
- `has_eta_label`: boolean
- `role_group`: `system`, `station`, `line_haul`, `final_mile`, `unknown`
- `result`: `success`, `not_found`, `rate_limited`, `unavailable`, `offline`, `invalid`

Forbidden properties:
- `trackingCode`
- `deliveryId`
- `stationId`
- `phone`
- `verificationToken`
- `attemptReason`
- `attemptCount`
- `proofReference`
- `address`
- `receiverName`
- `courierId`
- `rawStatus`
- `issueCategory`

## SEO And Metadata
This is a delivery-scoped receiver page.

Metadata:
- `robots`: `noindex,nofollow`
- Title: `Missed delivery next steps | Kra`
- Description: `Receiver missed-delivery next steps for Kra tracking.`

Rules:
- Do not put tracking code in title.
- Do not put tracking code in description.
- Do not expose delivery status in Open Graph metadata.
- Do not generate public share cards with package state.

## Security And Privacy Requirements
- Treat route as public but delivery-scoped.
- Validate tracking code before API call.
- Do not expose hidden fields from API response.
- Do not leak verification token through URL, analytics, logs, DOM attributes, or metadata.
- Do not reveal failed-attempt reason, count, notes, courier identity, address, station ID, proof files, payment, refund, or issue notes.
- Do not encourage OTP sharing outside physical handoff.
- Do not present carrier-style release or waiver flow.
- Do not require receiver account creation.

## Performance Requirements
- Initial route shell should render quickly on weak mobile connections.
- Public tracking request should be the only network dependency.
- No map SDK.
- No real-time socket.
- No heavy animation package.
- No remote decorative video.
- Layout must avoid content shift after status loads.
- Critical text must be HTML, not image text.

## Test IDs
Required:
- `screen-receiver-failed-attempt`
- `state-receiver-failed-attempt-loading`
- `state-receiver-failed-attempt-verification-required`
- `state-receiver-failed-attempt-recorded`
- `state-receiver-failed-attempt-rerouted`
- `state-receiver-failed-attempt-issue-queue`
- `state-receiver-failed-attempt-out-for-delivery`
- `state-receiver-failed-attempt-delivered`
- `state-receiver-failed-attempt-not-context`
- `state-receiver-failed-attempt-closed`
- `state-receiver-failed-attempt-unavailable`
- `state-receiver-failed-attempt-offline`
- `state-receiver-failed-attempt-invalid`
- `state-receiver-failed-attempt-not-found`
- `component-receiver-failed-attempt-status-hero`
- `component-receiver-failed-attempt-next-path`
- `component-receiver-failed-attempt-policy-timeline`
- `component-receiver-failed-attempt-safety-card`
- `component-receiver-failed-attempt-reroute-card`
- `component-receiver-failed-attempt-issue-card`
- `component-receiver-failed-attempt-support`
- `component-receiver-failed-attempt-privacy-note`
- `cta-receiver-failed-attempt-timeline`
- `cta-receiver-failed-attempt-arrival`
- `cta-receiver-failed-attempt-support`
- `cta-receiver-failed-attempt-policy`
- `cta-receiver-failed-attempt-retry`

Rules:
- Test IDs must be stable.
- Do not encode tracking code, attempt reason, attempt count, or status into test IDs.

## Unit Test Coverage
### Route And Validation
- Valid route calls `get_public_tracking`.
- Malformed tracking code does not call API.
- 404 renders not-found state.
- 429 renders rate-limited state.
- 5xx renders unavailable state.
- Offline renders offline state.

### Verification Gate
- `receiverVerificationRequired=true` and no active grant routes to phone verification.
- `receiverVerificationRequired=true` and active grant renders screen.
- Expired grant routes to phone verification with expired copy.
- Verification token never appears in DOM.
- Verification token is not sent to analytics.

### Status Rendering
- `awaiting_final_mile_assignment` renders attempt recorded state.
- `awaiting_receiver_pickup` renders rerouted to pickup state.
- `issue_reported` renders issue queue state.
- `on_hold` renders issue queue state.
- `delivery_failed` renders issue queue state.
- `out_for_delivery` renders active delivery state.
- `delivered` renders delivered state.
- Pre-receiver statuses render not-context state.
- `cancelled` renders closed state.
- `closed` renders closed state.

### Privacy
- `deliveryId` is not rendered.
- Raw `stationId` is not rendered.
- Raw status enum is not rendered.
- Raw role enum is not rendered.
- Receiver phone is not rendered.
- Failed-attempt reason is not rendered.
- Failed-attempt count is not rendered.
- Courier note is not rendered.
- Proof asset reference is not rendered.
- Payment or refund state is not rendered.
- GPS is not rendered.
- Courier ID is not rendered.
- Issue category is not rendered.

### Operations
- Screen calls only `get_public_tracking`.
- Screen never calls `record_failed_attempt`.
- Screen never calls `complete_delivery`.
- Screen never calls `create_delivery_proof_asset`.
- Screen never calls `confirm_delivery_proof_asset_upload`.
- Screen never calls `create_issue`.
- Screen never calls `refund_payment`.
- Screen never calls authenticated delivery detail or timeline endpoints.

### Copy
- One-reattempt policy appears in attempt-recorded state.
- Pickup fallback appears in rerouted state.
- Support review copy appears in issue queue state.
- No-cash warning appears in valid failed-attempt states.
- OTP remote-sharing warning appears in valid failed-attempt states.
- Copy does not claim exact attempt count.
- Copy does not claim exact failed-attempt reason.

## Integration Test Coverage
Use frontend test harness with API interception.

Scenarios:
- Receiver opens `/r/KRA-ACC-001/failed-attempt` with `awaiting_final_mile_assignment` and sees failed handoff recovery.
- Receiver opens with `awaiting_receiver_pickup` and sees pickup next path.
- Receiver opens with `issue_reported` and sees support review.
- Receiver opens with `on_hold` and sees support review.
- Receiver opens with `delivery_failed` and sees support-first copy.
- Receiver opens with `out_for_delivery` and is routed to arrival instructions via CTA.
- Receiver opens with `delivered` and sees completed state.
- Receiver opens with pre-receiver status and sees no missed-delivery action available.
- Receiver opens with `receiverVerificationRequired=true` and no grant and is routed to phone verification.
- Receiver opens with malformed tracking code and no network request is made.
- Receiver clicks support and route excludes tracking code, phone, token, attempt reason, attempt count, and delivery ID.

Assertions:
- `screen-receiver-failed-attempt` is visible after successful render.
- First viewport contains status and next path.
- No forbidden endpoint is called.
- No forbidden data appears in DOM.
- Focus order follows header, hero, next path, policy, safety, support.

## End-To-End Acceptance
### Attempt Recorded Path
Given:
- Public tracking returns `awaiting_final_mile_assignment`.
- Receiver verification grant is active when required.

When:
- Receiver visits `/r/:trackingCode/failed-attempt`.

Then:
- Page shows `Doorstep handoff did not complete`.
- Page explains the one-reattempt policy.
- Page says to watch tracking.
- Page does not show reason, count, note, courier identity, or station ID.

### Rerouted Pickup Path
Given:
- Public tracking returns `awaiting_receiver_pickup`.

When:
- Receiver visits failed-attempt route.

Then:
- Page shows pickup as current next path.
- Page routes to arrival instructions.
- Page does not claim this is the second attempt unless future contract provides that field.

### Issue Queue Path
Given:
- Public tracking returns `issue_reported`.

When:
- Receiver visits failed-attempt route.

Then:
- Page shows support review.
- Page routes to support and delivery policy.
- Page does not reveal issue category, notes, or refund outcome.

### Active Delivery Path
Given:
- Public tracking returns `out_for_delivery`.

When:
- Receiver visits failed-attempt route.

Then:
- Page says delivery is active now.
- Page routes to arrival instructions.
- Page does not claim a missed handoff occurred.

## Implementation Notes For Claude Code
Build only the receiver failed-attempt information screen and receiver-safe supporting components. Do not implement courier failed-attempt recording, reason selection, reattempt scheduling, address editing, proof upload, support case creation, dispute filing, refund request, station directory, courier tracking, or account UI in this task.

Recommended implementation sequence:
- Add route `/r/:trackingCode/failed-attempt`.
- Reuse receiver public route shell from prior receiver screens.
- Reuse public tracking client for `get_public_tracking`.
- Reuse receiver verification grant guard.
- Add status-to-failed-attempt-state mapper with tests.
- Build status hero.
- Build next-path card.
- Build policy timeline.
- Build safety card.
- Build reroute and issue explanation cards.
- Build privacy and support links.
- Add unit tests.
- Add integration tests.
- Add accessibility tests.

Do not add new backend fields just to satisfy UI preference. If attempt reason, count, or next reattempt window is needed, open an API contract change first.

## Definition Of Done
- Route exists at `/r/:trackingCode/failed-attempt`.
- `screen-receiver-failed-attempt` renders for valid states.
- All required state test IDs exist.
- Page calls only `get_public_tracking`.
- Verification gate redirects correctly.
- Attempt recorded, rerouted, issue queue, active delivery, delivered, not-context, closed, unavailable, offline, invalid, and not-found states are covered.
- One-reattempt, pickup fallback, and issue review policy are present.
- No forbidden data appears in DOM, analytics, logs, title, metadata, or links.
- No staff endpoint is called.
- No refund or dispute action is implied.
- Mobile layout is clean at `360px`.
- Keyboard and screen reader behavior passes accessibility checks.
- Reduced motion is honored.
- Unit, integration, accessibility, and route tests pass.
- Documentation and implementation remain aligned with doorstep, handoff, lifecycle, refund-dispute, and public tracking contracts.
