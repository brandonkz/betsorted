import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// A late-loaded tracker must observe links inserted after startup and leave
// default/new-tab navigation intact. Non-affiliate external links are excluded.
const events = [];
let click;
vm.runInNewContext(fs.readFileSync('assets/track-clicks.js', 'utf8'), {
  URL,
  window: { location: { href: 'https://betsorted.co.za/', origin: 'https://betsorted.co.za', pathname: '/' }, gtag: (...args) => events.push(args) },
  document: { readyState: 'complete', addEventListener: (name, handler) => { assert.equal(name, 'click'); click = handler; } }
});
function visit(href, attributes = {}, placement = 'comparison') {
  const link = {
    href,
    getAttribute: key => attributes[key] || null,
    matches: () => Boolean(attributes['data-bookmaker'] || attributes.sponsored),
    closest: selector => selector === '#comparison' && placement === 'comparison' ? {} : null,
  };
  let prevented = false;
  click({ target: { closest: () => link }, ctrlKey: true, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false, 'Tracking must not intercept navigation');
}
visit('https://betsorted.co.za/go/hollywoodbets.html?subid=home-table');
assert.equal(events.length, 1);
assert.equal(events[0][1], 'affiliate_click');
assert.equal(events[0][2].bookmaker_slug, 'hollywoodbets');
assert.equal(events[0][2].subid, 'home-table');
visit('https://example.com/reference');
assert.equal(events.length, 1, 'Editorial external links must not count as affiliate clicks');
visit('https://partner.example/offer', { 'data-bookmaker': 'partner', sponsored: true });
assert.equal(events.length, 2);

// The production renderer must produce valid tracked links after filtering,
// preserve the HTML fallback on a feed error and never call an unknown bonus free money.
const operators = JSON.parse(fs.readFileSync('data/operators.json', 'utf8'));
const sites = JSON.parse(fs.readFileSync('data/sites.json', 'utf8'));
const nodes = Object.fromEntries(['comparison-tbody', 'reviews-grid', 'comparison-status'].map(id => [id, { innerHTML: 'fallback', textContent: '' }]));
let init;
const context = vm.createContext({ console: { error() {} }, fetch: async () => ({ ok: true, json: async () => sites }), document: { getElementById: id => nodes[id], querySelectorAll: () => [], addEventListener: (_, handler) => { init = handler; } } });
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
await init();
assert.ok(nodes['comparison-tbody'].innerHTML.includes('?subid=home-table'));
assert.ok(nodes['comparison-tbody'].innerHTML.includes('rel="sponsored nofollow noopener"'));
assert.ok(!nodes['comparison-tbody'].innerHTML.includes('Free money'));
vm.runInContext("applyFilter('low-deposit')", context);
assert.ok(!nodes['comparison-tbody'].innerHTML.includes('<span class="bookmaker-name">10bet</span>'));
assert.ok(nodes['comparison-status'].textContent.includes('bookmakers shown'));
context.fetch = async () => { throw new Error('offline'); };
nodes['comparison-tbody'].innerHTML = 'fallback';
await init();
assert.equal(nodes['comparison-tbody'].innerHTML, 'fallback');
assert.ok(nodes['comparison-status'].textContent.includes('unavailable'));
for (const site of sites) {
  const op = operators.find(op => op.slug === site.slug);
  assert.equal(site.welcome_bonus, op.welcome_bonus);
  assert.equal(site.min_deposit, op.min_deposit_display);
  assert.equal(site.description, op.summary);
}
const home = fs.readFileSync('index.html', 'utf8');
assert.ok(home.indexOf('class="filters-section"') < home.indexOf('id="comparison"'));
assert.ok(!home.includes('XTP code CCS200'));
assert.ok(!home.includes('August betting focus'));
assert.ok(fs.existsSync('finder.html'));
console.log('Conversion regression checks passed: late/dynamic click tracking, navigation, filters, feed fallback and shared facts.');
