import assert from "node:assert/strict";
import { normalizeAlcopaVehicle } from "../src/normalization/vehicleNormalizer";
import { parseNumber } from "../src/utils/parsers";

function testParseNumber() {
  assert.equal(parseNumber("2 400 €"), 2400);
  assert.equal(parseNumber("5 100"), 5100);
  assert.equal(parseNumber("5.10"), 5.1);
  assert.equal(parseNumber(0), 0);
}

function testNormalizePriceSource() {
  const vehicle = normalizeAlcopaVehicle({
    id: "ALC-TEST",
    brand: "Peugeot",
    model: "208",
    version: "1.2 PureTech",
    year: "2019",
    mileage: "48 000 km",
    listPrice: "9 500 €",
    listPriceType: "BID_CURRENT",
  });

  assert.equal(vehicle.price, 9500);
  assert(vehicle.comments.some((comment) => comment.includes("enchère")));
}

function run() {
  testParseNumber();
  testNormalizePriceSource();
  console.log("All normalization tests passed");
}

run();
