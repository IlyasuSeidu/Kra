export const stationIds = ["ST-ACC-01", "ST-KMS-01", "ST-TML-01"] as const;
export const sizeTiers = ["standard", "bulky", "oversized"] as const;
export const serviceTypes = ["standard", "express"] as const;

export type StationId = (typeof stationIds)[number];
export type SizeTier = (typeof sizeTiers)[number];
export type ServiceType = (typeof serviceTypes)[number];

export const stationCatalog: Record<
  StationId,
  {
    name: string;
    city: string;
    code: string;
  }
> = {
  "ST-ACC-01": {
    name: "Accra Central",
    city: "Accra",
    code: "ACC"
  },
  "ST-KMS-01": {
    name: "Kumasi Adum",
    city: "Kumasi",
    code: "KMS"
  },
  "ST-TML-01": {
    name: "Tamale Central",
    city: "Tamale",
    code: "TML"
  }
};

export interface QuoteInput {
  originStationId: StationId;
  destinationStationId: StationId;
  weightKg: number;
  sizeTier: SizeTier;
  serviceType: ServiceType;
  doorstepRequested: boolean;
  isFragile: boolean;
  declaredValueGhs: number;
  doorstepDistanceKm?: number;
}

export interface PricingConfig {
  routeBaseFees: Record<string, number>;
}

const defaultBaseRouteFees: Record<string, number> = {
  "ST-ACC-01:ST-KMS-01": 35,
  "ST-KMS-01:ST-ACC-01": 35,
  "ST-ACC-01:ST-TML-01": 65,
  "ST-TML-01:ST-ACC-01": 65,
  "ST-KMS-01:ST-TML-01": 50,
  "ST-TML-01:ST-KMS-01": 50
};

export const defaultPricingConfig: PricingConfig = {
  routeBaseFees: defaultBaseRouteFees
};

export function getRoutePricingKey(
  originStationId: StationId,
  destinationStationId: StationId
): string {
  return `${originStationId}:${destinationStationId}`;
}

function getWeightSurcharge(weightKg: number): number {
  if (weightKg <= 2) return 0;
  if (weightKg <= 5) return 8;
  if (weightKg <= 10) return 18;
  if (weightKg <= 20) return 35;
  throw new Error("Manual quote required for weight above 20kg.");
}

function getSizeSurcharge(sizeTier: SizeTier): number {
  if (sizeTier === "standard") return 0;
  if (sizeTier === "bulky") return 15;
  throw new Error("Manual quote required for oversized packages.");
}

function getDoorstepSurcharge(distanceKm: number | undefined): number {
  const distance = distanceKm ?? 0;
  if (distance <= 5) return 15;
  if (distance <= 10) return 25;
  throw new Error("Doorstep not available beyond 10km in v1.");
}

export function getBaseRouteFee(
  originStationId: StationId,
  destinationStationId: StationId,
  pricingConfig: PricingConfig = defaultPricingConfig
): number {
  const fee = pricingConfig.routeBaseFees[getRoutePricingKey(originStationId, destinationStationId)];
  if (!fee) {
    throw new Error("Route is not enabled.");
  }
  return fee;
}

export interface QuoteBreakdown {
  baseFee: number;
  weightSurcharge: number;
  sizeSurcharge: number;
  fragileSurcharge: number;
  declaredValueSurcharge: number;
  expressSurcharge: number;
  doorstepSurcharge: number;
  totalAmount: number;
}

export function calculateDeliveryQuoteBreakdown(
  input: QuoteInput,
  pricingConfig: PricingConfig = defaultPricingConfig
): QuoteBreakdown {
  if (input.declaredValueGhs > 5000) {
    throw new Error("Declared value above GHS 5,000 is not self-serve in v1.");
  }

  const baseFee = getBaseRouteFee(
    input.originStationId,
    input.destinationStationId,
    pricingConfig
  );
  const weightSurcharge = getWeightSurcharge(input.weightKg);
  const sizeSurcharge = getSizeSurcharge(input.sizeTier);
  const fragileSurcharge = input.isFragile ? 10 : 0;
  const declaredValueSurcharge = input.declaredValueGhs > 2000 ? 20 : 0;
  const expressSurcharge =
    input.serviceType === "express" ? Math.max(Math.ceil(baseFee * 0.4), 15) : 0;
  const doorstepSurcharge =
    input.doorstepRequested ? getDoorstepSurcharge(input.doorstepDistanceKm) : 0;

  return {
    baseFee,
    weightSurcharge,
    sizeSurcharge,
    fragileSurcharge,
    declaredValueSurcharge,
    expressSurcharge,
    doorstepSurcharge,
    totalAmount:
      baseFee +
      weightSurcharge +
      sizeSurcharge +
      fragileSurcharge +
      declaredValueSurcharge +
      expressSurcharge +
      doorstepSurcharge
  };
}

export function calculateDeliveryQuote(
  input: QuoteInput,
  pricingConfig: PricingConfig = defaultPricingConfig
): number {
  return calculateDeliveryQuoteBreakdown(input, pricingConfig).totalAmount;
}
