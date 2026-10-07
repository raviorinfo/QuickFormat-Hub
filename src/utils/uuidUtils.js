/**
 * UUID v4, UUID v7 (RFC 9562), ULID, and NanoID Generator and Inspector
 */

// Generate UUID v4 (CSPRNG)
export function generateUuidV4() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
  return formatUuidBytes(bytes);
}

// Generate UUID v7 (RFC 9562 timestamp-ordered)
export function generateUuidV7() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);

  const nowMs = Date.now();
  // 48-bit timestamp
  bytes[0] = (nowMs / 0x10000000000) & 0xff;
  bytes[1] = (nowMs / 0x100000000) & 0xff;
  bytes[2] = (nowMs / 0x1000000) & 0xff;
  bytes[3] = (nowMs / 0x10000) & 0xff;
  bytes[4] = (nowMs / 0x100) & 0xff;
  bytes[5] = nowMs & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // Version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

  return formatUuidBytes(bytes);
}

function formatUuidBytes(bytes) {
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Generate ULID (Crockford Base32)
const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateUlid() {
  const now = Date.now();
  let timeStr = '';
  let timeVal = now;
  for (let i = 9; i >= 0; i--) {
    const mod = timeVal % 32;
    timeStr = CROCKFORD_BASE32[mod] + timeStr;
    timeVal = Math.floor(timeVal / 32);
  }

  const randBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randBytes);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    randStr += CROCKFORD_BASE32[randBytes[i] % 32];
  }

  return timeStr + randStr;
}

// Generate NanoID
export function generateNanoId(size = 21) {
  const urlAlphabet = 'useandom-26T1983_4057qwertyuiopasdfghjklzxcvbnmBYIMQUFGHOSTAZXCVBNM';
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);
  let id = '';
  for (let i = 0; i < size; i++) {
    id += urlAlphabet[bytes[i] & 63];
  }
  return id;
}

export function generateBatch(type = 'v4', count = 10, options = {}) {
  const { uppercase = false, hyphens = true, braces = false } = options;
  const list = [];

  for (let i = 0; i < count; i++) {
    let item = '';
    if (type === 'v4') item = generateUuidV4();
    else if (type === 'v7') item = generateUuidV7();
    else if (type === 'ulid') item = generateUlid();
    else if (type === 'nanoid') item = generateNanoId();

    if (!hyphens && (type === 'v4' || type === 'v7')) {
      item = item.replace(/-/g, '');
    }
    if (uppercase) {
      item = item.toUpperCase();
    } else {
      item = item.toLowerCase();
    }
    if (braces) {
      item = `{${item}}`;
    }
    list.push(item);
  }

  return list;
}

// Inspect / Decode UUIDv7 or ULID
export function inspectId(idString) {
  if (!idString || !idString.trim()) return null;
  const clean = idString.trim().replace(/[{}-]/g, '');

  // Check UUID (32 hex characters)
  if (/^[0-9a-fA-F]{32}$/.test(clean)) {
    const versionChar = clean[12];
    const version = parseInt(versionChar, 16);

    if (version === 7) {
      const timeHex = clean.slice(0, 12);
      const timestampMs = parseInt(timeHex, 16);
      const date = new Date(timestampMs);
      return {
        type: 'UUID v7 (Time-Ordered)',
        version: 7,
        timestampMs,
        date: date.toISOString(),
        localDate: date.toLocaleString(),
        valid: true,
      };
    } else if (version === 4) {
      return {
        type: 'UUID v4 (Random)',
        version: 4,
        timestampMs: null,
        date: 'No embedded timestamp (Pure random)',
        valid: true,
      };
    } else {
      return {
        type: `UUID v${version}`,
        version,
        valid: true,
      };
    }
  }

  // Check ULID (26 Crockford Base32 characters)
  if (/^[0-9A-HJ-KM-NP-TV-Z]{26}$/i.test(clean)) {
    const timePart = clean.slice(0, 10).toUpperCase();
    let timestampMs = 0;
    for (let i = 0; i < 10; i++) {
      const char = timePart[i];
      const val = CROCKFORD_BASE32.indexOf(char);
      if (val === -1) return null;
      timestampMs = timestampMs * 32 + val;
    }
    const date = new Date(timestampMs);
    return {
      type: 'ULID (Crockford Base32)',
      timestampMs,
      date: date.toISOString(),
      localDate: date.toLocaleString(),
      valid: true,
    };
  }

  return { error: 'Not a recognized UUID or ULID structure.' };
}
