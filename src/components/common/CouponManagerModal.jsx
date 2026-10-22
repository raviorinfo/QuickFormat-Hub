import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Download,
  Copy,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';
import {
  getStoredCoupons,
  saveCoupon,
  deleteCoupon,
  generateBulkUniqueCoupons,
  exportCouponsToCsv,
} from '../../utils/couponManagerUtils';

export default function CouponManagerModal({
  isOpen,
  onClose,
  onSelectCoupon,
  title = 'Promotions & Coupon Manager',
}) {
  const [coupons, setCoupons] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Single Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 499,
    validUntil: '2026-12-31',
    maxUses: 500,
    isActive: true,
  });

  // Bulk Generator Form
  const [bulkConfig, setBulkConfig] = useState({
    prefix: 'SAVE',
    count: 10,
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 500,
    validUntil: '2026-12-31',
  });

  const refreshCoupons = () => {
    setCoupons(getStoredCoupons());
  };

  useEffect(() => {
    if (isOpen) {
      refreshCoupons();
      setIsCreating(false);
      setIsBulkGenerating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    try {
      saveCoupon(newCoupon);
      refreshCoupons();
      setIsCreating(false);
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 15,
        minPurchase: 499,
        validUntil: '2026-12-31',
        maxUses: 500,
        isActive: true,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkGenerate = (e) => {
    e.preventDefault();
    try {
      const generated = generateBulkUniqueCoupons(bulkConfig);
      // Save each
      generated.forEach((c) => saveCoupon(c));
      refreshCoupons();
      setIsBulkGenerating(false);
      alert(`Successfully generated ${generated.length} unique promo voucher codes!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Delete coupon code '${code}'?`)) {
      deleteCoupon(id);
      refreshCoupons();
    }
  };

  const handleExport = () => {
    const csv = exportCouponsToCsv(coupons);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promotions_coupons_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
                  {coupons.length} Active Vouchers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage promotional offers and bulk insert discount vouchers into Thank You Cards and Price Tags.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => {
                setIsBulkGenerating(!isBulkGenerating);
                setIsCreating(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Bulk Generate
            </button>
            <button
              onClick={() => {
                setIsCreating(!isCreating);
                setIsBulkGenerating(false);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> New Coupon
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bulk Generator Drawer */}
        {isBulkGenerating && (
          <form
            onSubmit={handleBulkGenerate}
            className="p-4 bg-purple-950/30 border-b border-purple-500/30 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Bulk Unique Voucher Code Generator
              </span>
              <button
                type="button"
                onClick={() => setIsBulkGenerating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Prefix</label>
                <input
                  type="text"
                  value={bulkConfig.prefix}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, prefix: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 uppercase font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkConfig.count}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, count: parseInt(e.target.value) || 5 })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Discount (% or Flat)</label>
                <input
                  type="number"
                  value={bulkConfig.discountValue}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, discountValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  value={bulkConfig.minPurchase}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, minPurchase: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={bulkConfig.validUntil}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, validUntil: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm"
              >
                Generate {bulkConfig.count} Unique Vouchers
              </button>
            </div>
          </form>
        )}

        {/* Single Create Drawer */}
        {isCreating && (
          <form
            onSubmit={handleSaveNew}
            className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Create New Promotional Offer</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Discount Type</label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="percentage">Percentage (% OFF)</option>
                  <option value="flat">Flat Amount (₹ OFF)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Discount Value</label>
                <input
                  type="number"
                  value={newCoupon.discountValue}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  value={newCoupon.minPurchase}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, minPurchase: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-slate-400 block mb-1">Customer Description / Note</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on all clothing items above ₹999"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Valid Until</label>
                <input
                  type="date"
                  value={newCoupon.validUntil}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm"
              >
                Save Coupon Template
              </button>
            </div>
          </form>
        )}

        {/* Coupons List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(c.code, c.id)}
                        title="Copy Code"
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedId === c.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        title="Delete"
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-white">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT DISCOUNT`}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {c.description || `Min order ₹${c.minPurchase || 0}`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Exp: {c.validUntil || 'Lifetime'}</span>
                  {onSelectCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCoupon(c);
                        onClose();
                      }}
                      className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-[11px] shadow-sm transition-colors"
                    >
                      Insert in Card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Coupons are stored in local storage and can be injected into any tag or packaging insert.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
