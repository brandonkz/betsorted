import fs from "node:fs";

const MAX_REVIEW_AGE_DAYS = 90;
const PLACEHOLDER = new Set(["Coming soon", "TODO_VERIFY", "TODO_AFFILIATE_URL"]);

const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const register = JSON.parse(fs.readFileSync("data/ngb-register.json", "utf8"));
const today = new Date();

function daysSince(dateText) {
  const then = new Date(`${dateText}T00:00:00Z`);
  return Math.floor((today - then) / 86400000);
}

function isPlaceholder(value) {
  return value === null || value === undefined || PLACEHOLDER.has(value);
}

function compact(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const bookmakerEntries = register.entries.filter((entry) => entry.category === "BOOKMAKER");
const byLicence = new Map(bookmakerEntries.map((entry) => [entry.licence_number, entry]));

const failures = [];
const warnings = [];

if (register.entry_count < 1000) {
  failures.push(`NGB register looks truncated: expected thousands of entries, got ${register.entry_count}`);
}

if (register.bookmaker_entries < 1) {
  failures.push("NGB register parsed zero BOOKMAKER entries");
}

if (register.provinces.length < 9) {
  failures.push(`NGB register looks incomplete: expected 9 provinces, got ${register.provinces.length}`);
}

for (const operator of operators) {
  const licenceEntry = byLicence.get(operator.licence_number);
  if (!licenceEntry) {
    failures.push(`${operator.slug}: licence ${operator.licence_number} not found as a live BOOKMAKER entry in the NGB register`);
  } else {
    const sluggedOperator = compact(operator.name);
    const sluggedRegisterNames = [licenceEntry.operator, licenceEntry.trading_as].map(compact).filter(Boolean);
    if (!sluggedRegisterNames.some((value) => value.includes(sluggedOperator) || sluggedOperator.includes(value))) {
      warnings.push(`${operator.slug}: licence ${operator.licence_number} matched register operator "${licenceEntry.operator}" (${licenceEntry.province}) rather than "${operator.name}"`);
    }
  }

  const age = daysSince(operator.last_reviewed);
  if (!Number.isFinite(age)) {
    failures.push(`${operator.slug}: invalid last_reviewed date "${operator.last_reviewed}"`);
  } else if (age > MAX_REVIEW_AGE_DAYS) {
    failures.push(`${operator.slug}: last reviewed ${age} days ago (${operator.last_reviewed})`);
  }

  if (!isPlaceholder(operator.welcome_bonus) && isPlaceholder(operator.bonus_verified_at)) {
    failures.push(`${operator.slug}: welcome_bonus is published but bonus_verified_at is still ${String(operator.bonus_verified_at)}`);
  }

  if (isPlaceholder(operator.affiliate_url)) {
    warnings.push(`${operator.slug}: affiliate_url is still ${String(operator.affiliate_url)}`);
  }
}

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length})`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  throw new Error(`Operator licence assertion failed:\n- ${failures.join("\n- ")}`);
}

console.log(`operator licence assertion passed for ${operators.length} operators`);
