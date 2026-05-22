# Custody Chain Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Custody chain component |
| Component family | Shared UI infrastructure |
| Primary components | `CustodyChainComponent`, `CustodyChainController`, `CurrentCustodySummary`, `ExpectedHandoffChain`, `CustodyEvidenceRow`, `CustodyConfidencePanel`, `CustodyExceptionRail` |
| Supporting components | `CustodyOwnerBadge`, `RequiredNextActorCard`, `HandoffProofChip`, `HandoffTimestamp`, `HandoffConditionChip`, `CustodyGapPanel`, `CustodyTimelineMapper`, `CustodyPrivacyRedactor`, `CustodyAccessibilityAnnouncer` |
| Inventory behavior | Current owner, required next actor, proof, timestamps, exceptions |
| Repo targets | `apps/mobile`, `apps/admin`, limited sender-safe summary in `apps/mobile` only where explicitly needed |
| Primary surfaces | operations custody chain, station handoff log, operations delivery detail, admin custody chain, admin delivery detail, admin package detail, manual custody exception review |
| Primary users | station operators, drivers, final-mile couriers, support admins, ops admins, finance admins reviewing refund evidence, QA, security reviewers |
| Backend coverage | `get_delivery`, `get_delivery_timeline`, current custody fields, delivery events, handoff events, issue events, package scan proof, delivery proof, assignment and custody separation |
| Browser mutation operation | None; custody chain is read-only and emits route or refresh intents only |
| Data sensitivity | current custody actor ID, assigned actor IDs, proof references, package scan code, delivery proof reference, station ID, issue metadata, supervisor override actor ID, fallback markers |
| Offline critical | Yes for cached operational review; cached custody must never appear as fresh backend confirmation |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | timeline component, scan component, proof capture component, role routing, typed API client, RTK Query cache, offline outbox, issue status component, test harness |
| Related screen specs | `OpsCustodyChain`, `OpsDeliveryDetail`, `StationHandoffLog`, `DriverCustodyAccepted`, `CourierCustodyAccepted`, `AdminCustodyChain`, `AdminManualCustodyException`, `AdminPackageDetail` |
| Related state specs | custody not confirmed, scan mismatch, duplicate package label, proof required, stale data, offline, blocked by issue, manual review required, not authorized |
| Design tokens | No unique tokens; component uses custody, proof, issue, success, warning, danger, neutral, focus, offline, and admin evidence tokens |
| Accessibility target | Current owner, expected steps, evidence status, missing proof, timestamps, and recovery routes must be perceivable without color, motion, or visual rail position alone |

## Purpose
The custody chain component is Kra's shared physical-accountability ledger.

It displays who currently owns package custody, which handoff should happen next, which handoff evidence exists, which proof was used, when proof was recorded, and where custody evidence is missing, partial, stale, conflicting, or under issue review.

The component must answer:

- Who currently has custody according to backend delivery detail?
- Which handoffs are expected for this delivery?
- Which expected handoffs have timeline evidence?
- Which expected handoffs are not due yet?
- Which expected handoffs are missing after the lifecycle has moved past them?
- Which proof type was recorded for each handoff?
- Which timestamp belongs to each evidence row?
- Is proof complete, partial, redacted, or unavailable?
- Is a fallback, supervisor override, condition issue, failed attempt, or issue event affecting confidence?
- What route should the user open when evidence is missing or conflicting?

The most important rule is:

```text
Assignment is not custody. Custody is proven by backend current custody fields and recorded handoff evidence, not by who is scheduled to work next.
```

## Product Job
Kra moves packages through several human handoffs. The custody chain component turns those handoffs into a visible, consistent, role-safe ledger.

The component must:

- show current custody from delivery detail, not from timeline guessing alone
- show the next required actor based on current lifecycle and custody state
- compare expected handoff steps against timeline evidence
- display proof type, timestamp, condition, and exception state at each step
- keep raw proof references hidden by default
- keep actor IDs hidden in field views
- expose partial evidence when the API does not provide enough typed data
- distinguish assignment, dispatch readiness, custody transfer, failed attempt return, and final completion
- keep stale and offline custody evidence visibly unsafe for final decisions
- route missing or conflicting evidence to issue, support, action recovery, or admin exception review
- support dense admin review without becoming a mutation screen

The component must make custody truth obvious enough that loss-prevention decisions do not depend on memory, phone calls, or paper notes.

## Strategic Role
This component is a loss-prevention control.

It protects against:

- a driver leaving origin without confirmed pickup custody
- a destination station receiving a package when driver custody was never confirmed
- a courier starting doorstep delivery from assignment alone
- a courier completing delivery without current courier custody
- an admin treating an absent handoff event as proof
- a support agent exposing package scan or proof references
- an offline queued custody action looking like confirmed backend custody
- a fallback handoff looking as strong as a fully scanned handoff

The component should feel like an evidence ledger, not a decorative status rail.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared custody evidence primitives across operations mobile and admin web.

Surface type:

- Read-only custody evidence component with field and admin variants.

Primary action:

- Help the user understand custody accountability and route to the safest next step.

Visual thesis:

- `Tamper-aware custody ledger`: current owner first, expected chain second, evidence gaps and exceptions clearly marked.

Restraint rule:

- Do not add custody mutation buttons, maps, route guidance, payment panels, proof media viewers, or raw metadata tables.

Density:

- Staff mobile: medium density, route-focused.
- Admin web: medium-high density, evidence-focused.
- Sender-safe summary: low density and only if host explicitly scopes it.

Platform stance:

- Mobile field review and desktop admin investigation share the same evidence model and redaction rules.

## External Research Used
Only directly relevant chain-of-custody, traceability, event evidence, and accessibility references were used:

- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final): supports chain-of-custody discipline for evidence handling, accountability, documentation, and review.
- [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final): supports log management practices for reliable event records, monitoring, review, and incident response.
- [GS1 Global Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard): supports cross-party traceability data for physical supply-chain movement.
- [GS1 EPCIS and CBV](https://www.gs1.org/standards/epcis): supports event-based visibility into what happened, where, when, why, and business step context.
- [USWDS process list](https://designsystem.digital.gov/components/process-list/): supports vertical step sequences for public or operational processes.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports interruptive custody blocker states where a response is required.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for custody freshness, missing evidence, refresh, and conflict states.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear explanation of custody proof gaps and blocked routes.
- [WCAG 2.2 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html): supports preserving relationships among owner, handoff, proof, timestamp, and exception details.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard navigation through evidence rows and recovery actions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/13-custody-not-confirmed-state.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/06-accept-custody-modal.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/06-scan-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/07-proof-capture-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/08-timeline-component.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/09-admin-custody-chain.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/17-station-handoff-log.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/package-labels.ts`

## Non-Goals
The custody chain component must not:

- implement actual frontend screens
- mutate custody
- submit scans
- accept custody
- assign drivers or couriers
- confirm dispatch
- receive destination
- complete delivery
- record failed attempt
- create issues directly
- approve fallback or supervisor override
- reveal raw package scan codes
- reveal raw proof references by default
- reveal raw actor IDs in field views
- infer handoff events that are absent from the timeline
- treat assignment as custody
- treat station dispatch readiness as custody transfer
- treat offline queued action as confirmed custody
- hide stale evidence

## Component Boundary
The custody chain component owns:

- expected handoff step model
- current custody display
- required next actor display
- evidence row mapping
- handoff proof summary
- proof reference redaction
- actor and station redaction
- evidence confidence classification
- missing evidence detection
- stale and offline evidence display
- exception and issue highlighting
- row disclosure state
- accessible status announcements
- route intent emissions

The host owns:

- delivery detail query
- delivery timeline query
- role and capability checks
- station and assignment scope
- outbox state
- issue creation route
- scan route
- support route
- manual custody exception route
- admin audited reveal workflow
- analytics dispatch
- final navigation

## Data Sources
Required source:

- `get_delivery` response for current custody, current status, assignments, station path, latest event, and final proof.

Supporting source:

- `get_delivery_timeline` response for delivery events, handoff events, and issue events.

Optional host source:

- offline outbox state for pending custody actions.

Rules:

- Current owner must come from delivery detail.
- Historical evidence must come from timeline entries.
- Outbox state can show pending local action but cannot mark custody as confirmed.
- If timeline fails but detail loads, component enters `partial` state.
- If detail is stale, component cannot call evidence complete.

## Backend Contract Summary
Delivery detail custody fields:

```ts
type CustodyDeliveryContext = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: string;
  currentCustodyRole?: "station_operator" | "driver" | "final_mile_courier" | null;
  currentCustodyActorId?: string | null;
  assignedDriverId?: string;
  assignedFinalMileCourierId?: string;
  originStationId: string;
  destinationStationId: string;
  latestEvent: {
    type: string;
    occurredAt: string;
  };
  latestTouchpoint: {
    role: string;
    stationId?: string;
    occurredAt: string;
  };
  finalProof?: {
    type: "otp" | "signature" | "delivery_photo";
    reference: string;
    receivedByName: string;
    capturedAt: string;
  };
};
```

Timeline entry fields:

```ts
type CustodyTimelineEntry = {
  entryId: string;
  entryType: "delivery_event" | "handoff_event" | "issue_event";
  occurredAt: string;
  label: string;
  actorId?: string;
  actorRole?: string;
  stationId?: string;
  metadata?: Record<string, unknown>;
};
```

Current timeline handoff metadata:

- `proofType`
- `proofReference`
- `condition`

Known backend gap:

- `deliveryTimelineEntrySchema` does not expose `handoffType` as a typed field today.
- `deliveryTimelineEntrySchema` does not expose `fromRole`, `toRole`, `fromActorId`, or `toActorId` today.
- Handoff classification may use backend `label` defensively, but legal-grade classification should be marked partial until typed handoff fields are added.
- Fallback and supervisor override detail may exist on delivery event metadata but is not currently exposed on handoff metadata through `get_delivery_timeline`.

## Expected Handoff Chain
Canonical expected steps:

```text
sender_to_origin_station
origin_station_to_driver
driver_to_destination_station
destination_station_to_final_mile_courier
final_mile_courier_to_destination_station
delivery_completion
```

Step definitions:

| Step | Required when | Proof | Current custody after success |
| --- | --- | --- | --- |
| `sender_to_origin_station` | delivery received at origin or later | package scan and intake condition | station operator |
| `origin_station_to_driver` | driver pickup succeeds | package scan | driver |
| `driver_to_destination_station` | destination receipt succeeds | package scan and condition | station operator |
| `destination_station_to_final_mile_courier` | doorstep final-mile is assigned and accepted | package scan | final-mile courier |
| `final_mile_courier_to_destination_station` | failed attempt returns package to station | delivery proof reference for failed attempt | station operator |
| `delivery_completion` | receiver pickup or doorstep completion succeeds | OTP, signature, or delivery photo | no active package custody |

Conditional rules:

- Non-doorstep receiver pickup does not require `destination_station_to_final_mile_courier`.
- Doorstep delivery normally requires `destination_station_to_final_mile_courier` before out-for-delivery, failed attempt, or completion.
- Failed attempt may add `final_mile_courier_to_destination_station`.
- `delivery_completion` can be performed by station operator for receiver pickup or final-mile courier for doorstep completion.
- Cancelled or closed deliveries should show chain state up to the latest verified lifecycle point.

## Evidence State Model
Each expected step must resolve to one of these states:

```ts
type CustodyStepState =
  | "not_due"
  | "expected_now"
  | "present"
  | "missing"
  | "partial"
  | "exception"
  | "conflict"
  | "not_applicable";
```

State rules:

- `not_due`: lifecycle has not reached this step.
- `expected_now`: this is the next required actor or handoff.
- `present`: matching timeline evidence exists and timestamp is available.
- `missing`: lifecycle has passed the step but matching evidence is absent.
- `partial`: evidence exists but typed detail is insufficient or timeline is unavailable.
- `exception`: issue, fallback, failed attempt, damaged condition, or manual review affects this step.
- `conflict`: delivery detail and timeline disagree about custody outcome.
- `not_applicable`: delivery path does not require this step.

## Confidence Model
The component computes custody confidence:

```ts
type CustodyConfidence =
  | "verified"
  | "partial"
  | "missing_evidence"
  | "stale"
  | "offline_pending"
  | "conflict"
  | "blocked_by_issue"
  | "not_applicable";
```

Rules:

- `verified`: current detail is fresh and expected completed handoffs have present evidence.
- `partial`: delivery detail loaded but timeline is unavailable or typed fields are insufficient.
- `missing_evidence`: a required past handoff has no timeline evidence.
- `stale`: cached detail or timeline is too old for safe operational decisions.
- `offline_pending`: outbox has a custody action not yet confirmed by backend.
- `conflict`: current custody and timeline imply different owner or stage.
- `blocked_by_issue`: issue event affects custody or package condition.
- `not_applicable`: terminal or path does not require chain display.

No field view should use green success styling when confidence is anything except `verified`.

## Host Input Contract
Required props:

```ts
type CustodyChainVariant = "staff_compact" | "staff_full" | "admin_evidence" | "sender_safe_summary";

type CustodyChainInput = {
  variant: CustodyChainVariant;
  delivery: CustodyDeliveryContext;
  timeline?: {
    deliveryId: string;
    trackingCode: string;
    entries: CustodyTimelineEntry[];
  };
  freshness: "loading" | "fresh" | "refreshing" | "cached_fresh" | "cached_stale" | "offline_cached" | "partial" | "error";
  actorContext?: {
    actorId: string;
    role: "station_operator" | "driver" | "final_mile_courier" | "support_admin" | "ops_admin" | "finance_admin" | "super_admin";
    stationId?: string;
  };
  outboxCustodyState?: {
    hasPendingCustodyAction: boolean;
    actionKind?: "confirm_pickup" | "accept_final_mile_assignment" | "receive_destination" | "complete_delivery" | "record_failed_attempt";
    queuedAt?: string;
  };
  redaction: {
    actorId: "hidden" | "redacted" | "visible_admin";
    proofReference: "hidden" | "redacted" | "visible_audited";
    stationId: "hidden" | "label" | "visible";
    metadata: "hidden" | "safe_summary" | "admin_disclosure";
  };
};
```

Rules:

- `variant=sender_safe_summary` cannot render timeline metadata.
- `variant=staff_compact` and `staff_full` hide actor IDs and proof references by default.
- `variant=admin_evidence` can render redacted actor IDs and proof references, but raw proof reveal requires audited host workflow.
- `timeline` is required for complete confidence. Without it, state is `partial`.
- `outboxCustodyState.hasPendingCustodyAction=true` forces `offline_pending` confidence unless backend detail already reflects the action.

## Output Contract
The component emits read-only intents:

```ts
type CustodyChainOutcome =
  | {
      kind: "refresh_requested";
      reason: "manual" | "stale" | "partial" | "offline_reconnect";
    }
  | {
      kind: "route_requested";
      route:
        | "open_delivery_detail"
        | "open_scan"
        | "open_accept_custody"
        | "open_issue_create"
        | "open_support"
        | "open_offline_outbox"
        | "open_action_recovery"
        | "open_admin_manual_exception"
        | "open_admin_audit";
      deliveryId: string;
    }
  | {
      kind: "step_selected";
      stepId: string;
      stepState: CustodyStepState;
    };
```

Rules:

- No outcome may contain raw proof references.
- No outcome may contain raw actor IDs except host-owned admin routes already authorized.
- No outcome may mutate custody directly.

## Current Owner Display
Current owner comes from:

- `delivery.currentCustodyRole`
- `delivery.currentCustodyActorId`
- `delivery.currentStatus`
- `delivery.latestTouchpoint`

Display rules:

- Field view: show role-first label, such as `Current custodian: Driver`.
- Field view: hide raw actor ID.
- Admin view: show role and redacted actor ID by default.
- If `currentCustodyRole` is null on delivered state, show `Custody closed after completion`.
- If `currentCustodyRole` is null on active non-terminal state, show missing custody warning.
- If delivery is cancelled or closed, show terminal state with latest verified event.

## Required Next Actor Display
Required next actor is derived conservatively from current status and custody state.

| Current state | Required next actor | Required action |
| --- | --- | --- |
| `created` | origin station operator | confirm intake |
| `received_at_origin` | origin station operator | prepare assignment or queue |
| `assigned_to_driver` | assigned driver | confirm pickup with package scan |
| `dispatched_from_origin` | assigned driver | mark in transit or destination handoff |
| `in_transit` | destination station operator | receive destination with package scan |
| `received_at_destination` | destination station operator | route to pickup, doorstep, or issue |
| `awaiting_receiver_pickup` | destination station operator or receiver proof path | complete pickup with proof |
| `awaiting_final_mile_assignment` | destination station operator | assign final-mile courier |
| `assigned_for_final_mile` | assigned final-mile courier | accept custody with package scan |
| `out_for_delivery` | current final-mile courier | complete, failed attempt, or return path |
| `delivered` | none | custody closed |

Rules:

- The component may show the required next actor but cannot open mutation by itself.
- If current actor is not the required actor, route to support, detail, or custody chain rather than a mutation.
- If outbox contains pending custody action, show pending sync before suggesting another handoff.

## Proof Display Rules
Allowed proof displays:

- `Package scan recorded`
- `Delivery proof recorded`
- `OTP proof`
- `Signature proof`
- `Photo proof`
- `Condition: ok`
- `Condition: damaged`
- `Proof reference hidden`
- `Proof reference redacted` in admin evidence view

Forbidden proof displays:

- raw package scan code
- raw OTP token
- raw proof asset ID in field UI
- signed upload URL
- proof storage bucket
- proof storage path
- proof media
- supervisor PIN

When `metadata.proofReference` exists:

- Field view shows `Proof reference hidden`.
- Admin view shows redacted reference only if host policy allows.
- Sender-safe summary does not show the reference.

## Exception Display Rules
Exception indicators:

- missing required handoff evidence
- damaged condition
- issue event affecting delivery
- failed attempt return
- stale evidence
- offline pending custody action
- fallback proof detail unavailable
- supervisor override detail unavailable
- classification confidence partial

Rules:

- Exception states must be visually and textually distinct.
- Exception states must include a recovery route.
- Missing evidence must not look like pending normal progress after the lifecycle has passed the handoff.
- Fallback or supervisor override must not be invented when fields are absent.
- Admin variant should route incomplete evidence to manual custody exception review.

## Redaction Rules
Sensitive fields:

- `actorId`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `proofReference`
- package scan code
- OTP token
- supervisor override actor ID
- raw timeline metadata
- receiver phone
- receiver address

Rules:

- Field views hide actor IDs and proof references.
- Admin evidence view redacts actor IDs and proof references by default.
- Raw reveal requires a separate audited host workflow.
- Sender-safe summary hides all internal actor and proof data.
- Analytics must not include raw IDs or proof data.
- Error boundaries must not show raw delivery or timeline payloads.

## Accessibility Requirements
General:

- Use semantic headings for current owner, required next actor, and evidence chain.
- Use a semantic list for expected handoff steps.
- Each row must announce step name, state, proof summary, and timestamp when present.
- Missing and conflict states must be textually identified.
- Do not rely on rail position or color alone.
- Timestamp must use machine-readable time on web.
- Refresh and route actions must have visible focus.
- Large text must not hide proof chips or recovery buttons.
- Reduced motion must disable rail animations.
- Status changes must be announced without moving focus unexpectedly.

Admin:

- Disclosure controls must have clear accessible names.
- Dense evidence rows must remain keyboard navigable.
- Redacted fields must be labelled as redacted, not blank.

Mobile:

- Recovery actions must remain within thumb reach.
- Long chains must scroll predictably.
- Sticky headers must not cover focused evidence rows.

## Visual Rules
Shared:

- Start with current custody summary.
- Put required next actor near the top.
- Render expected chain as the primary structure.
- Attach evidence rows to expected steps.
- Use missing evidence markers with clear labels.
- Keep proof chips concise.
- Keep exception route visible near the exception.

Staff mobile:

- Use strong owner card, compact steps, and route-focused recovery actions.
- Avoid admin metadata density.
- Keep current owner and next actor above the fold.

Admin web:

- Use evidence ledger layout with current owner, expected chain, and event evidence.
- Allow row disclosures for redacted details.
- Use admin routes for exception, issue, audit, and package review.

Sender-safe summary:

- Use simple copy such as `Kra custody record is updated at each verified handoff`.
- Do not render internal evidence rows.

## Copy Rules
Required copy:

- `Current custodian`
- `Required next actor`
- `Assignment is not custody`
- `Evidence complete`
- `Evidence partial`
- `Missing handoff evidence`
- `Proof reference hidden`
- `Showing cached custody evidence`
- `Refresh before relying on this chain`
- `Open issue review`
- `Open custody exception review`

Forbidden copy:

- `Custody confirmed` when only assignment exists.
- `Package handed over` when handoff evidence is absent.
- `No issue` when issue timeline failed to load.
- `Final proof visible` when proof media is not available.
- `Offline custody confirmed`.
- `Supervisor approved` when supervisor fields are absent.

## Error Mapping
| Condition | Confidence or state | User-safe message | Recovery |
| --- | --- | --- | --- |
| Delivery detail missing | `not_applicable` | `Delivery was not found.` | Return to list |
| Timeline failed | `partial` | `Delivery loaded, but custody evidence could not be loaded.` | Refresh |
| Required past handoff absent | `missing_evidence` | `Required handoff evidence is missing.` | Report issue, admin exception |
| Assignment exists without custody | `partial` or `expected_now` | `Assignment is not custody. The receiving party must confirm the handoff.` | Open scan or accept custody |
| Offline pending handoff | `offline_pending` | `Custody action is queued, not yet confirmed by backend.` | Open outbox |
| Stale cache | `stale` | `Showing cached custody evidence.` | Refresh |
| Issue event present | `blocked_by_issue` | `An issue affects custody confidence.` | Open issue |
| Handoff typed data absent | `partial` | `Handoff classification detail is limited by the current API.` | Admin audit or backend improvement |
| Raw reveal requested in field variant | `conflict` | `This view cannot show restricted custody fields.` | Fix host config |

## Analytics Requirements
Allowed events:

- `custody_chain_rendered`
- `custody_chain_refresh_requested`
- `custody_chain_step_selected`
- `custody_chain_missing_evidence_shown`
- `custody_chain_exception_route_selected`
- `custody_chain_redaction_blocked`

Allowed fields:

- `surface`
- `variant`
- `confidence`
- `stepCount`
- `missingStepCount`
- `hasIssueEvent`
- `hasProofSummary`
- `freshness`
- `currentCustodyRole`
- `requiredNextActorRole`
- `errorCode`

Forbidden fields:

- raw delivery ID
- raw tracking code
- actor ID
- assigned actor ID
- proof reference
- package scan code
- OTP token
- supervisor override actor ID
- receiver phone
- raw metadata

## Performance Requirements
Targets:

- First custody summary visible within `1s` after delivery detail data arrives.
- Evidence chain visible within `1.5s` after timeline data arrives.
- Refresh feedback within `100ms`.
- Row disclosure open within `100ms`.
- Admin evidence view handles `500` timeline entries without blocking input.

Performance rules:

- Derive expected chain once per delivery status and service type.
- Normalize timeline entries once per response identity and redaction policy.
- Do not stringify metadata in row render.
- Do not virtualize short staff chains.
- Admin long timelines may use virtualization if accessibility positions remain coherent.
- Keep current owner summary render independent of timeline fetch.

## Test Requirements
Unit tests:

- expected chain for pickup delivery
- expected chain for doorstep delivery
- expected chain after failed attempt return
- current owner from delivery detail
- required next actor by status
- assignment not custody rule
- missing evidence detection
- partial confidence when timeline absent
- partial confidence when typed handoff fields are absent
- proof redaction
- actor ID redaction
- stale and offline confidence

Component tests:

- staff compact current owner and next actor above fold
- staff full present, missing, partial, and exception rows
- admin evidence redacted proof reference
- admin evidence route to manual custody exception
- sender-safe summary hides internal evidence
- offline pending outbox state
- timeline failure with detail present
- issue event affecting custody confidence
- keyboard row disclosure
- large text layout
- reduced motion

Integration tests:

- combines `get_delivery` and `get_delivery_timeline` data without mutation
- does not mark assignment as custody
- does not expose raw proof reference in staff DOM
- does not expose actor ID in staff DOM
- shows current custody closed after delivery completion
- shows missing evidence when lifecycle passed a required handoff
- routes refresh intent without changing backend state

End-to-end journeys:

- Station operator opens custody chain after origin intake and sees station custody.
- Driver assigned but not picked up sees assignment is not custody.
- Driver pickup confirmed shows origin-to-driver evidence.
- Destination receipt shows driver-to-station evidence and condition.
- Courier assigned but not accepted sees final-mile acceptance required.
- Courier accepted shows final-mile custody evidence.
- Failed attempt returns package to destination station and shows return handoff.
- Admin opens custody chain and routes missing evidence to manual custody exception.

Security tests:

- No raw package scan code in field UI.
- No raw proof reference in field UI.
- No raw actor ID in staff or sender-safe summary.
- No raw metadata dump in any normal view.
- Analytics excludes sensitive fields.
- Error boundary redacts delivery and timeline payloads.

## Build Instructions For Claude Code
When implementing later:

- Build expected-chain derivation first.
- Build current-owner summary from delivery detail second.
- Build timeline evidence mapper third.
- Build confidence classifier fourth.
- Build staff and admin variants on the same model.
- Keep all mutation flows outside this component.
- Keep scan, proof, issue, and manual exception as route intents.
- Add redaction tests before visual tests.
- Treat missing typed handoff fields as partial evidence, not final certainty.

Do not:

- clone custody logic into every screen
- infer handoff proof from status alone
- treat assignment as custody
- expose raw proof references because they exist in metadata
- hide stale or offline states
- let the component perform custody mutations

## Acceptance Checklist
- Component shows current custody owner from delivery detail.
- Component shows required next actor.
- Component renders expected chain for pickup and doorstep paths.
- Component maps timeline evidence without inventing absent handoffs.
- Component marks missing, partial, exception, stale, offline, and conflict states.
- Component hides proof references and actor IDs by default.
- Component distinguishes assignment from custody.
- Component routes recovery without mutation.
- Component exposes admin evidence density only in admin variant.
- Component supports screen reader, keyboard, large text, high contrast, and reduced motion.
- Tests cover evidence mapping, confidence, redaction, variants, stale/offline, and route intents.

## Definition Of Done
This infrastructure spec is complete when a frontend engineer can build one custody chain system that powers field operations and admin evidence review without duplicating custody logic or weakening custody proof.

The implementation must prove:

- current owner from backend detail
- expected chain by delivery path
- timeline evidence mapping
- proof and timestamp display
- exception and missing evidence routing
- redaction by default
- no mutation authority
