#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const redirects = fs.existsSync('data/redirects.json')
  ? new Map(JSON.parse(fs.readFileSync('data/redirects.json', 'utf8')).redirects.map(redirect => [redirect.source, redirect.target]))
  : new Map();

const missing = [];
const redirected = [];

function routeExists(route) {
  const cleanRoute = route.split(/[?#]/)[0];
  if (!cleanRoute || cleanRoute === '/') return fs.existsSync('index.html');
  if (cleanRoute.endsWith('/')) return fs.existsSync(path.join(ROOT, cleanRoute.slice(1), 'index.html'));
  return fs.existsSync(path.join(ROOT, cleanRoute.slice(1)));
}

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
      continue;
    }
    if (path.extname(entry.name) !== '.html') continue;

    const relPath = path.relative(ROOT, fullPath);
    const ownRoute = `/${relPath}`;
    if (redirects.has(ownRoute)) continue;

    const html = fs.readFileSync(fullPath, 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const href = match[1];
      if (!href.startsWith('/') || href.startsWith('//') || href.includes('{{')) continue;
      const route = href.split(/[?#]/)[0];
      if (route.startsWith('/go/')) continue;
      if (!routeExists(route)) missing.push(`${relPath} -> ${href}`);
      if (redirects.has(route)) redirected.push(`${relPath} -> ${href} => ${redirects.get(route)}`);
    }
  }
}

scan(ROOT);

if (missing.length > 0 || redirected.length > 0) {
  throw new Error(`Internal link assertion failed:\nMissing:\n- ${missing.join('\n- ')}\nRedirected:\n- ${redirected.join('\n- ')}`);
}

console.log('Internal link assertion passed: 0 missing, 0 redirected.');
