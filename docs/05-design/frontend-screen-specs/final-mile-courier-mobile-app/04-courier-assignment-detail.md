# CourierAssignmentDetail Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierAssignmentDetail` |
| Route | `/(ops)/courier/assignments/:deliveryId` |
| Primary test ID | `screen-courier-assignment-detail` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery` |
| Offline critical | Yes, read cached with sensitive-field rules |
| Required role | `final_mile_courier` |
| Primary data source | `GET /v1/deliveries/:id` through route key `get_delivery` |
| Related routes | `/(ops)/courier/assignments`, `/(ops)/courier/assignments/:deliveryId/accept-scan`, `/(ops)/courier/assignments/:deliveryId/custody-accepted`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/route`, `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/courier/issues`, `/(ops)/offline-outbox` |
| Current implementation mode | Contract-backed assignment detail with receiver instructions, package facts, custody state, guarded contact access, and route-only lifecycle actions |

## Product Job
`CourierAssignmentDetail` is the safe operating page for one assigned doorstep job.

It answers eight field questions:

- `Is this delivery assigned to me?`
- `Has custody moved to me yet?`
- `What package am I handling?`
- `Who is receiving it?`
- `Where should I go, and what instructions matter?`
- `What is the next safe action?`
- `What proof will be needed at completion?`
- `Is this detail live, saved, or unsafe to act on?`

The screen must give enough information to prevent wrong-package, wrong-receiver, wrong-address, and missing-proof failures without leaking receiver-sensitive data outside the courier's operational need.

## Product Standard
This screen is the courier's source of truth for a single final-mile assignment.

The courier should be able to:

- Confirm the delivery ID and tracking code.
- See current status and custody state.
- Review receiver display name and address instructions when permitted.
- Verify package description, fragile flag, size tier, and weight.
- Understand whether receiver phone contact is available and why it is gated.
- Open the correct next workflow from the delivery state.
- Open support with delivery context.
- See whether local cached detail is safe enough for navigation.
- Avoid acting on stale, revoked, reassigned, or completed work.

The screen must never:

- Show a delivery outside the assigned courier scope.
- Let a courier accept custody without the accept-scan child workflow.
- Let a courier start final-mile travel without the out-for-delivery child workflow.
- Let a courier complete proof directly from detail.
- Let a courier record a failed attempt directly from detail.
- Show OTP, package scan code, proof asset reference, or exact GPS in static detail text.
- Persist raw receiver phone in ordinary assignment cache.
- Show full address before the UI has established that the detail belongs to the assigned courier.
- Treat a saved offline detail as fresh server truth.
- Show route optimization or live ETA when backend does not provide it.

## Audience
Primary audience:

- Final-mile couriers assigned to doorstep delivery jobs.

Secondary audience:

- Destination station staff explaining assignment status to a courier.
- Support staff receiving delivery-scoped issue reports.
- QA validating detail authorization, privacy, offline state, and route handoffs.
- Security reviewers validating sensitive-field gating.
- Claude Code implementing the React Native detail screen and tests.

## Context Of Use
The courier may open this screen:

- From the assigned jobs queue.
- From the home current-job card.
- From a push notification.
- Before accepting custody at the station.
- After accepting custody and preparing to leave.
- During doorstep delivery.
- After a failed sync.
- After a support issue has been opened.
- After returning from route, proof, failed-attempt, or outbox screens.

The courier may be carrying the package, standing at the station counter, riding toward the receiver, or waiting outside a building. The UI must support short attention, large touch targets, sunlight readability, and privacy around people nearby.

## Design Brief
User and job:

- A verified final-mile courier needs complete, safe, and status-aware instructions for one assigned doorstep job.

Surface type:

- Mobile operational detail view.

Primary action:

- Continue the next custody-safe workflow for the current status.

Visual thesis:

- `Verified job dossier`: a compact field dossier with a strong status banner, controlled receiver card, package verification block, and a single clear next action.

Restraint rule:

- Do not make this a mutation-heavy control panel. The detail screen explains and routes; child workflows perform scans, trip start, proof, and failure recording.

Density:

- Medium. The screen carries more information than the queue but must still prioritize the next action.

Platform stance:

- Native-plus mobile detail screen with sticky action footer, collapsible secondary facts, and clear status semantics.

## External Research Used
Only directly relevant links were used:

- [Uber: delivering using the Driver app](https://www.uber.com/us/en/deliver/basics/making-deliveries/how-to-deliver/): supports showing order details, customer name, delivery options, support access, and customer-unavailable recovery inside the delivery flow.
- [Uber Help: delivering the order](https://help.uber.com/riders/article/handling-delivery?nodeId=3350bf50-ae1a-4a2e-ac0b-13c0fdf78623): supports delivery notes, dropoff instructions, safe parking guidance, and completing delivery only at the final step.
- [DoorDash: customer unavailable](https://help.doordash.com/en-au/dashers/article/how-to-complete-a-delivery-when-the-customer-is-unavailable): supports explicit unavailable-customer procedures, timer-driven recovery, and documentation for disputed completion.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local detail reads, synchronization, and conflict handling after reconnect.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh, saved-data, and route-action status updates.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports logical detail section and sticky action focus order.
- [WCAG headings and labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html): supports descriptive section titles, contact actions, and proof labels.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/02-courier-home.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/03-courier-assignments.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/package-statuses.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/auth.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/deliveries.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`
- `apps/mobile/src/index.ts`

## Backend Contract
Current read:

- Operation key: `get_delivery`.
- HTTP route: `GET /v1/deliveries/:id`.
- Auth scope: authenticated.
- Capability label in route inventory: `view_own_delivery`.
- Access enforcement: `assertCanAccessDelivery`.
- Courier scope: `delivery.assignedFinalMileCourierId === principal.userId`.
- Response schema: `deliveryDetailResponseSchema`.
- Cache header: API sets no-store at HTTP layer; mobile may maintain a local operational cache under explicit offline policy.

Fields available today:

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
- `quote.currency`
- `quote.amount`
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

Important backend behavior:

- `get_delivery` returns detail only after `assertCanAccessDelivery` passes.
- A final-mile courier can access only deliveries assigned to that courier.
- Receiver address and phone are part of the detail response today.
- `get_delivery` does not return exact next-action metadata.
- `get_delivery` does not return route distance beyond optional doorstep distance.
- `get_delivery` does not return route path, map points, or ETA.
- `get_delivery` does not return assignment due times.
- `get_delivery` does not return open issue summary.
- `get_delivery` does not return proof fallback readiness.
- Timeline is available through `get_delivery_timeline`, but this screen's inventory coverage is `get_delivery`.

Implementation decision for v1:

- Use `get_delivery` as the source of truth.
- Derive next action from status and custody fields.
- Use local route state only for return path and list filters.
- Do not require `get_delivery_timeline` for this screen.
- Do not store raw receiver phone in ordinary detail cache.
- Store receiver address only in a short-lived secure detail cache when the courier is assigned and the delivery is active.
- If secure storage is unavailable, cache only non-sensitive detail and require live network for address display.

Future backend improvement:

- Add courier-safe detail projection or `GET /v1/courier/assignments/:deliveryId` with:
  - `nextAction`
  - `nextActionDueAt`
  - `contactPolicy`
  - `maskedReceiverPhone`
  - `canCallReceiver`
  - `safeAddressInstructions`
  - `proofPolicy`
  - `attemptCount`
  - `openIssueSummary`
  - `assignmentAcceptedAt`
  - `outForDeliveryAt`
  - `offlineSafeUntil`

Claude Code must not block the v1 screen on that future endpoint.

## Authorization Rules
Required principal:

- `role === "final_mile_courier"`.

Delivery access:

- `assignedFinalMileCourierId` must match principal user ID.
- If backend returns `FORBIDDEN`, clear detail cache for that delivery and route back to assignments with a non-sensitive error.
- If backend returns `NOT_FOUND`, clear detail cache and show not-found panel.
- If role is stale or missing, clear courier workspace cache and route to sign-in.

Allowed detail access:

- Assigned courier may see receiver name.
- Assigned courier may see receiver address or instructions when current delivery state supports final-mile handling.
- Assigned courier may initiate receiver contact only through the approved UI action and only when policy allows it.

Sensitive data boundaries:

- Do not show raw receiver phone as static text.
- Do not copy receiver phone to clipboard.
- Do not include receiver phone in analytics.
- Do not persist raw receiver phone in ordinary cache.
- Do not show OTP.
- Do not show package scan code.
- Do not show proof asset reference.
- Do not show exact GPS.
- Do not show internal actor IDs unless current user needs the fact of custody owner.

## Receiver Detail Policy
Receiver fields are operationally necessary but sensitive.

Display rules:

- Receiver name can appear in the receiver card.
- Receiver address can appear after assigned-courier authorization is confirmed.
- If the job is `assigned_for_final_mile`, address may be shown as `Destination instructions available after custody scan` unless product explicitly approves pre-custody address visibility.
- If custody is accepted or status is `out_for_delivery`, show address instructions.
- If status is closed, show address only when needed for dispute review and only if still assigned to the courier.

Phone rules:

- Show masked phone only, such as `+233 **** 0000`.
- Provide `Call receiver` or `Text receiver` only when the app can invoke the device contact action without rendering raw phone in the UI.
- Require explicit tap before contact action.
- Show a privacy note: `Use only for this delivery.`
- Disable receiver contact when delivery is not accepted, not out for delivery, closed, or reassigned.
- Do not keep receiver phone in offline cache unless secure storage with TTL exists.

Address rules:

- Show address text as delivery instructions, not as a permanent customer profile.
- Do not copy address to analytics or logs.
- Do not show exact GPS because backend does not provide it.
- If address is missing on a doorstep delivery, show an issue state and route to support or failed-attempt child flow as appropriate.

## Doorstep Policy Contract
Local policy facts:

- Doorstep delivery is limited to receiver addresses within `10km` of launch destination stations.
- Assignment requires paid delivery and collected doorstep surcharge.
- Receiver name and phone must be present before assignment.
- Address text or landmark must be present for doorstep.
- Courier must accept or reject assignment within `15 minutes`.
- Once accepted, courier should move delivery to `out_for_delivery` within `2 hours`.
- OTP is the default proof method.
- Signature or delivery photo are allowed fallback proof methods.
- One reattempt is allowed within `24 hours`.
- No cash collection is allowed in v1.

Detail-screen implications:

- Show `No cash collection` as a persistent safety line.
- Show proof expectation before courier reaches receiver.
- Show failed-attempt route when receiver is unavailable, unreachable, address is not found, location is unsafe, receiver refuses, proof fails, or package issue is detected.
- Do not show exact SLA countdown unless backend supplies exact timestamp.
- Label policy reminders as guidance when based only on docs.

## Handoff And Custody Rules
Custody model:

- Assignment is not custody.
- Custody moves to final-mile courier only after `accept_final_mile_assignment` succeeds.
- Receiver handoff is complete only with accepted OTP, signature, or delivery photo plus timestamp.
- Missing proof keeps handoff incomplete and should trigger review.

Detail states:

- `assigned_for_final_mile`: detail is a pre-custody dossier; primary action is accept scan.
- `out_for_delivery`: courier custody active; primary action is proof capture.
- `delivery_attempt_failed`: show attempt context when available, route to detail or return handling.
- `issue_reported`: show blocked state and route to issue.
- `on_hold`: show hold state and route to support.
- `delivered`: show completion summary without proof reference.

Disallowed:

- Detail screen must not move custody.
- Detail screen must not mark out for delivery.
- Detail screen must not complete delivery.
- Detail screen must not record failed attempt.

## Status And Next Action Matrix
| Backend status | Detail label | Custody label | Primary action | Primary route |
| --- | --- | --- | --- | --- |
| `assigned_for_final_mile` | `Assigned for doorstep delivery` | `Custody not accepted` | `Accept by scan` | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| `out_for_delivery` | `Out for delivery` | `Courier custody active` | `Complete handoff` | `/(ops)/courier/assignments/:deliveryId/proof` |
| `delivery_attempt_failed` | `Attempt recorded` | `Review next step` | `Review return path` | `/(ops)/courier/assignments/:deliveryId/return-to-station` |
| `issue_reported` | `Issue open` | `Paused for review` | `Open issue` | `/(ops)/courier/issues` |
| `on_hold` | `On hold` | `Paused` | `Contact support` | `/(ops)/courier/issues` |
| `delivered` | `Delivered` | `Receiver handoff complete` | `View completion` | none or completed screen |
| unknown | `Needs review` | `Do not act yet` | `Contact support` | `/(ops)/courier/issues` |

Secondary actions by state:

- `assigned_for_final_mile`: `Back to queue`, `Open support`.
- `out_for_delivery`: `Route`, `Record failed attempt`, `Open support`.
- `delivery_attempt_failed`: `Return to station`, `Open support`.
- `issue_reported`: `Open support`, `Back to queue`.
- `delivered`: `Back to completed`, `Back to queue`.

## Information Architecture
Top-level sections:

- Detail authority strip.
- Status and custody banner.
- Primary action footer.
- Receiver and destination card.
- Package verification card.
- Proof and completion expectations.
- Latest movement summary.
- Support and safety card.
- Offline and cache state.

Screen hierarchy:

1. `CourierAssignmentDetailScreen`
2. `CourierAssignmentDetailAuthorityStrip`
3. `CourierAssignmentStatusBanner`
4. `CourierAssignmentPrimaryActionFooter`
5. `CourierAssignmentReceiverCard`
6. `CourierAssignmentContactGate`
7. `CourierAssignmentPackageCard`
8. `CourierAssignmentProofPolicyCard`
9. `CourierAssignmentMovementSummary`
10. `CourierAssignmentSafetyCard`
11. `CourierAssignmentOfflinePanel`
12. `CourierAssignmentErrorPanel`

Primary path:

1. Courier opens detail from assignments.
2. Screen restores cached safe detail when available.
3. Screen fetches `get_delivery`.
4. Screen validates assigned courier scope through backend response.
5. Screen derives custody label and next action.
6. Courier reviews receiver, package, and instruction facts.
7. Courier taps primary action.
8. App routes to the child workflow.

## Data Model
Use a view model that separates backend detail from field-safe UI:

```ts
type CourierAssignmentDetailState =
  | { kind: "boot_loading" }
  | { kind: "ready"; model: CourierAssignmentDetailModel; sync: CourierAssignmentDetailSync }
  | { kind: "refreshing"; model: CourierAssignmentDetailModel; sync: CourierAssignmentDetailSync }
  | { kind: "offline_cached"; model: CourierAssignmentDetailModel; sync: CourierAssignmentDetailSync }
  | { kind: "stale_cache"; model: CourierAssignmentDetailModel; sync: CourierAssignmentDetailSync }
  | { kind: "not_found"; deliveryId: string }
  | { kind: "forbidden"; deliveryId: string }
  | { kind: "partial_failure"; model?: CourierAssignmentDetailModel; sync: CourierAssignmentDetailSync; requestId?: string }
  | { kind: "unsafe_to_act"; model: CourierAssignmentDetailModel; reason: string };

type CourierAssignmentDetailModel = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: string;
  statusLabel: string;
  paymentStatus: string;
  serviceType: string;
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  originStationId: string;
  destinationStationId: string;
  receiver: CourierReceiverView;
  package: CourierPackageView;
  custody: CourierCustodyView;
  latestMovement: CourierLatestMovementView;
  proofPolicy: CourierProofPolicyView;
  nextAction: CourierAssignmentDetailAction;
  secondaryActions: CourierAssignmentDetailAction[];
  privacy: CourierDetailPrivacyState;
};

type CourierReceiverView = {
  displayName: string;
  maskedPhone?: string;
  addressText?: string;
  addressVisibility: "visible" | "hidden_until_custody" | "missing" | "not_required";
  contactAvailability: "available" | "disabled_until_out_for_delivery" | "disabled_offline" | "not_supported";
};

type CourierPackageView = {
  description: string;
  weightKg: number;
  sizeTier: string;
  isFragile: boolean;
  declaredValueLabel: string;
};

type CourierCustodyView = {
  currentCustodyRole: string | null;
  currentCustodyActorMatchesCourier: boolean;
  label: string;
  riskLevel: "safe" | "needs_scan" | "blocked" | "complete" | "unknown";
};

type CourierProofPolicyView = {
  defaultMethod: "otp";
  fallbackMethods: Array<"signature" | "delivery_photo">;
  completionAllowedFromDetail: false;
  notes: string[];
};

type CourierAssignmentDetailAction = {
  type:
    | "accept_scan"
    | "start_out_for_delivery"
    | "open_route"
    | "proof"
    | "failed_attempt"
    | "issue"
    | "back_to_queue"
    | "completed"
    | "none";
  label: string;
  route?: string;
  enabled: boolean;
  disabledReason?: string;
};

type CourierDetailPrivacyState = {
  rawPhoneRendered: false;
  addressCached: boolean;
  phoneCached: boolean;
  analyticsSafe: boolean;
};

type CourierAssignmentDetailSync = {
  network: "online" | "offline" | "unknown";
  source: "network" | "local_cache" | "merged";
  lastSuccessfulFetchAt?: string;
  cacheAgeSeconds?: number;
  requestId?: string;
  queuedActionCount: number;
  hasConflict: boolean;
};
```

## Fetch Strategy
Initial load:

- Read route `deliveryId`.
- Restore sanitized cached detail if available.
- Fetch `GET /v1/deliveries/:deliveryId`.
- Replace cached data only after response validates.
- Recompute next action after every fetch.

Refresh:

- Pull-to-refresh calls `get_delivery`.
- Refresh on screen focus.
- Refresh after child workflow returns.
- Refresh after offline queue drains.
- Do not blank existing detail during refresh.

Cache:

- Key by `courierUserId` and `deliveryId`.
- Store non-sensitive package, status, station, and tracking data.
- Store receiver name because it is needed for field matching.
- Store address only if secure storage exists, current courier remains assigned, and delivery is active.
- Never store raw receiver phone in ordinary cache.
- Store masked receiver phone only.
- Clear cache on sign-out, role mismatch, forbidden response, or reassignment indication.

Staleness:

- Fresh: under `60 seconds`.
- Saved: under `10 minutes`.
- Stale: over `10 minutes`.
- Unsafe for action: over `2 hours` or after known queued conflict.

Offline:

- If cached safe detail exists, render it with saved-data label.
- Disable contact action if raw phone is not safely available.
- Disable mutation child routes unless the child route owns an offline queue contract.
- Keep support and back actions available.

## Component Specifications
### `CourierAssignmentDetailScreen`
Responsibility:

- Own route parsing, fetch, cache restore, privacy transformation, next-action derivation, and navigation.

Required behavior:

- Render `screen-courier-assignment-detail`.
- Require `final_mile_courier`.
- Fetch `get_delivery`.
- Verify returned delivery is assigned to current courier by trusting backend and checking `assignedFinalMileCourierId` when present.
- Transform receiver phone before rendering.
- Derive primary action.
- Route to child workflows.
- Never execute lifecycle mutation directly.

Test IDs:

- `screen-courier-assignment-detail`
- `courier-assignment-detail-loading`
- `courier-assignment-detail-ready`
- `courier-assignment-detail-error`
- `courier-assignment-detail-forbidden`
- `courier-assignment-detail-not-found`

### `CourierAssignmentDetailAuthorityStrip`
Responsibility:

- Show data source, freshness, conflict, and refresh state.

States:

- `Live detail`
- `Refreshing detail`
- `Saved detail`
- `Saved detail may be out of date`
- `Queued action waiting to sync`
- `Detail no longer available`

Actions:

- `Refresh`
- `Offline outbox`

Test IDs:

- `courier-assignment-detail-authority-strip`
- `courier-assignment-detail-refresh`
- `courier-assignment-detail-outbox-link`

### `CourierAssignmentStatusBanner`
Responsibility:

- Make status and custody impossible to miss.

Content:

- Status label.
- Tracking code.
- Custody label.
- Latest movement time.
- Payment state.

Visual states:

- Needs scan: amber.
- Courier custody active: deep green.
- Blocked: red.
- Complete: neutral green.
- Unknown: gray with warning icon.

Test IDs:

- `courier-assignment-status-banner`
- `courier-assignment-tracking-code`
- `courier-assignment-custody-label`

### `CourierAssignmentPrimaryActionFooter`
Responsibility:

- Keep the next safe action reachable.

Behavior:

- Sticky bottom action.
- One primary action only.
- Secondary actions in overflow or inline stack above footer.
- Disabled action must show exact reason.
- Footer must not cover content.

Primary actions:

- `Accept by scan`
- `Start delivery`
- `Open route`
- `Complete handoff`
- `Record failed attempt`
- `Open issue`
- `Back to queue`

Routing:

- Accept scan route for `assigned_for_final_mile`.
- Out-for-delivery route when custody is accepted but status is not out.
- Route screen after out-for-delivery when product needs navigation.
- Proof route for `out_for_delivery`.
- Failed-attempt route as secondary during out-for-delivery.

Test IDs:

- `courier-assignment-primary-action-footer`
- `courier-assignment-primary-action`
- `courier-assignment-secondary-actions`

### `CourierAssignmentReceiverCard`
Responsibility:

- Present receiver and destination instructions safely.

Content:

- Receiver display name.
- Masked phone when contact is permitted.
- Address or instruction text when visibility policy allows.
- Station-to-doorstep context.
- No cash collection reminder.

States:

- Address visible.
- Address hidden until custody.
- Address missing.
- Contact disabled until out for delivery.
- Contact available.

Test IDs:

- `courier-assignment-receiver-card`
- `courier-assignment-receiver-name`
- `courier-assignment-address`
- `courier-assignment-address-locked`
- `courier-assignment-contact-gate`

### `CourierAssignmentContactGate`
Responsibility:

- Prevent casual exposure of receiver phone.

Behavior:

- Show masked phone only.
- Primary action `Call receiver` appears only when allowed.
- Secondary action `Text receiver` appears only if platform and policy allow.
- On tap, open native dialer or SMS composer using receiver phone without rendering raw number.
- Show privacy note.
- Do not expose copy action.
- Do not include raw phone in error messages.

Disabled copy:

- `Contact unlocks after you start delivery.`
- `Reconnect before contacting the receiver.`
- `Receiver contact is unavailable for this status.`

Test IDs:

- `courier-assignment-call-receiver`
- `courier-assignment-text-receiver`
- `courier-assignment-contact-disabled-reason`

### `CourierAssignmentPackageCard`
Responsibility:

- Help courier verify the package before moving.

Content:

- Package description.
- Size tier.
- Weight.
- Fragile flag.
- Declared value label.
- Service type.
- Origin station.
- Destination station.

Do not show:

- Package scan code.
- Label QR content.
- Internal label binding.

Test IDs:

- `courier-assignment-package-card`
- `courier-assignment-package-description`
- `courier-assignment-fragile-flag`
- `courier-assignment-station-pair`

### `CourierAssignmentProofPolicyCard`
Responsibility:

- Tell courier what proof will be required before arrival.

Content:

- `OTP is the default proof.`
- `Fallback: signature or delivery photo when OTP cannot be completed.`
- `No cash collection.`
- `Proof is captured on the completion screen.`

Behavior:

- Link to proof screen only when status permits.
- Do not show OTP value.
- Do not show proof asset reference.

Test IDs:

- `courier-assignment-proof-policy-card`
- `courier-assignment-proof-default`
- `courier-assignment-proof-fallbacks`

### `CourierAssignmentMovementSummary`
Responsibility:

- Give enough status confidence without requiring full timeline.

Content from `get_delivery`:

- Latest event type.
- Latest event time.
- Latest touchpoint role.
- Latest touchpoint station.
- Created time.

Rules:

- Keep labels human-readable.
- Do not expose actor IDs.
- If full timeline is needed later, route to a dedicated custody chain or timeline screen.

Test IDs:

- `courier-assignment-movement-summary`
- `courier-assignment-latest-event`
- `courier-assignment-latest-touchpoint`

### `CourierAssignmentSafetyCard`
Responsibility:

- Provide operational guardrails.

Content:

- `Do not collect cash.`
- `Confirm package before leaving station.`
- `Use OTP first at handoff.`
- `Record a failed attempt if receiver cannot complete handoff.`
- `Open support for unsafe location or package issue.`

Test IDs:

- `courier-assignment-safety-card`
- `courier-assignment-open-support`

### `CourierAssignmentOfflinePanel`
Responsibility:

- Explain offline limitations.

Variants:

- Saved detail available.
- Saved detail stale.
- No saved detail.
- Queued action conflict.

Test IDs:

- `courier-assignment-offline-panel`
- `courier-assignment-cache-age`
- `courier-assignment-conflict-warning`

### `CourierAssignmentErrorPanel`
Responsibility:

- Recover from not found, forbidden, or fetch failure.

Variants:

- Not found.
- Outside courier scope.
- Network failure with cache.
- Network failure without cache.
- Unknown status.

Actions:

- `Back to assignments`
- `Retry`
- `Open support`

Test IDs:

- `courier-assignment-error-panel`
- `courier-assignment-retry`
- `courier-assignment-back-to-assignments`

## Visual Direction
The screen should feel like a trustworthy delivery dossier, not a cluttered receipt.

Art direction:

- Deep graphite text on warm off-white background.
- Strong status banner with restrained color.
- Receiver card uses controlled reveal styling.
- Package card feels tactile and scannable.
- Sticky action footer is confident and thumb-friendly.

Hierarchy:

- Status and next action dominate.
- Receiver instructions are second.
- Package facts are third.
- Policy and movement details are supporting.

Typography:

- Tracking code uses tabular numeric treatment.
- Status label uses bold operational type.
- Address text is readable and not overly decorative.
- Safety notes are short and direct.

Spacing:

- `20px` side padding on compact phones.
- `24px` side padding on larger phones.
- `8px` grid.
- `16px` between card sections.
- Primary footer target at least `52px` high.
- Secondary action targets at least `44px` high.

Motion:

- Status banner appears first.
- Cards enter in one soft stagger.
- Locked receiver info expands only after status change or refresh.
- Reduced motion removes stagger and expansion animation.

## Mobile Layout
Compact phones:

- Single column.
- Sticky footer.
- Receiver address can wrap to multiple lines.
- Package facts use two-column microgrid only if labels remain readable.
- Contact actions stack vertically.

Large phones:

- Package facts can use two-column grid.
- Safety card and movement summary can sit as adjacent cards only if text remains accessible.

Tablets:

- Keep centered detail column with max width.
- Do not add map split pane in v1.
- If route preview is later added, it must be a child screen or optional panel after proof of backend route data.

Safe areas:

- Sticky footer respects bottom safe area.
- Pull-to-refresh respects top safe area.
- Keyboard should not cover support note input if support route is later embedded.

## Accessibility
Required:

- Screen title identifies delivery detail and tracking code.
- Focus order follows status, receiver, package, proof, movement, safety, actions.
- Sticky footer focus appears after main content in logical order unless platform pattern requires otherwise.
- Contact action labels are descriptive.
- Locked address state is announced as locked until custody.
- Status changes are announced without taking focus.
- Error panels move focus to title.
- Touch targets meet product target of `44px` or more.
- Text scales to at least `200%`.
- Color is never the only status signal.
- Address text must be readable by screen reader only when visible to sighted users.

Screen reader label examples:

- Status banner: `{trackingCode}, {statusLabel}, {custodyLabel}, latest update {relativeTime}.`
- Receiver card: `Receiver {name}. Address {addressVisibility}. Contact {contactAvailability}.`
- Package card: `Package {description}, {weightKg} kilograms, {sizeTier}, fragile {yesOrNo}.`
- Primary action: `{label}. Opens {workflowName}.`

Do not:

- Add hidden raw phone text for accessibility.
- Add hidden OTP or scan code text.
- Put disabled controls before the explanation that makes them understandable.

## Offline And Low-Bandwidth Behavior
Offline with safe cache:

- Render saved detail.
- Show cache age.
- Show sensitive-data limitations.
- Keep `Back to assignments` available.
- Disable contact if raw phone is not available in secure session memory.
- Disable child workflows that cannot safely queue.

Offline with no detail cache:

- Show no saved detail panel.
- Provide retry.
- Provide back to assignments.

Stale cache:

- Show `Saved detail may be out of date`.
- Allow reading package and tracking facts.
- Gate address/contact based on sensitivity and age.
- Route to outbox if queued action exists.

Queued action conflict:

- Show conflict warning before primary action.
- Disable primary action if queued action may change status.
- Route to action recovery or outbox.

Low bandwidth:

- No images.
- No map tiles.
- No proof thumbnails.
- No polling loop.
- Use text-only detail and child routes.

## State Specifications
### `boot_loading`
Use when:

- No cache exists and first `get_delivery` fetch is running.

UI:

- Status skeleton.
- Receiver card skeleton without sensitive labels.
- Package card skeleton.
- Disabled footer.

### `ready`
Use when:

- `get_delivery` succeeded and delivery is assigned to the courier.

UI:

- Live detail authority strip.
- Status banner.
- Receiver and package cards.
- Primary action footer.

### `refreshing`
Use when:

- Existing detail is visible and refresh is in progress.

UI:

- Keep detail visible.
- Show refresh indicator.
- Disable contact only if stale or token changes.

### `offline_cached`
Use when:

- Cached detail exists and network is unavailable.

UI:

- Saved detail strip.
- Sensitive data follows cache policy.
- Outbox link visible if needed.

### `stale_cache`
Use when:

- Cached detail is older than freshness threshold.

UI:

- Stale banner.
- Hide or gate receiver address if secure TTL expired.
- Disable primary action if server confirmation is required.

### `not_found`
Use when:

- Backend returns `NOT_FOUND`.

UI:

- Explain detail is unavailable.
- Back to assignments.
- Clear cached row.

### `forbidden`
Use when:

- Backend returns `FORBIDDEN`.

UI:

- Explain assignment is outside current courier scope.
- Clear detail cache.
- Back to assignments.
- Do not show cached sensitive fields.

### `partial_failure`
Use when:

- Network fetch fails but cache exists.

UI:

- Keep cached detail.
- Error strip with retry.
- Request ID when available.

### `unsafe_to_act`
Use when:

- Detail is stale, queued action conflicts exist, status is unknown, or scope is uncertain.

UI:

- Keep safe facts visible.
- Disable primary action.
- Explain required recovery.

## Action Routing
Primary routes:

| Action type | Route |
| --- | --- |
| `accept_scan` | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| `start_out_for_delivery` | `/(ops)/courier/assignments/:deliveryId/out-for-delivery` |
| `open_route` | `/(ops)/courier/assignments/:deliveryId/route` |
| `proof` | `/(ops)/courier/assignments/:deliveryId/proof` |
| `failed_attempt` | `/(ops)/courier/assignments/:deliveryId/failed-attempt` |
| `issue` | `/(ops)/courier/issues` |
| `back_to_queue` | `/(ops)/courier/assignments` |

Route params:

- Pass `deliveryId`.
- Pass optional return route.
- Do not pass receiver phone.
- Do not pass address text.
- Do not pass OTP.
- Do not pass package scan code.
- Do not pass proof reference.

Primary action rules:

- `assigned_for_final_mile` routes to accept scan.
- Accepted custody but not out for delivery routes to out-for-delivery when status model supports that intermediate state.
- `out_for_delivery` routes to proof.
- Failed-attempt and blocked states route to issue, return, or detail recovery.
- Delivered state routes back to completed/history, not proof.

Secondary action rules:

- `Open route` appears only when status is out for delivery or address is visible.
- `Record failed attempt` appears only during active final-mile handling.
- `Open support` appears whenever detail is active or blocked.

## Error Handling
API errors:

- `NOT_FOUND`: clear cache and show not found.
- `FORBIDDEN`: clear cache and show outside-scope state.
- `UNAUTHORIZED`: clear courier workspace and route to sign-in.
- `NETWORK_ERROR`: use cache when safe.
- `RATE_LIMITED`: show retry after text when available.
- `INTERNAL`: show request ID and retry.

Data inconsistencies:

- Missing receiver name: show `Receiver name unavailable` and route to support.
- Missing address on doorstep delivery: show `Address instructions missing` and route to support.
- Missing package description: show `Package description unavailable` and require station support before custody acceptance.
- Missing assigned courier ID: treat as unsafe and return to queue.
- Current courier mismatch when field is present: clear cache and show forbidden.
- Unknown status: show needs review and disable direct lifecycle actions.

Do not:

- Show raw backend payload.
- Show stack traces.
- Show raw phone in error copy.
- Show full address after forbidden response.

## Content Design
Screen title:

- `Delivery detail`

Status copy:

- `Assigned for doorstep delivery`
- `Custody not accepted`
- `Courier custody active`
- `Out for delivery`
- `Issue open`
- `Delivered`
- `Needs review`

Receiver card:

- `Receiver`
- `Destination instructions`
- `Contact unlocks after you start delivery.`
- `Use receiver contact only for this delivery.`
- `Address instructions missing. Open support before leaving.`

Package card:

- `Package`
- `Fragile`
- `Not fragile`
- `Confirm this package before leaving station.`

Proof card:

- `Proof required`
- `Use OTP first.`
- `Fallback proof requires signature or delivery photo.`
- `No cash collection.`

Footer actions:

- `Accept by scan`
- `Start delivery`
- `Open route`
- `Complete handoff`
- `Record failed attempt`
- `Open issue`
- `Back to assignments`

Offline copy:

- `Saved detail may be out of date. Reconnect before changing custody.`
- `No saved detail is available for this delivery.`

## Analytics
Emit sanitized events only.

Events:

- `courier_assignment_detail_viewed`
- `courier_assignment_detail_refreshed`
- `courier_assignment_detail_refresh_failed`
- `courier_assignment_primary_action_opened`
- `courier_assignment_secondary_action_opened`
- `courier_assignment_contact_attempted`
- `courier_assignment_address_visible`
- `courier_assignment_sensitive_field_gated`
- `courier_assignment_offline_cache_rendered`
- `courier_assignment_forbidden`
- `courier_assignment_not_found`
- `courier_assignment_unknown_status_seen`

Allowed properties:

- `delivery_id_hash`
- `tracking_code_hash`
- `status`
- `next_action`
- `network_state`
- `cache_age_bucket`
- `address_visibility`
- `contact_availability`
- `has_queued_action`
- `request_id`

Forbidden properties:

- Raw delivery ID.
- Raw tracking code.
- Receiver phone.
- Receiver address.
- Receiver full name.
- OTP.
- Package scan code.
- Proof reference.
- GPS.
- Actor IDs.

## Security And Privacy
Data minimization:

- Render only fields needed for the courier's current delivery task.
- Transform phone before any UI render.
- Avoid displaying sensitive fields in notification previews.
- Avoid logging sensitive fields in breadcrumbs.

Cache:

- Use courier-scoped cache key.
- Clear on sign-out, role mismatch, forbidden, reassignment, and completion TTL expiry.
- Store phone only as masked text unless secure session storage is explicitly implemented.
- Store address only with TTL and only for active assigned delivery.

Contact:

- No clipboard action for phone or address in v1.
- Native contact action must not log phone.
- Contact action should be hidden from screenshots if platform supports privacy shield in future.

Display:

- In public spaces, receiver card should not expose phone by default.
- Full address should sit below the fold when status is pre-custody unless product approves otherwise.

## Performance Requirements
Targets:

- Cached first paint under `500ms`.
- Live detail fetch under `2s` on normal 4G.
- No map tile load.
- No proof media load.
- No large image decode.
- Smooth scroll at `60fps` where practical.

Implementation rules:

- Derive view model once per response.
- Avoid formatting date and money repeatedly in render.
- Keep sticky footer outside scroll layout churn.
- Do not fetch timeline unless future spec requires it.
- Do not poll while screen is backgrounded.

## QA Acceptance Criteria
Functional:

- Route renders `screen-courier-assignment-detail`.
- Screen reads `deliveryId` from route.
- Screen calls `get_delivery`.
- Screen handles loading, ready, refreshing, offline, stale, not found, forbidden, and partial failure.
- Screen derives correct primary action by status.
- Primary action routes to correct child workflow.
- Secondary failed-attempt action appears only when appropriate.
- Support action carries delivery context without sensitive query params.
- Returning from child workflow refreshes detail.

Authorization:

- Assigned courier can view detail.
- Different courier receives forbidden state.
- Missing role routes to sign-in.
- Forbidden response clears sensitive cache.

Privacy:

- Raw receiver phone is never rendered.
- Receiver phone is never copied.
- Receiver phone is not logged.
- Address is gated according to custody and cache policy.
- OTP is never rendered.
- Package scan code is never rendered.
- Proof reference is never rendered.
- Exact GPS is never rendered.

Offline:

- Safe cached detail renders offline.
- Stale cache gates unsafe actions.
- No-cache offline state appears.
- Queued action conflict disables unsafe primary action.
- Outbox link appears when relevant.

Accessibility:

- Status banner has descriptive label.
- Receiver card headings are clear.
- Contact disabled reason is announced.
- Primary footer action is reachable and named.
- Error states move focus to error title.
- Text scaling does not hide primary action.

Mutation boundary:

- Detail screen does not call `accept_final_mile_assignment`.
- Detail screen does not call `mark_out_for_delivery`.
- Detail screen does not call `complete_delivery`.
- Detail screen does not call `record_failed_attempt`.

## Automated Test Plan
Unit tests:

- `deriveCourierAssignmentDetailState`
- `buildCourierAssignmentDetailModel`
- `deriveCourierAssignmentDetailAction`
- `deriveReceiverAddressVisibility`
- `deriveReceiverContactAvailability`
- `maskReceiverPhoneForCourier`
- `sanitizeCourierAssignmentDetailCache`
- `buildCourierAssignmentDetailAnalyticsPayload`

Unit assertions:

- `assigned_for_final_mile` maps to accept scan.
- `out_for_delivery` maps to proof.
- `issue_reported` maps to issue.
- Unknown status disables direct lifecycle action.
- Raw phone is never returned by view model display fields.
- Address is gated when status and custody do not allow it.
- Cache sanitizer strips raw phone, OTP, scan code, proof reference, and GPS.
- Analytics hashes identifiers and omits sensitive fields.

Component tests:

- Renders `screen-courier-assignment-detail`.
- Shows loading state.
- Shows ready state.
- Shows receiver card with masked phone.
- Hides raw phone.
- Shows address visible state when allowed.
- Shows address locked state when required.
- Shows package card.
- Shows proof policy card.
- Routes primary action to accept scan.
- Routes primary action to proof for out-for-delivery.
- Shows forbidden panel.
- Shows not found panel.
- Shows offline cached panel.

Integration tests:

- Stub `get_delivery` for assigned courier.
- Stub `get_delivery` forbidden for different courier.
- Stub network failure after cache.
- Stub stale cache and verify unsafe action disabled.
- Return from child workflow triggers refresh.
- Contact action does not render raw phone.

End-to-end checks:

- Courier opens assignments.
- Courier opens one detail.
- Courier sees status, receiver, package, and proof expectations.
- Courier taps accept scan for assigned job.
- Courier returns after custody acceptance and detail refreshes.
- Courier starts delivery and sees proof as next action.

## Implementation Notes For Claude Code
Build this as a production contract screen, not a decorative detail page.

Likely implementation files:

- Route file for `/(ops)/courier/assignments/:deliveryId`.
- `CourierAssignmentDetailScreen`.
- Receiver card component.
- Package card component.
- Proof policy card component.
- Status banner component.
- Sticky action footer component.
- Detail data hook.
- Detail view-model utilities.
- Detail cache sanitizer.
- Tests for utilities and screen states.

Use current backend:

- `GET /v1/deliveries/:id`.
- `deliveryDetailResponseSchema`.
- `assertCanAccessDelivery` scope.

Do not invent backend data:

- No route polyline.
- No live ETA.
- No exact SLA due time.
- No issue summary unless separate query is added.
- No proof readiness beyond documented proof policy.

Use optional enhancement only:

- Future `contactPolicy`.
- Future `nextAction`.
- Future `openIssueSummary`.
- Future `assignmentAcceptedAt`.

## Open Questions
None block v1 implementation.

Non-blocking product questions:

- Should full address be visible before custody acceptance, or only after scan?
- Should receiver contact require out-for-delivery status, or is accepted custody enough?
- Should a future contact proxy hide receiver phone from the device dialer?
- Should detail include a timeline preview once `get_delivery_timeline` is wired into courier screens?
- Should address cache use secure storage only, or should it require live network every time?

V1 default decision:

- Address can be displayed only after assigned-courier authorization is confirmed and according to custody policy.
- Raw phone is never rendered.
- Contact action is gated and uses the phone only at the moment of explicit courier action.
- Mutations remain in child workflows.

## Definition Of Done
The screen is complete when:

- It renders at `/(ops)/courier/assignments/:deliveryId`.
- It exposes `screen-courier-assignment-detail`.
- It fetches `get_delivery`.
- It handles assigned-courier scope, forbidden, not found, and stale cache.
- It shows status, custody, receiver, destination, package, proof policy, and latest movement.
- It masks receiver phone and gates contact.
- It applies address visibility rules.
- It routes every lifecycle action to child workflows.
- It never directly performs custody, out-for-delivery, proof, or failed-attempt mutations.
- It never renders OTP, package scan code, proof reference, or exact GPS.
- It passes accessibility, privacy, offline, and route tests.

## Final Build Instruction
Build `CourierAssignmentDetail` as the courier's verified field dossier for one assigned doorstep delivery. It must use `get_delivery`, enforce assigned-courier scope, show the information needed to avoid loss of goods, gate receiver-sensitive details, keep lifecycle mutations in child workflows, and remain usable with saved data while clearly warning when offline or stale state makes action unsafe.
