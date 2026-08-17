import fs from "node:fs";

const operators = JSON.parse(fs.readFileSync("data/operators.json", "utf8"));
const bySlug = new Map(operators.map((operator) => [operator.slug, operator]));

const homeSlugs = [
  "betway",
  "hollywoodbets",
  "sportingbet",
  "10bet",
  "play-co-za",
  "world-sports-betting",
  "gbets",
  "sunbet",
];

const hubSlugs = [
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

function operator(slug) {
  const value = bySlug.get(slug);
  if (!value) throw new Error(`Missing operator data for ${slug}`);
  return value;
}

function writeIfChanged(file, next) {
  const previous = fs.readFileSync(file, "utf8");
  if (previous !== next) fs.writeFileSync(file, next);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function todo(value) {
  return value === "TODO_VERIFY" || value === "TODO_AFFILIATE_URL" || value === "Coming soon" || value === null || value === undefined;
}

function display(value) {
  return todo(value) ? '<span class="todo-field">Coming soon</span>' : escapeHtml(value);
}

function ratingLabel(op) {
  if (todo(op.rating)) return '<span class="todo-field">Coming soon</span>';
  if (typeof op.rating === "string") return escapeHtml(op.rating);
  return `${op.rating.toFixed(1)} / 5`;
}

function ratingNumber(op) {
  return todo(op.rating) || typeof op.rating === "string" ? "Coming soon" : op.rating.toFixed(1);
}

function stars(op) {
  if (todo(op.rating) || typeof op.rating === "string") return "";
  return op.rating >= 4.5 ? "★★★★★" : "★★★★☆";
}

function dateLabel(date) {
  if (todo(date)) return "Coming soon";
  const [year, month, day] = date.split("-");
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${Number(day)} ${names[Number(month) - 1]} ${year}`;
}

function latestDate(slugs) {
  return slugs.map((slug) => operator(slug).last_reviewed).filter((date) => !todo(date)).sort().at(-1);
}

function goHref(op, subid) {
  return `${op.go_url}?subid=${subid}`;
}

function comparisonRow(slug) {
  const op = operator(slug);
  return `            <tr>
              <td data-label="Bookmaker"><div class="bookmaker-cell"><div class="bookmaker-logo" aria-hidden="true" style="background: ${op.logo_color};">${escapeHtml(op.name[0])}</div><span class="bookmaker-name">${escapeHtml(op.name)}</span></div></td>
              <td data-label="Rating"><div class="rating-stars">${stars(op)} <span class="rating-number">${escapeHtml(ratingNumber(op))}</span></div></td>
              <td data-label="Welcome Bonus"><div class="bonus-text"><strong>${display(op.welcome_bonus)}</strong></div></td>
              <td data-label="Min Deposit"><span class="deposit-amount">${display(op.min_deposit_display)}</span></td>
              <td data-label="What South Africans Say"><div style="font-size: 0.85rem; line-height: 1.5; color: #555;">${escapeHtml(op.community_quote)}</div></td>
              <td><div style="display:flex;flex-direction:column;gap:0.5rem;"><a href="${op.review_url}" class="btn btn-primary btn-sm" style="width: 100%;">Read review</a><a href="${goHref(op, "home-table")}" class="btn btn-primary btn-sm affiliate-link" data-bookmaker="${op.slug}" rel="sponsored noopener" style="width: 100%;">Open ${escapeHtml(op.name)}</a></div></td>
            </tr>`;
}

function reviewCard(slug) {
  const op = operator(slug);
  const payments = op.payment_methods.length ? op.payment_methods.join(", ") : "Coming soon";
  const cta = todo(op.affiliate_url)
    ? `<a href="${op.review_url}" class="btn btn-primary">Read ${escapeHtml(op.name)} review</a>`
    : `<a href="${goHref(op, "home-table")}" class="btn btn-primary affiliate-link" data-bookmaker="${op.slug}" rel="sponsored noopener">Join ${escapeHtml(op.name)}</a>`;

  return `        <article class="review-card" data-operator="${op.slug}">
          <div class="review-header">
            <div class="review-header-left">
              <div class="review-logo" aria-hidden="true" style="background: ${op.logo_color};">${escapeHtml(op.name[0])}</div>
              <div class="review-title-group"><h3>${escapeHtml(op.name)}</h3><div class="review-meta"><div class="rating-stars">${stars(op)} <span class="rating-number">${escapeHtml(ratingNumber(op))}/5</span></div><span>Est. ${display(op.established)}</span></div></div>
            </div>
          </div>
          <div class="review-body"><p class="review-description">${escapeHtml(op.summary)}</p><p><strong>Bonus:</strong> ${display(op.welcome_bonus)} · <strong>Min deposit:</strong> ${display(op.min_deposit_display)}</p><p><strong>Payments:</strong> ${display(payments)}</p></div>
          <div class="review-footer">${cta}</div>
        </article>`;
}

function syncHomepage() {
  const file = "index.html";
  let html = fs.readFileSync(file, "utf8");
  const updated = latestDate(homeSlugs);
  html = html.replace(/Updated \d{4}-\d{2}-\d{2}/, `Updated ${updated}`);
  html = html.replace(
    /<tbody id="comparison-tbody">[\s\S]*?          <\/tbody>/,
    `<tbody id="comparison-tbody">\n${homeSlugs.map(comparisonRow).join("\n")}\n          </tbody>`,
  );
  html = html.replace(
    /<div class="reviews-grid" id="reviews-grid">[\s\S]*?      <\/div>\n    <\/div>\n  <\/section>/,
    `<div class="reviews-grid" id="reviews-grid">\n${homeSlugs.map(reviewCard).join("\n")}\n      </div>\n    </div>\n  </section>`,
  );
  writeIfChanged(file, html);
}

function hubCard(slug) {
  const op = operator(slug);
  return `      <article class="bookmaker-card" data-operator="${op.slug}">
        <h2>${escapeHtml(op.name)}</h2>
        <div class="rating-line">${ratingLabel(op)}</div>
        <dl class="bookmaker-details">
          <div><dt>Welcome Bonus</dt><dd>${display(op.welcome_bonus)}</dd></div>
          <div><dt>Min Deposit</dt><dd>${display(op.min_deposit_display)}</dd></div>
          <div><dt>Licence Authority</dt><dd>${display(op.licence_authority)}</dd></div>
        </dl>
        <div class="hub-actions"><a class="review-link" href="${op.review_url}">Read review</a><a class="go-link affiliate-link" href="${goHref(op, "post-bookmakers-hub")}" data-bookmaker="${op.slug}" rel="sponsored noopener">Open ${escapeHtml(op.name)}</a></div>
      </article>`;
}

function hubTableRow(slug) {
  const op = operator(slug);
  return `          <tr data-operator="${op.slug}"><td>${escapeHtml(op.name)}</td><td>${ratingLabel(op)}</td><td>${display(op.welcome_bonus)}</td><td>${display(op.min_deposit_display)}</td><td>${display(op.licence_authority)}</td><td><a href="${op.review_url}">Review</a> · <a href="${goHref(op, "post-bookmakers-hub")}" rel="sponsored noopener">Open</a></td></tr>`;
}

function syncHub() {
  const file = "bookmakers/index.html";
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(
    /<section class="bookmaker-grid" aria-label="Reviewed bookmaker cards">[\s\S]*?    <\/section>/,
    `<section class="bookmaker-grid" aria-label="Reviewed bookmaker cards">\n${hubSlugs.map(hubCard).join("\n")}\n    </section>`,
  );
  html = html.replace(
    /<tbody>[\s\S]*?        <\/tbody>/,
    `<tbody>\n${hubSlugs.map(hubTableRow).join("\n")}\n        </tbody>`,
  );
  writeIfChanged(file, html);
}

function syncReviewJsonLd(op, html) {
  if (!todo(op.rating) && typeof op.rating === "number") {
    html = html.replace(/"ratingValue":\s*"[^"]+"/g, `"ratingValue": "${op.rating.toFixed(1)}"`);
    if (html.includes('"@type": "Review"') && !html.includes('"aggregateRating"')) {
      html = html.replace(
        /("reviewBody":\s*"[^"]+",)/,
        `$1\n      "aggregateRating": {\n        "@type": "AggregateRating",\n        "ratingValue": "${op.rating.toFixed(1)}",\n        "bestRating": "5",\n        "worstRating": "1"\n      },`,
      );
    }
  }
  html = html.replace(/"dateModified":\s*"\d{4}-\d{2}-\d{2}"/g, `"dateModified": "${op.last_reviewed}"`);
  return html;
}

function syncStandardReview(slug) {
  const op = operator(slug);
  const file = op.review_url.replace(/^\//, "");
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  html = syncReviewJsonLd(op, html);

  if (!todo(op.rating) && typeof op.rating === "number") {
    html = html.replace(/BetSorted's [\d.]+\/5 rating/g, `BetSorted's ${op.rating.toFixed(1)}/5 rating`);
    html = html.replace(/with a [\d.]+\/5 rating from BetSorted/g, `with a ${op.rating.toFixed(1)}/5 rating from BetSorted`);
    html = html.replace(/<div class="meta-value">[\d.]+ \/ 5<\/div>/, `<div class="meta-value">${op.rating.toFixed(1)} / 5</div>`);
    html = html.replace(/<div class="score">[\d.]+ \/ 5<\/div>/, `<div class="score">${op.rating.toFixed(1)} / 5</div>`);
    html = html.replace(/<div class="stars">[^<]*[\d.]+\/5<\/div>/, `<div class="stars">${stars(op)} ${op.rating.toFixed(1)}/5</div>`);
    html = html.replace(/<p><strong>BetSorted Rating: [\d.]+\/5<\/strong><\/p>/, `<p><strong>BetSorted Rating: ${op.rating.toFixed(1)}/5</strong></p>`);
  }

  html = html.replace(/<div class="meta-label">Welcome Bonus<\/div>\n\s*<div class="meta-value">[^<]+<\/div>/, `<div class="meta-label">Welcome Bonus</div>\n          <div class="meta-value">${escapeHtml(op.welcome_bonus)}</div>`);
  html = html.replace(/<div class="meta-label">Min Deposit<\/div>\n\s*<div class="meta-value">[^<]+<\/div>/, `<div class="meta-label">Min Deposit</div>\n          <div class="meta-value">${escapeHtml(op.min_deposit_display)}</div>`);
  html = html.replace(/<div class="meta-label">Payout Speed<\/div>\n\s*<div class="meta-value">[^<]+<\/div>/, `<div class="meta-label">Payout Speed</div>\n          <div class="meta-value">${escapeHtml(op.payout_speed)}</div>`);
  html = html.replace(/<div class="last-updated">Last Updated: [^<]+<\/div>/, `<div class="last-updated">Last Updated: ${dateLabel(op.last_reviewed)}</div>`);
  html = html.replace(/<tr><td>Welcome Bonus<\/td><td>[^<]+<\/td><\/tr>/, `<tr><td>Welcome Bonus</td><td>${escapeHtml(op.welcome_bonus)}</td></tr>`);
  html = html.replace(/<tr><td>Min Deposit<\/td><td>[^<]+<\/td><\/tr>/, `<tr><td>Min Deposit</td><td>${escapeHtml(op.min_deposit_display)}</td></tr>`);
  writeIfChanged(file, html);
}

function reportTodos() {
  const rows = [];
  for (const op of operators) {
    for (const [key, value] of Object.entries(op)) {
      if (value === "Coming soon" || value === null) rows.push(`${op.slug},${key},${value === null ? "null" : value}`);
    }
  }
  const report = `# Operator Data TODO Report\n\nGenerated from \`data/operators.json\`.\n\n\`\`\`csv\noperator,field,value\n${rows.join("\n")}\n\`\`\`\n`;
  const file = "audit/operator-data-todos.md";
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== report) fs.writeFileSync(file, report);
}

syncHomepage();
syncHub();
for (const slug of operators.map((op) => op.slug)) syncStandardReview(slug);
reportTodos();
