import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const siteRoot = process.cwd();
const robotsTxt = readFileSync(path.join(siteRoot, 'robots.txt'), 'utf8');

if (!/^Disallow:\s*\/go\/\s*$/im.test(robotsTxt)) {
  throw new Error('robots.txt must disallow /go/');
}

const htmlFiles = allHtmlFiles(siteRoot);
const failures = [];

for (const file of htmlFiles) {
  const relativeFile = path.relative(siteRoot, file).replaceAll(path.sep, '/');
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/href="(\/go\/[^"]+)"/g)) {
    const href = match[1];
    const [target, query = ''] = href.split('?');
    const params = new URLSearchParams(query);
    const localTarget = path.join(siteRoot, target.slice(1).split('#')[0]);
    if (!existsSync(localTarget)) {
      failures.push(`${relativeFile} links to missing go target: ${href}`);
    }
    if (!params.get('subid')) {
      failures.push(`${relativeFile} has /go/ link without subid: ${href}`);
    }
  }
}

const indexHtml = readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
const tableMatch = indexHtml.match(/<tbody id="comparison-tbody">([\s\S]*?)<\/tbody>/);

if (!tableMatch) {
  failures.push('Could not find homepage comparison table body');
} else {
  const expectedRows = [
    ['Betway', '/bookmakers/betway-review.html', '/go/betway.html'],
    ['Hollywoodbets', '/bookmakers/hollywoodbets-review.html', '/go/hollywoodbets.html'],
    ['Sportingbet', '/bookmakers/sportingbet-review.html', '/go/sportingbet.html'],
    ['10bet', '/bookmakers/10bet-review.html', '/go/10bet.html'],
    ['Play.co.za', '/bookmakers/play-co-za-review.html', '/go/play-co-za.html'],
    ['World Sports Betting', '/bookmakers/world-sports-betting-review.html', '/go/world-sports-betting.html'],
    ['Gbets', '/bookmakers/gbets-review.html', '/go/gbets.html'],
    ['Sunbet', '/bookmakers/sunbet-review.html', '/go/sunbet.html'],
  ];

  for (const [brand, reviewHref, goHref] of expectedRows) {
    const rowMatch = tableMatch[1].match(new RegExp(`<tr>[\\s\\S]*?<span class="bookmaker-name">${escapeRegExp(brand)}</span>[\\s\\S]*?<\\/tr>`));
    if (!rowMatch) {
      failures.push(`Homepage comparison row missing: ${brand}`);
      continue;
    }
    const row = rowMatch[0];
    if (!row.includes(`href="${reviewHref}"`)) {
      failures.push(`Homepage comparison row missing review link for ${brand}: ${reviewHref}`);
    }
    if (!row.includes(`href="${goHref}?subid=home-table"`)) {
      failures.push(`Homepage comparison row missing home-table go link for ${brand}: ${goHref}?subid=home-table`);
    }
  }
}

const todoBrands = {
  betway: 'Betway',
  easybet: 'Easybet',
  gbets: 'Gbets',
  sportingbet: 'Sportingbet',
  supabets: 'Supabets',
  sunbet: 'Sunbet',
  'world-sports-betting': 'World Sports Betting',
};

for (const [slug, brand] of Object.entries(todoBrands)) {
  const goFile = path.join(siteRoot, 'go', `${slug}.html`);
  if (!existsSync(goFile)) {
    failures.push(`Missing /go/ placeholder for ${brand}: go/${slug}.html`);
    continue;
  }
  const html = readFileSync(goFile, 'utf8');
  if (!html.includes(`We're setting up a tracked link for ${brand}.`)) {
    failures.push(`Missing clean tracked-link setup copy in go/${slug}.html`);
  }
  if (html.includes('TODO_AFFILIATE_URL')) {
    failures.push(`go/${slug}.html should not expose TODO_AFFILIATE_URL`);
  }
}

if (failures.length) {
  throw new Error(`Go-link assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log('Go-link assertion passed.');

function allHtmlFiles(root) {
  const ignored = new Set(['.git', 'node_modules', 'templates']);
  const results = [];
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) stack.push(path.join(current, entry.name));
      } else if (entry.name.endsWith('.html')) {
        results.push(path.join(current, entry.name));
      }
    }
  }

  return results;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
