import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Copy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Lock,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { decodeJwt, getSampleJwt } from '../../utils/jwtDecoder';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';

const JWT_PRESETS = [
  {
    id: 'admin',
    label: 'Valid Admin Token',
    description: 'Active bearer token with admin and billing roles',
    getJwt: () => getSampleJwt(),
  },
  {
    id: 'expired',
    label: 'Expired Session Token',
    description: 'Token with exp timestamp in the past to test error alerts',
    getJwt: () => {
      const now = Math.floor(Date.now() / 1000);
      const h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const p = btoa(JSON.stringify({
        iss: 'https://auth.company.io',
        sub: 'usr_legacy_442',
        email: 'alex@company.io',
        iat: now - 7200,
        exp: now - 1800, // expired 30m ago
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return `${h}.${p}.expired_signature_demo_hash_abc123`;
    },
  },
  {
    id: 'rbac',
    label: 'Microservice M2M Token',
    description: 'Machine-to-machine client credentials token with OAuth scopes',
    getJwt: () => {
      const now = Math.floor(Date.now() / 1000);
      const h = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key_prod_auth_2026' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const p = btoa(JSON.stringify({
        iss: 'https://oauth2.cloud.internal',
        sub: 'client_service_worker_09',
        aud: ['https://payments.service', 'https://orders.service'],
        scope: 'read:transactions write:refunds read:analytics',
        iat: now - 300,
        exp: now + 3300, // 55 mins left
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return `${h}.${p}.mock_rs256_cryptographic_signature_hash`;
    },
  },
];

export function JwtInspectorTool() {
  const toast = useToast();
  const [tokenInput, setTokenInput] = useState(getSampleJwt());
  const [decoded, setDecoded] = useState(() => decodeJwt(tokenInput));
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('admin');

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

  // Live countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Re-decode whenever input or currentTime changes
  useEffect(() => {
    setDecoded(decodeJwt(tokenInput));
  }, [tokenInput, currentTime]);

  const handleSelectPreset = (preset) => {
    const nextJwt = preset.getJwt();
    setTokenInput(nextJwt);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label}`);
  };

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Header & Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zero-Leakage Token Inspector • Offline Cryptography</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Offline JWT Token Inspector & Live Countdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Inspect JSON Web Tokens client-side without transmitting keys to servers. Live exp/iat calculation, claims formatting, and signature inspection.
          </p>
        </div>

        {/* Live Status Pill */}
        {decoded && decoded.valid && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold shadow-sm ${
                decoded.isExpired
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-rose-500/10'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-emerald-500/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${decoded.isExpired ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`} />
              <span>{decoded.statusText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={JWT_PRESETS}
          onSelect={handleSelectPreset}
          activeId={activePreset}
          label="1-Click Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local memory only</span>
        </div>
      </div>

      {/* Raw Token Input Field */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
        <WindowHeader
          title="Encoded JWT / Bearer Token"
          badge="Base64URL"
          linesCount={tokenInput ? tokenInput.split('\n').length : 0}
          charsCount={tokenInput.length}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isZenMode={isZenMode}
          onToggleZen={() => setIsZenMode(!isZenMode)}
        >
          <button
            onClick={() => {
              setTokenInput(getSampleJwt());
              setActivePreset('admin');
              toast.success('Sample token loaded');
            }}
            className="px-2 py-1 text-xs text-brand-500 hover:text-brand-400 font-semibold rounded hover:bg-brand-500/10 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setTokenInput('');
              setActivePreset(null);
              toast.info('Token cleared');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear Input"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </WindowHeader>
        <div className="p-3.5">
          <textarea
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste JWT (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)..."
            rows={3}
            className={`w-full p-3 font-mono bg-slate-50/70 dark:bg-[#060911]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed break-all ${fontSizeClass}`}
          />
        </div>
      </div>

      {/* Token Decoded Panels */}
      {decoded && decoded.valid ? (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Stat KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={KeyRound}
              label="Algorithm"
              value={decoded.algorithm}
              subtext="Header alg claim"
              color="sky"
            />
            <StatCard
              icon={ShieldCheck}
              label="Token Type"
              value={decoded.type}
              subtext="Header typ claim"
              color="purple"
            />
            <StatCard
              icon={Clock}
              label="Issued At (iat)"
              value={decoded.issuedAt ? decoded.issuedAt.toLocaleTimeString() : 'N/A'}
              subtext={decoded.issuedAt ? decoded.issuedAt.toLocaleDateString() : 'Not set'}
              color="amber"
            />
            <StatCard
              icon={Activity}
              label="Expiry (exp)"
              value={decoded.expiresAt ? decoded.expiresAt.toLocaleTimeString() : 'Never'}
              subtext={decoded.isExpired ? 'Expired' : 'Live / Valid'}
              color={decoded.isExpired ? 'rose' : 'emerald'}
            />
          </div>

          {/* Dual Header & Payload Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Payload Claims */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="Decoded Payload Claims"
                badge="JSON"
                linesCount={decoded.payload ? JSON.stringify(decoded.payload, null, 2).split('\n').length : 0}
                charsCount={decoded.payload ? JSON.stringify(decoded.payload, null, 2).length : 0}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={() => JSON.stringify(decoded.payload, null, 2)}
                  label="Copy Payload"
                  copiedLabel="Copied!"
                  targetElementId="jwt-payload-textarea"
                  variant="subtle"
                />
              </WindowHeader>
              <textarea
                id="jwt-payload-textarea"
                readOnly
                value={JSON.stringify(decoded.payload, null, 2)}
                rows={16}
                className={`w-full p-4 font-mono bg-transparent text-emerald-600 dark:text-emerald-400 focus:outline-none resize-none leading-relaxed ${fontSizeClass}`}
              />
            </div>

            {/* Header Metadata */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="JOSE Header Metadata"
                badge="Header"
                linesCount={decoded.header ? JSON.stringify(decoded.header, null, 2).split('\n').length : 0}
                charsCount={decoded.header ? JSON.stringify(decoded.header, null, 2).length : 0}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={() => JSON.stringify(decoded.header, null, 2)}
                  label="Copy Header"
                  copiedLabel="Copied!"
                  targetElementId="jwt-header-textarea"
                  variant="subtle"
                />
              </WindowHeader>
              <textarea
                id="jwt-header-textarea"
                readOnly
                value={JSON.stringify(decoded.header, null, 2)}
                rows={6}
                className={`w-full p-4 font-mono bg-transparent text-rose-600 dark:text-rose-400 focus:outline-none resize-none leading-relaxed ${fontSizeClass}`}
              />

              {/* Signature Info */}
              <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#060911]/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                  Cryptographic Signature Hash
                </span>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 break-all bg-white dark:bg-[#0b1120] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {decoded.signature}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        decoded && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{decoded.error}</span>
          </div>
        )
      )}
    </div>
  );
}
