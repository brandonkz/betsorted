import fs from "node:fs";
import path from "node:path";

const siteRoot = process.cwd();
const siteUrl = "https://betsorted.co.za";
const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const operatorsByReviewUrl = new Map(operators.map((operator) => [operator.review_url, operator]));

const homeItemSlugs = [
  "betway",
  "hollywoodbets",
  "sportingbet",
  "10bet",
  "play-co-za",
  "world-sports-betting",
  "gbets",
  "sunbet",
];

const hubItemSlugs = [
  "betway",
  "hollywoodbets",
  "sportingbet",
  "supabets",
  "10bet",
  "play-co-za",
  "world-sports-betting",
  "easybet",
  "gbets",
  "sunbet",
  "bet-co-za",
  "betfred",
  "betolimp",
  "betshezi",
  "lottostar",
  "playabets",
  "yesplay",
];

const operatorsBySlug = new Map(operators.map((operator) => [operator.slug, operator]));

for (const file of htmlFiles(siteRoot)) {
  const relative = path.relative(siteRoot, file).replaceAll(path.sep, "/");
  let html = fs.readFileSync(file, "utf8");
  html = removeExistingItem10(html);
  if (relative.startsWith("go/") || relative.startsWith("private/") || !/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) {
    fs.writeFileSync(file, html);
    continue;
  }

  const pageUrl = `/${relative === "index.html" ? "" : relative}`;
  const title = extractTitle(html, relative);
  const breadcrumbs = breadcrumbItems(relative, title);
  const graph = structuredGraph(relative, pageUrl, title, breadcrumbs, html);
  if (!graph.length) continue;

  html = insertBreadcrumb(html, breadcrumbs);
  html = html.replace(
    /<\/head>/i,
    `${schemaBlock(graph)}\n</head>`,
  );
  fs.writeFileSync(file, html);
}

console.log("synced item 10 structured data");

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

function removeExistingItem10(html) {
  return html
    .replace(/\n?\s*<!-- Item 10 visible breadcrumbs -->[\s\S]*?<!-- \/Item 10 visible breadcrumbs -->\n?/g, "\n")
    .replace(/\n?\s*<!-- Item 10 structured data -->[\s\S]*?<!-- \/Item 10 structured data -->\n?/g, "\n");
}

function extractTitle(html, relative) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return cleanText(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return cleanText(title[1]).replace(/\s*\|\s*BetSorted.*$/, "");
  return relative.replace(/\.html$/, "").split("/").at(-1).replace(/-/g, " ");
}

function breadcrumbItems(relative, title) {
  const items = [{ name: "Home", url: "/" }];
  if (relative === "index.html") return items;
  if (relative === "bookmakers/index.html" || relative === "bookmakers.html") {
    items.push({ name: "Bookmakers", url: "/bookmakers/" });
    return items;
  }
  if (relative.startsWith("bookmakers/")) {
    items.push({ name: "Bookmakers", url: "/bookmakers/" });
    items.push({ name: title, url: `/${relative}` });
    return items;
  }
  if (relative === "blog/index.html" || relative === "blog.html") {
    items.push({ name: "Blog", url: "/blog/" });
    return items;
  }
  if (relative.startsWith("blog/")) {
    items.push({ name: "Blog", url: "/blog/" });
    items.push({ name: title, url: `/${relative}` });
    return items;
  }
  items.push({ name: title, url: `/${relative}` });
  return items;
}

function structuredGraph(relative, pageUrl, title, breadcrumbs, html) {
  const graph = [
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    },
  ];

  if (relative === "index.html") {
    graph.unshift(
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "BetSorted",
        url: `${siteUrl}/`,
        logo: `${siteUrl}/assets/logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "BetSorted",
        url: `${siteUrl}/`,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    );
    graph.push(itemList("Homepage Comparison", homeItemSlugs, `${siteUrl}/#comparison`));
  }

  if (relative === "bookmakers/index.html") {
    graph.push(itemList("Best Bookmakers South Africa", hubItemSlugs, `${siteUrl}/bookmakers/`));
  }

  const reviewOperator = operatorsByReviewUrl.get(pageUrl);
  if (reviewOperator && pageUrl.startsWith("/bookmakers/") && typeof reviewOperator.rating === "number") {
    graph.push({
      "@type": "Review",
      "@id": `${siteUrl}${pageUrl}#review`,
      name: `${reviewOperator.name} Review South Africa`,
      url: `${siteUrl}${pageUrl}`,
      itemReviewed: {
        "@type": "Organization",
        name: reviewOperator.name,
        url: `${siteUrl}${reviewOperator.review_url}`,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: reviewOperator.rating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewOperator.rating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
      },
      author: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
      dateModified: reviewOperator.last_reviewed,
    });
  }

  const faqs = extractFaqs(html);
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${siteUrl}${pageUrl}#faq`,
      mainEntity: faqs,
    });
  }

  return graph;
}

function itemList(name, slugs, id) {
  return {
    "@type": "ItemList",
    "@id": `${id}#itemlist`,
    name,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: slugs.map((slug, index) => {
      const operator = operatorsBySlug.get(slug);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: operator.name,
        url: `${siteUrl}${operator.review_url}`,
      };
    }),
  };
}

function extractFaqs(html) {
  const faqs = [];
  for (const match of html.matchAll(/<div class="faq-item">\s*<(?:div|p|h3) class="faq-question">([\s\S]*?)<\/(?:div|p|h3)>\s*<(?:div|p) class="faq-answer">([\s\S]*?)<\/(?:div|p)>\s*<\/div>/gi)) {
    faqs.push({
      "@type": "Question",
      name: cleanText(match[1]),
      acceptedAnswer: {
        "@type": "Answer",
        text: cleanText(match[2]),
      },
    });
  }
  if (faqs.length) return faqs;
  for (const match of html.matchAll(/<div class="faq-item">([\s\S]*?)<\/div>\s*<\/div>/gi)) {
    const block = match[1];
    const question = block.match(/<(?:h[23]|div)[^>]*class="[^"]*faq-question[^"]*"[^>]*>([\s\S]*?)<\/(?:h[23]|div)>/i)
      || block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    const answer = block.match(/<(?:p|div)[^>]*class="[^"]*faq-answer[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/i)
      || block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (!question || !answer) continue;
    faqs.push({
      "@type": "Question",
      name: cleanText(question[1]),
      acceptedAnswer: {
        "@type": "Answer",
        text: cleanText(answer[1]),
      },
    });
  }
  return faqs;
}

function insertBreadcrumb(html, breadcrumbs) {
  const nav = `\n  <!-- Item 10 visible breadcrumbs -->\n  <nav class="breadcrumbs" aria-label="Breadcrumb" style="max-width:1200px;margin:16px auto 0;padding:0 20px;font-size:0.875rem;color:#64748b;">${breadcrumbs.map((item, index) => {
    const isLast = index === breadcrumbs.length - 1;
    const label = escapeHtml(item.name);
    return isLast ? `<span aria-current="page">${label}</span>` : `<a href="${item.url}" style="color:#2563eb;text-decoration:none;">${label}</a><span aria-hidden="true"> / </span>`;
  }).join("")}</nav>\n  <!-- /Item 10 visible breadcrumbs -->\n`;
  if (/<\/header>/i.test(html)) return html.replace(/<\/header>/i, `</header>${nav}`);
  return html.replace(/<body([^>]*)>/i, `<body$1>${nav}`);
}

function schemaBlock(graph) {
  return `<!-- Item 10 structured data -->\n<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>\n<!-- /Item 10 structured data -->`;
}

function cleanText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
