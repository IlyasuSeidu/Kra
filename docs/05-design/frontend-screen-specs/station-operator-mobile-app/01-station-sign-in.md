# Station Sign In Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationSignIn` |
| App | `apps/mobile` |
| Route | `/(auth)/station/sign-in` |
| Primary test ID | `screen-station-sign-in` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | Firebase authentication, bearer token verification, `AuthPrincipal`, `roleSchema`, `stationIdSchema`, `kra_role`, `kra_station_id`, station operator role/station claim rules, shared auth state components |
| Related routes | `/(auth)/role-selection`, `/(auth)/staff/activate`, `/(auth)/phone-login`, `/(auth)/session-expired`, `/(ops)/home`, `/(ops)/station/overview`, `/(ops)/support` |
| Required states | `ready`, `submitting`, `authenticated`, `redirecting`, `invalid_credentials`, `too_many_attempts`, `account_locked`, `role_denied`, `missing_station_scope`, `station_inactive`, `session_expired`, `network_error`, `provider_unavailable`, `api_error` |

## Product Job
This screen authenticates a station operator into the field operations mobile app and confirms that the account has station-scoped authority before station work is shown.

The screen answers one operational question: `Can this person safely enter the station operator workspace for a specific station?`

The station operator should be able to:
- Enter the approved staff sign-in credential.
- Understand this route is for station operators only.
- Submit once without duplicate attempts.
- Recover from invalid credential, rate-limit, locked account, network, session, and provider states.
- See clear guidance when the account is not a station operator account.
- See clear guidance when the account is missing station scope.
- Continue to station overview after role and station claim checks pass.
- Choose a different role entry route if they are in the wrong sign-in path.
- Contact supervisor/support when access is provisioned incorrectly.

This screen is not:
- A sender sign-in route.
- A driver sign-in route.
- A courier sign-in route.
- An admin sign-in route.
- A station selection picker.
- A role override route.
- A station activation tool.
- A user provisioning tool.
- A delivery search screen.
- A place to reveal whether a phone or staff identity exists.

## Audience
Primary audience:
- Station operators signing in at the beginning of a shift.
- Station leads sharing operational guidance but not sharing accounts.
- Queue operators switching from locked or expired sessions.

Secondary audience:
- Claude Code implementing the station auth route.
- QA validating role gates and station-scope handling.
- Security reviewers checking auth copy and enumeration resistance.
- Operations leads validating station operator onboarding safety.
- Accessibility reviewers checking login form behavior.

## User State
The user is at or near a station and needs to start operational work. They may be under time pressure, using a shared work phone, or recovering from an expired session.

The user may be:
- Starting a station shift.
- Returning after session expiry.
- Using the wrong role sign-in route.
- Missing a station assignment in backend claims.
- Locked out after too many attempts.
- On a weak network.
- Waiting for supervisor provisioning.

The screen must:
- Authenticate through the approved provider.
- Treat backend/Firebase token claims as authority.
- Require `kra_role` to resolve to `station_operator`.
- Require `kra_station_id` to exist for station operator work.
- Route valid station operators to `/(ops)/station/overview` or shared `/(ops)/home` if the app shell needs role routing first.
- Reject sender, driver, courier, finance, support, ops admin, and super admin accounts from the station route.
- Avoid account enumeration.
- Avoid exposing raw token claims.
- Avoid letting users choose station scope on the client.

## Authentication Model
Current backend model:
- Server verifies Firebase ID token.
- `AuthPrincipal.userId` is derived from token UID.
- `AuthPrincipal.role` is derived from `kra_role`.
- `AuthPrincipal.stationId` is derived from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from `getCapabilities(role)`.
- `AuthPrincipal.authMethod` is `firebase_id_token`.

Station requirement:
- `role` must be `station_operator`.
- `stationId` must be present.
- Station-scoped delivery access later checks origin or destination station against `principal.stationId`.

Allowed successful role:
- `station_operator`.

Denied roles:
- `sender`.
- `driver`.
- `final_mile_courier`.
- `ops_admin`.
- `finance_admin`.
- `support_admin`.
- `super_admin`.

Role-denied copy must not reveal internal claim values unless the user is in a supervised staff activation context.

## Credential Model
Preferred station operator auth entry:
- Phone or approved staff credential, depending on the configured mobile auth provider.
- The station app must use the shared mobile auth adapter, not a custom credential store.

Field guidance:
- If phone-based auth is configured, use phone number plus verification challenge flow.
- If staff PIN is configured, PIN must be handled by the approved auth provider or secure staff activation flow.
- If email/password is configured for station staff, use provider security controls and do not store passwords locally.

This spec is credential-provider neutral because the backend authority is the verified token and claims. Claude Code should wire the existing auth provider selected by the app platform.

## Primary Action
Primary action by state:
- `ready`: sign in.
- `submitting`: wait.
- `authenticated`: verify station access.
- `redirecting`: continue to station overview.
- `invalid_credentials`: try again.
- `too_many_attempts`: wait or contact supervisor.
- `account_locked`: contact supervisor.
- `role_denied`: choose a different role route.
- `missing_station_scope`: contact supervisor.
- `station_inactive`: contact supervisor or support.
- `session_expired`: sign in again.
- `network_error`: retry.
- `provider_unavailable`: try later.
- `api_error`: retry or support.

Secondary actions:
- `Choose another role`
- `Staff activation`
- `Contact supervisor`
- `Open support`
- `Privacy`
- `Terms`

Blocked behavior:
- Do not show station overview until token is verified and role/station claims are valid.
- Do not let user manually type or choose `stationId`.
- Do not let denied roles continue into station routes.
- Do not reveal whether a credential belongs to a real account.
- Do not store plaintext credentials.
- Do not keep a stale station claim after sign-out.
- Do not create delivery, station, or issue records from this screen.

## First Meaningful Value
First meaningful value is reached when the user sees:
- Station operator sign-in title.
- What credential is expected.
- Primary sign-in control.
- Role-switch link.
- Security guidance about using assigned staff accounts.
- Clear recovery route.

The first viewport must answer:
- `Is this the station sign-in route?`
- `What do I enter?`
- `What happens after sign-in?`
- `What if this is not my role?`
- `What if my station access is missing?`

## Main Tension
Station sign-in must be fast enough for shift start, but strict enough to prevent wrong-role access and station-scope leakage. A station operator cannot be allowed to pick a station client-side because station custody depends on backend authority.

The design must balance:
- Fast entry against strong role validation.
- Helpful errors against account enumeration resistance.
- Station-specific routing against no client-side station selection.
- Recovery guidance against support overload.
- Shared auth components against station-specific safety copy.

## Design Brief
User and job:
- Station operator needs secure access to station work queues.

Context of use:
- Mobile, station environment, shift start, shared operational pressure, possible weak network.

Entry point:
- Auth role selection.
- Expired session redirect.
- Deep link to station route.
- Manual station sign-in route.

Success state:
- Station operator token is verified with station scope, then app routes to station overview.

Primary action:
- Sign in.

Navigation model:
- Single focused sign-in screen with role switch and recovery exits.

Density:
- Low. Authentication needs confidence, not operational detail.

Visual thesis:
- A secure station doorway: calm, direct, station-specific, and resistant to wrong-role ambiguity.

Restraint rule:
- Avoid route maps, station queue previews, delivery counts, and anything that exposes operational data before auth passes.

Product lens:
- Access safety, station accountability, and shift-start speed.

System stance:
- Auth provider entry plus strict role/station claim gate.

Interaction thesis:
- Identify as station operator, authenticate, verify station scope, enter station workspace.

Signature move:
- A compact `Station access check` panel after credential success that shows role and station scope were checked before routing.

Activation event:
- User signs in, switches role, opens activation, contacts support, or retries after error.

## Elite Quality Gate
This spec is not closed unless `StationSignIn` prevents wrong-role and missing-station access before any station data renders.

Non-negotiable quality requirements:
- Screen clearly says station operator sign-in.
- Credential errors are generic.
- Rate limit and lockout states are clear.
- `station_operator` role is required.
- `stationId` claim is required.
- Station scope cannot be selected client-side.
- Denied roles do not see station data.
- Missing station scope routes to supervisor/support.
- Successful auth clears stale unauthenticated state and redirects safely.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If a wrong role can reach station overview, the screen remains open.
- If a station operator without station scope can continue, the screen remains open.
- If station data renders before auth verification, the screen remains open.
- If errors reveal account existence, the screen remains open.
- If credentials are stored unsafely, the screen remains open.

## Research And Inspiration Notes
Use these sources for quality direction, not visual copying:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): authentication errors should avoid enumeration and must include throttling/lockout protections.
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html): session and verifier behavior should support secure reauthentication and clear authenticator handling.
- [Firebase Authentication documentation](https://firebase.google.com/docs/auth): mobile sign-in should rely on provider-issued tokens and verified authentication state.
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): invalid fields must be identifiable in text and available to assistive technology.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): sign-in progress, denial, and redirect updates must be announced without stealing focus.

Applied decisions:
- Keep errors generic at credential stage.
- Separate provider authentication from station access verification.
- Do not let the UI select or alter station scope.
- Give missing-station users a supervisor/support path.
- Keep operational data hidden until role and station claims pass.

## Information Architecture
The screen uses five stacked regions.

Region 1: Brand and route identity
- Kra station mark.
- `Station sign in`.
- Short security statement.

Region 2: Credential form
- Credential field or provider entry component.
- Verification field if provider uses a second step.
- Primary sign-in button.

Region 3: Station access check
- Appears after provider auth while station role/scope is being checked.
- Shows progress, role check, and station scope check without raw claim values.

Region 4: Recovery and role switch
- Choose another role.
- Staff activation.
- Contact supervisor/support.

Region 5: Legal and device guidance
- Privacy.
- Terms.
- Shared-device reminder.

## Form Specification
Credential field:
- Label depends on provider.
- Phone label: `Staff phone number`.
- Email label: `Staff email`.
- PIN label appears only if provider flow requires it.

Password/PIN field:
- Use secure entry.
- Provide show/hide only if platform policy allows.
- Do not persist value.

Verification code field:
- Used only for provider challenge flow.
- Numeric keyboard when appropriate.
- Resend respects provider cooldown.

Submit button:
- `Sign in`
- Disabled while submitting.
- Disabled when required fields are empty.
- Shows text progress, not only spinner.

Helper copy:
- `Use the staff account assigned to your station.`
- `Station access is checked after sign-in.`

Do not show:
- Station picker.
- Delivery count.
- Queue preview.
- Raw role claim.
- Raw station ID before auth.

## Station Access Check
This panel appears after credential success and before routing.

Checks:
- Token received.
- Token verified by app auth state.
- Role claim present.
- Role is `station_operator`.
- Station scope is present.
- Session is current.

Copy:
- Title: `Checking station access`
- Role success: `Station operator role confirmed`
- Station success: `Station scope confirmed`
- Missing station: `Station access is not assigned to this account.`
- Wrong role: `This account is not set up for station operator access.`

Rules:
- Do not show raw `kra_role`.
- Do not show raw `kra_station_id`.
- Do not route until all checks pass.
- If check fails, sign out or clear the invalid app session where security policy requires.

## Success Routing
Successful condition:
- Auth provider returns valid authenticated session.
- App obtains token.
- Token claims resolve to `role = station_operator`.
- `stationId` exists.
- User status is active when app has access to status.

Routing:
- Preferred route: `/(ops)/station/overview`.
- Acceptable route: `/(ops)/home` if shared role home performs final routing.

Post-success behavior:
- Replace auth route in navigation stack.
- Clear credential fields.
- Clear prior denied-role state.
- Initialize station-scoped cache only after routing.
- Do not preload sensitive station queue data on sign-in screen.

## Role Switch Behavior
Role switch:
- Link: `Choose another role`
- Route: `/(auth)/role-selection`

Allowed role switch outcomes:
- Driver sign-in.
- Courier sign-in.
- Sender sign-in.
- Admin sign-in route when available.

Rules:
- Switching role clears current form values.
- Do not preserve failed credential text in navigation params.
- Do not reveal whether the entered credential belongs to another role.

## Staff Activation Path
Use this path when the user has not activated a staff account.

Entry:
- Link: `Activate staff account`
- Route: `/(auth)/staff/activate`

Activation copy:
- `Use this only if your supervisor has issued activation instructions.`

Rules:
- Do not auto-provision station access.
- Do not let activation choose station scope unless backend activation policy explicitly provides it.
- Return to station sign-in after activation completion.

## Error Mapping
`invalid_credentials`:
- Title: `Could not sign in`
- Body: `Check the details and try again.`
- Keep account existence generic.

`too_many_attempts`:
- Title: `Too many attempts`
- Body: `Wait before trying again, or contact your supervisor.`
- Disable submit until provider cooldown allows retry.

`account_locked`:
- Title: `Account access locked`
- Body: `Contact your supervisor before trying again.`
- Primary action: contact supervisor/support.

`role_denied`:
- Title: `Station access unavailable`
- Body: `This account is not set up for station operator access. Choose another role or contact your supervisor.`
- Primary action: choose another role.

`missing_station_scope`:
- Title: `Station assignment missing`
- Body: `This account needs a station assignment before station work can open. Contact your supervisor.`
- Primary action: contact supervisor.

`station_inactive`:
- Title: `Station access paused`
- Body: `Station work is not available for this account right now. Contact your supervisor.`
- Primary action: contact supervisor.

`session_expired`:
- Title: `Sign in again`
- Body: `Your session expired. Sign in to continue station work.`
- Primary action: sign in.

`network_error`:
- Title: `Connection problem`
- Body: `Check the connection and try again.`
- Primary action: retry.

`provider_unavailable`:
- Title: `Sign-in service unavailable`
- Body: `Try again later. If your shift is blocked, contact your supervisor.`
- Primary action: retry.

`api_error`:
- Title: `Could not verify access`
- Body: `Sign-in completed, but station access could not be verified. Try again.`
- Primary action: retry verification.

## State Matrix
`ready`:
- Show route identity, credential form, sign-in button, role switch, activation, and legal links.

`submitting`:
- Disable fields.
- Show progress text.
- Prevent duplicate submit.

`authenticated`:
- Hide credential fields or mark them complete.
- Show station access check.

`redirecting`:
- Show `Opening station workspace`.
- Replace route when complete.

`invalid_credentials`:
- Show generic error.
- Preserve credential field if provider policy allows.
- Clear secret field.

`too_many_attempts`:
- Show cooldown guidance.
- Disable submit until allowed.

`account_locked`:
- Show supervisor/support path.
- Disable submit.

`role_denied`:
- Show role-safe denial.
- Offer role selection.

`missing_station_scope`:
- Show station assignment missing.
- Offer supervisor/support route.

`station_inactive`:
- Show station access paused.
- Offer supervisor/support route.

`session_expired`:
- Show sign-in again copy.
- Clear stale session state.

`network_error`:
- Show retry.
- Keep non-secret field value if safe.

`provider_unavailable`:
- Show retry later guidance.

`api_error`:
- Show retry verification and support.

## Copy System
Voice:
- Calm.
- Secure.
- Direct.
- Station-specific.
- No blame.

Primary headlines:
- `Station sign in`
- `Checking station access`
- `Opening station workspace`
- `Station access unavailable`
- `Station assignment missing`
- `Sign in again`

Button copy:
- `Sign in`
- `Continue`
- `Try again`
- `Choose another role`
- `Activate staff account`
- `Contact supervisor`
- `Open support`

Security copy:
- `Use only your assigned staff account.`
- `Station access is checked after sign-in.`
- `Do not share staff credentials.`

Avoid:
- `Account not found`.
- `Wrong role: driver`.
- Raw token claim copy.
- Station IDs in error copy.
- Friendly jokes.

## Layout And Interaction
Mobile layout:
- One-column form.
- Strong route title.
- Short helper text.
- Form controls large enough for field use.
- Recovery links below primary action.
- Legal links at bottom.

Keyboard:
- Phone/email field uses appropriate keyboard.
- Submit key triggers sign-in only when valid.
- Secret field supports secure input behavior.

Loading:
- Use progress text.
- Avoid indefinite animation without text.
- Disable duplicate submit.

Back behavior:
- Back from ready returns to role selection.
- Back during submitting asks user to wait or cancel if provider supports cancellation.
- Back after role denied returns to role selection.

Shared device:
- Show reminder.
- On sign-out, clear station scoped cache according to security policy.
- Do not remember secret values.

## Privacy And Security
Credential handling:
- Do not store plaintext credentials.
- Do not log credential values.
- Do not send credential values to analytics.
- Clear secret fields after failure or navigation.

Enumeration resistance:
- Credential-stage errors are generic.
- Timing should not intentionally reveal account existence.
- Role denial happens only after provider auth and claim check.

Token handling:
- Use provider token lifecycle.
- Do not render token claims.
- Do not persist stale station claims after sign-out.
- Verify session before station route access.

Station data:
- No station operational data before successful route.
- No station queue cache hydration before role/station claim passes.
- Cached station data is actor-scoped and cleared/locked on sign-out.

## Accessibility Requirements
Screen reader:
- Announce route as station sign-in.
- Required fields are marked.
- Errors are announced in text.
- Sign-in progress is announced as status.
- Role denial and station missing states are announced.

Focus:
- Initial focus lands on title or first field depending platform convention.
- On validation error, focus moves to error summary or field.
- On access-check failure, focus moves to failure heading.
- On role switch, form state clears.

Touch:
- Primary and recovery actions meet target-size requirements.
- Secret show/hide control, if present, has accessible label.

Visual:
- Error states do not rely on color alone.
- Large text does not hide recovery actions.
- High contrast mode keeps inputs visible.

Motion:
- Respect reduced motion.
- Do not rely on animation for redirect or access check.

Localization:
- Avoid idioms.
- Keep labels direct.
- Do not concatenate role names into brittle sentences.

## Analytics And Observability
Required analytics events:
- `station_sign_in_viewed`
- `station_sign_in_submit_started`
- `station_sign_in_provider_succeeded`
- `station_sign_in_access_check_started`
- `station_sign_in_succeeded`
- `station_sign_in_failed`
- `station_sign_in_role_denied`
- `station_sign_in_missing_station_scope`
- `station_sign_in_too_many_attempts`
- `station_sign_in_activation_opened`
- `station_sign_in_role_switch_opened`

Allowed analytics fields:
- `authProvider`
- `failureReason`
- `hasStationScope`
- `networkState`
- `attemptBucket`
- `destinationRoute`

Do not send:
- Phone number.
- Email address.
- Password.
- PIN.
- Verification code.
- Token.
- Raw role claim.
- Raw station ID.

Operational metrics:
- Sign-in success rate.
- Role-denied count.
- Missing station scope count.
- Lockout/rate-limit count.
- Provider error rate.
- Time from view to station overview.

## Performance Requirements
Initial render:
- Render route title and form shell immediately.
- Do not block on station data.

Submission:
- Disable duplicate submit within one interaction tick.
- Show progress within 100 milliseconds of submit.
- Avoid expensive work in render.

Access check:
- Validate role/station claims before station data prefetch.
- Redirect within product navigation budget after checks pass.

Failure:
- Errors render without clearing safe non-secret field values unless provider policy requires full reset.

## Test IDs
Primary:
- `screen-station-sign-in`

Header:
- `station-sign-in-title`
- `station-sign-in-subtitle`
- `station-sign-in-security-note`

Fields:
- `station-sign-in-credential`
- `station-sign-in-secret`
- `station-sign-in-verification-code`
- `station-sign-in-field-error`

Actions:
- `station-sign-in-submit`
- `station-sign-in-role-switch`
- `station-sign-in-activate`
- `station-sign-in-contact-supervisor`
- `station-sign-in-open-support`
- `station-sign-in-privacy`
- `station-sign-in-terms`

Access check:
- `station-sign-in-access-check`
- `station-sign-in-role-check`
- `station-sign-in-station-check`
- `station-sign-in-redirecting`

States:
- `station-sign-in-ready`
- `station-sign-in-submitting`
- `station-sign-in-authenticated`
- `station-sign-in-invalid-credentials`
- `station-sign-in-too-many-attempts`
- `station-sign-in-account-locked`
- `station-sign-in-role-denied`
- `station-sign-in-missing-station-scope`
- `station-sign-in-station-inactive`
- `station-sign-in-session-expired`
- `station-sign-in-network-error`
- `station-sign-in-provider-unavailable`
- `station-sign-in-api-error`

## API Integration Notes
Load flow:
- Render station sign-in route.
- Clear stale denied state.
- Initialize shared auth provider state.
- Do not fetch station work data.

Submit flow:
- Validate local credential fields.
- Call configured auth provider.
- Receive authenticated session/token.
- Let app auth layer resolve token.
- Verify `role = station_operator`.
- Verify `stationId` exists.
- Route to station overview or shared ops home.

Denied flow:
- If role is not `station_operator`, show role denied.
- If station scope missing, show missing station scope.
- If session fails, show generic credential/provider error.
- Clear sensitive fields.

Session expired flow:
- Arrive with reason `session_expired`.
- Show sign-in again copy.
- After success, return to intended station route if still authorized.

## QA Acceptance Criteria
Functional:
- Ready state renders title, fields, submit, role switch, and activation.
- Submit disabled while required fields are empty.
- Submit enters submitting state.
- Duplicate submit is prevented.
- Provider success starts station access check.
- Valid `station_operator` with station scope routes to station overview.
- Valid station operator without station scope shows missing station scope.
- Driver account shows role denied.
- Courier account shows role denied.
- Sender account shows role denied.
- Admin account shows role denied for station route.
- Invalid credential shows generic error.
- Too many attempts shows cooldown.
- Locked account shows supervisor path.
- Session expired copy renders.
- Network error allows retry.

Security:
- No station data renders before successful role/station check.
- No station picker exists.
- No raw token claim renders.
- No credential value is sent to analytics.
- Secret fields clear after failure.
- Sign-out clears or locks station scoped cache.

Accessibility:
- Fields have labels.
- Errors are announced.
- Submitting state is announced.
- Role denied state is announced.
- Missing station scope state is announced.
- Recovery links are reachable with large text.

Navigation:
- Role switch opens role selection.
- Activation opens staff activation route.
- Success replaces auth route.
- Session-expired success returns to intended station route when safe.

## Visual Quality Checklist
Before handoff, confirm:
- The screen reads unmistakably as station operator sign-in.
- The first viewport is calm and focused.
- Recovery routes are visible but not competing with submit.
- Wrong-role and missing-station states are clear without leaking claims.
- No station operations data appears pre-auth.
- The screen works for small phones and high-stress shift start.

## Implementation Guardrails For Claude Code
Build this as an auth route only when frontend work begins.

Implementation rules:
- Use the shared auth provider adapter.
- Keep credential validation separate from role/station claim validation.
- Keep station routing behind verified auth state.
- Keep station scope immutable from this screen.
- Keep error mapping generic at credential stage.
- Keep analytics redacted.
- Never render station data before successful claim check.
- Never store secret credential fields.

Suggested file ownership:
- Screen route owns view state and navigation.
- Auth adapter owns provider calls.
- Access-check helper owns role/station validation.
- Error mapper owns provider/auth/access states.
- Recovery links component owns role switch, activation, support, and legal links.

Required implementation tests:
- Valid station operator success.
- Missing station scope denial.
- Wrong role denial.
- Generic invalid credential error.
- Rate-limit state.
- Locked state.
- Session expired return.
- No station picker.
- No station data pre-auth.
- Analytics redaction.

## Open Decisions
No product-blocking decisions remain for this screen.

Implementation may choose:
- Exact auth provider UI component.
- Exact staff activation route behavior.
- Exact support/supervisor contact destination.
- Exact station overview redirect path if shared role home must run first.

Future backend/platform improvement:
- Add a dedicated staff session introspection response for mobile that returns role, station scope presence, user status, and safe display labels without requiring screens to inspect provider claim details directly.

## Final Handoff Notes
`StationSignIn` is a security gate, not a decorative onboarding screen. It must authenticate the user, verify station operator role and station scope, and only then open station operations.

The safest implementation treats Firebase/provider auth as identity proof, backend token claims as authorization input, and station overview as inaccessible until both role and station scope pass.
