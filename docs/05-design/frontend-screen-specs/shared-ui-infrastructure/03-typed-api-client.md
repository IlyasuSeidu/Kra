# Typed API Client Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Typed API client |
| Component family | Shared UI infrastructure |
| Primary modules | `kraApi`, `createKraBaseQuery`, `createEndpointDefinition`, `buildApiUrl`, `parseApiSuccess`, `parseApiError`, `attachAuthHeaders`, `attachIdempotencyKey` |
| Supporting modules | `ApiOperationRegistry`, `ApiEndpointHooks`, `ApiErrorMapper`, `ApiRequestLogger`, `ApiRetryPolicy`, `ApiSchemaDriftBoundary`, `PublicTrackingClient`, `ProofAssetUploadClient`, `ApiContractTests` |
| Inventory behavior | Use shared schemas/contracts where available |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, `packages/shared`, future generated client package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, admins, support, finance, operations leads |
| Backend coverage | `/v1` REST API, `services/api/src/routes.ts`, `packages/shared/src/contracts/api.ts`, `apiErrorResponseSchema`, Firebase bearer auth, receiver verification token state, idempotency keys, proof asset upload flow |
| Browser mutation operation | None directly; this is the shared data access layer used by screens and shared components |
| Data sensitivity | auth token, receiver verification token, delivery IDs, tracking codes, package scan codes, proof asset intent data, payment references, refund data, station scope, admin data, audit records |
| Offline critical | Yes for station, driver, and courier actions that flow through the offline outbox; online-first for sender, public, and admin clients |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, RTK Query cache, offline outbox, empty/error library, analytics tracking, test harness |
| Related state specs | loading, error, offline, stale data, not authorized, session expired, rate limited, scan mismatch, custody not confirmed, proof required, payment under review |
| Design tokens | No visual tokens owned by this layer; surfaced states must map into existing shared state components |
| Accessibility target | Client errors must expose stable state keys so screens can render accessible headings, messages, focus recovery, and status announcements |

## Purpose
The typed API client is the single frontend path into Kra's backend.

It must turn backend route definitions, shared Zod contracts, auth policy, idempotency policy, and error contracts into a consistent client layer for every public, mobile, operations, and admin screen.

The API client must answer:

- Which operation is being called?
- Which HTTP method and path does it use?
- Which path params are required?
- Which query params or request body are valid?
- Which auth scope applies?
- Does this operation require an idempotency key?
- Which Zod schema validates the request before network send?
- Which Zod schema validates the response after network receive?
- Which `apiErrorResponseSchema` code maps to which safe UI state?
- Which cache tag family should RTK Query receive?
- Which operations are allowed through the offline outbox?
- Which fields are safe for analytics and logs?

The most important rule is:

```text
Screens must never handwrite request URLs, response casts, local status enums, or error-code interpretation when a shared contract exists.
```

## Product Job
Kra's frontend will be built across several surfaces, but the backend is one regulated operating system for deliveries, payments, custody, proof, support, and admin controls.

The typed API client must:

- keep every screen aligned with `packages/shared/src/contracts/api.ts`
- prevent drift between UI payloads and backend request validation
- prevent screens from inventing local response shapes
- keep auth headers consistent across mobile, web, and admin
- keep receiver public tracking privacy boundaries separate from authenticated app auth
- support idempotent staff actions and payment actions
- expose typed errors with stable recovery keys
- feed RTK Query endpoint definitions without duplicate hand-authored fetch logic
- make schema drift visible during development and CI
- isolate proof asset upload intent from raw asset upload transfer
- give the offline outbox a safe retry boundary for field operations
- keep analytics, logging, and crash reports free of sensitive payload values

This layer should feel boring to use and strict to extend.

## Strategic Role
Kra cannot scale if every screen becomes its own API client.

Delivery products fail operationally when frontend screens silently diverge from backend rules. For Kra, divergence can create real harm:

- a sender sees a price that was not backend-authorized
- a station operator submits a scan payload with missing package evidence
- a driver retries a pickup without an idempotency key
- a courier completes proof with an unverified asset
- a receiver sees unsafe internal fields through public tracking
- a finance admin acts on a refund with stale payment data
- an admin console hides a critical `RATE_LIMITED`, `ROUTE_NOT_ENABLED`, or `INVALID_STATUS_TRANSITION` response

The typed API client is the contract spine between backend enforcement and frontend execution.

## Design Brief
Audience:

- Claude Code and frontend engineers building public, mobile, operations, and admin surfaces.

Surface type:

- Non-visual shared infrastructure for data access, validation, error normalization, and endpoint hooks.

Primary action:

- Make the correct API call easy and every unsafe API call impossible or visibly rejected before it reaches production.

Visual thesis:

- `Contract spine`: invisible infrastructure that makes each UI screen feel precise, fast, reliable, and consistent because data, errors, and recovery paths are typed.

Restraint rule:

- Do not put screen copy, visual decisions, pricing math, custody decisions, refund decisions, or role authorization policy in the API client.

Density:

- The implementation is strict and centralized. Screen usage should remain small and readable.

Platform stance:

- RTK Query is the app-facing data layer. Zod is the runtime schema authority. Fetch is the transport primitive under `fetchBaseQuery` or a compatible base query wrapper.

## External Research Used
Only directly relevant API client, runtime validation, and fetch references were used:

- [Redux Toolkit RTK Query TypeScript usage](https://redux-toolkit.js.org/rtk-query/usage-with-typescript): supports typed endpoint definitions, query functions, mutation functions, and TypeScript-aware generated hooks.
- [Redux Toolkit `fetchBaseQuery`](https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery): supports a small fetch wrapper with base URL, header preparation, response handling, validation hooks, params, timeout, and fetch options.
- [Redux Toolkit custom queries](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries): supports wrapping base queries to customize requests, responses, retry behavior, and domain-specific transport concerns.
- [Redux Toolkit error handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling): supports handling rejected async results, `unwrap`, middleware-based error handling, and endpoint-level error states.
- [Zod basics](https://zod.dev/basics): supports runtime validation through parse and safe parse, plus static TypeScript inference from schemas.
- [MDN Fetch `Response.ok`](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok): supports distinguishing success status ranges from non-success HTTP responses.
- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController): supports aborting fetch requests through abort signals.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/06-architecture/frontend-architecture.md`
- `docs/06-architecture/system-architecture.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/09-operations/delivery-lifecycle.md`
- `docs/09-operations/handoff-scan-policy.md`
- `docs/09-operations/proof-of-delivery-policy.md`
- `docs/10-payments/payment-architecture.md`
- `docs/10-payments/refund-and-dispute-rules.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/15-qa/quality-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `packages/shared/src/domain/pricing.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`
- `services/api/src/service-errors.ts`
- `services/api/src/idempotency.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/public-tracking-verification.ts`

## Non-Goals
The typed API client must not:

- implement frontend screens
- own visual design
- replace RTK Query cache policy
- replace the offline outbox
- replace backend authorization
- calculate route pricing locally
- decide delivery status transitions locally
- approve refunds locally
- resolve custody conflicts locally
- expose webhook or internal scheduler endpoints to public clients
- log raw request bodies, auth tokens, verification tokens, package scan codes, OTPs, proof upload URLs, raw proof URLs, or provider payloads
- retry non-idempotent operations without explicit policy
- turn backend errors into vague generic failures when a safe mapped state exists

## Required Architecture
The implementation must have three layers.

### Contract Layer
Source:

- `packages/shared/src/contracts/api.ts`
- `services/api/src/routes.ts`

Responsibilities:

- export Zod schemas for requests, responses, and errors
- export inferred request and response types
- expose operation IDs, route paths, auth scopes, capabilities, and idempotency metadata
- detect route and schema drift in tests

### Transport Layer
Source:

- shared frontend API client package or app-local shared module

Responsibilities:

- construct URLs
- attach headers
- serialize query params
- serialize JSON bodies
- handle fetch abort and timeout
- parse JSON safely
- distinguish HTTP success from HTTP failure
- parse success responses with response schemas
- parse failure responses with `apiErrorResponseSchema`
- normalize transport failures into safe client errors
- add idempotency keys where required
- keep logs and analytics redacted

### RTK Query Layer
Source:

- `apps/mobile/src/api`
- `apps/web/src/api`
- `apps/admin/src/api`
- optional shared generated endpoint module

Responsibilities:

- define `kraApi`
- define endpoint hooks by operation family
- provide query and mutation hooks
- return typed data and typed error states to screens
- provide tag families for the RTK Query cache spec
- expose invalidation hooks without embedding screen policy

## Canonical Contract Source
The canonical schema source is:

```text
packages/shared/src/contracts/api.ts
```

The canonical route registry is:

```text
services/api/src/routes.ts
```

The frontend must not copy these into screen files. If the client needs generated helper types, generation must run from the canonical sources and fail when it cannot map a route.

Required generated or manually maintained type families:

```ts
type ApiOperationId = typeof apiRoutes[number]["operationId"];
type ApiAuthScope = typeof apiRoutes[number]["authScope"];
type ApiModule = typeof apiRoutes[number]["module"];
type ApiMethod = typeof apiRoutes[number]["method"];
type ApiCapability = typeof apiRoutes[number]["capability"];
```

Request and response type inference:

```ts
type ApiRequestOf<TSchema> = TSchema extends z.ZodTypeAny
  ? z.input<TSchema>
  : undefined;

type ApiResponseOf<TSchema> = TSchema extends z.ZodTypeAny
  ? z.output<TSchema>
  : undefined;
```

The implementation may refine this shape, but it must preserve these decisions:

- `z.input` is used for outgoing request payloads so coercive query schemas can accept the intended input form.
- `z.output` is used for incoming response payloads so transformed or coerced values are represented after parsing.
- missing request schemas mean no request body for that operation unless the route explicitly uses path params or query params.
- missing response schemas are not acceptable for public app endpoints unless the backend route truly returns empty response data.

## Operation Registry Requirements
Each frontend operation definition must include:

| Field | Required | Rule |
| --- | --- | --- |
| `operationId` | Yes | Must match `services/api/src/routes.ts` exactly |
| `method` | Yes | Must be `GET` or `POST` for v1 |
| `path` | Yes | Must start with `/v1` |
| `module` | Yes | Must match backend route module |
| `authScope` | Yes | Must be public, authenticated, staff, admin, webhook, or internal |
| `capability` | When present | Must be metadata only; client cannot use it as backend authority |
| `idempotent` | Yes | Must drive idempotency key and retry decisions |
| `requestSchema` | When present | Must validate query or body before network send |
| `responseSchema` | Yes for app endpoints | Must validate response before success state |
| `errorSchema` | Yes | Must be `apiErrorResponseSchema` |
| `cacheTags` | Yes in RTK layer | Must align with RTK Query cache spec |
| `offlinePolicy` | Yes for staff mutations | Must align with offline outbox spec |
| `redactionPolicy` | Yes | Must identify forbidden log fields |

## Path Parameter Typing
The client must derive path params from route paths.

Required params:

| Path segment | Type source | Used by |
| --- | --- | --- |
| `:id` | `deliveryIdSchema`, `issueIdSchema`, `userIdSchema`, or `stationIdSchema` by operation context | delivery, issue, user, station routes |
| `:trackingCode` | `trackingCodeSchema` | receiver and public tracking routes |
| `:proofAssetId` | `proofAssetIdSchema` | proof asset confirmation |

Rules:

- `buildApiUrl` must reject missing params before fetch.
- `buildApiUrl` must URL-encode path params.
- `buildApiUrl` must reject unknown path params when strict mode is enabled.
- tracking codes must be validated before request to reduce unnecessary public endpoint load.
- staff scan codes are request body fields, not path params.
- path params must never be recorded in analytics unless the event plan explicitly allows a redacted route class.

## Query Parameter Typing
GET operations with `requestSchema` must serialize query params from the parsed request.

Current query-backed routes include:

- `list_deliveries`
- `list_issues`
- `list_notifications`
- `admin_users`
- `admin_audit_events`
- `admin_outbound_notifications`
- `admin_payment_reconciliation`
- `admin_webhook_events`

Rules:

- query params must be parsed with the relevant schema before URL serialization.
- undefined values must be omitted.
- arrays, if added later, must use one documented format across all clients.
- invalid query values must return a typed local validation error, not a network request.
- route filters must not be used as authorization boundaries.

## Request Body Typing
POST operations with `requestSchema` must validate body data before network send.

Rules:

- body validation failure must produce `CLIENT_VALIDATION_ERROR`.
- body validation errors must include field paths from Zod issues.
- field paths may be shown to forms, but raw sensitive values must not be logged.
- the client must not alter payment amount, quote, custody status, issue status, or proof status beyond fields accepted by backend schemas.
- if a screen wants to show form validation before submit, it must reuse the same schema through React Hook Form and Zod.

## Success Response Validation
Every successful JSON response must be parsed with the route response schema before the endpoint resolves successfully.

Rules:

- schema parse success returns typed `data`.
- schema parse failure returns `CLIENT_SCHEMA_MISMATCH`.
- `CLIENT_SCHEMA_MISMATCH` must be visible in development and CI.
- production UI must show a safe error state and request support, not raw schema issue details.
- schema mismatch telemetry must include operation ID, route class, response status, request ID if present, app surface, and app version.
- schema mismatch telemetry must not include raw payload values.

## Error Response Validation
The canonical backend error shape is:

```ts
type ApiErrorResponse = {
  requestId: string;
  error: {
    code:
      | "VALIDATION_ERROR"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "ROUTE_NOT_ENABLED"
      | "PAYMENT_REQUIRED"
      | "INVALID_STATUS_TRANSITION"
      | "PHONE_VERIFICATION_REQUIRED"
      | "PACKAGE_SCAN_MISMATCH"
      | "RATE_LIMITED"
      | "INTERNAL_ERROR";
    message: string;
    details: Record<string, unknown>;
  };
};
```

The client must parse all non-success JSON responses with `apiErrorResponseSchema`.

If parsing succeeds:

- return `ApiServerError`
- preserve `requestId`
- preserve safe `error.code`
- preserve safe `error.message`
- preserve redacted details for field display only where policy allows
- map to shared error states

If parsing fails:

- return `ApiMalformedError`
- preserve HTTP status
- preserve operation ID
- preserve response content type
- do not show raw response body
- do not treat the operation as successful

## Error Type Model
The client must normalize all failures into a discriminated union.

```ts
type KraApiClientError =
  | {
      kind: "server";
      operationId: ApiOperationId;
      httpStatus: number;
      requestId: string;
      code: ApiErrorCode;
      message: string;
      safeDetails: Record<string, unknown>;
      retryable: boolean;
      recoveryState: ApiRecoveryState;
    }
  | {
      kind: "client_validation";
      operationId: ApiOperationId;
      code: "CLIENT_VALIDATION_ERROR";
      issues: Array<{ path: string; message: string }>;
      recoveryState: "fix_input";
    }
  | {
      kind: "schema_mismatch";
      operationId: ApiOperationId;
      code: "CLIENT_SCHEMA_MISMATCH";
      recoveryState: "service_unavailable";
    }
  | {
      kind: "network";
      operationId: ApiOperationId;
      code: "NETWORK_ERROR";
      retryable: true;
      recoveryState: "retry_or_offline";
    }
  | {
      kind: "timeout";
      operationId: ApiOperationId;
      code: "REQUEST_TIMEOUT";
      retryable: true;
      recoveryState: "retry";
    }
  | {
      kind: "aborted";
      operationId: ApiOperationId;
      code: "REQUEST_ABORTED";
      retryable: false;
      recoveryState: "none";
    }
  | {
      kind: "malformed_error";
      operationId: ApiOperationId;
      code: "MALFORMED_ERROR_RESPONSE";
      httpStatus: number;
      recoveryState: "service_unavailable";
    };
```

This union is a required product contract. Implementation names can vary only if all semantics are preserved.

## Error To UI Recovery Map
The client must not decide screen copy, but it must provide stable recovery states.

| Error code | Recovery state | Default screen behavior |
| --- | --- | --- |
| `VALIDATION_ERROR` | `fix_input` | show field or form-level validation |
| `FORBIDDEN` | `not_authorized` | route to permission-denied or role-safe block |
| `NOT_FOUND` | `not_found` | show not-found state without leaking record existence where public |
| `ROUTE_NOT_ENABLED` | `service_unavailable` | show feature unavailable or maintenance path |
| `PAYMENT_REQUIRED` | `payment_required` | route to payment recovery |
| `INVALID_STATUS_TRANSITION` | `refresh_required` | refresh delivery, show stale or blocked action state |
| `PHONE_VERIFICATION_REQUIRED` | `otp_required` | route receiver or courier proof flow to verification |
| `PACKAGE_SCAN_MISMATCH` | `scan_mismatch` | show scan mismatch recovery |
| `RATE_LIMITED` | `rate_limited` | show cooldown with retry timing when available |
| `INTERNAL_ERROR` | `service_error` | show safe retry or support path |
| `CLIENT_VALIDATION_ERROR` | `fix_input` | block request and focus first invalid field |
| `CLIENT_SCHEMA_MISMATCH` | `service_unavailable` | block unsafe render and report schema drift |
| `NETWORK_ERROR` | `retry_or_offline` | retry, queue, or stale cache based on surface |
| `REQUEST_TIMEOUT` | `retry` | retry or queue only when operation policy permits |
| `REQUEST_ABORTED` | `none` | no user-facing error if user navigated away |
| `MALFORMED_ERROR_RESPONSE` | `service_unavailable` | show safe service error |

## Auth Header Rules
Auth scopes from the route registry must drive header behavior.

| Auth scope | Header behavior | Client exposure |
| --- | --- | --- |
| `public` | no Firebase bearer token by default | public web and receiver public flow |
| `authenticated` | `Authorization: Bearer <firebase-id-token>` | sender and authenticated issue/payment/delivery flows |
| `staff` | `Authorization: Bearer <firebase-id-token>` | station, driver, and courier mobile operations |
| `admin` | `Authorization: Bearer <firebase-id-token>` | admin web console |
| `webhook` | not callable from frontend apps | backend provider callbacks only |
| `internal` | not callable from frontend apps | backend scheduler tasks only |

Rules:

- frontend route registry must exclude `webhook` and `internal` operations from generated app hooks.
- bearer token retrieval must happen at request time, not module import time.
- expired token refresh must be handled by the auth provider before request send where supported.
- if token refresh fails, return a session-expired client state.
- no screen may manually construct an `Authorization` header.
- no screen may pass a provider webhook signature.
- no frontend code may store internal task secrets.

## Receiver Public Token Rules
Receiver public tracking is not the same as authenticated sender or staff auth.

The current public tracking contracts return `verificationToken` from:

- `request_public_tracking_phone_challenge` when an active grant already exists
- `verify_public_tracking_phone`

Rules:

- receiver verification token must be stored only in approved ephemeral receiver state.
- receiver verification token must not be stored in analytics, logs, query strings, route params, screenshots, or long-lived storage.
- receiver verification token must not be attached to authenticated app requests.
- if future backend endpoints require a receiver token header, the header name must be documented in API contracts before client implementation.
- public tracking pages must continue to use only public-safe fields from `publicTrackingResponseSchema`.

## Idempotency Rules
The route registry exposes `idempotent`.

For frontend purposes:

- idempotent mutations must include an `Idempotency-Key` when they can be submitted by user action, offline replay, payment retry, proof asset intent creation, or scan retry.
- non-idempotent operations must never be automatically retried without explicit operation policy.
- offline outbox operations must persist the idempotency key with the queued action.
- payment initialize and verify flows must use stable idempotency behavior according to backend policy.
- scan and custody operations must reuse the same key while replaying the same local action.
- creating a new user intent must create a new key.
- key generation must be collision-resistant and device-local.

Operations that require special idempotency discipline:

- `create_delivery`
- `initialize_payment`
- `verify_payment`
- `confirm_intake`
- `assign_driver`
- `accept_run`
- `dispatch_delivery`
- `confirm_pickup`
- `mark_in_transit`
- `receive_destination`
- `assign_final_mile`
- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `create_issue`
- `escalate_issue`
- `resolve_issue`
- `admin_update_pricing_rules`
- `admin_upsert_user`
- `admin_update_user_access`
- `admin_update_station_status`
- `admin_update_station_validation`

The fact that a backend route marks a read as `idempotent: false` for operational reasons must not make it a candidate for offline replay.

## Retry Rules
Retry behavior must be operation-aware.

Automatic retry allowed:

- GET reads after network failure
- `verify_payment` when user is waiting on provider confirmation and screen policy allows polling
- queued offline staff mutations through the offline outbox
- upload confirmation after proof asset transfer when idempotency key is stable

Automatic retry blocked:

- refund settlement
- pricing update
- user access update
- station status override
- station validation mutation
- failed-attempt recording unless queued with original intent and idempotency key
- any operation with malformed response schema
- any operation returning `FORBIDDEN`, `VALIDATION_ERROR`, `PACKAGE_SCAN_MISMATCH`, or `INVALID_STATUS_TRANSITION`

Retry metadata returned to screens:

- `retryable`
- `retryAfterMs` when present or inferred safely
- `cooldownUntil` when present
- `requiresRefresh`
- `requiresNewInput`
- `requiresSupport`

## Timeout And Abort Rules
The transport layer must support request cancellation and timeout.

Rules:

- route navigation should abort in-flight reads that are no longer needed.
- form submit cancellation should not report user-visible failure when the user intentionally leaves the screen.
- operations mobile should not abandon queued writes simply because a foreground request times out.
- timeout must become `REQUEST_TIMEOUT`, not `NETWORK_ERROR`.
- aborted requests must become `REQUEST_ABORTED`.
- proof asset upload transfer uses its own transfer timeout separate from API JSON request timeout.

Baseline timeout classes:

| Operation class | Timeout target |
| --- | --- |
| public tracking lookup | short |
| sender delivery reads | normal |
| payment verification | extended but visible |
| staff scan mutations | normal with outbox fallback |
| proof asset intent creation | normal |
| proof file transfer | extended with progress |
| admin list reads | normal |
| export request | extended if endpoint added later |

## Proof Asset Upload Rules
Proof upload is not a normal JSON-only mutation.

The API client must split it into stages:

1. Call `create_delivery_proof_asset`.
2. Validate `createProofAssetUploadResponseSchema`.
3. Upload the asset bytes to the returned upload target using the upload contract.
4. Call `confirm_delivery_proof_asset_upload`.
5. Validate `proofAssetResponseSchema`.
6. Only then allow `complete_delivery` to reference the uploaded proof asset.

Rules:

- raw asset bytes do not pass through RTK Query JSON serialization.
- upload URLs must never be logged.
- upload URL expiry must be handled as a proof upload recovery state.
- byte size and hash data must match the confirm-upload schema.
- failed transfer must not call completion.
- completion must not proceed with `pending_upload` assets.

## Public And Restricted Endpoint Partitioning
Generated app endpoints must be partitioned by client surface.

### Public Web
Allowed:

- `get_public_tracking`
- `request_public_tracking_phone_challenge`
- `verify_public_tracking_phone`

Conditionally allowed when authenticated public support exists:

- `create_issue` through authenticated support path only

Blocked:

- authenticated delivery detail
- payment internals
- staff handoffs
- admin routes
- webhook routes
- internal scheduler routes

### Sender Mobile
Allowed:

- `list_deliveries`
- `create_delivery`
- `get_delivery`
- `get_delivery_timeline`
- `cancel_delivery`
- `initialize_payment`
- `verify_payment`
- `list_issues`
- `create_issue`
- `get_issue`
- `list_notifications`

Blocked:

- staff handoff mutations
- admin routes
- webhook routes
- internal scheduler routes

### Operations Mobile
Allowed by role and capability:

- `list_deliveries`
- `get_delivery`
- `get_delivery_timeline`
- `confirm_intake`
- `assign_driver`
- `accept_run`
- `dispatch_delivery`
- `confirm_pickup`
- `mark_in_transit`
- `receive_destination`
- `assign_final_mile`
- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `record_failed_attempt`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`
- `list_issues`
- `create_issue`
- `get_issue`
- `list_notifications`

Blocked:

- sender payment initialize unless the staff role also has explicit backend authorization later
- admin finance and user management routes
- webhook routes
- internal scheduler routes

### Admin Web
Allowed by admin role and capability:

- `admin_overview`
- `admin_deliveries`
- `admin_stations`
- `admin_launch_readiness`
- `admin_finance`
- `admin_pricing_rules`
- `admin_update_pricing_rules`
- `admin_users`
- `admin_upsert_user`
- `admin_update_user_access`
- `admin_update_station_status`
- `admin_update_station_validation`
- `admin_audit_events`
- `admin_outbound_notifications`
- `admin_payment_reconciliation`
- `admin_webhook_events`
- `list_issues`
- `get_issue`
- `escalate_issue`
- `resolve_issue`
- `refund_payment`
- `settle_refund_payment`

Blocked:

- public receiver token storage
- direct webhook ingestion
- internal scheduler dispatch

## Endpoint Families
Endpoint hooks should be grouped by domain, not by screen.

### Deliveries
Operations:

- `list_deliveries`
- `create_delivery`
- `get_delivery`
- `get_delivery_timeline`
- `cancel_delivery`

Rules:

- `create_delivery` request must be parsed with `createDeliveryRequestSchema`.
- `create_delivery` response must expose backend quote only.
- screens must not calculate final delivery price locally.
- delivery detail must be parsed with `deliveryDetailResponseSchema`.
- timeline must be parsed with `deliveryTimelineResponseSchema`.

### Public Tracking
Operations:

- `get_public_tracking`
- `request_public_tracking_phone_challenge`
- `verify_public_tracking_phone`

Rules:

- tracking code must be parsed with `trackingCodeSchema`.
- receiver verification token must remain ephemeral.
- public tracking response must not be expanded with private delivery detail fields.
- rate-limited responses must map to the shared rate-limited state.

### Payments
Operations:

- `initialize_payment`
- `verify_payment`
- `refund_payment`
- `settle_refund_payment`

Rules:

- `initialize_payment` may be called only after backend quote lock exists.
- `verify_payment` may poll according to payment screen policy.
- refund and settlement operations are admin/finance controlled.
- payment errors must map into payment required, payment failed, payment under review, or refund states.

### Handoffs And Proof
Operations:

- `confirm_intake`
- `assign_driver`
- `accept_run`
- `dispatch_delivery`
- `confirm_pickup`
- `mark_in_transit`
- `receive_destination`
- `assign_final_mile`
- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `record_failed_attempt`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`

Rules:

- package scan codes must be treated as sensitive operational evidence.
- scan mismatch must map to `scan_mismatch`.
- invalid status transition must map to `refresh_required`.
- proof-required errors must map to the proof state, not a generic error.
- offline replay must preserve original action, actor, route, payload, and idempotency key.

### Issues
Operations:

- `list_issues`
- `create_issue`
- `get_issue`
- `escalate_issue`
- `resolve_issue`

Rules:

- `create_issue` may be offline queued only for approved operations mobile contexts.
- issue categories must come from `issueCategorySchema`.
- issue status must come from `issueStatusSchema`.
- issue actions must preserve request ID and audit context.

### Notifications
Operations:

- `list_notifications`

Rules:

- notification list must use shared notification schemas.
- unread state is not a local-only truth once server read state exists.
- deep links must pass through role routing before opening target screens.

### Admin
Operations:

- `admin_overview`
- `admin_deliveries`
- `admin_stations`
- `admin_launch_readiness`
- `admin_finance`
- `admin_pricing_rules`
- `admin_update_pricing_rules`
- `admin_users`
- `admin_upsert_user`
- `admin_update_user_access`
- `admin_update_station_status`
- `admin_update_station_validation`
- `admin_audit_events`
- `admin_outbound_notifications`
- `admin_payment_reconciliation`
- `admin_webhook_events`

Rules:

- all admin endpoints require bearer token and backend admin-role validation.
- admin cache tags must be isolated from sender and operations cache tags.
- admin mutation success must invalidate affected admin list and detail tags.
- admin errors must preserve request ID for support escalation.

## Data Redaction Policy
The API client must redact sensitive values before logging, analytics, error reporting, and developer diagnostics.

Always redact:

- Firebase ID token
- receiver verification token
- OTP
- phone number except approved masked display
- receiver address
- package scan code
- package label scan code
- proof upload URL
- proof asset raw URL
- proof file hash
- payment provider reference where not explicitly approved for finance UI
- webhook payload
- internal task secret
- idempotency key in analytics

Allowed metadata:

- operation ID
- route class
- app surface
- HTTP status
- backend request ID
- backend error code
- retryable flag
- recovery state
- cache tag family
- offline queued flag
- elapsed time bucket

## Analytics Contract
The client may emit technical API events, but it must not become a screen analytics layer.

Allowed client events:

- `api_request_started`
- `api_request_succeeded`
- `api_request_failed`
- `api_schema_mismatch`
- `api_retry_scheduled`
- `api_retry_exhausted`
- `api_offline_queued`
- `api_offline_replayed`

Required properties:

- `operationId`
- `module`
- `authScope`
- `surface`
- `httpStatus` when available
- `errorCode` when available
- `recoveryState` when available
- `requestId` when available
- `durationBucket`
- `queued`
- `retryCount`

Forbidden properties:

- raw URL with path IDs
- raw request body
- raw response body
- auth token
- verification token
- phone
- address
- scan code
- OTP
- proof URL
- provider payload

## Cache Tag Interface
The typed API client must expose enough endpoint metadata for the RTK Query cache spec.

Tag families:

- `Delivery`
- `DeliveryList`
- `Timeline`
- `Payment`
- `Issue`
- `IssueList`
- `Notification`
- `Station`
- `AdminOverview`
- `AdminFinance`
- `AdminUser`
- `AdminAudit`
- `WebhookEvent`
- `OutboundNotification`
- `PublicTracking`

Rules:

- cache policy lives in the RTK Query cache spec.
- endpoint definitions must provide operation IDs and response identifiers needed for tags.
- mutation endpoints must declare likely invalidation families.
- client code must not invalidate broad tags when precise tags are available.
- public tracking cache must not hydrate authenticated delivery detail.

## Offline Outbox Interface
The typed API client must provide a stable execution target for offline queued actions.

Required outbox execution fields:

```ts
type OutboxApiEnvelope = {
  operationId: ApiOperationId;
  pathParams: Record<string, string>;
  requestBody: unknown;
  idempotencyKey: string;
  queuedAt: string;
  actorRole: string;
  actorUserId: string;
  stationId?: string;
  deliveryId?: string;
  localActionId: string;
};
```

Before replay:

- parse `requestBody` with the route request schema
- ensure the operation remains approved for offline replay
- ensure auth token is current
- attach original idempotency key
- attach outbox metadata only where backend accepts it

After replay:

- parse success response
- parse error response
- map conflicts to action recovery
- persist request ID and error code
- never drop a failed action silently

## Local Validation UX Contract
The API client is allowed to return validation issues to form screens.

Rules:

- field paths must use dot notation.
- form-level issues use `_form`.
- first invalid field must be focusable by the form system.
- field messages must be safe for users.
- backend validation messages can be shown only after safe copy review in screen specs.
- sensitive values must not appear in field messages.

## Development Ergonomics
Claude Code must build the client so feature screens are easy to write correctly.

Preferred screen usage shape:

```ts
const { data, error, isLoading, refetch } = useGetDeliveryQuery({ id: deliveryId });
const [confirmPickup, confirmPickupState] = useConfirmPickupMutation();
```

Mutation call shape:

```ts
await confirmPickup({
  pathParams: { id: deliveryId },
  body: { packageScanCode },
  idempotencyKey
}).unwrap();
```

The exact names can vary by project conventions, but the call must preserve:

- typed path params
- typed request body
- typed response
- typed error
- operation ID
- idempotency key when required
- cache invalidation metadata

## File And Package Placement
Recommended structure:

```text
packages/shared/src/contracts/api.ts
apps/mobile/src/api/kraApi.ts
apps/mobile/src/api/baseQuery.ts
apps/mobile/src/api/errors.ts
apps/mobile/src/api/endpointRegistry.ts
apps/mobile/src/api/redaction.ts
apps/web/src/api/kraApi.ts
apps/web/src/api/baseQuery.ts
apps/admin/src/api/kraApi.ts
apps/admin/src/api/baseQuery.ts
```

If duplication appears across apps, introduce:

```text
packages/frontend-api/src
```

That package may contain:

- contract type helpers
- endpoint registry builder
- transport error model
- redaction utilities
- path builder
- query serializer
- schema parse helpers

Do not move visual components into this package.

## Build-Time Drift Protection
CI must fail when contracts drift.

Required tests:

- every app endpoint maps to an operation in `apiRoutes`.
- every operation allowed in frontend has `errorSchema`.
- every frontend operation with `requestSchema` parses a valid contract fixture.
- every frontend operation with `responseSchema` parses a valid contract fixture.
- every blocked `webhook` and `internal` operation is absent from app hooks.
- every operation with path params has typed path param coverage.
- every server error code maps to a recovery state.
- every client error kind maps to a recovery state.
- every idempotent mutation has a declared idempotency policy.
- every offline-approved operation is idempotency-safe.
- no forbidden sensitive key is emitted by redaction tests.

## Runtime Drift Protection
Runtime schema mismatch must be treated as serious.

When response parsing fails:

- block the success render
- emit `api_schema_mismatch`
- include operation ID and request ID when available
- show safe service error
- offer refresh or support based on screen context
- never partially render unparsed response data

When error response parsing fails:

- block raw error display
- emit malformed error telemetry
- show safe service error
- preserve HTTP status for diagnostics

## Security Rules
The API client must enforce frontend security hygiene:

- no raw token logging
- no raw proof URL logging
- no public tracking response in query strings
- no endpoint hooks for internal scheduler routes
- no endpoint hooks for webhook ingestion
- no screen-owned bearer header creation
- no local authorization decisions treated as final
- no local pricing authority
- no local custody authority
- no public cache reuse for authenticated delivery detail
- no admin cache hydration into mobile apps

## Accessibility Interface
This layer has no visual UI, but it must help UI states remain accessible.

Each error returned to a screen must include:

- stable recovery state
- safe heading key
- safe body key or message key
- focus target hint when validation fails
- retry availability
- request ID when support escalation is useful
- cooldown metadata when rate limited

The screen state components then handle:

- heading hierarchy
- status messages
- focus recovery
- keyboard retry controls
- reduced-motion loading and retry feedback

## Performance Requirements
The API client must be small and predictable.

Rules:

- schema parsing must happen once per response.
- large lists must avoid expensive transform loops in render paths.
- route registry generation must not add server-only dependencies to apps.
- `packages/shared` imports must remain compatible with frontend bundlers.
- proof file transfer must avoid loading large files into JSON state.
- error redaction must be fast and bounded.
- public tracking lookup must not import admin-only schemas into the public bundle if package splitting is available.

## Configuration
Required runtime configuration:

| Config | Surface | Rule |
| --- | --- | --- |
| `KRA_API_BASE_URL` | all apps | must be HTTPS outside local development |
| `KRA_APP_SURFACE` | all apps | one of public web, receiver public, sender mobile, operations mobile, admin web |
| `KRA_API_TIMEOUT_MS` | all apps | default from platform config |
| `KRA_ENABLE_API_SCHEMA_DIAGNOSTICS` | non-production | enables detailed local diagnostics without sensitive values |
| `KRA_ENABLE_OFFLINE_OUTBOX` | operations mobile | controls field action queue integration |

Rules:

- config must be read from approved app config files.
- config must not live in screen files.
- production base URL must not be hardcoded in reusable components.
- frontend apps must not contain webhook secrets or internal task secrets.

## Endpoint Acceptance Matrix
This matrix defines the first implementation closure target.

| Operation | Surface family | Request parse | Response parse | Error parse | Idempotency | Offline eligible |
| --- | --- | --- | --- | --- | --- | --- |
| `get_public_tracking` | public, receiver | path only | yes | yes | no | no |
| `request_public_tracking_phone_challenge` | receiver | yes | yes | yes | no auto retry | no |
| `verify_public_tracking_phone` | receiver | yes | yes | yes | yes | no |
| `list_deliveries` | sender, ops | query | yes | yes | no | read cache only |
| `create_delivery` | sender | yes | yes | yes | yes | no |
| `get_delivery` | sender, ops | path only | yes | yes | no | read cache only |
| `get_delivery_timeline` | sender, ops, admin | path only | yes | yes | no | read cache only |
| `cancel_delivery` | sender | yes | yes | yes | no auto retry | no |
| `initialize_payment` | sender | yes | yes | yes | yes | no |
| `verify_payment` | sender | yes | yes | yes | yes | no |
| `confirm_intake` | station | yes | yes | yes | yes | yes |
| `assign_driver` | station | yes | yes | yes | yes | yes |
| `accept_run` | driver | yes | yes | yes | yes | yes |
| `dispatch_delivery` | station | yes | yes | yes | yes | yes |
| `confirm_pickup` | driver | yes | yes | yes | yes | yes |
| `mark_in_transit` | driver | yes | yes | yes | yes | yes |
| `receive_destination` | station | yes | yes | yes | yes | yes |
| `assign_final_mile` | station | yes | yes | yes | yes | yes |
| `accept_final_mile_assignment` | courier | yes | yes | yes | yes | yes |
| `mark_out_for_delivery` | courier | yes | yes | yes | yes | yes |
| `record_failed_attempt` | courier | yes | yes | yes | stable queued action only | yes |
| `create_delivery_proof_asset` | courier | yes | yes | yes | yes | yes |
| `confirm_delivery_proof_asset_upload` | courier | yes | yes | yes | yes | yes |
| `complete_delivery` | courier | yes | yes | yes | yes | yes |
| `list_issues` | sender, ops, admin | query | yes | yes | no | read cache only |
| `create_issue` | sender, ops | yes | yes | yes | yes | ops only |
| `get_issue` | sender, ops, admin | path only | yes | yes | no | read cache only |
| `escalate_issue` | admin | yes | yes | yes | yes | no |
| `resolve_issue` | admin | yes | yes | yes | yes | no |
| `list_notifications` | sender, ops | query | yes | yes | no | read cache only |
| admin read operations | admin | query where present | yes | yes | no | no |
| admin mutation operations | admin | yes | yes | yes | yes | no |
| webhook operations | none | blocked | blocked | blocked | blocked | no |
| internal operations | none | blocked | blocked | blocked | blocked | no |

## Test Requirements
Claude Code must add tests when implementing this client.

Unit tests:

- URL builder replaces required params and rejects missing params.
- query serializer omits undefined values.
- request schema validation blocks invalid payloads.
- success schema validation returns typed data.
- success schema validation blocks mismatched data.
- server error parser returns `ApiServerError`.
- malformed error parser returns `ApiMalformedError`.
- network failure maps to `NETWORK_ERROR`.
- timeout maps to `REQUEST_TIMEOUT`.
- abort maps to `REQUEST_ABORTED`.
- redaction removes sensitive keys.
- idempotency header is attached only when required.
- webhook and internal operations are not exposed.

Component or hook tests:

- query hook exposes loading, success, and typed error states.
- mutation hook `unwrap` resolves typed data on success.
- mutation hook returns recovery state on backend error.
- public tracking hook never requires Firebase auth.
- admin hook requires token provider.
- operations mutation can produce an outbox envelope when offline policy allows.

Integration tests:

- generated route registry matches backend route IDs.
- every backend `apiErrorCodeSchema` value maps to UI recovery state.
- proof asset flow blocks completion until upload confirmation succeeds.
- payment verification polling stops on confirmed, failed, or review state.
- scan mismatch maps to scan mismatch recovery.
- rate limiting maps to cooldown UI metadata.

End-to-end tests after UI exists:

- sender creates delivery, initializes payment, verifies payment, and sees parsed delivery detail.
- station confirms intake through typed mutation.
- driver confirms pickup through typed mutation.
- courier uploads proof and completes delivery through staged proof flow.
- admin opens finance and payment reconciliation routes through admin hooks.
- receiver public tracking uses public hooks and never receives private delivery detail.

## Implementation Sequence
Claude Code should implement in this order when the frontend build starts:

1. Create shared API error model and redaction utilities.
2. Create URL builder and query serializer.
3. Create request and response schema parse helpers.
4. Create base query wrapper around fetch or `fetchBaseQuery`.
5. Create operation registry from backend route metadata.
6. Exclude `webhook` and `internal` operations from app-facing hooks.
7. Create public tracking endpoints.
8. Create sender delivery and payment endpoints.
9. Create operations handoff and proof endpoints.
10. Create issue and notification endpoints.
11. Create admin endpoints.
12. Add idempotency integration.
13. Add offline outbox envelope integration.
14. Add cache tag metadata hooks.
15. Add drift tests and redaction tests.
16. Run full CI before UI screens consume the client.

## Claude Code Build Instructions
When Claude Code implements this spec:

- do not build actual screen UI from this file.
- do not add untyped fetch calls in screens.
- do not cast API responses with `as`.
- do not suppress Zod errors to force render.
- do not expose webhook or internal routes.
- do not invent error codes outside the current shared enum unless the backend contract is updated first.
- do not add local pricing calculations.
- do not add local custody state transitions.
- do not store receiver verification tokens in persistent storage.
- do not emit sensitive fields to analytics.
- do not create broad cache invalidation if precise tags are available.
- do not add retries to non-idempotent operations without operation policy.

## Completion Checklist
This infrastructure item is complete only when:

- every frontend API call uses a typed endpoint or typed base query path.
- every allowed operation has request, response, and error parsing.
- every blocked operation is absent from app-facing hooks.
- every server error code maps to a recovery state.
- every local client error maps to a recovery state.
- every sensitive value is covered by redaction tests.
- every idempotent mutation has key handling.
- every offline-approved operation can produce a stable outbox envelope.
- every proof asset flow uses the staged upload contract.
- every admin endpoint is admin-scope only.
- public tracking cannot render private delivery detail.
- CI fails on schema drift.
- frontend screen specs can refer to operation hooks by name without redefining payload contracts.

## Quality Bar
Pass conditions:

- A new frontend engineer can build a screen without reading Fastify route handlers.
- A staff workflow can queue and replay an approved mutation without changing payload shape.
- A sender payment screen can distinguish pending, failed, confirmed, under review, and service errors.
- A receiver public flow can track safely without authenticated app data leakage.
- An admin console can preserve request IDs for support and audit review.
- A schema mismatch cannot silently render incorrect data.
- A forbidden endpoint cannot be reached through generated app hooks.

Fail conditions:

- any screen handwrites `/v1` URLs.
- any screen casts response data with `as Delivery`.
- any screen interprets backend errors without `ApiErrorMapper`.
- any public client imports admin-only endpoint hooks.
- any operations mutation omits idempotency policy.
- any queued staff action loses original idempotency key.
- any proof completion can happen before proof upload confirmation.
- any analytics event includes a token, phone, address, scan code, OTP, proof URL, or raw payload.

## Open Implementation Notes
These are implementation constraints, not unresolved product questions:

- If `apiRoutes` remains server-side only, create a frontend-safe route metadata export that contains no Fastify dependencies.
- If bundle size becomes high, split endpoint families by app surface.
- If backend adds `PATCH`, `DELETE`, file upload metadata, or pagination cursors, update this spec before exposing those operations.
- If backend adds receiver-token headers, update public access API contracts and receiver public specs first.
- If backend adds read receipts for notifications, update notification cache and endpoint specs together.

## Spec Closure Review
This file is closed when it enforces a single typed path from frontend screens to backend contracts.

Review questions:

- Can Claude Code generate endpoint hooks without inventing payload shapes?
- Can every route be mapped back to `services/api/src/routes.ts`?
- Can every response be parsed through `packages/shared/src/contracts/api.ts`?
- Can every error code reach the right shared state?
- Can every sensitive value be redacted without screen authors remembering it manually?
- Can public, sender, operations, and admin clients import only the operations they are allowed to use?
- Can CI prove contract drift before users see it?

If any answer is no, the API client is not ready for screen implementation.
