# Error State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `error` |
| Component family | Shared screen state |
| Primary component | `SharedErrorState` |
| Supporting components | `RouteErrorFallback`, `InlineErrorPanel`, `FormErrorSummary`, `RetryPanel`, `PartialDataErrorBanner`, `MutationErrorNotice`, `SupportEscalationHint`, `ErrorBoundaryFallback` |
| Primary surfaces | public web, receiver public flow, sender mobile app, operations mobile app, admin web console |
| Required recovery | retry and support path |
| Test id root | `state-error` |
| Backend coverage | None directly; maps client-visible failures from API, network, render, validation, upload, provider, or local store operations |
| Browser mutation operation | None |
| Data sensitivity | safe error code, safe message, request ID, operation name, retry eligibility, support route, failed field labels |
| Offline critical | Yes for driver, station, and final-mile flows; no for admin web offline because admin web is online-only |
| Related inventory state | `error` |
| Related state specs | loading, empty, offline, stale data, not authorized, session expired, blocked by payment, blocked by issue, manual review required, rate limited |
| Design tokens | `danger.red.600`, `warning.amber.600`, `brand.blue.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear error identification, clear recovery actions, and predictable focus |

## Purpose
`SharedErrorState` defines how every Kra surface communicates a failed request, failed render, failed mutation, failed local operation, failed upload, or unexpected service condition that the user can recover from or escalate.

The error state must answer:
- `What failed?`
- `What is still safe?`
- `Can the user retry?`
- `Should the user change input, wait, refresh, go back, or contact support?`
- `Is the failure a whole-page failure, section failure, form failure, mutation failure, or background refresh failure?`
- `Which details are safe to show to this actor?`
- `Which state should be used instead of generic error?`
- `How do we avoid duplicate or unsafe retries?`

The most important rule is:
```text
Error must be specific enough to recover, but never leak stack traces, provider secrets, restricted data, or unsupported authority.
```

## Product Job
Kra is a delivery network where errors can affect money, package custody, proof, trust, and field operations. A generic failure message is not enough.

The error system must:
- keep users oriented when a read fails
- protect duplicate mutations
- distinguish user-correctable input from system failure
- preserve form data
- preserve safe cached content where allowed
- guide staff to retry, queue locally, or escalate
- guide customers to retry, check status, or contact support
- keep admin tools precise and audit-safe
- avoid exposing sensitive backend details

An error state is not a confession that the whole app is broken. It is a scoped recovery surface.

## Strategic Role
Error handling is part of Kra's reliability promise.

Customer trust:
- Senders must understand when delivery creation, payment initialization, tracking, profile save, or issue creation fails.
- Receivers must see safe guidance when tracking verification or timeline fetch fails.
- Public visitors must not see internal service traces.

Operational trust:
- Station operators, drivers, and couriers must know whether an action failed before custody, proof, or package movement is final.
- Offline-capable roles must know when a command can be saved locally instead of retried online.
- Staff must not retry an action that the backend already rejected as a domain conflict.

Admin trust:
- Admins must see enough source and request context to investigate.
- Admins must not see raw provider secrets or stack traces.
- Admins must not receive manual controls that do not exist in the backend contract.

Engineering trust:
- Error states must be typed, tested, logged, and observable.
- Error copy must map to the approved error catalog.
- The UI must not invent backend outcomes or retry policies.

## External Research Used
Only directly relevant accessibility and error-message guidance was used:
- [W3C WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear text identification when an input or action has failed.
- [W3C WCAG 2.2 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html): supports presenting recovery suggestions when known.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing non-focus status changes such as request failure or retry result.
- [GOV.UK Design System error message](https://design-system.service.gov.uk/components/error-message/): supports concise field-level error copy tied to the affected control.
- [GOV.UK Design System error summary](https://design-system.service.gov.uk/components/error-summary/): supports summarizing validation errors and linking users to the affected fields.
- [Carbon Design System inline notification](https://carbondesignsystem.com/components/notification/usage/): supports contextual error notification for recoverable problems without replacing the whole screen.

## Visual Thesis
Error states should feel like a calm operations incident card: clear fault, safe context, exact recovery, and controlled urgency.

Use:
- red for actual failure
- amber for recoverable warning or partial data
- blue for retry or navigation action
- visible title and body copy
- request ID when safe and useful
- one primary recovery action
- one support or secondary route when needed
- compact inline panels for local failures
- full-page route fallback only when the whole route cannot render

Do not use:
- panic styling
- angry copy
- blame language
- generic "something went wrong" as the only message
- raw error objects
- stack traces
- provider references on customer surfaces
- automatic infinite retry
- retry controls for domain rejections that need a different action

## Audience
Primary users:
- public visitor facing public lookup or form failure
- receiver facing secure tracking or OTP failure
- sender facing delivery creation, payment, tracking, support, receipt, or profile failure
- station operator facing queue, scan, intake, dispatch, receipt, or local store failure
- driver facing assignment, pickup, transit, handoff, issue, or sync failure
- final-mile courier facing task, proof, OTP, completion, failed-attempt, or sync failure
- admin facing dashboard, table, detail, export, finance, audit, webhook, issue, station, pricing, or user-management failure

Secondary users:
- support staff reading user-provided request IDs
- QA validating error mapping
- security reviewer validating no sensitive leakage
- accessibility reviewer validating identification and recovery
- backend engineer mapping error codes to safe UI states
- Claude Code implementing shared components later

Non-users:
- webhook provider
- scheduled task
- unauthenticated attacker
- payment provider

## Non-Goals
Do not use the generic error state for:
- missing permission
- expired session
- offline with known offline state
- stale cached data
- empty result
- rate limit when wait time is known
- payment under review
- refund pending
- blocked payment
- blocked issue
- manual review required
- scan mismatch
- duplicate package label
- custody not confirmed
- OTP required
- proof required
- webhook conflict

Those states have their own user guidance and must not be collapsed into generic error.

## Error State Taxonomy
Kra must treat errors as typed failures.

| Mode | Meaning | Primary Recovery |
| --- | --- | --- |
| `route_read_error` | Required route read failed and no safe cached data can render | retry or safe back route |
| `section_read_error` | A section failed while the rest of the page can render | retry section or continue with caveat |
| `background_refresh_error` | Existing data remains visible but refresh failed | retry refresh or keep current data |
| `mutation_error` | A command failed after user submit | retry only when safe, preserve form |
| `validation_error` | Input is invalid or missing | fix fields |
| `server_validation_error` | Server rejected semantic business data | correct data or follow domain state |
| `network_error` | Request failed due to network but offline state is not confirmed | retry or check connection |
| `timeout_error` | Request or provider dependency took too long | retry, wait, or support path |
| `provider_unavailable_error` | External provider dependency unavailable | retry later or alternate allowed flow |
| `upload_error` | Proof or media upload failed | retry upload, keep local metadata when safe |
| `local_store_error` | Device local persistence failed | retry local save or stop critical command |
| `render_error` | UI route or component crashed | reload route and send telemetry |
| `contract_error` | Response shape violates client contract | retry, report, and block unsafe rendering |
| `partial_data_error` | Some sources failed while other sources are usable | show partial data and source-specific retry |
| `unsupported_operation_error` | UI reached an operation not backed by current contract | remove action and route to owner/help |

## Approved Error Code Mapping
The UI must map approved error catalog values before using generic error.

| Error Code | Preferred UI State |
| --- | --- |
| `AUTH_REQUIRED` | session expired or sign-in route |
| `FORBIDDEN_ROLE` | not authorized |
| `STATION_SCOPE_VIOLATION` | not authorized or station scope denied |
| `ASSIGNMENT_SCOPE_VIOLATION` | not authorized or assignment scope denied |
| `DELIVERY_NOT_FOUND` | not found or privacy-safe empty depending on surface |
| `INVALID_STATUS_TRANSITION` | server validation or blocked domain state |
| `DELIVERY_NOT_PAID` | blocked by payment |
| `HANDOFF_PROOF_REQUIRED` | proof required |
| `PHONE_VERIFICATION_REQUIRED` | OTP required |
| `PACKAGE_ALREADY_RECEIVED` | duplicate or already completed domain state |
| `PACKAGE_SCAN_MISMATCH` | scan mismatch |
| `PACKAGE_NOT_READY_FOR_DISPATCH` | blocked domain state |
| `FINAL_PROOF_REQUIRED` | proof required |
| `FINAL_MILE_NOT_AVAILABLE` | service unavailable or blocked domain state |
| `REATTEMPT_LIMIT_REACHED` | blocked domain state |
| `PAYMENT_FAILED` | payment failed recovery, not generic error |
| `PAYMENT_ALREADY_CONFIRMED` | ready or already confirmed state |
| `PAYMENT_PROVIDER_UNAVAILABLE` | provider unavailable error |
| `REFUND_NOT_ALLOWED` | refund policy state |
| `REFUND_ALREADY_PROCESSED` | refund already processed state |
| `DUPLICATE_SCAN` | duplicate package label or duplicate scan state |
| `CONFLICTING_HANDOFF_STATE` | custody or handoff conflict state |
| `ISSUE_LOCK_ACTIVE` | blocked by issue |
| `VALIDATION_ERROR` | validation error |
| `PROVIDER_TIMEOUT` | timeout error |
| `UNKNOWN_INTERNAL_ERROR` | route, section, mutation, or render error based on operation |

Internal-only codes must not be exposed to public clients.

## State Machine
Route read:
```text
loading
  -> ready | empty | route_read_error | not_authorized | session_expired | offline | stale_data
```

Section read:
```text
ready
  -> section_loading
  -> section_ready | section_read_error
```

Mutation:
```text
ready
  -> mutation_submitting
  -> success | mutation_error | validation_error | server_validation_error | not_authorized | session_expired | rate_limited
```

Upload:
```text
proof_selected
  -> uploading_proof
  -> proof_uploaded | upload_error | offline_queued | proof_required
```

Render boundary:
```text
route_render
  -> render_error
  -> reload_route | safe_home | support
```

## Entry Rules
Enter error when:
- a required request fails after loading
- a mutation fails and the failure is not a known domain state
- a local store operation fails
- a file or proof upload fails
- a response violates the expected client contract
- a route or component render crashes
- a background refresh fails and needs visible notice
- a provider dependency is unavailable or times out
- a section read fails while other content remains usable

Do not enter error when:
- user is unauthenticated
- user is unauthorized
- session expired
- request is still loading
- result is empty
- app is known offline and offline path exists
- data is stale but usable
- rate limit includes a wait time
- backend returns a known blocked state
- payment is under review
- manual review is required

## Exit Rules
Exit error when:
- retry succeeds
- user fixes validation fields
- user navigates to safe route
- user opens support path
- user signs in again after session state changes
- cached data becomes available and stale state applies
- backend returns a known domain state
- local outbox accepts a queued offline command

Exit targets:
- `loading`
- `ready`
- `empty`
- `offline`
- `stale_data`
- `not_authorized`
- `session_expired`
- route-specific domain state
- support route
- safe home route

## Retry Rules
Retry must be deliberate and safe.

Allowed retry:
- read request
- background refresh
- section read
- proof upload after failure
- local store write only when it will not duplicate an accepted command
- mutation only if idempotency key and payload are preserved
- provider status verification when product flow allows it

Disallowed retry:
- validation error without field changes
- forbidden or permission errors
- expired session before reauthentication
- payment initialization from provider return screen
- manual notification retry where no browser endpoint exists
- webhook replay where no browser endpoint exists
- custody mutation after conflict without review
- scan submit after mismatch without rescan
- duplicate package label
- domain transition rejected by current state

Retry action must:
- show loading state while retrying
- preserve form data
- preserve idempotency key when retrying same mutation
- disable duplicate retry while in progress
- leave error state when retry succeeds or maps to another state
- keep focus predictable if retry fails again

## Support Path Rules
Support path must be available when retry is not enough.

Customer support path:
- public support entry where available
- sender support thread or issue create
- receiver support guidance without exposing restricted data

Staff support path:
- report issue
- open issue route
- call supervisor workflow if documented later
- local outbox conflict review

Admin support path:
- open owning admin detail
- open audit events
- open issue queue
- open reconciliation
- copy request ID
- report engineering incident where product supports it

Do not show support path that does not exist in the route map.

## Copy Rules
Error copy must follow the local copy deck:
- State what failed.
- State what the user can do next.
- Avoid vague blame language.

Structure:
- title: what failed
- body: what can happen next
- primary action: retry, fix fields, refresh, go back, or open owner route
- secondary action: support path, copy request ID, or safe route
- technical detail: request ID or safe code when useful

Use:
- `Could not load delivery details`
- `Retry loading this delivery. If it keeps failing, contact support with the request ID.`
- `Could not save intake confirmation`
- `Keep this screen open and retry. Do not hand off the package until confirmation is recorded.`
- `Could not upload proof`
- `Your proof details are still on this device. Retry upload before completing delivery.`

Do not use:
- `Oops`
- `Unknown error`
- `Something went wrong` as the only message
- `Try again later` as the only recovery
- `Server exploded`
- `Invalid object`
- `Bad request`
- raw provider message
- stack trace

## Visual System
Use visual severity by risk.

Full route error:
- large heading
- short explanation
- primary retry action
- secondary safe navigation
- request ID if safe

Section error:
- compact card or inline panel
- preserve surrounding content
- source-specific retry
- do not block other safe actions

Form error:
- error summary at top for multi-field forms
- field-level messages tied to labels
- first invalid field focus after submit
- preserved entered values

Mutation error:
- near the action or command footer
- preserve original form state
- show whether retry is safe
- show support path for repeated failure

Background refresh error:
- non-blocking banner
- keep current content visible
- show data age
- allow retry refresh

Partial data error:
- show available data
- mark failed source
- provide source-specific retry
- do not use broad full-page failure

## Accessibility Rules
Error handling must be accessible by default.

Requirements:
- Use a clear heading for full error states.
- Use `role="alert"` only when immediate announcement is necessary.
- Use polite status region for non-urgent background refresh errors.
- For form validation, provide error summary after submit and link to fields.
- Associate field errors with inputs.
- Do not rely on color alone.
- Keep focus on the failed action if retry remains there.
- Move focus to error summary after failed form submit.
- Move focus to route error heading for full route failure.
- Do not move focus for background refresh error unless user initiated refresh and the result changes action safety.
- Keep retry and support buttons keyboard reachable.
- Error messages must survive large text.
- Reduced motion must not hide error entry.

## Focus Rules
Focus behavior:
- Full route error: focus route error heading after route load fails.
- Section error: do not steal focus unless user initiated section retry.
- Form validation: focus error summary, then allow links to fields.
- Mutation error: keep focus near submit action or error heading in the form region.
- Upload error: focus upload panel heading if upload was foreground.
- Render error: focus fallback heading.
- Background refresh error: no focus movement unless current action is blocked.

## Privacy Rules
Errors must not leak restricted details.

Public and receiver errors must not show:
- stack traces
- provider reference
- sender ID
- staff ID
- station operator name
- audit metadata
- raw issue body
- internal delivery state names
- payment provider payload
- full phone numbers unless verified and expected

Sender errors must not show:
- staff assignment details
- internal custody owner IDs
- admin-only status
- raw provider details

Staff errors must not show:
- another actor's private data outside scope
- internal secrets
- provider secrets

Admin errors may show:
- safe error code
- request ID
- route name
- operation name
- safe source name

Admin errors must not show:
- stack trace
- secrets
- raw provider payloads unless a dedicated secured viewer exists
- token contents
- OTP values

## Security Rules
Error state must fail closed.

Rules:
- Do not render restricted content behind an error banner.
- If auth state is unknown, do not show protected content.
- If backend returns 403, use not authorized rather than generic error.
- If backend returns 401, use session expired or sign-in path.
- Do not retry automatically after authorization errors.
- Do not reveal whether restricted records exist.
- Do not include hidden data in analytics.
- Do not include raw exception messages in customer copy.
- Render contract error if response shape cannot be trusted.

## Offline And Low-Bandwidth Rules
Error and offline are distinct.

Rules:
- If the device is clearly offline, use offline state where available.
- If network failed but offline status is uncertain, use `network_error`.
- If cached data exists, prefer stale/offline-cached state with warning instead of full route error.
- If local outbox can safely accept the operation, route to local save flow instead of online mutation error.
- If local storage fails, show `local_store_error` and stop critical command completion.
- Do not require heavy media to explain failure.
- Proof upload failure must preserve local proof metadata when possible.

## Surface-Specific Behavior
### Public Web
Use error states for:
- public tracking request failure
- public support submit failure
- service-area lookup failure
- public page data section failure

Rules:
- Keep copy privacy-safe.
- Offer retry and support when available.
- Do not expose internal API names.
- Do not show staff or provider details.

### Receiver Public Flow
Use error states for:
- secure link validation request failure
- phone challenge request failure
- OTP verification request failure that is not invalid OTP
- receiver-safe timeline request failure

Rules:
- Invalid OTP is validation, not route error.
- Expired link is expired state, not generic error.
- Access denied is not authorized or access-denied state, not generic error.
- Keep support path safe.

### Sender Mobile App
Use error states for:
- sign-in network failure
- auth recovery submit failure
- delivery list failure
- station selection failure
- quote request failure
- delivery creation failure
- payment initialization failure
- payment verification timeout
- issue creation failure
- notification list failure
- profile save failure

Rules:
- Preserve form values.
- Payment failed recovery owns payment retry.
- Payment under review is not generic error.
- Quote errors must not show client-calculated fallback price.
- Do not expose provider internals.

### Station Operator Mobile App
Use error states for:
- station queue read failure
- scan validation failure not caused by mismatch
- intake confirmation failure
- dispatch confirmation failure
- destination receipt failure
- issue report failure
- local outbox write failure

Rules:
- Do not imply custody changed after failed confirmation.
- Offer retry only with idempotency protection.
- If offline queue is available and accepted, use queued/offline state instead.
- If scan mismatch, use scan mismatch state.

### Driver Mobile App
Use error states for:
- assignment read failure
- pickup confirmation failure
- transit update failure
- handoff confirmation failure
- issue report failure
- sync flush failure

Rules:
- Keep current assignment context if safe.
- Do not imply package handoff succeeded.
- Preserve proof or scan context.
- Use conflict state for handoff conflicts.

### Final-Mile Courier Mobile App
Use error states for:
- task list read failure
- arrival state failure
- OTP verification network failure
- proof upload failure
- completion failure
- failed-attempt submit failure
- local outbox write failure

Rules:
- Proof upload failure must keep proof data where possible.
- Completion must not be shown until backend or local critical acceptance allows it.
- Invalid OTP remains validation, not generic error.

### Admin Web Console
Use error states for:
- overview route failure
- admin list failure
- detail route failure
- finance summary failure
- reconciliation failure
- issue queue failure
- audit events failure
- webhook events failure
- export failure
- analytics failure
- modal host submit failure

Rules:
- Include safe request ID where available.
- Include operation name where safe.
- Preserve filters.
- Keep existing data visible for background refresh errors.
- Do not expose raw provider payloads outside approved detail surfaces.
- Do not show unsupported retry controls.

## Component Contract
### `SharedErrorState`
Required props:
```ts
type SharedErrorStateProps = {
  mode:
    | "route_read_error"
    | "section_read_error"
    | "background_refresh_error"
    | "mutation_error"
    | "validation_error"
    | "server_validation_error"
    | "network_error"
    | "timeout_error"
    | "provider_unavailable_error"
    | "upload_error"
    | "local_store_error"
    | "render_error"
    | "contract_error"
    | "partial_data_error"
    | "unsupported_operation_error";
  surface:
    | "public_web"
    | "receiver_public"
    | "sender_mobile"
    | "station_mobile"
    | "driver_mobile"
    | "courier_mobile"
    | "admin_web";
  title: string;
  body: string;
  safeErrorCode?: string;
  requestId?: string;
  operationName?: string;
  failedSourceLabel?: string;
  canRetry: boolean;
  retryLabel?: string;
  onRetry?: () => void;
  supportAction?: {
    label: string;
    onPress: () => void;
    testId: string;
  };
  safeBackAction?: {
    label: string;
    onPress: () => void;
    testId: string;
  };
  testId?: string;
};
```

Implementation notes:
- `onRetry` is required when `canRetry` is true.
- `retryLabel` is required when `canRetry` is true.
- Public and receiver variants must omit unsafe internal detail.
- Admin variants may show `requestId` and `operationName`.
- The component must not decide domain outcome from error text alone.

### `RouteErrorFallback`
Use when a route cannot render useful content.

Required behavior:
- Focus heading.
- Show safe route title.
- Show retry.
- Show safe back route.
- Include request ID when available and safe.

### `InlineErrorPanel`
Use for section-level failures.

Required behavior:
- Preserve surrounding content.
- Name failed source.
- Offer source-specific retry.
- Avoid blocking unrelated actions.

### `FormErrorSummary`
Use for validation errors.

Required behavior:
- Appear after submit.
- Link to affected fields.
- Use field labels, not backend property names.
- Preserve form data.
- Focus summary after submit failure.

### `MutationErrorNotice`
Use when a submit action fails.

Required behavior:
- Sit near action or form footer.
- Preserve values.
- State whether retry is safe.
- Use same idempotency key for safe retry of same payload.
- Disable retry while retry is in progress.

### `PartialDataErrorBanner`
Use when some data loads and some fails.

Required behavior:
- Keep usable data visible.
- Label failed source.
- Explain reviewer impact.
- Provide source-specific retry.
- Avoid full-page failure.

### `ErrorBoundaryFallback`
Use for render crashes.

Required behavior:
- Show route-safe fallback.
- Offer reload route.
- Offer safe home.
- Send telemetry.
- Do not expose exception details to user.

## Data And API Integration
Error mapping must use the approved error catalog.

For RTK Query reads:
- rejected with 401 maps to session expired or sign-in.
- rejected with 403 maps to not authorized.
- rejected with known domain code maps to domain state.
- rejected with network failure maps to offline or network error depending connectivity.
- rejected with 5xx maps to route or section error.
- successful response with invalid schema maps to contract error.

For RTK Query mutations:
- rejected with validation details maps to validation or server validation.
- rejected with known domain conflict maps to domain state.
- rejected with 5xx maps to mutation error.
- rejected with provider timeout maps to timeout error.
- retry must preserve idempotency key for same payload.

For render errors:
- route boundary catches and renders `render_error`.
- telemetry receives safe route, component boundary, and request correlation where available.
- UI never renders stack trace.

For uploads:
- failed upload maps to upload error.
- preserved local proof metadata must be shown if safe.
- retry upload must not duplicate completion.

## Copy Matrix
| Context | Mode | Title | Body | Primary Action |
| --- | --- | --- | --- | --- |
| Public tracking read | `route_read_error` | `Could not load tracking status` | `Retry the lookup. If it keeps failing, contact support with the request ID.` | `Retry` |
| Receiver OTP network failure | `mutation_error` | `Could not verify the code` | `Check your connection and retry. The code has not been accepted yet.` | `Retry verification` |
| Sender delivery creation | `mutation_error` | `Could not create delivery` | `Your delivery details are still here. Retry before starting payment.` | `Retry` |
| Sender quote | `route_read_error` | `Could not prepare quote` | `Retry to get the current price and route assumptions.` | `Retry quote` |
| Payment provider timeout | `timeout_error` | `Payment check took too long` | `Retry checking the payment result. Do not restart payment from this screen.` | `Check again` |
| Station intake | `mutation_error` | `Could not save intake confirmation` | `Do not move this package forward until intake is recorded or queued.` | `Retry` |
| Driver handoff | `mutation_error` | `Could not save handoff` | `The handoff is not confirmed yet. Retry with the same package context.` | `Retry handoff` |
| Courier proof upload | `upload_error` | `Could not upload proof` | `Keep the proof on this device and retry upload before completing delivery.` | `Retry upload` |
| Admin table | `route_read_error` | `Could not load results` | `Retry loading this table. If it keeps failing, use the request ID for support.` | `Retry` |
| Admin background refresh | `background_refresh_error` | `Refresh failed` | `Current results remain visible. Retry refresh to get the latest data.` | `Retry refresh` |
| Admin export | `mutation_error` | `Could not prepare export` | `Retry the export from the same filters, or open the source screen.` | `Retry export` |
| Render boundary | `render_error` | `This page could not render` | `Reload this page. If it keeps failing, return to a safe screen.` | `Reload page` |

## Validation Error Rules
Validation errors are not generic failures.

Rules:
- Use field-level messages for field errors.
- Use form summary for multiple errors.
- Use business-safe language.
- Preserve entered values.
- Do not blame the user.
- Do not expose backend property paths.

Examples:
```text
Enter receiver phone number.
Select destination station.
Enter package description.
Upload proof photo before completing delivery.
```

## Partial Failure Rules
Partial failure should preserve usable content.

Use for:
- admin overview where one signal source failed
- refund evidence review where one evidence group failed
- station detail where one queue failed
- analytics where one chart source failed
- notification list where counts load but detail fails

Rules:
- mark failed source
- preserve loaded sources
- explain impact
- provide source-specific retry
- send telemetry

Do not collapse a full page into error when most critical content is still safe and useful.

## Analytics Events
Track errors without leaking sensitive data.

Recommended events:
- `error_state_viewed`
- `error_retry_clicked`
- `error_retry_succeeded`
- `error_retry_failed`
- `form_error_summary_viewed`
- `mutation_error_viewed`
- `upload_error_viewed`
- `partial_data_error_viewed`
- `render_error_boundary_viewed`
- `support_path_clicked`

Required fields:
- `surface`
- `mode`
- `routeName`
- `operationName`
- `safeErrorCode`
- `httpStatus`
- `actorRole`
- `canRetry`
- `retryCount`
- `hasRequestId`
- `resultState`

Do not send:
- stack traces from client analytics
- provider payloads
- OTP values
- proof files
- full addresses
- raw issue text
- token data
- secrets

## QA Acceptance Criteria
General:
- Error state appears only after a failure is known.
- Loading, empty, offline, unauthorized, session-expired, rate-limited, and domain blocked states do not render as generic error.
- Every error has a clear title.
- Every error has recovery guidance.
- Retry appears only when safe.
- Support path appears when available and useful.
- Sensitive details are not exposed.
- Form values are preserved.
- Mutation retry blocks duplicate submit.
- Request ID appears only where safe.

Mobile:
- Error copy remains readable on small screens.
- Primary recovery action is reachable.
- Field error summary supports keyboard and screen reader flow.
- Offline-capable roles route to local save when supported.
- Proof upload failure preserves local proof context.

Admin web:
- Filters remain visible after list failure.
- Background refresh failure keeps current data visible.
- Request ID can be copied when safe.
- Partial failures do not erase loaded sections.
- Unsupported operations remove the unsupported action.

## Unit Test Requirements
Tests must cover:
- all error modes render
- retry required when `canRetry` is true
- retry omitted when unsafe
- request ID hidden on public and receiver surfaces unless explicitly safe
- field summary links to fields
- error boundary hides exception details
- partial data error preserves child content slot
- background refresh error does not clear existing data
- 401 maps out to session expired
- 403 maps out to not authorized
- known domain code maps out to domain state
- unknown 5xx maps to route or mutation error

## Component Test Requirements
Use component tests for:
- public tracking error
- receiver OTP verification network failure
- sender delivery creation mutation error
- payment provider timeout
- station intake mutation error
- driver handoff mutation error
- courier proof upload error
- admin table route error
- admin background refresh error
- admin partial data error
- form validation summary
- route render boundary fallback

Assertions:
- correct title
- correct body
- correct safe retry
- support path when available
- no restricted fields
- correct focus behavior
- correct live region behavior
- retry disabled while in progress

## E2E Test Requirements
Critical journeys:
- Sender create-delivery submit fails, preserves form, and retries safely.
- Payment provider return verification times out and does not restart payment.
- Station intake request fails and does not advance custody.
- Driver handoff request fails and does not mark handoff complete.
- Courier proof upload fails, preserves proof context, and retries upload.
- Admin delivery explorer read fails and preserves filters.
- Admin background refresh fails and keeps current rows visible.
- Form validation shows summary and focuses the first error path.
- Render error boundary shows safe reload and home actions.

Network and state scenarios:
- 500 read failure
- network request failure
- timeout
- 401
- 403
- known 409 domain conflict
- validation 400
- provider 503
- local store write failure
- upload failure
- response contract mismatch

## Visual QA Checklist
Before closing implementation, inspect:
- full-page route error on desktop
- inline section error on desktop
- form error summary on mobile
- mutation error near action footer on mobile
- upload error panel on mobile
- admin background refresh error banner
- partial data error in admin dashboard
- render boundary fallback
- public privacy-safe error
- receiver privacy-safe error
- large text
- reduced motion
- keyboard focus
- screen reader announcement

The error UI should pass the five-role critique:
- Founder: the app feels reliable even when services fail.
- Skeptical customer: the message tells me what happened and what to do next.
- Operator: the UI prevents unsafe package movement after failure.
- Accessibility reviewer: errors are identified, announced, and recoverable.
- Creative director: urgency is clear without noise or panic.

## Implementation Sequence For Claude Code
Build in this order:
1. Add shared error mode types in the shared frontend contract location.
2. Add error-code-to-state mapper using the approved catalog.
3. Implement `SharedErrorState`.
4. Implement `RouteErrorFallback`.
5. Implement `InlineErrorPanel`.
6. Implement `FormErrorSummary`.
7. Implement `MutationErrorNotice`.
8. Implement `PartialDataErrorBanner`.
9. Implement `SupportEscalationHint`.
10. Implement `ErrorBoundaryFallback`.
11. Wire RTK Query read failures into typed error states.
12. Wire mutation failures with idempotency-safe retry.
13. Wire form validation summary and field errors.
14. Wire upload failure recovery.
15. Add privacy filters for public and receiver surfaces.
16. Add unit tests.
17. Add component tests.
18. Add critical E2E tests.

Do not add route-specific one-off error panels before the shared error library exists.

## Route Integration Checklist
Each screen spec that references `error` must specify:
- which operation can fail
- whether the failure is route, section, background refresh, mutation, validation, upload, local store, render, contract, partial data, provider, or timeout
- what safe error code can appear
- whether retry is safe
- whether idempotency key must be preserved
- what support path exists
- what context must remain visible
- what sensitive details are forbidden
- where focus moves
- what analytics event fires
- test ID suffix

If a screen cannot answer these items, its error behavior is incomplete.

## Test IDs
Required shared test IDs:
- `state-error`
- `state-error-title`
- `state-error-body`
- `state-error-code`
- `state-error-request-id`
- `state-error-retry`
- `state-error-support`
- `state-error-safe-back`
- `state-error-form-summary`
- `state-error-inline-panel`
- `state-error-mutation-notice`
- `state-error-partial-banner`
- `state-error-boundary`
- `state-error-copy-request-id`

Mode-specific test ID pattern:
```text
state-error-{mode}
```

Surface-specific test ID pattern:
```text
state-error-{surface}-{mode}
```

## Failure Modes To Prevent
The implementation must prevent:
- showing generic error for auth denial
- showing generic error for expired session
- showing generic error for offline state
- showing generic error for empty results
- showing generic error for rate limit with wait guidance
- leaking stack traces
- leaking provider payloads
- leaking restricted public or receiver data
- dropping form values after mutation failure
- retrying unsafe domain conflicts
- retrying without idempotency on duplicate-sensitive mutations
- hiding current data after background refresh failure
- full-page failure for one section failure
- raw backend property names in field errors
- focus loss after validation error
- endless automatic retry

## Definition Of Done
This shared error state is complete when:
- all error modes exist
- approved API error codes map to the correct UI state
- generic error is not used for auth, offline, rate limit, empty, or known domain states
- every error has actionable recovery
- retry is available only when safe
- public and receiver variants are privacy-safe
- staff mutation failures prevent unsafe package movement
- admin failures preserve filters and request context
- form errors are linked to fields
- render boundaries hide exception details
- analytics omit sensitive data
- unit, component, and E2E tests cover critical error paths
- visual QA passes desktop, mobile, large text, reduced motion, keyboard, and screen reader checks

