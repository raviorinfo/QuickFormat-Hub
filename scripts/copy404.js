import fs from 'node:fs';

try {
  fs.copyFileSync('dist/index.html', 'dist/404.html');
  console.log('✓ SPA fallback 404.html generated from dist/index.html');
} catch (err) {
  console.error('Failed to copy 404.html:', err);
  process.exit(1);
}
