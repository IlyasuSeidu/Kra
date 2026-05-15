# Sample Data

## Example Delivery
- `deliveryId`: `DEL-0001`
- `senderName`: `Ama Mensah`
- `receiverName`: `Kojo Asante`
- `originStationId`: `ST-KMS-01`
- `destinationStationId`: `ST-ACC-02`
- `serviceType`: `doorstep`
- `currentStatus`: `in_transit`
- `paymentStatus`: `paid`

## Example Handoff Event
- `eventId`: `HE-0001`
- `deliveryId`: `DEL-0001`
- `fromRole`: `station_operator`
- `toRole`: `driver`
- `proofType`: `qr_scan`
- `timestamp`: `2026-04-22T09:00:00Z`

## Example Support Issue
- `issueId`: `ISS-0003`
- `deliveryId`: `DEL-0001`
- `severity`: `p2`
- `category`: `delay`
- `status`: `open`

## Approved Fixture Format
All examples should be maintained as JSON fixtures in code and mirrored here for documentation.

## Example Created Delivery
```json
{
  "deliveryId": "DEL-0001",
  "senderId": "USR-S-001",
  "receiverName": "Kojo Asante",
  "receiverPhone": "+233200000001",
  "originStationId": "ST-ACC-01",
  "destinationStationId": "ST-KMS-01",
  "serviceType": "standard",
  "currentStatus": "created",
  "paymentStatus": "pending"
}
```

## Example Final-Mile Delivery
```json
{
  "deliveryId": "DEL-0021",
  "currentStatus": "out_for_delivery",
  "paymentStatus": "paid",
  "serviceType": "doorstep",
  "currentCustodyRole": "final_mile_courier"
}
```

## Example Refund Case
```json
{
  "refundId": "REF-0003",
  "paymentId": "PAY-0003",
  "deliveryId": "DEL-0100",
  "amountGhs": 15,
  "status": "completed",
  "reason": "doorstep_not_attempted"
}
```

## Example Issue Case
```json
{
  "issueId": "ISS-0003",
  "deliveryId": "DEL-0001",
  "severity": "p2",
  "category": "delay",
  "status": "open"
}
```

## Baseline Status
This file is now concrete enough to support documentation, fixtures, and test-data scaffolding.
