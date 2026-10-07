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
  Layers,
  FileCode,
  Fingerprint
} from 'lucide-react';
import { decodeJwt, getSampleJwt, verifyJwtSignature, RFC7519_CLAIMS } from '../../utils/jwtDecoder';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
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
  const [secretKey, setSecretKey] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const tokenParts = tokenInput ? tokenInput.trim().split('.') : [];

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Lock}
        category="Security & Auth"
        badge="RFC 7519"
        title="Offline JWT Token Inspector & Live Countdown"
        description="Inspect JSON Web Tokens entirely within your local browser without transmitting private keys to servers. Live exp/iat countdown, claims formatting, and cryptographic signature review."
        actions={
          decoded && decoded.valid ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${
                decoded.isExpired
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${decoded.isExpired ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{decoded.statusText}</span>
            </div>
          ) : null
        }
      />

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
          <span>Local memory only • Zero transmission</span>
        </div>
      </div>

      {/* Raw Token Input Field */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
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
            className="px-2 py-1 text-xs text-sky-500 hover:text-sky-400 font-semibold rounded hover:bg-sky-500/10 transition-colors"
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

        <div className="p-3.5 space-y-3">
          <textarea
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste JWT (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)..."
            rows={3}
            className={`w-full p-3 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed break-all ${fontSizeClass}`}
          />

          {/* Color-Coded Token Segment Anatomy */}
          {tokenParts.length === 3 && (
            <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-[11px] font-mono flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-sans font-medium">Anatomy:</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                Header ({tokenParts[0].length} chars)
              </span>
              <span className="text-slate-400">•</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">
                Payload ({tokenParts[1].length} chars)
              </span>
              <span className="text-slate-400">•</span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold">
                Signature ({tokenParts[2].length} chars)
              </span>
            </div>
          )}
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
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="Decoded Payload Claims"
                badge="Payload (Purple)"
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
              <div className="p-2">
                <textarea
                  id="jwt-payload-textarea"
                  readOnly
                  value={JSON.stringify(decoded.payload, null, 2)}
                  rows={16}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-purple-600 dark:text-purple-300 focus:outline-none resize-none leading-relaxed border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>

            {/* Header Metadata */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title="JOSE Header Metadata"
                badge="Header (Rose)"
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
              <div className="p-2">
                <textarea
                  id="jwt-header-textarea"
                  readOnly
                  value={JSON.stringify(decoded.header, null, 2)}
                  rows={6}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-rose-600 dark:text-rose-400 focus:outline-none resize-none leading-relaxed border border-transparent ${fontSizeClass}`}
                />
              </div>

              {/* Signature Info */}
              <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#060911]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-sky-500" />
                    <span>Cryptographic Signature Hash</span>
                  </span>
                  <span className="text-[10px] font-mono text-sky-500 font-bold bg-sky-500/10 px-2 py-0.5 rounded">
                    Signature (Cyan)
                  </span>
                </div>
                <p className="font-mono text-xs text-sky-600 dark:text-sky-300 break-all bg-white dark:bg-[#0b1120] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                  {decoded.signature}
                </p>

                {/* In-Browser HMAC Signature Verification */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verify HMAC Signature (Client-Side)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Web Crypto API</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secretKey}
                      onChange={(e) => {
                        setSecretKey(e.target.value);
                        setVerificationResult(null);
                      }}
                      placeholder="Enter HMAC Secret Key (e.g. your-256-bit-secret)..."
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={async () => {
                        setIsVerifying(true);
                        const res = await verifyJwtSignature(tokenInput, secretKey);
                        setVerificationResult(res);
                        setIsVerifying(false);
                        if (res.verified) {
                          toast.success('Signature verified successfully!');
                        } else if (res.verified === false) {
                          toast.error(res.message);
                        } else {
                          toast.info(res.message);
                        }
                      }}
                      disabled={isVerifying || !secretKey.trim()}
                      className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? 'Checking...' : 'Verify'}
                    </button>
                  </div>

                  {verificationResult && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        verificationResult.verified
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : verificationResult.verified === false
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {verificationResult.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{verificationResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RFC 7519 Registered Claims Inspector */}
          {decoded.payload && Object.keys(decoded.payload).some((k) => RFC7519_CLAIMS[k]) && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>RFC 7519 Registered Standard Claims</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Standardized claims detected</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {Object.keys(decoded.payload)
                  .filter((k) => RFC7519_CLAIMS[k])
                  .map((k) => {
                    const info = RFC7519_CLAIMS[k];
                    const val = decoded.payload[k];
                    const isTimeClaim = ['exp', 'iat', 'nbf'].includes(k);
                    const formattedVal = isTimeClaim && typeof val === 'number'
                      ? `${val} (${new Date(val * 1000).toLocaleString()})`
                      : String(val);

                    return (
                      <div
                        key={k}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{k}</span>
                          <span className="text-[10px] text-slate-400 font-sans">{info.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{info.desc}</p>
                        <p className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate pt-0.5">
                          {formattedVal}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
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
