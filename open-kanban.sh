#!/bin/bash
# Quick launcher for BetSorted Kanban Board
# Usage: ./open-kanban.sh

cd "$(dirname "$0")"

# Check if server is already running
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Server already running on port 8765"
else
    echo "🚀 Starting local server on port 8765..."
    python3 -m http.server 8765 > /tmp/betsorted-server.log 2>&1 &
    echo $! > /tmp/betsorted-server.pid
    sleep 1
fi

echo "🌐 Opening kanban board..."
open http://localhost:8765/private/kanban.html

echo ""
echo "✅ Kanban board opened!"
echo "💡 To stop the server later, run: kill \$(cat /tmp/betsorted-server.pid)"
