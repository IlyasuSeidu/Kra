# Realtime Events Architecture

## Event Principles
- Events must describe something that happened, not something the UI wishes happened.
- Events should be durable and replayable.
- Downstream read models should tolerate duplicate delivery.

## Core Event Types
- `delivery.created`
- `delivery.received_at_origin`
- `delivery.assigned_to_driver`
- `delivery.dispatched`
- `delivery.received_at_destination`
- `delivery.assigned_for_final_mile`
- `delivery.delivered`
- `delivery.issue_reported`
- `payment.confirmed`
- `payment.failed`

## Realtime Consumers
- Sender tracking view.
- Station queues.
- Driver assignment screens.
- Notification service.
- Admin monitoring dashboards.

## Shared Event Envelope
- `eventId`
- `eventType`
- `eventVersion`
- `aggregateId`
- `aggregateType`
- `actorId`
- `actorRole`
- `occurredAt`
- `data`

## Required Delivery Events
- `delivery.created`
- `delivery.received_at_origin`
- `delivery.assigned_to_driver`
- `delivery.dispatched_from_origin`
- `delivery.received_at_destination`
- `delivery.assigned_for_final_mile`
- `delivery.out_for_delivery`
- `delivery.delivered`
- `delivery.issue_reported`

## Delivery Guarantee
- Internal event delivery is `at least once`.
- Consumers must be idempotent on `eventId`.
- Retry schedule mirrors async-task policy: immediate, `1m`, `5m`, `30m`, `2h`.

## Consumer Ownership
- tracking projection: `services/api`
- notification fan-out: `services/api`
- analytics projection: `services/api`
- admin dashboard read models: `services/api`

## Monitoring Rule
- Alert if event lag exceeds `2 minutes` for live delivery projections.
- Alert if duplicate-delivery rate exceeds threshold or dead-letter queue grows.

## Baseline Status
This file is now concrete enough to support event publishing and projection design.
