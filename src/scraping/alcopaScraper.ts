import { Browser, BrowserContext, Locator, Page, chromium } from "playwright";
import { Vehicle } from "../domain/Vehicle";
import { normalizeAlcopaVehicle } from "../normalization/vehicleNormalizer";
import { AlcopaListCardData, AlcopaListPriceType, AlcopaRawVehicle } from "../domain/alcopa";
import { cleanText, extractYear, parseEuroAmount, parseNumber } from "../utils/parsers";

const DEFAULT_TIMEOUT = 35_000;
const SEARCH_RESULTS_SELECTOR = "turbo-frame#search-results";
const VEHICLE_CARD_SELECTOR = ".card";
const DETAIL_CONCURRENCY = 3;
const MAX_PAGES = Number(process.env.ALCOPA_MAX_PAGES ?? 3);

interface SpecEntry {
  key: string;
  value: string;
}

export async function scrapeAlcopaVehicle(url: string): Promise<Vehicle> {
  return scrapeAlcopaVehicleInternal(url);
}

async function scrapeAlcopaVehicleInternal(
  url: string,
  options: { listData?: AlcopaListCardData; context?: BrowserContext } = {}
): Promise<Vehicle> {
  const { listData, context } = options;
  const ownBrowser: Browser | null = context ? null : await chromium.launch({ headless: true });
  const browserContext = context ?? (await ownBrowser!.newContext());
  const page = await browserContext.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: DEFAULT_TIMEOUT });
    await page.waitForLoadState("domcontentloaded", { timeout: DEFAULT_TIMEOUT });
    const rawVehicle = await extractVehicleDetails(page);
    const mergedRaw: AlcopaRawVehicle = {
      ...rawVehicle,
      ...(listData?.listPrice !== undefined ? { listPrice: listData.listPrice } : {}),
      ...(listData?.listPriceType ? { listPriceType: listData.listPriceType } : {}),
      ...(listData?.listPriceLabel ? { listPriceLabel: listData.listPriceLabel } : {}),
      ...(listData?.lotNumber ? { lotNumber: listData.lotNumber } : {}),
    };

    return normalizeAlcopaVehicle(mergedRaw);
  } catch (error) {
    console.error(`Failed to scrape vehicle detail ${url}`, error);
    throw error;
  } finally {
    await page.close();
    if (!context) {
      await browserContext.close();
      await ownBrowser?.close();
    }
  }
}

export async function scrapeAlcopaList(listUrl: string): Promise<Vehicle[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const listCards = await collectListCards(page, listUrl);
    if (listCards.length === 0) {
      console.warn(`No vehicles detected at ${listUrl}`);
      return [];
    }

    console.info(`Found ${listCards.length} cards across the sale; fetching details with concurrency ${DETAIL_CONCURRENCY}...`);
    const vehicles = await fetchVehiclesFromCards(context, listCards);
    return vehicles;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function collectListCards(page: Page, listUrl: string): Promise<AlcopaListCardData[]> {
  const cards: AlcopaListCardData[] = [];
  let currentUrl: string | null = listUrl;
  let pageIndex = 1;

  while (currentUrl && pageIndex <= MAX_PAGES) {
    console.info(`Loading Alcopa sale page ${pageIndex}: ${currentUrl}`);
    await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: DEFAULT_TIMEOUT });
    await waitForSearchResults(page);

    const frameLocator = page.frameLocator(SEARCH_RESULTS_SELECTOR);
    const cardLocator = frameLocator.locator(VEHICLE_CARD_SELECTOR);
    const count = await cardLocator.count();

    for (let i = 0; i < count; i += 1) {
      const card = cardLocator.nth(i);
      const cardData = await extractCardData(card, currentUrl);
      if (cardData) {
        cards.push(cardData);
      }
    }

    const next = await findNextPageUrl(page, currentUrl);
    if (!next || next === currentUrl) {
      break;
    }
    currentUrl = next;
    pageIndex += 1;
  }

  return cards;
}

async function waitForSearchResults(page: Page): Promise<void> {
  await page.waitForSelector(`${SEARCH_RESULTS_SELECTOR} ${VEHICLE_CARD_SELECTOR}`, {
    timeout: DEFAULT_TIMEOUT,
  });
}

async function extractCardData(card: Locator, baseUrl: string): Promise<AlcopaListCardData | null> {
  const link = card.locator(".card-title a").first();
  const href = await link.getAttribute("href");
  if (!href) {
    return null;
  }

  const detailUrl = resolveUrl(baseUrl, href);
  const rawTitle = cleanText(await safeInnerText(link));
  const lotNumber = cleanText(
    await safeInnerText(card.locator(".card-title small, .card-title .text-muted").first())
  ) || undefined;
  const footerText = await safeInnerText(card.locator(".card-footer"));
  const priceInfo = parsePriceInfo(footerText);

  if (!priceInfo) {
    console.warn(`Price not found for card ${detailUrl}`);
    return null;
  }

  const cardData: AlcopaListCardData = {
    detailUrl,
    sourceUrl: baseUrl,
    listPrice: priceInfo.listPrice,
    listPriceType: priceInfo.listPriceType,
    listPriceLabel: priceInfo.label,
  };

  if (lotNumber) {
    cardData.lotNumber = lotNumber;
  }
  if (rawTitle) {
    cardData.rawTitle = rawTitle;
  }

  return cardData;
}

function parsePriceInfo(footerText: string | null): {
  listPrice: number;
  listPriceType: AlcopaListPriceType;
  label: string;
} | null {
  if (!footerText) {
    return null;
  }

  const match = footerText.match(/(Enchère courante|Mise à prix)[^0-9]*([0-9\s.,]+)/i);
  if (!match) {
    return null;
  }

  const label = cleanText(match[1]);
  const value = parseEuroAmount(match[2]);
  const type: AlcopaListPriceType = label.toLowerCase().includes("enchère")
    ? "BID_CURRENT"
    : "STARTING_PRICE";

  return {
    listPrice: value,
    listPriceType: type,
    label,
  };
}

async function findNextPageUrl(page: Page, currentUrl: string): Promise<string | null> {
  const nextSelectors = ['a[rel="next"]', 'nav.pagination a[aria-label="Suivant"]', "nav.pagination a.next"];
  for (const selector of nextSelectors) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      const href = await locator.getAttribute("href");
      if (href) {
        return resolveUrl(currentUrl, href);
      }
    }
  }
  return null;
}

async function fetchVehiclesFromCards(
  context: BrowserContext,
  cards: AlcopaListCardData[]
): Promise<Vehicle[]> {
  const vehicles: Vehicle[] = [];
  const queue = [...cards];
  const workers = Math.min(DETAIL_CONCURRENCY, queue.length || 1);

  await Promise.all(
    Array.from({ length: workers }).map(async () => {
      while (queue.length > 0) {
        const card = queue.shift();
        if (!card) {
          break;
        }
        try {
          const vehicle = await scrapeAlcopaVehicleInternal(card.detailUrl, {
            listData: card,
            context,
          });
          vehicles.push(vehicle);
        } catch (error) {
          console.error(`Failed to process ${card.detailUrl}`, error);
        }
      }
    })
  );

  return vehicles;
}

async function extractVehicleDetails(page: Page): Promise<AlcopaRawVehicle> {
  const headerText = cleanText(await safeInnerText(page.locator("h1, .vehicle-title")));
  const titleParts = headerText.split(" ").filter(Boolean);
  const brand = titleParts[0] ?? "Unknown";
  const model = titleParts.slice(1, 3).join(" ").trim();
  const version = titleParts.slice(3).join(" ").trim();
  const url = page.url();
  const id = url.split("/").filter(Boolean).pop() ?? `ALC-${Date.now()}`;

  const specEntries: SpecEntry[] = await page.locator("dl dt").evaluateAll((nodes) =>
    nodes.map((dt) => {
      const key = dt.textContent?.trim() ?? "";
      const value = dt.nextElementSibling?.textContent?.trim() ?? "";
      return { key, value };
    })
  );

  const getSpec = (keys: string[]): string | undefined => {
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const entry = specEntries.find(({ key }) => {
      const normalized = key.toLowerCase();
      return lowerKeys.some((candidate) => normalized.includes(candidate));
    });
    const value = entry?.value?.trim();
    return value ? value : undefined;
  };

  const year = extractYear(getSpec(["mise", "année", "circulation"])) ?? undefined;
  const mileageText = getSpec(["kilom", "km"]);
  const fuel = getSpec(["carburant", "energie"]);
  const gearbox = getSpec(["boîte", "transmission"]);
  const power = getSpec(["puissance"]);
  const co2 = getSpec(["co2"]);
  const doors = getSpec(["portes"]);

  const options = await collectListText(
    page.locator(".options li, .equipements li, .equipment-list li")
  );
  const damages = await collectListText(page.locator(".damages li, .damage-list li"));
  const comments = await collectListText(
    page.locator(".observations li, .notes li, .card-body p")
  );

  const vehicle: AlcopaRawVehicle = {
    id,
    brand,
    model,
    version,
    options,
    observedDamages: damages,
    comments,
    condition: "USED",
  };

  const horsePower = parseHorsePower(power);
  if (year !== undefined) {
    vehicle.year = year;
  }
  if (mileageText) {
    vehicle.mileage = mileageText;
  }
  if (fuel) {
    vehicle.fuel = fuel;
  }
  if (gearbox) {
    vehicle.gearbox = gearbox;
  }
  if (horsePower !== undefined) {
    vehicle.horsePower = horsePower;
  }
  if (co2) {
    vehicle.co2 = co2;
  }
  if (doors) {
    vehicle.doors = doors;
  }

  return vehicle;
}

function parseHorsePower(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = value.match(/([0-9]+)\s?(?:cv|ch|kw)/i);
  if (match) {
    return Number(match[1]);
  }
  return parseNumber(value);
}

async function safeInnerText(locator: Locator): Promise<string | null> {
  try {
    const text = await locator.innerText();
    return text?.trim() ?? null;
  } catch {
    return null;
  }
}

async function collectListText(locator: Locator): Promise<string[]> {
  try {
    const texts = await locator.allInnerTexts();
    return texts.map(cleanText).filter(Boolean);
  } catch {
    return [];
  }
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

if (require.main === module) {
  const sampleUrl =
    process.argv[2] ??
    "https://www.alcopa-auction.fr/salle-de-vente-encheres/tours/9475?category_view=VP";
  scrapeAlcopaList(sampleUrl)
    .then((vehicles) => {
      console.log(`Scraped ${vehicles.length} vehicles from ${sampleUrl}`);
    })
    .catch((error) => {
      console.error("Failed to scrape sale:", error);
      process.exitCode = 1;
    });
}
