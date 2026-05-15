# Permissions Matrix

| Capability | Sender | Driver | Station Operator | Doorstep Personnel | Admin |
| --- | --- | --- | --- | --- | --- |
| Create delivery | Yes | No | Assisted only | No | Yes |
| Edit delivery before intake | Yes | No | Limited | No | Yes |
| View own delivery timeline | Yes | Assigned only | Station scoped | Assigned only | Yes |
| Confirm origin intake | No | No | Yes | No | Yes |
| Assign driver | No | No | Yes | No | Yes |
| Confirm driver pickup | No | Yes | Yes | No | Yes |
| Update in-transit progress | No | Yes | No | No | Yes |
| Confirm destination receipt | No | No | Yes | No | Yes |
| Assign final-mile courier | No | No | Yes | No | Yes |
| Confirm final delivery | No | No | Limited override | Yes | Yes |
| Report issue | Yes | Yes | Yes | Yes | Yes |
| View finance summary | Own only | Own only | Station summary | Own only | Yes |
| Manage users and roles | No | No | No | No | Yes |
| Manage stations and settings | No | No | No | No | Yes |

## Authorization Principles
- Nobody should see more than they need to complete their job.
- Station operators should not gain system-wide visibility by default.
- Customers should never see internal notes, fraud flags, or staff-only issue threads.
- Receivers are not a full authenticated role in v1 and therefore use delivery-scoped public access instead of this matrix.

## Backend-Enforced Action Rules
### Sender
- may create deliveries
- may edit deliveries only before origin intake
- may view only own deliveries, payments, receipts, and issues
- may cancel only inside policy window
- may share secure tracking links

### Driver
- may view only assigned runs and own earnings
- may confirm pickup only for assigned manifest items
- may update in-transit state and delay reasons for assigned runs
- may not reassign deliveries or edit payment data

### Station Operator
- may intake, assign, dispatch, receive, and route deliveries inside own station scope
- may create issue records and move deliveries into pickup or issue workflow
- may not change pricing rules, refund policy, or global settings

### Doorstep Personnel
- may accept assigned final-mile jobs
- may mark out-for-delivery, failed attempt, delivered, or returned-to-station for assigned jobs only
- may not see unrelated deliveries or payment internals

### Admin
- `ops_admin`: global operational read, reassignment, station-level override, issue resolution
- `finance_admin`: global payment and refund read, refund execution, reconciliation review
- `support_admin`: issue queue access, support-note access, no payment execution, no transport override
- `super_admin`: user and role management plus all privileged actions

## Scope Rules
- Station operators are `station-scoped` only.
- Drivers and doorstep couriers are `assignment-scoped` only.
- Support admins are `network-scoped` for issues and delivery summaries, but not for raw proof assets unless needed for an active case.
- Finance admins are `network-scoped` for payments, refunds, and reconciliation records, but not for operational queue editing.

## Override Logging Rule
- Every admin override must capture:
  - actor ID
  - admin subrole
  - target delivery or payment ID
  - old value
  - new value
  - reason code
  - free-text note
  - timestamp

## Data Access Rule
- Phone numbers must be masked in non-essential list views.
- Proof images and signatures are visible only to:
  - assigned operational actor during active handling
  - support admin on active case
  - ops admin on investigation
- Payment references are visible in full only to finance admins and the sender tied to the payment.

## Baseline Status
This permission matrix is now concrete enough for backend authorization, admin tooling, and UI gating.
