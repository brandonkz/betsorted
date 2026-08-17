import fs from "node:fs";
import assert from "node:assert/strict";

const csv = fs.readFileSync("audit/stale-odds.csv", "utf8");

assert.ok(csv.startsWith("URL,publish date,odds values found,event referenced has occurred,evidence\n"));
assert.ok(csv.includes("/blog/psl-title-race-betting-guide.html"), "PSL title race guide must be flagged");
assert.ok(csv.includes("2.20"), "PSL title race guide must include the 2.20 value pick odds");
assert.ok(csv.includes("Value Pick: Orlando Pirates at 2.20"), "PSL title race evidence must include the live recommendation");

const rows = csv.trim().split("\n").slice(1);
assert.ok(rows.length > 0, "stale odds audit should contain at least one row");

console.log(`stale odds audit assertion passed for ${rows.length} rows`);
