import React, { useEffect, useRef } from 'react';
import {
  Tag,
  Barcode as BarcodeIcon,
  QrCode,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Printer,
  Upload,
  Eye,
  Settings,
  Layers,
  ShieldCheck
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { MRP_TAG_TEMPLATES, validateMrpTagInput, formatIndianCurrency } from '../../../utils/mrpTagUtils';

export function RegularMrpTagDesigner({
  mrpState,
  setMrpState,
  onApplyTemplate,
  onPrintSingle,
  onDownloadPng,
  onDownloadPdf,
  onSendToSheet,
}) {
  const barcodeCanvasRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const tagPreviewRef = useRef(null);

  const {
    name,
    sku,
    mrp,
    sellingPrice,
    brand,
    variant,
    packSize,
    customText,
    showDiscount,
    codeType,
    barcodeValue,
    qrValue,
    widthMm,
    heightMm,
    orientation,
    fontFamily,
    headerBg,
    headerText,
    bg,
    borderColor,
    borderStyle,
    priceColor,
    cornerRadius,
    textAlign,
    barcodePlacement,
    logoUrl,
    hasHole,
    showFields = {
      brand: true,
      sku: true,
      variant: true,
      packSize: true,
      customText: true,
      sellingPrice: true,
    },
  } = mrpState;

  // Validation
  const validation = validateMrpTagInput({
    mrp,
    sellingPrice: showFields.sellingPrice ? sellingPrice : '',
  });

  // Calculate discount only if sellingPrice is provided and showDiscount is enabled
  const numMrp = parseFloat(mrp) || 0;
  const numSelling = parseFloat(sellingPrice) || 0;
  const hasSellingPrice = showFields.sellingPrice && numSelling > 0 && numSelling < numMrp;
  const discountPercent = hasSellingPrice ? Math.round(((numMrp - numSelling) / numMrp) * 100) : 0;
  const savings = hasSellingPrice ? numMrp - numSelling : 0;

  // Render barcode
  useEffect(() => {
    if (codeType === 'barcode' && barcodeCanvasRef.current && (barcodeValue || sku)) {
      try {
        JsBarcode(barcodeCanvasRef.current, String(barcodeValue || sku || '8901234567890'), {
          format: 'CODE128',
          width: 1.1,
          height: 24,
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
  }, [codeType, barcodeValue, sku]);

  // Render QR
  useEffect(() => {
    if (codeType === 'qr' && qrCanvasRef.current && (qrValue || sku)) {
      try {
        QRCode.toCanvas(qrCanvasRef.current, String(qrValue || `SKU:${sku}|MRP:${mrp}`), {
          width: 48,
          margin: 0,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch (err) {
        console.warn('QR render error', err);
      }
    }
  }, [codeType, qrValue, sku, mrp]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setMrpState((prev) => ({ ...prev, logoUrl: evt.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const toggleField = (fieldKey) => {
    setMrpState((prev) => ({
      ...prev,
      showFields: {
        ...prev.showFields,
        [fieldKey]: !prev.showFields[fieldKey],
      },
    }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Ready-Made MRP Tag Templates */}
      <div className="bg-white dark:bg-[#0c1220] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ready-Made MRP Retail Templates</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">6 Industry Standards</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MRP_TAG_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onApplyTemplate(tmpl)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-500/10 transition-all text-left flex flex-col justify-between gap-1 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-3 h-3 rounded-md border border-black/10 shrink-0"
                  style={{ backgroundColor: tmpl.headerBg }}
                />
                <span className="text-[9px] font-mono text-slate-400">
                  {tmpl.widthMm}×{tmpl.heightMm}mm
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 leading-tight">
                {tmpl.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Form & WYSIWYG Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form: Field Inputs (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card A: Product & Pricing Information */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                Mandatory & Retail Fields
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                India Legal Compliance (₹)
              </span>
            </div>

            {/* Validation Banner if errors */}
            {!validation.isValid && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {validation.errors.map((err, i) => (
                    <div key={i} className="font-semibold">{err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setMrpState((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Organic Bamboo Coffee Tumbler"
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* MRP and Selling Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MRP Field */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase font-mono">
                    Maximum Retail Price (MRP) *
                  </label>
                  <span className="text-[9px] font-mono text-slate-400">Incl. all taxes</span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrpState((p) => ({ ...p, mrp: e.target.value }))}
                    placeholder="699"
                    className="w-full text-base font-black pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Formatted: {formatIndianCurrency(mrp)}
                </div>
              </div>

              {/* Optional Selling Price Field */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Selling Price (Optional)
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFields.sellingPrice}
                      onChange={() => toggleField('sellingPrice')}
                      className="rounded text-sky-500"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    disabled={!showFields.sellingPrice}
                    value={sellingPrice}
                    onChange={(e) => setMrpState((p) => ({ ...p, sellingPrice: e.target.value }))}
                    placeholder="e.g. 599 (leave empty if regular MRP)"
                    className="w-full text-sm font-bold pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>
                {hasSellingPrice && (
                  <div className="flex items-center justify-between text-[10px]">
                    <label className="flex items-center gap-1 text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDiscount}
                        onChange={(e) => setMrpState((p) => ({ ...p, showDiscount: e.target.checked }))}
                        className="rounded text-sky-500"
                      />
                      <span>Show discount % on tag</span>
                    </label>
                    {showDiscount && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {discountPercent}% OFF (Save ₹{savings})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SKU and Brand Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Product Code / SKU
                  </label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFields.sku}
                      onChange={() => toggleField('sku')}
                      className="rounded text-sky-500"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setMrpState((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="e.g. BAM-TMB-450"
                  className="w-full text-xs font-mono font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Manufacturer / Brand
                  </label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFields.brand}
                      onChange={() => toggleField('brand')}
                      className="rounded text-sky-500"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setMrpState((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="e.g. EcoVibe Essentials"
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Product Variant & Pack Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Product Variant (Size / Color)
                  </label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFields.variant}
                      onChange={() => toggleField('variant')}
                      className="rounded text-sky-500"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setMrpState((p) => ({ ...p, variant: e.target.value }))}
                  placeholder="e.g. Matte Olive / 450ml"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Unit / Pack Size
                  </label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFields.packSize}
                      onChange={() => toggleField('packSize')}
                      className="rounded text-sky-500"
                    />
                    <span>Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={packSize}
                  onChange={(e) => setMrpState((p) => ({ ...p, packSize: e.target.value }))}
                  placeholder="e.g. Net Qty: 1 Unit or 500g"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Custom Text / Compliance Note */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Custom Text / Statutory Compliance Note
                </label>
                <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFields.customText}
                    onChange={() => toggleField('customText')}
                    className="rounded text-sky-500"
                  />
                  <span>Show</span>
                </label>
              </div>
              <input
                type="text"
                value={customText}
                onChange={(e) => setMrpState((p) => ({ ...p, customText: e.target.value }))}
                placeholder="e.g. Consumer Care: support@brand.com | Made in India"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Card B: Dimensions, Typography & Layout Settings */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              Tag Geometry & Visual Customization
            </span>

            {/* Dimensions & Orientation */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={widthMm}
                  onChange={(e) => setMrpState((p) => ({ ...p, widthMm: parseFloat(e.target.value) || 10 }))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Height (mm)</label>
                <input
                  type="number"
                  value={heightMm}
                  onChange={(e) => setMrpState((p) => ({ ...p, heightMm: parseFloat(e.target.value) || 10 }))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setMrpState((p) => ({ ...p, orientation: e.target.value }))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 font-semibold"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
            </div>

            {/* Fonts & Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setMrpState((p) => ({ ...p, fontFamily: e.target.value }))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                >
                  <option value="sans-serif">Clean Sans</option>
                  <option value="serif">Boutique Serif</option>
                  <option value="monospace">Tech Mono</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Header Theme</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={headerBg}
                    onChange={(e) => setMrpState((p) => ({ ...p, headerBg: e.target.value }))}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={headerBg}
                    onChange={(e) => setMrpState((p) => ({ ...p, headerBg: e.target.value }))}
                    className="text-[11px] font-mono w-full p-1 border rounded bg-slate-50 dark:bg-black/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Card Border</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setMrpState((p) => ({ ...p, borderColor: e.target.value }))}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <select
                    value={borderStyle}
                    onChange={(e) => setMrpState((p) => ({ ...p, borderStyle: e.target.value }))}
                    className="text-[11px] p-1 border rounded bg-slate-50 dark:bg-black/30"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Corner Radius</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={cornerRadius}
                  onChange={(e) => setMrpState((p) => ({ ...p, cornerRadius: parseInt(e.target.value, 10) }))}
                  className="w-full accent-sky-500 mt-1"
                />
              </div>
            </div>

            {/* Embedded Barcode / QR Placement */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Machine Code</label>
                <div className="grid grid-cols-3 gap-1">
                  {['barcode', 'qr', 'none'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMrpState((p) => ({ ...p, codeType: type }))}
                      className={`py-1 text-[11px] font-bold rounded-lg border uppercase ${
                        codeType === type
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Code Placement</label>
                <select
                  disabled={codeType === 'none'}
                  value={barcodePlacement}
                  onChange={(e) => setMrpState((p) => ({ ...p, barcodePlacement: e.target.value }))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 disabled:opacity-40"
                >
                  <option value="bottom">Bottom Full Width</option>
                  <option value="right">Right Side Column</option>
                  <option value="top">Header Top Right</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Brand Logo</label>
                <label className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer text-slate-600 dark:text-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoUrl ? 'Change Logo' : 'Upload PNG'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: WYSIWYG Real-Time Tag Preview & Output (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sticky top-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span>WYSIWYG Retail Tag Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {widthMm}mm × {heightMm}mm
              </span>
            </div>

            {/* Tag Preview Canvas Area */}
            <div className="p-4 bg-slate-100/80 dark:bg-[#060a14] rounded-xl flex items-center justify-center min-h-[300px] overflow-hidden border border-slate-200/60 dark:border-white/[0.05]">
              <div
                ref={tagPreviewRef}
                style={{
                  width: `${Math.max(180, widthMm * 3.4)}px`,
                  minHeight: `${Math.max(120, heightMm * 3.4)}px`,
                  backgroundColor: bg,
                  borderColor: borderColor,
                  borderWidth: '2px',
                  borderStyle: borderStyle,
                  borderRadius: `${cornerRadius}px`,
                  fontFamily: fontFamily,
                }}
                className="shadow-xl relative flex flex-col justify-between overflow-hidden text-slate-900 transition-all select-none"
              >
                {/* Optional punch hole for hanging apparel tags */}
                {hasHole && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 shadow-inner z-10" />
                )}

                {/* Tag Header Strip */}
                <div
                  style={{ backgroundColor: headerBg, color: headerText }}
                  className={`px-3 py-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider font-mono ${
                    hasHole ? 'pt-7' : ''
                  }`}
                >
                  <span className="truncate">{brand || 'RETAIL ITEM'}</span>
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="h-4 max-w-[50px] object-contain ml-auto" />
                  )}
                </div>

                {/* Main Body */}
                <div className={`p-3 space-y-1.5 flex-1 flex flex-col justify-center text-${textAlign}`}>
                  <div className="font-extrabold text-sm leading-tight text-slate-900 line-clamp-2">
                    {name || 'Product Title'}
                  </div>

                  {showFields.variant && variant && (
                    <div className="text-[10px] text-slate-500 font-semibold">{variant}</div>
                  )}

                  {/* MRP Display */}
                  <div className="pt-1">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      M.R.P. (Incl. of all taxes)
                    </div>
                    <div
                      style={{ color: priceColor }}
                      className="text-xl font-black font-mono tracking-tight leading-none"
                    >
                      {formatIndianCurrency(mrp)}
                    </div>
                  </div>

                  {/* Optional Selling Price with Discount */}
                  {showFields.sellingPrice && numSelling > 0 && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Special: {formatIndianCurrency(sellingPrice)}
                      </span>
                      {showDiscount && discountPercent > 0 && (
                        <span className="text-[10px] font-black text-rose-600">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pack size & SKU */}
                  <div className="text-[9px] text-slate-600 flex items-center justify-between font-mono pt-1">
                    {showFields.packSize && packSize && <span>{packSize}</span>}
                    {showFields.sku && sku && <span>SKU: {sku}</span>}
                  </div>

                  {showFields.customText && customText && (
                    <div className="text-[8px] text-slate-500 border-t border-slate-100 pt-1 line-clamp-1 italic">
                      {customText}
                    </div>
                  )}
                </div>

                {/* Embedded Machine Code */}
                {codeType === 'barcode' && (
                  <div className="bg-white/90 p-1.5 border-t border-slate-100 flex flex-col items-center justify-center">
                    <canvas ref={barcodeCanvasRef} className="max-w-full" />
                  </div>
                )}

                {codeType === 'qr' && (
                  <div className="bg-white/90 p-1.5 border-t border-slate-100 flex items-center justify-center">
                    <canvas ref={qrCanvasRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onPrintSingle(tagPreviewRef.current)}
                className="btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Single Tag</span>
              </button>
              <button
                type="button"
                onClick={() => onSendToSheet(mrpState)}
                className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 border-sky-400 text-sky-600 dark:text-sky-400 font-bold"
              >
                <Layers className="w-4 h-4" />
                <span>Arrange on Sheet</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDownloadPng(tagPreviewRef.current)}
                className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => onDownloadPdf(tagPreviewRef.current)}
                className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
