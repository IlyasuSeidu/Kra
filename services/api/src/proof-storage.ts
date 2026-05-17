import { getStorage } from "firebase-admin/storage";

import type { ApiRuntimeConfig } from "./config";
import { getFirebaseAdminApp } from "./firestore/client";
import type { ProofStorageGateway } from "./proof-assets";
import { ApiServiceError } from "./service-errors";

export function createFirebaseProofStorageGateway(
  config: ApiRuntimeConfig
): ProofStorageGateway {
  if (!config.firebaseStorageBucket) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "Firebase Storage bucket is not configured.", {
      reason: "missing_firebase_storage_bucket"
    });
  }

  const bucket = getStorage(getFirebaseAdminApp(config)).bucket(config.firebaseStorageBucket);

  return {
    bucketName: config.firebaseStorageBucket,
    async createUploadUrl(input) {
      const [uploadUrl] = await bucket.file(input.objectPath).getSignedUrl({
        version: "v4",
        action: "write",
        expires: new Date(input.expiresAt),
        contentType: input.contentType
      });

      return uploadUrl;
    }
  };
}
