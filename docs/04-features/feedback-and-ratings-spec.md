# Feedback And Ratings Spec

## Purpose
Collect service feedback without confusing service quality with operational exception reporting.

## Two Separate Systems
### Feedback
- General service satisfaction.
- Suggestions.
- Role-level ratings after successful or failed experiences.

### Issue Reporting
- Concrete problem tied to a delivery.
- Requires follow-up and workflow ownership.

## Recommended Rating Model
- `1` to `5` star rating for sender experience.
- Optional tags such as `late`, `good communication`, `professional`, `damaged`, `difficult handoff`.

## Moderation Rule
Public-facing ratings, if ever shown, should be delayed until moderation policy exists. In early versions, keep ratings internal.

## Approved V1 Decisions
- Ratings use a `1` to `5` star scale.
- Sender feedback tags:
  - on_time
  - late
  - good_communication
  - difficult_pickup
  - professional
  - damaged
  - poor_service
- Ratings are internal only during the pilot.
- Free-text comments are optional and capped at `300` characters.

## Moderation Rule
- Any feedback with:
  - `1` or `2` stars
  - `damaged`
  - `poor_service`
  - allegation language
  must create an internal review item.
- Customers cannot see other customers' comments in v1.

## Operational Review Link
- Weekly ops review must include:
  - low-rating count by station
  - low-rating count by corridor
  - repeated low-rating actors

## Baseline Status
This file is now concrete enough to support feedback capture without conflating it with formal issue handling.
