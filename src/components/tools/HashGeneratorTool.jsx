import React, { useState, useEffect, useMemo } from 'react';
import {
  Fingerprint,
  KeyRound,
  FileCheck,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Lock,
  Layers,
  ShieldCheck,
  Binary,
  Upload,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  computeSubtleHash,
  computeFileHash,
  computeHmac,
  md5,
  generateRandomSecret,
  calculateEntropy,
  formatHash,
  verifyChecksumMatch,
} from '../../utils/hashUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { fireConfetti } from '../../utils/confetti';

export function HashGeneratorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file' | 'secret'
  const [textInput, setTextInput] = useState('QuickFormat Hub — Secure Client-Side Utilities');
  const [hmacSecret, setHmacSecret] = useState('');
  const [hashFormat, setHashFormat] = useState('hex-lower'); // 'hex-lower' | 'hex-upper' | 'base64'
  const [expectedChecksum, setExpectedChecksum] = useState('');
  const [hashes, setHashes] = useState({
    sha256: '',
    sha512: '',
    sha384: '',
    sha1: '',
    md5: '',
    hmac256: '',
  });

  // File Checksum state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHashes, setFileHashes] = useState({ sha256: '', sha1: '', sha512: '', calculating: false });

  // Secret Generator state
  const [secretLength, setSecretLength] = useState(32);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedSecret, setGeneratedSecret] = useState('');

  // Generate initial secret
  useEffect(() => {
    handleRegenerateSecret();
  }, [secretLength, includeUpper, includeLower, includeNumbers, includeSymbols]);

  const handleRegenerateSecret = () => {
    const sec = generateRandomSecret({
      length: secretLength,
      includeUppercase: includeUpper,
      includeLowercase: includeLower,
      includeNumbers: includeNumbers,
      includeSymbols: includeSymbols,
    });
    setGeneratedSecret(sec);
  };

  const entropy = useMemo(() => calculateEntropy(generatedSecret), [generatedSecret]);

  // Compute live hashes for text
  useEffect(() => {
    let active = true;
    async function runHash() {
      if (!textInput) {
        setHashes({ sha256: '', sha512: '', sha384: '', sha1: '', md5: '', hmac256: '' });
        return;
      }
      const [s256, s512, s384, s1, md5Val] = await Promise.all([
        computeSubtleHash(textInput, 'SHA-256'),
        computeSubtleHash(textInput, 'SHA-512'),
        computeSubtleHash(textInput, 'SHA-384'),
        computeSubtleHash(textInput, 'SHA-1'),
        Promise.resolve(md5(textInput)),
      ]);

      let hmacVal = '';
      if (hmacSecret) {
        hmacVal = await computeHmac(textInput, hmacSecret, 'SHA-256');
      }

      if (active) {
        setHashes({
          sha256: s256,
          sha512: s512,
          sha384: s384,
          sha1: s1,
          md5: md5Val,
          hmac256: hmacVal,
        });
      }
    }
    runHash();
    return () => {
      active = false;
    };
  }, [textInput, hmacSecret]);

  // Live Checksum Verification Matcher
  const verificationResult = useMemo(() => {
    const activeHashes = activeTab === 'file'
      ? { sha256: fileHashes.sha256, sha1: fileHashes.sha1, sha512: fileHashes.sha512 }
      : hashes;
    return verifyChecksumMatch(expectedChecksum, activeHashes);
  }, [expectedChecksum, hashes, fileHashes, activeTab]);

  // Handle local file drop / select
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileHashes({ sha256: '', sha1: '', sha512: '', calculating: true });
    try {
      const [s256, s1, s512] = await Promise.all([
        computeFileHash(file, 'SHA-256'),
        computeFileHash(file, 'SHA-1'),
        computeFileHash(file, 'SHA-512'),
      ]);
      setFileHashes({ sha256: s256, sha1: s1, sha512: s512, calculating: false });
      toast.success(`Computed checksums for "${file.name}"!`);
      fireConfetti();
    } catch (err) {
      setFileHashes({ sha256: 'Error calculating file hash', sha1: '', sha512: '', calculating: false });
      toast.error('Failed to compute file checksum');
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Fingerprint}
        category="Cryptography & Integrity"
        badge="FIPS PUB 180-4"
        title="Web Crypto Hash & Secret Generator"
        description="Compute SHA-256, SHA-512, MD5, and HMAC checksums directly in browser using native Web Crypto APIs. Verify file integrity and generate cryptographically secure secrets."
        actions={
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Text Hashes
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'file'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              File Checksum
            </button>
            <button
              onClick={() => setActiveTab('secret')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'secret'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Key Generator
            </button>
          </div>
        }
      />

      {/* Executive Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Binary}
          label="SHA-256 Digest"
          value={hashes.sha256 ? `${hashes.sha256.slice(0, 10)}...` : '—'}
          subtext="256-bit cryptographic digest"
          color="sky"
        />
        <StatCard
          icon={Lock}
          label="Entropy Rating"
          value={activeTab === 'secret' ? `${entropy.bits} bits` : 'Standard'}
          subtext={activeTab === 'secret' ? entropy.score : 'FIPS 180-4 standard'}
          color={activeTab === 'secret' && entropy.bits >= 80 ? 'emerald' : 'purple'}
        />
        <StatCard
          icon={ShieldCheck}
          label="Security Standard"
          value="SubtleCrypto"
          subtext="Hardware-accelerated C++"
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Privacy Mode"
          value="Air-Gapped"
          subtext="Zero network payload"
          color="amber"
        />
      </div>

      {/* TAB 1: Text Hasher & HMAC */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
            <WindowHeader
              title="Input Text to Hash"
              badge="Plaintext"
              charsCount={textInput.length}
            >
              <button
                onClick={() => {
                  setTextInput('');
                  setHmacSecret('');
                  toast.info('Input cleared');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </WindowHeader>

            <div className="p-3.5 space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter string or secret text to compute hashes..."
                rows={4}
                className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Optional HMAC Secret:
                </span>
                <input
                  type="text"
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  placeholder="Enter HMAC Secret Key to compute HMAC-SHA256..."
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Format Selector & Checksum Matcher Bar */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Output Format:
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/[0.06] p-0.5 border border-slate-200/60 dark:border-white/[0.08]">
                {[
                  { id: 'hex-lower', label: 'Hex (lower)' },
                  { id: 'hex-upper', label: 'HEX (UPPER)' },
                  { id: 'base64', label: 'Base64' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setHashFormat(fmt.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-mono font-medium transition-all ${
                      hashFormat === fmt.id
                        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={expectedChecksum}
                  onChange={(e) => setExpectedChecksum(e.target.value)}
                  placeholder="Paste expected checksum to verify match..."
                  className="w-full pl-3 pr-20 py-1.5 text-xs font-mono bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
                {expectedChecksum && (
                  <button
                    onClick={() => setExpectedChecksum('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
              {expectedChecksum && verificationResult && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                    verificationResult.isMatch
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  }`}
                >
                  {verificationResult.isMatch ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MATCH ({verificationResult.matchedAlgo})</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>NO MATCH</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Digest Cards List */}
          <div className="space-y-3">
            {[
              { id: 'sha256', label: 'SHA-256', raw: hashes.sha256, bits: '256 bits (64 hex)', badge: 'Recommended' },
              { id: 'sha512', label: 'SHA-512', raw: hashes.sha512, bits: '512 bits (128 hex)', badge: 'Maximum Security' },
              { id: 'sha384', label: 'SHA-384', raw: hashes.sha384, bits: '384 bits (96 hex)', badge: 'NSA Suite B' },
              { id: 'sha1', label: 'SHA-1', raw: hashes.sha1, bits: '160 bits (40 hex)', badge: 'Git / Legacy' },
              { id: 'md5', label: 'MD5', raw: hashes.md5, bits: '128 bits (32 hex)', badge: 'Legacy Checksum' },
              ...(hmacSecret ? [{ id: 'hmac256', label: 'HMAC-SHA256', raw: hashes.hmac256, bits: 'Keyed Digest', badge: 'Authenticity' }] : []),
            ].map((item) => {
              const formattedVal = formatHash(item.raw, hashFormat);
              const isItemMatched = verificationResult?.isMatch && verificationResult?.matchedAlgo === item.id.toUpperCase();
              return (
                <div
                  key={item.id}
                  className={`glass-panel p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isItemMatched
                      ? 'border-emerald-500/80 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500/40'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                        {item.bits}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                      {isItemMatched && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <CheckCircle2 className="w-3 h-3" /> Exact Checksum Match
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                      {formattedVal || '—'}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <CopyButton
                      text={() => formattedVal}
                      label="Copy"
                      copiedLabel="Copied!"
                      variant="subtle"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: File Checksum */}
      {activeTab === 'file' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-500" />
                <span>In-Browser Local File Checksum (Zero Upload)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select or drop any file to compute its cryptographic hash. The file is read directly from local memory and is never uploaded anywhere.
              </p>
            </div>

            {/* Format toggle in file tab */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/[0.06] p-0.5 border border-slate-200/60 dark:border-white/[0.08] self-start sm:self-center">
              {[
                { id: 'hex-lower', label: 'Hex (lower)' },
                { id: 'hex-upper', label: 'HEX (UPPER)' },
                { id: 'base64', label: 'Base64' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setHashFormat(fmt.id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono font-medium transition-all ${
                    hashFormat === fmt.id
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-sky-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.02]">
            <Upload className="w-10 h-10 text-slate-400 mb-3 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedFile ? selectedFile.name : 'Click to select or drop a local file'}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports binaries, ISOs, documents, and archives'}
            </span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Checksum verification matcher for files */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={expectedChecksum}
              onChange={(e) => setExpectedChecksum(e.target.value)}
              placeholder="Paste expected file checksum to verify integrity..."
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            {expectedChecksum && verificationResult && (
              <div
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  verificationResult.isMatch
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                }`}
              >
                {verificationResult.isMatch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED ({verificationResult.matchedAlgo})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CHECKSUM MISMATCH</span>
                  </>
                )}
              </div>
            )}
          </div>

          {fileHashes.calculating && (
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 text-xs font-mono text-center animate-pulse">
              Computing hardware-accelerated SHA-256, SHA-1, and SHA-512 digests...
            </div>
          )}

          {fileHashes.sha256 && (
            <div className="space-y-3">
              {[
                { id: 'sha256', label: 'SHA-256 Checksum', raw: fileHashes.sha256 },
                { id: 'sha1', label: 'SHA-1 Checksum', raw: fileHashes.sha1 },
                { id: 'sha512', label: 'SHA-512 Checksum', raw: fileHashes.sha512 },
              ].map((fItem) => {
                const formatted = formatHash(fItem.raw, hashFormat);
                const isMatch = verificationResult?.isMatch && verificationResult?.matchedAlgo === fItem.id.toUpperCase();
                return (
                  <div
                    key={fItem.id}
                    className={`glass-panel p-4 rounded-2xl border transition-all space-y-2 ${
                      isMatch
                        ? 'border-emerald-500/80 bg-emerald-500/5'
                        : 'border-slate-200/80 dark:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{fItem.label}</span>
                        {isMatch && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Matches expected
                          </span>
                        )}
                      </span>
                      <CopyButton
                        text={() => formatted}
                        label="Copy"
                        copiedLabel="Copied!"
                        variant="subtle"
                      />
                    </div>
                    <p className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all bg-black/20 p-3 rounded-xl">
                      {formatted}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Cryptographic Secret Generator */}
      {activeTab === 'secret' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-500" />
              <span>Cryptographic Random Secret & API Key Generator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generates high-entropy secrets using browser-native CSPRNG (<code className="font-mono text-sky-500">window.crypto.getRandomValues</code>).
            </p>
          </div>

          {/* Generated Secret Display Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-mono">Generated Output</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  {entropy.score} ({entropy.bits} bits)
                </span>
                <button
                  onClick={handleRegenerateSecret}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                  title="Generate New Secret"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="font-mono text-sm sm:text-base text-sky-600 dark:text-sky-400 break-all select-all font-bold">
              {generatedSecret}
            </p>

            <div className="flex justify-end pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
              <CopyButton
                text={() => generatedSecret}
                label="Copy Secret"
                copiedLabel="Copied!"
                variant="default"
              />
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Secret Length: {secretLength} characters</span>
                <span className="text-slate-400 font-mono">{secretLength * 8} bits raw</span>
              </div>
              <input
                type="range"
                min="8"
                max="128"
                value={secretLength}
                onChange={(e) => setSecretLength(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
              <ToggleSwitch
                label="A-Z Uppercase"
                checked={includeUpper}
                onChange={setIncludeUpper}
                size="sm"
              />
              <ToggleSwitch
                label="a-z Lowercase"
                checked={includeLower}
                onChange={setIncludeLower}
                size="sm"
              />
              <ToggleSwitch
                label="0-9 Numbers"
                checked={includeNumbers}
                onChange={setIncludeNumbers}
                size="sm"
              />
              <ToggleSwitch
                label="!@# Symbols"
                checked={includeSymbols}
                onChange={setIncludeSymbols}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
