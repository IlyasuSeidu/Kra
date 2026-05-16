import { describe, expect, it } from "vitest";

import { loadApiRuntimeConfig } from "../config";

describe("api runtime config", () => {
  it("loads a project-only config for application default credentials", () => {
    expect(
      loadApiRuntimeConfig({
        FIREBASE_PROJECT_ID: "kra-prod"
      })
    ).toEqual({
      firebaseProjectId: "kra-prod"
    });
  });

  it("normalizes multiline private keys and rejects partial service-account config", () => {
    expect(
      loadApiRuntimeConfig({
        FIREBASE_PROJECT_ID: "kra-prod",
        FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@kra-prod.iam.gserviceaccount.com",
        FIREBASE_PRIVATE_KEY: "line1\\nline2"
      })
    ).toEqual({
      firebaseProjectId: "kra-prod",
      firebaseClientEmail: "firebase-adminsdk@kra-prod.iam.gserviceaccount.com",
      firebasePrivateKey: "line1\nline2"
    });

    expect(() =>
      loadApiRuntimeConfig({
        FIREBASE_PROJECT_ID: "kra-prod",
        FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@kra-prod.iam.gserviceaccount.com"
      })
    ).toThrow(
      "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must either both be set or both be omitted."
    );
  });
});
