import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import type { ApiRuntimeConfig } from "../config";
import { loadApiRuntimeConfig } from "../config";

function buildFirebaseCredential(config: ApiRuntimeConfig) {
  if (config.firebaseClientEmail && config.firebasePrivateKey) {
    return cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey: config.firebasePrivateKey
    });
  }

  return applicationDefault();
}

export function getFirebaseAdminApp(config: ApiRuntimeConfig = loadApiRuntimeConfig()) {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    credential: buildFirebaseCredential(config),
    projectId: config.firebaseProjectId,
    ...(config.firebaseStorageBucket === undefined
      ? {}
      : { storageBucket: config.firebaseStorageBucket })
  });
}

export function getKraFirestore(config: ApiRuntimeConfig = loadApiRuntimeConfig()): Firestore {
  return getFirestore(getFirebaseAdminApp(config));
}
