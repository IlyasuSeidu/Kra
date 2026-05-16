import {
  adminDeliveryListResponseSchema,
  adminFinanceResponseSchema,
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
}

export interface AdminIssueMetricsRepository {
  countOpenByStation(stationId: DeliveryRecord["originStationId"]): Promise<number>;
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
