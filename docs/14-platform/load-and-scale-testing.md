# Load And Scale Testing

## Purpose
This document defines the capacity-testing strategy required for `Kra` to grow from pilot to multi-country scale without rewriting the platform blindly.

## Scale Tiers
### Pilot Tier
- `1,000` deliveries per day
- `150` peak concurrent authenticated users
- `3` launch stations

### Country Tier
- `50,000` deliveries per day
- `2,000` peak concurrent authenticated users
- `50` stations

### Regional Tier
- `500,000` deliveries per day
- `20,000` peak concurrent authenticated users
- `500` stations across multiple countries

## Mandatory Load Test Tracks
- API read and write load
- payment webhook burst handling
- delivery-event projection lag under burst load
- station queue query performance under high document counts
- offline resync storm when many devices reconnect
- admin search and issue filtering under large historical data volume

## Pilot Launch Acceptance
- sustain pilot-tier load for `60 minutes`
- no data loss
- error rate on Tier 0 APIs `<= 0.5%`
- event lag `p95 <= 60s`
- payment webhook acknowledgement `p95 <= 2s`

## Pre-Country-Expansion Acceptance
- sustain country-tier load for `120 minutes`
- prove graceful degradation rather than cascading failure
- no duplicate payment state transitions
- no unauthorized state mutation

## Failure Injection
- simulate provider timeout
- simulate webhook replay burst
- simulate storage slowdown
- simulate mobile reconnect burst
- simulate partial station outage

## Cadence
- run pilot-tier load suite before first public pilot launch
- run country-tier load suite before each new country launch
- run regression load suite monthly

## Tooling Rule
- keep load scenarios versioned in repo
- keep test data generation deterministic
- publish results into a capacity dashboard after each run

## Baseline Status
This file is now concrete enough to guide capacity testing and scale-readiness reviews.
