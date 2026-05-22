# Test Harness Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Test harness |
| Component family | Shared UI infrastructure |
| Primary modules | `KraTestHarness`, `TestAppShell`, `TestRoleProvider`, `TestRouteProvider`, `TestApiServer`, `TestDataBuilder`, `TestAuthPersonaRegistry`, `TestNetworkController`, `TestOutboxController`, `TestStorageController`, `TestClock`, `TestAnalyticsSink`, `TestAccessibilityRunner`, `TestPrivacyScanner`, `CriticalJourneyRunner` |
| Supporting modules | `ScreenHarness`, `ComponentHarness`, `MutationHarness`, `QueryHarness`, `FormHarness`, `StateHarness`, `ScanHarness`, `ProofHarness`, `PaymentHarness`, `RefundHarness`, `IssueHarness`, `NotificationHarness`, `LocalizationHarness`, `AnalyticsHarness`, `E2EJourneyRegistry`, `TestIdRegistry`, `CoverageGate`, `FlakeGate`, `CIArtifactCollector` |
| Inventory behavior | Unit/component tests plus E2E journeys for critical flows |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, `packages/shared`, `services/api`, future shared frontend UI package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web console |
| Primary users | frontend engineers, backend engineers, QA, product leads, ops admins, finance admins, support admins, release owners, Claude Code |
| Backend coverage | API contracts, delivery lifecycle, payment lifecycle, refund lifecycle, issue lifecycle, handoff events, proof capture, scan validation, station validation, admin actions, public tracking verification, offline outbox, authorization, audit, analytics, localization |
| Browser mutation operation | None directly; the harness executes tests and controlled fixtures only |
| Data sensitivity | seed users, auth personas, receiver phone values, tracking codes, package labels, proof inputs, payment IDs, refund IDs, issue IDs, station scope, admin scope, analytics payloads |
| Offline critical | Yes; the harness must verify offline queueing, replay, stale data, conflict, idempotency, and recovery for station, driver, and courier flows |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, scan component, proof capture component, timeline component, custody chain component, payment status component, issue status component, notification system, form system, empty/error library, accessibility foundation, localization foundation, analytics tracking |
| Related E2E contract | public tracking and OTP, sender create-pay-track, cancellation, station intake, station dispatch, driver pickup, destination receipt, final-mile assignment, courier custody, courier completion, failed attempt, admin custody audit, pricing update, refund settlement, launch readiness, offline outbox replay, role permission guards |
| Related security docs | privacy and data retention, authorization rules, audit trail spec, fraud and abuse prevention |
| Related platform docs | CI CD governance, release plan, observability and alerting, offline-first and low-bandwidth strategy |
| Design tokens | no unique visual tokens; harness validates visual, accessibility, state, spacing, focus, motion, localization, and responsive behavior through existing tokens |
| Accessibility target | Automated and manual accessibility coverage for critical screens, forms, states, modals, scan flows, proof flows, and admin tables |
| Quality target | No launch-critical flow merges without unit, component, integration, accessibility, privacy, and E2E evidence appropriate to its risk |

## Purpose
The test harness is Kra's shared infrastructure for proving that frontend, backend, and database-facing behavior works as a production delivery system.

It covers:

- unit tests
- component tests
- integration tests
- end-to-end journeys
- role permission tests
- API contract tests
- offline outbox tests
- scan and proof tests
- payment and refund tests
- issue and support tests
- admin action tests
- accessibility tests
- localization tests
- analytics privacy tests
- security and privacy regression tests
- visual state tests
- CI gates
- release evidence

The most important rule is:

```text
Kra cannot ship a critical delivery, payment, custody, proof, refund, issue, or admin path unless the harness proves the happy path, failure path, privacy boundary, role boundary, offline boundary, and recovery path.
```

## Product Job
Kra is solving real package movement, payment, custody, proof, and dispute risk. The test harness must prove the system behaves correctly before users trust it with goods and money.

The harness must:

- catch broken route guards
- catch unauthorized data exposure
- catch payment bypass
- catch custody transfer bypass
- catch scan mismatch failures
- catch duplicate label reuse
- catch proof completion bypass
- catch refund policy bypass
- catch issue lock bypass
- catch admin override drift
- catch public tracking privacy leaks
- catch offline replay conflicts
- catch stale data confusion
- catch localized copy failures
- catch accessibility regressions
- catch analytics privacy leaks

This is not a cosmetic QA layer. It is part of the operating system for delivery reliability.

## Strategic Role
The product will be used in high-friction delivery conditions across Africa. Testing must assume:

- unreliable networks
- mobile-first field work
- multiple roles touching the same package
- payment provider delays
- station pressure
- scan failures
- proof quality problems
- receiver verification problems
- admin review mistakes
- privacy-sensitive public links
- support investigations after the fact

The harness protects against failures that can become real-world loss:

- package moves before payment confirmation
- custody changes without assigned actor scan
- receiver sees private sender or staff data
- courier completes delivery without valid proof
- refund is approved without policy evidence
- station is marked launch-ready with missing validation
- offline replay duplicates a handoff
- admin sees an attractive dashboard that hides missing data

## Design Brief
Audience:

- Claude Code and engineers implementing Kra testing infrastructure.

Surface type:

- Shared test infrastructure across web, mobile, admin, shared packages, and API service.

Primary action:

- Make the safest tests easy to write and the riskiest untested paths impossible to merge.

Visual thesis:

- `Evidence before confidence`: every launch-critical UI path should leave clear test evidence, CI artifacts, and coverage signals that show what was proven.

Restraint rule:

- Do not chase a blanket frontend coverage number at the expense of critical journey evidence. Use coverage where it matters and E2E tests where user trust depends on full behavior.

Density:

- Unit tests stay narrow and fast.
- Component tests prove UI states and interactions.
- Integration tests prove API client and state orchestration.
- E2E tests prove role, lifecycle, payment, proof, and privacy journeys.
- Manual QA focuses on physical-device, accessibility, and operational review that automation cannot fully prove.

Platform stance:

- Current repo already uses Vitest for shared and API coverage.
- Current repo has `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, and `pnpm check:critical-coverage`.
- Frontend app package scripts do not yet include test targets.
- The harness spec defines what Claude Code must add before serious UI implementation scale-up.

## External Research Used
Only directly relevant testing sources were used:

- [Playwright Test](https://playwright.dev/docs/intro): supports cross-browser end-to-end tests, fixtures, assertions, traces, retries, and CI execution.
- [Playwright locators](https://playwright.dev/docs/locators): supports resilient user-facing queries and test IDs where product specs require stable IDs.
- [Playwright trace viewer](https://playwright.dev/docs/trace-viewer): supports debugging failing E2E runs with action, network, console, and screenshot evidence.
- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/): supports testing through user-visible behavior instead of internal implementation details.
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/): supports React Native component testing with user-centric queries and accessibility-aligned assertions.
- [Vitest coverage guide](https://vitest.dev/guide/coverage): supports V8 coverage, reports, and threshold-based enforcement.
- [Deque axe-core](https://github.com/dequelabs/axe-core): supports automated accessibility checks that can catch common accessibility violations.
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions): supports CI job structure, matrix runs, artifacts, required checks, and environment separation.

## Local Sources
Local implementation and policy inputs:

- `package.json`
- `packages/shared/vitest.config.ts`
- `services/api/vitest.config.ts`
- `scripts/check-critical-coverage.mjs`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/14-platform/ci-cd-governance.md`
- `docs/15-qa/quality-strategy.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/06-scan-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/07-proof-capture-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/08-timeline-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/09-custody-chain-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/10-payment-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/11-issue-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/12-notification-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/13-form-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/14-empty-error-library.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/15-accessibility-foundation.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/16-localization-foundation.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/17-analytics-tracking.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`

## Non-Goals
The test harness must not:

- implement actual frontend UI in this documentation PR
- replace product acceptance criteria
- replace security review
- replace privacy review
- replace real provider certification
- replace physical-device testing for scan, camera, signature, and photo proof
- use frontend coverage as the only quality gate
- let untested critical flows merge because unit coverage is high
- depend on production services during CI
- use production credentials
- send test analytics to production destinations
- use real customer data
- use real receiver phones
- use real payment provider funds
- store proof media beyond test retention
- let tests rely on hidden implementation details when user-visible behavior is available
- let E2E tests mutate production-like state without reset
- let flaky tests be ignored without logged action

## Current Test Reality
Current repo strengths:

- Root quality scripts exist.
- Vitest is installed.
- Shared domain package has coverage reporting.
- API package has coverage reporting.
- Critical coverage script enforces `100%` on auth policy, permissions, pricing, refunds, and state-machine domain files.
- CI command chain includes lint, typecheck, coverage, critical coverage, security rules, backend readiness, build, and API runtime import checks.

Current gaps to close before frontend scale-up:

- Web app has no test script.
- Admin app has no test script.
- Mobile app has no test script.
- No Playwright E2E config is present.
- No mobile component test config is present.
- No shared frontend test package is present.
- No route-level test ID validation is present.
- No analytics privacy payload gate is present.
- No localization key coverage gate is present.
- No accessibility automation gate is present.
- No E2E fixture server is present.

## Quality Model
Kra uses a risk-based test model.

| Layer | Purpose | Required for |
| --- | --- | --- |
| Unit | pure logic, schema mapping, formatter output, permission decisions | shared packages, API domain, frontend utilities |
| Component | UI state, accessible labels, form behavior, role-safe rendering | every shared component and critical screen |
| Integration | API client, cache, outbox, routing, provider adapters | shared frontend infrastructure and API service boundaries |
| E2E | real user journey across screens and state changes | launch-critical journeys |
| Accessibility | keyboard, focus, labels, contrast, text scale, state announcements | public, customer, operations, and admin surfaces |
| Privacy | no restricted data leaks into DOM, URLs, analytics, logs, screenshots | public, receiver, proof, payment, issue, admin, analytics |
| Security | auth, authorization, role guard, rate limit, provider boundary | auth, receiver tracking, admin, payment, refund, webhook |
| Visual state | layout survives states, viewport sizes, text expansion | high-risk public and operational screens |
| Manual | physical-device and operational validation | scan, camera, signature, proof, station dry run |

## Coverage Policy
Existing policy remains:

- payment, auth, permissions, pricing, refunds, and state-transition modules require `100%` line and branch coverage.
- backend domain services overall require `>= 90%`.
- shared validation and schema packages require `>= 95%`.
- UI code is not held to an artificial blanket `100%`.
- UI code must pass critical route, state, privacy, accessibility, and journey tests.

Frontend coverage policy:

- Shared frontend infrastructure must have unit and component tests for every state branch.
- Critical screen components must test loading, empty, error, offline, stale, unauthorized, and success states where applicable.
- Critical mutations must test success, failure, duplicate, authorization denial, and blocked states.
- Launch-critical E2E journeys must pass before production release.
- A route with a backend mutation cannot merge without at least one success path and one failure path test.

## Required Tooling Direction
### Unit And Integration
Use Vitest for:

- shared TypeScript utilities
- frontend formatters
- analytics redaction
- localization key resolution
- permission helpers
- route guard logic
- API client mapping
- cache policy logic
- outbox state reducers
- domain-level UI decision functions

### Web And Admin E2E
Use Playwright for:

- public web journeys
- receiver public journeys
- admin web journeys
- web accessibility scans
- privacy DOM checks
- route guard tests
- download/export UI tests
- webhook and audit detail view tests

### Mobile Component Tests
Use React Native Testing Library for:

- sender mobile screens
- operations mobile screens
- mobile shared components
- accessibility labels and states
- form behavior
- scan fallback UI
- proof capture state machines
- offline and stale state rendering

### API Service Tests
Continue using Vitest for:

- API routes
- service functions
- schema validation
- idempotency
- payment reconciliation
- public tracking verification
- station actions
- handoff actions
- refunds
- issues
- notifications

## Harness Architecture
The test harness has ten layers.

### Persona Layer
Defines test users:

- public visitor
- receiver with valid tracking access
- receiver with expired access
- sender
- station operator
- driver
- final-mile courier
- support admin
- finance admin
- ops admin
- super admin
- locked account
- wrong-role actor

Persona fields:

```ts
type TestPersona = {
  personaId: string;
  role: string;
  stationScope?: string;
  assignmentScope?: string;
  capabilities: string[];
  authState: "anonymous" | "authenticated" | "expired" | "locked" | "forbidden";
};
```

Rules:

- Persona records must be generated from safe seed data.
- Persona IDs must not match real user IDs.
- Persona names and phones must use reserved test values.
- Role permissions must match backend policy.

### Data Builder Layer
Creates safe records for tests:

- delivery
- package
- package label
- sender
- receiver
- station
- driver assignment
- courier assignment
- payment
- refund
- issue
- proof intent
- notification
- webhook event
- audit event
- analytics event

Rules:

- Builders must enforce valid default records.
- Invalid records require explicit builder method names.
- Builders must never use production data.
- Builders must allow state-specific records for blocked, stale, offline, and conflict cases.

### API Fixture Layer
Provides controlled API responses:

- success responses
- validation errors
- authorization errors
- rate limits
- payment provider unavailable
- webhook conflict
- stale data
- partial data
- server failure

Rules:

- API fixtures must be typed against shared contracts.
- Fixtures must fail if response shape drifts.
- Route handlers must validate request body for mutation tests.
- Tests must verify no unsupported mutation is called.

### App Harness Layer
Wraps screens with:

- app shell
- role provider
- route provider
- API client
- cache provider
- outbox provider
- localization provider
- analytics provider
- accessibility provider
- notification provider
- feature flag provider

Rules:

- Each screen can be mounted with the same provider stack used by production.
- Tests can override network, role, route, and source freshness.
- Tests cannot skip role routing unless the test specifically targets the component in isolation.

### Clock And Network Layer
Controls:

- current time
- stale data age
- retry windows
- OTP expiration
- payment pending windows
- refund review windows
- network online
- network offline
- degraded network
- request timeout

Rules:

- Time-sensitive tests must use `TestClock`.
- Offline tests must use `TestNetworkController`.
- Do not rely on real timers for critical retry behavior.

### Device Layer
Controls:

- viewport size
- mobile safe areas
- keyboard visible state
- reduced motion
- text scale
- high contrast
- camera permission state
- media upload capability

Rules:

- Mobile critical flows must run at small, common, and large device sizes.
- Reduced motion tests must cover interactive motion where relevant.
- Text scale tests must cover critical forms and state screens.

### Assertion Layer
Provides shared assertions:

- `expectScreenReady`
- `expectRoleDenied`
- `expectNoRestrictedData`
- `expectPaymentBlocked`
- `expectCustodyHolder`
- `expectTimelineEvent`
- `expectOutboxQueued`
- `expectOutboxSynced`
- `expectAnalyticsEvent`
- `expectNoAnalyticsRestrictedFields`
- `expectLocalizedKeyRendered`
- `expectAccessibleName`
- `expectFocusOn`
- `expectToast`
- `expectStateMessage`

### Privacy Scanner Layer
Scans:

- rendered DOM
- accessibility tree where available
- route URLs
- local storage
- session storage
- analytics sink
- console output
- error boundaries
- screenshots and traces where feasible

Restricted patterns:

- full phone values
- raw tracking codes
- raw scan codes
- signed URLs
- provider error text
- proof asset references
- issue descriptions
- admin notes
- auth tokens
- receiver tokens

### Accessibility Runner Layer
Runs:

- automated web accessibility checks
- keyboard navigation checks
- focus order checks
- live region checks
- reduced motion checks
- text scale checks
- React Native accessibility prop checks

Automated checks do not replace manual assistive technology review.

### CI Artifact Layer
Collects:

- coverage reports
- E2E traces
- screenshots on failure
- videos on failure where useful
- console logs with redaction
- network logs with redaction
- accessibility reports
- privacy scan reports
- flake reports

Rules:

- Artifacts must redact sensitive values.
- Artifacts from proof flows must not contain real proof media.
- CI artifacts expire according to repository policy.

## Test ID Contract
Test IDs are binding where the frontend inventory defines them.

Rules:

- Primary screen test ID must match inventory.
- Modal test ID must match modal specs.
- Shared component test IDs must use stable prefixes.
- Test IDs must not contain personal data.
- Test IDs must not contain runtime IDs.
- Test IDs must not change without updating inventory, specs, and tests in the same PR.

Required registry:

```ts
type TestIdDefinition = {
  testId: string;
  ownerSpec: string;
  surface: string;
  route?: string;
  requiredStates: string[];
};
```

CI gate:

```text
Every routed screen in the frontend inventory must have either a matching implemented test ID or a tracked not-yet-built status before launch.
```

## Critical E2E Journey Requirements
### Public Tracking And Receiver OTP
Test case:

```text
e2e-public-track-receiver-otp
```

Must prove:

- tracking form accepts valid tracking code class
- invalid code shows safe error
- receiver link opens safe landing
- phone challenge can be requested
- rate limit state renders
- OTP verify succeeds
- expired OTP fails safely
- receiver timeline renders receiver-safe state
- no sender ID leaks
- no staff ID leaks
- no payment details leak
- no internal issue notes leak

### Sender Create Pay Track
Test case:

```text
e2e-sender-create-pay-track
```

Must prove:

- sender starts delivery draft
- receiver details validate
- package details validate
- route selection validates
- quote amount locks from backend
- payment initializes
- payment confirms before transport
- delivery detail shows payment confirmed
- timeline updates after lifecycle events
- analytics emits safe funnel events
- address and receiver phone do not enter analytics

### Sender Cancellation
Test case:

```text
e2e-sender-cancel-eligible-delivery
```

Must prove:

- eligible delivery can request cancellation
- ineligible delivery is blocked
- reason code submits
- refund state renders when applicable
- refund promise copy is policy-safe
- payment and refund records remain source of truth

### Station Intake Label Binding
Test case:

```text
e2e-station-intake-label-binding
```

Must prove:

- station operator can scan package label
- scan mismatch blocks
- duplicate label blocks
- successful intake binds label once
- condition is stored
- custody remains station
- analytics excludes raw scan code

### Station Dispatch Without Custody Transfer
Test case:

```text
e2e-station-dispatch-no-custody-transfer
```

Must prove:

- station prepares dispatch
- assigned driver is required
- dispatch readiness does not move custody
- payment blockers prevent movement
- issue blockers prevent movement
- handoff remains pending until driver scan

### Driver Pickup Custody Transfer
Test case:

```text
e2e-driver-pickup-custody-transfer
```

Must prove:

- assigned driver sees assigned run
- wrong driver is denied
- scan match is required
- pickup confirmation changes custody to driver
- timeline records handoff
- duplicate pickup is blocked
- offline queue preserves idempotency

### Destination Receipt
Test case:

```text
e2e-destination-receipt-condition-check
```

Must prove:

- destination station scans package
- condition check is required
- destination receipt stores condition
- custody changes only after scan
- next step routes to pickup or final-mile assignment
- issue state blocks where required

### Final-Mile Assignment
Test case:

```text
e2e-final-mile-assignment-no-custody-transfer
```

Must prove:

- station assigns courier
- assignment does not move custody
- unassigned courier cannot accept
- assignment visible to correct courier
- station queue updates correctly

### Courier Custody And Completion
Test cases:

```text
e2e-courier-accepts-custody
e2e-courier-completes-with-otp
e2e-courier-completes-with-photo-proof
```

Must prove:

- courier scans before custody acceptance
- custody changes to courier only after assigned scan
- OTP completion requires active receiver verification token
- photo proof requires upload create, storage PUT, upload confirmation, then complete
- signature proof path follows the same proof quality rules when enabled
- completion fails without proof
- proof media does not enter analytics
- proof media does not enter logs

### Courier Failed Attempt
Test case:

```text
e2e-courier-failed-attempt-reroute
```

Must prove:

- failed attempt reason is required
- reattempt limit state renders
- return-to-station path renders when required
- issue path opens when escalation is chosen
- receiver-safe copy remains privacy-safe

### Admin Delivery Custody Audit
Test case:

```text
e2e-admin-delivery-custody-audit
```

Must prove:

- admin can search delivery
- current state renders
- payment state renders
- issue state renders
- timeline renders
- custody chain renders each handoff
- evidence hierarchy renders
- audit links render
- restricted data follows role policy

### Admin Pricing Update
Test case:

```text
e2e-admin-pricing-rule-update
```

Must prove:

- finance admin can edit complete corridor table
- incomplete corridor table blocks save
- new quote uses new active pricing rule
- existing delivery keeps locked quote
- audit-sensitive confirmation is required

### Admin Refund Settlement
Test case:

```text
e2e-admin-refund-settlement
```

Must prove:

- finance admin sees refund evidence
- review approve and reject paths work
- settlement requires approved refund
- settlement result renders
- provider failure state renders safely
- customer refund copy does not overpromise

### Admin Launch Readiness
Test case:

```text
e2e-admin-launch-readiness-blocked-ready
```

Must prove:

- blockers render
- station validation blockers render
- payment/provider blockers render
- ready state renders only when all blockers clear
- `GET /v1/admin/launch-readiness` blocked result blocks launch UI

### Offline Outbox Replay
Test case:

```text
e2e-offline-outbox-replay
```

Must prove:

- approved staff action queues offline
- queued copy says not yet sent
- idempotency key persists
- replay runs on network recovery
- duplicate prevention works
- conflict state renders when server state changed
- analytics sees redacted queue events only

### Role Permission Guards
Test case:

```text
e2e-role-permission-guards
```

Must prove:

- wrong-role sender cannot access station action
- wrong-role driver cannot accept another driver's run
- station operator cannot perform finance admin action
- support admin cannot settle refund unless policy allows it
- receiver public route cannot see admin data
- denied states do not confirm hidden resource existence

## Component Harness Requirements
Every shared component must have tests for:

- loading state
- empty state
- error state
- offline state
- stale data state
- unauthorized state
- success state
- disabled state
- keyboard access
- screen-reader labels
- reduced motion where relevant
- analytics event emission where relevant
- localization key rendering where relevant
- restricted data exclusion

Shared components requiring complete component tests:

- app shell
- role route guard
- typed API client adapter
- RTK Query cache adapters
- offline outbox
- scan component
- proof capture component
- timeline component
- custody chain component
- payment status component
- issue status component
- notification system
- form system
- empty/error library
- accessibility primitives
- localization provider
- analytics provider

## API Integration Harness Requirements
API integration tests must cover:

- request validation
- response validation
- authorization
- role scope
- idempotency
- rate limits
- payment state gates
- issue lock gates
- station validation gates
- refund eligibility
- webhook idempotency
- public tracking challenge limits
- public tracking verification
- audit creation
- error code mapping

Frontend integration tests must assert:

- typed API hooks call the right operation
- mutation payload matches shared contract
- unsupported mutation is not called
- server validation maps to form errors
- normalized API error maps to state component
- request IDs are shown only where policy allows
- stale data metadata reaches UI state

## Accessibility Harness Requirements
Automated accessibility checks must cover:

- public landing
- public tracking entry
- receiver verification
- sender create delivery
- sender payment
- station intake
- driver pickup
- courier proof
- admin delivery detail
- admin refund review
- admin station validation
- shared modals
- shared error states

Required assertions:

- heading hierarchy is logical
- primary action has accessible name
- form fields have labels
- validation errors link to fields
- keyboard can reach actions
- focus moves predictably after modal open and close
- live region announces async status
- status is not color-only
- contrast passes target
- text scale does not clip critical copy
- reduced motion suppresses non-essential motion

Manual accessibility review is required for:

- screen-reader path through sender create-pay-track
- screen-reader path through receiver verification
- station intake scan fallback
- driver handoff confirmation
- courier proof capture
- admin refund review

## Privacy Harness Requirements
The privacy harness must scan:

- rendered output
- route URLs
- local storage
- session storage
- analytics sink
- error boundary payloads
- console output
- network request bodies where controlled
- E2E trace metadata where available

Forbidden leakage checks:

- receiver full phone
- receiver full name
- full tracking code
- full address
- delivery instructions
- raw scan code
- proof asset reference
- signed URL
- photo bytes
- signature image
- issue description
- admin note
- provider raw error
- webhook payload
- auth token
- receiver token
- idempotency key

Required privacy tests:

- public tracking denial does not confirm hidden delivery existence
- receiver timeline hides sender payment details
- sender analytics excludes receiver phone and address
- scan analytics excludes raw scan code
- proof analytics excludes proof media and proof reference
- notification analytics excludes title, body, phone, and tracking code
- admin webhook detail does not leak raw payload into analytics
- error boundary does not show stack trace to user

## Localization Harness Requirements
The localization harness must test:

- every visible string is keyed where infrastructure requires it
- missing key fails CI for critical screens
- `en-GH` launch locale loads
- `GHS` formatting works
- `Africa/Accra` time formatting works
- plural messages handle zero, one, and many
- route metadata uses localized keys
- accessibility labels use localized keys
- state copy uses localized keys
- notification copy uses localized keys
- longer copy does not break critical layouts

## Analytics Harness Requirements
The analytics harness must test:

- event registry rejects unknown events
- event payload requires required properties
- event payload rejects forbidden fields
- screen view fires once per route activation
- sender funnel events are ordered
- payment events use safe amount buckets unless protected finance policy allows exact value
- proof events exclude proof media
- scan events exclude raw scan code
- issue events exclude issue text
- refund events align with finance policy
- admin events exclude raw audit and webhook payloads
- offline analytics queues redacted payloads only

## Offline Harness Requirements
Offline tests must cover:

- station intake queued action
- driver pickup queued action
- courier proof queued action
- issue creation queued action where allowed
- queue persistence
- replay success
- replay conflict
- duplicate prevention
- stale data display
- offline state recovery
- analytics queue interaction

Rules:

- Payment and refund settlement must not queue offline unless policy explicitly changes.
- Receiver OTP verification must not pretend to complete offline.
- Admin finance actions must not queue offline.
- Queued copy must say the action has not reached the server.

## Scan And Proof Harness Requirements
Scan tests:

- camera permission denied state
- manual entry fallback where allowed
- scan match
- scan mismatch
- duplicate scan
- package already received
- wrong role scan
- wrong station scan
- offline scan queue
- scan analytics redaction

Proof tests:

- OTP proof success
- OTP expired
- OTP invalid
- photo proof upload create
- photo proof storage upload
- photo proof confirm
- photo proof complete
- signature proof draw
- signature proof clear
- signature proof complete
- fallback reason required
- proof required blocker
- proof analytics redaction
- proof media privacy

Physical-device QA remains required for camera quality, photo capture, signature input, and weak-network behavior.

## Payment And Refund Harness Requirements
Payment tests:

- quote amount locks
- payment initialization succeeds
- payment initialization failure renders safe recovery
- payment pending blocks transport
- payment confirmed allows eligible transport
- payment under review blocks bypass
- payment provider unavailable state
- duplicate payment confirmation state

Refund tests:

- refund eligibility allowed
- refund eligibility denied
- refund review approve
- refund review reject
- refund settlement succeeds
- settlement provider failure renders safe state
- settled refund cannot settle twice
- customer refund copy avoids automatic compensation promise

## Admin Harness Requirements
Admin tests must cover:

- admin dashboard
- admin analytics
- launch readiness
- delivery explorer
- delivery detail
- custody chain
- station validation
- station status override
- pricing rule edit
- user access update
- finance overview
- payment reconciliation
- refund review
- refund settlement
- issue detail
- webhook event detail
- webhook replay
- outbound notifications
- export report
- audit event detail

Required admin assertions:

- role guard blocks unauthorized admin role
- high-risk actions require confirmation
- audit-sensitive copy appears
- raw provider payloads are hidden unless the role and screen allow safe diagnostic view
- exports use approved filters
- finance totals match reconciliation source
- station readiness blockers render before ready state

## CI Gate Requirements
Required PR gates:

```text
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm check:critical-coverage
pnpm check:security-rules
pnpm check:backend-readiness
pnpm build
pnpm check:api-runtime-imports
```

Required future frontend gates:

```text
pnpm test:unit
pnpm test:components
pnpm test:e2e
pnpm test:accessibility
pnpm check:test-ids
pnpm check:analytics-privacy
pnpm check:localization-keys
pnpm check:frontend-critical-journeys
pnpm check:privacy-fixtures
```

The future commands do not need to exist in this documentation PR, but implementation must add equivalent checks before broad UI work is considered release-ready.

## Flake Discipline
Flaky tests are treated as release risk.

Rules:

- No failing critical journey can be ignored.
- A flaky critical journey blocks release until fixed or formally quarantined with owner, expiry, and mitigation.
- Quarantine is not allowed for payment bypass, custody bypass, proof bypass, refund settlement, public privacy leak, or role guard failures.
- Retries may be used only to reduce external timing noise, not to hide broken behavior.
- Every flaky test must have a tracked root cause.

Flake report fields:

```ts
type FlakeReport = {
  testCaseId: string;
  owner: string;
  firstSeenAt: string;
  affectedSurface: string;
  failureClass: string;
  releaseImpact: "blocks_release" | "blocks_flow" | "non_critical";
  mitigation: string;
  expiresAt: string;
};
```

## Test Data Rules
Seed data must:

- use reserved test phones
- use non-real names
- use non-real addresses
- use non-production payment references
- use non-production station IDs
- use deterministic IDs
- support cleanup
- support replay
- support conflict states
- support wrong-role states
- support expired states

Seed data must not:

- include real customer data
- include real staff data
- include real receiver phone
- include real proof media
- include production provider references
- depend on production credentials

## Release Evidence
Every release candidate must have:

- CI pass
- critical coverage pass
- critical E2E pass
- accessibility report for critical screens
- privacy scan report
- backend readiness pass
- security rules pass
- launch readiness state
- known issue list
- unresolved flake list
- manual QA sign-off for physical-device scan and proof flows

## Implementation Roadmap
### Phase 1: Extend Existing Vitest Discipline
Build:

- frontend unit test config
- shared frontend test utilities
- test data builders
- test role personas
- route test ID registry
- coverage report integration

Exit criteria:

- web, admin, and mobile packages can run tests
- shared frontend infrastructure can be tested without app-specific setup
- critical route test IDs can be validated

### Phase 2: Component Harness
Build:

- `TestAppShell`
- `TestRoleProvider`
- `TestApiServer`
- `TestAnalyticsSink`
- `TestLocalizationProvider`
- `TestAccessibilityRunner`
- shared assertions
- privacy scanner

Exit criteria:

- shared components have state and privacy tests
- role guard tests run for all protected screen types
- analytics and localization test hooks work

### Phase 3: Web And Admin E2E
Build:

- Playwright config
- public web E2E fixtures
- receiver verification E2E fixtures
- admin E2E fixtures
- trace artifact collection
- accessibility gate
- privacy DOM scan

Exit criteria:

- public tracking receiver OTP journey passes
- admin custody audit journey passes
- admin refund settlement journey passes
- role permission guard journey passes

### Phase 4: Mobile Critical Flow Harness
Build:

- React Native component harness
- mobile state harness
- scan fallback harness
- proof state harness
- offline outbox harness
- sender create-pay-track test path
- operations critical test paths

Exit criteria:

- sender create-pay-track component/integration path passes
- station intake label binding path passes
- driver pickup custody path passes
- courier proof path passes

### Phase 5: Full Launch Journey Gate
Build:

- complete E2E journey registry
- critical journey CI job
- flake report
- release evidence report
- privacy and accessibility report aggregation

Exit criteria:

- all required E2E journey IDs from the frontend inventory have automated coverage or documented manual coverage where automation is insufficient
- release owner can inspect one evidence bundle per release candidate

## Claude Code Build Brief
When Claude Code implements this foundation, build testing infrastructure before large UI implementation.

Claude Code must:

- preserve existing `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, and `pnpm check:critical-coverage`
- add frontend unit and component test scripts
- add Playwright E2E for web and admin
- add React Native component tests for mobile apps
- add route test ID registry validation
- add test persona registry
- add typed test data builders
- add controlled API fixture handlers
- add offline and clock controls
- add privacy scanner
- add accessibility checks
- add analytics event sink tests
- add localization key tests
- add critical E2E journey registry
- collect CI artifacts with redaction
- keep tests isolated from production services and credentials

Claude Code must not:

- implement actual UI screens as part of this spec
- weaken existing backend coverage gates
- bypass failing critical tests
- use production data
- use production credentials
- rely on provider live systems in PR CI
- treat frontend unit coverage as enough for custody, payment, proof, refund, or receiver privacy
- let tests assert internal component details where user-visible behavior is available
- let analytics or logs contain restricted data during tests

## Edge Cases
Required handling:

- test API server returns malformed response
- test API server returns unknown error code
- auth token expires mid-journey
- user role changes mid-session
- network drops during staff mutation
- network returns during outbox replay
- duplicate mutation replay
- stale cache renders before fresh data
- route param is invalid
- receiver tracking link expired
- OTP expires during flow
- payment provider unavailable
- refund settlement provider unavailable
- proof upload create succeeds but upload confirm fails
- camera permission denied
- text scale causes layout pressure
- reduced motion enabled
- accessibility live region fires more than once
- analytics provider unavailable
- localization key missing
- CI artifact contains restricted string
- E2E trace includes sensitive route param

Recovery rules:

- Malformed response must fail typed API tests.
- Unknown error code must map to safe error state.
- Expired auth must route to session state.
- Role change must re-evaluate route guard.
- Offline staff mutation must queue only if policy allows it.
- Duplicate replay must not duplicate handoff.
- Sensitive artifact detection must fail CI.
- Missing localization key must fail critical screen tests.
- Analytics provider failure must not fail user journey unless testing analytics itself.

## Acceptance Checklist
Engineering:

- Existing backend and shared coverage gates remain intact.
- Frontend test scripts are defined before UI scale-up.
- Shared harness modules are specified.
- Route test ID registry is specified.
- Critical journey registry is specified.
- CI gates are specified.

Product:

- Public receiver journey is covered.
- Sender create-pay-track journey is covered.
- Station, driver, and courier custody journeys are covered.
- Payment and refund journeys are covered.
- Admin launch readiness and audit journeys are covered.

Risk:

- Privacy scanner is required.
- Accessibility runner is required.
- Offline replay is required.
- Role guard tests are required.
- Proof and scan physical-device QA remain required.
- Flake discipline is explicit.

## Completion Statement
Claude Code should build `TestHarness` as Kra's shared frontend and full-stack quality infrastructure. It must extend existing Vitest and coverage discipline into web, mobile, and admin apps; add Playwright E2E for public and admin flows; add React Native component coverage for mobile flows; enforce route test IDs, role boundaries, privacy scanning, accessibility checks, analytics payload safety, localization key coverage, offline outbox replay, and every launch-critical E2E journey in the frontend inventory. It must never rely on production data or credentials, never weaken existing critical coverage gates, and never allow untested payment, custody, proof, refund, receiver privacy, or admin override paths to pass release.
