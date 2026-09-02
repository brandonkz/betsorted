(function () {
  var DATA_URL = '/data/operators.json';

  var QUESTIONS = [
    {
      key: 'experience',
      title: 'What are you trying to do?',
      description: 'Pick the closest match. This tool is for choosing the right betting site, not for picking bets.',
      options: [
        { value: 'first', label: 'Open my first account', detail: 'I want the safest, easiest place to start.' },
        { value: 'compare', label: 'Add a second account', detail: 'I already bet and want a stronger comparison option.' },
        { value: 'bonus', label: 'Chase better promos', detail: 'I mainly care about sign-up value or ongoing rewards.' }
      ]
    },
    {
      key: 'sport',
      title: 'What do you mostly bet on?',
      description: 'This shapes which sites make sense first.',
      options: [
        { value: 'psl', label: 'PSL and local soccer', detail: 'I care most about South African football and simple slips.' },
        { value: 'rugby', label: 'Rugby', detail: 'Springboks, URC, Currie Cup, internationals.' },
        { value: 'cricket', label: 'Cricket', detail: 'Proteas, SA20, Tests, T20s and wider coverage.' },
        { value: 'mixed', label: 'Mixed sports', detail: 'I want broad market depth across multiple sports.' },
        { value: 'casino_mix', label: 'Sport plus casino', detail: 'I also want casino-style products in the same account.' }
      ]
    },
    {
      key: 'bankroll',
      title: 'What starting bankroll feels realistic?',
      description: 'Minimum deposit friction changes which account makes sense.',
      options: [
        { value: 'tiny', label: 'Under R50', detail: 'I want to start small and test carefully.' },
        { value: 'small', label: 'R50 to R200', detail: 'I can fund one or two test deposits.' },
        { value: 'flex', label: 'R200+', detail: 'Minimums matter less than features and pricing.' }
      ]
    },
    {
      key: 'priority',
      title: 'What matters most right now?',
      description: 'Choose the one thing that should dominate the recommendation.',
      options: [
        { value: 'easy', label: 'Easy first experience', detail: 'Low friction, simple app, not too many moving parts.' },
        { value: 'withdrawals', label: 'Withdrawal confidence', detail: 'I care about practical payout routes and low hassle.' },
        { value: 'odds', label: 'Odds and market depth', detail: 'I compare prices and want more coverage.' },
        { value: 'rewards', label: 'Ongoing rewards', detail: 'Cashback, recurring promos, loyalty value.' }
      ]
    },
    {
      key: 'style',
      title: 'How do you want to use the site?',
      description: 'This decides whether we recommend a simple main account or a comparison setup.',
      options: [
        { value: 'one', label: 'One main account', detail: 'Give me the simplest best-fit answer.' },
        { value: 'two', label: 'Main plus backup', detail: 'I want a best match and a sharper comparison option.' },
        { value: 'local', label: 'Local and familiar', detail: 'I prefer SA-feeling sites over international-style depth.' }
      ]
    }
  ];

  var SPORT_HINTS = {
    betway: { cricket: 5, rugby: 4, psl: 4, odds: 5, easy: 4 },
    hollywoodbets: { psl: 5, local: 5, bankrollLow: 5, beginner: 5, easy: 5, rewards: 3 },
    sportingbet: { odds: 5, rugby: 5, cricket: 4, psl: 4, established: 5 },
    supabets: { psl: 4, local: 4, bankrollLow: 5, rewards: 3 },
    '10bet': { odds: 4, cricket: 4, easy: 4, established: 4 },
    'play-co-za': { casinoMix: 5, bankrollLow: 5, easy: 4 },
    'world-sports-betting': { local: 5, psl: 4, rugby: 3, rewards: 3, established: 4 },
    easybet: { beginner: 4, easy: 5, bankrollLow: 4 },
    gbets: { beginner: 4, bankrollLow: 5, rewards: 3, local: 4 },
    sunbet: { rewards: 3, established: 4, local: 3 },
    'bet-co-za': { local: 4, rewards: 3 },
    betfred: { odds: 3, established: 3 },
    betolimp: { odds: 3 },
    betshezi: { beginner: 4, bankrollLow: 5, local: 4 },
    lottostar: { casinoMix: 4, bankrollLow: 4, rewards: 3, local: 4 },
    playabets: { rewards: 4, bankrollLow: 3, easy: 4, local: 4, casinoMix: 3 },
    yesplay: { casinoMix: 4, bankrollLow: 4, rewards: 3, easy: 4 }
  };

  function getPageVariant() {
    return document.body && document.body.getAttribute('data-site-matcher-page') || 'general';
  }

  function shouldShowFloatingLauncher() {
    return getPageVariant() !== 'homepage';
  }

  function getTeaserConfig() {
    if (getPageVariant() === 'homepage') {
      return {
        eyebrow: 'BETSORTED CASINO FINDER',
        title: 'Find the right casino in four questions',
        description: 'Tell us how you play and what matters to you. We compare South African casinos by deposit size, rewards, loyalty benefits, game selection and data-free access. Then we recommend your best match.',
        bullets: ['Low deposits', 'Best rewards', 'Strong loyalty', 'Data-free play', 'Sports + casino'],
        primaryCta: 'Try the casino finder',
        secondaryCta: 'Open the AI'
      };
    }

    return {
      eyebrow: '',
      title: 'Use BetSorted AI to narrow the field',
      description: 'Answer five quick questions and get a shortlist based on bankroll, sport, rewards, and hassle level. It now scores against the wider BetSorted operator dataset, not just a tiny handpicked list.',
      bullets: [],
      primaryCta: 'Try the AI shortlist',
      secondaryCta: 'Open the AI'
    };
  }

  function ensureAnalytics(eventName, payload) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }

  function unique(arr) {
    return Array.from(new Set(arr.filter(Boolean)));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getBrandMark(name) {
    var cleaned = String(name || '')
      .replace(/\.co\.za/gi, '')
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim();
    if (!cleaned) return 'BET';

    var words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      return words.slice(0, 3).map(function (word) {
        return word.charAt(0).toUpperCase();
      }).join('');
    }

    var compact = words[0].toUpperCase();
    return compact.length <= 4 ? compact : compact.slice(0, 3);
  }

  function textIncludes(text, needles) {
    return needles.some(function (needle) {
      return text.indexOf(needle) !== -1;
    });
  }

  function parseRating(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      var match = value.match(/(\d+(\.\d+)?)/);
      return match ? Number(match[1]) : null;
    }
    return null;
  }

  function parseMinDeposit(value) {
    if (typeof value === 'number') return value;
    return null;
  }

  function payoutScore(speed) {
    var text = String(speed || '').toLowerCase();
    if (!text || text === 'coming soon') return 2;
    if (textIncludes(text, ['instant', 'minutes'])) return 5;
    if (textIncludes(text, ['12-24', '12 to 24'])) return 4;
    if (textIncludes(text, ['24-48', '24 to 48'])) return 3;
    if (textIncludes(text, ['24-72', '24 to 72'])) return 2;
    return 2;
  }

  function isAffiliateReady(operator) {
    return operator.go_url && operator.affiliate_url && operator.affiliate_url !== 'Coming soon';
  }

  function tagFromPayments(payments) {
    if (payments.indexOf('1voucher') !== -1 || payments.indexOf('kazang') !== -1 || payments.indexOf('ott voucher') !== -1) {
      return 'Voucher support';
    }
    if (payments.indexOf('instant eft') !== -1) {
      return 'Instant EFT';
    }
    return '';
  }

  function buildTags(operator, fit) {
    var tags = [];
    if (fit.psl >= 4) tags.push('PSL');
    if (fit.rugby >= 4) tags.push('Rugby');
    if (fit.cricket >= 4) tags.push('Cricket');
    if (fit.casinoMix >= 4) tags.push('Sport + casino');
    if (fit.bankrollLow >= 4) tags.push('Low minimums');
    if (fit.odds >= 4) tags.push('Odds depth');
    if (fit.local >= 4) tags.push('Local brand');
    if (fit.rewards >= 4) tags.push('Rewards');
    var paymentTag = tagFromPayments(operator._paymentsLower || []);
    if (paymentTag) tags.push(paymentTag);
    return unique(tags).slice(0, 4);
  }

  function buildReasons(operator, fit) {
    var reasons = [];
    if (fit.beginner >= 4) reasons.push('Easy to start with if you want less friction on your first account.');
    if (fit.bankrollLow >= 4) reasons.push('Works better than most if you want to start with a smaller bankroll.');
    if (fit.odds >= 4) reasons.push('Stronger comparison option if prices and market depth matter to you.');
    if (fit.psl >= 4) reasons.push('Makes more sense if PSL and local soccer are the main use case.');
    if (fit.rugby >= 4) reasons.push('Worth keeping in the mix if rugby matters more than generic sportsbook breadth.');
    if (fit.cricket >= 4) reasons.push('More relevant than average if cricket is one of your core sports.');
    if (fit.casinoMix >= 4) reasons.push('Better fit if you want sport and casino-style products in one account.');
    if (fit.local >= 4) reasons.push('Feels closer to local South African betting habits than some international-style books.');
    if (operator.summary) reasons.push(operator.summary);
    return unique(reasons).slice(0, 3);
  }

  function buildRewardNote(operator, fit) {
    if (fit.rewards >= 4 && operator.community_quote) {
      return operator.community_quote;
    }
    if (operator.summary) {
      return operator.summary;
    }
    return 'Review the operator page before depositing so you can verify the current recurring value and promo terms.';
  }

  function isCautionaryText(text) {
    var normalized = String(text || '').toLowerCase().trim();
    if (!normalized) return false;

    if (textIncludes(normalized, [
      'trusted by south african punters',
      'popular with south african punters',
      'well-liked by south african punters'
    ])) {
      return false;
    }

    return textIncludes(normalized, [
      'watch',
      'expires',
      'rollover',
      'wager',
      'wagering',
      'withdraw',
      'withdrawal',
      'qualifying',
      'terms',
      'cap',
      'charge',
      'manual',
      'email',
      'freeze',
      'restricted',
      'restriction',
      'not returned',
      'bonus',
      'promo',
      'verify',
      'unclear',
      'hard to inspect',
      'need to inspect',
      'inconsistent'
    ]);
  }

  function buildWatchout(operator) {
    if (isCautionaryText(operator.community_quote)) {
      return operator.community_quote;
    }
    if (!operator.bonus_verified_at || String(operator.bonus_verified_at).toLowerCase() === 'coming soon') {
      return "Catch coming soon. We're still checking the bonus terms on this one.";
    }
    if (!operator.payout_speed || String(operator.payout_speed).toLowerCase() === 'coming soon') {
      return "Catch coming soon. We're still checking the payout details on this one.";
    }
    return 'Check the latest review and current terms before choosing it mainly for a promotion.';
  }

  function normalizeOperator(raw) {
    var summary = String(raw.summary || '');
    var quote = String(raw.community_quote || '');
    var text = (raw.name + ' ' + summary + ' ' + quote).toLowerCase();
    var rating = parseRating(raw.rating);
    var minDeposit = parseMinDeposit(raw.min_deposit_zar);
    var paymentsLower = (raw.payment_methods || []).map(function (item) {
      return String(item).toLowerCase();
    });
    var currentYear = new Date().getFullYear();
    var ageScore = raw.established ? clamp(Math.round((currentYear - raw.established) / 6), 1, 5) : 2;
    var minDepositScore = minDeposit === null ? 2 : minDeposit <= 10 ? 5 : minDeposit <= 20 ? 4 : minDeposit <= 50 ? 2 : 1;
    var easyScore = 2
      + (textIncludes(text, ['clean', 'slick', 'modern', 'smooth', 'accessible', 'easy', 'simple']) ? 1 : 0)
      + (textIncludes(text, ['casual', 'low minimum', 'low minimums', 'accessible']) ? 1 : 0);
    var localScore = 1
      + (textIncludes(text, ['south african', 'sa operator', 'local', 'psl', 'horse racing']) ? 1 : 0)
      + (paymentsLower.indexOf('cash') !== -1 ? 1 : 0)
      + (paymentsLower.indexOf('1voucher') !== -1 ? 1 : 0)
      + (paymentsLower.indexOf('kazang') !== -1 ? 1 : 0);
    var rewardsScore = 1
      + (textIncludes(text, ['rewards', 'cashback', 'rakeback', 'loyalty', 'promotions', 'bonus']) ? 1 : 0)
      + (textIncludes(text, ['free bet', 'insurance']) ? 1 : 0);
    var oddsScore = 1
      + (rating !== null && rating >= 4.5 ? 1 : 0)
      + (textIncludes(text, ['competitive odds', 'solid odds', 'odds', 'markets', 'live streaming', 'coverage']) ? 1 : 0);
    var fit = {
      beginner: clamp((minDepositScore + easyScore) / 2, 1, 5),
      easy: clamp(easyScore, 1, 5),
      bankrollLow: clamp(minDepositScore, 1, 5),
      withdrawals: payoutScore(raw.payout_speed),
      psl: textIncludes(text, ['psl', 'local soccer']) ? 4 : 2,
      rugby: textIncludes(text, ['rugby', 'springbok', 'urc']) ? 4 : 2,
      cricket: textIncludes(text, ['cricket', 'sa20', 'proteas']) ? 4 : 2,
      rewards: clamp(rewardsScore, 1, 5),
      casinoMix: textIncludes(text, ['casino', 'live casino', 'slots']) ? 4 : 1,
      established: clamp(ageScore, 1, 5),
      local: clamp(localScore, 1, 5),
      odds: clamp(oddsScore, 1, 5)
    };

    var override = SPORT_HINTS[raw.slug] || {};
    Object.keys(override).forEach(function (key) {
      fit[key] = override[key];
    });

    var actionHref = raw.go_url || raw.review_url || '';
    var actionLabel = raw.go_url ? ('Visit ' + raw.name) : 'Read review';
    var tags = buildTags({ _paymentsLower: paymentsLower }, fit);
    var reasons = buildReasons(raw, fit);
    var watchout = buildWatchout(raw);
    var rewardNote = buildRewardNote(raw, fit);

    return {
      id: raw.slug,
      name: raw.name,
      primaryUrl: actionHref,
      reviewUrl: raw.review_url || '',
      ctaLabel: actionLabel,
      reviewLabel: 'Read review',
      welcomeBonus: raw.welcome_bonus || 'Coming soon',
      loyaltyNote: rewardNote,
      watchout: watchout,
      reasons: reasons,
      tags: tags,
      fit: fit,
      brandMark: getBrandMark(raw.name),
      logoColor: raw.logo_color || '#1d4ed8',
      logoImage: raw.logo_image || raw.logo_url || '',
      raw: raw
    };
  }

  function getScore(operator, answers) {
    var score = 0;
    var fit = operator.fit;

    if (answers.experience === 'first') score += fit.beginner * 2 + fit.easy;
    if (answers.experience === 'compare') score += fit.odds * 2 + fit.established;
    if (answers.experience === 'bonus') score += fit.rewards * 2 + fit.easy;

    if (answers.sport === 'psl') score += fit.psl * 2 + fit.local;
    if (answers.sport === 'rugby') score += fit.rugby * 2;
    if (answers.sport === 'cricket') score += fit.cricket * 2;
    if (answers.sport === 'mixed') score += fit.odds * 2 + fit.established;
    if (answers.sport === 'casino_mix') score += fit.casinoMix * 3;

    if (answers.bankroll === 'tiny') score += fit.bankrollLow * 2 + fit.easy;
    if (answers.bankroll === 'small') score += fit.bankrollLow + fit.easy;
    if (answers.bankroll === 'flex') score += fit.odds + fit.established;

    if (answers.priority === 'easy') score += fit.easy * 3 + fit.beginner;
    if (answers.priority === 'withdrawals') score += fit.withdrawals * 3;
    if (answers.priority === 'odds') score += fit.odds * 3;
    if (answers.priority === 'rewards') score += fit.rewards * 3;

    if (answers.style === 'one') score += fit.beginner + fit.easy;
    if (answers.style === 'two') score += fit.odds * 2;
    if (answers.style === 'local') score += fit.local * 2;

    if (getPageVariant() === 'best-sites') {
      score += fit.beginner + fit.established;
    }

    if (getPageVariant() === 'bookmakers-hub') {
      score += fit.odds + fit.rewards;
    }

    if (!operator.primaryUrl) {
      score -= 1;
    }

    return score;
  }

  function rankOperators(operators, answers) {
    return operators
      .map(function (operator) {
        return {
          operator: operator,
          score: getScore(operator, answers)
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
  }

  function buildSummary(answers) {
    if (answers.experience === 'first' && answers.priority === 'easy') {
      return 'You wanted the easiest sensible place to start, so the ranking leans toward simple onboarding, lower-friction deposits, and practical local fit.';
    }
    if (answers.priority === 'odds') {
      return 'You cared most about deeper markets and sharper comparison value, so the ranking leans toward sportsbook strength over pure simplicity.';
    }
    if (answers.sport === 'casino_mix') {
      return 'You asked for sport plus casino-style products, so the ranking gives extra weight to entertainment mix and low-friction entry.';
    }
    return 'These picks balance your sport, bankroll, and friction tolerance using the wider BetSorted operator dataset rather than a tiny hand-picked shortlist.';
  }

  function appendMatcherTracking(url, operator, linkType) {
    if (!url) return '';

    try {
      var resolved = new URL(url, window.location.origin);
      var matcherPage = getPageVariant();
      var content = matcherPage + '_' + linkType;

      if (!resolved.searchParams.has('utm_source')) {
        resolved.searchParams.set('utm_source', 'betsorted');
      }
      if (!resolved.searchParams.has('utm_medium')) {
        resolved.searchParams.set('utm_medium', 'ai_finder');
      }
      if (!resolved.searchParams.has('utm_campaign')) {
        resolved.searchParams.set('utm_campaign', 'ai_finder_' + matcherPage);
      }
      if (!resolved.searchParams.has('utm_content')) {
        resolved.searchParams.set('utm_content', content);
      }
      if (!resolved.searchParams.has('utm_term')) {
        resolved.searchParams.set('utm_term', operator.id);
      }

      if (linkType === 'visit' && resolved.origin === window.location.origin && resolved.pathname.indexOf('/go/') === 0 && !resolved.searchParams.has('subid')) {
        resolved.searchParams.set('subid', 'ai-finder-' + matcherPage);
      }

      if (resolved.origin === window.location.origin) {
        return resolved.pathname + resolved.search + resolved.hash;
      }

      return resolved.toString();
    } catch (err) {
      return url;
    }
  }

  function buildActionLinks(operator) {
    var links = [];
    var trackedPrimaryUrl = appendMatcherTracking(operator.primaryUrl, operator, 'visit');
    var trackedReviewUrl = appendMatcherTracking(operator.reviewUrl, operator, 'review');
    var hasDistinctReview = operator.reviewUrl && operator.reviewUrl !== operator.primaryUrl;

    if (trackedPrimaryUrl) {
      links.push(
        '<a class="site-matcher-primary-link" href="' + trackedPrimaryUrl + '" data-matcher-operator="' + operator.id + '" data-matcher-link-type="visit">' +
          operator.ctaLabel +
        '</a>'
      );
    }

    if (trackedReviewUrl && hasDistinctReview) {
      links.push(
        '<a class="site-matcher-secondary-link" href="' + trackedReviewUrl + '" data-matcher-operator="' + operator.id + '" data-matcher-link-type="review">' +
          'Read review' +
        '</a>'
      );
    }

    return links.join('');
  }

  function createMatcher(operators) {
    var state = {
      step: 0,
      answers: {}
    };
    var teaserConfig = getTeaserConfig();

    var teaserTargets = document.querySelectorAll('[data-site-matcher-teaser]');
    teaserTargets.forEach(function (target) {
      var eyebrowHtml = teaserConfig.eyebrow
        ? '<div class="site-matcher-teaser-eyebrow">' + teaserConfig.eyebrow + '</div>'
        : '';
      var bulletHtml = teaserConfig.bullets.length
        ? '<div class="site-matcher-teaser-bullets">' + teaserConfig.bullets.map(function (bullet) {
            return '<span>' + bullet + '</span>';
          }).join('') + '</div>'
        : '';
      target.innerHTML = '' +
        '<div class="site-matcher-teaser">' +
          eyebrowHtml +
          '<h2>' + teaserConfig.title + '</h2>' +
          '<p>' + teaserConfig.description + '</p>' +
          bulletHtml +
          '<div class="site-matcher-teaser-actions">' +
            '<button class="site-matcher-open" type="button" data-site-matcher-trigger="teaser">' + teaserConfig.primaryCta + '</button>' +
            '<button class="site-matcher-secondary" type="button" data-site-matcher-trigger="teaser-secondary">' + teaserConfig.secondaryCta + '</button>' +
          '</div>' +
        '</div>';
    });

    var launcher = null;
    if (shouldShowFloatingLauncher()) {
      launcher = document.createElement('button');
      launcher.type = 'button';
      launcher.className = 'site-matcher-launcher';
      launcher.setAttribute('aria-haspopup', 'dialog');
      launcher.innerHTML = '<span>AI</span><strong>Find my best-fit site</strong>';
    }

    var overlay = document.createElement('div');
    overlay.className = 'site-matcher-overlay';
    overlay.innerHTML = '' +
      '<div class="site-matcher-modal" role="dialog" aria-modal="true" aria-labelledby="site-matcher-title">' +
        '<div class="site-matcher-shell">' +
          '<section class="site-matcher-panel site-matcher-panel--flow">' +
            '<button class="site-matcher-close" type="button" aria-label="Close matcher">×</button>' +
            '<h2 id="site-matcher-title" class="site-matcher-title">' + (getPageVariant() === 'homepage' ? 'Find your best-fit casino or betting site' : 'Find your best-fit betting site') + '</h2>' +
            '<div class="site-matcher-progress">' +
              '<strong>Step <span data-progress-step>1</span> of ' + QUESTIONS.length + '</strong>' +
              '<div class="site-matcher-progress-bar"><span data-progress-bar style="width:20%"></span></div>' +
            '</div>' +
            '<div data-site-matcher-stage></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    if (launcher) {
      document.body.appendChild(launcher);
    }
    document.body.appendChild(overlay);

    var stage = overlay.querySelector('[data-site-matcher-stage]');
    var progressStep = overlay.querySelector('[data-progress-step]');
    var progressBar = overlay.querySelector('[data-progress-bar]');
    var progress = overlay.querySelector('.site-matcher-progress');

    function openMatcher(source) {
      overlay.classList.add('is-open');
      document.body.classList.add('site-matcher-open');
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.site-matcher-modal').scrollTop = 0;
      ensureAnalytics('matcher_open', {
        matcher_source: source || 'launcher',
        matcher_page: getPageVariant(),
        page_location: window.location.pathname,
        matcher_dataset_size: operators.length
      });
      render();
    }

    function closeMatcher() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('site-matcher-open');
      document.body.style.overflow = '';
    }

    function renderQuestion() {
      var question = QUESTIONS[state.step];
      progress.classList.remove('is-hidden');
      progressStep.textContent = String(state.step + 1);
      progressBar.style.width = (((state.step + 1) / QUESTIONS.length) * 100) + '%';

      var optionsHtml = question.options.map(function (option) {
        return '' +
          '<button class="site-matcher-option" type="button" data-answer-value="' + option.value + '">' +
            '<strong>' + option.label + '</strong>' +
            '<span>' + option.detail + '</span>' +
          '</button>';
      }).join('');

      stage.innerHTML = '' +
        '<div class="site-matcher-question">' +
          '<h3>' + question.title + '</h3>' +
          '<p>' + question.description + '</p>' +
          '<div class="site-matcher-options">' + optionsHtml + '</div>' +
          '<div class="site-matcher-actions">' +
            (state.step > 0 ? '<button class="site-matcher-back" type="button">Back</button>' : '<span></span>') +
          '</div>' +
        '</div>';

      stage.querySelectorAll('[data-answer-value]').forEach(function (button) {
        button.addEventListener('click', function () {
          state.answers[question.key] = button.getAttribute('data-answer-value');
          if (state.step < QUESTIONS.length - 1) {
            state.step += 1;
            render();
            return;
          }
          renderResults();
        });
      });

      var back = stage.querySelector('.site-matcher-back');
      if (back) {
        back.addEventListener('click', function () {
          state.step -= 1;
          render();
        });
      }
    }

    function renderResults() {
      var ranked = rankOperators(operators, state.answers);
      var top = ranked.slice(0, 3);
      progress.classList.add('is-hidden');

      var cardsHtml = top.map(function (entry, index) {
        var operator = entry.operator;
        var reasonText = operator.reasons[0] || operator.loyaltyNote;
        var reasonChips = operator.tags.map(function (tag) {
          return '<span class="site-matcher-chip">' + tag + '</span>';
        }).join('');
        var actionLinks = buildActionLinks(operator);
        var logoMarkup = operator.logoImage
          ? '<img class="site-matcher-brand-logo-image" src="' + operator.logoImage + '" alt="' + operator.name + ' logo" loading="lazy">'
          : '<span class="site-matcher-brand-logo-fallback">' + operator.brandMark + '</span>';

        return '' +
          '<article class="site-matcher-card' + (index === 0 ? ' site-matcher-card--best' : '') + '">' +
            '<div class="site-matcher-card-head">' +
              '<span class="site-matcher-badge">#' + (index + 1) + '</span>' +
              '<div class="site-matcher-brand-block">' +
                '<div class="site-matcher-brand-logo" style="--brand-accent:' + operator.logoColor + ';">' +
                  logoMarkup +
                '</div>' +
                '<div class="site-matcher-brand-copy">' +
                  '<h4>' + operator.name + '</h4>' +
                  '<span class="site-matcher-card-kicker">Welcome offer</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="site-matcher-value-card site-matcher-value-card--hero">' +
              '<span class="site-matcher-value-label">Welcome bonus</span>' +
              '<strong>' + operator.welcomeBonus + '</strong>' +
            '</div>' +
            '<div class="site-matcher-card-actions">' + actionLinks + '</div>' +
            '<div class="site-matcher-chip-row">' + reasonChips + '</div>' +
            '<div class="site-matcher-card-copy">' +
              '<span class="site-matcher-value-label">Why it fits</span>' +
              '<p>' + reasonText + '</p>' +
            '</div>' +
            '<div class="site-matcher-watchout"><strong>Watch out:</strong> ' + operator.watchout + '</div>' +
          '</article>';
      }).join('');

      stage.innerHTML = '' +
        '<div class="site-matcher-results">' +
          '<h3>Your shortlist</h3>' +
          '<p>' + buildSummary(state.answers) + '</p>' +
          '<div class="site-matcher-result-list">' + cardsHtml + '</div>' +
          '<div class="site-matcher-footer">18+ only. Gamble responsibly. <a href="/responsible-gambling.html">Responsible gambling</a> · NRGP 0800 006 008</div>' +
          '<div class="site-matcher-actions">' +
            '<button class="site-matcher-back" type="button">Back</button>' +
            '<button class="site-matcher-reset" type="button">Start again</button>' +
          '</div>' +
        '</div>';

      ensureAnalytics('matcher_complete', {
        matcher_page: getPageVariant(),
        page_location: window.location.pathname,
        answer_experience: state.answers.experience,
        answer_sport: state.answers.sport,
        answer_bankroll: state.answers.bankroll,
        answer_priority: state.answers.priority,
        answer_style: state.answers.style,
        top_pick: top[0] ? top[0].operator.id : '',
        matcher_dataset_size: operators.length
      });

      stage.querySelector('.site-matcher-back').addEventListener('click', function () {
        state.step = QUESTIONS.length - 1;
        render();
      });

      stage.querySelector('.site-matcher-reset').addEventListener('click', function () {
        state.step = 0;
        state.answers = {};
        render();
      });

      stage.querySelectorAll('[data-matcher-operator]').forEach(function (link) {
        link.addEventListener('click', function () {
          ensureAnalytics('matcher_cta_click', {
            matcher_page: getPageVariant(),
            page_location: window.location.pathname,
            operator: link.getAttribute('data-matcher-operator'),
            destination: link.getAttribute('href')
          });
        });
      });
    }

    function render() {
      if (state.step >= QUESTIONS.length || Object.keys(state.answers).length === QUESTIONS.length) {
        renderResults();
        return;
      }
      renderQuestion();
    }

    if (launcher) {
      launcher.addEventListener('click', function () {
        openMatcher('launcher');
      });
    }

    document.querySelectorAll('[data-site-matcher-trigger]').forEach(function (button) {
      button.addEventListener('click', function () {
        openMatcher(button.getAttribute('data-site-matcher-trigger'));
      });
    });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeMatcher();
      }
    });

    overlay.querySelector('.site-matcher-close').addEventListener('click', closeMatcher);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeMatcher();
      }
    });

    setTimeout(function () {
      if (!overlay.classList.contains('is-open') && window.innerWidth > 720) {
        var heroTeaser = document.querySelector('.site-matcher-teaser');
        if (heroTeaser) {
          heroTeaser.classList.add('site-matcher-teaser--pulse');
        }
      }
    }, 3500);
  }

  function loadOperators() {
    return fetch(DATA_URL, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load matcher data: ' + response.status);
        }
        return response.json();
      })
      .then(function (items) {
        return items
          .filter(function (item) {
            return item && item.slug && item.name && (item.review_url || item.go_url);
          })
          .map(normalizeOperator);
      });
  }

  function initSiteMatcher() {
    if (!document.querySelector('[data-site-matcher-teaser]')) {
      return;
    }

    loadOperators().then(function (operators) {
      createMatcher(operators);
    }).catch(function () {
      var targets = document.querySelectorAll('[data-site-matcher-teaser]');
      targets.forEach(function (target) {
        target.innerHTML = '<div class="site-matcher-teaser"><h2>BetSorted AI is loading</h2><p>The site shortlist is temporarily unavailable. Open the bookmaker hub or refresh in a moment.</p></div>';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteMatcher);
  } else {
    initSiteMatcher();
  }
})();
