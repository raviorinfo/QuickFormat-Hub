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
  ArrowRight,
  Zap,
  EyeOff,
  Globe
} from 'lucide-react';
import { sanitizeText, unmaskText, SAMPLE_DIRTY_LOG } from '../../utils/piiSanitizer';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { PresetChips } from '../common/PresetChips';

const PII_PRESETS = [
  {
    id: 'server_log',
    label: 'Backend Crash Log',
    description: 'Production exception trace with client Bearer token and IP',
    text: `[2026-10-07 08:14:22] ERROR Gateway: Connection failed for user customer_ops@company.io\nRemote IP: 198.51.100.42\nAuthorization: Bearer sec_live_sample_token_994820184029184710293847\nCard on file: 4111222233334444\nSupport Phone: +1-415-555-0199\nError: GatewayTimeout on downstream cluster.`,
  },
  {
    id: 'customer_ticket',
    label: 'Support Ticket Chat',
    description: 'Customer chat message containing credit card and contact info',
    text: `Customer Name: Marcus Vance\nEmail: marcus.vance@techcorp.io\nBilling Address Phone: +44 20 7946 0991\nPayment Issue: "My Visa card 4242-5555-6666-7777 failed with error code ERR_302. Please check my account UUID: 550e8400-e29b-41d4-a716-446655440000."`,
  },
  {
    id: 'api_config',
    label: 'Env & API Keys Leak',
    description: 'Environment file snippet containing AWS and database credentials',
    text: `AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nSERVICE_SECRET_KEY=sec_live_dummy_secret_hash_demo_token_xyz99\nADMIN_EMAIL=root@enterprise.internal\nBASTION_HOST_IP=203.0.113.195\nDB_CONNECTION=postgresql://admin@10.0.4.12:5432/production`,
  },
];

export function PiiRedactorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('sanitize'); // 'sanitize' | 'unmask'
  const [inputText, setInputText] = useState(SAMPLE_DIRTY_LOG);
  const [aiResponseText, setAiResponseText] = useState('');
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

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

  const handleSelectPreset = (preset) => {
    setInputText(preset.text);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label}`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={ShieldAlert}
        category="Security & AI Governance"
        badge="Zero-Leakage Privacy Engine"
        title="AI Prompt & Log Sanitizer (PII Redactor)"
        description="Redact API keys, bearer tokens, IP addresses, emails, credit cards, and customer identifiers before sending logs to LLMs. Reverse-unmask AI responses in your local browser."
        actions={
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('sanitize')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sanitize'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>1. Mask Secrets</span>
            </button>
            <button
              onClick={() => setActiveTab('unmask')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'unmask'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>2. Reverse Unmask</span>
            </button>
          </div>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PII_PRESETS}
          onSelect={handleSelectPreset}
          activeId={activePreset}
          label="1-Click Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local memory only • Zero transmission to LLM vendors</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Key}
          label="API Tokens Masked"
          value={`${stats.apiKeys} Tokens`}
          subtext="Secrets & Bearer keys"
          color="rose"
        />
        <StatCard
          icon={Mail}
          label="Emails & Contacts"
          value={`${stats.emails + stats.phones} Entities`}
          subtext="Email addresses & phones"
          color="sky"
        />
        <StatCard
          icon={Globe}
          label="Network Addresses"
          value={`${stats.ips} IPs`}
          subtext="IPv4 & IPv6 addresses"
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          label="Financial & UUIDs"
          value={`${stats.creditCards + stats.uuids} Tokens`}
          subtext="Cards & unique UUIDs"
          color="amber"
        />
      </div>

      {activeTab === 'sanitize' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Options Strip */}
          <div className="p-4 glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">Redacted Tokens:</span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/20">
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

            {/* Filter Toggle Switches */}
            <div className="flex items-center flex-wrap gap-5 text-xs pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
              <ToggleSwitch
                label={`API Keys (${stats.apiKeys})`}
                checked={maskApiKeys}
                onChange={setMaskApiKeys}
                size="sm"
              />
              <ToggleSwitch
                label={`Emails (${stats.emails})`}
                checked={maskEmails}
                onChange={setMaskEmails}
                size="sm"
              />
              <ToggleSwitch
                label={`IPs (${stats.ips})`}
                checked={maskIps}
                onChange={setMaskIps}
                size="sm"
              />
              <ToggleSwitch
                label={`Credit Cards (${stats.creditCards})`}
                checked={maskCreditCards}
                onChange={setMaskCreditCards}
                size="sm"
              />
              <ToggleSwitch
                label={`Phones (${stats.phones})`}
                checked={maskPhones}
                onChange={setMaskPhones}
                size="sm"
              />
            </div>
          </div>

          {/* Dual Textareas */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
            {/* Left: Raw text */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
              <WindowHeader
                title="Confidential Baseline Input"
                badge="Raw"
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
                    setActivePreset(null);
                    toast.success('Sample log loaded');
                  }}
                  className="px-2 py-1 text-xs text-sky-500 hover:text-sky-400 font-semibold rounded hover:bg-sky-500/10 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setInputText('');
                    setActivePreset(null);
                    toast.info('Input cleared');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </WindowHeader>
              <div className="p-2">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setActivePreset(null);
                  }}
                  placeholder="Paste confidential production logs, queries, or tickets here..."
                  rows={16}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[380px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>

            {/* Right: Sanitized output */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="Sanitized AI-Safe Output"
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
              <div className="p-2">
                <textarea
                  id="sanitized-output-textarea"
                  readOnly
                  value={sanitized}
                  rows={16}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-emerald-600 dark:text-emerald-400 focus:outline-none resize-none leading-relaxed min-h-[380px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UNMASK TAB */
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 glass-panel border border-sky-500/30 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xl">
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1 text-sm flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-sky-500" />
              Reverse AI Unmasker
            </span>
            Paste the response you received from ChatGPT or Claude into the left box below. Our local engine will automatically replace placeholders like <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/[0.08] rounded font-mono font-bold text-sky-500">[REDACTED_API_KEY_1]</code> back with your original confidential values!
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
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
                  className="px-2 py-1 text-xs text-sky-500 hover:text-sky-400 font-semibold rounded hover:bg-sky-500/10 transition-colors"
                >
                  Insert Sample Reply
                </button>
              </WindowHeader>
              <div className="p-2">
                <textarea
                  value={aiResponseText}
                  onChange={(e) => setAiResponseText(e.target.value)}
                  placeholder="Paste AI response containing [REDACTED_...] tokens..."
                  rows={14}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[340px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="Restored Confidential Response"
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
              <div className="p-2">
                <textarea
                  id="unmasked-output-textarea"
                  readOnly
                  value={unmaskedResult}
                  rows={14}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[340px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
