import { chromium, Page } from "playwright";
import { Vehicle } from "../domain/Vehicle";

const DEFAULT_TIMEOUT = 30_000;

async function setupPage(url: string): Promise<Page> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: DEFAULT_TIMEOUT });
  return page;
}

export async function scrapeAlcopaVehicle(url: string): Promise<Vehicle> {
  const page = await setupPage(url);
  try {
    // TODO: replace placeholders with real selectors.
    const rawBrand = await page.textContent("#brand-selector").catch(() => "Peugeot");
    const rawModel = await page.textContent("#model-selector").catch(() => "208");

    const vehicle: Vehicle = {
      id: `ALC-${Date.now()}`,
      source: "ALCOPA",
      brand: rawBrand?.trim() || "Unknown",
      model: rawModel?.trim() || "Unknown",
      version: "Placeholder version",
      year: 2019,
      mileageKm: 45_000,
      fuelType: "Petrol",
      gearbox: "Manual",
      doors: 5,
      horsePower: 110,
      co2: 120,
      options: [],
      condition: "USED",
      observedDamages: [],
      comments: ["TODO: inject real comments"],
      price: 9_500,
      feesRate: 0.15,
      estimatedRepairCost: null,
      estimatedResalePrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return vehicle;
  } finally {
    await page.context().browser()?.close();
  }
}

export async function scrapeAlcopaList(listUrl: string): Promise<Vehicle[]> {
  // TODO: implement a loop over auction rows, extract URLs, and call scrapeAlcopaVehicle.
  console.info(`Scraping Alcopa list from ${listUrl} (mock).`);
  const sampleVehicle = await scrapeAlcopaVehicle(listUrl);
  return [sampleVehicle];
}

if (require.main === module) {
  scrapeAlcopaVehicle("https://example.com/alcopa/vehicle")
    .then((vehicle) => {
      console.log("Mocked vehicle scraped:", vehicle);
    })
    .catch((error) => {
      console.error("Failed to scrape vehicle:", error);
      process.exitCode = 1;
    });
}
