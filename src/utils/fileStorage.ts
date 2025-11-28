import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { Vehicle } from "../domain/Vehicle";

function ensureJsonPath(filePath: string): string {
  if (!filePath.endsWith(".json")) {
    return `${filePath}.json`;
  }
  return filePath;
}

export async function saveVehicleToFile(vehicle: Vehicle, filePath: string): Promise<void> {
  const normalizedPath = ensureJsonPath(filePath);
  await writeFile(normalizedPath, JSON.stringify(vehicle, null, 2), "utf-8");
}

export async function saveVehiclesToFile(vehicles: Vehicle[], filePath: string): Promise<void> {
  const normalizedPath = ensureJsonPath(filePath);
  await writeFile(normalizedPath, JSON.stringify(vehicles, null, 2), "utf-8");
}

export async function loadVehiclesFromFile(filePath: string): Promise<Vehicle[]> {
  const normalizedPath = ensureJsonPath(filePath);
  const absolutePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(process.cwd(), normalizedPath);
  const buffer = await readFile(absolutePath, "utf-8");
  return JSON.parse(buffer) as Vehicle[];
}
