# Admin Station Validation Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminStationValidation` |
| Route | `/admin/stations/:stationId/validation` |
| Test id | `screen-admin-station-validation` |
| Surface | Admin web console |
| Backend coverage | `admin_stations`, optional `admin_launch_readiness`, `admin_update_station_validation` |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required submit role | `ops_admin` or `super_admin` through `override_queue_state` capability |
| Required states | `loading`, `ready`, `read_only`, `invalid_station`, `station_not_found`, `launch_context_unavailable`, `dirty`, `client_invalid`, `review`, `submitting`, `saved_ready`, `saved_blocked`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminStationDetail`, `AdminStations`, protected admin shell |
| Related screens | `AdminStationDetail`, `AdminStationStatusOverride`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminIssueQueue`, `AdminAuditEvents` |

## Purpose
`AdminStationValidation` is the high-control station readiness form. It lets authorized operations admins record the evidence required before a launch station can be considered go-live eligible.

The screen should answer:
- `Which station am I validating?`
- `What evidence is currently recorded?`
- `Which required checks remain incomplete?`
- `Will this submission likely produce a ready or blocked state?`
- `What exact values will be sent to the backend?`
- `What did the backend decide after submission?`

The screen must be serious because one careless validation update can make a station appear launch-ready before operators, custody flows, fallback handling, and escalation handoffs are proven.

## Backend Reality
The validation mutation is concrete:
```http
POST /v1/admin/stations/:id/validation
```

Operation:
```text
admin_update_station_validation
```

Capability:
```text
override_queue_state
```

The screen must preload station context from:
```http
GET /v1/admin/stations
```

Operation:
```text
admin_stations
```

Optional launch context can come from:
```http
GET /v1/admin/launch-readiness
```

Operation:
```text
admin_launch_readiness
```

Important backend facts:
- There is no `GET /v1/admin/stations/:id/validation` endpoint.
- The route station must be resolved from `admin_stations`.
- The server derives `validation.status`.
- The server derives `validation.goLiveEligible`.
- The server derives `validation.blockers`.
- The client must not submit a desired status.
- The client must not submit a desired go-live decision.
- The mutation saves station validation and station `updatedAt`.
- Mutating POST requests are idempotent with `Idempotency-Key`.

## Request Contract
Submit:
```http
POST /v1/admin/stations/:id/validation
```

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

Response body:
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

Rules:
- Send only fields in the request schema.
- Omit `manualBlockers` when empty unless the client library preserves empty arrays intentionally.
- Omit optional timestamps and note when not set.
- Preserve numeric bounds exactly.
- Use an idempotency key per submit attempt.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness` query data after success.

## Primary Users
Primary:
- `ops_admin` recording station validation evidence before pilot or launch expansion.
- `super_admin` reviewing and submitting high-impact readiness evidence.

Secondary:
- `support_admin` reviewing the evidence in read-only mode when linked from issue triage.
- `finance_admin` reviewing readiness evidence in read-only mode before finance gates.
- QA validating validation rules.
- Security reviewers checking mutation guardrails.
- Claude Code implementing the admin console later.

## User Goal
Authorized admins use this screen to:
- Confirm the station identity.
- Review current validation evidence.
- Update dry-run day evidence.
- Update controlled pilot-volume day evidence.
- Update six mandatory checklist booleans.
- Record scan or manual-fallback success rate.
- Add explicit manual blockers.
- Add validation dates.
- Add an operational note.
- Review the exact submission.
- Submit once with a clear idempotent request.
- See the backend decision.

Read-only admins use this screen to:
- See why they cannot submit.
- Review evidence safely.
- Route to the station detail or issue queue.

## Scope
In scope:
- Route station validation.
- Station lookup from `admin_stations`.
- Current validation evidence display.
- Form prefilled from current station validation.
- Numeric bounded inputs.
- Boolean checklist inputs.
- Manual blocker list editor.
- Optional started and completed datetime fields.
- Optional note field.
- Client-side schema guardrails.
- Review-before-submit step.
- Idempotent submit.
- Success result from backend response.
- Role-safe read-only behavior.
- Optional launch-readiness warning for station P1 contradictions.
- Cache invalidation guidance.
- Analytics sanitizer.
- Accessibility and responsive rules.

Out of scope:
- Station status override.
- Service availability override.
- Issue resolution.
- P1 issue closure.
- Payment reconciliation.
- Receiver SMS retry.
- Staff roster.
- Operator sign-in logs.
- Raw audit event stream.
- Complete station queue details.
- Offline submission.

## Design Thesis
The screen should feel like a launch readiness cockpit form: firm, evidence-led, hard to rush, and impossible to confuse with a casual settings page.

Visual direction:
- Use a centered evidence form with a persistent right-side decision panel on desktop.
- Use a clear step rail: `Evidence`, `Review`, `Backend result`.
- Use strong section headers with short operational guidance.
- Use bounded progress inputs for day counts.
- Use checklist rows with descriptions and status.
- Use a blocker builder for manual blockers.
- Use red only for true blocking risk, amber for incomplete evidence, green only after backend success.
- Use tabular numerals for counts and percentages.

Restraint rule:
- No celebratory graphics, no launch confetti, no local readiness score, no instant green state before the backend response.

## Research Inputs
External research used for this screen:
- [USWDS form guidance](https://designsystem.digital.gov/components/form/): supports accessible labels, hints, required fields, and clear form structure.
- [USWDS validation guidance](https://designsystem.digital.gov/components/validation/): supports clear validation feedback and cautions around complex validation UI.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports a review step before high-impact submission.
- [IBM Carbon checkbox](https://carbondesignsystem.com/components/checkbox/usage/): supports clear checkbox grouping and label behavior.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports specific field-level error messages.
- [WCAG error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html): supports actionable correction guidance.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports non-disruptive submit, save, and validation result announcements.

How the research affects the screen:
- Form guidance shapes explicit labels, hints, and grouped inputs.
- Review-pattern guidance shapes a separate confirmation step before mutation.
- Checkbox guidance shapes checklist rows as explicit decisions rather than a dense matrix.
- WCAG guidance shapes field errors, submit result messages, and focus routing.

## Station Resolution
Route:
```text
/admin/stations/:stationId/validation
```

Valid station IDs:
- `ST-ACC-01`
- `ST-KMS-01`
- `ST-TML-01`

Resolution flow:
1. Validate route `stationId` against shared station IDs.
2. If invalid, render `invalid_station`.
3. Fetch `admin_stations`.
4. Resolve station by exact `stationId`.
5. If not returned, render `station_not_found`.
6. Prefill form from `station.validation`.
7. Fetch optional launch readiness context.

Rules:
- Do not call mutation endpoint during load.
- Do not call optional launch readiness for invalid station IDs.
- Do not let stale optional launch context block station form rendering.

## Permissions
Read-only access:
- `ops_admin`
- `support_admin`
- `finance_admin`
- `super_admin`

Submit access:
- `ops_admin`
- `super_admin`

Submit denied:
- `support_admin`
- `finance_admin`

Read-only mode must:
- Show current evidence.
- Hide submit controls.
- Show why submission is unavailable.
- Keep route actions to allowed screens.

Read-only mode must not:
- Render disabled form fields as if the user can eventually submit.
- Expose hidden mutation payloads.
- Allow note editing.
- Generate idempotency keys.

## Validation Evidence Model
### Dry-Run Business Days
Field:
```text
dryRunBusinessDaysCompleted
```

Type:
- Integer.

Bounds:
- Minimum `0`.
- Maximum `2`.

Eligibility threshold:
- `2`.

UI:
- Segmented control or bounded numeric stepper.
- Labels: `0 of 2`, `1 of 2`, `2 of 2`.
- Hint: `Record supervised dry-run business days completed for this station.`

Rules:
- Do not allow values outside `0..2`.
- Do not allow decimals.
- Do not auto-increase based on dates.

### Controlled Pilot-Volume Business Days
Field:
```text
controlledPilotBusinessDaysCompleted
```

Type:
- Integer.

Bounds:
- Minimum `0`.
- Maximum `3`.

Eligibility threshold:
- `3`.

UI:
- Segmented control or bounded numeric stepper.
- Labels: `0 of 3`, `1 of 3`, `2 of 3`, `3 of 3`.
- Hint: `Record controlled pilot-volume business days completed for this station.`

Rules:
- Do not allow values outside `0..3`.
- Do not allow decimals.
- Do not auto-increase based on dates.

### Checklist
Field:
```text
checklist
```

Booleans:
- `activeOperatorsCanSignIn`
- `intakeDispatchReceiptAudited`
- `scanOrManualFallbackTested`
- `noUnresolvedP1Incidents`
- `escalationAndRefundHandoffTested`
- `openingHoursStorageAndHandoffConfirmed`

UI:
- Six checklist rows.
- Each row has checkbox, label, supporting text, and current status.
- Each checkbox must be explicit.

Checklist labels:
| Key | Label | Meaning |
| --- | --- | --- |
| `activeOperatorsCanSignIn` | Active operators can sign in | Operators assigned to this station can access required flows |
| `intakeDispatchReceiptAudited` | Intake, dispatch, and receipt have audit logs | The station has audit evidence for custody operations |
| `scanOrManualFallbackTested` | Scan or manual fallback is tested | Staff can proceed safely when scanning is unavailable |
| `noUnresolvedP1Incidents` | No unresolved P1 incidents | Operations has confirmed no active P1 incident for this station |
| `escalationAndRefundHandoffTested` | Escalation and refund handoff is tested | Support and finance handoff path has been validated |
| `openingHoursStorageAndHandoffConfirmed` | Opening hours, storage, and handoff ownership are confirmed | Physical operation rules are clear |

Rules:
- Do not submit missing checkbox keys.
- Do not merge checklist rows.
- Do not hide incomplete checklist rows.
- If launch readiness reports unresolved P1 for this station, block a submission that sets `noUnresolvedP1Incidents=true` until the admin refreshes or resolves the issue context.

### Scan Or Manual-Fallback Success
Field:
```text
scanFallbackSuccessRatePercent
```

Type:
- Number.

Bounds:
- Minimum `0`.
- Maximum `100`.

Eligibility threshold:
- `95`.

UI:
- Numeric percentage input.
- Optional slider only if it remains precise and keyboard-safe.
- Threshold marker at `95%`.

Rules:
- Permit decimal input only if the shared client schema supports number decimals.
- Clamp nothing silently.
- Show field error for values below `0` or above `100`.
- Show eligibility warning below `95`.

### Manual Blockers
Field:
```text
manualBlockers
```

Type:
- Array of strings.

Bounds:
- Maximum `10` items.
- Each item minimum `3` characters.
- Each item maximum `160` characters.

UI:
- Add blocker input.
- Existing blocker chips or rows with remove control.
- Character count per blocker.
- Remaining blocker count.

Rules:
- Trim whitespace.
- Prevent empty blockers.
- Prevent duplicate blocker text after trimming.
- Do not include personal data.
- Do not submit if any blocker is invalid.
- Manual blockers intentionally keep backend status blocked.

### Started At
Field:
```text
startedAt
```

Type:
- ISO datetime.

UI:
- Date and time input.
- Timezone helper.

Rules:
- Optional.
- Must be valid datetime when present.
- Must not be after `completedAt` when both are present.
- Do not infer from dry-run day count.

### Completed At
Field:
```text
completedAt
```

Type:
- ISO datetime.

UI:
- Date and time input.
- Timezone helper.

Rules:
- Optional.
- Must be valid datetime when present.
- Must not be before `startedAt` when both are present.
- If provided while blockers remain, show warning that completion time does not force readiness.

### Note
Field:
```text
note
```

Bounds:
- Minimum `3` characters when present.
- Maximum `240` characters.

UI:
- Multiline text area.
- Character count.
- Privacy warning.

Rules:
- Optional.
- Do not allow personal data.
- Do not send note text to analytics.
- Do not use note text to derive readiness.

## Form Architecture
### Step 1: Evidence
Sections:
1. Station identity lockup.
2. Current validation summary.
3. Day-count evidence.
4. Checklist evidence.
5. Scan or manual-fallback evidence.
6. Manual blockers.
7. Dates and note.

Primary action:
- `Review validation update`

Rules:
- The primary action only opens review if client validation passes.
- Field errors keep focus near the first invalid field.
- The form must show unsaved changes state.

### Step 2: Review
Purpose:
- Let the admin review the exact payload and risk before submission.

Sections:
- Station identity.
- Changed values.
- Complete payload summary.
- Client-predicted blockers.
- Optional launch context warning.
- Idempotency note.

Primary action:
- `Submit validation update`

Secondary action:
- `Back to evidence`

Rules:
- Do not claim the station will be ready before backend response.
- Label local projection as `Expected based on current form values`.
- If form changes after entering review, invalidate review and return to evidence.

### Step 3: Backend Result
Purpose:
- Show the backend decision after submit.

Ready result:
- Title: `Backend marked station validation ready`
- Show `goLiveEligible=true`.
- Show empty blockers.
- Show updated time.
- Actions: `Back to station detail`, `Open launch readiness`.

Blocked result:
- Title: `Backend kept station validation blocked`
- Show `goLiveEligible=false`.
- Show backend blockers.
- Show updated time.
- Actions: `Continue editing`, `Back to station detail`, `Open issue queue` when relevant.

Rules:
- Use backend response, not client projection.
- Do not auto-navigate after success.
- Invalidate relevant caches.

## Layout
### Desktop
Viewport:
- `min-width: 1024px`

Layout:
- Protected admin shell.
- Page width max `1440px`.
- Header spans full width.
- Left column form width about `minmax(0, 1fr)`.
- Right decision panel width about `380px`.
- Decision panel sticky below shell header.
- Review step uses same structure but replaces form controls with summary rows.

### Tablet
Viewport:
- `768px` to `1023px`

Layout:
- Single-column form.
- Decision panel becomes top summary panel below header.
- Checklist rows remain full width.
- Review summary uses compact grouped sections.

### Mobile
Viewport:
- `<768px`

Layout:
- Single-column flow.
- Step rail becomes compact top progress text.
- Sticky bottom primary action.
- Checklist rows stack with large touch targets.
- Manual blocker list uses vertical rows.
- Review step uses cards.

Mobile rules:
- No horizontal scrolling.
- Do not hide field errors in tooltips.
- Keep submit button out of view until review step.

## Components
### `AdminStationValidationPage`
Responsibilities:
- Validate route station ID.
- Fetch `admin_stations`.
- Resolve station.
- Fetch optional launch readiness.
- Gate submit controls by capability.
- Initialize form from current station validation.
- Manage evidence, review, submit, and result states.
- Submit mutation with idempotency key.
- Invalidate caches after success.

Test id:
```text
screen-admin-station-validation
```

### `StationValidationHeader`
Content:
- Station name.
- Station ID.
- City.
- Current validation status.
- Current go-live eligibility.
- Last validation update.
- Breadcrumb back to station detail.

Rules:
- Header is read-only.
- Station identity cannot be edited here.

### `ValidationCurrentSummary`
Purpose:
- Show current backend evidence before edits.

Fields:
- Current status.
- Current go-live eligibility.
- Current dry-run days.
- Current controlled pilot-volume days.
- Current success rate.
- Current blocker count.
- Current validation updated time.

Rules:
- Mark as `Current backend record`.
- Do not mix current values with dirty form values.

### `ValidationDayCountFields`
Fields:
- `dryRunBusinessDaysCompleted`
- `controlledPilotBusinessDaysCompleted`

Rules:
- Use bounded controls.
- Provide exact min and max.
- Announce errors when out of range.
- Keep labels visible.

### `ValidationChecklistGroup`
Fields:
- All six checklist booleans.

Rules:
- Use a fieldset with legend.
- Each row has label and supporting text.
- Each checkbox has a unique accessible name.
- The `noUnresolvedP1Incidents` row shows station P1 warning when launch context reports unresolved station P1.

### `ScanFallbackSuccessField`
Fields:
- `scanFallbackSuccessRatePercent`

Rules:
- Show threshold.
- Show exact value.
- Do not use color alone.
- Show warning below `95%`.

### `ManualBlockerEditor`
Fields:
- `manualBlockers`

Rules:
- Add one blocker at a time.
- Enforce maximum `10`.
- Enforce character bounds.
- Show remove control per blocker.
- Confirm removing a blocker only if it was loaded from backend and form has other changes.

### `ValidationDatesAndNote`
Fields:
- `startedAt`
- `completedAt`
- `note`

Rules:
- Dates are optional.
- Notes are optional.
- Show privacy and audit hint.
- Field errors must be specific.

### `ValidationDecisionPanel`
Purpose:
- Keep submission impact visible.

Content:
- Local projection label.
- Missing evidence list.
- Manual blocker count.
- Launch context warning.
- Submit permission status.
- Link to station detail.

Rules:
- Use `Expected based on current form values`, never `Backend will`.
- If user lacks submit capability, show read-only reason.
- If form is dirty, show unsaved changes.

### `ValidationReviewStep`
Purpose:
- Confirm exact payload before POST.

Content:
- Station identity.
- Changed fields.
- Full request summary.
- Manual blockers.
- Note presence, not note body in analytics.
- Warning for active station P1 context.
- Idempotency behavior copy.

Rules:
- Submit action only appears here.
- Focus moves to review heading when opened.
- Back action preserves form edits.

### `ValidationResultPanel`
Purpose:
- Show backend response.

Content:
- Backend status.
- `goLiveEligible`.
- Backend blockers.
- Updated time.
- Follow-up actions.

Rules:
- If saved ready, show green result after backend response only.
- If saved blocked, show blocker list and route actions.
- Do not hide backend blockers even if they match local projection.

## Client Validation Rules
Client validation must enforce:
- Route station ID is valid.
- Dry-run days are integer `0..2`.
- Controlled pilot-volume days are integer `0..3`.
- Checklist contains all six booleans.
- Success rate is number `0..100`.
- Manual blockers max `10`.
- Manual blockers are `3..160` characters after trimming.
- Started datetime is valid if present.
- Completed datetime is valid if present.
- Started datetime is not after completed datetime.
- Note is `3..240` characters if present.
- User has submit capability before submit.

Client validation must not:
- Derive backend status as final truth.
- Derive final go-live eligibility as final truth.
- Override backend blockers.
- Submit unsupported fields.
- Auto-clear manual blockers.

## Local Projection
The screen may show a local projection to reduce surprises.

Projection rules:
- It is labeled as expected outcome.
- It uses the same visible thresholds as backend rules.
- It treats any manual blocker as blocking.
- It treats incomplete checklist values as blocking.
- It treats success rate below `95` as blocking.
- It treats dry-run below `2` as blocking.
- It treats controlled pilot below `3` as blocking.
- It does not include external system blockers unless optional launch readiness is loaded.

Projection labels:
- `Expected ready if submitted`
- `Expected blocked if submitted`
- `External launch context may still block station`

Rules:
- Backend result supersedes projection after submit.

## Launch Context Guardrails
If `admin_launch_readiness` is available:
- Find station row by `stationId`.
- Read `unresolvedP1IssueCount`.
- Read station-specific blockers.
- Show warning for active station blockers.

P1 contradiction rule:
- If unresolved P1 count is greater than `0`, prevent submission with `noUnresolvedP1Incidents=true`.
- Message: `Launch readiness currently reports unresolved P1 issues for this station. Clear or refresh that context before confirming this checklist item.`

If launch context is unavailable:
- Do not block submission on missing optional context.
- Show `Launch context unavailable; backend validation will still evaluate submitted fields.`

## Submission Flow
Before submit:
1. Validate client schema.
2. Check submit capability.
3. Check route station still matches resolved station.
4. Build request payload.
5. Generate idempotency key.
6. Enter review step.

On submit:
1. Disable submit button.
2. Send `POST /v1/admin/stations/:id/validation`.
3. Include `Idempotency-Key`.
4. Keep form visible in submitting state.
5. Parse backend response.
6. Invalidate station and launch readiness caches.
7. Render result panel.

On retry:
- Reuse idempotency key only for retry of the same payload after transient network failure.
- Generate a new idempotency key after payload changes.

## Unsaved Changes
Dirty state starts when:
- Any field differs from initial station validation.
- A manual blocker is added or removed.
- Optional date or note changes.

Dirty state clears when:
- Backend save succeeds and response becomes the new baseline.
- User resets form to current backend values.

Navigation guard:
- Warn before leaving with unsaved changes.
- Do not warn after successful save.
- Do not warn read-only users.

## Error States
### Invalid Station
Title:
```text
Station reference is not recognized
```

Rules:
- Do not fetch optional launch context.
- Offer `Back to stations`.

### Station Not Found
Title:
```text
Station not returned
```

Rules:
- Offer `Refresh`.
- Offer `Back to stations`.

### Not Authorized
Title:
```text
You cannot update station validation
```

Rules:
- If admin can read station data, show read-only evidence.
- If admin cannot read admin station data, show admin auth error.

### API Error
Rules:
- Show request-safe error.
- Keep unsaved form values when possible.
- Offer retry.
- Do not print raw server payload.

### Validation Error From Server
Rules:
- Map field errors to fields where possible.
- Show global error for request-level failures.
- Preserve user edits.
- Do not guess a successful save.

## Copy System
Tone:
- Precise.
- Operational.
- Evidence-first.
- No hype.

Primary labels:
- `Review validation update`
- `Submit validation update`
- `Back to evidence`
- `Reset to current backend record`
- `Back to station detail`

Warnings:
- `This form records readiness evidence. The backend decides final station eligibility.`
- `Manual blockers keep the station blocked until removed.`
- `Launch readiness currently reports unresolved P1 issues for this station.`

Success:
- `Backend marked station validation ready.`
- `Backend kept station validation blocked.`

Avoid:
- `Launch approved`
- `Station launched`
- `Guaranteed ready`
- `All clear` before backend response
- Casual phrases

## Analytics
Events:
- `admin_station_validation_viewed`
- `admin_station_validation_dirty`
- `admin_station_validation_review_opened`
- `admin_station_validation_submitted`
- `admin_station_validation_saved_ready`
- `admin_station_validation_saved_blocked`
- `admin_station_validation_client_error`
- `admin_station_validation_server_error`
- `admin_station_validation_read_only`
- `admin_station_validation_reset`

Allowed properties:
- `station_id`
- `station_city`
- `role`
- `current_validation_status`
- `current_go_live_eligible`
- `dry_run_days`
- `controlled_pilot_days`
- `checklist_complete_count`
- `manual_blocker_count`
- `success_rate_bucket`
- `launch_context_available`
- `has_station_p1_context`
- `result_status`
- `result_go_live_eligible`
- `result_blocker_count`

Forbidden properties:
- Note text.
- Manual blocker text.
- Backend blocker text.
- Receiver data.
- Sender data.
- Auth tokens.
- Raw error payloads.

Success rate buckets:
- `0`
- `1-49`
- `50-94`
- `95-100`

## Accessibility
Form structure:
- Use one `h1`.
- Use fieldsets for day counts and checklist.
- Every input has visible label.
- Every error references the field.
- Error summary appears above the form.
- Error summary links move focus to invalid fields.

Status messages:
- Submitting uses polite live region.
- Save result uses polite live region.
- Blocking server error uses assertive live region.

Keyboard:
- All controls reachable in order.
- Stepper buttons are keyboard accessible.
- Manual blocker remove controls have specific names.
- Review step focus starts at heading.

Color:
- No status uses color alone.
- Checklist status includes text.
- Threshold warning includes text.

Motion:
- No shaking fields.
- No looping progress.
- Respect `prefers-reduced-motion`.

## Privacy And Security
Security:
- Submit requires authenticated admin session.
- Submit requires `override_queue_state`.
- Use idempotency key.
- Do not expose token details.
- Do not store mutation payload in URL.

Privacy:
- Do not request personal data.
- Do not allow personal data in note or blockers without warning.
- Do not send note or blocker text to analytics.
- Do not show receiver or sender fields.

Audit posture:
- The screen should make high-impact change visible before submit.
- The final backend response should remain visible after save.
- Route to audit events when audit screen supports station object filters.

## Performance
Targets:
- Initial station evidence visible within `1500ms` on normal admin network.
- Form input latency below `50ms`.
- Review step opens instantly from current client state.
- Submit result displays within backend SLA.

Rules:
- Primary station load must not wait for optional launch context.
- Do not poll.
- Do not debounce checkboxes.
- Avoid re-rendering all checklist rows on every note keystroke.
- Keep manual blocker validation local.

## Responsive Behavior
Desktop:
- Form and decision panel side by side.
- Sticky decision panel.
- Review summary in two columns.

Tablet:
- Decision panel above form.
- Checklist rows full width.

Mobile:
- Single-column.
- Sticky bottom primary action.
- Review step as stacked summary rows.
- Large touch targets.
- Field errors directly below controls.

Mobile rules:
- Do not hide warnings behind hover.
- Do not require horizontal scrolling.
- Keep review action separated from evidence editing.

## Testing Requirements
Unit tests:
- Route station ID validation.
- Station resolution from `admin_stations`.
- Form initialization from existing validation.
- Dirty-state derivation.
- Dry-run bounds.
- Controlled pilot bounds.
- Checklist required keys.
- Success rate bounds.
- Manual blocker bounds and duplicates.
- Date ordering.
- Note bounds.
- Local projection ready.
- Local projection blocked.
- P1 contradiction guard.
- Role submit visibility.
- Payload builder.
- Analytics sanitizer.

Integration tests:
- Loads station evidence.
- Renders read-only mode for `support_admin`.
- Renders read-only mode for `finance_admin`.
- Enables submit flow for `ops_admin`.
- Enables submit flow for `super_admin`.
- Opens review step after valid evidence.
- Blocks review on client errors.
- Submits `admin_update_station_validation`.
- Sends idempotency key.
- Shows saved ready result.
- Shows saved blocked result.
- Preserves edits on server error.
- Invalidates station and launch readiness data after success.
- Handles launch context unavailable.
- Handles invalid station.
- Handles station not found.

Accessibility tests:
- Field labels exist.
- Error summary links to fields.
- Checklist fieldset has legend.
- Status messages are announced.
- Review step focus moves correctly.
- Manual blocker controls have specific names.
- Mobile sticky action follows keyboard order.

Visual regression states:
- Empty validation evidence.
- Partial validation evidence.
- Ready projection.
- Blocked projection.
- Read-only mode.
- Review step.
- Submitting state.
- Saved ready result.
- Saved blocked result.
- Client invalid state.
- Server error state.
- Mobile form.
- Mobile review.

## Implementation Checklist
- Create route `/admin/stations/:stationId/validation`.
- Use protected admin shell.
- Validate route station ID.
- Fetch `admin_stations`.
- Resolve station.
- Prefill form from `station.validation`.
- Optionally fetch `admin_launch_readiness`.
- Build pure payload builder.
- Build pure client validator.
- Build pure local projection helper.
- Build dirty-state helper.
- Build role submit helper.
- Build evidence form.
- Build review step.
- Build backend result panel.
- Submit `admin_update_station_validation` with idempotency key.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness` after success.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build
Do not build:
- A desired status field.
- A desired go-live field.
- Inline station status override.
- Service availability controls.
- Issue resolution controls.
- Payment controls.
- Staff roster.
- Complete audit stream.
- Public station copy.
- Auto-approval after client projection.
- Hidden submit for read-only roles.
- Analytics containing notes or blocker text.
- URL query payloads.
- Background polling.

## Acceptance Criteria
The screen is complete when:
- `/admin/stations/:stationId/validation` renders with test id `screen-admin-station-validation`.
- It resolves station context from `admin_stations`.
- It preloads existing validation evidence.
- It gates submit by `override_queue_state`.
- It supports read-only evidence for non-submit admin roles.
- It validates every request field before review.
- It has a review-before-submit step.
- It submits only `admin_update_station_validation`.
- It includes an idempotency key.
- It displays backend `status`, `goLiveEligible`, `blockers`, and `updatedAt` after save.
- It invalidates station and launch readiness data after success.
- It protects note and blocker text from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief
Build `AdminStationValidation` as a high-control readiness evidence form for `/admin/stations/:stationId/validation`. Load the station from `admin_stations`, prefill the current validation record, gate submission to roles with `override_queue_state`, force review before submit, send only the `admin_update_station_validation` payload with an idempotency key, and treat the backend response as the only final readiness decision.
