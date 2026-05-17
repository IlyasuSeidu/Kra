import {
  adminDeliveryListResponseSchema,
  adminFinanceResponseSchema,
  adminLaunchReadinessResponseSchema,
  adminOutboundNotificationListQuerySchema,
  adminOutboundNotificationListResponseSchema,
  adminOverviewResponseSchema,
  adminStationListResponseSchema
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRecord } from "./deliveries";
import type { WebhookEventRecord } from "./payment-webhooks";
import type { OutboundNotificationRecord } from "./outbound-notifications";
import type { PaymentRecord } from "./payments";
import { listConfiguredStations, type StationRepository } from "./stations";

export interface AdminDeliveryMetricsRepository {
  countByStatus(): Promise<Array<{
    status: DeliveryRecord["currentStatus"];
    count: number;
  }>>;
  listRecent(limit: number): Promise<DeliveryRecord[]>;
  countActiveQueuesByStation(): Promise<Array<{
    stationId: DeliveryRecord["originStationId"];
    count: number;
  }>>;
}

export interface AdminPaymentMetricsRepository {
  countByStatus(): Promise<Array<{
    status: PaymentRecord["status"];
    count: number;
  }>>;
  listRecent(limit: number): Promise<PaymentRecord[]>;
  countReconciliationReviewRequired(): Promise<number>;
}

export interface AdminWebhookMetricsRepository {
  countByProcessingStatus(): Promise<Array<{
    processingStatus: WebhookEventRecord["processingStatus"];
    count: number;
  }>>;
}

export interface AdminOutboundNotificationRepository {
  listRecent(input: {
    status?: OutboundNotificationRecord["status"];
    limit: number;
  }): Promise<OutboundNotificationRecord[]>;
  countByStatus(status: OutboundNotificationRecord["status"]): Promise<number>;
}

export interface AdminIssueMetricsRepository {
  countOpenByStation(stationId: DeliveryRecord["originStationId"]): Promise<number>;
  countOpenP1ByStation(stationId: DeliveryRecord["originStationId"]): Promise<number>;
}

export interface GetAdminOverviewDeps {
  deliveries: AdminDeliveryMetricsRepository;
  payments: AdminPaymentMetricsRepository;
  webhookEvents: AdminWebhookMetricsRepository;
  now: () => string;
}

export type AdminOverviewResponse = z.infer<typeof adminOverviewResponseSchema>;
export type AdminDeliveryListResponse = z.infer<typeof adminDeliveryListResponseSchema>;
export type AdminStationListResponse = z.infer<typeof adminStationListResponseSchema>;
export type AdminFinanceResponse = z.infer<typeof adminFinanceResponseSchema>;
export type AdminOutboundNotificationListResponse = z.infer<
  typeof adminOutboundNotificationListResponseSchema
>;
export type AdminLaunchReadinessResponse = z.infer<typeof adminLaunchReadinessResponseSchema>;

export async function getAdminOverview(
  deps: GetAdminOverviewDeps
): Promise<AdminOverviewResponse> {
  const [deliveryStatusCounts, paymentStatusCounts, webhookStatusCounts] = await Promise.all([
    deps.deliveries.countByStatus(),
    deps.payments.countByStatus(),
    deps.webhookEvents.countByProcessingStatus()
  ]);

  const webhookCountMap = new Map(
    webhookStatusCounts.map((entry) => [entry.processingStatus, entry.count] as const)
  );

  const openIssueLikeDeliveries = deliveryStatusCounts
    .filter((entry) =>
      entry.status === "issue_reported" ||
      entry.status === "on_hold" ||
      entry.status === "delivery_failed"
    )
    .reduce((total, entry) => total + entry.count, 0);

  return adminOverviewResponseSchema.parse({
    generatedAt: deps.now(),
    deliveryStatusCounts,
    paymentStatusCounts,
    operationalAlerts: {
      openIssueLikeDeliveries,
      unmatchedWebhookEvents: webhookCountMap.get("unmatched") ?? 0,
      manualReviewWebhookEvents: webhookCountMap.get("manual_review") ?? 0
    }
  });
}

export async function listAdminDeliveries(
  deps: {
    deliveries: AdminDeliveryMetricsRepository;
    now: () => string;
  }
): Promise<AdminDeliveryListResponse> {
  const deliveries = await deps.deliveries.listRecent(100);

  return adminDeliveryListResponseSchema.parse({
    generatedAt: deps.now(),
    deliveries: deliveries.map((delivery) => ({
      deliveryId: delivery.deliveryId,
      trackingCode: delivery.trackingCode,
      currentStatus: delivery.currentStatus,
      paymentStatus: delivery.paymentStatus,
      originStationId: delivery.originStationId,
      destinationStationId: delivery.destinationStationId,
      senderId: delivery.senderId,
      latestOccurredAt: delivery.latestEvent.occurredAt,
      receiverName: delivery.receiver.name
    }))
  });
}

export async function listAdminStations(
  deps: {
    deliveries: AdminDeliveryMetricsRepository;
    issues: AdminIssueMetricsRepository;
    stations: StationRepository;
    now: () => string;
  }
): Promise<AdminStationListResponse> {
  const activeQueueCounts = await deps.deliveries.countActiveQueuesByStation();
  const activeQueueMap = new Map(activeQueueCounts.map((entry) => [entry.stationId, entry.count] as const));
  const configuredStations = await listConfiguredStations({
    stations: deps.stations,
    now: deps.now
  });

  const stations = await Promise.all(
    configuredStations.map(async (station) => ({
      stationId: station.stationId,
      name: station.name,
      city: station.city,
      operatingStatus: station.operatingStatus,
      intakeStatus: station.intakeStatus,
      serviceAvailability: station.serviceAvailability,
      activeQueueCount: activeQueueMap.get(station.stationId) ?? 0,
      issueCount: await deps.issues.countOpenByStation(station.stationId),
      validation: station.validation,
      ...(station.note === undefined ? {} : { note: station.note }),
      updatedAt: station.updatedAt
    }))
  );

  return adminStationListResponseSchema.parse({
    generatedAt: deps.now(),
    stations
  });
}

export async function getAdminLaunchReadiness(
  deps: {
    deliveries: AdminDeliveryMetricsRepository;
    issues: AdminIssueMetricsRepository;
    outboundNotifications: AdminOutboundNotificationRepository;
    payments: AdminPaymentMetricsRepository;
    stations: StationRepository;
    now: () => string;
  }
): Promise<AdminLaunchReadinessResponse> {
  const generatedAt = deps.now();
  const [configuredStations, activeQueueCounts, paymentReviewCount, receiverSmsDeadLetterCount] =
    await Promise.all([
      listConfiguredStations({
        stations: deps.stations,
        now: deps.now
      }),
      deps.deliveries.countActiveQueuesByStation(),
      deps.payments.countReconciliationReviewRequired(),
      deps.outboundNotifications.countByStatus("dead_letter")
    ]);
  const activeQueueMap = new Map(
    activeQueueCounts.map((entry) => [entry.stationId, entry.count] as const)
  );

  const stations = await Promise.all(
    configuredStations.map(async (station) => {
      const unresolvedP1IssueCount = await deps.issues.countOpenP1ByStation(station.stationId);

      return {
        stationId: station.stationId,
        name: station.name,
        city: station.city,
        operatingStatus: station.operatingStatus,
        intakeStatus: station.intakeStatus,
        serviceAvailability: station.serviceAvailability,
        validationStatus: station.validation.status,
        goLiveEligible: station.validation.goLiveEligible,
        validationBlockerCount: station.validation.blockers.length,
        activeQueueCount: activeQueueMap.get(station.stationId) ?? 0,
        unresolvedP1IssueCount,
        updatedAt: station.updatedAt
      };
    })
  );

  const blockers: z.infer<typeof adminLaunchReadinessResponseSchema>["blockers"] = [];

  for (const station of stations) {
    if (!station.goLiveEligible) {
      blockers.push({
        code: "station_validation_incomplete",
        severity: "p1",
        stationId: station.stationId,
        count: station.validationBlockerCount,
        message: `${station.name} is not go-live eligible.`
      });
    }

    if (station.operatingStatus !== "active" || station.intakeStatus !== "open") {
      blockers.push({
        code: "station_operationally_paused",
        severity: "p1",
        stationId: station.stationId,
        message: `${station.name} must be active and open for intake before launch.`
      });
    }

    if (
      !station.serviceAvailability.standard ||
      !station.serviceAvailability.express ||
      !station.serviceAvailability.doorstep
    ) {
      blockers.push({
        code: "station_service_unavailable",
        severity: "p2",
        stationId: station.stationId,
        message: `${station.name} does not have all launch services enabled.`
      });
    }

    if (station.unresolvedP1IssueCount > 0) {
      blockers.push({
        code: "unresolved_p1_issue",
        severity: "p1",
        stationId: station.stationId,
        count: station.unresolvedP1IssueCount,
        message: `${station.name} has unresolved P1 issues.`
      });
    }
  }

  if (paymentReviewCount > 0) {
    blockers.push({
      code: "payment_reconciliation_review",
      severity: "p1",
      count: paymentReviewCount,
      message: "Payment reconciliation review queue must be cleared before launch."
    });
  }

  if (receiverSmsDeadLetterCount > 0) {
    blockers.push({
      code: "dead_letter_receiver_sms",
      severity: "p1",
      count: receiverSmsDeadLetterCount,
      message: "Receiver SMS dead-letter queue must be cleared before launch."
    });
  }

  const unresolvedP1Count = stations.reduce(
    (total, station) => total + station.unresolvedP1IssueCount,
    0
  );
  const readyStations = stations.filter((station) => station.goLiveEligible).length;
  const goLiveEligible = blockers.length === 0;

  return adminLaunchReadinessResponseSchema.parse({
    generatedAt,
    goLiveEligible,
    status: goLiveEligible ? "ready" : "blocked",
    blockers,
    stations,
    systemChecks: {
      stationValidation: {
        readyStations,
        totalStations: stations.length
      },
      unresolvedP1Issues: {
        count: unresolvedP1Count
      },
      paymentReconciliation: {
        reviewRequiredCount: paymentReviewCount
      },
      receiverSms: {
        deadLetterCount: receiverSmsDeadLetterCount
      }
    }
  });
}

export async function listAdminFinance(
  deps: {
    payments: AdminPaymentMetricsRepository;
    now: () => string;
  }
): Promise<AdminFinanceResponse> {
  const payments = await deps.payments.listRecent(100);

  const totals = payments.reduce(
    (aggregate, payment) => {
      if (payment.status === "confirmed") {
        aggregate.confirmedAmountGhs += payment.amountGhs;
      }

      if (payment.status === "refund_pending") {
        aggregate.refundPendingAmountGhs += payment.amountGhs;
      }

      if (payment.status === "refunded") {
        aggregate.refundedAmountGhs += payment.amountGhs;
      }

      return aggregate;
    },
    {
      confirmedAmountGhs: 0,
      refundPendingAmountGhs: 0,
      refundedAmountGhs: 0
    }
  );

  return adminFinanceResponseSchema.parse({
    generatedAt: deps.now(),
    totals,
    payments: payments.map((payment) => ({
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId,
      provider: payment.provider,
      providerReference: payment.providerReference,
      status: payment.status,
      amountGhs: payment.amountGhs,
      initiatedAt: payment.initiatedAt,
      ...(payment.verifiedAt === undefined ? {} : { verifiedAt: payment.verifiedAt }),
      ...("refundAmountGhs" in payment && typeof payment.refundAmountGhs === "number"
        ? { refundAmountGhs: payment.refundAmountGhs }
        : {})
    }))
  });
}

export async function listAdminOutboundNotifications(
  input: z.input<typeof adminOutboundNotificationListQuerySchema>,
  deps: {
    outboundNotifications: AdminOutboundNotificationRepository;
    now: () => string;
  }
): Promise<AdminOutboundNotificationListResponse> {
  const parsedInput = adminOutboundNotificationListQuerySchema.parse(input);
  const notifications = await deps.outboundNotifications.listRecent({
    ...(parsedInput.status === undefined ? {} : { status: parsedInput.status }),
    limit: parsedInput.limit ?? 100
  });

  return adminOutboundNotificationListResponseSchema.parse({
    generatedAt: deps.now(),
    notifications
  });
}
