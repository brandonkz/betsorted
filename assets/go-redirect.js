(function () {
  var script = document.currentScript;
  if (!script) return;

  var target = script.getAttribute('data-target');
  if (!target) return;

  try {
    var redirectUrl = new URL(target, window.location.origin);
    var incomingParams = new URLSearchParams(window.location.search);

    incomingParams.forEach(function (value, key) {
      if (!redirectUrl.searchParams.has(key)) {
        redirectUrl.searchParams.append(key, value);
      }
    });

    window.location.replace(redirectUrl.toString());
  } catch (err) {
    // Leave the meta refresh fallback in place if URL parsing fails.
  }
})();
