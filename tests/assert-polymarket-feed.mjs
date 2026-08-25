import fs from "node:fs";
import assert from "node:assert/strict";

const EXPECTED_TITLES = [
  "Premier League Winner",
  "Champions League Winner",
  "Europa League Winner",
  "La Liga Winner",
  "Serie A Winner",
  "Bundesliga Winner",
  "Ligue 1 Winner",
];

const feed = JSON.parse(fs.readFileSync("data/polymarket.json", "utf8"));

assert.equal(typeof feed.updatedAt, "string", "polymarket feed must include updatedAt");
assert.ok(!Number.isNaN(Date.parse(feed.updatedAt)), "polymarket updatedAt must be a valid ISO date");
assert.ok(Array.isArray(feed.events), "polymarket feed must expose events array");
assert.deepEqual(feed.events.map((event) => event.title), EXPECTED_TITLES, "polymarket feed titles must match the live European market set");

for (const event of feed.events) {
  assert.ok(Array.isArray(event.outcomes) && event.outcomes.length > 0, `${event.title} must include at least one outcome`);
  assert.ok(!/2025\/26|World Cup/i.test(event.title), `${event.title} looks like stale carry-over data`);
  for (const outcome of event.outcomes) {
    assert.equal(typeof outcome.name, "string", `${event.title} outcome missing name`);
    assert.equal(typeof outcome.pct, "number", `${event.title}/${outcome.name} missing pct`);
    assert.ok(outcome.pct > 0 && outcome.pct <= 100, `${event.title}/${outcome.name} has invalid pct ${outcome.pct}`);
  }
}

console.log(`polymarket feed assertion passed for ${feed.events.length} events updated ${feed.updatedAt}`);
