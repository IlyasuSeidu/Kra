# Country Expansion Strategy

## Purpose
This document defines how `Kra` scales from a Ghana-first platform into a multi-country African delivery operating system without fragmenting the codebase.

## Expansion Principle
- no country-specific code forks
- country differences must be handled through configuration, policy, provider adapters, language packs, and rollout controls

## Country Pack Model
Each country requires a versioned country pack containing:
- `countryCode`
- `currencyCode`
- default timezone set
- phone-number validation rules
- address and landmark format rules
- station operating-hour defaults
- payment-provider configuration
- notification-sender configuration
- language pack configuration
- policy overrides approved for that country

## Admission Criteria For New Country
- at least one stable payment provider available
- station operating model mapped and documented
- support coverage defined
- legal and privacy review completed
- route and station readiness plan approved
- load and country-tier scale tests passed

## Deployment Strategy
- same monorepo and service set across countries
- country-level feature flags control rollout
- start each new country with shadow configuration, then limited pilot, then staged expansion

## Data And Region Strategy
- maintain country code on all top-level business entities
- keep data architecture ready for country-based partitioning
- move to region-separated data storage only when legal, latency, or scale requires it

## Product Rules
- customer-facing language may differ by country pack
- route pricing, service windows, and provider mix are country-configurable
- shared core lifecycle, permissions, audit rules, and payment-state guarantees must remain uniform

## Baseline Status
This file is now concrete enough to guide multi-country growth without architectural drift.
