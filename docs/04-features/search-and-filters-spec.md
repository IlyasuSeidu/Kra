# Search And Filters Spec

## Search Targets
- Delivery ID
- Package ID
- Sender name
- Receiver name
- Phone number where permitted
- Station
- Driver
- Transaction reference

## Filter Dimensions
- Status
- Date range
- Origin station
- Destination station
- Service type
- Assigned actor
- Issue state

## UX Rules
- Search should be forgiving for partial matches.
- Operational screens should persist last-used filters within a session.
- Critical queue screens should support one-tap filters for `urgent`, `delayed`, and `needs action`.

## Approved Search Scope
### Sender
- delivery ID
- receiver name
- own payment reference
- origin and destination station

### Driver
- delivery ID
- package ID
- assigned corridor

### Station Operator
- delivery ID
- package ID
- sender phone
- receiver phone
- route
- current queue status

### Admin
- all station-operator fields plus:
  - issue ID
  - refund ID
  - actor ID

## Ranking Rule
- exact ID match first
- exact phone match second
- prefix name match third
- fuzzy name match last

## Performance Targets
- station-scoped search: `p95 <= 2 seconds`
- sender history search: `p95 <= 2 seconds`
- admin global search: `p95 <= 3 seconds`

## Privacy Rule
- Full phone-number search is allowed only for station operators in station scope and admins in approved roles.
- Sender-facing search never exposes unrelated identities.
- Search results must mask phone numbers in list views unless the actor is authorized to open the detailed record.

## Baseline Status
This file is now concrete enough to drive search indexing, privacy boundaries, and UI behavior.
