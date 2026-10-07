import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  FileCode,
  Globe,
  Tag
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  computeSriHashes,
  generateSriHtmlTag,
  validateSriIntegrity,
  SAMPLE_SRI_JS
} from '../../utils/sriUtils';

export function SriGeneratorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'validate'
  const [scriptContent, setScriptContent] = useState(SAMPLE_SRI_JS);
  const [cdnUrl, setCdnUrl] = useState('https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js');
  const [tagType, setTagType] = useState('script'); // 'script' | 'link'
  const [selectedAlgo, setSelectedAlgo] = useState('sha384'); // 'sha384' | 'sha256' | 'sha512'
  const [hashes, setHashes] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Validation tab state
  const [expectedTagInput, setExpectedTagInput] = useState('');
  const [validationContent, setValidationContent] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  // Compute hashes whenever scriptContent changes
  useEffect(() => {
    let isMounted = true;
    if (!scriptContent) {
      setHashes(null);
      return;
    }
    computeSriHashes(scriptContent)
      .then((res) => {
        if (isMounted) setHashes(res);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      isMounted = false;
    };
  }, [scriptContent]);

  // Run validation
  const handleValidate = async () => {
    if (!expectedTagInput.trim() || !validationContent.trim()) return;
    try {
      const res = await validateSriIntegrity(expectedTagInput, validationContent);
      setValidationResult(res);
      if (res.matched) {
        toast.success('Integrity Verified: Content matches the expected SRI hash!');
      } else {
        toast.error('Integrity Mismatch: Content does NOT match the expected SRI hash!');
      }
    } catch (err) {
      toast.error('Validation error: ' + err.message);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e, isValidation = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        if (isValidation) {
          setValidationContent(text);
        } else {
          setScriptContent(text);
          setCdnUrl(`https://cdn.example.com/${file.name}`);
        }
        toast.success(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const activeHash = hashes ? hashes[selectedAlgo] : '';
  const htmlTag = useMemo(
    () => generateSriHtmlTag(cdnUrl, activeHash, tagType),
    [cdnUrl, activeHash, tagType]
  );

  return (
    <div className="space-y-4">
      {/* Tool Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>Subresource Integrity (SRI) Hash & Tag Generator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate tamper-proof sha384-, sha256-, and sha512- integrity hashes and ready-to-use HTML CDN tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-sample-trigger="true"
            onClick={() => {
              setScriptContent(SAMPLE_SRI_JS);
              setCdnUrl('https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js');
              setTagType('script');
              toast.success('Loaded Alpine.js sample bundle');
            }}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sample Bundle</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'generate'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Generate SRI Hashes & HTML Tags</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('validate')}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'validate'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Validate Existing SRI Tag</span>
        </button>
      </div>

      {/* Tab 1: Generate SRI Hashes */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up">
          {/* Left Column: Input Code & CDN URL */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Script or Stylesheet Source Content</span>
                <label className="text-sky-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".js,.css,.mjs,.txt"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                placeholder="Paste the minified JavaScript or CSS file contents here..."
                rows={9}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    CDN Asset URL
                  </label>
                  <input
                    type="text"
                    value={cdnUrl}
                    onChange={(e) => setCdnUrl(e.target.value)}
                    placeholder="https://cdn.example.com/lib.min.js"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Tag Type
                  </label>
                  <select
                    value={tagType}
                    onChange={(e) => setTagType(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="script">&lt;script&gt; (JS)</option>
                    <option value="link">&lt;link&gt; (CSS)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Computed SRI Hashes & HTML Tag */}
          <div className="lg:col-span-6 space-y-4">
            {/* Hash Badges */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] pb-2 flex items-center justify-between">
                <span>Calculated Integrity Strings</span>
                <span className="text-[10px] text-emerald-500 font-mono">100% In-Browser</span>
              </div>

              {hashes ? (
                <div className="space-y-2.5">
                  {/* SHA-384 (Recommended) */}
                  <div
                    onClick={() => setSelectedAlgo('sha384')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedAlgo === 'sha384'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">SHA-384</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                          W3C Recommended
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(hashes.sha384, 'SHA-384 Hash');
                        }}
                        className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'SHA-384 Hash' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all">
                      {hashes.sha384}
                    </div>
                  </div>

                  {/* SHA-256 */}
                  <div
                    onClick={() => setSelectedAlgo('sha256')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAlgo === 'sha256'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">SHA-256</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(hashes.sha256, 'SHA-256 Hash');
                        }}
                        className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'SHA-256 Hash' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all">
                      {hashes.sha256}
                    </div>
                  </div>

                  {/* SHA-512 */}
                  <div
                    onClick={() => setSelectedAlgo('sha512')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAlgo === 'sha512'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">SHA-512</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(hashes.sha512, 'SHA-512 Hash');
                        }}
                        className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'SHA-512 Hash' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all">
                      {hashes.sha512}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Enter script code on the left to calculate SRI integrity.
                </div>
              )}
            </div>

            {/* Ready-to-Paste HTML Tag */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-sky-500" />
                  Ready-to-Paste HTML Tag
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(htmlTag, 'HTML Tag')}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  {copiedField === 'HTML Tag' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy HTML Tag</span>
                </button>
              </div>

              <div className="code-viewport p-3 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
                {htmlTag}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Validate Existing SRI Tag */}
      {activeTab === 'validate' && (
        <div className="glass-panel rounded-2xl p-5 space-y-4 animate-slide-up max-w-3xl mx-auto">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 dark:text-white">
              Expected SRI Tag or Hash
            </label>
            <input
              type="text"
              value={expectedTagInput}
              onChange={(e) => setExpectedTagInput(e.target.value)}
              placeholder='e.g. sha384-xyz... or <script src="..." integrity="sha384-..." crossorigin="anonymous"></script>'
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Actual Resource Content</span>
              <label className="text-sky-500 hover:underline cursor-pointer flex items-center gap-1 text-[11px]">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".js,.css,.mjs,.txt"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              value={validationContent}
              onChange={(e) => setValidationContent(e.target.value)}
              placeholder="Paste the received script or stylesheet text to verify its authenticity..."
              rows={6}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleValidate}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validate Integrity Match</span>
          </button>

          {validationResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                validationResult.matched
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationResult.matched ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>INTEGRITY VERIFIED: Content Authentic</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <span>INTEGRITY MISMATCH: Potential Supply Chain Tamper</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {validationResult.matched
                  ? `The computed cryptographic digest matches the expected ${validationResult.algorithmUsed} hash. The resource has not been altered.`
                  : `The computed hash does NOT match the integrity attribute. Modern browsers will block this resource from executing.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
