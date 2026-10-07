// WebCrypto RSA & Elliptic Curve (ECC) Key Generator, PEM & JWK Converter

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary = atob(base64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Format Base64 string into 64-character PEM lines
function formatAsPem(b64, label) {
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

// Generate RSA Key Pair
export async function generateRsaKeyPair(modulusLength = 2048, hash = 'SHA-256') {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: { name: hash },
    },
    true,
    ['sign', 'verify']
  );

  // Export SPKI (Public Key)
  const spkiBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicPem = formatAsPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

  // Export PKCS#8 (Private Key)
  const pkcs8Buffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privatePem = formatAsPem(arrayBufferToBase64(pkcs8Buffer), 'PRIVATE KEY');

  // Export JWK
  const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return {
    algorithm: `RSA-${modulusLength}`,
    type: 'RSA',
    modulusLength,
    hash,
    publicPem,
    privatePem,
    publicJwk,
    privateJwk,
  };
}

// Generate ECC Key Pair (P-256, P-384, P-521)
export async function generateEccKeyPair(namedCurve = 'P-256') {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve,
    },
    true,
    ['sign', 'verify']
  );

  // Export SPKI (Public Key)
  const spkiBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicPem = formatAsPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

  // Export PKCS#8 (Private Key)
  const pkcs8Buffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privatePem = formatAsPem(arrayBufferToBase64(pkcs8Buffer), 'PRIVATE KEY');

  // Export JWK
  const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return {
    algorithm: `ECDSA (${namedCurve})`,
    type: 'ECC',
    namedCurve,
    publicPem,
    privatePem,
    publicJwk,
    privateJwk,
  };
}

// Derive Public Key from Private Key PEM (PKCS#8)
export async function derivePublicKeyFromPrivatePem(privatePem) {
  const clean = privatePem.trim();
  const b64 = clean.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const buffer = base64ToArrayBuffer(b64);

  // Try importing as RSA PKCS#8
  try {
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      buffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      },
      true,
      ['sign']
    );

    // Export JWK to inspect components
    const jwk = await window.crypto.subtle.exportKey('jwk', privateKey);
    // Construct public JWK by stripping private fields (d, p, q, dp, dq, qi)
    const publicJwk = {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: jwk.alg,
      ext: true,
      key_ops: ['verify'],
    };

    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      publicJwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      true,
      ['verify']
    );

    const spkiBuffer = await window.crypto.subtle.exportKey('spki', publicKey);
    const publicPem = formatAsPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

    return {
      type: 'RSA',
      publicPem,
      publicJwk,
    };
  } catch (rsaErr) {
    // Try importing as ECDSA PKCS#8
    try {
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        buffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign']
      );

      const jwk = await window.crypto.subtle.exportKey('jwk', privateKey);
      const publicJwk = {
        kty: jwk.kty,
        crv: jwk.crv,
        x: jwk.x,
        y: jwk.y,
        ext: true,
        key_ops: ['verify'],
      };

      const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        publicJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );

      const spkiBuffer = await window.crypto.subtle.exportKey('spki', publicKey);
      const publicPem = formatAsPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

      return {
        type: 'ECC (P-256)',
        publicPem,
        publicJwk,
      };
    } catch (eccErr) {
      throw new Error('Unable to parse PKCS#8 private key. Ensure key is unencrypted PKCS#8 PEM.');
    }
  }
}
