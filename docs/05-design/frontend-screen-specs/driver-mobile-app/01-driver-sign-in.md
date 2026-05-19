# Driver Sign In Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverSignIn` |
| App | `apps/mobile` |
| Route | `/(auth)/driver/sign-in` |
| Primary test ID | `screen-driver-sign-in` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Driver Critical` |
| Backend dependency | Firebase authentication, bearer token verification, `AuthPrincipal`, `roleSchema`, `kra_role`, shared auth policy, `getAuthMethod`, `getSessionTtlHours`, `shouldLockAccount`, shared auth state components |
| Related routes | `/(auth)/role-selection`, `/(auth)/staff/activate`, `/(auth)/session-expired`, `/(ops)/home`, `/(ops)/driver/home`, `/(ops)/driver/runs`, `/(ops)/driver/support` |
| Required states | `ready`, `submitting`, `authenticated`, `role_checking`, `redirecting`, `invalid_credentials`, `too_many_attempts`, `account_locked`, `role_denied`, `inactive_account`, `session_expired`, `network_error`, `provider_unavailable`, `api_error` |

## Product Job
This screen authenticates an inter-station driver into the operations mobile app and confirms that the account has driver authority before any assigned-run data is shown.

The screen answers one operational question: `Can this person safely enter the driver workspace for assigned inter-station runs?`

The driver should be able to:
- Enter the approved driver credential.
- Understand this route is for drivers only.
- Sign in quickly at shift start or before pickup.
- Recover from invalid credential, lockout, rate-limit, network, session, and provider states.
- See clear guidance when the account belongs to another role.
- Continue to driver home after backend role verification passes.
- Return to role selection if this is the wrong sign-in route.
- Contact supervisor or support when provisioning is wrong.

This screen is not:
- A sender sign-in route.
- A station operator sign-in route.
- A courier sign-in route.
- An admin sign-in route.
- A self-registration route.
- A driver onboarding or approval route.
- A vehicle assignment screen.
- A run acceptance screen.
- A route map.
- A delivery search screen.
- A place to reveal whether a phone or staff identity exists.
- A place to display assigned runs before authentication succeeds.

## Audience
Primary audience:
- Drivers starting a shift.
- Drivers signing in before origin pickup.
- Drivers returning after session expiry.
- Drivers using a work phone in low-connectivity conditions.

Secondary audience:
- Claude Code implementing driver authentication.
- QA validating role gates and session states.
- Security reviewers validating enumeration resistance and token handling.
- Operations leads validating driver provisioning and lockout behavior.
- Accessibility reviewers validating form and recovery behavior.

## User State
The driver may be standing near a station counter, sitting in a vehicle, or trying to recover access while a package run waits. The screen must be fast and exact, but it must not let a wrong role or stale session enter the driver workspace.

The user may be:
- Starting a driver shift.
- Opening a deep link to an assigned run.
- Returning after session expiry.
- Using the wrong role entry route.
- Recovering from too many failed attempts.
- Waiting for supervisor provisioning.
- Working on a weak network.
- Reinstalling the app on a new device.

The screen must:
- Authenticate through the approved provider.
- Treat provider auth as identity input and backend token claims as authorization input.
- Require `kra_role` to resolve to `driver`.
- Reject sender, station operator, final-mile courier, finance admin, support admin, ops admin, and super admin accounts from this route.
- Route valid drivers to `/(ops)/driver/home` or shared `/(ops)/home` if the app shell needs role routing first.
- Avoid account enumeration.
- Avoid exposing raw token claims.
- Avoid showing assigned deliveries before role verification.
- Avoid storing plaintext PINs, passwords, or tokens outside the approved secure storage layer.

## Authentication Model
Current backend model:
- Server verifies Firebase ID token.
- `AuthPrincipal.userId` is derived from token UID.
- `AuthPrincipal.role` is derived from `kra_role`.
- `AuthPrincipal.stationId` is derived from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from `getCapabilities(role)`.
- `AuthPrincipal.authMethod` is `firebase_id_token`.

Driver requirement:
- `role` must be `driver`.
- No `stationId` is required for driver sign-in.
- Driver delivery access later depends on assignment scope, not station scope.

Allowed successful role:
- `driver`.

Denied roles:
- `sender`.
- `station_operator`.
- `final_mile_courier`.
- `ops_admin`.
- `finance_admin`.
- `support_admin`.
- `super_admin`.

Auth policy facts:
- Driver auth method is `phone_pin`.
- Driver session TTL is `12` hours.
- Account lockout policy returns locked when failed attempts are at least `5` within `15` minutes.

Role-denied copy must be generic enough to avoid account enumeration while still helping staff choose the correct route.

## Credential Model
Preferred driver auth entry:
- Phone plus staff PIN through the configured auth provider.

Credential rules:
- Use shared mobile auth adapter.
- Do not create a driver-specific credential store.
- Do not store plaintext PIN.
- Do not submit duplicate sign-in requests while `submitting`.
- Do not reveal whether the phone exists.
- Do not show provider debug messages to users.
- Do not allow local bypass when provider is unavailable.

Device trust:
- The app may offer platform credential manager or biometric re-authorization only after initial provider sign-in and backend role verification.
- Biometric unlock must not replace backend session verification.
- If biometric re-authorization fails, return to provider sign-in.
- Driver must be able to sign out fully and remove local session state.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product claims beyond current backend:
- NIST SP 800-63B guidance distinguishes authenticators, OTPs, phishing resistance, authenticator binding, and authenticator lifecycle events.
- OWASP mobile authentication guidance stresses that authentication and authorization must be enforced consistently server-side and cannot rely on client-controlled state.
- Android Credential Manager provides a centralized credential interface and secure credential storage patterns for Android sign-in.
- Android biometric guidance recommends Credential Manager for initial sign-in and biometric or credential prompts for later re-authorization.
- Apple Sign in guidance reinforces platform-native authentication expectations on iOS when a provider route is used.

Reference links:
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [OWASP mobile authentication](https://mas.owasp.org/MASTG/0x04e-Testing-Authentication-and-Session-Management/)
- [Android Credential Manager](https://developer.android.com/identity/credential-manager)
- [Android biometric authentication](https://developer.android.com/identity/sign-in/biometric-auth)
- [Sign in with Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

## Screen Thesis
The screen should feel like a secure driver check-in gate: fast, field-ready, and unmistakably tied to inter-station run work.

The driver should understand in three seconds:
- This is the driver sign-in route.
- Which credential is expected.
- Assigned runs will appear only after verification.
- Wrong-role accounts cannot continue.
- Recovery goes through supervisor or support, not local override.

Visual thesis:
- Use a road-dispatch visual language with a strong route-line motif, clear credential card, and calm security copy.
- Make the sign-in control large and one-handed.
- Keep run imagery abstract and operational; do not show package details before authentication.

Restraint rule:
- Do not turn sign-in into onboarding. One focused form, one dominant action, clear recovery exits.

## Information Architecture
Top-level layout:
1. Header.
2. Driver identity card.
3. Credential form.
4. Security and session guidance.
5. Recovery actions.
6. Error and lockout states.

Header:
- Title: `Driver sign in`
- Subtitle: `Access assigned inter-station runs`
- Optional route-line illustration.
- No assigned run previews.

Driver identity card:
- Label: `Driver workspace`
- Copy: `Sign in with your approved driver account.`
- Short promise: `Your assigned runs appear after role verification.`

Credential form:
- Phone field.
- PIN or provider-controlled verification field.
- Primary action: `Sign in`
- Secondary action: `Choose another role`
- Optional action: `Staff activation` when enabled.

Security and session guidance:
- `Use only your assigned driver account.`
- `Driver sessions last 12 hours unless revoked.`
- `Sign out when using a shared device.`

Recovery actions:
- `Choose another role`
- `Contact supervisor`
- `Open support`
- `Privacy`
- `Terms`

## State Model
`ready`:
- Form is usable.
- Primary action enabled only when required fields are valid enough to submit.

`submitting`:
- Disable duplicate submit.
- Keep entered values visible.
- Show progress with accessible status.

`authenticated`:
- Provider returned an auth state.
- App is resolving backend token and claims.

`role_checking`:
- Verify `kra_role` through app auth state.
- Do not render driver data.

`redirecting`:
- Replace auth route with driver home or pending deep link if authorized.

`invalid_credentials`:
- Show generic credential error.
- Do not reveal phone existence.

`too_many_attempts`:
- Show temporary wait guidance.
- Do not keep retry button active if provider rate-limits.

`account_locked`:
- Tell user to contact supervisor.
- Do not expose backend lock reason details.

`role_denied`:
- Tell user this route is for driver accounts.
- Offer role selection.
- Do not reveal internal role claim value.

`inactive_account`:
- Tell user account needs supervisor review.
- Offer support path.

`session_expired`:
- Explain session expired.
- Preserve intended route if safe.

`network_error`:
- Explain connection failed before sign-in completed.
- Allow retry.

`provider_unavailable`:
- Explain sign-in service unavailable.
- No local bypass.

`api_error`:
- Generic retry/support state.

## Primary Actions
Primary action by state:
- `ready`: sign in.
- `submitting`: wait.
- `authenticated`: verify role.
- `role_checking`: wait.
- `redirecting`: continue.
- `invalid_credentials`: try again.
- `too_many_attempts`: wait.
- `account_locked`: contact supervisor.
- `role_denied`: choose another role.
- `inactive_account`: contact supervisor.
- `session_expired`: sign in again.
- `network_error`: retry.
- `provider_unavailable`: try later.
- `api_error`: retry.

Secondary actions:
- `Choose another role`
- `Staff activation`
- `Contact supervisor`
- `Open support`
- `Privacy`
- `Terms`

Blocked behavior:
- Do not render driver home before backend role verification.
- Do not fetch assigned runs from this screen.
- Do not call run, delivery, issue, earnings, or notification APIs before auth success.
- Do not allow station/courier/admin roles into driver routes.
- Do not allow client-side role override.
- Do not let the user choose assignment scope.
- Do not reveal raw token claims.
- Do not show whether a phone number is registered.

## Form Behavior
Phone field:
- Label: `Driver phone`
- Hint: `Use the phone assigned to your driver account.`
- Accept common local spacing and normalize before provider submit.
- Do not show country-specific formatting as the only valid pattern unless provider requires it.

PIN field:
- Label: `Driver PIN`
- Hint: `Use your staff PIN.`
- Mask input.
- Allow paste only if platform security policy permits.
- Provide show/hide only if the app already uses it in shared auth components.

Submit:
- Disabled until required fields pass basic client validation.
- One submit at a time.
- On submit, dismiss keyboard and show progress.
- On provider error, keep entered phone and clear only sensitive PIN field when security policy requires it.

Remembered account:
- If allowed by auth provider, show safe account hint such as masked phone.
- Never auto-submit without user action.
- If shared device flag is enabled, do not persist remembered account.

## Error Copy
Generic invalid credential:
- Title: `Sign in did not work`
- Body: `Check your driver phone and PIN, then try again.`
- Action: `Try again`

Too many attempts:
- Title: `Too many attempts`
- Body: `Wait a few minutes before trying again, or contact your supervisor.`
- Action: `Contact supervisor`

Account locked:
- Title: `Account needs supervisor review`
- Body: `This driver account cannot sign in right now. Contact your supervisor to restore access.`
- Action: `Contact supervisor`

Role denied:
- Title: `This route is for drivers`
- Body: `Use the sign-in route for your assigned role.`
- Action: `Choose another role`

Inactive account:
- Title: `Account is inactive`
- Body: `Your driver access is not active. Contact your supervisor before handling packages.`
- Action: `Contact supervisor`

Session expired:
- Title: `Sign in again`
- Body: `Driver sessions expire after 12 hours or when access is revoked.`
- Action: `Sign in`

Network error:
- Title: `Connection problem`
- Body: `Sign-in needs a network connection. Check signal and try again.`
- Action: `Retry`

Provider unavailable:
- Title: `Sign-in service unavailable`
- Body: `Driver access could not be verified. Try again shortly.`
- Action: `Try again`

API error:
- Title: `Access could not be verified`
- Body: `We could not verify driver access. Try again or contact support.`
- Action: `Retry`

## Navigation Rules
On success:
- If no safe pending route exists, replace route with `/(ops)/driver/home`.
- If pending route is a driver route and role verification passes, replace route with pending route.
- If pending route is not a driver route, ignore it and open driver home.

On wrong role:
- Route to `/(auth)/role-selection`.
- Do not automatically redirect to another role workspace.

On expired session:
- Return to `/(auth)/driver/sign-in?reason=session_expired&next=<safe-driver-route>`.
- Preserve only driver-owned route paths.

On sign out:
- Clear local auth state.
- Clear cached driver workspace state that is not safe to show unauthenticated.
- Return to role selection or driver sign-in.

## Accessibility Requirements
Structure:
- Use one `h1` equivalent for `Driver sign in`.
- Labels must be persistent and visible.
- Error summaries must be accessible.
- Every recovery action must have a clear accessible name.

Input:
- Support keyboard navigation and switch access.
- Phone keyboard for phone field.
- Secure numeric keyboard for PIN when platform supports it.
- Do not rely on color alone for validation state.

Status messages:
- Announce submitting, role checking, success redirect, invalid credential, lockout, network error, and provider unavailable.
- Do not move focus unexpectedly unless an error summary appears after submit.

Touch targets:
- Primary sign-in button minimum target: `44 x 44 dp`.
- Role switch and support actions minimum target: `44 x 44 dp`.

Large text:
- Form labels and error copy must wrap.
- Primary action remains visible above keyboard where feasible.
- Recovery links may stack vertically.

## Privacy And Security
Do not show:
- Raw Firebase token.
- Raw token claims.
- Internal role claim value.
- Auth provider debug response.
- Full phone after entry unless the user typed it in the field.
- Assigned run details before auth success.
- Delivery IDs before auth success.
- Earnings before auth success.
- Support issue details before auth success.

Allowed:
- Driver route title.
- Generic credential guidance.
- Masked remembered phone when provider allows it.
- Session-duration guidance.
- Supervisor/support recovery labels.

Storage:
- Store session through approved secure auth provider storage.
- Store refresh/session metadata only through app auth layer.
- Clear sensitive auth form state on sign-out.
- Never store PIN or password in app state beyond active submit.

Rate limiting and lockout:
- Respect provider and backend lockout.
- Do not implement local-only bypass.
- Do not reveal exact failed-attempt count to the user.
- Use analytics only with redacted event names and no credential payload.

## Analytics
Track:
- `driver_sign_in_viewed`
- `driver_sign_in_submitted`
- `driver_sign_in_succeeded`
- `driver_sign_in_failed`
- `driver_sign_in_role_denied`
- `driver_sign_in_account_locked`
- `driver_sign_in_session_expired`
- `driver_sign_in_network_error`
- `driver_sign_in_provider_unavailable`
- `driver_sign_in_role_switch_opened`
- `driver_sign_in_support_opened`

Event payload rules:
- Include `reason` when safe.
- Include `providerState` as safe enum.
- Include `hasPendingDriverRoute` as boolean.
- Include `result` as safe enum.
- Do not include phone, PIN, token, raw claim, error stack, or provider response.

## QA Acceptance Criteria
Auth and routing:
- Root element exposes `screen-driver-sign-in`.
- Screen uses shared auth provider adapter.
- Screen accepts driver credential through configured provider.
- Screen verifies backend role before opening driver routes.
- `role=driver` routes to `/(ops)/driver/home` or safe pending driver route.
- Non-driver roles are denied and route to role selection.
- Assigned-run data does not render before auth success.
- No client-side role override exists.

Error states:
- Invalid credential uses generic copy.
- Too-many-attempts state blocks rapid retry.
- Account locked routes to supervisor/support.
- Session expired shows 12-hour session copy.
- Network and provider errors are distinct.
- Entered non-sensitive values remain after validation error.

Security:
- No raw token or claim renders.
- No phone enumeration copy appears.
- No PIN is stored after submit completes.
- Sign-out clears local driver workspace data.
- Deep link to non-driver route is ignored after driver sign-in.

Accessibility:
- Labels are visible.
- Error summary is announced after submit errors.
- Submit and recovery controls meet touch target minimums.
- Screen works with large text and keyboard open.
- Status changes are announced.

## Implementation Notes For Claude Code
Build this as a role-gated auth route only.

Recommended component split:
- `DriverSignInScreen`
- `DriverSignInHeader`
- `DriverCredentialForm`
- `DriverSecurityGuidance`
- `DriverAuthErrorState`
- `DriverRecoveryActions`
- `DriverRoleGate`

Recommended hooks/services:
- `useStaffAuthProvider`
- `useDriverRoleGate`
- `usePendingAuthRoute`
- `mapDriverAuthError`
- `clearDriverWorkspaceOnSignOut`

Implementation sequence:
1. Render auth-only shell with no driver data.
2. Submit through shared auth adapter.
3. Resolve backend token and principal.
4. Require `role === "driver"`.
5. Store session via app auth layer.
6. Replace route with safe driver home or pending driver route.
7. On failure, map error to safe user copy.

Do not implement:
- Custom credential persistence.
- Local role override.
- Assignment lookup from sign-in screen.
- Driver registration.
- Vehicle approval.
- Admin provisioning.

## Final Quality Bar
This screen is complete only when:
- A driver can sign in quickly with one hand.
- The app shows no driver operations data before backend role verification.
- Wrong-role accounts are safely rejected.
- Credential errors do not reveal account existence.
- Session expiry and lockout are clear.
- The design feels like a serious field-driver access gate, not a generic login page.
