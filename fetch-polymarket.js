#!/usr/bin/env node

/**
 * Fetch Champions League winner predictions from Polymarket
 * Free API, no authentication needed
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://gamma-api.polymarket.com';

async function fetchMarket(slug, displayName, questionPattern) {
  console.log(`🔮 Fetching ${displayName}...\n`);
  
  const url = `${API_BASE}/events?slug=${slug}`;
  
  try {
    const response = await fetch(url);
    const events = await response.json();
    
    if (!events || events.length === 0) {
      console.log(`No ${displayName} event found`);
      return null;
    }
    
    const event = events[0];
    const markets = event.markets || [];
    
    console.log(`Found ${markets.length} markets\n`);
    
    // Filter for active, non-closed markets and extract probabilities
    const teams = markets
      .filter(m => m.active && !m.closed)
      .map(m => {
        // Parse outcomePrices - it's a JSON string
        const prices = JSON.parse(m.outcomePrices);
        const probability = parseFloat(prices[0]) * 100; // Yes outcome
        
        // Clean up team name
        let team = m.groupItemTitle || m.question;
        if (questionPattern) {
          team = team.replace(questionPattern, '');
        }
        
        return {
          team,
          probability,
          volume: parseFloat(m.volume),
          lastPrice: parseFloat(m.lastTradePrice || 0),
          odds: probability > 0 ? (1 / (probability / 100)).toFixed(2) : 0
        };
      })
      .filter(t => t.probability > 0 && !t.team.startsWith('Team ')) // Only real teams with non-zero chance
      .sort((a, b) => b.probability - a.probability) // Sort by probability
      .slice(0, 10); // Top 10
    
    const totalVolume = teams.reduce((sum, t) => sum + t.volume, 0);
    
    return {
      name: displayName,
      slug,
      teams,
      totalVolume,
      updatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error fetching ${displayName}:`, error.message);
    return null;
  }
}

async function fetchChampionsLeagueWinner() {
  return fetchMarket(
    'uefa-champions-league-winner',
    'Champions League Winner',
    /Will |win the 2025–26 Champions League\?/g
  );
}

async function fetchPremierLeagueWinner() {
  return fetchMarket(
    'english-premier-league-winner',
    'Premier League Winner',
    /Will | win the 2025\/26 Premier League\?/g
  );
}

async function main() {
  console.log('📊 Fetching Polymarket predictions...\n');
  
  // Fetch multiple markets
  const [championsLeague, premierLeague] = await Promise.all([
    fetchChampionsLeagueWinner(),
    fetchPremierLeagueWinner()
  ]);
  
  const allMarkets = { markets: [] };
  
  // Champions League
  if (championsLeague) {
    console.log(`\n🏆 ${championsLeague.name}\n`);
    console.log(`Total volume: $${(championsLeague.totalVolume / 1000000).toFixed(1)}M\n`);
    championsLeague.teams.slice(0, 5).forEach((team, i) => {
      console.log(`${i + 1}. ${team.team.padEnd(20)} ${team.probability.toFixed(1)}% (${team.odds} odds)`);
    });
    allMarkets.markets.push(championsLeague);
  }
  
  // Premier League
  if (premierLeague) {
    console.log(`\n⚽ ${premierLeague.name}\n`);
    console.log(`Total volume: $${(premierLeague.totalVolume / 1000000).toFixed(1)}M\n`);
    premierLeague.teams.slice(0, 5).forEach((team, i) => {
      console.log(`${i + 1}. ${team.team.padEnd(20)} ${team.probability.toFixed(1)}% (${team.odds} odds)`);
    });
    allMarkets.markets.push(premierLeague);
  }
  
  // Save to JSON for homepage integration
  const outputPath = path.join(__dirname, 'polymarket-predictions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allMarkets, null, 2));
  
  console.log(`\n✅ Saved ${allMarkets.markets.length} markets to ${outputPath}`);
}

main().catch(console.error);
