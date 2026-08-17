#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://betsorted.co.za';

const reviewPairs = [
  ['Betway', '/bookmakers/betway-review.html', '/blog/betway-review-south-africa-2026.html'],
  ['Hollywoodbets', '/bookmakers/hollywoodbets-review.html', '/blog/hollywoodbets-review-south-africa-2026.html'],
  ['Sportingbet', '/bookmakers/sportingbet-review.html', '/blog/sportingbet-review-south-africa-2026.html'],
  ['World Sports Betting', '/bookmakers/world-sports-betting-review.html', '/blog/wsb-review-south-africa-2026.html'],
  ['Supabets', '/bookmakers/supabets-review.html', '/blog/supabets-review-south-africa-2026.html'],
  ['Sunbet', '/bookmakers/sunbet-review.html', '/blog/sunbet-review-south-africa-2026.html'],
  ['Playabets', '/bookmakers/playabets-review.html', '/blog/playabets-review-south-africa-2026.html'],
  ['Easybet', '/bookmakers/easybet-review.html', '/blog/easybet-review-south-africa-2026.html'],
  ['Bet.co.za', '/bookmakers/bet-co-za-review.html', '/blog/bet-co-za-review-south-africa-2026.html'],
  ['10bet', '/bookmakers/10bet-review.html', '/blog/10bet-review-south-africa-2026.html'],
  ['Gbets', '/bookmakers/gbets-review.html', '/blog/gbets-review-south-africa-2026.html'],
];

const aliasRedirects = new Map([
  ['/bookmakers/10bet.html', '/bookmakers/10bet-review.html'],
  ['/bookmakers/betway.html', '/bookmakers/betway-review.html'],
  ['/bookmakers/easybet.html', '/bookmakers/easybet-review.html'],
  ['/bookmakers/gbets.html', '/bookmakers/gbets-review.html'],
  ['/bookmakers/hollywoodbets.html', '/bookmakers/hollywoodbets-review.html'],
  ['/bookmakers/playabets.html', '/bookmakers/playabets-review.html'],
  ['/bookmakers/sportingbet.html', '/bookmakers/sportingbet-review.html'],
  ['/bookmakers/sunbet.html', '/bookmakers/sunbet-review.html'],
  ['/bookmakers/supabets.html', '/bookmakers/supabets-review.html'],
  ['/bookmakers/world-sports-betting.html', '/bookmakers/world-sports-betting-review.html'],
  ['/bookmakers/wsb.html', '/bookmakers/world-sports-betting-review.html'],
]);

const redirectSources = new Map([
  ...reviewPairs.map(([, canonical, old]) => [old, canonical]),
  ...aliasRedirects,
]);

const failures = [];

function localPath(url) {
  return path.join(ROOT, url.replace(/^\//, ''));
}

function readUrl(url) {
  return fs.readFileSync(localPath(url), 'utf8');
}

for (const [brand, canonical, old] of reviewPairs) {
  if (!fs.existsSync(localPath(canonical))) failures.push(`${brand} canonical missing: ${canonical}`);
  if (!fs.existsSync(localPath(old))) failures.push(`${brand} redirect source missing: ${old}`);

  const canonicalHtml = fs.existsSync(localPath(canonical)) ? readUrl(canonical) : '';
  if (!canonicalHtml.includes(`rel="canonical" href="${SITE}${canonical}"`)) {
    failures.push(`${brand} canonical page does not self-canonicalize to ${canonical}`);
  }
  if (canonicalHtml.includes('noindex')) failures.push(`${brand} canonical page is noindex`);

  const oldHtml = fs.existsSync(localPath(old)) ? readUrl(old) : '';
  if (!oldHtml.includes('noindex,follow')) failures.push(`${brand} old blog review is not noindex redirect`);
  if (!oldHtml.includes(`url=${canonical}`)) failures.push(`${brand} old blog review does not refresh to ${canonical}`);
  if (!oldHtml.includes(`rel="canonical" href="${SITE}${canonical}"`)) {
    failures.push(`${brand} old blog review does not canonicalize to ${canonical}`);
  }
}

for (const [source, target] of aliasRedirects) {
  if (!fs.existsSync(localPath(source))) failures.push(`alias redirect source missing: ${source}`);
  const html = fs.existsSync(localPath(source)) ? readUrl(source) : '';
  if (!html.includes('noindex,follow')) failures.push(`${source} is not noindex redirect`);
  if (!html.includes(`url=${target}`)) failures.push(`${source} does not refresh to ${target}`);
}

const textExtensions = new Set(['.html', '.json', '.xml', '.md', '.csv', '.js', '.mjs', '.txt']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;
    const rel = path.relative(ROOT, full);
    if (rel === 'data/redirects.json' || rel === 'tests/assert-canonical-reviews.mjs' || rel.startsWith('audit/')) continue;
    const route = `/${rel}`;
    const html = fs.readFileSync(full, 'utf8');
    for (const [source] of redirectSources) {
      if (route === source.replace(/^\//, '')) continue;
      if (rel === source.replace(/^\//, '')) continue;
      if (html.includes(source) || html.includes(`${SITE}${source}`)) {
        failures.push(`${rel} links to redirected review URL ${source}`);
      }
    }
  }
}
walk(ROOT);

if (failures.length > 0) {
  throw new Error(`Canonical review assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Canonical review assertion passed for ${reviewPairs.length} review pairs.`);
