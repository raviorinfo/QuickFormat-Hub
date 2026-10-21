import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  Sparkles,
  Barcode,
  Tag,
  QrCode,
  HeartHandshake,
  Download,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { validateRetailGtin, calculateEan13CheckDigit } from '../../utils/barcodeUtils';
import { calculateDiscount, formatCurrency } from '../../utils/priceTagUtils';

export default function ProductLabelStudioModal({
  isOpen,
  onClose,
  onNavigateToTool,
}) {
  const [productData, setProductData] = useState({
    name: 'Wireless ANC Gaming Headset',
    sku: 'SKU-ELC-8921',
    gtin: '890103091234', // 12 digits -> check digit 5 -> 8901030912345
    sellingPrice: 1999,
    mrp: 3999,
    currency: 'INR',
    description: '40mm Neodymium Drivers | 50h Battery | Low Latency',
    url: 'https://quickformat.com/item/elc-8921',
  });

  const [brandKit, setBrandKit] = useState(getSavedBrandKit());

  useEffect(() => {
    if (isOpen) {
      setBrandKit(getSavedBrandKit());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto calculate 13th digit if 12 digits entered
  const gtinClean = productData.gtin.replace(/[^0-9]/g, '');
  let fullGtin = gtinClean;
  if (gtinClean.length === 12) {
    fullGtin = gtinClean + calculateEan13CheckDigit(gtinClean);
  }
  const gtinValidation = validateRetailGtin(fullGtin);
  const { discountPercent, savings, isInvalid: priceInvalid, error: priceError } = calculateDiscount(
    productData.mrp,
    productData.sellingPrice
  );

  const handleLaunchTool = (toolRoute, toolState) => {
    onClose();
    if (onNavigateToTool) {
      onNavigateToTool(toolRoute, toolState);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-title"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 id="studio-title" className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Product Label Studio
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Unified Multi-Tool Workflow
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter your product information once to generate synchronized Barcode Labels, Price Tags, QR Codes, and Thank You Cards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Form: Enter Once */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Step 1: Product Master Information
              </h3>
              <span className="text-xs text-slate-400">
                Brand: <strong className="text-slate-200">{brandKit.brandName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="e.g. Wireless ANC Gaming Headset"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Internal SKU</label>
                <input
                  type="text"
                  value={productData.sku}
                  onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                  placeholder="e.g. SKU-ELC-8921"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Retail GTIN / Barcode (EAN-13)
                </label>
                <input
                  type="text"
                  value={productData.gtin}
                  onChange={(e) => setProductData({ ...productData, gtin: e.target.value })}
                  placeholder="12 or 13 digits"
                  className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-lg text-slate-100 font-mono focus:outline-none ${
                    gtinValidation.isValid ? 'border-slate-700 focus:border-amber-500' : 'border-rose-500/80'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {gtinValidation.isValid ? (
                    <span className="text-emerald-400">✓ Valid {gtinValidation.type} ({gtinValidation.country})</span>
                  ) : (
                    <span className="text-rose-400">✗ {gtinValidation.error}</span>
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={productData.sellingPrice}
                  onChange={(e) => setProductData({ ...productData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MRP (Maximum Retail Price ₹)</label>
                <input
                  type="number"
                  value={productData.mrp}
                  onChange={(e) => setProductData({ ...productData, mrp: Number(e.target.value) })}
                  className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-lg text-slate-100 focus:outline-none ${
                    priceInvalid ? 'border-rose-500' : 'border-slate-700 focus:border-amber-500'
                  }`}
                />
                <span className="text-[10px] mt-1 block">
                  {priceInvalid ? (
                    <span className="text-rose-400 font-semibold">{priceError}</span>
                  ) : discountPercent > 0 ? (
                    <span className="text-emerald-400 font-semibold">{discountPercent}% OFF (Save {formatCurrency(savings, 'INR')})</span>
                  ) : (
                    <span className="text-slate-500">Regular Pricing</span>
                  )}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Description / Highlights</label>
                <input
                  type="text"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  placeholder="Key product attributes or pack specs"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Info / Store URL</label>
                <input
                  type="text"
                  value={productData.url}
                  onChange={(e) => setProductData({ ...productData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Synchronized Output Suite Preview */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Step 2: Synchronized Product Suite (Ready to Open in Any Tool)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Barcode Label Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                    <Barcode className="w-4 h-4" />
                    Barcode Label
                  </div>
                  <div className="p-3 bg-white text-slate-900 rounded-lg border border-slate-200 text-center shadow-sm">
                    <p className="text-[10px] font-bold truncate">{productData.name}</p>
                    <div className="my-1.5 font-mono text-xs tracking-widest bg-slate-100 py-1 rounded">
                      ||| | |||| | ||| ||
                    </div>
                    <p className="text-[9px] font-mono">{fullGtin || productData.sku}</p>
                    <p className="text-[10px] font-bold text-slate-800 mt-1">
                      MRP: {formatCurrency(productData.mrp, 'INR')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTool('/barcode-generator', {
                      value: fullGtin || productData.sku,
                      productName: productData.name,
                      sku: productData.sku,
                      mrp: productData.mrp,
                      sellingPrice: productData.sellingPrice,
                    })
                  }
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
                >
                  Open in Barcode Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. Price Tag Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-2">
                    <Tag className="w-4 h-4" />
                    Shelf Price Tag
                  </div>
                  <div className="p-3 bg-white text-slate-900 rounded-lg border border-slate-200 text-center shadow-sm">
                    <p className="text-[11px] font-bold truncate">{productData.name}</p>
                    <div className="flex items-baseline justify-center gap-1.5 my-1">
                      <span className="text-base font-extrabold text-blue-700">
                        {formatCurrency(productData.sellingPrice, 'INR')}
                      </span>
                      {productData.mrp > productData.sellingPrice && (
                        <span className="text-[10px] line-through text-slate-400">
                          {formatCurrency(productData.mrp, 'INR')}
                        </span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTool('/price-tag-creator', {
                      name: productData.name,
                      sellingPrice: productData.sellingPrice,
                      mrp: productData.mrp,
                      sku: productData.sku,
                      description: productData.description,
                    })
                  }
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                >
                  Open in Price Tag Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3. QR Code Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                    <QrCode className="w-4 h-4" />
                    Product Link QR
                  </div>
                  <div className="p-3 bg-white text-slate-900 rounded-lg border border-slate-200 text-center shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-mono text-[9px] text-slate-500">
                      [QR CODE]
                    </div>
                    <p className="text-[10px] font-semibold text-slate-800 mt-1 truncate max-w-full">
                      Scan for specs
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTool('/qr-code-generator', {
                      type: 'url',
                      url: productData.url,
                      label: productData.name,
                    })
                  }
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  Open in QR Code Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4. Thank You Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between hover:border-pink-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 mb-2">
                    <HeartHandshake className="w-4 h-4" />
                    Thank You Card
                  </div>
                  <div className="p-3 bg-white text-slate-900 rounded-lg border border-slate-200 text-center shadow-sm">
                    <p className="text-[10px] font-semibold text-pink-600 uppercase tracking-wider">
                      {brandKit.brandName}
                    </p>
                    <p className="text-[11px] font-bold text-slate-900 mt-0.5">Thank You!</p>
                    <p className="text-[9px] text-slate-500 line-clamp-2 mt-1">
                      Thanks for ordering {productData.name}. Enjoy our special VIP coupon.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTool('/thank-you-card-maker', {
                      brandName: brandKit.brandName,
                      headline: 'Thank You For Your Order!',
                      message: `We hope you love your new ${productData.name}! Scan below to discover tips and exclusive reorder discounts.`,
                    })
                  }
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-sm transition-colors"
                >
                  Open in Card Maker
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>All synchronized items inherit your saved Brand Kit colors, logo, and contacts.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
}
