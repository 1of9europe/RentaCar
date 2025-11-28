export type AlcopaListPriceType = "BID_CURRENT" | "STARTING_PRICE" | "UNKNOWN";

export interface AlcopaListCardData {
  detailUrl: string;
  sourceUrl: string;
  lotNumber?: string;
  rawTitle?: string;
  listPrice: number;
  listPriceLabel?: string;
  listPriceType: AlcopaListPriceType;
}

export interface AlcopaRawVehicle {
  id?: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number | string;
  registrationYear?: number | string;
  mileage?: string | number;
  mileageKm?: string | number;
  fuel?: string;
  fuelType?: string;
  gearbox?: string;
  transmission?: string;
  doors?: number | string;
  horsePower?: number | string;
  hp?: number | string;
  co2?: number | string;
  options?: string[];
  condition?: string;
  observedDamages?: string[];
  comments?: string[];
  price?: number | string;
  feesRate?: number;
  estimatedRepairCost?: number | string | null;
  estimatedResalePrice?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  listPrice?: number;
  listPriceType?: AlcopaListPriceType;
  listPriceLabel?: string;
  lotNumber?: string;
}
