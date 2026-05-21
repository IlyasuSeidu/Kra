# Loading State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `loading` |
| Component family | Shared screen state |
| Primary component | `SharedLoadingState` |
| Supporting components | `ScreenSkeleton`, `TableSkeleton`, `InlineActionProgress`, `BlockingProgressOverlay`, `RefreshProgressBar`, `UploadProgressPanel`, `RouteLoadingShell` |
| Primary surfaces | public web, receiver public flow, sender mobile app, operations mobile app, admin web console |
| Required recovery | visible progress and no double-submit |
| Test id root | `state-loading` |
| Backend coverage | None directly; reflects active read, mutation, upload, auth, or local sync work |
| Browser mutation operation | None |
| Data sensitivity | route context, progress label, action label, cached age, current actor role, target record label |
| Offline critical | Yes for driver, station, and final-mile flows; no for admin web |
| Related inventory state | `loading` |
| Related state specs | empty, error, offline, stale data, not authorized, session expired, rate limited |
| Design tokens | `brand.blue.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with status-message support |

## Purpose
`SharedLoadingState` defines how every Kra surface communicates that data, authentication, upload, local sync, or a server mutation is in progress.

The loading state must answer:
- `What is happening right now?`
- `Which part of the page is unavailable?`
- `Can the user still inspect cached information?`
- `Which action is protected from double-submit?`
- `Is the operation short, long, determinate, or indeterminate?`
- `What will happen if the operation takes longer than expected?`
- `How is progress announced without stealing focus?`
- `How does the UI remain stable on weak networks?`

The most important rule is:
```text
Loading must preserve orientation, prevent duplicate commands, and never pretend that work is complete.
```

## Product Job
Kra is solving delivery reliability in African operating conditions where mobile networks can be unstable, devices can be mid-range, and every operational tap can affect money, custody, proof, and package movement.

Loading UI is not decoration. It is a trust and safety layer. A weak loading state can cause:
- duplicate delivery creation
- duplicate payment initialization
- duplicate handoff confirmation
- duplicate proof submission
- accidental scan retry
- unclear custody state
- user abandonment during payment verification
- support tickets caused by silent background refresh
- operators acting on old station queue data

The loading system must make in-progress work visible while preserving enough context for the user to stay oriented.

## Strategic Role
The loading state sits between user intent and backend truth.

For customers, it protects confidence:
- They understand that payment, quote, tracking, and proof information is still resolving.
- They do not think the app froze.
- They do not tap the same action repeatedly.

For staff, it protects operations:
- Station operators know intake or dispatch confirmation is still being processed.
- Drivers know handoff confirmation is not final until the server or local outbox accepts it.
- Couriers know proof capture is still uploading or queued.
- Admins know a table, dashboard, or sensitive action is still refreshing.

For engineering, it protects correctness:
- Read loading, background refresh, mutation submit, upload progress, and offline queue write are separate states.
- The state component does not invent backend outcomes.
- The screen remains stable while data is resolving.

## External Research Used
Only directly relevant loading, progress, and accessibility references were used:
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): status changes should be programmatically communicated without moving focus when the change is important but not focus-worthy.
- [MDN ARIA progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role): determinate progress should expose current value where known, while indeterminate progress should avoid false numeric values.
- [Material Design progress indicators](https://m3.material.io/components/progress-indicators/overview): determinate and indeterminate progress indicators should match whether completion amount is known.
- [Nielsen Norman Group response-time limits](https://www.nngroup.com/articles/response-times-3-important-limits/): UI feedback needs to account for fast, noticeable, and long waits with escalating communication.

## Visual Thesis
Loading should feel like a calm operational handoff board: stable structure, clear work labels, restrained motion, and no visual panic.

Use:
- quiet skeleton geometry
- visible text status
- stable page chrome
- role-aware progress labels
- subdued blue motion for trusted system work
- amber only when loading becomes a risk or needs user patience

Do not use:
- full-page spinner-only screens
- theatrical motion
- vague copy
- progress values that are not measured
- repeated announcements for every row
- content jumping while data resolves

## Audience
Primary users:
- public visitor checking service availability
- receiver opening a secure tracking link
- sender creating, paying for, tracking, or reviewing a delivery
- station operator handling intake, dispatch, receipt, scan, and queue flows
- driver handling assignment, pickup, dispatch, transit, and handoff flows
- final-mile courier handling arrival, proof, and completion flows
- admin monitoring operational, finance, support, station, and audit workflows

Secondary users:
- support staff helping a customer understand a wait
- QA validating loading and retry behavior
- accessibility reviewer validating announcements and focus behavior
- backend engineer verifying state names do not imply unsupported outcomes
- Claude Code implementing shared components later

Non-users:
- unauthenticated attacker
- webhook provider
- scheduled job
- browser extension

## Non-Goals
Do not use the loading state for:
- success confirmation
- error explanation
- empty result explanation
- permission denial
- payment under review
- refund pending
- manual review
- custody conflict
- scan mismatch
- offline conflict
- optimistic business-state advancement
- backend state transitions
- audit event creation
- route pricing decisions
- support escalation decisions

If the system knows the outcome, leave loading and render the correct resolved state.

## Loading State Taxonomy
Kra must treat loading as a set of distinct modes, not one generic spinner.

| Mode | Meaning | Primary UI Pattern | Blocks Interaction |
| --- | --- | --- | --- |
| `initial_route_loading` | Route shell is resolving required read data | route shell plus skeleton | blocks unavailable page content |
| `auth_resolving` | token, role, or capability is being checked | compact route shell status | blocks protected content |
| `initial_data_loading` | required read query has no usable cached data | structural skeleton with text status | blocks page-specific actions |
| `cached_refreshing` | cached data is visible while fresh data loads | visible refresh strip or top bar | no, except stale-sensitive actions |
| `filter_loading` | list results are changing after search or filter | list-level skeleton or table shimmer | blocks list actions only |
| `pagination_loading` | next page is being fetched | row-level progress at list end | no |
| `mutation_submitting` | command has been sent or queued | disabled primary action with inline progress | blocks same command |
| `local_outbox_writing` | offline-capable command is being durably stored | inline action progress with local write copy | blocks same command |
| `sync_flushing` | queued commands are syncing after reconnect | sync banner plus queue count | blocks conflicting commands |
| `uploading_proof` | photo or proof media is uploading | determinate upload panel when possible | blocks final completion until required metadata is safe |
| `payment_return_verifying` | provider return is being normalized | centered verification panel with clear copy | blocks payment bypass |
| `long_running_report` | client is assembling or downloading admin report data | progress panel with cancel when safe | blocks export action |
| `modal_host_submitting` | host screen is running a sensitive action after modal confirmation | modal footer action progress | blocks modal close only when unsafe |

## State Machine
The loading state must never be a dead end.

```text
idle
  -> auth_resolving
  -> initial_data_loading
  -> ready
  -> cached_refreshing
  -> ready
  -> mutation_submitting
  -> success | api_error | validation_error | not_authorized | session_expired | rate_limited | offline_queued
```

Offline-assisted command flow:
```text
ready
  -> local_outbox_writing
  -> queued_offline
  -> sync_flushing
  -> server_confirmed | conflict | api_error
```

Payment verification flow:
```text
provider_return_detected
  -> payment_return_verifying
  -> payment_confirmed | payment_failed | payment_under_review | api_error
```

Proof upload flow:
```text
proof_selected
  -> local_metadata_saved
  -> uploading_proof
  -> proof_uploaded | upload_deferred | upload_failed
```

## Entry Rules
Enter `loading` when:
- a required read query is in flight and no safe cached content exists
- route guard must resolve role or capability before protected content appears
- the user submits a command
- the app is writing an offline-capable command to the local outbox
- the app is flushing queued commands after reconnect
- the user applies a list filter that invalidates visible rows
- a payment provider return requires verification
- proof media is compressing, storing metadata, or uploading
- admin table data, report rows, audit events, or webhook events are being fetched

Do not enter `loading` when:
- the system already knows the result is empty
- the system has an error requiring retry or support
- the user lacks permission
- the app is offline and no request can be made
- cached data is visible and only a timestamp must be marked stale
- a background poll is silent and does not affect current action safety

## Exit Rules
Exit `loading` immediately when the state is known.

Exit targets:
- `ready`
- `empty`
- `error`
- `offline`
- `stale_data`
- `not_authorized`
- `session_expired`
- `blocked_by_payment`
- `manual_review_required`
- `rate_limited`
- feature-specific success state
- feature-specific validation state

The loading component must not keep showing progress after the source state has changed.

## Global Interaction Rules
The user must never be able to submit the same unsafe command twice while the first command is in progress.

For every primary action in `mutation_submitting`:
- Disable the action that started the mutation.
- Keep the label visible.
- Add action-specific progress text.
- Keep secondary safe navigation available unless leaving would corrupt a local step.
- Preserve form values.
- Preserve scroll position.
- Preserve route context.
- Prevent keyboard activation of the disabled action.
- Prevent tap-through on mobile.
- Prevent repeated scan capture for the same scan target.
- Preserve idempotency key for the pending command.

For safe read refresh:
- Do not disable the whole page.
- Show an inline refresh indicator near the timestamp or list header.
- Keep existing rows visible if cached data is allowed.
- Mark stale or refreshing state clearly.

## Timing Rules
Kra must account for the difference between quick, noticeable, and long waits.

| Duration | Required UI Behavior |
| --- | --- |
| `0-100ms` | Do not create visual noise if the action resolves instantly, but still protect duplicate submit synchronously. |
| `100-300ms` | Show inline button progress or route-level busy state if the user initiated the action. |
| `300ms-1s` | Show skeleton or visible status text for initial reads. |
| `1-3s` | Keep structure stable and show specific progress copy. |
| `3-8s` | Add patience copy and explain what is still happening. |
| `8s+` | If safe, expose cancel, retry-later, or continue-in-background path. |
| Timeout reached | Leave loading and render the correct error, offline, or review state. |

These thresholds are UI behavior rules. They do not change backend service-level targets.

## Visual System
Loading visuals should be quiet and structurally useful.

Approved patterns:
- skeleton blocks shaped like final content
- single thin progress bar for route or table refresh
- button-level progress text for mutations
- upload progress panel for proof media
- small sync banner for offline queue flush
- centered verification panel for payment provider return
- table skeleton rows with stable row height
- mobile card skeletons matching final information hierarchy

Disallowed patterns:
- spinner-only full-page loading
- pulsing every element on the page
- random decorative animation
- full-page blur over readable cached content
- replacing stable cached content with a blank surface during refresh
- changing the page title after every poll
- showing action buttons that appear active while disabled
- using color alone to communicate progress

## Skeleton Rules
Skeletons must communicate structure, not content.

Skeletons must:
- reserve the same width and height as final content where practical
- keep the route title area stable
- preserve global navigation
- preserve safe breadcrumbs
- preserve known IDs when they come from the URL
- preserve known station, delivery, or tracking labels if already safe to show
- use `neutral.100` surface blocks over `surface`
- use low-contrast movement or no movement in reduced motion
- avoid creating rows that look selectable
- avoid showing made-up values

Skeletons must not:
- hide a known route ID that helps orientation
- show numbers that look real
- animate aggressively
- look like editable fields
- imply success, failure, or queue count
- load indefinitely without timeout handling

## Progress Indicator Rules
Use determinate progress only when measurable progress exists.

Determinate progress is allowed for:
- file upload bytes
- proof image compression steps if measured
- export rows assembled locally if total rows are known
- package media upload if total bytes are known

Indeterminate progress is required for:
- backend reads with unknown duration
- payment provider verification with unknown provider latency
- route guard resolution
- search query resolution
- mutation awaiting server response
- local SQLite write where completion fraction is not measured

Do not convert indeterminate work into percentages.

## Copy Rules
Loading copy must be specific, calm, and action-aware.

Use:
- `Loading your deliveries...`
- `Checking payment status...`
- `Saving intake confirmation...`
- `Verifying tracking access...`
- `Refreshing station queue...`
- `Uploading proof photo...`
- `Syncing queued handoff...`
- `Preparing report export...`

Do not use:
- `Please wait`
- `Almost there`
- `Just a moment`
- `Processing`
- `Working on it`
- `Hang tight`
- `This will only take a second`
- any copy that promises a time the system cannot guarantee

Longer-wait copy may say:
```text
This is taking longer than expected. Keep this screen open while we finish checking the latest status.
```

Offline-assisted local write copy may say:
```text
Saving this action on this device before sync.
```

Payment verification copy may say:
```text
Checking the payment result. Do not restart payment from this screen.
```

## Accessibility Rules
Loading must be perceivable without being disruptive.

Global requirements:
- Use `aria-busy="true"` on the region that is actually busy.
- Use one polite status region for important loading changes.
- Do not move focus just because loading started.
- Do not announce every skeleton block.
- Do not announce repeated polling cycles.
- Ensure disabled controls expose disabled state.
- Ensure progress indicators have accessible names.
- Use `role="progressbar"` only for real progress indicators.
- Use `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` only when progress is determinate.
- Do not set a numeric value for indeterminate progress.
- Keep focus visible on any available cancel, retry-later, back, or safe navigation control.
- Respect `prefers-reduced-motion`.
- Maintain text contrast at WCAG AA equivalent.

Recommended live-region messages:
- `Loading delivery details.`
- `Refreshing station queue.`
- `Saving handoff confirmation.`
- `Uploading proof photo, 45 percent complete.`
- `Payment verification is still in progress.`
- `Syncing two queued actions.`

Do not announce:
- each skeleton row
- each table shimmer cycle
- every poll
- background refresh that does not affect visible data or action safety

## Focus Rules
Loading should not steal focus.

Focus remains:
- on the button that initiated a mutation if it remains mounted
- in the current form field for validation-related refresh
- on the route shell if protected content is not yet mounted
- inside the modal when a modal host is submitting

Move focus only when:
- loading exits into an error requiring action
- loading exits into session expired
- loading exits into not authorized
- the route changes by explicit navigation
- the user selects a cancel or retry-later option

## Motion Rules
Motion must be restrained and useful.

Allowed:
- subtle skeleton fade
- thin indeterminate bar for page-level refresh
- button spinner paired with text
- progress bar width change for measured upload
- one entry fade for the final ready content

Not allowed:
- looping large illustrations
- bouncing icons
- attention-grabbing background animation
- flashing progress
- page-scale blur transitions
- any movement that continues when reduced motion is active

Reduced motion behavior:
- Skeletons become static blocks.
- Progress bars can update position without shimmer.
- Content reveal uses instant replacement or very short opacity change.

## Layout Rules
The layout must not jump when loading resolves.

For admin web:
- Keep sidebar, topbar, filters, and page header mounted.
- Keep table headers mounted when list schema is known.
- Keep row height consistent between skeleton and real rows.
- Keep filters disabled only when their backing options are unavailable.
- Keep known route IDs visible.

For mobile:
- Keep app header and bottom navigation stable.
- Keep primary action area in the same location.
- Reserve media upload panel height before progress starts.
- Keep scan result context visible while validation runs.
- Keep one-handed actions reachable.

For public and receiver flows:
- Keep brand header stable.
- Keep tracking code or safe masked context visible when known.
- Avoid operational staff details.
- Avoid internal provider references.

## Surface-Specific Behavior
### Public Web
Use loading for:
- public tracking lookup
- service-area availability lookup
- support entry submit
- contact or waitlist submit if implemented later

Rules:
- Never expose internal IDs beyond public tracking context.
- Keep copy customer-safe.
- Use centered loading panels for single-purpose pages.
- Use section-level skeletons for marketing or service-area content.
- Keep one safe back or support path visible when lookup takes longer than expected.

### Receiver Public Flow
Use loading for:
- secure tracking link validation
- phone challenge request
- OTP verification
- receiver-safe timeline fetch

Rules:
- Never reveal sender, staff, provider, or audit metadata during loading.
- Show masked phone context only if already verified as safe.
- OTP submit button must disable immediately.
- Verification loading must not allow another challenge request until allowed.
- If session expires or link is invalid, leave loading and render the correct state.

### Sender Mobile App
Use loading for:
- sign in
- auth recovery
- home data
- station selection
- quote review
- delivery summary submit
- payment initialization
- provider return verification
- delivery detail
- issue create
- receipt detail
- notifications
- profile save

Rules:
- Sender copy must use package, pickup, and delivery language.
- Do not expose custody jargon.
- Keep form values visible while submitting.
- Disable only the active submit action unless data integrity requires more.
- Payment verification must block transport bypass.
- Quote loading must not show client-calculated price.

### Station Operator Mobile App
Use loading for:
- station overview queue load
- intake scan validation
- receive confirmation
- dispatch queue refresh
- package handoff confirmation
- issue creation
- offline outbox write

Rules:
- Preserve scan target context.
- Show local save progress before offline queue acceptance.
- Disable repeated scan submit for the same package.
- Keep current station visible.
- If cached queue is shown, mark refresh state and age.
- Loading must not imply custody changed before backend or durable local acceptance.

### Driver Mobile App
Use loading for:
- assignment load
- start route
- pickup confirmation
- destination handoff
- issue report
- offline outbox write
- sync flush

Rules:
- Keep route and package count context visible.
- Disable the same handoff action while submitting.
- Show outbox-save copy for offline-assisted commands.
- Preserve proof or scan context during submit.
- Do not remove assignment details during background refresh.

### Final-Mile Courier Mobile App
Use loading for:
- task list load
- arrival state fetch
- OTP verification
- proof capture upload
- delivery completion
- failed attempt submit
- offline outbox write

Rules:
- Completion cannot appear final until required proof metadata exists.
- Upload progress should be determinate when file bytes are known.
- Preserve receiver-safe details.
- Keep failed-attempt reason visible while submitting.
- Do not reset proof capture form on transient upload failure.

### Admin Web Console
Use loading for:
- overview dashboard
- launch readiness
- delivery explorer
- station lists
- user lists
- pricing rules
- finance summary
- payment reconciliation
- issue queues
- audit events
- webhook events
- analytics
- export report assembly
- modal host submission

Rules:
- Admin loading should preserve filters, table headers, and page context.
- Background refresh should not blank tables.
- Sensitive modal host loading must keep the acknowledgement visible.
- Export progress must state whether the client is fetching rows or preparing the file.
- Loading must not hide authorization failures.

## Component Contract
### `SharedLoadingState`
Required props:
```ts
type SharedLoadingStateProps = {
  mode:
    | "initial_route_loading"
    | "auth_resolving"
    | "initial_data_loading"
    | "cached_refreshing"
    | "filter_loading"
    | "pagination_loading"
    | "mutation_submitting"
    | "local_outbox_writing"
    | "sync_flushing"
    | "uploading_proof"
    | "payment_return_verifying"
    | "long_running_report"
    | "modal_host_submitting";
  surface:
    | "public_web"
    | "receiver_public"
    | "sender_mobile"
    | "station_mobile"
    | "driver_mobile"
    | "courier_mobile"
    | "admin_web";
  title: string;
  description?: string;
  targetLabel?: string;
  knownContextLabel?: string;
  progress?: {
    kind: "determinate" | "indeterminate";
    value?: number;
    max?: number;
    unit?: "percent" | "items" | "bytes";
  };
  cachedAt?: string;
  queuedActionCount?: number;
  canCancel?: boolean;
  canContinueInBackground?: boolean;
  onCancel?: () => void;
  onContinueInBackground?: () => void;
  testId?: string;
};
```

Implementation notes:
- `value` is allowed only when `kind` is `determinate`.
- `targetLabel` must be customer-safe on public and receiver surfaces.
- `knownContextLabel` should preserve route orientation.
- The component must not choose the backend state after loading.

### `ScreenSkeleton`
Use for first page reads when no safe cached data exists.

Required behavior:
- Accept `surface`, `layout`, and `density`.
- Render structural blocks matching final layout.
- Preserve the page header when safe.
- Render one accessible status message.
- Disable interactive-looking skeleton controls.

### `TableSkeleton`
Use for admin lists and staff queues.

Required behavior:
- Keep table header if schema is known.
- Render stable row heights.
- Use no row actions while loading.
- Use list-level `aria-busy`.
- Avoid announcing each row.

### `InlineActionProgress`
Use inside buttons and compact command footers.

Required behavior:
- Preserve original action label context.
- Add progress phrase.
- Disable the action.
- Prevent keyboard and pointer reactivation.
- Keep focus stable.

### `BlockingProgressOverlay`
Use only when leaving or interacting would corrupt state.

Allowed for:
- payment return verification
- modal host sensitive submit
- proof metadata save before completion
- auth resolving protected route before content can render

Not allowed for:
- normal background refresh
- admin table refresh
- sender home refresh with cached content
- public service-area content refresh

### `RefreshProgressBar`
Use for non-blocking data refresh.

Required behavior:
- Show near page or list timestamp.
- Do not hide existing content.
- Announce only when user initiated refresh or when current action safety changes.

### `UploadProgressPanel`
Use for proof and media upload.

Required behavior:
- Show file type or proof type.
- Show measured progress when available.
- Show upload state separate from completion state.
- Keep required proof metadata visible.
- Offer retry only after upload fails or is deferred.

## Data And API Integration
Loading state must be driven by real client state.

For RTK Query reads:
- `isLoading` maps to `initial_data_loading` when no safe cached data exists.
- `isFetching` maps to `cached_refreshing` when safe cached data exists.
- Query errors map out of loading into `error`, `offline`, `not_authorized`, `session_expired`, or route-specific state.
- A screen must not render both full-screen loading and a visible error at the same time.

For RTK Query mutations:
- `isLoading` maps to `mutation_submitting`.
- The triggering button must disable immediately.
- Preserve request context and idempotency key.
- On success, leave loading and show the next screen state.
- On validation failure, leave loading and show field or command errors.
- On auth failure, leave loading and show `session_expired` or `not_authorized`.

For offline outbox:
- local durable write maps to `local_outbox_writing`.
- queue flush maps to `sync_flushing`.
- conflict maps out of loading to conflict or blocked state.
- outbox acceptance is not server completion.

For uploads:
- file compression and metadata save are separate internal steps.
- measured upload maps to determinate progress.
- deferred upload maps out of loading into offline or queued state.
- final delivery completion must follow proof requirements from backend policy.

## Copy Matrix
| Context | Title | Description |
| --- | --- | --- |
| Public tracking lookup | `Loading tracking status` | `Checking the latest public delivery status.` |
| Receiver link validation | `Verifying tracking access` | `Checking that this secure link can open the delivery status.` |
| Receiver OTP submit | `Verifying code` | `Checking the code before showing delivery details.` |
| Sender home | `Loading your deliveries` | `Checking active packages and next steps.` |
| Station selection | `Loading stations` | `Checking available origin and destination stations.` |
| Quote review | `Preparing quote` | `Getting the current price and route assumptions.` |
| Delivery submit | `Creating delivery` | `Saving delivery details before payment.` |
| Payment initialize | `Starting payment` | `Opening the selected payment method.` |
| Provider return | `Checking payment status` | `Do not restart payment from this screen.` |
| Station queue | `Refreshing station queue` | `Checking packages assigned to this station.` |
| Intake submit | `Saving intake confirmation` | `Recording that this package was received.` |
| Dispatch submit | `Saving dispatch confirmation` | `Recording that this package is ready to move.` |
| Driver handoff | `Saving handoff confirmation` | `Recording this handoff before the package moves on.` |
| Courier proof upload | `Uploading proof` | `Saving required delivery proof.` |
| Admin overview | `Loading admin overview` | `Checking current delivery, station, finance, and issue signals.` |
| Admin table refresh | `Refreshing results` | `Updating this list with the latest server data.` |
| Admin export | `Preparing export` | `Collecting approved rows for this report.` |

## Privacy Rules
Loading content must follow the same privacy rules as the resolved screen.

Public and receiver loading must not show:
- sender ID
- sender phone
- staff ID
- station operator name unless already public-safe
- provider reference
- internal payment reference
- raw issue description
- audit metadata
- custody chain internals

Sender loading must not show:
- internal station staffing notes
- admin-only audit labels
- provider callback internals

Staff loading must show only role-authorized details.

Admin loading may preserve operational context, but must still respect role and capability checks.

## Security Rules
The loading state must not hide a security decision.

Rules:
- If auth is unresolved, protected content is not mounted.
- If auth resolves to denied, leave loading and render `not_authorized`.
- If session expires, leave loading and render `session_expired`.
- If role scope changes during refresh, stop showing unauthorized cached data.
- Do not render sensitive data behind a blurred loading overlay.
- Do not expose restricted details in skeleton labels.

## Offline And Low-Bandwidth Rules
Kra must work under weak network conditions.

Rules:
- Sender is online-first and may show cached read fallback when available.
- Driver, station, and courier flows are offline-assisted for critical actions.
- Admin web is online-only.
- Cached data must show age when relevant.
- Offline-assisted commands must show local save progress before queue acceptance.
- Queue flush must show action count and oldest age when available.
- Do not force image-heavy loading art on low-bandwidth paths.
- Do not require live maps during loading.

Copy:
```text
Saving this action on this device before sync.
```

Sync copy:
```text
Syncing queued actions. Keep this screen open if you need the latest status.
```

## Performance Rules
Loading UI must make performance visible without hiding performance problems.

Rules:
- Do not use loading to mask slow rendering caused by heavy components.
- Use route-level code splitting where appropriate.
- Render skeletons quickly.
- Avoid mounting full table row actions while list data is unresolved.
- Avoid heavy map, chart, and media components until the screen has required data.
- Use progressive rendering for long admin lists.
- Use pagination or virtualization for high-volume lists.
- Keep first meaningful render within the budgets defined in the platform performance document.

Performance budgets that affect this state:
- sender tracking timeline first meaningful render: `<= 2s`
- station queue first meaningful render with cached data: `<= 1.5s`
- proof capture screen ready: `<= 1.5s`
- offline outbox write acknowledgement: `<= 300ms`
- admin route-to-route navigation: `<= 1.5s`
- delivery search results: `p95 <= 2s`

## Error Boundary Interaction
Loading and rendering failure are separate concerns.

If a component throws while loading:
- leave loading
- render the shared error state or route error boundary
- include retry if safe
- preserve route context
- send client error telemetry

Do not keep showing loading after an error boundary catches a failure.

## Analytics Events
Track loading only where it improves reliability and performance analysis.

Recommended events:
- `loading_state_started`
- `loading_state_resolved`
- `loading_state_timeout`
- `mutation_submit_started`
- `mutation_submit_blocked_duplicate`
- `offline_outbox_write_started`
- `offline_outbox_write_confirmed`
- `sync_flush_started`
- `sync_flush_completed`
- `upload_progress_started`
- `upload_progress_completed`
- `payment_return_verify_started`
- `payment_return_verify_resolved`

Required event fields:
- `surface`
- `mode`
- `routeName`
- `operationName`
- `actorRole`
- `hasCachedData`
- `durationMs`
- `resultState`
- `requestId` when available
- `idempotencyKey` only where policy allows

Do not send:
- OTP values
- proof image data
- full address text
- raw provider payloads
- raw issue description
- sensitive audit payloads

## QA Acceptance Criteria
Claude Code must implement the shared loading system so these criteria pass.

General:
- Every route with async reads has a visible loading state.
- Every mutating action disables duplicate submit synchronously.
- Loading copy is action-specific.
- Spinner-only full-page loading is not used.
- Known route context remains visible when safe.
- Background refresh does not blank cached data.
- Loading exits into the correct resolved state.
- Reduced motion is honored.
- Status is announced without moving focus.

Mobile:
- Tap targets remain stable.
- Primary action location does not jump.
- Offline-assisted command shows local save progress.
- Proof upload progress is shown separately from completion.
- Scan validation blocks repeated submit for the same scan.

Admin web:
- Table header and filters remain stable where schema is known.
- User-applied filters remain visible during refresh.
- Export progress explains current step.
- Sensitive modal host submit preserves acknowledgement context.

Public and receiver:
- Loading copy is privacy-safe.
- Tracking lookup does not reveal restricted details.
- OTP verification disables repeat submit.

## Unit Test Requirements
Tests must cover:
- `SharedLoadingState` renders all modes.
- Indeterminate progress has no numeric value.
- Determinate progress exposes valid value and max.
- `aria-busy` is applied to the correct region.
- Status live region contains the current title.
- Reduced motion removes shimmer.
- Disabled submit cannot fire twice.
- Cached refresh keeps prior content visible.
- Public and receiver surfaces reject restricted context labels.
- Upload mode shows determinate progress only when value exists.
- Local outbox mode shows queue-aware copy.

## Component Test Requirements
Use component tests for:
- sender delivery submit loading
- payment provider return verification loading
- station intake confirmation loading
- driver handoff confirmation loading
- courier proof upload loading
- admin table refresh loading
- admin export loading
- modal host submit loading

Assertions:
- correct title and description
- correct disabled controls
- no duplicate submit
- stable labels
- accessible name on progress indicator
- no focus theft
- correct exit state after success or error

## E2E Test Requirements
Critical journeys:
- Sender creates delivery and cannot submit the summary twice.
- Sender returns from payment provider and sees verification loading before confirmed, failed, or review state.
- Station operator scans package and cannot confirm intake twice.
- Driver confirms handoff under weak connection and sees local save or sync progress.
- Courier captures proof and sees upload progress before completion.
- Admin filters delivery explorer and sees list-level loading without losing filters.
- Admin exports rows and sees export progress before file availability.
- Receiver verifies OTP and cannot submit the code twice.

Network scenarios:
- slow 3G read
- request timeout
- reconnect after offline command queue
- upload interruption
- payment verification delay
- background refresh during user scroll

## Visual QA Checklist
Before closing implementation, inspect:
- desktop 1440 width
- desktop 1024 width
- mobile 390 width
- mobile 360 width
- large text setting
- reduced motion
- dark text on light surface contrast
- admin table row skeleton alignment
- mobile primary action stability
- proof upload panel height
- payment verification panel copy

The loading UI should pass the five-role critique:
- Founder: it communicates reliability under weak networks.
- Skeptical customer: it explains what is happening without overpromising.
- Operator: it keeps the next operational action obvious.
- Accessibility reviewer: it announces status without disrupting focus.
- Creative director: it feels premium through restraint, not decoration.

## Implementation Sequence For Claude Code
Build in this order:
1. Add shared loading state types in `packages/shared` or the agreed shared frontend contract location.
2. Add design tokens for skeleton surfaces and loading motion if missing.
3. Implement `SharedLoadingState`.
4. Implement `ScreenSkeleton`.
5. Implement `TableSkeleton`.
6. Implement `InlineActionProgress`.
7. Implement `RefreshProgressBar`.
8. Implement `UploadProgressPanel`.
9. Implement `BlockingProgressOverlay`.
10. Wire RTK Query read states into route shells.
11. Wire mutation submit state into primary actions.
12. Wire offline outbox write and sync states into operations mobile.
13. Add accessibility tests.
14. Add no-double-submit tests.
15. Add critical journey E2E tests.

Do not start by styling each screen separately. Build the shared state library first, then apply it to screens.

## Route Integration Checklist
Each screen spec that references `loading` must specify:
- the query or mutation that can cause loading
- the mode from this document
- the region that receives `aria-busy`
- the progress copy
- the controls disabled during loading
- the controls still allowed during loading
- whether cached data remains visible
- the timeout or error exit path
- analytics operation name
- test ID suffix

If a screen cannot answer these items, its loading behavior is incomplete.

## Test IDs
Required shared test IDs:
- `state-loading`
- `state-loading-title`
- `state-loading-description`
- `state-loading-progress`
- `state-loading-live-region`
- `state-loading-skeleton`
- `state-loading-table-skeleton`
- `state-loading-inline-action`
- `state-loading-refresh-bar`
- `state-loading-upload-panel`
- `state-loading-blocking-overlay`
- `state-loading-cancel`
- `state-loading-continue-background`

Mode-specific test ID pattern:
```text
state-loading-{mode}
```

Surface-specific test ID pattern:
```text
state-loading-{surface}-{mode}
```

## Failure Modes To Prevent
The implementation must prevent:
- duplicate primary command submit
- duplicate scan submit
- duplicate OTP submit
- duplicate payment initialization from provider return screen
- hidden auth denial behind permanent loading
- cached admin data shown after role scope change
- skeleton rows that look actionable
- false percentage for unknown progress
- progress UI with no accessible label
- loading that never exits after request error
- route blanking during background refresh
- proof completion before required proof metadata exists
- export action running without visible progress
- focus jump on loading start
- repeated screen reader announcements during polling

## Definition Of Done
This shared loading state is complete when:
- all component variants exist
- every async route maps to a defined mode
- every primary mutation blocks duplicate submit
- every loading region has accessible status semantics
- every public and receiver copy path is privacy-safe
- every offline-assisted command has local write progress
- every proof upload path separates metadata, upload, and completion
- every admin list refresh keeps filters stable
- every long-running path exits to retry, continue-in-background, review, or error where appropriate
- tests cover unit, component, and critical E2E paths
- visual QA passes desktop, mobile, reduced motion, and large text checks

