// Subresource Integrity (SRI) Hash & Tag Generator

export const SAMPLE_SRI_JS = `/*! Alpine.js v3.14.8 | MIT License | https://alpinejs.dev */
(() => {
  var Xe = !1, Ye = !1, Y = [];
  function Ge(e) {
    Je(e);
  }
  function Je(e) {
    Y.includes(e) || Y.push(e), Ze();
  }
  function Ze() {
    !Ye && !Xe && (Xe = !0, queueMicrotask(Qe));
  }
  function Qe() {
    Xe = !1, Ye = !0;
    for (let e = 0; e < Y.length; e++) Y[e]();
    Y.length = 0, Ye = !1;
  }
  console.log("QuickFormat Hub: SRI Verified Script Loaded Successfully");
})();`;

export const CDN_PRESETS = [
  {
    id: 'alpine',
    label: 'Alpine.js 3.14',
    type: 'script',
    url: 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js',
    content: SAMPLE_SRI_JS,
  },
  {
    id: 'htmx',
    label: 'HTMX 2.0',
    type: 'script',
    url: 'https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js',
    content: '/*! htmx.org 2.0.4 */\nvar htmx = (function(){ return { version: "2.0.4" }; })();',
  },
  {
    id: 'react',
    label: 'React 18 Production',
    type: 'script',
    url: 'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
    content: '/** @license React v18.3.1 | MIT License | facebook.github.io/react */\n(function(){ window.React = { version: "18.3.1" }; })();',
  },
  {
    id: 'tailwind',
    label: 'Tailwind CDN',
    type: 'script',
    url: 'https://cdn.tailwindcss.com/3.4.16',
    content: '/*! Tailwind CSS v3.4.16 | MIT License */\n(function(){ window.tailwind = { config: {} }; })();',
  },
  {
    id: 'bootstrap_css',
    label: 'Bootstrap 5.3 CSS',
    type: 'link',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    content: '/*! Bootstrap v5.3.3 (https://getbootstrap.com/) */\n:root { --bs-blue: #0d6efd; --bs-indigo: #6610f2; }',
  },
  {
    id: 'fontawesome',
    label: 'FontAwesome 6 CSS',
    type: 'link',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
    content: '/*! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com */\n.fa { font-family: "Font Awesome 6 Free"; }',
  },
];

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Compute SRI hashes for a given text or ArrayBuffer
export async function computeSriHashes(inputData) {
  let buffer;
  if (typeof inputData === 'string') {
    buffer = new TextEncoder().encode(inputData).buffer;
  } else if (inputData instanceof Uint8Array) {
    buffer = inputData.buffer;
  } else if (inputData instanceof ArrayBuffer) {
    buffer = inputData;
  } else {
    throw new Error('Unsupported input format for SRI hashing');
  }

  const [sha256Buf, sha384Buf, sha512Buf] = await Promise.all([
    crypto.subtle.digest('SHA-256', buffer),
    crypto.subtle.digest('SHA-384', buffer),
    crypto.subtle.digest('SHA-512', buffer),
  ]);

  const sha256 = `sha256-${bufferToBase64(sha256Buf)}`;
  const sha384 = `sha384-${bufferToBase64(sha384Buf)}`;
  const sha512 = `sha512-${bufferToBase64(sha512Buf)}`;

  return {
    sha256,
    sha384, // W3C Recommended standard
    sha512,
    progressive: `${sha384} ${sha512}`, // Progressive fallback standard
    byteSize: buffer.byteLength,
  };
}

// Generate HTML Tag Snippets
export function generateSriHtmlTag(url, hash, type = 'script', isSingleLine = false) {
  const safeUrl = url.trim() || 'https://cdn.example.com/library.min.js';
  if (type === 'script') {
    if (isSingleLine) {
      return `<script src="${safeUrl}" integrity="${hash}" crossorigin="anonymous"></script>`;
    }
    return `<script\n  src="${safeUrl}"\n  integrity="${hash}"\n  crossorigin="anonymous"\n></script>`;
  }
  if (isSingleLine) {
    return `<link rel="stylesheet" href="${safeUrl}" integrity="${hash}" crossorigin="anonymous" />`;
  }
  return `<link\n  rel="stylesheet"\n  href="${safeUrl}"\n  integrity="${hash}"\n  crossorigin="anonymous"\n/>`;
}

// Validate an existing SRI tag against actual content
export async function validateSriIntegrity(expectedTagOrHash, contentData) {
  // Extract hash from tag if user pasted full <script> or <link>
  let expectedHash = expectedTagOrHash.trim();
  const match = expectedHash.match(/integrity=["']([^"']+)["']/i);
  if (match) {
    expectedHash = match[1].trim();
  }

  const hashes = await computeSriHashes(contentData);

  // Check if expected hash matches any computed or progressive hash
  const tokens = expectedHash.split(/\s+/);
  const matched = tokens.some(
    (t) => t === hashes.sha256 || t === hashes.sha384 || t === hashes.sha512
  );

  let algorithmUsed = 'Unknown';
  if (expectedHash.includes('sha384-')) algorithmUsed = 'SHA-384 (Recommended)';
  else if (expectedHash.includes('sha512-')) algorithmUsed = 'SHA-512';
  else if (expectedHash.includes('sha256-')) algorithmUsed = 'SHA-256';

  return {
    matched,
    expectedHash,
    algorithmUsed,
    actualSha256: hashes.sha256,
    actualSha384: hashes.sha384,
    actualSha512: hashes.sha512,
  };
}
