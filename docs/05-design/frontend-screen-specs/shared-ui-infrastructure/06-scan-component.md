# Scan Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Scan component |
| Component family | Shared UI infrastructure |
| Primary components | `PackageScanComponent`, `PackageScanController`, `PackageScanCamera`, `PackageScanManualEntry`, `PackageScanReview`, `PackageScanFallbackGate`, `PackageScanResultMapper` |
| Supporting components | `ScanIntentBanner`, `ScanPermissionState`, `ScanTorchToggle`, `ScanFrameGuide`, `ScanContextStrip`, `ScanMismatchRouter`, `ScanDuplicateRouter`, `ScanOfflineQueueBridge`, `ScanAccessibilityAnnouncer`, `ScanPrivacyRedactor` |
| Inventory behavior | Camera scan plus manual fallback, validation display, mismatch recovery |
| Repo targets | `apps/mobile`, limited compatibility helpers for `apps/web` and `apps/admin` where camera support is explicitly allowed |
| Primary surfaces | operations mobile shared screens, station operator mobile app, driver mobile app, final-mile courier mobile app |
| Primary users | station operators, drivers, final-mile couriers, station leads, support/admin reviewers in read-only conflict contexts |
| Backend coverage | package label binding, handoff scan request schemas, `PACKAGE_SCAN_MISMATCH`, package label repository, delivery lifecycle, role/capability checks, offline outbox |
| Browser mutation operation | None directly; the component captures a scan value and returns typed scan intent data to host-owned mutations |
| Data sensitivity | raw scan code, redacted scan code, delivery ID, tracking code, package label binding context, actor role, station scope, assignment scope, fallback reason |
| Offline critical | Yes for approved station, driver, and courier scan workflows that can queue through offline outbox |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, offline outbox, role routing, custody chain component, timeline component, empty/error library, test harness |
| Related screen specs | `OpsScanPackage`, `ScanPackageModal`, station intake, station dispatch readiness, driver pickup scan, station destination receipt, courier accept assignment scan |
| Related state specs | scan mismatch, duplicate package label, custody not confirmed, offline, stale data, not authorized, session expired, rate limited |
| Design tokens | No unique visual tokens; scanner surfaces use existing camera, warning, danger, neutral, success, focus, and offline tokens |
| Accessibility target | Camera, manual entry, scan result, blocked state, and fallback controls must be usable without relying on color, motion, or camera-only input |

## Purpose
The scan component is Kra's shared package-label capture primitive.

It provides camera scanning, manual fallback, redacted review, local validation, intent display, accessible status, and recovery routing for package scan workflows. It does not submit backend mutations by itself unless the host explicitly delegates submission through a typed adapter.

The component must answer:

- Which delivery is being scanned?
- Which scan intent is active?
- Does this scan bind a label, record readiness, or move custody after backend confirmation?
- Is the camera available and permitted?
- Was exactly one scan value captured?
- Is the scan value locally valid?
- Is manual fallback allowed?
- Does fallback require supervisor acknowledgement?
- Should the host submit now or collect more parent fields first?
- How should mismatch, duplicate label, offline, blocked, or rejected states recover?

The most important rule is:

```text
A camera read is not a package handoff. It becomes operational evidence only after the host workflow validates intent, submits the correct typed request, and receives backend confirmation or approved offline outbox acceptance.
```

## Product Job
Field staff need a scanner that is fast enough for station queues and strict enough for custody control.

The scan component must:

- open quickly on low-cost mobile devices
- make the active delivery and scan intent visible before capture
- support camera scanning and manual fallback
- validate code shape before returning or submitting
- debounce repeated reads from the same camera frame sequence
- keep raw codes hidden after capture except in controlled entry fields
- map scan intent to the correct request field
- expose whether success would bind label, record readiness, or transfer custody
- route mismatch and duplicate states to specialized recovery
- integrate with offline outbox when host workflow permits queueing
- provide status announcements for camera, scan, submit, and blocked states
- support tests for permissions, fallback, intent, redaction, and recovery

The scanner must be reusable, but it must never become generic.

## Strategic Role
Package scanning is Kra's physical evidence handshake.

Correct scanning protects against:

- wrong-package intake
- copied label reuse
- driver pickup of a package not assigned to the run
- destination receipt of the wrong parcel
- final-mile courier accepting another courier's package
- offline queue replay of an unsafe scan
- manual entry without fallback audit
- raw scan code leakage in UI, logs, or analytics

The scan component is therefore a loss-prevention component with camera UX, not a camera component with loss-prevention hints.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared mobile scan primitives.

Surface type:

- Reusable scanner component and controller used by screens and modals.

Primary action:

- Capture one valid package scan code for one delivery and one scan intent.

Visual thesis:

- `Custody scanner`: a dark, focused camera stage with an always-visible intent banner and a controlled recovery rail.

Restraint rule:

- Do not show route maps, payment details, long timelines, receiver private data, or full raw scan code inside the scanner.

Density:

- Low during camera capture. Medium during review, fallback, and recovery states.

Platform stance:

- Mobile first through Expo Camera. Web/admin camera use is optional, permission-gated, secure-context dependent, and must preserve the same scan safety model.

## External Research Used
Only directly relevant scanner, barcode, camera, and accessibility references were used:

- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/): supports camera permission hooks, camera view, barcode scanning callbacks, barcode scanner settings, torch mode, and native camera behavior in Expo apps.
- [MDN Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API): supports web barcode detection capability checks, supported formats, and secure-context constraints for browser fallback planning.
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports the logistics principle of scannable identifiers tied to physical goods movement.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible scan detected, validation, queue, and rejection announcements without unexpected focus movement.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports explicit manual-entry and scan-blocker messages.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for torch, manual entry, scan again, and recovery actions.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment and return behavior when scanner is used inside a modal.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/11-scan-mismatch-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/12-duplicate-package-label-state.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/09-operations/delivery-lifecycle.md`
- `docs/09-operations/handoff-scan-policy.md`
- `docs/09-operations/proof-of-delivery-policy.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/service-errors.ts`

## Non-Goals
The scan component must not:

- implement actual frontend screens
- own backend mutations by default
- act as a package search tool
- act as public tracking scanner
- calculate custody locally
- approve supervisor fallback by itself
- rebind a package label
- print labels
- capture proof photos
- collect receiver OTP
- expose full raw scan codes after review
- bypass role, station, assignment, payment, lifecycle, or issue blockers
- queue unapproved offline actions
- convert scan detection into backend success

## Component Boundary
The scan component owns:

- camera permission state
- camera availability state
- scan frame guidance
- torch toggle
- barcode detection event handling
- duplicate read suppression
- local code normalization
- local code shape validation
- manual entry UI state
- redacted code preview
- scan review state
- fallback start state
- accessible scan status announcements
- returning a typed scan result to host

The host owns:

- delivery context
- current delivery freshness
- scan intent
- required parent fields
- role and capability gating
- station and assignment scope gating
- backend mutation execution
- offline outbox decision
- mismatch and duplicate recovery routing
- final success navigation
- analytics event ownership beyond component technical scan events

## Host Input Contract
Required props:

```ts
type PackageScanIntent =
  | "intake_label_binding"
  | "dispatch_readiness"
  | "driver_pickup_custody"
  | "destination_receipt"
  | "courier_accept_custody";

type PackageScanComponentInput = {
  deliveryId: string;
  trackingCode?: string;
  scanIntent: PackageScanIntent;
  currentStatusLabel: string;
  currentCustodyLabel?: string;
  nextActorLabel?: string;
  actorRole: "station_operator" | "driver" | "final_mile_courier";
  stationId?: string;
  assignmentActorId?: string;
  dataFreshness: "live" | "refreshing" | "cached_fresh" | "cached_stale" | "offline_cached";
  manualFallbackAllowed: boolean;
  offlineQueueAllowed: boolean;
  submitMode: "return_scan_only" | "host_submits" | "component_adapter";
};
```

Rules:

- `deliveryId` is required.
- `scanIntent` is required.
- `actorRole` is required.
- `dataFreshness` is required.
- host must block component opening when route access is not authorized.
- host must provide a safe display label, not raw private context.
- component must reject missing required input with a developer-visible invariant.

## Output Contract
The component returns one of these outcomes:

```ts
type PackageScanOutcome =
  | {
      kind: "scan_captured";
      scanIntent: PackageScanIntent;
      normalizedCode: string;
      redactedCode: string;
      source: "camera" | "manual";
      fallbackUsed: boolean;
    }
  | {
      kind: "submit_requested";
      scanIntent: PackageScanIntent;
      normalizedCode: string;
      redactedCode: string;
      source: "camera" | "manual";
      fallbackUsed: boolean;
    }
  | {
      kind: "cancelled";
      reason: "user_closed" | "permission_denied" | "route_changed";
    }
  | {
      kind: "recovery_requested";
      recovery: "scan_again" | "open_custody_chain" | "report_issue" | "open_outbox" | "open_support";
    };
```

Rules:

- raw `normalizedCode` must be passed only to host workflow memory, typed request payload, or approved offline outbox payload store.
- `redactedCode` is safe for UI display.
- scanner analytics may use only redacted result metadata, never raw code.
- cancellation must not create an outbox action.

## Intent Mapping
Each scan intent maps to one field and one product meaning.

| Intent | Request field | Product meaning | Backend operation |
| --- | --- | --- | --- |
| `intake_label_binding` | `labelScanCode` | bind package label and confirm origin intake | `confirm_intake` |
| `dispatch_readiness` | `packageScanCode` | record station dispatch readiness, no custody transfer | `dispatch_delivery` |
| `driver_pickup_custody` | `packageScanCode` | driver accepts origin custody after backend confirmation | `confirm_pickup` |
| `destination_receipt` | `packageScanCode` | destination station receives package from driver | `receive_destination` |
| `courier_accept_custody` | `packageScanCode` | courier accepts final-mile custody | `accept_final_mile_assignment` |

Rules:

- component must show intent meaning before scan.
- component must distinguish readiness from custody transfer.
- component must not infer intent from scan value.
- component must not submit if host says required parent fields are missing.

## Code Normalization
Normalize scan values before local validation.

Rules:

- trim leading and trailing whitespace.
- preserve internal characters.
- reject empty value.
- reject values shorter than 4 characters.
- reject values longer than 80 characters.
- preserve case unless backend contract changes.
- do not strip prefixes unless package-label policy explicitly defines prefixes.
- do not display full normalized code outside manual entry and review with masking rules.

Redaction:

```ts
function redactScanCode(code: string): string {
  if (code.length <= 8) return "ending " + code.slice(-2);
  return code.slice(0, 3) + "..." + code.slice(-3);
}
```

The implementation may choose a stricter redaction, but it must not expose the full code in normal UI.

## Camera State Machine
Canonical states:

```ts
type PackageScanState =
  | "idle"
  | "permission_pending"
  | "permission_denied"
  | "camera_unavailable"
  | "camera_ready"
  | "scanning"
  | "scan_detected"
  | "scan_review"
  | "manual_entry"
  | "manual_review"
  | "fallback_requires_approval"
  | "validating_local"
  | "ready_to_return"
  | "ready_to_submit"
  | "submitting"
  | "offline_queue_ready"
  | "offline_queued"
  | "mismatch"
  | "duplicate_label"
  | "blocked"
  | "error";
```

Rules:

- `permission_pending` requests permission once per component open.
- `permission_denied` offers manual entry if allowed.
- `camera_unavailable` offers manual entry if allowed.
- `scanning` ignores repeated identical reads during debounce window.
- `scan_detected` stops active scanning until user confirms or scans again.
- `manual_entry` requires explicit user action.
- `fallback_requires_approval` appears before manual fallback can submit where policy requires it.
- `offline_queue_ready` appears only when host allows queueing.
- `offline_queued` appears only after durable outbox insert succeeds.

## Camera Behavior
Required behavior:

- request camera permission through platform-approved API.
- show clear permission denied recovery.
- show a scan frame guide.
- support torch toggle where hardware and API allow.
- pause scanning after a read.
- avoid processing repeated reads from the same package without user intent.
- let user scan again.
- provide manual entry path.
- stop camera when component unmounts.
- stop camera when route changes.
- stop camera when app backgrounds if platform requires it.

Blocked behavior:

- do not keep camera active behind another modal.
- do not submit the first detected read without review on custody-moving intents.
- do not show raw camera frame data in logs.
- do not keep scanning while a backend submit is pending.
- do not read multiple codes and guess the right one.

## Manual Fallback Policy
Manual entry is a controlled fallback, not a default path.

Allowed when:

- camera permission is denied.
- camera hardware is unavailable.
- label is damaged but human-readable.
- lighting or glare prevents reliable scan.
- host workflow allows fallback.

Blocked when:

- host workflow forbids manual fallback.
- supervisor acknowledgement is required and missing.
- data is too stale for action and offline queue is not allowed.
- role or scope is not valid.
- entry does not pass local validation.

Manual entry must:

- show why fallback is being used.
- require exact code entry.
- show redacted review.
- set `fallbackUsed: true`.
- include `supervisorOverrideActorId` only when approved by host policy.
- route to recovery when fallback is blocked.

## Offline Integration
The component does not own the offline outbox, but it must cooperate with it.

Rules:

- component may return a scan result to host for outbox enqueue.
- component may show `offline_queue_ready` only when host allows queueing.
- component may show `offline_queued` only after host confirms durable insert.
- component must not mark scan success as backend success while offline.
- mismatch cannot be queued as success.
- duplicate label cannot be queued as success.
- local validation failure cannot be queued.
- offline queued state must link to offline outbox.

## Error And Recovery Mapping
Backend or host errors map to component recovery states.

| Signal | Component state | Recovery |
| --- | --- | --- |
| `PACKAGE_SCAN_MISMATCH` | `mismatch` | scan again, custody chain, issue |
| duplicate label policy | `duplicate_label` | custody chain, issue, admin route when allowed |
| `FORBIDDEN` | `blocked` | role-safe denied state |
| `PAYMENT_REQUIRED` | `blocked` | payment blocked state |
| `INVALID_STATUS_TRANSITION` | `blocked` | refresh delivery |
| `RATE_LIMITED` | `blocked` | cooldown state |
| network failure with queue allowed | `offline_queue_ready` | queue action |
| network failure without queue | `error` | retry or reconnect |
| camera denied | `permission_denied` | allow camera or manual fallback |
| camera unavailable | `camera_unavailable` | manual fallback |
| manual validation failure | `manual_entry` | fix input |

Rules:

- mismatch and duplicate label route to specialized state components.
- blocked states must not expose raw backend details.
- rate-limited scan retry must respect cooldown.
- server `requestId` should be available to host recovery.

## Privacy And Redaction
The scan component handles sensitive physical identifiers.

Always redact:

- scan code in visible post-capture UI
- scan code in analytics
- scan code in logs
- scan code in crash reports
- scan code in route params
- scan code in notification content

Allowed raw code destinations:

- in-memory active form state
- typed request payload
- sensitive offline outbox payload store
- secure support evidence channel only if policy approves

Rules:

- raw code must not be stored in normal Redux state.
- raw code must not be included in query strings.
- raw code must not be copied to clipboard by scanner UI.
- manual entry field may temporarily show typed text before review.
- after review, show redacted code only.

## Accessibility Requirements
The component must be usable without a successful camera flow.

Requirements:

- manual entry path is keyboard and screen-reader accessible.
- permission denial has explicit text recovery.
- scan detected state is announced.
- submitting state is announced.
- offline queued state is announced.
- mismatch and duplicate states are announced as errors.
- torch button has accessible label and state.
- scan again button has target size compliant with touch guidance.
- reduced motion mode disables non-essential scanning animation.
- focus returns to the opener when modal closes.
- focus moves to the first relevant recovery action after blocking errors.

## Performance Requirements
The scanner must be responsive on low-cost devices.

Rules:

- process only necessary barcode formats where platform allows settings.
- debounce repeated detections.
- avoid expensive validation in camera frame loop.
- pause camera while reviewing detected code.
- avoid rendering heavy delivery panels inside camera surface.
- avoid repeated permission prompts.
- lazy load scanner code where app architecture supports it.
- clean up camera resources on unmount.

## Telemetry
Allowed events:

- `scan_component_opened`
- `scan_permission_requested`
- `scan_permission_denied`
- `scan_detected`
- `scan_review_confirmed`
- `scan_manual_entry_started`
- `scan_manual_entry_confirmed`
- `scan_fallback_required`
- `scan_submit_requested`
- `scan_offline_queue_requested`
- `scan_recovery_selected`

Required properties:

- `scanIntent`
- `actorRole`
- `surface`
- `source`: camera or manual
- `fallbackUsed`
- `dataFreshness`
- `offlineQueueAllowed`
- `result`: captured, cancelled, blocked, mismatch, duplicate, queued

Forbidden properties:

- raw scan code
- redaction before/after exact values
- receiver phone
- receiver address
- auth token
- idempotency key
- local file path
- backend raw error details

## Test Requirements
Claude Code must add tests when implementing this component.

Unit tests:

- required host input missing throws developer-visible invariant.
- code normalization trims outer whitespace.
- local validation rejects empty, short, and long values.
- redaction never returns full code for normal display.
- intent maps to correct request field.
- duplicate camera reads are suppressed until scan again.
- manual entry sets `fallbackUsed`.
- camera result sets `fallbackUsed: false`.
- permission denied exposes manual path only when allowed.
- stale data blocks submit when host says action unsafe.
- offline queued state requires host confirmation.
- mismatch maps to specialized recovery.
- duplicate label maps to specialized recovery.

Component tests:

- camera permission pending renders permission state.
- camera denied renders recovery actions.
- camera ready renders intent banner and scan frame.
- scan detected pauses scanning and shows review.
- manual entry validates and reviews value.
- custody-moving intent requires confirmation.
- readiness intent copy does not claim custody movement.
- close returns cancelled outcome.
- focus returns to opener.
- status messages are announced.

Integration tests:

- station intake returns `labelScanCode`.
- dispatch readiness returns `packageScanCode` and readiness copy.
- driver pickup returns `packageScanCode` and custody copy.
- destination receipt returns `packageScanCode`.
- courier acceptance returns `packageScanCode`.
- offline allowed path returns scan result for outbox enqueue.
- host backend `PACKAGE_SCAN_MISMATCH` routes to scan mismatch state.
- duplicate label conflict routes to duplicate package label state.

End-to-end tests after UI exists:

- staff scans package and confirms intended action.
- staff denies camera permission and uses approved manual fallback.
- staff scans wrong package and cannot proceed.
- staff sees duplicate label warning and no custody movement.
- staff queues approved scan while offline and opens outbox.
- staff cannot use scanner to bypass role or assignment block.

## Implementation Sequence
Claude Code should implement in this order when frontend build starts:

1. Define scan intent types and host input/output contracts.
2. Build code normalization, validation, and redaction helpers.
3. Build camera permission and availability controller.
4. Build camera scanner shell.
5. Build scan detection debounce.
6. Build scan review state.
7. Build manual entry fallback.
8. Build fallback approval hook point.
9. Build recovery mapping adapter.
10. Integrate with offline outbox bridge through host callbacks.
11. Integrate accessibility announcements.
12. Add telemetry with redaction.
13. Add unit, component, integration, and later end-to-end tests.

## Claude Code Build Instructions
When Claude Code implements this spec:

- do not build actual screen UI from this file.
- do not make scanner generic.
- do not infer scan intent from raw code.
- do not submit custody-moving actions without confirmation.
- do not show full scan code after review.
- do not log scan code.
- do not put scan code in route params.
- do not keep camera running behind another modal.
- do not treat scan detection as backend success.
- do not queue mismatch or duplicate label as success.
- do not bypass host role, station, assignment, status, payment, or freshness gates.
- do not implement supervisor override inside the scanner without host policy.

## Completion Checklist
This infrastructure item is complete only when:

- shared scan component contract exists.
- all scan intents map to correct request field.
- camera and manual paths produce the same typed outcome shape.
- raw scan code is redacted outside approved destinations.
- repeated camera reads are suppressed.
- custody-moving intents require review.
- manual fallback is controlled.
- offline queue bridge is host-owned and safe.
- mismatch and duplicate recovery route to specialized states.
- accessibility states are implemented.
- tests cover permission, manual entry, intent mapping, redaction, recovery, and offline bridge.

## Quality Bar
Pass conditions:

- A station operator can scan fast without losing sight of the current handoff intent.
- A driver cannot accidentally confirm pickup for the wrong package.
- A courier cannot accept custody from a mismatched scan.
- A damaged label can use controlled manual fallback.
- Offline scan capture can queue only through approved host policy.
- Raw scan code does not leak.
- Every blocked scan has a safe recovery path.

Fail conditions:

- scanner can open without delivery ID or scan intent.
- scanner shows full scan code in normal UI after review.
- scanner submits a custody action immediately after camera detection.
- scanner queues mismatch as successful outbox work.
- scanner hides whether a step moves custody.
- scanner bypasses role or assignment scope.
- scanner is unusable without camera access.

## Spec Closure Review
This file is closed when it gives Claude Code a complete reusable scanner contract for package-label workflows without weakening custody rules.

Review questions:

- Can every scan intent be identified before camera capture?
- Can every scan output be routed into the right request field?
- Can manual fallback be audited and controlled?
- Can the component work when camera permission is denied?
- Can scan mismatch and duplicate label states recover safely?
- Can raw scan code remain protected?
- Can tests prove the scanner cannot imply backend success?

If any answer is no, the scan component is not ready for operations buildout.
