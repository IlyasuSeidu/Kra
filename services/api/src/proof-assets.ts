import {
  confirmProofAssetUploadRequestSchema,
  createProofAssetUploadRequestSchema,
  createProofAssetUploadResponseSchema,
  proofAssetResponseSchema,
  type StationId,
  type Role
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRecord, DeliveryRepository } from "./deliveries";
import { ApiServiceError } from "./service-errors";

export type DeliveryProofAssetType = "signature" | "delivery_photo";
export type ProofAssetContentType = "image/jpeg" | "image/png" | "image/webp";
export type ProofAssetStatus = "pending_upload" | "uploaded" | "attached" | "rejected";

export interface ProofAssetRecord {
  proofAssetId: string;
  deliveryId: string;
  proofType: DeliveryProofAssetType;
  status: ProofAssetStatus;
  contentType: ProofAssetContentType;
  byteSize: number;
  storageBucket: string;
  storageObjectPath: string;
  requestedByUserId: string;
  requestedByRole: Role;
  createdAt: string;
  uploadExpiresAt: string;
  updatedAt: string;
  sha256?: string;
  storageGeneration?: string;
  uploadedAt?: string;
  attachedAt?: string;
  attachedByUserId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface ProofAssetRepository {
  create(record: ProofAssetRecord): Promise<void>;
  getById(proofAssetId: string): Promise<ProofAssetRecord | undefined>;
  markUploaded(input: {
    proofAssetId: string;
    uploadedAt: string;
    byteSize: number;
    sha256: string;
    storageGeneration?: string;
  }): Promise<void>;
  markAttached(input: {
    proofAssetId: string;
    attachedAt: string;
    attachedByUserId: string;
  }): Promise<void>;
}

export interface ProofStorageGateway {
  bucketName: string;
  createUploadUrl(input: {
    objectPath: string;
    contentType: ProofAssetContentType;
    expiresAt: string;
  }): Promise<string>;
}

export interface ProofAssetIdentityFactory {
  nextProofAssetId(): string;
}

export type CreateProofAssetUploadResponse = z.infer<
  typeof createProofAssetUploadResponseSchema
>;
export type ProofAssetResponse = z.infer<typeof proofAssetResponseSchema>;

const proofAssetUploadTtlMinutes = 15;
const completionEligibleStatuses: DeliveryRecord["currentStatus"][] = [
  "awaiting_receiver_pickup",
  "assigned_for_final_mile",
  "out_for_delivery"
];

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(new Date(isoTimestamp).getTime() + minutes * 60_000).toISOString();
}

function getExtension(contentType: ProofAssetContentType): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

function assertDeliveryCanAcceptProofAsset(delivery: DeliveryRecord): void {
  if (!completionEligibleStatuses.includes(delivery.currentStatus)) {
    throw new ApiServiceError(
      "INVALID_STATUS_TRANSITION",
      "Proof assets can only be prepared for pickup or final-mile completion states.",
      {
        deliveryId: delivery.deliveryId,
        currentStatus: delivery.currentStatus
      }
    );
  }
}

function assertUploadNotExpired(record: ProofAssetRecord, now: string): void {
  if (record.uploadExpiresAt < now) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset upload intent has expired.", {
      proofAssetId: record.proofAssetId,
      uploadExpiresAt: record.uploadExpiresAt
    });
  }
}

function mapRecordToResponse(record: ProofAssetRecord): ProofAssetResponse {
  return proofAssetResponseSchema.parse({
    proofAssetId: record.proofAssetId,
    deliveryId: record.deliveryId,
    proofReference: record.proofAssetId,
    proofType: record.proofType,
    status: record.status,
    contentType: record.contentType,
    byteSize: record.byteSize,
    storageBucket: record.storageBucket,
    storageObjectPath: record.storageObjectPath,
    ...(record.sha256 === undefined ? {} : { sha256: record.sha256 }),
    ...(record.storageGeneration === undefined
      ? {}
      : { storageGeneration: record.storageGeneration }),
    createdAt: record.createdAt,
    uploadExpiresAt: record.uploadExpiresAt,
    ...(record.uploadedAt === undefined ? {} : { uploadedAt: record.uploadedAt }),
    ...(record.attachedAt === undefined ? {} : { attachedAt: record.attachedAt })
  });
}

export async function createProofAssetUploadIntent(
  input: z.input<typeof createProofAssetUploadRequestSchema> & {
    deliveryId: string;
    requestedByUserId: string;
    requestedByRole: Role;
    requestedByStationId?: StationId;
  },
  deps: {
    deliveries: Pick<DeliveryRepository, "getById">;
    proofAssets: ProofAssetRepository;
    proofStorage: ProofStorageGateway;
    identityFactory: ProofAssetIdentityFactory;
    now: () => string;
  }
): Promise<{
  proofAsset: ProofAssetRecord;
  response: CreateProofAssetUploadResponse;
}> {
  const parsedInput = createProofAssetUploadRequestSchema.parse(input);
  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertDeliveryCanAcceptProofAsset(delivery);

  if (delivery.currentStatus === "awaiting_receiver_pickup") {
    if (
      input.requestedByRole !== "station_operator" ||
      input.requestedByStationId !== delivery.destinationStationId
    ) {
      throw new ApiServiceError(
        "FORBIDDEN",
        "Pickup proof asset upload is restricted to the destination station operator.",
        {
          deliveryId: delivery.deliveryId,
          requestedByUserId: input.requestedByUserId,
          requestedByRole: input.requestedByRole
        }
      );
    }
  } else if (
    !delivery.assignedFinalMileCourierId ||
    delivery.assignedFinalMileCourierId !== input.requestedByUserId
  ) {
    throw new ApiServiceError("FORBIDDEN", "Proof asset upload is restricted to the assigned courier.", {
      deliveryId: delivery.deliveryId,
      assignedFinalMileCourierId: delivery.assignedFinalMileCourierId,
      requestedByUserId: input.requestedByUserId
    });
  }

  const proofAssetId = deps.identityFactory.nextProofAssetId();
  const createdAt = deps.now();
  const uploadExpiresAt = addMinutes(createdAt, proofAssetUploadTtlMinutes);
  const storageObjectPath = [
    "proof-assets",
    input.deliveryId,
    `${proofAssetId}.${getExtension(parsedInput.contentType)}`
  ].join("/");
  const uploadUrl = await deps.proofStorage.createUploadUrl({
    objectPath: storageObjectPath,
    contentType: parsedInput.contentType,
    expiresAt: uploadExpiresAt
  });

  const proofAsset: ProofAssetRecord = {
    proofAssetId,
    deliveryId: input.deliveryId,
    proofType: parsedInput.proofType,
    status: "pending_upload",
    contentType: parsedInput.contentType,
    byteSize: parsedInput.byteSize,
    storageBucket: deps.proofStorage.bucketName,
    storageObjectPath,
    requestedByUserId: input.requestedByUserId,
    requestedByRole: input.requestedByRole,
    createdAt,
    uploadExpiresAt,
    updatedAt: createdAt,
    ...(parsedInput.sha256 === undefined ? {} : { sha256: parsedInput.sha256 })
  };

  await deps.proofAssets.create(proofAsset);

  return {
    proofAsset,
    response: createProofAssetUploadResponseSchema.parse({
      proofAssetId,
      deliveryId: input.deliveryId,
      proofReference: proofAssetId,
      proofType: parsedInput.proofType,
      status: "pending_upload",
      upload: {
        method: "PUT",
        url: uploadUrl,
        bucket: deps.proofStorage.bucketName,
        objectPath: storageObjectPath,
        contentType: parsedInput.contentType,
        expiresAt: uploadExpiresAt
      }
    })
  };
}

export async function confirmProofAssetUpload(
  input: z.input<typeof confirmProofAssetUploadRequestSchema> & {
    deliveryId: string;
    proofAssetId: string;
    confirmedByUserId: string;
  },
  deps: {
    proofAssets: ProofAssetRepository;
    now: () => string;
  }
): Promise<ProofAssetResponse> {
  const parsedInput = confirmProofAssetUploadRequestSchema.parse(input);
  const proofAsset = await deps.proofAssets.getById(input.proofAssetId);

  if (!proofAsset || proofAsset.deliveryId !== input.deliveryId) {
    throw new ApiServiceError("NOT_FOUND", "Proof asset was not found for this delivery.", {
      deliveryId: input.deliveryId,
      proofAssetId: input.proofAssetId
    });
  }

  if (proofAsset.status !== "pending_upload") {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset is not awaiting upload.", {
      proofAssetId: proofAsset.proofAssetId,
      status: proofAsset.status
    });
  }

  if (proofAsset.requestedByUserId !== input.confirmedByUserId) {
    throw new ApiServiceError("FORBIDDEN", "Proof asset upload confirmation is restricted to the requesting user.", {
      proofAssetId: proofAsset.proofAssetId,
      requestedByUserId: proofAsset.requestedByUserId,
      confirmedByUserId: input.confirmedByUserId
    });
  }

  const uploadedAt = deps.now();
  assertUploadNotExpired(proofAsset, uploadedAt);

  if (proofAsset.byteSize !== parsedInput.byteSize) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset byte size does not match intent.", {
      proofAssetId: proofAsset.proofAssetId,
      expectedByteSize: proofAsset.byteSize,
      receivedByteSize: parsedInput.byteSize
    });
  }

  if (proofAsset.sha256 !== undefined && proofAsset.sha256 !== parsedInput.sha256) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset hash does not match intent.", {
      proofAssetId: proofAsset.proofAssetId
    });
  }

  await deps.proofAssets.markUploaded({
    proofAssetId: proofAsset.proofAssetId,
    uploadedAt,
    byteSize: parsedInput.byteSize,
    sha256: parsedInput.sha256,
    ...(parsedInput.storageGeneration === undefined
      ? {}
      : { storageGeneration: parsedInput.storageGeneration })
  });

  return mapRecordToResponse({
    ...proofAsset,
    status: "uploaded",
    byteSize: parsedInput.byteSize,
    sha256: parsedInput.sha256,
    uploadedAt,
    updatedAt: uploadedAt,
    ...(parsedInput.storageGeneration === undefined
      ? {}
      : { storageGeneration: parsedInput.storageGeneration })
  });
}

export async function assertUploadedProofAssetForCompletion(
  input: {
    deliveryId: string;
    proofAssetId: string;
    proofType: DeliveryProofAssetType;
  },
  deps: {
    proofAssets: ProofAssetRepository;
  }
): Promise<ProofAssetRecord> {
  const proofAsset = await deps.proofAssets.getById(input.proofAssetId);

  if (!proofAsset || proofAsset.deliveryId !== input.deliveryId) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset does not belong to this delivery.", {
      deliveryId: input.deliveryId,
      proofAssetId: input.proofAssetId
    });
  }

  if (proofAsset.proofType !== input.proofType) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset type does not match completion proof type.", {
      proofAssetId: proofAsset.proofAssetId,
      expectedProofType: input.proofType,
      actualProofType: proofAsset.proofType
    });
  }

  if (proofAsset.status !== "uploaded" && proofAsset.status !== "attached") {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset must be uploaded before completion.", {
      proofAssetId: proofAsset.proofAssetId,
      status: proofAsset.status
    });
  }

  if (proofAsset.uploadedAt === undefined) {
    throw new ApiServiceError("VALIDATION_ERROR", "Proof asset upload confirmation is missing.", {
      proofAssetId: proofAsset.proofAssetId
    });
  }

  return proofAsset;
}

export async function markProofAssetAttachedToDelivery(
  input: {
    proofAssetId: string;
    attachedByUserId: string;
  },
  deps: {
    proofAssets: ProofAssetRepository;
    now: () => string;
  }
): Promise<void> {
  await deps.proofAssets.markAttached({
    proofAssetId: input.proofAssetId,
    attachedAt: deps.now(),
    attachedByUserId: input.attachedByUserId
  });
}
