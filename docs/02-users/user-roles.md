# User Roles

## Sender
The sender is the commercial initiator of the delivery.

### Responsibilities
- Create the delivery request.
- Provide package details and receiver details.
- Choose service type.
- Pay or confirm payment method.
- Track the delivery and raise issues when needed.

### Product Needs
- Clear pricing.
- Clear progress visibility.
- Easy support access.

## Driver
The driver handles the intercity or inter-station movement of packages.

### Responsibilities
- Accept assigned package runs.
- Confirm pickup from origin station.
- Update progress while in transit.
- Handoff packages at the destination station.

### Product Needs
- Assignment clarity.
- Low-friction progress updates.
- Route support and earnings visibility.

## Station Operator
The station operator is the operational backbone of the network.

### Responsibilities
- Receive and verify packages.
- Assign drivers for outgoing packages.
- Confirm dispatch and receipt.
- Assign final-mile delivery when needed.
- Report damages, missing items, or exceptions.

### Product Needs
- Queue management.
- Fast scanning and confirmation flows.
- Clear distinction between incoming and outgoing work.

## Doorstep Delivery Personnel
This role handles the final step from station to receiver.

### Responsibilities
- Accept final-mile assignments.
- Navigate to delivery address.
- Contact receiver if needed.
- Capture proof of delivery or failed attempt details.

### Product Needs
- Simple mobile workflow.
- Navigation support.
- Strong proof capture.

## Admin
The admin role exists to keep the network controlled, measurable, and improvable.

### Responsibilities
- Manage people, stations, and system configuration.
- Monitor delivery health and station performance.
- Resolve escalations and disputes.
- Review finance and analytics.

## Approved V1 Decisions
- Receivers are not a first-class authenticated product role in v1.
- The sender remains the primary customer account holder.
- Receivers may access limited delivery information through a secure delivery link and phone verification where required.
- Receiver-facing access is limited to:
  - viewing public tracking status
  - seeing pickup or doorstep instructions
  - presenting OTP for pickup or delivery completion
  - contacting support through the linked delivery context
- Receivers do not get:
  - persistent delivery history
  - payment visibility beyond the narrow delivery context
  - refund controls
  - account-level settings or profile management

## Approved Admin Subroles
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

## Permission Boundary Rule
- Operational roles can act only inside active assignment or station scope.
- Finance roles can execute refunds and review reconciliation but cannot change custody states.
- Support roles can review and manage issue workflows but cannot execute payments or transport overrides.
- Super admins manage user provisioning, emergency access, and privileged configuration.

## Staff Onboarding And Offboarding
- Staff accounts are provisioned by admin, not self-registered.
- Every staff account must have:
  - full name
  - phone number
  - role
  - station assignment or admin subrole
  - activation date
- Offboarding requires same-day account deactivation and session revocation.
- Role or station changes must be logged as auditable admin actions.

## Baseline Status
This file is now concrete enough to support provisioning, role split, and operational accountability.
