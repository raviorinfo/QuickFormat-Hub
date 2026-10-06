/**
 * Utilities for Base64 Text and File/Image conversion
 */

export function textToBase64(text, urlSafe = false) {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let b64 = btoa(binary);
    if (urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return { success: true, result: b64 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function base64ToText(b64) {
  try {
    let clean = b64.trim();
    // Convert URL safe back to standard
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const text = new TextDecoder().decode(bytes);
    return { success: true, result: text };
  } catch (err) {
    return { success: false, error: 'Invalid Base64 string format.' };
  }
}

export const SAMPLE_BASE64_TEXT = `Hello QuickFormat Hub!
Base64 encoding is an ultra-fast, client-side data serialization technique.
Unicode symbols supported: 🚀 ⚡ 🔒`;
