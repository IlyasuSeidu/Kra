# Not Authorized State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `not_authorized` |
| Component family | Shared screen state |
| Primary component | `SharedNotAuthorizedState` |
| Supporting components | `AuthorizationBoundaryCard`, `ScopeReasonStrip`, `SafeReturnActions`, `ProtectedDataShield`, `AuthorizationSupportLink`, `AccessAuditHint`, `RoleMismatchNotice` |
| Primary surfaces | sender mobile app, operations mobile app, receiver public flow, public web, admin web console |
| Required recovery | safe return, refresh scope, switch account when applicable, contact support when access appears wrong |
| Test id root | `state-not-authorized` |
| Backend coverage | `FORBIDDEN`, `FORBIDDEN_ROLE`, `STATION_SCOPE_VIOLATION`, `ASSIGNMENT_SCOPE_VIOLATION`, sender ownership failure, admin scope failure, public tracking access denial |
| Browser mutation operation | None |
| Data sensitivity | route label, safe role label, safe boundary type, safe request id, safe support reference |
| Offline critical | Yes when cached work lists may contain items that are no longer assigned or in scope |
| Related inventory state | `not_authorized` |
| Related state specs | session expired, loading, error, offline, stale data, blocked by issue, custody not confirmed, scan mismatch |
| Design tokens | `danger.red.600`, `warning.amber.600`, `brand.blue.600`, `neutral.950`, `neutral.750`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear boundary text, status announcement, visible focus, and no hidden authorization-only affordance |

## Purpose
`SharedNotAuthorizedState` is the shared UI state shown when the user is known, the app has enough authentication context, and the requested route, record, or action is outside the user's allowed role, scope, assignment, ownership, or capability boundary.

This state must answer:
- `Am I signed in?`
- `Why can I not continue here?`
- `Is this a role problem, station scope problem, assignment problem, owner problem, or admin access problem?`
- `Where can I safely go now?`
- `Can I refresh because my assignment may have changed?`
- `Should I use another account?`
- `How do I contact support if access seems wrong?`
- `What protected details are hidden?`

The most important rule is:
```text
Do not reveal protected data while explaining why access is blocked.
```

## Product Job
Kra moves parcels through senders, station operators, drivers, final-mile couriers, receivers, support admins, finance admins, ops admins, and super admins. The frontend must refuse access cleanly when a user crosses a boundary, while still helping legitimate users recover from stale assignment, wrong account, changed station scope, or role mismatch.

The not authorized state must:
- make the denial clear without sounding like a crash
- never imply that retrying repeatedly will unlock access
- never reveal denied delivery, receiver, station, payment, proof, issue, or admin detail
- provide a safe route back to valid work
- let field staff refresh assignment or station scope
- let public receivers restart secure verification when scope is wrong
- let admins return to allowed console areas
- let users contact support with a safe reference when the denial appears wrong
- create telemetry that helps ops find authorization friction without leaking protected IDs

## Strategic Role
Authorization is not just security plumbing in Kra. It protects physical goods, receiver privacy, payment data, proof evidence, refund decisions, station workload, staff assignments, and privileged admin controls.

The UI must make three truths clear:
- The user may be authenticated and still not be allowed here.
- The backend remains the final authority for every protected route and action.
- Recovery must route to safe work, not to hidden data.

The state has to feel firm and useful. Field staff should understand whether to refresh work, return to queue, or contact support. Senders and receivers should understand that the data is not available to this account or link. Admins should understand which console area is blocked without exposing sensitive records.

## External Research Used
Only directly relevant authorization, HTTP semantics, and accessible status references were used:
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): supports deny-by-default, least privilege, validating permissions on each request, and server-side authorization enforcement.
- [OWASP API Security 2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/): supports object-level access controls so authenticated users cannot access another actor's records.
- [MDN 403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403): supports separating authenticated-but-not-allowed from missing authentication.
- [W3C WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear identification of the access problem and available recovery.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcement of denied status and route changes without unexpected focus movement.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/auth-and-account/07-permission-denied.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/auth.ts`
- `services/api/src/service-errors.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/issues.ts`
- `services/api/src/users.ts`

## Visual Thesis
Not authorized should feel like a guarded operational checkpoint: calm, precise, privacy-preserving, and clearly routed.

Use:
- firm shield iconography
- small red or amber boundary accent
- clear title
- safe reason label
- one primary route back to allowed work
- one secondary recovery action when useful
- short explanation of hidden data
- support link with safe reference

Do not use:
- exposed protected record names
- raw IDs in public copy
- intimidating legal tone
- vague `Access denied` alone
- generic crash styling
- repeated retry loops
- disabled controls without reason
- role escalation copy that promises permission change

## Audience
Primary users:
- sender opening a delivery outside their account
- sender opening an issue or receipt not tied to them
- receiver opening a tracking link for the wrong phone verification context
- station operator opening a delivery outside station scope
- driver opening a run not assigned to them
- final-mile courier opening a job not assigned to them
- support admin attempting transport override
- finance admin attempting operational custody change
- ops admin attempting finance-only execution
- super admin with a stale or invalid route claim

Secondary users:
- ops lead diagnosing assignment confusion
- support staff handling access complaints
- security reviewer validating deny behavior
- QA validating role and scope boundaries
- frontend engineer implementing route guards
- backend engineer aligning error reasons
- Claude Code building the UI later

Non-users:
- anonymous visitor
- expired session user
- locked account user
- provider webhook
- scheduled task
- unauthenticated attacker

## Non-Goals
Do not use not authorized for:
- missing sign-in context
- expired session
- locked account
- inactive account
- initial loading while role is unknown
- generic server failure
- network offline without known denial
- validation error
- payment failure
- issue lock
- custody conflict
- proof required
- OTP required
- scan mismatch
- duplicate package label
- stale data without a denial

If the user lacks a usable session, route to session expired or sign-in. If the account is locked, route to account locked. If the backend response is unknown, use the generic error state.

## Core Distinction
Authentication asks:
```text
Who are you?
```

Authorization asks:
```text
Can this known user see or do this specific thing right now?
```

`SharedNotAuthorizedState` is only for the second case.

## HTTP And Contract Mapping
Use the shared state when the client receives one of these safe conditions:
- `403` with valid local user context
- `FORBIDDEN_ROLE`
- `STATION_SCOPE_VIOLATION`
- `ASSIGNMENT_SCOPE_VIOLATION`
- `PHONE_VERIFICATION_REQUIRED` only when the route itself is blocked and OTP-specific state is not better
- `DELIVERY_NOT_FOUND` only when backend intentionally hides object existence and client has already classified the access as denied
- route guard confirms role cannot access route
- route guard confirms admin subrole cannot access console module
- local assignment cache is invalid and server denies scoped record access

Do not use the shared state for:
- `401`
- missing bearer token
- invalid bearer token
- revoked token
- inactive account
- account locked
- payment-required state
- issue lock
- throttling
- provider failure

## Authorization Boundary Taxonomy
`not_authorized` must support clear boundary variants.

| Boundary | Meaning | Safe User Message |
| --- | --- | --- |
| `route_role` | role cannot enter this route | `Your role cannot open this area.` |
| `capability` | role exists but lacks action capability | `Your account cannot perform this action.` |
| `station_scope` | station operator is outside station scope | `This delivery is outside your station scope.` |
| `assignment_scope` | driver or courier is not assigned | `This job is not assigned to you.` |
| `sender_ownership` | sender is not owner | `This delivery is not available to this account.` |
| `receiver_scope` | receiver link or phone verification does not match | `This tracking link cannot show this delivery.` |
| `admin_scope` | admin console or module requires admin role | `Admin access is required for this area.` |
| `finance_scope` | finance-only action requested by non-finance actor | `Finance access is required for this action.` |
| `support_scope` | support-only case action requested by non-support actor | `Support access is required for this case.` |
| `ops_scope` | ops-only transport action requested by non-ops actor | `Operations access is required for this action.` |
| `role_claim_invalid` | token role is missing or invalid after authentication | `Your account role could not be verified.` |
| `scope_changed` | assignment or station scope changed after screen opened | `Your access to this work changed. Refresh your work list.` |
| `object_hidden` | backend hides existence of inaccessible record | `This record is not available to this account.` |

## State Machine
Route guard path:
```text
unknown_auth_context
  -> auth_context_ready
  -> route_not_allowed
  -> not_authorized
  -> safe_return | switch_account | support_contact
```

API denial path:
```text
screen_ready
  -> protected_request
  -> forbidden_response
  -> classify_safe_boundary
  -> not_authorized
  -> refresh_scope | safe_return | support_contact
```

Assignment changed path:
```text
cached_assignment_visible
  -> user_opens_detail
  -> server_denies_assignment_scope
  -> scope_changed
  -> refresh_assignments
  -> allowed_work_list | empty_work_list | error
```

Receiver public path:
```text
tracking_link_opened
  -> phone_context_checked
  -> receiver_scope_denied
  -> not_authorized
  -> restart_verification | support_contact
```

## Entry Rules
Enter not authorized when:
- auth context is resolved
- the user is not in a loading or session-expired condition
- route, record, or action is denied by policy
- backend response is safely classified as a permission failure
- no protected object data needs to render
- recovery can route to a safe location

Do not enter when:
- auth context is still loading
- token refresh is in progress
- backend failure is unknown
- session is expired
- user is locked
- offline state prevents classification
- stale cached data is only old but not denied

## Exit Rules
Exit not authorized when:
- user returns to safe home, queue, list, dashboard, or tracking entry
- user refreshes assignments or station scope and now has allowed work
- user switches account through the normal sign-in flow
- user completes receiver verification through a valid challenge
- support flow is opened with safe context
- admin navigates to an allowed module

The component must not auto-exit into a denied route after refresh unless server authorization succeeds.

## Safe Recovery Actions
Every state instance must show one primary action and may show up to two secondary actions.

Primary action options:
- `Back to home`
- `Back to my deliveries`
- `Back to work list`
- `Back to station queue`
- `Back to assigned runs`
- `Back to assigned jobs`
- `Back to admin overview`
- `Restart verification`

Secondary action options:
- `Refresh access`
- `Switch account`
- `Contact support`
- `View allowed areas`
- `Open support case`
- `Return to tracking entry`

Never show:
- `Try again` as the primary action for stable authorization denial
- `Request admin access` unless an approved access-request workflow exists
- `Ignore and continue`
- `Open anyway`
- any hidden debug details

## Safe Return Mapping
Sender:
- route role denial returns to sender home
- sender ownership denial returns to delivery history or sender home
- receipt denial returns to receipt list if available
- issue denial returns to support thread list

Receiver:
- receiver scope denial returns to tracking entry or phone verification
- expired public token goes to tracking link expired, not this state
- wrong phone context goes to restart verification

Station operator:
- station scope denial returns to station overview
- queue item denial returns to the relevant queue with refresh
- action capability denial returns to delivery detail in read-only mode when allowed

Driver:
- assignment denial returns to assigned runs
- route detail denial returns to driver home
- action denial returns to manifest or assigned runs

Final-mile courier:
- assignment denial returns to courier assignments
- proof denial returns to courier job detail when read access remains allowed
- action denial returns to assigned jobs

Admin:
- module role denial returns to admin overview
- finance denial returns to finance overview only if finance read access exists
- support denial returns to issue queue only if support read access exists
- user management denial returns to admin overview

Public web:
- protected sender or receiver denial returns to safe tracking entry or sign-in
- policy pages never use this state because they are public

## Visual Layout
Standalone state layout:
- page shell keeps normal app header when the route itself is allowed to show chrome
- centered card width `min(560px, calc(100vw - 32px))`
- icon badge at top
- eyebrow text `Access boundary`
- title
- one sentence explanation
- safe reason strip
- primary action row
- optional support link
- privacy note

Inline panel layout:
- compact card inside the denied area
- no full-page blanking if surrounding allowed context remains useful
- one short title
- one reason line
- primary safe action
- no decorative large illustration

Mobile layout:
- full-width card with `24px` side padding
- sticky primary action near bottom when the route is standalone
- thumb-reachable buttons
- no hidden overflow for support reference
- safe-area padding for bottom bars

Admin layout:
- card may include allowed module suggestions
- keep global nav visible only if nav itself is allowed
- hide denied module content completely
- show audit-safe request reference when available

## Component Contract
`SharedNotAuthorizedState` props:
```ts
type NotAuthorizedBoundary =
  | "route_role"
  | "capability"
  | "station_scope"
  | "assignment_scope"
  | "sender_ownership"
  | "receiver_scope"
  | "admin_scope"
  | "finance_scope"
  | "support_scope"
  | "ops_scope"
  | "role_claim_invalid"
  | "scope_changed"
  | "object_hidden";

interface SharedNotAuthorizedStateProps {
  boundary: NotAuthorizedBoundary;
  surface:
    | "public_web"
    | "receiver_public"
    | "sender_mobile"
    | "ops_mobile"
    | "admin_web";
  variant: "standalone" | "inline" | "modal" | "drawer" | "action_result";
  currentRole?: string;
  routeLabel?: string;
  safeReason?: string;
  safeReference?: string;
  requestId?: string;
  canRefreshScope?: boolean;
  canSwitchAccount?: boolean;
  canContactSupport?: boolean;
  primaryAction: NotAuthorizedAction;
  secondaryActions?: NotAuthorizedAction[];
  onPrimaryAction: () => void;
  onSecondaryAction?: (action: NotAuthorizedAction) => void;
  onRefreshScope?: () => Promise<void>;
}
```

`NotAuthorizedAction`:
```ts
type NotAuthorizedAction =
  | "back_home"
  | "back_deliveries"
  | "back_tracking"
  | "back_work_list"
  | "back_station_queue"
  | "back_assigned_runs"
  | "back_assigned_jobs"
  | "back_admin_overview"
  | "restart_verification"
  | "refresh_scope"
  | "switch_account"
  | "contact_support"
  | "view_allowed_areas";
```

## Component Responsibilities
`SharedNotAuthorizedState`:
- owns page or panel composition
- selects copy from boundary and surface
- blocks protected child rendering
- wires primary and secondary actions
- announces state to assistive technology
- emits analytics
- renders support reference only when safe

`AuthorizationBoundaryCard`:
- renders icon, title, body, and action stack
- adapts density for standalone, inline, and action result variants
- accepts safe reason copy only

`ScopeReasonStrip`:
- renders boundary type in human language
- uses non-color icon and text
- never shows unauthorized record details

`SafeReturnActions`:
- renders buttons with stable order
- enforces one primary action
- prevents retry-as-primary for stable denial
- disables refresh during refresh operation with visible progress

`ProtectedDataShield`:
- replaces denied content region
- prevents partial data flashes
- preserves layout enough to avoid disorienting jumps

`AuthorizationSupportLink`:
- opens support with safe context
- includes request id only when it does not expose protected target data
- never passes raw denied object payload

`AccessAuditHint`:
- admin and staff only
- tells user that access attempts may be logged for safety
- uses concise non-threatening copy

`RoleMismatchNotice`:
- appears when the route is safe but current role is not the intended role
- may show current role label if it is already visible in account chrome
- may offer switch account

## Copy System
Base title:
- `You cannot access this area`

Short body:
- `You are signed in, but this route or action is outside your allowed access.`

Privacy note:
- `Kra hides records and actions outside your role, station, assignment, or account scope.`

Support note:
- `If this looks wrong, contact support with the reference shown here.`

Do not use:
- `Unauthorized user`
- `Forbidden`
- `You are not allowed`
- `Ask an admin to unlock this`
- `Record exists but you cannot view it`
- `This delivery belongs to another user`
- `Permission failed because user ID does not match`

## Boundary Copy Matrix
| Boundary | Title | Body | Primary Action |
| --- | --- | --- | --- |
| `route_role` | `You cannot access this area` | `This area is not available for your current role.` | `Back to home` |
| `capability` | `This action is not available` | `Your account does not include this action permission.` | `Back to allowed work` |
| `station_scope` | `Outside your station scope` | `This delivery is not in your assigned station scope.` | `Back to station queue` |
| `assignment_scope` | `Not assigned to you` | `This job is not currently assigned to your account.` | `Back to assigned work` |
| `sender_ownership` | `Delivery not available` | `This delivery is not available to this sender account.` | `Back to my deliveries` |
| `receiver_scope` | `Tracking access denied` | `This tracking link cannot show delivery details for the current verification.` | `Restart verification` |
| `admin_scope` | `Admin access required` | `This console area requires an admin role.` | `Back to admin overview` |
| `finance_scope` | `Finance access required` | `This payment or refund action requires finance access.` | `Back to admin overview` |
| `support_scope` | `Support access required` | `This case action requires support access.` | `Back to admin overview` |
| `ops_scope` | `Operations access required` | `This transport action requires operations access.` | `Back to admin overview` |
| `role_claim_invalid` | `Account role could not be verified` | `Your account role is missing or invalid. Sign in again or contact support.` | `Switch account` |
| `scope_changed` | `Your access changed` | `This work may have been reassigned or moved out of your scope.` | `Refresh access` |
| `object_hidden` | `Record not available` | `This record is not available to this account.` | `Back to safe area` |

## Microcopy Rules
Copy must:
- use present tense
- be specific enough for recovery
- avoid naming protected resources
- avoid blaming the user
- avoid promising that support will grant access
- separate sign-in recovery from authorization recovery
- use `account`, `role`, `station scope`, or `assignment` only when safe

Copy must not:
- mention internal rule names in user-facing copy
- display raw backend stack or route names
- include denied record title
- include receiver phone, address, or proof data
- include sender name if sender is not authorized
- include station name when station scope is denied unless already in allowed chrome
- include payment amount when finance scope is denied

## Protected Data Rules
When not authorized renders, the UI must hide:
- delivery title or generated delivery label when not already authorized
- receiver name
- receiver phone
- receiver address
- sender identity
- package description
- package label code
- scan code
- OTP state
- proof image
- signature proof
- payment amount
- provider reference
- refund evidence
- internal note
- issue thread content
- station queue counts outside scope
- admin audit details outside role

The UI may show:
- generic route label such as `Delivery detail`
- current user role if already visible elsewhere
- safe boundary category
- safe support reference
- request id if not tied to public protected data
- timestamp of denial

## Route Guard Requirements
Route guards must:
- resolve auth state before rendering protected routes
- never briefly render protected content before redirect or denied state
- use server data as final authority
- keep local role checks as early user experience only
- clear protected query cache when authorization changes
- redirect expired sessions away from this state
- preserve intended safe return route
- prevent back navigation into a denied route after sign-out

Route guards must not:
- trust route params as proof of access
- trust locally cached assignment as permission to mutate
- infer sender ownership from visible list item alone
- infer station scope from display label
- show hidden content while checking access

## API Mapping Rules
Client mapping:
- `AUTH_REQUIRED` maps to session expired or sign-in.
- `FORBIDDEN_ROLE` maps to `route_role`.
- `STATION_SCOPE_VIOLATION` maps to `station_scope`.
- `ASSIGNMENT_SCOPE_VIOLATION` maps to `assignment_scope`.
- `FORBIDDEN` with safe `capability` detail maps to `capability`.
- `FORBIDDEN` with safe `missing_role_claim` maps to `role_claim_invalid`.
- `FORBIDDEN` with safe delivery scope failure maps to `object_hidden` unless role-specific scope is known.
- `DELIVERY_NOT_FOUND` maps to not found unless route policy intentionally hides inaccessible objects.
- `PHONE_VERIFICATION_REQUIRED` maps to `otp_required` unless access is denied after a wrong receiver verification.

Backend detail handling:
- use `error.code`
- use `error.safeMessage` when approved
- use safe `reason` only if documented
- discard raw detail fields by default
- do not put full error detail into user-visible copy

## Surface Specific Requirements
Public web:
- show concise explanation
- route to tracking entry or sign-in
- no support reference that leaks target route
- no account role detail for anonymous visitors

Receiver public:
- show tracking access denied
- route to restart phone verification or tracking entry
- never show delivery status before verification succeeds
- never confirm that a specific tracking code exists when access fails

Sender mobile:
- route to sender home or delivery history
- allow switch account only through auth shell
- avoid showing another sender's delivery existence
- preserve app tab chrome only if sender chrome is already allowed

Operations mobile:
- prioritize refresh assignments or station queue
- show offline caveat when denial happened after stale cached work
- route to assigned work
- do not expose other worker or station owner
- action denial should preserve allowed delivery detail only if read access remains allowed

Admin web:
- keep admin shell only if user has admin route access
- hide denied module content
- show allowed module navigation
- show audit-safe reference
- use stricter copy for privileged action denial
- route to admin overview or allowed console module

## Mobile Interaction
Mobile state must:
- fit in one thumb-scroll viewport when possible
- keep primary action visible near bottom
- use `44px` minimum touch target
- support low-bandwidth refresh
- work offline only for already classified cached denial
- maintain screen reader focus on the title
- avoid repeated vibration or alert effects

Mobile denied action pattern:
```text
User taps protected action
  -> action button enters short loading state
  -> backend denies
  -> inline action result card appears near action source
  -> primary recovery is shown
  -> protected mutation is not queued offline
```

## Admin Interaction
Admin state must:
- state whether module or action is blocked
- keep surrounding admin shell if allowed
- show allowed alternatives
- show contact support or super admin only through approved workflow
- never reveal hidden finance, support, proof, or user role data
- avoid auto-opening user management from a denial

Admin denied action pattern:
```text
Admin opens module
  -> route guard checks role
  -> module blocked
  -> not_authorized page panel
  -> back to admin overview or allowed module
```

## Receiver Interaction
Receiver state must:
- be privacy-first
- never confirm a delivery belongs to another phone
- explain that the link cannot show details
- offer restart verification
- offer support entry with safe tracking reference only after allowed verification step
- keep copy simple and non-technical

Receiver denied pattern:
```text
Receiver opens link
  -> token or phone context checked
  -> access denied
  -> no delivery detail renders
  -> restart verification or tracking entry
```

## Offline And Stale Data Interaction
If cached data is visible and a later server request returns denial:
- immediately hide protected detail for the denied record
- show `scope_changed` when assignment or station scope likely changed
- clear or mark stale cache for that record
- route field staff to refreshed queue
- do not keep the denied record visible as stale context

If device is offline before server classification:
- do not show not authorized unless denial was already known
- show offline state with cached-data marker instead
- block risky mutation until online authorization succeeds

If stale data says user had access but server denies:
- server denial wins
- show not authorized
- invalidate cached record
- record safe telemetry

## Action Safety Rules
Not authorized always blocks:
- custody transfer
- package scan acceptance
- package label reprint
- payment initialization
- refund approval
- refund execution
- proof upload
- delivery completion
- failed attempt submission
- issue escalation
- user role change
- station status override
- pricing rule change
- webhook replay

Not authorized may allow:
- safe navigation
- scope refresh
- sign out
- switch account
- support contact with safe context
- reading allowed surrounding list if route has read scope
- opening public policy pages

## Form Behavior
If denial happens inside a form:
- stop submission
- keep user-entered text only if the form itself remains allowed
- hide denied target data
- show inline not authorized result at the top of the form
- disable submit
- provide safe route away
- do not auto-resubmit after refresh
- require user review if refresh later allows access

If denial happens after file selection:
- remove selected proof or attachment from pending upload
- do not upload the file
- do not store protected file metadata
- show safe denied copy

## Data Fetching Requirements
Query layer must:
- classify auth errors centrally
- invalidate protected cache on denial
- avoid retry loops for `403`
- retry only if denial is caused by scope refresh flow
- cancel in-flight mutations after denial
- clear optimistic updates tied to denied action
- preserve safe list cache when list remains authorized

Mutation layer must:
- roll back optimistic state
- show not authorized action result
- emit telemetry
- never queue denied mutation for offline replay
- never convert denial into generic failure copy

## Visual States
Standalone:
- full card
- shield icon
- title
- one body sentence
- boundary strip
- action stack
- privacy note

Inline:
- compact card
- no large icon
- one recovery action
- no full-shell disruption

Modal:
- use only when denial happens inside modal action
- close modal content if content is now forbidden
- retain safe shell
- primary action closes to safe route

Drawer:
- replace drawer body with denied state
- preserve drawer title only if title is generic
- close to safe list

Action result:
- appears near triggering action
- short copy
- primary safe action or refresh
- no decorative elements

## Typography
Title:
- `20-24px` mobile standalone
- `24-32px` web standalone
- `16-18px` inline
- weight `650-750`
- line height `1.1-1.2`

Body:
- `15-16px`
- line height `1.45-1.6`
- max width `62ch`

Reason strip:
- `13-14px`
- semibold label
- normal body

Buttons:
- primary label short
- secondary label clear
- no all caps

## Color
Default:
- neutral surface
- red boundary accent for stable denial
- amber accent for changed assignment or role verification issue
- blue accent for safe navigation action

Rules:
- color never communicates denial alone
- icon and text must accompany any red or amber marker
- red is not used for support link
- disabled controls must meet contrast and include reason text

## Motion
Allowed:
- subtle card enter `120-180ms`
- inline panel height transition if it prevents layout jump
- progress indicator during refresh scope
- status announcement after refresh completes

Not allowed:
- shaking card
- flashing red warning
- repeated entrance animation
- motion that suggests punishment
- route bouncing between sign-in and denial

## Accessibility
Required:
- title receives focus on standalone route entry
- inline denied panel uses `role="status"` for newly surfaced denial
- severe action denial uses assertive announcement only when user just attempted the action
- buttons are keyboard reachable
- focus order follows title, reason, primary action, secondary actions, support link
- support reference is readable as text
- denial is not communicated by color alone
- route changes update document title
- mobile screen reader announces primary recovery

Screen reader title:
- `Access blocked`

Screen reader body:
- use boundary-specific safe copy

Status announcement after refresh:
- `Access refreshed. Showing your allowed work.`
- or `Access refreshed. This item is still not available to your account.`

## Localization
Copy must be translatable:
- no string concatenation with raw role names
- no raw backend code in visible copy
- no directional idioms
- no legal jargon
- no country-specific phrasing
- short button labels

Role labels must come from localized display names:
- `Sender`
- `Station operator`
- `Driver`
- `Final-mile courier`
- `Operations admin`
- `Finance admin`
- `Support admin`
- `Super admin`

## Privacy And Security
Security rules:
- backend is final authority
- client route guards are only early prevention
- cache must not keep denied record visible
- support link receives safe context only
- telemetry does not include protected payload
- no hidden HTML containing denied content
- no protected content in page title
- no protected content in URL query after denial
- no raw route params in visible support copy

Privacy rules:
- do not confirm another user's delivery exists
- do not reveal receiver phone or address
- do not reveal staff assignment owner
- do not reveal station workload outside scope
- do not reveal payment reference outside finance or sender scope
- do not reveal proof content outside allowed scope

## Telemetry
Event: `not_authorized_viewed`

Allowed properties:
- `surface`
- `variant`
- `boundary`
- `route_group`
- `current_role`
- `action_type`
- `safe_error_code`
- `has_safe_reference`
- `can_refresh_scope`
- `can_switch_account`
- `can_contact_support`
- `network_state`
- `cache_state`

Forbidden properties:
- delivery id
- package label
- scan code
- receiver phone
- receiver address
- payment provider reference
- proof asset URL
- issue body
- internal note
- raw backend details
- user token claims beyond role label

Event: `not_authorized_recovery_clicked`

Allowed properties:
- `surface`
- `boundary`
- `action`
- `route_group`
- `result`

## Error Logging
Frontend log may include:
- safe error code
- safe boundary type
- route group
- request id
- current role
- timestamp

Frontend log must not include:
- raw protected payload
- full denied URL with sensitive params
- bearer token
- proof upload content
- provider payload
- full receiver phone
- full address

## QA Scenarios
Required route QA:
- sender opens own delivery and sees content
- sender opens another account delivery and sees not authorized
- station operator opens in-scope station delivery and sees content
- station operator opens out-of-scope delivery and sees not authorized
- driver opens assigned run and sees content
- driver opens unassigned run and sees not authorized
- courier opens assigned job and sees content
- courier opens unassigned job and sees not authorized
- finance admin opens refund execution and sees content
- support admin attempts refund execution and sees not authorized
- ops admin attempts finance execution and sees not authorized
- non-admin opens admin console and sees admin access denial

Required action QA:
- denied custody mutation rolls back optimistic UI
- denied proof upload does not upload file
- denied refund action does not submit
- denied station override does not submit
- denied package scan does not queue offline action
- denied webhook replay does not run

Required privacy QA:
- denied state does not show protected record title
- denied state does not show receiver phone
- denied state does not show payment amount
- denied state does not show proof image
- denied state does not leave protected content in DOM
- browser back does not reveal denied route content

## Unit Tests
Component tests must cover:
- renders boundary-specific title
- renders safe body copy
- renders correct primary action
- hides support link when not allowed
- shows support link with safe reference when allowed
- does not render protected children
- announces status on action denial
- disables refresh while refresh is in progress
- returns to safe route on primary action
- maps boundary to correct copy
- uses public receiver copy for receiver scope
- uses admin copy for admin scope

Mapping tests must cover:
- `AUTH_REQUIRED` does not map to not authorized
- `FORBIDDEN_ROLE` maps to `route_role`
- `STATION_SCOPE_VIOLATION` maps to `station_scope`
- `ASSIGNMENT_SCOPE_VIOLATION` maps to `assignment_scope`
- unknown `FORBIDDEN` maps to generic object hidden
- `DELIVERY_NOT_FOUND` does not leak object existence
- role claim missing maps to role claim invalid
- expired session maps to session expired

## End-To-End Tests
E2E tests must cover:
- sender cannot access another sender delivery
- station operator cannot access out-of-scope station delivery
- driver cannot access another driver's run
- courier cannot access another courier's job
- support admin cannot execute refund
- finance admin cannot override transport state
- receiver wrong verification cannot view tracking timeline
- admin module denial keeps allowed admin nav only when admin shell is allowed
- refresh assignment after denial returns to updated work list
- offline cached denied mutation is not queued

## Visual QA
Visual review must verify:
- standalone mobile state at `360px`
- standalone mobile state at `430px`
- public web state at `1024px`
- admin panel state at `1440px`
- inline denied state in detail screen
- action result state near button
- long localized copy
- large text mode
- high contrast mode
- keyboard focus ring
- screen reader order

## Acceptance Criteria
`SharedNotAuthorizedState` is complete when:
- protected content never renders before or during denial
- all boundary variants have safe copy
- each surface has a safe primary recovery
- retry is not the primary action for stable denial
- field staff can refresh assignment or station scope
- receiver denial never confirms delivery existence
- admin denial hides module content
- support links use safe context only
- telemetry excludes protected data
- tests cover route, API, action, privacy, and accessibility behavior

## Implementation Sequence
1. Build central error-to-state classifier.
2. Build central route guard classifier.
3. Build `SharedNotAuthorizedState`.
4. Build `AuthorizationBoundaryCard`.
5. Build `ScopeReasonStrip`.
6. Build `SafeReturnActions`.
7. Build `ProtectedDataShield`.
8. Build `AuthorizationSupportLink`.
9. Integrate sender routes.
10. Integrate receiver tracking routes.
11. Integrate station operator routes.
12. Integrate driver routes.
13. Integrate final-mile courier routes.
14. Integrate admin routes.
15. Add cache invalidation on denial.
16. Add privacy-focused telemetry.
17. Add component tests.
18. Add route guard tests.
19. Add E2E denial scenarios.
20. Add accessibility checks.

## Route Checklist
Every protected route must define:
- required auth state
- required role
- required capability when applicable
- station scope source when applicable
- assignment scope source when applicable
- ownership source when applicable
- admin module scope when applicable
- safe return route
- support allowed flag
- switch account allowed flag
- refresh scope allowed flag
- protected data clearing behavior
- query invalidation behavior

## Test IDs
Root:
- `state-not-authorized`

Elements:
- `state-not-authorized-card`
- `state-not-authorized-title`
- `state-not-authorized-body`
- `state-not-authorized-reason-strip`
- `state-not-authorized-primary-action`
- `state-not-authorized-secondary-action`
- `state-not-authorized-refresh-scope`
- `state-not-authorized-switch-account`
- `state-not-authorized-support-link`
- `state-not-authorized-privacy-note`
- `state-not-authorized-safe-reference`
- `state-not-authorized-protected-data-shield`

Boundary variants:
- `state-not-authorized-route-role`
- `state-not-authorized-capability`
- `state-not-authorized-station-scope`
- `state-not-authorized-assignment-scope`
- `state-not-authorized-sender-ownership`
- `state-not-authorized-receiver-scope`
- `state-not-authorized-admin-scope`
- `state-not-authorized-finance-scope`
- `state-not-authorized-support-scope`
- `state-not-authorized-ops-scope`
- `state-not-authorized-role-claim-invalid`
- `state-not-authorized-scope-changed`
- `state-not-authorized-object-hidden`

## Failure Modes
Protected flash:
- User sees protected data before denied state.
- Severity: critical.
- Fix: render guard shell until authorization is resolved.

Wrong state:
- Expired session maps to not authorized.
- Severity: high.
- Fix: separate authentication classifier before authorization classifier.

Data leak:
- Denied state shows target delivery or receiver detail.
- Severity: critical.
- Fix: strip target details from copy and telemetry.

Retry loop:
- User repeatedly retries stable denial.
- Severity: medium.
- Fix: make safe navigation primary; refresh only when scope can change.

Offline queue leak:
- Denied mutation is added to offline outbox.
- Severity: high.
- Fix: never queue known denied mutations.

Admin over-disclosure:
- Admin module denial shows finance or proof data.
- Severity: critical.
- Fix: replace entire module body with denied panel.

Receiver enumeration:
- Receiver denial confirms a delivery belongs to another phone.
- Severity: critical.
- Fix: use generic receiver scope copy.

## Definition Of Done
This state is ready for Claude Code implementation when:
- all route and action boundaries are mapped
- copy is safe for sender, receiver, staff, and admin surfaces
- privacy rules forbid protected data leakage
- cache invalidation rules are explicit
- mutation rollback rules are explicit
- support contact uses safe references
- accessibility requirements are testable
- telemetry allowlist is explicit
- all required test IDs are named
- E2E coverage includes role, station, assignment, sender, receiver, and admin denials
