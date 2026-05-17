# Receiver OTP Verify Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverOtpVerify` |
| App | `apps/web` |
| Route | `/r/:trackingCode/verify-otp` |
| Primary test ID | `screen-receiver-otp-verify` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `verify_public_tracking_phone` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/timeline`, `/r/expired`, `/r/access-denied`, `/support`, `/privacy` |
| Required states | `loading`, `invalid OTP`, `expired OTP`, `verified` |

## Product Job
This screen must let a receiver enter the SMS verification code sent by the phone challenge step, verify that code with the backend, receive an active delivery-scoped verification token, and continue to receiver tracking without exposing the token, OTP, receiver phone, or internal delivery data.

The page must help receivers:
- Understand that a code was sent by SMS.
- Enter or paste the code quickly on mobile.
- Use platform OTP autofill where available.
- Submit only valid code length and characters.
- Recover from invalid, expired, consumed, missing, throttled, unavailable, and offline states.
- Request a new code through the phone challenge flow when appropriate.
- Continue to the receiver timeline after verification succeeds.

This screen is not the phone-number entry screen, full tracking timeline, final delivery completion screen, support case, or account sign-in page.

## Audience
Primary audience:
- Receivers who just requested an SMS verification code.

Secondary audience:
- Receivers returning to an active challenge.
- Support staff guiding a receiver through code verification.
- Senders checking what receiver verification requires.

## User State
Receivers may switch between SMS and browser, mistype the code, paste extra spaces, receive the message late, or request a code more than once. The page must be forgiving with input handling and strict about security outcomes.

## Primary Action
Primary CTA:
- `Verify code`

Secondary CTA:
- `Send a new code`

Tertiary CTA:
- `Contact support`

CTA behavior:
- `Verify code` submits `phone` and `otp` to `POST /v1/public/track/:trackingCode/verify-phone`.
- `Send a new code` returns to `/r/:trackingCode/verify-phone` or triggers the approved resend path if implemented there.
- `Contact support` routes to `/support` without phone, OTP, token, challenge ID, or raw tracking query values.

After successful verification:
- Store `verificationToken` in approved ephemeral receiver state.
- Route to `/r/:trackingCode/timeline`.
- Do not put token in URL.

## Main Tension
OTP entry must feel fast without weakening privacy. The UI should support autofill, paste, and clear recovery, but it must not reveal whether the phone matched, whether a previous code existed, or why a specific code failed beyond safe user action.

## Visual Thesis
Design this screen as a precise code checkpoint: a focused code input, a clear SMS destination hint, calm error handling, and a confident verified handoff into receiver tracking.

## Restraint Rule
Do not turn this into a full authentication app. Avoid passwords, account creation, delivery details, route maps, proof previews, security lectures, animated lock theatrics, staff contacts, or support chat takeover.

Every visual element must help one of these:
- Enter the SMS code.
- Verify the receiver phone.
- Recover from code problems.
- Request a new code safely.
- Continue to receiver tracking.
- Protect token and delivery privacy.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of OTP, fintech verification, delivery receiver, and public-service identity experiences.

Non-negotiable quality requirements:
- The first viewport must show the code input and explain where the code was sent.
- The input must support paste.
- The input must use `autocomplete="one-time-code"` where web platform supports it.
- The input must use numeric input mode without relying on `type="number"`.
- The screen must call only `verify_public_tracking_phone` for verification.
- The screen must not request phone here unless it was not safely carried from the phone challenge step.
- The screen must never display the verification token.
- The screen must never put OTP, phone, token, or challenge ID in the URL.
- Invalid, expired, throttled, unavailable, and offline states must be distinct.
- Verified state must route to receiver timeline.
- The page must work on small mobile screens and weak networks.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and paste-only use.

Closure rule:
- If a receiver cannot paste or autofill the code, the screen remains open.
- If verification token can leak to DOM, URL, logs, or analytics, the screen remains open.
- If wrong-code copy reveals whether phone matched, the screen remains open.
- If resend can bypass backend cooldown, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- web.dev SMS OTP guidance: OTP fields should support `autocomplete="one-time-code"`, numeric input mode, paste, and origin-bound SMS where available.
- Twilio Verify guidance: code-entry flows should show masked destination, expiry, resend path, and clear recovery.
- NIST digital identity guidance: OTP verification needs replay resistance and server-side validation of one-time use.
- OWASP MFA guidance: OTP flows need throttling, invalidation after success, recovery controls, and careful error language.
- W3C WCAG 2.2 quick reference: code inputs, errors, focus, status messages, and timing must remain accessible.

Reference links:
- https://web.dev/articles/sms-otp-form
- https://www.twilio.com/docs/verify/developer-best-practices
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external OTP wording, input layout, security copy, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Where do I enter the SMS code?
- Which phone received the code?
- How long is the code valid?
- What happens when I verify?
- How do I request a new code?
- What should I do if the code expired?
- What should I do if I entered the wrong code?
- What should I do if I never received SMS?
- How is Kra protecting receiver details?

## Route And Navigation Rules
### Route
- Render at `/r/:trackingCode/verify-otp`.
- Must be public and unauthenticated.
- Must not require receiver account creation.
- Must not require app install.
- Must not require sender sign-in.

### Route Parameter
`trackingCode` must:
- Be read from route path.
- Match `^KRA-[A-Z0-9-]+$`.
- Never be recorded raw in analytics.

If malformed:
- Do not call verification endpoint.
- Show invalid link recovery.
- Offer `/track` and `/support`.

### Required Verification Context
The screen needs:
- `phone`, normalized to E.164.
- Optional `maskedPhone`.
- Optional `expiresAt`.
- Optional `resendAvailableAt`.
- Optional `challengeStatus`.

Preferred source:
- Safe receiver verification state passed from `ReceiverPhoneChallenge`.

If phone context is missing:
- Do not ask for OTP alone.
- Route or prompt the user back to `/r/:trackingCode/verify-phone`.
- Explain `Enter the receiver phone first so we can verify the code.`

Rules:
- Raw phone must not be placed in URL.
- If phone is stored in session state, keep it session-scoped and clear after verification expiry.
- If page refresh loses phone context, return to phone challenge.

### Exit Routes
- Verified: `/r/:trackingCode/timeline`
- New code: `/r/:trackingCode/verify-phone`
- Back: `/r/:trackingCode/verify-phone`
- Support: `/support`
- Expired link: `/r/expired`
- Access denied: `/r/access-denied`

## Backend Contract
### Verify Request
Operation:
- `verify_public_tracking_phone`

Endpoint:
- `POST /v1/public/track/:trackingCode/verify-phone`

Auth scope:
- Public.

Request body:
```ts
type VerifyPhoneRequest = {
  phone: string;
  otp: string;
};
```

Request rule:
- `phone` must be E.164.
- `otp` must be trimmed and `4` to `8` characters.

Response body:
```ts
type VerifyPhoneResponse = {
  deliveryId: string;
  trackingCode: string;
  verificationToken: string;
  verifiedAt: string;
  expiresAt: string;
};
```

Renderable fields:
- `verifiedAt`, only as success context if needed.
- `expiresAt`, only as session expiry guidance if needed.

Do not render:
- `deliveryId`.
- `verificationToken`.
- Raw `trackingCode` in analytics.
- Raw phone.
- Raw OTP.

### Backend Behavior
The backend:
- Looks up delivery by tracking code.
- Requires verification only for receiver-sensitive stages.
- Rejects wrong phone generically.
- Reuses active grant if one exists.
- Requires a latest unconsumed, unexpired challenge.
- Consumes the challenge after successful verification.
- Creates a verification grant with `30 minute` TTL.
- Locks after `5` failed attempts inside `15 minutes`.
- Treats expired, consumed, missing, or mismatched challenge as verification failure.

Frontend rule:
- Use backend as authority.
- Do not calculate attempt count in UI.
- Do not assume code expiry without backend or challenge state.
- Do not reuse OTP after success.

## OTP Input Rules
### Input Strategy
Preferred implementation:
- One visible text input with segmented visual styling, or a segmented component backed by one real input.

Rules:
- Use `type="text"`.
- Use `inputmode="numeric"`.
- Use `autocomplete="one-time-code"`.
- Use `pattern="[0-9]*"` if compatible with validation strategy.
- Allow paste.
- Strip spaces and hyphens.
- Accept digits only unless backend later supports alphanumeric OTP.
- Do not use `type="number"`.
- Do not hide the actual field from assistive tech.

### Code Length
Backend allows `4` to `8` characters.

Frontend behavior:
- Accept `4` to `8` digits.
- Do not hard-code a six-digit-only UI unless backend changes.
- If using segmented boxes, support variable length or use one field.
- Submit only after the user taps `Verify code`, unless product later approves auto-submit.

### Validation Copy
Empty:
- `Enter the verification code.`

Too short:
- `Enter the full code from the SMS.`

Invalid characters:
- `Use numbers only.`

Expired context:
- `This code may have expired. Send a new code and try again.`

Do not show:
- `OTP mismatch`
- `Challenge missing`
- `Phone mismatch`
- `Consumed challenge`

## State Model
### `idle`
Use before submission.

Required UI:
- Code input.
- Masked phone if available.
- Expiry guidance if available.
- Primary CTA.
- New code link.

Test ID:
- `state-receiver-otp-verify-idle`

### `loading`
Use while verify request is in flight.

Required UI:
- Disable submit.
- Keep code visible or obscured based on component design.
- Show `Verifying code...`
- Do not allow duplicate submit.

Test ID:
- `state-receiver-otp-verify-loading`

### `verified`
Use when backend returns verification token.

Required UI:
- Show `Phone verified`.
- Store token in approved ephemeral receiver state.
- Route to timeline.
- Do not display token.

Test ID:
- `state-receiver-otp-verify-verified`

### `invalid_otp`
Use when backend returns forbidden verification failure, OTP mismatch, missing challenge, consumed challenge, or generic failure.

Required UI:
- Title: `That code did not work`
- Body: `Check the SMS and enter the code again.`
- Keep code field editable.
- Offer new code link.

Privacy rule:
- Do not reveal exact failure reason.

Test ID:
- `state-receiver-otp-verify-invalid`

### `expired_otp`
Use when backend response or local challenge context indicates expiry.

Required UI:
- Title: `This code has expired`
- Body: `Send a new code to continue.`
- CTA: `Send a new code`

Test ID:
- `state-receiver-otp-verify-expired`

### `throttled`
Use when backend returns `RATE_LIMITED` or 429.

Required UI:
- Title: `Try again later`
- Body: `For privacy, verification is temporarily locked. Wait before trying again.`
- Disable submit if lock timing exists.
- Offer support.

Test ID:
- `state-receiver-otp-verify-throttled`

### `missing_context`
Use when phone context is unavailable.

Required UI:
- Title: `Start phone verification again`
- Body: `Enter the receiver phone first so we can verify the code.`
- CTA: `Enter receiver phone`

Test ID:
- `state-receiver-otp-verify-missing-context`

### `not_required`
Use when backend says phone verification is not required for this delivery stage.

Required UI:
- Title: `Phone verification is not needed right now`
- CTA: `View tracking details`

Test ID:
- `state-receiver-otp-verify-not-required`

### `service_unavailable`
Use for 5xx, provider timeout, route disabled, or maintenance.

Required UI:
- Title: `Verification is temporarily unavailable`
- Body: `We could not verify the code right now. Try again shortly.`
- CTA: `Try again`

Test ID:
- `state-receiver-otp-verify-unavailable`

### `offline`
Use when browser is offline or request cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect and try again.`
- CTA: `Try again`

Test ID:
- `state-receiver-otp-verify-offline`

## Layout Blueprint
### Mobile
Order:
- Header.
- Progress indicator.
- Title and masked phone.
- OTP input.
- Primary CTA.
- Code expiry and resend guidance.
- Support and privacy links.

Rules:
- Keep code input above fold.
- Use full-width primary CTA.
- Keep resend available but not more prominent than verify.
- Make paste and autofill work reliably.

### Desktop
Use centered card layout:
- Main card max width around `560px`.
- Optional side note for privacy.
- Avoid broad marketing sections.

### Header
Header should include:
- Kra wordmark.
- Label: `Receiver verification`
- Back link to phone step.

Header should not include:
- Full marketing nav.
- Pricing CTA.
- Admin links.
- Sender sign-in pressure.

## Visual Direction
### Mood
Focused, secure, fast, and low-anxiety.

### Composition
- One code-entry area.
- One primary action.
- One resend path.
- One privacy/recovery area.

### Color Rules
- Use `brand.blue.600` for primary verification action.
- Use `success.green.600` for verified state.
- Use `warning.amber.600` for expired and throttled states.
- Use `danger.red.600` for invalid or blocking errors.
- Use neutral colors for structure.

Color must never be the only status signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for labels, code entry, and body.
- Code digits should be readable and large enough for mobile entry.

### Motion
- No decorative code animations.
- No shaking fields on invalid code.
- Loading state must be calm.
- Respect `prefers-reduced-motion`.

## Content Structure
### Progress Indicator
Steps:
- `1. Package`
- `2. Phone`
- `3. Code`
- `4. Tracking`

Current:
- `Code`

Rules:
- Text labels required.
- Color is not the only signal.

### Hero Copy
Title:
- `Enter the verification code`

Body:
- `We sent a code by SMS. Enter it here to continue to receiver tracking.`

Masked phone line:
- `Code sent to {maskedPhone}`

If masked phone unavailable:
- `Code sent to the receiver phone you entered.`

### Expiry Copy
If `expiresAt` is available:
- `This code expires {relativeTime}.`

If unavailable:
- `Codes expire quickly for privacy.`

### Resend Copy
If `resendAvailableAt` is in future:
- `You can request a new code {relativeTime}.`

If resend available:
- `Need another code? Send a new code.`

Do not say:
- `Unlimited resend`
- `Try every code`
- `Only one attempt left`

## Component Requirements
### `ReceiverOtpVerifyScreen`
Responsibilities:
- Read route tracking code.
- Load receiver verification context.
- Render OTP form.
- Validate code.
- Submit verification.
- Store verification token ephemerally after success.
- Route to timeline.
- Emit privacy-safe analytics.

### `ReceiverVerificationProgress`
Props:
- `currentStep`

Behavior:
- Shows current step as `Code`.
- Reuses phone challenge progress component.

### `OtpCodeInput`
Props:
- `value`
- `lengthMin`
- `lengthMax`
- `error`
- `disabled`
- `onChange`
- `onPaste`

Behavior:
- Uses one accessible input or segmented UI backed by one accessible input.
- Supports paste.
- Uses `autocomplete="one-time-code"`.
- Uses `inputmode="numeric"`.
- Sanitizes spaces and hyphens.
- Does not auto-submit by default.

### `OtpStatusMessage`
Props:
- `state`
- `maskedPhone`
- `expiresAt`
- `resendAvailableAt`

Behavior:
- Shows sent, expired, or retry guidance.
- Uses polite live region for state changes.

### `OtpVerificationResultRouter`
Responsibilities:
- Handles successful token.
- Stores token in ephemeral receiver state.
- Routes to `/r/:trackingCode/timeline`.
- Clears OTP from local state after success.

### `OtpRecoveryActions`
Behavior:
- Provides new code route.
- Provides support route.
- Provides back to phone route.
- Strips sensitive values.

## Data Handling
### Local State
May store temporarily:
- OTP input value.
- Normalized phone from prior step.
- Masked phone.
- Expiry and resend timestamps.
- Submission state.

Must clear:
- OTP after successful verification.
- OTP when user requests a new code.
- Expired challenge context when user returns to phone challenge.

### Token Storage
After success:
- Store `verificationToken` in approved ephemeral receiver verification state.
- Store expiry with token.
- Clear token at `expiresAt`.
- Do not persist beyond receiver session unless security policy approves.
- Do not place token in route, query string, hash, analytics, logs, or visible DOM.

### Missing Context
If phone is missing:
- Do not submit.
- Do not ask only for OTP.
- Route back to phone challenge.

## Security Requirements
### Replay Resistance
Frontend must assume:
- Backend consumes challenge after success.
- Backend rejects consumed or expired challenges.
- Backend creates short-lived verification grant.

Frontend must:
- Clear OTP after success.
- Not retry successful OTP.
- Not cache OTP.
- Not prefill OTP after route reload.

### Enumeration Resistance
Failure copy must not reveal:
- phone mismatch.
- challenge missing.
- challenge consumed.
- challenge expired unless presented as safe user action.
- delivery existence.
- attempt count.

### Rate Limit Handling
When throttled:
- Disable submit if safe timing is known.
- Offer support.
- Do not reveal exact failed-attempt count.
- Do not encourage repeated guessing.

### WebOTP Enhancement
WebOTP may be used only as progressive enhancement:
- Request browser permission only when user is on OTP screen.
- Keep manual entry fully available.
- Time out gracefully.
- Do not block UI.
- Do not auto-submit without clear product decision.
- Respect privacy and browser support.

## Analytics Requirements
Required events:
- `receiver_otp_verify_viewed`
- `receiver_otp_verify_submitted`
- `receiver_phone_verified`
- `receiver_otp_verify_failed`
- `receiver_otp_verify_expired`
- `receiver_otp_verify_throttled`
- `receiver_otp_new_code_clicked`
- `receiver_otp_support_clicked`

Allowed event properties:
- `sourceBucket`
- `resultState`
- `errorBucket`
- `codeLengthBucket`
- `usedPaste`
- `usedAutofill`
- `verifiedAtBucket`
- `trackingCodePrefix` or approved non-raw tracking reference

Do not record:
- raw OTP.
- phone.
- masked phone.
- verification token.
- challenge ID.
- delivery ID.
- full tracking code.
- full URL.

Inventory alignment:
- The frontend inventory names `receiver_phone_verified` with `trackingCode` and `verifiedAt`.
- For privacy, use an approved non-raw tracking reference and a coarse `verifiedAtBucket` unless analytics policy explicitly approves more specific values.

Allowed `resultState` values:
- `idle`
- `loading`
- `verified`
- `invalid_otp`
- `expired_otp`
- `throttled`
- `missing_context`
- `not_required`
- `service_unavailable`
- `offline`

## Accessibility Requirements
### Semantics
- Use one `h1`.
- Use `main`.
- OTP input has visible label.
- Hint and error text are associated with input.
- Use error summary for validation failures.
- Loading uses `aria-busy`.
- Verification success uses polite status announcement.

### Focus
- On validation error, move focus to error summary.
- Error summary links to OTP input.
- On backend invalid code, keep focus near input.
- On expired code, focus recovery heading after user submit.
- On success, route to timeline after state is stored.

### Input Accessibility
- One real input is preferred.
- Segmented visuals must not create six separate inaccessible fields unless implementation handles labels, paste, arrow navigation, delete, and screen-reader output correctly.
- Paste must work.
- Keyboard entry must work.
- Mobile autofill must work when available.

### Timing Accessibility
- Code expiry must not be the only path.
- Receiver can request a new code.
- Do not create an inaccessible countdown.
- Do not move focus every second.

## SEO And Metadata
This route is receiver-link scoped and must not be indexed.

Set:
- `robots: noindex, nofollow`
- `title`: `Enter Verification Code | Kra`
- `description`: `Enter the SMS verification code for a Kra receiver tracking link.`

Open graph:
- Generic Kra tracking metadata only.
- Do not include OTP, phone, tracking code, or delivery status.

## Error Recovery Matrix
| State | User Message | Primary Action | Secondary Action | Endpoint Called |
| --- | --- | --- | --- | --- |
| `invalid_otp` | Code did not work | retry verify | send new code | verify endpoint |
| `expired_otp` | Code expired | send new code | support | verify endpoint or local expiry |
| `throttled` | Try again later | wait/retry | support | verify endpoint |
| `missing_context` | Start phone verification again | enter receiver phone | package status | none |
| `not_required` | Verification not needed | timeline | package status | verify endpoint |
| `service_unavailable` | Verification unavailable | retry | support | verify endpoint |
| `offline` | Connection offline | retry | phone step | none or failed request |
| `verified` | Phone verified | timeline | none | verify endpoint |

## Testing Requirements
### Unit Tests
Test:
- Missing phone context routes to phone challenge.
- Valid code submits verify endpoint.
- Empty code shows validation error and does not call backend.
- Too-short code shows validation error.
- Paste strips spaces and hyphens.
- `autocomplete="one-time-code"` is present.
- `inputmode="numeric"` is present.
- Success stores token ephemerally.
- Token is not rendered.
- OTP is cleared after success.
- Invalid backend response shows generic invalid code copy.
- Expired response shows expired state.
- Rate limit response shows throttled state.
- Offline state does not blame Kra.

### Integration Tests
Test:
- `/r/:trackingCode/verify-otp` renders `screen-receiver-otp-verify`.
- Submit calls `POST /v1/public/track/:trackingCode/verify-phone`.
- Verified response routes to `/r/:trackingCode/timeline`.
- Token is not in URL.
- New code action routes to `/r/:trackingCode/verify-phone`.
- Analytics omit OTP, phone, token, challenge ID, and full tracking code.

### Accessibility Tests
Test:
- One `h1`.
- OTP input has visible label.
- Error summary links to input.
- Pasting code works.
- Keyboard entry works.
- Loading state is announced.
- Verified state is announced or routes cleanly.
- Page works at `200%` zoom.
- Reduced motion removes nonessential transitions.

### End-To-End Tests
Test name: `receiver_otp_verify_success`
- Visit `/r/KRA-0001/verify-otp` with valid phone context.
- Enter valid OTP.
- Stub verify success with token.
- Assert route becomes `/r/KRA-0001/timeline`.
- Assert token is not in URL.
- Assert OTP is not visible after route.

Test name: `receiver_otp_verify_invalid`
- Visit `/r/KRA-0001/verify-otp` with valid phone context.
- Enter wrong OTP.
- Stub forbidden response.
- Assert generic invalid code copy.
- Assert exact failure reason is not visible.

Test name: `receiver_otp_verify_expired`
- Visit `/r/KRA-0001/verify-otp` with expired challenge context.
- Assert expired state.
- Assert `Send a new code` routes to `/r/KRA-0001/verify-phone`.

Test name: `receiver_otp_verify_missing_context`
- Visit `/r/KRA-0001/verify-otp` without phone context.
- Assert missing context copy.
- Assert primary action routes to phone challenge.

Test name: `receiver_otp_verify_paste`
- Visit `/r/KRA-0001/verify-otp` with valid phone context.
- Paste code with spaces.
- Assert sanitized code submits.

## Implementation Notes For Claude Code
### Build Scope
Build only the OTP verification screen and supporting receiver verification components. Do not build full receiver timeline, arrival instructions, failed-attempt page, refusal page, support case flow, or final delivery completion in this task.

### Files To Consider
Likely implementation areas:
- `apps/web` route for `/r/:trackingCode/verify-otp`.
- Receiver verification components.
- OTP input component.
- Public tracking verification API client.
- Receiver verification ephemeral state.
- Public analytics wrapper.
- Receiver public tests.

### Contract Discipline
Use existing shared contracts:
- `trackingCodeSchema`
- `verifyPhoneRequestSchema`
- `verifyPhoneResponseSchema`

Do not:
- Add request fields.
- Submit without phone context.
- Store OTP beyond verification attempt.
- Display token.
- Put token in URL.
- Call phone challenge endpoint except through the explicit new-code path.

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
- `/r/:trackingCode/verify-otp` renders `screen-receiver-otp-verify`.
- OTP input is visible, labelled, paste-safe, and autofill-ready.
- Valid code submits to `verify_public_tracking_phone`.
- Invalid local code does not call backend.
- Success stores token ephemerally and routes to timeline.
- Token, OTP, phone, challenge ID, delivery ID, and full tracking code are excluded from URL, DOM, and analytics.
- Invalid, expired, throttled, unavailable, offline, missing-context, and verified states render correct recovery.
- Accessibility tests pass.
- E2E tests cover success, invalid code, expired code, missing context, and paste behavior.

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
- Uses `type="number"` for OTP.
- Breaks paste.
- Requires six digits only when backend allows four to eight.
- Auto-submits without product approval.
- Displays token.
- Stores OTP after success.
- Puts phone, OTP, token, or challenge ID in URL.
- Shows exact backend failure reason.
- Reveals attempt count.
- Uses inaccessible segmented fields.
- Sends analytics with sensitive values.
- Treats receiver verification as full account login.

## Final Quality Review
Before closing implementation, review the built screen from five viewpoints:
- Receiver: can enter or paste code quickly.
- Sender: sees receiver details remain protected.
- Support agent: can explain expired and invalid states.
- Security reviewer: sees no OTP or token leakage.
- Accessibility reviewer: can complete the flow without visual-only cues.

Pass condition:
- The page feels like a polished, fast SMS code verification step.
- It supports real mobile behavior.
- It protects receiver privacy and token handling.
- It hands off cleanly to receiver tracking after verification.
