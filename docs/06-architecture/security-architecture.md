# Security Architecture

## Security Goals
- Strong role-based access control.
- Clear audit trail for package custody.
- Protection of payment and personal data.
- Controlled access to operational dashboards.

## Recommended Controls
- Firebase-authenticated identity with server-side role lookup.
- Station and assignment-scoped data access.
- Immutable or append-only event history for key delivery actions.
- Strict separation between customer-visible and staff-visible data.
- Administrative action logging for overrides and dispute decisions.

## High-Risk Surfaces
- Payment callbacks.
- Admin tools.
- Final-mile proof artifacts.
- Any endpoint that changes delivery state.

## Threat Model Summary
- primary threats:
  - unauthorized delivery-state mutation
  - payment callback spoofing
  - proof-asset leakage
  - admin misuse or silent override
  - device compromise in field operations

## Data Classification
- `Public`: route labels, generic help text
- `Internal`: station performance summaries, queue metrics
- `Restricted`: names, phone numbers, addresses, payment references
- `Highly Restricted`: proof photos, signatures, admin override notes, credentials

## Logging And Alerting
- All privileged actions generate audit logs.
- Authentication anomalies, webhook signature failures, repeated duplicate scans, and proof-access anomalies generate alerts.
- Backend logs live in `Google Cloud Logging`.
- Client crash and error monitoring use `Sentry`.

## Approval Rule
- Access-control and retention rules in these docs are treated as active build baseline until a formal legal or compliance owner supersedes them.

## Baseline Status
This file is now concrete enough to guide security-sensitive implementation choices.
