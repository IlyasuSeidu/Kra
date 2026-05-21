# Staff Account Activation Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StaffAccountActivation` |
| App | `apps/mobile` primary, `apps/web` deep-link fallback |
| Route | `/(auth)/staff/activate` |
| Primary test ID | `screen-staff-account-activation` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 staff launch readiness |
| Backend dependency | Firebase authentication, bearer token verification, `AuthPrincipal`, `kra_role`, `kra_station_id`, shared auth policy, admin-created staff records, future staff activation contract |
| Related routes | `/(auth)/role-selection`, `/(auth)/station/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/courier/sign-in`, `/(auth)/phone-login`, `/(auth)/session-expired`, `/invite/:inviteToken`, `/support`, `/privacy`, `/terms` |
| Required states | `ready`, `checking_route_context`, `activation_unavailable`, `provider_unavailable`, `enter_phone`, `enter_activation_code`, `verifying_code`, `set_pin`, `confirm_pin`, `role_resolved`, `station_scope_required`, `success`, `expired_code`, `invalid_code`, `too_many_attempts`, `account_locked`, `already_active`, `not_provisioned`, `not_authorized`, `offline`, `api_error` |

## Product Job
`StaffAccountActivation` is the controlled first-run doorway for provisioned station operators, drivers, and final-mile couriers.

The screen answers:
- `Can I activate the staff account my supervisor created?`
- `Which credential do I need before I can start work?`
- `Why can I not choose my role or station here?`
- `What happens if my phone, code, or PIN cannot be verified?`
- `Where do I continue after activation succeeds?`
- `What should I do when activation is not yet available in the current backend?`

The staff member should be able to:
- Enter the provisioned phone number when the approved provider supports activation.
- Enter an activation code only after backend or provider policy requests it.
- Set a staff PIN only through an approved secure provider or future activation endpoint.
- See the resolved role after verification, not before.
- See station assignment only when backend claims or activation policy confirm it.
- Continue to station, driver, or courier sign-in after activation.
- Contact a supervisor or support when the account is missing, locked, expired, or outside scope.
- Return to role selection without granting access.

This screen is not:
- A staff self-registration page.
- A role picker that grants access.
- A station selector.
- An admin user creation form.
- A PIN reset flow unless a future backend endpoint explicitly supports it.
- A sender sign-up flow.
- A receiver account flow.
- A way to call admin-only user mutation routes.
- A way to create backend role claims from client input.
- A way to reveal whether a phone number exists before safe verification.

## Strategic Role
Kra depends on field staff operating under strict identity, role, station, and custody boundaries. A staff account can move parcels, accept handoffs, create evidence, and affect customer trust. Activation must therefore feel simple to a worker while remaining strict enough for audit, fraud prevention, and loss prevention.

Core principle:
- A supervisor or super admin provisions the staff record.
- Activation proves control of the approved credential.
- Backend and provider controls decide whether the account becomes usable.
- Backend token claims decide role and station scope after sign-in.
- The UI only guides the staff member through the approved path.

This screen must resist a common product mistake: treating activation as a friendly form where a worker can choose who they are. In Kra, field identity is operational authority. The screen may help the worker finish credential setup, but it cannot grant role, station, or package authority.

## Audience
Primary users:
- station operators starting their first station shift
- drivers starting their first intercity run
- final-mile couriers starting their first doorstep route

Secondary users:
- supervisors guiding staff by phone
- support agents helping with activation friction
- super admins verifying launch readiness
- QA validating staff onboarding boundaries
- security reviewers checking credential handling
- Claude Code implementing the frontend later

Non-users:
- public visitors
- senders
- receivers
- payment providers
- SMS providers
- automated backend jobs

## Context Of Use
The screen may appear when:
- a staff member taps an invite continuation link
- a staff member selects `Activate staff account` from role selection
- a role-specific sign-in screen routes the user here after first-run friction
- a supervisor tells a staff member to activate before a shift
- a shared station device has no current staff session
- the app cannot restore a staff session and needs a safe first-run route

The staff member may be:
- in a noisy station
- standing at a counter with customers waiting
- in a vehicle before pickup
- using a low-cost Android phone
- sharing a station-owned device
- on weak mobile data
- unsure whether they are a driver or courier
- worried that activation failure will block work
- using large text settings

Design must favor:
- one task per step
- strong feedback after each submit
- no account enumeration
- low cognitive load
- field-safe recovery
- fast return to the correct sign-in screen
- clear supervisor handoff when technology cannot complete activation

## Current Backend Reality
There is no current dedicated staff activation endpoint.

Missing endpoints:
- no `POST /v1/auth/staff/activation/start`
- no `POST /v1/auth/staff/activation/verify`
- no `POST /v1/auth/staff/pin/set`
- no `POST /v1/auth/staff/pin/reset`
- no `GET /v1/auth/staff/activation/:activationId`
- no staff activation audit endpoint exposed to frontend

Implemented related capabilities:
- backend verifies Firebase bearer tokens
- `AuthPrincipal.role` is derived from `kra_role`
- `AuthPrincipal.stationId` is derived from `kra_station_id`
- capabilities are derived from the shared permission matrix
- staff roles use `phone_pin` auth policy
- sender uses `phone_otp`
- admin roles use `email_password_mfa`
- staff mobile session TTL is `12 hours`
- staff lockout occurs after `5` failed attempts inside `15 minutes`
- `POST /v1/admin/users` creates or updates a user record
- `POST /v1/admin/users/:id/access` changes user role, status, and station scope
- station operators require a station scope
- sender and admin roles cannot receive station scope
- super admins cannot change their own role or activation state

Therefore current v1 behavior:
- Do not call any non-existent activation endpoint.
- Do not call admin user mutation routes from this screen.
- Do not create a staff record from this screen.
- Do not set or store a staff PIN locally.
- Do not grant a role from a selected card.
- Do not let a station operator choose a station.
- Use this screen as a safe activation doorway and provider handoff.
- If provider activation is unavailable, show `activation_unavailable`.
- Route staff to the correct sign-in surface after safe guidance.
- Route admins to `/admin/sign-in`.
- Route senders and receivers back to non-staff auth surfaces.

## Future Backend Contract Required
A complete staff activation flow requires backend support before full in-app activation can ship.

Required future start endpoint:
```http
POST /v1/auth/staff/activation/start
```

Minimum future start request:
```json
{
  "phone": "+233241234567",
  "inviteToken": "redacted-route-token",
  "deviceContext": {
    "platform": "android",
    "appVersion": "1.0.0",
    "locale": "en-GH"
  }
}
```

Minimum future start response:
```json
{
  "activationId": "ACT-20260521-001",
  "status": "code_sent",
  "deliveryMethod": "sms",
  "expiresAt": "2026-05-21T12:10:00.000Z",
  "resendAvailableAt": "2026-05-21T12:01:00.000Z"
}
```

Required future verify endpoint:
```http
POST /v1/auth/staff/activation/verify
```

Minimum future verify request:
```json
{
  "activationId": "ACT-20260521-001",
  "code": "123456"
}
```

Minimum future verify response:
```json
{
  "status": "verified",
  "role": "station_operator",
  "stationId": "ST-ACC-01",
  "pinSetupRequired": true,
  "pinSetupToken": "redacted-short-lived-token"
}
```

Required future PIN setup endpoint:
```http
POST /v1/auth/staff/pin/set
```

Minimum future PIN setup request:
```json
{
  "pinSetupToken": "redacted-short-lived-token",
  "pin": "redacted",
  "confirmPin": "redacted"
}
```

Minimum future PIN setup response:
```json
{
  "status": "active",
  "nextRoute": "/(auth)/station/sign-in"
}
```

Future endpoint requirements:
- The activation code must expire.
- The activation code must be one-use.
- The activation code must be generated server-side.
- The activation code must be stored hashed server-side.
- The PIN must never be returned to the client.
- The PIN must never be logged.
- The PIN setup token must be short-lived.
- Verification must be rate limited.
- Resend must be rate limited.
- Account existence errors must be generic before safe verification.
- Activation must write audit records.
- Activation must not bypass role claims.
- Activation must not bypass station scope checks.
- Activation must notify the staff member or supervisor when credentials are changed.
- Station scope must come from backend staff record or custom claim only.

## Source References
External references used for this screen:
- [Firebase Android phone authentication](https://firebase.google.com/docs/auth/android/phone-auth): supports phone verification, Play Integrity, and reCAPTCHA fallback behavior for Android staff activation.
- [Firebase web phone authentication](https://firebase.google.com/docs/auth/web/phone-auth): supports phone credential linking and provider-managed auth state.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic auth errors, enumeration resistance, throttling, and lockout care.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports authenticator binding, recovery, throttling, lifecycle event recording, and account recovery notifications.
- [Apple domain-bound SMS codes](https://developer.apple.com/documentation/security/enabling-autofill-for-domain-bound-sms-codes): supports `oneTimeCode`, domain-bound SMS format, and phishing-resistant autofill behavior.
- [Android SMS Retriever API](https://developers.google.com/identity/sms-retriever/overview): supports automatic SMS verification without requiring SMS read permission.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports text error descriptions for invalid phone, code, and PIN fields.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, sending, verifying, and success feedback without unnecessary focus changes.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable activation controls on field devices.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/01-auth-role-selection.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/02-invite-acceptance.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/01-station-sign-in.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/auth.ts`
- `services/api/src/users.ts`

## Design Brief
Audience:
- Operational staff activating before they can handle parcels.

Surface type:
- Mobile-first auth and activation flow.

Primary action:
- Continue through the approved activation or sign-in path without granting access from the client.

Visual thesis:
- A calm secure staff checkpoint with high-contrast identity steps, tactile controls, and a visible route back to a human supervisor.

Restraint rule:
- Do not add decorative station art, broad role browsing, marketing copy, or dashboard fragments.

## UX Principles
Activation should feel:
- official
- guided
- fast
- strict
- field-ready
- recoverable

Activation must not feel:
- like self-registration
- like staff can choose permissions
- like a survey
- like an admin console
- like a general help article
- like a marketing page

The screen should use progressive disclosure:
- First explain what activation needs.
- Then collect the minimum credential.
- Then verify through provider or future backend.
- Then show resolved role and station only after verification.
- Then send the user to the right sign-in route.

## Information Architecture
Top-level regions:
- App mark and staff security context.
- Step heading.
- Short task explanation.
- Primary input area.
- Status and recovery area.
- Supervisor/support link.
- Legal links.

Persistent elements:
- `Kra staff activation`
- route-safe back button
- connection status when offline or degraded
- support link
- privacy and terms links

Conditional elements:
- invite context banner
- phone input
- activation code input
- PIN setup form
- resolved staff role card
- station scope card
- lockout message
- provider unavailable message
- activation unavailable message
- success handoff card

## Navigation Entry Points
From role selection:
- route: `/(auth)/staff/activate`
- route context: `{ source: "role_selection" }`
- default state: `ready`

From invite acceptance:
- route: `/(auth)/staff/activate`
- route context: `{ source: "invite", inviteToken }`
- default state: `checking_route_context`
- token must remain redacted from visible UI and telemetry

From station sign-in:
- route: `/(auth)/staff/activate`
- route context: `{ intendedRole: "station_operator" }`
- default state: `ready`

From driver sign-in:
- route: `/(auth)/staff/activate`
- route context: `{ intendedRole: "driver" }`
- default state: `ready`

From courier sign-in:
- route: `/(auth)/staff/activate`
- route context: `{ intendedRole: "final_mile_courier" }`
- default state: `ready`

From session expired:
- route: `/(auth)/staff/activate`
- route context: `{ reason: "first_run_or_recovery" }`
- default state: `ready`

Invalid entry:
- If route contains unsupported role, show generic guidance and route to role selection.
- If route contains unsafe token format, discard token and show `activation_unavailable`.
- If route comes from admin invite, route to `/admin/sign-in`.

## Route Parameters
Supported route query values:
- `source`
- `intendedRole`
- `inviteToken`
- `returnTo`

Allowed `source` values:
- `role_selection`
- `invite`
- `station_sign_in`
- `driver_sign_in`
- `courier_sign_in`
- `session_expired`

Allowed `intendedRole` values:
- `station_operator`
- `driver`
- `final_mile_courier`

Rejected route values:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`
- `sender`
- any unrecognized role string
- any station ID provided by query string
- any staff user ID provided by query string
- any PIN or code value provided by query string

Route handling rules:
- Never trust route values as authority.
- Never display route token values.
- Never persist route token values to general app storage.
- Never append route token values to outbound support links.
- Clear token-like values from navigation state after safe handoff.

## Role Boundaries
Allowed staff activation roles:
- `station_operator`
- `driver`
- `final_mile_courier`

Not allowed in this flow:
- `sender`
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Station operator rule:
- Requires backend-confirmed station scope.
- Must not choose station on the client.
- Must not proceed to station work without `kra_station_id`.
- If role is station operator and station scope is missing, show `station_scope_required`.

Driver rule:
- Must not receive station scope from this screen.
- Must continue to driver sign-in after activation.
- Must rely on backend assignment checks after sign-in.

Courier rule:
- Must not receive station scope from this screen.
- Must continue to courier sign-in after activation.
- Must rely on backend assignment checks after sign-in.

Admin rule:
- If backend or invite context resolves to an admin role, show admin route guidance and open `/admin/sign-in`.
- Do not continue admin users through mobile staff activation.

Sender rule:
- If backend or invite context resolves to sender, route to sender sign-in or role selection.
- Do not activate sender accounts here.

## First-Run Copy
Header:
- Eyebrow: `Staff account`
- Title: `Activate before handling packages`
- Body: `Use the phone and instructions your supervisor approved. Kra will confirm your staff role before you can work.`

Primary action:
- `Start activation`

Secondary actions:
- `I already activated`
- `Choose another role`
- `Contact supervisor`

Security note:
- `You cannot choose a role or station here. Kra checks the staff record after verification.`

Activation unavailable copy:
- Title: `Activation is not available in this app version`
- Body: `Your supervisor must issue approved sign-in instructions before you can start work. This screen will not create staff access.`
- Primary action: `Go to staff sign-in`
- Secondary action: `Contact supervisor`

Provider unavailable copy:
- Title: `Activation provider is not ready`
- Body: `The app cannot open the approved activation provider right now. Try again when online or ask your supervisor for the correct sign-in path.`
- Primary action: `Try again`
- Secondary action: `Open role selection`

## Step Model
Step 1:
- Name: `Activation readiness`
- State: `ready`
- Goal: explain the controlled path
- Primary action: `Start activation`

Step 2:
- Name: `Phone check`
- State: `enter_phone`
- Goal: collect provisioned phone number if provider or future backend supports it
- Primary action: `Send code`

Step 3:
- Name: `Code check`
- State: `enter_activation_code`
- Goal: verify one-use activation code
- Primary action: `Verify code`

Step 4:
- Name: `PIN setup`
- State: `set_pin`
- Goal: set staff PIN through approved provider or future endpoint
- Primary action: `Set staff PIN`

Step 5:
- Name: `Role confirmation`
- State: `role_resolved`
- Goal: show backend-resolved role and next route
- Primary action: `Continue to sign-in`

Step 6:
- Name: `Success`
- State: `success`
- Goal: route to the correct staff sign-in screen
- Primary action: role-specific continuation

Current v1 adjustment:
- Because the backend does not expose activation endpoints, Step 2 through Step 5 must be disabled unless the auth provider integration explicitly supplies them.
- The app must show `activation_unavailable` or provider handoff rather than rendering unsupported forms as working screens.

## Layout
Mobile layout:
- full-height safe-area screen
- top back button with text label
- compact Kra mark
- centered staff checkpoint panel
- single primary form area
- bottom recovery stack
- bottom legal row

Desktop web fallback:
- centered narrow panel with max width around `480px`
- left or top trust context panel on wider screens
- no marketing navigation
- no admin console chrome

Spacing:
- use generous vertical spacing around the primary step title
- keep input groups close to their labels and help text
- separate recovery links from primary action by enough space to avoid accidental taps
- keep bottom legal links visible without crowding the action area

Tap targets:
- primary and secondary controls should be at least `44px` high on mobile
- icon-only controls must still expose at least `24 by 24 CSS pixels`
- destructive or lockout recovery actions must not sit directly beside primary activation submit

Keyboard behavior:
- phone keyboard for phone entry
- numeric keyboard for activation code
- secure numeric entry for PIN when provider supports it
- never hide the primary button behind the keyboard
- keep current field error visible above keyboard

## Visual System
Use the existing Kra design direction once available. If no token system exists at implementation time, apply these decisions as app-level auth tokens.

Color direction:
- Background: warm off-white or deep charcoal gradient based on platform theme.
- Primary accent: trust green for verified staff progress.
- Warning accent: amber for lockout and pending supervisor action.
- Error accent: red only for invalid input or blocked activation.
- Neutral surface: high-contrast card with subtle border.

Avoid:
- purple default SaaS gradients
- bright decorative icons
- heavy shadows
- busy parcel illustrations
- broad marketing hero treatments

Typography:
- One confident display style for the step title.
- Clear body type with large enough line height for field use.
- Numeric code and PIN fields should use tabular digits.
- Error copy must remain readable at large text sizes.

Motion:
- Use short step transitions to show progression.
- Use a restrained success confirmation.
- Use no constant looping animation.
- Respect reduced motion settings.
- Do not animate sensitive field values.

## Component Structure
Required route component:
- `StaffAccountActivationScreen`

Required child components:
- `StaffActivationShell`
- `StaffActivationHeader`
- `ActivationReadinessCard`
- `ActivationUnavailableCard`
- `ProviderUnavailableCard`
- `StaffPhoneForm`
- `ActivationCodeForm`
- `StaffPinSetupForm`
- `ResolvedRoleCard`
- `StationScopeRequiredCard`
- `ActivationSuccessCard`
- `ActivationLockoutNotice`
- `ActivationRecoveryLinks`
- `ActivationLegalLinks`
- `ActivationStatusAnnouncer`

Shared component candidates:
- `AuthBackButton`
- `AuthProgressSteps`
- `PhoneNumberField`
- `OneTimeCodeField`
- `SecurePinField`
- `PrimaryActionButton`
- `SecondaryActionLink`
- `SupportContactSheet`
- `OfflineBanner`

Component ownership:
- The screen owns route interpretation, step state, and safe navigation.
- Form components own local validation and field accessibility.
- Provider adapter owns calls to Firebase or future backend auth endpoints.
- Shared auth store owns provider user state after successful sign-in only.
- No component owns role or station authority from local input.

## Data Inputs
Input: route context.
- Source: navigation state or deep link.
- Use: choose initial guidance.
- Sensitivity: route token may be sensitive.
- Storage: memory only.

Input: intended role.
- Source: route context or previous screen.
- Use: copy and post-success routing hint.
- Sensitivity: low by itself, but not authority.
- Storage: session only.

Input: phone number.
- Source: user input.
- Use: provider or future activation start.
- Sensitivity: personal data.
- Storage: form state only until provider flow accepts it.

Input: activation code.
- Source: user input or platform autofill.
- Use: provider or future activation verify.
- Sensitivity: secret.
- Storage: form state only.

Input: PIN.
- Source: user input.
- Use: provider or future PIN setup.
- Sensitivity: secret.
- Storage: field state only, cleared immediately after submit or route exit.

Input: provider status.
- Source: auth provider adapter.
- Use: decide if activation can continue.
- Sensitivity: internal app state.
- Storage: no durable storage required.

Input: resolved role.
- Source: backend or provider claims after verification.
- Use: route to correct sign-in.
- Sensitivity: staff operational data.
- Storage: auth state only after valid token.

Input: station scope.
- Source: backend custom claim or verified activation response.
- Use: station operator readiness check.
- Sensitivity: staff operational scope.
- Storage: auth state only after valid token.

## Data Outputs
Output: navigation to station sign-in.
- Condition: verified or guided station operator activation path.
- Route: `/(auth)/station/sign-in`

Output: navigation to driver sign-in.
- Condition: verified or guided driver activation path.
- Route: `/(auth)/driver/sign-in`

Output: navigation to courier sign-in.
- Condition: verified or guided courier activation path.
- Route: `/(auth)/courier/sign-in`

Output: navigation to phone login.
- Condition: shared phone auth provider owns the next step.
- Route: `/(auth)/phone-login`

Output: navigation to support.
- Condition: activation blocked, missing staff record, lockout, or unsupported provider.
- Route: `/support`

Output: activation telemetry.
- Condition: non-sensitive state transition.
- Payload: step name, outcome class, platform, app version.
- Never include phone, code, PIN, token, raw provider response, staff user ID, or station ID.

## State Machine
Initial state:
- `ready`

Transition: route has invite token.
- From: `ready`
- To: `checking_route_context`
- Guard: token passes local format checks
- Action: prepare provider or future backend handoff

Transition: route has invalid token format.
- From: `ready`
- To: `activation_unavailable`
- Guard: token is malformed or unsafe
- Action: clear token from navigation state

Transition: start pressed with no provider support.
- From: `ready`
- To: `activation_unavailable`
- Guard: current backend has no activation endpoint and provider adapter reports no activation flow
- Action: show safe guidance

Transition: start pressed with provider support.
- From: `ready`
- To: `enter_phone`
- Guard: provider adapter supports staff activation
- Action: focus phone field

Transition: phone submitted.
- From: `enter_phone`
- To: `verifying_code`
- Guard: phone is valid and network is available
- Action: request code through approved provider or future endpoint

Transition: code sent.
- From: `verifying_code`
- To: `enter_activation_code`
- Guard: provider or future endpoint returns code sent
- Action: focus code field and start visible expiry countdown

Transition: code submitted.
- From: `enter_activation_code`
- To: `verifying_code`
- Guard: code has valid length and format
- Action: verify code through approved provider or future endpoint

Transition: code verified and PIN required.
- From: `verifying_code`
- To: `set_pin`
- Guard: provider or future endpoint returns PIN setup required
- Action: clear code from local state

Transition: PIN submitted.
- From: `set_pin`
- To: `confirm_pin`
- Guard: PIN passes local policy
- Action: compare confirmation locally before secure submit

Transition: PIN confirmed.
- From: `confirm_pin`
- To: `role_resolved`
- Guard: provider or future endpoint accepts PIN
- Action: clear PIN and fetch safe role result

Transition: station operator missing station scope.
- From: `role_resolved`
- To: `station_scope_required`
- Guard: role is station operator and no station scope exists
- Action: block continuation to station work

Transition: role resolved.
- From: `role_resolved`
- To: `success`
- Guard: role is allowed and required scope exists
- Action: show next sign-in route

Transition: activation complete.
- From: `success`
- To: role-specific sign-in route
- Guard: user taps primary action
- Action: clear activation state

Transition: offline.
- From: any interactive submit state
- To: `offline`
- Guard: network unavailable before submit
- Action: preserve non-secret field values except code and PIN

Transition: too many attempts.
- From: `enter_activation_code` or `set_pin`
- To: `too_many_attempts`
- Guard: provider or future backend returns throttled
- Action: clear secret fields and show wait guidance

Transition: account locked.
- From: any verification state
- To: `account_locked`
- Guard: auth policy lockout reached
- Action: clear secret fields and show supervisor route

## Current V1 Rendering Rules
Because activation endpoints do not exist today:
- Render readiness and unavailable states completely.
- Render provider handoff only if configured by app shell.
- Do not render phone, code, or PIN forms as active unless a real provider adapter exists.
- Do not wire submit buttons to a stubbed network call.
- Do not let QA pass the screen by bypassing provider or backend checks.
- Do not use local storage to emulate activation.
- Do not create a temporary staff role on the client.

Required current v1 branch:
- User opens screen.
- Screen explains controlled activation.
- User taps `Start activation`.
- If no provider is configured, screen shows `activation_unavailable`.
- User can open role-specific sign-in, role selection, or support.

Provider-configured branch:
- User opens screen.
- Screen validates provider availability.
- Provider handles phone verification and credential setup.
- After provider completion, app reads validated token claims.
- App routes by validated role and station scope.

## Form Rules
Phone field:
- Label: `Approved staff phone`
- Help: `Use the number your supervisor added to your staff record.`
- Format: support Ghana local entry and E.164 normalization.
- Keyboard: phone keypad.
- Autocomplete: telephone where platform supports it.
- Validation: required, valid phone format, country support if policy restricts launch region.
- Error: `Enter the staff phone number in a valid format.`

Activation code field:
- Label: `Activation code`
- Help: `Enter the code sent through the approved channel.`
- Format: numeric or provider-defined.
- Keyboard: numeric.
- Autocomplete: one-time code where platform supports it.
- Validation: required, exact provider length.
- Error: `Enter the full activation code.`

PIN field:
- Label: `Create staff PIN`
- Help: `Use a PIN you can remember. Do not share it with anyone.`
- Keyboard: numeric secure entry.
- Visibility toggle: optional only if platform security review approves.
- Validation: provider policy.
- Error: `Enter a valid staff PIN.`

Confirm PIN field:
- Label: `Confirm staff PIN`
- Help: `Re-enter the same PIN.`
- Validation: must match PIN.
- Error: `PINs do not match.`

Generic error field behavior:
- Inline text error under field.
- Field marked invalid for assistive technology.
- Error summary for multi-field submit failures.
- Focus first invalid field after failed submit.

## Security Rules
Never store:
- staff PIN
- activation code
- invite token
- provider verification ID
- raw Firebase ID token
- refresh token
- staff phone number in analytics
- staff user ID in activation telemetry

Never display:
- raw `kra_role`
- raw `kra_station_id`
- raw provider error body
- route token
- verification ID
- auth token
- PIN
- full phone number after submit unless masking policy allows it

Never log:
- phone number
- code
- PIN
- invite token
- provider credential
- provider verification ID
- raw decoded token

Never allow:
- role selection to grant access
- station selection by query string
- admin mutation routes from activation
- sender route to continue through staff activation
- activation while account lockout is active
- offline activation completion
- bypass of backend claims after provider success

Required hardening:
- Clear secret fields on backgrounding.
- Clear secret fields on route exit.
- Clear secret fields after failed verification.
- Use secure text entry for PIN.
- Disable screenshots for PIN step on Android where product policy permits.
- Avoid paste into PIN if policy requires manual entry.
- Allow paste into activation code only when platform autofill or accessibility needs require it.
- Mask phone after code is sent.
- Use generic copy for missing, inactive, or locked accounts before safe verification.

## Privacy Rules
Phone privacy:
- Show only masked phone after submission, such as `+233 24 *** 4567`.
- Do not expose phone in support deep link query strings.
- Do not expose phone in crash reports.

Role privacy:
- Do not show resolved role until backend or provider confirms it.
- Use human role labels after confirmation.
- Do not show role claim names to the staff member.

Station privacy:
- Show station name only after verified station scope exists and policy allows it.
- Show station code only if staff need it to confirm workplace.
- Do not show other stations.

Invite privacy:
- Do not display invite token.
- Do not copy invite token to clipboard.
- Do not include invite token in error text.
- Clear token from route state after it has been processed.

## Accessibility
Screen semantics:
- Top title is the only `h1`.
- Step title uses `h2`.
- Form labels are programmatically tied to inputs.
- Help text is tied to inputs with accessible descriptions.
- Error text is tied to invalid fields.
- Status changes use polite live regions unless blocking.

Focus rules:
- On screen load, focus title or first meaningful heading.
- On step transition, move focus to the new step heading.
- On validation error, focus the first invalid field.
- On lockout, focus lockout heading.
- On success, focus success heading.

Status announcements:
- `Sending activation code.`
- `Code sent.`
- `Verifying code.`
- `PIN saved.`
- `Activation complete.`
- `Activation is not available.`
- `Too many attempts.`

Large text:
- Layout must support at least 200 percent text scaling.
- Code fields must wrap or resize without clipping.
- Bottom recovery links must remain reachable.
- Primary action must remain visible or scrollable above keyboard.

Reduced motion:
- Replace step slide animation with instant fade.
- Disable success pulse.
- Keep status text visible.

Color:
- Do not rely on color alone for errors.
- Use icons, labels, and text.
- Maintain contrast for small field help text.

## Offline Behavior
Offline before starting:
- Show offline banner.
- Keep `Start activation` disabled if provider requires network.
- Offer `Go to staff sign-in` only for already activated users.
- Offer `Contact supervisor` guidance.

Offline after entering phone:
- Preserve phone in memory.
- Do not preserve code or PIN.
- Show `Connect to continue activation.`

Offline after code sent:
- Preserve masked phone and expiry countdown if still valid.
- Clear code field.
- Disable verify until online.
- If code expires while offline, show expired state.

Offline after PIN field focused:
- Clear PIN fields.
- Explain that PIN setup requires a secure connection.

Offline success:
- Not allowed.
- Activation completion must require provider or backend confirmation.

## Error States
`activation_unavailable`:
- Trigger: no current endpoint and no provider activation flow.
- Copy: `Activation is not available in this app version.`
- Action: role-specific sign-in, role selection, support.

`provider_unavailable`:
- Trigger: provider SDK cannot initialize or required platform checks fail.
- Copy: `Activation provider is not ready.`
- Action: retry, role selection, support.

`invalid_code`:
- Trigger: provider or future backend rejects code.
- Copy: `The code could not be verified. Check it and try again.`
- Action: retry, resend if allowed.

`expired_code`:
- Trigger: code expiry.
- Copy: `The code expired. Request a new one.`
- Action: resend if allowed.

`too_many_attempts`:
- Trigger: rate limit.
- Copy: `Too many attempts. Wait before trying again.`
- Action: show timer if backend provides one, support link.

`account_locked`:
- Trigger: lockout threshold reached.
- Copy: `This staff account cannot continue right now. Contact your supervisor.`
- Action: supervisor/support route.

`already_active`:
- Trigger: account is already active.
- Copy: `This staff account is already active. Continue to sign-in.`
- Action: role-specific sign-in.

`not_provisioned`:
- Trigger: phone or invite is not tied to a provisioned staff record.
- Copy: `Kra could not complete activation with those details. Contact your supervisor.`
- Action: support.

`not_authorized`:
- Trigger: resolved role is not allowed for this flow.
- Copy: `This account uses a different sign-in route.`
- Action: role selection or admin sign-in.

`station_scope_required`:
- Trigger: station operator role lacks station scope.
- Copy: `Your station assignment is missing. Ask an admin to update your account before signing in.`
- Action: support.

`api_error`:
- Trigger: unexpected provider or backend failure.
- Copy: `Activation could not continue. Try again or contact support.`
- Action: retry, support.

## Copy System
Tone:
- direct
- calm
- operational
- non-blaming
- clear about authority boundaries

Use:
- `staff account`
- `approved phone`
- `supervisor`
- `station assignment`
- `continue to sign-in`
- `cannot continue right now`

Avoid:
- `create your role`
- `pick your station`
- `claim this account`
- `unknown user`
- `no account exists`
- `wrong PIN`
- `invalid user`
- raw provider strings

Role labels:
- `Station operator`
- `Driver`
- `Courier`

Security copy:
- `Kra confirms your role after verification.`
- `Do not share your PIN with another staff member.`
- `Ask your supervisor to update your account if your role or station is wrong.`

## Success Behavior
Success title:
- `Staff activation complete`

Success body for station operator:
- `Your account is ready for station sign-in. Your station assignment will be checked again after sign-in.`

Success body for driver:
- `Your account is ready for driver sign-in. Assignments appear only after sign-in.`

Success body for courier:
- `Your account is ready for courier sign-in. Doorstep work appears only after sign-in.`

Primary actions:
- Station operator: `Continue to station sign-in`
- Driver: `Continue to driver sign-in`
- Courier: `Continue to courier sign-in`

Secondary actions:
- `Choose another role`
- `Contact support`

Post-success rules:
- Clear activation code and PIN.
- Clear invite token.
- Do not keep success screen in back stack if sign-in starts.
- Do not create a staff session unless provider sign-in returns a valid token.

## Supervisor And Support Recovery
Support entry points:
- `Contact supervisor`
- `Open support`
- `Call station lead` if contact policy exists
- `Return to role selection`

Support route payload:
- allowed: state code, route source, intended role, app version, platform
- not allowed: phone, code, PIN, invite token, provider token, staff user ID, station ID

Supervisor handoff copy:
- `If your supervisor has not created your staff account, activation cannot continue.`
- `If your station assignment is missing, an admin must update your account.`
- `If the provider is unavailable, use the sign-in instructions your supervisor issued.`

## Analytics
Allowed events:
- `staff_activation_viewed`
- `staff_activation_start_pressed`
- `staff_activation_provider_unavailable`
- `staff_activation_unavailable`
- `staff_activation_phone_submitted`
- `staff_activation_code_submitted`
- `staff_activation_pin_submitted`
- `staff_activation_role_resolved`
- `staff_activation_success`
- `staff_activation_blocked`
- `staff_activation_support_opened`

Allowed event properties:
- `source`
- `intendedRole`
- `outcome`
- `errorClass`
- `platform`
- `appVersion`
- `networkState`

Forbidden event properties:
- phone
- activation code
- PIN
- invite token
- provider verification ID
- Firebase token
- staff user ID
- station ID
- raw error body

## QA Requirements
Unit tests:
- renders `screen-staff-account-activation`
- renders current v1 unavailable state when no provider exists
- does not render active PIN form without provider capability
- rejects unsupported role query values
- rejects station ID query values
- clears token-like route values from visible UI
- maps station operator success to station sign-in
- maps driver success to driver sign-in
- maps courier success to courier sign-in
- maps admin role to admin sign-in guidance
- blocks station operator without station scope
- masks phone after submit
- clears code on failed verify
- clears PIN on route exit
- shows generic missing account copy

Integration tests:
- role selection opens activation
- invite acceptance opens activation without displaying token
- station sign-in activation link returns to station sign-in
- driver sign-in activation link returns to driver sign-in
- courier sign-in activation link returns to courier sign-in
- offline state disables network submit
- provider unavailable state offers recovery
- lockout state blocks retry
- support link omits sensitive values
- analytics payload excludes sensitive values

Accessibility tests:
- title and step heading order is valid
- all fields have labels
- invalid fields expose text errors
- status messages are announced
- focus moves on step transition
- large text does not clip actions
- controls meet target size requirements
- reduced motion removes step slide motion
- screen reader does not read masked secrets as full values

Security tests:
- no PIN in logs
- no code in logs
- no phone in analytics
- no token in route after processing
- no admin user mutation route call
- no local role grant
- no station selection
- no offline completion
- no raw provider error display

End-to-end tests:
- current v1 start shows activation unavailable
- configured provider happy path reaches role-specific sign-in
- invalid code shows retry without revealing account existence
- expired code offers resend only when allowed
- too many attempts shows wait guidance
- already active routes to sign-in
- missing station scope blocks station operator continuation

## Implementation Notes For Claude Code
Build as a real route, but do not implement actual frontend UI beyond the future screen work assigned to Claude Code in this project phase.

When implementation starts later:
- Create route component under the auth stack.
- Wire test ID `screen-staff-account-activation`.
- Read provider capability from auth adapter, not environment string checks scattered through UI.
- Keep all secret fields in component state only.
- Use existing auth navigation primitives if present.
- Use shared phone and code field components if already built.
- Add a typed `StaffActivationProvider` interface even if current v1 only returns unavailable.
- Keep future backend call names behind the interface.
- Avoid direct calls to admin user routes.
- Keep all copy in a screen-local copy object or app i18n layer.
- Add tests before connecting provider submit behavior.

Suggested provider interface:
```ts
export interface StaffActivationProvider {
  canActivateStaff(): boolean;
  startActivation(input: StaffActivationStartInput): Promise<StaffActivationStartResult>;
  verifyActivationCode(input: StaffActivationVerifyInput): Promise<StaffActivationVerifyResult>;
  setStaffPin(input: StaffPinSetupInput): Promise<StaffActivationCompleteResult>;
}
```

Current v1 provider result:
```ts
export const unavailableStaffActivationProvider: StaffActivationProvider = {
  canActivateStaff() {
    return false;
  },
  async startActivation() {
    return {
      status: "unavailable"
    };
  },
  async verifyActivationCode() {
    return {
      status: "unavailable"
    };
  },
  async setStaffPin() {
    return {
      status: "unavailable"
    };
  }
};
```

Do not ship:
- inactive buttons that look like activation works
- local-only activation success
- client-made role claims
- client-made station assignments
- console output containing auth secrets
- visual-only error states
- hidden token values in DOM

## Acceptance Criteria
The spec is complete when:
- The screen has a route, test ID, required states, and backend boundary.
- Current backend limitations are explicit.
- Future activation endpoints are defined as required before full activation.
- Staff roles are limited to station operator, driver, and courier.
- Admins, senders, and receivers are routed away safely.
- Station operator station scope cannot be chosen on the client.
- PIN and code handling rules are strict.
- Provider unavailable and activation unavailable states are first-class.
- Offline behavior cannot finish activation.
- Accessibility, analytics, privacy, and security rules are testable.
- Claude Code can implement the screen later without inventing product policy.

## Open Product Decisions
Decision needed before full activation can ship:
- Whether Firebase phone auth alone is enough for first-run staff activation or whether Kra needs a dedicated activation endpoint.
- Whether staff PIN is a Firebase credential pattern, custom provider credential, or Kra-managed secret behind backend.
- Whether activation code comes from invite, SMS, supervisor console, or provider lifecycle.
- Whether station operators see station name after activation or only after sign-in.
- Whether supervisors can trigger activation resend from admin console.
- Whether activation lockout is account-level, phone-level, device-level, or combined.
- Whether shared station devices need device binding before staff activation.
- Whether support can verify a staff member during launch without weakening enumeration protections.

## Final Implementation Boundary
`StaffAccountActivation` should launch as a safe controlled doorway, not a false activation engine.

Current implementation should:
- Render the route.
- Explain the activation requirement.
- Route users to sign-in, support, or role selection.
- Refuse unsupported activation with clear copy.
- Preserve strict security boundaries.

Future implementation should:
- Connect only to approved provider or backend activation endpoints.
- Prove credential ownership.
- Set PIN securely.
- Confirm backend role and station scope.
- Route staff to the correct operational sign-in screen.

This screen is only successful if a staff member understands exactly how to continue and the system never grants access from client-side trust.
