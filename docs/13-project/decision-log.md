# Decision Log

## Decision Status Rule
Every decision below is adopted as an `active build baseline` on `2026-04-23` and remains in force unless explicitly superseded by the user.

## Confirmed Platform Decisions
### D-001
- Decision: Product name remains `Kra`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: preserves continuity across the existing work

### D-002
- Decision: Front end is `React Native + utility-first styling + Redux Toolkit`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: shared mobile-first codebase across operational roles

### D-003
- Decision: Backend is `Node.js` for business logic and `Python` for AI workflows
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: keeps operational logic separate from AI-specific concerns

### D-004
- Decision: Platform services use `Firebase` for auth, core data, storage, and analytics collection
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: reduces infrastructure overhead for the pilot

## Critical Business Decisions
### D-005
- Decision: Launch stations are `Accra Central`, `Kumasi Adum`, and `Tamale Central`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: a three-station triangular network is small enough to control and large enough to prove the model

### D-006
- Decision: Launch corridors are `Accra <-> Kumasi`, `Accra <-> Tamale`, and `Kumasi <-> Tamale`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: enough route variety without national overexpansion

### D-007
- Decision: v1 pricing uses fixed route base fees plus simple tiered surcharges
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: simple pricing is easier to explain, operate, and test

### D-008
- Decision: Payment is required before `assigned_to_driver` and before any dispatch
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: prevents unpaid packages from entering transport

### D-009
- Decision: `refunded` is a payment state, not a delivery status
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: separates transport state from finance state

### D-010
- Decision: Staff-to-staff handoffs require two-party confirmation when both parties are present; fallback handoffs require supervisor override
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: improves accountability without blocking operations during hardware failures

## Interface And Client Decisions
### D-011
- Decision: External APIs are `REST JSON` under `/v1`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: fast to implement and easy to document

### D-012
- Decision: Client auth uses Firebase bearer tokens; provider callbacks use signed verification
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: clean separation between user auth and provider auth

### D-013
- Decision: Admin client is `web-first`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: admin workflows are monitoring-heavy and desktop-friendly

## Payment And Earnings Decisions
### D-014
- Decision: `MTN MoMo` is the first production payment path in v1
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: best fit for a Ghana-first pilot

### D-015
- Decision: `Paystack` is secondary and `Hubtel` is deferred until after the pilot core is stable
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: limits initial integration risk

### D-016
- Decision: Driver and final-mile earnings are recorded in-app, but payouts are processed weekly outside the app in the pilot
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: preserves payout traceability without blocking launch on payout automation

## Execution Decisions
### D-017
- Decision: Build plan runs in six two-week phases beginning `2026-04-27`
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: realistic structure for an AI-assisted primary implementation workflow

## Final-Mile, Finance, And API Decisions
### D-018
- Decision: Doorstep delivery is included in the v1 pilot, limited to addresses within `10km` of each launch destination station
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: keeps final-mile scope controlled while still validating the full delivery model

### D-019
- Decision: Default final-mile proof is `OTP`; signature or delivery photo are fallback methods that require a fallback reason
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: OTP is the strongest simple proof for the pilot while fallback paths preserve operational continuity

### D-020
- Decision: Final-mile service is prepaid only; no cash collection is allowed in v1
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: keeps payment state and delivery state tightly controlled

### D-021
- Decision: Refunds are full before intake, partial after intake and before dispatch, and post-dispatch only by verified dispute outcome
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: creates predictable customer treatment without undermining operational accountability

### D-022
- Decision: Webhook ingestion uses signature verification, durable write before acknowledgement, idempotent processing, and dead-letter handling after repeated failures
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: keeps provider callback handling safe and replayable

### D-023
- Decision: Doorstep assignment targets same-day service when destination receipt occurs before `15:00` local time; otherwise the default target is next-business-day assignment
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: creates an operational cutoff that matches pilot courier capacity

### D-024
- Decision: Approved refunds are initiated the same business day and should complete within `3 business days` to the original method or `5 business days` through an approved alternate path
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: creates a finance SLA that is strict enough for trust but realistic for the pilot

### D-025
- Decision: Daily reconciliation uses a fixed-column `CSV` export plus an unmatched-event review queue; provider settlement is money truth and internal records are service-entitlement truth
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: gives finance and engineering a shared operating model for mismatch review

### D-026
- Decision: Verified provider callbacks with unmatched references are persisted and acknowledged, then reviewed through reconciliation instead of being synchronously rejected to the provider
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: preserves at-least-once callback safety without losing unmatched events

### D-027
- Decision: Receivers do not get full persistent accounts in v1; they use delivery-scoped secure links with phone verification when required
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: keeps receiver access simple while avoiding unnecessary authentication, support, and profile complexity during the pilot

### D-028
- Decision: Each launch station requires `5 business days` of validation before pilot go-live, split into `2` dry-run days and `3` controlled pilot-volume days
- Date: `2026-04-23`
- Approver: `active build baseline`
- Rationale: creates a concrete readiness bar for stations without overextending the pilot timeline

## Platform Excellence Decisions
### D-029
- Decision: Platform reliability is governed by explicit SLOs and error budgets, with `99.95%` Tier 0 availability target for Kra-controlled critical services
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: prevents vague quality claims and forces reliability to become an engineering discipline

### D-030
- Decision: CI CD uses protected `main`, GitHub Actions, staged promotion, preview environments, and risk-based approval gates
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: elite repository quality requires merge discipline, auditable release flow, and reproducible environments

### D-031
- Decision: Coverage policy is risk-based, with `100%` required on payment, auth, permissions, pricing, refunds, and state-transition modules, and `>= 90%` on backend domain services overall
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: a blanket vanity coverage number is weaker than strict guarantees on critical domain logic

### D-032
- Decision: v1 disaster recovery uses single-region live serving plus cross-region backup and defined RTO and RPO targets, not active-active multi-region writes
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: this is the strongest realistic resilience posture for a disciplined pilot without premature infrastructure complexity

### D-033
- Decision: Multi-country expansion is configuration-driven through versioned country packs and must not use country-specific code forks
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: Africa-scale growth demands controlled variability without codebase fragmentation

### D-034
- Decision: Mobile operational roles are offline-assisted with durable outbox sync; admin remains online-only
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: network reality in the field requires explicit offline design rather than optimistic always-online assumptions

### D-035
- Decision: Public-facing web pages and public tracking entry points are first-class repository surfaces under `apps/web`, separate from mobile and admin clients
- Date: `2026-05-15`
- Approver: `active build baseline`
- Rationale: growth, trust, acquisition, and receiver access require a dedicated public web surface rather than treating the product as mobile-only

## Change Rule
- If a decision changes later, append a new decision entry with:
  - superseded decision ID
  - new decision date
  - rationale for change
  - affected docs and tasks

## Baseline Status
This log now captures the active build baseline for the first implementation pass.
