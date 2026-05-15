# Admin Dashboard Spec

## Purpose
Give operations leadership control of the network, not just visibility into raw records.

## Main Areas
- Operations overview
- Delivery monitoring
- User and role management
- Station management
- Finance
- Issue and dispute queue
- Analytics
- System settings

## Core Capabilities
- View live delivery state distribution.
- Search any package, user, station, or transaction.
- Reassign responsibility where policy allows.
- Review disputes with full audit history.
- Monitor route and station performance.
- Configure service availability and pricing tables.

## Dashboard Requirements
- Show high-risk exceptions first.
- Keep key performance metrics visible at top level.
- Support drill-down from system summary to package detail in one or two steps.

## Approved V1 Decisions
- Admin ships as `web-first` only in v1.
- Admin role splits:
  - `ops_admin`
  - `finance_admin`
  - `support_admin`
  - `super_admin`

## Required Pilot Reporting Views
- network-wide delivery status overview
- station queue health by station
- corridor transit delays
- open issues by severity and age
- payment success, refund, and reconciliation summary
- user activity and recent privileged actions

## Configuration Boundary
### Configurable In Product
- user activation and role assignment
- station open or paused status
- issue category tagging
- service availability toggles by station

### Code Managed
- pricing formulas
- canonical status enums
- permission matrix logic
- payment provider secrets and callback rules

## Baseline Status
This file is now concrete enough to drive admin UI scope and authorization boundaries.
