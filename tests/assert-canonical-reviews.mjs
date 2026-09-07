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
  ['BET.co.za', '/bookmakers/bet-co-za-review.html', '/blog/bet-co-za-review-south-africa-2026.html'],
  ['10bet', '/bookmakers/10bet-review.html', '/blog/10bet-review-south-africa-2026.html'],
  ['Gbets', '/bookmakers/gbets-review.html', '/blog/gbets-review-south-africa-2026.html'],
];

const aliasRedirects = new Map([
  ['/bookmakers/10bet.html', '/blog/10bet-review-south-africa-2026.html'],
  ['/bookmakers/betway.html', '/blog/betway-review-south-africa-2026.html'],
  ['/bookmakers/easybet.html', '/blog/easybet-review-south-africa-2026.html'],
  ['/bookmakers/gbets.html', '/blog/gbets-review-south-africa-2026.html'],
  ['/bookmakers/hollywoodbets.html', '/blog/hollywoodbets-review-south-africa-2026.html'],
  ['/bookmakers/playabets.html', '/blog/playabets-review-south-africa-2026.html'],
  ['/bookmakers/sportingbet.html', '/blog/sportingbet-review-south-africa-2026.html'],
  ['/bookmakers/sunbet.html', '/blog/sunbet-review-south-africa-2026.html'],
  ['/bookmakers/supabets.html', '/blog/supabets-review-south-africa-2026.html'],
  ['/bookmakers/world-sports-betting.html', '/blog/wsb-review-south-africa-2026.html'],
  ['/bookmakers/wsb.html', '/blog/wsb-review-south-africa-2026.html'],
]);

const failures = [];

function localPath(url) {
  return path.join(ROOT, url.replace(/^\//, ''));
}

function readUrl(url) {
  return fs.readFileSync(localPath(url), 'utf8');
}

for (const [brand, retired, survivor] of reviewPairs) {
  if (!fs.existsSync(localPath(retired))) failures.push(`${brand} retired page missing: ${retired}`);
  if (!fs.existsSync(localPath(survivor))) failures.push(`${brand} survivor missing: ${survivor}`);

  const survivorHtml = fs.existsSync(localPath(survivor)) ? readUrl(survivor) : '';
  if (!survivorHtml.includes(`rel="canonical" href="${SITE}${survivor}"`)) {
    failures.push(`${brand} survivor does not self-canonicalize to ${survivor}`);
  }
  if (survivorHtml.includes('noindex')) failures.push(`${brand} survivor is noindex`);

  const retiredHtml = fs.existsSync(localPath(retired)) ? readUrl(retired) : '';
  if (!retiredHtml.includes('noindex, follow')) failures.push(`${brand} retired page is not noindex redirect`);
  if (!retiredHtml.includes(`url=https://betsorted.co.za${survivor}`)) {
    failures.push(`${brand} retired page does not refresh to ${survivor}`);
  }
  if (!retiredHtml.includes(`rel="canonical" href="${SITE}${survivor}"`)) {
    failures.push(`${brand} retired page does not canonicalize to ${survivor}`);
  }
}

for (const [source, target] of aliasRedirects) {
  if (!fs.existsSync(localPath(source))) failures.push(`alias redirect source missing: ${source}`);
  const html = fs.existsSync(localPath(source)) ? readUrl(source) : '';
  if (!html.includes('noindex, follow')) failures.push(`${source} is not noindex redirect`);
  if (!html.includes(`url=https://betsorted.co.za${target}`)) {
    failures.push(`${source} does not refresh to ${target}`);
  }
  if (!html.includes(`rel="canonical" href="${SITE}${target}"`)) {
    failures.push(`${source} does not canonicalize to ${target}`);
  }
}

const retiredReviewUrls = new Set(reviewPairs.map(([, retired]) => retired));
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

    const rel = path.relative(ROOT, full).replaceAll(path.sep, '/');
    if (rel === 'data/redirects.json' || rel === 'tests/assert-canonical-reviews.mjs' || rel.startsWith('audit/')) continue;

    const route = `/${rel}`;
    const text = fs.readFileSync(full, 'utf8');
    for (const retired of retiredReviewUrls) {
      if (route === retired) continue;
      if (text.includes(retired) || text.includes(`${SITE}${retired}`)) {
        failures.push(`${rel} still references retired review URL ${retired}`);
      }
    }
  }
}

walk(ROOT);

if (failures.length > 0) {
  throw new Error(`Canonical review assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Canonical review assertion passed for ${reviewPairs.length} review pairs.`);
