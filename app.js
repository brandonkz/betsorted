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
  }
}

// Data Loading
async function loadSites() {
  try {
    const response = await fetch('data/sites.json');
    if (response.ok) {
      sites = await response.json();
      sites.sort((a, b) => a.rank - b.rank);
    } else {
      throw new Error('Fetch failed');
    }
  } catch (e) {
    console.error('Could not load sites:', e);
    sites = [];
  }
}

// Event Listeners
function setupEventListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
      const deposit = parseInt(site.min_deposit.replace(/\D/g, ''));
      return deposit <= 10;
    }
    if (filter === 'live-streaming') return site.live_streaming === true;
    if (filter === 'horse-racing') return site.sports.includes('Horse Racing');
    return true;
  });
  
  render();
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
    const stars = renderStars(site.rating);
    
    return `
      <tr>
        <td>
          <div class="bookmaker-cell">
            <div class="bookmaker-logo" style="background: ${site.logo_bg};">
              ${site.name.charAt(0)}
            </div>
            <span class="bookmaker-name">${escapeHtml(site.name)}</span>
          </div>
        </td>
        <td>
          <div class="rating-stars">
            ${stars}
            <span class="rating-number">${site.rating}</span>
          </div>
        </td>
        <td>
          <div class="bonus-text">
            <strong>${escapeHtml(site.welcome_bonus)}</strong>
            <small class="bonus-explainer">${getBonusExplanation(site.welcome_bonus)}</small>
          </div>
        </td>
        <td>
          <span class="deposit-amount">${escapeHtml(site.min_deposit)}</span>
        </td>
        <td>
          ${site.data_free_app 
            ? '<span class="badge-yes">✓ Yes</span>' 
            : '<span class="badge-no">✗ No</span>'}
        </td>
        <td>
          ${site.live_streaming 
            ? '<span class="badge-yes">✓ Yes</span>' 
            : '<span class="badge-no">✗ No</span>'}
        </td>
        <td>
          <a href="${site.ref_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            Claim ${getSimplifiedBonus(site.welcome_bonus)} →
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReviews() {
  if (filteredSites.length === 0) {
    reviewsGrid.innerHTML = `
      <p style="text-align: center; padding: 3rem; font-size: 1.125rem; color: var(--color-text-light);">
        No sites match your filters.
      </p>
    `;
    return;
  }
  
  reviewsGrid.innerHTML = filteredSites.map(site => {
    const stars = renderStars(site.rating);
    
    return `
      <article class="review-card">
        <div class="review-header">
          <div class="review-header-left">
            <div class="review-logo" style="background: ${site.logo_bg};">
              ${site.name.charAt(0)}
            </div>
            <div class="review-title-group">
              <h3>${escapeHtml(site.name)}</h3>
              <div class="review-meta">
                <div class="rating-stars">
                  ${stars}
                  <span class="rating-number">${site.rating}/5</span>
                </div>
                <span>•</span>
                <span>Est. ${site.established}</span>
              </div>
            </div>
          </div>
          ${site.featured ? '<span class="badge-yes">⭐ Featured</span>' : ''}
        </div>
        
        <div class="review-body">
          <p class="review-description">${escapeHtml(site.description)}</p>
          
          <div class="review-highlights">
            <div class="highlight-item">
              <span class="highlight-label">Welcome Bonus</span>
              <div class="highlight-value-wrapper">
                <span class="highlight-value">${escapeHtml(site.welcome_bonus)}</span>
                <small class="highlight-explainer">${getBonusExplanation(site.welcome_bonus)}</small>
              </div>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">Min Deposit</span>
              <span class="highlight-value">${escapeHtml(site.min_deposit)}</span>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">Data-Free App</span>
              <span class="highlight-value">${site.data_free_app ? '✓ Available' : '✗ Not Available'}</span>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">Live Streaming</span>
              <span class="highlight-value">${site.live_streaming ? '✓ Available' : '✗ Not Available'}</span>
            </div>
          </div>
          
          ${site.reddit_quotes && site.reddit_quotes.length > 0 ? `
          <div class="community-quote" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 3px solid #e67e22; padding: 14px 18px; margin: 20px 0; border-radius: 8px; font-size: 0.9rem;">
            <div style="font-weight: 600; color: #e67e22; margin-bottom: 10px;">💬 What South Africans Are Saying:</div>
            ${site.reddit_quotes.map(quote => 
              `<div style="font-style: italic; color: #333; line-height: 1.6; margin-bottom: 8px; padding-left: 10px; border-left: 2px solid #d8d8d8;">
                ${quote}
              </div>`
            ).join('')}
          </div>
          ` : ''}
          
          <div class="pros-cons-grid">
            <div class="pros-cons-section">
              <h4 style="color: var(--color-success);">✓ Pros</h4>
              <ul class="pros-list">
                ${site.pros.map(pro => `<li>${escapeHtml(pro)}</li>`).join('')}
              </ul>
            </div>
            <div class="pros-cons-section">
              <h4 style="color: var(--color-danger);">✗ Cons</h4>
              <ul class="cons-list">
                ${site.cons.map(con => `<li>${escapeHtml(con)}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 style="margin-bottom: 1rem;">Best For:</h4>
            <div class="best-for-tags">
              ${site.best_for.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
          
          <div style="background: var(--color-background); padding: 1rem; border-radius: var(--radius-md); margin-top: 1.5rem;">
            <p style="font-size: 0.9rem; color: var(--color-text-light); margin-bottom: 0.5rem;">
              <strong>Payment Methods:</strong>
            </p>
            <p style="font-size: 0.95rem; color: var(--color-text);">
              ${site.payment_methods.join(', ')}
            </p>
          </div>
          
          <div style="background: var(--color-background); padding: 1rem; border-radius: var(--radius-md); margin-top: 1rem;">
            <p style="font-size: 0.9rem; color: var(--color-text-light); margin-bottom: 0.5rem;">
              <strong>Sports Coverage:</strong>
            </p>
            <p style="font-size: 0.95rem; color: var(--color-text);">
              ${site.sports.join(', ')}
            </p>
          </div>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: var(--radius-md); border-left: 4px solid #f59e0b;">
            <p style="font-size: 0.85rem; color: #92400e;">
              <strong>License:</strong> ${escapeHtml(site.license)}
            </p>
          </div>
        </div>
        
        <div class="review-footer">
          <div class="footer-bonus">
            <span class="footer-bonus-label">Welcome Offer:</span>
            <div>
              <span class="footer-bonus-value">${escapeHtml(site.welcome_bonus)}</span>
              <small class="footer-bonus-explainer">${getBonusExplanation(site.welcome_bonus)}</small>
            </div>
          </div>
          <a href="${site.ref_url}" target="_blank" rel="noopener" class="btn btn-primary">
            Claim ${getSimplifiedBonus(site.welcome_bonus)} →
          </a>
        </div>
      </article>
    `;
  }).join('');
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
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getBonusExplanation(bonus) {
  // Add helpful explanations for different bonus types
  if (bonus.includes('%')) {
    // Match bonus (e.g., "200% up to R5,000")
    return 'Deposit match - they add this % to your deposit';
  } else if (bonus.toLowerCase().includes('sign-up') || bonus.toLowerCase().includes('free')) {
    // Free bonus (e.g., "R25 Sign-Up Bonus")
    return 'Free money on sign-up, no deposit needed';
  } else if (bonus.toLowerCase().includes('up to')) {
    // Generic up to bonus
    return 'Bonus on first deposit';
  }
  return 'Welcome offer for new users';
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
