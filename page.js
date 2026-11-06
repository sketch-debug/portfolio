/* Used only by the pages that build.js writes (projects/<id>/ and 404.html).
   The one-page site gets all of this from app.js instead.

   Nothing here needs editing: your words and links live in content.js. */

(function () {
  'use strict';

  var MENU = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var CLOSE = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ---------- mobile menu ---------- */

  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('[data-menu]');

  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !header.classList.contains('is-open');
      header.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.innerHTML = open ? CLOSE : MENU;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!header.classList.contains('is-open')) return;
      header.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      menuBtn.innerHTML = MENU;
      menuBtn.focus();
    });
  }

  /* ---------- copy link ---------- */

  var copyBtn = document.querySelector('[data-copy]');
  var copyStatus = document.querySelector('[data-copy-status]');

  function announce(text) {
    if (copyStatus) copyStatus.textContent = text;
  }

  if (copyBtn) {
    var reset = null;
    var done = function () {
      if (reset) clearTimeout(reset);
      copyBtn.textContent = 'Link copied';
      copyBtn.setAttribute('data-copied', 'true');
      announce('Link copied to the clipboard');
      reset = setTimeout(function () {
        copyBtn.textContent = 'Copy link';
        copyBtn.removeAttribute('data-copied');
        announce('');
      }, 2000);
    };
    var fallback = function () {
      var area = document.createElement('textarea');
      area.value = location.href;
      area.setAttribute('readonly', '');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (err) { announce('Could not copy the link. The address bar has it.'); }
      document.body.removeChild(area);
    };

    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- a screenshot that fails to load ---------- */

  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    var frame = img.parentNode;
    if (frame && frame.classList && frame.classList.contains('shot')) {
      frame.classList.add('shot--empty');
      img.remove();
    }
  }, true);
})();
