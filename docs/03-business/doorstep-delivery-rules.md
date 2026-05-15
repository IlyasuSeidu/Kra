# Doorstep Delivery Rules

## Purpose
Doorstep delivery extends the network from destination-station receipt to receiver completion without breaking custody, payment control, or proof standards.

## V1 Serviceability Decision
- Doorstep delivery is included in the v1 pilot.
- It is available only after confirmed destination-station receipt.
- It is limited to receiver addresses within `10km` of:
  - `ST-ACC-01` Accra Central
  - `ST-KMS-01` Kumasi Adum
  - `ST-TML-01` Tamale Central
- It is not available for:
  - addresses outside the `10km` zone
  - deliveries missing a receiver phone number
  - deliveries missing usable address or landmark instructions
  - manual-quote packages
  - deliveries already moved into return-to-sender or dispute-only handling

## Assignment Preconditions
- `payment_status` must be `paid`.
- `delivery_status` must be `received_at_destination` or `awaiting_final_mile_assignment`.
- `doorstep_requested` must be `true`.
- The receiver name and phone number must be present.
- Address text or a recognizable landmark description must be present.
- The doorstep surcharge must already be collected before courier assignment.

## Assignment And Attempt SLA
- If a package reaches the destination station before `15:00` local time and courier capacity exists, the system should target same-day final-mile assignment.
- If it reaches the destination station at or after `15:00`, the default target is next-business-day assignment.
- A courier must accept or reject an assignment within `15 minutes`.
- If the courier does not accept in time, the job returns to `awaiting_final_mile_assignment`.
- Once accepted, the courier should move the delivery to `out_for_delivery` within `2 hours` unless the station supervisor reassigns the job.

## Proof And Completion Policy
- `OTP` is the default proof method for v1 final-mile completion.
- If OTP cannot be completed, the courier may use exactly one approved fallback:
  - receiver signature
  - delivery photo showing the handoff
- Every non-OTP completion must store:
  - `proof_fallback_reason`
  - receiver name
  - completion timestamp
- GPS should be captured automatically when the device allows it.
- If GPS cannot be captured, completion is allowed only when `gps_unavailable=true` is stored.
- A delivery cannot be marked `delivered` without one accepted proof method plus a timestamp.

## Failed Attempt Policy
Allowed structured failure reasons in v1:
- `receiver_unreachable`
- `receiver_unavailable`
- `address_not_found`
- `unsafe_to_complete`
- `receiver_refused`
- `proof_failed`
- `package_issue_detected`

Operational rules:
- After a failed attempt, the receiver must be notified and the failed reason must be written to the timeline.
- One reattempt is allowed within `24 hours` of the first failed doorstep attempt.
- The first reattempt does not create a new doorstep surcharge.
- After the second failed doorstep attempt, the courier must return the package to the destination station and the delivery moves to `awaiting_receiver_pickup`.
- A simple failed doorstep attempt must not set the canonical status to `delivery_failed`.
- If the receiver refuses the package, the delivery moves to `issue_reported` until station review decides pickup, return-to-sender, or dispute outcome.

## Finance And Payment Rule
- Final-mile charges are prepaid before assignment.
- No cash collection is allowed during final-mile completion in v1.
- If doorstep delivery is converted to station pickup without any valid doorstep attempt, the full doorstep surcharge is refundable.
- If at least one valid doorstep attempt occurs, the doorstep surcharge is treated as consumed operationally and is not auto-refunded.

## Liability Rule
- Once the destination station hands the package to the final-mile courier through a confirmed handoff, the courier is accountable until:
  - successful delivery with accepted proof, or
  - confirmed return handoff back to the destination station
- If fallback proof is used, the proof remains operationally valid unless fraud or coercion is later substantiated.
- Missing, damaged, or disputed packages after confirmed final-mile handoff are investigated first against the courier’s custody period.

## Customer Communication Rule
- Sender and receiver must both be notified when:
  - final-mile assignment is created
  - the package is `out_for_delivery`
  - a failed attempt is recorded
  - the package is returned to pickup flow

## Baseline Status
This file is now concrete enough to drive final-mile assignment, proof capture, failed-attempt handling, customer messaging, and refund logic for v1.
