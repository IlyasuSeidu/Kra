import { createHmac, timingSafeEqual } from "node:crypto";

import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import {
  acceptFinalMileAssignmentRequestSchema,
  acceptRunRequestSchema,
  adminUpdateStationValidationRequestSchema,
  adminUpdateStationStatusRequestSchema,
  adminUpdateUserAccessRequestSchema,
  adminUpsertUserRequestSchema,
  assignDriverRequestSchema,
  assignFinalMileRequestSchema,
  buildApiErrorResponse,
  cancelDeliveryRequestSchema,
  confirmProofAssetUploadRequestSchema,
  completeDeliveryRequestSchema,
  createProofAssetUploadRequestSchema,
  confirmDriverPickupRequestSchema,
  confirmIntakeRequestSchema,
  createDeliveryRequestSchema,
  createIssueRequestSchema,
  dispatchDeliveryRequestSchema,
  escalateIssueRequestSchema,
  markInTransitRequestSchema,
  markOutForDeliveryRequestSchema,
  mtnMomoWebhookRequestSchema,
  outboundNotificationDispatchRequestSchema,
  outboundNotificationDispatchResponseSchema,
  paymentInitializeRequestSchema,
  paymentReconciliationDispatchRequestSchema,
  paymentReconciliationDispatchResponseSchema,
  paymentVerifyRequestSchema,
  recordFailedAttemptRequestSchema,
  receiveDestinationRequestSchema,
  refundPaymentRequestSchema,
  requestPhoneVerificationChallengeRequestSchema,
  resolveIssueRequestSchema,
  settleRefundRequestSchema,
  stationCatalog,
  type Capability,
  verifyPhoneRequestSchema
} from "@kra/shared";
import { ZodError } from "zod";

import {
  assertAdminPrincipal,
  assertCanAccessDelivery,
  assertAuthenticatedPrincipal,
  assertCapabilityForPrincipal,
  createFirebaseAuthVerifier,
  type AuthPrincipal,
  type AuthVerifier
} from "./auth";
import {
  getAdminOverview,
  listAdminDeliveries,
  listAdminFinance,
  listAdminOutboundNotifications,
  listAdminStations,
  type AdminDeliveryMetricsRepository,
  type AdminIssueMetricsRepository,
  type AdminPaymentMetricsRepository,
  type AdminWebhookMetricsRepository
} from "./admin";
import {
  listAdminAuditEvents,
  type AuditEventRecord,
  type AuditEventRepository,
  type AuditIdentityFactory
} from "./audit";
import { cancelDelivery } from "./cancellations";
import { loadApiRuntimeConfig, type ApiRuntimeConfig } from "./config";
import { createDeliveryBooking, type DeliveryRecord, type DeliveryRepository } from "./deliveries";
import {
  getDeliveryDetail,
  listAccessibleDeliveries,
  getDeliveryTimeline,
  type DeliveryEventReadRepository,
  type DeliveryListRepository,
  type DeliveryIssueReadRepository,
  type HandoffEventReadRepository
} from "./delivery-queries";
import {
  getFirebaseAdminApp,
  getKraFirestore
} from "./firestore/client";
import { createFirestoreApiRepositories } from "./firestore/repositories";
import {
  acceptDriverRun,
  acceptFinalMileAssignment,
  assignDriver,
  assignFinalMileCourier,
  completeDelivery,
  confirmDriverPickup,
  confirmOriginIntake,
  dispatchDelivery,
  markDeliveryInTransit,
  markDeliveryOutForDelivery,
  recordFinalMileFailedAttempt,
  receiveDestination,
  type DeliveryEventRepository,
  type DeliveryLifecycleIdentityFactory,
  type DeliveryLifecycleRepository,
  type HandoffEventRepository,
  type OperationalActor
} from "./handoffs";
import {
  executeIdempotentOperation,
  type IdempotencyRepository
} from "./idempotency";
import { createApiIdentityFactory } from "./ids";
import {
  createSupportIssue,
  escalateSupportIssue,
  getSupportIssue,
  listSupportIssues,
  resolveSupportIssue,
  type SupportIssueIdentityFactory,
  type SupportIssueRepository
} from "./issues";
import { createMtnMomoGateway } from "./mtn-momo";
import {
  createHubtelSmsGateway,
  type PublicTrackingOtpNotificationGateway,
  type ReceiverDeliveryNotificationGateway,
  type ReceiverDeliverySmsEvent
} from "./notifications";
import {
  listNotifications,
  queueNotificationIfMissing,
  type NotificationIdentityFactory,
  type NotificationRepository,
  type QueueNotificationInput
} from "./notification-feed";
import {
  dispatchDueOutboundNotifications,
  queueAndDispatchReceiverDeliverySms,
  type OutboundNotificationIdentityFactory,
  type OutboundNotificationRepository
} from "./outbound-notifications";
import {
  listAdminWebhookEvents,
  processMtnMomoWebhook,
  type PaymentLookupRepository,
  type PaymentWebhookIdentityFactory,
  type WebhookEventRepository
} from "./payment-webhooks";
import {
  listAdminPaymentReconciliation,
  reconcileDueMtnMomoPayments,
  type PaymentReconciliationRepository
} from "./payment-reconciliation";
import {
  initializeMtnMomoPayment,
  verifyMtnMomoPayment,
  type MtnMomoGateway,
  type PaymentIdentityFactory,
  type PaymentRepository
} from "./payments";
import { getPublicTracking } from "./public-tracking";
import {
  requestPublicTrackingPhoneChallenge,
  verifyPublicTrackingPhone,
  type PublicTrackingVerificationIdentityFactory,
  type PublicTrackingVerificationRepository
} from "./public-tracking-verification";
import {
  requestPaymentRefund,
  settlePaymentRefund,
  type RefundPaymentRepository
} from "./refunds";
import {
  assertUploadedProofAssetForCompletion,
  confirmProofAssetUpload,
  createProofAssetUploadIntent,
  markProofAssetAttachedToDelivery,
  type ProofAssetIdentityFactory,
  type ProofAssetRepository,
  type ProofStorageGateway
} from "./proof-assets";
import { createFirebaseProofStorageGateway } from "./proof-storage";
import { ApiServiceError } from "./service-errors";
import { updateStationStatus, updateStationValidation, type StationRepository } from "./stations";
import {
  listAdminUsers,
  updateAdminUserAccess,
  upsertAdminUser,
  type UserRepository
} from "./users";

declare module "fastify" {
  interface FastifyRequest {
    principal?: AuthPrincipal;
  }
}

type SharedIdentityFactory = PaymentIdentityFactory &
  PaymentWebhookIdentityFactory &
  DeliveryLifecycleIdentityFactory &
  NotificationIdentityFactory &
  OutboundNotificationIdentityFactory &
  PublicTrackingVerificationIdentityFactory &
  AuditIdentityFactory &
  SupportIssueIdentityFactory &
  ProofAssetIdentityFactory & {
    nextRequestId(): string;
    nextDeliveryId(): string;
    nextTrackingCode(): string;
    nextIdempotencyRecordId(): string;
  };

export interface ApiAppDeps {
  config: ApiRuntimeConfig;
  authVerifier: AuthVerifier;
  users: UserRepository;
  stations: StationRepository;
  notificationFeed: NotificationRepository;
  outboundNotifications: OutboundNotificationRepository;
  deliveries: DeliveryRepository &
    DeliveryLifecycleRepository &
    DeliveryListRepository &
    AdminDeliveryMetricsRepository;
  deliveryEvents: DeliveryEventRepository & DeliveryEventReadRepository;
  handoffEvents: HandoffEventRepository & HandoffEventReadRepository;
  payments: PaymentRepository &
    PaymentLookupRepository &
    PaymentReconciliationRepository &
    RefundPaymentRepository &
    AdminPaymentMetricsRepository;
  proofAssets: ProofAssetRepository;
  issues: SupportIssueRepository & AdminIssueMetricsRepository & DeliveryIssueReadRepository;
  verification: PublicTrackingVerificationRepository;
  webhookEvents: WebhookEventRepository & AdminWebhookMetricsRepository;
  idempotency: IdempotencyRepository;
  auditEvents: AuditEventRepository;
  gateway: MtnMomoGateway;
  proofStorage?: ProofStorageGateway;
  notifications?: PublicTrackingOtpNotificationGateway & ReceiverDeliveryNotificationGateway;
  identityFactory: SharedIdentityFactory;
  now: () => string;
  readinessCheck?: () => Promise<void>;
}

function mapPrincipalToOperationalActor(principal: AuthPrincipal): OperationalActor {
  if (
    principal.role === "finance_admin" ||
    principal.role === "support_admin" ||
    principal.role === "sender"
  ) {
    throw new ApiServiceError("FORBIDDEN", "Principal cannot perform operational handoff actions.", {
      userId: principal.userId,
      role: principal.role
    });
  }

  return {
    actorId: principal.userId,
    role: principal.role,
    ...(principal.stationId === undefined ? {} : { stationId: principal.stationId })
  };
}

function extractBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new ApiServiceError("FORBIDDEN", "Authorization header is required.", {
      reason: "missing_authorization_header"
    });
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiServiceError("FORBIDDEN", "Authorization header must use Bearer token format.", {
      reason: "invalid_authorization_header"
    });
  }

  return token;
}

async function authenticateRequest(
  request: {
    headers: Record<string, string | string[] | undefined>;
    principal?: AuthPrincipal;
  },
  authVerifier: AuthVerifier
): Promise<AuthPrincipal> {
  if (request.principal) {
    return request.principal;
  }

  const token = extractBearerToken(
    typeof request.headers.authorization === "string"
      ? request.headers.authorization
      : undefined
  );
  const principal = await authVerifier.verifyBearerToken(token);
  request.principal = principal;

  return principal;
}

function getAuthenticatedPrincipal(request: {
  principal?: AuthPrincipal;
}): AuthPrincipal {
  assertAuthenticatedPrincipal(request.principal);

  return request.principal;
}

function verifyWebhookSignature(
  payload: {
    providerReference: string;
    eventType: string;
    amountGhs: number;
    occurredAt: string;
  },
  signatureHeader: string | undefined,
  sharedSecret: string | undefined
): void {
  if (!sharedSecret) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "Webhook signature validation is not configured.", {
      reason: "missing_webhook_secret"
    });
  }

  if (!signatureHeader) {
    throw new ApiServiceError("FORBIDDEN", "Webhook signature header is required.", {
      reason: "missing_webhook_signature"
    });
  }

  const signedPayload = [
    payload.providerReference,
    payload.eventType,
    payload.amountGhs.toString(),
    payload.occurredAt
  ].join(":");
  const expectedSignature = createHmac("sha256", sharedSecret).update(signedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new ApiServiceError("FORBIDDEN", "Webhook signature is invalid.", {
      reason: "webhook_signature_invalid"
    });
  }
}

function verifyInternalTaskSecret(
  secretHeader: string | undefined,
  sharedSecret: string | undefined
): void {
  if (!sharedSecret) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "Internal task authentication is not configured.", {
      reason: "missing_internal_task_secret"
    });
  }

  if (!secretHeader) {
    throw new ApiServiceError("FORBIDDEN", "Internal task secret header is required.", {
      reason: "missing_internal_task_secret_header"
    });
  }

  const expectedBuffer = Buffer.from(sharedSecret, "utf8");
  const receivedBuffer = Buffer.from(secretHeader, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new ApiServiceError("FORBIDDEN", "Internal task secret is invalid.", {
      reason: "internal_task_secret_invalid"
    });
  }
}

function setNoStore(reply: {
  header(name: string, value: string): unknown;
}): void {
  reply.header("Cache-Control", "no-store");
}

function withOptionalValue<K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return {
    [key]: value
  } as Partial<Record<K, V>>;
}

type SenderNotificationCopy = Pick<QueueNotificationInput, "type" | "title" | "body">;

const deliveryStatusNotificationCopy: Partial<
  Record<DeliveryRecord["currentStatus"], SenderNotificationCopy>
> = {
  received_at_origin: {
    type: "received_at_origin",
    title: "Package received at origin",
    body: "Your package has been received and scanned at the origin station."
  },
  dispatched_from_origin: {
    type: "dispatched",
    title: "Package dispatched",
    body: "Your package has left the origin station and is moving through the Kra network."
  },
  received_at_destination: {
    type: "received_at_destination",
    title: "Arrived at destination station",
    body: "Your package has arrived at the destination station."
  },
  awaiting_receiver_pickup: {
    type: "ready_for_pickup",
    title: "Ready for pickup",
    body: "Your package is ready for receiver pickup at the destination station."
  },
  awaiting_final_mile_assignment: {
    type: "received_at_destination",
    title: "Preparing doorstep delivery",
    body: "Your package has arrived at the destination station and is being prepared for doorstep delivery."
  },
  out_for_delivery: {
    type: "out_for_delivery",
    title: "Out for delivery",
    body: "Your package is with the final-mile courier and is on its way to the receiver."
  },
  delivered: {
    type: "delivered",
    title: "Delivery completed",
    body: "Your package has been delivered and the proof of delivery has been captured."
  },
  issue_reported: {
    type: "issue_updated",
    title: "Delivery issue reported",
    body: "A delivery issue has been opened and the operations team is reviewing it."
  }
};

function getPaymentNotificationCopy(
  paymentStatus: "confirmed" | "failed"
): SenderNotificationCopy {
  if (paymentStatus === "confirmed") {
    return {
      type: "payment_confirmed",
      title: "Payment confirmed",
      body: "Your payment is confirmed. Kra can now move your package through the delivery network."
    };
  }

  return {
    type: "payment_failed",
    title: "Payment failed",
    body: "Your payment could not be confirmed. Please retry payment before the package moves into transport."
  };
}

function getIssueNotificationCopy(
  status: "open" | "in_review" | "escalated" | "resolved" | "closed"
): SenderNotificationCopy {
  if (status === "open") {
    return {
      type: "issue_updated",
      title: "Issue opened",
      body: "A support issue has been opened for your delivery."
    };
  }

  if (status === "resolved" || status === "closed") {
    return {
      type: "issue_updated",
      title: "Issue resolved",
      body: "The support issue on your delivery has been resolved or closed."
    };
  }

  return {
    type: "issue_updated",
    title: "Issue updated",
    body: "The support issue on your delivery has a new status."
  };
}

async function queueSenderNotificationForDelivery(
  deps: ApiAppDeps,
  delivery: Pick<DeliveryRecord, "deliveryId" | "senderId">,
  copy: SenderNotificationCopy,
  dedupeKey: string
): Promise<void> {
  await queueNotificationIfMissing(
    {
      recipientUserId: delivery.senderId,
      type: copy.type,
      title: copy.title,
      body: copy.body,
      deliveryId: delivery.deliveryId,
      dedupeKey
    },
    {
      notificationFeed: deps.notificationFeed,
      identityFactory: deps.identityFactory,
      now: deps.now
    }
  );
}

async function queueDeliveryStatusNotification(
  deps: ApiAppDeps,
  delivery: DeliveryRecord
): Promise<void> {
  const copy = deliveryStatusNotificationCopy[delivery.currentStatus];

  if (!copy) {
    return;
  }

  await queueSenderNotificationForDelivery(
    deps,
    delivery,
    copy,
    `delivery:${delivery.deliveryId}:${copy.type}`
  );
}

async function queuePaymentStatusNotification(
  deps: ApiAppDeps,
  deliveryId: string,
  paymentStatus: "pending" | "confirmed" | "failed"
): Promise<void> {
  if (paymentStatus !== "confirmed" && paymentStatus !== "failed") {
    return;
  }

  const delivery = await deps.deliveries.getById(deliveryId);

  if (!delivery) {
    return;
  }

  const copy = getPaymentNotificationCopy(paymentStatus);
  await queueSenderNotificationForDelivery(
    deps,
    delivery,
    copy,
    `delivery:${delivery.deliveryId}:${copy.type}`
  );
}

async function queueIssueNotification(
  deps: ApiAppDeps,
  deliveryId: string,
  issueId: string,
  status: "open" | "in_review" | "escalated" | "resolved" | "closed"
): Promise<void> {
  const delivery = await deps.deliveries.getById(deliveryId);

  if (!delivery) {
    return;
  }

  await queueSenderNotificationForDelivery(
    deps,
    delivery,
    getIssueNotificationCopy(status),
    `issue:${issueId}:${status}`
  );
}

function getReceiverSmsEventForStatus(
  status: DeliveryRecord["currentStatus"]
): ReceiverDeliverySmsEvent | undefined {
  switch (status) {
    case "awaiting_receiver_pickup":
      return "ready_for_pickup";
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    default:
      return undefined;
  }
}

async function sendReceiverDeliverySms(
  deps: ApiAppDeps,
  delivery: DeliveryRecord,
  eventType: ReceiverDeliverySmsEvent
): Promise<void> {
  if (!deps.notifications) {
    return;
  }

  await queueAndDispatchReceiverDeliverySms(
    {
      deliveryId: delivery.deliveryId,
      phone: delivery.receiver.phone,
      trackingCode: delivery.trackingCode,
      eventType,
      stationName: stationCatalog[delivery.destinationStationId].name
    },
    {
      outboundNotifications: deps.outboundNotifications,
      notifications: deps.notifications,
      identityFactory: deps.identityFactory,
      now: deps.now
    }
  );
}

async function notifyDeliveryStatusChange(
  deps: ApiAppDeps,
  delivery: DeliveryRecord
): Promise<void> {
  await queueDeliveryStatusNotification(deps, delivery);

  const receiverSmsEvent = getReceiverSmsEventForStatus(delivery.currentStatus);

  if (receiverSmsEvent) {
    await sendReceiverDeliverySms(deps, delivery, receiverSmsEvent);
  }
}

function getIdempotencyKey(request: FastifyRequest): string | undefined {
  const header = request.headers["idempotency-key"];

  return typeof header === "string" && header.trim().length > 0 ? header.trim() : undefined;
}

function getActorKey(request: FastifyRequest): string {
  if (request.principal) {
    return request.principal.userId;
  }

  return "public";
}

function inferAuditTarget(
  fingerprint: Record<string, unknown>
): Pick<AuditEventRecord, "targetType" | "targetId"> {
  const targetIdFromTopLevel =
    typeof fingerprint.deliveryId === "string"
      ? { targetType: "delivery" as const, targetId: fingerprint.deliveryId }
      : typeof fingerprint.paymentId === "string"
        ? { targetType: "payment" as const, targetId: fingerprint.paymentId }
        : typeof fingerprint.issueId === "string"
          ? { targetType: "issue" as const, targetId: fingerprint.issueId }
          : typeof fingerprint.trackingCode === "string"
            ? { targetType: "tracking" as const, targetId: fingerprint.trackingCode }
            : undefined;

  if (targetIdFromTopLevel) {
    return targetIdFromTopLevel;
  }

  const body = typeof fingerprint.body === "object" && fingerprint.body !== null
    ? (fingerprint.body as Record<string, unknown>)
    : undefined;

  if (!body) {
    return {};
  }

  if (typeof body.deliveryId === "string") {
    return {
      targetType: "delivery",
      targetId: body.deliveryId
    };
  }

  if (typeof body.paymentId === "string") {
    return {
      targetType: "payment",
      targetId: body.paymentId
    };
  }

  return {};
}

async function runIdempotentMutation<TResponse extends object>(
  request: FastifyRequest,
  reply: FastifyReply,
  deps: ApiAppDeps,
  input: {
    routeKey: string;
    fingerprint: Record<string, unknown>;
  },
  operation: () => Promise<{
    statusCode: number;
    responseBody: TResponse;
  }>
): Promise<TResponse> {
  const result = await executeIdempotentOperation(
    {
      routeKey: input.routeKey,
      actorKey: getActorKey(request),
      idempotencyKey: getIdempotencyKey(request),
      requestId: request.id,
      fingerprint: input.fingerprint
    },
    {
      repository: deps.idempotency,
      identityFactory: deps.identityFactory,
      now: deps.now
    },
    async () => {
      const mutationResult = await operation();

      if (request.principal) {
        await deps.auditEvents.create({
          eventId: deps.identityFactory.nextAuditEventId(),
          requestId: request.id,
          action: input.routeKey,
          actorId: request.principal.userId,
          actorRole: request.principal.role,
          occurredAt: deps.now(),
          ...(request.principal.stationId === undefined
            ? {}
            : { stationId: request.principal.stationId }),
          ...inferAuditTarget(input.fingerprint),
          metadata: {
            fingerprint: input.fingerprint,
            responseStatusCode: mutationResult.statusCode
          }
        });
      }

      return mutationResult;
    }
  );

  if (result.replayed) {
    reply.header("Idempotent-Replayed", "true");
  }

  reply.status(result.statusCode);

  return result.responseBody;
}

function buildRuntimeAppDeps(config = loadApiRuntimeConfig()): ApiAppDeps {
  const firestore = getKraFirestore(config);
  const repositories = createFirestoreApiRepositories(firestore, () => new Date().toISOString());
  const identityFactory = createApiIdentityFactory();

  return {
    config,
    authVerifier: createFirebaseAuthVerifier(getFirebaseAdminApp(config)),
    users: repositories.users,
    stations: repositories.stations,
    notificationFeed: repositories.notificationFeed,
    outboundNotifications: repositories.outboundNotifications,
    deliveries: repositories.deliveries,
    deliveryEvents: repositories.deliveryEvents,
    handoffEvents: repositories.handoffEvents,
    payments: repositories.payments,
    proofAssets: repositories.proofAssets,
    issues: repositories.issues,
    verification: repositories.verification,
    webhookEvents: repositories.webhookEvents,
    idempotency: repositories.idempotency,
    auditEvents: repositories.auditEvents,
    gateway: createMtnMomoGateway(config),
    ...(config.firebaseStorageBucket === undefined
      ? {}
      : { proofStorage: createFirebaseProofStorageGateway(config) }),
    ...(config.hubtelSms === undefined
      ? {}
      : { notifications: createHubtelSmsGateway(config) }),
    identityFactory,
    now: () => new Date().toISOString(),
    readinessCheck: async () => {
      await firestore.collection("_system_health").limit(1).get();
    }
  };
}

export function createApiApp(deps: ApiAppDeps): FastifyInstance {
  const app = Fastify({
    logger: false,
    genReqId: () => deps.identityFactory.nextRequestId()
  });

  void app.register(rateLimit, {
    global: false,
    max: 120,
    timeWindow: "1 minute",
    skipOnError: false
  });

  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
      reply.status(400).send(
        buildApiErrorResponse(request.id, "VALIDATION_ERROR", "Request validation failed.", {
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        })
      );
      return;
    }

    if (error instanceof ApiServiceError) {
      const statusCode =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "FORBIDDEN"
            ? 403
            : error.code === "PAYMENT_REQUIRED"
              ? 409
              : error.code === "INVALID_STATUS_TRANSITION"
                ? 409
                : error.code === "RATE_LIMITED"
                  ? 429
                  : error.code === "ROUTE_NOT_ENABLED"
                    ? 503
                    : 400;

      reply.status(statusCode).send(
        buildApiErrorResponse(request.id, error.code, error.message, error.details)
      );
      return;
    }

    reply.status(500).send(
      buildApiErrorResponse(
        request.id,
        "INTERNAL_ERROR",
        "Unexpected internal server error.",
        {}
      )
    );
  });

  app.get("/health/live", async (_request: FastifyRequest, reply: FastifyReply) => {
    setNoStore(reply);

    return {
      requestId: deps.identityFactory.nextRequestId(),
      status: "ok"
    };
  });

  app.get("/health/ready", async (_request: FastifyRequest, reply: FastifyReply) => {
    setNoStore(reply);
    await deps.readinessCheck?.();

    return {
      requestId: deps.identityFactory.nextRequestId(),
      status: "ready"
    };
  });

  app.register(function registerRateLimitedRoutes(rateLimitedApp) {
    const publicReadPreHandler = rateLimitedApp.rateLimit({
      max: 120,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const publicMutationPreHandler = rateLimitedApp.rateLimit({
      max: 20,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const authenticatedReadPreHandler = rateLimitedApp.rateLimit({
      max: 120,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const authenticatedMutationPreHandler = rateLimitedApp.rateLimit({
      max: 60,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const createDeliveryPreHandler = rateLimitedApp.rateLimit({
      max: 20,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const paymentInitializePreHandler = rateLimitedApp.rateLimit({
      max: 10,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const adminMutationPreHandler = rateLimitedApp.rateLimit({
      max: 5,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const webhookPreHandler = rateLimitedApp.rateLimit({
      max: 300,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const internalTaskPreHandler = rateLimitedApp.rateLimit({
      max: 120,
      timeWindow: "1 minute",
      skipOnError: false
    });
    const requireAuthenticated = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAuthenticatedPrincipal(principal);
    };
    const requireCapability = (capability: Capability) =>
      async (request: FastifyRequest) => {
        const principal = await authenticateRequest(request, deps.authVerifier);
        assertCapabilityForPrincipal(principal, capability);
      };
    const requireAdmin = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
    };
    const requireAdminCapability = (capability: Capability) =>
      async (request: FastifyRequest) => {
        const principal = await authenticateRequest(request, deps.authVerifier);
        assertAdminPrincipal(principal);
        assertCapabilityForPrincipal(principal, capability);
      };
    const requireIssueManagement = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);

      if (
        principal.role !== "ops_admin" &&
        principal.role !== "support_admin" &&
        principal.role !== "super_admin"
      ) {
        throw new ApiServiceError("FORBIDDEN", "Issue management scope is required.", {
          userId: principal.userId,
          role: principal.role
        });
      }
    };
    const requireIssueCreationAccess = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = createIssueRequestSchema.parse(request.body);

      if (principal.capabilities.includes("open_issue")) {
        return;
      }

      if (principal.capabilities.includes("report_delay") && input.category === "delay") {
        return;
      }

      throw new ApiServiceError("FORBIDDEN", "Principal cannot create this kind of support issue.", {
        userId: principal.userId,
        role: principal.role,
        category: input.category
      });
    };
    const requireFinanceAdmin = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);

      if (principal.role !== "finance_admin" && principal.role !== "super_admin") {
        throw new ApiServiceError("FORBIDDEN", "Finance admin scope is required.", {
          userId: principal.userId,
          role: principal.role
        });
      }
    };
    const requireStationManagement = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      assertCapabilityForPrincipal(principal, "override_queue_state");
    };
    const requirePaymentInitializationAccess = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertCapabilityForPrincipal(principal, "create_delivery");
      const input = paymentInitializeRequestSchema.parse(request.body);
      const delivery = await deps.deliveries.getById(input.deliveryId);

      if (!delivery) {
        throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
          deliveryId: input.deliveryId
        });
      }

      if (principal.userId !== delivery.senderId) {
        throw new ApiServiceError(
          "FORBIDDEN",
          "Payment initialization is restricted to the delivery sender.",
          {
            deliveryId: input.deliveryId,
            userId: principal.userId
          }
        );
      }
    };
    const requirePaymentVerificationAccess = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = paymentVerifyRequestSchema.parse(request.body);
      const delivery = await deps.deliveries.getById(input.deliveryId);

      if (!delivery) {
        throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
          deliveryId: input.deliveryId
        });
      }

      assertCanAccessDelivery(principal, delivery);
    };
    const requireDeliveryCompletionAccess = async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const deliveryId = (request.params as { id: string }).id;
      const delivery = await deps.deliveries.getById(deliveryId);

      if (!delivery) {
        throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
          deliveryId
        });
      }

      if (delivery.currentStatus === "awaiting_receiver_pickup") {
        if (principal.role !== "station_operator" || principal.stationId !== delivery.destinationStationId) {
          throw new ApiServiceError(
            "FORBIDDEN",
            "Pickup completion is restricted to the destination station operator.",
            {
              deliveryId,
              userId: principal.userId,
              role: principal.role
            }
          );
        }

        return;
      }

      assertCapabilityForPrincipal(principal, "complete_delivery_with_proof");
    };
    const requireMtnMomoWebhookSignature = (request: FastifyRequest) =>
      Promise.resolve().then(() => {
        const payload = mtnMomoWebhookRequestSchema.parse(request.body);

        verifyWebhookSignature(
          payload,
          typeof request.headers["x-kra-webhook-signature"] === "string"
            ? request.headers["x-kra-webhook-signature"]
            : undefined,
          deps.config.mtnMomo?.webhookSharedSecret
        );
      });
    const requireInternalTaskSecret = (request: FastifyRequest) =>
      Promise.resolve().then(() => {
        verifyInternalTaskSecret(
          typeof request.headers["x-kra-internal-task-secret"] === "string"
            ? request.headers["x-kra-internal-task-secret"]
            : undefined,
          deps.config.internalTaskSharedSecret
        );
      });

    rateLimitedApp.get("/v1/notifications", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return listNotifications(principal, (request.query as Record<string, unknown>) ?? {}, {
        notificationFeed: deps.notificationFeed
      });
    });

    rateLimitedApp.post("/v1/internal/outbound-notifications/dispatch-due", { preHandler: [internalTaskPreHandler, requireInternalTaskSecret] }, async (request: FastifyRequest, reply: FastifyReply) => {
      if (!deps.notifications) {
        throw new ApiServiceError("ROUTE_NOT_ENABLED", "Outbound notification dispatch is not configured.", {
          reason: "missing_notification_gateway"
        });
      }

      setNoStore(reply);

      const input = outboundNotificationDispatchRequestSchema.parse(request.body ?? {});
      const result = await dispatchDueOutboundNotifications(input, {
        outboundNotifications: deps.outboundNotifications,
        notifications: deps.notifications,
        now: deps.now
      });

      return outboundNotificationDispatchResponseSchema.parse(result);
    });

    rateLimitedApp.post("/v1/internal/payments/reconcile-due", { preHandler: [internalTaskPreHandler, requireInternalTaskSecret] }, async (request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);

      const input = paymentReconciliationDispatchRequestSchema.parse(request.body ?? {});
      const result = await reconcileDueMtnMomoPayments(input, {
        payments: deps.payments,
        deliveries: deps.deliveries,
        gateway: deps.gateway,
        now: deps.now
      });

      for (const item of result.results) {
        if (item.action === "confirmed" || item.action === "failed") {
          await queuePaymentStatusNotification(deps, item.deliveryId, item.action);
        }
      }

      return paymentReconciliationDispatchResponseSchema.parse(result);
    });

    rateLimitedApp.get("/v1/deliveries", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return listAccessibleDeliveries(principal, (request.query as Record<string, unknown>) ?? {}, {
        deliveries: deps.deliveries
      });
    });

    rateLimitedApp.post("/v1/deliveries", { preHandler: [createDeliveryPreHandler, requireCapability("create_delivery")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = createDeliveryRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "create_delivery",
        fingerprint: {
          body: input
        }
      }, async () => {
        const result = await createDeliveryBooking(
          principal.userId,
          {
            senderId: principal.userId,
            originStationId: input.originStationId,
            destinationStationId: input.destinationStationId,
            receiver: {
              name: input.receiver.name,
              phone: input.receiver.phone,
              ...withOptionalValue("addressText", input.receiver.addressText)
            },
            package: input.package,
            serviceType: input.serviceType,
            doorstepRequested: input.doorstepRequested,
            ...withOptionalValue("doorstepDistanceKm", input.doorstepDistanceKm)
          },
          {
            deliveries: deps.deliveries,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await queueSenderNotificationForDelivery(
          deps,
          result.delivery,
          {
            type: "delivery_created",
            title: "Delivery created",
            body: "Your delivery has been created. Complete payment so Kra can move it into transport."
          },
          `delivery:${result.delivery.deliveryId}:delivery_created`
        );

        return {
          statusCode: 201,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/cancel", { preHandler: [authenticatedMutationPreHandler, requireCapability("cancel_eligible_delivery")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = cancelDeliveryRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "cancel_delivery",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await cancelDelivery(
            principal,
            {
              deliveryId,
              reasonCode: input.reasonCode,
              ...(input.note === undefined ? {} : { note: input.note })
            },
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              payments: deps.payments,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.get("/v1/deliveries/:id", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return getDeliveryDetail(principal, (request.params as { id: string }).id, {
        deliveries: deps.deliveries
      });
    });

    rateLimitedApp.get("/v1/deliveries/:id/timeline", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return getDeliveryTimeline(principal, (request.params as { id: string }).id, {
        deliveries: deps.deliveries,
        deliveryEvents: deps.deliveryEvents,
        handoffEvents: deps.handoffEvents,
        issues: deps.issues
      });
    });

    rateLimitedApp.get("/v1/public/track/:trackingCode", { preHandler: publicReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return getPublicTracking((request.params as { trackingCode: string }).trackingCode, {
        deliveries: deps.deliveries
      });
    });

    rateLimitedApp.post("/v1/public/track/:trackingCode/request-verification", { preHandler: publicMutationPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = requestPhoneVerificationChallengeRequestSchema.parse(request.body);
      const trackingCode = (request.params as { trackingCode: string }).trackingCode;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "request_public_tracking_phone_challenge",
        fingerprint: {
          trackingCode,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await requestPublicTrackingPhoneChallenge(
            {
              trackingCode,
              phone: input.phone
            },
            {
              deliveries: deps.deliveries,
              verification: deps.verification,
              identityFactory: deps.identityFactory,
              now: deps.now,
              ...(deps.notifications === undefined
                ? {}
                : { notifications: deps.notifications })
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/public/track/:trackingCode/verify-phone", { preHandler: publicMutationPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = verifyPhoneRequestSchema.parse(request.body);
      const trackingCode = (request.params as { trackingCode: string }).trackingCode;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "verify_public_tracking_phone",
        fingerprint: {
          trackingCode,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await verifyPublicTrackingPhone(
            {
              trackingCode,
              phone: input.phone,
              otp: input.otp
            },
            {
              deliveries: deps.deliveries,
              verification: deps.verification,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/payments/initialize", { preHandler: [paymentInitializePreHandler, requirePaymentInitializationAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = paymentInitializeRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "initialize_payment",
        fingerprint: {
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await initializeMtnMomoPayment(input, {
            deliveries: deps.deliveries,
            payments: deps.payments,
            gateway: deps.gateway,
            identityFactory: deps.identityFactory,
            now: deps.now
          })
        ).response
      }));
    });

    rateLimitedApp.post("/v1/payments/verify", { preHandler: [authenticatedMutationPreHandler, requirePaymentVerificationAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = paymentVerifyRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "verify_payment",
        fingerprint: {
          body: input
        }
      }, async () => {
        const result = await verifyMtnMomoPayment(
          {
            deliveryId: input.deliveryId
          },
          {
            deliveries: deps.deliveries,
            payments: deps.payments,
            gateway: deps.gateway,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await queuePaymentStatusNotification(deps, input.deliveryId, result.response.paymentStatus);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/payments/refund", { preHandler: [adminMutationPreHandler, requireAdminCapability("approve_refund")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = refundPaymentRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "refund_payment",
        fingerprint: {
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await requestPaymentRefund(
            {
              paymentId: input.paymentId,
              ...withOptionalValue("duplicateCharge", input.duplicateCharge),
              ...withOptionalValue("platformPaymentError", input.platformPaymentError),
              ...withOptionalValue(
                "packageNeverReceivedAtOrigin",
                input.packageNeverReceivedAtOrigin
              ),
              ...withOptionalValue("doorstepAttemptOccurred", input.doorstepAttemptOccurred),
              ...withOptionalValue("expressHandlingPerformed", input.expressHandlingPerformed)
            },
            {
              deliveries: deps.deliveries,
              payments: deps.payments,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/payments/refund/settle", { preHandler: [adminMutationPreHandler, requireAdminCapability("execute_refund")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = settleRefundRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "settle_refund_payment",
        fingerprint: {
          body: input
        }
      }, async () => {
        const result = await settlePaymentRefund(
          {
            paymentId: input.paymentId,
            refundReference: input.refundReference,
            ...(input.settledAt === undefined ? {} : { settledAt: input.settledAt })
          },
          {
            deliveries: deps.deliveries,
            payments: deps.payments,
            now: deps.now
          }
        );
        const delivery = await deps.deliveries.getById(result.response.deliveryId);

        if (delivery) {
          await queueSenderNotificationForDelivery(
            deps,
            delivery,
            {
              type: "refund_completed",
              title: "Refund completed",
              body: "Your refund has been completed and marked as settled."
            },
            `payment:${result.response.paymentId}:refund_completed`
          );
        }

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/webhooks/payments/mtn-momo", { preHandler: [webhookPreHandler, requireMtnMomoWebhookSignature] }, async (request: FastifyRequest) => {
      const payload = mtnMomoWebhookRequestSchema.parse(request.body);

      const result = await processMtnMomoWebhook(
        {
          providerReference: payload.providerReference,
          eventType: payload.eventType,
          amountGhs: payload.amountGhs,
          currency: payload.currency,
          occurredAt: payload.occurredAt,
          rawPayload: payload.rawPayload ?? {},
          ...withOptionalValue("providerEventId", payload.providerEventId)
        },
        {
          deliveries: deps.deliveries,
          payments: deps.payments,
          webhookEvents: deps.webhookEvents,
          identityFactory: deps.identityFactory,
          now: deps.now
        }
      );

      if (payload.eventType === "payment.confirmed" && result.response.matchedDeliveryId) {
        await queuePaymentStatusNotification(deps, result.response.matchedDeliveryId, "confirmed");
      }

      if (payload.eventType === "payment.failed" && result.response.matchedDeliveryId) {
        await queuePaymentStatusNotification(deps, result.response.matchedDeliveryId, "failed");
      }

      return result.response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/intake", { preHandler: [authenticatedMutationPreHandler, requireCapability("confirm_intake")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = confirmIntakeRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "confirm_intake",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await confirmOriginIntake(
          {
            deliveryId,
            measuredWeightKg: input.measuredWeightKg,
            sizeTier: input.sizeTier,
            condition: input.condition,
            labelScanCode: input.labelScanCode,
            ...withOptionalValue("fallbackUsed", input.fallbackUsed),
            ...withOptionalValue("supervisorOverrideActorId", input.supervisorOverrideActorId)
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/assign-driver", { preHandler: [authenticatedMutationPreHandler, requireCapability("assign_driver")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = assignDriverRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "assign_driver",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await assignDriver(
            {
              deliveryId,
              driverUserId: input.driverUserId
            },
            mapPrincipalToOperationalActor(principal),
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              handoffEvents: deps.handoffEvents,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/accept-run", { preHandler: [authenticatedMutationPreHandler, requireCapability("accept_run")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = acceptRunRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "accept_run",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await acceptDriverRun(
            {
              deliveryId,
              ...withOptionalValue("note", input.note)
            },
            mapPrincipalToOperationalActor(principal),
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              handoffEvents: deps.handoffEvents,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/dispatch", { preHandler: [authenticatedMutationPreHandler, requireCapability("confirm_dispatch")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = dispatchDeliveryRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "dispatch_delivery",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await dispatchDelivery(
          {
            deliveryId,
            packageScanCode: input.packageScanCode,
            ...withOptionalValue("fallbackUsed", input.fallbackUsed),
            ...withOptionalValue("supervisorOverrideActorId", input.supervisorOverrideActorId)
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/confirm-pickup", { preHandler: [authenticatedMutationPreHandler, requireCapability("confirm_pickup")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = confirmDriverPickupRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "confirm_pickup",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await confirmDriverPickup(
            {
              deliveryId,
              packageScanCode: input.packageScanCode,
              ...withOptionalValue("fallbackUsed", input.fallbackUsed),
              ...withOptionalValue("supervisorOverrideActorId", input.supervisorOverrideActorId)
            },
            mapPrincipalToOperationalActor(principal),
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              handoffEvents: deps.handoffEvents,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/mark-in-transit", { preHandler: [authenticatedMutationPreHandler, requireCapability("update_transit_status")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = markInTransitRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "mark_in_transit",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await markDeliveryInTransit(
            {
              deliveryId,
              ...withOptionalValue("note", input.note)
            },
            mapPrincipalToOperationalActor(principal),
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              handoffEvents: deps.handoffEvents,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/receive-destination", { preHandler: [authenticatedMutationPreHandler, requireCapability("confirm_destination_receipt")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = receiveDestinationRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "receive_destination",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await receiveDestination(
          {
            deliveryId,
            packageScanCode: input.packageScanCode,
            condition: input.condition,
            nextStep: input.nextStep,
            ...withOptionalValue("fallbackUsed", input.fallbackUsed),
            ...withOptionalValue("supervisorOverrideActorId", input.supervisorOverrideActorId)
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/assign-final-mile", { preHandler: [authenticatedMutationPreHandler, requireCapability("assign_final_mile")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = assignFinalMileRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "assign_final_mile",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await assignFinalMileCourier(
          {
            deliveryId,
            courierUserId: input.courierUserId
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await sendReceiverDeliverySms(deps, result.delivery, "final_mile_assigned");

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/accept-final-mile-assignment", { preHandler: [authenticatedMutationPreHandler, requireCapability("accept_final_mile_assignment")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = acceptFinalMileAssignmentRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "accept_final_mile_assignment",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: (
          await acceptFinalMileAssignment(
            {
              deliveryId,
              ...withOptionalValue("note", input.note)
            },
            mapPrincipalToOperationalActor(principal),
            {
              deliveries: deps.deliveries,
              deliveryEvents: deps.deliveryEvents,
              handoffEvents: deps.handoffEvents,
              identityFactory: deps.identityFactory,
              now: deps.now
            }
          )
        ).response
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/out-for-delivery", { preHandler: [authenticatedMutationPreHandler, requireCapability("mark_out_for_delivery")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = markOutForDeliveryRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "mark_out_for_delivery",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await markDeliveryOutForDelivery(
          {
            deliveryId,
            ...withOptionalValue("note", input.note)
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/final-mile-failed-attempt", { preHandler: [authenticatedMutationPreHandler, requireCapability("record_failed_attempt")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = recordFailedAttemptRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "record_failed_attempt",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await recordFinalMileFailedAttempt(
          {
            deliveryId,
            reasonCode: input.reasonCode,
            ...(input.note === undefined ? {} : { note: input.note })
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        await sendReceiverDeliverySms(deps, result.delivery, "failed_attempt");
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/proof-assets", { preHandler: [authenticatedMutationPreHandler, requireDeliveryCompletionAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      if (!deps.proofStorage) {
        throw new ApiServiceError("ROUTE_NOT_ENABLED", "Proof asset storage is not configured.", {
          reason: "missing_proof_storage_gateway"
        });
      }

      const proofStorage = deps.proofStorage;
      const principal = getAuthenticatedPrincipal(request);
      const input = createProofAssetUploadRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "create_delivery_proof_asset",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        const result = await createProofAssetUploadIntent(
          {
            deliveryId,
            requestedByUserId: principal.userId,
            requestedByRole: principal.role,
            ...(principal.stationId === undefined ? {} : { requestedByStationId: principal.stationId }),
            proofType: input.proofType,
            contentType: input.contentType,
            byteSize: input.byteSize,
            ...(input.sha256 === undefined ? {} : { sha256: input.sha256 })
          },
          {
            deliveries: deps.deliveries,
            proofAssets: deps.proofAssets,
            proofStorage,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );

        return {
          statusCode: 201,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload", { preHandler: [authenticatedMutationPreHandler, requireDeliveryCompletionAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = confirmProofAssetUploadRequestSchema.parse(request.body);
      const { id: deliveryId, proofAssetId } = request.params as {
        id: string;
        proofAssetId: string;
      };

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "confirm_delivery_proof_asset_upload",
        fingerprint: {
          deliveryId,
          proofAssetId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: await confirmProofAssetUpload(
          {
            deliveryId,
            proofAssetId,
            confirmedByUserId: principal.userId,
            byteSize: input.byteSize,
            sha256: input.sha256,
            ...(input.storageGeneration === undefined
              ? {}
              : { storageGeneration: input.storageGeneration })
          },
          {
            proofAssets: deps.proofAssets,
            now: deps.now
          }
        )
      }));
    });

    rateLimitedApp.post("/v1/deliveries/:id/complete", { preHandler: [authenticatedMutationPreHandler, requireDeliveryCompletionAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = completeDeliveryRequestSchema.parse(request.body);
      const deliveryId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "complete_delivery",
        fingerprint: {
          deliveryId,
          body: input
        }
      }, async () => {
        if (input.proofType !== "otp") {
          await assertUploadedProofAssetForCompletion(
            {
              deliveryId,
              proofAssetId: input.proofReference,
              proofType: input.proofType
            },
            {
              proofAssets: deps.proofAssets
            }
          );
        }

        const result = await completeDelivery(
          {
            deliveryId,
            proofType: input.proofType,
            proofReference: input.proofReference,
            receivedByName: input.receivedByName
          },
          mapPrincipalToOperationalActor(principal),
          {
            deliveries: deps.deliveries,
            deliveryEvents: deps.deliveryEvents,
            handoffEvents: deps.handoffEvents,
            identityFactory: deps.identityFactory,
            now: deps.now
          }
        );
        if (input.proofType !== "otp") {
          await markProofAssetAttachedToDelivery(
            {
              proofAssetId: input.proofReference,
              attachedByUserId: principal.userId
            },
            {
              proofAssets: deps.proofAssets,
              now: deps.now
            }
          );
        }
        await notifyDeliveryStatusChange(deps, result.delivery);

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.get("/v1/issues", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return listSupportIssues(principal, (request.query as Record<string, unknown>) ?? {}, {
        deliveries: deps.deliveries,
        issues: deps.issues
      });
    });

    rateLimitedApp.post("/v1/issues", { preHandler: [authenticatedMutationPreHandler, requireIssueCreationAccess] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = createIssueRequestSchema.parse(request.body);
      return runIdempotentMutation(request, reply, deps, {
        routeKey: "create_issue",
        fingerprint: {
          body: input
        }
      }, async () => {
        const result = await createSupportIssue(principal, input, {
          deliveries: deps.deliveries,
          issues: deps.issues,
          identityFactory: deps.identityFactory,
          now: deps.now
        });
        await queueIssueNotification(
          deps,
          result.issue.deliveryId,
          result.issue.issueId,
          result.issue.status
        );

        return {
          statusCode: 201,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.get("/v1/issues/:id", { preHandler: [authenticatedReadPreHandler, requireAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return getSupportIssue(principal, (request.params as { id: string }).id, {
        deliveries: deps.deliveries,
        issues: deps.issues
      });
    });

    rateLimitedApp.post("/v1/issues/:id/escalate", { preHandler: [adminMutationPreHandler, requireAdminCapability("escalate_case")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = escalateIssueRequestSchema.parse(request.body);
      const issueId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "escalate_issue",
        fingerprint: {
          issueId,
          body: input
        }
      }, async () => {
        const result = await escalateSupportIssue(principal, issueId, input, {
          deliveries: deps.deliveries,
          issues: deps.issues,
          now: deps.now
        });
        await queueIssueNotification(
          deps,
          result.issue.deliveryId,
          result.issue.issueId,
          result.issue.status
        );

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.post("/v1/issues/:id/resolve", { preHandler: [adminMutationPreHandler, requireIssueManagement] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = resolveIssueRequestSchema.parse(request.body);
      const issueId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "resolve_issue",
        fingerprint: {
          issueId,
          body: input
        }
      }, async () => {
        const result = await resolveSupportIssue(principal, issueId, input, {
          deliveries: deps.deliveries,
          issues: deps.issues,
          now: deps.now
        });
        await queueIssueNotification(
          deps,
          result.issue.deliveryId,
          result.issue.issueId,
          result.issue.status
        );

        return {
          statusCode: 200,
          responseBody: result.response
        };
      });
    });

    rateLimitedApp.get("/v1/admin/overview", { preHandler: [authenticatedReadPreHandler, requireAdmin] }, async (_request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return getAdminOverview({
        deliveries: deps.deliveries,
        payments: deps.payments,
        webhookEvents: deps.webhookEvents,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/deliveries", { preHandler: [authenticatedReadPreHandler, requireAdmin] }, async (_request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminDeliveries({
        deliveries: deps.deliveries,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/stations", { preHandler: [authenticatedReadPreHandler, requireAdmin] }, async (_request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminStations({
        deliveries: deps.deliveries,
        issues: deps.issues,
        stations: deps.stations,
        now: deps.now
      });
    });

    rateLimitedApp.post("/v1/admin/stations/:id/status", { preHandler: [adminMutationPreHandler, requireStationManagement] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = adminUpdateStationStatusRequestSchema.parse(request.body);
      const stationId = (request.params as { id: Parameters<StationRepository["getById"]>[0] }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "admin_update_station_status",
        fingerprint: {
          stationId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: await updateStationStatus(stationId, input, {
          stations: deps.stations,
          now: deps.now
        })
      }));
    });

    rateLimitedApp.post("/v1/admin/stations/:id/validation", { preHandler: [adminMutationPreHandler, requireStationManagement] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const input = adminUpdateStationValidationRequestSchema.parse(request.body);
      const stationId = (request.params as { id: Parameters<StationRepository["getById"]>[0] }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "admin_update_station_validation",
        fingerprint: {
          stationId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: await updateStationValidation(stationId, input, {
          stations: deps.stations,
          now: deps.now
        })
      }));
    });

    rateLimitedApp.get("/v1/admin/finance", { preHandler: [authenticatedReadPreHandler, requireFinanceAdmin] }, async (_request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminFinance({
        payments: deps.payments,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/payment-reconciliation", { preHandler: [authenticatedReadPreHandler, requireAdminCapability("review_reconciliation")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminPaymentReconciliation((request.query as Record<string, unknown>) ?? {}, {
        payments: deps.payments,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/users", { preHandler: [authenticatedReadPreHandler, requireAdminCapability("manage_users_and_roles")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminUsers((request.query as Record<string, unknown>) ?? {}, {
        users: deps.users,
        now: deps.now
      });
    });

    rateLimitedApp.post("/v1/admin/users", { preHandler: [adminMutationPreHandler, requireAdminCapability("manage_users_and_roles")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = adminUpsertUserRequestSchema.parse(request.body);

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "admin_upsert_user",
        fingerprint: {
          userId: input.userId,
          body: input
        }
      }, async () => ({
        statusCode: 201,
        responseBody: await upsertAdminUser(principal, input, {
          users: deps.users,
          now: deps.now
        })
      }));
    });

    rateLimitedApp.post("/v1/admin/users/:id/access", { preHandler: [adminMutationPreHandler, requireAdminCapability("manage_users_and_roles")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      const input = adminUpdateUserAccessRequestSchema.parse(request.body);
      const userId = (request.params as { id: string }).id;

      return runIdempotentMutation(request, reply, deps, {
        routeKey: "admin_update_user_access",
        fingerprint: {
          userId,
          body: input
        }
      }, async () => ({
        statusCode: 200,
        responseBody: await updateAdminUserAccess(principal, userId, input, {
          users: deps.users,
          now: deps.now
        })
      }));
    });

    rateLimitedApp.get("/v1/admin/audit-events", { preHandler: [authenticatedReadPreHandler, requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return listAdminAuditEvents(principal, (request.query as Record<string, unknown>) ?? {}, {
        auditEvents: deps.auditEvents
      });
    });

    rateLimitedApp.get("/v1/admin/outbound-notifications", { preHandler: [authenticatedReadPreHandler, requireIssueManagement] }, async (request: FastifyRequest, reply: FastifyReply) => {
      setNoStore(reply);
      return listAdminOutboundNotifications((request.query as Record<string, unknown>) ?? {}, {
        outboundNotifications: deps.outboundNotifications,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/webhook-events", { preHandler: [authenticatedReadPreHandler, requireAdminCapability("review_reconciliation")] }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = getAuthenticatedPrincipal(request);
      setNoStore(reply);
      return listAdminWebhookEvents(principal, (request.query as Record<string, unknown>) ?? {}, {
        webhookEvents: deps.webhookEvents,
        now: deps.now
      });
    });
  });

  return app;
}

export function createRuntimeApiApp(config = loadApiRuntimeConfig()): FastifyInstance {
  return createApiApp(buildRuntimeAppDeps(config));
}
