# Empty State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `empty` |
| Component family | Shared screen state |
| Primary component | `SharedEmptyState` |
| Supporting components | `FilteredEmptyState`, `FirstUseEmptyState`, `OperationalClearState`, `TableEmptyState`, `SectionEmptyState`, `ScopedEmptyState`, `PrivacySafeEmptyState` |
| Primary surfaces | public web, receiver public flow, sender mobile app, operations mobile app, admin web console |
| Required recovery | clear next action |
| Test id root | `state-empty` |
| Backend coverage | None directly; reflects resolved read responses with zero visible records or no actionable content |
| Browser mutation operation | None |
| Data sensitivity | empty reason, filters, role scope, safe target label, allowed next action |
| Offline critical | Yes where cached local stores may contain no records; no for admin web offline because admin web is online-only |
| Related inventory state | `empty` |
| Related state specs | loading, error, offline, stale data, not authorized, blocked by issue, manual review required |
| Design tokens | `brand.blue.600`, `success.green.600`, `warning.amber.600`, `neutral.900`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear headings, useful text alternatives, and keyboard-reachable recovery actions |

## Purpose
`SharedEmptyState` defines how every Kra surface communicates that a resolved view has no content to display for the user's current role, scope, filter, or lifecycle moment.

The empty state must answer:
- `Why is nothing shown?`
- `Is this expected, good, first-use, filtered, or scope-limited?`
- `What can the user do next?`
- `Can the user create, clear filters, refresh, or navigate?`
- `Is the absence caused by privacy, role scope, or unsupported access?`
- `What should not be inferred from no visible records?`
- `How does the state stay useful without inventing data?`

The most important rule is:
```text
Empty means the read completed and no visible content exists for this context. It is not loading, error, offline, or unauthorized.
```

## Product Job
Kra users often face moments where the correct result is no visible data:
- a new sender has no deliveries yet
- a station has no packages waiting right now
- a driver has no assigned run
- a courier has no doorstep jobs
- an admin table has no rows for the selected scope
- a support queue is clear
- a reconciliation queue has no conflicts
- a webhook list has no returned events
- a filtered search hides every loaded row

An empty state must turn absence into clarity. It should either:
- guide the user to the next productive action
- confirm that no action is needed
- explain the active scope or filter
- route the user to the owner screen
- prevent a wrong operational assumption

It must never make the product feel broken or unfinished.

## Strategic Role
Kra is a delivery network. Empty states protect trust in three ways:

Customer trust:
- A sender with no deliveries sees how to create the first delivery.
- A receiver with no visible timeline understands whether the tracking link needs verification, has no events yet, or cannot show details.
- Public visitors understand when no station or service-area result is available without seeing internal network data.

Operational trust:
- A station operator sees that no packages need action right now.
- A driver sees there is no assigned run rather than thinking the app failed.
- A courier sees no doorstep jobs instead of repeatedly refreshing.
- Admins see clear queues and clean exception lists as positive operational states.

Engineering trust:
- Empty states are driven by completed reads, not guessed UI assumptions.
- Filtered-empty is different from unfiltered-empty.
- Role-scope empty is different from permission denied.
- Offline-empty is different from online-empty.
- First-use empty is different from clean-queue empty.

## External Research Used
Only directly relevant empty-state and no-record guidance was used:
- [Carbon Design System empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/): supports separating first-use, no-results, and system-related absence patterns while giving users the right next step.
- [SAP Fiori empty states](https://www.sap.com/design-system/fiori-design-web/v1-136/foundations/best-practices/global-patterns/designing-for-empty-states): supports distinguishing no-data, user-action, and error cases so empty states do not replace error states.
- [Atlassian Design System empty state](https://atlassian.design/components/empty-state/): supports concise context, useful guidance, and action-oriented empty spaces.
- [Material Design empty states](https://m2.material.io/design/communication/empty-states.html): supports clear message hierarchy for screens or components with no content.
- [Stack Overflow Design System empty states](https://stackoverflow.design/system/components/empty-states/): supports no-data and no-results states with clear next-step guidance.

## Visual Thesis
Empty states should feel like a calm dispatch desk with no active work: useful, credible, clean, and ready for the next action.

Use:
- a clear title
- one short explanation
- one primary recovery action when action is available
- one secondary action at most
- restrained illustration only when it adds orientation
- stable table or section boundaries
- positive operational tone when a clear queue is good

Do not use:
- blank white space with no explanation
- vague copy
- celebratory art for risk-sensitive admin contexts
- large decorative graphics on field mobile screens
- data-looking values that are not returned by the backend
- action buttons that call unsupported backend routes
- empty state as a cover for errors, loading, unauthorized, or offline

## Audience
Primary users:
- public visitor checking covered corridors or tracking entry
- receiver opening secure tracking context
- sender starting or managing delivery activity
- station operator checking intake, dispatch, receipt, issue, and queue work
- driver checking assigned runs, pickup, and handoff work
- final-mile courier checking jobs, proof work, and earnings context
- admin reviewing deliveries, stations, users, pricing, finance, support, audit, webhook, and analytics data

Secondary users:
- support staff guiding customers through no-record cases
- finance reviewer confirming clean reconciliation queues
- ops lead confirming no blocked packages
- QA validating no-data and no-results behavior
- accessibility reviewer validating heading and action structure
- Claude Code implementing shared state components later

Non-users:
- unauthenticated attacker
- webhook provider
- scheduled task
- browser extension

## Non-Goals
Do not use the empty state for:
- loading in progress
- request failure
- offline connection failure
- stale cached data
- permission denial
- session expiration
- rate limit
- blocked payment
- manual review
- issue blocker
- custody conflict
- scan mismatch
- duplicate package label
- backend unsupported route
- legal acceptance
- payment provider return
- refund settlement delay

If the system cannot confirm a completed read with no visible content, it is not an empty state.

## Empty State Taxonomy
Kra must treat empty states as distinct operational moments.

| Mode | Meaning | Primary Recovery |
| --- | --- | --- |
| `first_use_empty` | User has not created or received records yet | explain what will appear and offer first action |
| `clean_queue_empty` | Operational queue is clear | reassure, show freshness, offer refresh or related route |
| `unfiltered_empty` | Backend returned zero records for the current route scope | explain scope and offer valid next action |
| `filtered_empty` | Existing or returned records are hidden by active filters or local search | clear filters or adjust query |
| `section_empty` | One panel inside a populated screen has no content | keep page content and explain only that section |
| `partial_empty` | Some datasets are empty while other datasets have content | mark the empty area without replacing the page |
| `scoped_empty` | Role, station, or account scope has no visible records | explain scope without exposing restricted data |
| `privacy_safe_empty` | Public or receiver surface cannot reveal whether restricted data exists | give safe guidance without confirming sensitive records |
| `not_started_empty` | A lifecycle has not produced events yet | explain the first expected event |
| `completed_work_empty` | A user has completed all actionable work | reinforce that no action is needed |
| `local_store_empty` | Offline-capable local store has no queued or cached records | explain local scope and refresh/sync path |

## State Machine
```text
loading
  -> ready
  -> empty
  -> filtered_empty
  -> ready
```

Route first-use:
```text
auth_ready
  -> initial_data_loading
  -> first_use_empty
  -> user_starts_first_action
```

Operational clear queue:
```text
queue_loading
  -> clean_queue_empty
  -> refreshing
  -> ready | clean_queue_empty | error | stale_data
```

Filtered no-results:
```text
ready
  -> user_applies_filter
  -> filter_loading | local_filtering
  -> filtered_empty
  -> user_clears_filter
  -> ready | unfiltered_empty
```

Privacy-safe public flow:
```text
public_query_resolved
  -> privacy_safe_empty | not_found | expired | access_denied | ready
```

## Entry Rules
Enter `empty` when:
- the read request has completed successfully
- the local selector has completed successfully
- the current role and scope are known
- the result contains no visible records for this screen or section
- the no-content result is not caused by auth denial
- the no-content result is not caused by request failure
- the no-content result is not caused by offline unavailability
- the no-content result is not still loading

Enter `filtered_empty` when:
- unfiltered records exist or the user has active filters
- filters, search text, date range, status, role, station, or scope controls are hiding all visible results
- the UI can provide a clear filter recovery

Enter `clean_queue_empty` when:
- the queue is an operational work list
- zero rows means no work is needed right now
- the result is fresh enough to trust or clearly timestamped

Enter `first_use_empty` when:
- the user has never created or received the relevant record type in the current account
- the screen has a safe primary activation route
- the empty state can explain what appears after first action

## Exit Rules
Exit `empty` when:
- user creates the first record
- user clears filters
- user changes scope
- user refreshes and records appear
- backend returns a failure
- auth state changes
- session expires
- offline state replaces the read
- stale cached data must be shown instead

Exit targets:
- `ready`
- `loading`
- `error`
- `offline`
- `stale_data`
- `not_authorized`
- `session_expired`
- route-specific first-action flow

## Global Interaction Rules
Every empty state must include a useful next step unless no action is truly required.

Allowed actions:
- create first delivery
- clear filters
- reset search
- refresh
- open owner screen
- open support route
- return to dashboard
- view history
- start station scan
- open station settings when admin-capable
- open issue queue
- open reconciliation

Disallowed actions:
- unsupported mutation
- direct backend state transition
- bypass payment
- bypass proof
- bypass custody
- unrestricted retry when no request failed
- broad admin override
- exposing restricted details through an action label

Primary action rules:
- Use one primary action.
- Use one secondary action only when it reduces confusion.
- If no action is needed, primary action can be absent.
- If refresh is available, it should not imply an error.
- If filters are active, `Clear filters` is usually primary.
- If first-use and creation is allowed, creation is primary.
- If clean queue, primary can be `Refresh` or no primary action.

## Copy Rules
Empty-state copy must be specific, honest, and role-safe.

Structure:
- title: one line, clear state
- body: one or two lines explaining why nothing is visible
- primary action: direct verb phrase
- secondary action: optional, only if useful

Good title patterns:
- `No deliveries yet`
- `No packages need action right now`
- `No results match these filters`
- `No blocked deliveries`
- `No webhook events returned`
- `No proof attached yet`
- `No queued offline actions`
- `No reconciliation conflicts`

Body copy should answer:
- what the empty space represents
- whether action is needed
- how to recover or proceed

Do not use:
- `Nothing here`
- `No data`
- `No records`
- `Try again`
- `Whoops`
- `All caught up!` on risk-sensitive surfaces
- `Everything is perfect`
- `No problem found` unless backed by a specific check
- `You have no access` when the correct state is permission denied

## Tone Rules
Use tone by context:
- First-use: helpful and activating.
- Clean queue: calm and operational.
- Filtered no-results: practical and corrective.
- Public no-result: privacy-safe and non-committal.
- Admin no-result: precise and source-aware.
- Staff no-work: clear, not playful.
- Finance no-conflict: conservative, not celebratory.
- Support no-issue: reassuring but not absolute.

Avoid overconfidence:
- Do not say the network has no problems unless all relevant source checks support it.
- Do not say no packages exist when the result only covers a station, role, or filter.
- Do not say no payment issue exists when only the current page has no rows.
- Do not say a receiver has no package unless the verified public tracking flow supports that conclusion.

## Visual System
Empty states should be visually calm and structured.

Approved layout:
- compact centered panel for full-page or single-purpose empty states
- table-embedded panel for admin tables
- card-embedded panel for mobile sections
- inline row for small subsections
- status strip for clean operational queues
- first-use card with one strong CTA

Visual elements:
- title in `neutral.900`
- body in `neutral.700`
- tertiary note in `neutral.500`
- primary action in `brand.blue.600`
- clean queue icon or accent may use `success.green.600`
- filter recovery accent may use `brand.blue.600`
- warning only when absence requires attention

Illustration rules:
- Optional only.
- Must not be the main information carrier.
- Must not imply a business outcome.
- Must not add heavy mobile payload.
- Must not use cartoon delivery art in admin risk workflows.
- Must have empty `alt` text if purely decorative.
- Must have meaningful alternative text if it conveys information.

## Layout Rules
For admin web:
- Keep page header and filters visible.
- Keep table headers visible where schema is known.
- Place empty panel inside table body or content region.
- Show active filters above or inside the empty panel.
- Keep row count and freshness context where available.
- Use compact state for dense operations tools.

For mobile:
- Keep app header and bottom navigation stable.
- Keep primary CTA reachable.
- Keep empty copy short.
- Use one card or panel, not a long wall of text.
- Use large enough tap targets.
- Do not push recovery action below the fold on common phone sizes.

For public and receiver:
- Keep brand header stable.
- Keep customer-safe context only.
- Avoid operational detail.
- Offer a safe route such as track another package, verify access, or contact support when supported.

## Accessibility Rules
Every empty state must be understandable through heading structure and accessible actions.

Requirements:
- Use a real heading for the empty-state title.
- The heading level must fit the page hierarchy.
- The empty region must have an accessible name.
- Primary action must have a visible label and accessible name.
- Decorative art must be ignored by assistive tech.
- Important counts and filter names must be text, not color only.
- Focus must not jump when a list changes to empty after filtering unless the user action requires focus management.
- If filters produce `filtered_empty`, focus may move to the empty heading only after a submitted search or route-level filter apply.
- `Clear filters` must be keyboard reachable.
- `Refresh` must be keyboard reachable where available.
- Screen readers must not hear hidden previous rows after the empty state renders.
- Large text must not overlap actions.

Suggested announcement after submitted filter:
```text
No results match these filters.
```

Suggested announcement after clearing queue:
```text
No packages need action right now.
```

## Privacy Rules
Public and receiver empty states must not confirm restricted facts.

Do not reveal:
- sender identity
- receiver phone unless already verified
- internal station staff details
- staff assignment IDs
- provider references
- audit metadata
- raw issue text
- payment internals
- whether a hidden admin record exists

Safe public copy:
```text
We could not show a delivery for this tracking context.
```

Unsafe public copy:
```text
This sender has no active package.
```

Receiver no-event copy:
```text
No public tracking events are available yet.
```

## Security Rules
Empty state must not substitute for authorization.

Rules:
- If the user lacks permission, render `not_authorized`.
- If the session expired, render `session_expired`.
- If the role scope returns zero rows, render `scoped_empty` only after auth succeeds.
- Do not reveal that restricted records exist outside the user's role scope.
- Do not include admin-only route links in sender, receiver, staff, or public empty states.
- Do not include user-management recovery action unless the actor has the required capability.

## Offline And Low-Bandwidth Rules
Empty and offline can overlap only when the local store is readable.

Rules:
- If the device is offline and no local store was read, render `offline`, not `empty`.
- If the local outbox was read and has zero queued actions, render `local_store_empty`.
- If cached delivery data is absent while offline, render offline guidance, not online empty.
- If cached data is present but stale, render stale data state, not empty.
- Keep illustrations light or omit them on mobile operational roles.
- Do not require remote imagery to explain an empty state.

Local outbox copy:
```text
No queued offline actions.
```

Local outbox body:
```text
Actions saved on this device will appear here until they sync.
```

## Surface-Specific Behavior
### Public Web
Use empty states for:
- service-area lookup with no covered route
- station directory with no public stations in the selected corridor
- public tracking entry when no safe result can be shown after a valid lookup state
- support entry history only if authenticated support history exists later

Rules:
- Do not expose internal launch or station readiness data.
- Offer `Check another route` or `Track another package` only when supported.
- Avoid unsupported customer promises.
- Keep marketing pages from rendering full empty screens unless the whole section has no content.

### Receiver Public Flow
Use empty states for:
- receiver-safe timeline has no public events yet
- no verified delivery detail can be shown for the current public context
- phone challenge state has no active prior challenge

Rules:
- Prefer verification or safe tracking action over broad explanation.
- Never confirm whether another receiver or sender has hidden access.
- If link expired, use expired state, not empty.
- If OTP invalid, use validation error, not empty.

### Sender Mobile App
Use empty states for:
- no deliveries yet
- no active deliveries
- no delivery history for filters
- no notifications
- no support threads
- no receipt history where receipt route is supported

Rules:
- First-use sender home primary action is `Create delivery`.
- History filtered-empty primary action is `Clear filters`.
- Notifications empty state should not imply delivery status is unchanged.
- Issue/support empty state can route to create issue only where issue creation is supported.
- Receipt empty state must not imply no payment exists outside loaded scope.

### Station Operator Mobile App
Use empty states for:
- no intake queue
- no dispatch queue
- no destination receipt queue
- no station issues
- no queued offline actions

Rules:
- Clean queue copy should make it clear no immediate action is needed.
- Keep station name or ID visible.
- Refresh action may be available.
- Scan action should appear only on screens where scanning is the valid next task.
- Do not suggest package movement if custody is not confirmed.

### Driver Mobile App
Use empty states for:
- no assigned runs
- no pickup tasks
- no handoff tasks
- no completed jobs in selected period
- no local queued actions

Rules:
- Empty state must not imply driver is off duty unless backend returns that state.
- Offer refresh or return home.
- Do not expose route assignments outside driver scope.
- If assignment loading failed, render error.

### Final-Mile Courier Mobile App
Use empty states for:
- no assigned doorstep jobs
- no pending proof tasks
- no failed-attempt history for filters
- no earnings in selected period
- no local queued actions

Rules:
- Earnings empty state must say no payable earnings in selected period, not no earnings ever.
- Proof empty state must not bypass proof requirements.
- Doorstep job empty state can route to refresh or completed jobs where supported.

### Admin Web Console
Use empty states for:
- admin overview with no activity yet
- delivery explorer zero rows
- blocked delivery queue clear
- station list zero rows
- station detail sections with no queue rows
- user list zero rows
- staff activity log zero rows
- pricing rules zero rows
- finance records zero rows
- reconciliation conflicts zero rows
- issue queue clear
- audit events zero rows
- webhook events zero rows
- analytics tables with no values
- outbound notifications zero rows

Rules:
- Admin empty states must name source scope and active filters.
- Clean operational queues can use restrained success treatment.
- Finance and audit empty states should stay conservative.
- User-management empty state must not offer creation unless the backend owner flow exists and actor has capability.
- Webhook empty state must not imply providers are healthy; it only says no returned rows exist for current scope.

## Component Contract
### `SharedEmptyState`
Required props:
```ts
type SharedEmptyStateProps = {
  mode:
    | "first_use_empty"
    | "clean_queue_empty"
    | "unfiltered_empty"
    | "filtered_empty"
    | "section_empty"
    | "partial_empty"
    | "scoped_empty"
    | "privacy_safe_empty"
    | "not_started_empty"
    | "completed_work_empty"
    | "local_store_empty";
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
  scopeLabel?: string;
  activeFilterLabels?: string[];
  freshnessLabel?: string;
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
  illustration?: {
    name: string;
    informativeLabel?: string;
  };
  testId?: string;
};
```

Implementation notes:
- `primaryAction` is optional for clean queues.
- `activeFilterLabels` is required for `filtered_empty`.
- `scopeLabel` is required for `scoped_empty` when safe.
- `illustration.informativeLabel` is required only when the visual conveys meaning.
- Public and receiver surfaces must reject unsafe labels before rendering.

### `FilteredEmptyState`
Use when active filters or local search produce zero visible results.

Required behavior:
- Show active filters.
- Provide `Clear filters` as primary action unless route-specific action is safer.
- Keep search/filter controls visible.
- Preserve the user's search term.
- Do not imply no records exist outside the filters.

### `FirstUseEmptyState`
Use for new-account or new-feature activation.

Required behavior:
- Explain what will appear after first action.
- Offer the correct first action.
- Keep copy short.
- Avoid multi-step onboarding inside the empty panel.
- Do not show admin-only guidance to customer roles.

### `OperationalClearState`
Use when no work is needed right now.

Required behavior:
- Make clear that the queue is clear for current scope.
- Show timestamp or freshness where available.
- Offer refresh only if useful.
- Avoid excessive celebration.
- Avoid declaring broader system health than the query proves.

### `TableEmptyState`
Use for admin data tables.

Required behavior:
- Keep headers visible when schema is known.
- Span the table body area.
- Show active filters and result scope.
- Keep sort and filter controls stable.
- Use compact density.

### `SectionEmptyState`
Use inside a populated screen.

Required behavior:
- Do not replace the entire page.
- Use smaller title scale.
- Keep section heading visible.
- Keep other page content available.
- Use action only if it affects that section.

## Data And API Integration
Empty state must be driven by completed reads and selectors.

For RTK Query reads:
- `isLoading` maps to loading, not empty.
- `isFetching` with cached rows maps to refreshing, not empty.
- successful response with zero visible rows maps to empty.
- successful response with rows hidden by local filters maps to filtered-empty.
- error response maps to error.
- 401 maps to session expired where applicable.
- 403 maps to not authorized.

For local selectors:
- selector not ready maps to loading.
- selector returns zero records after local store read maps to local store empty.
- selector returns records hidden by local filters maps to filtered-empty.

For admin list endpoints:
- zero backend rows with no active local filters maps to unfiltered empty.
- nonzero backend rows plus local filter zero visible rows maps to filtered-empty.
- backend filter zero rows maps to empty with filter scope shown.
- local search must label that it searches loaded rows only when the backend lacks search.

## Copy Matrix
| Context | Mode | Title | Body | Primary Action |
| --- | --- | --- | --- | --- |
| Sender home first use | `first_use_empty` | `No deliveries yet` | `Create your first delivery to start tracking a package from pickup to arrival.` | `Create delivery` |
| Sender active list clear | `clean_queue_empty` | `No active deliveries` | `Deliveries that need payment, pickup, or tracking attention will appear here.` | `Create delivery` |
| Sender history filtered | `filtered_empty` | `No deliveries match these filters` | `Clear filters or change the date range to see more deliveries.` | `Clear filters` |
| Receiver timeline no event | `not_started_empty` | `No public tracking events yet` | `Events will appear here after the package reaches a trackable step.` | `Refresh` |
| Station intake queue | `clean_queue_empty` | `No packages waiting for intake` | `Packages assigned to this station for intake will appear here.` | `Refresh` |
| Station offline outbox | `local_store_empty` | `No queued offline actions` | `Actions saved on this device will appear here until they sync.` | `Refresh sync status` |
| Driver assignment | `clean_queue_empty` | `No assigned runs right now` | `Assigned pickup and handoff work will appear here.` | `Refresh` |
| Courier jobs | `clean_queue_empty` | `No doorstep jobs right now` | `Assigned final-mile jobs will appear here when ready.` | `Refresh` |
| Admin delivery explorer | `unfiltered_empty` | `No deliveries returned` | `No deliveries are visible for the current admin scope and query.` | `Refresh` |
| Admin delivery explorer filtered | `filtered_empty` | `No deliveries match these filters` | `Clear filters or adjust status, station, or date range.` | `Clear filters` |
| Admin blocked queue | `clean_queue_empty` | `No blocked deliveries` | `No payment, issue, custody, or station blockers are visible in this scope.` | `Refresh` |
| Admin reconciliation | `clean_queue_empty` | `No reconciliation conflicts` | `No conflicting payment records are visible for this scope.` | `Refresh` |
| Admin issue queue | `clean_queue_empty` | `No unresolved issues` | `Issues requiring triage will appear here.` | `Refresh` |
| Admin webhook events | `unfiltered_empty` | `No webhook events returned` | `No webhook rows are visible for the current filters and scope.` | `Refresh` |
| Admin audit events | `unfiltered_empty` | `No audit events returned` | `No audit rows are visible for the current query and role scope.` | `Refresh` |

## Role-Safe CTA Rules
Use CTAs only when supported by route and role.

Sender:
- `Create delivery`
- `Clear filters`
- `View all deliveries`
- `Refresh`

Receiver:
- `Verify access`
- `Track another package`
- `Refresh`
- `Contact support` only when support path is available

Station:
- `Scan package`
- `Refresh queue`
- `View offline queue`
- `Report issue`

Driver:
- `Refresh assignments`
- `View completed runs`
- `Report issue`

Courier:
- `Refresh jobs`
- `View completed jobs`
- `Report issue`

Admin:
- `Clear filters`
- `Refresh`
- `Open owner screen`
- `Create station` only if an implemented admin station creation owner exists
- `Open pricing rules` only if authorized
- `Open reconciliation` only if authorized

## Filtered Empty Rules
Filtered empty is a recovery state, not a dead end.

Required elements:
- title naming no matching result
- active filters listed
- clear filters action
- optional adjust filter guidance
- result scope or loaded-row scope when relevant

Do not say:
- `No deliveries exist`
- `No users exist`
- `No payments exist`
- `No station exists`

Say:
- `No deliveries match these filters`
- `No users match the loaded rows and filters`
- `No payment records match this view`

## First-Use Empty Rules
First-use empty states should activate the user without over-explaining the product.

Required elements:
- what will appear here
- one first action
- trust-safe note when money, proof, or privacy is involved

Sender first-use:
```text
No deliveries yet
Create your first delivery to start tracking a package from pickup to arrival.
```

Admin first-use:
```text
No station records returned
Stations will appear here after they are created and visible to this admin scope.
```

Staff first-use:
```text
No assigned work right now
Assigned package work will appear here when it is ready for your role.
```

## Clean Queue Rules
Clean queues are positive, but the copy must stay precise.

Use clean queue for:
- no blocked deliveries
- no station queue items
- no unresolved issues
- no reconciliation conflicts
- no dead-letter notifications
- no pending assignments
- no queued offline actions

Required:
- current scope
- freshness or refresh option where available
- restrained tone

Do not use broad health claims:
- `The whole network is clear`
- `No issues anywhere`
- `Everything is resolved`
- `All packages are safe`

Use scoped claims:
- `No blocked deliveries are visible in this scope.`
- `No packages need action at this station right now.`
- `No queued actions are saved on this device.`

## Section Empty Rules
A section empty state must not obscure the rest of the screen.

Examples:
- delivery detail has no proof attached yet
- station detail has no destination receipt rows
- admin user detail has no recent audit entries
- finance summary has no recent refund rows
- analytics has no values for a metric group

Rules:
- Keep section heading.
- Use compact state.
- Do not repeat full-page navigation.
- Do not use a primary CTA unless action belongs to that section.
- Do not replace all page content.

## Analytics Events
Track empty states where they affect activation, operations, or support.

Recommended events:
- `empty_state_viewed`
- `filtered_empty_state_viewed`
- `empty_state_primary_action_clicked`
- `empty_state_secondary_action_clicked`
- `empty_state_filter_cleared`
- `clean_queue_empty_viewed`
- `first_use_empty_viewed`

Required fields:
- `surface`
- `mode`
- `routeName`
- `actorRole`
- `scopeLabel`
- `hasActiveFilters`
- `filterCount`
- `primaryActionLabel`
- `dataSource`
- `resultCount`
- `visibleCount`

Do not send:
- raw search text from sensitive admin fields
- OTP values
- full phone numbers
- full addresses
- raw issue descriptions
- provider references
- audit payloads

## QA Acceptance Criteria
General:
- Empty state appears only after loading completes.
- Error state never renders as empty.
- Offline state never renders as empty unless local store read completed with zero records.
- Authorization failures never render as empty.
- Every full empty state has a clear reason.
- Every actionable empty state has one primary next action.
- Filtered-empty states list active filters and offer clear filters.
- Section empty states do not replace the full page.
- Copy does not expose restricted data.
- Public and receiver empty states are privacy-safe.

Mobile:
- Primary action is reachable on common phone sizes.
- Empty copy remains short with large text.
- Empty art is omitted or light for field roles.
- Refresh or scan actions do not move unexpectedly.

Admin web:
- Table empty state preserves headers where schema is known.
- Filter controls remain visible.
- Row count or scope is shown when useful.
- Clean queues use precise scoped language.

## Unit Test Requirements
Tests must cover:
- all `SharedEmptyState` modes render
- title and body are required
- `filtered_empty` requires active filter labels
- `scoped_empty` requires safe scope label when present
- public and receiver surfaces reject unsafe context labels
- primary action renders when provided
- no primary action is allowed for clean queues
- decorative illustration is hidden from assistive tech
- informative illustration requires accessible label
- empty state does not render during loading
- empty state does not render for error response

## Component Test Requirements
Use component tests for:
- sender first-use empty
- sender filtered history empty
- receiver timeline no-event empty
- station queue clean empty
- driver assignment clean empty
- courier jobs clean empty
- admin table unfiltered empty
- admin table filtered empty
- admin reconciliation clean empty
- offline outbox local-store empty

Assertions:
- correct title
- correct body
- correct primary action
- correct secondary action when present
- correct active filter rendering
- no restricted fields
- keyboard reachability
- large text stability

## E2E Test Requirements
Critical journeys:
- New sender lands on home with no deliveries and opens create delivery.
- Sender filters history to zero results and clears filters.
- Receiver opens verified timeline with no public events and sees safe copy.
- Station operator sees no intake queue and can refresh.
- Driver sees no assigned run and cannot infer broader schedule state.
- Courier sees no doorstep jobs and can refresh.
- Admin delivery explorer returns zero rows and preserves filters.
- Admin issue queue clear state does not imply all support work is resolved outside scope.
- Admin reconciliation has no conflicts and can refresh.
- Offline outbox has zero local actions after local store read.

Network and state scenarios:
- empty after slow read
- empty after refresh
- filtered empty after local search
- filtered empty after backend filter
- role scope empty
- privacy-safe public empty
- local store empty while online
- offline with no local read renders offline, not empty

## Visual QA Checklist
Before closing implementation, inspect:
- desktop admin table empty
- desktop admin filtered empty
- desktop clean queue
- mobile first-use sender empty
- mobile station clean queue
- mobile driver no assignment
- mobile courier no jobs
- receiver public no-event empty
- large text
- reduced motion
- keyboard focus
- screen reader heading order
- no remote illustration dependency on field mobile paths

The empty UI should pass the five-role critique:
- Founder: the product feels alive even when there are no records.
- Skeptical customer: the absence is explained without overpromising.
- Operator: the no-work state is clear and scoped.
- Accessibility reviewer: the state is announced and actionable without confusion.
- Creative director: the design uses restraint and precise copy, not filler art.

## Implementation Sequence For Claude Code
Build in this order:
1. Add shared empty state mode types in the shared frontend contract location.
2. Implement `SharedEmptyState`.
3. Implement `FilteredEmptyState`.
4. Implement `FirstUseEmptyState`.
5. Implement `OperationalClearState`.
6. Implement `TableEmptyState`.
7. Implement `SectionEmptyState`.
8. Add privacy guard helpers for public and receiver labels.
9. Wire RTK Query success-with-zero rows into the correct mode.
10. Wire local search and filter zero-visible rows into `filtered_empty`.
11. Wire local outbox zero records into `local_store_empty`.
12. Add unit tests.
13. Add component tests.
14. Add critical E2E tests.

Do not style empty states separately per route before the shared state library exists.

## Route Integration Checklist
Each screen spec that references `empty` must specify:
- whether empty is first-use, clean queue, unfiltered, filtered, section, scoped, privacy-safe, not-started, completed-work, or local-store
- which read source completed
- whether filters are active
- what scope is safe to show
- what title and body copy render
- what primary action is available
- what secondary action is available
- what fields are forbidden in the empty state
- whether table headers remain visible
- whether freshness is shown
- analytics event name
- test ID suffix

If a screen cannot answer these items, its empty behavior is incomplete.

## Test IDs
Required shared test IDs:
- `state-empty`
- `state-empty-title`
- `state-empty-body`
- `state-empty-scope`
- `state-empty-filters`
- `state-empty-primary-action`
- `state-empty-secondary-action`
- `state-empty-illustration`
- `state-empty-table`
- `state-empty-section`
- `state-empty-clear-filters`
- `state-empty-refresh`

Mode-specific test ID pattern:
```text
state-empty-{mode}
```

Surface-specific test ID pattern:
```text
state-empty-{surface}-{mode}
```

## Failure Modes To Prevent
The implementation must prevent:
- showing empty while data is still loading
- showing empty after request failure
- showing empty for authorization failure
- showing empty for expired session
- hiding active filters
- saying no records exist when only filters hide them
- saying no records exist outside the user's role scope
- exposing restricted public or receiver context
- using broad health claims for narrow queries
- offering unsupported creation or mutation action
- replacing a populated page with full-page empty because one section is empty
- hiding table headers in admin no-results states
- requiring remote decorative art to understand the state
- leaving the user without recovery when recovery is available

## Definition Of Done
This shared empty state is complete when:
- all empty modes exist
- first-use, clean queue, filtered, scoped, section, and local-store cases are distinct
- every empty state has specific role-safe copy
- every actionable empty state has a valid next action
- every filtered empty state includes active filter recovery
- public and receiver variants are privacy-safe
- admin table variants preserve filters and headers
- mobile variants keep action reachable
- error, offline, unauthorized, session expired, and loading are not rendered as empty
- unit, component, and E2E tests cover critical empty paths
- visual QA passes desktop, mobile, large text, reduced motion, and screen reader checks

