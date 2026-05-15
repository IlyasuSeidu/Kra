# Firestore Schema

## Primary Collections
- `users`
- `stations`
- `routes`
- `deliveries`
- `packages`
- `handoff_events`
- `payments`
- `support_issues`
- `notifications`
- `ratings`

## Suggested Document Shape
### `deliveries/{deliveryId}`
- core delivery summary
- current status
- route info
- payment summary
- latest event metadata

### `handoff_events/{eventId}`
- delivery ID
- from role and actor
- to role and actor
- proof references
- timestamp

## Projection Strategy
Store current delivery summary on the delivery document and keep detailed history in append-only event collections.

## Approved V1 Document Shapes
### `deliveries/{deliveryId}`
- delivery summary
- sender and receiver references
- route and service data
- materialized status fields
- latest event metadata

### `deliveries/{deliveryId}/events/{eventId}`
- immutable delivery events

### `packages/{packageId}`
- package detail keyed by delivery

### `payments/{paymentId}`
- payment summary and provider mapping

### `support_issues/{issueId}`
- issue status, category, severity, and linked delivery

### `audit_events/{eventId}`
- admin and privileged-action audit records

## Query And Index Strategy
- compound indexes required for:
  - `deliveries` by `senderId + createdAt`
  - `deliveries` by `originStationId + currentStatus`
  - `deliveries` by `destinationStationId + currentStatus`
  - `payments` by `providerReference`
  - `support_issues` by `status + severity + createdAt`
- station queues query only current delivery summary, not full event collections

## Partition And Archive Rule
- Active delivery documents stay in primary collections.
- Closed deliveries older than `90 days` may be archived into cheaper historical collections while keeping summary references searchable.
- Event collections remain immutable and may be retained longer than hot query windows.

## Security Alignment Rule
- Client writes to `events`, `payments`, and `audit_events` are blocked.
- Client reads are limited by sender ownership, assignment scope, or station scope.

## Baseline Status
This file is now concrete enough to guide Firestore implementation and index planning.
