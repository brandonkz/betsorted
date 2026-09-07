import fs from "node:fs";

const SOURCE_URL = "https://www.ngb.org.za/verified-operators/";
const OUTPUT_FILE = "data/ngb-register.json";

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#0*38;|&amp;/gi, "&")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#0*34;|&quot;/gi, '"')
    .replace(/&#0*8211;|&#8211;|&ndash;/gi, "-")
    .replace(/&#0*8212;|&#8212;|&mdash;/gi, "-")
    .replace(/&#0*160;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ");
}

function clean(value) {
  return decodeHtml(stripTags(value))
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .trim();
}

function normaliseCategory(value) {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

function normaliseProvince(value) {
  return value.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

function rowToEntry(cells, index) {
  const [operatorRaw = "", categoryRaw = "", addressRaw = "", tradingAsRaw = "", licenceRaw = "", provinceRaw = ""] = cells;
  return {
    id: index + 1,
    operator: clean(operatorRaw),
    category: normaliseCategory(clean(categoryRaw)),
    address: clean(addressRaw),
    trading_as: clean(tradingAsRaw),
    licence_number: clean(licenceRaw),
    province: normaliseProvince(clean(provinceRaw)),
  };
}

const response = await fetch(SOURCE_URL, {
  headers: {
    "user-agent": "Mozilla/5.0 (compatible; BetSortedBot/1.0; +https://betsorted.co.za/)",
    accept: "text/html,application/xhtml+xml",
  },
});

if (!response.ok) {
  throw new Error(`Failed to fetch NGB register: ${response.status} ${response.statusText}`);
}

const html = await response.text();
const tableMatch = html.match(/<table\b[\s\S]*?<\/table>/i);

if (!tableMatch) {
  throw new Error("Could not locate a table on the NGB verified operators page");
}

const entries = [];
const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
let rowMatch;

while ((rowMatch = rowRegex.exec(tableMatch[0]))) {
  const rowHtml = rowMatch[1];
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
  if (cells.length < 6) continue;
  entries.push(rowToEntry(cells, entries.length));
}

if (!entries.length) {
  throw new Error("Parsed zero register entries from the NGB table");
}

const provinces = [...new Set(entries.map((entry) => entry.province).filter(Boolean))].sort();
const categories = [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort();
const bookmakerEntries = entries.filter((entry) => entry.category === "BOOKMAKER");

const payload = {
  source_url: SOURCE_URL,
  fetched_at: new Date().toISOString(),
  entry_count: entries.length,
  bookmaker_entries: bookmakerEntries.length,
  provinces,
  categories,
  entries,
};

fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Saved ${entries.length} NGB register entries (${bookmakerEntries.length} bookmaker entries) to ${OUTPUT_FILE}`);
