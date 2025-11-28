import { Vehicle } from "../domain/Vehicle";

function parseNumber(value: string | number | undefined | null): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseMileage(rawMileage: string | number | undefined | null): number {
  const numericValue = parseNumber(rawMileage);
  return numericValue;
}

export function normalizeAlcopaVehicle(rawData: any): Vehicle {
  const now = new Date().toISOString();
  const vehicle: Vehicle = {
    id: String(rawData.id ?? `ALC-${Date.now()}`),
    source: "ALCOPA",
    brand: String(rawData.brand ?? "Unknown").trim(),
    model: String(rawData.model ?? "Unknown").trim(),
    version: String(rawData.version ?? "").trim(),
    year: parseNumber(rawData.year || rawData.registrationYear) || new Date().getFullYear(),
    mileageKm: parseMileage(rawData.mileage || rawData.mileageKm),
    fuelType: String(rawData.fuel || rawData.fuelType || "Unknown").trim(),
    gearbox: String(rawData.gearbox || rawData.transmission || "Unknown").trim(),
    doors: parseNumber(rawData.doors) || 5,
    horsePower: parseNumber(rawData.horsePower || rawData.hp),
    co2: parseNumber(rawData.co2),
    options: Array.isArray(rawData.options)
      ? rawData.options.map((opt: any) => String(opt).trim())
      : [],
    condition: String(rawData.condition || "USED").toUpperCase() as Vehicle["condition"],
    observedDamages: Array.isArray(rawData.observedDamages)
      ? rawData.observedDamages.map((damage: any) => String(damage).trim())
      : [],
    comments: Array.isArray(rawData.comments)
      ? rawData.comments.map((comment: any) => String(comment).trim())
      : [],
    price: parseNumber(rawData.price),
    feesRate: typeof rawData.feesRate === "number" ? rawData.feesRate : 0.15,
    estimatedRepairCost:
      rawData.estimatedRepairCost === null || rawData.estimatedRepairCost === undefined
        ? null
        : parseNumber(rawData.estimatedRepairCost),
    estimatedResalePrice:
      rawData.estimatedResalePrice === null || rawData.estimatedResalePrice === undefined
        ? null
        : parseNumber(rawData.estimatedResalePrice),
    createdAt: String(rawData.createdAt ?? now),
    updatedAt: String(rawData.updatedAt ?? now),
  };

  // TODO: Map Alcopa version codes to a canonical naming strategy.
  // TODO: Decode and normalize option codes (e.g., PACK1 -> Pack City) once specs are available.

  return vehicle;
}
