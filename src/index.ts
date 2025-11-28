import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeAlcopaVehicle } from "./normalization/vehicleNormalizer";
import { enrichVehicleWithAI } from "./enrichment/gptEnricher";
import { searchSimilarVehiclesOnLeboncoin } from "./comparison/leboncoinClient";
import { rankComparablesBySimilarity } from "./comparison/priceComparator";
import { evaluateDeal } from "./evaluation/dealEvaluator";

async function loadSampleAlcopaVehicle() {
  const samplePath = path.resolve(__dirname, "../data/alcopa-sample.json");
  const buffer = await readFile(samplePath, "utf-8");
  return JSON.parse(buffer);
}

async function main() {
  console.info("Loading Alcopa sample...");
  const rawVehicle = await loadSampleAlcopaVehicle();
  const normalized = normalizeAlcopaVehicle(rawVehicle);
  const enriched = await enrichVehicleWithAI(normalized);

  console.info("Fetching comparables from Leboncoin mock...");
  const comparables = await searchSimilarVehiclesOnLeboncoin(enriched);
  const rankedComparables = rankComparablesBySimilarity(enriched, comparables).slice(0, 5);

  const evaluation = evaluateDeal({
    targetVehicle: enriched,
    comparables: rankedComparables,
    baseFeesRate: 0.15,
    targetMarginRate: 0.12,
  });

  console.log("=== Deal Evaluation ===");
  console.log({
    purchasePrice: enriched.price,
    maxInvestmentPrice: evaluation.maxInvestmentPrice,
    isInteresting: evaluation.isInteresting,
    reasoning: evaluation.reasoning,
    totalEstimatedCost: evaluation.totalEstimatedCost,
    targetMargin: evaluation.targetMargin,
  });
}

main().catch((error) => {
  console.error("Demo failed", error);
  process.exit(1);
});
