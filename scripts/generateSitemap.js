import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://quickformat.arvaancorelogic.com';
const TODAY = new Date().toISOString().split('T')[0];

const SITEMAP_ENTRIES = [
  // 1. Homepage & Root
  {
    path: '',
    changefreq: 'daily',
    priority: '1.0',
    comment: 'Homepage & Unified Suite Portal',
  },

  // 2. Commerce & Packaging Studio (Flagship High-Traffic Utilities)
  {
    path: 'price-tag-creator',
    changefreq: 'weekly',
    priority: '0.95',
    comment: 'Price Tag & Shelf Talker Creator',
  },
  {
    path: 'barcode-generator',
    changefreq: 'weekly',
    priority: '0.95',
    comment: 'Barcode Generator & GS1 Validator',
  },
  {
    path: 'qr-code-generator',
    changefreq: 'weekly',
    priority: '0.95',
    comment: 'Dynamic/Static QR Code Generator',
  },
  {
    path: 'product-label-studio',
    changefreq: 'weekly',
    priority: '0.95',
    comment: 'Product Label & Packaging Insert Studio',
  },
  {
    path: 'thank-you-card-maker',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Ecommerce Thank You Card & Voucher Maker',
  },

  // 3. Data & Structured Formats Suite
  {
    path: 'json-to-csv',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'JSON to CSV / Excel Converter',
  },
  {
    path: 'csv-to-json',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'CSV to JSON Converter & Unflattener',
  },
  {
    path: 'json-viewer',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'JSON Interactive Tree Viewer & Query',
  },
  {
    path: 'json-to-types',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'JSON to TypeScript & Schema Generator',
  },
  {
    path: 'sql-formatter',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'SQL Query Formatter & Beautifier',
  },

  // 4. Security, Cryptography & HTTP Headers Suite
  {
    path: 'security-headers',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'HTTP Security Headers & CSP Evaluator',
  },
  {
    path: 'cert-inspector',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'SSL / TLS Certificate Inspector & PEM Decoder',
  },
  {
    path: 'cors-analyzer',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'CORS Configuration & Preflight Tester',
  },
  {
    path: 'key-generator',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Cryptographic API Key & Secret Generator',
  },
  {
    path: 'sri-generator',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'Subresource Integrity (SRI) Hash Generator',
  },
  {
    path: 'hash-generator',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'SHA-256, SHA-512 & MD5 Hash Generator',
  },
  {
    path: 'jwt-inspector',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'JWT Token Decoder & Security Inspector',
  },
  {
    path: 'pii-redactor',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'PII Sensitive Data Sanitizer & Redactor',
  },

  // 5. API, Web & Developer Utilities Suite
  {
    path: 'url-parser',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'URL Query String Parser & Builder',
  },
  {
    path: 'curl-converter',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'cURL Command to Multi-Language Code Converter',
  },
  {
    path: 'base64-tool',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'Base64 Text & File Encoder/Decoder',
  },
  {
    path: 'timestamp-converter',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Unix Epoch & UTC Timestamp Converter',
  },
  {
    path: 'uuid-generator',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'UUID (v4, v7, Nil) Generator & Validator',
  },
  {
    path: 'cron-scheduler',
    changefreq: 'weekly',
    priority: '0.85',
    comment: 'Cron Schedule Expression Builder & Humanizer',
  },
  {
    path: 'regex-tester',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Regular Expression Tester & Visualizer',
  },

  // 6. Document, Text & Markdown Studio
  {
    path: 'markdown-editor',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Interactive Markdown Editor with Live Preview',
  },
  {
    path: 'pdf-to-markdown',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'PDF to Markdown Document Converter',
  },
  {
    path: 'text-diff',
    changefreq: 'weekly',
    priority: '0.90',
    comment: 'Side-by-Side Text & Code Difference Checker',
  },

  // 7. Institutional, Trust & Legal Compliance Pages
  {
    path: 'about',
    changefreq: 'monthly',
    priority: '0.70',
    comment: 'About Us & Company Mission',
  },
  {
    path: 'contact',
    changefreq: 'monthly',
    priority: '0.70',
    comment: 'Developer Support & Contact',
  },
  {
    path: 'privacy-policy',
    changefreq: 'monthly',
    priority: '0.60',
    comment: 'Privacy Policy & Zero-Telemetry Guarantee',
  },
  {
    path: 'terms-of-service',
    changefreq: 'monthly',
    priority: '0.60',
    comment: 'Terms of Service & Usage Guidelines',
  },
];

export function generateSitemapXml() {
  const urlsXml = SITEMAP_ENTRIES.map((entry) => {
    const loc = entry.path ? `${BASE_URL}/${entry.path}` : `${BASE_URL}/`;
    return `  <!-- ${entry.comment} -->
  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

// Write to public/sitemap.xml
const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const xmlContent = generateSitemapXml();
fs.writeFileSync(publicSitemapPath, xmlContent, 'utf8');
console.log(`✓ Generated public/sitemap.xml (${SITEMAP_ENTRIES.length} indexable URLs, lastmod: ${TODAY})`);

// Also update dist/sitemap.xml if dist exists
const distSitemapPath = path.join(rootDir, 'dist', 'sitemap.xml');
if (fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.writeFileSync(distSitemapPath, xmlContent, 'utf8');
  console.log(`✓ Copied fresh sitemap.xml to dist/`);
}
