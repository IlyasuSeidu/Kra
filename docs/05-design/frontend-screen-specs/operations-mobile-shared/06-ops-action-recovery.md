# Ops Action Recovery Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID          | `OpsActionRecovery`                                                                                                                                                                                                                   |
| App                | `apps/mobile`                                                                                                                                                                                                                         |
| Route              | `/(ops)/offline-outbox/:queuedActionId/recover`                                                                                                                                                                                       |
| Primary test ID    | `screen-ops-action-recovery`                                                                                                                                                                                                          |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                         |
| Build priority     | `P0 Operations Critical`                                                                                                                                                                                                              |
| Backend dependency | local SQLite queue, local secure payload store, backend retry through original route, `Idempotency-Key` header, `executeIdempotentOperation`, `apiErrorResponseSchema`, operation-specific response schemas                           |
| Related routes     | `/(ops)/offline-outbox`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/scan`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/support`, role-specific workflow routes  |
| Required states    | `loading_action`, `conflict`, `failed`, `expired`, `blocked`, `resolving`, `retrying`, `resolved`, `discard_review`, `discarded`, `offline`, `session_expired`, `not_authorized`, `storage_error`, `payload_unavailable`, `api_error` |

## Product Job

This screen helps staff repair or safely close one failed queued operational action without losing evidence, duplicating a backend mutation, or hiding custody risk.

The screen answers one operational question: `What exactly blocked this queued action, and what is the safest next decision?`

The staff member should be able to:

- Understand whether the action failed, conflicted, expired, or became unauthorized.
- See the operation, delivery, role, station or assignment context, and current local status.
- Compare local action intent against latest backend delivery state when online.
- Retry only when the original idempotency key and request fingerprint remain valid.
- Open delivery detail and custody chain before making a decision.
- Re-enter a scan or proof flow when a fresh user action is required.
- Request support when the app cannot resolve the action safely.
- Discard only when policy allows and the local action is no longer needed.
- Preserve a local audit trail for retry, support, or discard.
- Return to the outbox with clear resolved, still-blocked, or discarded state.

This screen is not:

- A generic error page.
- A payload editor.
- A backend admin override surface.
- A station validation screen.
- A payment recovery screen.
- A receiver verification screen.
- A place to rotate idempotency keys for the same queued mutation.
- A place to silently rewrite custody or proof evidence.
- A place to delete unresolved loss-prevention evidence without review.

## Audience

Primary audience:

- Station operators recovering failed station intake, dispatch readiness, or destination receipt actions.
- Drivers recovering failed pickup, transit, or destination handoff actions.
- Final-mile couriers recovering failed acceptance, proof, failed-attempt, or completion actions.
- Field staff working after weak-network shifts.

Secondary audience:

- Claude Code implementing the recovery route.
- QA validating offline replay and conflict handling.
- Operations leads checking custody loss-prevention behavior.
- Security reviewers checking local evidence and redaction.
- Accessibility reviewers checking error and decision flows.

## User State

The user is likely under pressure. They may have already handled a physical package, scanned it, captured proof, or reported an issue, but the backend did not confirm the action.

The user may be:

- Trying to prove that a local action was captured before reconnect.
- Seeing a conflict because backend state moved forward or backward.
- Seeing an expired session after hours offline.
- Seeing a permission block after role, station, or assignment changed.
- Seeing a scan mismatch after another actor handled the package.
- Seeing a rate limit or internal error after repeated retries.
- Deciding whether to retry, redo the action, report an issue, or discard.

The screen must:

- Keep local action intent visible but redacted.
- Make backend-confirmed state visually separate from local intent.
- Explain the blocking reason in plain language.
- Recommend one safe next action.
- Require explicit confirmation for retry or discard when evidence is sensitive.
- Never imply that custody, proof, issue, or status changed until backend success returns.
- Never render raw scan codes, receiver phone, receiver address, supervisor PINs, local file paths, proof references, idempotency keys, request fingerprints, or raw payload bodies.

## Recovery Data Contract

The route receives:

- `queuedActionId`

The screen loads from local storage:

- `localActionId`
- `routeKey`
- `operationId`
- `idempotencyKey`
- `requestFingerprint`
- `actorId`
- `actorRole`
- `deliveryId`
- `assignmentId` when relevant
- `stationId` when relevant
- `trackingCode` when known
- `queuedAt`
- `lastAttemptAt`
- `attemptCount`
- `status`
- `payloadSummary`
- `sensitivePayloadRef`
- `createdFromRoute`
- `lastErrorCode`
- `lastErrorMessage`
- `lastErrorDetails`
- `nextRetryAt`
- `requiresReview`
- `blockedReason`
- `sameDeliveryDependencyIds`
- `supportIssueId` when already escalated
- `discardPolicy`
- `auditEvents`

The screen may load from backend when online:

- Delivery summary through the existing delivery detail contract.
- Delivery timeline through `get_delivery_timeline`.
- Current custody owner from lifecycle response.
- Current delivery status.
- Relevant station, driver, or courier assignment summary.
- Current issue state when the action is `create_issue`.

The screen must not pass sensitive values in navigation params.

## Recovery Classification

Classify the queued action before rendering a decision.

`failed`:

- Backend or network error did not prove a business conflict.
- Action can often retry with the same payload and idempotency key.
- Transient causes include timeout, `RATE_LIMITED`, and `INTERNAL_ERROR`.

`conflict`:

- Backend state no longer matches the local action intent.
- Business causes include `INVALID_STATUS_TRANSITION`, `PACKAGE_SCAN_MISMATCH`, `NOT_FOUND`, idempotency payload mismatch under `VALIDATION_ERROR`, or same-delivery dependency failure.
- Conflict requires user review before retry.

`expired`:

- Session, auth token, or local authorization context is no longer valid.
- User must sign in or refresh role before retry.

`blocked`:

- Policy or route prevents replay.
- Causes include `FORBIDDEN`, `ROUTE_NOT_ENABLED`, `PAYMENT_REQUIRED`, station scope mismatch, assignment mismatch, or proof dependency missing.

`payload_unavailable`:

- Sensitive payload cannot be loaded or decrypted.
- The app cannot retry automatically.
- User must contact support or redo the action if product policy allows.

`resolved`:

- Backend replay succeeded, or an idempotency replay returned the prior successful response.
- The outbox row can move to synced history.

`discarded`:

- User explicitly closed a local action that policy allows to discard.
- Discard is local only and must not call a backend delete endpoint.

## Recovery Decision Model

Every state maps to one recommended decision and one or more secondary exits.

Recommended decisions:

- `Retry original action`
- `Sign in and retry`
- `Refresh role and retry`
- `Redo scan`
- `Redo proof`
- `Open delivery`
- `Open custody chain`
- `Report issue`
- `Contact support`
- `Discard local action`
- `Return to outbox`

Decision rules:

- Retry is allowed only when the original idempotency key, request fingerprint, route key, actor context, and payload are intact.
- Retry must use the original request body.
- Retry must use the original `Idempotency-Key`.
- Retry must not create a new local action.
- Retry must not run if a same-delivery earlier action is unresolved.
- Retry must not run if latest backend state proves the action is obsolete.
- Redo scan or proof creates a new workflow action only after the old action is marked superseded locally with audit reason.
- Discard requires policy review for custody, proof, and issue actions.
- Support escalation preserves local evidence reference and redacted details.

## Queueable Operation Recovery Policy

Supported recovery targets:

- `confirm_intake`
- `dispatch_delivery`
- `confirm_pickup`
- `mark_in_transit`
- `receive_destination`
- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `create_issue`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`
- `record_failed_attempt` when backend policy supports offline replay

Operation-specific recovery:

- `confirm_intake`: compare local station intent against current delivery status and origin station.
- `dispatch_delivery`: verify station dispatch readiness still applies and custody remains with origin station.
- `confirm_pickup`: verify assigned driver, station dispatch state, and package scan evidence.
- `mark_in_transit`: verify driver custody is still current.
- `receive_destination`: verify driver custody, destination station, and package scan evidence.
- `accept_final_mile_assignment`: verify assigned courier and destination station custody.
- `mark_out_for_delivery`: verify courier custody or active courier assignment.
- `create_issue`: retry if issue is not already created; otherwise link the existing issue if backend returns a successful idempotent response.
- `create_delivery_proof_asset`: verify local media still exists and payload can be decrypted.
- `confirm_delivery_proof_asset_upload`: verify upload success and proof metadata.
- `complete_delivery`: verify proof metadata exists and receiver/proof policy is satisfied.
- `record_failed_attempt`: verify policy allows another failed-attempt record and does not duplicate a confirmed attempt.

Never recover through this screen:

- Payment initialization.
- Payment verification.
- Refund approval.
- Refund settlement.
- Auth challenge requests.
- Public receiver verification.
- Admin override actions.

## Primary Action

Primary action by state:

- `loading_action`: wait.
- `failed`: retry original action.
- `conflict`: review conflict and choose safe route.
- `expired`: sign in and retry.
- `blocked`: open required context or support.
- `resolving`: show progress.
- `retrying`: show retry progress.
- `resolved`: return to outbox or open delivery.
- `discard_review`: confirm or cancel discard.
- `discarded`: return to outbox.
- `offline`: review local details; retry disabled.
- `session_expired`: sign in.
- `not_authorized`: refresh role or support.
- `storage_error`: contact support.
- `payload_unavailable`: contact support or redo action if policy allows.
- `api_error`: retry when safe or support.

Secondary actions:

- `Open delivery`
- `Open custody chain`
- `Open scan flow`
- `Open proof flow`
- `Open issue form`
- `Open support`
- `Back to outbox`
- `Copy support reference`
- `View local audit trail`

Blocked behavior:

- Do not show retry as primary for conflicts that require fresh scan/proof.
- Do not show discard as primary for custody or proof actions.
- Do not retry when offline.
- Do not retry when local payload is missing.
- Do not retry when role is unauthorized.
- Do not retry when `nextRetryAt` is in the future.
- Do not send raw idempotency key or raw payload to analytics.
- Do not call backend delete for discard.

## First Meaningful Value

First meaningful value is reached when staff sees:

- Operation label.
- Delivery tracking code when known.
- Local status.
- Blocking reason.
- Last backend error code.
- Whether backend state was refreshed.
- Recommended next action.
- Clear statement that the local action is not backend-confirmed.

The first viewport must answer:

- `What action failed?`
- `Which delivery is affected?`
- `What blocked it?`
- `Can I retry safely?`
- `What should I do next?`

## Main Tension

The user wants to clear the queue quickly, but package safety depends on distinguishing local intent from backend truth. Recovery must be fast without becoming reckless.

The design must balance:

- Fast field recovery against loss-prevention review.
- Retry convenience against duplicate mutation risk.
- Local evidence preservation against privacy.
- Backend truth against incomplete local context.
- One-handed operation against high-stakes confirmation.
- Clear guidance against overexplaining every backend detail.

## Design Brief

User and job:

- Field staff needs to make one safe decision about a failed queued action.

Context of use:

- Mobile, likely low bandwidth, possibly after a physical handoff, scan, or proof event.

Entry point:

- Offline outbox failed/conflict row.
- Failed replay notification.
- Delivery detail queued-action banner.
- Role home outbox alert.

Success state:

- The action syncs successfully, is routed to a fresh workflow, is escalated, or is safely discarded with audit.

Primary action:

- Execute the safest recovery decision for this action.

Navigation model:

- Single-action decision page with context, blocking reason, evidence summary, recommended action, and support exits.

Density:

- Medium-high, but segmented. Recovery is high-stakes and needs evidence, but the screen must not become a log dump.

Visual thesis:

- A field incident resolver: precise, calm, evidence-aware, and visibly stricter than a normal retry screen.

Restraint rule:

- Avoid generic error illustrations, raw technical dumps, and any styling that makes unresolved work feel complete.

Product lens:

- Custody safety, idempotent retry, and operator confidence.

System stance:

- Guided decision surface for one queued action.

Interaction thesis:

- Diagnose, compare, decide, then record the outcome.

Signature move:

- A `Local intent vs backend state` comparison panel that shows what the device tried to do and what the backend currently says, with sensitive values redacted.

Activation event:

- User retries, signs in, opens context, starts a fresh scan/proof flow, escalates, discards, or returns to outbox.

## Elite Quality Gate

This spec is not closed unless `OpsActionRecovery` prevents unsafe retry and unsafe discard.

Non-negotiable quality requirements:

- First viewport names the failed operation and delivery.
- The blocking reason is plain language plus backend code where useful.
- Local intent is visually separate from backend-confirmed state.
- Retry reuses the original `Idempotency-Key`.
- Retry reuses the original request fingerprint.
- Retry is unavailable when evidence or authority is missing.
- Conflict cannot auto-retry.
- Custody/proof discard is never casual.
- Support escalation preserves local audit references without exposing sensitive data.
- Resolved state requires parsed backend success or prior idempotent success.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:

- If a conflict can be retried without review, the screen remains open.
- If retry can rotate keys, the screen remains open.
- If discard can hide custody/proof evidence, the screen remains open.
- If backend-confirmed and local-only states blur together, the screen remains open.
- If sensitive payload appears in the UI, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): queued writes need durable local state, synchronization discipline, and conflict handling.
- [web.dev Offline Cookbook](https://web.dev/articles/offline-cookbook): offline behavior should be deliberate and visible, especially when network and cached or local state diverge.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): retry, success, conflict, and failure updates must be announced without stealing focus.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): recovery, retry, and discard controls need reliable touch targets.
- [Material Design lists](https://m1.material.io/components/lists.html): evidence rows should remain scannable, grouped, and action-oriented.

Applied decisions:

- Treat recovery as a decision record, not a plain retry page.
- Show local intent against backend truth.
- Put the safest action first and destructive action last.
- Require explicit evidence review before discard.
- Keep raw technical payload out of the interface.

## Data Contract And Backend Alignment

Local queue:

- Local SQLite remains the source for unresolved action metadata.
- Sensitive payload is fetched only through `sensitivePayloadRef`.
- Redacted summary is used for normal display.
- Audit events are appended locally for every recovery decision.

Backend retry:

- Mutating POST retry sends the original route request.
- Retry includes the original `Idempotency-Key` header.
- Backend `executeIdempotentOperation` scopes idempotency by `routeKey`, `actorKey`, and `idempotencyKey`.
- Backend compares request fingerprint.
- Prior successful idempotent response should resolve the action.
- In-progress duplicate response should keep action pending.
- Payload mismatch under the same key maps to conflict.

Shared error schema:

- `apiErrorResponseSchema` provides `requestId`, `code`, `message`, and optional details.
- `apiErrorCodeSchema` currently includes `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `ROUTE_NOT_ENABLED`, `PAYMENT_REQUIRED`, `INVALID_STATUS_TRANSITION`, `PHONE_VERIFICATION_REQUIRED`, `PACKAGE_SCAN_MISMATCH`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

Required parsed success contracts:

- `deliveryLifecycleResponseSchema` for lifecycle and handoff actions.
- Proof asset response schemas for proof upload and confirmation.
- Issue response schema for issue creation when exposed.
- Operation-specific response validation before local row becomes `resolved`.

## Information Architecture

The screen uses seven stacked regions.

Region 1: Title and status

- Screen title.
- Delivery tracking code.
- Operation label.
- Current recovery state.
- Backend confirmation warning.

Region 2: Blocking reason

- Plain-language issue.
- Backend error code.
- Last attempt time.
- Attempt count.
- Request ID when safe to show.

Region 3: Recommended action

- One primary action.
- Why this action is safe or required.
- Disabled reason when unavailable.

Region 4: Local intent vs backend state

- Redacted local action summary.
- Latest backend summary when available.
- Difference callout.
- Freshness timestamp.

Region 5: Evidence and dependencies

- Required scan/proof/assignment/station checks.
- Same-delivery queued dependency status.
- Missing evidence callouts.

Region 6: Decision controls

- Retry.
- Sign in.
- Open delivery.
- Open custody chain.
- Redo scan or proof.
- Report issue.
- Contact support.
- Discard local action.

Region 7: Audit trail and support reference

- Local recovery events.
- Last support issue link.
- Copyable support reference.

## Header Specification

Header content:

- Title: `Recover queued action`
- Subtitle: operation label plus tracking code when known.
- Status chip: `Failed`, `Conflict`, `Expired`, `Blocked`, `Retrying`, `Resolved`, or `Discarded`.
- Warning line: `This action is saved on this device. It is not backend-confirmed.`

Header behavior:

- If resolved, warning changes to `Backend confirmation received.`
- If discarded, warning changes to `Local action closed. Backend was not changed by discard.`
- If offline, show `Offline: recovery review only.`
- If backend state is stale, show `Backend state not refreshed.`

Visual rules:

- Failed/conflict statuses use high-contrast warning treatment.
- Resolved uses success treatment only after backend response validation.
- Discarded uses neutral archive treatment, not success.
- Do not use color alone.

## Blocking Reason Specification

Show the blocking reason as a short diagnosis.

Reason fields:

- Human-readable title.
- Short explanation.
- Backend code where available.
- Last attempt timestamp.
- Retry availability.
- Support reference.

Reason copy patterns:

- `Backend state changed before this action synced. Review before retry.`
- `The session expired while this action was waiting. Sign in before retry.`
- `The package scan did not match the registered package. Redo scan or contact support.`
- `This route is not enabled for replay. Contact support.`
- `The local payload cannot be opened on this device. Contact support before closing the action.`
- `The backend is rate limiting retries. Try again after the shown time.`

Do not show:

- Raw backend stack text.
- Raw payload fragments.
- Raw scan code.
- Raw idempotency key.
- Raw request fingerprint.

## Local Intent Vs Backend State Panel

Purpose:

- Make it impossible to confuse what the device tried to do with what the backend accepted.

Local intent column:

- Operation label.
- Actor role.
- Station or assignment context.
- Queued time.
- Redacted payload summary.
- Required evidence type.
- Same-delivery dependency status.

Backend state column:

- Delivery status.
- Current custody role.
- Current custody actor label when safe.
- Latest timeline event label.
- Latest station or assignment context.
- Backend freshness time.

Difference callout:

- `No backend state available. Retry needs network.`
- `Backend still matches local intent. Retry is allowed.`
- `Backend moved forward. This action may already be obsolete.`
- `Backend moved to a different custody owner. Do not retry without support.`
- `Backend requires a fresh scan. Open scan flow.`
- `Proof is missing. Open proof flow.`

Freshness:

- Show `Updated just now`, duration, or `Not refreshed`.
- If stale beyond policy, disable retry until refresh succeeds unless the error is purely local.

## Evidence And Dependency Panel

Evidence checks:

- Required scan present locally.
- Required proof metadata present locally.
- Required upload confirmation present locally.
- Actor role present.
- Station ID present for station operator action.
- Assignment ID present for driver or courier action.
- Delivery ID present.
- Idempotency key present.
- Request fingerprint present.
- Sensitive payload can be decrypted.

Dependency checks:

- Earlier queued action for same delivery.
- Earlier failed action for same delivery.
- Earlier conflict action for same delivery.
- Proof upload before completion.
- Dispatch before driver pickup.
- Destination receipt before courier acceptance.

Display rules:

- Each check has `Ready`, `Missing`, `Blocked`, or `Needs review`.
- Missing sensitive values are described by type, not value.
- Same-delivery blockers link back to outbox or the related recovery screen.

## Retry Flow

Entry:

- User selects `Retry original action`.

Preflight checks:

- Device online.
- Session valid.
- Role and station/assignment context still authorized.
- Action status allows retry.
- `nextRetryAt` has passed.
- Local payload can be loaded.
- Idempotency key exists.
- Request fingerprint exists.
- Operation is allowed for replay.
- Same-delivery earlier actions are resolved.
- Backend state does not prove the action obsolete.

Confirmation:

- For custody and proof actions, show a confirmation sheet.
- Sheet explains that retry will send the original saved action.
- Sheet states that backend confirmation is required before delivery state changes.
- Sheet offers `Retry original action` and `Cancel`.

Execution:

- Mark local status `retrying`.
- Append audit event `recovery_retry_started`.
- Send original request body.
- Send original `Idempotency-Key`.
- Parse backend response.
- Validate operation-specific schema.
- Mark local status `resolved`.
- Append audit event `recovery_retry_resolved`.
- Invalidate delivery, timeline, outbox, and role-home caches.
- Show resolved state.

Retry failure:

- Parse `apiErrorResponseSchema`.
- Increment attempt count.
- Store last attempt time.
- Store last error.
- Reclassify state.
- Append audit event `recovery_retry_failed`.
- Keep user on screen with updated decision.

Retry must not:

- Generate a new idempotency key.
- Change request body.
- Change scan/proof payload.
- Mark resolved before schema validation.
- Delete local evidence after failure.

## Redo Scan Or Proof Flow

Use this path when the original local action cannot safely replay.

Redo scan:

- Available for `PACKAGE_SCAN_MISMATCH`, missing scan evidence, stale scan policy, or station/assignment mismatch that requires fresh evidence.
- Opens `/(ops)/deliveries/:deliveryId/scan` with safe context only.
- Marks current queued action `superseded_pending` locally if the user starts a new scan flow.
- Does not delete the old local action until the new flow resolves or support closes it.

Redo proof:

- Available for missing proof metadata, missing local media, upload confirmation failure, or completion waiting on proof.
- Opens proof capture or proof recovery flow when implemented.
- Keeps completion action blocked until proof dependency resolves.
- Does not mark completion resolved from this screen.

Copy rules:

- CTA labels use `Redo package scan` and `Redo proof`.
- Explanation must say why the original action cannot safely replay.
- Do not imply the redone scan/proof will automatically close the old action until backend confirms.

## Sign-In And Authorization Recovery

Expired session:

- Show primary action `Sign in and retry`.
- Preserve local queue.
- After sign-in, return to this route with `queuedActionId`.
- Re-run authorization and preflight checks.
- If authorization passes, let user retry.
- If authorization fails, classify `not_authorized`.

Role changed:

- Show role mismatch.
- Explain that this action was saved under a different role, station, or assignment.
- Offer `Refresh role`, `Open support`, and `Back to outbox`.
- Retry stays disabled until role context matches policy.

Station scope changed:

- Show station mismatch without exposing sensitive station internals.
- Offer delivery context and support.
- Do not retry station action if station scope is no longer valid.

Assignment changed:

- Show assignment mismatch.
- Offer open delivery and custody chain.
- Do not retry driver/courier action if assignment is no longer valid.

## Discard Flow

Discard closes a local action only. It never calls a backend delete endpoint.

Discard availability:

- Allowed for non-custody, non-proof, non-issue actions when backend state proves the local action is obsolete.
- Allowed for resolved duplicate local records after backend success is linked.
- Requires support or elevated policy for custody, proof, or issue actions.
- Disabled when payload is still needed for active support.
- Disabled while retrying.

Discard review state:

- Show what will happen.
- Show what will not happen.
- Show operation, delivery, status, and reason.
- Require explicit confirmation.

Required confirmation copy:

- `Discard local action`
- `This removes the action from this device queue only. It will not change backend delivery state.`

After discard:

- Mark status `discarded`.
- Append audit event `recovery_action_discarded`.
- Keep minimal audit summary.
- Return to outbox or show discarded state.

Never discard silently:

- Custody handoff action.
- Proof or completion action.
- Issue report with unsent evidence.
- Action with missing payload where support may need local reference.

## Support Escalation Flow

Use support when the app cannot determine a safe local decision.

Support entry carries:

- `localActionId`
- `deliveryId`
- `routeKey`
- `operationId`
- `actorRole`
- `lastErrorCode`
- `attemptCount`
- `queuedAgeBucket`
- `supportReference`
- Redacted action summary

Support entry must not carry:

- Raw request body.
- Raw scan code.
- Receiver phone.
- Receiver address.
- Supervisor PIN.
- Raw proof reference.
- Raw local media path.
- Idempotency key.
- Request fingerprint.

If online:

- Open `OpsIssueCreate` or `OpsSupport` with redacted context.
- Link returned issue ID to local action.

If offline:

- Allow a local support note if supported.
- Queue support issue only if issue queueing is allowed.
- Otherwise show a support reference and next step.

## Error Mapping

`VALIDATION_ERROR`:

- If request fingerprint or idempotency payload mismatch: classify `conflict`.
- If payload shape is invalid: classify `blocked`.
- Primary action: support or redo workflow depending on operation.

`FORBIDDEN`:

- Classify `not_authorized`.
- Primary action: refresh role or support.

`NOT_FOUND`:

- Classify `conflict`.
- Primary action: open delivery if available or support.

`ROUTE_NOT_ENABLED`:

- Classify `blocked`.
- Primary action: support.

`PAYMENT_REQUIRED`:

- Classify `blocked`.
- Primary action: open delivery detail or support.

`INVALID_STATUS_TRANSITION`:

- Classify `conflict`.
- Primary action: compare backend state and open custody chain.

`PHONE_VERIFICATION_REQUIRED`:

- Classify `blocked`.
- Primary action: open authorized verification/proof route if applicable or support.

`PACKAGE_SCAN_MISMATCH`:

- Classify `conflict`.
- Primary action: redo scan or open custody chain.

`RATE_LIMITED`:

- Classify `failed`.
- Primary action: retry after `nextRetryAt`.

`INTERNAL_ERROR`:

- Classify `failed`.
- Primary action: retry original action when safe.

Network timeout:

- Keep or set `failed`.
- Primary action: retry original action with same idempotency key when online.

Payload decrypt failure:

- Classify `payload_unavailable`.
- Primary action: support.

Local SQLite failure:

- Classify `storage_error`.
- Primary action: support.

## State Matrix

`loading_action`:

- Show skeleton header, reason panel, and action area.
- Do not show missing-action error until local store read completes.

`failed`:

- Show blocking reason and retry preflight.
- Primary action: retry original action if safe.
- Secondary: open delivery, support, back to outbox.

`conflict`:

- Show local intent vs backend state.
- Primary action depends on conflict type.
- Retry disabled until review allows it.

`expired`:

- Show session expired message.
- Primary action: sign in and retry.
- Preserve local row.

`blocked`:

- Show policy or route blocker.
- Primary action: open required context or support.
- Retry disabled.

`resolving`:

- Show local diagnosis refresh in progress.
- Disable decision controls.

`retrying`:

- Show retry progress.
- Disable duplicate retry.
- Announce status.

`resolved`:

- Show backend confirmation received.
- Primary action: return to outbox.
- Secondary: open delivery.

`discard_review`:

- Show discard confirmation.
- Primary action: confirm discard.
- Secondary: cancel.

`discarded`:

- Show local action closed.
- Primary action: return to outbox.
- Do not use success language that suggests backend changed.

`offline`:

- Show local details.
- Retry and backend refresh disabled.
- Support path uses offline-safe behavior.

`session_expired`:

- Show sign-in path.
- Hide sensitive summaries if policy requires.

`not_authorized`:

- Show role/access issue.
- Retry disabled.
- Open support or delivery context.

`storage_error`:

- Show local storage problem.
- Stop retry and discard.
- Contact support.

`payload_unavailable`:

- Show local payload cannot be opened.
- Retry disabled.
- Support or redo action if policy allows.

`api_error`:

- Show backend issue.
- Reclassify after parse if possible.

## Copy System

Voice:

- Calm.
- Direct.
- Specific.
- No blame.
- No hype.

Primary headline patterns:

- `Recover queued action`
- `This action needs review`
- `Backend state changed`
- `Sign in before retry`
- `Retry is not safe yet`
- `Backend confirmation received`
- `Local action closed`

Body copy rules:

- Say what happened.
- Say whether backend changed.
- Say what the user can do next.
- Keep critical words first.
- Prefer exact role and operation labels.
- Avoid jargon unless paired with plain language.

Button copy:

- `Retry original action`
- `Sign in and retry`
- `Refresh role`
- `Redo package scan`
- `Redo proof`
- `Open custody chain`
- `Open delivery`
- `Report issue`
- `Contact support`
- `Discard local action`
- `Back to outbox`

Error copy patterns:

- `The saved action could not sync because the backend state changed. Review custody before retrying.`
- `The saved action is still local. Backend delivery state has not changed.`
- `The app cannot open the saved payload on this device. Contact support before closing this action.`
- `The backend is delaying retries. Try again after the time shown.`

## Layout And Interaction

Mobile layout:

- Full-screen route under the operations shell.
- Sticky title area only when scrolling would hide operation and delivery identity.
- Primary action sits near the decision panel, not only at page bottom.
- Destructive discard remains below support and context actions.
- Audit trail is collapsed by default.

Touch behavior:

- Major actions use full-width or clearly separated controls.
- Destructive action requires a confirmation step.
- Disabled buttons include visible reason text.
- Rows in comparison panel are readable, not tiny metadata chips.

Motion:

- Use a short state transition for retry start and resolution.
- Use no looping animation for failure.
- Respect reduced motion.
- Announce status changes through accessible status messages.

Offline behavior:

- The route loads local details offline.
- Backend comparison panel shows not refreshed.
- Retry disabled.
- User can still view local audit and support reference.

## Navigation

Allowed route entries:

- From `OpsOfflineOutbox` row.
- From failed replay notification.
- From delivery detail unresolved action banner.
- From role home unresolved outbox card.

Back behavior:

- Back returns to previous route.
- After resolved, back returns to outbox with refreshed grouping.
- After discard, back returns to outbox with discarded or removed row based on retention policy.
- If retry is in progress, back prompts to stay or leave while background retry continues only if sync worker supports safe continuation.

Deep link behavior:

- If `queuedActionId` does not exist, show local missing state and link to outbox.
- If user is signed out, require sign-in before showing sensitive local summaries.
- If action belongs to another actor/device scope, show not authorized.

Post-action routing:

- Resolved: outbox or delivery detail.
- Redo scan: scan route.
- Redo proof: proof route when implemented.
- Issue/support: support route.
- Discarded: outbox.

## Privacy And Security

Security rules:

- Require authenticated session before sensitive details render.
- Local action must belong to the authenticated actor or allowed device scope.
- Sensitive payload loads only after authorization.
- Do not display raw request body.
- Do not display raw package scan code.
- Do not display raw proof reference.
- Do not display receiver phone or address.
- Do not display supervisor PIN.
- Do not display raw idempotency key.
- Do not display request fingerprint.
- Do not display local media path.

Audit rules:

- Append local audit event for view, retry start, retry success, retry failure, support escalation, discard review, discard, and context route opens.
- Audit events store redacted details.
- Audit events include timestamp, actor ID, actor role, operation ID, and decision type.
- Audit events do not include sensitive payload.

Sign-out behavior:

- Lock or clear queue according to security policy.
- If queue remains locked, recovery screen shows sign-in requirement.
- If queue clears, recovery screen shows action unavailable and support reference if retained.

## Accessibility Requirements

Screen reader:

- Initial announcement includes operation, delivery, current state, and recommended action.
- Retry start, retry success, retry failure, conflict update, and discard confirmation use status messages.
- Comparison panel labels must identify local intent and backend state.
- Disabled actions expose their disabled reason.
- Sensitive hidden fields are not included in accessibility labels.

Focus:

- Initial focus lands on title.
- After backend refresh, focus remains stable unless a blocking decision changes.
- After retry failure, focus moves to blocking reason.
- After retry success, focus moves to resolved heading.
- Confirmation sheets trap focus correctly and return focus to the invoking control.

Touch:

- Action controls meet target-size requirements.
- Destructive action is not icon-only.
- Links in dense panels remain reachable with one hand.

Visual:

- States do not rely on color alone.
- Large text does not truncate operation, status, or primary action.
- Contrast meets product accessibility rules.
- Small phones preserve action priority.

Motion:

- Reduced-motion users get instant state changes with text.
- Progress changes do not rely only on animation.

Localization:

- Use localized date and duration formatting.
- Avoid idioms.
- Keep labels short.
- Avoid concatenating translated fragments where grammar can break.

## Analytics And Observability

Required analytics events:

- `ops_action_recovery_viewed`
- `ops_action_recovery_context_refreshed`
- `ops_action_recovery_retry_started`
- `ops_action_recovery_retry_succeeded`
- `ops_action_recovery_retry_failed`
- `ops_action_recovery_conflict_reviewed`
- `ops_action_recovery_opened_delivery`
- `ops_action_recovery_opened_custody_chain`
- `ops_action_recovery_redo_scan_started`
- `ops_action_recovery_redo_proof_started`
- `ops_action_recovery_support_opened`
- `ops_action_recovery_discard_reviewed`
- `ops_action_recovery_discarded`
- `ops_action_recovery_storage_error`

Allowed analytics fields:

- `localActionId`
- `routeKey`
- `operationId`
- `actorRole`
- `deliveryId`
- `status`
- `classification`
- `attemptCount`
- `errorCode`
- `queuedAgeBucket`
- `networkState`
- `isMeteredConnection`
- `decisionType`
- `hasBackendContext`

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

- Recovery page views by classification.
- Retry success rate after recovery view.
- Conflict resolution path distribution.
- Discard count by operation type.
- Support escalation rate.
- Payload unavailable rate.
- Time from recovery view to resolved state.
- Same-delivery dependency block rate.

## Performance Requirements

Initial render:

- Local action metadata renders within 500 milliseconds after local store access.
- Sensitive payload remains unloaded until needed for retry or secure evidence checks.
- Backend refresh should not block local diagnosis rendering.

Backend refresh:

- Fetch latest delivery/timeline only when online and authorized.
- Show freshness state.
- Timeout gracefully and keep local diagnosis visible.

Retry:

- Preflight should complete quickly from indexed local data.
- Same-delivery dependency query must use local index by delivery ID and status.
- No duplicate in-flight retry for the same `localActionId`.

Storage:

- Recovery reads one queue row plus related dependency summary.
- Audit append must be durable.
- Storage error must stop destructive actions.

Failure isolation:

- One action recovery must not start sync for unrelated outbox items.
- Same-delivery unresolved dependencies must block unsafe retry.
- Returning to outbox must not clear unresolved state.

## Test IDs

Primary:

- `screen-ops-action-recovery`

Header:

- `ops-action-recovery-title`
- `ops-action-recovery-operation`
- `ops-action-recovery-delivery`
- `ops-action-recovery-status`
- `ops-action-recovery-warning`

Blocking reason:

- `ops-action-recovery-reason`
- `ops-action-recovery-error-code`
- `ops-action-recovery-last-attempt`
- `ops-action-recovery-attempt-count`
- `ops-action-recovery-support-reference`

Recommendation:

- `ops-action-recovery-recommended-action`
- `ops-action-recovery-disabled-reason`

Comparison:

- `ops-action-recovery-local-intent`
- `ops-action-recovery-backend-state`
- `ops-action-recovery-difference`
- `ops-action-recovery-freshness`

Evidence:

- `ops-action-recovery-evidence-panel`
- `ops-action-recovery-evidence-check`
- `ops-action-recovery-dependency-panel`
- `ops-action-recovery-dependency-row`

Actions:

- `ops-action-recovery-retry`
- `ops-action-recovery-sign-in`
- `ops-action-recovery-refresh-role`
- `ops-action-recovery-redo-scan`
- `ops-action-recovery-redo-proof`
- `ops-action-recovery-open-delivery`
- `ops-action-recovery-open-custody-chain`
- `ops-action-recovery-report-issue`
- `ops-action-recovery-contact-support`
- `ops-action-recovery-discard`
- `ops-action-recovery-back-to-outbox`

Discard:

- `ops-action-recovery-discard-sheet`
- `ops-action-recovery-discard-confirm`
- `ops-action-recovery-discard-cancel`

Audit:

- `ops-action-recovery-audit-toggle`
- `ops-action-recovery-audit-row`

States:

- `ops-action-recovery-loading`
- `ops-action-recovery-failed`
- `ops-action-recovery-conflict`
- `ops-action-recovery-expired`
- `ops-action-recovery-blocked`
- `ops-action-recovery-retrying`
- `ops-action-recovery-resolved`
- `ops-action-recovery-discarded`
- `ops-action-recovery-offline`
- `ops-action-recovery-session-expired`
- `ops-action-recovery-not-authorized`
- `ops-action-recovery-storage-error`
- `ops-action-recovery-payload-unavailable`
- `ops-action-recovery-api-error`

## API Integration Notes

Load flow:

- Read `queuedActionId` from route.
- Load authenticated user.
- Read local queued action by ID.
- Verify actor/device scope.
- Load redacted payload summary.
- Query same-delivery dependencies.
- Classify current recovery state.
- If online and authorized, fetch backend delivery/timeline context.
- Render decision model.

Retry flow:

- Run preflight.
- Load sensitive payload from secure store.
- Send original request to original route.
- Send original `Idempotency-Key`.
- Parse operation-specific response schema.
- Mark local action `resolved`.
- Append audit event.
- Invalidate caches.
- Show resolved state.

Conflict refresh flow:

- Fetch latest delivery.
- Fetch latest timeline.
- Compare local intent to backend state.
- Update classification and decision.
- Append audit event when classification changes.

Discard flow:

- Verify discard policy.
- Show review state.
- On confirmation, mark local row `discarded`.
- Append local audit event.
- Do not call backend delete.

Support flow:

- Build redacted support context.
- Route to issue/support.
- Link support issue ID to local action after issue creation succeeds.

## QA Acceptance Criteria

Functional:

- Missing local action shows route-safe missing state and outbox link.
- Failed retryable action shows retry primary action.
- Conflict action shows local intent vs backend state.
- Expired action routes sign-in and returns to recovery.
- Unauthorized action disables retry.
- Offline state shows local details and disables retry.
- Payload unavailable disables retry and routes support.
- Same-delivery unresolved dependency blocks retry.
- Retry uses original idempotency key.
- Retry uses original request fingerprint.
- Retry sends original request body.
- Retry success marks resolved only after schema validation.
- Retry failure preserves local evidence.
- Discard is unavailable for unresolved custody/proof unless policy allows.
- Discard does not call backend delete.
- Support context is redacted.

Backend alignment:

- `executeIdempotentOperation` replay behavior is respected.
- Completed idempotent response resolves the local action.
- In-progress duplicate keeps action pending.
- Mismatched idempotency payload maps to conflict.
- `apiErrorCodeSchema` values map to safe UI states.
- Operation-specific success schema is parsed before resolved state.

Security:

- Raw payload does not render.
- Raw scan code does not render.
- Raw proof reference does not render.
- Receiver phone and address do not render.
- Supervisor PIN does not render.
- Idempotency key and request fingerprint do not render.
- Analytics excludes sensitive values.

Accessibility:

- Initial state is announced.
- Retry progress is announced.
- Retry failure is announced.
- Resolved state is announced.
- Discard confirmation is accessible.
- Disabled actions expose reason.
- Large text preserves critical decision content.

Resilience:

- App restart preserves recovery state.
- Network timeout does not rotate idempotency key.
- Repeated retry cannot create duplicate in-flight request.
- Rate-limited action honors `nextRetryAt`.
- Backend refresh failure does not hide local diagnosis.
- Storage error blocks retry and discard.

## Visual Quality Checklist

Before handoff, confirm:

- The screen feels like a high-trust operational resolver, not a normal error page.
- The top state makes local-only status unmistakable.
- The recommended action is obvious.
- Destructive discard is visually and structurally secondary.
- Local intent and backend state are separated.
- Sensitive data is never exposed.
- Conflict and failed states are visually distinct.
- The page remains usable under stress, glare, poor network, small phones, and large text.

## Implementation Guardrails For Claude Code

Build this as a recovery decision screen only when frontend work begins.

Implementation rules:

- Keep recovery classification in a pure tested function.
- Keep retry preflight in a pure tested function.
- Keep error-code mapping centralized with the outbox classifier.
- Keep idempotency key and request fingerprint out of rendered component props where possible.
- Keep secure payload loading outside normal render.
- Keep discard policy explicit by operation type.
- Keep support context redaction centralized.
- Keep backend comparison logic testable.
- Never create a new queued action as part of retry.
- Never mark resolved from UI optimism.

Suggested file ownership:

- Screen route owns orchestration and navigation.
- Recovery service owns classification, preflight, retry, discard, and audit append.
- Outbox store owns SQLite reads/writes.
- Secure payload store owns sensitive payload access.
- Comparison component owns local-vs-backend rendering.
- Decision component owns recommended action.
- Audit component owns redacted local events.

Required implementation tests:

- Failed state renders retry when safe.
- Conflict state disables direct retry.
- Expired state routes sign-in.
- Unauthorized state disables retry.
- Payload unavailable routes support.
- Retry reuses idempotency key.
- Retry preserves request fingerprint.
- Retry success requires response schema validation.
- Same-delivery dependency blocks retry.
- Discard requires review.
- Discard never calls backend delete.
- Support context redacts sensitive data.
- Analytics excludes payload, idempotency key, and request fingerprint.

## Final Implementation Decisions

Rate-limit copy is fixed for v1. If `lockUntil` is known, show `Try again after {time}`. If no exact time is available, show `Wait before retrying`.

Synced and discarded action history must retain the newest 100 entries or 24 hours of entries, whichever limit is reached first.

Audit details must use a collapsed per-action disclosure. On phones, only one action can be expanded at a time.

Recovery data must use the shared secure-storage adapter. Action payloads containing receiver data, proof metadata, package identifiers, or handoff context must not be stored outside secure encrypted storage.

Backend refresh timeout is fixed at 8 seconds. Timeout state must show retry, keep the local action visible, and must not classify the action as failed without a backend response.

Platform follow-up decision: add explicit typed error codes for idempotency payload mismatch, same-delivery dependency blocked, payload unavailable, support-required discard, and proof dependency missing so frontend classification does not rely on broad validation details.

## Final Handoff Notes

`OpsActionRecovery` is the safety valve for offline operations. It must help staff recover work without making the system lie about backend truth.

The safest implementation treats retry as a replay of the original saved intent, discard as a local audit decision, and backend confirmation as the only proof that delivery state changed.
