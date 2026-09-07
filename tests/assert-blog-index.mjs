#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = 'blog';
const MOVED_EXCERPT = 'This BetSorted guide has moved to the canonical updated version.';
const indexFiles = [
  'blog/index.html',
  ...fs.readdirSync(BLOG_DIR)
    .filter(file => /^category-.+\.html$/.test(file))
    .map(file => path.join(BLOG_DIR, file))
    .sort()
];

const failures = [];
const DEFAULT_MAX_CARDS_PER_SECTION = 12;
const SECTION_MAX_CARDS = {
  'Featured Right Now': 9,
};
const SECTION_ALLOWED_TAGS = {
  'Featured Right Now': null,
  'Bonus Guides': new Set(['Bonus Guides', 'Betting Guides & Strategy']),
};

for (const file of indexFiles) {
  const html = fs.readFileSync(file, 'utf8');

  if (html.includes(MOVED_EXCERPT)) {
    failures.push(`${file} still contains stale moved-guide excerpt`);
  }

  const categoryPostLinks = [...html.matchAll(/<h2><a href="\/blog\/(category-[^"]+\.html)">/g)];
  for (const match of categoryPostLinks) {
    failures.push(`${file} emits category hub as article card: ${match[1]}`);
  }

  const cards = [...html.matchAll(/<article class="blog-card">([\s\S]*?)<\/article>/g)];
  for (const card of cards) {
    const href = card[1].match(/<h2><a href="([^"]+)">/)?.[1];
    if (!href) {
      failures.push(`${file} has blog card without href`);
      continue;
    }
    const localTarget = href.startsWith('/') ? href.slice(1) : href;
    if (!fs.existsSync(localTarget)) failures.push(`${file} links to missing article target: ${href}`);
  }

  if (file === 'blog/index.html') {
    const sections = [...html.matchAll(/<section class="blog-category-section">([\s\S]*?)<\/section>/g)];
    for (const section of sections) {
      const heading = section[1].match(/<h2>([\s\S]*?)<\/h2>/)?.[1]?.replace(/&amp;/g, '&').trim();
      const sectionCards = [...section[1].matchAll(/<article class="blog-card">([\s\S]*?)<\/article>/g)];
      const maxCards = SECTION_MAX_CARDS[heading] ?? DEFAULT_MAX_CARDS_PER_SECTION;
      if (sectionCards.length > maxCards) {
        failures.push(`blog/index.html has ${sectionCards.length} cards in ${heading}, expected at most ${maxCards}`);
      }
      const allowedTags = SECTION_ALLOWED_TAGS[heading];
      for (const card of sectionCards) {
        const tag = card[1].match(/<span class="blog-tag">([\s\S]*?)<\/span>/)?.[1]?.replace(/&amp;/g, '&').trim();
        if (allowedTags === null) continue;
        if (allowedTags instanceof Set) {
          if (!allowedTags.has(tag)) failures.push(`blog/index.html section ${heading} contains ${tag || 'untagged'} card`);
          continue;
        }
        if (tag !== heading) failures.push(`blog/index.html section ${heading} contains ${tag || 'untagged'} card`);
      }
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Blog index assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Blog index assertion passed for ${indexFiles.length} index pages.`);
