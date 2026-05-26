# Admin Manual Custody Exception Screen Spec

## Screen Contract

| Field                 | Value                                                                                                                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID             | `AdminManualCustodyException`                                                                                                                                                                                                                                                                      |
| Route                 | `/admin/custody-exceptions/:issueId`                                                                                                                                                                                                                                                               |
| Primary test ID       | `screen-admin-manual-custody-exception`                                                                                                                                                                                                                                                            |
| Surface               | Admin web console                                                                                                                                                                                                                                                                                  |
| Backend coverage      | `get_issue`, `get_delivery`, `get_delivery_timeline`, `list_issues`, `escalate_issue`, `resolve_issue`                                                                                                                                                                                             |
| Offline critical      | No                                                                                                                                                                                                                                                                                                 |
| Required read roles   | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`                                                                                                                                                                                                                                    |
| Required action roles | `ops_admin`, `support_admin`, or `super_admin`; `finance_admin` is read-only for this screen                                                                                                                                                                                                       |
| Required states       | `loading`, `ready`, `not_custody_issue`, `read_only`, `in_review`, `escalated`, `resolved`, `closed`, `missing_delivery`, `missing_timeline`, `partial_evidence`, `not_found`, `not_authorized`, `invalid_issue_id`, `session_expired`, `stale`, `mutation_pending`, `mutation_error`, `api_error` |
| Parent screens        | `AdminCustodyChain`, `AdminPackageDetail`, `AdminPackageLabelRegistry`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminIssueDetail`, protected admin shell                                                                                                                                  |
| Related screens       | `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminPackageDetail`, `AdminAuditEvents`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminBlockedDeliveryQueue`, `AdminRefundEvidenceReview`, `AdminPaymentReconciliation`                                                                                |

## Purpose

This screen gives admins one strict place to review a custody exception that is already represented by a support issue. It does not create a new custody record. It loads the issue, linked delivery detail, custody timeline, and related issues so the admin can decide whether to start review, escalate, resolve, or close the issue using existing backend actions.

The screen exists to prevent loss of goods from being resolved through memory, phone calls, or private chat. Every decision must be backed by visible issue fields, delivery state, and timeline evidence.

## Backend Reality

The current backend does not expose a dedicated custody exception entity.

Therefore:

- The route parameter is an `issueId`, not a delivery ID.
- The primary record is `GET /v1/issues/:id`.
- A custody exception is represented by an issue where `category` is `handoff`, `loss`, or `damage`.
- `category=other` is not a custody exception unless a future backend field explicitly marks it as custody risk.
- The linked delivery is loaded from `issue.deliveryId`.
- Custody evidence is loaded from `GET /v1/deliveries/:deliveryId/timeline`.
- Delivery status and current custody are loaded from `GET /v1/deliveries/:deliveryId`.
- Related issues are loaded through `GET /v1/issues?deliveryId=:deliveryId`.
- The screen must never read Firestore directly.
- The screen must never infer scan-code equality from raw scan values.
- The screen must never show raw proof references.

This screen is an exception review cockpit over existing issue and delivery APIs.

## Primary Users

Primary:

- `ops_admin` resolving operational custody blockers.
- `support_admin` managing issue thread state, escalation, and closure.
- `super_admin` handling high-risk or policy-ambiguous exceptions.

Secondary:

- `finance_admin` checking custody evidence before refund, reconciliation, or payment review. Finance admins can read this screen but must not see action controls that call `escalate_issue` or `resolve_issue`.

Build stakeholder:

- Claude Code implementing the admin console later.

## User Goal

Admins use this screen to answer:

- `What exact issue is blocking custody trust?`
- `Which delivery does this issue affect?`
- `Is the package custody chain complete, partial, missing, or conflicted?`
- `What visible evidence supports the next decision?`
- `Can this issue move into review?`
- `Should it be escalated?`
- `Can it be resolved with the backend resolution codes available today?`
- `Should a finance or refund workflow wait?`

The screen should reduce the time from issue open to accountable decision without weakening custody controls.

## Entry Points

The screen can open from:

- `AdminCustodyChain` primary action when custody confidence is `missing`, `exception`, or `conflict`.
- `AdminPackageDetail` when package evidence shows mismatch risk.
- `AdminPackageLabelRegistry` when a label conflict is linked to an issue.
- `AdminBlockedDeliveryQueue` when a row has a custody blocker.
- `AdminIssueQueue` for handoff, loss, or damage issue rows.
- `AdminIssueDetail` related custody action.
- `AdminRefundEvidenceReview` when custody evidence must be checked before refund action.
- Direct route `/admin/custody-exceptions/:issueId`.

Invalid route behavior:

- If `issueId` does not match `ISS-[A-Z0-9-]+`, do not call any API.
- Show `Invalid custody exception reference`.
- Offer `Back to issue queue`.
- Preserve no query state.

Route safety:

- Do not accept raw delivery IDs in this route.
- Do not accept tracking codes in this route.
- Do not accept proof references in this route.
- Do not accept scan codes in this route.

## Scope

In scope:

- Issue detail summary.
- Linked delivery summary.
- Custody issue qualification.
- Related custody issue list for same delivery.
- Delivery timeline evidence.
- Expected custody chain comparison.
- Missing evidence explanation.
- Escalation workflow through `escalate_issue`.
- Review and resolution workflow through `resolve_issue`.
- Read-only finance review state.
- Redaction of sensitive references.
- Full loading, empty, error, authorization, and stale states.

Out of scope:

- Creating a new custody issue.
- Creating a new handoff event.
- Editing delivery custody state.
- Reassigning delivery.
- Refund decision.
- Payment reconciliation decision.
- Raw proof asset viewer.
- Raw package-label registry read.
- Raw audit log browser.
- Revealing receiver contact details.
- Revealing actor identity beyond IDs already returned by the API.
- Claiming legal liability.
- Declaring an item permanently lost without backend issue state.

## Design Thesis

The screen should feel like a serious exception review desk for physical custody: precise, calm, evidence-led, and hard to misuse. The design should prioritize proof, chronology, and permitted next actions over decorative dashboard elements.

Visual decisions:

- Use a slate, sand, and white palette with narrow status accents.
- Use red only for unresolved P1 loss or missing required evidence.
- Use amber for partial evidence or escalation.
- Use green only for resolved or evidence-complete states.
- Use blue for neutral navigation links.
- Use monospaced text for issue IDs, delivery IDs, entry IDs, and redacted references.
- Use a three-zone desktop layout: decision header, evidence body, action rail.
- On mobile, use stacked sections with sticky action footer only when actions are permitted.
- Avoid dense card grids. This is a review file, not a KPI dashboard.

Restraint rule:

- Do not add maps, avatars, illustrations, confetti, charts, or visual noise. The premium feel comes from clarity, spacing, typography, and controlled evidence hierarchy.

## Research Inputs

External research used for this screen:

- [GS1 Canada traceability standards](https://gs1ca.org/standards/traceability-standards/): supports traceability through unique identification, data capture, supply-chain visibility, and reviewable journey records.
- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final): supports forensic discipline for incident response, evidence sources, and operational investigation.
- [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final): supports log management as a foundation for review, monitoring, and incident response.
- [Atlassian incident management handbook](https://www.atlassian.com/incident-management): supports structured incident workflows, escalation, and resolution discipline.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense evidence rows, row actions, and readable operational table patterns.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports highlighting a short list of critical review facts.
- [USWDS process list](https://designsystem.digital.gov/components/process-list/): supports step-based evidence review and ordered decision flows.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, refresh, and mutation result announcements.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports visible focus in dense admin workflows.

How the research affects the screen:

- Traceability references justify strict delivery journey evidence and reviewable supply-chain handoffs.
- NIST references justify protecting raw evidence while surfacing enough context to make accountable decisions.
- Incident-management references shape the issue workflow into triage, review, escalation, resolution, and closure.
- Data-table and process-list references shape the evidence comparison and decision history.
- WCAG references shape focus, announcements, keyboard flow, and non-visual status changes.

## Data Contract

### Route Parameter

Route:

```text
/admin/custody-exceptions/:issueId
```

Validation:

- Must match `ISS-[A-Z0-9-]+`.
- If invalid, render `invalid_issue_id`.
- Do not call `get_issue` for invalid IDs.

### Issue Detail

Request:

```http
GET /v1/issues/:id
```

Operation:

- `get_issue`

Fields used:

- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description`
- `reporter.actorId`
- `reporter.actorRole`
- `escalatedAt`
- `escalatedByActorId`
- `escalationReasonCode`
- `resolvedAt`
- `resolvedByActorId`
- `closedAt`
- `closedByActorId`
- `resolutionCode`
- `resolutionNote`
- `createdAt`
- `updatedAt`

Rules:

- Treat `summary` and `description` as sensitive operational text.
- Render issue text in visible UI only, never in analytics payloads.
- Do not derive custody risk from free-text content.
- Use `category`, `severity`, `status`, and delivery timeline evidence for decisions.

### Delivery Detail

Request:

```http
GET /v1/deliveries/:deliveryId
```

Operation:

- `get_delivery`

Fields used:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
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

Rules:

- Use delivery detail to anchor the issue in one physical package journey.
- Hide `currentCustodyActorId` unless the existing admin design system already permits actor ID display.
- Never show raw `finalProof.reference`; show `Delivery proof recorded` and `Reference protected`.
- Do not show receiver contact data from this screen.

### Delivery Timeline

Request:

```http
GET /v1/deliveries/:deliveryId/timeline
```

Operation:

- `get_delivery_timeline`

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
- `severity`
- `category`
- `summary`
- `note`

Rules:

- Timeline metadata is optional.
- Unknown metadata must not break rendering.
- Hide raw proof references.
- Hide raw scan-like values if they appear in metadata.
- Treat `handoff_event` entries as custody evidence.
- Treat `issue_event` entries as operational issue context.

### Related Issues

Request:

```http
GET /v1/issues?deliveryId=:deliveryId
```

Operation:

- `list_issues`

Fields used:

- Same as issue detail response for each issue.

Rules:

- Show only issues linked to the current delivery.
- Sort unresolved custody issues first, then severity, then `updatedAt` descending.
- Highlight the active route issue.
- Do not merge issue text into analytics.
- Do not use related issue summary text to derive custody risk.

### Escalate Issue

Request:

```http
POST /v1/issues/:id/escalate
```

Operation:

- `escalate_issue`

Allowed backend reason codes:

- `sender_request`
- `sla_breach`
- `payment_dispute`
- `loss_investigation`
- `fraud_review`
- `management_attention`

Custody-screen reason guidance:

- Use `loss_investigation` for loss or missing custody evidence.
- Use `fraud_review` only when policy or operations has evidence of suspected abuse.
- Use `management_attention` for severe unresolved custody conflict.
- Use `sla_breach` only when timeline delay is the reason.
- Do not use `payment_dispute` from this screen unless the issue is explicitly payment-linked outside custody.

Request body:

```json
{
  "reasonCode": "loss_investigation",
  "note": "Evidence review requires leadership attention before custody can be cleared."
}
```

Rules:

- The note must be operator-authored.
- The note must be at least 5 and at most 400 characters.
- Do not include proof references, scan codes, receiver phone, or private payment references.
- Show idempotent pending state.
- On success, refetch issue, delivery, timeline, and related issues.

### Resolve Issue

Request:

```http
POST /v1/issues/:id/resolve
```

Operation:

- `resolve_issue`

Allowed backend next statuses:

- `in_review`
- `resolved`
- `closed`

Allowed backend resolution codes:

- `station_confirmed`
- `delivery_completed`
- `refund_approved`
- `sender_withdrew`
- `duplicate_report`
- `policy_denied`

Custody-screen resolution guidance:

- Use `in_review` when an open custody issue is accepted for manual investigation.
- Use `station_confirmed` only when station evidence confirms correct custody.
- Use `delivery_completed` only when delivery completion evidence exists.
- Use `duplicate_report` only when another visible issue covers the same custody problem.
- Use `policy_denied` only when policy clearly rejects the issue and evidence supports that decision.
- Use `sender_withdrew` only when backend issue context supports that source.
- Do not offer `refund_approved` as a selectable action on this screen. If an existing issue already has `resolutionCode=refund_approved`, display it as historical backend state and route refund work to `AdminRefundEvidenceReview`.

Important backend transition rules:

- `in_review` is allowed only from `open`.
- `resolved` is not allowed from `closed`.
- `closed` is allowed only from `resolved`.
- `resolutionCode` is required when `nextStatus` is `resolved` or `closed`.

Request body for review:

```json
{
  "nextStatus": "in_review",
  "note": "Custody evidence review started from manual exception screen."
}
```

Request body for resolution:

```json
{
  "nextStatus": "resolved",
  "resolutionCode": "station_confirmed",
  "note": "Station handoff evidence confirms custody path."
}
```

Rules:

- Do not resolve if visible evidence does not match one of the backend resolution codes.
- If the needed resolution code does not exist, keep the issue in review or escalate.
- Do not auto-close after resolving.
- Closing requires an explicit separate action.

## Role And Permission Matrix

| Role            | Can read | Can start review | Can escalate | Can resolve | Can close                 | UI behavior               |
| --------------- | -------- | ---------------- | ------------ | ----------- | ------------------------- | ------------------------- |
| `ops_admin`     | Yes      | Yes              | Yes          | Yes         | Yes, if issue is resolved | Full operational controls |
| `support_admin` | Yes      | Yes              | Yes          | Yes         | Yes, if issue is resolved | Full issue controls       |
| `finance_admin` | Yes      | No               | No           | No          | No                        | Read-only evidence review |
| `super_admin`   | Yes      | Yes              | Yes          | Yes         | Yes, if issue is resolved | Full controls             |

Rules:

- Hide unavailable action buttons rather than showing disabled controls with confusing copy.
- Show a read-only banner for `finance_admin`.
- If backend returns `FORBIDDEN` for a mutation, refetch permissions and show `You no longer have permission to change this issue.`
- Never let client role checks replace backend authorization.

## Custody Qualification

The route issue qualifies as a custody exception when:

- `category=handoff`
- `category=loss`
- `category=damage`

The route issue does not qualify when:

- `category=delay`
- `category=payment`
- `category=other`

Non-custody behavior:

- Render `not_custody_issue`.
- Show the issue summary and status.
- Explain `This issue is not classified as a custody exception.`
- Offer `Open issue detail`.
- Offer `Back to issue queue`.
- Do not render the custody action rail.
- Do not call escalation or resolution from this screen.

Severity meaning:
| Severity | Screen label | Treatment |
| --- | --- | --- |
| `p1` | Critical custody exception | Red header accent and top review warning |
| `p2` | Custody review required | Amber header accent |
| `p3` | Custody note | Neutral accent |

Status meaning:
| Issue status | Screen meaning | Primary action |
| --- | --- | --- |
| `open` | New exception awaiting review | `Start review` |
| `in_review` | Manual review underway | `Resolve` or `Escalate` |
| `escalated` | Leadership or senior support required | `Resolve` when evidence allows |
| `resolved` | Decision recorded | `Close issue` |
| `closed` | Issue closed | No mutation action |

## Data Loading Strategy

Initial load:

1. Validate `issueId`.
2. Fetch `get_issue`.
3. If `get_issue` succeeds, fetch `get_delivery`, `get_delivery_timeline`, and `list_issues` for `issue.deliveryId` in parallel.
4. Render the shell immediately with skeleton zones.
5. When the issue loads but delivery evidence is pending, show `Loading custody evidence`.
6. When the issue category is non-custody, stop rendering mutation actions but still allow navigation to issue detail.
7. If delivery fails with `NOT_FOUND`, show `missing_delivery`.
8. If timeline fails but delivery succeeds, show `partial_evidence`.
9. If any endpoint returns `FORBIDDEN`, clear sensitive data for that endpoint and show `not_authorized`.
10. If session expires, clear all screen data.

Refresh:

- Refetch issue, delivery, timeline, and related issues together.
- Keep stale data visible with a clear stale marker.
- Announce `Refreshing custody exception evidence`.
- On completion, announce `Custody exception evidence updated`.

Caching:

- Use authenticated query cache only.
- Clear on sign-out.
- Do not persist issue description or timeline metadata in local storage.
- Do not put issue notes in URL query params.

Failure isolation:

- If related issues fail, keep the core issue and delivery visible.
- If timeline fails, block resolve action unless delivery final state alone supports the selected resolution code.
- If issue refresh fails after a mutation, show `Decision recorded. Refresh failed.` only if the mutation response succeeded.

## Evidence Model

Build a derived evidence object from issue, delivery, timeline, and related issues.

Derived fields:

- `activeIssue`
- `isCustodyIssue`
- `issueStage`
- `issueSeverityLabel`
- `linkedDelivery`
- `custodyConfidence`
- `missingRequiredEvidence`
- `hasHandoffEvent`
- `hasLossIssue`
- `hasDamageIssue`
- `hasFallbackEvidence`
- `hasSupervisorOverride`
- `relatedCustodyIssues`
- `permittedActions`

Custody confidence states:
| State | Meaning |
| --- | --- |
| `evidence_complete` | Expected handoff evidence is visible for the current delivery stage |
| `evidence_partial` | Some expected evidence is visible, but required detail is incomplete |
| `evidence_missing` | A required event is absent after the delivery stage should have it |
| `conflict` | Handoff, loss, or damage issue remains unresolved |
| `escalated` | Issue is escalated and should not be treated as cleared |
| `cleared` | Issue is resolved or closed with a supported resolution code |
| `unknown` | Required evidence endpoint is unavailable |

Rules:

- Use structured fields first.
- Do not parse free-text issue summary for decision logic.
- Do not compare raw proof references.
- Do not compare raw scan codes.
- Do not derive fraud from actor role alone.
- Do not infer that a missing timeline event means the physical event never happened.

## Layout

### Desktop Layout

Use a 12-column layout.

Top bar:

- Breadcrumbs.
- Delivery ID and issue ID.
- Last refreshed timestamp.
- Refresh button.

Hero summary:

- Left 8 columns: exception title, severity, status, issue summary, linked delivery.
- Right 4 columns: decision readiness, permitted primary action, read-only banner when needed.

Main body:

- Left 8 columns: evidence comparison, timeline ledger, related issues.
- Right 4 columns: action rail, status history, safety rules.

Sticky behavior:

- The action rail can be sticky below the admin shell header on desktop.
- The action rail must not cover page content.
- The refresh button remains in the top summary, not in a floating widget.

### Tablet Layout

Use two zones:

- Summary and action panel first.
- Evidence sections below.

Rules:

- Keep action controls visible above the first ledger.
- Collapse related issues after timeline evidence.

### Mobile Layout

Use one column.

Order:

1. Screen title and status.
2. Read-only or risk banner.
3. Primary action footer if permitted.
4. Linked delivery summary.
5. Evidence checklist.
6. Timeline ledger.
7. Related issues.
8. Resolution history.

Rules:

- Use full-width action buttons.
- Avoid horizontal tables; render evidence rows as labeled blocks.
- Sticky footer must respect keyboard and safe areas.
- Long notes must wrap and remain readable.

## Component Structure

### `ManualCustodyExceptionPage`

Responsibilities:

- Validate route.
- Run data queries.
- Derive screen state.
- Coordinate refresh.
- Guard role-based actions.
- Render route-level error states.

Props:

- None beyond router context.

State:

- `activeAction`: `none`, `start_review`, `escalate`, `resolve`, or `close`.
- `isRefreshing`
- `lastRefreshAt`
- `mutationError`

### `ExceptionHeader`

Content:

- `Manual custody exception`
- Issue ID.
- Delivery ID.
- Severity pill.
- Status pill.
- Category pill.
- Updated time.
- Linked delivery route.

Behavior:

- If issue is non-custody, replace title with `Issue is not a custody exception`.
- If status is `closed`, show closed stamp and no primary mutation action.
- If read-only, show `Evidence review only`.

Test ids:

- `admin-custody-exception-header`
- `admin-custody-exception-issue-id`
- `admin-custody-exception-delivery-link`
- `admin-custody-exception-status`
- `admin-custody-exception-severity`

### `ExceptionDecisionPanel`

Purpose:

- Make the next safe decision obvious.

Content:

- Decision readiness state.
- Missing evidence count.
- Required next action.
- Role permission statement.
- Primary button.
- Secondary navigation.

Primary button rules:

- `open` plus action role: `Start review`
- `in_review` plus action role: `Resolve` and `Escalate`
- `escalated` plus action role: `Resolve when evidence supports it`
- `resolved` plus action role: `Close issue`
- `closed`: no mutation button
- `finance_admin`: no mutation button
- Non-custody issue: no mutation button

Test ids:

- `admin-custody-exception-decision-panel`
- `admin-custody-exception-primary-action`
- `admin-custody-exception-secondary-actions`
- `admin-custody-exception-read-only-banner`

### `IssueFactsSummary`

Purpose:

- Show the issue record without overwhelming the decision flow.

Fields:

- Summary.
- Description when present.
- Reporter role.
- Reporter actor ID when already returned by API.
- Created time.
- Updated time.
- Escalation reason when present.
- Resolution code and note when present.

Rules:

- Use a summary-box pattern for the three to five most important facts.
- Do not repeat the same issue text in multiple sections.
- Do not expose issue text in title attributes.
- Do not copy description to clipboard.

Test ids:

- `admin-custody-exception-issue-facts`
- `admin-custody-exception-summary`
- `admin-custody-exception-description`

### `LinkedDeliverySnapshot`

Purpose:

- Show where the physical package currently sits in the lifecycle.

Fields:

- Delivery ID.
- Tracking code.
- Current status.
- Payment status.
- Origin station.
- Destination station.
- Service type.
- Doorstep requested.
- Current custody role.
- Latest touchpoint.
- Assigned driver state.
- Assigned courier state.

Rules:

- Show `Current custodian unavailable` when `currentCustodyRole` is absent but delivery is not terminal.
- Do not show receiver details.
- Do not show sender details.
- Do not provide payment mutation actions.

Test ids:

- `admin-custody-exception-delivery-snapshot`
- `admin-custody-exception-current-custody`
- `admin-custody-exception-latest-touchpoint`

### `CustodyEvidenceChecklist`

Purpose:

- Let the admin scan whether expected handoff evidence supports the decision.

Rows:

- Sender to origin station.
- Origin station to driver.
- Driver to destination station.
- Destination station to final-mile courier when doorstep applies.
- Final-mile courier return to destination station when failed attempt return applies.
- Delivery completion proof when terminal delivery applies.

Row fields:

- Expected step.
- Evidence state.
- Matching timeline entry ID.
- Occurred time.
- Actor role.
- Station ID.
- Proof type.
- Protected reference state.
- Condition.
- Related issue count.

Evidence states:

- `Present`
- `Missing`
- `Partial`
- `Not expected yet`
- `Fallback`
- `Conflict`

Rules:

- A missing row should say evidence is not visible, not that the physical handoff never happened.
- Proof reference displays as `Reference protected`.
- Raw scan values never render.
- Row action opens `AdminCustodyChain` focused on the matching step.

Test ids:

- `admin-custody-exception-evidence-checklist`
- `admin-custody-exception-evidence-row`
- `admin-custody-exception-missing-evidence`

### `TimelineEvidenceLedger`

Purpose:

- Show the chronological evidence and issue events used for review.

Default sorting:

- Newest first.

Filters:

- All entries.
- Handoffs.
- Delivery events.
- Issues.

Each row:

- Entry type.
- Label.
- Occurred time.
- Actor role.
- Station ID.
- Proof type when present.
- Condition when present.
- Redaction marker when protected references exist.

Actions:

- `Copy entry ID`
- `Open custody chain`
- `Open audit events`

Rules:

- Copy only `entryId`.
- Do not copy proof reference.
- Do not copy issue description.
- Empty ledger state says `Timeline evidence is unavailable or not yet recorded.`

Test ids:

- `admin-custody-exception-timeline-ledger`
- `admin-custody-exception-timeline-filter`
- `admin-custody-exception-copy-entry-id`

### `RelatedCustodyIssues`

Purpose:

- Show whether this delivery has other open or resolved custody-related issues.

Include categories:

- `handoff`
- `loss`
- `damage`

Display:

- Active issue.
- Other unresolved custody issues.
- Resolved custody issues.
- Non-custody issues collapsed under `Other delivery issues`.

Row fields:

- Issue ID.
- Category.
- Severity.
- Status.
- Updated time.
- Summary.

Actions:

- `Open issue detail`
- `Open custody exception` for custody issue rows.

Rules:

- Do not merge related issues into the active issue decision automatically.
- Do not show more than five related issues before `View all delivery issues`.

Test ids:

- `admin-custody-exception-related-issues`
- `admin-custody-exception-related-issue-row`

### `StartReviewDrawer`

Trigger:

- User taps `Start review`.

Available when:

- Issue status is `open`.
- Role is `ops_admin`, `support_admin`, or `super_admin`.
- Issue is a custody issue.

Fields:

- Note textarea.
- Evidence acknowledgement checkbox.

Copy:

```text
Move this custody exception into manual review.
```

Validation:

- Note required.
- Note length 5 to 400 characters.
- Acknowledgement required.

Mutation:

- `resolve_issue` with `nextStatus=in_review`.

Success:

- Close drawer.
- Announce `Custody exception moved into review`.
- Refetch data.

Test ids:

- `admin-custody-exception-start-review-drawer`
- `admin-custody-exception-start-review-note`
- `admin-custody-exception-start-review-submit`

### `EscalateIssueDrawer`

Trigger:

- User taps `Escalate`.

Available when:

- Issue status is `open`, `in_review`, or `escalated`.
- Role is `ops_admin`, `support_admin`, or `super_admin`.
- Issue is a custody issue.

Fields:

- Reason code select.
- Note textarea.
- Evidence summary read-only list.

Default reason code:

- `loss_investigation` for `loss`.
- `management_attention` for `handoff`.
- `management_attention` for `damage`.

Validation:

- Reason code required.
- Note required.
- Note length 5 to 400 characters.

Mutation:

- `escalate_issue`.

Success:

- Close drawer.
- Announce `Custody exception escalated`.
- Refetch data.

Test ids:

- `admin-custody-exception-escalate-drawer`
- `admin-custody-exception-escalate-reason`
- `admin-custody-exception-escalate-submit`

### `ResolveIssueDrawer`

Trigger:

- User taps `Resolve`.

Available when:

- Issue status is `open`, `in_review`, or `escalated`.
- Role is `ops_admin`, `support_admin`, or `super_admin`.
- Issue is a custody issue.

Fields:

- Resolution code select.
- Note textarea.
- Evidence support checklist.

Resolution code select rules:

- Hide `refund_approved` from the selectable list. This screen can display it as existing issue history only.
- Show helper text explaining that resolution codes are backend-limited.
- If no code safely fits the evidence, tell the admin to escalate or keep in review.

Validation:

- Resolution code required.
- Note required.
- Note length 5 to 400 characters.
- Evidence support acknowledgement required.

Mutation:

- `resolve_issue` with `nextStatus=resolved`.

Success:

- Close drawer.
- Announce `Custody exception resolved`.
- Refetch data.

Test ids:

- `admin-custody-exception-resolve-drawer`
- `admin-custody-exception-resolution-code`
- `admin-custody-exception-resolve-submit`

### `CloseIssueDrawer`

Trigger:

- User taps `Close issue`.

Available when:

- Issue status is `resolved`.
- Role is `ops_admin`, `support_admin`, or `super_admin`.

Fields:

- Resolution code carried forward or reselected.
- Close note.
- Confirmation checkbox.

Mutation:

- `resolve_issue` with `nextStatus=closed`.

Rules:

- Closing is a separate action.
- Do not auto-close after resolving.
- Do not close escalated issues directly.

Test ids:

- `admin-custody-exception-close-drawer`
- `admin-custody-exception-close-submit`

### `SafetyRulesPanel`

Purpose:

- Keep admins from taking unsafe actions.

Rules shown:

- Do not reveal raw proof references.
- Do not resolve without visible evidence.
- Do not treat free text as custody proof.
- Do not make refund decisions here.
- Escalate when evidence and backend resolution codes do not align.

Test id:

- `admin-custody-exception-safety-rules`

## State Details

### Loading

Trigger:

- Initial issue query is pending.

UI:

- Show page skeleton.
- Keep route title visible.
- Announce `Loading custody exception`.

### Ready

Trigger:

- Issue, delivery, timeline, and related issue queries have usable data.

UI:

- Render all sections.
- Primary action follows status and role rules.

### Not Custody Issue

Trigger:

- Issue category is not `handoff`, `loss`, or `damage`.

UI:

- Show neutral warning.
- Render issue facts.
- Do not render mutation actions.
- Offer `Open issue detail`.

### Read Only

Trigger:

- Current role is `finance_admin`.

UI:

- Show banner:

```text
Finance review is read-only here. Use this evidence before payment or refund review, but custody decisions must be handled by operations or support.
```

Rules:

- No mutation controls.
- Navigation to finance screens can be present when relevant.

### Missing Delivery

Trigger:

- `get_issue` succeeds but linked delivery returns `NOT_FOUND`.

UI:

- Show critical error:

```text
This issue references a delivery that is not available.
```

- No mutation action.
- Offer `Open issue detail`.

### Missing Timeline

Trigger:

- Timeline returns zero entries for an active delivery that should have events.

UI:

- Show red evidence warning.
- Keep issue and delivery facts visible.
- Block resolve action.
- Allow start review or escalate when role permits.

### Partial Evidence

Trigger:

- One or more supporting queries fail while issue remains visible.

UI:

- Show section-level error.
- Keep safe cached data with stale marker.
- Block final resolution until required evidence is visible.

### Mutation Pending

Trigger:

- Escalate or resolve request is in flight.

UI:

- Disable the active drawer submit button.
- Keep drawer open.
- Announce `Saving custody exception decision`.
- Prevent duplicate submit.

### Mutation Error

Trigger:

- Mutation returns validation, transition, authorization, or server error.

UI:

- Show error near drawer form.
- Keep admin-entered note.
- If error is `INVALID_STATUS_TRANSITION`, refetch issue and explain current status changed.
- If error is `FORBIDDEN`, close drawer and show authorization banner.

## Copy System

Tone:

- Operational.
- Direct.
- Evidence-first.
- No blame.
- No emotional language.

Approved terms:

- `custody exception`
- `manual review`
- `visible evidence`
- `protected reference`
- `handoff evidence`
- `resolution code`
- `escalated`
- `read-only evidence review`

Avoid:

- `lost forever`
- `staff error`
- `fraud confirmed`
- `scan matched` unless backend exposes a structured match field
- `refund approved` unless backend issue resolution and finance workflow support it

Reference copy:

```text
Custody evidence is incomplete for this delivery stage.
```

```text
This issue can move into manual review. Resolve only when visible evidence supports one of the backend resolution codes.
```

```text
Reference protected
```

```text
No mutation actions are available for your role on this screen.
```

## Interaction Rules

Keyboard:

- All action buttons reachable by Tab.
- Drawer focus moves to heading on open.
- Escape closes drawer when no mutation is pending.
- Submit buttons expose pending state.
- Focus returns to trigger after drawer closes.

Pointer:

- Row click opens details only if clear.
- Inline row action buttons must have 44 by 44 px target area on touch screens.
- Destructive or final actions require drawer confirmation.

Refresh:

- Refresh button must be available near top.
- Refresh does not discard typed drawer notes unless the user confirms.

Copy:

- Copy allowed: issue ID, delivery ID, timeline entry ID.
- Copy forbidden: proof reference, scan code, issue description, resolution note.

## Accessibility

Structure:

- One `h1`: `Manual custody exception`.
- Section headings use `h2` and `h3` in order.
- Use semantic tables only on desktop where true tabular comparison exists.
- Use lists for mobile evidence cards.

Announcements:

- Loading state uses polite status.
- Refresh completion uses polite status.
- Mutation success uses polite status.
- Mutation error uses assertive status.

Focus:

- Visible focus on all controls.
- Focus ring must meet WCAG focus appearance expectations.
- Drawer focus trap required.
- Toasts must not steal focus.

Color:

- Status cannot rely on color alone.
- Every status pill includes text and icon or shape.
- Contrast must meet WCAG AA minimum.

Reduced motion:

- Drawer animation must respect reduced motion preference.
- Evidence row updates should use opacity and position only when motion is allowed.
- No constant motion.

## Privacy And Security

Never render:

- Raw proof references.
- Raw scan codes.
- Receiver phone number.
- Payment provider references.
- Internal auth token details.
- Hidden issue text in DOM attributes.

Never send to analytics:

- Issue summary.
- Issue description.
- Resolution note.
- Escalation note.
- Proof reference.
- Actor ID.
- Receiver data.

Allowed analytics fields:

- `issueId`
- `deliveryId`
- `category`
- `severity`
- `status_before`
- `status_after`
- `action`
- `role`
- `result`

Audit expectations:

- Backend audit logging owns mutation evidence.
- Frontend analytics must not substitute for backend audit events.
- UI should link to `AdminAuditEvents` when available, but not invent audit event data.

## Analytics

Events:

- `admin_custody_exception_viewed`
- `admin_custody_exception_refreshed`
- `admin_custody_exception_start_review_opened`
- `admin_custody_exception_start_review_submitted`
- `admin_custody_exception_escalate_opened`
- `admin_custody_exception_escalate_submitted`
- `admin_custody_exception_resolve_opened`
- `admin_custody_exception_resolve_submitted`
- `admin_custody_exception_close_opened`
- `admin_custody_exception_close_submitted`
- `admin_custody_exception_related_issue_opened`
- `admin_custody_exception_custody_chain_opened`

Required properties:

- `issueId`
- `deliveryId`
- `category`
- `severity`
- `issue_status`
- `role`
- `custody_confidence`

Forbidden properties:

- `summary`
- `description`
- `note`
- `proofReference`
- `scanCode`
- `receiverName`
- `receiverPhone`
- `actorId`

## Empty And Error States

### Invalid Issue ID

Title:

```text
Invalid custody exception reference
```

Body:

```text
This route needs a valid issue ID before evidence can be loaded.
```

Actions:

- `Back to issue queue`

### Issue Not Found

Title:

```text
Custody exception not found
```

Body:

```text
The issue may have been removed, merged, or you may not have access.
```

Actions:

- `Back to issue queue`
- `Search deliveries`

### Not Authorized

Title:

```text
You do not have access to this custody exception
```

Body:

```text
Use an authorized admin account or ask a super admin to review access.
```

Actions:

- `Back to admin overview`

### Session Expired

Title:

```text
Session expired
```

Body:

```text
Sign in again to review custody evidence.
```

Actions:

- `Sign in`

### API Error

Title:

```text
Custody exception could not load
```

Body:

```text
The evidence service did not respond. Refresh before making a decision.
```

Actions:

- `Refresh`
- `Back to issue queue`

## Responsive Behavior

Desktop:

- Max content width: 1440 px.
- Evidence body uses 8 columns.
- Action rail uses 4 columns.
- Tables can show full metadata labels.

Tablet:

- Action rail moves below header.
- Evidence checklist remains compact.
- Related issues collapse by default after five rows.

Mobile:

- No horizontal scrolling required.
- Evidence checklist rows become stacked blocks.
- Sticky action footer appears only for permitted actions.
- Drawer becomes full-height sheet.
- Notes textarea stays above keyboard.

## Performance

Targets:

- First useful paint with route shell under 1.5 seconds on a normal admin connection.
- Keep timeline rendering responsive up to 200 entries.
- Virtualize only if row count exceeds the design-system table threshold.
- Avoid heavy chart libraries.
- Avoid loading proof media.

Data:

- Fetch issue first, then dependent queries by delivery ID.
- Related issues and timeline can load in parallel.
- Use request cancellation on route change.
- Do not refetch continuously.

## Test Coverage Requirements

Unit tests:

- Route issue ID validation.
- Custody category qualification.
- Role action matrix.
- Issue status to primary action mapping.
- Resolution code visibility rules.
- Custody confidence derivation.
- Redaction helper.
- Analytics payload sanitizer.

Integration tests:

- Loads issue then delivery and timeline.
- Finance admin sees read-only evidence.
- Ops admin can start review.
- Support admin can escalate.
- Super admin can resolve and close.
- Non-custody issue renders safe redirect path.
- Timeline failure blocks resolution.
- Mutation transition error refetches issue.

Accessibility tests:

- Heading order.
- Drawer focus trap.
- Keyboard action flow.
- Status announcements.
- Color contrast for all severity states.
- Reduced motion behavior.

Visual regression states:

- `open` P1 handoff issue with missing evidence.
- `in_review` P2 damage issue with partial evidence.
- `escalated` loss issue.
- `resolved` issue awaiting closure.
- `closed` issue.
- `finance_admin` read-only.
- `not_custody_issue`.
- `partial_evidence`.

## Implementation Checklist

- Create route `/admin/custody-exceptions/:issueId`.
- Add route guard for admin roles.
- Validate issue ID before API calls.
- Add query hook composition: issue first, then delivery, timeline, related issues.
- Build role action matrix from shared capabilities or existing admin auth context.
- Build redaction helper for timeline metadata.
- Build custody qualification helper.
- Build confidence derivation helper.
- Build action drawers for review, escalation, resolution, and closure.
- Wire `escalate_issue` and `resolve_issue` only where role and state permit.
- Refetch all evidence after successful mutation.
- Add analytics sanitizer.
- Add tests listed above.
- Add story states or fixture-backed route states if the repo uses visual review tooling.

## Do Not Build

Do not build:

- A separate custody exception API client.
- Direct Firestore reads.
- Scan-code reveal UI.
- Proof-reference copy actions.
- Refund approval UI.
- Payment reconciliation UI.
- Actor profile reveal drawers.
- Receiver contact reveal UI.
- Auto-resolution based on issue summary.
- Automatic issue escalation on page load.

## Acceptance Criteria

The screen is complete when:

- A valid custody issue loads its issue, delivery, timeline, and related issue evidence.
- A non-custody issue cannot be handled as a custody exception.
- Finance admins can review evidence but cannot mutate issue state.
- Allowed admins can start review, escalate, resolve, and close only within backend transition rules.
- Resolution requires a supported backend resolution code.
- Timeline failure blocks unsafe resolution.
- Raw proof references and scan values never render.
- Notes and issue text never enter analytics.
- All required empty and error states exist.
- Keyboard and screen reader flows work through all drawers.
- Local tests cover derivation, permissions, redaction, and mutation state.

## Claude Code Build Brief

Build `AdminManualCustodyException` as a serious admin evidence review screen for `/admin/custody-exceptions/:issueId`. Use `get_issue` as the entry record, then load `get_delivery`, `get_delivery_timeline`, and `list_issues` from the linked delivery. Treat only `handoff`, `loss`, and `damage` issues as custody exceptions. Make finance read-only. Use existing `escalate_issue` and `resolve_issue` mutations only for roles and states that the backend permits. Protect proof references, scan values, issue notes, and analytics. The screen must help admins make the next safe custody decision without inventing unsupported backend data.
