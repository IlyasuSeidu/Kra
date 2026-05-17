# API Contracts

## Protocol Decisions
- External client APIs use `HTTPS + JSON REST` under the `/v1` namespace.
- Authenticated user requests use `Authorization: Bearer <firebase-id-token>`.
- Admin endpoints use the same bearer pattern with server-side admin-role validation.
- Payment provider callbacks use signed webhook verification and never Firebase bearer auth.
- Internal scheduler endpoints use `X-Kra-Internal-Task-Secret`.

## Delivery APIs
- `GET /v1/deliveries`
- `POST /v1/deliveries`
- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`
- `POST /v1/deliveries/:id/cancel`
- `POST /v1/deliveries/:id/intake`
- `POST /v1/deliveries/:id/assign-driver`
- `POST /v1/deliveries/:id/accept-run`
- `POST /v1/deliveries/:id/dispatch`
- `POST /v1/deliveries/:id/confirm-pickup`
- `POST /v1/deliveries/:id/mark-in-transit`
- `POST /v1/deliveries/:id/receive-destination`
- `POST /v1/deliveries/:id/assign-final-mile`
- `POST /v1/deliveries/:id/accept-final-mile-assignment`
- `POST /v1/deliveries/:id/out-for-delivery`
- `POST /v1/deliveries/:id/final-mile-failed-attempt`
- `POST /v1/deliveries/:id/proof-assets`
- `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`
- `POST /v1/deliveries/:id/complete`

## Payment APIs
- `POST /v1/payments/initialize`
- `POST /v1/payments/verify`
- `POST /v1/payments/refund`
- `POST /v1/payments/refund/settle`
- `POST /v1/webhooks/payments/mtn-momo`
- `POST /v1/internal/payments/reconcile-due`

## Support APIs
- `GET /v1/issues`
- `POST /v1/issues`
- `GET /v1/issues/:id`
- `POST /v1/issues/:id/escalate`
- `POST /v1/issues/:id/resolve`

## Public Access APIs
- `GET /v1/public/track/:trackingCode`
- `POST /v1/public/track/:trackingCode/request-verification`
- `POST /v1/public/track/:trackingCode/verify-phone`

## Notification APIs
- `GET /v1/notifications`
- `POST /v1/internal/outbound-notifications/dispatch-due`

## Admin APIs
- `GET /v1/admin/overview`
- `GET /v1/admin/deliveries`
- `GET /v1/admin/stations`
- `GET /v1/admin/launch-readiness`
- `GET /v1/admin/pricing-rules`
- `POST /v1/admin/pricing-rules/active`
- `POST /v1/admin/stations/:id/status`
- `POST /v1/admin/stations/:id/validation`
- `GET /v1/admin/finance`
- `GET /v1/admin/payment-reconciliation`
- `GET /v1/admin/users`
- `POST /v1/admin/users`
- `POST /v1/admin/users/:id/access`
- `GET /v1/admin/audit-events`
- `GET /v1/admin/outbound-notifications`
- `GET /v1/admin/webhook-events`

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
  "condition": "ok",
  "labelScanCode": "PKG-0001"
}
```

Rule:
- `labelScanCode` is reserved as an immutable `package_labels` binding for this delivery. The same code cannot be reused for another delivery.

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
  "packageScanCode": "PKG-0001"
}
```

Rule:
- This endpoint records station dispatch readiness only. Custody remains with the origin station until the assigned driver confirms pickup with the same registered package scan code.

### `POST /v1/deliveries/:id/confirm-pickup`
Request:
```json
{
  "packageScanCode": "PKG-0001"
}
```

Rule:
- Only the assigned driver can confirm pickup. This is the custody transfer from origin station to driver.

### `POST /v1/deliveries/:id/receive-destination`
Request:
```json
{
  "packageScanCode": "PKG-0001",
  "condition": "ok",
  "nextStep": "doorstep"
}
```

Rule:
- Destination receipt requires confirmed driver custody and the registered package scan code.

### `POST /v1/internal/outbound-notifications/dispatch-due`
Auth:
- `X-Kra-Internal-Task-Secret: <INTERNAL_TASK_SHARED_SECRET>`

Request:
```json
{
  "limit": 25
}
```

Response:
```json
{
  "processed": 2,
  "sent": 1,
  "failed": 1,
  "deadLettered": 0,
  "results": [
    {
      "outboundNotificationId": "ONF-0001",
      "status": "sent",
      "attemptCount": 1
    }
  ]
}
```

### `POST /v1/internal/payments/reconcile-due`
Auth:
- `X-Kra-Internal-Task-Secret: <INTERNAL_TASK_SHARED_SECRET>`

Request:
```json
{
  "limit": 25
}
```

Response:
```json
{
  "processed": 1,
  "confirmed": 1,
  "failed": 0,
  "stillPending": 0,
  "reviewRequired": 0,
  "providerErrors": 0,
  "results": [
    {
      "paymentId": "PAY-0001",
      "deliveryId": "DEL-0001",
      "provider": "mtn_momo",
      "providerReference": "MTN-REF-0001",
      "previousPaymentStatus": "pending",
      "providerPaymentStatus": "confirmed",
      "action": "confirmed",
      "reconciliationAttemptCount": 1,
      "checkedAt": "2026-05-16T08:05:30.000Z"
    }
  ]
}
```

### `GET /v1/admin/outbound-notifications`
Query:
```json
{
  "status": "dead_letter",
  "limit": 20
}
```

Response:
```json
{
  "generatedAt": "2026-05-16T15:00:00.000Z",
  "notifications": [
    {
      "outboundNotificationId": "ONF-0001",
      "channel": "sms",
      "provider": "hubtel",
      "kind": "receiver_delivery_sms",
      "status": "dead_letter",
      "deliveryId": "DEL-0001",
      "trackingCode": "KRA-0001",
      "eventType": "out_for_delivery",
      "attemptCount": 2,
      "maxAttempts": 2
    }
  ]
}
```

### `GET /v1/admin/payment-reconciliation`
Query:
```json
{
  "reviewReason": "verification_unresolved_after_30_minutes",
  "limit": 20
}
```

### `GET /v1/admin/pricing-rules`
Auth:
- `finance_admin` or `super_admin` with `manage_pricing_rules`

Response:
```json
{
  "pricingRuleId": "PRC-0001",
  "status": "active",
  "currency": "GHS",
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 35
    },
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 35
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 50
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 50
    }
  ],
  "effectiveAt": "2026-05-16T12:20:00.000Z",
  "updatedAt": "2026-05-16T12:20:00.000Z",
  "updatedByUserId": "USR-FIN-001",
  "note": "Launch corridor finance approval."
}
```

### `POST /v1/admin/pricing-rules/active`
Auth:
- `finance_admin` or `super_admin` with `manage_pricing_rules`

Request:
```json
{
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 42
    },
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 35
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 50
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 50
    }
  ],
  "note": "Temporary Accra to Kumasi fuel adjustment."
}
```

Rules:
- The route table must include every approved one-way launch corridor exactly once.
- Same-station corridors are rejected.
- Existing deliveries keep the quote amount captured at booking time.

Response:
```json
{
  "generatedAt": "2026-05-16T09:00:00.000Z",
  "rows": [
    {
      "businessDate": "2026-05-16",
      "provider": "mtn_momo",
      "providerReference": "MTN-REF-0001",
      "paymentId": "PAY-0001",
      "deliveryId": "DEL-0001",
      "quotedAmountGhs": 35,
      "chargedAmountGhs": 0,
      "refundedAmountGhs": 0,
      "internalPaymentStatus": "pending",
      "providerPaymentStatus": "pending",
      "mismatchType": "verification_unresolved_after_30_minutes",
      "reconciliationAttemptCount": 3,
      "initiatedAt": "2026-05-16T08:00:00.000Z",
      "lastReconciliationAt": "2026-05-16T08:30:00.000Z",
      "reviewRequiredAt": "2026-05-16T08:30:00.000Z"
    }
  ],
  "csv": "businessDate,provider,providerReference,paymentId,deliveryId,quotedAmountGhs,chargedAmountGhs,refundedAmountGhs,internalPaymentStatus,providerPaymentStatus,mismatchType,reviewedBy,reviewedAt\n2026-05-16,mtn_momo,MTN-REF-0001,PAY-0001,DEL-0001,35,0,0,pending,pending,verification_unresolved_after_30_minutes,,"
}
```

### `POST /v1/deliveries/:id/assign-final-mile`
Request:
```json
{
  "courierUserId": "USR-COR-001"
}
```

Rule:
- Assignment reserves the job for the courier but does not transfer custody.

### `POST /v1/deliveries/:id/accept-final-mile-assignment`
Request:
```json
{
  "packageScanCode": "PKG-0001",
  "note": "Courier accepted with scan"
}
```

Rule:
- Only the assigned final-mile courier can accept. This is the custody transfer from destination station to courier.

### `POST /v1/deliveries/:id/complete`
Request:
```json
{
  "proofType": "otp",
  "proofReference": "pvt_live_delivery_scope_token_0001",
  "receivedByName": "Kojo Asante"
}
```

### `POST /v1/deliveries/:id/proof-assets`
Request:
```json
{
  "proofType": "delivery_photo",
  "contentType": "image/jpeg",
  "byteSize": 512000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

Response:
```json
{
  "proofAssetId": "PFA-0001",
  "deliveryId": "DEL-0001",
  "proofReference": "PFA-0001",
  "proofType": "delivery_photo",
  "status": "pending_upload",
  "upload": {
    "method": "PUT",
    "url": "https://storage.example.test/signed-upload-url",
    "bucket": "kra-proof-assets",
    "objectPath": "proof-assets/DEL-0001/PFA-0001.jpg",
    "contentType": "image/jpeg",
    "expiresAt": "2026-05-16T15:15:00.000Z"
  }
}
```

### `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`
Request:
```json
{
  "byteSize": 512000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "storageGeneration": "generation-1"
}
```

Response:
```json
{
  "proofAssetId": "PFA-0001",
  "deliveryId": "DEL-0001",
  "proofReference": "PFA-0001",
  "proofType": "delivery_photo",
  "status": "uploaded",
  "contentType": "image/jpeg",
  "byteSize": 512000,
  "storageBucket": "kra-proof-assets",
  "storageObjectPath": "proof-assets/DEL-0001/PFA-0001.jpg",
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "storageGeneration": "generation-1",
  "createdAt": "2026-05-16T15:00:00.000Z",
  "uploadExpiresAt": "2026-05-16T15:15:00.000Z",
  "uploadedAt": "2026-05-16T15:02:00.000Z"
}
```

Completion rule:
- `otp` proof uses the active delivery-scoped receiver verification token returned by `/v1/public/track/:trackingCode/verify-phone`.
- `signature` and `delivery_photo` proof references must be uploaded `PFA-*` proof asset IDs before `/complete` succeeds.

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

### `POST /v1/admin/stations/:id/validation`
Request:
```json
{
  "dryRunBusinessDaysCompleted": 2,
  "controlledPilotBusinessDaysCompleted": 3,
  "checklist": {
    "activeOperatorsCanSignIn": true,
    "intakeDispatchReceiptAudited": true,
    "scanOrManualFallbackTested": true,
    "noUnresolvedP1Incidents": true,
    "escalationAndRefundHandoffTested": true,
    "openingHoursStorageAndHandoffConfirmed": true
  },
  "scanFallbackSuccessRatePercent": 97
}
```
Response:
```json
{
  "stationId": "ST-ACC-01",
  "name": "Accra Central",
  "city": "Accra",
  "validation": {
    "status": "ready",
    "dryRunBusinessDaysCompleted": 2,
    "controlledPilotBusinessDaysCompleted": 3,
    "goLiveEligible": true,
    "blockers": [],
    "scanFallbackSuccessRatePercent": 97,
    "updatedAt": "2026-05-16T12:15:00.000Z"
  }
}
```

### `GET /v1/admin/launch-readiness`
Response:
```json
{
  "generatedAt": "2026-05-16T16:00:00.000Z",
  "goLiveEligible": false,
  "status": "blocked",
  "blockers": [
    {
      "code": "unresolved_p1_issue",
      "severity": "p1",
      "stationId": "ST-ACC-01",
      "count": 1,
      "message": "Accra Central has unresolved P1 issues."
    },
    {
      "code": "payment_reconciliation_review",
      "severity": "p1",
      "count": 1,
      "message": "Payment reconciliation review queue must be cleared before launch."
    }
  ],
  "stations": [
    {
      "stationId": "ST-ACC-01",
      "name": "Accra Central",
      "city": "Accra",
      "operatingStatus": "active",
      "intakeStatus": "open",
      "serviceAvailability": {
        "standard": true,
        "express": true,
        "doorstep": true
      },
      "validationStatus": "ready",
      "goLiveEligible": true,
      "validationBlockerCount": 0,
      "activeQueueCount": 5,
      "unresolvedP1IssueCount": 1,
      "updatedAt": "2026-05-16T15:00:00.000Z"
    }
  ],
  "systemChecks": {
    "stationValidation": {
      "readyStations": 1,
      "totalStations": 3
    },
    "unresolvedP1Issues": {
      "count": 1
    },
    "paymentReconciliation": {
      "reviewRequiredCount": 1
    },
    "receiverSms": {
      "deadLetterCount": 0
    }
  }
}
```

Launch readiness is `ready` only when every launch station is go-live eligible, active, open for intake, has launch services enabled, has zero unresolved `P1` issues, payment reconciliation review is clear, and receiver SMS dead-letter backlog is zero.

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

## Station Go-Live Validation Rule
- A station is not `goLiveEligible` until it records `2` dry-run business days and `3` controlled pilot-volume business days.
- The validation checklist and scan or manual-fallback success rate are enforced server-side.
- Manual blockers and unresolved `P1` incident confirmation keep the station in `blocked` status.

## Baseline Status
This contract is now concrete enough to unblock backend scaffolding, shared types, and client integration planning for v1.
