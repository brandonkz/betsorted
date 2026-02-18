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
const API_KEY = process.env.ODDS_API_KEY || 'bb71cc0232a79874fc3014da54a71104';

const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

// SA-relevant sports (prioritized order)
const SPORTS = [
  'soccer_epl', // Premier League (most popular in SA)
  'soccer_uefa_champs_league', // Champions League (popular in SA)
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
  homeOdds.sort((a, b) => {
    // Betway always first if available
    if (a.isBetway && !b.isBetway) return -1;
    if (!a.isBetway && b.isBetway) return 1;
    // Otherwise sort by odds
    return b.odds - a.odds;
  });
  
  if (homeOdds.length < 2) return null;
  
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
    bestOdds: homeOdds[0],
    secondOdds: homeOdds[1]
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
          url: bookmaker.key.toLowerCase().includes('betway') ? 'https://betway.co.za' : '#'
        });
      }
    }
  }
  
  if (bookmakers.length < 2) return null;
  
  // Get sport emoji and type
  let emoji = '⚽';
  let sportKey = 'soccer';
  let league = 'Soccer';
  
  if (game.sport_key.includes('soccer_epl')) {
    league = 'Premier League';
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
    datetime: game.commence_time,
    bookmakers: bookmakers.sort((a, b) => b.odds - a.odds).slice(0, 5) // Top 5 bookmakers only
  };
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
  
  // Format and filter games for homepage (top 3)
  const events = allGames
    .map(formatEvent)
    .filter(e => e !== null)
    .slice(0, 3);
  
  // Format ALL games for best-odds-finder
  const finderMatches = allGames
    .map(formatMatchForFinder)
    .filter(m => m !== null);
  
  if (events.length === 0) {
    console.log('⚠️  No games with odds found. Keeping existing events.');
    return;
  }
  
  console.log(`📊 Selected ${events.length} events for homepage`);
  console.log(`📊 Prepared ${finderMatches.length} matches for Best Odds Finder\n`);
  
  // Generate HTML
  const eventsHTML = generateEventHTML(events);
  
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
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('✗ Could not find events section in index.html');
    return;
  }
  
  const before = html.substring(0, startIndex + startMarker.length);
  const after = html.substring(endIndex);
  
  const newHTML = before + '\n' + eventsHTML + '\n      ' + after;
  
  // Update timestamp and note
  let updatedHTML = newHTML.replace(
    /Updated .*? \•/,
    `Updated ${timestamp} (live) •`
  );
  
  // Update note about bookmakers
  updatedHTML = updatedHTML.replace(
    /Odds indicative only/,
    'Live odds prioritize Betway 🇿🇦 + international bookmakers'
  );
  
  // Write back
  fs.writeFileSync(indexPath, updatedHTML);
  
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
  
  console.log('✅ Homepage updated with live odds!');
  console.log('✅ Best Odds Finder data saved to data/live-odds.json');
  console.log(`\nHomepage Events:`);
  events.forEach(e => {
    console.log(`  • ${e.awayTeam} vs ${e.homeTeam} - Best: ${e.bestOdds.bookmaker} ${e.bestOdds.odds.toFixed(2)}`);
  });
}

main().catch(console.error);
