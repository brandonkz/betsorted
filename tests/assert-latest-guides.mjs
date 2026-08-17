import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const siteRoot = process.cwd();
const indexHtml = readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
const sectionMatch = indexHtml.match(/<section class="container" id="latest-guides"[\s\S]*?<\/section>/);

if (!sectionMatch) {
  throw new Error('Could not find #latest-guides section in index.html');
}

const section = sectionMatch[0];
const cardPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<a href="([^"]+)" style="color: #2563eb; font-weight: 700; text-decoration: none;">Read guide (?:&rarr;|→)<\/a>/g;
const cards = [...section.matchAll(cardPattern)].map((match) => ({
  title: clean(match[1]),
  href: match[2],
}));

if (cards.length === 0) {
  throw new Error('Latest Betting Guides has no cards');
}

const seen = new Map();
const failures = [];

for (const card of cards) {
  if (seen.has(card.href)) {
    failures.push(`Duplicate latest-guide href: ${card.href} (${seen.get(card.href)} / ${card.title})`);
    continue;
  }
  seen.set(card.href, card.title);

  const targetPath = localPathFromHref(card.href);
  if (!targetPath) {
    failures.push(`Latest-guide href is not a local HTML page: ${card.href}`);
    continue;
  }
  if (!existsSync(targetPath)) {
    failures.push(`Latest-guide href 404s locally: ${card.href}`);
    continue;
  }

  const targetHtml = readFileSync(targetPath, 'utf8');
  if (/<meta\s+http-equiv=["']refresh["']/i.test(targetHtml)) {
    failures.push(`Latest-guide href points at a redirect stub: ${card.href}`);
  }

  const h1Match = targetHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    failures.push(`Latest-guide target has no h1: ${card.href}`);
    continue;
  }

  const h1 = clean(h1Match[1]);
  if (card.title !== h1) {
    failures.push(`Latest-guide title mismatch for ${card.href}: card "${card.title}" vs h1 "${h1}"`);
  }
}

if (failures.length) {
  throw new Error(`Latest Betting Guides assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Latest Betting Guides assertion passed for ${cards.length} cards.`);

function localPathFromHref(href) {
  if (!href.startsWith('/') || href.startsWith('/go/')) return null;
  const cleanHref = href.split('#')[0].split('?')[0];
  let relative = cleanHref.slice(1);
  if (relative === '') relative = 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  if (!relative.endsWith('.html')) return null;
  return path.join(siteRoot, relative);
}

function clean(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
