export type VehicleSource = "ALCOPA" | "LEBONCOIN" | "UNKNOWN";

export type VehicleCondition = "NEW" | "USED" | "DAMAGED" | "UNKNOWN";

export interface Vehicle {
  id: string;
  source: VehicleSource;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileageKm: number;
  fuelType: string;
  gearbox: string;
  doors: number;
  horsePower: number;
  co2: number;
  options: string[];
  condition: VehicleCondition;
  observedDamages: string[];
  comments: string[];
  price: number;
  feesRate: number;
  estimatedRepairCost: number | null;
  estimatedResalePrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealEvaluationResult {
  isInteresting: boolean;
  maxInvestmentPrice: number;
  targetMargin: number;
  totalEstimatedCost: number;
  reasoning: string;
}
