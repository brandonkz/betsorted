#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://gamma-api.polymarket.com';

const MARKET_CONFIGS = [
  {
    titleFor(year) {
      return `EPL: ${year} Champion`;
    },
    slug: 'epl',
    title: 'EPL Title Race 2026/27',
    icon: '🏴',
    endsFor(year) {
      return `May ${year}`;
    },
    desc: 'Who wins the current Premier League title race? Market prices reflect live Polymarket consensus.',
  },
  {
    titleFor(year) {
      return `UEFA Champions League: ${year} Champion`;
    },
    slug: 'ucl',
    title: 'Champions League Winner',
    icon: '⭐',
    endsFor(year) {
      return `May ${year}`;
    },
    desc: 'Which club lifts the Champions League trophy this season?',
  },
  {
    titleFor(year) {
      return `LALIGA: ${year} Champion`;
    },
    slug: 'laliga',
    title: 'La Liga Winner',
    icon: '🇪🇸',
    endsFor(year) {
      return `May ${year}`;
    },
    desc: 'Barcelona, Real Madrid and the chasing pack in the live La Liga outright market.',
  },
];

function getTargetSeasonYear(now = new Date()) {
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  return month >= 6 ? year + 1 : year;
}

async function fetchActiveSoccerEvents() {
  const url = `${API_BASE}/events?limit=200&closed=false&active=true&tag_slug=soccer`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Polymarket events request failed: ${response.status}`);
  }

  return response.json();
}

function parseOutcomePrices(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    return Number(parsed[0]);
  } catch {
    return null;
  }
}

function eventToFeedEntry(event, config, targetYear) {
  const outcomes = (event.markets || [])
    .filter((market) => market.active && !market.closed)
    .map((market) => {
      const prob = parseOutcomePrices(market.outcomePrices);
      if (!Number.isFinite(prob) || prob <= 0) {
        return null;
      }

      return {
        name: market.groupItemTitle || market.question,
        flag: '',
        prob,
        pct: Number((prob * 100).toFixed(1)),
        fairDec: Number((1 / prob).toFixed(2)),
        vol: Number(market.volume || 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 10);

  if (!outcomes.length) {
    return null;
  }

  return {
    id: Number(event.id),
    slug: config.slug,
    title: config.title,
    icon: config.icon,
    volumeM: Number((Number(event.volume || 0) / 1000000).toFixed(1)),
    ends: config.endsFor(targetYear),
    desc: config.desc,
    outcomes,
  };
}

async function main() {
  const targetYear = getTargetSeasonYear();
  const events = await fetchActiveSoccerEvents();

  const feedEntries = MARKET_CONFIGS.map((config) => {
    const event = events.find((candidate) => candidate.title === config.titleFor(targetYear));
    return event ? eventToFeedEntry(event, config, targetYear) : null;
  }).filter(Boolean);

  if (!feedEntries.length) {
    throw new Error(`No active Polymarket soccer outrights found for ${targetYear}`);
  }

  const output = {
    updatedAt: new Date().toISOString(),
    events: feedEntries,
  };

  const outputPath = path.join(__dirname, 'data', 'polymarket.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Saved ${feedEntries.length} active Polymarket events to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
