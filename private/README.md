# BetSorted Private Kanban Board

## Quick Start (Easiest Way)

```bash
cd ~/.openclaw/workspace/betsorted
./open-kanban.sh
```

This will:
1. Start a local web server (if not already running)
2. Open your kanban board in the browser
3. Copy buttons will work properly!

---

## Manual Access

### Option 1: Localhost (Recommended)
1. Start server: `cd ~/.openclaw/workspace/betsorted && python3 -m http.server 8765`
2. Open: http://localhost:8765/private/kanban.html
3. ✅ Copy buttons work!

### Option 2: Direct File (Fallback)
1. Open: `open ~/.openclaw/workspace/betsorted/private/kanban.html`
2. ⚠️ Copy buttons show popup modal (browsers block clipboard on file://)

---

## How to Use

### Quick Access Bar (Top)
Click any folder button:
- **On localhost:** Path copies to clipboard instantly → Cmd+Shift+G in Finder → Paste
- **On file://:** Modal popup shows → Select path → Copy → Cmd+Shift+G in Finder → Paste

### Card Links
- **📁 Folder icons:** Click to copy path (same as above)
- **🔗 Web links:** Click to open in new tab (always works)

---

## Troubleshooting

**"Copy button doesn't work"**
→ Use `./open-kanban.sh` or access via localhost URL

**"Can't open folders directly"**
→ Browsers block this for security. Use the copy → Cmd+Shift+G workflow

**"Server already running"**
→ That's fine! Just open http://localhost:8765/private/kanban.html

**"Want to stop the server"**
→ Run: `kill $(cat /tmp/betsorted-server.pid)`

---

## Files

- `board.json` - Kanban data (tasks, links, tweets)
- `kanban.html` - Visual board interface
- `../open-kanban.sh` - Quick launcher script
- `README.md` - This file

---

💡 **Pro Tip:** Bookmark http://localhost:8765/private/kanban.html for instant access!
