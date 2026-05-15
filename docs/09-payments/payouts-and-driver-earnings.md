# Payouts And Driver Earnings

## Product Need
Drivers and final-mile couriers need trust in what they earned and why. Admins need the ability to reconcile those records.

## Recommended Model
- Store gross earning events per completed assignment.
- Store adjustments separately.
- Show net payable amount in user-facing earnings views.

## If Payout Logic Is Not Final
Model the following now even before policy is complete:
- assignment ID
- delivery ID
- earning amount
- earning reason
- payout status

That avoids redesigning the ledger later.

## Approved V1 Decisions
- Drivers earn per completed inter-station assignment, not per scan event.
- Final-mile couriers earn per completed doorstep delivery, not per kilometer in v1.
- Earnings appear in-app immediately after the qualifying completion event.
- Pilot payouts are processed `weekly` by finance and operations outside the app.
- The app acts as the earnings ledger and visibility surface in v1, not the payout execution system.
- Reversals or deductions require a finance-admin adjustment record; original earning events are never deleted.

## Baseline Status
This file is now concrete enough to support earnings visibility, finance reconciliation, and later payout automation.
