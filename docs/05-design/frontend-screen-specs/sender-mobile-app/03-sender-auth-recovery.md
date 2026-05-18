# Sender Auth Recovery Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderAuthRecovery` |
| App | `apps/mobile` |
| Route | `/(auth)/sender/recovery` |
| Primary test ID | `screen-sender-auth-recovery` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `auth` |
| Related routes | `/(auth)/sender/sign-in`, `/(sender)/onboarding`, `/(sender)/home`, `/support`, `/privacy`, `/terms` |
| Required states | `loading`, `sent`, `error` |

## Product Job
This screen helps a sender recover access when normal phone sign-in is blocked, interrupted, rate-limited, or unclear. It must provide a safe phone OTP recovery path and a support route for cases where the sender no longer controls the phone, without letting the client change phone ownership, bypass lockout, or reveal whether a phone belongs to a sender account.

The sender should be able to:
- Enter the phone they use for Kra deliveries.
- Request a recovery code through the approved auth provider.
- Understand that code delivery may take time.
- Return to sign-in after a recovery code is sent.
- Get help if they no longer control the phone.
- Avoid repeated attempts that worsen lockout or rate limits.

This screen is not a phone-number change tool, staff reset tool, admin override, support chat, identity-document collection flow, password reset, sender profile editor, delivery lookup, or security appeal console.

## Audience
Primary audience:
- Senders who cannot complete normal phone sign-in.
- Senders who were routed here from locked or rate-limited sign-in.
- Senders who reinstalled the app and need to re-establish phone access.
- Senders who changed devices but still control their sender phone.

Secondary audience:
- Senders who no longer have access to their phone and need support.
- Support staff explaining recovery constraints.
- QA engineers verifying account recovery privacy.
- Claude Code implementing auth recovery.

## User State
The sender may be anxious because they need to send or track a package. They may think Kra is blocking them, may have typed too many codes, may have a weak network, or may have changed phones. The screen must be calm, clear, and security-aware.

The screen must:
- Explain recovery without blaming the sender.
- Keep account existence private.
- Avoid asking for sensitive documents.
- Avoid promising instant unlock.
- Provide a support path for lost-phone cases.
- Preserve the route back to normal sign-in.

## Primary Action
Primary CTA:
- `Send recovery code`

Secondary CTA after sent:
- `Return to sign-in`

Tertiary action:
- `I no longer have this phone`

CTA behavior:
- `Send recovery code` starts an approved phone recovery challenge.
- `Return to sign-in` routes to `/(auth)/sender/sign-in` with source `recovery`.
- `I no longer have this phone` routes to support or support contact entry without changing account state.

## First Meaningful Value
First meaningful value is not a success toast. It is the sender receiving a recovery path that can safely return them to sign-in without weakening account security.

Recovery completion sequence:
1. Sender submits phone.
2. App requests recovery challenge.
3. Screen shows generic sent state.
4. Sender returns to sign-in to complete OTP verification.
5. Auth/session provider validates sender access before any sender route opens.

Rules:
- Do not route directly into sender home from recovery.
- Do not authenticate the sender inside recovery unless the auth architecture explicitly merges recovery and sign-in.
- Do not change phone number from this screen.
- Do not bypass lockout from this screen.

## Main Tension
Recovery must help legitimate senders without becoming an attacker-friendly phone discovery or account takeover surface. The UI must be useful while intentionally generic: the sent state should not prove the phone exists, and the lost-phone support path should not promise access until support review.

## Design Brief
User and job:
- A sender needs a safe way back into phone sign-in.

Context of use:
- Recovery, blocked, frustrated, mobile-first, often after failed attempts.

Entry point:
- Locked sign-in, invalid code loop, session expiry, support instruction, or direct recovery link.

Success state:
- Sender gets a recovery code path and returns to sign-in, or starts support help for lost-phone access.

Primary action:
- Send recovery code.

Navigation model:
- Auth stack screen with one form and a sent state.

Density:
- Calm and sparse. Recovery needs confidence, not volume.

Visual thesis:
- A quiet security checkpoint that feels protective and human, using the same sender mobile material language but with less motion and fewer visual elements.

Restraint rule:
- Avoid identity-proofing complexity, account status details, attempt counters, route maps, support ticket forms, and staff/admin language.

Product lens:
- Trust-critical account recovery.

System stance:
- Match sender auth style from `SenderSignIn`, with stronger warning hierarchy for locked and lost-phone scenarios.

Interaction thesis:
- One controlled form, one generic sent confirmation, one safe support route.

Signature move:
- A recovery shield panel with two paths: `I have my phone` and `I no longer have this phone`, where only the first path attempts recovery.

Activation event:
- Recovery challenge request completes and the user is safely returned to sign-in.

## Elite Quality Gate
This spec is not closed unless the resulting screen helps real senders recover while preserving account privacy and resisting abuse.

Non-negotiable quality requirements:
- The screen must not reveal whether the phone belongs to a sender account.
- The sent state must be generic.
- The screen must not change phone ownership.
- The screen must not use admin APIs.
- The screen must not override lockout.
- The screen must not show raw provider errors.
- The screen must not ask for identity documents.
- The screen must not collect delivery IDs, tracking codes, station IDs, payment IDs, or receiver data.
- The screen must keep support help visible for lost-phone cases.
- The screen must remain keyboard-safe.
- The screen must support screen reader, large text, high contrast, reduced motion, and weak network.

Closure rule:
- If the sent state confirms account existence, the screen remains open.
- If the screen can change a sender phone without approved backend recovery, the screen remains open.
- If a locked user can bypass lockout here, the screen remains open.
- If support help promises instant restoration, the screen remains open.
- If raw provider errors appear, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, or branding to copy:

- OWASP Forgot Password guidance supports generic responses, consistent behavior, and abuse prevention for account recovery.
- OWASP Authentication guidance supports generic authentication errors and throttling to prevent account enumeration.
- NIST SP 800-63B treats account recovery as less frequent, security-sensitive, and potentially slower than normal authentication.
- Firebase phone auth documentation explains provider-controlled phone verification and code challenge behavior.
- W3C WCAG 2.2 guidance supports accessible form errors, status messages, focus order, and target size.
- Expo Router authentication documentation supports session-aware redirects and protected route boundaries.

Reference links:
- https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://firebase.google.com/docs/auth/web/phone-auth
- https://www.w3.org/WAI/WCAG22/quickref/
- https://docs.expo.dev/router/advanced/authentication/

Do not copy external account recovery screens, provider UI, government copy, icons, illustrations, or source code.

## Product Assumptions
Assumptions for v1:
- Sender recovery is phone OTP re-verification.
- Sender auth uses `phone_otp`.
- Sender session duration is `30 days` unless revoked.
- Lockout is `5` failed attempts in `15 minutes`.
- Firebase Authentication handles phone proof.
- Backend APIs enforce actual sender permissions after auth.
- There is no approved self-service phone-number replacement flow in this route.
- Lost-phone cases require support handling outside this screen.

If phone-number replacement becomes a product requirement, it must be specified as a separate high-security flow before implementation.

## Non-Goals
Do not implement these in this screen:
- Password reset.
- Staff PIN reset.
- Admin reset.
- Email login.
- Role selection.
- Phone-number replacement.
- Identity document upload.
- Delivery lookup.
- Tracking code entry.
- Sender profile editing.
- Support conversation UI.
- Payment verification.
- Account deletion.
- Device trust management.
- Push notification permission.

## Route Rules
### Route
- Render at `/(auth)/sender/recovery`.
- Must be accessible before sender authentication.
- Must not render authenticated sender tabs.
- Must redirect authenticated sender away only after session validation.
- Must remain separate from `SenderSignIn` even if both call the auth provider.

### Accepted Query Params
Allowed:
- `source`: `locked`, `invalid_code`, `session_expired`, `sign_in`, `support`, `unknown`.
- `returnTo`: allowlisted auth route only.

Rules:
- `source` can adjust tiny helper copy only.
- `returnTo` must not route directly to authenticated sender screens.
- Unknown `returnTo` falls back to `/(auth)/sender/sign-in`.
- Do not reflect untrusted values in copy.

Forbidden:
- `phone`
- `otp`
- `token`
- `senderId`
- `deliveryId`
- `trackingCode`
- `stationId`
- `role`
- `paymentId`
- `receiverPhone`
- `supportTicketId`

### Outbound Routes
Allowed:
- `/(auth)/sender/sign-in`
- `/(sender)/onboarding`
- `/support`
- `/privacy`
- `/terms`

Blocked:
- `/(sender)/home`
- `/(sender)/create`
- Sender delivery detail routes.
- Payment routes.
- Staff routes.
- Admin routes.
- Receiver private routes.

## Recovery Flow Model
The recovery route has one form and one sent state.

Step 1:
- Sender enters phone.
- Sender taps `Send recovery code`.
- App sends a recovery challenge through the auth provider or approved auth service.

Step 2:
- App shows sent state.
- Copy is generic and does not prove account existence.
- Sender returns to sign-in.

Lost-phone route:
- Sender taps `I no longer have this phone`.
- App routes to support entry with safe recovery context only.
- No account state changes.

Error route:
- If challenge cannot be requested, show generic error with retry and support.

## Authority Rules
This screen does not own:
- Account existence.
- Role assignment.
- Sender account creation.
- Phone-number replacement.
- Lockout removal.
- Delivery access.
- Profile data.
- Support resolution.

This screen may:
- Request a recovery challenge.
- Show sent state.
- Route to sign-in.
- Route to support.
- Show safe, generic errors.

Rules:
- Do not call `admin_upsert_user`.
- Do not call admin user APIs.
- Do not call delivery APIs.
- Do not call payment APIs.
- Do not call issue APIs as an authenticated user.
- Do not write sender role.
- Do not store phone as account truth.
- Do not override lockout locally.

## State Model
Required inventory states:
- `loading`
- `sent`
- `error`

Recommended internal states:
- `ready`
- `submitting`
- `sent`
- `offline`
- `rate_limited`
- `locked`
- `provider_unavailable`
- `support_route`
- `input_error`

State mapping:
- `submitting` maps to `loading`.
- `sent` maps to `sent`.
- `offline`, `rate_limited`, `locked`, `provider_unavailable`, and `input_error` map to `error` unless security/product chooses a specific locked substate.

Rules:
- Keep `sent` generic.
- Keep `error` generic.
- Do not expose account existence.
- Do not show raw auth service codes.

## State Details
### Ready
Purpose:
- Let sender request recovery code.

UI:
- Title.
- Short explanation.
- Phone input.
- Primary CTA.
- Lost-phone action.
- Return-to-sign-in action.
- Policy links.

Copy:
- Title: `Recover sender access`
- Body: `Enter the phone you use for Kra deliveries. If recovery is available, we will send a code you can use from sign-in.`
- Field label: `Phone number`
- Field helper: `Use the phone linked to your sender access.`
- Primary CTA: `Send recovery code`
- Secondary: `Return to sign-in`
- Lost-phone action: `I no longer have this phone`

### Loading
Purpose:
- Confirm the recovery request is being processed.

UI:
- Disable phone field.
- Disable primary CTA.
- Keep route controls stable.
- Show loading in CTA and status line.

Copy:
- Button: `Sending recovery code...`
- Status: `Checking recovery options.`

Rules:
- Do not show account lookup language.
- Do not show spinner-only progress.
- Do not allow duplicate requests.

### Sent
Purpose:
- Tell the sender what to do next without confirming account existence.

Copy:
- Title: `Check your phone`
- Body: `If this phone can recover sender access, a code has been sent. Return to sign-in and enter the latest code.`
- Primary CTA: `Return to sign-in`
- Secondary: `Use a different phone`
- Support link: `Still need help?`

Rules:
- This state must render even when the backend intentionally returns a generic success for unknown phones.
- Do not say `account found`.
- Do not say `we found your account`.
- Do not say `no account found`.
- Do not show full phone number.
- Do not show delivery data.

### Error
Purpose:
- Recover from network, provider, validation, rate-limit, or service issues.

Generic error copy:
- Title: `Recovery could not continue`
- Body: `Check the phone number and connection, then try again. If this keeps happening, contact support.`
- Primary CTA: `Try again`
- Secondary: `Contact support`

Validation errors:
- Empty phone: `Enter your phone number.`
- Invalid phone: `Enter a valid phone number.`

Rate-limited:
- Title: `Try again later`
- Body: `There have been too many recovery attempts. Wait before trying again, or contact support.`
- Primary: `Contact support`
- Secondary: `Return to sign-in`

Provider unavailable:
- Title: `Recovery is not available right now`
- Body: `The phone recovery service is taking too long. Try again in a few minutes.`
- Primary: `Try again`
- Secondary: `Contact support`

Offline:
- Title: `Connection needed`
- Body: `Recovery needs a network connection. Check your connection and try again.`
- Primary: `Try again`

Rules:
- Do not show raw provider errors.
- Do not show account status.
- Do not show exact internal rate-limit counters.

## Information Architecture
Screen order:
1. Auth header.
2. Recovery shield panel.
3. Current state title.
4. Explanation.
5. Phone form or sent content.
6. Status/error region.
7. Primary action.
8. Secondary action.
9. Lost-phone support route.
10. Policy links.

First viewport must include:
- Product mark.
- `Recover sender access`.
- Explanation.
- Phone input or sent message.
- Primary CTA.
- Support/lost-phone route.

Below first viewport:
- Why recovery is careful.
- Policy links.

Do not add:
- Delivery status.
- Package data.
- Station list.
- Account profile.
- Security lecture.
- Long FAQ.

## Layout Blueprint
### Phone Baseline
Target widths:
- `320px`
- `360px`
- `393px`
- `430px`

Keyboard-safe requirements:
- Active phone field remains visible.
- Primary CTA remains above keyboard or immediately reachable.
- Lost-phone route remains reachable through scroll.
- Footer links may move below fold.

Safe areas:
- Respect top and bottom safe areas.
- Keep bottom actions above gesture area.

### Structure
Header:
- Back action.
- Kra mark.
- Small title: `Account access`

Main surface:
- Recovery shield icon or abstract mark.
- Screen title.
- Body.
- Form or sent state.
- CTA stack.

Support path:
- Compact panel:
  - Title: `No access to that phone?`
  - Body: `Support can help review the safest next step.`
  - Link: `Contact support`

Footer:
- Terms.
- Privacy.

Rules:
- Use one main surface.
- Support panel must not look like the primary action.
- Do not use alarming visuals unless the account is locked.

## Component Contract
### `SenderAuthRecoveryScreen`
Responsibilities:
- Render recovery form.
- Validate phone locally.
- Request recovery code.
- Render sent state.
- Render generic errors.
- Route to sign-in.
- Route to support.
- Emit safe analytics.

Dependencies:
- Auth provider or recovery service.
- Router.
- Network status provider.
- Analytics client.
- Feature flag provider only for copy/availability, not security.

Must not depend on:
- Delivery APIs.
- Payment APIs.
- Station APIs.
- Issue APIs as authenticated sender.
- Admin user APIs.
- Notification feed APIs.

### `RecoveryHeader`
Purpose:
- Orient user in auth recovery.

Content:
- Back action.
- Kra mark.
- Title: `Account access`

Rules:
- Back returns to sign-in by default.
- Back must not route into protected screens.
- Do not show authenticated tabs.

### `RecoveryShieldPanel`
Purpose:
- Establish the security-sensitive nature of recovery without heavy explanation.

Content:
- Security visual.
- Title.
- Body.

Rules:
- Keep visual quiet.
- Do not animate constantly.
- Do not use warning colors in ready state.

### `RecoveryPhoneForm`
Purpose:
- Capture phone for recovery request.

Elements:
- Label.
- Phone input.
- Helper text.
- Validation.
- Primary CTA.

Rules:
- Visible label.
- Phone keyboard.
- E.164 normalization before provider request.
- Do not submit until local validation passes.
- Do not store phone after screen lifecycle ends.

### `RecoverySentState`
Purpose:
- Confirm safe next step generically.

Elements:
- Title.
- Body.
- Primary CTA to sign-in.
- Secondary use-different-phone action.
- Support link.

Rules:
- Must not confirm account existence.
- Must not show full phone.
- Must not route directly to authenticated app.

### `LostPhoneSupportPanel`
Purpose:
- Give a safe route for users who lost phone access.

Content:
- Title: `No access to that phone?`
- Body: `Support can help review the safest next step.`
- Link: `Contact support`

Rules:
- No phone change here.
- No promise of unlock.
- No form fields here.

### `RecoveryStatusMessage`
Purpose:
- Show loading/error/status accessibly.

Rules:
- Associated with input where relevant.
- Announced by screen reader where platform supports status messages.
- Not color-only.
- Short copy.

## Exact Copy
### Header
Small title:
- `Account access`

### Ready State
Title:
- `Recover sender access`

Body:
- `Enter the phone you use for Kra deliveries. If recovery is available, we will send a code you can use from sign-in.`

Field label:
- `Phone number`

Field helper:
- `Use the phone linked to your sender access.`

Primary CTA:
- `Send recovery code`

Secondary:
- `Return to sign-in`

Lost-phone action:
- `I no longer have this phone`

### Loading State
Button:
- `Sending recovery code...`

Status:
- `Checking recovery options.`

### Sent State
Title:
- `Check your phone`

Body:
- `If this phone can recover sender access, a code has been sent. Return to sign-in and enter the latest code.`

Primary CTA:
- `Return to sign-in`

Secondary CTA:
- `Use a different phone`

Support link:
- `Still need help?`

### Generic Error
Title:
- `Recovery could not continue`

Body:
- `Check the phone number and connection, then try again. If this keeps happening, contact support.`

Primary CTA:
- `Try again`

Secondary:
- `Contact support`

### Rate Limited
Title:
- `Try again later`

Body:
- `There have been too many recovery attempts. Wait before trying again, or contact support.`

Primary:
- `Contact support`

Secondary:
- `Return to sign-in`

### Provider Unavailable
Title:
- `Recovery is not available right now`

Body:
- `The phone recovery service is taking too long. Try again in a few minutes.`

Primary:
- `Try again`

Secondary:
- `Contact support`

### Offline
Title:
- `Connection needed`

Body:
- `Recovery needs a network connection. Check your connection and try again.`

Primary:
- `Try again`

### Lost Phone Support Panel
Title:
- `No access to that phone?`

Body:
- `Support can help review the safest next step.`

Link:
- `Contact support`

### Footer
Text:
- `Recovery is protected by Kra's Terms and Privacy Policy.`

Links:
- `Terms`
- `Privacy`

## Copy Rules
Use:
- `recover`
- `sender access`
- `phone`
- `code`
- `support`
- `try again`

Avoid:
- `account found`
- `account not found`
- `registered`
- `unregistered`
- `user disabled`
- `admin reset`
- `override`
- `identity proofing`
- `provider error`
- `Firebase`
- `token`
- `claim`
- `guaranteed unlock`
- `instant access`

Tone:
- Calm.
- Protective.
- Direct.
- Short.
- Non-accusatory.

## Visual System Direction
### Overall Style
This screen should feel like a secure recovery checkpoint, quieter than normal sign-in and more reassuring than an error page.

Visual keywords:
- Safe.
- Calm.
- Protective.
- Precise.
- Warm.
- Sparse.

Do not make it:
- Alarming.
- Corporate legal.
- Support-heavy.
- Feature-led.
- Dark and threatening.
- Decorative.

### Color Tokens
Recommended usage:
- `surface.base`: warm off-white.
- `surface.recovery`: clean raised panel.
- `ink.primary`: deep charcoal.
- `ink.secondary`: slate.
- `accent.primary`: route green for action.
- `accent.security`: deep navy for recovery shield.
- `state.warning`: restrained amber for rate-limit state.
- `state.error`: only for actual error text.

Rules:
- Ready and sent states should not use red.
- Error state must not overwhelm the screen.
- Support panel uses neutral surface, not warning surface.
- Maintain WCAG contrast.

### Typography
Hierarchy:
- Title: `28-34px` equivalent.
- Body: `15-17px`.
- Field label: `14-16px`.
- Input value: `20-24px`.
- Status/error: `14-15px`.
- Button: `16-17px`.

Rules:
- Do not use tiny legal copy.
- Keep sent-state body short.
- Avoid truncating support link.

### Spacing
Use spacing:
- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Rules:
- Keep form and CTA visually connected.
- Give sent state enough room to feel resolved.
- Keep support panel below primary action.
- Avoid crowding policy links near recovery CTA.

### Surfaces
Use:
- One recovery panel.
- One support panel.
- Lightweight footer.

Avoid:
- Multiple equal cards.
- Nested panels.
- Large illustrations.
- Dense FAQ blocks.
- Warning banners in normal ready state.

## Input Design
### Phone Field
Requirements:
- Visible label.
- Phone keyboard.
- Country code support or approved Ghana prefix behavior.
- Format tolerant input.
- E.164 normalization before request.
- Error association.

Validation timing:
- No error on untouched empty field.
- Required error on submit.
- Format error after blur or submit.

Local errors:
- Empty: `Enter your phone number.`
- Invalid: `Enter a valid phone number.`

Rules:
- Do not send request before local validation.
- Do not show account-state errors.
- Do not persist phone outside active recovery session.

## Loading Rules
Loading state starts when sender taps `Send recovery code`.

Behavior:
- Disable phone input.
- Disable primary CTA.
- Show button progress.
- Show status text.
- Keep back, sign-in return, and support links available unless a navigation conflict exists.

Timeout:
- If request times out, show provider unavailable state.
- Do not retry repeatedly without user action.
- Preserve phone in memory for retry.

Rules:
- Do not display a full-screen spinner.
- Do not clear the form on timeout.
- Do not say recovery was sent until request completes or generic success policy returns.

## Sent State Rules
The sent state is intentionally generic.

Required sentence:
- `If this phone can recover sender access, a code has been sent.`

Why:
- Prevents phone/account enumeration.
- Keeps recovery useful.
- Aligns with OWASP recovery guidance.

Rules:
- Always use generic sent copy after accepted recovery request.
- Do not show account name.
- Do not show full phone number.
- Do not show sender delivery count.
- Do not show profile data.
- Do not show whether the account is new or returning.

## Lost Phone Rules
Lost-phone action:
- `I no longer have this phone`

Behavior:
- Route to support entry with safe context `sender_auth_recovery_lost_phone`.
- Do not send phone in URL.
- Do not create support case automatically unless future support contract allows unauthenticated recovery intake.

Copy constraints:
- Do not promise unlock.
- Do not promise phone change.
- Do not ask for documents on this screen.
- Do not ask for delivery IDs on this screen.

Support route may explain later:
- What information support needs.
- How long review may take.
- What cannot be changed without verification.

## Privacy And Security Rules
Privacy:
- Do not put phone in route params.
- Do not put phone in analytics.
- Do not put phone in support URL.
- Do not store phone after screen closes.
- Do not log recovery codes.
- Do not store recovery codes.
- Do not expose raw provider errors.

Security:
- Recovery must use auth provider or approved auth service.
- Recovery does not prove sender role by itself.
- Sender routes remain protected.
- Lockout cannot be bypassed locally.
- Lost-phone cases require support review.
- Client cannot change account phone.

Abuse prevention:
- Disable duplicate submissions.
- Respect provider rate limits.
- Show generic sent state.
- Avoid attempt counts.
- Do not offer unlimited resend.

## Analytics
Allowed events:
- `sender_auth_recovery_viewed`
- `sender_auth_recovery_phone_submitted`
- `sender_auth_recovery_sent`
- `sender_auth_recovery_failed`
- `sender_auth_recovery_return_to_sign_in_tapped`
- `sender_auth_recovery_lost_phone_tapped`
- `sender_auth_recovery_support_tapped`

Required fields:
- `screenId`
- `route`
- `source`
- `platform`
- `appVersion`
- `state`
- `result`

Forbidden fields:
- Phone number.
- OTP.
- Recovery code.
- Token.
- Sender ID.
- Delivery ID.
- Tracking code.
- Station ID.
- Payment ID.
- Support ticket ID.
- Raw provider code.

Analytics rules:
- Fire view once per screen session.
- Fire submit before request.
- Fire sent only after accepted request or generic success policy.
- Fire failed with normalized category only: `validation`, `offline`, `rate_limited`, `unavailable`, `unknown`.
- Do not block UI on analytics.

## Accessibility Requirements
Structure:
- One main heading.
- Visible field label.
- Error associated with field.
- Sent and error states announced.
- Focus order matches visual order.

Screen reader:
- Ready state announces title, explanation, phone field, CTA, support path.
- Loading state announces `Checking recovery options.`
- Sent state announces title and next step.
- Error state announces title and recovery option.

Focus:
- On state change to sent, move focus to sent title if platform behavior supports it.
- On validation error, move focus to error or field per app convention.
- Do not trap focus in support panel.

Touch:
- All actions at least `44x44` effective points.
- Primary CTA at least `52` height.
- Support link has padded touch area.

Large text:
- Screen scrolls.
- CTA text does not clip.
- Support panel remains reachable.
- Policy links remain readable.

Motion:
- Use minimal state transition.
- Reduced motion disables movement.
- No continuous animation.

## Mobile Platform Behavior
### iOS
- Use phone keyboard.
- Respect safe areas.
- Keep CTA above keyboard.
- Use native press feedback.
- Preserve form state across short SMS/app switch interruptions.

### Android
- Use phone input keyboard.
- Respect gesture navigation.
- Use native or design-system press feedback.
- Back from sent state returns to sign-in only after user confirms or taps CTA, depending app convention.

### Shared
- Do not require clipboard access.
- Do not request contacts.
- Do not request SMS permission.
- Do not request push permission.
- Do not request camera.

## Offline And Weak Network Behavior
Offline:
- Screen renders.
- Phone field remains usable.
- Submit shows offline error.
- Phone remains in memory for retry.

Weak network:
- Loading state appears.
- Timeout becomes provider unavailable.
- Retry is user-initiated.
- Support remains reachable.

Do not:
- Queue recovery requests offline.
- Claim a recovery code was sent while offline.
- Retry repeatedly in the background.

## Navigation Outcomes
Ready state:
- Back -> `/(auth)/sender/sign-in`.
- Return to sign-in -> `/(auth)/sender/sign-in`.
- Lost phone -> support route.

Sent state:
- Primary -> `/(auth)/sender/sign-in?source=recovery`.
- Use different phone -> ready state, clears local phone.
- Support -> support route.

Error state:
- Try again -> ready state with phone preserved.
- Contact support -> support route.
- Return to sign-in -> sign-in route.

Rules:
- Use replace navigation when returning to sign-in after sent state if recovery stack should not remain behind the OTP entry.
- Do not navigate to sender home or create route from recovery.
- Do not carry phone in URL.

## Backend Alignment
This screen aligns with:
- `docs/08-security/authentication-flows.md`
- `packages/shared/src/domain/auth-policy.ts`
- `docs/05-design/frontend-screen-inventory.md`
- `services/api/src/auth.ts`

Relevant facts:
- Sender recovery is phone OTP re-verification.
- Sender auth method is `phone_otp`.
- Lockout is `5` failed attempts in `15 minutes`.
- Auth proves identity; backend permissions still control delivery access.

Backend gaps to respect:
- No sender self-service phone replacement contract exists.
- No unauthenticated support case creation contract is guaranteed from this screen.
- No admin reset should be called from mobile sender recovery.

Implementation decision:
- Recovery can request a code, but it cannot complete account restoration without returning through sign-in/session validation.

## Error Mapping
Use normalized UI categories.

| Source condition | UI category | User copy |
| --- | --- | --- |
| Empty phone | validation | `Enter your phone number.` |
| Invalid phone | validation | `Enter a valid phone number.` |
| Accepted recovery request | sent | `If this phone can recover sender access, a code has been sent.` |
| Unknown phone with generic success policy | sent | `If this phone can recover sender access, a code has been sent.` |
| Offline | error | `Recovery needs a network connection. Check your connection and try again.` |
| Rate limited | error | `There have been too many recovery attempts. Wait before trying again, or contact support.` |
| Provider timeout | error | `The phone recovery service is taking too long. Try again in a few minutes.` |
| Unknown error | error | `Check the phone number and connection, then try again. If this keeps happening, contact support.` |

Rules:
- Do not display source condition names.
- Do not display raw provider codes.
- Do not display stack traces.
- Do not display account status.

## Implementation Notes For Claude Code
Build only the sender auth recovery route and local recovery components.

Expected implementation files later:
- Route file for `/(auth)/sender/recovery`.
- Component for recovery phone form.
- Component for sent state.
- Component for lost-phone support panel.
- Component for recovery status message.
- Tests for loading, sent, error, lost-phone support, generic sent copy, navigation, and analytics safety.

Do not implement:
- Sender sign-in screen.
- OTP verification screen logic beyond return route.
- Support case creation.
- Phone-number replacement.
- Admin reset.
- Staff recovery.
- Delivery lookup.
- Payment lookup.
- Identity document upload.

Testing requirements:
- Root test ID renders.
- Empty phone validation works.
- Invalid phone validation works.
- Loading disables duplicate submit.
- Sent state copy is generic.
- Sent state routes to sign-in.
- Lost-phone action routes to support without phone in URL.
- Error state hides raw provider errors.
- Analytics excludes sensitive data.
- Keyboard-open layout remains usable.

## Test IDs
Primary:
- `screen-sender-auth-recovery`

Recommended child IDs:
- `sender-auth-recovery-header`
- `sender-auth-recovery-shield-panel`
- `sender-auth-recovery-phone-form`
- `sender-auth-recovery-phone-input`
- `sender-auth-recovery-send-button`
- `sender-auth-recovery-status-message`
- `sender-auth-recovery-sent-state`
- `sender-auth-recovery-return-sign-in`
- `sender-auth-recovery-use-different-phone`
- `sender-auth-recovery-lost-phone`
- `sender-auth-recovery-support-link`
- `sender-auth-recovery-policy-links`

Test ID rules:
- Stable.
- Lowercase kebab case.
- No dynamic values.
- No phone, code, token, sender, delivery, or support identifiers.

## QA Acceptance Criteria
Route:
- The screen renders at `/(auth)/sender/recovery`.
- The root has test ID `screen-sender-auth-recovery`.
- Authenticated sender is redirected only after session validation.
- Unauthenticated sender can view recovery.

Ready state:
- Phone field has visible label.
- Primary CTA is `Send recovery code`.
- Lost-phone action is visible.
- Return-to-sign-in action is visible.

Validation:
- Empty phone shows local validation.
- Invalid phone shows local validation.
- Valid phone starts recovery request.

Loading:
- Primary CTA shows loading copy.
- Duplicate submit is disabled.
- Status message is announced.

Sent:
- Sent state uses generic copy.
- Sent state does not confirm account existence.
- Sent state does not show full phone.
- Primary CTA routes to sign-in.

Error:
- Offline error is clear.
- Provider unavailable error is clear.
- Rate limit error is clear.
- Raw provider errors are never shown.

Support:
- Lost-phone route opens support path.
- Support route does not include phone in URL.
- Support copy does not promise instant access.

Security:
- No phone appears in route params.
- No phone appears in analytics.
- No admin APIs are called.
- No delivery APIs are called.
- No account phone is changed.

Accessibility:
- Screen reader can complete the flow.
- Error is associated with phone field.
- Sent state is announced.
- Large text does not clip CTA.
- Touch targets meet minimum size.
- Reduced motion disables transitions.

## Visual QA Checklist
Founder lens:
- Does recovery feel safe and serious?
- Does the screen reduce panic without overpromising?
- Does it protect the account as much as it helps the sender?

Skeptical sender lens:
- Do I know what to do if I still have my phone?
- Do I know what to do if I lost my phone?
- Do I understand that recovery may take support review?

Operator lens:
- Does the UI avoid account enumeration?
- Does it avoid phone replacement?
- Does it respect lockout and rate limits?

Accessibility lens:
- Can a screen reader user request recovery?
- Can a large-text user request recovery?
- Are loading, sent, and error states announced clearly?

Security lens:
- Is the sent state generic?
- Are sensitive values excluded from URLs and analytics?
- Are raw provider errors hidden?

Creative director lens:
- Is the recovery shield useful and restrained?
- Is the screen calm without feeling empty?
- Does it match the sender auth visual language?

## Build Boundaries
In scope:
- Sender auth recovery route.
- Phone recovery request form.
- Loading state.
- Generic sent state.
- Error states.
- Lost-phone support route.
- Safe analytics.
- Accessibility and keyboard handling.

Out of scope:
- Phone-number replacement.
- Support case form.
- Admin reset.
- Staff recovery.
- Sender sign-in OTP verification.
- Delivery creation.
- Payment.
- Tracking.
- Profile.
- Identity document collection.

## Open Decisions
No blocking product decisions remain for this screen.

Implementation-time decisions:
- Exact phone country selector pattern.
- Exact support route destination.
- Whether support opens in-app or web.
- Whether resend timing is shown on recovery or only sign-in.
- Final icon treatment for recovery shield.

These must not change account recovery authority or privacy behavior.

## Definition Of Done
This screen is done when:
- It renders at the inventory route.
- It uses the inventory test ID.
- It supports loading, sent, and error states.
- It sends generic recovery responses.
- It does not reveal whether a phone belongs to a sender.
- It does not change account phone.
- It does not call admin, delivery, payment, station, issue, or notification APIs.
- It routes sent users back to sign-in.
- It routes lost-phone users to support safely.
- It excludes phone and recovery data from URL and analytics.
- It remains keyboard-safe on small phones.
- It supports screen reader, large text, high contrast, reduced motion, and weak network.
- It feels like a serious account recovery surface for Kra, not a generic reset page.

