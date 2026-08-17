import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const siteRoot = process.cwd();
const expectedNav = [
  "/#comparison",
  "/bookmakers/",
  "/glossary.html",
  "/calculators.html",
  "/blog/",
  "/psl-match-centre.html",
  "/prediction-markets.html",
];

let checked = 0;

for (const file of htmlFiles(siteRoot)) {
  const relative = path.relative(siteRoot, file).replaceAll(path.sep, "/");
  if (shouldSkip(relative)) continue;

  const html = fs.readFileSync(file, "utf8");
  if (!/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) continue;
  const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/i);
  assert.ok(header, `${relative} missing shared site header`);
  assert.ok(header[0].includes('<img src="/assets/logo.png" alt="BetSorted"'), `${relative} header must use image logo`);
  assert.ok(!header[0].includes("brand-icon"), `${relative} header still uses text/icon logo`);
  for (const href of expectedNav) assert.ok(header[0].includes(`href="${href}"`), `${relative} missing nav link ${href}`);
  assert.ok(header[0].includes("https://cryptocasinosorted.com/?utm_source=betsorted&amp;utm_medium=nav&amp;utm_campaign=crypto_crosspromo_aug_2026&amp;utm_content="), `${relative} missing full Crypto Casinos UTM link`);
  assert.ok(!header[0].includes('href="https://cryptocasinosorted.com"'), `${relative} has bare Crypto Casinos link`);
  assert.ok(!html.includes('<nav class="top-nav">'), `${relative} still has legacy top-nav`);
  assert.ok(!html.includes('class="logo">🎯'), `${relative} still has legacy text logo nav`);
  checked += 1;
}

assert.ok(checked > 0, "no headers checked");
for (const source of ["templates/bookmaker-review.html", "templates/bookmaker-sport.html", "templates/partials/header.html", "scripts/generate-bookmakers.js"]) {
  const content = fs.readFileSync(source, "utf8");
  assert.ok(content.includes("/assets/logo.png"), `${source} must use image logo`);
  assert.ok(!content.includes("brand-icon"), `${source} still uses legacy brand-icon`);
  assert.ok(!content.includes("https://cryptocasinosorted.com\""), `${source} has bare Crypto Casinos URL`);
  assert.ok(content.includes("utm_campaign=crypto_crosspromo_aug_2026") || content.includes("{{CRYPTO_CASINOS_URL}}"), `${source} missing Crypto Casinos UTM campaign`);
}
console.log(`header consistency assertion passed for ${checked} pages`);

function shouldSkip(relative) {
  return relative.startsWith("go/")
    || relative.startsWith("private/")
    || relative.startsWith("social-templates/")
    || relative.startsWith("tweets/")
    || relative === "googlec67d6ac07bc0a2df.html";
}

function htmlFiles(root) {
  const ignored = new Set([".git", "node_modules", "templates"]);
  const results = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) stack.push(fullPath);
      } else if (entry.name.endsWith(".html")) {
        results.push(fullPath);
      }
    }
  }
  return results;
}
