# Vertex OpenAI Usage Plan

## Providers
- OpenAI API
- Google Vertex AI

## Recommended Strategy
- Build a provider abstraction with a common request and response contract.
- Use one provider as the default path and the other as fallback or for specific workloads.
- Keep prompts, safety rules, and evaluation cases provider-neutral where possible.

## First Wave Scope
- Support assistance.
- Issue summarization.
- Operational guidance.

## Non-Goals For First Wave
- Autonomous delivery operations.
- Auto-refund decisions.
- AI-authored policy without human review.

## Approved Provider Allocation
- `OpenAI API` primary for:
  - support policy assistant
  - issue summarization
  - internal FAQ assistant
- `Vertex AI` remains adapter-ready but inactive in normal pilot traffic

## Fallback Rule
- If OpenAI is unavailable, the product falls back to human workflow rather than automatic provider switching in v1.
- Vertex may be activated later only after evaluation parity is proven.

## Cost Budget
- monthly pilot budget: `USD 300`
- single request soft cap:
  - FAQ: `USD 0.01`
  - summary: `USD 0.03`

## Ownership
- provider monitoring owner: `technical owner`
- evaluation owner: `technical owner`
- policy quality owner: `support_admin`

## Baseline Status
This file is now concrete enough to guide AI provider setup and cost controls.
