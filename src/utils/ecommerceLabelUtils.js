/**
 * E-Commerce Product Label Creator Utilities
 * Supports 8 distinct label types (product ID, inventory, shipping, barcode, return, etc.),
 * single & bulk generation, Excel (.xlsx) / CSV file parsing, and column mapping.
 */
import * as XLSX from 'xlsx';
import { detectDelimiter, parseDelimitedText } from './spreadsheetImportUtils.js';

export const ECOMMERCE_LABEL_TYPES = [
  {
    id: 'product-id',
    name: 'Product Identification Label',
    description: 'Standard retail box & polybag label with Name, SKU, Barcode & Price',
    defaultWidthMm: 50,
    defaultHeightMm: 30,
    fields: ['productName', 'sku', 'barcode', 'variant', 'mrp', 'brand', 'origin', 'quantity'],
  },
  {
    id: 'sku-inventory',
    name: 'SKU / Inventory Label',
    description: 'Warehouse bin & rack barcode sticker with high-density identification',
    defaultWidthMm: 50,
    defaultHeightMm: 25,
    fields: ['sku', 'productName', 'barcode', 'variant', 'brand', 'quantity'],
  },
  {
    id: 'barcode-only',
    name: 'Barcode Label (EAN / UPC / Code 128)',
    description: 'Minimalistic scanner-optimized label focused solely on barcode readability',
    defaultWidthMm: 40,
    defaultHeightMm: 20,
    fields: ['barcode', 'sku', 'productName', 'mrp', 'quantity'],
  },
  {
    id: 'qr-product',
    name: 'QR Code Product Label',
    description: 'Interactive smart packaging label linking to user manual, warranty, or catalog',
    defaultWidthMm: 45,
    defaultHeightMm: 45,
    fields: ['productName', 'sku', 'qrPayload', 'brand', 'customText', 'quantity'],
  },
  {
    id: 'shipping-label',
    name: 'Shipping Label',
    description: 'Parcel delivery label with To/From addresses, AWB / Order ID & PIN code',
    defaultWidthMm: 100,
    defaultHeightMm: 150,
    fields: [
      'orderId',
      'awbNumber',
      'recipientName',
      'recipientAddress',
      'recipientCity',
      'recipientState',
      'recipientPincode',
      'recipientPhone',
      'senderName',
      'senderAddress',
      'senderPhone',
      'weight',
      'productName',
      'barcode',
      'quantity',
    ],
  },
  {
    id: 'return-address',
    name: 'Return Address Label',
    description: 'Compact return dispatch sticker for RMA and reverse logistics',
    defaultWidthMm: 70,
    defaultHeightMm: 35,
    fields: ['senderName', 'senderAddress', 'senderPhone', 'orderId', 'customText', 'quantity'],
  },
  {
    id: 'package-id',
    name: 'Package Identification Label',
    description: 'Master carton & multi-pack identifier showing box count and gross weight',
    defaultWidthMm: 100,
    defaultHeightMm: 75,
    fields: ['brand', 'productName', 'sku', 'orderId', 'weight', 'origin', 'barcode', 'customText', 'quantity'],
  },
  {
    id: 'custom-ecommerce',
    name: 'Custom E-commerce Label',
    description: 'Fully flexible custom layout with user-defined fields and dimensions',
    defaultWidthMm: 60,
    defaultHeightMm: 40,
    fields: ['productName', 'sku', 'barcode', 'mrp', 'sellingPrice', 'brand', 'variant', 'customText', 'quantity'],
  },
];

/**
 * Generates sample CSV text for bulk e-commerce labels.
 */
export function generateEcommerceSampleCsv() {
  return [
    'Product Name,SKU,Barcode,MRP,Selling Price,Quantity,Variant,Brand,Weight,Origin',
    'Toy Car Diecast Racing,TOY-CAR-01,8901234567890,299,249,5,Red / 1:64 Scale,Speedster Toys,120g,India',
    'Magnetic Building Blocks,TOY-BLK-02,8901234567891,499,399,3,64 Pieces Multi-Color,SparkCraft,450g,India',
    'Programmable Toy Robot,TOY-ROB-03,8901234567892,799,699,2,Blue / USB Rechargeable,RoboKits,380g,India',
    'Kids Watercolor Set,TOY-ART-04,8901234567893,199,149,4,24 Vibrant Cakes + Brush,ColorJoy,150g,India',
  ].join('\n');
}

/**
 * Parses uploaded spreadsheet file (Excel .xlsx, .xls, or CSV/TSV text).
 * Returns array of objects with headers, rows, and raw items.
 */
export async function parseSpreadsheetFile(file) {
  const fileName = file.name.toLowerCase();

  // Excel binary parsing (.xlsx, .xls)
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!rawRows || rawRows.length === 0) {
      throw new Error('Spreadsheet appears to be empty.');
    }

    const headers = rawRows[0].map((h, i) => String(h || `Column ${i + 1}`).trim());
    const dataRows = rawRows.slice(1).filter((row) => row.some((cell) => String(cell).trim() !== ''));

    return {
      fileName: file.name,
      fileType: 'excel',
      headers,
      dataRows,
      totalRows: dataRows.length,
    };
  }

  // Text / CSV parsing (.csv, .tsv, .txt)
  const text = await file.text();
  const rawRows = parseDelimitedText(text);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('CSV file contains no readable data.');
  }

  const headers = rawRows[0].map((h, i) => String(h || `Column ${i + 1}`).trim());
  const dataRows = rawRows.slice(1).filter((row) => row.some((cell) => String(cell).trim() !== ''));

  return {
    fileName: file.name,
    fileType: 'csv',
    headers,
    dataRows,
    totalRows: dataRows.length,
  };
}

/**
 * Auto-detects column mapping between spreadsheet headers and label fields.
 */
export function guessColumnMapping(headers) {
  const mapping = {
    productName: '',
    sku: '',
    barcode: '',
    mrp: '',
    sellingPrice: '',
    quantity: '',
    variant: '',
    brand: '',
    weight: '',
    origin: '',
    orderId: '',
    recipientName: '',
    recipientAddress: '',
    recipientPincode: '',
  };

  headers.forEach((header) => {
    const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!mapping.productName && (h.includes('name') || h.includes('product') || h.includes('title') || h.includes('item'))) {
      mapping.productName = header;
    } else if (!mapping.sku && (h.includes('sku') || h.includes('code') || h.includes('partno'))) {
      mapping.sku = header;
    } else if (!mapping.barcode && (h.includes('barcode') || h.includes('ean') || h.includes('upc') || h.includes('gtin'))) {
      mapping.barcode = header;
    } else if (!mapping.mrp && (h.includes('mrp') || h.includes('retailprice') || h.includes('listprice'))) {
      mapping.mrp = header;
    } else if (!mapping.sellingPrice && (h.includes('selling') || h.includes('price') || h.includes('offerprice') || h.includes('deal'))) {
      mapping.sellingPrice = header;
    } else if (!mapping.quantity && (h.includes('qty') || h.includes('quantity') || h.includes('copies') || h.includes('count'))) {
      mapping.quantity = header;
    } else if (!mapping.variant && (h.includes('variant') || h.includes('size') || h.includes('color') || h.includes('model'))) {
      mapping.variant = header;
    } else if (!mapping.brand && (h.includes('brand') || h.includes('mfg') || h.includes('manufacturer'))) {
      mapping.brand = header;
    } else if (!mapping.weight && (h.includes('weight') || h.includes('wt') || h.includes('grams') || h.includes('kg'))) {
      mapping.weight = header;
    } else if (!mapping.origin && (h.includes('origin') || h.includes('country') || h.includes('madein'))) {
      mapping.origin = header;
    } else if (!mapping.orderId && (h.includes('order') || h.includes('awb') || h.includes('tracking') || h.includes('shipment'))) {
      mapping.orderId = header;
    }
  });

  return mapping;
}

/**
 * Transforms spreadsheet rows into validated label items according to column mapping.
 */
export function transformMappedRows(headers, dataRows, mapping) {
  const getColIndex = (headerName) => (headerName ? headers.indexOf(headerName) : -1);

  const idxMap = {
    productName: getColIndex(mapping.productName),
    sku: getColIndex(mapping.sku),
    barcode: getColIndex(mapping.barcode),
    mrp: getColIndex(mapping.mrp),
    sellingPrice: getColIndex(mapping.sellingPrice),
    quantity: getColIndex(mapping.quantity),
    variant: getColIndex(mapping.variant),
    brand: getColIndex(mapping.brand),
    weight: getColIndex(mapping.weight),
    origin: getColIndex(mapping.origin),
    orderId: getColIndex(mapping.orderId),
    recipientName: getColIndex(mapping.recipientName),
    recipientAddress: getColIndex(mapping.recipientAddress),
    recipientPincode: getColIndex(mapping.recipientPincode),
  };

  const seenSkus = new Set();

  return dataRows.map((row, rowIdx) => {
    const getVal = (idx) => (idx !== -1 && row[idx] !== undefined ? String(row[idx]).trim() : '');

    const productName = getVal(idxMap.productName) || `Product ${rowIdx + 1}`;
    const sku = getVal(idxMap.sku) || `SKU-${1000 + rowIdx}`;
    const barcode = getVal(idxMap.barcode) || sku;
    const rawMrp = parseFloat(getVal(idxMap.mrp).replace(/[^0-9.]/g, ''));
    const mrp = isNaN(rawMrp) ? 0 : rawMrp;
    const rawSelling = parseFloat(getVal(idxMap.sellingPrice).replace(/[^0-9.]/g, ''));
    const sellingPrice = isNaN(rawSelling) ? '' : rawSelling;
    const rawQty = parseInt(getVal(idxMap.quantity).replace(/[^0-9]/g, ''), 10);
    const quantity = isNaN(rawQty) || rawQty <= 0 ? 1 : rawQty;
    const variant = getVal(idxMap.variant);
    const brand = getVal(idxMap.brand);
    const weight = getVal(idxMap.weight);
    const origin = getVal(idxMap.origin) || 'India';
    const orderId = getVal(idxMap.orderId);
    const recipientName = getVal(idxMap.recipientName);
    const recipientAddress = getVal(idxMap.recipientAddress);
    const recipientPincode = getVal(idxMap.recipientPincode);

    const errors = [];
    if (!productName) errors.push('Missing product name');
    if (seenSkus.has(sku)) {
      errors.push(`Duplicate SKU detected: ${sku}`);
    }
    seenSkus.add(sku);

    return {
      id: `lbl-${rowIdx}-${sku}`,
      rowNumber: rowIdx + 1,
      productName,
      sku,
      barcode,
      mrp,
      sellingPrice,
      quantity,
      variant,
      brand,
      weight,
      origin,
      orderId,
      recipientName,
      recipientAddress,
      recipientPincode,
      selected: true,
      isValid: errors.length === 0,
      errors,
    };
  });
}

/**
 * Calculates total expanded label instances accounting for copy multipliers.
 */
export function calculateTotalExpandedLabels(items) {
  return items
    .filter((item) => item.selected !== false)
    .reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
}
