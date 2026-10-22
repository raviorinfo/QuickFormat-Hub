import QRCode from 'qrcode';

export const QR_TYPES = [
  { id: 'url', label: 'Website URL', desc: 'Direct link to website or landing page' },
  { id: 'upi', label: 'UPI Payment', desc: 'Indian UPI payment intent for GPay, PhonePe, Paytm' },
  { id: 'vcard', label: 'vCard Contact', desc: 'Digital business card with name, phone & email' },
  { id: 'wifi', label: 'Wi-Fi Network', desc: 'Auto-connect credentials for guests or cafes' },
  { id: 'text', label: 'Plain Text', desc: 'General alphanumeric text, notes or codes' },
  { id: 'phone', label: 'Phone Call', desc: 'Direct dial click-to-call link' },
  { id: 'email', label: 'Email Message', desc: 'Pre-filled recipient, subject and body' },
  { id: 'sms', label: 'SMS Message', desc: 'Pre-filled phone number and message body' },
  { id: 'location', label: 'Maps Location', desc: 'GPS latitude and longitude coordinates' },
  { id: 'social', label: 'Social Profile', desc: 'Instagram, WhatsApp, LinkedIn or YouTube' },
  { id: 'product', label: 'Product Info', desc: 'SKU, batch code, expiry and specs' },
];

export const COLOR_PRESETS = [
  { id: 'classic', label: 'Monochrome', dark: '#000000', light: '#ffffff' },
  { id: 'tech-cyan', label: 'Tech Cyan', dark: '#0284c7', light: '#f0f9ff' },
  { id: 'emerald', label: 'Emerald Trust', dark: '#059669', light: '#ecfdf5' },
  { id: 'purple', label: 'Royal Violet', dark: '#7c3aed', light: '#f5f3ff' },
  { id: 'crimson', label: 'Crimson Bold', dark: '#dc2626', light: '#fef2f2' },
  { id: 'amber', label: 'Amber Warmth', dark: '#d97706', light: '#fffbeb' },
  { id: 'dark-luxury', label: 'Dark Charcoal', dark: '#0f172a', light: '#f8fafc' },
];

export const CTA_FRAME_STYLES = [
  { id: 'none', label: 'No Frame (Minimal)' },
  { id: 'bottom-pill', label: 'Bottom Banner ("SCAN ME")' },
  { id: 'framed-card', label: 'Card Frame with Header' },
  { id: 'top-tag', label: 'Top Pill Tag' },
];

/**
 * Builds standard QR string payload based on selected type.
 */
export function buildQrPayload(type, data) {
  switch (type) {
    case 'url': {
      let url = (data.url || '').trim();
      if (url && !/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      return url;
    }

    case 'upi': {
      const pa = (data.pa || '').trim(); // Payee VPA
      const pn = (data.pn || '').trim(); // Payee Name
      const am = (data.am || '').trim(); // Amount
      const tn = (data.tn || '').trim(); // Transaction Note
      const cu = (data.cu || 'INR').trim();

      const params = new URLSearchParams();
      if (pa) params.append('pa', pa);
      if (pn) params.append('pn', pn);
      if (am && !isNaN(Number(am)) && Number(am) > 0) {
        params.append('am', Number(am).toFixed(2));
      }
      params.append('cu', cu);
      if (tn) params.append('tn', tn);

      return `upi://pay?${params.toString()}`;
    }

    case 'vcard': {
      const name = (data.name || '').trim();
      const org = (data.org || '').trim();
      const title = (data.title || '').trim();
      const phone = (data.phone || '').trim();
      const email = (data.email || '').trim();
      const url = (data.url || '').trim();
      const address = (data.address || '').trim();

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `N:${name};;;;`,
      ];
      if (org) lines.push(`ORG:${org}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (url) lines.push(`URL:${url}`);
      if (address) lines.push(`ADR:;;${address};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'wifi': {
      const ssid = (data.ssid || '').trim();
      const pass = data.password || '';
      const encryption = data.encryption || 'WPA'; // 'WPA' | 'WEP' | 'nopass'
      const hidden = data.hidden ? 'true' : 'false';
      return `WIFI:S:${ssid};T:${encryption};P:${pass};H:${hidden};;`;
    }

    case 'phone': {
      const num = (data.phone || '').trim();
      return `tel:${num}`;
    }

    case 'email': {
      const to = (data.email || '').trim();
      const sub = (data.subject || '').trim();
      const body = (data.body || '').trim();
      const params = new URLSearchParams();
      if (sub) params.append('subject', sub);
      if (body) params.append('body', body);
      const query = params.toString();
      return `mailto:${to}${query ? '?' + query : ''}`;
    }

    case 'sms': {
      const phone = (data.phone || '').trim();
      const msg = (data.message || '').trim();
      return `smsto:${phone}:${msg}`;
    }

    case 'location': {
      const lat = (data.lat || '').trim();
      const lng = (data.lng || '').trim();
      return `https://maps.google.com/?q=${lat},${lng}`;
    }

    case 'social': {
      const platform = data.platform || 'instagram';
      const handle = (data.handle || '').trim().replace(/^@/, '');
      switch (platform) {
        case 'whatsapp': {
          const cleanPhone = handle.replace(/[^0-9]/g, '');
          const msg = encodeURIComponent(data.message || 'Hello!');
          return `https://wa.me/${cleanPhone}?text=${msg}`;
        }
        case 'instagram':
          return `https://instagram.com/${handle}`;
        case 'linkedin':
          return handle.startsWith('http') ? handle : `https://linkedin.com/in/${handle}`;
        case 'youtube':
          return `https://youtube.com/@${handle}`;
        case 'twitter':
          return `https://twitter.com/${handle}`;
        case 'github':
          return `https://github.com/${handle}`;
        default:
          return `https://${platform}.com/${handle}`;
      }
    }

    case 'product': {
      return [
        `SKU: ${data.sku || ''}`,
        `Item: ${data.name || ''}`,
        `Price: ${data.price || ''}`,
        `Batch: ${data.batch || ''}`,
        `Exp: ${data.exp || ''}`,
      ]
        .filter((l) => !l.endsWith(': '))
        .join(' | ');
    }

    case 'text':
    default:
      return data.text || '';
  }
}

/**
 * Validates UPI VPA format (e.g. name@bank, merchant@upi).
 */
export function validateUpiVpa(vpa) {
  if (!vpa || !vpa.trim()) return { isValid: false, error: 'UPI ID is required.' };
  const clean = vpa.trim();
  const vpaRegex = /^[\w.\-_]{2,256}@[\w]{2,64}$/;
  if (!vpaRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Invalid UPI ID format. Should be like "username@bank" (e.g. store@okhdfcbank).',
    };
  }
  return { isValid: true };
}

/**
 * Calculates color contrast ratio between two hex colors.
 */
export function getContrastRatio(hex1, hex2) {
  const getLuminance = (hex) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const sRGB = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (bright + 0.05) / (dark + 0.05);
  } catch {
    return 21; // fallback
  }
}

/**
 * Renders full QR code to a high-res canvas including logo and CTA frame.
 */
export async function renderFullQrCanvas({
  payload,
  size = 512,
  darkColor = '#000000',
  lightColor = '#ffffff',
  errorCorrectionLevel = 'M',
  logoDataUrl = null,
  logoSizePercent = 20, // 15% to 25%
  frameStyle = 'none',
  ctaText = 'SCAN ME',
  subText = '',
}) {
  if (!payload || !payload.trim()) {
    throw new Error('Payload cannot be empty');
  }

  // If a logo is embedded, ensure error correction is at least 'Q' for readability
  const effectiveEcc = logoDataUrl && (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M')
    ? 'Q'
    : errorCorrectionLevel;

  // Generate bare QR to an offscreen canvas
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, payload, {
    width: size,
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: effectiveEcc,
  });

  // Determine frame dimensions
  const hasBottomPill = frameStyle === 'bottom-pill';
  const hasFramedCard = frameStyle === 'framed-card';
  const hasTopTag = frameStyle === 'top-tag';

  let totalWidth = size;
  let totalHeight = size;
  let qrOffsetY = 0;
  let qrOffsetX = 0;

  if (hasBottomPill) {
    totalHeight = size + 64;
  } else if (hasFramedCard) {
    totalWidth = size + 48;
    totalHeight = size + 110;
    qrOffsetX = 24;
    qrOffsetY = 48;
  } else if (hasTopTag) {
    totalHeight = size + 56;
    qrOffsetY = 56;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = totalWidth;
  finalCanvas.height = totalHeight;
  const ctx = finalCanvas.getContext('2d');

  // Fill background
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw framed card border if selected
  if (hasFramedCard) {
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, totalWidth - 12, totalHeight - 12);

    // Header title
    ctx.fillStyle = darkColor;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ctaText || 'SCAN WITH PHONE', totalWidth / 2, 34);

    // Bottom subtitle
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(subText || 'Camera or Any QR Scanner App', totalWidth / 2, totalHeight - 24);
  }

  // Draw QR code onto final canvas
  ctx.drawImage(qrCanvas, qrOffsetX, qrOffsetY);

  // Draw Bottom Pill if selected
  if (hasBottomPill) {
    const pillHeight = 44;
    const pillY = size + 10;
    const pillWidth = Math.min(220, size - 32);
    const pillX = (totalWidth - pillWidth) / 2;

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 22);
    ctx.fill();

    ctx.fillStyle = lightColor;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText || 'SCAN ME', totalWidth / 2, pillY + pillHeight / 2);
  }

  // Draw Top Tag if selected
  if (hasTopTag) {
    const tagHeight = 36;
    const tagWidth = Math.min(200, size - 40);
    const tagX = (totalWidth - tagWidth) / 2;

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(tagX, 8, tagWidth, tagHeight, 18);
    ctx.fill();

    ctx.fillStyle = lightColor;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText || 'SCAN CODE', totalWidth / 2, 8 + tagHeight / 2);
  }

  // Embed center logo if provided
  if (logoDataUrl) {
    await new Promise((resolve) => {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        const logoDimension = (size * logoSizePercent) / 100;
        const centerX = qrOffsetX + size / 2;
        const centerY = qrOffsetY + size / 2;
        const halfDim = logoDimension / 2;
        const padding = 8;

        // Draw protective quiet background behind logo
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.roundRect(
          centerX - halfDim - padding,
          centerY - halfDim - padding,
          logoDimension + padding * 2,
          logoDimension + padding * 2,
          10
        );
        ctx.fill();

        // Subtle logo border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw logo centered
        ctx.drawImage(
          logoImg,
          centerX - halfDim,
          centerY - halfDim,
          logoDimension,
          logoDimension
        );
        resolve();
      };
      logoImg.onerror = () => resolve(); // continue if logo fails
      logoImg.src = logoDataUrl;
    });
  }

  return finalCanvas;
}

/**
 * Parses CSV text for bulk QR code generation.
 */
export function parseBulkQrCsv(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('url') ||
    firstLine.includes('data') ||
    firstLine.includes('payload') ||
    firstLine.includes('label');

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

    const payload = parts[0] || `https://example.com/item/${idx + 1}`;
    const label = parts[1] || `Item ${idx + 1}`;

    return {
      id: `qr-${idx}`,
      payload,
      label,
    };
  });
}

export const SAMPLE_QR_PRESETS = [
  {
    id: 'store-url',
    label: 'Online Store Link',
    type: 'url',
    data: { url: 'https://quickformat.arvaancorelogic.com' },
    ctaText: 'VISIT STORE',
  },
  {
    id: 'upi-merchant',
    label: 'UPI Merchant Pay (INR)',
    type: 'upi',
    data: {
      pa: 'quickformat@okhdfcbank',
      pn: 'QuickFormat Retail Store',
      am: '499.00',
      cu: 'INR',
      tn: 'Order Payment #QF-9821',
    },
    ctaText: 'PAY VIA UPI',
  },
  {
    id: 'wifi-cafe',
    label: 'Guest Cafe Wi-Fi',
    type: 'wifi',
    data: {
      ssid: 'QuickFormat_Guest_5G',
      password: 'CoffeeAndCode2026',
      encryption: 'WPA',
      hidden: false,
    },
    ctaText: 'CONNECT WI-FI',
  },
  {
    id: 'business-card',
    label: 'Digital Business Card',
    type: 'vcard',
    data: {
      name: 'Aarav Patel',
      org: 'QuickFormat Systems Ltd',
      title: 'Head of Product Engineering',
      phone: '+91 98765 43210',
      email: 'aarav@quickformat.com',
      url: 'https://quickformat.com',
      address: 'Bengaluru, India',
    },
    ctaText: 'SAVE CONTACT',
  },
  {
    id: 'whatsapp-support',
    label: 'WhatsApp Direct Chat',
    type: 'social',
    data: {
      platform: 'whatsapp',
      handle: '919876543210',
      message: 'Hi, I would like to inquire about your products!',
    },
    ctaText: 'CHAT ON WHATSAPP',
  },
];

export const STATIC_QR_DISCLAIMER =
  'QuickFormat generates direct client-side static QR codes. The encoded data is embedded directly in the matrix without any intermediary redirect server. They are 100% private, never expire, and work offline.';

export const UPI_PAYMENT_DISCLAIMER =
  'This QR code encodes a standard UPI payment URI. It initiates payment when scanned in a banking or UPI app (PhonePe, GPay, Paytm, BHIM). Generating or scanning a QR code is not proof of a completed transaction; always verify received funds in your merchant bank dashboard.';

/**
 * Evaluates scan reliability based on color contrast, error correction level, and logo embedding.
 */
export function evaluateQrScanReliability({
  contrastRatio = 21,
  ecc = 'M',
  hasLogo = false,
  logoSizePercent = 20,
}) {
  const warnings = [];
  const recommendations = [];
  let score = 100;

  // 1. Contrast Check
  if (contrastRatio < 3.0) {
    score -= 50;
    warnings.push('Extremely low color contrast ratio (< 3:1). Scanners will fail to read this QR code.');
    recommendations.push('Increase the contrast by picking a darker foreground or lighter background.');
  } else if (contrastRatio < 4.5) {
    score -= 25;
    warnings.push('Marginal color contrast (< 4.5:1). Scanners may struggle under dim lighting or reflective surfaces.');
    recommendations.push('Aim for a contrast ratio of at least 7:1 for commercial printing.');
  }

  // 2. Logo and ECC Check
  if (hasLogo) {
    if (ecc === 'L' || ecc === 'M') {
      score -= 20;
      warnings.push(`Logo is embedded with low error correction level (${ecc}).`);
      recommendations.push('Switch to Error Correction Level "Q" (25%) or "H" (30%) to guarantee readability.');
    }
    if (logoSizePercent > 25) {
      score -= 20;
      warnings.push(`Logo size is ${logoSizePercent}% of total width, which may obscure essential timing patterns.`);
      recommendations.push('Keep center logos between 15% and 22% of total code width.');
    }
  }

  let rating = 'EXCELLENT';
  let badgeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  if (score < 50) {
    rating = 'RISKY';
    badgeColor = 'text-red-500 bg-red-500/10 border-red-500/30';
  } else if (score < 80) {
    rating = 'ACCEPTABLE';
    badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  }

  return {
    score: Math.max(0, score),
    rating,
    badgeColor,
    warnings,
    recommendations,
  };
}

/**
 * Validates QR payload and inputs.
 */
export function verifyQrPayload(type, data) {
  if (!data) return { isValid: false, error: 'Data payload is required.' };

  switch (type) {
    case 'url': {
      const url = (data.url || '').trim();
      if (!url) return { isValid: false, error: 'Website URL cannot be empty.' };
      if (url.length < 4) return { isValid: false, error: 'URL is too short.' };
      return { isValid: true };
    }
    case 'upi': {
      return validateUpiVpa(data.pa);
    }
    case 'vcard': {
      if (!data.name || !data.name.trim()) {
        return { isValid: false, error: 'Full Name is required for vCard.' };
      }
      return { isValid: true };
    }
    case 'wifi': {
      if (!data.ssid || !data.ssid.trim()) {
        return { isValid: false, error: 'Wi-Fi Network Name (SSID) is required.' };
      }
      return { isValid: true };
    }
    case 'phone': {
      const phone = (data.phone || '').trim();
      if (!phone || phone.length < 5) {
        return { isValid: false, error: 'Valid phone number is required.' };
      }
      return { isValid: true };
    }
    case 'email': {
      const email = (data.email || '').trim();
      if (!email || !email.includes('@')) {
        return { isValid: false, error: 'Valid recipient email address is required.' };
      }
      return { isValid: true };
    }
    case 'text':
    default: {
      const text = (data.text || '').trim();
      if (!text) return { isValid: false, error: 'Text cannot be empty.' };
      return { isValid: true };
    }
  }
}

/**
 * Generates sample CSV text for bulk QR codes.
 */
export function generateQrSampleCsv() {
  return [
    'Payload,Label',
    'https://quickformat.com/product/101,Website Product 101',
    'https://quickformat.com/product/102,Website Product 102',
    'upi://pay?pa=store@okhdfcbank&pn=QuickFormat&am=599.00&cu=INR,UPI Store Pay INR 599',
    'WIFI:S:Guest_WiFi;T:WPA;P:Password123;;,Guest Wi-Fi Access',
    'tel:+919876543210,Customer Care Hotline',
  ].join('\n');
}

/**
 * Decodes and verifies any raw QR payload string into its semantic schema and parameters.
 * Validates integrity for URLs, UPI payment URIs, vCard contacts, Wi-Fi credentials, etc.
 */
export function decodeQrPayload(rawPayload) {
  if (!rawPayload || !rawPayload.trim()) {
    return {
      type: 'empty',
      label: 'Empty Payload',
      params: {},
      isVerified: false,
      error: 'Payload is empty.',
    };
  }

  const clean = rawPayload.trim();

  // 1. UPI Payment URI
  if (clean.startsWith('upi://pay')) {
    try {
      const url = new URL(clean);
      const params = {
        pa: url.searchParams.get('pa') || '',
        pn: url.searchParams.get('pn') || '',
        am: url.searchParams.get('am') || '',
        cu: url.searchParams.get('cu') || 'INR',
        tn: url.searchParams.get('tn') || '',
      };
      const isVerified = Boolean(params.pa && params.pa.includes('@'));
      return {
        type: 'upi',
        label: 'UPI Payment Request (India Standard)',
        params,
        isVerified,
        summary: `Pay ${params.am ? params.cu + ' ' + params.am : 'any amount'} to ${params.pa} (${params.pn || 'Merchant'})`,
      };
    } catch {
      return { type: 'upi', label: 'Malformed UPI URI', params: {}, isVerified: false };
    }
  }

  // 2. vCard Contact
  if (clean.includes('BEGIN:VCARD')) {
    const lines = clean.split(/\r?\n/);
    const params = {};
    for (const l of lines) {
      if (l.startsWith('FN:')) params.name = l.slice(3).trim();
      else if (l.startsWith('ORG:')) params.org = l.slice(4).trim();
      else if (l.startsWith('TITLE:')) params.title = l.slice(6).trim();
      else if (l.startsWith('TEL')) params.phone = l.split(':').slice(1).join(':').trim();
      else if (l.startsWith('EMAIL')) params.email = l.split(':').slice(1).join(':').trim();
      else if (l.startsWith('URL:')) params.url = l.slice(4).trim();
      else if (l.startsWith('ADR:')) params.address = l.split(':').slice(1).join(':').replace(/;/g, ' ').trim();
    }
    return {
      type: 'vcard',
      label: 'vCard 3.0 Digital Contact Card',
      params,
      isVerified: Boolean(params.name),
      summary: `${params.name || 'Contact'} (${params.phone || params.email || 'No phone/email'})`,
    };
  }

  // 3. Wi-Fi Credentials
  if (clean.startsWith('WIFI:')) {
    const ssidMatch = clean.match(/S:([^;]+)/);
    const typeMatch = clean.match(/T:([^;]+)/);
    const passMatch = clean.match(/P:([^;]+)/);
    const hiddenMatch = clean.match(/H:([^;]+)/);
    const params = {
      ssid: ssidMatch ? ssidMatch[1] : '',
      encryption: typeMatch ? typeMatch[1] : 'WPA',
      password: passMatch ? passMatch[1] : '',
      hidden: hiddenMatch ? hiddenMatch[1] === 'true' : false,
    };
    return {
      type: 'wifi',
      label: 'Wi-Fi Network Auto-Connect',
      params,
      isVerified: Boolean(params.ssid),
      summary: `SSID: "${params.ssid}" (${params.encryption}, ${params.password ? 'Password Protected' : 'Open'})`,
    };
  }

  // 4. Email URI
  if (clean.startsWith('mailto:')) {
    try {
      const parts = clean.slice(7).split('?');
      const email = parts[0];
      const search = new URLSearchParams(parts[1] || '');
      const params = {
        email,
        subject: search.get('subject') || '',
        body: search.get('body') || '',
      };
      return {
        type: 'email',
        label: 'Pre-filled Email Link',
        params,
        isVerified: Boolean(email && email.includes('@')),
        summary: `Mail to ${email}`,
      };
    } catch {
      return { type: 'email', label: 'Email URI', params: {}, isVerified: false };
    }
  }

  // 5. Phone Call
  if (clean.startsWith('tel:')) {
    const phone = clean.slice(4).trim();
    return {
      type: 'phone',
      label: 'Click-to-Call Phone URI',
      params: { phone },
      isVerified: phone.length >= 3,
      summary: `Call ${phone}`,
    };
  }

  // 6. SMS
  if (clean.startsWith('smsto:')) {
    const parts = clean.slice(6).split(':');
    const phone = parts[0] || '';
    const message = parts.slice(1).join(':') || '';
    return {
      type: 'sms',
      label: 'Pre-filled SMS URI',
      params: { phone, message },
      isVerified: phone.length >= 3,
      summary: `SMS to ${phone}`,
    };
  }

  // 7. Web URL
  if (/^https?:\/\//i.test(clean)) {
    try {
      const parsed = new URL(clean);
      return {
        type: 'url',
        label: 'Hyperlink / Web URL',
        params: {
          url: clean,
          host: parsed.hostname,
          protocol: parsed.protocol,
          path: parsed.pathname,
        },
        isVerified: true,
        summary: `Navigate to ${parsed.hostname}${parsed.pathname}`,
      };
    } catch {
      return { type: 'url', label: 'Invalid URL', params: { url: clean }, isVerified: false };
    }
  }

  // 8. Plain Text fallback
  return {
    type: 'text',
    label: 'Plain Text / Raw Payload',
    params: { text: clean },
    isVerified: true,
    summary: `${clean.length} characters: "${clean.slice(0, 40)}${clean.length > 40 ? '...' : ''}"`,
  };
}

