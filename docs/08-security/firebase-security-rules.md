# Firebase Security Rules

## Guardrails
- Require authenticated access for protected collections.
- Allow user profile reads only for the owner and authorized admins.
- Restrict delivery reads by sender ownership, assignment scope, or station scope.
- Block direct client writes to critical audit and payment records wherever possible.

## Recommended Pattern
Use backend-mediated writes for:
- status transitions
- handoff events
- payments
- refunds
- admin overrides

That reduces the risk of client-side privilege abuse and keeps domain validation centralized.

## Approved Collection Access
- `users/{uid}`:
  - owner read
  - admin read
  - owner self-update only for non-privileged profile fields
- `deliveries/{deliveryId}`:
  - sender read if `senderId == auth.uid`
  - assignment-scoped read for driver or courier
  - station-scoped read for station operator
  - no direct client write to lifecycle fields
- `payments/{paymentId}`:
  - sender read for own payments
  - finance-admin read
  - no direct client write
- `support_issues/{issueId}`:
  - linked sender read
  - support and ops admin read and managed write through backend
- `audit_events/{eventId}`:
  - admin read only
  - no client write

## Write Rule
- Critical writes must go through backend only for:
  - status transitions
  - handoff events
  - payments
  - refunds
  - admin overrides

## Emulator Coverage
- sender can read own delivery and cannot read another sender delivery
- driver can read assigned run and cannot read unassigned run
- station operator can read station-scoped queue only
- admin can read privileged collections by subrole
- client cannot write audit, payment, or event collections directly

## Baseline Status
This file is now concrete enough to guide security-rule implementation and emulator tests.
