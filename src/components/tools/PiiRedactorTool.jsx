import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Key,
  Mail,
  CreditCard,
  Hash,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sanitizeText, unmaskText, SAMPLE_DIRTY_LOG } from '../../utils/piiSanitizer';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function PiiRedactorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('sanitize'); // 'sanitize' | 'unmask'
  const [inputText, setInputText] = useState(SAMPLE_DIRTY_LOG);
  const [aiResponseText, setAiResponseText] = useState('');
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  // Esc key listener to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const fontSizeClass =
    fontSize === 'small'
      ? 'text-[11px] leading-relaxed'
      : fontSize === 'large'
      ? 'text-sm leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  // Options
  const [maskApiKeys, setMaskApiKeys] = useState(true);
  const [maskEmails, setMaskEmails] = useState(true);
  const [maskIps, setMaskIps] = useState(true);
  const [maskCreditCards, setMaskCreditCards] = useState(true);
  const [maskPhones, setMaskPhones] = useState(true);
  const [maskUuids, setMaskUuids] = useState(true);

  // Compute Sanitization
  const { sanitized, unmaskMap, stats } = useMemo(() => {
    return sanitizeText(inputText, {
      maskApiKeys,
      maskEmails,
      maskIps,
      maskCreditCards,
      maskPhones,
      maskUuids,
    });
  }, [inputText, maskApiKeys, maskEmails, maskIps, maskCreditCards, maskPhones, maskUuids]);

  // Compute Unmasked Text
  const unmaskedResult = useMemo(() => {
    return unmaskText(aiResponseText, unmaskMap);
  }, [aiResponseText, unmaskMap]);

  const totalRedacted =
    stats.emails + stats.apiKeys + stats.ips + stats.creditCards + stats.phones + stats.uuids;

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Leakage Privacy Guard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Prompt & Log Sanitizer (PII Redactor)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mask API keys, emails, IPs, and customer data before sending to ChatGPT / Claude, with local reverse unmasking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('sanitize')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sanitize'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>1. Mask Sensitive Data</span>
          </button>
          <button
            onClick={() => setActiveTab('unmask')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'unmask'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>2. Unmask AI Response</span>
          </button>
        </div>
      </div>

      {activeTab === 'sanitize' ? (
        <div className="space-y-4">
          {/* Stats & Toggles Strip */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Secrets Filtered:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {totalRedacted} items masked
                </span>
              </div>
              <CopyButton
                text={sanitized}
                label="Copy Redacted Text for AI"
                copiedLabel="Redacted Text Copied!"
                targetElementId="sanitized-output-textarea"
                variant="primary"
              />
            </div>

            {/* Filter Checkboxes */}
            <div className="flex items-center flex-wrap gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskApiKeys}
                  onChange={(e) => setMaskApiKeys(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">API Keys & Tokens ({stats.apiKeys})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskEmails}
                  onChange={(e) => setMaskEmails(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">Emails ({stats.emails})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskIps}
                  onChange={(e) => setMaskIps(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">IP Addresses ({stats.ips})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskCreditCards}
                  onChange={(e) => setMaskCreditCards(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">Credit Cards ({stats.creditCards})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskPhones}
                  onChange={(e) => setMaskPhones(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">Phones ({stats.phones})</span>
              </label>
            </div>
          </div>

          {/* Dual Textareas */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
            {/* Left: Raw text */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="Raw Log / Prompt"
                badge="Confidential"
                linesCount={inputText ? inputText.split('\n').length : 0}
                charsCount={inputText.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                isZenMode={isZenMode}
                onToggleZen={() => setIsZenMode(!isZenMode)}
              >
                <button
                  onClick={() => {
                    setInputText(SAMPLE_DIRTY_LOG);
                    toast.success('Sample log loaded');
                  }}
                  className="text-xs text-brand-500 hover:text-brand-400 font-medium px-1.5 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
                >
                  Sample
                </button>
                <button
                  onClick={() => setInputText('')}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </WindowHeader>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste confidential production logs, queries, or tickets here..."
                rows={16}
                className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[380px] ${fontSizeClass}`}
              />
            </div>

            {/* Right: Sanitized output */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="Sanitized Safe Output"
                badge="Safe for AI"
                linesCount={sanitized ? sanitized.split('\n').length : 0}
                charsCount={sanitized.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={sanitized}
                  label="Copy"
                  copiedLabel="Copied!"
                  targetElementId="sanitized-output-textarea"
                  variant="subtle"
                />
              </WindowHeader>
              <textarea
                id="sanitized-output-textarea"
                readOnly
                value={sanitized}
                rows={16}
                className={`w-full p-4 font-mono bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[380px] ${fontSizeClass}`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* UNMASK TAB */
        <div className="space-y-4">
          <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">
              Reverse AI Unmasker
            </span>
            Paste the response you received from ChatGPT or Claude into the left box below. Our local engine will automatically replace tokens like <code className="px-1 bg-slate-200 dark:bg-slate-800 rounded font-mono">[REDACTED_API_KEY_1]</code> back with your original confidential values!
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="AI Answer With Placeholders"
                badge="Masked"
                linesCount={aiResponseText ? aiResponseText.split('\n').length : 0}
                charsCount={aiResponseText.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <button
                  onClick={() => {
                    setAiResponseText(
                      'The issue in PaymentGatewayController for user [REDACTED_EMAIL_1] is caused by an expired token [REDACTED_API_KEY_2]. Recommend regenerating the credential.'
                    );
                  }}
                  className="text-[11px] text-brand-500 hover:text-brand-400 font-medium px-2 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
                >
                  Insert Sample Reply
                </button>
              </WindowHeader>
              <textarea
                value={aiResponseText}
                onChange={(e) => setAiResponseText(e.target.value)}
                placeholder="Paste AI response containing [REDACTED_...] tokens..."
                rows={14}
                className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[340px] ${fontSizeClass}`}
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="Restored Original Response"
                badge="Unmasked"
                linesCount={unmaskedResult ? unmaskedResult.split('\n').length : 0}
                charsCount={unmaskedResult.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={unmaskedResult}
                  label="Copy Restored"
                  copiedLabel="Copied!"
                  targetElementId="unmasked-output-textarea"
                  variant="primary"
                />
              </WindowHeader>
              <textarea
                id="unmasked-output-textarea"
                readOnly
                value={unmaskedResult}
                rows={14}
                className={`w-full p-4 font-mono bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[340px] ${fontSizeClass}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
