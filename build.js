// Builds the deployable site into dist/.
//
// Cloudflare Pages wants one folder containing exactly what the browser needs
// and nothing else. Deploying the repo root would sweep up node_modules,
// package-lock.json and the Tailwind source — thousands of files the site
// never requests. This produces a clean 5-item folder instead.
//
// Node's stdlib only. No build framework for a site this size.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = 'dist';
const COPY = ['index.html', 'work.html', 'app.js', 'styles.css', 'robots.txt', 'sitemap.xml'];

// 1. Compile the stylesheet. Stays at the root too, so opening index.html
//    straight off disk still works for a quick local look.
execSync('npx tailwindcss -c tailwind.config.js -i src/input.css -o styles.css --minify',
  { stdio: 'inherit' });

// 2. Fresh output folder every time — a stale file left behind in dist/ would
//    silently ship to production.
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of COPY) fs.copyFileSync(f, path.join(OUT, f));
fs.cpSync('assets', path.join(OUT, 'assets'), { recursive: true });

const files = fs.readdirSync(OUT, { recursive: true })
  .filter(f => fs.statSync(path.join(OUT, f)).isFile());
const bytes = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`\ndist/ ready — ${files.length} files, ${(bytes / 1024).toFixed(0)} KB`);
for (const f of files) console.log('  ' + f.replace(/\\/g, '/'));
