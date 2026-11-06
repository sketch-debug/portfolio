/* Live repository details, for any system that has a githubUrl in content.js.

   The card and the project page show an empty <p class="live" data-live-repo="...">
   and this file fills it with the truth from GitHub: when the code last changed,
   how many stars it has. Nothing is invented, and nothing is cached longer than
   an hour.

   If GitHub is unreachable, the request is rate limited (60/hour per visitor)
   or the repository is private, the line simply stays empty and invisible.
   The site never shows a guess.

   You do not need to edit this file. */

(function () {
  'use strict';

  var TTL = 60 * 60 * 1000; // ask GitHub at most once an hour per browser
  var KEY = 'portfolio:repo:v1';
  var pending = {};
  var known = {}; // repo id -> 'ok' | 'missing', for this page view only
  var MISSING = { missing: true };

  function parse(url) {
    var m = String(url || '').match(/github\.com[\/:]([^\/\s#?]+)\/([^\/\s#?]+)/i);
    if (!m) return null;
    return { owner: m[1], repo: m[2].replace(/\.git$/i, '') };
  }

  function readCache() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) {
      return {};
    }
  }

  function writeCache(all) {
    try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* private mode: no cache, still works */ }
  }

  function ago(iso) {
    var then = new Date(iso).getTime();
    if (!isFinite(then)) return '';
    var mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins === 1 ? '1 minute ago' : mins + ' minutes ago';
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : hours + ' hours ago';
    var days = Math.round(hours / 24);
    if (days < 45) return days === 1 ? '1 day ago' : days + ' days ago';
    var months = Math.round(days / 30);
    if (months < 18) return months === 1 ? '1 month ago' : months + ' months ago';
    var years = Math.round(months / 12);
    return years === 1 ? '1 year ago' : years + ' years ago';
  }

  function describe(data) {
    if (!data || !data.pushed_at) return '';
    var bits = [];
    var stars = Number(data.stargazers_count) || 0;
    if (stars > 0) bits.push(stars + (stars === 1 ? ' star' : ' stars'));
    if (data.language) bits.push(String(data.language));
    return 'Last commit ' + ago(data.pushed_at) + (bits.length ? ' \u00b7 ' + bits.join(' \u00b7 ') : '');
  }

  function get(id, parsed) {
    var all = readCache();
    var hit = all[id];
    if (hit && typeof hit.at === 'number' && Date.now() - hit.at < TTL) {
      return Promise.resolve(hit.data);
    }
    if (pending[id]) return pending[id];

    var url = 'https://api.github.com/repos/' + encodeURIComponent(parsed.owner) + '/' + encodeURIComponent(parsed.repo);
    pending[id] = fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) {
          var err = new Error('HTTP ' + res.status);
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then(function (data) {
        var store = readCache();
        store[id] = { at: Date.now(), data: data };
        writeCache(store);
        delete pending[id];
        return data;
      })
      .catch(function (err) {
        // Keep the result for this page view so a second render (or the filter
        // buttons) does not ask GitHub again. The next load tries afresh, so a
        // repo that was just published shows up without clearing anything.
        //
        // 404/410/451 is GitHub saying the repository is private, deleted or
        // blocked: that is a fact we can act on, so the GitHub button is hidden.
        // A network failure, a 403 rate limit or a 5xx says nothing about the
        // repository, so the button stays exactly as written in content.js.
        var i = [404, 410, 451].indexOf(err && err.status);
        return i >= 0 ? MISSING : null;
      });

    return pending[id];
  }

  // Hide the "Source on GitHub" buttons for a repository GitHub says is gone,
  // and put them back for one it can read. Nothing changes while we are unsure.
  function applyLinks(id) {
    var links = document.querySelectorAll('[data-github-link]');
    for (var i = 0; i < links.length; i++) {
      var parsed = parse(links[i].getAttribute('href'));
      if (!parsed) continue;
      if (parsed.owner.toLowerCase() + '/' + parsed.repo.toLowerCase() !== id) continue;
      if (known[id] === 'missing') links[i].setAttribute('hidden', '');
      else if (known[id] === 'ok') links[i].removeAttribute('hidden');
    }
  }

  function refresh() {
    var nodes = document.querySelectorAll('[data-live-repo]');
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var parsed = parse(el.getAttribute('data-live-repo'));
        if (!parsed) return;
        var id = parsed.owner.toLowerCase() + '/' + parsed.repo.toLowerCase();
        get(id, parsed).then(function (data) {
          if (!data) return;
          if (data.missing) {
            known[id] = 'missing';
            applyLinks(id);
            return;
          }
          known[id] = 'ok';
          applyLinks(id);
          var text = describe(data);
          if (text) {
            el.textContent = text;
            if (data.html_url) el.setAttribute('title', data.html_url);
          }
        });
      })(nodes[i]);
    }

    // A page can hold the GitHub button without a live line (or the line can be
    // cached already), so start the lookup from the button too.
    var links = document.querySelectorAll('[data-github-link]');
    for (var j = 0; j < links.length; j++) {
      (function (href) {
        var parsed = parse(href);
        if (!parsed) return;
        var id = parsed.owner.toLowerCase() + '/' + parsed.repo.toLowerCase();
        if (!known[id]) get(id, parsed).then(function (data) {
          if (!data) return;
          known[id] = data.missing ? 'missing' : 'ok';
          applyLinks(id);
        });
      })(links[j].getAttribute('href'));
    }
  }

  window.PortfolioLive = { refresh: refresh };

  // The generated pages are plain HTML, so this runs once the document is ready.
  // The one-page site calls refresh() itself after every render.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  } else {
    refresh();
  }
})();
