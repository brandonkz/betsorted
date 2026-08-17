#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const HUB_PATH = 'bookmakers/index.html';
const EXPECTED_OPERATORS = [
  'betway',
  'hollywoodbets',
  'sportingbet',
  'supabets',
  '10bet',
  'play-co-za',
  'world-sports-betting',
  'easybet',
  'gbets',
  'sunbet',
  'bet-co-za',
  'betfred',
  'betolimp',
  'betshezi',
  'lottostar',
  'playabets',
  'yesplay'
];

const html = fs.readFileSync(HUB_PATH, 'utf8');
const failures = [];

function localTargetExists(href) {
  const [pathOnly] = href.split(/[?#]/);
  if (pathOnly === '/') return fs.existsSync('index.html');
  const relative = pathOnly.startsWith('/') ? pathOnly.slice(1) : pathOnly;
  const target = pathOnly.endsWith('/') ? path.join(relative, 'index.html') : relative;
  return fs.existsSync(target);
}

if (!/<title>Best Bookmakers South Africa 2026 \| BetSorted Reviews<\/title>/.test(html)) {
  failures.push('Bookmakers hub title does not target best bookmakers South Africa');
}

if (!/<h1>Best Bookmakers South Africa<\/h1>/.test(html)) {
  failures.push('Bookmakers hub H1 missing or off target');
}

if (!/<link rel="canonical" href="https:\/\/betsorted\.co\.za\/bookmakers\/">/.test(html)) {
  failures.push('Bookmakers hub canonical missing');
}

if (!/"@type": "ItemList"/.test(html) || !/"numberOfItems": 17/.test(html)) {
  failures.push('Bookmakers hub ItemList schema missing or wrong size');
}

if (!html.includes('0800 006 008') || !html.includes('18+ only')) {
  failures.push('Responsible gambling notice or NRGP number missing from bookmakers hub');
}

const cards = [...html.matchAll(/<article class="bookmaker-card" data-operator="([^"]+)">([\s\S]*?)<\/article>/g)];
if (cards.length !== EXPECTED_OPERATORS.length) {
  failures.push(`Expected ${EXPECTED_OPERATORS.length} bookmaker cards, found ${cards.length}`);
}

for (const operator of EXPECTED_OPERATORS) {
  const card = cards.find(([_, slug]) => slug === operator)?.[2];
  if (!card) {
    failures.push(`Missing bookmaker card for ${operator}`);
    continue;
  }

  const reviewMatch = card.match(/<a class="review-link" href="([^"]+)">Read review<\/a>/);
  const goMatch = card.match(/<a class="go-link affiliate-link" href="([^"]+)"/);

  if (!reviewMatch) {
    failures.push(`Missing review link for ${operator}`);
  } else if (!localTargetExists(reviewMatch[1])) {
    failures.push(`Review link for ${operator} points to missing target: ${reviewMatch[1]}`);
  }

  if (!goMatch) {
    failures.push(`Missing go link for ${operator}`);
  } else {
    const goHref = goMatch[1];
    if (!goHref.includes('/go/') || !goHref.includes('subid=post-bookmakers-hub')) {
      failures.push(`Go link for ${operator} missing expected subid: ${goHref}`);
    }
    if (!localTargetExists(goHref)) {
      failures.push(`Go link for ${operator} points to missing target: ${goHref}`);
    }
  }

  for (const label of ['Welcome Bonus', 'Min Deposit', 'Licence Authority']) {
    if (!card.includes(label)) failures.push(`${operator} missing ${label}`);
  }
}

if (!fs.existsSync('go/bet-co-za.html')) {
  failures.push('Missing BET.co.za go fallback file');
}

if (failures.length > 0) {
  throw new Error(`Bookmakers hub assertion failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Bookmakers hub assertion passed for ${cards.length} operators.`);
