# How to Update "Big SA Sports This Week" Feed

**When:** Every Monday, 10 AM (10 min task)

---

## Step 1: Find Big Matches (5 min)

### PSL (Soccer)
- Go to: https://www.psl.co.za/fixtures
- Pick 1 big upcoming match (Pirates, Chiefs, Sundowns)
- Note: Teams, date, time, venue

### Rugby
- Go to: https://www.sarugby.co.za/ or check URC fixtures
- Pick 1 big upcoming match (Stormers, Bulls, Sharks, Lions)
- Note: Teams, date, time, venue

### Cricket
- Go to: https://www.cricket.co.za/fixtures
- Pick 1 upcoming match (Proteas, SA20, domestic)
- Note: Teams, date, time, venue

---

## Step 2: Get Odds (3 min)

For each match, check these bookmakers:
- **Betway:** https://betway.co.za/
- **Hollywoodbets:** https://hollywoodbets.net/
- **Sportingbet:** https://sportingbet.co.za/
- **Supabets:** https://supabets.co.za/

**What to look for:**
- Home team to win (or favorite)
- Get decimal odds (e.g., 2.10, 1.95)
- Note which has highest odds

---

## Step 3: Update index.html (2 min)

Open: `/Users/brandonkatz/.openclaw/workspace/betsorted/index.html`

Find: `<!-- Big Events This Week Section -->`

Update 3 event cards:

### Event Card Template:
```html
<div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.1);">
  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
    <span style="font-size: 1.5rem;">⚽</span> <!-- ⚽ PSL, 🏉 Rugby, 🏏 Cricket -->
    <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 600;">PSL</span> <!-- PSL, URC, T20, etc. -->
  </div>
  <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">
    [Team 1] vs [Team 2]
  </h3>
  <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1rem;">
    [Day] Feb [Date], [Time] • [Venue]
  </p>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
    <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">[Bookmaker with BEST odds]</span>
    <span style="color: #10b981; font-weight: 700;">[odds] ✓ Best</span>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 1rem;">
    <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">[Second bookmaker]</span>
    <span style="color: white; font-weight: 700;">[odds]</span>
  </div>
  <a href="/odds-comparison.html" style="display: block; width: 100%; background: #2563eb; color: white; text-align: center; padding: 0.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Compare All Odds →
  </a>
</div>
```

### Update the "Updated" timestamp at bottom:
```html
<p style="text-align: center; margin-top: 2rem; color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;">
  Updated Mon Feb [DATE] • Odds indicative only • <a href="/odds-comparison.html" style="color: #60a5fa;">Use calculator for live comparison</a>
</p>
```

---

## Step 4: Deploy

```bash
cd /Users/brandonkatz/.openclaw/workspace/betsorted
git add index.html
git commit -m "Update: Big SA Sports events for week of Feb [DATE]"
git push
```

Live in 1-2 minutes.

---

## Example Matches to Watch For:

**PSL (Saturdays/Sundays):**
- Pirates vs Sundowns (always big)
- Chiefs vs any top 4
- Sundowns vs anyone

**Rugby (Saturdays):**
- Any SA derby (Stormers vs Bulls, etc.)
- URC: SA teams vs European teams
- Currie Cup finals

**Cricket (Varies):**
- Proteas test/ODI/T20 matches
- SA20 playoffs
- Big domestic games

---

## Tips:

1. **Pick crowd-pleasers:** Pirates vs Sundowns > AmaZulu vs Chippa
2. **Spread sports:** 1 soccer, 1 rugby, 1 cricket (variety)
3. **Check dates:** Don't add match that already happened
4. **Verify odds:** Double-check you got the right market (home win, not draw)
5. **Keep it simple:** Just need 2 bookmaker odds per match

---

## Quick Reference URLs:

**Fixtures:**
- PSL: https://www.psl.co.za/fixtures
- Rugby: https://www.sarugby.co.za/
- Cricket: https://www.cricket.co.za/fixtures

**Bookmakers:**
- Betway: https://betway.co.za/
- Hollywoodbets: https://hollywoodbets.net/
- Sportingbet: https://sportingbet.co.za/
- Supabets: https://supabets.co.za/

---

**Total time:** 10 minutes every Monday. Keeps homepage fresh and drives engagement.
