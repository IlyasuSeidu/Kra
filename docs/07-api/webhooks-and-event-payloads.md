# Webhooks And Event Payloads

## Purpose
This file defines how provider callbacks enter the system and how internal event payloads are normalized for reliable processing in v1.

## Inbound Provider Webhook Endpoints
- `POST /v1/webhooks/payments/mtn-momo`
- `POST /v1/webhooks/payments/paystack`
- `POST /v1/webhooks/payments/hubtel`

Launch rule:
- `MTN MoMo` is the only live production payment callback in the pilot.
- `Paystack` and `Hubtel` endpoints may exist as contract stubs but should remain disabled until the provider is enabled.

## Inbound Verification And Acknowledgement Rules
- The raw request body must be preserved for verification.
- Provider signature must be verified before the webhook is treated as trusted.
- If a provider does not support a trusted signature, the backend must call the provider verification endpoint before changing payment state.
- Invalid signatures return `401` and are logged with `WEBHOOK_SIGNATURE_INVALID`.
- Provider delivery semantics are treated as `at-least-once`.
- The endpoint must be idempotent on `provider_reference + event_type`.
- A verified inbound webhook must be written to durable storage before a `200` response is returned.
- A duplicate verified webhook should return `200` with no second state mutation.
- If a verified webhook cannot be matched to an internal payment or delivery reference, it must still be persisted and acknowledged with `200`; it should not be rejected back to the provider after trust has been established.

## Durable Ingestion Record
Every verified inbound webhook must first be normalized into `provider_webhook_events` with at least:
- internal event record ID
- provider name
- provider event ID if supplied
- provider reference
- event type
- raw payload
- normalized payload
- signature verification result
- received timestamp
- matched payment ID if available
- matched delivery ID if available
- processing status
- retry count

## Internal Processing Retry Policy
- After durable persistence, internal processing retries on failure using this schedule:
  - attempt 1: immediate
  - attempt 2: `1 minute`
  - attempt 3: `5 minutes`
  - attempt 4: `30 minutes`
  - attempt 5: `2 hours`
- After the fifth failed internal processing attempt, the record moves to a dead-letter state for manual review.
- Dead-letter payment events must raise a finance and backend alert on the same business day.

## Shared Internal Event Envelope
All internal events should use this envelope:

```json
{
  "eventId": "EVT-INT-001",
  "eventType": "delivery.status_changed",
  "eventVersion": 1,
  "source": "delivery-service",
  "occurredAt": "2026-04-23T10:15:00Z",
  "data": {}
}
```

## Canonical Inbound Payment Event Schema
```json
{
  "provider": "mtn_momo",
  "providerEventId": "EVT-001",
  "providerReference": "PROV-123",
  "paymentId": "PAY-001",
  "deliveryId": "DEL-001",
  "eventType": "payment.confirmed",
  "amount": 35,
  "currency": "GHS",
  "status": "confirmed",
  "occurredAt": "2026-04-23T10:00:00Z"
}
```

## Canonical Internal Event Schemas
### `delivery.status_changed`
```json
{
  "eventId": "EVT-INT-101",
  "eventType": "delivery.status_changed",
  "eventVersion": 1,
  "source": "delivery-service",
  "occurredAt": "2026-04-23T10:15:00Z",
  "data": {
    "deliveryId": "DEL-001",
    "previousStatus": "received_at_origin",
    "newStatus": "assigned_to_driver",
    "actorId": "USR-OP-001",
    "actorRole": "station_operator",
    "stationId": "ST-ACC-01"
  }
}
```

### `payment.status_changed`
```json
{
  "eventId": "EVT-INT-102",
  "eventType": "payment.status_changed",
  "eventVersion": 1,
  "source": "payments-service",
  "occurredAt": "2026-04-23T10:20:00Z",
  "data": {
    "paymentId": "PAY-001",
    "deliveryId": "DEL-001",
    "previousStatus": "pending",
    "newStatus": "confirmed",
    "provider": "mtn_momo",
    "providerReference": "PROV-123"
  }
}
```

### `payment.refund_status_changed`
```json
{
  "eventId": "EVT-INT-103",
  "eventType": "payment.refund_status_changed",
  "eventVersion": 1,
  "source": "payments-service",
  "occurredAt": "2026-04-23T12:10:00Z",
  "data": {
    "refundId": "REF-001",
    "paymentId": "PAY-001",
    "deliveryId": "DEL-001",
    "previousStatus": "requested",
    "newStatus": "completed",
    "amount": 15,
    "currency": "GHS"
  }
}
```

### `issue.created`
```json
{
  "eventId": "EVT-INT-104",
  "eventType": "issue.created",
  "eventVersion": 1,
  "source": "support-service",
  "occurredAt": "2026-04-23T10:25:00Z",
  "data": {
    "issueId": "ISS-001",
    "deliveryId": "DEL-001",
    "severity": "p2",
    "category": "delay",
    "createdByRole": "sender"
  }
}
```

## Ownership And Replay Rule
- Backend engineering owns webhook ingestion, idempotency, retry behavior, and replay tooling.
- Finance owns daily review of unmatched, disputed, or dead-letter payment events.
- Operations owns delivery-side investigation when a verified payment event conflicts with delivery state.
- Replay must only be triggered from admin tooling against the durable stored record; raw inbound payloads must remain immutable.

## Outbound Webhook Rule
- Kra does not expose customer or partner outbound webhooks in v1.
- Internal event publication is supported for backend workflows only.

## Baseline Status
This file is now concrete enough to implement provider callback ingestion, durable event persistence, retry handling, replay tooling, and reconciliation support for v1.
