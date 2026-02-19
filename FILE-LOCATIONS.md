# BetSorted File Locations Guide

All files I create, download, or modify are saved in two main locations:

## 📁 Primary Locations

### 1. Workspace (Technical Files)
**Path:** `/Users/brandonkatz/.openclaw/workspace/betsorted/`

This is where the **live website files** live:
- `index.html` - Homepage
- `data/sites.json` - Bookmaker database
- `data/bookmakers.csv` - Bookmaker CSV data
- `data/live-odds.json` - Live odds data
- `bookmakers/` - Review pages (e.g., `play-co-za-review.html`)
- `blog/` - Blog posts
- `private/` - Kanban board and private files
- `scripts/` - Automation scripts
- `*.js` - JavaScript files (e.g., `fetch-live-odds.js`)

**Quick Open:** Open Finder → Press `Cmd+Shift+G` → Paste: `/Users/brandonkatz/.openclaw/workspace/betsorted/`

---

### 2. Documents (Content & Strategy)
**Path:** `/Users/brandonkatz/Documents/BetSorted/`

This is where **content planning and strategy** files are saved:
- `tweets/` - Twitter content drafts
- `social-media/` - Instagram, Facebook, LinkedIn, Reddit posts
- `content/` - Blog article drafts
- `analytics/` - Performance reports, traffic data
- `strategy/` - Affiliate applications, marketing plans

**Quick Open:** Open Finder → Press `Cmd+Shift+G` → Paste: `/Users/brandonkatz/Documents/BetSorted/`

---

## 🔗 Kanban Board Quick Access

The updated kanban board now includes:
- **Quick Access bar** at the top - click any button to copy the folder path
- **File links** on every card showing where content is saved
- **Copy-to-clipboard** for all local paths (📁 icon)
- **Clickable links** for web pages (🔗 icon)

**How to use:**
1. Open kanban: `/Users/brandonkatz/.openclaw/workspace/betsorted/private/kanban.html`
2. Click any 📁 folder button to copy its path
3. Open Finder and press `Cmd+Shift+G`
4. Paste the path and press Enter
5. The folder opens instantly!

**Why not direct links?** Browsers block `file://` links for security. Copy-paste is the workaround.

### Quick Visual Guide:
```
Kanban Board           Your Action              Result
───────────────────────────────────────────────────────
[📁 workspace] click  →  Path copied!         →  ✓ Copied!
                         (green feedback)
                              ↓
Open Finder              Press Cmd+Shift+G     →  "Go to Folder" dialog
                              ↓
Paste (Cmd+V)            Press Enter           →  Folder opens!
```

---

## 📄 Common File Types & Locations

| What I Create | Where It Goes |
|--------------|---------------|
| Website pages (HTML) | `~/.openclaw/workspace/betsorted/` |
| Bookmaker reviews | `~/.openclaw/workspace/betsorted/bookmakers/` |
| Blog posts | `~/.openclaw/workspace/betsorted/blog/` |
| Data files (JSON/CSV) | `~/.openclaw/workspace/betsorted/data/` |
| Tweet drafts | `~/Documents/BetSorted/tweets/` |
| Social media content | `~/Documents/BetSorted/social-media/` |
| Analytics reports | `~/Documents/BetSorted/analytics/` |
| Affiliate docs | `~/Documents/BetSorted/strategy/` |

---

## 🚀 How Deployment Works

1. I create/modify files in `~/.openclaw/workspace/betsorted/`
2. I commit changes to Git
3. I push to GitHub (`brandonkz/betsorted`)
4. GitHub Pages auto-deploys to https://betsorted.co.za (1-2 minutes)

**Result:** Local files → GitHub → Live website

---

## 💡 Pro Tips

1. **Bookmark these folders** in Finder for quick access
2. **Kanban board** is your control center - open it to see all links
3. **file:// links** in the kanban will open local files directly from your browser
4. When I say "saved to X", you can find it in one of these two main folders

---

**Questions?** Just ask me "Where did you save [thing]?" and I'll give you the exact path!
