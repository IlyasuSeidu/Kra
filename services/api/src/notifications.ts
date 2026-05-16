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

function formatExpiryLabel(expiresAt: string): string {
  return new Date(expiresAt).toISOString().slice(11, 16);
}

export function createHubtelSmsGateway(
  config: ApiRuntimeConfig
): PublicTrackingOtpNotificationGateway {
  if (!config.hubtelSms) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "Hubtel SMS runtime configuration is missing.", {
      reason: "missing_hubtel_sms_config"
    });
  }

  const hubtelConfig = config.hubtelSms;

  return {
    async sendPublicTrackingOtp(input) {
      const message = `Kra verification code ${input.otp} for ${input.trackingCode}. Expires at ${formatExpiryLabel(input.expiresAt)} UTC.`;
      const url = new URL("/v1/messages/send", hubtelConfig.baseUrl);

      url.search = new URLSearchParams({
        clientid: hubtelConfig.clientId,
        clientsecret: hubtelConfig.clientSecret,
        from: hubtelConfig.from,
        to: input.phone,
        content: message
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
  };
}
