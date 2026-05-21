# Offline Outbox Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Offline outbox |
| Component family | Shared UI infrastructure |
| Primary modules | `offlineOutboxStore`, `outboxQueue`, `outboxWorker`, `outboxRetryPolicy`, `outboxConflictClassifier`, `outboxEvidenceStore`, `outboxTelemetry`, `outboxCacheBridge` |
| Supporting modules | `OutboxProvider`, `OutboxStatusIndicator`, `OutboxSyncController`, `OutboxActionEnvelope`, `OutboxStorageMigrator`, `OutboxRedactor`, `OutboxRecoveryRouter`, `OutboxLock`, `OutboxNetworkGate` |
| Inventory behavior | Persist station, driver, and courier critical actions with idempotency keys |
| Repo targets | `apps/mobile`, optional shared frontend API package |
| Primary surfaces | operations mobile shared screens, station operator mobile app, driver mobile app, final-mile courier mobile app |
| Primary users | station operators, drivers, final-mile couriers, operations support, QA, security reviewers |
| Backend coverage | typed API client, `executeIdempotentOperation`, `Idempotency-Key`, handoff routes, proof asset routes, issue routes, `apiErrorResponseSchema`, delivery lifecycle, package label binding |
| Browser mutation operation | None directly; this infrastructure queues and replays approved operations mobile mutations |
| Data sensitivity | package scan code, proof metadata, local proof file references, delivery ID, tracking code, actor ID, role, station ID, assignment ID, request fingerprint, idempotency key, error code |
| Offline critical | Yes, for approved station, driver, and courier critical actions only |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, role routing, app shells, scan component, proof capture component, custody chain component, test harness |
| Related screen specs | `OpsOfflineOutbox`, `OpsActionRecovery`, station intake/dispatch/receipt screens, driver pickup/transit screens, courier proof/completion screens |
| Related state specs | offline, stale data, scan mismatch, custody not confirmed, proof required, rate limited, error, not authorized, session expired |
| Design tokens | No unique visual tokens; outbox status must feed existing offline, warning, danger, success, and neutral state tokens |
| Accessibility target | Outbox status changes must produce screen-readable state changes without focus theft or false completion messages |

## Purpose
The offline outbox is Kra's durable local queue for approved field operations when the device cannot reliably reach the backend.

It exists because station operators, drivers, and final-mile couriers may complete real physical work in areas with unstable mobile networks. The app must capture the action, preserve evidence, retry safely, and make it impossible to confuse local capture with backend confirmation.

The offline outbox must answer:

- Which operations can be queued?
- Which operation was captured locally?
- Which backend route will replay it?
- Which actor, role, station, delivery, assignment, and proof context created it?
- Which idempotency key must be reused?
- Which sensitive payload is stored and where?
- Which actions are ready, syncing, failed, conflicted, expired, blocked, or resolved?
- Which backend response confirmed the action?
- Which conflict requires user review?
- Which cache tags must refresh after replay?
- Which evidence must remain available for support?

The most important rule is:

```text
Queued work is evidence of local intent, not backend truth. Backend truth begins only after successful replay returns a parsed backend response or an idempotent replay returns the prior successful response.
```

## Product Job
The offline outbox must keep goods from being lost when the network fails.

It must:

- persist approved staff actions locally before the user leaves the screen
- attach exactly one stable idempotency key to each queued action
- preserve a request fingerprint for duplicate and mismatch detection
- store sensitive payloads outside visible list rows
- retry only when auth, role, scope, network, and operation policy allow
- sequence same-delivery actions safely
- classify failed backend responses into retry, conflict, expired, blocked, or resolved
- integrate with RTK Query cache invalidation after confirmed replay
- keep outbox screens and shell indicators up to date
- protect local data from casual leakage
- support proof asset metadata and local media references
- provide metrics for queue depth, oldest age, sync success, and conflict rate
- support tests that prove reconnect does not duplicate mutations

The outbox should make field work resilient without weakening backend authority.

## Strategic Role
Kra's product promise depends on chain-of-custody discipline across African delivery conditions.

Network instability cannot be allowed to create these failures:

- station intake scan is captured locally but disappears
- driver pickup is retried with a different payload under the same key
- courier proof upload is lost after app restart
- queued action replays after the actor no longer has the assignment
- backend conflict is hidden behind a generic error
- staff believes the package moved custody when the server did not confirm it
- same delivery receives actions out of order after reconnect
- failed action is deleted before support can inspect evidence

The offline outbox is therefore a loss-prevention system, not a convenience queue.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing operations mobile infrastructure.

Surface type:

- Non-visual durable queue, sync worker, conflict classifier, storage model, and state provider.

Primary action:

- Capture approved staff actions durably and replay them safely without duplicate package movement.

Visual thesis:

- `Local ledger`: a calm, auditable field ledger that separates local intent, sync progress, backend confirmation, and conflict review.

Restraint rule:

- Do not use outbox status to make local work look complete before backend confirmation.

Density:

- Infrastructure is detailed and strict. Screen-level indicators must stay simple and truthful.

Platform stance:

- Expo React Native uses SQLite for durable local records, secure storage for sensitive payload references where available, typed API client for replay, RTK Query for cache refresh, and backend idempotency for duplicate protection.

## External Research Used
Only directly relevant offline storage, offline-first, cache rehydration, and mobile storage security references were used:

- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/): supports persisted local databases across app restarts, async APIs, transactions, and exclusive transactions for ordered writes.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): supports using local data sources, queue-backed writes, synchronization after connectivity returns, and conflict handling.
- [RTK Query persistence and rehydration](https://redux-toolkit.js.org/rtk-query/usage/persistence-and-rehydration): supports rehydrating API cache state where appropriate, with native apps being a stronger fit than browser sessions.
- [OWASP MASVS Storage](https://mas.owasp.org/MASVS/05-MASVS-STORAGE/): supports secure storage and leakage prevention requirements for sensitive mobile data at rest.
- [OWASP MASVS-STORAGE-1](https://mas.owasp.org/MASVS/controls/MASVS-STORAGE-1/): supports explicit protection of intentionally stored sensitive app data.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/06-architecture/frontend-architecture.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/09-operations/delivery-lifecycle.md`
- `docs/09-operations/handoff-scan-policy.md`
- `docs/09-operations/proof-of-delivery-policy.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/14-platform/observability-and-alerting.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/idempotency.ts`
- `services/api/src/routes.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/proof-assets.ts`

## Non-Goals
The offline outbox must not:

- implement actual frontend screens
- replace backend state
- move custody locally as final truth
- complete proof locally as final truth
- verify payment locally
- approve refunds locally
- update pricing locally
- run admin mutations
- call webhook or internal scheduler routes
- mutate queued payloads silently
- rotate idempotency keys for the same local action
- delete unresolved evidence automatically
- expose raw payloads in UI rows, analytics, logs, notifications, or crash reports
- retry actions out of sequence when they depend on same-delivery prior actions

## Approved Queueable Operations
The outbox may queue only operations that are approved by product policy and backend idempotency behavior.

Approved at launch:

| Operation | Actor | Queue policy | Replay order |
| --- | --- | --- | --- |
| `confirm_intake` | station operator | allowed | per delivery, before dispatch |
| `dispatch_delivery` | station operator | allowed | after intake |
| `confirm_pickup` | driver | allowed | after dispatch readiness |
| `mark_in_transit` | driver | allowed | after pickup |
| `receive_destination` | station operator | allowed | after driver custody |
| `accept_final_mile_assignment` | final-mile courier | allowed | after final-mile assignment |
| `mark_out_for_delivery` | final-mile courier | allowed | after courier custody |
| `create_issue` | staff | allowed | independent unless linked to same delivery sequence |
| `create_delivery_proof_asset` | final-mile courier | allowed for metadata intent when local media exists | before upload confirmation |
| `confirm_delivery_proof_asset_upload` | final-mile courier | allowed after upload transfer succeeds | before completion |
| `complete_delivery` | final-mile courier | allowed only when proof metadata exists | after proof requirement |

Conditionally allowed:

- `record_failed_attempt` only when backend idempotency and business policy confirm safe replay for repeated failed-attempt records.

Never queue:

- `create_delivery`
- `initialize_payment`
- `verify_payment`
- `refund_payment`
- `settle_refund_payment`
- receiver phone challenge
- receiver phone verification
- admin pricing update
- admin user mutations
- admin station status override
- admin station validation
- webhook ingestion
- internal scheduler endpoints

## Local Data Model
Each queued action must be stored as an immutable local action plus mutable sync metadata.

```ts
type OutboxActionStatus =
  | "queued"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict"
  | "expired"
  | "blocked"
  | "superseded"
  | "discarded";

type OutboxAction = {
  localActionId: string;
  operationId: string;
  routeKey: string;
  idempotencyKey: string;
  requestFingerprint: string;
  actorId: string;
  actorRole: "station_operator" | "driver" | "final_mile_courier";
  stationId?: string;
  deliveryId?: string;
  assignmentId?: string;
  trackingCode?: string;
  payloadRef: string;
  payloadSummary: OutboxPayloadSummary;
  dependencyLocalActionIds: string[];
  status: OutboxActionStatus;
  queuedAt: string;
  updatedAt: string;
  firstAttemptAt?: string;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  attemptCount: number;
  lastRequestId?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  lastHttpStatus?: number;
  requiresReview: boolean;
  createdFromRoute: string;
  appVersion: string;
  schemaVersion: number;
};
```

Payload summary must be safe for list display.

Allowed summary fields:

- operation label
- delivery ID
- station ID
- actor role
- queued time
- package condition value when non-sensitive
- proof type
- issue category
- status

Never show in summary:

- raw package scan code
- OTP
- receiver phone
- receiver address
- proof file path
- proof upload URL
- proof hash
- auth token
- idempotency key
- full request payload

## Storage Model
Use two logical stores.

### Queue Store
Purpose:

- durable metadata, status, ordering, retry state, and safe list display.

Implementation target:

- Expo SQLite.

Required tables:

- `outbox_actions`
- `outbox_dependencies`
- `outbox_attempts`
- `outbox_schema`

Required properties:

- actions persist across app restart.
- writes use transactions.
- replay status changes use transactions.
- same action cannot be inserted twice.
- same idempotency key cannot be reused for a different local action under the same actor and route.
- schema migrations are versioned.

### Sensitive Payload Store
Purpose:

- hold full request payload and sensitive local evidence references.

Implementation target:

- encrypted storage where available, or app-private storage with additional encryption layer if required by security review.

Rules:

- queue row stores `payloadRef`, not raw payload.
- payload store stores encrypted payload data or reference envelope.
- proof media files remain separate from JSON payload.
- if payload cannot be decrypted, action becomes `blocked` with `payload_unavailable`.
- payload remains until action is synced and retention policy allows pruning, or until user discards an allowed action.

## Transaction Requirements
Outbox writes must be atomic.

Atomic operations:

- insert local action and payload reference.
- update status from queued to syncing.
- record attempt result and status.
- mark action synced and persist backend request ID.
- mark conflict and persist error classification.
- mark superseded after approved redo flow.
- discard an allowed action with audit reason.

Rules:

- never write payload without action metadata.
- never write action metadata without payload reference when payload is required.
- never mark synced without parsed backend response or idempotent replay success.
- use exclusive transaction behavior for write sequences that must not interleave.
- if transaction fails, surface `storage_error` and do not pretend queue capture succeeded.

## Idempotency Rules
Every queued action must include exactly one stable idempotency key.

Rules:

- key is generated before local action insert.
- key is stored with action metadata.
- key is sent on every replay attempt.
- key never changes for the same local action.
- key is never shown to users.
- key is never sent to analytics.
- key may be copied only into secure support diagnostics with explicit redaction policy.
- request fingerprint must be stable and derived from the original route key, actor key, and payload.
- if payload changes, create a new local action and mark the old one superseded only after recovery decision.

Backend behavior from `executeIdempotentOperation`:

- same route, actor, key, and fingerprint can return existing completed response.
- same route, actor, key, and different fingerprint returns validation error.
- same route, actor, key, and in-progress record returns validation error.

Frontend behavior:

- completed idempotent replay marks local action synced.
- fingerprint mismatch marks local action conflict.
- in-progress response schedules retry or marks blocked based on retry policy.

## Request Fingerprint Rules
Request fingerprint protects against accidental payload rewrite.

Fingerprint input must include:

- operation ID
- route key
- path params
- parsed request body
- actor ID
- actor role
- station ID when present
- delivery ID when present
- proof asset ID when present

Fingerprint input must exclude:

- timestamps that do not affect business intent
- retry attempt count
- network status
- local UI route state
- redacted display summary

Rules:

- fingerprint algorithm must be deterministic.
- object keys must be sorted before hashing.
- undefined values must be omitted.
- fingerprint is stored as hash only.
- full fingerprint source must not be logged.

## Dependency Ordering
Same-delivery actions must replay in safe order.

Rules:

- outbox worker may process independent deliveries concurrently only when storage locks and API limits permit.
- same delivery actions are processed sequentially by queued time and dependency graph.
- action cannot replay if a required prior action is unresolved.
- proof completion cannot replay before proof asset creation and upload confirmation.
- `mark_in_transit` cannot replay before pickup confirmation.
- `receive_destination` cannot replay before driver custody is confirmed.
- `mark_out_for_delivery` cannot replay before final-mile acceptance.
- failed prior action blocks dependent actions and routes them to recovery.

Dependency graph fields:

- `dependencyLocalActionIds`
- `sameDeliverySequence`
- `proofAssetDependencyId`
- `requiresBackendRefreshBeforeReplay`

## Queue State Machine
Allowed state transitions:

| From | To | Trigger |
| --- | --- | --- |
| none | `queued` | local capture succeeds |
| `queued` | `syncing` | worker starts replay |
| `syncing` | `synced` | backend success parsed |
| `syncing` | `failed` | retryable network or server failure |
| `syncing` | `conflict` | backend business conflict |
| `syncing` | `expired` | session or auth cannot refresh |
| `syncing` | `blocked` | policy, payload, route, or role prevents replay |
| `failed` | `queued` | retry window opens |
| `failed` | `syncing` | manual retry starts |
| `conflict` | `superseded` | approved redo flow replaces action |
| `conflict` | `discarded` | discard allowed and confirmed |
| `blocked` | `queued` | missing condition repaired |
| `expired` | `queued` | user signs in and role scope is valid |
| `synced` | pruned | retention policy clears old completed record |

Blocked transitions:

- `queued` to `synced` without backend response.
- `conflict` to `syncing` without user review.
- `discarded` to `syncing`.
- `superseded` to `syncing`.
- `synced` to `queued`.

## Replay Worker
The replay worker owns sync execution.

Worker responsibilities:

- watch network state and auth state.
- acquire a single active worker lock.
- select eligible queued actions.
- enforce dependency order.
- load and decrypt payload.
- parse request through typed API client schema.
- attach original idempotency key.
- call typed API client.
- parse backend response or error.
- classify result.
- update outbox store in one transaction.
- invalidate RTK Query tags after confirmed replay.
- emit safe telemetry.

Worker must not:

- run for admin web.
- replay when auth is missing.
- replay when role is not staff.
- replay when station scope is missing for station actions.
- replay when assignment scope is missing for driver or courier actions.
- replay when metered network policy blocks large proof transfer.
- process the same action in two worker instances.

## Network Gate
Network state must be treated as advisory, not perfect.

Rules:

- worker may start only when network appears online.
- network failure during replay maps to retryable failure.
- reconnect triggers queue scan.
- app foreground triggers queue scan.
- user manual sync triggers queue scan.
- metered connection may block proof media transfer if policy requires smaller batches.
- staff can continue capturing approved local actions while offline.

## Retry Policy
Retry must be conservative.

Retryable:

- network failure
- timeout
- `INTERNAL_ERROR`
- `RATE_LIMITED` after cooldown
- malformed transient response when retry count is below cap
- auth refresh failure after user signs back in

Not automatically retryable:

- `FORBIDDEN`
- `NOT_FOUND`
- `PAYMENT_REQUIRED`
- `INVALID_STATUS_TRANSITION`
- `PHONE_VERIFICATION_REQUIRED`
- `PACKAGE_SCAN_MISMATCH`
- `ROUTE_NOT_ENABLED`
- payload unavailable
- fingerprint mismatch
- same-delivery dependency unresolved

Retry schedule:

- first retry after short delay
- second retry after longer delay
- later retries use capped backoff
- rate-limited retry uses backend cooldown when available
- retry cap routes item to recovery

Manual retry:

- allowed for retryable failed actions when network, auth, role, scope, dependency, and payload are valid.
- blocked for conflicts until recovery decision.

## Conflict Classification
Conflicts must be precise.

Conflict classes:

| Backend or local signal | Outbox class | Recovery path |
| --- | --- | --- |
| `PACKAGE_SCAN_MISMATCH` | scan conflict | redo scan or support |
| `INVALID_STATUS_TRANSITION` | lifecycle conflict | refresh delivery and open recovery |
| idempotency fingerprint mismatch | duplicate intent conflict | recovery review |
| `NOT_FOUND` | missing delivery or record | support or discard if allowed |
| `FORBIDDEN` | role or scope conflict | refresh role or support |
| `PAYMENT_REQUIRED` | payment block | open delivery payment context |
| `PHONE_VERIFICATION_REQUIRED` | proof verification block | open proof or OTP flow |
| `ROUTE_NOT_ENABLED` | feature block | support |
| dependency failed | sequence conflict | resolve prior action first |
| payload unavailable | storage conflict | support or redo if allowed |

Rules:

- conflicts require `OpsActionRecovery`.
- conflicts must preserve local evidence.
- conflicts must not auto-discard.
- conflicts must not mutate cache into success state.

## Proof And Media Handling
Proof is a multi-stage workflow.

Required stages:

1. Capture local proof metadata and local media reference.
2. Queue proof asset intent when network is unavailable or transfer is deferred.
3. Create backend proof asset intent.
4. Upload local media through approved upload path.
5. Confirm proof asset upload.
6. Complete delivery with proof reference.

Rules:

- local media reference is sensitive.
- proof media must remain available until backend confirms upload and completion.
- completion cannot replay before proof upload confirmation.
- failed media upload does not mark delivery completed.
- app restart must preserve proof queue state.
- if media file is missing, action becomes blocked.
- proof file deletion requires retention and support policy.

## Cache Integration
The outbox and RTK Query cache are separate systems.

Outbox may:

- add local pending markers to active screen selectors.
- expose queue count to app shell.
- expose action status by delivery ID.
- invalidate tags after confirmed replay.

Outbox must not:

- write authoritative delivery status into RTK Query cache before backend success.
- patch custody owner optimistically.
- patch payment status.
- patch issue status unless backend success returns the issue.
- hide stale cache risk.

After confirmed replay:

- invalidate tags from `04-rtk-query-cache.md`.
- refresh current delivery detail if visible.
- refresh current queue if visible.
- refresh timeline if lifecycle action affected it.
- refresh public tracking if final-mile state changed.

## Role And Scope Rules
Outbox replay depends on current authenticated role and scope.

Rules:

- station action requires current role `station_operator` and same station scope.
- driver action requires current role `driver` and same actor ID.
- courier action requires current role `final_mile_courier` and same actor ID.
- if role changes, queued actions become blocked until recovery.
- if station scope changes, station queued actions become blocked.
- sign-out pauses worker.
- session expiry marks attempted action expired.
- role routing cannot override backend rejection.

## Retention Policy
Retention balances evidence and privacy.

Queued, syncing, failed, conflict, expired, and blocked actions:

- retain until resolved, superseded, discarded by allowed policy, or support retention process clears them.

Synced actions:

- retain short local history for staff confidence and support reference.
- prune after configured retention window.
- keep redacted sync audit longer only if policy allows.

Discarded actions:

- retain redacted audit row with discard reason.
- remove sensitive payload if policy allows.

Rules:

- custody and proof evidence should not be deleted automatically while unresolved.
- retention windows must be documented in privacy/data retention policy before implementation.
- local storage pressure may trigger warning, not silent deletion of unresolved actions.

## Telemetry
Allowed outbox events:

- `offline_action_queued`
- `offline_action_sync_started`
- `offline_action_sync_succeeded`
- `offline_action_sync_failed`
- `offline_action_conflict`
- `offline_action_retry_scheduled`
- `offline_action_manual_retry`
- `offline_action_superseded`
- `offline_action_discarded`
- `offline_outbox_storage_error`
- `offline_outbox_worker_paused`
- `offline_outbox_worker_resumed`

Required properties:

- `operationId`
- `actorRole`
- `surface`
- `deliveryPresent`
- `stationPresent`
- `status`
- `attemptCountBucket`
- `queueAgeBucket`
- `errorCode` when available
- `recoveryClass` when available
- `networkState`
- `outcome`

Forbidden properties:

- idempotency key
- request fingerprint
- raw payload
- scan code
- OTP
- phone
- address
- local file path
- proof upload URL
- proof hash
- auth token
- receiver verification token

## Security Rules
The outbox must satisfy mobile storage discipline.

Rules:

- store only necessary sensitive data.
- encrypt sensitive payloads where platform support exists.
- never store auth tokens in outbox rows.
- never store receiver verification tokens in outbox rows.
- never write raw payloads to logs.
- never include sensitive values in crash reports.
- protect local proof references from UI display.
- clear role-scoped data on sign-out according to retention policy.
- run storage migration tests before release.
- keep schema version in queue store.

## Accessibility Interface
This infrastructure must provide accessible state data to UI screens.

Each status exposed to UI must include:

- safe heading key
- safe body key
- severity
- primary action key
- retry availability
- current sync status
- oldest queued age
- queued action count
- conflict count
- storage error state

Rules:

- status changes must not steal focus in background.
- foreground sync result may announce concise status.
- conflict state must be clearly distinguishable from failed retry.
- queued state must not sound like completed delivery.
- manual retry buttons must be keyboard and screen-reader accessible.

## Performance Requirements
The outbox must be durable but light.

Rules:

- queue list reads use indexed SQLite queries.
- worker processes bounded batches.
- proof media upload does not block queue metadata reads.
- heavy storage migration runs with visible blocking state.
- shell count query must be fast.
- telemetry batching must not block replay.
- redaction must be deterministic and bounded.
- storage pruning runs only after no critical sync is active.

Required indexes:

- status
- delivery ID
- actor ID
- actor role
- station ID
- queued time
- next retry time
- operation ID

## Store And Provider Contract
The app shell and screens need outbox state without owning worker internals.

Provider exposes:

```ts
type OutboxSummary = {
  queuedCount: number;
  syncingCount: number;
  failedCount: number;
  conflictCount: number;
  blockedCount: number;
  oldestQueuedAt?: string;
  workerState: "idle" | "paused" | "syncing" | "offline" | "blocked";
  lastSyncAt?: string;
};
```

Actions exposed:

- `enqueueAction`
- `syncNow`
- `pauseSync`
- `resumeSync`
- `retryAction`
- `markSuperseded`
- `discardAction`
- `loadActionForRecovery`
- `getDeliveryOutboxStatus`

Rules:

- screens may enqueue only through approved operation adapters.
- screens may not directly write SQLite rows.
- shell may read summary only.
- recovery screen may load one action by ID.
- worker internals remain private.

## Queue Adapter Requirements
Each queueable operation must have an adapter.

Adapter defines:

- operation ID
- route key
- schema parser
- idempotency key requirement
- payload redaction
- payload summary builder
- dependency builder
- replay function
- success classifier
- error classifier
- cache invalidation list
- retention class
- recovery route

No operation can be queued without an adapter.

## Test Requirements
Claude Code must add tests when implementing this infrastructure.

Unit tests:

- insert action stores metadata and payload reference atomically.
- insert failure leaves no half-written action.
- status transitions follow allowed state machine.
- blocked transitions are rejected.
- request fingerprint is stable for equivalent payload objects.
- idempotency key remains unchanged across retries.
- redaction removes sensitive fields.
- dependency graph blocks later same-delivery action.
- retry classifier maps each backend error code correctly.
- conflict classifier maps scan mismatch and lifecycle conflict.
- sign-out pauses worker.
- role mismatch blocks replay.
- station scope mismatch blocks station replay.
- payload unavailable blocks replay.

Storage tests:

- schema migration preserves unresolved actions.
- schema migration rejects incompatible payload version safely.
- queue count query remains indexed.
- payload deletion cannot happen while action unresolved.
- synced action pruning keeps redacted audit row.

Worker tests:

- reconnect triggers eligible action replay.
- worker does not double-process the same action.
- retryable failure schedules retry.
- rate limit uses cooldown.
- conflict routes to recovery.
- idempotent completed response marks synced.
- fingerprint mismatch marks conflict.
- dependency failure blocks dependent actions.

Integration tests:

- station intake queued offline replays once after reconnect.
- driver pickup queued offline replays with original idempotency key.
- destination receipt waits for pickup dependency.
- courier proof flow persists media reference and blocks completion until upload confirmation.
- failed attempt remains conditional until backend policy confirms safe replay.
- outbox replay invalidates delivery, timeline, and queue tags.

End-to-end tests after UI exists:

- station user queues intake offline, reconnects, and sees backend-confirmed success.
- driver user queues pickup offline and cannot see custody as confirmed until replay succeeds.
- courier user captures proof offline and completion waits for upload confirmation.
- conflict opens action recovery with redacted evidence.
- sign-out pauses worker and prevents replay.
- storage error shows safe state and preserves evidence where possible.

## Implementation Sequence
Claude Code should implement in this order when frontend build starts:

1. Define outbox operation adapter interface.
2. Define SQLite schema and migrations.
3. Define sensitive payload store interface.
4. Build atomic enqueue transaction.
5. Build redaction and payload summary builders.
6. Build idempotency key and fingerprint helpers.
7. Build state machine transition guard.
8. Build dependency graph and same-delivery ordering.
9. Build replay worker with single-worker lock.
10. Build retry and conflict classifiers.
11. Integrate typed API client replay.
12. Integrate RTK Query cache invalidation after confirmed replay.
13. Integrate shell summary provider.
14. Integrate action recovery loader.
15. Add telemetry with redaction.
16. Add tests for storage, replay, conflict, dependency, and retention.

## Claude Code Build Instructions
When Claude Code implements this spec:

- do not build actual frontend UI from this file.
- do not queue unapproved operations.
- do not write direct SQLite rows from screens.
- do not store auth tokens in outbox.
- do not show raw package scan codes.
- do not show raw payloads.
- do not change idempotency key on retry.
- do not replay dependent same-delivery actions out of order.
- do not mark delivery status, custody, proof, payment, refund, or issue status complete before backend confirmation.
- do not auto-delete conflicted custody or proof evidence.
- do not ignore storage transaction failures.
- do not run worker after sign-out.
- do not bypass typed API client schemas.
- do not invalidate cache before confirmed replay except for local pending indicators.

## Completion Checklist
This infrastructure item is complete only when:

- approved operation adapters exist.
- queue storage is durable across app restart.
- sensitive payload storage is separated from visible queue metadata.
- enqueue is atomic.
- state transitions are guarded.
- idempotency key remains stable.
- request fingerprint detects payload rewrite.
- same-delivery dependency order is enforced.
- replay worker respects network, auth, role, station, and assignment gates.
- retry and conflict classification covers every current backend error code.
- proof media workflow is staged and durable.
- RTK Query cache invalidates after confirmed replay.
- shell can show outbox summary.
- recovery screen can load one action safely.
- telemetry is redacted.
- CI tests prove no duplicate mutation after reconnect.

## Quality Bar
Pass conditions:

- A staff member can lose network, capture an approved action, restart the app, reconnect, and replay safely.
- The app never tells staff a package moved custody before backend confirmation.
- Every queued action has one stable idempotency key.
- Every replay uses the original payload fingerprint.
- Every conflict keeps evidence and routes to recovery.
- Proof completion waits for required proof upload confirmation.
- Same-delivery actions replay in safe order.
- Sensitive local data is protected and never displayed raw.

Fail conditions:

- queued action can disappear after app restart.
- retry creates a new idempotency key for the same action.
- conflict is retried automatically without review.
- local queue changes authoritative delivery status.
- proof completion can replay without proof media readiness.
- sign-out leaves worker active.
- role or station mismatch still replays.
- cache updates to success before backend response.
- sensitive payload values appear in UI, analytics, logs, or crash reports.

## Spec Closure Review
This file is closed when it gives Claude Code a complete implementation contract for durable offline actions without weakening backend authority.

Review questions:

- Can every approved field action be stored durably?
- Can every action replay exactly once from the user's perspective under backend idempotency?
- Can the app survive reconnect storms without duplicate package movement?
- Can same-delivery actions stay in order?
- Can proof media survive app restart until upload completes?
- Can conflicts route to recovery without losing evidence?
- Can shell and screens show outbox status without reading raw payloads?
- Can CI prove storage, retry, conflict, and replay behavior?

If any answer is no, the offline outbox is not ready for field operations.
