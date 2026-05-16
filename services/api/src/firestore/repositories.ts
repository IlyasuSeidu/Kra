import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { deliveryStatuses } from "@kra/shared";

import type {
  AdminDeliveryMetricsRepository,
  AdminIssueMetricsRepository,
  AdminPaymentMetricsRepository,
  AdminWebhookMetricsRepository
} from "../admin";
import type { AuditEventRecord, AuditEventRepository } from "../audit";
import type { AuthPrincipal } from "../auth";
import type { DeliveryRecord, DeliveryRepository } from "../deliveries";
import type {
  DeliveryEventReadRepository,
  DeliveryListRepository,
  HandoffEventReadRepository
} from "../delivery-queries";
import type {
  DeliveryEventRepository,
  DeliveryLifecycleRepository,
  HandoffEventRepository
} from "../handoffs";
import type { SupportIssueRecord, SupportIssueRepository } from "../issues";
import type { NotificationRepository } from "../notification-feed";
import type {
  OutboundNotificationRecord,
  OutboundNotificationRepository
} from "../outbound-notifications";
import type {
  PaymentRecord,
  PaymentRepository
} from "../payments";
import type {
  PaymentLookupRepository,
  WebhookEventRecord,
  WebhookEventRepository
} from "../payment-webhooks";
import type { IdempotencyRecord, IdempotencyRepository } from "../idempotency";
import type {
  PublicTrackingVerificationRepository
} from "../public-tracking-verification";
import type { RefundPaymentRepository } from "../refunds";
import type { StationRepository } from "../stations";
import type { UserRepository, UserRecord } from "../users";
import {
  auditEventConverter,
  deliveryConverter,
  deliveryDocumentPath,
  deliveryEventConverter,
  firestoreCollections,
  handoffEventConverter,
  idempotencyRecordConverter,
  notificationConverter,
  outboundNotificationConverter,
  paymentConverter,
  publicTrackingPhoneChallengeConverter,
  publicTrackingVerificationAttemptConverter,
  publicTrackingVerificationGrantConverter,
  stationConverter,
  supportIssueConverter,
  type DeliveryDocument,
  type IdempotencyRecordDocument,
  type PaymentDocument,
  userConverter,
  webhookEventConverter
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

function fromIdempotencyRecordDocument(document: IdempotencyRecordDocument): IdempotencyRecord {
  return document;
}

function sortUsersByUpdatedAt(users: UserRecord[]): UserRecord[] {
  return [...users].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function filterUsers(
  users: UserRecord[],
  input: {
    role?: UserRecord["role"];
    status?: UserRecord["status"];
    stationId?: UserRecord["stationId"];
  }
): UserRecord[] {
  return users.filter((user) => {
    if (input.role && user.role !== input.role) {
      return false;
    }

    if (input.status && user.status !== input.status) {
      return false;
    }

    if (input.stationId && user.stationId !== input.stationId) {
      return false;
    }

    return true;
  });
}

const activeQueueStatuses: DeliveryRecord["currentStatus"][] = [
  "created",
  "received_at_origin",
  "awaiting_driver_assignment",
  "assigned_to_driver",
  "dispatched_from_origin",
  "in_transit",
  "received_at_destination",
  "awaiting_receiver_pickup",
  "awaiting_final_mile_assignment",
  "assigned_for_final_mile",
  "out_for_delivery",
  "issue_reported",
  "on_hold"
];

function sortDeliveriesByLatestOccurredAt(deliveries: DeliveryRecord[]): DeliveryRecord[] {
  return [...deliveries].sort((left, right) =>
    right.latestEvent.occurredAt.localeCompare(left.latestEvent.occurredAt)
  );
}

function filterDeliveries(
  deliveries: DeliveryRecord[],
  input: {
    status?: DeliveryRecord["currentStatus"];
    paymentStatus?: DeliveryRecord["paymentStatus"];
  }
): DeliveryRecord[] {
  return deliveries.filter((delivery) => {
    if (input.status && delivery.currentStatus !== input.status) {
      return false;
    }

    if (input.paymentStatus && delivery.paymentStatus !== input.paymentStatus) {
      return false;
    }

    return true;
  });
}

function sortSupportIssuesByUpdatedAt(issues: SupportIssueRecord[]): SupportIssueRecord[] {
  return [...issues].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function filterSupportIssues(
  issues: SupportIssueRecord[],
  input: {
    status?: SupportIssueRecord["status"];
    severity?: SupportIssueRecord["severity"];
  }
): SupportIssueRecord[] {
  return issues.filter((issue) => {
    if (input.status && issue.status !== input.status) {
      return false;
    }

    if (input.severity && issue.severity !== input.severity) {
      return false;
    }

    return true;
  });
}

function sortAuditEventsByOccurredAt(events: AuditEventRecord[]): AuditEventRecord[] {
  return [...events].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

export function createFirestoreUserRepository(
  firestore: Firestore
): UserRepository {
  const usersCollection = firestore.collection(firestoreCollections.users).withConverter(userConverter);

  return {
    async getById(userId) {
      const snapshot = await usersCollection.doc(userId).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return snapshot.data();
    },
    async save(user) {
      await usersCollection.doc(user.userId).set(user);
    },
    async list(input) {
      const snapshot = await usersCollection.orderBy("updatedAt", "desc").limit(Math.max(input.limit * 3, 100)).get();

      return filterUsers(
        sortUsersByUpdatedAt(snapshot.docs.map((document) => document.data())),
        input
      ).slice(0, input.limit);
    }
  };
}

export function createFirestoreStationRepository(
  firestore: Firestore
): StationRepository {
  const stationsCollection = firestore
    .collection(firestoreCollections.stations)
    .withConverter(stationConverter);

  return {
    async getById(stationId) {
      const snapshot = await stationsCollection.doc(stationId).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return snapshot.data();
    },
    async list() {
      const snapshot = await stationsCollection.orderBy("updatedAt", "desc").get();

      return snapshot.docs.map((document) => document.data());
    },
    async save(station) {
      await stationsCollection.doc(station.stationId).set(station);
    }
  };
}

export function createFirestoreNotificationRepository(
  firestore: Firestore
): NotificationRepository {
  const notificationsCollection = firestore
    .collection(firestoreCollections.notifications)
    .withConverter(notificationConverter);

  return {
    async getByDedupeKey(dedupeKey) {
      const snapshot = await notificationsCollection.where("dedupeKey", "==", dedupeKey).limit(1).get();
      const match = snapshot.docs[0];

      return match?.data();
    },
    async create(notification) {
      await notificationsCollection.doc(notification.notificationId).set(notification);
    },
    async listByRecipientUserId(input) {
      const snapshot = await notificationsCollection
        .where("recipientUserId", "==", input.recipientUserId)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();

      return snapshot.docs.map((document) => document.data());
    }
  };
}

function sortOutboundNotificationsByNextAttemptAt(
  records: OutboundNotificationRecord[]
): OutboundNotificationRecord[] {
  return [...records].sort((left, right) =>
    left.nextAttemptAt.localeCompare(right.nextAttemptAt)
  );
}

export function createFirestoreOutboundNotificationRepository(
  firestore: Firestore
): OutboundNotificationRepository {
  const outboundNotificationsCollection = firestore
    .collection(firestoreCollections.outboundNotifications)
    .withConverter(outboundNotificationConverter);

  async function listDueByStatus(input: {
    status: Extract<OutboundNotificationRecord["status"], "pending" | "failed">;
    now: string;
    limit: number;
  }): Promise<OutboundNotificationRecord[]> {
    const snapshot = await outboundNotificationsCollection
      .where("status", "==", input.status)
      .where("nextAttemptAt", "<=", input.now)
      .orderBy("nextAttemptAt", "asc")
      .limit(input.limit)
      .get();

    return snapshot.docs.map((document) => document.data());
  }

  return {
    async getByDedupeKey(dedupeKey) {
      const snapshot = await outboundNotificationsCollection
        .where("dedupeKey", "==", dedupeKey)
        .limit(1)
        .get();
      const match = snapshot.docs[0];

      return match?.data();
    },
    async create(record) {
      await outboundNotificationsCollection.doc(record.outboundNotificationId).create(record);
    },
    async markSent(input) {
      await outboundNotificationsCollection.doc(input.outboundNotificationId).set(
        {
          status: "sent",
          attemptCount: input.attemptCount,
          lastAttemptAt: input.attemptedAt,
          sentAt: input.attemptedAt,
          lastError: FieldValue.delete(),
          updatedAt: input.attemptedAt
        },
        { merge: true }
      );
    },
    async markFailed(input) {
      await outboundNotificationsCollection.doc(input.outboundNotificationId).set(
        {
          status: input.status,
          attemptCount: input.attemptCount,
          lastAttemptAt: input.attemptedAt,
          nextAttemptAt: input.nextAttemptAt,
          lastError: input.lastError,
          updatedAt: input.attemptedAt
        },
        { merge: true }
      );
    },
    async listDue(input) {
      const [pending, failed] = await Promise.all([
        listDueByStatus({ status: "pending", now: input.now, limit: input.limit }),
        listDueByStatus({ status: "failed", now: input.now, limit: input.limit })
      ]);

      return sortOutboundNotificationsByNextAttemptAt([...pending, ...failed]).slice(0, input.limit);
    }
  };
}

export function createFirestoreDeliveryRepository(
  firestore: Firestore,
  now: () => string
): DeliveryRepository &
  DeliveryLifecycleRepository &
  DeliveryListRepository &
  AdminDeliveryMetricsRepository {
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
    async listAccessible(input: {
      principal: AuthPrincipal;
      status?: DeliveryRecord["currentStatus"];
      paymentStatus?: DeliveryRecord["paymentStatus"];
      limit: number;
    }) {
      const scanLimit = Math.max(input.limit * 3, 100);

      if (input.principal.role === "sender") {
        const snapshot = await deliveriesCollection
          .where("senderId", "==", input.principal.userId)
          .orderBy("latestEvent.occurredAt", "desc")
          .limit(scanLimit)
          .get();

        return filterDeliveries(
          snapshot.docs.map((document) => fromDeliveryDocument(document.data())),
          input
        ).slice(0, input.limit);
      }

      if (input.principal.role === "driver") {
        const snapshot = await deliveriesCollection
          .where("assignedDriverId", "==", input.principal.userId)
          .orderBy("latestEvent.occurredAt", "desc")
          .limit(scanLimit)
          .get();

        return filterDeliveries(
          snapshot.docs.map((document) => fromDeliveryDocument(document.data())),
          input
        ).slice(0, input.limit);
      }

      if (input.principal.role === "final_mile_courier") {
        const snapshot = await deliveriesCollection
          .where("assignedFinalMileCourierId", "==", input.principal.userId)
          .orderBy("latestEvent.occurredAt", "desc")
          .limit(scanLimit)
          .get();

        return filterDeliveries(
          snapshot.docs.map((document) => fromDeliveryDocument(document.data())),
          input
        ).slice(0, input.limit);
      }

      if (input.principal.role === "station_operator") {
        const [originSnapshot, destinationSnapshot] = await Promise.all([
          deliveriesCollection
            .where("originStationId", "==", input.principal.stationId)
            .orderBy("latestEvent.occurredAt", "desc")
            .limit(scanLimit)
            .get(),
          deliveriesCollection
            .where("destinationStationId", "==", input.principal.stationId)
            .orderBy("latestEvent.occurredAt", "desc")
            .limit(scanLimit)
            .get()
        ]);

        const byId = new Map<string, DeliveryRecord>();

        for (const snapshot of [originSnapshot, destinationSnapshot]) {
          for (const document of snapshot.docs) {
            const delivery = fromDeliveryDocument(document.data());
            byId.set(delivery.deliveryId, delivery);
          }
        }

        return filterDeliveries(sortDeliveriesByLatestOccurredAt([...byId.values()]), input).slice(
          0,
          input.limit
        );
      }

      const snapshot = await deliveriesCollection
        .orderBy("latestEvent.occurredAt", "desc")
        .limit(scanLimit)
        .get();

      return filterDeliveries(
        snapshot.docs.map((document) => fromDeliveryDocument(document.data())),
        input
      ).slice(0, input.limit);
    },
    async listRecent(limit) {
      const snapshot = await deliveriesCollection
        .orderBy("latestEvent.occurredAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((document) => fromDeliveryDocument(document.data()));
    },
    async countActiveQueuesByStation() {
      const counts = await Promise.all(
        deliveryStatuses.map(async (status) => {
          if (!activeQueueStatuses.includes(status)) {
            return [];
          }

          const snapshot = await deliveriesCollection
            .where("originStationId", "in", ["ST-ACC-01", "ST-KMS-01", "ST-TML-01"])
            .where("currentStatus", "==", status)
            .get();

          return snapshot.docs.map((document) => document.data());
        })
      );

      const aggregate = new Map<DeliveryRecord["originStationId"], number>();

      for (const deliveries of counts) {
        for (const delivery of deliveries) {
          aggregate.set(
            delivery.originStationId,
            (aggregate.get(delivery.originStationId) ?? 0) + 1
          );
        }
      }

      return [...aggregate.entries()].map(([stationId, count]) => ({
        stationId,
        count
      }));
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
    async listRecent(limit: number) {
      const snapshot = await paymentsCollection
        .orderBy("initiatedAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((document) => fromPaymentDocument(document.data()));
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
    async markRefundSettled(input: {
      paymentId: string;
      refundReference: string;
      settledAt: string;
    }) {
      await paymentsCollection.doc(input.paymentId).set(
        {
          status: "refunded",
          refundReference: input.refundReference,
          refundSettledAt: input.settledAt,
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
    async createChallenge(challenge) {
      await challengesCollection.doc(challenge.challengeId).set(challenge);
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
    async listRecent(input) {
      const baseQuery = input.processingStatus
        ? webhookEventsCollection
            .where("processingStatus", "==", input.processingStatus)
            .orderBy("receivedAt", "desc")
        : webhookEventsCollection.orderBy("receivedAt", "desc");

      const snapshot = await baseQuery.limit(input.limit).get();

      return snapshot.docs.map((document) => document.data());
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
): DeliveryEventRepository & DeliveryEventReadRepository {
  return {
    async create(event) {
      await firestore
        .doc(deliveryDocumentPath(event.deliveryId))
        .collection(firestoreCollections.deliveryEvents)
        .withConverter(deliveryEventConverter)
        .doc(event.eventId)
        .set(event);
    },
    async listByDeliveryId(deliveryId) {
      const snapshot = await firestore
        .doc(deliveryDocumentPath(deliveryId))
        .collection(firestoreCollections.deliveryEvents)
        .withConverter(deliveryEventConverter)
        .orderBy("occurredAt", "desc")
        .get();

      return snapshot.docs.map((document) => document.data());
    }
  };
}

export function createFirestoreHandoffEventRepository(
  firestore: Firestore
): HandoffEventRepository & HandoffEventReadRepository {
  const handoffEventsCollection = firestore
    .collection(firestoreCollections.handoffEvents)
    .withConverter(handoffEventConverter);

  return {
    async create(event) {
      await handoffEventsCollection.doc(event.handoffEventId).set(event);
    },
    async listByDeliveryId(deliveryId) {
      const snapshot = await handoffEventsCollection
        .where("deliveryId", "==", deliveryId)
        .orderBy("occurredAt", "desc")
        .get();

      return snapshot.docs.map((document) => document.data());
    }
  };
}

export function createFirestoreSupportIssueRepository(
  firestore: Firestore,
  now: () => string
): SupportIssueRepository & AdminIssueMetricsRepository {
  const issuesCollection = firestore
    .collection(firestoreCollections.supportIssues)
    .withConverter(supportIssueConverter);

  return {
    async create(issue) {
      await issuesCollection.doc(issue.issueId).set(issue);
    },
    async getById(issueId) {
      const snapshot = await issuesCollection.doc(issueId).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return snapshot.data();
    },
    async save(issue) {
      await issuesCollection.doc(issue.issueId).set(
        {
          ...issue,
          updatedAt: now()
        },
        { merge: true }
      );
    },
    async listByDeliveryId(deliveryId) {
      const snapshot = await issuesCollection
        .where("deliveryId", "==", deliveryId)
        .orderBy("updatedAt", "desc")
        .get();

      return snapshot.docs.map((document) => document.data());
    },
    async listRecent(input) {
      let snapshot;

      if (input.status && input.severity) {
        snapshot = await issuesCollection
          .where("status", "==", input.status)
          .where("severity", "==", input.severity)
          .orderBy("createdAt", "desc")
          .limit(input.limit)
          .get();
      } else if (input.status) {
        snapshot = await issuesCollection
          .where("status", "==", input.status)
          .orderBy("updatedAt", "desc")
          .limit(input.limit)
          .get();
      } else if (input.severity) {
        snapshot = await issuesCollection
          .where("severity", "==", input.severity)
          .orderBy("updatedAt", "desc")
          .limit(input.limit)
          .get();
      } else {
        snapshot = await issuesCollection.orderBy("updatedAt", "desc").limit(input.limit).get();
      }

      return sortSupportIssuesByUpdatedAt(
        filterSupportIssues(
          snapshot.docs.map((document) => document.data()),
          input
        )
      ).slice(0, input.limit);
    },
    async listByDeliveryIds(input) {
      const uniqueIds = [...new Set(input.deliveryIds)];

      if (uniqueIds.length === 0) {
        return [];
      }

      const chunks: string[][] = [];

      for (let index = 0; index < uniqueIds.length; index += 10) {
        chunks.push(uniqueIds.slice(index, index + 10));
      }

      const issues = await Promise.all(
        chunks.map(async (chunk) => {
          const snapshot = await issuesCollection.where("deliveryId", "in", chunk).get();
          return snapshot.docs.map((document) => document.data());
        })
      );

      return sortSupportIssuesByUpdatedAt(
        filterSupportIssues(
          issues.flat(),
          input
        )
      ).slice(0, input.limit);
    },
    async countOpenByStation(stationId) {
      const deliveryIdsSnapshot = await firestore
        .collection(firestoreCollections.deliveries)
        .withConverter(deliveryConverter)
        .where("originStationId", "==", stationId)
        .get();
      const deliveryIds = deliveryIdsSnapshot.docs.map((document) => document.id);

      if (deliveryIds.length === 0) {
        return 0;
      }

      const chunks: string[][] = [];

      for (let index = 0; index < deliveryIds.length; index += 10) {
        chunks.push(deliveryIds.slice(index, index + 10));
      }

      let count = 0;

      for (const chunk of chunks) {
        const snapshot = await issuesCollection
          .where("deliveryId", "in", chunk)
          .get();

        count += snapshot.docs
          .map((document) => document.data())
          .filter((issue) =>
            issue.status === "open" ||
            issue.status === "in_review" ||
            issue.status === "escalated"
          ).length;
      }

      return count;
    }
  };
}

export function createFirestoreIdempotencyRepository(
  firestore: Firestore
): IdempotencyRepository {
  const idempotencyCollection = firestore
    .collection(firestoreCollections.idempotencyRecords)
    .withConverter(idempotencyRecordConverter);

  return {
    async getByScopeKey(scopeKey) {
      const snapshot = await idempotencyCollection.where("scopeKey", "==", scopeKey).limit(1).get();
      const match = snapshot.docs[0];

      if (!match) {
        return undefined;
      }

      return fromIdempotencyRecordDocument(match.data());
    },
    async createPending(record) {
      await idempotencyCollection.doc(record.recordId).create(record);
    },
    async markCompleted(input) {
      await idempotencyCollection.doc(input.recordId).set(
        {
          status: "completed",
          completedAt: input.completedAt,
          responseStatusCode: input.responseStatusCode,
          responseBody: input.responseBody
        },
        { merge: true }
      );
    },
    async delete(recordId) {
      await idempotencyCollection.doc(recordId).delete();
    }
  };
}

export function createFirestoreAuditEventRepository(
  firestore: Firestore
): AuditEventRepository {
  const auditEventsCollection = firestore
    .collection(firestoreCollections.auditEvents)
    .withConverter(auditEventConverter);

  return {
    async create(event) {
      await auditEventsCollection.doc(event.eventId).set(event);
    },
    async listRecent(input) {
      if (input.actorId) {
        const snapshot = await auditEventsCollection
          .where("actorId", "==", input.actorId)
          .orderBy("occurredAt", "desc")
          .limit(input.limit)
          .get();

        return snapshot.docs.map((document) => document.data());
      }

      if (input.targetType && input.targetId) {
        const snapshot = await auditEventsCollection
          .where("targetType", "==", input.targetType)
          .where("targetId", "==", input.targetId)
          .orderBy("occurredAt", "desc")
          .limit(input.limit)
          .get();

        return snapshot.docs.map((document) => document.data());
      }

      const snapshot = await auditEventsCollection.orderBy("occurredAt", "desc").limit(input.limit).get();

      return sortAuditEventsByOccurredAt(
        snapshot.docs
          .map((document) => document.data())
          .filter((event) => {
            if (input.targetType && event.targetType !== input.targetType) {
              return false;
            }

            if (input.targetId && event.targetId !== input.targetId) {
              return false;
            }

            return true;
          })
      ).slice(0, input.limit);
    }
  };
}

export function createFirestoreApiRepositories(
  firestore: Firestore,
  now: () => string
) {
  return {
    users: createFirestoreUserRepository(firestore),
    stations: createFirestoreStationRepository(firestore),
    notificationFeed: createFirestoreNotificationRepository(firestore),
    outboundNotifications: createFirestoreOutboundNotificationRepository(firestore),
    deliveries: createFirestoreDeliveryRepository(firestore, now),
    payments: createFirestorePaymentRepository(firestore, now),
    issues: createFirestoreSupportIssueRepository(firestore, now),
    verification: createFirestorePublicTrackingVerificationRepository(firestore),
    webhookEvents: createFirestoreWebhookEventRepository(firestore),
    deliveryEvents: createFirestoreDeliveryEventRepository(firestore),
    handoffEvents: createFirestoreHandoffEventRepository(firestore),
    idempotency: createFirestoreIdempotencyRepository(firestore),
    auditEvents: createFirestoreAuditEventRepository(firestore)
  };
}
