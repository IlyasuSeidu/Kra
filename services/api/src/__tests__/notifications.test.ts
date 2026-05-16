import { afterEach, describe, expect, it, vi } from "vitest";

import { createHubtelSmsGateway } from "../notifications";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Hubtel SMS gateway", () => {
  it("sends receiver milestone SMS with a delivery-scoped tracking link", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Status: 0, MessageId: "MSG-001" }))
    });

    vi.stubGlobal("fetch", fetchMock);

    const gateway = createHubtelSmsGateway({
      firebaseProjectId: "kra-prod",
      apiPort: 8080,
      hubtelSms: {
        baseUrl: "https://smsc.hubtel.com",
        clientId: "hubtel-client-001",
        clientSecret: "hubtel-secret-001",
        from: "Kra",
        publicTrackingBaseUrl: "https://kra.example.com/track"
      }
    });

    await gateway.sendReceiverDeliverySms({
      phone: "+233240000000",
      trackingCode: "KRA-9401",
      eventType: "ready_for_pickup",
      stationName: "Kumasi Asafo"
    });

    const requestUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);

    expect(requestUrl.origin).toBe("https://smsc.hubtel.com");
    expect(requestUrl.searchParams.get("to")).toBe("+233240000000");
    expect(requestUrl.searchParams.get("content")).toBe(
      "Kra: Package KRA-9401 is ready for pickup at Kumasi Asafo. Track: https://kra.example.com/track/KRA-9401"
    );
  });
});
