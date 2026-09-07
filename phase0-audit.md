# Betsorted Phase 0 Audit

Date: 2026-09-07

## Scope

This audit covered every `.html` file in the repository, the full internal link graph, homepage comparison-table links, duplicate operator review URLs, canonicals, and `sitemap.xml`.

Generated audit artifacts:

- `audit/inventory.csv` — per-file inventory with path, live URL, title, H1, meta description, canonical, body word count, and sitemap presence
- `audit/internal-links.csv` — source page, target URL, and anchor text for every internal HTML link
- `audit/phase0-summary.json` — machine summary of crawl, sitemap, and page-shape checks

## Headline Findings

- Inventoried `479` HTML files in total.
- Counted `319` public non-stub HTML pages after excluding redirect stubs and internal helper/template pages.
- Recorded `10,625` internal HTML links.
- Homepage comparison-table links now resolve cleanly.
- Final crawl state: `0` broken internal links and `0` internal links pointing at redirect stubs.

## Duplicate Review Survivors

Semrush guidance for September 2026 said the ranking review URLs were on `/blog/`, so those ranking URLs were kept as the survivors. The duplicated `/bookmakers/...-review.html` pages were retired into redirect stubs and all internal links were repointed to the survivor URLs.

Survivor groups consolidated in this pass:

- `blog/10bet-review-south-africa-2026.html` survives over `bookmakers/10bet-review.html`
- `blog/bet-co-za-review-south-africa-2026.html` survives over `bookmakers/bet-co-za-review.html`
- `blog/betway-review-south-africa-2026.html` survives over `bookmakers/betway-review.html`
- `blog/easybet-review-south-africa-2026.html` survives over `bookmakers/easybet-review.html`
- `blog/gbets-review-south-africa-2026.html` survives over `bookmakers/gbets-review.html`
- `blog/hollywoodbets-review-south-africa-2026.html` survives over `bookmakers/hollywoodbets-review.html`
- `blog/playabets-review-south-africa-2026.html` survives over `bookmakers/playabets-review.html`
- `blog/sportingbet-review-south-africa-2026.html` survives over `bookmakers/sportingbet-review.html`
- `blog/sunbet-review-south-africa-2026.html` survives over `bookmakers/sunbet-review.html`
- `blog/supabets-review-south-africa-2026.html` survives over `bookmakers/supabets-review.html`
- `blog/wsb-review-south-africa-2026.html` survives over `bookmakers/world-sports-betting-review.html`

Legacy alias wrappers such as `bookmakers/betway.html`, `bookmakers/gbets.html`, `bookmakers/wsb.html`, and the other operator alias pages were also normalized to point at the surviving review URLs instead of the retired `/bookmakers/...-review.html` pages.

## Self-Redirecting Hub Cause

The hub issue came from having two versions of the same page path:

- `bookmakers/index.html` is the real `/bookmakers/` hub
- `bookmakers.html` is a redirect wrapper that immediately forwards to `/bookmakers/`

The alias was also mirrored in `_redirects` and `data/redirects.json` as `/bookmakers.html -> /bookmakers/`. That meant the hub topic existed as both a live destination and a redirecting alias, which is why it surfaced as a self-redirect pattern in the earlier audit. Internal references are now standardized on `/bookmakers/`, and no internal links point at the wrapper.

## Cannibalisation

Confirmed and adjusted:

- Winner: `/odds-comparison.html` keeps the `hollywoodbets vs betway` intent
- Weaker page: `/blog/betway-vs-hollywoodbets.html` keeps the Betway-first phrasing, links to the winner using a `Hollywoodbets vs Betway odds comparison` anchor, and had a malformed head fragment removed during cleanup

## Canonicals and Sitemap

- `sitemap.xml` was regenerated from the public non-stub page set.
- Final sitemap state: exact match with the live public page set.
- Redirect stubs are excluded from the sitemap.
- `https://betsorted.co.za/` is used instead of `https://betsorted.co.za/index.html`.
- The Google verification page was added to the sitemap because it is a live public HTML file.

Public canonical status after this pass:

- No public content page is missing a canonical.
- Remaining missing-canonical files are non-public helper/template files plus the Google verification file.

## Orphans and Exceptions

All human-facing orphan pages found in the first pass were given contextual inbound links. Two exceptions remain:

- `brand-facts.html` — machine-style brand reference page, intentionally not featured in editorial navigation
- `googlec67d6ac07bc0a2df.html` — Google verification file

Dead-end exception:

- `googlec67d6ac07bc0a2df.html`

## Broken-Link and Content-Gap Notes

- Removed the broken internal link from `brand-facts.html` to `/.well-known/brand-facts.json` because no such file exists in the repo.
- Repointed `blog/crypto-casino-rewards-south-africa-2026.html` away from the `bonus-value-calculator.html` redirect stub to the live `reward-calculator.html` page.

## Verification Snapshot

Verified locally before push:

- `node tests/assert-canonical-reviews.mjs`
- `node tests/assert-go-links.mjs`
- `node tests/assert-bookmakers-hub.mjs`
- `node tests/assert-internal-links.mjs`
- `npm test`
- `git diff --check`

Final structural verification state:

- Zero broken internal links
- Zero self-redirect targets in internal links
- One canonical review URL per consolidated operator
- No internal link points at a redirect stub
- Sitemap matches the public live page set exactly
- Orphans reduced to the two explicit machine/helper exceptions above
