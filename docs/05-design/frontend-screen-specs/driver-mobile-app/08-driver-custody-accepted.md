# DriverCustodyAccepted Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverCustodyAccepted` |
| Route | `/(ops)/driver/runs/:deliveryId/custody-accepted` |
| Primary test ID | `screen-driver-custody-accepted` |
| Surface | Driver mobile app |
| Backend coverage | `confirm_pickup` response through `deliveryLifecycleResponseSchema`, plus post-success `get_delivery` and `get_delivery_timeline` refresh |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | `confirm_pickup` for the source mutation |
| Parent screen | `DriverOriginPickupScan` |
| Primary input | Server-confirmed `confirm_pickup` response |
| Supporting reads | `get_delivery`, `get_delivery_timeline`, local outbox, local confirmation receipt |
| Related routes | `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/runs/:deliveryId/in-transit`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Server-confirmed custody receipt for a single delivery |

## Product Job
`DriverCustodyAccepted` confirms that the origin-station-to-driver handoff has been recorded by the backend and that the driver is now the accountable custodian for the package.

The screen answers:

- `Did pickup confirmation succeed on the server?`
- `What event proves custody moved to me?`
- `What package and route am I now responsible for?`
- `What should I do next before leaving the origin station?`
- `What if the app is offline after pickup?`
- `How do I open the custody chain if there is a dispute?`

## Product Standard
This screen must feel like an operational receipt, not a decorative success page. It is the driver-facing proof that the package has left the origin station under the driver's custody.

The driver should be able to:

- See an unmistakable server-confirmed success state.
- See the delivery, event, timestamp, origin station, and destination station.
- Understand their accountability after pickup.
- Continue to route workflow.
- Open custody chain.
- Report a handoff issue immediately.
- Recover if success context is missing or stale.
- Distinguish confirmed custody from pending offline sync.

The screen must never:

- Display success from a local-only queued action.
- Hide that the driver is now accountable.
- Reveal the raw package scan code.
- Treat station dispatch readiness as pickup confirmation.
- Treat driver run acceptance as custody.
- Require a map to continue.
- Lose the event ID returned by `confirm_pickup`.
- Show a celebratory pattern that weakens the seriousness of custody.

## Audience
Primary audience:

- Assigned driver who just completed the origin pickup scan.

Secondary audience:

- Station operator waiting for proof that the driver can leave with the package.
- Support agent reviewing event details after a handoff dispute.
- QA validating custody transfer and accessibility.
- Claude Code implementing the confirmation screen and tests.

## Context Of Use
The driver may see this screen:

- Immediately after online `confirm_pickup` success.
- After queued pickup sync succeeds.
- After reopening the app from a push notification or deep link.
- While still inside the origin station.
- In low signal after the server response was already received.
- During a dispute where station staff asks for proof.

The screen must support both fast continuation and evidence review. Drivers should not have to search through a timeline to prove pickup succeeded.

## Design Brief
User and job:

- A driver needs clear proof that custody moved to them and a safe next action.

Context:

- Operational success with liability implications.

Entry point:

- `DriverOriginPickupScan` success, offline outbox sync success, run detail status, or custody chain deep link.

Success state:

- Delivery status is `dispatched_from_origin`, event type is `driver_pickup_confirmed`, and handoff chain includes `origin_station_to_driver`.

Primary action:

- `Continue to route`.

Navigation model:

- Receipt-style confirmation screen that routes forward to transport workflow.

Density level:

- Medium: clear success header plus compact evidence receipt.

Visual thesis:

- `Proof receipt`: strong confirmed custody banner, event receipt card, route handoff spine, and direct next action.

Restraint rule:

- Do not add scanner, route map, destination receipt, earnings, or broad history on this screen.

## External Research Used
Only directly relevant sources were used:

- [Onfleet barcode scanning API](https://docs.onfleet.com/reference/barcode-scanning): supports barcode capture at pickup and dropoff as delivery evidence.
- [Onfleet barcode scanning courier guide](https://support.onfleet.com/hc/en-us/articles/37852822362132-Barcode-Scanning-Couriers-and-Clients): supports required barcode scanning and task history visibility for delivery proof.
- [Apple Human Interface Guidelines: Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback): supports clear status feedback for important completed actions while avoiding unnecessary confirmation noise.
- [Material Web progress indicators](https://material-web.dev/components/progress/): supports progress feedback for loading and submitting states with accessible labels.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local state visibility, queued sync, and conflict handling after reconnect.
- [WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): supports accessible success, progress, and error status announcements.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/07-driver-origin-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/11-station-driver-pickup-scan.md`
- `services/api/src/handoffs.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Source mutation:

- Operation key: `confirm_pickup`.
- HTTP route: `POST /v1/deliveries/:id/confirm-pickup`.
- Response schema: `deliveryLifecycleResponseSchema`.

Response fields:

```json
{
  "eventId": "EVT-DEL-...",
  "deliveryId": "DEL-...",
  "status": "dispatched_from_origin",
  "paymentStatus": "paid",
  "occurredAt": "2026-05-19T00:00:00.000Z"
}
```

Expected success values:

- `eventId` matches lifecycle event ID format.
- `deliveryId` matches route delivery ID.
- `status` is `dispatched_from_origin`.
- `occurredAt` is server time.
- `paymentStatus` reflects current delivery payment state.

Post-success refresh:

- Call `get_delivery` to fetch current custody fields when available.
- Call `get_delivery_timeline` to show `driver_pickup_confirmed`.
- Open custody chain route to show `origin_station_to_driver` when deeper evidence is needed.

Backend fact:

- The mutation response does not include raw package scan code.
- The mutation response does not include handoff proof details.
- Handoff proof is recorded server-side through `createHandoffEvent`.
- The confirmation screen must not invent proof fields that are not returned.

## Data Dependencies
Required:

- Route `deliveryId`.
- Server `confirm_pickup` response, or a refetched delivery showing confirmed status.
- Current authenticated driver actor ID.
- Delivery detail from cache or network.
- Outbox state for the delivery.

Recommended:

- Timeline entries.
- Origin station display name.
- Destination station display name.
- Tracking code.
- Package summary from delivery detail.
- Last sync timestamp.

Optional:

- Handoff event summary if exposed later.
- Station contact.
- Support issue link.
- Route readiness state.

Forbidden:

- Raw package scan code.
- Full private customer contact data.
- Supervisor credential secret.
- Camera frame data.

## Route Parameters
Route:

- `/(ops)/driver/runs/:deliveryId/custody-accepted`

Required:

- `deliveryId`

Optional navigation state:

- `eventId`
- `status`
- `paymentStatus`
- `occurredAt`
- `source` as `online_confirm_pickup` or `outbox_sync`

No navigation state:

- Refetch delivery detail and timeline.
- If status is `dispatched_from_origin` and current custodian is driver when known, show confirmed state.
- If status is still `assigned_to_driver`, route back to pickup scan or show pending outbox state.
- If status moved beyond `dispatched_from_origin`, show `already_moved_forward` state with custody chain access.

## Information Architecture
Top level:

- Confirmed custody banner.
- Delivery identity receipt.
- Event proof card.
- Handoff spine.
- Driver responsibility panel.
- Next action panel.
- Recovery and support actions.

Screen order:

- Header: `Custody accepted`
- Subheader: `Server-confirmed pickup`
- Delivery identity strip.
- Event receipt card.
- Origin station -> driver handoff spine.
- Responsibility checklist.
- Primary CTA.
- Secondary evidence actions.

## Visual Direction
The screen should feel like a bank transfer receipt for custody: clear, confident, compact, and auditable.

Art direction:

- Clean high-contrast receipt layout.
- Success color is controlled and serious, not playful.
- Use a stamped confirmation motif.
- Use route spine from origin station to driver.
- Use event ID as receipt anchor.
- Use a bottom-anchored next action.

Color:

- Confirmed state: deep green or dark teal semantic success.
- Receipt surface: warm neutral or graphite-tinted card.
- Evidence metadata: low-emphasis neutral.
- Warnings: amber for pending evidence refresh.
- Errors: red for missing confirmation or conflict.

Typography:

- Success title large and bold.
- Event ID uses mono or tabular figures.
- Timestamp uses compact readable format.
- Responsibility copy is short and firm.

Motion:

- On entry from scanner, use one decisive confirmation transition.
- Receipt card can settle upward in one motion.
- No confetti.
- No looping celebration.
- Reduced motion uses immediate content state.

## Layout
Mobile portrait:

- Top safe area: back, title, optional sync badge.
- Hero receipt: 28 to 34 percent of height.
- Evidence card below hero.
- Checklist and next action in bottom section.
- Sticky primary CTA.

Small screen:

- Keep title, event ID, and primary CTA visible.
- Collapse route spine details behind `Show route details`.
- Move support to overflow.

Tablet:

- Use centered receipt column with right evidence rail.
- Keep primary CTA fixed at bottom of receipt column.

Offline after success:

- Show local receipt with `Last confirmed with server` timestamp.
- Show sync freshness badge.
- Do not downgrade confirmed custody if server success was already recorded locally.

## Component Inventory
Required components:

- `DriverCustodyAcceptedScreen`
- `ConfirmedCustodyHero`
- `DeliveryReceiptCard`
- `LifecycleEventCard`
- `OriginToDriverSpine`
- `DriverResponsibilityPanel`
- `PickupEvidenceRefreshBanner`
- `NextRouteActionPanel`
- `CustodyReceiptActions`
- `PendingSyncNotSuccessPanel`
- `ReceiptUnavailablePanel`
- `CustodySupportFooter`

Shared component reuse:

- Reuse delivery identity strip from driver detail where possible.
- Reuse custody chain route link from shared custody components.
- Reuse offline outbox status card.
- Reuse status message and alert primitives.

Do not create:

- Another scanner.
- Another timeline viewer.
- A full map.
- Station approval controls.
- Destination receipt controls.

## Primary Flow
1. `DriverOriginPickupScan` receives server success.
2. App navigates to `DriverCustodyAccepted` with lifecycle response.
3. Screen validates route delivery ID against response delivery ID.
4. Screen stores local confirmation receipt.
5. Screen invalidates stale delivery and timeline caches.
6. Screen renders confirmed custody hero.
7. Screen refetches delivery detail and timeline in background.
8. Screen shows event ID and occurred time immediately.
9. Screen updates evidence card when detail and timeline refresh.
10. Driver taps `Continue to route`.
11. App navigates to `DriverRoute`.

## Server-Confirmed State
Display when:

- Navigation response exists and matches route delivery ID.
- Response status is `dispatched_from_origin`.
- Or refetched delivery confirms equivalent status and driver custody.

Required visible content:

- `Custody accepted`
- `Server-confirmed pickup`
- Delivery identity.
- Origin station.
- Destination station.
- Event ID.
- Occurred time.
- Driver responsibility message.
- Next action.

Primary copy:

- Title: `Custody accepted`
- Body: `You are now responsible for this package from origin station to destination station.`
- Receipt label: `Pickup event`
- CTA: `Continue to route`

Secondary actions:

- `View custody chain`
- `Report handoff issue`
- `Back to run detail`

## Pending Sync State
Display when:

- The pickup scan is queued in local outbox.
- No server success has been received.
- App navigates here from an outbox pending state.

Required behavior:

- Do not show confirmed success.
- Show pending state clearly.
- Give driver outbox visibility.
- Instruct driver not to treat app state as final proof.

Copy:

- Title: `Pickup waiting to sync`
- Body: `The pickup request is saved on this device, but custody is not final in the system until sync succeeds.`
- Primary: `Open offline outbox`
- Secondary: `Retry sync`

Policy:

- If local operations policy allowed controlled release, show `Exception release pending sync`.
- If default policy applies, show `Keep package at origin station until sync succeeds.`

## Evidence Refresh State
The screen should not delay the success hero while refetching detail, but it must show evidence freshness.

States:

- `receipt_ready`: lifecycle response is available.
- `detail_refreshing`: delivery detail is refreshing.
- `timeline_refreshing`: timeline is refreshing.
- `evidence_complete`: detail and timeline confirm pickup.
- `evidence_partial`: lifecycle response confirms pickup but timeline is not yet refreshed.
- `evidence_conflict`: refetched detail conflicts with receipt.

Copy:

- Partial: `Pickup confirmed. Refreshing custody chain...`
- Complete: `Custody chain updated.`
- Conflict: `Pickup receipt and latest delivery state do not match. Contact support before continuing.`

Conflict behavior:

- Lock `Continue to route`.
- Open custody chain or support.
- Preserve local receipt.
- Send diagnostics without raw scan code.

## Responsibility Panel
Purpose:

- Make accountability explicit without overloading the driver.

Content:

- `You are the current custodian.`
- `Keep the package sealed and with you until destination handoff.`
- `Destination station must scan the package before custody moves again.`
- `Report damage, loss, delay, or route risk immediately.`

Optional checklist:

- `Package in hand`
- `Station release confirmed`
- `Route next`

Checklist rules:

- `Package in hand` can be driver-confirmed local checklist.
- `Station release confirmed` must derive from server success.
- `Route next` is a navigation aid, not backend state.

## Event Receipt Card
Fields:

- Event label: `driver_pickup_confirmed`
- Event ID.
- Delivery ID or tracking code.
- Occurred time.
- Status: `dispatched_from_origin`
- Payment status.
- Origin station.
- Driver actor label if safe.

Formatting:

- Event ID can be copied only through secure copy control if product permits.
- Delivery ID should be shortened when tracking code is available.
- Timestamp should show local time and server time indicator.

Redaction:

- Do not show package scan code.
- Do not show supervisor override details unless backend exposes safe summary.
- Do not show customer phone.

## Handoff Spine
Display:

- From: Origin station.
- To: Assigned driver.
- Proof: Package scan verified.
- Time: Server occurred time.
- Next: Destination station receipt.

States:

- `confirmed`: strong success line.
- `refreshing`: skeleton for custody chain metadata.
- `pending`: disabled line with outbox badge.
- `conflict`: red boundary and support CTA.

Copy:

- `Origin station -> Driver`
- `Package scan verified by assigned driver account.`
- `Next custody move happens at destination station receipt.`

## Navigation
Primary:

- `Continue to route` -> `/(ops)/driver/runs/:deliveryId/route`

Secondary:

- `View custody chain` -> `/(ops)/deliveries/:deliveryId/custody`
- `Report handoff issue` -> `/(ops)/driver/support`
- `Back to run detail` -> `/(ops)/driver/runs/:deliveryId`
- `Open offline outbox` -> `/(ops)/offline-outbox`

Back behavior:

- Back should not reopen scanner as active after confirmed success.
- Back from confirmed screen returns to run detail with confirmed status.
- If entered from outbox sync success, back returns to outbox or run detail based on source.
- If evidence conflict exists, back shows confirmation prompt: `Leave receipt review?`

Deep link behavior:

- If status is confirmed, show receipt.
- If status is pending, show pending sync state.
- If status is older than pickup, route to pickup scan.
- If status moved forward, show latest custody state and offer route or custody chain.

## State Model
Required states:

- `initializing`
- `receipt_from_navigation`
- `receipt_from_cache`
- `loading_delivery`
- `loading_timeline`
- `server_confirmed`
- `evidence_partial`
- `evidence_complete`
- `pending_sync`
- `pending_exception_release`
- `evidence_conflict`
- `already_moved_forward`
- `not_confirmed`
- `not_found`
- `scope_denied`
- `session_expired`
- `offline_confirmed_cached`
- `api_error`

State transitions:

- `receipt_from_navigation` -> `server_confirmed` when response status is valid.
- `server_confirmed` -> `evidence_partial` while refreshing detail.
- `evidence_partial` -> `evidence_complete` when detail and timeline agree.
- `evidence_partial` -> `evidence_conflict` when detail disagrees.
- `receipt_from_cache` -> `offline_confirmed_cached` when server success was previously stored.
- `pending_sync` -> `server_confirmed` when outbox sync succeeds.
- `pending_sync` -> `evidence_conflict` when outbox sync fails due to state conflict.
- `not_confirmed` -> pickup scan route when driver can still scan.

## Error Handling
Missing response:

- Title: `Checking pickup status`
- Body: `We need to refresh this delivery before showing the custody receipt.`
- Primary: `Refresh`
- Secondary: `Back to run detail`

Response delivery mismatch:

- Title: `Receipt mismatch`
- Body: `This pickup receipt does not match the delivery route. Do not continue until support reviews it.`
- Primary: `Contact support`

Status not confirmed:

- Title: `Pickup not confirmed`
- Body: `This delivery is not recorded as dispatched from origin. Scan the package before leaving the station.`
- Primary: `Open pickup scan`

Evidence conflict:

- Title: `Custody state needs review`
- Body: `The receipt and latest delivery state do not agree. Keep the package with station staff or contact operations before moving.`
- Primary: `Contact support`
- Secondary: `View custody chain`

Network unavailable:

- If confirmed receipt exists locally, show cached confirmed receipt with freshness badge.
- If no confirmed receipt exists, show `Delivery unavailable offline`.

Timeline unavailable:

- Show receipt.
- Show `Custody chain will refresh when network returns.`
- Keep `Continue to route` enabled only if lifecycle receipt is confirmed.

## Copy System
Confirmed hero:

- `Custody accepted`
- `Server-confirmed pickup`
- `You are now responsible for this package.`

Receipt:

- `Pickup event`
- `Recorded at`
- `Status after pickup`
- `Payment status`

Handoff:

- `Origin station -> Driver`
- `Package scan verified.`
- `Next handoff: destination station receipt.`

Responsibility:

- `Keep the package secure until the destination station confirms receipt.`
- `Report delay, damage, route change, or package concern before continuing.`

Pending:

- `Pickup waiting to sync`
- `This is not final custody proof yet.`

Conflict:

- `Custody state needs review`
- `Do not continue route movement until support reviews this delivery.`

## Accessibility
Screen reader:

- Announce `Custody accepted` as an assertive status when arriving from scanner success.
- Use `role=status` for non-blocking evidence refresh messages.
- Use `role=alert` for evidence conflict.
- Include event receipt fields with clear labels.
- Do not announce raw scan code.

Focus:

- On confirmed entry, focus `Custody accepted`.
- On pending entry, focus `Pickup waiting to sync`.
- On evidence conflict, focus conflict title.
- On refresh error, focus recovery panel title.

Touch targets:

- Primary CTA at least 44 by 44.
- Secondary evidence actions at least 44 by 44.
- Copy event ID control, if present, at least 44 by 44.

Reduced motion:

- Remove receipt entrance animation.
- Keep status visible immediately.

Color:

- Success must include text and icon, not color only.
- Pending must include text and icon.
- Conflict must include text and icon.

## Privacy And Security
Rules:

- Never display raw package scan code.
- Never write scan code to analytics.
- Never include scan code in support route params.
- Do not expose supervisor override details unless the backend returns a safe summary.
- Store local receipt securely.
- Redact private addresses unless route context requires them later.
- Keep event ID visible because it is operational proof, but avoid copying it into public share targets.

Local receipt storage:

- Store `eventId`.
- Store `deliveryId`.
- Store `status`.
- Store `paymentStatus`.
- Store `occurredAt`.
- Store sync freshness.
- Do not store scan code.

## Analytics
Events:

- `driver_custody_accepted_viewed`
- `driver_pickup_confirmed`
- `driver_custody_receipt_refreshed`
- `driver_custody_receipt_conflict`
- `driver_custody_continue_to_route`
- `driver_custody_chain_opened`
- `driver_custody_support_opened`
- `driver_custody_pending_sync_viewed`

Required properties:

- `deliveryId`
- `eventId`
- `status`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `actorRole`
- `source`
- `networkState`
- `evidenceState`
- `hasPendingOutboxAction`

Forbidden properties:

- Raw package scan code.
- Camera data.
- Private customer phone.
- Full street address unless analytics policy explicitly permits address class tokens.

## Cache And Invalidation
On entry with server response:

- Save local confirmation receipt.
- Invalidate delivery detail.
- Invalidate delivery timeline.
- Invalidate driver queue.
- Invalidate station queue for origin station when known.
- Invalidate custody chain.

On evidence refresh success:

- Update delivery detail cache.
- Update timeline cache.
- Clear pending pickup action.
- Mark receipt evidence complete.

On offline cached confirmed entry:

- Show cached receipt.
- Show last successful server confirmation timestamp.
- Attempt background refresh when network returns.

On pending sync:

- Do not save confirmed receipt.
- Link to outbox action.
- Do not clear pending pickup action.

## Implementation Notes For Claude Code
Build this as a receipt screen driven by confirmed backend response, not as a success animation.

Required implementation sequence:

1. Read route `deliveryId`.
2. Read navigation lifecycle response when present.
3. Validate response delivery ID and status.
4. Store local confirmed receipt only after validation.
5. Refetch delivery and timeline.
6. Render confirmed hero immediately if response is valid.
7. Render evidence refresh badge until detail and timeline agree.
8. Render pending sync state if only outbox evidence exists.
9. Route forward to `DriverRoute` only from confirmed or approved exception state.
10. Add accessibility status announcements.
11. Add tests for confirmed, pending, missing response, conflict, and offline cached states.

Suggested hook names:

- `useDriverCustodyAcceptedScreen`
- `usePickupReceipt`
- `useLifecycleReceiptValidation`
- `useCustodyEvidenceRefresh`
- `useDriverRouteNextAction`
- `usePickupOutboxStatus`

Suggested component boundaries:

- `DriverCustodyAcceptedScreen` owns route and orchestration.
- `ConfirmedCustodyHero` owns hero status.
- `DeliveryReceiptCard` owns event data.
- `OriginToDriverSpine` owns handoff visualization.
- `DriverResponsibilityPanel` owns accountability copy.
- `NextRouteActionPanel` owns forward navigation.
- `PendingSyncNotSuccessPanel` owns outbox state.

## API Mapping
Source response:

- `eventId` -> receipt event ID.
- `deliveryId` -> route validation and receipt identity.
- `status` -> confirmed state gate.
- `paymentStatus` -> receipt payment state.
- `occurredAt` -> server pickup timestamp.

Refresh calls:

- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`

Expected event:

- `driver_pickup_confirmed`

Expected handoff:

- `origin_station_to_driver`

Expected next route:

- `/(ops)/driver/runs/:deliveryId/route`

## QA Acceptance Criteria
Functional:

- Valid lifecycle response renders confirmed custody receipt.
- Invalid delivery ID mismatch blocks success.
- Missing lifecycle response triggers refresh.
- Refetched confirmed delivery can render receipt.
- Pending outbox action renders pending sync state, not success.
- Evidence conflict blocks continue.
- Continue routes to driver route only from safe state.
- Custody chain action opens shared custody route.
- Support action opens driver support route.

Custody:

- Success requires status `dispatched_from_origin`.
- Screen references `driver_pickup_confirmed`.
- Screen references `origin_station_to_driver`.
- Screen explains driver accountability.
- Screen explains next custody move is destination receipt.
- Screen never reveals package scan code.

Offline:

- Cached confirmed receipt works without network.
- Cached confirmed receipt shows freshness.
- No confirmed receipt offline shows blocked state.
- Pending sync does not become confirmed while offline.
- Reconnect refresh updates evidence state.

Accessibility:

- Primary test ID is `screen-driver-custody-accepted`.
- Confirmed state is announced.
- Pending state is announced.
- Conflict state is announced assertively.
- Progress indicators have accessible labels.
- CTA target sizes meet minimum.

Analytics:

- `driver_pickup_confirmed` fires once per confirmed event.
- Raw package scan code is never sent.
- Evidence conflict includes error category.
- Continue to route includes event ID and delivery ID.

## Test Matrix
Unit tests:

- Valid lifecycle response accepted.
- Invalid status rejected for confirmed receipt.
- Delivery ID mismatch rejected.
- Receipt store redacts scan code.
- Pending outbox state maps to pending UI.
- Evidence conflict locks continue action.

Component tests:

- Renders confirmed hero.
- Renders event receipt card.
- Renders handoff spine.
- Renders responsibility panel.
- Renders pending sync panel.
- Renders conflict panel.
- Renders cached offline badge.

Integration tests:

- Scanner success navigation shows receipt.
- Outbox sync success shows receipt.
- Direct deep link refetches delivery.
- Timeline refresh updates evidence state.
- Network failure preserves confirmed local receipt.
- Missing receipt and offline state blocks success.

End-to-end tests:

- `e2e-driver-custody-accepted-from-scan-success`
- `e2e-driver-custody-accepted-pending-sync-not-success`
- `e2e-driver-custody-accepted-deep-link-refresh`
- `e2e-driver-custody-accepted-conflict-blocks-route`
- `e2e-driver-custody-accepted-opens-custody-chain`

## Performance
Targets:

- Receipt hero visible under 500 milliseconds when navigation response exists.
- Cached receipt visible under 500 milliseconds.
- Evidence refresh starts within 250 milliseconds after mount.
- Primary CTA responsive under 100 milliseconds.
- Timeline refresh does not block rendering confirmed receipt.

Low-bandwidth:

- Do not load map assets.
- Do not load heavy images.
- Do not block on station name lookup if station ID is available.
- Use compact refresh payloads when available.

## Edge Cases
User opens receipt after app restart:

- Load local confirmed receipt.
- Refetch delivery when network exists.

User opens receipt before pickup:

- Show not confirmed and route to pickup scan if still assigned.

User opens receipt after destination receipt:

- Show already moved forward with latest state and custody chain action.

Outbox sync succeeds while user is on pending panel:

- Transition to confirmed receipt.
- Announce success.

Outbox sync fails with mismatch:

- Keep pending evidence.
- Show conflict.
- Route to support or custody chain.

Server response arrives but detail refresh fails:

- Keep receipt.
- Show partial evidence banner.
- Allow continue if status is confirmed in response.

Timeline shows no pickup event after confirmed response:

- Keep receipt.
- Show partial evidence banner.
- Retry timeline.
- Do not hide event ID.

Payment status changes:

- Show current payment status from response and refresh.
- Do not block custody receipt after pickup succeeded unless backend later adds a reversal event.

## Release Gates
This screen is not complete until:

- Confirmed receipt renders only from server-confirmed pickup.
- Pending outbox state cannot appear as success.
- Delivery ID mismatch is blocked.
- Evidence conflict is blocked.
- Custody chain route is linked.
- Continue to route is gated by confirmed state.
- Raw package scan code is absent from UI, logs, and analytics.
- Accessibility announcements are covered.
- Unit, component, integration, and E2E tests cover the critical states.
- CI remains green.

## Final Build Standard
The final UI should make one operational truth obvious:

`Pickup is not just completed; responsibility has moved to the driver and the next safe action is controlled route movement toward destination handoff.`

If the implementation preserves that truth across online success, outbox sync success, offline cached receipt, and conflict recovery, this screen is ready for production build.
