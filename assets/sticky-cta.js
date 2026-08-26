(() => {
  const storageKey = 'betsortedStickyCtaDismissed';
  try {
    if (sessionStorage.getItem(storageKey) === '1') {
      return;
    }
  } catch (err) {
    // sessionStorage unavailable; continue without persistence
  }

  const path = window.location.pathname || '/';
  if (path.includes('best-odds-finder')) {
    return;
  }

  const isHome = path === '/' || path === '/index.html';
  const isBlogPost = path.startsWith('/blog/') && path !== '/blog/index.html';
  const isBlogIndex = path === '/blog/index.html';
  const isCalculator = path.includes('calculator');
  const isComparison = path.includes('comparison') || path.includes('odds') || path.includes('best-odds');

  const ctaConfig = (() => {
    if (isHome) {
      return {
        messages: [
          "Find your best-fit casino or betting site in four questions → Try the AI Finder",
          "Tell us whether you want rewards, loyalty or low deposits → Open the AI"
        ],
        buttonText: 'Try the AI Finder',
        action: 'matcher'
      };
    }

    if (isBlogPost || isBlogIndex) {
      return {
        messages: [
          "📊 Free betting calculators for SA punters → Try the Calculators",
          "Plan your stake with free SA betting calculators → Try the Calculators"
        ],
        buttonText: 'Try the Calculators',
        action: 'link',
        href: '/calculators.html'
      };
    }

    if (isCalculator) {
      return {
        messages: [
          "📖 Read our latest betting guides → View Guides",
          "Level up your bets with our betting guides → View Guides"
        ],
        buttonText: 'View Guides',
        action: 'link',
        href: '/blog/index.html'
      };
    }

    if (isComparison) {
      return {
        messages: [
          "🧮 Calculate your potential returns → Betting Calculator",
          "Estimate payouts fast before you place a bet → Betting Calculator"
        ],
        buttonText: 'Betting Calculator',
        action: 'link',
        href: '/betting-calculator.html'
      };
    }

    return {
      messages: [
        "🧮 Calculate your potential returns → Betting Calculator",
        "Estimate payouts fast before you place a bet → Betting Calculator"
      ],
      buttonText: 'Betting Calculator',
      action: 'link',
      href: '/betting-calculator.html'
    };
  })();

  const style = document.createElement('style');
  style.textContent = `
    .sticky-cta-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: #0b1120;
      color: #f8fafc;
      box-shadow: 0 -8px 20px rgba(11, 17, 32, 0.35);
    }
    .sticky-cta-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 0.95rem;
    }
    .sticky-cta-message {
      font-weight: 600;
      line-height: 1.4;
    }
    .sticky-cta-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .sticky-cta-button {
      background: #2563eb;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .sticky-cta-button:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
    .sticky-cta-close {
      background: transparent;
      border: 1px solid rgba(148, 163, 184, 0.6);
      color: #e2e8f0;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease;
    }
    .sticky-cta-close:hover {
      border-color: #f8fafc;
      color: #ffffff;
    }
    @media (max-width: 720px) {
      .sticky-cta-bar {
        left: 12px;
        right: 12px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
        border-radius: 18px;
      }
      .sticky-cta-inner {
        padding: 10px 12px;
        gap: 10px;
      }
      .sticky-cta-actions {
        gap: 8px;
      }
      .sticky-cta-button {
        padding: 10px 14px;
        font-size: 0.85rem;
      }
      .sticky-cta-message {
        font-size: 0.86rem;
        line-height: 1.35;
      }
    }
    @media (max-width: 540px) {
      .sticky-cta-inner {
        align-items: center;
      }
      .sticky-cta-message {
        display: none;
      }
      .sticky-cta-actions {
        width: 100%;
        justify-content: stretch;
      }
      .sticky-cta-button {
        flex: 1;
        text-align: center;
      }
      .sticky-cta-close {
        flex-shrink: 0;
      }
    }
  `;

  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'sticky-cta-bar';
  bar.innerHTML = `
    <div class="sticky-cta-inner">
      <div class="sticky-cta-message" aria-live="polite"></div>
      <div class="sticky-cta-actions">
        ${ctaConfig.action === 'matcher'
          ? `<button class="sticky-cta-button" type="button">${ctaConfig.buttonText}</button>`
          : `<a class="sticky-cta-button" href="${ctaConfig.href}">${ctaConfig.buttonText}</a>`}
        <button class="sticky-cta-close" type="button" aria-label="Dismiss call to action">×</button>
      </div>
    </div>
  `;

  const messageEl = bar.querySelector('.sticky-cta-message');
  let msgIndex = 0;
  messageEl.textContent = ctaConfig.messages[msgIndex];

  const rotateMessages = () => {
    if (ctaConfig.messages.length < 2) return;
    msgIndex = (msgIndex + 1) % ctaConfig.messages.length;
    messageEl.textContent = ctaConfig.messages[msgIndex];
  };

  const intervalId = setInterval(rotateMessages, 6000);

  const bodyPaddingBottom = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;

  document.body.appendChild(bar);

  const barHeight = bar.offsetHeight || 72;
  document.body.style.paddingBottom = `${bodyPaddingBottom + barHeight + 16}px`;

  const primaryButton = bar.querySelector('.sticky-cta-button');
  if (ctaConfig.action === 'matcher' && primaryButton) {
    primaryButton.addEventListener('click', () => {
      const teaserTrigger = document.querySelector('[data-site-matcher-trigger="teaser"]');
      const floatingLauncher = document.querySelector('.site-matcher-launcher');
      if (teaserTrigger instanceof HTMLElement) {
        teaserTrigger.click();
        return;
      }
      if (floatingLauncher instanceof HTMLElement) {
        floatingLauncher.click();
      }
    });
  }

  const closeBtn = bar.querySelector('.sticky-cta-close');
  closeBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    bar.remove();
    document.body.style.paddingBottom = `${bodyPaddingBottom}px`;
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch (err) {
      // Ignore storage errors
    }
  });
})();
