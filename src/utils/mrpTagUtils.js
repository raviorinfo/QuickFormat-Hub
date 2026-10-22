/**
 * Regular MRP Price Tag Utilities & Templates
 * Supports Indian retail compliance, MRP-first pricing, unit/pack sizes,
 * configurable fields, and ready-made retail templates.
 */

export const MRP_TAG_TEMPLATES = [
  {
    id: 'minimal-retail',
    name: 'Minimal Retail Tag',
    description: 'Clean, modern typography for boutiques and lifestyle stores',
    widthMm: 60,
    heightMm: 40,
    orientation: 'landscape',
    fontFamily: 'sans-serif',
    headerBg: '#0f172a',
    headerText: '#ffffff',
    bg: '#ffffff',
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    priceColor: '#0f172a',
    cornerRadius: 8,
    textAlign: 'center',
    barcodePlacement: 'bottom',
    defaults: {
      name: 'Organic Bamboo Coffee Tumbler',
      sku: 'BAM-TMB-450',
      mrp: 699,
      sellingPrice: '',
      brand: 'EcoVibe Essentials',
      variant: 'Matte Olive / 450ml',
      packSize: '1 Unit',
      customText: '100% Biodegradable & BPA Free',
      showDiscount: false,
      codeType: 'barcode',
      barcodeValue: '8901234567890',
      qrValue: 'https://ecovibe.com/p/BAM-TMB-450',
    },
  },
  {
    id: 'supermarket',
    name: 'Supermarket Price Tag',
    description: 'High-contrast shelf edge label with prominent MRP and unit price',
    widthMm: 70,
    heightMm: 42,
    orientation: 'landscape',
    fontFamily: 'sans-serif',
    headerBg: '#dc2626',
    headerText: '#ffffff',
    bg: '#ffffff',
    borderColor: '#dc2626',
    borderStyle: 'solid',
    priceColor: '#b91c1c',
    cornerRadius: 4,
    textAlign: 'left',
    barcodePlacement: 'right',
    defaults: {
      name: 'Cold Pressed Virgin Mustard Oil',
      sku: 'GRO-OIL-1000',
      mrp: 245,
      sellingPrice: 199,
      brand: 'Kisan Shuddhi',
      variant: '1 Litre Pouch',
      packSize: 'Net Vol: 1000ml',
      customText: 'FSSAI Lic: 10018021003456',
      showDiscount: true,
      codeType: 'barcode',
      barcodeValue: '8901030105449',
      qrValue: 'https://shuddhi.org/batch/9021',
    },
  },
  {
    id: 'clothing-tag',
    name: 'Clothing & Apparel Tag',
    description: 'Hanging fashion tag with size, color, fabric composition, and care',
    widthMm: 45,
    heightMm: 85,
    orientation: 'portrait',
    fontFamily: 'serif',
    headerBg: '#1e293b',
    headerText: '#f8fafc',
    bg: '#fafaf9',
    borderColor: '#cbd5e1',
    borderStyle: 'solid',
    priceColor: '#1e293b',
    cornerRadius: 10,
    textAlign: 'center',
    barcodePlacement: 'bottom',
    hasHole: true,
    defaults: {
      name: 'Linen Blend Oxford Shirt',
      sku: 'APP-SH-OX-BL-M',
      mrp: 2499,
      sellingPrice: '',
      brand: 'Aura Tailored',
      variant: 'Sky Blue / Size: 40 (M)',
      packSize: 'Net Qty: 1 N (Shirt)',
      customText: '60% Linen, 40% Cotton • Made in India',
      showDiscount: false,
      codeType: 'barcode',
      barcodeValue: '8904012398765',
      qrValue: 'https://auratailored.com/verify/SH-OX-BL-M',
    },
  },
  {
    id: 'electronics-tag',
    name: 'Electronics Product Tag',
    description: 'Spec-dense technical tag with model number, warranty, and voltage',
    widthMm: 75,
    heightMm: 50,
    orientation: 'landscape',
    fontFamily: 'monospace',
    headerBg: '#0284c7',
    headerText: '#ffffff',
    bg: '#ffffff',
    borderColor: '#0284c7',
    borderStyle: 'solid',
    priceColor: '#0369a1',
    cornerRadius: 6,
    textAlign: 'left',
    barcodePlacement: 'bottom',
    defaults: {
      name: 'Smart Fast Charger 65W GaN',
      sku: 'ELC-GAN-65W-WH',
      mrp: 2999,
      sellingPrice: 1699,
      brand: 'VoltCraft Pro',
      variant: 'White / Dual USB-C + USB-A',
      packSize: '1 Adaptor + 1m Braided Cable',
      customText: 'BIS Reg: R-41009876 • 1 Year Warranty',
      showDiscount: true,
      codeType: 'qr',
      barcodeValue: '8906045123456',
      qrValue: 'https://voltcraft.io/support/gan65',
    },
  },
  {
    id: 'toys-general',
    name: 'Toys & General Merchandise',
    description: 'Playful retail tag with safety standards, age guide, and batch',
    widthMm: 65,
    heightMm: 45,
    orientation: 'landscape',
    fontFamily: 'sans-serif',
    headerBg: '#ea580c',
    headerText: '#ffffff',
    bg: '#fffbeb',
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
    priceColor: '#c2410c',
    cornerRadius: 12,
    textAlign: 'center',
    barcodePlacement: 'bottom',
    defaults: {
      name: 'Magnetic Building Tiles (32 Pcs)',
      sku: 'TOY-MAG-32T',
      mrp: 1499,
      sellingPrice: '',
      brand: 'PlaySpark Toys',
      variant: 'Multi-Color / Ages 3+',
      packSize: '1 Box (32 Pieces)',
      customText: 'ISI Certified • Non-Toxic ABS Plastic',
      showDiscount: false,
      codeType: 'barcode',
      barcodeValue: '8908001234567',
      qrValue: 'https://playspark.com/instructions/32t',
    },
  },
  {
    id: 'compact-sku',
    name: 'Compact SKU & Barcode Tag',
    description: 'High-density mini sticker for bin locations, jewelry, and small accessories',
    widthMm: 50,
    heightMm: 25,
    orientation: 'landscape',
    fontFamily: 'sans-serif',
    headerBg: '#334155',
    headerText: '#ffffff',
    bg: '#ffffff',
    borderColor: '#94a3b8',
    borderStyle: 'solid',
    priceColor: '#0f172a',
    cornerRadius: 4,
    textAlign: 'center',
    barcodePlacement: 'bottom',
    defaults: {
      name: 'Sterling Silver Stud Earrings',
      sku: 'JWL-STD-925',
      mrp: 899,
      sellingPrice: '',
      brand: 'Lustre Studio',
      variant: '4mm Cubic Zirconia',
      packSize: '1 Pair',
      customText: 'Hallmarked 925 Silver',
      showDiscount: false,
      codeType: 'barcode',
      barcodeValue: '8909009876543',
      qrValue: 'JWL-STD-925',
    },
  },
];

/**
 * Validates regular MRP tag inputs according to Module 1 rules.
 */
export function validateMrpTagInput({ mrp, sellingPrice, allowSellingAboveMrp = false }) {
  const errors = [];
  const warnings = [];

  const m = parseFloat(mrp);
  if (isNaN(m) || m <= 0) {
    errors.push('MRP must be a valid number greater than zero.');
  }

  if (sellingPrice !== '' && sellingPrice !== null && sellingPrice !== undefined) {
    const s = parseFloat(sellingPrice);
    if (isNaN(s) || s <= 0) {
      errors.push('Selling price must be greater than zero when provided.');
    } else if (s > m && !allowSellingAboveMrp) {
      errors.push('Selling price cannot exceed MRP unless explicitly authorized.');
    } else if (s === m) {
      warnings.push('Selling price is equal to MRP (no discount).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Formats Indian Currency with ₹ and lakh/crore commas.
 */
export function formatIndianCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}
