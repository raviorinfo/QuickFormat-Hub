export const CURRENCY_SYMBOLS = [
  { id: 'INR', label: 'INR (₹)', symbol: '₹' },
  { id: 'USD', label: 'USD ($)', symbol: '$' },
  { id: 'EUR', label: 'EUR (€)', symbol: '€' },
  { id: 'GBP', label: 'GBP (£)', symbol: '£' },
  { id: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { id: 'AED', label: 'AED (د.إ)', symbol: 'AED ' },
  { id: 'CAD', label: 'CAD ($)', symbol: 'C$' },
  { id: 'AUD', label: 'AUD ($)', symbol: 'A$' },
];

export const TAG_SHAPES = [
  { id: 'standard-rect', label: 'Standard Shelf Tag (70 × 45 mm)', widthMm: 70, heightMm: 45, cols: 2, rows: 6 },
  { id: 'compact-shelf', label: 'Compact Shelf Talker (50 × 30 mm)', widthMm: 50, heightMm: 30, cols: 3, rows: 8 },
  { id: 'square-tag', label: 'Square Product Tag (50 × 50 mm)', widthMm: 50, heightMm: 50, cols: 3, rows: 5 },
  { id: 'hanging-apparel', label: 'Hanging Apparel Tag (45 × 90 mm)', widthMm: 45, heightMm: 90, cols: 4, rows: 3, hasHole: true },
  { id: 'jewelry-mini', label: 'Jewelry & Mini Item (40 × 20 mm)', widthMm: 40, heightMm: 20, cols: 4, rows: 12 },
];

export const CATEGORY_TEMPLATES = [
  {
    id: 'electronics',
    label: 'Electronics & Tech',
    badge: 'NEW DEAL',
    theme: {
      headerBg: '#0284c7',
      headerText: '#ffffff',
      tagBg: '#ffffff',
      border: '#0284c7',
      priceColor: '#0369a1',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
      font: 'sans-serif',
    },
    defaultProduct: {
      name: 'Wireless ANC Gaming Headset',
      sellingPrice: 1999,
      mrp: 3999,
      sku: 'SKU-ELC-8921',
      description: '40mm Neodymium Drivers | 50h Battery | Low Latency',
      badge: 'HOT DEAL',
      currency: 'INR',
    },
  },
  {
    id: 'clothing',
    label: 'Clothing & Fashion',
    badge: 'BOUTIQUE',
    theme: {
      headerBg: '#475569',
      headerText: '#ffffff',
      tagBg: '#fafaf9',
      border: '#e7e5e4',
      priceColor: '#1c1917',
      badgeBg: '#f5f5f4',
      badgeText: '#44403c',
      font: 'serif',
    },
    defaultProduct: {
      name: "Men's Heavyweight Cotton Tee",
      sellingPrice: 799,
      mrp: 1499,
      sku: 'TSH-OVR-L-BK',
      description: 'Size: L | 100% Organic Combed Cotton | Relaxed Fit',
      badge: 'SPRING COLLECTION',
      currency: 'INR',
    },
  },
  {
    id: 'grocery',
    label: 'Grocery & Supermarket',
    badge: 'SUPER SAVER',
    theme: {
      headerBg: '#dc2626',
      headerText: '#ffffff',
      tagBg: '#ffffff',
      border: '#dc2626',
      priceColor: '#b91c1c',
      badgeBg: '#fef08a',
      badgeText: '#854d0e',
      font: 'sans-serif',
    },
    defaultProduct: {
      name: 'Cold-Pressed Extra Virgin Olive Oil',
      sellingPrice: 549,
      mrp: 899,
      sku: 'GRO-OIL-500ML',
      description: 'Net Qty: 500ml | First Cold Press | Imported',
      badge: 'SAVE ₹350',
      currency: 'INR',
    },
  },
  {
    id: 'toys',
    label: 'Toys & Children',
    badge: 'TOP TOY',
    theme: {
      headerBg: '#ea580c',
      headerText: '#ffffff',
      tagBg: '#fffbeb',
      border: '#f59e0b',
      priceColor: '#c2410c',
      badgeBg: '#fed7aa',
      badgeText: '#9a3412',
      font: 'sans-serif',
    },
    defaultProduct: {
      name: 'Magnetic Robotic Construction Set',
      sellingPrice: 1299,
      mrp: 2199,
      sku: 'TOY-MAG-64PCS',
      description: 'Ages 4+ | 64 Magnetic Blocks | Non-Toxic BPA Free',
      badge: 'BESTSELLER',
      currency: 'INR',
    },
  },
  {
    id: 'jewelry',
    label: 'Gifts & Luxury Jewelry',
    badge: 'PREMIUM',
    theme: {
      headerBg: '#09090b',
      headerText: '#fef08a',
      tagBg: '#18181b',
      border: '#eab308',
      priceColor: '#fef08a',
      badgeBg: '#27272a',
      badgeText: '#fde047',
      font: 'serif',
    },
    defaultProduct: {
      name: '925 Sterling Silver Solitaire Ring',
      sellingPrice: 2499,
      mrp: 4999,
      sku: 'JWL-SLV-RNG08',
      description: 'Hallmarked 925 Silver | 1.5 Carat Moissanite Stone',
      badge: 'LIMITED EDITION',
      currency: 'INR',
    },
  },
  {
    id: 'clearance',
    label: 'Clearance & Mega Sale',
    badge: 'CLEARANCE',
    theme: {
      headerBg: '#991b1b',
      headerText: '#fef2f2',
      tagBg: '#ffffff',
      border: '#ef4444',
      priceColor: '#b91c1c',
      badgeBg: '#fee2e2',
      badgeText: '#991b1b',
      font: 'sans-serif',
    },
    defaultProduct: {
      name: 'All-Weather Waterproof Jacket',
      sellingPrice: 999,
      mrp: 2999,
      sku: 'CLR-JKT-XL-NV',
      description: 'Final Clearance Sale | No Returns | Size: XL',
      badge: '66% OFF',
      currency: 'INR',
    },
  },
  {
    id: 'artisan',
    label: 'Artisan & Handmade (Kraft)',
    badge: 'HANDCRAFTED',
    theme: {
      headerBg: '#78350f',
      headerText: '#fef3c7',
      tagBg: '#fef3c7',
      border: '#b45309',
      priceColor: '#78350f',
      badgeBg: '#fde68a',
      badgeText: '#78350f',
      font: 'serif',
    },
    defaultProduct: {
      name: 'Soy Wax Aromatherapy Candle (Vanilla)',
      sellingPrice: 450,
      mrp: 650,
      sku: 'ART-CNDL-VAN',
      description: 'Hand poured | Pure Soy Wax & Essential Oils | 40h Burn',
      badge: '100% NATURAL',
      currency: 'INR',
    },
  },
];

/**
 * Validates MRP and Selling Price values.
 */
export function validatePriceInput(mrp, sellingPrice) {
  const m = Number(mrp);
  const s = Number(sellingPrice);

  if (isNaN(m) || m < 0) {
    return { isValid: false, error: 'MRP must be a valid non-negative number.' };
  }
  if (isNaN(s) || s < 0) {
    return { isValid: false, error: 'Selling price must be a valid non-negative number.' };
  }
  if (s > m && m > 0) {
    return {
      isValid: false,
      error: 'Selling price cannot exceed MRP (Maximum Retail Price).',
    };
  }
  return { isValid: true };
}

/**
 * Formats a monetary number with appropriate symbol and numbering system (e.g. Indian Lakhs/Crores for INR).
 */
export function formatCurrency(amount, currencyCode = 'INR') {
  const num = Number(amount) || 0;
  try {
    const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  } catch {
    const found = CURRENCY_SYMBOLS.find((c) => c.id === currencyCode);
    const sym = found ? found.symbol : `${currencyCode} `;
    return `${sym}${num.toLocaleString()}`;
  }
}

/**
 * Calculates discount percentage and savings with strict validation.
 * Never returns a negative or misleading discount.
 */
export function calculateDiscount(mrp, sellingPrice) {
  const m = Number(mrp) || 0;
  const s = Number(sellingPrice) || 0;

  if (m <= 0 || s <= 0) {
    return { discountPercent: 0, savings: 0, isInvalid: false };
  }

  if (s > m) {
    return {
      discountPercent: 0,
      savings: 0,
      isInvalid: true,
      error: 'Selling price exceeds MRP',
    };
  }

  const savings = m - s;
  const discountPercent = Math.round((savings / m) * 100);
  return { discountPercent, savings, isInvalid: false };
}

/**
 * Generates a clean, downloadable sample CSV template for bulk price tags.
 */
export function generatePriceTagSampleCsv() {
  return [
    'Product Name,Selling Price,MRP,SKU,Description,Badge,Currency',
    'Wireless ANC Gaming Headset,1999,3999,SKU-ELC-8921,40mm Neodymium Drivers | 50h Battery,HOT DEAL,INR',
    "Men's Heavyweight Cotton Tee,799,1499,TSH-OVR-L-BK,Size: L | 100% Organic Cotton | Relaxed,SPRING COLLECTION,INR",
    'Cold-Pressed Extra Virgin Olive Oil,549,899,GRO-OIL-500ML,Net Qty: 500ml | First Cold Press,SUPER SAVER,INR',
    'Magnetic Robotic Construction Set,1299,2199,TOY-MAG-64PCS,Ages 4+ | 64 Magnetic Blocks | BPA Free,TOP TOY,INR',
    '925 Sterling Silver Solitaire Ring,2499,4999,JWL-SLV-RNG08,Hallmarked 925 Silver | 1.5 Carat,PREMIUM,INR',
  ].join('\n');
}

/**
 * Parses CSV text for bulk price tag generation with row-level validation.
 */
export function parseBulkPriceTagsCsv(csvText, defaultCurrency = 'INR') {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('name') ||
    firstLine.includes('price') ||
    firstLine.includes('mrp') ||
    firstLine.includes('sku');

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

    const name = parts[0] || `Product Item ${idx + 1}`;
    const rawSellingPrice = parseFloat(parts[1]);
    const rawMrp = parseFloat(parts[2]);
    const sellingPrice = isNaN(rawSellingPrice) ? 499 : rawSellingPrice;
    const mrp = isNaN(rawMrp) ? sellingPrice * 1.5 : rawMrp;
    const sku = parts[3] || `SKU-${1000 + idx}`;
    const description = parts[4] || '';
    const badge = parts[5] || '';
    const currency = parts[6] || defaultCurrency;

    const validation = validatePriceInput(mrp, sellingPrice);
    const { discountPercent, savings } = calculateDiscount(mrp, sellingPrice);

    return {
      id: `pt-${idx}`,
      name,
      sellingPrice,
      mrp,
      sku,
      description,
      badge: badge || (discountPercent > 0 ? `${discountPercent}% OFF` : ''),
      discountPercent,
      savings,
      currency,
      isValid: validation.isValid,
      error: validation.error || null,
    };
  });
}

