/**
 * BetSorted Outbound Link Tracker
 * Tracks outbound bookmaker clicks, including internal /go/ hops, as GA4 'affiliate_click' events.
 * Include on every page: <script src="/assets/track-clicks.js" defer></script>
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
      var rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.indexOf('#') === 0 || rawHref.indexOf('javascript:') === 0) return;

      try {
        var url = new URL(rawHref, window.location.href);
        var href = url.toString();
        var hostname = url.hostname;
        var currentHostname = window.location.hostname;
        var isInternalGo = url.origin === window.location.origin && url.pathname.indexOf('/go/') === 0;
        var isTrackableExternal = href.indexOf('http') === 0 && hostname !== currentHostname && hostname.indexOf('sorted') === -1;

        if (!isInternalGo && !isTrackableExternal) return;

        link.addEventListener('click', function (e) {
          var subid = url.searchParams.get('subid') || '';

          if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', {
              link_url: href,
              link_text: this.textContent.trim().substring(0, 50),
              link_domain: isInternalGo ? currentHostname : hostname,
              link_type: isInternalGo ? 'internal_go' : 'external_affiliate',
              subid: subid,
              page_location: window.location.pathname,
              page_title: document.title
            });
          }

          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            var target = link.target || '_self';
            setTimeout(function () {
              if (target === '_self') {
                window.location.assign(href);
                return;
              }
              window.open(href, target);
            }, 100);
          }
        });
      } catch (err) {}
    });
  });
})();
