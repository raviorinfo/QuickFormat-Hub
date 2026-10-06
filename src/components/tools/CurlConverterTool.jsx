import React, { useState, useMemo, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Code2,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  parseCurl,
  generateFetchCode,
  generateAxiosCode,
  generatePythonRequests,
  generateGoCode,
  SAMPLE_CURL,
} from '../../utils/curlParser';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { fireConfetti } from '../../utils/confetti';

export function CurlConverterTool() {
  const toast = useToast();
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [langTab, setLangTab] = useState('fetch'); // 'fetch' | 'axios' | 'python' | 'go'
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

  const parsed = useMemo(() => parseCurl(curlInput), [curlInput]);

  const generatedCode = useMemo(() => {
    if (!parsed || !parsed.url) {
      return '// Enter a valid cURL command (e.g. curl -X GET "https://api.example.com").';
    }

    switch (langTab) {
      case 'fetch':
        return generateFetchCode(parsed);
      case 'axios':
        return generateAxiosCode(parsed);
      case 'python':
        return generatePythonRequests(parsed);
      case 'go':
        return generateGoCode(parsed);
      default:
        return generateFetchCode(parsed);
    }
  }, [parsed, langTab]);

  const handleDownloadCode = () => {
    const extMap = { fetch: 'js', axios: 'js', python: 'py', go: 'go' };
    const ext = extMap[langTab] || 'js';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_request_${langTab}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success(`Downloaded .${ext} file!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Terminal className="w-4 h-4" />
            <span>cURL to Multi-Language Transpiler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            cURL to Multi-Language Code Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Convert browser network requests into modern JavaScript Fetch, Axios, Python Requests, and Go code.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={generatedCode}
            label="Copy Code"
            copiedLabel="Code Copied!"
            targetElementId="curl-generated-code"
            variant="default"
          />

          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Script</span>
          </button>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT: Raw cURL input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="cURL Command Input"
            badge="Shell"
            linesCount={curlInput ? curlInput.split('\n').length : 0}
            charsCount={curlInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => {
                setCurlInput(SAMPLE_CURL);
                toast.success('Sample cURL loaded');
              }}
              className="text-xs text-brand-500 hover:text-brand-400 font-medium px-1.5 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
            >
              Sample
            </button>
            <button
              onClick={() => setCurlInput('')}
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>
          <textarea
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            placeholder="Paste cURL command here (e.g. curl -X POST 'https://api.example.com'...)..."
            rows={18}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] ${fontSizeClass}`}
          />
        </div>

        {/* RIGHT: Generated Code Tabs */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated Client Code"
            badge={langTab.toUpperCase()}
            linesCount={generatedCode ? generatedCode.split('\n').length : 0}
            charsCount={generatedCode.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-1">
              <button
                onClick={() => setLangTab('fetch')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  langTab === 'fetch'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Fetch
              </button>
              <button
                onClick={() => setLangTab('axios')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  langTab === 'axios'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Axios
              </button>
              <button
                onClick={() => setLangTab('python')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  langTab === 'python'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLangTab('go')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  langTab === 'go'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Go
              </button>
            </div>

            {parsed && parsed.url && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                {parsed.method}
              </span>
            )}
          </WindowHeader>

          {/* Generated Code Area */}
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              id="curl-generated-code"
              readOnly
              value={generatedCode}
              rows={18}
              className={`w-full flex-1 p-3 font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[400px] ${fontSizeClass}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
