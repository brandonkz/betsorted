# Outright Collection Attempts - 2026-08-07

Browser control was permitted by the site owner for this run. Each bookmaker/market page was opened serially with Playwright. No prices were entered because no South African outright price page rendered.

## Reference Data

Read from `data/polymarket.json`, updated `2026-08-06T10:03:19.199Z`:

- EPL: `Arsenal`, probability `1`, fair decimal `1`
- UCL: `PSG`, probability `1`, fair decimal `1`

## Attempts

| Market | Bookmaker | Source URL opened | Result | Screenshot |
| --- | --- | --- | --- | --- |
| EPL title winner | Betway | `https://www.betway.co.za/sport/soccer` | HTTP 200, redirected to `https://betway.com/en-ca/`; no South African outright prices rendered. | `audit/odds-evidence/2026-08-07/betway-soccer-page.png` |
| UCL winner | Betway | `https://www.betway.co.za/sport/soccer/clubs/uefa_champions_league` | HTTP 200, redirected to `https://betway.com/en-ca/`; no South African outright prices rendered. | `audit/odds-evidence/2026-08-07/betway-ucl-headed-page.png` |
| EPL title winner | Hollywoodbets | `https://www.hollywoodbets.net/betting/1/soccer/all/248/england/3092452/premier-league` | HTTP 403 Cloudflare bot-verification page; no odds rendered. | `audit/odds-evidence/2026-08-07/hollywoodbets-premier-league-headed-page.png` |
| UCL winner | Hollywoodbets | `https://www.hollywoodbets.net/betting/1/soccer/all?countryId=617` | HTTP 403 Cloudflare bot-verification page; no odds rendered. | `audit/odds-evidence/2026-08-07/hollywoodbets-ucl-page.png` |

## Data Decision

`data/outrights.json` remains empty because every bookmaker reading would lack an actual price. The tracker stays excluded from `sitemap.xml` and `calculators.html` while `markets=0`.
