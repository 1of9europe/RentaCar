import { Vehicle } from "../domain/Vehicle";

export function computeResalePriceFromComparables(comparables: Vehicle[]): number {
  if (comparables.length === 0) {
    return 0;
  }
  const total = comparables.reduce((sum, vehicle) => sum + vehicle.price, 0);
  return Math.round(total / comparables.length);
}

export function rankComparablesBySimilarity(target: Vehicle, comparables: Vehicle[]): Vehicle[] {
  const scored = comparables.map((vehicle) => {
    const mileageDiff = Math.abs(vehicle.mileageKm - target.mileageKm);
    const yearDiff = Math.abs(vehicle.year - target.year);
    const fuelScore = vehicle.fuelType === target.fuelType ? 0 : 1;
    const gearboxScore = vehicle.gearbox === target.gearbox ? 0 : 1;

    const score = mileageDiff / 1000 + yearDiff * 2 + fuelScore * 5 + gearboxScore * 3;
    return { vehicle, score };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.vehicle);
}
