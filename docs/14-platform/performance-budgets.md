# Performance Budgets

## Purpose
This document defines hard performance budgets so the product can stay usable on mid-range devices, weak networks, and growing delivery volumes.

## Mobile Budgets
### Sender App
- cold start on mid-range Android: `<= 3.5s`
- warm start: `<= 1.5s`
- create-delivery screen ready after navigation: `<= 1.5s`
- tracking timeline first meaningful render: `<= 2s`

### Operations Mobile
- station queue first meaningful render with cached data: `<= 1.5s`
- queue refresh for `100` visible rows: `<= 2.5s`
- proof capture screen ready: `<= 1.5s`
- offline outbox write acknowledgement: `<= 300ms`

## Admin Web Budgets
- initial page load on standard office connection: `<= 3s`
- route-to-route navigation: `<= 1.5s`
- delivery search results: `p95 <= 2s`
- issue-queue filtered view: `p95 <= 2.5s`

## API Budgets
- authenticated read endpoints: `p95 <= 500ms`
- authenticated command endpoints: `p95 <= 900ms`
- public tracking endpoint: `p95 <= 700ms`
- payment verify endpoint excluding provider wait: `p95 <= 800ms`

## Data And Query Budgets
- single station queue query: `<= 200ms` server time
- sender history page query: `<= 250ms` server time
- delivery detail aggregate query: `<= 400ms` server time

## Asset Budgets
- proof image upload target on workable mobile network: `<= 8s`
- admin dashboard JS payload: `<= 500KB` compressed initial route
- mobile app JS bundle growth must be reviewed if a single release increases it by more than `10%`

## Sync Budgets
- flush `100` queued offline actions after connectivity restore: `<= 60s`
- event projection lag: `p95 <= 60s`

## Enforcement Rule
- Any feature that breaks a budget on critical surfaces must ship behind a flag or be optimized before general rollout.

## Baseline Status
This file is now concrete enough to guide profiling, regressions, and release gating for performance.
