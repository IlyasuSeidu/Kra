# Admin Settings Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminSettings` |
| Route | `/admin/settings` |
| Test id | `screen-admin-settings` |
| Surface | Admin web console |
| Backend coverage | Admin auth state, local admin preferences, role-aware system links; no dedicated admin config endpoint exists yet |
| Offline critical | No |
| Required read role | `ops_admin`, `finance_admin`, `support_admin`, or `super_admin` |
| Required action role | Local preference changes only; backend actions route to dedicated governed screens |
| Required states | `loading`, `ready`, `saving_local`, `local_saved`, `local_save_failed`, `partial_links`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | Admin shell navigation, `AdminOverview` |
| Related screens | `AdminOverview`, `AdminLaunchReadiness`, `AdminStations`, `AdminUsers`, `AdminPricingRules`, `AdminAuditEvents`, `AdminOutboundNotifications`, `AdminWebhookEvents`, `AdminAnalytics`, `AdminExportReport` |

## Purpose
`AdminSettings` is the admin web command center for workspace preferences, account context, safe system links, release-readiness references, and security boundaries.

The screen should answer:
- `Which admin account and role am I using?`
- `Which admin routes are available for my role?`
- `Which settings are local browser preferences only?`
- `Which system controls are owned by dedicated governed screens?`
- `Where do I go to manage users, stations, pricing, launch readiness, webhooks, notifications, audits, analytics, and exports?`
- `Which backend configuration is intentionally not editable here?`
- `How do I sign out safely?`
- `What should I do when I do not have permission for a system area?`
- `What release, environment, and support links should an admin use during pilot operations?`

This screen is not a hidden super-user console. It must not edit secrets, provider credentials, payment callbacks, pricing formulas, country packs, status enums, permissions logic, feature flags, deployment settings, refund policy, station status, user roles, or any operational backend state directly.

## Strategic Role
Admin settings often become a dumping ground for dangerous controls. Kra cannot afford that. This screen must make the admin console easier to operate while keeping high-impact product controls in their dedicated, auditable screens.

The screen should help an admin move quickly to the correct surface:
- user and role management
- station status and validation
- pricing rules
- finance and reconciliation
- issue operations
- audit events
- outbound notifications
- webhook events
- analytics
- exports
- launch readiness

It should also make local preference boundaries clear. If a setting affects only the browser, say so. If a setting requires backend work, route to the right screen or show a disabled row with a clear reason.

## Audience
Primary users:
- super admins managing system-level navigation and privileged routes
- ops admins working launch readiness, stations, custody risk, and operational alerts
- finance admins working pricing, finance, refunds, reconciliation, and webhook review
- support admins working issue queues, notification review, and support routes

Secondary users:
- engineering leads reviewing admin coverage
- QA reviewers validating role-gated navigation
- security reviewers checking that secrets and privileged actions are not exposed
- Claude Code implementing the admin frontend later

Non-users:
- senders
- receivers
- drivers
- station operators
- final-mile couriers
- public web visitors

## Backend Reality
There is no dedicated admin settings or admin config endpoint in v1.

Implemented admin endpoints that this screen can link to:
- `GET /v1/admin/overview`
- `GET /v1/admin/launch-readiness`
- `GET /v1/admin/deliveries`
- `GET /v1/admin/stations`
- `POST /v1/admin/stations/:id/status`
- `POST /v1/admin/stations/:id/validation`
- `GET /v1/admin/pricing-rules`
- `POST /v1/admin/pricing-rules/active`
- `GET /v1/admin/users`
- `POST /v1/admin/users`
- `POST /v1/admin/users/:id/access`
- `GET /v1/admin/finance`
- `GET /v1/admin/payment-reconciliation`
- `GET /v1/admin/audit-events`
- `GET /v1/admin/outbound-notifications`
- `GET /v1/admin/webhook-events`

Implemented auth and permission facts:
- admin roles are `ops_admin`, `finance_admin`, `support_admin`, and `super_admin`
- admin auth method is `email_password_mfa`
- admin session TTL is `8 hours`
- `super_admin` owns user provisioning and all privileged actions
- `finance_admin` owns pricing, refunds, and reconciliation review
- `ops_admin` owns operational overrides, station status, custody risk, and delivery operations
- `support_admin` owns issue threads and escalation

Runtime configuration facts:
- backend secrets are loaded from server environment variables
- public client configuration is separated from backend secret configuration
- provider credentials must remain backend-only
- deployment validation uses command-line checks and CI gates
- new environments may use launch bootstrap scripts

Current backend limits:
- No `/v1/admin/settings` route exists.
- No `/v1/admin/config` route exists.
- No admin feature-flag endpoint exists.
- No backend preference endpoint exists.
- No admin theme endpoint exists.
- No admin notification preference endpoint exists.
- No provider credential management endpoint exists.
- No country-pack management endpoint exists.
- No release management endpoint exists.
- No production secret status endpoint exists.
- No global policy mutation endpoint exists.
- No in-app deployment control endpoint exists.

Therefore:
- The screen can save only safe local preferences.
- The screen can show role-aware links.
- The screen can show app version and environment label if already available to the client.
- The screen can show documented configuration boundaries.
- The screen must route backend work to dedicated screens.
- The screen must not call non-existent settings endpoints.

## Source References
External references used for this screen:
- [Microsoft Learn guidelines for app settings](https://learn.microsoft.com/en-us/windows/apps/design/app-settings/guidelines-for-app-settings): supports simple settings pages, grouped settings, limited settings count, clear link rows, and immediate local updates.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/): supports key-value rows for account, environment, version, and system metadata.
- [WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): supports accessible expandable sections when settings groups need compression.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing local save, errors, loading, and refresh states without unexpected focus movement.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable activation targets for rows, buttons, links, and toggles.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports audit-aware event treatment and excluding sensitive values from logs.
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html): supports not exposing secrets in client settings, auditing secret access, and keeping provider credentials out of web UI.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework/privacy-framework): supports privacy risk governance and disciplined data handling around admin surfaces.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/admin-dashboard-spec.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/12-engineering/environment-variables.md`
- `docs/12-engineering/deployment-runbook.md`
- `docs/14-platform/ci-cd-governance.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/14-platform/country-expansion-strategy.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/config.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Design Thesis
Design this as an admin operations console index: calm, precise, role-aware, and guarded. It should feel like a secure control room directory with personal workspace controls at the top and governed system links underneath.

Visual direction:
- high-trust enterprise settings page
- strong section grouping
- restrained neutral background
- compact but readable cards
- clear status badges
- explicit permission affordances
- route rows with owner labels
- local-only preference labels
- no decorative dashboard fragments

Restraint rule:
- Do not add global toggles, backend controls, or broad configuration forms without implemented endpoints and audit rules. Use links, disabled rows, and plain boundary copy instead.

## Product Principle
Settings should clarify control, not create hidden power.

Every row must state one of these scopes:
- `Local preference`
- `System link`
- `Governed screen`
- `Read-only context`
- `Unavailable in v1`

If a row affects backend state, it must not be handled on this screen. It must navigate to the dedicated screen that already owns permissions, validation, confirmation, and audit behavior.

## Information Architecture
Desktop structure:
- Admin shell and breadcrumb.
- Page header with account, role, and session state.
- Quick status card for current admin context.
- Local preferences section.
- Role-aware system links section.
- Security and access section.
- Operations links section.
- Finance links section.
- Support links section.
- Platform and release section.
- About and legal section.
- Sign out section.

Tablet structure:
- Header stack.
- Two-column cards when width supports it.
- Single-column grouped settings list at narrow widths.
- Sticky section index only when it does not reduce content readability.

Mobile web fallback:
- Single-column settings rows.
- No hover-only affordances.
- Primary account context appears first.
- Sign out remains separated at bottom.
- Disabled rows stay readable with reason text.

Recommended sections:
1. `Account`
2. `Workspace`
3. `System links`
4. `Security and access`
5. `Operations`
6. `Finance`
7. `Support`
8. `Platform`
9. `About`
10. `Sign out`

## Routing
Primary route:
```text
/admin/settings
```

Optional query parameters:
- `section=account`
- `section=workspace`
- `section=system`
- `section=security`
- `section=operations`
- `section=finance`
- `section=support`
- `section=platform`
- `section=about`

Query behavior:
- If `section` is valid, scroll or focus the section heading after route hydration.
- If `section` is invalid, render default top position and clear the invalid query only if router policy allows.
- Do not fetch additional backend data because of section query alone.

Entry routes:
- admin shell settings item
- profile or account menu in admin header
- permission-denied screen recovery link
- session-expired screen recovery link after reauth
- admin overview footer link
- admin export report completion link

Exit routes:
- `/admin`
- `/admin/launch-readiness`
- `/admin/stations`
- `/admin/users`
- `/admin/pricing-rules`
- `/admin/finance`
- `/admin/payment-reconciliation`
- `/admin/issues`
- `/admin/audit-events`
- `/admin/outbound-notifications`
- `/admin/webhook-events`
- `/admin/analytics`
- `/admin/exports/new`
- `/admin/sign-in`

## Screen Contract
`AdminSettings` must provide:
- account identity summary
- role and capabilities summary
- session state summary
- local preference controls
- role-aware route directory
- permission explanations for unavailable routes
- environment and version context when client-safe
- security boundaries for secrets and backend configuration
- support and runbook links
- safe sign-out

`AdminSettings` must not provide:
- direct station status mutation
- direct station validation mutation
- direct user role mutation
- direct pricing mutation
- direct refund approval
- direct refund settlement
- direct reconciliation action
- direct webhook replay
- direct notification retry
- direct delivery reassignment
- direct issue escalation or resolution
- secret viewing
- provider credential editing
- payment callback editing
- global policy editing
- country pack editing
- release deployment controls

## Data Sources
Required client-side sources:
- authenticated admin profile from auth shell
- admin role claim
- known capability map from shared permissions
- current route registry
- client app version if build exposes it safely
- public client environment label if build exposes it safely
- local admin preference store

Optional read sources:
- `GET /v1/admin/overview` only if the shell already loads it or a lightweight status card needs freshness
- do not call overview only to render static settings rows unless product decides it adds value

Local storage keys:
- `kra.admin.settings.density`
- `kra.admin.settings.defaultLanding`
- `kra.admin.settings.showDenseTables`
- `kra.admin.settings.reduceMotionPreference`
- `kra.admin.settings.timeDisplay`
- `kra.admin.settings.copyFormat`
- `kra.admin.settings.lastVisitedSection`

Do not store:
- access tokens
- refresh tokens
- Firebase tokens
- provider references
- phone numbers
- delivery IDs
- payment IDs
- raw audit payloads
- raw webhook payloads
- support notes
- proof asset links
- role grants
- station override notes
- pricing draft data

## Local Preference Model
```ts
type AdminSettingsDensity = "comfortable" | "compact";
type AdminSettingsLanding = "overview" | "launch_readiness" | "issue_queue" | "analytics";
type AdminSettingsMotion = "system" | "reduced";
type AdminSettingsTimeDisplay = "absolute" | "relative_with_absolute";
type AdminSettingsCopyFormat = "plain" | "markdown";

interface AdminLocalSettings {
  density: AdminSettingsDensity;
  defaultLanding: AdminSettingsLanding;
  showDenseTables: boolean;
  reduceMotionPreference: AdminSettingsMotion;
  timeDisplay: AdminSettingsTimeDisplay;
  copyFormat: AdminSettingsCopyFormat;
  updatedAt: string;
}
```

Default values:
- `density`: `comfortable`
- `defaultLanding`: `overview`
- `showDenseTables`: `false`
- `reduceMotionPreference`: `system`
- `timeDisplay`: `relative_with_absolute`
- `copyFormat`: `plain`

Persistence:
- Use local storage or the admin app preference store.
- Version the stored value to allow future migrations.
- Validate stored values before applying them.
- If local value fails validation, reset to defaults and show a non-blocking warning.
- Do not sync preferences to backend until a real endpoint exists.

## Account Section
Purpose:
- Show who is signed in.
- Show role and access scope.
- Show session behavior.
- Provide sign-out route context without placing sign out too early.

Rows:
- Admin name
- Admin email if available
- Admin phone if available and policy allows
- Role
- Auth method
- Session duration
- Active environment label
- App version
- Last local settings update

Role copy:
- `ops_admin`: `Operations access for stations, custody risk, issue operations, and launch readiness.`
- `finance_admin`: `Finance access for pricing, payments, refunds, reconciliation, and payment callbacks.`
- `support_admin`: `Support access for issue queues, escalations, notification review, and customer help workflows.`
- `super_admin`: `Full privileged access, including users, roles, and all governed admin areas.`

Session copy:
- Title: `Admin session`
- Body: `Admin sessions expire after 8 hours. Sign in again before changing sensitive routes.`

Unavailable identity copy:
- Title: `Account context unavailable`
- Body: `The admin shell could not read account context. Refresh or sign in again before using settings.`

## Workspace Section
Purpose:
- Allow safe local workspace preferences.
- Keep controls limited to browser behavior.
- Avoid pretending local choices are system policy.

Controls:
- Default landing page
- Display density
- Dense admin tables
- Motion preference
- Time display
- Copy format

Default landing page:
- Type: select or radio group
- Values:
  - `Overview`
  - `Launch readiness`
  - `Issue queue`
  - `Analytics`
- Scope label: `Local preference`
- Behavior: changes next admin shell home route only for this browser.
- Do not route immediately after selection.

Display density:
- Type: segmented control or radio group
- Values:
  - `Comfortable`
  - `Compact`
- Scope label: `Local preference`
- Behavior: updates spacing tokens in admin lists and cards where supported.

Dense admin tables:
- Type: switch
- Values:
  - on
  - off
- Scope label: `Local preference`
- Behavior: applies to table-heavy admin screens that support density.
- Disabled reason: `This table does not support compact rows yet.`

Motion preference:
- Type: select or radio group
- Values:
  - `Use system`
  - `Reduce motion`
- Scope label: `Local preference`
- Behavior: respects `prefers-reduced-motion`; local reduced motion can only further reduce motion.

Time display:
- Type: select or radio group
- Values:
  - `Relative with exact time`
  - `Exact time only`
- Scope label: `Local preference`
- Behavior: affects visible timestamp formatting only.

Copy format:
- Type: select or radio group
- Values:
  - `Plain text`
  - `Markdown`
- Scope label: `Local preference`
- Behavior: affects copy buttons for issue IDs, delivery IDs, and report summaries where supported.

Save behavior:
- Changes save immediately to local store after validation.
- Show inline save status using `role=status`.
- Never require a global `Save all` button for local preferences.
- If storage fails, keep in-memory value for the session and show recovery copy.

## System Links Section
Purpose:
- Provide a clear route directory to governed system areas.
- Make role access visible.
- Prevent settings from duplicating each screen.

Layout:
- Use grouped link cards.
- Each link row includes label, description, owner role, status, and route.
- If role lacks access, keep row visible but disabled with a reason.
- If route is not implemented, mark as `Unavailable in v1`.

Required link groups:
- Launch
- Operations
- Finance
- Support
- Security
- Reporting
- Platform

Launch links:
- `Launch readiness` routes to `/admin/launch-readiness`
- `Analytics` routes to `/admin/analytics`
- `Export report` routes to `/admin/exports/new`

Operations links:
- `Delivery explorer` routes to `/admin/deliveries`
- `Stations` routes to `/admin/stations`
- `SLA breaches` routes to `/admin/sla-breaches`
- `Webhook events` appears under finance and platform, not operations-only

Finance links:
- `Finance summary` routes to `/admin/finance`
- `Pricing rules` routes to `/admin/pricing-rules`
- `Payment reconciliation` routes to `/admin/payment-reconciliation`
- `Refund review` routes to `/admin/refunds`

Support links:
- `Issue queue` routes to `/admin/issues`
- `Outbound notifications` routes to `/admin/outbound-notifications`
- `Notification detail` is not linked without a selected notification ID

Security links:
- `Users` routes to `/admin/users`
- `Audit events` routes to `/admin/audit-events`
- `Permissions guide` routes to internal documentation only if documentation is exposed in the admin shell

Platform links:
- `Deployment runbook` opens internal runbook location when configured
- `Environment variables guide` opens internal runbook location when configured
- `Observability guide` opens internal runbook location when configured
- If docs are not wired into the app, show copy that they are repository docs.

## Role-Aware Link Rules
All admin roles can view:
- overview
- launch readiness
- delivery explorer
- station list
- issue queue when backend allows authenticated issue access
- audit events if backend permits admin read
- analytics
- export report, scoped by selected report type
- settings

`ops_admin` primary links:
- overview
- launch readiness
- delivery explorer
- station list
- station validation
- station status override
- blocked delivery queue
- SLA breaches
- issue queue
- audit events
- analytics
- export report

`finance_admin` primary links:
- overview
- finance summary
- pricing rules
- pricing rule edit
- payment reconciliation
- refund review
- refund settlement
- refund evidence review
- webhook events
- audit events
- analytics
- export report

`support_admin` primary links:
- overview
- issue queue
- issue detail
- outbound notifications
- notification detail
- audit events
- delivery explorer
- analytics
- export report

`super_admin` primary links:
- all admin areas
- users
- user detail
- user access
- pricing rules
- stations
- refunds
- audit events
- platform links

Unavailable row pattern:
- Badge: `No access`
- Body: `Your current role cannot open this area. Ask a super admin if your responsibilities changed.`
- Action: disabled link
- Secondary action: `View permission boundary` if permission guidance route exists

## Security And Access Section
Purpose:
- Make security boundaries explicit.
- Help admins understand why some controls are not available.
- Keep secrets out of the client.

Rows:
- `Admin roles`
- `Session length`
- `MFA requirement`
- `Privileged actions`
- `Secret management`
- `Audit trail`
- `Production access`

Admin roles row:
- Scope: `Read-only context`
- Copy: `Admin access is split across operations, finance, support, and super-admin roles.`
- Route: `/admin/users` for `super_admin`; disabled for other roles.

Session length row:
- Scope: `Read-only context`
- Copy: `Admin sessions use an 8 hour TTL. Sensitive routes should recover through sign-in when expired.`

MFA row:
- Scope: `Read-only context`
- Copy: `Admin roles use email, password, and MFA.`

Privileged actions row:
- Scope: `Governed screen`
- Copy: `Station overrides, pricing edits, user access, refunds, and issue resolution are handled on dedicated screens.`

Secret management row:
- Scope: `Unavailable in v1`
- Copy: `Provider credentials and backend secrets are managed through secure infrastructure, not the admin web client.`
- Status: disabled

Audit trail row:
- Scope: `System link`
- Route: `/admin/audit-events`
- Copy: `Review privileged admin actions and operational changes.`

Production access row:
- Scope: `Read-only context`
- Copy: `Deployment and production access are governed outside the web console by CI, runbooks, and cloud IAM.`

## Platform Section
Purpose:
- Show safe environment and release context.
- Avoid exposing runtime secrets.
- Route admins to runbooks and observability.

Allowed fields:
- client app version
- build commit short SHA if public-safe
- public environment label
- API base URL host only if already public and safe
- release channel
- Sentry project label only if public-safe
- documentation status

Do not show:
- Firebase service account email
- Firebase private key
- Firebase storage bucket if not public-safe
- MTN MoMo base secret values
- MTN MoMo collection key
- MTN MoMo API user
- MTN MoMo API key
- webhook shared secret
- Hubtel SMS client ID
- Hubtel SMS client secret
- internal task shared secret
- raw environment object
- cloud project internal names if not approved for client display

Environment copy:
- Title: `Environment`
- Body: `This label is safe client context. Backend secrets are never displayed here.`

Provider config copy:
- Title: `Provider credentials`
- Body: `Payment, SMS, storage, and internal task credentials are backend-only. Use deployment runbooks and cloud IAM for setup.`

Launch bootstrap copy:
- Title: `Launch data`
- Body: `Launch station defaults and active pricing are bootstrapped from backend scripts, then governed by admin station and pricing screens.`

## About Section
Purpose:
- Give admins stable product and support context.
- Keep legal and help links easy to find.

Rows:
- `Kra admin`
- `Version`
- `Privacy`
- `Terms`
- `Support`
- `Documentation`
- `System status`

About row copy:
- `Kra admin controls launch readiness, delivery operations, payments, support, analytics, and governed system records.`

Legal links:
- Privacy routes to public privacy page if present.
- Terms routes to public terms page if present.
- Links open in the same app shell if internal, new tab only if external.

Support link:
- For internal support, route to issue queue or support playbook.
- If no support playbook URL is configured, show disabled row with copy.

System status:
- Link to observability dashboard only when a safe URL is configured.
- Do not expose cloud console URLs to users without access.

## Sign Out Section
Purpose:
- Provide a safe exit from admin session.
- Separate sign out from navigation rows to avoid accidental activation.

Layout:
- Bottom section with strong visual separation.
- Body explains what sign out does.
- Primary action: `Sign out`
- Secondary action: `Stay signed in`

Sign-out confirmation:
- Use a confirmation dialog or sheet.
- Dialog title: `Sign out of admin?`
- Body: `You will need to sign in again before using admin tools. Local display preferences stay on this browser.`
- Confirm: `Sign out`
- Cancel: `Stay signed in`

After sign out:
- Clear auth session through app auth service.
- Keep safe local display preferences.
- Clear any cached admin data that can reveal sensitive operational content.
- Route to `/admin/sign-in`.

Failure copy:
- Title: `Could not sign out`
- Body: `Your session may still be active. Check your connection and try again.`
- Action: `Try again`

## State Model
```ts
type AdminSettingsState =
  | { type: "loading" }
  | { type: "ready"; account: AdminAccountContext; settings: AdminLocalSettings; links: AdminSettingsLinkGroup[] }
  | { type: "saving_local"; account: AdminAccountContext; settings: AdminLocalSettings; pendingField: string }
  | { type: "local_saved"; account: AdminAccountContext; settings: AdminLocalSettings; savedField: string }
  | { type: "local_save_failed"; account: AdminAccountContext; settings: AdminLocalSettings; failedField: string; reason: string }
  | { type: "partial_links"; account: AdminAccountContext; settings: AdminLocalSettings; links: AdminSettingsLinkGroup[]; unavailableCount: number }
  | { type: "not_authorized" }
  | { type: "session_expired" }
  | { type: "api_error"; message: string };
```

Supporting types:
```ts
interface AdminAccountContext {
  adminId: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role: "ops_admin" | "finance_admin" | "support_admin" | "super_admin";
  authMethod: "email_password_mfa";
  sessionTtlHours: 8;
}

interface AdminSettingsLink {
  id: string;
  label: string;
  description: string;
  route?: string;
  ownerRole: "ops_admin" | "finance_admin" | "support_admin" | "super_admin" | "all_admins" | "technical_owner";
  scope: "local_preference" | "system_link" | "governed_screen" | "read_only_context" | "unavailable_v1";
  access: "available" | "no_access" | "not_wired";
  disabledReason?: string;
}

interface AdminSettingsLinkGroup {
  id: string;
  title: string;
  description: string;
  links: AdminSettingsLink[];
}
```

## Loading State
Trigger:
- route entered
- auth shell is still resolving account context
- local preference store is hydrating

UI:
- Keep admin shell visible if authenticated shell is available.
- Show page title skeleton.
- Show account card skeleton.
- Show three section skeleton groups.
- Do not show disabled rows until role is known.

Copy:
- `Loading admin settings...`

Accessibility:
- Expose loading text with `role=status`.
- Do not shift focus to skeletons.
- Keep skip link and shell navigation usable if loaded.

## Ready State
Trigger:
- account context is available
- local settings loaded and validated
- link groups computed from role and route registry

UI:
- Render account summary.
- Render local preference controls.
- Render role-aware link groups.
- Render security boundaries.
- Render platform and about rows.
- Render sign-out section.

Success criteria:
- User can identify role and session behavior in the first viewport.
- User can change local preferences without backend calls.
- User can navigate to every relevant governed admin area.
- User can see why unavailable areas are unavailable.

## Saving Local State
Trigger:
- local setting changes
- local store write is pending

UI:
- Keep changed control responsive.
- Show small row-level pending indicator.
- Do not block the whole page.
- Preserve current scroll position.

Copy:
- `Saving to this browser...`

Accessibility:
- Announce via polite live region.
- Do not move focus.

## Local Saved State
Trigger:
- local store write succeeds

UI:
- Show row-level saved status for 2 to 4 seconds.
- Keep selected value visible.
- Allow further changes immediately.

Copy:
- `Saved on this browser.`

Logging:
- Do not send preference values to security logs.
- Product analytics may record field name and result only if analytics policy allows it.

## Local Save Failed State
Trigger:
- local storage unavailable
- quota exceeded
- validation failed
- browser privacy setting blocks storage

UI:
- Keep in-memory selection for current session when safe.
- Show inline error below affected row.
- Provide retry action.
- Do not clear other valid settings.

Copy:
- Title: `Setting was not saved`
- Body: `This browser could not save the preference. The page can keep using it until you leave.`
- Action: `Try again`

Recovery:
- Retry local write.
- Reset one setting to default.
- Reset all local preferences only after confirmation.

## Partial Links State
Trigger:
- route registry cannot resolve one or more links
- documentation URLs are not configured
- client build lacks public environment label

UI:
- Render available links normally.
- Render unavailable links as disabled rows.
- Add section notice.

Copy:
- Title: `Some links are not connected`
- Body: `Available admin routes still work. Missing links need frontend routing or configured documentation URLs.`

## Not Authorized State
Trigger:
- user is authenticated but not an admin role
- auth shell lacks admin role claim

UI:
- Do not render settings content.
- Show admin access denied state.
- Provide route to correct sign-in or account switch.

Copy:
- Title: `Admin settings unavailable`
- Body: `This account does not have an admin role. Sign in with an admin account to continue.`
- Action: `Go to admin sign in`

## Session Expired State
Trigger:
- admin session expires while on settings
- protected route read fails with auth expiry

UI:
- Preserve local preference changes already saved.
- Hide role-specific operational details that require fresh session.
- Show reauthentication action.

Copy:
- Title: `Session expired`
- Body: `Sign in again before using admin settings or opening privileged routes.`
- Action: `Sign in again`

## API Error State
Trigger:
- optional overview freshness call fails
- auth context service returns unexpected error

UI:
- If local settings and role are available, render them.
- Show non-blocking error only for the missing data.
- If account context is not available, show full error state.

Copy:
- Title: `Settings could not fully load`
- Body: `Local preferences may still work, but admin account context needs to refresh.`
- Action: `Refresh`

## Permission Matrix Mapping
| Area | Owner roles | Route | Settings behavior |
| --- | --- | --- | --- |
| Overview | all admin roles | `/admin` | link enabled |
| Launch readiness | all admin roles | `/admin/launch-readiness` | link enabled |
| Delivery explorer | all admin roles | `/admin/deliveries` | link enabled |
| Stations | ops and super primarily | `/admin/stations` | enabled for admins, action gating happens inside station screens |
| Station status override | `ops_admin`, `super_admin` | station detail route | link through station screens only |
| Users | `super_admin` | `/admin/users` | enabled only for super admin |
| Pricing rules | `finance_admin`, `super_admin` | `/admin/pricing-rules` | enabled for finance and super admin |
| Finance summary | `finance_admin`, `super_admin` | `/admin/finance` | enabled for finance and super admin |
| Reconciliation | `finance_admin`, `super_admin` | `/admin/payment-reconciliation` | enabled for finance and super admin |
| Refunds | `finance_admin`, `super_admin` | refund routes | enabled for finance and super admin |
| Issues | support, ops, super primarily | `/admin/issues` | enabled for admin roles with support copy |
| Audit events | all admin roles if backend allows | `/admin/audit-events` | link enabled |
| Outbound notifications | support, ops, super primarily | `/admin/outbound-notifications` | enabled where route exists |
| Webhook events | `finance_admin`, `super_admin` | `/admin/webhook-events` | enabled for finance and super admin |
| Analytics | all admin roles | `/admin/analytics` | link enabled |
| Export reports | all admin roles, scoped by report | `/admin/exports/new` | link enabled |

## Copy System
Page title:
- `Settings`

Page subtitle:
- `Manage admin workspace preferences and open governed system areas. Backend configuration stays in controlled screens and infrastructure.`

Account section title:
- `Account`

Workspace section title:
- `Workspace preferences`

System links section title:
- `System links`

Security section title:
- `Security and access`

Platform section title:
- `Platform context`

About section title:
- `About Kra admin`

Sign-out section title:
- `Sign out`

Local scope label:
- `Local preference`

Governed scope label:
- `Governed screen`

Read-only scope label:
- `Read-only context`

Unavailable scope label:
- `Unavailable in v1`

No access label:
- `No access`

Not wired label:
- `Not connected`

## Visual System
Layout:
- Max content width: `1120px`
- Main grid: `minmax(0, 1fr)` content with optional section index at desktop widths
- Section card radius: existing admin token
- Row height minimum: `56px`
- Dense row minimum: `44px`
- Touch and pointer target minimum: `24px`, prefer `44px` for primary row actions

Hierarchy:
- H1 for page title.
- H2 for sections.
- H3 only inside complex section groups.
- Row labels use strong weight.
- Descriptions use secondary text color with readable contrast.
- Scope badges use subdued tone.
- No more than one accent color per status family.

Status colors:
- ready: neutral or success
- local saved: success
- no access: muted warning
- unavailable: muted neutral
- error: destructive
- security boundary: amber or caution token

Motion:
- Use short opacity and transform transitions only.
- Respect system reduced motion.
- If local reduced motion is selected, reduce further even when system allows motion.
- Do not animate section height aggressively.
- Do not use continuous animation.

## Component Inventory
Required components:
- `AdminSettingsScreen`
- `AdminSettingsHeader`
- `AdminAccountSummaryCard`
- `AdminRoleBadge`
- `AdminSessionSummary`
- `SettingsSection`
- `SettingsSummaryRow`
- `SettingsLinkRow`
- `SettingsSelectRow`
- `SettingsSwitchRow`
- `SettingsSegmentedRow`
- `SettingsScopeBadge`
- `SettingsStatusMessage`
- `SettingsSectionIndex`
- `SettingsBoundaryNotice`
- `SettingsUnavailableRow`
- `SettingsSignOutPanel`
- `SettingsSignOutDialog`
- `SettingsErrorState`
- `SettingsLoadingState`

Component responsibilities:
- `AdminSettingsScreen` composes account, local preferences, link groups, security, platform, about, and sign out.
- `AdminSettingsHeader` handles title, subtitle, and section index anchor.
- `AdminAccountSummaryCard` displays identity, role, session, version, and environment.
- `AdminRoleBadge` renders subrole with safe description.
- `AdminSessionSummary` shows auth method and session TTL.
- `SettingsSection` groups related rows with heading and optional description.
- `SettingsSummaryRow` renders read-only key-value metadata.
- `SettingsLinkRow` renders route links and external link affordances.
- `SettingsSelectRow` renders one-of-many local preference controls.
- `SettingsSwitchRow` renders binary local preferences only.
- `SettingsSegmentedRow` renders short mutually exclusive choices.
- `SettingsScopeBadge` declares scope.
- `SettingsStatusMessage` announces save or error states.
- `SettingsSectionIndex` provides jump links at desktop widths.
- `SettingsBoundaryNotice` explains security and backend boundaries.
- `SettingsUnavailableRow` shows disabled route or missing setup.
- `SettingsSignOutPanel` separates session exit.
- `SettingsSignOutDialog` confirms sign-out.
- `SettingsErrorState` handles full-page auth or context failure.
- `SettingsLoadingState` handles hydration.

## Interaction Rules
General:
- Row clicks navigate only when the row is a link row.
- Switch rows toggle only the switch and row if explicitly implemented as one target.
- Select rows open the selection control.
- Disabled rows are focusable only if the implementation pattern uses them to expose reason text; otherwise use accessible description near the row.
- External links show clear external affordance.

Keyboard:
- `Tab` reaches every interactive row and control.
- `Shift+Tab` moves backward predictably.
- `Enter` activates focused links and buttons.
- `Space` toggles switches and segmented buttons where native semantics allow.
- `Escape` closes sign-out dialog.
- Section index links move focus to the section heading.

Focus:
- Initial focus remains on page heading after navigation if app convention supports it.
- Opening sign-out dialog moves focus to dialog title or first focusable action.
- Closing dialog returns focus to sign-out button.
- Local preference save does not move focus.
- Error retry button receives focus only when user activated retry and a full-page error remains.

Pointer:
- Entire link row can be clickable if it does not contain another interactive control.
- Do not nest interactive controls inside a clickable row.
- Keep destructive sign-out away from high-frequency rows.

## Accessibility Requirements
Structure:
- Use semantic `main`, `section`, headings, lists, and description lists.
- Account key-value details should use a description list or equivalent accessible structure.
- Section index should be navigation with clear label.
- Expandable sections must follow WAI-ARIA accordion guidance if used.

Names:
- Every control must have a visible label.
- Every disabled row must have an accessible reason.
- External links must indicate external navigation in visible or accessible text.
- Switches must expose current checked state.

Status:
- Local save status uses `role=status`.
- Local save error uses `role=alert` only when immediate attention is required.
- Loading text is announced politely.
- Session expired and not authorized states use clear headings.

Contrast:
- Text contrast meets WCAG AA.
- Scope badges cannot rely on color alone.
- Disabled text still readable.
- Focus ring must be visible against all backgrounds.

Target size:
- Primary row actions target at least 24 by 24 CSS pixels.
- Prefer 44 by 44 CSS pixels for row-level actions.
- Keep adjacent icon buttons spaced enough to prevent accidental activation.

Reduced motion:
- Respect `prefers-reduced-motion`.
- Local reduced motion setting can only reduce animation.
- Do not animate large section jumps when reduced motion is active.

## Privacy And Security
Do not expose:
- secrets
- tokens
- raw environment objects
- payment provider credentials
- SMS provider credentials
- webhook signing secrets
- internal task shared secrets
- Firebase private keys
- raw provider payloads
- raw audit payloads
- proof asset URLs
- full customer phone numbers unless a dedicated screen and role justify it

Do not log:
- local preference values if they could reveal behavior patterns
- account email in analytics
- phone number
- raw route URL with sensitive query
- sign-out failure payloads
- local storage contents

Allowed analytics:
- `admin_settings_viewed`
- `admin_settings_section_opened`
- `admin_settings_local_preference_changed`
- `admin_settings_link_pressed`
- `admin_settings_unavailable_link_pressed`
- `admin_settings_sign_out_started`
- `admin_settings_sign_out_cancelled`
- `admin_settings_sign_out_confirmed`
- `admin_settings_session_expired_viewed`

Analytics payload constraints:
- include role only if approved by analytics policy
- include setting key, not value
- include link ID, not full sensitive URL
- include result status
- include no personal data

Security boundaries:
- Provider credentials stay in cloud secret storage and backend runtime config.
- Production deployment remains outside the admin web client.
- User role grants happen only in `AdminUserAccess`.
- Pricing changes happen only in `AdminPricingRuleEdit`.
- Station status changes happen only in `AdminStationStatusOverride`.
- Refund execution happens only in refund settlement flow.
- Webhook replay is not supported in v1.

## Content Rules
Use:
- `Settings`, not `Control panel`
- `Local preference`, not `System preference`
- `Governed screen`, not `Advanced`
- `Unavailable in v1`, not `Coming soon`
- `No access`, not `Forbidden`
- `Sign out`, not `Logout`
- `Environment`, only for safe public environment label

Avoid:
- vague admin power copy
- fear-heavy security language
- secrets or credential labels that imply values are visible
- route names without descriptions
- disabled rows without reason
- many equal-weight cards
- hidden critical links

## Empty And Disabled Content
No local settings:
- Should not happen because defaults exist.
- If local settings fail validation, reset to defaults and show warning.

No links:
- Should not happen for admin roles.
- Show full error if role cannot be read.

No documentation URLs:
- Show platform rows as disabled.
- Copy: `Repository documentation is not connected to this admin build.`

No version:
- Show `Version unavailable`.
- Do not block page.

No environment label:
- Show `Environment label unavailable`.
- Copy: `The build did not expose a safe environment label.`

## Error Mapping
| Condition | UI state | User copy | Recovery |
| --- | --- | --- | --- |
| Missing admin role | `not_authorized` | `Admin settings unavailable` | Sign in with admin account |
| Expired session | `session_expired` | `Session expired` | Sign in again |
| Local store read fails | `ready` with warning | `Local preferences reset for this session` | Retry or continue |
| Local store write fails | `local_save_failed` | `Setting was not saved` | Retry |
| Route missing | `partial_links` | `Some links are not connected` | Use available links |
| Optional context read fails | `api_error` partial | `Settings could not fully load` | Refresh |
| Sign out fails | dialog error | `Could not sign out` | Try again |

## Performance Requirements
Initial render:
- Should not wait for heavy admin list endpoints.
- Should load from auth context and local preferences.
- Optional overview freshness should not block page.

Bundle:
- Reuse existing admin primitives.
- Do not import chart libraries.
- Do not import table libraries.
- Do not import markdown renderers.
- Do not import payment SDKs.

Storage:
- Local preference read should be synchronous or fast async.
- Validate local values before render.
- Use fallback defaults if storage is unavailable.

Rendering:
- Section groups should virtualize only if future rows grow substantially.
- Current v1 content should not require virtualization.
- Avoid layout shift when save status appears.

## Responsive Behavior
Desktop:
- Two-column high-level layout is allowed.
- Section index may appear in a sticky side rail.
- Account summary can span width.
- System link groups can use card grid with consistent row heights.

Tablet:
- Collapse to one content column with grouped cards.
- Keep section index horizontal or remove it.
- Preserve row descriptions.

Mobile web:
- One column.
- No sticky side rail.
- Row labels and descriptions stack.
- Sign-out panel stays near bottom.
- Dialog uses full-width bottom sheet only if web shell pattern supports it.

## QA Acceptance Criteria
Functional:
- `screen-admin-settings` renders for every admin role.
- Non-admin account sees not-authorized state.
- Expired admin session sees session-expired state.
- Local preferences load defaults on first visit.
- Changing each local preference saves locally.
- Failed local storage write shows inline error.
- Sign out opens confirmation before ending session.
- Confirmed sign out routes to `/admin/sign-in`.
- Role-specific links enable and disable according to permission rules.
- Disabled links always show a reason.
- No unsupported backend settings endpoint is called.

Security:
- No secret values render.
- No raw environment object renders.
- No provider credentials render.
- No payment callback secret renders.
- No token is stored in local settings.
- No backend mutation occurs from this screen except sign out through auth service.
- User, pricing, station, refund, issue, and webhook actions route to dedicated screens.

Accessibility:
- H1 is present and unique.
- Section headings are ordered.
- Keyboard reaches every control.
- Focus order follows visual order.
- Sign-out dialog traps focus while open.
- Save status is announced.
- Disabled row reason is accessible.
- Controls meet target-size requirements.
- Reduced motion is respected.

Visual:
- First viewport shows account context and workspace controls.
- Local preference scope is visible.
- Security boundary notice is visible before platform rows.
- Sign out is visually separated from normal settings.
- No dense cluster of unrelated links.

## Test Plan
Unit tests:
- local settings defaults
- local settings validation
- local settings migration
- role-to-link access mapping
- disabled reason generation
- scope badge rendering
- sign-out dialog state

Component tests:
- renders account card
- renders every section
- saves each local preference
- handles local store failure
- shows partial links warning
- hides unavailable secret values
- opens and closes sign-out dialog
- returns focus after dialog close

Route tests:
- `/admin/settings` loads for each admin role
- invalid `section` query does not break page
- valid `section` query focuses section heading
- non-admin route shows access denied
- expired session route shows reauth action

Accessibility tests:
- axe scan has no critical violations
- keyboard-only navigation works
- screen-reader labels are present for switches and selects
- status messages are discoverable
- dialog uses correct role and labels

Security tests:
- assert no `MTN_MOMO` values in DOM
- assert no `HUBTEL_SMS` values in DOM
- assert no `FIREBASE_PRIVATE_KEY` value in DOM
- assert no token value in local preference storage
- assert no unsupported settings API call

## Implementation Notes For Claude Code
Target file:
- `apps/admin/src` route structure when the real admin frontend exists.

Likely route:
- `apps/admin/src/routes/admin-settings.tsx`
- or equivalent router path used by the admin app.

Required hooks:
- `useAdminAuthContext`
- `useAdminLocalSettings`
- `useAdminRouteRegistry`
- `useSignOut`

Required utilities:
- `getAdminRoleDescription`
- `getAdminSettingsLinksForRole`
- `validateAdminLocalSettings`
- `saveAdminLocalSettings`
- `resetAdminLocalSettings`

Do not implement:
- `useAdminSettingsQuery`
- `useAdminConfigMutation`
- `useSecretManagerMutation`
- any call to `/v1/admin/settings`
- any call to `/v1/admin/config`

## Data Test IDs
Screen:
- `screen-admin-settings`

Header:
- `admin-settings-header`
- `admin-settings-title`
- `admin-settings-subtitle`

Account:
- `admin-settings-account-section`
- `admin-settings-account-card`
- `admin-settings-role-badge`
- `admin-settings-session-summary`
- `admin-settings-environment-label`
- `admin-settings-version`

Workspace:
- `admin-settings-workspace-section`
- `admin-settings-default-landing-row`
- `admin-settings-density-row`
- `admin-settings-dense-tables-row`
- `admin-settings-motion-row`
- `admin-settings-time-display-row`
- `admin-settings-copy-format-row`
- `admin-settings-save-status`

System links:
- `admin-settings-system-section`
- `admin-settings-link-launch-readiness`
- `admin-settings-link-deliveries`
- `admin-settings-link-stations`
- `admin-settings-link-users`
- `admin-settings-link-pricing`
- `admin-settings-link-finance`
- `admin-settings-link-reconciliation`
- `admin-settings-link-issues`
- `admin-settings-link-audit-events`
- `admin-settings-link-outbound-notifications`
- `admin-settings-link-webhook-events`
- `admin-settings-link-analytics`
- `admin-settings-link-export-report`

Security:
- `admin-settings-security-section`
- `admin-settings-secret-boundary-row`
- `admin-settings-audit-row`
- `admin-settings-production-access-row`

Platform:
- `admin-settings-platform-section`
- `admin-settings-deployment-runbook-row`
- `admin-settings-environment-guide-row`
- `admin-settings-observability-row`

About:
- `admin-settings-about-section`
- `admin-settings-privacy-row`
- `admin-settings-terms-row`
- `admin-settings-support-row`

Sign out:
- `admin-settings-sign-out-section`
- `admin-settings-sign-out-button`
- `admin-settings-sign-out-dialog`
- `admin-settings-sign-out-confirm`
- `admin-settings-sign-out-cancel`

States:
- `admin-settings-state-loading`
- `admin-settings-state-not-authorized`
- `admin-settings-state-session-expired`
- `admin-settings-state-error`
- `admin-settings-partial-links-warning`

## Definition Of Done
The screen is complete when:
- It renders a serious admin settings command center at `/admin/settings`.
- It saves only safe local preferences.
- It never calls non-existent settings endpoints.
- It shows account, role, session, environment, and version context safely.
- It routes all backend control work to governed screens.
- It explains unavailable rows with concrete reasons.
- It hides all secrets and provider credentials.
- It supports keyboard, screen reader, reduced motion, and narrow widths.
- It includes automated tests for role-aware links, local preferences, sign out, and security exclusions.

## Final Build Instruction
Build `AdminSettings` as a secure admin settings directory and local preference surface.

The implementation must respect these boundaries:
- Settings can manage local browser preferences.
- Settings can route to governed admin screens.
- Settings can explain backend configuration boundaries.
- Settings cannot mutate backend configuration.
- Settings cannot expose secrets.
- Settings cannot duplicate dedicated operational screens.
- Settings cannot hide unavailable access without an explanation.

