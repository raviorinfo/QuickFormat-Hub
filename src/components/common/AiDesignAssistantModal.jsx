import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Layers, Tag, Barcode, QrCode, HeartHandshake } from 'lucide-react';
import { parseAiDesignPrompt, SAMPLE_AI_PROMPTS } from '../../utils/aiDesignParser';

export default function AiDesignAssistantModal({ isOpen, onClose, onApplyDesign, currentTool = 'price-tag' }) {
  const [promptText, setPromptText] = useState(
    "Create a compact retail price tag for a children's robotic toy. Display ₹1,999 MRP, ₹1,299 selling price, a HOT DEAL badge, product barcode and a QR code linking to specs."
  );
  const [parsedResult, setParsedResult] = useState(() => parseAiDesignPrompt(promptText));
  const [editedValues, setEditedValues] = useState(null);

  if (!isOpen) return null;

  const handleParse = (textToParse = promptText) => {
    const result = parseAiDesignPrompt(textToParse);
    setParsedResult(result);
    if (result.isValid) {
      setEditedValues({
        productName: result.productName,
        sku: result.sku,
        mrp: result.mrp,
        sellingPrice: result.sellingPrice,
        currency: result.currency,
        barcode: result.barcode,
        barcodeFormat: result.barcodeFormat,
        badgeText: result.badgeText,
        couponCode: result.couponCode,
        url: result.url,
      });
    }
  };

  const currentSettings = editedValues || parsedResult;

  const handleApply = () => {
    if (!parsedResult?.isValid) return;
    const finalData = {
      ...parsedResult,
      ...editedValues,
    };
    onApplyDesign(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">AI-Assisted Design Assistant</h3>
                <span className="px-2 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  100% Client-Side NLP
                </span>
              </div>
              <p className="text-xs text-slate-400">Describe your label or packaging in plain English. No paid API required.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Preset Prompts */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Instant Prompts (Click to test)
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_AI_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(sample.text);
                    handleParse(sample.text);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/40 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-prompt-input" className="text-xs font-semibold text-slate-300">
                Natural Language Design Request
              </label>
              <button
                type="button"
                onClick={() => handleParse(promptText)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-parse Prompt
              </button>
            </div>
            <textarea
              id="ai-prompt-input"
              rows={3}
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="e.g. Create a compact retail price tag for children's toy. Display ₹699 MRP, ₹499 selling price, a discount badge, barcode and QR code..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Parsed Structured Results & Review */}
          {parsedResult?.isValid && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Parsed Structured Settings</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    Target: {parsedResult.targetTool.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Confidence: <strong className="text-emerald-400">{parsedResult.confidenceScore}%</strong>
                </span>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={currentSettings.productName || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, productName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Internal SKU</label>
                  <input
                    type="text"
                    value={currentSettings.sku || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, sku: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Selling Price ({currentSettings.currency})</label>
                  <input
                    type="number"
                    value={currentSettings.sellingPrice || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">MRP / List Price ({currentSettings.currency})</label>
                  <input
                    type="number"
                    value={currentSettings.mrp || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Barcode / GTIN</label>
                  <input
                    type="text"
                    value={currentSettings.barcode || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, barcode: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Promotional Badge Text</label>
                  <input
                    type="text"
                    value={currentSettings.badgeText || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, badgeText: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">QR Target URL</label>
                  <input
                    type="text"
                    value={currentSettings.url || ''}
                    onChange={(e) => setEditedValues({ ...currentSettings, url: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deterministic Discount Calculation Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>
                  Deterministic Math: MRP {currentSettings.currency} {currentSettings.mrp} → Selling {currentSettings.currency} {currentSettings.sellingPrice} ={' '}
                  <strong className="text-white font-bold">
                    {Math.round(((currentSettings.mrp - currentSettings.sellingPrice) / (currentSettings.mrp || 1)) * 100)}% OFF
                  </strong>{' '}
                  (Save {currentSettings.currency} {Math.max(0, currentSettings.mrp - currentSettings.sellingPrice)})
                </span>
              </div>

              {/* Review & Assumptions Notice */}
              {parsedResult.missingFieldsToReview?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Note for Review:
                  </span>
                  <ul className="text-[11px] text-slate-400 list-disc list-inside">
                    {parsedResult.missingFieldsToReview.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!parsedResult?.isValid}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            Apply to Active Design <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
