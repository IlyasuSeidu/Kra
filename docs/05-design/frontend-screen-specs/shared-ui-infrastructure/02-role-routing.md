# Role Routing Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Role routing |
| Component family | Shared UI infrastructure |
| Primary components | `ShellRouteGuard`, `RoleRouteBoundary`, `CapabilityRouteBoundary`, `StationScopeBoundary`, `AssignmentScopeBoundary`, `ReceiverAccessBoundary`, `SafeRedirectBoundary` |
| Supporting components | `RoleNavigationConfig`, `RouteAccessDeniedPanel`, `SessionResolvingGate`, `SafeReturnRoute`, `RoleSwitcher`, `RouteAccessTelemetry`, `RouteCapabilityExplainer` |
| Inventory behavior | Route guards based on backend roles and capabilities, never client-only authority |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, shared route utilities |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web |
| Primary users | sender, receiver, station operator, driver, final-mile courier, ops admin, finance admin, support admin, super admin |
| Backend coverage | Firebase auth verifier, `AuthPrincipal`, `Role`, `Capability`, `canPerform`, `getCapabilities`, delivery access scope, station scope, assignment scope, admin-role validation |
| Browser mutation operation | None directly; role routing can allow, block, redirect, or show safe state only |
| Data sensitivity | auth state, role claims, capability claims, station ID, assignment actor IDs, receiver verification token state, route params, safe return path |
| Offline critical | Yes for operations shell because role guard must preserve field safety and not expose wrong-role work while offline |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, typed API client, RTK Query cache, offline outbox, empty/error library, analytics tracking, test harness |
| Related state specs | not authorized, session expired, loading, stale data, offline, rate limited |
| Design tokens | `brand.blue.600`, `warning.amber.600`, `danger.red.600`, `neutral.900`, `neutral.700`, `neutral.500`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.2 AA equivalent with clear denied-route headings, predictable redirects, focus-safe navigation, and no protected-content flash |

## Purpose
Role routing defines how Kra decides which shell, route, navigation item, and recovery state a user may see before a screen renders.

It is a frontend safety layer, not the final authorization layer. The backend remains the source of truth for every protected endpoint, role, capability, station scope, assignment scope, receiver verification grant, payment action, proof action, refund action, and admin mutation.

The role routing system must answer:

- Is the route public, receiver-scoped, authenticated, operations-scoped, or admin-scoped?
- Is the session still resolving?
- Is the user authenticated?
- Which backend role does the principal have?
- Which capabilities does that role expose?
- Is station scope required?
- Is assignment scope required?
- Is receiver phone verification required?
- Which shell should host the route?
- Which navigation item should appear?
- Which safe state appears when access fails?

The most important rule is:

```text
Client routing may prevent unsafe UX, but backend authorization must still reject every unauthorized request.
```

## Product Job
Kra has many roles working against one delivery network. Role routing must keep those roles separated before a user reaches a screen.

The system must:

- route public visitors to public web pages
- route receivers through delivery-scoped public verification
- route senders to sender-only mobile surfaces
- route station operators to station-scoped work
- route drivers to assigned-run work
- route final-mile couriers to final-mile work
- route admins to authorized console sections
- hide nav items outside role and capability scope
- block direct URLs that bypass navigation
- preserve safe return routes after sign-in
- clear unsafe return routes
- show not-authorized or session-expired states without content flash
- avoid storing secrets in route params or navigation state
- preserve operations outbox access when role permits it
- support QA coverage for every role and route family

## Strategic Role
Role routing prevents cross-role confusion.

Without it:

- senders could land in staff workflows
- drivers could see station queues
- support admins could see finance controls
- finance admins could accidentally appear to control transport
- station operators could view other station work
- receivers could access delivery detail without phone verification
- stale auth could flash protected content

Correct role routing reduces backend rejections, but it must not replace backend checks. It is a user-experience boundary and a safety boundary, not a security guarantee by itself.

## Design Brief
Audience:

- All Kra users, with route behavior varying by role and route family.

Surface type:

- Invisible routing infrastructure with visible denied, loading, and recovery states.

Primary action:

- Send the user to the correct shell and route for their role.

Visual thesis:

- `Secure corridor`: users move through clear, role-specific paths with no glimpse into routes they cannot use.

Restraint rule:

- Do not show detailed restricted evidence just to explain why access is denied.

Density:

- Routing UI is minimal: loading, access denied, session expired, or safe redirect. Screens own richer content.

Platform stance:

- Expo Router for mobile route groups. React Router layout routes for web and admin. Backend roles and capabilities remain shared contracts.

## External Research Used
Only directly relevant routing, authorization, and accessibility sources were used:

- [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/): supports using route guards to prevent protected screens from rendering in Expo apps when auth state does not allow access.
- [Expo Router layout routes](https://docs.expo.dev/router/basics/layout/): supports nested layouts and role-specific route groups in the mobile app.
- [React Router routing](https://reactrouter.com/start/data/routing): supports nested routes, layout routes, dynamic segments, index routes, and shared route boundaries for web and admin apps.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): supports deny-by-default, least privilege, server-side authorization enforcement, and validating authorization on every request.
- [W3C WCAG 2.2 focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable focus behavior after route guards, redirects, and denied states.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing route access changes without unnecessary focus movement.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/navigation-map.md`
- `docs/05-design/information-architecture.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/06-not-authorized-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/07-session-expired-state.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/auth-policy.ts`
- `services/api/src/auth.ts`
- `services/api/src/routes.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/issues.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/users.ts`
- `services/api/src/admin.ts`

## Backend Authority
Frontend role routing must mirror these backend facts:

Roles:

```ts
type Role =
  | "sender"
  | "driver"
  | "station_operator"
  | "final_mile_courier"
  | "ops_admin"
  | "finance_admin"
  | "support_admin"
  | "super_admin";
```

Capabilities:

```ts
type Capability =
  | "create_delivery"
  | "edit_pre_intake_delivery"
  | "view_own_delivery"
  | "open_issue"
  | "cancel_eligible_delivery"
  | "accept_run"
  | "confirm_pickup"
  | "update_transit_status"
  | "report_delay"
  | "confirm_intake"
  | "assign_driver"
  | "confirm_dispatch"
  | "confirm_destination_receipt"
  | "assign_final_mile"
  | "accept_final_mile_assignment"
  | "mark_out_for_delivery"
  | "complete_delivery_with_proof"
  | "record_failed_attempt"
  | "reassign_delivery"
  | "override_queue_state"
  | "resolve_operational_issue"
  | "approve_refund"
  | "execute_refund"
  | "review_reconciliation"
  | "manage_pricing_rules"
  | "manage_issue_thread"
  | "escalate_case"
  | "manage_users_and_roles";
```

Principal shape:

```ts
type AuthPrincipal = {
  userId: string;
  role: Role;
  stationId?: StationId;
  capabilities: readonly Capability[];
  authMethod: "firebase_id_token";
};
```

Backend claim source:

- role claim: `kra_role`
- station scope claim: `kra_station_id`
- identity: Firebase ID token verified server-side

Frontend may cache these values for routing, but the backend must verify them again on every protected request.

## Core Principles
### Deny By Default
Unknown role, missing capability, missing station scope, missing assignment, expired session, or unsafe route param must block by default.

### Auth Is Not Authorization
Authentication proves identity. It does not prove route access.

### Capability Beats Menu Labels
Navigation labels are user-facing. Capabilities decide access.

### Direct URL Equals Full Guard
A user typing or opening a protected URL must go through the same guard as clicking a nav item.

### No Protected Content Flash
Protected content must not render while auth or role state is resolving.

### Safe Recovery Only
Denied routes must show safe recovery: sign in, switch role, go home, contact support, or request admin help. They must not leak restricted records.

## Route Families
### `public`
No auth required.

Examples:

- landing
- how it works
- pricing explainer
- public policy pages
- tracking entry
- maintenance

Guard result:

- allow.

### `receiver_public`
No persistent account required, but delivery-scoped access may require tracking link and phone verification.

Examples:

- receiver landing
- phone challenge
- OTP verification
- receiver timeline
- arrival instructions
- failed attempt info

Guard result:

- allow safe entry routes.
- require delivery-scoped verification for sensitive receiver details.
- show tracking access denied or expired when access fails.

### `sender_authenticated`
Requires authenticated sender role.

Examples:

- sender home
- create delivery
- payment
- sender delivery detail
- support
- notifications

Guard result:

- allow when role is `sender`.
- redirect unauthenticated to sender sign-in.
- show not authorized for non-sender roles.

### `ops_station`
Requires `station_operator` and station scope.

Examples:

- station overview
- intake queue
- package intake
- dispatch readiness
- destination receipt
- final-mile assignment
- station handoff log

Guard result:

- allow when role is `station_operator` and required station scope is satisfied.
- show station-scope denied when station scope is missing or mismatched.

### `ops_driver`
Requires `driver` role and assignment scope for delivery-specific screens.

Examples:

- assigned runs
- accept run
- origin pickup scan
- mark in transit
- destination handoff
- driver earnings

Guard result:

- allow driver shell.
- require assignment scope for delivery commands.

### `ops_courier`
Requires `final_mile_courier` role and assignment scope for delivery-specific screens.

Examples:

- courier assignments
- accept final-mile assignment
- out for delivery
- proof capture
- OTP completion
- failed attempt
- courier earnings

Guard result:

- allow courier shell.
- require assignment scope for final-mile delivery commands.

### `admin`
Requires admin role and route capability.

Admin roles:

- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Guard result:

- allow admin shell when role is admin and route capability matches.
- show not authorized when role or capability is missing.

### `auth`
No protected content.

Examples:

- sign-in
- invite acceptance
- recovery
- account locked
- permission denied

Guard result:

- allow unless already authenticated and route policy redirects to role home.

## Route Definition Contract
Recommended route definition:

```ts
type KraRouteFamily =
  | "public"
  | "receiver_public"
  | "sender_authenticated"
  | "ops_station"
  | "ops_driver"
  | "ops_courier"
  | "admin"
  | "auth"
  | "maintenance";

type RouteScopePolicy =
  | "none"
  | "station_origin"
  | "station_destination"
  | "station_origin_or_destination"
  | "assigned_driver"
  | "assigned_final_mile_courier"
  | "own_sender_delivery"
  | "delivery_scoped_receiver";

type KraRouteDefinition = {
  id: string;
  path: string;
  family: KraRouteFamily;
  shell:
    | "public_web"
    | "receiver_public"
    | "sender_mobile"
    | "ops_mobile"
    | "admin_web"
    | "auth"
    | "maintenance";
  allowedRoles?: Role[];
  requiredCapabilities?: Capability[];
  scopePolicy?: RouteScopePolicy;
  navItemId?: string;
  requiresAuth: boolean;
  requiresReceiverVerification?: boolean;
  hiddenInPilot?: boolean;
};
```

Rules:

- Every route definition must map to inventory.
- Every protected route must define `allowedRoles` or equivalent family policy.
- Every command route must list required capabilities.
- Every delivery-specific route must define scope policy.
- Every hidden pilot route must not render in navigation.
- Every direct route load must use the same route definition.

## Guard Evaluation Order
Use this order for protected routes:

1. Validate route definition exists.
2. Check maintenance override.
3. Check whether route is public.
4. Resolve auth state.
5. If auth missing, redirect to correct sign-in or show public denied state.
6. Validate role claim.
7. Validate route family matches role.
8. Validate required capabilities.
9. Validate station scope if required.
10. Validate assignment scope if required.
11. Validate receiver verification if required.
12. Validate route params are safe.
13. Render shell and route.

If a guard fails, do not continue to later checks that require restricted data.

## Guard States
### `auth_resolving`
Use while session, token, or role claims are loading.

UI:

- shell-safe loading state
- no protected content
- route heading may be generic

### `public_allowed`
Use for public pages and safe receiver entry routes.

UI:

- public or receiver shell

### `authenticated_allowed`
Use when role, capability, and scope pass.

UI:

- render target shell and route

### `receiver_verification_required`
Use when receiver route requires phone verification before sensitive detail.

UI:

- route to phone challenge or OTP verify
- no sensitive delivery detail

### `capability_missing`
Use when role exists but required capability is absent.

UI:

- not authorized state
- safe role label only

### `station_scope_missing`
Use when station operator lacks required station scope.

UI:

- station-scope denied copy
- route to station home or support

### `assignment_scope_missing`
Use when driver or courier is not assigned to the delivery.

UI:

- assignment denied copy
- route to assigned work list

### `session_expired`
Use when auth token expired or revoked.

UI:

- session expired state
- safe return route only

### `unsafe_return_route`
Use when return URL is external, protected beyond role, or contains sensitive params.

UI:

- route to role home instead
- no error needed unless user initiated unsafe navigation

## Navigation Visibility
Navigation is derived from route definitions and role.

Public web:

- show public nav only

Receiver public:

- show receiver-scoped help only

Sender:

- show sender launch tabs
- hide operations and admin nav

Station operator:

- show station launch tabs
- hide driver, courier, sender, and admin nav

Driver:

- show driver launch tabs
- hide station, courier, sender, and admin nav

Final-mile courier:

- show courier launch tabs
- hide station, driver, sender, and admin nav

Finance admin:

- show finance and approved admin read routes
- do not show transport override unless capability exists

Support admin:

- show issue and support routes
- do not show finance settlement or pricing controls

Ops admin:

- show operations and delivery management routes
- do not show finance settlement unless capability exists

Super admin:

- show all launch admin routes

## Capability Matrix For Routing
| Route area | Required capability |
| --- | --- |
| sender create delivery | `create_delivery` |
| sender edit pre-intake delivery | `edit_pre_intake_delivery` |
| sender delivery detail | `view_own_delivery` |
| sender issue create | `open_issue` |
| sender cancellation | `cancel_eligible_delivery` |
| driver accept run | `accept_run` |
| driver pickup | `confirm_pickup` |
| driver transit update | `update_transit_status` |
| driver delay issue | `report_delay` |
| station intake | `confirm_intake` |
| station driver assignment | `assign_driver` |
| station dispatch | `confirm_dispatch` |
| station destination receipt | `confirm_destination_receipt` |
| station final-mile assignment | `assign_final_mile` |
| courier assignment acceptance | `accept_final_mile_assignment` |
| courier out for delivery | `mark_out_for_delivery` |
| courier completion | `complete_delivery_with_proof` |
| courier failed attempt | `record_failed_attempt` |
| ops admin reassignment | `reassign_delivery` |
| ops admin queue override | `override_queue_state` |
| ops admin issue resolution | `resolve_operational_issue` |
| finance refund approval | `approve_refund` |
| finance refund execution | `execute_refund` |
| finance reconciliation | `review_reconciliation` |
| finance pricing rules | `manage_pricing_rules` |
| support issue thread | `manage_issue_thread` |
| support escalation | `escalate_case` |
| admin users and roles | `manage_users_and_roles` |

## Scope Rules
### Sender Scope
Sender can access:

- own deliveries
- own payments
- own issues
- own notifications

Sender cannot access:

- staff notes
- other sender deliveries
- staff timelines
- admin finance detail

### Station Scope
Station operator can access deliveries where:

- station equals origin station for origin work
- station equals destination station for destination work
- station equals origin or destination where screen allows both

Station operator cannot access:

- unrelated station queues
- network-wide finance
- admin override screens

### Driver Assignment Scope
Driver can access delivery work only when:

- assigned driver ID equals principal user ID

Driver cannot access:

- other driver runs
- station queues
- final-mile proof completion unless route policy allows separate role

### Final-Mile Assignment Scope
Courier can access final-mile delivery work only when:

- assigned final-mile courier ID equals principal user ID

Courier cannot access:

- other courier assignments
- driver intercity controls
- station inbound or outbound queues

### Admin Scope
Admins can access network data by capability.

Finance admin:

- payment, refund, reconciliation, pricing

Support admin:

- issue threads, case escalation, support context

Ops admin:

- operational reassignment, queue override, issue resolution

Super admin:

- all privileged launch admin routes

## Safe Redirect Rules
Allowed return routes:

- same-origin route
- route family allowed for active role
- no OTP, token, secret, or raw provider value in path or query
- not hidden in pilot
- not maintenance-only unless maintenance active

Unsafe return routes:

- external URL
- admin route for non-admin
- ops route for sender
- sender route for staff if role shell differs
- receiver route carrying verification token
- route with OTP in query
- route with raw proof token in query
- route with provider secret or reference outside admin context

Fallback route priority:

1. role home
2. shell home
3. public home
4. sign-in
5. not authorized

## Multi-Role Handling
Current backend principal shape supports one `role` at a time. If future claims support multiple roles, client routing must still choose one active role shell.

Rules:

- active role must be explicit
- active role is not inferred from last route alone
- active role switch clears role-local navigation stack
- active role switch does not delete offline outbox records
- active role switch re-runs all guards
- active role switch cannot grant capabilities not present in backend claims

In v1, do not build multi-role switching unless backend claims support it.

## Receiver Access Rules
Receivers are not full accounts in v1.

Receiver routes can be:

- link-visible but detail-limited
- phone challenge required
- OTP verification required
- verification grant active
- expired
- denied

Rules:

- receiver phone verification is delivery-scoped
- verification token must not appear in URL
- phone mismatch must not reveal sensitive detail
- tracking access denied must be privacy-safe
- expired tracking link must not reveal delivery detail
- receiver routes must not show sender account nav

## Direct URL Behavior
Direct URL to public route:

- allow.

Direct URL to protected sender route without auth:

- route to sender sign-in with safe return path.

Direct URL to ops route without auth:

- route to staff sign-in.

Direct URL to admin route without auth:

- route to admin sign-in.

Direct URL to protected route with wrong role:

- show not authorized.

Direct URL to delivery route with wrong scope:

- show not authorized or assignment/station denied based on route family.

Direct URL to receiver route requiring verification:

- route to verification step or access denied state.

## UX Copy
### Missing Session
```text
Sign in again to continue.
```

### Missing Role
```text
This account is not set up for this workspace.
```

### Wrong Role
```text
This route is not available for your role.
```

### Missing Capability
```text
You do not have permission for this action.
```

### Station Scope
```text
This delivery is outside your station scope.
```

### Assignment Scope
```text
This job is not assigned to you.
```

### Receiver Verification
```text
Verify the receiver phone to view this delivery detail.
```

### Unsafe Return Route
```text
We returned you to a safe home route.
```

Copy rules:

- do not reveal restricted record details
- do not list hidden admin capabilities to unauthorized users
- do not show internal role claim names to customers
- do not blame the user

## Accessibility
Route guard states must:

- use a clear heading
- move focus to heading after a guard-rendered page appears
- announce redirect or denied state once
- keep skip link available in web shells
- not flash protected content before focus settles
- preserve browser back behavior where safe
- use accessible link and button labels
- avoid auto-redirect loops that disorient screen-reader users

When a user is denied:

- focus starts on the denied-state heading
- primary action appears next in tab order
- secondary support action follows
- no hidden protected content remains in DOM

## Analytics
Events:

### `route_guard_evaluated`
Fire when a protected route guard resolves.

Properties:

- `route_id`
- `route_family`
- `shell`
- `result`
- `role`
- `capability_count_bucket`
- `scope_policy`
- `auth_state`

### `route_guard_blocked`
Fire when access is denied.

Properties:

- `route_id`
- `route_family`
- `shell`
- `block_reason`
- `role`
- `required_capability_category`
- `scope_policy`

### `safe_redirect_applied`
Fire when unsafe return route is replaced.

Properties:

- `source_family`
- `fallback_family`
- `reason`

Do not send:

- auth token
- OTP
- verification token
- raw phone
- full tracking code
- raw provider reference
- full delivery ID when unauthorized
- station assignment details beyond safe category

## Observability
Frontend logs may include:

- route ID
- route family
- shell
- role
- guard result
- block reason category
- request ID if available

Frontend logs must not include:

- tokens
- passwords
- OTP values
- raw phone
- restricted delivery payload
- raw provider payload
- hidden capability list for unauthorized users

Backend logs remain authoritative for endpoint rejection.

## QA Acceptance Criteria
Functional acceptance:

- Public routes render without auth.
- Receiver sensitive routes require delivery-scoped verification.
- Sender route blocks non-sender roles.
- Station routes require station operator role.
- Station delivery routes enforce station scope.
- Driver routes require driver role.
- Driver delivery routes enforce assignment scope.
- Courier routes require final-mile courier role.
- Courier delivery routes enforce assignment scope.
- Admin routes require admin role.
- Finance routes require finance capability.
- Support routes require support capability.
- Super admin can access all privileged launch admin routes.
- Hidden pilot routes do not show in navigation.
- Direct URL access runs guard.
- Session resolving never flashes protected content.
- Unsafe return route falls back safely.
- Sign-out clears protected route content.

Visual acceptance:

- Denied route uses shared not-authorized state.
- Session expiry uses shared session-expired state.
- Route resolving uses shared loading state.
- Receiver denied state is privacy-safe.
- Admin denied state names role boundary without exposing restricted data.
- Mobile denied state is touch-friendly.

Accessibility acceptance:

- Guard result has heading.
- Focus moves predictably after denied state.
- Redirect does not loop.
- Navigation labels are available to screen readers.
- Active route is announced.
- No protected content remains hidden in DOM.

Security acceptance:

- Client guard is not treated as endpoint authority.
- Backend rejects unauthorized API calls.
- Tokens do not appear in route params.
- OTP does not appear in route params.
- Verification grant does not appear in URL.
- Hidden nav item cannot be opened without guard.
- Role mismatch cannot see protected screen content.

## Test Plan
Unit tests:

- route definition coverage for every inventory route
- role-to-route allowance for sender
- role-to-route allowance for station operator
- role-to-route allowance for driver
- role-to-route allowance for final-mile courier
- role-to-route allowance for each admin role
- capability denial for missing capability
- station-scope denial
- assignment-scope denial
- receiver verification requirement
- unsafe return route rejection
- hidden pilot nav exclusion

Integration tests:

- unauthenticated sender route redirects to sender sign-in
- authenticated sender cannot open station route
- station operator cannot open another station queue
- driver cannot open another driver's assignment
- courier cannot open driver pickup route
- support admin cannot open refund settlement route
- finance admin cannot open transport override route
- super admin opens privileged admin route
- receiver route without verification goes to phone verification
- route guard blocks direct URL the same as hidden nav

Accessibility tests:

- denied state receives focus
- route announcement fires once
- no protected content is in DOM while resolving
- nav active state is exposed
- safe redirect does not create focus loop

## Implementation Notes For Claude Code
Build role routing as typed configuration plus guard utilities. Do not scatter role checks across individual screens.

Recommended files:

```text
apps/mobile/src/navigation/routeDefinitions.ts
apps/mobile/src/navigation/routeGuards.ts
apps/mobile/src/navigation/roleNavigation.ts
apps/admin/src/routes/routeDefinitions.ts
apps/admin/src/routes/routeGuards.ts
apps/web/src/routes/publicRouteDefinitions.ts
apps/web/src/routes/receiverRouteGuards.ts
packages/shared/src/frontend/route-policy.ts
```

If shared frontend package structure does not exist yet, keep per-app route definitions aligned by tests until a shared package is introduced.

Implementation sequence:

1. Define route family enum.
2. Define route definition type.
3. Encode visible inventory routes.
4. Encode role and capability matrix from shared contracts.
5. Implement safe return route validator.
6. Implement auth resolving gate.
7. Implement role route boundary.
8. Implement capability route boundary.
9. Implement station and assignment scope boundary.
10. Implement receiver access boundary.
11. Wire navigation visibility from route definitions.
12. Add tests for every role and route family.

Do not implement page UI inside routing work.

## Completion Standard
This spec is complete when Claude Code can build role routing without asking:

- which roles exist
- which capabilities exist
- which route families exist
- which shell owns each route family
- which guard order to use
- how direct URL access behaves
- how station scope is enforced
- how assignment scope is enforced
- how receiver public access is handled
- what copy to show on denied routes
- how safe return routing works
- how analytics avoids sensitive values
- how tests prove every route is guarded

The role routing system is production-ready only when navigation visibility, direct URL access, and backend endpoint authorization all agree.
