# Empty Error Library Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Empty/error library |
| Component family | Shared UI infrastructure |
| Primary modules | `SharedStateResolver`, `SharedStateProvider`, `EmptyState`, `ErrorState`, `StateBanner`, `StateInlinePanel`, `StatePage`, `StateCard`, `StateTableRow`, `StateActionGroup`, `StateCopyRegistry`, `StateTelemetryBridge` |
| Supporting modules | `NotAuthorizedState`, `SessionExpiredState`, `OfflineState`, `StaleDataState`, `RateLimitedState`, `PaymentBlockedState`, `IssueBlockedState`, `ManualReviewState`, `ScanMismatchState`, `ProofRequiredState`, `OtpRequiredState`, `WebhookConflictState`, `StatePrivacyRedactor`, `StateFocusManager`, `StateIcon`, `StateIllustrationSlot` |
| Inventory behavior | Shared state screens with role-safe copy |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, future shared frontend UI package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web console |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, support admins, finance admins, ops admins, super admins, QA, accessibility reviewers |
| Backend coverage | `apiErrorResponseSchema`, `docs/07-api/error-codes.md`, typed API client normalized errors, RTK Query cache state, offline outbox state, role routing decisions, shared screen state specs |
| Browser mutation operation | None directly; this library renders state, recovery actions, and safe navigation intents only |
| Data sensitivity | delivery IDs, tracking codes, receiver data, package scan codes, proof references, provider errors, request IDs, role labels, station scope, assignment scope, issue status, payment status, refund status |
| Offline critical | Yes for operations mobile state recovery and outbox visibility; no direct mutation authority |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, form system, notification system, payment status component, issue status component, accessibility foundation, localization foundation, analytics tracking, test harness |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, blocked by payment, blocked by issue, manual review required, scan mismatch, duplicate package label, custody not confirmed, OTP required, proof required, payment under review, refund pending, webhook conflict, rate limited |
| Related screen specs | all public, receiver, sender, operations, admin, auth, shared modal, shared state, and shared infrastructure specs |
| Design tokens | Uses existing neutral, brand, success, warning, danger, info, offline, stale, blocked, focus, surface, text, radius, spacing, and motion tokens |
| Accessibility target | Every state must expose a meaningful heading, reason, recovery action, focus target, status announcement, and non-color visual distinction across web and mobile |

## Purpose
The empty/error library is Kra's shared state-rendering system.

It gives every app surface one consistent way to render:

- no data
- no filtered results
- clear operational queues
- failed reads
- failed mutations
- background refresh failures
- partial data
- offline state
- stale data
- permission denial
- expired sessions
- rate limits
- domain blockers
- required recovery steps

The most important rule is:

```text
Every empty or error state must identify the real condition, show only role-safe context, and offer the safest next action supported by current backend contracts.
```

## Product Job
Kra must feel reliable even when nothing is shown, a request fails, a queue is clear, a route is denied, or a field user goes offline.

The library must:

- keep state rendering consistent across apps
- prevent generic messages where a domain state exists
- prevent role or privacy leaks
- prevent unsupported retry or recovery actions
- make operational clear queues feel intentional
- preserve user trust during failures
- guide field staff to outbox or recovery where appropriate
- guide admins to precise investigation paths
- guide customers without exposing internal data
- keep all state behavior testable with stable IDs

This library must not make every state look the same. It must give each state a shared structure while allowing role, surface, and risk to determine emphasis.

## Strategic Role
Delivery products lose trust through vague absence and vague failure.

Bad empty states create uncertainty:

- a sender does not know whether no deliveries means first use, filter mismatch, or fetch failure
- a driver thinks no assignments means the app is broken
- a station operator misses that the queue is actually clear
- an admin mistakes a clean exception queue for an unavailable backend

Bad error states create risk:

- field staff retry unsafe actions
- customers lose payment confidence
- admins see raw provider details
- users repeatedly refresh access-denied routes
- support cannot use request IDs safely
- screen readers miss state changes

The library is the shared recovery contract between backend truth, frontend state, and user action.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing Kra screens.

Surface type:

- Shared UI infrastructure for full-page, inline, table, modal, banner, and card state presentations.

Primary action:

- Render the right state for the right condition with safe recovery and no unsupported authority.

Visual thesis:

- `Operational clarity under interruption`: each state feels calm, exact, and useful, like a dispatch board that tells the user whether work is clear, blocked, waiting, stale, or failed.

Restraint rule:

- Do not use large decorative scenes, playful copy, or repeated icon-heavy cards for operational surfaces. Use concise headings, role-safe context, and one dominant recovery action.

Density:

- Public and sender states stay short.
- Operations mobile states emphasize task safety and next action.
- Admin states can include request ID, source, and diagnostic-safe context.

Platform stance:

- State resolution happens from typed API errors, cache metadata, route guard results, offline outbox state, and screen-owned domain state.
- Presentation components render only what the resolver authorizes.
- Recovery actions emit navigation or retry intents, not direct backend mutations.

## External Research Used
Only directly relevant empty, error, alert, and accessibility sources were used:

- [Atlassian empty state](https://atlassian.design/components/empty-state/): supports describing no-data moments and what the user can do next.
- [GOV.UK Design System error summary](https://design-system.service.gov.uk/components/error-summary/): supports top-level error summaries, focus movement, and matching summary text with field-level errors.
- [USWDS alert component](https://designsystem.digital.gov/components/alert/): supports status-specific alert treatment for success, warning, error, emergency, and informational messages.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing state changes without unexpected focus movement.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear text identification when an error is detected.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable focus after state changes and route transitions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/01-loading-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/02-empty-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/03-error-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/04-offline-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/05-stale-data-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/06-not-authorized-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/07-session-expired-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/08-blocked-by-payment-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/09-blocked-by-issue-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/10-manual-review-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/11-scan-mismatch-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/12-duplicate-package-label-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/13-custody-not-confirmed-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/14-otp-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/15-proof-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/16-payment-under-review-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/17-refund-pending-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/18-webhook-conflict-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/19-rate-limited-state.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/13-form-system.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/service-errors.ts`

## Non-Goals
The library must not:

- implement actual frontend screens in this documentation PR
- replace individual shared screen state specs
- replace role routing
- replace backend authorization
- replace the typed API client error mapper
- replace RTK Query cache policy
- replace offline outbox recovery
- replace form validation summaries
- invent backend actions
- retry mutations by itself
- expose raw provider payloads
- expose stack traces
- expose denied record existence on public or customer surfaces
- use empty state when the route is loading, failing, unauthorized, offline, or stale
- collapse domain blockers into a generic error card

## Architecture Overview
The library has four layers.

### State Input Layer
Inputs come from:

- route guard
- typed API client normalized error
- RTK Query read state
- RTK Query mutation state
- offline outbox state
- local cache freshness metadata
- form validation state
- screen-owned domain condition
- backend response fields

Rules:

- Inputs must be typed.
- Inputs must include surface and role.
- Inputs must include risk classification where known.
- Inputs must include a safe operation label where useful.
- Inputs must not include raw sensitive payloads.

### Resolution Layer
`SharedStateResolver` decides the state family and variant.

Responsibilities:

- prefer specific domain states over generic error
- separate empty from error
- separate unauthorized from session expired
- separate stale from offline
- separate validation from mutation failure
- choose allowed recovery actions
- choose role-safe copy group
- choose privacy redaction level

Rules:

- Resolver output must be deterministic.
- Resolver must not call APIs.
- Resolver must not mutate state.
- Resolver must not use UI copy as logic.
- Resolver must return an explicit fallback when unknown.

### Presentation Layer
Presentation components render state consistently.

Components:

- `StatePage` for whole-route states
- `StateCard` for focused route panels
- `StateInlinePanel` for section-level states
- `StateBanner` for stale, offline, partial, and refresh states
- `StateTableRow` for table no-results and row-level failures
- `StateActionGroup` for recovery actions
- `StateIcon` for status symbol
- `StateIllustrationSlot` for optional quiet imagery

Rules:

- Presenters receive already-redacted state data.
- Presenters do not decide authorization.
- Presenters do not construct retry calls.
- Presenters emit action intents.
- Presenters expose stable test IDs.

### Telemetry Layer
State telemetry tracks state quality without leaking data.

Responsibilities:

- emit state viewed
- emit recovery action clicked
- emit retry attempted
- emit support route opened
- emit offline outbox route opened
- emit focus recovery failure when detectable

Rules:

- Telemetry excludes raw IDs unless analytics policy explicitly allows hashed internal values.
- Telemetry includes state family, variant, surface, role, and operation ID.
- Telemetry includes safe error code.
- Telemetry never includes phone, address, issue text, notes, provider payload, proof URL, tracking code, scan code, or denied record details.

## State Resolution Priority
The resolver must apply states in this order:

1. `session_expired`
2. `account_locked` or inactive account where screen owns it
3. `not_authorized`
4. `offline`
5. `stale_data`
6. `rate_limited`
7. domain blocker state
8. validation or form error
9. route read error
10. section read error
11. background refresh error
12. empty state
13. ready state

Reasoning:

- Untrusted sessions must hide protected content first.
- Authorization must not leak data through error details.
- Offline and stale states can preserve safe content.
- Domain blockers provide better recovery than generic errors.
- Empty is valid only after a successful, authorized read.

## Core State Families
### Empty
Use when:

- read completed successfully
- user is authorized
- no visible records exist for current role, scope, or filter
- no loading, error, offline, stale, or denied condition exists

Variants:

- `first_use_empty`
- `clean_queue_empty`
- `unfiltered_empty`
- `filtered_empty`
- `section_empty`
- `partial_empty`
- `scoped_empty`
- `privacy_safe_empty`
- `not_started_empty`
- `completed_work_empty`
- `local_store_empty`

### Error
Use when:

- request failed
- mutation failed
- local persistence failed
- upload failed
- component crashed
- response contract failed
- no more specific state is better

Variants:

- `route_read_error`
- `section_read_error`
- `background_refresh_error`
- `mutation_error`
- `validation_error`
- `server_validation_error`
- `network_error`
- `timeout_error`
- `provider_unavailable_error`
- `upload_error`
- `local_store_error`
- `render_error`
- `contract_error`
- `partial_data_error`
- `unsupported_operation_error`

### Offline
Use when:

- device or app connectivity is unavailable or unreliable
- cached content may be visible
- an approved offline action may queue
- admin web is blocked because it is online-only

Variants:

- `offline_no_cache`
- `offline_cached_read`
- `offline_action_allowed`
- `offline_action_blocked`
- `queued_for_sync`
- `syncing_after_reconnect`
- `sync_succeeded`
- `sync_failed`
- `sync_conflict`
- `local_store_error`
- `metered_connection`
- `admin_offline_blocked`

### Stale Data
Use when:

- cached data is visible but not fresh
- refresh failed and prior content remains
- source data changed after refresh
- action requires fresh source data

Variants:

- `soft_stale_read`
- `hard_stale_read`
- `stale_after_refresh_failure`
- `stale_during_background_refresh`
- `record_changed_after_refresh`
- `stale_action_blocked`
- `source_partially_stale`
- `stale_offline_cache`
- `stale_admin_snapshot`
- `stale_assignment_scope`

### Not Authorized
Use when:

- user is authenticated but lacks role, scope, ownership, assignment, or capability
- backend returns a safe forbidden condition
- route guard denies after auth context is known

Variants:

- `route_role`
- `capability`
- `station_scope`
- `assignment_scope`
- `sender_ownership`
- `receiver_scope`
- `admin_scope`
- `finance_scope`
- `support_scope`
- `ops_scope`
- `role_claim_invalid`
- `scope_changed`
- `object_hidden`

### Session Expired
Use when:

- protected route has no trusted session
- token is missing, invalid, expired, revoked, or refresh failed
- local auth policy marks session unsafe

Variants:

- `expired`
- `idle_timeout`
- `revoked`
- `refresh_failed`
- `missing_token`
- `invalid_token`
- `role_claim_missing`
- `role_claim_invalid`
- `manual_sign_out`
- `unknown`

### Domain Blockers
Use when:

- a business rule explains the condition better than generic error

Families:

- blocked by payment
- blocked by issue
- manual review required
- scan mismatch
- duplicate package label
- custody not confirmed
- OTP required
- proof required
- payment under review
- refund pending
- webhook conflict
- rate limited

Rules:

- Domain blockers must link to their specific state spec.
- Do not replace domain blockers with generic error.
- Domain blockers can render as page, card, banner, inline panel, or modal state depending on host.

## Error Code Mapping
Approved API codes map to state families before copy is selected.

| Error code | Library family | Notes |
| --- | --- | --- |
| `AUTH_REQUIRED` | session expired | hide protected content |
| `FORBIDDEN_ROLE` | not authorized | role or capability denial |
| `STATION_SCOPE_VIOLATION` | not authorized | station scope denial |
| `ASSIGNMENT_SCOPE_VIOLATION` | not authorized | assignment scope denial |
| `DELIVERY_NOT_FOUND` | privacy-safe empty, not found, or error | surface decides based on privacy |
| `INVALID_STATUS_TRANSITION` | domain blocker or stale conflict | refresh before retry |
| `DELIVERY_NOT_PAID` | blocked by payment | open payment context |
| `HANDOFF_PROOF_REQUIRED` | proof required | open proof or handoff recovery |
| `PHONE_VERIFICATION_REQUIRED` | OTP required | open verification flow |
| `PACKAGE_ALREADY_RECEIVED` | duplicate or completed domain state | no blind retry |
| `PACKAGE_SCAN_MISMATCH` | scan mismatch | rescan or manual recovery |
| `PACKAGE_NOT_READY_FOR_DISPATCH` | domain blocker | show missing readiness reason |
| `FINAL_PROOF_REQUIRED` | proof required | open proof capture |
| `FINAL_MILE_NOT_AVAILABLE` | domain blocker | explain doorstep unavailability |
| `REATTEMPT_LIMIT_REACHED` | domain blocker | open support or return path |
| `PAYMENT_FAILED` | payment failed recovery | not generic error |
| `PAYMENT_ALREADY_CONFIRMED` | confirmed or already handled state | avoid duplicate payment |
| `PAYMENT_PROVIDER_UNAVAILABLE` | provider unavailable error | retry later |
| `REFUND_NOT_ALLOWED` | refund policy state | review policy evidence |
| `REFUND_ALREADY_PROCESSED` | refund already processed state | show settlement context |
| `DUPLICATE_SCAN` | duplicate package label or scan state | recover safely |
| `CONFLICTING_HANDOFF_STATE` | custody conflict | force review |
| `ISSUE_LOCK_ACTIVE` | blocked by issue | open issue context |
| `VALIDATION_ERROR` | validation error | use form system where possible |
| `PROVIDER_TIMEOUT` | timeout error | retry or support route |
| `UNKNOWN_INTERNAL_ERROR` | error | safe generic recovery |

Internal-only codes:

- do not render on public or customer surfaces
- admin views may show safe internal label only when policy permits
- provider payload remains hidden

## Presentation Modes
### Page Mode
Use for:

- whole route cannot render
- session expired
- not authorized route denial
- no cache offline route
- public maintenance
- account locked
- tracking access denied

Requirements:

- one heading
- one short explanation
- one primary action
- secondary action only if useful
- focus moves to heading
- safe support route where applicable

### Card Mode
Use for:

- centered route subsection
- modal outcome
- dashboard panel with important state
- admin detail state

Requirements:

- card title
- reason text
- status icon
- action group
- no excessive decoration

### Inline Panel Mode
Use for:

- one failing section inside an otherwise valid screen
- partial data
- background refresh error
- proof upload panel error
- station queue section empty

Requirements:

- local heading
- does not replace surrounding page
- action scoped to section
- screen reader announcement if state appears after user action

### Banner Mode
Use for:

- stale data
- offline
- sync pending
- rate limited with visible wait
- partial refresh failure
- maintenance warning

Requirements:

- persistent while condition remains
- concise
- action optional
- no focus movement unless user triggered state transition that requires it

### Table Row Mode
Use for:

- admin no results
- empty table
- filtered table
- row expansion failure

Requirements:

- table semantics preserved
- span visible columns
- include clear filters action for filtered states
- no separate table if only a row state is needed

### Modal Mode
Use for:

- confirmation blocked by error
- focused operation failure
- critical state transition review failure

Requirements:

- focus trap
- clear close or recovery action
- no hidden background state changes
- modal copy must not leak protected fields

## Copy Model
Every state has these copy fields:

```ts
type SharedStateCopy = {
  eyebrow?: string;
  title: string;
  body: string;
  detail?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  supportLabel?: string;
};
```

Rules:

- `title` names the state.
- `body` explains what happened.
- `detail` is optional and role-safe.
- action labels must describe the action.
- avoid generic labels when recovery is specific.
- avoid internal error names as customer-facing titles.
- avoid blaming users.
- avoid making promises the backend has not confirmed.

## Role-Safe Copy Rules
Public visitor:

- can see generic service, tracking, policy, support, and public lookup context
- cannot see internal route names, station queue state, staff data, payment provider internals, or delivery existence when privacy is restricted

Receiver:

- can see delivery-scoped tracking guidance after verification
- cannot see sender account data, staff IDs, internal notes, provider details, or unrelated issue evidence

Sender:

- can see own delivery, payment, refund, issue, notification, and receipt states
- cannot see staff IDs, internal station blockers, raw provider payloads, internal audit, or other sender records

Station operator:

- can see station-scoped package work, scan recovery, offline queue, and handoff state
- cannot see finance-only details or other station queues

Driver:

- can see assigned-run state and scan/handoff recovery
- cannot see station admin configuration or unassigned package data

Final-mile courier:

- can see assigned doorstep work, proof, OTP, failed attempt, and return-to-station recovery
- cannot see unassigned deliveries or finance details

Support admin:

- can see support-safe request IDs, issue status, notification state, and customer-facing recovery
- cannot perform finance or ops-only actions unless backend capability allows it

Finance admin:

- can see finance, payment, refund, pricing, and reconciliation states
- cannot perform custody or station operations without capability

Ops admin:

- can see operations, station, custody, SLA, and issue recovery states
- cannot perform finance execution without capability

Super admin:

- can see all admin-safe state detail allowed by backend
- still cannot see raw secrets, stack traces, or provider payloads in normal UI

## Privacy Redaction
The library must redact before presentation.

Forbidden visible fields unless screen-specific policy allows admin-safe display:

- full receiver phone
- receiver address
- raw tracking code in public error
- raw package scan code after failed validation
- proof storage path
- proof upload URL
- provider raw payload
- provider secret
- webhook signature detail
- internal stack trace
- raw auth token
- full issue description in shared state card
- internal audit payload
- denied object title on public or customer surfaces

Safe fields:

- request ID if backend returns safe request ID
- safe operation label
- role-safe error code
- redacted phone suffix where policy allows it
- state family
- retry eligibility
- cache age
- queued action count
- refresh timestamp

## Recovery Action Taxonomy
Allowed action intents:

```ts
type SharedStateActionIntent =
  | "retry"
  | "refresh"
  | "clear_filters"
  | "go_back"
  | "go_home"
  | "sign_in"
  | "switch_account"
  | "open_support"
  | "open_delivery"
  | "open_payment"
  | "open_issue"
  | "open_outbox"
  | "open_action_recovery"
  | "open_proof_capture"
  | "open_otp_verification"
  | "open_station_scope"
  | "open_admin_detail"
  | "copy_request_id";
```

Rules:

- Actions are intents, not backend calls.
- Host screen maps intent to route or handler.
- Retry must be disabled for non-retryable domain rejections.
- Refresh must preserve filters unless clear-filter action is explicit.
- Copy request ID appears only where request ID exists and is safe.
- Open support must not attach sensitive text by default.
- Open outbox appears only for offline-capable surfaces.

## Unsupported Actions
Do not show actions for:

- retrying a forbidden route
- retrying expired session without sign-in
- retrying a scan mismatch without rescan or manual recovery
- resending OTP from an error state unless backend challenge endpoint supports it and screen owns the action
- retrying payment capture from provider return without payment recovery policy
- refund settlement retry outside the settlement screen
- notification retry when frontend has no exposed backend retry endpoint
- webhook replay unless admin replay endpoint exists and user has capability
- admin destructive mutation directly from a generic error state

## State Data Contract
Resolver output:

```ts
type SharedStateDescriptor = {
  stateId: string;
  family:
    | "empty"
    | "error"
    | "offline"
    | "stale_data"
    | "not_authorized"
    | "session_expired"
    | "rate_limited"
    | "domain_blocker";
  variant: string;
  presentation: "page" | "card" | "inline" | "banner" | "table_row" | "modal";
  severity: "info" | "success" | "warning" | "error" | "critical";
  role: string;
  surface: string;
  copy: SharedStateCopy;
  actions: SharedStateAction[];
  requestId?: string;
  operationId?: string;
  freshness?: SharedFreshnessInfo;
  privacyLevel: "public" | "customer" | "staff" | "admin";
};
```

Descriptor rules:

- `stateId` must be stable.
- `variant` must come from approved taxonomy.
- `severity` must not be inferred from color alone.
- `privacyLevel` controls copy and detail exposure.
- `actions` must be allowed by current surface and backend contract.

## Visual Rules
Use:

- one clear title
- one concise explanation
- one primary action where action exists
- stable iconography by state family
- consistent spacing
- role-appropriate density
- visible focus
- accessible text for status
- restrained illustration only for public or first-use states

Avoid:

- multiple competing CTAs
- state cards nested inside state cards
- repeated banners for the same condition
- cheerful empty states for blocked risk work
- red styling for clean queue empty
- green styling for stale or local-only success
- hidden retry behavior
- full-page states for small inline failures

## Mobile Rules
Mobile state components must:

- fit narrow screens
- keep heading visible
- keep primary action thumb-reachable
- avoid dense diagnostics
- use short copy
- preserve safe back navigation
- route offline staff to outbox when relevant
- use large tap targets
- announce status changes
- not cover active bottom navigation unless page state replaces route

Operations mobile:

- show task identity when safe
- show whether backend confirmed or local-only
- show next physical action only when supported
- never show backend success for queued-only state

Sender mobile:

- use customer-safe language
- keep payment and refund recovery explicit
- avoid internal staff terms

Receiver flow:

- preserve privacy
- do not confirm hidden delivery existence
- route to verification or support as needed

## Admin Rules
Admin state components must:

- support table, panel, and route modes
- show safe request ID where available
- show operation label
- show filter context for filtered empty
- show export or refresh recovery where supported
- show current scope when safe
- not show raw provider payload
- not turn every admin state into a full-page blocker

Admin empty:

- clean exception queues can use success tone
- no-results filters must offer clear filters
- no users/stations/deliveries must avoid implying platform-wide absence if scope is filtered

Admin error:

- include retry if operation is safe
- include request ID when present
- include support or engineering escalation route only where defined
- avoid exposing stack traces

## Accessibility Requirements
Every state component must:

- render a semantic heading
- expose role or status where needed
- announce dynamic state changes through status messaging
- move focus to page heading for route-level state changes
- keep focus in modal state changes
- preserve focus for background refresh banners
- provide visible focus styles
- provide action names that make sense out of context
- not rely on color alone
- not rely on animation alone
- support reduced motion
- support large text
- support high contrast

Error-specific:

- identify the failed region
- explain recovery when known
- do not auto-focus banners that appear after background refresh
- for form validation, use form system summary instead of generic error card

Empty-specific:

- title must explain no content
- action must be keyboard reachable
- decorative images must have empty alt text or native decorative treatment
- meaningful illustrations must have short text alternative

## Analytics
Required events:

- `shared_state_viewed`
- `shared_state_action_selected`
- `shared_state_retry_attempted`
- `shared_state_retry_succeeded`
- `shared_state_retry_failed`
- `shared_state_support_opened`
- `shared_state_request_id_copied`

Allowed event fields:

- `state_family`
- `state_variant`
- `presentation`
- `severity`
- `surface`
- `role`
- `operation_id`
- `error_code`
- `http_status`
- `retry_eligible`
- `action_intent`
- `offline_eligible`
- `has_request_id`
- `freshness_bucket`
- `filter_count`

Forbidden event fields:

- delivery ID
- tracking code
- phone
- address
- issue text
- provider payload
- proof path
- package scan code
- station name where user role cannot see it
- denied record title
- raw request ID on public analytics if policy disallows it

## Test IDs
Shared test ID pattern:

```text
state-{family}
state-{family}-{variant}
state-{family}-{variant}-title
state-{family}-{variant}-body
state-{family}-{variant}-detail
state-{family}-{variant}-primary-action
state-{family}-{variant}-secondary-action
state-{family}-{variant}-support-action
state-{family}-{variant}-request-id
state-{family}-{variant}-retry
state-{family}-{variant}-clear-filters
state-{family}-{variant}-table-row
state-{family}-{variant}-banner
```

Rules:

- Do not include sensitive values in test IDs.
- Do not include IDs from backend records in test IDs.
- Use family and variant for stability.
- Host screen may prefix with screen ID when multiple states can appear.

## Testing Requirements
Unit tests:

- resolver priority order
- error code mapping
- empty versus error distinction
- stale versus offline distinction
- session expired versus not authorized distinction
- domain blocker preference
- role-safe copy selection
- redaction removes forbidden fields
- unsupported actions are not emitted
- telemetry redaction

Component tests:

- page mode focus behavior
- inline mode does not replace full page
- banner mode does not steal focus
- table row mode preserves table layout
- action group renders correct primary and secondary actions
- request ID copy only when safe
- screen reader names exist
- high contrast state is readable

Integration tests:

- sender delivery empty first-use state
- sender filtered history empty state
- station clean queue empty state
- driver no assignment empty state
- courier offline queued state
- admin filtered table empty state
- admin route read error with request ID
- receiver privacy-safe tracking denied state
- session expired clears protected content
- forbidden role shows safe return only

E2E tests:

- failed route load can retry
- filtered table can clear filters
- offline operations user can open outbox
- stale delivery detail blocks risky action until refresh
- unauthorized admin module does not reveal restricted data
- session expired routes to correct sign-in
- background refresh failure leaves current data visible with banner

Accessibility tests:

- route state heading receives focus
- status messages announce state changes
- actions are keyboard reachable
- no state relies only on color
- reduced motion removes decorative transitions
- large text does not overlap action group
- modal state traps focus

## Implementation Plan For Claude Code
1. Create shared state descriptor types.
2. Create state taxonomy constants from approved variants.
3. Create API error code mapper.
4. Create resolver priority function.
5. Create role-safe copy registry.
6. Create privacy redactor.
7. Create action-intent registry.
8. Create presentation components for page, card, inline, banner, table row, and modal.
9. Create state action group.
10. Create focus manager.
11. Create telemetry bridge.
12. Wire shared screen state specs into resolver output.
13. Integrate with typed API client normalized errors.
14. Integrate with RTK Query read and mutation states.
15. Integrate with offline outbox summaries.
16. Add unit, component, integration, E2E, and accessibility tests.

Do not wire the library to every route in one pass. Prove it on one public state, one sender state, one operations mobile state, and one admin state before broad rollout.

## Completion Checklist
The empty/error library is complete when an engineer can answer:

- Which state family should render?
- Which variant should render?
- Which presentation mode should render?
- Which role-safe copy should show?
- Which actions are allowed?
- Which actions are forbidden?
- Which sensitive fields are redacted?
- Which test ID identifies the state?
- Which analytics event is emitted?
- Which focus behavior applies?
- Which shared state spec provides detailed behavior?
- Which backend error codes map to this state?
- Which cache or offline metadata affects it?

## Final Quality Bar
The implementation is not acceptable unless:

- no generic error is used when a specific domain state exists
- no empty state appears before a completed authorized read
- no unauthorized state leaks protected record details
- no expired session keeps protected content visible
- no offline queued state is styled as backend-confirmed success
- no stale data enables risky action without refresh
- no raw provider payload appears in state UI
- every state has a heading, reason, recovery, and test ID
- every route-level state handles focus correctly
- every dynamic state change is accessible
- every telemetry event is redacted
- every recovery action is backed by host route or backend contract

This infrastructure spec is complete when Claude Code can build one shared state library that keeps Kra's absence, failure, blocker, offline, stale, and authorization experiences consistent without weakening privacy, safety, or backend authority.
