import {
  adminPricingRulesResponseSchema,
  adminUpdatePricingRulesRequestSchema,
  defaultPricingConfig,
  getRoutePricingKey,
  type PricingConfig,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";

export interface PricingRouteBaseFee {
  originStationId: StationId;
  destinationStationId: StationId;
  baseFeeGhs: number;
}

export interface PricingRuleRecord {
  pricingRuleId: string;
  status: "active";
  currency: "GHS";
  routeBaseFees: PricingRouteBaseFee[];
  effectiveAt: string;
  updatedAt: string;
  updatedByUserId: string;
  note?: string;
}

export interface PricingRuleRepository {
  getActive(): Promise<PricingRuleRecord | undefined>;
  saveActive(record: PricingRuleRecord): Promise<void>;
}

export interface PricingRuleIdentityFactory {
  nextPricingRuleId(): string;
}

export type AdminPricingRulesResponse = z.infer<typeof adminPricingRulesResponseSchema>;

function routeBaseFeesFromConfig(pricingConfig: PricingConfig): PricingRouteBaseFee[] {
  return Object.entries(pricingConfig.routeBaseFees)
    .map(([routeKey, baseFeeGhs]) => {
      const [originStationId, destinationStationId] = routeKey.split(":") as [
        StationId,
        StationId
      ];

      return {
        originStationId,
        destinationStationId,
        baseFeeGhs
      };
    })
    .sort((left, right) => {
      const leftKey = getRoutePricingKey(left.originStationId, left.destinationStationId);
      const rightKey = getRoutePricingKey(right.originStationId, right.destinationStationId);
      return leftKey.localeCompare(rightKey);
    });
}

export function buildDefaultPricingRule(now: string): PricingRuleRecord {
  return {
    pricingRuleId: "PRC-DEFAULT",
    status: "active",
    currency: "GHS",
    routeBaseFees: routeBaseFeesFromConfig(defaultPricingConfig),
    effectiveAt: now,
    updatedAt: now,
    updatedByUserId: "USR-SYSTEM",
    note: "Default launch corridor pricing"
  };
}

export function pricingRuleToConfig(record: PricingRuleRecord): PricingConfig {
  return {
    routeBaseFees: Object.fromEntries(
      record.routeBaseFees.map((fee) => [
        getRoutePricingKey(fee.originStationId, fee.destinationStationId),
        fee.baseFeeGhs
      ])
    )
  };
}

export async function getActivePricingRule(
  deps: {
    pricingRules: PricingRuleRepository;
    now: () => string;
  }
): Promise<PricingRuleRecord> {
  return (await deps.pricingRules.getActive()) ?? buildDefaultPricingRule(deps.now());
}

export async function getActivePricingRulesResponse(
  deps: {
    pricingRules: PricingRuleRepository;
    now: () => string;
  }
): Promise<AdminPricingRulesResponse> {
  return adminPricingRulesResponseSchema.parse(await getActivePricingRule(deps));
}

export async function updateActivePricingRules(
  principal: AuthPrincipal,
  input: z.input<typeof adminUpdatePricingRulesRequestSchema>,
  deps: {
    pricingRules: PricingRuleRepository;
    identityFactory: PricingRuleIdentityFactory;
    now: () => string;
  }
): Promise<AdminPricingRulesResponse> {
  const parsedInput = adminUpdatePricingRulesRequestSchema.parse(input);
  const now = deps.now();
  const record: PricingRuleRecord = {
    pricingRuleId: deps.identityFactory.nextPricingRuleId(),
    status: "active",
    currency: "GHS",
    routeBaseFees: [...parsedInput.routeBaseFees].sort((left, right) =>
      getRoutePricingKey(left.originStationId, left.destinationStationId).localeCompare(
        getRoutePricingKey(right.originStationId, right.destinationStationId)
      )
    ),
    effectiveAt: parsedInput.effectiveAt ?? now,
    updatedAt: now,
    updatedByUserId: principal.userId,
    ...(parsedInput.note === undefined ? {} : { note: parsedInput.note })
  };

  await deps.pricingRules.saveActive(record);

  return adminPricingRulesResponseSchema.parse(record);
}
