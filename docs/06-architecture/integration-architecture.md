# Integration Architecture

## External Integrations
- OpenAI API
- Google Vertex AI
- MTN MoMo
- Hubtel
- Paystack
- Maps and geocoding provider

## Architecture Rule
All external providers should sit behind internal adapters. That keeps provider-specific behavior out of the core delivery domain.

## Integration Categories
### Payments
- Initialize payment.
- Verify payment.
- Handle provider callbacks.

### AI
- Compose prompt.
- Send request.
- Validate safe output for the use case.

### Maps
- Address lookup.
- Route rendering.
- ETA display where useful.

## Approved Provider Decisions
- Payments:
  - `MTN MoMo` active in v1
  - `Paystack` adapter implemented later and disabled at launch
  - `Hubtel` payment adapter deferred
- AI:
  - `OpenAI API` is primary for launch AI workflows
  - `Vertex AI` adapter remains available but disabled for normal pilot traffic
- Maps:
  - `Google Maps Platform` for geocoding and route rendering

## Secret And Rotation Policy
- All provider credentials live in backend secret storage only.
- Rotation cadence:
  - payment credentials: `quarterly`
  - AI credentials: `quarterly`
  - maps credentials: `quarterly`
- Emergency rotation must happen immediately after any credential exposure.

## Fallback Rules
- If `MTN MoMo` is unavailable, booking may continue but dispatch remains blocked until payment succeeds.
- If maps are unavailable, address text and landmark instructions remain the fallback operational source.
- If AI is unavailable, support and admin flows fall back to manual review with no customer-facing AI degradation promise.

## Cost Control
- AI requests must use capped prompt templates and a monthly pilot budget.
- Maps lookups should be cached per delivery and not repeatedly recomputed on every screen open.
- Payment verification retries must be policy-driven and not loop indefinitely.

## Baseline Status
This file is now concrete enough to guide provider adapters, secret management, and fallback behavior.
