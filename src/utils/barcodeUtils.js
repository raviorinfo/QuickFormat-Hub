import JsBarcode from 'jsbarcode';

export const BARCODE_FORMATS = [
  { id: 'CODE128', label: 'Code 128', desc: 'Universal alphanumeric, standard for shipping & logistics' },
  { id: 'EAN13', label: 'EAN-13', desc: 'International retail standard (12 or 13 numeric digits)' },
  { id: 'EAN8', label: 'EAN-8', desc: 'Compact retail for small packages (7 or 8 numeric digits)' },
  { id: 'UPC', label: 'UPC-A', desc: 'North American retail standard (11 or 12 numeric digits)' },
  { id: 'UPCE', label: 'UPC-E', desc: 'Zero-suppressed compact UPC (6 to 8 numeric digits)' },
  { id: 'CODE39', label: 'Code 39', desc: 'Alphanumeric industrial, defense & automotive' },
  { id: 'ITF14', label: 'ITF-14', desc: 'Master shipping containers & packaging (14 digits)' },
  { id: 'pharmacode', label: 'Pharmacode', desc: 'Pharmaceutical packaging binary code' },
  { id: 'codabar', label: 'Codabar', desc: 'Libraries, blood banks & airbills' },
];

export const LABEL_DIMENSION_PRESETS = [
  { id: '50x25', label: '50 × 25 mm (Standard Retail)', width: 50, height: 25, cols: 3, rows: 9 },
  { id: '40x30', label: '40 × 30 mm (Compact Barcode)', width: 40, height: 30, cols: 4, rows: 8 },
  { id: '60x40', label: '60 × 40 mm (Shipping & Retail)', width: 60, height: 40, cols: 3, rows: 6 },
  { id: '70x35', label: '70 × 35 mm (Price Tag Label)', width: 70, height: 35, cols: 2, rows: 7 },
  { id: '100x50', label: '100 × 50 mm (Warehouse Carton)', width: 100, height: 50, cols: 2, rows: 5 },
  { id: 'custom', label: 'Custom Dimensions (mm)', width: 50, height: 25, cols: 3, rows: 8 },
];

/**
 * Calculates modulo-10 check digit with 3x and 1x weights from right to left.
 */
export function calculateModulo10CheckDigit(digitsStr) {
  const digits = digitsStr.split('').map(Number);
  let sum = 0;
  // Moving backwards from the rightmost digit: alternate weight 3 and 1
  let weight = 3;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += digits[i] * weight;
    weight = weight === 3 ? 1 : 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/** Alias for EAN-13 check digit calculation */
export const calculateEan13CheckDigit = calculateModulo10CheckDigit;

/**
 * Validates barcode input according to format rules.
 */
export function validateBarcodeData(format, value) {
  const cleanVal = (value || '').trim();

  if (!cleanVal) {
    return { isValid: false, error: 'Barcode value cannot be empty.' };
  }

  switch (format) {
    case 'EAN13': {
      if (!/^\d+$/.test(cleanVal)) {
        return { isValid: false, error: 'EAN-13 must contain digits only (0-9).' };
      }
      if (cleanVal.length === 12) {
        const check = calculateModulo10CheckDigit(cleanVal);
        return {
          isValid: true,
          warning: `12 digits entered. Expected 13 digits. Auto-calculated check digit: ${check}`,
          autoFixed: cleanVal + check,
        };
      }
      if (cleanVal.length === 13) {
        const payload = cleanVal.slice(0, 12);
        const expectedCheck = calculateModulo10CheckDigit(payload);
        const actualCheck = Number(cleanVal[12]);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            error: `Invalid check digit: '${actualCheck}'. Expected '${expectedCheck}'.`,
            autoFixed: payload + expectedCheck,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, error: `EAN-13 requires 12 or 13 digits (current length: ${cleanVal.length}).` };
    }

    case 'EAN8': {
      if (!/^\d+$/.test(cleanVal)) {
        return { isValid: false, error: 'EAN-8 must contain digits only.' };
      }
      if (cleanVal.length === 7) {
        const check = calculateModulo10CheckDigit(cleanVal);
        return {
          isValid: true,
          warning: `7 digits entered. Auto-calculated check digit: ${check}`,
          autoFixed: cleanVal + check,
        };
      }
      if (cleanVal.length === 8) {
        const payload = cleanVal.slice(0, 7);
        const expectedCheck = calculateModulo10CheckDigit(payload);
        const actualCheck = Number(cleanVal[7]);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            error: `Invalid check digit: '${actualCheck}'. Expected '${expectedCheck}'.`,
            autoFixed: payload + expectedCheck,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, error: `EAN-8 requires 7 or 8 digits (current length: ${cleanVal.length}).` };
    }

    case 'UPC': {
      if (!/^\d+$/.test(cleanVal)) {
        return { isValid: false, error: 'UPC-A must contain digits only.' };
      }
      if (cleanVal.length === 11) {
        const check = calculateModulo10CheckDigit(cleanVal);
        return {
          isValid: true,
          warning: `11 digits entered. Auto-calculated check digit: ${check}`,
          autoFixed: cleanVal + check,
        };
      }
      if (cleanVal.length === 12) {
        const payload = cleanVal.slice(0, 11);
        const expectedCheck = calculateModulo10CheckDigit(payload);
        const actualCheck = Number(cleanVal[11]);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            error: `Invalid check digit: '${actualCheck}'. Expected '${expectedCheck}'.`,
            autoFixed: payload + expectedCheck,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, error: `UPC-A requires 11 or 12 digits (current length: ${cleanVal.length}).` };
    }

    case 'UPCE': {
      if (!/^\d+$/.test(cleanVal)) {
        return { isValid: false, error: 'UPC-E must contain digits only.' };
      }
      if (cleanVal.length < 6 || cleanVal.length > 8) {
        return { isValid: false, error: `UPC-E requires 6, 7, or 8 digits (current length: ${cleanVal.length}).` };
      }
      return { isValid: true };
    }

    case 'CODE39': {
      if (!/^[0-9A-Z\-.$/+% ]+$/i.test(cleanVal)) {
        return {
          isValid: false,
          error: 'Code 39 supports uppercase A-Z, 0-9, and symbols: - . $ / + % [space]',
        };
      }
      return { isValid: true, autoFixed: cleanVal.toUpperCase() };
    }

    case 'ITF14': {
      if (!/^\d+$/.test(cleanVal)) {
        return { isValid: false, error: 'ITF-14 must contain digits only.' };
      }
      if (cleanVal.length === 13) {
        const check = calculateModulo10CheckDigit(cleanVal);
        return {
          isValid: true,
          warning: `13 digits entered. Auto-calculated check digit: ${check}`,
          autoFixed: cleanVal + check,
        };
      }
      if (cleanVal.length === 14) {
        const payload = cleanVal.slice(0, 13);
        const expectedCheck = calculateModulo10CheckDigit(payload);
        const actualCheck = Number(cleanVal[13]);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            error: `Invalid check digit: '${actualCheck}'. Expected '${expectedCheck}'.`,
            autoFixed: payload + expectedCheck,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, error: `ITF-14 requires 13 or 14 digits (current: ${cleanVal.length}).` };
    }

    case 'pharmacode': {
      const num = parseInt(cleanVal, 10);
      if (isNaN(num) || num < 3 || num > 131070) {
        return { isValid: false, error: 'Pharmacode must be an integer between 3 and 131070.' };
      }
      return { isValid: true };
    }

    case 'CODE128':
    default: {
      // Code 128 supports ASCII 0-127
      if (!/^[\x00-\x7F]+$/.test(cleanVal)) {
        return { isValid: false, error: 'Code 128 supports standard ASCII characters only.' };
      }
      return { isValid: true };
    }
  }
}

/**
 * Renders a barcode to an SVG element safely.
 */
export function renderBarcodeToSvg(svgElement, value, options = {}) {
  const {
    format = 'CODE128',
    width = 2,
    height = 60,
    displayValue = true,
    font = 'monospace',
    fontSize = 14,
    textMargin = 2,
    textAlign = 'center',
    textPosition = 'bottom',
    lineColor = '#000000',
    background = '#ffffff',
    margin = 8,
  } = options;

  try {
    JsBarcode(svgElement, String(value), {
      format: format === 'UPC' ? 'UPC' : format,
      width,
      height,
      displayValue,
      font,
      fontSize,
      textMargin,
      textAlign,
      textPosition,
      lineColor,
      background,
      margin,
      valid: () => true,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Parses CSV text or lines into structured barcode items.
 */
export function parseBulkBarcodeCsv(csvText, defaultFormat = 'CODE128') {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('barcode') ||
    firstLine.includes('sku') ||
    firstLine.includes('code') ||
    firstLine.includes('name');

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    // Handle comma or tab separated
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

    const barcodeVal = parts[0] || `SKU-${1000 + idx}`;
    const name = parts[1] || `Product ${idx + 1}`;
    const sku = parts[2] || parts[0] || `SKU-${idx + 1}`;
    const price = parts[3] || '';

    const validation = validateBarcodeData(defaultFormat, barcodeVal);

    return {
      id: `item-${idx}`,
      barcode: barcodeVal,
      name,
      sku,
      price,
      isValid: validation.isValid,
      error: validation.error,
      autoFixed: validation.autoFixed,
    };
  });
}

export const SAMPLE_BARCODE_PRESETS = [
  {
    id: 'retail-ean13',
    label: 'Retail Coffee (EAN-13)',
    format: 'EAN13',
    value: '8901234567890',
    name: 'Single Origin Arabica Beans 250g',
    sku: 'CF-ARB-250',
    price: '₹499.00',
    brand: 'QuickFormat Roasters',
  },
  {
    id: 'electronics-code128',
    label: 'Electronics Headset (Code 128)',
    format: 'CODE128',
    value: 'PROD-ANC-9082-BK',
    name: 'Wireless ANC Pro Headphones',
    sku: 'ANC-PRO-BK',
    price: '₹2,499.00',
    brand: 'Aura Sound Labs',
  },
  {
    id: 'us-grocery-upca',
    label: 'US Grocery Milk (UPC-A)',
    format: 'UPC',
    value: '012345678905',
    name: 'Organic Vitamin D Whole Milk 1 Gal',
    sku: 'MLK-ORG-GAL',
    price: '$4.99',
    brand: 'Valley Fresh Farms',
  },
  {
    id: 'logistics-itf14',
    label: 'Logistics Carton (ITF-14)',
    format: 'ITF14',
    value: '10890123456787',
    name: 'Master Carton (24 Pack Assorted)',
    sku: 'CTN-MSTR-24',
    price: '₹11,976.00',
    brand: 'Global Fulfillment Logistics',
  },
  {
    id: 'asset-code39',
    label: 'IT Asset Tag (Code 39)',
    format: 'CODE39',
    value: 'ASSET-89410',
    name: 'Developer Laptop Core i7 32GB',
    sku: 'IT-DEV-89410',
    price: '',
    brand: 'Internal IT Assets Dept',
  },
];

/**
 * Validates a Global Trade Item Number (GTIN-8, GTIN-12, GTIN-13, GTIN-14)
 * separately from internal product SKU codes.
 */
export function validateRetailGtin(gtinStr) {
  const clean = (gtinStr || '').trim().replace(/[\s-]/g, '');
  if (!clean) {
    return { isValid: false, error: 'GTIN cannot be empty.' };
  }

  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: 'Retail GTINs must contain numbers only (0-9). For alphanumeric internal codes, use Code 128 or Code 39.',
    };
  }

  const validLengths = [8, 12, 13, 14];
  if (!validLengths.includes(clean.length)) {
    return {
      isValid: false,
      error: `Invalid GTIN length (${clean.length} digits). Standard GTIN lengths are 8 (EAN-8), 12 (UPC-A), 13 (EAN-13), or 14 (ITF-14).`,
    };
  }

  const payload = clean.slice(0, -1);
  const checkDigit = Number(clean.slice(-1));
  const expectedCheck = calculateModulo10CheckDigit(payload);

  if (checkDigit !== expectedCheck) {
    return {
      isValid: false,
      error: `Invalid check digit: '${checkDigit}'. Expected '${expectedCheck}'.`,
      autoFixed: payload + expectedCheck,
    };
  }

  // Country Prefix Information (GS1 standard)
  let prefixInfo = 'International Retail Standard';
  if (clean.length === 13) {
    const p3 = clean.slice(0, 3);
    const p2 = clean.slice(0, 2);
    if (p3 === '890') prefixInfo = 'GS1 India (890)';
    else if (Number(p2) >= 0 && Number(p2) <= 13) prefixInfo = 'GS1 US & Canada (UPC-A compatible)';
    else if (p3 >= '300' && p3 <= '379') prefixInfo = 'GS1 France';
    else if (p3 >= '400' && p3 <= '440') prefixInfo = 'GS1 Germany';
    else if (p3 >= '450' && p3 <= '459') prefixInfo = 'GS1 Japan';
    else if (p3 >= '490' && p3 <= '499') prefixInfo = 'GS1 Japan';
    else if (p3 === '500' || (p3 >= '500' && p3 <= '509')) prefixInfo = 'GS1 United Kingdom';
    else if (p3 >= '690' && p3 <= '699') prefixInfo = 'GS1 China';
  }

  return {
    isValid: true,
    gtinType: `GTIN-${clean.length}`,
    prefixInfo,
    cleanValue: clean,
  };
}

/**
 * Calculates luminance contrast ratio between barcode lines and background.
 * Returns ratio and a scanner readability rating.
 */
export function getBarcodeContrastRating(lineColor = '#000000', bgColor = '#ffffff') {
  const getLum = (hex) => {
    let c = (hex || '').replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c || '0', 16);
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
    const l1 = getLum(lineColor);
    const l2 = getLum(bgColor);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    const ratio = (bright + 0.05) / (dark + 0.05);

    if (ratio < 3.5) {
      return {
        ratio: Math.round(ratio * 10) / 10,
        isWarning: true,
        level: 'poor',
        message: 'Low optical contrast! Physical laser/CCD scanners may struggle to decode this barcode.',
      };
    }
    if (ratio < 7.0) {
      return {
        ratio: Math.round(ratio * 10) / 10,
        isWarning: false,
        level: 'acceptable',
        message: 'Adequate contrast. High-resolution print recommended.',
      };
    }
    return {
      ratio: Math.round(ratio * 10) / 10,
      isWarning: false,
      level: 'optimal',
      message: 'Optimal contrast for all industrial and retail barcode scanners.',
    };
  } catch {
    return { ratio: 21, isWarning: false, level: 'optimal', message: 'Optimal contrast' };
  }
}

/**
 * Generates downloadable sample CSV template for bulk barcode generation.
 */
export function generateBarcodeSampleCsv() {
  const header = 'Barcode,ProductName,SKU,Price,Brand\n';
  const rows = [
    '8901234567890,"Single Origin Arabica Beans 250g",CF-ARB-250,"₹499.00","QuickFormat Roasters"',
    'PROD-ANC-9082-BK,"Wireless ANC Pro Headphones",ANC-PRO-BK,"₹2499.00","Aura Sound Labs"',
    '012345678905,"Organic Vitamin D Whole Milk 1 Gal",MLK-ORG-GAL,"$4.99","Valley Fresh Farms"',
    '10890123456787,"Master Carton (24 Pack Assorted)",CTN-MSTR-24,"₹11976.00","Global Logistics"',
    'ASSET-89410,"Developer Laptop Core i7 32GB",IT-DEV-89410,"N/A","IT Asset Management"',
  ];
  return header + rows.join('\n');
}

/**
 * Automated verification helper: Validates barcode data against format specification.
 */
export function verifyBarcodeReadable(format, value) {
  const valResult = validateBarcodeData(format, value);
  if (!valResult.isValid) {
    return {
      verified: false,
      reason: valResult.error,
    };
  }
  return {
    verified: true,
    format,
    encodedValue: valResult.autoFixed || value,
    checkDigitStatus: 'Verified Checksum OK',
  };
}
