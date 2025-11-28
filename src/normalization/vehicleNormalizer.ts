import { Vehicle } from "../domain/Vehicle";
import { AlcopaRawVehicle, AlcopaListPriceType } from "../domain/alcopa";
import { cleanText, parseMileage, parseNumber } from "../utils/parsers";

const PRICE_SOURCE_COMMENT: Record<AlcopaListPriceType, string> = {
  BID_CURRENT: "Price source: enchère courante",
  STARTING_PRICE: "Price source: mise à prix",
  UNKNOWN: "Price source: inconnu",
};

type NormalizationInput = AlcopaRawVehicle | Record<string, unknown>;

export function normalizeAlcopaVehicle(rawData: NormalizationInput): Vehicle {
  const now = new Date().toISOString();
  const typedRaw = rawData as AlcopaRawVehicle;
  const listPrice = typedRaw.listPrice;
  const listPriceType = typedRaw.listPriceType;
  const listPriceLabel = typedRaw.listPriceLabel;

  const priceCandidate = listPrice ?? typedRaw.price;

  const vehicle: Vehicle = {
    id: String(rawData.id ?? `ALC-${Date.now()}`),
    source: "ALCOPA",
    brand: String(rawData.brand ?? "Unknown").trim(),
    model: String(rawData.model ?? "Unknown").trim(),
    version: String(rawData.version ?? "").trim(),
    year: parseNumber(typedRaw.year ?? typedRaw.registrationYear) || new Date().getFullYear(),
    mileageKm: parseMileage(typedRaw.mileage ?? typedRaw.mileageKm),
    fuelType: String(typedRaw.fuel ?? typedRaw.fuelType ?? "Unknown").trim(),
    gearbox: String(typedRaw.gearbox ?? typedRaw.transmission ?? "Unknown").trim(),
    doors: parseNumber(typedRaw.doors) || 5,
    horsePower: parseNumber(typedRaw.horsePower ?? typedRaw.hp),
    co2: parseNumber(typedRaw.co2),
    options: Array.isArray(typedRaw.options)
      ? typedRaw.options.map((opt) => String(opt ?? "").trim())
      : [],
    condition: String(rawData.condition || "USED").toUpperCase() as Vehicle["condition"],
    observedDamages: Array.isArray(typedRaw.observedDamages)
      ? typedRaw.observedDamages.map((damage) => String(damage ?? "").trim())
      : [],
    comments: buildComments(rawData, listPriceType, listPriceLabel),
    price: parseNumber(priceCandidate),
    feesRate: typeof rawData.feesRate === "number" ? rawData.feesRate : 0.15,
    estimatedRepairCost:
      typedRaw.estimatedRepairCost === null || typedRaw.estimatedRepairCost === undefined
        ? null
        : parseNumber(typedRaw.estimatedRepairCost),
    estimatedResalePrice:
      typedRaw.estimatedResalePrice === null || typedRaw.estimatedResalePrice === undefined
        ? null
        : parseNumber(typedRaw.estimatedResalePrice),
    createdAt: String(rawData.createdAt ?? now),
    updatedAt: String(rawData.updatedAt ?? now),
  };

  // TODO: Map Alcopa version codes to a canonical naming strategy.
  // TODO: Decode and normalize option codes (e.g., PACK1 -> Pack City) once specs are available.

  return vehicle;
}

function buildComments(
  rawData: NormalizationInput,
  listPriceType?: AlcopaListPriceType,
  listPriceLabel?: string
): string[] {
  const comments = Array.isArray(rawData.comments)
    ? rawData.comments.map((comment: unknown) => cleanText(String(comment ?? "")))
    : [];

  if (listPriceType) {
    comments.push(PRICE_SOURCE_COMMENT[listPriceType]);
  } else if (listPriceLabel) {
    comments.push(`Price source: ${cleanText(listPriceLabel)}`);
  }

  if ("lotNumber" in rawData && rawData.lotNumber) {
    comments.push(`Lot: ${cleanText(String(rawData.lotNumber))}`);
  }

  return comments.filter(Boolean);
}
