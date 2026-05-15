# AI Features Spec

## Near-Term AI Features
- Customer support chatbot.
- Operational FAQ assistant.
- Issue summarization for admins.
- Guided onboarding copy for new users.

## Good AI Use Cases
- Explain current delivery state in plain language.
- Summarize issue history for support.
- Suggest the likely next operational action without changing state automatically.

## Bad AI Use Cases For Early Versions
- Auto-closing disputes.
- Inventing ETAs without reliable operational inputs.
- Directly mutating payment or delivery state.

## Approved Launch Scope
- staff-facing support policy assistant
- issue summarization for admins and support
- operational FAQ assistant for internal roles

## Explicitly Not In Launch Scope
- public customer chatbot
- AI-driven ETA promises
- AI-driven refund decisions
- AI-driven status changes

## Visibility Policy
- All launch AI is `staff only`.
- Customer-facing AI may be considered only after the pilot proves safe escalation and factual reliability.

## Cost And Latency Limits
- support FAQ response target: `p95 <= 3 seconds`
- issue summary response target: `p95 <= 8 seconds`
- monthly pilot AI budget ceiling: `USD 300`
- requests that exceed latency or budget thresholds should fail closed to human workflow

## Release Threshold
- `100%` pass on critical safety and escalation cases
- `>= 95%` pass on factual correctness cases
- `>= 90%` pass on style and usefulness cases

## Baseline Status
This file is now concrete enough to scope launch AI safely.
