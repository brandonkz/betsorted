/** Track genuine operator visits without delaying or intercepting navigation. */
(function () {
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    var internalGo = url.origin === window.location.origin && url.pathname.startsWith('/go/');
    var markedAffiliate = link.matches('[data-bookmaker], .affiliate-link, [rel~="sponsored"]');
    if (!internalGo && !markedAffiliate) return;
    if (!/^https?:$/.test(url.protocol)) return;
    var operator = link.getAttribute('data-bookmaker') || (internalGo ? url.pathname.split('/').pop().replace(/\.html$/, '') : url.hostname);
    var placement = link.getAttribute('data-placement') || (link.closest('#comparison') ? 'comparison' : link.closest('#reviews') ? 'review-card' : link.closest('.site-matcher-overlay') ? 'finder' : 'content');
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        bookmaker_slug: operator,
        placement: placement,
        subid: url.searchParams.get('subid') || '',
        link_url: url.href,
        link_type: internalGo ? 'internal_go' : 'external_affiliate',
        page_location: window.location.pathname,
        transport_type: 'beacon'
      });
    }
  });
})();
