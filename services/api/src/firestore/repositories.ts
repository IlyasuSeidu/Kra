import type { Firestore } from "firebase-admin/firestore";
import { deliveryStatuses } from "@kra/shared";

import type {
  AdminDeliveryMetricsRepository,
  AdminPaymentMetricsRepository,
  AdminWebhookMetricsRepository
} from "../admin";
import type { DeliveryRecord, DeliveryRepository } from "../deliveries";
import type {
  DeliveryEventRepository,
  DeliveryLifecycleRepository,
  HandoffEventRepository
} from "../handoffs";
import type {
  PaymentRecord,
  PaymentRepository
} from "../payments";
import type {
  PaymentLookupRepository,
  WebhookEventRecord,
  WebhookEventRepository
} from "../payment-webhooks";
import type {
  PublicTrackingVerificationRepository
} from "../public-tracking-verification";
import type { RefundPaymentRepository } from "../refunds";
import {
  deliveryConverter,
  deliveryDocumentPath,
  deliveryEventConverter,
  firestoreCollections,
  handoffEventConverter,
  paymentConverter,
  publicTrackingPhoneChallengeConverter,
  publicTrackingVerificationAttemptConverter,
  publicTrackingVerificationGrantConverter,
  webhookEventConverter,
  type DeliveryDocument,
  type PaymentDocument
} from "./schema";

function toDeliveryDocument(delivery: DeliveryRecord, updatedAt: string): DeliveryDocument {
  return {
    ...delivery,
    updatedAt
  };
}

function fromDeliveryDocument(document: DeliveryDocument): DeliveryRecord {
  const { updatedAt: _updatedAt, ...delivery } = document;

  return delivery;
}

function toPaymentDocument(payment: PaymentRecord, updatedAt: string): PaymentDocument {
  return {
    ...payment,
    updatedAt
  };
}

function fromPaymentDocument(document: PaymentDocument): PaymentRecord {
  const { updatedAt: _updatedAt, ...payment } = document;

  return payment;
}

export function createFirestoreDeliveryRepository(
  firestore: Firestore,
  now: () => string
): DeliveryRepository & DeliveryLifecycleRepository & AdminDeliveryMetricsRepository {
  const deliveriesCollection = firestore
    .collection(firestoreCollections.deliveries)
    .withConverter(deliveryConverter);

  return {
    async create(delivery) {
      const updatedAt = now();
      await deliveriesCollection.doc(delivery.deliveryId).set(toDeliveryDocument(delivery, updatedAt));
    },
    async getById(deliveryId) {
      const snapshot = await deliveriesCollection.doc(deliveryId).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return fromDeliveryDocument(snapshot.data() as DeliveryDocument);
    },
    async getByTrackingCode(trackingCode) {
      const snapshot = await deliveriesCollection.where("trackingCode", "==", trackingCode).limit(1).get();
      const match = snapshot.docs[0];

      if (!match) {
        return undefined;
      }

      return fromDeliveryDocument(match.data());
    },
    async updatePaymentStatus(deliveryId, paymentStatus) {
      await deliveriesCollection.doc(deliveryId).set(
        {
          paymentStatus,
          updatedAt: now()
        },
        { merge: true }
      );
    },
    async save(delivery) {
      await deliveriesCollection.doc(delivery.deliveryId).set(
        toDeliveryDocument(delivery, now()),
        { merge: true }
      );
    },
    async countByStatus() {
      const counts = await Promise.all(
        deliveryStatuses.map(async (status) => {
          const snapshot = await deliveriesCollection.where("currentStatus", "==", status).count().get();

          return {
            status,
            count: snapshot.data().count
          };
        })
      );

      return counts.filter((entry) => entry.count > 0);
    }
  };
}

export function createFirestorePaymentRepository(
  firestore: Firestore,
  now: () => string
): PaymentRepository &
  PaymentLookupRepository &
  RefundPaymentRepository &
  AdminPaymentMetricsRepository {
  const paymentsCollection = firestore
    .collection(firestoreCollections.payments)
    .withConverter(paymentConverter);
  const paymentStatuses: PaymentRecord["status"][] = [
    "pending",
    "confirmed",
    "failed",
    "refund_pending",
    "refunded"
  ];

  return {
    async create(payment: PaymentRecord) {
      await paymentsCollection.doc(payment.paymentId).set(toPaymentDocument(payment, now()));
    },
    async listByDeliveryId(deliveryId: string) {
      const snapshot = await paymentsCollection
        .where("deliveryId", "==", deliveryId)
        .orderBy("initiatedAt", "desc")
        .get();

      return snapshot.docs.map((document) => fromPaymentDocument(document.data()));
    },
    async updateStatus(
      paymentId: string,
      status: Extract<PaymentRecord["status"], "pending" | "confirmed" | "failed">,
      metadata: {
        verifiedAt: string;
        failureReason?: string;
      }
    ) {
      await paymentsCollection.doc(paymentId).set(
        {
          status,
          updatedAt: now(),
          verifiedAt: metadata.verifiedAt,
          ...(metadata.failureReason === undefined
            ? {}
            : { failureReason: metadata.failureReason })
        },
        { merge: true }
      );
    },
    async getByProviderReference(providerReference: string) {
      const snapshot = await paymentsCollection
        .where("providerReference", "==", providerReference)
        .limit(1)
        .get();
      const match = snapshot.docs[0];

      if (!match) {
        return undefined;
      }

      return fromPaymentDocument(match.data());
    },
    async getById(paymentId: string) {
      const snapshot = await paymentsCollection.doc(paymentId).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return fromPaymentDocument(snapshot.data() as PaymentDocument);
    },
    async markRefundPending(input: {
      paymentId: string;
      refundAmountGhs: number;
      refundReason: string;
      requestedAt: string;
    }) {
      await paymentsCollection.doc(input.paymentId).set(
        {
          status: "refund_pending",
          refundAmountGhs: input.refundAmountGhs,
          refundReason: input.refundReason,
          refundRequestedAt: input.requestedAt,
          updatedAt: now()
        },
        { merge: true }
      );
    },
    async countByStatus() {
      const counts = await Promise.all(
        paymentStatuses.map(async (status) => {
          const snapshot = await paymentsCollection.where("status", "==", status).count().get();

          return {
            status,
            count: snapshot.data().count
          };
        })
      );

      return counts.filter((entry) => entry.count > 0);
    }
  };
}

export function createFirestorePublicTrackingVerificationRepository(
  firestore: Firestore
): PublicTrackingVerificationRepository {
  const challengesCollection = firestore
    .collection(firestoreCollections.publicTrackingPhoneChallenges)
    .withConverter(publicTrackingPhoneChallengeConverter);
  const attemptsCollection = firestore
    .collection(firestoreCollections.publicTrackingVerificationAttempts)
    .withConverter(publicTrackingVerificationAttemptConverter);
  const grantsCollection = firestore
    .collection(firestoreCollections.publicTrackingVerificationGrants)
    .withConverter(publicTrackingVerificationGrantConverter);

  return {
    async getActiveGrant(trackingCode, phone, asOf) {
      const snapshot = await grantsCollection
        .where("trackingCode", "==", trackingCode)
        .where("phone", "==", phone)
        .where("expiresAt", ">", asOf)
        .orderBy("expiresAt", "desc")
        .limit(1)
        .get();

      return snapshot.docs[0]?.data();
    },
    async getLatestChallenge(trackingCode, phone) {
      const snapshot = await challengesCollection
        .where("trackingCode", "==", trackingCode)
        .where("phone", "==", phone)
        .orderBy("issuedAt", "desc")
        .limit(1)
        .get();

      return snapshot.docs[0]?.data();
    },
    async listFailedAttemptsSince(trackingCode, since) {
      const snapshot = await attemptsCollection
        .where("trackingCode", "==", trackingCode)
        .where("attemptedAt", ">=", since)
        .orderBy("attemptedAt", "asc")
        .get();

      return snapshot.docs.map((document) => document.data());
    },
    async createFailedAttempt(attempt) {
      await attemptsCollection.doc(attempt.attemptId).set(attempt);
    },
    async consumeChallenge(challengeId, consumedAt) {
      await challengesCollection.doc(challengeId).set(
        {
          consumedAt
        },
        { merge: true }
      );
    },
    async createGrant(grant) {
      await grantsCollection.doc(grant.verificationId).set(grant);
    }
  };
}

export function createFirestoreWebhookEventRepository(
  firestore: Firestore
): WebhookEventRepository & AdminWebhookMetricsRepository {
  const webhookEventsCollection = firestore
    .collection(firestoreCollections.webhookEvents)
    .withConverter(webhookEventConverter);
  const processingStatuses: WebhookEventRecord["processingStatus"][] = [
    "received",
    "processed",
    "duplicate",
    "unmatched",
    "accepted_pending",
    "manual_review"
  ];

  return {
    async getByProviderReferenceAndEventType(providerReference, eventType) {
      const snapshot = await webhookEventsCollection
        .where("providerReference", "==", providerReference)
        .where("eventType", "==", eventType)
        .limit(1)
        .get();

      return snapshot.docs[0]?.data();
    },
    async create(event) {
      await webhookEventsCollection.doc(event.eventId).set(event);
    },
    async updateProcessing(eventId, update) {
      await webhookEventsCollection.doc(eventId).set(update, { merge: true });
    },
    async countByProcessingStatus() {
      const counts = await Promise.all(
        processingStatuses.map(async (processingStatus) => {
          const snapshot = await webhookEventsCollection
            .where("processingStatus", "==", processingStatus)
            .count()
            .get();

          return {
            processingStatus,
            count: snapshot.data().count
          };
        })
      );

      return counts.filter((entry) => entry.count > 0);
    }
  };
}

export function createFirestoreDeliveryEventRepository(
  firestore: Firestore
): DeliveryEventRepository {
  return {
    async create(event) {
      await firestore
        .doc(deliveryDocumentPath(event.deliveryId))
        .collection(firestoreCollections.deliveryEvents)
        .withConverter(deliveryEventConverter)
        .doc(event.eventId)
        .set(event);
    }
  };
}

export function createFirestoreHandoffEventRepository(
  firestore: Firestore
): HandoffEventRepository {
  const handoffEventsCollection = firestore
    .collection(firestoreCollections.handoffEvents)
    .withConverter(handoffEventConverter);

  return {
    async create(event) {
      await handoffEventsCollection.doc(event.handoffEventId).set(event);
    }
  };
}

export function createFirestoreApiRepositories(
  firestore: Firestore,
  now: () => string
) {
  return {
    deliveries: createFirestoreDeliveryRepository(firestore, now),
    payments: createFirestorePaymentRepository(firestore, now),
    verification: createFirestorePublicTrackingVerificationRepository(firestore),
    webhookEvents: createFirestoreWebhookEventRepository(firestore),
    deliveryEvents: createFirestoreDeliveryEventRepository(firestore),
    handoffEvents: createFirestoreHandoffEventRepository(firestore)
  };
}
