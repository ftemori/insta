/*
 * Insta focus script.
 * Runs at document start on every instagram.com page inside the app.
 * It hides, redirects and draws the app's own tab bar; it never reads or sends your data.
 * SETTINGS and CSS are filled in by scripts/build-inject.mjs.
 */
(function () {
  'use strict';
  if (window.__instaFocus) return;
  window.__instaFocus = true;

  var SETTINGS = {"followingOnlyFeed":true,"hideNotFollowedPosts":true,"hideReelsTab":true,"blockReelsPage":true,"hideReelsInFeed":false,"searchWithoutExplore":true,"hideSuggestedPosts":true,"appTabBar":true};
  var CSS = "/* ===== Insta: app look + focus rules. Classes on <html> are set by focus.js. ===== */\n\n/* ---- App feel: no tap flashes, no text-selection callouts, no rubber zoom ---- */\nhtml {\n  -webkit-tap-highlight-color: transparent !important;\n  -webkit-text-size-adjust: 100% !important;\n}\nhtml, body {\n  -webkit-touch-callout: none !important;\n  overscroll-behavior-y: none;\n}\nbody *:not(input):not(textarea):not([contenteditable=\"true\"]):not([contenteditable=\"true\"] *) {\n  -webkit-user-select: none !important;\n  user-select: none !important;\n}\n\n/* ---- Instagram's own bottom nav and \"open in app\" prompts are replaced ---- */\n.insta-native-nav,\n.insta-app-banner {\n  display: none !important;\n}\n\n/* ---- Leave room for the floating tab bar ---- */\nhtml[data-insta~=\"has-tabbar\"] body {\n  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;\n}\n\n/* ---- Reels ---- */\nhtml[data-insta~=\"hide-reels-tab\"] a[href=\"/reels/\"],\nhtml[data-insta~=\"hide-reels-tab\"] a[href^=\"/reels/\"] {\n  display: none !important;\n}\n\n/* ---- Home feed: hide the \"For you\" switch ---- */\nhtml[data-insta~=\"following-only\"] a[href=\"/?variant=home\"],\nhtml[data-insta~=\"following-only\"] a[href^=\"/?variant=home&\"] {\n  display: none !important;\n}\n\n/* ---- Search without the Explore grid ---- */\nhtml[data-insta~=\"on-explore\"] main a[href^=\"/p/\"],\nhtml[data-insta~=\"on-explore\"] main a[href^=\"/reel/\"],\nhtml[data-insta~=\"on-explore\"] main a[href^=\"/reels/\"] {\n  display: none !important;\n}\n\n/* ---- Posts hidden by focus.js ---- */\n.insta-hidden {\n  display: none !important;\n}\n\n/* ===== Floating glass tab bar (iOS style) ===== */\n#insta-tabbar {\n  --glass-bg: rgba(255, 255, 255, 0.62);\n  --glass-border: rgba(255, 255, 255, 0.75);\n  --glass-edge: rgba(0, 0, 0, 0.08);\n  --glass-shadow: 0 10px 34px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.08);\n  --icon: #111;\n  --active-bg: rgba(0, 0, 0, 0.07);\n\n  position: fixed;\n  z-index: 2147483000;\n  left: 50%;\n  bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);\n  transform: translateX(-50%);\n  width: min(92vw, 420px);\n  height: 62px;\n  box-sizing: border-box;\n  padding: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-radius: 31px;\n  background: var(--glass-bg);\n  -webkit-backdrop-filter: blur(22px) saturate(185%);\n  backdrop-filter: blur(22px) saturate(185%);\n  border: 0.5px solid var(--glass-border);\n  box-shadow: var(--glass-shadow), inset 0 0.5px 0 rgba(255, 255, 255, 0.9), inset 0 -0.5px 0 var(--glass-edge);\n  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif;\n}\n#insta-tabbar.insta-tabbar-hidden {\n  transform: translateX(-50%) translateY(140%);\n  opacity: 0;\n  pointer-events: none;\n}\n@media (prefers-color-scheme: dark) {\n  #insta-tabbar {\n    --glass-bg: rgba(38, 38, 40, 0.55);\n    --glass-border: rgba(255, 255, 255, 0.14);\n    --glass-edge: rgba(0, 0, 0, 0.4);\n    --glass-shadow: 0 10px 34px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4);\n    --icon: #f5f5f5;\n    --active-bg: rgba(255, 255, 255, 0.12);\n  }\n  #insta-tabbar { box-shadow: var(--glass-shadow), inset 0 0.5px 0 rgba(255, 255, 255, 0.18); }\n}\n#insta-tabbar button {\n  flex: 1 1 0;\n  height: 50px;\n  margin: 0 2px;\n  padding: 0;\n  border: 0;\n  border-radius: 25px;\n  background: transparent;\n  color: var(--icon);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  -webkit-appearance: none;\n  appearance: none;\n  cursor: pointer;\n  transition: background 0.2s ease, transform 0.12s ease;\n}\n#insta-tabbar button:active { transform: scale(0.9); }\n#insta-tabbar button.insta-active { background: var(--active-bg); }\n#insta-tabbar svg { width: 26px; height: 26px; display: block; }\n#insta-tabbar svg .fill-when-active { fill: none; }\n#insta-tabbar button.insta-active svg .fill-when-active { fill: currentColor; }\n#insta-tabbar button.insta-active svg { stroke-width: 2.3; }\n#insta-tabbar .insta-avatar {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  object-fit: cover;\n  box-sizing: border-box;\n  border: 1.5px solid transparent;\n}\n#insta-tabbar button.insta-active .insta-avatar { border-color: var(--icon); }\n#insta-tabbar .insta-hidden-tab { display: none; }\n\n/* ===== Glass header ===== */\n.insta-glass-top,\n.insta-glass-top > div {\n  background-color: rgba(255, 255, 255, 0.72) !important;\n}\n.insta-glass-top {\n  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;\n  backdrop-filter: blur(20px) saturate(180%) !important;\n  border-bottom-color: transparent !important;\n}\n@media (prefers-color-scheme: dark) {\n  .insta-glass-top,\n  .insta-glass-top > div {\n    background-color: rgba(0, 0, 0, 0.6) !important;\n  }\n}\n\n/* ===== App top bar on Home ===== */\n#insta-header {\n  position: fixed;\n  z-index: 2147482999;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 50px;\n  padding: 0 8px 0 16px;\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  color: #111;\n  background: rgba(255, 255, 255, 0.72);\n  -webkit-backdrop-filter: blur(20px) saturate(180%);\n  backdrop-filter: blur(20px) saturate(180%);\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, sans-serif;\n}\n#insta-header.insta-header-hidden { display: none; }\n#insta-header .insta-wordmark {\n  font-family: \"Snell Roundhand\", \"Savoye LET\", \"Brush Script MT\", cursive;\n  font-size: 30px;\n  font-weight: 700;\n  letter-spacing: 0.2px;\n  line-height: 1;\n  padding-top: 4px;\n}\n#insta-header .insta-header-actions { display: flex; gap: 4px; }\n#insta-header button {\n  width: 44px; height: 44px; border: 0; padding: 0; border-radius: 22px;\n  background: transparent; color: inherit; display: flex; align-items: center; justify-content: center;\n  -webkit-appearance: none; appearance: none;\n}\n#insta-header button:active { background: rgba(127, 127, 127, 0.18); }\n#insta-header svg { width: 26px; height: 26px; }\n@media (prefers-color-scheme: dark) {\n  #insta-header { color: #f5f5f5; background: rgba(0, 0, 0, 0.62); }\n}\n/* Instagram's own top bar sits under ours on Home */\nhtml[data-insta~=\"has-header\"] .insta-native-top { visibility: hidden !important; }\n\n/* ===== App typography ===== */\nbody, button, input, textarea {\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif !important;\n}\n#insta-header .insta-header-left { display: flex; align-items: center; gap: 6px; margin-left: -8px; }\n#insta-tabbar button { position: relative; }\n#insta-tabbar .insta-badge {\n  position: absolute; top: 6px; left: 50%; margin-left: 6px;\n  min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;\n  border-radius: 9px; background: #ff3040; color: #fff;\n  font-size: 11px; font-weight: 600; line-height: 18px; text-align: center;\n}\n";

  // At document start the <html> element may not exist yet.
  if (!document.documentElement) {
    var waitForRoot = new MutationObserver(function () {
      if (document.documentElement) { waitForRoot.disconnect(); boot(); }
    });
    waitForRoot.observe(document, { childList: true });
  } else {
    boot();
  }

  function boot() {
  var root = document.documentElement;
  // Instagram rewrites <html class="...">, so our state lives in data-insta="...".
  function flag(name, on) {
    var list = (root.getAttribute('data-insta') || '').split(' ').filter(Boolean);
    var i = list.indexOf(name);
    if (on && i === -1) list.push(name);
    if (!on && i !== -1) list.splice(i, 1);
    var value = list.join(' ');
    if (root.getAttribute('data-insta') !== value) root.setAttribute('data-insta', value);
  }
  if (SETTINGS.hideReelsTab) flag('hide-reels-tab', true);
  if (SETTINGS.followingOnlyFeed) flag('following-only', true);

  // ---- styles -----------------------------------------------------------
  // Constructed stylesheets are not blocked by a page's Content Security Policy,
  // a <style> tag can be, so try that first.
  var sheetAdded = false;
  function addStyle() {
    if (sheetAdded) return;
    try {
      if (document.adoptedStyleSheets !== undefined && window.CSSStyleSheet) {
        var sheet = new CSSStyleSheet();
        sheet.replaceSync(CSS);
        sheet.__insta = true;
        document.adoptedStyleSheets = document.adoptedStyleSheets.concat([sheet]);
        sheetAdded = true;
        return;
      }
    } catch (e) { /* fall through */ }
    if (document.getElementById('insta-focus-style')) return;
    var style = document.createElement('style');
    style.id = 'insta-focus-style';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }
  function ensureStyle() {
    if (sheetAdded) {
      // Some page code replaces adoptedStyleSheets; re-add if ours went missing.
      var has = false;
      var list = document.adoptedStyleSheets || [];
      for (var i = 0; i < list.length; i++) if (list[i].__insta) has = true;
      if (!has) { sheetAdded = false; }
    }
    addStyle();
  }

  // ---- app viewport: no pinch zoom, draw under the home indicator --------
  function fixViewport() {
    var content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      if (!document.head) return;
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    if (meta.getAttribute('content') !== content) meta.setAttribute('content', content);
  }

  // ---- redirects (Instagram is a single-page app, so we watch every URL change)
  function isHome(path) { return path === '/' || path === ''; }

  function targetFor(loc) {
    var path = loc.pathname;
    var params = new URLSearchParams(loc.search);
    if (SETTINGS.followingOnlyFeed && isHome(path) && params.get('variant') !== 'following') {
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
    flag('on-explore', /^\/explore(\/|$)/.test(window.location.pathname));
    return false;
  }

  function patchHistory(name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      setTimeout(onUrlChange, 0);
      return result;
    };
  }

  var lastHref = '';
  function onUrlChange() {
    if (window.location.href === lastHref) return;
    lastHref = window.location.href;
    if (enforceUrl()) return;
    scan();
  }

  // ---- links: point Home and Search at the calm versions -----------------
  function fixLinks(scope) {
    var links = scope.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (SETTINGS.followingOnlyFeed && href === '/') a.setAttribute('href', '/?variant=following');
      if (SETTINGS.searchWithoutExplore && href === '/explore/') a.setAttribute('href', '/explore/search/');
    }
  }

  // ---- Instagram's own bottom navigation ---------------------------------
  var RESERVED = /^\/(explore|reels|direct|accounts|stories|p|reel|create|about|legal|developer|web|challenge|emails|session|privacy|terms|api|graphql|static|tv|ar|qr)(\/|$)/;
  var CREATE_LABEL = /new post|create|neuer beitrag|erstellen|beitrag erstellen/i;

  function closestFixed(el) {
    var node = el;
    for (var depth = 0; node && node !== document.body && depth < 12; depth++) {
      var pos = window.getComputedStyle(node).position;
      if (pos === 'fixed' || pos === 'sticky') return node;
      node = node.parentElement;
    }
    return null;
  }

  var createTarget = null;
  var unreadCount = '';

  function learnFromNativeNav(nav) {
    // Profile link: the nav entry pointing at "/<username>/".
    var links = nav.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (/^\/[A-Za-z0-9._]+\/$/.test(href) && !RESERVED.test(href)) {
        try {
          localStorage.setItem('instaProfilePath', href);
          var img = links[i].querySelector('img');
          if (img && img.src) localStorage.setItem('instaProfilePic', img.src);
        } catch (e) {}
      }
    }
    // New post: a create link, or a button/svg labelled "New post".
    var create = nav.querySelector('a[href*="/create/"]');
    if (!create) {
      var svgs = nav.querySelectorAll('svg[aria-label]');
      for (var j = 0; j < svgs.length; j++) {
        if (CREATE_LABEL.test(svgs[j].getAttribute('aria-label') || '')) {
          create = svgs[j].closest('a, button, [role="button"], [role="link"]') || svgs[j].parentElement;
          break;
        }
      }
    }
    if (create) createTarget = create;
    // Unread messages badge on Instagram's DM link.
    var dm = nav.querySelector('a[href^="/direct/"]');
    if (dm) {
      var m = (dm.innerText || '').match(/\d+/);
      unreadCount = m ? m[0] : '';
    }
  }

  function learnCreate() {
    if (createTarget && document.contains(createTarget)) return;
    var head = document.querySelector('header');
    if (!head) return;
    var plain = head.querySelectorAll('a[href="#"], [role="button"]');
    for (var i = 0; i < plain.length; i++) {
      if (plain[i].querySelector('svg')) { createTarget = plain[i]; return; }
    }
  }

  function hideNativeNav() {
    if (!SETTINGS.appTabBar) return;
    var anchors = document.querySelectorAll('a[href="/direct/inbox/"], a[href^="/explore/"], a[href="/reels/"]');
    for (var i = 0; i < anchors.length; i++) {
      var bar = closestFixed(anchors[i]);
      if (!bar || bar.id === 'insta-tabbar' || bar.classList.contains('insta-native-nav')) continue;
      var rect = bar.getBoundingClientRect();
      // Only the bar along the bottom edge, not top headers.
      if (rect.top > window.innerHeight * 0.6) {
        learnFromNativeNav(bar);
        bar.classList.add('insta-native-nav');
      }
    }
  }

  // ---- glass header: the bar fixed along the top edge ---------------------
  function glassHeader() {
    var hits = document.elementsFromPoint ? document.elementsFromPoint(window.innerWidth / 2, 4) : [];
    for (var i = 0; i < hits.length; i++) {
      if (hits[i] === document.body || hits[i] === root) break;
      var bar = closestFixed(hits[i]);
      if (bar && bar.id !== 'insta-tabbar') {
        var rect = bar.getBoundingClientRect();
        if (rect.top <= 2 && rect.height < 140 && rect.width > window.innerWidth * 0.8) {
          bar.classList.add('insta-glass-top');
          bar.classList.add('insta-native-top');
        }
        break;
      }
    }
  }

  // ---- "open in the app" prompts ------------------------------------------
  var BANNER_TEXT = /^(open app|use the app|get the app|open instagram|app öffnen|in der app öffnen|app verwenden|app holen|not now|jetzt nicht)$/i;
  function hideAppBanners() {
    var links = document.querySelectorAll('a[href*="apps.apple.com"], a[href*="itunes.apple.com"], a[href^="itms"], a[href*="play.google.com"], a[href*="/download/"]');
    for (var i = 0; i < links.length; i++) {
      var box = closestFixed(links[i]);
      (box || links[i]).classList.add('insta-app-banner');
    }
    var buttons = document.querySelectorAll('button, a[role="button"], div[role="button"]');
    for (var j = 0; j < buttons.length && j < 200; j++) {
      var t = (buttons[j].textContent || '').trim();
      if (/^(open app|use the app|app öffnen|in der app öffnen)$/i.test(t)) {
        var holder = closestFixed(buttons[j]);
        if (holder) holder.classList.add('insta-app-banner');
      }
    }
  }

  // ---- feed posts ---------------------------------------------------------
  var SUGGESTED = /^(suggested for you|suggested posts|suggested reels|suggestions for you|vorgeschlagen für dich|vorschläge für dich|vorgeschlagene beiträge|vorgeschlagene reels)$/i;
  var FOLLOW = /^(follow|folgen)$/i;

  function hidePosts(scope) {
    if (!isHome(window.location.pathname)) return;
    var articles = scope.querySelectorAll('article');
    for (var i = 0; i < articles.length; i++) {
      var post = articles[i];
      if (post.classList.contains('insta-hidden') || post.__instaChecked > 30) continue;
      post.__instaChecked = (post.__instaChecked || 0) + 1;

      if (SETTINGS.hideReelsInFeed && post.querySelector('a[href*="/reel/"]')) {
        post.classList.add('insta-hidden');
        continue;
      }
      var texts = post.querySelectorAll('span, div[role="button"], button');
      for (var j = 0; j < texts.length && j < 60; j++) {
        var t = (texts[j].textContent || '').trim();
        if (!t || t.length > 40) continue;
        // A "Follow" button on a feed post means you don't follow that account.
        if ((SETTINGS.hideSuggestedPosts && SUGGESTED.test(t)) ||
            (SETTINGS.hideNotFollowedPosts && FOLLOW.test(t))) {
          post.classList.add('insta-hidden');
          break;
        }
      }
    }
  }

  // ---- the app's own top bar on Home ------------------------------------
  var HEADER_ICONS = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20.3s-7.8-4.6-8.9-9.6C2.4 7.4 4.6 4.6 7.6 4.6c2 0 3.4 1.1 4.4 2.6 1-1.5 2.4-2.6 4.4-2.6 3 0 5.2 2.8 4.5 6.1-1.1 5-8.9 9.6-8.9 9.6z"/></svg>'
  };
  var header = null;
  function buildHeader() {
    if (!SETTINGS.appTabBar || !document.body) return;
    if (header && document.body.contains(header)) return;
    header = document.createElement('div');
    header.id = 'insta-header';
    header.innerHTML = '<div class="insta-header-left"><button type="button" class="insta-create" aria-label="New post">' + ICONS.create + '</button>' +
      '<div class="insta-wordmark">Insta</div></div><div class="insta-header-actions">' +
      '<button type="button" data-go="/notifications/" aria-label="Activity">' + HEADER_ICONS.heart + '</button></div>';
    header.querySelector('[data-go]').addEventListener('click', function (e) {
      navigate(e.currentTarget.getAttribute('data-go'));
    });
    header.querySelector('.insta-create').addEventListener('click', function () {
      learnCreate();
      if (createTarget && document.contains(createTarget)) createTarget.click();
    });
    header.querySelector('.insta-wordmark').addEventListener('click', function () {
      scrollToTop();
    });
    document.body.appendChild(header);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var main = document.querySelector('main');
    var node = main;
    while (node && node !== document.body) {
      if (node.scrollHeight > node.clientHeight + 10) {
        var oy = window.getComputedStyle(node).overflowY;
        if (oy === 'auto' || oy === 'scroll') { node.scrollTo({ top: 0, behavior: 'smooth' }); break; }
      }
      node = node.parentElement;
    }
  }

  function updateHeader() {
    if (!header) return;
    var show = isHome(window.location.pathname);
    header.classList.toggle('insta-header-hidden', !show);
    flag('has-header', show);
  }

  // ---- the app's own tab bar ---------------------------------------------
  var ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path class="fill-when-active" d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1h-4.8v-6.2H9.3V21H4.5a1 1 0 0 1-1-1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.6 4.6"/></svg>',
    create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/></svg>',
    messages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path class="fill-when-active" d="M12 3.6c-4.9 0-8.6 3.5-8.6 8 0 2.4 1 4.4 2.7 5.9l-.4 3 3-1.3c1 .3 2.1.4 3.3.4 4.9 0 8.6-3.5 8.6-8s-3.7-8-8.6-8z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle class="fill-when-active" cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.3-3.6 4.2-5.3 7.5-5.3s6.2 1.7 7.5 5.3"/></svg>'
  };

  function profilePath() {
    try { return localStorage.getItem('instaProfilePath'); } catch (e) { return null; }
  }

  function navigate(path) {
    // Prefer clicking Instagram's own link so it changes page without a reload.
    var candidates = document.querySelectorAll('a[href]');
    for (var i = 0; i < candidates.length; i++) {
      var href = candidates[i].getAttribute('href');
      if (href === path || (path === '/?variant=following' && href === '/')) {
        candidates[i].click();
        return;
      }
    }
    window.location.assign(path);
  }

  var tabbar = null;
  function buildTabbar() {
    if (!SETTINGS.appTabBar || !document.body) return;
    if (tabbar && document.body.contains(tabbar)) return;
    tabbar = document.createElement('nav');
    tabbar.id = 'insta-tabbar';
    tabbar.setAttribute('aria-label', 'Tabs');
    var tabs = [
      ['home', 'Home'],
      ['messages', 'Messages'],
      ['search', 'Search'],
      ['profile', 'Profile']
    ];
    for (var i = 0; i < tabs.length; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-tab', tabs[i][0]);
      b.setAttribute('aria-label', tabs[i][1]);
      b.innerHTML = ICONS[tabs[i][0]];
      b.addEventListener('click', onTab);
      tabbar.appendChild(b);
    }
    document.body.appendChild(tabbar);
    flag('has-tabbar', true);
    updateTabbar();
  }

  function onTab(event) {
    var tab = event.currentTarget.getAttribute('data-tab');
    if (tab === 'home') {
      if (isHome(window.location.pathname)) { scrollToTop(); return; }
      navigate('/?variant=following');
    } else if (tab === 'search') {
      navigate('/explore/search/');
    } else if (tab === 'create') {
      if (createTarget && document.contains(createTarget)) createTarget.click();
    } else if (tab === 'messages') {
      navigate('/direct/inbox/');
    } else if (tab === 'profile') {
      navigate(profilePath() || '/accounts/edit/');
    }
  }

  function currentTab() {
    var path = window.location.pathname;
    if (isHome(path)) return 'home';
    if (/^\/explore(\/|$)/.test(path)) return 'search';
    if (/^\/direct(\/|$)/.test(path)) return 'messages';
    if (/^\/create(\/|$)/.test(path)) return 'create';
    var p = profilePath();
    if (p && path.indexOf(p) === 0) return 'profile';
    return '';
  }

  function updateTabbar() {
    if (!tabbar) return;
    var path = window.location.pathname;
    // Inside a chat or while composing a post, the keyboard and composer need the space.
    var hide = /^\/direct\/t\//.test(path) || /^\/create\//.test(path) || /^\/stories\//.test(path) || /^\/accounts\/login/.test(path);
    tabbar.classList.toggle('insta-tabbar-hidden', hide);
    flag('has-tabbar', !hide);

    var active = currentTab();
    var buttons = tabbar.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var name = buttons[i].getAttribute('data-tab');
      buttons[i].classList.toggle('insta-active', name === active);
      if (name === 'messages') {
        var badge = buttons[i].querySelector('.insta-badge');
        if (unreadCount) {
          if (!badge) { badge = document.createElement('span'); badge.className = 'insta-badge'; buttons[i].appendChild(badge); }
          badge.textContent = unreadCount;
        } else if (badge) {
          badge.remove();
        }
      }
    }
    var pic = null;
    try { pic = localStorage.getItem('instaProfilePic'); } catch (e) {}
    var profileBtn = tabbar.querySelector('[data-tab="profile"]');
    if (pic && profileBtn && !profileBtn.querySelector('img')) {
      var img = document.createElement('img');
      img.className = 'insta-avatar';
      img.alt = '';
      img.src = pic;
      img.onerror = function () { profileBtn.innerHTML = ICONS.profile; };
      profileBtn.innerHTML = '';
      profileBtn.appendChild(img);
    }
  }

  // Hide the bar while typing so it never covers the keyboard.
  document.addEventListener('focusin', function (e) {
    if (tabbar && e.target && e.target.matches && e.target.matches('input, textarea, [contenteditable="true"]')) {
      tabbar.classList.add('insta-tabbar-hidden');
    }
  });
  document.addEventListener('focusout', function () { setTimeout(updateTabbar, 50); });

  // ---- main loop ----------------------------------------------------------
  function scan() {
    if (!document.body) return;
    ensureStyle();
    fixViewport();
    fixLinks(document.body);
    hideNativeNav();
    learnCreate();
    hideAppBanners();
    glassHeader();
    hidePosts(document.body);
    buildTabbar();
    updateTabbar();
    buildHeader();
    updateHeader();
  }

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
      onUrlChange();
      scan();
    });
  });

  function start() {
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // URL changes that skip history.pushState (rare) are still caught here.
    setInterval(function () { onUrlChange(); }, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  }
})();
