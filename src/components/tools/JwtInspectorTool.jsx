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
  Fingerprint,
  Wand2,
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';
import {
  decodeJwt,
  getSampleJwt,
  verifyJwtSignature,
  verifyJwtWithPublicKey,
  signJwt,
  auditJwt,
  RFC7519_CLAIMS
} from '../../utils/jwtDecoder';
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
    id: 'none_alg',
    label: 'Vulnerable alg: "none"',
    description: 'Critical algorithm substitution vulnerability test',
    getJwt: () => {
      const h = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const p = btoa(JSON.stringify({
        sub: 'root_admin_01',
        role: 'superadmin',
        bypass: true,
        iat: Math.floor(Date.now() / 1000),
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return `${h}.${p}.`;
    },
  },
  {
    id: 'weak_secret',
    label: 'Weak Secret ("secret")',
    description: 'Signed with dictionary secret "secret" to trigger vulnerability audit',
    getJwt: () => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    },
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
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'builder'
  const [tokenInput, setTokenInput] = useState(getSampleJwt());
  const [decoded, setDecoded] = useState(() => decodeJwt(tokenInput));
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('admin');

  // Verification state
  const [verifyMode, setVerifyMode] = useState('hmac'); // 'hmac' | 'pubkey'
  const [secretKey, setSecretKey] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Security Audit issues
  const [auditIssues, setAuditIssues] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);

  // JWT Builder State
  const [builderAlg, setBuilderAlg] = useState('HS256');
  const [builderHeaderJson, setBuilderHeaderJson] = useState(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)
  );
  const [builderPayloadJson, setBuilderPayloadJson] = useState(() => {
    const now = Math.floor(Date.now() / 1000);
    return JSON.stringify(
      {
        sub: 'usr_enterprise_901',
        name: 'Alex Morgan',
        role: 'admin',
        iat: now,
        exp: now + 3600,
      },
      null,
      2
    );
  });
  const [builderSecret, setBuilderSecret] = useState('super-secret-development-key-32b');
  const [builtJwt, setBuiltJwt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

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
    const d = decodeJwt(tokenInput);
    setDecoded(d);
    setVerificationResult(null);

    // Run security audit
    if (d && d.valid) {
      setIsAuditing(true);
      auditJwt(tokenInput, d.header, d.payload, d.signature)
        .then((issues) => {
          setAuditIssues(issues);
          setIsAuditing(false);
        })
        .catch(() => setIsAuditing(false));
    } else {
      setAuditIssues([]);
    }
  }, [tokenInput, currentTime]);

  const handleSelectPreset = (preset) => {
    const nextJwt = preset.getJwt();
    setTokenInput(nextJwt);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label}`);
  };

  // Sign new token from Builder
  const handleBuildToken = async () => {
    try {
      setIsBuilding(true);
      const parsedHeader = JSON.parse(builderHeaderJson);
      const parsedPayload = JSON.parse(builderPayloadJson);
      parsedHeader.alg = builderAlg;

      const token = await signJwt(parsedHeader, parsedPayload, builderSecret);
      setBuiltJwt(token);
      setIsBuilding(false);
      toast.success('JWT successfully generated and signed!');
    } catch (err) {
      setIsBuilding(false);
      toast.error(`Sign error: ${err.message}`);
    }
  };

  const handleAddClaim = (claimKey, claimVal) => {
    try {
      const parsed = JSON.parse(builderPayloadJson);
      parsed[claimKey] = claimVal;
      setBuilderPayloadJson(JSON.stringify(parsed, null, 2));
      toast.info(`Added/updated claim "${claimKey}"`);
    } catch {
      toast.error('Invalid JSON in payload editor');
    }
  };

  const tokenParts = tokenInput ? tokenInput.trim().split('.') : [];

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Lock}
        category="Security & Auth"
        badge="RFC 7519 / WebCrypto"
        title="Offline JWT Token Inspector & Token Builder"
        description="Inspect, audit, and sign JSON Web Tokens entirely within your local browser. Detects alg: 'none', tests dictionary secrets, parses RSA/ECDSA signatures, and features a live Token Signer."
        actions={
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inspect'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Inspect & Audit
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              JWT Builder & Signer
            </button>
          </div>
        }
      />

      {/* ============================================================== */}
      {/* MODE 1: INSPECT & AUDIT */}
      {/* ============================================================== */}
      {activeTab === 'inspect' && (
        <div className="space-y-6">
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

          {/* Security Audit Findings Banner */}
          {auditIssues.length > 0 && (
            <div className="space-y-2">
              {auditIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    issue.severity === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/5'
                      : issue.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold flex items-center gap-2">
                      <span>{issue.title}</span>
                      <span className="uppercase text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-black">
                        {issue.severity}
                      </span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{issue.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                  color={decoded.algorithm.toLowerCase() === 'none' ? 'rose' : 'sky'}
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
                      rows={5}
                      className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-rose-600 dark:text-rose-400 focus:outline-none resize-none leading-relaxed border border-transparent ${fontSizeClass}`}
                    />
                  </div>

                  {/* Signature Info & Dual Verification */}
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
                      {decoded.signature || '(empty signature - unsigned)'}
                    </p>

                    {/* In-Browser Signature Verification Tabs */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Verify Signature (Client-Side)</span>
                        </span>

                        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg border border-slate-200/60 dark:border-white/[0.08]">
                          <button
                            onClick={() => setVerifyMode('hmac')}
                            className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                              verifyMode === 'hmac'
                                ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                                : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            HMAC Secret
                          </button>
                          <button
                            onClick={() => setVerifyMode('pubkey')}
                            className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                              verifyMode === 'pubkey'
                                ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                                : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            RSA/EC Public Key
                          </button>
                        </div>
                      </div>

                      {verifyMode === 'hmac' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={secretKey}
                            onChange={(e) => {
                              setSecretKey(e.target.value);
                              setVerificationResult(null);
                            }}
                            placeholder="Enter HMAC Secret (e.g. secret, your-256-bit-key)..."
                            className="flex-1 px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={async () => {
                              setIsVerifying(true);
                              const res = await verifyJwtSignature(tokenInput, secretKey);
                              setVerificationResult(res);
                              setIsVerifying(false);
                              if (res.verified) toast.success('Signature verified successfully!');
                              else if (res.verified === false) toast.error(res.message);
                              else toast.info(res.message);
                            }}
                            disabled={isVerifying || !secretKey.trim()}
                            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isVerifying ? 'Checking...' : 'Verify'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={publicKeyPem}
                            onChange={(e) => {
                              setPublicKeyPem(e.target.value);
                              setVerificationResult(null);
                            }}
                            placeholder="Paste Public Key PEM (-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----)..."
                            rows={3}
                            className="w-full p-2 text-xs font-mono bg-white dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                setIsVerifying(true);
                                const res = await verifyJwtWithPublicKey(tokenInput, publicKeyPem);
                                setVerificationResult(res);
                                setIsVerifying(false);
                                if (res.verified) toast.success('Asymmetric signature verified!');
                                else toast.error(res.message);
                              }}
                              disabled={isVerifying || !publicKeyPem.trim()}
                              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isVerifying ? 'Verifying...' : 'Verify Asymmetric'}
                            </button>
                          </div>
                        </div>
                      )}

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
                        const formattedVal =
                          isTimeClaim && typeof val === 'number'
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
      )}

      {/* ============================================================== */}
      {/* MODE 2: JWT BUILDER & SIGNER */}
      {/* ============================================================== */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-sky-500" />
                  <span>Interactive In-Browser JWT Token Builder</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Craft header and payload claims, select signing algorithm, and generate cryptographic tokens using WebCrypto.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Algorithm:</span>
                <select
                  value={builderAlg}
                  onChange={(e) => setBuilderAlg(e.target.value)}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sky-600 dark:text-sky-400 focus:outline-none"
                >
                  <option value="HS256">HS256 (HMAC SHA-256)</option>
                  <option value="HS384">HS384 (HMAC SHA-384)</option>
                  <option value="HS512">HS512 (HMAC SHA-512)</option>
                  <option value="none">none (Unsigned)</option>
                </select>
              </div>
            </div>

            {/* Quick Claims Injection Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-xs">
              <span className="text-slate-400 text-[11px] font-semibold mr-1">Quick Claim Presets:</span>
              <button
                onClick={() => handleAddClaim('exp', Math.floor(Date.now() / 1000) + 3600)}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-mono hover:text-sky-500 transition-colors"
              >
                +1 Hour Expiry
              </button>
              <button
                onClick={() => handleAddClaim('exp', Math.floor(Date.now() / 1000) + 86400)}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-mono hover:text-sky-500 transition-colors"
              >
                +24 Hours Expiry
              </button>
              <button
                onClick={() => handleAddClaim('iat', Math.floor(Date.now() / 1000))}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-mono hover:text-sky-500 transition-colors"
              >
                Set iat Now
              </button>
              <button
                onClick={() => handleAddClaim('roles', ['admin', 'billing_manager', 'editor'])}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-mono hover:text-purple-500 transition-colors"
              >
                Add Admin Roles
              </button>
            </div>

            {/* Dual JSON Editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-rose-500 mb-1 block">
                  Header JSON (JOSE Header)
                </label>
                <textarea
                  value={builderHeaderJson}
                  onChange={(e) => setBuilderHeaderJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-purple-500 mb-1 block">
                  Payload JSON (Claims)
                </label>
                <textarea
                  value={builderPayloadJson}
                  onChange={(e) => setBuilderPayloadJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Secret key for HMAC signing */}
            {builderAlg !== 'none' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Signing Secret Key:
                </label>
                <input
                  type="text"
                  value={builderSecret}
                  onChange={(e) => setBuilderSecret(e.target.value)}
                  placeholder="Enter secret key to sign HMAC digest..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <button
              onClick={handleBuildToken}
              disabled={isBuilding}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isBuilding ? 'Signing...' : `Generate & Sign Token (${builderAlg})`}</span>
            </button>
          </div>

          {/* Generated Token Result */}
          {builtJwt && (
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Generated Signed JWT</span>
                </span>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={() => builtJwt}
                    label="Copy JWT"
                    copiedLabel="Copied!"
                    variant="subtle"
                  />
                  <button
                    onClick={() => {
                      setTokenInput(builtJwt);
                      setActiveTab('inspect');
                      toast.success('Loaded token into Inspector!');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all bg-black/20 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                {builtJwt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
