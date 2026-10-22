import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Package,
  Barcode as BarcodeIcon,
  QrCode,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  X,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  ECOMMERCE_LABEL_TYPES,
  generateEcommerceSampleCsv,
  parseSpreadsheetFile,
  guessColumnMapping,
  transformMappedRows,
  calculateTotalExpandedLabels,
} from '../../../utils/ecommerceLabelUtils';
import { formatIndianCurrency } from '../../../utils/mrpTagUtils';
import { downloadCsv } from '../../../utils/exportUtils';
import { useToast } from '../../../context/ToastContext';

export function EcommerceLabelsModule({
  labelState,
  setLabelState,
  bulkProducts,
  setBulkProducts,
  onPrintSingle,
  onDownloadPng,
  onDownloadPdf,
  onSendBulkToSheet,
}) {
  const toast = useToast();
  const [subMode, setSubMode] = useState('single'); // 'single' | 'bulk'
  const [selectedTypeId, setSelectedTypeId] = useState('product-id');
  const [searchFilter, setSearchFilter] = useState('');
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [importedSpreadsheet, setImportedSpreadsheet] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});

  const barcodeCanvasRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const labelCardRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentType = ECOMMERCE_LABEL_TYPES.find((t) => t.id === selectedTypeId) || ECOMMERCE_LABEL_TYPES[0];

  // Active single item fields
  const {
    productName = 'Toy Car Diecast Racing',
    sku = 'TOY-CAR-01',
    barcode = '8901234567890',
    mrp = 299,
    sellingPrice = 249,
    quantity = 1,
    variant = 'Red / 1:64 Scale',
    brand = 'Speedster Toys',
    weight = '120g',
    origin = 'India',
    customText = 'Non-toxic paint • Ages 3+',
    orderId = 'ORD-2026-9812',
    awbNumber = 'AWB-789012345',
    recipientName = 'Rahul Sharma',
    recipientAddress = 'Flat 402, Lotus Tower, MG Road',
    recipientCity = 'Bengaluru',
    recipientState = 'Karnataka',
    recipientPincode = '560001',
    recipientPhone = '+91 98765 43210',
    senderName = 'QuickFormat Hub Fulfillment',
    senderAddress = 'Plot 18, Electronic City Phase 1',
    senderPhone = '+91 80 4123 4567',
    widthMm = 50,
    heightMm = 30,
    fontFamily = 'sans-serif',
    showBorders = true,
  } = labelState;

  // Render barcode for single preview
  useEffect(() => {
    if (barcodeCanvasRef.current && (barcode || sku)) {
      try {
        JsBarcode(barcodeCanvasRef.current, String(barcode || sku || '8901234567890'), {
          format: 'CODE128',
          width: 1.1,
          height: 22,
          displayValue: true,
          fontSize: 8,
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch (err) {
        console.warn('Barcode render error', err);
      }
    }
  }, [barcode, sku, selectedTypeId]);

  // Render QR for single preview
  useEffect(() => {
    if (qrCanvasRef.current && (orderId || sku || barcode)) {
      try {
        const payload =
          selectedTypeId === 'shipping-label'
            ? `AWB:${awbNumber}|ORD:${orderId}|PIN:${recipientPincode}`
            : `SKU:${sku}|${productName}|₹${mrp}`;

        QRCode.toCanvas(qrCanvasRef.current, payload, {
          width: 44,
          margin: 0,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch (err) {
        console.warn('QR render error', err);
      }
    }
  }, [selectedTypeId, orderId, awbNumber, recipientPincode, sku, productName, mrp, barcode]);

  // Handle label type switch
  const handleSelectType = (typeId) => {
    setSelectedTypeId(typeId);
    const typeObj = ECOMMERCE_LABEL_TYPES.find((t) => t.id === typeId);
    if (typeObj) {
      setLabelState((prev) => ({
        ...prev,
        widthMm: typeObj.defaultWidthMm,
        heightMm: typeObj.defaultHeightMm,
      }));
    }
  };

  // Upload file handler (Excel or CSV)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseSpreadsheetFile(file);
      setImportedSpreadsheet(parsed);
      const guessed = guessColumnMapping(parsed.headers);
      setColumnMapping(guessed);
      setIsMappingModalOpen(true);
      toast.success(`Loaded ${parsed.fileName} (${parsed.totalRows} rows)`);
    } catch (err) {
      toast.error(err.message || 'Failed to parse file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirm mapping from modal
  const handleConfirmMapping = () => {
    if (!importedSpreadsheet) return;
    const transformed = transformMappedRows(
      importedSpreadsheet.headers,
      importedSpreadsheet.dataRows,
      columnMapping
    );
    setBulkProducts(transformed);
    setIsMappingModalOpen(false);
    toast.success(`Imported ${transformed.length} products ready for labeling!`);
  };

  // Add a manual blank product row in table
  const handleAddManualRow = () => {
    const newRow = {
      id: `lbl-${Date.now()}`,
      rowNumber: bulkProducts.length + 1,
      productName: 'New Product Item',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `890${Date.now().toString().slice(-10)}`,
      mrp: 499,
      sellingPrice: 399,
      quantity: 1,
      variant: 'Standard',
      brand: 'My Brand',
      weight: '100g',
      origin: 'India',
      selected: true,
      isValid: true,
      errors: [],
    };
    setBulkProducts((prev) => [newRow, ...prev]);
  };

  // Update a field in a bulk row
  const handleUpdateRowField = (id, field, value) => {
    setBulkProducts((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Toggle selection
  const handleToggleSelectRow = (id) => {
    setBulkProducts((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row))
    );
  };

  // Delete row
  const handleDeleteRow = (id) => {
    setBulkProducts((prev) => prev.filter((row) => row.id !== id));
  };

  // Filtered rows
  const filteredBulkRows = useMemo(() => {
    if (!searchFilter) return bulkProducts;
    const q = searchFilter.toLowerCase();
    return bulkProducts.filter(
      (p) =>
        (p.productName && p.productName.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [bulkProducts, searchFilter]);

  const totalExpandedCount = useMemo(() => {
    return calculateTotalExpandedLabels(bulkProducts);
  }, [bulkProducts]);

  return (
    <div className="space-y-4">
      {/* 1. Selectable 8 Label Types Header */}
      <div className="bg-white dark:bg-[#0c1220] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Package className="w-3.5 h-3.5 text-sky-500" />
            <span>Select E-Commerce Label Type ({ECOMMERCE_LABEL_TYPES.length})</span>
          </div>
          {/* Sub-Mode Toggle: Single vs Bulk */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSubMode('single')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                subMode === 'single'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Single Label
            </button>
            <button
              type="button"
              onClick={() => setSubMode('bulk')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                subMode === 'bulk'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Bulk Table (CSV / Excel)</span>
              <span className="text-[10px] px-1 rounded-full bg-sky-500 text-white font-mono">
                {bulkProducts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Label Types Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ECOMMERCE_LABEL_TYPES.map((t) => {
            const isSelected = selectedTypeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectType(t.id)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/15 ring-1 ring-sky-500 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold leading-tight line-clamp-2">
                  {t.name}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {t.defaultWidthMm}×{t.defaultHeightMm}mm
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-MODE A: SINGLE LABEL CREATOR */}
      {subMode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Fields (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <Sliders className="w-3.5 h-3.5 text-sky-500" />
                {currentType.name} Configuration
              </span>

              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setLabelState((p) => ({ ...p, productName: e.target.value }))}
                    className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Seller SKU / Code *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setLabelState((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full text-xs font-mono font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>
              </div>

              {/* Barcode & Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Barcode / EAN / GTIN
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setLabelState((p) => ({ ...p, barcode: e.target.value }))}
                    className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setLabelState((p) => ({ ...p, mrp: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Variant / Spec
                  </label>
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => setLabelState((p) => ({ ...p, variant: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>
              </div>

              {/* Brand & Origin & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setLabelState((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setLabelState((p) => ({ ...p, origin: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gross Weight
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setLabelState((p) => ({ ...p, weight: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  />
                </div>
              </div>

              {/* Shipping-Specific Fields (Only for Shipping, Return, and Package ID) */}
              {(selectedTypeId === 'shipping-label' ||
                selectedTypeId === 'return-address' ||
                selectedTypeId === 'package-id') && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider font-mono">
                    Shipping & Logistics Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Order ID / Ref</label>
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setLabelState((p) => ({ ...p, orderId: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">AWB / Tracking #</label>
                      <input
                        type="text"
                        value={awbNumber}
                        onChange={(e) => setLabelState((p) => ({ ...p, awbNumber: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setLabelState((p) => ({ ...p, recipientName: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Recipient PIN Code</label>
                      <input
                        type="text"
                        value={recipientPincode}
                        onChange={(e) => setLabelState((p) => ({ ...p, recipientPincode: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Recipient Full Address</label>
                    <textarea
                      rows={2}
                      value={recipientAddress}
                      onChange={(e) => setLabelState((p) => ({ ...p, recipientAddress: e.target.value }))}
                      className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Physical Dimensions */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setLabelState((p) => ({ ...p, widthMm: parseFloat(e.target.value) || 10 }))}
                    className="w-full text-xs p-1.5 rounded-lg border font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={heightMm}
                    onChange={(e) => setLabelState((p) => ({ ...p, heightMm: parseFloat(e.target.value) || 10 }))}
                    className="w-full text-xs p-1.5 rounded-lg border font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Copies (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setLabelState((p) => ({ ...p, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                    className="w-full text-xs p-1.5 rounded-lg border font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Single WYSIWYG Preview (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sticky top-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Eye className="w-3.5 h-3.5 text-sky-500" />
                  <span>Single Label Live Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {widthMm}×{heightMm}mm ({quantity} {quantity === 1 ? 'copy' : 'copies'})
                </span>
              </div>

              {/* Visual Label Card */}
              <div className="p-4 bg-slate-100/80 dark:bg-[#060a14] rounded-xl flex items-center justify-center min-h-[260px] overflow-hidden border border-slate-200/60 dark:border-white/[0.05]">
                <div
                  ref={labelCardRef}
                  style={{
                    width: `${Math.max(170, widthMm * 3.2)}px`,
                    minHeight: `${Math.max(110, heightMm * 3.2)}px`,
                    fontFamily,
                  }}
                  className="bg-white border-2 border-black p-2.5 rounded shadow-lg text-slate-900 flex flex-col justify-between select-none relative"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-1 border-b border-black">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider">{brand}</span>
                    <span className="font-mono text-[9px] font-bold">QTY: {quantity}</span>
                  </div>

                  {/* Body Info */}
                  <div className="py-1.5 space-y-0.5">
                    <div className="font-bold text-xs leading-tight line-clamp-2">{productName}</div>
                    {variant && <div className="text-[10px] text-slate-600">{variant}</div>}

                    {/* Shipping Specific Info */}
                    {selectedTypeId === 'shipping-label' && (
                      <div className="text-[9px] bg-slate-50 p-1 rounded border border-slate-300 mt-1 space-y-0.5 font-mono">
                        <div className="font-bold">SHIP TO: {recipientName}</div>
                        <div className="truncate">{recipientAddress}</div>
                        <div className="font-bold text-base text-black">PIN: {recipientPincode}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] font-bold">SKU: {sku}</span>
                      {mrp > 0 && (
                        <span className="font-mono text-xs font-black">MRP: {formatIndianCurrency(mrp)}</span>
                      )}
                    </div>

                    {origin && <div className="text-[8px] text-slate-500">Made in {origin} • Wt: {weight}</div>}
                  </div>

                  {/* Barcode / QR Section */}
                  <div className="pt-1 border-t border-black flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center">
                      <canvas ref={barcodeCanvasRef} className="max-w-full" />
                    </div>
                    {selectedTypeId === 'shipping-label' && (
                      <div className="ml-1 shrink-0">
                        <canvas ref={qrCanvasRef} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onPrintSingle(labelCardRef.current)}
                  className="btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Single</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSendBulkToSheet([labelState])}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 border-sky-400 text-sky-600 dark:text-sky-400 font-bold"
                >
                  <Layers className="w-4 h-4" />
                  <span>Arrange on Sheet</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDownloadPng(labelCardRef.current)}
                  className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadPdf(labelCardRef.current)}
                  className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-MODE B: BULK LABELS TABLE (CSV & EXCEL) */}
      {subMode === 'bulk' && (
        <div className="space-y-3 bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Bulk Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <label className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Excel / CSV</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleAddManualRow}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(generateEcommerceSampleCsv(), 'ecommerce-labels-template.csv')}
                className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1 text-slate-500 hover:text-sky-500"
                title="Download CSV Template with sample columns"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Total Labels & Action */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Total Labels to Print: <span className="text-sky-600 dark:text-sky-400 font-mono text-sm">{totalExpandedCount}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {bulkProducts.filter((p) => p.selected !== false).length} unique products with copy quantities
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSendBulkToSheet(bulkProducts.filter((p) => p.selected !== false))}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <Layers className="w-4 h-4" />
                <span>Send to Sheet Layout Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by Product Name, SKU, or Barcode..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
            />
          </div>

          {/* Editable Products Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[460px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="p-2.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={bulkProducts.length > 0 && bulkProducts.every((p) => p.selected !== false)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBulkProducts((prev) => prev.map((p) => ({ ...p, selected: checked })));
                      }}
                      className="rounded text-sky-500"
                    />
                  </th>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5">SKU / Code</th>
                  <th className="p-2.5">Barcode</th>
                  <th className="p-2.5">MRP (₹)</th>
                  <th className="p-2.5">Variant</th>
                  <th className="p-2.5 w-24">Copies (Qty)</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredBulkRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No products found. Click "Add Product" or upload an Excel / CSV spreadsheet.
                    </td>
                  </tr>
                ) : (
                  filteredBulkRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] ${
                        row.selected === false ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected !== false}
                          onChange={() => handleToggleSelectRow(row.id)}
                          className="rounded text-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.productName || ''}
                          onChange={(e) => handleUpdateRowField(row.id, 'productName', e.target.value)}
                          className="w-full text-xs font-semibold p-1 border rounded bg-transparent"
                        />
                      </td>
                      <td className="p-2 font-mono">
                        <input
                          type="text"
                          value={row.sku || ''}
                          onChange={(e) => handleUpdateRowField(row.id, 'sku', e.target.value)}
                          className="w-full text-xs p-1 border rounded bg-transparent font-mono"
                        />
                      </td>
                      <td className="p-2 font-mono">
                        <input
                          type="text"
                          value={row.barcode || ''}
                          onChange={(e) => handleUpdateRowField(row.id, 'barcode', e.target.value)}
                          className="w-full text-xs p-1 border rounded bg-transparent font-mono"
                        />
                      </td>
                      <td className="p-2 font-mono">
                        <input
                          type="number"
                          value={row.mrp || 0}
                          onChange={(e) => handleUpdateRowField(row.id, 'mrp', parseFloat(e.target.value) || 0)}
                          className="w-20 text-xs p-1 border rounded bg-transparent font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.variant || ''}
                          onChange={(e) => handleUpdateRowField(row.id, 'variant', e.target.value)}
                          className="w-full text-xs p-1 border rounded bg-transparent text-slate-600 dark:text-slate-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity || 1}
                          onChange={(e) => handleUpdateRowField(row.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-16 text-xs p-1 border rounded bg-transparent font-mono font-bold text-sky-600 dark:text-sky-400"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: Spreadsheet Column Mapping */}
      {isMappingModalOpen && importedSpreadsheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c1220] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Map Spreadsheet Columns to Label Fields
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  File: {importedSpreadsheet.fileName} ({importedSpreadsheet.totalRows} data rows)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {[
                { key: 'productName', label: 'Product Name *', required: true },
                { key: 'sku', label: 'SKU / Item Code *', required: true },
                { key: 'barcode', label: 'Barcode / GTIN', required: false },
                { key: 'mrp', label: 'MRP Price', required: false },
                { key: 'sellingPrice', label: 'Selling Price', required: false },
                { key: 'quantity', label: 'Quantity / Copies', required: false },
                { key: 'variant', label: 'Product Variant', required: false },
                { key: 'brand', label: 'Brand Name', required: false },
                { key: 'weight', label: 'Gross Weight', required: false },
                { key: 'origin', label: 'Country of Origin', required: false },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {field.label}
                  </label>
                  <select
                    value={columnMapping[field.key] || ''}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                  >
                    <option value="">-- Do Not Import --</option>
                    {importedSpreadsheet.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapping}
                className="btn-primary py-1.5 px-4 text-xs font-bold"
              >
                Confirm & Import Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
