# AdminLaunchReadinessDetail Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminLaunchReadinessDetail` |
| Route | `/admin/launch-readiness/:blockerCode` |
| Primary test ID | `screen-admin-launch-readiness-detail` |
| Surface | Admin web console |
| Backend coverage | `admin_launch_readiness` through `GET /v1/admin/launch-readiness` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `blocked`, `resolved`, `invalid_code`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminLaunchReadiness`, protected admin shell |
| Related screens | `AdminLaunchReadiness`, `AdminStations`, `AdminStationDetail`, `AdminStationValidation`, `AdminStationStatusOverride`, `AdminIssueQueue`, `AdminPaymentReconciliation`, `AdminOutboundNotifications` |
| Current implementation mode | Read-only blocker explanation page backed by the full launch-readiness payload |

## Outcome
`AdminLaunchReadinessDetail` explains one launch blocker code deeply enough that an admin can understand the risk, identify every affected station or platform queue, and open the correct owner screen.

The screen must answer:
- `What does this blocker mean?`
- `Is this blocker active right now?`
- `How severe is it?`
- `Which stations or platform queues are affected?`
- `What backend evidence supports it?`
- `Which team or screen owns resolution?`
- `What must be true before this blocker clears?`
- `When was this decision generated?`

The screen must never become a second source of truth. It explains the backend launch gate. It does not approve launch and does not resolve blockers directly.

## Product Definition
This screen allows admins to:
- Open one blocker code from launch readiness.
- Read a plain-language explanation of the blocker.
- View whether that blocker is active in the current backend response.
- View all active blocker rows with the selected code.
- View affected stations when station-specific.
- View relevant system check values.
- View the exact backend messages for that code.
- Navigate to owner screens with correct filters.
- Refresh the launch-readiness response.
- Copy the blocker code.
- Return to the full launch-readiness screen.

It does not allow admins to:
- Mutate station validation.
- Override station status.
- Enable services.
- Resolve P1 issues.
- Resolve payment reconciliation records.
- Retry receiver SMS notifications.
- Create a launch approval.
- Mark a blocker resolved locally.
- Hide a backend blocker.
- Change blocker severity.
- Edit backend message text.
- View raw payment provider data.
- View raw notification content.
- View receiver phone numbers.
- View issue descriptions on this page.

## Route Parameter
Parameter:
```text
:blockerCode
```

Supported values:
- `station_validation_incomplete`
- `station_operationally_paused`
- `station_service_unavailable`
- `unresolved_p1_issue`
- `payment_reconciliation_review`
- `dead_letter_receiver_sms`

Invalid parameter behavior:
- Render `invalid_code`.
- Do not call owner screens automatically.
- Still offer link back to `/admin/launch-readiness`.
- Do not infer a blocker from a partial string.
- Do not normalize arbitrary text into a supported code.

Valid parameter with no active blocker:
- Render `resolved`.
- Explain that current backend data has no active blocker for this code.
- Still show the relevant clear evidence from `systemChecks` or station rows where possible.
- Do not claim history or prior blocker details unless backend history exists later.

## Users
Primary:
- `ops_admin` investigating station validation, station status, intake status, service availability, and station P1 issue blockers.
- `support_admin` investigating unresolved P1 issue blockers.
- `finance_admin` investigating payment reconciliation blockers.
- `super_admin` reviewing one blocker before go-live decision.

Secondary:
- QA validating every blocker code path.
- Security reviewers validating no sensitive detail leak.
- Engineering leads validating frontend explanation matches backend rules.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- Blocker card on `AdminLaunchReadiness`.
- Readiness hero primary action.
- Station row blocker action.
- Deployment runbook deep link.
- Browser reload at `/admin/launch-readiness/:blockerCode`.
- Internal release chat link.

The screen must not be reachable:
- Without admin authorization.
- From public web navigation.
- From receiver tracking.
- From sender mobile.
- From station operator mobile.
- From driver mobile.
- From courier mobile.

## Real-World Context
During pilot launch, one blocker can stop the entire network. A detail screen must reduce confusion by showing what the blocker means, why it matters, who owns it, and which exact backend evidence is active now.

Admins use this page when:
- The launch review finds a specific blocker.
- A team lead asks why launch is blocked.
- A station owner needs a focused action list.
- Finance must clear payment reconciliation review before launch.
- Support must clear P1 issue blockers.
- Engineering must investigate receiver SMS dead letters.

The page must support quick comprehension under time pressure. It must be structured like a decision brief, not a generic details page.

## User Goal
Primary goal:
- Understand and route one launch blocker to resolution.

Secondary goals:
- Confirm whether the blocker is still active.
- Confirm whether the blocker is station-specific or platform-wide.
- See every affected station for that blocker.
- See the exact count behind the blocker.
- Open the owner screen with filters already applied.
- Return to full readiness with context preserved.

## Scope
In scope:
- Read-only blocker explanation.
- Route parameter validation.
- Fetching the full launch-readiness response.
- Filtering active blockers by route code.
- Displaying selected blocker evidence.
- Showing resolved current-state for valid inactive code.
- Showing owner links.
- Showing relevant station rows.
- Showing relevant system checks.
- Handling loading, stale, refresh, error, unauthorized, and invalid states.
- Accessibility and analytics.

Out of scope:
- Editing station validation.
- Editing station status.
- Editing service availability.
- Resolving issues.
- Reconciling payments.
- Retrying notifications.
- Creating incident rooms.
- Creating release approvals.
- Showing historical blocker timeline.
- Showing internal logs.
- Showing raw payloads.

## Design Thesis
This screen should feel like a launch blocker dossier: focused, factual, and action-oriented.

Visual thesis:
- `blocker brief`: white-stone reading surface, sharp severity rail, compact evidence cards, clear owner route, and a right-side resolution checklist.

Design principles:
- Lead with active or resolved state.
- Explain one blocker only.
- Keep backend evidence visible.
- Separate explanation from action.
- Use station-specific and platform-wide layouts intentionally.
- Never make admins hunt for the owner screen.
- Preserve exact blocker code and backend message.

Restraint rule:
- No broad dashboards, no unrelated launch metrics, no decorative incident graphics, no local readiness score, and no status copy that goes beyond backend evidence.

## Research Inputs
Relevant external references:
- [Google SRE reliable product launches](https://sre.google/sre-book/reliable-product-launches/): supports launch blocker review as a reliability practice with clear pre-launch checks.
- [Atlassian major incident management process](https://www.atlassian.com/incident-management/itsm/major-incident-management): supports severity, ownership, delegation, and resolution clarity for urgent operational problems.
- [Atlassian incident response handbook](https://www.atlassian.com/incident-management/handbook/incident-response): supports shared context, severity language, and action-oriented incident state records.
- [USWDS breadcrumb](https://designsystem.digital.gov/components/breadcrumb/): supports orientation on an interior admin detail page.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports highlighting the few key facts and next steps for a dense details page.
- [USWDS alert component](https://designsystem.digital.gov/components/alert/): supports critical, warning, success, and error status communication.
- [Material Design cards](https://m3.material.io/components/cards/overview): supports grouped evidence and owner action panels.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing blocked, resolved, refresh, and error state changes.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard movement through summary, evidence, owners, and station rows.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/03-admin-launch-readiness.md`
- `docs/07-api/api-contracts.md`
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

## Backend Contract
Endpoint:
```http
GET /v1/admin/launch-readiness
```

Operation:
```text
admin_launch_readiness
```

Route-to-data rule:
- Fetch the full launch-readiness response.
- Validate `:blockerCode` against `launchReadinessBlockerCodeSchema`.
- Select `response.blockers.filter((blocker) => blocker.code === blockerCode)`.
- Use `response.stations` to resolve station names and station evidence.
- Use `response.systemChecks` to show platform-wide evidence.
- Do not call a separate blocker detail endpoint.

Current response shape:
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

## Blocker Knowledge Map
`station_validation_incomplete`
- Type: station-specific.
- Usual severity: P1 from current backend logic.
- Meaning: one or more launch station validation checks are incomplete or not go-live eligible.
- Evidence fields: station `goLiveEligible`, `validationStatus`, `validationBlockerCount`, `updatedAt`.
- System check: `stationValidation.readyStations` and `stationValidation.totalStations`.
- Owner screen: `AdminStationValidation`.
- Primary route: `/admin/stations/:stationId/validation`.
- Clear condition: every launch station is go-live eligible.
- Resolution copy: `Complete station validation and clear all station validation blockers.`

`station_operationally_paused`
- Type: station-specific.
- Usual severity: P1 from current backend logic.
- Meaning: station is not active or intake is not open.
- Evidence fields: station `operatingStatus`, `intakeStatus`, `updatedAt`.
- System check: station row evidence only.
- Owner screen: `AdminStationStatusOverride` or `AdminStationDetail`.
- Primary route: `/admin/stations/:stationId/status`.
- Clear condition: station is active and intake is open.
- Resolution copy: `Review station status and intake availability before launch.`

`station_service_unavailable`
- Type: station-specific.
- Usual severity: P2 from current backend logic.
- Meaning: station does not have every launch service enabled.
- Evidence fields: `serviceAvailability.standard`, `serviceAvailability.express`, `serviceAvailability.doorstep`.
- System check: station row evidence only.
- Owner screen: `AdminStationDetail`.
- Primary route: `/admin/stations/:stationId`.
- Clear condition: standard, express, and doorstep services are enabled for every launch station.
- Resolution copy: `Enable every launch service or keep launch blocked.`

`unresolved_p1_issue`
- Type: station-specific when `stationId` exists.
- Usual severity: P1 from current backend logic.
- Meaning: station has one or more unresolved P1 issues.
- Evidence fields: station `unresolvedP1IssueCount`, blocker `count`.
- System check: `unresolvedP1Issues.count`.
- Owner screen: `AdminIssueQueue`.
- Primary route: `/admin/issues?severity=p1&status=open&stationId=:stationId`.
- Clear condition: unresolved P1 issue count is zero.
- Resolution copy: `Triage and resolve P1 issues before launch.`

`payment_reconciliation_review`
- Type: platform-wide.
- Usual severity: P1 from current backend logic.
- Meaning: one or more payment records need reconciliation review.
- Evidence fields: blocker `count`.
- System check: `paymentReconciliation.reviewRequiredCount`.
- Owner screen: `AdminPaymentReconciliation`.
- Primary route: `/admin/payment-reconciliation`.
- Clear condition: payment reconciliation review count is zero.
- Resolution copy: `Clear all payment reconciliation review records before launch.`

`dead_letter_receiver_sms`
- Type: platform-wide.
- Usual severity: P1 from current backend logic.
- Meaning: receiver SMS notifications are in dead-letter state.
- Evidence fields: blocker `count`.
- System check: `receiverSms.deadLetterCount`.
- Owner screen: `AdminOutboundNotifications`.
- Primary route: `/admin/outbound-notifications?channel=sms&status=dead_letter`.
- Clear condition: receiver SMS dead-letter count is zero.
- Resolution copy: `Clear receiver SMS dead-letter records before launch.`

## Required Layout
Desktop layout:
- Protected admin shell.
- Breadcrumb.
- Detail header.
- Status summary box.
- Two-column body.
- Main column:
  - Active blocker evidence or resolved evidence.
  - Affected stations or platform queue evidence.
  - Backend messages.
  - Clear condition.
- Side column:
  - Owner action panel.
  - Related system checks.
  - Snapshot metadata.
  - Related links.

Tablet layout:
- Header and summary box full width.
- Evidence cards in one or two columns depending on width.
- Affected station table below evidence.
- Owner action panel above related links.

Mobile-width web layout:
- Single column.
- Breadcrumb collapses safely.
- Summary box first.
- Primary owner CTA immediately after summary.
- Evidence cards follow.
- Station rows become stacked cards.
- Related links appear last.

Minimum content order:
1. Skip link.
2. Admin shell.
3. Breadcrumb.
4. Page title.
5. Snapshot freshness.
6. Selected blocker status.
7. Primary owner action.
8. Active blocker evidence or resolved evidence.
9. Affected station or platform queue section.
10. Clear condition.
11. Related system checks.
12. Backend messages.
13. Related links.

## Breadcrumb
Breadcrumb path:
- `Admin`
- `Launch readiness`
- `{Blocker label}`

Behavior:
- `Admin` links to `/admin`.
- `Launch readiness` links to `/admin/launch-readiness`.
- Current page uses `aria-current="page"`.
- Use readable blocker label, not raw code, as current page text.

Accessibility:
- Use `nav` with `aria-label="Breadcrumbs"`.
- Use ordered list semantics.
- Hide visual separators from assistive technology.
- Keep tap targets usable on small widths.

## Page Header
Title format:
```text
{Blocker label}
```

Subtitle when active:
```text
This launch blocker is active in the current backend readiness response.
```

Subtitle when resolved:
```text
This blocker code is clear in the current backend readiness response.
```

Header metadata:
- `Generated {relative time}`
- `Source: admin_launch_readiness`
- `Route code: {blockerCode}`

Header actions:
- `Refresh`
- `Back to launch readiness`
- `Copy blocker code`

Refresh behavior:
- Refetches `GET /v1/admin/launch-readiness`.
- Keeps current response visible while refreshing.
- Recomputes active or resolved state after response.
- Announces state changes.

## Status Summary Box
Active summary:
- Label: `Active blocker`
- Severity badge: `P1` or `P2`
- Active instance count.
- Affected station count when station-specific.
- Platform-wide label when no station ID exists.
- Highest priority owner action.

Resolved summary:
- Label: `Current state clear`
- Text: `The latest backend readiness response has no active {blocker label} blocker.`
- Evidence: relevant zero or clear value.
- CTA: `Back to launch readiness`.

Invalid code summary:
- Label: `Unknown blocker code`
- Text: `This route does not match a supported launch-readiness blocker code.`
- CTA: `Back to launch readiness`.

Summary box must include:
- Exact blocker code.
- Exact current status.
- Exact generated timestamp.
- Backend source.

Summary box must not:
- Claim permanent resolution.
- Claim historical status.
- Hide active blockers when route code is valid.
- Use owner action as a substitute for explanation.

## Active Blocker Evidence
For active route code, render every matching blocker.

Each active blocker card shows:
- Severity.
- Backend message.
- Station name and ID when station-specific.
- Platform-wide label when no station ID.
- Count when present.
- Owner screen.
- Primary CTA.
- Clear condition.
- Generated timestamp.

Card title format:
- Station-specific: `{Station name}: {Blocker label}`
- Platform-wide: `{Blocker label}`

Card body:
- Use backend `message` exactly enough to preserve meaning.
- Do not expand into unsupported cause analysis.
- Do not rewrite severity.

Evidence chips:
- `Code: {blockerCode}`
- `Severity: {severity}`
- `Count: {count}` when provided.
- `Station: {stationId}` when provided.

If multiple active blockers match:
- Show count in summary.
- Group station-specific blockers by city then station name.
- Keep platform-wide blocker first for platform-wide codes.

## Resolved Current-State View
Resolved state appears when:
- Route code is valid.
- Fetch succeeds.
- No `response.blockers` have the selected code.

Resolved view content:
- Success status panel.
- Explanation of what clear means for this code.
- Relevant clear evidence.
- Link back to full launch readiness.
- Link to owner screen for audit review when useful.

Resolved view must say:
```text
No active blocker with this code is present in the latest backend readiness response.
```

Resolved view must not say:
- `This was resolved by X.`
- `This will stay clear.`
- `Launch is approved.`
- `No action is needed anywhere.`

If full launch readiness status is still blocked:
- Show warning:
```text
Other launch blockers are still active.
```
- Provide link to `/admin/launch-readiness`.
- Show count of remaining blockers.

If full launch readiness status is ready:
- Show:
```text
All backend launch-readiness blockers are clear.
```
- Provide deployment runbook link.

## Invalid Code State
Invalid code state appears when route parameter is not one of the supported blocker codes.

Content:
- Title: `Unknown launch blocker`
- Body: `The blocker code in this URL is not supported by the backend launch-readiness contract.`
- Primary CTA: `Back to launch readiness`
- Secondary CTA: `Copy invalid code`

Rules:
- Do not call owner routes.
- Do not attempt fuzzy matching.
- Do not redirect silently.
- Emit analytics event `admin_launch_readiness_detail_invalid_code_seen`.

## Affected Station Section
Show when selected code can be station-specific:
- `station_validation_incomplete`
- `station_operationally_paused`
- `station_service_unavailable`
- `unresolved_p1_issue`

Station rows should include:
- Station name.
- Station ID.
- City.
- Current station eligibility.
- Validation status.
- Operating status.
- Intake status.
- Service availability.
- Unresolved P1 issue count.
- Validation blocker count.
- Last updated.
- Owner action.

Filtering:
- For active state, show stations directly affected by matching blockers.
- For resolved state, show relevant clear station evidence if useful.
- For station validation resolved state, show all stations with validation summary.
- For service unavailable resolved state, show all stations with service availability summary.
- For unresolved P1 resolved state, show all stations with P1 counts.

Station row actions:
- `Open station`
- `Open validation`
- `Open P1 issues`
- `Open station status`

Rules:
- Do not add station rows that are not in backend response.
- Do not hide stations with the selected active blocker.
- Do not treat active queue count as a blocker unless backend sends a matching blocker.

## Platform Queue Section
Show when selected code is platform-wide:
- `payment_reconciliation_review`
- `dead_letter_receiver_sms`

Payment reconciliation detail evidence:
- `reviewRequiredCount`
- Blocker `count` when present.
- Status: blocked when count greater than zero or active blocker exists.
- Owner route: `/admin/payment-reconciliation`.

Receiver SMS detail evidence:
- `deadLetterCount`
- Blocker `count` when present.
- Status: blocked when count greater than zero or active blocker exists.
- Owner route: `/admin/outbound-notifications?channel=sms&status=dead_letter`.

Platform queue section must not:
- Show raw payment records.
- Show raw webhook payloads.
- Show receiver phone numbers.
- Show SMS content.
- Retry messages.
- Reconcile payments.

## Clear Condition Section
Every detail page must state the clear condition.

Clear condition content:
- `What must be true`
- `Backend fields that prove it`
- `Owner screen`
- `What this page cannot do`

For station validation:
- Must be true: all launch stations are go-live eligible.
- Proof fields: station `goLiveEligible`, `validationStatus`, `validationBlockerCount`.
- Owner: station validation.

For station paused:
- Must be true: station is active and intake is open.
- Proof fields: `operatingStatus`, `intakeStatus`.
- Owner: station status.

For service unavailable:
- Must be true: standard, express, and doorstep services are all enabled.
- Proof fields: `serviceAvailability`.
- Owner: station detail.

For unresolved P1:
- Must be true: unresolved P1 issue count is zero.
- Proof fields: `unresolvedP1IssueCount`, `systemChecks.unresolvedP1Issues.count`.
- Owner: issue queue.

For payment reconciliation:
- Must be true: review required count is zero.
- Proof fields: `systemChecks.paymentReconciliation.reviewRequiredCount`.
- Owner: payment reconciliation.

For receiver SMS:
- Must be true: dead-letter count is zero.
- Proof fields: `systemChecks.receiverSms.deadLetterCount`.
- Owner: outbound notifications.

## Owner Action Panel
The owner action panel is the main action area.

Fields:
- Owner screen.
- Primary CTA.
- Secondary CTA when applicable.
- Required capability note when known.
- Route preview.
- Warning if route is not implemented yet.

Owner mapping:
- `station_validation_incomplete`: `Station validation`
- `station_operationally_paused`: `Station status`
- `station_service_unavailable`: `Station detail`
- `unresolved_p1_issue`: `Issue queue`
- `payment_reconciliation_review`: `Payment reconciliation`
- `dead_letter_receiver_sms`: `Outbound notifications`

Primary CTA rules:
- Station-specific active blocker with one station: route directly to station-specific owner.
- Station-specific active blocker with many stations: route to filtered station list or show station rows first.
- Platform-wide blocker: route directly to platform owner queue.
- Resolved state: route remains available for audit, but primary action should be back to launch readiness.

Action disabled rule:
- If future owner route is absent, render disabled action with text `Owner screen not implemented yet`.
- Do not route to a nearby unrelated screen.

## Backend Messages Section
Show backend messages for the selected code.

Active state:
- Render every matching blocker message.
- Preserve station context.
- Show message in quotes or message panel.
- Do not edit the message except for safe HTML escaping.

Resolved state:
- Do not show old messages because backend response does not provide history.
- Show `No active backend messages for this blocker code.`

Invalid code:
- Do not show backend messages.

Rules:
- Escape all message content.
- Do not use `dangerouslySetInnerHTML`.
- Do not send messages to analytics.

## Related System Checks
Show only checks relevant to selected code plus total launch status.

Always show:
- Overall backend readiness status.
- Total blockers.
- Generated timestamp.

Station validation code:
- Show `readyStations`.
- Show `totalStations`.

Unresolved P1 code:
- Show `unresolvedP1Issues.count`.

Payment reconciliation code:
- Show `paymentReconciliation.reviewRequiredCount`.

Receiver SMS code:
- Show `receiverSms.deadLetterCount`.

Station paused and service unavailable:
- Show affected station count.
- Show station row evidence.

Do not show unrelated metrics in the top summary.

## Loading State
Initial loading:
- Show breadcrumb skeleton.
- Show title skeleton.
- Show summary box skeleton.
- Show owner panel skeleton.
- Show evidence skeleton.
- Announce `Loading launch blocker detail`.

Rules:
- Do not render resolved before fetch completes.
- Do not render invalid if route validation is still loading.
- Route validation can occur before fetch, but final state still depends on fetch for active/resolved.

Refreshing:
- Keep current detail visible.
- Show refresh progress near timestamp.
- Announce `Refreshing launch blocker detail`.
- Recompute state after response.
- If active changes to resolved, announce `This launch blocker is now clear in the latest backend response`.
- If resolved changes to active, announce `This launch blocker is active in the latest backend response`.

## Stale State
Use the same freshness policy as `AdminLaunchReadiness`.

Recommended threshold:
- `generatedAt` older than 5 minutes: stale warning.
- `generatedAt` older than 15 minutes: stronger stale warning.

Stale warning:
```text
This blocker detail may be stale. Refresh before making a launch decision.
```

Rules:
- Do not change active or resolved status locally.
- Do not hide evidence.
- Do not claim a blocker cleared from stale data.
- Keep owner links available.

## Error States
`not_authorized`:
- Title: `Admin access required`
- Body: `Your current account cannot view launch blocker details.`
- CTA: `Return to admin sign in`
- Do not reveal blocker status.

`session_expired`:
- Title: `Session expired`
- Body: `Sign in again to review launch blocker details.`
- CTA: `Sign in again`
- Preserve safe return path.

`api_error`:
- Title: `Launch blocker detail unavailable`
- Body: `The backend launch-readiness response could not be loaded. Do not make a launch decision from this page until it refreshes successfully.`
- CTA: `Retry`
- Secondary CTA: `Back to launch readiness`
- Show request ID when available.

`rate_limited`:
- Title: `Too many refresh attempts`
- Body: `Wait a moment before refreshing this blocker detail again.`
- CTA: `Try again later`

Error rules:
- Never show raw response errors.
- Never expose stack traces.
- Never infer state from route code alone.
- Never show stale data without stale label.

## Navigation
Primary navigation:
- Back to launch readiness.
- Open owner screen.
- Open related station.
- Open deployment runbook.

Secondary navigation:
- Admin overview.
- Related system queue.
- Related station detail.

Deep-link behavior:
- Route must be shareable inside authenticated admin context.
- Reloading the page must fetch current readiness data.
- Invalid code must not redirect silently.
- Query params must be preserved only when safe and supported.

Focus behavior:
- On page load, focus page title.
- On refresh state change, announce through status region.
- On invalid code, focus invalid code alert.
- On owner CTA click, normal route navigation.

## Content And Copy
Tone:
- Clear.
- Specific.
- Calm under pressure.
- Operational.
- Evidence-led.

Use:
- `active`
- `clear`
- `blocked`
- `resolved in current response`
- `owner screen`
- `backend evidence`
- `clear condition`

Avoid:
- `fixed`
- `permanently resolved`
- `safe to launch`
- `approved`
- `frontend decision`
- `probably`
- `ignore`

Common copy:
- Active label: `Active in current response`
- Resolved label: `Clear in current response`
- Owner label: `Resolution owner`
- Evidence label: `Backend evidence`
- Clear condition label: `Clear condition`
- Source label: `Source: admin_launch_readiness`

## Visual System
Color:
- Use same admin console palette as `AdminLaunchReadiness`.
- Critical red for active P1.
- Amber for active P2 and stale.
- Green for resolved current-state.
- Blue-gray for informational evidence.

Typography:
- Blocker title must be prominent.
- Code appears in monospace.
- Counts use tabular numerals.
- Owner CTA label must be short.

Layout:
- Summary box has the strongest visual weight after title.
- Owner panel stays visible near top.
- Evidence sections are grouped and titled.
- Related links are lower weight.

Motion:
- Use minimal page reveal.
- Refresh indicator only.
- No pulsing critical cards.
- Respect `prefers-reduced-motion`.

## Accessibility Requirements
Semantic structure:
- One `h1`.
- Breadcrumb `nav`.
- Summary box region with heading.
- Active blocker list as list.
- Station data as table on desktop.
- Station cards as list on mobile-width layouts.
- Owner actions as links.
- Refresh as button.

Status announcements:
- Loading detail.
- Active blocker loaded.
- Resolved blocker loaded.
- Invalid code.
- Refresh started.
- Refresh completed.
- Refresh failed.
- Active to resolved transition.
- Resolved to active transition.

Keyboard:
- Skip link to main content.
- Breadcrumb links reachable.
- Refresh reachable.
- Owner CTA reachable before long evidence.
- Station row actions reachable.
- Copy code button reachable.
- No focus trap.

Screen reader:
- Include severity in text.
- Include exact count units.
- Include exact generated timestamp.
- Include station name and ID when available.
- Do not rely on icon-only labels.

Contrast:
- Badges meet WCAG AA.
- Disabled owner action remains readable.
- Warning and critical panels meet text contrast.

## Security And Privacy
Security rules:
- Require admin authorization before fetching or rendering data.
- Do not store response in local storage.
- Do not store response in indexed database.
- Do not put backend message text into URL.
- Do not emit backend message text into analytics.
- Do not log full response to console.
- Do not expose raw payment records.
- Do not expose raw notification content.
- Do not expose receiver phone numbers.
- Do not expose issue details beyond counts and route ownership.

Privacy rules:
- Station name, city, and station ID are allowed because the endpoint returns them for admin operations.
- Issue counts are allowed; issue content is not shown.
- Payment review counts are allowed; payment records are not shown.
- Receiver SMS dead-letter counts are allowed; phone numbers and message bodies are not shown.

Authorization nuance:
- All admin roles that can view launch readiness can view this detail.
- Owner screens may have stricter capability requirements.
- If owner action is denied after navigation, owner screen handles denied state.
- This detail page should still show the blocker to every authorized admin role.

## Data Handling
Fetch policy:
- Fetch on route entry.
- Refetch on manual refresh.
- Refetch when tab regains focus after stale threshold.
- Do not poll continuously by default.

Cache policy:
- In-memory only.
- Clear on sign out.
- Do not persist across browser restart.

Parsing:
- Validate route code before rendering content.
- Validate API response against shared contract where frontend architecture supports it.
- Escape backend message.
- Parse timestamps as ISO strings.

Resilience:
- Unknown station ID in blocker still renders station ID.
- Missing optional count hides count evidence, not blocker card.
- Missing optional station ID means platform-wide blocker.
- If station row exists but does not match blocker evidence, show both with data integrity warning.

Data integrity warnings:
- Active station-specific blocker references unknown station.
- Active blocker count conflicts with system check count.
- Backend status is `ready` while selected blocker is active.
- Backend status is `blocked` with no blockers.

Warnings must be visible and must emit non-sensitive analytics.

## Analytics
Emit:
- `admin_launch_readiness_detail_viewed`
- `admin_launch_readiness_detail_refreshed`
- `admin_launch_readiness_detail_owner_clicked`
- `admin_launch_readiness_detail_station_clicked`
- `admin_launch_readiness_detail_copy_code_clicked`
- `admin_launch_readiness_detail_invalid_code_seen`
- `admin_launch_readiness_detail_stale_seen`
- `admin_launch_readiness_detail_error_seen`
- `admin_launch_readiness_detail_active_to_resolved`
- `admin_launch_readiness_detail_resolved_to_active`
- `admin_launch_readiness_detail_integrity_warning_seen`

Event properties:
- `blockerCode`
- `isValidCode`
- `state`
- `status`
- `goLiveEligible`
- `severity`
- `activeInstanceCount`
- `affectedStationCount`
- `hasPlatformWideBlocker`
- `ownerScreen`
- `generatedAtAgeBucket`

Do not emit:
- Backend message text.
- Station name.
- User email.
- Raw response.
- Payment references.
- Receiver data.
- Issue content.

## Test Plan
Unit tests:
- Validates supported blocker codes.
- Renders invalid code state.
- Fetches launch readiness for valid code.
- Filters blockers by route code.
- Renders active P1 summary.
- Renders active P2 summary.
- Renders resolved current-state when no matching blocker.
- Shows remaining blocker warning when selected code is clear but launch remains blocked.
- Shows all-clear message when selected code is clear and launch is ready.
- Renders station-specific evidence.
- Renders platform-wide evidence.
- Resolves station name from station ID.
- Falls back to station ID when station row missing.
- Renders clear condition for each code.
- Renders owner action for each code.
- Hides optional count when absent.
- Shows stale warning after threshold.
- Keeps current data while refreshing.
- Renders refresh failure state.
- Escapes backend message text.

Integration tests:
- Route `/admin/launch-readiness/unresolved_p1_issue` loads detail.
- Route `/admin/launch-readiness/payment_reconciliation_review` loads detail.
- Route `/admin/launch-readiness/dead_letter_receiver_sms` loads detail.
- Invalid route param does not call owner route.
- Owner CTA for station validation includes station ID.
- Owner CTA for unresolved P1 includes station ID filter when present.
- Owner CTA for payment goes to reconciliation route.
- Owner CTA for receiver SMS goes to outbound notifications filtered route.
- Copy code copies canonical code only.
- Session expiration routes to sign-in with safe return path.

Accessibility tests:
- `screen-admin-launch-readiness-detail` exists.
- Page has one `h1`.
- Breadcrumb uses nav and ordered list semantics.
- Active state is announced.
- Resolved state is announced.
- Invalid code state is announced.
- Refresh status is announced.
- Owner action is keyboard reachable.
- Station rows have accessible labels.
- Axe scan has no serious or critical violations.

End-to-end tests:
- Admin opens blocker detail from launch readiness blocker card.
- Active station validation blocker detail routes to station validation owner.
- Active unresolved P1 blocker detail routes to issue queue with filters.
- Active payment blocker detail routes to payment reconciliation.
- Active receiver SMS blocker detail routes to outbound notifications.
- Valid inactive blocker code renders resolved current-state.
- Invalid blocker code renders invalid route state.
- Unauthorized sender session cannot view route.

Visual regression tests:
- Active P1 station-specific detail.
- Active P2 station-specific detail.
- Active platform-wide detail.
- Resolved current-state detail.
- Invalid code detail.
- Stale active detail.
- API error detail.
- Mobile-width active P1 detail.

## Acceptance Criteria
The screen is complete only when:
- Route `/admin/launch-readiness/:blockerCode` renders protected admin detail.
- Primary test ID is `screen-admin-launch-readiness-detail`.
- Supported blocker codes match `launchReadinessBlockerCodeSchema`.
- Invalid code state works.
- Screen reads `admin_launch_readiness`.
- No separate detail endpoint is invented.
- Active blockers for selected code render.
- Resolved current-state renders when selected code is absent.
- Owner route is clear for every supported code.
- Station-specific blockers show station evidence.
- Platform-wide blockers show system check evidence.
- Backend messages are safely rendered.
- Clear condition is stated for every code.
- Refresh and stale states work.
- Unauthorized and session expired states work.
- No mutation endpoints are called.
- No sensitive personal, payment, notification, or issue content is shown.
- Analytics omit sensitive payloads.
- Accessibility tests pass.

## Implementation Notes For Claude Code
Build this screen as a read-only route that reuses the launch-readiness API.

Use:
- `adminLaunchReadinessResponseSchema`
- `launchReadinessBlockerCodeSchema`
- operation key `admin_launch_readiness`
- endpoint `/v1/admin/launch-readiness`

Recommended component structure:
- `AdminLaunchReadinessDetailPage`
- `LaunchBlockerBreadcrumb`
- `LaunchBlockerSummary`
- `LaunchBlockerOwnerPanel`
- `LaunchBlockerEvidenceList`
- `LaunchBlockerStationEvidence`
- `LaunchBlockerPlatformEvidence`
- `LaunchBlockerClearCondition`
- `LaunchBlockerMessages`
- `LaunchBlockerDetailErrorState`

Required implementation boundaries:
- Do not implement station edits here.
- Do not implement issue resolution here.
- Do not implement payment reconciliation here.
- Do not implement notification retry here.
- Do not implement launch approval here.
- Do not create local readiness rules.
- Do not show unrelated dashboards.
- Do not store backend payload in durable browser storage.

## Future Enhancements
Possible additions after backend support:
- Blocker history.
- Owner assignment.
- Incident room link.
- Resolution audit trail.
- Comment thread.
- Readiness decision export.
- Direct station validation detail embed.
- Cross-blocker dependency graph.

These enhancements require backend contracts and authorization rules before UI implementation.
