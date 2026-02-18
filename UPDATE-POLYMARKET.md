# Update Polymarket Predictions

## Quick Update

To refresh Champions League predictions on the homepage:

```bash
cd /Users/brandonkatz/.openclaw/workspace/betsorted
node fetch-polymarket.js
```

This will:
- Fetch latest probabilities from Polymarket
- Save to `polymarket-predictions.json`
- Show current predictions in terminal

## Manual Homepage Update

After running the script, copy the data from terminal and update these numbers in `index.html` (search for "Polymarket Predictions Section"):

1. Arsenal percentage
2. Bayern Munich percentage  
3. PSG percentage
4. Barcelona percentage
5. Real Madrid percentage
6. Man City percentage
7. Total volume (in "$23M+" line)

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

## Notes

- Arsenal currently favorite at 19.5%
- Bayern Munich second at 16.5%
- PSG & Barcelona tied at 10.5%
- Data updates constantly as traders buy/sell
- Different from bookmaker odds (this is pure market belief)
