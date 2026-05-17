# Receiver Tracking Landing Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverTrackingLanding` |
| App | `apps/web` |
| Route | `/r/:trackingCode` |
| Primary test ID | `screen-receiver-tracking-landing` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` |
| Related routes | `/track`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/timeline`, `/r/expired`, `/r/access-denied`, `/support`, `/delivery-policy`, `/privacy` |
| Required states | `loading`, `not found`, `expired`, `access denied` |

## Product Job
This page must be the first safe receiver-facing landing surface for a delivery-scoped tracking link. It must read the route tracking code, validate the code format, call the public tracking lookup, show a privacy-safe status summary, and route the receiver to the correct next step.

The page must help receivers:
- Confirm they are looking at the right Kra package link.
- See the current public delivery status without signing in.
- Understand whether phone verification is needed before sensitive receiver details or completion actions.
- Continue to phone verification when `receiverVerificationRequired` is true.
- Continue to the receiver tracking timeline when verification is not required for the current stage.
- Recover safely when the link is invalid, expired, access-denied, rate-limited, offline, or temporarily unavailable.
- Reach support without exposing private delivery information.

This page is not the full tracking timeline, OTP entry, phone challenge form, arrival-instructions screen, failed-attempt page, or support case flow. It is a trusted handoff from a public link into the receiver flow.

## Audience
Primary audience:
- Receivers opening a Kra SMS delivery link.
- Receivers who received the link from the sender.

Secondary audience:
- Senders checking what a receiver sees.
- Support staff helping a receiver understand a link state.
- Business senders sharing tracking links with customers.

## User State
Receivers may open this page from SMS on a phone, from a shared chat link, or from a browser where they are not signed in. They may be outside, moving, on a weak network, or worried about missing a pickup or doorstep delivery. The page must be fast, clear, and low-friction while refusing to leak sensitive delivery data.

## Primary Action
Primary CTA depends on backend response:
- If `receiverVerificationRequired` is true: `Verify phone to continue`
- If `receiverVerificationRequired` is false: `View tracking details`
- If the lookup failed because the code is malformed: `Enter tracking code`
- If the link is expired: `Request help`
- If access is denied: `Contact support`

Secondary CTA:
- `Track another package`

Tertiary CTA:
- `Read delivery policy`

CTA behavior:
- `Verify phone to continue` routes to `/r/:trackingCode/verify-phone`.
- `View tracking details` routes to `/r/:trackingCode/timeline`.
- `Enter tracking code` routes to `/track`.
- `Track another package` routes to `/track`.
- `Request help` or `Contact support` routes to `/support` with no sensitive query values.
- `Read delivery policy` routes to `/delivery-policy`.

## Main Tension
The page must reduce receiver anxiety without overexposing delivery data. The receiver should know whether the link is valid and what to do next, but the UI must not reveal sender account data, receiver phone, payment state, raw proof, staff IDs, precise location, internal notes, audit metadata, or issue details.

## Visual Thesis
Design this screen as a secure package checkpoint: a clean mobile-first link landing, a focused status card, a clear verification handoff, and calm recovery paths. It should feel like a premium logistics receiver portal, not a generic tracking result.

## Restraint Rule
Do not build a full delivery dashboard here. Avoid live maps, long timelines, route animations, staff identity cards, payment panels, proof previews, internal station codes, and broad ETA promises.

Every visual element must help one of these:
- Confirm the tracking link is valid.
- Show safe status.
- Explain next step.
- Route into verification or timeline.
- Recover from invalid or expired access.
- Preserve privacy and trust.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of receiver tracking, delivery-link, fintech verification, and public-service access experiences.

Non-negotiable quality requirements:
- The first viewport must explain the package status and next step.
- The page must call only `get_public_tracking` on initial load.
- The page must not ask for receiver phone on this screen.
- The page must not ask for OTP on this screen.
- The page must route phone verification to `ReceiverPhoneChallenge`.
- The page must route full timeline to `ReceiverTrackingTimeline`.
- The page must validate the route tracking code format before lookup.
- The page must distinguish malformed code, not found, expired, access denied, rate limited, unavailable, and offline states.
- The page must never expose payment internals, sender IDs, receiver phone, staff names, staff IDs, precise GPS, proof assets, issue notes, or raw backend errors.
- The page must work from an SMS deep link on a small phone.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network conditions.

Closure rule:
- If a receiver cannot identify the next step in under `10 seconds`, the screen remains open.
- If the page leaks data before phone verification, the screen remains open.
- If the page turns into the timeline screen, the screen remains open.
- If link recovery sounds accusatory or reveals whether a receiver phone matched, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- FedEx tracking: high-priority tracking experiences keep status, shipment identity, and next action prominent.
- UPS tracking: public delivery lookup must support exceptions and receiver action without requiring full account context.
- DHL tracking: parcel tracking pages keep lookup results direct and recovery paths visible.
- OWASP Authentication guidance: secure access flows should avoid account or identity enumeration and should use careful error messaging.
- NIST digital identity guidance: delivery of sensitive access via out-of-band verification needs clear user intent, rate limiting, and careful recovery.
- W3C WCAG 2.2 quick reference: route loading, status updates, errors, focus, and forms must remain accessible.

Reference links:
- https://www.fedex.com/en-us/tracking.html
- https://www.ups.com/track
- https://www.dhl.com/global-en/home/tracking.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external carrier layouts, wording, tracking statuses, maps, illustrations, security language, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Is this Kra tracking link valid?
- What is the current safe package status?
- Was the latest update verified?
- Do I need phone verification?
- What happens after I tap the primary action?
- Why am I not seeing full receiver details yet?
- What should I do if the link is wrong or expired?
- Where can I get help?
- What information does Kra intentionally hide for privacy?

## Route And Navigation Rules
### Route
- Render at `/r/:trackingCode`.
- Must be public and unauthenticated.
- Must not require a receiver account.
- Must not require app install.
- Must not require sender sign-in.
- Must not require staff sign-in.

### Route Parameter
`trackingCode` must:
- Be read from the route path.
- Be trimmed and uppercased before validation if routing framework allows normalization.
- Match `^KRA-[A-Z0-9-]+$`.
- Preserve hyphens.
- Never be logged to analytics as a raw value.

If malformed:
- Do not call the API.
- Show invalid link recovery.
- Offer `/track`.
- Offer `/support`.

### Query Parameters
Allowed query parameters:
- `source=sms`
- `source=sender`
- `source=support`

Rules:
- Query values are optional and should affect analytics only in sanitized form.
- Query values must not change data access.
- Ignore unknown query parameters.
- Do not preserve private tokens in support links.

### Navigation To Next Screens
If public tracking succeeds and `receiverVerificationRequired` is true:
- Primary action routes to `/r/:trackingCode/verify-phone`.
- Do not collect phone here.
- Do not expose OTP instructions beyond a short explanation.

If public tracking succeeds and `receiverVerificationRequired` is false:
- Primary action routes to `/r/:trackingCode/timeline`.
- The timeline screen owns detailed event rendering.

If link is expired:
- Route to `/r/expired` or render the expired state inline while preserving the same recovery copy.

If access is denied:
- Route to `/r/access-denied` or render the access-denied state inline while preserving the same recovery copy.

## Backend Contract
### Initial Lookup
Operation:
- `get_public_tracking`

Endpoint:
- `GET /v1/public/track/:trackingCode`

Auth scope:
- Public.

Response shape:
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
- `trackingCode`, with privacy-safe formatting.
- `publicLabel`.
- `latestTouchpoint.role`, mapped to public role copy.
- `latestTouchpoint.occurredAt`, formatted as relative and local time.
- `etaLabel`, only as provided.
- `receiverVerificationRequired`, as a next-step gate.

Do not render by default:
- `deliveryId`.
- Raw `stationId`.
- Internal `status` enum.
- Raw role enum.
- Raw ISO timestamp without formatting.

### Existing Public Labels
The backend maps delivery states to public labels:
- `draft` -> `Draft`
- `created` -> `Booking created`
- `received_at_origin` -> `Received at origin station`
- `awaiting_driver_assignment` -> `Awaiting dispatch`
- `assigned_to_driver` -> `Assigned to line-haul driver`
- `dispatched_from_origin` -> `Left origin station`
- `in_transit` -> `In transit`
- `received_at_destination` -> `Arrived at destination station`
- `awaiting_receiver_pickup` -> `Ready for pickup`
- `awaiting_final_mile_assignment` -> `Waiting for doorstep courier`
- `assigned_for_final_mile` -> `Assigned for doorstep delivery`
- `out_for_delivery` -> `Out for delivery`
- `delivered` -> `Delivered`
- `issue_reported` -> `Issue under review`
- `on_hold` -> `On hold`
- `delivery_failed` -> `Delivery failed`
- `cancelled` -> `Cancelled`
- `closed` -> `Closed`

Frontend rule:
- Prefer backend `publicLabel`.
- Do not create conflicting public status names.
- If the frontend needs richer explanation, put it in supporting text, not a replacement status.

### Receiver Verification Rule
Backend marks verification required when status is:
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`

Frontend rule:
- Treat `receiverVerificationRequired` as authoritative.
- Do not calculate this from status in the UI except as a defensive fallback for tests.
- Do not show receiver-sensitive details until the receiver completes the phone verification flow.

### API Error Mapping
Map errors safely:
- `400` or validation error: invalid link format.
- `404` or `NOT_FOUND`: tracking link not found.
- `403` or access result denied: access denied.
- `410` or configured link expiry result: expired link.
- `429` or `RATE_LIMITED`: too many attempts.
- `500`, `503`, `504`: service temporarily unavailable.
- Network failure: connection unavailable.

Rules:
- Show user-safe copy only.
- Do not show raw backend error code as the heading.
- Do not show `deliveryId`.
- Do not show request ID.
- Do not say whether a receiver phone matched.

## Privacy Boundary
### Safe Before Verification
Before phone verification, this page may show:
- Tracking code.
- Public delivery label.
- Broad latest role label.
- Latest update time.
- Limited ETA label when provided.
- Whether phone verification is required.
- Public policy links.

Before phone verification, this page must not show:
- Receiver phone number.
- Receiver full address.
- Sender name.
- Sender account ID.
- Payment state.
- Refund state.
- Raw proof files.
- Signature.
- Photo proof.
- OTP.
- Courier phone.
- Driver phone.
- Staff names.
- Staff IDs.
- Admin notes.
- Issue notes.
- Precise live GPS.
- Raw station IDs unless public station names are available through a public station directory.

### Station Display Rule
If only `stationId` is available:
- Do not display the raw station ID.
- Show `Latest update from a Kra station` or role-based copy.

If a public station directory is later added:
- Display only approved public station name and city.
- Do not display storage room, staff roster, station capacity, or internal station status.

### Link Sharing Rule
This page must assume the link may be shared. Do not render anything that would be unsafe if another person opened the link.

## State Model
### `loading`
Use when:
- Route code passes client validation and `get_public_tracking` is in flight.

Required UI:
- Skeleton status card.
- Loading text: `Checking package status...`
- No empty blank page.
- No full-screen spinner without explanation.
- No sender or receiver details.

Test ID:
- `state-receiver-tracking-landing-loading`

### `success_verification_required`
Use when:
- Lookup succeeds.
- `receiverVerificationRequired` is true.

Required UI:
- Public status summary.
- Explanation: `To see receiver details or continue delivery actions, verify the receiver phone.`
- Primary CTA: `Verify phone to continue`.
- Secondary CTA: `Track another package`.
- Privacy note explaining that Kra protects receiver details.

Test ID:
- `state-receiver-tracking-landing-verification-required`

### `success_tracking_ready`
Use when:
- Lookup succeeds.
- `receiverVerificationRequired` is false.

Required UI:
- Public status summary.
- Primary CTA: `View tracking details`.
- Secondary CTA: `Track another package`.
- Supporting copy: `The full public timeline shows verified package milestones, not live GPS.`

Test ID:
- `state-receiver-tracking-landing-ready`

### `invalid_format`
Use when:
- Route parameter does not match tracking code format.

Required UI:
- Title: `This tracking link does not look right`
- Body: `Kra tracking codes start with KRA-. Check the link or enter the code manually.`
- CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-tracking-landing-invalid-format`

### `not_found`
Use when:
- API returns not found.

Required UI:
- Title: `We could not find this tracking link`
- Body: `Check that the link is complete or ask the sender to resend it.`
- CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Privacy rule:
- Do not say whether the link existed before.
- Do not say whether the delivery was cancelled.

Test ID:
- `state-receiver-tracking-landing-not-found`

### `expired`
Use when:
- A future signed-link envelope or access layer says the link has expired.
- The app lands here from `/r/expired`.

Required UI:
- Title: `This tracking link has expired`
- Body: `For privacy, Kra links may stop working after their access window ends.`
- CTA: `Request help`
- Secondary CTA: `Enter tracking code`

Privacy rule:
- Do not reveal delivery status.
- Do not request phone on this screen.

Test ID:
- `state-receiver-tracking-landing-expired`

### `access_denied`
Use when:
- Public access result says the current link cannot continue.
- The app lands here from `/r/access-denied`.
- Suspicious or unsafe route state is detected.

Required UI:
- Title: `This link cannot be opened`
- Body: `For privacy, this receiver link cannot show package details.`
- CTA: `Contact support`
- Secondary CTA: `Enter tracking code`

Privacy rule:
- Do not explain whether the phone, token, delivery, or receiver mismatched.

Test ID:
- `state-receiver-tracking-landing-access-denied`

### `rate_limited`
Use when:
- API returns `RATE_LIMITED` or 429.

Required UI:
- Title: `Too many attempts`
- Body: `Wait a short time before trying this link again.`
- CTA disabled until retry is allowed if backend provides timing.
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-tracking-landing-rate-limited`

### `service_unavailable`
Use when:
- API returns server error, provider timeout, route not enabled, or maintenance response.

Required UI:
- Title: `Tracking is temporarily unavailable`
- Body: `We could not load this tracking link right now. Try again shortly.`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-tracking-landing-unavailable`

### `offline`
Use when:
- Browser is offline or network request fails before reaching Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect and try again.`
- CTA: `Try again`
- Secondary CTA: `Read delivery policy` if cached or available.

Test ID:
- `state-receiver-tracking-landing-offline`

## Layout Blueprint
### Mobile First
The receiver link is likely opened from SMS. Design mobile first:
- Header.
- Secure-link status panel.
- Package status card.
- Next-step action card.
- Privacy note.
- Recovery links.
- Footer.

### Desktop
Use a centered panel, not a broad marketing page:
- Max width around `760px` for the core flow.
- Optional side panel for privacy and support if viewport is wide enough.
- Keep the primary action above fold.

### Header
Header should include:
- Kra wordmark.
- Small trust label: `Receiver tracking`
- Optional link to `/track`.

Header should not include:
- Full marketing navigation.
- Pricing links.
- App install push.
- Admin links.
- Sender sign-in pressure.

## Visual Direction
### Mood
Secure, calm, direct, and receiver-focused.

### Composition
- Use one strong status card.
- Use a lock or shield motif only if restrained.
- Use enough whitespace for SMS-opened mobile use.
- Keep action hierarchy unmistakable.

### Color Rules
- Use `brand.blue.600` for trusted neutral status.
- Use `success.green.600` only for delivered or available states.
- Use `warning.amber.600` for verification needed, hold, issue review, and retry states.
- Use `danger.red.600` only for access denied or unavailable states.
- Use `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, and `surface` for structure.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and status detail.
- Keep hero title short.
- Keep body copy under two short paragraphs before the primary CTA.

### Motion
- Use minimal motion.
- Loading shimmer is allowed only if subtle and reduced-motion aware.
- No moving route lines.
- No live-map animation.
- No looping package animation.

## Content Structure
### Status Hero
Required elements:
- Eyebrow: `Receiver tracking`
- Title based on state.
- Short state explanation.
- Primary action.
- Secondary action.

Success hero title:
- `Your package status is ready`

Verification-required hero title:
- `Verify phone to continue`

### Safe Status Card
Required fields:
- `Tracking code`
- `Status`
- `Latest verified update`
- `Next step`

Tracking code display:
- Show exact code if valid.
- Use monospace only if consistent with design system.
- Provide copy action only if it does not record code in analytics.

Status display:
- Use `publicLabel`.
- Show supporting text based on next action.

Latest verified update:
- Public role label and formatted time.
- Do not show raw station ID.

Next step:
- If verification required: `Verify receiver phone.`
- If timeline ready: `View verified tracking details.`
- If delivered: `Review delivery status.`
- If issue reported: `Review the next public update or contact support.`

### Verification Gate Card
Show only when `receiverVerificationRequired` is true.

Required copy:
- `Kra protects receiver details. Verify the receiver phone before viewing delivery instructions or completing receiver actions.`

CTA:
- `Verify phone to continue`

Do not show:
- Phone input.
- OTP input.
- Masked receiver phone unless returned by the phone challenge endpoint on the next screen.

### Timeline Ready Card
Show only when `receiverVerificationRequired` is false.

Required copy:
- `You can view the public timeline for verified package milestones. Kra does not show live GPS or internal staff notes.`

CTA:
- `View tracking details`

### Privacy Note
Required title:
- `What Kra keeps private`

Required bullets:
- `Receiver phone and address are not shown here.`
- `Payment and refund details are not public.`
- `Tracking is based on verified milestones, not live GPS.`
- `Sensitive receiver actions require phone verification.`

### Recovery Panel
Required links:
- `/track`
- `/support`
- `/delivery-policy`
- `/privacy`

Use short labels:
- `Track another package`
- `Contact support`
- `Read delivery policy`
- `Read privacy policy`

## Copy System
### Voice
Use:
- Clear.
- Calm.
- Protective.
- Direct.
- Low-friction.

Avoid:
- Legal threats.
- Technical blame.
- Security jargon.
- Marketing claims.
- Overly casual language.

### Approved Copy
Loading:
- `Checking package status...`

Verification required:
- `To continue, verify the receiver phone linked to this delivery.`

Timeline ready:
- `This link can show the public tracking timeline for this package.`

Invalid format:
- `This tracking link does not look right. Kra tracking codes start with KRA-.`

Not found:
- `We could not find this tracking link. Check the link or ask the sender to resend it.`

Expired:
- `This tracking link has expired. For privacy, request help or enter the tracking code again.`

Access denied:
- `This link cannot be opened. For privacy, Kra cannot show package details from this link.`

Rate limited:
- `Too many attempts. Wait a short time before trying again.`

Unavailable:
- `Tracking is temporarily unavailable. Try again shortly.`

Offline:
- `Your connection appears offline. Reconnect and try again.`

### Copy Rules
- Use `package`, not `parcel`, unless product naming changes.
- Use `receiver phone`, not `identity proof`.
- Use `verified update`, not `custody projection`.
- Use `latest update`, not `last scan` unless the backend event is explicitly scan-based.
- Use `public timeline`, not `full internal timeline`.

## Component Requirements
### `ReceiverTrackingLandingScreen`
Responsibilities:
- Read route tracking code.
- Validate format.
- Fetch public tracking when valid.
- Map API result to screen state.
- Render correct action route.
- Emit analytics without sensitive values.

Props:
- none for route usage, or route adapter props in tests.

### `ReceiverLinkStatusHero`
Props:
- `state`
- `title`
- `body`
- `primaryAction`
- `secondaryAction`
- `isLoading`

Behavior:
- Renders the top state.
- Keeps heading and action stable.
- Supports error states without layout collapse.

### `ReceiverSafeStatusCard`
Props:
- `trackingCode`
- `publicLabel`
- `latestTouchpointRole`
- `latestTouchpointOccurredAt`
- `etaLabel`
- `receiverVerificationRequired`

Behavior:
- Shows only privacy-safe fields.
- Maps role enums to public copy.
- Hides raw station ID.
- Formats time safely.

### `ReceiverVerificationGateCard`
Props:
- `trackingCode`

Behavior:
- Explains verification.
- Routes to `/r/:trackingCode/verify-phone`.
- Does not render inputs.

### `ReceiverTrackingRecoveryPanel`
Props:
- `state`
- `trackingCode`

Behavior:
- Shows support and manual tracking links.
- Strips sensitive query values.
- Uses state-specific copy.

### `ReceiverPrivacyNote`
Props:
- none required.

Behavior:
- States privacy boundaries.
- Keeps copy short.
- Links to `/privacy`.

## Public Role Copy
Map latest touchpoint roles to public copy:
- `system`: `Kra update`
- `station_operator`: `Kra station update`
- `driver`: `Line-haul update`
- `final_mile_courier`: `Doorstep delivery update`
- Unknown role: `Kra update`

Rules:
- Do not show staff names.
- Do not show actor IDs.
- Do not show raw enum values.
- Do not show raw station IDs.

## Time And ETA Rules
### Latest Update Time
Show:
- Relative time: `Updated 12 minutes ago`
- Secondary exact time only if locale formatting is clear: `Today, 2:35 PM`

Rules:
- Use user's locale where possible.
- If timestamp is invalid, hide exact time and log sanitized client error.
- Do not show raw ISO string in customer UI.

### ETA Label
Use backend `etaLabel` only:
- `Awaiting next update`
- `Expected tomorrow`
- `Expected today`

Rules:
- Do not invent exact delivery time.
- Do not show guaranteed arrival.
- Do not show countdown clocks.
- Do not convert `Expected today` into a time window unless backend later provides one.

## Interaction Details
### Initial Load
Flow:
1. Read route tracking code.
2. Normalize case and trim if safe.
3. Validate against `^KRA-[A-Z0-9-]+$`.
4. If invalid, render `invalid_format`.
5. If valid, call `GET /v1/public/track/:trackingCode`.
6. Render success or error state.

### Retry
Retry appears on recoverable errors:
- service unavailable.
- offline.
- rate limited after retry window.

Retry must:
- Reuse the normalized tracking code.
- Not call phone challenge endpoint.
- Not call OTP verification endpoint.
- Not create support issue.

### Primary Action Routing
If verification required:
- Route to `/r/:trackingCode/verify-phone`.

If verification not required:
- Route to `/r/:trackingCode/timeline`.

If invalid or not found:
- Route to `/track`.

If expired or access denied:
- Route to `/support`.

### Copy Tracking Code
Optional:
- Provide `Copy code` if users may need support.

Rules:
- Must use the Clipboard API safely.
- Must show success state.
- Must not send copied code to analytics.
- Must not be the primary action.

## Accessibility Requirements
### Semantics
- Use one `h1`.
- Use `main`.
- Loading state uses `aria-busy`.
- Lookup result updates use `aria-live="polite"`.
- Error state headings are programmatically associated with recovery copy.
- Primary CTA is a real link or button with correct semantics.

### Focus
- On route load, do not steal focus unless app routing standard does so.
- On lookup error, move focus to the error heading only after user-initiated retry.
- On primary action, route normally.
- On copy success, announce through a polite status region.

### Error Copy
- Error copy must be visible, not only color.
- Error copy must not rely on icons.
- Recovery action must be keyboard reachable.

### Touch Targets
- CTAs at least `44px` high.
- Copy code action at least `44px` high if present.
- Links have enough spacing for one-thumb use.

### Reduced Motion
- Disable skeleton shimmer and status transitions when `prefers-reduced-motion`.

## Security Requirements
### Enumeration Resistance
For not found, expired, and access denied:
- Keep copy generic.
- Do not say whether the delivery exists.
- Do not say whether receiver phone matched.
- Do not say whether sender cancelled.
- Do not say whether package is at a station.

### Token And Link Safety
If future signed link tokens are added:
- Tokens must not be shown.
- Tokens must not be copied.
- Tokens must not be sent to analytics.
- Tokens must not be appended to support links.
- Expired token state must route to `/r/expired`.

### Analytics Safety
Do not record:
- raw tracking code.
- delivery ID.
- phone number.
- token.
- sender ID.
- station ID.
- raw URL.
- full query string.

Allowed:
- status bucket.
- source bucket.
- verification required boolean.
- error bucket.
- action name.

## Analytics Requirements
Required events:
- `receiver_tracking_landing_viewed`
- `receiver_tracking_landing_lookup_started`
- `receiver_tracking_landing_lookup_succeeded`
- `receiver_tracking_landing_lookup_failed`
- `receiver_tracking_landing_primary_clicked`
- `receiver_tracking_landing_support_clicked`
- `receiver_tracking_landing_track_another_clicked`

Event properties:
- `sourceBucket`
- `resultState`
- `verificationRequired`
- `statusBucket`
- `errorBucket`
- `etaShown`

Allowed `sourceBucket` values:
- `sms`
- `sender`
- `support`
- `unknown`

Allowed `resultState` values:
- `loading`
- `ready`
- `verification_required`
- `invalid_format`
- `not_found`
- `expired`
- `access_denied`
- `rate_limited`
- `service_unavailable`
- `offline`

## SEO And Metadata
This route is delivery-scoped and should not be indexed.

Set:
- `robots: noindex, nofollow`
- `title`: `Receiver Tracking | Kra`
- `description`: `Open a Kra receiver tracking link, view safe package status, and continue to verified tracking.`

Canonical:
- Do not canonicalize individual tracking links.
- If framework requires canonical, use `/track` or omit canonical for this route based on project SEO conventions.

Open graph:
- Use generic Kra tracking metadata.
- Do not include tracking code.
- Do not include delivery status.

## Empty And Blocked Copy
### No Public Status
If backend returns an incomplete response:
- Show service unavailable state.
- Do not render partial delivery fields.
- Log sanitized client error.

Copy:
- `We could not load this tracking link right now. Try again shortly.`

### Status Is `draft`
If public endpoint returns `draft`:
- Show `Booking created` only if backend returns it.
- Supporting copy: `This delivery is not yet moving through the Kra network.`

### Status Is `cancelled`
Show:
- `Cancelled`
- Supporting copy: `This delivery is no longer active. Contact the sender or support if you need help.`

### Status Is `issue_reported`
Show:
- `Issue under review`
- Supporting copy: `Kra is reviewing the package status. Public updates will appear when available.`

Do not show:
- Issue category.
- Issue note.
- Refund reason.

### Status Is `delivered`
Show:
- `Delivered`
- Supporting copy: `Delivery has been marked complete with accepted proof.`

Do not show:
- Proof asset.
- Signature.
- Photo.
- Receiver name.

## Error Recovery Matrix
| State | User Message | Primary Action | Secondary Action | Data Exposure |
| --- | --- | --- | --- | --- |
| `invalid_format` | Link format is not valid | `Enter tracking code` | `Contact support` | none |
| `not_found` | Link cannot be found | `Enter tracking code` | `Contact support` | none |
| `expired` | Link expired | `Request help` | `Enter tracking code` | none |
| `access_denied` | Link cannot be opened | `Contact support` | `Enter tracking code` | none |
| `rate_limited` | Too many attempts | wait/retry | `Contact support` | none |
| `service_unavailable` | Tracking unavailable | `Try again` | `Contact support` | none |
| `offline` | Connection offline | `Try again` | `Read delivery policy` | none |

## Testing Requirements
### Unit Tests
Test:
- Valid route code calls `get_public_tracking`.
- Malformed route code does not call API.
- Success with `receiverVerificationRequired: true` renders verification CTA.
- Success with `receiverVerificationRequired: false` renders timeline CTA.
- Raw `deliveryId` is not rendered.
- Raw `stationId` is not rendered.
- Raw role enum is not rendered.
- Not found renders safe recovery copy.
- Expired renders safe recovery copy.
- Access denied renders safe recovery copy.
- Rate limited renders wait copy.
- Offline state does not blame Kra.

### Integration Tests
Test:
- `/r/:trackingCode` renders `screen-receiver-tracking-landing`.
- Primary CTA routes to `/r/:trackingCode/verify-phone` when verification is required.
- Primary CTA routes to `/r/:trackingCode/timeline` when verification is not required.
- Support route does not include tracking code query values unless project policy later permits a safe support reference.
- `/track` recovery route works.
- Analytics events omit raw tracking code.

### Accessibility Tests
Test:
- One `h1`.
- Loading state announces progress.
- Error state has clear heading.
- CTAs are keyboard reachable.
- Copy action announces success if implemented.
- Reduced motion disables shimmer.
- Page works at `200%` zoom.
- Touch targets are large enough on mobile.

### End-To-End Tests
Test name: `receiver_tracking_landing_verification_required`
- Visit `/r/KRA-0001`.
- Stub public tracking response with `receiverVerificationRequired: true`.
- Assert `screen-receiver-tracking-landing` is visible.
- Assert status card is visible.
- Assert `Verify phone to continue` routes to `/r/KRA-0001/verify-phone`.
- Assert no receiver phone is visible.

Test name: `receiver_tracking_landing_tracking_ready`
- Visit `/r/KRA-0002`.
- Stub public tracking response with `receiverVerificationRequired: false`.
- Assert `View tracking details` routes to `/r/KRA-0002/timeline`.
- Assert no raw station ID is visible.

Test name: `receiver_tracking_landing_not_found`
- Visit `/r/KRA-UNKNOWN`.
- Stub not found.
- Assert safe not-found copy.
- Assert support link is visible.

Test name: `receiver_tracking_landing_invalid_format`
- Visit `/r/bad-code`.
- Assert API was not called.
- Assert manual tracking recovery is visible.

Test name: `receiver_tracking_landing_access_denied`
- Visit `/r/KRA-0003`.
- Stub access denied.
- Assert no delivery detail appears.
- Assert support recovery is visible.

## Implementation Notes For Claude Code
### Build Scope
Build only the receiver tracking landing page and supporting receiver-public components. Do not build the phone challenge, OTP verify, timeline, arrival, failed-attempt, refusal, expired, or access-denied standalone screens in this task unless the implementation architecture needs small shared error components.

### Files To Consider
Likely implementation areas:
- `apps/web` route for `/r/:trackingCode`.
- Receiver public layout components.
- Public tracking API client.
- Public analytics wrapper.
- Route sanitization helper.
- Receiver public tests.

### Contract Discipline
Use the existing shared contract:
- `trackingCodeSchema`
- `publicTrackingResponseSchema`

Do not:
- Add new public data fields.
- Call receiver phone challenge endpoint from this screen.
- Call OTP verify endpoint from this screen.
- Show internal status fields.
- Infer payment, refund, proof, or support outcomes.

### Design System Discipline
Use existing tokens:
- `brand.blue.600`
- `success.green.600`
- `warning.amber.600`
- `danger.red.600`
- `neutral.900`
- `neutral.700`
- `neutral.500`
- `neutral.100`
- `surface`

Use existing typography:
- `Manrope`
- `Inter`

Use restrained motion and avoid route-map theater.

## Acceptance Criteria
The screen is complete when:
- `/r/:trackingCode` renders the receiver tracking landing page.
- Primary test ID is `screen-receiver-tracking-landing`.
- Valid tracking code triggers `get_public_tracking`.
- Invalid tracking code does not trigger network lookup.
- Verification-required success routes to phone challenge.
- Verification-not-required success routes to timeline.
- Required error states render safe recovery.
- Raw sensitive fields are not displayed.
- Analytics omit sensitive values.
- Metadata is noindex.
- Mobile layout is first-class.
- Accessibility tests pass.
- E2E tests cover verification required, tracking ready, invalid format, not found, and access denied.

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
- Shows full timeline on the landing page.
- Requests phone on the landing page.
- Requests OTP on the landing page.
- Shows receiver address.
- Shows receiver phone.
- Shows payment state.
- Shows refund state.
- Shows proof assets.
- Shows raw station IDs.
- Shows staff names or IDs.
- Shows internal issue details.
- Shows live GPS.
- Uses scare copy.
- Uses broad delivery guarantees.
- Logs raw tracking code to analytics.
- Treats sender-shared links as authenticated receiver identity.

## Final Quality Review
Before closing implementation, review the built screen from five viewpoints:
- Receiver: understands package status and next step.
- Sender: sees that shared link is privacy-safe.
- Support agent: can explain recovery states without internal data.
- Security reviewer: sees no sensitive leakage before verification.
- Accessibility reviewer: can navigate and understand every state.

Pass condition:
- The page feels like a secure, polished receiver doorway into Kra tracking.
- It shows enough status to reduce anxiety.
- It withholds sensitive detail until the correct verification step.
- Recovery states are calm, specific, and safe.
