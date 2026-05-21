# Station Validation Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `StationValidationModal` |
| Component target | shared admin station launch-readiness evidence modal |
| Primary test ID | `modal-station-validation` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 station launch-readiness control |
| Used by | `AdminStationValidation`, `AdminStationDetail`, `AdminStations`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminIssueQueue`, `AdminAuditEvents` |
| Backend coverage | `admin_update_station_validation` |
| Trigger source | station validation owner screen, station detail validation action, launch-readiness blocker action, station list readiness action |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `read_only`, `station_missing`, `current_validation_missing`, `evidence_editing`, `dirty`, `client_invalid`, `blocker_preview`, `payload_review`, `confirming`, `submitting`, `server_confirmed_ready`, `server_confirmed_blocked`, `server_rejected`, `role_blocked`, `rate_limited`, `network_error`, `session_expired`, `closing_to_sign_in`, `closing` |

## Product Job
`StationValidationModal` lets an authorized operations admin record the station evidence required for backend-derived launch readiness.

It answers:
- `Which station is being validated?`
- `What validation evidence is currently recorded?`
- `Which required evidence values will be submitted?`
- `Which blockers will likely remain?`
- `What exact payload will be sent?`
- `What readiness decision did the backend derive?`
- `What does the station still need before go-live eligibility?`

The user should be able to:
- Verify station identity.
- Review existing validation record.
- Update dry-run business day count.
- Update controlled pilot-volume business day count.
- Update all checklist booleans.
- Enter scan or manual-fallback success rate.
- Add or remove manual blockers.
- Add optional start and completion timestamps.
- Add optional validation note.
- Review backend-derived blocker preview.
- Review exact payload.
- Confirm the evidence update.
- Submit once with idempotency.
- See backend-derived `ready` or `blocked` result.

This modal is not:
- A station status override.
- A service availability override.
- A launch approval button.
- A public service area publishing tool.
- An issue closure tool.
- A staff roster tool.
- A payment or refund tool.
- A queue clearing tool.
- A way to bypass P1 incidents.
- A way to manually set `goLiveEligible`.

## Strategic Role
Station validation is the proof layer for launching or expanding a station. It must be evidence-led because station readiness affects package custody, scan fallback reliability, escalation, refunds, staff readiness, and public trust.

Core principle:
- The user records evidence.
- The backend derives readiness.
- The user cannot type `ready`.
- The user cannot type `goLiveEligible`.
- The user cannot remove derived blockers except by changing evidence.
- P1 incident evidence must remain explicit.
- Validation remains separate from station status.
- Validation remains separate from issue closure.

The operational failure this modal prevents:
- A station appears ready before dry-run days are complete.
- A station appears ready before controlled pilot-volume days are complete.
- Scan fallback is accepted below the required success threshold.
- Open P1 incident risk is hidden.
- Escalation and refund handoff readiness is skipped.
- Opening hours and storage ownership are left uncertain.
- Admin updates status instead of validation evidence.
- Launch owner trusts a frontend-only readiness calculation.

## Audience
Primary users:
- `ops_admin` recording station validation evidence.
- `super_admin` submitting high-impact readiness evidence.

Secondary users:
- `support_admin` reviewing readiness evidence in read-only mode.
- `finance_admin` reviewing station readiness for finance or refund context.
- Launch owner reviewing station blockers.
- QA validating readiness evidence rules.
- Security reviewer validating mutation guardrails.
- Claude Code implementing the frontend later.

Non-users:
- Public visitor.
- Sender.
- Receiver.
- Driver.
- Station operator.
- Final-mile courier.
- Finance admin submitting validation.
- Support admin submitting validation.
- Provider webhook processor.

## Context Of Use
The modal opens when an admin is working through station readiness or launch blockers.

Common entry contexts:
- `AdminStationValidation` owner screen.
- `AdminStationDetail` validation panel.
- `AdminStations` readiness row action.
- `AdminLaunchReadiness` station blocker action.
- `AdminLaunchReadinessDetail` station validation blocker action.
- `AdminIssueQueue` P1 station issue context.
- `AdminAuditEvents` follow-up from prior validation change.

The user may be:
- Starting validation for a new station.
- Recording supervised dry-run completion.
- Recording controlled pilot-volume completion.
- Updating checklist evidence.
- Updating scan or manual-fallback success rate.
- Adding a manual blocker.
- Removing a resolved manual blocker.
- Setting completion timestamp after readiness evidence is complete.
- Discovering backend still derives `blocked`.

## Design Brief
Audience:
- Operations admin or super admin with station validation authority.

Surface type:
- High-impact evidence-entry modal.

Primary action:
- `Update station validation`.

Visual thesis:
- `Readiness evidence cockpit`: a precise evidence form with derived blocker preview and backend result as final authority.

Restraint rule:
- No station status controls, no launch approval action, no issue closure, no frontend readiness score.

Density:
- High. The modal must show all required evidence but group it so operators can complete it without hunting.

Platform stance:
- Admin web first.
- Tablet compatible.
- Mobile web fallback for launch-room review.

## External Research Used
Only directly relevant links were used:
- [AWS operational readiness review guidance](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_ready_to_support_workload.html): supports verifying operational readiness before launch or major operational change.
- [Atlassian change management guidance](https://support.atlassian.com/jira-service-management-cloud/docs/what-is-change-management/): supports controlled review of operational readiness evidence before high-impact change.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports final review before submitting critical evidence.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports accessible form grouping, labels, and hints.
- [USWDS validation guidance](https://designsystem.digital.gov/components/validation/): supports clear correction guidance for complex forms.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-specific validation errors.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, validation, saving, and result states.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/12-admin-stations.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/13-admin-station-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/14-admin-station-validation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/15-admin-station-status-override.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/03-admin-launch-readiness.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/04-admin-launch-readiness-detail.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/15-station-status-override-modal.md`
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
- Operation key: `admin_update_station_validation`.
- Route: `POST /v1/admin/stations/:id/validation`.
- Path param: station ID.
- Required prehandler: admin mutation guard plus station management capability.
- Required capability: `override_queue_state`.
- Request schema: `adminUpdateStationValidationRequestSchema`.
- Response schema: `adminUpdateStationValidationResponseSchema`.
- Route metadata marks the mutation idempotent.
- Handler wraps the mutation in the idempotent mutation runner.

Read context:
- Operation key: `admin_stations`.
- Route: `GET /v1/admin/stations`.
- There is no standalone station validation detail endpoint.
- The modal must receive station context from parent or resolve from `admin_stations`.

Optional context:
- Operation key: `admin_launch_readiness`.
- Route: `GET /v1/admin/launch-readiness`.
- Used only to explain launch-readiness blockers.

Request body:
```json
{
  "dryRunBusinessDaysCompleted": 2,
  "controlledPilotBusinessDaysCompleted": 3,
  "checklist": {
    "activeOperatorsCanSignIn": true,
    "intakeDispatchReceiptAudited": true,
    "scanOrManualFallbackTested": true,
    "noUnresolvedP1Incidents": true,
    "escalationAndRefundHandoffTested": true,
    "openingHoursStorageAndHandoffConfirmed": true
  },
  "scanFallbackSuccessRatePercent": 97,
  "manualBlockers": [],
  "startedAt": "2026-05-11T07:00:00.000Z",
  "completedAt": "2026-05-15T19:00:00.000Z",
  "note": "Station validation completed by operations lead."
}
```

Required request fields:
- `dryRunBusinessDaysCompleted`.
- `controlledPilotBusinessDaysCompleted`.
- `checklist`.
- `scanFallbackSuccessRatePercent`.

Optional request fields:
- `manualBlockers`.
- `startedAt`.
- `completedAt`.
- `note`.

Successful response:
```json
{
  "stationId": "ST-ACC-01",
  "name": "Accra Central",
  "city": "Accra",
  "validation": {
    "status": "ready",
    "dryRunBusinessDaysCompleted": 2,
    "controlledPilotBusinessDaysCompleted": 3,
    "checklist": {
      "activeOperatorsCanSignIn": true,
      "intakeDispatchReceiptAudited": true,
      "scanOrManualFallbackTested": true,
      "noUnresolvedP1Incidents": true,
      "escalationAndRefundHandoffTested": true,
      "openingHoursStorageAndHandoffConfirmed": true
    },
    "scanFallbackSuccessRatePercent": 97,
    "goLiveEligible": true,
    "blockers": [],
    "startedAt": "2026-05-11T07:00:00.000Z",
    "completedAt": "2026-05-15T19:00:00.000Z",
    "note": "Station validation completed by operations lead.",
    "updatedAt": "2026-05-16T12:15:00.000Z"
  }
}
```

Backend-derived fields:
- `validation.status`.
- `validation.goLiveEligible`.
- `validation.blockers`.
- `validation.updatedAt`.

Important backend facts:
- Dry-run days must be integer `0..2`.
- Controlled pilot-volume days must be integer `0..3`.
- Scan fallback success rate must be `0..100`.
- Manual blockers are optional.
- Manual blockers are limited to `10` entries.
- Each manual blocker must be `3..160` characters.
- Note is optional and must be `3..240` characters when included.
- Backend adds dry-run blocker when dry-run days are below `2`.
- Backend adds controlled pilot blocker when controlled pilot days are below `3`.
- Backend adds checklist blockers for false checklist items.
- Backend adds scan success blocker when rate is below `95`.
- Backend adds all manual blockers to derived blockers.
- Backend sets `ready` only when no blockers remain.
- Backend sets `blocked` when manual blockers exist or `noUnresolvedP1Incidents` is false.
- Backend sets `in_progress` when some evidence exists but blockers remain.
- Backend sets `not_started` when no signal exists.

Therefore:
- The modal may submit only `admin_update_station_validation`.
- The modal must not call `admin_update_station_status`.
- The modal must not submit `status`.
- The modal must not submit `goLiveEligible`.
- The modal must not submit derived blockers.
- The modal must not locally mark a station ready as final.
- The backend response is the final readiness result.

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
- Hide submit in read-only mode.
- Keep evidence visible only to authorized admin readers.

Read-only copy:
- Title: `Station validation is read only`
- Body: `You can review readiness evidence, but only operations admins and super admins can update validation.`
- Primary action: `Close`
- Secondary action: `Open station detail`

## Data Dependencies
Required context:
- `stationId`.
- Station name.
- Station city.
- Current validation record.
- Current user role and capabilities.

Required validation values:
- `validation.status`.
- `dryRunBusinessDaysCompleted`.
- `controlledPilotBusinessDaysCompleted`.
- Six checklist booleans.
- `scanFallbackSuccessRatePercent`.
- `goLiveEligible`.
- `blockers`.
- `updatedAt`.

Preferred context:
- Station operating status.
- Station intake status.
- Service availability.
- Launch readiness blocker.
- P1 issue count.
- Active queue count.
- Latest station note.

Context hydration order:
- Use parent station record when provided.
- Use `admin_stations` cache.
- Fetch `admin_stations` if missing or stale.
- Match by `stationId`.
- Use launch-readiness cache only for explanation.
- If station cannot be found, show `station_missing`.
- If validation record is absent or malformed, show `current_validation_missing`.

Do not:
- Guess validation evidence.
- Infer ready state from UI-only calculations.
- Use station status as validation evidence.
- Treat lack of launch context as ready.

## Evidence Sections
### Dry-Run Evidence
Field:
- `dryRunBusinessDaysCompleted`.

Allowed:
- Integer `0..2`.

Requirement:
- Must be `2` to avoid blocker.

Label:
- `Supervised dry-run business days completed`

Helper copy:
- `Record only completed supervised dry-run business days. Backend readiness requires 2.`

Error copy:
- `Dry-run days must be 0, 1, or 2.`

### Controlled Pilot-Volume Evidence
Field:
- `controlledPilotBusinessDaysCompleted`.

Allowed:
- Integer `0..3`.

Requirement:
- Must be `3` to avoid blocker.

Label:
- `Controlled pilot-volume business days completed`

Helper copy:
- `Record completed controlled pilot-volume days. Backend readiness requires 3.`

Error copy:
- `Controlled pilot-volume days must be between 0 and 3.`

### Required Checklist
Checklist fields:
- `activeOperatorsCanSignIn`
- `intakeDispatchReceiptAudited`
- `scanOrManualFallbackTested`
- `noUnresolvedP1Incidents`
- `escalationAndRefundHandoffTested`
- `openingHoursStorageAndHandoffConfirmed`

Checklist labels:
- `Active operators can sign in and perform assigned flows`
- `Intake, dispatch, and destination receipt have audit logs`
- `Scan or manual fallback has been tested`
- `No unresolved P1 incident remains`
- `Escalation and refund handoff have been tested`
- `Opening hours, storage, and handoff ownership are confirmed`

Behavior:
- Each item is a required boolean.
- False is allowed but creates or preserves blocker.
- User must intentionally review every row.
- Rows should show current value, proposed value, and blocker copy.

P1 rule:
- If `noUnresolvedP1Incidents` is false, backend status becomes `blocked`.
- UI must show a strong warning and route to issue queue.

### Scan Fallback Success Rate
Field:
- `scanFallbackSuccessRatePercent`.

Allowed:
- Number `0..100`.

Requirement:
- Must be at least `95` to avoid blocker.

Label:
- `Scan or manual fallback success rate`

Helper copy:
- `Enter the verified success percentage. Backend readiness requires at least 95 percent.`

Error copy:
- `Success rate must be between 0 and 100.`

Warning copy:
- `Below 95 percent keeps launch readiness blocked.`

### Manual Blockers
Field:
- `manualBlockers`.

Allowed:
- Optional array.
- Maximum `10` entries.
- Each entry `3..160` characters.

Use cases:
- Facility issue.
- Training gap.
- Equipment gap.
- Staff coverage gap.
- Route-specific operational blocker.

Behavior:
- Add blocker.
- Edit blocker.
- Remove blocker.
- Empty list may be omitted from payload.
- Any manual blocker means backend cannot be ready.

Error copy:
- `Manual blocker must be at least 3 characters.`
- `Manual blocker must be 160 characters or fewer.`
- `You can add up to 10 manual blockers.`

### Optional Dates
Fields:
- `startedAt`.
- `completedAt`.

Rules:
- Optional ISO date-times.
- If UI uses date/time fields, convert to ISO.
- `completedAt` should not be earlier than `startedAt`.
- Future timestamps show validation error.

Helper copy:
- `Use timestamps only when operations has verified the validation period.`

### Optional Note
Field:
- `note`.

Allowed:
- Optional.
- Trimmed.
- `3..240` characters when included.

Helper copy:
- `Add concise context for this validation update.`

Error copy:
- `Note must be at least 3 characters or left blank.`
- `Note must be 240 characters or fewer.`

## Derived Blocker Preview
Purpose:
- Help admins understand likely backend result before submit, without treating the preview as authoritative.

Preview inputs:
- Dry-run days.
- Controlled pilot-volume days.
- Checklist booleans.
- Scan fallback success rate.
- Manual blockers.

Preview blockers:
- `Complete 2 supervised dry-run business days.`
- `Complete 3 controlled pilot-volume business days.`
- `All active operators must sign in and perform assigned flows.`
- `Intake, dispatch, and destination receipt must have audit logs.`
- `Scan or manual fallback must be tested in practice.`
- `Station must have no unresolved P1 incident.`
- `Issue escalation and refund handoff must be tested.`
- `Opening hours, storage, and handoff ownership must be confirmed.`
- `Scan or manual fallback success must be at least 95%.`
- Manual blockers entered by user.

Preview labels:
- `Likely ready`
- `Likely in progress`
- `Likely blocked`

Authority copy:
- `This preview follows the current backend rules. The backend response is final.`

Do not:
- Call preview final.
- Show launch approval.
- Hide blockers to make the form look complete.

## Payload Builder
Payload rules:
- Always include `dryRunBusinessDaysCompleted`.
- Always include `controlledPilotBusinessDaysCompleted`.
- Always include full `checklist`.
- Always include `scanFallbackSuccessRatePercent`.
- Include `manualBlockers` only when non-empty, unless the client intentionally sends an empty array.
- Include `startedAt` only when provided.
- Include `completedAt` only when provided.
- Include `note` only when trimmed note is non-empty.
- Do not include derived `status`.
- Do not include `goLiveEligible`.
- Do not include derived `blockers`.
- Do not include station status fields.
- Do not include issue IDs.

Payload display:
- Render formatted read-only JSON.
- Show route path with station ID separately.
- Provide copy action only to authorized submit roles.
- Do not include auth headers.

Payload validation:
- Payload must parse through `adminUpdateStationValidationRequestSchema`.
- Confirmation is disabled until payload is valid.

## Review Step
Review rows:
- Station ID.
- Station name.
- Dry-run days.
- Controlled pilot-volume days.
- Six checklist values.
- Scan fallback success rate.
- Manual blockers.
- Started timestamp.
- Completed timestamp.
- Note status.
- Likely blocker count.
- Exact payload.

Correction links:
- `Change dry-run days`
- `Change pilot-volume days`
- `Change checklist`
- `Change scan success rate`
- `Change blockers`
- `Change dates`
- `Change note`

Review copy:
- `Review evidence before backend derives station readiness.`

Correction behavior:
- Correction returns focus to relevant field.
- Any correction resets confirmation.

## Confirmation Step
Confirmation is required.

Confirmation content:
- Station identity.
- Likely derived result.
- Blocker preview.
- Exact payload.
- Non-effects.

Required acknowledgement:
- `I reviewed the evidence and understand the backend derives readiness from these values.`

Extra acknowledgement when likely ready:
- `I understand this may make the station go-live eligible if the backend finds no blockers.`

Primary action:
- `Update station validation`

Secondary action:
- `Back to evidence`

Non-effects:
- Does not update station status.
- Does not enable services.
- Does not approve launch by itself.
- Does not close P1 issues.
- Does not move deliveries.
- Does not update users.
- Does not notify customers.

Confirmation rules:
- Confirmation resets when evidence changes.
- Submit disabled until required acknowledgement is checked.
- Extra acknowledgement appears when preview has no blockers.

## Server Submission
Submit only when:
- User has `override_queue_state`.
- Station ID is known.
- Validation context is loaded.
- Payload is schema-valid.
- Review is completed.
- Required acknowledgements are checked.

Request:
- Method: `POST`.
- Path: `/v1/admin/stations/:id/validation`.
- Operation: `admin_update_station_validation`.
- Header: `Idempotency-Key`.
- Body: deterministic payload.

Idempotency:
- Generate key when entering confirmation.
- Scope key to station ID and payload fingerprint.
- Reuse key for retry after network failure when payload is unchanged.
- Regenerate key when payload changes.

Submission UI:
- Disable controls.
- Show `Updating station validation`.
- Keep payload visible.
- Do not close while submitting.

Success UI for ready:
- State: `server_confirmed_ready`.
- Title: `Station validation saved`
- Body: `The backend marked this station validation ready and go-live eligible. Launch readiness still depends on all launch blockers.`
- Show `validation.status`.
- Show `goLiveEligible`.
- Show `updatedAt`.
- Primary action: `Open launch readiness`
- Secondary action: `Open station detail`

Success UI for blocked:
- State: `server_confirmed_blocked`.
- Title: `Station validation saved with blockers`
- Body: `The backend saved the evidence and returned remaining blockers.`
- Show blocker list.
- Show `validation.status`.
- Show `goLiveEligible`.
- Show `updatedAt`.
- Primary action: `Review blockers`
- Secondary action: `Open station detail`

Success must not:
- Claim launch is approved.
- Claim service availability changed.
- Claim P1 issues were closed.
- Hide returned blockers.

## Blocked States
`station_missing`:
- Triggered when station ID cannot be found in admin station context.
- Title: `Station not found`
- Body: `This station is unavailable or outside the configured station catalog.`
- Primary action: `Retry`
- Secondary action: `Close`

`current_validation_missing`:
- Triggered when validation record is absent or malformed.
- Title: `Validation record is incomplete`
- Body: `Current validation values are required before editing. Refresh station data before continuing.`
- Primary action: `Retry`
- Secondary action: `Open station detail`

`read_only`:
- Triggered when admin can read but lacks submit capability.
- Title: `Read-only station validation`
- Body: `You can review readiness evidence, but cannot submit validation updates.`
- Primary action: `Close`
- Secondary action: `Open station detail`

`role_blocked`:
- Triggered when caller is not allowed to view admin station context.
- Title: `Station validation is restricted`
- Body: `You do not have permission to view or update station validation.`
- Primary action: `Close`

## Error Handling
Map backend and client failures to safe UI states.

Error mapping:
| Condition | UI state | Safe copy | Recovery |
| --- | --- | --- | --- |
| `FORBIDDEN` with missing or invalid auth details | `session_expired` | `Sign in again to continue.` | Route to admin sign in |
| `FORBIDDEN` with missing `override_queue_state` capability | `role_blocked` or `read_only` | `You do not have permission to update station validation.` | Close or read station detail |
| `VALIDATION_ERROR` from request body | `client_invalid` | `Some validation evidence is missing or invalid.` | Fix fields |
| `NOT_FOUND` station context | `station_missing` | `Station record was not found.` | Retry or close |
| `RATE_LIMITED` or HTTP 429 | `rate_limited` | `Too many validation attempts. Wait before trying again.` | Retry after wait |
| Network failure | `network_error` | `Station validation could not be updated. Check connection and retry.` | Retry with same payload |
| Unknown server error | `server_rejected` | `Station validation update failed on our side. Try again or escalate to operations lead.` | Retry or open issue |

Field errors:
- Day count errors attach to day inputs.
- Checklist errors attach to checklist group.
- Scan success error attaches to success rate input.
- Manual blocker errors attach to the specific blocker row.
- Date errors attach to date/time controls.
- Note errors attach to note field.
- Confirmation errors attach to acknowledgement checkbox.

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
- `current_validation_missing`
- `evidence_editing`
- `dirty`
- `client_invalid`
- `blocker_preview`
- `payload_review`
- `confirming`
- `submitting`
- `server_confirmed_ready`
- `server_confirmed_blocked`
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
- `context_loading` to `current_validation_missing` when validation record is invalid.
- `context_loading` to `ready` when context and permissions are valid.
- `ready` to `evidence_editing` when form initializes.
- `evidence_editing` to `dirty` when evidence changes.
- `dirty` to `client_invalid` when schema validation fails.
- `dirty` to `blocker_preview` when values are valid.
- `blocker_preview` to `payload_review` when user reviews payload.
- `payload_review` to `confirming` when user accepts review.
- `confirming` to `submitting` when acknowledgement is checked and submit starts.
- `submitting` to `server_confirmed_ready` when backend returns `goLiveEligible: true`.
- `submitting` to `server_confirmed_blocked` when backend returns blockers or not ready.
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
- `current_validation_missing` cannot submit.
- `role_blocked` cannot submit.
- `submitting` cannot close.
- Success states cannot submit again without reopening.

## Modal Structure
Desktop:
- Max width: `960px`.
- Max height: `min(88vh, 940px)`.
- Sticky header.
- Sticky footer.
- Scrollable body.
- Main evidence column plus right blocker preview panel.

Tablet:
- Width: `min(94vw, 860px)`.
- Blocker preview stacks below evidence.

Mobile fallback:
- Full-screen sheet.
- Single column.
- Sticky action bar.
- Checklist rows remain full-width.

Sections:
- Header.
- Station identity ledger.
- Current validation summary.
- Dry-run evidence.
- Controlled pilot-volume evidence.
- Checklist evidence.
- Scan fallback success rate.
- Manual blockers.
- Dates and note.
- Derived blocker preview.
- Payload review.
- Confirmation.
- Result view.

## Header
Header content:
- Eyebrow: `Station readiness`
- Title: `Update station validation`
- Subtitle: `Record evidence. The backend decides readiness.`
- Close button with accessible label `Close station validation modal`.

Header badges:
- `Launch evidence`
- `Operations only`
- Current validation status.

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
- Ready: `success.green.600`.
- In progress or attention: `warning.amber.600`.
- Blocked: `danger.red.600`.
- System action: `brand.blue.600`.
- Text: `neutral.900`.
- Secondary text: `neutral.700`.
- Muted text: `neutral.500`.
- Surface: `surface`.

Typography:
- Title: `Manrope`, semibold, 24px desktop, 20px mobile.
- Section heading: `Manrope`, semibold, 16px.
- Body: `Inter`, regular, 14px.
- Evidence labels: `Inter`, semibold, 14px.
- Numbers: `Inter`, semibold, tabular numerals.
- IDs: monospace for station ID only.

Spacing:
- Modal padding: `24px` desktop, `16px` mobile.
- Section gap: `24px`.
- Row gap: `12px`.
- Field gap: `8px`.
- Footer gap: `12px`.

Motion:
- Modal entry uses opacity and small scale.
- Duration: `160ms`.
- Blocker preview updates without motion unless highlighting changed rows.
- Reduced motion removes scale and row animation.

## Interaction Details
Opening:
- Trigger passes station ID and optional station validation context.
- Focus moves to title during loading.
- If editable, focus moves to dry-run evidence field.
- If blocked, focus moves to blocker title.

Editing:
- Changing evidence marks form dirty.
- Reverting to original values disables submit.
- Checklist rows update preview immediately.
- Manual blocker edits debounce preview only for display, not validation.

Review:
- User selects `Review validation`.
- Modal shows evidence summary and payload.
- Correction buttons return focus to relevant field.

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
- Evidence-led.
- Operational.

Words to use:
- `validation evidence`
- `backend-derived readiness`
- `blockers`
- `dry-run days`
- `controlled pilot-volume days`
- `scan fallback success`
- `go-live eligible`

Words to avoid:
- `launch approved`.
- `safe to launch` as guarantee.
- `instant ready`.
- `override readiness`.
- `clear issues`.

Primary CTA by state:
- Editing: `Review validation`
- Review: `Continue to confirmation`
- Confirming: `Update station validation`
- Submitting: `Updating validation`
- Ready success: `Open launch readiness`
- Blocked success: `Review blockers`
- Read-only: `Close`
- Error: `Retry update`

Microcopy:
- `Backend authority`: `The backend derives status and blockers from submitted evidence.`
- `No status change`: `Station operating status is managed separately.`
- `P1 blocker`: `Unresolved P1 incidents keep this station blocked.`
- `Scan threshold`: `Readiness requires at least 95 percent scan or fallback success.`

## Accessibility Requirements
Modal behavior:
- Use `role="dialog"`.
- Use `aria-modal="true"`.
- Title referenced by `aria-labelledby`.
- Concise description referenced by `aria-describedby`.
- Background content inert.
- Focus trapped.
- Escape closes only when safe.
- Focus returns to trigger.

Keyboard:
- Numeric inputs keyboard reachable.
- Checklist rows have accessible names.
- Manual blocker add, edit, and remove buttons are keyboard reachable.
- Review correction buttons are keyboard buttons.
- Footer actions follow logical order.

Screen reader:
- Loading announced politely.
- Field errors announced through error summary.
- Blocker preview changes announced politely.
- Saving announced politely.
- Backend result announced politely.
- Blocking errors announced assertively.

Visual accessibility:
- Color never stands alone.
- Focus ring visible on all controls.
- Touch targets meet minimum size.
- Text contrast meets AA.
- Large text keeps action bar usable.

## Privacy And Security
Data minimization:
- Show only station readiness evidence.
- Do not show staff personal data.
- Do not show customer data.
- Do not show raw issue descriptions unless parent page already has permission and routes there.

Sensitive action controls:
- Gate submit by `override_queue_state`.
- Require confirmation.
- Use idempotency.
- Preserve audit trail through backend mutation.
- Do not allow hidden mutation from read-only surfaces.

Client trust boundary:
- Client submits evidence.
- Backend derives status.
- Backend derives blockers.
- Backend derives go-live eligibility.
- Client cannot mark final readiness.

Analytics redaction:
- Include station ID, source screen, evidence completion flags, likely blocker count, backend status, outcome, error code.
- Exclude note text.
- Exclude manual blocker text.
- Exclude staff names and customer data.

## Cache And Navigation Effects
On success:
- Invalidate `AdminStationList`.
- Invalidate `Station`.
- Invalidate `LaunchReadiness`.
- Invalidate station detail cache.
- Invalidate audit event cache.

Navigation actions:
- `Open launch readiness` navigates to `/admin/launch-readiness`.
- `Review blockers` navigates to `/admin/launch-readiness/:blockerCode` when blocker context is available.
- `Open station detail` navigates to `/admin/stations/:stationId`.
- `Close` returns to parent.

State preservation:
- Parent row should update to backend-saved validation.
- If launched from blocker detail, preserve blocker context.
- Do not place note or blocker text in URL.

## Analytics Events
Events:
- `station_validation_modal_opened`
- `station_validation_context_loaded`
- `station_validation_context_blocked`
- `station_validation_field_changed`
- `station_validation_blocker_previewed`
- `station_validation_payload_reviewed`
- `station_validation_confirmation_checked`
- `station_validation_submit_started`
- `station_validation_submit_succeeded`
- `station_validation_submit_failed`
- `station_validation_modal_closed`

Shared properties:
- `sourceScreen`
- `stationId`
- `currentValidationStatus`
- `nextDryRunDays`
- `nextControlledPilotDays`
- `scanFallbackSuccessRateBand`
- `manualBlockerCount`
- `likelyBlockerCount`
- `backendValidationStatus`
- `backendGoLiveEligible`
- `outcome`
- `errorCode`
- `durationMs`

Do not capture:
- Note text.
- Manual blocker text.
- Staff personal data.
- Customer data.
- Auth token.
- Idempotency key.

Outcome values:
- `saved_ready`
- `saved_blocked`
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
type StationValidationModalProps = {
  isOpen: boolean;
  stationId: string;
  sourceScreen:
    | "AdminStationValidation"
    | "AdminStationDetail"
    | "AdminStations"
    | "AdminLaunchReadiness"
    | "AdminLaunchReadinessDetail"
    | "AdminIssueQueue"
    | "AdminAuditEvents";
  initialStation?: AdminStationRecord;
  launchContext?: StationLaunchReadinessContext;
  onClose: () => void;
  onSaved?: (result: StationValidationResult) => void;
  onRouteToStationDetail?: (stationId: string) => void;
  onRouteToLaunchReadiness?: (stationId: string) => void;
};
```

Suggested internal form:
```ts
type StationValidationForm = {
  dryRunBusinessDaysCompleted: number;
  controlledPilotBusinessDaysCompleted: number;
  checklist: {
    activeOperatorsCanSignIn: boolean;
    intakeDispatchReceiptAudited: boolean;
    scanOrManualFallbackTested: boolean;
    noUnresolvedP1Incidents: boolean;
    escalationAndRefundHandoffTested: boolean;
    openingHoursStorageAndHandoffConfirmed: boolean;
  };
  scanFallbackSuccessRatePercent: number;
  manualBlockers: string[];
  startedAt?: string;
  completedAt?: string;
  note: string;
};
```

API hook:
- Use `useAdminStationsQuery` for context fallback.
- Use `useAdminUpdateStationValidationMutation` for submit.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness`.

Do not:
- Build untyped fetch in component body.
- Submit derived fields.
- Store blocker text in analytics.
- Create frontend-only readiness enums.

## Test Requirements
Unit tests:
- Renders read-only state for role without `override_queue_state`.
- Renders station-missing state when station ID not found.
- Initializes form from current validation.
- Disables review when no values changed.
- Validates dry-run days range.
- Validates controlled pilot-volume days range.
- Validates scan fallback success range.
- Validates manual blocker length.
- Validates manual blocker count.
- Validates note length.
- Validates completed timestamp after started timestamp.
- Shows likely blocker when dry-run days below 2.
- Shows likely blocker when pilot-volume days below 3.
- Shows likely blocker when checklist item is false.
- Shows P1 blocked warning when unresolved P1 field is false.
- Shows likely blocker when scan success below 95.
- Does not include derived status in payload.
- Does not include go-live eligibility in payload.
- Does not call station status mutation.

Integration tests:
- Opens from station validation owner screen.
- Opens from station detail with validation context.
- Opens from launch-readiness blocker and shows blocker context.
- Submits `admin_update_station_validation` with idempotency key.
- Handles backend ready response.
- Handles backend blocked response.
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
- Checklist controls have accessible names.
- Error summary links to invalid fields.
- Blocker preview changes are announced.
- Success state is announced.
- Large text keeps footer usable.

Visual regression targets:
- Ready form state.
- Read-only state.
- Dirty state.
- Blocker preview with blockers.
- Blocker preview likely ready.
- Payload review.
- Confirmation.
- Submitting.
- Backend ready success.
- Backend blocked success.
- Station missing.
- Mobile full-screen sheet.

End-to-end scenarios:
- Ops admin submits fully ready evidence and backend returns ready.
- Ops admin submits incomplete evidence and backend returns blockers.
- Ops admin adds manual blocker and backend returns blocked.
- Ops admin removes manual blockers but leaves scan success below threshold.
- Support admin sees read-only evidence.
- Network failure preserves form and retry path.

## Acceptance Criteria
Functional:
- Modal opens from every listed parent.
- Modal resolves station from parent or `admin_stations`.
- Modal blocks unauthorized submit.
- Modal allows read-only review for read-only admin roles.
- Modal edits only validation evidence fields.
- Modal submits valid `adminUpdateStationValidationRequestSchema` payload.
- Modal never sends derived status, blockers, or go-live eligibility.
- Modal never calls station status endpoint.
- Modal shows backend-saved result.
- Modal distinguishes backend ready and backend blocked responses.

UX:
- Admin can identify station quickly.
- Admin can see current evidence.
- Admin can understand required thresholds.
- Admin sees blocker preview before submit.
- Admin reviews exact payload.
- Admin confirms likely readiness impact.
- Admin can recover from failure without losing evidence.

Accessibility:
- Fully keyboard operable.
- Screen reader state changes announced.
- Visible focus throughout.
- Errors tied to fields and summary.
- Target sizes meet minimum.
- Reduced motion honored.

Security:
- Submit gated by `override_queue_state`.
- Note and blocker text excluded from analytics.
- Idempotency protects repeat submits.
- Backend authority is clear.
- Read-only roles cannot trigger hidden mutation.

## Implementation Notes For Claude Code
Build this as a shared admin modal launched from the station validation owner screen and station readiness surfaces. It should rely on `admin_stations` for context because the backend has no single station validation detail endpoint.

Keep the modal evidence-led. The frontend can preview likely blockers, but only the backend response can be treated as final. Do not let the implementation set `status`, `blockers`, or `goLiveEligible` in the request.

Keep this separate from the station status override modal. Station status owns operating and service availability. Station validation owns readiness evidence and backend-derived launch eligibility.

The final implementation must feel like a launch readiness evidence cockpit:
- Clear station identity.
- Clear evidence sections.
- Clear thresholds.
- Clear blocker preview.
- Clear payload.
- Clear backend-derived result.

## Build Checklist
- Create shared modal component under admin UI package.
- Add typed props and station context adapter.
- Add `admin_stations` context fallback.
- Add role and capability gate.
- Add station identity ledger.
- Add current validation summary.
- Add dry-run day input.
- Add controlled pilot-volume day input.
- Add checklist rows.
- Add scan fallback success input.
- Add manual blocker editor.
- Add optional dates.
- Add optional note.
- Add derived blocker preview.
- Add payload review.
- Add confirmation acknowledgements.
- Add idempotent submit for `admin_update_station_validation`.
- Add ready and blocked result views.
- Add read-only, missing station, invalid, rate-limit, network, forbidden, and session states.
- Add analytics with blocker and note redaction.
- Add cache invalidation.
- Add keyboard and focus handling.
- Add unit, integration, accessibility, and visual tests.

## Final Implementation Directive
`StationValidationModal` must be the controlled station readiness evidence modal. It must submit only `admin_update_station_validation`, send only the schema-supported evidence fields, require `override_queue_state`, and never update station status, launch approval, delivery state, issues, users, pricing, or notifications. Build it as a precise, auditable, keyboard-first readiness control that makes backend-derived blockers visible before and after submission.
