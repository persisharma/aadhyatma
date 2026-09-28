/* Vedansh — vedansh.app
   Two behaviours only: the nav's scrolled state / mobile toggle, and a
   scroll reveal for the folio spreads. Nothing else belongs here. */

(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    // First check on the next frame, not during startup, so reading scrollY
    // does not force a synchronous layout before first paint.
    requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(reveals, function (el) { observer.observe(el); });
})();

/* Visit counter. One POST per browser session (a reload does not recount);
   later pages in the same session only read. The element is optional, so a
   page without a counter, or a fetch that fails, changes nothing visible. */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-hits]');
  if (!els.length || !window.fetch) return;

  var key = 'vedansh-hit';
  var counted = false;
  try { counted = sessionStorage.getItem(key) === '1'; } catch (e) { /* private mode */ }

  var url = '/api/hits?p=' + encodeURIComponent(location.pathname);
  fetch(url, { method: counted ? 'GET' : 'POST', cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.total !== 'number') return;
      try { sessionStorage.setItem(key, '1'); } catch (e) { /* ignore */ }
      var lang = document.documentElement.lang === 'hi' ? 'hi-IN' : 'en-IN';
      var n = data.total.toLocaleString(lang);
      Array.prototype.forEach.call(els, function (el) {
        el.textContent = el.getAttribute('data-hits').replace('{n}', n);
        el.hidden = false;
      });
    })
    .catch(function () { /* the counter is decoration; never surface an error */ });
})();

/* Folio background art: load each image as its section comes within a screen
   of the viewport, then flip the class that fades it in over the placeholder
   glow. Without JS the sections simply stay plain. */
(function () {
  'use strict';
  var els = document.querySelectorAll('.folio-bg[data-src]');
  if (!els.length) return;

  function load(el) {
    var src = el.getAttribute('data-src');
    el.removeAttribute('data-src');
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      el.style.setProperty('--bg', 'url("' + src + '")');
      // a frame later, so the transition runs rather than jumping
      requestAnimationFrame(function () { el.classList.add('is-loaded'); });
    };
    img.src = src;
  }

  function start() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, load);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); load(e.target); }
      });
    }, { rootMargin: '600px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  // Decoration never competes with the page itself: nothing is requested
  // until the page has loaded and the browser is idle.
  function whenIdle() {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1200);
  }
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle);
})();
