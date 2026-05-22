# CourierAssignments Screen Specification

## Screen Contract

| Field                       | Value                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID                   | `CourierAssignments`                                                                                                                                                                                                                                                                                                                                                    |
| Route                       | `/(ops)/courier/assignments`                                                                                                                                                                                                                                                                                                                                            |
| Primary test ID             | `screen-courier-assignments`                                                                                                                                                                                                                                                                                                                                            |
| Surface                     | Final-mile courier mobile app                                                                                                                                                                                                                                                                                                                                           |
| Backend coverage            | `list_deliveries` with final-mile courier assignment scope                                                                                                                                                                                                                                                                                                              |
| Offline critical            | Yes, read cached with explicit freshness                                                                                                                                                                                                                                                                                                                                |
| Required role               | `final_mile_courier`                                                                                                                                                                                                                                                                                                                                                    |
| Primary data source         | `GET /v1/deliveries` through route key `list_deliveries`                                                                                                                                                                                                                                                                                                                |
| Related routes              | `/(ops)/courier/home`, `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/accept-scan`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/courier/completed`, `/(ops)/courier/issues`, `/(ops)/offline-outbox` |
| Current implementation mode | Contract-backed active assignment list with local grouping, status tabs, safe search, and child workflow routing                                                                                                                                                                                                                                                        |

## Product Job

`CourierAssignments` is the courier's active job queue.

It answers six operational questions:

- `Which final-mile jobs are assigned to me?`
- `Which jobs need custody acceptance?`
- `Which jobs are already out for delivery?`
- `Which jobs are blocked, at risk, or need support?`
- `Which job should I handle next?`
- `Is this list fresh, cached, or waiting for sync?`

The screen must let couriers scan a whole worklist without exposing receiver-sensitive data or allowing unsafe mutations from the list.

## Product Standard

This screen is not a generic list. It is a custody-aware queue for doorstep delivery.

The courier should be able to:

- See all active assigned final-mile jobs in priority order.
- Distinguish `Needs acceptance`, `Ready to start`, `Out for delivery`, `Needs proof`, `Blocked`, and `Stale` jobs.
- Search by tracking code or receiver display name.
- Filter by operational status without losing active urgency.
- Open the exact delivery detail or next child workflow.
- Understand whether a job is safe to act on while offline.
- See when the list was last refreshed.
- See queued local actions that may change the list after sync.
- Return to the active queue after each child workflow.

The screen must never:

- Show jobs assigned to another courier.
- Let the courier self-assign delivery work.
- Complete, fail, or accept custody directly from a list row.
- Show receiver phone, full address, OTP, package scan code, proof asset reference, or exact GPS.
- Treat station assignment as custody acceptance.
- Hide that `list_deliveries` lacks exact assignment deadlines.
- Pretend route optimization is available when the backend does not provide route ordering.
- Present completed jobs as active work.
- Claim an offline child action has reached the server before sync confirms it.

## Audience

Primary audience:

- Final-mile couriers handling assigned doorstep jobs after destination station handoff.

Secondary audience:

- Destination station operators reviewing courier progress indirectly.
- Support staff helping with stuck doorstep jobs.
- QA validating route inventory, offline behavior, and authorization.
- Security reviewers validating data minimization.
- Claude Code implementing the React Native screen, data hooks, and tests.

## Context Of Use

The courier may open this screen:

- Immediately after sign-in.
- From the courier home current-job card.
- After a push notification about a new assignment.
- While standing at the destination station.
- After accepting custody for one job.
- After setting a job out for delivery.
- Near the receiver location.
- After a failed sync or network interruption.
- While deciding which assigned job to handle next.

The environment may include glare, noise, a moving vehicle, intermittent network, and time pressure. The layout must prioritize large touch targets, high-contrast text, and a queue hierarchy that can be understood in under five seconds.

## Design Brief

User and job:

- A verified final-mile courier needs to view and triage active assigned jobs without risking custody errors.

Surface type:

- Mobile operational work queue.

Primary action:

- Open the highest-priority assignment or the correct next workflow for a selected row.

Visual thesis:

- `Command queue`: a dense but calm field list with a sharp priority lane, oversized next-action targets, and an always-visible sync authority strip.

Restraint rule:

- Do not turn the queue into a map, earnings report, proof flow, or station management surface. The list decides where to go next; child screens perform the work.

Density:

- Medium-high density, but only one dominant action per row.

Platform stance:

- Native-plus React Native. Strong thumb ergonomics, sticky filters, pull-to-refresh, and accessible row semantics.

## External Research Used

Only directly relevant links were used:

- [Uber: delivering using the Driver app](https://www.uber.com/gb/en/deliver/basics/making-deliveries/how-to-deliver/?uclick_id=04e130d9-8550-478e-ac44-fbf310f8eb1e): supports delivery apps surfacing requests, acceptance, pickup confirmation, customer location details only at the right delivery stage, and delivery issue flows.
- [Uber Help: accepting delivery requests](https://help.uber.com/en/driving-and-delivering/article/accepting-delivery-requests?nodeId=9e850637-8906-49b9-8a74-a4234460fb08): supports time-sensitive courier acceptance behavior and online request visibility.
- [DoorDash: how to use the Dasher app](https://dasher.doordash.com/en-us/blog/how-to-use-dasher-app): supports a courier main operational tab with accept/decline, directions, delivery information, and performance/support access.
- [Power Apps mobile offline behavior](https://learn.microsoft.com/en-us/power-apps/mobile/mobile-offline-works-overview): supports local cache reads, queued write indicators, selective columns, and offline-aware screen behavior.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local data as the read source, network refresh as synchronization, and explicit handling of offline reads and writes.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports logical row, filter, search, and action focus order.
- [WCAG headings and labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html): supports descriptive section labels, filter labels, and action names.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large row actions and one-handed touch operation.

## Local Product References

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/02-courier-home.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/15-station-final-mile-queue.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
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
- `apps/mobile/src/index.ts`

## Backend Contract

Current read:

- Operation key: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Auth scope: authenticated.
- Courier scope: repository filters by `assignedFinalMileCourierId == principal.userId`.
- Sorting: `latestEvent.occurredAt desc`.
- Default query for this screen: `limit=50`.
- Optional server filters: `status`, `paymentStatus`, `limit`.
- Response schema: `deliveryListResponseSchema`.

Fields available per delivery row:

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
- `latestTouchpointStationId`
- `doorstepRequested`

Current backend behavior:

- A courier can only see rows assigned to their own `principal.userId`.
- `assigned_for_final_mile` means the station assigned work, but custody is still not accepted by the courier.
- `out_for_delivery` means the courier is in the receiver leg and should finish proof or record a failed attempt.
- Assignment acceptance requires `accept_final_mile_assignment`.
- Starting the final-mile trip requires `mark_out_for_delivery`.
- Completion proof is handled by proof child screens.
- Failed attempts are handled by failed-attempt child screen.

Backend limitations affecting this screen:

- `list_deliveries` does not return assignment creation timestamp.
- `list_deliveries` does not return acceptance due time.
- `list_deliveries` does not return accepted timestamp.
- `list_deliveries` does not return out-for-delivery due time.
- `list_deliveries` does not return receiver address or safe landmark text.
- `list_deliveries` does not return route distance, travel estimate, route order, or navigation state.
- `list_deliveries` does not return attempt count.
- `list_deliveries` does not return open issue count.
- `list_deliveries` does not return proof availability.
- `list_deliveries` does not return local package-scan verification status.

Implementation decision:

- Fetch all courier-scoped deliveries with `list_deliveries?limit=50`.
- Client-side derive active assignment groups.
- Client-side filter out closed statuses by default.
- Use child detail route for exact receiver destination data.
- Use cached child detail summaries only when already available and safe.
- Do not add a list-row mutation in v1.
- Do not block screen implementation waiting for a courier-specific endpoint.

Future backend improvement:

- Add `GET /v1/courier/assignments` or extend `list_deliveries` with courier-safe fields:
  - `assignedAt`
  - `acceptanceDueAt`
  - `acceptedAt`
  - `outForDeliveryDueAt`
  - `attemptCount`
  - `proofRequired`
  - `proofOptions`
  - `safeLandmarkLabel`
  - `openIssueCount`
  - `nextAction`
  - `nextActionDueAt`
  - `deliveryLegRank`
  - `offlineSafeUntil`
  - `lastCourierActionId`

Claude Code must implement against the current contract first and isolate future fields behind optional adapters.

## Authorization Rules

Required principal:

- `role === "final_mile_courier"`.

Allowed capability context:

- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `complete_delivery_with_proof`
- `record_failed_attempt`
- `open_issue`

This screen may route to workflows requiring those capabilities, but it must not execute the mutations directly.

Role failure:

- If principal is missing, stale, or not `final_mile_courier`, clear courier assignment cache and route to `/(auth)/courier/sign-in`.

Data scope:

- Use only deliveries returned by `list_deliveries`.
- Do not query station queues.
- Do not query driver manifests.
- Do not query ops-admin queues.
- Do not request all couriers.
- Do not store cross-courier data in local cache.

Station context:

- Do not infer station authority from the courier role.
- Station IDs may be displayed as compact station labels when they come from the delivery row.

Privacy:

- Receiver display name may be shown.
- Receiver phone must not be shown.
- Full receiver address must not be shown.
- OTP must not be shown.
- Package scan code must not be shown.
- Proof asset references must not be shown.
- Exact GPS must not be shown.
- Internal staff IDs must not be shown.

## Doorstep Policy Contract

Policy facts from local rules:

- Doorstep delivery is available after confirmed destination-station receipt.
- Doorstep assignment requires prepaid delivery and collected doorstep surcharge.
- Courier must accept or reject assignment within `15 minutes`.
- If the courier does not accept in time, station flow should return job to `awaiting_final_mile_assignment`.
- Once accepted, courier should move the delivery to `out_for_delivery` within `2 hours`.
- OTP is default proof method for v1 final-mile completion.
- Approved fallback proof options are receiver signature or delivery photo.
- Failed attempt is structured and must write a timeline reason.
- One reattempt is allowed within `24 hours` of first failed doorstep attempt.
- No cash collection is allowed during final-mile completion.

List-level implication:

- The queue can show policy reminders and relative urgency.
- The queue cannot enforce exact SLA timers without backend due timestamps.
- If exact due timestamps are missing, the UI must label urgency as `Policy guidance` rather than exact countdown.

## Handoff And Custody Rules

Custody states:

- Assigned job is not courier custody.
- Courier custody begins only after the `accept_final_mile_assignment` child flow succeeds.
- Courier remains accountable until delivery completion or return handoff.

List behavior:

- `assigned_for_final_mile` row should say `Awaiting custody scan`.
- `out_for_delivery` row should say `Courier custody active`.
- Rows with issue states should say `Resolve before completion`.
- Completed or returned rows should not appear in active default view.

Disallowed list behavior:

- Do not show `Accepted` unless backend status or local confirmed lifecycle event supports it.
- Do not let a courier start delivery before custody acceptance.
- Do not show receiver-facing instructions on unaccepted assignments.
- Do not let queued offline acceptance silently reorder the list as if confirmed.

## Active Status Taxonomy

Default active statuses:

| Backend status            | Queue group        | User-facing label    | Primary route                                        |
| ------------------------- | ------------------ | -------------------- | ---------------------------------------------------- |
| `assigned_for_final_mile` | `needs_acceptance` | `Needs custody scan` | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| `out_for_delivery`        | `in_delivery`      | `Out for delivery`   | `/(ops)/courier/assignments/:deliveryId/proof`       |
| `delivery_attempt_failed` | `needs_follow_up`  | `Attempt recorded`   | `/(ops)/courier/assignments/:deliveryId`             |
| `issue_reported`          | `blocked`          | `Issue open`         | `/(ops)/courier/issues`                              |
| `on_hold`                 | `blocked`          | `On hold`            | `/(ops)/courier/assignments/:deliveryId`             |

Closed or non-active statuses:

- `delivered`
- `cancelled`
- `refunded`
- `awaiting_receiver_pickup`
- `returned_to_sender`
- `delivery_failed`

Closed statuses may appear only when the courier explicitly opens completed/history screens. They must not be mixed into active work by default.

Unknown status:

- Render as `Needs review`.
- Route to detail.
- Do not show a next-action mutation.
- Log an analytics event with status string.

## Queue Ordering

Sort active rows with this stable priority:

1. Rows with queued local action conflicts.
2. `out_for_delivery` rows needing proof or failed-attempt decision.
3. `assigned_for_final_mile` rows needing custody scan.
4. Blocked rows with `issue_reported` or `on_hold`.
5. Rows with stale cached details.
6. Remaining active rows by `latestOccurredAt desc`.

Tie breakers:

- Exact backend due timestamp if future endpoint provides it.
- `latestOccurredAt desc`.
- `trackingCode asc`.

Do not sort by:

- Receiver name.
- Station ID alone.
- Estimated distance unless backend provides it.
- Local device GPS proximity.
- Earnings amount.

## Information Architecture

Top-level sections:

- Sync authority strip.
- Header with active count and refresh.
- Search and filters.
- Priority summary rail.
- Grouped active assignment list.
- Offline outbox strip when queued actions exist.
- Empty, loading, error, and stale states.

Screen hierarchy:

1. `CourierAssignmentsScreen`
2. `CourierAssignmentsAuthorityStrip`
3. `CourierAssignmentsHeader`
4. `CourierAssignmentsSearch`
5. `CourierAssignmentsStatusTabs`
6. `CourierAssignmentsPriorityRail`
7. `CourierAssignmentsList`
8. `CourierAssignmentCard`
9. `CourierAssignmentSecondaryMeta`
10. `CourierAssignmentsOfflineOutboxStrip`
11. `CourierAssignmentsEmptyPanel`
12. `CourierAssignmentsErrorPanel`

Primary user path:

1. Courier opens assignments.
2. Screen loads cached rows immediately when available.
3. Screen refreshes `list_deliveries`.
4. Courier sees active groups.
5. Courier taps primary row action.
6. App routes to accept scan, proof, failed-attempt, issue, or detail.
7. Child flow updates delivery lifecycle.
8. Courier returns to refreshed assignment list.

## Data Model

Use a view model that separates backend row from UI decisions:

```ts
type CourierAssignmentsState =
  | { kind: "boot_loading" }
  | { kind: "ready"; model: CourierAssignmentsModel; sync: CourierAssignmentsSync }
  | { kind: "refreshing"; model: CourierAssignmentsModel; sync: CourierAssignmentsSync }
  | { kind: "offline_cached"; model: CourierAssignmentsModel; sync: CourierAssignmentsSync }
  | { kind: "stale_cache"; model: CourierAssignmentsModel; sync: CourierAssignmentsSync }
  | { kind: "empty"; sync: CourierAssignmentsSync }
  | { kind: "offline_empty" }
  | {
      kind: "partial_failure";
      model?: CourierAssignmentsModel;
      sync: CourierAssignmentsSync;
      requestId?: string;
    }
  | { kind: "unauthorized" };

type CourierAssignmentsModel = {
  activeCount: number;
  visibleCount: number;
  groups: CourierAssignmentGroup[];
  priorityJob?: CourierAssignmentRow;
  filters: CourierAssignmentFilters;
  query: string;
  hiddenClosedCount: number;
  queuedActionCount: number;
  lastRefreshLabel: string;
};

type CourierAssignmentGroup = {
  groupId: "needs_acceptance" | "in_delivery" | "needs_follow_up" | "blocked" | "needs_review";
  title: string;
  description: string;
  count: number;
  rows: CourierAssignmentRow[];
};

type CourierAssignmentRow = {
  deliveryId: string;
  trackingCode: string;
  status: string;
  statusLabel: string;
  groupId: CourierAssignmentGroup["groupId"];
  paymentStatus: string;
  serviceType: string;
  receiverDisplayName: string;
  originStationId: string;
  destinationStationId: string;
  latestOccurredAt?: string;
  latestTouchpointRole?: string;
  latestTouchpointStationId?: string;
  doorstepRequested: boolean;
  nextAction: CourierAssignmentNextAction;
  urgency: CourierAssignmentUrgency;
  cacheSafety: CourierAssignmentCacheSafety;
  queuedLocalAction?: CourierQueuedActionBadge;
};

type CourierAssignmentNextAction =
  | { type: "accept_scan"; label: "Accept by scan"; route: string }
  | { type: "proof"; label: "Complete handoff"; route: string }
  | { type: "failed_attempt"; label: "Record attempt"; route: string }
  | { type: "issue"; label: "Open issue"; route: string }
  | { type: "detail"; label: "Review details"; route: string };

type CourierAssignmentUrgency = {
  level: "critical" | "high" | "normal" | "blocked" | "unknown";
  label: string;
  basis: "backend_due_time" | "policy_guidance" | "status" | "queued_action" | "unknown";
};

type CourierAssignmentCacheSafety = {
  source: "network" | "local_cache" | "merged";
  ageSeconds?: number;
  isStale: boolean;
  canOpenDetail: boolean;
  canOpenMutationChild: boolean;
};

type CourierAssignmentFilters = {
  tab: "active" | "needs_acceptance" | "out_for_delivery" | "blocked";
  query: string;
  stationId?: string;
};

type CourierAssignmentsSync = {
  network: "online" | "offline" | "unknown";
  lastSuccessfulFetchAt?: string;
  requestId?: string;
  queuedActionCount: number;
  hasConflict: boolean;
};
```

## Fetch Strategy

Initial load:

- Read cached courier assignment list from local store.
- Render cached list if present with a visible cache label.
- Start network refresh with `list_deliveries?limit=50`.
- Replace cache after successful network response.
- Preserve current filter and search query after refresh.

Refresh:

- Pull-to-refresh calls `list_deliveries?limit=50`.
- Disable repeated refresh while a fetch is active.
- Announce refresh status through accessible status messaging.
- If refresh fails but cache exists, remain on cached list and show error strip.
- If refresh fails with no cache, show recoverable error panel.

Polling:

- Do not add aggressive polling in v1.
- Refresh on screen focus.
- Refresh after returning from child workflow.
- Refresh after offline queue drains.
- Refresh when app returns foreground after more than `60 seconds`.

Cache:

- Store only courier-scoped rows.
- Key cache by courier user ID.
- Remove cache on sign-out or role mismatch.
- Store `fetchedAt`, `requestId`, and schema version.
- Sanitize sensitive fields before persistence.

## Filtering And Search

Tabs:

- `Active`
- `Needs scan`
- `Out now`
- `Blocked`

Search:

- Search by `trackingCode`.
- Search by receiver display name.
- Search by compact station ID.
- Search should run locally over already scoped rows.
- Search must not reveal hidden fields.

Filter behavior:

- `Active` shows all default active statuses.
- `Needs scan` shows `assigned_for_final_mile`.
- `Out now` shows `out_for_delivery`.
- `Blocked` shows `issue_reported`, `on_hold`, and unknown statuses.

No-results behavior:

- Keep filter controls visible.
- Show exact filter label causing no visible rows.
- Provide `Clear search` or `Show active`.
- Do not show completed jobs as a fallback.

## Component Specifications

### `CourierAssignmentsScreen`

Responsibility:

- Own data fetch, cache restore, filters, grouping, and route navigation.

Required behavior:

- Render `screen-courier-assignments`.
- Require `final_mile_courier` role.
- Fetch `list_deliveries?limit=50`.
- Exclude closed statuses from default active groups.
- Persist safe cache rows.
- Route row actions to child screens.
- Never call lifecycle mutations directly.

Primary test IDs:

- `screen-courier-assignments`
- `courier-assignments-loading`
- `courier-assignments-ready`
- `courier-assignments-empty`
- `courier-assignments-error`

### `CourierAssignmentsAuthorityStrip`

Responsibility:

- Show whether visible data is live, refreshing, cached, stale, or offline.

Content rules:

- Online fresh: `Live assignments`
- Refreshing: `Refreshing assignments`
- Cached: `Saved assignments`
- Stale: `Saved list may be out of date`
- Offline empty: `No saved assignments on this device`
- Conflict: `Queued action needs review`

Actions:

- `Refresh`
- `Offline outbox`

Test IDs:

- `courier-assignments-authority-strip`
- `courier-assignments-refresh-button`
- `courier-assignments-outbox-link`

### `CourierAssignmentsHeader`

Responsibility:

- Orient courier to active work volume.

Content:

- Title: `Assigned doorstep jobs`
- Subtitle with active count.
- Last refresh label.
- Optional station-zone summary if safe.

Do:

- Use active count from filtered active rows.
- Show hidden closed count only as text link to completed screen.

Do not:

- Show total platform assignments.
- Show other couriers.
- Show earnings.

Test IDs:

- `courier-assignments-header`
- `courier-assignments-active-count`
- `courier-assignments-last-refresh`

### `CourierAssignmentsSearch`

Responsibility:

- Let courier find a row quickly.

Behavior:

- Input label: `Search assigned jobs`.
- Input hint: `Tracking code, receiver name, or station`.
- Debounce locally at `150ms`.
- Keep clear button at least `44px` touch target.
- Preserve query on refresh.
- Clear query after sign-out.

Test IDs:

- `courier-assignments-search`
- `courier-assignments-search-clear`

### `CourierAssignmentsStatusTabs`

Responsibility:

- Group queue by operational state.

Tabs:

- `Active`
- `Needs scan`
- `Out now`
- `Blocked`

Behavior:

- Each tab shows count.
- Selected tab is visually and programmatically selected.
- Tabs remain sticky under header while scrolling.
- If a tab count is zero, keep the tab visible but de-emphasized.

Test IDs:

- `courier-assignments-tab-active`
- `courier-assignments-tab-needs-scan`
- `courier-assignments-tab-out-now`
- `courier-assignments-tab-blocked`

### `CourierAssignmentsPriorityRail`

Responsibility:

- Summarize the most important operational risk above the list.

Display rules:

- If any queued action conflict exists, show conflict first.
- Else if any `out_for_delivery`, show `Finish receiver handoff`.
- Else if any `assigned_for_final_mile`, show `Accept custody by scan`.
- Else if any blocked row, show `Resolve blocked job`.
- Else hide rail.

Action:

- Opens the highest-priority row route.

Test IDs:

- `courier-assignments-priority-rail`
- `courier-assignments-priority-action`

### `CourierAssignmentsList`

Responsibility:

- Render grouped active rows.

Behavior:

- Use a virtualized list.
- Group headings must be sticky only if performance remains smooth on low-end Android.
- Preserve scroll position when a refresh returns same row IDs.
- Reset scroll to top only when filter changes.
- Show skeleton rows only on first boot load with no cache.

Test IDs:

- `courier-assignments-list`
- `courier-assignments-group-needs-acceptance`
- `courier-assignments-group-in-delivery`
- `courier-assignments-group-needs-follow-up`
- `courier-assignments-group-blocked`

### `CourierAssignmentCard`

Responsibility:

- Present one assigned delivery row and its safest next action.

Layout:

- Left priority stripe.
- Tracking code.
- Receiver display name.
- Status label.
- Station pair.
- Latest movement label.
- Cache or queued-action badge when needed.
- One primary action.
- One secondary `Details` affordance.

Primary action mapping:

- `assigned_for_final_mile` -> `Accept by scan`
- `out_for_delivery` -> `Complete handoff`
- `delivery_attempt_failed` -> `Review attempt`
- `issue_reported` -> `Open issue`
- `on_hold` -> `Review details`
- unknown -> `Review details`

Secondary action:

- Always route to detail if delivery ID exists.

Disallowed row content:

- Receiver phone.
- Full address.
- OTP.
- Package scan code.
- Proof reference.
- Exact GPS.
- Driver identity unless already part of safe detail contract.

Test IDs:

- `courier-assignment-card`
- `courier-assignment-card-{deliveryId}`
- `courier-assignment-primary-action-{deliveryId}`
- `courier-assignment-details-link-{deliveryId}`
- `courier-assignment-status-{deliveryId}`
- `courier-assignment-sync-badge-{deliveryId}`

### `CourierAssignmentSecondaryMeta`

Responsibility:

- Show compact non-sensitive supporting facts.

Allowed facts:

- Origin station ID.
- Destination station ID.
- Service type.
- Doorstep requested flag.
- Latest movement role.
- Latest movement station.
- Relative latest movement time.

Disallowed facts:

- Receiver phone.
- Full address.
- Address instructions.
- OTP.
- Proof data.
- Exact coordinates.

### `CourierAssignmentsOfflineOutboxStrip`

Responsibility:

- Show queued local operations that may alter visible assignments.

Content:

- Queued count.
- Conflict count if any.
- Last attempted sync when available.
- Link to offline outbox.

Rules:

- If queued action exists for a visible delivery, the row must show a matching badge.
- If queued action conflicts with current backend state, priority rail must show conflict first.
- Do not remove the row until backend confirms the queued action.

Test IDs:

- `courier-assignments-offline-outbox-strip`
- `courier-assignments-outbox-count`

### `CourierAssignmentsEmptyPanel`

Responsibility:

- Explain why no active jobs are visible.

Variants:

- No active assigned jobs.
- No rows match search.
- No rows in selected tab.
- Only closed rows hidden.
- Offline with no cache.

Actions:

- `Refresh`
- `Clear search`
- `Go home`
- `View completed` when relevant.

Test IDs:

- `courier-assignments-empty-panel`
- `courier-assignments-empty-refresh`

### `CourierAssignmentsErrorPanel`

Responsibility:

- Recover from failed list fetch.

Content:

- Human-readable error.
- Request ID if available.
- Retry action.
- Link to support when repeated.

Rules:

- If cached data exists, error should be a strip, not full-page takeover.
- If no cached data exists, show full recoverable panel.

Test IDs:

- `courier-assignments-error-panel`
- `courier-assignments-retry`

## Visual Direction

The screen should feel like a professional field operations app for African doorstep delivery, not a food-delivery clone.

Art direction:

- Warm neutral background for sunlight readability.
- Deep ink typography for scan confidence.
- Amber or copper urgency only for real risk.
- Green only for confirmed live or safe progress.
- Blue only for navigation or information.
- Red only for issue or conflict.

Surface pattern:

- Authority strip is thin and high-confidence.
- Header is calm and compact.
- Priority rail is visually stronger than ordinary rows.
- Assignment rows are strong, tactile panels with clear left edge status.
- Filters are light and sticky.

Typography:

- Use one expressive but legible display face for headings.
- Use one highly readable body face for operational text.
- Avoid default generic stacks unless the repo design system requires them.
- Tracking codes use tabular numeric styling.

Spacing:

- Use `8px` base rhythm.
- Minimum row vertical touch target: `72px`.
- Primary row action target: at least `48px` high.
- Search clear button: at least `44px`.
- Tab targets: at least `44px` high.

Motion:

- First-load rows enter with a subtle upward fade, staggered by group.
- Refresh uses pull indicator and authority strip transition.
- Filter changes use crossfade plus stable scroll reset.
- No looping motion.
- Honor reduced motion.

## Mobile Layout

Compact phones:

- Single-column list.
- Sticky search and tabs may compress to one sticky block.
- Priority rail collapses to one sentence and one action.
- Row secondary metadata wraps to two lines.
- Primary action remains full-width under row summary if space is tight.

Large phones:

- Row primary action may sit right-aligned.
- Group counts can show inline.
- Search and tabs remain visible after header scroll.

Tablets:

- Keep one list column unless the product adds a map or detail pane later.
- Do not add a split-pane detail layout in v1.
- Use wider row content, not extra unrelated panels.

Safe areas:

- Respect top and bottom safe areas.
- Bottom tab or shell navigation must not hide the final row action.
- Pull-to-refresh must not conflict with system gesture area.

## Accessibility

Required:

- Logical focus order: authority strip, header, search, tabs, priority rail, grouped rows.
- Descriptive headings and filter labels.
- Row accessibility label includes tracking code, status, receiver display name, next action, and freshness.
- Primary action label must match visible text.
- Group headings are accessible as headings.
- Status changes are announced without stealing focus.
- Pull-to-refresh result is announced.
- Touch targets meet or exceed WCAG minimum and product target of `44px`.
- Text supports device font scaling up to at least `200%`.
- Color is never the only status signal.
- Skeleton loaders must not be announced as real rows.

Screen reader row label pattern:

- `{trackingCode}, {statusLabel}, receiver {receiverDisplayName}, {stationPair}, next action {nextActionLabel}, data {freshnessLabel}.`

Focus restoration:

- After returning from child workflow, restore focus to the row if still visible.
- If row moved groups, focus the authority strip and announce list updated.
- If row disappeared because backend closed it, show toast and focus header.

Keyboard behavior:

- Search input receives focus only when explicitly tapped.
- Tab order follows visual order.
- Row card itself may open detail; primary action remains separate and clearly named.

## Offline And Low-Bandwidth Behavior

Offline with cache:

- Show cached rows immediately.
- Mark list as saved data.
- Disable child workflows that require live server confirmation unless the child route has its own offline queue contract.
- Keep detail route available only if cached detail exists.
- Show offline outbox link.

Offline with no cache:

- Show `No saved assignments on this device`.
- Provide retry.
- Provide sign-in recovery if token expired.

Low bandwidth:

- Avoid downloading images.
- Avoid maps on this screen.
- Keep row payload text-only.
- Store only essential fields.
- Use compact date formatting.

Queued actions:

- Rows affected by queued actions must show `Waiting to sync`.
- Do not remove or reclassify rows until server confirms.
- If server response conflicts, route to action recovery.

Staleness:

- Fresh: fetched less than `60 seconds` ago.
- Saved: fetched within `10 minutes`.
- Stale: fetched more than `10 minutes` ago.
- Very stale: fetched more than `2 hours` ago.

Labels:

- `Live assignments`
- `Saved 4 min ago`
- `Saved list may be out of date`
- `Reconnect to confirm before handoff`

## State Specifications

### `boot_loading`

Use when:

- No cache exists and first fetch is running.

UI:

- Full screen shell.
- Header skeleton.
- Three list skeleton rows.
- Authority strip says `Loading assignments`.

Do not:

- Show stale rows.
- Show action buttons.

### `ready`

Use when:

- Network fetch succeeded and active rows exist.

UI:

- Authority strip says `Live assignments`.
- Header count matches active rows.
- Groups render in priority order.

### `refreshing`

Use when:

- Existing rows are visible and network refresh is running.

UI:

- Keep rows interactive except where a queued action is being reconciled.
- Show refresh indicator.
- Do not blank list.

### `offline_cached`

Use when:

- Device is offline and local safe rows exist.

UI:

- Authority strip says saved data.
- Row cache badges are visible.
- Child route availability follows cache safety.

### `stale_cache`

Use when:

- Cached rows are older than freshness policy.

UI:

- Show stale warning.
- Keep rows visible.
- Encourage refresh before custody-impacting child workflows.

### `empty`

Use when:

- Network fetch succeeded but no active assigned jobs exist.

UI:

- Empty panel with clear reason.
- `Refresh` action.
- `Go home` action.
- Optional `View completed`.

### `offline_empty`

Use when:

- No cache and network unavailable.

UI:

- Full panel.
- Explain that saved assignments are unavailable on this device.
- Provide retry.

### `partial_failure`

Use when:

- Refresh failed but cache exists.

UI:

- Keep cached list.
- Show error strip.
- Include request ID if present.

### `unauthorized`

Use when:

- API returns auth or role failure.

UI:

- Clear courier cache.
- Route to courier sign-in.
- Do not render rows.

## Action Routing

Route mapping:

| Row state                 | Primary action     | Route                                                |
| ------------------------- | ------------------ | ---------------------------------------------------- |
| `assigned_for_final_mile` | `Accept by scan`   | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| `out_for_delivery`        | `Complete handoff` | `/(ops)/courier/assignments/:deliveryId/proof`       |
| `delivery_attempt_failed` | `Review attempt`   | `/(ops)/courier/assignments/:deliveryId`             |
| `issue_reported`          | `Open issue`       | `/(ops)/courier/issues`                              |
| `on_hold`                 | `Review details`   | `/(ops)/courier/assignments/:deliveryId`             |
| unknown active status     | `Review details`   | `/(ops)/courier/assignments/:deliveryId`             |

Secondary route:

- Card tap or `Details` opens `/(ops)/courier/assignments/:deliveryId`.

Outbox route:

- `/(ops)/offline-outbox`.

Completed route:

- `/(ops)/courier/completed`.

Rules:

- Pass only `deliveryId` and return route.
- Do not pass receiver phone, OTP, or scan code through params.
- Do not add query params with sensitive data.
- Preserve list filter in route state when returning.

## Error Handling

API errors:

- `UNAUTHORIZED`: clear cache and route to sign-in.
- `FORBIDDEN`: clear cache, show role mismatch, route to sign-in.
- `NETWORK_ERROR`: show cache if available; otherwise full retry panel.
- `RATE_LIMITED`: show retry after label if available.
- `INTERNAL`: show retry and request ID.
- `VALIDATION_ERROR`: log as client defect and show retry.

Row-level inconsistencies:

- Missing delivery ID: do not render row; log sanitized client error.
- Missing tracking code: render `Tracking pending` only if backend allows; otherwise row goes to needs review.
- Missing receiver name: render `Receiver name unavailable`; do not infer from address.
- Missing station ID: render `Station pending`.
- Unknown status: render `Needs review`.

Do not:

- Show raw backend stack traces.
- Show JSON payloads.
- Show hidden personal data in error messages.
- Retry infinitely.

## Content Design

Header title:

- `Assigned doorstep jobs`

Header subtitles:

- `{count} active jobs`
- `No active assigned jobs`
- `Saved {time} ago`

Authority copy:

- `Live assignments`
- `Refreshing assignments`
- `Saved assignments`
- `Saved list may be out of date`
- `Queued action waiting to sync`

Tab labels:

- `Active`
- `Needs scan`
- `Out now`
- `Blocked`

Group titles:

- `Needs custody scan`
- `Out for delivery`
- `Needs follow-up`
- `Blocked`
- `Needs review`

Primary actions:

- `Accept by scan`
- `Complete handoff`
- `Record attempt`
- `Open issue`
- `Review details`

Empty copy:

- `No active doorstep jobs are assigned to you right now.`
- `Pull to refresh or check with the destination station if you expected a job.`

Offline empty copy:

- `No saved assignments on this device. Reconnect to load your courier queue.`

Search empty copy:

- `No assigned jobs match this search.`

## Analytics

Emit sanitized events only.

Events:

- `courier_assignments_viewed`
- `courier_assignments_refreshed`
- `courier_assignments_refresh_failed`
- `courier_assignments_filter_changed`
- `courier_assignments_search_used`
- `courier_assignment_primary_action_opened`
- `courier_assignment_detail_opened`
- `courier_assignments_offline_cache_rendered`
- `courier_assignments_outbox_opened`
- `courier_assignments_unknown_status_seen`

Allowed properties:

- `active_count`
- `visible_count`
- `tab`
- `has_query`
- `status_group`
- `delivery_id_hash`
- `tracking_code_hash`
- `next_action`
- `network_state`
- `cache_age_bucket`
- `queued_action_count`
- `request_id`

Forbidden properties:

- Receiver phone.
- Full receiver name in analytics.
- Full tracking code.
- Full address.
- OTP.
- Package scan code.
- GPS.
- Proof asset reference.

## Security And Privacy

Data minimization:

- Store and render only fields needed for queue triage.
- Hash delivery identifiers in analytics.
- Never persist receiver contact fields on this screen.
- Never add hidden address text for screen readers.

Cache security:

- Cache key must include courier user ID.
- Cache must clear on sign-out.
- Cache must clear on role change.
- Cache schema changes must invalidate stale rows safely.

Transport:

- All data comes from authenticated API calls.
- Do not call public tracking endpoints from courier workspace.

Display:

- Use privacy-safe receiver display name.
- Use station labels rather than full address.
- Use child detail for receiver instructions only after authorized navigation.

## Performance Requirements

Targets:

- Cached first paint under `500ms` on supported devices.
- Network refresh should not block cached rendering.
- Initial network list under `2s` on normal 4G.
- Smooth list scroll at `60fps` where practical.
- No image downloads.
- No map rendering.
- No heavy calculations in render.

Implementation rules:

- Use a virtualized list for more than `12` rows.
- Precompute grouping outside row render.
- Keep row components pure and light.
- Avoid nested scroll containers.
- Avoid long synchronous date formatting loops.
- Keep local search O(n) over the scoped list.

## QA Acceptance Criteria

Functional:

- Route renders `screen-courier-assignments`.
- Screen requires `final_mile_courier`.
- Screen calls `list_deliveries?limit=50`.
- Only courier-scoped rows render.
- Active rows exclude closed statuses by default.
- Tabs filter correctly.
- Search filters by tracking code, receiver display name, and station ID.
- Primary row actions route to correct child screens.
- Detail route opens with delivery ID only.
- Pull-to-refresh refetches list.
- Returning from child workflow refreshes list.

Privacy:

- Receiver phone is never rendered.
- Full receiver address is never rendered.
- OTP is never rendered.
- Package scan code is never rendered.
- Proof asset reference is never rendered.
- Exact GPS is never rendered.
- Analytics contain no raw receiver or address data.

Offline:

- Cached rows render offline with visible saved label.
- Offline empty state appears when no cache exists.
- Queued action strip appears when outbox has courier delivery actions.
- Rows with queued action show waiting badge.
- Stale cache warning appears after freshness threshold.

Accessibility:

- Screen reader can identify header, filters, group headings, rows, and actions.
- Focus order follows visual order.
- Tabs expose selected state.
- Refresh results are announced.
- Row action touch targets are large enough.
- Text scales without truncating critical action labels.

Mutation boundary:

- Screen does not call `accept_final_mile_assignment`.
- Screen does not call `mark_out_for_delivery`.
- Screen does not call `complete_delivery`.
- Screen does not call `record_failed_attempt`.
- Screen only routes to child workflows for those operations.

## Automated Test Plan

Unit tests:

- `deriveCourierAssignmentsState`
- `filterActiveCourierAssignments`
- `groupCourierAssignments`
- `rankCourierAssignmentRows`
- `deriveCourierAssignmentNextAction`
- `sanitizeCourierAssignmentCacheRow`
- `filterCourierAssignmentsBySearch`
- `buildCourierAssignmentAnalyticsPayload`
- `getCourierAssignmentPrimaryRoute`

Unit assertions:

- `assigned_for_final_mile` maps to `needs_acceptance`.
- `out_for_delivery` maps to `in_delivery`.
- `issue_reported` maps to `blocked`.
- Closed statuses are hidden from active list.
- Unknown status maps to `needs_review`.
- Search does not inspect hidden fields.
- Sanitizer removes receiver phone, address, OTP, scan, proof, and GPS fields.
- Analytics hashes delivery identifiers.

Component tests:

- Renders `screen-courier-assignments`.
- Shows live ready state.
- Shows cached offline state.
- Shows empty state.
- Shows search empty state.
- Shows grouped rows.
- Shows tabs with counts.
- Opens accept scan route for assigned row.
- Opens proof route for out-for-delivery row.
- Opens detail route for unknown row.
- Does not render closed delivered row in active tab.
- Does not render receiver phone.
- Does not call mutation hooks.

Integration tests:

- Simulate `list_deliveries` as final-mile courier and verify scoped active rows.
- Refresh updates group counts.
- Returning from accept scan invalidates and refreshes list.
- Offline cache renders when network fails.
- Outbox queued action badge appears on matching row.
- Unauthorized response clears cache and routes to sign-in.

End-to-end checks:

- Courier signs in and lands on home.
- Courier opens assignments.
- Courier searches tracking code.
- Courier opens accept scan for assigned job.
- Courier returns and sees refreshed list.
- Courier opens proof flow for out-for-delivery job.

## Implementation Notes For Claude Code

Build this as a real production screen spec implementation, not a visual-only page.

Required files will likely include:

- Route file for `/(ops)/courier/assignments`.
- Courier assignments screen component.
- Courier assignment card component.
- Courier assignments data hook.
- Courier assignment grouping utilities.
- Courier assignment cache adapter.
- Tests for utilities and screen behavior.

Use current backend:

- `list_deliveries?limit=50`.
- Final-mile courier role scope.
- Existing route keys from the API contract.

Do not invent backend responses:

- No route distance.
- No live ETA.
- No exact assignment deadline.
- No address.
- No phone.
- No proof readiness.

Use progressive enhancement:

- If future fields exist, use them through optional mapping.
- If missing, fall back to status-based guidance.

Mutation boundary:

- This screen is read plus navigation.
- Child routes perform custody, out-for-delivery, proof, and failed attempt workflows.

## Final Implementation Decisions

The active queue must be grouped by current delivery state and courier action readiness, not by same-day policy buckets. If a trusted `assignedAt` value later exists, it can support secondary ordering inside the active groups, but it must not create a new primary bucket without a product policy update.

Station names must be resolved through the shared typed station-label adapter. If the adapter cannot safely resolve a display name, the UI must show the station ID with a `Station ID` label instead of inventing a name.

The screen must not infer optimized stop order. Multiple doorstep jobs must render in backend-provided order when available; otherwise they must use a stable local order based on urgent action state, delivery lifecycle state, and delivery short code.

Blocked jobs must route to the shared issues list with the delivery context. When a typed courier issue-detail route exists, the row action must route directly to that issue detail; until then, the generic issues list remains the required destination.

## Definition Of Done

The screen is complete when:

- It renders at `/(ops)/courier/assignments`.
- It exposes `screen-courier-assignments`.
- It uses the authenticated final-mile courier `list_deliveries` scope.
- It groups active assignments by operational state.
- It hides closed jobs by default.
- It supports search, tabs, refresh, cache, offline, and outbox indicators.
- It routes every primary row action to the correct child workflow.
- It never performs lifecycle mutations directly.
- It never exposes restricted receiver, scan, proof, or GPS data.
- It passes accessibility, privacy, offline, and route tests.
- It matches the final-mile courier policies in the local docs.

## Final Build Instruction

Build `CourierAssignments` as the active work queue for final-mile couriers. It must be scoped by `list_deliveries`, grouped by custody-safe status, searchable without exposing sensitive receiver data, offline-aware, and route-only for lifecycle actions. It should feel serious, fast, and field-ready: a courier can open it in poor network conditions and still know what job to handle next without risking loss of goods or privacy leakage.
