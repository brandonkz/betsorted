#!/usr/bin/env node

const fs = require('fs');
const vm = require('vm');

function extractCalculatorScript(html) {
  const start = html.indexOf('    const VERIFIED_OFFERS = [');
  const end = html.indexOf("    document.getElementById('deposit').addEventListener", start);
  if (start === -1 || end === -1) throw new Error('Calculator function script not found');
  return html.slice(start, end);
}

function createContext() {
  const elements = new Map();
  const makeEl = (id) => ({
    id,
    value: id === 'deposit' ? '1000' : id === 'margin' ? '0.07' : '',
    textContent: '',
    innerHTML: '',
    addEventListener() {}
  });
  const context = {
    console,
    window: {},
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, makeEl(id));
        return elements.get(id);
      }
    }
  };
  vm.createContext(context);
  return context;
}

function findOffer(api, slug) {
  const offer = api.VERIFIED_OFFERS.find((entry) => entry.slug === slug);
  if (!offer) throw new Error(`Missing offer for ${slug}`);
  return offer;
}

function approxEqual(actual, expected, label) {
  if (Math.abs(actual - expected) > 0.001) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function main() {
  const html = fs.readFileSync('reward-calculator.html', 'utf8');
  const schemaBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!schemaBlocks.some((match) => match[1].includes('"@type": "WebApplication"'))) {
    throw new Error('WebApplication schema missing');
  }

  const script = extractCalculatorScript(html);
  const context = createContext();
  vm.runInContext(script + '\nthis.__bonusCalcApi = { VERIFIED_OFFERS, calculateOffer };', context);

  const api = context.__bonusCalcApi;
  if (!Array.isArray(api.VERIFIED_OFFERS)) throw new Error('VERIFIED_OFFERS missing');
  if (api.VERIFIED_OFFERS.length !== 10) {
    throw new Error(`Expected 10 workbook-backed offers, got ${api.VERIFIED_OFFERS.length}`);
  }

  ['bet-co-za', 'world-sports-betting', 'sportingbet', 'play-co-za', 'easybet'].forEach((slug) => {
    findOffer(api, slug);
  });

  const betCoZa = api.calculateOffer(findOffer(api, 'bet-co-za'), 1000, 0.07);
  approxEqual(betCoZa.bonusAmount, 1000, 'Bet.co.za bonus');
  approxEqual(betCoZa.turnover, 6000, 'Bet.co.za turnover');
  approxEqual(betCoZa.expectedCost, 420, 'Bet.co.za expected cost');
  approxEqual(betCoZa.retainedValue, 580, 'Bet.co.za retained value');

  const sportingbet = api.calculateOffer(findOffer(api, 'sportingbet'), 1000, 0.07);
  approxEqual(sportingbet.turnover, 20000, 'Sportingbet turnover');
  approxEqual(sportingbet.retainedValue, -400, 'Sportingbet retained value');

  const playCoZa = api.calculateOffer(findOffer(api, 'play-co-za'), 1000, 0.07);
  approxEqual(playCoZa.bonusAmount, 1250, 'Play.co.za bonus');
  approxEqual(playCoZa.turnover, 37250, 'Play.co.za turnover');
  approxEqual(playCoZa.retainedValue, -1357.5, 'Play.co.za retained value');

  const tenBet = api.calculateOffer(findOffer(api, '10bet'), 10000, 0.07);
  approxEqual(tenBet.qualifyingDeposit, 5000, '10bet qualifying deposit cap');
  approxEqual(tenBet.bonusAmount, 5000, '10bet capped bonus');
  approxEqual(tenBet.turnover, 60000, '10bet capped turnover');

  const insufficient = api.calculateOffer(findOffer(api, 'bet-co-za'), 10, 0.07);
  approxEqual(insufficient.bonusAmount, 0, 'Under-minimum bonus');
  approxEqual(insufficient.turnover, 0, 'Under-minimum turnover');

  const calculators = fs.readFileSync('calculators.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  if (!calculators.includes('/reward-calculator.html')) {
    throw new Error('Published calculator missing from calculators.html');
  }
  if (!sitemap.includes('/reward-calculator.html')) {
    throw new Error('Published calculator missing from sitemap.xml');
  }

  console.log('PASS workbook-backed offer list present');
  console.log('PASS key workbook slugs present');
  console.log('PASS Bet.co.za turnover maths');
  console.log('PASS Sportingbet negative EV maths');
  console.log('PASS Play.co.za 125% tier maths');
  console.log('PASS 10bet deposit cap maths');
  console.log('PASS under-minimum deposits return zero');
  console.log('PASS WebApplication schema present');
  console.log('PASS published from calculators.html and sitemap.xml');
}

main();
