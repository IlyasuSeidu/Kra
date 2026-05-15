# Service Areas And Stations

## Network Model
`Kra` should launch as a route-and-station network, not as an everywhere-to-everywhere promise. Service availability should be explicit.

## Recommended Launch Structure
- Start with a small number of high-volume station pairs.
- Treat route quality and station discipline as more important than raw geographic coverage.
- Add doorstep delivery only in zones where final-mile completion can be operationally controlled.

## Station Data That Must Exist
- Station ID.
- Station name.
- Region and city.
- Opening hours.
- Supported services.
- Route membership.
- Capacity notes.
- Staff assignments.

## Route Design Principle
Each enabled route should have known travel expectations, known driver assignment capacity, and known exception handling ownership.

## Approved V1 Decisions
### Launch Stations
| Station ID | Station Name | City |
| --- | --- | --- |
| `ST-ACC-01` | `Accra Central` | `Accra` |
| `ST-KMS-01` | `Kumasi Adum` | `Kumasi` |
| `ST-TML-01` | `Tamale Central` | `Tamale` |

### Launch Corridors
- `Accra Central <-> Kumasi Adum`
- `Accra Central <-> Tamale Central`
- `Kumasi Adum <-> Tamale Central`

### Initial Capacity Baseline
- Each launch station starts with `1` active station-operator shift during pilot operations.
- Each corridor starts with `1` primary driver slot per dispatch cycle.
- Doorstep delivery is available only within `10km` of the destination station in each launch city.

### Station Operating Policy
- All launch stations are treated as first-party controlled stations in v1.
- Partner-operated station logic is deferred until after pilot stabilization.

## Baseline Status
This file is now concrete enough to support pricing, route configuration, pilot planning, and station-scoped permissions.
