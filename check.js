#!/usr/bin/env node
/* ======================================================================
   check.js - fails when two copies of the same logic drift apart.

   Two helpers only exist twice because the browser cannot import from
   build.js: countryCode, postalAddress, safeUrl and statusHtml, plus the
   COUNTRY_CODES table they read. Node runs build.js at build time; app.js
   runs in the browser. If one copy changes and the other does not, the
   shareable pages and the one-page site start disagreeing, quietly.

   Run it after editing either file:
       node check.js
   Exit code 0 means the copies match; 1 means they have drifted.
   ====================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAIRS = ['COUNTRY_CODES', 'countryCode', 'postalAddress', 'safeUrl', 'statusHtml'];

// Pull a function's source by matching its braces, so nested blocks and object
// literals inside it come along correctly.
function functionSource(text, name) {
  const start = text.indexOf('function ' + name + '(');
  if (start === -1) return null;
  const open = text.indexOf('{', start);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// The table is an object literal, so it needs the same brace walk.
function tableSource(text, name) {
  const start = text.indexOf(name + ' = {');
  if (start === -1) return null;
  const open = text.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Ignore the differences that do not matter: indentation (the browser copy lives
// inside an IIFE), and const vs var.
function normalise(src) {
  return src
    .split('\n')
    .map(function (line) { return line.trim(); })
    .join('\n')
    .replace(/\b(const|var|let)\b/g, 'let')
    .replace(/[ \t]+/g, ' ')
    .replace(/'/g, '"')
    .trim();
}

const build = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

let failures = 0;

PAIRS.forEach(function (name) {
  const a = name === 'COUNTRY_CODES' ? tableSource(build, name) : functionSource(build, name);
  const b = name === 'COUNTRY_CODES' ? tableSource(app, name) : functionSource(app, name);

  if (!a || !b) {
    failures += 1;
    console.log('MISSING  ' + name + ': ' + (!a ? 'build.js' : 'app.js') + ' no longer defines it.');
    return;
  }
  if (normalise(a) === normalise(b)) {
    console.log('ok       ' + name);
    return;
  }

  failures += 1;
  console.log('DRIFTED  ' + name + ': the two copies differ.');
  const left = normalise(a).split('\n');
  const right = normalise(b).split('\n');
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i] !== right[i]) {
      console.log('           line ' + (i + 1) + ' of ' + name);
      console.log('           build.js: ' + (left[i] === undefined ? '(ends)' : left[i]));
      console.log('           app.js:   ' + (right[i] === undefined ? '(ends)' : right[i]));
      break;
    }
  }
});

if (failures) {
  console.log('\n' + failures + ' difference(s). Make both copies identical, or move the shared');
  console.log('code somewhere both can read, before deploying.');
  process.exit(1);
}

console.log('\nAll ' + PAIRS.length + ' shared pieces match.');
