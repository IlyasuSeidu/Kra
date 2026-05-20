# CourierProofCapture Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierProofCapture` |
| Route | `/(ops)/courier/assignments/:deliveryId/proof` |
| Primary test ID | `screen-courier-proof-capture` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `complete_delivery` |
| Offline critical | Yes, proof method decision and receiver instructions must remain visible from cache; completion mutations must follow backend authority rules |
| Required role | `final_mile_courier` |
| Required delivery status | `assigned_for_final_mile` or `out_for_delivery`, with `out_for_delivery` preferred before completion |
| Required custody | Current courier must hold final-mile custody |
| Previous workflow | `/(ops)/courier/assignments/:deliveryId/route` |
| Next workflow | `/(ops)/courier/assignments/:deliveryId/proof/otp`, `/(ops)/courier/assignments/:deliveryId/proof/signature`, `/(ops)/courier/assignments/:deliveryId/proof/photo`, `/(ops)/courier/assignments/:deliveryId/failed-attempt` |
| Related routes | `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/route`, `/(ops)/courier/assignments/:deliveryId/completed`, `/(ops)/courier/issues`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Proof method selector, policy gate, offline-aware arrival checkpoint, and safe router to OTP, signature, photo, failed-attempt, or recovery screens |

## Product Job
`CourierProofCapture` helps a courier at the receiver location choose the correct proof method before completing final-mile delivery.

It answers ten operational questions:

- `Am I allowed to complete this delivery?`
- `Do I still hold custody?`
- `Is this package already out for delivery?`
- `Which proof method should I use first?`
- `When is fallback proof allowed?`
- `What receiver name should be recorded?`
- `Can the app capture GPS now?`
- `What should I do if the receiver cannot provide OTP?`
- `What should I do if I cannot finish safely?`
- `What will happen after I choose a proof method?`

The screen must reduce courier uncertainty without collecting proof itself. It is the decision point before the actual proof capture screens.

## Product Standard
This screen is a proof authority checkpoint, not a completion form.

The courier should be able to:

- See the delivery reference and receiver context.
- Verify current custody and status.
- See that OTP is the default proof method.
- Understand that signature and delivery photo are fallback options.
- See whether GPS is available, denied, pending, or unavailable.
- Choose OTP completion as the primary path.
- Choose one fallback method only when OTP cannot be completed.
- Record a structured reason in the child fallback flow.
- Move to failed attempt when delivery cannot be completed.
- Recover safely if backend state conflicts with local cache.

The screen must never:

- Mark a delivery delivered.
- Upload proof assets directly.
- Capture OTP digits directly.
- Draw a signature directly.
- Take or store a delivery photo directly.
- Display a raw proof upload URL.
- Display raw proof asset object paths to the courier.
- Display a receiver verification token.
- Allow fallback proof without explaining why it is exceptional.
- Allow two fallback proof methods for one completion.
- Claim GPS was captured when the device did not provide it.
- Override backend proof, custody, or permission errors.
- Let a courier complete another courier's delivery.
- Collect cash or suggest cash settlement.

## Audience
Primary audience:

- Final-mile couriers standing near the receiver and preparing to finish a delivery.

Secondary audience:

- Support staff diagnosing disputed proof.
- Destination station staff checking final-mile custody.
- QA validating proof routes and state gates.
- Security reviewers validating sensitive proof handling.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may open this screen:

- After route guidance when they have arrived near the receiver address.
- From assignment detail while delivery status is `out_for_delivery`.
- After `CourierOutForDelivery` if the app skipped route guidance.
- After returning from external navigation.
- While offline with cached receiver details.
- After OTP fails in the child OTP screen and the courier needs fallback selection.
- After camera or signature permission recovery redirects back to proof selection.
- After a backend conflict indicates the delivery was already completed or reassigned.

The courier may be under time pressure, outdoors, in poor lighting, beside traffic, in a building lobby, or communicating with a receiver who does not understand the delivery process. The UI must make the correct action obvious, preserve safety, and avoid dense policy prose.

## Design Brief
User and job:

- A final-mile courier with custody needs to choose the correct proof path before handing over the package or documenting why handoff cannot be completed.

Surface type:

- Mobile operational proof selector and authority gate.

Primary action:

- Start OTP proof.

Visual thesis:

- `Proof control tower`: a calm, high-contrast field screen with a strong OTP lane, two guarded fallback lanes, and an always-visible safety exit.

Restraint rule:

- Do not collect proof here. Do not add decorative proof cards, proof previews, or completion shortcuts. This screen selects the lawful next step.

Density:

- Balanced. The screen needs enough policy clarity for high-liability delivery work while keeping one dominant action.

Platform stance:

- Native-plus mobile workflow with thumb-reachable actions, persistent status, accessible alerts, and offline-safe cached context.

## External Research Used
Only directly relevant links were used:

- [Uber delivery confirmation with PIN](https://help.uber.com/en/driving-and-delivering/article/delivery-confirmation-with-pin-feature?nodeId=61478729-8a5f-4f93-ba77-8fbcec909c16): supports PIN as a receiver-provided delivery confirmation method, with help escalation when PIN cannot be confirmed.
- [Uber Direct proof of delivery options](https://help.uber.com/driving-and-delivering/article/cu%C3%A1l-es-la-prueba-de-entrega-requerida-para-uber-direct?nodeId=890347d9-3a8f-45d9-a045-8bec72aeef9e): supports photo, signature, barcode, and PIN as proof method variants selected by delivery policy.
- [DoorDash delivery drop-off photos](https://help.doordash.com/en-us/dashers/article/confirming-delivery-drop-off-photos): supports requiring a high-quality photo before completing a delivery, including lighting, blur, and surrounding-context guidance.
- [DoorDash customer unavailable flow](https://help.doordash.com/en-au/dashers/article/how-to-complete-a-delivery-when-the-customer-is-unavailable): supports arrival, receiver contact, unavailable action, timer, and documented location when direct handoff fails.
- [Android camera guidance](https://developer.android.com/media/camera/camera-deprecated/camera-api): supports explicit camera permission handling, foreground camera use, quick capture versus custom camera decisions, and camera resource release requirements.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached local data as the app read source while network state catches up.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for GPS, offline, conflict, upload, and route changes without unexpected focus movement.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for field operators working with one hand.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports logical focus order through status, primary proof action, fallback options, and recovery actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/07-courier-out-for-delivery.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/08-courier-route.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/privacy-and-data-retention.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/public-tracking-verification.ts`

## Backend And Integration Context
Primary read:

- `GET /v1/deliveries/:id` through `get_delivery`.

Proof asset routes:

- `POST /v1/deliveries/:id/proof-assets`
- `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`

Completion route:

- `POST /v1/deliveries/:id/complete`

Relevant route keys:

- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`

Relevant capability:

- `complete_delivery_with_proof`

Delivery proof types:

- `otp`
- `signature`
- `delivery_photo`

Fallback proof asset types:

- `signature`
- `delivery_photo`

Proof asset statuses:

- `pending_upload`
- `uploaded`
- `attached`
- `rejected`

Supported proof asset content types:

- `image/jpeg`
- `image/png`
- `image/webp`

Proof asset constraints:

- Maximum byte size is `8_000_000`.
- Upload intent expires after `15 minutes`.
- Proof asset reference must be backend-issued and match `PFA-*`.
- Upload confirmation requires `byteSize`, `sha256`, and optional `storageGeneration`.
- Completion with signature or delivery photo requires an uploaded proof asset.

Completion request fields:

- `proofType`
- `proofReference`
- `receivedByName`

Completion response:

- `eventId`
- `deliveryId`
- `status`
- `paymentStatus`
- `occurredAt`

Current backend gap to respect:

- The local API schema does not currently include `proof_fallback_reason`, `gps`, or `gps_unavailable` in `completeDeliveryRequestSchema`.
- The product policy requires those fields for full accountability.
- The UI spec must surface those requirements and mark implementation integration as a backend-contract dependency, not silently omit them from UX.

## Lifecycle Semantics
Normal proof entry expects:

```text
currentStatus=out_for_delivery
currentCustodyRole=final_mile_courier
currentCustodyActorId=current courier
assignedFinalMileCourierId=current courier
paymentStatus=paid
```

Allowed completion behavior:

- OTP proof completes with `proofType=otp` and a receiver verification token as `proofReference`.
- Signature proof completes with `proofType=signature` and an uploaded `PFA-*` proof asset as `proofReference`.
- Delivery photo proof completes with `proofType=delivery_photo` and an uploaded `PFA-*` proof asset as `proofReference`.
- All completion paths require `receivedByName`.
- Signature and delivery photo proof must be uploaded and confirmed before `/complete`.
- Completion creates a `delivery_completed` event and a `delivery_completion` handoff event.
- Completion clears active custody because the package has transferred to receiver custody.

Selector screen behavior:

- It may refresh delivery state.
- It may inspect cache freshness.
- It may request GPS permission state.
- It may route to child proof screens.
- It may route to failed attempt.
- It may route to action recovery.
- It must not call `/complete`.
- It must not call proof asset upload routes unless future implementation explicitly moves preflight creation into this selector; v1 should keep asset creation inside the signature or photo child flow.

## Proof Policy
Default proof:

- OTP is the default proof method for v1 final-mile completion.
- The screen must label OTP as `Recommended` and `Default`.
- OTP path should be visually dominant.
- OTP explanation must say the receiver provides or verifies the delivery-scoped code through the receiver tracking flow.
- The courier must never see or store a receiver verification token as readable text.

Fallback proof:

- Signature is allowed only when OTP cannot be completed and the receiver is present or an approved receiver representative is present.
- Delivery photo is allowed only when OTP cannot be completed and photo proof is operationally valid for the handoff.
- Only one fallback method can be used for completion.
- Fallback proof must capture a structured reason in the child flow.
- Fallback proof must result in a backend-issued `PFA-*` proof asset.
- Fallback proof asset upload and confirmation must finish before completion.

Failed attempt:

- If receiver is not reachable, receiver is unavailable, address is not found, the location is unsafe, receiver refuses, proof fails, or package condition is disputed, the courier should use failed attempt instead of forcing fallback proof.
- The screen must make failed attempt visible as a safety path, not hide it behind support.

## Receiver Verification Semantics
OTP completion depends on receiver verification:

- Receiver opens secure tracking.
- Receiver completes phone challenge.
- Backend creates a delivery-scoped verification token.
- OTP child flow submits that token as `proofReference`.
- Backend verifies token before delivery completion.

The selector must:

- Explain that OTP confirms receiver identity.
- Start the OTP screen as the main action.
- Avoid asking the courier to request private phone digits unless policy later authorizes that recovery path.
- Avoid storing OTP digits in analytics, logs, crash reports, or local debug traces.

The selector must not:

- Generate the receiver OTP.
- Re-send the receiver challenge.
- Verify the receiver phone.
- Show the verification token.
- Treat a typed code as completion proof without backend verification.

## Arrival And Location Policy
The screen should request or read location state when allowed by platform policy.

Location states:

- `gps_available`: device can provide current coordinates.
- `gps_pending`: location permission or acquisition is still in progress.
- `gps_denied`: user denied permission.
- `gps_unavailable`: device cannot provide usable location.
- `gps_stale`: last known coordinate is older than the accepted freshness threshold.
- `gps_not_required_for_selector`: selector can proceed to proof method, but child completion must respect policy.

UX rules:

- GPS must be shown as evidence context, not as the only proof method.
- GPS unavailable must not block reaching the child proof screen.
- If policy requires `gps_unavailable=true`, the child completion screens must capture that field once the backend supports it.
- The selector must not claim final GPS capture until the completion route accepts and stores that data.
- Location permission request should happen only after the user understands why proof needs location context.

Privacy rules:

- Do not show exact coordinates in ordinary courier UI.
- Show human-readable state such as `Location ready`, `Location not available`, or `Location permission needed`.
- Do not send exact coordinates to analytics.
- GPS and route snapshots follow the `30 days` retention baseline.

## Information Architecture
The screen has nine zones:

1. Status header.
2. Delivery identity strip.
3. Receiver context.
4. Proof policy panel.
5. Primary OTP action.
6. Guarded fallback actions.
7. GPS and offline state panel.
8. Failed attempt and support actions.
9. Recovery footer.

### Zone 1: Status Header
Purpose:

- Orient the courier before any proof choice.

Content:

- Back control.
- Screen title: `Choose proof method`.
- Delivery short reference.
- Status chip.
- Custody chip.
- Offline chip when applicable.

Required states:

- `Out for delivery`
- `Custody confirmed`
- `Cached`
- `State needs refresh`
- `Conflict`
- `Delivered`

Test IDs:

- `courier-proof-header`
- `courier-proof-back-action`
- `courier-proof-status-chip`
- `courier-proof-custody-chip`
- `courier-proof-offline-chip`

Visual behavior:

- Use a sticky top header only if the platform already uses sticky operational headers.
- Keep status chips short.
- Use color sparingly: green for ready, amber for attention, red for blocked, gray for cached.

Accessibility:

- Header title is the first screen heading.
- Status chip changes use an accessible status message.
- Back control keeps route stack semantics.

### Zone 2: Delivery Identity Strip
Purpose:

- Make sure the courier is looking at the correct package.

Content:

- Delivery ID.
- Tracking code or safe short code if allowed.
- Package description at safe granularity.
- Destination station name or code.
- Receiver display name.
- Latest status timestamp.

Must avoid:

- Raw package scan code.
- Full receiver phone.
- Raw address if privacy setting or role scope forbids it.
- Proof asset references.

Test IDs:

- `courier-proof-delivery-id`
- `courier-proof-tracking-code`
- `courier-proof-package-summary`
- `courier-proof-receiver-name`
- `courier-proof-latest-timestamp`

### Zone 3: Receiver Context
Purpose:

- Confirm who should receive the package and what the courier needs before proof.

Content:

- Receiver display name.
- Safe contact control if authorized.
- Address summary from route screen.
- Landmark or arrival note.
- Receiver instruction excerpt.
- Handoff reminder: `Hand over only after accepted proof.`

Actions:

- `Call receiver` if authorized.
- `Message receiver` if authorized.
- `View route` to return to route screen.

Test IDs:

- `courier-proof-receiver-card`
- `courier-proof-call-receiver-action`
- `courier-proof-message-receiver-action`
- `courier-proof-view-route-action`

Contact privacy:

- Use masked phone display.
- Use platform call intent or secure proxy if available.
- Do not log receiver phone.
- Disable contact controls when not present in backend scope.

### Zone 4: Proof Policy Panel
Purpose:

- Explain the hierarchy of proof methods without slowing down normal completion.

Content:

- `Use OTP first.`
- `Fallback proof is only for OTP problems.`
- `Signature or photo must be uploaded before completion.`
- `If receiver is unavailable, record a failed attempt.`

Visual behavior:

- Use a compact policy card under receiver context.
- Use one primary sentence and three short bullets.
- Do not make this an expandable legal article.

Test IDs:

- `courier-proof-policy-card`
- `courier-proof-policy-otp-default`
- `courier-proof-policy-fallback-rule`
- `courier-proof-policy-failed-attempt`

Copy requirements:

- Copy must be direct and operational.
- Copy must not blame the receiver or courier.
- Copy must distinguish fallback proof from failed attempt.

### Zone 5: Primary OTP Action
Purpose:

- Drive the most secure and expected completion path.

Component:

- Large primary action card.

Label:

- `Start OTP proof`

Supporting copy:

- `Use this when the receiver can confirm delivery through the secure code flow.`

Badges:

- `Default`
- `Fastest`

Action:

- Navigate to `/(ops)/courier/assignments/:deliveryId/proof/otp`.

Test IDs:

- `courier-proof-otp-card`
- `courier-proof-otp-primary-action`
- `courier-proof-otp-default-badge`

Enabled when:

- Delivery is assigned to current courier.
- Current courier has final-mile custody.
- Delivery is not delivered.
- Delivery is not in terminal or dispute-only state.

Disabled when:

- Delivery belongs to another courier.
- Custody is missing.
- Payment status is not paid.
- Delivery has already completed.
- User lacks `complete_delivery_with_proof`.

Interaction:

- Tap card or button opens OTP screen.
- Double-tap protection prevents multiple navigations.
- If offline, open OTP screen only if it can clearly show network is required for final verification; otherwise show offline guidance.

### Zone 6: Guarded Fallback Actions
Purpose:

- Offer approved non-OTP proof without making fallback feel equal to OTP.

Layout:

- Two secondary cards under the OTP card.
- Cards are visually lighter than OTP.
- Each card includes a reason requirement notice.

Signature card:

- Label: `Use receiver signature`
- Supporting copy: `Only if OTP cannot be completed and the receiver is present.`
- Action: `/(ops)/courier/assignments/:deliveryId/proof/signature`
- Test IDs:
  - `courier-proof-signature-card`
  - `courier-proof-signature-action`

Photo card:

- Label: `Use handoff photo`
- Supporting copy: `Only if OTP cannot be completed and photo proof is appropriate for the handoff.`
- Action: `/(ops)/courier/assignments/:deliveryId/proof/photo`
- Test IDs:
  - `courier-proof-photo-card`
  - `courier-proof-photo-action`

Fallback guard:

- On first fallback tap, show an inline guard panel rather than an intrusive dialog when space allows.
- Guard asks the courier to confirm why OTP is not possible.
- Guard does not write completion data on this screen.
- Selected reason is passed to the child fallback screen as local route state.
- Child fallback screen remains responsible for sending backend data when the API supports policy fields.

Fallback reasons:

- `receiver_cannot_access_otp`
- `receiver_phone_unavailable`
- `receiver_verified_in_person`
- `otp_network_blocked`
- `other_support_approved`

Reasons that must route away from fallback:

- Receiver not present routes to failed attempt.
- Address not found routes to failed attempt.
- Unsafe location routes to failed attempt.
- Receiver refused routes to failed attempt.
- Package issue routes to issue or failed attempt depending severity.

Guard test IDs:

- `courier-proof-fallback-guard`
- `courier-proof-fallback-reason-list`
- `courier-proof-fallback-reason-receiver-cannot-access-otp`
- `courier-proof-fallback-reason-receiver-phone-unavailable`
- `courier-proof-fallback-reason-receiver-verified-in-person`
- `courier-proof-fallback-reason-otp-network-blocked`
- `courier-proof-fallback-reason-support-approved`
- `courier-proof-fallback-continue-action`
- `courier-proof-fallback-cancel-action`

Accessibility:

- Fallback guard receives logical focus after the selected card.
- The selected fallback reason is announced as selected.
- Cards remain at least platform minimum touch size and should exceed WCAG target size guidance.

### Zone 7: GPS And Offline State Panel
Purpose:

- Surface proof readiness context without blocking lawful completion.

Content:

- Location status.
- Cache freshness.
- Network status.
- Last delivery refresh timestamp.
- Offline outbox count if relevant.

Location labels:

- `Location ready`
- `Getting location`
- `Location permission needed`
- `Location unavailable`
- `Location stale`

Network labels:

- `Online`
- `Offline, cached delivery details`
- `Sync pending`
- `Retrying`

Test IDs:

- `courier-proof-readiness-panel`
- `courier-proof-gps-status`
- `courier-proof-network-status`
- `courier-proof-cache-age`
- `courier-proof-outbox-link`

Behavior:

- If online and stale cache exists, refresh delivery detail quietly and show a status message.
- If offline, show cached data age and disable actions that cannot complete without network unless the child screen has a queued action design.
- If GPS is denied, show `Enable location` as a secondary action.
- If GPS is unavailable, explain that proof can proceed but completion may require unavailable-location attestation when backend supports it.

### Zone 8: Failed Attempt And Support Actions
Purpose:

- Prevent bad completions when delivery cannot lawfully finish.

Primary recovery action:

- `Record failed attempt`

Secondary recovery action:

- `Contact support`

Failed attempt route:

- `/(ops)/courier/assignments/:deliveryId/failed-attempt`

Support route:

- `/(ops)/courier/issues?deliveryId=:deliveryId`

Test IDs:

- `courier-proof-failed-attempt-action`
- `courier-proof-support-action`
- `courier-proof-safety-note`

Failed attempt triggers:

- Receiver unreachable.
- Receiver unavailable.
- Address not found.
- Unsafe to complete.
- Receiver refused.
- Proof failed.
- Package issue detected.

UX rule:

- Failed attempt must remain visible from the ready state.
- Support should not replace failed attempt for structured operational failures.
- Unsafe state should elevate failed attempt and support above fallback proof.

### Zone 9: Recovery Footer
Purpose:

- Handle backend and local state conflicts.

Content:

- `Refresh state`
- `Open action recovery`
- `Back to assignment`
- `Return to route`

Test IDs:

- `courier-proof-refresh-action`
- `courier-proof-action-recovery-link`
- `courier-proof-assignment-link`
- `courier-proof-return-route-link`

Conflict behavior:

- If backend says delivery is `delivered`, route to completion summary.
- If backend says courier no longer holds custody, route to action recovery.
- If backend says delivery is assigned to another courier, block proof choice and route to assignments.
- If backend says status is `assigned_for_final_mile`, route to out-for-delivery before proof unless `/complete` recovery path is intentionally supported.
- If backend says proof asset is pending from a prior child flow, route to that child recovery state rather than creating another proof asset.

## Visual System Direction
The screen should feel operational, field-ready, and serious.

Art direction:

- Compact but not cramped.
- High contrast in daylight.
- Strong primary action lane.
- Fallback options visually available but clearly secondary.
- Policy information embedded at the moment of decision.

Color tokens:

- `surface.canvas`: warm off-white or low-glare neutral.
- `surface.card`: white with subtle field-grade border.
- `surface.raised`: elevated action card.
- `text.primary`: near-black.
- `text.secondary`: slate gray.
- `accent.ready`: deep green.
- `accent.warning`: amber.
- `accent.blocked`: red.
- `accent.info`: blue.
- `accent.offline`: graphite.

Typography:

- Use the app's operational type scale.
- Screen title should be strong and compact.
- Proof action labels should be large enough for outdoor use.
- Supporting copy should be short and line-length controlled.

Spacing:

- Use generous vertical spacing around primary OTP action.
- Keep fallback cards close enough to compare but separated from OTP hierarchy.
- Keep failed attempt actions in the lower decision area.
- Maintain safe-area padding for bottom actions.

Motion:

- Route entry may use a short upward reveal for proof cards.
- Fallback guard expands inline from the selected fallback card.
- Network and GPS state changes use non-disruptive status updates.
- Reduced-motion users receive instant state changes.

Iconography:

- OTP: shield or keypad icon.
- Signature: pen stroke icon.
- Photo: camera icon.
- GPS: location pin icon.
- Failed attempt: warning triangle icon.
- Support: headset or lifeline icon.

Icon rules:

- Icons support labels; they never replace labels.
- Icons use consistent stroke weight.
- Avoid playful illustrations on this liability screen.

## Layout Specification
Default mobile layout:

- Top safe area.
- Sticky status header if consistent with other courier screens.
- Scrollable content.
- Bottom anchored primary action only when not duplicating the OTP card.
- If bottom primary action exists, it should mirror `Start OTP proof`.

Recommended vertical order:

1. Header.
2. Delivery identity strip.
3. Receiver context card.
4. Proof policy card.
5. OTP action card.
6. Fallback action cards.
7. Readiness panel.
8. Failed attempt and support.
9. Recovery footer.

Compact phone behavior:

- Collapse identity details into one line plus expandable details.
- Keep OTP action visible before fallback cards.
- Readiness panel may collapse to chips.
- Failed attempt remains visible below fallback cards.

Large phone behavior:

- Receiver context and readiness can sit in separate cards.
- Fallback cards can render side by side only if tap targets remain large.
- Do not create a dense dashboard grid.

Landscape behavior:

- Avoid forcing proof cards into tiny horizontal tiles.
- If landscape is supported, use two columns: context left, proof actions right.
- Maintain logical focus order matching reading order.

## Component Inventory
Required components:

- `CourierProofHeader`
- `DeliveryIdentityStrip`
- `ReceiverContextCard`
- `ProofPolicyCard`
- `ProofMethodPrimaryCard`
- `ProofMethodFallbackCard`
- `FallbackReasonGuard`
- `ProofReadinessPanel`
- `LocationStatusPill`
- `NetworkStatusPill`
- `FailedAttemptActionBlock`
- `ProofRecoveryFooter`
- `AccessibleStatusAnnouncer`

Shared components to reuse if available:

- Delivery status chip.
- Custody chip.
- Offline chip.
- Receiver contact controls.
- Operational action card.
- Error state panel.
- Permission prompt sheet.
- Offline outbox link.

Do not create:

- A separate proof capture canvas.
- A camera view.
- A signature pad.
- A local completion confirmation route.
- A payment collection component.

## State Matrix
### Loading State
Trigger:

- Initial delivery detail fetch is pending and no cache exists.

UI:

- Header skeleton.
- One receiver card skeleton.
- Three proof action skeletons.
- Status text: `Loading proof options.`

Allowed actions:

- Back.
- Retry after timeout.

Test IDs:

- `courier-proof-loading-state`
- `courier-proof-loading-status`

### Cached Loading State
Trigger:

- Cache exists and network refresh is pending.

UI:

- Render cached delivery context.
- Show `Refreshing` status chip.
- Keep proof actions enabled only if cached state is not stale beyond policy threshold.

Allowed actions:

- Start proof if local state is fresh and workflow supports it.
- Refresh.
- View route.
- Failed attempt if supported offline.

Test IDs:

- `courier-proof-cached-loading-state`

### Ready State
Trigger:

- Delivery state matches final-mile proof preconditions.

UI:

- OTP card primary.
- Signature and photo fallback secondary.
- GPS and network status visible.
- Failed attempt visible.

Allowed actions:

- Start OTP proof.
- Open fallback guard.
- Record failed attempt.
- Contact support.
- Return to route.

Test IDs:

- `courier-proof-ready-state`

### Offline Ready State
Trigger:

- Cached delivery detail exists but network is unavailable.

UI:

- Show `Offline, cached delivery details`.
- Show cache age.
- Show whether selected child proof screen can operate offline.
- Do not imply backend completion has happened.

Allowed actions:

- View cached receiver context.
- Start child flow only if child can clearly queue or block completion.
- Open offline outbox.
- Record failed attempt only if the failed attempt flow supports queueing.

Blocked actions:

- Any direct completion.
- Any proof upload without network unless child has a durable proof outbox.

Test IDs:

- `courier-proof-offline-ready-state`

### GPS Pending State
Trigger:

- App is acquiring location.

UI:

- Readiness panel shows `Getting location`.
- OTP action remains available if policy allows child flow to complete after location resolves or stores unavailable state.

Accessible status:

- Announce `Getting location for proof context.`

Test IDs:

- `courier-proof-gps-pending-state`

### GPS Permission Needed State
Trigger:

- Location permission is not granted.

UI:

- Readiness panel asks for permission with short rationale.
- Secondary action: `Enable location`.
- Proof actions remain visible.

Copy:

- `Location helps resolve delivery disputes. You can still choose a proof method.`

Test IDs:

- `courier-proof-gps-permission-state`
- `courier-proof-enable-location-action`

### GPS Unavailable State
Trigger:

- Device cannot provide usable location.

UI:

- Readiness panel shows `Location unavailable`.
- Policy note says child completion may record unavailable location once backend supports it.

Test IDs:

- `courier-proof-gps-unavailable-state`

### Fallback Guard State
Trigger:

- Courier taps signature or photo fallback card.

UI:

- Inline reason selector expands.
- Selected fallback card remains visually connected to the guard.
- Continue action disabled until reason selected.

Allowed actions:

- Select reason.
- Continue to child fallback flow.
- Cancel fallback guard.
- Use OTP instead.
- Record failed attempt.

Test IDs:

- `courier-proof-fallback-guard-state`

### Blocked By Status State
Trigger:

- Delivery status is not eligible for final-mile completion.

UI:

- Show current status.
- Explain correct next step.
- Route to appropriate workflow.

Mappings:

- `assigned_for_final_mile` routes to out-for-delivery.
- `awaiting_final_mile_assignment` routes to assignments.
- `received_at_destination` routes to assignment detail.
- `delivered` routes to completion summary.
- `issue_reported` routes to issue detail or support.

Test IDs:

- `courier-proof-blocked-status-state`
- `courier-proof-blocked-next-action`

### Blocked By Custody State
Trigger:

- Current courier does not hold custody.

UI:

- Show custody owner state without exposing another user's private details.
- Explain that proof requires active courier custody.
- Provide action recovery or assignment route.

Allowed actions:

- Refresh.
- Open action recovery.
- Back to assignment.
- Contact support.

Test IDs:

- `courier-proof-blocked-custody-state`

### Permission Denied State
Trigger:

- User lacks `complete_delivery_with_proof`.

UI:

- Block proof method selection.
- Explain that the account cannot complete deliveries.
- Provide support path.

Test IDs:

- `courier-proof-permission-denied-state`

### Already Delivered State
Trigger:

- Delivery has `finalProof` or status `delivered`.

UI:

- Show delivered state summary.
- Show completion timestamp.
- Do not show proof method actions.
- Route to completed job detail when available.

Test IDs:

- `courier-proof-already-delivered-state`

### Prior Proof In Progress State
Trigger:

- Local child flow has a pending signature or photo proof asset workflow.

UI:

- Show `Proof upload in progress`.
- Show method type.
- Offer `Continue upload` and `Start over` only if start-over behavior is safe and audited.

Rules:

- Do not create a second proof asset silently.
- Do not expose raw upload URL.
- Do not discard proof evidence without explicit user action.

Test IDs:

- `courier-proof-prior-proof-state`
- `courier-proof-continue-upload-action`

### Backend Conflict State
Trigger:

- Refresh detects state differs from local workflow.

UI:

- Show clear conflict summary.
- Provide one primary recovery action.
- Preserve local context for support.

Examples:

- Delivery reassigned.
- Custody changed.
- Delivery completed elsewhere.
- Delivery entered issue review.
- Proof asset expired.

Test IDs:

- `courier-proof-conflict-state`
- `courier-proof-conflict-recovery-action`

### Error State
Trigger:

- Delivery read fails without usable cache.

UI:

- Error panel.
- Retry.
- Back to assignments.
- Contact support.

Test IDs:

- `courier-proof-error-state`
- `courier-proof-retry-action`

## Navigation Rules
Entry route:

- `/(ops)/courier/assignments/:deliveryId/proof`

Forward routes:

- OTP: `/(ops)/courier/assignments/:deliveryId/proof/otp`
- Signature: `/(ops)/courier/assignments/:deliveryId/proof/signature`
- Photo: `/(ops)/courier/assignments/:deliveryId/proof/photo`
- Failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- Issue: `/(ops)/courier/issues?deliveryId=:deliveryId`
- Route: `/(ops)/courier/assignments/:deliveryId/route`
- Assignment detail: `/(ops)/courier/assignments/:deliveryId`
- Action recovery: `/(ops)/action-recovery`
- Offline outbox: `/(ops)/offline-outbox`

Back behavior:

- Back returns to route screen when entered from route.
- Back returns to assignment detail when entered directly.
- Back must not clear a child proof workflow that is in progress.

Deep link behavior:

- If opened from notification, fetch delivery state first.
- If state is eligible, render ready state.
- If state is stale or conflict exists, show recovery.

Navigation guards:

- Do not navigate to proof child screens when delivery is terminal.
- Do not navigate to proof child screens when assignment belongs to another courier.
- Do not navigate to fallback child until reason is selected.
- Do not skip OTP screen to complete delivery.

## Child Flow Contracts
### OTP Child Contract
Route:

- `/(ops)/courier/assignments/:deliveryId/proof/otp`

Receives:

- `deliveryId`
- receiver display name
- latest delivery state
- GPS readiness state

Does:

- Guides receiver OTP verification.
- Submits `/complete` with `proofType=otp`.
- Uses delivery-scoped receiver verification token as `proofReference`.
- Records `receivedByName`.

Does not:

- Use `PFA-*`.
- Upload proof assets.

### Signature Child Contract
Route:

- `/(ops)/courier/assignments/:deliveryId/proof/signature`

Receives:

- `deliveryId`
- selected fallback reason
- receiver display name
- GPS readiness state

Does:

- Captures receiver signature.
- Creates proof asset upload intent with `proofType=signature`.
- Uploads asset through signed URL.
- Confirms upload.
- Completes delivery with `proofType=signature` and `proofReference=PFA-*`.
- Records `receivedByName`.

Does not:

- Let the courier complete before upload confirmation.
- Store raw upload URL in visible UI.

### Photo Child Contract
Route:

- `/(ops)/courier/assignments/:deliveryId/proof/photo`

Receives:

- `deliveryId`
- selected fallback reason
- receiver display name
- GPS readiness state

Does:

- Captures or selects a handoff photo according to platform policy.
- Creates proof asset upload intent with `proofType=delivery_photo`.
- Uploads asset through signed URL.
- Confirms upload.
- Completes delivery with `proofType=delivery_photo` and `proofReference=PFA-*`.
- Records `receivedByName`.

Does not:

- Complete when photo is blurry, dark, or missing handoff context if quality checks are implemented.
- Store photo in public media library unless platform rules require explicit user action.

## Copy System
Tone:

- Calm.
- Direct.
- Operational.
- Safety-aware.
- No blame.

Primary title:

- `Choose proof method`

Subtitle:

- `Use OTP first. Signature and photo are fallback proof only.`

OTP card:

- Title: `Start OTP proof`
- Body: `Best when the receiver can confirm the handoff through the secure code flow.`
- CTA: `Continue with OTP`

Signature card:

- Title: `Use receiver signature`
- Body: `Use only when OTP cannot be completed and the receiver is present.`
- CTA: `Choose signature`

Photo card:

- Title: `Use handoff photo`
- Body: `Use only when OTP cannot be completed and a photo is valid proof for this handoff.`
- CTA: `Choose photo`

Fallback guard:

- Title: `Why is OTP not possible?`
- Body: `Kra records a reason for every fallback proof path.`
- CTA: `Continue`
- Cancel: `Use OTP instead`

Failed attempt:

- Title: `Cannot complete delivery?`
- Body: `Record a failed attempt if the receiver, address, safety, proof, or package condition blocks handoff.`
- CTA: `Record failed attempt`

Offline state:

- Title: `Offline`
- Body: `Cached delivery details are visible. Completion still needs backend confirmation.`

Location state:

- Permission body: `Location helps resolve delivery disputes. Enable it if available.`
- Unavailable body: `Location is unavailable on this device. Continue only through an accepted proof method.`

Conflict state:

- Title: `Delivery state changed`
- Body: `Refresh before choosing proof. This prevents completing the wrong handoff.`

## Data Requirements
Required data from delivery detail:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `receiver.name`
- `receiver.phone` only through safe contact controls
- `package.description`
- `destinationStationId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedFinalMileCourierId`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `finalProof`

Required local data:

- Current authenticated user ID.
- Current authenticated role.
- Capability list.
- Network status.
- Cache timestamp.
- GPS permission status.
- Last known GPS freshness.
- Offline outbox count.
- Prior child proof workflow state.

Do not store in screen state:

- Receiver verification token after navigation.
- Raw OTP digits in analytics.
- Signed proof upload URL.
- Raw proof image bytes.
- Signature bitmap data.
- Exact coordinates in analytics.

## API Mapping
Read delivery:

```http
GET /v1/deliveries/:id
```

OTP completion happens in child screen:

```json
{
  "proofType": "otp",
  "proofReference": "receiver-verification-token",
  "receivedByName": "Receiver Name"
}
```

Signature completion happens after asset upload in child screen:

```json
{
  "proofType": "signature",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Photo completion happens after asset upload in child screen:

```json
{
  "proofType": "delivery_photo",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Proof asset upload intent happens in fallback child screens:

```json
{
  "proofType": "delivery_photo",
  "contentType": "image/jpeg",
  "byteSize": 1200000,
  "sha256": "64-lowercase-hex-characters"
}
```

Proof asset upload confirmation happens in fallback child screens:

```json
{
  "byteSize": 1200000,
  "sha256": "64-lowercase-hex-characters",
  "storageGeneration": "provider-generation"
}
```

Selector screen API rule:

- The selector fetches and refreshes state.
- The selector does not call `/complete`.
- The selector does not upload proof assets in v1.
- The selector may read local child workflow state to resume an interrupted fallback flow.

## Error Handling
Backend error mapping:

| Backend condition | UI state | Recovery |
| --- | --- | --- |
| `NOT_FOUND` | Not found | Back to assignments and contact support |
| `FORBIDDEN` | Permission or assignment denied | Back to assignments, refresh, support |
| `INVALID_STATUS_TRANSITION` | Blocked by status | Route to correct prior workflow |
| `VALIDATION_ERROR` | State or proof validation failed | Refresh, recover child flow, or failed attempt |
| `ROUTE_NOT_ENABLED` with `missing_proof_storage_gateway` | Fallback proof unavailable | Use OTP, failed attempt, or support |
| Network timeout | Offline or retry | Use cache, retry, or offline outbox |
| Rate limited | Temporary block | Wait, retry later, support if urgent |
| Token verification failure | OTP child error | Retry OTP, fallback guard, or failed attempt |
| Proof asset expired | Fallback child recovery | Recreate asset in child flow |

Selector-specific errors:

- Delivery belongs to another courier.
- Delivery has no current final-mile custody.
- Delivery was completed by another action.
- Cached state is too stale for proof method selection.
- User lacks delivery completion capability.
- Proof storage is not configured for fallback proof.

UI principles:

- Use one clear recovery action per blocked state.
- Do not surface internal stack traces.
- Do not expose storage bucket object paths to courier.
- Do not tell courier to retry indefinitely.
- Offer failed attempt when real-world delivery cannot continue.

## Offline And Sync Rules
Offline read:

- Show cached receiver, address, delivery ID, and policy context.
- Show cache age.
- Show stale warnings when needed.

Offline write:

- This selector should not enqueue completion itself.
- Child proof screens may enqueue only if local proof evidence can be stored securely, idempotency keys are stable, and backend conflict recovery is defined.
- If child screens cannot safely queue, they must block final completion until online.

Outbox integration:

- Show pending proof or failed attempt actions from the outbox.
- Link to `OpsOfflineOutbox`.
- Link to `OpsActionRecovery` for conflicts.

Conflict strategy:

- Backend state wins for delivery status, custody, final proof, and payment.
- Local proof evidence may remain recoverable for upload retry.
- User must see conflict before any repeated mutation.

## Security And Privacy
Sensitive fields:

- Receiver name.
- Receiver phone.
- Address and delivery instructions.
- Proof images.
- Signatures.
- GPS and route snapshots.
- Verification tokens.

Controls:

- Mask receiver phone unless using platform contact intent.
- Never show receiver verification token.
- Never store OTP digits in analytics.
- Never show signed upload URLs.
- Do not persist proof assets in unencrypted general storage.
- Clear child proof temporary files after confirmed upload and completion.
- Use no-store semantics where web surfaces are involved.
- Keep proof and GPS retention aligned with policy.

Retention alignment:

- Proof images and signatures: `180 days` unless tied to active dispute, then `24 months`.
- GPS and route snapshots: `30 days`.
- Delivery summary: `24 months`.
- Issue and audit history: `24 months`.

Threat scenarios:

- Courier tries to complete without receiver proof.
- Courier uses fallback proof when receiver is absent.
- Courier uploads proof for wrong delivery.
- Another courier opens proof route for reassigned delivery.
- Signed upload URL leaks through logs.
- Offline cache shows stale assignment after reassignment.
- Proof asset expires before completion.
- Receiver disputes delivery after fallback proof.

Required mitigations:

- Backend assignment and custody checks.
- Backend proof asset ownership checks.
- Backend OTP token verification.
- UI fallback reason guard.
- Accessible conflict states.
- Secure local proof storage in child flows.
- Redacted analytics.

## Accessibility Requirements
Screen reader:

- Screen title is announced first.
- Delivery status and custody status are announced as structured state.
- OTP default status is announced on the primary card.
- Fallback guard reason selection has radio semantics or equivalent native selection semantics.
- GPS and network changes use accessible status messages.
- Error and conflict states move focus to the state title.

Focus order:

1. Back action.
2. Screen title.
3. Delivery identity.
4. Receiver context actions.
5. Proof policy.
6. OTP action.
7. Signature fallback.
8. Photo fallback.
9. Fallback guard when expanded.
10. Readiness panel actions.
11. Failed attempt.
12. Support.
13. Recovery footer.

Touch targets:

- Primary OTP card must be easy to tap with one thumb.
- Fallback cards must not sit too close to failed attempt action.
- Inline reason controls must meet or exceed minimum touch guidance.

Color and contrast:

- Do not communicate proof method hierarchy through color alone.
- Use text labels for status.
- Ensure outdoor readability.

Motion:

- Respect reduced motion.
- Do not animate proof action positions after the courier begins selecting a method.

Language:

- Avoid jargon.
- Explain fallback without legal phrasing.
- Keep all critical information available in text, not only icons.

## Performance Requirements
Initial render:

- Show cached delivery context within one frame when cache exists.
- Network refresh should not block cached read.
- Do not load camera modules on this selector screen.
- Do not load signature canvas modules on this selector screen.
- Defer child proof dependencies until navigation.

Network:

- Use idempotent read behavior.
- Avoid repeated refresh loops while offline.
- Debounce manual refresh.

Memory:

- Keep no image or signature bytes in this screen.
- Keep route state small.
- Do not keep signed URL data in navigation params.

Battery:

- Do not poll GPS continuously.
- Request one current location check or listen only while screen is focused if required.
- Stop location observation when user leaves screen.

## Analytics And Observability
Allowed events:

- `courier_proof_screen_viewed`
- `courier_proof_otp_selected`
- `courier_proof_fallback_guard_opened`
- `courier_proof_fallback_reason_selected`
- `courier_proof_signature_selected`
- `courier_proof_photo_selected`
- `courier_proof_failed_attempt_selected`
- `courier_proof_support_selected`
- `courier_proof_conflict_seen`
- `courier_proof_refresh_selected`

Required event fields:

- `deliveryId`
- `screenId`
- `currentStatus`
- `custodyState`
- `networkState`
- `gpsState`
- `cacheAgeBucket`
- `selectedProofType` when applicable
- `fallbackReasonCode` when applicable

Forbidden event fields:

- OTP digits.
- Receiver verification token.
- Receiver full phone.
- Full address.
- Raw coordinates.
- Proof asset upload URL.
- Proof asset storage object path.
- Image bytes.
- Signature bytes.

Operational logs:

- Log route transitions by route name and delivery ID.
- Log backend conflicts by safe error code.
- Redact all proof secrets.

## Testing Requirements
Unit tests:

- Renders ready state with OTP primary and fallback secondary.
- Blocks proof selection when custody is missing.
- Blocks proof selection when assignment belongs to another courier.
- Shows already delivered state when `finalProof` exists.
- Shows offline cached state with cache age.
- Opens fallback guard before signature navigation.
- Opens fallback guard before photo navigation.
- Requires fallback reason before continuing.
- Routes receiver-absent reasons to failed attempt, not fallback child.
- Announces status messages for GPS and network changes.
- Does not call `/complete` from this screen.
- Does not call proof asset routes from this screen.

Integration tests:

- Deep link to proof route refreshes delivery state before rendering actions.
- OTP action navigates to OTP child with delivery ID.
- Signature action plus reason navigates to signature child.
- Photo action plus reason navigates to photo child.
- Failed attempt action navigates to failed attempt screen.
- Permission denied state blocks proof actions.
- `ROUTE_NOT_ENABLED` fallback route disables signature and photo but keeps OTP and failed attempt available.
- Backend conflict routes to action recovery.
- Offline state links to offline outbox.

Accessibility tests:

- Primary screen has heading.
- Cards have accessible names and roles.
- Fallback reason selector has selected state.
- Focus order remains logical when guard expands.
- Status updates are announced without stealing focus.
- Touch targets meet mobile sizing requirements.

Visual regression tests:

- Ready state.
- Fallback guard expanded.
- Offline cached state.
- GPS permission state.
- Blocked custody state.
- Already delivered state.
- Conflict state.
- Compact phone.
- Large text.
- Reduced motion.

E2E tests:

- Courier enters route from `CourierRoute`, opens proof selector, chooses OTP, completes in OTP child.
- Courier opens fallback guard, selects signature reason, continues to signature child.
- Courier opens fallback guard, selects photo reason, continues to photo child.
- Courier records failed attempt instead of fallback when receiver unavailable.
- Courier loses network on proof selector and sees cached context plus safe recovery.
- Courier opens proof after reassignment and is blocked.

## Acceptance Criteria
Functional acceptance:

- Screen renders at `/(ops)/courier/assignments/:deliveryId/proof`.
- Root element uses `screen-courier-proof-capture`.
- OTP is the visually dominant and default proof path.
- Signature and photo are visually secondary and require fallback guard.
- Failed attempt is visible from ready state.
- Current custody and delivery status are visible before proof choice.
- Offline state shows cache age and avoids false completion language.
- GPS state is visible and truthful.
- Already delivered state removes proof actions.
- Permission denied state removes proof actions.
- Backend conflict state provides recovery.

Policy acceptance:

- Screen states OTP as default proof.
- Screen states fallback proof is exceptional.
- Screen prevents two fallback methods for one selection.
- Screen does not complete delivery.
- Screen does not upload proof assets.
- Screen does not expose verification tokens or signed upload URLs.
- Screen routes failed delivery conditions to failed attempt.
- Screen does not allow cash collection.

Quality acceptance:

- UI is readable outdoors.
- Primary action is thumb reachable.
- Fallback guard is clear without feeling punitive.
- Copy is operational and concise.
- All critical states are testable by test ID.
- The spec can be implemented without product-policy guessing.

## Implementation Notes For Claude Code
Build this as a selector screen only.

Use the route:

```text
/(ops)/courier/assignments/:deliveryId/proof
```

Use the root test ID:

```text
screen-courier-proof-capture
```

Implementation sequence:

1. Create route shell and fetch delivery state.
2. Render status header and delivery identity.
3. Render receiver context.
4. Render proof policy card.
5. Render OTP primary card.
6. Render guarded fallback cards.
7. Add fallback reason guard.
8. Add GPS and offline readiness panel.
9. Add failed attempt and support actions.
10. Add blocked, conflict, delivered, permission, loading, and error states.
11. Add analytics with redaction.
12. Add tests listed in this spec.

Do not implement:

- Camera capture in this file.
- Signature pad in this file.
- OTP verification in this file.
- `/complete` mutation in this file.
- Proof asset upload mutation in this file.
- Public web proof pages in this file.

Required integration boundaries:

- OTP child owns OTP verification and completion.
- Signature child owns signature capture, upload, confirmation, and completion.
- Photo child owns photo capture, upload, confirmation, and completion.
- Failed attempt child owns failed attempt mutation.
- Offline outbox owns queued mutation review.
- Action recovery owns conflicts.

## Backend Contract Follow-Up
The screen can be implemented against current backend routes, but full policy completion requires future backend contract expansion.

Required backend contract additions for policy parity:

- Add `proofFallbackReason` or equivalent to non-OTP completion.
- Add GPS capture fields or accepted unavailable-location attestation.
- Add explicit proof child state read if proof assets need resume support.
- Add safe receiver contact scope if not already present in delivery detail.
- Add backend validation that fallback proof reason is present for signature and delivery photo.

Until those additions exist:

- The selector should still ask for fallback reason.
- The reason should be passed to child flow and stored locally for future-compatible submission.
- Completion child screens must not pretend the backend persisted fields that the schema does not accept.

## Open Risks
- Backend completion schema does not yet include fallback reason or GPS fields required by policy.
- If proof asset storage is disabled, fallback proof must be blocked with safe alternatives.
- If receiver verification token recovery is weak, OTP UX may need a receiver-facing improvement rather than courier workaround.
- Offline proof completion can create liability if evidence is not stored securely and reconciled with backend custody.
- Photo proof quality checks need clear child-screen rules to avoid accepting unusable evidence.

## Definition Of Done
This screen is done when:

- All acceptance criteria pass.
- All required test IDs exist.
- No direct completion or proof upload happens from the selector.
- OTP is the default and dominant path.
- Fallback proof requires a reason guard.
- Failed attempt remains visible.
- Offline, GPS, permission, conflict, blocked, and delivered states are implemented.
- Analytics redact all proof, receiver, address, and location secrets.
- Child routes receive only safe route params and local state.
- The screen can be audited against custody, proof, privacy, and offline policy documents.
