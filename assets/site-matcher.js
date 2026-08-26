(function () {
  var OPERATORS = [
    {
      id: 'hollywoodbets',
      name: 'Hollywoodbets',
      primaryUrl: '/go/hollywoodbets.html?subid=matcher-top-pick',
      reviewUrl: '/bookmakers/hollywoodbets-review.html',
      ctaLabel: 'Visit site',
      reviewLabel: 'Read review',
      welcomeBonus: 'R25 free bet + 50 free spins',
      loyaltyNote: 'No loyalty programme found. Best recurring angle is Soccer Money Back and other rotating local promos.',
      fit: {
        beginner: 5,
        easy: 5,
        bankrollLow: 5,
        withdrawals: 4,
        psl: 5,
        rugby: 3,
        cricket: 3,
        rewards: 3,
        casinoMix: 3,
        established: 5,
        local: 5,
        odds: 3
      },
      reasons: [
        'Easy first account with low minimums.',
        'Strong fit for PSL, Lucky Numbers, and local betting habits.',
        'Useful if you want one simple account instead of a full comparison setup.'
      ],
      watchout: 'The interface can feel older than some rivals, and it is not always the sharpest odds option.',
      tags: ['Beginner-friendly', 'PSL', 'Low minimums', 'Local support']
    },
    {
      id: 'sportingbet',
      name: 'Sportingbet',
      primaryUrl: null,
      reviewUrl: '/bookmakers/sportingbet-review.html',
      ctaLabel: 'Read review',
      reviewLabel: 'Read review',
      welcomeBonus: 'Triple Welcome Bonus up to R3,000',
      loyaltyNote: 'SB Rewards exists, but the clearer value sits in the football and tennis multi cashback offers.',
      fit: {
        beginner: 2,
        easy: 2,
        bankrollLow: 2,
        withdrawals: 3,
        psl: 4,
        rugby: 5,
        cricket: 4,
        rewards: 3,
        casinoMix: 2,
        established: 4,
        local: 3,
        odds: 5
      },
      reasons: [
        'One of the stronger picks if you compare odds and want deeper sports coverage.',
        'Good match for rugby and experienced bettors who already know what they want.',
        'Useful as a second account when price matters more than simplicity.'
      ],
      watchout: 'Not the easiest first account if you want the quickest, least fiddly path from signup to first bet.',
      tags: ['Rugby', 'Odds depth', 'Live betting', 'Serious second account']
    },
    {
      id: 'betway',
      name: 'Betway',
      primaryUrl: null,
      reviewUrl: '/bookmakers/betway-review.html',
      ctaLabel: 'Read review',
      reviewLabel: 'Read review',
      welcomeBonus: '10 free spins + 10 free flights + R10 free bet',
      loyaltyNote: 'Rewards plus Bet Saver and Free Bet Club. Bet Saver is the cleanest recurring value.',
      fit: {
        beginner: 2,
        easy: 2,
        bankrollLow: 3,
        withdrawals: 3,
        psl: 4,
        rugby: 4,
        cricket: 5,
        rewards: 2,
        casinoMix: 2,
        established: 5,
        local: 3,
        odds: 5
      },
      reasons: [
        'Still a strong benchmark for broad sports coverage and deep markets.',
        'Best fit when cricket, live betting, and odds comparison matter most.',
        'Worth keeping in your comparison set even if you do not use it as your main account.'
      ],
      watchout: 'Read current promotion terms carefully before choosing it mainly for a sign-up offer.',
      tags: ['Cricket', 'Deep markets', 'Benchmark pricing', 'Live betting']
    },
    {
      id: '10bet',
      name: '10bet',
      primaryUrl: '/go/10bet.html?subid=matcher-top-pick',
      reviewUrl: '/bookmakers/10bet-review.html',
      ctaLabel: 'Visit site',
      reviewLabel: 'Read review',
      welcomeBonus: '100% first deposit match up to R5,000',
      loyaltyNote: 'Has a 50-level loyalty club, but Multi Bet Insurance is easier to understand than the loyalty points.',
      fit: {
        beginner: 3,
        easy: 4,
        bankrollLow: 1,
        withdrawals: 4,
        psl: 3,
        rugby: 3,
        cricket: 4,
        rewards: 2,
        casinoMix: 2,
        established: 4,
        local: 2,
        odds: 4
      },
      reasons: [
        'Good fit if you want a cleaner mobile experience and broader international sport.',
        'Stronger than many local-first sites for soccer, tennis, and general sportsbook depth.',
        'Useful when you want a more polished app feel without losing serious betting coverage.'
      ],
      watchout: 'The minimum deposit is usually higher than the cheapest local options, so it is less friendly for tiny starting bankrolls.',
      tags: ['Mobile feel', 'Soccer', 'International sport', 'Cleaner UI']
    },
    {
      id: 'easybet',
      name: 'Easybet',
      primaryUrl: null,
      reviewUrl: '/bookmakers/easybet-review.html',
      ctaLabel: 'Read review',
      reviewLabel: 'Read review',
      welcomeBonus: '150% first deposit up to R5,000 + R50 sign-up bonus',
      loyaltyNote: 'No published loyalty programme. The weekly cashback is the main ongoing reward worth checking.',
      fit: {
        beginner: 4,
        easy: 5,
        bankrollLow: 4,
        withdrawals: 4,
        psl: 3,
        rugby: 2,
        cricket: 2,
        rewards: 2,
        casinoMix: 1,
        established: 2,
        local: 3,
        odds: 2
      },
      reasons: [
        'Strong match if you want the least clutter and the fastest path to a simple bet.',
        'Works well for smaller weekend slips and casual mobile use.',
        'Good fallback when you care more about ease than deep market coverage.'
      ],
      watchout: 'You may outgrow it if you start comparing lots of sports, props, or live-betting angles.',
      tags: ['Simple', 'Low hassle', 'Casual slips', 'Mobile-first']
    },
    {
      id: 'wsb',
      name: 'World Sports Betting',
      primaryUrl: null,
      reviewUrl: '/bookmakers/world-sports-betting-review.html',
      ctaLabel: 'Read review',
      reviewLabel: 'Read review',
      welcomeBonus: '100% deposit match + free bet + 100 free spins',
      loyaltyNote: 'Club Prive exists, but the stronger value is usually in the birthday bonus and sport-specific insurance promos.',
      fit: {
        beginner: 2,
        easy: 2,
        bankrollLow: 3,
        withdrawals: 3,
        psl: 4,
        rugby: 3,
        cricket: 2,
        rewards: 3,
        casinoMix: 2,
        established: 4,
        local: 5,
        odds: 3
      },
      reasons: [
        'Best fit if South African sport, horse racing, and local familiarity matter more than modern design.',
        'Useful for PSL and Lucky Numbers-adjacent betting habits.',
        'A practical comparison account for local-market punters.'
      ],
      watchout: 'The app and site can feel dated, so it makes more sense as a functional second account than a slick first one.',
      tags: ['Local sport', 'PSL', 'Horse racing', 'Established local brand']
    },
    {
      id: 'supabets',
      name: 'Supabets',
      primaryUrl: null,
      reviewUrl: '/bookmakers/supabets-review.html',
      ctaLabel: 'Read review',
      reviewLabel: 'Read review',
      welcomeBonus: 'R50 free bet + 100 free spins + up to R5,000',
      loyaltyNote: 'No loyalty programme. Losing Leg Cashback is the main recurring offer worth caring about.',
      fit: {
        beginner: 3,
        easy: 3,
        bankrollLow: 4,
        withdrawals: 2,
        psl: 3,
        rugby: 2,
        cricket: 2,
        rewards: 2,
        casinoMix: 2,
        established: 3,
        local: 4,
        odds: 2
      },
      reasons: [
        'Better fit for low-stake bettors who use vouchers or want a budget-friendly local option.',
        'Makes sense when you care more about easy entry than premium polish.',
        'Useful as a secondary local account rather than a one-site-for-everything pick.'
      ],
      watchout: 'It is less polished than the bigger brands, so compare before making it your main account.',
      tags: ['Low stakes', 'Vouchers', 'Local option', 'Budget-friendly']
    },
    {
      id: 'playcoza',
      name: 'Play.co.za',
      primaryUrl: '/go/play-co-za.html?subid=matcher-top-pick',
      reviewUrl: '/bookmakers/play-co-za-review.html',
      ctaLabel: 'Visit site',
      reviewLabel: 'Read review',
      welcomeBonus: 'Up to R30,000 across 3 deposits',
      loyaltyNote: 'Has a loyalty wheel and layered promos, but Sport Predictor is the clearest ongoing value.',
      fit: {
        beginner: 3,
        easy: 4,
        bankrollLow: 5,
        withdrawals: 3,
        psl: 2,
        rugby: 1,
        cricket: 1,
        rewards: 2,
        casinoMix: 5,
        established: 3,
        local: 3,
        odds: 1
      },
      reasons: [
        'Best fit if you want a lighter, entertainment-style account with sport plus casino mix.',
        'Low entry point makes it easier to test with a small bankroll.',
        'A sensible choice when sportsbook depth matters less than convenience and variety.'
      ],
      watchout: 'Sports-first bettors will usually want deeper markets somewhere else as well.',
      tags: ['Casino mix', 'Low entry', 'Casual use', 'Modern feel']
    },
    {
      id: 'playabets',
      name: 'Playabets',
      primaryUrl: '/go/playabets.html?subid=matcher-top-pick',
      reviewUrl: '/bookmakers/playabets-review.html',
      ctaLabel: 'Visit site',
      reviewLabel: 'Read review',
      welcomeBonus: '100% first deposit match up to R3,000 + 50 free spins',
      loyaltyNote: 'Daily Rakeback is the cleanest loyalty-style benefit, with a bigger loyalty club behind it.',
      fit: {
        beginner: 3,
        easy: 4,
        bankrollLow: 3,
        withdrawals: 3,
        psl: 3,
        rugby: 2,
        cricket: 2,
        rewards: 3,
        casinoMix: 3,
        established: 2,
        local: 3,
        odds: 2
      },
      reasons: [
        'Good middle-ground pick if you want a straightforward local account without too much friction.',
        'Useful for simple football slips and a less overwhelming experience.',
        'Worth checking if you want a direct-site option but do not need the deepest sportsbook.'
      ],
      watchout: 'It is more of a practical casual option than a best-in-class odds shopping account.',
      tags: ['Straightforward', 'Local account', 'Simple slips', 'Casual']
    }
  ];

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

  function getPageVariant() {
    return document.body && document.body.getAttribute('data-site-matcher-page') || 'general';
  }

  function ensureAnalytics(eventName, payload) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }

  function unique(arr) {
    return Array.from(new Set(arr));
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

  function rankOperators(answers) {
    return OPERATORS
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

  function getPrimaryLink(operator) {
    if (operator.primaryUrl) {
      return { href: operator.primaryUrl, label: operator.ctaLabel || 'Visit site' };
    }
    if (operator.reviewUrl) {
      return { href: operator.reviewUrl, label: operator.reviewLabel || 'Read review' };
    }
    return null;
  }

  function buildActionLinks(operator) {
    var primary = getPrimaryLink(operator);
    var links = [];

    if (primary) {
      links.push(
        '<a class="site-matcher-primary-link" href="' + primary.href + '" data-matcher-operator="' + operator.id + '">' +
          primary.label +
        '</a>'
      );
    }

    if (operator.reviewUrl && (!primary || primary.href !== operator.reviewUrl)) {
      links.push(
        '<a class="site-matcher-secondary-link" href="' + operator.reviewUrl + '" data-matcher-operator="' + operator.id + '" data-matcher-link-type="review">' +
          'Read review' +
        '</a>'
      );
    }

    return links.join('');
  }

  function buildReasonList(operator, answers) {
    var reasons = operator.reasons.slice(0, 2);

    if (answers.priority === 'rewards' && operator.fit.rewards >= 3) {
      reasons.unshift('This one stays in the mix because recurring rewards matter more to you than headline bonus noise.');
    }

    if (answers.priority === 'odds' && operator.fit.odds >= 4) {
      reasons.unshift('This one scores well because you said depth and pricing matter more than pure ease.');
    }

    if (answers.bankroll === 'tiny' && operator.fit.bankrollLow >= 4) {
      reasons.unshift('You wanted a smaller starting bankroll, so low-entry friction matters here.');
    }

    return unique(reasons).slice(0, 3);
  }

  function buildSummary(answers) {
    if (answers.experience === 'first' && answers.priority === 'easy') {
      return 'You wanted the easiest sensible place to start, so the ranking leans toward simple onboarding and lower-friction first deposits.';
    }
    if (answers.priority === 'odds') {
      return 'You cared most about deeper markets and sharper comparison value, so the ranking leans toward sportsbook strength over pure simplicity.';
    }
    if (answers.sport === 'casino_mix') {
      return 'You asked for sport plus casino-style products, so the ranking gives extra weight to entertainment mix and low-friction entry.';
    }
    return 'These picks balance your sport, bankroll, and friction tolerance instead of pretending one site is best for everyone.';
  }

  function createMatcher() {
    var state = {
      step: 0,
      answers: {}
    };

    var teaserTargets = document.querySelectorAll('[data-site-matcher-teaser]');
    teaserTargets.forEach(function (target) {
      target.innerHTML = '' +
        '<div class="site-matcher-teaser">' +
          '<h2>Use BetSorted AI to narrow the field</h2>' +
          '<p>Answer five quick questions and get a shortlist based on bankroll, sport, rewards, and hassle level. It helps you choose a site, not pick a bet.</p>' +
          '<div class="site-matcher-teaser-actions">' +
            '<button class="site-matcher-open" type="button" data-site-matcher-trigger="teaser">Try the AI shortlist</button>' +
            '<button class="site-matcher-secondary" type="button" data-site-matcher-trigger="teaser-secondary">Open the AI</button>' +
          '</div>' +
        '</div>';
    });

    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'site-matcher-launcher';
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.innerHTML = '<span>AI</span><strong>Find my best-fit site</strong>';

    var overlay = document.createElement('div');
    overlay.className = 'site-matcher-overlay';
    overlay.innerHTML = '' +
      '<div class="site-matcher-modal" role="dialog" aria-modal="true" aria-labelledby="site-matcher-title">' +
        '<div class="site-matcher-shell">' +
          '<section class="site-matcher-panel site-matcher-panel--flow">' +
            '<button class="site-matcher-close" type="button" aria-label="Close matcher">×</button>' +
            '<h2 id="site-matcher-title" class="site-matcher-title">Find your best-fit betting site</h2>' +
            '<div class="site-matcher-progress">' +
              '<strong>Step <span data-progress-step>1</span> of ' + QUESTIONS.length + '</strong>' +
              '<div class="site-matcher-progress-bar"><span data-progress-bar style="width:20%"></span></div>' +
            '</div>' +
            '<div data-site-matcher-stage></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(overlay);

    var stage = overlay.querySelector('[data-site-matcher-stage]');
    var progressStep = overlay.querySelector('[data-progress-step]');
    var progressBar = overlay.querySelector('[data-progress-bar]');

    function openMatcher(source) {
      overlay.classList.add('is-open');
      document.body.classList.add('site-matcher-open');
      document.body.style.overflow = 'hidden';
      ensureAnalytics('matcher_open', {
        matcher_source: source || 'launcher',
        matcher_page: getPageVariant(),
        page_location: window.location.pathname
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
      var ranked = rankOperators(state.answers);
      var top = ranked.slice(0, 3);
      progressStep.textContent = String(QUESTIONS.length);
      progressBar.style.width = '100%';

      var cardsHtml = top.map(function (entry, index) {
        var operator = entry.operator;
        var reasons = buildReasonList(operator, state.answers);
        var reasonChips = operator.tags.slice(0, 4).map(function (tag) {
          return '<span class="site-matcher-chip">' + tag + '</span>';
        }).join('');
        var reasonText = reasons.map(function (line) {
          return '<p>' + line + '</p>';
        }).join('');
        var actionLinks = buildActionLinks(operator);
        var valueBlocks = '' +
          '<div class="site-matcher-value-grid">' +
            '<div class="site-matcher-value-card">' +
              '<span class="site-matcher-value-label">Welcome bonus</span>' +
              '<strong>' + operator.welcomeBonus + '</strong>' +
            '</div>' +
            '<div class="site-matcher-value-card">' +
              '<span class="site-matcher-value-label">Loyalty and rewards</span>' +
              '<strong>' + operator.loyaltyNote + '</strong>' +
            '</div>' +
          '</div>';

        return '' +
          '<article class="site-matcher-card' + (index === 0 ? ' site-matcher-card--best' : '') + '">' +
            '<span class="site-matcher-badge">' + (index === 0 ? 'Best match' : index === 1 ? 'Runner-up' : 'Worth comparing') + '</span>' +
            '<h4>' + operator.name + '</h4>' +
            '<div class="site-matcher-chip-row">' + reasonChips + '</div>' +
            valueBlocks +
            reasonText +
            '<div class="site-matcher-watchout"><strong>Watch out:</strong> ' + operator.watchout + '</div>' +
            '<div class="site-matcher-card-actions">' +
              actionLinks +
            '</div>' +
          '</article>';
      }).join('');

      stage.innerHTML = '' +
        '<div class="site-matcher-results">' +
          '<h3>Your shortlist</h3>' +
          '<p>' + buildSummary(state.answers) + '</p>' +
          '<div class="site-matcher-result-list">' + cardsHtml + '</div>' +
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
        top_pick: top[0] ? top[0].operator.id : ''
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

    launcher.addEventListener('click', function () {
      openMatcher('launcher');
    });

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

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('[data-site-matcher-teaser]')) {
      return;
    }
    createMatcher();
  });
})();
