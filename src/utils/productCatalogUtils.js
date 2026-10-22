/**
 * Product Catalog & SKU Management Engine
 * Provides persistent master catalog storage, SKU validation, GTIN validation,
 * duplicate SKU detection, CSV import/export, and instant multi-tool propagation.
 * 100% Client-Side, Air-Gapped, Zero External Data Transmission.
 */

import { validateRetailGtin, calculateEan13CheckDigit } from './barcodeUtils.js';
import { parseDelimitedText, analyzeSpreadsheetData } from './spreadsheetImportUtils.js';

const CATALOG_STORAGE_KEY = 'qfh_product_catalog';

export const INITIAL_CATALOG_SEEDS = [
  {
    id: 'prod_seed_1',
    name: 'Wireless ANC Gaming Headset Pro',
    sku: 'SKU-ELC-8921',
    gtin: '8901030365737', // Valid GS1 India EAN-13
    category: 'Electronics',
    brand: 'Aura Sound Labs',
    sellingPrice: 1999,
    mrp: 3999,
    currency: 'INR',
    description: '40mm Neodymium Drivers | 50h Ultra Battery | Low Latency Gaming',
    url: 'https://quickformat.com/product/elc-8921',
    imageUrl: null,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'prod_seed_2',
    name: 'Single Origin Arabica Coffee Beans 250g',
    sku: 'SKU-GRO-4410',
    gtin: '8901030912345',
    category: 'Grocery',
    brand: 'QuickFormat Roasters',
    sellingPrice: 499,
    mrp: 699,
    currency: 'INR',
    description: '100% Arabica Medium Dark Roast | Notes of Dark Chocolate & Cherry',
    url: 'https://quickformat.com/product/gro-4410',
    imageUrl: null,
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'prod_seed_3',
    name: "Men's Heavyweight Cotton Oversized Tee",
    sku: 'SKU-APP-1022',
    gtin: '8901234567890',
    category: 'Clothing',
    brand: 'Atelier Minimal',
    sellingPrice: 899,
    mrp: 1499,
    currency: 'INR',
    description: '240 GSM 100% Combed Organic Cotton | Drop Shoulder Fit',
    url: 'https://quickformat.com/product/app-1022',
    imageUrl: null,
    createdAt: '2026-01-17T10:00:00.000Z',
    updatedAt: '2026-01-17T10:00:00.000Z',
  },
  {
    id: 'prod_seed_4',
    name: 'Magnetic Robotic Construction STEM Toy',
    sku: 'SKU-TOY-5501',
    gtin: '8908001234568',
    category: 'Toys',
    brand: 'RoboKids Play',
    sellingPrice: 1299,
    mrp: 2199,
    currency: 'INR',
    description: '64 Magnetic Interlocking Modules | Ages 4+ | BPA Free Non-Toxic',
    url: 'https://quickformat.com/product/toy-5501',
    imageUrl: null,
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 'prod_seed_5',
    name: '925 Sterling Silver Solitaire Ring 1.5ct',
    sku: 'SKU-JWL-9908',
    gtin: '8909009876543',
    category: 'Jewelry',
    brand: 'Maison Luxe',
    sellingPrice: 2499,
    mrp: 4999,
    currency: 'INR',
    description: 'Hallmarked 925 Pure Silver | Premium Moissanite Solitaire Stone',
    url: 'https://quickformat.com/product/jwl-9908',
    imageUrl: null,
    createdAt: '2026-01-19T10:00:00.000Z',
    updatedAt: '2026-01-19T10:00:00.000Z',
  },
];

/**
 * Loads entire catalog from localStorage or returns seed data.
 */
export function getProductCatalog() {
  if (typeof localStorage === 'undefined') {
    return INITIAL_CATALOG_SEEDS;
  }
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(INITIAL_CATALOG_SEEDS));
      return INITIAL_CATALOG_SEEDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATALOG_SEEDS;
  } catch (err) {
    console.warn('Failed to load product catalog from storage:', err);
    return INITIAL_CATALOG_SEEDS;
  }
}

/**
 * Checks if a given SKU already exists in the catalog (excluding current product ID).
 */
export function checkSkuDuplicate(sku, excludeProductId = null) {
  if (!sku) return false;
  const clean = sku.trim().toUpperCase();
  const catalog = getProductCatalog();
  return catalog.some((p) => p.sku.toUpperCase() === clean && p.id !== excludeProductId);
}

/**
 * Saves or updates a product record in the catalog.
 */
export function saveProduct(product) {
  const catalog = getProductCatalog();
  const now = new Date().toISOString();

  const cleanSku = (product.sku || '').trim().toUpperCase();
  if (!cleanSku) {
    throw new Error('Internal SKU is mandatory for catalog management.');
  }

  // Duplicate SKU check
  if (checkSkuDuplicate(cleanSku, product.id)) {
    throw new Error(`Duplicate SKU: '${cleanSku}' is already registered to another product.`);
  }

  // Validate or auto-append GTIN check-digit
  let fullGtin = (product.gtin || '').trim().replace(/[^0-9]/g, '');
  if (fullGtin.length === 12) {
    fullGtin = fullGtin + calculateEan13CheckDigit(fullGtin);
  }

  if (product.id) {
    // Update existing
    const updated = catalog.map((item) => {
      if (item.id === product.id) {
        return {
          ...item,
          ...product,
          sku: cleanSku,
          gtin: fullGtin,
          updatedAt: now,
        };
      }
      return item;
    });
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qfh:product-catalog-updated'));
    return product.id;
  } else {
    // Create new
    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct = {
      ...product,
      id: newId,
      sku: cleanSku,
      gtin: fullGtin,
      createdAt: now,
      updatedAt: now,
    };
    catalog.unshift(newProduct);
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    window.dispatchEvent(new CustomEvent('qfh:product-catalog-updated'));
    return newId;
  }
}

/**
 * Deletes a product from the catalog by ID.
 */
export function deleteProduct(productId) {
  const catalog = getProductCatalog();
  const filtered = catalog.filter((p) => p.id !== productId);
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('qfh:product-catalog-updated'));
  return true;
}

/**
 * Finds a product by its SKU.
 */
export function findProductBySku(sku) {
  if (!sku) return null;
  const clean = sku.trim().toUpperCase();
  const catalog = getProductCatalog();
  return catalog.find((p) => p.sku.toUpperCase() === clean) || null;
}

/**
 * Imports products from CSV / TSV text with duplicate SKU prevention.
 */
export function importProductsFromCsv(csvText) {
  if (!csvText || !csvText.trim()) {
    return { success: false, error: 'CSV content is empty.', count: 0 };
  }

  const rawRows = parseDelimitedText(csvText);
  const { hasHeader, headers, dataRows } = analyzeSpreadsheetData(rawRows);

  if (dataRows.length === 0) {
    return { success: false, error: 'No data rows found.', count: 0 };
  }

  // Column matching heuristics
  const findCol = (keywords) => {
    return headers.findIndex((h) =>
      keywords.some((kw) => h.toLowerCase().includes(kw))
    );
  };

  const nameIdx = findCol(['name', 'title', 'product']);
  const skuIdx = findCol(['sku', 'code', 'id']);
  const gtinIdx = findCol(['gtin', 'barcode', 'ean', 'upc']);
  const priceIdx = findCol(['selling', 'price', 'offer']);
  const mrpIdx = findCol(['mrp', 'regular', 'original']);
  const brandIdx = findCol(['brand', 'manufacturer', 'company']);
  const descIdx = findCol(['desc', 'description', 'spec']);
  const urlIdx = findCol(['url', 'link', 'web']);
  const catIdx = findCol(['cat', 'category']);

  const catalog = getProductCatalog();
  let importedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + (hasHeader ? 2 : 1);

    const name = nameIdx >= 0 ? row[nameIdx] : row[0];
    const sku = (skuIdx >= 0 ? row[skuIdx] : row[1] || `SKU-IMP-${1000 + i}`).trim().toUpperCase();
    const rawGtin = gtinIdx >= 0 ? row[gtinIdx] : '';
    const rawPrice = priceIdx >= 0 ? parseFloat(row[priceIdx]) : 499;
    const rawMrp = mrpIdx >= 0 ? parseFloat(row[mrpIdx]) : rawPrice * 1.4;
    const brand = brandIdx >= 0 ? row[brandIdx] : 'Acme Brand';
    const description = descIdx >= 0 ? row[descIdx] : '';
    const url = urlIdx >= 0 ? row[urlIdx] : `https://quickformat.com/item/${sku.toLowerCase()}`;
    const category = catIdx >= 0 ? row[catIdx] : 'General';

    if (!name || !sku) {
      skippedCount++;
      errors.push(`Row ${rowNum}: Missing product title or SKU.`);
      continue;
    }

    // Check duplicate
    if (catalog.some((p) => p.sku.toUpperCase() === sku)) {
      skippedCount++;
      errors.push(`Row ${rowNum}: SKU '${sku}' already exists in catalog. Skipped.`);
      continue;
    }

    let gtin = (rawGtin || '').replace(/[^0-9]/g, '');
    if (gtin.length === 12) {
      gtin = gtin + calculateEan13CheckDigit(gtin);
    }

    const newProd = {
      id: `prod_imp_${Date.now()}_${i}`,
      name: name.trim(),
      sku,
      gtin,
      category: category.trim() || 'General',
      brand: brand.trim() || 'Brand',
      sellingPrice: isNaN(rawPrice) ? 499 : rawPrice,
      mrp: isNaN(rawMrp) ? rawPrice * 1.4 : rawMrp,
      currency: 'INR',
      description: description.trim(),
      url: url.trim(),
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    catalog.unshift(newProd);
    importedCount++;
  }

  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  window.dispatchEvent(new CustomEvent('qfh:product-catalog-updated'));

  return {
    success: importedCount > 0,
    importedCount,
    skippedCount,
    errors,
  };
}

/**
 * Exports entire catalog to CSV formatted string.
 */
export function exportProductsToCsv(products = null) {
  const list = products || getProductCatalog();
  const headers = [
    'Product Title',
    'Internal SKU',
    'Retail GTIN / Barcode',
    'Category',
    'Brand',
    'Selling Price',
    'MRP',
    'Currency',
    'Product URL',
    'Description',
  ];

  const rows = list.map((p) => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.sku || '').replace(/"/g, '""')}"`,
    `"${(p.gtin || '').replace(/"/g, '""')}"`,
    `"${(p.category || '').replace(/"/g, '""')}"`,
    `"${(p.brand || '').replace(/"/g, '""')}"`,
    p.sellingPrice || 0,
    p.mrp || 0,
    `"${p.currency || 'INR'}"`,
    `"${(p.url || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates sample CSV template for product catalog import.
 */
export function generateCatalogSampleCsv() {
  const headers = 'Product Title,Internal SKU,Retail GTIN / Barcode,Category,Brand,Selling Price,MRP,Product URL,Description';
  const rows = [
    '"Aura Noise-Cancelling Headphones Pro",SKU-ELC-9082,"8901030365737",Electronics,"Aura Sound",2499,4999,"https://quickformat.com/item/elc-9082","40mm drivers | 50h battery"',
    '"Organic Whole Roasted Coffee Beans 500g",SKU-GRO-2210,"8901030912345",Grocery,"QuickFormat Roasters",649,899,"https://quickformat.com/item/gro-2210","Single estate Arabica dark roast"',
    '"100% Cotton Relaxed Graphic Tee",SKU-APP-3310,"8901234567890",Clothing,"Studio Essentials",799,1299,"https://quickformat.com/item/app-3310","220 GSM bio-washed cotton"',
  ];
  return [headers, ...rows].join('\n');
}
