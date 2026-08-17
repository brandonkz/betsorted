import fs from "node:fs";
import path from "node:path";

const cutoff = "2026-06-01";
const siteRoot = process.cwd();

const oddsContextPattern =
  /(?:odds?|price|priced|pricing|value pick|best bet|tip|back(?:ing)?|recommend(?:ed|ation)?|@)\s*(?:[^.!?\n<>]{0,100})\b([1-9]\d?\.\d{2})\b/gi;
const oddsNumberPattern = /\b([1-9]\d?\.\d{2})\b/g;
const ratingLike = new Set(["4.00", "4.10", "4.20", "4.30", "4.40", "4.50", "4.60", "4.70", "4.80", "4.90"]);

const rows = [];

for (const file of htmlFiles(siteRoot)) {
  const relativePath = path.relative(siteRoot, file).replaceAll(path.sep, "/");
  const html = fs.readFileSync(file, "utf8");
  const publishDate = extractPublishDate(html);
  if (!publishDate || publishDate >= cutoff) continue;

  const text = htmlToText(html);
  const contexts = extractOddsContexts(text);
  if (!contexts.length) continue;

  const oddsValues = [...new Set(contexts.flatMap((context) => [...context.matchAll(oddsNumberPattern)].map((match) => match[1])))]
    .filter((value) => !ratingLike.has(value))
    .sort((a, b) => Number(a) - Number(b));

  if (!oddsValues.length) continue;

  rows.push({
    url: `/${relativePath}`,
    publish_date: publishDate,
    odds_values: oddsValues.join(" | "),
    event_occurred: eventStatus(relativePath, text),
    evidence: contexts.slice(0, 3).join(" || "),
  });
}

rows.sort((a, b) => a.url.localeCompare(b.url));

const pslTitle = rows.find((row) => row.url === "/blog/psl-title-race-betting-guide.html");
if (!pslTitle) {
  throw new Error("Required stale odds flag missing for /blog/psl-title-race-betting-guide.html");
}
if (!pslTitle.odds_values.includes("2.20") || pslTitle.event_occurred !== "yes") {
  throw new Error("PSL title race guide must be flagged with 2.20 and completed-season status");
}

const csv = [
  ["URL", "publish date", "odds values found", "event referenced has occurred", "evidence"].join(","),
  ...rows.map((row) => [row.url, row.publish_date, row.odds_values, row.event_occurred, row.evidence].map(csvCell).join(",")),
].join("\n") + "\n";

fs.mkdirSync("audit", { recursive: true });
fs.writeFileSync("audit/stale-odds.csv", csv);
console.log(`wrote audit/stale-odds.csv with ${rows.length} stale odds rows`);

function htmlFiles(root) {
  const ignored = new Set([".git", "node_modules", "templates"]);
  const results = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) stack.push(fullPath);
      } else if (entry.name.endsWith(".html")) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function extractPublishDate(html) {
  const jsonDate = html.match(/"datePublished":\s*"(\d{4}-\d{2}-\d{2})"/);
  if (jsonDate) return jsonDate[1];

  const datetime = html.match(/<time[^>]+datetime="(\d{4}-\d{2}-\d{2})"/i);
  if (datetime) return datetime[1];

  const published = html.match(/Published\s+([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (!published) return null;
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  return `${published[3]}-${months[published[1]]}-${String(Number(published[2])).padStart(2, "0")}`;
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOddsContexts(text) {
  const contexts = [];
  for (const match of text.matchAll(oddsContextPattern)) {
    const context = match[0].replace(/\s+/g, " ").trim();
    if (!context) continue;
    if (/rating|updated|version|license|telephone|whatsapp/i.test(context)) continue;
    contexts.push(context);
  }
  return [...new Set(contexts)];
}

function eventStatus(relativePath, text) {
  if (relativePath === "blog/psl-title-race-betting-guide.html") return "yes";
  if (/(weekend|final|recap|title-race|playoffs|relegation|offseason|february|march|april|may-2026|psl|soweto-derby|chiefs|pirates|sundowns|stellenbosch|nedbank-cup|sa-cup|six-nations|t20-world-cup-final)/i.test(relativePath)) return "yes";
  if (/(World Cup 2026|FIFA World Cup|Rugby Championship|MTN8|Nations Championship)/i.test(text)) return "not yet / future-season content";
  if (/(calculator|explained|how-to|guide|beginners|bankroll|free bets|bonuses|cashback|matched betting|deposit|odds|legal|tax|virtual sports|esports|lucky numbers)/i.test(relativePath)) return "n/a evergreen example";
  return "unknown";
}

function csvCell(value) {
  const string = String(value ?? "");
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}
