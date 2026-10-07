import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Starting QuickFormat Hub production deployment...');

// 1. Build
console.log('📦 Building Vite production bundle...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 2. Ensure CNAME and .nojekyll exist in dist
const cnameDist = path.join(distDir, 'CNAME');
if (!fs.existsSync(cnameDist)) {
  fs.writeFileSync(cnameDist, 'quickformat.arvaancorelogic.com\n');
}

const nojekyllDist = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllDist)) {
  fs.writeFileSync(nojekyllDist, '');
}

// 3. Ensure 404.html matches index.html
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
console.log('✓ Verified dist/CNAME, dist/.nojekyll, and dist/404.html');

// 4. Get remote URL from git
const remoteUrl = execSync('git config --get remote.origin.url', { cwd: rootDir }).toString().trim();
if (!remoteUrl) {
  throw new Error('Could not find remote.origin.url');
}

// 5. Deploy dist contents to gh-pages branch
const distGitDir = path.join(distDir, '.git');
if (fs.existsSync(distGitDir)) {
  fs.rmSync(distGitDir, { recursive: true, force: true });
}

console.log('📤 Pushing compiled assets to gh-pages branch...');
execSync('git init', { cwd: distDir, stdio: 'pipe' });
execSync('git checkout -b gh-pages', { cwd: distDir, stdio: 'pipe' });
execSync('git add -A', { cwd: distDir, stdio: 'pipe' });
execSync('git commit -m "deploy: compiled production assets to gh-pages"', { cwd: distDir, stdio: 'pipe' });
execSync(`git push -f "${remoteUrl}" gh-pages:gh-pages`, { cwd: distDir, stdio: 'inherit' });

// 6. Clean up dist/.git
fs.rmSync(distGitDir, { recursive: true, force: true });

console.log('🎉 Successfully deployed to GitHub Pages (gh-pages)!');
