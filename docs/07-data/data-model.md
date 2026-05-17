# Data Model

## Core Entities
- `User`
- `RoleAssignment`
- `Station`
- `Delivery`
- `Package`
- `PackageLabel`
- `HandoffEvent`
- `Payment`
- `SupportIssue`
- `Notification`
- `ProofAsset`
- `Rating`
- `Route`

## Key Delivery Fields
- `deliveryId`
- `senderId`
- `receiverName`
- `receiverPhone`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `currentCustodyActorId`

## Modeling Rule
The package can be modeled as part of the delivery in early versions if one delivery always maps to one parcel unit. If multi-parcel deliveries are expected, keep `Package` as a first-class child entity.

## Approved V1 Entity Decisions
- `Delivery` is the parent operational aggregate.
- `Package` remains a child entity, but v1 supports exactly `one package per delivery`.
- `Route` remains configuration data, not a mutable event aggregate.

## Required Fields
### Delivery
- `deliveryId`
- `senderId`
- `receiverName`
- `receiverPhone`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `currentStatus`
- `paymentStatus`
- `createdAt`

### Package
- `packageId`
- `deliveryId`
- `description`
- `weightKg`
- `sizeTier`
- `isFragile`
- `declaredValueGhs`

### PackageLabel
- `scanCode`
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `createdAt`
- `createdByUserId`

### Payment
- `paymentId`
- `deliveryId`
- `provider`
- `providerReference`
- `amountGhs`
- `status`

### HandoffEvent
- `eventId`
- `deliveryId`
- `fromRole`
- `toRole`
- `proofType`
- `occurredAt`

### ProofAsset
- `proofAssetId`
- `deliveryId`
- `proofType`
- `status`
- `contentType`
- `byteSize`
- `storageBucket`
- `storageObjectPath`
- `sha256`
- `createdAt`
- `uploadedAt`
- `attachedAt`

## Optional Fields
- `addressText`
- `specialHandlingNotes`
- `gpsSnapshot`
- `proofAssetId`
- `issueId`

## Source Of Truth Rule
- `currentStatus`, `paymentStatus`, and `currentCustodyActorId` on the delivery are materialized current state.
- `PackageLabel` is immutable after origin intake and is the source of truth for whether a scan belongs to a delivery.
- Event collections remain the source of truth for how the state changed.

## Baseline Status
This file is now concrete enough to define the v1 domain model.
