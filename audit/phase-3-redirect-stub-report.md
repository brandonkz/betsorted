# Phase 3 Redirect/Stub Report

Generated: 2026-08-06

## Scope

Implemented Phase 3 redirect/stub work only. Skipped bookmakers hub and homepage comparison table while Phase 2 affiliate-manager verification is in progress.

## Findings

- Redirect-style HTML stubs inventoried: 121
- Internal redirect stubs: 111
- Internal /go/ placeholders: 7
- External affiliate redirects: 3
- Stub URLs removed from sitemap.xml: 11
- Stub pages deleted: 0
- Stub URLs changed: 0

## Sitemap Cleanup

- /bookmakers.html -> /bookmakers/
- /bookmakers/10bet.html -> /blog/10bet-review-south-africa-2026.html
- /bookmakers/betway.html -> /blog/betway-review-south-africa-2026.html
- /bookmakers/easybet.html -> /blog/easybet-review-south-africa-2026.html
- /bookmakers/hollywoodbets.html -> /blog/hollywoodbets-review-south-africa-2026.html
- /bookmakers/playabets.html -> /blog/playabets-review-south-africa-2026.html
- /bookmakers/sportingbet.html -> /blog/sportingbet-review-south-africa-2026.html
- /bookmakers/sunbet.html -> /blog/sunbet-review-south-africa-2026.html
- /bookmakers/supabets.html -> /blog/supabets-review-south-africa-2026.html
- /bookmakers/world-sports-betting.html -> /blog/wsb-review-south-africa-2026.html
- /bookmakers/wsb.html -> /blog/wsb-review-south-africa-2026.html

## Deferred Due To File-Count Guardrail

A full internal-link retargeting pass from stubs to canonical URLs would touch 124 HTML files, so it was not executed in this phase. The redirect inventory in data/redirects.json records the map needed for a future approved broad pass.
