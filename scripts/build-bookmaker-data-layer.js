const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TODAY = '2026-08-06';
const NGB_SOURCE_URL = 'https://www.ngb.org.za/verified-operators/';

const BOARD_BY_PROVINCE = {
  'Eastern Cape': 'Eastern Cape Gambling and Betting Board',
  'Free-State': 'Free State Gambling, Liquor and Tourism Authority',
  'Gauteng': 'Gauteng Gambling Board',
  'Limpopo': 'Limpopo Gambling Board',
  'Mpumalanga': 'Mpumalanga Economic Regulator',
  'North-West': 'North West Gambling Board',
  'Western Cape': 'Western Cape Gambling and Racing Board',
  'Western-Cape': 'Western Cape Gambling and Racing Board'
};

const MANUAL_BOOKMAKERS = [
  ['10bet', '10Bet'],
  ['bet-co-za', 'BET.co.za'],
  ['betfred', 'Betfred'],
  ['betmaster', 'Betmaster'],
  ['betolimp', 'BetOlimp'],
  ['betshezi', 'Betshezi'],
  ['betway', 'Betway'],
  ['easybet', 'Easybet'],
  ['gbets', 'Gbets'],
  ['hollywoodbets', 'Hollywoodbets'],
  ['lottostar', 'LottoStar'],
  ['play-co-za', 'Play.co.za'],
  ['playabets', 'Playabets'],
  ['sportingbet', 'Sportingbet'],
  ['sunbet', 'Sunbet'],
  ['supabets', 'Supabets'],
  ['world-sports-betting', 'World Sports Betting'],
  ['yesplay', 'YesPlay']
];

const NGB_MATCHES = {
  '10bet': [{ entity: '10Bet', type: 'BOOKMAKER', number: '9-2-1-09661', province: 'Mpumalanga' }],
  'bet-co-za': [{ entity: 'Betcoza Online (Pty) Ltd t/a BET.co.za', type: 'BOOKMAKER', number: '10145732-017', province: 'Western Cape' }],
  'betfred': [
    { entity: 'Betfred SA Gauteng (Pty) Ltd', type: 'BOOKMAKER', number: 'VER-014', province: 'Gauteng' },
    { entity: 'Betfred SA Gauteng (Pty) Ltd', type: 'BOOKMAKER', number: 'JOH-117', province: 'Gauteng' },
    { entity: 'Betfred SA Holdings (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'North-West' },
    { entity: 'Betfred South Africa Trading North West (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'North-West' }
  ],
  'betolimp': [{ entity: 'Olimp (Pty) Ltd t/a BetOlimp', type: 'BOOKMAKER', number: '10138042-020', province: 'Western Cape' }],
  'betshezi': [{ entity: 'SMP Gaming (Pty) Ltd t/a Betshezi', type: 'BOOKMAKER', number: '10191121-004', province: 'Western Cape' }],
  'betway': [{ entity: 'Raging River Trading (Pty) Ltd t/a Betway (South Africa)', type: 'BOOKMAKER', number: '10181496-012', province: 'Western Cape' }],
  'easybet': [
    { entity: 'Easybet Group EC (Pty) Ltd', type: 'BOOKMAKER', number: 'ECBM029', province: 'Eastern Cape' },
    { entity: 'Easybet Group (Pty) Ltd', type: 'BOOKMAKER', number: '10191733-004', province: 'Western-Cape' }
  ],
  'gbets': [
    { entity: 'Gbets: 2018528059 (Pty) Ltd', type: 'BOOKMAKER', number: 'FSGLA/BML/0029', province: 'Free-State' },
    { entity: 'Gbets: K201845647 (Pty) Ltd', type: 'BOOKMAKER', number: 'FSGLA/BML/0011', province: 'Free-State' },
    { entity: 'Dymanex (Pty) Ltd t/a G-Bets', type: 'BOOKMAKER', number: '10179096-014', province: 'Western Cape' }
  ],
  'hollywoodbets': [
    { entity: 'Hollywood Sportsbook Eastern Cape (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'Eastern Cape' },
    { entity: 'Hollywood Sportsbook Gauteng (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'Gauteng' },
    { entity: 'Hollywood Sportsbook Western Cape (Pty) Ltd t/a Hollywoodbets', type: 'BOOKMAKER', number: '10110547-021', province: 'Western Cape' },
    { entity: 'Hollywood Bets', type: 'BOOKMAKER', number: null, province: 'Free-State' },
    { entity: 'Hollywood Bets Nelspruit', type: 'BOOKMAKER', number: null, province: 'Mpumalanga' }
  ],
  'lottostar': [{ entity: 'Lottostar', type: 'BOOKMAKER', number: '9-2-1-09467', province: 'Mpumalanga' }],
  'play-co-za': [{ entity: 'Betflash (Pty) Ltd t/a Play.co.za', type: 'BOOKMAKER', number: '10172287-015', province: 'Western Cape' }],
  'playabets': [{ entity: 'Playabets WC (Pty) Ltd - Bookmaker', type: 'BOOKMAKER', number: '10141335-018', province: 'Western-Cape' }],
  'sportingbet': [{ entity: 'Greatodds (Pty) Ltd t/a Sportingbets SA', type: 'BOOKMAKER', number: '10125193-019', province: 'Western Cape' }],
  'sunbet': [
    { entity: 'Sunbet (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'North-West' },
    { entity: 'SunBet (Pty) Ltd - Bookmaker', type: 'BOOKMAKER', number: '10138713-018', province: 'Western-Cape' }
  ],
  'supabets': [
    { entity: 'SupaBets', type: 'BOOKMAKER', number: 'FSGLA/BML/002', province: 'Free-State' },
    { entity: 'Supabets - Mpumalanga', type: 'BOOKMAKER', number: null, province: 'Mpumalanga' },
    { entity: 'Portapa 2 t/a Supabets - Polokwane', type: 'BOOKMAKER', number: null, province: 'Limpopo' }
  ],
  'world-sports-betting': [
    { entity: 'World Sports Betting (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'Gauteng' },
    { entity: 'World Sports Betting KZN (Pty) Ltd', type: 'BOOKMAKER', number: null, province: 'KwaZulu-Natal' },
    { entity: 'SWB Solutions (Pty) Ltd t/a World Sports Betting Western Cape', type: 'BOOKMAKER', number: '10181495-013', province: 'Western Cape' }
  ],
  'yesplay': [{ entity: 'SA Sportsbook (Pty) Ltd t/a YesPlay', type: 'BOOKMAKER', number: '10180204-013', province: 'Western Cape' }]
};

const TERMS_URLS = {
  'bet-co-za': 'https://www.bet.co.za/terms-and-conditions',
  'betfred': 'https://betfred.co.za/terms-and-conditions',
  'lottostar': 'https://lottostar.co.za/terms-and-conditions',
  'world-sports-betting': 'https://www.worldsportsbetting.co.za/terms-and-conditions'
};

function read(file) {
  const target = path.join(ROOT, file);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&ndash;|&#8211;/g, '-')
    .replace(/&mdash;|&#8212;/g, '-')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((value) => value.trim());
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = splitCSVLine(lines.shift());
  return lines.map((line) => Object.fromEntries(splitCSVLine(line).map((value, index) => [headers[index], value])));
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function numberFromRand(value) {
  if (!value) return null;
  const match = String(value).replace(/,/g, '').match(/R\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function normalizeRating(value) {
  if (!value) return null;
  const match = String(value).match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function slugFromBlogReview(file) {
  const slug = file.replace(/^blog\//, '').replace(/-review-south-africa-2026\.html$/, '');
  return slug === 'wsb' ? 'world-sports-betting' : slug;
}

function extractHomepageClaims() {
  const html = read('index.html');
  const claims = {};
  for (const match of html.matchAll(/<tr>[\s\S]*?<\/tr>/g)) {
    const row = match[0];
    const name = (row.match(/<span class="bookmaker-name">([^<]+)<\/span>/) || [])[1];
    if (!name) continue;
    const slug = slugByName(name);
    claims[slug] = {
      rating: normalizeRating((row.match(/<span class="rating-number">([^<]+)/) || [])[1]),
      welcome_bonus: (row.match(/<td data-label="Welcome Bonus">[\s\S]*?<strong>([^<]+)/) || [])[1] || null,
      min_deposit_zar: numberFromRand((row.match(/<td data-label="Min Deposit">[\s\S]*?<span class="deposit-amount">([^<]+)/) || [])[1])
    };
  }
  return claims;
}

function slugByName(name) {
  const lower = name.toLowerCase();
  const found = MANUAL_BOOKMAKERS.find(([, display]) => display.toLowerCase() === lower);
  if (found) return found[0];
  if (lower === 'world sports betting') return 'world-sports-betting';
  if (lower === '10bet') return '10bet';
  return lower.replace(/\.co\.za/g, '-co-za').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractStructuredRating(html) {
  const jsonRating = html.match(/"ratingValue"\s*:\s*"?(\d+(?:\.\d+)?)"?/);
  return jsonRating ? Number(jsonRating[1]) : null;
}

function extractReviewClaims(file) {
  const html = read(file);
  if (!html) return null;
  const text = stripTags(html);
  const meta = {};
  for (const match of html.matchAll(/<div class="meta-label">([^<]+)<\/div>\s*<div class="meta-value">([^<]+)<\/div>/g)) {
    meta[match[1].toLowerCase()] = stripTags(match[2]);
  }
  return {
    rating: normalizeRating(meta['betsorted rating']) || extractStructuredRating(html),
    welcome_bonus: meta['welcome bonus'] || ((text.match(/Welcome bonus:\s*([^.\n]+)/i) || [])[1] || null),
    min_deposit_zar: numberFromRand(meta['min deposit'] || (text.match(/minimum deposit[^.]*?(R\s*\d+)/i) || [])[1]),
    payout: meta['payout speed'] || ((text.match(/withdrawals?[^.]*?(minutes[^.]+|24[^.]+|12[^.]+)/i) || [])[1] || null),
    licence_claim: ((text.match(/operates under the ([^.]+?) and is legal/i) || [])[1] || null)
  };
}

function extractBlogClaims(file) {
  const html = read(file);
  if (!html) return null;
  const text = stripTags(html);
  const description = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
  return {
    rating: extractStructuredRating(html),
    welcome_bonus: (
      (description.match(/((?:\d+%|R\s?[\d,]+)[^.,;]*bonus[^.,;]*)/i) || [])[1] ||
      (text.match(/(\d+%\s+[^.]{0,60}?R\s?[\d,]+[^.]{0,80}?bonus)/i) || [])[1] ||
      null
    ),
    min_deposit_zar: numberFromRand((text.match(/(?:minimum deposit|min deposit)[^.]{0,80}?(R\s?\d+)/i) || [])[1]),
    payout: ((text.match(/(?:withdrawal|payout)[^.]{0,80}?(\d+\s*(?:-|to|–)\s*\d+\s*hours|Instant|minutes?[^.]*)/i) || [])[1] || null),
    licence_claim: ((text.match(/licen[cs]e from the ([^.]+?)\s+and/i) || [])[1] || (text.match(/(Western Cape|Gauteng|Mpumalanga|Limpopo|Northern Cape|Free State|Isle of Man|Curacao)[^.]{0,80}licen[cs]e/i) || [])[0] || null)
  };
}

function valueIsPresent(value) {
  return value !== null && value !== undefined && value !== '';
}

function buildFieldConflict(field, sources) {
  const row = { field };
  for (const [source, value] of Object.entries(sources)) {
    if (valueIsPresent(value)) row[source] = value;
  }
  return Object.keys(row).length > 1 ? row : null;
}

function emptyCommercialRecord(status) {
  return {
    headline: null,
    min_deposit_zar: null,
    wagering: null,
    min_odds: null,
    promo_code: null,
    status,
    source_url: null,
    checked: null
  };
}

function licenseFor(slug) {
  const matches = NGB_MATCHES[slug] || [];
  if (matches.length === 0) {
    return {
      board: null,
      number: null,
      entity: null,
      company_reg: null,
      status: 'unverified',
      source_url: NGB_SOURCE_URL,
      checked: TODAY,
      portal_matches: []
    };
  }

  const primary = matches.find((match) => match.number) || matches[0];
  return {
    board: BOARD_BY_PROVINCE[primary.province] || primary.province || null,
    number: primary.number,
    entity: primary.entity,
    company_reg: null,
    status: matches.length > 1 ? 'disputed' : 'verified',
    source_url: NGB_SOURCE_URL,
    checked: TODAY,
    portal_matches: matches.map((match) => ({
      entity: match.entity,
      type: match.type,
      number: match.number,
      province: match.province,
      board: BOARD_BY_PROVINCE[match.province] || match.province || null
    }))
  };
}

function renderVerifiedClaims(record) {
  const lines = [];
  if (record.rating.status === 'verified' && record.rating.value !== null) {
    lines.push(`Rating: ${record.rating.value}/5`);
  }
  if (record.welcome_bonus.status === 'verified' && record.welcome_bonus.headline) {
    lines.push(`Welcome bonus: ${record.welcome_bonus.headline}`);
  }
  if (record.welcome_bonus.status === 'verified' && record.welcome_bonus.min_deposit_zar !== null) {
    lines.push(`Minimum deposit: R${record.welcome_bonus.min_deposit_zar}`);
  }
  if (record.payout.status === 'verified' && record.payout.typical_hours !== null) {
    lines.push(`Typical payout: ${record.payout.typical_hours} hours`);
  }
  if (record.licence.status === 'verified' || record.licence.status === 'disputed') {
    lines.push(`Licence: ${record.licence.entity || 'needs owner review'} (${record.licence.number || 'number pending'})`);
  }
  return lines;
}

const homepage = extractHomepageClaims();
const csvRows = parseCSV(read('data/bookmakers.csv'));
const csvBySlug = Object.fromEntries(csvRows.map((row) => [row.slug, row]));

const slugs = new Map(MANUAL_BOOKMAKERS);
for (const slug of Object.keys(homepage)) slugs.set(slug, MANUAL_BOOKMAKERS.find(([s]) => s === slug)?.[1] || slug);
for (const row of csvRows) slugs.set(row.slug, row.name);
for (const file of fs.readdirSync(path.join(ROOT, 'bookmakers')).filter((file) => file.endsWith('-review.html'))) {
  const slug = file.replace(/-review\.html$/, '');
  slugs.set(slug, MANUAL_BOOKMAKERS.find(([s]) => s === slug)?.[1] || slug);
}
for (const file of fs.readdirSync(path.join(ROOT, 'blog')).filter((file) => file.endsWith('-review-south-africa-2026.html'))) {
  const slug = slugFromBlogReview(`blog/${file}`);
  slugs.set(slug, MANUAL_BOOKMAKERS.find(([s]) => s === slug)?.[1] || slug);
}

const records = [...slugs.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([slug, name]) => {
  const reviewPath = `bookmakers/${slug}-review.html`;
  const blogSlug = slug === 'world-sports-betting' ? 'wsb' : slug;
  const blogPath = `blog/${blogSlug}-review-south-africa-2026.html`;
  const reviewClaims = extractReviewClaims(reviewPath) || {};
  const blogClaims = extractBlogClaims(blogPath) || {};
  const csv = csvBySlug[slug] || {};
  const affiliatePath = `go/${slug}.html`;

  const conflicts = [
    buildFieldConflict('rating', {
      homepage: homepage[slug]?.rating,
      csv: normalizeRating(csv.review_rating),
      review_page: reviewClaims.rating,
      blog_review_page: blogClaims.rating
    }),
    buildFieldConflict('welcome_bonus.headline', {
      homepage: homepage[slug]?.welcome_bonus,
      csv: csv.bonus,
      review_page: reviewClaims.welcome_bonus,
      blog_review_page: blogClaims.welcome_bonus
    }),
    buildFieldConflict('welcome_bonus.min_deposit_zar', {
      homepage: homepage[slug]?.min_deposit_zar,
      csv: numberFromRand(csv.min_deposit),
      review_page: reviewClaims.min_deposit_zar,
      blog_review_page: blogClaims.min_deposit_zar
    }),
    buildFieldConflict('payout.typical_hours', {
      csv: csv.payout_speed,
      review_page: reviewClaims.payout,
      blog_review_page: blogClaims.payout
    }),
    buildFieldConflict('licence.board_or_entity', {
      csv: csv.license,
      review_page: reviewClaims.licence_claim,
      blog_review_page: blogClaims.licence_claim
    })
  ].filter(Boolean);

  return {
    slug,
    name,
    review_url: fs.existsSync(path.join(ROOT, reviewPath)) ? `/${reviewPath}` : (fs.existsSync(path.join(ROOT, blogPath)) ? `/${blogPath}` : null),
    duplicate_blog_review_url: fs.existsSync(path.join(ROOT, blogPath)) ? `/${blogPath}` : null,
    affiliate_url: fs.existsSync(path.join(ROOT, affiliatePath)) ? `/${affiliatePath}` : null,
    licence: licenseFor(slug),
    rating: {
      value: null,
      status: 'editorial_pending',
      set_by: null,
      checked: null
    },
    welcome_bonus: emptyCommercialRecord('unverified'),
    payments: { deposit_methods: [], status: 'unverified', source_url: null, checked: null },
    payout: { typical_hours: null, status: 'unverified', source_url: null, checked: null },
    conflicts
  };
});

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'audit'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data/bookmakers.json'), `${JSON.stringify(records, null, 2)}\n`);

const fields = [
  'rating.value',
  'welcome_bonus.headline',
  'welcome_bonus.min_deposit_zar',
  'welcome_bonus.wagering',
  'welcome_bonus.min_odds',
  'welcome_bonus.promo_code',
  'payments.deposit_methods',
  'payout.typical_hours'
];
const worksheetRows = [[
  'slug',
  'field',
  'homepage_value',
  'csv_value',
  'review_page_value',
  'operator_tandcs_url',
  'confirmed_value',
  'confirmed_by',
  'confirmed_date'
]];
for (const record of records) {
  for (const field of fields) {
    const conflict = record.conflicts.find((item) => item.field === field || item.field.startsWith(field.replace('.value', '')));
    worksheetRows.push([
      record.slug,
      field,
      conflict?.homepage || '',
      conflict?.csv || '',
      conflict?.review_page || '',
      TERMS_URLS[record.slug] || '',
      '',
      '',
      ''
    ]);
  }
}
fs.writeFileSync(
  path.join(ROOT, 'data/verification-worksheet.csv'),
  `${worksheetRows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`
);

const demoRecord = records.find((record) => record.slug === 'betway');
const demoLines = renderVerifiedClaims(demoRecord);
const omitted = [
  'rating.value',
  'welcome_bonus.headline',
  'welcome_bonus.min_deposit_zar',
  'payout.typical_hours'
].filter((field) => {
  if (field === 'rating.value') return demoRecord.rating.status !== 'verified';
  if (field.startsWith('welcome_bonus')) return demoRecord.welcome_bonus.status !== 'verified';
  if (field.startsWith('payout')) return demoRecord.payout.status !== 'verified';
  return false;
});
fs.writeFileSync(path.join(ROOT, 'audit/bookmaker-rendering-demo.md'), `# Bookmaker Rendering Demo

Source record: \`data/bookmakers.json\` -> \`${demoRecord.slug}\`

Rendering rule: only fields with \`status: "verified"\` are rendered. Unverified commercial claims are omitted from the page rather than displayed with stale values.

## Demo Output

${demoLines.map((line) => `- ${line}`).join('\n')}

## Omitted Because Unverified

${omitted.map((field) => `- ${field}`).join('\n')}
`);

const conflictMarkdown = records.map((record) => {
  const lines = [`### ${record.name} (${record.slug})`];
  if (record.conflicts.length === 0) {
    lines.push('- No existing claims found in scanned sources.');
  } else {
    for (const conflict of record.conflicts) {
      const values = Object.entries(conflict)
        .filter(([key]) => key !== 'field')
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
      lines.push(`- ${conflict.field}: ${values}`);
    }
  }
  return lines.join('\n');
}).join('\n\n');
const licenceMarkdown = records.map((record) => {
  const licence = record.licence;
  const matches = licence.portal_matches.map((match) => `${match.entity}${match.number ? ` (${match.number})` : ''} - ${match.province}`).join(' | ') || 'not found';
  return `- ${record.name}: ${licence.status}; ${matches}`;
}).join('\n');
const unverifiedCount = records.reduce((count, record) => {
  return count + fields.length + (record.licence.status === 'unverified' ? 1 : 0);
}, 0);
fs.writeFileSync(path.join(ROOT, 'audit/bookmaker-conflict-report.md'), `# Phase 2 Bookmaker Conflict Report

Generated: ${TODAY}

## Conflict Table

${conflictMarkdown}

## Licence Verification Results

NGB source: ${NGB_SOURCE_URL}

${licenceMarkdown}

## Counts

- Bookmakers modelled: ${records.length}
- Worksheet rows excluding header: ${records.length * fields.length}
- Fields sitting unverified/editorial pending: ${unverifiedCount}
- Operator not found on NGB portal: ${records.filter((record) => record.licence.status === 'unverified').map((record) => record.slug).join(', ') || 'none'}

## Private File Note

- \`private/board.json\` is tracked in the repository and the \`private/\` directory deploys to the live static site.

## Commercial Values

- No commercial value was invented or selected as canonical. Existing claims are recorded only inside \`conflicts[]\` and the verification worksheet.
`);

console.log(`Wrote ${records.length} bookmaker records`);
console.log(`Wrote ${records.length * fields.length} worksheet rows`);
console.log(`Unverified/editorial-pending fields: ${unverifiedCount}`);
