#!/bin/bash
# Quick launcher for BetSorted Kanban Board
# Usage: ./open-kanban.sh

cd "$(dirname "$0")"

# Start static server for kanban UI
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ UI server already running on port 8765"
else
    echo "🚀 Starting UI server on port 8765..."
    python3 -m http.server 8765 > /tmp/betsorted-server.log 2>&1 &
    echo $! > /tmp/betsorted-server.pid
    sleep 1
fi

# Start open-path helper server
if lsof -Pi :8766 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Open-path server already running on port 8766"
else
    echo "🚀 Starting open-path server on port 8766..."
    ./open-path-server.py > /tmp/betsorted-openpath.log 2>&1 &
    echo $! > /tmp/betsorted-openpath.pid
    sleep 1
fi

echo "🌐 Opening kanban board..."
open http://localhost:8765/private/kanban.html

echo ""
echo "✅ Kanban board opened!"
echo "💡 To stop servers later:" 
echo "   kill \$(cat /tmp/betsorted-server.pid)" 
echo "   kill \$(cat /tmp/betsorted-openpath.pid)"
