# CourierHome Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierHome` |
| Route | `/(ops)/courier/home` |
| Primary test ID | `screen-courier-home` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `list_deliveries` with final-mile courier assignment scope |
| Offline critical | Yes, read cached |
| Required role | `final_mile_courier` |
| Primary data source | `GET /v1/deliveries` through route key `list_deliveries` |
| Related routes | `/(auth)/courier/sign-in`, `/(ops)/courier/assignments`, `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/accept-scan`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/courier/issues`, `/(ops)/courier/completed`, `/(ops)/courier/earnings`, `/(ops)/offline-outbox` |
| Current implementation mode | Contract-backed courier work home with cache-first read behavior and no home-screen mutation |

## Product Job
`CourierHome` is the final-mile courier command center after sign-in.

It answers five field questions in one glance:

- `What doorstep job is assigned to me now?`
- `Do I need to accept custody, start delivery, complete proof, or record a failed attempt?`
- `What deadline can make this job fail?`
- `Is my work data fresh or cached?`
- `Can I continue safely if network quality drops?`

The screen must help a courier move from sign-in to assigned doorstep work without guessing, calling the station, or opening unrelated screens first.

## Product Standard
This screen is part of the custody-control system. It is not a decorative dashboard.

The courier should be able to:

- See the most urgent assigned doorstep job first.
- Know whether the next action is accept scan, out for delivery, proof capture, failed attempt, return to station, or support.
- Open the exact next workflow with one thumb action.
- See acceptance and out-for-delivery deadlines when derivable.
- See offline cache age and queued action status.
- Reach issue support without losing delivery context.
- Avoid acting on stale, unassigned, or already completed jobs.

The screen must never:

- Show jobs assigned to another courier.
- Let a courier self-assign work.
- Treat station assignment as custody transfer.
- Let the home screen call `accept_final_mile_assignment`, `mark_out_for_delivery`, `complete_delivery`, or `record_failed_attempt`.
- Expose receiver phone, full address, OTP, package scan code, proof asset references, or exact GPS data in the first viewport.
- Present route optimization or live ETA as available if backend does not provide it.
- Hide offline queue conflicts.
- Claim a queued offline action has reached the server.

## Audience
Primary audience:

- Final-mile couriers handling doorstep delivery after station assignment.

Secondary audience:

- Destination station operators watching courier progress.
- Support staff reviewing stuck assignments.
- QA validating courier scope, offline read behavior, and route integrity.
- Security reviewers validating receiver data minimization.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may be:

- At the destination station before accepting custody.
- Standing beside station staff while scanning a package.
- Walking to a vehicle or motorbike.
- Near the receiver address with weak network.
- In daylight glare or low-light conditions.
- Returning after backgrounding the app.
- Recovering from a failed sync or queued action.

The screen must be compact, high contrast, and direct. It should feel like a field cockpit for doorstep work: current job, next move, deadline, and data authority.

## Design Brief
User and job:

- A verified courier needs to start or continue assigned doorstep work safely.

Context:

- Urgent, receiver-facing, proof-sensitive, custody-sensitive, mobile, and connectivity-variable.

Entry point:

- Successful courier sign-in.
- Role home shortcut.
- Bottom tab.
- Push notification for assigned final-mile work.
- Return from accept scan, route, proof, failed-attempt, support, or offline outbox.

Success state:

- Courier knows the active job, next action, deadline, and sync state.
- Courier can open the right next workflow without searching.
- Courier cannot see or mutate unrelated deliveries.

Primary action:

- Continue the next required courier step.

Navigation model:

- Top-level courier operations home.

Density level:

- Balanced and operational. More focused than a queue, richer than a launcher.

Visual thesis:

- `Doorstep cockpit`: a strong current-job card, proof-readiness rail, deadline strip, and rugged offline status with minimal decoration.

Restraint rule:

- Do not turn home into a route map, proof capture flow, earnings screen, or issue console. Route to those screens after answering what matters now.

## External Research Used
Only directly relevant sources were used:

- [Uber Help: accepting delivery requests](https://help.uber.com/en/driving-and-delivering/article/accepting-delivery-requests?nodeId=9e850637-8906-49b9-8a74-a4234460fb08): supports a courier home pattern where online status and delivery requests are visible before acceptance, with time-sensitive accept behavior.
- [DoorDash Dasher Support](https://help.doordash.com/en-us/dashers): supports courier apps grouping acceptance, completion, earnings, support, and troubleshooting into clear operational categories.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local data as the UI read source, explicit sync state, and recovery after reconnect.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh, stale-cache, queued-action, and status updates.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large targets for field actions and one-handed operation.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/01-ops-role-home.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/15-station-final-mile-queue.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/package-statuses.md`
- `docs/08-security/authorization-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/firestore/repositories.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`

## Backend Contract
Current backend read:

- Operation key: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Auth scope: authenticated.
- Courier scope: repository filters by `assignedFinalMileCourierId == principal.userId`.
- Sorting: `latestEvent.occurredAt desc`.
- Supported filters: `status`, `paymentStatus`, `limit`.
- Default limit: `50`.
- Response schema: `deliveryListResponseSchema`.

Fields available today per row:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId` when present
- `doorstepRequested`

Important backend behavior:

- `list_deliveries` for `final_mile_courier` already scopes to assigned courier ID.
- `assigned_for_final_mile` means station assigned the job, but custody is not yet courier-held.
- `accept_final_mile_assignment` is the custody transfer mutation and belongs to the accept-scan screen.
- `mark_out_for_delivery` belongs to the out-for-delivery screen.
- `complete_delivery` belongs to proof completion screens.
- `record_failed_attempt` belongs to failed-attempt screen.

Current backend limitations:

- `list_deliveries` does not return assignment creation timestamp.
- `list_deliveries` does not return acceptance deadline.
- `list_deliveries` does not return out-for-delivery deadline.
- `list_deliveries` does not return receiver address or landmark; detail route is needed.
- `list_deliveries` does not return open issue count.
- `list_deliveries` does not return proof readiness.
- `list_deliveries` does not return route distance, route order, or live navigation state.
- `list_deliveries` does not return whether package scan has been verified locally.

Implementation decision for v1:

- CourierHome must be implementable from `list_deliveries` plus local cached detail summaries.
- It may show exact receiver instruction readiness only when a cached `CourierAssignmentDetail` summary exists.
- It must not fabricate deadline timestamps.
- It must show policy-derived urgency as guidance when exact backend deadlines are missing.
- It must route to detail, accept scan, out-for-delivery, proof, failed attempt, or issues when exact action data is needed.

Future backend improvement:

- Add `GET /v1/courier/home` or extend `list_deliveries` with courier-safe fields:
  - `assignedAt`
  - `acceptanceDueAt`
  - `acceptedAt`
  - `outForDeliveryDueAt`
  - `attemptCount`
  - `proofRequired`
  - `proofOptions`
  - `addressReadiness`
  - `safeLandmarkLabel`
  - `openIssueCount`
  - `nextAction`
  - `nextActionDueAt`
  - `offlineSafeUntil`

Claude Code must not block implementation waiting for that endpoint.

## Authorization Rules
Required principal:

- `role === "final_mile_courier"`.

Courier scope:

- Use only deliveries returned by `list_deliveries`.
- Do not request station queues.
- Do not request driver runs.
- Do not request admin queues.
- Do not request other courier rosters.

Role failure:

- If role is missing, stale, or not `final_mile_courier`, clear courier workspace cache and route to `/(auth)/courier/sign-in`.

Station ID:

- Courier principal does not require station ID.
- UI must not infer station authority from courier session.

Privacy:

- Do not show receiver phone.
- Do not show full receiver address.
- Do not show OTP.
- Do not show exact GPS coordinates.
- Do not show package scan code.
- Do not show proof asset IDs.
- Do not show internal staff IDs.

## Doorstep Policy Contract
Doorstep facts from local policy:

- Doorstep delivery is v1 pilot scope.
- Doorstep delivery is available only after confirmed destination-station receipt.
- Service area is within `10km` of approved launch destination stations.
- Doorstep surcharge must already be collected before courier assignment.
- Courier must accept or reject assignment within `15 minutes`.
- Once accepted, courier should move to `out_for_delivery` within `2 hours` unless reassigned.
- Default completion proof is OTP.
- Signature or delivery photo is fallback proof only.
- One reattempt is allowed within `24 hours`.
- After the second failed attempt, package returns to station pickup flow.
- No cash collection is allowed during final-mile completion.

UI interpretation:

- Show acceptance urgency for `assigned_for_final_mile`.
- Show start-delivery urgency after custody is accepted but status is not `out_for_delivery`.
- Show proof guidance for `out_for_delivery`.
- Show return-to-station route when local state or backend status indicates reattempt limit or return requirement.
- Do not show cash collection controls.
- Do not show arbitrary proof methods.

## Status To Next Action Model
| Current status | Courier-home meaning | Primary route | CTA |
| --- | --- | --- | --- |
| `assigned_for_final_mile` | Station assigned job; courier must accept custody by scan | `/(ops)/courier/assignments/:deliveryId/accept-scan` | `Accept by scan` |
| `out_for_delivery` | Courier is on doorstep leg; proof or failed attempt is next | `/(ops)/courier/assignments/:deliveryId/proof` | `Complete handoff` |
| `issue_reported` | Job is blocked by issue review | `/(ops)/courier/issues?deliveryId=<deliveryId>` | `Open issue` |
| `on_hold` | Job is paused | `/(ops)/courier/issues?deliveryId=<deliveryId>` | `Review hold` |
| `awaiting_receiver_pickup` | Returned to station pickup flow | `/(ops)/courier/completed` or detail | `View result` |
| `delivered` | Completed delivery | `/(ops)/courier/completed` | `View completed` |
| `delivery_failed` | Terminal failure | `/(ops)/courier/issues?deliveryId=<deliveryId>` | `Review failure` |
| `cancelled` | Cancelled delivery | `/(ops)/courier/completed` | `View closed` |

If status is not recognized for courier work:

- Show row only if backend returned it under courier scope.
- Mark as `Needs review`.
- Route to assignment detail or issues.
- Do not offer mutation.

## First Meaningful Value
First meaningful value is reached when the courier sees:

- Recognized courier role.
- Freshness state.
- Active job count.
- Urgent job count.
- Current top job and next action.
- Offline queued action count if present.
- Route to assignments and issues.

The first viewport must answer:

- `Who does the app think I am?`
- `Is my assignment data fresh?`
- `What job needs action first?`
- `What action should I take next?`
- `Do I have offline actions waiting?`

## State Model
```ts
type CourierHomeState =
  | { kind: "loading_first_time" }
  | { kind: "ready"; summary: CourierHomeSummary; sync: CourierHomeSync }
  | { kind: "empty"; sync: CourierHomeSync }
  | { kind: "offline_cached"; summary: CourierHomeSummary; sync: CourierHomeSync }
  | { kind: "offline_empty" }
  | { kind: "stale_cache"; summary: CourierHomeSummary; sync: CourierHomeSync }
  | { kind: "refreshing"; summary: CourierHomeSummary; sync: CourierHomeSync }
  | { kind: "partial_failure"; summary?: CourierHomeSummary; sync: CourierHomeSync; requestId?: string }
  | { kind: "scope_denied" }
  | { kind: "session_expired" }
  | { kind: "api_error"; requestId?: string };
```

```ts
type CourierHomeSummary = {
  activeJobs: CourierHomeJob[];
  assignedCount: number;
  outForDeliveryCount: number;
  issueCount: number;
  queuedActionCount: number;
  topJob?: CourierHomeJob;
};
```

```ts
type CourierHomeJob = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: string;
  paymentStatus: string;
  originStationId: string;
  destinationStationId: string;
  latestOccurredAt: string;
  doorstepRequested: boolean;
  nextAction: CourierHomeNextAction;
  urgency: "urgent" | "soon" | "normal" | "blocked" | "closed";
  cacheOnlyDetail?: boolean;
};
```

```ts
type CourierHomeSync = {
  network: "online" | "offline" | "unknown";
  refresh: "idle" | "refreshing" | "failed";
  lastSyncedAt?: string;
  cacheAgeMinutes?: number;
  queuedActionCount: number;
  hasOutboxConflict: boolean;
};
```

## Screen Structure
Default ready structure:

1. Courier shift header.
2. Data authority strip.
3. Current doorstep job command card.
4. Deadline and readiness rail.
5. Assignment queue preview.
6. Offline outbox strip.
7. Support and completed work links.

Empty structure:

1. Courier shift header.
2. Empty work panel.
3. Refresh action.
4. Assignments route.
5. Support route.
6. Offline outbox link if queued actions exist.

Offline cached structure:

1. Courier shift header.
2. Offline authority strip.
3. Cached current job card.
4. Stale data warning.
5. Offline outbox strip.
6. Read-only queue preview.

## Component Inventory
### `CourierHomeScreen`
Responsibilities:

- Own route state.
- Load cached courier home rows.
- Fetch `list_deliveries`.
- Derive top job and next action.
- Render all states.
- Route without mutating delivery.

Test IDs:

- `screen-courier-home`
- `courier-home-scroll`

### `CourierHomeShiftHeader`
Responsibilities:

- Show courier role identity.
- Show active job count.
- Show shift freshness.
- Provide sign-out or account affordance if app shell supports it.

Test IDs:

- `courier-home-shift-header`
- `courier-home-active-count`

### `CourierHomeAuthorityStrip`
Responsibilities:

- Show live, refreshing, saved, stale, offline, or error data state.
- Show cache age.
- Show queued action count.
- Route to offline outbox when relevant.

Test IDs:

- `courier-home-authority-strip`
- `courier-home-cache-age`
- `courier-home-outbox-count`

### `CourierCurrentJobCard`
Responsibilities:

- Show top job.
- Show safe tracking code.
- Show status.
- Show route-safe station pair.
- Show next action and urgency.
- Hide private receiver details.

Test IDs:

- `courier-home-current-job-card`
- `courier-home-current-tracking-code`
- `courier-home-current-status`
- `courier-home-current-next-action`

### `CourierDeadlineRail`
Responsibilities:

- Show assignment acceptance guidance.
- Show out-for-delivery guidance.
- Show proof readiness guidance.
- Mark missing backend deadline fields as guidance, not exact countdown.

Test IDs:

- `courier-home-deadline-rail`
- `courier-home-acceptance-guidance`
- `courier-home-out-for-delivery-guidance`
- `courier-home-proof-guidance`

### `CourierAssignmentPreviewList`
Responsibilities:

- Show next few active jobs.
- Prioritize urgent and blocked rows.
- Route row to assignment detail.
- Keep list compact.

Test IDs:

- `courier-home-assignment-preview`
- `courier-home-assignment-row`

### `CourierHomeQuickLinks`
Responsibilities:

- Route to assignments, issues, completed jobs, earnings, and support-safe routes.
- Show only links valid for courier role.

Test IDs:

- `courier-home-open-assignments`
- `courier-home-open-issues`
- `courier-home-open-completed`
- `courier-home-open-earnings`

### `CourierHomeEmptyPanel`
Responsibilities:

- Explain no assigned jobs.
- Offer refresh.
- Offer assignments route.
- Keep offline outbox visible.

Test IDs:

- `courier-home-empty-panel`
- `courier-home-refresh`

### `CourierHomeOfflinePanel`
Responsibilities:

- Explain cached data limits.
- Route to offline outbox.
- Avoid unsafe mutation from stale data.

Test IDs:

- `courier-home-offline-panel`
- `courier-home-open-outbox`

## Visual Direction
Art direction:

- Field-grade and receiver-safe.
- Light base with a strong blue-green courier accent.
- One dominant current-job card.
- Dense status only where it supports action.
- No map-first layout.

Hierarchy:

- Header: who and freshness.
- Current job: what matters now.
- CTA: next workflow.
- Rail: deadlines and proof readiness.
- Preview: other active jobs.
- Utility: issues, completed, earnings, outbox.

Avoid:

- Live map as default.
- Receiver avatar or photo.
- Full address block.
- Promotional earnings treatment.
- Decorative courier illustration.
- Admin-style metrics grid.

## Tokens
Color tokens:

- `--courier-home-bg`: warm off-white.
- `--courier-home-surface`: clean card.
- `--courier-home-ink`: primary graphite.
- `--courier-home-muted`: secondary slate.
- `--courier-home-accent`: deep courier blue.
- `--courier-home-handoff`: green.
- `--courier-home-warn`: amber.
- `--courier-home-urgent`: red.
- `--courier-home-focus`: high-contrast blue.
- `--courier-home-border`: warm gray.

Spacing:

- Screen x: 20px mobile, 28px large mobile.
- Section gap: 24px.
- Card padding: 16px.
- Row gap: 12px.
- Bottom safe area: platform safe inset plus 16px.

Radius:

- Current job card: 28px.
- Secondary cards: 22px.
- Buttons: 16px.
- Chips: 999px.

Motion:

- Current job appears with a short opacity and translate transition.
- Refresh uses status text and small indicator.
- Row press uses pressed state only.
- No constant motion.
- Reduced motion uses instant state changes.

## Layout Rules
Mobile:

- Single column.
- Current job card appears within first viewport.
- Primary CTA remains within current job card, not sticky over content.
- Offline outbox strip remains visible when queued actions exist.
- Assignment preview shows up to `3` rows.

Large mobile:

- Current job and deadline rail may sit in a two-section card if readable.
- Quick links may use two columns.

Keyboard:

- Home has no text input by default.
- If future search is added, focused search must not hide current-job CTA.

Safe areas:

- Respect top and bottom safe areas.
- Do not place critical CTA under gesture navigation.

## Data Loading Strategy
Initial load:

1. Validate session role.
2. Render shell and cached summary if present.
3. Fetch `GET /v1/deliveries?limit=50`.
4. Validate response.
5. Filter locally to active courier-relevant statuses.
6. Store sanitized cache.
7. Derive top job.

Recommended active statuses:

- `assigned_for_final_mile`
- `out_for_delivery`
- `issue_reported`
- `on_hold`

Closed statuses for preview exclusion:

- `delivered`
- `delivery_failed`
- `cancelled`
- `closed`

Closed jobs:

- Route to completed jobs.
- Do not dominate home.

Refresh:

- Pull-to-refresh calls `list_deliveries`.
- Keep cached content visible while refreshing.
- Announce refresh result.

Offline:

- Use sanitized cached rows.
- Mark cache age.
- Disable claims that require live server state.
- Keep outbox route available.

## Next Action Derivation
Rules:

- If `currentStatus === "assigned_for_final_mile"`, next action is `accept_scan`.
- If `currentStatus === "out_for_delivery"`, next action is `proof_capture`.
- If `currentStatus === "issue_reported"` or `on_hold`, next action is `open_issue`.
- If status is closed, next action is `view_completed`.
- If status is unknown, next action is `open_detail`.

Do not derive:

- Receiver arrival time.
- Exact route ETA.
- Exact acceptance deadline if assignment timestamp is missing.
- Exact out-for-delivery deadline if accepted timestamp is missing.
- Proof method readiness without detail or proof contract.

Tie-breaker ranking:

1. Open issue or hold.
2. Assigned jobs needing accept scan.
3. Out-for-delivery jobs needing proof or failed-attempt decision.
4. Recently updated jobs.
5. Closed jobs are excluded from active ranking.

## Copy System
Header:

- Title: `Courier home`
- Subtitle: `Assigned doorstep jobs and next actions.`

Current job card:

- Label: `Current doorstep job`
- Empty label: `No assigned doorstep jobs`

Primary CTAs:

- `Accept by scan`
- `Continue delivery`
- `Complete handoff`
- `Open issue`
- `View job`

Freshness:

- `Live assignments`
- `Refreshing assignments`
- `Saved assignments`
- `Assignments offline`
- `Could not refresh assignments`

Offline:

- Title: `Using saved assignments`
- Body: `Review cached work only. Server state may have changed. Sync queued actions before acting on a disputed job.`

Empty:

- Title: `No doorstep jobs assigned`
- Body: `New assignments from your station will appear here after they are assigned to this courier account.`
- Primary action: `Refresh`
- Secondary action: `Open assignments`

Stale:

- Title: `Assignment data may be stale`
- Body: `Refresh before accepting custody or completing handoff if network is available.`

Scope denied:

- Title: `Courier access required`
- Body: `Sign in with an approved final-mile courier account to view assigned doorstep jobs.`

## Error States
### `loading_first_time`
- Show skeleton header, current job card, and quick links.
- No private data.

### `empty`
- Show empty panel.
- Keep refresh, assignments, issues, and outbox route.

### `offline_empty`
- Title: `No saved courier assignments`
- Body: `Reconnect once to load assigned doorstep jobs on this device.`
- Primary: `Retry`
- Secondary: `Open support`

### `offline_cached`
- Show cached summary.
- Show cache age.
- Disable language implying live server truth.

### `stale_cache`
- Show cached summary.
- Add stale warning above current job card.
- Keep refresh visible.

### `partial_failure`
- Keep any valid cached or partial rows.
- Show `Could not refresh all assignment data`.
- Include request ID when available.

### `scope_denied`
- Clear courier assignment cache.
- Route to sign-in or show denied panel.

### `session_expired`
- Clear sensitive cache pointers.
- Route to courier sign-in with safe intended destination.

### `api_error`
- Show retry.
- Keep cached data if present.
- Do not clear good cache on transient error.

## Offline Outbox Rules
Home is read-first, but it must surface queued courier actions.

Show outbox strip when:

- queued action count is greater than zero
- last replay failed
- local conflict exists
- user returned from action recovery

Relevant queued actions:

- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `complete_delivery`
- `record_failed_attempt`
- `create_issue`

Outbox copy:

- `Offline actions waiting`
- `Sync these before relying on final assignment state.`

Rules:

- Do not hide current job behind outbox.
- Do not mark queued action as server-complete.
- Do not auto-route to next workflow while action is unresolved.
- If a queued action belongs to the top job, show a clear `Sync pending` badge.

## Privacy And Security
Home may show:

- tracking code
- current status
- origin and destination station IDs or safe labels
- doorstep requested flag
- latest event time
- safe route pair
- safe next action

Home must not show:

- receiver phone
- full receiver address
- OTP
- signature
- delivery photo
- proof asset reference
- raw package scan code
- exact GPS coordinates
- internal actor IDs
- payment provider reference

Analytics must not include:

- receiver personal data
- exact address
- delivery proof data
- OTP
- scan code
- raw delivery ID when not hashed by analytics policy

## Accessibility Requirements
Screen reader:

- Announce courier home title.
- Announce assignment freshness.
- Announce active job count.
- Announce current job status and next action.
- Announce offline outbox count.

Targets:

- Current job CTA must exceed minimum target size.
- Quick links must be large enough for field use.
- Rows must have one primary press target.

Color:

- Urgency uses label and icon/shape, not color alone.
- Offline state uses text and icon/shape, not color alone.
- Focus ring remains visible.

Large text:

- Current job card stacks content.
- Deadline rail wraps into vertical blocks.
- Assignment preview rows grow height.
- No text truncation on CTA labels.

Reduced motion:

- No route pulse loops.
- No animated map.
- Use static status changes.

## Analytics
Events:

- `courier_home_viewed`
- `courier_home_refresh_started`
- `courier_home_refresh_succeeded`
- `courier_home_refresh_failed`
- `courier_home_current_job_opened`
- `courier_home_primary_action_tapped`
- `courier_home_assignments_opened`
- `courier_home_issues_opened`
- `courier_home_completed_opened`
- `courier_home_earnings_opened`
- `courier_home_outbox_opened`

Allowed properties:

- `screen_id`
- `route`
- `role`
- `active_count`
- `assigned_count`
- `out_for_delivery_count`
- `issue_count`
- `network_state`
- `cache_age_bucket`
- `next_action`
- `result`

Forbidden properties:

- receiver phone
- receiver address
- OTP
- scan code
- proof asset reference
- exact GPS
- free-text issue notes
- payment provider reference

## Performance Requirements
Initial render:

- Shell renders immediately.
- Cached summary renders within local storage budget.
- Online fetch must not block cached summary.

List:

- Use `limit=50` for home.
- Show top job and up to `3` preview rows.
- Route to full assignments screen for larger lists.

Refresh:

- Keep current content visible.
- Avoid full-screen reload for routine refresh.
- Announce status updates.

Offline:

- Cache only sanitized home row data.
- Do not cache private receiver data for home.
- Keep cache bounded.

## QA Acceptance
Core:

- Route renders `screen-courier-home`.
- Role must be `final_mile_courier`.
- Screen calls `list_deliveries?limit=50`.
- Screen uses only returned courier-scoped rows.
- Current job card appears when active job exists.
- Empty state appears when no active job exists.
- Offline cached state shows cache age.
- Offline empty state tells courier to reconnect.

Routing:

- `assigned_for_final_mile` routes primary action to accept scan.
- `out_for_delivery` routes primary action to proof capture.
- `issue_reported` routes primary action to issues.
- Unknown active status routes to detail.
- Quick links open assignments, issues, completed jobs, earnings, and outbox.

Boundaries:

- Home never calls `accept_final_mile_assignment`.
- Home never calls `mark_out_for_delivery`.
- Home never calls `complete_delivery`.
- Home never calls `record_failed_attempt`.
- Home never calls station assignment.
- Home never self-assigns courier work.

Privacy:

- Receiver phone never renders.
- Full receiver address never renders.
- OTP never renders.
- Package scan code never renders.
- Proof asset reference never renders.
- Exact GPS never renders.

Offline:

- Cached rows render with saved marker.
- Queued action strip appears when outbox has courier actions.
- Queued action is not shown as server success.
- Outbox conflict is visible.

Accessibility:

- Status refresh is announced.
- Current job next action is announced.
- CTA target sizes are sufficient.
- Large text keeps CTA visible.
- Reduced motion disables transitions.

## Unit Test Targets
Pure functions:

- `deriveCourierHomeState`
- `filterCourierHomeActiveJobs`
- `rankCourierHomeJobs`
- `deriveCourierHomeNextAction`
- `deriveCourierHomeUrgency`
- `sanitizeCourierHomeCacheRow`
- `buildCourierHomeAnalyticsPayload`
- `getCourierHomePrimaryRoute`

Test cases:

- `assigned_for_final_mile` maps to `accept_scan`.
- `out_for_delivery` maps to `proof_capture`.
- `issue_reported` maps to `open_issue`.
- Closed jobs are excluded from active ranking.
- Issue rows rank before normal rows.
- Assigned rows rank before out-for-delivery when both need action.
- Unknown status maps to detail.
- Sanitizer removes receiver phone, address, OTP, scan, proof, and GPS fields.
- Analytics payload excludes private fields.

## Integration Test Targets
Render:

- Renders `screen-courier-home`.
- Shows live authority strip after successful fetch.
- Shows current job card for active assigned job.
- Shows empty state for no jobs.
- Shows offline cached state.

API:

- Calls `list_deliveries`.
- Uses `limit=50`.
- Does not call mutation endpoints.
- Handles `FORBIDDEN` by routing to sign-in.
- Handles `INTERNAL_ERROR` by preserving cache.

Routing:

- Primary CTA opens accept scan for assigned job.
- Primary CTA opens proof for out-for-delivery job.
- Issue CTA opens courier issues with delivery context.
- Assignments quick link opens full assignments route.
- Outbox quick link opens offline outbox.

## End-To-End Test Targets
Critical:

- Courier signs in and sees assigned doorstep job on home.
- Courier opens accept scan from home.
- Courier returns from accepted custody and home routes next to out-for-delivery.
- Courier returns from out-for-delivery and home routes next to proof.
- Courier opens home offline with saved active job and sees stale marker.
- Courier with queued proof action sees offline outbox strip.

Regression:

- Wrong role cannot open courier home.
- Courier does not see other courier jobs.
- No private receiver data appears on home.
- No mutation occurs from home.
- Stale cache is never labeled live.

## Test IDs
Required:

- `screen-courier-home`
- `courier-home-scroll`
- `courier-home-shift-header`
- `courier-home-active-count`
- `courier-home-authority-strip`
- `courier-home-cache-age`
- `courier-home-outbox-count`
- `courier-home-current-job-card`
- `courier-home-current-tracking-code`
- `courier-home-current-status`
- `courier-home-current-next-action`
- `courier-home-deadline-rail`
- `courier-home-acceptance-guidance`
- `courier-home-out-for-delivery-guidance`
- `courier-home-proof-guidance`
- `courier-home-assignment-preview`
- `courier-home-assignment-row`
- `courier-home-open-assignments`
- `courier-home-open-issues`
- `courier-home-open-completed`
- `courier-home-open-earnings`
- `courier-home-empty-panel`
- `courier-home-refresh`
- `courier-home-offline-panel`
- `courier-home-open-outbox`

## Implementation Notes For Claude Code
Build `CourierHome` as the courier command center, not as a mutation surface. It should read courier-scoped assignments through `list_deliveries`, derive the active top job locally, show data freshness and offline outbox status, and route to the correct child workflow.

Implementation boundaries:

- Use `list_deliveries?limit=50`.
- Trust backend courier assignment scope.
- Cache only sanitized home rows.
- Derive next action from status.
- Route to child screens for every mutation.
- Do not show receiver phone, full address, OTP, scan code, proof asset, or exact GPS.
- Do not implement live route optimization.
- Do not implement earnings calculations.
- Do not implement issue management beyond routing to courier issues.

Acceptance gate:

- The route renders behind `screen-courier-home`.
- The screen shows assigned courier jobs and clear next action.
- Offline cached state is visibly marked.
- Queued courier actions are visible.
- No delivery mutation is callable from home.
- No out-of-scope or private receiver data is shown.
