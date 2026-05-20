# AdminCustodyChain Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminCustodyChain` |
| Route | `/admin/deliveries/:deliveryId/custody` |
| Primary test ID | `screen-admin-custody-chain` |
| Surface | Admin web console |
| Backend coverage | `get_delivery` through `GET /v1/deliveries/:id`; `get_delivery_timeline` through `GET /v1/deliveries/:id/timeline` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `empty_timeline`, `partial_detail`, `missing_evidence`, `exception_present`, `conflict_risk`, `not_found`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | `AdminDeliveryDetail`, `AdminPackageDetail`, protected admin shell |
| Related screens | `AdminPackageDetail`, `AdminPackageLabelRegistry`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminStationDetail`, `AdminUserDetail` |
| Current implementation mode | Read-only custody evidence ledger composed from delivery detail and timeline |

## Outcome
`AdminCustodyChain` gives admins a trustworthy custody ledger for one delivery. It must show who currently holds custody, which handoff evidence exists, which expected handoff evidence is missing, where fallback or exception evidence appears, and where the admin should go next.

The screen must answer:
- `Who currently holds custody?`
- `Which custody handoffs are expected for this delivery?`
- `Which handoff events are present?`
- `Which handoff evidence is missing or partial?`
- `Where did fallback or supervisor override evidence appear?`
- `Which issues affect custody confidence?`
- `Which package or audit screen should the admin open next?`

This page is an evidence ledger. It is not a scan screen, not an override screen, not a status editor, and not a raw event browser.

## Product Definition
This screen allows admins to:
- Load delivery detail by `deliveryId`.
- Load the delivery timeline by `deliveryId`.
- Review current custody role and actor state.
- Review latest event and latest touchpoint.
- Review expected handoff chain.
- Match timeline handoff entries to expected handoff steps.
- Review delivery events that affect custody state.
- Review issue events that affect custody confidence.
- Review proof type and redacted proof reference when present.
- Review package condition when present.
- Review fallback and supervisor override indicators when exposed.
- Open package detail.
- Open package label registry.
- Open manual custody exception review.
- Open issue queue.
- Open audit events.
- Refresh the ledger.

It does not allow admins to:
- Transfer custody.
- Confirm intake.
- Dispatch delivery.
- Confirm pickup.
- Receive destination.
- Assign final-mile courier.
- Accept final-mile custody.
- Complete delivery.
- Record failed attempt.
- Upload proof.
- Edit timeline entries.
- Delete timeline entries.
- Override custody.
- Reveal raw proof references by default.
- Reveal raw scan codes.
- Reveal receiver phone or full address.
- Resolve issues.
- Approve refunds.
- Execute payouts.

## Backend Boundary
This screen uses two existing authenticated endpoints:
```http
GET /v1/deliveries/:id
GET /v1/deliveries/:id/timeline
```

Operations:
```text
get_delivery
get_delivery_timeline
```

Current backend facts:
- `get_delivery` returns materialized current state.
- `get_delivery_timeline` returns delivery events, handoff events, and issue events.
- Timeline entries are sorted newest first by the backend.
- Handoff entries expose `proofType`, `proofReference`, and optional `condition` in metadata.
- Delivery event entries may expose metadata such as package scan, condition, fallback, supervisor override, note, or next step.
- Issue event entries expose severity, category, and summary in metadata.
- The API does not return `handoffType` as a separate typed field; it returns a human-readable `label`.
- The API does not expose full audit events in this endpoint.
- The API does not expose station names or user names.
- The API does not expose raw proof asset bytes.

Therefore:
- Current custody must come from `delivery.currentCustodyRole` and `delivery.currentCustodyActorId`.
- Historical evidence must come from `deliveryTimelineResponse.entries`.
- The page must not infer a handoff event that is absent.
- The page may map known labels defensively, but cannot depend on label text alone for legal-grade classification.
- Missing typed handoff fields must be called out as a future backend improvement.
- Raw proof references must be redacted.
- Actor IDs must be hidden in default view.
- Full audit review belongs in `AdminAuditEvents`.

## Users
Primary:
- `ops_admin` investigating package custody, missing evidence, handoff disputes, and station accountability.
- `support_admin` checking evidence before responding to package delay, damage, or loss reports.
- `finance_admin` checking custody evidence before refund, payment, or reconciliation review.
- `super_admin` reviewing high-risk custody exceptions and future audited reveal workflows.

Secondary:
- QA validating evidence states and redaction.
- Security reviewers checking sensitive data handling.
- Operations leads validating accountability rules.
- Backend engineers reviewing timeline contract gaps.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- `AdminDeliveryDetail` custody card.
- `AdminPackageDetail` evidence action.
- `AdminPackageLabelRegistry` row action.
- `AdminBlockedDeliveryQueue` custody blocker.
- `AdminManualCustodyException` related custody link.
- `AdminIssueDetail` related delivery link.
- `AdminAuditEventDetail` related object link.
- Direct route `/admin/deliveries/:deliveryId/custody`.

The screen must not be reachable:
- Without admin authorization.
- From public receiver tracking.
- From sender app routes.
- From staff mutation routes as a side-effect.

Invalid route behavior:
- If `deliveryId` is invalid, do not call the API.
- Show `Invalid delivery reference`.
- Offer `Back to delivery search`.

## Real-World Context
Kra is solving delivery trust issues where physical packages pass through stations, drivers, couriers, and receivers. Loss prevention depends on proving each transfer, not relying on memory or calls. The admin custody chain must feel like an operational evidence ledger: calm, chronological, strict about uncertainty, and clear about next action.

The screen must never turn absence into confidence. If the timeline does not expose an event, the page must say so. If proof exists but the reference is protected, the page must show proof type and redacted state without leaking the protected value.

## User Goal
Admins use this page when they need to answer:
- `Can we prove the custody path?`
- `Where did custody last transfer?`
- `Which handoff is missing?`
- `Did a fallback or supervisor override occur?`
- `Does an issue event weaken the chain?`
- `Should this move to manual custody exception review?`

The page should shorten investigation time and stop unsafe operational decisions.

## Scope
In scope:
- Current custody summary.
- Expected handoff chain.
- Timeline event ledger.
- Handoff event matching.
- Issue event risk.
- Fallback evidence.
- Supervisor override indicator when exposed.
- Condition evidence.
- Redacted proof references.
- Refresh and stale state.
- Route-only investigation actions.

Out of scope:
- Creating custody records.
- Editing custody records.
- Raw audit event list.
- Raw proof asset viewer.
- Raw scan-code reveal.
- Direct package-label registry read.
- Receiver contact reveal.
- Payment reconciliation.
- Refund review.
- Payout review.
- Station or user profile enrichment.

## Design Thesis
The screen should feel like a custody control room for one delivery: wide, chronological, and evidence-first. Use a strong top summary for current custody, then an expected-chain matrix that shows present, missing, partial, and exception states. The admin should understand the chain without opening raw JSON.

Visual decisions:
- Use a neutral graphite and paper base.
- Use green for present backend evidence.
- Use amber for partial or fallback evidence.
- Use red for missing required evidence after a stage has passed.
- Use blue only for neutral informational links.
- Use monospaced text for IDs and redacted references.
- Use a vertical ledger for evidence on desktop and cards on mobile.
- Keep primary action state-based: `Open exception review` when risk exists, otherwise `Open package detail`.

Restraint rule:
- Do not use decorative timeline art, maps, status charts, or avatar clusters. This screen proves custody.

## Research Inputs
External research used for this screen:
- [GS1 Canada traceability standards](https://gs1ca.org/standards/traceability-standards/): supports traceability through identification and event history.
- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final): supports chain-of-custody discipline for evidence handling and documentation.
- [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final): supports reliable log management for monitoring, review, and incident response.
- [Atlassian incident management handbook](https://www.atlassian.com/incident-management): supports clear event timelines and post-incident review patterns.
- [IBM Carbon structured list](https://v10.carbondesignsystem.com/components/structured-list/usage/): supports grouped read-only evidence facts.
- [USWDS table](https://designsystem.digital.gov/components/table/): supports accessible operational tables.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing loading, refresh, and evidence errors.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports visible focus in dense evidence screens.

How the research affects the screen:
- Traceability and NIST references justify immutable event evidence and careful uncertainty labels.
- Incident timeline references support chronology, state transitions, and review routing.
- Structured-list and table guidance shape readable admin evidence density.
- WCAG guidance controls status messaging, keyboard use, and visible focus.

## Data Contract
### Delivery Detail
Request:
```http
GET /v1/deliveries/:id
```

Fields used:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- `finalProof`
- `createdAt`

### Delivery Timeline
Request:
```http
GET /v1/deliveries/:id/timeline
```

Fields used:
- `deliveryId`
- `trackingCode`
- `entries[].entryId`
- `entries[].entryType`
- `entries[].occurredAt`
- `entries[].label`
- `entries[].actorId`
- `entries[].actorRole`
- `entries[].stationId`
- `entries[].metadata`

Metadata keys handled defensively:
- `proofType`
- `proofReference`
- `condition`
- `fallbackUsed`
- `supervisorOverrideActorId`
- `packageScanCode`
- `labelScanCode`
- `nextStep`
- `severity`
- `category`
- `summary`
- `note`

Rules:
- Metadata is optional.
- Metadata values must be type-checked.
- Unknown metadata must not break rendering.
- Raw sensitive metadata values must be redacted or hidden.

## Data Loading Strategy
Initial load:
1. Validate `deliveryId`.
2. Fetch `get_delivery`.
3. Fetch `get_delivery_timeline`.
4. Render shell with skeletons.
5. If detail succeeds and timeline is pending, render current custody with `Loading evidence`.
6. If timeline succeeds and detail fails, render `partial_detail` only if authorization allows safe context.
7. If detail returns `NOT_FOUND`, render `not_found`.
8. If either endpoint returns `FORBIDDEN`, render `not_authorized`.

Refresh:
- Refresh detail and timeline together.
- Keep old data visible with stale marker.
- Announce `Refreshing custody evidence`.
- When complete, announce row count and confidence state.

Caching:
- Use authenticated query cache.
- Clear cache on sign-out.
- Do not persist raw metadata in local storage.
- Do not place proof references in route params.

## Custody Confidence Model
Use these states:

| State | Meaning |
| --- | --- |
| `complete` | Expected handoff events are visible for the current lifecycle stage |
| `partial` | Some required evidence is visible, but timeline or typed fields are incomplete |
| `missing` | Required handoff evidence is absent after the stage should have occurred |
| `exception` | Fallback, supervisor override, issue, or condition problem is visible |
| `conflict` | Issue or timeline state suggests custody mismatch or dispute |
| `unknown` | Detail or timeline is unavailable |

Derivation rules:
- Current lifecycle status determines which expected handoff steps should be present.
- Handoff timeline entries count as direct custody evidence.
- Delivery timeline entries count as supporting lifecycle evidence.
- Issue entries weaken confidence.
- Fallback evidence changes confidence to `exception`.
- Missing handoff event after an advanced status changes confidence to `missing`.
- Timeline failure changes confidence to `unknown`.

Do not derive:
- Legal liability.
- Refund eligibility.
- Physical package location beyond current custody and latest touchpoint.
- Scan-code equality.
- User identity names.

## Expected Handoff Chain
Baseline expected steps:

| Step | Expected evidence | Backend source |
| --- | --- | --- |
| Sender to origin station | Intake delivery event plus `sender_to_origin_station` handoff | Timeline |
| Origin station to driver | Driver pickup delivery event plus `origin_station_to_driver` handoff | Timeline |
| Driver to destination station | Destination receipt delivery event plus `driver_to_destination_station` handoff | Timeline |
| Destination station to final-mile courier | Final-mile acceptance event plus `destination_station_to_final_mile_courier` handoff when doorstep flow applies | Timeline |
| Final-mile courier to destination station | Failed-attempt return handoff when a failed attempt returns custody | Timeline |
| Delivery completion | Completion event plus final proof summary when delivered | Detail and timeline |

Conditional rules:
- Doorstep handoff steps appear only when `doorstepRequested` or later final-mile statuses indicate doorstep flow.
- Delivery completion can exist after receiver pickup or final-mile proof, depending on lifecycle path.
- Assignment events do not transfer custody.
- Dispatch readiness does not transfer custody.
- `currentCustodyRole` is the authority for present custody.
- Timeline handoff events are the authority for history.

## Current Custody Summary
Above the fold, show:
- Current custody role.
- Current custody actor state.
- Current lifecycle status.
- Latest touchpoint role.
- Latest touchpoint station.
- Latest touchpoint time.
- Assigned driver state.
- Assigned final-mile courier state.
- Confidence state.

Copy examples:
- `Current custodian: Driver`
- `Assigned driver is not custody until pickup is confirmed.`
- `No active custodian after delivery completion.`
- `Timeline evidence is partial. Refresh before taking action.`

Rules:
- Hide `currentCustodyActorId` by default.
- Show role and station first.
- If actor ID is needed, route to `AdminAuditEvents` or future restricted reveal.
- If current custody is null and status is not terminal, show `Custody owner unavailable`.

## Evidence Ledger
The ledger is the central content.

Display modes:
- `Expected chain`: groups entries by custody step.
- `Raw chronology`: read-only timeline sorted by occurrence time, with sensitive data redacted.

Default mode:
- `Expected chain`

Sorting:
- Expected chain uses business order.
- Raw chronology defaults newest first.
- Allow `Oldest first`.

Each evidence row shows:
- Step label.
- Evidence status.
- Event label.
- Entry type.
- Occurred time.
- Actor role.
- Station ID.
- Proof type.
- Redacted proof reference.
- Condition.
- Fallback state.
- Related issue state.

Evidence status values:
- `Present`
- `Missing`
- `Partial`
- `Fallback`
- `Issue`
- `Conflict risk`
- `Not expected yet`

Row actions:
- `Open package`
- `Open exception review`
- `Open related issue`
- `Open audit events`
- `Copy entry ID`

Rules:
- `Copy entry ID` copies only the event entry ID.
- Do not copy proof reference.
- Do not render actor ID in default row.
- Do not render raw scan code.

## Issue And Exception Handling
Issue entries with these categories affect custody confidence:
- `handoff`
- `loss`
- `damage`

Issue category `other` is displayed as a neutral related issue only. It must not affect custody confidence unless the backend later adds a structured custody-risk flag.

Severity mapping:
- `p1`: Red `Critical custody issue`
- `p2`: Amber `Custody review required`
- `p3`: Neutral `Custody note`

Exception signals:
- `fallbackUsed = true`
- `supervisorOverrideActorId` present
- issue category `handoff`
- issue category `loss`
- condition `damaged`
- missing expected handoff after status has advanced

Actions:
- `Open manual custody exception`
- `Open issue queue`
- `Open audit events`

Rules:
- Do not close issues from this page.
- Do not assign blame.
- Do not declare the package lost unless backend issue state says so.
- Do not trigger refunds.

## Proof Reference Redaction
Protected values:
- `metadata.proofReference`
- `metadata.packageScanCode`
- `metadata.labelScanCode`
- `finalProof.reference`

Display:
- For package-scan proof: `Package scan proof recorded`
- For delivery proof: `Delivery proof recorded`
- Redacted reference: `Reference protected`
- If a server fingerprint is available in the future: show the fingerprint.

Rules:
- Never show full raw proof reference.
- Never put proof reference in `aria-label`.
- Never put proof reference in `title`.
- Never copy proof reference.
- Never send proof reference to analytics.
- Never put proof reference in support payload.

## Missing Evidence State
Trigger:
- Expected handoff step has no matching handoff event after lifecycle status indicates it should exist.
- Timeline is empty after delivery has moved beyond created state.
- Detail shows current custody but timeline does not show the transfer.

UI:
- Show red risk banner.
- Mark affected chain step as `Missing`.
- Explain that evidence is not visible, not that event never happened.
- Primary action: `Open manual custody exception`.
- Secondary action: `Refresh`.

Copy:
```text
Expected custody evidence is not visible for this delivery stage.
```

Rules:
- Do not create issue automatically.
- Do not mutate custody.
- Do not hide package or delivery context.

## Partial Detail State
Trigger:
- Timeline loads, but detail fails after a transient error.

UI:
- Show timeline only if authorized context is still valid.
- Mark current custody as `Unavailable`.
- Show `Refresh delivery detail`.

Rules:
- If authorization failure occurs, clear timeline.
- If session expires, clear all data.

## Empty Timeline State
Trigger:
- Timeline endpoint returns zero entries.

UI:
- If delivery status is `created`, show normal `No custody events yet`.
- If delivery status is beyond `created`, show missing evidence warning.
- Primary action: `Refresh`.
- Secondary action: `Open delivery detail`.

## Stale State
Trigger:
- Cached data older than the admin freshness threshold.
- Network reconnect after prior failure.
- User returns from another admin screen.

UI:
- Show `Evidence may be stale`.
- Keep stale data visible.
- Provide `Refresh evidence`.
- Disable confidence labels that imply current proof until refresh completes.

Freshness threshold:
- Default: 60 seconds for active delivery states.
- Terminal deliveries may use longer cache, but still show loaded timestamp.

## Not Found State
Trigger:
- `get_delivery` returns `NOT_FOUND`.

UI:
- Title: `Delivery not found`
- Body: `No custody chain can be loaded for this delivery reference.`
- Actions:
  - `Back to delivery search`
  - `Open support`

## Not Authorized State
Trigger:
- `FORBIDDEN` from either endpoint.

UI:
- Title: `Access denied`
- Body: `Your admin role cannot view this custody chain.`
- Actions:
  - `Back`
  - `Open support`

Rules:
- Do not show cached detail.
- Do not show cached timeline.

## Session Expired State
Trigger:
- Auth session missing or expired.

UI:
- Title: `Session expired`
- Body: `Sign in again to view custody evidence.`
- Action: `Sign in`

Rules:
- Clear data.
- Clear route-scoped caches.

## API Error State
Trigger:
- Network or server error not covered above.

UI:
- Title: `Custody chain could not load`
- Body: `Retry the request. If this continues, open support with the delivery ID.`
- Actions:
  - `Retry`
  - `Open support`

Support payload:
- Delivery ID.
- Endpoint name.
- Timestamp.
- Error code.

Exclude:
- Proof references.
- Scan codes.
- Receiver data.
- Actor IDs.
- Free-text metadata.

## Security And Privacy
Protected data:
- Receiver phone.
- Receiver address.
- Raw scan code.
- Raw proof reference.
- Raw actor ID.
- Supervisor override actor ID.
- Payment provider reference.
- Proof asset storage path.
- Free-text issue summary that may include personal data.

Default protection:
- Redact proof and scan references.
- Hide actor IDs.
- Truncate issue summaries.
- Link to deeper screens for restricted review.
- Do not include sensitive fields in logs, analytics, route params, copied text, support payloads, or accessible names.

Future restricted reveal:
- Must require explicit reason.
- Must be role gated.
- Must create an audit event.
- Must time out.
- Must not be part of current implementation.

## Accessibility Requirements
Semantics:
- One `h1`.
- Breadcrumb uses `aria-current`.
- Current custody summary uses a section heading.
- Expected chain is a list or table with accessible labels.
- Raw chronology uses a semantic table only when columns fit.
- Status changes use polite live regions.
- Critical missing evidence uses an alert region.

Keyboard:
- All row actions reachable.
- View mode toggle reachable.
- Sort toggle reachable.
- Refresh reachable.
- Row expansions reachable.
- Focus order follows visual order.

Focus:
- Visible focus on every action.
- Focus ring is not color-only.
- Focus remains visible in dense rows.
- Refresh does not steal focus.

Screen reader:
- Evidence row announces step, state, event type, time, and risk.
- Redacted proof announces `Proof reference protected`.
- Missing evidence announces the specific expected step.
- Refresh result announces confidence state.

Color:
- All states include text labels.
- Contrast meets WCAG AA.
- Red and amber are not the only signal.

## Responsive Rules
Desktop:
- Two-column top summary.
- Expected chain matrix full width.
- Raw chronology table below.
- Related action rail on the right.

Tablet:
- Single-column summary.
- Expected chain becomes stacked step cards.
- Related rail moves below.

Mobile:
- Step cards only.
- Chronology uses compact event cards.
- Row actions collapse behind `More actions`.
- No horizontal scroll for core evidence.
- IDs truncate visually with full accessible text.

## Motion
Allowed:
- Subtle content reveal after data loads.
- Row highlight when new evidence appears after refresh.
- Disclosure open and close motion.

Not allowed:
- Looping animations.
- Decorative custody lines.
- Motion tied to sensitive values.
- Alert motion that repeats.

Respect `prefers-reduced-motion`.

## Analytics
Events:
- `admin_custody_chain_viewed`
- `admin_custody_chain_refreshed`
- `admin_custody_chain_view_mode_changed`
- `admin_custody_missing_evidence_shown`
- `admin_custody_exception_route_clicked`
- `admin_custody_issue_route_clicked`
- `admin_custody_audit_route_clicked`

Allowed properties:
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `entryCount`
- `handoffEntryCount`
- `issueEntryCount`
- `confidenceState`
- `missingStepCount`
- `hasFallback`
- `hasSupervisorOverride`
- `hasDamageCondition`

Forbidden properties:
- Receiver phone.
- Receiver address.
- Proof reference.
- Scan code.
- Actor ID.
- Supervisor override actor ID.
- Issue summary.
- Free-text note.
- Payment provider reference.

## Test Plan
### Contract Tests
- Calls `get_delivery`.
- Calls `get_delivery_timeline`.
- Renders current custody from delivery detail.
- Renders timeline entries from timeline response.
- Handles empty timeline.
- Handles missing metadata.
- Handles unexpected metadata.
- Handles handoff entries.
- Handles delivery entries.
- Handles issue entries.
- Handles final proof summary.

### Evidence Tests
- Created delivery shows no custody events yet.
- Intake evidence maps to sender-to-origin step.
- Driver pickup handoff maps to origin-to-driver step.
- Destination receipt handoff maps to driver-to-destination step.
- Final-mile acceptance maps to destination-to-courier step.
- Failed attempt return maps to courier-to-station step.
- Delivery completion maps to completion step.
- Assignment events do not transfer custody.
- Dispatch readiness does not transfer custody.
- Missing expected handoff shows missing state.
- Fallback metadata shows exception state.
- Damage condition shows issue state.

### Redaction Tests
- Proof reference never renders.
- Package scan code never renders.
- Label scan code never renders.
- Receiver phone never renders.
- Receiver address never renders.
- Actor ID hidden by default.
- Supervisor override actor ID hidden by default.
- Analytics excludes protected values.
- Support payload excludes protected values.

### State Tests
- Loading state renders.
- Ready state renders.
- Partial detail state renders.
- Empty timeline state renders.
- Missing evidence state renders.
- Exception state renders.
- Conflict risk state renders.
- Not found state renders.
- Not authorized clears cached data.
- Session expired clears data.
- API error offers retry.
- Stale state marks visible content.

### Accessibility Tests
- Page has one `h1`.
- Breadcrumb uses `aria-current`.
- Current custody summary is announced.
- Missing evidence alert is announced.
- Refresh status is announced.
- Row actions are keyboard reachable.
- View mode toggle is keyboard reachable.
- Focus remains visible.
- Color-only status does not exist.

### Visual Regression Tests
- Desktop summary and ledger.
- Tablet stacked chain.
- Mobile cards.
- Missing evidence state.
- Exception state.
- Empty timeline state.
- Long IDs.
- Long issue summary truncation.

## Acceptance Criteria
- The screen is reachable at `/admin/deliveries/:deliveryId/custody`.
- Root has `data-testid="screen-admin-custody-chain"`.
- Screen is read-only.
- No lifecycle mutation endpoint is called.
- `get_delivery` provides current custody.
- `get_delivery_timeline` provides historical evidence.
- Expected handoff chain is visible.
- Missing expected evidence is explicit.
- Assignment does not count as custody.
- Dispatch readiness does not count as custody.
- Fallback and issue evidence affect confidence.
- Raw proof references never render.
- Raw scan codes never render.
- Receiver phone and address never render.
- Admin can route to package detail, exception review, issue queue, and audit events.
- Accessibility, responsive, analytics, and redaction tests are defined.

## Implementation Notes For Claude Code
Recommended hooks:
- `useAdminDeliveryDetail(deliveryId)`
- `useAdminDeliveryTimeline(deliveryId)`
- `useCustodyEvidenceModel(detail, timeline)`
- `useProtectedReferenceRedaction()`

Recommended components:
- `AdminCustodyIdentityHeader`
- `CurrentCustodySummary`
- `CustodyConfidencePanel`
- `ExpectedHandoffChain`
- `CustodyEvidenceStep`
- `CustodyChronologyTable`
- `CustodyIssuePanel`
- `CustodyRelatedActions`
- `CustodyStateView`

Implementation guardrails:
- Redact sensitive metadata before it enters presentational components.
- Treat timeline labels defensively.
- Keep current custody separate from historical evidence.
- Do not add mutation buttons.
- Do not add raw reveal.
- Do not infer station or user names.
- Do not show issue free text without sanitizing and truncating.

Suggested build order:
1. Add protected route shell.
2. Load detail and timeline.
3. Build evidence model.
4. Render current custody summary.
5. Render expected handoff chain.
6. Render chronology view.
7. Add missing and exception states.
8. Add redaction tests.
9. Add accessibility tests.
10. Add responsive tests.

## Future Enhancements
Backend:
- Add typed `handoffType` to timeline entries.
- Add normalized custody confidence from backend.
- Add admin audit-event projection to custody chain.
- Add proof asset metadata projection without raw storage paths.
- Add redacted scan fingerprint.
- Add restricted audited reveal workflow.

Frontend:
- Anchor to specific timeline entry from related screens.
- Compare package-label registry row when endpoint exists.
- Add redacted custody report export.
- Add issue-side panel after issue endpoint supports filtering.
- Add audit-events side panel after audit projection exists.

## Done Definition
The screen is complete when:
- Admins can understand current custody and historical handoffs quickly.
- Expected handoffs are visible even when evidence is missing.
- Missing, partial, fallback, conflict, and issue states are impossible to miss.
- The screen does not mutate custody.
- Protected references and actor IDs remain protected.
- The page works on desktop, tablet, and narrow browser widths.
- The implementation has contract, state, redaction, accessibility, analytics, and visual tests.
