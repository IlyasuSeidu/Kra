# Passwordless Phone Login Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PasswordlessPhoneLogin` |
| App | `apps/mobile` primary, `apps/web` fallback for supported auth links |
| Route | `/(auth)/phone-login` |
| Primary test ID | `screen-passwordless-phone-login` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 shared mobile authentication |
| Backend dependency | Firebase authentication, bearer token verification, shared auth policy, route guards, `AuthPrincipal`, `kra_role`, `kra_station_id`, auth session store |
| Related routes | `/(auth)/role-selection`, `/(auth)/sender/sign-in`, `/(auth)/station/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/courier/sign-in`, `/(auth)/staff/activate`, `/session-expired`, `/account-locked`, `/permission-denied`, `/support`, `/privacy`, `/terms` |
| Required states | `ready`, `checking_route_context`, `enter_phone`, `sending_code`, `code_sent`, `auto_verifying`, `enter_code`, `verifying_code`, `token_received`, `claims_checking`, `sender_ready`, `staff_ready`, `role_mismatch`, `station_scope_missing`, `invalid_phone`, `invalid_code`, `expired_code`, `resend_wait`, `too_many_attempts`, `account_locked`, `provider_unavailable`, `recaptcha_required`, `recaptcha_failed`, `sms_region_blocked`, `offline`, `api_error` |

## Product Job
`PasswordlessPhoneLogin` is the shared phone verification route for Kra mobile authentication. It handles phone-based proof through the approved auth provider, then routes the user only after identity, role, and scope checks finish.

The screen answers:
- `Can this phone prove identity through the approved provider?`
- `Which auth route should this person return to after verification?`
- `Is the verified token allowed to enter sender or staff surfaces?`
- `What happens if the code expires, rate limits trigger, or provider checks fail?`
- `How do we keep sender login separate from receiver tracking verification?`
- `How do we keep phone proof from becoming a role grant?`

The user should be able to:
- Enter a Ghana-friendly phone number.
- Request a one-time code through the approved provider.
- Enter or accept a one-time code with platform autofill when available.
- Resume after leaving the app to read SMS.
- See a generic error when verification cannot continue.
- Wait through resend cooldown without submitting repeatedly.
- Return to the correct role-specific sign-in surface.
- Reach support or role selection when the route context is wrong.

This screen is not:
- A sender onboarding screen.
- A staff activation screen.
- A staff PIN setup screen.
- A receiver tracking phone verification screen.
- A delivery OTP proof screen.
- An admin sign-in screen.
- A public tracking detail screen.
- A role picker that grants access.
- A station selector.
- A user provisioning form.
- A support conversation.

## Strategic Role
Kra has multiple phone-sensitive flows:
- sender app login with `phone_otp`
- staff mobile sign-in with `phone_pin`
- receiver delivery access verification tied to a tracking code
- delivery completion OTP proof tied to final-mile handoff

These must not collapse into one unsafe "enter phone and code" route. The shared `PasswordlessPhoneLogin` route exists to handle app authentication phone proof only. It must not call receiver tracking endpoints, delivery completion endpoints, or staff activation endpoints.

Core principle:
- Phone proof verifies control of a phone through the auth provider.
- Backend token claims decide role and operational authority.
- Receiver phone verification is delivery-scoped and separate.
- Staff PIN and staff activation remain provider or future-backend controlled.
- The UI guides the user but does not grant role, station, delivery, or payment access.

## Audience
Primary users:
- senders signing in with phone OTP
- returning senders after session expiry
- staff routed through provider-controlled phone verification before role-specific sign-in
- users recovering from interrupted SMS verification

Secondary users:
- station operators using provider phone verification before staff PIN flow
- drivers using provider phone verification before staff PIN flow
- final-mile couriers using provider phone verification before staff PIN flow
- support agents guiding users by phone
- QA validating auth boundaries
- security reviewers checking phone and code handling
- Claude Code implementing the frontend later

Non-users:
- public receivers verifying tracking access
- couriers completing receiver delivery proof
- admins signing in by email, password, and MFA
- payment providers
- SMS provider callbacks
- automated backend jobs

## Current Backend Reality
Implemented app-auth facts:
- Backend verifies Firebase ID tokens.
- `AuthPrincipal.userId` comes from token UID.
- `AuthPrincipal.role` comes from `kra_role`.
- `AuthPrincipal.stationId` comes from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from the shared permission matrix.
- Sender auth method is `phone_otp`.
- Driver auth method is `phone_pin`.
- Station operator auth method is `phone_pin`.
- Final-mile courier auth method is `phone_pin`.
- Sender session TTL is `30 days`.
- Staff mobile session TTL is `12 hours`.
- Staff lockout policy is `5` failed attempts within `15 minutes`.

Implemented phone-verification endpoints that must not be used for app login:
- `POST /v1/public/track/:trackingCode/request-verification`
- `POST /v1/public/track/:trackingCode/verify-phone`

Those public endpoints are receiver tracking endpoints. They require a tracking code, create a delivery-scoped verification grant, and are not app login endpoints.

Missing app-auth endpoints:
- no Kra-owned `POST /v1/auth/phone/start`
- no Kra-owned `POST /v1/auth/phone/verify`
- no Kra-owned `POST /v1/auth/phone/resend`
- no Kra-owned `GET /v1/auth/session`
- no Kra-owned staff PIN endpoint

Therefore current v1 behavior:
- Use the approved Firebase/provider phone auth flow for app login.
- Do not call public receiver verification endpoints.
- Do not call admin user mutation routes.
- Do not issue custom role claims on the client.
- Do not create a sender, staff, station, delivery, payment, or receiver record from this route.
- After provider auth succeeds, read provider token and resolve app role through shared auth state and backend-protected route checks.
- If token claims do not match the intended route, show role mismatch and route safely.

## Auth Flow Boundaries
Sender phone login:
- Intended auth method: `phone_otp`.
- Route source: `sender_sign_in`, `sender_onboarding`, `session_expired`, or `protected_sender_route`.
- Success route: `/(sender)/home` or allowlisted sender continuation.
- Token role requirement: `sender`.

Staff phone login:
- Intended auth method: `phone_pin`.
- Route source: `station_sign_in`, `driver_sign_in`, `courier_sign_in`, or `staff_activation`.
- Success route: role-specific sign-in or operations home after provider and claim checks.
- Token role requirement: one of `station_operator`, `driver`, `final_mile_courier`.
- Staff PIN handling must stay in provider or future staff auth route.

Receiver phone verification:
- Intended auth method: delivery-scoped verification grant.
- Route source: public tracking.
- Success route: public tracking state, not authenticated app.
- Must not enter this screen.

Delivery completion OTP:
- Intended use: receiver proof for final-mile completion.
- Route source: courier delivery completion flow.
- Success route: delivery completion mutation.
- Must not enter this screen.

Admin sign-in:
- Intended auth method: `email_password_mfa`.
- Route source: admin web console.
- Success route: admin console.
- Must not enter this screen.

## Source References
External references used for this screen:
- [Firebase web phone authentication](https://firebase.google.com/docs/auth/web/phone-auth): supports SMS phone sign-in, one-time code entry, consent wording, region policy, and reCAPTCHA app verification on web.
- [Firebase Android phone authentication](https://firebase.google.com/docs/auth/android/phone-auth): supports SMS phone sign-in, Play Integrity, reCAPTCHA fallback, resume behavior after SMS app switching, and code verification behavior.
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/): supports session-aware routing and protected-route redirects in Expo Router.
- [Expo authentication overview](https://docs.expo.dev/develop/authentication/): supports separating public login screens from protected screens and treating passwordless login as OTP or magic-link based auth.
- [Android Credential Manager](https://developer.android.com/identity/credential-manager): supports future credential restoration and unified credential surfaces without replacing backend session checks.
- [Apple one-time code text content type](https://developer.apple.com/documentation/uikit/uitextcontenttype/onetimecode): supports platform-aware one-time code entry.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic auth responses, account enumeration resistance, throttling, and lockout care.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports OTP replay resistance, protected channels, rate limiting, and usability guidance for code entry.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports visible and programmatic errors for invalid phone and code fields.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible progress, sent, verifying, and redirect states.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch controls on mobile devices.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/01-auth-role-selection.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/03-staff-account-activation.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/02-sender-sign-in.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/03-sender-auth-recovery.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/01-station-sign-in.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/auth.ts`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/routes.ts`

## Design Brief
Audience:
- People proving phone control to enter sender or staff mobile auth.

Surface type:
- Mobile-first shared authentication step.

Primary action:
- Send code, verify code, then route by validated token and intended role.

Visual thesis:
- A precise phone checkpoint with one calm credential panel, a two-step progress rail, and explicit role-safe handoff copy.

Restraint rule:
- Do not add product marketing, delivery data, station data, role selection cards, or receiver tracking content.

## UX Principles
The screen should feel:
- quick
- secure
- familiar
- recoverable
- role-aware
- low-bandwidth tolerant

The screen must not feel:
- like a broad account portal
- like a public tracking step
- like a staff provisioning tool
- like an admin console
- like a delivery proof step
- like a form that can grant role authority

Design posture:
- One task per step.
- Stable bottom action above keyboard.
- Strong generic error copy.
- Clear resend timing.
- No raw provider terms unless required by platform UI.
- Visible route context without revealing account existence.

## Entry Context
Accepted route query values:
- `source`
- `intent`
- `intendedRole`
- `next`
- `returnTo`

Allowed `source` values:
- `sender_sign_in`
- `sender_onboarding`
- `session_expired`
- `protected_sender_route`
- `station_sign_in`
- `driver_sign_in`
- `courier_sign_in`
- `staff_activation`
- `role_selection`

Allowed `intent` values:
- `signin`
- `signup`
- `continue`
- `reauth`

Allowed `intendedRole` values:
- `sender`
- `station_operator`
- `driver`
- `final_mile_courier`

Allowed `next` values:
- allowlisted sender routes
- allowlisted auth routes
- role-specific operations home routes only after validated role

Rejected route values:
- `trackingCode`
- `deliveryId`
- `verificationToken`
- `otp`
- `code`
- `pin`
- `stationId`
- `userId`
- `providerToken`
- admin role values

Route handling rules:
- Never reflect untrusted query values in copy.
- Never accept phone, code, or PIN through query strings.
- Never route to protected content before token validation.
- Keep `next` allowlisted.
- Clear auth secrets from navigation state after use.

## Step Model
Step 1:
- Name: `Phone`
- State: `enter_phone`
- Goal: collect phone number.
- Primary action: `Send code`

Step 2:
- Name: `Code`
- State: `enter_code`
- Goal: verify one-time code or wait for auto verification.
- Primary action: `Verify and continue`

Step 3:
- Name: `Role check`
- State: `claims_checking`
- Goal: confirm route-safe role and scope.
- Primary action: none; automatic.

Step 4:
- Name: `Continue`
- State: `sender_ready` or `staff_ready`
- Goal: route to safe destination.
- Primary action: role-specific continuation.

Visible progress:
- Show two visible steps during input: `Phone` and `Code`.
- Do not expose a technical token step to users.
- Show claim check as a short status line after verification.

## Layout
Mobile layout:
- full-screen auth route with safe-area padding
- top back button
- small Kra mark
- route context line
- primary auth panel
- progress rail
- form body
- persistent bottom action
- recovery and legal links

Desktop fallback:
- narrow centered panel with max width around `480px`
- no admin chrome
- no marketing navigation
- no delivery detail content

Keyboard-open state:
- keep focused input, error text, and primary action visible
- scroll content only when necessary
- avoid layout jump when SMS autofill banner appears

Tap targets:
- primary button at least `44px` high
- secondary text links with enough vertical spacing
- resend action separated from verify action
- code cells large enough for direct tapping

## Visual System
Color:
- Use a quiet trusted surface, not a warning-heavy look.
- Use green only after verification succeeds.
- Use amber for resend wait and rate limit.
- Use red only for invalid entry or blocked verification.
- Use high-contrast text on both light and dark surfaces.

Typography:
- Step title should be large and direct.
- Phone and code fields should use legible numeric treatment.
- Code entry should use tabular digits.
- Help and legal text must remain readable at large text.

Motion:
- Phone-to-code transition may slide subtly.
- Verification status may pulse once.
- Success may fade into route handoff.
- Disable non-essential motion for reduced-motion users.
- Do not animate code digits or secrets.

Material:
- One strong auth panel.
- Minimal borders.
- Clear focused input state.
- No card grid.
- No generic phone illustration unless it directly clarifies SMS/app switching.

## Component Structure
Required route component:
- `PasswordlessPhoneLoginScreen`

Required child components:
- `PhoneLoginShell`
- `PhoneLoginHeader`
- `PhoneLoginContextLine`
- `PhoneLoginProgressRail`
- `PhoneEntryForm`
- `CodeEntryForm`
- `PhoneLoginStatus`
- `ResendCodeControl`
- `RouteMismatchNotice`
- `ClaimsCheckingPanel`
- `PhoneLoginRecoveryLinks`
- `PhoneLoginLegalLinks`
- `PhoneLoginLiveAnnouncer`

Shared component candidates:
- `PhoneNumberField`
- `OneTimeCodeField`
- `AuthBackButton`
- `PrimaryActionButton`
- `OfflineBanner`
- `SupportContactLink`
- `SecureStatusMessage`

Component ownership:
- Route component owns route context and navigation.
- Provider adapter owns phone auth calls.
- Auth session provider owns provider token state.
- Route guard owns protected route access.
- Code form owns input formatting only.
- No component owns role authority from local state.

## Data Inputs
Input: route source.
- Source: route query or navigation state.
- Use: explain why phone login opened.
- Sensitivity: low.
- Storage: memory only.

Input: intended role.
- Source: previous auth route.
- Use: route-safe claim check after provider success.
- Sensitivity: low by itself.
- Storage: session only.

Input: phone number.
- Source: user input.
- Use: provider phone verification.
- Sensitivity: personal data.
- Storage: form state only until provider accepts.

Input: verification ID.
- Source: provider.
- Use: create provider credential with code.
- Sensitivity: secret-adjacent provider state.
- Storage: memory only; secure provider state if SDK requires.

Input: one-time code.
- Source: user input or platform autofill.
- Use: provider verification.
- Sensitivity: secret.
- Storage: form state only.

Input: provider token.
- Source: provider after verification.
- Use: establish auth session and backend claim checks.
- Sensitivity: secret.
- Storage: approved auth storage only.

Input: backend claims.
- Source: decoded token and backend checks.
- Use: route by role and station scope.
- Sensitivity: operational auth data.
- Storage: approved auth session only.

## Data Outputs
Output: provider phone challenge.
- Destination: Firebase/provider SDK.
- Contains: phone number and app verification context.
- Must not contain: role grant, station ID, delivery ID, tracking code.

Output: provider code verification.
- Destination: Firebase/provider SDK.
- Contains: verification ID and code.
- Must not contain: local role grant or receiver verification token.

Output: app session state.
- Destination: auth session store.
- Contains: provider token, user ID, claims, expiry.
- Must use approved secure storage.

Output: route decision.
- Destination: navigation.
- Values: sender home/create, role-specific staff sign-in/home, role selection, support, session expired.
- Must not route to public tracking or admin console unless explicit separate path is used.

Output: telemetry.
- Destination: analytics.
- Contains: state transition, source, intended role, platform, outcome class.
- Must not contain phone, code, provider token, verification ID, user ID, station ID, delivery ID, tracking code, or raw error.

## State Machine
Initial state:
- `checking_route_context`

Transition: context valid.
- From: `checking_route_context`
- To: `enter_phone`
- Guard: source and intended role are allowed
- Action: focus phone field

Transition: context invalid.
- From: `checking_route_context`
- To: `role_mismatch`
- Guard: unsupported source, admin role, receiver route data, or unsafe query
- Action: clear unsafe query values

Transition: phone submitted.
- From: `enter_phone`
- To: `sending_code`
- Guard: valid normalized phone and online
- Action: start provider phone verification

Transition: provider needs reCAPTCHA.
- From: `sending_code`
- To: `recaptcha_required`
- Guard: provider reports web or Android fallback challenge
- Action: present provider challenge surface

Transition: code sent.
- From: `sending_code`
- To: `code_sent`
- Guard: provider sends code
- Action: mask phone and start resend timer

Transition: auto verification starts.
- From: `code_sent`
- To: `auto_verifying`
- Guard: platform/provider detects auto verification
- Action: show status while keeping manual entry available

Transition: manual entry available.
- From: `code_sent`
- To: `enter_code`
- Guard: code not auto-verified
- Action: focus code field

Transition: code submitted.
- From: `enter_code`
- To: `verifying_code`
- Guard: code length and format pass local validation
- Action: verify with provider

Transition: token received.
- From: `verifying_code` or `auto_verifying`
- To: `token_received`
- Guard: provider returns signed-in user/token
- Action: clear code field

Transition: claim check starts.
- From: `token_received`
- To: `claims_checking`
- Guard: provider token exists
- Action: read token claims and validate intended route

Transition: sender ready.
- From: `claims_checking`
- To: `sender_ready`
- Guard: intended role is sender and token role is sender
- Action: prepare sender route

Transition: staff ready.
- From: `claims_checking`
- To: `staff_ready`
- Guard: token role is allowed staff role and staff scope rules pass
- Action: prepare staff route

Transition: station missing.
- From: `claims_checking`
- To: `station_scope_missing`
- Guard: token role is station operator and no station scope exists
- Action: block station continuation

Transition: role mismatch.
- From: `claims_checking`
- To: `role_mismatch`
- Guard: token role does not match intended route
- Action: route to correct sign-in or role selection

Transition: invalid phone.
- From: `enter_phone` or `sending_code`
- To: `invalid_phone`
- Guard: local validation or provider rejects format
- Action: show phone error

Transition: invalid code.
- From: `verifying_code`
- To: `invalid_code`
- Guard: provider rejects code
- Action: clear code and focus code field

Transition: expired code.
- From: `enter_code` or `verifying_code`
- To: `expired_code`
- Guard: provider reports expired credential or local timer expires
- Action: clear code and show resend action

Transition: resend blocked.
- From: `enter_code`
- To: `resend_wait`
- Guard: user taps resend during cooldown
- Action: announce wait time

Transition: account locked.
- From: any verification state
- To: `account_locked`
- Guard: provider or auth policy returns lockout
- Action: clear code and show recovery route

Transition: offline.
- From: any network state
- To: `offline`
- Guard: no network before provider submit
- Action: keep phone in memory, clear code

## Phone Number Rules
Accepted phone input:
- Ghana local phone format.
- E.164 international format.
- Pasted phone values after normalization.
- Spaces and common separators before normalization.

Rejected phone input:
- empty value
- too short
- too long
- unsupported country if launch policy limits SMS region
- phone in query string
- phone from clipboard without user review

Phone normalization:
- Normalize to E.164 before provider submit.
- Keep visible field close to user-entered format until submit.
- After submit, show masked normalized phone.

Phone copy:
- Label: `Phone number`
- Help: `We will send a code to verify this phone. Standard SMS rates may apply.`
- Sender context help: `Use the phone you use for Kra deliveries.`
- Staff context help: `Use the phone your supervisor approved for your staff account.`

Phone error:
- `Enter a valid phone number.`
- `This phone format is not supported for SMS verification.`
- `SMS verification is not available for that region.`

## Code Entry Rules
Code field:
- Label: `Verification code`
- Help: `Enter the code sent by SMS.`
- Keyboard: numeric.
- Autocomplete: one-time code where supported.
- Length: provider-controlled, usually 4 to 8 digits.
- Input behavior: one accessible grouped field is preferred over six separate unlabeled boxes.

Code validation:
- Required.
- Numeric when provider uses numeric SMS code.
- Min and max length from provider policy.
- Do not submit while empty or too short.

Code errors:
- `Enter the full code.`
- `That code could not be verified. Try again.`
- `That code expired. Request a new one.`

Resend:
- Show resend countdown.
- Disable resend during cooldown.
- Never send repeated SMS while provider request is still active.
- Announce when resend becomes available.

Auto verification:
- If provider auto-verifies, show progress and complete without forcing manual entry.
- Keep manual entry available when auto verification is not certain.
- If app resumes from SMS, keep phone and code state stable.

## Role Routing Rules
Sender success:
- Token role: `sender`.
- Route: `/(sender)/home` or allowlisted sender `next`.
- If source is sender onboarding, route to `/(sender)/create` when product policy wants first delivery creation.
- Never route sender to staff operations.

Station operator success:
- Token role: `station_operator`.
- Required scope: `kra_station_id`.
- Route: `/(ops)/station/overview` or shared `/(ops)/home`.
- If station scope missing, show `station_scope_missing`.

Driver success:
- Token role: `driver`.
- Route: `/(ops)/driver/home` or shared `/(ops)/home`.
- No station scope required.

Courier success:
- Token role: `final_mile_courier`.
- Route: `/(ops)/courier/home` or shared `/(ops)/home`.
- No station scope required.

Role mismatch:
- If sender token appears on staff route, route to sender home or role selection.
- If staff token appears on sender route, route to role-specific staff sign-in or role selection.
- If admin token appears, sign out provider session and route to admin web sign-in guidance.
- If no role claim exists, route to permission denied or support.

## Receiver Separation Rules
Never call these from `PasswordlessPhoneLogin`:
- `request_public_tracking_phone_challenge`
- `verify_public_tracking_phone`
- delivery completion OTP mutation
- public tracking verification grant creation

Never accept these as route inputs:
- tracking code
- receiver phone
- delivery ID
- verification token
- proof reference
- public tracking grant

Receiver copy must not appear:
- `Track your package`
- `Receiver verification`
- `Delivery code`
- `Confirm delivery`
- `Proof of delivery`

If a receiver route accidentally opens this screen:
- Show `This sign-in route is for app accounts.`
- Primary action: `Open tracking`
- Secondary action: `Choose another role`
- Clear unsafe route values.

## Staff PIN Boundary
Staff `phone_pin` does not mean this screen stores or verifies PIN unless the approved provider explicitly owns that factor.

Rules:
- Do not render PIN setup.
- Do not render PIN reset.
- Do not store staff PIN.
- Do not compare staff PIN locally.
- Do not send staff PIN to public phone verification endpoints.
- Do not treat phone OTP alone as enough for staff operations if provider policy requires PIN.

If staff PIN is required after phone proof:
- Route to provider-owned staff PIN step, role-specific sign-in, or future staff auth route.
- Keep phone proof state secure.
- Require backend token or provider session validation before operations.

## Security Rules
Never store:
- one-time code
- verification ID beyond provider-required memory
- phone number in analytics
- Firebase ID token outside approved auth store
- refresh token outside approved auth store
- route `next` values without allowlist validation

Never display:
- raw provider error body
- raw token claims
- full phone number after submit
- verification ID
- token
- staff user ID
- station ID before authorized view
- receiver tracking token

Never log:
- phone number
- code
- verification ID
- provider token
- decoded token
- refresh token
- raw provider error
- route query containing secrets

Never allow:
- code retry without provider rate limits
- resend while request is pending
- sign-in success before provider token exists
- protected route access before claim checks
- role grant from client state
- station grant from client state
- receiver verification as app login
- public tracking phone verification as auth session

Required hardening:
- Clear code on invalid, expired, locked, backgrounded, or route exit states.
- Mask phone after code is sent.
- Keep phone in memory only until verification completes.
- Use provider app verification checks.
- Respect SMS region policy.
- Use generic errors to resist account enumeration.
- Sign out or clear provider session when role mismatch is unsafe.

## Privacy Rules
Phone:
- Use masking after send.
- Do not send to analytics.
- Do not include in support URLs.
- Do not include in crash breadcrumbs.

Code:
- Never expose after entry.
- Clear after failed verification.
- Clear after success.
- Clear when app backgrounds.

Route context:
- Do not include untrusted `next` in visible copy.
- Do not include route source in support URLs if it reveals private context.
- Do not preserve unsafe query values.

Claims:
- Show human-safe role labels only after verification.
- Do not show raw `kra_role`.
- Do not show raw `kra_station_id`.
- Do not show capabilities list on this screen.

## Accessibility
Screen semantics:
- One `h1` for the screen title.
- Step titles use `h2`.
- Phone and code inputs have visible labels.
- Help text is tied to inputs.
- Error messages are tied to invalid fields.
- Status changes use live regions.

Focus:
- On load, focus heading or phone field depending on platform standard.
- After `Send code`, focus code heading or code field.
- On invalid phone, focus phone field.
- On invalid code, focus code field.
- On success, focus handoff heading before route change if route is not instant.

Announcements:
- `Sending code.`
- `Code sent.`
- `Verifying code.`
- `Checking account access.`
- `Phone verified.`
- `Resend available.`
- `Verification paused while offline.`

Input purpose:
- Phone field uses telephone content type.
- Code field uses one-time code support when platform allows it.
- Do not disable paste if that harms accessibility unless security owner requires it.

Large text:
- Code entry must not clip.
- Resend timer must wrap.
- Primary button must remain reachable.
- Legal links must remain reachable.

Reduced motion:
- Replace slide transition with fade.
- Disable success pulse.
- Keep progress text visible.

## Offline And Low-Bandwidth Behavior
Offline before submit:
- Show offline banner.
- Disable `Send code`.
- Keep phone editable.
- Offer role selection and support.

Offline after code sent:
- Keep masked phone.
- Clear code field if app cannot guarantee secure retention.
- Disable verify until online.
- Keep resend timer if provider expiry is known.

Weak network:
- Show non-blocking status.
- Prevent duplicate requests.
- Keep current step stable.
- Do not clear phone on transient timeout.

App background:
- Preserve phone step if safe.
- Clear code field.
- Preserve provider in-progress flag only as required for SDK resume.

App resume:
- Check provider state.
- If provider has completed verification, continue to claim checks.
- If code is still valid, return to code entry.
- If code expired, show expired state.

## Error States
`invalid_phone`:
- Trigger: local validation or provider format rejection.
- Copy: `Enter a valid phone number.`
- Action: focus phone field.

`sms_region_blocked`:
- Trigger: provider region policy blocks destination.
- Copy: `SMS verification is not available for that region.`
- Action: support or role selection.

`provider_unavailable`:
- Trigger: Firebase/provider SDK cannot initialize.
- Copy: `Phone verification is not available right now.`
- Action: retry or support.

`recaptcha_required`:
- Trigger: provider needs web or Android fallback challenge.
- Copy: `Complete the security check to continue.`
- Action: provider challenge.

`recaptcha_failed`:
- Trigger: provider challenge fails or cannot return to app.
- Copy: `The security check could not finish. Try again.`
- Action: retry.

`invalid_code`:
- Trigger: provider rejects code.
- Copy: `That code could not be verified. Try again.`
- Action: clear and focus code field.

`expired_code`:
- Trigger: provider or local expiry.
- Copy: `That code expired. Request a new one.`
- Action: resend when allowed.

`resend_wait`:
- Trigger: user taps resend during cooldown.
- Copy: `You can request another code soon.`
- Action: countdown.

`too_many_attempts`:
- Trigger: provider rate limit.
- Copy: `Too many attempts. Wait before trying again.`
- Action: wait timer or support.

`account_locked`:
- Trigger: auth policy lockout.
- Copy: `This sign-in cannot continue right now.`
- Action: support or supervisor route based on intended role.

`role_mismatch`:
- Trigger: token role does not match intended route.
- Copy: `This account uses a different sign-in route.`
- Action: route to correct sign-in or role selection.

`station_scope_missing`:
- Trigger: station operator token lacks station scope.
- Copy: `Your station assignment is missing. Ask an admin to update your account.`
- Action: support.

`offline`:
- Trigger: network unavailable.
- Copy: `Connect to the internet to verify your phone.`
- Action: retry when online.

`api_error`:
- Trigger: unexpected provider or route guard failure.
- Copy: `Phone verification could not continue. Try again.`
- Action: retry or support.

## Copy System
Default title:
- `Verify your phone`

Default subtitle:
- `Enter the code sent by SMS to continue.`

Sender title:
- `Continue with phone`

Sender subtitle:
- `Use the phone you use for Kra deliveries.`

Staff title:
- `Verify staff phone`

Staff subtitle:
- `Use the phone approved for your staff account.`

Receiver misroute title:
- `This is not the tracking code screen`

Receiver misroute body:
- `Phone login is for Kra app accounts. Open tracking to verify a delivery link.`

Security note:
- `Verification proves phone control. Kra checks account access after that.`

Consent note:
- `You may receive an SMS for verification. Standard rates may apply.`

Generic failure:
- `Phone verification could not continue. Check the details and try again.`

Avoid:
- `No account found`
- `Phone is registered`
- `Phone is not registered`
- `Wrong user`
- `Invalid role claim`
- `Firebase error`
- `Receiver grant`
- `Delivery verified`

## Success Behavior
Sender success:
- Title: `Phone verified`
- Body: `Taking you to your sender account.`
- Route: allowlisted sender route.

Station operator success:
- Title: `Phone verified`
- Body: `Checking station access before opening station tools.`
- Route: station sign-in or station operations after claim validation.

Driver success:
- Title: `Phone verified`
- Body: `Checking driver access before opening driver tools.`
- Route: driver sign-in or driver operations after claim validation.

Courier success:
- Title: `Phone verified`
- Body: `Checking courier access before opening courier tools.`
- Route: courier sign-in or courier operations after claim validation.

Success rules:
- Clear code.
- Mask phone.
- Do not keep phone login in back stack when entering authenticated app.
- Do not show protected data on success screen.
- Do not create delivery or profile data.

## Recovery Links
Always available:
- `Choose another role`
- `Need help?`
- `Privacy`
- `Terms`

Sender-specific:
- `I cannot access this phone`
- route to sender recovery

Staff-specific:
- `Staff activation`
- `Contact supervisor`

Receiver misroute:
- `Open tracking`

Support payload:
- allowed: source, intended role, state, platform, app version
- forbidden: phone, code, token, verification ID, user ID, station ID, tracking code, delivery ID

## Analytics
Allowed events:
- `phone_login_viewed`
- `phone_login_phone_submitted`
- `phone_login_code_sent`
- `phone_login_code_submitted`
- `phone_login_auto_verified`
- `phone_login_token_received`
- `phone_login_claims_check_started`
- `phone_login_success`
- `phone_login_blocked`
- `phone_login_resend_pressed`
- `phone_login_support_opened`
- `phone_login_role_mismatch`

Allowed properties:
- `source`
- `intent`
- `intendedRole`
- `platform`
- `networkState`
- `outcome`
- `errorClass`
- `providerSurface`
- `appVersion`

Forbidden properties:
- phone
- code
- verification ID
- provider token
- refresh token
- user ID
- station ID
- tracking code
- delivery ID
- public verification token
- raw provider error

## QA Requirements
Unit tests:
- renders `screen-passwordless-phone-login`
- validates allowed source values
- rejects unsafe query values
- rejects receiver tracking route data
- validates phone format before provider submit
- masks phone after code sent
- clears code on invalid verification
- clears code on route exit
- disables resend during cooldown
- shows provider unavailable state
- shows reCAPTCHA required state
- maps sender role to sender route
- maps driver role to driver route
- maps station operator with station scope to station route
- blocks station operator without station scope
- maps courier role to courier route
- maps admin role away from mobile phone login
- does not call public tracking phone endpoints

Integration tests:
- sender sign-in opens phone login and returns to sender home
- sender onboarding opens phone login and returns to delivery start route
- station sign-in opens phone login and enforces station claim
- driver sign-in opens phone login and enforces driver claim
- courier sign-in opens phone login and enforces courier claim
- session-expired source returns to intended route only after validation
- SMS app switch keeps phone step stable
- invalid code does not reveal account existence
- rate limit shows generic wait guidance
- receiver tracking misroute opens tracking recovery instead of app auth
- support link omits sensitive values
- analytics excludes sensitive values

Accessibility tests:
- heading order is valid
- phone field has visible label
- code field has visible label
- invalid fields expose error text
- status messages are announced
- resend timer is announced when available
- large text does not clip fields
- keyboard does not hide primary action
- reduced motion avoids slide animation
- focus moves to code step after code is sent

Security tests:
- no phone in analytics
- no code in logs
- no verification ID in logs
- no provider token outside approved auth store
- no receiver tracking endpoint call
- no role grant from client state
- no station scope from query string
- no protected route before claim check
- no full phone after submit
- no raw provider error in UI

End-to-end tests:
- happy-path sender OTP reaches sender route
- happy-path staff phone verification reaches role-specific route after claims
- expired code can request a new code when allowed
- resend wait prevents duplicate SMS requests
- provider challenge failure is recoverable
- offline before submit blocks provider call
- app background clears code
- app resume continues only from provider state
- role mismatch signs out or routes safely

## Implementation Notes For Claude Code
Build this as a shared auth route, not as sender-only UI and not as receiver OTP UI.

When implementation starts later:
- Create route at `/(auth)/phone-login`.
- Add primary test ID `screen-passwordless-phone-login`.
- Use a typed phone auth provider adapter.
- Keep provider integration behind an interface.
- Keep phone and code state inside the route or auth form only.
- Use shared auth session context for token state.
- Use protected routes for authenticated app surfaces.
- Use allowlisted `next` routing.
- Add receiver-route rejection before rendering phone form.
- Add tests proving public tracking phone endpoints are never called.
- Keep provider testing configuration outside production UI logic.

Suggested provider interface:
```ts
export interface PhoneLoginProvider {
  canUsePhoneLogin(): boolean;
  startPhoneVerification(input: PhoneVerificationStartInput): Promise<PhoneVerificationStartResult>;
  verifyPhoneCode(input: PhoneCodeVerifyInput): Promise<PhoneVerificationResult>;
  getCurrentToken(): Promise<string | undefined>;
  clearTransientVerificationState(): void;
}
```

Suggested route decision type:
```ts
export type PhoneLoginRouteDecision =
  | { type: "sender"; nextRoute: string }
  | { type: "station_operator"; nextRoute: string; stationScopePresent: true }
  | { type: "driver"; nextRoute: string }
  | { type: "final_mile_courier"; nextRoute: string }
  | { type: "role_mismatch"; safeRoute: string }
  | { type: "blocked"; reason: "missing_station_scope" | "unsupported_role" | "missing_claim" };
```

Do not ship:
- route query phone login
- route query code verification
- receiver tracking phone endpoint usage
- full phone number after submit
- client-only role success
- station scope from query string
- protected route before claim check
- raw provider errors
- SMS resend without cooldown
- code persistence after backgrounding

## Performance Requirements
Initial render:
- Under `1 second` on common low-cost Android devices after bundle load.

Phone validation:
- Under `100ms`.

Step transition:
- Under `200ms`, reduced-motion friendly.

Provider submit:
- Disable duplicate submit immediately.
- Show status within `150ms`.

Resume from SMS:
- Restore the correct step within `500ms`.

Large text:
- No clipped text at 200 percent text scaling.

Low bandwidth:
- No decorative assets required for first render.
- Auth panel works without remote imagery.

## Open Product Decisions
Decision needed before full production launch:
- Whether sender phone login is entirely Firebase-managed or Kra will add backend phone auth endpoints later.
- Whether staff phone/PIN remains provider-owned or receives a dedicated staff auth service.
- Whether Ghana is the only allowed SMS region at pilot launch.
- Whether the app supports web phone login for all users or only mobile.
- Whether Android Credential Manager is used for future re-auth after successful sign-in.
- Whether biometric re-auth is allowed for staff after initial phone/PIN auth.
- Whether sender sign-up creates profile immediately after provider auth or on first delivery creation.
- Whether resend cooldown is provider-only or app-visible with backend policy.
- Whether phone number changes are sender recovery work or support-only.

## Acceptance Criteria
The spec is complete when:
- Route, test ID, state model, and route boundaries are explicit.
- Sender, staff, receiver, and admin phone-related flows are separated.
- Current backend reality is documented.
- Public tracking phone endpoints are explicitly forbidden for app login.
- Phone, code, provider token, and claim privacy rules are testable.
- Role and station authority come only from validated provider/backend state.
- Offline, app-switching, resend, lockout, provider challenge, and mismatch states are covered.
- Claude Code can implement the screen later without inventing product policy.

## Final Implementation Boundary
`PasswordlessPhoneLogin` should be a shared phone auth checkpoint, not a general identity portal.

Current implementation should:
- render the phone-login route
- support provider-managed phone verification
- keep secrets out of logs and analytics
- reject receiver tracking inputs
- route only after provider token and role checks

Future implementation may:
- add Kra-owned phone auth endpoints if the backend team creates them
- add Credential Manager re-auth after first verified sign-in
- add biometric re-auth only as a session convenience, not as a backend authorization replacement

This screen is successful only if phone verification is easy for real users and useless as a shortcut around role, station, receiver, or delivery security.
