# Account Locked Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AccountLocked` |
| App | `apps/mobile`, `apps/web`, `apps/admin` |
| Route | `/account-locked` |
| Primary test ID | `screen-account-locked` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 shared auth safety, abuse prevention, and staff access recovery |
| Backend dependency | Firebase authentication, Firebase session revocation, shared auth policy, admin user access status, route guards, `AuthPrincipal`, `kra_role`, `kra_station_id`, API error mapping, support escalation |
| Related routes | `/(auth)/role-selection`, `/(auth)/phone-login`, `/(auth)/sender/sign-in`, `/(auth)/station/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/courier/sign-in`, `/admin/sign-in`, `/session-expired`, `/permission-denied`, `/support`, `/privacy`, `/terms` |
| Required states | `loading_context`, `generic_auth_lock`, `temporary_lockout`, `rate_limited`, `inactive_account`, `staff_restricted`, `admin_restricted`, `fraud_review`, `provider_disabled`, `session_revoked`, `appeal_available`, `support_unavailable`, `offline_uncertain`, `return_context_unsafe`, `redirecting_to_recovery`, `api_error` |

## Product Job
`AccountLocked` is the shared interruption screen shown when Kra knows an account or authenticator cannot continue. It must stop protected access, explain the safe recovery route, preserve no sensitive data, and avoid exposing account existence before identity is trusted.

The screen answers:
- `Why can I not continue?`
- `Is this temporary, administrative, or review-based?`
- `Who can resolve it?`
- `Can I retry later, recover by phone, contact support, or ask an admin?`
- `What protected work was stopped?`
- `What must not be retried until access is restored?`
- `How does Kra avoid leaking whether an account exists?`

The user should be able to:
- Understand that access is blocked without reading technical error codes.
- See whether retry, recovery, supervisor contact, admin recovery, or support is the correct path.
- Leave the screen without seeing protected delivery, station, payment, proof, or admin data.
- Return to the right sign-in route only when policy allows it.
- Reach support or an internal admin channel where allowed.
- See clear next steps during temporary lockout, inactive staff access, provider-disabled status, or fraud review.

This screen is not:
- A login form.
- A PIN reset form.
- A sender OTP form.
- A staff activation flow.
- An admin user management form.
- A public receiver tracking challenge.
- A delivery proof OTP screen.
- A permission denied page.
- A session timeout page.
- A support thread.
- A place to unlock, reactivate, reinstate, or override a user.
- A place to show restricted operational evidence.

## Strategic Role
Kra moves physical goods through many hands. A locked account can affect sender trust, station throughput, driver custody, courier proof, admin finance review, and support workload. The screen must protect the system without creating panic or leaking security signals.

Core principle:
- Before identity is trusted, lock messages stay generic.
- After identity is trusted, recovery guidance may become role-specific.
- Temporary lockout never becomes a privilege grant.
- Suspended, inactive, provider-disabled, or fraud-review states require admin or support workflow.
- The frontend never restores access by itself.
- Backend and identity-provider state remain the authority.

## Audience
Primary users:
- senders whose phone auth is temporarily blocked
- station operators with failed PIN attempts or inactive staff access
- drivers with failed PIN attempts or inactive staff access
- final-mile couriers with failed PIN attempts or inactive staff access
- admins whose email/password/MFA access is blocked or under review
- staff whose account was restricted after operational evidence review

Secondary users:
- supervisors helping field staff recover during a shift
- support admins guiding sender recovery
- ops admins reviewing operational restrictions
- finance admins reviewing payment-fraud restrictions
- super admins approving reinstatement
- QA validating auth and restriction boundaries
- security reviewers checking enumeration resistance
- Claude Code implementing the route later

Non-users:
- public visitors
- public receivers using delivery-scoped tracking grants
- payment providers
- SMS providers
- webhook callers
- scheduled backend jobs

## Current Backend Reality
Implemented auth facts:
- Backend verifies Firebase ID tokens.
- Token verification uses revocation checks.
- `AuthPrincipal.userId` comes from token UID.
- `AuthPrincipal.role` comes from `kra_role`.
- `AuthPrincipal.stationId` comes from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from the shared permission matrix.
- Sender auth method is `phone_otp`.
- Driver auth method is `phone_pin`.
- Station operator auth method is `phone_pin`.
- Final-mile courier auth method is `phone_pin`.
- Admin roles use `email_password_mfa`.
- Sender session duration is `30 days`.
- Staff mobile session duration is `12 hours`.
- Admin session duration is `8 hours`.
- Lockout policy is `5` failed attempts in `15 minutes`.
- Inactive staff sessions are revoked immediately on offboarding.

Implemented account administration facts:
- `POST /v1/admin/users/:id/access` updates role, status, and station assignment.
- User status is currently `active` or `inactive`.
- Super admins cannot modify their own role or activation state through that endpoint.
- Station operators require station assignment.
- Sender and admin roles cannot carry station assignment.
- The admin user access endpoint requires admin scope and `manage_users_and_roles`.

Implemented restriction policy facts:
- Staff restriction requires linked delivery IDs.
- Staff restriction requires event or payment evidence.
- Staff restriction requires a human review note.
- Staff may request review through admin channel within `5 business days`.
- Reinstatement requires super-admin approval and reason logging.
- First owner for operational fraud is `ops_admin`.
- First owner for payment fraud is `finance_admin`.
- Escalation owner is `super_admin`.

Current API gaps:
- No distinct `ACCOUNT_LOCKED` error code exists.
- No distinct `ACCOUNT_INACTIVE` error code exists.
- No distinct `AUTH_LOCKOUT_ACTIVE` error code exists.
- No distinct `AUTH_PROVIDER_DISABLED` error code exists.
- No distinct `FRAUD_RESTRICTION_ACTIVE` error code exists.
- No frontend-facing account-lock detail endpoint exists.
- No sender support-case creation endpoint dedicated to account recovery exists.
- No staff appeal endpoint exists.
- No backend unlock or retry-after endpoint exists.

Frontend consequence:
- The screen must accept safe route context from auth guards and sign-in screens.
- The screen must not infer restriction detail from generic `FORBIDDEN` alone.
- The screen must not claim exact unlock time unless a trusted source provides it.
- The screen must not expose whether a phone, email, or staff ID exists from unauthenticated attempts.
- The screen may show role-specific guidance only after the user has already passed a trusted identity check or the route source is a protected route with a valid principal.

Future backend improvement:
- Add safe auth error reasons:
  - `AUTH_LOCKOUT_ACTIVE`
  - `AUTH_RATE_LIMITED`
  - `ACCOUNT_INACTIVE`
  - `ACCOUNT_RESTRICTED`
  - `AUTH_PROVIDER_DISABLED`
  - `SESSION_REVOKED`
  - `FRAUD_REVIEW_ACTIVE`
- Add safe fields:
  - `retryAfterSeconds`
  - `restrictionCategory`
  - `recoveryOwner`
  - `supportCaseAllowed`
  - `appealDeadline`
  - `safeReturnRole`
- Add audit event for each lock, restriction, appeal request, and reinstatement decision.

## Source References
External references used for this screen:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic authentication responses, enumeration resistance, login throttling, account lockout design, and logging of account lockouts.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports rate limiting for failed authentication attempts, OTP replay resistance, and safe handling as failed attempts approach limits.
- [Firebase manage users](https://firebase.google.com/docs/auth/admin/manage-users): supports disabled user state through Admin SDK create and update user operations.
- [Firebase manage sessions](https://firebase.google.com/docs/auth/admin/manage-sessions): supports session revocation, disabled-user refresh-token expiry, and server-side revoked-token checks.
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/): supports public auth routes and protected route guards in Expo Router.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports visible text explanations when a user cannot continue.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible lockout, countdown, recovery, and redirect status updates.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for mobile recovery actions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/auth.ts`
- `services/api/src/users.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`
- `docs/05-design/frontend-screen-specs/auth-and-account/01-auth-role-selection.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/03-staff-account-activation.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/04-passwordless-phone-login.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/05-session-expired.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/02-sender-sign-in.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/01-station-sign-in.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/01-admin-sign-in.md`

## Design Brief
Audience:
- A user whose account or authenticator is blocked and who needs a safe recovery path.

Context of use:
- Urgent, interruptive, security-sensitive, and sometimes operationally time-critical.

Entry point:
- Sign-in failure, protected-route guard, token revocation, admin inactivation, provider disabled user, or fraud-review restriction.

Success state:
- User understands the reason class, follows the correct recovery route, and no protected data leaks.

Primary action:
- Continue to the role-safe recovery path.

Navigation model:
- Standalone public auth route with a single recovery stack.

Density level:
- Calm and sparse for senders; operationally direct for staff and admins after identity is trusted.

Visual thesis:
- A serious access checkpoint with a precise lock-state panel, one recovery path, and restrained status detail that feels protective rather than punitive.

Restraint rule:
- Do not show delivery data, station data, payment data, proof data, admin evidence, actor history, or exact restriction evidence.

## UX Principles
The screen should feel:
- secure
- direct
- calm
- fair
- recoverable
- role-aware
- high-trust

The screen must not feel:
- accusatory
- vague
- like a broken login
- like a punishment notice
- like permission denial
- like session expiry
- like access can be restored by retrying endlessly
- like restricted evidence is public

Primary promise:
- `Access is paused. Follow the recovery step for your role.`

Security promise:
- `Kra will not expose account details until identity and recovery route are safe.`

Operational promise:
- `Staff work is stopped until an authorized admin restores access or issues a new credential.`

## State Taxonomy
`generic_auth_lock`:
- Used before identity is trusted.
- Triggered from sign-in attempt, phone entry, email entry, or recovery request.
- Copy must not confirm whether account exists.
- Primary action routes to safe recovery or wait state.

`temporary_lockout`:
- Used when failed attempts exceed policy and trusted context allows lockout copy.
- Local threshold: `5` failed attempts within `15 minutes`.
- May show retry countdown only if trusted backend or provider returns one.
- Primary action waits, then returns to role sign-in.

`rate_limited`:
- Used when provider or backend throttles attempts without confirming account lock.
- Must not name the account.
- Primary action is wait or support.

`inactive_account`:
- Used when a known staff or admin account has status `inactive`.
- Must not offer self-reactivation.
- Staff primary action is contact supervisor or admin channel.
- Admin primary action is contact super admin or recovery owner.

`staff_restricted`:
- Used when staff access is restricted due to evidence-backed operational review.
- Must show review route and appeal window if safe.
- Must not show linked delivery IDs unless the user is in an authorized admin surface.

`admin_restricted`:
- Used when admin access is restricted or MFA recovery is required.
- Must route to admin recovery or super-admin contact.
- Must not show console data.

`fraud_review`:
- Used when operational or payment risk review blocks access.
- Must name only the safe category, not evidence detail.
- Must route to review request or support.

`provider_disabled`:
- Used when identity provider account is disabled.
- Must clear local session and route to recovery.
- Must not instruct users to bypass provider controls.

`session_revoked`:
- Used when session revocation is tied to account restriction rather than ordinary expiry.
- Must clear sensitive local state.
- Must not preserve protected return actions.

`offline_uncertain`:
- Used when the app cannot confirm whether the lock state still applies.
- Must block protected routes.
- Staff read-only cached work may be hidden unless an existing screen explicitly allows locked cache state.
- Primary action is retry connection or support.

## Account State Matrix
| Source condition | Identity trusted? | Screen state | User-facing posture | Primary CTA |
| --- | --- | --- | --- | --- |
| Too many failed sign-in attempts before account is trusted | No | `generic_auth_lock` | Generic auth protection | `Try later` |
| Provider says too many requests | No | `rate_limited` | Generic wait guidance | `Try later` |
| Backend confirms failed-attempt lock for current principal | Yes | `temporary_lockout` | Temporary lockout | `Back to sign in` |
| User record status is `inactive` | Yes | `inactive_account` | Account access paused | `Contact admin` |
| Firebase user disabled | Yes or provider-trusted | `provider_disabled` | Account disabled at provider | `Start recovery` |
| Refresh token revoked due to risk | Yes or provider-trusted | `session_revoked` | Access ended for safety | `Sign in again` or `Contact support` |
| Fraud restriction exists | Yes | `fraud_review` | Review in progress | `Request review` |
| Staff restriction exists | Yes | `staff_restricted` | Supervisor/admin recovery | `Contact supervisor` |
| Admin restriction exists | Yes | `admin_restricted` | Super-admin recovery | `Contact super admin` |
| App is offline and cannot verify | Unknown | `offline_uncertain` | Cannot confirm access | `Retry connection` |

## Route Context Contract
The route may receive only safe context:
- `source`
- `roleHint`
- `lockReason`
- `trustedIdentity`
- `safeReturnTo`
- `retryAfterSeconds`
- `supportCaseId`
- `appealDeadline`
- `restrictionOwner`
- `correlationId`
- `occurredAt`

Suggested route type:
```ts
export type AccountLockedSource =
  | "sender_sign_in"
  | "staff_sign_in"
  | "admin_sign_in"
  | "phone_login"
  | "protected_route"
  | "session_revoked"
  | "support_link"
  | "unknown";

export type AccountLockedRoleHint =
  | "sender"
  | "driver"
  | "station_operator"
  | "final_mile_courier"
  | "ops_admin"
  | "finance_admin"
  | "support_admin"
  | "super_admin"
  | "unknown";

export type AccountLockReason =
  | "generic_auth_lock"
  | "temporary_lockout"
  | "rate_limited"
  | "inactive_account"
  | "staff_restricted"
  | "admin_restricted"
  | "fraud_review"
  | "provider_disabled"
  | "session_revoked"
  | "offline_uncertain"
  | "unknown";

export interface AccountLockedRouteContext {
  source: AccountLockedSource;
  roleHint: AccountLockedRoleHint;
  lockReason: AccountLockReason;
  trustedIdentity: boolean;
  safeReturnTo?: string;
  retryAfterSeconds?: number;
  supportCaseId?: string;
  appealDeadline?: string;
  restrictionOwner?: "support" | "ops_admin" | "finance_admin" | "super_admin";
  correlationId?: string;
  occurredAt?: string;
}
```

Route validation:
- If `trustedIdentity` is false, suppress `roleHint` and render generic copy unless the route source itself is public and non-identifying.
- If `safeReturnTo` is not in the allowlist, discard it.
- If `retryAfterSeconds` is missing, do not show a countdown.
- If `appealDeadline` is missing, show generic review guidance.
- If `restrictionOwner` is missing, route to support.
- If `lockReason` is unknown, use `generic_auth_lock`.

## Safe Return Allowlist
Allowed return routes after recovery:
- `/(auth)/role-selection`
- `/(auth)/phone-login`
- `/(auth)/sender/sign-in`
- `/(auth)/station/sign-in`
- `/(auth)/driver/sign-in`
- `/(auth)/courier/sign-in`
- `/admin/sign-in`
- `/support`

Disallowed return routes:
- delivery detail
- station queue
- driver run
- courier proof
- payment flow
- refund decision
- admin user detail
- admin audit detail
- blocked delivery queue
- custody exception review
- any route with write action context

Rule:
- Locked recovery never deep-links directly back into a protected mutation screen.

## Information Architecture
Top-level regions:
- status hero
- reason summary
- recovery path panel
- operational safety note
- secondary actions
- support and legal footer

Mobile layout:
- full-height auth route
- top safe-area status strip
- compact lock card
- one primary CTA fixed near bottom
- secondary text links below primary CTA
- optional countdown in body, not in CTA label
- no bottom tab bar
- no protected app shell

Admin web layout:
- centered route outside admin shell
- narrow content column
- no admin sidebar
- no protected nav
- security event reference visible only when safe
- support/admin escalation card

Public web layout:
- centered auth-safe route
- Kra wordmark only
- no marketing navigation
- footer links to privacy and terms

## Visual System
Color intent:
- Use a deep charcoal or midnight base for the lock panel.
- Use amber for temporary lockout or rate-limit caution.
- Use red only for suspended/restricted/provider-disabled hard stops.
- Use blue or teal only for recovery route reassurance.
- Use neutral gray for support and legal detail.

Suggested token mapping:
- `surface.auth.background`: warm off-white or low-glare deep neutral.
- `surface.auth.card`: high-contrast panel.
- `text.primary`: strong neutral.
- `text.secondary`: muted neutral with accessible contrast.
- `state.caution`: amber.
- `state.blocked`: red.
- `state.review`: blue.
- `state.success`: green only after recovery request submission.
- `focus.ring`: high-contrast outline.

Typography:
- Heading: strong, editorial, compact.
- Body: highly legible, short line length.
- Status labels: small caps are allowed only if letter spacing remains readable.
- Avoid thin text weights on mobile.

Shape and material:
- One main card.
- One recovery panel.
- Do not stack many cards.
- Use subtle border and shadow only if it improves separation.
- No decorative lock wallpaper that weakens legibility.

Iconography:
- Use one lock/shield icon for the hero.
- Use distinct small icons for wait, support, admin review, and recovery only if labels remain primary.
- Color cannot be the only signal.

Motion:
- On entry, fade in the lock card and slide recovery CTA slightly upward.
- Countdown updates must not animate every second with layout shift.
- Respect reduced-motion settings.
- Do not use shaking, flashing, pulsing red, or alarm-like animation.

## Copy System
Copy tone:
- direct
- specific when safe
- non-accusatory
- short
- no blame
- no internal jargon

Global heading options:
- `Access paused`
- `Access locked for now`
- `Account access needs review`
- `Sign-in temporarily paused`

Default safe heading:
- `Access paused`

Default safe body:
- `We cannot continue this sign-in right now. Use the recovery option below or try again later.`

Temporary lockout body:
- `Too many attempts were made in a short time. Wait before trying again.`

Sender trusted body:
- `Your phone sign-in is paused for safety. You can wait, retry when allowed, or contact support.`

Staff trusted body:
- `Your staff access is paused. Contact your supervisor or an authorized admin before handling new packages.`

Admin trusted body:
- `Your admin access is paused. Use the admin recovery path or contact a super admin.`

Inactive staff body:
- `This staff account is inactive. It must be restored by an authorized admin before you can work.`

Fraud review body:
- `Access is paused while a review is active. Use the review request path if you need this checked.`

Provider disabled body:
- `This account is disabled at the identity provider. Recovery must happen through an authorized channel.`

Offline body:
- `We cannot confirm your access while offline. Connect to the internet before continuing.`

Do not use:
- `You are banned.`
- `Your account does not exist.`
- `This phone number is not registered.`
- `Your email is valid but disabled.`
- `You failed too many times because you entered the wrong PIN.`
- `Contact anyone at Kra.`
- `Try random recovery steps.`

## Primary Actions
Generic unauthenticated:
- Label: `Try again later`
- Behavior: return to role selection or sign-in after wait.

Temporary lockout with countdown:
- Label before available: `Try again when ready`
- Label after available: `Back to sign in`
- Behavior: route to safe role sign-in.

Sender recovery:
- Label: `Start phone recovery`
- Behavior: route to sender phone login or sender recovery.

Staff recovery:
- Label: `Contact supervisor`
- Behavior: open staff support/admin guidance, not direct unlock.

Admin recovery:
- Label: `Open admin recovery`
- Behavior: route to admin sign-in recovery or support owner.

Fraud review:
- Label: `Request review`
- Behavior: open safe review request if endpoint exists; otherwise open support path with category.

Offline:
- Label: `Retry connection`
- Behavior: re-check auth state.

Provider disabled:
- Label: `Contact support`
- Behavior: open support with no restricted evidence.

## Secondary Actions
Allowed secondary actions:
- `Use a different role`
- `Return to sign in`
- `Contact support`
- `Read privacy policy`
- `Read terms`
- `Sign out on this device`

Disallowed secondary actions:
- `Unlock account`
- `Reactivate account`
- `Skip for now`
- `Continue offline`
- `Open delivery`
- `Open queue`
- `Open admin`
- `Change role claim`
- `Change station`
- `Reset another user's PIN`

## Role-Specific Recovery
Sender:
- If not trusted: generic wait/support copy.
- If trusted: phone recovery is allowed.
- Sender can retry only after countdown or provider throttle clears.
- Sender support path should not expose account existence from public phone entry.

Station operator:
- If lockout: wait or supervisor-issued PIN reset.
- If inactive: authorized admin must restore status.
- If restricted: ops-admin review path.
- Must not see station queues while locked.
- Must not keep cached station workload visible on this route.

Driver:
- If lockout: wait or supervisor-issued PIN reset.
- If inactive: authorized admin must restore status.
- If restricted: ops-admin review path.
- Must not accept custody, update route state, or view new run details while locked.

Final-mile courier:
- If lockout: wait or supervisor-issued PIN reset.
- If inactive: authorized admin must restore status.
- If restricted: ops-admin review path.
- Must not start delivery, complete proof, or view receiver detail while locked.

Ops admin:
- If restricted: super-admin recovery.
- If fraud review: owner is super admin unless policy says otherwise.
- Must not access launch readiness, delivery explorer, or station overrides.

Finance admin:
- If restricted: super-admin recovery.
- If payment-fraud review: first owner may be finance admin for other actors, but not self-unlock.
- Must not access reconciliation, refunds, or payment data.

Support admin:
- If restricted: super-admin recovery.
- Must not access support threads while locked.

Super admin:
- If locked: admin recovery and provider/MFA recovery.
- Must not self-restore through normal admin user access mutation.

## Security Rules
Enumeration resistance:
- Before identity is trusted, use generic copy for invalid credentials, unknown account, locked account, disabled account, and inactive account.
- Do not show account name, role, station, email, phone, or staff ID before trust.
- Do not vary layout dramatically between unknown, locked, and disabled states before trust.
- Do not show precise reason in unauthenticated URL query params.

Protected data:
- Clear protected route state on entry.
- Hide protected shell navigation.
- Clear pending write forms.
- Clear cached sensitive payloads unless the underlying screen has a documented locked-cache exception.
- Do not render previous route in background.

Recovery safety:
- Staff lock recovery requires admin-issued reset or admin action.
- Admin lock recovery requires email reset plus MFA challenge or super-admin path.
- Sender recovery uses phone OTP when safe.
- Fraud review cannot be bypassed by sign-out/sign-in.
- Inactive user status cannot be bypassed by provider token refresh.

Audit and telemetry:
- Track screen view with safe reason class.
- Track recovery action clicked.
- Track support action clicked.
- Track countdown completed.
- Track unsafe return discarded.
- Do not track raw phone, raw email, PIN, OTP, delivery ID, evidence ID, or provider token.

## Data Requirements
Minimum local input:
```ts
interface AccountLockedViewModel {
  state: AccountLockReason;
  trustedIdentity: boolean;
  roleHint: AccountLockedRoleHint;
  title: string;
  body: string;
  primaryAction: AccountLockedAction;
  secondaryActions: AccountLockedAction[];
  retryAfterSeconds?: number;
  supportCaseId?: string;
  appealDeadline?: string;
  restrictionOwnerLabel?: string;
  correlationId?: string;
}

interface AccountLockedAction {
  label: string;
  kind:
    | "wait"
    | "retry_connection"
    | "return_to_sign_in"
    | "phone_recovery"
    | "staff_supervisor"
    | "admin_recovery"
    | "support"
    | "review_request"
    | "sign_out"
    | "role_selection"
    | "legal_link";
  href?: string;
  disabled?: boolean;
}
```

Never store:
- PIN
- OTP
- password
- MFA secret
- raw provider token
- full phone number
- unrestricted email address before trust
- linked delivery evidence
- admin review note
- fraud indicators

May store for route recovery:
- safe reason class
- safe role hint
- timestamp
- countdown seconds
- support case reference
- non-sensitive correlation ID

## Layout Detail
### Region 1: Brand And Status
Purpose:
- Orient without exposing protected app chrome.

Required elements:
- Kra wordmark.
- Short status label, such as `Access check`.
- No role badge unless trusted.

Test IDs:
- `account-locked-brand`
- `account-locked-status-label`

### Region 2: Lock Hero
Purpose:
- Explain the hard stop quickly.

Required elements:
- Icon with accessible label.
- Heading.
- One-sentence reason.
- Optional countdown or review-owner line.

Test IDs:
- `account-locked-hero`
- `account-locked-title`
- `account-locked-body`
- `account-locked-countdown`
- `account-locked-owner`

### Region 3: Recovery Path
Purpose:
- Give the one correct next action.

Required elements:
- Primary CTA.
- Short note about what happens after action.
- Disabled state when waiting.

Test IDs:
- `account-locked-recovery-panel`
- `account-locked-primary-action`
- `account-locked-recovery-note`

### Region 4: Operational Safety Note
Purpose:
- Stop unsafe field work while account is locked.

Required elements for staff:
- `Do not accept, move, or complete packages until access is restored.`
- Escalation owner label when safe.

Required elements for admin:
- `Admin console data is hidden until access is restored.`

Required elements for sender:
- `Your delivery data stays protected while recovery is in progress.`

Test IDs:
- `account-locked-safety-note`

### Region 5: Secondary Actions
Purpose:
- Let user exit safely.

Required elements:
- Role selection.
- Sign out.
- Support.
- Legal links.

Test IDs:
- `account-locked-secondary-actions`
- `account-locked-role-selection-action`
- `account-locked-sign-out-action`
- `account-locked-support-action`
- `account-locked-privacy-link`
- `account-locked-terms-link`

## State Rendering
### Loading Context
Trigger:
- Route opens while auth guard or provider context is being resolved.

UI:
- Show neutral loading lock card.
- Do not show role.
- Do not show reason detail.
- Announce `Checking access status.`

Primary action:
- Disabled.

Test IDs:
- `account-locked-loading-state`

### Generic Auth Lock
Trigger:
- Unknown user, locked account, disabled account, invalid credential, or rate signal before identity trust.

UI:
- Heading: `Access paused`
- Body: `We cannot continue this sign-in right now. Use the recovery option below or try again later.`
- No account-specific data.

Primary action:
- `Try again later`

Secondary:
- `Use a different role`
- `Contact support`

Test IDs:
- `account-locked-generic-state`

### Temporary Lockout
Trigger:
- Failed-attempt policy active and safe context confirms current principal or trusted route.

UI:
- Heading: `Sign-in temporarily paused`
- Body: `Too many attempts were made in a short time. Wait before trying again.`
- Countdown only when provided.

Primary action:
- Disabled until countdown ends if countdown exists.
- `Back to sign in` after wait.

Test IDs:
- `account-locked-temporary-state`
- `account-locked-retry-after`

### Rate Limited
Trigger:
- Provider or backend throttles attempts.

UI:
- Heading: `Try again later`
- Body: `For safety, sign-in attempts are paused for a short time.`
- No account detail.

Primary action:
- `Try again later`

Test IDs:
- `account-locked-rate-limited-state`

### Inactive Account
Trigger:
- Trusted principal or admin-safe context indicates user status `inactive`.

UI:
- Heading: `Account access is inactive`
- Staff body: `This staff account must be restored by an authorized admin before work can continue.`
- Admin body: `This admin account must be restored through the super-admin recovery path.`

Primary action:
- Staff: `Contact supervisor`
- Admin: `Open admin recovery`

Test IDs:
- `account-locked-inactive-state`

### Staff Restricted
Trigger:
- Trusted staff account is restricted under evidence-backed review.

UI:
- Heading: `Staff access needs review`
- Body: `Access is paused while a review is active. Contact the assigned admin channel before handling packages.`
- Show appeal window only if provided.
- Do not show evidence detail.

Primary action:
- `Request review`

Test IDs:
- `account-locked-staff-restricted-state`
- `account-locked-appeal-deadline`

### Admin Restricted
Trigger:
- Trusted admin account is restricted.

UI:
- Heading: `Admin access paused`
- Body: `Use the admin recovery path or contact a super admin.`

Primary action:
- `Open admin recovery`

Test IDs:
- `account-locked-admin-restricted-state`

### Fraud Review
Trigger:
- Trusted account is paused for operational or payment risk review.

UI:
- Heading: `Review in progress`
- Body: `Access is paused while a review is active. Use the review path if you need this checked.`
- Show owner label only if safe.

Primary action:
- `Request review`

Test IDs:
- `account-locked-fraud-review-state`

### Provider Disabled
Trigger:
- Identity provider reports disabled user.

UI:
- Heading: `Account disabled`
- Body: `This account is disabled at the identity provider. Recovery must happen through an authorized channel.`

Primary action:
- `Contact support`

Test IDs:
- `account-locked-provider-disabled-state`

### Session Revoked
Trigger:
- Token revocation was tied to account safety.

UI:
- Heading: `Access ended for safety`
- Body: `Your session was ended. Sign in again or use recovery if access remains paused.`

Primary action:
- `Sign in again`

Secondary:
- `Contact support`

Test IDs:
- `account-locked-session-revoked-state`

### Offline Uncertain
Trigger:
- Device cannot validate account state.

UI:
- Heading: `Cannot confirm access`
- Body: `Connect to the internet before continuing. Protected work stays hidden until access is checked.`

Primary action:
- `Retry connection`

Test IDs:
- `account-locked-offline-state`

### Return Context Unsafe
Trigger:
- Route context includes a disallowed return route.

UI:
- Render main lock state.
- Show small note: `For safety, we will not return directly to the interrupted action.`

Primary action:
- Role-safe sign-in or support.

Test IDs:
- `account-locked-unsafe-return-note`

## Interaction Rules
On mount:
- Validate route context.
- Clear sensitive protected state.
- Resolve provider session status if available.
- Map safe reason class.
- Render generic state until safe reason is known.

On primary action:
- If wait state is active, do nothing except announce remaining wait.
- If offline, re-check network and auth.
- If sender recovery, navigate to phone recovery route.
- If staff recovery, open supervisor/support guidance.
- If admin recovery, navigate to admin recovery/sign-in route.
- If review request is allowed, open support/review request route.
- If sign-out, clear local auth and route to role selection.

On countdown tick:
- Update visible remaining time no more than once per second.
- Use `aria-live="polite"` or platform equivalent at meaningful intervals.
- Do not move focus every tick.

On app background:
- Preserve only safe route context and countdown target.
- Do not preserve protected form state.

On app foreground:
- Re-check lock status if online.
- If account is active and role-safe route exists, send user to sign-in, not protected action.

On back:
- If entered from sign-in, back returns to role selection or sign-in.
- If entered from protected route, back must not show protected content.
- On Android hardware back, route to role selection or close auth stack.

## Navigation Rules
Sender source:
- Generic: role selection or sender sign-in.
- Trusted temporary lockout: sender sign-in after wait.
- Trusted recovery: sender auth recovery.

Station operator source:
- Generic: station sign-in.
- Temporary lockout: station sign-in after wait.
- Inactive/restricted: support/supervisor guidance.

Driver source:
- Generic: driver sign-in.
- Temporary lockout: driver sign-in after wait.
- Inactive/restricted: support/supervisor guidance.

Courier source:
- Generic: courier sign-in.
- Temporary lockout: courier sign-in after wait.
- Inactive/restricted: support/supervisor guidance.

Admin source:
- Generic: admin sign-in.
- Temporary lockout: admin sign-in after wait.
- Inactive/restricted: admin recovery or super-admin contact.

Unknown source:
- Role selection.

## Privacy And Redaction
Before trusted identity:
- Hide name.
- Hide phone.
- Hide email.
- Hide role.
- Hide station.
- Hide support case.
- Hide review owner.
- Hide reason detail.

After trusted identity:
- Name may remain hidden by default.
- Role may be shown only if it helps recovery.
- Phone/email may be masked only if needed.
- Station may be shown only for staff support routing.
- Support case ID may be shown if safe.
- Evidence and linked delivery IDs remain hidden.

Masking:
- Phone: last two digits only when trusted.
- Email: first character plus domain only when trusted.
- Staff ID: avoid unless support flow requires it.

## Component Structure
Suggested component tree:
```tsx
<AccountLockedScreen testID="screen-account-locked">
  <AuthSafeShell>
    <AccountLockedBrand />
    <AccountLockedHero />
    <AccountLockedRecoveryPanel />
    <AccountLockedSafetyNote />
    <AccountLockedSecondaryActions />
    <AuthLegalFooter />
  </AuthSafeShell>
</AccountLockedScreen>
```

Suggested state components:
- `GenericAuthLockState`
- `TemporaryLockoutState`
- `RateLimitedState`
- `InactiveAccountState`
- `StaffRestrictedState`
- `AdminRestrictedState`
- `FraudReviewState`
- `ProviderDisabledState`
- `SessionRevokedState`
- `OfflineUncertainState`
- `UnsafeReturnNote`

Shared dependencies:
- auth-safe shell
- status banner
- countdown text
- recovery action button
- support link
- legal footer
- telemetry helper
- safe route resolver

## State Mapper
Suggested mapper behavior:
```ts
export function mapAccountLockedState(
  context: AccountLockedRouteContext
): AccountLockedViewModel {
  if (!context.trustedIdentity) {
    return buildGenericAuthLock(context);
  }

  switch (context.lockReason) {
    case "temporary_lockout":
      return buildTemporaryLockout(context);
    case "rate_limited":
      return buildRateLimited(context);
    case "inactive_account":
      return buildInactiveAccount(context);
    case "staff_restricted":
      return buildStaffRestricted(context);
    case "admin_restricted":
      return buildAdminRestricted(context);
    case "fraud_review":
      return buildFraudReview(context);
    case "provider_disabled":
      return buildProviderDisabled(context);
    case "session_revoked":
      return buildSessionRevoked(context);
    case "offline_uncertain":
      return buildOfflineUncertain(context);
    default:
      return buildGenericAuthLock(context);
  }
}
```

Builder rules:
- Each builder returns one primary action.
- Each builder returns copy that matches trust level.
- No builder returns protected route destinations.
- Unknown values collapse to generic state.

## Error Handling
`FORBIDDEN`:
- Do not automatically map to `AccountLocked`.
- If valid token and role/capability denial, use `PermissionDenied`.
- If missing token, use `SessionExpired` or sign-in.
- If route context says inactive/restricted from trusted admin/user state, use `AccountLocked`.

`RATE_LIMITED`:
- Use `rate_limited`.
- Show wait guidance.
- Do not show account detail.

Provider `too-many-requests`:
- Use `rate_limited`.

Provider disabled user:
- Use `provider_disabled` only if provider surface confirms disabled state for the current auth user or safe trusted context.

Provider token revoked:
- If ordinary expiry, use `SessionExpired`.
- If tied to account restriction or disabled user, use `AccountLocked`.

`INTERNAL_ERROR`:
- Show generic auth lock with support link.
- Include correlation ID if safe.

`NETWORK_ERROR`:
- Use `offline_uncertain` when auth state cannot be confirmed.

## Accessibility Requirements
Structure:
- Page has one `h1`.
- Lock reason is plain text.
- Primary CTA is a real button or platform button.
- Legal/support links are reachable by keyboard and screen reader.

Focus:
- On route entry, focus the heading.
- On state change from loading to lock state, announce status without moving focus unless context changes.
- On countdown complete, announce `You can try signing in again.`

Touch:
- Primary CTA target must be at least 44 dp on mobile.
- Web pointer targets must meet or exceed WCAG minimum target size.
- Secondary actions must not be tightly packed.

Color:
- Color cannot be the only indicator for lock severity.
- Every state needs text label.
- Contrast must pass WCAG AA for text.

Motion:
- Respect reduced-motion preference.
- No flashing or alarm animation.

Screen reader labels:
- Hero icon label: `Access paused`
- Countdown label: `Time before retry`
- Primary CTA labels must include outcome.

## Responsive Behavior
Small mobile:
- Single column.
- Keep heading and body above fold.
- Sticky footer CTA if content is long.
- Avoid more than two secondary actions visible at once; place remaining links in footer.

Large mobile:
- Add more spacing but keep one-card hierarchy.
- Support split CTA row only for equal-weight safe actions.

Tablet:
- Center card with max width.
- Optional side note for security reassurance.

Admin desktop:
- Center panel with max width.
- Place recovery owner card to the right only if enough width.
- No admin navigation.

Web narrow:
- Match mobile layout.

Low bandwidth:
- No dependency on remote illustrations.
- Text-first design.
- Icons can be inline vector from design system.

## Offline And Cache Behavior
Offline entry from sign-in:
- Show `offline_uncertain`.
- Do not submit new auth attempts.
- Allow retry.
- Allow role selection.

Offline entry from protected route:
- Hide protected content.
- Clear unsafe action state.
- Do not open offline outbox from this route.
- Staff can return to sign-in only after online check.

Cached user state:
- May inform role-safe copy only if the data is non-sensitive and was already trusted.
- Must not override current provider/backend lock result.

Queued actions:
- Do not process queued custody, proof, payment, refund, or admin actions while locked.
- Queue repair belongs to `OpsActionRecovery`, not this screen.

## Analytics
Events:
- `account_locked_viewed`
- `account_locked_primary_action_clicked`
- `account_locked_secondary_action_clicked`
- `account_locked_countdown_completed`
- `account_locked_support_opened`
- `account_locked_unsafe_return_discarded`
- `account_locked_recovery_started`
- `account_locked_offline_retry_clicked`

Event properties:
- `reasonClass`
- `source`
- `roleHint`
- `trustedIdentity`
- `hasRetryAfter`
- `hasSupportCaseId`
- `hasAppealDeadline`
- `unsafeReturnDiscarded`
- `platform`

Forbidden analytics properties:
- raw phone
- raw email
- PIN
- OTP
- password
- MFA code
- Firebase UID
- provider token
- delivery ID
- station ID before trust
- issue ID
- evidence ID
- admin note

## Test IDs
Screen:
- `screen-account-locked`

Layout:
- `account-locked-brand`
- `account-locked-status-label`
- `account-locked-hero`
- `account-locked-recovery-panel`
- `account-locked-safety-note`
- `account-locked-secondary-actions`

Text:
- `account-locked-title`
- `account-locked-body`
- `account-locked-countdown`
- `account-locked-owner`
- `account-locked-recovery-note`
- `account-locked-unsafe-return-note`

Actions:
- `account-locked-primary-action`
- `account-locked-role-selection-action`
- `account-locked-sign-out-action`
- `account-locked-support-action`
- `account-locked-privacy-link`
- `account-locked-terms-link`

States:
- `account-locked-loading-state`
- `account-locked-generic-state`
- `account-locked-temporary-state`
- `account-locked-rate-limited-state`
- `account-locked-inactive-state`
- `account-locked-staff-restricted-state`
- `account-locked-admin-restricted-state`
- `account-locked-fraud-review-state`
- `account-locked-provider-disabled-state`
- `account-locked-session-revoked-state`
- `account-locked-offline-state`

## QA Matrix
Generic unauthenticated:
- Unknown account and locked account render same top-level copy.
- No phone, email, name, station, or role appears.
- Primary action does not reveal account existence.

Temporary lockout:
- Countdown renders only when `retryAfterSeconds` exists.
- CTA is disabled while countdown is active.
- CTA routes to safe sign-in after countdown.
- Screen reader receives status update when countdown completes.

Sender recovery:
- Trusted sender sees phone recovery.
- Untrusted sender sees generic recovery.
- Sender cannot access delivery detail through unsafe return.

Staff inactive:
- Staff sees contact supervisor/admin guidance.
- Staff cannot open queue, run, proof, or station detail.
- No direct unlock action appears.

Staff restricted:
- Review path appears only when safe.
- Appeal deadline appears only when provided.
- No linked delivery evidence appears.

Admin restricted:
- Admin shell is hidden.
- Admin recovery path appears.
- No admin data appears.

Provider disabled:
- Local session clears.
- Support path appears.
- No provider token appears in logs or UI.

Session revoked:
- Ordinary session expiry uses `SessionExpired`.
- Risk-linked revocation uses `AccountLocked`.
- Unsafe protected return is discarded.

Offline:
- Retry connection works.
- Protected content remains hidden.
- No offline queued action runs.

Accessibility:
- One `h1`.
- Focus starts on heading.
- Primary CTA has accessible name.
- Status changes are announced.
- Touch targets meet size requirements.
- Color is not the only signal.

Security:
- Query params cannot force trusted identity.
- Query params cannot force privileged role copy.
- Unknown reason maps to generic.
- Unsafe return route is discarded.
- Telemetry excludes sensitive values.

## Implementation Checklist
1. Create `/account-locked` route outside protected shells.
2. Add route context parser with safe defaults.
3. Add return-route allowlist.
4. Add trust-level mapper.
5. Add state builders for all required states.
6. Add auth-safe shell with no protected nav.
7. Add lock hero.
8. Add recovery panel.
9. Add operational safety note.
10. Add secondary actions and legal footer.
11. Add countdown behavior.
12. Add offline retry behavior.
13. Add local sensitive-state clearing on entry.
14. Add telemetry with redaction.
15. Add accessibility labels and focus behavior.
16. Add unit tests for mapper.
17. Add route tests for unsafe return handling.
18. Add component tests for every state.
19. Add E2E coverage from sender, staff, and admin auth failures.
20. Add visual regression coverage for mobile, tablet, and admin desktop.

## Acceptance Criteria
The screen is complete when:
- `/account-locked` renders without authenticated app shell.
- Generic unauthenticated state does not reveal account existence.
- Temporary lockout follows `5` attempts in `15` minutes when provided by auth policy context.
- Sender recovery routes to phone recovery only when safe.
- Staff recovery requires supervisor or authorized admin path.
- Admin recovery uses admin recovery or super-admin contact path.
- Inactive account never self-reactivates.
- Restricted account never shows evidence detail.
- Provider disabled state clears local session.
- Session revocation tied to account safety routes here, not to ordinary expiry.
- Unsafe return routes are discarded.
- Offline state blocks protected content.
- Status changes are accessible.
- All actions have stable test IDs.
- Telemetry is redacted.
- Unit, integration, accessibility, and E2E tests cover required states.

## Open Product Decisions
No product decision blocks v1 screen implementation.

Non-blocking backend improvements:
- Add explicit account lock error codes.
- Add account recovery support-case endpoint.
- Add staff appeal request endpoint.
- Add safe lock-status read endpoint.
- Add retry-after and recovery-owner fields.
- Add lockout audit event taxonomy.

## Final Implementation Guidance
Claude Code should build this as a strict security boundary. The route can be visually polished, but it must stay sparse, safe, and recovery-focused. If the frontend cannot confirm the exact account state, it must show generic lock copy and avoid account-specific details. If the user is staff or admin and the account is inactive or restricted, the screen must not provide a self-service unlock path. Access restoration belongs to authorized backend and admin workflows, not this page.
