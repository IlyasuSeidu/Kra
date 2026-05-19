# Station Condition Check Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationConditionCheck` |
| App | `apps/mobile` |
| Route | `/(ops)/station/inbound/:deliveryId/condition` |
| Primary test ID | `screen-station-condition-check` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `receive_destination` when full receipt payload exists, `create_issue`, `receiveDestinationRequestSchema`, `createIssueRequestSchema`, local condition decision cache |
| Related routes | `/(ops)/station/inbound`, `/(ops)/station/inbound/:deliveryId/receive`, `/(ops)/station/blocked`, `/(ops)/station/final-mile`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `inspection_ready`, `condition_ok_selected`, `condition_damaged_selected`, `route_required`, `route_selected`, `damage_details_required`, `issue_draft_ready`, `return_ready`, `submitting_receipt`, `creating_issue`, `queued_offline`, `sync_pending`, `success`, `conflict`, `status_blocked`, `scope_blocked`, `custody_blocked`, `doorstep_blocked`, `issue_blocked`, `stale_data`, `not_found`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen records the destination-station condition check and next route decision before destination receipt is submitted.

The screen answers one operational question: `What condition is this package in, and where should it go after destination receipt?`

The station operator should be able to:
- Inspect the physical package at destination receipt.
- Mark condition as `ok` or `damaged`.
- Choose the next route: station pickup, doorstep assignment, or issue review.
- Capture structured damage details when needed.
- Create or queue a damage issue when the package should not continue normally.
- Return `condition` and `nextStep` to `StationDestinationReceipt`.
- Submit `receive_destination` only when a valid scan code is already available.
- Recover from missing route, blocked doorstep, stale data, and issue conflicts.

This screen is not:
- A package scan screen.
- An inbound queue.
- A final-mile assignment screen.
- A receiver pickup completion screen.
- A full support case workspace.
- A media upload workflow for receipt damage photos under current backend.
- A place to bypass destination receipt scan.

## Audience
Primary audience:
- Destination station operators inspecting packages at receipt.
- Station leads reviewing damaged or exception-prone arrivals.

Secondary audience:
- Claude Code implementing condition and route selection.
- QA validating condition, route, issue, and handoff state coverage.
- Backend engineers validating `receive_destination` and `create_issue` payload use.
- Operations leads validating damaged-package handling.
- Accessibility reviewers validating form labels, error recovery, and decision clarity.

## User State
The operator has the package physically present or is preparing to receive it from the driver. The operator must make a fast but defensible decision: can this package continue normally, or should it enter issue review?

The user may be:
- Coming from `StationDestinationReceipt` because condition is missing.
- Coming from `StationInboundQueue` after choosing receive.
- Inspecting a fragile package that requires extra attention.
- Seeing visible damage, wet packaging, torn seal, crushed corner, or missing label.
- Working offline with a local receipt decision draft.
- Returning from support after creating a damage issue.

The screen must:
- Require physical inspection.
- Require explicit condition selection.
- Require explicit next route selection.
- Recommend issue review for damaged packages.
- Never silently convert damaged condition into normal delivery.
- Never call `receive_destination` without a package scan code.
- Never claim receipt has succeeded from condition selection alone.

## Backend Contract
Existing backend facts:
- `receive_destination` requires `packageScanCode`, `condition`, and `nextStep`.
- `condition` must match `packageConditionSchema`: `ok` or `damaged`.
- `nextStep` must be `pickup`, `doorstep`, or `issue`.
- `receive_destination` validates destination station scope, driver custody, package scan, and doorstep eligibility.
- `receive_destination` routes to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.
- `create_issue` exists for delivery-linked support cases.
- `createIssueRequestSchema` requires `deliveryId`, `category`, `severity`, `summary`, and optional `description`.
- Issue category can be `damage`.
- Issue severity can be `p1`, `p2`, or `p3`.
- Issue summary is 5 to 160 characters.
- Issue description is 5 to 500 characters.

Current proof asset limitation:
- Current proof asset upload flow is not available for pre-receipt destination damage evidence.
- Station proof asset upload is restricted to certain post-receipt pickup/final-mile contexts.
- This screen must not promise that damage photos are uploaded to backend unless that endpoint is added.
- The UI may allow local photo capture as same-device supporting context only if product enables local evidence retention, but it must label it as local until upload support exists.

Current route decision model:
- This screen produces `condition` and `nextStep`.
- `StationDestinationReceipt` should submit `receive_destination` after scan and review.
- This screen may submit `receive_destination` only when a valid same-session `packageScanCode` is present and the complete request can be built.

Production-ready recommendation:
- Add a pre-receipt damage evidence upload endpoint or issue attachment endpoint.
- Add a dedicated receipt readiness endpoint that returns allowed next steps and condition requirements.
- Add server-side damage route recommendations so operations policy is centrally enforced.

## Relationship To StationDestinationReceipt
Primary flow:
1. `StationDestinationReceipt` preflights delivery.
2. It routes here if `condition` or `nextStep` is missing.
3. This screen captures condition and route.
4. This screen returns decision state to `StationDestinationReceipt`.
5. `StationDestinationReceipt` scans package, reviews, and submits.

Alternate complete-payload flow:
1. `StationDestinationReceipt` already captured scan code.
2. This screen captures condition and route.
3. If policy allows, this screen can show final review and call `receive_destination`.
4. If not, it returns to `StationDestinationReceipt` for review and submit.

Default implementation:
- Return to `StationDestinationReceipt` after condition and route are complete.
- Keep one final custody-changing submit surface unless product explicitly enables complete-payload submit here.

Forbidden:
- Submit with no scan code.
- Submit with default route.
- Create issue and still route damaged package normally without operator confirmation.
- Capture local photos and describe them as uploaded.

## Condition Authority
Condition values:
- `ok`
- `damaged`

`ok` means:
- Outer packaging is intact enough for normal handling.
- Label is present and legible enough for scans.
- No visible water damage, crushing, puncture, torn seal, or tamper concern.
- No fragile warning concern is visible.

`damaged` means:
- Any visible damage or tamper signal exists.
- Package label is missing, obscured, or compromised.
- Package is wet, crushed, punctured, torn, opened, resealed, leaking, or unusually light/heavy.
- Fragile package has impact marks or rattling.
- Operator is not confident the package can continue normally.

Damage severity recommendations:
- `p1`: suspected loss, tamper, severe damage, unsafe package, missing label, or declared high-value concern.
- `p2`: visible damage that may affect contents but package is controllable.
- `p3`: minor packaging damage that does not block station custody but needs audit note.

Default route recommendation:
- `condition=ok` and `doorstepRequested=false`: recommend `pickup`.
- `condition=ok` and `doorstepRequested=true`: recommend `doorstep`, with `pickup` as an explicit fallback.
- `condition=damaged`: recommend `issue`.

Operator may choose a non-recommended route only with explicit confirmation and reason.

## Next Step Authority
Allowed `nextStep` values:
- `pickup`
- `doorstep`
- `issue`

`pickup`:
- Routes package to receiver station pickup after destination receipt.
- Intended for non-doorstep deliveries or doorstep fallback.

`doorstep`:
- Routes package to final-mile assignment after destination receipt.
- Allowed only when `doorstepRequested=true`.
- Should respect doorstep serviceability rules.

`issue`:
- Routes package to issue review after destination receipt.
- Required for serious damage, missing label, suspected tamper, unsafe package, or loss concern.

Route blockers:
- `doorstep` blocked when delivery is not doorstep-requested.
- `doorstep` blocked when doorstep distance is unavailable or outside v1 scope if data is present.
- Normal route blocked when damage severity is `p1` unless supervisor confirms.
- Any route blocked when station scope, custody, or status is invalid.

## Data Sources
Required delivery source:
- `GET /v1/deliveries/:id`

Optional timeline source:
- `GET /v1/deliveries/:id/timeline`

Optional issue creation:
- `POST /v1/issues`

Possible receipt mutation:
- `POST /v1/deliveries/:id/receive-destination`

Local sources:
- Destination receipt session state.
- Captured package scan code when present.
- Condition decision draft.
- Offline issue outbox.
- Offline receipt outbox.
- Station auth session.
- Connectivity state.

Required delivery fields:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `doorstepDistanceKm`
- `package.isFragile`
- `package.declaredValueGhs`
- `receiver.name`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`

Sensitive data handling:
- `GET /v1/deliveries/:id` currently returns the full receiver object.
- This screen may receive receiver phone or address in delivery detail payloads.
- Do not render receiver phone or full address.
- Do not write receiver phone or full address into durable station cache.
- Do not log receiver phone or full address.
- Do not send receiver phone or full address to analytics.
- If a future mobile-safe redacted delivery detail endpoint exists, prefer it for this screen.

Do not call:
- `assign_final_mile` from this screen.
- `complete_delivery_with_proof` from this screen.
- `create_proof_asset_upload` for pre-receipt damage evidence under current backend.
- Admin user list.
- Payment provider endpoints.

## External Reference Inputs
Use these external references as design-quality inputs, not as product promises:
- GS1 logistic label receiving guidance: receivers inspect received logistic units and may check for damage before accepting or reporting exceptions.
- GS1 traceability: receipt events should preserve object, location, actor, time, and business context.
- Android CameraX guidance: camera capture should be lifecycle-aware and resource-conscious if local evidence capture is enabled.
- WCAG error identification: invalid or missing form decisions must be described in text.
- WCAG labels and instructions: condition, route, and damage inputs need clear visible labels and instructions.
- WCAG status messages and target sizing: route changes, queued decisions, and submit results must be announced and operable.

Reference links:
- `https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3`
- `https://ref.gs1.org/guidelines/logistic-label/`
- `https://www.gs1.org/standards/traceability`
- `https://developer.android.com/media/camera/camerax/architecture`
- `https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html`
- `https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html`
- `https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html`
- `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`

## Screen Thesis
The screen should feel like a disciplined receiving inspection card: fast for clean packages, unmissable for damaged packages, and strict about route consequences.

The operator should understand in three seconds:
- What package they are inspecting.
- Whether the package is fragile or high value.
- Which condition is selected.
- Which route will be used after receipt.
- Whether an issue must be opened.

Visual direction:
- Calm inspection checklist.
- Clear binary condition selection.
- Route cards with operational consequences.
- Damage mode shifts the screen to high-attention amber/red.
- No decorative package illustrations.
- No camera-first layout unless local evidence capture is enabled.

## Information Architecture
Primary sections:
1. Delivery inspection header.
2. Risk badges.
3. Condition selection.
4. Damage checklist and details.
5. Next-route selection.
6. Issue decision.
7. Continue or submit action.
8. Offline and conflict states.

Default focus order:
1. Screen heading.
2. Delivery and station context.
3. Risk badges.
4. Condition options.
5. Damage details if required.
6. Route options.
7. Issue action.
8. Continue button.

Do not start with:
- Receiver address.
- Driver details.
- A large empty photo area.
- Long policy text before the decision.

## Header
Title:
- `Check condition`

Subtitle:
- `{trackingCode}`

Header chips:
- `Destination receipt`
- Current status.
- Destination station.
- Online/offline.

Risk badges:
- `Fragile` when `package.isFragile=true`.
- `High value` when `declaredValueGhs > 2000`.
- `Doorstep requested` when `doorstepRequested=true`.
- `Issue open` when active issue exists.

Header copy:
- Normal: `Inspect before receipt`
- Fragile: `Fragile package: inspect carefully`
- Damaged selected: `Damage route needed`
- Offline: `Decision saved locally until receipt submit`

## Condition Selection
Render two large selection cards:
- `Package looks OK`
- `Package is damaged or uncertain`

`Package looks OK` card:
- Helper: `No visible damage, label is legible, and package can continue.`
- Value: `condition=ok`

`Package is damaged or uncertain` card:
- Helper: `Use this for damage, tamper concern, wet packaging, missing label, or uncertainty.`
- Value: `condition=damaged`

Interaction:
- Selecting condition updates route recommendations.
- Changing condition after route selection requires route review again.
- Changing from damaged to ok clears damage details only after confirmation.

Validation:
- No condition selected blocks continue.
- Error copy: `Choose the package condition before continuing.`

## Damage Checklist
Show only when `condition=damaged`.

Checklist items:
- `Crushed or bent package`
- `Wet or stained package`
- `Torn, opened, or resealed package`
- `Puncture or exposed contents`
- `Missing or unreadable label`
- `Fragile item impact concern`
- `Package feels unusually light or heavy`
- `Other visible concern`

Damage severity picker:
- `Urgent`
- `Review`
- `Minor`

Severity mapping:
- `Urgent` maps to issue severity `p1`.
- `Review` maps to issue severity `p2`.
- `Minor` maps to issue severity `p3`.

Damage detail text:
- Required for damaged condition.
- 5 to 300 characters locally.
- Must be concise and factual.
- Do not include receiver phone or full address.
- Do not include staff blame.

Damage detail prompt:
- `Describe what you can see. Example: crushed left corner, label still readable.`

No media promise:
- If local photo capture is enabled, label it `Local photo, not uploaded yet`.
- If backend issue attachments are later added, update this spec to attach proof references.

## Route Selection
Route cards:
- `Station pickup`
- `Doorstep assignment`
- `Issue review`

`Station pickup`:
- `nextStep=pickup`
- Helper: `Package will wait at this station for receiver pickup.`
- Available for normal and fallback routes.

`Doorstep assignment`:
- `nextStep=doorstep`
- Helper: `Package will move to final-mile assignment after receipt.`
- Available only when `doorstepRequested=true`.

`Issue review`:
- `nextStep=issue`
- Helper: `Package moves to blocked review after receipt.`
- Recommended for damaged packages.

Route recommendation:
- Show recommended badge on one route.
- Allow operator to pick another route only when not blocked.
- If route differs from recommendation, require reason.

Route validation:
- No route selected blocks continue.
- Doorstep unavailable shows `Doorstep was not requested for this delivery.`
- Damaged urgent with normal route shows `Urgent damage should go to issue review. Supervisor confirmation required.`

## Issue Creation
Issue creation is required when:
- Condition is damaged and next route is `issue`.
- Label is missing or unreadable.
- Tamper concern is selected.
- Severe damage is selected.
- Operator chooses `Open damage issue`.

Issue payload:
- `deliveryId`
- `category=damage`
- `severity` from damage severity.
- `summary`
- Optional `description`

Generated summary:
- `Destination condition issue: {primaryDamageReason}`

Generated description:
- Include condition.
- Include selected damage checklist items.
- Include route decision.
- Include station ID.
- Exclude receiver phone.
- Exclude receiver full address.
- Exclude raw scan code.

Issue creation behavior:
- Online: call `create_issue` before returning when issue is required.
- Offline: queue `create_issue` only when outbox policy allows.
- If issue creation fails, allow operator to return with `nextStep=issue` only after showing that issue creation failed.
- If backend already has an open damage issue, link to it instead of creating another when discoverable.

Current limitation:
- Damage issue cannot attach photos through current issue schema.
- If local photos are captured, they remain local operational context until attachment support exists.

## Continue Behavior
Default primary action:
- `Continue to receipt`

Enabled when:
- Condition selected.
- Route selected.
- Damage details complete when condition is damaged.
- Issue required state is handled or explicitly queued/failed with visible warning.

Return payload to receipt:
- `condition`
- `nextStep`
- `damageSeverity`
- `damageReasons`
- `damageDescription`
- `issueId` if created.
- `issueQueuedLocalId` if queued.
- `routeReason` if operator chose a non-recommended route.

If same-session scan code exists and product enables direct submit:
- Show final review.
- Call `receive_destination`.
- Otherwise return to `StationDestinationReceipt`.

Default safer behavior:
- Always return to `StationDestinationReceipt` for final scan review and submit.

## Offline Behavior
Offline allowed:
- Save condition decision locally.
- Queue `create_issue` when policy allows.
- Return condition and route to receipt screen.
- Queue full `receive_destination` only if scan code and all receipt evidence already exist and policy allows.

Offline blocked:
- Uploading damage photos to backend.
- Claiming issue exists before issue queue sync.
- Claiming destination receipt confirmed before receipt sync.

Offline banner:
- Title: `Offline condition decision`
- Body: `You can save this inspection. Backend receipt is not confirmed until sync succeeds.`

Queued issue banner:
- Title: `Damage issue queued`
- Body: `The issue will sync when the station reconnects. Keep the package in the review area.`

Data freshness:
- If cached delivery detail is older than 30 minutes, show stale warning.
- If cached detail is older than 4 hours, block direct receipt submit and require refresh before custody mutation.

## Visual System
Art direction:
- `Inspection checkpoint`

Design principles:
- Binary condition decision first.
- Route consequence second.
- Damage details only when needed.
- Strong warning language for damaged packages.
- No clutter around the main decision.

Color roles:
- Background: neutral station surface.
- OK condition: deep green.
- Damaged condition: amber with red for severe blockers.
- Pickup route: blue-green.
- Doorstep route: deep blue.
- Issue route: amber/red.
- Offline: charcoal with amber accent.

Do not use:
- Purple default gradients.
- Generic warning illustrations.
- Excessive icons.
- Decorative package art.
- Low-contrast form controls.

Typography:
- Condition labels must be large and clear.
- Damage detail helper text must be readable.
- Route consequences must not be hidden in tiny metadata.

Motion:
- Selecting damaged condition can reveal checklist with a short expand transition.
- No shaking error animations.
- Reduce-motion disables expand animation.

## Component Inventory
Required components:
- `ConditionCheckHeader`
- `ReceiptRiskBadges`
- `ConditionChoiceCards`
- `DamageChecklist`
- `DamageSeverityPicker`
- `DamageDetailInput`
- `RouteDecisionCards`
- `IssueDecisionPanel`
- `ConditionOfflineBanner`
- `ConditionContinueBar`
- `ConditionConflictState`
- `ConditionErrorState`

Shared components to reuse:
- Station identity chip.
- Delivery status chip.
- Offline outbox badge.
- Accessible form field.
- Accessible bottom sheet.
- Action recovery route.
- Custody chain link.

Do not build:
- New scanner.
- New media upload infrastructure.
- New issue attachment UI unless backend supports it.
- Final-mile courier selector.
- Receiver proof component.

## Error Handling
All errors must identify:
- Field or decision with the error.
- What is wrong.
- What the operator can do next.

Missing condition:
- Title: `Choose condition`
- Body: `Select whether the package looks OK or is damaged before continuing.`

Missing route:
- Title: `Choose next route`
- Body: `Select where this package should go after destination receipt.`

Doorstep blocked:
- Title: `Doorstep not available`
- Body: `This delivery was not requested for doorstep delivery. Choose station pickup or issue review.`

Damage details missing:
- Title: `Add damage details`
- Body: `Briefly describe the visible damage or uncertainty.`

Issue create failed:
- Title: `Damage issue did not sync`
- Body: `The route can still be set to issue review, but support will not see the issue until retry succeeds.`

Wrong station:
- Title: `Wrong destination station`
- Body: `This package is not addressed to this station. Do not continue receipt.`

Status blocked:
- Title: `Condition check not available`
- Body: `This delivery is not waiting for destination receipt.`

Stale data:
- Title: `Refresh required`
- Body: `This condition check uses old delivery data. Refresh before submitting receipt.`

## Privacy And Security
Privacy:
- Render receiver name only if needed for package identification.
- Do not render receiver phone.
- Do not render receiver full address.
- Do not render sender phone.
- Do not render driver phone.

Damage text rules:
- Do not include receiver contact details.
- Do not include private address details.
- Do not include payment references.
- Do not include raw package scan code.
- Keep description factual and short.

Local evidence:
- If local photos are enabled, store them encrypted where platform supports it.
- Clear unsynced local photos when operator discards condition draft.
- Do not include local photo metadata in analytics.

Analytics:
- Track structured damage reason IDs, not free-text descriptions.
- Track route choice and condition, not receiver data.

## Accessibility Requirements
Form:
- Every condition, route, severity, and damage input must have visible labels.
- Required fields must be identified in text.
- Field errors must be shown in text near the field and in summary.
- Route cards must expose selected state.

Screen reader:
- Condition changes announced.
- Recommended route announced.
- Doorstep blocked reason announced.
- Issue queued state announced.
- Continue disabled reason available.

Touch:
- Condition cards at least 56px high.
- Route cards at least 56px high.
- Checklist rows at least 44px high.
- Continue button at least 44px high.

Color:
- Do not rely on color only for damaged state.
- Icons must have text labels.
- Contrast must meet WCAG AA.

Motion:
- Respect reduce-motion.
- Do not auto-focus damage description unless user selects damaged condition with keyboard/screen reader context preserved.

## Analytics Events
Track:
- `station_condition_check_viewed`
- `station_condition_selected`
- `station_condition_damage_reason_selected`
- `station_condition_route_selected`
- `station_condition_issue_create_started`
- `station_condition_issue_create_succeeded`
- `station_condition_issue_create_failed`
- `station_condition_issue_queued_offline`
- `station_condition_continue_to_receipt`
- `station_condition_direct_receipt_submit_started`
- `station_condition_direct_receipt_submit_succeeded`
- `station_condition_direct_receipt_submit_failed`

Allowed properties:
- `deliveryId`
- `stationId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `condition`
- `nextStep`
- `damageSeverity`
- `damageReasonIds`
- `doorstepRequested`
- `isFragile`
- `offline`
- `screenVersion`

Forbidden properties:
- Receiver phone.
- Receiver full address.
- Sender phone.
- Driver phone.
- Package scan code.
- Damage free text.
- Local photo metadata.
- Payment provider reference.

## QA Acceptance Criteria
Loading:
- Screen loads delivery detail.
- Wrong station blocks condition workflow.
- Wrong status blocks condition workflow.
- Driver custody missing shows receipt blocker.

Condition:
- No condition selected blocks continue.
- Selecting OK hides damage checklist.
- Selecting damaged shows checklist, severity, and detail input.
- Changing condition after route selection requires route review.
- Fragile package shows risk badge.
- High-value package shows risk badge.

Route:
- No route selected blocks continue.
- Doorstep route disabled when `doorstepRequested=false`.
- Doorstep route enabled when `doorstepRequested=true`.
- Damaged condition recommends issue route.
- Urgent damage with pickup or doorstep requires supervisor confirmation.

Issue:
- Damaged plus issue route creates or queues damage issue.
- Issue payload uses category `damage`.
- Issue summary length is valid.
- Issue description excludes receiver contact data.
- Existing open damage issue is not duplicated when discoverable.
- Issue create failure is visible.

Receipt handoff:
- Continue returns `condition` and `nextStep` to `StationDestinationReceipt`.
- Direct receipt submit is blocked without scan code.
- Direct receipt submit uses `receive_destination` only when full request exists.
- Returned state survives app background/foreground during same session.

Offline:
- Offline condition draft can be saved.
- Offline issue can be queued when policy allows.
- Offline condition state does not claim receipt confirmed.
- Stale cache blocks direct receipt submit.

Accessibility:
- Required field errors are described in text.
- Condition and route selected states are announced.
- Disabled continue reason is available.
- Touch targets meet minimum size.

Privacy:
- Receiver phone never renders.
- Receiver full address never renders.
- Damage free text is not sent to analytics.
- Package scan code is not used in this screen analytics.

## Test IDs
Screen:
- `screen-station-condition-check`

Header:
- `condition-check-header`
- `condition-check-risk-fragile`
- `condition-check-risk-high-value`
- `condition-check-risk-doorstep`

Condition:
- `condition-choice-ok`
- `condition-choice-damaged`
- `condition-error-missing`

Damage:
- `damage-checklist`
- `damage-reason-crushed`
- `damage-reason-wet`
- `damage-reason-torn`
- `damage-reason-puncture`
- `damage-reason-label`
- `damage-reason-fragile-impact`
- `damage-reason-weight-concern`
- `damage-reason-other`
- `damage-severity-picker`
- `damage-description-input`
- `damage-description-error`

Route:
- `route-choice-pickup`
- `route-choice-doorstep`
- `route-choice-issue`
- `route-error-missing`
- `route-error-doorstep-blocked`

Issue:
- `condition-issue-panel`
- `condition-create-issue`
- `condition-issue-queued`
- `condition-issue-error`

Actions:
- `condition-continue-to-receipt`
- `condition-direct-submit`
- `condition-open-custody-chain`
- `condition-open-support`

States:
- `condition-loading`
- `condition-offline-banner`
- `condition-stale`
- `condition-conflict`
- `condition-error`

## Implementation Notes
Repository layer:
- Load delivery detail from cache first.
- Refresh online when possible.
- Do not fetch timeline unless active issue or custody evidence is needed.
- Use `create_issue` only for required damage issue handling.
- Use `receive_destination` only when full payload exists.

View model:
- Store condition and route as explicit nullable values.
- Store recommendation separately from actual selection.
- Keep damage reasons as stable IDs.
- Keep damage description out of analytics.
- Track whether route must be re-reviewed after condition changes.

Navigation:
- Default continue returns to `StationDestinationReceipt`.
- If direct submit succeeds with `awaiting_final_mile_assignment`, route to final-mile queue.
- If direct submit succeeds with `awaiting_receiver_pickup`, route to delivery detail or inbound success.
- If direct submit succeeds with `issue_reported`, route to blocked queue.
- If conflict occurs, route to action recovery.

Performance:
- Condition screen should render from cached detail under 300ms.
- Avoid heavy camera/media libraries unless local photo capture is enabled.
- Form state should persist through app backgrounding.

## Edge Cases
Damaged but operator chooses pickup:
- Require explicit reason.
- Require supervisor confirmation for urgent damage.
- Include reason in local condition state.

Doorstep requested but damaged:
- Recommend issue.
- Allow doorstep only after explicit confirmation if policy permits.

Doorstep distance missing:
- Allow route selection only if policy says distance was already verified elsewhere.
- Otherwise block doorstep and explain.

Label unreadable:
- Condition must be damaged.
- Next step should be issue.
- Receipt scan may require manual fallback with supervisor on the receipt screen.

Open issue already exists:
- Show issue chip.
- Link to issue.
- Do not create duplicate issue when discoverable.

Local photos enabled but backend unsupported:
- Show local-only label.
- Do not promise upload.
- Clear local-only photos when issue is abandoned unless outbox policy preserves them.

Operator backs out:
- Ask whether to keep condition draft if any field was changed.
- Do not save partial damaged description as issue.

## Content Quality Bar
The screen is complete only when:
- Condition and next route cannot be skipped.
- Damaged packages are visibly escalated.
- Doorstep routing respects eligibility.
- Issue creation is structured and privacy-safe.
- Local photo limitations are explicit.
- The receipt submit boundary is clear.
- Accessibility errors and labels are fully defined.
- QA can validate every condition and route state without guessing.

## Open Product Questions
These questions do not block the first UI build because safe defaults are defined:
- Should damaged condition always force issue route in v1?
- Should all fragile packages require local photo capture?
- Should condition check directly submit receipt when scan already exists?
- Should issue attachments be added to `create_issue` or as separate proof assets?
- Should doorstep fallback to station pickup trigger automatic surcharge refund review?

Default decisions until resolved:
- Damaged condition recommends issue but can be overridden with explicit confirmation.
- No backend photo upload is promised for pre-receipt damage.
- Condition check returns to destination receipt by default.
- Doorstep route is blocked when `doorstepRequested=false`.
- Damage issue uses category `damage` and structured summary.

## Final Implementation Directive For Claude Code
Build `StationConditionCheck` as the destination receipt inspection and route-decision screen. It must load the delivery, block wrong station or invalid status, require explicit `condition` and `nextStep`, recommend issue review for damaged packages, create or queue a damage issue when required, and return the completed condition decision to `StationDestinationReceipt`. It may call `receive_destination` only when a valid scan code and full payload already exist. It must not promise backend photo upload for damage evidence under the current contracts, must not show receiver phone or full address, and must not send damage free text or scan codes to analytics.
