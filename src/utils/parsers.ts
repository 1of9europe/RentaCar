export function cleanText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function parseNumber(value: string | number | undefined | null, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function parseMileage(value: string | number | undefined | null): number {
  const numericValue = parseNumber(value, 0);
  return numericValue;
}

export function extractYear(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const match = value.match(/(20\d{2}|19\d{2})/);
  return match ? Number(match[1]) : null;
}

export function parseEuroAmount(text: string | null | undefined): number {
  if (!text) {
    return 0;
  }
  return parseNumber(text.replace(/[€]/g, ""), 0);
}
