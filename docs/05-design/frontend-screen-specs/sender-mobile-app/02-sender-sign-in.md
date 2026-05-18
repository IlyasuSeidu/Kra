# Sender Sign In Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderSignIn` |
| App | `apps/mobile` |
| Route | `/(auth)/sender/sign-in` |
| Primary test ID | `screen-sender-sign-in` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `auth` |
| Related routes | `/(sender)/onboarding`, `/(auth)/sender/recovery`, `/(sender)/home`, `/(sender)/create`, `/privacy`, `/terms` |
| Required states | `loading`, `invalid credentials`, `locked` |

## Product Job
This screen authenticates a sender by phone OTP and moves them into the sender app without leaking account state, role state, or delivery state. It must handle new sender entry and returning sender entry through the same low-friction phone flow, then route the authenticated sender to the correct next screen.

The sender should be able to:
- Enter a Ghana-friendly phone number.
- Request a one-time code.
- Enter the code with autofill support.
- Understand why the app needs the phone number.
- Recover from an incorrect code without confusion.
- Understand when too many attempts have locked the flow.
- Move to sender home or delivery creation after successful authentication.

This screen is not onboarding, full profile setup, password login, staff PIN login, admin login, receiver verification, delivery creation, payment authorization, support chat, or account recovery. Recovery has its own route and must not be folded into this screen beyond clear routing.

## Audience
Primary audience:
- First-time senders continuing from `SenderOnboarding`.
- Returning senders opening the app after sign-out or session expiry.
- Local merchants and individual senders who expect phone-first login.

Secondary audience:
- Senders who mistyped a phone number or OTP code.
- Senders whose auth attempts were rate-limited or locked.
- QA engineers validating auth privacy and navigation.
- Claude Code implementing the sender mobile auth entry.

## User State
The sender wants access quickly. They may be standing at a station, preparing a package, or trying to finish a booking before payment. They may be distracted, using mobile data, switching between SMS and the app, or unsure whether they already have an account.

The screen must:
- Keep the first field obvious.
- Avoid long explanations.
- Keep the code flow resilient after app switching.
- Avoid blame in error copy.
- Avoid telling a user whether a phone number is already registered before verification.
- Keep the route to recovery visible but not dominant.

## Primary Action
Primary CTA before code is sent:
- `Send code`

Primary CTA after code is entered:
- `Verify and continue`

Secondary action:
- `Use a different phone`

Tertiary action:
- `Need help signing in?`

CTA behavior:
- `Send code` starts the approved phone OTP challenge through the auth provider.
- `Verify and continue` verifies the OTP through the auth provider.
- `Use a different phone` clears the OTP step and returns to phone entry.
- `Need help signing in?` routes to `/(auth)/sender/recovery`.

## First Meaningful Value
For the sender auth path, first meaningful value is successful route into the sender app after identity and sender role/session state are confirmed.

Preferred destinations:
- `/(sender)/create` when the sender came from onboarding or a start-delivery CTA.
- `/(sender)/home` when the sender came from session expiry, app launch, or direct sign-in.

Rules:
- Do not drop the sender on a confirmation-only dead end.
- Do not show delivery creation before the sender auth state is valid.
- Do not create a delivery draft from the sign-in screen.
- Do not route to staff or admin areas from this screen.

## Main Tension
The screen must be fast enough for everyday use and careful enough for a trust-critical delivery product. It must guide phone OTP clearly without revealing whether a phone number is registered, whether a role exists, whether a sender has deliveries, or whether an account is locked until the auth provider authoritatively returns that state.

## Design Brief
User and job:
- A sender wants to prove phone ownership and enter the sender app.

Context of use:
- Transactional, mobile-first, interrupted by SMS, often on mobile data.

Entry point:
- Onboarding CTA, session-expired guard, app launch without session, protected sender route redirect, or recovery return.

Success state:
- Sender has a valid authenticated session and reaches the intended sender route.

Primary action:
- Send code, then verify and continue.

Navigation model:
- Auth stack screen with an internal two-step form.

Density:
- Calm and focused. One input step at a time.

Visual thesis:
- A secure phone-first entry surface that feels like a precise logistics checkpoint, not a generic login page.

Restraint rule:
- Avoid marketing content, feature lists, station detail, route maps, and policy paragraphs.

Product lens:
- Trust-critical authentication.

System stance:
- Continue the sender mobile language from onboarding while making this screen quieter and more task-focused.

Interaction thesis:
- Fast field focus, stable bottom action, SMS app-switch resilience, and clear recovery.

Signature move:
- A compact "secure entry rail" that shows two steps only: Phone and Code.

Activation event:
- Authenticated sender reaches `/(sender)/create` or `/(sender)/home`.

## Elite Quality Gate
This spec is not closed unless the resulting UI is faster than a generic phone form and safer than a generic error-driven login.

Non-negotiable quality requirements:
- The screen must support phone OTP sign-in and sign-up through the same path.
- The screen must use generic auth error copy that does not reveal whether a phone is registered.
- The screen must show locked state clearly when too many failed attempts occur.
- The screen must never expose Firebase technical errors directly.
- The screen must not ask for password, staff PIN, email, station ID, or admin role.
- The screen must not create delivery, payment, issue, station, or tracking state.
- The screen must keep primary action reachable above the keyboard.
- The screen must support OTP autofill when platform supports it.
- The screen must survive SMS app switching and return without losing the phone step.
- The screen must be accessible with screen readers, large text, high contrast, reduced motion, and hardware keyboard.
- The screen must not rely on client-only role claims for backend authorization.
- The screen must route only after token/session validation completes.

Closure rule:
- If the UI reveals whether a phone number is registered before successful phone verification, the screen remains open.
- If the keyboard hides the CTA, the screen remains open.
- If an auth provider error appears raw to the sender, the screen remains open.
- If a locked user has no recovery route, the screen remains open.
- If the screen can open sender app routes without a valid session, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, or branding to copy:

- OWASP Authentication guidance supports generic error messages, throttling, lockout discipline, and avoiding account enumeration.
- NIST SP 800-63B supports OTP authentication safeguards, reauthentication, throttling, and verifier-side controls.
- Firebase phone auth documentation explains phone number verification responsibilities and provider-driven verification behavior.
- Expo Router authentication documentation explains protected route redirects and session-aware navigation.
- Apple Human Interface Guidelines and platform text input behavior support appropriate phone keyboard, one-time code autofill, visible labels, and clear actions.
- W3C WCAG 2.2 guidance supports accessible input purpose, focus order, error identification, and target size.

Reference links:
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://firebase.google.com/docs/auth/web/phone-auth
- https://docs.expo.dev/router/advanced/authentication/
- https://developer.apple.com/design/human-interface-guidelines/text-fields
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external app screens, operating-system screenshots, code snippets, provider UI, icons, or brand assets.

## Product Assumptions
Assumptions for v1:
- Sender auth method is `phone_otp`.
- Sender session duration is `30 days` unless revoked.
- Lockout is triggered after `5` failed attempts in `15 minutes`.
- Firebase Authentication handles identity proof.
- Backend authorization resolves role and permission from verified identity claims and backend rules.
- Sender sign-up and sign-in use one phone flow.
- Receiver verification remains delivery-scoped and separate.
- Staff and admin authentication are separate flows.

If self-service sender profile creation later needs additional fields, those fields belong after successful auth, not on this screen unless a product decision changes this route.

## Non-Goals
Do not implement these in this screen:
- Sender onboarding content beyond one short reassurance line.
- Password entry.
- Staff PIN entry.
- Admin email login.
- Receiver tracking phone verification.
- Delivery creation fields.
- Station selection.
- Package details.
- Payment authorization.
- Push permission request.
- Contact import.
- Camera permission request.
- Support conversation.
- Profile editing.
- Terms acceptance wall.
- Role selection.
- Auth recovery form beyond a link.

## Route Rules
### Route
- Render at `/(auth)/sender/sign-in`.
- Must be unauthenticated-accessible.
- Must redirect authenticated senders away after session validation.
- Must not render authenticated sender tabs until auth is complete.
- Must be usable from both onboarding and protected-route redirects.

### Accepted Query Params
Allowed params:
- `intent`: `signup`, `signin`, or `continue`.
- `next`: allowlisted sender route.
- `source`: `onboarding`, `session_expired`, `protected_route`, `app_launch`, `recovery`, or `unknown`.

Rules:
- `intent` changes copy and destination emphasis only; it does not change auth security.
- `next` must be allowlisted to sender routes only.
- Unknown `next` values fall back to `/(sender)/home`.
- Do not reflect untrusted params directly into UI copy.

Forbidden params:
- `phone`
- `otp`
- `token`
- `senderId`
- `deliveryId`
- `trackingCode`
- `stationId`
- `role`
- `paymentId`
- `providerReference`
- `receiverPhone`

### Outbound Routes
Allowed:
- `/(sender)/home`
- `/(sender)/create`
- `/(auth)/sender/recovery`
- `/(sender)/onboarding`
- `/privacy`
- `/terms`

Blocked:
- Staff routes.
- Admin routes.
- Receiver private routes.
- Payment routes.
- Delivery detail routes unless a protected-route redirect supplied an allowlisted sender delivery route after auth.

## Auth Flow Model
The screen has one route and two internal steps.

Step 1:
- Phone entry.
- User enters phone number.
- User taps `Send code`.
- App starts phone OTP challenge through auth provider.

Step 2:
- OTP entry.
- User enters code.
- User taps `Verify and continue`.
- App verifies code through auth provider.
- App obtains valid ID token.
- App waits for session provider to resolve sender role/session.
- App routes to destination.

Recovery:
- User taps `Need help signing in?`.
- App routes to `/(auth)/sender/recovery`.

Locked:
- Auth provider or policy reports lockout/rate-limit state.
- App shows locked state with wait guidance and recovery route.

## Backend And Auth Authority
This screen does not own backend authorization.

Authority layers:
- Phone possession is verified by Firebase Authentication or approved auth provider.
- Role and permission are enforced by backend authenticated APIs.
- Sender app route guards rely on session provider state and backend-compatible claims.
- Delivery, payment, issue, notification, and profile data remain unavailable until authenticated.

Rules:
- Do not call `admin_upsert_user`.
- Do not call admin user APIs.
- Do not write sender role from the client.
- Do not trust a route param named `role`.
- Do not call delivery APIs before auth.
- Do not create local delivery data from auth success.
- Do not continue if token validation fails.
- Do not show staff provisioning errors on the sender screen.

If a verified phone lacks a sender role:
- Show a calm account access message after verification.
- Copy: `This phone cannot open the sender app yet. Contact support or try another phone.`
- Primary action: `Try another phone`
- Secondary action: `Get help`
- Do not reveal whether the phone belongs to a staff, admin, receiver, inactive, or unprovisioned identity.

## State Model
Required inventory states:
- `loading`
- `invalid credentials`
- `locked`

Recommended internal states:
- `phone_entry`
- `sending_code`
- `code_entry`
- `verifying_code`
- `resolving_session`
- `invalid_code_or_phone`
- `rate_limited`
- `locked`
- `offline`
- `provider_unavailable`
- `role_not_allowed`

State mapping:
- `sending_code`, `verifying_code`, and `resolving_session` map to `loading`.
- `invalid_code_or_phone` maps to `invalid credentials`.
- `rate_limited` may map to `invalid credentials` with timed retry or `locked` when policy says locked.
- `locked` maps to `locked`.
- `provider_unavailable` maps to a recoverable auth service state, not a backend error screen.

Rules:
- Keep copy generic for phone and code failures.
- Do not change title to "account not found".
- Do not show remaining attempt count unless product/security explicitly approves.
- Do not show internal lockout timestamps if precision could help abuse.
- Do not expose provider-specific codes.

## State Details
### Phone Entry
Purpose:
- Capture phone number and send OTP.

UI:
- Title.
- Short reassurance line.
- Phone input with country code support.
- Primary CTA.
- Recovery link.
- Privacy/terms links.

Copy:
- Title: `Sign in with your phone`
- Body: `Kra uses your phone to protect sender access and send delivery updates.`
- Field label: `Phone number`
- Field hint: `Enter the phone you use for deliveries`
- Primary CTA: `Send code`

Validation:
- Required.
- Must be phone-shaped.
- Must support Ghana phone formats.
- Must normalize to E.164 before auth request.
- Must not reject valid international sender numbers if product permits them.

### Sending Code
Purpose:
- Prevent duplicate challenge requests and communicate progress.

UI:
- Disable phone input.
- Button shows loading.
- Spinner or progress indicator has accessible label.

Copy:
- Button: `Sending code...`
- Status: `Sending a one-time code.`

Rules:
- Do not allow repeated rapid taps.
- Do not show raw SMS provider state.
- Do not claim SMS was delivered until provider confirms challenge creation.

### Code Entry
Purpose:
- Capture OTP and complete authentication.

UI:
- Show phone summary with edit action.
- OTP input supports code autofill.
- Primary CTA.
- Resend timer.
- Recovery link.

Copy:
- Title: `Enter your code`
- Body: `We sent a one-time code to the phone number you entered.`
- Field label: `One-time code`
- Primary CTA: `Verify and continue`
- Edit action: `Use a different phone`
- Resend action available: `Send a new code`
- Resend waiting: `You can request a new code soon.`

Rules:
- Do not show the full phone number if avoidable; use a short masked display only after the user entered it.
- Do not show a sender account name.
- Do not show delivery count.
- Do not route until verification and session resolution complete.

### Verifying Code
Purpose:
- Confirm identity and resolve session.

UI:
- Keep OTP field visible.
- Disable CTA.
- Show progress in button or status line.

Copy:
- Button: `Verifying...`
- Status: `Checking the code.`

Rules:
- Do not clear the code until provider rejects or accepts.
- If app switches back from SMS, keep focus behavior predictable.
- If verification succeeds, transition to session resolving.

### Resolving Session
Purpose:
- Convert verified auth into app route access.

UI:
- Full-screen or inline loading only if longer than `400ms`.
- Keep screen stable.

Copy:
- Status: `Opening your sender account.`

Rules:
- Do not show sender home early.
- Do not show create delivery early.
- Do not expose role-guard internals.

### Invalid Credentials
Purpose:
- Recover from incorrect phone, incorrect code, expired code, or rejected challenge without revealing account state.

Copy:
- Error title: `We could not verify that code.`
- Error body: `Check the code and try again, or request a new one.`
- Phone-step generic error: `We could not send a code to that phone right now. Check the number and try again.`

Rules:
- Do not say `phone not registered`.
- Do not say `account exists`.
- Do not say `wrong password`.
- Do not say `user disabled`.
- Do not say `Firebase`.
- Do not expose raw error codes.
- Keep field values unless security policy requires clearing them.

### Locked
Purpose:
- Stop repeated attempts and provide safe recovery.

Trigger:
- Policy reports lockout after failed attempts.
- Auth provider reports equivalent lockout or too-many-requests state.

Copy:
- Title: `Sign-in is temporarily locked`
- Body: `There were too many attempts. Wait before trying again, or use account recovery if you need help.`
- Primary action: `Go to recovery`
- Secondary action: `Try another phone`

Rules:
- Do not show exact remaining attempts.
- Show wait time only when provided by the auth layer and safe to display.
- Do not allow resend while locked.
- Do not allow verification retry while locked.
- Recovery route must be visible.

### Offline
Purpose:
- Explain that phone sign-in needs network.

Copy:
- Title: `Connection needed`
- Body: `Phone sign-in needs a network connection. Check your connection and try again.`
- CTA: `Try again`

Rules:
- Do not turn offline into invalid credentials.
- Preserve entered phone number locally in memory.
- Do not persist phone number after app close.

### Provider Unavailable
Purpose:
- Handle auth service outage without blame.

Copy:
- Title: `Sign-in is not available right now`
- Body: `The phone sign-in service is taking too long. Try again in a few minutes.`
- CTA: `Try again`
- Secondary: `Get help`

Rules:
- Do not mention internal vendor names.
- Do not retry in a tight loop.
- Do not route to sender app.

## Information Architecture
Screen order:
1. Auth header.
2. Secure entry rail.
3. Step title.
4. Step body.
5. Input group.
6. Error or status region.
7. Primary action.
8. Secondary action.
9. Recovery link.
10. Policy links.

First viewport:
- Product mark.
- `Sender sign-in`
- Current step.
- Input.
- Primary CTA.
- Recovery link.

Below first viewport only if needed:
- Short why-phone explanation.
- Policy links.

Do not add:
- Feature carousel.
- Route coverage content.
- Delivery status content.
- Station cards.
- Pricing tables.
- Payment copy beyond auth relevance.

## Layout Blueprint
### Phone Baseline
Target widths:
- `320px`
- `360px`
- `393px`
- `430px`

Keyboard-safe layout:
- Use keyboard-aware scroll behavior.
- Keep active field visible.
- Keep primary CTA visible or immediately reachable above keyboard.
- If bottom dock is used, it must move above keyboard.
- Do not rely on a footer that disappears behind keyboard.

Safe areas:
- Respect top safe area.
- Respect bottom gesture area.
- Use scroll inset for policy links and recovery link.

### Structure
Top area:
- Back affordance if route has history.
- Kra mark.
- Screen title.

Core card:
- One elevated auth surface.
- Secure entry rail at top of the surface.
- Current step content.
- Input.
- Error/status.
- CTA.

Footer:
- Recovery link.
- Privacy and terms links.

### Visual Hierarchy
Primary:
- Current auth step title.
- Active input.
- Primary CTA.

Secondary:
- Why-phone reassurance.
- Step rail.
- Recovery link.

Tertiary:
- Policy links.
- Back to onboarding.

Rules:
- Use one main surface.
- Do not place phone and OTP inputs on screen at the same time unless OTP step includes a compact phone summary.
- Do not visually compete with the CTA.

## Component Contract
### `SenderSignInScreen`
Responsibilities:
- Manage auth step state.
- Validate phone format before challenge request.
- Start OTP challenge.
- Verify OTP.
- Resolve session.
- Route after success.
- Render inventory states.
- Emit safe analytics.
- Handle offline and provider unavailable states.

Dependencies:
- Auth provider.
- Session provider.
- Router.
- Network status provider.
- Secure in-memory challenge state.
- Analytics client.
- Haptics utility only if available.

Must not depend on:
- Delivery APIs.
- Payment APIs.
- Station APIs.
- Issue APIs.
- Admin user APIs.
- Notification feed APIs.

### `AuthHeader`
Purpose:
- Orient user inside sender auth.

Content:
- Back action.
- Kra mark.
- Title: `Sender sign-in`

Rules:
- Back goes to onboarding or prior safe route.
- Back must not reveal a protected route.
- Do not show sender avatar.
- Do not show notifications.

### `SecureEntryRail`
Purpose:
- Show progress without creating a long wizard.

Steps:
- `Phone`
- `Code`

States:
- `current`
- `complete`
- `pending`
- `locked`

Rules:
- Do not add account or profile steps.
- Do not animate heavily.
- Must be accessible as text.

### `PhoneNumberForm`
Purpose:
- Capture phone and request code.

Elements:
- Field label.
- Country code selector or fixed Ghana prefix depending product decision.
- Phone number input.
- Validation message.
- Primary CTA.

Keyboard:
- Phone keypad.
- `textContentType` or platform equivalent for telephone number.
- Autofill support where available.

Rules:
- Field label must remain visible when typing.
- The field must not use only hint text as label.
- The field must normalize formatting without fighting user input.
- The field must prevent accidental double send.

### `OtpCodeForm`
Purpose:
- Capture OTP and verify.

Elements:
- Masked phone summary.
- Edit phone action.
- Code input.
- Resend area.
- Primary CTA.

Keyboard:
- Numeric input.
- One-time code content type/autocomplete where available.
- Paste support.

Rules:
- Accept pasted codes if length and format match.
- Trim spaces automatically.
- Do not auto-submit before code length is complete unless product QA approves.
- Auto-focus can occur when entering step, but must not trap screen reader users.

### `AuthStatusMessage`
Purpose:
- Announce loading, error, locked, and offline states.

Types:
- `info`
- `error`
- `warning`
- `locked`

Rules:
- Use `aria-live` equivalent when supported.
- Error region must be associated with the input.
- Do not depend on color alone.
- Keep messages short.

### `AuthActionDock`
Purpose:
- Keep action stable above keyboard.

Content:
- Primary CTA.
- Secondary action if applicable.

Rules:
- One dominant button only.
- Secondary action text link below or beside, depending width.
- Button must remain large enough for touch.

### `AuthPolicyLinks`
Purpose:
- Provide legal routes without cluttering auth.

Links:
- `Privacy`
- `Terms`

Rules:
- Keep links in footer.
- Do not require opening them to sign in.
- Opening policy links must preserve auth step state on return where safe.

## Exact Copy
### Shared Header
Screen title:
- `Sender sign-in`

Security line:
- `Phone OTP protects sender access.`

### Phone Step
Title:
- `Sign in with your phone`

Body:
- `Kra uses your phone to protect sender access and send delivery updates.`

Field label:
- `Phone number`

Field helper:
- `Use the phone number you use for deliveries.`

Primary CTA:
- `Send code`

Secondary link:
- `Need help signing in?`

### Sending Code
Button:
- `Sending code...`

Status:
- `Sending a one-time code.`

### Code Step
Title:
- `Enter your code`

Body:
- `We sent a one-time code to the phone number you entered.`

Phone edit:
- `Use a different phone`

Field label:
- `One-time code`

Field helper:
- `Enter the code from SMS.`

Primary CTA:
- `Verify and continue`

Resend ready:
- `Send a new code`

Resend waiting:
- `You can request a new code soon.`

### Verifying
Button:
- `Verifying...`

Status:
- `Checking the code.`

### Resolving Session
Status:
- `Opening your sender account.`

### Invalid Credentials
Code error:
- `We could not verify that code. Check the code and try again, or request a new one.`

Phone send error:
- `We could not send a code to that phone right now. Check the number and try again.`

Expired code:
- `That code can no longer be used. Request a new code to continue.`

### Locked
Title:
- `Sign-in is temporarily locked`

Body:
- `There were too many attempts. Wait before trying again, or use account recovery if you need help.`

Primary CTA:
- `Go to recovery`

Secondary CTA:
- `Try another phone`

### Offline
Title:
- `Connection needed`

Body:
- `Phone sign-in needs a network connection. Check your connection and try again.`

CTA:
- `Try again`

### Provider Unavailable
Title:
- `Sign-in is not available right now`

Body:
- `The phone sign-in service is taking too long. Try again in a few minutes.`

CTA:
- `Try again`

Secondary:
- `Get help`

### Role Not Allowed
Title:
- `This phone cannot open the sender app yet`

Body:
- `Contact support or try another phone.`

Primary:
- `Try another phone`

Secondary:
- `Get help`

### Footer
Policy text:
- `By continuing, you agree to Kra's Terms and Privacy Policy.`

Links:
- `Terms`
- `Privacy`

## Copy Rules
Use:
- `phone`
- `one-time code`
- `sender`
- `sign in`
- `continue`
- `recovery`
- `temporarily locked`

Avoid:
- `password`
- `PIN`
- `admin`
- `staff`
- `MFA`
- `Firebase`
- `provider error`
- `user disabled`
- `account not found`
- `no account`
- `registered`
- `unregistered`
- `wrong account`
- `role claim`
- `token`

Tone:
- Calm.
- Direct.
- Short.
- Accountable.
- Security-aware without sounding punitive.

## Visual System Direction
### Overall Style
The sign-in surface should be quieter than onboarding. It should feel secure, fast, and phone-native.

Visual keywords:
- Secure.
- Precise.
- Clean.
- Warm.
- Minimal.
- Native-plus.

Do not make it:
- Feature-heavy.
- Playful.
- Corporate admin.
- Crypto-like.
- Neon.
- Error-led.

### Color Tokens
Use existing sender mobile tokens when available.

Recommended semantic usage:
- `surface.base`: warm off-white.
- `surface.auth`: clean raised surface.
- `ink.primary`: near-black.
- `ink.secondary`: readable muted slate.
- `accent.primary`: route green.
- `accent.security`: deep navy.
- `state.error`: only for field errors.
- `state.warning`: locked state.
- `state.info`: loading and SMS guidance.

Rules:
- Do not show red in normal state.
- Locked state may use warning color but must not feel catastrophic.
- Disabled state must remain readable.
- Field borders must meet contrast requirements.

### Typography
Hierarchy:
- Title: `28-34px` equivalent.
- Body: `15-17px`.
- Field label: `14-16px`, medium.
- Input value: `20-24px`, optimized for phone number/code reading.
- Error: `14-15px`, readable.
- Button: `16-17px`, medium or bold.

Rules:
- Keep phone number legible.
- OTP input can use tabular numerals.
- Avoid tiny helper text.
- Never use hint text as the only label.

### Spacing
Use consistent spacing:
- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Rules:
- Keep input and CTA close enough to feel connected.
- Leave enough space between error and CTA so errors are not missed.
- Keep footer links away from primary CTA.
- Avoid crowded keyboard-open layouts.

### Surfaces
Use:
- One main auth surface.
- Light background depth.
- Soft radius.
- Minimal shadow.
- Clear focus ring.

Avoid:
- Nested panels.
- Multiple cards for one form.
- Badge clusters.
- Heavy illustrations.
- Full-screen brand art.

## Input Design
### Phone Field
Requirements:
- Visible label.
- Country prefix support.
- Numeric keyboard.
- Format while typing if it does not fight input.
- E.164 normalization before auth request.
- Error association for accessibility.

Validation timing:
- Do not show format error before user interacts.
- Show required error on submit if empty.
- Show format error after blur or submit.
- Do not call auth provider until local phone validation passes.

Suggested local errors:
- Empty: `Enter your phone number.`
- Invalid format: `Enter a valid phone number.`

### OTP Field
Requirements:
- Visible label.
- Numeric keyboard.
- One-time code autofill.
- Paste support.
- Clear error association.
- No auto-clear on invalid code unless provider requires it.

Validation timing:
- Show required error on submit if empty.
- Show length error only after submit or full interaction.
- Do not show account-state errors.

Suggested local errors:
- Empty: `Enter the code from SMS.`
- Incomplete: `Enter the complete code.`

### Masked Phone Summary
Purpose:
- Let the sender confirm destination phone without leaking full value unnecessarily.

Format:
- Show country code and last two or four digits only where feasible.
- Include edit action.

Rules:
- Do not expose full phone in screenshots by default.
- If platform accessibility needs full context, consider a screen-reader label that remains safe for the device owner. Security review must approve.

## Loading Rules
Loading can happen during:
- Sending code.
- Verifying code.
- Resolving session.
- Retrying after temporary provider error.

Behavior:
- Disable the active primary CTA.
- Keep other safe navigation available unless it would break auth state.
- Show inline status.
- Keep current input visible.
- Do not use full-page spinner unless session resolving exceeds `400ms`.

Timeout:
- If sending or verifying takes too long, show provider unavailable state.
- Do not retry automatically more than once without user action.
- Do not clear form on timeout.

## Lockout And Rate Limit Rules
Policy:
- Lockout after `5` failed attempts in `15 minutes`.

UI behavior:
- Display locked state when auth layer returns locked or too-many-attempts signal.
- Disable code verification and resend while locked.
- Provide recovery route.
- Provide safe try-another-phone action if policy allows.

Copy safety:
- Do not say how many attempts remain.
- Do not reveal whether the phone number exists.
- Do not show precise lockout mechanics beyond a safe wait message.

If a retry time is available:
- Safe text: `Try again later, or use recovery if this is urgent.`
- Optional safe countdown only if security owner approves.

## Recovery Boundary
Recovery route:
- `/(auth)/sender/recovery`

This screen may link to recovery but must not implement it.

Recovery link appears:
- On phone entry.
- On OTP entry.
- In locked state.
- In provider unavailable state.
- In role not allowed state.

Recovery link copy:
- `Need help signing in?`
- In locked state: `Go to recovery`

Rules:
- Do not ask recovery questions on sign-in.
- Do not collect name, ID, documents, or support details here.
- Do not promise immediate unlock.

## Privacy And Security Rules
Privacy:
- Do not persist phone number after auth step except through the auth provider/session layer.
- Do not store OTP.
- Do not log OTP.
- Do not include phone or OTP in analytics.
- Do not include phone or OTP in crash reports.
- Do not put phone or OTP in route params.
- Do not copy OTP to clipboard.
- Do not prefill OTP from clipboard without explicit platform-safe behavior.

Security:
- Use auth provider verification.
- Use backend-compatible session guard after auth.
- Do not trust local storage as auth.
- Do not let route params decide role.
- Do not expose raw provider errors.
- Do not reveal account existence.
- Do not continue if role is not sender.

Enumeration safety:
- Phone send failures must be generic.
- OTP failures must be generic.
- Role mismatch after verified phone can be shown as inability to open sender app, not as a detailed role disclosure.

## Analytics
Allowed events:
- `sender_sign_in_viewed`
- `sender_sign_in_phone_submitted`
- `sender_sign_in_code_sent`
- `sender_sign_in_code_submit_tapped`
- `sender_sign_in_verified`
- `sender_sign_in_failed`
- `sender_sign_in_locked_shown`
- `sender_sign_in_recovery_tapped`
- `sender_sign_in_resend_tapped`
- `sender_sign_in_phone_edit_tapped`

Required fields:
- `screenId`
- `route`
- `intent`
- `source`
- `platform`
- `appVersion`
- `step`
- `result`

Forbidden fields:
- Phone number.
- OTP.
- Token.
- Sender ID.
- Delivery ID.
- Tracking code.
- Station ID.
- Payment ID.
- Provider reference.
- Precise failure code.

Analytics rules:
- Fire view once per screen session.
- Fire submit tap before async request.
- Fire success only after session route is confirmed.
- Fire failed with normalized category only: `invalid`, `locked`, `offline`, `unavailable`, `not_allowed`.
- Do not block UI on analytics.

## Accessibility Requirements
Structure:
- One main heading.
- Field labels visible.
- Error messages associated with fields.
- Status messages announced.
- Focus order matches visual order.

Screen reader:
- Announce step changes.
- Announce loading status.
- Announce locked state.
- Do not read decorative security rail as separate shapes.
- Read the rail as `Step 1 of 2, Phone` or `Step 2 of 2, Code`.

Keyboard:
- Return key should submit when valid enough.
- Hardware keyboard tab order must be logical.
- Backspace behavior in OTP field must be predictable.

Touch:
- All actions at least `44x44` effective points.
- Primary CTA at least `52` height.
- Text links have padded hit zones.

Large text:
- Form must scroll.
- Button text must not clip.
- OTP field must remain usable.
- Footer can move below fold, but recovery link must remain reachable.

Motion:
- Step transitions can fade/slide slightly.
- Reduced motion disables slide movement.
- Loading indicator must not be motion-only.

## Mobile Platform Behavior
### iOS
- Use telephone keyboard for phone.
- Use one-time code content type for OTP.
- Support SMS code autofill.
- Keep CTA above keyboard.
- Respect safe area.
- Use native press feedback.

### Android
- Use phone input keyboard.
- Use SMS autofill or app-supported one-time code handling if implemented.
- Respect gesture navigation.
- Use ripple or equivalent press feedback.
- Back button from OTP step returns to phone entry after confirmation only if code challenge can safely be discarded.

### Shared
- Support paste into OTP field.
- Preserve step state during app switch to SMS.
- Do not lose step state on short backgrounding.
- Clear sensitive challenge state after success, cancellation, or expiry.

## Offline And Weak Network Behavior
Offline:
- Phone entry renders.
- `Send code` shows offline state if tapped without connection.
- OTP verification shows offline state if tapped without connection.
- Entered phone remains in memory.
- OTP remains in memory only for current visible session.

Weak network:
- Show loading for async work.
- Use timeout copy if auth service does not respond.
- Avoid repeated automatic retries.
- Keep recovery route visible.

Do not:
- Store queued auth attempts.
- Verify OTP later from offline queue.
- Claim code was sent when it was not.

## Navigation Outcomes
Successful auth:
- Resolve intended destination.
- Clear OTP challenge state.
- Navigate with replace, not push, to prevent back navigation into verified code screen.

Destination rules:
- `intent=signup` and no safer `next`: route to `/(sender)/create`.
- `intent=signin` and no safer `next`: route to `/(sender)/home`.
- `intent=continue` and allowed `next`: route to `next`.
- Session-expired source with valid `next`: route to `next`.
- Unknown or unsafe next: route to `/(sender)/home`.

Back behavior:
- From phone entry, back returns to onboarding or previous safe screen.
- From code entry, back first asks whether to use a different phone only if challenge state would be lost.
- Back must not route into protected sender screens without auth.

## Backend Alignment
This screen aligns with:
- `packages/shared/src/domain/auth-policy.ts`
- `docs/08-security/authentication-flows.md`
- `docs/05-design/frontend-screen-inventory.md`
- `services/api/src/auth.ts`
- `services/api/src/routes.ts`

Relevant facts:
- Sender auth method is `phone_otp`.
- Sender session TTL is `30 days`.
- Lockout policy is `5` failed attempts in `15 minutes`.
- Backend APIs are authenticated and enforce access.
- Sender delivery routes must require authenticated sender access.

Backend gaps to respect:
- There is no public self-service sender profile endpoint in the route inventory yet.
- Client must not use admin user APIs for sender sign-up.
- Any future sender profile creation must be explicitly specified before UI implementation.

Implementation decision:
- Treat phone auth success as identity proof only.
- Treat sender app access as granted only after session provider confirms sender-compatible auth state.

## Error Mapping
Use normalized UI categories.

| Source condition | UI category | User copy |
| --- | --- | --- |
| Empty phone | local validation | `Enter your phone number.` |
| Invalid phone format | local validation | `Enter a valid phone number.` |
| Send rejected | invalid credentials | `We could not send a code to that phone right now. Check the number and try again.` |
| Empty OTP | local validation | `Enter the code from SMS.` |
| Incomplete OTP | local validation | `Enter the complete code.` |
| OTP rejected | invalid credentials | `We could not verify that code. Check the code and try again, or request a new one.` |
| OTP expired | invalid credentials | `That code can no longer be used. Request a new code to continue.` |
| Too many attempts | locked | `There were too many attempts. Wait before trying again, or use account recovery if you need help.` |
| Offline | offline | `Phone sign-in needs a network connection. Check your connection and try again.` |
| Auth timeout | unavailable | `The phone sign-in service is taking too long. Try again in a few minutes.` |
| Role not allowed | not allowed | `This phone cannot open the sender app yet. Contact support or try another phone.` |

Rules:
- Do not display raw source condition names.
- Do not display stack traces.
- Do not display provider codes.
- Do not display backend route names.

## Implementation Notes For Claude Code
Build only the sender sign-in route and local auth-entry components.

Expected implementation files later:
- Route file for `/(auth)/sender/sign-in`.
- Component for phone number form.
- Component for OTP form.
- Component for auth status message.
- Component for secure entry rail.
- Component for action dock.
- Tests for navigation, validation, loading, invalid credentials, locked, offline, and accessibility.

Do not implement:
- Sender recovery route.
- Onboarding route.
- Delivery creation route.
- Auth provider setup.
- Backend auth service.
- Admin user management.
- Staff sign-in.
- Receiver phone challenge.

Testing requirements:
- Phone field validates required state.
- Phone field validates format.
- Send code enters loading state.
- OTP step renders after challenge success.
- OTP invalid state is generic.
- Locked state disables resend and verification.
- Recovery route is reachable.
- Safe next route allowlist works.
- Unsafe next route falls back.
- No sensitive values are emitted in analytics.
- Keyboard-open layout keeps CTA usable.

## Test IDs
Primary:
- `screen-sender-sign-in`

Recommended child IDs:
- `sender-sign-in-header`
- `sender-sign-in-secure-entry-rail`
- `sender-sign-in-phone-form`
- `sender-sign-in-phone-input`
- `sender-sign-in-send-code-button`
- `sender-sign-in-code-form`
- `sender-sign-in-code-input`
- `sender-sign-in-verify-button`
- `sender-sign-in-use-different-phone`
- `sender-sign-in-resend-code`
- `sender-sign-in-status-message`
- `sender-sign-in-locked-state`
- `sender-sign-in-recovery-link`
- `sender-sign-in-policy-links`

Test ID rules:
- Stable.
- Lowercase kebab case.
- No dynamic values.
- No phone, OTP, token, or route-param values.

## QA Acceptance Criteria
Route:
- The screen renders at `/(auth)/sender/sign-in`.
- The root has test ID `screen-sender-sign-in`.
- Authenticated sender redirects after session validation.
- Unauthenticated sender can view the phone step.

Phone step:
- Phone input has visible label.
- Primary CTA is `Send code`.
- Empty phone shows local validation.
- Invalid format shows local validation.
- Valid phone starts challenge.
- Loading state disables duplicate send.

Code step:
- Code input has visible label.
- OTP autofill configuration exists where platform supports it.
- Primary CTA is `Verify and continue`.
- Invalid code shows generic error.
- Expired code offers resend.
- `Use a different phone` returns to phone step.

Locked:
- Lockout state renders.
- Verification and resend are disabled.
- Recovery route is visible.
- Copy does not show remaining attempts.

Navigation:
- Success from onboarding intent routes to `/(sender)/create`.
- Success from signin intent routes to `/(sender)/home`.
- Safe `next` route is honored.
- Unsafe `next` route is ignored.
- Back cannot expose protected sender routes.

Security:
- No phone or OTP appears in route params.
- No phone or OTP appears in analytics.
- Raw provider errors are never rendered.
- Client does not call admin user APIs.
- Client does not call delivery APIs before auth.

Accessibility:
- Screen reader announces step title and errors.
- Error messages are linked to fields.
- CTA remains usable with large text and keyboard open.
- Touch targets meet minimum size.
- Reduced motion disables step slide.

Offline:
- Offline state appears on submit without connection.
- Field input remains available.
- No offline auth queue is created.

## Visual QA Checklist
Founder lens:
- Does this feel secure enough for a delivery network?
- Does the path to sender access feel fast?
- Is the screen more specific than a generic phone login?

Skeptical sender lens:
- Do I know why my phone is needed?
- Can I recover if the code does not work?
- Can I see what to do while locked?

Operator lens:
- Does the UI avoid unsupported account and role claims?
- Does it avoid creating delivery state during auth?
- Does it respect lockout policy?

Accessibility lens:
- Can a screen reader user complete the flow?
- Can a large-text user complete the flow?
- Can a keyboard user complete the flow?

Security lens:
- Does copy avoid account enumeration?
- Are sensitive values excluded from navigation and analytics?
- Are raw provider errors hidden?

Creative director lens:
- Is the secure entry rail useful and restrained?
- Is the form calm rather than sterile?
- Does the screen preserve the Kra sender visual language?

## Build Boundaries
In scope:
- Sender sign-in route.
- Phone input.
- OTP input.
- Loading states.
- Invalid credentials state.
- Locked state.
- Recovery link routing.
- Safe next route handling.
- Safe analytics.
- Accessibility and keyboard handling.

Out of scope:
- Auth provider configuration.
- Backend auth implementation.
- Sender recovery implementation.
- Sender profile creation.
- Delivery draft creation.
- Station selection.
- Payment flows.
- Tracking flows.
- Staff sign-in.
- Admin sign-in.
- Receiver verification.

## Open Decisions
No blocking product decisions remain for this screen.

Implementation-time decisions:
- Exact phone country selector pattern.
- Exact phone masking format after OTP challenge starts.
- Whether OTP uses one grouped field or split visual cells.
- Whether safe countdown is displayed for resend timing.
- Final typography and color token values.

These must not change security behavior, route behavior, or backend authority.

## Definition Of Done
This screen is done when:
- It renders at the inventory route.
- It uses the inventory test ID.
- It supports phone OTP auth.
- It shows loading, invalid credentials, and locked states.
- It avoids account enumeration.
- It excludes phone and OTP from route params and analytics.
- It routes only after validated auth/session state.
- It does not call delivery, payment, station, issue, or admin APIs.
- It remains keyboard-safe on small phones.
- It supports autofill, paste, large text, screen reader, high contrast, and reduced motion.
- It sends users to recovery when locked or blocked.
- It feels like a serious Kra sender app auth entry, not a generic login form.

