# Station Status Override Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `StationStatusOverride Modal` |
| Component target | shared admin station operating, intake, and service availability override modal |
| Primary test ID | `modal-station-status-override` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 station operations control |
| Used by | `AdminStationStatusOverride`, `AdminStationDetail`, `AdminStations`, `AdminStationCapacity`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue` |
| Backend coverage | `admin_update_station_status` |
| Trigger source | station status owner screen action, station detail action, station list row action, capacity risk action, launch-readiness blocker action |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `read_only`, `station_missing`, `current_status_missing`, `form_editing`, `dirty`, `client_invalid`, `impact_review`, `confirming`, `submitting`, `server_confirmed`, `server_rejected`, `role_blocked`, `rate_limited`, `network_error`, `session_expired`, `closing_to_sign_in`, `closing` |

## Product Job
`StationStatusOverride Modal` lets an authorized operations admin change a station's operating status, intake status, and service availability with before-and-after review.

It answers:
- `Which station is being changed?`
- `What is the current station operating state?`
- `What will change after submit?`
- `Which services will remain available?`
- `Will this restrict intake or pause the station?`
- `Will launch readiness or station queues be affected?`
- `Who is allowed to submit this override?`
- `What exact payload will be sent?`
- `What did the backend save?`

The user should be able to:
- Verify station identity.
- Review current status.
- Change `operatingStatus`.
- Change `intakeStatus`.
- Change `standard`, `express`, and `doorstep` availability.
- Add, update, or clear an operational note.
- Review blast radius before submit.
- Confirm the override.
- Submit once with idempotency protection.
- See the backend-saved result.
- Return to station or launch-readiness context.

This modal is not:
- A station validation form.
- A dry-run or pilot-readiness checklist.
- A station capacity editor.
- A staff roster tool.
- A delivery reassignment flow.
- An issue resolution flow.
- A pricing or service-area publication tool.
- A public service status page.
- A launch approval action.
- A hidden station configuration console.

## Strategic Role
Station status is an operational circuit breaker. It can stop intake, pause station activity, disable express or doorstep service, influence launch readiness, and shape what staff and admins see in queues.

Core principle:
- Make the station identity clear.
- Show before and after values.
- Require a review step.
- Require confirmation when service is reduced.
- Preserve all service availability booleans together.
- Do not change station validation evidence.
- Do not move or reassign packages.
- Do not close issues.
- Do not imply public availability copy changed unless a public configuration system later exists.

The operational failure this modal prevents:
- Admin pauses the wrong station.
- Admin disables doorstep service without noticing express remains enabled.
- Admin restricts intake without explaining why.
- Admin clears a status note accidentally.
- Admin changes status from stale station context.
- Support or finance role mutates station status without authority.
- Launch readiness appears blocked or ready without clear station evidence.
- Existing delivery queues are assumed to move automatically.

## Audience
Primary users:
- `ops_admin` managing operational station availability.
- `super_admin` managing network-level station availability.

Secondary users:
- `support_admin` reading station state during support triage.
- `finance_admin` reading station state during refund or reconciliation review.
- Launch owner reviewing readiness blockers.
- QA validating admin role gates and state transitions.
- Security reviewer validating audit-sensitive override behavior.
- Claude Code implementing the frontend later.

Non-users:
- Public visitor.
- Sender.
- Receiver.
- Driver.
- Station operator.
- Final-mile courier.
- Finance admin submitting the override.
- Support admin submitting the override.
- Provider webhook processor.

## Context Of Use
The modal opens when an admin is already investigating station readiness, capacity, blockers, or operational service state.

Common entry contexts:
- `AdminStationStatusOverride` owner screen.
- `AdminStationDetail` status card.
- `AdminStations` station row action.
- `AdminStationCapacity` overloaded or unavailable station action.
- `AdminLaunchReadiness` station blocker action.
- `AdminLaunchReadinessDetail` station blocker action.
- `AdminBlockedDeliveryQueue` station-blocked queue action.
- `AdminIssueQueue` station P1 issue context.

The user may be:
- Pausing a station due outage.
- Reactivating a station after recovery.
- Restricting intake while allowing outbound processing.
- Reopening intake after staffing improves.
- Disabling express service on a station under capacity pressure.
- Disabling doorstep service while standard station pickup remains available.
- Restoring standard, express, and doorstep availability.
- Adding an operational note for audit and staff context.
- Clearing an outdated operational note.

## Design Brief
Audience:
- Operations admin or super admin with station override authority.

Surface type:
- High-impact operational override modal.

Primary action:
- `Update station status`.

Visual thesis:
- `Operations circuit breaker`: a direct command modal with current state, proposed state, impact ledger, and explicit confirmation.

Restraint rule:
- No validation checklist, no capacity forecasting, no issue resolution, no launch approval, no staff roster editing.

Density:
- Medium-high. The modal must expose enough operational consequence without replacing station detail.

Platform stance:
- Admin web first.
- Tablet compatible.
- Mobile web fallback for emergency command center use.

## External Research Used
Only directly relevant links were used:
- [Atlassian change management guidance](https://support.atlassian.com/jira-service-management-cloud/docs/what-is-change-management/): supports treating high-impact operational state changes as controlled changes with context and review.
- [PagerDuty maintenance windows documentation](https://support.pagerduty.com/main/docs/maintenance-windows): supports explicit service-impact windows and status control for operational availability.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports a before-submit review for serious changes.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports accessible modal structure for focused tasks.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports explicit confirmation for high-impact state changes.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors for status controls and note validation.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, saving, success, and failure messages.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/12-admin-stations.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/13-admin-station-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/14-admin-station-validation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/15-admin-station-status-override.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/16-admin-station-capacity.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/03-admin-launch-readiness.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/04-admin-launch-readiness-detail.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/stations.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/stations.test.ts`

## Backend Reality
Mutation:
- Operation key: `admin_update_station_status`.
- Route: `POST /v1/admin/stations/:id/status`.
- Path param: station ID.
- Required prehandler: admin mutation guard plus station management capability.
- Required capability: `override_queue_state`.
- Request schema: `adminUpdateStationStatusRequestSchema`.
- Response schema: `adminUpdateStationStatusResponseSchema`.
- Route metadata marks the mutation idempotent.
- Handler wraps the mutation in the idempotent mutation runner.

Read context:
- Operation key: `admin_stations`.
- Route: `GET /v1/admin/stations`.
- There is no standalone station status detail endpoint.
- The modal must receive station context from parent or find the station in `admin_stations`.

Optional context:
- Operation key: `admin_launch_readiness`.
- Route: `GET /v1/admin/launch-readiness`.
- Used only to explain launch impact, not to mutate readiness.

Request body:
```json
{
  "operatingStatus": "paused",
  "intakeStatus": "restricted",
  "serviceAvailability": {
    "standard": false,
    "express": false,
    "doorstep": false
  },
  "note": "Temporary outage"
}
```

Request fields:
- `operatingStatus` is required.
- `operatingStatus` must be `active` or `paused`.
- `intakeStatus` is required.
- `intakeStatus` must be `open` or `restricted`.
- `serviceAvailability` is required.
- `serviceAvailability.standard` is required boolean.
- `serviceAvailability.express` is required boolean.
- `serviceAvailability.doorstep` is required boolean.
- `note` is optional.
- `note` is trimmed.
- `note` must be `3..240` characters when included.

Successful response:
```json
{
  "stationId": "ST-ACC-01",
  "name": "Accra Central",
  "city": "Accra",
  "operatingStatus": "paused",
  "intakeStatus": "restricted",
  "serviceAvailability": {
    "standard": false,
    "express": false,
    "doorstep": false
  },
  "note": "Temporary outage",
  "updatedAt": "2026-05-16T18:10:00.000Z"
}
```

Important backend facts:
- The backend saves a complete station status snapshot.
- The backend updates `updatedAt`.
- The backend can create a default station record when the station is known in the catalog but not stored yet.
- The backend does not update station validation.
- The backend does not update dry-run or controlled-pilot days.
- The backend does not update station blockers.
- The backend does not close station issues.
- The backend does not move deliveries.
- The backend does not reassign drivers or couriers.
- The backend does not notify customers directly from this mutation.
- The backend does not publish public service area copy directly from this mutation.

Therefore:
- The modal may submit only `admin_update_station_status`.
- The modal must not call `admin_update_station_validation`.
- The modal must not mutate delivery, issue, user, pricing, notification, or launch readiness state.
- The modal must include all three service availability booleans.
- The modal must preserve enum values exactly.
- The modal must require review and confirmation before submit.
- The modal must include an idempotency key.

## Permission Model
Open permission:
- Admin read context may be visible to `ops_admin`, `support_admin`, `finance_admin`, and `super_admin`.

Submit permission:
- `override_queue_state`.

Roles with submit authority:
- `ops_admin`.
- `super_admin`.

Read-only roles:
- `support_admin`.
- `finance_admin`.

Blocked roles:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.

Permission behavior:
- If role can read but cannot submit, show `read_only`.
- If role lacks admin access, show `role_blocked`.
- Hide primary submit in read-only mode.
- Explain which role can submit without leaking security internals.

Read-only copy:
- Title: `Station status is read only`
- Body: `You can review this station state, but only operations admins and super admins can submit status overrides.`
- Primary action: `Close`
- Secondary action: `Open station detail`

## Data Dependencies
Required context:
- `stationId`.
- Station name.
- Station city.
- Current `operatingStatus`.
- Current `intakeStatus`.
- Current `serviceAvailability`.
- Current `updatedAt`.
- Current user role and capabilities.

Preferred context:
- Current station note.
- Queue pressure.
- Active P1 issue count.
- Launch readiness blocker status.
- Validation status.
- Open intake queue count.
- Outbound queue count.
- Final-mile queue count.
- Last status update timestamp.

Context hydration order:
- Use parent screen station record when provided.
- Use `admin_stations` cache.
- Fetch `admin_stations` if cache is missing or stale.
- Match by `stationId`.
- Load `admin_launch_readiness` only when the parent has launch context or the station appears in readiness blockers.
- If station cannot be found, show `station_missing`.
- If station exists but required status fields are missing, show `current_status_missing`.

Do not:
- Guess station status.
- Guess service availability.
- Guess launch readiness.
- Mutate from stale station data without review.
- Use public station copy as admin status source.

## Station Identity Ledger
Fields:
- `Station ID`
- `Station name`
- `City`
- `Current operating status`
- `Current intake status`
- `Standard service`
- `Express service`
- `Doorstep service`
- `Current note`
- `Last updated`
- `Validation status`, when available.
- `Launch blocker status`, when available.
- `Queue pressure`, when available.

Design:
- Read-only ledger above the form.
- IDs use monospace.
- Current status uses text and badge.
- Current note is truncated only after multiple lines, with expand affordance.
- Last updated uses absolute date-time plus relative age.

Do not:
- Hide station ID.
- Collapse current service availability into one vague label.
- Show launch-ready as final if launch context is unavailable.

## Editable Fields
### Operating Status
Field:
- `operatingStatus`.

Allowed values:
- `active`
- `paused`

Labels:
- `Active`
- `Paused`

Helper copy:
- `Paused stations should not be treated as operating normally. Use when the station cannot safely run station workflows.`

Recommended control:
- Radio cards, not a casual switch.

Blocking rule:
- None from schema, but pausing a station requires confirmation.

### Intake Status
Field:
- `intakeStatus`.

Allowed values:
- `open`
- `restricted`

Labels:
- `Open`
- `Restricted`

Helper copy:
- `Restricted intake limits new package intake while the station may still complete other operational work.`

Recommended control:
- Radio cards.

Blocking rule:
- None from schema, but restricting intake requires impact review.

### Service Availability
Field:
- `serviceAvailability`.

Required booleans:
- `standard`
- `express`
- `doorstep`

Labels:
- `Standard service available`
- `Express service available`
- `Doorstep service available`

Recommended control:
- Three service availability rows with explicit on/off labels.
- Each row explains effect.

Service helper copy:
- `Standard`: `Controls baseline station-to-station service availability.`
- `Express`: `Controls express option availability for this station.`
- `Doorstep`: `Controls doorstep option availability tied to this station.`

Validation:
- All three booleans must exist.
- Turning every service off requires high-impact confirmation.
- Turning `standard` off while `express` remains on shows a consistency warning because express usually depends on baseline station operations.
- Turning doorstep on while station is paused shows a warning.
- Opening intake while operating status is paused shows a warning.

### Note
Field:
- `note`.

Allowed:
- Optional.
- Trimmed.
- `3..240` characters when included.

Use cases:
- Explain why station was paused.
- Explain why intake was restricted.
- Explain why a service was disabled.
- Explain recovery condition.
- Clear stale note when station is fully active and open again.

Validation:
- `1..2` characters after trim is invalid.
- More than `240` characters is invalid.
- Empty after trim means omit `note`.

Helper copy:
- `Add a short operational reason. Leave blank only when there is no current station-status note to preserve.`

Error copy:
- `Note must be at least 3 characters or left blank.`
- `Note must be 240 characters or fewer.`

## Impact Review
Purpose:
- Make the operational blast radius visible before confirmation.

Impact rows:
- Operating status change.
- Intake status change.
- Standard availability change.
- Express availability change.
- Doorstep availability change.
- Note change.
- Launch readiness effect.
- Queue effect.
- Staff workflow effect.
- Public service effect caveat.

Before-and-after table:
| Field | Current | Proposed |
| --- | --- | --- |
| Operating status | current value | selected value |
| Intake status | current value | selected value |
| Standard | current boolean label | selected boolean label |
| Express | current boolean label | selected boolean label |
| Doorstep | current boolean label | selected boolean label |
| Note | current note or none | proposed note or none |

Impact labels:
- `No change`
- `Service reduced`
- `Service restored`
- `Intake restricted`
- `Station paused`
- `Station reactivated`
- `Launch readiness may change`
- `Requires queue review`

High-impact conditions:
- `operatingStatus` changes from `active` to `paused`.
- `intakeStatus` changes from `open` to `restricted`.
- Any service changes from available to unavailable.
- All services become unavailable.
- Station becomes active while validation remains blocked.

Impact copy for high-impact:
- `This override can affect new bookings, station queues, staff workflow, and launch readiness. Review the proposed state before submitting.`

## Payload Builder
Payload rules:
- Always include `operatingStatus`.
- Always include `intakeStatus`.
- Always include `serviceAvailability.standard`.
- Always include `serviceAvailability.express`.
- Always include `serviceAvailability.doorstep`.
- Include `note` only when trimmed note is non-empty.
- Omit `note` when blank.
- Do not include station ID in body.
- Do not include launch readiness context.
- Do not include validation fields.
- Do not include queue counts.
- Do not include issue IDs.

Payload without note:
```json
{
  "operatingStatus": "active",
  "intakeStatus": "open",
  "serviceAvailability": {
    "standard": true,
    "express": true,
    "doorstep": true
  }
}
```

Payload with note:
```json
{
  "operatingStatus": "paused",
  "intakeStatus": "restricted",
  "serviceAvailability": {
    "standard": false,
    "express": false,
    "doorstep": false
  },
  "note": "Temporary outage"
}
```

Payload display:
- Render formatted read-only JSON in review.
- Include route path with station ID separately.
- Do not include auth headers.
- Provide copy action only to authorized submit roles.

## Confirmation Step
Confirmation is required.

Confirmation content:
- Station name and ID.
- Before-and-after values.
- High-impact warnings.
- Exact payload.
- Non-effects.

Required acknowledgement:
- `I reviewed the station impact and understand this only changes station status fields.`

Extra acknowledgement for service reduction:
- `I understand this can restrict intake or service availability for this station.`

Primary action:
- `Update station status`

Secondary action:
- `Back to edit`

Non-effects:
- Does not update station validation.
- Does not approve launch.
- Does not move deliveries.
- Does not close issues.
- Does not notify customers directly.
- Does not update pricing.
- Does not edit staff access.

Confirmation rules:
- Confirmation resets when any field changes.
- Submit disabled until required acknowledgements are checked.
- Extra acknowledgement appears only for service reduction or paused/restricted changes.

## Server Submission
Submit only when:
- User has `override_queue_state`.
- Station ID is known.
- Current station status loaded.
- Form values parse through schema.
- Impact review completed.
- Required acknowledgements checked.

Request:
- Method: `POST`.
- Path: `/v1/admin/stations/:id/status`.
- Operation: `admin_update_station_status`.
- Header: `Idempotency-Key`.
- Body: deterministic payload.

Idempotency:
- Generate key when entering confirmation.
- Scope key to station ID and payload fingerprint.
- Reuse key for retry after network failure when payload is unchanged.
- Regenerate key when payload changes.

Submission UI:
- Disable controls.
- Show `Updating station status`.
- Keep payload visible.
- Do not close while submitting.

Success UI:
- State: `server_confirmed`.
- Title: `Station status updated`
- Body: `The backend saved the station status override.`
- Show saved status values.
- Show saved note when present.
- Show `updatedAt`.
- Primary action: `Open station detail`
- Secondary action: `Close`
- Tertiary action: `Open audit events`

Success must not:
- Claim launch is approved.
- Claim queues were cleared.
- Claim public copy changed.
- Claim issues were resolved.

## Blocked States
`station_missing`:
- Triggered when station ID cannot be found in admin station context.
- Title: `Station not found`
- Body: `This station is unavailable or outside the configured station catalog.`
- Primary action: `Retry`
- Secondary action: `Close`

`current_status_missing`:
- Triggered when required station status fields are absent.
- Title: `Station status is incomplete`
- Body: `Current operating, intake, and service availability values are required before an override can be submitted.`
- Primary action: `Retry`
- Secondary action: `Open station detail`

`read_only`:
- Triggered when admin can read but lacks submit capability.
- Title: `Read-only station status`
- Body: `You can review this station status, but cannot submit overrides.`
- Primary action: `Close`
- Secondary action: `Open station detail`

`role_blocked`:
- Triggered when caller is not allowed to view admin station context.
- Title: `Station status is restricted`
- Body: `You do not have permission to view or update this station status.`
- Primary action: `Close`

## Error Handling
Map backend and client failures to safe UI states.

Error mapping:
| Condition | UI state | Safe copy | Recovery |
| --- | --- | --- | --- |
| `FORBIDDEN` with missing or invalid auth details | `session_expired` | `Sign in again to continue.` | Route to admin sign in |
| `FORBIDDEN` with missing `override_queue_state` capability | `role_blocked` or `read_only` | `You do not have permission to update station status.` | Close or read station detail |
| `VALIDATION_ERROR` from request body | `client_invalid` | `Some station status fields are missing or invalid.` | Fix fields |
| `NOT_FOUND` station context | `station_missing` | `Station record was not found.` | Retry or close |
| `RATE_LIMITED` or HTTP 429 | `rate_limited` | `Too many station status attempts. Wait before trying again.` | Retry after wait |
| Network failure | `network_error` | `Station status could not be updated. Check connection and retry.` | Retry with same payload |
| Unknown server error | `server_rejected` | `Station status update failed on our side. Try again or escalate to operations lead.` | Retry or open issue |

Field errors:
- Operating status error attaches to operating status group.
- Intake status error attaches to intake status group.
- Service availability error attaches to service rows.
- Note error attaches to note field.
- Confirmation error attaches to acknowledgement checkbox and summary.

Global errors:
- Use error summary at modal top.
- Preserve form values after failure.
- Keep payload visible after submit failure.
- Announce blocking errors assertively.

## State Machine
State list:
- `closed`
- `opening`
- `context_loading`
- `ready`
- `read_only`
- `station_missing`
- `current_status_missing`
- `form_editing`
- `dirty`
- `client_invalid`
- `impact_review`
- `confirming`
- `submitting`
- `server_confirmed`
- `server_rejected`
- `role_blocked`
- `rate_limited`
- `network_error`
- `session_expired`
- `closing_to_sign_in`
- `closing`

Transitions:
- `closed` to `opening` when trigger fires.
- `opening` to `context_loading` when station context loads.
- `context_loading` to `role_blocked` when admin read is not allowed.
- `context_loading` to `read_only` when read allowed but submit denied.
- `context_loading` to `station_missing` when station cannot be found.
- `context_loading` to `current_status_missing` when required values are absent.
- `context_loading` to `ready` when station and permissions are valid.
- `ready` to `form_editing` when form initialized.
- `form_editing` to `dirty` when value changes.
- `dirty` to `client_invalid` when validation fails.
- `dirty` to `impact_review` when review action is selected and values are valid.
- `impact_review` to `form_editing` when user changes values.
- `impact_review` to `confirming` when user accepts review.
- `confirming` to `submitting` when acknowledgements complete and submit starts.
- `submitting` to `server_confirmed` on success.
- `submitting` to `server_rejected` on server failure.
- `submitting` to `network_error` on network failure.
- `submitting` to `rate_limited` on rate limit.
- Any non-submitting state to `session_expired` on auth expiration.
- `session_expired` to `closing_to_sign_in` when user chooses sign in.
- Any non-submitting state to `closing` when user closes.
- `closing` to `closed` after animation and focus return.

Blocked transitions:
- `read_only` cannot submit.
- `station_missing` cannot submit.
- `current_status_missing` cannot submit.
- `role_blocked` cannot submit.
- `submitting` cannot close.
- `server_confirmed` cannot submit again.

## Modal Structure
Desktop:
- Max width: `900px`.
- Max height: `min(86vh, 900px)`.
- Sticky header.
- Sticky footer.
- Scrollable body.
- Two columns: form and impact panel.

Tablet:
- Width: `min(94vw, 820px)`.
- Impact panel stacks below form.

Mobile fallback:
- Full-screen sheet.
- Single column.
- Sticky action bar.
- Impact rows collapse into before-and-after cards.

Sections:
- Header.
- Station identity ledger.
- Current status summary.
- Proposed status form.
- Service availability form.
- Note field.
- Impact review.
- Payload review.
- Confirmation block.
- Result view.
- Footer actions.

## Header
Header content:
- Eyebrow: `Station operations`
- Title: `Override station status`
- Subtitle: `Change operating, intake, and service availability for this station.`
- Close button with accessible label `Close station status override modal`.

Header badges:
- `Audit-sensitive`
- `Operations only`
- Current operating status.

Header must show:
- Station name.
- Station ID.
- City.

Close behavior:
- If unchanged, close immediately.
- If dirty, confirm before closing.
- Escape closes only when safe.
- During submit, close disabled.

## Visual System
Use existing design tokens.

Color:
- Active/open/available: `success.green.600`.
- Restricted/warning: `warning.amber.600`.
- Paused/unavailable/failed: `danger.red.600`.
- System action: `brand.blue.600`.
- Text: `neutral.900`.
- Secondary text: `neutral.700`.
- Muted text: `neutral.500`.
- Surface: `surface`.

Typography:
- Title: `Manrope`, semibold, 24px desktop, 20px mobile.
- Section heading: `Manrope`, semibold, 16px.
- Body: `Inter`, regular, 14px.
- Status labels: `Inter`, semibold, 13px.
- IDs: monospace for station ID only.

Spacing:
- Modal padding: `24px` desktop, `16px` mobile.
- Section gap: `24px`.
- Row gap: `12px`.
- Field gap: `8px`.
- Footer gap: `12px`.

Motion:
- Modal entry: opacity and small scale.
- Duration: `160ms`.
- Impact row highlight: opacity only.
- Reduced motion removes scale.

## Interaction Details
Opening:
- Trigger passes station ID and optional station context.
- Focus moves to modal title during loading.
- If editable, focus moves to operating status group.
- If blocked, focus moves to blocker title.

Editing:
- Changing any field marks form dirty.
- Dirty state enables review action.
- Reverting all fields to current values disables submit and shows `No changes to submit`.
- Service availability rows update impact preview immediately.

Review:
- User selects `Review status override`.
- Modal shows before-and-after values.
- User can go back to edit.
- Payload review appears before confirmation.

Submit:
- One primary submit.
- Double click does not duplicate request.
- Network retry preserves payload and idempotency key.
- Success invalidates station and launch readiness caches.

Closing:
- Return focus to trigger.
- If trigger no longer exists, focus parent screen heading.

## Copy System
Voice:
- Clear.
- Calm.
- Operational.
- Direct.

Words to use:
- `station`
- `operating status`
- `intake status`
- `service availability`
- `paused`
- `restricted`
- `available`
- `unavailable`
- `override`

Words to avoid:
- `safe` as a guarantee.
- `live` as public promise unless public availability exists.
- `launch approved`.
- `queue cleared`.
- `issue resolved`.

Primary CTA by state:
- Editing: `Review status override`
- Review: `Continue to confirmation`
- Confirming: `Update station status`
- Submitting: `Updating status`
- Success: `Open station detail`
- Read only: `Close`
- Error: `Retry update`

Microcopy:
- `Paused`: `Use when the station cannot operate normally.`
- `Restricted intake`: `Use when new package intake should be limited.`
- `Service unavailable`: `Customers and staff may need alternate routing once public availability uses this status.`
- `No validation change`: `Validation evidence is managed separately.`

Success text:
- Title: `Station status updated`
- Body: `The backend saved the station status override. Review station detail or audit events for follow-up.`

Failure text:
- Title: `Station status update failed`
- Body: `The station was not changed. Review the error and retry or escalate to operations lead.`

## Accessibility Requirements
Modal behavior:
- Use `role="dialog"`.
- Use `aria-modal="true"`.
- Title referenced by `aria-labelledby`.
- Concise warning referenced by `aria-describedby`.
- Background content inert.
- Focus trapped.
- Escape closes only when safe.
- Focus returns to trigger.

Confirmation:
- Use alert-dialog semantics for the confirmation block when implemented as nested confirmation.
- Avoid nested focus traps unless shared modal system supports them.

Keyboard:
- Radio groups use arrow keys.
- Service availability rows are reachable and named.
- Note field is reachable and labelled.
- Review correction buttons are keyboard buttons.
- Footer actions follow logical order.

Screen reader:
- Status changes announced politely.
- Field errors announced with summary.
- High-impact warnings announced when they appear.
- Saving state announced politely.
- Success announced politely.
- Blocking errors announced assertively.

Visual accessibility:
- Color is never the only status signal.
- Focus ring visible on all controls.
- Touch targets meet minimum size.
- Text contrast meets AA.
- Large text does not hide action bar.

## Privacy And Security
Data minimization:
- Show only station operational context required for override.
- Do not show staff personal data.
- Do not show customer data.
- Do not show package-level details unless already present in parent screen and necessary for impact.

Sensitive action controls:
- Gate submit by `override_queue_state`.
- Require confirmation.
- Use idempotency.
- Preserve audit trail through backend mutation.
- Do not allow hidden status mutation from read-only surfaces.

Client trust boundary:
- Client can propose status.
- Backend validates schema.
- Backend saves the station record.
- Client cannot approve launch.
- Client cannot close issues.
- Client cannot move deliveries.

Analytics redaction:
- Include station ID, source screen, old status, new status, service availability booleans, outcome, error code.
- Exclude note text by default.
- Include note length band only if needed.
- Exclude staff names and customer data.

## Cache And Navigation Effects
On success:
- Invalidate `AdminStationList`.
- Invalidate `Station`.
- Invalidate `LaunchReadiness`.
- Invalidate station detail cache.
- Invalidate station capacity cache when present.
- Invalidate audit event cache.

Navigation actions:
- `Open station detail` navigates to `/admin/stations/:stationId`.
- `Open launch readiness` navigates to `/admin/launch-readiness`.
- `Open audit events` navigates to `/admin/audit-events` filtered by operation when supported.
- `Close` returns to parent.

State preservation:
- Parent row should update to backend-saved values.
- If launched from readiness blocker, preserve blocker context.
- Do not place note text in URL.

## Analytics Events
Events:
- `station_status_override_modal_opened`
- `station_status_context_loaded`
- `station_status_context_blocked`
- `station_status_field_changed`
- `station_status_impact_reviewed`
- `station_status_confirmation_checked`
- `station_status_submit_started`
- `station_status_submit_succeeded`
- `station_status_submit_failed`
- `station_status_modal_closed`

Shared properties:
- `sourceScreen`
- `stationId`
- `currentOperatingStatus`
- `nextOperatingStatus`
- `currentIntakeStatus`
- `nextIntakeStatus`
- `standardAvailable`
- `expressAvailable`
- `doorstepAvailable`
- `serviceReduced`
- `hasLaunchContext`
- `outcome`
- `errorCode`
- `durationMs`

Do not capture:
- Note text.
- Staff personal data.
- Customer data.
- Auth token.
- Idempotency key.

Outcome values:
- `saved`
- `read_only`
- `station_missing`
- `client_invalid`
- `role_blocked`
- `rate_limited`
- `network_error`
- `server_rejected`
- `closed_without_submit`

## Component API
Suggested component signature:
```ts
type StationStatusOverrideProps = {
  isOpen: boolean;
  stationId: string;
  sourceScreen:
    | "AdminStationStatusOverride"
    | "AdminStationDetail"
    | "AdminStations"
    | "AdminStationCapacity"
    | "AdminLaunchReadiness"
    | "AdminLaunchReadinessDetail"
    | "AdminBlockedDeliveryQueue"
    | "AdminIssueQueue";
  initialStation?: AdminStationRecord;
  launchContext?: StationLaunchReadinessContext;
  onClose: () => void;
  onSaved?: (result: StationStatusOverrideResult) => void;
  onRouteToStationDetail?: (stationId: string) => void;
  onRouteToLaunchReadiness?: (stationId: string) => void;
};
```

Suggested internal form:
```ts
type StationStatusOverrideForm = {
  operatingStatus: "active" | "paused";
  intakeStatus: "open" | "restricted";
  serviceAvailability: {
    standard: boolean;
    express: boolean;
    doorstep: boolean;
  };
  note: string;
};
```

API hook:
- Use `useAdminStationsQuery` for context when needed.
- Use `useAdminUpdateStationStatusMutation` for submit.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness`.

Do not:
- Build untyped fetch in component body.
- Submit partial service availability.
- Store note text in analytics.
- Create frontend-only station status enums.

## Test Requirements
Unit tests:
- Renders read-only state for role without `override_queue_state`.
- Renders station-missing state when station ID not found.
- Initializes form from current station.
- Disables review when no values changed.
- Builds payload with all required fields.
- Omits note when blank after trim.
- Includes note when valid.
- Validates short note.
- Validates max note length.
- Shows high-impact warning when pausing station.
- Shows high-impact warning when restricting intake.
- Shows high-impact warning when disabling a service.
- Requires acknowledgement before submit.
- Resets acknowledgement when form changes.
- Does not include launch readiness data in payload.
- Does not call validation mutation.

Integration tests:
- Opens from station detail with context.
- Opens from station list and resolves station from cache.
- Opens from launch-readiness blocker and shows launch impact.
- Submits `admin_update_station_status` with idempotency key.
- Handles backend saved response.
- Invalidates station and launch readiness caches.
- Handles forbidden response.
- Handles rate limit response.
- Handles network error and retry.
- Handles session expiration.

Accessibility tests:
- Modal has `role="dialog"` and `aria-modal="true"`.
- Focus moves into modal on open.
- Focus is trapped.
- Escape closes when safe.
- Escape does not close while submitting.
- Focus returns to trigger.
- Radio groups are keyboard usable.
- Service rows have accessible names.
- Error summary links to invalid fields.
- Success state is announced.
- Large text keeps footer usable.

Visual regression targets:
- Ready unchanged state.
- Dirty edit state.
- Paused and restricted high-impact state.
- All services unavailable state.
- Impact review.
- Confirmation.
- Submitting.
- Success.
- Read-only.
- Station missing.
- Mobile full-screen sheet.

End-to-end scenarios:
- Ops admin pauses station and restricts intake with note.
- Ops admin reactivates station and clears note.
- Ops admin disables doorstep only.
- Ops admin restores all services.
- Support admin sees read-only state.
- Network failure preserves form and retry path.

## Acceptance Criteria
Functional:
- Modal opens from every listed parent.
- Modal resolves station from parent or `admin_stations`.
- Modal blocks unauthorized submit.
- Modal allows read-only review for read-only admin roles.
- Modal edits only `operatingStatus`, `intakeStatus`, `serviceAvailability`, and optional `note`.
- Modal submits valid `adminUpdateStationStatusRequestSchema` payload.
- Modal includes all service availability booleans.
- Modal never calls validation endpoint.
- Modal never mutates deliveries, issues, pricing, users, or launch readiness.
- Modal shows backend-saved result.

UX:
- Admin can identify station quickly.
- Admin can compare current and proposed status.
- Admin sees service reduction impact.
- Admin reviews exact payload before submit.
- Admin confirms high-impact changes.
- Admin can recover from failure without losing changes.

Accessibility:
- Fully keyboard operable.
- Screen reader state changes announced.
- Visible focus throughout.
- Errors tied to fields and summary.
- Target sizes meet minimum.
- Reduced motion honored.

Security:
- Submit gated by `override_queue_state`.
- Note text excluded from analytics.
- Idempotency protects repeat submits.
- Stale context requires review.
- Read-only roles cannot trigger hidden mutation.

## Implementation Notes For Claude Code
Build this as a shared admin modal that can be launched from the station owner screen and station-related admin surfaces. It should rely on `admin_stations` for station context because the backend has no single station detail endpoint.

The modal must treat station status as an audit-sensitive operational override, not a casual settings edit. Use before-and-after review, payload review, and confirmation before submit.

Do not merge this with `StationValidationModal`. Validation owns launch readiness evidence. This modal owns operating status, intake status, service availability, and optional note only.

The final implementation must feel like an operations circuit breaker:
- Clear station identity.
- Clear current state.
- Clear proposed state.
- Clear service impact.
- Clear payload.
- Clear confirmation.
- Clear backend-saved result.

## Build Checklist
- Create shared modal component under admin UI package.
- Add typed props and station context adapter.
- Add `admin_stations` context fallback.
- Add role and capability gate.
- Add station identity ledger.
- Add current status summary.
- Add operating status radio cards.
- Add intake status radio cards.
- Add service availability rows.
- Add note field.
- Add impact review.
- Add payload review.
- Add confirmation acknowledgements.
- Add idempotent submit for `admin_update_station_status`.
- Add success result view.
- Add read-only, missing station, invalid, rate-limit, network, forbidden, and session states.
- Add analytics with note redaction.
- Add cache invalidation.
- Add keyboard and focus handling.
- Add unit, integration, accessibility, and visual tests.

## Final Implementation Directive
`StationStatusOverride Modal` must be the controlled operational override for station status. It must submit only `admin_update_station_status`, send only `operatingStatus`, `intakeStatus`, full `serviceAvailability`, and optional `note`, require `override_queue_state`, and never update validation, launch readiness, deliveries, issues, users, pricing, or notifications. Build it as a precise, auditable, keyboard-first operations command modal that makes station service impact obvious before saving.
