# Invite Acceptance Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `InviteAcceptance` |
| App | `apps/web` primary for invite links, `apps/mobile` handoff for staff activation |
| Route | `/invite/:inviteToken` |
| Primary test ID | `screen-invite-acceptance` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P1 staff and admin onboarding completeness |
| Backend dependency | No invite verification endpoint exists yet; current v1 must route to staff activation or role-specific sign-in after safe token handling |
| Related routes | `/(auth)/role-selection`, `/(auth)/staff/activate`, `/(auth)/station/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/courier/sign-in`, `/admin/sign-in`, `/support`, `/privacy`, `/terms` |
| Required states | `loading`, `token_present`, `token_missing`, `token_invalid_format`, `verification_unavailable`, `invite_expired`, `invite_already_used`, `role_preview`, `activation_redirect`, `opening_app`, `not_supported`, `api_error` |

## Product Job
`InviteAcceptance` is the safe landing page for staff or admin invite links. It explains what the invite can do, prevents unsafe token handling, and routes the invited person to the correct activation or sign-in path.

The screen answers:
- `Is this a Kra invite link?`
- `What role was I invited for, if it can be verified safely?`
- `What should I do next?`
- `Why can I not accept access from the link alone?`
- `Where do station operators, drivers, couriers, and admins continue?`
- `What happens if the link is expired, already used, invalid, or not supported yet?`

The user should be able to:
- Understand that staff accounts are created by a super admin.
- Continue to staff activation when the app cannot verify the invite token.
- Open role-specific staff sign-in after activation.
- Open admin sign-in if the invite is for an admin role and web sign-in is required.
- Get support when the invite link fails.
- Avoid exposing the token in UI, analytics, logs, or copied text.

This screen is not:
- A self-registration screen.
- A role picker that grants access.
- A credential reset screen.
- A station selector.
- A password entry screen.
- A PIN entry screen.
- An admin provisioning screen.
- A way to activate an account without backend verification.
- A way to show private staff data from a URL token.

## Strategic Role
Invites are high-trust entry points. They can help staff onboard quickly, but they are also risky because a URL can be forwarded, leaked, expired, or opened on the wrong device.

Kra must treat invite links as routing and verification inputs, not as access authority.

Core principle:
- The invite link can start onboarding.
- Backend verification must decide whether it is valid.
- Staff activation must prove the invited person controls the approved credential.
- Backend role claims must still decide access after sign-in.

Until a real invite endpoint exists, this screen must not pretend to verify or accept the invite. It should guide the user to staff activation and explain that their account must already exist.

## Audience
Primary users:
- station operators invited by a super admin
- drivers invited by a super admin
- final-mile couriers invited by a super admin
- admin users invited to the web console

Secondary users:
- super admins sending invite links
- support agents helping staff activate accounts
- operations leads onboarding launch staff
- QA validating invite-token safety
- security reviewers validating token handling
- Claude Code implementing the frontend later

Non-users:
- public visitors
- receivers
- senders who are not staff
- payment providers
- SMS providers
- automated backend jobs

## Current Backend Reality
There is no current invite endpoint.

Missing endpoints:
- no `GET /v1/invites/:inviteToken`
- no `POST /v1/invites/:inviteToken/accept`
- no invite resend endpoint
- no invite revoke endpoint
- no invite audit endpoint
- no invite token exchange endpoint

Implemented related capabilities:
- `POST /v1/admin/users` can create or update a user record.
- `POST /v1/admin/users/:id/access` can update role, status, and station scope.
- staff accounts are created by `super_admin`
- role and station assignment are mandatory before first staff sign-in
- admin roles use email, password, and MFA
- staff roles use provisioned phone plus PIN
- station operator records require station scope
- sender, driver, courier, and admin roles must not accept station scope unless policy allows it

Therefore current v1 behavior:
- Parse route token only for basic format safety.
- Never trust the token as account proof.
- Never show decoded token data.
- Never call a non-existent invite endpoint.
- Show `verification_unavailable` or `activation_redirect`.
- Route staff to `/(auth)/staff/activate`.
- Route admin invite recipients to `/admin/sign-in` with clear web-first copy.
- Route unknown cases to role selection and support.

## Future Backend Contract Required
A complete invite acceptance flow requires backend endpoints before full acceptance can ship.

Required future read endpoint:
```http
GET /v1/invites/:inviteToken
```

Required future accept endpoint:
```http
POST /v1/invites/:inviteToken/accept
```

Minimum future invite read response:
```json
{
  "inviteId": "INV-20260521-001",
  "status": "pending",
  "role": "station_operator",
  "stationId": "ST-ACC-01",
  "expiresAt": "2026-05-22T10:00:00.000Z",
  "createdByUserId": "USR-ADMIN-001"
}
```

Minimum future accept response:
```json
{
  "status": "accepted",
  "nextRoute": "/(auth)/staff/activate"
}
```

Future endpoint requirements:
- token must be single-use
- token must expire
- token must be stored hashed server-side
- token must not reveal staff identity before verification
- token verification must be rate limited
- token acceptance must be audited
- acceptance must not skip staff activation
- acceptance must not bypass backend role claims
- acceptance must not expose full station data before sign-in

## Source References
External references used for this screen:
- [Firebase Authentication email action links](https://firebase.google.com/docs/auth/custom-email-handler): supports safe handling of email action URLs and explicit continuation into provider-managed auth flows when Firebase email actions are used.
- [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html): supports single-use, expiring, high-entropy URL tokens and account enumeration resistance for link-based flows.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic errors, throttling, and server-side auth enforcement.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports careful authenticator lifecycle, reauthentication, throttling, and recovery controls.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear token, form, and recovery error messages.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, verification, redirect, and error states.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-continue when verified invite details are available later.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/08-security/authorization-rules.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/01-auth-role-selection.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/18-admin-user-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/19-admin-user-access.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/01-admin-sign-in.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/users.ts`
- `services/api/src/auth.ts`

## Design Thesis
Design this as a guarded invite checkpoint: reassuring, strict, and honest. The page should feel like a controlled staff onboarding handoff, not a marketing signup form.

Visual direction:
- clean invite card centered on web
- mobile-friendly route handoff
- strong Kra staff identity
- restrained security notice
- clear role and next-step blocks
- no private data before verification
- no over-styled celebration

Restraint rule:
- Do not turn the invite into a registration wizard. The screen validates the link context when supported, explains the boundary, and routes to activation or sign-in.

## Product Principle
An invite is a doorway, not a key.

The UI must reinforce:
- A super admin creates staff and admin accounts.
- The invite link can guide onboarding.
- The account must still be activated through approved auth.
- Backend role and station claims still control access.
- A bad link must fail safely without revealing account existence.

## Information Architecture
Top-level layout:
1. Header.
2. Invite status card.
3. Role or route context.
4. Next-step action.
5. Security explanation.
6. Recovery links.
7. Footer links.

Header:
- Kra mark.
- Title based on state.
- Short explanation.

Invite status card:
- `Invite link found`
- `Invite link missing`
- `Invite cannot be verified yet`
- `Invite expired`
- `Invite already used`
- `Invite unavailable`

Role context:
- Show only if verified by backend in the future or safely known from route context.
- Do not show unverified role claims decoded from token.

Next-step actions:
- `Activate staff account`
- `Open admin sign in`
- `Choose role`
- `Get support`

Security explanation:
- Plain copy explaining why link alone does not grant access.

Footer:
- Support.
- Privacy.
- Terms.

## Routing
Primary route:
```text
/invite/:inviteToken
```

Supported exits:
- `/(auth)/staff/activate`
- `/(auth)/role-selection`
- `/(auth)/station/sign-in`
- `/(auth)/driver/sign-in`
- `/(auth)/courier/sign-in`
- `/admin/sign-in`
- `/support`
- `/privacy`
- `/terms`

Route token rules:
- token is required for route match
- token must never render in visible text
- token must never be copied into analytics
- token must never be written to local storage
- token must never be logged by frontend
- token must be removed from route state after safe handoff if router supports it

Token format screening:
- allow only URL-safe token characters
- reject whitespace
- reject path traversal sequences
- reject very short values
- reject extremely long values
- do not reveal which rule failed

## Current V1 Flow
Current safe flow:
1. User opens `/invite/:inviteToken`.
2. UI screens token for safe format.
3. UI shows that invite verification is not available in this build.
4. UI explains that staff account must already be created by an admin.
5. User continues to `/(auth)/staff/activate` or `/admin/sign-in`.
6. Downstream auth verifies identity and backend role claims.

Current v1 must not:
- decode invite token
- show invite metadata
- mark invite accepted
- create user
- update user
- activate user
- set role
- set station scope
- call admin user endpoints
- create an auth account

## Future Complete Flow
Future flow after backend endpoints exist:
1. User opens invite route.
2. Frontend requests invite verification.
3. Backend returns safe invite context or generic failure.
4. User reviews role and next step.
5. User accepts invite.
6. Backend marks invite accepted or creates an activation challenge.
7. User continues to staff activation or admin sign-in.
8. Auth provider verifies identity.
9. Backend claims authorize access.

Future invite statuses:
- `pending`
- `accepted`
- `expired`
- `revoked`
- `not_found`
- `rate_limited`

Future safe role preview:
- show role label
- show station assignment only if safe and necessary
- show expiry time
- show generic inviter type, not personal inviter data
- do not show full invited email or phone until identity is verified

## State Model
```ts
type InviteAcceptanceState =
  | { type: "loading" }
  | { type: "token_present"; tokenFormat: "safe" }
  | { type: "token_missing" }
  | { type: "token_invalid_format" }
  | { type: "verification_unavailable"; tokenFormat: "safe" }
  | { type: "invite_expired" }
  | { type: "invite_already_used" }
  | { type: "role_preview"; invite: SafeInvitePreview }
  | { type: "activation_redirect"; target: InviteTargetRoute }
  | { type: "opening_app"; target: InviteTargetRoute }
  | { type: "not_supported" }
  | { type: "api_error"; message: string };

type InviteTargetRoute =
  | "staff_activation"
  | "station_sign_in"
  | "driver_sign_in"
  | "courier_sign_in"
  | "admin_sign_in"
  | "role_selection"
  | "support";

interface SafeInvitePreview {
  inviteId: string;
  role: "station_operator" | "driver" | "final_mile_courier" | "ops_admin" | "finance_admin" | "support_admin" | "super_admin";
  stationId?: string;
  expiresAt: string;
}
```

## Loading State
Trigger:
- route opens
- future backend verification is in progress
- app is resolving route token status

UI:
- centered invite card
- skeleton or progress indicator
- no token text

Copy:
- `Checking invite link...`

Accessibility:
- use polite status message
- do not move focus repeatedly

## Token Present State
Trigger:
- token exists and passes basic format screening

UI:
- show invite link found card
- show current v1 boundary notice
- offer activation or admin sign-in depending on route context if known

Copy:
- Title: `Invite link found`
- Body: `This link can start onboarding, but access is verified during activation and sign-in.`

## Token Missing State
Trigger:
- route opens without a token
- token param is empty after parsing

UI:
- full error card
- support and role selection actions

Copy:
- Title: `Invite link missing`
- Body: `Open the link from your invite message or contact your supervisor for a new link.`
- Primary action: `Choose role`
- Secondary action: `Get support`

## Token Invalid Format State
Trigger:
- token includes unsafe characters
- token is too short
- token is too long
- token fails URL-safe pattern

UI:
- full error card
- no raw token
- support action

Copy:
- Title: `Invite link cannot be used`
- Body: `This invite link is not valid. Ask your supervisor or support team for help.`
- Action: `Get support`

Security:
- Do not say which token rule failed.
- Do not expose token length.
- Do not expose decoded data.

## Verification Unavailable State
Trigger:
- current v1 build has no invite verification endpoint

UI:
- guarded status card
- explanation of current limitation
- primary action to staff activation
- admin web action if admin context is clear
- support link

Copy:
- Title: `Continue with account activation`
- Body: `Kra cannot verify invite links in this build yet. If your account was created by an admin, continue to staff activation or admin sign in.`
- Primary action: `Activate staff account`
- Secondary action: `Choose role`

## Invite Expired State
Trigger:
- future backend returns expired invite status

UI:
- expired status card
- no role details unless backend marks them safe
- support and supervisor guidance

Copy:
- Title: `Invite expired`
- Body: `Ask your supervisor or a super admin to send a new invite.`
- Action: `Get support`

## Invite Already Used State
Trigger:
- future backend returns accepted status

UI:
- used status card
- route to sign-in based on safe role if available
- support link

Copy:
- Title: `Invite already used`
- Body: `If your account is active, sign in with the role assigned to you.`
- Primary action: `Choose role`

## Role Preview State
Trigger:
- future backend returns safe pending invite context

UI:
- role summary card
- expiry summary
- station scope summary only when safe
- continue action
- security note

Copy:
- Title: `Review your invite`
- Body: `This invite starts onboarding for the role below. You will still verify your identity before using Kra.`

Role labels:
- `station_operator`: `Station operator`
- `driver`: `Driver`
- `final_mile_courier`: `Courier`
- `ops_admin`: `Operations admin`
- `finance_admin`: `Finance admin`
- `support_admin`: `Support admin`
- `super_admin`: `Super admin`

Primary action:
- staff roles: `Continue to activation`
- admin roles: `Continue to admin sign in`

## Activation Redirect State
Trigger:
- user chooses activation or sign-in target

UI:
- route progress state
- keep token hidden
- disable repeated activation

Copy:
- Staff: `Opening staff activation...`
- Admin: `Opening admin sign in...`
- Role: `Opening role selection...`

## Opening App State
Trigger:
- web invite route attempts to open mobile app or app store fallback

UI:
- explain handoff
- show direct fallback button
- show support link

Copy:
- Title: `Opening Kra`
- Body: `If the app does not open, continue in the browser or install the mobile app from your approved source.`

## Not Supported State
Trigger:
- invite target role is not supported in this app
- invite route is opened in a build without staff activation

UI:
- clear unsupported card
- role selection and support

Copy:
- Title: `Invite path unavailable`
- Body: `This app build cannot continue this invite. Contact support or use the correct Kra app.`

## API Error State
Trigger:
- future invite verification endpoint fails
- unexpected route parsing failure

UI:
- generic error card
- retry if safe
- support link

Copy:
- Title: `Could not check invite`
- Body: `Try again. If the issue continues, ask your supervisor or support team for help.`
- Primary action: `Try again`
- Secondary action: `Get support`

## Role And Route Mapping
| Invite role | Current v1 route | Future preferred route | Notes |
| --- | --- | --- | --- |
| `station_operator` | `/(auth)/staff/activate` | `/(auth)/staff/activate` | station scope verified after activation |
| `driver` | `/(auth)/staff/activate` | `/(auth)/staff/activate` | assignment scope applies after sign-in |
| `final_mile_courier` | `/(auth)/staff/activate` | `/(auth)/staff/activate` | receiver data hidden until sign-in |
| `ops_admin` | `/admin/sign-in` | `/admin/sign-in` | web-first admin |
| `finance_admin` | `/admin/sign-in` | `/admin/sign-in` | web-first admin |
| `support_admin` | `/admin/sign-in` | `/admin/sign-in` | web-first admin |
| `super_admin` | `/admin/sign-in` | `/admin/sign-in` | high-risk role |

## Token Handling Rules
Do:
- parse token from route
- validate basic format
- keep token in memory only when needed
- send token only to future invite endpoint over HTTPS
- remove token from visible route where router supports safe replace
- show generic token failures

Do not:
- render token
- log token
- copy token
- store token
- include token in analytics
- include token in support links
- decode token client-side for authority
- treat token as role proof
- pass token into staff activation as trusted identity
- send token to admin user endpoints

## Data Display Rules
Current v1:
- show no invite metadata
- show no role preview from token
- show no station ID from token
- show no invited email
- show no invited phone
- show no inviter name

Future after backend verification:
- show role label
- show station ID only if backend says it is safe and useful
- show expiry
- show generic creator type if needed
- do not show full invited email or phone until identity verification

## Copy System
Default title:
- `Accept your Kra invite`

Default subtitle:
- `Use this link to continue onboarding. Access is verified during activation and sign-in.`

Current v1 title:
- `Continue with account activation`

Current v1 body:
- `Kra cannot verify invite links in this build yet. If your account was created by an admin, continue to staff activation or admin sign in.`

Token missing title:
- `Invite link missing`

Token invalid title:
- `Invite link cannot be used`

Expired title:
- `Invite expired`

Already used title:
- `Invite already used`

Primary actions:
- `Activate staff account`
- `Open admin sign in`
- `Choose role`
- `Try again`
- `Get support`

Security note:
- `An invite does not grant access by itself. Kra checks your account and role before showing protected work.`

## Visual System
Layout:
- centered web card on desktop
- mobile-first single column
- safe top branding
- invite status card
- next-step action group
- recovery links
- footer links

Card style:
- high-trust neutral surface
- clear status icon
- no decorative confetti
- no user avatar before verification
- no role badge unless backend verified

Typography:
- strong page title
- short body copy
- clear action labels
- small but readable token safety note

Color:
- neutral for pending and current v1 boundary
- amber for expired or unavailable
- red only for invalid or blocked states
- success only after future backend acceptance returns success

Motion:
- minimal route transition
- no looping motion
- no celebratory animation
- respect reduced motion

## Component Inventory
Required components:
- `InviteAcceptanceScreen`
- `InviteHeader`
- `InviteStatusCard`
- `InviteTokenSafetyNotice`
- `InviteCurrentBoundaryNotice`
- `InviteRolePreview`
- `InviteNextActionGroup`
- `InviteRecoveryLinks`
- `InviteFooterLinks`
- `InviteStatusMessage`
- `InviteErrorState`

Responsibilities:
- `InviteAcceptanceScreen` owns route parsing, token screening, and state composition.
- `InviteHeader` renders title and short explanation.
- `InviteStatusCard` renders state-specific card.
- `InviteTokenSafetyNotice` explains token and access boundaries.
- `InviteCurrentBoundaryNotice` explains missing backend invite verification in v1.
- `InviteRolePreview` renders future verified invite context.
- `InviteNextActionGroup` renders activation, admin sign-in, role selection, and support actions.
- `InviteRecoveryLinks` renders support and alternate routes.
- `InviteFooterLinks` renders privacy and terms.
- `InviteStatusMessage` announces loading and redirects.
- `InviteErrorState` handles invalid, missing, expired, and API states.

## Interaction Rules
Open route:
- validate route token format
- never render token
- choose current state based on token and endpoint availability

Activate staff account:
- route to `/(auth)/staff/activate`
- do not append raw invite token
- if future backend provides a safe activation nonce, pass only through approved secure state

Open admin sign in:
- route to `/admin/sign-in`
- show web-first guidance if opened on mobile

Choose role:
- route to `/(auth)/role-selection`

Get support:
- route to `/support`
- do not include raw token in support route

Retry:
- retry future verification endpoint only
- current v1 retry simply re-runs local token screening

Back:
- return to previous safe public page or role selection

## Accessibility Requirements
Structure:
- one H1-equivalent title
- status card uses semantic region
- action group uses clear button or link semantics
- footer links grouped in navigation

Status:
- loading and redirect states use `role=status`
- invalid and expired states use clear headings
- API errors can use `role=alert` when blocking

Focus:
- initial focus on title or status card
- retry returns focus to status message if error remains
- route action does not cause focus jump before navigation

Touch:
- primary actions meet target-size guidance
- secondary links are not cramped

Screen reader:
- token is never announced
- role preview is announced only when backend verified
- current v1 boundary is announced as important help text

Large text:
- card expands vertically
- action buttons wrap cleanly
- footer remains after content

## Security And Privacy
Security:
- token never renders
- token never stored
- token never logged
- token never copied
- token never sent to unsupported endpoints
- token errors are generic
- role preview requires backend verification
- acceptance requires backend support
- activation still requires credential proof
- backend claims still decide access

Privacy:
- no invited email before identity verification
- no invited phone before identity verification
- no station details from unverified token
- no inviter personal data before verification
- support link does not include token
- analytics excludes token and personal data

Allowed analytics:
- `invite_acceptance_viewed`
- `invite_token_format_failed`
- `invite_verification_unavailable_viewed`
- `invite_activation_pressed`
- `invite_admin_sign_in_pressed`
- `invite_role_selection_pressed`
- `invite_support_pressed`
- `invite_future_verification_failed`
- `invite_future_verification_succeeded`

Analytics payload:
- state
- target route group
- role only if backend verified
- result status
- no token
- no account ID
- no phone
- no email

## Error Mapping
| Condition | State | User copy | Recovery |
| --- | --- | --- | --- |
| no token | `token_missing` | `Invite link missing` | choose role or support |
| unsafe token format | `token_invalid_format` | `Invite link cannot be used` | support |
| no invite endpoint | `verification_unavailable` | `Continue with account activation` | staff activation or admin sign-in |
| expired invite | `invite_expired` | `Invite expired` | support or request new invite |
| used invite | `invite_already_used` | `Invite already used` | choose role and sign in |
| unsupported target | `not_supported` | `Invite path unavailable` | support |
| future API failure | `api_error` | `Could not check invite` | retry or support |

## QA Acceptance Criteria
Functional:
- `/invite/:inviteToken` renders.
- Missing token state renders when token absent.
- Invalid token format renders generic error.
- Valid token renders current v1 verification-unavailable state.
- Staff activation action routes to `/(auth)/staff/activate`.
- Admin sign-in action routes to `/admin/sign-in`.
- Choose role action routes to `/(auth)/role-selection`.
- Support route does not include invite token.
- No admin user endpoint is called.
- No invite endpoint is called until implemented.

Security:
- token does not render in DOM text.
- token is not written to local storage.
- token is not included in analytics.
- token is not included in support URL.
- token is not decoded for role authority.
- role preview is hidden in current v1.
- no user, station, email, phone, or inviter data appears from token.

Accessibility:
- screen has one H1-equivalent title.
- status card has accessible label.
- primary actions are keyboard reachable.
- loading and redirect messages are announced.
- invalid and expired states have clear headings.
- large text keeps actions visible.
- reduced motion is respected.

Visual:
- invite state is clear in first viewport.
- current v1 limitation is explicit but not alarming.
- primary action is obvious.
- recovery links are visible.
- no private data appears.

## Test Plan
Unit tests:
- token format screening accepts URL-safe values
- token format screening rejects unsafe values
- token missing state selection
- current v1 endpoint-unavailable state
- route target mapping
- analytics sanitizer removes token

Component tests:
- renders verification unavailable state
- renders token missing state
- renders invalid token state
- routes to staff activation
- routes to admin sign-in
- routes to role selection
- renders footer links
- never renders token text

Route tests:
- `/invite/abc123SAFE` renders
- `/invite/` renders missing state if router permits
- `/invite/%20bad` renders invalid state
- browser back returns safely

Security tests:
- no token in local storage
- no token in session storage
- no token in analytics payload
- no token in support link
- no admin user calls
- no unsupported invite API calls

Accessibility tests:
- no critical accessibility violations
- keyboard reaches all actions
- status messages are announced
- target sizes pass
- reduced motion snapshot

## Data Test IDs
Screen:
- `screen-invite-acceptance`

Header:
- `invite-acceptance-header`
- `invite-acceptance-title`
- `invite-acceptance-subtitle`

Status:
- `invite-status-card`
- `invite-token-safety-notice`
- `invite-current-boundary-notice`
- `invite-role-preview`
- `invite-status-message`
- `invite-error-state`

Actions:
- `invite-action-staff-activation`
- `invite-action-admin-sign-in`
- `invite-action-role-selection`
- `invite-action-retry`
- `invite-action-support`

Footer:
- `invite-footer-privacy`
- `invite-footer-terms`

States:
- `invite-state-loading`
- `invite-state-token-missing`
- `invite-state-token-invalid`
- `invite-state-verification-unavailable`
- `invite-state-expired`
- `invite-state-already-used`
- `invite-state-not-supported`
- `invite-state-api-error`

## Implementation Notes For Claude Code
Likely targets:
- `apps/web/src/routes/invite.$inviteToken.tsx`
- mobile handoff route if the app shell supports invite links

Do:
- implement route-safe token parsing
- keep token out of UI and storage
- show current v1 boundary honestly
- route staff to activation
- route admins to web sign-in
- support missing and invalid link states
- write tests for token safety

Do not:
- create a user
- update a user
- set role
- set station scope
- call `admin_upsert_user`
- call `admin_update_user_access`
- call a non-existent invite endpoint
- decode token for authority
- store token
- display token
- include token in analytics

## Definition Of Done
This screen is complete when:
- `/invite/:inviteToken` renders a secure invite acceptance landing page.
- Current v1 behavior routes safely to staff activation or admin sign-in.
- Missing, invalid, expired, used, unsupported, and API states are specified.
- No private data is shown from the token.
- No unsupported backend endpoint is called.
- Token handling is safe in UI, storage, logging, support links, and analytics.
- Accessibility, large text, keyboard access, and reduced motion are covered.
- Tests prove the token cannot leak through common frontend paths.

## Final Build Instruction
Build `InviteAcceptance` as a guarded invite landing page.

The implementation must be honest about current backend limits:
- parse token safely
- do not verify when no endpoint exists
- do not accept access from the link alone
- route to staff activation or admin sign-in
- keep backend claims as final authority
- keep the token out of UI, storage, logs, analytics, and support links

