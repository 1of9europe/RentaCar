import { Vehicle } from "../domain/Vehicle";

export async function enrichVehicleWithAI(vehicle: Vehicle): Promise<Vehicle> {
  // TODO: Inject OpenAI API client (e.g., via official SDK) once API keys and prompts are defined.
  // Expected flow:
  // 1. Read OPENAI_API_KEY from env.
  // 2. Build a structured prompt with vehicle context + desired insights.
  // 3. Parse the response to update estimatedRepairCost, comments, etc.
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    ...vehicle,
    estimatedRepairCost: vehicle.estimatedRepairCost ?? 500,
    comments: vehicle.comments.concat("AI placeholder: more insights pending"),
  };
}
