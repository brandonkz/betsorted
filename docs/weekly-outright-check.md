# Weekly Outright Value Check

This routine is manual-entry only until each bookmaker confirms that automated collection is allowed. Do not use browser automation for bookmaker pages without written affiliate-manager or operator approval.

## Scope

Start with:

- Competitions: EPL title winner, UEFA Champions League winner
- Bookmakers: Betway, Hollywoodbets
- Reference data: local `data/polymarket.json` and `data/kalshi.json`

Do not expand the scope until the routine has run cleanly twice.

## Compliance Gate

Before each run:

1. Confirm the relevant operator terms still permit the planned access method.
2. Confirm the source page can be viewed normally without bypassing blocks.
3. Stop if a bookmaker blocks access or if terms prohibit automated access.
4. Record any affiliate-manager approval outside the dataset and keep it with the audit notes.

## Manual Reading Steps

For each market:

1. Read the current market probability from `data/polymarket.json` or `data/kalshi.json`.
2. Open the bookmaker outright page in a normal browser session.
3. Record the displayed outright price exactly as shown.
4. Save a screenshot under `audit/odds-evidence/YYYY-MM-DD/`.
5. Add a new bookmaker reading to `data/outrights.json` with:
   - `slug`
   - `name`
   - `odds`
   - `read_at`
   - `source_url`
   - `screenshot`
   - `review_url`
   - `affiliate_url`, when one exists in `data/bookmakers.json`
6. Leave a missing price empty. Do not estimate, interpolate, or carry forward a prior price.
7. Add any positive-edge finding to `flagged_gaps` with the date, market id, outcome, bookmaker slug, price, market probability, fair odds and edge.
8. Commit the data and screenshot evidence together.

## Data Shape

Each market should follow this shape:

```json
{
  "id": "epl-2026-27-winner",
  "competition": "Premier League",
  "question": "2026/27 title winner",
  "source": "polymarket",
  "source_url": "internal-reference-only",
  "outcomes": [
    {
      "name": "Arsenal",
      "market_probability": 0.36,
      "market_read_at": "2026-08-07T10:00:00Z",
      "bookmakers": [
        {
          "slug": "betway",
          "name": "Betway",
          "odds": 3.2,
          "read_at": "2026-08-07T10:14:00Z",
          "source_url": "https://www.betway.co.za/...",
          "screenshot": "audit/odds-evidence/2026-08-07/betway-epl-arsenal.png",
          "review_url": "/bookmakers/betway-review.html",
          "affiliate_url": "/go/betway.html"
        }
      ]
    }
  ]
}
```

## Maths

```text
fairOdds = 1 / marketProbability
edge = ((bookmakerOdds - fairOdds) / fairOdds) * 100
```

Positive edge means the bookmaker price is higher than the reference market's fair-odds estimate.

## Freshness

- Show every bookmaker `read_at` date.
- If a reading is more than 10 days old, the page must show a stale-data notice.
- If no reading exists, the page must say the price has not been read.

## Scorecard Log

Keep `flagged_gaps` append-only. It is the source for the public season-end scorecard and should contain only gaps that were actually shown by a recorded bookmaker price and reference probability at the same check.

```json
{
  "flagged_at": "2026-08-07T10:14:00Z",
  "market_id": "epl-2026-27-winner",
  "outcome": "Arsenal",
  "bookmaker": "betway",
  "bookmaker_odds": 3.2,
  "market_probability": 0.36,
  "fair_odds": 2.78,
  "edge": 15.2
}
```

## Stop Conditions

Stop and report if:

- A bookmaker's terms prohibit the planned access method.
- A site blocks access and a workaround is being considered.
- A reading lacks a source URL, timestamp, or screenshot.
- A price would need to be estimated or carried forward.
- The page would link out to Polymarket or Kalshi.
