import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Trash2,
  Upload,
  RefreshCw,
  Layers,
  Sparkles,
  Table,
  CheckCircle2,
  FileSpreadsheet,
  Binary,
  Database,
  Hash
} from 'lucide-react';
import { csvToJson, SAMPLE_CSV } from '../../utils/csvToJson';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { fireConfetti } from '../../utils/confetti';

const CSV_PRESETS = [
  {
    id: 'employees',
    label: 'Team Directory',
    description: 'Nested dots with departments & salaries',
    data: `id,profile.name,profile.title,department,salary,active
1,Alex Vance,Staff Engineer,Platform,185000,true
2,Jordan Hayes,Product Director,Growth,192000,true
3,Elena Rostova,Security Architect,InfoSec,210000,true
4,Marcus Brody,Data Scientist,Analytics,168000,false`
  },
  {
    id: 'ecommerce',
    label: 'Order Ledgers',
    description: 'Financial transactions & currency codes',
    data: `order_id,customer.email,items_count,total_usd,currency,paid,shipped
ORD-8821,alice@enterprise.io,3,489.50,USD,true,true
ORD-8822,bob@startup.dev,1,49.00,USD,true,false
ORD-8823,carol@agency.co,12,3240.00,EUR,true,true
ORD-8824,david@cloud.org,2,120.00,GBP,false,false`
  },
  {
    id: 'metrics',
    label: 'DevOps Nodes',
    description: 'Cluster health metrics & memory loads',
    data: `host,region,specs.cpu_cores,specs.ram_gb,load_avg,healthy
node-us-east-1a,us-east-1,64,256,1.42,true
node-us-east-1b,us-east-1,64,256,4.89,true
node-eu-west-1a,eu-west-1,32,128,0.78,true
node-ap-south-1a,ap-south-1,16,64,12.45,false`
  }
];

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
  const [activePreset, setActivePreset] = useState(null);

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
        indentation,
      });
      setResult(res);
    } catch {
      setResult(null);
    }
  }, [
    csvInput,
    delimiter,
    hasHeader,
    parseNumbers,
    parseBooleans,
    unflatten,
    outputFormat,
    indentation,
  ]);

  const handleDownloadJson = () => {
    if (!result || !result.json) return;
    const blob = new Blob([result.json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_converted_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success('Exported .json file!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvInput(content);
        setActivePreset(null);
        toast.success(`Loaded "${file.name}"`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectPreset = (preset) => {
    setCsvInput(preset.data);
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" preset`);
  };

  const inputLines = useMemo(() => {
    if (!csvInput) return 0;
    return csvInput.split('\n').filter((l) => l.trim().length > 0).length;
  }, [csvInput]);

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={FileCode}
        category="Data Pipeline"
        badge="In-Browser V8"
        title="CSV & TSV to JSON Converter"
        description="Parse delimited CSV, TSV, and tabular text files into structured JSON arrays and nested object hierarchies with zero network roundtrips."
        actions={
          <>
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
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={CSV_PRESETS}
          activeId={activePreset}
          onSelect={handleSelectPreset}
          label="Sample Spreadsheets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Auto-detects delimiters</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Input Rows"
          value={inputLines.toLocaleString()}
          subtext="Raw spreadsheet lines"
          color="slate"
        />
        <StatCard
          icon={Hash}
          label="Parsed Records"
          value={result ? result.rowCount.toLocaleString() : '0'}
          subtext={hasHeader ? 'Header filtered' : 'Direct rows'}
          color="sky"
        />
        <StatCard
          icon={Table}
          label="Active Delimiter"
          value={delimiter === 'auto' ? 'Auto Detect' : delimiter === ',' ? 'Comma (,)' : delimiter === ';' ? 'Semicolon (;)' : delimiter === '\t' ? 'Tab (\\t)' : delimiter}
          subtext="RFC 4180 parsing"
          color="emerald"
        />
        <StatCard
          icon={Binary}
          label="Output Size"
          value={result && result.json ? `${(new Blob([result.json]).size / 1024).toFixed(1)} KB` : '0 KB'}
          subtext="UTF-8 JSON string"
          color="purple"
        />
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT PANE: Input CSV Editor */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
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
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
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
                setActivePreset(null);
                toast.success('Sample CSV loaded');
              }}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors text-xs font-medium flex items-center gap-1"
              title="Reset to Default Sample"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={() => {
                setCsvInput('');
                setActivePreset(null);
                toast.info('Input cleared');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>

          {/* Textarea */}
          <div className="p-2">
            <textarea
              id="csv-input-textarea"
              value={csvInput}
              onChange={(e) => {
                setCsvInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste CSV or TSV data here..."
              rows={16}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed min-h-[380px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>

          {/* Options Footer Bar with modern ToggleSwitches */}
          <div className="p-4 bg-slate-50/80 dark:bg-[#0b1120]/80 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Delimiter Selection */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="auto">Auto Detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            {/* Toggle Switches */}
            <div className="flex items-center gap-5 flex-wrap">
              <ToggleSwitch
                checked={hasHeader}
                onChange={setHasHeader}
                label="Header Row"
                size="sm"
              />
              <ToggleSwitch
                checked={unflatten}
                onChange={setUnflatten}
                label="Unflatten (a.b)"
                size="sm"
              />
              <ToggleSwitch
                checked={parseNumbers}
                onChange={setParseNumbers}
                label="Parse Numbers"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Formatted Output JSON */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated JSON Tree"
            badge="JSON"
            linesCount={result && result.json ? result.json.split('\n').length : 0}
            charsCount={result && result.json ? result.json.length : 0}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Formatting & Indent Toggle */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs mr-1 border border-slate-200/60 dark:border-white/[0.08]">
              <button
                onClick={() => setIndentation(2)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  indentation === 2
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                2 Sp
              </button>
              <button
                onClick={() => setIndentation(4)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  indentation === 4
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                4 Sp
              </button>
              <button
                onClick={() => setIndentation(0)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  indentation === 0
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Minify
              </button>
            </div>
          </WindowHeader>

          {/* Body */}
          <div className="p-4 flex-1 flex flex-col">
            {result ? (
              <textarea
                id="csv-json-output"
                readOnly
                value={result.json}
                rows={16}
                className={`w-full flex-1 p-3 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[380px] ${fontSizeClass}`}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileCode className="w-12 h-12 mb-3 stroke-[1.25] text-sky-500/60 animate-pulse" />
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
