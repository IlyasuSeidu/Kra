# Support And Escalation Rules

## Support Channels
- In-app issue submission.
- FAQ and guided self-service.
- Live support or call escalation during business hours.
- Admin review queue for operational exceptions.

## Severity Levels
### P1
- Lost package.
- Suspected fraud.
- Payment charged without corresponding delivery state.

### P2
- Damaged package.
- Delayed package beyond SLA.
- Failed doorstep attempt with urgent customer need.

### P3
- Tracking confusion.
- Receipt request.
- Non-urgent profile or app issue.

## Routing Rule
The default owner of an issue is the role or station currently responsible for the package. If the current custodian cannot resolve it inside the SLA, the issue escalates upward.

## Recommended SLA
- P1 acknowledgement: within 10 minutes during operating hours.
- P2 acknowledgement: within 30 minutes.
- P3 acknowledgement: within 4 business hours.

## Escalation Steps
1. Initial role triage.
2. Station-level review.
3. Admin or finance review if needed.
4. Final decision with audit trail reference.

## Approved Launch Channels
- Sender in-app support thread
- Receiver delivery-linked support entry from secure tracking page
- WhatsApp support line during operating hours
- Phone escalation line for urgent `P1` cases
- Admin issue queue for internal handling

## SLA Ownership
- `P1`: `ops_admin` unless payment-specific, in which case `finance_admin`
- `P2`: `station_lead` or `support_admin` depending on current custody
- `P3`: `support_admin`

## Compensation And Goodwill Rule
- Standard delays receive apology and status explanation, not automatic compensation.
- Refunds follow the approved refund policy only.
- One-time goodwill credit up to `GHS 20` may be granted by `support_admin` for poor experience without policy breach.
- Goodwill above `GHS 20` requires `ops_admin` or `finance_admin` approval.

## Support Coverage Model
- Support operating hours: `07:00` to `19:00` local time, `7` days a week during the pilot.
- `P1` cases outside hours trigger an on-call escalation to `ops_admin`.
- Finance review for refund and payment disputes runs `09:00` to `17:00` on business days.

## Baseline Status
This file is now concrete enough to support support operations, issue routing, and compensation boundaries in v1.
