# Glossary

- `Sender`: The customer or business that creates a delivery request and pays for service.
- `Receiver`: The person or business expected to collect or receive the package.
- `Delivery`: The full commercial and operational record of moving a package from sender to receiver.
- `Package`: The physical parcel or grouped parcel unit being transported.
- `Origin Station`: The first controlled handoff location where the package enters the network.
- `Destination Station`: The receiving station where line-haul movement ends.
- `Station Operator`: The staff member who processes intake, dispatch, receipt, assignment, and issue handling at a station.
- `Driver`: The actor responsible for moving packages between stations.
- `Doorstep Delivery Personnel`: The actor responsible for last-mile delivery from destination station to receiver.
- `Admin`: The internal actor with system-wide operational oversight, configuration access, and reporting access.
- `Handoff`: A transfer of package custody from one accountable role to another.
- `Proof Of Handoff`: Evidence that a custody transfer happened, usually by scan, signature, timestamp, photo, or a combination.
- `Proof Of Delivery`: Evidence that the receiver or final delivery role accepted the package at completion.
- `Tracking Timeline`: Ordered delivery history shown in a human-readable sequence.
- `Issue`: Any problem requiring review, such as damage, delay, misrouting, missing package, or payment failure.
- `Route`: The path or corridor between the origin station, destination station, and optional final-mile stop.
- `SLA`: Internal service target for speed, reliability, or support response.
- `Pilot`: A limited launch with constrained geography and controlled operational conditions.

## Approved V1 Decisions
- Launch language for all product surfaces is `English` only.
- `Delivery` and `Package` remain separate concepts.
- In v1, each `Delivery` maps to exactly one `Package` record.
- The backend still keeps `Package` as a first-class child entity so multi-package expansion does not require a model rewrite later.

## Canonical Naming Map
- `Sender` -> `senderId`, `senderName`
- `Receiver` -> `receiverName`, `receiverPhone`
- `Delivery` -> `deliveryId`, `currentStatus`, `paymentStatus`
- `Package` -> `packageId`, `weightKg`, `sizeTier`
- `Origin Station` -> `originStationId`
- `Destination Station` -> `destinationStationId`
- `Station Operator` -> `station_operator`
- `Driver` -> `driver`
- `Doorstep Delivery Personnel` -> `final_mile_courier`
- `Admin` -> `ops_admin`, `finance_admin`, `support_admin`, `super_admin`
- `Handoff` -> `handoffEvent`
- `Issue` -> `supportIssue`
- `Tracking Timeline` -> `deliveryTimeline`

## User-Facing Language Rule
- Customer-facing copy should prefer `package` in sender and receiver interfaces.
- Internal tools may use `delivery` for the full record and `package` for the physical parcel.
- Status labels shown to customers must use human-readable wording, not raw enum values.

## Baseline Status
This glossary is now fixed enough to support naming across product, data, APIs, analytics, and support.
