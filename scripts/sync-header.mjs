import fs from "node:fs";
import path from "node:path";

const siteRoot = process.cwd();
const partial = fs.readFileSync("templates/partials/header.html", "utf8").trim();
const cryptoBase = "https://cryptocasinosorted.com/";
const campaign = "crypto_crosspromo_aug_2026";

for (const file of htmlFiles(siteRoot)) {
  const relative = path.relative(siteRoot, file).replaceAll(path.sep, "/");
  if (shouldSkip(relative)) continue;

  let html = fs.readFileSync(file, "utf8");
  if (!/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) continue;

  const header = renderHeader(relative);
  if (/<header[\s\S]*?<\/header>/i.test(html)) {
    html = html.replace(/<header[\s\S]*?<\/header>/i, header);
  } else {
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n  ${header}`);
  }
  html = html
    .replace(/\n\s*<nav class="top-nav">[\s\S]*?<\/nav>\s*/gi, "\n")
    .replace(/\n\s*<nav>\s*<a href="\/" class="logo">🎯[\s\S]*?<\/nav>\s*/gi, "\n");

  fs.writeFileSync(file, html);
}

console.log("synced shared header partial");

function renderHeader(relative) {
  return partial.replace("{{CRYPTO_CASINOS_URL}}", cryptoUrl(relative));
}

function cryptoUrl(relative) {
  const params = new URLSearchParams({
    utm_source: "betsorted",
    utm_medium: "nav",
    utm_campaign: campaign,
    utm_content: `${pageType(relative)}_nav`,
  });
  return `${cryptoBase}?${params.toString().replaceAll("&", "&amp;")}`;
}

function pageType(relative) {
  if (relative === "index.html") return "homepage";
  if (relative.startsWith("blog/")) return "blog";
  if (relative.startsWith("bookmakers/") || relative === "bookmakers.html") return "bookmaker";
  if (relative.startsWith("calculators/") || /calculator|converter|tracker|comparison/.test(relative)) return "tool";
  if (relative.startsWith("guides/")) return "guide";
  if (/privacy|terms|contact|about|editorial|responsible/.test(relative)) return "policy";
  return "site";
}

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
