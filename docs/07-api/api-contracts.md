# API Contracts

## Protocol Decisions
- External client APIs use `HTTPS + JSON REST` under the `/v1` namespace.
- Authenticated user requests use `Authorization: Bearer <firebase-id-token>`.
- Admin endpoints use the same bearer pattern with server-side admin-role validation.
- Payment provider callbacks use signed webhook verification and never Firebase bearer auth.

## Delivery APIs
- `POST /v1/deliveries`
- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`
- `POST /v1/deliveries/:id/intake`
- `POST /v1/deliveries/:id/assign-driver`
- `POST /v1/deliveries/:id/dispatch`
- `POST /v1/deliveries/:id/receive-destination`
- `POST /v1/deliveries/:id/assign-final-mile`
- `POST /v1/deliveries/:id/complete`

## Payment APIs
- `POST /v1/payments/initialize`
- `POST /v1/payments/verify`
- `POST /v1/payments/refund`

## Support APIs
- `POST /v1/issues`
- `GET /v1/issues/:id`
- `POST /v1/issues/:id/escalate`

## Public Access APIs
- `GET /v1/public/track/:trackingCode`
- `POST /v1/public/track/:trackingCode/verify-phone`

## Admin APIs
- `GET /v1/admin/overview`
- `GET /v1/admin/deliveries`
- `GET /v1/admin/stations`
- `GET /v1/admin/finance`

## Request And Response Baselines
### `POST /v1/deliveries`
Request:
```json
{
  "originStationId": "ST-ACC-01",
  "destinationStationId": "ST-KMS-01",
  "receiver": {
    "name": "Kojo Asante",
    "phone": "+233000000000",
    "addressText": "Optional for doorstep"
  },
  "package": {
    "description": "Phone accessories",
    "weightKg": 1.8,
    "sizeTier": "standard",
    "isFragile": false,
    "declaredValueGhs": 300
  },
  "serviceType": "standard",
  "doorstepRequested": false
}
```
Response:
```json
{
  "deliveryId": "DEL-0001",
  "status": "created",
  "quote": {
    "currency": "GHS",
    "amount": 35
  },
  "paymentRequiredBeforeDispatch": true
}
```

### `POST /v1/deliveries/:id/intake`
Request:
```json
{
  "measuredWeightKg": 1.9,
  "sizeTier": "standard",
  "receivedByUserId": "USR-OP-001"
}
```

### `POST /v1/deliveries/:id/assign-driver`
Request:
```json
{
  "driverUserId": "USR-DRV-001"
}
```

### `POST /v1/deliveries/:id/dispatch`
Request:
```json
{
  "packageScanCode": "PKG-0001",
  "dispatchedByUserId": "USR-OP-001"
}
```

### `POST /v1/deliveries/:id/receive-destination`
Request:
```json
{
  "packageScanCode": "PKG-0001",
  "condition": "ok",
  "receivedByUserId": "USR-OP-002"
}
```

### `POST /v1/deliveries/:id/assign-final-mile`
Request:
```json
{
  "courierUserId": "USR-COR-001"
}
```

### `POST /v1/deliveries/:id/complete`
Request:
```json
{
  "proofType": "otp",
  "proofReference": "OTP-VERIFIED",
  "receivedByName": "Kojo Asante"
}
```

### `GET /v1/public/track/:trackingCode`
Response:
```json
{
  "deliveryId": "DEL-0001",
  "status": "received_at_destination",
  "publicLabel": "Arrived at destination station",
  "latestTouchpoint": {
    "role": "station_operator",
    "stationId": "ST-KMS-01",
    "occurredAt": "2026-04-23T13:30:00Z"
  },
  "receiverVerificationRequired": false
}
```

## Error Response Format
All non-2xx responses must use:
```json
{
  "requestId": "REQ-123",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Delivery cannot be dispatched before payment is confirmed.",
    "details": {}
  }
}
```

## Versioning Policy
- Breaking changes require a new path version such as `/v2`.
- Backward-compatible fields may be added to `/v1`.

## Rate Limits
- `POST /v1/deliveries`: `20` requests per minute per sender
- State-change endpoints: `60` requests per minute per authenticated actor
- `POST /v1/payments/initialize`: `10` requests per minute per sender
- `POST /v1/payments/refund`: `5` requests per minute per admin
- Read-heavy list endpoints: `120` requests per minute per authenticated actor

## Idempotency Policy
- Every client-initiated mutating POST accepts an `Idempotency-Key` header.
- Provider callbacks are idempotent on `provider_reference + event_type`.
- Duplicate client retries should return the existing successful outcome when safe to do so.

## Receiver Access Rule
- Public tracking endpoints do not require a full receiver account in v1.
- Receiver-sensitive actions may require delivery-linked phone verification.
- Public endpoints must return only customer-safe fields.

## Baseline Status
This contract is now concrete enough to unblock backend scaffolding, shared types, and client integration planning for v1.
