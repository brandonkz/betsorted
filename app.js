/**
 * BetSorted - Main Application JavaScript
 */

// State
let sites = [];
let filteredSites = [];
let activeFilter = 'all';

// DOM Elements
const comparisonTbody = document.getElementById('comparison-tbody');
const reviewsGrid = document.getElementById('reviews-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    await loadSites();
    setupEventListeners();
    applyFilter('all');
  } catch (error) {
    console.error('Failed to initialize:', error);
    const status = document.getElementById('comparison-status');
    if (status) status.textContent = 'Live filtering is unavailable. The comparison below is still available.';
  }
}

// Data Loading
async function loadSites() {
  try {
    const response = await fetch('/data/sites.json', {
      cache: 'no-store'
    });
    if (response.ok) {
      sites = await response.json();
      sites.sort((a, b) => a.rank - b.rank);
    } else {
      throw new Error('Fetch failed');
    }
  } catch (e) {
    console.error('Could not load sites:', e);
    throw e;
  }
}

// Event Listeners
function setupEventListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(filter);
    });
  });
}

// Filtering
function applyFilter(filter) {
  activeFilter = filter;
  
  filteredSites = sites.filter(site => {
    if (filter === 'all') return true;
    if (filter === 'data-free') return site.data_free_app === true;
    if (filter === 'low-deposit') {
      const deposit = getMinDepositValue(site.min_deposit);
      return deposit <= 10;
    }
    if (filter === 'live-streaming') return site.live_streaming === true;
    if (filter === 'horse-racing') return site.sports.includes('Horse Racing');
    return true;
  });
  
  render();
  const status = document.getElementById('comparison-status');
  if (status) status.textContent = `${filteredSites.length} bookmakers shown`;
}

// Rendering
function render() {
  renderComparisonTable();
  renderReviews();
}

function renderComparisonTable() {
  if (filteredSites.length === 0) {
    comparisonTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem;">
          <p style="font-size: 1.125rem; color: var(--color-text-light);">No sites match your filters. Try a different selection.</p>
        </td>
      </tr>
    `;
    return;
  }
  
  comparisonTbody.innerHTML = filteredSites.map(site => {
    const stars = ratingMarkup(site);
    const catchMarkup = getCatchMarkup(site, 2);
    
    return `
      <tr>
        <td data-label="Bookmaker">
          <div class="bookmaker-cell">
            <div class="bookmaker-logo" aria-hidden="true" style="background: ${site.logo_bg};">
              ${site.name.charAt(0)}
            </div>
            <span class="bookmaker-name">${escapeHtml(site.name)}</span>
          </div>
        </td>
        <td data-label="Rating">
          <div class="rating-stars">
            ${stars}
          </div>
        </td>
        <td data-label="Welcome Bonus">
          <div class="bonus-text">
            <strong>${displayField(site.welcome_bonus)}</strong>
            <small class="bonus-explainer">${getBonusExplanation(site.welcome_bonus)}</small><small class="verification-note">${verificationNote(site)}</small>
          </div>
        </td>
        <td data-label="Min Deposit">
          <span class="deposit-amount">${displayField(site.min_deposit)}</span>
        </td>
        <td data-label="The Catch">
          <div style="font-size: 0.85rem; line-height: 1.5; color: #555;">
            ${catchMarkup}
          </div>
        </td>
        <td>
          <a href="${escapeHtml(site.review_url)}" class="review-link">Read review</a>
          <a href="${escapeHtml(site.ref_url)}?subid=home-table" target="_blank" rel="sponsored nofollow noopener" data-bookmaker="${escapeHtml(site.slug)}" data-placement="comparison" class="btn btn-primary btn-sm" style="width: 100%;">
            Visit ${escapeHtml(site.name)} →
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReviews() {
  reviewsGrid.innerHTML = filteredSites.map(site => `
    <article class="review-card" data-operator="${escapeHtml(site.slug)}">
      <div class="review-body">
        <h3>${escapeHtml(site.name)}</h3>
        <p>${escapeHtml(site.description)}</p>
        <p><strong>Minimum deposit:</strong> ${displayField(site.min_deposit)}</p>
        <p><strong>Offer:</strong> ${displayField(site.welcome_bonus)}</p>
        <p class="verification-note">${verificationNote(site)}</p>
        <p><strong>The catch:</strong> ${getCatchMarkup(site, 1)}</p>
      </div>
      <div class="review-footer"><a href="${escapeHtml(site.review_url)}" class="btn btn-primary">Read ${escapeHtml(site.name)} review</a></div>
    </article>`).join('') || '<p>No sites match your filters. Try another option.</p>';
}
function displayField(value) {
  return !value || /Coming soon|TODO_/i.test(String(value)) ? 'Not confirmed' : escapeHtml(value);
}
function verificationNote(site) {
  const date = site.bonus_verified_at;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Offer details not yet verified. Check the operator’s current terms.';
  return `Offer last checked ${escapeHtml(date)}. Terms can change; confirm before depositing.`;
}
function ratingMarkup(site) {
  return typeof site.rating === 'number' ? `${renderStars(site.rating)} <span class="rating-number">${site.rating.toFixed(1)}/5</span>` : '<span>Not rated</span>';
}
// Utilities
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<span class="star">★</span>';
  }
  if (hasHalfStar) {
    html += '<span class="star">★</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<span class="star-empty">★</span>';
  }
  return html;
}

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getCatchEntries(site) {
  if (Array.isArray(site.promo_catch) && site.promo_catch.length > 0) {
    return site.promo_catch;
  }

  if (typeof site.promo_catch === 'string' && site.promo_catch.trim()) {
    return [site.promo_catch.trim()];
  }

  return [];
}

function stripQuoteDecorators(text) {
  return text
    .replace(/^[""]/, '')
    .replace(/[""]$/, '')
    .replace(/[""] — .*$/, '');
}

function getCatchMarkup(site, limit = 2) {
  const entries = getCatchEntries(site);
  const guideUrl = getGuideCatchUrl(site);

  if (entries.length === 0) {
    return guideUrl
      ? `<em style="color: #999;">Check the <a href="${guideUrl}" style="color: #b45309; font-style: normal; font-weight: 600;">full bonus guide</a> for promo terms</em>`
      : '<em style="color: #999;">Check the full review for promo terms</em>';
  }

  return entries.slice(0, limit).map(quote => {
    const cleaned = stripQuoteDecorators(quote);
    const guideLink = guideUrl
      ? ` <a href="${guideUrl}" style="color: #b45309; font-style: normal; font-weight: 600; text-decoration: underline;">See full catch</a>`
      : '';

    return `<div style="font-style: italic; margin-bottom: 6px; padding-left: 8px; border-left: 2px solid #e67e22;">${escapeHtml(cleaned)}${guideLink}</div>`;
  }).join('');
}

function getGuideCatchUrl(site) {
  const anchorMap = {
    '10bet': '10bet',
    'bcgame': 'bcgame',
    'betway': 'comparison-table',
    'gbets': 'gbets',
    'hollywoodbets': 'hollywoodbets',
    'play-co-za': 'playcoza',
    'sportingbet': 'sportingbet',
    'sunbet': 'sunbet',
    'world-sports-betting': 'world-sports-betting'
  };

  const anchor = anchorMap[site.slug];
  return anchor ? `/blog/south-africa-welcome-bonus-guide-2026.html#${anchor}` : '';
}

function getMinDepositValue(minDeposit) {
  const match = minDeposit && minDeposit.match(/R\s*([\d,]+)/i);
  return match ? parseInt(match[1].replace(/,/g, ''), 10) : Number.POSITIVE_INFINITY;
}

function getBonusExplanation(bonus) {
  if (!bonus || /Coming soon|TODO_/i.test(bonus)) return 'No verified offer listed';
  if (bonus.includes('%')) return 'Deposit match; wagering and eligibility conditions apply';
  return 'Check eligibility, expiry and withdrawal conditions';
}

function getSimplifiedBonus(bonus) {
  // Extract the key value for button text
  // "200% up to R5,000" → "R5,000 Bonus"
  // "R25 Sign-Up Bonus" → "R25 Bonus"
  // "Up to R1,000 Welcome Bonus" → "R1,000 Bonus"
  
  const match = bonus.match(/R[\d,]+/);
  if (match) {
    return `${match[0]} Bonus`;
  }
  return 'Bonus';
}
