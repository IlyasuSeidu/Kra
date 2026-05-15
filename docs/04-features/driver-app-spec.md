# Driver App Spec

## Purpose
Help drivers complete inter-station delivery work with minimal tapping, strong handoff evidence, and clear route context.

## Main Screens
- Dashboard
- Assigned Runs
- Package Manifest
- Route View
- Handoff Confirmation
- Earnings
- Support

## Required Capabilities
- Accept or acknowledge assignments.
- View package manifest for a run.
- Confirm departure and arrival.
- Report delays, incidents, or package issues.
- Confirm handoff at destination station.

## UX Requirements
- Primary actions should fit field usage with one-hand interaction.
- The app must work in intermittent connectivity conditions.
- Handoff confirmation should be optimized for scan-first operation.

## Driver Dashboard
- Show current run.
- Show next required action.
- Show counts of packages on board, pending handoffs, and unresolved issues.

## Approved V1 Decisions
- Drivers must accept or reject a run within `15 minutes` of assignment.
- If no response arrives within `15 minutes`, the assignment returns to station review.
- A driver may hold only one active inter-station run at a time unless `ops_admin` overrides it.

## Connectivity Fallback
- Driver status actions are queued locally with:
  - local timestamp
  - actor ID
  - assignment ID
  - optional GPS if available
- The app must sync queued actions automatically when connectivity returns.
- The app must block duplicate departure or arrival submissions once a matching action is queued.

## Manifest Format
Each manifest row must show:
- delivery ID
- package ID
- origin station
- destination station
- service type
- fragile flag
- declared value alert if applicable
- proof or issue flag if already open

## Delay And Handoff Rule
- Delay reporting uses structured reasons:
  - traffic
  - vehicle_issue
  - weather
  - station_delay
  - safety_issue
- Destination handoff is scan-first with manual code fallback and receiving-station confirmation.

## Baseline Status
This file is now concrete enough to support driver workflow implementation and field-device behavior.
