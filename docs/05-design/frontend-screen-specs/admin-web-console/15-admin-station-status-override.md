# Admin Station Status Override Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminStationStatusOverride` |
| Route | `/admin/stations/:stationId/status` |
| Test id | `screen-admin-station-status-override` |
| Surface | Admin web console |
| Backend coverage | `admin_stations`, optional `admin_launch_readiness`, `admin_update_station_status` |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required submit role | `ops_admin` or `super_admin` through `override_queue_state` capability |
| Required states | `loading`, `ready`, `read_only`, `invalid_station`, `station_not_found`, `launch_context_unavailable`, `dirty`, `client_invalid`, `confirm`, `submitting`, `saved`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminStationDetail`, `AdminStations`, protected admin shell |
| Related screens | `AdminStationDetail`, `AdminStationValidation`, `AdminStationCapacity`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminAuditEvents` |

## Purpose
`AdminStationStatusOverride` is the high-impact station operations override flow. It lets authorized operations admins pause or activate a station, restrict or open intake, and enable or disable station service availability.

The screen should answer:
- `Which station am I changing?`
- `What is the current operational state?`
- `What exactly will change?`
- `How could this affect intake, dispatch, doorstep service, and launch readiness?`
- `Who is allowed to submit this override?`
- `What did the backend save?`

This screen is not a casual station settings page. It is a controlled operational override because it can stop intake, hide services, change launch readiness, and affect packages already moving through the network.

## Backend Reality
The status mutation is concrete:
```http
POST /v1/admin/stations/:id/status
```

Operation:
```text
admin_update_station_status
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
- There is no standalone station status detail endpoint.
- The route station must be resolved from `admin_stations`.
- The mutation updates `operatingStatus`, `intakeStatus`, `serviceAvailability`, optional `note`, and station `updatedAt`.
- The mutation does not update validation evidence.
- The mutation does not close issues.
- The mutation does not move deliveries.
- The mutation does not approve launch.
- Mutating POST requests are idempotent with `Idempotency-Key`.

## Request Contract
Submit:
```http
POST /v1/admin/stations/:id/status
```

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

Response body:
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

Rules:
- Send only fields in the request schema.
- Submit all service availability booleans together.
- Omit `note` when not set.
- Preserve exact enum values.
- Use an idempotency key per submit attempt.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness` query data after success.

## Primary Users
Primary:
- `ops_admin` pausing a station, restricting intake, or limiting services due to operational risk.
- `super_admin` making network-level station availability changes.

Secondary:
- `support_admin` reviewing station state in read-only mode during issue triage.
- `finance_admin` reviewing station state in read-only mode during finance or refund analysis.
- QA validating role gating and impact warnings.
- Security reviewers validating mutation safety.
- Claude Code implementing the admin console later.

## User Goal
Authorized admins use this screen to:
- Confirm the station identity.
- Review current operating and intake status.
- Review current service availability.
- Change operating status.
- Change intake status.
- Change standard, express, and doorstep availability.
- Add or clear an operational note.
- Review impact before submit.
- Submit once with idempotency protection.
- See exactly what the backend saved.

Read-only admins use this screen to:
- Understand current station status.
- Understand why they cannot submit.
- Navigate back to station detail, issue triage, launch readiness, or finance context.

## Scope
In scope:
- Route station validation.
- Station lookup from `admin_stations`.
- Current status display.
- Status form prefilled from current station.
- Operating status choice.
- Intake status choice.
- Standard service toggle.
- Express service toggle.
- Doorstep service toggle.
- Optional note field.
- Impact preview.
- Review-before-submit confirmation.
- Idempotent submit.
- Backend result display.
- Role-safe read-only mode.
- Optional launch readiness warning.
- Cache invalidation guidance.
- Accessibility, analytics, and responsive rules.

Out of scope:
- Validation evidence updates.
- Dry-run day counts.
- Controlled pilot-volume day counts.
- Checklist evidence.
- Scan fallback success rate.
- Issue resolution.
- Delivery reassignment.
- Capacity forecast editing.
- Public service area copy.
- Staff roster.
- Station opening hours editing.
- Automatic customer notification creation.
- Payment or refund actions.

## Design Thesis
The screen should feel like an operations circuit breaker: direct, restrained, and explicit about blast radius before saving.

Visual direction:
- Use a split layout with current state on the left and proposed state on the right.
- Use a fixed impact panel on desktop.
- Use plain enum controls instead of playful switches for critical operating state.
- Use service toggles with clear affected-service labels.
- Use a confirmation step that shows before and after values.
- Use red for paused or disabled states, amber for restricted intake, green for active and open state, and gray for unchanged values.
- Use a strong warning band when the change reduces service availability.

Restraint rule:
- No decorative station art, no optimistic green state before backend response, no one-click save, and no hidden impact summary.

## Research Inputs
External research used for this screen:
- [IBM Carbon modal usage](https://carbondesignsystem.com/components/modal/usage/): supports focused confirmation for high-impact changes.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports accessible modal and confirmation behavior.
- [VA Design System destructive buttons](https://design.va.gov/components/button/#destructive-action): supports careful styling for actions that can cause loss, removal, or high-impact change.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports reviewing before sending critical changes.
- [WCAG error prevention for legal, financial, and data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports confirmation, review, and reversibility principles for serious submissions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible save and error announcements.

How the research affects the screen:
- Modal and check-answer guidance shapes a dedicated confirmation step.
- Destructive-action guidance shapes stronger warnings when pausing stations or disabling services.
- WCAG error-prevention guidance shapes review, correction, and result visibility.
- Status-message guidance shapes submit and save feedback without unexpected focus loss.

## Station Resolution
Route:
```text
/admin/stations/:stationId/status
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
6. Prefill form from station status fields.
7. Fetch optional launch readiness context.

Rules:
- Do not call mutation endpoint during load.
- Do not call optional launch readiness for invalid station IDs.
- Do not allow route station to be changed in the form.

## Permissions
Read access:
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
- Show current station state.
- Show proposed-state controls as static read-only values or omit controls entirely.
- Explain that status overrides require `override_queue_state`.
- Preserve navigation to allowed screens.

Read-only mode must not:
- Render hidden submit controls.
- Generate idempotency keys.
- Let users edit notes locally.
- Expose mutation payloads.

## Status Model
### Operating Status
Field:
```text
operatingStatus
```

Allowed values:
- `active`
- `paused`

Meaning:
- `active`: station can participate in operations subject to intake and service availability.
- `paused`: station is operationally stopped for admin-controlled reasons.

Rules:
- Pausing a station is high impact.
- Activating a station does not prove validation readiness.
- If validation is blocked, activating the station should still show validation warning.

### Intake Status
Field:
```text
intakeStatus
```

Allowed values:
- `open`
- `restricted`

Meaning:
- `open`: station can accept intake under current service rules.
- `restricted`: station intake is limited by operations decision.

Rules:
- Restricted intake must show amber warning.
- Opening intake does not enable services by itself.
- Opening intake while all services are disabled must show client warning.

### Service Availability
Field:
```text
serviceAvailability
```

Booleans:
- `standard`
- `express`
- `doorstep`

Rules:
- Submit all three booleans.
- At least one service should remain available if operating status is `active` and intake status is `open`; otherwise show client warning.
- If all services are disabled, the impact panel must show `No service available from this station`.
- Service availability does not update pricing rules.

### Note
Field:
```text
note
```

Bounds:
- Minimum `3` characters when present.
- Maximum `240` characters.

Rules:
- Optional.
- Can be used to explain outage, restriction, or service limitation.
- Empty note means omitted request field.
- Note text is not analytics-safe.
- Note text must not include customer personal data.

## Form Architecture
### Step 1: Proposed Status
Sections:
1. Station identity.
2. Current status summary.
3. Operating status.
4. Intake status.
5. Service availability.
6. Operational note.
7. Impact preview.

Primary action:
- `Review status override`

Rules:
- Primary action opens confirmation only after client validation.
- Field changes mark form dirty.
- Current and proposed values are visually separate.

### Step 2: Confirm Override
Purpose:
- Prevent accidental station state changes.

Content:
- Station identity.
- Current values.
- Proposed values.
- Changed fields.
- Impact warnings.
- Optional launch readiness context.
- Note presence.
- Idempotency note.

Primary action:
- `Submit status override`

Secondary action:
- `Back to edit`

Rules:
- Confirmation must show before and after values.
- The submit button appears only in confirm step.
- If proposed state reduces availability, use high-impact warning style.
- If form changes after confirmation opens, close confirmation and require review again.

### Step 3: Saved Result
Purpose:
- Show backend-saved station state.

Content:
- Backend operating status.
- Backend intake status.
- Backend service availability.
- Backend note state.
- Backend updated time.
- Follow-up routes.

Actions:
- `Back to station detail`
- `Open launch readiness`
- `Open capacity`
- `Open audit events`

Rules:
- Use backend response as final truth.
- Do not auto-navigate.
- Do not show green success if backend saved a paused or restricted state without clear label.

## Layout
### Desktop
Viewport:
- `min-width: 1024px`

Layout:
- Protected admin shell.
- Main content max width `1440px`.
- Header full width.
- Two-column edit area.
- Left form column about `minmax(0, 1fr)`.
- Right impact panel about `380px`.
- Impact panel sticky below shell header.

### Tablet
Viewport:
- `768px` to `1023px`

Layout:
- Single-column form.
- Impact panel below current summary.
- Confirmation step uses grouped rows.

### Mobile
Viewport:
- `<768px`

Layout:
- Single-column form.
- Sticky bottom primary action.
- Impact preview appears before note.
- Confirmation step uses stacked before-and-after cards.

Mobile rules:
- No horizontal scrolling.
- No hover-only warnings.
- Service toggles use large touch targets.
- Warning text stays visible above submit.

## Components
### `AdminStationStatusOverridePage`
Responsibilities:
- Validate route station ID.
- Fetch `admin_stations`.
- Resolve station.
- Fetch optional launch readiness.
- Gate submit controls by capability.
- Initialize form from current station fields.
- Manage edit, confirm, submit, and saved states.
- Submit mutation with idempotency key.
- Invalidate station and launch readiness caches after success.

Test id:
```text
screen-admin-station-status-override
```

### `StationStatusHeader`
Content:
- Station name.
- Station ID.
- City.
- Current operating status.
- Current intake status.
- Current service availability summary.
- Current updated time.
- Breadcrumb to station detail.

Rules:
- Header is read-only.
- Route station cannot be changed.

### `CurrentStationStatusSummary`
Purpose:
- Show current backend state before edits.

Fields:
- Operating status.
- Intake status.
- Standard service.
- Express service.
- Doorstep service.
- Station note state.
- Updated time.

Rules:
- Label as `Current backend status`.
- Do not mix current values with proposed values.

### `OperatingStatusControl`
Field:
- `operatingStatus`

UI:
- Radio group with `active` and `paused`.

Rules:
- Use radio controls, not a small toggle.
- Paused option includes warning text.
- Changing to paused updates impact preview immediately.

### `IntakeStatusControl`
Field:
- `intakeStatus`

UI:
- Radio group with `open` and `restricted`.

Rules:
- Restricted option includes warning text.
- Opening intake while station is paused shows warning.

### `ServiceAvailabilityControls`
Fields:
- `serviceAvailability.standard`
- `serviceAvailability.express`
- `serviceAvailability.doorstep`

UI:
- Three checkbox rows or switch rows with labels.

Rules:
- Each service control has visible label and description.
- Disabling all services shows high-impact warning.
- Doorstep service label must not imply final-mile courier availability unless backend later provides that data.

### `StationStatusNoteField`
Field:
- `note`

Rules:
- Optional text area.
- Character count.
- Privacy warning.
- If user clears an existing note, submit omits note so backend clears it.
- Do not send note text to analytics.

### `StationStatusImpactPanel`
Purpose:
- Explain operational impact before confirmation.

Content:
- Availability summary.
- Intake impact.
- Service impact.
- Launch readiness warning.
- Active queue count.
- Issue count.
- Validation state warning.

Rules:
- Impact panel is advisory, not backend authority.
- Use exact station counts from `admin_stations`.
- Use optional launch readiness only when available.
- Do not claim customer notifications will be sent.
- Do not claim active deliveries will be reassigned automatically.

### `StatusOverrideConfirmStep`
Purpose:
- Confirm exact change before mutation.

Content:
- Before-and-after rows.
- Changed field count.
- High-impact warnings.
- Note presence.
- Idempotency behavior.

Rules:
- Submit action appears only here.
- Focus moves to confirmation heading.
- Back action preserves edits.
- If no values changed, do not allow submit.

### `StatusOverrideResultPanel`
Purpose:
- Show backend-saved result.

Content:
- Saved operating status.
- Saved intake status.
- Saved service availability.
- Saved note state.
- Updated time.
- Follow-up routes.

Rules:
- Use backend response.
- Do not infer launch readiness.
- Route admins to `AdminLaunchReadiness` for launch gate context.

## Client Validation Rules
Client validation must enforce:
- Route station ID is valid.
- Operating status is `active` or `paused`.
- Intake status is `open` or `restricted`.
- Standard service is boolean.
- Express service is boolean.
- Doorstep service is boolean.
- Note is absent or `3..240` characters after trimming.
- User has submit capability before submit.
- At least one field has changed before confirmation.

Client validation should warn, but not always block:
- Active station with intake open and all services disabled.
- Paused station with intake open.
- Validation blocked station being activated.
- Launch readiness context unavailable.
- Active queue count greater than zero while pausing station.
- Issue count greater than zero while opening station.

Client validation must not:
- Submit unsupported fields.
- Update validation fields.
- Resolve launch blockers.
- Move deliveries.
- Close issues.
- Generate public availability copy.

## Impact Preview Rules
Impact states:
| Proposed state | Impact label | Severity |
| --- | --- | --- |
| `operatingStatus=paused` | `Station operations will be paused` | High |
| `intakeStatus=restricted` | `New intake will be restricted` | Medium |
| all services false | `No service will be available` | High |
| `doorstep=false` | `Doorstep service unavailable` | Medium |
| `express=false` | `Express service unavailable` | Medium |
| `standard=false` | `Standard service unavailable` | High |
| `operatingStatus=active` and `intakeStatus=open` and any service true | `Station can accept available services` | Normal |

Rules:
- Use exact proposed values.
- Show active queue and issue counts as context.
- Show validation warning if `validation.goLiveEligible=false`.
- Show station launch blockers if optional launch context is loaded.
- Do not use impact preview as saved result.

## Launch Context Guardrails
If `admin_launch_readiness` is available:
- Show station-specific blockers.
- Show whether station status currently blocks launch.
- Show network launch status.

Warnings:
- If station is paused or restricted, launch readiness may remain blocked.
- If services are unavailable, launch readiness may remain blocked.
- If validation is incomplete, status activation does not clear validation blockers.

If unavailable:
- Show `Launch readiness context is unavailable. Status changes can still be saved, but launch impact must be reviewed separately.`

Rules:
- Do not block status submit because optional launch context failed.
- Do not replace station fields with launch-readiness summary fields.

## Submission Flow
Before submit:
1. Validate client schema.
2. Confirm submit capability.
3. Confirm at least one changed field.
4. Build request payload.
5. Generate idempotency key.
6. Enter confirmation step.

On submit:
1. Disable submit.
2. Send `POST /v1/admin/stations/:id/status`.
3. Include `Idempotency-Key`.
4. Keep confirmation visible in submitting state.
5. Parse backend response.
6. Invalidate station and launch readiness caches.
7. Render saved result.

On retry:
- Reuse the same idempotency key only for retrying the same payload after transient failure.
- Generate a new key after payload changes.

## Unsaved Changes
Dirty state starts when:
- Operating status differs from current backend value.
- Intake status differs from current backend value.
- Any service boolean differs from current backend value.
- Note differs from current backend value.

Dirty state clears when:
- Backend save succeeds and response becomes baseline.
- User resets to current backend status.

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
You cannot update station status
```

Rules:
- If admin can read station data, show read-only state.
- If admin cannot read admin station data, show admin auth error.

### API Error
Rules:
- Show request-safe error.
- Preserve proposed values.
- Offer retry.
- Do not print raw server payload.

### Server Validation Error
Rules:
- Map field errors to controls where possible.
- Show global error for request-level failures.
- Preserve proposed values.
- Do not guess save success.

## Copy System
Tone:
- Direct.
- Operational.
- Cautious.
- Evidence-led.

Primary labels:
- `Review status override`
- `Submit status override`
- `Back to edit`
- `Reset to current backend status`
- `Back to station detail`

Warnings:
- `Pausing this station may affect active queues.`
- `Restricting intake limits new package acceptance.`
- `Disabling all services makes this station unavailable for service selection.`
- `Activating a station does not clear validation blockers.`

Success:
- `Backend saved station status.`

Avoid:
- `Turn station on`
- `Launch station`
- `All clear`
- `Safe to operate`
- Any claim that customer notifications were sent.

## Analytics
Events:
- `admin_station_status_viewed`
- `admin_station_status_dirty`
- `admin_station_status_confirm_opened`
- `admin_station_status_submitted`
- `admin_station_status_saved`
- `admin_station_status_client_error`
- `admin_station_status_server_error`
- `admin_station_status_read_only`
- `admin_station_status_reset`

Allowed properties:
- `station_id`
- `station_city`
- `role`
- `current_operating_status`
- `current_intake_status`
- `proposed_operating_status`
- `proposed_intake_status`
- `standard_changed`
- `express_changed`
- `doorstep_changed`
- `active_queue_count_bucket`
- `issue_count_bucket`
- `validation_status`
- `go_live_eligible`
- `launch_context_available`
- `changed_field_count`
- `result_operating_status`
- `result_intake_status`

Forbidden properties:
- Note text.
- Backend blocker text.
- Receiver data.
- Sender data.
- Delivery IDs.
- Auth tokens.
- Raw error payloads.

## Accessibility
Form structure:
- One `h1`.
- Operating status radio group has legend.
- Intake status radio group has legend.
- Service availability controls are grouped.
- Every input has visible label.
- Error summary links to fields.

Confirmation:
- If implemented as a route step, focus moves to heading.
- If implemented as a modal, modal must trap focus, provide accessible title, and return focus to trigger when closed.
- Escape closes confirmation only before submission starts.

Status messages:
- Submitting uses polite live region.
- Save result uses polite live region.
- Blocking server error uses assertive live region.

Color:
- No status uses color alone.
- High-impact warnings include text and icon labels.

Keyboard:
- All controls reachable in order.
- Radio groups support arrow keys.
- Checkbox controls support space.
- Sticky action follows DOM order.

Motion:
- No shaking fields.
- No looping progress.
- Respect `prefers-reduced-motion`.

## Privacy And Security
Security:
- Submit requires authenticated admin session.
- Submit requires `override_queue_state`.
- Use idempotency key.
- Do not expose auth tokens.
- Do not store request payload in URL.

Privacy:
- Do not request personal data.
- Do not allow customer personal data in note without warning.
- Do not send note text to analytics.
- Do not show receiver or sender data.

Audit posture:
- Make before-and-after values visible before submit.
- Show backend result after save.
- Link to audit events when station object filtering is supported.

## Performance
Targets:
- Initial station status visible within `1500ms` on normal admin network.
- Form input latency below `50ms`.
- Confirmation opens instantly from current client state.
- Submit result displays within backend SLA.

Rules:
- Primary station load must not wait for optional launch context.
- Do not poll.
- Do not debounce radio or checkbox controls.
- Keep impact preview local.
- Avoid client-side joins beyond loaded station and launch context objects.

## Responsive Behavior
Desktop:
- Current/proposed layout with sticky impact panel.
- Confirmation as wide review panel or modal.

Tablet:
- Impact panel below status summary.
- Confirmation as full-width section.

Mobile:
- Single-column.
- Sticky bottom primary action.
- Before-and-after cards.
- Warnings above submit.
- Large touch targets.

Mobile rules:
- No horizontal scrolling.
- No hidden warnings behind hover.
- Submit only appears in confirmation step.

## Testing Requirements
Unit tests:
- Route station ID validation.
- Station resolution from `admin_stations`.
- Form initialization from current station status.
- Dirty-state derivation.
- Operating status enum validation.
- Intake status enum validation.
- Service boolean validation.
- Note bounds.
- Changed-field count derivation.
- Impact preview derivation.
- Role submit visibility.
- Payload builder.
- Idempotency key reuse rule.
- Analytics sanitizer.

Integration tests:
- Loads current station status.
- Renders read-only mode for `support_admin`.
- Renders read-only mode for `finance_admin`.
- Enables submit flow for `ops_admin`.
- Enables submit flow for `super_admin`.
- Opens confirmation step after valid changes.
- Blocks confirmation when no values changed.
- Submits `admin_update_station_status`.
- Sends idempotency key.
- Shows saved result from backend response.
- Preserves proposed values on server error.
- Invalidates station and launch readiness data after success.
- Handles launch context unavailable.
- Handles invalid station.
- Handles station not found.

Accessibility tests:
- Radio groups have legends.
- Service controls have labels.
- Error summary links to fields.
- Confirmation step focus moves correctly.
- Modal behavior is accessible if modal is used.
- Status messages are announced.
- Mobile sticky action follows keyboard order.

Visual regression states:
- Active and open station.
- Paused station.
- Restricted intake.
- All services disabled warning.
- Validation blocked warning.
- Read-only mode.
- Confirmation step.
- Submitting state.
- Saved active result.
- Saved paused result.
- Client invalid state.
- Server error state.
- Mobile edit.
- Mobile confirmation.

## Implementation Checklist
- Create route `/admin/stations/:stationId/status`.
- Use protected admin shell.
- Validate route station ID.
- Fetch `admin_stations`.
- Resolve station.
- Prefill form from station status fields.
- Optionally fetch `admin_launch_readiness`.
- Build pure payload builder.
- Build pure client validator.
- Build pure impact preview helper.
- Build dirty-state helper.
- Build role submit helper.
- Build edit form.
- Build confirmation step.
- Build backend result panel.
- Submit `admin_update_station_status` with idempotency key.
- Invalidate `AdminStationList`, `Station`, and `LaunchReadiness` after success.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build
Do not build:
- Validation evidence controls.
- Issue resolution controls.
- Delivery reassignment controls.
- Payment or refund controls.
- Public service area editing.
- Automatic notification sending.
- Staff roster.
- Full audit event stream.
- One-click save.
- Hidden submit for read-only roles.
- Analytics containing note text.
- Request payloads in URLs.
- Background polling.

## Acceptance Criteria
The screen is complete when:
- `/admin/stations/:stationId/status` renders with test id `screen-admin-station-status-override`.
- It resolves station context from `admin_stations`.
- It preloads current operating status, intake status, service availability, and note.
- It gates submit by `override_queue_state`.
- It supports read-only state for non-submit admin roles.
- It validates every request field before confirmation.
- It has a confirmation step showing before-and-after values.
- It submits only `admin_update_station_status`.
- It includes an idempotency key.
- It displays backend status fields and `updatedAt` after save.
- It invalidates station and launch readiness data after success.
- It protects note text from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief
Build `AdminStationStatusOverride` as a controlled operational override flow for `/admin/stations/:stationId/status`. Load the station from `admin_stations`, prefill operating status, intake status, service availability, and note, gate submission to roles with `override_queue_state`, require confirmation with before-and-after values, submit only `admin_update_station_status` with an idempotency key, and show the backend-saved result as final truth.
