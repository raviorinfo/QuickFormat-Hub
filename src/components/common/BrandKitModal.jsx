import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Upload, Trash2, Check, RefreshCw, Palette, Globe, Phone, Mail, ShieldCheck } from 'lucide-react';
import { getSavedBrandKit, saveBrandKit, resetBrandKit, DEFAULT_BRAND_KIT } from '../../utils/brandKitUtils';

export default function BrandKitModal({ isOpen, onClose, onApplied }) {
  const [brandKit, setBrandKit] = useState(DEFAULT_BRAND_KIT);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setBrandKit(getSavedBrandKit());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setBrandKit((prev) => ({ ...prev, logoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated = saveBrandKit(brandKit);
    setSaveSuccess(true);
    if (onApplied) onApplied(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (confirm('Reset your Brand Kit to default settings?')) {
      const reset = resetBrandKit();
      setBrandKit(reset);
      if (onApplied) onApplied(reset);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-kit-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="brand-kit-title" className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Brand Kit Studio
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Shared Across All Tools
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your business identity once and apply it seamlessly to Barcodes, Price Tags, QR Codes, and Thank You Cards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close Brand Kit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Grid: Brand Basics & Logo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Upload Box */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Brand Logo
              </span>
              <div className="relative w-24 h-24 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden mb-3">
                {brandKit.logoUrl ? (
                  <img
                    src={brandKit.logoUrl}
                    alt="Brand Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Palette className="w-8 h-8 text-slate-600" />
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
                {brandKit.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setBrandKit((prev) => ({ ...prev, logoUrl: null }))}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                    title="Remove logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Max 2MB. Stored locally.</p>
            </div>

            {/* Business Identity */}
            <div className="md:col-span-2 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  value={brandKit.brandName}
                  onChange={(e) => setBrandKit({ ...brandKit, brandName: e.target.value })}
                  placeholder="e.g. Acme Craft & Retail"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Brand Motto
                </label>
                <input
                  type="text"
                  value={brandKit.tagline}
                  onChange={(e) => setBrandKit({ ...brandKit, tagline: e.target.value })}
                  placeholder="e.g. Handcrafted with Care"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Accent Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5">
                    <input
                      type="color"
                      value={brandKit.primaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandKit.primaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                      className="w-full text-xs font-mono uppercase bg-transparent text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Brand Font Style
                  </label>
                  <select
                    value={brandKit.fontFamily}
                    onChange={(e) => setBrandKit({ ...brandKit, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="sans-serif">Modern Sans-Serif (Clean)</option>
                    <option value="serif">Classic Serif (Luxury / Boutique)</option>
                    <option value="monospace">Technical Monospace (Industrial)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Social, Web & Payment Details */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              Digital Presence & Channels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Website URL</label>
                <input
                  type="text"
                  value={brandKit.website}
                  onChange={(e) => setBrandKit({ ...brandKit, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Social Handle (@brand)</label>
                <input
                  type="text"
                  value={brandKit.social}
                  onChange={(e) => setBrandKit({ ...brandKit, social: e.target.value })}
                  placeholder="@yourbrand"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">UPI ID (For Indian Merchant Payments)</label>
                <input
                  type="text"
                  value={brandKit.upiId}
                  onChange={(e) => setBrandKit({ ...brandKit, upiId: e.target.value })}
                  placeholder="storename@okhdfcbank"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Support Contact / Phone</label>
                <input
                  type="text"
                  value={brandKit.phone}
                  onChange={(e) => setBrandKit({ ...brandKit, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Live Preview */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Brand Style Card
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Auto-synced across all active tools
              </span>
            </div>
            <div
              className="p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all"
              style={{
                borderColor: brandKit.primaryColor,
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontFamily: brandKit.fontFamily,
              }}
            >
              <div className="flex items-center gap-3">
                {brandKit.logoUrl ? (
                  <img
                    src={brandKit.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                    style={{ backgroundColor: brandKit.primaryColor }}
                  >
                    {brandKit.brandName ? brandKit.brandName.charAt(0).toUpperCase() : 'B'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm leading-tight text-slate-900">{brandKit.brandName || 'Your Business Name'}</h4>
                  <p className="text-xs text-slate-500">{brandKit.tagline || 'Crafted with Care'}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className="inline-block px-2.5 py-1 rounded text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: brandKit.primaryColor }}
                >
                  Verified Brand
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{brandKit.website || 'www.yourbrand.com'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg text-white shadow-lg transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Brand Kit Saved!
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save & Apply Brand Kit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
