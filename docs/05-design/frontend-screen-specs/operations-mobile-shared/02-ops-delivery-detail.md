# Ops Delivery Detail Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID          | `OpsDeliveryDetail`                                                                                                                                                                                                                                                                                                                 |
| App                | `apps/mobile`                                                                                                                                                                                                                                                                                                                       |
| Route              | `/(ops)/deliveries/:deliveryId`                                                                                                                                                                                                                                                                                                     |
| Primary test ID    | `screen-ops-delivery-detail`                                                                                                                                                                                                                                                                                                        |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                                                                                                                       |
| Build priority     | `P0 Operations Critical`                                                                                                                                                                                                                                                                                                            |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `deliveryDetailResponseSchema`, `deliveryTimelineResponseSchema`, `deliveryTimelineEntrySchema`, `AuthPrincipal`, `roleSchema`, `getCapabilities`, `canPerform`                                                                                                                            |
| Related routes     | `/(ops)/deliveries/:deliveryId/scan`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/support`, `/(ops)/station/intake`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/driver/runs`, `/(ops)/courier/assignments` |
| Required states    | `loading_detail`, `loading_timeline`, `ready`, `timeline_partial`, `custody_warning`, `payment_blocked`, `issue_blocked`, `offline_cached`, `stale_cache`, `not_found`, `not_authorized`, `session_expired`, `api_error`                                                                                                            |

## Product Job

This screen is the authenticated staff delivery detail for field operations. It lets station operators, drivers, final-mile couriers, and support staff understand one delivery record before choosing the right operational workflow.

The screen answers one operational question: `What is the current verified state of this delivery, and what safe workflow should I open next?`

The staff member should be able to:

- Confirm they are viewing the correct delivery.
- See tracking code, current status, payment status, service type, and station path.
- Understand current custody role without exposing unnecessary internal identifiers.
- See the newest operational event and touchpoint.
- See whether the timeline is fresh, partial, stale, or unavailable.
- Open the custody chain route.
- Open the package scan route when a scan-based workflow is required.
- Open the relevant role workflow for the current status.
- Open the issue route with delivery context.
- Open support or offline outbox when the app cannot safely continue.
- Recover from authorization, network, stale cache, missing record, and server errors.

This screen is not:

- A custody transfer screen.
- A package scan submission screen.
- A payment console.
- A refund console.
- An assignment execution screen.
- A proof capture screen.
- A receiver-facing tracking page.
- A public delivery status page.
- A manual override surface.
- A place to edit package, receiver, station, route, or quote data.

## Audience

Primary audience:

- Station operators checking an intake, outbound, inbound, pickup, or final-mile delivery.
- Line-haul drivers checking assigned transport work.
- Final-mile couriers checking an assigned doorstep delivery.
- Support staff reviewing status before escalation.
- Field staff working under low bandwidth, time pressure, and physical package handling constraints.

Secondary audience:

- Claude Code implementing the shared mobile detail route.
- QA validating backend contract use and state coverage.
- Operations leads validating custody-safe navigation.
- Security reviewers validating access control and data exposure.
- Accessibility reviewers validating status, timeline, and action usability.

## User State

The user is authenticated and likely arrived from an operations queue, scan route, notification, or search result. They need fast orientation, not a generic profile page.

The user may be:

- Standing at a station counter with a package.
- Loading a driver run.
- Receiving a package at destination station.
- Preparing final-mile dispatch.
- Meeting a receiver.
- Investigating a blocked delivery.
- Working offline after the delivery was cached.
- Recovering from a push notification deep link.
- Verifying whether they have authority to act on this delivery.

The screen must:

- Use backend access rules as authority.
- Treat `get_delivery` as the source for the delivery header and operational summary.
- Treat `get_delivery_timeline` as the source for timeline entries.
- Scope role actions by `AuthPrincipal.role`, current assignment, station scope, and backend capabilities.
- Keep all state-changing actions inside dedicated workflow screens.
- Make stale or partial data visibly different from fresh data.
- Avoid raw internal IDs unless the spec explicitly allows them for QA tooling.
- Avoid showing actions that backend policy would reject.
- Avoid hiding custody gaps behind friendly language.

## Primary Action

Primary action by state and role:

- `station_operator` with `created`: open station intake workflow.
- `station_operator` with `received_at_origin`: open outbound queue.
- `station_operator` with `awaiting_driver_assignment`: open driver assignment workflow.
- `station_operator` with `assigned_to_driver`: open outbound dispatch workflow.
- `station_operator` with `in_transit`: no station mutation action unless destination station scope matches.
- `station_operator` with `received_at_destination`: open destination handling workflow.
- `station_operator` with `awaiting_receiver_pickup`: open pickup support workflow.
- `station_operator` with `awaiting_final_mile_assignment`: open final-mile assignment workflow.
- `driver` with `assigned_to_driver`: open driver pickup workflow.
- `driver` with `dispatched_from_origin`: open run detail.
- `driver` with `in_transit`: open destination handoff workflow.
- `final_mile_courier` with `assigned_for_final_mile`: open courier acceptance scan workflow.
- `final_mile_courier` with `out_for_delivery`: open delivery proof workflow.
- `support_admin` with any active status: open issue route or support case route.
- `ops_admin` with any active status: open custody chain, issue route, or relevant role workflow if capabilities allow.

Universal secondary actions:

- `Open custody chain`
- `Open scan`
- `Report issue`
- `Open offline outbox`
- `Open support`
- `Refresh`

Blocked behavior:

- Do not mutate delivery status from this screen.
- Do not submit package scans from this screen.
- Do not transfer custody from this screen.
- Do not capture proof from this screen.
- Do not accept or reject driver or courier assignments from this screen.
- Do not assign a driver or courier from this screen.
- Do not cancel, refund, or close a delivery from this screen.
- Do not reveal a button that the authenticated principal cannot use.
- Do not rely on locally inferred permission when backend capability data is available.
- Do not treat assignment as custody. Assignment is not custody.

## First Meaningful Value

First meaningful value is reached when staff sees:

- Delivery identity: tracking code and short delivery route.
- Current status and payment status.
- Current custody role.
- Latest event and latest touchpoint time.
- Primary safe next route for their role.
- Timeline loading, ready, partial, or stale state.
- Clear blocked state if they cannot act.

The first viewport must answer:

- `Is this the right delivery?`
- `Where is it in the lifecycle?`
- `Who currently has custody?`
- `Is payment clear enough for operations to proceed?`
- `What workflow can I safely open next?`
- `Is the data fresh?`

## Main Tension

Field staff need speed, but speed cannot bypass custody, payment, scan, assignment, or proof rules. A delivery detail screen must help staff move to the right next workflow without turning the detail page into an unsafe command panel.

The design must balance:

- Fast orientation against strong authority checks.
- Clear status against not overstating certainty.
- Visible custody against privacy and security boundaries.
- Timeline density against mobile scan speed.
- Offline continuity against stale-data risk.
- Role-specific action routing against a shared implementation.
- Operational urgency against avoiding accidental mutations.

## Design Brief

User and job:

- Staff needs a delivery-specific operations detail that explains current state and opens the correct safe workflow.

Context of use:

- Mobile, active shift, physical package handling, interruptions, poor connectivity, shared station environments.

Entry point:

- Role home work row.
- Station queue row.
- Driver run detail.
- Courier assignment detail.
- Package scan route.
- Push notification.
- Support search result.
- Offline outbox retry context.

Success state:

- Staff understands the verified delivery state and opens the correct workflow without unsafe shortcuts.

Primary action:

- Role/status-specific route action.

Navigation model:

- Delivery command sheet with identity header, custody strip, role action panel, timeline, and support paths.

Density:

- Medium-high. The screen carries operational truth, but must stay scannable under field pressure.

Visual thesis:

- A custody-aware field dossier: calm, precise, and built around verified state rather than dashboard decoration.

Restraint rule:

- Avoid map-first clutter, admin metrics, excessive badges, raw records, and mutation controls.

Product lens:

- Delivery safety, custody accountability, and fast route selection.

System stance:

- Native mobile operations detail with strong status hierarchy and explicit evidence boundaries.

Interaction thesis:

- Confirm identity, expose custody and status, then route to a dedicated workflow.

Signature move:

- A top custody strip that shows `Current custodian`, `Payment`, and `Latest verified touchpoint` as the screen's operational anchor.

Activation event:

- Staff opens scan, custody chain, role workflow, issue route, support, offline outbox, or refresh.

## Elite Quality Gate

This spec is not closed unless `OpsDeliveryDetail` is custody-safe, role-safe, and useful under weak network conditions.

Non-negotiable quality requirements:

- The first viewport shows tracking code, current status, payment status, current custody role, and newest verified event.
- `get_delivery` and `get_delivery_timeline` are read-only.
- All mutation workflows are links to dedicated screens.
- Role-specific actions are derived from backend role, station scope, assignment, status, and capability policy.
- Timeline loading failure does not hide the delivery detail.
- Partial timeline state is visible.
- Stale cached data is visible and cannot look fresh.
- Payment-blocked state is visible before transport or final-mile workflows.
- Custody gaps are visible without exposing sensitive internal actor identifiers.
- Issue route is always available when the delivery is visible and user role allows issue creation.
- The screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:

- If this screen can transfer custody, the screen remains open.
- If raw `currentCustodyActorId` is exposed as normal user copy, the screen remains open.
- If a stale delivery can look current, the screen remains open.
- If a role can see a workflow backend would reject, the screen remains open.
- If timeline errors erase the main delivery detail, the screen remains open.
- If the payment state is hidden when operations are blocked, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [Microsoft Dynamics 365 Field Service mobile app](https://learn.microsoft.com/en-us/dynamics365/field-service/get-work-done-mobile-app): field staff need job details, status, location context, notes, and timeline access from mobile work records.
- [Material Design lists](https://m1.material.io/components/lists.html): timelines and activity lists should be vertically scannable and logically ordered.
- [Material Design accessibility](https://m1.material.io/usability/accessibility.html): mobile UI must preserve clear layout, labels, focus, and content meaning for assistive technology.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): refresh, loading, partial timeline, and error status must be programmatically announced without stealing focus.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): operational actions need reliable touch targets.

Applied decisions:

- Use a delivery dossier structure, not a dense admin record table.
- Keep identity, status, payment, custody, and newest event above the fold.
- Treat timeline as evidence, not decoration.
- Route to dedicated mutation screens instead of embedding commands.
- Distinguish fresh, stale, partial, and offline states.
- Keep permission-scoped actions visible only when usable.

## Data Contract And Backend Alignment

Primary read:

- Operation: `get_delivery`.
- HTTP: `GET /v1/deliveries/:deliveryId`.
- Schema: `deliveryDetailResponseSchema`.
- Required route param: `deliveryId`.

Timeline read:

- Operation: `get_delivery_timeline`.
- HTTP: `GET /v1/deliveries/:deliveryId/timeline`.
- Schema: `deliveryTimelineResponseSchema`.
- Entry schema: `deliveryTimelineEntrySchema`.

Primary auth:

- `AuthPrincipal`.
- `roleSchema`.
- `getCapabilities`.
- `canPerform`.

Allowed detail fields:

- `deliveryId`
- `trackingCode`
- `senderId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver.name`
- `receiver.phone`
- `receiver.addressText`
- `package.description`
- `package.weightKg`
- `package.sizeTier`
- `package.isFragile`
- `package.declaredValueGhs`
- `quote`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `latestTouchpoint.role`
- `latestTouchpoint.stationId`
- `latestTouchpoint.occurredAt`
- `finalProof.type`
- `finalProof.reference`
- `finalProof.receivedByName`
- `finalProof.capturedAt`
- `createdAt`

Allowed timeline fields:

- `entryId`
- `entryType`
- `occurredAt`
- `label`
- `actorId`
- `actorRole`
- `stationId`
- `metadata`

Display restrictions:

- Do not show `senderId` in normal UI copy.
- Do not show `currentCustodyActorId` in normal UI copy.
- Do not show `assignedDriverId` or `assignedFinalMileCourierId` as raw IDs in normal UI copy.
- Do not show `finalProof.reference` as a raw storage key.
- Do not show raw timeline `metadata` in normal UI copy.
- Do not show full receiver phone by default when the role does not need it for the next workflow.
- Do not show payment gateway references or internal ledger identifiers.

Permitted technical affordance:

- QA builds may expose copied IDs through a protected diagnostics action when enabled by non-production configuration.
- Production UI must use human-readable role, station, and status labels.

## Status Model

The screen must understand every `deliveryStatusSchema` value.

Status display rules:

- `draft`: staff should rarely see this; show `Draft delivery` and no ops workflow except support.
- `created`: show `Created` and route station operator to intake.
- `received_at_origin`: show `Received at origin` and route station operator to outbound preparation.
- `awaiting_driver_assignment`: show `Needs driver assignment` and route station operator to assignment.
- `assigned_to_driver`: show `Driver assigned` and route driver or station operator to pickup or dispatch workflow.
- `dispatched_from_origin`: show `Dispatched from origin` and route driver to run detail.
- `in_transit`: show `In transit` and route driver to destination handoff when assigned.
- `received_at_destination`: show `Received at destination` and route station operator to pickup or final-mile decision.
- `awaiting_receiver_pickup`: show `Ready for receiver pickup` and route station operator to pickup support.
- `awaiting_final_mile_assignment`: show `Needs final-mile assignment` and route station operator to assignment.
- `assigned_for_final_mile`: show `Courier assigned` and route courier to acceptance scan.
- `out_for_delivery`: show `Out for delivery` and route courier to proof workflow.
- `delivered`: show `Delivered` and expose proof summary plus custody chain.
- `issue_reported`: show `Issue reported` and elevate issue route.
- `on_hold`: show `On hold` and route support or station operator to blocked queue.
- `delivery_failed`: show `Delivery failed` and route support or blocked queue.
- `cancelled`: show `Cancelled` and remove active workflow actions.
- `closed`: show `Closed` and remove active workflow actions.

Terminal status rules:

- `delivered`, `delivery_failed`, `cancelled`, and `closed` must never show active scan or handoff routes as primary actions.
- Terminal records may still show custody chain, timeline, support, and receipt/proof summary where authorized.
- `delivered` may show `finalProof` summary if present.
- `delivered` without `finalProof` must show custody warning and issue/support route.

## Payment Status Rules

Payment status must be shown in the custody strip.

Payment display rules:

- Confirmed or settled payment state: show `Payment confirmed`.
- Pending payment state: show `Payment pending`.
- Failed payment state: show `Payment failed`.
- Refunded or refund-pending state: show refund state as informational and route to support if the user needs more context.
- Unknown payment state: show `Payment status unavailable`.

Operational blocking rules:

- If backend indicates `DELIVERY_NOT_PAID` or `PAYMENT_REQUIRED`, show `Payment must be confirmed before this workflow`.
- Transport and final-mile routes that require payment must be disabled when payment is not confirmed.
- Disabled action must explain what blocks it and who can resolve it.
- Do not offer payment collection or refund actions on this screen.

## Custody Rules

The custody strip is mandatory.

Custody strip fields:

- `Current custodian`
- `Custody confidence`
- `Latest touchpoint`
- `Evidence route`

Custody display from `currentCustodyRole`:

- `station_operator`: show `Station operator`.
- `driver`: show `Driver`.
- `final_mile_courier`: show `Final-mile courier`.
- `null`: show `Custody needs review`.

Station custody context:

- `station_operator` is the only station custody role currently returned by `deliveryCustodyRoleSchema`.
- Use `currentStatus`, `latestTouchpoint.stationId`, `originStationId`, and `destinationStationId` to add context such as `Origin station custody` or `Destination station custody`.
- Do not invent `origin_station` or `destination_station` as `currentCustodyRole` values unless the shared schema adds them.
- Sender and receiver remain lifecycle parties in handoff policy, but they are not current API custody-role values in `deliveryDetailResponseSchema`.

Custody confidence rules:

- If `currentCustodyRole` is present and latest timeline has a matching handoff entry, show `Verified`.
- If `currentCustodyRole` is present but timeline is unavailable, show `Needs timeline check`.
- If `currentCustodyRole` is null, show `Needs review`.
- If terminal delivered state lacks `finalProof`, show `Proof missing`.
- If timeline contains `handoff_event` with fallback metadata, show `Fallback used` and route to custody chain.

Handoff policy reminders:

- Sender to origin station requires package ID, sender confirmation, and intake timestamp.
- Origin station to driver requires scan of package ID, driver confirmation, and dispatch timestamp.
- Driver to destination station requires arrival confirmation, receipt scan, and condition check.
- Destination station to final-mile courier requires package scan from assigned courier, courier confirmation, and assignment timestamp.
- Final-mile courier to receiver requires verified receiver OTP token, signature, or delivery photo plus timestamp.
- Assignment is not custody.
- Origin-station to driver custody transfers only when the assigned driver confirms pickup with the registered package scan code.
- Destination-station to final-mile custody transfers only when the assigned courier accepts the assignment with the registered package scan code.

Interaction rules:

- Tapping custody strip opens `/(ops)/deliveries/:deliveryId/custody`.
- The strip must not transfer custody.
- The strip must not submit evidence.
- The strip must not expose raw actor IDs.

## Role And Scope Rules

Role authorization must come from authenticated backend context.

Station operator:

- Can see station-relevant deliveries according to backend visibility.
- Can open station workflows only when station scope matches origin or destination requirement.
- Must see `missing_station_scope` if authenticated role lacks station scope required for action.
- Must not see driver-only or courier-only primary actions.

Driver:

- Can see assigned run deliveries.
- Can open driver workflow only when `assignedDriverId` matches authenticated actor or backend capability allows supervisor review.
- Must see `ASSIGNMENT_SCOPE_VIOLATION` recovery copy when the delivery is no longer assigned to them.
- Must not see station assignment or final-mile assignment controls.

Final-mile courier:

- Can see assigned doorstep deliveries.
- Can open courier workflow only when `assignedFinalMileCourierId` matches authenticated actor or backend capability allows supervisor review.
- Must see `ASSIGNMENT_SCOPE_VIOLATION` recovery copy when assignment changed.
- Must not see station intake, station assignment, or driver-run controls.

Support admin:

- Can open support and issue routes.
- Can view delivery context according to backend visibility.
- Must not get physical custody actions unless role capabilities explicitly allow them.

Ops admin:

- Can view operational detail and custody chain according to backend visibility.
- Can route into allowed workflows if capability policy allows.
- Must not bypass scan, proof, or supervisor override requirements from this screen.

Finance admin:

- Should not receive operational mutation routes from this screen.
- May see payment status only if backend visibility allows it.
- Should route to admin web for finance work when configured.

Super admin:

- Can see broad context when backend allows.
- Still must use dedicated workflow screens for any state-changing action.

## Information Architecture

The screen uses five stacked regions.

Region 1: Header and identity

- Back control.
- Tracking code.
- Current status chip.
- Payment status chip.
- Short route: origin station to destination station.
- Data freshness indicator.

Region 2: Custody strip

- Current custodian.
- Latest touchpoint role and time.
- Latest event label.
- Custody confidence.
- Link to custody chain.

Region 3: Role action panel

- One dominant safe next workflow.
- Secondary role actions.
- Disabled action explanations.
- Support and issue route.

Region 4: Delivery details

- Receiver summary.
- Package summary.
- Service details.
- Quote summary.
- Final proof summary when applicable.

Region 5: Timeline

- Latest entries from `get_delivery_timeline`.
- Entry type icon or shape.
- Occurred time.
- Role/station label.
- Evidence warning if entry indicates missing proof, fallback use, or issue state.

Sticky footer:

- Only if the current role has one clear next workflow.
- If multiple important actions exist, keep actions in panel to avoid accidental taps.
- Always keep `Refresh` reachable from header or pull gesture.

## Layout Specification

Mobile layout:

- Use a single-column scroll view.
- Header remains compact and sticky only after scrolling past the identity area.
- Custody strip sits in first viewport.
- Role action panel appears before long details.
- Timeline appears after operational details.
- Bottom safe area must be respected.

Tablet layout:

- Use two columns when width allows.
- Left column: identity, custody, role actions.
- Right column: delivery details and timeline.
- Sticky action rail is allowed only when one primary workflow exists.

Small-phone layout:

- Collapse station route into two stacked labels.
- Use two-line status rows where needed.
- Keep actions full-width.
- Keep timeline entries compact but not cryptic.

Spacing:

- Use generous top-level section spacing.
- Avoid dense card stacks.
- Group related operational facts in compact information rows.
- Keep tappable rows visually distinct from static rows.

Color:

- Use neutral operational base.
- Use one urgent color for blockers.
- Use one success color for verified custody and delivered proof.
- Use one warning color for stale, partial, or fallback states.
- Do not rely on color alone for status.

Typography:

- Tracking code gets strong monospace or tabular treatment.
- Status labels use plain language.
- Times use relative label plus exact timestamp in accessible label.
- Body copy remains short and operational.

Motion:

- Screen entry may fade in identity header and custody strip.
- Timeline entries may reveal in order after data loads.
- Refresh status may use a small progress affordance.
- Respect `prefers-reduced-motion`.
- Do not animate status changes in a way that hides the final state.

## Component Inventory

Required components:

- `OpsDeliveryDetailScreen`
- `OpsDeliveryHeader`
- `DeliveryFreshnessIndicator`
- `StatusPaymentChips`
- `CustodyStatusStrip`
- `RoleActionPanel`
- `DeliveryBlockedNotice`
- `DeliveryDetailsSummary`
- `ReceiverSummaryCard`
- `PackageSummaryCard`
- `ServiceQuoteSummary`
- `FinalProofSummary`
- `OpsTimeline`
- `TimelineEntryRow`
- `TimelinePartialNotice`
- `OpsErrorState`
- `OpsOfflineNotice`

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
- `Toast`
- `BottomSheet`
- `AlertBanner`

Do not create:

- A mutation button primitive specific to this screen.
- A raw JSON inspector for production UI.
- A map component unless the app already has a route map dependency for ops screens.
- A payment action component.
- A receiver contact editor.
- A package editor.

## Content Specification

Header copy:

- Title format: `Delivery {trackingCode}`.
- Subtitle format: `{Origin station} to {Destination station}`.
- Fresh state: `Updated just now`, `Updated {relative time}`, or `Stale since {relative time}`.

Custody copy:

- Verified: `Custody verified`.
- Needs review: `Custody needs review`.
- Timeline missing: `Timeline unavailable. Check custody chain before acting.`
- Proof missing: `Delivery marked delivered, but proof is missing.`
- Fallback used: `Fallback handoff used. Review evidence before next handoff.`

Payment copy:

- Confirmed: `Payment confirmed`.
- Pending: `Payment pending`.
- Failed: `Payment failed`.
- Blocked: `Payment must be confirmed before this workflow.`
- Unavailable: `Payment status unavailable.`

Action copy:

- `Open intake`
- `Open outbound workflow`
- `Assign driver`
- `Open driver pickup`
- `Open run`
- `Receive at destination`
- `Prepare receiver pickup`
- `Assign final-mile courier`
- `Open courier acceptance`
- `Open delivery proof`
- `Open custody chain`
- `Scan package`
- `Report issue`
- `Open support`
- `Open offline outbox`
- `Refresh`

Error copy:

- Not found title: `Delivery not found`.
- Not found body: `This delivery is unavailable or outside your access scope.`
- Not authorized title: `You cannot view this delivery`.
- Not authorized body: `Your current role does not have access to this record.`
- Session expired title: `Sign in again`.
- Session expired body: `Your session expired before this delivery could load.`
- API error title: `Delivery could not load`.
- API error body: `Try again. If the issue continues, open support.`
- Timeline error title: `Timeline could not load`.
- Timeline error body: `Delivery details are visible, but evidence history is incomplete.`

Tone:

- Direct.
- Calm.
- Operational.
- No hype.
- No blame.
- No vague success language.

## State Matrix

`loading_detail`:

- Show skeleton for header, custody strip, action panel, and first timeline rows.
- Do not show empty state while initial detail is loading.
- Screen reader announces `Loading delivery details`.

`loading_timeline`:

- Show detail content as soon as available.
- Show timeline skeleton separately.
- Screen reader announces `Loading delivery timeline`.

`ready`:

- Show detail, custody strip, role actions, details, and timeline.
- Show freshness.
- Primary action is role/status scoped.

`timeline_partial`:

- Show detail and available entries.
- Show alert: `Timeline is incomplete. Review custody chain before acting.`
- Keep safe route actions if backend capabilities allow.

`custody_warning`:

- Show custody strip warning state.
- Promote custody chain and issue route.
- Do not block all viewing.
- Disable handoff routes if the warning indicates proof or state conflict.

`payment_blocked`:

- Show payment warning in custody strip and action panel.
- Disable operations that require paid delivery.
- Keep support and issue route.

`issue_blocked`:

- Show active issue state.
- Promote issue route or support route.
- Keep custody chain visible.
- Disable workflows that backend cannot safely continue.

`offline_cached`:

- Show cached detail if available.
- Show `Offline. Showing saved delivery data.`
- Disable mutation workflow routes that need network unless they support offline queueing.
- Keep offline outbox route visible.

`stale_cache`:

- Show cached detail with stale warning.
- Show exact last updated time.
- Require refresh before opening scan or handoff workflow unless workflow explicitly supports offline verification.

`not_found`:

- Show not found error.
- Offer back, refresh, and support.
- Do not show cached data unless clearly marked as previous saved data.

`not_authorized`:

- Show access error.
- Offer back and sign in again if session state is uncertain.
- Do not reveal delivery fields.

`session_expired`:

- Show sign-in recovery.
- Preserve intended route after sign-in.
- Do not show sensitive cached details after session expiry unless local security policy permits it.

`api_error`:

- Show retry.
- Show support route.
- If cached delivery exists, allow viewing with stale warning.

## Error Code Mapping

Map backend errors into stable screen states.

`FORBIDDEN`:

- State: `not_authorized`.
- Copy: `You cannot view this delivery.`
- Actions: back, sign in again, support.

`FORBIDDEN_ROLE`:

- State: `not_authorized`.
- Copy: `Your role cannot view this delivery.`
- Actions: back, support.

`NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery not found.`
- Actions: back, refresh, support.

`DELIVERY_NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery record not found.`
- Actions: back, refresh, support.

`ASSIGNMENT_SCOPE_VIOLATION`:

- State: `not_authorized` for the workflow action, not necessarily for the whole delivery.
- Copy: `This job is not assigned to you.`
- Actions: open support, refresh, back to role queue.

`PACKAGE_SCAN_MISMATCH`:

- State: `custody_warning`.
- Copy: `This scan code does not match the delivery.`
- Actions: open custody chain, report issue.

`DELIVERY_NOT_PAID`:

- State: `payment_blocked`.
- Copy: `Payment must be confirmed before this action.`
- Actions: support, refresh.

`PAYMENT_REQUIRED`:

- State: `payment_blocked`.
- Copy: `Payment must be confirmed before this workflow.`
- Actions: support, refresh.

`HANDOFF_PROOF_REQUIRED`:

- State: `custody_warning`.
- Copy: `Required handoff proof is missing.`
- Actions: open custody chain, report issue.

`CONFLICTING_HANDOFF_STATE`:

- State: `custody_warning`.
- Copy: `The handoff state conflicts with the current record.`
- Actions: open custody chain, report issue, support.

`RATE_LIMITED`:

- State: `api_error`.
- Copy: `Too many requests. Try again shortly.`
- Actions: retry after delay, support.

`VALIDATION_ERROR`:

- State: `api_error`.
- Copy: `Some required information is missing or invalid.`
- Actions: back, support.

## Role Action Decision Table

The decision table must be implemented as testable pure logic outside the component render body.

Inputs:

- `role`
- `stationId`
- `userId`
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `currentCustodyRole`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `latestEvent`
- `latestTouchpoint`
- `hasTimeline`
- `isOffline`
- `isStale`
- `capabilities`

Outputs:

- `primaryAction`
- `secondaryActions`
- `disabledActions`
- `blockedReason`
- `riskLevel`

Rules:

- If `isStale` is true, workflows that mutate physical custody must be disabled unless the target workflow is built for offline evidence queueing.
- If `isOffline` is true, only offline-capable routes and read routes remain active.
- If `paymentStatus` does not satisfy operational payment policy, transport and final-mile workflows are disabled.
- If `role` is `driver` and `assignedDriverId` does not match authenticated user, driver workflow is disabled.
- If `role` is `final_mile_courier` and `assignedFinalMileCourierId` does not match authenticated user, courier workflow is disabled.
- If `role` is `station_operator`, station workflows require station scope matching the current station requirement.
- If `currentStatus` is terminal, mutation workflows are disabled.
- If `currentCustodyRole` is null, custody chain and issue route are promoted.
- If `finalProof` is missing on delivered status, issue route is promoted.

## Timeline Specification

Timeline ordering:

- Sort entries by `occurredAt` descending for mobile detail.
- Offer `View older events` if pagination is later introduced.
- Do not reorder entries client-side beyond timestamp order unless backend provides a canonical order field.

Entry display:

- `delivery_event`: operational status event.
- `handoff_event`: custody/evidence event.
- `issue_event`: exception or review event.

Entry row fields:

- Label.
- Relative time.
- Exact timestamp in accessible label.
- Actor role if available.
- Station label if available.
- Entry type visual marker.
- Evidence warning marker if metadata indicates fallback, missing proof, or conflict.

Entry restrictions:

- Do not expose raw `actorId`.
- Do not print raw `metadata`.
- Do not use timeline labels as trusted action authorization.
- Do not collapse issue events into normal status events.

Empty timeline:

- Show `No timeline entries available yet.`
- Keep custody strip visible.
- Promote refresh if delivery is active.
- Promote support if status requires evidence.

Partial timeline:

- Show available entries.
- Show warning before entries.
- Keep custody chain route visible.

## Delivery Details Specification

Receiver summary:

- Show receiver name.
- Show masked or full receiver phone based on role capability and workflow need.
- Show address text only when doorstep delivery or station pickup support requires it.
- Do not allow editing.

Package summary:

- Show description.
- Show weight.
- Show size tier.
- Show fragile flag.
- Show declared value in GHS if role visibility allows it.
- Do not allow editing.

Service summary:

- Show service type.
- Show doorstep requested.
- Show doorstep distance when present.
- Show origin and destination station.
- Show created time.

Quote summary:

- Show quote total in GHS.
- Show payment status next to quote.
- Do not show processor details.
- Do not offer payment action.

Proof summary:

- Show only when `finalProof` exists or delivery is delivered.
- Show proof type, received by name, and captured time.
- Do not show raw proof reference.
- Link to custody chain when role can review evidence.

## Privacy And Security

Security rules:

- Backend authorization is required before rendering delivery fields.
- Cached data must be protected according to app session policy.
- Sensitive values must not appear in crash logs or analytics.
- Raw IDs must not be used as user-facing labels.
- Receiver phone visibility must be role-scoped.
- Address visibility must be purpose-scoped.
- Payment and proof references must remain hidden.

Privacy defaults:

- Show receiver name for operational context.
- Mask receiver phone unless direct contact is required for the role flow.
- Show package content description only as entered for operations.
- Avoid sender details on staff mobile detail unless a specific workflow requires them.
- Avoid storing expanded sensitive detail in local UI state longer than necessary.

Audit rules:

- Opening this screen may be logged as a read event if backend policy requires it.
- Opening custody chain, scan, issue, or proof route must be logged by those routes.
- This screen must not record custody events.

## Offline And Freshness

Freshness states:

- `fresh`: data loaded from network and timestamp is current.
- `cached`: data loaded from local storage while offline.
- `stale`: data older than configured freshness threshold.
- `partial`: detail loaded but timeline missing or incomplete.

UI treatment:

- Fresh data uses normal header indicator.
- Cached data uses persistent offline banner.
- Stale data uses warning banner and exact age.
- Partial data uses timeline warning and custody caution.

Offline action policy:

- Read routes may remain available.
- Offline outbox is always available when queued actions exist.
- Scan, proof, and custody routes open only if those routes implement offline evidence queueing and make queued state explicit.
- Payment-blocked flows require network refresh.
- Support route may open cached support guidance when network is unavailable.

Recovery:

- Pull to refresh.
- Retry button in error blocks.
- Background refresh on app foreground.
- Revalidate before opening state-changing route when stale.

## Interaction Rules

Header:

- Back returns to previous route.
- Refresh reloads detail and timeline.
- Tapping tracking code copies it only if copy affordance is explicit.

Custody strip:

- Tap opens custody chain.
- Long press does nothing special.
- Warning state includes `Review custody chain` action.

Role action panel:

- One primary action at most.
- Secondary actions are clearly separated.
- Disabled actions remain visible only when the blocked reason helps the staff member.
- Hide actions that are irrelevant and not educational.

Timeline:

- Tap entry opens details only if a future route exists.
- Otherwise entries are static.
- Issue entry tap can route to support issue detail when available.

Receiver phone:

- Tap-to-call is allowed only when role and workflow permit direct contact.
- When tap-to-call exists, require clear label and confirmation if local policy requires it.

Refresh:

- Refresh must update both detail and timeline.
- If one succeeds and the other fails, show partial state.

## Accessibility Requirements

Screen reader:

- The screen title announces tracking code and current status.
- Freshness state is announced as status text.
- Timeline loading, refresh success, refresh failure, and partial timeline use status messages.
- Custody warning is announced as an alert.
- Disabled actions include reason in accessible hint.
- Timeline entries expose entry type, label, role, station, and time.

Focus:

- Initial focus stays on screen title after navigation.
- Error states move focus to error title.
- Refresh status does not steal focus unless it blocks the screen.
- Bottom action focus order follows visual order.

Touch:

- Interactive targets meet or exceed WCAG 2.2 target size guidance.
- Rows with disclosure affordance have full-row hit area.
- Destructive or high-risk actions are not present on this screen.

Visual:

- Do not rely on color alone.
- Status chips include text.
- Warning banners include icon and label.
- Text remains readable at large font sizes.
- Timeline remains usable with 200 percent text scaling where platform supports it.

Motion:

- Respect reduced motion.
- Do not animate critical status text continuously.
- Loading skeletons must not shimmer if reduced motion is enabled.

Localization:

- Avoid idioms.
- Keep button copy short.
- Use formatted dates, times, currency, and phone display from localization utilities.
- Do not concatenate translated strings in a way that breaks grammar.

## Analytics And Observability

Required analytics events:

- `ops_delivery_detail_viewed`
- `ops_delivery_detail_refresh_started`
- `ops_delivery_detail_refresh_succeeded`
- `ops_delivery_detail_refresh_failed`
- `ops_delivery_detail_primary_action_pressed`
- `ops_delivery_detail_secondary_action_pressed`
- `ops_delivery_detail_custody_chain_opened`
- `ops_delivery_detail_issue_opened`
- `ops_delivery_detail_timeline_partial`
- `ops_delivery_detail_offline_viewed`
- `ops_delivery_detail_stale_viewed`
- `ops_delivery_detail_not_authorized`

Event fields:

- `deliveryId`
- `trackingCode`
- `role`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `originStationId`
- `destinationStationId`
- `actionId`
- `isOffline`
- `isStale`
- `timelineEntryCount`
- `errorCode`

Do not send:

- Receiver phone.
- Receiver address.
- Package description.
- Proof reference.
- Raw timeline metadata.
- Raw actor IDs.

Operational logs:

- Log API latency for detail and timeline separately.
- Log partial state frequency.
- Log action policy mismatches where UI action is disabled due to backend policy.
- Log stale cache age buckets, not exact private data.

## Performance Requirements

Budget:

- First detail render target: under 1.5 seconds on healthy mobile network.
- Timeline may load after detail.
- Header and custody skeleton render immediately.
- Avoid blocking detail render on timeline if detail is available.

Data loading:

- Request detail and timeline concurrently when possible.
- If auth refresh is required, refresh token before both requests.
- Cache detail and timeline separately with freshness metadata.
- De-duplicate concurrent refresh calls.

Rendering:

- Virtualize timeline only if entry count can become large.
- Memoize decision-table output only when it measurably prevents expensive recomputation.
- Avoid heavy map or media loading on this screen.
- Avoid large images.

Failure isolation:

- Timeline failure must not fail the whole detail.
- Role action policy failure must show safe blocked state.
- Analytics failure must not block UI.

## Test IDs

Primary:

- `screen-ops-delivery-detail`

Header:

- `ops-delivery-detail-back`
- `ops-delivery-detail-title`
- `ops-delivery-detail-tracking-code`
- `ops-delivery-detail-status-chip`
- `ops-delivery-detail-payment-chip`
- `ops-delivery-detail-route`
- `ops-delivery-detail-freshness`
- `ops-delivery-detail-refresh`

Custody:

- `ops-delivery-detail-custody-strip`
- `ops-delivery-detail-current-custodian`
- `ops-delivery-detail-custody-confidence`
- `ops-delivery-detail-latest-touchpoint`
- `ops-delivery-detail-custody-chain-link`
- `ops-delivery-detail-custody-warning`

Actions:

- `ops-delivery-detail-action-panel`
- `ops-delivery-detail-primary-action`
- `ops-delivery-detail-secondary-action-scan`
- `ops-delivery-detail-secondary-action-issue`
- `ops-delivery-detail-secondary-action-support`
- `ops-delivery-detail-secondary-action-offline-outbox`
- `ops-delivery-detail-disabled-action`
- `ops-delivery-detail-blocked-reason`

Details:

- `ops-delivery-detail-receiver-summary`
- `ops-delivery-detail-package-summary`
- `ops-delivery-detail-service-summary`
- `ops-delivery-detail-quote-summary`
- `ops-delivery-detail-proof-summary`

Timeline:

- `ops-delivery-detail-timeline`
- `ops-delivery-detail-timeline-loading`
- `ops-delivery-detail-timeline-partial`
- `ops-delivery-detail-timeline-empty`
- `ops-delivery-detail-timeline-entry`
- `ops-delivery-detail-timeline-entry-type`
- `ops-delivery-detail-timeline-entry-time`

States:

- `ops-delivery-detail-loading`
- `ops-delivery-detail-offline`
- `ops-delivery-detail-stale`
- `ops-delivery-detail-not-found`
- `ops-delivery-detail-not-authorized`
- `ops-delivery-detail-session-expired`
- `ops-delivery-detail-api-error`

## API Integration Notes

Request flow:

- Read route `deliveryId`.
- Validate `deliveryId` shape before API request if shared schema is available on client.
- Load authenticated principal.
- Start `get_delivery` and `get_delivery_timeline` concurrently when online.
- Render detail as soon as `get_delivery` succeeds.
- Render timeline when `get_delivery_timeline` succeeds.
- If detail fails with authorization or not found, suppress timeline UI.
- If timeline fails while detail succeeds, show partial state.

Caching:

- Cache detail response by `deliveryId`.
- Cache timeline response by `deliveryId`.
- Store `loadedAt`.
- Store `source` as `network` or `cache`.
- Clear sensitive cached content on sign-out.
- Revalidate cached content when app foregrounds.

Mutation routing:

- Scan route receives `deliveryId` and action intent.
- Custody chain route receives `deliveryId`.
- Issue route receives `deliveryId`.
- Role workflow route receives `deliveryId` and status context.
- Detail screen must not pass raw mutable delivery object into route state if route can fetch its own current data.

## QA Acceptance Criteria

Functional:

- Loading detail state renders before data.
- Detail and timeline load successfully for an authorized user.
- Detail renders when timeline fails.
- Timeline renders in descending order.
- Not found state does not reveal cached sensitive detail unless marked as previous saved data.
- Not authorized state does not reveal delivery fields.
- Role action panel shows one primary action at most.
- Disabled action includes a human-readable reason.
- Custody strip routes to custody chain.
- Issue route opens with delivery context.
- Refresh updates detail and timeline.
- Offline cached state shows exact stale/fresh status.

Backend alignment:

- `get_delivery` is called for detail.
- `get_delivery_timeline` is called for timeline.
- Response parsing uses `deliveryDetailResponseSchema`.
- Timeline parsing uses `deliveryTimelineResponseSchema`.
- Timeline entries use `deliveryTimelineEntrySchema`.
- Role and capability checks use shared auth/capability policy.
- `currentCustodyRole`, `currentCustodyActorId`, `assignedDriverId`, `assignedFinalMileCourierId`, `latestEvent`, `latestTouchpoint`, and `finalProof` are handled.

Security:

- Raw internal actor IDs do not appear in normal UI.
- Receiver phone is masked unless role/workflow requires visibility.
- Receiver address is purpose-scoped.
- Proof reference is not exposed.
- Analytics omit sensitive data.

Accessibility:

- Screen reader announces loading, refresh, partial timeline, and error states.
- All action targets are large enough.
- Disabled actions expose reason.
- Timeline entries are navigable and meaningful.
- Large text does not hide primary action.
- Reduced motion is respected.

Resilience:

- Stale cache is never presented as fresh.
- Timeline failure does not blank the screen.
- Rate limit state offers retry after delay.
- Session expiry preserves intended route.
- Pull-to-refresh cannot fire duplicate concurrent requests.

## Visual Quality Checklist

Before handoff, confirm:

- The screen has one clear operational anchor above the fold.
- Custody, status, payment, and freshness are visible without scrolling.
- The primary action is role-accurate and status-accurate.
- Secondary actions do not compete with the primary action.
- Timeline is readable under field pressure.
- Warning states are calm but unmistakable.
- Disabled actions explain the blocker.
- The screen is useful when timeline data is missing.
- The screen remains legible on a small phone.
- The screen does not look like an admin database view.

## Implementation Guardrails For Claude Code

Build this as a documentation-following mobile screen only when frontend work begins.

Implementation rules:

- Keep data fetching in a route-level hook or screen controller, not scattered across child components.
- Keep role action decision logic in a pure function with unit tests.
- Keep display formatters in shared UI utilities.
- Keep sensitive-data masking centralized.
- Keep timeline rendering separate from delivery detail rendering.
- Keep route actions as navigation events only.
- Keep mutation calls out of `OpsDeliveryDetail`.

Suggested file ownership:

- Screen route file owns navigation and state wiring.
- Hook owns API calls, caching, and refresh.
- Selector owns role action decision.
- Components own rendering only.
- Test file covers decision table, state rendering, and error mapping.

Required implementation tests:

- Authorized station operator can view and open station workflow route.
- Driver cannot open workflow for delivery assigned to another driver.
- Courier cannot open workflow for delivery assigned to another courier.
- Timeline failure shows partial state.
- Payment-blocked delivery disables operational workflow.
- Custody null promotes custody warning and issue route.
- Delivered without proof promotes proof missing warning.
- Offline stale cache disables unsafe routes.
- Not authorized hides delivery fields.
- Analytics omits sensitive fields.

## Final Implementation Decisions

This screen must use the project-native design-system wrappers only. It must not introduce screen-local wrapper families for buttons, cards, sheets, status chips, navigation bars, or empty states.

Station display names must resolve through the shared typed station-label adapter backed by the role-allowed station map. If a display name cannot be resolved safely, the UI must show the station ID with a `Station ID` label.

Freshness rules are fixed for v1. Active custody and action surfaces are stale after 2 minutes; read-only delivery detail content is stale after 10 minutes. Stale state must show a visible banner with last refresh time and a retry action.

The shared entry route remains `/(ops)/deliveries/:deliveryId`. Role-specific actions must route through the explicit role route map defined by the role-routing spec, with no screen-local route guessing.

## Final Handoff Notes

This screen must behave like an operational truth surface, not a control panel. Its authority is to show the verified record and route staff to the right workflow. Custody, scan, proof, assignment, payment, and issue mutations belong in their dedicated screens where each workflow can enforce its own evidence rules.

The strongest implementation will feel fast because the first viewport is decisive: tracking code, lifecycle status, payment, custody, latest verified event, freshness, and one safe next route.
