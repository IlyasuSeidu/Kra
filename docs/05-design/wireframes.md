# Wireframes

## Recommended Wireframe Order
1. Sender dashboard and create-delivery flow.
2. Station intake and dispatch queue.
3. Driver assignment and manifest view.
4. Destination receipt and final-mile assignment.
5. Final-mile proof-of-delivery flow.
6. Admin exception dashboard.

## Shared Layout Pattern
- Header with role, search, and notifications.
- Main content area with urgent items above general items.
- Secondary area for filters, history, or support context.

## Mobile-First Rule
Every role except admin should be designed mobile-first. Admin can use desktop-first layout if a web console is chosen.

## Approved Low-Fidelity Wireframe Baseline

### Sender Dashboard
```text
+----------------------------------+
| Greeting / Active Deliveries     |
| [Create Delivery] [Track]        |
+----------------------------------+
| Delivery Card                    |
| Status | Route | Next Step       |
+----------------------------------+
| Payments Summary                 |
| Support Shortcut                 |
+----------------------------------+
```

### Create Delivery
```text
+----------------------------------+
| Route Selection                  |
| Receiver Details                 |
| Package Details                  |
| Service Type                     |
| Price Estimate                   |
| [Continue to Payment]            |
+----------------------------------+
```

### Station Queue
```text
+----------------------------------+
| Queue Tabs: Outbound / Inbound   |
| Filters                          |
+----------------------------------+
| Queue Row                        |
| Delivery ID | Status | Action    |
+----------------------------------+
| Bulk Action Bar                  |
+----------------------------------+
```

### Driver Manifest
```text
+----------------------------------+
| Current Run Summary              |
| Origin -> Destination            |
+----------------------------------+
| Manifest Rows                    |
| Delivery ID | Fragile | Scan     |
+----------------------------------+
| [Confirm Departure]              |
+----------------------------------+
```

### Final-Mile Proof Capture
```text
+----------------------------------+
| Receiver / Address               |
| OTP Field                        |
| Fallback Proof Actions           |
+----------------------------------+
| [Mark Delivered]                 |
| [Report Failed Attempt]          |
+----------------------------------+
```

### Admin Overview
```text
+----------------------------------------------+
| KPI Row                                      |
| Status Mix | Issues | Refunds | Delays       |
+----------------------------------------------+
| Exception Tables                             |
| Station Health | Open Disputes | Alerts      |
+----------------------------------------------+
```

## High-Risk Edge States
- payment pending after delivery creation
- station intake with manual code fallback
- delayed callback before dispatch
- failed doorstep attempt and return to pickup flow
- admin override on blocked issue

## Component Reuse Rule
- `Delivery Card`, `Status Badge`, `Timeline Item`, `Issue Banner`, and `Confirmation Sheet` are shared primitives across all roles.

## Baseline Status
These low-fidelity wireframes are now sufficient to start UI scaffolding before high-fidelity polish.
