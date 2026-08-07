#!/usr/bin/env node

const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('outright-value-tracker.html', 'utf8');
const calculators = fs.readFileSync('calculators.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const data = JSON.parse(fs.readFileSync('data/outrights.json', 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walkReadings(markets) {
  const readings = [];
  for (const market of markets) {
    for (const outcome of market.outcomes || []) {
      for (const reading of outcome.bookmakers || []) {
        readings.push({ market, outcome, reading });
      }
    }
  }
  return readings;
}

assert(Array.isArray(data.markets), 'data/outrights.json must expose markets array');
assert(Array.isArray(data.flagged_gaps), 'data/outrights.json must expose flagged_gaps array');

const isPublished = data.markets.length > 0;
const inToolsListing = calculators.includes('href="/outright-value-tracker.html"');
const inSitemap = sitemap.includes('https://betsorted.co.za/outright-value-tracker.html');
assert(inToolsListing === isPublished, 'tools listing must match markets>0 publication guard');
assert(inSitemap === isPublished, 'sitemap entry must match markets>0 publication guard');

for (const { reading, outcome, market } of walkReadings(data.markets)) {
  if (Number.isFinite(reading.odds)) {
    assert(reading.source_url, `${market.id}/${outcome.name}/${reading.slug} missing source_url`);
    assert(reading.read_at, `${market.id}/${outcome.name}/${reading.slug} missing read_at`);
    assert(reading.screenshot, `${market.id}/${outcome.name}/${reading.slug} missing screenshot`);
    assert(fs.existsSync(reading.screenshot), `${reading.screenshot} does not exist`);
  }
}

assert(!/href=["']https?:\/\/[^"']*(polymarket|kalshi)/i.test(html), 'page must not link out to Polymarket or Kalshi');
assert(/"@type": "WebApplication"/.test(html), 'WebApplication schema missing');
assert(/Normalisation approach/i.test(html), 'normalisation approach must be stated on page');
assert(/No outright readings have been recorded yet/i.test(html), 'zero-market empty state missing');
assert(/No SA price read/i.test(html), 'missing bookmaker price state missing');
assert(/stale,/.test(html), 'stale reading notice missing');
assert(/@media \(max-width: 640px\)/.test(html), 'mobile layout rule missing');

const scriptStart = html.indexOf('  <script>\n    const STALE_DAYS');
const scriptEnd = html.indexOf('  </script>', scriptStart);
assert(scriptStart !== -1 && scriptEnd !== -1, 'tracker script block missing');
const script = html.slice(scriptStart + '  <script>\n'.length, scriptEnd);

const nodes = {
  'tracker-root': { innerHTML: '' }
};
const context = {
  console,
  Date,
  document: {
    getElementById(id) {
      return nodes[id] ||= { innerHTML: '' };
    }
  },
  fetch: () => new Promise(() => {})
};
vm.createContext(context);
vm.runInContext(script, context);

const mathCases = [
  { probability: 0.25, odds: 5, fair: 4, edge: 25 },
  { probability: 0.4, odds: 2.5, fair: 2.5, edge: 0 },
  { probability: 0.5, odds: 1.8, fair: 2, edge: -10 }
];

for (const testCase of mathCases) {
  const fair = context.fairOdds(testCase.probability);
  const edge = context.edgePercent(testCase.odds, testCase.probability);
  assert(Math.abs(fair - testCase.fair) < 0.000001, `fair odds mismatch for ${testCase.probability}`);
  assert(Math.abs(edge - testCase.edge) < 0.000001, `edge mismatch for ${testCase.probability}/${testCase.odds}`);
}

context.renderTracker({ markets: [] });
assert(/No outright readings/.test(nodes['tracker-root'].innerHTML), 'zero-market render failed');

context.renderTracker({
  markets: [{
    id: 'test',
    competition: 'Test League',
    question: 'winner',
    source: 'polymarket',
    market_read_at: '2026-08-07T10:00:00Z',
    outcomes: [{
      name: 'Team A',
      market_probability: 0.25,
      bookmakers: [{
        slug: 'betway',
        name: 'Betway',
        odds: 5,
        read_at: '2026-08-07T10:10:00Z',
        source_url: 'https://example.com',
        screenshot: 'audit/odds-evidence/example.png',
        review_url: '/bookmakers/betway-review.html',
        affiliate_url: '/go/betway.html'
      }]
    }]
  }]
});
assert(/25\.0%/.test(nodes['tracker-root'].innerHTML), 'one-market positive edge render failed');

context.renderTracker({
  markets: [{
    id: 'missing',
    competition: 'Test League',
    question: 'winner',
    source: 'kalshi',
    market_read_at: '2026-08-07T10:00:00Z',
    outcomes: [{
      name: 'Team B',
      market_probability: 0.4,
      bookmakers: []
    }]
  }]
});
assert(/No SA price read/.test(nodes['tracker-root'].innerHTML), 'missing bookmaker price render failed');

context.renderTracker({
  markets: [{
    id: 'history',
    competition: 'Test League',
    question: 'winner',
    source: 'polymarket',
    market_read_at: '2026-08-07T10:00:00Z',
    outcomes: [{
      name: 'Team C',
      market_probability: 0.25,
      bookmakers: [{
        slug: 'betway',
        name: 'Betway',
        odds: 7,
        read_at: '2026-08-01T10:00:00Z',
        source_url: 'https://example.com/old',
        screenshot: 'audit/odds-evidence/old.png'
      }, {
        slug: 'betway',
        name: 'Betway',
        odds: 3,
        read_at: '2026-08-07T10:00:00Z',
        source_url: 'https://example.com/new',
        screenshot: 'audit/odds-evidence/new.png'
      }]
    }]
  }]
});
assert(/Betway 3\.00/.test(nodes['tracker-root'].innerHTML), 'historical readings must use latest bookmaker price');
assert(!/Betway 7\.00/.test(nodes['tracker-root'].innerHTML), 'old bookmaker price should not render as current best');

console.log(`PASS outright tracker verification markets=${data.markets.length} readings=${walkReadings(data.markets).length}`);
