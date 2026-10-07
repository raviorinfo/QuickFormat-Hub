import fs from 'node:fs';
import path from 'node:path';

const VALID_PATHS = [
  'json-to-csv',
  'csv-to-json',
  'json-viewer',
  'markdown-editor',
  'pdf-to-markdown',
  'text-diff',
  'base64-tool',
  'security-headers',
  'hash-generator',
  'url-parser',
  'pii-redactor',
  'curl-converter',
  'jwt-inspector',
  'json-to-types',
  'timestamp-converter',
  'sql-formatter',
  'uuid-generator',
  'cron-scheduler',
  'regex-tester',
  'privacy-policy',
  'terms-of-service',
  'about',
  'contact',
];

try {
  const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
  fs.writeFileSync('dist/404.html', indexHtml);
  console.log('✓ SPA fallback 404.html generated from dist/index.html');

  // Pre-render static route directories so GitHub Pages serves 200 OK directly
  for (const route of VALID_PATHS) {
    const routeDir = path.join('dist', route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
  }
  console.log(`✓ Generated static route entries for all ${VALID_PATHS.length} routes (returns 200 OK on GitHub Pages)`);
} catch (err) {
  console.error('Failed to generate route entries:', err);
  process.exit(1);
}
