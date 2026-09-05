#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAX_AGE_DAYS = 90;
const today = new Date(`${process.env.OPERATOR_FACTS_TODAY || new Date().toISOString().slice(0, 10)}T00:00:00Z`);
const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const bySlug = new Map(operators.map((operator) => [operator.slug, operator]));
const referencedSlugs = new Set();
const failures = [];
const sourceCache = new Map();

function isRedirectStub(html) {
  return /window\.location\.replace\s*\(/.test(html) || /<meta\s+http-equiv=["']refresh["']/i.test(html);
}

function scanHtmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanHtmlFiles(fullPath);
      continue;
    }
    if (path.extname(entry.name) !== ".html") continue;

    const html = fs.readFileSync(fullPath, "utf8");
    if (isRedirectStub(html)) continue;

    for (const match of html.matchAll(/\bdata-(?:operator|bookmaker)=["']([^"']+)["']/g)) {
      if (bySlug.has(match[1])) referencedSlugs.add(match[1]);
    }
  }
}

function collectFacts(value, prefix = "facts") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  if (Object.hasOwn(value, "value")) return [[prefix, value]];

  return Object.entries(value).flatMap(([key, child]) => collectFacts(child, `${prefix}.${key}`));
}

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// App stores block automated HEAD/GET; skip them in CI — they are verified manually.
const CI_SKIP_HOSTS = ['apps.apple.com', 'play.google.com'];

async function sourceResolves(source) {
  try {
    const { hostname } = new URL(source);
    if (CI_SKIP_HOSTS.includes(hostname)) return true;
  } catch { /* fall through */ }

  if (sourceCache.has(source)) return sourceCache.get(source);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const headers = { "User-Agent": "Mozilla/5.0 (compatible; BetSortedSourceCheck/1.0)" };
  const promise = (async () => {
    try {
      let response = await fetch(source, { method: "HEAD", redirect: "follow", signal: controller.signal, headers });
      if (response.status >= 400) {
        response = await fetch(source, { method: "GET", redirect: "follow", signal: controller.signal, headers });
      }
      return (response.status >= 200 && response.status < 400) || response.status === 401 || response.status === 403;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  })();

  sourceCache.set(source, promise);
  return promise;
}

scanHtmlFiles(ROOT);

for (const slug of referencedSlugs) {
  const operator = bySlug.get(slug);
  if (!operator.facts || typeof operator.facts !== "object" || Array.isArray(operator.facts)) {
    failures.push(`${slug}: missing facts object`);
    continue;
  }

  const facts = collectFacts(operator.facts);
  if (!facts.length) failures.push(`${slug}: facts object has no fact entries`);

  for (const [field, fact] of facts) {
    if (fact.value === undefined || fact.value === null || fact.value === "") failures.push(`${slug}.${field}: missing value`);
    if (!fact.source) failures.push(`${slug}.${field}: missing source`);
    if (!validDate(fact.checked)) {
      failures.push(`${slug}.${field}: missing or invalid checked date`);
    } else {
      const checked = new Date(`${fact.checked}T00:00:00Z`);
      const ageDays = Math.floor((today - checked) / 86400000);
      if (ageDays > MAX_AGE_DAYS) failures.push(`${slug}.${field}: checked date is ${ageDays} days old`);
    }
  }
}

for (const source of new Set(collectFacts({ facts: Object.fromEntries(operators.map((operator) => [operator.slug, operator.facts])) }).map(([, fact]) => fact.source).filter(Boolean))) {
  if (!(await sourceResolves(source))) failures.push(`source does not resolve: ${source}`);
}

if (failures.length) {
  throw new Error(`Operator fact assertion failed:\n- ${failures.join("\n- ")}`);
}

console.log(`operator fact assertion passed for ${referencedSlugs.size} published operators and ${sourceCache.size} source URL(s)`);
