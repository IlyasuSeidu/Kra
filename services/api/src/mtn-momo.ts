import { randomUUID } from "node:crypto";

import type { ApiRuntimeConfig } from "./config";
import type { MtnMomoGateway } from "./payments";
import { ApiServiceError } from "./service-errors";

interface MtnMomoTokenResponse {
  access_token?: string;
}

interface MtnMomoRequestToPayStatusResponse {
  status?: string;
  reason?: string;
}

function normalizeMsisdn(phone: string): string {
  return phone.replace(/^\+/, "");
}

function buildBasicAuthHeader(apiUser: string, apiKey: string): string {
  return `Basic ${Buffer.from(`${apiUser}:${apiKey}`).toString("base64")}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export function createMtnMomoGateway(config: ApiRuntimeConfig): MtnMomoGateway {
  if (!config.mtnMomo) {
    throw new ApiServiceError("ROUTE_NOT_ENABLED", "MTN MoMo runtime configuration is missing.", {
      reason: "missing_mtn_momo_config"
    });
  }

  const momoConfig = config.mtnMomo;

  async function getAccessToken(): Promise<string> {
    const response = await fetch(`${momoConfig.baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: buildBasicAuthHeader(momoConfig.apiUser, momoConfig.apiKey),
        "Ocp-Apim-Subscription-Key": momoConfig.collectionPrimaryKey
      }
    });

    if (!response.ok) {
      throw new ApiServiceError("INTERNAL_ERROR", "Unable to get MTN MoMo access token.", {
        status: response.status
      });
    }

    const payload = await parseJsonResponse<MtnMomoTokenResponse>(response);

    if (!payload.access_token) {
      throw new ApiServiceError("INTERNAL_ERROR", "MTN MoMo access token was not returned.", {
        response: payload
      });
    }

    return payload.access_token;
  }

  return {
    async initializeCharge(input) {
      const accessToken = await getAccessToken();
      const providerReference = randomUUID();

      const response = await fetch(`${momoConfig.baseUrl}/collection/v1_0/requesttopay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": providerReference,
          "X-Target-Environment": momoConfig.targetEnvironment,
          "Ocp-Apim-Subscription-Key": momoConfig.collectionPrimaryKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: input.amountGhs.toString(),
          currency: "GHS",
          externalId: input.deliveryId,
          payer: {
            partyIdType: "MSISDN",
            partyId: normalizeMsisdn(input.payerPhone)
          },
          payerMessage: `Kra delivery ${input.deliveryId}`,
          payeeNote: `Kra delivery ${input.deliveryId}`
        })
      });

      if (response.status !== 202) {
        const payload = await parseJsonResponse<Record<string, unknown>>(response);

        throw new ApiServiceError("INTERNAL_ERROR", "MTN MoMo payment initialization failed.", {
          status: response.status,
          payload
        });
      }

      return {
        providerReference,
        checkoutMode: "ussd_push" as const
      };
    },
    async verifyCharge(input) {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `${momoConfig.baseUrl}/collection/v1_0/requesttopay/${input.providerReference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Target-Environment": momoConfig.targetEnvironment,
            "Ocp-Apim-Subscription-Key": momoConfig.collectionPrimaryKey
          }
        }
      );

      if (!response.ok) {
        const payload = await parseJsonResponse<Record<string, unknown>>(response);

        throw new ApiServiceError("INTERNAL_ERROR", "MTN MoMo payment verification failed.", {
          status: response.status,
          payload,
          providerReference: input.providerReference
        });
      }

      const payload = await parseJsonResponse<MtnMomoRequestToPayStatusResponse>(response);
      const status = payload.status?.toUpperCase();
      const verifiedAt = new Date().toISOString();

      if (status === "SUCCESSFUL") {
        return {
          status: "confirmed" as const,
          verifiedAt
        };
      }

      if (status === "FAILED") {
        return {
          status: "failed" as const,
          verifiedAt,
          ...(payload.reason === undefined ? {} : { failureReason: payload.reason })
        };
      }

      return {
        status: "pending" as const,
        verifiedAt
      };
    }
  };
}
