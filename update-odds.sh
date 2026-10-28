#!/bin/zsh
cd "$(dirname "$0")"  # legacy Mac script; superseded by .github/workflows/auto-odds.yml
node fetch-live-odds.js
git add index.html
git commit -m "Auto: Update live odds (morning)"
git push
