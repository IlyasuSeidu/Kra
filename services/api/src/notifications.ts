import type { ApiRuntimeConfig } from "./config";
import { ApiServiceError } from "./service-errors";

interface HubtelSmsResponse {
  MessageId?: string;
  Status?: number;
}

export interface PublicTrackingOtpNotificationGateway {
  sendPublicTrackingOtp(input: {
    phone: string;
    otp: string;
    trackingCode: string;
    expiresAt: string;
  }): Promise<void>;
}

export type ReceiverDeliverySmsEvent =
  | "ready_for_pickup"
  | "final_mile_assigned"
  | "out_for_delivery"
  | "failed_attempt"
  | "delivered";

export interface ReceiverDeliveryNotificationGateway {
  sendReceiverDeliverySms(input: {
    phone: string;
    trackingCode: string;
    eventType: ReceiverDeliverySmsEvent;
    stationName?: string;
  }): Promise<void>;
}

function formatExpiryLabel(expiresAt: string): string {
  return new Date(expiresAt).toISOString().slice(11, 16);
}

function buildTrackingUrl(baseUrl: string, trackingCode: string): string {
  const url = new URL(baseUrl);
  const normalizedPath = url.pathname.endsWith("/")
    ? `${url.pathname}${trackingCode}`
    : `${url.pathname}/${trackingCode}`;

  url.pathname = normalizedPath;

  return url.toString();
}

function buildReceiverDeliverySmsContent(
  input: {
    trackingCode: string;
    eventType: ReceiverDeliverySmsEvent;
    stationName?: string;
  },
  trackingUrl: string
): string {
  const stationName = input.stationName ?? "the destination station";

  switch (input.eventType) {
    case "ready_for_pickup":
      return `Kra: Package ${input.trackingCode} is ready for pickup at ${stationName}. Track: ${trackingUrl}`;
    case "final_mile_assigned":
      return `Kra: Package ${input.trackingCode} is being prepared for doorstep delivery. Track: ${trackingUrl}`;
    case "out_for_delivery":
      return `Kra: Package ${input.trackingCode} is out for delivery. Track: ${trackingUrl}`;
    case "failed_attempt":
      return `Kra: We could not complete delivery for ${input.trackingCode}. Check next steps: ${trackingUrl}`;
    case "delivered":
      return `Kra: Package ${input.trackingCode} has been delivered. Track: ${trackingUrl}`;
  }
}

export function createHubtelSmsGateway(
  config: ApiRuntimeConfig
): PublicTrackingOtpNotificationGateway & ReceiverDeliveryNotificationGateway {
  if (!config.hubtelSms) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "Hubtel SMS runtime configuration is missing.", {
      reason: "missing_hubtel_sms_config"
    });
  }

  const hubtelConfig = config.hubtelSms;

  async function sendSms(input: {
    phone: string;
    content: string;
  }): Promise<void> {
    const url = new URL("/v1/messages/send", hubtelConfig.baseUrl);

    url.search = new URLSearchParams({
      clientid: hubtelConfig.clientId,
      clientsecret: hubtelConfig.clientSecret,
      from: hubtelConfig.from,
      to: input.phone,
      content: input.content
    }).toString();

    const response = await fetch(url, {
      method: "GET"
    });

    if (!response.ok) {
      throw new ApiServiceError("INTERNAL_ERROR", "Hubtel SMS delivery failed.", {
        status: response.status
      });
    }

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as HubtelSmsResponse) : undefined;

    if (payload && payload.Status !== undefined && payload.Status !== 0) {
      throw new ApiServiceError("INTERNAL_ERROR", "Hubtel SMS delivery was rejected.", {
        payload
      });
    }
  }

  return {
    async sendPublicTrackingOtp(input) {
      const message = `Kra verification code ${input.otp} for ${input.trackingCode}. Expires at ${formatExpiryLabel(input.expiresAt)} UTC.`;

      await sendSms({
        phone: input.phone,
        content: message
      });
    },
    async sendReceiverDeliverySms(input) {
      await sendSms({
        phone: input.phone,
        content: buildReceiverDeliverySmsContent(
          input,
          buildTrackingUrl(hubtelConfig.publicTrackingBaseUrl, input.trackingCode)
        )
      });
    }
  };
}
