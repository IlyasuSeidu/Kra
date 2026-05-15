# Pricing Rules

## Pricing Inputs
- Origin station.
- Destination station.
- Package size tier.
- Package weight tier.
- Service speed.
- Final-mile requirement.
- Declared value if insurance or liability tiers are later added.

## Finalized V1 Pricing Model
Use tier-based pricing for v1 rather than a highly dynamic formula. That reduces confusion and makes station workflows easier.

### Pricing Structure
- `Base route fee`
- `Weight tier surcharge`
- `Express surcharge` if applicable
- `Doorstep surcharge` if applicable
- `Special handling surcharge` for fragile or oversized items

## Pricing Principles
- Price should be shown before payment confirmation.
- Final price should lock once the package is accepted unless staff-approved adjustments are required.
- Admin users should be able to configure route tables without app redeploys.

## Suggested Launch Policy
- Do not support ad hoc bargaining inside the app.
- Keep route tables simple and transparent.

## Approved V1 Decisions
### Launch Corridor Base Fees
All launch prices are one-way and customer-facing in `GHS`.

| Corridor | Standard Base Fee |
| --- | --- |
| `Accra Central -> Kumasi Adum` | `GHS 35` |
| `Kumasi Adum -> Accra Central` | `GHS 35` |
| `Accra Central -> Tamale Central` | `GHS 65` |
| `Tamale Central -> Accra Central` | `GHS 65` |
| `Kumasi Adum -> Tamale Central` | `GHS 50` |
| `Tamale Central -> Kumasi Adum` | `GHS 50` |

### Included Standard Package
- Weight: `0kg to 2kg`
- Size: `standard`
- Service: `standard`
- Final-mile delivery: `not included`

### Weight Surcharges
| Weight Tier | Surcharge |
| --- | --- |
| `>2kg to 5kg` | `+GHS 8` |
| `>5kg to 10kg` | `+GHS 18` |
| `>10kg to 20kg` | `+GHS 35` |
| `>20kg` | `manual quote only, not self-serve in v1` |

### Size Surcharges
| Size Tier | Rule | Surcharge |
| --- | --- | --- |
| `standard` | longest side `<= 40cm` | `included` |
| `bulky` | longest side `> 40cm` and `<= 70cm` | `+GHS 15` |
| `oversized` | longest side `> 70cm` | `manual quote only, not self-serve in v1` |

### Service Surcharges
- `Express`: `+40%` of the route base fee with a minimum express surcharge of `GHS 15`
- `Doorstep within 5km of destination station`: `+GHS 15`
- `Doorstep above 5km and up to 10km`: `+GHS 25`
- `Doorstep above 10km`: `not available in v1`

### Special Handling
- `Fragile`: `+GHS 10`, requires intake photo and destination condition check
- `Declared value above GHS 2,000`: `+GHS 20` and manual operator approval
- `Declared value above GHS 5,000`: `not accepted through self-serve v1`

### Taxes, Fees, And Price Display
- The sender sees a single final quoted amount in the app.
- Payment-processing cost is absorbed into the public quote in v1 and is not shown as a separate fee line.
- Any applicable tax treatment is considered included in the displayed customer price for the pilot.

### Refund And Cancellation Price Handling
- `Before origin intake`: full refund of the amount collected
- `After origin intake but before dispatch`: refund of collected amount minus a `GHS 5` handling fee
- `After dispatch`: no automatic refund; handled through the dispute flow
- The first failed doorstep reattempt does not create a second doorstep surcharge if the reattempt happens within policy

### Price Change Approval
- Any route price or surcharge change requires approval from:
  - product owner
  - finance owner
  - operations owner
- Non-emergency price changes require `7 calendar days` notice before going live.

## Baseline Status
This file is now concrete enough to unblock quote generation, payment initialization, finance displays, and route configuration for v1.
