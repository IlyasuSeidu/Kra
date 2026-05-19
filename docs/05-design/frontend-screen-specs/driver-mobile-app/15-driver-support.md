# DriverSupport Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverSupport` |
| Route | `/(ops)/driver/support` |
| Primary test ID | `screen-driver-support` |
| Surface | Driver mobile app |
| Backend coverage | `create_issue` through `POST /v1/issues`; optional scoped issue refresh through `list_issues` when available |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | Driver may create delivery-scoped support issues through backend delivery access policy |
| Primary mutation | `create_issue` |
| Supporting reads | `get_delivery`, `list_deliveries`, optional `list_issues`, local offline outbox |
| Parent screens | `DriverHome`, `AssignedRuns`, `AssignedRunDetail`, `DriverManifest`, `DriverOriginPickupScan`, `DriverRoute`, `DriverDestinationArrival`, `DriverDestinationHandoff`, `DriverHistory`, `DriverEarnings` |
| Related routes | `/(ops)/driver/runs`, `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/history`, `/(ops)/driver/earnings`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/offline-outbox` |
| Current implementation mode | Delivery-scoped issue creation and support triage; no general account ticket API |

## Product Job
`DriverSupport` lets a driver report a run problem with enough structure for operations to act without losing delivery context.

The screen answers:

- `Which run is the issue about?`
- `What has gone wrong?`
- `How urgent is it?`
- `What concise details does support need?`
- `Can I submit now or safely queue it offline?`
- `What happens after the report is created?`

## Product Standard
This is a field operations safety screen. It must be fast, calm, and precise.

The driver should be able to:

- Open support from any driver workflow.
- Keep the delivery context visible.
- Select a clear category.
- Select a severity with operational guidance.
- Add a concise summary.
- Add optional details.
- Submit with idempotency protection.
- Queue the report offline when safe.
- See the created issue reference after server success.
- Open offline outbox after local queueing.
- Return to the run flow without losing work.

The screen must never:

- Create an issue without a delivery ID under the current API.
- Let the driver resolve, close, or escalate support issues.
- Mutate delivery lifecycle status.
- Transfer custody.
- Replace station receipt or proof workflows.
- Reveal receiver phone, full receiver address, raw package scan code, proof asset path, payment provider reference, or internal staff IDs.
- Treat an offline queued support issue as server-created.
- Use vague categories that make support triage slower.
- Ask the driver to type long narrative reports while in active field work.

## Current API Boundary
The current backend only supports delivery-scoped issue creation.

Allowed:

- Create an issue when the driver has access to the delivery.
- List issues for accessible deliveries when the shared issue list endpoint is available.
- Get a delivery for safe context display.
- Queue the same `create_issue` request with an idempotency key when offline policy allows.

Not available:

- General account support tickets.
- Driver payout account support without delivery context.
- Live chat.
- Phone escalation state tracking.
- Issue comments.
- Driver-side issue resolution.
- Driver-side issue escalation.
- Support attachment upload.

If the driver opens this route without a delivery context, the screen must help them select an accessible active or recent run. If no run can be selected, show a clear boundary state rather than creating an unscoped ticket.

## Audience
Primary audience:

- Assigned line-haul driver reporting a problem during pickup, transit, destination handoff, or run review.

Secondary audience:

- Station operators receiving the report.
- Support admins triaging issue queues.
- Ops admins reviewing P1 and P2 incidents.
- QA validating offline issue creation and access boundaries.
- Security reviewers checking redaction.
- Claude Code implementing the route and tests.

## Context Of Use
The driver may be:

- Standing at the origin station.
- Waiting for package scan confirmation.
- In a vehicle before departure.
- Stopped safely during transit.
- At the destination station.
- Reviewing a completed run.
- Recovering from an offline outbox failure.
- Checking an earning or payment concern that must be tied to a delivery.

The screen must assume stress, time pressure, poor network, and operational consequences. It should ask only for the information that improves triage.

## Design Brief
User and job:

- A driver needs to report a run problem without losing the run workflow.

Context:

- Mobile field use, intermittent network, high consequence for lost packages, custody conflicts, and delays.

Entry point:

- Driver support route with optional `deliveryId`, `category`, `severity`, `reason`, `sourceRoute`, and `queuedActionId` query values.

Success state:

- Server creates an `open` issue, or local outbox stores a durable support issue action awaiting sync.

Primary action:

- `Submit report`

Navigation model:

- Single focused support form with a delivery selector when context is missing.

Density level:

- Medium-low: context card, category grid, severity selector, short fields, submit panel, recovery routes.

Visual thesis:

- `Run issue cockpit`: a compact safety-grade report surface with a strong context header, priority strip, and one anchored action.

Restraint rule:

- Do not add chat, maps, proof upload, staff assignment, issue resolution, or lifecycle mutation controls.

## External Research Used
Only directly relevant sources were used:

- [Uber Help: support options for drivers](https://help.uber.com/driving-and-delivering/article/support-options-for-drivers?nodeId=c5b8be6d-d836-4b06-9c04-1bad02fb1bad): supports category-led driver support routing and agent contact after issue selection.
- [DoorDash Dasher support](https://dasher.doordash.com/en-us/blog/contact-dasher-support): supports fast in-app support access for live delivery issues, with enough delivery detail to help support respond.
- [Zendesk urgency guidance](https://support.zendesk.com/hc/en-us/articles/4563525691546-How-do-I-indicate-the-urgency-of-my-issue-when-I-contact-Zendesk): supports severity selection based on business impact and later support-side reassessment.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports descriptive form errors tied to fields.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit, queued, retry, and success updates.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for category, severity, and submit actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/04-assigned-run-detail.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/06-driver-manifest.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/07-driver-origin-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/09-driver-route.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/10-driver-mark-in-transit.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/11-driver-destination-arrival.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/12-driver-destination-handoff.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/13-driver-history.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/14-driver-earnings.md`
- `docs/02-users/support-and-escalation-rules.md`
- `docs/11-ops/customer-support-workflows.md`
- `docs/11-ops/incident-management.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/issues.ts`
- `services/api/src/routes.ts`

## Backend Contract
Primary mutation:

- Operation key: `create_issue`
- HTTP route: `POST /v1/issues`
- Request schema: `createIssueRequestSchema`
- Response schema: `issueResponseSchema`
- Error schema: `apiErrorResponseSchema`
- Idempotency: send `Idempotency-Key`

Request:

```json
{
  "deliveryId": "DEL-ACC-KSI-001",
  "category": "handoff",
  "severity": "p2",
  "summary": "Destination station cannot receive package",
  "description": "Operator says station scanner is unavailable and asks me to wait."
}
```

Request validation:

- `deliveryId` must match `DEL-*`.
- `category` must be one of `delay`, `damage`, `loss`, `payment`, `handoff`, `other`.
- `severity` must be one of `p1`, `p2`, `p3`.
- `summary` is required, trimmed, minimum `5`, maximum `160`.
- `description` is optional, trimmed, minimum `5`, maximum `500`.

Response:

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

Server behavior:

- Delivery must exist.
- Backend confirms driver access through delivery access policy.
- New issue starts as `open`.
- Reporter is derived from authenticated actor.
- Driver cannot set reporter fields.
- Driver cannot set issue status.
- Driver cannot set escalation fields.
- Driver cannot set resolution fields.

Optional reads:

- `GET /v1/deliveries/:id` for safe delivery context.
- `GET /v1/issues?deliveryId=<deliveryId>&limit=20` for existing visible issues if enabled.
- `GET /v1/deliveries?limit=100` for active and recent run selection if no route delivery ID exists.

## Backend Non-Negotiables
- `create_issue` requires delivery context.
- Use backend access policy as authority.
- Do not calculate issue access locally.
- Do not mutate delivery status from this screen.
- Do not submit support actions without idempotency.
- Do not create a second request when retrying the same body.
- Do not show queued offline issue as server-created.
- Do not let a driver call `escalate_issue` or `resolve_issue`.
- Do not expose admin-only issue fields.

## Role And Permission Rules
Allowed:

- Authenticated driver with accessible delivery.
- Driver opening from an assigned run.
- Driver opening from a recently completed accessible run.
- Driver opening from offline action recovery with persisted delivery context.

Blocked:

- Unauthenticated user.
- Non-driver role on this route.
- Driver without access to selected delivery.
- Missing delivery context when no accessible run can be selected.
- Delivery ID with invalid shape.

Copy for role block:

- Title: `Driver support is not available here`
- Body: `This route is for driver run reports. Return to your role home or sign in with a driver account.`
- Primary action: `Back to role home`

## Query Parameters
Accepted query values:

- `deliveryId`
- `category`
- `severity`
- `reason`
- `sourceRoute`
- `queuedActionId`

Rules:

- Validate `deliveryId` shape before any API call.
- Use `category` only if it matches the allowed category enum.
- Use `severity` only if it matches the allowed severity enum.
- Use `reason` only for local copy and analytics after sanitization.
- Use `sourceRoute` only for safe return navigation.
- Use `queuedActionId` only to connect recovery context, not to expose local outbox internals.
- Ignore unknown query values.
- Never store raw query string in analytics.

Recommended prefill mapping:

| Source reason | Category | Severity | Summary seed |
| --- | --- | --- | --- |
| `cannot_take_run` | `delay` | `p2` | `I cannot take this run` |
| `package_issue` | `damage` | unset | `Package condition needs review` |
| `scan_mismatch` | `handoff` | `p2` | `Package scan does not match` |
| `custody_conflict` | `handoff` | `p1` | `Custody record does not match handoff` |
| `missing_package` | `loss` | `p1` | `Package cannot be found` |
| `destination_blocked` | `handoff` | `p2` | `Destination handoff is blocked` |
| `payment_blocked` | `payment` | `p2` | `Payment state is blocking this run` |
| `route_delay` | `delay` | `p2` | `Transit delay needs support review` |
| `earnings_question` | `other` | `p3` | `Earnings question for this run` |

If severity is prefilled as `p1`, still show P1 confirmation before submit.

## Category Model
Allowed categories:

- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Driver-facing labels:

| Value | Label | Driver guidance |
| --- | --- | --- |
| `delay` | Delay | Road, station, vehicle, timing, or route issue blocking expected movement. |
| `damage` | Damage | Package, seal, label, bag, or visible condition problem. |
| `loss` | Missing package | Package cannot be found, package count is wrong, or custody is unclear. |
| `payment` | Payment block | Payment state blocks station or delivery work. |
| `handoff` | Handoff problem | Scan, pickup, destination receipt, or custody handoff does not match. |
| `other` | Other run issue | Delivery-scoped issue that does not fit another category. |

Category selection rules:

- Show all six categories as large touch targets.
- Preselect only when source context is strong.
- Let the driver change preselected category.
- Preserve selection across offline state transitions.
- Explain category effect in one short line.
- Do not infer hidden category after submit.

Category copy:

- `Delay`: `Use when timing or movement is blocked.`
- `Damage`: `Use when package condition needs review.`
- `Missing package`: `Use when package location or count is not clear.`
- `Payment block`: `Use only when payment status blocks the run.`
- `Handoff problem`: `Use when scan, custody, or station receipt does not line up.`
- `Other run issue`: `Use for delivery-scoped support only.`

## Severity Model
Allowed severity:

- `p1`
- `p2`
- `p3`

Driver-facing labels:

| Value | Label | Use when |
| --- | --- | --- |
| `p1` | Urgent P1 | Package may be lost, custody conflict is severe, safety issue exists, or fraud risk is suspected. |
| `p2` | Blocked P2 | Run is blocked or materially delayed, but package location is still known. |
| `p3` | Follow-up P3 | Issue is a note, clarification, minor delay, or non-urgent support question. |

Severity rules:

- Default severity is unset unless source context safely recommends one.
- P1 requires a confirmation sheet.
- P1 confirmation must be serious, not dramatic.
- P2 is the default recommendation for blocked live operations.
- P3 is the recommendation for non-urgent follow-up.
- Do not let the driver submit without selecting severity.
- Do not hide severity behind an advanced section.

P1 confirmation:

- Title: `Confirm urgent P1`
- Body: `Use P1 only when this run may involve package loss, severe custody conflict, safety risk, fraud concern, or urgent operations review.`
- Primary action: `Submit urgent report`
- Secondary action: `Review severity`

## Delivery Context Requirements
Required context:

- `deliveryId`
- safe tracking code when available
- current status
- origin station label or ID
- destination station label or ID
- assigned driver match when known
- latest custody role when known
- last sync timestamp

Optional context:

- package count
- manifest count
- safe route label
- local queued action source
- existing issue count for this delivery
- current offline state

Never display:

- receiver phone
- full receiver address
- raw package scan code
- OTP
- signature image path
- proof image path
- provider transaction reference
- internal actor IDs
- full support admin notes

Context card layout:

- Top line: tracking code or delivery ID.
- Second line: origin to destination.
- Third line: status and custody.
- Side badge: selected issue category or source reason.
- Freshness chip: live, refreshing, saved, stale, offline, or unavailable.

## Run Selection Without Delivery Context
When route lacks `deliveryId`, show `Select run to report`.

Data source:

- Active assigned runs from cached and online `list_deliveries`.
- Recent completed or failed runs from driver history cache if available.

Selection list should include:

- tracking code
- route pair
- current status
- last updated time
- issue status if current status is `issue_reported`

Selection list must not include:

- receiver phone
- full address
- payment provider details
- package scan code

Empty state:

- Title: `No run selected`
- Body: `Support reports must be tied to a delivery. Open a run first or choose one from your active and recent work.`
- Primary action: `Open assigned runs`
- Secondary action: `Open history`

If the API has no accessible runs:

- Title: `No driver runs found`
- Body: `This account does not have active or recent runs available for support reporting.`
- Primary action: `Back to driver home`

## Existing Issue Awareness
If the app can call `list_issues` for the delivery, show a compact existing-issue strip.

Purpose:

- Avoid duplicate reports.
- Let the driver understand an issue may already be open.
- Keep P1 and open issue visibility clear.

Strip states:

- `no_visible_issues`
- `open_issues`
- `p1_open`
- `resolved_visible`
- `list_unavailable`
- `offline_saved`

Rules:

- Do not block the driver from reporting a new issue if a different problem exists.
- If an open issue has the same category, show `There is already an open issue in this category`.
- If P1 exists, show it before the form.
- Do not show admin resolution notes unless response schema exposes them and role policy allows it.
- Do not show issue comments because comments are not in the current API.

## State Model
```ts
type DriverSupportState =
  | { kind: "loading_context" }
  | { kind: "select_run"; runs: DriverSupportRunOption[]; sync: DriverSupportSync }
  | { kind: "ready"; context: DriverSupportContext; draft: DriverSupportDraft; sync: DriverSupportSync }
  | { kind: "dirty"; context: DriverSupportContext; draft: DriverSupportDraft; sync: DriverSupportSync }
  | { kind: "confirm_p1"; context: DriverSupportContext; draft: DriverSupportDraft; sync: DriverSupportSync }
  | { kind: "submitting"; context: DriverSupportContext; draft: DriverSupportDraft }
  | { kind: "submitted"; context: DriverSupportContext; issue: DriverSupportIssueSummary }
  | { kind: "queued_offline"; context: DriverSupportContext; queuedActionId: string; retryAt?: string }
  | { kind: "offline_ready"; context: DriverSupportContext; draft: DriverSupportDraft; sync: DriverSupportSync }
  | { kind: "offline_empty" }
  | { kind: "validation_error"; context?: DriverSupportContext; draft: DriverSupportDraft; errors: DriverSupportFieldErrors }
  | { kind: "duplicate_possible"; context: DriverSupportContext; draft: DriverSupportDraft; matchingIssueId: string }
  | { kind: "not_found" }
  | { kind: "scope_denied" }
  | { kind: "session_expired" }
  | { kind: "rate_limited"; retryAfterSeconds?: number }
  | { kind: "api_error"; context?: DriverSupportContext; retryable: boolean; requestId?: string };
```

```ts
type DriverSupportDraft = {
  deliveryId?: string;
  category?: "delay" | "damage" | "loss" | "payment" | "handoff" | "other";
  severity?: "p1" | "p2" | "p3";
  summary: string;
  description: string;
  sourceReason?: string;
  idempotencyKey: string;
  requestFingerprint: string;
};
```

```ts
type DriverSupportSync = {
  network: "online" | "offline" | "unknown";
  refresh: "idle" | "refreshing" | "failed";
  lastSyncedAt?: string;
  cacheAgeMinutes?: number;
  queuedSupportIssueCount: number;
  hasOutboxConflict: boolean;
};
```

## Screen Structure
Default structure:

1. Header and role-safe back action.
2. Authority strip.
3. Delivery context card or run selector.
4. Existing issue strip when available.
5. Category section.
6. Severity section.
7. Summary field.
8. Details field.
9. Offline and idempotency notice.
10. Submit action dock.
11. Recovery links.

When route has no delivery ID:

1. Header.
2. Authority strip.
3. Run selector.
4. Empty guidance when no run exists.
5. Links to assigned runs and history.

When submitted:

1. Success header.
2. Issue reference.
3. Category and severity.
4. Delivery context.
5. Next actions.

When queued offline:

1. Queued header.
2. Outbox reference.
3. Warning that server has not created the issue yet.
4. Open offline outbox action.
5. Return to run action.

## Component Inventory
### `DriverSupportScreen`
Responsibilities:

- Own route state.
- Validate query values.
- Load delivery context or run selector.
- Own draft state.
- Submit or queue issue.
- Render all states.

Test IDs:

- `screen-driver-support`
- `driver-support-scroll`

### `DriverSupportAuthorityStrip`
Responsibilities:

- Show data authority.
- Show sync state.
- Show offline outbox count.
- Warn when cached context is stale.

Test IDs:

- `driver-support-authority-strip`
- `driver-support-cache-age`
- `driver-support-outbox-count`

### `DriverSupportRunSelector`
Responsibilities:

- Let the driver choose an accessible active or recent run.
- Show only safe delivery identity.
- Support search by tracking code or station label.

Test IDs:

- `driver-support-run-selector`
- `driver-support-run-option`
- `driver-support-run-search`

### `DriverSupportContextCard`
Responsibilities:

- Show selected delivery.
- Show route pair, status, and custody.
- Show source reason.
- Show safe existing issue hint.

Test IDs:

- `driver-support-context-card`
- `driver-support-tracking-code`
- `driver-support-route-pair`
- `driver-support-status`
- `driver-support-custody`

### `DriverSupportExistingIssueStrip`
Responsibilities:

- Show visible open issue count.
- Highlight P1.
- Offer existing issue route when available.
- Avoid duplicate creation pressure.

Test IDs:

- `driver-support-existing-issue-strip`
- `driver-support-existing-issue-row`

### `DriverSupportCategoryGrid`
Responsibilities:

- Render six category cards.
- Show guidance.
- Manage selected state.
- Announce selection.

Test IDs:

- `driver-support-category-grid`
- `driver-support-category-delay`
- `driver-support-category-damage`
- `driver-support-category-loss`
- `driver-support-category-payment`
- `driver-support-category-handoff`
- `driver-support-category-other`

### `DriverSupportSeverityPicker`
Responsibilities:

- Render P1, P2, P3 choices.
- Explain operational impact.
- Trigger P1 confirmation.

Test IDs:

- `driver-support-severity-picker`
- `driver-support-severity-p1`
- `driver-support-severity-p2`
- `driver-support-severity-p3`

### `DriverSupportTextFields`
Responsibilities:

- Render summary and details fields.
- Show character counts.
- Show field errors.
- Preserve text during offline transitions.

Test IDs:

- `driver-support-summary-input`
- `driver-support-description-input`
- `driver-support-summary-count`
- `driver-support-description-count`

### `DriverSupportSubmitDock`
Responsibilities:

- Render primary submit action.
- Render disabled reason.
- Show idempotency and offline message.
- Keep action reachable without covering fields.

Test IDs:

- `driver-support-submit-dock`
- `driver-support-submit`
- `driver-support-submit-disabled-reason`

### `DriverSupportP1ConfirmSheet`
Responsibilities:

- Confirm urgent severity.
- Keep category and summary visible.
- Allow driver to review severity.

Test IDs:

- `driver-support-p1-confirm-sheet`
- `driver-support-p1-confirm-submit`
- `driver-support-p1-confirm-review`

### `DriverSupportSubmittedPanel`
Responsibilities:

- Show issue created state.
- Show issue ID.
- Show next steps.
- Route to run, custody chain, or home.

Test IDs:

- `driver-support-submitted-panel`
- `driver-support-created-issue-id`
- `driver-support-open-run`
- `driver-support-open-custody`

### `DriverSupportQueuedPanel`
Responsibilities:

- Show offline queued state.
- Show queued action ID.
- Explain server has not received it.
- Route to outbox.

Test IDs:

- `driver-support-queued-panel`
- `driver-support-queued-action-id`
- `driver-support-open-outbox`

## Visual Direction
Use a driver-grade, high-contrast operations visual system.

Art direction:

- Grounded, calm, utilitarian.
- Deep asphalt, warm ivory, safety amber, route blue, urgent red.
- Large readable type.
- Minimal decorative chrome.
- Strong section rhythm.

The first viewport should feel like a field report console, not a form dumped onto a phone.

Visual hierarchy:

- Delivery context is the anchor.
- Category and severity are the decision controls.
- Summary field is the required text action.
- Submit dock is the only dominant CTA.

Avoid:

- Chat bubbles.
- Decorative map panels.
- Dense admin tables.
- Too many equal cards.
- Payment-like styling.
- Red overload outside P1.

## Tokens
Color tokens:

- `--driver-support-bg`: near-white warm field background.
- `--driver-support-surface`: clean elevated card.
- `--driver-support-ink`: primary graphite.
- `--driver-support-muted`: secondary slate.
- `--driver-support-route`: deep transport blue.
- `--driver-support-safe`: deep green.
- `--driver-support-warn`: amber.
- `--driver-support-urgent`: safety red.
- `--driver-support-focus`: high-contrast blue.
- `--driver-support-border`: warm gray.

Spacing tokens:

- `--space-screen-x`: 20px mobile, 28px large mobile.
- `--space-section`: 24px.
- `--space-card`: 16px.
- `--space-control`: 12px.
- `--space-field`: 14px.

Radius tokens:

- Cards: 24px.
- Buttons: 16px.
- Chips: 999px.
- Bottom dock: 28px top corners.

Typography:

- Use the app's product type scale.
- Top title should be bold and compact.
- Category labels should be scan-friendly.
- Field helper copy should be short.
- Amount or route code styling from earnings/history must not be reused as finance treatment.

Motion:

- Category selection: 120ms scale and border transition.
- Severity selection: 140ms background and check transition.
- P1 sheet: bottom sheet with reduced-motion fallback.
- Submit progress: determinate text state, not decorative spinner alone.
- Success: one quiet state change; no celebration animation.

## Layout Rules
Mobile:

- Single-column.
- Sticky bottom submit dock.
- Form fields scroll above dock.
- Category grid uses two columns when width allows.
- Severity cards stack vertically if text scale is large.
- Run selector uses full-width list rows.

Large mobile or tablet:

- Keep readable max width.
- Context card and existing issue strip can sit side by side only if both remain legible.
- Submit dock can become inline panel on wide layouts.

Safe areas:

- Respect top and bottom insets.
- Bottom dock must not hide keyboard.
- Keyboard-open state must keep focused field and error visible.

## Accessibility Requirements
Form semantics:

- Summary and details fields have visible labels.
- Required fields are identified in text.
- Errors are tied to fields.
- Character counts are announced only when useful.
- P1 confirmation moves focus to sheet title.

Touch targets:

- Category cards meet WCAG target size guidance.
- Severity cards meet target size guidance.
- Submit and recovery CTAs meet target size guidance.

Announcements:

- Loading context.
- Network state change.
- Submit started.
- Submit succeeded.
- Submit failed.
- Issue queued offline.
- P1 confirmation opened.
- Field validation errors.

Screen reader summary:

- Announce selected delivery.
- Announce selected category and severity.
- Announce offline or saved context.
- Announce issue ID after success.

Color:

- P1, P2, and P3 use text labels and icon/shape, not color alone.
- Disabled state includes reason text.
- Focus ring remains visible on every interactive element.

Reduced motion:

- No bouncing or looping motion.
- Use opacity changes and instant state replacements.
- P1 sheet appears without slide animation.

## Copy System
Header:

- Title: `Report run problem`
- Subtitle: `Create a delivery-scoped support report for this driver run.`

Context missing:

- Title: `Choose a run first`
- Body: `Support reports must be tied to a delivery so operations can act on the right package.`

Category label:

- `What happened?`

Severity label:

- `How urgent is it?`

Summary label:

- `Short summary`

Summary helper:

- `Write the core problem in one line.`

Details label:

- `More details`

Details helper:

- `Add only details support needs to act. Do not include receiver private contact details.`

Offline helper:

- `Offline reports are saved locally first and sent when the device reconnects.`

Submit:

- `Submit report`

Queue:

- `Save to offline outbox`

Success title:

- `Report submitted`

Success body:

- `Support can now review this delivery issue. Keep the issue ID for station follow-up.`

Queued title:

- `Report saved offline`

Queued body:

- `This issue has not reached the server yet. Open offline outbox to sync when network returns.`

## Validation Rules
Field rules:

- Delivery is required.
- Category is required.
- Severity is required.
- Summary is required.
- Summary min length is `5`.
- Summary max length is `160`.
- Details min length is `5` when present.
- Details max length is `500`.

Summary quality rules:

- Reject whitespace-only summary.
- Reject repeated single-character strings.
- Warn if summary is too vague, such as `help`, `issue`, or `problem`.
- Do not prevent submit for all short human language if it meets backend min length.

Details rules:

- Details are optional.
- If provided, preserve line breaks only if the app supports them safely.
- Trim before submit.
- Do not allow file paths or raw local media references.

Validation messages:

| Field | Message |
| --- | --- |
| delivery | `Choose the run this report is about.` |
| category | `Choose what kind of run problem this is.` |
| severity | `Choose how urgent this report is.` |
| summary missing | `Add a short summary.` |
| summary too short | `Summary must be at least 5 characters.` |
| summary too long | `Summary must be 160 characters or fewer.` |
| details too short | `Details must be at least 5 characters when provided.` |
| details too long | `Details must be 500 characters or fewer.` |

## Interaction Flow
### Entry With Delivery ID
1. Driver opens support with `deliveryId`.
2. Screen validates route and driver session.
3. Screen loads cached delivery context.
4. Screen refreshes online context if available.
5. Screen applies safe category and severity prefill from source reason.
6. Driver confirms category.
7. Driver confirms severity.
8. Driver enters summary.
9. Driver optionally enters details.
10. Driver submits.
11. App sends `POST /v1/issues` with `Idempotency-Key`.
12. Server returns issue response.
13. Screen shows submitted state.

### Entry Without Delivery ID
1. Driver opens support from tab, home, or earnings.
2. Screen loads active and recent accessible runs.
3. Driver selects one run.
4. Screen moves to ready form.
5. Driver completes and submits delivery-scoped report.

### P1 Confirmation
1. Driver selects P1.
2. Driver enters valid report.
3. Driver taps submit.
4. Screen opens P1 confirmation sheet.
5. Driver confirms urgent report or returns to severity.
6. Confirmed submit uses the same idempotency key and request body.

### Offline Queue
1. Driver completes valid form while offline.
2. Primary action changes to `Save to offline outbox`.
3. Driver saves.
4. App writes durable outbox action with request body, idempotency key, fingerprint, created time, and source route.
5. Screen shows queued state.
6. Driver opens offline outbox or returns to run.

### Retry After Error
1. Online submit fails with retryable error.
2. Screen keeps draft.
3. Driver taps retry.
4. App reuses same idempotency key and same request fingerprint.
5. If request body changes, app generates a new idempotency key.

## Navigation Rules
Back:

- If draft is clean, return to source route.
- If draft is dirty, show discard confirmation.
- If opened from no source route, return to `/(ops)/driver/runs`.

Primary after success:

- `Open run`: `/(ops)/driver/runs/:deliveryId`

Secondary after success:

- `Open custody chain`: `/(ops)/deliveries/:deliveryId/custody`
- `Back to driver home`: `/(ops)/driver/home`

Offline:

- `Open offline outbox`: `/(ops)/offline-outbox`

General support boundary:

- If no delivery can be selected, route to assigned runs or history.
- Do not route to public support with staff delivery identifiers.

## Error States
### `loading_context`
- Skeleton context card.
- Disabled submit.
- Text: `Loading run context...`

### `offline_empty`
- Title: `Run context not saved`
- Body: `Reconnect once or open the run before reporting this problem.`
- Primary action: `Retry`
- Secondary action: `Open assigned runs`

### `not_found`
- Title: `Run not found`
- Body: `This delivery may have been removed or is no longer available to this account.`
- Primary action: `Back to assigned runs`

### `scope_denied`
- Title: `Run not assigned to this account`
- Body: `Support reports can only be created for runs this driver can access.`
- Primary action: `Back to assigned runs`

### `session_expired`
- Title: `Sign in again`
- Body: `Your driver session expired before the report could be submitted.`
- Primary action: `Sign in`

### `rate_limited`
- Title: `Too many reports right now`
- Body: `Wait before retrying. If you are offline, save the report locally and sync later.`
- Primary action: `Retry when available`
- Secondary action: `Save to offline outbox` when safe

### `validation_error`
- Title: `Check the report`
- Body: `Some details need attention before this report can be submitted.`
- Primary action: `Fix fields`

### `api_error`
- Title: `Could not submit report`
- Body: `Your report was not created. Retry with the same details or save it offline if network is unstable.`
- Primary action: `Retry`
- Secondary action: `Save to offline outbox` when safe

### `duplicate_possible`
- Title: `Similar issue may already be open`
- Body: `There is already a visible issue for this category on this run. Continue only if this is a different problem.`
- Primary action: `Submit new report`
- Secondary action: `Review existing issue`

## Offline Outbox Contract
Queued action payload:

```json
{
  "type": "create_issue",
  "deliveryId": "DEL-ACC-KSI-001",
  "body": {
    "deliveryId": "DEL-ACC-KSI-001",
    "category": "handoff",
    "severity": "p2",
    "summary": "Destination handoff is blocked",
    "description": "Operator cannot complete receipt."
  },
  "idempotencyKey": "generated durable key",
  "requestFingerprint": "stable hash of body",
  "sourceRoute": "/(ops)/driver/support",
  "createdAt": "ISO timestamp"
}
```

Queue rules:

- Generate idempotency key before first submit.
- Persist key with the queued action.
- Retry queued action with same key and body.
- If driver edits after queueing, create a new queued action after confirmation.
- Mark local state as queued, not created.
- Show conflict if server later returns `FORBIDDEN`, `NOT_FOUND`, or validation error.

Offline conflict handling:

| Server result on replay | UI handling |
| --- | --- |
| success | Mark outbox item synced and show issue ID |
| `FORBIDDEN` | Show access changed and route to support recovery |
| `NOT_FOUND` | Show delivery unavailable and keep audit record |
| `VALIDATION_ERROR` | Show field repair route |
| `RATE_LIMITED` | Keep queued with retry guidance |
| `INTERNAL_ERROR` | Keep queued and retry later |

## Data Derivation
Derived values:

- `canSubmit`
- `submitDisabledReason`
- `selectedRunLabel`
- `safeTrackingLabel`
- `contextFreshnessLabel`
- `recommendedCategory`
- `recommendedSeverity`
- `isP1ConfirmationRequired`
- `isExistingIssueSimilar`
- `isOfflineQueueAllowed`
- `returnRoute`
- `analyticsSource`

`canSubmit` is true only when:

- delivery ID is valid
- driver session is valid
- category is selected
- severity is selected
- summary passes validation
- details pass validation
- no P1 confirmation is pending
- no submit is already in flight

`isOfflineQueueAllowed` is true only when:

- delivery context exists in cache
- request body validates locally
- idempotency key exists
- local outbox storage is healthy
- no local outbox conflict exists for the same request fingerprint

## Privacy And Security
Data minimization:

- Keep only delivery-scoped support data.
- Sanitize query values.
- Trim all text fields.
- Do not include private receiver data in draft, cache, analytics, or logs.
- Do not store raw support text in analytics.

Logging:

- Log event type, category, severity, delivery scope hash, source route type, and result.
- Do not log free-text summary.
- Do not log free-text details.
- Do not log receiver contact data.
- Do not log raw idempotency key.

Device storage:

- Encrypt or platform-protect offline draft and queued payload where app storage supports it.
- Clear clean draft after submit success.
- Preserve dirty draft only for current route session unless offline queue is used.
- Clear stale dirty drafts after product-defined retention.

## Analytics
Events:

- `driver_support_viewed`
- `driver_support_run_selected`
- `driver_support_category_selected`
- `driver_support_severity_selected`
- `driver_support_p1_confirm_opened`
- `driver_support_p1_confirmed`
- `driver_support_submit_started`
- `driver_support_submit_succeeded`
- `driver_support_submit_failed`
- `driver_support_queued_offline`
- `driver_support_open_outbox`
- `driver_support_existing_issue_viewed`
- `driver_support_discarded`

Required properties:

- `screen_id`
- `route`
- `source_route_type`
- `has_delivery_context`
- `category`
- `severity`
- `network_state`
- `result`
- `error_code` when present
- `queued_action_type` when queued

Forbidden analytics properties:

- free-text summary
- free-text details
- receiver phone
- receiver address
- scan code
- OTP
- raw idempotency key
- exact provider references
- raw local file path

## Performance Requirements
Initial render:

- Shell and cached context within `300ms` after navigation where cache exists.
- Online refresh must not block cached form.
- Run selector should virtualize if run count grows.

Submit:

- Disable submit immediately after tap.
- Show visible progress text.
- Prevent double submit.
- Use request timeout policy from API client.

Offline:

- Local queue write acknowledgement should target platform offline budget.
- Outbox write failure must show immediate recovery.

Text:

- Character counts update without input lag.
- No expensive text analysis on every keystroke.

## QA Acceptance
Core route:

- Renders `screen-driver-support`.
- Opens with delivery ID and shows context card.
- Opens without delivery ID and shows run selector.
- Opens from active run support link.
- Opens from manifest package concern.
- Opens from route issue.
- Opens from destination handoff issue.
- Opens from earnings with delivery context if provided.

Category and severity:

- All six categories render.
- Category prefill applies only from safe source reason.
- All three severities render.
- P1 opens confirmation before submit.
- P2 and P3 submit without P1 confirmation.

Validation:

- Missing delivery blocks submit.
- Missing category blocks submit.
- Missing severity blocks submit.
- Missing summary blocks submit.
- Short summary shows field error.
- Long summary shows field error.
- Short details show field error only when details are present.
- Long details show field error.

Backend:

- Online submit calls `POST /v1/issues`.
- Request matches `createIssueRequestSchema`.
- Request includes `Idempotency-Key`.
- Success renders issue ID.
- `FORBIDDEN` renders scope denied.
- `NOT_FOUND` renders run not found.
- `VALIDATION_ERROR` maps to fields where possible.
- `RATE_LIMITED` renders retry guidance.
- Unknown API error preserves draft.

Offline:

- Offline with valid cached context can queue issue.
- Queued state shows server has not received report.
- Open offline outbox action routes correctly.
- Replay uses same idempotency key and request body.
- Replay success shows issue ID through outbox recovery.
- Replay conflict does not discard text silently.

Privacy:

- Receiver phone never renders.
- Full receiver address never renders.
- Raw scan code never renders.
- OTP never renders.
- Free-text issue content is not sent to analytics.
- Raw idempotency key is not logged.

Accessibility:

- Focus starts at title then context card.
- Field errors are announced.
- Submit success is announced.
- Offline queued state is announced.
- P1 sheet traps focus until dismissed or confirmed.
- Category and severity states are announced.
- Large text does not hide submit reason.

## Unit Test Targets
Pure functions:

- `parseDriverSupportQuery`
- `deriveDriverSupportInitialDraft`
- `deriveDriverSupportCategoryFromReason`
- `deriveDriverSupportSeverityFromReason`
- `validateDriverSupportDraft`
- `buildCreateIssueRequest`
- `buildDriverSupportIdempotencyFingerprint`
- `deriveDriverSupportSubmitState`
- `sanitizeDriverSupportAnalyticsPayload`
- `deriveExistingIssueWarning`

Test cases:

- Invalid delivery ID is rejected before fetch.
- Unknown category query is ignored.
- Unknown severity query is ignored.
- `scan_mismatch` maps to `handoff` and `p2`.
- `missing_package` maps to `loss` and `p1`.
- Empty summary fails.
- Summary under `5` fails.
- Summary over `160` fails.
- Details over `500` fails.
- P1 requires confirmation.
- Retry with unchanged body keeps idempotency key.
- Changed body creates a new request fingerprint.
- Analytics sanitizer removes free text.

## Integration Test Targets
Render:

- Route renders `screen-driver-support`.
- Context card renders for delivery ID.
- Run selector renders without delivery ID.
- Empty selector routes to assigned runs.

Submit:

- Fill category, severity, summary, details.
- Submit sends schema-valid request.
- Success panel renders issue ID.
- Submit button is disabled during in-flight request.

P1:

- Select `loss`.
- Select `p1`.
- Fill valid summary.
- Tap submit.
- Confirmation sheet appears.
- Confirm submits once.

Offline:

- Set network offline.
- Fill valid report.
- Save to outbox.
- Queued panel renders.
- Outbox action contains request body and idempotency key.

Errors:

- Backend `FORBIDDEN` shows scope denied.
- Backend `NOT_FOUND` shows not found.
- Backend `VALIDATION_ERROR` shows field errors.
- Backend `RATE_LIMITED` shows wait state.
- Backend internal error preserves draft.

## End-To-End Test Targets
Critical:

- Driver reports blocked destination handoff online.
- Driver reports missing package as P1 with confirmation.
- Driver queues route delay report offline and later syncs.
- Driver opens support without delivery, selects active run, and submits.
- Driver cannot report issue for inaccessible delivery.

Regression:

- Driver does not see receiver private contact data.
- Driver cannot resolve or escalate issue.
- Driver cannot create unscoped issue.
- Duplicate tap creates one request.
- Dirty draft discard requires confirmation.

## Test IDs
Required:

- `screen-driver-support`
- `driver-support-scroll`
- `driver-support-authority-strip`
- `driver-support-cache-age`
- `driver-support-outbox-count`
- `driver-support-run-selector`
- `driver-support-run-option`
- `driver-support-run-search`
- `driver-support-context-card`
- `driver-support-tracking-code`
- `driver-support-route-pair`
- `driver-support-status`
- `driver-support-custody`
- `driver-support-existing-issue-strip`
- `driver-support-existing-issue-row`
- `driver-support-category-grid`
- `driver-support-category-delay`
- `driver-support-category-damage`
- `driver-support-category-loss`
- `driver-support-category-payment`
- `driver-support-category-handoff`
- `driver-support-category-other`
- `driver-support-severity-picker`
- `driver-support-severity-p1`
- `driver-support-severity-p2`
- `driver-support-severity-p3`
- `driver-support-summary-input`
- `driver-support-description-input`
- `driver-support-summary-count`
- `driver-support-description-count`
- `driver-support-submit-dock`
- `driver-support-submit`
- `driver-support-submit-disabled-reason`
- `driver-support-p1-confirm-sheet`
- `driver-support-p1-confirm-submit`
- `driver-support-p1-confirm-review`
- `driver-support-submitted-panel`
- `driver-support-created-issue-id`
- `driver-support-open-run`
- `driver-support-open-custody`
- `driver-support-queued-panel`
- `driver-support-queued-action-id`
- `driver-support-open-outbox`

## Implementation Notes For Claude Code
Build `DriverSupport` as a driver-specific, delivery-scoped support issue creation screen. It should reuse shared issue category, severity, API, idempotency, offline outbox, and field validation patterns from the operations mobile support specs, but keep the route tailored to driver run problems.

Implementation boundaries:

- Use `create_issue` as the primary mutation.
- Use `Idempotency-Key` for every submit and replay.
- Use delivery context from route, cache, or run selector.
- Use `list_deliveries` only to select a run when delivery context is missing.
- Use `list_issues` only for visible existing issue awareness when available.
- Do not implement chat.
- Do not implement attachments.
- Do not implement issue comments.
- Do not implement issue resolution or escalation.
- Do not implement payout account support here.
- Do not implement lifecycle status mutation here.

Acceptance gate:

- The route renders behind `screen-driver-support`.
- A driver can create a delivery-scoped issue online.
- A driver can queue a delivery-scoped issue offline.
- P1 requires confirmation.
- The screen blocks unscoped issue creation.
- The screen never reveals restricted receiver, scan, proof, or payment provider data.
- The screen never calls `escalate_issue` or `resolve_issue`.
- The screen never treats queued offline state as server-created.
