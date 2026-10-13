import fs from 'node:fs';
import path from 'node:path';
const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// Only these folders are intended for public serving.
for (const dir of ['assets', 'blog', 'bookmakers', 'calculators', 'guides', 'go']) {
  if (fs.existsSync(dir)) fs.cpSync(dir, path.join(out, dir), { recursive: true });
}
fs.mkdirSync(path.join(out, 'data'), { recursive: true });
for (const name of ['operators.json', 'sites.json', 'bookmakers.json', 'live-odds.json', 'odds-history.json', 'polymarket.json', 'kalshi.json', 'outrights.json', 'redirects.json']) {
  if (fs.existsSync('data/' + name)) fs.copyFileSync('data/' + name, path.join(out, 'data', name));
}
for (const name of fs.readdirSync('.')) {
  if (!fs.statSync(name).isFile()) continue;
  if (/\.(html|css)$/.test(name) || ['app.js', 'CNAME', 'robots.txt', 'sitemap.xml', 'ads.txt', 'llms.txt', 'polymarket-predictions.json', 'a0371dfaedbedab70caac7b001139299.txt'].includes(name)) {
    fs.copyFileSync(name, path.join(out, name));
  }
}
console.log('Built public website in dist/');
