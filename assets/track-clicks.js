/**
 * BetSorted Outbound Link Tracker
 * Tracks outbound bookmaker clicks, including internal /go/ hops, as GA4 'affiliate_click' events.
 * Include on every page: <script src="/assets/track-clicks.js" defer></script>
 */
(function () {
  function slug(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function inferBookmaker(link, url, isInternalGo) {
    var attr = link.getAttribute('data-bookmaker') || link.dataset.bookmaker || '';
    if (attr) return { name: attr.trim(), slug: slug(attr) };
    if (isInternalGo) {
      var match = url.pathname.match(/\/go\/([^/.?#]+)/);
      if (match) return { name: match[1], slug: slug(match[1]) };
    }
    return { name: '', slug: '' };
  }

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
          var bookmaker = inferBookmaker(this, url, isInternalGo);

          if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', {
              link_url: href,
              link_text: this.textContent.trim().substring(0, 50),
              link_domain: isInternalGo ? currentHostname : hostname,
              link_type: isInternalGo ? 'internal_go' : 'external_affiliate',
              bookmaker_name: bookmaker.name,
              bookmaker_slug: bookmaker.slug,
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
