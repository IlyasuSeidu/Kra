import { describe, expect, it } from "vitest";

import {
  buildDefaultPricingRule,
  getActivePricingRulesResponse,
  pricingRuleToConfig,
  updateActivePricingRules,
  type PricingRuleRecord
} from "../pricing-rules";

const routeBaseFees: PricingRuleRecord["routeBaseFees"] = [
  { originStationId: "ST-ACC-01", destinationStationId: "ST-KMS-01", baseFeeGhs: 35 },
  { originStationId: "ST-ACC-01", destinationStationId: "ST-TML-01", baseFeeGhs: 65 },
  { originStationId: "ST-KMS-01", destinationStationId: "ST-ACC-01", baseFeeGhs: 35 },
  { originStationId: "ST-KMS-01", destinationStationId: "ST-TML-01", baseFeeGhs: 50 },
  { originStationId: "ST-TML-01", destinationStationId: "ST-ACC-01", baseFeeGhs: 65 },
  { originStationId: "ST-TML-01", destinationStationId: "ST-KMS-01", baseFeeGhs: 50 }
];

describe("pricing rules", () => {
  it("returns default launch pricing when no active database rule exists", async () => {
    const response = await getActivePricingRulesResponse({
      pricingRules: {
        getActive() {
          return Promise.resolve(undefined);
        },
        saveActive() {
          return Promise.resolve();
        }
      },
      now: () => "2026-05-16T15:00:00.000Z"
    });

    expect(response).toMatchObject({
      pricingRuleId: "PRC-DEFAULT",
      status: "active"
    });
    expect(
      response.routeBaseFees.some(
        (fee) =>
          fee.originStationId === "ST-ACC-01" &&
          fee.destinationStationId === "ST-KMS-01" &&
          fee.baseFeeGhs === 35
      )
    ).toBe(true);
  });

  it("updates active route pricing and converts it into quote config", async () => {
    let saved: PricingRuleRecord | undefined;

    const response = await updateActivePricingRules(
      {
        userId: "USR-FIN-001",
        role: "finance_admin",
        capabilities: ["manage_pricing_rules"],
        authMethod: "firebase_id_token"
      },
      {
        routeBaseFees: routeBaseFees.map((fee) =>
          fee.originStationId === "ST-ACC-01" && fee.destinationStationId === "ST-KMS-01"
            ? { ...fee, baseFeeGhs: 42 }
            : fee
        )
      },
      {
        pricingRules: {
          getActive() {
            return Promise.resolve(undefined);
          },
          saveActive(record) {
            saved = record;
            return Promise.resolve();
          }
        },
        identityFactory: {
          nextPricingRuleId() {
            return "PRC-0001";
          }
        },
        now: () => "2026-05-16T15:30:00.000Z"
      }
    );

    expect(response).toMatchObject({
      pricingRuleId: "PRC-0001",
      updatedByUserId: "USR-FIN-001"
    });
    expect(saved).toBeDefined();
    expect(
      pricingRuleToConfig(saved ?? buildDefaultPricingRule("2026-05-16T15:00:00.000Z"))
    ).toMatchObject({
      routeBaseFees: {
        "ST-ACC-01:ST-KMS-01": 42
      }
    });
  });
});
