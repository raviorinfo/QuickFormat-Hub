import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Key,
  Globe,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Upload,
  FileText,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Binary,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  parseCertificateBundle,
  verifyCertKeyMatch,
  SAMPLE_CERT,
  SAMPLE_CSR,
} from '../../utils/certUtils';

export function CertInspectorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'key_matcher'
  const [pemInput, setPemInput] = useState(SAMPLE_CERT);
  const [certChain, setCertChain] = useState([]);
  const [selectedCertIndex, setSelectedCertIndex] = useState(0);
  const [parseError, setParseError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Private Key Matcher State
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [matcherResult, setMatcherResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  // Parse certificate bundle on change
  useEffect(() => {
    let isMounted = true;
    if (!pemInput.trim()) {
      setCertChain([]);
      setSelectedCertIndex(0);
      setParseError(null);
      return;
    }

    parseCertificateBundle(pemInput)
      .then((chain) => {
        if (isMounted) {
          setCertChain(chain);
          setSelectedCertIndex(0);
          setParseError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCertChain([]);
          setSelectedCertIndex(0);
          setParseError(err.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pemInput]);

  const activeCert = certChain[selectedCertIndex] || null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setPemInput(content);
        toast.success(`Loaded certificate from ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const handleTestKeyMatch = async () => {
    if (!pemInput.trim() || !privateKeyInput.trim()) {
      toast.error('Please provide both Certificate and Private Key.');
      return;
    }
    setIsMatching(true);
    const result = await verifyCertKeyMatch(pemInput, privateKeyInput);
    setMatcherResult(result);
    setIsMatching(false);
    if (result.isMatch) toast.success('Cryptographic Key Pair Verified!');
    else toast.error('Key mismatch or unsupported format.');
  };

  return (
    <div className="space-y-4">
      {/* Tool Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>X.509 Certificate Chain & Key Matcher</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decode multi-certificate bundles, verify BasicConstraints and EKU, detect self-signed CA status, and match private keys 100% in-browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                activeTab === 'inspector'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Certificate Chain
            </button>
            <button
              onClick={() => setActiveTab('key_matcher')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                activeTab === 'key_matcher'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Private Key Matcher
            </button>
          </div>

          <label className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3 h-3 text-slate-400" />
            <span>Upload (.pem/.crt)</span>
            <input
              type="file"
              accept=".pem,.crt,.cer,.csr,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            data-sample-trigger="true"
            onClick={() => {
              setPemInput(SAMPLE_CERT);
              toast.success('Loaded sample X.509 certificate');
            }}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sample Cert</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPemInput(SAMPLE_CSR);
              toast.success('Loaded sample CSR');
            }}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Sample CSR</span>
          </button>
          <button
            type="button"
            onClick={() => setPemInput('')}
            className="btn-secondary py-1 px-2.5 text-xs text-rose-500 hover:text-rose-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CERTIFICATE CHAIN INSPECTOR */}
      {/* ============================================================== */}
      {activeTab === 'inspector' && (
        <div className="space-y-4">
          {/* Certificate Bundle Navigation Bar if chain has multiple certs */}
          {certChain.length > 1 && (
            <div className="flex items-center gap-2 p-3 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>Certificate Chain Bundle ({certChain.length}):</span>
              </span>
              <div className="flex items-center gap-1.5">
                {certChain.map((cert, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCertIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedCertIndex === idx
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{cert.chainRole || `Cert ${idx + 1}`}</span>
                    <span className="text-[10px] opacity-80">({cert.commonName})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid: Input PEM & Decoded Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: PEM Textarea */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-500" />
                    PEM Encoded Input
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {pemInput.length} chars
                  </span>
                </div>

                <textarea
                  value={pemInput}
                  onChange={(e) => setPemInput(e.target.value)}
                  placeholder="Paste -----BEGIN CERTIFICATE----- (supports multiple cert bundles) or CSR here..."
                  rows={16}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
                />

                {parseError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Parsing Error</div>
                      <div className="text-[11px] opacity-90">{parseError}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Decoded Structure & Badges */}
            <div className="lg:col-span-7 space-y-4">
              {!activeCert ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3">
                  <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No Certificate Loaded
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Paste a valid PEM certificate bundle or CSR on the left to inspect Subject, Expiration, SANs, and Cryptographic details.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  {/* Status & Identity Card */}
                  <div className="glass-panel rounded-2xl p-5 space-y-4 border-l-4 border-l-emerald-500">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {activeCert.type}
                        </span>

                        {activeCert.chainRole && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 border border-sky-500/20">
                            {activeCert.chainRole}
                          </span>
                        )}

                        {activeCert.isSelfSigned && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Self-Signed</span>
                          </span>
                        )}

                        {!activeCert.isCsr && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              activeCert.status === 'valid'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : activeCert.status === 'expiring'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}
                          >
                            {activeCert.status === 'valid'
                              ? `● Valid (${activeCert.daysRemaining} days left)`
                              : activeCert.status === 'expiring'
                              ? `▲ Expiring Soon (${activeCert.daysRemaining} days left)`
                              : '✕ Expired'}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `CN: ${activeCert.commonName}\nIssuer: ${activeCert.issuerCommonName || 'N/A'}\nExpires: ${formatDate(
                              activeCert.notAfter
                            )}`,
                            'Summary'
                          )
                        }
                        className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'Summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Summary</span>
                      </button>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Common Name (CN)
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono break-all mt-0.5">
                        {activeCert.commonName}
                      </div>
                    </div>

                    {/* Subject Alternative Names (SANs) */}
                    {activeCert.sans && activeCert.sans.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-sky-500" />
                          <span>Subject Alternative Names (SANs) ({activeCert.sans.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCert.sans.map((san, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200/60 dark:border-white/[0.05]"
                            >
                              {san}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extensions: BasicConstraints and EKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Basic Constraints
                        </span>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                            activeCert.isCa
                              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {activeCert.basicConstraints || 'End Entity (Not a CA)'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Extended Key Usage (EKU)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {activeCert.extendedKeyUsages?.map((eku, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] border border-emerald-500/20"
                            >
                              {eku}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validity & Issuer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Issuer Card */}
                    <div className="glass-panel rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-sky-500" />
                        <span>Issuer Organization</span>
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="text-slate-900 dark:text-slate-100 font-semibold break-all">
                          {activeCert.issuerCommonName || 'N/A'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Org: {activeCert.issuerOrganization || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Validity Card */}
                    <div className="glass-panel rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Validity Period</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-500 text-[11px]">
                          Issued:{' '}
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {formatDate(activeCert.notBefore)}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Expires:{' '}
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                            {formatDate(activeCert.notAfter)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Details Card */}
                  <div className="glass-panel rounded-2xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Binary className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Cryptographic Fingerprints & Public Key</span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                        <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                          SHA-256 Fingerprint
                        </div>
                        <div className="text-sky-600 dark:text-sky-400 font-bold break-all select-all mt-0.5">
                          {activeCert.sha256Fingerprint || 'N/A'}
                        </div>
                      </div>

                      {activeCert.spkiSha256 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                          <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                            SPKI Public Key Thumbprint (SHA-256)
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 font-bold break-all select-all mt-0.5">
                            {activeCert.spkiSha256}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400 font-sans">Key Algorithm: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeCert.keyType} ({activeCert.keySize})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans">Sig Algorithm: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeCert.sigAlgorithm}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PRIVATE KEY & CSR MATCHER */}
      {/* ============================================================== */}
      {activeTab === 'key_matcher' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              <span>Private Key / Certificate Cryptographic Matcher</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify if a private key matches a certificate or CSR before installing it on your web server. Uses native WebCrypto to sign and verify an in-memory test nonce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Certificate or CSR (PEM):
              </label>
              <textarea
                value={pemInput}
                onChange={(e) => setPemInput(e.target.value)}
                placeholder="Paste -----BEGIN CERTIFICATE-----..."
                rows={10}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Private Key (PKCS#8 PEM):
              </label>
              <textarea
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="Paste -----BEGIN PRIVATE KEY-----..."
                rows={10}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleTestKeyMatch}
            disabled={isMatching || !pemInput.trim() || !privateKeyInput.trim()}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>{isMatching ? 'Testing Cryptographic Sign/Verify...' : 'Verify Private Key & Certificate Match'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {matcherResult && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                matcherResult.isMatch
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {matcherResult.isMatch ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{matcherResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
