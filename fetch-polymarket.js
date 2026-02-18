#!/usr/bin/env node

/**
 * Fetch Champions League winner predictions from Polymarket
 * Free API, no authentication needed
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://gamma-api.polymarket.com';

async function fetchChampionsLeagueWinner() {
  console.log('🔮 Fetching Polymarket predictions for Champions League winner...\n');
  
  // Fetch the UEFA Champions League Winner event
  const url = `${API_BASE}/events?slug=uefa-champions-league-winner`;
  
  try {
    const response = await fetch(url);
    const events = await response.json();
    
    if (!events || events.length === 0) {
      console.log('No event found');
      return null;
    }
    
    const event = events[0];
    const markets = event.markets || [];
    
    console.log(`Found ${markets.length} team markets\n`);
    
    // Filter for active, non-closed markets and extract team probabilities
    const teams = markets
      .filter(m => m.active && !m.closed)
      .map(m => {
        // Parse outcomePrices - it's a JSON string
        const prices = JSON.parse(m.outcomePrices);
        const probability = parseFloat(prices[0]) * 100; // Yes outcome
        
        return {
          team: m.groupItemTitle || m.question.replace('Will ', '').replace(' win the 2025–26 Champions League?', ''),
          probability,
          volume: parseFloat(m.volume),
          lastPrice: parseFloat(m.lastTradePrice || 0)
        };
      })
      .filter(t => t.probability > 0 && !t.team.startsWith('Team ')) // Only real teams with non-zero chance
      .sort((a, b) => b.probability - a.probability) // Sort by probability
      .slice(0, 10); // Top 10
    
    const totalVolume = teams.reduce((sum, t) => sum + t.volume, 0);
    
    return {
      teams,
      totalVolume,
      updatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  const data = await fetchChampionsLeagueWinner();
  
  if (!data) {
    console.log('Failed to fetch data');
    return;
  }
  
  console.log('🏆 Champions League Winner - Polymarket Predictions\n');
  console.log(`Total volume: $${(data.totalVolume / 1000000).toFixed(1)}M\n`);
  
  data.teams.forEach((team, i) => {
    console.log(`${i + 1}. ${team.team.padEnd(20)} ${team.probability.toFixed(1)}% chance`);
  });
  
  // Save to JSON for homepage integration
  const outputPath = path.join(__dirname, 'polymarket-predictions.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Saved to ${outputPath}`);
}

main().catch(console.error);
