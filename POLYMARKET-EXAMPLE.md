# Polymarket + Odds Comparison Example

## How to Compare Polymarket vs Traditional Bookies

### Step 1: Get Polymarket Data

```bash
cd /Users/brandonkatz/.openclaw/workspace/betsorted
node fetch-polymarket.js
```

**Output:**
```
🏆 Champions League Winner - Polymarket Predictions

1. Arsenal              19.5% chance
2. Bayern Munich        16.5% chance
3. PSG                  10.5% chance
4. Barcelona            10.5% chance
5. Real Madrid          9.5% chance
6. Man City             9.5% chance
```

### Step 2: Convert Probability to Odds

**Formula:** `1 ÷ probability = decimal odds`

| Team | Polymarket Probability | Decimal Odds | Calculation |
|------|------------------------|--------------|-------------|
| Arsenal | 19.5% | 5.13 | 1 ÷ 0.195 |
| Bayern Munich | 16.5% | 6.06 | 1 ÷ 0.165 |
| PSG | 10.5% | 9.52 | 1 ÷ 0.105 |
| Barcelona | 10.5% | 9.52 | 1 ÷ 0.105 |
| Real Madrid | 9.5% | 10.53 | 1 ÷ 0.095 |
| Man City | 9.5% | 10.53 | 1 ÷ 0.095 |

### Step 3: Compare on BetSorted

Go to: **betsorted.co.za/odds-comparison.html**

**Add bookmakers:**
1. **Polymarket** - Enter 5.13 (Arsenal implied odds)
2. **Betway** - Enter their Champions League winner odds for Arsenal
3. **Hollywoodbets** - Enter their odds
4. **Sportingbet** - Enter their odds

**Click Compare Odds**

### Step 4: Interpret Results

**Scenario A: Bookies offer better odds**
- Polymarket: 5.13 odds (19.5% probability)
- Betway: 6.50 odds
- **Result:** Betway offers 27% better odds than market consensus! 🎯

**Scenario B: Polymarket more optimistic**
- Polymarket: 5.13 odds (19.5% probability)
- Betway: 4.50 odds
- **Result:** Market thinks Arsenal has better chance than bookies do

## Why This Matters

**Prediction markets** (Polymarket) reflect what thousands of traders actually believe.

**Traditional bookmakers** build in margins and try to balance their books.

**When they disagree** = potential value opportunities!

## Example Tweet

"Polymarket traders give Arsenal 19.5% chance to win Champions League (5.13 odds).

Traditional bookies offering 6.50.

That's a 27% difference.

Either the bookies are generous or the market is wrong. 🤔

Compare: betsorted.co.za/odds-comparison.html"

## Use Cases

✅ **Find value bets:** When bookies offer higher odds than market consensus
✅ **Gauge true probability:** Prediction markets often more accurate than bookies
✅ **Twitter content:** "Bookies vs Prediction Market" comparisons
✅ **Contrarian plays:** When huge disconnect exists

## Notes

- Polymarket probabilities don't include bookmaker margins
- Traditional bookies odds already have ~5-10% margin built in
- Polymarket requires crypto (USDC) - not for casual SA punters
- Use it for reference, not direct betting (most SA users)
