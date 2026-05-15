# Accessibility And Localization

## Accessibility Requirements
- Clear labels on all primary actions.
- Strong status color plus text, never color alone.
- Large enough tap targets for field users.
- Error messages that explain recovery.
- Guided onboarding for first-time operational users.

## Localization Requirements
- Ghana cedi formatting.
- Ghana-friendly date and time display.
- Support for English first, with room for Twi and Ewe later.
- Address and name entry should support local conventions without forcing foreign formats.

## Design Rule
Localization should not be treated as a final polish task. Price, dates, labels, and help text should be designed with local usage in mind from the start.

## Approved V1 Decisions
- Accessibility target: `WCAG 2.1 AA equivalent` for all admin-web and mobile core workflows.
- Launch language: `English` only.
- Product copy and layouts must remain ready for later Twi and Ewe localization without structural redesign.

## Formatting Rules
- Currency: `GHS 35.00`
- Date: `15 May 2026`
- Time: `07:30`
- Phone display: local Ghana-friendly formatting in UI, normalized backend storage
- Address entry: free-form multiline text plus landmark notes, not rigid postal templates

## Validation Process
- Screen-reader checks must be completed on:
  - sender create-delivery flow
  - station intake flow
  - driver handoff confirmation
  - final-mile proof capture
  - admin issue review
- Low-vision checks must verify:
  - text contrast
  - status badge contrast
  - large-tap action targets

## Baseline Status
This file is now concrete enough to guide accessibility implementation and launch-localization behavior.
