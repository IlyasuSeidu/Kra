# AdminSignIn Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminSignIn` |
| Route | `/admin/sign-in` |
| Primary test ID | `screen-admin-sign-in` |
| Surface | Admin web console |
| Backend coverage | Auth provider sign-in, Firebase ID token, backend bearer-token role validation, protected admin route probe |
| Offline critical | No |
| Required auth method | `email_password_mfa` |
| Allowed roles after auth | `ops_admin`, `finance_admin`, `support_admin`, `super_admin` |
| Required states | `checking_session`, `ready`, `submitting_credentials`, `mfa_required`, `verifying_mfa`, `validating_admin_role`, `success_redirect`, `denied`, `locked`, `rate_limited`, `offline`, `provider_unavailable`, `reset_sent`, `api_error` |
| Parent screens | Public web, expired admin session guard, protected admin route redirect |
| Destination screens | `AdminOverview`, allowlisted protected admin return route |
| Current implementation mode | Admin auth entry spec for contract-only admin app; no frontend UI implementation in this docs pass |

## Outcome
`AdminSignIn` lets provisioned admin users authenticate into the web console without weakening role boundaries, revealing account state, or letting non-admin sessions enter protected admin routes.

The screen must answer:
- `Am I on the real admin console entry?`
- `Which credentials are required?`
- `When is MFA required?`
- `Was the sign-in attempt accepted, challenged, denied, locked, or unavailable?`
- `Is the authenticated user actually an admin role?`
- `Where will I land after successful sign-in?`
- `What should I do if I forgot my password or lost MFA access?`

This screen must be secure first and polished second. Visual quality matters because admin confidence matters, but it must never trade away authentication safety.

## Product Definition
This screen allows:
- Provisioned admin users to sign in with email and password.
- Auth provider MFA challenge when required.
- Existing valid admin sessions to redirect safely.
- Expired sessions to reauthenticate.
- Password reset request through the approved auth provider.
- Denied state for authenticated non-admin or inactive users.
- Generic error handling that avoids account enumeration.
- Safe return to an allowlisted admin route after authentication.

It does not allow:
- Sender phone OTP sign-in.
- Staff phone/PIN sign-in.
- Receiver link verification.
- Admin self-registration.
- Role selection by the user.
- Station selection.
- Admin role creation.
- User provisioning.
- Admin route access before role validation.
- Bypassing MFA.
- Keeping an admin session beyond approved policy.
- Calling admin user APIs before authentication.
- Exposing raw auth provider errors.

## Users
Primary:
- `ops_admin` reviewing operations, launch readiness, delivery queues, and incidents.
- `finance_admin` reviewing payments, refunds, pricing, and reconciliation.
- `support_admin` reviewing issue queues and support workflows.
- `super_admin` managing users, roles, stations, and high-privilege controls.

Secondary:
- Security reviewers validating admin authentication.
- QA validating denied, lockout, and redirect behavior.
- Claude Code implementing admin auth routing later.

## Entry Points
The screen can open from:
- Direct URL `/admin/sign-in`.
- Protected admin route guard after no session.
- Protected admin route guard after expired session.
- Sign-out completion.
- Password reset completion.
- Admin invitation email if the invite link resolves to sign-in.

The screen must not open from:
- Sender mobile auth.
- Staff mobile auth.
- Receiver public tracking verification.
- Public support forms.

## Real-World Context
Admin users may sign in from laptops in offices, station back rooms, shared operations desks, or during an incident. Some sessions will be time-sensitive, but admin access is high risk. The UI must be fast without encouraging unsafe shortcuts.

The screen must support:
- Password managers.
- MFA entry.
- Keyboard-only use.
- Screen readers.
- Session expiry recovery.
- Safe redirect after reauthentication.
- Clear lockout and provider-unavailable states.
- Low information leakage.

## User Goal
Primary goal:
- Sign in securely and land on the intended admin console route.

Secondary goals:
- Recover from forgotten password.
- Understand denied access without exposing account details.
- Know when MFA is required.
- Avoid losing intended route after session expiry.

## Scope
In scope:
- Email/password entry.
- MFA challenge handoff.
- Password reset request.
- Existing session validation.
- Admin role validation.
- Denied state.
- Lockout and rate-limit state.
- Offline/provider-unavailable state.
- Safe redirect handling.
- Admin auth visual system and copy.

Out of scope:
- Admin user provisioning.
- Role management.
- MFA enrollment setup.
- Staff phone/PIN auth.
- Sender phone OTP auth.
- Receiver delivery link verification.
- Account recovery adjudication.
- Audit log viewing.
- Any admin dashboard data display.

## Design Thesis
This screen should feel like a high-trust operations vault: restrained, precise, calm under incident pressure, and impossible to confuse with sender or staff login.

Visual thesis:
- `secure dispatch gate`: warm off-white base, deep green-black type, muted brass security accents, precise form geometry, subtle route-grid texture, and no consumer marketing decoration.

Design principles:
- One primary action at a time.
- The console name and security purpose must be obvious above the fold.
- The MFA step must feel like a continuation, not a second product.
- Error copy must be helpful without revealing account state.
- Redirect copy must be clear when session expiry interrupted the user.
- The screen must look serious enough for finance and operations administrators.

Restraint rule:
- No decorative hero illustrations, public marketing claims, app store badges, delivery maps, courier imagery, or product screenshots.

## Research Inputs
Relevant external references:
- [Firebase email/password auth](https://firebase.google.com/docs/auth/web/password-auth): supports client-side email/password sign-in and password reset through Firebase Authentication.
- [Firebase multi-factor auth for web](https://firebase.google.com/docs/auth/web/multi-factor): supports MFA challenge and resolver-based sign-in continuation after first-factor authentication.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic authentication error messages, throttling, secure password handling, and account enumeration prevention.
- [NIST SP 800-63B authentication guidance](https://pages.nist.gov/800-63-4/sp800-63b.html): supports verifier controls, session management, reauthentication, and authentication assurance expectations.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports field-specific accessible errors.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing authentication progress, denied, lockout, reset, and redirect states.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard flow through sign-in and MFA.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `docs/02-users/user-roles.md`
- `docs/14-platform/ci-cd-governance.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/auth.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`
- `apps/admin/src/index.ts`

## Local Policy
Approved auth policy:
- Admin roles use `email_password_mfa`.
- Admin session duration is `8 hours`.
- Admin recovery uses email reset plus MFA challenge.
- Lockout occurs after `5` failed attempts in `15 minutes`.
- Authentication proves identity only.
- Backend authorization decides what the user may do.
- Admin roles are `ops_admin`, `finance_admin`, `support_admin`, and `super_admin`.
- Staff accounts are created by `super_admin`.
- Role and station assignment are mandatory before first sign-in where applicable.
- Inactive staff sessions are revoked immediately on offboarding.

Critical rule:
- The UI must not treat successful first-factor sign-in as admin access. Admin route access begins only after backend-compatible session and admin role validation pass.

## Current Backend Reality
Current backend behavior:
- Backend verifies Firebase bearer tokens.
- Backend builds `AuthPrincipal` from Firebase decoded token claims.
- Backend expects `kra_role` claim.
- Backend normalizes user ID to `USR-*`.
- Backend uses role capabilities from shared permissions.
- Admin routes require authenticated admin role or admin capability.

No dedicated backend endpoint currently exists for:
- Admin login.
- Admin MFA challenge.
- Admin password reset.
- Current-user profile.
- Admin session TTL query.
- Admin account lockout display.

Implementation implication:
- The web client must use the approved auth provider for sign-in and MFA.
- The app shell must validate the token against a protected admin route or future session endpoint before entering admin console.
- The sign-in screen must not call `admin_upsert_user`, `admin_users`, or any provisioning endpoint.

## Auth Flow
Step 1: Existing session check.
- On load, ask the session provider whether a valid auth session exists.
- If no session exists, show ready state.
- If a session exists, obtain ID token.
- Validate admin role through backend-compatible admin route probe.
- If admin validation passes, redirect to safe destination.
- If validation fails, sign out locally and show denied state.

Step 2: Email/password.
- User enters admin email and password.
- Client calls approved auth provider sign-in.
- Provider returns success, MFA required, rate limit, lockout, or error.
- Raw provider errors are mapped to product-owned copy.

Step 3: MFA.
- If MFA is required, show MFA challenge state.
- User completes provider-supported MFA challenge.
- On success, obtain fresh ID token.
- Continue to admin role validation.

Step 4: Admin role validation.
- Use token against protected admin route probe.
- Accept only admin roles.
- Reject sender, driver, station operator, final-mile courier, missing role, invalid role, inactive, or unauthorized responses.

Step 5: Safe redirect.
- Redirect to allowlisted `returnTo` path when present and valid.
- Otherwise redirect to `/admin`.

## Route And Redirect Rules
Route:
- `/admin/sign-in`

Allowed `returnTo`:
- `/admin`
- `/admin/*`

Rejected `returnTo`:
- Full external URLs.
- Protocol-relative URLs.
- Public web routes.
- Sender or mobile routes.
- Auth routes other than admin sign-in recovery flow.
- Any path containing unsafe encoded redirect behavior.

Rules:
- Store `returnTo` only in memory or session-safe auth state, not durable storage unless product approves.
- If `returnTo` is invalid, fall back to `/admin`.
- If user signs out intentionally, clear `returnTo`.
- If session expires during admin work, preserve allowlisted `returnTo`.

## Role Gate Rules
Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Denied roles:
- `sender`
- `driver`
- `station_operator`
- `final_mile_courier`
- missing role claim.
- invalid role claim.
- inactive user.

Denied copy:
- Title: `Admin access unavailable`
- Body: `This account cannot access the admin console. Use a provisioned admin account or contact a super admin.`
- Primary action: `Try another account`

Rules:
- Do not reveal whether the email exists.
- Do not reveal the exact role in denied copy.
- Do not show admin navigation in denied state.
- Sign out denied sessions before returning to ready state.

## Information Architecture
Top-to-bottom order:
- Brand and route identity.
- Security context panel.
- Sign-in form or MFA form.
- Status and error region.
- Recovery and policy links.
- Environment indicator for non-production only.

Desktop layout:
- Two-column composition on wide screens.
- Left side: security context, role boundary, session policy.
- Right side: auth form card.

Small screen layout:
- Single-column.
- Security context above form.
- MFA code field visible without scrolling after challenge begins.

## Brand And Route Identity
Content:
- Product mark or wordmark.
- Title: `Admin console`
- Subtitle: `Secure operations access`
- Environment chip only outside production.

Rules:
- Production must not display internal environment names unless needed for safe operations.
- Non-production environment chip must be visually distinct.
- Title must not say staff sign-in or sender sign-in.

## Security Context Panel
Purpose:
- Explain why this sign-in is different from other Kra auth paths.

Content:
- `Admin access requires a provisioned account and MFA.`
- `Sessions are limited to 8 hours.`
- `Protected actions are logged.`

Rules:
- Keep concise.
- Do not expose implementation secrets.
- Do not list admin capabilities in detail before sign-in.

## Email And Password Form
Fields:
- Email.
- Password.

Email requirements:
- Use `type=email`.
- Use `autocomplete=username`.
- Trim whitespace.
- Normalize only safe casing if auth provider expects it.
- Do not block uncommon valid email patterns with overly strict client validation.

Password requirements:
- Use `type=password`.
- Use `autocomplete=current-password`.
- Support password manager fill.
- Provide show/hide control with accessible label.
- Do not trim password.
- Do not log password.
- Do not persist password.

Primary action:
- `Continue securely`

Field errors:
- Email empty: `Enter your admin email.`
- Email invalid: `Enter a valid email address.`
- Password empty: `Enter your password.`

Generic auth failure:
- `The email, password, or MFA check could not be verified. Try again.`

Rules:
- Do not show `user not found`.
- Do not show `wrong password`.
- Do not show raw provider error codes.
- Disable submit only for empty local fields or in-progress submission.
- After provider failure, keep email but clear password.

## MFA Challenge
Trigger:
- Auth provider returns MFA required.

Content:
- Title: `Complete MFA`
- Body: `Enter the verification code from your admin security method.`
- Field: `MFA code`
- Primary action: `Verify and continue`
- Secondary action: `Use another account`

Rules:
- Do not expose full phone or device identifiers unless provider returns masked safe text.
- Do not allow bypass.
- Do not route to admin console until MFA and admin role validation pass.
- Generic MFA failure copy must avoid revealing which factor failed.
- Back from MFA returns to email/password only after confirmation because it abandons current sign-in attempt.

MFA errors:
- Empty code: `Enter the MFA code.`
- Invalid or expired: `The MFA code could not be verified. Request a new code or try again.`
- Too many attempts: `Too many attempts. Wait before trying again.`

## Password Reset
Entry:
- `Forgot password?`

Behavior:
- Opens password reset panel or provider reset action.
- Requires email field.
- Sends reset request through approved auth provider.
- Shows generic success state whether or not the email exists.

Copy:
- Title: `Reset password`
- Body: `Enter your admin email. If the account is eligible, reset instructions will be sent.`
- Success: `If this account is eligible, reset instructions have been sent.`

Rules:
- Do not reveal account existence.
- Do not bypass MFA policy.
- Do not create support case automatically.
- Preserve `returnTo` only if safe.

## Session Expiry State
When redirected from protected admin route:
- Show a compact banner above form.

Copy:
- `Your admin session expired. Sign in again to continue.`

Rules:
- Do not show protected route data.
- Preserve allowlisted `returnTo`.
- If session expired during a privileged action, route back to the page, not the action submission.

## Existing Session State
When session exists:
- Show `Checking admin session`.
- Obtain fresh token.
- Validate backend admin access.
- Redirect if valid.
- Show denied if not admin.

Rules:
- Avoid flashing protected admin UI before validation.
- Do not trust local role state alone.
- Do not show sign-in form until session validation completes or fails.

## Lockout And Rate Limit
Lockout policy:
- Lock after `5` failed attempts in `15 minutes` per local auth policy or provider enforcement.

Copy:
- Title: `Sign-in temporarily locked`
- Body: `Too many attempts were made. Wait before trying again or use password reset if needed.`

Rate limit copy:
- Title: `Try again shortly`
- Body: `Too many sign-in requests were sent. Wait a moment before trying again.`

Rules:
- Show wait time only if provider returns safe wait time.
- Do not count attempts client-side as authority.
- Disable submit while locked.
- Offer password reset when appropriate.

## Offline And Provider Unavailable
Offline:
- Title: `Network required`
- Body: `Admin sign-in needs a secure network connection. Check your connection and try again.`

Provider unavailable:
- Title: `Sign-in service unavailable`
- Body: `The authentication service is not responding. Try again in a few minutes.`

Rules:
- Do not queue sign-in attempts.
- Do not store credentials for retry.
- Do not enter admin console from cached auth if token refresh fails and backend validation cannot happen.

## Success Redirect
On successful auth and role validation:
- Clear password and MFA code from memory.
- Store auth session through approved provider persistence.
- Record analytics without email or credential values.
- Redirect to allowlisted `returnTo` or `/admin`.

Copy before redirect, if visible:
- `Access verified. Opening admin console.`

Rules:
- Redirect should be fast but screen reader users need status message.
- Do not show admin dashboard content in sign-in route.

## Error Mapping
Map provider and backend errors to safe user states.

Generic credential failure:
- `The email, password, or MFA check could not be verified. Try again.`

MFA required:
- Show MFA challenge.

Too many attempts:
- Show rate-limit or locked state.

Missing role claim:
- Show denied.

Invalid role claim:
- Show denied.

Non-admin role:
- Show denied.

Backend `FORBIDDEN` from admin probe:
- Show denied.

Backend unavailable:
- Show provider or API unavailable state depending on source.

Unknown:
- `Something went wrong. Try again.`

Rules:
- Developer diagnostics may be logged through safe error telemetry without credentials.
- UI copy must not include raw error codes except stable user-safe support codes when product adds them.

## Visual System
Layout:
- Full viewport web auth page.
- Max-width form card.
- Strong alignment.
- Plenty of negative space.
- Security panel on wide screens.
- No admin navigation before auth.

Color:
- Background: warm white or light stone.
- Primary ink: deep green-black.
- Accent: muted brass or safety amber.
- Error: deep red with text label.
- Success: restrained green.

Typography:
- Use a confident editorial display face for title if available.
- Use a highly legible body face.
- Use tabular numerals only for MFA countdowns or wait times.
- Avoid oversized marketing headline treatment.

Motion:
- Fade between credential and MFA step.
- Preserve reduced motion.
- Do not animate lockout or error states aggressively.

Responsive behavior:
- Desktop: two-column.
- Tablet: centered card with security panel above.
- Mobile-width web: single-column with large touch targets and no side panel overflow.

## Copy System
Voice:
- Direct.
- Secure.
- Calm.
- Low detail before auth.
- Never blame the user.

Approved phrases:
- `Admin console`
- `Secure operations access`
- `Continue securely`
- `Complete MFA`
- `Admin access unavailable`
- `Your admin session expired`
- `Protected actions are logged`

Avoid:
- `Login failed because user does not exist`
- `Wrong password`
- `You are a sender account`
- `Skip MFA`
- `Remember this device`
- `Create admin account`
- `Choose your role`
- `Continue without verification`
- `Open dashboard while offline`

## Data Handling
Do not store:
- Password.
- MFA code.
- Raw provider error.
- Full email in analytics.
- Admin token outside approved auth/session provider.
- Protected admin data on sign-in route.

May store:
- Allowlisted `returnTo`.
- Non-sensitive last route reason such as `expired_session`.
- Session state through approved auth provider.

Logging:
- Log auth attempt result category, not credentials.
- Log denied role only in protected server logs if policy allows, not client analytics.
- Never log password or MFA code.

## Security Requirements
Requirements:
- Admin route must be inaccessible before token and role validation.
- MFA is mandatory through provider policy for admin roles.
- Auth errors are generic.
- Sign-in attempts are not queued.
- `returnTo` is allowlisted.
- No open redirects.
- No client-side role override.
- No role picker.
- No admin provisioning call from sign-in.
- No protected API calls before auth except safe role validation after token exists.
- Sign out denied non-admin session before allowing another attempt.
- Clear sensitive field values after failure or sign-out.
- Use TLS-only production deployment.

## Accessibility
Requirements:
- Root element has `screen-admin-sign-in`.
- Page title identifies admin sign-in.
- Form fields have programmatic labels.
- Email and password errors are associated with fields.
- Password visibility control has accessible name and pressed state.
- MFA code field has clear label.
- Submit progress uses status message.
- Denied, lockout, reset sent, and redirect states use status messages.
- Focus moves to MFA heading when MFA challenge appears.
- Focus returns to email field after using another account.
- Focus order matches visual order.
- Keyboard-only flow can complete sign-in and reset request.
- Contrast meets WCAG for text, borders, focus, and error states.
- Large text does not hide submit or recovery link.

## Analytics
Events:
- `admin_sign_in_viewed`
- `admin_sign_in_submit_attempted`
- `admin_sign_in_mfa_required`
- `admin_sign_in_mfa_submit_attempted`
- `admin_sign_in_role_validation_started`
- `admin_sign_in_success`
- `admin_sign_in_denied`
- `admin_sign_in_locked`
- `admin_sign_in_rate_limited`
- `admin_sign_in_reset_requested`
- `admin_sign_in_reset_sent`
- `admin_sign_in_provider_unavailable`

Required properties:
- `source`
- `has_return_to`
- `return_to_allowed`
- `result_category`
- `environment`

Forbidden properties:
- Email.
- Password.
- MFA code.
- Raw token.
- Raw provider error.
- Full protected route query string.

## Testing Requirements
Unit tests:
- Renders `screen-admin-sign-in`.
- Shows email/password form when no session exists.
- Requires email.
- Requires password.
- Maps auth failures to generic copy.
- Shows MFA step when provider requires MFA.
- Requires MFA code.
- Shows denied state for non-admin role.
- Rejects unsafe `returnTo`.
- Allows safe `/admin/*` `returnTo`.
- Does not render admin navigation before validation.
- Does not expose sender or staff sign-in controls.

Integration tests:
- Existing valid admin session redirects to `/admin`.
- Expired session shows session expiry banner.
- Email/password success plus MFA success validates admin role.
- Missing role claim shows denied.
- Sender role shows denied and signs out.
- Backend admin probe `FORBIDDEN` shows denied.
- Password reset shows generic sent state.
- Offline blocks sign-in and does not store credentials.
- Provider unavailable shows retry state.
- Lockout disables submit.

Accessibility tests:
- Field errors are announced.
- MFA transition moves focus correctly.
- Status messages announce submitting, validating, denied, locked, and success.
- Password visibility control is keyboard accessible.
- Reset panel is keyboard accessible.
- Focus order remains stable on desktop and mobile-width layouts.

Security tests:
- No admin API is called before token exists.
- No provisioning API is called from sign-in.
- Raw provider errors are not displayed.
- Email is not sent to analytics.
- Password and MFA code are cleared after failure or route leave.
- Unsafe redirects fall back to `/admin`.

## Acceptance Criteria
The screen is acceptable when:
- `/admin/sign-in` renders for unauthenticated users.
- Root test ID is `screen-admin-sign-in`.
- Admin email/password form is clear and accessible.
- MFA challenge is supported and cannot be skipped.
- Admin role validation happens before console entry.
- Non-admin authenticated users are denied.
- `returnTo` is allowlisted.
- Password reset uses generic account-safe copy.
- Offline and provider-unavailable states block sign-in safely.
- No admin dashboard data appears before validation.
- No admin provisioning API is called.
- No actual frontend UI is implemented in this docs pass.

## Implementation Notes For Claude Code
Build this as a web route when frontend implementation begins.

Use:
- Approved Firebase web auth client.
- Firebase MFA resolver flow if MFA is required.
- Backend-compatible bearer token for admin route validation.
- Protected route guard shared by all admin console routes.
- Session-only or approved admin persistence policy.

Do not use:
- Sender phone OTP flow.
- Staff phone/PIN flow.
- Role picker.
- Admin user creation endpoint.
- Local role override.
- Cached token as sole admin proof.
- Unvalidated `returnTo`.

Recommended route files:
- `apps/admin/src/routes/admin-sign-in` or project equivalent.
- Shared admin auth guard near admin shell.
- Admin auth provider adapter.

## Open Backend Work
Potential backend improvements:
- Add `GET /v1/auth/session` returning current principal and session policy.
- Add explicit admin MFA enforcement verification if auth provider cannot guarantee it through policy.
- Add safe account lockout metadata if product wants exact wait times.
- Add audit event for admin console sign-in success and denied admin role where policy allows.
- Add current-user endpoint for admin app bootstrap.

None of these are required for the screen spec to be implemented safely if the frontend uses provider auth and protected admin route validation.

## Open Product Work
Decisions to confirm before implementation:
- Exact MFA methods allowed for admin roles.
- Whether admin persistence is browser session only or provider-managed with 8-hour guard.
- Whether password reset is inline panel or separate route.
- Whether non-production environment chip is required in staging.
- Whether security contact link appears on lockout state.
- Whether admin sign-in should show product status incident link.

## Quality Bar
This spec is not closed unless the resulting UI:
- Looks like a serious operations console entry, not a consumer login page.
- Makes MFA feel mandatory and normal.
- Prevents account enumeration.
- Prevents open redirect.
- Separates identity proof from backend authorization.
- Blocks non-admin roles cleanly.
- Preserves accessibility under all error and challenge states.
- Keeps protected admin data invisible until validation passes.

## Handoff Checklist
- Screen contract is complete.
- Auth method is explicit.
- Admin role gate is explicit.
- MFA behavior is explicit.
- Safe redirect rules are complete.
- Denied, lockout, offline, and provider states are complete.
- Accessibility requirements are complete.
- Security requirements are complete.
- Tests reject unsafe redirects, role bypass, and raw provider errors.

## Final Self-Review
Security:
- Pass. The spec requires provider auth, MFA, backend-compatible admin role validation, generic errors, and safe redirects before console entry.

Backend honesty:
- Pass. The spec states there is no backend login endpoint and relies on Firebase token verification plus protected admin route validation.

UI quality:
- Pass. The spec defines a restrained, high-trust admin auth surface with clear hierarchy and no consumer-marketing clutter.

Implementation readiness:
- Pass. Claude Code can build the future route from this spec without adding unsupported provisioning, role selection, or admin dashboard behavior to sign-in.

Closed for implementation:
- This file is full enough for Claude Code to build `AdminSignIn` end to end as a secure admin web console entry once frontend UI work begins.
