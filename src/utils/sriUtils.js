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
    byteSize: buffer.byteLength,
  };
}

// Generate HTML Tag Snippets
export function generateSriHtmlTag(url, hash, type = 'script') {
  const safeUrl = url.trim() || 'https://cdn.example.com/library.min.js';
  if (type === 'script') {
    return `<script\n  src="${safeUrl}"\n  integrity="${hash}"\n  crossorigin="anonymous"\n></script>`;
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

  const matched =
    expectedHash === hashes.sha256 ||
    expectedHash === hashes.sha384 ||
    expectedHash === hashes.sha512;

  let algorithmUsed = 'Unknown';
  if (expectedHash.startsWith('sha256-')) algorithmUsed = 'SHA-256';
  else if (expectedHash.startsWith('sha384-')) algorithmUsed = 'SHA-384';
  else if (expectedHash.startsWith('sha512-')) algorithmUsed = 'SHA-512';

  return {
    matched,
    expectedHash,
    algorithmUsed,
    actualSha256: hashes.sha256,
    actualSha384: hashes.sha384,
    actualSha512: hashes.sha512,
  };
}
