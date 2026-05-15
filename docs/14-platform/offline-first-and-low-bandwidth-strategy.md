# Offline First And Low Bandwidth Strategy

## Purpose
This document defines how `Kra` remains usable in African network conditions where bandwidth is unstable, latency is high, and devices reconnect unpredictably.

## Role-Based Connectivity Model
- sender app: online-first with cached read fallback
- driver app: offline-assisted for transport updates and handoff preparation
- station app: offline-assisted for intake, dispatch preparation, and receipt confirmation
- final-mile app: offline-assisted for proof capture and failed-attempt recording
- admin web: online-only

## Offline Write Pattern
- use local durable outbox for critical operational actions
- every queued action must include:
  - local action ID
  - server idempotency key
  - actor ID
  - role
  - delivery or assignment ID
  - local timestamp

## Conflict Resolution
- server is source of truth
- duplicate queued actions are reconciled by idempotency key
- if a queued action conflicts with newer server state, the app must:
  - preserve local record
  - show conflict banner
  - force user review before retry

## Proof And Media Handling
- proof images may upload after the core completion event is durably queued
- proof metadata and local file reference must be captured immediately even if upload is deferred
- completion cannot be considered final until required proof metadata exists

## Low-Bandwidth Design Rules
- prefer text and summary views over heavy map views
- never require live GPS stream for customer tracking
- cache recent station queues and current assignments locally
- compress images before upload

## Release Gates
- offline outbox tests required for:
  - station intake
  - dispatch confirmation
  - destination receipt
  - final-mile proof capture
- reconnect storm tests must prove no duplicate state mutation

## Operational Metrics
- queued action count
- queued action oldest age
- sync success rate
- conflict rate after reconnect

## Baseline Status
This file is now concrete enough to drive offline architecture and network-resilience implementation.
