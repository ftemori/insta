/*
 * Insta focus script.
 * Runs at document start on every instagram.com page inside the app.
 * It only hides and redirects; it never reads or sends any of your data.
 * SETTINGS and CSS are filled in by scripts/build-inject.mjs.
 */
(function () {
  'use strict';
  if (window.__instaFocus) return;
  window.__instaFocus = true;

  var SETTINGS = __SETTINGS__;
  var CSS = __CSS__;

  var root = document.documentElement;
  if (SETTINGS.hideReelsTab) root.classList.add('insta-hide-reels-tab');
  if (SETTINGS.followingOnlyFeed) root.classList.add('insta-following-only');

  // ---- styles -----------------------------------------------------------
  function addStyle() {
    if (document.getElementById('insta-focus-style')) return;
    var style = document.createElement('style');
    style.id = 'insta-focus-style';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // ---- redirects (Instagram is a single-page app, so we watch every URL change)
  function targetFor(loc) {
    var path = loc.pathname;
    var params = new URLSearchParams(loc.search);

    if (SETTINGS.followingOnlyFeed && path === '/' && params.get('variant') !== 'following') {
      return '/?variant=following';
    }
    if (SETTINGS.blockReelsPage && /^\/reels(\/|$)/.test(path)) {
      return '/?variant=following';
    }
    if (SETTINGS.searchWithoutExplore && /^\/explore\/?$/.test(path)) {
      return '/explore/search/';
    }
    return null;
  }

  // Guard against redirect loops in case Instagram rewrites the URL back.
  function recentlyRedirected(target) {
    try {
      var last = JSON.parse(sessionStorage.getItem('instaFocusRedirect') || 'null');
      return last && last.to === target && Date.now() - last.at < 4000;
    } catch (e) { return false; }
  }

  function enforceUrl() {
    var target = targetFor(window.location);
    if (target && !recentlyRedirected(target)) {
      try { sessionStorage.setItem('instaFocusRedirect', JSON.stringify({ to: target, at: Date.now() })); } catch (e) {}
      window.location.replace(target);
      return true;
    }
    root.classList.toggle('insta-on-explore', /^\/explore(\/|$)/.test(window.location.pathname));
    return false;
  }

  function patchHistory(name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      onUrlChange();
      return result;
    };
  }

  var lastHref = '';
  function onUrlChange() {
    if (window.location.href === lastHref) return;
    lastHref = window.location.href;
    enforceUrl();
    scan();
  }

  // ---- links: point Home and Search at the calm versions -----------------
  function fixLinks(scope) {
    var links = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (SETTINGS.followingOnlyFeed && href === '/') a.setAttribute('href', '/?variant=following');
      if (SETTINGS.searchWithoutExplore && href === '/explore/') a.setAttribute('href', '/explore/search/');
    }
  }

  // ---- feed posts ---------------------------------------------------------
  var SUGGESTED = /^(Suggested for you|Suggested posts|Suggested Reels)$/i;

  function hidePosts(scope) {
    var articles = scope.querySelectorAll ? scope.querySelectorAll('article') : [];
    for (var i = 0; i < articles.length; i++) {
      var post = articles[i];
      if (post.classList.contains('insta-hidden')) continue;

      if (SETTINGS.hideReelsInFeed && post.querySelector('a[href*="/reel/"]')) {
        post.classList.add('insta-hidden');
        continue;
      }
      if (SETTINGS.hideSuggestedPosts) {
        var spans = post.querySelectorAll('span');
        for (var j = 0; j < spans.length && j < 40; j++) {
          if (SUGGESTED.test((spans[j].textContent || '').trim())) {
            post.classList.add('insta-hidden');
            break;
          }
        }
      }
    }
  }

  function scan() {
    if (!document.body) return;
    fixLinks(document.body);
    hidePosts(document.body);
  }

  // ---- start ------------------------------------------------------------
  if (enforceUrl()) return;
  addStyle();
  patchHistory('pushState');
  patchHistory('replaceState');
  window.addEventListener('popstate', onUrlChange);
  lastHref = window.location.href;

  var pending = false;
  var observer = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      addStyle();
      onUrlChange();
      scan();
    });
  });

  function start() {
    addStyle();
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
