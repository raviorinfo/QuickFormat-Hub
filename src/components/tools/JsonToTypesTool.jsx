import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  Wand2
} from 'lucide-react';
import {
  generateTypeScript,
  generateZod,
  generatePydantic,
  generateSql,
  SAMPLE_SCHEMA_JSON,
} from '../../utils/jsonTypeGenerator';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { fireConfetti } from '../../utils/confetti';

export function JsonToTypesTool() {
  const toast = useToast();
  const [jsonInput, setJsonInput] = useState(SAMPLE_SCHEMA_JSON);
  const [targetLang, setTargetLang] = useState('ts'); // 'ts' | 'zod' | 'pydantic' | 'sql'
  const [rootName, setRootName] = useState('OrderPayload');
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

  // Parse JSON
  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  // Generate Code
  const generatedCode = useMemo(() => {
    if (!parsedJson) {
      return '// Enter valid JSON on the left to generate strongly typed models.';
    }

    try {
      switch (targetLang) {
        case 'ts':
          return generateTypeScript(parsedJson, rootName);
        case 'zod':
          return generateZod(parsedJson, rootName);
        case 'pydantic':
          return generatePydantic(parsedJson, rootName);
        case 'sql':
          return generateSql(parsedJson, rootName.toLowerCase());
        default:
          return generateTypeScript(parsedJson, rootName);
      }
    } catch (e) {
      return `// Error generating schema: ${e.message}`;
    }
  }, [parsedJson, targetLang, rootName]);

  const handleDownloadCode = () => {
    const extMap = { ts: 'ts', zod: 'ts', pydantic: 'py', sql: 'sql' };
    const ext = extMap[targetLang] || 'ts';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${rootName}_schema.${ext}`);
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
            <Layers className="w-4 h-4" />
            <span>Multi-Language Type Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            JSON to TypeScript, Zod, Pydantic & SQL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Turn JSON payloads into TypeScript interfaces, Zod runtime validators, Python Pydantic v2 models, and SQL tables.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={generatedCode}
            label="Copy Code"
            copiedLabel="Code Copied!"
            targetElementId="json-types-output"
            variant="default"
          />

          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Schema</span>
          </button>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT: JSON input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Input JSON Payload"
            badge="JSON"
            linesCount={jsonInput ? jsonInput.split('\n').length : 0}
            charsCount={jsonInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => {
                setJsonInput(SAMPLE_SCHEMA_JSON);
                toast.success('Sample JSON loaded');
              }}
              className="text-xs text-brand-500 hover:text-brand-400 font-medium px-1.5 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
            >
              Sample
            </button>
            <button
              onClick={() => setJsonInput('')}
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON object here..."
            rows={18}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] ${fontSizeClass}`}
          />
        </div>

        {/* RIGHT: Generated Schema Tabs */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated Schema & Models"
            badge={targetLang.toUpperCase()}
            linesCount={generatedCode ? generatedCode.split('\n').length : 0}
            charsCount={generatedCode.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-1">
              <button
                onClick={() => setTargetLang('ts')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  targetLang === 'ts'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                TS
              </button>
              <button
                onClick={() => setTargetLang('zod')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  targetLang === 'zod'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Zod
              </button>
              <button
                onClick={() => setTargetLang('pydantic')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  targetLang === 'pydantic'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Pydantic
              </button>
              <button
                onClick={() => setTargetLang('sql')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  targetLang === 'sql'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                SQL
              </button>
            </div>

            {/* Model Name Input */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[10px]">Name:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-20 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </WindowHeader>

          {/* Generated Code Area */}
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              id="json-types-output"
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
