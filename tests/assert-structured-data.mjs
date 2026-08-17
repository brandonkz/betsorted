import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const siteRoot = process.cwd();
const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const reviewUrls = operators
  .filter((operator) => operator.review_url.startsWith("/bookmakers/") && typeof operator.rating === "number")
  .map((operator) => operator.review_url.slice(1));

let checkedPages = 0;
let faqPages = 0;

for (const file of htmlFiles(siteRoot)) {
  const relative = path.relative(siteRoot, file).replaceAll(path.sep, "/");
  if (relative.startsWith("go/") || relative.startsWith("private/")) continue;
  const html = fs.readFileSync(file, "utf8");
  if (!/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) continue;
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(script[1]);
  }
  assert.ok(html.includes('class="breadcrumbs"'), `${relative} missing visible breadcrumbs`);
  assert.ok(html.includes("Item 10 structured data"), `${relative} missing item 10 structured data`);

  const item10 = html.match(/<!-- Item 10 structured data -->\s*<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(item10, `${relative} missing item 10 JSON-LD script`);
  const json = JSON.parse(item10[1]);
  const graph = json["@graph"] || [];
  assert.ok(graph.some((item) => item["@type"] === "BreadcrumbList"), `${relative} missing BreadcrumbList`);

  if (relative === "index.html") {
    assert.ok(graph.some((item) => item["@type"] === "Organization"), "homepage missing Organization");
    assert.ok(graph.some((item) => item["@type"] === "WebSite"), "homepage missing WebSite");
    assert.ok(graph.some((item) => item["@type"] === "ItemList"), "homepage missing comparison ItemList");
  }

  if (relative === "bookmakers/index.html") {
    assert.ok(graph.some((item) => item["@type"] === "ItemList"), "bookmakers hub missing ItemList");
  }

  if (reviewUrls.includes(relative)) {
    assert.ok(graph.some((item) => item["@type"] === "Review" && item.aggregateRating), `${relative} missing Review AggregateRating`);
  }

  if (html.includes('class="faq-section"')) {
    faqPages += 1;
    assert.ok(graph.some((item) => item["@type"] === "FAQPage"), `${relative} has FAQ block but no FAQPage`);
  }

  checkedPages += 1;
}

assert.ok(checkedPages > 0, "no pages checked");
assert.ok(faqPages > 0, "no FAQ pages checked");
console.log(`structured data assertion passed for ${checkedPages} pages and ${faqPages} FAQ pages`);

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
