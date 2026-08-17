import fs from "node:fs";
import assert from "node:assert/strict";

const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const bySlug = new Map(operators.map((operator) => [operator.slug, operator]));

const homeSlugs = [
  "betway",
  "hollywoodbets",
  "sportingbet",
  "10bet",
  "play-co-za",
  "world-sports-betting",
  "gbets",
  "sunbet",
];

const hubSlugs = [
  "betway",
  "hollywoodbets",
  "sportingbet",
  "supabets",
  "10bet",
  "play-co-za",
  "world-sports-betting",
  "easybet",
  "gbets",
  "sunbet",
  "bet-co-za",
  "betfred",
  "betolimp",
  "betshezi",
  "lottostar",
  "playabets",
  "yesplay",
];

function operator(slug) {
  const op = bySlug.get(slug);
  assert.ok(op, `Missing operator data for ${slug}`);
  return op;
}

function assertIncludes(file, expected) {
  const html = fs.readFileSync(file, "utf8");
  assert.ok(html.includes(expected), `${file} should include ${expected}`);
}

function pending(value) {
  return value === "TODO_VERIFY" || value === "TODO_AFFILIATE_URL" || value === "Coming soon" || value === null;
}

for (const op of operators) {
  for (const field of ["slug", "name", "rating", "established", "welcome_bonus", "min_deposit_zar", "payout_speed", "payment_methods", "licence_authority", "licence_number", "affiliate_url", "bonus_verified_at", "review_url", "last_reviewed"]) {
    assert.ok(Object.hasOwn(op, field), `${op.slug} missing ${field}`);
  }
}

for (const slug of homeSlugs) {
  const op = operator(slug);
  assertIncludes("index.html", `data-operator="${op.slug}"`);
  assertIncludes("index.html", op.review_url);
  assertIncludes("index.html", `${op.go_url}?subid=home-table`);
  if (typeof op.rating === "number") assertIncludes("index.html", op.rating.toFixed(1).replace(/\.0$/, ""));
  if (!pending(op.welcome_bonus)) assertIncludes("index.html", op.welcome_bonus);
  if (!pending(op.min_deposit_display)) assertIncludes("index.html", op.min_deposit_display);
}

for (const slug of hubSlugs) {
  const op = operator(slug);
  assertIncludes("bookmakers/index.html", `data-operator="${op.slug}"`);
  assertIncludes("bookmakers/index.html", op.review_url);
  assertIncludes("bookmakers/index.html", `${op.go_url}?subid=post-bookmakers-hub`);
  if (!pending(op.welcome_bonus)) assertIncludes("bookmakers/index.html", op.welcome_bonus);
  if (!pending(op.min_deposit_display)) assertIncludes("bookmakers/index.html", op.min_deposit_display);
  assertIncludes("bookmakers/index.html", op.licence_authority.replace(/&/g, "&amp;"));
}

for (const op of operators.filter((operator) => operator.review_url.startsWith("/bookmakers/"))) {
  const file = op.review_url.slice(1);
  assert.ok(fs.existsSync(file), `${file} must exist`);
  if (typeof op.rating === "number") assertIncludes(file, `"ratingValue": "${op.rating.toFixed(1)}"`);
  assertIncludes(file, `"dateModified": "${op.last_reviewed}"`);
}

const report = fs.readFileSync("audit/operator-data-todos.md", "utf8");
assertIncludes("audit/operator-data-todos.md", "operator,field,value");
for (const op of operators.filter((operator) => operator.affiliate_url === "Coming soon")) {
  assert.ok(report.includes(`${op.slug},affiliate_url,Coming soon`), `TODO report missing ${op.slug} affiliate_url`);
}

console.log(`operator data assertion passed for ${operators.length} operators`);
