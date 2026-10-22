/**
 * Test Suite for Price Tag Creator Enhancements:
 * 1. Regular MRP-Based Price Tag Creator
 * 2. E-Commerce Product Label Creator (Single & Bulk)
 * 3. Automatic Label Sheet Layout & Pagination Engine
 * 4. Multi-Page Print & Export Verification
 */

import { MRP_TAG_TEMPLATES, validateMrpTagInput, formatIndianCurrency } from '../src/utils/mrpTagUtils.js';
import {
  ECOMMERCE_LABEL_TYPES,
  guessColumnMapping,
  transformMappedRows,
  calculateTotalExpandedLabels,
  generateEcommerceSampleCsv,
} from '../src/utils/ecommerceLabelUtils.js';
import {
  PAPER_FORMATS,
  SHEET_PRESETS,
  calculateSheetArrangement,
} from '../src/utils/sheetLayoutEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('======================================================');
console.log('--- MODULE 1: REGULAR MRP PRICE TAG VERIFICATION ---');
console.log('======================================================');

// 1. Ready-Made MRP Templates
assert(MRP_TAG_TEMPLATES.length === 6, `6 ready-made MRP templates defined (found: ${MRP_TAG_TEMPLATES.length})`);
const minimalTmpl = MRP_TAG_TEMPLATES.find((t) => t.id === 'minimal-retail');
assert(minimalTmpl && minimalTmpl.defaults.mrp === 699, 'Minimal Retail Tag defines default MRP without requiring discount');

// 2. Regular MRP Tag Validation
const validMrpOnly = validateMrpTagInput({ mrp: 499, sellingPrice: '' });
assert(validMrpOnly.isValid, 'Regular MRP tag is valid with only MRP (no promotional discount required)');

const invalidZeroMrp = validateMrpTagInput({ mrp: 0 });
assert(!invalidZeroMrp.isValid && invalidZeroMrp.errors.some((e) => e.includes('greater than zero')), 'MRP <= 0 is rejected with validation error');

const validSellingPrice = validateMrpTagInput({ mrp: 1000, sellingPrice: 799 });
assert(validSellingPrice.isValid, 'Valid selling price below MRP is accepted');

const invalidSellingExceedsMrp = validateMrpTagInput({ mrp: 500, sellingPrice: 600 });
assert(!invalidSellingExceedsMrp.isValid && invalidSellingExceedsMrp.errors.some((e) => e.includes('cannot exceed MRP')), 'Selling price exceeding MRP is rejected by default');

const allowedSellingOverride = validateMrpTagInput({ mrp: 500, sellingPrice: 600, allowSellingAboveMrp: true });
assert(allowedSellingOverride.isValid, 'Selling price above MRP allowed when explicit override is configured');

// 3. Indian Currency Formatting
const formattedInr = formatIndianCurrency(125000);
assert(formattedInr.includes('1,25,000'), `Indian currency formats lakhs with ₹: ${formattedInr}`);

console.log('\n========================================================');
console.log('--- MODULE 2: E-COMMERCE PRODUCT LABEL VERIFICATION ---');
console.log('========================================================');

// 4. E-Commerce Label Types
assert(ECOMMERCE_LABEL_TYPES.length === 8, `8 distinct e-commerce label types defined (found: ${ECOMMERCE_LABEL_TYPES.length})`);
const shippingLabelType = ECOMMERCE_LABEL_TYPES.find((t) => t.id === 'shipping-label');
assert(shippingLabelType && shippingLabelType.fields.includes('awbNumber') && shippingLabelType.fields.includes('recipientAddress'), 'Shipping label type includes AWB and recipient address fields');

const barcodeOnlyType = ECOMMERCE_LABEL_TYPES.find((t) => t.id === 'barcode-only');
assert(barcodeOnlyType && !barcodeOnlyType.fields.includes('recipientAddress'), 'Barcode-only label does not include shipping fields');

// 5. Bulk Column Mapping Detection
const sampleHeaders = ['Product Name', 'SKU', 'Barcode', 'MRP', 'Selling Price', 'Quantity', 'Variant', 'Brand'];
const mapped = guessColumnMapping(sampleHeaders);
assert(mapped.productName === 'Product Name', 'Auto-detects productName column');
assert(mapped.sku === 'SKU', 'Auto-detects sku column');
assert(mapped.barcode === 'Barcode', 'Auto-detects barcode column');
assert(mapped.quantity === 'Quantity', 'Auto-detects quantity column');

// 6. Bulk Copy Multiplier Calculation
const sampleRows = [
  ['Toy Car', 'TOY001', '8901234567890', '299', '249', '5', 'Red', 'BrandA'],
  ['Building Blocks', 'TOY002', '8901234567891', '499', '399', '3', 'Blocks', 'BrandB'],
  ['Toy Robot', 'TOY003', '8901234567892', '799', '699', '2', 'Blue', 'BrandC'],
];
const transformed = transformMappedRows(sampleHeaders, sampleRows, mapped);
assert(transformed.length === 3, 'Transforms 3 product rows');
const totalExpanded = calculateTotalExpandedLabels(transformed);
assert(totalExpanded === 10, `Copy multiplier generates exact requested label total: 5 + 3 + 2 = ${totalExpanded} labels (expected 10)`);

// 7. Duplicate SKU Detection
const rowsWithDuplicate = [
  ['Item 1', 'SKU-DUP', '890111', '100', '', '1'],
  ['Item 2', 'SKU-DUP', '890222', '200', '', '1'],
];
const transformedDuplicates = transformMappedRows(['Name', 'SKU', 'Barcode', 'MRP', 'Selling', 'Qty'], rowsWithDuplicate, { productName: 'Name', sku: 'SKU' });
assert(!transformedDuplicates[1].isValid && transformedDuplicates[1].errors.some((e) => e.includes('Duplicate SKU')), 'Flags duplicate SKU as a validation issue');

console.log('\n======================================================');
console.log('--- MODULE 3: AUTOMATIC SHEET LAYOUT ENGINE ---');
console.log('======================================================');

// 8. Standard Sheet Presets
assert(SHEET_PRESETS.length >= 7, `Defines standard commercial sheet presets (found: ${SHEET_PRESETS.length})`);
const a4_24 = SHEET_PRESETS.find((p) => p.id === 'a4-24up');
assert(a4_24 && a4_24.cols === 3 && a4_24.rows === 8, 'A4 24-Up preset defines 3 cols × 8 rows (24 labels/sheet)');

const avery5160 = SHEET_PRESETS.find((p) => p.id === 'avery-5160');
assert(avery5160 && avery5160.cols === 3 && avery5160.rows === 10, 'Avery 5160 preset defines 3 cols × 10 rows (30 labels/sheet)');

// 9. Multi-Page Pagination with Copy Multiplier
// When 10 labels are placed onto a 2x3 grid (capacity 6), it must produce Page 1 (6 labels) and Page 2 (4 labels)
const layoutMultiPage = calculateSheetArrangement({
  paperFormatId: 'a4',
  cols: 2,
  rows: 3, // capacity = 6 per page
  labelWidthMm: 80,
  labelHeightMm: 70,
  items: transformed, // 10 labels total
});
assert(layoutMultiPage.totalLabels === 10, 'Layout engine expands items to 10 total labels');
assert(layoutMultiPage.capacityPerPage === 6, 'Capacity per page is 6 labels');
assert(layoutMultiPage.totalPages === 2, 'Paginates 10 labels across 2 pages');
assert(layoutMultiPage.pages[0].labels.length === 6, 'Page 1 contains 6 labels');
assert(layoutMultiPage.pages[1].labels.length === 4, 'Page 2 contains remaining 4 labels');
assert(layoutMultiPage.pages[1].emptySlots === 2, 'Page 2 reports 2 empty slots on final sheet');

// 10. Label Coordinates and Non-Overlap Verification
const page1Labels = layoutMultiPage.pages[0].labels;
const firstLabel = page1Labels[0];
const secondLabel = page1Labels[1];
assert(secondLabel.xMm > firstLabel.xMm, 'Labels placed sequentially without overlapping in X dimension');
assert(page1Labels.every((l) => l.xMm + l.widthMm <= layoutMultiPage.paperWidthMm), 'All labels fit within printable paper width');
assert(page1Labels.every((l) => l.yMm + l.heightMm <= layoutMultiPage.paperHeightMm), 'All labels fit within printable paper height');

// 11. Reading Order: Column-First vs Row-First
const layoutColFirst = calculateSheetArrangement({
  paperFormatId: 'a4',
  cols: 3,
  rows: 3,
  labelWidthMm: 50,
  labelHeightMm: 50,
  readingOrder: 'col-first',
  items: transformed,
});
assert(layoutColFirst.pages[0].labels[1].col === 0 && layoutColFirst.pages[0].labels[1].row === 1, 'Column-first order places second item at row 1, col 0');

// 12. Clipping Warning when Grid Exceeds Bounds
const oversizedLayout = calculateSheetArrangement({
  paperFormatId: 'a4',
  cols: 5,
  rows: 8,
  labelWidthMm: 60, // 5 * 60 = 300mm > 210mm A4 width!
  labelHeightMm: 40,
  items: transformed,
});
assert(oversizedLayout.warnings.length > 0 && oversizedLayout.warnings.some((w) => w.includes('exceeds')), 'Warns when grid dimensions exceed physical paper width');

console.log('\n========================================');
console.log(`TOTAL ENHANCEMENT TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
}
