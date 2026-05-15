# Project Overview

## Vision
`Kra` is a delivery operations platform for Ghana that turns fragmented intercity parcel movement into a trackable, accountable, and payment-aware network. The product should feel simple for customers and operationally strict for staff.

## Core Problem
The current station-to-station delivery model depends on informal handoffs, paper records, phone calls, and memory. That causes lost packages, weak accountability, unclear delivery timelines, and disputes over who handled what.

## Product Thesis
If every delivery has a digital record, every handoff is validated, every role sees the next required action, and payments are tied to the delivery lifecycle, then the network becomes easier to trust and easier to scale.

## Product Shape
- Customer-facing mobile app for senders.
- Operations mobile workflows for drivers, station operators, and doorstep delivery personnel.
- Admin control surface for monitoring, exception handling, analytics, and configuration.
- Shared delivery event model that powers tracking, notifications, and audit trails.

## Main User Groups
- Senders who create and pay for deliveries.
- Drivers who move packages between stations.
- Station operators who intake, dispatch, receive, and assign packages.
- Doorstep delivery personnel who complete final-mile delivery.
- Admins who manage the network.

## Primary Value Propositions
- Real-time delivery visibility.
- Clear custody at every handoff.
- Faster issue resolution through audit records.
- Better operational throughput at stations.
- Centralized payment and receipt history.

## Recommended Product Boundaries
- `Kra` should not be a general marketplace in v1.
- `Kra` should not optimize for international shipping in v1.
- `Kra` should not support arbitrary courier partners with custom integrations in v1.
- `Kra` should focus on domestic Ghana station-based logistics first.

## Recommended Launch Positioning
Position `Kra` as "the trusted delivery operating system for station-based parcel movement in Ghana" rather than as a generic courier app.

## Approved Ownership
- Business owner: `user`
- Product owner: `user`
- Technical owner: `Codex-assisted build workflow until a permanent engineering lead is assigned`
- Operations sign-off owner: `user`

## Approved Launch Geography
- Country focus: `Ghana`
- Launch stations:
  - `Accra Central`
  - `Kumasi Adum`
  - `Tamale Central`
- Launch corridors:
  - `Accra <-> Kumasi`
  - `Accra <-> Tamale`
  - `Kumasi <-> Tamale`

## Approved Commercial Positioning
- Position `Kra` as the trusted operating system for intercity station-based parcel movement in Ghana.
- Do not position `Kra` as:
  - a same-minute on-demand courier marketplace
  - an all-purpose e-commerce logistics suite
  - a guaranteed real-time GPS tracking product

## Legal And Claims Rule
- Public copy may claim:
  - verified delivery status updates
  - payment and receipt traceability
  - custody accountability
- Public copy must not claim:
  - guaranteed delivery times on every route
  - insurance-backed compensation unless separately formalized
  - continuous live-map tracking

## Baseline Status
This overview is now concrete enough to anchor product positioning, team ownership, and launch geography.
