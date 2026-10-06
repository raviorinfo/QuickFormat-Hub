import React, { useState, useEffect } from 'react';
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
  Code2
} from 'lucide-react';
import { textToBase64, base64ToText, SAMPLE_BASE64_TEXT } from '../../utils/base64Utils';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function Base64Tool() {
  const toast = useToast();
  const [activeMode, setActiveMode] = useState('text'); // 'text' | 'file'

  // Text Mode state
  const [textInput, setTextInput] = useState(SAMPLE_BASE64_TEXT);
  const [direction, setDirection] = useState('encode'); // 'encode' | 'decode'
  const [urlSafe, setUrlSafe] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

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
  const textOutput = React.useMemo(() => {
    if (!textInput) return '';
    if (direction === 'encode') {
      const res = textToBase64(textInput, urlSafe);
      return res.success ? res.result : `Error: ${res.error}`;
    } else {
      const res = base64ToText(textInput);
      return res.success ? res.result : `Error: ${res.error}`;
    }
  }, [textInput, direction, urlSafe]);

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

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Binary className="w-4 h-4" />
            <span>Serialization & Data URI Utility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Base64 Text & Image Encoder / Decoder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Encode and decode UTF-8 text, or convert images and assets into instant Base64 Data URLs.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'text'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Text Mode
          </button>
          <button
            onClick={() => setActiveMode('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'file'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Image & File Mode
          </button>
        </div>
      </div>

      {activeMode === 'text' ? (
        /* TEXT ENCODER / DECODER WORKSPACE */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Operation:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setDirection('encode')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    direction === 'encode'
                      ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Text → Base64 (Encode)
                </button>
                <button
                  onClick={() => setDirection('decode')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    direction === 'decode'
                      ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Base64 → Text (Decode)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 dark:text-slate-300">URL-Safe Base64</span>
              </label>

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
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
            {/* Left: Input */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
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
                  onClick={() => setTextInput('')}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </WindowHeader>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste content here..."
                rows={14}
                className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[320px] ${fontSizeClass}`}
              />
            </div>

            {/* Right: Output */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title={direction === 'encode' ? 'Base64 Output' : 'Decoded Text Output'}
                badge="Result"
                linesCount={textOutput ? textOutput.split('\n').length : 0}
                charsCount={textOutput.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
              <textarea
                id="base64-text-output"
                readOnly
                value={textOutput}
                rows={14}
                className={`w-full p-4 font-mono bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[320px] ${fontSizeClass}`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* IMAGE / FILE TO BASE64 DATA URL */
        <div className="space-y-6">
          {/* Upload Drop Zone */}
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-brand-500 rounded-2xl text-center bg-white dark:bg-slate-900/60 transition-colors">
            <FileImage className="w-12 h-12 text-brand-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag and drop an image or file here
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPEG, WebP, SVG, GIF, or PDF (Max 15MB)</p>
            <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white cursor-pointer transition-colors shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Result Card */}
          {fileData && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                {fileData.type.startsWith('image/') ? (
                  <img
                    src={fileData.dataUrl}
                    alt="Preview"
                    className="w-32 h-32 object-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
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
                      onClick={() => handleCopy(fileData.dataUrl, 'Data URL')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                    >
                      Copy Data URL
                    </button>
                    <button
                      onClick={() => handleCopy(`<img src="${fileData.dataUrl}" alt="${fileData.name}" />`, 'HTML Tag')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      Copy &lt;img&gt; Tag
                    </button>
                    <button
                      onClick={() => handleCopy(`background-image: url("${fileData.dataUrl}");`, 'CSS')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      Copy CSS
                    </button>
                  </div>
                </div>
              </div>

              {/* Data URL snippet */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Data URL Preview
                </span>
                <textarea
                  readOnly
                  value={fileData.dataUrl}
                  rows={4}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
