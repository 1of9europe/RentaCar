import { Vehicle } from "../domain/Vehicle";

export interface VehicleAIInsights {
  refinedRepairCost?: number;
  hiddenRisks?: string[];
  descriptionFlags?: string[];
  suggestedResaleAdjustment?: number;
}

interface VehicleAIContext {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileageKm: number;
  fuelType: string;
  gearbox: string;
  price: number;
  condition: Vehicle["condition"];
  observedDamages: string[];
  options: string[];
  comments: string[];
}

export async function enrichVehicleWithAI(vehicle: Vehicle): Promise<Vehicle> {
  const aiContext = buildVehicleAIContext(vehicle);

  // TODO: Inject OpenAI API client (official SDK).
  // Future flow:
  // 1. Read OPENAI_API_KEY from env and instantiate the client once (singleton).
  // 2. Craft a structured prompt with aiContext + the target insights we expect back.
  // 3. Call the API, parse the JSON response into VehicleAIInsights, validate, then
  //    merge into the Vehicle (estimatedRepairCost, comments, flags, etc.).
  // 4. Persist the insights for auditability (hash of prompt/response).
  void aiContext;
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    ...vehicle,
    estimatedRepairCost: vehicle.estimatedRepairCost ?? 500,
    comments: vehicle.comments.concat("AI placeholder: more insights pending"),
  };
}

function buildVehicleAIContext(vehicle: Vehicle): VehicleAIContext {
  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    mileageKm: vehicle.mileageKm,
    fuelType: vehicle.fuelType,
    gearbox: vehicle.gearbox,
    price: vehicle.price,
    condition: vehicle.condition,
    observedDamages: vehicle.observedDamages,
    options: vehicle.options,
    comments: vehicle.comments,
  };
}
