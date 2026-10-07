import React, { useState, useEffect, useMemo } from 'react';
import {
  Binary,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FileImage,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Code2,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { textToBase64, base64ToText, SAMPLE_BASE64_TEXT } from '../../utils/base64Utils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { ToggleSwitch } from '../common/ToggleSwitch';

const BASE64_PRESETS = [
  {
    id: 'auth',
    label: 'Basic Auth',
    description: 'username:secret_token header',
    text: 'admin:super_secret_production_key_99',
    direction: 'encode'
  },
  {
    id: 'svg',
    label: 'Inline SVG Vector',
    description: 'Clean SVG icon markup',
    text: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    direction: 'encode'
  },
  {
    id: 'json_payload',
    label: 'Base64 Encoded JSON',
    description: 'Decodable session object',
    text: 'eyJ1c2VySWQiOiJ1c3JfOGE5MTBjYiIsInJvbGUiOiJzdXBlcmFkbWluIiwicGVybWlzc2lvbnMiOlsid3JpdGUiLCJyZWFkIiwiYWRtaW4iXX0=',
    direction: 'decode'
  },
  {
    id: 'unicode',
    label: 'UTF-8 Multilingual',
    description: 'Accents, CJK & Emojis',
    text: 'QuickFormat Hub 🚀 • 日本語 • España • München • 100% Privacy',
    direction: 'encode'
  }
];

export function Base64Tool() {
  const toast = useToast();
  const [activeMode, setActiveMode] = useState('text'); // 'text' | 'file'

  // Text Mode state
  const [textInput, setTextInput] = useState(SAMPLE_BASE64_TEXT);
  const [direction, setDirection] = useState('encode'); // 'encode' | 'decode'
  const [urlSafe, setUrlSafe] = useState(false);
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

  // File Mode state
  const [fileData, setFileData] = useState(null); // { name, type, size, dataUrl, base64 }

  // Compute text output
  const textOutput = useMemo(() => {
    if (!textInput) return '';
    if (direction === 'encode') {
      const res = textToBase64(textInput, urlSafe);
      return res.success ? res.result : `Error: ${res.error}`;
    } else {
      const res = base64ToText(textInput);
      return res.success ? res.result : `Error: ${res.error}`;
    }
  }, [textInput, direction, urlSafe]);

  const handleSelectPreset = (preset) => {
    setTextInput(preset.text);
    setDirection(preset.direction);
    setActivePreset(preset.id);
    setActiveMode('text');
    toast.success(`Loaded "${preset.label}" preset`);
  };

  // Handle file drop/upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1] || '';
      setFileData({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        base64,
      });
      toast.success(`Converted "${file.name}" to Base64`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Binary}
        category="Encoding & Binary"
        badge="RFC 4648"
        title="Base64 Text & Image Encoder / Decoder"
        description="Encode and decode UTF-8 text strings, or convert PNG, JPEG, SVG, and files into instant Base64 Data URLs with zero cloud exposure."
        actions={
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'text'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Text Mode
            </button>
            <button
              onClick={() => setActiveMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'file'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Image & File Mode
            </button>
          </div>
        }
      />

      {/* Preset Chips */}
      {activeMode === 'text' && (
        <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
          <PresetChips
            presets={BASE64_PRESETS}
            activeId={activePreset}
            onSelect={handleSelectPreset}
            label="Common Payloads"
          />

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>RFC 4648 Compliant</span>
          </div>
        </div>
      )}

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Input Size"
          value={activeMode === 'text' ? `${textInput.length} chars` : fileData ? `${(fileData.size / 1024).toFixed(1)} KB` : '0 KB'}
          subtext={activeMode === 'text' ? (direction === 'encode' ? 'UTF-8 String' : 'Base64 Stream') : 'Binary File'}
          color="slate"
        />
        <StatCard
          icon={Binary}
          label="Output Size"
          value={activeMode === 'text' ? `${textOutput.length} chars` : fileData ? `${(fileData.base64.length / 1024).toFixed(1)} KB` : '0 KB'}
          subtext={activeMode === 'text' ? (direction === 'encode' ? 'ASCII Base64' : 'Plain Text') : 'Data URI'}
          color="sky"
        />
        <StatCard
          icon={ArrowRightLeft}
          label="Size Overhead"
          value={direction === 'encode' ? '+33.3%' : '-25.0%'}
          subtext="RFC 4648 bit ratio"
          color="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="Encoding Standard"
          value={urlSafe ? 'URL-Safe RFC 4648' : 'Standard Base64'}
          subtext={urlSafe ? '- and _ substitution' : '+ and / standard'}
          color="purple"
        />
      </div>

      {activeMode === 'text' ? (
        /* TEXT ENCODER / DECODER WORKSPACE */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 glass-panel border border-slate-200/80 dark:border-white/[0.08] rounded-2xl">
            {/* Direction Segmented Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Operation:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
                <button
                  onClick={() => setDirection('encode')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    direction === 'encode'
                      ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Text → Base64 (Encode)
                </button>
                <button
                  onClick={() => setDirection('decode')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    direction === 'decode'
                      ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Base64 → Text (Decode)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <ToggleSwitch
                checked={urlSafe}
                onChange={setUrlSafe}
                label="URL-Safe Base64"
                size="sm"
              />

              <CopyButton
                text={textOutput}
                label="Copy Output"
                copiedLabel="Output Copied!"
                targetElementId="base64-text-output"
                variant="primary"
              />
            </div>
          </div>

          {/* Dual Textareas */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
            {/* Left: Input */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
              <WindowHeader
                title={direction === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Input'}
                badge={direction.toUpperCase()}
                linesCount={textInput ? textInput.split('\n').length : 0}
                charsCount={textInput.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                isZenMode={isZenMode}
                onToggleZen={() => setIsZenMode(!isZenMode)}
              >
                <button
                  onClick={() => {
                    setTextInput('');
                    setActivePreset(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </WindowHeader>
              <div className="p-2">
                <textarea
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    setActivePreset(null);
                  }}
                  placeholder="Type or paste content here..."
                  rows={14}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[340px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>

            {/* Right: Output */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
              <WindowHeader
                title={direction === 'encode' ? 'Base64 Output' : 'Decoded Text Output'}
                badge="Result"
                linesCount={textOutput ? textOutput.split('\n').length : 0}
                charsCount={textOutput.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
              <div className="p-2">
                <textarea
                  id="base64-text-output"
                  readOnly
                  value={textOutput}
                  rows={14}
                  className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[340px] border border-transparent ${fontSizeClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* IMAGE / FILE TO BASE64 DATA URL */
        <div className="space-y-6">
          {/* Upload Drop Zone */}
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-white/[0.1] hover:border-sky-500 rounded-2xl text-center glass-panel transition-colors">
            <FileImage className="w-12 h-12 text-sky-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag and drop an image or file here
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPEG, WebP, SVG, GIF, or PDF (Max 15MB)</p>
            <label className="mt-4 btn-primary cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Result Card */}
          {fileData && (
            <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-white/[0.08]">
                {fileData.type.startsWith('image/') ? (
                  <img
                    src={fileData.dataUrl}
                    alt="Preview"
                    className="w-32 h-32 object-contain rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#050811] p-2"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#050811] flex items-center justify-center">
                    <Binary className="w-12 h-12 text-slate-400" />
                  </div>
                )}

                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {fileData.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {fileData.type} • {(fileData.size / 1024).toFixed(1)} KB
                  </p>
                  <div className="pt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => copyToClipboard(fileData.dataUrl, 'Data URL')}
                      className="btn-primary"
                    >
                      Copy Data URL
                    </button>
                    <button
                      onClick={() => copyToClipboard(`<img src="${fileData.dataUrl}" alt="${fileData.name}" />`, 'HTML Tag')}
                      className="btn-secondary"
                    >
                      Copy &lt;img&gt; Tag
                    </button>
                    <button
                      onClick={() => copyToClipboard(`background-image: url("${fileData.dataUrl}");`, 'CSS')}
                      className="btn-secondary"
                    >
                      Copy CSS
                    </button>
                  </div>
                </div>
              </div>

              {/* Data URL snippet */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  Data URL Preview
                </span>
                <textarea
                  readOnly
                  value={fileData.dataUrl}
                  rows={4}
                  className="w-full p-3 font-mono code-viewport text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
