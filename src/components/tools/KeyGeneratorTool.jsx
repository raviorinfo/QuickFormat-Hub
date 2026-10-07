import React, { useState, useEffect } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  RefreshCw,
  ShieldCheck,
  FileCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  generateRsaKeyPair,
  generateEccKeyPair,
  derivePublicKeyFromPrivatePem
} from '../../utils/keyGenUtils';

export function KeyGeneratorTool() {
  const toast = useToast();
  const [keyType, setKeyType] = useState('RSA-2048'); // 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256' | 'ECDSA-P384'
  const [format, setFormat] = useState('pem'); // 'pem' | 'jwk'
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyData, setKeyData] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Derive Public Key section
  const [deriveInput, setDeriveInput] = useState('');
  const [derivedKey, setDerivedKey] = useState(null);
  const [deriveError, setDeriveError] = useState(null);

  // Generate keys on mount or algorithm change
  const handleGenerate = async (type = keyType) => {
    setIsGenerating(true);
    try {
      let result;
      if (type === 'RSA-2048') {
        result = await generateRsaKeyPair(2048, 'SHA-256');
      } else if (type === 'RSA-4096') {
        result = await generateRsaKeyPair(4096, 'SHA-256');
      } else if (type === 'ECDSA-P256') {
        result = await generateEccKeyPair('P-256');
      } else if (type === 'ECDSA-P384') {
        result = await generateEccKeyPair('P-384');
      }
      setKeyData(result);
      toast.success(`Generated new ${result.algorithm} key pair`);
    } catch (err) {
      toast.error('Key generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate('RSA-2048');
  }, []);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleDerive = async () => {
    if (!deriveInput.trim()) return;
    setDeriveError(null);
    try {
      const res = await derivePublicKeyFromPrivatePem(deriveInput);
      setDerivedKey(res);
      toast.success('Derived matching public key from private key');
    } catch (err) {
      setDerivedKey(null);
      setDeriveError(err.message);
    }
  };

  const currentPublicKey =
    keyData &&
    (format === 'pem'
      ? keyData.publicPem
      : JSON.stringify(keyData.publicJwk, null, 2));

  const currentPrivateKey =
    keyData &&
    (format === 'pem'
      ? keyData.privatePem
      : JSON.stringify(keyData.privateJwk, null, 2));

  return (
    <div className="space-y-4">
      {/* Tool Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span>RSA & ECC Key Pair Generator & Converter</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate cryptographically secure RSA and Elliptic Curve key pairs in-browser using WebCrypto. Export to PEM or JWK.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Algorithm Selector */}
          <select
            value={keyType}
            onChange={(e) => {
              setKeyType(e.target.value);
              handleGenerate(e.target.value);
            }}
            className="p-1 px-2.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="RSA-2048">RSA 2048-bit (Standard)</option>
            <option value="RSA-4096">RSA 4096-bit (High Security)</option>
            <option value="ECDSA-P256">ECDSA P-256 (Fast / Compact)</option>
            <option value="ECDSA-P384">ECDSA P-384 (Suite B)</option>
          </select>

          {/* Regenerate Button */}
          <button
            type="button"
            data-sample-trigger="true"
            onClick={() => handleGenerate(keyType)}
            disabled={isGenerating}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {/* Air-Gapped Trust Guarantee Bar */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            <strong>100% In-Browser Cryptography:</strong> Private keys are generated in your local device RAM via <code className="font-mono">window.crypto.subtle</code> and are NEVER transmitted over the network.
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 font-bold">
          <button
            type="button"
            onClick={() => setFormat('pem')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              format === 'pem' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500/20'
            }`}
          >
            PEM
          </button>
          <button
            type="button"
            onClick={() => setFormat('jwk')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              format === 'jwk' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500/20'
            }`}
          >
            JWK
          </button>
        </div>
      </div>

      {/* Two Column Display: Public Key & Private Key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Public Key Display */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Public Key ({format.toUpperCase()})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => copyText(currentPublicKey, 'Public Key')}
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                title="Copy Public Key"
              >
                {copiedField === 'Public Key' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    currentPublicKey,
                    `public_key_${keyType.toLowerCase()}.${format === 'pem' ? 'pub' : 'json'}`
                  )
                }
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                title="Download Public Key"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={currentPublicKey || 'Generating...'}
            rows={12}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
          />
        </div>

        {/* Private Key Display */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Private Key ({format.toUpperCase()})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                title={showPrivateKey ? 'Mask Private Key' : 'Reveal Private Key'}
              >
                {showPrivateKey ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPrivateKey ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyText(currentPrivateKey, 'Private Key')}
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                title="Copy Private Key"
              >
                {copiedField === 'Private Key' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    currentPrivateKey,
                    `private_key_${keyType.toLowerCase()}.${format === 'pem' ? 'key' : 'json'}`
                  )
                }
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                title="Download Private Key"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              readOnly
              value={
                showPrivateKey
                  ? currentPrivateKey || 'Generating...'
                  : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••\n[Private Key Masked for Screen Privacy — Click "Reveal" above to inspect]'
              }
              rows={12}
              className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono focus:outline-none resize-none transition-all ${
                showPrivateKey ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Public Key Deriver Section */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Derive Public Key from Existing Private Key</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Have an existing RSA or ECDSA PKCS#8 private key and lost its public counterpart? Paste it below to reconstruct the matching public key instantly.
        </p>

        <div className="space-y-2">
          <textarea
            value={deriveInput}
            onChange={(e) => setDeriveInput(e.target.value)}
            placeholder="Paste -----BEGIN PRIVATE KEY----- here..."
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
          />

          <button
            type="button"
            onClick={handleDerive}
            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
          >
            <span>Derive Public Key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {deriveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-mono">
            {deriveError}
          </div>
        )}

        {derivedKey && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
              <span>Derived Public Key ({derivedKey.type})</span>
              <button
                type="button"
                onClick={() => copyText(derivedKey.publicPem, 'Derived Key')}
                className="text-sky-500 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
              {derivedKey.publicPem}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
