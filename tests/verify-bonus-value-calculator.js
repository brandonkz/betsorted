#!/usr/bin/env node

const fs = require('fs');
const vm = require('vm');

const REQUIRED_FIELDS = [
  'type',
  'match_rate',
  'max_bonus_zar',
  'fixed_bonus_zar',
  'wagering_multiple',
  'wagering_applies_to',
  'expiry_days'
];

function extractCalculatorScript(html) {
  const start = html.indexOf('    const DATA_URL = ');
  const end = html.indexOf("    document.getElementById('deposit').addEventListener", start);
  if (start === -1 || end === -1) throw new Error('Calculator function script not found');
  return html.slice(start, end);
}

function createContext() {
  const context = {
    console,
    window: {},
    document: {
      getElementById() {
        return {
          value: '',
          textContent: '',
          innerHTML: '',
          addEventListener() {}
        };
      }
    }
  };
  vm.createContext(context);
  return context;
}

function bookmaker(name, welcomeBonus, extra = {}) {
  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    review_url: '/bookmakers/' + name.toLowerCase().replace(/\s+/g, '-') + '.html',
    affiliate_url: extra.affiliate_url || null,
    welcome_bonus: {
      headline: null,
      min_deposit_zar: null,
      wagering: null,
      min_odds: null,
      promo_code: null,
      source_url: null,
      checked: null,
      ...welcomeBonus
    }
  };
}

function rankedNames(api, books, deposit, margin) {
  return api.getVerifiedOffers(books)
    .map(book => api.calculateOffer(book, deposit, margin))
    .sort((a, b) => b.retainedValue - a.retainedValue)
    .map(row => row.bookmaker.name);
}

function main() {
  const html = fs.readFileSync('bonus-value-calculator.html', 'utf8');
  const schemaBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!schemaBlocks.some(match => match[1].includes('"@type": "WebApplication"'))) {
    throw new Error('WebApplication schema missing');
  }

  const script = extractCalculatorScript(html);
  const context = createContext();
  vm.runInContext(script, context);

  const api = context;
  const fixtures = [
    bookmaker('High Match', {
      status: 'verified',
      type: 'match',
      match_rate: 1,
      max_bonus_zar: 1000,
      fixed_bonus_zar: null,
      wagering_multiple: 12,
      wagering_applies_to: 'deposit_plus_bonus',
      min_deposit_zar: 10,
      min_odds: 1.5,
      expiry_days: 7
    }, { affiliate_url: '/go/high-match.html' }),
    bookmaker('Small Free Bet', {
      status: 'verified',
      type: 'free_bet',
      match_rate: null,
      max_bonus_zar: null,
      fixed_bonus_zar: 50,
      wagering_multiple: 1,
      wagering_applies_to: 'bonus',
      min_deposit_zar: 10,
      min_odds: 1.5,
      expiry_days: 7
    }),
    bookmaker('Low Turnover Match', {
      status: 'verified',
      type: 'match',
      match_rate: 0.5,
      max_bonus_zar: 250,
      fixed_bonus_zar: null,
      wagering_multiple: 1,
      wagering_applies_to: 'bonus',
      min_deposit_zar: 20,
      min_odds: 1.5,
      expiry_days: 14
    }),
    bookmaker('No Bonus', {
      status: 'verified',
      type: 'none',
      match_rate: null,
      max_bonus_zar: null,
      fixed_bonus_zar: null,
      wagering_multiple: null,
      wagering_applies_to: null,
      min_deposit_zar: null,
      min_odds: null,
      expiry_days: null
    }),
    bookmaker('Tiny Clean Bonus', {
      status: 'verified',
      type: 'free_bet',
      match_rate: null,
      max_bonus_zar: null,
      fixed_bonus_zar: 25,
      wagering_multiple: 1,
      wagering_applies_to: 'bonus',
      min_deposit_zar: 5,
      min_odds: 1.4,
      expiry_days: 30
    }),
    bookmaker('Unverified', {
      status: 'unverified',
      type: 'match',
      match_rate: 1,
      max_bonus_zar: 5000,
      fixed_bonus_zar: null,
      wagering_multiple: 1,
      wagering_applies_to: 'bonus',
      min_deposit_zar: 1,
      min_odds: 1.1,
      expiry_days: 30
    })
  ];

  const zero = api.getVerifiedOffers([]).length;
  const one = api.getVerifiedOffers(fixtures.slice(0, 1)).length;
  const two = api.getVerifiedOffers(fixtures.slice(0, 2)).length;
  const five = api.getVerifiedOffers(fixtures).length;
  if (zero !== 0 || one !== 1 || two !== 2 || five !== 5) {
    throw new Error(`Unexpected verified counts: ${zero}/${one}/${two}/${five}`);
  }

  const production = JSON.parse(fs.readFileSync('data/bookmakers.json', 'utf8'));
  const productionVerified = api.getVerifiedOffers(production);
  if (productionVerified.length !== 0) {
    throw new Error(`Production should have zero verified structured bonuses, got ${productionVerified.length}`);
  }

  const unverifiedRendered = api.getVerifiedOffers(fixtures).some(book => book.name === 'Unverified');
  if (unverifiedRendered) throw new Error('Unverified bookmaker passed filter');

  const r50 = rankedNames(api, fixtures, 50, 0.06).join('|');
  const r5000 = rankedNames(api, fixtures, 5000, 0.06).join('|');
  if (r50 === r5000) throw new Error('R50 and R5000 rankings should differ');

  const lowMargin = rankedNames(api, fixtures, 500, 0.02).join('|');
  const highMargin = rankedNames(api, fixtures, 500, 0.12).join('|');
  if (lowMargin === highMargin) throw new Error('Margin slider should change ranking');

  const negative = api.calculateOffer(fixtures[0], 500, 0.12);
  if (negative.retainedValue >= 0) throw new Error('Expected a negative retained value scenario');

  const data = JSON.parse(fs.readFileSync('data/bookmakers.json', 'utf8'));
  const missing = [];
  for (const book of data) {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in book.welcome_bonus)) missing.push(`${book.slug}.${field}`);
    }
  }
  if (missing.length) throw new Error('Missing welcome_bonus fields: ' + missing.join(', '));

  const worksheet = fs.readFileSync('data/verification-worksheet.csv', 'utf8');
  for (const book of data) {
    for (const field of REQUIRED_FIELDS) {
      if (!worksheet.includes(`${book.slug},welcome_bonus.${field},`)) {
        throw new Error(`Worksheet row missing for ${book.slug}.welcome_bonus.${field}`);
      }
    }
  }

  const calculators = fs.readFileSync('calculators.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  if (calculators.includes('/bonus-value-calculator.html')) throw new Error('Hidden calculator should not be linked from calculators.html');
  if (sitemap.includes('/bonus-value-calculator.html')) throw new Error('Hidden calculator should not be in sitemap.xml');

  console.log('PASS schema fields and worksheet rows present');
  console.log('PASS production verified structured bonuses=0');
  console.log('PASS renders fixture counts 0/1/2/5');
  console.log('PASS unverified bookmakers excluded');
  console.log('PASS R50 and R5000 rankings differ');
  console.log('PASS margin changes ranking');
  console.log('PASS negative retained value scenario');
  console.log('PASS WebApplication schema present');
  console.log('PASS hidden from calculators.html and sitemap.xml');
}

main();
