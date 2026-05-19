# Ops Offline Outbox Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `OpsOfflineOutbox` |
| App | `apps/mobile` |
| Route | `/(ops)/offline-outbox` |
| Primary test ID | `screen-ops-offline-outbox` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Operations Critical` |
| Backend dependency | local SQLite queue, `Idempotency-Key` header, `executeIdempotentOperation`, `apiErrorResponseSchema`, `apiErrorCodeSchema`, operation-specific response schemas |
| Related routes | `/(ops)/offline-outbox/:queuedActionId/recover`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/support`, role-specific station/driver/courier workflow routes |
| Required states | `loading_queue`, `empty`, `queued`, `syncing`, `partially_synced`, `synced_recently`, `failed`, `conflict`, `expired`, `blocked`, `offline`, `metered_connection`, `session_expired`, `not_authorized`, `storage_error`, `api_error` |

## Product Job
This screen shows staff every offline or delayed operational action that has not yet been confirmed by the backend. It prevents the most dangerous offline failure: staff believing custody, proof, issue, or station workflow state changed when the action is only local.

The screen answers one operational question: `Which staff actions are still local, which are syncing, and which need review before they can safely affect the delivery record?`

The staff member should be able to:
- See the count of queued, syncing, failed, conflicted, and recently synced actions.
- Understand that queued actions are not backend-confirmed.
- Retry safe actions when online.
- Pause or resume syncing.
- Open failed action recovery.
- Open the delivery detail or custody chain for context.
- Open support when a queued action cannot be safely repaired.
- Remove only actions that are safe to discard and not already syncing.
- Preserve evidence and idempotency data for conflict review.
- Recover from storage errors, expired session, permission changes, and backend conflicts.

This screen is not:
- A delivery success screen.
- A custody transfer screen.
- A scan screen.
- A proof capture screen.
- A queue editor for backend records.
- A place to alter payload details.
- A place to make stale local state look confirmed.
- A place to bypass backend authorization, station scope, assignment, payment, or proof rules.

## Audience
Primary audience:
- Station operators who queued intake, dispatch readiness, or destination receipt while offline.
- Drivers who queued pickup, transit, or destination handoff work.
- Final-mile couriers who queued acceptance, proof, failed attempt, or completion work.
- Field staff on unreliable mobile networks.

Secondary audience:
- Claude Code implementing the local queue surface.
- QA validating offline replay behavior.
- Operations leads checking loss-prevention safeguards.
- Security reviewers checking local storage and sensitive payload handling.
- Accessibility reviewers checking status and recovery flows.

## User State
The user may be anxious because the physical work is done but the app has not confirmed it. The UI must be calm and exact: local action, backend confirmation, conflict, and failure are different states.

The user may be:
- Reconnecting after a long offline shift.
- Checking whether a package scan actually reached the backend.
- Seeing a failed replay after backend state changed.
- Trying to prove that a package handoff was captured locally.
- Clearing old successful outbox entries.
- Returning from a role home alert that says actions are waiting.
- Working under metered data and weak connectivity.

The screen must:
- Use local queue as the primary data source.
- Treat backend as the source of truth for completion.
- Use one stable idempotency key per queued mutation.
- Preserve local action IDs and payload fingerprints.
- Never change delivery/custody UI to confirmed until backend success is parsed.
- Route conflicts to `OpsActionRecovery`.
- Keep sensitive payload details masked.
- Make failed and conflicted actions impossible to confuse with synced actions.

## Queue Data Contract
Each queued action must include at minimum:
- `localActionId`
- `routeKey`
- `operationId`
- `idempotencyKey`
- `requestFingerprint`
- `actorId`
- `actorRole`
- `deliveryId` or assignment ID
- `trackingCode` when known
- `queuedAt`
- `lastAttemptAt`
- `attemptCount`
- `status`
- `payloadSummary`
- `sensitivePayloadRef`
- `lastErrorCode`
- `lastErrorMessage`
- `nextRetryAt`
- `requiresReview`
- `createdFromRoute`

Allowed local statuses:
- `queued`
- `syncing`
- `synced`
- `failed`
- `conflict`
- `expired`
- `blocked`
- `discarded`

Payload storage rules:
- Store sensitive request body in encrypted local storage where platform support exists.
- Store only a redacted `payloadSummary` for list display.
- Never show raw package scan code, proof reference, receiver phone, receiver address, supervisor PIN, or raw metadata in a row.
- Keep local payload until server confirms success or a user explicitly discards a safe action.

Idempotency rules:
- Every queued action gets exactly one stable `idempotencyKey`.
- Retry must reuse the same `idempotencyKey`.
- Retry must reuse the same `requestFingerprint`.
- If payload changes, create a recovery decision rather than reusing the old key.
- If backend says key was already used with a different payload, mark conflict.
- If backend returns an existing successful result for the same key, mark synced.

## Queueable Operation Policy
Queue only operations that product and backend policy allow to replay safely.

Allowed queue candidates:
- `confirm_intake`
- `dispatch_delivery`
- `confirm_pickup`
- `mark_in_transit`
- `receive_destination`
- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `create_issue`
- `create_delivery_proof_asset` metadata intent when local media handling is ready
- `confirm_delivery_proof_asset_upload` after upload succeeds
- `complete_delivery` only when proof metadata exists and server replay is safe

Conditionally queue:
- `record_failed_attempt` only after backend replay/idempotency policy is explicitly supported for repeated failed-attempt records.
- Admin and finance mutations are not part of this ops mobile outbox.

Never queue:
- Payment initialization.
- Payment verification.
- Refund approval.
- Refund settlement.
- Auth challenge requests.
- Public receiver verification.
- Admin override actions.
- Any operation without a stable idempotency key and recovery path.

Mutation authority:
- The outbox may replay a queued operation.
- The outbox may not invent a new operation.
- The outbox may not modify request payload silently.
- The outbox may not mark delivery status, custody, proof, or issue state as complete before backend success.

## Primary Action
Primary action by state:
- `empty`: return to role home.
- `queued`: sync now.
- `syncing`: view progress.
- `partially_synced`: review remaining items.
- `synced_recently`: back to work.
- `failed`: open recovery.
- `conflict`: open recovery.
- `expired`: sign in or open recovery.
- `blocked`: open recovery or support.
- `offline`: wait for network or keep working.
- `metered_connection`: sync selected or wait for Wi-Fi if policy requires it.
- `storage_error`: open support.

Secondary actions:
- `Refresh queue`
- `Pause sync`
- `Resume sync`
- `Open delivery`
- `Open custody chain`
- `Open support`
- `Discard safe item`
- `Back to role home`

Blocked behavior:
- Do not auto-discard failed or conflicted actions.
- Do not retry while session is expired.
- Do not retry while the device is offline.
- Do not retry if role or assignment changed and local auth cannot prove authority.
- Do not retry a mutation with a changed payload under the same idempotency key.
- Do not show queued custody/proof as confirmed.
- Do not expose sensitive payloads in list rows.
- Do not let users bulk-delete unresolved custody or proof evidence.

## First Meaningful Value
First meaningful value is reached when staff sees:
- Total queued action count.
- Oldest queued action age.
- Sync readiness.
- Items grouped by status.
- Clear warning that queued actions are not backend-confirmed.
- Direct recovery route for failed/conflicted actions.

The first viewport must answer:
- `How many actions are waiting?`
- `Are any actions failing or conflicting?`
- `Is anything actively syncing?`
- `Which action is oldest?`
- `Can I safely continue my work?`

## Main Tension
Offline work keeps operations moving, but it can create false confidence if the UI blurs local capture with server truth. The outbox must make local work visible without pretending it has changed backend custody or proof state.

The design must balance:
- Operational urgency against backend truth.
- Bulk sync speed against conflict review.
- Local evidence preservation against privacy.
- Retry automation against duplicate mutation risk.
- Simple row scanning against rich recovery detail.
- Weak connectivity against staff confidence.

## Design Brief
User and job:
- Field staff needs to see, sync, and repair queued operational actions.

Context of use:
- Mobile, reconnecting after offline work, package custody at risk, low bandwidth, one-handed field use.

Entry point:
- Ops role home offline card.
- Delivery detail offline banner.
- Scan success queued state.
- Proof capture queued state.
- Failed replay notification.
- Manual navigation.

Success state:
- All safe actions sync successfully, or unresolved actions route to recovery without data loss.

Primary action:
- Sync safe queued actions or repair failed actions.

Navigation model:
- Status dashboard plus actionable list, grouped by `Needs review`, `Ready to sync`, `Syncing`, and `Recently synced`.

Density:
- Medium. The outbox must show enough evidence context without exposing sensitive data.

Visual thesis:
- A field operations sync ledger: plain, trust-building, status-rich, and impossible to confuse with completed work.

Restraint rule:
- Avoid celebratory success styling for queued work, raw payload dumps, bulk destructive actions, and decorative network graphics.

Product lens:
- Reliability, accountability, and duplicate-prevention.

System stance:
- Local-first queue inspector with backend-confirmation discipline.

Interaction thesis:
- Show local actions, replay safely, isolate conflicts, preserve evidence.

Signature move:
- A top `Backend confirmation` banner that clearly separates local queue state from server-confirmed state.

Activation event:
- User syncs, opens recovery, opens delivery, opens custody chain, opens support, or safely clears synced history.

## Elite Quality Gate
This spec is not closed unless `OpsOfflineOutbox` prevents false confirmation and preserves recovery evidence.

Non-negotiable quality requirements:
- First viewport shows queued count, failed/conflict count, oldest age, and sync readiness.
- Queued custody/proof actions say `Not confirmed yet`.
- Retry reuses the original `idempotencyKey`.
- Retry uses the original `requestFingerprint`.
- Failed/conflicted actions route to `OpsActionRecovery`.
- Sensitive payload details are redacted.
- Bulk destructive actions are not available for unresolved custody/proof items.
- Synced entries are clearly separate from queued and failed entries.
- Offline, metered, expired-session, and storage-error states are covered.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If queued work can look completed, the screen remains open.
- If retry can rotate idempotency keys, the screen remains open.
- If failed evidence can be discarded accidentally, the screen remains open.
- If sensitive payload appears in normal rows, the screen remains open.
- If conflicts are retried without review, the screen remains open.

## Research And Inspiration Notes
Use these sources for quality direction, not visual copying:
- [web.dev Offline Cookbook](https://web.dev/articles/offline-cookbook): offline UX needs explicit cache, network, and replay behavior rather than hidden magic.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): local source-of-truth and queued writes need clear synchronization and conflict handling.
- [Material Design lists](https://m1.material.io/components/lists.html): queue rows should be vertically scannable and grouped by task state.
- [Material Design accessibility](https://m1.material.io/usability/accessibility.html): status, controls, and list hierarchy must remain clear to assistive technology.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): sync progress, success, failure, and conflict changes must be announced without stealing focus.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): retry, recovery, and disclosure actions need reliable touch targets.

Applied decisions:
- Treat outbox as a ledger, not a notification list.
- Group by risk status before chronology.
- Keep server-confirmed state visually distinct from queued state.
- Make recovery the dominant action for failed/conflicted work.
- Avoid showing sensitive payload values.

## Data Contract And Backend Alignment
Local store:
- Storage: local SQLite queue.
- Owner: ops mobile app.
- Persistence: durable across app restarts.
- Security: encrypted storage for sensitive payloads where platform support exists.

Backend replay:
- Mutating POST requests use `Idempotency-Key` header.
- Backend `executeIdempotentOperation` scopes idempotency by `routeKey`, `actorKey`, and `idempotencyKey`.
- Backend compares `requestFingerprint` through stable hash.
- Completed idempotent requests can replay the previous successful response.
- In-progress duplicate requests should be treated as retry pending.
- Mismatched payload under same idempotency key returns `VALIDATION_ERROR`.

Shared error schema:
- `apiErrorResponseSchema` provides `requestId`, `code`, `message`, and optional details.
- `apiErrorCodeSchema` currently includes `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `ROUTE_NOT_ENABLED`, `PAYMENT_REQUIRED`, `INVALID_STATUS_TRANSITION`, `PHONE_VERIFICATION_REQUIRED`, `PACKAGE_SCAN_MISMATCH`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

Outbox must parse operation-specific success schemas:
- `deliveryLifecycleResponseSchema` for handoff/lifecycle actions.
- `supportIssueResponseSchema` or issue response schema for issue creation when implemented.
- Proof asset response schemas for proof upload actions.
- Other schemas only when explicitly approved for offline replay.

## Information Architecture
The screen uses five stacked regions.

Region 1: Sync summary
- Total queued count.
- Needs review count.
- Syncing count.
- Recently synced count.
- Oldest queued age.
- Network state.

Region 2: Confirmation warning
- Copy: `Queued actions are saved on this device. They are not backend-confirmed until sync succeeds.`
- Visible whenever queued, failed, conflict, or syncing items exist.

Region 3: Action controls
- Sync now.
- Pause sync.
- Resume sync.
- Refresh queue.
- Support.

Region 4: Grouped action list
- Needs review.
- Ready to sync.
- Syncing.
- Recently synced.
- Discarded history if retained.

Region 5: Empty or system state
- Empty queue.
- Offline.
- Storage error.
- Session expired.
- Not authorized.

## Row Content Specification
Each row must show:
- Operation label.
- Delivery tracking code when known.
- Local status.
- Queued time.
- Last attempt time when present.
- Attempt count.
- Idempotency state.
- Backend result state if available.
- Safe payload summary.
- Primary row action.

Operation labels:
- `Station intake`
- `Dispatch readiness`
- `Driver pickup`
- `Mark in transit`
- `Destination receipt`
- `Courier acceptance`
- `Out for delivery`
- `Proof upload`
- `Complete delivery`
- `Failed attempt`
- `Issue report`

Status labels:
- `Queued`
- `Syncing`
- `Needs review`
- `Failed`
- `Conflict`
- `Expired`
- `Blocked`
- `Synced`
- `Discarded`

Payload summary examples:
- Station and delivery identity.
- Operation type.
- Condition value when safe.
- Proof type when safe.
- Issue category/severity when safe.

Never show:
- Package scan code.
- Receiver phone.
- Receiver address.
- Supervisor PIN.
- Raw proof reference.
- Raw local file path.
- Raw request body.
- Raw idempotency key in normal row copy.

## State Matrix
`loading_queue`:
- Show skeleton summary and rows.
- Do not show empty state until local store read completes.

`empty`:
- Show `No offline actions`.
- Explain that completed backend work will appear in delivery timeline, not here.
- Primary action: back to role home.

`queued`:
- Show ready-to-sync group.
- Primary action: sync now.
- Show warning that backend is not confirmed.

`syncing`:
- Show active progress row.
- Disable duplicate retry.
- Keep item visible until backend response resolves.

`partially_synced`:
- Show synced and remaining groups.
- Keep needs-review group above successful group.

`synced_recently`:
- Show success history separately.
- Allow safe clearing of synced history.
- Do not clear unresolved items.

`failed`:
- Show failed group.
- Primary action: open recovery.
- Preserve payload and idempotency data.

`conflict`:
- Show conflict group above queued group.
- Primary action: open recovery.
- Do not auto-retry.

`expired`:
- Show session or auth-expired state.
- Prompt sign-in.
- Preserve queue.

`blocked`:
- Show policy block.
- Route to recovery or support.

`offline`:
- Show offline banner.
- Disable sync now.
- Keep list visible.

`metered_connection`:
- Show data warning if large proof upload is queued.
- Allow user or policy to delay heavy sync.

`session_expired`:
- Hide sensitive payload summaries if session policy requires it.
- Prompt sign-in.
- Preserve local queue.

`not_authorized`:
- Show role/access change message.
- Route items to recovery.

`storage_error`:
- Show local storage issue.
- Stop sync.
- Open support.

`api_error`:
- Show retry if safe.
- If repeated, route to recovery.

## Replay Rules
Sync candidate:
- Device is online.
- Session is valid.
- Actor role still has permission.
- Local payload is complete.
- Idempotency key exists.
- Request fingerprint exists.
- Operation is in queueable allowlist.
- Item is not already syncing.
- Item is not conflict/expired unless recovery approves retry.

Replay sequence:
- Mark row `syncing`.
- Send original request body.
- Send original `Idempotency-Key`.
- Parse operation-specific success response.
- Invalidate relevant delivery/timeline/queue caches.
- Mark row `synced`.
- Keep synced row visible briefly.

Failure sequence:
- Parse `apiErrorResponseSchema`.
- Increment `attemptCount`.
- Store `lastAttemptAt`.
- Store `lastErrorCode`.
- Set `nextRetryAt` when rate limited.
- Mark row `failed`, `conflict`, `expired`, or `blocked` based on error.
- Route to recovery when user opens row.

Auto-retry:
- Allowed only for transient network/API failures.
- Never auto-retry conflict, authorization, status transition, payment, scan mismatch, or validation fingerprint errors.
- Use backoff.
- Stop after configured attempt cap and require review.

## Error Mapping
`VALIDATION_ERROR`:
- If idempotency payload mismatch: state `conflict`.
- Otherwise state `failed`.
- Action: open recovery.

`FORBIDDEN`:
- State: `not_authorized` or row `blocked`.
- Action: sign in, refresh role, or support.

`NOT_FOUND`:
- State: row `conflict`.
- Action: open recovery and delivery context if available.

`ROUTE_NOT_ENABLED`:
- State: row `blocked`.
- Action: support.

`PAYMENT_REQUIRED`:
- State: row `blocked`.
- Action: open delivery detail or support.

`INVALID_STATUS_TRANSITION`:
- State: row `conflict`.
- Action: open recovery.

`PHONE_VERIFICATION_REQUIRED`:
- State: row `blocked`.
- Action: open proof/verification flow if authorized.

`PACKAGE_SCAN_MISMATCH`:
- State: row `conflict`.
- Action: open recovery, custody chain, or issue route.

`RATE_LIMITED`:
- State: row `failed` with delayed retry.
- Action: wait or support.

`INTERNAL_ERROR`:
- State: row `failed`.
- Action: retry later or support.

Network timeout:
- State: keep queued or failed depending on retry policy.
- Action: retry with same idempotency key.

## Recovery Routing
Open `OpsActionRecovery` when:
- Status is `failed`.
- Status is `conflict`.
- Status is `expired`.
- Status is `blocked`.
- User needs to discard unresolved evidence.
- Payload repair is required.
- Backend state changed.

Pass to recovery route:
- `queuedActionId`.
- Redacted context.
- Last error code.
- Delivery ID.
- Route key.
- Operation ID.
- Attempt count.

Do not pass:
- Raw payload in navigation params.
- Raw scan code.
- Supervisor PIN.
- Raw proof reference.
- Raw local media path.

## Privacy And Security
Security rules:
- Queue must be tied to authenticated user and device.
- Sensitive payload must be encrypted where platform support exists.
- Queue must clear or lock on sign-out according to security policy.
- Raw request bodies are not rendered.
- Local media references are not rendered.
- Analytics excludes sensitive payload.
- Recovery route retrieves sensitive payload from secure local store only after authorization.

Loss prevention:
- Queued custody action does not transfer custody until backend success.
- Queued proof action does not complete delivery until backend success.
- Queued issue action does not create an issue until backend success.
- Queued station receipt does not update station custody until backend success.
- Local record is preserved after conflict.

Discard rules:
- Synced history can be cleared.
- Discarded unresolved action requires confirmation.
- Custody/proof unresolved actions require recovery review before discard.
- Discard action must record a local audit entry.
- Discard must never call backend delete.

## Offline And Freshness
Offline rules:
- Screen is useful offline.
- Queue list loads from local SQLite.
- Sync controls are disabled offline.
- Offline banner is persistent.
- User can open recovery context offline if local data is enough.
- User can continue role workflows that support queueing.

Freshness:
- Show last successful sync time.
- Show oldest queued age.
- Show last attempt time per item.
- Show stale auth warning when session age is unknown.

Reconnect:
- Optionally auto-start safe sync after network returns.
- Do not auto-start sync when conflicts exist.
- Do not auto-start large media upload on metered connection unless policy allows.
- Do not replay more than configured concurrency limit.

## Accessibility Requirements
Screen reader:
- Announce summary counts when the screen loads.
- Announce sync start, item success, item failure, and conflicts as status messages.
- Each row announces operation, delivery, status, queued time, attempts, and primary action.
- Sensitive hidden fields are not included in accessible labels.

Focus:
- Initial focus lands on title.
- After sync now, focus stays on summary unless a blocking error appears.
- Failed sync moves focus to summary warning.
- Opening recovery preserves return focus.

Touch:
- Row actions meet target-size requirements.
- Retry and recovery are not tiny icon-only controls.
- Destructive discard requires a full confirmation control.

Visual:
- Queued, syncing, failed, conflict, expired, and synced states are visually distinct.
- Do not rely on color alone.
- Long lists remain readable with large text.
- Summary count layout survives narrow screens.

Motion:
- Respect reduced motion.
- Progress indicators must not be constant attention traps.
- Use clear text updates over ornamental motion.

Localization:
- Use localized time and duration formatting.
- Avoid idioms.
- Keep status labels short.
- Do not concatenate translated fragments in row titles if grammar can break.

## Analytics And Observability
Required analytics events:
- `ops_offline_outbox_viewed`
- `offline_action_queued`
- `offline_action_replay_started`
- `offline_action_replayed`
- `offline_action_replay_failed`
- `offline_action_conflict`
- `offline_action_recovery_opened`
- `offline_action_discard_requested`
- `offline_action_discarded`
- `offline_outbox_sync_paused`
- `offline_outbox_sync_resumed`
- `offline_outbox_storage_error`

Allowed analytics fields:
- `localActionId`
- `routeKey`
- `operationId`
- `actorRole`
- `deliveryId`
- `status`
- `attemptCount`
- `errorCode`
- `queuedAgeBucket`
- `networkState`
- `isMeteredConnection`

Do not send:
- Raw request payload.
- Package scan code.
- Receiver phone.
- Receiver address.
- Supervisor PIN.
- Proof reference.
- Local media path.
- Idempotency key.
- Request fingerprint.

Operational metrics:
- Queued action count.
- Oldest queued action age.
- Sync success rate.
- Conflict rate after reconnect.
- Retry count distribution.
- Storage error rate.
- Time from queued to backend confirmed.

## Performance Requirements
Budget:
- Queue summary renders within 500 milliseconds after local store access.
- Long lists remain responsive.
- Sync status updates within 100 milliseconds of state change.

Storage:
- Read summary counts before full row detail if the queue is large.
- Index local queue by status, queuedAt, actorId, and deliveryId.
- Avoid decrypting sensitive payload until user opens recovery or sync starts.

Sync:
- Use limited concurrency.
- Do not replay two actions for the same delivery concurrently unless operation ordering is proven safe.
- Preserve order for actions on the same delivery.
- Retry with backoff.
- Avoid duplicate in-flight request for the same `localActionId`.

Failure isolation:
- One failed item must not block safe items on other deliveries.
- One delivery conflict must pause later actions for the same delivery until recovery.
- Storage error stops sync and routes support.

## Test IDs
Primary:
- `screen-ops-offline-outbox`

Summary:
- `ops-offline-outbox-title`
- `ops-offline-outbox-total-count`
- `ops-offline-outbox-needs-review-count`
- `ops-offline-outbox-syncing-count`
- `ops-offline-outbox-oldest-age`
- `ops-offline-outbox-network-state`
- `ops-offline-outbox-confirmation-warning`

Actions:
- `ops-offline-outbox-sync-now`
- `ops-offline-outbox-pause-sync`
- `ops-offline-outbox-resume-sync`
- `ops-offline-outbox-refresh`
- `ops-offline-outbox-open-support`
- `ops-offline-outbox-back-to-role-home`

Groups:
- `ops-offline-outbox-group-needs-review`
- `ops-offline-outbox-group-ready`
- `ops-offline-outbox-group-syncing`
- `ops-offline-outbox-group-synced`

Rows:
- `ops-offline-outbox-row`
- `offline-action-{route-key}-{local-id}`
- `ops-offline-outbox-row-operation`
- `ops-offline-outbox-row-delivery`
- `ops-offline-outbox-row-status`
- `ops-offline-outbox-row-attempts`
- `ops-offline-outbox-row-primary-action`
- `ops-offline-outbox-row-open-delivery`
- `ops-offline-outbox-row-open-recovery`
- `ops-offline-outbox-row-discard`

States:
- `ops-offline-outbox-loading`
- `ops-offline-outbox-empty`
- `ops-offline-outbox-offline`
- `ops-offline-outbox-metered`
- `ops-offline-outbox-session-expired`
- `ops-offline-outbox-not-authorized`
- `ops-offline-outbox-storage-error`
- `ops-offline-outbox-api-error`

## API Integration Notes
Outbox read flow:
- Load authenticated user.
- Open local SQLite queue.
- Query summary counts.
- Query grouped rows.
- Mask sensitive payload summary.
- Subscribe to queue updates while screen is active.

Replay flow:
- Select safe sync candidates.
- Validate session.
- Validate network.
- Validate operation allowlist.
- Validate idempotency data.
- Replay in safe order.
- Parse success response.
- Mark synced.
- Invalidate affected app caches.

Conflict flow:
- Parse backend error.
- Classify row.
- Preserve local payload.
- Route to `OpsActionRecovery`.

Sync ordering:
- Preserve order for same `deliveryId`.
- Allow parallel sync for unrelated deliveries only if operation type is safe.
- Proof upload and completion ordering must preserve media/proof dependencies.
- Scan or custody actions for one delivery must not be replayed out of sequence.

## QA Acceptance Criteria
Functional:
- Empty queue renders empty state.
- Queued items show not-confirmed warning.
- Sync now is disabled offline.
- Sync now reuses existing idempotency key.
- Sync now preserves request fingerprint.
- Successful replay marks item synced only after parsing backend response.
- Failed replay preserves item and routes recovery.
- Conflict replay does not auto-retry.
- Session expiry preserves queue.
- Storage error stops sync and opens support path.
- Synced history can be cleared.
- Unresolved custody/proof items cannot be discarded without recovery confirmation.

Backend alignment:
- Mutating POSTs use `Idempotency-Key`.
- `executeIdempotentOperation` behavior is respected.
- `VALIDATION_ERROR` from idempotency mismatch maps to conflict.
- Operation-specific response schemas are parsed before marking synced.
- Same-delivery operation ordering is preserved.

Security:
- Raw payload does not render.
- Package scan code does not render.
- Proof reference does not render.
- Supervisor PIN does not persist as visible data.
- Queue locks or clears on sign-out according to policy.

Accessibility:
- Summary counts are announced.
- Row status is announced.
- Sync progress is announced.
- Failure/conflict states do not rely on color.
- Discard confirmation is keyboard and screen-reader accessible.

Resilience:
- Reconnect storm does not duplicate mutations.
- Rate limit applies delayed retry.
- Network timeout does not rotate idempotency key.
- App restart preserves queued actions.
- Conflicted item blocks later same-delivery actions until recovery.

## Visual Quality Checklist
Before handoff, confirm:
- The top warning makes backend-confirmation status unmistakable.
- Failed and conflicted actions visually outrank ready-to-sync actions.
- Synced items cannot be confused with queued items.
- The list is usable under poor network stress.
- The screen feels like an operations ledger, not a generic notification center.
- Recovery actions are clear and calm.
- No sensitive payload data appears in normal UI.
- Large text and small phones remain usable.

## Implementation Guardrails For Claude Code
Build this as a local queue management screen only when frontend work begins.

Implementation rules:
- Keep queue storage access in a dedicated outbox service.
- Keep replay classifier in a pure function with unit tests.
- Keep sync ordering logic testable.
- Keep idempotency key generation outside render.
- Keep sensitive payload encryption and redaction centralized.
- Keep operation allowlist explicit.
- Keep route actions as navigation or replay only.
- Never call a new mutation with a new idempotency key for an existing queued action.

Suggested file ownership:
- Screen route owns summary, grouping, and navigation.
- Outbox service owns SQLite reads/writes.
- Sync worker owns replay and backoff.
- Classifier owns error-to-status mapping.
- Row component owns display only.
- Recovery route owns repair/discard decisions.

Required implementation tests:
- Queue row renders redacted payload summary.
- Queued custody action says not confirmed.
- Retry reuses idempotency key.
- Retry with mismatched fingerprint maps to conflict.
- Same-delivery actions replay in order.
- Offline disables sync.
- Rate limit sets next retry time.
- Failed action opens recovery route.
- Conflict action opens recovery route.
- Synced action clears safely.
- Unresolved custody/proof action cannot be bulk discarded.
- Analytics excludes payload and idempotency key.

## Open Decisions
No product-blocking decisions remain for this screen.

Implementation may choose:
- Exact SQLite abstraction.
- Exact encryption adapter.
- Exact retry backoff values.
- Exact synced-history retention window.
- Exact metered-connection policy.

Future backend/platform improvement:
- Add a shared typed client operation registry that marks which operation IDs are safe for offline replay, required response schema, cache invalidations, and same-delivery ordering constraints.

## Final Handoff Notes
`OpsOfflineOutbox` is an accountability screen. It must protect staff and packages by showing what is saved locally, what is syncing, what failed, and what is actually backend-confirmed.

The safest implementation treats the idempotency key as the replay contract and the backend response as the only source of completion truth.
