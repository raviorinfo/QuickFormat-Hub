/**
 * Client-Side JWT Token Inspector & Expiry Countdown Engine
 */

export function decodeJwt(jwtString) {
  if (!jwtString || !jwtString.trim()) {
    return null;
  }

  // Strip optional "Bearer " prefix
  const clean = jwtString.replace(/^Bearer\s+/i, '').trim();
  const parts = clean.split('.');

  if (parts.length !== 3) {
    return {
      valid: false,
      error: 'Invalid JWT format: A valid JWT must contain exactly 3 dot-separated parts (Header.Payload.Signature).',
    };
  }

  const decodePart = (part) => {
    try {
      let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) {
        b64 += '=';
      }
      const raw = atob(b64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
      }
      const decodedText = new TextDecoder().decode(bytes);
      return JSON.parse(decodedText);
    } catch (e) {
      return null;
    }
  };

  const header = decodePart(parts[0]);
  const payload = decodePart(parts[1]);
  const signature = parts[2];

  if (!header || !payload) {
    return {
      valid: false,
      error: 'Failed to decode base64 payload. Please check that token characters are valid.',
    };
  }

  // Analyze expiration
  const nowSec = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let expiresAt = null;
  let issuedAt = null;
  let timeRemainingSec = null;
  let statusText = 'No expiration claim (exp)';

  if (payload.exp) {
    expiresAt = new Date(payload.exp * 1000);
    timeRemainingSec = payload.exp - nowSec;
    if (timeRemainingSec <= 0) {
      isExpired = true;
      const elapsedMin = Math.abs(Math.round(timeRemainingSec / 60));
      statusText = `Expired ${elapsedMin < 60 ? `${elapsedMin}m ago` : `${Math.round(elapsedMin / 60)}h ago`}`;
    } else {
      isExpired = false;
      const remMin = Math.round(timeRemainingSec / 60);
      statusText = `Expires in ${remMin < 60 ? `${remMin} min` : `${(remMin / 60).toFixed(1)} hours`}`;
    }
  }

  if (payload.iat) {
    issuedAt = new Date(payload.iat * 1000);
  }

  return {
    valid: true,
    header,
    payload,
    signature,
    isExpired,
    expiresAt,
    issuedAt,
    timeRemainingSec,
    statusText,
    algorithm: header.alg || 'Unknown',
    type: header.typ || 'JWT',
  };
}

// Generate a sample token that expires 2 hours from current runtime
export function getSampleJwt() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'https://auth.quickformat.app',
    sub: 'usr_849201984',
    aud: 'https://api.quickformat.app/v2',
    name: 'Elena Rostova',
    email: 'elena.rostova@techmail.io',
    roles: ['admin', 'developer', 'billing_manager'],
    permissions: ['reports:read', 'reports:write', 'tokens:generate'],
    iat: now - 1800, // issued 30 mins ago
    exp: now + 7200, // expires in 2 hours
  };

  const toB64 = (obj) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const h = toB64(header);
  const p = toB64(payload);
  const sig = 'K_8a39Xz9jL_10928aBcDeFgHiJkLmNoPqRsTuVwXyZ';
  return `${h}.${p}.${sig}`;
}

export const RFC7519_CLAIMS = {
  iss: { name: 'Issuer', desc: 'Identifies the principal that issued the JWT' },
  sub: { name: 'Subject', desc: 'Identifies the principal that is the subject of the JWT' },
  aud: { name: 'Audience', desc: 'Identifies the recipients that the JWT is intended for' },
  exp: { name: 'Expiration Time', desc: 'Time on or after which the JWT must NOT be accepted' },
  nbf: { name: 'Not Before', desc: 'Time before which the JWT must NOT be accepted' },
  iat: { name: 'Issued At', desc: 'Time at which the JWT was issued' },
  jti: { name: 'JWT ID', desc: 'Unique identifier for the JWT (nonce / replay protection)' },
};

/**
 * Verify HMAC-SHA signature (HS256, HS384, HS512) directly in browser with Web Crypto API
 */
export async function verifyJwtSignature(jwtString, secret) {
  if (!jwtString || !secret) {
    return { verified: null, message: 'Enter a secret key to verify signature' };
  }

  const clean = jwtString.replace(/^Bearer\s+/i, '').trim();
  const parts = clean.split('.');
  if (parts.length !== 3) {
    return { verified: false, message: 'Invalid token structure (3 segments required)' };
  }

  try {
    const headerB64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const header = JSON.parse(atob(headerB64));
    const alg = (header.alg || 'HS256').toUpperCase();

    const hashMap = {
      HS256: 'SHA-256',
      HS384: 'SHA-384',
      HS512: 'SHA-512',
    };

    if (!hashMap[alg]) {
      return {
        verified: null,
        message: `Client-side verification supports HMAC (${Object.keys(hashMap).join(', ')}). Alg ${alg} requires public key.`,
      };
    }

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: hashMap[alg] } },
      false,
      ['sign']
    );

    const messageData = enc.encode(`${parts[0]}.${parts[1]}`);
    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);

    // Convert signatureBuffer to base64url
    const sigBytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < sigBytes.length; i++) {
      binary += String.fromCharCode(sigBytes[i]);
    }
    const computedB64Url = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const expectedSig = parts[2];
    const isMatch = computedB64Url === expectedSig;

    return {
      verified: isMatch,
      message: isMatch
        ? `Signature verified! Token is authentic using ${alg}.`
        : `Invalid signature: computed signature does not match with this secret.`,
    };
  } catch (err) {
    return { verified: false, message: `Verification failed: ${err.message}` };
  }
}

// Common weak dictionary secrets for security audit
export const COMMON_WEAK_SECRETS = [
  'secret', 'password', '123456', 'jwt', 'admin', 'secret123', 'qwerty',
  'supersecret', 'test', 'development', 'private', '12345678', 'auth_secret', 'app_secret'
];

/**
 * Sign a new JWT directly in browser with Web Crypto API
 */
export async function signJwt(headerObj, payloadObj, secret) {
  const toB64Url = (obj) => {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const enc = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < enc.length; i++) binary += String.fromCharCode(enc[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const alg = (headerObj.alg || 'HS256').toUpperCase();
  const headerB64 = toB64Url(headerObj);
  const payloadB64 = toB64Url(payloadObj);

  if (alg === 'NONE') {
    return `${headerB64}.${payloadB64}.`;
  }

  const hashMap = {
    HS256: 'SHA-256',
    HS384: 'SHA-384',
    HS512: 'SHA-512',
  };

  if (!hashMap[alg]) {
    throw new Error(`Signing currently supports HS256, HS384, HS512, or none.`);
  }

  if (!secret) {
    throw new Error(`A secret key is required to sign with ${alg}.`);
  }

  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: hashMap[alg] } },
    false,
    ['sign']
  );

  const messageData = enc.encode(`${headerB64}.${payloadB64}`);
  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const sigBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < sigBytes.length; i++) binary += String.fromCharCode(sigBytes[i]);
  const sigB64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

/**
 * Comprehensive client-side JWT security auditor
 */
export async function auditJwt(jwtString, header, payload, signature) {
  const issues = [];
  const now = Math.floor(Date.now() / 1000);

  if (!header || !payload) return issues;

  // 1. alg: none check
  if (!header.alg || header.alg.toLowerCase() === 'none') {
    issues.push({
      severity: 'critical',
      title: 'Critical Vulnerability: Algorithm "none" Detected',
      desc: 'The token specifies alg: "none", allowing attackers to forge arbitrary tokens without cryptographic verification.',
    });
  }

  // 2. Expiration check
  if (!payload.exp) {
    issues.push({
      severity: 'warning',
      title: 'Missing Expiration (exp) Claim',
      desc: 'Token never expires, presenting a permanent replay attack surface if intercepted.',
    });
  } else if (payload.exp < now) {
    issues.push({
      severity: 'info',
      title: 'Token is Expired',
      desc: `Expired on ${new Date(payload.exp * 1000).toLocaleString()}.`,
    });
  }

  // 3. Not Before check
  if (payload.nbf && payload.nbf > now) {
    issues.push({
      severity: 'warning',
      title: 'Token Not Yet Valid (nbf in future)',
      desc: `Token is scheduled to become valid on ${new Date(payload.nbf * 1000).toLocaleString()}.`,
    });
  }

  // 4. Missing standard subject/issuer
  if (!payload.sub && !payload.iss) {
    issues.push({
      severity: 'low',
      title: 'Missing Subject (sub) & Issuer (iss)',
      desc: 'Neither sub nor iss claims are present. Verification cannot establish principal identity.',
    });
  }

  // 5. Weak secret brute-force audit for HMAC
  if (header.alg && header.alg.toUpperCase().startsWith('HS') && signature) {
    for (const testSecret of COMMON_WEAK_SECRETS) {
      const res = await verifyJwtSignature(jwtString, testSecret);
      if (res.verified) {
        issues.push({
          severity: 'critical',
          title: `Compromised Secret Found: "${testSecret}"`,
          desc: `The token was signed using a known weak dictionary secret ("${testSecret}"). It can be trivially cracked and forged offline.`,
        });
        break;
      }
    }
  }

  return issues;
}

/**
 * Verify RSA or ECDSA public key signature in SPKI PEM format
 */
export async function verifyJwtWithPublicKey(jwtString, pemPublicKey) {
  if (!jwtString || !pemPublicKey) {
    return { verified: false, message: 'Please provide both JWT and Public Key (SPKI PEM).' };
  }
  const clean = jwtString.replace(/^Bearer\s+/i, '').trim();
  const parts = clean.split('.');
  if (parts.length !== 3) {
    return { verified: false, message: 'Invalid token structure.' };
  }

  try {
    const headerB64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const header = JSON.parse(atob(headerB64));
    const alg = (header.alg || '').toUpperCase();

    // Clean PEM
    const pemContents = pemPublicKey
      .replace(/-----BEGIN [^-]+-----/g, '')
      .replace(/-----END [^-]+-----/g, '')
      .replace(/\s+/g, '');
    const binaryDer = atob(pemContents);
    const derBytes = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) derBytes[i] = binaryDer.charCodeAt(i);

    let verifyAlgorithm;
    let importAlgorithm;

    if (alg === 'RS256') {
      importAlgorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
      verifyAlgorithm = { name: 'RSASSA-PKCS1-v1_5' };
    } else if (alg === 'ES256') {
      importAlgorithm = { name: 'ECDSA', namedCurve: 'P-256' };
      verifyAlgorithm = { name: 'ECDSA', hash: 'SHA-256' };
    } else {
      return { verified: false, message: `Public key verification currently supports RS256 and ES256. (Detected: ${alg})` };
    }

    const cryptoKey = await window.crypto.subtle.importKey(
      'spki',
      derBytes.buffer,
      importAlgorithm,
      false,
      ['verify']
    );

    // Decode base64url signature
    let sigB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    while (sigB64.length % 4 !== 0) sigB64 += '=';
    const rawSig = atob(sigB64);
    const sigBytes = new Uint8Array(rawSig.length);
    for (let i = 0; i < rawSig.length; i++) sigBytes[i] = rawSig.charCodeAt(i);

    const messageData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const isValid = await window.crypto.subtle.verify(
      verifyAlgorithm,
      cryptoKey,
      sigBytes,
      messageData
    );

    return {
      verified: isValid,
      message: isValid
        ? `Valid asymmetric signature! Authenticated with ${alg} public key.`
        : `Signature mismatch: public key does not correspond to token signature.`,
    };
  } catch (err) {
    return { verified: false, message: `Public key verification error: ${err.message}` };
  }
}

