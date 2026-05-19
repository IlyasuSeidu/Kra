# Station Support Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationSupport` |
| App | `apps/mobile` |
| Route | `/(ops)/station/support` |
| Primary test ID | `screen-station-support` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | `GET /v1/issues`, `POST /v1/issues`, `issueListQuerySchema`, `issueListResponseSchema`, `issueResponseSchema`, `createIssueRequestSchema`, `apiErrorResponseSchema`, `Idempotency-Key`, station-scoped delivery access, local offline issue-create queue |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/blocked`, `/(ops)/station/handoffs`, `/(ops)/station/reports`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/support` |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `refreshing`, `offline_cached`, `stale_cache`, `delivery_required`, `create_delivery_issue`, `queued_offline`, `station_issue_not_supported`, `contact_options`, `not_authorized`, `session_expired`, `rate_limited`, `api_error`, `partial_data` |

## Product Job
This screen gives station operators a station-specific support hub for delivery-linked issues, station blockers, and urgent escalation guidance without giving them admin-only issue authority.

The screen answers one operational question: `What support issue is affecting this station, and what is the safest next step?`

The station operator should be able to:
- See active issues for deliveries accessible to their station.
- Identify P1 issues quickly.
- Open blocked queue, handoff log, delivery detail, or custody chain from support context.
- Start a delivery-linked issue through `OpsIssueCreate`.
- Understand when a station-wide issue cannot yet be recorded by current backend contracts.
- See the correct severity guidance for station incidents.
- See support hours and urgent P1 escalation guidance.
- Queue delivery-linked issue creation offline when a delivery context exists.
- Open offline outbox when an issue report is queued.
- Recover from authorization, session, stale data, offline, rate-limit, and backend-error states.

This screen is not:
- A support-admin resolution console.
- An issue escalation mutation screen.
- A station status override.
- A station validation editor.
- A live chat implementation.
- A payment refund approval screen.
- A payment reconciliation screen.
- A custody mutation screen.
- A package scan workflow.
- A staff performance complaint page.
- A cross-station issue queue.
- A place to expose receiver phone, receiver address, raw scan code, raw proof reference, raw actor ID, private notes, or internal error details.

## Audience
Primary audience:
- Station operators needing help with intake, dispatch, receipt, final-mile, blocked packages, or handoff evidence.
- Station leads handling shift incidents.
- Station staff working with weak network while needing issue evidence preserved.

Secondary audience:
- Claude Code implementing station support.
- QA validating station issue scope and offline issue-creation behavior.
- Backend engineers validating station-level support endpoint gaps.
- Operations leads validating severity and support routing.
- Support admins validating handoff from station to support.
- Security reviewers validating sensitive data boundaries.
- Accessibility reviewers validating form entry, filters, status messages, and recovery states.

## User State
The user is likely blocked or uncertain. They may have a package in hand, a driver waiting, a receiver asking for status, or a local action that did not sync. The support hub must move them to a safe route fast without pretending it can solve admin-owned work locally.

The user may be:
- Reporting damaged packaging.
- Reporting missing package evidence.
- Reporting a payment block seen during station work.
- Reporting a handoff mismatch.
- Reporting a package that cannot be found in station storage.
- Reporting repeated scan failure.
- Opening support from the blocked queue.
- Opening support from the handoff log.
- Opening support from offline action recovery.
- Checking support hours for an urgent P1 issue.
- Trying to report a station-wide issue such as device failure or station backlog.

The screen must:
- Require `role=station_operator`.
- Require a valid authenticated `stationId`.
- Keep all visible issues station-scoped through backend delivery access.
- Explain that issue creation is delivery-linked in the current backend.
- Route station-wide incidents to configured support contact guidance until backend supports station-level issue creation.
- Keep severity guidance clear and short.
- Keep issue creation separate from admin resolution and escalation.
- Preserve local issue-create payloads safely when offline.
- Never allow a station operator to close, resolve, or escalate an issue through admin endpoints.

## Backend Contract
List endpoint:
- `GET /v1/issues`

List query:
- `deliveryId`: optional.
- `status`: optional issue status.
- `severity`: optional issue severity.
- `limit`: optional positive integer, maximum `100`.

List response:
- `issues`: array of `issueResponseSchema`.

Issue response:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description` when present
- `reporter.actorId`
- `reporter.actorRole`
- optional escalation fields
- optional resolution fields
- `createdAt`
- `updatedAt`

Creation endpoint:
- `POST /v1/issues`

Create request:
- `deliveryId`: required.
- `category`: required, one of `delay`, `damage`, `loss`, `payment`, `handoff`, `other`.
- `severity`: required, one of `p1`, `p2`, `p3`.
- `summary`: required, minimum `5`, maximum `160` characters after trim.
- `description`: optional, minimum `5`, maximum `500` characters after trim.

Creation behavior:
- New issue starts as `open`.
- Reporter comes from authenticated actor.
- Delivery must exist.
- Principal must have access to the delivery.
- Station operator can create only for accessible station deliveries.
- `create_issue` is idempotent and must use `Idempotency-Key`.

Admin-only issue actions:
- Issue escalation is governed by admin/support policy.
- Issue resolution is governed by admin/support policy.
- Station support must not call `/v1/issues/:id/escalate`.
- Station support must not call `/v1/issues/:id/resolve`.

## Current Backend Gap
There is no station-level support request endpoint.

Missing endpoint:
- `POST /v1/station/support-requests`

Current limitations:
- `create_issue` requires a `deliveryId`.
- A station-wide issue such as device failure, station backlog, staff sign-in outage, storage incident, or scanner hardware fault cannot be recorded without tying it to a delivery.
- `GET /v1/issues` lists accessible delivery-linked issues; it is not a station-wide incident feed.
- No support thread or chat endpoint exists for station operators.
- No backend field returns support operating hours or phone/WhatsApp contact configuration.
- No backend route lets station operators escalate an existing issue directly.

Buildable current mode:
- Use `GET /v1/issues` with `status=open`, `status=in_review`, and `status=escalated` where useful.
- Show only issues for deliveries the backend permits.
- Route delivery-linked new reports to `/(ops)/deliveries/:deliveryId/issues/new`.
- If no delivery is selected, ask the user to scan/search/open the delivery first.
- For station-wide incidents, show support contact guidance and mark backend station issue creation as not yet supported.
- Use offline outbox only for delivery-linked issue creation with a stable `deliveryId`.

Production-ready recommendation:
- Add `POST /v1/station/support-requests`.
- Request fields: `stationId`, `category`, `severity`, `summary`, optional `description`, optional `deliveryId`, optional `localActionId`, optional `deviceContext`.
- Response fields: support request ID, station ID, status, severity, owner role, createdAt, updatedAt.
- Add `GET /v1/station/support-requests?stationId=&status=&severity=&limit=&cursor=`.
- Add support contact configuration endpoint for support hours, urgent P1 phone line, WhatsApp line, and fallback owner.
- Keep admin escalation and resolution separate.

## Source Reference Inputs
Use these references as design and implementation constraints, not as product claims beyond current backend:
- NIST SP 800-61 Rev. 2 frames incident handling as disciplined identification, handling, response, and learning; station support should gather structured facts and route ownership rather than create vague notes.
- WCAG 2.2 Understanding lists input assistance, labels, error identification, target size, focus, and status-message guidance relevant to issue forms and support state changes.
- GOV.UK Design System error-message guidance says validation errors should be near the field, keep user-entered data, be specific, and avoid generic errors.
- Android offline-first guidance requires local reads for critical offline tasks and clear separation between local and network data sources.
- GOV.UK service manual question guidance recommends short, action-focused help text and tolerant validation that helps users provide the right information.

Reference links:
- [NIST SP 800-61 Rev. 2](https://www.nist.gov/publications/computer-security-incident-handling-guide)
- [WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/)
- [GOV.UK error message guidance](https://design-system.service.gov.uk/components/error-message/)
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [GOV.UK designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions)

## Screen Thesis
The screen should feel like a station incident desk: direct, calm, structured, and strict about what can be submitted now.

The operator should understand in three seconds:
- Whether support data is live, cached, partial, or offline.
- Whether any P1 issue is active.
- Whether they need to open a delivery before reporting.
- Which route handles the issue: blocked queue, handoff log, delivery detail, issue creation, outbox, or external support contact.
- Which actions are not available to station operators.

Visual thesis:
- Use a field-operations support layout with urgent issue cards, quick route panels, and compact severity guidance.
- Put P1 and delivery context above general support text.
- Keep station-wide unsupported states honest and actionable.

Restraint rule:
- Do not make this screen look like a chat app. It is an incident-routing surface, and every action must preserve evidence.

## Information Architecture
Top-level layout:
1. Header.
2. Station and support-hours banner.
3. P1 and active issue summary.
4. Quick actions.
5. Delivery-linked report entry.
6. Active station-visible issue list.
7. Station-wide incident guidance.
8. Offline outbox and cached support state.
9. Error, empty, and unsupported states.

Header:
- Title: `Station support`
- Subtitle: `{stationCode} issue help`
- Leading action: station overview.
- Right action: refresh.
- Overflow actions: open blocked queue, open handoff log, open offline outbox, open shared ops support.

Support-hours banner:
- `Support open 07:00-19:00`
- `P1 outside hours routes to on-call ops admin`
- If contact configuration is missing: `Use configured station escalation channel`

P1 summary:
- Count of active P1 issues.
- Oldest P1 age.
- Primary action: open highest-priority P1 issue or blocked queue.

Quick actions:
- `Report delivery issue`
- `Open blocked queue`
- `Open handoff log`
- `Open offline outbox`
- `Contact support`

Delivery-linked report entry:
- Prompt: `Select a delivery before reporting`
- Accepted entry sources: scanner result, delivery detail route, blocked queue row, handoff log row, local outbox action.
- If no delivery is known, route to station queues or delivery search surface instead of submitting a station-wide issue through `create_issue`.

Active issue list:
- Tabs: `P1`, `Open`, `In review`, `Escalated`, `All active`.
- Optional filter: category.
- Rows show severity, category, summary, delivery tracking code when available, updated time, and route.

Station-wide incident guidance:
- Device or scanner failure.
- Station backlog.
- Staff sign-in failure.
- Storage or security incident.
- Network outage.
- Current action: contact support through configured station channel or create a delivery-linked issue when a specific package is affected.

## Issue Scope Model
Delivery-linked issue:
- Has `deliveryId`.
- Can be submitted through `create_issue`.
- Can be queued offline through `OpsIssueCreate` when context is fresh enough.
- Can route to delivery detail, custody chain, blocked queue, or handoff log.

Station-wide issue:
- Does not have `deliveryId`.
- Cannot be submitted through current `create_issue`.
- Must show `station_issue_not_supported`.
- Must route to configured support contact guidance.
- Future endpoint should store it as station support request.

Local action issue:
- Has `localActionId`.
- May also have `deliveryId`.
- If `deliveryId` exists, route to `OpsIssueCreate` with context.
- If only local station state exists, route to offline outbox and contact support guidance.

Issue visibility:
- Backend determines delivery access.
- UI may group issues by station relation only after receiving accessible rows.
- UI must not infer existence of inaccessible issues.

## Severity Guidance
P1:
- Active package loss.
- Payment integrity breach.
- Safety issue.
- Core station flow outage affecting intake, dispatch, receipt, or custody logging.
- Repeated authentication failure for active station staff.
- Repeated custody logging failure.

P2:
- Major delay.
- Repeated station backlog.
- Damaged package.
- Final-mile failure requiring human review.
- Handoff mismatch with known package location.

P3:
- Non-blocking support question.
- Tracking confusion.
- Receipt request.
- UI or workflow clarification.

Response windows:
- `P1`: acknowledge in `10 minutes` during operating hours; on-call escalation outside hours.
- `P2`: acknowledge in `30 minutes`.
- `P3`: acknowledge in `4 business hours`.

Severity copy:
- P1 label: `Urgent operations review`
- P2 label: `Needs human review`
- P3 label: `Support follow-up`

Severity rules:
- Do not default to P1.
- Recommend P1 only for loss, payment integrity, safety, or core-flow outage contexts.
- Show confirmation before creating a P1 issue.
- Explain that creating a P1 issue does not resolve the incident.

## Category Guidance
Use existing issue categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Station-specific recommendations:
- Damaged packaging: `damage`.
- Missing package: `loss`.
- Payment blocked station action: `payment`.
- Handoff mismatch: `handoff`.
- Queue aging or station backlog affecting deliveries: `delay`.
- Device, scanner, sign-in, or station facility problem without delivery ID: station-wide support guidance until backend supports station requests.

Category rules:
- Do not create a delivery issue for a station-wide device problem unless a specific delivery is affected.
- Do not choose `other` when a clearer category fits.
- If opened from blocked queue, preselect based on blocker type.
- If opened from handoff log, preselect `handoff`.
- If opened from offline outbox scan failure, preselect `handoff` or `delay` based on failure reason.

## Primary Actions
Default primary action by state:
- `loading`: wait.
- `ready`: open P1 issue, report delivery issue, or open highest-priority blocker.
- `empty`: report delivery issue or back to station overview.
- `filtered_empty`: clear filter.
- `refreshing`: keep current list visible.
- `offline_cached`: open cached issues or offline outbox.
- `stale_cache`: refresh.
- `delivery_required`: open delivery search or station queue.
- `create_delivery_issue`: open `OpsIssueCreate`.
- `queued_offline`: open offline outbox.
- `station_issue_not_supported`: contact support guidance.
- `contact_options`: choose configured support channel.
- `not_authorized`: return to role home.
- `session_expired`: sign in again.
- `rate_limited`: wait and retry.
- `api_error`: retry or use cached guidance.
- `partial_data`: review loaded issues with warning.

Primary action labels:
- `Report delivery issue`
- `Open P1 issue`
- `Open blocked queue`
- `Open handoff log`
- `Open delivery`
- `Open custody`
- `Open outbox`
- `Contact support`
- `Refresh`

Forbidden actions:
- Do not resolve an issue.
- Do not close an issue.
- Do not escalate through admin endpoint.
- Do not change delivery status.
- Do not transfer custody.
- Do not verify payment.
- Do not approve refund.
- Do not submit station-wide issue through `create_issue`.
- Do not expose admin issue queue controls.

## Active Issue Row Anatomy
Each row must show:
- Severity.
- Status.
- Category.
- Summary.
- Delivery tracking code when safe.
- Station relation.
- Last updated time.
- Source freshness.
- Primary route.

Row actions:
- `Open delivery`
- `Open custody`
- `Report follow-up`
- `Open blocked queue`
- `Open handoff log`
- `Contact support`

Row copy:
- P1 issue: `Urgent operations review needed.`
- P2 issue: `Human review needed before normal work continues.`
- P3 issue: `Support follow-up is open.`
- Cached issue: `Cached issue details. Refresh before final handover.`
- Partial issue: `Issue visible, delivery context still loading.`

Do not show:
- Raw reporter actor ID.
- Full issue description in collapsed row.
- Private support notes.
- Receiver phone.
- Receiver address.
- Raw proof or scan data.

## Delivery-Linked Report Flow
Entry with known delivery:
1. Show compact delivery context.
2. Show recommended category and severity based on source route.
3. Primary action opens `/(ops)/deliveries/:deliveryId/issues/new`.
4. Pass source context to `OpsIssueCreate`.
5. Return to station support after submit or queued offline.

Entry without delivery:
1. Show `Select a delivery before reporting`.
2. Offer routes to blocked queue, handoff log, outbound queue, inbound queue, final-mile queue, or delivery search when implemented.
3. Offer contact support guidance for station-wide incidents.
4. Do not call `POST /v1/issues`.

Offline with known delivery:
- Allow `OpsIssueCreate` to queue issue creation if its offline policy is satisfied.
- Show queued state only after local queue persists request fingerprint and idempotency key.
- Route to offline outbox for sync state.

Offline without delivery:
- Show support guidance.
- Do not create a local issue request that cannot sync to current backend.

## Offline Behavior
Offline mode must preserve issue awareness and evidence without creating false support completion.

Offline reads:
- Show cached active issues.
- Show cached support hours and contact guidance.
- Show local queued issue reports.
- Allow opening offline outbox.
- Allow delivery-linked issue creation only through offline-safe `OpsIssueCreate`.

Offline restrictions:
- Do not mark issue acknowledged.
- Do not mark issue resolved.
- Do not escalate issue.
- Do not create station-wide issue request for a non-existent backend route.
- Do not hide stale warnings.
- Do not claim support has received a report until backend success or queued state is clearly local.

Offline banner copy:
- Title: `Offline support mode`
- Body: `You can review cached issues and queue delivery-linked reports. Station-wide incidents need the configured support channel until the app reconnects.`
- Primary action: `Open outbox`

Stale threshold:
- Mark issue list stale after `10 minutes`.
- Mark contact guidance stale after `24 hours` if future backend contact config exists.
- Always show relative age.

## Error And Recovery States
`not_authorized`:
- Title: `Station support requires station access`
- Body: `Your account must be assigned to this station to view station support.`
- Primary action: `Back to role home`
- Secondary action: `Sign in again`

`session_expired`:
- Title: `Sign in again`
- Body: `Your session expired before support data could refresh.`
- Primary action: `Sign in`

`delivery_required`:
- Title: `Select a delivery first`
- Body: `Current issue creation must be linked to a delivery. Open the package from a station queue, blocked queue, or handoff log.`
- Primary action: `Open blocked queue`
- Secondary action: `Open handoff log`

`station_issue_not_supported`:
- Title: `Station-wide report needs support channel`
- Body: `The current backend accepts delivery-linked issues only. Use the configured station escalation channel for device, staff, storage, or station backlog incidents.`
- Primary action: `Contact support`
- Secondary action: `Open overview`

`api_error`:
- Title: `Support could not refresh`
- Body: `Cached issues are shown if available. Try again when the connection is stable.`
- Primary action: `Retry`
- Secondary action: `Open outbox`

`rate_limited`:
- Title: `Refresh paused`
- Body: `Too many support refresh attempts were made. Use the current list briefly, then try again.`
- Primary action: `Use current list`

`partial_data`:
- Title: `Some support details are missing`
- Body: `Loaded issues are shown. Delivery context or contact guidance may still need refresh.`
- Primary action: `Retry details`

## Accessibility Requirements
Structure:
- Use one `h1` equivalent for `Station support`.
- Use headings for P1 summary, quick actions, active issues, delivery-linked reporting, and station-wide guidance.
- Each issue row must expose severity, status, category, summary, updated time, and primary action.
- Quick actions must expose role and route purpose.
- Form entry points must use persistent visible labels.

Validation:
- Field errors must be specific.
- Errors must preserve entered content.
- Errors must be associated with the field and summarized.
- Permission or unsupported-route states must use problem states, not form validation errors.

Status messages:
- Announce refresh result.
- Announce queued issue report.
- Announce offline mode.
- Announce filter result count.
- Announce station-wide unsupported state when the user chooses that path.

Touch targets:
- Quick action tiles minimum target: `44 x 44 dp`.
- Issue row actions minimum target: `44 x 44 dp`.
- Filter chips minimum target: `44 x 44 dp`.

Color:
- P1 cannot rely on red alone.
- Severity must include text and icon shape.
- Offline and stale states must include text labels.

Motion:
- Use minimal transitions for filter changes and queued states.
- Do not use urgent pulsing loops.
- Respect reduced motion.

## Visual Direction
Use a station incident desk visual language:
- Background: calm warm neutral.
- P1 treatment: deep red-brown rail, strong text, restrained icon.
- P2 treatment: amber.
- P3 treatment: slate-blue.
- Success and queued states: muted green only when state is truly confirmed or locally queued.
- Typography: direct headings, compact row labels, clear severity labels.
- Shape: strong top summary, simple action tiles, ledger-like issue rows.

Layout rules:
- P1 summary must appear above general quick actions when P1 exists.
- Quick action tiles should fit one-handed mobile use.
- Issue list should be dense enough for shift use but not table-like.
- Station-wide unsupported guidance should be visible without feeling like a failure.
- Contact guidance should be clear but not impersonate a live chat.

## Copy System
Voice:
- Calm.
- Exact.
- Evidence-first.
- Action-oriented.
- No blame.

Header copy:
- Title: `Station support`
- Subtitle live: `{stationCode} issue help`
- Subtitle offline: `Cached support for {stationCode}`

Quick action copy:
- `Report delivery issue`
- `Open blocked queue`
- `Open handoff log`
- `Open outbox`
- `Contact support`

Delivery-required copy:
- `Select a delivery first`
- `Current issue creation must be linked to a delivery record.`

Station-wide unsupported copy:
- `Station-wide report needs support channel`
- `Use the configured station escalation channel for device, staff, storage, or station backlog incidents.`

Queued copy:
- `Issue report queued`
- `This report is saved locally and will sync with the same idempotency key when the app is online.`

Avoid:
- `Resolve`
- `Escalate now`
- `Close case`
- `Chat with us` unless a real chat backend exists.
- `Guaranteed response` unless support SLA backend and staffing are enforced.

## Privacy And Security
Do not show:
- Receiver phone.
- Receiver address.
- Full issue description in collapsed list.
- Raw proof reference.
- Raw scan code.
- Raw actor ID.
- Internal request fingerprint.
- Payment provider reference.
- Private support notes.
- Cross-station issue counts.

Allowed:
- Tracking code.
- Delivery ID when staff context requires it.
- Issue severity.
- Issue category.
- Issue status.
- Short summary.
- Safe station relation.
- Updated time.
- Support operating hours.
- Configured support channel labels.

Security guardrails:
- Backend remains authority for issue visibility.
- Client must suppress any issue row without station-access evidence.
- Client must not infer issue existence from search misses.
- Local queued issue payload must be encrypted where platform support exists.
- Redacted payload summary only in list and outbox.

## Analytics
Track:
- `station_support_viewed`
- `station_support_refreshed`
- `station_support_filter_changed`
- `station_support_issue_opened`
- `station_support_report_delivery_issue_started`
- `station_support_delivery_required_seen`
- `station_support_station_issue_unsupported_seen`
- `station_support_contact_option_opened`
- `station_support_outbox_opened`
- `station_support_offline_seen`
- `station_support_queued_issue_seen`

Event payload rules:
- Include `stationId`.
- Include `issueSeverity` when opening issue row.
- Include `issueStatus` when opening issue row.
- Include `issueCategory` when opening issue row.
- Include `sourceRoute`.
- Include `hasDeliveryId` as boolean.
- Do not include issue description, receiver data, raw scan code, raw proof reference, or payment reference.

## QA Acceptance Criteria
Backend integration:
- Screen calls `GET /v1/issues` for active issues.
- Screen can route delivery-linked reporting to `OpsIssueCreate`.
- Screen does not call `/v1/issues/:id/escalate`.
- Screen does not call `/v1/issues/:id/resolve`.
- Screen does not call admin station or admin issue routes from station operator session.
- Screen does not call `POST /v1/issues` without a delivery ID.
- Screen uses offline outbox only for delivery-linked issue creation.

Rendering:
- Root element exposes `screen-station-support`.
- Header shows station code.
- P1 summary appears when P1 issues exist.
- Quick actions render.
- Active issue rows show severity, category, status, summary, updated time, and route.
- Delivery-required state appears when user starts report without delivery context.
- Station-wide unsupported state appears for non-delivery station incidents.
- Offline cached state renders cached issues and outbox route.

Accessibility:
- Error summary and field errors are specific.
- User-entered values are preserved after validation error.
- Filter state is announced.
- Refresh, offline, queued, and unsupported states are announced.
- Touch targets meet mobile minimums.
- Severity is not color-only.

Security:
- No inaccessible issue rows render.
- No receiver address or phone renders.
- No raw scan code renders.
- No raw proof reference renders.
- No raw actor ID renders.
- No issue resolution or escalation controls render for station operators.

## Implementation Notes For Claude Code
Build this as a station-specific wrapper around delivery-linked issue support, not as a new admin support console.

Recommended component split:
- `StationSupportScreen`
- `StationSupportHeader`
- `SupportHoursBanner`
- `P1IssueSummary`
- `StationSupportQuickActions`
- `DeliveryLinkedReportEntry`
- `StationIssueUnsupportedPanel`
- `StationIssueList`
- `StationIssueRow`
- `StationSupportContactOptions`
- `StationSupportOfflineBanner`
- `StationSupportErrorState`

Recommended hooks/services:
- `useStationSupport`
- `useStationIssueList`
- `useStationSupportFilters`
- `useDeliveryLinkedReportContext`
- `useStationSupportContactConfig`
- `buildStationIssuePriority`
- `buildStationSupportRoutes`

Current data strategy:
- Fetch active issue statuses separately if the API needs separate status filters.
- Cache issue rows by station and status.
- Use delivery context from route params, blocked queue, handoff log, or offline outbox.
- Send new delivery issue work to `OpsIssueCreate`.
- Do not implement station-wide support submission until backend route exists.

Future data strategy:
- Add station support request list when `GET /v1/station/support-requests` exists.
- Add station-wide issue creation when `POST /v1/station/support-requests` exists.
- Add configured contact options when backend exposes support contact config.
- Keep `create_issue` for delivery-linked reports only.

## Final Quality Bar
This screen is complete only when:
- A station operator can see active station-relevant issues quickly.
- P1 incidents are impossible to miss but not visually chaotic.
- Delivery-linked issue creation is safe online and offline.
- Station-wide incident limitations are explicit instead of hidden.
- Admin-only escalation and resolution are absent.
- Every support action preserves package evidence and station accountability.
- The UI feels like a serious operations support desk for preventing lost goods, not a generic help page.
