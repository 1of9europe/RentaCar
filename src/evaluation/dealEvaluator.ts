import { DealEvaluationResult, Vehicle } from "../domain/Vehicle";
import { computeResalePriceFromComparables } from "../comparison/priceComparator";

interface EvaluateDealParams {
  targetVehicle: Vehicle;
  comparables: Vehicle[];
  baseFeesRate?: number;
  estimatedRepairCost?: number;
  targetMarginRate?: number;
}

export function evaluateDeal({
  targetVehicle,
  comparables,
  baseFeesRate = 0.15,
  estimatedRepairCost,
  targetMarginRate = 0.1,
}: EvaluateDealParams): DealEvaluationResult {
  const resalePriceFromComparables = computeResalePriceFromComparables(comparables);
  const estimatedResalePrice =
    resalePriceFromComparables || targetVehicle.estimatedResalePrice || targetVehicle.price * 1.1;

  const feesRate = targetVehicle.feesRate ?? baseFeesRate;
  const repairCost = estimatedRepairCost ?? targetVehicle.estimatedRepairCost ?? 0;

  // totalEstimatedCost represents the real investment based on the actual purchase price.
  const totalEstimatedCost = targetVehicle.price * (1 + feesRate) + repairCost;
  // targetMargin expresses the desired profit margin we want to keep when reselling.
  const targetMargin = estimatedResalePrice * targetMarginRate;
  // maxInvestmentPrice is the maximum bid/purchase price that still secures the target margin
  // once fees and repairs have been accounted for.
  const maxInvestmentPrice = Math.max(
    0,
    (estimatedResalePrice - targetMargin - repairCost) / (1 + feesRate)
  );

  const isInteresting = targetVehicle.price <= maxInvestmentPrice;

  const reasoning = `Resale ~€${estimatedResalePrice.toFixed(0)}, ` +
    `fees ${(feesRate * 100).toFixed(1)}%, repairs €${repairCost.toFixed(0)}, ` +
    `target margin ${(targetMarginRate * 100).toFixed(0)}%.`;

  return {
    isInteresting,
    maxInvestmentPrice: Math.round(maxInvestmentPrice),
    targetMargin: Math.round(targetMargin),
    totalEstimatedCost: Math.round(totalEstimatedCost),
    reasoning,
  };
}
