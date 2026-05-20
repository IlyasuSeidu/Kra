# AdminLaunchReadiness Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminLaunchReadiness` |
| Route | `/admin/launch-readiness` |
| Primary test ID | `screen-admin-launch-readiness` |
| Surface | Admin web console |
| Backend coverage | `admin_launch_readiness` through `GET /v1/admin/launch-readiness` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `blocked`, `stale`, `refreshing`, `empty_stations`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, protected admin shell |
| Related screens | `AdminLaunchReadinessDetail`, `AdminStations`, `AdminStationDetail`, `AdminStationValidation`, `AdminIssueQueue`, `AdminPaymentReconciliation`, `AdminOutboundNotifications`, `AdminDeliveryExplorer` |
| Current implementation mode | Read-only launch gate command screen; all corrections happen in owner screens |

## Outcome
`AdminLaunchReadiness` gives admins a single, backend-authoritative answer to whether Kra can open or continue pilot volume.

The screen must answer:
- `Can we go live right now?`
- `Which launch gate is blocking us?`
- `Which station owns the blocker?`
- `Which blockers are P1 versus P2?`
- `Are station validation, P1 issues, payment reconciliation, and receiver SMS clear?`
- `Which station needs action next?`
- `Where should the admin go to resolve the blocker?`
- `When did the backend generate this readiness decision?`

The screen is a launch control gate. It is not a place for local frontend judgment, optimistic readiness, or manual approval outside backend policy.

## Product Definition
This screen allows admins to:
- View the backend readiness status.
- View `goLiveEligible`.
- Review all readiness blockers.
- Review blocker severity.
- Review blocker code.
- Review blocker count when provided.
- Review blocker station when provided.
- Review station readiness rows.
- Review system check totals.
- Navigate to blocker owner screens.
- Refresh the readiness snapshot.
- Explain exactly why launch is blocked.
- Confirm when all backend launch gates are clear.

It does not allow admins to:
- Mark the platform ready from the client.
- Override readiness locally.
- Hide blockers.
- Reclassify blocker severity.
- Edit station validation.
- Pause or activate a station.
- Resolve P1 issues.
- Approve payment reconciliation.
- Retry receiver SMS notifications.
- Open public launch controls.
- Mutate delivery state.
- Export launch certification.
- Show receiver phone numbers.
- Show raw notification content.
- Show payment provider references.
- Show internal stack traces.

## Users
Primary:
- `ops_admin` reviewing station readiness, station status, intake status, and active queue exposure.
- `support_admin` reviewing unresolved P1 issue pressure before launch.
- `finance_admin` reviewing payment reconciliation blockers before launch.
- `super_admin` making the final go-live decision from backend-owned evidence.

Secondary:
- QA validating launch gate behavior.
- Security reviewers validating data boundaries.
- Engineering leads validating backend and frontend parity.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- Admin overview launch readiness card.
- Admin shell navigation.
- Release runbook link.
- Direct route `/admin/launch-readiness`.
- Blocker detail back link.
- Station detail readiness link.
- Payment reconciliation queue link.
- Outbound notifications dead-letter link.
- Issue queue P1 filter link.

The screen must not be reachable:
- Without a valid admin session.
- From sender app navigation.
- From receiver public tracking.
- From station operator mobile app.
- From driver mobile app.
- From final-mile courier mobile app.
- From public web.

## Real-World Context
Kra's pilot launch can fail if a single station is not validated, if a station is paused, if a launch service is disabled, if P1 issues remain open, if payment reconciliation needs review, or if receiver SMS delivery is broken.

Admins will use this screen:
- Before opening public pilot volume.
- At the start of an operations shift.
- After a station outage.
- After a payment provider incident.
- After receiver messaging incidents.
- During release review.
- During incident recovery.
- During executive launch review.

The page must be fast to scan and hard to misread. A blocked launch decision must feel serious. A ready launch decision must still show evidence, not celebration without context.

## User Goal
Primary goal:
- Decide whether launch can proceed.

Secondary goals:
- Identify the highest-severity blocker.
- Identify the owner screen for each blocker.
- Confirm every launch station is eligible.
- Confirm P1 issue count is zero.
- Confirm payment review count is zero.
- Confirm receiver SMS dead-letter count is zero.
- Confirm the snapshot freshness.
- Share a clear operational status verbally without needing raw logs.

## Scope
In scope:
- Readiness status hero.
- Snapshot freshness.
- Blocker summary.
- Blocker list.
- System check cards.
- Station readiness matrix.
- Station service availability indicators.
- Severity visual hierarchy.
- Owner routing.
- Loading, blocked, ready, stale, error, and authorization states.
- Keyboard access.
- Screen reader labels.
- Analytics for view and blocker clicks.

Out of scope:
- Station validation mutation.
- Station status override mutation.
- Payment reconciliation mutation.
- Notification retry mutation.
- Issue resolution mutation.
- Public launch switch.
- Release sign-off workflow.
- Export generation.
- Rich charts that hide exact counts.
- Maps.
- Live telemetry.

## Design Thesis
This screen should feel like an aviation launch board for a logistics network: calm, strict, auditable, and decisive.

Visual thesis:
- `go-live gate console`: ivory background, graphite text, amber and red used only for risk, a narrow readiness spine, crisp station rows, and direct owner links.

Design principles:
- The backend decision is the headline.
- Evidence sits directly below the decision.
- P1 blockers dominate P2 blockers.
- Counts must be exact and visible.
- Every blocker must route to a next action.
- Station rows must be comparable at a glance.
- Ready state must still show the checks that passed.
- Empty or missing data must be explicit.

Restraint rule:
- No decorative launch graphics, no confetti, no animated gauges, no speculative readiness score, no client-side risk score, and no unsupported executive summary.

## Research Inputs
Relevant external references:
- [Google SRE reliable product launches](https://sre.google/sre-book/reliable-product-launches/): supports treating launch as a coordinated reliability process with explicit checks, owners, and go/no-go evidence.
- [GOV.UK service assessments](https://www.gov.uk/service-manual/service-assessments): supports clear service readiness review before public service exposure.
- [Material Design cards](https://m3.material.io/components/cards/overview): supports grouped readiness evidence and clear click targets.
- [Material Design progress indicators](https://m3.material.io/components/progress-indicators/overview): supports loading and refresh behavior without losing orientation.
- [USWDS alert component](https://designsystem.digital.gov/components/alert/): supports accessible critical, warning, and success status communication.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible tabular station comparison.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing readiness, refresh, stale, and error changes.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through gate status, blockers, checks, and station rows.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/07-api/api-contracts.md`
- `docs/06-architecture/backend-architecture.md`
- `docs/12-engineering/deployment-runbook.md`
- `docs/12-engineering/release-plan.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/admin.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/admin.test.ts`
- `services/api/src/__tests__/app.test.ts`

## Backend Contract
Endpoint:
```http
GET /v1/admin/launch-readiness
```

Operation:
```text
admin_launch_readiness
```

Auth:
- Authenticated admin only.
- Backend uses `requireAdmin`.
- Response must be treated as operationally sensitive.
- Response must not be cached by a shared browser or proxy layer.

Response:
```json
{
  "generatedAt": "2026-05-16T16:00:00.000Z",
  "goLiveEligible": false,
  "status": "blocked",
  "blockers": [
    {
      "code": "unresolved_p1_issue",
      "severity": "p1",
      "stationId": "ST-ACC-01",
      "count": 1,
      "message": "Accra Central has unresolved P1 issues."
    }
  ],
  "stations": [
    {
      "stationId": "ST-ACC-01",
      "name": "Accra Central",
      "city": "Accra",
      "operatingStatus": "active",
      "intakeStatus": "open",
      "serviceAvailability": {
        "standard": true,
        "express": true,
        "doorstep": true
      },
      "validationStatus": "ready",
      "goLiveEligible": true,
      "validationBlockerCount": 0,
      "activeQueueCount": 5,
      "unresolvedP1IssueCount": 1,
      "updatedAt": "2026-05-16T15:00:00.000Z"
    }
  ],
  "systemChecks": {
    "stationValidation": {
      "readyStations": 1,
      "totalStations": 3
    },
    "unresolvedP1Issues": {
      "count": 1
    },
    "paymentReconciliation": {
      "reviewRequiredCount": 1
    },
    "receiverSms": {
      "deadLetterCount": 0
    }
  }
}
```

Field interpretation:
- `generatedAt`: backend snapshot time.
- `goLiveEligible`: backend decision boolean.
- `status`: backend status string, either `ready` or `blocked`.
- `blockers`: backend list of active launch blockers.
- `blockers[].code`: canonical blocker reason.
- `blockers[].severity`: `p1` or `p2`.
- `blockers[].message`: backend-safe human message.
- `blockers[].stationId`: station owner when station-specific.
- `blockers[].count`: numeric evidence when available.
- `stations`: launch station rows.
- `stations[].goLiveEligible`: station-level gate decision.
- `stations[].validationBlockerCount`: station validation blocker count.
- `stations[].activeQueueCount`: current active queue exposure.
- `stations[].unresolvedP1IssueCount`: station P1 issue count.
- `systemChecks`: platform-wide gate totals.

## Backend Decision Rules
The frontend must not reimplement readiness. It may only display and route from backend response data.

Backend returns `ready` only when:
- Every launch station is go-live eligible.
- Every launch station is active.
- Every launch station is open for intake.
- Every launch station has standard service enabled.
- Every launch station has express service enabled.
- Every launch station has doorstep service enabled.
- Every launch station has zero unresolved P1 issues.
- Payment reconciliation review count is zero.
- Receiver SMS dead-letter count is zero.

Backend returns `blocked` when any rule above is not clear.

The UI may derive display groupings:
- Number of P1 blockers.
- Number of P2 blockers.
- Stations blocked by local station signal.
- Stations with unresolved P1 issues.
- Stations with incomplete validation.

The UI must not derive:
- A separate launch readiness status.
- A percentage readiness score.
- A go-live approval.
- A station eligibility override.
- A hidden blocker list.
- Any signal from endpoints other than `admin_launch_readiness` unless a linked child screen is opened.

## Blocker Codes
`station_validation_incomplete`
- Severity from backend.
- Station-specific when `stationId` is present.
- Owner screen: `AdminStationValidation`.
- Primary CTA: `Review station validation`.
- Admin explanation: station validation is not go-live eligible.

`station_operationally_paused`
- Severity from backend.
- Station-specific when `stationId` is present.
- Owner screen: `AdminStationDetail` or `AdminStationStatusOverride`.
- Primary CTA: `Review station status`.
- Admin explanation: station must be active and open for intake.

`station_service_unavailable`
- Severity from backend.
- Station-specific when `stationId` is present.
- Owner screen: `AdminStationDetail`.
- Primary CTA: `Review service availability`.
- Admin explanation: standard, express, and doorstep services must all be enabled for launch.

`unresolved_p1_issue`
- Severity from backend.
- Station-specific when `stationId` is present.
- Owner screen: `AdminIssueQueue`.
- Primary CTA: `Open P1 issues`.
- Admin explanation: unresolved P1 issues block launch.

`payment_reconciliation_review`
- Severity from backend.
- Platform-wide.
- Owner screen: `AdminPaymentReconciliation`.
- Primary CTA: `Open reconciliation queue`.
- Admin explanation: payment records needing review block launch.

`dead_letter_receiver_sms`
- Severity from backend.
- Platform-wide.
- Owner screen: `AdminOutboundNotifications`.
- Primary CTA: `Open receiver SMS dead letters`.
- Admin explanation: receiver SMS delivery failures block launch.

Unknown blocker code:
- Render as `Unknown launch blocker`.
- Preserve backend message.
- Severity from backend.
- CTA: `Escalate to engineering`.
- Do not hide.
- Emit telemetry event `admin_launch_readiness_unknown_blocker_seen`.

## Required Layout
Desktop layout:
- Protected admin shell.
- Top breadcrumb row.
- Full-width readiness hero.
- Two-column body.
- Left column: blocker list, station readiness matrix.
- Right column: system checks, owner shortcuts, snapshot details.

Tablet layout:
- Protected admin shell.
- Readiness hero.
- System checks in two columns.
- Blocker list.
- Station matrix as horizontally scrollable table with sticky first column.

Mobile-width web layout:
- Single column.
- Readiness hero first.
- P1 blockers immediately after hero.
- System checks.
- Station cards instead of dense table.
- Owner links as full-width buttons.

Minimum content order:
1. Skip link.
2. Admin shell.
3. Breadcrumb.
4. Page title.
5. Snapshot freshness.
6. Backend readiness status.
7. P1 blocker summary.
8. P2 blocker summary.
9. Blocker list.
10. System checks.
11. Station readiness matrix.
12. Owner shortcuts.
13. Footer metadata.

## Page Header
Title:
```text
Launch readiness
```

Subtitle when blocked:
```text
Backend launch gate is blocked. Clear the listed blockers before pilot volume opens.
```

Subtitle when ready:
```text
Backend launch gate is ready. Review evidence before opening or continuing pilot volume.
```

Header actions:
- `Refresh`
- `Open deployment runbook`
- `Open overview`

Header metadata:
- `Generated {relative time}`
- Exact timestamp in tooltip or accessible details.
- `Source: admin_launch_readiness`

Refresh button behavior:
- Calls `GET /v1/admin/launch-readiness`.
- Keeps current data visible while refreshing.
- Shows non-blocking progress indicator.
- Announces refresh state through a status region.
- Disables duplicate refresh until request completes.

## Readiness Hero
Blocked hero:
- Dominant text: `Launch blocked`
- Supporting text: `Clear all P1 and P2 blockers returned by the backend launch gate.`
- Badge: `Blocked`
- Tone: critical for P1 present, warning for only P2 present.
- Evidence chips:
  - `{p1Count} P1`
  - `{p2Count} P2`
  - `{blockedStationCount} stations need action`
  - `Generated {relative time}`
- Primary action: first blocker owner CTA.
- Secondary action: `View all blockers`

Ready hero:
- Dominant text: `Launch gate ready`
- Supporting text: `Every backend launch-readiness check is clear.`
- Badge: `Ready`
- Tone: success but restrained.
- Evidence chips:
  - `{readyStations}/{totalStations} stations ready`
  - `0 P1 issues`
  - `0 payment reviews`
  - `0 receiver SMS dead letters`
  - `Generated {relative time}`
- Primary action: `Open deployment runbook`
- Secondary action: `Review station matrix`

Hero must not:
- Say public launch has started.
- Say leadership has approved launch.
- Use celebration effects.
- Hide generated timestamp.
- Replace exact counts with vague text.

## System Checks
Render four check cards in fixed order:
1. `Station validation`
2. `Unresolved P1 issues`
3. `Payment reconciliation`
4. `Receiver SMS`

Station validation card:
- Primary metric: `{readyStations}/{totalStations}`
- Label: `stations go-live eligible`
- Clear state: all stations ready.
- Blocked state: one or more stations not ready.
- CTA: `Review station validation`
- Route target: `/admin/stations`

Unresolved P1 issues card:
- Primary metric: `{count}`
- Label: `open P1 issues`
- Clear state: `0`
- Blocked state: greater than `0`
- CTA: `Open P1 issue queue`
- Route target: `/admin/issues?severity=p1&status=open`

Payment reconciliation card:
- Primary metric: `{reviewRequiredCount}`
- Label: `payments need review`
- Clear state: `0`
- Blocked state: greater than `0`
- CTA: `Open reconciliation`
- Route target: `/admin/payment-reconciliation`

Receiver SMS card:
- Primary metric: `{deadLetterCount}`
- Label: `dead-letter receiver SMS`
- Clear state: `0`
- Blocked state: greater than `0`
- CTA: `Open notification failures`
- Route target: `/admin/outbound-notifications?channel=sms&status=dead_letter`

System check visual rules:
- Use exact numeric values.
- Use green only for clear checks.
- Use red for P1-blocking checks.
- Use amber for P2-only station service availability checks.
- Include text labels in addition to color.
- Keep card order stable across states.

## Blocker List
The blocker list is the primary work surface when blocked.

Sort order:
1. P1 blockers.
2. P2 blockers.
3. Station-specific blockers sorted by city then station name.
4. Platform-wide blockers.
5. Unknown codes last within severity group.

Each blocker row must show:
- Severity.
- Blocker code label.
- Backend message.
- Station name when resolvable from response.
- Station ID when no station name can be resolved.
- Count when provided.
- Owner screen.
- Primary CTA.
- Copyable blocker code.

Blocker row content structure:
- Eyebrow: `P1 blocker` or `P2 blocker`
- Title: human-readable blocker label.
- Body: backend `message`.
- Evidence: station, count, affected check.
- Action: owner CTA.

Human-readable labels:
- `station_validation_incomplete`: `Station validation incomplete`
- `station_operationally_paused`: `Station paused or intake closed`
- `station_service_unavailable`: `Launch service unavailable`
- `unresolved_p1_issue`: `Unresolved P1 issue`
- `payment_reconciliation_review`: `Payment reconciliation review`
- `dead_letter_receiver_sms`: `Receiver SMS dead letter`

Empty blocker list with blocked status:
- Render critical data integrity state.
- Text: `Backend says launch is blocked, but no blockers were returned.`
- CTA: `Escalate to engineering`
- Telemetry: `admin_launch_readiness_blocked_without_blockers_seen`

Non-empty blocker list with ready status:
- Render warning data integrity state.
- Text: `Backend says launch is ready, but blockers were returned.`
- CTA: `Escalate to engineering`
- Telemetry: `admin_launch_readiness_ready_with_blockers_seen`

## Station Readiness Matrix
The station matrix gives a station-by-station audit view.

Columns:
- Station.
- City.
- Eligibility.
- Validation.
- Operating status.
- Intake status.
- Standard service.
- Express service.
- Doorstep service.
- Active queue.
- P1 issues.
- Validation blockers.
- Last updated.
- Action.

Station column:
- Show `name`.
- Show `stationId` as secondary text.
- Link to `/admin/stations/{stationId}`.

Eligibility column:
- `Ready` when `goLiveEligible` is true.
- `Blocked` when `goLiveEligible` is false.
- Use text and icon, not color alone.

Validation column:
- Render `validationStatus`.
- Allowed values: `not_started`, `in_progress`, `ready`, `blocked`.
- Use readable labels:
  - `not_started`: `Not started`
  - `in_progress`: `In progress`
  - `ready`: `Ready`
  - `blocked`: `Blocked`

Operating status column:
- Render backend `operatingStatus`.
- `active` must look clear.
- Non-active values must look blocked.

Intake status column:
- Render backend `intakeStatus`.
- `open` must look clear.
- Non-open values must look blocked.

Service availability columns:
- Render `standard`, `express`, and `doorstep`.
- `Enabled` for true.
- `Disabled` for false.
- Disabled launch services are blockers.

Active queue column:
- Show exact count.
- This value is evidence, not a blocker by itself in current backend logic.
- Do not imply that a nonzero queue blocks launch.

P1 issues column:
- Show exact count.
- `0` is clear.
- Greater than `0` is blocking.
- Link to issue queue filtered by station and P1.

Validation blockers column:
- Show exact count.
- `0` is clear.
- Greater than `0` needs station validation review.

Last updated column:
- Use relative time.
- Expose exact timestamp to assistive technology.

Action column:
- Primary row action: `Review station`
- Secondary menu options:
  - `Open validation`
  - `Open P1 issues`
  - `Open station queue`

Station matrix must not:
- Hide blocked stations behind collapsed UI.
- Sort ready stations above blocked stations by default.
- Treat active queue count as a launch blocker.
- Treat stale station update as a backend blocker unless backend sends it as a blocker.
- Add station data from other endpoints on this screen.

Default station sort:
1. Station rows with unresolved P1 issues.
2. Station rows that are not go-live eligible.
3. Station rows that are not active or intake is not open.
4. Station rows with disabled launch services.
5. Ready stations.
6. City ascending.
7. Station name ascending.

## Ready State
Ready state is not empty. It must show full evidence.

Ready content:
- Ready hero.
- Zero blocker panel.
- Four clear system check cards.
- Station matrix with all launch stations.
- Deployment runbook link.
- Timestamp and source metadata.

Zero blocker panel text:
```text
No backend launch blockers are active.
```

Ready caution text:
```text
This screen confirms backend readiness only. Follow the deployment runbook for release approval and communications.
```

Ready state must not:
- Automatically navigate away.
- Start public launch.
- Hide station evidence.
- Hide system checks.
- Use language like `approved` unless an approval workflow exists.

## Blocked State
Blocked state must create urgency without panic.

Blocked content:
- Blocked hero.
- P1 and P2 counts.
- First three highest-priority blockers.
- Full blocker list.
- System checks.
- Station matrix.
- Owner shortcuts.

If P1 blockers exist:
- Hero tone must be critical.
- First focusable action after header should route to highest-priority P1 owner.
- P1 blocker cards must appear before system check cards on mobile-width layouts.

If only P2 blockers exist:
- Hero tone must be warning.
- Copy must still say launch is blocked if backend `status` is blocked.
- P2 blockers must remain visible and actionable.

Blocked state must not:
- Use language that launch can proceed with P2 blockers.
- Hide platform-wide blockers below the fold without summary.
- Require chart interpretation to find the blocker.

## Loading State
Initial loading:
- Show page header frame.
- Show readiness hero skeleton.
- Show four system check skeleton cards.
- Show station matrix skeleton.
- Use visible progress indicator.
- Announce `Loading launch readiness`.

Loading must not:
- Show previous status as current if no cached data exists.
- Flash `ready`.
- Flash `blocked`.
- Render empty station table as if real.

Refreshing:
- Keep current data visible.
- Show inline refresh progress next to timestamp.
- Announce `Refreshing launch readiness`.
- On success, update timestamp and all cards.
- On failure, keep last successful data and show refresh error banner.

## Stale State
A snapshot is stale when the client-side freshness threshold is exceeded.

Recommended threshold:
- `generatedAt` older than 5 minutes: show stale warning.
- `generatedAt` older than 15 minutes: show strong stale warning and prompt refresh.

Stale warning text:
```text
This readiness snapshot may be stale. Refresh before making a launch decision.
```

Stale state rules:
- Do not change backend `status`.
- Do not hide data.
- Add warning near timestamp and hero.
- Disable launch-confidence wording until refreshed.
- Allow all owner links.

## Empty Stations State
The backend schema expects at least one total station in `systemChecks.stationValidation.totalStations`, but the station array may still be empty due to data integrity or partial response issues.

If `stations.length === 0`:
- Render data integrity panel.
- Text: `No launch station rows were returned.`
- Show system check totals if present.
- CTA: `Escalate to engineering`.
- Secondary CTA: `Refresh`.
- Telemetry: `admin_launch_readiness_empty_stations_seen`.

Do not:
- Claim ready if station rows are absent.
- Hide the system checks.
- Create station rows in the client.

## Error States
`not_authorized`:
- Title: `Admin access required`
- Body: `Your current account cannot view launch readiness.`
- CTA: `Return to admin sign in`
- Do not reveal whether launch is blocked or ready.

`session_expired`:
- Title: `Session expired`
- Body: `Sign in again to review launch readiness.`
- CTA: `Sign in again`
- Preserve safe return path.

`api_error`:
- Title: `Launch readiness unavailable`
- Body: `The backend readiness gate could not be loaded. Do not make a launch decision from this page until it refreshes successfully.`
- CTA: `Retry`
- Secondary CTA: `Open deployment runbook`
- Include request ID when backend error includes it.

`rate_limited`:
- Title: `Too many refresh attempts`
- Body: `Wait a moment before refreshing launch readiness again.`
- CTA: `Try again later`

Error state rules:
- Never show stale data without labeling it stale.
- Never infer status from prior page state.
- Never expose raw error objects.
- Never include stack traces.

## Navigation And Owner Routing
Owner routes:
- Station list: `/admin/stations`
- Station detail: `/admin/stations/:stationId`
- Station validation: `/admin/stations/:stationId/validation`
- Station status override: `/admin/stations/:stationId/status`
- Issue queue P1 filter: `/admin/issues?severity=p1&status=open`
- Station P1 filter: `/admin/issues?severity=p1&status=open&stationId=:stationId`
- Payment reconciliation: `/admin/payment-reconciliation`
- Receiver SMS dead letters: `/admin/outbound-notifications?channel=sms&status=dead_letter`
- Deployment runbook: internal docs or configured route.
- Overview: `/admin`

If a future route is not implemented yet:
- Render link only if route exists in frontend routing.
- Otherwise render disabled action with reason `Owner screen not implemented yet`.
- Do not link to public routes.

Deep-link rules:
- Blocker rows should link to `AdminLaunchReadinessDetail` when implemented.
- Until detail screen exists, primary CTA should route to owner screen.
- `stationId` must be URL-encoded.
- Query filters must use backend-supported filter names only.

## Content And Copy
Tone:
- Direct.
- Operational.
- Evidence-led.
- No hype.
- No blame.

Preferred words:
- `ready`
- `blocked`
- `clear`
- `needs review`
- `owner`
- `generated`
- `backend gate`
- `P1`
- `P2`

Avoid:
- `approved`
- `safe to launch`
- `guaranteed`
- `all good`
- `probably`
- `frontend estimate`
- `manual pass`

Core copy:
- Ready headline: `Launch gate ready`
- Blocked headline: `Launch blocked`
- Stale label: `Refresh before decision`
- No blockers: `No backend launch blockers are active.`
- P1 label: `P1 blocker`
- P2 label: `P2 blocker`
- Source label: `Source: admin_launch_readiness`

## Visual System
Color roles:
- Background: warm off-white.
- Primary text: deep graphite.
- Secondary text: slate.
- Border: cool gray.
- Ready: restrained green.
- Warning: amber.
- Critical: red.
- Info: blue-gray.

Color use:
- Use red only for P1 blockers or blocking error state.
- Use amber for P2 blockers, stale data, and incomplete services.
- Use green only for clear checks.
- Never encode status by color alone.

Typography:
- Page title large and plain.
- Hero status uses the strongest type scale.
- Metric counts use tabular numerals.
- Table body must stay readable at laptop width.
- Avoid decorative typefaces in admin console.

Spacing:
- Hero gets the largest vertical space.
- System check cards use consistent height.
- Blocker cards use strong grouping.
- Station matrix uses compact rows with enough hit area.

Motion:
- Page load may use a short opacity and translate reveal.
- Refresh indicator should be subtle.
- Blocker cards should not pulse.
- No constant animation.
- Respect `prefers-reduced-motion`.

## Interaction Rules
Refresh:
- Button visible in header.
- Keyboard reachable.
- Shows in-progress state.
- Returns focus to refresh button after completion unless an error banner needs focus.

Blocker CTA:
- Opens owner screen.
- Preserves filters.
- Includes station filter when station-specific.
- Emits analytics event.

Station row:
- Entire station name is a link.
- Row action menu must be keyboard accessible.
- Action menu must not hide the primary owner action.

Copy blocker code:
- Copies canonical blocker code.
- Announces copy success.
- Does not copy station or sensitive details.

Sort station table:
- Default sort is risk-first.
- Admin may sort by city, station, P1 issues, validation blockers, or last updated.
- Sorting must not change backend readiness status.

Filter station table:
- Filter options:
  - `All`
  - `Blocked`
  - `Ready`
  - `P1 issues`
  - `Validation blockers`
  - `Service disabled`
- Filter chips must show counts.
- Filters are local to response data.

## Accessibility Requirements
Semantic structure:
- Use one `h1`.
- Use `h2` for hero, blockers, system checks, and stations.
- Use semantic table for desktop station matrix.
- Use list semantics for blocker list.
- Use buttons for actions that mutate client state.
- Use links for navigation.

Status announcements:
- Loading: announce when data load begins.
- Ready: announce `Launch gate ready`.
- Blocked: announce `Launch blocked with {p1Count} P1 and {p2Count} P2 blockers`.
- Refresh success: announce `Launch readiness refreshed`.
- Refresh failure: announce `Launch readiness refresh failed`.
- Stale: announce stale warning when it appears.

Keyboard:
- Skip link to main content.
- Refresh reachable before blocker list.
- Blocker cards reachable in severity order.
- Station row actions reachable after station link.
- Focus outline visible.
- No keyboard trap in action menu.

Screen reader labels:
- Badge labels include status text.
- Icons must have text equivalents.
- Counts must include units.
- Relative timestamps must include exact timestamp in accessible text.

Contrast:
- Meet WCAG AA for text.
- Critical and warning badges must pass contrast.
- Disabled actions must remain readable.

Reduced motion:
- Disable nonessential transitions.
- Keep progress indicators accessible.

## Security And Privacy
Security rules:
- Require admin role before rendering data.
- Do not persist readiness payload in long-lived browser storage.
- Do not expose response in URL.
- Do not include sensitive data in analytics.
- Do not log full station rows to client console.
- Do not show raw notification content.
- Do not show raw payment records.
- Do not show receiver phone numbers.
- Do not show staff PII beyond station names and IDs returned by endpoint.

Privacy rules:
- The screen is operational and internal only.
- Do not include sender, receiver, courier, driver, or station operator personal details.
- Station IDs are allowed because they are operational identifiers.
- Issue counts are allowed; issue content is not shown here.

Authorization behavior:
- If user lacks admin role, render denied state.
- If user has admin role but child owner screen requires extra capability, keep launch blocker visible and show restricted owner action when navigating.
- Do not hide launch blockers from finance or support admins solely because owner action may be role-limited.

## Data Handling
Fetch policy:
- Fetch on route entry.
- Refetch on manual refresh.
- Refetch when browser tab regains focus after stale threshold.
- Do not poll continuously by default.

Cache policy:
- Keep in memory while route is active.
- Do not store in local storage.
- Do not store in indexed database.
- Clear on sign out.

Time handling:
- Parse `generatedAt` and `updatedAt` as ISO timestamps.
- Display relative time with exact timestamp available.
- If timestamp parsing fails, show `Timestamp unavailable` and keep data visible with warning.

Resilience:
- Unknown blocker code remains visible.
- Unknown station status remains visible as raw safe text.
- Missing optional blocker `count` hides count row, not the blocker.
- Missing optional blocker `stationId` treats blocker as platform-wide.
- Station IDs not found in station array still render from blocker data.

## Analytics
Emit:
- `admin_launch_readiness_viewed`
- `admin_launch_readiness_refreshed`
- `admin_launch_readiness_blocker_clicked`
- `admin_launch_readiness_station_clicked`
- `admin_launch_readiness_owner_link_clicked`
- `admin_launch_readiness_stale_seen`
- `admin_launch_readiness_error_seen`
- `admin_launch_readiness_unknown_blocker_seen`
- `admin_launch_readiness_blocked_without_blockers_seen`
- `admin_launch_readiness_ready_with_blockers_seen`
- `admin_launch_readiness_empty_stations_seen`

Event properties:
- `status`
- `goLiveEligible`
- `blockerCount`
- `p1Count`
- `p2Count`
- `stationCount`
- `readyStationCount`
- `blockerCode`
- `severity`
- `hasStationId`
- `ownerScreen`

Do not emit:
- Station name.
- Backend message text.
- Request body.
- Raw response.
- User email.
- Receiver data.
- Payment references.

## Test Plan
Unit tests:
- Renders loading state.
- Renders ready hero when `status` is `ready`.
- Renders blocked hero when `status` is `blocked`.
- Renders `goLiveEligible` evidence.
- Sorts P1 blockers before P2 blockers.
- Renders all blocker codes with correct labels.
- Renders unknown blocker code safely.
- Renders blocker count when provided.
- Hides blocker count section when absent.
- Resolves station name from `stationId`.
- Falls back to station ID when station not found.
- Renders system check metrics exactly.
- Renders station matrix rows.
- Renders service availability indicators.
- Renders stale warning after threshold.
- Preserves current data during refresh.
- Renders refresh error while keeping last successful data.
- Renders not authorized state without readiness data.
- Renders empty station integrity state.

Integration tests:
- Calls `GET /v1/admin/launch-readiness` on route entry.
- Sends authorization token through shared admin client.
- Does not call station mutation endpoints.
- Does not call issue mutation endpoints.
- Does not call payment mutation endpoints.
- Refresh calls endpoint once per click.
- Blocker CTA routes to correct owner screen.
- Station row link routes to station detail.
- Query filters are preserved for issue, notification, and payment owner routes.
- Session expiration routes to sign-in with safe return path.

Accessibility tests:
- `screen-admin-launch-readiness` exists.
- Page has one `h1`.
- Blocked state is announced.
- Ready state is announced.
- Refresh state is announced.
- Station table has headers.
- Blocker list is navigable by keyboard.
- Action menus do not trap focus.
- Color is not the only indicator.
- Axe scan has no serious or critical violations.

End-to-end tests:
- `e2e-admin-launch-readiness-blocked-ready` loads blocked response and confirms blockers render.
- Same test loads ready response and confirms clear evidence renders.
- P1 issue blocker routes to issue queue with filters.
- Payment blocker routes to payment reconciliation.
- Receiver SMS blocker routes to outbound notifications.
- Station validation blocker routes to station validation owner.
- Unauthorized sender session cannot view route.

Visual regression tests:
- Desktop blocked state.
- Desktop ready state.
- Tablet blocked state.
- Mobile-width blocked state.
- Stale state.
- Error state.
- Empty station integrity state.

## Acceptance Criteria
The screen is complete only when:
- Route `/admin/launch-readiness` renders protected admin page.
- Primary test ID is `screen-admin-launch-readiness`.
- Screen reads only `admin_launch_readiness`.
- Backend `status` is the only readiness authority.
- Backend `goLiveEligible` is displayed.
- All blockers render.
- All system checks render.
- All stations render.
- P1 blockers are visually and structurally prioritized.
- P2 blockers remain visible.
- Every blocker has an owner action or explicit unavailable owner state.
- Ready state still shows evidence.
- Blocked state shows clear next actions.
- Stale state warns before launch decision.
- Loading, refresh, error, not authorized, and session expired states work.
- No mutation endpoints are called.
- No sensitive personal or payment data is shown.
- Accessibility tests pass.
- Relevant analytics events fire without sensitive payloads.

## Implementation Notes For Claude Code
Build this screen as a read-only admin route.

Use the shared API contract:
- `adminLaunchReadinessResponseSchema`
- operation key `admin_launch_readiness`
- endpoint `/v1/admin/launch-readiness`

Recommended component structure:
- `AdminLaunchReadinessPage`
- `LaunchReadinessHero`
- `LaunchReadinessSystemChecks`
- `LaunchReadinessBlockerList`
- `LaunchReadinessBlockerCard`
- `LaunchReadinessStationMatrix`
- `LaunchReadinessStationCard`
- `LaunchReadinessSnapshotMeta`
- `LaunchReadinessErrorState`

Required implementation boundaries:
- Do not implement actual station validation edits here.
- Do not implement payment reconciliation here.
- Do not implement notification retry here.
- Do not implement issue resolution here.
- Do not create frontend-only readiness rules.
- Do not add charts that obscure blocker evidence.
- Do not add public launch controls.

## Future Enhancements
Possible future additions after backend support:
- Launch approval workflow with named approvers.
- Readiness history timeline.
- Blocker owner assignment.
- Readiness export for release review.
- Station validation details embedded in drawer.
- Incident integration for active P1 blockers.
- Time-to-clear estimates from operational history.
- Launch corridor readiness grouping.

These enhancements must not be added until backend contracts and authorization rules exist.
