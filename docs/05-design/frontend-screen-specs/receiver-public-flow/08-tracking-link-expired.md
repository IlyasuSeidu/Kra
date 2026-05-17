# Tracking Link Expired Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `TrackingLinkExpired` |
| App | `apps/web` |
| Route | `/r/expired` |
| Primary test ID | `screen-tracking-expired` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` only after receiver submits a valid tracking code |
| Related routes | `/track`, `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/r/access-denied`, `/support`, `/privacy` |
| Required states | `expired`, `request support` |

## Product Job
This screen helps a receiver recover when a tracking link, phone challenge, OTP, signed receiver link, or receiver verification grant has expired. It must explain the expiry without exposing delivery data, give a safe way to continue, and prevent reuse of expired tokens.

The page must help receivers:
- Understand that the link or session expired for privacy and security.
- Enter a tracking code again when they have one.
- Verify the receiver phone again when the app has a validated tracking-code context.
- Contact support without exposing tracking code, phone, token, delivery ID, or issue data in the URL.
- Avoid using old OTPs, old screenshots, or forwarded links as current delivery access.
- Understand that expired access does not mean the package is lost or cancelled.

This screen is not a full tracking page, OTP entry page, support case form, sender dashboard, receiver account login, proof page, payment page, or staff recovery tool.

## Audience
Primary audience:
- Receivers who clicked an expired receiver tracking link.
- Receivers whose OTP challenge expired.
- Receivers whose receiver verification grant expired after inactivity.
- Receivers who returned to a tracking page from an old message or browser tab.

Secondary audience:
- Senders helping receivers recover tracking access.
- Support staff explaining why a link stopped working.
- QA engineers verifying receiver privacy and access recovery.

## User State
The receiver may think the package is gone, the code is wrong, or they are blocked. They may be on a low-end phone, moving between SMS and browser, or returning after several minutes. The page must be calm, direct, and fast to act on.

## Primary Action
Primary CTA depends on available context:
- `Enter tracking code` when no validated tracking code is available.
- `Verify phone again` when navigation state contains a validated tracking code and receiver verification is required.
- `Request support` when the user does not have the tracking code or repeated recovery fails.

Secondary CTA:
- `Read privacy policy`

CTA behavior:
- `Enter tracking code` focuses the tracking-code input or routes to `/track`.
- `Verify phone again` routes to `/r/:trackingCode/verify-phone` only when the code is already validated and safe in route state.
- `Request support` routes to `/support` without query parameters carrying sensitive delivery data.
- `Read privacy policy` routes to `/privacy`.

## Main Tension
The page must be useful without giving attackers information about whether a tracking link, tracking code, phone number, or delivery exists. Expiry is a security state. The UI must explain recovery generically, accept a tracking code only through normal validation, and avoid exposing whether an old link was valid.

## Visual Thesis
Design this page as a secure recovery checkpoint: a clear expired-state hero, a compact recovery form, a safety note, and a support escape hatch. It should feel calm and protective, not like an error wall.

## Restraint Rule
Do not build a tracking dashboard here. Avoid status cards, maps, package details, station details, phone masks, payment panels, proof details, issue details, broad support forms, or security lectures.

Every element must help one of these:
- Explain expiry.
- Start safe recovery.
- Prevent reuse of expired access.
- Protect receiver data.
- Route to support.

## Elite Quality Gate
This spec is not closed unless the resulting UI can recover a receiver safely without leaking account, delivery, or verification signals.

Non-negotiable quality requirements:
- The first viewport must say the link or session expired and show a recovery action.
- The page must not call `get_public_tracking` on initial load because `/r/expired` has no route tracking code.
- The page may call `get_public_tracking` only after the receiver submits a syntactically valid tracking code.
- The page must not render delivery status before successful tracking-code lookup.
- The page must not expose expired token, OTP, verification token, challenge ID, delivery ID, station ID, phone, proof data, payment data, issue data, staff identity, or GPS.
- Expired OTPs, expired challenges, expired receiver links, and expired grants must not be reused.
- Recovery errors must be generic enough to avoid enumeration.
- The page must not state that the package is lost, cancelled, delayed, or blocked.
- The page must work first on mobile.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network.

Closure rule:
- If the page leaks whether an expired link was once valid, the screen remains open.
- If expired access can be submitted again, the screen remains open.
- If tracking code recovery bypasses verification requirements, the screen remains open.
- If the support URL includes sensitive data, the screen remains open.
- If the receiver cannot recover or request help from the first viewport, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- GOV.UK Design System confirm-email guidance says expiring links should explain that they expired and why, then give a clear recovery path.
- OWASP Forgot Password guidance supports single-use, time-limited links and generic recovery responses to avoid account enumeration.
- NIST SP 800-63B session guidance supports terminating expired sessions and requiring reauthentication after timeout.
- GOV.UK link guidance supports descriptive, contextual link text instead of generic labels.
- W3C WCAG 2.2 guidance requires accessible status messages, clear error recovery, focus order, and accessible authentication patterns.

Reference links:
- https://design-system.service.gov.uk/patterns/confirm-an-email-address/
- https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://www.gov.uk/guidance/content-design/links
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy government service layouts, security wording, account-reset patterns, email confirmation copy, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Why did this page appear?
- Does expiry mean the package is gone?
- What can I do now?
- Can I enter my tracking code again?
- Can I verify phone again?
- Should I reuse the old OTP?
- Where do I get support?
- Why are delivery details hidden?

## Route And Access Rules
### Route
- Render at `/r/expired`.
- Must be public and unauthenticated.
- Must not require account creation.
- Must not show delivery data on initial render.
- Must not accept token, OTP, challenge ID, verification token, or delivery ID as route parameters.

### Optional Navigation State
The page may receive non-URL navigation state from another receiver route:
- `trackingCode`, only if already validated by the app before redirect.
- `expiredSource`, with safe values `receiver_link`, `phone_challenge`, `otp`, `verification_grant`, `unknown`.

Rules:
- Do not persist navigation state beyond the current recovery flow.
- Do not store in analytics.
- Do not show raw token values.
- Do not require navigation state; page must work without it.

### URL Query Parameters
Allowed:
- None required.

Forbidden:
- `trackingCode`
- `deliveryId`
- `token`
- `verificationToken`
- `challengeId`
- `otp`
- `phone`
- `stationId`
- `issueId`

If forbidden query parameters are present:
- Ignore them.
- Clear them from URL if frontend router supports safe replacement.
- Show the generic expired state.

## Backend Contract
### Recovery Tracking Lookup
Operation:
- `get_public_tracking`

Endpoint:
- `GET /v1/public/track/:trackingCode`

When allowed:
- Only after the receiver enters a syntactically valid tracking code in the recovery form.
- Only after client-side tracking code validation passes `^KRA-[A-Z0-9-]+$`.

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

Renderable before redirect:
- None, except generic recovery success route decision.

Routing after successful lookup:
- If `receiverVerificationRequired=true`, route to `/r/:trackingCode/verify-phone`.
- If `receiverVerificationRequired=false`, route to `/r/:trackingCode/timeline`.

Do not render on expired page:
- `deliveryId`
- raw status enum
- `publicLabel`
- `latestTouchpoint`
- `stationId`
- ETA
- phone
- proof or payment data

### Expiry Sources
Current known expiry sources:
- Phone challenge expires after `10 minutes`.
- Receiver verification grant expires after `30 minutes`.
- Future signed receiver links may expire independently.
- OTP verification fails if challenge is consumed, missing, expired, or mismatched.

Rules:
- Expired challenge requires requesting a new phone challenge.
- Expired verification grant requires phone verification again.
- Expired signed link requires entering tracking code again or contacting support.
- Expired OTP must not be retried as valid proof.

## Authorized And Forbidden Operations
### Authorized
This screen may:
- Validate tracking code format locally.
- Call `get_public_tracking` after valid tracking-code submission.
- Route to `/r/:trackingCode/verify-phone`.
- Route to `/r/:trackingCode/timeline`.
- Route to `/track`.
- Route to `/support`.
- Route to `/privacy`.

### Forbidden
This screen must never call:
- `request_public_tracking_phone_challenge` directly before a tracking code is validated.
- `verify_public_tracking_phone`.
- `get_delivery`
- `get_delivery_timeline`
- `list_issues`
- `get_issue`
- `create_issue`
- `record_failed_attempt`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `refund_payment`
- Any staff, sender, station, courier, finance, support-admin, or admin endpoint.

This screen must never render controls for:
- OTP entry.
- Phone challenge submission unless routed to verify-phone screen.
- Delivery completion.
- Proof upload.
- Support case submission.
- Refund request.
- Address editing.
- Account sign-in.

## State Model
### `expired`
Use when:
- The page is opened normally.
- The app cannot or should not disclose the exact expired credential type.

Required UI:
- Title: `This tracking link has expired`
- Body: `For privacy, this link or session can no longer show receiver tracking. Enter the tracking code again or request help.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired`

### `expired_receiver_link`
Use when:
- Safe navigation state says a signed receiver link expired.

Required UI:
- Title: `This receiver link has expired`
- Body: `Receiver links expire to protect delivery details. Enter the tracking code again or request help.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired-receiver-link`

### `expired_phone_challenge`
Use when:
- Safe navigation state says phone challenge expired.

Required UI:
- Title: `This verification code has expired`
- Body: `Verification codes expire quickly. Request a new code before viewing receiver tracking.`
- Primary CTA: `Verify phone again` when validated tracking code is available.
- Fallback CTA: `Enter tracking code`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired-phone-challenge`

### `expired_verification_grant`
Use when:
- Safe navigation state says receiver verification grant expired.

Required UI:
- Title: `Your verified session expired`
- Body: `Receiver tracking access expires after inactivity. Verify the receiver phone again to continue.`
- Primary CTA: `Verify phone again` when validated tracking code is available.
- Fallback CTA: `Enter tracking code`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired-verification-grant`

### `tracking_code_entry`
Use when:
- Receiver chooses to enter tracking code on this page.

Required UI:
- Label: `Tracking code`
- Helper: `Use the code that starts with KRA.`
- Submit CTA: `Continue tracking`
- Secondary CTA: `Request support`

Validation:
- Required.
- Trim whitespace.
- Uppercase letters.
- Must match `^KRA-[A-Z0-9-]+$`.
- Invalid format shows safe inline error.

Test ID:
- `state-tracking-expired-code-entry`

### `lookup_loading`
Use when:
- Recovery tracking lookup is in flight.

Required UI:
- Submit button busy state.
- Text: `Checking tracking code...`
- Disable duplicate submit.

Test ID:
- `state-tracking-expired-lookup-loading`

### `lookup_not_found`
Use when:
- `get_public_tracking` returns 404.

Required UI:
- Title: `We could not find that tracking code`
- Body: `Check the code and try again, or request support.`
- CTA: `Try again`
- Secondary CTA: `Request support`

Privacy rule:
- Do not say whether an expired link was valid.

Test ID:
- `state-tracking-expired-not-found`

### `lookup_rate_limited`
Use when:
- API returns 429.

Required UI:
- Title: `Too many tracking attempts`
- Body: `Wait a short time before trying again.`
- CTA: `Try again later`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired-rate-limited`

### `request_support`
Use when:
- Receiver chooses support path.
- Tracking code is missing.
- Recovery fails repeatedly.

Required UI:
- Title: `Request help with tracking access`
- Body: `Support can help if the link expired, the code is unavailable, or the receiver cannot verify phone access.`
- CTA: `Contact support`
- Secondary CTA: `Enter tracking code`

Test ID:
- `state-tracking-expired-request-support`

### `service_unavailable`
Use when:
- API returns 5xx, timeout, or maintenance.

Required UI:
- Title: `Tracking recovery is temporarily unavailable`
- Body: `Try again. If you need urgent help, contact support.`
- CTA: `Try again`
- Secondary CTA: `Request support`

Test ID:
- `state-tracking-expired-unavailable`

### `offline`
Use when:
- Browser is offline or cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect to enter the tracking code again.`
- CTA: `Try again`

Test ID:
- `state-tracking-expired-offline`

## Layout Blueprint
### Mobile
Order:
- Header.
- Expired-state hero.
- Primary recovery action.
- Tracking-code entry when expanded.
- Safety note.
- Support route.
- Privacy link.

Rules:
- Expired explanation and recovery action must appear above fold.
- Form should be one field and one button.
- Avoid dense security text.
- Avoid tables.
- Avoid horizontal scroll.
- Keep tap targets at least `44px`.

### Desktop
Use a centered recovery layout:
- Main card: expired explanation and recovery form.
- Side card: safety note and support.

Keep max content width around `920px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Tracking recovery`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in.
- Staff sign-in.
- Admin links.
- Pricing CTA.

## Visual Direction
### Mood
Secure, calm, protective, and recoverable.

### Composition
- Clear expired icon or badge.
- Large heading.
- Short explanation.
- Recovery form or CTA.
- Safety note.
- Support link.

### Color Rules
- `warning.amber.600` for expired state.
- `brand.blue.600` for recovery CTA.
- `danger.red.600` only for unavailable or repeated error.
- Neutral surfaces for safety notes.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and form copy.
- Keep paragraphs short.
- Recovery CTA should be visually dominant.

### Iconography
Allowed icon ideas:
- Clock.
- Shield.
- Link break.
- Help circle.

Rules:
- Icons must be secondary to text.
- Do not use lock icon as the only explanation.
- Do not use package or map icons because delivery data is hidden.

### Motion
- Use subtle entrance only for the recovery card.
- No countdown.
- No shaking form field.
- No animated lock.
- Respect `prefers-reduced-motion`.

## Content Structure
### Expired Hero
Title variants:
- `This tracking link has expired`
- `This receiver link has expired`
- `This verification code has expired`
- `Your verified session expired`

Body variants:
- Generic: `For privacy, this link or session can no longer show receiver tracking. Enter the tracking code again or request help.`
- Receiver link: `Receiver links expire to protect delivery details. Enter the tracking code again or request help.`
- Phone challenge: `Verification codes expire quickly. Request a new code before viewing receiver tracking.`
- Grant: `Receiver tracking access expires after inactivity. Verify the receiver phone again to continue.`

### Recovery Form
Fields:
- Tracking code input.

Label:
- `Tracking code`

Helper:
- `Use the code that starts with KRA.`

Button:
- `Continue tracking`

Inline errors:
- Empty: `Enter a tracking code.`
- Invalid format: `Enter a valid Kra tracking code.`
- Not found: `We could not find that tracking code. Check it and try again.`
- Rate limited: `Too many attempts. Wait a short time before trying again.`

Rules:
- Do not reveal whether the expired link itself was valid.
- Do not show package status on this screen.
- Do not keep invalid code in URL.

### Recovery Decision Card
After successful lookup:
- If receiver verification is required, route to phone verification.
- If receiver verification is not required, route to timeline.

Do not show:
- Status preview.
- ETA.
- Station.
- Latest touchpoint.
- Receiver name.

### Safety Note
Title:
- `Why links expire`

Copy:
- `Expired links help protect receiver phone, address, proof, and package status from being viewed through old messages or shared links.`

Additional note:
- `Do not reuse old OTP codes. Request a new code when asked.`

### Support Card
Title:
- `Need help recovering access?`

Copy:
- `Contact support if you do not have the tracking code, cannot verify phone access, or believe the link expired incorrectly.`

CTA:
- `Contact support`

Rules:
- Do not prefill support link with tracking code unless future support intake contract allows secure handoff.

### Privacy Note
Title:
- `No delivery details are shown here`

Copy:
- `This recovery page does not show package status, receiver phone, address, payment, proof, staff identity, station ID, issue details, or GPS.`

## Information Architecture
### Required Components
`ReceiverPublicShell`
- Shared receiver public header and safe page frame.

`TrackingExpiredHero`
- Renders expired-state title, body, and recovery CTA.

`TrackingExpiredRecoveryForm`
- Renders tracking code input, validation, and lookup submit.

`TrackingExpiredSafetyNote`
- Renders privacy and no-old-OTP explanation.

`TrackingExpiredSupportCard`
- Renders support recovery route.

`TrackingExpiredPrivacyNote`
- Renders public-data limitation.

### Component Boundaries
Do not build:
- OTP input.
- Phone verification form.
- Full tracking timeline.
- Package status card.
- Support issue form.
- Sender login.
- Account creation.
- Payment correction.
- Proof upload.
- Map.
- Station directory.

Small shared components are allowed only when they support receiver public recovery screens.

## Data Handling Rules
### Tracking Code
- Accept only in form input.
- Validate before API call.
- Uppercase for validation and route construction.
- Do not store in analytics.
- Do not include in support URL.
- Do not render after successful lookup on expired page.

### Expired Token Or Link Data
- Do not parse token details client-side.
- Do not show token.
- Do not send token to API.
- Do not store token.
- Remove forbidden query parameters when safe.

### Verification Grant
- Clear expired grant from client receiver state.
- Do not reuse expired grant.
- Do not render verification token.
- Do not send verification token to analytics.

### OTP Or Challenge
- Clear expired challenge context.
- Do not reuse expired OTP.
- Do not display old OTP.
- Route to phone challenge flow for new code.

### Public Tracking Response
- Use only for routing decision.
- Do not render status on expired page.
- Do not render delivery ID.
- Do not render station ID.
- Do not render latest touchpoint.

## Accessibility Requirements
### Semantics
- Page has one `h1`.
- Form has explicit label.
- Helper text and errors are programmatically associated with input.
- Lookup state uses polite live region.
- Error summary appears for submit failure if needed.

### Keyboard
- Primary CTA is reachable after heading.
- Tracking input is reachable and clearable.
- Submit works with Enter.
- Focus moves to inline error after validation failure.
- Focus moves to recovery route announcement after successful lookup if navigation is delayed.

### Screen Reader
- Expired state must announce as status.
- Recovery form label must include expected format.
- Error messages must not rely on color.
- Support link text must be descriptive.

### Contrast And Text
- All normal text meets WCAG AA contrast.
- Warning state must not rely only on amber.
- Minimum body text `16px`.
- Large text must not hide the form or support CTA.

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Disable decorative card reveal.
- Keep focus indicators visible.

### Timeouts
- Do not show an auto-refresh countdown.
- If future session timeout warning is added, it must be accessible and not trap focus.

## Responsive Requirements
### Mobile
- Primary target viewport is `360px` to `430px`.
- One-field recovery form.
- No horizontal scrolling.
- Support link visible without excessive scrolling.
- Keyboard open state must not hide submit button.

### Tablet
- Preserve mobile reading order.
- Increase spacing without adding extra columns inside the form.

### Desktop
- Center recovery content.
- Use side card only for safety and support.
- Keep main card readable and narrow.

## Empty, Error, And Edge Cases
### No Context
Use generic `expired` state.

Rules:
- Do not ask for token.
- Do not say which credential expired.

### Forbidden Query Parameters Present
Use generic expired state.

Rules:
- Ignore sensitive parameters.
- Replace URL with `/r/expired` when safe.
- Do not log values.

### API 404 On Entered Tracking Code
Render not-found state without mentioning expired link validity.

### API 429
Render rate-limited state.

### API 5xx
Render unavailable state.

### Offline
Render offline state.

### Valid Tracking Code And Verification Required
Route to:
- `/r/:trackingCode/verify-phone`

### Valid Tracking Code And Verification Not Required
Route to:
- `/r/:trackingCode/timeline`

### Expired Grant From Deep Link
Clear expired grant and route recovery CTA to phone verification only when a validated tracking code is available in navigation state.

## Copy System
### Voice
- Calm.
- Secure.
- Helpful.
- Brief.
- Non-technical.

### Words To Prefer
- `expired`
- `for privacy`
- `enter tracking code`
- `verify phone again`
- `request help`
- `old link`
- `new code`

### Words To Avoid
- `invalid token`
- `expired JWT`
- `unauthorized`
- `forbidden`
- `session object`
- `credential`
- `package lost`
- `delivery cancelled`
- `access granted`
- `click here`

### Microcopy Rules
- Explain why access expired.
- Give one main action.
- Keep support as safe fallback.
- Do not use blame language.
- Do not expose technical cause.

## Analytics
Events must not include raw tracking code, token, OTP, challenge ID, verification token, phone, delivery ID, station ID, issue ID, proof reference, address, or status.

Allowed events:
- `tracking_expired_viewed`
- `tracking_expired_state_rendered`
- `tracking_expired_code_submitted`
- `tracking_expired_recovery_routed`
- `tracking_expired_support_clicked`
- `tracking_expired_privacy_clicked`
- `tracking_expired_retry_clicked`

Allowed properties:
- `expired_source`: `receiver_link`, `phone_challenge`, `otp`, `verification_grant`, `unknown`
- `has_validated_code_context`: boolean
- `result`: `code_format_error`, `lookup_success`, `not_found`, `rate_limited`, `unavailable`, `offline`, `support_clicked`
- `next_route_type`: `verify_phone`, `timeline`, `track`, `support`, `none`

Forbidden properties:
- `trackingCode`
- `deliveryId`
- `token`
- `verificationToken`
- `challengeId`
- `otp`
- `phone`
- `stationId`
- `issueId`
- `rawStatus`

## SEO And Metadata
This is a delivery-scoped recovery page.

Metadata:
- `robots`: `noindex,nofollow`
- Title: `Tracking link expired | Kra`
- Description: `Recover access to Kra receiver tracking after a link expires.`

Rules:
- Do not put tracking code in title.
- Do not expose token or status in metadata.
- Do not generate public share cards with recovery state.

## Security And Privacy Requirements
- Treat route as public.
- Do not show delivery data on page load.
- Validate tracking code before API call.
- Do not reuse expired links, challenges, OTPs, or verification grants.
- Do not expose hidden fields from API response.
- Do not leak sensitive data through URL, analytics, logs, DOM attributes, title, metadata, or support links.
- Keep error copy generic enough to avoid enumeration.
- Do not require receiver account creation.

## Performance Requirements
- Initial page must render without API dependency.
- Recovery lookup is the only network call after user submits a valid code.
- No map SDK.
- No real-time socket.
- No heavy animation package.
- No remote decorative video.
- Layout must avoid content shift when form expands.
- Critical text must be HTML, not image text.

## Test IDs
Required:
- `screen-tracking-expired`
- `state-tracking-expired`
- `state-tracking-expired-receiver-link`
- `state-tracking-expired-phone-challenge`
- `state-tracking-expired-verification-grant`
- `state-tracking-expired-code-entry`
- `state-tracking-expired-lookup-loading`
- `state-tracking-expired-not-found`
- `state-tracking-expired-rate-limited`
- `state-tracking-expired-request-support`
- `state-tracking-expired-unavailable`
- `state-tracking-expired-offline`
- `component-tracking-expired-hero`
- `component-tracking-expired-recovery-form`
- `component-tracking-expired-safety-note`
- `component-tracking-expired-support`
- `component-tracking-expired-privacy-note`
- `input-tracking-expired-code`
- `cta-tracking-expired-submit`
- `cta-tracking-expired-support`
- `cta-tracking-expired-privacy`
- `cta-tracking-expired-retry`

Rules:
- Test IDs must be stable.
- Do not encode tracking code, token, source route, or status into test IDs.

## Unit Test Coverage
### Route And Initial State
- `/r/expired` renders without API call.
- Generic expired state renders when no context exists.
- Receiver-link source renders receiver-link state.
- Phone-challenge source renders code-expired state.
- Verification-grant source renders session-expired state.
- Forbidden query parameters are ignored.

### Recovery Form
- Empty tracking code shows required error.
- Invalid tracking code format shows validation error.
- Valid tracking code calls `get_public_tracking`.
- Submit is disabled while lookup is in flight.
- Enter key submits the form.
- Tracking code is uppercased before route construction.

### Lookup Outcomes
- Lookup 404 renders not-found state.
- Lookup 429 renders rate-limited state.
- Lookup 5xx renders unavailable state.
- Offline renders offline state.
- Successful lookup with `receiverVerificationRequired=true` routes to verify phone.
- Successful lookup with `receiverVerificationRequired=false` routes to timeline.

### Privacy
- Initial render shows no delivery status.
- Successful lookup does not render delivery status on expired page.
- `deliveryId` is not rendered.
- `stationId` is not rendered.
- `publicLabel` is not rendered before redirect.
- Token, OTP, challenge ID, verification token, and phone are not rendered.
- Support URL contains no sensitive query values.

### Operations
- Initial page does not call `get_public_tracking`.
- Page never calls `request_public_tracking_phone_challenge`.
- Page never calls `verify_public_tracking_phone`.
- Page never calls authenticated delivery, issue, proof, payment, refund, staff, or admin endpoints.

## Integration Test Coverage
Use frontend test harness with API interception.

Scenarios:
- Receiver opens `/r/expired` and sees generic expired recovery.
- Receiver opens with safe source state `phone_challenge` and sees code-expired copy.
- Receiver opens with forbidden query parameters and they are ignored.
- Receiver enters invalid code and no network request is made.
- Receiver enters valid code and lookup returns verification required, then route becomes `/r/:trackingCode/verify-phone`.
- Receiver enters valid code and lookup returns verification not required, then route becomes `/r/:trackingCode/timeline`.
- Receiver enters valid code and lookup returns 404, then not-found state appears.
- Receiver clicks support and URL excludes tracking code, phone, token, delivery ID, and status.

Assertions:
- `screen-tracking-expired` is visible on initial render.
- First viewport contains expired explanation and recovery action.
- No forbidden endpoint is called.
- No forbidden data appears in DOM.
- Focus order follows header, expired hero, recovery form, support, privacy.

## End-To-End Acceptance
### Generic Expired Link
Given:
- User visits `/r/expired`.

When:
- Page renders.

Then:
- Page shows `This tracking link has expired`.
- Page shows enter tracking code and support recovery.
- No API request is made before user action.
- No package data is shown.

### Recovery To Phone Verification
Given:
- User enters valid tracking code.
- `get_public_tracking` returns `receiverVerificationRequired=true`.

When:
- User submits.

Then:
- User is routed to `/r/:trackingCode/verify-phone`.
- Expired token is not reused.
- No delivery status is rendered on expired page.

### Recovery To Timeline
Given:
- User enters valid tracking code.
- `get_public_tracking` returns `receiverVerificationRequired=false`.

When:
- User submits.

Then:
- User is routed to `/r/:trackingCode/timeline`.
- No sensitive data appears in analytics.

### Support Recovery
Given:
- User does not have tracking code.

When:
- User selects support.

Then:
- User routes to `/support`.
- URL does not include tracking code, token, phone, or delivery ID.

## Implementation Notes For Claude Code
Build only the tracking link expired recovery screen and receiver-safe supporting components. Do not implement full tracking timeline, OTP entry, phone challenge form, support case creation, sender dashboard, proof upload, payment recovery, account sign-in, or staff recovery UI in this task.

Recommended implementation sequence:
- Add route `/r/expired`.
- Reuse receiver public route shell.
- Add expired-source state parser that only accepts safe navigation state.
- Add forbidden query cleanup.
- Build expired hero.
- Build recovery form with tracking code validation.
- Wire `get_public_tracking` only after valid submit.
- Route based on `receiverVerificationRequired`.
- Build safety, support, and privacy notes.
- Add unit tests.
- Add integration tests.
- Add accessibility tests.

Do not add backend fields for this page. If future signed receiver links are added, define their public expiry contract before changing this screen.

## Definition Of Done
- Route exists at `/r/expired`.
- `screen-tracking-expired` renders without API call.
- All required state test IDs exist.
- Recovery lookup calls `get_public_tracking` only after valid tracking-code submit.
- Successful lookup routes to verify phone or timeline based on `receiverVerificationRequired`.
- Expired links, challenges, OTPs, and grants are not reused.
- Support route carries no sensitive query values.
- No delivery data appears on initial render.
- No forbidden data appears in DOM, analytics, logs, title, metadata, or links.
- Mobile layout is clean at `360px`.
- Keyboard and screen reader behavior passes accessibility checks.
- Reduced motion is honored.
- Unit, integration, accessibility, and route tests pass.
- Documentation and implementation remain aligned with public tracking, phone challenge, OTP verification, and privacy rules.
