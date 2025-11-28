import { readFile } from "node:fs/promises";
import path from "node:path";
import { Vehicle } from "../domain/Vehicle";

const DATA_DIR = path.resolve(__dirname, "../../data");
const DEFAULT_SAMPLE_PATH = path.join(DATA_DIR, "leboncoin-samples.json");

export async function searchSimilarVehiclesOnLeboncoin(vehicle: Vehicle): Promise<Vehicle[]> {
  console.info(`Searching mock Leboncoin data for vehicle ${vehicle.id}`);
  const buffer = await readFile(DEFAULT_SAMPLE_PATH, "utf-8");
  const records = JSON.parse(buffer) as Vehicle[];

  // TODO: replace with real HTTP queries (API, custom crawler, lobstr.io, etc.).
  // TODO: apply filters (mileage delta, year delta, location radius, price range).

  return records;
}
