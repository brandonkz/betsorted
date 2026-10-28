#!/usr/bin/env node
// Refresh data/kalshi.json from Kalshi's public (keyless) trade API.
// Keeps the curated series metadata already in the file and refreshes outcomes.

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';
// Default mirrors the old Mac mini job (timestamp refresh only, outcomes left as-is).
// Pass --publish-outcomes (or KALSHI_PUBLISH_OUTCOMES=true) to write live outcomes to the page feed.
const PUBLISH = process.argv.includes('--publish-outcomes') || process.env.KALSHI_PUBLISH_OUTCOMES === 'true';
const outputPath = path.join(__dirname, 'data', 'kalshi.json');

async function fetchSeriesMarkets(ticker) {
  const url = `${API_BASE}/markets?series_ticker=${encodeURIComponent(ticker)}&status=open&limit=200`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kalshi ${ticker} request failed: HTTP ${response.status}`);
  const data = await response.json();
  return Array.isArray(data.markets) ? data.markets : [];
}

function toOutcome(market) {
  const prob = Number(market.last_price_dollars ?? (market.last_price != null ? market.last_price / 100 : NaN));
  if (!Number.isFinite(prob) || prob <= 0) return null;
  return {
    name: market.yes_sub_title || market.title || market.ticker,
    prob,
    pct: Number((prob * 100).toFixed(1)),
    fairDec: Number((1 / prob).toFixed(2)),
    vol: Number(market.volume_fp ?? market.volume ?? 0),
  };
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const series = Array.isArray(existing.series) ? existing.series : [];
  if (!series.length) throw new Error('data/kalshi.json has no series to refresh');

  let failures = 0;
  for (const entry of series) {
    try {
      const markets = await fetchSeriesMarkets(entry.ticker);
      const outcomes = markets.map(toOutcome).filter(Boolean)
        .sort((a, b) => b.prob - a.prob).slice(0, 10);
      if (PUBLISH) entry.outcomes = outcomes;
      console.log(`  ✓ ${entry.ticker}: ${outcomes.length} live outcomes${PUBLISH ? ' (published)' : ' (not published)'}`);
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${entry.ticker}: ${error.message} (keeping previous outcomes)`);
    }
  }
  if (failures === series.length) throw new Error('All Kalshi requests failed');

  const output = { ...existing, updatedAt: new Date().toISOString(), series };
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Saved ${series.length} Kalshi series to ${outputPath}`);
}

if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exit(1); });
}
module.exports = { main };
