# Receiver Phone Challenge Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverPhoneChallenge` |
| App | `apps/web` |
| Route | `/r/:trackingCode/verify-phone` |
| Primary test ID | `screen-receiver-phone-challenge` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `request_public_tracking_phone_challenge` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/r/expired`, `/r/access-denied`, `/track`, `/support`, `/privacy` |
| Required states | `loading`, `sent`, `throttled`, `error` |

## Product Job
This screen must let a receiver request an SMS verification challenge for a delivery-scoped tracking link. It must collect the receiver phone number, normalize it to the backend E.164 contract, submit it to the public challenge endpoint, handle sent, recently-sent, already-verified, throttled, invalid, not-found, access-denied, unavailable, and offline states, then route the receiver to OTP verification or the verified timeline as appropriate.

The page must help receivers:
- Understand why Kra needs the receiver phone.
- Enter the receiver phone tied to the delivery.
- Submit only valid phone data to the backend.
- Receive a verification SMS when the phone matches the delivery.
- Continue to OTP entry after a challenge is sent or recently sent.
- Continue to tracking when already verified.
- Recover safely when the phone does not match, the link is invalid, verification is not required, SMS is unavailable, attempts are throttled, or the network is offline.

This screen is not the OTP entry form, final delivery completion flow, timeline, support case, or account sign-in page.

## Audience
Primary audience:
- Receivers opening a Kra tracking link from SMS or a sender-shared link.

Secondary audience:
- Receivers who typed a link manually and need verification.
- Support staff guiding a receiver through phone verification.
- Senders checking why the receiver has to verify before sensitive details appear.

## User State
Receivers may be interrupted, outdoors, using a shared phone, or worried about missing a package. They may not know whether to type `024...`, `+233...`, or a different country format. The UI must explain the requirement in plain language, help normalize the phone number, and avoid blaming the user when verification fails.

## Primary Action
Primary CTA:
- `Send verification code`

Secondary CTA:
- `Back to package status`

Tertiary CTA:
- `Contact support`

CTA behavior:
- `Send verification code` submits the normalized phone to `POST /v1/public/track/:trackingCode/request-verification`.
- `Back to package status` routes to `/r/:trackingCode`.
- `Contact support` routes to `/support` without raw phone or tracking query values.

After successful challenge:
- If `challengeStatus` is `sent`, route to `/r/:trackingCode/verify-otp`.
- If `challengeStatus` is `recently_sent`, route to `/r/:trackingCode/verify-otp` and show resend timing there.
- If `challengeStatus` is `already_verified`, store the returned verification token in approved ephemeral receiver state and route to `/r/:trackingCode/timeline`.

## Main Tension
This page must feel simple while enforcing strict privacy. It should not expose whether a phone number belongs to a delivery, whether a delivery exists, or whether a receiver identity matched. It must request the minimum information needed and return safe, generic recovery copy for failures.

## Visual Thesis
Design this screen as a receiver identity checkpoint: one focused phone field, a clear privacy explanation, direct SMS challenge action, and strong recovery states. It should feel secure and calm, not like account creation.

## Restraint Rule
Do not make this page a full sign-in flow. Avoid account creation prompts, password fields, OTP fields, delivery details beyond safe context, phone-book access, contact import, live maps, support chat widgets, or broad security education.

Every visual element must help one of these:
- Explain why phone verification is needed.
- Collect a valid receiver phone.
- Submit safely.
- Route to OTP entry.
- Recover from throttling or errors.
- Protect delivery privacy.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of phone verification, delivery-link, fintech verification, and public-service identity experiences.

Non-negotiable quality requirements:
- The first viewport must show the phone input and explain why it is needed.
- The phone input must have a visible label.
- The screen must normalize to E.164 before calling the backend.
- The screen must call only `request_public_tracking_phone_challenge` from this page.
- The screen must not ask for OTP here.
- The screen must never reveal whether the entered phone matched the delivery.
- The screen must never show receiver full phone after failure.
- The screen may show `maskedPhone` only after a successful backend response.
- The screen must support loading, sent, throttled, and error states.
- The screen must prevent duplicate challenge submissions while loading.
- The screen must route `sent` and `recently_sent` to OTP entry.
- The screen must route `already_verified` to timeline without putting verification token in URL.
- The screen must work on small phones and weak networks.
- The screen must remain accessible with keyboard, screen reader, high contrast, reduced motion, and large text.

Closure rule:
- If a receiver cannot understand what number to enter, the screen remains open.
- If failure copy leaks match or mismatch, the screen remains open.
- If OTP appears on this page, the screen remains open.
- If verification token appears in URL, DOM text, analytics, or support link, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- Twilio Verify guidance: SMS verification flows need clear phone capture, resend timing, and recovery for delivery failures.
- NIST digital identity guidance: out-of-band verification requires user intent, secure delivery, rate limiting, and cautious recovery.
- OWASP Authentication guidance: authentication-like flows should avoid enumeration, use generic errors, and throttle repeated attempts.
- GOV.UK form guidance: phone fields and form errors need visible labels, clear error summaries, and action-oriented recovery.
- W3C WCAG 2.2 quick reference: form labels, errors, status updates, focus handling, and reduced motion must remain accessible.

Reference links:
- https://www.twilio.com/docs/verify
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://design-system.service.gov.uk/components/text-input/
- https://design-system.service.gov.uk/components/error-summary/
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external verification wording, security copy, input layouts, icons, progress indicators, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Why does Kra need my phone number?
- Which phone number should I enter?
- What format can I use?
- What happens after I tap send?
- How long should I wait for the SMS?
- What should I do if I cannot receive the SMS?
- Why is Kra not showing receiver details yet?
- How do I go back to the package status?
- Where can I get help without exposing private data?

## Route And Navigation Rules
### Route
- Render at `/r/:trackingCode/verify-phone`.
- Must be public and unauthenticated.
- Must not require a receiver account.
- Must not require sender sign-in.
- Must not require app install.

### Route Parameter
`trackingCode` must:
- Be read from route path.
- Be normalized the same way as receiver landing.
- Match `^KRA-[A-Z0-9-]+$`.
- Never be logged raw to analytics.

If malformed:
- Do not call challenge endpoint.
- Show invalid link recovery.
- Offer `/track`, `/r/:trackingCode` only if code can be reconstructed safely, and `/support`.

### Entry Preconditions
Preferred entry:
- From `ReceiverTrackingLanding` after `receiverVerificationRequired` is true.

Direct entry:
- If user opens this route directly, render the page after route-code validation.
- Optional: perform a lightweight `get_public_tracking` precheck only if existing frontend architecture already does so for receiver route guards.
- Do not block the page on a tracking precheck if the challenge endpoint can return the authoritative response.

### Exit Routes
- Success sent: `/r/:trackingCode/verify-otp`
- Recently sent: `/r/:trackingCode/verify-otp`
- Already verified: `/r/:trackingCode/timeline`
- Back: `/r/:trackingCode`
- Expired link: `/r/expired`
- Access denied: `/r/access-denied`
- Manual tracking: `/track`
- Support: `/support`

## Backend Contract
### Challenge Request
Operation:
- `request_public_tracking_phone_challenge`

Endpoint:
- `POST /v1/public/track/:trackingCode/request-verification`

Auth scope:
- Public.

Request body:
```ts
type RequestPhoneVerificationChallengeRequest = {
  phone: string;
};
```

Request rule:
- `phone` must be E.164 and match `^\+[1-9]\d{7,14}$`.

Response body:
```ts
type RequestPhoneVerificationChallengeResponse = {
  deliveryId: string;
  trackingCode: string;
  challengeStatus: "sent" | "recently_sent" | "already_verified";
  maskedPhone: string;
  challengeId?: string;
  channel?: "sms";
  resendAvailableAt?: string;
  verificationToken?: string;
  verifiedAt?: string;
  expiresAt: string;
};
```

Renderable fields:
- `maskedPhone` after successful response only.
- `challengeStatus` as state.
- `channel`, only as `SMS`.
- `expiresAt`, formatted as user-friendly OTP expiry.
- `resendAvailableAt`, formatted as resend wait guidance.

Do not render:
- `deliveryId`.
- `challengeId`.
- `verificationToken`.
- Raw `trackingCode` in analytics.
- Raw ISO timestamps.

### Backend Behavior
The backend:
- Looks up delivery by tracking code.
- Requires verification only for receiver-sensitive delivery stages.
- Rejects wrong receiver phone with a generic failure.
- Reuses active grants as `already_verified`.
- Reuses recent active challenges as `recently_sent`.
- Sends SMS only when notification gateway is configured.
- Locks verification after repeated failures.
- Uses challenge TTL of `10 minutes`.
- Uses resend cooldown of `1 minute`.
- Uses active verification grant TTL of `30 minutes`.
- Locks failed attempts after `5` failures inside `15 minutes`.

Frontend rule:
- Do not reimplement these rules as authority.
- Use backend response as source of truth.
- Use local validation only to prevent obviously malformed phone values.

## Phone Input Rules
### Visible Label
Label:
- `Receiver phone number`

Help text:
- `Enter the phone number linked to this delivery. Kra will send a verification code by SMS.`

### Format
Backend requires E.164:
- `+233XXXXXXXXX`
- `+234XXXXXXXXXX`
- Any valid country code matching backend schema.

Frontend may support Ghana-friendly normalization:
- If user enters `024XXXXXXX`, normalize to `+23324XXXXXXX` only when the selected country is Ghana.
- If user enters `23324XXXXXXX`, normalize to `+23324XXXXXXX`.
- If user enters `+23324XXXXXXX`, keep as is.

Rules:
- Show the normalized value only if it helps the user understand what will be submitted.
- Do not silently change a country code the user explicitly entered.
- Do not allow letters.
- Do not submit an empty field.
- Do not submit spaces or punctuation except leading `+` after normalization.

### Keyboard
- Use `type="tel"` or equivalent.
- Use numeric keyboard hints on mobile.
- Keep the leading `+` accessible.
- Do not force a mask that makes correction hard.

### Validation Copy
Empty:
- `Enter the receiver phone number.`

Too short or too long:
- `Enter a valid phone number with country code.`

Invalid characters:
- `Use numbers only, with + at the start if you include a country code.`

Normalization confirmation:
- `We will send the code to {normalizedPhone}.`

Do not show:
- `This phone does not match the delivery.`
- `Receiver phone mismatch.`
- `Wrong phone.`

## State Model
### `idle`
Use before submission.

Required UI:
- Explanation.
- Phone input.
- Primary CTA enabled only when field has a candidate value.
- Privacy note.

Test ID:
- `state-receiver-phone-challenge-idle`

### `loading`
Use while request is in flight.

Required UI:
- Disable submit.
- Keep input value visible.
- Show `Sending verification code...`
- Do not allow duplicate submit.
- Do not navigate until response is handled.

Test ID:
- `state-receiver-phone-challenge-loading`

### `sent`
Use when backend returns `challengeStatus: "sent"`.

Required UI:
- Show success confirmation.
- Show `maskedPhone`.
- Show code expiry if available.
- Route to `/r/:trackingCode/verify-otp`.

Routing:
- Route automatically only after screen-reader announcement has a chance to be perceived, or use immediate route with success state passed to OTP screen.
- Do not leave the receiver stuck on this screen.

Test ID:
- `state-receiver-phone-challenge-sent`

### `recently_sent`
Use when backend returns `challengeStatus: "recently_sent"`.

Required UI:
- Explain that a code was already sent recently.
- Show `maskedPhone`.
- Show resend availability if present.
- Route to OTP screen.

Test ID:
- `state-receiver-phone-challenge-recently-sent`

### `already_verified`
Use when backend returns `challengeStatus: "already_verified"`.

Required UI:
- Show `Phone already verified.`
- Store verification token using approved ephemeral receiver auth state.
- Route to `/r/:trackingCode/timeline`.
- Do not show token.

Test ID:
- `state-receiver-phone-challenge-already-verified`

### `throttled`
Use when backend returns `RATE_LIMITED` or `429`.

Required UI:
- Title: `Try again later`
- Body: `For privacy, verification is temporarily locked. Wait before trying again.`
- Disable submit until safe retry time if provided.
- Offer support link.

Privacy rule:
- Do not reveal exact failure reasons.

Test ID:
- `state-receiver-phone-challenge-throttled`

### `invalid_phone`
Use when frontend validation fails.

Required UI:
- Field-level error.
- Error summary.
- Keep input value.
- Do not call backend.

Test ID:
- `state-receiver-phone-challenge-invalid-phone`

### `verification_failed`
Use when backend returns forbidden, mismatch, or generic phone verification failure.

Required UI:
- Title: `We could not send a code`
- Body: `Check the receiver phone number and try again.`
- Keep input value.
- Offer support.

Privacy rule:
- Do not say the number failed to match.
- Do not say whether the delivery exists.
- Do not say how many attempts remain unless backend returns approved user-safe copy.

Test ID:
- `state-receiver-phone-challenge-verification-failed`

### `not_required`
Use when backend says phone verification is not required for this delivery stage.

Required UI:
- Title: `Phone verification is not needed right now`
- Body: `You can view the public tracking timeline for this package.`
- CTA: `View tracking details`

Test ID:
- `state-receiver-phone-challenge-not-required`

### `not_found`
Use when backend cannot find tracking code.

Required UI:
- Title: `We could not find this tracking link`
- Body: `Check the link or enter the tracking code manually.`
- CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-phone-challenge-not-found`

### `service_unavailable`
Use for `ROUTE_NOT_ENABLED`, provider unavailable, timeout, 5xx, or maintenance.

Required UI:
- Title: `Verification is temporarily unavailable`
- Body: `We could not send a code right now. Try again shortly.`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-phone-challenge-unavailable`

### `offline`
Use when browser is offline or request cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect and try again.`
- CTA: `Try again`

Test ID:
- `state-receiver-phone-challenge-offline`

## Layout Blueprint
### Mobile
Order:
- Header.
- Progress indicator.
- Verification explanation.
- Phone field.
- Primary CTA.
- Privacy note.
- Recovery links.

Rules:
- Keep phone input above fold.
- Use full-width primary CTA.
- Avoid multi-column layout.
- Keep help text short.
- Make support link visible without clutter.

### Desktop
Use centered card layout:
- Main card max width around `560px`.
- Optional side note for privacy on wider viewports.
- Keep form and CTA in one visual unit.

### Header
Header should include:
- Kra wordmark.
- Small label: `Receiver verification`
- Link back to package status.

Header should not include:
- Full marketing nav.
- Pricing nav.
- Admin links.
- Sender sign-in.
- App download pressure.

## Visual Direction
### Mood
Focused, secure, calm, and practical.

### Composition
- One field.
- One primary CTA.
- One short privacy explanation.
- One recovery area.

### Color Rules
- Use `brand.blue.600` for primary action.
- Use `warning.amber.600` for throttled or attention states.
- Use `danger.red.600` for blocking errors.
- Use `success.green.600` for sent or already verified.
- Use neutrals for structure.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and form text.
- Field labels must be visible.
- Error text must be readable and close to the field.

### Motion
- No decorative animation.
- Loading indicator must be subtle.
- Respect `prefers-reduced-motion`.

## Content Structure
### Progress Indicator
Show a small step indicator:
- `1. Package`
- `2. Phone`
- `3. Code`
- `4. Tracking`

Rules:
- Mark current step as `Phone`.
- Do not make the progress indicator the main visual object.
- Ensure it is accessible and not color-only.

### Hero Copy
Title:
- `Verify the receiver phone`

Body:
- `Enter the phone number linked to this delivery. We will send a verification code by SMS before showing receiver details.`

Privacy subcopy:
- `This protects delivery instructions and receiver-only actions if the link is shared.`

### Form
Field label:
- `Receiver phone number`

Field hint:
- `Use the phone number connected to this delivery. Include country code if you have it.`

Primary CTA:
- `Send verification code`

### Sent Confirmation
Title:
- `Code sent`

Body:
- `We sent a verification code to {maskedPhone}. Enter it on the next screen.`

### Recently Sent Confirmation
Title:
- `Code already sent`

Body:
- `A code was sent recently to {maskedPhone}. Enter that code on the next screen.`

### Already Verified Confirmation
Title:
- `Phone already verified`

Body:
- `You can continue to receiver tracking.`

### Throttled Copy
Title:
- `Try again later`

Body:
- `For privacy, verification is temporarily locked. Wait before trying again.`

### Generic Failure Copy
Title:
- `We could not send a code`

Body:
- `Check the receiver phone number and try again.`

## Component Requirements
### `ReceiverPhoneChallengeScreen`
Responsibilities:
- Read tracking code route parameter.
- Validate tracking code format.
- Manage phone field state.
- Normalize phone to E.164.
- Submit challenge request.
- Map backend response to route transitions.
- Render recovery states.
- Emit privacy-safe analytics.

### `ReceiverVerificationProgress`
Props:
- `currentStep`

Behavior:
- Shows the receiver flow stage.
- Uses text labels.
- Does not imply account creation.

### `ReceiverPhoneForm`
Props:
- `initialCountry`
- `value`
- `error`
- `isSubmitting`
- `onSubmit`

Behavior:
- Visible label.
- Helpful hint.
- Field-level error.
- Error summary integration.
- Submit disabled while loading.

### `PhoneNormalizationHint`
Props:
- `rawPhone`
- `normalizedPhone`
- `country`

Behavior:
- Shows the normalized destination before submit if different from input.
- Avoids showing after failure as proof of mismatch.

### `ChallengeResultRouter`
Responsibilities:
- Handles `sent`.
- Handles `recently_sent`.
- Handles `already_verified`.
- Stores only approved ephemeral verification state.
- Routes without leaking token in URL.

### `ReceiverVerificationPrivacyNote`
Behavior:
- Explains why phone is needed.
- Links to privacy page.
- Uses plain language.

### `ReceiverChallengeRecovery`
Behavior:
- Renders back, support, and manual tracking links.
- Strips phone and token data from all URLs.

## Data Handling
### Local State
May store temporarily:
- Raw phone input.
- Normalized phone candidate.
- Form validation state.
- Submission loading state.
- Sanitized response state.

Must not persist long-term:
- Raw phone number.
- Verification token.
- Challenge ID.
- OTP.

### Ephemeral Verification State
For `already_verified`:
- Store `verificationToken` only in approved receiver verification state.
- Prefer memory or session-scoped storage based on app architecture.
- Never store in URL.
- Never store in analytics.
- Never display in DOM.
- Expire according to `expiresAt`.

### Passing Data To OTP Screen
For `sent` and `recently_sent`, pass only:
- `trackingCode`.
- `maskedPhone`.
- `expiresAt`.
- `resendAvailableAt` when provided.
- `challengeStatus`.

Do not pass:
- raw phone in URL.
- `challengeId` in URL.
- full response object in analytics.

## Security Requirements
### Enumeration Resistance
Failure copy must not reveal:
- whether tracking code exists.
- whether receiver phone matched.
- whether a phone belongs to another delivery.
- how many attempts remain unless approved by backend as safe.
- whether SMS gateway is configured internally.

Use generic failure states:
- `We could not send a code`
- `Check the receiver phone number and try again`
- `Try again later`

### Rate Limit Handling
When throttled:
- Disable submit if lock timing is available.
- Show wait guidance.
- Do not reveal exact failed-attempt count.
- Do not encourage repeated retries.
- Offer support for urgent delivery concerns.

### SMS Delivery Safety
Do not:
- Show OTP on this page.
- Ask user to share OTP with staff.
- Auto-read SMS unless platform and privacy policy explicitly support it later.
- Send multiple challenge requests on repeated taps.

### Support Link Safety
Support route must not include:
- raw phone.
- OTP.
- verification token.
- challenge ID.
- full tracking code unless product later adds a safe support reference mechanism.

## Analytics Requirements
Required events:
- `receiver_phone_challenge_viewed`
- `receiver_phone_challenge_requested`
- `receiver_phone_challenge_succeeded`
- `receiver_phone_challenge_failed`
- `receiver_phone_challenge_throttled`
- `receiver_phone_challenge_back_clicked`
- `receiver_phone_challenge_support_clicked`

Allowed event properties:
- `sourceBucket`
- `trackingCodePrefix` or approved non-raw tracking reference
- `phoneCountryBucket`
- `resultState`
- `challengeStatus`
- `errorBucket`
- `normalized`

Do not record:
- raw phone.
- masked phone.
- full tracking code.
- delivery ID.
- challenge ID.
- verification token.
- OTP.
- full URL.

Inventory alignment:
- The frontend inventory names `receiver_phone_challenge_requested` with `trackingCode` and `challengeStatus`.
- For privacy, implementation should satisfy the tracking reference through an approved non-raw value such as `trackingCodePrefix` or a one-way tracking reference if the analytics layer supports it.
- Do not send the full tracking code unless security and analytics policy explicitly update to permit it.

Allowed `resultState` values:
- `idle`
- `loading`
- `sent`
- `recently_sent`
- `already_verified`
- `throttled`
- `invalid_phone`
- `verification_failed`
- `not_required`
- `not_found`
- `service_unavailable`
- `offline`

## Accessibility Requirements
### Semantics
- Use one `h1`.
- Use `main`.
- Use visible label for phone field.
- Associate hint and error text with the field.
- Use error summary when field validation fails.
- Use `aria-busy` during submission.
- Use polite status announcements for sent and routing states.

### Focus
- On field validation failure, move focus to error summary.
- Error summary links to the phone field.
- On submit loading, keep focus stable.
- On generic backend failure, move focus to failure heading only after submit.
- Do not auto-focus phone field if it causes mobile keyboard to cover essential explanation.

### Input
- `autocomplete="tel"` where appropriate.
- `inputmode="tel"` or platform equivalent.
- Field accepts paste.
- Field remains editable after validation failure.

### Motion And Visuals
- Loading state must not rely on spinner alone.
- Reduced motion disables decorative transitions.
- Error state must not rely on red only.

## SEO And Metadata
This route is receiver-link scoped and must not be indexed.

Set:
- `robots: noindex, nofollow`
- `title`: `Verify Receiver Phone | Kra`
- `description`: `Verify the receiver phone for a Kra delivery link before continuing to receiver tracking.`

Open graph:
- Use generic Kra metadata.
- Do not include tracking code.
- Do not include phone.
- Do not include delivery status.

## Error Recovery Matrix
| State | User Message | Primary Action | Secondary Action | Endpoint Called |
| --- | --- | --- | --- | --- |
| `invalid_phone` | Phone format needs correction | `Send verification code` after correction | `Back to package status` | none |
| `sent` | Code sent | route to OTP | none | challenge endpoint |
| `recently_sent` | Code already sent recently | route to OTP | none | challenge endpoint |
| `already_verified` | Phone already verified | route to timeline | none | challenge endpoint |
| `throttled` | Try again later | wait/retry | support | challenge endpoint |
| `verification_failed` | Could not send code | retry | support | challenge endpoint |
| `not_required` | Verification not needed | timeline | package status | challenge endpoint |
| `not_found` | Link not found | manual tracking | support | challenge endpoint |
| `service_unavailable` | Verification unavailable | retry | support | challenge endpoint |
| `offline` | Connection offline | retry | package status | none or failed request |

## Testing Requirements
### Unit Tests
Test:
- Valid E.164 phone submits challenge endpoint.
- Local Ghana number normalizes to E.164 when Ghana is selected.
- Invalid phone shows field error and does not call endpoint.
- Submit disables while loading.
- `sent` response routes to OTP.
- `recently_sent` response routes to OTP.
- `already_verified` response stores token ephemerally and routes to timeline.
- Token is not rendered.
- Challenge ID is not rendered.
- Raw phone is not recorded in analytics.
- Forbidden response uses generic failure copy.
- Rate limit response renders throttled state.
- Route-not-enabled response renders unavailable state.

### Integration Tests
Test:
- `/r/:trackingCode/verify-phone` renders `screen-receiver-phone-challenge`.
- Back link routes to `/r/:trackingCode`.
- Support link omits phone and token.
- Valid submit calls `POST /v1/public/track/:trackingCode/request-verification`.
- OTP screen receives only safe routing state.
- Already-verified route uses timeline without token in URL.

### Accessibility Tests
Test:
- One `h1`.
- Phone field has visible label.
- Phone field has accessible hint.
- Field error is announced.
- Error summary links to field.
- Loading state uses `aria-busy`.
- Sent status is announced.
- Submit is keyboard reachable.
- Page works at `200%` zoom.
- Reduced motion removes nonessential transitions.

### End-To-End Tests
Test name: `receiver_phone_challenge_sent`
- Visit `/r/KRA-0001/verify-phone`.
- Enter valid receiver phone.
- Submit.
- Stub `challengeStatus: "sent"`.
- Assert route becomes `/r/KRA-0001/verify-otp`.
- Assert raw phone is not visible after route.

Test name: `receiver_phone_challenge_recently_sent`
- Visit `/r/KRA-0001/verify-phone`.
- Enter valid receiver phone.
- Submit.
- Stub `challengeStatus: "recently_sent"`.
- Assert route becomes `/r/KRA-0001/verify-otp`.
- Assert resend timing is available to OTP screen.

Test name: `receiver_phone_challenge_already_verified`
- Visit `/r/KRA-0001/verify-phone`.
- Enter valid receiver phone.
- Submit.
- Stub `challengeStatus: "already_verified"` with token.
- Assert route becomes `/r/KRA-0001/timeline`.
- Assert token is not in URL.

Test name: `receiver_phone_challenge_invalid_phone`
- Visit `/r/KRA-0001/verify-phone`.
- Enter invalid phone.
- Submit.
- Assert endpoint is not called.
- Assert field error is visible.

Test name: `receiver_phone_challenge_forbidden_generic`
- Visit `/r/KRA-0001/verify-phone`.
- Enter valid phone.
- Submit.
- Stub forbidden response.
- Assert generic failure copy.
- Assert no phone mismatch copy appears.

Test name: `receiver_phone_challenge_throttled`
- Visit `/r/KRA-0001/verify-phone`.
- Enter valid phone.
- Submit.
- Stub rate limit response.
- Assert throttled copy.
- Assert support link is available.

## Implementation Notes For Claude Code
### Build Scope
Build only the phone challenge request screen and supporting receiver-public verification components. Do not build the OTP entry screen, full tracking timeline, arrival instructions, failed-attempt page, refusal page, or support case flow in this task.

### Files To Consider
Likely implementation areas:
- `apps/web` route for `/r/:trackingCode/verify-phone`.
- Receiver public verification components.
- Public tracking verification API client.
- Phone normalization helper.
- Receiver verification ephemeral state.
- Public analytics wrapper.
- Receiver public tests.

### Contract Discipline
Use existing shared contracts:
- `trackingCodeSchema`
- `requestPhoneVerificationChallengeRequestSchema`
- `requestPhoneVerificationChallengeResponseSchema`

Do not:
- Add request fields.
- Send unnormalized phone.
- Call OTP verify endpoint.
- Call delivery mutation endpoints.
- Store token in URL.
- Display challenge ID.

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

## Acceptance Criteria
The screen is complete when:
- `/r/:trackingCode/verify-phone` renders `screen-receiver-phone-challenge`.
- Phone field is visible, labelled, and validated.
- Valid phone submits to `request_public_tracking_phone_challenge`.
- Invalid phone does not call backend.
- Sent and recently-sent states route to OTP.
- Already-verified state routes to timeline without token in URL.
- Throttled and error states use privacy-safe copy.
- Raw phone, token, challenge ID, delivery ID, and tracking code are excluded from analytics.
- Accessibility tests pass.
- E2E tests cover sent, recently sent, already verified, invalid phone, forbidden generic, and throttled states.

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
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/routes.ts`

## Anti-Patterns To Reject
Reject any implementation that:
- Requests OTP on this screen.
- Shows whether phone matched.
- Shows raw phone after failure.
- Shows verification token.
- Puts token or phone in URL.
- Logs phone to analytics.
- Calls support mutation automatically.
- Calls OTP verify endpoint.
- Shows internal SMS gateway errors.
- Hides field label inside hint text.
- Allows repeated submissions while loading.
- Uses countdown pressure as the main visual object.
- Treats receiver verification as account sign-up.

## Final Quality Review
Before closing implementation, review the built screen from five viewpoints:
- Receiver: understands which phone to enter and why.
- Sender: sees that receiver details remain protected.
- Support agent: can explain generic failure states.
- Security reviewer: sees no enumeration or token exposure.
- Accessibility reviewer: can complete and recover from errors without visual cues.

Pass condition:
- The page feels like a secure SMS verification request, not a login wall.
- It is fast and obvious on mobile.
- It protects delivery privacy.
- It routes cleanly into OTP verification or receiver tracking.
