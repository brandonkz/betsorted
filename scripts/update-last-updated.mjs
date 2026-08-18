#!/usr/bin/env node
// Updates the "Updated YYYY-MM-DD" badge on index.html to today's date
// and bumps dateModified in structured data on key evergreen pages.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function todaySA() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function updateFile(filePath, transforms) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const { from, to } of transforms) {
    if (src.includes(from)) {
      src = src.replaceAll(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`Updated: ${path.relative(ROOT, filePath)}`);
  }
}

const today = todaySA();

// 1. Homepage "Updated" badge
const indexPath = path.join(ROOT, 'index.html');
const indexSrc = fs.readFileSync(indexPath, 'utf8');
const badgeMatch = indexSrc.match(/>Updated (\d{4}-\d{2}-\d{2})</);
if (badgeMatch && badgeMatch[1] !== today) {
  updateFile(indexPath, [
    { from: `>Updated ${badgeMatch[1]}<`, to: `>Updated ${today}<` }
  ]);
} else {
  console.log(`index.html badge already current (${today})`);
}

// 2. Key evergreen pages — bump dateModified in JSON-LD
const evergreenPages = [
  'best-betting-sites-south-africa.html',
  'best-betting-apps.html',
  'bookmakers/index.html',
  'best-odds-finder.html',
  'calculators.html',
];

for (const rel of evergreenPages) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) continue;
  const src = fs.readFileSync(filePath, 'utf8');
  const dmMatch = src.match(/"dateModified":\s*"(\d{4}-\d{2}-\d{2})"/);
  if (dmMatch && dmMatch[1] !== today) {
    updateFile(filePath, [
      { from: `"dateModified": "${dmMatch[1]}"`, to: `"dateModified": "${today}"` }
    ]);
  }
}

console.log(`Done. Date: ${today}`);
