/* You do not need to edit this file.
   It reads content.js and builds the pages. Everything you want to change is in content.js. */

(function () {
  'use strict';

  var app = document.getElementById('app');

  if (typeof SITE === 'undefined' || typeof PROJECTS === 'undefined') {
    if (!app.innerHTML.trim()) {
      app.innerHTML = fatal('content.js was not found',
        'Make sure content.js is in the same folder as index.html and has not been renamed.');
    }
    return;
  }

  var state = { filter: 'All', pendingScroll: null, routeKey: '' };

  // Remember the description index.html ships with, so a page with no content
  // of its own can put it back instead of inheriting the last page's text.
  var metaEl = document.querySelector('meta[name="description"]');
  var DEFAULT_DESC = metaEl ? metaEl.getAttribute('content') : '';
  var SITE_NAME = has(SITE.name) ? String(SITE.name) : 'Portfolio';

  /* ====================== small helpers ====================== */

  function fatal(title, text) {
    return '<div class="fatal"><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p></div>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // "Has something in it?" Empty text, empty lists and missing fields are all treated as empty.
  function has(v) {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim() !== '';
  }

  function list(v) { return Array.isArray(v) ? v : []; }

  // Text like "[ADD LINK]" is a placeholder, not a real value.
  function isPlaceholder(v) { return /^\s*\[.*\]\s*$/.test(String(v)); }

  // "[ADD LINK]" or "I build [kind of] systems" - any bracketed placeholder inside a value.
  function placeholderCount(v) {
    if (v == null) return 0;
    if (Array.isArray(v)) return v.reduce(function (n, x) { return n + placeholderCount(x); }, 0);
    if (typeof v === 'object') return Object.keys(v).reduce(function (n, k) { return n + placeholderCount(v[k]); }, 0);
    if (typeof v !== 'string') return 0;
    return (v.match(/\[[^\]]{1,80}\]/g) || []).length;
  }

  // True on your own computer only (file://, localhost). False on the live site.
  function isLocalPreview() {
    if (location.protocol === 'file:') return true;
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(location.hostname);
  }

  function devbarHtml() {
    if (!isLocalPreview()) return '';
    var n = placeholderCount(SITE) + placeholderCount(PROJECTS);
    return '<div class="devbar" role="status"><strong>Preview mode</strong><span>' +
      (n === 0
        ? 'no [PLACEHOLDER] values left in content.js.'
        : n + (n === 1 ? ' [PLACEHOLDER] value is' : ' [PLACEHOLDER] values are') + ' still in content.js.') +
      '</span><span>This bar never appears on the live site.</span></div>';
  }

  // Only allow normal links (web, email, phone) or files in this folder. Blocks "javascript:" and similar.
  function safeUrl(u) {
    u = String(u).trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return '';
    return u;
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  var ICONS = {
    arrow: 'M5 12h14M13 6l6 6-6 6',
    download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    external: 'M7 17L17 7M8 7h9v9',
    back: 'M19 12H5M11 6l-6 6 6 6',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'M6 6l12 12M18 6L6 18'
  };

  function icon(name) {
    return '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + ICONS[name] + '"/></svg>';
  }

  // A button link. Empty = hidden. [BRACKET] value = greyed-out button.
  // attrs is extra markup put on the real link (not on a disabled placeholder).
  function btn(label, url, cls, iconName, attrs) {
    if (!has(url)) return '';
    var inner = esc(label) + (iconName ? icon(iconName) : '');
    if (isPlaceholder(url)) {
      return '<span class="btn ' + cls + ' is-disabled" aria-disabled="true" title="Add this link in content.js">' + inner +
        '<span class="sr-only"> - link not set yet, add it in content.js</span></span>';
    }
    var href = safeUrl(url);
    if (!href) return '';
    var external = /^https?:/i.test(href);
    return '<a class="btn ' + cls + '" href="' + esc(href) + '"' + (attrs || '') +
      (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + inner + '</a>';
  }

  // An image. If the file is missing or empty, a labelled placeholder frame is shown instead.
  // eager = true for the picture at the top of a project page, which should not
  // wait for a scroll before it starts downloading.
  function shot(src, alt, extra, eager) {
    var safe = (has(src) && !isPlaceholder(src)) ? safeUrl(src) : '';
    var img = safe
      ? '<img src="' + esc(safe) + '" alt="' + esc(alt) + '" ' +
        (eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
      : '';
    // The reminder text is for your own computer only; visitors see a plain empty frame.
    var label = isLocalPreview() ? '<span class="shot__label">[ADD SCREENSHOT]</span>' : '';
    return '<div class="shot' + (extra ? ' ' + extra : '') + (safe ? '' : ' shot--empty') + '">' + img + label + '</div>';
  }

  function statusHtml(status) {
    if (!has(status)) return '';
    var s = String(status).toLowerCase();
    var cls = s === 'live' ? 'dot--ok' : (s === 'prototype' || s.indexOf('development') !== -1) ? 'dot--warn' : '';
    return '<span class="status"><span class="dot ' + cls + '" aria-hidden="true"></span>' + esc(status) + '</span>';
  }

  function findProject(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return PROJECTS[i];
    return null;
  }

  function types() {
    var out = [];
    PROJECTS.forEach(function (p) { if (has(p.type) && out.indexOf(p.type) === -1) out.push(p.type); });
    return out;
  }

  /* ====================== content check ====================== */

  // Every field the site knows about, and what shape its value should have.
  var SITE_FIELDS = {
    name: 'text', title: 'text', headline: 'text', bio: 'text',
    email: 'text', github: 'text', linkedin: 'text', contactFormUrl: 'text',
    phone: 'text', location: 'text', education: 'list', certifications: 'list', languages: 'list',
    availability: 'text', replyTime: 'text', resumeUrl: 'text', photo: 'text',
    accentColor: 'text', siteUrl: 'text',
    analyticsProvider: 'text', analyticsSite: 'text',
    otherLinks: 'list', about: 'list', skills: 'list', testimonials: 'list', credentials: 'list'
  };

  var PROJECT_FIELDS = {
    id: 'text', name: 'text', type: 'text', summary: 'text', status: 'text', role: 'text',
    result: 'text', timeline: 'text', team: 'text', problem: 'text', built: 'text', change: 'text',
    features: 'list', stack: 'list', challenges: 'list', results: 'list', screenshots: 'list',
    demoUrl: 'text', githubUrl: 'text', videoUrl: 'text'
  };

  // Fields inside each list, so a typo inside them is caught too.
  var LIST_ITEM_FIELDS = {
    features: { title: 'text', text: 'text' },
    challenges: { challenge: 'text', solution: 'text' },
    results: { value: 'text', label: 'text' },
    testimonials: { quote: 'text', name: 'text', role: 'text' },
    skills: { group: 'text', items: 'list' },
    otherLinks: { label: 'text', url: 'text' },
    education: { qualification: 'text', school: 'text', year: 'text', capstone: 'text' },
    certifications: { name: 'text', issuer: 'text', year: 'text' },
    languages: { name: 'text', level: 'text' }
  };

  function actualType(v) {
    if (Array.isArray(v)) return 'a list';
    if (v === null || v === undefined) return 'empty';
    if (typeof v === 'object') return 'an object';
    if (typeof v === 'number') return 'a number';
    return 'text';
  }

  function wrongType(v, want) {
    if (v == null) return false;
    if (want === 'list') return !Array.isArray(v);
    return !(typeof v === 'string' || typeof v === 'number');
  }

  function typeHint(key, want) {
    return want === 'list' ? '" should be a list like ["one", "two"], but it is ' : '" should be text in quote marks, but it is ';
  }

  // "screenshot" -> "screenshots": a small spelling helper for field names.
  function distance(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function suggest(key, allowed) {
    var best = '', bestScore = 99;
    allowed.forEach(function (k) {
      var d = distance(key, k);
      if (d < bestScore) { bestScore = d; best = k; }
    });
    return bestScore <= 3 ? best : '';
  }

  function checkFields(obj, allowed, label, out) {
    Object.keys(obj).forEach(function (k) {
      if (!allowed[k]) {
        var guess = suggest(k, Object.keys(allowed));
        out.push(label + ' has an unknown field "' + k + '"' + (guess ? '. Did you mean "' + guess + '"?' : '. Check the spelling.'));
      } else if (wrongType(obj[k], allowed[k])) {
        out.push(label + ' field "' + k + typeHint(k, allowed[k]) + actualType(obj[k]) + '.');
      }
    });
  }

  function checkListItems(p, label, out) {
    Object.keys(LIST_ITEM_FIELDS).forEach(function (key) {
      var items = p[key];
      if (!Array.isArray(items)) return;
      var allowed = LIST_ITEM_FIELDS[key];
      items.forEach(function (item, n) {
        var where = label + ' "' + key + '" entry ' + (n + 1);
        if (item == null || typeof item !== 'object' || Array.isArray(item)) {
          out.push(where + ' should be written as { ' + Object.keys(allowed).map(function (k) { return k + ': "..."'; }).join(', ') + ' }.');
          return;
        }
        checkFields(item, allowed, where, out);
      });
    });
  }

  function problems() {
    var out = [];
    if (!SITE || typeof SITE !== 'object') { out.push('SITE must be an object that starts with { and ends with }.'); return out; }
    checkFields(SITE, SITE_FIELDS, 'SITE', out);
    ['name', 'title', 'headline', 'bio'].forEach(function (k) {
      if (!has(SITE[k])) out.push('SITE is missing "' + k + '".');
    });
    if (!Array.isArray(PROJECTS)) { out.push('PROJECTS must be a list that starts with [ and ends with ].'); return out; }
    var seen = {};
    PROJECTS.forEach(function (p, i) {
      var label = 'System ' + (i + 1) + (has(p.name) ? ' ("' + p.name + '")' : '');
      if (!p || typeof p !== 'object' || Array.isArray(p)) { out.push(label + ' should be written as { ... } with fields inside.'); return; }
      checkFields(p, PROJECT_FIELDS, label, out);
      ['id', 'name', 'type', 'summary'].forEach(function (k) {
        if (!has(p[k])) out.push(label + ' is missing "' + k + '".');
      });
      if (has(p.id)) {
        if (!/^[a-z0-9-]+$/.test(p.id)) out.push(label + ' has an id with capitals, spaces or symbols. Use only lowercase letters, numbers and dashes.');
        if (seen[p.id]) out.push(label + ' uses an id that another system already uses.');
        seen[p.id] = true;
      }
      checkListItems(p, label, out);
    });
    return out;
  }

  function checkBanner() {
    var p = problems();
    if (!p.length) return '';
    var shown = p.slice(0, 12);
    var rest = p.length - shown.length;
    return '<div class="check" role="status"><strong>Content check: please fix these in content.js</strong><ul>' +
      shown.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      (rest > 0 ? '<li>...and ' + rest + ' more. Fix these first, then refresh.</li>' : '') + '</ul></div>';
  }

  /* ====================== shared pieces ====================== */

  function headerHtml() {
    var links = '<a class="nav-link" href="#/" data-scroll="projects">Work</a>';
    if (has(SITE.about) || has(SITE.skills)) links += '<a class="nav-link" href="about/">About</a>';
    links += '<a class="nav-link" href="contact/">Contact</a>';
    links += btn('Email me', has(SITE.email) ? 'mailto:' + SITE.email : '', 'btn--primary btn--sm');

    return '<a class="skip" href="#main" data-skip>Skip to content</a>' +
      '<header class="site-header" id="top"><div class="wrap bar">' +
      '<a class="brand" href="#/" data-scroll="top"' + (has(SITE.name) ? '' : ' aria-label="Home"') + '>' +
      esc(SITE_NAME) + '</a>' +
      '<button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' + icon('menu') + '</button>' +
      '<nav id="site-nav" aria-label="Primary">' + links + '</nav>' +
      '</div></header>';
  }

  function contactSection() {
    var email = '';
    if (has(SITE.email)) {
      email = isPlaceholder(SITE.email)
        ? '<span class="email">' + esc(SITE.email) + '</span>'
        : '<a class="email" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>';
    }
    var links = btn('GitHub', SITE.github, 'btn--outline-dark', 'external') +
      btn('LinkedIn', SITE.linkedin, 'btn--outline-dark', 'external') +
      list(SITE.otherLinks).map(function (l) { return btn(l.label || 'Link', l.url, 'btn--outline-dark', 'external'); }).join('');

    var form = '';
    if (has(SITE.contactFormUrl) && !isPlaceholder(SITE.contactFormUrl) && safeUrl(SITE.contactFormUrl)) {
      form = '<form class="form" action="' + esc(safeUrl(SITE.contactFormUrl)) + '" method="POST" data-form>' +
        '<div><label for="f-name">Name</label><input id="f-name" name="name" type="text" required autocomplete="name"></div>' +
        '<div><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>' +
        '<div><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" required></textarea></div>' +
        // Hidden spam trap: people never see it, spam bots fill it in. Empty value = real person.
        '<div class="trap" aria-hidden="true"><label for="f-gotcha">Leave this field empty</label>' +
        '<input id="f-gotcha" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<button type="submit" class="btn btn--white">Send message</button>' +
        '<p class="form__note" data-form-status role="status"></p></form>';
    }

    return '<section class="contact" id="contact"><div class="wrap">' +
      '<div class="contact__text"><p class="label">Contact</p>' +
      '<h2>Have a system in mind? Let\'s talk.</h2>' + email +
      (has(SITE.replyTime) ? '<p class="contact__note">I reply within ' + esc(SITE.replyTime) + '.</p>' : '') +
      (links ? '<div class="contact__links">' + links + '</div>' : '') +
      '</div>' + form + '</div></section>';
  }

  function footerHtml() {
    return '<footer class="footer"><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(SITE_NAME) +
      '</span><a href="#/" data-scroll="top">Back to top</a></div></footer>';
  }

  /* ====================== home page ====================== */

  function heroHtml() {
    var photo = '';
    if (has(SITE.photo) && !isPlaceholder(SITE.photo) && safeUrl(SITE.photo)) {
      photo = '<div class="hero__photo"><img src="' + esc(safeUrl(SITE.photo)) + '" alt="' + esc('Photo of ' + SITE.name) + '"></div>';
    }
    // No photo? Balance the hero with a small card instead, and hide it when it would be empty.
    var side = '';
    if (!photo) {
      var topSkills = [];
      list(SITE.skills).forEach(function (g) {
        list(g.items).forEach(function (s) {
          if (topSkills.length < 6 && has(s) && !isPlaceholder(s)) topSkills.push(s);
        });
      });
      var blocks = '';
      if (has(SITE.availability)) {
        blocks += '<div><span class="label">Availability</span>' +
          '<p class="hero__avail"><span class="dot dot--ok" aria-hidden="true"></span>' + esc(SITE.availability) + '</p></div>';
      }
      if (topSkills.length) {
        blocks += '<div><span class="label">Works with</span><div class="tags">' +
          topSkills.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') + '</div></div>';
      }
      // A div, not an <aside>: a complementary landmark nested inside <main> is
      // flagged by axe, and this card is decoration next to the heading anyway.
      if (blocks) side = '<div class="hero__side"><div class="sidecard hero__card">' + blocks + '</div></div>';
    }
    // Never ship empty text nodes: a blank <h1> is announced as "heading level 1"
    // with no words, and empty paragraphs leave gaps. Falls back to the name while
    // content.js is still unfilled, so the page always has one real heading.
    var heading = has(SITE.headline) ? String(SITE.headline) : SITE_NAME;
    var eyebrow = has(SITE.title) ? '<p class="eyebrow">' + esc(SITE.title) + '</p>' : '';
    var lead = has(SITE.bio) ? '<p class="lead">' + esc(SITE.bio) + '</p>' : '';
    return '<section class="hero wrap"><div class="hero__text">' + eyebrow +
      '<h1>' + esc(heading) + '</h1>' + lead +
      '<div class="actions">' + btn('Email me', has(SITE.email) ? 'mailto:' + SITE.email : '', 'btn--primary', 'arrow') +
      '<a class="btn btn--secondary" href="#/" data-scroll="projects">See the work</a>' +
      btn('Download resume', SITE.resumeUrl, 'btn--secondary', 'download', ' download') + '</div>' +
      '<p class="reply">Hiring, or have a project in mind? <a href="#/" data-scroll="contact">Get in touch</a>.' +
      (has(SITE.replyTime) ? ' I reply within ' + esc(SITE.replyTime) + '.' : '') + '</p>' +
      (has(SITE.availability) && !side ? '<div class="avail"><span class="dot dot--ok" aria-hidden="true"></span>' + esc(SITE.availability) + '</div>' : '') +
      '</div>' + photo + side + '</section>';
  }

  // An empty placeholder for live repository details; live.js fills it in when
  // it has real data. Left empty (and therefore hidden) for private or missing repos.
  function liveLine(p) {
    return has(p.githubUrl) ? '<p class="live" data-live-repo="' + esc(p.githubUrl) + '"></p>' : '';
  }

  function cardHtml(p) {
    var n = PROJECTS.indexOf(p) + 1;
    var tags = list(p.stack).slice(0, 3).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    var facts = '';
    if (has(p.result) || has(p.role)) {
      facts = '<div class="facts">' +
        (has(p.result) ? '<div><span class="label">Result</span><span class="fact">' + esc(p.result) + '</span></div>' : '') +
        (has(p.role) ? '<div><span class="label">My role</span><span class="fact fact--muted">' + esc(p.role) + '</span></div>' : '') +
        '</div>';
    }
    return '<a class="card" href="#/project/' + esc(encodeURIComponent(p.id)) + '">' +
      shot(list(p.screenshots)[0], p.name + ' screenshot') +
      '<div class="card__body"><div class="card__meta"><span class="label">' + pad(n) + ' / ' + esc(p.type) + '</span>' + statusHtml(p.status) + '</div>' +
      '<h3>' + esc(p.name) + '</h3><p>' + esc(p.summary) + '</p>' + facts +
      liveLine(p) +
      (tags ? '<div class="tags">' + tags + '</div>' : '') +
      '<span class="more">View details' + icon('arrow') + '</span></div></a>';
  }

  // The cards (or the empty message) on their own, so a filter change can
  // replace just this part and leave the live region above it alive.
  function projectsBody() {
    var shown = PROJECTS.filter(function (p) { return state.filter === 'All' || p.type === state.filter; });
    return shown.length
      ? '<div class="grid">' + shown.map(cardHtml).join('') + '</div>'
      : '<div class="empty">No systems yet. Add one in content.js (see README.md).</div>';
  }

  function countText() {
    var n = PROJECTS.filter(function (p) { return state.filter === 'All' || p.type === state.filter; }).length;
    return n + (n === 1 ? ' system' : ' systems') + (state.filter === 'All' ? '' : ' in ' + state.filter);
  }

  function projectsSection() {
    var all = types();
    var chips = '';
    if (all.length > 1) {
      chips = '<div class="filters" role="group" aria-label="Filter systems by type">' +
        ['All'].concat(all).map(function (t) {
          return '<button type="button" class="chip" data-filter="' + esc(t) + '" aria-pressed="' + (t === state.filter) + '">' + esc(t) + '</button>';
        }).join('') + '</div>';
    }

    return '<section class="wrap section" id="projects"><div class="section__head"><div class="section__title">' +
      '<p class="label label--accent">Projects</p><h2 class="big">Selected systems</h2>' +
      '<p class="muted" data-count aria-live="polite">' + esc(countText()) + '</p></div>' + chips + '</div>' +
      '<div id="projects-body">' + projectsBody() + '</div></section>';
  }

  function proofSection() {
    if (!has(SITE.testimonials) && !has(SITE.credentials)) return '';
    var quotes = list(SITE.testimonials).map(function (t) {
      return '<figure class="quote"><blockquote>' + esc(t.quote) + '</blockquote><figcaption>' +
        (has(t.name) ? '<strong>' + esc(t.name) + '</strong>' : '') + (has(t.role) ? '<span>' + esc(t.role) + '</span>' : '') +
        '</figcaption></figure>';
    }).join('');
    var creds = list(SITE.credentials).map(function (c) { return '<span class="pill">' + esc(c) + '</span>'; }).join('');
    return '<div class="band" id="proof"><div class="wrap section" style="scroll-margin-top:72px">' +
      '<div class="section__title"><p class="label label--accent">Proof</p><h2 class="big">What people say</h2></div>' +
      (quotes ? '<div class="quotes">' + quotes + '</div>' : '') +
      (creds ? '<div class="pills"><span class="label">Credentials</span>' + creds + '</div>' : '') +
      '</div></div>';
  }

  function aboutSection() {
    if (!has(SITE.about) && !has(SITE.skills)) return '';
    var paras = list(SITE.about).map(function (t) { return '<p class="body">' + esc(t) + '</p>'; }).join('');
    var skills = list(SITE.skills).filter(function (g) { return has(g.items); }).map(function (g) {
      return '<div class="skillgroup"><h3 class="label">' + esc(g.group) + '</h3><div>' +
        list(g.items).map(function (s) { return '<span class="skill">' + esc(s) + '</span>'; }).join('') + '</div></div>';
    }).join('');
    return '<div class="about" id="about"><div class="wrap section" style="scroll-margin-top:72px">' +
      (paras ? '<div class="about__text"><p class="label label--accent">About</p><h2 class="big">About me</h2>' + paras + '</div>' : '') +
      (skills ? '<div class="skills">' + skills + '</div>' : '') + '</div></div>';
  }

  function homePage() {
    return heroHtml() + projectsSection() + proofSection() + aboutSection();
  }

  /* ====================== project page ====================== */

  function projectPage(p) {
    var shots = list(p.screenshots);
    var idx = PROJECTS.indexOf(p);
    var links = btn('Live demo', p.demoUrl, 'btn--primary', 'external') +
      btn('Source on GitHub', p.githubUrl, 'btn--secondary', 'external', ' data-github-link') +
      btn('Watch demo video', p.videoUrl, 'btn--secondary', 'external');

    var strip = [['Role', p.role], ['Timeline', p.timeline], ['Team', p.team], ['Type', p.type]]
      .filter(function (x) { return has(x[1]); })
      .map(function (x) { return '<div><span class="label">' + x[0] + '</span><span class="v">' + esc(x[1]) + '</span></div>'; }).join('');

    var glance = [['The problem', p.problem, ''], ['What I built', p.built, ''], ['The result', p.result, ' glance__item--result']]
      .filter(function (x) { return has(x[1]); })
      .map(function (x) { return '<div class="glance__item' + x[2] + '"><span class="label' + (x[2] ? ' label--accent' : '') + '">' + x[0] + '</span><p>' + esc(x[1]) + '</p></div>'; }).join('');

    var features = list(p.features).length
      ? '<section class="block"><h2>Key features</h2><div class="features">' + list(p.features).map(function (f, n) {
          return '<div class="feature"><span class="num">' + pad(n + 1) + '</span><div><h3>' + esc(f.title) + '</h3>' +
            (has(f.text) ? '<p>' + esc(f.text) + '</p>' : '') + '</div></div>';
        }).join('') + '</div></section>' : '';

    var challenges = list(p.challenges).length
      ? '<section class="block"><h2>Decisions and trade-offs</h2><div class="pairs">' + list(p.challenges).map(function (c) {
          return '<div class="pair"><div><span class="label">The trade-off</span><p>' + esc(c.challenge) + '</p></div>' +
            '<div><span class="label label--accent">What I did</span><p>' + esc(c.solution) + '</p></div></div>';
        }).join('') + '</div></section>' : '';

    var results = list(p.results).length
      ? '<section class="block"><h2>Results</h2><div class="tiles">' + list(p.results).map(function (r) {
          return '<div class="tile"><strong>' + esc(r.value) + '</strong><span>' + esc(r.label) + '</span></div>';
        }).join('') + '</div></section>' : '';

    // "What I would change" - the part most portfolios skip, and the one a good
    // interviewer reads first. Hidden until there is a real answer in content.js.
    var change = has(p.change)
      ? '<section class="block"><h2>What I would change</h2><p class="body">' + esc(p.change) + '</p></section>' : '';

    var gallery = shots.length > 1
      ? '<section class="block"><h2>Screenshots</h2><div class="gallery">' + shots.slice(1).map(function (s, n) {
          return shot(s, p.name + ' screenshot ' + (n + 2));
        }).join('') + '</div></section>' : '';

    var side = list(p.stack).length
      ? '<div class="layout__side"><div class="sidecard"><h2 class="label">Tech stack</h2><div class="tags">' +
        list(p.stack).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div></div>' : '';

    var main = features + challenges + results + change + gallery;
    var layout = (main || side)
      ? '<div class="layout wrap"><div class="layout__main">' + main + '</div>' + side + '</div>' : '';

    var pager = '';
    if (PROJECTS.length > 1) {
      var pp = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
      var np = PROJECTS[(idx + 1) % PROJECTS.length];
      pager = '<section class="next"><div class="wrap pager">' +
        '<a class="pager--prev" href="#/project/' + esc(encodeURIComponent(pp.id)) + '">' + icon('back') +
        '<div><span class="label">Previous system</span><strong>' + esc(pp.name) + '</strong></div></a>' +
        '<a class="pager--next" href="#/project/' + esc(encodeURIComponent(np.id)) + '">' +
        '<div><span class="label">Next system</span><strong>' + esc(np.name) + '</strong></div>' + icon('arrow') + '</a>' +
        '</div></section>';
    }

    return '<article><div class="wrap project">' +
      '<a class="crumb" href="#/" data-scroll="projects">' + icon('back') + 'All projects</a>' +
      '<div class="pagehead"><div class="pagehead__text"><div class="pagehead__meta"><span class="label">' + pad(idx + 1) + ' / ' + esc(p.type) + '</span>' + statusHtml(p.status) + '</div>' +
      '<h1>' + esc(p.name) + '</h1><p class="lead">' + esc(p.summary) + '</p></div>' +
      '<div class="actions">' + links +
      '<button type="button" class="copybtn" data-copy>Copy link</button></div></div>' +
      (strip ? '<div class="strip">' + strip + '</div>' : '') +
      liveLine(p) +
      (glance ? '<div class="glance"><h2 class="label">At a glance</h2><div class="glance__row">' + glance + '</div></div>' : '') +
      (shots.length ? shot(shots[0], p.name + ' main screenshot', 'shot--round', true) : '') +
      '</div>' + layout +
      '<section class="cta"><div class="wrap"><div><h2>Need a system like this?</h2><p>' +
      (has(SITE.replyTime) ? 'Tell me about your problem. I reply within ' + esc(SITE.replyTime) + '.' : 'Tell me about your problem.') +
      '</p></div><a class="btn btn--white" href="#/" data-scroll="contact">Start a project' + icon('arrow') + '</a></div></section>' +
      pager + '</article>';
  }

  function notFoundPage() {
    return '<section class="wrap project"><a class="crumb" href="#/" data-scroll="projects">' + icon('back') + 'All projects</a>' +
      '<h1 style="font-family:var(--display);font-size:40px">That system was not found</h1>' +
      '<p class="muted">The link may be old. Go back to the list of projects and pick one.</p></section>';
  }

  /* ====================== routing and rendering ====================== */

  /* ====================== structured data and analytics ====================== */

  // Keep this list identical to the one in build.js: the home page writes its
  // structured data at runtime, so both copies must agree.
  var COUNTRY_CODES = {
    philippines: 'PH', 'united states': 'US', 'united states of america': 'US', usa: 'US',
    canada: 'CA', 'united kingdom': 'GB', uk: 'GB', 'great britain': 'GB', ireland: 'IE',
    australia: 'AU', 'new zealand': 'NZ', india: 'IN', pakistan: 'PK', bangladesh: 'BD',
    singapore: 'SG', malaysia: 'MY', indonesia: 'ID', thailand: 'TH', vietnam: 'VN',
    japan: 'JP', 'south korea': 'KR', korea: 'KR', china: 'CN', 'hong kong': 'HK', taiwan: 'TW',
    'united arab emirates': 'AE', uae: 'AE', 'saudi arabia': 'SA', qatar: 'QA', israel: 'IL',
    germany: 'DE', france: 'FR', spain: 'ES', italy: 'IT', netherlands: 'NL', belgium: 'BE',
    switzerland: 'CH', austria: 'AT', portugal: 'PT', poland: 'PL', sweden: 'SE',
    norway: 'NO', denmark: 'DK', finland: 'FI', mexico: 'MX', brazil: 'BR', argentina: 'AR',
    'south africa': 'ZA', nigeria: 'NG', kenya: 'KE', egypt: 'EG'
  };

  function countryCode(value) {
    var raw = String(value || '').trim();
    var code = COUNTRY_CODES[raw.toLowerCase().replace(/\./g, '')];
    if (code) return code;
    return /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : raw;
  }

  // "Daet 4600, Philippines" becomes a PostalAddress: the last part is the country,
  // and a trailing 4-6 digit number on the rest is the postal code. A location with
  // no commas stays a plain locality rather than being guessed at.
  function postalAddress(value) {
    var parts = String(value).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var address = { '@type': 'PostalAddress' };
    if (parts.length > 1) address.addressCountry = countryCode(parts.pop());
    var locality = parts.join(', ');
    var withCode = locality.match(/^(.*?)\s+(\d{4,6})$/);
    if (withCode) {
      address.addressLocality = withCode[1];
      address.postalCode = withCode[2];
    } else if (locality) {
      address.addressLocality = locality;
    }
    return address;
  }

  // One Person record for search engines: who the site is about, plus the same
  // profiles that are linked from the contact section. Search engines only read a
  // Person as part of a page type they support, so it is wrapped in ProfilePage.
  function writeJsonLd() {
    var sameAs = [SITE.github, SITE.linkedin]
      .concat(list(SITE.otherLinks).map(function (l) { return l && l.url; }))
      .filter(function (u) { return has(u) && !isPlaceholder(u) && /^https?:/i.test(String(u)); });
    // The same facts the About page shows, in the shape a search engine expects.
    var languages = list(SITE.languages)
      .filter(function (l) { return l && has(l.name) && !isPlaceholder(l.name); })
      .map(function (l) { return { '@type': 'Language', name: String(l.name) }; });
    var person = {
      '@type': 'Person',
      name: SITE_NAME,
      jobTitle: has(SITE.title) ? String(SITE.title) : undefined,
      description: has(SITE.bio) ? String(SITE.bio) : undefined,
      url: has(SITE.siteUrl) ? String(SITE.siteUrl) : undefined,
      // A bare address: the mailto: scheme belongs on links, not in the record.
      email: has(SITE.email) && !isPlaceholder(SITE.email) ? String(SITE.email) : undefined,
      telephone: has(SITE.phone) && !isPlaceholder(SITE.phone) ? String(SITE.phone) : undefined,
      address: has(SITE.location) && !isPlaceholder(SITE.location) ? postalAddress(SITE.location) : undefined,
      knowsLanguage: languages.length ? languages : undefined,
      sameAs: sameAs.length ? sameAs : undefined
    };
    var page = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: person
    };
    var script = document.querySelector('script[data-person]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-person', '');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(page);
  }

  // Analytics stays off until a provider is named in content.js: no name, no script,
  // and it is never loaded on your own computer.
  var analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    if (isLocalPreview()) return;
    var provider = String(SITE.analyticsProvider || '').trim().toLowerCase();
    var code = String(SITE.analyticsSite || '').trim();
    if (!code || isPlaceholder(code)) return;
    var s = document.createElement('script');
    s.defer = true;
    if (provider === 'goatcounter') {
      s.src = 'https://gc.zgo.at/count.js';
      s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
    } else if (provider === 'plausible') {
      s.src = 'https://plausible.io/js/script.js';
      s.setAttribute('data-domain', code);
    } else {
      return;
    }
    document.head.appendChild(s);
  }

  function route() {
    var hash = location.hash || '';
    var m = hash.match(/^#\/project\/([^/?#]+)/);
    if (m) return { name: 'project', id: decodeURIComponent(m[1]) };
    // Plain links like index.html#contact still land on the right section.
    var anchor = hash.match(/^#(projects|proof|about|contact)$/);
    return anchor ? { name: 'home', anchor: anchor[1] } : { name: 'home' };
  }

  function render() {
    var r = route();
    // Every route change rebuilds the page, so the link that was activated no longer
    // exists and focus falls back to the body. Put it on the new main landmark instead
    // (the first paint keeps focus where the browser puts it).
    var key = r.name + ':' + (r.id || '') + ':' + (r.anchor || '');
    var moved = state.routeKey !== '' && state.routeKey !== key;
    state.routeKey = key;
    var p = r.name === 'project' ? findProject(r.id) : null;
    var body = r.name === 'project' ? (p ? projectPage(p) : notFoundPage()) : homePage();

    app.innerHTML = headerHtml() + '<main id="main" tabindex="-1">' + devbarHtml() + checkBanner() + body + contactSection() + '</main>' + footerHtml();

    // Build the title from the parts that exist; fall back to "Portfolio" while content is still empty.
    var titleParts = [];
    if (p && has(p.name)) titleParts.push(p.name);
    if (has(SITE.name)) titleParts.push(SITE.name);
    if (!p && has(SITE.title)) titleParts.push(SITE.title);
    document.title = (r.name === 'project' && !p)
      ? 'Not found | ' + SITE_NAME
      : (titleParts.length ? titleParts.join(' | ') : SITE_NAME);

    var desc = p ? p.summary : String(SITE.headline || '') + ' ' + String(SITE.bio || '');
    if (metaEl) metaEl.setAttribute('content', has(desc) ? String(desc).trim() : DEFAULT_DESC);

    writeJsonLd();
    loadAnalytics();

    // Ask for live repository details now that the placeholders are on the page.
    if (window.PortfolioLive) window.PortfolioLive.refresh();

    if (moved) {
      var mainEl = document.getElementById('main');
      if (mainEl) {
        // preventScroll keeps the scroll position below authoritative.
        try { mainEl.focus({ preventScroll: true }); } catch (err) { mainEl.focus(); }
      }
    }

    if (state.pendingScroll) {
      var id = state.pendingScroll;
      state.pendingScroll = null;
      scrollToId(id);
    } else if (r.name === 'home' && r.anchor) {
      scrollToId(r.anchor);
    } else {
      window.scrollTo(0, 0);
    }
  }

  function scrollToId(id) {
    if (id === 'top') { window.scrollTo(0, 0); return; }
    var el = document.getElementById(id);
    if (el) el.scrollIntoView();
  }

  function closeMenu() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var nav = header.querySelector('#site-nav');
    var b = header.querySelector('[data-menu]');
    // On a phone the nav disappears when the menu closes, which would drop focus onto
    // the body mid-navigation; hand it back to the button that opened the menu.
    var focusWasInNav = !!(nav && nav.contains(document.activeElement));
    header.classList.remove('is-open');
    if (b) { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Open menu'); b.innerHTML = icon('menu'); }
    if (focusWasInNav && b && b.offsetParent !== null) b.focus();
  }

  // Copy the current address. Falls back to the old selection trick on plain http.
  function copyLink(button) {
    var url = location.href;
    function done() {
      button.setAttribute('data-copied', 'true');
      button.textContent = 'Link copied';
      setTimeout(function () {
        button.removeAttribute('data-copied');
        button.textContent = 'Copy link';
      }, 2000);
    }
    function fallback() {
      var area = document.createElement('textarea');
      area.value = url;
      area.setAttribute('readonly', '');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* leave the button as it was */ }
      document.body.removeChild(area);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  app.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-filter],[data-scroll],[data-menu],[data-skip],[data-copy]') : null;
    if (!t) return;

    if (t.hasAttribute('data-copy')) {
      copyLink(t);
      return;
    }

    if (t.hasAttribute('data-filter')) {
      state.filter = t.getAttribute('data-filter');
      // Update the chips in place, replace only the cards, and update the count
      // text inside the existing live region so screen readers hear the change.
      var chips = document.querySelectorAll('[data-filter]');
      for (var i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed', String(chips[i].getAttribute('data-filter') === state.filter));
      }
      var list = document.getElementById('projects-body');
      if (list) list.innerHTML = projectsBody();
      var count = document.querySelector('[data-count]');
      if (count) count.textContent = countText();
      return;
    }

    if (t.hasAttribute('data-menu')) {
      var header = document.querySelector('.site-header');
      var open = !header.classList.contains('is-open');
      header.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      t.innerHTML = icon(open ? 'close' : 'menu');
      return;
    }

    if (t.hasAttribute('data-skip')) {
      e.preventDefault();
      var main = document.getElementById('main');
      if (main) { main.focus(); main.scrollIntoView(); }
      return;
    }

    // Scroll links: work from the home page and from a project page.
    e.preventDefault();
    closeMenu();
    var id = t.getAttribute('data-scroll');
    if (route().name === 'home') {
      scrollToId(id);
    } else {
      state.pendingScroll = id;
      location.hash = '#/';
    }
  });

  window.addEventListener('hashchange', render);

  // Escape closes the mobile menu and puts focus back on the button.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    var header = document.querySelector('.site-header');
    if (!header || !header.classList.contains('is-open')) return;
    closeMenu();
    var b = header.querySelector('[data-menu]');
    if (b) b.focus();
  });

  // Send the form in the background (when contactFormUrl is set) and confirm inline.
  app.addEventListener('submit', function (e) {
    var form = e.target.closest ? e.target.closest('form[data-form]') : null;
    if (!form || !window.fetch || !window.FormData) return;
    e.preventDefault();

    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) return; // a bot filled the hidden field: stop quietly

    var status = form.querySelector('[data-form-status]');
    var button = form.querySelector('button[type="submit"]');
    if (button) { button.disabled = true; button.textContent = 'Sending...'; }
    if (status) { status.className = 'form__note'; status.textContent = ''; }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.innerHTML = '<p class="form__done" role="status">Message sent. Thank you - I will reply soon.</p>';
    }).catch(function () {
      if (button) { button.disabled = false; button.textContent = 'Send message'; }
      if (status) {
        status.className = 'form__error';
        status.innerHTML = 'Sorry, that did not send.' + (has(SITE.email)
          ? ' Email me instead: <a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>.'
          : ' Please try again.');
      }
    });
  });

  // A screenshot that fails to load becomes the empty frame instead of a broken icon.
  // Done here rather than with an inline onerror, so a strict Content-Security-Policy
  // can be added later without breaking pictures.
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    var frame = img.parentNode;
    if (frame && frame.classList && frame.classList.contains('shot')) {
      frame.classList.add('shot--empty');
      img.remove();
    }
  }, true);

  // Apply the accent color from content.js (only if it looks like a color code).
  if (/^#[0-9a-f]{3,8}$/i.test(String(SITE.accentColor || ''))) {
    document.documentElement.style.setProperty('--accent', SITE.accentColor);
    var theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute('content', SITE.accentColor);
  }

  render();
})();
