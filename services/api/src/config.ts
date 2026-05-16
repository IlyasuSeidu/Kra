import { z } from "zod";

const apiRuntimeEnvSchema = z
  .object({
    FIREBASE_PROJECT_ID: z.string().trim().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().trim().min(3).optional(),
    FIREBASE_PRIVATE_KEY: z.string().trim().min(1).optional(),
    FIRESTORE_EMULATOR_HOST: z.string().trim().min(1).optional(),
    API_PORT: z.coerce.number().int().positive().max(65535).optional(),
    MTN_MOMO_BASE_URL: z.string().trim().url().optional(),
    MTN_MOMO_COLLECTION_PRIMARY_KEY: z.string().trim().min(8).optional(),
    MTN_MOMO_API_USER: z.string().trim().min(8).optional(),
    MTN_MOMO_API_KEY: z.string().trim().min(8).optional(),
    MTN_MOMO_TARGET_ENV: z.enum(["sandbox", "mtnghana", "production"]).optional(),
    MTN_MOMO_WEBHOOK_SHARED_SECRET: z.string().trim().min(12).optional()
  })
  .superRefine((value, ctx) => {
    const hasClientEmail = value.FIREBASE_CLIENT_EMAIL !== undefined;
    const hasPrivateKey = value.FIREBASE_PRIVATE_KEY !== undefined;

    if (hasClientEmail !== hasPrivateKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must either both be set or both be omitted.",
        path: hasClientEmail ? ["FIREBASE_PRIVATE_KEY"] : ["FIREBASE_CLIENT_EMAIL"]
      });
    }

    const momoFields = [
      value.MTN_MOMO_BASE_URL,
      value.MTN_MOMO_COLLECTION_PRIMARY_KEY,
      value.MTN_MOMO_API_USER,
      value.MTN_MOMO_API_KEY,
      value.MTN_MOMO_TARGET_ENV,
      value.MTN_MOMO_WEBHOOK_SHARED_SECRET
    ];
    const hasAnyMomoField = momoFields.some((field) => field !== undefined);
    const hasAllMomoFields = momoFields.every((field) => field !== undefined);

    if (hasAnyMomoField && !hasAllMomoFields) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "All MTN MoMo runtime variables must be set together when MoMo payments are enabled.",
        path: ["MTN_MOMO_BASE_URL"]
      });
    }
  });

export interface ApiRuntimeConfig {
  firebaseProjectId: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  firestoreEmulatorHost?: string;
  apiPort: number;
  mtnMomo?: {
    baseUrl: string;
    collectionPrimaryKey: string;
    apiUser: string;
    apiKey: string;
    targetEnvironment: "sandbox" | "mtnghana" | "production";
    webhookSharedSecret: string;
  };
}

export function loadApiRuntimeConfig(
  env: Record<string, string | undefined> = process.env
): ApiRuntimeConfig {
  const parsed = apiRuntimeEnvSchema.parse({
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY,
    FIRESTORE_EMULATOR_HOST: env.FIRESTORE_EMULATOR_HOST,
    API_PORT: env.API_PORT,
    MTN_MOMO_BASE_URL: env.MTN_MOMO_BASE_URL,
    MTN_MOMO_COLLECTION_PRIMARY_KEY: env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
    MTN_MOMO_API_USER: env.MTN_MOMO_API_USER,
    MTN_MOMO_API_KEY: env.MTN_MOMO_API_KEY,
    MTN_MOMO_TARGET_ENV: env.MTN_MOMO_TARGET_ENV,
    MTN_MOMO_WEBHOOK_SHARED_SECRET: env.MTN_MOMO_WEBHOOK_SHARED_SECRET
  });

  return {
    firebaseProjectId: parsed.FIREBASE_PROJECT_ID,
    apiPort: parsed.API_PORT ?? 8080,
    ...(parsed.FIREBASE_CLIENT_EMAIL === undefined
      ? {}
      : { firebaseClientEmail: parsed.FIREBASE_CLIENT_EMAIL }),
    ...(parsed.FIREBASE_PRIVATE_KEY === undefined
      ? {}
      : { firebasePrivateKey: parsed.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }),
    ...(parsed.FIRESTORE_EMULATOR_HOST === undefined
      ? {}
      : { firestoreEmulatorHost: parsed.FIRESTORE_EMULATOR_HOST }),
    ...(parsed.MTN_MOMO_BASE_URL === undefined
      ? {}
      : {
          mtnMomo: {
            baseUrl: parsed.MTN_MOMO_BASE_URL,
            collectionPrimaryKey: parsed.MTN_MOMO_COLLECTION_PRIMARY_KEY as string,
            apiUser: parsed.MTN_MOMO_API_USER as string,
            apiKey: parsed.MTN_MOMO_API_KEY as string,
            targetEnvironment: parsed.MTN_MOMO_TARGET_ENV as "sandbox" | "mtnghana" | "production",
            webhookSharedSecret: parsed.MTN_MOMO_WEBHOOK_SHARED_SECRET as string
          }
        })
  };
}
