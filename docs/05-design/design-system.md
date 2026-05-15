# Design System

## Principles
- Operational clarity over decoration.
- Strong contrast for statuses and queue urgency.
- Components should be reusable across roles with light role-specific styling.

## Recommended Visual Language
- Blue for trusted system state and origin workflows.
- Green for successful completion and destination readiness.
- Amber for attention-needed states.
- Red for failure, risk, or blocked progression.

## Core Components
- Status badge
- Delivery card
- Queue row
- Timeline item
- Scan action button
- Assignment drawer
- Issue banner
- Empty state
- Confirmation sheet

## Typography
- Use a highly readable sans-serif.
- Reserve weight and scale changes for hierarchy, not decoration.

## Approved Typography
- Headings: `Manrope`
- Body and data-heavy text: `Inter`
- Numeric emphasis: `Inter` with semibold weight

## Core Tokens
### Color
- `brand.blue.600`: `#0F5FE8`
- `success.green.600`: `#1F9D55`
- `warning.amber.600`: `#D98E04`
- `danger.red.600`: `#D64545`
- `neutral.900`: `#111827`
- `neutral.700`: `#374151`
- `neutral.500`: `#6B7280`
- `neutral.100`: `#F3F4F6`
- `surface`: `#FFFFFF`

### Spacing
- `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`

### Radius
- `8` for fields and chips
- `12` for cards
- `16` for sheets and drawers

### Elevation
- `0` flat
- `1` card
- `2` modal or drawer
- `3` critical floating action

## Accessibility Rule
- Primary text and action contrast must meet `WCAG 2.1 AA`.
- Status color cannot be the only signal for blocked, warning, or success states.

## Component Library Plan
- Shared primitives live in:
  - `packages/ui-mobile`
  - `packages/ui-admin`
- Shared tokens live in:
  - `packages/shared/tokens`

## Baseline Status
This file is now concrete enough to guide UI implementation and token setup.
