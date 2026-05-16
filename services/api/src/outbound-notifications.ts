import type {
  ReceiverDeliveryNotificationGateway,
  ReceiverDeliverySmsEvent
} from "./notifications";

export type OutboundNotificationChannel = "sms";
export type OutboundNotificationProvider = "hubtel";
export type OutboundNotificationKind = "receiver_delivery_sms";
export type OutboundNotificationStatus = "pending" | "sent" | "failed" | "dead_letter";

export interface OutboundNotificationRecord {
  outboundNotificationId: string;
  channel: OutboundNotificationChannel;
  provider: OutboundNotificationProvider;
  kind: OutboundNotificationKind;
  status: OutboundNotificationStatus;
  dedupeKey: string;
  deliveryId: string;
  recipientPhone: string;
  trackingCode: string;
  eventType: ReceiverDeliverySmsEvent;
  stationName?: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  lastError?: {
    name: string;
    message: string;
    code?: string;
  };
}

export interface OutboundNotificationRepository {
  getByDedupeKey(dedupeKey: string): Promise<OutboundNotificationRecord | undefined>;
  create(record: OutboundNotificationRecord): Promise<void>;
  markSent(input: {
    outboundNotificationId: string;
    attemptCount: number;
    attemptedAt: string;
  }): Promise<void>;
  markFailed(input: {
    outboundNotificationId: string;
    status: Extract<OutboundNotificationStatus, "failed" | "dead_letter">;
    attemptCount: number;
    attemptedAt: string;
    nextAttemptAt: string;
    lastError: NonNullable<OutboundNotificationRecord["lastError"]>;
  }): Promise<void>;
  listDue(input: { now: string; limit: number }): Promise<OutboundNotificationRecord[]>;
  listRecent(input: {
    status?: OutboundNotificationStatus;
    limit: number;
  }): Promise<OutboundNotificationRecord[]>;
}

export interface OutboundNotificationIdentityFactory {
  nextOutboundNotificationId(): string;
}

export interface QueueReceiverDeliverySmsInput {
  deliveryId: string;
  phone: string;
  trackingCode: string;
  eventType: ReceiverDeliverySmsEvent;
  stationName?: string;
}

export interface QueueReceiverDeliverySmsDeps {
  outboundNotifications: OutboundNotificationRepository;
  notifications: ReceiverDeliveryNotificationGateway;
  identityFactory: OutboundNotificationIdentityFactory;
  now: () => string;
}

export interface OutboundNotificationDispatchResult {
  outboundNotificationId: string;
  status: Extract<OutboundNotificationStatus, "sent" | "failed" | "dead_letter">;
  attemptCount: number;
}

export interface DispatchDueOutboundNotificationsResponse {
  processed: number;
  sent: number;
  failed: number;
  deadLettered: number;
  results: OutboundNotificationDispatchResult[];
}

const receiverSmsMaxAttempts = 2;
const receiverSmsRetryDelayMinutes = 30;

export function buildReceiverSmsDedupeKey(input: {
  deliveryId: string;
  eventType: ReceiverDeliverySmsEvent;
}): string {
  return `receiver-sms:${input.deliveryId}:${input.eventType}`;
}

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(new Date(isoTimestamp).getTime() + minutes * 60_000).toISOString();
}

function isDueForDispatch(record: OutboundNotificationRecord, now: string): boolean {
  if (record.status === "sent" || record.status === "dead_letter") {
    return false;
  }

  return record.nextAttemptAt <= now;
}

function summarizeDeliveryError(error: unknown): NonNullable<OutboundNotificationRecord["lastError"]> {
  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : undefined;

    return {
      name: error.name,
      message: error.message,
      ...(code === undefined ? {} : { code })
    };
  }

  return {
    name: "UnknownError",
    message: "Outbound notification delivery failed with a non-error value."
  };
}

function buildReceiverSmsOutboxRecord(
  input: QueueReceiverDeliverySmsInput,
  deps: {
    identityFactory: OutboundNotificationIdentityFactory;
    now: () => string;
  }
): OutboundNotificationRecord {
  const now = deps.now();

  return {
    outboundNotificationId: deps.identityFactory.nextOutboundNotificationId(),
    channel: "sms",
    provider: "hubtel",
    kind: "receiver_delivery_sms",
    status: "pending",
    dedupeKey: buildReceiverSmsDedupeKey(input),
    deliveryId: input.deliveryId,
    recipientPhone: input.phone,
    trackingCode: input.trackingCode,
    eventType: input.eventType,
    ...(input.stationName === undefined ? {} : { stationName: input.stationName }),
    attemptCount: 0,
    maxAttempts: receiverSmsMaxAttempts,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now
  };
}

async function getOrCreateReceiverSmsOutboxRecord(
  input: QueueReceiverDeliverySmsInput,
  deps: Pick<QueueReceiverDeliverySmsDeps, "outboundNotifications" | "identityFactory" | "now">
): Promise<OutboundNotificationRecord> {
  const dedupeKey = buildReceiverSmsDedupeKey(input);
  const existing = await deps.outboundNotifications.getByDedupeKey(dedupeKey);

  if (existing) {
    return existing;
  }

  const record = buildReceiverSmsOutboxRecord(input, deps);
  await deps.outboundNotifications.create(record);

  return record;
}

export async function dispatchReceiverSmsOutboxRecord(
  record: OutboundNotificationRecord,
  deps: Pick<QueueReceiverDeliverySmsDeps, "outboundNotifications" | "notifications" | "now">
): Promise<OutboundNotificationDispatchResult> {
  const attemptedAt = deps.now();
  const attemptCount = record.attemptCount + 1;

  try {
    await deps.notifications.sendReceiverDeliverySms({
      phone: record.recipientPhone,
      trackingCode: record.trackingCode,
      eventType: record.eventType,
      ...(record.stationName === undefined ? {} : { stationName: record.stationName })
    });

    await deps.outboundNotifications.markSent({
      outboundNotificationId: record.outboundNotificationId,
      attemptCount,
      attemptedAt
    });

    return {
      outboundNotificationId: record.outboundNotificationId,
      status: "sent",
      attemptCount
    };
  } catch (error) {
    const nextStatus = attemptCount >= record.maxAttempts ? "dead_letter" : "failed";
    const nextAttemptAt =
      nextStatus === "dead_letter"
        ? attemptedAt
        : addMinutes(attemptedAt, receiverSmsRetryDelayMinutes);

    await deps.outboundNotifications.markFailed({
      outboundNotificationId: record.outboundNotificationId,
      status: nextStatus,
      attemptCount,
      attemptedAt,
      nextAttemptAt,
      lastError: summarizeDeliveryError(error)
    });

    return {
      outboundNotificationId: record.outboundNotificationId,
      status: nextStatus,
      attemptCount
    };
  }
}

export async function queueAndDispatchReceiverDeliverySms(
  input: QueueReceiverDeliverySmsInput,
  deps: QueueReceiverDeliverySmsDeps
): Promise<void> {
  const record = await getOrCreateReceiverSmsOutboxRecord(input, deps);

  if (!isDueForDispatch(record, deps.now())) {
    return;
  }

  await dispatchReceiverSmsOutboxRecord(record, deps);
}

export async function dispatchDueOutboundNotifications(
  input: { limit?: number | undefined },
  deps: Pick<QueueReceiverDeliverySmsDeps, "outboundNotifications" | "notifications" | "now">
): Promise<DispatchDueOutboundNotificationsResponse> {
  const dueRecords = await deps.outboundNotifications.listDue({
    now: deps.now(),
    limit: input.limit ?? 25
  });
  const results: OutboundNotificationDispatchResult[] = [];

  for (const record of dueRecords) {
    results.push(await dispatchReceiverSmsOutboxRecord(record, deps));
  }

  return {
    processed: results.length,
    sent: results.filter((result) => result.status === "sent").length,
    failed: results.filter((result) => result.status === "failed").length,
    deadLettered: results.filter((result) => result.status === "dead_letter").length,
    results
  };
}
