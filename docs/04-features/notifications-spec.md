# Notifications Spec

## Purpose
Deliver only meaningful updates to the right user at the right time.

## Notification Events
- Delivery created.
- Payment confirmed or failed.
- Package received at origin.
- Package dispatched.
- Package received at destination.
- Final-mile assignment created.
- Delivery completed.
- Issue reported.
- Refund issued.

## Channel Policy
- In-app notifications for all authenticated roles.
- Push notifications for urgent delivery state changes.
- SMS for critical customer-facing events where delivery reliability matters.
- Email for receipts, summaries, and non-urgent confirmations.

## Design Rules
- Notifications must link to the relevant delivery or task.
- Do not send duplicate channel noise unless the event is critical.
- Internal and customer notification text should differ where needed.

## Approved V1 Decisions
- Receivers receive SMS notifications in v1 for:
  - package ready for pickup
  - final-mile assignment created
  - package out for delivery
  - failed doorstep attempt
  - delivery completed
- Receiver SMS should include the secure tracking link when relevant.
- In-app notifications are reserved for authenticated roles only and therefore do not apply to receivers in v1.
- Sender remains the primary recipient for payment, refund, and issue-resolution notifications.

## Approved Launch Matrix
### Sender
- delivery created: `in_app`
- payment confirmed: `in_app`, `push`
- payment failed: `in_app`, `push`
- received at origin: `in_app`, `push`
- dispatched: `in_app`, `push`
- received at destination: `in_app`, `push`
- ready for pickup: `in_app`, `push`, `sms`
- out for delivery: `in_app`, `push`, `sms`
- delivered: `in_app`, `push`, `sms`
- issue updated: `in_app`, `push`
- refund completed: `in_app`, `push`, `sms`

### Receiver
- ready for pickup: `sms`
- final-mile assigned: `sms`
- out for delivery: `sms`
- failed doorstep attempt: `sms`
- delivered: `sms`

### Driver And Courier
- new assignment: `in_app`, `push`
- reassignment or cancellation: `in_app`, `push`
- issue escalation: `in_app`, `push`

### Station Operator
- inbound arrival reminder: `in_app`
- dispatch overdue: `in_app`
- issue escalated to station: `in_app`

## Provider Decisions
- SMS provider: `Hubtel Messaging API`
- Push provider: `Firebase Cloud Messaging`
- Email channel: `disabled at launch`

## Quiet Hours And Retry
- No quiet hours apply to critical delivery SMS.
- Push notifications retry up to `3` times across `15 minutes`.
- SMS does not automatically retry more than once for the same event inside `30 minutes`.
- Low-priority operational reminders may be suppressed between `22:00` and `06:00` local time.

## Delivery Enforcement
- Receiver SMS must be written to the durable `outbound_notifications` outbox before provider dispatch.
- Receiver SMS uses `receiver-sms:{deliveryId}:{eventType}` as the dedupe key so repeated lifecycle commands do not create duplicate channel noise.
- Provider success updates the outbox record to `sent` with `sentAt`, `lastAttemptAt`, and `attemptCount`.
- Provider failure updates the outbox record to `failed`, schedules one retry at `30 minutes`, and preserves `lastError` for operations review.
- A second failed SMS attempt moves the record to `dead_letter`; customer support must review the affected delivery before suppressing or manually re-sending.
- Lifecycle state mutation must not roll back only because an SMS provider is temporarily unavailable; the outbox is the recovery mechanism.
- Cloud Tasks or a scheduler must call the internal dispatch endpoint with `X-Kra-Internal-Task-Secret` to process due outbox records.
- Ops and support admins review failed or dead-lettered records through `GET /v1/admin/outbound-notifications`.

## Copy Baseline
- Payment confirmed: `Payment confirmed. Kra has started processing your delivery.`
- Ready for pickup: `Your package is ready for pickup at {stationName}.`
- Out for delivery: `Your package is on the way for doorstep delivery.`
- Failed attempt: `We could not complete delivery. Please follow the link for next steps.`
- Delivered: `Your package has been delivered.`
- Refund completed: `Your refund has been completed.`

## Baseline Status
This file is now concrete enough for notification implementation, provider setup, and copy scaffolding.
