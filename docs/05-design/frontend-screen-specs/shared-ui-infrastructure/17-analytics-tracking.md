# Analytics Tracking Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Analytics tracking |
| Component family | Shared UI infrastructure |
| Primary modules | `KraAnalyticsProvider`, `AnalyticsClient`, `AnalyticsEventRegistry`, `AnalyticsPrivacyGuard`, `AnalyticsRedactor`, `AnalyticsConsentPolicy`, `AnalyticsQueue`, `AnalyticsFlushController`, `ScreenViewTracker`, `ActionTracker`, `MutationOutcomeTracker`, `FunnelTracker`, `OperationalEventBridge`, `AnalyticsTestHarness` |
| Supporting modules | `RouteAnalyticsAdapter`, `RoleAnalyticsContext`, `DeviceAnalyticsContext`, `NetworkAnalyticsContext`, `OfflineAnalyticsBuffer`, `OutboxAnalyticsBridge`, `ApiErrorAnalyticsMapper`, `FormAnalyticsBridge`, `PaymentAnalyticsBridge`, `ProofAnalyticsBridge`, `ScanAnalyticsBridge`, `NotificationAnalyticsBridge`, `AdminActionAnalyticsBridge`, `CopyAnalyticsBridge`, `AccessibilityAnalyticsBridge` |
| Inventory behavior | Track major funnel, handoff, payment, proof, issue, refund, admin actions |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, future shared frontend UI package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web console |
| Primary users | product leads, ops admins, finance admins, support admins, station operators, drivers, final-mile couriers, senders, receivers, QA, privacy reviewers, data analysts, engineers |
| Backend coverage | delivery lifecycle, payment lifecycle, refund lifecycle, issue lifecycle, handoff events, proof capture, scan results, station validation, admin actions, notification events, webhook events, audit events, public tracking verification, typed API client errors |
| Browser mutation operation | None directly; analytics emits telemetry only and must never mutate delivery, payment, custody, refund, issue, proof, station, user, or admin records |
| Data sensitivity | actor IDs, delivery IDs, tracking codes, receiver phone, receiver name, address, package description, scan codes, proof asset data, payment IDs, provider references, refund references, issue text, admin notes, station scope, request IDs, route paths |
| Offline critical | Yes for operations mobile event capture, but analytics must never block operational actions and must preserve privacy while queued |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, scan component, proof capture component, timeline component, custody chain component, payment status component, issue status component, notification system, form system, empty/error library, accessibility foundation, localization foundation, test harness |
| Related analytics docs | events tracking plan, KPIs, dashboard metrics |
| Related security docs | privacy and data retention, authorization rules, audit trail spec, fraud and abuse prevention |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, blocked by payment, blocked by issue, manual review required, scan mismatch, duplicate package label, custody not confirmed, OTP required, proof required, payment under review, refund pending, webhook conflict, rate limited |
| Design tokens | no unique visual tokens; analytics consumes route, role, state, network, locale, privacy, and source freshness metadata from existing infrastructure |
| Accessibility target | Analytics must not infer disability status or expose accessibility labels, hidden text, assistive technology names, or sensitive user behavior beyond explicit approved accessibility telemetry |
| Privacy target | No raw proof assets, full phone numbers, full tracking codes, addresses, user-entered descriptions, provider payloads, secrets, or unrestricted personal data in analytics payloads |

## Purpose
The analytics tracking foundation is Kra's shared contract for product, funnel, operational, quality, privacy, and admin telemetry across frontend apps.

It covers:

- screen views
- route views
- public tracking entry events
- receiver verification events
- sender create-delivery funnel events
- quote and payment events
- delivery detail and timeline events
- cancellation events
- issue events
- refund events
- station intake and dispatch events
- driver assignment and handoff events
- final-mile courier proof events
- scan success and scan failure events
- notification events
- empty and error state events
- offline outbox events
- admin action events
- audit-adjacent frontend events
- localization and copy fallback events
- accessibility-safe operational telemetry
- CI enforcement for event schemas and privacy

The most important rule is:

```text
Kra analytics must help improve delivery reliability without becoming a second database of sensitive delivery, payment, receiver, proof, or staff data.
```

## Product Job
Kra needs analytics to prove whether the product is solving real delivery failures.

The analytics system must answer:

- Are senders completing delivery creation?
- Where do senders abandon quote or payment?
- Are receivers able to verify and track without support?
- Are station operators scanning the right packages?
- Where do handoffs fail?
- How often does proof capture complete?
- Which routes create delays or issues?
- Which payment states create support load?
- Which refund and dispute paths need review?
- Which admin actions affect launch readiness?
- Which offline actions create conflicts?
- Which frontend states cause retry loops?

The system must do this without leaking sensitive payloads, weakening privacy, slowing field actions, or inventing state that the backend does not own.

## Strategic Role
Kra is an operational network, not just an app. Analytics must measure the physical delivery system and the digital workflows that control it.

Strong analytics helps:

- find station bottlenecks
- reduce package loss
- reduce failed handoffs
- improve payment completion
- improve proof capture completion
- shorten issue resolution
- verify refund controls
- identify training gaps for staff
- detect broken frontend states
- keep pilot KPIs honest

Weak analytics creates risk:

- leadership sees attractive charts that do not match source-of-truth records
- support cannot explain user friction
- product teams optimize vanity clicks instead of delivery reliability
- privacy-sensitive receiver and proof data leaks into event tools
- offline staff actions appear complete before server acceptance
- admin override behavior is not measurable
- dashboards drift away from backend records

Analytics is therefore part of execution discipline and operational quality.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing Kra product telemetry.

Surface type:

- Shared event infrastructure, privacy guardrails, queueing, schema enforcement, and test utilities.

Primary action:

- Capture the right event at the right product moment with the smallest safe payload.

Visual thesis:

- `Invisible measurement, visible accountability`: analytics must never clutter UI, but it must make the product accountable to delivery, payment, proof, issue, refund, and admin outcomes.

Restraint rule:

- Do not track every click. Track decision points, critical outcomes, safety failures, funnel steps, and operational exceptions that are tied to KPIs or support decisions.

Density:

- Public and receiver analytics are privacy-minimal.
- Sender analytics emphasize funnel and recovery.
- Operations analytics emphasize handoff, scan, proof, offline, and conflict outcomes.
- Admin analytics emphasize review, approval, override, export, replay, and settlement actions.

Platform stance:

- Frontend analytics dispatches approved events only.
- Backend records remain source of truth for operational metrics.
- Frontend analytics enriches user journey and client-side friction, not financial truth.
- Event schema is typed and validated before dispatch.
- Privacy redaction happens before queueing and before provider dispatch.

## External Research Used
Only directly relevant event modeling, analytics, telemetry, logging, and privacy sources were used:

- [Segment Track Spec](https://www.twilio.com/docs/segment/connections/spec/track): supports named action events with properties and contextual data.
- [Segment Page Spec](https://www.twilio.com/docs/segment/connections/spec/page): supports page view tracking with name, category, and properties.
- [Segment Screen Spec](https://www.twilio.com/docs/segment/connections/spec/screen): supports mobile screen view tracking with screen names and properties.
- [Google Analytics events guide](https://developers.google.com/analytics/devguides/collection/ga4/events): supports event-based measurement and custom event parameters.
- [Google Analytics policies on PII](https://support.google.com/analytics/answer/6366371): supports keeping personally identifiable information out of analytics payloads.
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/): supports consistent telemetry naming, attributes, and cross-system correlation discipline.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports security-aware event logging, sensitive data exclusion, event consistency, and audit-safe logging principles.
- [W3C Privacy Principles](https://www.w3.org/TR/privacy-principles/): supports data minimization, purpose limitation, and privacy-by-design constraints.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/11-analytics/kpis.md`
- `docs/11-analytics/dashboard-metrics.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
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
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/15-qa/quality-strategy.md`

## Non-Goals
The analytics foundation must not:

- implement actual frontend UI in this documentation PR
- replace backend audit logs
- replace backend operational records
- replace payment reconciliation
- replace refund settlement records
- replace handoff events
- replace proof asset records
- replace webhook event records
- send raw proof assets
- send full tracking codes
- send full phone numbers
- send receiver full names
- send addresses
- send package descriptions
- send raw issue descriptions
- send admin notes
- send provider payloads
- send signed URLs
- send secrets
- send accessibility hidden text
- infer disability or assistive technology use
- block operational actions when analytics fails
- create frontend-only operational truth
- track every pointer or tap
- use analytics as authorization evidence
- use analytics as proof of handoff
- use analytics as proof of payment

## Current Dependency Reality
Current repo state:

- The analytics docs define approved operational and UX events.
- The frontend inventory expands the analytics event contract across public, sender, operations, and admin flows.
- The privacy doc forbids unrelated marketing automation in the pilot.
- Existing shared specs already define privacy-sensitive analytics constraints for typed API client, scan, proof, issue, notification, accessibility, and localization.
- No dedicated frontend analytics package is currently present in package manifests.

Implementation implication:

- Claude Code must introduce a typed analytics layer before broad screen instrumentation.
- Analytics event schemas must be shared across apps.
- Analytics dispatch must be replaceable so the team can connect a provider later without rewriting screens.
- Local tests must validate event shape and privacy before provider integration.

## Core Principles
Kra analytics follows these principles:

### Purpose-Bound
Every event must answer a product, operations, finance, support, reliability, QA, or privacy question.

Rejected reasons:

- curiosity
- vanity count
- internal convenience
- unreviewed growth automation
- personal behavior profiling outside approved product use

### Minimal
Each event includes the smallest safe set of fields.

Rules:

- Prefer state categories over raw values.
- Prefer hashed or redacted IDs where exact ID is not required.
- Prefer route class over full URL where a path contains IDs.
- Prefer count buckets over item details.
- Prefer status code over provider message.

### Source-Of-Truth Aware
Frontend analytics does not become the operational ledger.

Rules:

- Delivery completion comes from backend delivery state.
- Payment totals come from reconciliation records.
- Refund totals come from refund records.
- Handoff truth comes from handoff events.
- Proof truth comes from proof records.
- Analytics may measure UI friction around those events.

### Privacy First
Analytics must not create a sensitive shadow profile.

Rules:

- Redact before queueing.
- Redact before retry.
- Redact before logs.
- Redact before provider dispatch.
- Fail closed on restricted fields.

### Non-Blocking
Analytics must never block critical work.

Rules:

- If analytics dispatch fails, user action continues.
- If analytics queue is full, drop lowest-priority analytics events first.
- Do not retry analytics forever.
- Do not delay scan, proof, handoff, payment, refund, issue, or admin actions for analytics.

## Architecture Overview
The analytics foundation has eight layers.

### Event Definition Layer
Defines:

- event name
- version
- owner
- trigger
- allowed surfaces
- required properties
- optional properties
- forbidden properties
- privacy class
- retention class
- offline handling
- source-of-truth relationship
- test fixtures for schema validation

### Context Layer
Provides safe context:

- app surface
- screen ID
- route class
- actor role
- country code
- locale
- app version
- build channel
- source freshness
- network state
- offline state
- session class
- consent policy state

The context layer must not add personal values automatically.

### Privacy Guard Layer
Rejects:

- phone numbers
- tracking codes
- addresses
- names where not approved
- provider references where not approved
- proof asset IDs where not approved
- signed URLs
- free-text descriptions
- admin notes
- tokens
- secrets
- raw route params
- user-entered form values

### Redaction Layer
Transforms:

- delivery IDs to approved IDs or hashes
- tracking codes to approved prefix or route class
- user IDs to role-scoped IDs where approved
- route paths to route class
- API errors to stable error codes
- payment provider messages to safe status codes
- issue descriptions to category and severity
- proof payloads to proof type and quality state

### Queue Layer
Handles:

- in-memory dispatch
- offline buffer
- priority
- retry windows
- flush on app foreground
- flush on network recovery
- max queue size
- drop policy
- provider unavailable state

### Dispatch Layer
Sends events to the selected analytics provider or internal endpoint.

Rules:

- Provider integration stays behind `AnalyticsClient`.
- Screens never call provider SDK directly.
- Dispatch failures return safe status only.
- Provider-specific IDs do not leak into UI state.

### Verification Layer
Runs:

- schema validation
- privacy validation
- event name validation
- route class validation
- required field validation
- forbidden field validation
- payload size validation
- critical event coverage validation

### Dashboard Mapping Layer
Maps frontend events to:

- product funnel dashboards
- public tracking friction dashboards
- sender payment dashboards
- operations handoff dashboards
- proof capture dashboards
- issue and refund dashboards
- admin action dashboards
- frontend quality dashboards

## Event Naming Standard
Event names use lower snake case.

Pattern:

```text
<surface>_<object>_<action>
```

Allowed action verbs:

- `viewed`
- `started`
- `submitted`
- `succeeded`
- `failed`
- `selected`
- `opened`
- `closed`
- `retried`
- `queued`
- `synced`
- `blocked`
- `confirmed`
- `completed`
- `requested`
- `updated`
- `resolved`
- `escalated`
- `settled`
- `replayed`
- `exported`

Rules:

- Use past tense for completed events.
- Use `requested` for user intent before backend acceptance.
- Use `succeeded` only after backend success.
- Use `failed` only after a known failure.
- Use `blocked` when policy or state prevents action.
- Use `queued` when offline outbox accepts a local action.
- Use `synced` when server accepts a queued action.
- Avoid ambiguous verbs such as `clicked`.
- Avoid provider names in event names.
- Avoid route names in event names unless route is the product object.

## Core Event Envelope
Every event must use the shared envelope.

```ts
type AnalyticsEventEnvelope<TProperties extends Record<string, unknown>> = {
  eventName: AnalyticsEventName;
  eventVersion: number;
  occurredAt: string;
  surface: "public_web" | "receiver_public" | "sender_mobile" | "operations_mobile" | "admin_web";
  screenId: string;
  routeClass?: string;
  actorRole?: string;
  actorIdHash?: string;
  sessionIdHash?: string;
  countryCode: string;
  locale: string;
  appVersion?: string;
  buildChannel?: "local" | "preview" | "production";
  sourceFreshness?: "fresh" | "stale" | "offline_cached" | "partial" | "unknown";
  networkState?: "online" | "offline" | "degraded" | "unknown";
  offlineState?: "online" | "queued" | "replaying" | "conflict" | "not_applicable";
  consentPolicyState?: "required" | "not_required" | "declined" | "unknown";
  properties: TProperties;
};
```

Rules:

- `eventVersion` starts at `1`.
- Breaking property changes require version increment.
- `occurredAt` must be ISO timestamp.
- `screenId` must match frontend inventory where available.
- `routeClass` must not include raw IDs.
- `actorIdHash` is allowed only for authenticated actors where approved.
- Receiver public flow should avoid durable actor identity unless policy approves it.
- `properties` must pass event-specific schema.

## Privacy Classes
Each event must declare a privacy class.

| Class | Meaning | Allowed payload |
| --- | --- | --- |
| `public_low` | public marketing or navigation with no record data | surface, route class, CTA ID, result category |
| `customer_safe` | sender or receiver workflow data after role checks | delivery ID hash, state, safe route, result category |
| `operations_safe` | staff task telemetry | station ID, role, assignment class, scan result category, state |
| `finance_safe` | payment or refund telemetry | payment ID hash, status, amount bucket or approved amount field |
| `admin_safe` | admin review and action telemetry | admin role, entity ID hash, action type, outcome |
| `quality_safe` | frontend quality and diagnostics | screen ID, error code, route class, source freshness |
| `restricted` | not allowed for analytics | raw personal data, proof media, secrets, provider payloads |

Rules:

- `restricted` fields must never be dispatched.
- Events that need finance data require finance owner approval.
- Events that need admin action data require admin owner approval.
- Public events must be `public_low` unless an approved receiver verification state is involved.

## Forbidden Fields
The analytics privacy guard must reject any payload containing:

- full phone number
- receiver full name
- sender full name
- full tracking code
- full address
- delivery instructions
- package description
- raw scan code
- OTP
- active receiver token
- proof asset ID unless the proof spec explicitly permits a redacted form
- proof media bytes
- signature image
- photo bytes
- signed URL
- storage bucket
- storage object path
- payment provider raw reference unless finance policy approves a redacted reference class
- provider error message
- refund provider reference unless approved
- issue free text
- admin note
- audit detail payload
- webhook raw payload
- auth token
- session token
- idempotency key
- dedupe key
- localization rendered message
- hidden accessibility label text

## Approved Identifier Policy
Identifiers require explicit policy.

| Identifier | Default analytics handling |
| --- | --- |
| `deliveryId` | use `deliveryIdHash` unless exact ID is approved for internal-only event store |
| `trackingCode` | use prefix only where inventory currently requires it; otherwise use `trackingCodeHash` or route class |
| `paymentId` | use `paymentIdHash` unless finance dashboard requires exact internal link in protected admin analytics |
| `refundId` | use `refundIdHash` unless finance policy approves exact internal link |
| `issueId` | use `issueIdHash` unless support analytics is internal-only |
| `proofAssetId` | forbidden by default |
| `stationId` | allowed for operations and admin analytics |
| `driverUserId` | use `actorIdHash` or `driverUserIdHash` |
| `courierUserId` | use `actorIdHash` or `courierUserIdHash` |
| `senderId` | use `actorIdHash` or `senderIdHash` |
| `adminUserId` | use `actorIdHash` with admin role |
| `requestId` | allowed for quality diagnostics only when not customer-visible analytics |

## Screen View Tracking
Screen view events are required for:

- public landing
- public pricing explainer
- public tracking entry
- receiver tracking landing
- receiver phone challenge
- receiver OTP verify
- receiver timeline
- receiver arrival instructions
- sender onboarding
- sender home
- sender create delivery steps
- sender quote review
- sender payment
- sender delivery detail
- sender issue create
- sender refund status
- station home
- station intake
- station dispatch
- driver home
- driver assignments
- driver pickup and handoff screens
- courier route and proof screens
- admin dashboard
- admin analytics
- admin station validation
- admin pricing
- admin user access
- admin refund review
- admin issue detail
- admin webhook detail
- admin audit detail

Event:

```ts
type ScreenViewedProperties = {
  screenId: string;
  screenGroup: string;
  entryPoint?: string;
  hasCachedData?: boolean;
  sourceFreshness: "fresh" | "stale" | "offline_cached" | "partial" | "unknown";
};
```

Rules:

- Do not include raw route params.
- Do not include full page URL when path contains IDs.
- Use route class from inventory.
- Screen view must fire once per route activation, not on every render.
- Refetches do not create new screen view unless route changes.

## Public And Receiver Events
Required events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `public_landing_viewed` | public landing render | `surface`, `routeClass`, `entryPoint` |
| `public_cta_selected` | approved public CTA selected | `ctaId`, `routeClass`, `destinationClass` |
| `public_tracking_submitted` | tracking form submit | `trackingCodePrefix`, `result` |
| `receiver_tracking_landing_viewed` | receiver link landing render | `routeClass`, `accessState` |
| `receiver_phone_challenge_requested` | phone challenge request accepted or blocked | `challengeStatus`, `attemptBucket` |
| `receiver_phone_verified` | OTP verification succeeds | `verifiedAtBucket`, `challengeAgeBucket` |
| `receiver_otp_failed` | OTP verification fails | `errorCode`, `attemptBucket` |
| `receiver_timeline_viewed` | receiver-safe timeline render | `deliveryState`, `eventCountBucket`, `sourceFreshness` |
| `receiver_arrival_instruction_viewed` | arrival instruction viewed | `instructionState`, `proofRequirement` |
| `receiver_failed_attempt_viewed` | failed attempt info viewed | `reasonCode`, `nextStep` |
| `receiver_access_denied_viewed` | receiver denied state viewed | `denialReasonClass` |

Privacy rules:

- Do not send receiver phone.
- Do not send full tracking code.
- Do not send sender identity.
- Do not send receiver name.
- Do not send full address.
- Do not send hidden delivery details.
- Use access state categories.

## Sender Funnel Events
Required events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `sender_delivery_create_started` | sender starts delivery draft | `entryPoint`, `actorIdHash` |
| `sender_delivery_receiver_submitted` | receiver step passes validation | `hasDoorstep`, `receiverPhoneCountry`, `addressCompleteness` |
| `sender_delivery_package_submitted` | package step passes validation | `sizeTier`, `weightBucket`, `fragile`, `declaredValueBucket` |
| `sender_delivery_route_submitted` | route step passes validation | `originStationId`, `destinationStationId`, `serviceType`, `doorstepRequested` |
| `sender_delivery_quote_viewed` | quote review shown | `originStationId`, `destinationStationId`, `serviceType`, `doorstepRequested`, `amountBucket` |
| `sender_delivery_created` | create delivery succeeds | `deliveryIdHash`, `quoteAmountBucket`, `paymentRequired` |
| `sender_delivery_create_failed` | create delivery fails | `errorCode`, `step`, `recoverable` |
| `sender_payment_method_viewed` | payment method screen render | `deliveryIdHash`, `amountBucket`, `paymentStatus` |
| `payment_initialized` | payment init succeeds | `deliveryIdHash`, `paymentIdHash`, `provider`, `amountBucket` |
| `payment_initialization_failed` | payment init fails | `deliveryIdHash`, `errorCode`, `provider`, `recoverable` |
| `payment_verified` | payment verify returns | `deliveryIdHash`, `paymentIdHash`, `paymentStatus` |
| `sender_delivery_detail_viewed` | delivery detail render | `deliveryIdHash`, `deliveryState`, `paymentStatus`, `issueState` |
| `delivery_cancel_requested` | cancellation submitted | `deliveryIdHash`, `reasonCode`, `deliveryState` |
| `delivery_cancel_failed` | cancellation fails | `deliveryIdHash`, `errorCode`, `deliveryState` |
| `sender_issue_create_started` | sender opens issue create | `deliveryIdHash`, `entryPoint` |
| `issue_created` | issue creation succeeds | `deliveryIdHash`, `issueIdHash`, `category`, `severity` |
| `sender_refund_status_viewed` | refund status viewed | `paymentIdHash`, `refundStatus`, `amountBucket` |

Privacy rules:

- Do not send receiver name.
- Do not send receiver phone.
- Do not send address.
- Do not send package description.
- Do not send payment phone.
- Do not send provider raw reference.
- Do not send issue text.

## Station Events
Required events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `station_home_viewed` | station home render | `stationId`, `queueBucket`, `sourceFreshness` |
| `station_intake_scan_started` | scan component starts intake scan | `stationId`, `actorRole`, `cameraPermissionState` |
| `station_intake_confirmed` | intake succeeds | `deliveryIdHash`, `stationId`, `condition`, `sizeTier` |
| `station_intake_failed` | intake fails | `stationId`, `errorCode`, `recoverable` |
| `package_scan_failed` | scan mismatch or duplicate | `deliveryIdHash`, `actorRole`, `errorCode`, `scanContext` |
| `station_dispatch_viewed` | dispatch queue render | `stationId`, `queueBucket`, `sourceFreshness` |
| `station_dispatch_confirmed` | dispatch succeeds | `deliveryIdHash`, `stationId`, `driverUserIdHash`, `nextState` |
| `destination_receipt_confirmed` | destination receipt succeeds | `deliveryIdHash`, `stationId`, `condition`, `nextStep` |
| `station_final_mile_assigned` | final-mile assignment succeeds | `deliveryIdHash`, `stationId`, `courierUserIdHash` |
| `station_issue_created` | station issue succeeds | `deliveryIdHash`, `issueIdHash`, `category`, `severity` |

Privacy rules:

- Do not send raw scan code.
- Do not send full tracking code.
- Do not send receiver phone.
- Do not send proof references.
- Use station ID only for station-scoped and admin-approved analytics.

## Driver Events
Required events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `driver_assignments_viewed` | assignments render | `assignmentCountBucket`, `sourceFreshness`, `networkState` |
| `driver_run_accepted` | driver accepts run | `deliveryIdHash`, `driverUserIdHash`, `originStationId`, `destinationStationId` |
| `driver_pickup_confirmed` | driver custody accepted | `deliveryIdHash`, `driverUserIdHash`, `proofRequirement`, `offlineState` |
| `driver_pickup_failed` | pickup mutation fails | `deliveryIdHash`, `errorCode`, `offlineState` |
| `delivery_marked_in_transit` | in-transit update succeeds | `deliveryIdHash`, `driverUserIdHash`, `offlineState` |
| `driver_handoff_conflict` | handoff conflict state shown | `deliveryIdHash`, `errorCode`, `sourceFreshness` |
| `driver_issue_created` | driver issue succeeds | `deliveryIdHash`, `issueIdHash`, `category`, `severity` |

Privacy rules:

- Do not send precise live location unless policy adds an approved operations location telemetry event.
- Do not send route snapshots.
- Do not send raw package codes.
- Do not send proof references.

## Final-Mile Courier Events
Required events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `courier_assignments_viewed` | assignments render | `assignmentCountBucket`, `sourceFreshness`, `networkState` |
| `courier_assignment_accepted` | courier custody accepted | `deliveryIdHash`, `courierUserIdHash`, `proofRequirement`, `offlineState` |
| `delivery_marked_out_for_delivery` | out-for-delivery succeeds | `deliveryIdHash`, `courierUserIdHash`, `offlineState` |
| `courier_receiver_verification_started` | receiver verification starts | `deliveryIdHash`, `verificationMethod`, `offlineState` |
| `proof_component_opened` | proof UI opens | `deliveryIdHash`, `proofType`, `surface`, `offlineState` |
| `proof_method_selected` | proof method selected | `deliveryIdHash`, `proofType`, `fallbackReasonCode` |
| `proof_asset_upload_started` | upload begins | `deliveryIdHash`, `proofType`, `byteSizeBucket` |
| `proof_asset_upload_confirmed` | upload confirmed | `deliveryIdHash`, `proofType`, `qualityState` |
| `proof_completion_succeeded` | delivery completion succeeds | `deliveryIdHash`, `proofType`, `offlineState` |
| `proof_completion_failed` | proof completion fails | `deliveryIdHash`, `proofType`, `errorCode`, `recoverable` |
| `failed_attempt_recorded` | final-mile failed attempt recorded | `deliveryIdHash`, `reasonCode`, `attemptNumberBucket` |
| `courier_issue_created` | courier issue succeeds | `deliveryIdHash`, `issueIdHash`, `category`, `severity` |

Privacy rules:

- Do not send OTP.
- Do not send receiver phone.
- Do not send receiver full name.
- Do not send signature image.
- Do not send photo bytes.
- Do not send proof asset ID by default.
- Do not send signed upload URL.
- Do not send precise doorstep location.

## Payment And Refund Events
Required payment events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `payment_initialized` | provider initialization succeeds | `deliveryIdHash`, `paymentIdHash`, `provider`, `amountBucket` |
| `payment_initialization_failed` | initialization fails | `deliveryIdHash`, `provider`, `errorCode`, `recoverable` |
| `payment_verified` | verification returns | `deliveryIdHash`, `paymentIdHash`, `paymentStatus` |
| `payment_under_review_viewed` | under-review state viewed | `deliveryIdHash`, `paymentIdHash`, `sourceFreshness` |
| `payment_failed_recovery_selected` | user chooses recovery action | `deliveryIdHash`, `paymentIdHash`, `actionId` |

Required refund events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `refund_review_started` | finance admin starts review | `paymentIdHash`, `refundIdHash`, `refundReasonCode` |
| `refund_review_completed` | review succeeds | `paymentIdHash`, `refundIdHash`, `refundStatus`, `amountBucket` |
| `refund_review_failed` | review mutation fails | `paymentIdHash`, `refundIdHash`, `errorCode`, `recoverable` |
| `refund_settled` | settlement succeeds | `paymentIdHash`, `refundIdHash`, `providerClass`, `amountBucket` |
| `refund_settlement_failed` | settlement fails | `paymentIdHash`, `refundIdHash`, `errorCode`, `providerClass` |

Privacy rules:

- Do not send payment phone.
- Do not send raw provider reference.
- Do not send provider error message.
- Use amount bucket for product analytics.
- Exact amount can be used only in protected finance analytics if approved and reconciled against backend records.

## Issue Events
Required issue events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `issue_create_started` | issue create screen opens | `deliveryIdHash`, `actorRole`, `entryPoint` |
| `issue_created` | issue creation succeeds | `deliveryIdHash`, `issueIdHash`, `category`, `severity` |
| `issue_create_failed` | issue create fails | `deliveryIdHash`, `errorCode`, `category`, `recoverable` |
| `issue_status_viewed` | issue status component viewed | `issueIdHash`, `category`, `severity`, `status` |
| `issue_escalated` | issue escalation succeeds | `issueIdHash`, `reasonCode`, `nextStatus` |
| `issue_resolved` | issue resolved or closed | `issueIdHash`, `nextStatus`, `resolutionCode` |
| `issue_resolution_failed` | resolution mutation fails | `issueIdHash`, `errorCode`, `recoverable` |

Privacy rules:

- Do not send issue description.
- Do not send reporter free text.
- Do not send admin notes.
- Do not send proof references.
- Do not send private resolution text unless approved and redacted.

## Admin Events
Required admin events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `admin_dashboard_viewed` | dashboard render | `role`, `sourceFreshness`, `visibleWidgetCount` |
| `admin_analytics_viewed` | analytics page render | `role`, `dateRangeBucket`, `filterCount` |
| `admin_launch_readiness_viewed` | launch readiness viewed | `status`, `blockerCountBucket` |
| `admin_station_validation_updated` | station validation update succeeds | `stationId`, `validationStatus`, `goLiveEligible` |
| `admin_station_status_updated` | station status update succeeds | `stationId`, `operatingStatus`, `intakeStatus` |
| `admin_pricing_rules_updated` | pricing rules update succeeds | `pricingRuleIdHash`, `routeCountBucket` |
| `admin_user_access_updated` | user access update succeeds | `targetUserIdHash`, `role`, `status` |
| `admin_notification_retry_requested` | outbound retry requested | `notificationIdHash`, `channel`, `status` |
| `admin_webhook_replay_requested` | webhook replay requested | `webhookEventIdHash`, `provider`, `status` |
| `admin_export_requested` | export requested | `exportType`, `dateRangeBucket`, `role` |
| `admin_audit_event_viewed` | audit event detail viewed | `auditEventIdHash`, `eventType`, `role` |
| `admin_high_risk_action_confirmed` | high-risk confirmation accepted | `actionType`, `entityType`, `role` |
| `admin_high_risk_action_cancelled` | high-risk confirmation cancelled | `actionType`, `entityType`, `role` |

Privacy rules:

- Do not send admin notes.
- Do not send raw audit payloads.
- Do not send webhook payloads.
- Do not send user phone or email unless a protected internal policy approves a redacted class.
- Do not send secrets.
- Do not send provider credentials.

## Shared Infrastructure Events
### Typed API Client
Events:

- `api_schema_mismatch_detected`
- `api_request_failed`
- `api_rate_limited`
- `api_authorization_denied`

Allowed fields:

- operation ID
- route class
- status code
- error code
- request ID where approved
- app surface
- app version

Forbidden:

- request body
- response body
- auth token
- receiver token
- raw path params

### RTK Query Cache
Events:

- `cache_stale_data_displayed`
- `cache_refetch_started`
- `cache_refetch_failed`
- `cache_partial_data_displayed`

Allowed fields:

- query key class
- screen ID
- source freshness
- age bucket
- error code

Forbidden:

- query args with IDs unless redacted
- response payload

### Offline Outbox
Events:

- `outbox_action_queued`
- `outbox_action_replay_started`
- `outbox_action_synced`
- `outbox_action_conflicted`
- `outbox_action_failed`
- `outbox_queue_cleared`

Allowed fields:

- action type
- actor role
- screen ID
- entity type
- entity ID hash
- retry count bucket
- conflict code
- network state

Forbidden:

- mutation payload
- idempotency key
- scan code
- proof reference
- free text

### Form System
Events:

- `form_started`
- `form_validation_failed`
- `form_submit_requested`
- `form_submit_succeeded`
- `form_submit_failed`
- `form_dirty_exit_blocked`

Allowed fields:

- form ID
- screen ID
- step ID
- error count bucket
- field key list only if approved and non-sensitive
- backend error code

Forbidden:

- field values
- receiver phone
- address
- payment phone
- issue description
- admin notes

### Empty And Error Library
Events:

- `state_viewed`
- `state_recovery_selected`
- `state_retry_requested`

Allowed fields:

- state type
- screen ID
- route class
- error code
- recovery action ID
- source freshness

Forbidden:

- rendered copy
- raw provider message
- hidden resource details

### Localization
Events:

- `localization_missing_key_detected`
- `localization_fallback_used`
- `localization_namespace_load_failed`
- `localization_formatter_error`

Allowed fields:

- key ID
- namespace
- locale
- surface
- screen ID

Forbidden:

- rendered localized text
- interpolation values containing personal data

### Accessibility
Events:

- `accessibility_focus_recovery_failed`
- `accessibility_state_announcement_emitted`
- `accessibility_reduced_motion_detected`

Allowed fields:

- screen ID
- component ID
- state type
- reduced motion true or false where policy allows

Forbidden:

- screen-reader identity
- disability inference
- assistive technology names
- hidden label text
- sensitive values

## Event Priority
Events must have priority:

| Priority | Meaning | Handling |
| --- | --- | --- |
| `critical_operational` | handoff, proof, scan, payment, refund, issue outcome telemetry | queue with short retry window |
| `critical_quality` | schema mismatch, privacy guard failure, app state blocker | dispatch quickly or queue |
| `important_product` | funnel step, receiver verification, payment recovery | queue if offline |
| `routine_product` | screen view, filter applied, support opened | drop first if queue pressure |
| `diagnostic` | local quality detail | development or protected internal use only |

Analytics priority must not override operational action priority.

## Queue And Retry Rules
Queue rules:

- Queue only redacted events.
- Never queue restricted payloads.
- Cap queue size.
- Store only required events offline.
- Encrypt at rest where platform storage policy requires it.
- Expire queued analytics events.
- Drop routine product events before critical events.
- Do not retry indefinitely.
- Flush on network recovery.
- Flush on app foreground.
- Flush before sign out where safe.

Offline event retention:

| Event class | Max offline retention |
| --- | --- |
| `critical_operational` | 7 days |
| `critical_quality` | 7 days |
| `important_product` | 72 hours |
| `routine_product` | 24 hours |
| `diagnostic` | current session only |

## Provider Abstraction
Screens must not call analytics provider SDKs directly.

Required interface:

```ts
type AnalyticsClient = {
  track<T extends AnalyticsEventName>(
    eventName: T,
    properties: AnalyticsPropertiesFor<T>,
    options?: AnalyticsDispatchOptions
  ): void;
  screen(screenId: string, properties?: ScreenViewProperties): void;
  page(pageId: string, properties?: PageViewProperties): void;
  flush(): Promise<AnalyticsFlushResult>;
  setConsentPolicy(state: AnalyticsConsentPolicyState): void;
};
```

Rules:

- `track` returns void to prevent business logic from depending on analytics success.
- `flush` returns diagnostics for app lifecycle only.
- Provider errors are recorded as quality events if safe.
- Provider-specific fields stay inside adapter.

## Consent And Pilot Policy
Pilot policy:

- Product analytics is limited to service operation, reliability, support, and product improvement.
- Customer data is not used for unrelated marketing automation in the pilot.
- Public pages must respect cookie and analytics policy decisions.
- If consent is required for a destination, provider dispatch waits until consent policy allows it.
- Operational safety analytics can be routed to an internal endpoint if policy permits without marketing use.

Rules:

- Consent state must be attached to dispatch context.
- Declined consent blocks non-essential provider dispatch.
- Declined consent must not block backend audit or operational records.
- Do not mix marketing analytics with operational accountability data.

## Dashboard Alignment
Frontend analytics supports these dashboards:

| Dashboard | Frontend event contribution | Source-of-truth guard |
| --- | --- | --- |
| Sender funnel | create started, step submitted, quote viewed, payment initialized, create failed | backend delivery and payment records own completion |
| Receiver verification | challenge requested, OTP failed, verified, access denied | backend public tracking verification owns access outcome |
| Payment recovery | payment failed, recovery selected, verified | payment records own final status |
| Station reliability | intake failed, scan failed, dispatch confirmed | delivery events and handoff records own movement |
| Driver handoff | run accepted, pickup confirmed, conflict | handoff records own custody |
| Courier proof | proof opened, method selected, upload confirmed, completed | proof and delivery records own completion |
| Issue handling | issue create started, created, escalated, resolved | support issue records own status |
| Refund control | review started, completed, settled, failed | refund records own amount and status |
| Admin governance | high-risk actions, station validation, pricing rules, user access | audit records own accountability |
| Frontend quality | schema mismatch, stale display, state retry, localization fallback | app telemetry owns UI friction only |

## KPI Mapping
Events must support these KPI questions:

| KPI | Required frontend signals |
| --- | --- |
| Delivery completion rate | create started, delivery created, proof completion requested, completion failed |
| Lost package rate | scan failed, handoff conflict, issue category package missing |
| Failed handoff rate | pickup failed, handoff conflict, scan mismatch, outbox conflict |
| Dispatch turnaround compliance | station dispatch viewed, dispatch confirmed, stale data state |
| Dispute rate | issue created, issue escalated, refund review started |
| Refund rate | refund review completed, refund settled |
| Proof capture completion rate | proof opened, proof method selected, proof completion succeeded, proof completion failed |
| Repeat sender rate | sender home viewed, create started, delivery created |
| Active station count | station home viewed, station action events |
| Delivery volume per route | sender quote viewed, delivery created with route IDs |

## Event Schema Registry
Every event in the registry must define:

```ts
type AnalyticsEventDefinition = {
  eventName: string;
  eventVersion: number;
  owner: "product" | "operations" | "finance" | "support" | "admin" | "engineering" | "privacy";
  trigger: string;
  surfaces: string[];
  privacyClass: AnalyticsPrivacyClass;
  priority: AnalyticsPriority;
  sourceOfTruth: "frontend" | "backend" | "audit" | "payment" | "handoff" | "proof" | "issue" | "refund";
  requiredProperties: string[];
  optionalProperties: string[];
  forbiddenProperties: string[];
  retentionClass: string;
  offlineBehavior: "drop_when_offline" | "queue_when_offline" | "internal_only";
};
```

Rules:

- Event definitions live in code and docs.
- Code registry must reject undefined events.
- Docs must be updated when event contracts change.
- Breaking property changes require event version increment.

## Redaction Examples
Tracking code:

```ts
type TrackingCodeAnalyticsValue = {
  trackingCodePrefix?: string;
  trackingCodeHash?: string;
  routeClass: string;
};
```

Money:

```ts
type AmountAnalyticsValue = {
  amountBucket:
    | "under_50_ghs"
    | "50_to_99_ghs"
    | "100_to_199_ghs"
    | "200_to_499_ghs"
    | "500_ghs_or_more"
    | "unknown";
  currencyCode: "GHS";
};
```

Attempt count:

```ts
type AttemptBucket = "first" | "second" | "third" | "fourth_or_more" | "unknown";
```

Data freshness:

```ts
type SourceFreshness = "fresh" | "stale" | "offline_cached" | "partial" | "unknown";
```

## Quality And Failure Events
Quality events must help engineers find broken UX without leaking data.

Required quality events:

| Event | Trigger | Required properties |
| --- | --- | --- |
| `frontend_error_boundary_shown` | error boundary renders | `screenId`, `routeClass`, `errorCode`, `recoverable` |
| `api_schema_mismatch_detected` | typed API client rejects response | `operationId`, `routeClass`, `statusCode`, `requestId` |
| `state_retry_requested` | user retries failed state | `screenId`, `stateType`, `errorCode` |
| `state_recovery_selected` | recovery action selected | `screenId`, `stateType`, `actionId` |
| `offline_state_viewed` | offline state displayed | `screenId`, `sourceFreshness`, `queueCountBucket` |
| `analytics_privacy_guard_blocked` | analytics payload rejected | `eventName`, `blockedFieldClass`, `surface` |
| `analytics_dispatch_failed` | analytics provider dispatch fails | `eventName`, `providerClass`, `errorClass` |

Rules:

- Error boundary events must not include stack traces by default.
- Privacy guard events must not include actual blocked value.
- Provider failures must not include provider raw response.

## Testing Requirements
Unit tests:

- event registry rejects unknown events
- event schema requires required fields
- event schema rejects forbidden fields
- event name pattern validation works
- event version validation works
- privacy guard rejects raw phone values
- privacy guard rejects full tracking codes
- privacy guard rejects signed URLs
- privacy guard rejects proof media fields
- redactor converts IDs to approved forms
- route adapter strips raw params
- amount bucketing works
- queue drops low-priority events first
- offline retention expiry works
- provider adapter cannot be called from screens directly

Component tests:

- screen view fires once per route activation
- sender create funnel emits step events only at completion points
- payment recovery emits safe events
- proof component emits safe proof events
- scan component emits safe scan failure events
- notification component emits safe notification events
- empty/error library emits state events
- localization fallback emits key-only telemetry
- accessibility events exclude hidden text

Integration tests:

- receiver tracking flow emits no full tracking code
- receiver phone challenge emits no receiver phone
- sender create-pay-track emits funnel events and no address payload
- station intake emits scan and intake events with no raw scan code
- driver handoff emits handoff events with no proof reference
- courier proof emits proof events with no proof asset ID
- admin refund review emits finance-safe events
- admin webhook detail emits no raw webhook payload
- offline outbox events queue and flush redacted payloads

Privacy tests:

- scan every analytics payload fixture for forbidden field names
- scan every analytics payload fixture for phone-like values
- scan every analytics payload fixture for URL tokens
- scan every analytics payload fixture for raw route params
- scan every analytics payload fixture for rendered copy fields
- scan every analytics payload fixture for proof fields

CI gates:

```text
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm check:critical-coverage
pnpm check:analytics-schema
pnpm check:analytics-privacy
pnpm check:analytics-coverage
```

The last three commands do not need to exist in this documentation PR, but implementation must add equivalent gates before broad frontend instrumentation.

## Event Coverage Gate
Each critical screen spec must declare:

- screen viewed event
- primary success event
- primary failure event
- recovery event if recovery exists
- offline queued event if offline action exists
- privacy class
- forbidden fields
- source-of-truth owner

Critical flows requiring event coverage:

- public tracking submit
- receiver OTP verification
- sender create delivery
- sender quote review
- sender payment
- sender issue create
- sender cancellation
- station intake
- station dispatch
- driver pickup
- driver handoff
- courier proof
- courier failed attempt
- refund review
- refund settlement
- admin station validation
- admin pricing update
- admin user access update
- admin webhook replay
- admin export

## Payload Size Rules
Payload size controls:

- No event payload should exceed `8 KB` before provider adapter formatting.
- Routine product events should stay under `2 KB`.
- Do not send arrays of records.
- Do not send full lists of IDs.
- Use counts or buckets for list size.
- Use event-specific IDs only when approved.

## Implementation Roadmap
### Phase 1: Registry And Client
Build:

- event name constants
- event definitions
- typed event properties
- analytics provider interface
- privacy guard
- redactor
- route class adapter
- basic queue
- unit tests

Exit criteria:

- unknown events are rejected
- forbidden fields are rejected
- screens can dispatch only through `AnalyticsClient`

### Phase 2: Shared Infrastructure Bridges
Integrate:

- app shells screen tracking
- role routing context
- typed API client quality events
- RTK Query source freshness events
- offline outbox events
- form system events
- empty/error state events
- notification events
- localization events
- accessibility-safe events

Exit criteria:

- shared components prepare or dispatch only approved payloads
- privacy tests pass
- offline queue holds only redacted payloads

### Phase 3: Customer Funnels
Integrate:

- public landing
- public tracking entry
- receiver verification
- receiver tracking
- sender onboarding
- sender create delivery
- sender quote
- sender payment
- sender delivery detail
- sender issue and refund flows

Exit criteria:

- sender funnel dashboard can be built from safe frontend events plus backend records
- receiver verification friction can be measured without phone or tracking code leakage

### Phase 4: Operations Flows
Integrate:

- station intake
- station dispatch
- station receipt
- driver assignments
- driver pickup
- driver handoff
- courier route
- courier proof
- failed attempt
- operations issue create

Exit criteria:

- handoff and proof friction can be measured
- scan and offline conflicts can be measured
- analytics does not block field work

### Phase 5: Admin And Finance
Integrate:

- admin dashboard
- admin analytics
- station validation
- pricing rules
- user access
- payment review
- refund review
- refund settlement
- issue detail
- webhook replay
- exports
- audit detail

Exit criteria:

- admin high-risk actions are measurable
- finance events stay aligned with reconciliation records
- webhook and audit views never leak raw payloads into analytics

## Claude Code Build Brief
When Claude Code implements this foundation, build production instrumentation infrastructure, not UI.

Claude Code must:

- create a typed shared analytics registry
- create a provider-agnostic analytics client
- create a privacy guard that fails closed
- create redaction utilities
- create route class mapping from frontend inventory
- create source freshness and offline metadata mapping
- create queue and flush behavior for mobile offline use
- add event property tests
- add forbidden field tests
- add screen view tracking through app shells
- integrate with form, state, notification, scan, proof, payment, issue, localization, accessibility, and outbox infrastructure
- keep backend records as source of truth for operational metrics
- keep analytics payloads minimal and policy-safe

Claude Code must not:

- call provider SDKs directly from screens
- send raw form values
- send raw route params
- send full tracking codes
- send full phone numbers
- send proof asset IDs by default
- send proof media
- send raw provider messages
- send issue text
- send admin notes
- use analytics success as business logic
- block operational actions for analytics
- turn analytics into marketing automation during pilot

## Edge Cases
Required handling:

- user is offline before first event
- event queue reaches max size
- provider script fails to load
- consent policy blocks provider dispatch
- user signs out with queued events
- app crashes before flush
- backgrounded mobile app delays flush
- route changes before screen view fires
- user retries mutation repeatedly
- backend returns unknown error code
- event schema version mismatch
- privacy guard blocks payload
- redaction utility receives unknown ID type
- route class missing from registry
- screen ID missing from inventory
- analytics provider returns rate limit
- analytics provider returns permanent failure
- clock skew affects occurred time
- localization fallback changes visible copy
- accessibility state announcement fires repeatedly
- offline outbox replays events after source record changed

Recovery rules:

- Missing event definition fails tests.
- Missing route class fails tests for critical screens.
- Privacy guard failure blocks event dispatch and records safe quality event.
- Queue overflow drops routine product events first.
- Provider permanent failure drops event after safe diagnostics.
- Consent block stores only events allowed by policy.
- Unknown error code maps to `unknown_error` class.
- Unknown screen ID maps to `screen_unknown` only in development and fails CI for production routes.

## Acceptance Checklist
Product:

- Major funnel, handoff, payment, proof, issue, refund, and admin actions are covered.
- Events answer KPI and operational questions.
- Event names are stable and readable.
- Screen views are tied to inventory screen IDs.
- Dashboard mapping is explicit.

Engineering:

- Typed registry is defined.
- Event envelope is defined.
- Provider abstraction is defined.
- Queue behavior is defined.
- Offline behavior is defined.
- Schema and privacy gates are defined.

Privacy:

- Forbidden fields are explicit.
- Redaction policy is explicit.
- Public and receiver flow privacy is strict.
- Proof and scan data are protected.
- Payment and refund fields are finance-safe.
- Accessibility telemetry does not infer disability.

Operations:

- Handoff events are measurable.
- Scan failures are measurable.
- Proof completion is measurable.
- Offline conflicts are measurable.
- Admin overrides are measurable.

## Completion Statement
Claude Code should build `AnalyticsTracking` as the shared frontend telemetry foundation for Kra. It must track product funnels, receiver verification, sender payment, handoffs, scans, proof capture, issues, refunds, notifications, offline outbox, admin actions, localization fallback, accessibility-safe events, and frontend quality signals through typed event schemas and a provider-agnostic client. It must keep backend records as source of truth, reject restricted payloads before queueing or dispatch, avoid marketing automation during the pilot, and never allow analytics to block delivery, payment, custody, proof, refund, issue, or admin work.
