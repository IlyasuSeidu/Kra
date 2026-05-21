# App Shells Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | App shells |
| Component family | Shared UI infrastructure |
| Primary shell components | `PublicWebShell`, `ReceiverPublicShell`, `SenderMobileShell`, `OpsMobileShell`, `AdminWebShell` |
| Supporting shell components | `AuthShell`, `MaintenanceShell`, `ShellRouteGuard`, `ShellNavigation`, `ShellHeader`, `ShellFooter`, `ShellOfflineBanner`, `ShellOutboxIndicator`, `ShellNotificationIndicator`, `ShellRouteAnnouncer`, `ShellSafeArea`, `ShellSkipLinks` |
| Inventory behavior | Separate public web, sender mobile, ops mobile, and admin web shells |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin` |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, admins, support, finance, operations leads |
| Backend coverage | route guards, auth principal, role claims, capability checks, notification summary, offline outbox status, public config, health/maintenance config |
| Browser mutation operation | None directly; app shells provide layout, route access, navigation, and global state context only |
| Data sensitivity | auth state, role claims, route params, tracking code, delivery IDs, notification count, outbox state, station scope, admin capability set |
| Offline critical | Yes for operations mobile shell; partial for sender shell; public and admin shells are online-first unless specific screens provide cached state |
| Related inventory section | Shared UI Infrastructure |
| Related screen specs | all public web, receiver public, sender mobile, operations mobile, station, driver, final-mile, and admin screen specs |
| Related infrastructure specs | role routing, typed API client, RTK Query cache, offline outbox, empty/error library, accessibility foundation, localization foundation, analytics tracking, test harness |
| Design tokens | `brand.blue.600`, `success.green.600`, `warning.amber.600`, `danger.red.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16`, elevation `0-3` |
| Accessibility target | WCAG 2.2 AA equivalent with landmarks, skip links, stable focus, route announcements, keyboard-safe navigation, and mobile-safe target sizes |

## Purpose
Kra needs separate app shells because each product surface has a different job, risk level, navigation model, and data boundary.

The app shell is the persistent structural layer around screens. It owns the stable frame, navigation, route access, global providers, safe-area treatment, page landmarks, global notices, and top-level loading or blocked states. It must not own screen-specific business logic, pricing rules, custody decisions, payment outcomes, proof requirements, refund decisions, or admin data mutations.

The app shells must answer:

- Which product surface is the user in?
- Which role and capability set are active?
- Which navigation items are visible for that role?
- Which route can load inside this shell?
- Which global status must always be visible?
- Which state is cached, stale, offline, or blocked?
- Which route transitions are safe?
- Which landmarks, skip links, and focus behavior make the shell accessible?

The most important rule is:

```text
The shell can frame and guard a workflow, but it must never become the authority for backend roles, status transitions, pricing, payment, custody, proof, refund, or issue policy.
```

## Product Job
The shell is the user's orientation system. It should make every surface feel coherent while keeping each role's work sharply separated.

The app shell system must:

- load fast and show a meaningful frame before screen content finishes
- separate public, sender, operations, and admin experiences
- keep receiver public flows privacy-first and lightweight
- keep sender flows customer-friendly and task-led
- keep operations flows field-safe, offline-aware, and role-specific
- keep admin flows dense, audited, and desktop-first
- preserve route accessibility, heading structure, focus order, and skip navigation
- support deep links without exposing restricted data
- preserve safe navigation while rejecting unauthorized routes
- avoid duplicated shell logic across screens
- support future localization without structural redesign
- support analytics without blocking navigation
- keep mobile navigation clear of primary actions and safe areas
- keep admin navigation role-gated and auditable

## Strategic Role
Shell quality decides whether the product feels like a reliable operating system or a collection of screens.

For Kra, this matters because the same delivery object is seen by:

- a public visitor deciding whether to trust the company
- a sender paying for delivery
- a receiver verifying access
- a station operator scanning packages
- a driver moving goods
- a courier completing proof
- a finance admin reconciling money
- a support lead resolving disputes

If shells blur those contexts, users can land in the wrong workflow, see the wrong navigation, or attempt actions without proper authority. A strong shell system prevents role confusion before it becomes a backend rejection.

## Design Brief
Audience:

- All Kra users, with different shells for public visitors, delivery customers, field staff, and admins.

Surface type:

- Persistent app frame, route layout, navigation system, access boundary, and global status layer.

Primary action:

- Keep the user oriented and route them to the one top-level task that matches their role.

Visual thesis:

- `Operational spine`: a restrained, high-clarity frame that stays quiet while making role, route, status, and next action unmistakable.

Restraint rule:

- Do not use shell chrome to compete with screen content. The shell should guide, not dominate.

Density:

- Public web is polished and spacious. Sender mobile is concise. Operations mobile is status-heavy but touch-simple. Admin web is dense and scannable.

Platform stance:

- Public web and admin web use React web routing. Mobile uses Expo React Native with Expo Router. Operations and sender share the mobile codebase but not the same runtime shell after sign-in.

## External Research Used
Only directly relevant shell, routing, and accessibility references were used:

- [Expo Router navigation layouts](https://docs.expo.dev/router/basics/layout/): supports root layouts, nested `_layout.tsx` files, stacks, tabs, and route-group navigation for the Expo mobile app.
- [React Router routing](https://reactrouter.com/start/data/routing): supports nested routes, layout routes, outlets, index routes, route objects, dynamic segments, and web app shell composition.
- [Chrome for Developers application shell model](https://developer.chrome.com/docs/workbox/app-shell-model/): supports keeping common UI such as header and navigation separate from page-specific content, loading the shell quickly, and keeping shell assets minimal.
- [W3C WAI-ARIA landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/): supports semantic `header`, `nav`, `main`, `aside`, `footer`, unique navigation labels, and skip-link targets.
- [WCAG 2.2 focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard order through shell navigation and routed screen content.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports route-change, offline, outbox, and global-status announcements without unnecessary focus movement.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/navigation-map.md`
- `docs/05-design/information-architecture.md`
- `docs/05-design/accessibility-and-localization.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/06-architecture/frontend-architecture.md`
- `docs/06-architecture/system-architecture.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/15-qa/quality-strategy.md`
- `packages/shared/src/contracts/api.ts`
- all screen specs under `docs/05-design/frontend-screen-specs/public-web`
- all screen specs under `docs/05-design/frontend-screen-specs/receiver-public-flow`
- all screen specs under `docs/05-design/frontend-screen-specs/sender-mobile-app`
- all screen specs under `docs/05-design/frontend-screen-specs/operations-mobile-shared`
- all screen specs under `docs/05-design/frontend-screen-specs/station-operator-mobile-app`
- all screen specs under `docs/05-design/frontend-screen-specs/driver-mobile-app`
- all screen specs under `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app`
- all screen specs under `docs/05-design/frontend-screen-specs/admin-web-console`

## Shell Inventory
Kra v1 must ship these shell families.

| Shell | Repo target | Primary job | Navigation model | Offline stance |
| --- | --- | --- | --- | --- |
| `PublicWebShell` | `apps/web` | marketing, public trust, policy, tracking entry | public header and footer | online-first |
| `ReceiverPublicShell` | `apps/web` | delivery-scoped receiver verification and tracking | minimal privacy header, no broad marketing nav after gate | online-first with safe route states |
| `SenderMobileShell` | `apps/mobile` | sender account, delivery creation, payment, tracking, support | mobile tabs plus task stacks | online-first with limited local drafts |
| `OpsMobileShell` | `apps/mobile` | station, driver, and final-mile workflows | role-specific tabs, stacks, outbox status | offline-aware for critical field workflows |
| `AdminWebShell` | `apps/admin` | admin console, finance, support, operations, launch readiness | desktop sidebar, top bar, breadcrumbs | online-only with stale-data states |
| `AuthShell` | all clients as needed | sign-in, invite, account recovery | minimal auth frame | online-first |
| `MaintenanceShell` | public and admin web | service interruption and readiness fallback | minimal header and status | static fallback where possible |

## Shell Boundary Rules
Shells own:

- app-level providers
- route grouping
- navigation chrome
- route guards
- role and capability gating
- global loading frame
- global offline or maintenance banner
- outbox indicator
- notification indicator
- safe-area and viewport constraints
- landmarks and skip links
- route transition announcements
- shell-level analytics events
- shell-level error boundary
- shell-level stale auth handling

Shells do not own:

- screen-specific data fetching
- screen mutation payloads
- domain transitions
- pricing math
- payment confirmation
- package custody decisions
- proof validation
- refund approval
- issue resolution
- webhook replay
- station validation decisions
- user management mutations
- report export generation
- screen copy beyond navigation and global notices

If a shell needs information to draw navigation, it may read only:

- authenticated principal
- role and capability claims
- station scope where needed for shell label
- notification unread count
- offline outbox count
- public maintenance config
- safe app version
- global feature flags approved for clients

## Public Web Shell
### Purpose
`PublicWebShell` frames unauthenticated public pages:

- landing page
- how it works
- service areas
- pricing explainer
- trust and custody page
- support entry
- delivery policy
- refund policy
- privacy
- terms
- tracking entry
- maintenance

The public shell must create trust quickly while avoiding operational clutter.

### Required Chrome
Header:

- Kra wordmark
- primary navigation
- `Track package`
- `Start delivery` or `Get started`
- support link
- mobile menu

Footer:

- policy links
- service area links
- support contact
- legal links
- company trust statement

Main:

- one `main` landmark
- skip link target
- route heading
- route content container

### Navigation
Desktop public navigation:

- `Home`
- `How it works`
- `Service areas`
- `Pricing`
- `Track`
- `Support`

Mobile public navigation:

- collapsed menu
- `Track package` remains top priority
- policy links move to footer

Public shell route families:

```text
/
/how-it-works
/service-areas
/pricing
/trust-custody
/support
/delivery-policy
/refund-policy
/privacy
/terms
/track
/maintenance
```

### Visual Direction
The public shell should feel like infrastructure-grade logistics, not a casual courier landing page.

Use:

- confident white and blue base
- strong contrast
- large route headings
- grounded Ghana service context
- restrained motion
- clear calls to track or start

Avoid:

- dashboard chrome
- dense admin navigation
- app-only bottom tabs
- provider logos in shell chrome
- policy clutter in top navigation

### Public Privacy Rules
The public shell must not:

- show account navigation unless authenticated customer session exists
- show admin, station, driver, or courier links
- expose tracking code from failed lookup in persistent chrome
- persist receiver verification state in public global navigation
- reveal whether a tracking code exists in shell-level copy

## Receiver Public Shell
### Purpose
`ReceiverPublicShell` frames delivery-scoped receiver flows:

- secure tracking landing
- phone challenge
- OTP verification
- receiver tracking timeline
- arrival instructions
- failed attempt information
- refusal information
- tracking link expired
- tracking access denied

This shell must be privacy-first. Receivers are not full account users in v1.

### Required Chrome
Header:

- Kra wordmark
- privacy-safe route title
- optional `Help`
- no broad marketing navigation after receiver enters scoped flow

Main:

- single-column mobile-first layout
- `main` landmark
- route heading
- compact delivery-scoped status when safe

Footer:

- minimal support and privacy links

### Receiver Route Families
```text
/r/:trackingCode
/r/:trackingCode/verify-phone
/r/:trackingCode/verify-otp
/r/:trackingCode/timeline
/r/:trackingCode/arrival
/r/:trackingCode/failed-attempt
/r/:trackingCode/refusal
/r/:trackingCode/expired
/r/:trackingCode/access-denied
```

### Privacy Rules
The receiver shell must not:

- show sender account navigation
- show full delivery details before verification
- show full phone number
- expose OTP or verification token
- persist receiver token in URL
- pass sensitive verification state through analytics
- expose admin or support internals

### Shell Behavior
Before phone verification:

- show only safe public status
- route to phone challenge
- keep copy generic when access fails

After verification:

- show receiver-safe timeline and instructions
- show scoped support path
- keep token ephemeral and delivery-scoped

On denied or expired access:

- use receiver-specific access denied or expired screens
- do not route into marketing shell as if it were normal browsing

## Sender Mobile Shell
### Purpose
`SenderMobileShell` frames sender account workflows in `apps/mobile`.

Sender jobs:

- home
- create delivery
- payment
- delivery tracking
- history
- support
- notifications
- profile
- settings

### Expo Router Shape
Recommended route groups:

```text
apps/mobile/src/app/_layout.tsx
apps/mobile/src/app/(auth)/_layout.tsx
apps/mobile/src/app/(sender)/_layout.tsx
apps/mobile/src/app/(sender)/(tabs)/_layout.tsx
apps/mobile/src/app/(sender)/create/_layout.tsx
apps/mobile/src/app/(sender)/payments/_layout.tsx
apps/mobile/src/app/(sender)/deliveries/_layout.tsx
```

The root layout owns providers and font loading. The sender layout owns sender route guard and sender navigation. Screen routes own screen state and API orchestration.

### Sender Tabs
Approved launch tabs:

- `Home`
- `Create`
- `History`
- `Support`

Hidden in pilot:

- wallet tab
- public ratings
- advanced analytics

Optional access from header or settings:

- notifications
- profile
- settings

### Shell Chrome
Header:

- sender name or safe account label
- notification entry
- settings entry
- route title on stack screens

Bottom navigation:

- four launch tabs
- visible labels
- current tab state
- safe-area padding
- no overlap with primary screen CTA

Global notices:

- offline notice
- stale session notice
- payment provider maintenance notice only if app config exposes it

### Sender Rules
The sender shell must not:

- expose station operator, driver, courier, or admin nav
- show operations outbox
- calculate delivery pricing
- decide payment status
- bypass payment required states
- turn local draft into backend delivery without screen mutation

The sender shell may:

- preserve local create-delivery draft state provider
- show notification count
- gate sender routes by auth state
- redirect unauthenticated users to sign-in
- clear sensitive local state on sign-out

## Operations Mobile Shell
### Purpose
`OpsMobileShell` frames station operator, driver, and final-mile courier workflows in one Expo mobile app with role-aware shells.

The operations shell is field-critical. It must be fast, readable outdoors, touch-safe, offline-aware, and explicit about current role.

### Role Shells
Station operator shell:

- overview
- outbound
- inbound
- handoffs
- support

Driver shell:

- home
- assigned runs
- history
- earnings
- support

Final-mile courier shell:

- home
- assigned
- completed
- earnings
- issues

Shared operations screens:

- role home
- delivery detail
- scan package
- custody chain
- offline outbox
- action recovery
- issue create
- support

### Expo Router Shape
Recommended route groups:

```text
apps/mobile/src/app/(ops)/_layout.tsx
apps/mobile/src/app/(ops)/station/_layout.tsx
apps/mobile/src/app/(ops)/driver/_layout.tsx
apps/mobile/src/app/(ops)/courier/_layout.tsx
apps/mobile/src/app/(ops)/shared/_layout.tsx
apps/mobile/src/app/(ops)/outbox/_layout.tsx
```

Role-specific layouts should share shell primitives but not share top-level tabs.

### Operations Chrome
Header:

- active role label
- station or assignment context when safe
- sync state
- outbox count
- support entry

Bottom navigation:

- role-specific launch tabs
- large touch targets
- short labels
- no hidden action behind unlabeled icons

Global status:

- offline banner
- sync pending indicator
- stale data marker
- active issue lock marker when global
- role scope warning when missing

### Offline Rules
Operations shell must:

- show outbox count consistently
- show offline status before screen actions
- route to outbox and action recovery
- keep queued critical actions visible
- avoid implying queued actions are complete
- keep scan and proof screens explicit about online authority

Operations shell must not:

- silently drop queued actions
- auto-submit sensitive retries without user context
- show sender-only payment controls
- show admin-only finance controls
- let role switch occur in the middle of critical submit

### Role Boundary Rules
A station operator must not see:

- driver run acceptance tabs
- courier earnings tabs
- admin finance tabs

A driver must not see:

- station intake queues
- destination receipt screens unless assigned by route
- courier proof completion tabs
- admin views

A final-mile courier must not see:

- station inbound or outbound queues
- driver intercity run controls
- finance tools
- admin override controls

If user has multiple roles:

- choose the last selected approved role after sign-in
- provide an explicit role switcher only when backend claims allow it
- role switching clears role-local navigation stack
- role switching must not clear offline outbox records
- role switching must never bypass route guard

## Admin Web Shell
### Purpose
`AdminWebShell` frames the desktop-heavy admin console.

Admin jobs:

- overview
- launch readiness
- delivery explorer
- package detail
- issue queue
- pricing rules
- finance
- refunds
- users
- stations
- audit
- notifications
- settings

### React Router Shape
Recommended route structure:

```text
apps/admin/src/routes/root.tsx
apps/admin/src/routes/AdminShell.tsx
apps/admin/src/routes/AuthShell.tsx
apps/admin/src/routes/NotAuthorizedRoute.tsx
apps/admin/src/features/admin-overview
apps/admin/src/features/deliveries
apps/admin/src/features/finance
apps/admin/src/features/issues
apps/admin/src/features/stations
apps/admin/src/features/users
apps/admin/src/features/settings
```

Admin shell should use layout routes and nested outlets so all admin pages share navigation, breadcrumbs, route guards, and error boundaries.

### Admin Navigation
Approved launch navigation:

- `Overview`
- `Deliveries`
- `Stations`
- `Finance`
- `Issues`
- `Users`
- `Settings`

Secondary admin routes:

- launch readiness
- package detail
- payment reconciliation
- refund queue
- webhook events
- audit events
- notifications
- pricing rules
- SLA breach dashboard

### Admin Chrome
Sidebar:

- persistent on desktop
- collapsible only if content density benefits
- role-gated items
- active section

Top bar:

- environment label when not production
- user role
- global search only when implemented
- notification entry
- settings
- sign out

Content:

- breadcrumb
- page heading
- route actions
- filters
- table content or detail layout

Global notices:

- stale data
- session expiry warning
- maintenance status
- critical backend readiness warning

### Admin Rules
Admin shell must:

- hide nav items the user cannot access
- enforce route guard even when nav item is hidden
- show not-authorized state for direct URL attempts
- show session-expired state when auth context fails
- preserve table filters across safe route navigation where screen owns it
- keep admin pages keyboard navigable
- keep `main` landmark unique

Admin shell must not:

- expose provider credentials
- expose backend secrets
- expose raw webhook payloads
- mutate admin resources from navigation
- show disabled items for roles unless discoverability policy says to
- treat hidden nav as security

## Auth Shell
### Purpose
`AuthShell` frames sign-in, invite acceptance, account recovery, and permission-denied entry points across mobile, web, and admin.

Required qualities:

- minimal chrome
- no role-specific app navigation before auth
- privacy-safe copy
- clear route to recovery
- safe return route handling
- account enumeration protection

Auth shell owns:

- auth provider context
- safe return path validation
- session bootstrap
- invite token context
- global auth loading state

Auth shell must not:

- show protected navigation
- reveal account existence
- show previous protected screen content behind auth
- keep sensitive route params in visible copy

## Maintenance Shell
### Purpose
`MaintenanceShell` frames public or admin service interruption states.

Required qualities:

- static and fast
- minimal dependencies
- clear affected surface
- support route
- timestamp or status if available
- no auth-only content

Maintenance shell must not:

- show stale protected data
- expose backend health internals
- show admin navigation when auth is unavailable
- auto-refresh aggressively

## Route Guard Contract
Route guards must be shell-aware but backend-aligned.

Guard inputs:

- auth status
- user role
- capability set
- station scope
- assignment scope
- route params
- public verification token state
- maintenance state

Guard outputs:

- render child route
- redirect to auth
- render not authorized
- render session expired
- render tracking access denied
- render maintenance
- render loading

Guard rules:

- Client guards are user experience and safety boundaries, not the source of authority.
- Backend must still enforce every protected endpoint.
- Guards must not infer permissions from route names alone.
- Guards must not show protected route content while auth is resolving.
- Guards must not pass secrets in navigation state.
- Guards must not preserve unsafe return URLs.

## Global Provider Contract
Root shell providers:

- design tokens
- theme
- localization
- analytics
- error boundary
- auth context
- API client
- RTK Query store
- offline detector
- outbox provider for mobile operations
- notification provider
- route announcement provider

Provider rules:

- Provider ordering must be deterministic.
- Auth must initialize before protected route content renders.
- API client must include request ID handling.
- Analytics must never block route navigation.
- Error boundary must show shared error state.
- Offline provider must not override screen-specific online requirements.

## Navigation Rules
### Top-Level Limit
No role should need more than `2` navigation hops to reach its primary action surface.

### No Orphans
Every implemented route must map to:

- a screen in the inventory
- a modal flow in the inventory
- a shared infrastructure item
- or an explicit non-UI backend process

### No Cross-Role Drift
Navigation labels must reflect jobs, not backend services.

Use:

- `Home`
- `Create`
- `History`
- `Support`
- `Assigned Runs`
- `Outbound`
- `Inbound`
- `Handoffs`
- `Finance`
- `Issues`

Avoid:

- internal service names
- database collection names
- provider adapter names unless admin integration context requires them
- raw role claim names in user-facing labels

### Deep Links
Deep links must:

- route through shell guard
- validate route params
- avoid exposing protected data while loading
- show safe denied state when access fails
- preserve safe return route only

Deep links must not:

- bypass auth
- bypass phone verification
- bypass station scope
- bypass assignment scope
- pass OTP or proof tokens in the URL

## Responsive Rules
### Public Web
Mobile:

- collapsed menu
- one primary action
- no horizontal scroll
- footer policy links grouped

Desktop:

- full public nav
- constrained content width
- route-specific layout

### Sender Mobile
Phone:

- bottom tabs
- large primary actions above safe area
- no admin sidebar patterns

Tablet:

- allow wider content but keep mobile mental model
- no forced desktop admin shell

### Operations Mobile
Phone:

- bottom tabs
- high-contrast status
- outbox visible
- primary actions clear of home indicator

Tablet:

- split panes allowed only for detail-plus-list when role workflow benefits
- scanning and proof actions remain primary

### Admin Web
Mobile:

- admin remains usable for emergency read or approval only if screen supports it
- sidebar collapses into drawer
- tables become cards or horizontal-safe layouts by screen spec

Desktop:

- sidebar
- top bar
- breadcrumbs
- dense tables
- keyboard-first command paths

## Accessibility
Required shell accessibility:

- skip link to main content
- one `main` landmark per routed page
- public and admin pages use `header`, `nav`, `main`, and `footer` appropriately
- multiple `nav` landmarks must have unique labels
- route changes announce page title or heading
- focus moves to route heading or stays stable according to platform convention
- mobile tab items have text labels and accessible names
- active tab state is exposed
- disabled navigation item state is exposed only if item is visible
- global banners use status semantics without stealing focus
- shell drawers trap focus only while open
- escape closes web drawers when open
- reduced motion is respected
- text scaling does not break shell chrome
- target sizes support field use

Screen content must never be hidden behind:

- bottom tabs
- floating action buttons
- admin sidebars
- banners
- safe-area overlays

## Localization
Shell text must be localization-ready.

Rules:

- Use string keys for navigation labels.
- Keep labels short enough for future Twi and Ewe expansion.
- Do not bake English grammar into route composition.
- Format dates, time, currency, and phone through shared localization utilities.
- Avoid icon-only navigation because labels may need language-specific clarity.
- Keep route titles separate from URLs.

Launch language:

- English.

Future-ready languages:

- Twi.
- Ewe.

## Analytics
Shell-level events:

### `shell_loaded`
Fire once when a shell becomes active.

Properties:

- `shell`
- `surface`
- `role`
- `auth_state`
- `offline_state`
- `app_version`

### `shell_navigation_clicked`
Fire when a top-level navigation item is activated.

Properties:

- `shell`
- `surface`
- `role`
- `nav_item`
- `from_route`
- `to_route`

### `shell_guard_blocked`
Fire when a route guard blocks access.

Properties:

- `shell`
- `route_family`
- `block_reason`
- `role`
- `auth_state`

### `shell_offline_status_changed`
Fire when mobile operations shell changes online/offline status.

Properties:

- `shell`
- `role`
- `previous_status`
- `next_status`
- `outbox_count_bucket`

Do not send:

- OTP
- auth token
- raw phone
- full tracking code
- provider reference
- full station scope details
- sensitive route params
- notification content

## Error Boundary Rules
Each shell must have a route-level error boundary.

Public:

- show public-safe error state
- keep public header and footer if shell is safe

Receiver:

- show receiver-safe error
- do not expose tracking details before verification

Sender:

- show sender-safe error
- keep bottom navigation only if session remains valid

Operations:

- show field-safe error
- keep outbox access if local store is available
- keep role context visible

Admin:

- show admin route error
- keep admin shell if authenticated
- show request ID when available

## Loading And Boot Rules
Root boot sequence:

1. Load shell-critical fonts and tokens.
2. Initialize auth context.
3. Initialize API client.
4. Initialize route guard.
5. Render shell frame.
6. Render route loading state.
7. Render route content.

Rules:

- Shell frame should load before screen data where possible.
- Protected content must not render before auth guard resolves.
- Public shell should not wait for admin or mobile dependencies.
- Admin shell should not wait for screen-specific tables to render sidebar.
- Operations shell should initialize offline outbox before field screens render.
- Route skeletons belong to screens unless the route itself cannot mount.

## Security Rules
Shells must never:

- expose bearer tokens
- expose auth claims in visible UI beyond safe role labels
- put verification tokens in URLs
- put OTP values in navigation state
- put full provider references in global navigation
- keep protected screen content visible after sign-out
- show admin nav to non-admin users
- rely on hidden nav for security
- decide backend permission authority alone
- cache protected admin content in public shell
- allow role switch to bypass guard

Shells must:

- clear sensitive local state on sign-out
- validate safe return URLs
- treat unknown role as no access
- route expired sessions to session-expired state
- route missing permissions to not-authorized state
- keep public receiver state delivery-scoped

## Implementation File Guidance
Recommended paths:

```text
apps/web/src/shells/PublicWebShell.tsx
apps/web/src/shells/ReceiverPublicShell.tsx
apps/web/src/shells/MaintenanceShell.tsx
apps/web/src/routes/publicRoutes.tsx
apps/web/src/routes/receiverRoutes.tsx
apps/mobile/src/app/_layout.tsx
apps/mobile/src/app/(auth)/_layout.tsx
apps/mobile/src/app/(sender)/_layout.tsx
apps/mobile/src/app/(sender)/(tabs)/_layout.tsx
apps/mobile/src/app/(ops)/_layout.tsx
apps/mobile/src/app/(ops)/station/_layout.tsx
apps/mobile/src/app/(ops)/driver/_layout.tsx
apps/mobile/src/app/(ops)/courier/_layout.tsx
apps/mobile/src/components/shells/SenderMobileShell.tsx
apps/mobile/src/components/shells/OpsMobileShell.tsx
apps/admin/src/routes/AdminShell.tsx
apps/admin/src/routes/AuthShell.tsx
apps/admin/src/routes/adminRoutes.tsx
apps/admin/src/components/shells/AdminSidebar.tsx
apps/admin/src/components/shells/AdminTopBar.tsx
```

If the codebase chooses different paths, keep the same boundaries:

- shell components in shell folders
- route guards separate from visual chrome
- navigation config typed and tested
- screen content outside shell components

## Navigation Config Contract
Recommended shared type:

```ts
type ShellNavigationItem = {
  id: string;
  labelKey: string;
  href: string;
  iconName?: string;
  requiredRoles?: string[];
  requiredCapabilities?: string[];
  surface: "public_web" | "receiver_public" | "sender_mobile" | "ops_mobile" | "admin_web";
  priority: "primary" | "secondary" | "hidden_in_pilot";
};
```

Navigation config rules:

- All visible items must map to inventory screens.
- Hidden pilot items must not render.
- Role requirements must be explicit.
- Capabilities must be checked even when role matches.
- Labels use localization keys.
- Tests cover every visible item for every role shell.

## State And Store Rules
Shell state:

- auth status
- role selection
- nav open or closed
- global notice visibility
- online or offline status
- outbox count
- notification count
- active route metadata

Screen state:

- form values
- table filters
- selected delivery
- payment status
- proof capture state
- issue workflow
- refund workflow
- reconciliation rows
- scan camera state

Shared service state:

- API cache
- auth profile
- notifications
- outbox queue
- feature flags

Do not store screen data in shell just because several screens need it. Use API cache or feature-level state.

## QA Acceptance Criteria
Functional acceptance:

- Public routes render in `PublicWebShell`.
- Receiver routes render in `ReceiverPublicShell`.
- Sender routes render in `SenderMobileShell`.
- Station routes render in station variant of `OpsMobileShell`.
- Driver routes render in driver variant of `OpsMobileShell`.
- Final-mile routes render in courier variant of `OpsMobileShell`.
- Admin routes render in `AdminWebShell`.
- Auth routes render without protected navigation.
- Maintenance route renders without protected content.
- Unknown role cannot access protected shell.
- Hidden pilot navigation items do not render.
- Direct URL access still runs route guard.
- Sign-out clears protected shell content.
- Operations outbox indicator remains available when offline.
- Admin sidebar hides disallowed sections.
- Public shell never shows admin or operations links.

Visual acceptance:

- Public shell first viewport is clean and trustworthy.
- Receiver shell is minimal and privacy-focused.
- Sender bottom tabs do not cover primary CTAs.
- Operations shell makes role and sync state visible.
- Admin shell supports dense tables without cramped chrome.
- Mobile menu and admin drawer are not visually interchangeable.
- Shell banners do not push critical actions off screen.

Accessibility acceptance:

- Skip link works on public and admin web.
- One `main` landmark exists per route.
- Navigation landmarks have unique labels.
- Active navigation item is announced.
- Route changes announce page title or heading.
- Drawer focus is trapped while open.
- Escape closes web drawer.
- Mobile tabs have labels.
- Text scaling does not break nav.
- Reduced motion is respected.

Security acceptance:

- Protected route content does not flash before auth resolves.
- Navigation hiding is not the only access control.
- Unsafe return URLs are rejected.
- Verification tokens are not stored in URL.
- OTP values are not stored in navigation state.
- Protected content is cleared after sign-out.
- Admin nav is never shown to non-admin roles.

## Test Plan
Unit tests:

- navigation config returns correct public items
- navigation config returns correct sender items
- navigation config returns correct station items
- navigation config returns correct driver items
- navigation config returns correct courier items
- navigation config returns correct admin items by role
- hidden pilot items are excluded
- route guard maps unauthenticated to auth
- route guard maps missing role to not authorized
- route guard maps expired session to session expired
- safe return URL validator rejects external or unsafe values
- shell analytics payload excludes sensitive route params

Integration tests:

- public landing loads public shell
- receiver OTP route loads receiver shell
- sender home loads sender shell after auth
- station overview loads station shell
- driver assigned runs loads driver shell
- courier assigned route loads courier shell
- admin overview loads admin shell
- admin finance nav hidden for non-finance roles
- outbox indicator updates in operations shell
- sign-out removes protected shell content
- direct admin URL without role shows not authorized

Accessibility tests:

- public shell skip link moves focus to main
- admin shell skip link moves focus to main
- admin drawer focus trap works
- route announcement fires once
- mobile tabs expose label and selected state
- status banner announced without stealing focus

Performance tests:

- shell frame renders before screen data where allowed
- public shell does not load admin bundle
- admin shell does not load mobile-only modules
- mobile sender shell does not load station-only routes until needed
- operations outbox provider does not block non-ops sender shell

## Content QA Checklist
Before closing implementation, verify:

- Shell names match inventory surfaces.
- Navigation items match `navigation-map.md`.
- Hidden pilot items are not visible.
- Shell does not own screen mutation logic.
- Route guards use backend-aligned roles and capabilities.
- Public shell remains public-safe.
- Receiver shell remains delivery-scoped.
- Sender shell does not expose operations tools.
- Operations shell shows role and outbox state.
- Admin shell is desktop-first and role-gated.
- Landmarks and skip links are present.
- Route announcements work.
- Analytics excludes sensitive values.

## Implementation Notes For Claude Code
Build shell infrastructure before building deep screen UI so every screen lands in the correct frame from day one.

Implementation sequence:

1. Create typed navigation config.
2. Create route guard utilities.
3. Create public web shell.
4. Create receiver public shell.
5. Create mobile root layout.
6. Create sender mobile shell and sender tabs.
7. Create operations mobile shell and role tabs.
8. Create admin web shell.
9. Add shell-level error boundaries.
10. Add skip links and route announcer.
11. Add shell analytics.
12. Add tests for every shell and role.

Do not implement screen content inside the shell work. Each screen spec owns its own route body.

## Completion Standard
This spec is complete when Claude Code can build the Kra shell system without asking:

- which shells exist
- which repo target owns each shell
- which routes belong in each shell
- which navigation items are visible
- how role-aware operations shells differ
- how public and receiver shells differ
- where route guards live
- which data shell can read
- which data shell must not read
- how accessibility landmarks work
- how shell analytics avoids sensitive data
- how shell tests prove role separation

The shell system is production-ready only when every screen has a correct frame, every role sees only its own work, and the user always knows where they are before they act.
