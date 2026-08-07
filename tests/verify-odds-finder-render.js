#!/usr/bin/env node

const fs = require('fs');
const vm = require('vm');

const BLOCKED_NAMES = /Bovada|LowVig|BetOnline/i;

function getPageScript(html) {
  const start = html.indexOf('  <script>\n    let currentFilter');
  const end = html.indexOf('  </script>', start);
  if (start === -1 || end === -1) {
    throw new Error('Best Odds Finder page script not found');
  }
  return html.slice(start + '  <script>\n'.length, end);
}

function createContext(feed) {
  const nodes = {
    'odds-status': {
      classList: { add() {}, remove() {}, toggle() {} },
      innerHTML: ''
    },
    'matches-container': {
      innerHTML: ''
    }
  };

  return {
    nodes,
    context: {
      console,
      Date,
      fetch: async () => ({
        ok: true,
        json: async () => feed
      }),
      document: {
        getElementById(id) {
          if (!nodes[id]) {
            nodes[id] = {
              classList: { add() {}, remove() {}, toggle() {} },
              innerHTML: '',
              style: {}
            };
          }
          return nodes[id];
        },
        querySelectorAll() {
          return [];
        },
        querySelector() {
          return { textContent: '' };
        }
      }
    }
  };
}

function ensureUnfilteredBlockedRows(feed) {
  const blockedRows = feed.matches.flatMap(match => match.bookmakers || [])
    .filter(book => ['bovada', 'lowvig', 'betonlineag'].includes(book.key));

  if (blockedRows.length > 0) return blockedRows.length;

  if (!feed.matches[0]) throw new Error('No match available for blocked-operator fixture');
  feed.matches[0].bookmakers.push(
    { name: 'Bovada', key: 'bovada', odds: 99, url: '#', isSouthAfrica: false },
    { name: 'LowVig.ag', key: 'lowvig', odds: 98, url: '#', isSouthAfrica: false },
    { name: 'BetOnline.ag', key: 'betonlineag', odds: 97, url: '#', isSouthAfrica: false }
  );
  return 3;
}

async function main() {
  const html = fs.readFileSync('best-odds-finder.html', 'utf8');
  const script = getPageScript(html);
  const feed = JSON.parse(fs.readFileSync('data/live-odds.json', 'utf8'));
  const blockedFixtureRows = ensureUnfilteredBlockedRows(feed);

  const { context, nodes } = createContext(feed);
  vm.createContext(context);
  vm.runInContext(script, context);
  await context.loadOddsData();

  const rendered = `${nodes['odds-status'].innerHTML}\n${nodes['matches-container'].innerHTML}`;
  if (BLOCKED_NAMES.test(rendered)) {
    throw new Error('Blocked offshore operator rendered in Best Odds Finder output');
  }

  console.log(`PASS blocked operator render filter rows=${blockedFixtureRows}`);
}

main().catch(error => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
