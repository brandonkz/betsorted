/**
 * BetSorted Outbound Link Tracker
 * Tracks all outbound clicks as GA4 'affiliate_click' events
 * Include on every page: <script src="/assets/track-clicks.js" defer></script>
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
      var href = link.href;
      if (!href || href.indexOf('http') !== 0) return;
      try {
        var hostname = new URL(href).hostname;
        var currentHostname = window.location.hostname;
        if (hostname === currentHostname || hostname.indexOf('sorted') !== -1) return;

        link.addEventListener('click', function (e) {
          if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', {
              link_url: href,
              link_text: this.textContent.trim().substring(0, 50),
              link_domain: hostname,
              page_location: window.location.pathname,
              page_title: document.title
            });
          }
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            var target = link.target || '_self';
            setTimeout(function () {
              window.open(href, target);
            }, 100);
          }
        });
      } catch (err) {}
    });
  });
})();
