# Doorstep Delivery Spec

## Purpose
Give final-mile couriers a simple operational flow for assignment, navigation, completion, and failure handling.

## Main Screens
- Home
- Assigned Deliveries
- Delivery Detail
- Route And Navigation
- Proof Of Delivery
- Earnings
- Issues

## Core Workflow
1. Start shift.
2. Accept or acknowledge package assignment.
3. View receiver and address instructions.
4. Travel to the location.
5. Capture proof and complete delivery.
6. If delivery fails, record a reason and return the package to the next station workflow.

## Required Proof Options
- Signature.
- OTP.
- Delivery photo.
- GPS plus timestamp.

## UX Requirements
- Delivery completion should be possible in a few taps.
- Failure reasons should be structured, not free-text only.

## Approved V1 Decisions
- Doorstep delivery is part of the pilot launch scope, not a post-pilot add-on.
- Default completion proof is `OTP`.
- Signature or delivery photo may be used only as structured fallback proof.
- Allowed service zone is within `10km` of each launch destination station.
- One reattempt is allowed within `24 hours`; after that the package returns to station pickup flow.
- Earnings are visible in-app immediately after completion, while actual payout is handled weekly outside the app during the pilot.

## Baseline Status
This file is now concrete enough to support UI wireframes, task flows, and acceptance criteria for v1 final-mile delivery.
