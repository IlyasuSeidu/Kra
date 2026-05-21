# Permission Denied Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PermissionDenied` |
| App | `apps/mobile`, `apps/web`, `apps/admin` |
| Route | `/permission-denied` |
| Primary test ID | `screen-permission-denied` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 shared authorization boundary for all role-gated routes |
| Backend dependency | `AuthPrincipal`, role claims, capability matrix, station scope, assignment scope, sender ownership checks, admin scope checks, API error mapping, safe return routing |
| Related routes | `/(auth)/role-selection`, `/session-expired`, `/account-locked`, `/(ops)/home`, `/(sender)/home`, `/admin`, `/support`, `/privacy`, `/terms` |
| Required states | `loading_context`, `forbidden_generic`, `forbidden_role`, `capability_denied`, `station_scope_denied`, `assignment_scope_denied`, `sender_scope_denied`, `admin_scope_denied`, `delivery_access_denied`, `receiver_access_denied`, `support_scope_denied`, `finance_scope_denied`, `unsafe_return_discarded`, `offline_uncertain`, `api_error` |

## Product Job
`PermissionDenied` is the shared safe-deny screen shown when the user is authenticated but not authorized for a route, record, or action. It must explain the boundary, route the user back to a safe place, and never imply that signing in again will fix a real role, station, assignment, or capability denial.

The screen answers:
- `Why can I not open this?`
- `Am I signed in but missing permission?`
- `Which role, station, assignment, or owner boundary stopped access?`
- `Where can I safely go now?`
- `Should I switch role, refresh work, contact support, or go back?`
- `What protected data was hidden?`
- `What should operators do if they believe the assignment is wrong?`

The user should be able to:
- Understand that access was denied because of authorization, not session expiry.
- Return to the right role home, queue, list, or support path.
- Refresh assignment or station-scoped lists when work changed.
- Switch role only through normal sign-in if they intentionally used the wrong account.
- Contact support when they believe the denial is wrong.
- Avoid seeing protected data from another sender, station, driver, courier, admin role, receiver, payment record, issue, or package.

This screen is not:
- A sign-in screen.
- A session-expired route.
- An account-locked route.
- A staff activation flow.
- A role escalation request.
- An admin user access editor.
- A support conversation.
- A data viewer for denied content.
- A bypass route.
- A client-side permission override.

## Strategic Role
Permission denial protects packages, payments, proof, receiver privacy, staff work queues, and admin controls. In Kra, a single wrong authorization decision can expose sender data, move a package under the wrong actor, leak payment data, or let an unassigned worker alter custody.

Core principle:
- Authentication proves identity.
- Authorization decides whether that identity can see or do a specific thing.
- The backend is the final authority.
- The UI must make the denial clear without leaking protected details.
- Recovery should route to safe work, not to repeated retries.

## Audience
Primary users:
- senders trying to view a delivery that is not theirs
- station operators outside the origin or destination station scope
- drivers trying to access a run assigned to another driver
- final-mile couriers trying to access another courier's job
- support admins trying to perform transport actions they cannot perform
- finance admins trying to change transport state
- ops admins trying to perform finance-only work
- admins without `manage_users_and_roles`
- staff whose assignment changed while they were offline

Secondary users:
- supervisors helping staff resolve assignment issues
- support admins resolving user confusion
- security reviewers checking object-level authorization
- QA validating denial states
- Claude Code implementing route guards and screens later

Non-users:
- anonymous public visitors
- public receivers before tracking verification
- locked users
- expired sessions
- payment providers
- webhooks
- scheduled backend jobs

## Current Backend Reality
Implemented authorization facts:
- `AuthPrincipal.role` is derived from `kra_role`.
- `AuthPrincipal.stationId` is derived from `kra_station_id` when present.
- `AuthPrincipal.capabilities` comes from the shared capability matrix.
- `assertCapabilityForPrincipal` throws `FORBIDDEN` when the role lacks the capability.
- `canAccessDelivery` allows senders to access their own deliveries.
- Admin roles can access delivery records for admin work.
- Station operators can access deliveries at their origin or destination station.
- Drivers can access deliveries assigned to their user ID.
- Final-mile couriers can access deliveries assigned to their user ID.
- `assertCanAccessDelivery` throws `FORBIDDEN` for delivery-scope failure.
- `assertAdminPrincipal` throws `FORBIDDEN` when admin scope is required.
- Missing role claim throws `FORBIDDEN`.
- Invalid role claim throws `FORBIDDEN`.
- Missing authentication also currently throws `FORBIDDEN` with a missing-principal reason.

Implemented role capability facts:
- Sender can create delivery, edit pre-intake delivery, view own delivery, open issue, and cancel eligible delivery.
- Driver can accept run, confirm pickup, update transit status, and report delay.
- Station operator can confirm intake, assign driver, confirm dispatch, confirm destination receipt, assign final mile, open issue, and cancel eligible delivery.
- Final-mile courier can accept final-mile assignment, mark out for delivery, complete delivery with proof, record failed attempt, and open issue.
- Ops admin can cancel eligible delivery, reassign delivery, override queue state, resolve operational issue, and escalate case.
- Finance admin can approve refund, execute refund, review reconciliation, and manage pricing rules.
- Support admin can manage issue thread and escalate case.
- Super admin can perform all privileged capabilities.

Current API reality:
- API error codes include `FORBIDDEN`.
- Docs define UI copy for:
  - `FORBIDDEN`
  - `FORBIDDEN_ROLE`
  - `STATION_SCOPE_VIOLATION`
  - `ASSIGNMENT_SCOPE_VIOLATION`
- The backend currently collapses many auth and authorization failures into `FORBIDDEN` with detail fields.
- Client mapping must inspect safe context and token state before choosing `SessionExpired`, `AccountLocked`, or `PermissionDenied`.

Frontend consequence:
- Do not route every `FORBIDDEN` to `PermissionDenied`.
- Missing token or invalid local session goes to `SessionExpired` or sign-in.
- Locked, inactive, or restricted account goes to `AccountLocked`.
- Valid principal with denied role, capability, station, assignment, sender ownership, admin scope, support scope, or finance scope goes to `PermissionDenied`.
- If the client cannot classify safely, use generic permission denial without protected record detail.

Future backend improvement:
- Add distinct safe error reasons:
  - `FORBIDDEN_ROLE`
  - `CAPABILITY_DENIED`
  - `STATION_SCOPE_VIOLATION`
  - `ASSIGNMENT_SCOPE_VIOLATION`
  - `SENDER_SCOPE_VIOLATION`
  - `ADMIN_SCOPE_REQUIRED`
  - `FINANCE_SCOPE_REQUIRED`
  - `SUPPORT_SCOPE_REQUIRED`
  - `DELIVERY_SCOPE_DENIED`
  - `RECEIVER_TRACKING_SCOPE_DENIED`
- Keep all detail fields safe for the current principal.

## Source References
External references used for this screen:
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): supports least privilege, deny-by-default, server-side authorization checks, validating permissions on every request, and safe failure.
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/): supports object-level authorization concerns where authenticated users can access another actor's objects if checks are weak.
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/): supports route protection and redirects from protected route groups.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear text explanations when user action cannot continue.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible authorization status and redirect messages.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for mobile denied-state recovery actions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/firebase-security-rules.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/auth.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/issues.ts`
- `services/api/src/users.ts`
- `services/api/src/app.ts`
- `services/api/src/service-errors.ts`
- `docs/05-design/frontend-screen-specs/auth-and-account/05-session-expired.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/06-account-locked.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/02-station-overview.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/03-assigned-runs.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/02-courier-home.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/01-admin-sign-in.md`

## Design Brief
Audience:
- Authenticated users blocked by a role, record, route, or action boundary.

Context of use:
- Interruptive, security-sensitive, and often operational.

Entry point:
- Protected route guard, API `FORBIDDEN`, capability denial, station scope denial, assignment scope denial, sender ownership denial, admin scope denial, or receiver access denial.

Success state:
- Protected data remains hidden, user understands the boundary, and the app routes them to safe work.

Primary action:
- Return to the correct safe home, list, queue, or support path.

Navigation model:
- Standalone denial route for cross-app use, plus inline denied panels in child screens where appropriate.

Density level:
- Sparse for standalone route; compact and operational for inline route-level denial in mobile work screens.

Visual thesis:
- A clean authorization checkpoint with one clear denial message, a safe return path, and precise operational guidance that does not expose protected detail.

Restraint rule:
- Do not show the denied object, object title, receiver information, payment values, proof data, issue notes, station workload, admin evidence, or actor identifiers unless already authorized for that data.

## UX Principles
The screen should feel:
- clear
- firm
- non-punitive
- safe
- practical
- role-aware
- privacy-protective

The screen must not feel:
- like a system crash
- like session expiry
- like account lockout
- like a dead end
- like a scolding message
- like support must fix every denial
- like the user can retry until access appears

Primary promise:
- `You are signed in, but this route is outside your allowed access.`

Security promise:
- `Kra hides records and actions outside your role, station, assignment, or account scope.`

Operational promise:
- `Go back to assigned work or ask support if you believe this access changed incorrectly.`

## Authorization Boundaries
Role boundary:
- User role cannot enter route or action.
- Example: finance admin opens station override.
- Copy: `Your role cannot access this action.`

Capability boundary:
- Role exists but lacks a specific capability.
- Example: support admin attempts refund execution.
- Copy: `Your account is not allowed to perform this action.`

Station boundary:
- Station operator is outside origin or destination station.
- Copy: `This delivery is outside your station scope.`

Assignment boundary:
- Driver or courier is not assigned to the job.
- Copy: `This job is not assigned to you.`

Sender ownership boundary:
- Sender attempts delivery that belongs to another sender.
- Copy: `This delivery is not available to this account.`

Admin scope boundary:
- Non-admin opens admin console.
- Copy: `Admin access is required.`

Finance boundary:
- Non-finance actor opens finance detail or refund execution.
- Copy: `Finance access is required for this page.`

Support boundary:
- Actor without issue-management permission tries to manage support thread.
- Copy: `Support access is required for this action.`

Receiver tracking boundary:
- Receiver tracking link or phone verification does not match delivery scope.
- Copy: `This tracking link cannot show this delivery.`

Unknown boundary:
- Safe classification is not available.
- Copy: `You do not have permission for this action.`

## Permission State Matrix
| Source condition | Authentication valid? | Screen state | User-facing posture | Primary CTA |
| --- | --- | --- | --- | --- |
| Missing token | No | not this screen | `SessionExpired` or sign-in | Sign in |
| Revoked or expired token | No | not this screen | `SessionExpired` | Sign in again |
| Inactive or restricted account | Maybe | not this screen | `AccountLocked` | Recovery |
| Valid role lacks route access | Yes | `forbidden_role` | Role boundary | Role home |
| Valid role lacks capability | Yes | `capability_denied` | Capability boundary | Go back |
| Station operator outside station | Yes | `station_scope_denied` | Station boundary | Return to station queue |
| Driver/courier not assigned | Yes | `assignment_scope_denied` | Assignment boundary | Refresh assignments |
| Sender does not own record | Yes | `sender_scope_denied` | Account ownership boundary | Sender home |
| Non-admin opens admin route | Yes | `admin_scope_denied` | Admin boundary | Role home |
| User opens inaccessible delivery | Yes | `delivery_access_denied` | Record boundary | Go back |
| Receiver tracking access mismatch | Public verified context | `receiver_access_denied` | Tracking boundary | Tracking entry or support |
| Offline and cannot verify current scope | Unknown | `offline_uncertain` | Cannot confirm access | Retry connection |

## Route Context Contract
The route may receive only safe context:
- `source`
- `denialReason`
- `role`
- `attemptedSurface`
- `safeReturnTo`
- `safePrimaryCta`
- `correlationId`
- `requestId`
- `occurredAt`

Suggested route type:
```ts
export type PermissionDeniedSource =
  | "protected_route"
  | "api_forbidden"
  | "route_guard"
  | "station_scope"
  | "assignment_scope"
  | "sender_scope"
  | "admin_scope"
  | "finance_scope"
  | "support_scope"
  | "receiver_scope"
  | "unknown";

export type PermissionDeniedReason =
  | "forbidden_generic"
  | "forbidden_role"
  | "capability_denied"
  | "station_scope_denied"
  | "assignment_scope_denied"
  | "sender_scope_denied"
  | "admin_scope_denied"
  | "delivery_access_denied"
  | "receiver_access_denied"
  | "support_scope_denied"
  | "finance_scope_denied"
  | "offline_uncertain"
  | "unknown";

export interface PermissionDeniedRouteContext {
  source: PermissionDeniedSource;
  denialReason: PermissionDeniedReason;
  role?:
    | "sender"
    | "driver"
    | "station_operator"
    | "final_mile_courier"
    | "ops_admin"
    | "finance_admin"
    | "support_admin"
    | "super_admin";
  attemptedSurface?: "sender" | "receiver" | "station" | "driver" | "courier" | "admin" | "support" | "finance";
  safeReturnTo?: string;
  safePrimaryCta?: string;
  correlationId?: string;
  requestId?: string;
  occurredAt?: string;
}
```

Route validation:
- If `safeReturnTo` is not allowlisted, discard it.
- If `role` is missing, use generic copy.
- If `denialReason` is unknown, use `forbidden_generic`.
- If route context includes denied object title or ID, ignore it.
- If context says missing authentication, route to `SessionExpired`, not this page.
- If context says account inactive or locked, route to `AccountLocked`, not this page.

## Safe Return Allowlist
Common safe routes:
- `/(auth)/role-selection`
- `/(sender)/home`
- `/(ops)/home`
- `/(ops)/station`
- `/(ops)/driver`
- `/(ops)/courier`
- `/admin`
- `/support`
- `/tracking`

Sender safe routes:
- `/(sender)/home`
- `/(sender)/deliveries`
- `/(sender)/support`

Station safe routes:
- `/(ops)/station`
- `/(ops)/station/intake`
- `/(ops)/station/outbound`
- `/(ops)/station/inbound`
- `/(ops)/station/blocked`
- `/(ops)/station/support`

Driver safe routes:
- `/(ops)/driver`
- `/(ops)/driver/runs`
- `/(ops)/driver/support`

Courier safe routes:
- `/(ops)/courier`
- `/(ops)/courier/assignments`
- `/(ops)/courier/support`

Admin safe routes:
- `/admin`
- `/admin/deliveries`
- `/admin/issues`
- `/admin/settings`

Disallowed return routes:
- any mutation confirmation route
- any route with denied record ID
- payment execution
- refund approval
- custody handoff
- proof upload
- admin user mutation
- station status override
- package scan
- any route carrying unsafe query detail

Rule:
- Permission denial may return to a list or home surface, never directly into the denied protected record or mutation.

## Information Architecture
Standalone route regions:
- app-safe shell
- denial hero
- reason summary
- safe return action
- what to do next
- support/legal footer

Inline route-level panel regions:
- compact status banner
- short denial reason
- safe action row
- optional support link

Mobile layout:
- top lock/hand icon with label
- one title
- one body paragraph
- one primary CTA
- secondary support/role switch links
- no protected object preview
- no bottom tab bar if route denial is global

Admin web layout:
- centered panel inside or outside admin shell depending on auth state.
- If admin shell remains visible, the denied content area must be blanked.
- No denied data in breadcrumbs.
- No object title in browser title.

Public receiver layout:
- use receiver-safe wording.
- never expose sender or delivery data.
- route to tracking entry or support.

## Visual System
Color intent:
- Use neutral high-contrast surface.
- Use amber for access boundary.
- Use red only for destructive denied action or safety-critical boundary.
- Use blue for safe navigation.
- Avoid danger-heavy visual language unless package custody or finance risk is involved.

Suggested token mapping:
- `surface.auth.background`: neutral page background.
- `surface.denied.card`: elevated card or quiet panel.
- `text.primary`: strong neutral.
- `text.secondary`: readable muted neutral.
- `state.denied`: amber or red depending on severity.
- `state.info`: blue or teal.
- `focus.ring`: high-contrast outline.

Typography:
- Heading should be direct and short.
- Body text should fit within three short lines on mobile.
- Operational guidance should use short bullets only when there are multiple actions.

Material:
- One main denial panel.
- Optional small safe-route card.
- No decorative alert stack.
- No badge clutter.

Iconography:
- Use shield, key, door, or hand-stop icon.
- Icon must have label.
- Do not rely on icon color alone.

Motion:
- Short fade on entry.
- No shaking or alarm effect.
- No loop animation.
- Reduced-motion users get no transition.

## Copy System
Global default title:
- `Permission denied`

Global default body:
- `You are signed in, but this route is outside your allowed access.`

Generic action copy:
- Primary CTA: `Go back`
- Secondary: `Contact support`

Role denial:
- Title: `Role access required`
- Body: `Your current role cannot access this page or action.`
- CTA: `Back to home`

Capability denial:
- Title: `Action not allowed`
- Body: `Your account is not allowed to perform this action.`
- CTA: `Go back`

Station denial:
- Title: `Outside your station scope`
- Body: `This delivery is not assigned to your station.`
- CTA: `Return to station queue`

Assignment denial:
- Title: `Job not assigned to you`
- Body: `This job is assigned to another worker or has changed since your last refresh.`
- CTA: `Refresh assignments`

Sender denial:
- Title: `Delivery not available`
- Body: `This delivery is not available to this sender account.`
- CTA: `Back to deliveries`

Admin denial:
- Title: `Admin access required`
- Body: `This page is only available to authorized admin roles.`
- CTA: `Back to home`

Finance denial:
- Title: `Finance access required`
- Body: `Payment and refund controls are limited to authorized finance roles.`
- CTA: `Back to admin`

Support denial:
- Title: `Support access required`
- Body: `This issue action is limited to authorized support or admin roles.`
- CTA: `Back to issues`

Receiver denial:
- Title: `Tracking access denied`
- Body: `This tracking link cannot show this delivery.`
- CTA: `Start tracking again`

Offline uncertain:
- Title: `Cannot confirm access`
- Body: `Connect to the internet before opening this route.`
- CTA: `Retry connection`

Do not use:
- `You are not allowed because your role is wrong.`
- `This belongs to another user named ...`
- `Delivery DEL-... is not yours.`
- `This station is KUMASI-01 but you are ACCRA-01.`
- `Ask engineering to add permission.`
- `Retry until it works.`
- `Sign in again to fix this.`

## Primary Actions
Default:
- Label: `Go back`
- Destination: previous safe route or role home.

Sender:
- Label: `Back to deliveries`
- Destination: sender delivery list or sender home.

Station:
- Label: `Return to station queue`
- Destination: station overview or relevant station list.

Driver:
- Label: `Refresh assignments`
- Destination: assigned runs list with refresh.

Courier:
- Label: `Refresh assignments`
- Destination: courier assignments list with refresh.

Admin:
- Label: `Back to admin home`
- Destination: admin overview or allowed admin area.

Finance:
- Label: `Back to admin`
- Destination: admin overview or finance-safe area only if allowed.

Support:
- Label: `Back to issues`
- Destination: issue queue or admin home.

Receiver:
- Label: `Start tracking again`
- Destination: public tracking entry.

Offline:
- Label: `Retry connection`
- Behavior: retry authorization check.

## Secondary Actions
Allowed:
- `Contact support`
- `Use another role`
- `Sign out`
- `Read privacy policy`
- `Read terms`
- `Copy request ID`

Conditionally allowed:
- `Open role selection` when role mismatch is plausible.
- `Refresh assignments` when assignment may have changed.
- `Return to queue` when station scope is known.

Disallowed:
- `Request permission here`
- `Override`
- `Continue anyway`
- `View details`
- `Open denied record`
- `Approve access`
- `Change role`
- `Change station`
- `Retry action` after confirmed scope denial

## Role-Specific Guidance
Sender:
- Show sender home or delivery list recovery.
- Do not show owner of denied delivery.
- Support can help if sender believes tracking or account link is wrong.

Station operator:
- Show station queue recovery.
- If station scope is missing, route to support or supervisor.
- Do not show other station name unless already authorized by backend context.
- Do not allow package movement from denied route.

Driver:
- Show assigned runs refresh.
- If job changed, remove it from local visible list after refresh.
- Do not show new assigned driver.
- Do not let driver accept, scan, or move custody from denied route.

Final-mile courier:
- Show courier assignments refresh.
- Do not expose receiver address, phone, or proof status.
- Do not allow delivery completion from denied route.

Ops admin:
- If denied finance action, explain finance access required.
- If denied user management, explain super-admin access required.
- Return to admin home or allowed ops page.

Finance admin:
- If denied transport action, explain transport action is limited to ops or super admin.
- Return to finance-safe page.

Support admin:
- If denied transport or finance action, explain action boundary.
- Return to issues or support queue.

Super admin:
- Should rarely see denial.
- If seen, use generic copy and request ID.
- Do not expose failed internal policy detail.

Receiver:
- Use public tracking denied copy.
- Do not show sender name, receiver name, phone, station, package, or issue.

## Security Rules
Deny-by-default:
- Unknown route context maps to generic denial.
- Unknown permission reason maps to generic denial.
- Client-side role hints never grant access.
- A visible button never means permission exists; backend must still check.

Data minimization:
- Hide denied record title.
- Hide denied record ID by default.
- Hide receiver address and phone.
- Hide payment amount and provider detail.
- Hide proof asset references.
- Hide audit notes.
- Hide admin evidence.

Safe classification:
- `FORBIDDEN` with valid token and clear capability/scope context maps here.
- `FORBIDDEN` with missing principal maps to sign-in or `SessionExpired`.
- `FORBIDDEN` with missing role claim maps to auth recovery, not route authorization.
- `FORBIDDEN` due inactive account maps to `AccountLocked`.
- `NOT_FOUND` may intentionally hide existence; do not rewrite all `NOT_FOUND` to denial.

Back behavior:
- Back cannot reveal protected content.
- Browser back after denied admin detail must land on admin list or home.
- Mobile back after denied work detail must land on allowed list or home.

Support safety:
- Support action may include request ID.
- Support action must not include denied object details unless backend returned a safe support token.

## Data Requirements
Minimum local input:
```ts
interface PermissionDeniedViewModel {
  state: PermissionDeniedReason;
  title: string;
  body: string;
  primaryAction: PermissionDeniedAction;
  secondaryActions: PermissionDeniedAction[];
  safeReturnTo: string;
  requestId?: string;
  correlationId?: string;
  supportAllowed: boolean;
  unsafeReturnDiscarded: boolean;
}

interface PermissionDeniedAction {
  label: string;
  kind:
    | "go_back"
    | "role_home"
    | "sender_home"
    | "station_queue"
    | "driver_assignments"
    | "courier_assignments"
    | "admin_home"
    | "support"
    | "role_selection"
    | "sign_out"
    | "retry_connection"
    | "copy_request_id"
    | "legal_link";
  href?: string;
  disabled?: boolean;
}
```

Never store in denied route state:
- denied delivery ID
- receiver phone
- receiver address
- payment amount
- proof asset reference
- issue internal note
- audit evidence
- full station assignment mismatch
- current custodian ID
- other actor ID

May store:
- safe denial reason
- safe role hint
- request ID
- correlation ID
- timestamp
- safe return route
- whether support is allowed

## Layout Detail
### Region 1: Safe Shell
Purpose:
- Keep the user out of protected content while preserving app orientation.

Required elements:
- Kra mark or app header.
- No denied object breadcrumb.
- No protected shell when route-level denial follows missing auth context.

Test IDs:
- `permission-denied-shell`
- `permission-denied-app-mark`

### Region 2: Denial Hero
Purpose:
- State the boundary clearly.

Required elements:
- Icon.
- Title.
- Body.
- Optional request ID.

Test IDs:
- `permission-denied-hero`
- `permission-denied-title`
- `permission-denied-body`
- `permission-denied-request-id`

### Region 3: Safe Action Panel
Purpose:
- Give the next safe route.

Required elements:
- Primary CTA.
- Short note explaining that protected data remains hidden.

Test IDs:
- `permission-denied-action-panel`
- `permission-denied-primary-action`
- `permission-denied-safe-note`

### Region 4: Boundary Explanation
Purpose:
- Give role-specific explanation without leaking protected detail.

Required elements:
- One short section.
- Optional route-specific reason.
- No denied object data.

Test IDs:
- `permission-denied-boundary-explanation`

### Region 5: Secondary Actions
Purpose:
- Support and safe exit.

Required elements:
- Support action where allowed.
- Role selection where useful.
- Sign out.
- Legal links.

Test IDs:
- `permission-denied-secondary-actions`
- `permission-denied-support-action`
- `permission-denied-role-selection-action`
- `permission-denied-sign-out-action`
- `permission-denied-privacy-link`
- `permission-denied-terms-link`

## State Rendering
### Loading Context
Trigger:
- Route opens while token state, route source, or safe context is being resolved.

UI:
- Neutral loading panel.
- No denied reason yet.
- Announce `Checking access.`

Primary action:
- Disabled.

Test IDs:
- `permission-denied-loading-state`

### Forbidden Generic
Trigger:
- Authorization denied but exact safe reason is unavailable.

UI:
- Title: `Permission denied`
- Body: `You are signed in, but this route is outside your allowed access.`

Primary action:
- `Go back`

Test IDs:
- `permission-denied-generic-state`

### Forbidden Role
Trigger:
- Role cannot access route or app surface.

UI:
- Title: `Role access required`
- Body: `Your current role cannot access this page or action.`

Primary action:
- `Back to home`

Test IDs:
- `permission-denied-role-state`

### Capability Denied
Trigger:
- Role lacks required capability.

UI:
- Title: `Action not allowed`
- Body: `Your account is not allowed to perform this action.`

Primary action:
- `Go back`

Test IDs:
- `permission-denied-capability-state`

### Station Scope Denied
Trigger:
- Station operator is outside allowed station scope.

UI:
- Title: `Outside your station scope`
- Body: `This delivery is not assigned to your station.`

Primary action:
- `Return to station queue`

Test IDs:
- `permission-denied-station-state`

### Assignment Scope Denied
Trigger:
- Driver or courier is not assigned.

UI:
- Title: `Job not assigned to you`
- Body: `This job is assigned to another worker or has changed since your last refresh.`

Primary action:
- `Refresh assignments`

Test IDs:
- `permission-denied-assignment-state`

### Sender Scope Denied
Trigger:
- Sender attempts record outside ownership.

UI:
- Title: `Delivery not available`
- Body: `This delivery is not available to this sender account.`

Primary action:
- `Back to deliveries`

Test IDs:
- `permission-denied-sender-state`

### Admin Scope Denied
Trigger:
- Non-admin opens admin route or admin lacks role for route.

UI:
- Title: `Admin access required`
- Body: `This page is only available to authorized admin roles.`

Primary action:
- `Back to home`

Test IDs:
- `permission-denied-admin-state`

### Delivery Access Denied
Trigger:
- A delivery detail or action is outside allowed access.

UI:
- Title: `Delivery not available`
- Body: `This delivery is outside your allowed access.`

Primary action:
- Role-specific list or home.

Test IDs:
- `permission-denied-delivery-state`

### Receiver Access Denied
Trigger:
- Public tracking grant is wrong, expired, or mismatched.

UI:
- Title: `Tracking access denied`
- Body: `This tracking link cannot show this delivery.`

Primary action:
- `Start tracking again`

Test IDs:
- `permission-denied-receiver-state`

### Support Scope Denied
Trigger:
- User lacks support or issue-management scope.

UI:
- Title: `Support access required`
- Body: `This issue action is limited to authorized support or admin roles.`

Primary action:
- `Back to issues`

Test IDs:
- `permission-denied-support-state`

### Finance Scope Denied
Trigger:
- User lacks finance scope for payments, refunds, reconciliation, or pricing.

UI:
- Title: `Finance access required`
- Body: `Payment and refund controls are limited to authorized finance roles.`

Primary action:
- `Back to admin`

Test IDs:
- `permission-denied-finance-state`

### Offline Uncertain
Trigger:
- App cannot confirm current authorization because it is offline.

UI:
- Title: `Cannot confirm access`
- Body: `Connect to the internet before opening this route.`

Primary action:
- `Retry connection`

Test IDs:
- `permission-denied-offline-state`

### Unsafe Return Discarded
Trigger:
- Denied route attempted to preserve unsafe return destination.

UI:
- Render current state plus note.
- Note: `For safety, we will not return to the denied page.`

Test IDs:
- `permission-denied-unsafe-return-note`

## Interaction Rules
On mount:
- Validate route context.
- Classify denial only if auth token is valid and account is not locked.
- Discard denied object detail.
- Pick safe return action.
- Track redacted view event.

On API `FORBIDDEN`:
- Inspect current token state.
- If no token, route to sign-in or `SessionExpired`.
- If account inactive or locked, route to `AccountLocked`.
- If token and account are valid, map to this screen.

On primary action:
- Navigate to safe return route.
- Refresh safe list when action kind is assignment or station queue refresh.
- Do not retry denied mutation.
- Do not refetch denied object unless user has changed identity through normal sign-in.

On support action:
- Open support with request ID and denial category only.
- Do not attach protected record data.

On role selection:
- Clear current protected route intent.
- Route to auth role selection.

On sign out:
- Clear local session.
- Route to role selection.

On browser/mobile back:
- Replace denied route with safe return route.
- Do not reveal the previous protected content.

## Navigation Rules
Sender:
- `sender_scope_denied` routes to sender deliveries.
- `forbidden_role` routes to role selection or sender home based on source.
- `delivery_access_denied` routes to sender home.

Station operator:
- `station_scope_denied` routes to station overview or station queue.
- `capability_denied` routes to station overview.
- `delivery_access_denied` routes to station overview.

Driver:
- `assignment_scope_denied` routes to assigned runs.
- `capability_denied` routes to driver home.
- `delivery_access_denied` routes to assigned runs.

Final-mile courier:
- `assignment_scope_denied` routes to courier assignments.
- `capability_denied` routes to courier home.
- `delivery_access_denied` routes to courier assignments.

Ops admin:
- `finance_scope_denied` routes to admin overview.
- `support_scope_denied` routes to admin overview.
- `capability_denied` routes to admin overview.

Finance admin:
- `capability_denied` for transport action routes to finance dashboard or admin overview.
- `admin_scope_denied` routes to admin overview if admin shell is allowed.

Support admin:
- `finance_scope_denied` routes to issue queue or admin overview.
- `capability_denied` routes to issue queue.

Receiver:
- `receiver_access_denied` routes to tracking entry or support.

Unknown:
- route to role selection or app home.

## Component Structure
Suggested component tree:
```tsx
<PermissionDeniedScreen testID="screen-permission-denied">
  <AuthSafeShell>
    <PermissionDeniedHero />
    <PermissionDeniedActionPanel />
    <PermissionDeniedBoundaryExplanation />
    <PermissionDeniedSecondaryActions />
    <AuthLegalFooter />
  </AuthSafeShell>
</PermissionDeniedScreen>
```

Inline state tree:
```tsx
<PermissionDeniedPanel testID="permission-denied-inline-panel">
  <PermissionDeniedInlineTitle />
  <PermissionDeniedInlineBody />
  <PermissionDeniedInlineActions />
</PermissionDeniedPanel>
```

Suggested modules:
- `parsePermissionDeniedContext`
- `mapPermissionDeniedReason`
- `resolveSafeDeniedReturn`
- `buildPermissionDeniedViewModel`
- `redactDeniedTelemetry`
- `clearDeniedRouteState`

## State Mapper
Suggested mapper behavior:
```ts
export function mapPermissionDeniedState(
  context: PermissionDeniedRouteContext,
  authState: "valid" | "missing" | "expired" | "locked"
): PermissionDeniedViewModel | "session_expired" | "account_locked" {
  if (authState === "missing" || authState === "expired") {
    return "session_expired";
  }

  if (authState === "locked") {
    return "account_locked";
  }

  switch (context.denialReason) {
    case "forbidden_role":
      return buildForbiddenRole(context);
    case "capability_denied":
      return buildCapabilityDenied(context);
    case "station_scope_denied":
      return buildStationScopeDenied(context);
    case "assignment_scope_denied":
      return buildAssignmentScopeDenied(context);
    case "sender_scope_denied":
      return buildSenderScopeDenied(context);
    case "admin_scope_denied":
      return buildAdminScopeDenied(context);
    case "delivery_access_denied":
      return buildDeliveryAccessDenied(context);
    case "receiver_access_denied":
      return buildReceiverAccessDenied(context);
    case "support_scope_denied":
      return buildSupportScopeDenied(context);
    case "finance_scope_denied":
      return buildFinanceScopeDenied(context);
    case "offline_uncertain":
      return buildOfflineUncertain(context);
    default:
      return buildForbiddenGeneric(context);
  }
}
```

Mapper requirements:
- Every builder returns redacted copy.
- Every builder returns a safe destination.
- Unknown role never gets role-specific detail.
- Unknown route never returns to denied route.
- The mapper does not decide backend permission.

## Error Handling
`FORBIDDEN`:
- Valid principal plus capability/scope reason maps to `PermissionDenied`.
- Missing principal maps to `SessionExpired` or sign-in.
- Missing or invalid role claim maps to auth recovery.
- Inactive or restricted account maps to `AccountLocked`.

`NOT_FOUND`:
- Do not expose whether the record exists.
- Show not-found state in child screen or safe delivery-unavailable copy.
- Use `PermissionDenied` only when backend says authorization failed.

`RATE_LIMITED`:
- Usually remains on source screen or `AccountLocked` if auth lockout.
- Do not map general rate limiting to permission denial.

`VALIDATION_ERROR`:
- Stay on form and show field errors.
- Do not route here unless validation includes explicit permission boundary.

`ROUTE_NOT_ENABLED`:
- Use route disabled or maintenance state, not permission denial.

`INTERNAL_ERROR`:
- Show generic error with request ID.
- Do not claim permission denial.

Network error:
- Use `offline_uncertain` only when checking permission or route guard.

## Accessibility Requirements
Structure:
- One `h1` on standalone route.
- Inline panel uses heading level appropriate to parent screen.
- Denial reason is text, not only icon.
- Primary action is first reachable action after body.

Focus:
- Standalone route focuses title on load.
- Inline panel moves focus only if content being denied was previously focused.
- Unsafe-return note is announced when present.

Touch:
- Primary action target at least 44 dp on mobile.
- Secondary actions separated enough for field use.
- No tiny inline text links for urgent recovery.

Screen reader:
- Announce `Permission denied`.
- Include safe action label.
- Request ID copy action announces success.

Color:
- Color cannot be the only indicator of denial reason.
- Contrast passes WCAG AA.

Motion:
- Reduced-motion preference is honored.
- No flashing or alarm.

## Responsive Behavior
Small mobile:
- Single panel.
- Short body.
- Sticky primary CTA if content scrolls.
- Support and sign-out links below CTA.

Large mobile:
- Add boundary explanation under action panel.
- Keep CTA thumb-reachable.

Tablet:
- Center panel with max width.
- Optional side panel for "What you can do".

Admin desktop:
- Keep admin chrome only if user is authorized for admin shell.
- Denied content area must be blanked.
- Breadcrumb must not include protected record title.

Public web:
- Use public tracking language.
- No app shell if receiver is not full account user.

## Offline And Cache Behavior
Offline with no prior authorization:
- Show `offline_uncertain`.
- Do not reveal protected content.
- Allow retry connection.

Offline after known scope-safe list:
- Child screens may show cached list if their spec allows it.
- This route must not show denied object.
- If user taps a cached row and authorization cannot be confirmed, show inline `offline_uncertain`.

Offline queued work:
- Do not queue denied actions.
- If an already queued action later fails with `FORBIDDEN`, route to action recovery or denial summary.
- Do not silently discard failed custody or proof action.

Cache clearing:
- Clear denied object detail from memory.
- Keep safe list cache if it is scoped to current user and route spec allows it.
- Clear unsafe return destination.

## Analytics
Events:
- `permission_denied_viewed`
- `permission_denied_primary_action_clicked`
- `permission_denied_secondary_action_clicked`
- `permission_denied_support_opened`
- `permission_denied_unsafe_return_discarded`
- `permission_denied_request_id_copied`
- `permission_denied_offline_retry_clicked`

Allowed properties:
- `reasonClass`
- `source`
- `role`
- `attemptedSurface`
- `safeReturnKind`
- `hasRequestId`
- `unsafeReturnDiscarded`
- `platform`
- `online`

Forbidden properties:
- delivery ID
- tracking code
- package label
- receiver phone
- receiver address
- sender phone
- payment provider reference
- payment amount
- proof reference
- issue internal note
- audit event ID
- other actor user ID
- exact station mismatch

## Test IDs
Screen:
- `screen-permission-denied`

Layout:
- `permission-denied-shell`
- `permission-denied-app-mark`
- `permission-denied-hero`
- `permission-denied-action-panel`
- `permission-denied-boundary-explanation`
- `permission-denied-secondary-actions`

Text:
- `permission-denied-title`
- `permission-denied-body`
- `permission-denied-request-id`
- `permission-denied-safe-note`
- `permission-denied-unsafe-return-note`

Actions:
- `permission-denied-primary-action`
- `permission-denied-support-action`
- `permission-denied-role-selection-action`
- `permission-denied-sign-out-action`
- `permission-denied-copy-request-id-action`
- `permission-denied-privacy-link`
- `permission-denied-terms-link`

States:
- `permission-denied-loading-state`
- `permission-denied-generic-state`
- `permission-denied-role-state`
- `permission-denied-capability-state`
- `permission-denied-station-state`
- `permission-denied-assignment-state`
- `permission-denied-sender-state`
- `permission-denied-admin-state`
- `permission-denied-delivery-state`
- `permission-denied-receiver-state`
- `permission-denied-support-state`
- `permission-denied-finance-state`
- `permission-denied-offline-state`
- `permission-denied-inline-panel`

## QA Matrix
Generic denial:
- Renders default title and body.
- Does not expose denied object.
- Primary action goes to safe route.

Role denial:
- Valid user with wrong role sees role access copy.
- Sign-in is not presented as the main fix.
- Role selection clears protected route intent.

Capability denial:
- Valid role without action capability sees action not allowed.
- Denied mutation is not retried automatically.
- Support action includes only safe request ID.

Station scope:
- Station operator outside station sees station scope copy.
- Other station name is not shown unless safe context allows it.
- Return action opens station queue or overview.

Assignment scope:
- Driver or courier not assigned sees assignment copy.
- New assignee is not shown.
- Refresh assignments action opens allowed list.

Sender scope:
- Sender cannot see another sender's delivery data.
- Copy does not reveal owner.
- Return action opens sender deliveries.

Admin scope:
- Non-admin cannot see admin shell data.
- Admin breadcrumbs hide protected record title.
- Return action opens role home.

Finance scope:
- Non-finance admin cannot access refund execution.
- Payment data is hidden.
- Return action opens safe admin route.

Support scope:
- Non-support actor cannot manage issue thread.
- Issue internal notes are hidden.
- Return action opens safe issue or home route.

Receiver scope:
- Mismatched tracking link shows public safe copy.
- No delivery or receiver data appears.
- CTA returns to tracking entry.

Offline:
- No protected content appears when permission cannot be checked.
- Retry connection re-runs guard.

Routing:
- Unsafe return routes are discarded.
- Browser back does not reveal protected data.
- Mobile hardware back lands on safe home or list.

Accessibility:
- One heading.
- Focus lands on title.
- Primary action is reachable.
- Status text is announced.
- Touch targets meet minimum size.

Telemetry:
- No forbidden sensitive fields.
- Reason class is redacted.
- Request ID is tracked only as presence, not full value unless policy allows.

## Implementation Checklist
1. Create `/permission-denied` route outside sensitive protected detail pages.
2. Add route context parser.
3. Add safe return allowlist.
4. Add denial reason mapper.
5. Add auth-state classifier to route missing/expired tokens away from this screen.
6. Add account-state classifier to route locked/inactive users away from this screen.
7. Add standalone denied shell.
8. Add inline denied panel for child screens.
9. Add safe action panel.
10. Add support action with redacted context.
11. Add unsafe return discard logic.
12. Add protected data clearing on route entry.
13. Add copy variants for all states.
14. Add accessibility labels and focus behavior.
15. Add telemetry redaction.
16. Add mapper unit tests.
17. Add route tests for unsafe return.
18. Add component tests for every state.
19. Add E2E coverage for sender, station, driver, courier, admin, finance, support, and receiver denial flows.
20. Add visual regression coverage for mobile, tablet, admin desktop, and public web.

## Acceptance Criteria
The screen is complete when:
- `/permission-denied` renders without protected denied content.
- Missing or expired auth does not render this screen.
- Locked or inactive account does not render this screen.
- Valid role denial renders role copy.
- Capability denial renders action-not-allowed copy.
- Station scope denial routes back to station work.
- Assignment scope denial routes back to assignments.
- Sender ownership denial hides other sender data.
- Admin scope denial hides admin content.
- Finance scope denial hides payment and refund data.
- Support scope denial hides issue internals.
- Receiver scope denial uses public-safe copy.
- Unsafe return routes are discarded.
- Support action sends only redacted context.
- Offline uncertain state blocks protected data.
- Accessibility requirements pass.
- All listed test IDs exist.
- Unit, integration, accessibility, and E2E tests cover the matrix.

## Open Product Decisions
No product decision blocks v1 implementation.

Non-blocking backend improvements:
- Add distinct authorization error reasons.
- Add safe support tokens for denied support reports.
- Add route-level authorization metadata for frontend mapping.
- Add centralized authorization telemetry taxonomy.
- Add admin-visible audit event for denied privileged actions.

## Final Implementation Guidance
Claude Code should build this as a hard authorization boundary, not as a friendly retry page. The route must help the user recover to safe work while assuming the denied record or action is still protected. If the app cannot prove the user is authenticated, route away to session recovery. If the account is locked or inactive, route away to account recovery. Only valid authenticated users with an authorization boundary should land here.
