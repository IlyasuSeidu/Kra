# Session Expired Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SessionExpired` |
| App | `apps/mobile`, `apps/web`, `apps/admin` |
| Route | `/session-expired` |
| Primary test ID | `screen-session-expired` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 auth safety and protected-route recovery |
| Backend dependency | Firebase token verification with revocation check, auth session store, shared auth policy, route guards, `AuthPrincipal`, role/station claims, API error mapping |
| Related routes | `/(auth)/role-selection`, `/(auth)/phone-login`, `/(auth)/sender/sign-in`, `/(auth)/station/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/courier/sign-in`, `/admin/sign-in`, `/account-locked`, `/permission-denied`, `/support`, `/privacy`, `/terms` |
| Required states | `loading_context`, `expired`, `revoked`, `idle_timeout`, `token_refresh_failed`, `offline_uncertain`, `return_context_ready`, `return_context_unsafe`, `signing_out`, `redirecting_to_sign_in`, `cleared_sensitive_state`, `api_error` |

## Product Job
`SessionExpired` is the safe interruption screen shown when an authenticated session can no longer be trusted. It must stop access to protected content, explain why sign-in is required again, preserve only safe return context, and send the user back to the correct sign-in route.

The screen answers:
- `Why was I stopped?`
- `Can I continue after signing in again?`
- `Which sign-in route should I use?`
- `What happened to the action I was trying to perform?`
- `What protected data has been cleared?`
- `What should I do if I am offline or my account was revoked?`

The user should be able to:
- Understand that their session expired or became invalid.
- Sign in again through the correct route.
- Return to a safe destination after re-authentication.
- Avoid repeating sensitive actions unintentionally.
- Open support when they cannot regain access.
- Choose another role if they used the wrong account.

This screen is not:
- A login form.
- A password reset form.
- A staff activation flow.
- A role picker that grants access.
- A permission denied page.
- An account locked page.
- A stale data viewer.
- A delivery detail fallback.
- An offline outbox repair screen.
- A support conversation.

## Strategic Role
Session expiry is a security feature, but it is also a major operational interruption. A station operator may be scanning a package, a driver may be accepting custody, a courier may be submitting proof, a sender may be paying, and an admin may be approving a refund. The screen must handle that interruption without losing trust or creating unsafe retry behavior.

Core principle:
- Expired or revoked sessions must block protected content immediately.
- The UI may preserve safe navigation intent.
- The UI must not preserve sensitive data or half-submitted privileged actions as if they succeeded.
- Re-authentication must happen through the role-appropriate sign-in route.
- Backend verification remains the final authority after sign-in.

## Audience
Primary users:
- senders returning after a long session
- station operators whose staff session ended during a shift
- drivers whose session ended before or during route work
- final-mile couriers whose session ended in the field
- admins whose console session expired

Secondary users:
- support staff helping a user recover access
- supervisors handling staff session revocation
- QA validating protected route behavior
- security reviewers checking session handling
- Claude Code implementing the shared expired-state route

Non-users:
- public receivers using delivery-scoped tracking access
- anonymous public web visitors
- payment providers
- SMS providers
- webhook callers
- automated backend jobs

## Current Backend Reality
Implemented auth facts:
- Backend verifies Firebase ID tokens.
- Verification uses revocation checks by calling `verifyIdToken(token, true)`.
- Missing auth principal throws `FORBIDDEN` with reason `missing_principal`.
- Missing role claim throws `FORBIDDEN` with reason `missing_role_claim`.
- Invalid role claim throws `FORBIDDEN` with reason `invalid_role_claim`.
- Capability failures throw `FORBIDDEN`.
- Delivery scope failures throw `FORBIDDEN`.
- Admin scope failures throw `FORBIDDEN`.
- Sender session duration is `30 days`.
- Staff mobile session duration is `12 hours`.
- Admin session duration is `8 hours`.
- Inactive staff sessions are revoked immediately on offboarding.

Current API gap:
- Backend does not expose a distinct `SESSION_EXPIRED` error code.
- Backend does not expose a distinct `UNAUTHORIZED` error code.
- Several auth, role, scope, and capability failures all map to `FORBIDDEN`.

Frontend consequence:
- The frontend must not map every `FORBIDDEN` response to `SessionExpired`.
- Provider token state, client session metadata, request context, and safe backend error details must decide whether to show `SessionExpired`, `PermissionDenied`, or `AccountLocked`.
- If the app cannot tell whether the token is expired or the user lacks permission, prefer a safe re-auth route for missing/invalid token state and `PermissionDenied` for known valid-token role/scope denial.

Future backend improvement:
- Add explicit error reasons or codes for:
  - `SESSION_EXPIRED`
  - `TOKEN_REVOKED`
  - `TOKEN_MISSING`
  - `ROLE_CLAIM_MISSING`
  - `ROLE_CLAIM_INVALID`
  - `CAPABILITY_DENIED`
  - `SCOPE_DENIED`

## Session Durations
Sender:
- Method: `phone_otp`.
- Duration: `30 days` unless revoked.
- Expired route should return to sender phone sign-in.

Driver:
- Method: `phone_pin`.
- Duration: `12 hours`.
- Expired route should return to driver sign-in or shared staff sign-in path.

Station operator:
- Method: `phone_pin`.
- Duration: `12 hours`.
- Expired route should return to station sign-in.
- Station scope must be checked again after sign-in.

Final-mile courier:
- Method: `phone_pin`.
- Duration: `12 hours`.
- Expired route should return to courier sign-in.

Admin roles:
- Method: `email_password_mfa`.
- Duration: `8 hours`.
- Expired route should return to admin sign-in.

Receiver public access:
- Delivery-scoped verification grants may expire, but that belongs to receiver public expired screens, not this app-account route.

## Source References
External references used for this screen:
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): supports server-side session expiration, timeout handling, and forced re-authentication after expiration.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports re-authentication after risk events and generic auth errors.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports overall timeout, inactivity timeout, re-authentication, and session termination after timeout.
- [Firebase manage user sessions](https://firebase.google.com/docs/auth/admin/manage-sessions): supports token revocation and server-side revoked-token checks.
- [Firebase Admin Auth API](https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.baseauth): documents `verifyIdToken(idToken, checkRevoked)` behavior for checking revoked tokens.
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/): supports protected route groups and public sign-in routes in Expo Router.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible session-expired and redirect status updates.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear, accessible explanation when user action cannot continue.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/01-auth-role-selection.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/04-passwordless-phone-login.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/02-sender-sign-in.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/01-station-sign-in.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/01-admin-sign-in.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `packages/shared/src/domain/auth-policy.ts`
- `services/api/src/auth.ts`

## Design Brief
Audience:
- A user whose authenticated work was interrupted by expired, revoked, or uncertain auth state.

Surface type:
- Shared auth recovery interruption page.

Primary action:
- Sign in again through the correct route.

Visual thesis:
- A calm security checkpoint that clearly stops protected work, shows what is safe to resume, and gives one confident path back.

Restraint rule:
- Do not show protected content, route previews, operational metrics, delivery details, financial data, or admin context.

## UX Principles
The screen should feel:
- protective
- direct
- non-blaming
- fast to recover from
- clear about what happens next

The screen must not feel:
- punitive
- vague
- like permission denial when it is an auth timeout
- like account lockout when it is session expiry
- like work was saved when it was not confirmed
- like stale protected data is still accessible

Primary promise:
- `Sign in again to continue safely.`

Operational promise:
- `If an action was not confirmed by the server, it must be reviewed or retried after sign-in.`

## Information Architecture
Top-level regions:
- security status heading
- short explanation
- safe return context
- primary sign-in action
- secondary role/support actions
- data-clearing reassurance
- legal links

Mobile layout:
- full-height auth route
- top app mark and security status
- centered content panel
- persistent primary action near bottom
- recovery links below primary action
- no protected tabs visible

Admin web layout:
- centered panel inside unauthenticated shell
- no admin sidebar
- no data table remnants
- no previous page header with protected record names

Sender web/mobile layout:
- safe phone sign-in path
- no sender deliveries shown
- no payment status shown

Ops mobile layout:
- safe staff sign-in path
- no package, route, receiver, proof, or scan state shown
- offline outbox mention only if the app can show a safe count without protected payload

## Route Inputs
Allowed query values:
- `source`
- `reason`
- `lastRole`
- `returnTo`
- `actionContext`

Allowed `source` values:
- `app_launch`
- `protected_route`
- `api_response`
- `token_refresh`
- `manual_sign_out`
- `idle_timeout`
- `provider_revoked`
- `offline_recheck`

Allowed `reason` values:
- `expired`
- `revoked`
- `idle_timeout`
- `refresh_failed`
- `missing_token`
- `invalid_token`
- `unknown`

Allowed `lastRole` values:
- `sender`
- `station_operator`
- `driver`
- `final_mile_courier`
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Allowed `returnTo` values:
- allowlisted protected route path only
- no mutation route
- no provider callback route
- no public tracking token route
- no admin mutation confirmation route

Allowed `actionContext` values:
- `view_only`
- `draft_safe`
- `queued_action_requires_review`
- `mutation_interrupted`
- `payment_return`
- `scan_interrupted`
- `proof_interrupted`

Forbidden query values:
- phone
- code
- PIN
- auth token
- refresh token
- provider credential
- delivery payload
- receiver phone
- payment provider reference
- proof reference
- package scan code
- station assignment
- role claim
- staff user ID

Route input rules:
- Never trust `lastRole` as authority.
- Never render raw `returnTo`.
- Never keep unsafe `returnTo`.
- Clear forbidden query values immediately.
- If `returnTo` is unsafe, show role-based sign-in without return.

## State Model
`loading_context`:
- Validate route context.
- Clear unsafe query values.
- Determine safe sign-in route.

`expired`:
- Token or local session age exceeded policy.
- Show sign-in again.

`revoked`:
- Firebase/backend indicates token revoked or user disabled.
- Show sign-in again with support option.

`idle_timeout`:
- Inactivity timeout reached.
- Show concise timeout copy.

`token_refresh_failed`:
- Provider refresh failed.
- Show sign-in again.

`offline_uncertain`:
- App cannot verify token while offline.
- Do not show protected content.
- Offer retry online and sign-in.

`return_context_ready`:
- Safe return path is available after sign-in.
- Show brief safe context label, not protected data.

`return_context_unsafe`:
- Return path is unsafe or sensitive.
- Drop return path and route to role home after sign-in.

`signing_out`:
- Clear local auth/session state.
- Clear sensitive caches as required.

`redirecting_to_sign_in`:
- Navigate to role-appropriate sign-in.

`cleared_sensitive_state`:
- Confirmation state after local cleanup.

`api_error`:
- Unexpected failure while resolving expired context.
- Offer sign-in again and support.

## State Transitions
Initial:
- `/session-expired` opens in `loading_context`.

Context valid:
- From `loading_context` to `expired`, `revoked`, `idle_timeout`, `token_refresh_failed`, or `offline_uncertain`.

Safe return exists:
- From any terminal expired state to `return_context_ready`.

Unsafe return:
- From any terminal expired state to `return_context_unsafe`.

Primary action pressed:
- From expired state to `signing_out`.

Local cleanup finished:
- From `signing_out` to `redirecting_to_sign_in`.

Route started:
- From `redirecting_to_sign_in` to role-specific sign-in route.

User chooses another role:
- From any expired state to `/(auth)/role-selection`.

User opens support:
- From any expired state to `/support`.

Offline retry:
- From `offline_uncertain` to `loading_context` when network returns.

## Sign-In Route Resolution
Sender:
- Last known role: `sender`.
- Sign-in route: `/(auth)/sender/sign-in`.
- Alternative: `/(auth)/phone-login?intendedRole=sender`.
- Safe post-auth route: sender home or allowlisted sender route.

Station operator:
- Last known role: `station_operator`.
- Sign-in route: `/(auth)/station/sign-in`.
- Safe post-auth route: station overview or role home.
- Must check station scope again after sign-in.

Driver:
- Last known role: `driver`.
- Sign-in route: `/(auth)/driver/sign-in`.
- Safe post-auth route: driver home or role home.

Courier:
- Last known role: `final_mile_courier`.
- Sign-in route: `/(auth)/courier/sign-in`.
- Safe post-auth route: courier home or role home.

Admin roles:
- Last known role: `ops_admin`, `finance_admin`, `support_admin`, or `super_admin`.
- Sign-in route: `/admin/sign-in`.
- Safe post-auth route: admin overview or allowlisted admin route.

Unknown role:
- Sign-in route: `/(auth)/role-selection`.
- Safe post-auth route: none.

## Return Context Rules
Safe return context may include:
- route family
- screen ID
- source reason
- non-sensitive draft route label
- local queued-action count
- whether sign-in can resume a view-only page

Unsafe return context includes:
- mutation submit in progress
- package scan value
- proof upload payload
- receiver address or phone
- payment provider state
- refund decision draft
- admin user mutation draft
- station access changes
- raw issue text
- support message body
- full delivery payload

For unsafe return:
- Drop detailed context.
- Route to role home after sign-in.
- If a local action was queued, send user to action recovery after sign-in only if secure local queue metadata exists.

For safe return:
- Store only allowlisted path and screen ID.
- Re-fetch protected data after sign-in.
- Do not restore protected data from expired memory.

## Content Rules
Default title:
- `Sign in again`

Default body:
- `Your session expired. Sign in again to continue safely.`

Sender body:
- `Your sender session expired. Sign in again to protect your deliveries and account.`

Staff body:
- `Your staff session expired. Sign in again before handling packages.`

Admin body:
- `Your admin session expired. Sign in again before reviewing or changing records.`

Revoked body:
- `This session is no longer valid. Sign in again or contact support if access was changed.`

Offline uncertain body:
- `Kra cannot verify your session while offline. Connect and sign in again before continuing.`

Mutation interrupted body:
- `The action was not confirmed. Sign in again, then review before retrying.`

Queued action body:
- `Some local work may need review after sign-in. Kra will not submit it until your session is valid.`

Primary actions:
- `Sign in again`
- `Continue to sign-in`

Secondary actions:
- `Choose another role`
- `Open support`
- `Go to public tracking`
- `Privacy`
- `Terms`

Avoid:
- `You were logged out for no reason`
- `Try again later` without sign-in path
- `Permission denied`
- `Account locked`
- `Your work was saved` unless backend confirmed it
- raw token or provider errors

## Visual Direction
Style:
- Secure checkpoint, not alarm screen.
- Calm panel with clear heading.
- One dominant action.
- Subtle lock or shield motif only if it does not add clutter.

Color:
- Neutral surface for default expired state.
- Amber accent for interrupted action or offline uncertainty.
- Red only for revoked or blocked state when support action is required.
- Green only after re-authentication succeeds, not on this screen.

Typography:
- Strong title.
- Short body.
- Compact safe-return label.
- No long legal copy in the core panel.

Motion:
- Minimal fade-in.
- No celebratory motion.
- No constant animation.
- Respect reduced motion.

Layout restraint:
- Do not show previous protected screen behind blur.
- Do not show a blurred delivery detail as background.
- Do not show role dashboards.
- Do not show admin tables.

## Privacy And Data Clearing
Immediately hide:
- protected delivery detail
- sender profile
- admin records
- staff assignment queues
- receiver address
- receiver phone
- proof assets
- payment references
- audit metadata
- issue text
- local scan values

Clear from memory when session is known expired:
- auth token
- refresh token if provider requires full sign-out
- one-time code
- staff PIN entry
- provider verification ID
- pending mutation body unless encrypted local queue policy allows retention
- visible protected screen state

Do not clear blindly:
- queued offline action metadata that is required for recovery
- non-sensitive route label
- app settings
- user-selected language
- public onboarding state

Offline queue rule:
- If a staff action exists in secure offline outbox, keep safe metadata only.
- Do not auto-submit queued actions until user signs in again and action recovery validates them.

## Security Rules
Never show protected data after session expiry.

Never auto-retry:
- custody mutation
- package scan
- payment confirmation
- refund approval
- support message submit
- user access change
- proof upload confirmation

Never trust:
- route `lastRole` as authority
- route `returnTo` without allowlist
- local role state after expiry
- stale station scope after expiry
- cached permissions after expiry

Always:
- require sign-in again
- clear sensitive screen state
- re-check backend claims after sign-in
- re-fetch protected data after sign-in
- show safe action recovery for interrupted staff actions
- distinguish expired session from permission denied when possible

## Admin-Specific Rules
Admin sessions last `8 hours`.

Admin session expiry must:
- hide admin console shell
- hide table rows and record names
- clear mutation drafts unless draft retention is approved and secure
- return to `/admin/sign-in`
- preserve only safe return route
- re-run MFA if provider policy requires it

Admin session expiry must not:
- expose audit metadata
- expose payment provider references
- keep refund approval form visible
- keep user access form visible
- auto-submit admin changes after sign-in

## Staff-Specific Rules
Staff sessions last `12 hours`.

Staff session expiry must:
- stop package handling actions
- stop scanner submission
- stop proof upload confirmation
- stop custody mutations
- keep secure offline queue metadata only
- send user to role-specific staff sign-in
- require role/station checks after sign-in

Station operator:
- check station scope again
- do not show station queues while expired

Driver:
- check driver role again
- do not show assigned run detail while expired

Courier:
- check courier role again
- do not show receiver address while expired

## Sender-Specific Rules
Sender sessions last `30 days`.

Sender session expiry must:
- stop delivery creation submit
- stop payment action until sign-in
- hide sender history and profile
- send user to phone sign-in
- preserve safe delivery draft only if draft storage policy allows it
- re-fetch delivery list after sign-in

Sender session expiry must not:
- show receiver phone
- show payment provider references
- auto-submit a payment confirmation
- confirm a delivery draft as created

## Offline Behavior
Offline with known expired session:
- Show expired state.
- Primary action: `Sign in when online`.
- Disable provider sign-in action until network returns if provider requires network.

Offline with uncertain session:
- Show `offline_uncertain`.
- Do not show protected content.
- Offer retry.
- Offer role selection only if it does not expose protected content.

Offline with queued staff action:
- Mention review after sign-in.
- Do not show raw queued payload.
- Do not submit queue until valid session.

Network returns:
- Re-check provider token state.
- If still invalid, keep session expired.
- If valid, run backend claim check before returning.

## Accessibility
Screen structure:
- One `h1`: `Sign in again`.
- One concise explanation paragraph.
- Safe return context as plain text, not only icon.
- Primary action is reachable by keyboard and screen reader.

Focus:
- On load, focus the main heading.
- On signing out, announce status.
- On redirecting, announce destination.
- On offline retry success, focus updated heading or primary action.

Status messages:
- `Session expired.`
- `Clearing secure session.`
- `Redirecting to sign-in.`
- `Connect to sign in again.`
- `Queued work will need review after sign-in.`

Large text:
- Layout supports 200 percent text scaling.
- Primary action remains visible or reachable.
- Safe return context wraps cleanly.
- Support links remain reachable.

Reduced motion:
- Disable slide-in transition.
- Use instant or short fade.
- Avoid background blur animations.

Color:
- Do not rely on color alone.
- Use text labels for expired, revoked, offline, and interrupted action states.

## Telemetry
Allowed events:
- `session_expired_viewed`
- `session_expired_primary_pressed`
- `session_expired_role_selection_pressed`
- `session_expired_support_pressed`
- `session_expired_context_dropped`
- `session_expired_context_preserved`
- `session_expired_sensitive_state_cleared`
- `session_expired_redirect_started`

Allowed properties:
- `source`
- `reason`
- `lastRole`
- `returnContextClass`
- `platform`
- `appVersion`
- `networkState`
- `hadSafeReturn`
- `hadQueuedAction`

Forbidden properties:
- auth token
- refresh token
- phone
- PIN
- code
- user ID
- station ID
- delivery ID
- tracking code
- receiver phone
- receiver address
- package scan code
- payment provider reference
- proof reference
- raw API error body
- mutation payload

## API Error Mapping
Map to `SessionExpired` when:
- provider reports expired token
- provider reports revoked token
- provider reports missing token
- token refresh fails and no valid session remains
- backend rejects missing principal and client auth state is missing or invalid
- backend rejects token verification due expiry or revocation when safely detectable

Map to `PermissionDenied` when:
- token is valid but capability is denied
- token is valid but role is not allowed
- token is valid but station scope is wrong
- token is valid but delivery is outside actor scope

Map to `AccountLocked` when:
- provider or auth policy reports lockout
- failed attempts threshold triggers lockout
- account inactive status is confirmed

Map to role-specific sign-in when:
- session expired and last role is known
- provider session is cleared
- safe return path is present or absent

Map to role selection when:
- last role is unknown
- route context is unsafe
- user chooses another role

## QA Requirements
Unit tests:
- renders `screen-session-expired`
- validates allowed route reasons
- rejects unsafe query values
- drops unsafe return paths
- preserves safe return route labels
- maps sender to sender sign-in
- maps station operator to station sign-in
- maps driver to driver sign-in
- maps courier to courier sign-in
- maps admin roles to admin sign-in
- maps unknown role to role selection
- clears sensitive state on expired
- hides protected content
- shows offline uncertain state
- shows revoked state
- shows interrupted action copy
- does not call mutation retry

Integration tests:
- protected sender route with expired token lands here
- protected staff route with expired token lands here
- admin route with expired token lands here
- session expired hides previous page shell
- signing in again re-fetches protected data
- unsafe mutation route is not restored
- safe view route is restored after sign-in
- staff queued action routes to action recovery after sign-in
- station operator missing station scope after sign-in routes to permission denied or support
- receiver public expired route does not use this app-account screen

Accessibility tests:
- heading receives initial focus
- status messages announce clearing and redirect
- primary action is keyboard accessible
- large text does not clip content
- reduced motion disables page transition
- offline state is announced
- support link has descriptive text

Security tests:
- no protected content remains visible
- no token appears in DOM
- no token appears in telemetry
- no delivery payload appears in query string
- no receiver phone appears in logs
- no mutation retries before sign-in
- no stale role grants after sign-in
- no stale station scope after sign-in

End-to-end tests:
- sender expired session signs in again and reaches sender home
- driver expired session signs in again and reaches driver home
- station expired session signs in again and station scope is rechecked
- courier expired session signs in again and reaches courier home
- admin expired session signs in again and reaches admin overview
- unsafe return path is dropped and role home opens
- offline uncertain state blocks protected content

## Implementation Notes For Claude Code
Build this as a shared unauthenticated route. Do not build it as a modal over protected content.

When implementation starts later:
- Create `/session-expired`.
- Add primary test ID `screen-session-expired`.
- Put it outside protected route groups.
- Use route guard redirects for expired sessions.
- Use allowlisted return routes only.
- Clear sensitive route params before render.
- Clear protected screen state before showing this page.
- Wire role-specific sign-in resolution through shared auth config.
- Add an explicit API error mapper that separates expired, denied, and locked states.
- Keep receiver public expired-link flows separate.
- Add tests proving mutation retry never happens before sign-in.

Suggested route context type:
```ts
export type SessionExpiredRouteContext = {
  source:
    | "app_launch"
    | "protected_route"
    | "api_response"
    | "token_refresh"
    | "manual_sign_out"
    | "idle_timeout"
    | "provider_revoked"
    | "offline_recheck";
  reason:
    | "expired"
    | "revoked"
    | "idle_timeout"
    | "refresh_failed"
    | "missing_token"
    | "invalid_token"
    | "unknown";
  lastRole?: "sender" | "station_operator" | "driver" | "final_mile_courier" | "ops_admin" | "finance_admin" | "support_admin" | "super_admin";
  returnTo?: string;
  actionContext?: "view_only" | "draft_safe" | "queued_action_requires_review" | "mutation_interrupted" | "payment_return" | "scan_interrupted" | "proof_interrupted";
};
```

Suggested route decision type:
```ts
export type SessionExpiredDecision =
  | { type: "sign_in"; route: string; safeReturnTo?: string }
  | { type: "role_selection" }
  | { type: "support"; reason: string }
  | { type: "wait_for_network" };
```

Do not ship:
- protected content behind blur
- stale admin table behind expired panel
- automatic mutation retry
- raw provider error copy
- unvalidated return route
- receiver public expired-link routing through this page
- role or station authority from route params

## Performance Requirements
Initial render:
- Under `500ms` after route redirect.

Sensitive data hiding:
- Immediate before or during redirect.
- No visual flash of protected content.

Sign-in redirect:
- Starts under `150ms` after primary action once local cleanup completes.

Offline retry:
- Re-check state under `500ms` after network restoration signal.

Low-end mobile:
- No heavy imagery.
- No remote assets required.
- Text-only state must be complete.

## Open Product Decisions
Decision needed before implementation:
- Whether the app should warn before staff sessions expire or only show this page after expiry.
- Whether sender sessions receive an inactivity timeout in addition to the 30-day overall duration.
- Whether admin web should auto-save secure drafts before session expiry or always drop mutation drafts.
- Whether staff offline outbox should show only a count or a safe action class after expiry.
- Whether revocation copy should mention supervisor/admin action or stay generic for all roles.
- Whether a distinct backend `SESSION_EXPIRED` error code will be added.
- Whether a distinct backend `TOKEN_REVOKED` error code will be added.

## Acceptance Criteria
The spec is complete when:
- Route and test ID are explicit.
- Session durations for sender, staff, and admin roles are represented.
- Current backend error-code ambiguity is documented.
- Expired, revoked, idle timeout, refresh failure, and offline uncertainty are separate states.
- Safe and unsafe return context rules are defined.
- Protected data hiding is mandatory.
- Mutation retry before sign-in is forbidden.
- Role-specific sign-in routing is clear.
- Receiver public expiry is excluded.
- Accessibility, security, analytics, and QA rules are testable.

## Final Implementation Boundary
`SessionExpired` should be a safe interruption and recovery route, not a protected data page.

Current implementation should:
- stop protected access
- clear sensitive state
- show one sign-in action
- route by last known role only as a hint
- re-check backend claims after sign-in

Future implementation may:
- add pre-expiry warnings
- add richer secure draft recovery
- use explicit backend session error codes

This screen is successful only if a user can recover quickly and the system never leaks or mutates protected data after the session is no longer trusted.
