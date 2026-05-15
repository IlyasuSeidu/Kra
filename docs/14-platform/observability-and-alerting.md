# Observability And Alerting

## Purpose
This document defines the monitoring, logging, tracing, and alerting standards required for production-grade operation of `Kra`.

## Required Telemetry Stack
- application logs: `Google Cloud Logging`
- infrastructure metrics: `Google Cloud Monitoring`
- mobile and admin client errors: `Sentry`
- product analytics: `Firebase Analytics`
- distributed tracing: `OpenTelemetry` exported into cloud tracing backend

## Golden Signals
- latency
- traffic
- errors
- saturation

## Core Technical Dashboards
### API Health
- request volume
- p50, p95, p99 latency
- 4xx and 5xx rates
- auth failure rate

### Payments
- initialize success rate
- verify success rate
- pending payment age
- unmatched provider events
- refund completion SLA

### Delivery Workflow
- deliveries created per hour
- intake backlog by station
- dispatch lag by station
- destination receipt lag
- final-mile assignment lag

### Queue And Event Processing
- event lag
- retry queue depth
- dead-letter depth
- notification backlog

### Client Quality
- crash-free sessions
- startup latency
- offline queue flush failures
- version adoption

## Required Business Dashboards
- route reliability
- station performance
- dispute volume
- refund volume and age
- proof capture completion rate

## Log Schema Requirements
Every structured log entry on critical services must include:
- `service`
- `environment`
- `requestId`
- `actorId` if available
- `actorRole` if available
- `deliveryId` if available
- `paymentId` if available
- `stationId` if available
- `severity`
- `eventType`

## Alert Classes
### Page Immediately
- Tier 0 API outage
- payment-confirmed dispatch gate bypass
- webhook signature validation failure spike
- dead-letter accumulation on payment flows
- widespread auth failure for staff

### Urgent But Not Paging
- station queue lag threshold exceeded
- notification delay threshold exceeded
- elevated crash rate on latest mobile version
- reconciliation mismatches above threshold

### Informational
- slow query trends
- budget nearing AI threshold
- elevated fallback-proof usage

## Alert Routing
- technical alerts -> `technical owner`
- payment alerts -> `finance_admin` plus `technical owner`
- operational queue alerts -> `ops_admin`
- support workload alerts -> `support_admin`

## Alert Noise Rule
- alerts must be deduplicated by incident key
- informational alerts must never page
- paging alerts require runbook links in the alert payload

## Review Cadence
- daily dashboard review during pilot
- weekly alert-tuning review
- monthly observability coverage audit

## Baseline Status
This file is now concrete enough to guide instrumentation, dashboard setup, and production alerting.
