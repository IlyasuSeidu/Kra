# Firestore Schema

## Primary Collections
- `users`
- `stations`
- `routes`
- `deliveries`
- `packages`
- `handoff_events`
- `payments`
- `proof_assets`
- `support_issues`
- `notifications`
- `outbound_notifications`
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
- reconciliation field `reconciliationAttemptCount`
- reconciliation field `nextReconciliationAt`
- reconciliation field `lastReconciliationAt`
- reconciliation field `reconciliationReviewRequiredAt`
- reconciliation field `reconciliationReviewReason`
- reconciliation field `lastReconciliationError`
- unresolved pending payments move to finance review after the `5m`, `15m`, and `30m` verification checkpoints are exhausted

### `proof_assets/{proofAssetId}`
- delivery ID and fallback proof type
- upload status: `pending_upload`, `uploaded`, `attached`, or `rejected`
- Cloud Storage bucket and object path
- content type, byte size, SHA-256 hash, and storage generation where available
- actor that requested the upload intent
- upload expiry, uploaded timestamp, and attached timestamp
- direct Firestore client access is blocked; proof metadata is exposed only through backend APIs

### `support_issues/{issueId}`
- issue status, category, severity, and linked delivery

### `outbound_notifications/{outboundNotificationId}`
- channel, provider, and notification kind
- delivery ID and dedupe key
- recipient destination, such as receiver phone
- provider payload fields needed to retry safely
- `pending`, `sent`, `failed`, or `dead_letter` status
- attempt count, next attempt time, sent time, and last error metadata

### `audit_events/{eventId}`
- admin and privileged-action audit records

## Query And Index Strategy
- compound indexes required for:
  - `deliveries` by `senderId + createdAt`
  - `deliveries` by `originStationId + currentStatus`
  - `deliveries` by `destinationStationId + currentStatus`
  - `payments` by `providerReference`
  - `payments` by `status + nextReconciliationAt`
  - `payments` by `status + reconciliationReviewRequiredAt`
  - `payments` by `reconciliationReviewReason + reconciliationReviewRequiredAt`
  - `support_issues` by `status + severity + createdAt`
  - `outbound_notifications` by `dedupeKey`
  - `outbound_notifications` by `status + nextAttemptAt`
- station queues query only current delivery summary, not full event collections

## Partition And Archive Rule
- Active delivery documents stay in primary collections.
- Closed deliveries older than `90 days` may be archived into cheaper historical collections while keeping summary references searchable.
- Event collections remain immutable and may be retained longer than hot query windows.

## Security Alignment Rule
- Client writes to `events`, `payments`, `outbound_notifications`, and `audit_events` are blocked.
- Client reads are limited by sender ownership, assignment scope, or station scope.

## Baseline Status
This file is now concrete enough to guide Firestore implementation and index planning.
