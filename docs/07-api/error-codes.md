# Error Codes

## Catalog Rule
- Error codes are stable contract values and should not be localized.
- `4xx` codes are used for caller, state, or permission problems.
- `5xx` codes are used for provider or server failure.
- `402` is reserved for payment-action failure endpoints only.
- `409` is used when the request is well-formed but the delivery or payment is in the wrong state for the requested transition.
- `422` is used when required semantic proof or business data is missing.
- Some `internal_only` codes are logged for accepted provider-callback conditions and therefore do not produce a non-2xx external response.

## Approved V1 Error Catalog
| Error Code | HTTP Status | Exposure | Severity | When It Is Used | Default Safe Message |
| --- | --- | --- | --- | --- | --- |
| `AUTH_REQUIRED` | `401` | `customer_safe` | `info` | Missing or invalid bearer token on protected endpoints | `Sign in again to continue.` |
| `FORBIDDEN_ROLE` | `403` | `customer_safe` | `warn` | Authenticated actor lacks the required role | `You do not have permission for this action.` |
| `STATION_SCOPE_VIOLATION` | `403` | `staff_safe` | `warn` | Actor tries to modify a delivery outside the actor's station scope | `This delivery is outside your station scope.` |
| `ASSIGNMENT_SCOPE_VIOLATION` | `403` | `staff_safe` | `warn` | Driver or courier attempts an action on an unassigned delivery | `This job is not assigned to you.` |
| `DELIVERY_NOT_FOUND` | `404` | `customer_safe` | `info` | Delivery ID does not exist or is not visible to caller | `Delivery record not found.` |
| `INVALID_STATUS_TRANSITION` | `409` | `staff_safe` | `warn` | Requested state change is not allowed from current delivery state | `This delivery cannot move to that state yet.` |
| `DELIVERY_NOT_PAID` | `409` | `customer_safe` | `warn` | Transport or final-mile action requested before payment confirmation | `Payment must be confirmed before this action.` |
| `HANDOFF_PROOF_REQUIRED` | `422` | `staff_safe` | `warn` | Staff-to-staff or staff-to-courier handoff is missing mandatory proof | `Required handoff proof is missing.` |
| `PHONE_VERIFICATION_REQUIRED` | `403` | `staff_safe` | `warn` | OTP completion attempted without an active receiver phone-verification token | `Receiver phone verification is required before completion.` |
| `PACKAGE_ALREADY_RECEIVED` | `409` | `staff_safe` | `warn` | Duplicate intake or receipt operation attempted | `This package was already received.` |
| `PACKAGE_SCAN_MISMATCH` | `422` | `staff_safe` | `warn` | Package scan code is missing, unknown, or bound to another delivery | `This scan code does not match the delivery.` |
| `PACKAGE_NOT_READY_FOR_DISPATCH` | `409` | `staff_safe` | `warn` | Dispatch attempted before intake, payment, or assignment requirements are satisfied | `This package is not ready for dispatch.` |
| `FINAL_PROOF_REQUIRED` | `422` | `staff_safe` | `warn` | Final delivery completion attempted without accepted proof | `Delivery proof is required to complete this job.` |
| `FINAL_MILE_NOT_AVAILABLE` | `409` | `customer_safe` | `info` | Doorstep requested outside service zone or without serviceable prerequisites | `Doorstep delivery is not available for this package.` |
| `REATTEMPT_LIMIT_REACHED` | `409` | `staff_safe` | `info` | Another doorstep attempt is requested after the allowed reattempt window is exhausted | `The reattempt limit has been reached.` |
| `PAYMENT_FAILED` | `402` | `customer_safe` | `warn` | Payment initialization or capture fails with a verified provider failure | `Payment could not be completed.` |
| `PAYMENT_ALREADY_CONFIRMED` | `409` | `staff_safe` | `warn` | Payment confirmation attempted on an already confirmed payment | `This payment was already confirmed.` |
| `PAYMENT_PROVIDER_UNAVAILABLE` | `503` | `customer_safe` | `error` | Payment provider is unavailable or provider dependency is down | `Payment service is temporarily unavailable.` |
| `REFUND_NOT_ALLOWED` | `409` | `customer_safe` | `warn` | Refund requested outside approved refund policy | `This payment is not eligible for refund.` |
| `REFUND_ALREADY_PROCESSED` | `409` | `staff_safe` | `warn` | Refund requested again after completion or final settlement | `This refund has already been processed.` |
| `DUPLICATE_SCAN` | `409` | `staff_safe` | `warn` | Same scan event is submitted again for a package in the same step | `This package scan was already recorded.` |
| `CONFLICTING_HANDOFF_STATE` | `409` | `staff_safe` | `error` | Two custody actions conflict or arrive out of order | `The handoff state conflicts with the current record.` |
| `ISSUE_LOCK_ACTIVE` | `423` | `staff_safe` | `warn` | Delivery is temporarily locked because an active issue investigation is in progress | `This delivery is locked while an issue is being reviewed.` |
| `WEBHOOK_SIGNATURE_INVALID` | `401` | `internal_only` | `error` | Provider callback fails signature or trust validation | `Webhook signature invalid.` |
| `UNMATCHED_PROVIDER_REFERENCE` | `200` | `internal_only` | `error` | Verified provider callback cannot be matched and is routed to reconciliation review instead of synchronous failure | `Verified provider event routed for manual review.` |
| `VALIDATION_ERROR` | `400` | `customer_safe` | `info` | Request body is malformed or missing required basic fields | `Some required information is missing or invalid.` |
| `PROVIDER_TIMEOUT` | `504` | `customer_safe` | `error` | Provider verification or provider dependency times out | `The external service took too long to respond.` |
| `UNKNOWN_INTERNAL_ERROR` | `500` | `customer_safe` | `critical` | Unhandled server-side failure | `Something went wrong on our side.` |

## Exposure Rule
- `customer_safe` messages may be returned directly to sender or receiver clients.
- `staff_safe` messages may be shown in internal mobile or admin tools only.
- `internal_only` codes must be logged and monitored but not exposed to public clients.
- Raw provider payloads, stack traces, verification secrets, and security detail must never be exposed outside internal logs and admin tooling.

## Monitoring Rule
- `info`: tracked in logs only
- `warn`: visible in operational dashboards
- `error`: generates support or engineering alert if repeated
- `critical`: immediate engineering alert

## Baseline Status
This file is now concrete enough to support API implementation, safe client messaging, admin tooling, and alerting behavior for v1.
