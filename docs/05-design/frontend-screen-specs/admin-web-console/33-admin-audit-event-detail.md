# Admin Audit Event Detail Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID            | `AdminAuditEventDetail`                                                                                                                                                                                                              |
| Route                | `/admin/audit-events/:eventId`                                                                                                                                                                                                       |
| Primary test ID      | `screen-admin-audit-event-detail`                                                                                                                                                                                                    |
| Surface              | Admin web console                                                                                                                                                                                                                    |
| Backend coverage     | `admin_audit_events` list read only; no single-event backend read exists yet                                                                                                                                                         |
| Offline critical     | No                                                                                                                                                                                                                                   |
| Required read role   | Any authenticated admin principal accepted by backend admin guard; product may narrow detail access by role later                                                                                                                    |
| Required action role | None                                                                                                                                                                                                                                 |
| Required states      | `loading`, `ready`, `limited_context`, `not_found`, `metadata_redacted`, `target_unavailable`, `not_authorized`, `session_expired`, `api_error`                                                                                      |
| Parent screens       | `AdminAuditEvents`, `AdminStaffActivityLog`, `AdminDeliveryDetail`, `AdminIssueDetail`, `AdminPaymentReconciliationDetail`, `AdminRefundEvidenceReview`                                                                              |
| Related screens      | `AdminAuditEvents`, `AdminStaffActivityLog`, `AdminUsers`, `AdminUserDetail`, `AdminDeliveryDetail`, `AdminIssueDetail`, `AdminPaymentReconciliationDetail`, `AdminWebhookEvents`, `AdminOutboundNotifications`, `AdminExportReport` |

## Purpose

`AdminAuditEventDetail` is the controlled detail surface for one audit event selected from the admin audit ledger. It explains the event identity, actor, role, station context, backend action, request correlation, target object, metadata redaction state, and investigation routes without exposing raw metadata or pretending the event can be edited.

The screen should answer:

- `Which audit event am I inspecting?`
- `Which request id should engineering use for backend log lookup?`
- `Who performed the action and with which role?`
- `Which station context was present?`
- `What exact backend action key was recorded?`
- `Which delivery, payment, issue, or tracking target was affected?`
- `What metadata is hidden and why?`
- `Which related screen should I open next?`
- `Can this route load the event directly from backend today?`

This screen is read-only evidence review. It must not mutate audit events, replay operations, reveal raw metadata, edit actor data, change target state, export event payloads, or store event details in persistent client storage.

## Backend Reality

The inventory defines:

```text
/admin/audit-events/:eventId
```

The backend currently exposes only:

```http
GET /v1/admin/audit-events
```

Operation:

```text
admin_audit_events
```

Supported query parameters:

- `actorId`
- `targetType`
- `targetId`
- `limit`

No endpoint exists for:

```http
GET /v1/admin/audit-events/:eventId
```

No endpoint exists for:

- event id lookup
- request id lookup
- raw metadata projection
- redacted metadata detail projection
- event retention status
- event export

Therefore the detail route has two valid loading paths:

- `selected-row context`: the user opens detail from `AdminAuditEvents` or `AdminStaffActivityLog`, and the selected audit row is passed through safe in-memory route state or a query cache.
- `limited direct route`: the user opens `/admin/audit-events/:eventId` directly, and the screen cannot fetch that event by id yet.

The screen must not fetch every recent audit event repeatedly just to find an event id. It may offer a controlled route back to `AdminAuditEvents` with instructions to search by actor or target.

## Source References

External references used for this screen:

- [NIST SP 800-92, Guide to Computer Security Log Management](https://csrc.nist.gov/pubs/sp/800/92/final): supports controlled log review, retention, and operational accountability.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports request correlation, event attributes, sanitization, and sensitive data exclusion.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/): supports structured key-value evidence review.
- [USWDS Table component](https://designsystem.digital.gov/components/table/): supports accessible supporting records where a detail screen includes related event context.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing load, not-found, and copied-ID results without moving focus.

Local references:

- `docs/08-security/audit-trail-spec.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/authorization-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-data/firestore-schema.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/32-admin-audit-events.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/20-admin-staff-activity-log.md`

## Design Thesis

Design this like an evidence card inside an operations security console: quiet, precise, immutable, and clear about what is hidden. The page should make a single audit event easy to verify without encouraging unsafe raw-log browsing.

Visual direction:

- strong page header with event id and action
- key-value evidence summary using a summary-list layout
- monospaced event, request, actor, station, and target IDs
- locked/read-only visual treatment for the event record
- redaction panel that explains hidden metadata
- route cards for actor, target, and source list
- compact backend limitation callout for direct route loads

Restraint rule:

- Do not add decorative charts, actor avatars, raw JSON panels, or incident-room theatrics. The event record is the interface.

## Product Principles

- An audit event is immutable evidence.
- The detail screen must preserve source truth, not enrich it with guesses.
- Event id and request id must be easy to locate.
- Raw metadata must stay hidden unless a future controlled projection is added.
- Missing target, station, or metadata must be shown as recorded absence.
- Direct-route limitation must be explicit.
- Every follow-up link must respect authorization.
- The screen must help investigation without becoming a backend log console.

## Audience

Primary users:

- super admins reviewing privileged actions
- operations admins investigating delivery and custody actions
- finance admins tracing payment or refund actions
- support admins tracing issue actions
- security reviewers checking suspicious event chains
- engineering leads matching request ids to backend logs

Secondary users:

- QA reviewers validating audit event rendering
- product reviewers identifying audit query gaps

Non-users:

- public visitors
- senders
- receivers
- drivers
- station operators outside admin console
- final-mile couriers outside admin console

## Entry Points

Preferred:

- `AdminAuditEvents` row action: `Open event`
- `AdminStaffActivityLog` row action: `Open audit event`
- `AdminRefundEvidenceReview` audit section
- `AdminDeliveryDetail` audit link
- `AdminIssueDetail` audit link
- `AdminPaymentReconciliationDetail` audit link

Allowed but limited:

- direct URL `/admin/audit-events/:eventId`

If opened directly:

- show `limited_context` or `not_found` because backend cannot fetch by event id yet
- offer `Search audit events`
- prefill no unsupported backend query
- do not call a non-existing endpoint

## Required Route State

When opened from a list row, pass or retain:

- `eventId`
- `requestId`
- `action`
- `actorId`
- `actorRole`
- `occurredAt`
- `stationId`
- `targetType`
- `targetId`
- safe metadata summary
- redaction state
- source query context
- fetched time

Do not pass:

- raw metadata object
- fingerprint body
- request body
- proof URL
- phone number
- address
- provider secret
- token

If route state contains raw metadata by mistake:

- discard raw values before render
- show `metadata_redacted`
- log a safe client warning without the raw value

## Header

Header content:

- breadcrumb: `Admin / Audit events / <eventId>`
- eyebrow: `Audit event`
- title: readable action label or raw action key
- subtitle: `Recorded at <time>`
- status label: `Read-only evidence`
- event id
- request id
- source freshness

Header actions:

- `Back to audit events`
- `Open target` when target route is available
- `Open actor` when actor route is available
- `Copy event ID` if copy controls are allowed
- `Copy request ID` if copy controls are allowed

Do not show:

- edit
- delete
- replay
- approve
- resolve
- export raw event

## Evidence Summary

Use a structured key-value layout.

Rows:

- `Event ID`
- `Request ID`
- `Action`
- `Readable action`
- `Actor ID`
- `Actor role`
- `Station ID`
- `Occurred at`
- `Target type`
- `Target ID`
- `Response status`
- `Metadata state`
- `Source query`
- `Fetched at`

Rules:

- Every row label must be visible.
- Use `Not recorded` for absent optional fields.
- Use `Hidden` for intentionally redacted values.
- Use exact backend action key in monospace.
- Use local date/time plus UTC detail when useful.
- Do not reword backend action into a business result unless the action-label map supports it.

## Action Interpretation

The detail screen can show a readable action label, but backend action remains the source.

Known labels:

- `create_delivery`: `Delivery created`
- `confirm_origin_intake`: `Origin intake confirmed`
- `assign_driver`: `Driver assigned`
- `confirm_dispatch`: `Dispatch confirmed`
- `confirm_destination_receipt`: `Destination receipt confirmed`
- `assign_final_mile`: `Final-mile assignment created`
- `complete_delivery`: `Delivery completed`
- `create_issue`: `Issue created`
- `escalate_issue`: `Issue escalated`
- `resolve_issue`: `Issue resolved`
- `refund_payment`: `Refund approved`
- `settle_refund_payment`: `Refund settled`
- `admin_update_user_access`: `User access updated`
- `admin_update_station_status`: `Station status updated`
- `admin_update_station_validation`: `Station validation updated`
- `admin_update_pricing_rules`: `Pricing rules updated`

Unknown action:

- show raw key
- label as `Unrecognized action key`
- keep the event visible
- do not infer outcome

## Request Correlation Panel

Purpose:

- help engineering and security reviewers match the audit event to backend logs

Fields:

- request id
- event id
- action
- occurred time
- response status if present

Copy:

```text
Use the request ID when checking backend logs. This screen does not show raw request bodies.
```

Copy controls:

- Copy event id
- Copy request id

Rules:

- Copy only visible identifiers.
- Announce copy success with a polite live region.
- Do not copy raw metadata.
- Do not copy hidden fields.

## Actor Panel

Fields:

- actor id
- actor role
- station id where present
- route to user detail when allowed
- role scope note

Actor route:

```text
/admin/users/:actorId
```

Rules:

- Do not fetch actor full profile by default.
- Do not show actor name or email unless loaded through an allowed user endpoint.
- Do not imply the actor still has the same role today.
- Copy should say `Role at event time`.

Role copy:

```text
This role is the role recorded on the event, not a guarantee of the actor's current access.
```

## Target Panel

Fields:

- target type
- target id
- primary target route
- route availability
- authorization note

Routes:

- `delivery` -> `/admin/deliveries/:targetId`
- `payment` -> `/admin/finance/reconciliation/:targetId`
- `issue` -> `/admin/issues/:targetId`
- `tracking` -> no default route until internal tracking route exists

Rules:

- If target type or id is absent, show `No target recorded`.
- Do not infer target from metadata.
- Do not parse provider reference as payment id.
- Do not show route if role cannot access the target surface.
- If target route is blocked, show `You may not have access to this target screen.`

## Metadata Redaction Panel

This panel is required even when metadata is absent.

States:

- `metadata_absent`
- `metadata_present_hidden`
- `response_status_available`
- `fingerprint_present_hidden`
- `unknown_metadata_hidden`

Allowed display:

- metadata present or absent
- response status code if present
- fingerprint present or absent
- hidden key count if safe to compute without showing names
- redaction reason

Forbidden display:

- raw metadata object
- fingerprint body
- request body
- proof asset URL
- customer phone
- customer address
- provider payload
- credential
- token
- private note text
- local device path

Required copy when metadata exists:

```text
Metadata is hidden on this screen to prevent accidental exposure of request bodies, proof references, provider data, or personal information.
```

Required copy when metadata is absent:

```text
No metadata was recorded for this event.
```

## Response Status

If safe metadata summary contains response status:

- `2xx`: `Successful response`
- `3xx`: `Redirect response`
- `4xx`: `Client error response`
- `5xx`: `Server error response`
- other: `Unknown response status`

If absent:

- `Response status not recorded`

Rules:

- Do not infer delivery, payment, refund, or issue state only from response status.
- Response status is technical evidence, not full business outcome.

## Source Context Panel

Show how this detail was reached.

Fields:

- source screen
- source query
- source returned limit
- fetched time
- route context present or absent
- direct route status

If selected row context exists:

```text
Loaded from selected audit row.
```

If direct route lacks context:

```text
This route cannot load the event by ID yet because the backend does not expose single-event lookup.
```

Actions:

- `Search audit events`
- `Back to previous results` if history exists
- `Open staff activity`

## Limited Context State

Use when the route has a valid event id shape but no selected row context and no backend single-event read.

Title:

```text
Audit event detail needs list context
```

Body:

```text
The backend can list audit events by actor or target, but it cannot fetch one event by event ID yet. Open this event from the audit events list, or search by actor or target.
```

Actions:

- `Search audit events`
- `Open staff activity`
- `Back to admin overview`

Do not:

- show fabricated event data
- call unsupported endpoint
- scan all returned pages
- show stale event details from another id

## Not Found State

Use when:

- event id route param does not match event id format
- cached row context exists but event id mismatch occurs
- selected row is absent and product chooses not to show limited context

Title:

```text
Audit event not found
```

Body:

```text
This event could not be loaded from the current audit context.
```

Actions:

- `Search audit events`
- `Back to audit events`

If the event id format is invalid:

- show field-level style copy near the route id display
- do not send a backend request

## Loading State

Loading appears only while resolving route context or safe cached query state.

Copy:

```text
Loading audit event detail...
```

Rules:

- Do not show skeleton rows that look editable.
- Do not call unsupported single-event endpoint.
- If context is not available, transition quickly to `limited_context`.
- Keep focus stable.

## Error State

Use only when supported context or a supported list refetch fails.

Title:

```text
Audit event detail could not load
```

Body:

```text
The audit event context could not be restored. Search audit events again or return to the audit list.
```

Actions:

- `Search audit events`
- `Back to audit events`

If an API error includes request id, show it.

## Authorization State

Title:

```text
You do not have access to this audit event
```

Body:

```text
Audit event detail is available only to authorized admin roles.
```

Action:

- `Back to admin overview`

Rules:

- Do not show cached event data.
- Clear selected row context from memory when authorization fails.

## Session Expired State

Title:

```text
Session expired
```

Body:

```text
Sign in again to continue reviewing audit event detail.
```

Action:

- `Sign in`

Clear visible event content.

## Layout

Desktop:

- left main column with evidence summary
- right sticky investigation rail with actor, target, and request correlation actions
- redaction panel directly below evidence summary
- backend limitation panel below redaction

Tablet:

- evidence summary full width
- investigation rail becomes section below summary
- actions remain at section top

Mobile:

- stacked evidence cards
- action bar below header
- copy controls grouped under request correlation
- redaction panel before follow-up routes
- no horizontal scrolling

## Visual Components

Required components:

- admin shell
- breadcrumb
- read-only header
- evidence summary list
- request correlation card
- actor card
- target card
- metadata redaction card
- source context card
- backend limitation callout
- related routes card
- limited context state
- not-found state
- live region

Do not create:

- raw JSON viewer
- editable fields
- action replay control
- audit deletion control
- broad export control
- decorative timeline unrelated to event facts

## Interaction Details

Copy event id:

- button label: `Copy event ID`
- accessible name includes event id
- success message: `Event ID copied`

Copy request id:

- button label: `Copy request ID`
- accessible name includes request id
- success message: `Request ID copied`

Open actor:

- opens actor route only if authorized
- if route unavailable, button is hidden and explanation is shown

Open target:

- opens target route only if target fields and route are available
- if role cannot access, show disabled explanation

Back to list:

- preserves previous search if browser history or route state has it
- otherwise opens `/admin/audit-events`

## URL And State Rules

Route param:

- `eventId`

Valid format:

```text
AUD-[A-Z0-9-]+
```

Rules:

- invalid format transitions to `not_found`
- valid format without context transitions to `limited_context`
- valid format with matching selected row transitions to `ready`
- selected row id must exactly equal route param
- do not store raw row in local storage
- do not put raw metadata into URL params

## Data Model

Frontend safe view model:

```ts
type AuditEventDetailView = {
  eventId: string;
  requestId: string;
  action: string;
  actionLabel: string;
  actorId: string;
  actorRole: string;
  occurredAt: string;
  stationId?: string;
  targetType?: "delivery" | "payment" | "issue" | "tracking";
  targetId?: string;
  responseStatusCode?: number;
  metadataState:
    | "metadata_absent"
    | "metadata_present_hidden"
    | "response_status_available"
    | "fingerprint_present_hidden"
    | "unknown_metadata_hidden";
  sourceContext: "selected_row" | "query_cache" | "direct_route_limited";
  fetchedAt?: string;
};
```

Rules:

- Store only safe metadata summary.
- Do not include raw metadata object.
- Do not include free-text request body.
- Do not include provider payload.

## Redaction Utility

Inputs:

- event metadata object from API response

Outputs:

- `hasMetadata`
- `responseStatusCode`
- `hasFingerprint`
- `hiddenMetadataReason`
- `metadataState`

Rules:

- never return raw values except response status code
- if metadata is absent, state is `metadata_absent`
- if only response status is safe, state can be `response_status_available`
- if fingerprint exists, state includes hidden fingerprint
- if unknown keys exist, mark hidden

The detail screen should use the same redaction utility as `AdminAuditEvents` and `AdminStaffActivityLog`.

## Accessibility Requirements

Required:

- one `h1`
- breadcrumb before heading
- summary list with clear labels
- visible focus on all actions
- buttons named by copied value type
- target and actor route actions named by destination
- polite live region for copy, load, and state changes
- no color-only status
- reduced-motion support
- keyboard access to all sections

Live messages:

- `Audit event detail loaded`
- `Audit event detail needs list context`
- `Audit event not found`
- `Event ID copied`
- `Request ID copied`
- `Metadata hidden for this audit event`

## Security And Privacy

Required:

- no raw metadata in DOM text
- no raw metadata in analytics
- no persistent browser storage of event detail
- no proof URLs
- no provider payloads
- no phone numbers
- no addresses
- no tokens or credentials
- no request body display
- no unsafe target inference

Client error reporting:

- do not attach full event object
- include only safe state names and source screen
- do not include event id or request id unless security policy explicitly allows it

## Analytics Events

Allowed events:

- `admin_audit_event_detail_viewed`
- `admin_audit_event_detail_limited_context_seen`
- `admin_audit_event_detail_not_found`
- `admin_audit_event_actor_opened`
- `admin_audit_event_target_opened`
- `admin_audit_event_id_copied`
- `admin_audit_request_id_copied`
- `admin_audit_event_redaction_seen`

Allowed fields:

- `actor_role`
- `target_type`
- `action_known`
- `metadata_state`
- `source_context`
- `has_station`
- `has_target`
- `has_response_status`

Do not send:

- event id
- request id
- actor id
- target id
- raw action key if policy treats it as sensitive
- raw metadata
- customer details

## Test IDs

Root:

- `screen-admin-audit-event-detail`

Header:

- `admin-audit-event-detail-header`
- `admin-audit-event-detail-event-id`
- `admin-audit-event-detail-request-id`
- `admin-audit-event-detail-back-action`

Evidence:

- `admin-audit-event-summary`
- `admin-audit-event-action`
- `admin-audit-event-actor`
- `admin-audit-event-role`
- `admin-audit-event-station`
- `admin-audit-event-target`
- `admin-audit-event-response-status`

Panels:

- `admin-audit-event-request-panel`
- `admin-audit-event-actor-panel`
- `admin-audit-event-target-panel`
- `admin-audit-event-metadata-panel`
- `admin-audit-event-source-context-panel`
- `admin-audit-event-backend-limitation`

Actions:

- `admin-audit-event-copy-event-id`
- `admin-audit-event-copy-request-id`
- `admin-audit-event-open-actor`
- `admin-audit-event-open-target`
- `admin-audit-event-search-list`

States:

- `admin-audit-event-limited-context-state`
- `admin-audit-event-not-found-state`
- `admin-audit-event-error-state`
- `admin-audit-event-unauthorized-state`
- `admin-audit-event-live-region`

## Acceptance Criteria

Functional:

- Renders route `/admin/audit-events/:eventId`.
- Shows root test id.
- Validates `eventId` format.
- Shows ready state when selected row context matches route id.
- Shows limited-context state when direct route has no event context.
- Does not call non-existing single-event endpoint.
- Does not fetch all events to find one event id.
- Shows event id, request id, action, actor, role, occurred time, station, target, and metadata state.
- Shows copy controls only for visible IDs.
- Routes to actor only when allowed.
- Routes to target only when fields and permissions allow.
- Shows redaction panel even when metadata is absent.

Policy:

- Audit event is read-only.
- Audit metadata is hidden by default.
- Retention copy matches local security docs.
- Optional fields use `Not recorded`.
- Direct route limitation is explicit.

UX:

- Header gives immediate event identity.
- Evidence summary is scannable.
- Request id is easy to locate.
- Redaction does not feel like missing UI; it explains why data is hidden.
- User can return to audit list without losing prior context when available.

Accessibility:

- Summary labels are visible.
- Copy success is announced.
- Limited-context state is announced.
- Focus order follows layout.
- No color-only status.
- Mobile layout has no horizontal scroll.

Security:

- No raw metadata in DOM text.
- No raw metadata in analytics.
- No raw request body.
- No customer phone or address.
- No token, credential, proof URL, or provider payload.

## QA Scenarios

Route states:

- open from audit list with matching row context
- open from staff activity with matching row context
- open direct route with valid event id and no context
- open route with invalid event id
- open route with mismatched selected row id
- session expires after detail loads
- user loses authorization

Event shapes:

- event with delivery target
- event with payment target
- event with issue target
- event with tracking target
- event without target
- event without station
- event with metadata absent
- event with response status metadata
- event with fingerprint metadata
- event with unknown metadata keys
- event with unknown action key

Interactions:

- copy event id
- copy request id
- open actor route
- actor route unavailable
- open delivery target
- open payment target as finance admin
- payment target blocked for non-finance admin
- tracking target has no route
- back to previous list preserves search context

Accessibility:

- keyboard reaches all copy and route actions
- live region announces copy results
- screen reader hears limited-context state
- screen reader hears not-found state
- labels remain visible on mobile cards

Security:

- raw metadata is absent from DOM text
- hidden provider payload is not rendered
- hidden proof URL is not rendered
- analytics does not contain event id or request id
- client error payload does not include event object

## Implementation Notes

Recommended sequence:

1. Add route shell and root test id.
2. Validate route `eventId`.
3. Read selected row context from router state or audit query cache.
4. Build safe detail view model.
5. Add evidence summary.
6. Add request correlation, actor, target, and metadata panels.
7. Add limited-context and not-found states.
8. Add copy controls and live region.
9. Add authorization/session handling.
10. Add responsive layout.
11. Add unit, component, integration, accessibility, and security tests.

Do not implement:

- single-event backend call until the API exists
- raw metadata viewer
- event edit
- event deletion
- action replay
- broad export
- metadata search

## Test Plan

Unit tests:

- event id format validation
- selected row id match check
- action label mapping
- unknown action fallback
- target route resolver
- actor route resolver
- metadata redaction utility
- response status grouping
- safe view model creation
- limited context decision

Component tests:

- ready state
- limited-context state
- not-found state
- metadata absent state
- metadata hidden state
- actor route unavailable
- target route unavailable
- copy event id
- copy request id
- mobile layout

Integration tests:

- `/admin/audit-events/:eventId` renders root test id
- open from audit list with route state
- direct route does not call unsupported endpoint
- invalid id does not call backend
- route back to audit events
- role gating hides blocked target actions

Accessibility tests:

- axe scan desktop
- axe scan mobile
- keyboard path through header and panels
- live region copy announcement
- limited-context announcement
- no color-only state labels

Security tests:

- raw metadata keys and values do not render
- hidden request body does not render
- hidden proof URL does not render
- analytics payload excludes event id and request id
- client error payload excludes event object

## Open Backend Decisions

Not blockers for this controlled detail screen:

- Add `GET /v1/admin/audit-events/:eventId`.
- Add safe redacted metadata projection.
- Add request id lookup.
- Add retention-state field.
- Add target types for user, station, pricing rule, outbound notification, and webhook event if product needs those links.
- Add controlled audit export endpoint.
- Add audit event chain query by target and time window.

## Completion Standard

The screen is complete when:

- one selected audit event can be inspected safely
- direct route limitation is explicit and useful
- event id and request id are easy to locate
- actor and target context route correctly when allowed
- metadata redaction is clear and strict
- no raw payload is rendered or copied
- no mutation is available
- accessibility and security tests cover every state
