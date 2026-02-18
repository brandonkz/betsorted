# Update Polymarket Predictions

## Quick Update

To refresh market predictions on the homepage:

```bash
cd /Users/brandonkatz/.openclaw/workspace/betsorted
node fetch-polymarket.js
```

This will:
- Fetch latest probabilities from Polymarket
- Pull Champions League Winner + Premier League Winner markets
- Save to `polymarket-predictions.json`
- Show current predictions in terminal

## Manual Homepage Update

After running the script, copy the data from terminal and update these numbers in `index.html` (search for "Market Predictions" section):

**Champions League Winner:**
1. Arsenal percentage + odds
2. Bayern Munich percentage + odds  
3. PSG percentage + odds
4. Total volume (in "$23M in bets" line)

**Premier League Winner:**
1. Arsenal percentage + odds
2. Man City percentage + odds
3. Aston Villa percentage + odds
4. Total volume (in "$99M in bets" line)

**Overall:**
- Update total across all markets (currently "$122M+")

## Automation (Optional)

To auto-update daily, add to cron or launchd:

```bash
# Run at 6 AM daily
0 6 * * * cd /Users/brandonkatz/.openclaw/workspace/betsorted && node fetch-polymarket.js
```

## API Info

- **Source**: Polymarket Gamma API (free, no auth)
- **Endpoint**: `https://gamma-api.polymarket.com/events?slug=uefa-champions-league-winner`
- **Rate Limit**: None (public endpoint)
- **Data**: Live predictions from crypto traders ($23M+ in bets)

## What It Shows

- **Top 6 teams** by probability
- **Live percentages** (what market thinks will happen)
- **Total betting volume** (shows market confidence)
- **Last updated timestamp**

## Current Markets

**Champions League Winner:**
- Arsenal: 19.5% (5.13 odds) - FAVORITE
- Bayern Munich: 16.5% (6.06 odds)
- PSG: 10.5% (9.52 odds)
- $23M in active bets

**Premier League Winner:**
- Arsenal: 68.5% (1.46 odds) - FAVORITE
- Man City: 28.5% (3.51 odds)
- Aston Villa: 0.95% (105.26 odds) - LONG SHOT
- $99M in active bets

## Notes

- Data updates constantly as traders buy/sell
- Different from bookmaker odds (this is pure market belief)
- Arsenal favorites for BOTH competitions
- Premier League has 4x more betting volume than Champions League
- Can easily add more markets (World Cup, Ballon d'Or, etc.)
