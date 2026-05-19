# CourierSignIn Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierSignIn` |
| Route | `/(auth)/courier/sign-in` |
| Primary test ID | `screen-courier-sign-in` |
| Surface | Final-mile courier mobile app |
| Backend coverage | Firebase authentication, bearer token verification, `AuthPrincipal`, `kra_role`, `final_mile_courier`, shared auth policy |
| Offline critical | No |
| Required role | `final_mile_courier` |
| Required auth method | `phone_pin` |
| Session TTL | `12` hours |
| Related routes | `/(auth)/role-selection`, `/(auth)/staff/activate`, `/(auth)/session-expired`, `/(auth)/account-locked`, `/(ops)/courier/home`, `/(ops)/courier/assignments`, `/(ops)/courier/issues` |
| Current implementation mode | Role-gated staff sign-in for doorstep courier workflows |

## Product Job
`CourierSignIn` authenticates a final-mile courier and verifies that the account can enter doorstep delivery workflows.

The screen answers:

- `Is this person an approved Kra final-mile courier?`
- `Can this session safely enter assignment, custody, route, proof, failed-attempt, and return-to-station workflows?`
- `What should happen if this account belongs to another role?`
- `How does the courier recover from invalid credentials, lockout, expired session, or provisioning gaps?`

## Product Standard
This is a staff access gate for receiver-facing delivery work. It must be fast, secure, role-specific, and impossible to confuse with sender, driver, station, or admin sign-in.

The courier should be able to:

- Enter approved courier credentials.
- Understand this route is for doorstep courier work only.
- Sign in before accepting assignments.
- Recover from invalid credential, lockout, provider outage, weak network, expired session, and wrong-role states.
- Continue to courier home only after backend role verification succeeds.
- Return to role selection if they opened the wrong route.
- Reach staff activation or supervisor guidance when provisioning is incomplete.

The screen must never:

- Show assignments before authentication and role verification complete.
- Let a driver, station operator, sender, admin, finance admin, support admin, or super admin enter courier workspace through this route.
- Reveal whether a phone number or staff account exists.
- Store plaintext PIN.
- Store bearer token outside approved secure storage.
- Use local role state as authorization authority.
- Offer self-registration.
- Offer marketplace courier onboarding.
- Offer public receiver tracking.
- Offer delivery proof capture before sign-in.
- Let biometric unlock replace backend session verification.

## Current Auth Model
Backend facts:

- Server verifies Firebase ID token.
- `AuthPrincipal.userId` comes from token UID.
- `AuthPrincipal.role` comes from `kra_role`.
- `AuthPrincipal.stationId` comes from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from `getCapabilities(role)`.
- `AuthPrincipal.authMethod` is `firebase_id_token`.

Courier auth policy:

- `getAuthMethod("final_mile_courier")` returns `phone_pin`.
- `getSessionTtlHours("final_mile_courier")` returns `12`.
- Account lockout returns true when failed attempts are at least `5` within `15` minutes.

Allowed successful role:

- `final_mile_courier`

Denied roles:

- `sender`
- `driver`
- `station_operator`
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Role-denied copy must be generic enough to prevent account enumeration while still guiding staff back to the correct route.

## Audience
Primary audience:

- Final-mile couriers starting a doorstep delivery shift.
- Couriers opening a deep link to an assigned job.
- Couriers recovering after session expiry.
- Couriers using shared or low-cost devices in low-bandwidth environments.

Secondary audience:

- Claude Code implementing the auth screen and route guard.
- QA validating role gate behavior.
- Security reviewers validating token, lockout, and enumeration resistance.
- Operations leads validating courier provisioning.
- Accessibility reviewers validating form, status messages, and recovery states.

## Context Of Use
The courier may be:

- At the destination station before assignment pickup.
- In the field before starting doorstep delivery.
- Returning after the app session expired.
- Opening a push notification or deep link.
- On a weak mobile network.
- Using a device with small screen and large text settings.
- Recovering from a locked account.
- Trying to understand why a driver or station login does not work here.

The screen must be direct and low-friction, but it cannot sacrifice role certainty.

## Design Brief
User and job:

- A courier needs to sign in quickly and safely before handling receiver-facing work.

Context:

- Field mobile, small screen, intermittent network, high trust requirement because courier custody and proof flows affect final delivery accountability.

Entry point:

- `/(auth)/courier/sign-in`, role-selection route, session-expired route, deep link guard, or push notification guard.

Success state:

- Provider authentication succeeds, backend role check confirms `final_mile_courier`, secure session state is established, and app routes to `/(ops)/courier/home` or the intended courier deep link.

Primary action:

- `Sign in`

Navigation model:

- Focused auth screen with one primary form, role recovery, staff activation link, and safe error states.

Density level:

- Low: credential card, role promise, security note, recovery links.

Visual thesis:

- `Doorstep custody gate`: a calm, field-ready sign-in surface with a compact route-to-door motif, strong role labeling, and no assignment data until verification.

Restraint rule:

- Do not turn sign-in into onboarding, assignment preview, proof education, or public tracking.

## External Research Used
Only directly relevant sources were used:

- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports controlled authenticator use, rate limits, reauthentication, and recovery discipline.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic login errors, account lockout care, throttling, and server-side authorization.
- [Apple one-time code text content type](https://developer.apple.com/documentation/uikit/uitextcontenttype/onetimecode): supports platform-aware code entry if the provider uses a verification code.
- [Google SMS Retriever API overview](https://developers.google.com/identity/sms-retriever/overview): supports friction-reduced SMS code handling on Android when the provider flow uses SMS.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field and form errors.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible progress, verification, and redirect states.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/screen-list.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/01-ops-role-home.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/08-security/authorization-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/auth.ts`
- `packages/shared/src/contracts/api.ts`

## Information Architecture
Top-level layout:

1. Header.
2. Courier workspace card.
3. Credential form.
4. Security and session guidance.
5. Recovery links.
6. Error or lockout panel.

Header:

- Title: `Courier sign in`
- Subtitle: `Access assigned doorstep jobs`
- No assignment count.
- No receiver address.
- No proof action.

Courier workspace card:

- Label: `Final-mile courier workspace`
- Copy: `Sign in with your approved courier account before accepting doorstep assignments.`
- Support line: `Assignments and receiver handoff tools appear after role verification.`

Credential form:

- Phone field.
- PIN field or provider-controlled verification step.
- Primary action: `Sign in`
- Secondary action: `Choose another role`

Security guidance:

- `Use only your assigned courier account.`
- `Courier sessions last 12 hours unless revoked.`
- `Sign out when using a shared device.`

Recovery links:

- `Choose another role`
- `Activate staff account`
- `Contact supervisor`
- `Privacy`
- `Terms`

## Credential Model
Preferred courier auth entry:

- Phone plus staff PIN through the configured auth provider.

Provider-controlled code:

- If the provider requires a one-time verification code, use platform code entry behavior.
- iOS may use one-time code content type.
- Android may use SMS code retrieval when provider policy permits.
- Provider code entry must not replace role verification.

Credential rules:

- Do not build a custom credential store.
- Do not persist plaintext PIN.
- Do not log PIN, code, token, phone, or provider debug response.
- Do not reveal whether a phone number exists.
- Do not show raw provider messages to users.
- Do not allow local fallback when provider is unavailable.
- Disable duplicate submit while a sign-in request is in progress.
- Clear sensitive fields after explicit sign-out or provider rejection.

Device trust:

- Biometric re-entry may be offered only after an initial successful sign-in and backend role verification.
- Biometric re-entry unlocks local session access only if backend session remains valid.
- If role check fails after biometric re-entry, route to role-denied state.
- Full sign-out must remove local session state.

## Role Gate
Role verification sequence:

1. User submits credential.
2. Provider authenticates identity.
3. App receives provider token.
4. App sends token to backend-authorized route or session bootstrap.
5. Backend resolves `AuthPrincipal`.
6. App checks role is `final_mile_courier`.
7. App stores only approved session state.
8. App routes to courier workspace.

Allowed route after success:

- `/(ops)/courier/home`
- Intended courier deep link if route guard confirms it is courier-only.

Denied route after role mismatch:

- Stay on sign-in route.
- Show role-safe denied state.
- Offer role selection.
- Do not reveal resolved role in user-facing copy unless product security policy explicitly allows staff role disclosure.

Role-denied copy:

- Title: `This account cannot open courier work`
- Body: `Use the correct staff route or contact your supervisor if your courier account is not provisioned.`
- Primary action: `Choose another role`
- Secondary action: `Contact supervisor`

## Deep Link Behavior
Supported intended destinations:

- `/(ops)/courier/home`
- `/(ops)/courier/assignments`
- `/(ops)/courier/assignments/:deliveryId`
- `/(ops)/courier/assignments/:deliveryId/accept-scan`
- `/(ops)/courier/assignments/:deliveryId/out-for-delivery`
- `/(ops)/courier/assignments/:deliveryId/proof`
- `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- `/(ops)/courier/issues`

Rules:

- Store intended destination only after it passes courier-route allowlist.
- Do not store public URLs, admin URLs, sender URLs, driver URLs, or station URLs as intended destination.
- After success, route to intended destination only if session and role are valid.
- If intended destination requires assignment access, destination screen still performs assignment scope checks.
- If intended destination is stale or invalid, route to `/(ops)/courier/home`.

## State Model
```ts
type CourierSignInState =
  | { kind: "ready"; form: CourierSignInForm }
  | { kind: "submitting"; form: CourierSignInForm }
  | { kind: "provider_verifying"; form: CourierSignInForm }
  | { kind: "role_checking" }
  | { kind: "redirecting"; destination: string }
  | { kind: "invalid_credentials"; form: CourierSignInForm; remainingAttempts?: number }
  | { kind: "too_many_attempts"; retryAfterSeconds?: number }
  | { kind: "account_locked"; unlockAt?: string }
  | { kind: "role_denied" }
  | { kind: "inactive_account" }
  | { kind: "session_expired" }
  | { kind: "network_error"; form: CourierSignInForm }
  | { kind: "provider_unavailable"; form: CourierSignInForm }
  | { kind: "api_error"; requestId?: string };
```

```ts
type CourierSignInForm = {
  phone: string;
  pin: string;
  oneTimeCode?: string;
  rememberDeviceIntent: boolean;
  intendedDestination?: string;
};
```

Derived values:

- `canSubmit`
- `phoneError`
- `pinError`
- `statusMessage`
- `submitLabel`
- `isSensitiveInputVisible`
- `isRoleVerified`
- `safeIntendedDestination`
- `lockoutCopy`

## State Requirements
### `ready`
- Form is visible.
- Submit is enabled only when phone and PIN meet local basic shape checks.
- Recovery links are visible.

### `submitting`
- Submit disabled.
- Inputs remain visible.
- Status says `Signing in...`
- Duplicate submit is blocked.

### `provider_verifying`
- Provider has accepted initial credential.
- App waits for provider verification.
- Status says `Verifying credentials...`

### `role_checking`
- Provider identity succeeded.
- App checks backend role and session claims.
- No courier data visible yet.
- Status says `Checking courier access...`

### `redirecting`
- Role verified.
- Session state saved.
- Status says `Opening courier workspace...`

### `invalid_credentials`
- Use generic error.
- Do not say whether phone or PIN was wrong.
- Preserve phone if policy allows.
- Clear PIN field.

### `too_many_attempts`
- Show wait guidance.
- Disable submit until retry policy allows.
- Keep recovery routes visible.

### `account_locked`
- Route to account locked screen or show locked panel.
- Do not expose internal lockout counters.
- Show supervisor guidance.

### `role_denied`
- Do not open courier workspace.
- Clear sensitive fields.
- Offer role selection and supervisor contact.

### `inactive_account`
- Tell user account cannot open courier work.
- Route to activation if enabled.
- Do not allow local override.

### `session_expired`
- Explain session expired.
- Let courier sign in again.
- Preserve intended courier route only if allowlisted.

### `network_error`
- Keep form visible.
- Explain network issue.
- Do not imply credentials are invalid.

### `provider_unavailable`
- Explain sign-in provider is unavailable.
- Offer retry.
- Do not allow offline sign-in.

### `api_error`
- Show generic issue with request ID when available.
- Do not reveal token or claim details.

## Form Fields
Phone field:

- Label: `Phone number`
- Keyboard: phone.
- Autocomplete: telephone where platform supports it.
- Country default: Ghana if product locale uses Ghana defaults.
- Validation: non-empty and phone-shaped before submit.
- Error: `Enter the phone number for your courier account.`

PIN field:

- Label: `Staff PIN`
- Input: secure text by default.
- Show or hide toggle allowed.
- Validation: non-empty and product-defined PIN shape.
- Error: `Enter your staff PIN.`

Provider code field:

- Label: `Verification code`
- Only appears when provider requests it.
- Supports platform one-time code entry.
- Error: `Enter the verification code.`

Remember device:

- Optional if product policy enables it.
- Copy: `Use this device for faster re-entry after courier access is verified.`
- Must not bypass backend session expiry.

## Copy System
Header:

- Title: `Courier sign in`
- Subtitle: `Access assigned doorstep jobs`

Workspace card:

- Title: `Final-mile courier workspace`
- Body: `Sign in before accepting package custody, starting doorstep delivery, or completing receiver handoff.`

Security copy:

- `Courier access is verified before assignments appear.`
- `Use only your approved Kra courier account.`
- `Sign out when sharing a device.`

Primary action:

- `Sign in`

Secondary:

- `Choose another role`

Staff activation:

- `Activate staff account`

Invalid credentials:

- Title: `Could not sign in`
- Body: `Check your courier credentials and try again.`

Lockout:

- Title: `Account temporarily locked`
- Body: `Too many sign-in attempts were made. Wait before trying again or contact your supervisor.`

Network:

- Title: `Network issue`
- Body: `Courier sign-in needs a connection. Check network and try again.`

Provider unavailable:

- Title: `Sign-in service unavailable`
- Body: `The authentication service is not responding. Try again shortly.`

Role denied:

- Title: `This account cannot open courier work`
- Body: `Use the correct staff route or contact your supervisor if your courier account is not provisioned.`

Session expired:

- Title: `Session expired`
- Body: `Sign in again to continue courier work.`

## Component Inventory
### `CourierSignInScreen`
Responsibilities:

- Own route state.
- Parse intended destination.
- Render auth states.
- Submit credentials.
- Verify role.
- Redirect after success.

Test IDs:

- `screen-courier-sign-in`
- `courier-sign-in-scroll`

### `CourierSignInHero`
Responsibilities:

- Show route identity.
- Clarify courier workspace.
- Avoid assignment preview.

Test IDs:

- `courier-sign-in-hero`
- `courier-sign-in-role-label`

### `CourierCredentialCard`
Responsibilities:

- Render phone and PIN fields.
- Render provider code field when required.
- Render submit button.
- Render password visibility control if enabled.

Test IDs:

- `courier-sign-in-credential-card`
- `courier-sign-in-phone-input`
- `courier-sign-in-pin-input`
- `courier-sign-in-code-input`
- `courier-sign-in-submit`

### `CourierSecurityNote`
Responsibilities:

- Show session TTL and shared-device guidance.
- Explain assignments appear after verification.

Test IDs:

- `courier-sign-in-security-note`
- `courier-sign-in-session-ttl`

### `CourierAuthStatusPanel`
Responsibilities:

- Render invalid credential, lockout, role denied, network, provider, API, and expired-session states.
- Announce changes accessibly.

Test IDs:

- `courier-sign-in-status-panel`
- `courier-sign-in-error-message`
- `courier-sign-in-lockout-message`

### `CourierSignInRecoveryLinks`
Responsibilities:

- Route to role selection.
- Route to activation.
- Route to supervisor/support guidance.
- Route to privacy and terms.

Test IDs:

- `courier-sign-in-role-selection`
- `courier-sign-in-activate-account`
- `courier-sign-in-contact-supervisor`
- `courier-sign-in-privacy`
- `courier-sign-in-terms`

## Visual Direction
Art direction:

- Clean field-ops sign-in.
- Light background with a narrow route-to-door motif.
- Strong role badge.
- Compact credential surface.
- No decorative delivery cards.

Color:

- Background: warm off-white.
- Primary ink: deep graphite.
- Courier accent: route blue with green handoff accent.
- Warning: amber.
- Error: red.
- Focus: high-contrast blue.

Layout:

- Single column mobile.
- Hero at top.
- Credential card centered in reading flow.
- Recovery links below form.
- Error panel appears above submit or below form depending severity.

Avoid:

- Photos of couriers.
- Receiver door visuals that imply live assignment.
- Map pins.
- Package details.
- Admin console styling.
- Sender marketing copy.

## Accessibility Requirements
Focus:

- Initial focus on screen title.
- Error state moves focus to status panel.
- Provider code request moves focus to code field.
- Role denied moves focus to role-denied title.

Form:

- Every field has visible label.
- Secure PIN field has accessible show/hide label.
- Required fields are indicated in text.
- Errors are tied to fields.
- Submit disabled reason is available.

Status messages:

- Announce submitting.
- Announce provider verification.
- Announce role checking.
- Announce redirecting.
- Announce invalid credentials.
- Announce lockout.
- Announce network issue.

Touch:

- Submit and recovery links meet target size.
- Show/hide PIN control meets target size.
- Role selection link is not cramped with activation link.

Large text:

- Credential card reflows without clipping.
- Submit remains visible after keyboard opens.
- Error text wraps without overlap.

Reduced motion:

- No looping animation.
- Use simple state changes.
- Redirect state uses text and accessible status.

## Security Requirements
Credential handling:

- Never store plaintext PIN.
- Never write PIN to logs or analytics.
- Never include phone, PIN, code, token, or raw provider response in crash logs.
- Clear PIN after failed submit.
- Clear all sensitive inputs after sign-out.

Token handling:

- Store tokens only in approved secure storage.
- Verify token freshness before opening courier workspace.
- Refresh or reauthenticate according to provider policy.
- Remove token on sign-out.

Enumeration resistance:

- Invalid phone, invalid PIN, inactive user, and non-existing account should use generic copy where policy requires.
- Role denied should not reveal private account data.
- Lockout copy should not expose exact internal thresholds.

Authorization:

- Auth success is not enough.
- Backend role check must pass.
- Courier routes must still enforce route guards.
- Assignment screens must still enforce assignment scope.

## Analytics
Events:

- `courier_sign_in_viewed`
- `courier_sign_in_submit_started`
- `courier_sign_in_provider_verified`
- `courier_sign_in_role_check_started`
- `courier_sign_in_succeeded`
- `courier_sign_in_failed`
- `courier_sign_in_role_denied`
- `courier_sign_in_locked`
- `courier_sign_in_session_expired`
- `courier_sign_in_role_selection_tapped`
- `courier_sign_in_activation_tapped`

Allowed properties:

- `screen_id`
- `route`
- `auth_method`
- `result`
- `failure_bucket`
- `network_state`
- `intended_destination_type`
- `provider_name` when not sensitive

Forbidden properties:

- phone
- PIN
- verification code
- token
- raw claim values
- raw provider error
- full intended URL
- receiver data
- delivery ID
- assignment ID

## Performance Requirements
Initial render:

- Route shell appears immediately.
- No network call blocks static auth UI.
- Provider SDK initialization shows non-blocking status if delayed.

Submit:

- Disable submit on first tap.
- Avoid duplicate provider calls.
- Keep typed phone visible.
- Clear only sensitive field after auth failure.

Redirect:

- Role check should route as soon as backend confirms role.
- If destination is unavailable, route to courier home.

Low bandwidth:

- Auth UI remains usable.
- Network failure copy is distinct from invalid credential copy.
- No offline sign-in promise.

## QA Acceptance
Render:

- Route renders `screen-courier-sign-in`.
- Header says `Courier sign in`.
- Workspace copy says final-mile courier.
- No assignments are shown before verification.

Form:

- Phone field renders.
- PIN field renders.
- Submit is disabled until required fields pass local checks.
- PIN visibility toggle works if enabled.
- Provider code field appears only when required.

Auth flow:

- Submit triggers provider auth.
- Provider success triggers backend role check.
- `kra_role=final_mile_courier` routes to courier home.
- Intended courier destination is honored after role success.
- Invalid intended destination routes to courier home.

Role gate:

- `driver` role is denied.
- `station_operator` role is denied.
- `sender` role is denied.
- `ops_admin` role is denied.
- `finance_admin` role is denied.
- `support_admin` role is denied.
- `super_admin` role is denied.

Errors:

- Invalid credentials show generic error.
- Too many attempts show wait state.
- Account locked routes or shows locked panel.
- Network error does not say credentials are wrong.
- Provider unavailable does not permit local bypass.
- Session expired lets courier sign in again.

Security:

- PIN is not logged.
- Phone is not sent to analytics.
- Token is not shown in UI.
- Raw claims are not shown.
- Assignments do not render before role check.

Accessibility:

- Screen reader announces title.
- Field labels are visible.
- Errors are announced.
- Submit status is announced.
- Role denied state is announced.
- Large text reflows.
- Focus order is logical.

## Unit Test Targets
Pure functions:

- `parseCourierSignInDestination`
- `isCourierDestinationAllowed`
- `validateCourierSignInForm`
- `deriveCourierSignInSubmitState`
- `deriveCourierRoleGateResult`
- `sanitizeCourierSignInAnalytics`
- `getCourierAuthRecoveryAction`

Test cases:

- Valid courier home destination is allowed.
- Valid courier assignment destination is allowed.
- Driver route destination is rejected.
- Station route destination is rejected.
- Admin route destination is rejected.
- Public URL destination is rejected.
- Empty phone blocks submit.
- Empty PIN blocks submit.
- `final_mile_courier` passes role gate.
- `driver` fails role gate.
- `station_operator` fails role gate.
- `sender` fails role gate.
- Analytics sanitizer removes phone and token values.

## Integration Test Targets
Render:

- `screen-courier-sign-in` appears.
- Credential card appears.
- Security note appears.
- Recovery links appear.

Submit success:

- Fill phone and PIN.
- Provider returns token.
- Backend role check returns `final_mile_courier`.
- App routes to `/(ops)/courier/home`.

Deep link:

- Open protected courier assignment route while signed out.
- Redirect to sign-in with safe intended destination.
- Sign in as courier.
- App routes to intended courier route.

Role denied:

- Sign in with driver role.
- Role-denied panel appears.
- App does not show courier home.

Failure:

- Provider rejects credential.
- Generic error appears.
- PIN clears.
- Phone handling follows product policy.

## End-To-End Test Targets
Critical:

- Courier signs in and reaches courier home.
- Courier opens assigned job deep link while signed out, signs in, and reaches job detail.
- Wrong-role staff cannot enter courier workspace.
- Expired session returns to courier sign-in and then resumes allowed courier route.
- Network error blocks sign-in without losing role-safe recovery.

Regression:

- No assignment data appears pre-auth.
- No receiver data appears pre-auth.
- No token or raw claim text appears.
- Lockout state prevents further local submit until policy allows retry.
- Choosing another role clears sensitive fields.

## Test IDs
Required:

- `screen-courier-sign-in`
- `courier-sign-in-scroll`
- `courier-sign-in-hero`
- `courier-sign-in-role-label`
- `courier-sign-in-credential-card`
- `courier-sign-in-phone-input`
- `courier-sign-in-pin-input`
- `courier-sign-in-code-input`
- `courier-sign-in-submit`
- `courier-sign-in-security-note`
- `courier-sign-in-session-ttl`
- `courier-sign-in-status-panel`
- `courier-sign-in-error-message`
- `courier-sign-in-lockout-message`
- `courier-sign-in-role-selection`
- `courier-sign-in-activate-account`
- `courier-sign-in-contact-supervisor`
- `courier-sign-in-privacy`
- `courier-sign-in-terms`

## Implementation Notes For Claude Code
Build `CourierSignIn` as a role-specific staff auth gate. Reuse the shared staff auth adapter and driver sign-in discipline, but change the role target, copy, route allowlist, and success destination for final-mile courier operations.

Implementation boundaries:

- Authenticate through the configured provider.
- Verify backend role is exactly `final_mile_courier`.
- Route success to `/(ops)/courier/home` unless a safe courier deep link is present.
- Do not show courier assignments before role check.
- Do not implement account creation.
- Do not implement public tracking.
- Do not implement proof capture.
- Do not implement assignment acceptance.
- Do not implement courier onboarding.
- Do not implement admin sign-in.

Acceptance gate:

- The route renders behind `screen-courier-sign-in`.
- Only `final_mile_courier` passes the route gate.
- Wrong roles stay out of courier workspace.
- Sensitive credentials never appear in analytics, logs, UI debug text, or route params.
- Session expiry and lockout states are covered.
- Deep link recovery allows only courier routes.
