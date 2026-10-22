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

console.log('\n========================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL 39 ADVANCED COMMERCE SUITE VERIFICATION TESTS PASSED!\n');
  process.exit(0);
}
