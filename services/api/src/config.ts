import { z } from "zod";

const apiRuntimeEnvSchema = z
  .object({
    FIREBASE_PROJECT_ID: z.string().trim().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().trim().min(3).optional(),
    FIREBASE_PRIVATE_KEY: z.string().trim().min(1).optional(),
    FIRESTORE_EMULATOR_HOST: z.string().trim().min(1).optional()
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
  });

export interface ApiRuntimeConfig {
  firebaseProjectId: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  firestoreEmulatorHost?: string;
}

export function loadApiRuntimeConfig(
  env: Record<string, string | undefined> = process.env
): ApiRuntimeConfig {
  const parsed = apiRuntimeEnvSchema.parse({
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY,
    FIRESTORE_EMULATOR_HOST: env.FIRESTORE_EMULATOR_HOST
  });

  return {
    firebaseProjectId: parsed.FIREBASE_PROJECT_ID,
    ...(parsed.FIREBASE_CLIENT_EMAIL === undefined
      ? {}
      : { firebaseClientEmail: parsed.FIREBASE_CLIENT_EMAIL }),
    ...(parsed.FIREBASE_PRIVATE_KEY === undefined
      ? {}
      : { firebasePrivateKey: parsed.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }),
    ...(parsed.FIRESTORE_EMULATOR_HOST === undefined
      ? {}
      : { firestoreEmulatorHost: parsed.FIRESTORE_EMULATOR_HOST })
  };
}
