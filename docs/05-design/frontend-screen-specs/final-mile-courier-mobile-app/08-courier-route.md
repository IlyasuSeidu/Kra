# CourierRoute Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierRoute` |
| Route | `/(ops)/courier/assignments/:deliveryId/route` |
| Primary test ID | `screen-courier-route` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery` plus route metadata when exposed |
| Offline critical | Yes, cached address, landmark, receiver context, and last route guidance must remain usable |
| Required role | `final_mile_courier` |
| Required delivery status | `out_for_delivery` or safe recovery state after confirmed trip start |
| Required custody | Current courier remains final-mile custodian |
| Next workflow | `/(ops)/courier/assignments/:deliveryId/proof` |
| Related routes | `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/courier/issues`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Cached route guidance and arrival preparation screen with map fallback, receiver-context gating, support entry, and proof-flow handoff |

## Product Job
`CourierRoute` helps the courier travel from the destination station or current location to the receiver address after the package is marked `out_for_delivery`.

It answers eight operational questions:

- `Where am I going?`
- `What address or landmark should I trust if maps fail?`
- `Is this package already out for delivery?`
- `Do I still hold custody?`
- `How do I open navigation without leaking sensitive data?`
- `What should I do if the route is unsafe or the address cannot be found?`
- `When am I close enough to move to proof capture?`
- `What should I do if I lose network during the route?`

The screen must guide the courier without pretending Kra has advanced route optimization or live fleet navigation when the backend does not expose that authority.

## Product Standard
This screen is a route-assistance and arrival-prep surface, not a dispatch optimizer.

The courier should be able to:

- See delivery reference and current status.
- Verify courier custody before travel.
- See receiver display name and permitted destination details.
- See address text and landmark instructions.
- Open the device navigation provider.
- See cached route guidance when offline.
- Understand when maps data is stale or unavailable.
- Open proof capture when at receiver location or when manual arrival confirmation is allowed.
- Record a failed attempt if address, safety, or receiver availability blocks delivery.
- Open support with redacted route context.

The screen must never:

- Claim live route optimization without backend support.
- Show another courier's delivery.
- Show OTP before proof flow.
- Show proof asset references.
- Show raw package scan code.
- Show receiver phone as plain text if contact controls are not authorized.
- Mark delivery complete.
- Record failed attempt directly.
- Store GPS or route snapshots longer than policy allows.
- Send location data to analytics without redaction and consent policy.

## Audience
Primary audience:

- Final-mile couriers actively traveling to a receiver.

Secondary audience:

- Support staff helping with address, safety, or receiver issues.
- Destination station staff checking whether a courier left the station.
- QA validating offline route state, privacy, and proof handoff.
- Security reviewers validating location and receiver data rules.
- Claude Code implementing the React Native route screen and tests.

## Context Of Use
The courier may open this screen:

- After `CourierOutForDelivery` confirms status.
- From the assignment detail while status is `out_for_delivery`.
- From a notification after the package moved out for delivery.
- While offline during travel.
- After returning from external navigation.
- Near the receiver address before proof capture.
- After support asks the courier to verify route context.

The courier may be walking, riding, driving, parked near a building, or dealing with poor network. The UI must be glanceable, avoid dense controls, and keep the next safe action visible.

## Design Brief
User and job:

- A courier with confirmed custody needs reliable route guidance and arrival readiness for doorstep completion.

Surface type:

- Mobile operational navigation support screen.

Primary action:

- Open proof capture when arrival is credible, otherwise open navigation.

Visual thesis:

- `Trustworthy field compass`: a clean route sheet with a restrained map panel, strong destination card, offline-safe instructions, and a protected proof handoff.

Restraint rule:

- Do not build advanced route optimization, live courier tracking, or proof collection here. This screen guides travel and routes to the proof workflow.

Density:

- Medium. The route card must show enough destination context without becoming an address dump.

Platform stance:

- Native-plus mobile route workspace with external navigation handoff, cached fallback instructions, large actions, and safety recovery.

## External Research Used
Only directly relevant links were used:

- [Google Maps Platform Maps URLs](https://developers.google.com/maps/documentation/urls/get-started): supports launching directions across platforms through a URL-based directions action when native map embedding is not the full source of truth.
- [Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html): supports opening Apple Maps directions through URL parameters on iOS.
- [Uber delivering using the Driver app](https://www.uber.com/us/en/deliver/basics/making-deliveries/how-to-deliver/): supports courier step progression, navigation after pickup, delivery notes, and support access during active delivery.
- [DoorDash Dasher app usage](https://dasher.doordash.com/en-us/blog/how-to-use-dasher-app): supports delivery work surfaces that show directions, delivery information, and in-app support.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports showing cached data with clear freshness and synchronization states.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for offline maps, route refresh, arrival, and recovery states.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/07-courier-out-for-delivery.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/06-architecture/integration-architecture.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/07-api/api-contracts.md`
- `services/api/src/handoffs.ts`
- `services/api/src/public-tracking.ts`

## Backend And Integration Context
Primary backend data:

- `GET /v1/deliveries/:id` through `get_delivery`.

Current backend limitation:

- No dedicated route optimization endpoint is defined in the local API contract.
- Inventory names route metadata as available only when exposed.
- The screen must not invent route ETAs, traffic, or sequence optimization.

Maps integration baseline:

- Architecture names `Google Maps Platform` for geocoding and route rendering.
- If maps are unavailable, address text and landmark instructions remain the fallback operational source.
- Maps credentials must remain in backend secret storage, not in exposed client configuration unless the chosen mobile maps SDK requires a restricted public key.

Allowed route authority:

- Cached receiver address and landmark from delivery detail.
- Backend-provided route metadata if later exposed.
- Device navigation provider after user action.
- Device location only when permission and platform policy allow.

Not route authority:

- Client-estimated advanced ETA.
- Unverified crowdsourced destination edits.
- Receiver phone text treated as address.
- Analytics-derived courier paths.

## Lifecycle Semantics
Normal route entry expects:

```text
currentStatus=out_for_delivery
currentCustodyRole=final_mile_courier
currentCustodyActorId=current courier
```

The screen does not transition delivery status.

The screen can route to:

- Proof capture when courier is at or near receiver and ready to complete delivery.
- Failed attempt when receiver, safety, or address prevents completion.
- Support when route or receiver context is unsafe.
- Action recovery when delivery state contradicts the route.

The screen must not:

- Mark delivered.
- Record failed attempt.
- Upload proof.
- Generate receiver OTP.
- Reassign delivery.

## Route Entry Preconditions
The screen can render active route state when:

- User is authenticated.
- User role is `final_mile_courier`.
- Delivery is assigned to current courier.
- Current courier has custody.
- Delivery status is `out_for_delivery`.
- Receiver address or landmark exists.

If preconditions fail:

- If status is `assigned_for_final_mile`, route to `CourierOutForDelivery`.
- If custody is missing, route to `CourierCustodyAccepted` or `CourierAcceptAssignmentScan` based on known state.
- If delivery is delivered, route to completed job detail when available.
- If delivery is issue reported, route to issue or recovery.
- If delivery is assigned to someone else, route to assignments and support recovery.

## Information Architecture
The screen has eight zones:

- Route authority strip.
- Destination card.
- Map or static route panel.
- Offline fallback instructions.
- Arrival readiness panel.
- Receiver contact policy panel.
- Issue and support actions.
- Sticky action footer.

The first viewport must answer destination, route action, and next proof action. Secondary policy and fallback details can sit below the fold.

## Route Authority Strip
Purpose:

- Show whether route data is live, cached, stale, blocked, or map-unavailable.

States:

- `Live`: delivery and map data refreshed.
- `Cached`: delivery details are saved and route is usable offline.
- `Map unavailable`: address and landmark are primary guidance.
- `Location denied`: device location is unavailable.
- `Blocked`: delivery state is unsafe for routing.
- `Arrived`: arrival threshold or manual arrival confirmation is active.

Copy:

- Live: `Route ready`
- Cached: `Saved route details`
- Map unavailable: `Use address and landmark`
- Location denied: `Location is off`
- Blocked: `Route unavailable`
- Arrived: `Ready for proof`

Rules:

- Do not use green for arrival unless proof flow is available.
- Use amber for cached, map-unavailable, or location-denied states.
- Use red for blocked state.

## Destination Card
Purpose:

- Put the receiver destination in a clear, station-to-doorstep format.

Required fields:

- delivery reference.
- receiver display name.
- area or neighborhood.
- address text.
- landmark instructions.
- destination station context.
- package handling note when relevant.
- current status.

Optional fields:

- doorstep distance estimate.
- building or access note.
- delivery note.
- last refreshed time.

Hidden fields:

- OTP.
- raw receiver phone.
- proof asset reference.
- raw package scan code.
- exact GPS coordinates unless the map provider uses them internally and policy permits.

Copy:

- Title: `Route to receiver`
- Subtitle: `Use the address and landmark if map guidance is unavailable.`

Receiver name:

- Show display name only.
- Do not show full phone number in plain text.
- Contact actions, if available, must be guarded and logged.

## Map Or Static Route Panel
Purpose:

- Give visual orientation while respecting backend limitations.

Map states:

- Embedded map available.
- External navigation available.
- Static destination preview.
- Map unavailable.
- Offline cached route sheet.
- Location permission denied.

Embedded map rules:

- Render only if map provider is configured and allowed.
- Show destination marker.
- Show current-location marker only with permission.
- Do not show other active deliveries.
- Do not show station fleet data.
- Do not show traffic ETA unless provider and product policy support it.
- Do not retain route snapshots beyond policy.

External navigation:

- Primary map action may open Google Maps, Apple Maps, or platform default navigation.
- The app must ask before leaving the app if platform conventions require it.
- The destination passed to external maps should use address or coordinates from authorized route data.
- Do not pass receiver phone, OTP, package code, or internal delivery IDs into external map query text.

Static fallback:

- Show address, landmark, station reference, and a copy action if policy permits.
- Show `Map unavailable. Use address and landmark.`

## Offline Fallback Instructions
Purpose:

- Keep delivery workable during poor network.

Offline visible fields:

- receiver display name.
- area.
- address.
- landmark.
- package handling note.
- last refreshed time.

Offline rules:

- Label all saved data as saved.
- Do not claim route is live.
- Allow opening cached external navigation link if previously created safely.
- Allow issue reporting through offline outbox if supported.
- Allow proof capture only if proof screen supports offline proof policy.

Offline copy:

- `Saved route details. Confirm the address and landmark before completing delivery.`

## Arrival Readiness Panel
Purpose:

- Decide when the courier can proceed to proof capture.

Signals:

- User taps `I am at receiver location`.
- Device location is near destination when permission allows.
- External navigation returns to app.
- Courier manually confirms arrival when location is unavailable.

Rules:

- Do not require GPS if policy allows completion with `gps_unavailable=true` later.
- Do not block proof capture solely because maps are unavailable.
- If address is not found, route to failed attempt or support.
- If receiver cannot be reached, route to failed attempt flow.

Primary arrival action:

- `Continue to proof`

Secondary actions:

- `Record failed attempt`
- `Contact support`

## Receiver Contact Policy Panel
Purpose:

- Prevent casual exposure of receiver phone while keeping delivery possible.

Rules:

- Show contact controls only if the app has an approved contact policy.
- Prefer masked call action over plain phone display.
- Log contact attempt metadata without storing call content.
- Do not expose phone in analytics.
- Do not allow contact before status is `out_for_delivery`.

Copy:

- `Contact only if directions are unclear or receiver availability must be confirmed.`

If contact controls are not available:

- Show `Receiver contact is handled by support or approved contact flow.`

## Issue And Safety Actions
Issue routes:

- `Record failed attempt`
- `Report unsafe route`
- `Contact support`

Failed attempt reasons likely handled later:

- `receiver_unreachable`
- `receiver_unavailable`
- `address_not_found`
- `unsafe_to_complete`
- `receiver_refused`
- `proof_failed`
- `package_issue_detected`

Rules:

- This screen routes to failed attempt; it does not write failed attempt itself.
- Unsafe route must be prominent enough for field safety.
- Address-not-found state should preserve route context for the failed attempt screen.

## Primary Happy Path
1. Courier starts final-mile trip from `CourierOutForDelivery`.
2. Backend confirms `out_for_delivery`.
3. Courier opens `CourierRoute`.
4. Screen fetches delivery detail.
5. Screen verifies courier custody and status.
6. Screen shows destination card.
7. Screen renders map or fallback route sheet.
8. Courier opens external navigation or follows address and landmark.
9. Courier returns near receiver location.
10. Courier taps `Continue to proof`.
11. App routes to `CourierProofCapture`.

## Offline Path
1. Courier opens route with cached delivery detail.
2. Screen labels data as saved.
3. Map panel falls back to saved address and landmark.
4. Courier uses cached external navigation or manual directions.
5. If at receiver, courier can continue only if proof flow supports required offline evidence.
6. If blocked, courier records failed attempt through offline-capable flow or opens support when online.

## States
### Loading
Use when:

- Delivery detail is fetching.
- Route metadata is loading.
- Location permission is resolving.

UI:

- Destination card shell.
- Map panel shell.
- Message: `Loading route details...`

### Live Route Ready
Use when:

- Delivery status is `out_for_delivery`.
- Custody belongs to courier.
- Route data is current.

UI:

- Live authority strip.
- Destination card.
- Map panel or external navigation action.
- Arrival readiness panel.

### Cached Route
Use when:

- Delivery data is saved and network is unavailable.

UI:

- Saved authority strip.
- Destination card with last refreshed time.
- Offline fallback instructions.

### Map Unavailable
Use when:

- Maps provider fails or is not configured.

UI:

- Static route sheet.
- Address and landmark emphasized.
- Support and failed-attempt actions.

### Location Denied
Use when:

- Device location permission is denied.

UI:

- Map can still show destination if provider allows.
- Current-location marker is hidden.
- Manual arrival action remains available.

### Arrived
Use when:

- Courier confirms arrival or device location is near destination.

UI:

- Arrival panel.
- Primary `Continue to proof`.
- Secondary failed attempt.

### Blocked
Use when:

- Delivery state is unsafe.
- Custody mismatch exists.
- Required address context is missing.
- Delivery is no longer out for delivery.

UI:

- Critical warning.
- Recovery action.
- Support action.

## Error Handling
### Delivery Not Found
Title:

- `Delivery not found`

Body:

- `This route can no longer be opened. Return to your active jobs.`

Actions:

- `Back to assignments`
- `Contact support`

### Not Out For Delivery
Title:

- `Trip has not started`

Body:

- `Start the final-mile trip before opening route guidance.`

Actions:

- `Start trip`
- `Back to detail`

### Custody Conflict
Title:

- `Custody record changed`

Body:

- `Do not continue with this package until operations reviews the custody record.`

Actions:

- `Open recovery`
- `Contact support`

### Address Missing
Title:

- `Address details missing`

Body:

- `Doorstep delivery needs a usable address or landmark before route guidance can continue.`

Actions:

- `Open recovery`
- `Record failed attempt`

### Map Provider Failure
Title:

- `Map unavailable`

Body:

- `Use the saved address and landmark instructions. If the location cannot be found, record a failed attempt or contact support.`

Actions:

- `Copy address`
- `Record failed attempt`
- `Contact support`

### Location Permission Denied
Title:

- `Location is off`

Body:

- `You can still use address guidance and manually continue to proof when you reach the receiver.`

Actions:

- `Open location settings`
- `Continue with address`

### Unsafe Route
Title:

- `Unsafe to continue`

Body:

- `Move to a safe place and record the issue before attempting delivery.`

Actions:

- `Record failed attempt`
- `Contact support`

## Content System
Tone:

- Focused.
- Field-safe.
- Calm.
- Precise.

Preferred terms:

- `Route to receiver`
- `Saved route details`
- `Use address and landmark`
- `Continue to proof`
- `Record failed attempt`
- `Location is off`

Avoid:

- `optimized route`
- `live ETA`
- `exact arrival`
- `guaranteed route`
- `customer tracking`

Primary actions:

- `Open navigation`
- `Continue to proof`
- `Record failed attempt`

Secondary actions:

- `Copy address`
- `Open support`
- `Refresh route`
- `Back to detail`

## Visual System
Overall look:

- Map or route sheet at top.
- Destination card as the stable source of truth.
- Strong offline and fallback labels.
- Sticky bottom actions.

Visual hierarchy:

- First: route authority.
- Second: destination.
- Third: navigation action.
- Fourth: arrival action.
- Fifth: support or failed attempt.

Color:

- Live route: neutral or blue.
- Cached route: amber.
- Arrived: green only for proof readiness.
- Blocked or unsafe: red.

Map styling:

- Reduce visual clutter.
- Keep destination marker high contrast.
- Avoid decorative route animations.
- Avoid dense POI overlays when possible.

Motion:

- Use small panel transitions.
- No animated vehicle trails.
- No decorative pulsing route line.
- Respect reduced motion.

## Accessibility
Announcements:

- `Route ready. Destination details loaded.`
- `Saved route details. Data may be stale.`
- `Map unavailable. Use address and landmark instructions.`
- `Location is off. Manual arrival remains available.`
- `Ready for proof.`

Focus order:

- Back action.
- Route authority.
- Destination card.
- Map or static route panel.
- Navigation action.
- Arrival action.
- Failed attempt action.
- Support action.

Touch targets:

- Minimum 44 by 44 points.
- `Open navigation`, `Continue to proof`, and `Record failed attempt` should be full-width or thumb-sized.

Screen reader map alternative:

- Provide text destination and landmark before the map.
- Do not require map interaction to understand the route.
- Map controls must have labels.

Large text:

- Address card must wrap.
- Footer must remain usable.
- Map may reduce height to preserve action access.

## Privacy And Security
Sensitive data:

- address and delivery instructions.
- receiver phone.
- GPS and route snapshots.
- package scan code.
- OTP.
- proof assets.

Rules:

- Do not show OTP.
- Do not show package scan code.
- Do not expose receiver phone unless approved contact control is active.
- Do not pass internal delivery IDs to external map query.
- Do not send full address to analytics.
- Route and GPS snapshots follow the 30-day retention baseline.
- Support payload should include route state, not full personal address unless necessary and policy allows.

Analytics allowed:

- screen viewed.
- route authority state.
- open navigation tapped.
- map unavailable.
- location permission denied.
- continue to proof tapped.
- failed attempt route opened.
- support opened.

Analytics disallowed:

- full address.
- receiver phone.
- OTP.
- package scan code.
- exact GPS coordinate.

## Data Requirements
Route params:

- `deliveryId`

Required auth:

- actor ID.
- role.
- capabilities.

Required delivery fields:

- delivery ID.
- tracking code.
- current status.
- assigned final-mile courier ID.
- current custody role.
- current custody actor ID.
- receiver display name.
- receiver phone presence or contact eligibility.
- address text or landmark.
- destination station ID.
- destination station label.
- package handling flags when relevant.

Optional route fields:

- route metadata when exposed.
- destination latitude and longitude when policy allows.
- doorstep distance estimate.
- last route refresh time.
- map provider status.

Local state:

- map provider state.
- location permission state.
- cached route authority.
- manual arrival state.
- external navigation opened state.

## API And Integration
Queries:

- `get_delivery`

Mutations:

- None on this screen.

Navigation integrations:

- Google Maps URL.
- Apple Map Links.
- Platform default maps app.
- Embedded map provider if configured.

No direct lifecycle mutations:

- Do not call `mark_out_for_delivery`.
- Do not call `complete_delivery`.
- Do not call `record_failed_attempt`.
- Do not call proof asset routes.

Invalidation:

- Refresh delivery on route focus when online.
- Respect cached state when offline.

## Navigation Rules
Entry:

- From `CourierOutForDelivery` after server success.
- From assignment detail when status is `out_for_delivery`.
- From courier home active route card.
- From notification after out-for-delivery update.

Exit:

- `Continue to proof` routes to `/(ops)/courier/assignments/:deliveryId/proof`.
- `Record failed attempt` routes to `/(ops)/courier/assignments/:deliveryId/failed-attempt`.
- `Contact support` routes to `/(ops)/courier/issues`.
- `Open recovery` routes to `/(ops)/action-recovery`.

Back behavior:

- Back returns to assignment detail or courier home depending source.
- Back does not undo out-for-delivery status.
- Returning from external navigation should restore this screen state.

Deep link behavior:

- Validate delivery scope before showing route.
- Redirect if not out for delivery.
- Redirect if proof already completed.
- Redirect if delivery is no longer assigned.

## Component Inventory
Screen-level components:

- `CourierRouteScreen`
- `RouteAuthorityStrip`
- `CourierDestinationCard`
- `CourierRouteMapPanel`
- `ExternalNavigationActions`
- `OfflineRouteFallbackCard`
- `ArrivalReadinessPanel`
- `ReceiverContactPolicyPanel`
- `RouteIssueActions`
- `CourierRouteFooter`

Shared components:

- `StatusAuthorityStrip`
- `DeliveryReferenceBadge`
- `OfflineStateBadge`
- `CriticalWarningCard`
- `ActionRecoveryLink`

## Component Responsibilities
`CourierRouteScreen`:

- Own route params, delivery guard, custody guard, map state, offline state, arrival state, and navigation.

`RouteAuthorityStrip`:

- Show live, cached, map unavailable, location denied, blocked, or arrived state.

`CourierDestinationCard`:

- Show receiver and destination facts with privacy controls.

`CourierRouteMapPanel`:

- Render map, static destination, or fallback sheet.

`ExternalNavigationActions`:

- Launch approved external navigation without leaking internal fields.

`OfflineRouteFallbackCard`:

- Show saved address, landmark, and freshness.

`ArrivalReadinessPanel`:

- Enable proof route only after credible arrival signal or manual confirmation.

`ReceiverContactPolicyPanel`:

- Explain contact eligibility and avoid plain phone exposure.

`RouteIssueActions`:

- Route to failed attempt, safety, or support flows.

`CourierRouteFooter`:

- Render navigation, proof, failed attempt, and support actions by state.

## State Machine
```text
loading
  -> blocked
  -> live_route_ready
  -> cached_route
  -> map_unavailable

live_route_ready
  -> external_navigation
  -> arrived
  -> blocked
  -> map_unavailable

cached_route
  -> external_navigation
  -> arrived
  -> map_unavailable
  -> blocked

map_unavailable
  -> static_guidance
  -> arrived
  -> failed_attempt
  -> support

location_denied
  -> static_guidance
  -> manual_arrival

arrived
  -> proof_capture
  -> failed_attempt

blocked
  -> action_recovery
  -> assignment_detail
  -> support
```

## Validation Rules
Route guard:

- Delivery ID must exist.
- User must be authenticated.
- User role must be `final_mile_courier`.
- Delivery must be assigned to current courier.
- Current custody must belong to current courier.
- Status must be `out_for_delivery`.
- Address text or landmark must exist.

External navigation:

- Destination input must come from authorized route data.
- Internal delivery IDs must not be embedded in external map query.
- Receiver phone must not be embedded in map query.
- OTP must never be embedded.

Arrival:

- Continue to proof requires manual arrival confirmation or location signal when available.
- Location denial cannot permanently block manual arrival.
- Unsafe route should direct to failed attempt or support.

## Test IDs
Screen:

- `screen-courier-route`

Authority:

- `courier-route-authority`
- `courier-route-authority-label`

Destination:

- `courier-route-destination-card`
- `courier-route-delivery-ref`
- `courier-route-receiver-name`
- `courier-route-address`
- `courier-route-landmark`
- `courier-route-station`

Map:

- `courier-route-map-panel`
- `courier-route-static-panel`
- `courier-route-open-navigation`
- `courier-route-copy-address`
- `courier-route-location-denied`

Arrival:

- `courier-route-arrival-panel`
- `courier-route-manual-arrival`
- `courier-route-continue-proof`

Issue:

- `courier-route-record-failed-attempt`
- `courier-route-contact-support`
- `courier-route-open-recovery`

Footer:

- `courier-route-footer`

## Automated Test Matrix
Render tests:

- Renders live route ready state for current courier and `out_for_delivery`.
- Renders cached route state offline.
- Renders map unavailable fallback.
- Renders location denied state.
- Renders blocked state for wrong status.
- Does not render OTP.
- Does not render package scan code.
- Does not render proof upload controls.

Navigation tests:

- Open navigation action uses approved provider URL.
- External map URL excludes delivery ID, phone, OTP, and package code.
- Continue to proof routes to proof capture.
- Failed attempt action routes to failed attempt screen.
- Support action routes to courier issues.
- Back returns to safe parent.

Offline tests:

- Saved address and landmark render while offline.
- Cached state shows last refreshed label.
- Offline map unavailable state keeps static guidance.
- Proof route is available only if proof policy allows offline evidence.

Accessibility tests:

- Route ready is announced.
- Cached state is announced.
- Map unavailable has text alternative.
- Focus order reaches destination before map controls.
- Large text keeps footer actions usable.
- Touch targets meet size requirements.

Privacy tests:

- Receiver phone is not plain text.
- OTP is absent.
- Package scan code is absent.
- Analytics payload excludes address and exact GPS.
- External navigation payload excludes internal IDs.

## Manual QA Script
1. Sign in as final-mile courier.
2. Move delivery to `out_for_delivery`.
3. Open route screen.
4. Confirm destination card shows receiver display name, address, and landmark.
5. Confirm OTP is not visible.
6. Confirm package scan code is not visible.
7. Tap open navigation.
8. Confirm external map opens with destination only.
9. Return to app.
10. Deny location permission.
11. Confirm manual arrival remains available.
12. Disable maps provider.
13. Confirm static address and landmark fallback.
14. Go offline.
15. Confirm cached route details show saved label.
16. Confirm continue to proof routes to proof capture when arrival is confirmed.
17. Confirm failed attempt routes to failed attempt screen.
18. Force wrong status.
19. Confirm blocked route recovery.
20. Test screen reader order.

## Implementation Notes For Claude Code
Build this as route guidance and arrival preparation only.

Required implementation approach:

- Use existing auth, delivery detail, route guard, offline, and navigation primitives.
- Use `get_delivery` as the main data source.
- Render map only if provider integration is configured.
- Always provide address and landmark fallback.
- Keep proof capture in the proof screen.
- Keep failed attempt writing in the failed attempt screen.
- Keep route and test IDs exact.
- Redact phone, OTP, scan code, internal IDs, and GPS from analytics.

Expected file areas:

- Final-mile courier route registration.
- Screen component.
- Map provider abstraction or external navigation utility.
- Offline cached route reader.
- Route guard utility.
- Navigation tests.
- Accessibility tests.
- Privacy tests.

Do not invent:

- Route optimization backend.
- Live ETA.
- Customer tracking map.
- Direct proof upload.
- Failed-attempt mutation on this screen.
- Receiver phone display without policy.

## Acceptance Criteria
Functional:

- Current courier can open route only after `out_for_delivery`.
- Cached route details remain usable offline.
- Map failure falls back to address and landmark.
- External navigation does not leak internal IDs or secrets.
- Arrival routes to proof capture.
- Failed delivery conditions route to failed attempt or support.

UX:

- Courier can understand destination within five seconds.
- Offline and map-unavailable states are explicit.
- Route screen stays focused on navigation and arrival readiness.
- Primary next action changes from navigation to proof when arrival is credible.

Security:

- OTP, package scan code, and proof references are absent.
- Receiver phone is gated.
- GPS and route data follow retention policy.
- Analytics are redacted.

Accessibility:

- Text destination exists before map interaction.
- Status changes are announced.
- Touch targets are field-safe.
- Large text does not block main actions.

Testing:

- Render, navigation, offline, map failure, accessibility, and privacy tests cover this screen.
- Tests assert exact route and primary test ID.
- Tests assert no lifecycle mutation is called from this screen.

## Quality Bar
This screen is ready for build only when:

- It guides couriers without overclaiming route intelligence.
- It remains useful when maps or network fail.
- It protects receiver and package secrets.
- It makes proof capture the next workflow, not an embedded sub-flow.
- It supports safe field decisions when the address is wrong, unsafe, or unreachable.

