import { createHmac, timingSafeEqual } from "node:crypto";

import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import {
  assignDriverRequestSchema,
  assignFinalMileRequestSchema,
  buildApiErrorResponse,
  cancelDeliveryRequestSchema,
  completeDeliveryRequestSchema,
  confirmIntakeRequestSchema,
  createDeliveryRequestSchema,
  createIssueRequestSchema,
  dispatchDeliveryRequestSchema,
  escalateIssueRequestSchema,
  mtnMomoWebhookRequestSchema,
  paymentInitializeRequestSchema,
  paymentVerifyRequestSchema,
  receiveDestinationRequestSchema,
  refundPaymentRequestSchema,
  requestPhoneVerificationChallengeRequestSchema,
  settleRefundRequestSchema,
  verifyPhoneRequestSchema
} from "@kra/shared";
import { ZodError } from "zod";

import {
  assertAdminPrincipal,
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
  listAdminStations,
  type AdminDeliveryMetricsRepository,
  type AdminIssueMetricsRepository,
  type AdminPaymentMetricsRepository,
  type AdminWebhookMetricsRepository
} from "./admin";
import { cancelDelivery } from "./cancellations";
import { loadApiRuntimeConfig, type ApiRuntimeConfig } from "./config";
import { createDeliveryBooking, type DeliveryRepository } from "./deliveries";
import {
  getDeliveryDetail,
  getDeliveryTimeline,
  type DeliveryEventReadRepository,
  type DeliveryIssueReadRepository,
  type HandoffEventReadRepository
} from "./delivery-queries";
import {
  getFirebaseAdminApp,
  getKraFirestore
} from "./firestore/client";
import { createFirestoreApiRepositories } from "./firestore/repositories";
import {
  assignDriver,
  assignFinalMileCourier,
  completeDelivery,
  confirmOriginIntake,
  dispatchDelivery,
  receiveDestination,
  type DeliveryEventRepository,
  type DeliveryLifecycleIdentityFactory,
  type DeliveryLifecycleRepository,
  type HandoffEventRepository,
  type OperationalActor
} from "./handoffs";
import { createApiIdentityFactory } from "./ids";
import {
  createSupportIssue,
  escalateSupportIssue,
  getSupportIssue,
  type SupportIssueIdentityFactory,
  type SupportIssueRepository
} from "./issues";
import { createMtnMomoGateway } from "./mtn-momo";
import {
  createHubtelSmsGateway,
  type PublicTrackingOtpNotificationGateway
} from "./notifications";
import {
  processMtnMomoWebhook,
  type PaymentLookupRepository,
  type PaymentWebhookIdentityFactory,
  type WebhookEventRepository
} from "./payment-webhooks";
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
import { ApiServiceError } from "./service-errors";

declare module "fastify" {
  interface FastifyRequest {
    principal?: AuthPrincipal;
  }
}

type SharedIdentityFactory = PaymentIdentityFactory &
  PaymentWebhookIdentityFactory &
  DeliveryLifecycleIdentityFactory &
  PublicTrackingVerificationIdentityFactory &
  SupportIssueIdentityFactory & {
    nextRequestId(): string;
    nextDeliveryId(): string;
    nextTrackingCode(): string;
  };

export interface ApiAppDeps {
  config: ApiRuntimeConfig;
  authVerifier: AuthVerifier;
  deliveries: DeliveryRepository &
    DeliveryLifecycleRepository &
    AdminDeliveryMetricsRepository;
  deliveryEvents: DeliveryEventRepository & DeliveryEventReadRepository;
  handoffEvents: HandoffEventRepository & HandoffEventReadRepository;
  payments: PaymentRepository &
    PaymentLookupRepository &
    RefundPaymentRepository &
    AdminPaymentMetricsRepository;
  issues: SupportIssueRepository & AdminIssueMetricsRepository & DeliveryIssueReadRepository;
  verification: PublicTrackingVerificationRepository;
  webhookEvents: WebhookEventRepository & AdminWebhookMetricsRepository;
  gateway: MtnMomoGateway;
  notifications?: PublicTrackingOtpNotificationGateway;
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

function buildRuntimeAppDeps(config = loadApiRuntimeConfig()): ApiAppDeps {
  const firestore = getKraFirestore(config);
  const repositories = createFirestoreApiRepositories(firestore, () => new Date().toISOString());
  const identityFactory = createApiIdentityFactory();

  return {
    config,
    authVerifier: createFirebaseAuthVerifier(getFirebaseAdminApp(config)),
    deliveries: repositories.deliveries,
    deliveryEvents: repositories.deliveryEvents,
    handoffEvents: repositories.handoffEvents,
    payments: repositories.payments,
    issues: repositories.issues,
    verification: repositories.verification,
    webhookEvents: repositories.webhookEvents,
    gateway: createMtnMomoGateway(config),
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

    rateLimitedApp.post("/v1/deliveries", { preHandler: createDeliveryPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertCapabilityForPrincipal(principal, "create_delivery");
      const input = createDeliveryRequestSchema.parse(request.body);
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

      reply.status(201);
      return result.response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/cancel", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = cancelDeliveryRequestSchema.parse(request.body);

      return (
        await cancelDelivery(
          principal,
          {
            deliveryId: (request.params as { id: string }).id,
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
      ).response;
    });

    rateLimitedApp.get("/v1/deliveries/:id", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAuthenticatedPrincipal(principal);
      setNoStore(reply);
      return getDeliveryDetail(principal, (request.params as { id: string }).id, {
        deliveries: deps.deliveries
      });
    });

    rateLimitedApp.get("/v1/deliveries/:id/timeline", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAuthenticatedPrincipal(principal);
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

    rateLimitedApp.post("/v1/public/track/:trackingCode/request-verification", { preHandler: publicMutationPreHandler }, async (request: FastifyRequest) => {
      const input = requestPhoneVerificationChallengeRequestSchema.parse(request.body);

      return (
        await requestPublicTrackingPhoneChallenge(
          {
            trackingCode: (request.params as { trackingCode: string }).trackingCode,
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
      ).response;
    });

    rateLimitedApp.post("/v1/public/track/:trackingCode/verify-phone", { preHandler: publicMutationPreHandler }, async (request: FastifyRequest) => {
      const input = verifyPhoneRequestSchema.parse(request.body);

      return (
        await verifyPublicTrackingPhone(
          {
            trackingCode: (request.params as { trackingCode: string }).trackingCode,
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
      ).response;
    });

    rateLimitedApp.post("/v1/payments/initialize", { preHandler: paymentInitializePreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertCapabilityForPrincipal(principal, "create_delivery");
      const input = paymentInitializeRequestSchema.parse(request.body);

      return (
        await initializeMtnMomoPayment(input, {
          deliveries: deps.deliveries,
          payments: deps.payments,
          gateway: deps.gateway,
          identityFactory: deps.identityFactory,
          now: deps.now
        })
      ).response;
    });

    rateLimitedApp.post("/v1/payments/verify", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAuthenticatedPrincipal(principal);
      const input = paymentVerifyRequestSchema.parse(request.body);

      return (
        await verifyMtnMomoPayment(
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/payments/refund", { preHandler: adminMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      assertCapabilityForPrincipal(principal, "execute_refund");
      const input = refundPaymentRequestSchema.parse(request.body);

      return (
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
      ).response;
    });

    rateLimitedApp.post("/v1/payments/refund/settle", { preHandler: adminMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      assertCapabilityForPrincipal(principal, "execute_refund");
      const input = settleRefundRequestSchema.parse(request.body);

      return (
        await settlePaymentRefund(
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/webhooks/payments/mtn-momo", { preHandler: webhookPreHandler }, async (request: FastifyRequest) => {
      const payload = mtnMomoWebhookRequestSchema.parse(request.body);

      verifyWebhookSignature(
        payload,
        typeof request.headers["x-kra-webhook-signature"] === "string"
          ? request.headers["x-kra-webhook-signature"]
          : undefined,
        deps.config.mtnMomo?.webhookSharedSecret
      );

      return (
        await processMtnMomoWebhook(
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/intake", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = confirmIntakeRequestSchema.parse(request.body);

      return (
        await confirmOriginIntake(
          {
            deliveryId: (request.params as { id: string }).id,
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/assign-driver", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = assignDriverRequestSchema.parse(request.body);

      return (
        await assignDriver(
          {
            deliveryId: (request.params as { id: string }).id,
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
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/dispatch", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = dispatchDeliveryRequestSchema.parse(request.body);

      return (
        await dispatchDelivery(
          {
            deliveryId: (request.params as { id: string }).id,
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
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/receive-destination", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = receiveDestinationRequestSchema.parse(request.body);

      return (
        await receiveDestination(
          {
            deliveryId: (request.params as { id: string }).id,
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/assign-final-mile", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = assignFinalMileRequestSchema.parse(request.body);

      return (
        await assignFinalMileCourier(
          {
            deliveryId: (request.params as { id: string }).id,
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/deliveries/:id/complete", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = completeDeliveryRequestSchema.parse(request.body);

      return (
        await completeDelivery(
          {
            deliveryId: (request.params as { id: string }).id,
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
        )
      ).response;
    });

    rateLimitedApp.post("/v1/issues", { preHandler: authenticatedMutationPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = createIssueRequestSchema.parse(request.body);
      const result = await createSupportIssue(principal, input, {
        deliveries: deps.deliveries,
        issues: deps.issues,
        identityFactory: deps.identityFactory,
        now: deps.now
      });

      reply.status(201);
      return result.response;
    });

    rateLimitedApp.get("/v1/issues/:id", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      setNoStore(reply);
      return getSupportIssue(principal, (request.params as { id: string }).id, {
        deliveries: deps.deliveries,
        issues: deps.issues
      });
    });

    rateLimitedApp.post("/v1/issues/:id/escalate", { preHandler: adminMutationPreHandler }, async (request: FastifyRequest) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      const input = escalateIssueRequestSchema.parse(request.body);

      return (
        await escalateSupportIssue(principal, (request.params as { id: string }).id, input, {
          deliveries: deps.deliveries,
          issues: deps.issues,
          now: deps.now
        })
      ).response;
    });

    rateLimitedApp.get("/v1/admin/overview", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      setNoStore(reply);
      return getAdminOverview({
        deliveries: deps.deliveries,
        payments: deps.payments,
        webhookEvents: deps.webhookEvents,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/deliveries", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      setNoStore(reply);
      return listAdminDeliveries({
        deliveries: deps.deliveries,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/stations", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);
      setNoStore(reply);
      return listAdminStations({
        deliveries: deps.deliveries,
        issues: deps.issues,
        now: deps.now
      });
    });

    rateLimitedApp.get("/v1/admin/finance", { preHandler: authenticatedReadPreHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = await authenticateRequest(request, deps.authVerifier);
      assertAdminPrincipal(principal);

      if (principal.role !== "finance_admin" && principal.role !== "super_admin") {
        throw new ApiServiceError("FORBIDDEN", "Finance admin scope is required.", {
          userId: principal.userId,
          role: principal.role
        });
      }

      setNoStore(reply);
      return listAdminFinance({
        payments: deps.payments,
        now: deps.now
      });
    });
  });

  return app;
}

export function createRuntimeApiApp(config = loadApiRuntimeConfig()): FastifyInstance {
  return createApiApp(buildRuntimeAppDeps(config));
}
