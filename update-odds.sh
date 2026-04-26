#!/bin/zsh
cd /Users/brandonkatz/.openclaw/workspace/betsorted
node fetch-live-odds.js
git add index.html
git commit -m "Auto: Update live odds (morning)"
git push
