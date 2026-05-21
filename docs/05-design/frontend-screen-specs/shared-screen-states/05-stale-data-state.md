# Stale Data State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `stale_data` |
| Component family | Shared screen state |
| Primary component | `SharedStaleDataState` |
| Supporting components | `FreshnessBadge`, `StaleDataBanner`, `RefreshActionStrip`, `RecordChangedNotice`, `SourceFreshnessPanel`, `StaleActionGate`, `RefreshResultAnnouncement` |
| Primary surfaces | sender mobile app, operations mobile app, receiver public flow, public web, admin web console |
| Required recovery | refresh action and timestamp |
| Test id root | `state-stale-data` |
| Backend coverage | None directly; reflects cache age, backend snapshot time, invalidated cache, refresh failure with previous data, or changed source data |
| Browser mutation operation | None |
| Data sensitivity | generated timestamp, cached timestamp, refresh timestamp, source label, operation name, safe record label |
| Offline critical | Yes for sender cached reads and operations mobile cached queues; admin web can show stale read-only data but must block sensitive actions |
| Related inventory state | `stale_data` |
| Related state specs | loading, empty, error, offline, not authorized, session expired, custody not confirmed, payment under review |
| Design tokens | `warning.amber.600`, `brand.blue.600`, `danger.red.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear freshness text, non-color status, and refresh announcements |

## Purpose
`SharedStaleDataState` defines how Kra communicates that visible data may be outdated, which information remains useful, which actions require a refresh, and how the user can recover current status.

The stale data state must answer:
- `How old is this information?`
- `Where did it come from?`
- `Is the data still safe to read?`
- `Which actions are blocked until refresh?`
- `Which actions remain safe?`
- `What changed after refresh?`
- `What if refresh fails?`
- `How does the UI avoid confusing stale data with live truth?`

The most important rule is:
```text
Stale data may be readable, but it must not authorize risky action without a freshness check.
```

## Product Job
Kra delivery workflows depend on current truth. A sender, station operator, driver, courier, receiver, or admin may still benefit from saved information, but stale data can become dangerous when it affects payment, custody, proof, assignment, or issue decisions.

The stale data system must:
- keep previously loaded content visible when it is safer than blanking the screen
- label stale content with clear timestamp
- tell users what may have changed
- offer refresh without losing context
- block actions that require current server state
- preserve filters and scroll position during refresh
- show a changed-record notice when refreshed data differs from cached data
- avoid treating stale cache as fresh backend truth

## Strategic Role
Stale data sits between speed and correctness.

Speed:
- cached station queues help field users orient fast
- cached sender timelines reduce blank screens on weak networks
- cached admin list rows preserve context during refresh
- cached receiver timelines can remain useful as read-only status

Correctness:
- package custody can change after the cache was saved
- payment can move from pending to confirmed or failed
- an issue can lock a delivery
- assignment can move from one actor to another
- station readiness can change before launch decisions
- refund or reconciliation evidence can change during review

The UI must keep speed without pretending old data is current.

## External Research Used
Only directly relevant cache freshness, stale state, and accessible update references were used:
- [RTK Query automated re-fetching](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching): supports cache invalidation, active subscription refetching, and tag-driven freshness behavior for the planned frontend stack.
- [TanStack Query important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults): supports the concept that cached query data may become stale and should be refreshed intentionally.
- [web.dev offline data](https://web.dev/learn/pwa/offline-data): supports on-device storage and cached data management for unreliable network conditions.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, updated results, and changed status without unexpected focus movement.

## Visual Thesis
Stale data should feel like an operations board with an amber timestamp: still useful for orientation, but visibly not live.

Use:
- amber freshness badges
- clear timestamp
- subtle refresh strip
- changed-record notice after successful refresh
- disabled risky actions with reason
- stable content while refresh runs
- concise copy

Do not use:
- hidden stale status
- green success styling for stale values
- full-page blocking when read-only context is useful
- refresh loops that steal attention
- vague "out of date" copy without timestamp
- enabling custody, payment, proof, refund, or launch actions on stale data

## Audience
Primary users:
- sender reviewing delivery, payment, notification, timeline, receipt, or issue status
- receiver reviewing public tracking timeline
- station operator reviewing cached queue or handoff evidence
- driver reviewing cached assignments or route details
- final-mile courier reviewing cached job and proof context
- admin reviewing stale dashboard, list, audit, finance, issue, station, user, webhook, analytics, or export context

Secondary users:
- support staff explaining why a user must refresh
- ops lead checking queue age
- QA validating cache invalidation and refresh
- accessibility reviewer validating status announcement
- backend engineer validating no stale state mutation assumptions
- Claude Code implementing shared components later

Non-users:
- webhook provider
- scheduled task
- unauthenticated attacker
- payment provider

## Non-Goals
Do not use stale data state for:
- initial loading with no usable data
- empty resolved response
- offline with no network
- request failure with no usable previous data
- permission denial
- expired session
- rate limit
- blocked payment
- payment under review
- refund pending
- manual review required
- custody conflict
- scan mismatch
- proof required
- OTP required

If the user cannot safely see cached content, render another state.

## Stale Data Taxonomy
Kra must separate stale cases by risk and recovery.

| Mode | Meaning | Primary Recovery |
| --- | --- | --- |
| `soft_stale_read` | data is older than preferred freshness but read-only use is safe | show timestamp and refresh |
| `hard_stale_read` | data is old enough that decisions should wait | prompt refresh before acting |
| `stale_after_refresh_failure` | refresh failed but previous data remains visible | show stale banner and retry |
| `stale_during_background_refresh` | content remains visible while refresh runs | show refresh strip |
| `record_changed_after_refresh` | refreshed data differs from cached view | show changed notice and require review |
| `stale_action_blocked` | user attempted risky action from stale context | block action and require refresh |
| `source_partially_stale` | one source is stale while other sources are fresh | mark source and retry source |
| `stale_offline_cache` | cache is stale and device is offline | combine stale marker with offline state rules |
| `stale_admin_snapshot` | admin snapshot is too old for operational decision | prompt refresh and block sensitive action |
| `stale_assignment_scope` | assignment or station scope may have changed | refresh assignments or station scope before action |

## Freshness Inputs
Freshness can come from:
- backend `generatedAt`
- backend `updatedAt`
- backend event timestamp
- local cache write time
- RTK Query fulfilled timestamp
- local outbox status timestamp
- last successful refresh time
- last failed refresh time
- explicit backend stale marker when available later

Do not derive freshness from:
- browser render time alone
- list sort order alone
- client guess about package movement
- notification read time
- user scrolling or screen focus

## State Machine
Read cache path:
```text
ready
  -> cache_age_exceeds_soft_threshold
  -> soft_stale_read
  -> refresh
  -> refreshing
  -> ready | stale_after_refresh_failure | record_changed_after_refresh
```

Hard stale action path:
```text
soft_stale_read
  -> cache_age_exceeds_hard_threshold
  -> hard_stale_read
  -> user_attempts_risky_action
  -> stale_action_blocked
  -> refresh
  -> ready | error | offline
```

Background refresh path:
```text
ready
  -> stale_during_background_refresh
  -> ready | stale_after_refresh_failure | record_changed_after_refresh
```

Offline stale path:
```text
offline_cached_read
  -> cache_age_exceeds_threshold
  -> stale_offline_cache
  -> reconnect
  -> refresh
  -> ready | sync_conflict | error
```

## Entry Rules
Enter stale data when:
- cached data is visible and age exceeds the screen threshold
- RTK Query cache is invalidated but still visible
- a refresh failed and previous data remains on screen
- a backend snapshot timestamp is older than allowed for the screen
- refreshed data differs from cached values and the user must review changes
- a user attempts a risky action from a stale context
- one source in a multi-source screen has not refreshed
- device is offline and cached content is older than the safe read threshold

Do not enter stale data when:
- there is no usable cached data
- user is offline and no cached content exists
- user is not authorized
- session expired
- current data is fresh
- backend returned a domain blocker
- refresh is still initial loading with no prior content

## Exit Rules
Exit stale data when:
- refresh succeeds and data is current
- user accepts changed-record review and current data is rendered
- user navigates away
- offline state replaces stale cached view
- error state replaces failed refresh with no usable cache
- not authorized or session expired replaces view
- stale action is blocked and user refreshes successfully

Exit targets:
- `ready`
- `loading`
- `refreshing`
- `error`
- `offline`
- `not_authorized`
- `session_expired`
- route-specific changed-record review state

## Freshness Threshold Rules
Freshness thresholds are product safety rules, not backend service-level targets.

Default thresholds:
- `soft_stale`: show visible stale marker after `60 seconds` for operational queues.
- `hard_stale`: block risky operational action after `5 minutes` for custody, assignment, proof, payment, refund, issue, station readiness, launch, and admin override contexts.
- `critical_decision_stale`: block decision immediately when a refresh has already revealed changed values.

Screen-specific thresholds may override defaults:
- launch readiness can show stale after `5 minutes` and strong warning after `15 minutes`.
- station queue can show stale quickly when offline or after failed refresh.
- sender timeline can remain read-only stale longer but must mark age.
- receiver public timeline must remain privacy-safe and mark saved status.
- admin finance, refund, reconciliation, user access, pricing, and issue actions require fresh context before mutation.

## Action Safety Rules
Actions that must be blocked on stale data:
- custody handoff
- intake confirmation
- dispatch confirmation
- destination receipt
- final-mile assignment
- delivery completion
- proof confirmation
- OTP completion
- payment initialization from stale quote
- payment verification decision
- refund approval
- refund settlement
- pricing rule update
- user access update
- station validation save
- launch readiness decision
- admin override
- webhook replay if supported later
- export if data scope changed and needs fresh query

Actions that may remain allowed:
- read detail
- view timeline
- view cached queue
- copy safe tracking code
- open support
- open issue detail
- refresh
- clear filters
- safe navigation
- open offline outbox

## Copy Rules
Stale copy must include age or timestamp.

Use:
- `Showing saved data from 07:30. Refresh before acting.`
- `This queue may be outdated. Refresh to check the latest station workload.`
- `This evidence changed since you opened the page. Review the refreshed values before acting.`
- `Current rows remain visible, but refresh failed.`
- `Refresh assignments before confirming this handoff.`

Do not use:
- `Live`
- `Current`
- `Up to date`
- `Fresh`
- `Probably current`
- vague `Data is old` without age or refresh action

## Visual System
Use stale markers close to the affected data.

Approved patterns:
- timestamp chip near page heading
- source freshness panel for admin and operations dashboards
- inline stale badge on section card
- top banner only for whole-page stale risk
- changed-record notice near action area
- disabled action with refresh requirement
- refresh action strip beside timestamp

Do not:
- cover the entire page when read-only content remains useful
- hide stale marker inside tooltip only
- show stale marker only by color
- move rows while refresh is in progress
- erase filters during refresh
- use success color for stale values

## Accessibility Rules
Stale state must be announced without disrupting the user's work.

Requirements:
- Stale marker must include visible text.
- Timestamp must be machine-readable where platform supports it.
- Refresh button must have a clear accessible name.
- Refresh success and refresh failure must use a status region.
- Changed-record notice must be announced when it affects user action.
- Do not announce every poll.
- Do not move focus when data merely becomes soft stale.
- Move focus to changed-record notice only after user-triggered refresh changes actionable data.
- Disabled risky actions must explain why.
- Large text must not truncate timestamp or refresh action.

Suggested status copy:
```text
Data may be outdated. Last updated at 07:30.
```

```text
Refresh complete. Review changed values before acting.
```

## Privacy Rules
Stale state must follow the privacy level of the current surface.

Public and receiver:
- show safe cached timestamp only
- do not reveal sender, staff, provider, audit, or payment internals
- do not confirm hidden records changed

Sender:
- show delivery-safe timeline and payment labels only
- do not show internal custody IDs or provider references

Operations mobile:
- show station or assignment scope if authorized
- hide receiver private details unless current screen already permits them
- hide raw proof and scan details from stale banners

Admin:
- may show safe source labels and request IDs where applicable
- must not show secrets, provider payloads, or stale protected data after auth change

## Security Rules
Stale data must fail safe for privileged actions.

Rules:
- Revalidate authorization before showing stale protected content after app resume.
- Clear stale data on sign-out.
- Do not show cached admin data after role changes.
- Do not run stale-context mutation without refresh.
- Do not let stale assignment scope authorize staff action.
- Do not let stale payment state authorize transport movement.
- Do not let stale issue state hide active issue locks.
- Do not let stale proof state complete delivery.

## Surface-Specific Behavior
### Public Web
Use stale state for:
- cached service-area content
- cached public tracking result
- cached public status section

Rules:
- Keep copy safe and non-technical.
- Offer refresh.
- Do not show internal source labels.
- Do not claim live status.

### Receiver Public Flow
Use stale state for:
- cached receiver-safe timeline
- public tracking status after failed refresh
- verified link timeline after app resume

Rules:
- Mark saved timestamp.
- Keep receiver-safe privacy.
- Refresh before showing any new sensitive transition.
- Do not show staff, sender, or provider detail.

### Sender Mobile App
Use stale state for:
- sender home cached list
- delivery detail
- tracking timeline
- receipt detail
- notifications
- support thread

Rules:
- Read-only stale viewing is allowed.
- Create delivery, payment, issue, refund, cancellation, and profile save require current state.
- Payment and quote decisions require refresh.
- Stale timeline must not imply live package movement.

### Station Operator Mobile App
Use stale state for:
- station overview queue
- intake queue
- outbound queue
- inbound queue
- final-mile queue
- handoff log
- blocked queue

Rules:
- Keep cached queues visible.
- Mark age clearly.
- Block custody or station mutations until refresh or offline policy applies.
- Open offline outbox if queued actions may affect freshness.

### Driver Mobile App
Use stale state for:
- assigned runs
- route details
- handoff context
- custody chain
- issue context

Rules:
- Refresh assignments before handoff or pickup confirmation.
- Do not use stale assignment to authorize action.
- If offline and queued policy applies, show offline state plus stale marker.

### Final-Mile Courier Mobile App
Use stale state for:
- job list
- route details
- proof context
- failed attempt context
- earnings period

Rules:
- Refresh before proof completion or failed-attempt submit unless offline policy allows local save.
- Earnings stale state must show selected period and timestamp.
- Do not show delivery complete from stale proof context.

### Admin Web Console
Use stale state for:
- overview snapshot
- launch readiness
- delivery explorer
- package detail
- station detail
- user detail
- pricing rules
- finance summary
- payment reconciliation
- refund evidence
- issue queue and detail
- audit events
- webhook events
- analytics
- export report configuration

Rules:
- Preserve filters and current rows.
- Show generated or refreshed timestamp.
- Disable high-impact mutations until fresh.
- Use source freshness panel for multi-source views.
- Show changed-record notice after refresh differences.

## Component Contract
### `SharedStaleDataState`
Required props:
```ts
type SharedStaleDataStateProps = {
  mode:
    | "soft_stale_read"
    | "hard_stale_read"
    | "stale_after_refresh_failure"
    | "stale_during_background_refresh"
    | "record_changed_after_refresh"
    | "stale_action_blocked"
    | "source_partially_stale"
    | "stale_offline_cache"
    | "stale_admin_snapshot"
    | "stale_assignment_scope";
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
  staleAt: string;
  lastRefreshAttemptAt?: string;
  sourceLabel?: string;
  affectedActionLabel?: string;
  canRefresh: boolean;
  onRefresh?: () => void;
  refreshLabel?: string;
  canContinueReadOnly?: boolean;
  testId?: string;
};
```

Implementation notes:
- `staleAt` is required for all modes.
- `onRefresh` and `refreshLabel` are required when `canRefresh` is true.
- `affectedActionLabel` is required for `stale_action_blocked`.
- `sourceLabel` must be safe for the current surface.
- Public and receiver surfaces must not show internal source names.

### `FreshnessBadge`
Use near the affected data.

Required behavior:
- show fresh, refreshing, stale, or failed-refresh text
- include timestamp
- use text plus color
- never label stale data as live

### `StaleDataBanner`
Use for whole-page stale risk.

Required behavior:
- explain age
- offer refresh
- avoid hiding content
- avoid duplicate banners when a section marker is enough

### `RecordChangedNotice`
Use after refresh changes values that matter.

Required behavior:
- identify that source changed
- require user review before action
- link to changed section when possible
- do not expose restricted fields

### `StaleActionGate`
Use when user attempts risky action from stale context.

Required behavior:
- block the action
- explain refresh requirement
- provide refresh action
- preserve form and route context

## Data And API Integration
For RTK Query:
- `isFetching` with cached data maps to `stale_during_background_refresh` when data has exceeded freshness threshold.
- invalidated cache with active subscription maps to refresh in progress.
- failed refetch with previous data maps to `stale_after_refresh_failure`.
- successful refetch updates timestamp and exits stale.
- successful refetch with changed actionable fields maps to `record_changed_after_refresh`.

For local cache:
- local cache write time determines display age when backend timestamp is absent.
- backend `generatedAt` or `updatedAt` wins over local write time when available.
- cache must be discarded or hidden after authorization failure.

For mutations:
- before high-impact submit, check freshness.
- if stale, block and render `stale_action_blocked`.
- after refresh, re-run validation against fresh data.

## Copy Matrix
| Context | Mode | Title | Body | Primary Action |
| --- | --- | --- | --- | --- |
| Sender timeline | `soft_stale_read` | `Timeline may be outdated` | `Showing saved tracking events from {time}. Refresh for the latest status.` | `Refresh` |
| Sender payment | `stale_action_blocked` | `Refresh before payment` | `The quote or payment state may have changed. Refresh before continuing.` | `Refresh` |
| Receiver timeline | `stale_offline_cache` | `Showing saved tracking status` | `This public status was saved at {time}. It may not include the latest event.` | `Refresh` |
| Station queue | `hard_stale_read` | `Station queue may be outdated` | `Refresh before confirming package movement.` | `Refresh queue` |
| Driver handoff | `stale_assignment_scope` | `Refresh assignment before handoff` | `Assignment or custody may have changed since this screen loaded.` | `Refresh assignment` |
| Courier proof | `stale_action_blocked` | `Refresh before completion` | `Proof or delivery state may have changed. Refresh before completing delivery.` | `Refresh` |
| Admin overview | `stale_admin_snapshot` | `Overview snapshot may be stale` | `Refresh before making operational decisions from this dashboard.` | `Refresh` |
| Admin refund evidence | `record_changed_after_refresh` | `Record changed` | `This evidence changed since you opened the page. Review the refreshed values before acting.` | `Review changes` |
| Admin refresh failure | `stale_after_refresh_failure` | `Refresh failed` | `Current rows remain visible, but they may be outdated.` | `Retry refresh` |

## Analytics Events
Track stale data where it affects trust, operations, or safety.

Recommended events:
- `stale_data_viewed`
- `stale_refresh_clicked`
- `stale_refresh_succeeded`
- `stale_refresh_failed`
- `stale_action_blocked`
- `record_changed_notice_viewed`
- `source_partially_stale_viewed`

Required fields:
- `surface`
- `mode`
- `routeName`
- `actorRole`
- `operationName`
- `sourceLabel`
- `cacheAgeMs`
- `freshnessThresholdMs`
- `blockedAction`
- `resultState`

Do not send:
- raw proof data
- raw scan codes
- full addresses
- full phone numbers
- provider payloads
- audit payloads
- token data

## QA Acceptance Criteria
General:
- Stale data always shows timestamp or age.
- Stale data is not labeled live or current.
- Refresh action is available when network and policy allow.
- High-impact actions are blocked when data is hard stale.
- Read-only navigation remains available where safe.
- Refresh failure keeps previous data visible with stale warning.
- Changed-record notice appears when refreshed data differs in actionable fields.
- Public and receiver stale copy is privacy-safe.
- Auth failure clears or hides stale protected data.

Mobile:
- stale marker remains visible on small screens.
- primary refresh action is reachable.
- stale action gate preserves form and route context.
- offline plus stale combines without duplicate banners.

Admin:
- filters and rows remain visible during refresh.
- source freshness panel shows each relevant data source.
- high-impact admin mutations require fresh context.
- changed-record notice blocks action until review.

## Unit Test Requirements
Tests must cover:
- all stale modes render
- `staleAt` is required
- refresh action required when `canRefresh` is true
- stale action gate requires affected action label
- public and receiver surfaces hide internal source labels
- hard stale blocks risky action
- soft stale allows read-only viewing
- refresh failure keeps previous data visible
- record changed notice renders
- auth failure clears stale protected content

## Component Test Requirements
Use component tests for:
- sender stale timeline
- sender stale payment gate
- receiver stale public timeline
- station stale queue
- driver stale assignment gate
- courier stale proof gate
- admin stale overview
- admin refresh failure with rows visible
- admin record changed notice
- source partially stale panel

Assertions:
- timestamp visible
- refresh action visible
- risky action blocked when expected
- safe read-only action remains available
- no restricted fields
- live region status exists for refresh result
- focus behavior matches trigger

## E2E Test Requirements
Critical journeys:
- Sender opens cached timeline and refreshes to latest events.
- Sender tries payment from stale quote and is blocked until refresh.
- Receiver sees saved public tracking status with timestamp.
- Station operator sees stale queue and refreshes before intake confirmation.
- Driver tries handoff from stale assignment and is blocked until refresh.
- Courier tries completion from stale proof context and is blocked until refresh.
- Admin overview stale snapshot blocks launch decision copy until refresh.
- Admin refund evidence refresh shows record changed notice.
- Admin list refresh fails and keeps previous rows with stale warning.

Network and state scenarios:
- stale after app resume
- stale after failed refresh
- stale while background refresh runs
- stale offline cache
- refresh success with no changes
- refresh success with changed values
- authorization change after stale cache
- hard stale action attempt

## Visual QA Checklist
Before closing implementation, inspect:
- mobile stale badge
- mobile stale action gate
- mobile stale plus offline marker
- admin source freshness panel
- admin record changed notice
- admin stale refresh failure
- public stale status
- receiver stale status
- large text
- reduced motion
- keyboard focus
- screen reader status announcement

The stale data UI should pass the five-role critique:
- Founder: speed improves without compromising trust.
- Skeptical customer: I know the status may not be latest.
- Operator: I cannot accidentally act on outdated package truth.
- Accessibility reviewer: freshness and refresh status are perceivable.
- Creative director: the design is restrained and operational, not noisy.

## Implementation Sequence For Claude Code
Build in this order:
1. Add stale data mode types in shared frontend contract location.
2. Add freshness threshold policy map by surface and route.
3. Implement `SharedStaleDataState`.
4. Implement `FreshnessBadge`.
5. Implement `StaleDataBanner`.
6. Implement `RefreshActionStrip`.
7. Implement `RecordChangedNotice`.
8. Implement `SourceFreshnessPanel`.
9. Implement `StaleActionGate`.
10. Wire RTK Query cache age and invalidation.
11. Wire refresh success and failure paths.
12. Wire high-impact action freshness gates.
13. Add privacy filters for public and receiver labels.
14. Add unit tests.
15. Add component tests.
16. Add critical E2E tests.

Do not add route-specific stale badges before shared freshness policy exists.

## Route Integration Checklist
Each screen spec that references `stale_data` must specify:
- freshness source
- soft threshold
- hard threshold
- affected data region
- timestamp format
- refresh operation
- actions allowed while stale
- actions blocked while stale
- changed-record comparison fields
- privacy limits
- analytics event name
- test ID suffix

If a screen cannot answer these items, its stale-data behavior is incomplete.

## Test IDs
Required shared test IDs:
- `state-stale-data`
- `state-stale-data-title`
- `state-stale-data-body`
- `state-stale-data-timestamp`
- `state-stale-data-refresh`
- `state-stale-data-badge`
- `state-stale-data-banner`
- `state-stale-data-action-gate`
- `state-stale-data-record-changed`
- `state-stale-data-source-panel`
- `state-stale-data-refresh-result`

Mode-specific test ID pattern:
```text
state-stale-data-{mode}
```

Surface-specific test ID pattern:
```text
state-stale-data-{surface}-{mode}
```

## Failure Modes To Prevent
The implementation must prevent:
- stale data labeled as live
- missing timestamp
- high-impact mutation from stale context
- payment from stale quote
- handoff from stale assignment
- proof completion from stale proof context
- admin override from stale snapshot
- hiding refresh failure
- erasing filters on refresh
- blanking useful cached data unnecessarily
- exposing stale protected data after auth change
- repeated poll announcements
- changed values not reviewed before action

## Definition Of Done
This shared stale data state is complete when:
- all stale modes exist
- freshness thresholds are explicit
- timestamps are visible
- refresh actions are wired
- refresh failure preserves useful old data with warning
- changed-record notice blocks risky action until review
- high-impact actions require fresh context
- public and receiver variants are privacy-safe
- admin source freshness is visible
- unit, component, and E2E tests cover critical stale paths
- visual QA passes mobile, admin web, large text, reduced motion, keyboard, and screen reader checks

