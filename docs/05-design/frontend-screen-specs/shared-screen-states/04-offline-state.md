# Offline State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `offline` |
| Component family | Shared screen state |
| Primary component | `SharedOfflineState` |
| Supporting components | `OfflineBanner`, `CachedDataNotice`, `OfflineActionGate`, `OutboxStatusStrip`, `SyncPendingPanel`, `MeteredConnectionNotice`, `ReconnectProgressPanel`, `OfflineUnavailablePanel` |
| Primary surfaces | sender mobile app, operations mobile app, receiver public flow, public web, admin web console |
| Required recovery | cached data marker and offline queue when allowed |
| Test id root | `state-offline` |
| Backend coverage | None directly; reflects connectivity, cache, local store, and sync state around backend operations |
| Browser mutation operation | None |
| Data sensitivity | cached timestamp, queued action count, oldest queued action age, role, station or assignment scope, safe target label |
| Offline critical | Yes for station, driver, and final-mile courier workflows; limited read fallback for sender; admin web is online-only |
| Related inventory state | `offline` |
| Related state specs | loading, empty, error, stale data, custody not confirmed, blocked by issue, payment under review, proof required |
| Design tokens | `warning.amber.600`, `brand.blue.600`, `success.green.600`, `danger.red.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear connectivity state, non-color indicators, and status announcements |

## Purpose
`SharedOfflineState` defines how Kra tells users that network connectivity is unavailable or unreliable, what content is cached, which actions can be saved locally, which actions must wait for the server, and what will happen after reconnect.

The offline state must answer:
- `Am I offline or on an unreliable connection?`
- `Is the visible data cached?`
- `How old is the cached data?`
- `Which actions are still allowed?`
- `Which actions are blocked until online?`
- `Can this action be saved to the local outbox?`
- `Has this local action reached the backend yet?`
- `What happens if sync conflicts with newer server state?`

The most important rule is:
```text
Offline capture is not backend confirmation. The UI must never show custody, payment, proof, or delivery completion as final until the server or approved local policy confirms the correct state.
```

## Product Job
Kra is built for African delivery conditions where mobile networks can be weak, data can be expensive, and field staff may move through areas with unstable coverage. Offline UX is not a convenience feature. It is a loss-prevention and trust feature.

The offline system must:
- keep customers informed without overpromising real-time data
- keep station, driver, and courier work moving when policy allows
- preserve critical action intent safely on device
- protect idempotency and duplicate prevention
- make pending sync visible
- prevent staff from believing local capture changed backend truth
- avoid data-heavy patterns on low-bandwidth paths
- preserve proof metadata when media upload is delayed
- force review when local replay conflicts with server state

## Strategic Role
Offline state sits between physical reality and backend truth.

Physical reality:
- a station may physically receive a package
- a driver may physically pick up or hand off a package
- a courier may physically capture proof
- a staff member may report an issue on site

Backend truth:
- delivery state changes only after the server accepts the command
- duplicate actions are reconciled by idempotency key
- conflicts require review
- payment, proof, assignment, and custody rules still apply

Offline UI must clearly separate these worlds.

## External Research Used
Only directly relevant offline-first and resilient UX references were used:
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local sources of truth, synchronization, queued writes, and explicit state around failed or delayed network operations.
- [web.dev resilient web design guidance](https://web.dev/learn/pwa/offline-data): supports designing for offline data, cached content, and sync-aware experiences.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing connectivity, queued, sync, and retry state changes without unexpected focus movement.
- [Material Design progress indicators](https://m3.material.io/components/progress-indicators/overview): supports clear progress treatment for reconnect and sync work when completion is known or unknown.

## Visual Thesis
Offline UI should feel like a field operations safety panel: visible, calm, exact, and impossible to confuse with confirmed backend success.

Use:
- amber for offline or queued caution
- green only after server-confirmed sync success
- red only for sync failure, conflict, or storage failure
- clear cached timestamp
- queued action count
- oldest queued age
- status labels in text
- direct routes to outbox or recovery
- minimal imagery

Do not use:
- silent offline mode
- hidden queued actions
- success styling for local-only actions
- full-page blocking when safe cached content exists
- broad "all synced" copy before server confirmation
- repeated retry loops without user awareness
- heavy maps or media as the only way to proceed

## Audience
Primary users:
- sender checking delivery data on weak mobile data
- station operator working intake, dispatch, destination receipt, and final-mile assignment
- driver working pickup, transit, and handoff
- final-mile courier working acceptance, out-for-delivery, proof, completion, and failed attempt
- receiver checking public tracking on a weak connection
- public visitor checking public routes or service areas
- admin using online-only console

Secondary users:
- support staff explaining delayed sync
- ops lead reviewing queued actions
- QA validating reconnect and duplicate prevention
- security reviewer validating local data handling
- accessibility reviewer validating connection state announcements
- Claude Code implementing shared state components later

Non-users:
- payment provider
- webhook provider
- scheduled backend task
- unauthenticated attacker

## Non-Goals
Do not use offline state for:
- server error while online
- empty result
- stale data while online
- authorization failure
- expired session
- payment under review
- refund pending
- blocked issue
- scan mismatch
- duplicate package label
- custody conflict
- proof required
- OTP required
- manual review
- rate limit

Offline state is about connectivity and local availability. Domain blockers still use their own states.

## Offline State Taxonomy
Kra must separate these offline modes.

| Mode | Meaning | Primary Recovery |
| --- | --- | --- |
| `offline_no_cache` | device is offline and no usable cached content exists | reconnect or safe back route |
| `offline_cached_read` | cached data is visible while offline | show cached marker and refresh when online |
| `offline_action_allowed` | action can be saved locally under policy | save to outbox |
| `offline_action_blocked` | action requires live server confirmation | wait for connection or go back |
| `queued_for_sync` | action has been saved locally but not sent | open outbox or continue with caution |
| `syncing_after_reconnect` | queued actions are being sent after network returns | show progress and prevent duplicate action |
| `sync_succeeded` | backend accepted queued action | show confirmed state and clear local pending marker |
| `sync_failed` | backend rejected or failed queued action | open recovery |
| `sync_conflict` | queued action conflicts with newer server state | force review |
| `local_store_error` | local persistence failed | stop critical flow and open support/retry |
| `metered_connection` | connection exists but may be costly or unstable | ask before heavy sync or media upload where policy requires |
| `admin_offline_blocked` | admin web is offline and cannot operate | reconnect |

## Role-Based Connectivity Model
Sender:
- online-first
- cached read fallback allowed
- no critical offline mutations
- delivery creation, payment, issue creation, and profile save need server confirmation

Receiver:
- online-first public flow
- no offline OTP verification
- no offline proof or completion
- cached policy text may remain visible

Public web:
- online-first
- public static content may render
- tracking and service lookup require network or cached safe response

Station operator:
- offline-assisted
- intake, dispatch preparation, destination receipt, and issue creation may use durable outbox when policy allows
- custody is not backend-confirmed until sync succeeds

Driver:
- offline-assisted
- pickup, transit, and handoff preparation may use durable outbox when policy allows
- handoff is not final until server accepts or approved local policy reaches a safe pending state

Final-mile courier:
- offline-assisted
- proof metadata, failed attempt, out-for-delivery, and completion preparation may use outbox when policy allows
- proof metadata must exist before completion can be queued

Admin web:
- online-only
- no offline mutations
- no offline admin export
- no offline user, pricing, refund, station, issue, webhook, or audit changes

## State Machine
Read path:
```text
online
  -> loading
  -> ready
  -> connection_lost
  -> offline_cached_read | offline_no_cache
  -> reconnecting
  -> refreshing
  -> ready | stale_data | error
```

Offline action path:
```text
ready
  -> connection_lost
  -> offline_action_allowed
  -> local_outbox_writing
  -> queued_for_sync
  -> syncing_after_reconnect
  -> sync_succeeded | sync_failed | sync_conflict
```

Blocked offline action:
```text
ready
  -> connection_lost
  -> offline_action_blocked
  -> reconnecting
  -> loading
  -> ready | error
```

Admin path:
```text
admin_ready
  -> connection_lost
  -> admin_offline_blocked
  -> reconnecting
  -> refreshing
  -> ready | error
```

## Entry Rules
Enter offline when:
- network status is unavailable
- API requests fail because connectivity is absent
- reachability checks fail and cached content is being used
- operations mobile attempts an allowed command while offline
- local outbox contains pending actions caused by offline work
- reconnect starts and queued actions are waiting
- admin web loses network and cannot continue safely

Do not enter offline when:
- request failed due to server 500 while connected
- user lacks permission
- session expired
- data is stale but network is available
- result is empty
- rate limit is active
- payment provider is under review
- local command failed because of validation or domain conflict

## Exit Rules
Exit offline when:
- network returns and refresh succeeds
- user navigates to a safe route
- offline action is saved to outbox and represented as queued
- sync succeeds
- sync fails and recovery is required
- auth expires and session expired state takes over
- authorization changes and not authorized state takes over
- server state conflicts and conflict state takes over

Exit targets:
- `ready`
- `loading`
- `stale_data`
- `error`
- `session_expired`
- `not_authorized`
- `queued_for_sync`
- `sync_failed`
- `sync_conflict`
- route-specific recovery state

## Cached Data Rules
Cached data must always be labeled.

Required cached marker:
- cached timestamp
- age
- source label when safe
- refresh action when online
- offline status text

Use:
```text
Showing saved data from 07:30. Some statuses may have changed.
```

Do not use:
```text
Live status
```

Cached data must not:
- hide that it is cached
- show restricted records after authorization changes
- show payment or custody as newly confirmed without server acceptance
- keep stale action buttons enabled when action safety depends on fresh data

## Offline Write Rules
Queued writes must be durable and transparent.

Every queued action must include:
- local action ID
- server idempotency key
- actor ID
- role
- delivery or assignment ID
- local timestamp
- operation name
- payload fingerprint
- safe display summary
- retry count
- sync status

Offline write copy:
```text
Saving this action on this device before sync.
```

Queued copy:
```text
Action saved for sync. It has not reached the server yet.
```

Sync success copy:
```text
Synced with the server.
```

Conflict copy:
```text
This saved action conflicts with the latest server record. Review before retrying.
```

## Actions Allowed Offline
Allowed only when backend and product policy support idempotent replay:
- station intake confirmation
- station dispatch preparation
- destination receipt confirmation
- driver pickup confirmation
- driver transit update
- driver handoff confirmation
- final-mile assignment acceptance
- courier out-for-delivery start
- proof metadata save
- proof upload retry after file is local
- failed attempt record where policy supports replay
- issue creation where policy supports replay

Never allow offline:
- payment initialization
- payment verification
- refund approval
- refund settlement
- admin override
- pricing update
- user access update
- station validation admin update
- webhook replay
- notification dispatch retry from browser
- public receiver OTP verification
- public tracking access creation
- destructive account action

## Visual System
Offline visuals should be noticeable but not alarming unless data safety is at risk.

Patterns:
- top offline banner for whole-app connectivity
- card notice for cached content
- action gate before offline-save command
- outbox strip for queued actions
- sync panel during reconnect
- conflict banner when sync fails due to server state
- admin blocked panel for online-only admin console

Color:
- amber for offline or queued
- blue for retry, refresh, or open outbox
- green only for server-confirmed sync success
- red for local store failure, sync failure, or conflict requiring review

Layout:
- keep cached content visible when safe
- keep route context visible
- keep role home navigation visible
- avoid hiding action history
- do not stack multiple offline banners; combine state into one clear hierarchy

## Accessibility Rules
Offline state must be perceivable and actionable.

Requirements:
- Use text labels, not color only.
- Announce connectivity change through polite status.
- Announce queued action creation.
- Announce sync success or conflict.
- Do not announce every reconnect poll.
- Keep focus stable when connectivity changes.
- Move focus only when an action the user started moves into conflict or failure.
- Buttons must have clear accessible names.
- Queued action counts must be text.
- Reduced motion must stop sync animation loops.
- Large text must not hide outbox counts.

Suggested announcements:
```text
You are offline. Showing saved data.
```

```text
Action saved for sync. It has not reached the server yet.
```

```text
Sync failed. Review this action before retrying.
```

## Privacy And Security Rules
Offline data is sensitive.

Rules:
- Mask sensitive payload summaries.
- Do not show raw proof metadata in list rows.
- Do not show raw scan code when not needed.
- Do not show receiver phone or full address in outbox rows.
- Do not show provider references.
- Do not store secrets in display summaries.
- Clear cached admin data on sign-out.
- Do not show cached protected data after authorization failure.
- Preserve local evidence until safe discard policy allows removal.
- Do not allow another user on the same device to see prior user's queued actions.

## Surface-Specific Behavior
### Public Web
Use offline state for:
- public tracking lookup cannot reach network
- service-area lookup cannot reach network
- public support submit cannot reach network

Rules:
- Static marketing content may remain visible.
- Dynamic lookup panels show offline state.
- No public command is saved offline.
- Offer retry when connection returns.

### Receiver Public Flow
Use offline state for:
- secure tracking link validation cannot reach network
- phone challenge request cannot reach network
- OTP verification cannot reach network
- timeline refresh cannot reach network

Rules:
- Do not verify OTP offline.
- Do not reveal tracking details beyond safe cached public content.
- Offer retry after reconnect.
- If a verified timeline is cached, mark it clearly as saved data.

### Sender Mobile App
Use offline state for:
- sender home cached delivery list
- delivery detail cached data
- timeline cached data
- notifications cached data
- create-delivery or payment route blocked while offline

Rules:
- Sender app is online-first.
- Do not create delivery offline.
- Do not start payment offline.
- Do not verify payment offline.
- Allow cached reads with stale marker.
- Offer retry and safe navigation.

### Station Operator Mobile App
Use offline state for:
- cached station queue
- intake action gate
- dispatch preparation gate
- destination receipt gate
- station issue creation gate
- local outbox status

Rules:
- Save allowed actions to outbox.
- Show station scope.
- Show queued action count.
- Do not mark custody as server-confirmed while queued.
- Open offline outbox for pending actions.

### Driver Mobile App
Use offline state for:
- cached assigned runs
- pickup action gate
- transit update gate
- handoff action gate
- issue creation gate
- local outbox status

Rules:
- Preserve assignment context.
- Queue allowed commands with stable idempotency key.
- Do not mark handoff as final while queued.
- Show recovery route for conflicts.

### Final-Mile Courier Mobile App
Use offline state for:
- cached job list
- acceptance gate
- out-for-delivery gate
- proof metadata save
- proof upload deferred
- completion gate
- failed attempt gate
- local outbox status

Rules:
- Capture proof metadata before queueing completion.
- Store local file reference for deferred upload.
- Do not mark delivery complete until policy allows and required proof metadata exists.
- Receiver notifications wait until server confirmation.

### Admin Web Console
Use offline state for:
- lost connection while on admin web
- failed online-only admin refresh due connectivity

Rules:
- Admin web is online-only.
- Do not allow admin mutations offline.
- Do not allow export offline.
- Preserve safe visible page shell.
- Block sensitive actions until online.
- Clear protected cached data on sign-out.

## Component Contract
### `SharedOfflineState`
Required props:
```ts
type SharedOfflineStateProps = {
  mode:
    | "offline_no_cache"
    | "offline_cached_read"
    | "offline_action_allowed"
    | "offline_action_blocked"
    | "queued_for_sync"
    | "syncing_after_reconnect"
    | "sync_succeeded"
    | "sync_failed"
    | "sync_conflict"
    | "local_store_error"
    | "metered_connection"
    | "admin_offline_blocked";
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
  cachedAt?: string;
  queuedActionCount?: number;
  oldestQueuedActionAt?: string;
  canSaveForSync?: boolean;
  canOpenOutbox?: boolean;
  canRetryWhenOnline?: boolean;
  primaryAction?: {
    label: string;
    onPress: () => void;
    testId: string;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    testId: string;
  };
  testId?: string;
};
```

Implementation notes:
- `cachedAt` is required for `offline_cached_read`.
- `queuedActionCount` is required for queued and sync modes.
- `canSaveForSync` must come from route policy, not button presence.
- Admin web cannot set `canSaveForSync`.

### `OfflineBanner`
Use for whole-screen connectivity state.

Required behavior:
- Show current connection state.
- Do not block content when cached content remains safe.
- Collapse with outbox strip when both exist.

### `CachedDataNotice`
Use near cached content.

Required behavior:
- Show cached timestamp.
- Explain that status may have changed.
- Offer refresh only when online.

### `OfflineActionGate`
Use before offline-save action.

Required behavior:
- Explain local save.
- Explain server confirmation pending.
- Require explicit user action.
- Preserve idempotency key.

### `OutboxStatusStrip`
Use when queued actions exist.

Required behavior:
- Show queued count.
- Show oldest age.
- Link to offline outbox.
- Mark failures and conflicts clearly.

### `ReconnectProgressPanel`
Use while syncing after reconnect.

Required behavior:
- Show count being synced.
- Block duplicate commands for same target.
- Move to success, failure, or conflict.

## Data And API Integration
Offline state depends on connectivity, cache, and local store.

For RTK Query:
- existing cached data plus failed network fetch maps to `offline_cached_read` or stale data.
- no cached data plus offline maps to `offline_no_cache`.
- background refresh failure while online maps to error, not offline.

For outbox:
- local write in progress maps to loading.
- local write success maps to `queued_for_sync`.
- replay in progress maps to `syncing_after_reconnect`.
- replay success maps to `sync_succeeded`.
- replay conflict maps to `sync_conflict`.
- replay failure maps to `sync_failed`.
- local storage failure maps to `local_store_error`.

For uploads:
- local proof metadata is saved first.
- media upload may be deferred.
- upload defer maps to offline queued or proof upload pending state.
- completion cannot be final until proof requirements are satisfied.

## Copy Matrix
| Context | Mode | Title | Body | Primary Action |
| --- | --- | --- | --- | --- |
| Sender cached home | `offline_cached_read` | `You are offline` | `Showing saved delivery data. Some statuses may have changed.` | `Retry when online` |
| Sender payment | `offline_action_blocked` | `Payment needs connection` | `Connect to the internet before starting or checking payment.` | `Retry` |
| Receiver verification | `offline_action_blocked` | `Connection needed` | `Connect to verify this tracking access.` | `Retry` |
| Station queue | `offline_cached_read` | `Station queue saved on this device` | `Review saved queue data, then refresh when connection returns.` | `Open offline outbox` |
| Station intake | `offline_action_allowed` | `Save intake for sync` | `This records intake on this device. It is not server-confirmed until sync succeeds.` | `Save for sync` |
| Driver handoff | `offline_action_allowed` | `Save handoff for sync` | `This handoff will wait in the outbox and must sync before it is server-confirmed.` | `Save for sync` |
| Courier proof | `offline_action_allowed` | `Save proof for sync` | `Proof details will be saved on this device before upload continues.` | `Save proof` |
| Sync pending | `queued_for_sync` | `Action waiting to sync` | `Open the outbox to review actions that have not reached the server.` | `Open outbox` |
| Sync conflict | `sync_conflict` | `Saved action needs review` | `The server record changed before this action synced. Review before retrying.` | `Open recovery` |
| Admin offline | `admin_offline_blocked` | `Admin console is offline` | `Reconnect to continue admin work. Offline admin changes are not allowed.` | `Retry connection` |

## Analytics Events
Track offline reliability without leaking sensitive payloads.

Recommended events:
- `offline_state_viewed`
- `cached_data_notice_viewed`
- `offline_action_gate_viewed`
- `offline_action_saved`
- `offline_action_blocked`
- `outbox_strip_clicked`
- `sync_started`
- `sync_succeeded`
- `sync_failed`
- `sync_conflict`
- `local_store_error_viewed`
- `metered_connection_notice_viewed`

Required fields:
- `surface`
- `mode`
- `routeName`
- `actorRole`
- `operationName`
- `hasCachedData`
- `cachedAgeMs`
- `queuedActionCount`
- `oldestQueuedAgeMs`
- `resultState`

Do not send:
- full payload
- raw scan code
- proof file data
- receiver phone
- receiver address
- provider references
- secrets

## QA Acceptance Criteria
General:
- Offline state appears when connectivity is unavailable or route policy says offline action is active.
- Cached content is marked with timestamp.
- Online-only actions are blocked while offline.
- Offline-allowed actions show explicit save-for-sync copy.
- Queued actions are not shown as server-confirmed.
- Outbox count and oldest age appear where available.
- Sync success, failure, and conflict are distinct.
- Admin web blocks offline mutations.

Mobile:
- Offline banner does not cover primary content permanently.
- Offline action gate uses large tap targets.
- Proof metadata is preserved when upload is deferred.
- Queued handoff does not mark custody final.
- Reconnect sync prevents duplicate command submit.

Public and receiver:
- OTP verification is blocked offline.
- Public tracking cached content is privacy-safe.
- No internal data appears in offline copy.

Admin:
- Offline admin changes are not allowed.
- Filters and page shell may remain visible.
- Sensitive cached data clears on sign-out.

## Unit Test Requirements
Tests must cover:
- all offline modes render
- cached mode requires cached timestamp
- queued mode requires queued count
- admin cannot save for sync
- sender payment offline action is blocked
- receiver OTP offline action is blocked
- station intake save-for-sync action renders only when policy allows
- driver handoff queued state does not show confirmed copy
- courier proof deferred state preserves proof metadata label
- sync conflict routes to recovery
- local store failure blocks critical command

## Component Test Requirements
Use component tests for:
- sender cached read offline
- sender online-only payment blocked offline
- receiver verification blocked offline
- station queue cached offline
- station intake offline action gate
- driver handoff offline action gate
- courier proof save for sync
- outbox status strip
- reconnect sync panel
- sync conflict banner
- admin offline blocked panel

Assertions:
- correct title and body
- cached timestamp visible
- queued count visible
- no server-confirmed copy for queued actions
- primary action exists only when allowed
- accessible announcement text exists
- reduced motion disables looping sync animation

## E2E Test Requirements
Critical journeys:
- Sender opens home offline and sees saved data marker.
- Sender tries payment offline and is blocked.
- Receiver tries OTP verification offline and is blocked.
- Station operator saves intake for sync and sees outbox row.
- Driver saves handoff for sync and does not see server-confirmed custody.
- Courier saves proof metadata while offline and sees upload pending state.
- Queued action syncs after reconnect and clears pending state.
- Queued action conflicts after reconnect and opens recovery.
- Admin loses connection and cannot submit admin mutation.

Network scenarios:
- cold offline with no cache
- offline with cache
- reconnect with queued action
- reconnect storm with repeated status changes
- metered connection before proof upload
- local store write failure
- session expiration before sync
- authorization change before sync

## Visual QA Checklist
Before closing implementation, inspect:
- mobile offline banner
- mobile cached data notice
- mobile offline action gate
- mobile outbox strip
- mobile sync progress
- mobile sync conflict
- sender cached home offline
- receiver blocked verification offline
- admin offline blocked panel
- large text
- reduced motion
- screen reader announcements
- one-handed mobile reachability

The offline UI should pass the five-role critique:
- Founder: the product is credible for weak-network delivery work.
- Skeptical customer: cached status is clearly labeled and not overpromised.
- Operator: local work and server confirmation are impossible to confuse.
- Accessibility reviewer: connectivity and sync state are announced clearly.
- Creative director: the design is serious and restrained, not decorative.

## Implementation Sequence For Claude Code
Build in this order:
1. Add offline mode types in shared frontend contract location.
2. Add route-level offline policy map.
3. Implement `SharedOfflineState`.
4. Implement `OfflineBanner`.
5. Implement `CachedDataNotice`.
6. Implement `OfflineActionGate`.
7. Implement `OutboxStatusStrip`.
8. Implement `ReconnectProgressPanel`.
9. Wire sender cached reads.
10. Wire station, driver, and courier offline action gates.
11. Wire local outbox status.
12. Wire sync success, failure, and conflict states.
13. Wire admin online-only block.
14. Add unit tests.
15. Add component tests.
16. Add critical E2E tests.

Do not build offline behavior separately in each screen before shared policy and shared components exist.

## Route Integration Checklist
Each screen spec that references `offline` must specify:
- whether the surface is online-first, offline-assisted, or online-only
- whether cached data may be shown
- where cached timestamp renders
- which actions are blocked offline
- which actions can save for sync
- required idempotency key behavior
- outbox route
- sync success destination
- sync conflict destination
- sensitive fields forbidden in offline display
- analytics event name
- test ID suffix

If a screen cannot answer these items, its offline behavior is incomplete.

## Test IDs
Required shared test IDs:
- `state-offline`
- `state-offline-title`
- `state-offline-body`
- `state-offline-banner`
- `state-offline-cached-notice`
- `state-offline-action-gate`
- `state-offline-outbox-strip`
- `state-offline-sync-panel`
- `state-offline-conflict`
- `state-offline-retry`
- `state-offline-open-outbox`
- `state-offline-save-for-sync`
- `state-offline-admin-blocked`

Mode-specific test ID pattern:
```text
state-offline-{mode}
```

Surface-specific test ID pattern:
```text
state-offline-{surface}-{mode}
```

## Failure Modes To Prevent
The implementation must prevent:
- queued action shown as server-confirmed
- payment started offline
- OTP verified offline
- admin mutation offline
- proof completion without required metadata
- custody finalization before sync success
- hidden queued actions
- cached data shown without timestamp
- sensitive payload in outbox row
- local store failure ignored
- duplicate replay after reconnect
- conflict retried without review
- protected cached data shown after role change
- heavy visual dependency on low-bandwidth paths

## Definition Of Done
This shared offline state is complete when:
- all offline modes exist
- route offline policy exists
- cached data is always marked
- station, driver, and courier allowed actions can save to outbox
- sender, receiver, public, and admin online-only actions are blocked correctly
- queued actions are visibly pending server sync
- sync success, failure, and conflict are distinct
- proof metadata and local file references are protected
- sensitive outbox details are masked
- admin web is online-only
- unit, component, and E2E tests cover critical offline paths
- visual QA passes mobile, admin web, large text, reduced motion, and screen reader checks

