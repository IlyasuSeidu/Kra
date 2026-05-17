# Receiver Arrival Instructions Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverArrivalInstructions` |
| App | `apps/web` |
| Route | `/r/:trackingCode/arrival` |
| Primary test ID | `screen-receiver-arrival` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/r/:trackingCode/failed-attempt`, `/r/:trackingCode/refusal`, `/support`, `/delivery-policy`, `/privacy` |
| Required states | `awaiting courier`, `OTP required`, `proof completed` |

## Product Job
This screen tells a receiver what to do when the package is ready for pickup or doorstep completion. It must convert a public tracking status into clear, safe, receiver-facing instructions for arrival, identity, OTP, signature, photo fallback, failed attempt recovery, and support escalation.

The screen must help receivers:
- Know whether to go to the destination station, wait for a courier, or prepare for final doorstep handoff.
- Understand that final-mile completion needs accepted proof.
- Understand that OTP is the default final-mile proof method.
- Know that signature or delivery photo can be used only when the courier follows an approved fallback path.
- Avoid sending OTP, phone details, or personal data to anyone outside the physical handoff.
- Understand that no cash is collected during final-mile completion.
- Return to tracking or support when the status is not ready for receiver action.

This screen is not a courier completion tool, proof upload tool, station inventory view, support thread, payment page, live map, receiver account area, or authenticated delivery detail.

## Audience
Primary audience:
- Receivers who opened a valid Kra tracking link and need pickup or handoff instructions.
- Receivers who completed phone verification for a receiver-sensitive delivery state.

Secondary audience:
- Senders who share receiver tracking instructions with customers.
- Support staff guiding receivers through pickup or doorstep completion.
- Station operators who need public copy to match operational proof policy.

## User State
The receiver may be near a station, waiting for a courier, preparing to receive a package at the door, or checking after delivery completed. They may be anxious about losing the package, unsure whether the code they received is safe to share, or unclear whether a missed courier visit changes the package status. The page must answer the immediate handoff question with minimal cognitive load.

## Primary Action
Primary CTA depends on status:
- `Back to tracking timeline` for normal tracking review.
- `Verify phone to continue` when receiver verification is required and no active grant exists.
- `Open tracking status` for statuses before receiver action.
- `Contact support` for issue, hold, unavailable, or blocked states.
- `Read delivery policy` as secondary policy support.

CTA behavior:
- `Back to tracking timeline` routes to `/r/:trackingCode/timeline`.
- `Verify phone to continue` routes to `/r/:trackingCode/verify-phone`.
- `Contact support` routes to `/support` without sensitive query values.
- `Read delivery policy` routes to `/delivery-policy`.
- No CTA on this page may call staff-only delivery completion, proof asset, failed-attempt, or issue mutation endpoints.

## Main Tension
The receiver needs proof instructions, but the public API does not expose courier identity, destination station display name, street address, receiver address, proof assets, issue reason, or final proof details. The UI must be useful without inventing those fields. If a value is not returned by `get_public_tracking` or a future public-safe contract, the page must use neutral operational language.

## Visual Thesis
Design this page as a calm handoff command card: one decisive status hero, one proof checklist, one arrival mode panel, and one safety warning about OTP and cash. The visual feeling should be premium, precise, and operational, closer to a trusted airport boarding instruction than a busy parcel map.

## Restraint Rule
Do not build a delivery-control console. Avoid live maps, courier cards, package photos, station codes, internal location data, proof galleries, payment panels, broad arrival promises, and decorative logistics graphics.

Every element must help one of these:
- Explain what receiver action is valid now.
- Explain accepted proof.
- Prevent unsafe OTP sharing.
- Clarify station pickup versus doorstep handoff.
- Set expectations for failed attempts or fallback proof.
- Route to support or policy when the state is blocked.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside top-tier carrier delivery-instruction, pickup-readiness, secure OTP, and public service guidance experiences while being more privacy-disciplined than most carrier pages.

Non-negotiable quality requirements:
- The first viewport must state the package status and the immediate receiver action.
- The page must call only `get_public_tracking`.
- The page must never call `complete_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `record_failed_attempt`, or any staff endpoint.
- The page must not expose `deliveryId`, raw `stationId`, raw status enum, courier ID, staff identity, receiver phone, payment state, proof asset ID, proof file, address, GPS, or issue notes.
- If `receiverVerificationRequired` is true and no active verification grant exists, route to `/r/:trackingCode/verify-phone`.
- OTP copy must say to share the code only at physical handoff with the Kra courier or station operator completing receipt.
- No cash collection must be stated for doorstep completion.
- Station pickup copy must not invent station name or street address.
- Doorstep copy must not promise courier arrival time beyond `etaLabel` if present.
- Delivered state must confirm proof completed without exposing proof content.
- Issue states must route to support without revealing internal issue category.
- The page must work first on mobile, including one-handed reading at the door.
- The page must remain usable with keyboard, screen reader, high contrast, reduced motion, large text, intermittent network, and slow API response.

Closure rule:
- If a receiver cannot answer "what should I do now" in under five seconds, the screen remains open.
- If the page can be mistaken for a courier completion tool, the screen remains open.
- If the page encourages sharing OTP before physical arrival, the screen remains open.
- If any hidden operational identifier appears in public UI, the screen remains open.
- If the page implies doorstep delivery is available before confirmed destination receipt, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- UPS Delivery Notice guidance shows that pickup instructions must tell receivers to confirm package status before pickup and bring acceptable proof when picking up from an access location.
- FedEx tracking and delivery management guidance emphasizes delivery alerts, delivery instructions, and picture proof of delivery or attempt, which supports Kra separating tracking, instruction, and proof states.
- FedEx signature service guidance shows that some delivery types require an in-person signature and that proof data should avoid collecting unnecessary personal details.
- DHL proof of delivery guidance confirms that proof of delivery can be requested after completion and can include a signature variant, which supports keeping proof completion distinct from pre-arrival instructions.
- W3C WCAG 2.2 guidance requires accessible status messages, error identification, predictable focus, readable contrast, and input assistance across devices.

Reference links:
- https://www.ups.com/us/en/support/tracking-support/where-is-my-package/how-to-use-infonotice
- https://www.fedex.com/en-us/tracking/guide-for-tracking-managing-deliveries.html
- https://www.fedex.com/en-us/delivery-options/signature-services.html
- https://www.dhl.com/discover/en-my/ship-with-dhl/services/dhl-shipping-tools/proof-of-delivery
- https://www.w3.org/TR/wcag/

Do not copy external carrier statuses, release forms, ID rules, maps, proof flows, carrier wording, icons, layouts, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Is this package ready for my action?
- Should I go to a station or wait for a doorstep courier?
- What proof will be needed?
- When should I share the OTP?
- What happens if OTP does not work?
- Do I need cash?
- What if the courier cannot complete handoff?
- What if the page says the package is already delivered?
- Why can I not see courier identity, station code, address, or proof files?
- Where do I go for help?

## Route And Access Rules
### Route
- Render at `/r/:trackingCode/arrival`.
- Must be public and unauthenticated.
- Must remain delivery-scoped.
- Must not require receiver account creation.
- Must not expose staff tools.

### Route Parameter
`trackingCode` must:
- Match `^KRA-[A-Z0-9-]+$`.
- Never be stored raw in analytics.
- Never be shown in page title metadata.
- Be displayed in grouped form only when useful for receiver confirmation.

If malformed:
- Show invalid tracking recovery or route to `/track`.
- Do not call API.
- Do not show raw parser or validation errors.

### Verification Gate
When `get_public_tracking` returns `receiverVerificationRequired: true`:
- If an active receiver verification grant exists for this tracking code, render arrival instructions.
- If no active grant exists, route to `/r/:trackingCode/verify-phone`.
- If grant is expired, route to phone verification with expired-session copy.

When `receiverVerificationRequired` is false:
- Render only status-appropriate non-sensitive instructions.
- Do not request phone verification from this screen.

Rules:
- Do not pass verification token in URL.
- Do not render verification token.
- Do not store token in analytics.
- Do not convert the receiver verification grant into account login.
- Do not use this page to complete delivery.

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
- Any value not returned by the endpoint.

### Contract Limitation
Current `get_public_tracking` does not return:
- Station display name.
- Station address.
- Courier name.
- Courier phone.
- Receiver name.
- Receiver phone.
- Doorstep address.
- Proof assets.
- Final proof details.
- Failed-attempt reason.
- Issue category.
- Full timeline entries.

Therefore:
- Pickup instructions must say `destination Kra station` unless a future public station contract exists.
- Doorstep instructions must say `assigned Kra courier` only when status supports it, not a named courier.
- Fallback proof instructions must describe allowed methods, not show proof content.
- Delivered state must confirm accepted proof without revealing signature, image, GPS, or receiver identity.
- Issue or failed-attempt states must route to the appropriate public screen only when a future safe signal exists.

If a future public station or final-mile detail endpoint is added:
- Update this spec before rendering station address, courier contact, arrival window, issue reason, or proof details.
- Keep public privacy restrictions intact.

## Authorized And Forbidden Operations
### Authorized
This screen may call:
- `get_public_tracking`

This screen may read from local client state:
- Active receiver verification grant existence.
- Verification grant expiry timestamp.
- Last known tracking code from the public receiver route.
- Network online/offline state.

### Forbidden
This screen must never call:
- `get_delivery`
- `get_delivery_timeline`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `record_failed_attempt`
- `list_issues`
- `create_issue`
- `refund_payment`
- Any account, staff, admin, courier, station, finance, or sender endpoint.

This screen must never render controls for:
- Marking a package delivered.
- Uploading signature or photo proof.
- Confirming proof asset upload.
- Recording failed attempt.
- Accepting courier assignment.
- Changing receiver address.
- Changing payment.
- Approving refund.
- Starting dispute investigation.

## Status Interpretation
### Receiver-Action Statuses
`awaiting_receiver_pickup`
- Mode: station pickup.
- Primary state: `pickup_ready`.
- Receiver action: go to the destination Kra station when practical and bring receiver proof.
- Copy must not show station address unless a public station contract exists.
- Show hold policy: pickup is normally held for `72 hours`; after that, it may move to hold review.

`awaiting_final_mile_assignment`
- Mode: doorstep pending.
- Primary state: `awaiting_courier`.
- Receiver action: wait for courier assignment and keep phone available.
- Explain that no handoff is ready yet.

`assigned_for_final_mile`
- Mode: doorstep assigned.
- Primary state: `awaiting_courier`.
- Receiver action: prepare for courier arrival and accepted proof.
- Do not imply courier is already at the door.

`out_for_delivery`
- Mode: doorstep active.
- Primary state: `otp_required`.
- Receiver action: keep phone nearby and share OTP only during physical handoff.
- Explain fallback proof if OTP cannot complete.

`delivered`
- Mode: complete.
- Primary state: `proof_completed`.
- Receiver action: no action needed unless the package was not received.
- Route support for disputes.

### Non-Action Statuses
`created`, `received_at_origin`, `awaiting_driver_assignment`, `assigned_to_driver`, `dispatched_from_origin`, `in_transit`, `received_at_destination`
- Mode: tracking only.
- Receiver action: return to timeline.
- Copy must say receiver handoff is not ready yet.

`issue_reported`, `on_hold`, `delivery_failed`
- Mode: blocked or review.
- Receiver action: contact support or open issue-specific public screen when contract exists.
- Do not show internal issue notes.

`cancelled`, `closed`
- Mode: closed.
- Receiver action: contact support if the receiver believes this is wrong.
- Do not imply pickup or doorstep handoff remains available.

Unknown future status:
- Mode: safe fallback.
- Receiver action: return to tracking or contact support.
- Do not invent proof instructions.

## State Model
### `loading`
Use when:
- Tracking lookup is in flight.

Required UI:
- Skeleton hero.
- Skeleton proof checklist.
- Text: `Loading arrival instructions...`
- No internal identifiers.

Test ID:
- `state-receiver-arrival-loading`

### `verification_required`
Use when:
- Backend requires receiver verification and no active grant exists.

Required UI:
- Title: `Verify phone to view handoff instructions`
- Body: `This package is close to receiver action. Verify the receiver phone before viewing handoff instructions.`
- CTA: `Verify phone`

Route:
- `/r/:trackingCode/verify-phone`

Test ID:
- `state-receiver-arrival-verification-required`

### `pickup_ready`
Use when:
- `status` is `awaiting_receiver_pickup`.

Required UI:
- Title: `Ready for station pickup`
- Body: `Go to the destination Kra station when you are ready. Bring your tracking code and be ready to confirm receiver identity.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Required guidance:
- Confirm tracking status before going.
- Bring the tracking code.
- Bring receiver identity confirmation where requested by station staff.
- Do not pay cash for final-mile doorstep completion from this state.
- If pickup is not possible, contact support.

Test ID:
- `state-receiver-arrival-pickup-ready`

### `awaiting_courier`
Use when:
- `status` is `awaiting_final_mile_assignment` or `assigned_for_final_mile`.

Required UI:
- Title for `awaiting_final_mile_assignment`: `Waiting for doorstep courier`
- Title for `assigned_for_final_mile`: `Courier assigned for doorstep delivery`
- Body: `Keep your phone available. The package is not complete until the courier records accepted handoff proof.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Required guidance:
- You do not need to go to the station unless tracking changes to pickup.
- Do not share OTP before the courier arrives.
- No cash collection is allowed during final-mile completion.
- If nobody is available, a failed attempt may be recorded and a reattempt policy applies.

Test ID:
- `state-receiver-arrival-awaiting-courier`

### `otp_required`
Use when:
- `status` is `out_for_delivery`.

Required UI:
- Title: `Prepare for handoff proof`
- Body: `When the Kra courier arrives with your package, use the receiver OTP to complete handoff. Share it only during the physical handoff.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Required guidance:
- OTP is the default proof method.
- Share OTP only with the courier or station operator completing the handoff in person.
- Check package condition before proof when practical.
- If OTP cannot be completed, the courier may use approved fallback proof: receiver signature or delivery photo.
- No cash collection is allowed.
- If the package cannot be handed over, the courier records a structured failed attempt.

Test ID:
- `state-receiver-arrival-otp-required`

### `proof_completed`
Use when:
- `status` is `delivered`.

Required UI:
- Title: `Delivery completed`
- Body: `This package has been marked delivered with accepted proof.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Rules:
- Do not show proof image.
- Do not show signature.
- Do not show receiver name.
- Do not show GPS.
- Do not show courier identity.

Test ID:
- `state-receiver-arrival-proof-completed`

### `not_ready`
Use when:
- Status is valid but receiver handoff is not ready.

Required UI:
- Title: `Handoff is not ready yet`
- Body: `Tracking will show when pickup or doorstep handoff is ready.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-arrival-not-ready`

### `issue_review`
Use when:
- `status` is `issue_reported`, `on_hold`, or `delivery_failed`.

Required UI:
- Title: `Package status needs support`
- Body: `Kra is reviewing this package status. Public handoff instructions are paused until the review is resolved.`
- Primary CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Privacy rule:
- Do not show issue notes, staff notes, internal category, or investigation history.

Test ID:
- `state-receiver-arrival-issue-review`

### `closed`
Use when:
- `status` is `cancelled`, `closed`, or another terminal non-delivered state.

Required UI:
- Title: `Handoff is closed`
- Body: `This tracking code is not open for receiver handoff. Contact support if you believe this is incorrect.`
- Primary CTA: `Contact support`
- Secondary CTA: `Back to tracking timeline`

Test ID:
- `state-receiver-arrival-closed`

### `service_unavailable`
Use when:
- API returns 5xx, timeout, maintenance, or route unavailable.

Required UI:
- Title: `Arrival instructions are temporarily unavailable`
- Body: `Try again. If the courier is already with you, contact support before sharing sensitive information.`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-arrival-unavailable`

### `offline`
Use when:
- Browser is offline or cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect to load current handoff instructions. Do not rely on an old screenshot for OTP handoff.`
- CTA: `Try again`

Test ID:
- `state-receiver-arrival-offline`

### `invalid_tracking_code`
Use when:
- Route parameter fails tracking code validation.

Required UI:
- Title: `Tracking link is not valid`
- Body: `Check the tracking link and try again.`
- CTA: `Track another package`

Test ID:
- `state-receiver-arrival-invalid`

## Layout Blueprint
### Mobile
Order:
- Header.
- Status hero.
- Receiver action card.
- Proof checklist.
- OTP safety panel.
- Pickup or doorstep mode details.
- Failed attempt note.
- Support and policy links.
- Privacy note.

Rules:
- Status and next action must appear above the fold.
- Use stacked cards with strong headings.
- Keep each guidance item to one short sentence.
- Avoid tables.
- Avoid horizontal scroll.
- Keep tap targets at least `44px`.
- Make support link easy to reach near the bottom and in blocked states.

### Desktop
Use a two-zone layout:
- Main column: status hero, proof checklist, mode details.
- Side column: action card, OTP safety, support links, privacy note.

Keep max content width around `1120px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Receiver handoff`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in.
- Staff sign-in.
- Pricing CTA.
- Admin links.

## Visual Direction
### Mood
Calm, secure, direct, and practical.

### Composition
- One large status card.
- One high-contrast action card.
- One checklist with clear proof steps.
- One warning panel for OTP safety.
- One subdued privacy note.

### Color Rules
- `brand.blue.600` for active normal instructions.
- `success.green.600` for completed delivery.
- `warning.amber.600` for waiting, proof caution, and verification reminders.
- `danger.red.600` only for blocked states, unavailable state, or unsafe sharing warnings.
- Neutral surfaces for supporting guidance.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, status labels, and instruction text.
- Hero title must be the dominant text.
- Checklist labels must remain readable at mobile scale.
- Do not use decorative type in proof or safety copy.

### Iconography
Allowed icon ideas:
- Station pickup.
- Doorstep handoff.
- Shield or lock for OTP safety.
- Checkmark for accepted proof.
- Alert triangle for issue or unavailable state.

Rules:
- Icons must be secondary to text.
- Icons need accessible labels only when they carry meaning.
- Do not use courier avatar, face illustration, vehicle illustration, or live route dot as factual representation.

### Motion
- Use short, subtle reveal on initial page load only.
- Use focus-visible transitions for CTAs.
- No pulsing delivery dot.
- No countdown animation.
- No map movement.
- Respect `prefers-reduced-motion`.

## Content Structure
### Status Hero
Required fields:
- Eyebrow: `Receiver handoff`
- Tracking code, formatted safely.
- Public status label from `publicLabel`.
- Latest verified update summary.
- ETA label if backend provides `etaLabel`.

Copy:
- Supporting line: `Latest verified update from {roleLabel}.`
- ETA line: use `etaLabel` exactly as returned.

Do not show:
- Raw status enum.
- Raw station ID.
- Raw ISO time.
- Raw role enum.
- Delivery ID.

### Receiver Action Card
Purpose:
- Tell the receiver what to do now.

Required variants:
- Pickup: `Go to the destination Kra station when ready.`
- Awaiting courier: `Wait for the doorstep courier update.`
- Out for delivery: `Keep your OTP ready for physical handoff.`
- Delivered: `No action needed unless the package was not received.`
- Not ready: `Return to tracking for the latest status.`
- Issue: `Contact support before attempting handoff.`

CTA:
- Always one dominant CTA.
- Secondary CTA allowed only for support or policy.

### Proof Checklist
Title:
- `What proof may be required`

Checklist items:
- `OTP is the default proof for doorstep completion.`
- `Share the OTP only when the courier is physically handing over the package.`
- `If OTP cannot be completed, the courier may use receiver signature or delivery photo as approved fallback proof.`
- `A package cannot be marked delivered without accepted proof.`

Rules:
- Do not ask the receiver to upload proof.
- Do not ask the receiver to take a delivery photo.
- Do not show fallback proof asset references.
- Do not imply fallback proof is chosen by the receiver alone.

### OTP Safety Panel
Title:
- `Keep your OTP private until handoff`

Body:
- `Do not send the OTP by chat, voice note, social media, or to someone claiming to be support. Use it only with the Kra courier or station operator completing handoff in person.`

Required warning:
- `Kra will not ask for cash during final-mile completion.`

Design:
- High-contrast but not panic-inducing.
- Use warning icon and plain language.
- Keep under `90` words.

### Pickup Mode Panel
Use when status is `awaiting_receiver_pickup`.

Title:
- `Station pickup instructions`

Content:
- `Confirm this page still says Ready for pickup before you go.`
- `Bring the tracking code.`
- `Be ready to confirm receiver identity if station staff asks.`
- `Pickup is normally held for 72 hours before hold review.`
- `If you cannot pick up, contact support.`

Rules:
- Do not show station address until public station contract exists.
- Do not show internal station ID.
- Do not claim someone else can pick up unless policy explicitly supports authorized pickup.
- Do not include external carrier ID requirements as Kra policy.

### Doorstep Pending Panel
Use when status is `awaiting_final_mile_assignment` or `assigned_for_final_mile`.

Title:
- `Doorstep handoff is being prepared`

Content:
- `Keep your phone available for updates.`
- `Do not share OTP until the courier arrives with the package.`
- `No cash is collected during final-mile completion.`
- `If nobody is available, Kra may record a failed attempt and follow the reattempt policy.`

Rules:
- Do not promise same-day delivery unless `etaLabel` says it.
- Do not name a courier.
- Do not show courier route or phone number.

### Out For Delivery Panel
Use when status is `out_for_delivery`.

Title:
- `When the courier arrives`

Content:
- `Check that the package is for you before sharing proof.`
- `Share the OTP only during physical handoff.`
- `If OTP does not work, the courier can follow approved fallback proof.`
- `Do not pay cash to complete the handoff.`
- `If there is a package issue, ask the courier to record the issue instead of completing delivery.`

Rules:
- Do not show the OTP value.
- Do not ask receiver to submit proof on this page.
- Do not enable delivery completion from this page.

### Delivered Panel
Use when status is `delivered`.

Title:
- `Proof completed`

Content:
- `Kra has marked this package delivered with accepted proof.`
- `If you did not receive the package, contact support.`
- `Proof files are not public on this page.`

Rules:
- Do not show final proof type unless a future public proof contract allows it.
- Do not show receiver name, signature, photo, or GPS.

### Failed Attempt Education Note
Show only in doorstep states.

Title:
- `If handoff cannot happen`

Copy:
- `A courier may record a failed attempt when the receiver is unavailable, unreachable, the address cannot be found, the handoff is unsafe, proof fails, the receiver refuses, or a package issue is detected. One reattempt is allowed within 24 hours before pickup rules may apply.`

Rules:
- Keep as policy education.
- Do not claim a failed attempt occurred unless backend returns a future safe signal.
- Do not route to failed-attempt screen unless future status or issue signal confirms it.

### Privacy Note
Title:
- `Why this page is limited`

Copy:
- `Kra shows only receiver-safe handoff instructions here. Receiver phone, address, payment data, staff identities, courier identity, proof files, and live GPS are not public.`

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
### `awaiting_receiver_pickup`
Hero title:
- Backend `publicLabel`.

Action title:
- `Ready for station pickup`

Body:
- `Go to the destination Kra station when you are ready. Bring your tracking code and be ready to confirm receiver identity.`

Primary CTA:
- `Back to tracking timeline`

### `awaiting_final_mile_assignment`
Hero title:
- Backend `publicLabel`.

Action title:
- `Waiting for doorstep courier`

Body:
- `Kra is preparing the doorstep handoff. Keep your phone available and wait for the next tracking update.`

Primary CTA:
- `Back to tracking timeline`

### `assigned_for_final_mile`
Hero title:
- Backend `publicLabel`.

Action title:
- `Courier assigned`

Body:
- `Prepare for a doorstep handoff, but share OTP only when the courier arrives with the package.`

Primary CTA:
- `Back to tracking timeline`

### `out_for_delivery`
Hero title:
- Backend `publicLabel`.

Action title:
- `Prepare for handoff proof`

Body:
- `Keep your OTP ready. Share it only during the physical package handoff.`

Primary CTA:
- `Back to tracking timeline`

### `delivered`
Hero title:
- Backend `publicLabel`.

Action title:
- `Proof completed`

Body:
- `This delivery is complete with accepted proof.`

Primary CTA:
- `Back to tracking timeline`

### `issue_reported`
Hero title:
- Backend `publicLabel`.

Action title:
- `Support review needed`

Body:
- `Public handoff instructions are paused while Kra reviews this package status.`

Primary CTA:
- `Contact support`

### `on_hold`
Hero title:
- Backend `publicLabel`.

Action title:
- `Handoff is on hold`

Body:
- `Contact support before going to a station or sharing proof.`

Primary CTA:
- `Contact support`

### `delivery_failed`
Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery cannot continue from this page`

Body:
- `Contact support for the next step.`

Primary CTA:
- `Contact support`

### `cancelled`
Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is cancelled`

Body:
- `This package is not open for receiver handoff.`

Primary CTA:
- `Contact support`

### `closed`
Hero title:
- Backend `publicLabel`.

Action title:
- `Delivery is closed`

Body:
- `This tracking code is not open for receiver handoff.`

Primary CTA:
- `Contact support`

## Information Architecture
### Required Components
`ReceiverPublicShell`
- Shared receiver public header and safe page frame.
- No marketing navigation.
- No account prompt.

`ReceiverArrivalStatusHero`
- Renders public label, tracking code, ETA label, latest update source, and status emphasis.

`ReceiverActionCard`
- Renders state-specific next action and CTA.

`ProofRequirementChecklist`
- Renders accepted proof guidance.

`OtpSafetyNotice`
- Renders OTP and no-cash warning.

`ArrivalModePanel`
- Renders pickup, awaiting courier, out-for-delivery, delivered, not-ready, issue, or closed details.

`FailedAttemptPolicyNote`
- Renders doorstep failed-attempt education only in doorstep states.

`ReceiverPrivacyNote`
- Renders public-data limitation.

`ReceiverSupportLinks`
- Renders support and policy routes without sensitive query data.

### Component Boundaries
Do not build:
- Courier completion form.
- Proof capture form.
- Photo upload.
- Signature capture.
- Failed-attempt recording.
- Address editing.
- Station directory.
- Live map.
- Support case compose.
- Payment correction.
- Dispute form.

Small shared components are allowed only when they support the receiver public flow.

## Data Handling Rules
### Tracking Code
- Show as public receiver reference.
- Mask in analytics.
- Do not write to local storage beyond existing receiver route needs.

### Verification Grant
- Use only to decide access.
- Store only through existing receiver verification client mechanism.
- Do not render token.
- Do not persist longer than grant expiry.
- Do not send to analytics.

### Timestamps
- Format `latestTouchpoint.occurredAt` as user-readable local time.
- Include relative label only if accurate.
- Do not show raw ISO string.
- Do not attach timestamps to instruction steps.

### ETA
- Render `etaLabel` exactly if provided.
- Do not modify into a stronger promise.
- If missing, omit ETA rather than inventing one.

### Station
- Do not show raw `stationId`.
- Do not infer city or address from station ID.
- Use `destination Kra station` where needed.

### Proof
- Do not display proof files.
- Do not collect proof files.
- Do not show proof asset references.
- Do not show final proof metadata.
- Do not show fallback proof form.

### Cash And Payment
- Show only policy message: `No cash is collected during final-mile completion.`
- Do not show payment status.
- Do not show charges, refund status, or provider references.

## Accessibility Requirements
### Semantics
- Page has one `h1`.
- Major sections use ordered heading levels.
- Checklist uses semantic list markup.
- Status changes use appropriate live region only when refreshed after initial load.
- CTA text must be specific out of context.

### Keyboard
- All CTAs are reachable by keyboard.
- Focus starts at the page heading after route transition.
- Retry button returns focus to status region after load.
- Support link is keyboard reachable in every blocked state.

### Screen Reader
- Status hero must announce status and action.
- Warning panel must be text-first, not icon-only.
- Checklist items must be readable as separate items.
- Raw tracking code should be grouped in accessible text, not read as a confusing word.

### Contrast And Text
- All normal text meets WCAG AA contrast.
- Warning text must not rely only on amber.
- Minimum body text `16px`.
- Large text and zoom must not hide CTAs.

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Disable decorative reveal animations.
- Keep focus transitions visible.

### Error Identification
- Invalid link, unavailable service, offline, and verification-required states must identify the issue in text.
- Recovery action must be adjacent to the explanation.
- Do not show backend stack trace or raw error code.

## Responsive Requirements
### Mobile
- Primary target viewport is `360px` to `430px`.
- No horizontal scrolling.
- Sticky CTA is allowed only if it does not cover content.
- OTP warning must appear before detailed policy notes.
- Cards must not exceed one interaction per card.

### Tablet
- Preserve mobile ordering.
- Increase spacing but do not create dense two-column policy blocks.

### Desktop
- Use two-column layout only above reasonable width.
- Keep reading line length under `74` characters where possible.
- Side panel must not contain critical content unavailable in main column.

## Empty, Error, And Edge Cases
### API 404
Title:
- `Tracking code was not found`

Body:
- `Check the tracking code and try again.`

CTA:
- `Track another package`

Test ID:
- `state-receiver-arrival-not-found`

### API 429
Title:
- `Too many tracking attempts`

Body:
- `Wait a short time before trying again.`

CTA:
- `Try again later`

Test ID:
- `state-receiver-arrival-rate-limited`

### API 5xx
Title:
- `Arrival instructions are temporarily unavailable`

Body:
- `Try again. If the courier is already with you, contact support before sharing sensitive information.`

CTA:
- `Try again`

Test ID:
- `state-receiver-arrival-unavailable`

### Expired Verification Grant
Title:
- `Verify phone again`

Body:
- `Your receiver verification expired. Verify the receiver phone again to view handoff instructions.`

CTA:
- `Verify phone`

Test ID:
- `state-receiver-arrival-grant-expired`

### Missing Latest Touchpoint
Current schema requires latest touchpoint. If future client receives malformed data:
- Show safe unavailable state.
- Do not render partial internal data.
- Log client-side contract validation failure without raw tracking code.

### Future Public Station Data Missing
When pickup is ready but no public station data exists:
- Say `destination Kra station`.
- Include `Check tracking before going.`
- Do not infer or display a location.

## Copy System
### Voice
- Direct.
- Calm.
- Precise.
- Security-aware.
- Plain enough for stressed receiver use.

### Words To Prefer
- `handoff`
- `pickup`
- `proof`
- `OTP`
- `receiver`
- `courier`
- `station`
- `accepted proof`
- `tracking update`

### Words To Avoid
- `guaranteed`
- `instant`
- `live location`
- `driver is nearby`
- `cash on delivery`
- `ID required` unless Kra policy explicitly says so
- `safe to share` without physical-handoff qualifier
- `final` when status is not terminal

### Microcopy Rules
- Use `OTP`, not `secret code`, after first explanation.
- Use `courier`, not `rider`, unless product language changes.
- Use `destination Kra station`, not raw station ID.
- Use `accepted proof`, not `proof uploaded`, in public copy.
- Use `contact support`, not `raise dispute`, unless routed to dispute flow.

## Analytics
Events must not include raw tracking code, phone, verification token, station ID, delivery ID, proof reference, address, or status details that can identify a delivery.

Allowed events:
- `receiver_arrival_viewed`
- `receiver_arrival_state_rendered`
- `receiver_arrival_timeline_clicked`
- `receiver_arrival_support_clicked`
- `receiver_arrival_policy_clicked`
- `receiver_arrival_retry_clicked`
- `receiver_arrival_verification_redirected`

Allowed properties:
- `status_group`: `pickup`, `awaiting_courier`, `out_for_delivery`, `delivered`, `not_ready`, `issue`, `closed`, `unavailable`
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
- `proofReference`
- `address`
- `receiverName`
- `courierId`
- `rawStatus`

## SEO And Metadata
This is a delivery-scoped receiver page.

Metadata:
- `robots`: `noindex,nofollow`
- Title: `Receiver handoff instructions | Kra`
- Description: `Receiver handoff instructions for Kra tracking.`

Rules:
- Do not put tracking code in title.
- Do not put tracking code in description.
- Do not expose delivery details in Open Graph metadata.
- Do not generate public share cards with package state.

## Security And Privacy Requirements
- Treat the route as public but delivery-scoped.
- Validate tracking code before API call.
- Do not expose hidden fields from API response.
- Do not leak verification token through URL, analytics, logs, DOM attributes, or page title.
- Do not encourage OTP sharing outside physical handoff.
- Do not expose station ID, courier identity, proof files, phone, address, payment, or issue notes.
- Do not allow screenshot-dependent instructions to be considered current.
- Do not make receiver account creation a condition for handoff.

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
- `screen-receiver-arrival`
- `state-receiver-arrival-loading`
- `state-receiver-arrival-verification-required`
- `state-receiver-arrival-pickup-ready`
- `state-receiver-arrival-awaiting-courier`
- `state-receiver-arrival-otp-required`
- `state-receiver-arrival-proof-completed`
- `state-receiver-arrival-not-ready`
- `state-receiver-arrival-issue-review`
- `state-receiver-arrival-closed`
- `state-receiver-arrival-unavailable`
- `state-receiver-arrival-offline`
- `state-receiver-arrival-invalid`
- `state-receiver-arrival-not-found`
- `component-receiver-arrival-status-hero`
- `component-receiver-arrival-action-card`
- `component-receiver-proof-checklist`
- `component-receiver-otp-safety`
- `component-receiver-arrival-mode-panel`
- `component-receiver-failed-attempt-note`
- `component-receiver-arrival-privacy-note`
- `cta-receiver-arrival-timeline`
- `cta-receiver-arrival-support`
- `cta-receiver-arrival-policy`
- `cta-receiver-arrival-retry`
- `link-receiver-arrival-track`

Rules:
- Test IDs must be stable.
- Do not encode tracking code or status into test IDs.

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
- `receiverVerificationRequired=true` and active grant renders instructions.
- Expired grant routes to verification with expired copy.
- Verification token never appears in DOM.
- Verification token is not sent to analytics.

### Status Rendering
- `awaiting_receiver_pickup` renders pickup ready state.
- `awaiting_final_mile_assignment` renders awaiting courier state.
- `assigned_for_final_mile` renders awaiting courier state.
- `out_for_delivery` renders OTP required state.
- `delivered` renders proof completed state.
- Pre-receiver statuses render not-ready state.
- `issue_reported` renders issue review state.
- `on_hold` renders issue review state.
- `delivery_failed` renders issue review state.
- `cancelled` renders closed state.
- `closed` renders closed state.

### Privacy
- `deliveryId` is not rendered.
- Raw `stationId` is not rendered.
- Raw status enum is not rendered.
- Raw role enum is not rendered.
- Receiver phone is not rendered.
- Proof asset reference is not rendered.
- Payment state is not rendered.
- GPS is not rendered.
- Courier ID is not rendered.

### Operations
- Screen calls only `get_public_tracking`.
- Screen never calls `complete_delivery`.
- Screen never calls `create_delivery_proof_asset`.
- Screen never calls `confirm_delivery_proof_asset_upload`.
- Screen never calls `record_failed_attempt`.
- Screen never calls authenticated delivery detail or timeline endpoints.

### Copy
- OTP safety copy appears in doorstep states.
- No-cash warning appears in doorstep states.
- Pickup state does not invent station address.
- Delivered state says accepted proof without proof details.
- Issue state does not reveal internal issue notes.

## Integration Test Coverage
Use frontend test harness with API interception.

Scenarios:
- Receiver opens `/r/KRA-ACC-001/arrival` with `awaiting_receiver_pickup` and sees pickup instructions.
- Receiver opens with `awaiting_final_mile_assignment` and sees awaiting courier instructions.
- Receiver opens with `assigned_for_final_mile` and sees courier assigned instructions.
- Receiver opens with `out_for_delivery` and sees OTP safety instructions.
- Receiver opens with `delivered` and sees proof completed instructions.
- Receiver opens with `issue_reported` and sees support-first instructions.
- Receiver opens with `receiverVerificationRequired=true` and no grant and is routed to phone verification.
- Receiver opens with malformed tracking code and no network request is made.
- Receiver clicks support and route excludes tracking code, phone, token, and delivery ID.
- Receiver clicks timeline and returns to `/r/:trackingCode/timeline`.

Assertions:
- `screen-receiver-arrival` is visible after successful render.
- First viewport contains status and action.
- No forbidden endpoint is called.
- No forbidden data appears in DOM.
- Focus order follows header, hero, action, proof, warning, support.

## End-To-End Acceptance
### Pickup Ready
Given:
- Public tracking returns `awaiting_receiver_pickup`.
- Receiver verification grant is active when required.

When:
- Receiver visits `/r/:trackingCode/arrival`.

Then:
- Page shows `Ready for station pickup`.
- Page tells receiver to bring tracking code and be ready to confirm identity.
- Page does not show station ID or invented address.
- Page links back to tracking timeline.

### Awaiting Courier
Given:
- Public tracking returns `awaiting_final_mile_assignment` or `assigned_for_final_mile`.

When:
- Receiver visits arrival instructions.

Then:
- Page tells receiver to wait for courier update.
- Page warns not to share OTP early.
- Page shows no-cash rule.
- Page does not show courier identity.

### Out For Delivery
Given:
- Public tracking returns `out_for_delivery`.

When:
- Receiver visits arrival instructions.

Then:
- Page shows OTP required guidance.
- Page says OTP is shared only during physical handoff.
- Page explains approved fallback proof.
- Page does not call delivery completion endpoints.

### Delivered
Given:
- Public tracking returns `delivered`.

When:
- Receiver visits arrival instructions.

Then:
- Page shows proof completed.
- Page shows support route if package was not received.
- Page does not show proof image, signature, GPS, or receiver name.

## Implementation Notes For Claude Code
Build only the receiver arrival instructions screen and receiver-safe supporting components. Do not implement courier completion, proof upload, signature capture, photo capture, failed-attempt recording, support case creation, station directory, courier tracking, or account UI in this task.

Recommended implementation sequence:
- Add route `/r/:trackingCode/arrival`.
- Reuse receiver public route shell from prior receiver screens.
- Reuse public tracking client for `get_public_tracking`.
- Reuse receiver verification grant guard.
- Add status-to-arrival-state mapper with tests.
- Build status hero.
- Build action card.
- Build proof checklist.
- Build OTP safety panel.
- Build arrival mode panel.
- Build privacy and support links.
- Add unit tests.
- Add integration tests.
- Add accessibility tests.

Do not add new backend fields to satisfy UI preference. If a field is needed, open an API contract change first.

## Definition Of Done
- Route exists at `/r/:trackingCode/arrival`.
- `screen-receiver-arrival` renders for valid ready states.
- All required state test IDs exist.
- Page calls only `get_public_tracking`.
- Verification gate redirects correctly.
- Pickup, awaiting courier, OTP required, proof completed, not-ready, issue, closed, unavailable, offline, and invalid states are covered.
- OTP safety and no-cash rules are present.
- No forbidden data appears in DOM, analytics, logs, title, metadata, or links.
- No staff endpoint is called.
- Mobile layout is clean at `360px`.
- Keyboard and screen reader behavior passes accessibility checks.
- Reduced motion is honored.
- Unit, integration, accessibility, and route tests pass.
- Documentation and implementation remain aligned with handoff, doorstep, lifecycle, and public tracking contracts.
