import path from "node:path";
import { scrapeAlcopaList } from "../scraping/alcopaScraper";
import { saveVehiclesToFile } from "../utils/fileStorage";

async function main() {
  const saleUrl = process.argv[2];
  if (!saleUrl) {
    console.error("Usage: ts-node src/cli/scrapeAlcopaSale.ts <alcopa-sale-url>");
    process.exitCode = 1;
    return;
  }

  console.info(`Scraping Alcopa sale: ${saleUrl}`);
  const vehicles = await scrapeAlcopaList(saleUrl);
  console.info(`Retrieved ${vehicles.length} vehicles.`);

  const saleId = extractSaleId(saleUrl);
  const outputPath = path.resolve(
    __dirname,
    `../../data/alcopa-${saleId || "sale"}.json`
  );
  await saveVehiclesToFile(vehicles, outputPath);
  console.info(`Saved results to ${outputPath}`);
}

function extractSaleId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.pop() ?? null;
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error("Failed to scrape sale", error);
  process.exit(1);
});
