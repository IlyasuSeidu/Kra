# Ops Custody Chain Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID          | `OpsCustodyChain`                                                                                                                                                                                                                                                       |
| App                | `apps/mobile`                                                                                                                                                                                                                                                           |
| Route              | `/(ops)/deliveries/:deliveryId/custody`                                                                                                                                                                                                                                 |
| Primary test ID    | `screen-ops-custody-chain`                                                                                                                                                                                                                                              |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                                                           |
| Build priority     | `P0 Operations Critical`                                                                                                                                                                                                                                                |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `deliveryDetailResponseSchema`, `deliveryTimelineResponseSchema`, `deliveryTimelineEntrySchema`, `AuthPrincipal`, `roleSchema`, `getCapabilities`, `canPerform`                                                                |
| Related routes     | `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/scan`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/support`, admin custody/audit routes when configured                                                                |
| Required states    | `loading_detail`, `loading_timeline`, `ready`, `empty_chain`, `missing_evidence`, `partial_evidence`, `fallback_evidence_unknown`, `conflict_detected`, `issue_present`, `offline_cached`, `stale_cache`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job

This screen is the shared staff custody-evidence view for one delivery. It helps station operators, drivers, couriers, support staff, and ops admins answer who last had verified custody, what evidence exists, what evidence is missing, and what route should be opened for review or recovery.

The screen answers one operational question: `Can we prove the custody path of this package from sender intake through the latest verified handoff?`

The staff member should be able to:

- See the current custody owner from the delivery detail response.
- See expected handoff steps for the delivery lifecycle.
- See which handoff events are present in the timeline.
- See proof type and condition where the timeline exposes them.
- See issue events that affect custody confidence.
- See missing, partial, stale, or conflicting evidence states.
- Open the delivery detail route.
- Open scan workflow when evidence can still be captured.
- Open issue creation when evidence is missing or conflicting.
- Open support when access, scope, or backend state prevents resolution.
- Understand when some evidence is not exposed by the current API contract.

This screen is not:

- A custody mutation screen.
- A scan submission screen.
- A proof upload screen.
- A refund dispute screen.
- A payment console.
- A public tracking page.
- A raw audit-log browser.
- A place to edit timeline entries.
- A place to override handoff records.
- A place to expose raw proof references or raw actor IDs.

## Audience

Primary audience:

- Station operators checking handoff evidence before receiving, dispatching, or escalating a package.
- Drivers checking whether pickup or destination handoff was recorded.
- Final-mile couriers checking whether courier custody was confirmed.
- Support staff reviewing delivery complaints, delay reports, damage reports, or loss claims.
- Ops admins reviewing package custody on mobile.

Secondary audience:

- Claude Code implementing the shared custody route.
- QA validating handoff evidence and edge states.
- Security reviewers checking data exposure.
- Operations leads checking accountability rules.
- Accessibility reviewers checking timeline navigation and status messaging.

## User State

The user is likely responding to uncertainty: a package is blocked, a scan failed, a handoff is disputed, a receiver asks where the package is, or a staff member needs proof before taking the next action.

The user may be:

- At origin station checking whether intake proof exists.
- A driver checking whether pickup custody transferred.
- At destination station checking whether driver-to-station receipt exists.
- A courier checking whether assigned final-mile custody is already accepted.
- Support reviewing a missing package claim.
- Ops admin reviewing an exception.
- Offline with cached evidence after opening the delivery earlier.

The screen must:

- Treat `get_delivery` as current delivery state.
- Treat `get_delivery_timeline` as the evidence list.
- Show current custody separately from historical timeline entries.
- Show expected handoff steps even when events are missing.
- Use only fields exposed by the API.
- Hide raw actor IDs and raw proof references by default.
- Mark evidence incomplete when the timeline lacks a required handoff event.
- Mark evidence partial when detail loads but timeline does not.
- Never create or alter custody records.

## Primary Action

Primary action by state:

- `ready`: open relevant evidence row or return to delivery detail.
- `missing_evidence`: report issue.
- `partial_evidence`: refresh timeline.
- `fallback_evidence_unknown`: open support or admin audit route when available.
- `conflict_detected`: report issue.
- `issue_present`: open issue route or support route.
- `offline_cached`: refresh when online or open offline outbox.
- `stale_cache`: refresh before relying on evidence.
- `not_authorized`: go back.
- `not_found`: go back or support.

Secondary actions:

- `Back to delivery`
- `Open scan`
- `Report issue`
- `Open support`
- `Open offline outbox`
- `Refresh`

Blocked behavior:

- Do not transfer custody.
- Do not create handoff events.
- Do not submit scans.
- Do not upload proof.
- Do not approve supervisor fallback.
- Do not edit actor, station, proof, or condition data.
- Do not reveal `actorId`, `currentCustodyActorId`, `proofReference`, or raw timeline metadata in normal UI.
- Do not infer proof fields that are absent from `deliveryTimelineResponseSchema`.
- Do not treat assignment as custody.

## First Meaningful Value

First meaningful value is reached when staff sees:

- Delivery tracking code.
- Current custody role.
- Current status.
- Evidence confidence.
- Expected handoff chain.
- Timeline freshness.
- Missing or conflict warning if present.

The first viewport must answer:

- `Who currently has custody according to the delivery record?`
- `Which handoff evidence exists?`
- `Which handoff evidence is missing?`
- `Is this evidence fresh enough to trust?`
- `What should I open if evidence is missing or conflicting?`

## Main Tension

Custody evidence must be easy to scan under operational pressure, but it cannot overstate certainty. The screen must turn raw timeline events into accountability without inventing facts that the API does not provide.

The design must balance:

- Fast operator comprehension against audit precision.
- Current custody against historical handoff sequence.
- Missing evidence against not blaming a specific person without proof.
- Raw evidence records against privacy and security.
- Mobile readability against timeline depth.
- Offline access against stale-data risk.
- Support usefulness against mutation safety.

## Design Brief

User and job:

- Staff needs to verify custody evidence for one delivery and decide whether to proceed, refresh, escalate, or return.

Context of use:

- Mobile, field operations, package dispute, handoff checkpoint, weak network, time pressure.

Entry point:

- Ops delivery detail custody strip.
- Scan mismatch recovery.
- Duplicate scan recovery.
- Issue creation flow.
- Station handoff log.
- Driver or courier work detail.
- Admin audit route.
- Offline outbox replay failure.

Success state:

- User understands the current custody owner, expected chain, evidence gaps, and safe next route.

Primary action:

- Review custody evidence and open the appropriate recovery route.

Navigation model:

- Evidence summary at top, expected custody chain below, raw timeline-derived evidence rows below each step.

Density:

- Medium. Evidence must be complete but not database-like.

Visual thesis:

- A tamper-aware custody ledger: calm, chronological, and exact, with strong missing-evidence cues.

Restraint rule:

- Avoid decorative timelines, actor-ID clutter, raw metadata dumps, and mutation buttons.

Product lens:

- Accountability, loss prevention, and dispute readiness.

System stance:

- Read-only evidence route derived from delivery detail and timeline contracts.

Interaction thesis:

- Show current owner, compare expected handoffs to recorded evidence, expose gaps, route to recovery.

Signature move:

- A top `Custody confidence` panel that classifies evidence as verified, partial, missing, stale, or conflicting.

Activation event:

- User opens issue, scan, support, offline outbox, refresh, or returns to delivery detail with evidence understood.

## Elite Quality Gate

This spec is not closed unless `OpsCustodyChain` is truthful about evidence availability and cannot mutate custody.

Non-negotiable quality requirements:

- Current custody appears above the fold.
- Evidence confidence appears above the fold.
- Expected handoff chain is visible even when timeline entries are missing.
- `get_delivery` and `get_delivery_timeline` are read-only.
- Timeline entries use `deliveryTimelineEntrySchema`.
- Handoff rows clearly distinguish present, missing, partial, stale, conflict, and issue states.
- Raw proof references and raw actor IDs are hidden in normal UI.
- Fallback and supervisor details are shown only if exposed by the API.
- Missing evidence routes to issue/support, not silent success.
- Offline cached evidence is visibly marked.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:

- If this screen can create or edit custody, the screen remains open.
- If raw proof references are exposed as normal copy, the screen remains open.
- If missing evidence can look verified, the screen remains open.
- If fallback or supervisor details are invented client-side, the screen remains open.
- If stale cached evidence looks current, the screen remains open.
- If issue events are hidden from custody confidence, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [NIST SP 800-92, Guide to Computer Security Log Management](https://csrc.nist.gov/pubs/sp/800/92/final): audit records should preserve trustworthy event history for monitoring, review, and incident response.
- [Material Design lists](https://m1.material.io/components/lists.html): evidence rows should be vertically scannable with predictable hierarchy.
- [Material Design accessibility](https://m1.material.io/usability/accessibility.html): timelines, labels, and controls must remain understandable to assistive technology.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): loading, refresh, missing evidence, and conflict states need programmatic announcement.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): evidence actions and row disclosures need reliable touch targets.

Applied decisions:

- Use expected-chain comparison, not a plain event feed.
- Keep current custody separate from past evidence.
- Show absent evidence as an explicit state.
- Hide raw references while still showing proof type.
- Prefer issue/support recovery over unsafe quick fixes.

## Data Contract And Backend Alignment

Primary delivery read:

- Operation: `get_delivery`.
- HTTP: `GET /v1/deliveries/:id`.
- Schema: `deliveryDetailResponseSchema`.
- Purpose: current custody, current status, station path, assignment context, final proof summary, and latest event.

Primary timeline read:

- Operation: `get_delivery_timeline`.
- HTTP: `GET /v1/deliveries/:id/timeline`.
- Schema: `deliveryTimelineResponseSchema`.
- Entry schema: `deliveryTimelineEntrySchema`.
- Purpose: chronological delivery events, handoff events, and issue events.

Required delivery fields:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- `finalProof`
- `createdAt`

Required timeline fields:

- `entryId`
- `entryType`
- `occurredAt`
- `label`
- `actorId`
- `actorRole`
- `stationId`
- `metadata`

Current timeline metadata exposure:

- Handoff entries currently expose `proofType`.
- Handoff entries currently expose `proofReference`.
- Handoff entries currently expose `condition` when present.
- Issue entries currently expose `severity`, `category`, and `summary`.
- Delivery entries may expose operation-specific metadata.

Important API limitation:

- `HandoffEventRecord.proof` includes `fallbackUsed` and `supervisorOverrideActorId`.
- `deliveryTimelineResponseSchema` currently does not expose `fallbackUsed` or `supervisorOverrideActorId` through timeline metadata.
- The UI must not claim fallback or supervisor approval details are visible unless the API adds them.
- The UI may show `Fallback detail unavailable in mobile timeline` when policy requires review and the field is absent.

Display restrictions:

- Do not show `actorId`.
- Do not show `currentCustodyActorId`.
- Do not show `assignedDriverId`.
- Do not show `assignedFinalMileCourierId`.
- Do not show `proofReference` as raw copy.
- Do not show raw timeline `metadata`.
- Do not expose issue summary if role policy marks it restricted.

Permitted display:

- Show `actorRole` as role label.
- Show `stationId` as station label.
- Show `proofType` as evidence type.
- Show `condition` as package condition.
- Show `severity` and `category` as issue summary when role allows.
- Show exact timestamp and relative time.

## Custody Confidence Model

The confidence panel classifies evidence into one of these states.

`verified`:

- Current custody role exists.
- Required handoff events up to current status are present.
- No active issue event indicates loss, damage, handoff conflict, or missing proof.
- Timeline is fresh.

`partial_evidence`:

- Delivery detail loaded but timeline failed or is incomplete.
- Timeline entries exist but required handoff sequence cannot be fully determined.
- Some proof type or condition fields are missing from exposed metadata.

`missing_evidence`:

- A required handoff event for the current status is absent.
- Delivered status lacks `finalProof`.
- Current custody is null before expected completion.

`fallback_evidence_unknown`:

- Policy expects fallback visibility but timeline response does not expose fallback fields.
- API has not provided fallback or supervisor fields required for staff review.

`conflict_detected`:

- Timeline order contradicts current delivery status.
- Actor role conflicts with expected handoff role.
- Station scope conflicts with expected origin or destination station.
- Issue event category or summary indicates handoff, loss, damage, or proof conflict.

`stale`:

- Evidence loaded from cache or older than the configured freshness threshold.

`empty_chain`:

- No timeline entries exist.
- Delivery is in a state where no handoff evidence is expected yet, or data is missing.

Confidence copy:

- `Custody verified`
- `Evidence is partial`
- `Handoff evidence missing`
- `Fallback detail unavailable`
- `Custody conflict detected`
- `Evidence is stale`
- `No custody evidence yet`

## Expected Handoff Chain

The chain should render expected steps based on delivery status, service type, and doorstep selection.

Baseline expected steps:

- `sender_to_origin_station`
- `origin_station_to_driver`
- `driver_to_destination_station`
- `destination_station_to_final_mile_courier` when doorstep final mile is used.
- `final_mile_courier_to_receiver` when delivery completion proof is expected.

Step labels:

- Sender to origin station.
- Origin station to driver.
- Driver to destination station.
- Destination station to final-mile courier.
- Final-mile courier to receiver.

Step evidence requirements:

- Sender to origin station: package ID, sender confirmation, intake timestamp.
- Origin station to driver: package scan, driver confirmation, dispatch timestamp.
- Driver to destination station: arrival confirmation, receipt scan, condition check.
- Destination station to final-mile courier: package scan, courier confirmation, assignment timestamp.
- Final-mile courier to receiver: verified receiver OTP token, signature, or delivery photo plus timestamp.

Step states:

- `not_due`: delivery has not reached this step.
- `expected`: step is due for current status.
- `recorded`: timeline has matching `handoff_event`.
- `missing`: step should exist but no matching handoff event appears.
- `partial`: matching event exists but exposed evidence is incomplete.
- `conflict`: matching event conflicts with status, actor role, station, or issue events.
- `review`: issue event or fallback limitation requires review.

Matching logic:

- Use `entryType=handoff_event`.
- Use normalized `label` from handoff type where available.
- Use `actorRole`, `stationId`, `occurredAt`, and metadata to strengthen matching.
- Do not require raw actor ID display.
- Do not rely on `label` alone for security decisions.

## Current Custody Summary

Show current custody separately from chain steps.

Fields:

- `Current custodian`
- `Current status`
- `Latest touchpoint`
- `Latest event`
- `Evidence confidence`
- `Last updated`

Custody role display:

- `station_operator`: `Station operator`.
- `driver`: `Driver`.
- `final_mile_courier`: `Final-mile courier`.
- `null`: `No active custodian`.

Station context:

- Use `latestTouchpoint.stationId`, `originStationId`, and `destinationStationId` to label station context.
- Show `Origin station` or `Destination station` only as context, not as API custody role.

Delivered state:

- If `currentStatus=delivered` and `finalProof` exists, show proof type, received-by name, and captured time.
- Hide raw `finalProof.reference`.
- If `currentStatus=delivered` and `finalProof` is absent, show `Final proof missing`.

## Information Architecture

The screen uses five stacked regions.

Region 1: Header

- Back control.
- Tracking code.
- Current status.
- Freshness indicator.
- Refresh control.

Region 2: Confidence panel

- Current custodian.
- Evidence confidence.
- Latest verified touchpoint.
- Primary recovery action when evidence is missing.

Region 3: Expected chain

- One row per expected handoff step.
- Step state.
- Required proof.
- Recorded evidence summary.
- Missing/conflict warning.

Region 4: Timeline evidence

- Filtered evidence entries.
- Handoff events first by relevance.
- Delivery and issue events available as supporting context.
- Exact timestamps and role/station labels.

Region 5: Recovery actions

- Report issue.
- Open scan.
- Back to delivery.
- Open support.
- Open offline outbox when relevant.

Sticky footer:

- Do not use a sticky mutation footer.
- A sticky `Report issue` action is allowed only when evidence is missing or conflict is active.

## Layout Specification

Mobile layout:

- Single-column scroll view.
- Header remains compact and sticky after scroll.
- Confidence panel sits above expected chain.
- Expected chain uses vertical stepper layout.
- Timeline evidence appears after expected chain.
- Recovery actions remain close to warning states.

Small-phone layout:

- Step rows use stacked label/value layout.
- Hide secondary detail behind disclosure rows.
- Keep confidence state visible without requiring wide cards.
- Use short copy and full-width actions.

Tablet layout:

- Two-column layout is allowed.
- Left column: confidence and expected chain.
- Right column: timeline evidence and recovery.

Visual direction:

- Neutral ledger base.
- Verified state uses restrained success styling.
- Missing and conflict states use strong warning styling.
- Stale states use a subdued caution treatment.
- Issue events use a distinct marker.
- Timeline connectors are simple and functional.

Motion:

- Step rows may reveal in sequence after data load.
- Refresh may use small progress feedback.
- Conflict or missing evidence should not animate repeatedly.
- Respect reduced motion.

## Component Inventory

Required components:

- `OpsCustodyChainScreen`
- `CustodyHeader`
- `CustodyFreshnessIndicator`
- `CustodyConfidencePanel`
- `CurrentCustodianSummary`
- `ExpectedHandoffChain`
- `CustodyStepRow`
- `EvidenceSummary`
- `TimelineEvidenceList`
- `TimelineEvidenceRow`
- `MissingEvidenceNotice`
- `FallbackUnavailableNotice`
- `CustodyConflictNotice`
- `CustodyRecoveryActions`
- `CustodyErrorState`

Shared primitives:

- `Screen`
- `SafeAreaView`
- `ScrollView`
- `Button`
- `IconButton`
- `Text`
- `Badge`
- `Card`
- `Divider`
- `Skeleton`
- `AlertBanner`
- `Toast`

Do not create:

- A custody mutation button.
- A raw event JSON viewer for production UI.
- A proof reference display component.
- An actor ID display component.
- A supervisor override approval component.
- A payment action component.

## Content Specification

Header copy:

- Title: `Custody chain`
- Subtitle: `Delivery {trackingCode}`
- Fresh: `Evidence updated just now`
- Stale: `Evidence stale since {relativeTime}`
- Offline: `Showing saved evidence`

Confidence copy:

- Verified title: `Custody verified`
- Verified body: `Required handoff evidence is present for the current delivery state.`
- Partial title: `Evidence is partial`
- Partial body: `Some timeline evidence could not be loaded. Refresh before relying on this chain.`
- Missing title: `Handoff evidence missing`
- Missing body: `One or more required handoff records are not present. Report an issue before proceeding.`
- Conflict title: `Custody conflict detected`
- Conflict body: `Timeline evidence conflicts with the current delivery state or issue history.`
- Fallback title: `Fallback detail unavailable`
- Fallback body: `Mobile timeline does not expose fallback or supervisor fields yet. Use admin audit review if needed.`
- Empty title: `No custody evidence yet`
- Empty body: `No handoff evidence has been recorded for this delivery.`

Step copy:

- Not due: `Not due yet`
- Expected: `Expected now`
- Recorded: `Evidence recorded`
- Missing: `Evidence missing`
- Partial: `Evidence partial`
- Conflict: `Needs review`

Action copy:

- `Refresh evidence`
- `Report issue`
- `Open scan`
- `Back to delivery`
- `Open support`
- `Open offline outbox`

Tone:

- Direct.
- Evidence-first.
- Calm.
- No blame.
- No unsupported certainty.

## State Matrix

`loading_detail`:

- Show header and confidence skeleton.
- Do not show chain until delivery detail is known.

`loading_timeline`:

- Show delivery detail and current custody.
- Show timeline skeleton.
- Mark evidence confidence as partial until timeline arrives.

`ready`:

- Show confidence panel, expected chain, and timeline evidence.
- Show role-safe recovery actions.

`empty_chain`:

- Show current custody and no evidence state.
- If status expects evidence, classify as missing evidence.
- If status does not yet expect evidence, classify as no custody evidence yet.

`missing_evidence`:

- Show missing step markers.
- Promote report issue.
- Keep scan route if current role can still capture the required evidence.

`partial_evidence`:

- Show loaded entries.
- Mark incomplete source.
- Promote refresh.

`fallback_evidence_unknown`:

- Show notice only when fallback detail matters but API does not expose fallback fields.
- Route ops/admin users to admin audit route when configured.
- Otherwise route to support.

`conflict_detected`:

- Show conflict notice.
- Promote issue route and support.
- Do not show scan as primary unless scan can resolve the conflict.

`issue_present`:

- Show issue event in evidence list.
- Promote issue/support route.
- Keep chain visible.

`offline_cached`:

- Show saved evidence with offline banner.
- Do not mark confidence as verified without freshness warning.
- Show offline outbox if queued actions exist.

`stale_cache`:

- Show stale warning.
- Require refresh before relying on chain for new handoff.

`not_found`:

- Hide delivery fields.
- Show not found recovery.

`not_authorized`:

- Hide delivery fields.
- Show access recovery.

`session_expired`:

- Hide sensitive cached fields unless session policy allows them.
- Prompt sign-in.

`api_error`:

- Show retry and support.
- If cached data exists, show it as stale.

## Error Code Mapping

`AUTH_REQUIRED`:

- State: `session_expired`.
- Copy: `Sign in again to continue.`
- Actions: sign in.

`FORBIDDEN`:

- State: `not_authorized`.
- Copy: `You do not have permission to view this custody chain.`
- Actions: back, support.

`FORBIDDEN_ROLE`:

- State: `not_authorized`.
- Copy: `Your role cannot view this custody chain.`
- Actions: back, support.

`NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery record not found.`
- Actions: back, support.

`DELIVERY_NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery record not found.`
- Actions: back, support.

`INVALID_STATUS_TRANSITION`:

- State: `conflict_detected`.
- Copy: `This delivery cannot move to that state yet.`
- Actions: report issue, back to delivery.

`PACKAGE_SCAN_MISMATCH`:

- State: `conflict_detected`.
- Copy: `A package scan does not match this delivery.`
- Actions: open scan, report issue, support.

`HANDOFF_PROOF_REQUIRED`:

- State: `missing_evidence`.
- Copy: `Required handoff proof is missing.`
- Actions: open scan, report issue.

`CONFLICTING_HANDOFF_STATE`:

- State: `conflict_detected`.
- Copy: `The handoff state conflicts with the current record.`
- Actions: report issue, support.

`VALIDATION_ERROR`:

- State: `api_error`.
- Copy: `Some required information is missing or invalid.`
- Actions: back, support.

`RATE_LIMITED`:

- State: `api_error`.
- Copy: `Too many requests. Try again shortly.`
- Actions: retry after delay.

## Evidence Row Rules

Handoff event row:

- Show handoff label.
- Show proof type.
- Show condition if present.
- Show station label if present.
- Show actor role label.
- Show exact timestamp.
- Hide raw proof reference.
- Hide raw actor ID.

Delivery event row:

- Show lifecycle label.
- Show previous and next state only when metadata exposes enough context.
- Show station label if present.
- Show actor role label.
- Show exact timestamp.
- Hide raw metadata.

Issue event row:

- Show issue status label.
- Show severity and category when available.
- Show summary only when role policy allows.
- Show updated time.
- Mark issue as affecting confidence when category is handoff, damage, loss, proof, or other custody-sensitive category.

Evidence indicators:

- `Package scan recorded`
- `Delivery proof recorded`
- `Condition recorded: ok`
- `Condition recorded: damaged`
- `Issue affects custody`
- `Raw reference hidden`
- `Fallback detail unavailable`

## Privacy And Security

Security rules:

- Backend authorization is required before rendering custody evidence.
- Raw actor IDs are never normal copy.
- Raw proof references are never normal copy.
- Raw timeline metadata is never normal copy.
- Issue summary visibility must follow role policy.
- Cached evidence must clear on sign-out.
- Analytics must not include proof references or actor IDs.

Safe copy strategy:

- Use roles, stations, timestamps, and proof type.
- Use `Evidence recorded` rather than exposing the underlying reference.
- Use `Supervisor detail unavailable` rather than inventing fallback audit content.

Audit integrity:

- This screen reads evidence only.
- It must not create audit events except optional view analytics.
- It must not allow editing history.
- It must not allow deleting or hiding timeline entries.

## Offline And Freshness

Freshness states:

- `fresh`: detail and timeline loaded from network.
- `cached`: evidence loaded from local storage while offline.
- `stale`: evidence older than configured threshold.
- `partial`: detail loaded but timeline missing or incomplete.

UI rules:

- Fresh evidence can show verified confidence if all required events are present.
- Cached evidence cannot show verified without cached indicator.
- Stale evidence must require refresh before new handoff.
- Partial evidence must show partial confidence.

Offline recovery:

- Open offline outbox if queued scan or proof actions exist.
- Show previous evidence only with saved timestamp.
- Do not imply queued handoff has completed before backend confirmation.
- If queued action failed, show conflict or missing evidence state with outbox route.

## Accessibility Requirements

Screen reader:

- Announce current custody and confidence state near the top.
- Each custody step announces step label, state, required evidence, recorded evidence, and timestamp.
- Missing evidence and conflict notices are announced as status or alert messages.
- Refresh success and failure use status messages.
- Raw IDs are not included in accessible labels.

Focus:

- Initial focus lands on screen title.
- Error states move focus to error title.
- After refresh, focus remains stable unless the state changes to an error.
- Opening a step disclosure moves focus to the disclosed heading.

Touch:

- Step disclosures and actions meet target-size requirements.
- Row tap areas are predictable.
- Recovery actions are full-width on small phones.

Visual:

- Do not rely on color alone.
- Every state marker has text.
- Timeline connector remains visible in high contrast.
- Large text does not collapse step status.
- Missing and conflict states remain obvious in monochrome.

Motion:

- Respect reduced motion.
- Avoid continuous attention-grabbing animation.
- Use small progress feedback for refresh only.

Localization:

- Avoid idioms.
- Use localized date/time formatting.
- Keep proof labels short.
- Do not concatenate translated fragments in chain rows where grammar could break.

## Analytics And Observability

Required analytics events:

- `ops_custody_chain_viewed`
- `ops_custody_chain_refresh_started`
- `ops_custody_chain_refresh_succeeded`
- `ops_custody_chain_refresh_failed`
- `ops_custody_chain_missing_evidence_seen`
- `ops_custody_chain_conflict_seen`
- `ops_custody_chain_partial_seen`
- `ops_custody_chain_issue_opened`
- `ops_custody_chain_scan_opened`
- `ops_custody_chain_support_opened`
- `ops_custody_chain_offline_viewed`
- `ops_custody_chain_stale_viewed`

Allowed analytics fields:

- `deliveryId`
- `trackingCode`
- `role`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `originStationId`
- `destinationStationId`
- `confidenceState`
- `handoffStepCount`
- `missingStepCount`
- `issueEventCount`
- `isOffline`
- `isStale`
- `errorCode`

Do not send:

- Raw `actorId`.
- Raw `currentCustodyActorId`.
- Raw `proofReference`.
- Raw timeline metadata.
- Receiver phone.
- Receiver address.
- Package description.

Operational logs:

- Log delivery and timeline API latency separately.
- Log confidence state distribution.
- Log missing evidence count by handoff step.
- Log stale cache age buckets.
- Log API limitation hits for fallback detail unavailable.

## Performance Requirements

Budget:

- Header and confidence skeleton render immediately.
- Detail target: under 1.5 seconds on healthy mobile network.
- Timeline target: under 2.5 seconds on healthy mobile network.
- Timeline failure must not block current custody summary.

Data loading:

- Load `get_delivery` and `get_delivery_timeline` concurrently when possible.
- Render current custody as soon as detail arrives.
- Render chain confidence when both detail and timeline are available.
- Cache detail and timeline separately with freshness metadata.
- De-duplicate refresh calls.

Rendering:

- Use virtualized list if evidence rows can grow large.
- Keep expected chain rows always visible even with long timeline.
- Avoid heavy media previews on mobile.
- Avoid loading proof images or signatures from this screen unless a future secure evidence viewer exists.

Failure isolation:

- Timeline failure creates partial state, not total screen failure.
- Analytics failure does not block UI.
- Support route failure does not erase visible evidence.

## Test IDs

Primary:

- `screen-ops-custody-chain`

Header:

- `ops-custody-chain-back`
- `ops-custody-chain-title`
- `ops-custody-chain-tracking-code`
- `ops-custody-chain-status`
- `ops-custody-chain-freshness`
- `ops-custody-chain-refresh`

Confidence:

- `ops-custody-chain-confidence-panel`
- `ops-custody-chain-current-custodian`
- `ops-custody-chain-confidence-state`
- `ops-custody-chain-latest-touchpoint`
- `ops-custody-chain-warning`

Expected chain:

- `ops-custody-chain-expected`
- `ops-custody-chain-step`
- `ops-custody-chain-step-state`
- `ops-custody-chain-step-required-proof`
- `ops-custody-chain-step-recorded-proof`
- `ops-custody-chain-step-missing`
- `ops-custody-chain-step-conflict`

Timeline:

- `ops-custody-chain-timeline`
- `ops-custody-chain-timeline-loading`
- `ops-custody-chain-timeline-empty`
- `ops-custody-chain-evidence-row`
- `ops-custody-chain-handoff-row`
- `ops-custody-chain-delivery-event-row`
- `ops-custody-chain-issue-row`

Recovery:

- `ops-custody-chain-report-issue`
- `ops-custody-chain-open-scan`
- `ops-custody-chain-open-support`
- `ops-custody-chain-open-offline-outbox`
- `ops-custody-chain-back-to-delivery`

States:

- `ops-custody-chain-loading`
- `ops-custody-chain-missing-evidence`
- `ops-custody-chain-partial-evidence`
- `ops-custody-chain-conflict`
- `ops-custody-chain-fallback-unavailable`
- `ops-custody-chain-offline`
- `ops-custody-chain-stale`
- `ops-custody-chain-not-found`
- `ops-custody-chain-not-authorized`
- `ops-custody-chain-api-error`

## API Integration Notes

Request flow:

- Read `deliveryId` from route.
- Load authenticated principal.
- Call `get_delivery`.
- Call `get_delivery_timeline`.
- Parse detail with `deliveryDetailResponseSchema`.
- Parse timeline with `deliveryTimelineResponseSchema`.
- Build expected chain from delivery status, doorstep state, and handoff policy.
- Compare expected chain to timeline entries.
- Derive confidence state.

Cache behavior:

- Cache detail by `deliveryId`.
- Cache timeline by `deliveryId`.
- Store `loadedAt` and `source`.
- Clear sensitive cached evidence on sign-out.
- Revalidate on app foreground when route is active.

Mapping rules:

- `handoff_event` rows are primary custody evidence.
- `delivery_event` rows provide status context.
- `issue_event` rows affect confidence.
- Current custody comes from detail, not from the latest timeline row alone.
- Current station context comes from `latestTouchpoint.stationId`, `originStationId`, and `destinationStationId`.

API limitation handling:

- If fallback or supervisor detail is absent from timeline metadata, show unavailable state only when the user requests that detail or confidence requires it.
- Do not fail the entire screen because fallback fields are absent.
- Do not show `fallbackUsed=false` unless the backend explicitly returns that value.

## QA Acceptance Criteria

Functional:

- Authorized staff can open custody chain for accessible delivery.
- Current custody appears above expected chain.
- Expected chain renders required handoff steps.
- Handoff timeline entries attach to matching expected steps.
- Missing required handoff entry shows missing state.
- Delivered without `finalProof` shows final proof missing.
- Timeline failure shows partial evidence state while detail remains visible.
- Issue event changes confidence when custody-sensitive.
- Fallback detail absence is shown as unavailable, not invented.
- Refresh updates detail and timeline.
- Offline cached evidence is marked saved/stale.

Backend alignment:

- `get_delivery` is used for current custody.
- `get_delivery_timeline` is used for evidence.
- `deliveryDetailResponseSchema` is parsed.
- `deliveryTimelineResponseSchema` is parsed.
- `deliveryTimelineEntrySchema` fields are handled.
- `handoff_event`, `delivery_event`, and `issue_event` are distinguished.
- `proofType`, `proofReference`, `condition`, `severity`, `category`, and `summary` are treated according to exposure rules.

Security:

- Raw actor IDs do not render.
- Raw proof references do not render.
- Raw metadata does not render.
- Analytics excludes sensitive fields.
- Cached evidence clears on sign-out.

Accessibility:

- Confidence state is announced.
- Each step has meaningful label and state.
- Missing/conflict states are accessible beyond color.
- Refresh states are announced.
- Large text keeps expected chain usable.

Resilience:

- Timeline failure does not blank screen.
- Stale cache cannot look fresh.
- Empty timeline is handled.
- API rate limit offers delayed retry.
- Missing delivery hides sensitive fields.

## Visual Quality Checklist

Before handoff, confirm:

- Current custody and confidence are visible immediately.
- Expected chain is clearer than a raw event feed.
- Missing evidence is visually unmistakable.
- Conflict state feels serious but not chaotic.
- Proof type is visible without exposing raw reference.
- Issue events are distinguishable from normal events.
- Refresh and stale states are obvious.
- The screen remains readable on small phones.
- The screen feels like an operations ledger, not a decorative timeline.

## Implementation Guardrails For Claude Code

Build this as a read-only evidence screen only when frontend work begins.

Implementation rules:

- Keep chain derivation in a pure function with unit tests.
- Keep confidence classification in a pure function with unit tests.
- Keep sensitive field masking centralized.
- Keep timeline rendering separate from confidence derivation.
- Keep route actions as navigation only.
- Keep mutation calls out of `OpsCustodyChain`.
- Keep API limitation notices explicit.

Suggested file ownership:

- Screen route owns loading, refresh, auth, and navigation.
- Hook owns detail/timeline fetch and cache freshness.
- Selector owns expected chain matching and confidence classification.
- Components own rendering only.
- Tests cover expected chain, confidence states, privacy, and errors.

Required implementation tests:

- Current custody uses `deliveryDetailResponseSchema.currentCustodyRole`.
- Expected chain includes sender-to-origin for received packages.
- Expected chain includes driver-to-destination for in-transit/destination statuses.
- Final-mile step appears for doorstep deliveries when assigned or out for delivery.
- Missing handoff event sets missing confidence.
- Issue event with handoff/loss/damage/proof category sets conflict or issue state.
- Raw `proofReference` is hidden.
- Raw `actorId` is hidden.
- Timeline API failure sets partial evidence.
- Stale cache sets stale state.
- No mutation endpoint is called from this screen.

## Final Implementation Decisions

Freshness rules are fixed for v1. Active custody and action-adjacent views are stale after 2 minutes; read-only custody-chain review is stale after 10 minutes. Stale state must show last refresh time and a retry action.

Station names must resolve through the shared typed station-label adapter. If a label is not role-safe or unavailable, the UI must show the station ID with a `Station ID` label.

Long evidence rows must use a collapsed `Evidence details` disclosure. On phones, only one evidence row can be expanded at a time to preserve scanability and reduce accidental exposure.

Admin audit navigation must be hidden on mobile unless the authenticated role and explicit route map expose an audit destination. The screen must not construct an admin route locally.

Platform follow-up decision: if mobile custody review needs to show fallback approval directly, the backend must add safe handoff metadata such as `fallbackUsed` and `supervisorOverrideActorId` to `deliveryTimelineEntrySchema.metadata`.

## Final Handoff Notes

`OpsCustodyChain` is the staff-facing evidence ledger. It should make loss prevention and dispute review easier by comparing expected handoffs against recorded timeline evidence.

The safest implementation is read-only, exact about what is known, and explicit about what is missing. If the backend does not expose a field, the UI must say the detail is unavailable rather than filling the gap with client assumptions.
