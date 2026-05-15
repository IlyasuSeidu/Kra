# Events Tracking Plan

## Operational Events
- delivery created
- payment initialized
- payment confirmed
- origin intake confirmed
- driver assigned
- dispatch confirmed
- destination receipt confirmed
- final-mile assigned
- delivery completed
- issue reported
- refund issued

## UX Events
- create delivery started
- create delivery completed
- tracking screen viewed
- support opened
- notification opened
- search used
- filters applied

## Approved Event Names
### Operational
- `delivery_created`
- `payment_initialized`
- `payment_confirmed`
- `origin_intake_confirmed`
- `driver_assigned`
- `dispatch_confirmed`
- `destination_receipt_confirmed`
- `final_mile_assigned`
- `delivery_completed`
- `issue_reported`
- `refund_issued`

### UX
- `create_delivery_started`
- `create_delivery_completed`
- `tracking_viewed`
- `support_opened`
- `notification_opened`
- `search_used`
- `filters_applied`

## Shared Schema
- `eventName`
- `actorRole`
- `actorId`
- `deliveryId`
- `stationId`
- `occurredAt`
- `metadata`

## Ownership
- instrumentation owner: `technical owner`
- dashboard definition owner: `ops_admin`

## Launch Requirement
- All operational events are required for launch.
- UX events beyond `create_delivery_*`, `tracking_viewed`, and `support_opened` may be added after launch if needed.

## Privacy Rule
- Do not send raw proof assets or full phone numbers in analytics payloads.

## Baseline Status
This file is now concrete enough to guide event instrumentation.
