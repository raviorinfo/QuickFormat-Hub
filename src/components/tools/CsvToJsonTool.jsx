import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Wand2,
  Minimize2,
  Trash2,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { csvToJson, SAMPLE_CSV } from '../../utils/csvToJson';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { fireConfetti } from '../../utils/confetti';

export function CsvToJsonTool() {
  const toast = useToast();
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [parseNumbers, setParseNumbers] = useState(true);
  const [parseBooleans, setParseBooleans] = useState(true);
  const [unflatten, setUnflatten] = useState(true);
  const [outputFormat, setOutputFormat] = useState('array'); // 'array' | 'object'
  const [indentation, setIndentation] = useState(2);
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  const [result, setResult] = useState(null);

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

  // Convert CSV to JSON
  useEffect(() => {
    if (!csvInput.trim()) {
      setResult(null);
      return;
    }

    try {
      const res = csvToJson(csvInput, {
        delimiter,
        hasHeader,
        parseNumbers,
        parseBooleans,
        unflatten,
        outputFormat,
      });

      // Format with chosen indentation
      let formattedJson = res.json;
      if (indentation === 0) {
        try {
          formattedJson = JSON.stringify(JSON.parse(res.json));
        } catch {}
      } else if (indentation === 4) {
        try {
          formattedJson = JSON.stringify(JSON.parse(res.json), null, 4);
        } catch {}
      }

      setResult({ ...res, json: formattedJson });
    } catch (err) {
      setResult(null);
    }
  }, [csvInput, delimiter, hasHeader, parseNumbers, parseBooleans, unflatten, outputFormat, indentation]);

  // Download JSON
  const handleDownloadJson = () => {
    if (!result || !result.json) {
      toast.error('No JSON to download');
      return;
    }
    const blob = new Blob([result.json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success('Downloaded .json file!');
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvInput(content);
        toast.success(`Loaded "${file.name}"`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Layers className="w-4 h-4" />
            <span>Spreadsheet Reverser</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CSV & TSV to JSON Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Parse delimited CSV and TSV spreadsheets into structured JSON arrays and nested object hierarchies.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={result ? result.json : ''}
            label="Copy JSON"
            copiedLabel="JSON Copied!"
            targetElementId="csv-json-output"
            variant="default"
          />

          <button
            onClick={handleDownloadJson}
            disabled={!result}
            id="btn-download-json"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT PANE: Input CSV Editor */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Input CSV / TSV"
            badge="Delimited"
            linesCount={csvInput ? csvInput.split('\n').length : 0}
            charsCount={csvInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <label
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Upload CSV/TSV file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                setCsvInput(SAMPLE_CSV);
                toast.success('Sample CSV loaded');
              }}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1"
              title="Reset to Sample CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sample</span>
            </button>

            <button
              onClick={() => {
                setCsvInput('');
                toast.info('Input cleared');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>

          {/* Textarea */}
          <textarea
            id="csv-input-textarea"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Paste CSV or TSV data here..."
            rows={16}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed min-h-[380px] ${fontSizeClass}`}
            spellCheck={false}
          />

          {/* Options Footer Bar */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Delimiter Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="auto">Auto Detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            {/* Unflatten dot notation toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unflatten}
                onChange={(e) => setUnflatten(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Unflatten Dots (a.b)
              </span>
            </label>

            {/* Parse numbers & booleans */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={parseNumbers}
                onChange={(e) => setParseNumbers(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300">Parse Numbers</span>
            </label>

            {/* Header row toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300">First Row Header</span>
            </label>
          </div>
        </div>

        {/* RIGHT PANE: Formatted Output JSON */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated JSON Tree"
            badge="JSON"
            linesCount={result && result.json ? result.json.split('\n').length : 0}
            charsCount={result && result.json ? result.json.length : 0}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Formatting & Indent Toggle */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-1">
              <button
                onClick={() => setIndentation(2)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  indentation === 2
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                2 Sp
              </button>
              <button
                onClick={() => setIndentation(4)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  indentation === 4
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                4 Sp
              </button>
              <button
                onClick={() => setIndentation(0)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  indentation === 0
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Min
              </button>
            </div>

            {result && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                {result.rowCount} Records
              </span>
            )}
          </WindowHeader>

          {/* Body */}
          <div className="p-4 flex-1 flex flex-col">
            {result ? (
              <textarea
                id="csv-json-output"
                readOnly
                value={result.json}
                rows={16}
                className={`w-full flex-1 p-3 font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[380px] ${fontSizeClass}`}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileCode className="w-12 h-12 mb-3 stroke-[1.25]" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Ready to convert CSV
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Enter spreadsheet lines on the left to generate clean JSON.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
