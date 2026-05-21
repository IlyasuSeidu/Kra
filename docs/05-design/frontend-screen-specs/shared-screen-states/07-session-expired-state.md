# Session Expired State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `session_expired` |
| Component family | Shared screen state |
| Primary component | `SharedSessionExpiredState` |
| Supporting components | `SessionExpiredCard`, `SafeReturnContext`, `SignInRouteAction`, `SensitiveStateClearanceNotice`, `SessionReasonStrip`, `OfflineSessionCaveat`, `ReauthResultAnnouncement` |
| Primary surfaces | sender mobile app, operations mobile app, admin web console, sender web shell, protected public web shells |
| Required recovery | sign in again through the correct route, clear sensitive state, preserve only safe return context |
| Test id root | `state-session-expired` |
| Backend coverage | Firebase ID token verification, revoked token checks, shared auth policy, `AUTH_REQUIRED`, token missing, token invalid, token revoked, idle timeout, local session expiry |
| Browser mutation operation | None |
| Data sensitivity | last role, safe route group, safe return route, non-sensitive action label, request id, session reason |
| Offline critical | Yes for operations mobile because expired sessions must block protected mutation and offline queue writes |
| Related inventory state | `session_expired` |
| Related state specs | loading, error, offline, not authorized, stale data, rate limited, blocked by issue |
| Design tokens | `brand.blue.600`, `warning.amber.600`, `danger.red.600`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear session status, focus management, safe redirect announcements, and keyboard-accessible recovery |

## Purpose
`SharedSessionExpiredState` is the shared UI state shown when the app can no longer trust the current authenticated session. It must stop protected access immediately, clear sensitive state, explain the interruption, and route the user to the correct sign-in path.

This state must answer:
- `Why did Kra stop me?`
- `Do I need to sign in again?`
- `Which sign-in route should I use?`
- `Can I return to what I was doing?`
- `Was my action submitted?`
- `Was protected data cleared?`
- `What happens if I am offline?`
- `What if this keeps happening?`

The most important rule is:
```text
Expired or untrusted sessions must not keep protected content visible.
```

## Product Job
Kra users often work in high-friction, time-sensitive contexts: a station operator scanning intake, a driver accepting custody, a courier completing proof, a sender paying, or an admin reviewing refunds. Session expiry must protect the account and the shipment without creating unsafe duplicate actions or hidden data leaks.

The session expired state must:
- stop access to protected routes
- hide protected content immediately
- clear sensitive local state
- preserve only safe return context
- route to role-appropriate sign-in
- prevent queued protected mutations under expired auth
- explain that sign-in is required again
- tell users whether an action needs review after sign-in
- separate expired session from permission denial and account lock
- keep public policy and support routes available when safe

## Strategic Role
Session expiry is a trust boundary. The user may still be physically present with the device, but Kra cannot assume the current session still belongs to an allowed actor.

The UI must protect:
- delivery details
- receiver names and phones
- addresses
- package descriptions
- proof media
- package scan codes
- payment details
- refund evidence
- internal notes
- station queues
- admin configuration
- user and role management

The user experience should be fast and calm, but never permissive. The right outcome is a clean stop, a safe sign-in route, and a controlled return after successful authentication.

## External Research Used
Only directly relevant session-management, token, HTTP authentication, and accessible status references were used:
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): supports session timeout, renewal, logout, session lifecycle controls, and protecting session identifiers.
- [Firebase manage user sessions](https://firebase.google.com/docs/auth/admin/manage-sessions): supports token revocation and server-side checks for revoked sessions.
- [MDN 401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401): supports authentication-required handling separate from authorization denial.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports session timeouts, inactivity controls, and reauthentication expectations.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for session expiry and redirect state changes.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/05-session-expired.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/06-not-authorized-state.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/auth-policy.ts`
- `services/api/src/auth.ts`
- `services/api/src/app.ts`

## Visual Thesis
Session expired should feel like a secure pause, not a failure. The UI should be minimal, focused, and built around one recovery action.

Use:
- calm security checkpoint card
- blue primary sign-in action
- amber reason strip for idle or refresh failure
- red only for revoked or invalid session
- clear data-clearing reassurance
- safe return context when available
- low-friction support route

Do not use:
- crash-state styling
- permission-denied wording
- account-lock wording
- protected page title from previous route
- raw token or provider detail
- hidden protected content behind overlay
- automatic retry of protected mutation after sign-in

## Audience
Primary users:
- sender whose phone session expired
- station operator whose staff session expired during shift
- driver whose assignment session expired
- final-mile courier whose courier session expired
- admin whose console session expired

Secondary users:
- support staff helping account recovery
- supervisors handling staff device handover
- security reviewer validating session cleanup
- QA validating route protection
- frontend engineer implementing auth provider integration
- Claude Code building the UI later

Non-users:
- anonymous public visitor
- public receiver with delivery-scoped verification
- provider webhook
- scheduled job
- attacker with stale token

## Non-Goals
Do not use session expired for:
- valid session with insufficient role
- station scope denial
- assignment scope denial
- sender ownership denial
- admin capability denial
- account locked
- inactive staff account
- password recovery
- initial sign-in
- public tracking link expiry
- payment provider session failure
- network timeout
- generic server error
- stale data
- rate limit

If the user is authenticated but lacks permission, use not authorized. If the account is locked, use account locked. If the network is down before session status can be checked, use offline with auth uncertainty rules.

## Session Classifications
The shared state must support these reasons:

| Reason | Meaning | Primary Copy |
| --- | --- | --- |
| `expired` | absolute session lifetime ended | `Your session expired. Sign in again to continue.` |
| `idle_timeout` | user was inactive beyond allowed time | `You were signed out after being inactive.` |
| `revoked` | token or session was revoked server-side | `This session can no longer be used.` |
| `refresh_failed` | token refresh failed | `We could not refresh your session.` |
| `missing_token` | protected request has no usable token | `Sign in again to continue safely.` |
| `invalid_token` | token failed verification | `This session could not be verified.` |
| `role_claim_missing` | identity exists but role claim is absent | `Your account role could not be verified.` |
| `role_claim_invalid` | role claim is not approved | `Your account role could not be verified.` |
| `manual_sign_out` | user signed out and route still needs auth | `Sign in to continue.` |
| `unknown` | app cannot safely classify | `Sign in again to continue safely.` |

## Role Session Durations
Sender:
- method: `phone_otp`
- session lifetime: `30 days`
- recovery route: sender phone sign-in
- safe return: sender home, create delivery start, delivery history, receipt list, support thread list

Station operator:
- method: `phone_pin`
- session lifetime: `12 hours`
- recovery route: station sign-in
- safe return: station overview
- post-sign-in requirement: refresh station scope

Driver:
- method: `phone_pin`
- session lifetime: `12 hours`
- recovery route: driver sign-in
- safe return: assigned runs
- post-sign-in requirement: refresh assignments

Final-mile courier:
- method: `phone_pin`
- session lifetime: `12 hours`
- recovery route: courier sign-in
- safe return: courier assignments
- post-sign-in requirement: refresh assignments

Admin roles:
- method: `email_password_mfa`
- session lifetime: `8 hours`
- recovery route: admin sign-in
- safe return: admin overview
- post-sign-in requirement: refresh admin permissions and module access

Receiver:
- receiver public verification is delivery-scoped and not part of account session expiry
- use receiver-specific expired link or OTP expired states

## State Machine
Protected route path:
```text
route_requested
  -> auth_checking
  -> session_invalid
  -> clear_sensitive_state
  -> session_expired
  -> sign_in
  -> post_auth_validate
  -> safe_return | role_home | not_authorized
```

API response path:
```text
protected_screen_ready
  -> protected_request
  -> auth_required_or_token_invalid
  -> rollback_sensitive_action
  -> clear_sensitive_state
  -> session_expired
  -> sign_in
```

Idle timeout path:
```text
session_active
  -> idle_warning_optional
  -> idle_timeout_reached
  -> session_expired
  -> sign_in_again
```

Revoked session path:
```text
session_active
  -> server_revocation_detected
  -> clear_all_protected_cache
  -> session_expired_revoked
  -> sign_in_again
```

Offline uncertainty path:
```text
auth_check_required
  -> network_unavailable
  -> offline_auth_uncertain
  -> block_protected_mutation
  -> reconnect
  -> validate_session
  -> ready | session_expired
```

## Entry Rules
Enter session expired when:
- local token expiry is reached
- token refresh fails
- backend returns authentication-required condition
- Firebase verification reports revoked or invalid token
- app idle timeout expires
- session metadata is missing for a protected route
- role claim cannot be verified after authentication
- manual sign-out leaves user on protected route

Do not enter when:
- route guard is still loading auth
- user has a valid token but lacks permission
- backend returns object-level forbidden
- network is offline before session can be checked
- account is locked
- receiver tracking token expires
- payment provider login expires

## Exit Rules
Exit session expired when:
- user signs in again successfully
- app validates role and scope after sign-in
- safe return route is allowed
- app redirects to role home because return route is unsafe
- user opens public support
- user switches to another account through sign-in

Never exit by:
- restoring protected screen without revalidation
- replaying protected mutation
- showing stale protected cache as if signed in
- accepting old token after refresh failure

## Safe Return Rules
Safe return context may include:
- route group
- intent label
- non-sensitive tab name
- safe query for public route
- role hint
- action type label
- timestamp

Safe return context must not include:
- receiver phone
- address
- package description
- package label
- scan code
- OTP
- proof URL
- payment reference
- provider payload
- refund evidence
- internal note
- raw delivery id in public copy
- bearer token
- raw Firebase token

After sign-in:
- validate auth first
- validate role second
- validate route permission third
- validate object permission fourth
- return only if all checks pass
- otherwise route to role home, not authorized, or account locked

## Sensitive State Clearing
When session expires, the app must clear:
- protected query cache
- protected mutation state
- proof upload intent
- selected proof file
- scan session
- package label code input
- OTP input
- payment initialization state
- refund approval draft
- admin user edit draft
- station override draft
- issue internal note draft
- hidden route params from protected context
- in-memory bearer token

The app may keep:
- public app settings
- localization preference
- non-sensitive onboarding state
- public policy page cache
- safe return intent
- non-sensitive theme setting
- offline outbox metadata count without payload

## Mutation Safety Rules
If session expires during a mutation:
- cancel the request when possible
- roll back optimistic UI
- do not show success
- do not enqueue retry
- do not replay after sign-in
- show review-needed copy after sign-in if operation status is uncertain
- force a fresh read before user retries

High-risk mutations that must never auto-replay:
- custody acceptance
- package scan
- dispatch
- destination receipt
- final-mile assignment acceptance
- out-for-delivery update
- proof upload
- delivery completion
- failed attempt
- payment initialization
- refund approval
- refund execution
- user role update
- station override
- pricing rule change
- webhook replay

## Component Contract
`SharedSessionExpiredState` props:
```ts
type SessionExpiredReason =
  | "expired"
  | "idle_timeout"
  | "revoked"
  | "refresh_failed"
  | "missing_token"
  | "invalid_token"
  | "role_claim_missing"
  | "role_claim_invalid"
  | "manual_sign_out"
  | "unknown";

interface SharedSessionExpiredStateProps {
  reason: SessionExpiredReason;
  surface:
    | "sender_mobile"
    | "ops_mobile"
    | "admin_web"
    | "sender_web"
    | "protected_public";
  variant: "standalone" | "inline" | "modal" | "action_result";
  lastRole?: string;
  safeReturnLabel?: string;
  safeReturnRoute?: string;
  signInRoute: string;
  canSwitchRole?: boolean;
  canContactSupport?: boolean;
  hasClearedSensitiveState: boolean;
  hasUncertainAction?: boolean;
  requestId?: string;
  onSignIn: () => void;
  onSwitchRole?: () => void;
  onContactSupport?: () => void;
  onClearLocalState?: () => void;
}
```

## Component Responsibilities
`SharedSessionExpiredState`:
- renders the correct layout variant
- maps reason to safe copy
- routes to correct sign-in path
- blocks protected children
- announces session status
- displays safe return context
- shows sensitive-state clearance notice
- emits telemetry

`SessionExpiredCard`:
- renders icon, title, body, and action stack
- keeps card calm and focused
- adapts to mobile, web, and admin shell

`SafeReturnContext`:
- displays only safe return information
- hides protected route details
- indicates when return route requires revalidation

`SignInRouteAction`:
- opens role-appropriate sign-in
- prevents duplicate taps
- handles offline sign-in unavailable copy

`SensitiveStateClearanceNotice`:
- confirms protected local state was cleared
- lists only broad categories
- never lists protected values

`SessionReasonStrip`:
- shows reason in plain language
- uses non-color icon and text
- never shows raw provider error

`OfflineSessionCaveat`:
- appears when sign-in cannot start offline
- states that protected actions are paused until connection returns

`ReauthResultAnnouncement`:
- announces successful reauthentication, blocked return, or safe home redirect

## Copy System
Base title:
- `Session expired`

Base body:
- `Sign in again to continue safely.`

Safe return note:
- `After sign-in, Kra will check your access before returning you.`

Sensitive state note:
- `Protected screen data and unfinished secure actions were cleared from this device.`

Uncertain action note:
- `If you were submitting an action, check the latest status after signing in before trying again.`

Support note:
- `If this keeps happening, contact support.`

Do not use:
- `You are unauthorized`
- `Permission denied`
- `You were kicked out`
- `Your account is blocked`
- `Your action was saved`
- `We will retry automatically`
- `Token invalid`
- raw provider or Firebase error copy

## Reason Copy Matrix
| Reason | Title | Body | Primary Action |
| --- | --- | --- | --- |
| `expired` | `Session expired` | `Sign in again to continue safely.` | `Sign in` |
| `idle_timeout` | `Signed out for safety` | `You were signed out after being inactive.` | `Sign in again` |
| `revoked` | `Session ended` | `This session can no longer be used. Sign in again to continue.` | `Sign in again` |
| `refresh_failed` | `Could not refresh session` | `We could not refresh your session. Sign in again to continue.` | `Sign in again` |
| `missing_token` | `Sign in required` | `This area needs a valid session.` | `Sign in` |
| `invalid_token` | `Session could not be verified` | `Sign in again so Kra can verify your account.` | `Sign in again` |
| `role_claim_missing` | `Account role could not be verified` | `Sign in again. If this continues, contact support.` | `Sign in again` |
| `role_claim_invalid` | `Account role could not be verified` | `Sign in again. If this continues, contact support.` | `Sign in again` |
| `manual_sign_out` | `Signed out` | `Sign in to continue using protected areas.` | `Sign in` |
| `unknown` | `Sign in again` | `Kra needs to verify your session before continuing.` | `Sign in again` |

## Surface Copy
Sender:
- title: `Session expired`
- body: `Sign in again to view your deliveries and payments.`
- primary: `Sign in with phone`

Station operator:
- title: `Staff session expired`
- body: `Sign in again before scanning or moving packages.`
- primary: `Sign in to station work`

Driver:
- title: `Driver session expired`
- body: `Sign in again before accepting runs or updating transit.`
- primary: `Sign in to runs`

Final-mile courier:
- title: `Courier session expired`
- body: `Sign in again before starting delivery or submitting proof.`
- primary: `Sign in to jobs`

Admin:
- title: `Admin session expired`
- body: `Sign in again with MFA to continue admin work.`
- primary: `Admin sign in`

Protected public shell:
- title: `Sign in required`
- body: `This protected area needs a valid session.`
- primary: `Sign in`

## Visual Layout
Standalone layout:
- unauthenticated-safe shell
- app mark
- centered card
- reason strip
- title
- body
- safe return context
- sensitive-state notice
- primary sign-in action
- secondary support or switch role link
- public footer links

Inline layout:
- compact panel inside safe shell
- no protected data around it
- primary sign-in action
- short clearance note

Modal layout:
- only used when a session expires during a modal action
- dismissing modal routes to sign-in or safe home
- modal body must not contain protected previous form values

Action result layout:
- used when a protected action fails due to session expiry
- states action was not confirmed
- requires sign-in before retry

## Protected Shell Rules
When session expires:
- admin sidebar is hidden
- mobile protected tabs are hidden
- delivery detail headers are hidden
- previous route title is replaced with generic safe title
- protected breadcrumbs are cleared
- protected drawers close
- protected modals close or replace content
- scanner camera stops
- proof capture stops
- payment provider state pauses

Allowed safe shell:
- public app header
- auth header
- public footer
- privacy link
- terms link
- support entry when safe

## Sign-In Routing
Route by last known role:
- `sender` -> sender phone sign-in
- `station_operator` -> station sign-in
- `driver` -> driver sign-in
- `final_mile_courier` -> courier sign-in
- admin roles -> admin sign-in with MFA
- unknown -> role selection

Rules:
- route hints are not authority
- sign-in result must re-resolve role from backend claims
- if role changes after sign-in, return route is discarded
- if station assignment changes, return route is revalidated
- if driver or courier assignment changes, return route is revalidated
- if admin role changes, admin module access is revalidated

## Offline Behavior
If session is already known expired:
- show session expired
- disable sign-in action until network returns if sign-in needs network
- block protected route access
- block protected mutations
- preserve safe return intent

If session status is unknown because device is offline:
- show offline state, not session expired
- label auth as uncertain
- allow only safe cached read if policy permits
- block protected mutation
- validate session on reconnect

If protected mutation is queued and session later expires:
- pause queue
- do not send queued mutation
- require sign-in
- revalidate each queued action
- discard any action no longer allowed

## Data Fetching Requirements
Auth provider must:
- expose `checking`, `authenticated`, `expired`, `revoked`, `invalid`, `signed_out`, and `unknown` states
- include last safe role hint
- clear sensitive caches on expiry
- prevent protected route rendering while checking
- trigger token refresh before expiry when possible
- handle refresh failure deterministically

Query layer must:
- stop protected queries after expiry
- clear protected cache
- avoid retry loops on auth-required
- cancel in-flight protected requests where possible
- map `401` and token invalid conditions to session expired
- keep forbidden with valid auth mapped to not authorized

Mutation layer must:
- roll back optimistic updates
- cancel pending upload or scan operations
- avoid offline replay under expired auth
- require fresh auth before retry
- fetch latest server state before retrying any high-risk action

## Visual States
Default:
- neutral secure card
- blue primary action
- small lock or shield mark
- concise copy

Idle timeout:
- amber reason strip
- copy emphasizes inactivity
- no blame

Revoked or invalid:
- red reason strip
- copy says session can no longer be used
- support link available when safe

Refresh failed:
- amber reason strip
- copy says refresh failed
- sign-in required

Offline sign-in unavailable:
- disabled sign-in action with reason
- offline caveat
- retry connection action if platform supports it

Uncertain action:
- action review note
- no auto-retry
- primary sign-in remains first

## Typography
Title:
- mobile standalone: `22-26px`
- web standalone: `28-36px`
- inline: `16-20px`
- weight `650-750`
- line height `1.1-1.2`

Body:
- `15-17px`
- line height `1.45-1.6`
- max width `62ch`

Reason strip:
- `13-14px`
- icon plus text

Buttons:
- primary label short
- no all caps
- no technical error code in label

## Color
Default:
- secure blue accent
- neutral text
- calm surface

Idle or refresh failure:
- amber accent

Revoked or invalid:
- red accent

Rules:
- red is reserved for invalid or revoked security state
- color never communicates state alone
- all contrast meets AA
- disabled action includes text reason

## Motion
Allowed:
- card fade and rise under `180ms`
- button loading spinner
- status announcement after sign-in route opens
- subtle clearance checklist reveal

Not allowed:
- dramatic lock animation
- flashing danger treatment
- repeated animations
- auto-redirect without readable state unless security policy requires immediate sign-in
- motion that hides state change from assistive technology

## Accessibility
Required:
- standalone title receives focus on entry
- route title changes to `Session expired`
- state uses accessible heading
- reason strip is text plus icon
- primary sign-in action is reachable by keyboard
- disabled offline action includes visible reason
- status updates use polite announcement
- action-denied interruption uses assertive announcement only when user just submitted
- focus does not move unexpectedly during token check
- support link has clear accessible name

Screen reader title:
- `Session expired`

Screen reader body:
- use reason-specific copy

Announcements:
- `Session expired. Sign in again to continue.`
- `Protected data was cleared from this device.`
- `You are back online. Sign in is available.`
- `Signed in. Checking access before returning.`

## Localization
Copy must:
- avoid raw token language
- avoid backend-specific error terms
- use short button labels
- support Ghanaian English and future local languages
- avoid sentence fragments that depend on word order
- keep dynamic role labels localized
- keep safe route labels localized

Do not concatenate:
- role plus route plus error reason into one string
- raw reason code into visible copy
- action labels from backend enums without translation

## Privacy And Security
Security requirements:
- clear in-memory tokens
- clear protected cache
- clear protected form data
- close scanner and proof capture
- remove protected route params from visible UI
- block mutation replay
- do not store auth errors with token content
- do not show previous protected title
- do not keep protected content in hidden DOM

Privacy requirements:
- do not display receiver data
- do not display delivery data
- do not display payment data
- do not display station queue data
- do not display proof data
- do not display issue notes
- do not display admin configuration

## Telemetry
Event: `session_expired_viewed`

Allowed properties:
- `surface`
- `variant`
- `reason`
- `last_role`
- `route_group`
- `has_safe_return`
- `has_uncertain_action`
- `network_state`
- `cleared_sensitive_state`
- `sign_in_route_group`

Forbidden properties:
- bearer token
- refresh token
- Firebase token claims
- delivery id
- tracking code
- receiver phone
- receiver address
- payment reference
- proof URL
- package scan code
- issue note
- admin target user id

Event: `session_expired_action_clicked`

Allowed properties:
- `action`
- `surface`
- `reason`
- `route_group`
- `result`

## Error Logging
Frontend log may include:
- safe reason
- route group
- request id
- current surface
- last safe role
- network state
- timestamp

Frontend log must not include:
- token
- full authorization header
- protected route params
- provider error payload
- proof upload metadata
- payment provider reference
- personal data

## QA Scenarios
Route QA:
- sender opens protected route after local expiry and sees session expired
- station operator session expires while station overview is open
- driver session expires while assigned run detail is open
- courier session expires while proof capture is open
- admin session expires while admin detail is open
- unauthenticated user goes to sign-in, not stale protected content

API QA:
- missing token maps to session expired
- invalid token maps to session expired
- revoked token maps to session expired
- valid token plus forbidden role maps to not authorized
- valid token plus station scope denial maps to not authorized
- server error maps to error state

Mutation QA:
- expired session during scan blocks scan and stops camera
- expired session during proof upload cancels upload
- expired session during payment initialization does not show payment success
- expired session during refund approval rolls back optimistic state
- expired session during station override clears draft
- expired session during user role edit clears draft

Offline QA:
- known expired session offline shows session expired with offline caveat
- unknown auth state offline shows offline auth uncertainty, not session expired
- queued protected mutations pause after expiry
- queued protected mutations revalidate after sign-in

Privacy QA:
- previous protected route title is removed
- protected content is not in DOM
- proof file is removed from pending state
- receiver phone is not visible
- payment amount is not visible
- admin target user is not visible

## Unit Tests
Component tests must cover:
- renders reason-specific title
- renders correct sign-in route label
- hides protected children
- shows sensitive-state clearance notice
- shows uncertain-action warning when needed
- disables sign-in while offline when required
- calls sign-in handler once on repeated taps
- shows support link only when allowed
- maps last role to correct sign-in route
- discards unsafe return route
- announces status on entry

Classifier tests must cover:
- `401` maps to session expired
- missing token maps to missing token
- invalid token maps to invalid token
- revoked token maps to revoked
- token refresh failure maps to refresh failed
- valid forbidden maps to not authorized
- account locked maps to account locked
- unknown network failure maps to error or offline

## End-To-End Tests
E2E tests must cover:
- sender session expiry routes to sender sign-in
- station session expiry routes to station sign-in
- driver session expiry routes to driver sign-in
- courier session expiry routes to courier sign-in
- admin session expiry routes to admin sign-in
- sign-in returns only after access revalidation
- unsafe return route is discarded
- protected mutation is not auto-replayed after sign-in
- protected cache is cleared after expiry
- screen reader can reach the primary sign-in action

## Visual QA
Visual review must verify:
- mobile `360px` standalone
- mobile `430px` standalone
- admin web `1440px`
- public protected shell `1024px`
- inline action result
- idle timeout variant
- revoked variant
- refresh failed variant
- offline sign-in unavailable variant
- long localized copy
- large text
- high contrast
- keyboard focus ring

## Acceptance Criteria
`SharedSessionExpiredState` is complete when:
- expired session hides protected content immediately
- sensitive local state is cleared
- safe return context excludes protected data
- sign-in route matches last known role where safe
- post-sign-in return is revalidated
- high-risk mutations never auto-replay
- offline uncertainty is separate from known expiry
- forbidden with valid auth maps to not authorized
- telemetry excludes tokens and protected data
- accessibility requirements are testable

## Implementation Sequence
1. Build central auth-state classifier.
2. Build central API auth error classifier.
3. Add sensitive-state clearance utility.
4. Add safe return context sanitizer.
5. Build `SharedSessionExpiredState`.
6. Build `SessionExpiredCard`.
7. Build `SessionReasonStrip`.
8. Build `SafeReturnContext`.
9. Build `SignInRouteAction`.
10. Build `SensitiveStateClearanceNotice`.
11. Integrate sender routes.
12. Integrate operations mobile routes.
13. Integrate admin routes.
14. Integrate protected sender web shell if present.
15. Add mutation rollback integration.
16. Add offline outbox pause integration.
17. Add telemetry allowlist.
18. Add component tests.
19. Add classifier tests.
20. Add E2E coverage.

## Route Checklist
Every protected route must define:
- auth required flag
- allowed role or role group
- sign-in route
- safe return route
- unsafe route params to strip
- cache keys to clear
- mutation state to cancel
- offline behavior
- post-sign-in validation
- fallback role home
- support availability

## Test IDs
Root:
- `state-session-expired`

Elements:
- `state-session-expired-card`
- `state-session-expired-title`
- `state-session-expired-body`
- `state-session-expired-reason-strip`
- `state-session-expired-safe-return`
- `state-session-expired-clearance-notice`
- `state-session-expired-uncertain-action`
- `state-session-expired-primary-action`
- `state-session-expired-switch-role`
- `state-session-expired-support-link`
- `state-session-expired-offline-caveat`

Reason variants:
- `state-session-expired-reason-expired`
- `state-session-expired-reason-idle-timeout`
- `state-session-expired-reason-revoked`
- `state-session-expired-reason-refresh-failed`
- `state-session-expired-reason-missing-token`
- `state-session-expired-reason-invalid-token`
- `state-session-expired-reason-role-claim-missing`
- `state-session-expired-reason-role-claim-invalid`
- `state-session-expired-reason-manual-sign-out`
- `state-session-expired-reason-unknown`

## Failure Modes
Protected content flash:
- Protected screen renders before auth check finishes.
- Severity: critical.
- Fix: render loading or auth gate until session is validated.

Wrong state:
- Valid session with missing permission renders session expired.
- Severity: high.
- Fix: classify authentication before authorization.

Unsafe return:
- App returns user to denied delivery after sign-in without revalidation.
- Severity: critical.
- Fix: revalidate route, role, and object before return.

Mutation replay:
- App resubmits proof, payment, custody, or refund action after sign-in.
- Severity: critical.
- Fix: never auto-replay high-risk mutations.

Data retention:
- Proof file or payment draft remains after expiry.
- Severity: high.
- Fix: clear sensitive local state on expiry.

Offline confusion:
- App claims session expired while network prevented validation.
- Severity: medium.
- Fix: use offline auth uncertainty when expiry is not known.

## Definition Of Done
This state is ready for Claude Code implementation when:
- all session reasons are mapped
- all role sign-in routes are defined
- sensitive-state cleanup is explicit
- safe return sanitation is explicit
- mutation replay prevention is explicit
- offline auth uncertainty is separated
- accessibility behavior is testable
- telemetry allowlist is explicit
- route checklist is complete
- E2E coverage includes sender, staff, courier, and admin expiry
