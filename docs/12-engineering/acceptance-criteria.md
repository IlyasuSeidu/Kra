# Acceptance Criteria

## Core Delivery Acceptance
- Sender can create a delivery with required details.
- Origin station can intake and confirm a package.
- Driver can be assigned, then custody transfers only after assigned-driver scan confirmation.
- Destination station can confirm receipt.
- Final-mile courier can be assigned, then custody transfers only after assigned-courier scan confirmation.
- Final-mile courier or destination station can complete delivery only with verified receiver OTP token, uploaded signature proof, or uploaded delivery-photo proof.

## Trust Acceptance
- Sender can view a timeline.
- Payment record is attached to the delivery.
- Audit history exists for each major lifecycle event.
- Every staff-to-staff custody transfer has an immutable package-label match and handoff event.

## Admin Acceptance
- Admin can search any delivery and view current state, payment state, and issue state.
- Finance admin can update active route pricing without redeploying any app.
- New deliveries quote from the active backend pricing rule, while existing deliveries keep their original locked quote.

## Non-Functional Acceptance
- Core workflows work on common mobile device sizes.
- Critical actions are logged.
- Permission boundaries are enforced for role-sensitive flows.

## Feature Acceptance Owners
- sender flows: `product owner`
- station and driver flows: `ops_admin`
- payments and refunds: `finance_admin`
- admin and support tools: `support_admin`
- technical quality and security: `technical owner`

## Pilot Metrics
- successful end-to-end dry run at all launch stations
- payment confirmation before transport for `100%` of paid flows
- proof capture on `>= 98%` of completed final-mile jobs
- package scan match rate on custody handoffs `>= 99%`

## Explicit Launch Blockers
- any unresolved `P1`
- payment state can bypass dispatch gate
- station cannot intake or dispatch reliably
- missing audit history on core transitions
- package scan code can be reused across deliveries
- assignment can move custody without receiving-party confirmation
- OTP completion can bypass receiver phone verification
- broken sender tracking timeline
- incomplete or directly client-writable active pricing rules
- `GET /v1/admin/launch-readiness` returns `blocked`

## Baseline Status
This file is now concrete enough to support sign-off and launch gating.
