#!/usr/bin/env node

/**
 * Fetch live odds from The Odds API and update homepage
 * Usage: 500 credits/month = ~16 requests/day
 * Strategy: Run 2x per day (6 AM, 6 PM)
 */

const fs = require('fs');
const path = require('path');

// Load API key
require('dotenv').config();
const API_KEY = process.env.ODDS_API_KEY;

if (!API_KEY) {
  throw new Error('ODDS_API_KEY is required. Set it in the environment before running fetch-live-odds.js.');
}

const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
// SA-relevant sports (prioritized order)
const SPORTS = [
  'soccer_epl', // Premier League (most popular in SA)
  'soccer_uefa_champs_league_qualification', // Current European tournament action
  'soccer_spain_la_liga',
  'soccer_italy_serie_a',
  'soccer_germany_bundesliga',
  'soccer_france_ligue_one',
  'cricket_t20_world_cup', // T20 World Cup (when Proteas play)
];

// Betway is the only SA bookmaker available in the API
const PRIORITY_BOOKMAKERS = ['betway']; // Show Betway first when available

async function fetchOdds(sport) {
  const url = `${BASE_URL}/${sport}/odds/?apiKey=${API_KEY}&regions=uk,eu,us&markets=h2h&oddsFormat=decimal`;
  
  console.log(`Fetching ${sport}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check remaining credits
    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');
    console.log(`  ✓ Credits: ${used} used, ${remaining} remaining`);
    
    return data;
  } catch (error) {
    console.error(`  ✗ Error fetching ${sport}:`, error.message);
    return [];
  }
}

function sortBookmakersByPriority(bookmakers) {
  // Sort to prioritize Betway
  return [...bookmakers].sort((a, b) => {
    const aKey = a.key.toLowerCase();
    const bKey = b.key.toLowerCase();
    
    // Betway first
    if (PRIORITY_BOOKMAKERS.some(p => aKey.includes(p))) return -1;
    if (PRIORITY_BOOKMAKERS.some(p => bKey.includes(p))) return 1;
    
    return 0; // Keep original order for others
  });
}

function dedupeReferenceBookmakers(bookmakers) {
  const byKey = new Map();
  const output = [];

  for (const bookmaker of bookmakers) {
    if (bookmaker.key === 'betfair_ex_eu' && byKey.has('betfair_ex_uk')) {
      continue;
    }

    if (bookmaker.key === 'betfair_ex_uk' && byKey.has('betfair_ex_eu')) {
      const index = output.findIndex(item => item.key === 'betfair_ex_eu');
      if (index !== -1) output.splice(index, 1);
      byKey.delete('betfair_ex_eu');
    }

    if (byKey.has(bookmaker.key)) continue;
    byKey.set(bookmaker.key, true);
    output.push(bookmaker);
  }

  return output;
}

function formatEvent(game) {
  // Sort bookmakers to prioritize Betway
  const sortedBookmakers = sortBookmakersByPriority(game.bookmakers);
  
  // Get odds from multiple bookmakers
  const homeOdds = [];
  
  for (const bookmaker of sortedBookmakers) {
    const market = bookmaker.markets.find(m => m.key === 'h2h');
    if (market) {
      const homeOutcome = market.outcomes.find(o => o.name === game.home_team);
      if (homeOutcome) {
        homeOdds.push({
          bookmaker: bookmaker.title,
          key: bookmaker.key,
          odds: homeOutcome.price,
          isBetway: bookmaker.key.toLowerCase().includes('betway')
        });
      }
    }
  }
  
  // Prioritize Betway, then sort by best odds
  const uniqueHomeOdds = dedupeReferenceBookmakers(homeOdds);

  uniqueHomeOdds.sort((a, b) => {
    // Betway always first if available
    if (a.isBetway && !b.isBetway) return -1;
    if (!a.isBetway && b.isBetway) return 1;
    // Otherwise sort by odds
    return b.odds - a.odds;
  });
  
  if (uniqueHomeOdds.length < 2) return null;
  
  // Get sport emoji and type
  let emoji = '⚽';
  let sportType = 'Soccer';
  if (game.sport_key.includes('rugby')) {
    emoji = '🏉';
    sportType = 'Rugby';
  } else if (game.sport_key.includes('cricket')) {
    emoji = '🏏';
    sportType = 'Cricket';
  }
  
  // Format date
  const date = new Date(game.commence_time);
  const day = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = date.getDate();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return {
    emoji,
    sportType,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    day,
    month,
    dayNum,
    time,
    venue: 'TBA', // API doesn't provide venue
    bestOdds: uniqueHomeOdds[0],
    secondOdds: uniqueHomeOdds[1]
  };
}

function generateEventHTML(events) {
  return events.map(event => {
    const firstLabel = event.bestOdds.isBetway ? `${event.bestOdds.bookmaker} 🇿🇦` : event.bestOdds.bookmaker;
    const secondLabel = event.secondOdds.isBetway ? `${event.secondOdds.bookmaker} 🇿🇦` : event.secondOdds.bookmaker;
    
    return `
        <!-- Event -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <span style="font-size: 1.5rem;">${event.emoji}</span>
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">${event.sportType}</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">
            ${event.awayTeam} vs ${event.homeTeam}
          </h3>
          <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1rem;">
            ${event.day} ${event.month} ${event.dayNum}, ${event.time}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${firstLabel}</span>
            <span style="color: #10b981; font-weight: 700;">${event.bestOdds.odds.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${secondLabel}</span>
            <span style="color: white; font-weight: 700;">${event.secondOdds.odds.toFixed(2)}</span>
          </div>
          <a href="/odds-comparison.html" style="display: block; width: 100%; background: #2563eb; color: white; text-align: center; padding: 0.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Compare All Odds →
          </a>
        </div>
  `;
  }).join('\n');
}

function formatMatchForFinder(game) {
  // Get all bookmaker odds for this match
  const bookmakers = [];
  
  for (const bookmaker of game.bookmakers) {
    const market = bookmaker.markets.find(m => m.key === 'h2h');
    if (market) {
      const homeOutcome = market.outcomes.find(o => o.name === game.home_team);
      if (homeOutcome) {
        bookmakers.push({
          name: bookmaker.key.toLowerCase().includes('betway') ? `${bookmaker.title} 🇿🇦` : bookmaker.title,
          key: bookmaker.key,
          odds: homeOutcome.price,
          url: bookmaker.key.toLowerCase().includes('betway') ? 'https://betway.co.za' : '#',
          isSouthAfrica: bookmaker.key.toLowerCase().includes('betway')
        });
      }
    }
  }
  
  const uniqueBookmakers = dedupeReferenceBookmakers(bookmakers);

  if (uniqueBookmakers.length < 2) return null;
  
  // Get sport emoji and type
  let emoji = '⚽';
  let sportKey = 'soccer';
  let league = 'Soccer';
  
  if (game.sport_key.includes('soccer_epl')) {
    league = 'Premier League';
  } else if (game.sport_key.includes('uefa_champs_league_qualification')) {
    league = 'Champions League Qualifiers';
  } else if (game.sport_key.includes('spain_la_liga')) {
    league = 'La Liga';
  } else if (game.sport_key.includes('italy_serie_a')) {
    league = 'Serie A';
  } else if (game.sport_key.includes('germany_bundesliga')) {
    league = 'Bundesliga';
  } else if (game.sport_key.includes('france_ligue_one')) {
    league = 'Ligue 1';
  } else if (game.sport_key.includes('champs_league')) {
    league = 'Champions League';
  } else if (game.sport_key.includes('rugby')) {
    emoji = '🏉';
    sportKey = 'rugby';
    league = 'Rugby';
  } else if (game.sport_key.includes('cricket')) {
    emoji = '🏏';
    sportKey = 'cricket';
    league = 'Cricket';
  }
  
  return {
    sport: sportKey,
    emoji,
    league,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    market: `${game.home_team} to win`,
    datetime: game.commence_time,
    bookmakers: uniqueBookmakers.sort((a, b) => b.odds - a.odds)
  };
}

function getSASTTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+02:00`;
}

function updateOddsHistory(matches) {
  const dataDir = path.join(__dirname, 'data');
  const historyPath = path.join(dataDir, 'odds-history.json');
  let history = [];

  if (fs.existsSync(historyPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      if (Array.isArray(parsed)) history = parsed;
    } catch (error) {
      history = [];
    }
  }

  const entry = {
    timestamp: getSASTTimestamp(new Date()),
    matches
  };

  history.push(entry);

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  history = history.filter(item => {
    const ts = Date.parse(item.timestamp);
    return !Number.isNaN(ts) && ts >= cutoff;
  });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  return entry;
}

function updateBestOddsFinderPage(oddsData) {
  const pagePath = path.join(__dirname, 'best-odds-finder.html');
  if (!fs.existsSync(pagePath)) return;

  let html = fs.readFileSync(pagePath, 'utf8');
  const matches = Array.isArray(oddsData.matches) ? oddsData.matches : [];
  const robots = matches.length ? '' : '<meta name="robots" content="noindex,follow">';
  const updated = oddsData.updated ? new Date(oddsData.updated) : null;
  const updatedText = updated && !Number.isNaN(updated.getTime())
    ? updated.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }) + ' SAST'
    : 'Unknown';

  const statusHtml = `    <!-- SSR_ODDS_STATUS_START -->
    <div id="odds-status" class="data-status">
      <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Odds feed timestamp: ${escapeHtml(updatedText)}</div>
      <p style="margin: 0; opacity: 0.95;">This is a reference feed from the last update job. It is not live pricing and does not compare multiple South African bookmakers.</p>
    </div>
    <!-- SSR_ODDS_STATUS_END -->`;

  const matchesHtml = matches.length
    ? `    <!-- SSR_ODDS_MATCHES_START -->
    <div id="matches-container" style="margin-top: 2rem; display: grid; gap: 1.5rem;">
${matches.map(renderStaticFinderCard).join('\n')}
    </div>
    <!-- SSR_ODDS_MATCHES_END -->`
    : `    <!-- SSR_ODDS_MATCHES_START -->
    <div id="matches-container" style="margin-top: 2rem; display: grid; gap: 1.5rem;">
      <div class="empty-state"><div style="font-size:3rem;margin-bottom:1rem;">∅</div><p><strong>No matches in the current odds file</strong></p><p style="font-size:0.875rem;opacity:0.85;">Check back after the next feed update or compare licensed South African bookmakers manually.</p></div>
    </div>
    <!-- SSR_ODDS_MATCHES_END -->`;

  html = replaceBetweenMarkers(html, 'SSR_ODDS_ROBOTS', robots);
  html = replaceBetweenMarkers(html, 'SSR_ODDS_STATUS', `\n${statusHtml}\n`);
  html = replaceBetweenMarkers(html, 'SSR_ODDS_MATCHES', `\n${matchesHtml}\n`);
  fs.writeFileSync(pagePath, html);
}

function replaceBetweenMarkers(html, marker, replacement) {
  const start = `<!-- ${marker}_START -->`;
  const end = `<!-- ${marker}_END -->`;
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end, startIndex);
  if (startIndex === -1 || endIndex === -1) return html;
  return html.slice(0, startIndex) + replacement + html.slice(endIndex + end.length);
}

function renderStaticFinderCard(match) {
  const reference = getStaticReference(match);
  const bestListed = getStaticNonExchangeBooks(match)[0] || null;
  const kickoff = match.datetime ? new Date(match.datetime) : null;
  const kickoffText = kickoff && !Number.isNaN(kickoff.getTime())
    ? kickoff.toLocaleString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }) + ' SAST'
    : 'Kickoff TBA';
  const marketLabel = match.market || `${match.homeTeam || 'Selection'} to win`;
  const compareLink = getStaticComparisonLink(match);
  const teams = `${match.emoji || ''} ${match.awayTeam || ''} vs ${match.homeTeam || ''}`.trim();

  return `      <div class="match-card" data-sport="${escapeHtml(match.sport || 'other')}" data-has-fair="${Boolean(reference)}">
        <div class="match-header"><div class="match-teams">${escapeHtml(teams)}</div><div class="match-meta"><span class="sport-badge">${escapeHtml(match.league || 'Sport')}</span><span>${escapeHtml(kickoffText)}</span></div></div>
        <div style="margin-bottom:1rem;color:#4b5563;font-size:0.9rem;font-weight:600;">Market shown: ${escapeHtml(marketLabel)}</div>
        ${renderStaticReferencePanel(reference)}
        ${renderStaticBestListedPanel(bestListed, reference)}
        ${renderStaticReturnLine(reference, bestListed)}
        <div class="sa-compare-module"><h3>Compare South African bookmakers for this market</h3><p>The reference prices above are not local recommendations. Use BetSorted to compare licensed South African bookmakers, then check the same market directly before staking.</p><a class="sa-compare-link" href="${compareLink.href}">${escapeHtml(compareLink.label)}</a></div>
      </div>`;
}

function getStaticReference(match) {
  const books = Array.isArray(match.bookmakers) ? match.bookmakers : [];
  const betfairUk = books.find(book => book.key === 'betfair_ex_uk');
  const betfairEu = books.find(book => book.key === 'betfair_ex_eu');
  const smarkets = books.find(book => book.key === 'smarkets');
  const entries = [betfairUk || betfairEu, smarkets].filter(book => book && Number(book.odds) > 1);
  if (entries.length === 0) return null;
  const probability = entries.reduce((sum, book) => sum + (1 / Number(book.odds)), 0) / entries.length;
  return { probability, fairOdds: 1 / probability, sources: entries.map(book => book.name || book.key) };
}

function getStaticNonExchangeBooks(match) {
  const books = Array.isArray(match.bookmakers) ? match.bookmakers : [];
  const exchangeKeys = ['betfair_ex_uk', 'betfair_ex_eu', 'smarkets'];
  const blockedKeys = ['bovada', 'lowvig', 'betonlineag'];
  return books
    .filter(book => !exchangeKeys.includes(book.key))
    .filter(book => !blockedKeys.includes(book.key))
    .map(book => ({ name: book.name || book.key, key: book.key, odds: Number(book.odds) }))
    .filter(book => book.odds > 1)
    .sort((a, b) => b.odds - a.odds);
}

function renderStaticReferencePanel(reference) {
  if (!reference) {
    return '<div class="warning-state" style="text-align:left;"><strong>No exchange reference for this market.</strong></div>';
  }
  return `<div class="reference-panel"><div class="reference-label">Exchange-derived fair value</div><div class="reference-grid"><div class="reference-metric"><div class="reference-label">Reference probability</div><div class="reference-value">${formatPercent(reference.probability)}</div></div><div class="reference-metric"><div class="reference-label">Fair odds</div><div class="reference-value">${formatDecimal(reference.fairOdds)}</div></div><div class="reference-metric"><div class="reference-label">Contributors</div><div class="reference-value" style="font-size:1rem;">${escapeHtml(reference.sources.join(', '))}</div></div></div><div class="reference-note">Derived from exchange back prices. This excludes commission and does not include the lay side of the market, so it is a benchmark rather than exact fair value.</div></div>`;
}

function renderStaticBestListedPanel(bestListed, reference) {
  if (!bestListed) {
    return '<div class="warning-state" style="text-align:left;margin-top:1rem;"><strong>No non-exchange reference price in this feed.</strong></div>';
  }
  const gapPercent = reference ? ((bestListed.odds - reference.fairOdds) / reference.fairOdds) * 100 : null;
  const gapClass = gapPercent >= 0 ? 'gap-positive' : 'gap-negative';
  const gapText = reference ? `${gapPercent >= 0 ? '+' : ''}${gapPercent.toFixed(1)}%` : 'No fair odds';
  return `<div class="price-table"><div class="price-row best-reference"><div class="price-source">${escapeHtml(bestListed.name)}<small>Reference data only, not a recommendation</small></div><div><strong>${formatDecimal(bestListed.odds)}</strong></div><div class="${gapClass}">${gapText}</div></div></div>`;
}

function renderStaticReturnLine(reference, bestListed) {
  if (!reference || !bestListed) return '';
  return `<div class="value-summary"><div class="value-summary-title">R100 return comparison</div><div class="value-summary-text">At fair odds, R100 returns R${(100 * reference.fairOdds).toFixed(2)}. At the best listed reference price, R100 returns R${(100 * bestListed.odds).toFixed(2)}.</div></div>`;
}

function getStaticComparisonLink(match) {
  const sport = (match.sport || '').toLowerCase();
  const league = (match.league || '').toLowerCase();
  if (sport === 'rugby') return { href: '/blog/best-rugby-betting-sites-south-africa-2026.html', label: 'Compare SA rugby bookmakers' };
  if (sport === 'cricket') return { href: '/blog/best-cricket-betting-sites-south-africa-2026.html', label: 'Compare SA cricket bookmakers' };
  if (league.includes('psl')) return { href: '/blog/best-psl-betting-site-2026.html', label: 'Compare SA PSL bookmakers' };
  return { href: '/bookmakers/', label: 'Compare licensed SA bookmakers' };
}

function formatDecimal(value) {
  return Number(value).toFixed(2);
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function main() {
  console.log('🎰 Fetching live odds from The Odds API...\n');
  
  const allGames = [];
  
  // Fetch all sports
  for (const sport of SPORTS) {
    const games = await fetchOdds(sport);
    allGames.push(...games);
  }
  
  console.log(`\n✓ Found ${allGames.length} total games\n`);
  
  // Filter out matches that have already started
  const upcomingGames = allGames.filter(g => new Date(g.commence_time) > new Date());

  // Format and filter games for homepage (top 3)
  const events = upcomingGames
    .map(formatEvent)
    .filter(e => e !== null)
    .slice(0, 3);
  
  // Format ALL upcoming games for best-odds-finder
  const finderMatches = upcomingGames
    .map(formatMatchForFinder)
    .filter(m => m !== null);
  
  if (events.length === 0) {
    console.log('⚠️  No games with odds found. Keeping existing events.');
    return;
  }
  
  console.log(`📊 Selected ${events.length} events for homepage`);
  console.log(`📊 Prepared ${finderMatches.length} matches for Best Odds Finder\n`);
  
  // Read index.html
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Update timestamp
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('en-US', { weekday: 'short' })} ${now.toLocaleDateString('en-US', { month: 'short' })} ${now.getDate()}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  
  // Replace events section
  const startMarker = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">';
  const endMarker = '</div>\n      \n      <p style="text-align: center; margin-top: 2rem;';
  
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker, startIndex);
  
  let homepageUpdated = false;

  if (startIndex !== -1 && endIndex !== -1) {
    // Generate HTML
    const eventsHTML = generateEventHTML(events);
    const before = html.substring(0, startIndex + startMarker.length);
    const after = html.substring(endIndex);

    const newHTML = before + '\n' + eventsHTML + '\n      ' + after;

    // Update timestamp and note
    let updatedHTML = newHTML.replace(
      /Updated .*? \•/,
      `Updated ${timestamp} (twice-daily feed) •`
    );

    // Update note about bookmakers
    updatedHTML = updatedHTML.replace(
      /Odds indicative only/,
      'Odds feed prioritizes available SA prices and exchange reference data'
    );

    // Write back
    fs.writeFileSync(indexPath, updatedHTML);
    homepageUpdated = true;
  } else {
    console.warn('⚠️  Legacy homepage events section not found; updating data feed only.');
  }
  
  // Save odds data for best-odds-finder
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const oddsData = {
    updated: new Date().toISOString(),
    updatedDisplay: timestamp,
    matches: finderMatches
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'live-odds.json'),
    JSON.stringify(oddsData, null, 2)
  );

  updateOddsHistory(oddsData.matches);
  updateBestOddsFinderPage(oddsData);
  
  if (homepageUpdated) {
    console.log('✅ Homepage updated with live odds!');
  }
  console.log('✅ Best Odds Finder data saved to data/live-odds.json');
  console.log(`\nHomepage Events:`);
  events.forEach(e => {
    console.log(`  • ${e.awayTeam} vs ${e.homeTeam} - Best: ${e.bestOdds.bookmaker} ${e.bestOdds.odds.toFixed(2)}`);
  });
}

main().catch(console.error);
