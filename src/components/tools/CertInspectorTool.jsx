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
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { parseCertificate, SAMPLE_CERT, SAMPLE_CSR } from '../../utils/certUtils';

export function CertInspectorTool() {
  const toast = useToast();
  const [pemInput, setPemInput] = useState(SAMPLE_CERT);
  const [certData, setCertData] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Parse certificate on change
  useEffect(() => {
    let isMounted = true;
    if (!pemInput.trim()) {
      setCertData(null);
      setParseError(null);
      return;
    }

    parseCertificate(pemInput)
      .then((parsed) => {
        if (isMounted) {
          setCertData(parsed);
          setParseError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCertData(null);
          setParseError(err.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pemInput]);

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

  return (
    <div className="space-y-4">
      {/* Tool Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>X.509 Certificate & CSR Inspector</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decode SSL/TLS certificates, expiration countdown, SANs, key sizes, and CSR requests 100% in-browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
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
            className="btn-secondary py-1.5 px-3 text-xs text-rose-500 hover:text-rose-600"
          >
            Clear
          </button>
        </div>
      </div>

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
              placeholder="Paste -----BEGIN CERTIFICATE----- or -----BEGIN CERTIFICATE REQUEST----- here..."
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
          {!certData ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No Certificate Loaded
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Paste a valid PEM certificate or CSR on the left to inspect Subject, Expiration, SANs, and Cryptographic details.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {/* Status & Identity Card */}
              <div className="glass-panel rounded-2xl p-5 space-y-4 border-l-4 border-l-emerald-500">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {certData.type}
                    </span>
                    {!certData.isCsr && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          certData.status === 'valid'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : certData.status === 'expiring'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}
                      >
                        {certData.status === 'valid'
                          ? `● Valid (${certData.daysRemaining} days left)`
                          : certData.status === 'expiring'
                          ? `▲ Expiring Soon (${certData.daysRemaining} days left)`
                          : '✕ Expired'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `CN: ${certData.commonName}\nIssuer: ${certData.issuerCommonName || 'N/A'}\nExpires: ${formatDate(
                          certData.notAfter
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
                    {certData.commonName}
                  </div>
                </div>

                {/* Subject Alternative Names (SANs) */}
                {certData.sans && certData.sans.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-sky-500" />
                      <span>Subject Alternative Names (SANs) — {certData.sans.length} Total</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {certData.sans.map((san) => (
                        <span
                          key={san}
                          className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-mono font-medium"
                        >
                          {san}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Validity Window (If X.509) */}
              {!certData.isCsr && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-panel rounded-xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-500" />
                      <span>Valid From (Not Before)</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {formatDate(certData.notBefore)}
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-3.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      <span>Valid Until (Not After)</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {formatDate(certData.notAfter)}
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Specifications */}
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] pb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-500" />
                  <span>Cryptographic Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Public Key Algorithm:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {certData.keyType} ({certData.keySize})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Signature Algorithm:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {certData.sigAlgorithm}
                    </span>
                  </div>
                  {!certData.isCsr && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Issuer Authority:</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {certData.issuerCommonName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Serial Number:</span>
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                          {certData.serialNumber}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Certificate Fingerprints */}
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] pb-2 flex items-center justify-between">
                  <span>Certificate Fingerprints</span>
                  <span className="text-[10px] text-slate-400 font-mono">Computed locally</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">SHA-256 Fingerprint:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(certData.sha256Fingerprint, 'SHA-256 Fingerprint')}
                        className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'SHA-256 Fingerprint' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.06] font-mono text-[10px] text-slate-800 dark:text-slate-200 break-all">
                      {certData.sha256Fingerprint}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">SHA-1 Fingerprint:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(certData.sha1Fingerprint, 'SHA-1 Fingerprint')}
                        className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'SHA-1 Fingerprint' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.06] font-mono text-[10px] text-slate-800 dark:text-slate-200 break-all">
                      {certData.sha1Fingerprint}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
