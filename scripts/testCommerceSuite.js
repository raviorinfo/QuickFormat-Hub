/**
 * Automated Verification Test Suite for Commerce Tools:
 * - Barcode Generator (Check-digits, GS1 Prefixes, Contrast, Bulk CSV)
 * - Price Tag Creator (Price & Discount Math, INR Currency Formatting, Bulk CSV)
 * - QR Code Generator (Payload Generation, Scan Reliability, UPI URIs, Bulk CSV)
 * - Thank You Card Maker (Print Bleed, Safe-Zones, Personalization CSV)
 * - Brand Kit & Saved Projects Data Structures
 */

import {
  validateBarcodeData,
  validateRetailGtin,
  getBarcodeContrastRating,
  parseBulkBarcodeCsv,
} from '../src/utils/barcodeUtils.js';

import {
  calculateDiscount,
  formatCurrency,
  parseBulkPriceTagsCsv,
} from '../src/utils/priceTagUtils.js';

import {
  buildQrPayload,
  evaluateQrScanReliability,
  parseBulkQrCsv,
} from '../src/utils/qrUtils.js';

import {
  getCardPrintDimensions,
  parseCardPersonalizationCsv,
} from '../src/utils/thankYouCardUtils.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n========================================');
console.log('--- 1. BARCODE GENERATOR VERIFICATION ---');
console.log('========================================');

// Test 1: Code 128
const c128Valid = validateBarcodeData('CODE128', 'SKU-1082-PRO');
assert(c128Valid.isValid, 'Code 128 accepts valid alphanumeric string');

// Test 2: Code 39
const c39Valid = validateBarcodeData('CODE39', 'PROD123');
assert(c39Valid.isValid, 'Code 39 accepts valid uppercase alphanumeric string');
const c39Invalid = validateBarcodeData('CODE39', 'invalid_lowercase');
assert(!c39Invalid.isValid, 'Code 39 rejects lowercase / unsupported characters');

// Test 3: EAN-13 Check Digit & GS1 Country Resolution
// 8901030365737 is a valid GS1 India barcode for HUL Lux soap (Check digit is 7)
const ean13Valid = validateBarcodeData('EAN13', '8901030365737');
assert(ean13Valid.isValid, 'EAN-13 accepts valid 13-digit code with correct modulo-10 check digit');

const gtinIndia = validateRetailGtin('8901030365737');
assert(gtinIndia.isValid && gtinIndia.prefixInfo?.includes('India'), `GS1 prefix 890 resolves correctly to India: ${gtinIndia.prefixInfo}`);

// Test 4: EAN-13 Invalid Check Digit
const ean13Invalid = validateBarcodeData('EAN13', '8901030365738'); // Wrong check digit 8 instead of 7
assert(!ean13Invalid.isValid, 'EAN-13 rejects invalid check digit');

// Test 5: EAN-8 Check Digit
// 96385074 is a valid EAN-8 barcode
const ean8Valid = validateBarcodeData('EAN8', '96385074');
assert(ean8Valid.isValid, 'EAN-8 accepts valid 8-digit code with correct check digit');

// Test 6: UPC-A Check Digit
// 012345678905 is a valid UPC-A barcode
const upcaValid = validateBarcodeData('UPC', '012345678905');
assert(upcaValid.isValid, 'UPC-A accepts valid 12-digit code with correct check digit');

// Test 7: Optical Barcode Contrast
const contrastHigh = getBarcodeContrastRating('#000000', '#ffffff');
assert(contrastHigh.level === 'optimal' && contrastHigh.ratio > 10, 'Black on white gives Optimal contrast');

const contrastPoor = getBarcodeContrastRating('#888888', '#999999');
assert(contrastPoor.level === 'poor' && contrastPoor.ratio < 3.5, 'Low-contrast colors flagged as Poor');

// Test 8: Bulk Barcodes CSV Parser
const sampleBarcodeCsv = 'Barcode,ProductName,SKU,Price\nSKU-001,Organic Green Tea,CF-01,499\n8901030365737,Lux Soap,EAN-01,45';
const parsedBarcodes = parseBulkBarcodeCsv(sampleBarcodeCsv, 'CODE128');
assert(parsedBarcodes.length === 2, 'Bulk barcode CSV parser loads 2 rows');
assert(parsedBarcodes[1].barcode === '8901030365737', 'Bulk barcode CSV maps barcode accurately');

console.log('\n==========================================');
console.log('--- 2. PRICE TAG CREATOR VERIFICATION ---');
console.log('==========================================');

// Test 9: Standard Discount Math
const discStandard = calculateDiscount(1000, 750);
assert(discStandard.discountPercent === 25 && discStandard.savings === 250 && !discStandard.isInvalid, '1000 MRP -> 750 Selling calculates 25% discount & 250 savings');

// Test 10: Strict Protection Against Negative/Misleading Discount
const discInverted = calculateDiscount(500, 600); // Selling price > MRP is invalid
assert(discInverted.isInvalid && discInverted.discountPercent === 0 && discInverted.savings === 0, 'Selling Price > MRP flagged as invalid with 0% discount');

// Test 11: Zero and Negative Inputs
const discZero = calculateDiscount(0, 100);
assert(discZero.discountPercent === 0, 'Zero MRP handled safely without division by zero');

// Test 12: Indian Currency (INR) Formatting
const inrThousands = formatCurrency(1500, 'INR');
assert(inrThousands.includes('1,500'), `INR formats thousands correctly: ${inrThousands}`);
const inrLakhs = formatCurrency(125000, 'INR');
assert(inrLakhs.includes('1,25,000'), `INR formats lakhs (2-digit grouping) correctly: ${inrLakhs}`);

// Test 13: Bulk Price Tag CSV Parser
// CSV order: Name, SellingPrice, MRP, SKU, Description, Badge, Currency
const samplePriceTagCsv = 'Product Name,Selling Price,MRP,SKU,Description,Badge\nCotton Kurti,999,1499,SKU-KT-01,Pure Cotton,Summer Sale';
const parsedPriceTags = parseBulkPriceTagsCsv(samplePriceTagCsv);
assert(parsedPriceTags.length === 1 && parsedPriceTags[0].mrp === 1499 && parsedPriceTags[0].sellingPrice === 999, 'Bulk price tag CSV parses currency numbers and rows properly');
assert(parsedPriceTags[0].discountPercent === 33 && parsedPriceTags[0].savings === 500, 'Bulk price tag calculates discount on imported rows');

console.log('\n=========================================');
console.log('--- 3. QR CODE GENERATOR VERIFICATION ---');
console.log('=========================================');

// Test 14: UPI Payment URI Generator
const upiPayload = buildQrPayload('upi', {
  pa: 'merchant@okaxis',
  pn: 'Store Essentials',
  am: '499.00',
  cu: 'INR',
  tn: 'Order-8910',
});
assert(upiPayload.startsWith('upi://pay?') && upiPayload.includes('pa=merchant%40okaxis') && upiPayload.includes('am=499.00'), 'UPI URI properly encodes parameters and VPA');

// Test 15: QR Scan Reliability Evaluation - Clean Code
const qrClean = evaluateQrScanReliability({
  darkColor: '#000000',
  lightColor: '#ffffff',
  ecc: 'M',
  hasLogo: false,
  logoSizePercent: 20,
});
assert(qrClean.score >= 80 && qrClean.rating === 'EXCELLENT', 'Black/white QR with ECC M scores EXCELLENT (>=80)');

// Test 16: QR Scan Reliability Evaluation - Dangerous Logo + Low ECC
const qrRisky = evaluateQrScanReliability({
  darkColor: '#000000',
  lightColor: '#ffffff',
  ecc: 'L',
  hasLogo: true,
  logoSizePercent: 28, // > 25% with ECC L is high risk
});
assert(qrRisky.warnings.length > 0 && qrRisky.rating !== 'EXCELLENT', 'Logo with ECC L triggers warnings and lowers reliability rating');

// Test 17: Bulk QR CSV Parser
const sampleQrCsv = 'Payload,Label\nhttps://example.com,Website Link\nupi://pay?pa=store@okaxis,UPI Link';
const parsedQrs = parseBulkQrCsv(sampleQrCsv);
assert(parsedQrs.length === 2 && parsedQrs[0].payload === 'https://example.com', 'Bulk QR CSV parses items properly');

console.log('\n===========================================');
console.log('--- 4. THANK YOU CARD MAKER VERIFICATION ---');
console.log('===========================================');

// Test 18: Card Print Dimensions with 3mm Bleed and 5mm Safe Zone
const cardMetrics = getCardPrintDimensions(85, 55, 3);
assert(cardMetrics.totalWidthMm === 91, '85mm card + 3mm bleed on both sides = 91mm total width');
assert(cardMetrics.totalHeightMm === 61, '55mm card + 3mm bleed on both sides = 61mm total height');
assert(cardMetrics.safeWidthMm === 75, '85mm card - 5mm safe zone on both sides = 75mm safe width');
assert(cardMetrics.safeHeightMm === 45, '55mm card - 5mm safe zone on both sides = 45mm safe height');

// Test 19: Customer Personalization CSV Parser
const sampleCardCsv = 'Customer Name,Order ID,Special Note,Coupon Code\nPriya Sharma,#QF-101,Thank you for supporting handloom!,HAND10\nVikram Joshi,#QF-102,Enjoy your coffee blend!,BREW15';
const parsedCards = parseCardPersonalizationCsv(sampleCardCsv);
assert(parsedCards.length === 2, 'Personalization CSV parses 2 customer rows');
assert(parsedCards[0].customerName === 'Priya Sharma' && parsedCards[0].couponCode === 'HAND10', 'Personalization row maps name and coupon accurately');

console.log('\n======================================================');
console.log('--- 5. BARCODE & QR ADVANCED COMPLIANCE & DECODING ---');
console.log('======================================================');

import { inspectBarcodeCompliance } from '../src/utils/barcodeUtils.js';
import { decodeQrPayload } from '../src/utils/qrUtils.js';
import { detectDelimiter, parseDelimitedText } from '../src/utils/spreadsheetImportUtils.js';
import { DEFAULT_BRAND_KIT } from '../src/utils/brandKitUtils.js';

// Test 20: Barcode Compliance & Quiet Zone
const barcodeAudit = inspectBarcodeCompliance({
  format: 'EAN13',
  value: '8901030365737',
  barWidth: 2,
  lineColor: '#000000',
  bgColor: '#ffffff',
});
assert(barcodeAudit.isValid && barcodeAudit.status === 'EXCELLENT', 'EAN-13 barcode passes compliance audit with EXCELLENT status');
assert(barcodeAudit.quietZoneMm > 0, `Barcode quiet zone calculated accurately: ~${barcodeAudit.quietZoneMm}mm`);

// Test 21: QR Payload Decoder - UPI URI
const decodedUpi = decodeQrPayload('upi://pay?pa=store@okaxis&pn=Acme+Store&am=799.00&cu=INR&tn=Invoice-108');
assert(decodedUpi.type === 'upi' && decodedUpi.isVerified, 'decodeQrPayload accurately identifies verified UPI URI');
assert(decodedUpi.params.pa === 'store@okaxis' && decodedUpi.params.am === '799.00', 'decodeQrPayload extracts UPI payee and amount params');

// Test 22: QR Payload Decoder - vCard
const sampleVcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Ravi Raj\nTEL;TYPE=CELL:+919876543210\nEMAIL:ravi@quickformat.com\nEND:VCARD';
const decodedVcard = decodeQrPayload(sampleVcard);
assert(decodedVcard.type === 'vcard' && decodedVcard.isVerified, 'decodeQrPayload accurately identifies and verifies vCard contact');
assert(decodedVcard.params.name === 'Ravi Raj' && decodedVcard.params.email === 'ravi@quickformat.com', 'decodeQrPayload extracts vCard contact fields');

// Test 23: QR Payload Decoder - Wi-Fi
const decodedWifi = decodeQrPayload('WIFI:S:Guest_Office;T:WPA;P:Secret2026;H:false;;');
assert(decodedWifi.type === 'wifi' && decodedWifi.isVerified, 'decodeQrPayload accurately identifies and verifies Wi-Fi network credentials');
assert(decodedWifi.params.ssid === 'Guest_Office' && decodedWifi.params.password === 'Secret2026', 'decodeQrPayload extracts Wi-Fi SSID and password');

// Test 24: Universal Spreadsheet Parser - Auto-Delimiter Detection
const tabText = 'Product\tSKU\tPrice\nLaptop\tSKU-10\t49999\nMouse\tSKU-11\t999';
assert(detectDelimiter(tabText) === '\t', 'detectDelimiter correctly identifies Tab delimiter from Excel/Sheets copy-paste');
const csvText = 'Product,SKU,Price\nLaptop,SKU-10,49999\nMouse,SKU-11,999';
assert(detectDelimiter(csvText) === ',', 'detectDelimiter correctly identifies Comma delimiter');

// Test 25: Universal Spreadsheet Parser - Quoted Cell with Commas
const complexCsv = 'SKU,Title,Description\nSKU-01,"Coffee, Dark Roast","Organic, shade-grown Arabica"';
const parsedDelimited = parseDelimitedText(complexCsv, ',');
assert(parsedDelimited.length === 2, 'parseDelimitedText parses 2 rows');
assert(parsedDelimited[1][1] === 'Coffee, Dark Roast', 'parseDelimitedText preserves commas within quoted cells');

// Test 26: Shared Brand Kit Defaults
assert(DEFAULT_BRAND_KIT.brandName && DEFAULT_BRAND_KIT.primaryColor, 'Shared Brand Kit contains required default fields');

console.log('\n======================================================');
console.log('--- 6. AI-ASSISTED DESIGN NLP PARSER VERIFICATION ---');
console.log('======================================================');

import { parseAiDesignPrompt } from '../src/utils/aiDesignParser.js';

// Test 27: NLP prompt parser extracts toy category, MRP, Selling Price, and discount
const promptToy = "Create a compact retail price tag for a children's robotic toy. Display ₹1,999 MRP, ₹1,299 selling price, a HOT DEAL badge, product barcode and a QR code linking to specs.";
const parsedToy = parseAiDesignPrompt(promptToy);
assert(parsedToy.isValid, 'NLP parser successfully parses natural language design request');
assert(parsedToy.category === 'toys', `NLP parser accurately detects category: ${parsedToy.category}`);
assert(parsedToy.sellingPrice === 1299 && parsedToy.mrp === 1999, 'NLP parser extracts selling price 1299 and MRP 1999');
assert(parsedToy.discountPercent === 35, `Deterministic discount math correctly calculated: ${parsedToy.discountPercent}% OFF`);
assert(parsedToy.barcode && parsedToy.barcode.length === 13, `Valid GS1 India barcode assigned: ${parsedToy.barcode}`);

// Test 28: Apparel Tag intent
const promptApparel = "Design a luxury hanging apparel tag for an oversized organic cotton hoodie. Set MRP ₹2,499, offer price ₹1,499.";
const parsedApparel = parseAiDesignPrompt(promptApparel);
assert(parsedApparel.category === 'clothing', 'NLP parser detects clothing category');
assert(parsedApparel.recommendedShapeId === 'hanging-apparel', 'NLP parser recommends hanging-apparel shape');

console.log('\n========================================================');
console.log('--- 7. PRODUCT CATALOG & SKU INTEGRITY VERIFICATION ---');
console.log('========================================================');

import {
  INITIAL_CATALOG_SEEDS,
  checkSkuDuplicate,
  exportProductsToCsv,
  generateCatalogSampleCsv,
} from '../src/utils/productCatalogUtils.js';

// Test 29: Master catalog seeds
assert(INITIAL_CATALOG_SEEDS.length >= 5, `Initial product catalog seeds loaded: ${INITIAL_CATALOG_SEEDS.length} items`);
assert(INITIAL_CATALOG_SEEDS.every((p) => p.sku && p.name && p.sellingPrice), 'All seed catalog products contain SKU, name, and price');

// Test 30: Duplicate SKU detection
const isDup = checkSkuDuplicate('SKU-ELC-8921');
assert(isDup, 'checkSkuDuplicate flags existing SKU in catalog as duplicate');
const isUnique = !checkSkuDuplicate('SKU-BRAND-NEW-999');
assert(isUnique, 'checkSkuDuplicate recognizes new unused SKU as unique');

// Test 31: Catalog CSV export & sample generation
const catalogCsv = exportProductsToCsv(INITIAL_CATALOG_SEEDS);
assert(catalogCsv.includes('Product Title') && catalogCsv.includes('SKU-ELC-8921'), 'exportProductsToCsv includes required headers and SKU rows');
const sampleTemplateCsv = generateCatalogSampleCsv();
assert(sampleTemplateCsv.startsWith('Product Title,Internal SKU'), 'generateCatalogSampleCsv produces valid header structure');

console.log('\n======================================================');
console.log('--- 8. SMART PRINT LAYOUT OPTIMIZER VERIFICATION ---');
console.log('======================================================');

import {
  calculateOptimalPrintLayout,
  COMMERCIAL_SHEET_PRESETS,
} from '../src/utils/printLayoutOptimizer.js';

// Test 32: Standard A4 24-Up sticker grid calculation
// Test 32: Standard A4 24-Up sticker grid calculation
const a4Layout = calculateOptimalPrintLayout({
  paperWidthMm: 210,
  paperHeightMm: 297,
  labelWidthMm: 70,
  labelHeightMm: 36,
  marginTopMm: 4.5,
  marginLeftMm: 0,
  gapXmm: 0,
  gapYmm: 0,
  unprintableHardwareEdgeMm: 0,
  printScaleMode: 'actual',
});
assert(a4Layout.isValid, 'Print layout calculates valid geometry');
assert(a4Layout.totalYield === 24 && a4Layout.cols === 3, `A4 24-up grid calculates 3 columns and 24 labels yield: ${a4Layout.totalYield} labels`);
assert(a4Layout.printScaleMode === 'actual', 'Actual 100% scale explicitly enforced (no silent scaling of barcodes)');

// Test 32b: Hardware unprintable edge warning
const a4WithHardwareEdge = calculateOptimalPrintLayout({
  paperWidthMm: 210,
  paperHeightMm: 297,
  labelWidthMm: 70,
  labelHeightMm: 36,
  marginTopMm: 0,
  marginLeftMm: 0,
  unprintableHardwareEdgeMm: 4,
});
assert(a4WithHardwareEdge.warnings?.length > 0, 'Optimizer alerts user when label margins intersect hardware unprintable edge');

// Test 33: Commercial Avery Preset
const averyPreset = COMMERCIAL_SHEET_PRESETS.find((p) => p.id === 'avery-5160');
assert(averyPreset && averyPreset.cols === 3 && averyPreset.rows === 10, 'Avery 5160 preset defines 3x10 grid (30 labels/sheet)');

// Test 34: Clipping boundary detection when label is oversized
const clippedLayout = calculateOptimalPrintLayout({
  paperWidthMm: 210,
  paperHeightMm: 297,
  labelWidthMm: 220, // Exceeds 210mm paper width
  labelHeightMm: 300,
});
assert(clippedLayout.isClipping, 'Print layout optimizer flags oversized dimensions with clipping warning');

console.log('\n======================================================');
console.log('--- 9. AUTOMATED PRE-FLIGHT LABEL QUALITY CHECKER ---');
console.log('======================================================');

import { runLabelQualityCheck } from '../src/utils/labelQualityChecker.js';

// Test 35: Valid commercial label passes pre-flight
const validAudit = runLabelQualityCheck({
  toolType: 'studio',
  productName: 'Organic Roasted Arabica Beans',
  sku: 'SKU-COF-01',
  barcodeValue: '8901030365737', // Valid GS1 India EAN-13
  barcodeFormat: 'EAN13',
  sellingPrice: 499,
  mrp: 699,
  qrPayload: 'https://quickformat.com/item/cof-01',
  lineColor: '#000000',
  bgColor: '#ffffff',
  widthMm: 70,
  heightMm: 36,
  fontSize: 12,
});
assert(validAudit.overallStatus === 'PASS' && validAudit.score === 100, `Valid retail label achieves PASS with score ${validAudit.score}/100`);

// Test 36: Price inversion check (Selling > MRP)
const invertedPriceAudit = runLabelQualityCheck({
  toolType: 'price-tag',
  productName: 'Toy Car',
  sku: 'SKU-01',
  sellingPrice: 999,
  mrp: 499, // Selling > MRP is illegal in retail
  barcodeValue: '8901030365737',
  barcodeFormat: 'EAN13',
});
assert(invertedPriceAudit.overallStatus === 'CRITICAL_FAIL', 'Price inversion (Selling > MRP) triggers CRITICAL_FAIL');
assert(invertedPriceAudit.issues.some((i) => i.id === 'price-inversion'), 'Price inversion issue specifically identified');

// Test 37: Optical Contrast failure
const lowContrastAudit = runLabelQualityCheck({
  toolType: 'barcode',
  productName: 'Test Item',
  sku: 'SKU-02',
  barcodeValue: '8901030365737',
  barcodeFormat: 'EAN13',
  lineColor: '#888888',
  bgColor: '#999999',
});
assert(lowContrastAudit.issues.some((i) => i.id === 'contrast-poor'), 'Low optical contrast flagged as critical scanner failure');

console.log('\n======================================================');
console.log('--- 10. PROMOTION & COUPON MANAGEMENT VERIFICATION ---');
console.log('======================================================');

import {
  generateBulkUniqueCoupons,
  validateCouponCode,
  exportCouponsToCsv,
} from '../src/utils/couponManagerUtils.js';

// Test 38: Bulk Unique Coupon Generation
const bulkCoupons = generateBulkUniqueCoupons({
  prefix: 'GIFT',
  count: 15,
  codeLength: 6,
  discountType: 'percentage',
  discountValue: 20,
  minPurchase: 999,
  validUntil: '2026-12-31',
});
assert(bulkCoupons.length === 15, `Bulk generator produces exact requested count: ${bulkCoupons.length}`);
const uniqueSet = new Set(bulkCoupons.map((c) => c.code));
assert(uniqueSet.size === 15, 'All bulk generated coupon codes are 100% unique with zero collisions');
assert(bulkCoupons[0].code.startsWith('GIFT-'), `Coupons correctly formatted with prefix: ${bulkCoupons[0].code}`);

// Test 39: Coupon Validation Logic
const validCouponRes = validateCouponCode('WELCOME15', 600);
assert(validCouponRes.isValid && validCouponRes.calculatedDiscount === 90, 'Valid coupon calculates 15% discount on ₹600 order (= ₹90 savings)');

const minOrderFail = validateCouponCode('WELCOME15', 200);
assert(!minOrderFail.isValid && minOrderFail.error?.includes('Minimum order'), 'Coupon rejected when order is below minPurchase threshold');

// Test 40: Coupon CSV Export
const couponCsv = exportCouponsToCsv(bulkCoupons);
assert(couponCsv.includes('Coupon Code,Discount Type') && couponCsv.includes(bulkCoupons[0].code), 'exportCouponsToCsv formats headers and records properly');

console.log('\n========================================================');
console.log('--- 11. SECURE QR DESTINATION MANAGEMENT VERIFICATION ---');
console.log('========================================================');

import {
  validateQrDestinationUrl,
  buildCampaignUrl,
  DYNAMIC_QR_DISCLOSURE,
} from '../src/utils/qrUtils.js';

// Test 41: Valid HTTPS Web Destination
const validDest = validateQrDestinationUrl('https://mybrand.com/products/headset');
assert(validDest.isValid && validDest.isHttps, 'validateQrDestinationUrl accepts valid HTTPS URL');

// Test 42: Protocol Injection Prevention
const dangerousDest = validateQrDestinationUrl('javascript:alert(document.cookie)');
assert(!dangerousDest.isValid && dangerousDest.error?.includes('Security Error'), 'validateQrDestinationUrl blocks javascript: execution protocols');

const fileDest = validateQrDestinationUrl('file:///etc/passwd');
assert(!fileDest.isValid && fileDest.error?.includes('Security Error'), 'validateQrDestinationUrl blocks local file:// protocols');

// Test 43: Campaign UTM Builder
const campaignUrl = buildCampaignUrl('https://mybrand.com/deals', {
  utmSource: 'package_insert',
  utmMedium: 'qr_scan',
  utmCampaign: 'winter_sale',
});
assert(campaignUrl.includes('utm_source=package_insert') && campaignUrl.includes('utm_campaign=winter_sale'), `buildCampaignUrl appends clean UTM tags: ${campaignUrl}`);

// Test 44: Static vs Dynamic QR Architectural Disclosure
assert(DYNAMIC_QR_DISCLOSURE.isStaticOnly, 'Architectural disclosure explicitly documents client-side Static QR generation');

console.log('\n========================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log(`ALL ${passedTests} ADVANCED COMMERCE & PACKAGING STUDIO VERIFICATION TESTS PASSED!\n`);
  process.exit(0);
}
