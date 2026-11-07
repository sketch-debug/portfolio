#!/usr/bin/env node
/* ======================================================================
   build.js - gives every system its own shareable page.

   Run it once after adding or changing a system:
       node build.js
   If your site address is not in content.js yet, pass it:
       node build.js --site=https://your-name.github.io/portfolio/

   It writes projects/<id>/index.html for each system and sitemap.xml.
   It never changes index.html, so the one-page site keeps working even
   if you forget to run this.
   ====================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const args = process.argv.slice(2);
const siteArg = (args.find(function (a) { return a.indexOf('--site=') === 0; }) || '').split('=')[1] || '';

function stop(message) {
  console.error('\n  ' + message + '\n');
  process.exit(1);
}

/* ---------- 1. read content.js the same way the browser does ---------- */

let SITE, PROJECTS;
try {
  const source = fs.readFileSync(path.join(ROOT, 'content.js'), 'utf8');
  const box = {};
  vm.createContext(box);
  vm.runInContext(source + '\n;__content = { SITE: SITE, PROJECTS: PROJECTS };', box,
    { filename: 'content.js', timeout: 4000 });
  SITE = box.__content.SITE;
  PROJECTS = box.__content.PROJECTS;
} catch (err) {
  stop('content.js could not be read: ' + err.message +
    '\n  The usual cause is a missing comma, a missing quote mark, or a double quote inside text.');
}

if (!SITE || typeof SITE !== 'object') stop('content.js does not define SITE.');
if (!Array.isArray(PROJECTS)) stop('content.js does not define PROJECTS as a list.');
if (!PROJECTS.length) stop('There are no systems in content.js yet, so there is nothing to build.');

/* ---------- 2. small helpers ---------- */

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const has = (v) => (Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== '');
const list = (v) => (Array.isArray(v) ? v : []);
const pad = (n) => (n < 10 ? '0' + n : String(n));

function safeUrl(u) {
  u = String(u || '').trim();
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return '';
  return u;
}

const SITE_NAME = has(SITE.name) ? String(SITE.name) : 'Portfolio';

// Absolute address, used for canonical links, share tags and the sitemap.
let BASE = (siteArg || SITE.siteUrl || '').trim();
if (BASE && !/^https?:\/\//i.test(BASE)) BASE = 'https://' + BASE;
BASE = BASE.replace(/\/+$/, '');
const ABS = (p) => (BASE ? BASE + '/' + p : '');

if (!BASE) {
  console.warn('\n  No site address yet: canonical links, share tags and sitemap.xml are skipped.');
  console.warn('  Add siteUrl to content.js, or run: node build.js --site=https://your-address/');
}

// Where the site will live, used by 404.html so it can find its stylesheet from any
// depth. GitHub Pages shows that file at the address that failed, so a bare
// "style.css" would resolve against the missing page instead of against the site.
// The site address is used when it is known; otherwise the canonical link already
// written in index.html is reused, so there is still one declared address.
const SITE_ROOT = (function () {
  if (BASE) return BASE + '/';
  try {
    const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const found = home.match(/<link rel="canonical" href="(https?:\/\/[^"]+)"/i);
    if (found) {
      const url = new URL(found[1]);
      return url.origin + url.pathname.replace(/[^\/]*$/, '');
    }
  } catch (e) { /* no index.html to read: keep the relative paths below */ }
  return '';
})();

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230F1720'/%3E%3Crect x='8' y='17' width='4' height='7' rx='1' fill='%232438D9'/%3E%3Crect x='14' y='12' width='4' height='12' rx='1' fill='%23FFFFFF'/%3E%3Crect x='20' y='8' width='4' height='16' rx='1' fill='%235B6CFF'/%3E%3C/svg%3E";

/* ---------- 3. pieces of one project page ---------- */

function statusHtml(status) {
  if (!has(status)) return '';
  const s = String(status).toLowerCase();
  const cls = s === 'live' ? 'dot--ok' : (s === 'prototype' || s.indexOf('development') !== -1) ? 'dot--warn' : '';
  return '<span class="status"><span class="dot ' + cls + '" aria-hidden="true"></span>' + esc(status) + '</span>';
}

function linkButton(label, url, cls, external, attrs) {
  const href = safeUrl(url);
  if (!has(href) || /^\s*\[.*\]\s*$/.test(String(url))) return '';
  return '<a class="btn ' + cls + '" href="' + esc(href) + '"' + (attrs || '') +
    (external && /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label) + '</a>';
}

function image(src, alt, extra, eager) {
  const safe = has(src) ? safeUrl(src) : '';
  if (!safe || /^\s*\[.*\]\s*$/.test(String(src))) {
    return '<div class="shot' + (extra ? ' ' + extra : '') + ' shot--empty"></div>';
  }
  // eager: the picture at the top of the page should not wait for a scroll.
  return '<div class="shot' + (extra ? ' ' + extra : '') + '">' +
    '<img src="../../' + esc(safe) + '" alt="' + esc(alt) + '" ' +
    (eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + ' decoding="async"></div>';
}

function featureList(p) {
  const items = list(p.features);
  if (!items.length) return '';
  return '<section class="block"><h2>Key features</h2><div class="features">' +
    items.map(function (f, n) {
      return '<div class="feature"><span class="num">' + pad(n + 1) + '</span><div><h3>' + esc(f && f.title) + '</h3>' +
        (f && has(f.text) ? '<p>' + esc(f.text) + '</p>' : '') + '</div></div>';
    }).join('') + '</div></section>';
}

function challengeList(p) {
  const items = list(p.challenges);
  if (!items.length) return '';
  return '<section class="block"><h2>Decisions and trade-offs</h2><div class="pairs">' +
    items.map(function (c) {
      return '<div class="pair"><div><span class="label">The trade-off</span><p>' + esc(c && c.challenge) + '</p></div>' +
        '<div><span class="label label--accent">What I did</span><p>' + esc(c && c.solution) + '</p></div></div>';
    }).join('') + '</div></section>';
}

// Hidden until content.js has a real answer: the section most portfolios skip.
function changeBlock(p) {
  if (!has(p.change)) return '';
  return '<section class="block"><h2>What I would change</h2><p class="body">' + esc(p.change) + '</p></section>';
}

function resultList(p) {
  const items = list(p.results);
  if (!items.length) return '';
  return '<section class="block"><h2>Results</h2><div class="tiles">' +
    items.map(function (r) {
      return '<div class="tile"><strong>' + esc(r && r.value) + '</strong><span>' + esc(r && r.label) + '</span></div>';
    }).join('') + '</div></section>';
}

function gallery(p) {
  const shots = list(p.screenshots);
  if (shots.length < 2) return '';
  return '<section class="block"><h2>Screenshots</h2><div class="gallery">' +
    shots.slice(1).map(function (s, n) { return image(s, p.name + ' screenshot ' + (n + 2)); }).join('') +
    '</div></section>';
}

function pagerHtml(p, index, valid) {
  if (valid.length < 2) return '';
  const prev = valid[(index - 1 + valid.length) % valid.length];
  const next = valid[(index + 1) % valid.length];
  const card = (item, dir) => '<a class="pager--' + dir + '" href="../' + encodeURIComponent(item.id) + '/">' +
    (dir === 'prev' ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' : '') +
    '<div><span class="label">' + (dir === 'prev' ? 'Previous' : 'Next') + ' system</span><strong>' + esc(item.name) + '</strong></div>' +
    (dir === 'next' ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' : '') +
    '</a>';
  return '<section class="next"><div class="wrap pager">' + card(prev, 'prev') + card(next, 'next') + '</div></section>';
}

const MENU_ICON = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

// The same header on every generated page. prefix walks back to the site root:
// '../../' from projects/<id>/, '../' from about/ and contact/.
function siteHeader(prefix) {
  return '<a class="skip" href="#main">Skip to content</a>\n' +
    '<header class="site-header"><div class="wrap bar">' +
    '<a class="brand" href="' + prefix + 'index.html">' + esc(SITE_NAME) + '</a>' +
    '<button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' + MENU_ICON + '</button>' +
    '<nav id="site-nav" aria-label="Primary">' +
    '<a class="nav-link" href="' + prefix + 'index.html#projects">Work</a>' +
    ((has(SITE.about) || has(SITE.skills)) ? '<a class="nav-link" href="' + prefix + 'about/">About</a>' : '') +
    '<a class="nav-link" href="' + prefix + 'contact/">Contact</a>' +
    linkButton('Email me', has(SITE.email) ? 'mailto:' + SITE.email : '', 'btn--primary btn--sm', false) +
    '</nav></div></header>\n';
}

// Countries named in `location` are written as ISO 3166-1 alpha-2 codes, which is
// what schema.org consumers expect. A name not in this list is passed through as
// written rather than guessed at, since a wrong code is worse than a valid name.
const COUNTRY_CODES = {
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
  const raw = String(value || '').trim();
  const code = COUNTRY_CODES[raw.toLowerCase().replace(/\./g, '')];
  if (code) return code;
  return /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : raw;
}

// "Daet 4600, Philippines" becomes a PostalAddress: the last part is the country,
// and a trailing 4-6 digit number on the rest is the postal code. A location with
// no commas stays a plain locality rather than being guessed at.
function postalAddress(value) {
  const parts = String(value).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const address = { '@type': 'PostalAddress' };
  if (parts.length > 1) address.addressCountry = countryCode(parts.pop());
  const locality = parts.join(', ');
  const withCode = locality.match(/^(.*?)\s+(\d{4,6})$/);
  if (withCode) {
    address.addressLocality = withCode[1];
    address.postalCode = withCode[2];
  } else if (locality) {
    address.addressLocality = locality;
  }
  return address;
}

// One <script> block per page. \u003c keeps the JSON from ever closing it early.
function jsonLdScript(data) {
  return '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>\n';
}

// Who the site is about, built from content.js alone, so the profile page and the
// project pages all describe the same person.
function personNode() {
  const person = {
    '@type': 'Person',
    name: SITE_NAME
  };
  if (has(SITE.title)) person.jobTitle = String(SITE.title);
  if (has(SITE.bio)) person.description = String(SITE.bio);
  // A bare address: the mailto: scheme belongs on links, not in the record.
  if (has(SITE.email)) person.email = String(SITE.email);
  // Same facts the About page shows, in the shape a search engine expects.
  if (has(SITE.phone)) person.telephone = String(SITE.phone);
  if (has(SITE.location)) person.address = postalAddress(SITE.location);
  const languages = list(SITE.languages)
    .filter(function (l) { return has(l.name); })
    .map(function (l) { return { '@type': 'Language', name: String(l.name) }; });
  if (languages.length) person.knowsLanguage = languages;
  if (BASE) person.url = ABS('');
  const sameAs = [SITE.github, SITE.linkedin].filter(has).map(String);
  if (sameAs.length) person.sameAs = sameAs;
  return person;
}

// Search engines only read a Person as part of a page type they support, and for a
// page that is about a person that type is ProfilePage, whose mainEntity is the
// Person itself.
function personJsonLd() {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: personNode()
  });
}

// A project page is about a system, not a person: describe the work itself and name
// its author. Google has no rich-result feature for this yet, so it is here to be
// machine-readable rather than to earn a card.
function projectJsonLd(p) {
  const url = ABS('projects/' + p.id + '/');
  const work = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: has(p.name) ? String(p.name) : 'System',
    author: personNode()
  };
  if (has(p.summary)) work.description = String(p.summary);
  if (url) work.url = url;
  if (has(p.githubUrl)) work.codeRepository = String(p.githubUrl);
  const stack = list(p.stack).filter(has).map(String);
  if (stack.length) work.keywords = stack.join(', ');
  return jsonLdScript(work);
}

function pageHtml(p, index, valid) {
  const url = ABS('projects/' + p.id + '/');
  const desc = has(p.summary)
    ? String(p.summary)
    : p.name + ' - a ' + p.type + ' system' + (has(SITE_NAME) ? ' by ' + SITE_NAME : '') + '.';
  const title = (has(p.name) ? p.name : 'System') + ' | ' + SITE_NAME;
  const shots = list(p.screenshots);

  const share = [
    '<meta property="og:type" content="article">',
    '<meta property="og:title" content="' + esc(p.name) + '">',
    '<meta property="og:description" content="' + esc(desc) + '">',
    '<meta name="twitter:card" content="summary_large_image">'
  ];
  if (url) share.push('<meta property="og:url" content="' + esc(url) + '">');
  if (BASE) {
    const shareImage = shots.length ? ABS(String(shots[0])) : ABS('images/share.png');
    share.push('<meta property="og:image" content="' + esc(shareImage) + '">');
    if (!shots.length) {
      share.push('<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">');
    }
  }

  const actions = [
    linkButton('Live demo', p.demoUrl, 'btn--primary', true),
    linkButton('Source on GitHub', p.githubUrl, 'btn--secondary', true, ' data-github-link'),
    linkButton('Watch demo video', p.videoUrl, 'btn--secondary', true),
    '<button type="button" class="copybtn" data-copy>Copy link</button>' +
    '<span class="sr-only" role="status" data-copy-status></span>'
  ].join('');

  const strip = [['Role', p.role], ['Timeline', p.timeline], ['Team', p.team], ['Type', p.type]]
    .filter((x) => has(x[1]))
    .map((x) => '<div><span class="label">' + x[0] + '</span><span class="v">' + esc(x[1]) + '</span></div>').join('');

  const glance = [['The problem', p.problem, ''], ['What I built', p.built, ''], ['The result', p.result, ' glance__item--result']]
    .filter((x) => has(x[1]))
    .map((x) => '<div class="glance__item' + x[2] + '"><span class="label' + (x[2] ? ' label--accent' : '') + '">' + x[0] +
      '</span><p>' + esc(x[1]) + '</p></div>').join('');

  const main = featureList(p) + challengeList(p) + resultList(p) + changeBlock(p) + gallery(p);
  const side = list(p.stack).length
    ? '<div class="layout__side"><div class="sidecard"><h2 class="label">Tech stack</h2><div class="tags">' +
      list(p.stack).map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div></div></div>'
    : '';
  const layout = (main || side)
    ? '<div class="layout wrap"><div class="layout__main">' + main + '</div>' + side + '</div>' : '';

  return '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(title) + '</title>\n' +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    (url ? '<link rel="canonical" href="' + esc(url) + '">\n' : '') +
    share.join('\n') + '\n' +
    '<meta name="theme-color" content="' + esc(/^#[0-9a-f]{3,8}$/i.test(String(SITE.accentColor || '')) ? SITE.accentColor : '#2438D9') + '">\n' +
    '<link rel="icon" href="' + FAVICON + '">\n' +
    '<link rel="preload" href="../../fonts/ibm-plex-sans.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="preload" href="../../fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="stylesheet" href="../../fonts.css">\n' +
    '<link rel="stylesheet" href="../../style.css">\n' +
    projectJsonLd(p) +
    '</head>\n<body>\n' +
    siteHeader('../../') +
    '<main id="main" tabindex="-1">\n<article>\n<div class="wrap project">' +
    '<a class="crumb" href="../../index.html#projects"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>All projects</a>' +
    '<div class="pagehead"><div class="pagehead__text"><div class="pagehead__meta">' +
    '<span class="label">' + pad(index + 1) + ' / ' + esc(p.type) + '</span>' + statusHtml(p.status) + '</div>' +
    '<h1>' + esc(p.name) + '</h1><p class="lead">' + esc(p.summary) + '</p></div>' +
    '<div class="actions">' + actions + '</div></div>' +
    (strip ? '<div class="strip">' + strip + '</div>' : '') +
    (has(p.githubUrl) ? '<p class="live" data-live-repo="' + esc(p.githubUrl) + '"></p>' : '') +
    (glance ? '<div class="glance"><h2 class="label">At a glance</h2><div class="glance__row">' + glance + '</div></div>' : '') +
    (shots.length ? image(shots[0], p.name + ' main screenshot', 'shot--round', true) : '') +
    '</div>' + layout +
    '<section class="cta"><div class="wrap"><div><h2>Need a system like this?</h2><p>' +
    (has(SITE.replyTime) ? 'Tell me about your problem. I reply within ' + esc(SITE.replyTime) + '.' : 'Tell me about your problem.') +
    '</p></div><a class="btn btn--white" href="../../index.html#contact">Start a project</a></div></section>' +
    pagerHtml(p, index, valid) +
    '</article>\n</main>\n' +
    '<footer class="footer"><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(SITE_NAME) +
    '</span><a href="../../index.html">Back to the portfolio</a></div></footer>\n' +
    '<script src="../../page.js"></script>\n' +
    '<script src="../../live.js"></script>\n' +
    '</body>\n</html>\n';
}

/* ---------- 4. the home page's head, and a 404 page ---------- */

const META_START = '<!-- build:meta -->';
const META_END = '<!-- /build:meta -->';

function homeTitle() {
  return has(SITE.title) ? SITE_NAME + ' | ' + SITE.title : SITE_NAME;
}

function homeDesc() {
  const joined = [SITE.headline, SITE.bio].filter(function (v) { return has(v); }).join(' ').trim();
  return joined || 'Portfolio of software systems.';
}

// Rewrites only the block between the two marker comments in index.html, so the
// home page gets a real title, description and share tags without the build touching
// anything else in that file. Without a site address there is nothing to write.
function writeHomeMeta() {
  if (!BASE) return false;
  const file = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const a = html.indexOf(META_START);
  const b = html.indexOf(META_END);
  if (a === -1 || b === -1 || b < a) {
    console.warn('  index.html is missing the "build:meta" comments, so its title and share tags were left alone.');
    return false;
  }
  const url = ABS('');
  const block = META_START + '\n' +
    '<title>' + esc(homeTitle()) + '</title>\n' +
    '<meta name="description" content="' + esc(homeDesc()) + '">\n' +
    '<link rel="canonical" href="' + esc(url) + '">\n' +
    '<meta property="og:type" content="website">\n' +
    '<meta property="og:title" content="' + esc(homeTitle()) + '">\n' +
    '<meta property="og:description" content="' + esc(homeDesc()) + '">\n' +
    '<meta property="og:url" content="' + esc(url) + '">\n' +
    '<meta property="og:image" content="' + esc(ABS('images/share.png')) + '">\n' +
    '<meta property="og:image:width" content="1200">\n' +
    '<meta property="og:image:height" content="630">\n' +
    '<meta property="og:image:alt" content="' + esc(SITE_NAME + ' share image') + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    META_END;
  const next = html.slice(0, a) + block + html.slice(b + META_END.length);
  if (next === html) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}

// GitHub Pages serves this for any address that does not exist, including a
// mistyped /projects/<id>/ link.
function notFoundHtml() {
  const home = SITE_ROOT || 'index.html';
  return '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>Page not found | ' + esc(SITE_NAME) + '</title>\n' +
    '<meta name="robots" content="noindex">\n' +
    '<meta name="theme-color" content="' + esc(/^#[0-9a-f]{3,8}$/i.test(String(SITE.accentColor || '')) ? SITE.accentColor : '#2438D9') + '">\n' +
    '<link rel="icon" href="' + FAVICON + '">\n' +
    '<link rel="stylesheet" href="' + SITE_ROOT + 'fonts.css">\n' +
    '<link rel="stylesheet" href="' + SITE_ROOT + 'style.css">\n' +
    '</head>\n<body>\n' +
    '<a class="skip" href="#main">Skip to content</a>\n' +
    '<header class="site-header"><div class="wrap bar">' +
    '<a class="brand" href="' + esc(home) + '">' + esc(SITE_NAME) + '</a>' +
    '<a class="btn btn--primary btn--sm" href="' + esc(home) + '#contact">Contact</a>' +
    '</div></header>\n' +
    '<main id="main" tabindex="-1"><section class="wrap project">' +
    '<p class="label">404</p>' +
    '<h1 style="font-family:var(--display);font-size:clamp(34px,5.5vw,56px);line-height:1.05;letter-spacing:-0.02em">That page was not found</h1>' +
    '<p class="lead">The link may be old, or the address may have a typo.</p>' +
    '<div class="actions"><a class="btn btn--primary" href="' + esc(home) + '">Back to the portfolio</a></div>' +
    '</section></main>\n' +
    '<footer class="footer"><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(SITE_NAME) + '</span>' +
    '<a href="' + esc(home) + '">Back to the portfolio</a></div></footer>\n' +
    '</body>\n</html>\n';
}

// The two standing pages, About and Contact, share one shell: same head, same
// header, same footer as a project page, so nothing can drift apart.
function simplePage(opts) {
  const url = BASE ? ABS(opts.path) : '';
  const accent = /^#[0-9a-f]{3,8}$/i.test(String(SITE.accentColor || '')) ? SITE.accentColor : '#2438D9';
  const head = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + esc(opts.title) + '</title>',
    '<meta name="description" content="' + esc(opts.desc) + '">',
    url ? '<link rel="canonical" href="' + esc(url) + '">' : '',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="' + esc(opts.title) + '">',
    '<meta property="og:description" content="' + esc(opts.desc) + '">',
    url ? '<meta property="og:url" content="' + esc(url) + '">' : '',
    BASE ? '<meta property="og:image" content="' + esc(ABS('images/share.png')) + '">' : '',
    BASE ? '<meta property="og:image:width" content="1200">' : '',
    BASE ? '<meta property="og:image:height" content="630">' : '',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="theme-color" content="' + esc(accent) + '">',
    '<link rel="icon" href="' + FAVICON + '">',
    '<link rel="preload" href="../fonts/ibm-plex-sans.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="../fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="stylesheet" href="../fonts.css">',
    '<link rel="stylesheet" href="../style.css">',
    personJsonLd(),
    '</head>',
    '<body>'
  ].filter(function (line) { return line !== ''; }).join('\n');

  return head + '\n' + siteHeader('../') +
    '<main id="main" tabindex="-1">\n' + opts.body + '\n</main>\n' +
    '<footer class="footer"><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(SITE_NAME) +
    '</span><a href="../index.html">Back to the portfolio</a></div></footer>\n' +
    '<script src="../page.js"></script>\n' +
    '<script src="../live.js"></script>\n' +
    '</body>\n</html>\n';
}

function aboutBody() {
  const paras = list(SITE.about).map(function (t) { return '<p class="body">' + esc(t) + '</p>'; }).join('');
  const skills = list(SITE.skills).filter(function (g) { return has(g.items); }).map(function (g) {
    return '<div class="skillgroup"><h2 class="label">' + esc(g.group) + '</h2><div>' +
      list(g.items).map(function (s) { return '<span class="skill">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  }).join('');
  // This page sits in /about/, so a relative resume path needs one step back to the site root.
  const resumeHref = /^https?:/i.test(String(SITE.resumeUrl || ''))
    ? SITE.resumeUrl
    : (has(SITE.resumeUrl) ? '../' + String(SITE.resumeUrl).replace(/^\.?\//, '') : '');
  const actions = linkButton('Email me', has(SITE.email) ? 'mailto:' + SITE.email : '', 'btn--primary', false) +
    linkButton('Download resume', resumeHref, 'btn--secondary', false, ' download') +
    linkButton('LinkedIn', SITE.linkedin, 'btn--secondary', true);

  // The resume details: where he is, how to call, and what he holds. Each card
  // hides itself when its field is empty, like every other optional block.
  const telHref = (v) => 'tel:' + String(v).replace(/[^\d+]/g, '');
  const card = (label, value, note, extra) => (has(value) || has(note) || has(extra))
    ? '<div class="glance__item"><span class="label">' + esc(label) + '</span>' +
      (has(value) ? '<p>' + value + '</p>' : '') +
      (has(note) ? '<p class="muted">' + esc(note) + '</p>' : '') +
      (has(extra) ? '<p class="muted">' + esc(extra) + '</p>' : '') + '</div>'
    : '';
  const joined = (parts) => parts.filter(has).map(esc).join(' · ');
  const details = [
    card('Location', has(SITE.location) ? esc(SITE.location) : '', ''),
    card('Phone', has(SITE.phone) ? '<a href="' + esc(telHref(SITE.phone)) + '">' + esc(SITE.phone) + '</a>' : '', ''),
    list(SITE.education).map(function (e) {
      return card('Education', has(e.qualification) ? esc(e.qualification) : '', joined([e.school, e.year]),
        has(e.capstone) ? 'Capstone: ' + e.capstone : '');
    }).join(''),
    list(SITE.languages).filter(function (l) { return has(l.name) || has(l.level); }).length
      ? '<div class="glance__item"><span class="label">Languages</span>' +
        list(SITE.languages).filter(function (l) { return has(l.name) || has(l.level); }).map(function (l) {
          return '<p>' + esc(l.name) + (has(l.level) ? ' \u2014 ' + esc(l.level) : '') + '</p>';
        }).join('') + '</div>'
      : '',
    list(SITE.certifications).map(function (c) {
      return card('Certification', has(c.name) ? esc(c.name) : '', joined([c.issuer, c.year]));
    }).join(''),
  ].join('');
  const detailsBlock = details
    ? '<section class="wrap section"><div class="glance"><h2 class="label">Details</h2>' +
      '<div class="glance__row">' + details + '</div></div></section>'
    : '';

  return '<section class="wrap project">' +
    '<p class="label label--accent">About</p>' +
    '<div class="pagehead__text">' +
    (has(SITE.title) ? '<p class="eyebrow">' + esc(SITE.title) + '</p>' : '') +
    '<h1 class="page-title">' + esc(SITE_NAME) + '</h1>' +
    (has(SITE.headline) ? '<p class="lead">' + esc(SITE.headline) + '</p>' : '') + '</div>' +
    (actions ? '<div class="actions">' + actions + '</div>' : '') +
    (has(SITE.availability) ? '<p class="avail"><span class="dot dot--ok" aria-hidden="true"></span>' + esc(SITE.availability) + '</p>' : '') +
    '</section>' +
    '<div class="about"><div class="wrap section">' +
    (paras ? '<div class="about__text"><h2 class="big">How I work</h2>' + paras + '</div>' : '') +
    (skills ? '<div class="skills">' + skills + '</div>' : '') +
    '</div></div>' + detailsBlock;
}

function contactBody() {
  const email = has(SITE.email)
    ? '<a class="email" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>'
    : '';
  const links = linkButton('LinkedIn', SITE.linkedin, 'btn--outline-dark', true) +
    linkButton('GitHub', SITE.github, 'btn--outline-dark', true);

  return '<section class="contact"><div class="wrap">' +
    '<div class="contact__text"><p class="label">Contact</p>' +
    '<h1 class="page-title">Tell me what is breaking, and what it costs.</h1>' +
    '<p class="contact__note">A sentence about the system, the deadline and who uses it is enough to start. ' +
    'Email reaches me directly - it is the one action on this site.</p>' +
    email +
    (has(SITE.replyTime) ? '<p class="contact__note">I reply within ' + esc(SITE.replyTime) + '.</p>' : '') +
    (links ? '<div class="contact__links">' + links + '</div>' : '') +
    '</div></div></section>';
}

/* ---------- 5. write the files ---------- */

const valid = [];
const seen = {};
let problems = 0;

PROJECTS.forEach(function (p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) {
    console.warn('  Skipped one entry in PROJECTS: it should be written as { ... } with fields inside.');
    problems++;
    return;
  }
  if (!has(p.id) || !/^[a-z0-9-]+$/.test(p.id)) {
    console.warn('  Skipped a system with an unusable id: ' + JSON.stringify(p.id) +
      ' (use lowercase letters, numbers and dashes).');
    problems++;
    return;
  }
  // The same four fields the site insists on. Without them the page would be a
  // blank shell, so say so here instead of publishing it.
  const missing = ['name', 'type', 'summary'].filter(function (k) { return !has(p[k]); });
  if (missing.length) {
    console.warn('  Skipped "' + p.id + '": content.js is missing ' +
      missing.map(function (k) { return '"' + k + '"'; }).join(', ') + ' for it.');
    problems++;
    return;
  }
  if (seen[p.id]) {
    console.warn('  Skipped a duplicate id: ' + p.id);
    problems++;
    return;
  }
  seen[p.id] = true;
  valid.push(p);
});

if (!valid.length) stop('No system has a usable id, so no pages were written.');

const written = [];
valid.forEach(function (p, i) {
  const dir = path.join(ROOT, 'projects', p.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(p, i, valid), 'utf8');
  written.push('projects/' + p.id + '/index.html');
});

const standing = [];
if (has(SITE.about) || has(SITE.skills)) {
  standing.push({
    dir: 'about',
    body: aboutBody(),
    // The role belongs in this title: it is the page someone opens to check who he
    // is. Kept short enough (~44 characters) that Google does not truncate it.
    title: (has(SITE.name) ? 'About ' + SITE.name : 'About') +
      (has(SITE.title) ? ', ' + SITE.title : ''),
    desc: has(SITE.bio) ? String(SITE.bio) : 'About'
  });
}
standing.push({
  dir: 'contact',
  body: contactBody(),
  title: 'Contact | ' + SITE_NAME,
  desc: 'Email ' + SITE_NAME + (has(SITE.title) ? ', ' + SITE.title : '') + '.'
});

standing.forEach(function (page) {
  const dir = path.join(ROOT, page.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), simplePage({
    path: page.dir + '/',
    body: page.body,
    title: page.title,
    desc: page.desc
  }), 'utf8');
  written.push(page.dir + '/index.html');
});

if (BASE) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['<url><loc>' + esc(ABS('')) + '</loc><lastmod>' + today + '</lastmod></url>']
    .concat(valid.map(function (p) {
      return '<url><loc>' + esc(ABS('projects/' + p.id + '/')) + '</loc><lastmod>' + today + '</lastmod></url>';
    }))
    .concat(standing.map(function (page) {
      return '<url><loc>' + esc(ABS(page.dir + '/')) + '</loc><lastmod>' + today + '</lastmod></url>';
    }));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ' +
    urls.join('\n  ') + '\n</urlset>\n', 'utf8');
  written.push('sitemap.xml');
}

// Warn about pages left over from a system you deleted from content.js.
const projectsDir = path.join(ROOT, 'projects');
if (fs.existsSync(projectsDir)) {
  fs.readdirSync(projectsDir).forEach(function (name) {
    if (fs.statSync(path.join(projectsDir, name)).isDirectory() && !seen[name]) {
      console.warn('  projects/' + name + '/ is not in content.js any more. Delete that folder if you removed the system.');
    }
  });
}

fs.writeFileSync(path.join(ROOT, '404.html'), notFoundHtml(), 'utf8');
written.push('404.html');

if (BASE && writeHomeMeta()) written.push('index.html (title and share tags)');

// robots.txt advertises a sitemap. If no address is set, that file is never made.
const robotsFile = path.join(ROOT, 'robots.txt');
if (!BASE && fs.existsSync(robotsFile) && /^\s*Sitemap:/im.test(fs.readFileSync(robotsFile, 'utf8'))) {
  console.warn('  Note: robots.txt points at sitemap.xml, but no site address is set, so no sitemap was written.');
  console.warn('  Add siteUrl to content.js (or pass --site=) so the two agree. This is not an error.');
}

console.log('\n  Built ' + written.length + ' file' + (written.length === 1 ? '' : 's') + ':');
written.forEach(function (f) { console.log('    ' + f); });
if (!BASE) console.log('  (No sitemap yet: add siteUrl to content.js and run this again.)');
if (problems) console.log('  Fix the warnings above, then run this again.');
console.log('');

if (problems) process.exitCode = 1;
