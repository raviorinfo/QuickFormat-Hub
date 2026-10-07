import React, { useState, useMemo, useEffect } from 'react';
import {
  Binary,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCode,
  Sliders,
} from 'lucide-react';
import {
  generateBatch,
  inspectId,
} from '../../utils/uuidUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { fireConfetti } from '../../utils/confetti';

export function UuidGeneratorTool() {
  const toast = useToast();
  const [idType, setIdType] = useState('v7'); // 'v7' | 'v4' | 'ulid' | 'nanoid'
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [formatMode, setFormatMode] = useState('lines'); // 'lines' | 'json' | 'csv'
  const [generatedList, setGeneratedList] = useState([]);

  // Inspector state
  const [inspectInput, setInspectInput] = useState('');
  const inspectedData = useMemo(() => inspectId(inspectInput), [inspectInput]);

  const handleGenerate = () => {
    const list = generateBatch(idType, count, { uppercase, hyphens, braces });
    setGeneratedList(list);
  };

  useEffect(() => {
    handleGenerate();
  }, [idType, count, uppercase, hyphens, braces]);

  const formattedOutput = useMemo(() => {
    if (formatMode === 'json') {
      return JSON.stringify(generatedList, null, 2);
    }
    if (formatMode === 'csv') {
      return generatedList.join(', ');
    }
    return generatedList.join('\n');
  }, [generatedList, formatMode]);

  const handleDownload = () => {
    const ext = formatMode === 'json' ? 'json' : 'txt';
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_${idType}_batch.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success(`Exported ${generatedList.length} ${idType.toUpperCase()} identifiers!`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Binary}
        category="Identification & Keys"
        badge="RFC 9562 & ULID"
        title="UUID (v4/v7), ULID & NanoID Generator"
        description="Batch generate cryptographically secure UUID v4, timestamp-ordered UUID v7 (RFC 9562), ULID, and NanoIDs. Inspect and decode embedded creation timestamps directly in browser."
        actions={
          <>
            <CopyButton
              text={() => formattedOutput}
              label="Copy All"
              copiedLabel="Copied!"
              targetElementId="uuid-batch-output"
            />
            <button
              onClick={handleDownload}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Batch</span>
            </button>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Binary}
          label="Active Standard"
          value={idType === 'v7' ? 'UUID v7 (Time)' : idType === 'v4' ? 'UUID v4 (Random)' : idType.toUpperCase()}
          subtext="Cryptographic generator"
          color="sky"
        />
        <StatCard
          icon={Layers}
          label="Batch Size"
          value={generatedList.length.toString()}
          subtext="Identifiers created"
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Sort Order"
          value={idType === 'v7' || idType === 'ulid' ? 'Monotonic' : 'Non-ordered'}
          subtext={idType === 'v7' || idType === 'ulid' ? 'Database index optimized' : 'Pure random'}
          color="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="Entropy"
          value="CSPRNG"
          subtext="window.crypto native"
          color="amber"
        />
      </div>

      {/* Generator Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Type Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08] overflow-x-auto">
            {[
              { id: 'v7', label: 'UUID v7 (Time-Ordered)' },
              { id: 'v4', label: 'UUID v4 (Random)' },
              { id: 'ulid', label: 'ULID' },
              { id: 'nanoid', label: 'NanoID' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setIdType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  idType === t.id
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Batch</span>
          </button>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <span>Quantity: {count}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Output:</span>
            <select
              value={formatMode}
              onChange={(e) => setFormatMode(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 shadow-xs cursor-pointer"
            >
              <option value="lines">Newline Separated</option>
              <option value="json">JSON Array</option>
              <option value="csv">Comma Separated</option>
            </select>
          </div>

          <ToggleSwitch
            label="UPPERCASE"
            checked={uppercase}
            onChange={setUppercase}
            size="sm"
          />

          <ToggleSwitch
            label="Hyphens (-)"
            checked={hyphens}
            onChange={setHyphens}
            size="sm"
          />
        </div>
      </div>

      {/* Main Dual Workspace: Output & Decoder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Output List Box */}
        <div
          id="uuid-batch-output"
          className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col min-h-[440px]"
        >
          <WindowHeader
            title="Generated Identifiers"
            badge={`${generatedList.length} items`}
            linesCount={generatedList.length}
          >
            <CopyButton
              text={() => formattedOutput}
              label="Copy"
              variant="subtle"
            />
          </WindowHeader>

          <div className="p-2 flex-1 flex flex-col">
            <textarea
              readOnly
              value={formattedOutput}
              rows={16}
              className="w-full flex-1 p-4 font-mono text-xs sm:text-sm code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sky-600 dark:text-sky-300 focus:outline-none resize-none leading-relaxed min-h-[380px]"
            />
          </div>
        </div>

        {/* Decoder / Inspector */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-500" />
              <span>UUIDv7 & ULID Timestamp Inspector</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste any UUIDv7 or ULID string to extract its embedded creation time.
            </p>
          </div>

          <input
            type="text"
            value={inspectInput}
            onChange={(e) => setInspectInput(e.target.value)}
            placeholder="Paste UUIDv7 or ULID (e.g. 018f3a5b-9c24-7000-8000-...) to inspect..."
            className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />

          {inspectedData && !inspectedData.error ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valid {inspectedData.type}</span>
                </span>
                {inspectedData.version && (
                  <span className="text-[10px] font-mono text-slate-400 bg-black/20 px-2 py-0.5 rounded">
                    Version {inspectedData.version}
                  </span>
                )}
              </div>

              {inspectedData.timestampMs && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-white/[0.04]">
                    <span className="text-slate-500">Creation Epoch:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inspectedData.timestampMs} ms
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-white/[0.04]">
                    <span className="text-slate-500">ISO 8601 Date:</span>
                    <span className="font-mono font-bold text-sky-500">
                      {inspectedData.date}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Local Time:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {inspectedData.localDate}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : inspectedData?.error ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {inspectedData.error}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
              Copy any UUIDv7 from the left panel and paste here to decode its millisecond creation timestamp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
