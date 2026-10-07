// ASN.1 DER & X.509 / CSR Certificate Decoder (100% In-Browser & Air-Gapped)

export const SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIFdTCCBF2gAwIBAgISA6W/y1+1uM8mO7p6e3E5X9w+MA0GCSqGSIb3DQEBCwUA
MDExCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQ4wDAYDVQQD
EwVFMTAwHhcNMjYwMTAxMDAwMDAwWhcNMjYwNDAxMjM1OTU5WjAiMSAwHgYDVQQD
ExdxdWlja2Zvcm1hdC5leGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEP
ADCCAQoCggEBALtK2b7xV5fH0/oW5nZ5wT9y7kP4FmX1m0e6Z9qX+1m9o0e6Z9qX
+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9
o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6
Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX
+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9
o0e6Z9qXAgMBAAGjggJ4MIICdDAOBgNVHQ8BAf8EBAMCB4AwHQYDVR0lBBYwFAYI
KwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFG4q6eZ9
qX+1m9o0e6Z9qX+1m9o0MB8GA1UdIwQYMBaAFIS39W5V9p1o5m9qX+1m9o0e6Z9q
MFwGA1UdIARVMFMwCAYGZ4EMAQIBMEcGCysGAQQBgt8TAQEBMDgwNgYIKwYBBQUH
AgEWKmh0dHA6Ly9jcHMubGV0c2VuY3J5cHQub3JnL2Nwc2hpY2tlbi50eHQwVwYD
VR0fBFAwTjBMoEqgSIYKaHR0cDovL2UxLmNybC5sZXRzZW5jcnlwdC5vcmcvY3Js
L2UxLmNybDCBnQYIKwYBBQUHAQEEgZAwgY0wVwYIKwYBBQUHMAKGK2h0dHA6Ly9l
MS5jcnQubGV0c2VuY3J5cHQub3JnL2NlcnRzL2UxLmNydDAyBggrBgEFBQcwAYYm
aHR0cDovL2UxLm9jc3AubGV0c2VuY3J5cHQub3JnL29jc3AwJgYDVR0RBB8wHYIX
cXVpY2tmb3JtYXQuZXhhbXBsZS5jb22CDCouZXhhbXBsZS5jb20wDQYJKoZIhvcN
AQELBQADggEBAKpK2b7xV5fH0/oW5nZ5wT9y7kP4FmX1m0e6Z9qX+1m9o0e6Z9qX
+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9
o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6
Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX
+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9
-----END CERTIFICATE-----`;

export const SAMPLE_CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVVMxETAPBgNVBAgMCE5ldyBZb3JrMREw
DwYDVQQHDAhOZXcgWW9yazEUMBIGA1UECgwLUXVpY2tGb3JtYXQxEDAOBgNVBAsM
B1NlY3VyaXR5MR8wHQYDVQQDDBZhcGkucXVpY2tmb3JtYXQubG9jYWwwggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7Stm+8VeXx9P6FuZ2ecE/cu5D+BZl
9ZtHumfal/tZvaNHuZn2pf7Wb2jR7mZ9qX+1m9o0e5mfal/tZvaNHuZn2pf7Wb2j
R7mZ9qX+1m9o0e5mfal/tZvaNHuZn2pf7Wb2jR7mZ9qX+1m9o0e5mfal/tZvaNHu
Zn2pf7Wb2jR7mZ9qX+1m9o0e5mfal/tZvaNHuZn2pf7Wb2jR7mZ9qX+1m9o0e5mf
al/tZvaNHuZn2pf7Wb2jR7mZ9qX+1m9o0e5mfal/tZvaNHuZn2pf7Wb2jR7mZ9qX
+1m9o0e5mfal/tZvaNHuZn2pf7Wb2jR7mZ9qX+1m9o0e5mfal/tZvaNHuZn2pf7W
b2jRAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEAKpK2b7xV5fH0/oW5nZ5wT9y7
kP4FmX1m0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX
+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9
o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6
Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX+1m9o0e6Z9qX
-----END CERTIFICATE REQUEST-----`;

const OID_NAMES = {
  '2.5.4.3': 'commonName',
  '2.5.4.6': 'countryName',
  '2.5.4.7': 'localityName',
  '2.5.4.8': 'stateOrProvinceName',
  '2.5.4.10': 'organizationName',
  '2.5.4.11': 'organizationalUnitName',
  '1.2.840.113549.1.9.1': 'emailAddress',
  // Signature algorithms
  '1.2.840.113549.1.1.11': 'SHA256 with RSA Encryption',
  '1.2.840.113549.1.1.12': 'SHA384 with RSA Encryption',
  '1.2.840.113549.1.1.13': 'SHA512 with RSA Encryption',
  '1.2.840.113549.1.1.5': 'SHA1 with RSA Encryption',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.2.840.10045.2.1': 'ECC Public Key',
  '1.2.840.113549.1.1.1': 'RSA Encryption',
  // Extensions
  '2.5.29.17': 'subjectAltName',
  '2.5.29.15': 'keyUsage',
  '2.5.29.37': 'extendedKeyUsage',
  '2.5.29.19': 'basicConstraints',
};

// Simple Base64 decode to Uint8Array
function base64ToBytes(base64) {
  const binaryString = atob(base64.replace(/\s+/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert bytes to hex string with optional delimiter
export function bytesToHex(bytes, delim = ':') {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(delim);
}

// Low-level ASN.1 DER parser
class Asn1Reader {
  constructor(bytes) {
    this.bytes = bytes;
    this.pos = 0;
  }

  hasMore() {
    return this.pos < this.bytes.length;
  }

  readTag() {
    return this.bytes[this.pos++];
  }

  readLength() {
    let b = this.bytes[this.pos++];
    if ((b & 0x80) === 0) {
      return b;
    }
    const numBytes = b & 0x7f;
    let len = 0;
    for (let i = 0; i < numBytes; i++) {
      len = (len << 8) | this.bytes[this.pos++];
    }
    return len;
  }

  readBytes(len) {
    const slice = this.bytes.slice(this.pos, this.pos + len);
    this.pos += len;
    return slice;
  }

  readElement() {
    if (!this.hasMore()) return null;
    const start = this.pos;
    const tag = this.readTag();
    const len = this.readLength();
    const value = this.readBytes(len);
    return { tag, len, value, start, raw: this.bytes.slice(start, this.pos) };
  }
}

// Decode ASN.1 OID bytes to dotted string
function decodeOid(bytes) {
  if (bytes.length === 0) return '';
  const first = bytes[0];
  const parts = [Math.floor(first / 40), first % 40];
  let val = 0;
  for (let i = 1; i < bytes.length; i++) {
    const b = bytes[i];
    val = (val << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) {
      parts.push(val);
      val = 0;
    }
  }
  return parts.join('.');
}

// Decode text from ASN.1 string bytes
function decodeString(bytes) {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return Array.from(bytes).map((b) => String.fromCharCode(b)).join('');
  }
}

// Decode ASN.1 UTCTime or GeneralizedTime
function decodeTime(bytes) {
  const str = decodeString(bytes);
  // UTCTime: YYMMDDHHMMSSZ -> 20YY or 19YY
  if (str.length >= 11 && (str.endsWith('Z') || str.includes('+') || str.includes('-'))) {
    if (str.length === 13 && str.endsWith('Z')) {
      const yy = parseInt(str.substring(0, 2), 10);
      const year = yy >= 50 ? 1900 + yy : 2000 + yy;
      const mm = parseInt(str.substring(2, 4), 10) - 1;
      const dd = parseInt(str.substring(4, 6), 10);
      const hh = parseInt(str.substring(6, 8), 10);
      const min = parseInt(str.substring(8, 10), 10);
      const ss = parseInt(str.substring(10, 12), 10);
      return new Date(Date.UTC(year, mm, dd, hh, min, ss));
    }
    if (str.length === 15 && str.endsWith('Z')) {
      const year = parseInt(str.substring(0, 4), 10);
      const mm = parseInt(str.substring(4, 6), 10) - 1;
      const dd = parseInt(str.substring(6, 8), 10);
      const hh = parseInt(str.substring(8, 10), 10);
      const min = parseInt(str.substring(10, 12), 10);
      const ss = parseInt(str.substring(12, 14), 10);
      return new Date(Date.UTC(year, mm, dd, hh, min, ss));
    }
  }
  return new Date(str);
}

// Parse RelativeDistinguishedName (RDN) SET into key-value map
function parseNameSequence(bytes) {
  const result = {};
  const reader = new Asn1Reader(bytes);
  while (reader.hasMore()) {
    const setElem = reader.readElement();
    if (!setElem) break;
    const setReader = new Asn1Reader(setElem.value);
    while (setReader.hasMore()) {
      const seqElem = setReader.readElement();
      if (!seqElem) break;
      const seqReader = new Asn1Reader(seqElem.value);
      const oidElem = seqReader.readElement();
      const valElem = seqReader.readElement();
      if (oidElem && valElem) {
        const oid = decodeOid(oidElem.value);
        const name = OID_NAMES[oid] || oid;
        const valStr = decodeString(valElem.value);
        result[name] = valStr;
      }
    }
  }
  return result;
}

// Parse Subject Alternative Names (SANs) from extension bytes
function parseSanExtension(bytes) {
  const sans = [];
  const reader = new Asn1Reader(bytes);
  // May be wrapped in OCTET STRING
  let targetBytes = bytes;
  const first = reader.readElement();
  if (first && first.tag === 0x04) {
    targetBytes = first.value;
  }
  const seqReader = new Asn1Reader(targetBytes);
  const rootSeq = seqReader.readElement();
  if (rootSeq) {
    const listReader = new Asn1Reader(rootSeq.value);
    while (listReader.hasMore()) {
      const elem = listReader.readElement();
      if (!elem) break;
      // Tag 0x82 is dNSName [2], 0x87 is iPAddress [7]
      if ((elem.tag & 0x1f) === 2) {
        sans.push(decodeString(elem.value));
      } else if ((elem.tag & 0x1f) === 7) {
        if (elem.value.length === 4) {
          sans.push(Array.from(elem.value).join('.'));
        }
      }
    }
  }
  return sans;
}

// Main Certificate & CSR Parser
export async function parseCertificate(inputPem) {
  const cleaned = inputPem.trim();
  const isCsr = cleaned.includes('CERTIFICATE REQUEST');
  const isCert = cleaned.includes('CERTIFICATE') && !isCsr;

  if (!isCert && !isCsr) {
    throw new Error('Input must be a valid PEM formatted certificate (-----BEGIN CERTIFICATE-----) or CSR');
  }

  const b64 = cleaned
    .replace(/-----[^-]+-----/g, '')
    .replace(/\s+/g, '');

  let rawBytes;
  try {
    rawBytes = base64ToBytes(b64);
  } catch (err) {
    throw new Error('Invalid Base64 encoding in PEM structure: ' + err.message);
  }

  // Calculate Fingerprints using native Web Crypto
  let sha256Fingerprint = '';
  let sha1Fingerprint = '';
  try {
    const sha256Buf = await crypto.subtle.digest('SHA-256', rawBytes);
    sha256Fingerprint = bytesToHex(new Uint8Array(sha256Buf));
    const sha1Buf = await crypto.subtle.digest('SHA-1', rawBytes);
    sha1Fingerprint = bytesToHex(new Uint8Array(sha1Buf));
  } catch (err) {
    sha256Fingerprint = 'N/A';
  }

  const reader = new Asn1Reader(rawBytes);
  const rootSeq = reader.readElement();
  if (!rootSeq || rootSeq.tag !== 0x30) {
    throw new Error('Malformed ASN.1 structure: Expected SEQUENCE at root');
  }

  const certReader = new Asn1Reader(rootSeq.value);
  const tbsElem = certReader.readElement(); // TBSCertificate OR CertificationRequestInfo
  if (!tbsElem) {
    throw new Error('Malformed ASN.1 structure: Missing body sequence');
  }

  const tbsReader = new Asn1Reader(tbsElem.value);

  if (isCsr) {
    // CSR parsing
    const versionElem = tbsReader.readElement();
    const subjectElem = tbsReader.readElement();
    const spkiElem = tbsReader.readElement();
    const subject = subjectElem ? parseNameSequence(subjectElem.value) : {};

    return {
      type: 'CSR',
      isCsr: true,
      subject,
      commonName: subject.commonName || 'N/A',
      organization: subject.organizationName || 'N/A',
      country: subject.countryName || 'N/A',
      sha256Fingerprint,
      sha1Fingerprint,
      byteLength: rawBytes.length,
      rawPem: cleaned,
    };
  }

  // X.509 Certificate parsing
  let firstElem = tbsReader.readElement();
  let version = 1;
  // If tag is [0] context-specific, it's version
  if (firstElem && (firstElem.tag & 0x1f) === 0) {
    const vReader = new Asn1Reader(firstElem.value);
    const vInt = vReader.readElement();
    if (vInt && vInt.value.length > 0) {
      version = vInt.value[0] + 1;
    }
    firstElem = tbsReader.readElement();
  }

  // Serial Number
  const serialElem = firstElem;
  const serialNumber = serialElem ? bytesToHex(serialElem.value) : 'N/A';

  // Signature Algorithm
  const sigAlgElem = tbsReader.readElement();
  let sigAlgorithm = 'SHA256withRSA';
  if (sigAlgElem) {
    const saReader = new Asn1Reader(sigAlgElem.value);
    const oidElem = saReader.readElement();
    if (oidElem) {
      const oid = decodeOid(oidElem.value);
      sigAlgorithm = OID_NAMES[oid] || oid;
    }
  }

  // Issuer
  const issuerElem = tbsReader.readElement();
  const issuer = issuerElem ? parseNameSequence(issuerElem.value) : {};

  // Validity
  const validityElem = tbsReader.readElement();
  let notBefore = null;
  let notAfter = null;
  if (validityElem) {
    const valReader = new Asn1Reader(validityElem.value);
    const nbElem = valReader.readElement();
    const naElem = valReader.readElement();
    if (nbElem) notBefore = decodeTime(nbElem.value);
    if (naElem) notAfter = decodeTime(naElem.value);
  }

  // Subject
  const subjectElem = tbsReader.readElement();
  const subject = subjectElem ? parseNameSequence(subjectElem.value) : {};

  // Subject Public Key Info
  const spkiElem = tbsReader.readElement();
  let keyType = 'RSA';
  let keySize = 2048;
  if (spkiElem) {
    const spkiReader = new Asn1Reader(spkiElem.value);
    const algElem = spkiReader.readElement();
    const pubKeyBitStr = spkiReader.readElement();
    if (algElem) {
      const aReader = new Asn1Reader(algElem.value);
      const kOid = aReader.readElement();
      if (kOid) {
        const oid = decodeOid(kOid.value);
        if (oid.includes('10045')) keyType = 'ECDSA (Elliptic Curve)';
        else if (oid.includes('1.1.1')) keyType = 'RSA';
      }
    }
    if (pubKeyBitStr && pubKeyBitStr.value.length > 0) {
      keySize = (pubKeyBitStr.value.length - 1) * 8;
      if (keySize > 4000) keySize = 4096;
      else if (keySize > 2000) keySize = 2048;
      else if (keySize > 1000) keySize = 1024;
      else if (keySize < 600) keySize = 256;
    }
  }

  // Extensions (SANs, Key Usage, etc.)
  const sans = [];
  while (tbsReader.hasMore()) {
    const extBlock = tbsReader.readElement();
    if (!extBlock) break;
    // Look for tag [3] context-specific extensions
    if ((extBlock.tag & 0x1f) === 3) {
      const extListReader = new Asn1Reader(extBlock.value);
      const extSeq = extListReader.readElement();
      if (extSeq) {
        const r2 = new Asn1Reader(extSeq.value);
        while (r2.hasMore()) {
          const singleExt = r2.readElement();
          if (!singleExt) break;
          const sReader = new Asn1Reader(singleExt.value);
          const extOidElem = sReader.readElement();
          if (extOidElem) {
            const extOid = decodeOid(extOidElem.value);
            if (extOid === '2.5.29.17') {
              // Found SAN
              let next = sReader.readElement();
              // Skip boolean critical if present
              if (next && next.tag === 0x01) {
                next = sReader.readElement();
              }
              if (next) {
                const foundSans = parseSanExtension(next.value);
                sans.push(...foundSans);
              }
            }
          }
        }
      }
    }
  }

  // Compute Days Remaining & Health status
  const now = new Date();
  let daysRemaining = 0;
  let status = 'valid'; // 'valid' | 'expiring' | 'expired'
  if (notAfter) {
    const diffMs = notAfter.getTime() - now.getTime();
    daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'expiring';
    } else {
      status = 'valid';
    }
  }

  return {
    type: 'X.509 Certificate',
    isCsr: false,
    version: `v${version}`,
    serialNumber,
    sigAlgorithm,
    subject,
    commonName: subject.commonName || 'N/A',
    organization: subject.organizationName || 'N/A',
    country: subject.countryName || 'N/A',
    issuer,
    issuerCommonName: issuer.commonName || issuer.organizationName || 'N/A',
    issuerOrganization: issuer.organizationName || 'N/A',
    notBefore,
    notAfter,
    daysRemaining,
    status,
    keyType,
    keySize: `${keySize}-bit`,
    sans: sans.length > 0 ? Array.from(new Set(sans)) : [subject.commonName || 'None listed'],
    sha256Fingerprint,
    sha1Fingerprint,
    byteLength: rawBytes.length,
    rawPem: cleaned,
  };
}
