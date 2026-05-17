# Handoff Rules

## Principle
No handoff should rely on memory, paper alone, or verbal confirmation.

## Required Handoff Types
- Sender to origin station.
- Origin station to driver.
- Driver to destination station.
- Destination station to final-mile courier.
- Final-mile courier to receiver.

## Minimum Evidence By Handoff
### Sender to origin station
- Package ID.
- Sender confirmation.
- Intake timestamp.

### Origin station to driver
- Scan of package ID.
- Driver confirmation.
- Dispatch timestamp.

### Driver to destination station
- Arrival confirmation.
- Receipt scan.
- Condition check.

### Final-mile delivery
- Receiver name or identity confirmation where appropriate.
- Signature, photo, OTP, or equivalent proof.

## Business Rule
If proof is missing, the handoff remains operationally incomplete and should trigger review rather than silent success.

## Backend Enforcement Model
- Origin intake reserves the package scan code in `package_labels` for one delivery only.
- Later staff or courier scans must match that immutable delivery-label binding before a handoff can proceed.
- Station dispatch does not transfer custody by itself; it records that the package is ready for the assigned driver.
- Origin-station to driver custody transfers only when the assigned driver confirms pickup with the registered package scan code.
- Destination-station to final-mile custody transfers only when the assigned courier accepts the assignment with the registered package scan code.
- Receiver OTP proof must use the active delivery-scoped receiver verification token generated from the receiver phone challenge.

## Approved V1 Decisions
### Confirmation Model
- Staff-to-staff handoffs require confirmation from both parties whenever both are physically present.
- Sender-to-station handoff requires station confirmation and sender acknowledgement through the app or printed receipt.
- Final-mile completion requires courier confirmation plus one strong receiver proof method.
- Assignment is not custody. Custody moves only after the receiving party confirms the handoff with the registered package scan code or accepted receiver proof.

### Required Proof By Handoff
| Handoff | Required Proof |
| --- | --- |
| Sender -> Origin Station | package ID, intake timestamp, sender acknowledgement |
| Origin Station -> Driver | package scan, driver confirmation, dispatch timestamp |
| Driver -> Destination Station | package scan, destination operator confirmation, condition check |
| Destination Station -> Final-Mile Courier | package scan from assigned courier, courier confirmation, assignment timestamp |
| Final-Mile Courier -> Receiver | verified receiver OTP token, signature, or delivery photo plus timestamp |

### Fallback Rule
- If scan hardware or network fails, the handoff may proceed only with:
  - manual package ID entry
  - receiving-party confirmation
  - supervisor PIN override
  - automatic `fallback_used=true` flag on the event

### Liability Rule
- The last fully confirmed custodian remains accountable by default.
- When a fallback handoff is used, accountability shifts jointly to the receiving role and the authorizing supervisor until a later fully confirmed handoff occurs.

## Baseline Status
This file is now concrete enough to drive scan flows, audit rules, and dispute handling in v1.
