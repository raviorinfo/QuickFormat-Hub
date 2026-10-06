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
