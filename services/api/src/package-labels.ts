import type { StationId } from "@kra/shared";

import type { DeliveryRecord } from "./deliveries";
import type { OperationalActor } from "./handoffs";
import { ApiServiceError } from "./service-errors";

export interface PackageLabelRecord {
  scanCode: string;
  deliveryId: string;
  trackingCode: string;
  originStationId: StationId;
  destinationStationId: StationId;
  createdAt: string;
  createdByUserId: string;
  createdByRole: OperationalActor["role"];
}

export interface PackageLabelRepository {
  getByScanCode(scanCode: string): Promise<PackageLabelRecord | undefined>;
  reserveForDelivery(label: PackageLabelRecord): Promise<PackageLabelRecord>;
}

function assertLabelMatchesDelivery(
  label: PackageLabelRecord,
  delivery: DeliveryRecord,
  scanCode: string
): void {
  if (label.deliveryId !== delivery.deliveryId) {
    throw new ApiServiceError(
      "PACKAGE_SCAN_MISMATCH",
      "Package scan code is bound to a different delivery.",
      {
        deliveryId: delivery.deliveryId,
        scanCode,
        boundDeliveryId: label.deliveryId
      }
    );
  }
}

export async function reservePackageLabelForDelivery(
  input: {
    delivery: DeliveryRecord;
    scanCode: string;
    actor: OperationalActor;
    occurredAt: string;
  },
  repository: PackageLabelRepository
): Promise<PackageLabelRecord> {
  const reservedLabel = await repository.reserveForDelivery({
    scanCode: input.scanCode,
    deliveryId: input.delivery.deliveryId,
    trackingCode: input.delivery.trackingCode,
    originStationId: input.delivery.originStationId,
    destinationStationId: input.delivery.destinationStationId,
    createdAt: input.occurredAt,
    createdByUserId: input.actor.actorId,
    createdByRole: input.actor.role
  });

  assertLabelMatchesDelivery(reservedLabel, input.delivery, input.scanCode);

  return reservedLabel;
}

export async function assertPackageScanMatchesDelivery(
  input: {
    delivery: DeliveryRecord;
    scanCode: string;
  },
  repository: PackageLabelRepository
): Promise<PackageLabelRecord> {
  const label = await repository.getByScanCode(input.scanCode);

  if (!label) {
    throw new ApiServiceError("PACKAGE_SCAN_MISMATCH", "Package scan code is not registered.", {
      deliveryId: input.delivery.deliveryId,
      scanCode: input.scanCode
    });
  }

  assertLabelMatchesDelivery(label, input.delivery, input.scanCode);

  return label;
}
