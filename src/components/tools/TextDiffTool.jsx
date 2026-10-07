import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  Minus,
  ArrowLeftRight,
  Trash2,
  RefreshCw,
  Copy,
  Download,
  Split,
  AlignLeft,
  Check,
  CheckCircle2,
  Code2,
  FileText,
  SlidersHorizontal,
  Sparkles,
  Link2,
  Link2Off,
  Zap,
  Percent,
  CheckSquare
} from 'lucide-react';
import {
  computeLineDiff,
  SAMPLE_DIFF_ORIGINAL,
  SAMPLE_DIFF_MODIFIED,
} from '../../utils/diffEngine';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { PresetChips } from '../common/PresetChips';
import { StatCard } from '../common/StatCard';
import { fireConfetti } from '../../utils/confetti';

const DIFF_PRESETS = [
  {
    id: 'api',
    label: 'API JSON Payload',
    description: 'REST API response schema with added fields and modified status',
    orig: `{\n  "status": 200,\n  "data": {\n    "user_id": 4921,\n    "tier": "free",\n    "rate_limit": 100\n  }\n}`,
    mod: `{\n  "status": 200,\n  "data": {\n    "user_id": 4921,\n    "tier": "enterprise",\n    "rate_limit": 10000,\n    "sso_enabled": true\n  }\n}`,
  },
  {
    id: 'config',
    label: 'Docker Compose YAML',
    description: 'Service configuration version bump and environment variables',
    orig: `version: '3.8'\nservices:\n  app:\n    image: node:18-alpine\n    ports:\n      - "3000:3000"\n    environment:\n      NODE_ENV: development`,
    mod: `version: '3.8'\nservices:\n  app:\n    image: node:20-alpine\n    ports:\n      - "3000:3000"\n    environment:\n      NODE_ENV: production\n      LOG_LEVEL: debug`,
  },
  {
    id: 'sql',
    label: 'SQL Query Refactor',
    description: 'Optimization of database query with index hints and join syntax',
    orig: `SELECT u.id, u.name, o.total\nFROM users u, orders o\nWHERE u.id = o.user_id\nAND o.status = 'completed';`,
    mod: `SELECT u.id, u.name, SUM(o.total) AS lifetime_value\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.name;`,
  },
];

export function TextDiffTool() {
  const toast = useToast();
  const [originalText, setOriginalText] = useState(SAMPLE_DIFF_ORIGINAL);
  const [modifiedText, setModifiedText] = useState(SAMPLE_DIFF_MODIFIED);
  const [viewMode, setViewMode] = useState('split'); // 'split' (side-by-side) | 'unified' (inline)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const [isZenMode, setIsZenMode] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [activePreset, setActivePreset] = useState(null);

  const origTextareaRef = useRef(null);
  const modTextareaRef = useRef(null);
  const isScrollingSyncRef = useRef(false);

  // Synchronized scrolling handler
  const handleScroll = (source) => {
    if (!syncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (source === 'orig' && origTextareaRef.current && modTextareaRef.current) {
      modTextareaRef.current.scrollTop = origTextareaRef.current.scrollTop;
    } else if (source === 'mod' && origTextareaRef.current && modTextareaRef.current) {
      origTextareaRef.current.scrollTop = modTextareaRef.current.scrollTop;
    }

    requestAnimationFrame(() => {
      isScrollingSyncRef.current = false;
    });
  };

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
      : 'text-xs leading-relaxed';

  // Compute diff
  const diffResult = useMemo(() => {
    return computeLineDiff(originalText, modifiedText, {
      ignoreWhitespace,
      ignoreCase,
    });
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  // Swap Original & Modified
  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    setActivePreset(null);
    toast.info('Swapped Original and Modified text');
  };

  // Reset Sample
  const handleLoadSample = () => {
    setOriginalText(SAMPLE_DIFF_ORIGINAL);
    setModifiedText(SAMPLE_DIFF_MODIFIED);
    setActivePreset(null);
    toast.success('Baseline sample code restored');
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
    setActivePreset(null);
    toast.info('Cleared inputs');
  };

  const handleSelectPreset = (preset) => {
    setOriginalText(preset.orig);
    setModifiedText(preset.mod);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label}`);
  };

  // Export Unified Patch Report
  const getReportText = () => {
    return [
      `--- Baseline`,
      `+++ Target`,
      `@@ -1,${diffResult.stats.origLines} +1,${diffResult.stats.modLines} @@`,
      ...diffResult.operations.map((op) => {
        if (op.type === 'delete') return `-${op.origLine}`;
        if (op.type === 'insert') return `+${op.modLine}`;
        return ` ${op.origLine}`;
      }),
    ].join('\n');
  };

  const handleDownloadPatch = () => {
    const patchContent = getReportText();
    const blob = new Blob([patchContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_diff_${Date.now()}.patch`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success('Exported .patch file!');
  };

  const similarityScore = useMemo(() => {
    const totalLines = Math.max(1, diffResult.stats.origLines, diffResult.stats.modLines);
    return `${Math.round((diffResult.stats.unchanged / totalLines) * 100)}%`;
  }, [diffResult]);

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={GitCompare}
        category="Docs & Code Review"
        badge="Myers LCS"
        title="Text & Code Difference Checker"
        description="Compare source code and documents side-by-side or inline with visual additions (green), deletions (red), synchronized viewport scrolling, and patch exporting."
        actions={
          <>
            <button
              onClick={handleSwap}
              id="btn-swap-diff"
              className="btn-secondary"
              title="Swap Original and Modified texts"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-sky-500" />
              <span>Swap</span>
            </button>

            <CopyButton
              text={getReportText}
              label="Copy Patch"
              copiedLabel="Patch Copied!"
              variant="default"
            />

            <button
              onClick={handleDownloadPatch}
              id="btn-download-patch"
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Patch</span>
            </button>
          </>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={DIFF_PRESETS}
          onSelect={handleSelectPreset}
          activeId={activePreset}
          label="1-Click Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Myers algorithm O((N+M)D)</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Plus}
          label="Additions"
          value={`+${diffResult.stats.additions}`}
          subtext="Inserted lines"
          color="emerald"
        />
        <StatCard
          icon={Minus}
          label="Deletions"
          value={`-${diffResult.stats.deletions}`}
          subtext="Removed lines"
          color="rose"
        />
        <StatCard
          icon={CheckSquare}
          label="Unchanged"
          value={diffResult.stats.unchanged.toString()}
          subtext="Identical lines"
          color="sky"
        />
        <StatCard
          icon={Percent}
          label="Similarity"
          value={similarityScore}
          subtext="Matching baseline"
          color="purple"
        />
      </div>

      {/* Difference Options Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 glass-panel rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/[0.08]">
        {/* Synchronized Scroll Toggle */}
        <div className="flex items-center gap-4">
          <ToggleSwitch
            label="Sync Scroll"
            checked={syncScroll}
            onChange={setSyncScroll}
            size="sm"
          />

          <ToggleSwitch
            label="Ignore Space"
            checked={ignoreWhitespace}
            onChange={setIgnoreWhitespace}
            size="sm"
          />

          <ToggleSwitch
            label="Ignore Case"
            checked={ignoreCase}
            onChange={setIgnoreCase}
            size="sm"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'unified'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Inline</span>
          </button>
        </div>
      </div>

      {/* Inputs Section (Dual Textareas) */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* Left: Original Text Input */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="Original Baseline Text"
            badge="Original"
            linesCount={originalText ? originalText.split('\n').length : 0}
            charsCount={originalText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          />
          <div className="p-2">
            <textarea
              ref={origTextareaRef}
              onScroll={() => handleScroll('orig')}
              id="diff-original-textarea"
              value={originalText}
              onChange={(e) => {
                setOriginalText(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste baseline text or code here..."
              rows={8}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Modified Text Input */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="Modified Target Text"
            badge="Target"
            linesCount={modifiedText ? modifiedText.split('\n').length : 0}
            charsCount={modifiedText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            <button
              onClick={handleLoadSample}
              className="text-xs text-sky-500 hover:text-sky-400 font-semibold px-2 py-0.5 rounded hover:bg-sky-500/10 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear both inputs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>
          <div className="p-2">
            <textarea
              ref={modTextareaRef}
              onScroll={() => handleScroll('mod')}
              id="diff-modified-textarea"
              value={modifiedText}
              onChange={(e) => {
                setModifiedText(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste modified text or code here..."
              rows={8}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Rendered Diff Visualizer */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
        <WindowHeader
          title="Diff Comparison View"
          badge={viewMode === 'split' ? 'Side-by-Side' : 'Inline Unified'}
          linesCount={diffResult.operations.length}
        >
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-emerald-500 font-bold">+{diffResult.stats.additions}</span>
            <span>/</span>
            <span className="text-rose-500 font-bold">-{diffResult.stats.deletions}</span>
          </div>
        </WindowHeader>

        {/* Diff Result List */}
        <div className="overflow-x-auto max-h-[560px] p-2 bg-slate-50/50 dark:bg-[#050811] font-mono">
          {viewMode === 'split' ? (
            /* Split View */
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-white/[0.08]">
              {/* Left Column (Original) */}
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {diffResult.operations.map((op, idx) => {
                  const isDel = op.type === 'delete';
                  const isIns = op.type === 'insert';
                  return (
                    <div
                      key={`left-${idx}`}
                      className={`flex items-start text-xs ${
                        isDel
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : isIns
                          ? 'bg-slate-100/30 dark:bg-slate-900/20 opacity-30'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]">
                        {op.origIndex || ''}
                      </span>
                      <span className="w-6 py-1 select-none text-center font-bold shrink-0 text-rose-500">
                        {isDel ? '-' : ''}
                      </span>
                      <pre className="py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all">
                        {op.origLine || (isIns ? <span className="opacity-0">~</span> : '')}
                      </pre>
                    </div>
                  );
                })}
              </div>

              {/* Right Column (Modified) */}
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {diffResult.operations.map((op, idx) => {
                  const isDel = op.type === 'delete';
                  const isIns = op.type === 'insert';
                  return (
                    <div
                      key={`right-${idx}`}
                      className={`flex items-start text-xs ${
                        isIns
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : isDel
                          ? 'bg-slate-100/30 dark:bg-slate-900/20 opacity-30'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]">
                        {op.modIndex || ''}
                      </span>
                      <span className="w-6 py-1 select-none text-center font-bold shrink-0 text-emerald-500">
                        {isIns ? '+' : ''}
                      </span>
                      <pre className="py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all">
                        {op.modLine || (isDel ? <span className="opacity-0">~</span> : '')}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Unified Inline View */
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {diffResult.operations.map((op, idx) => {
                const isDel = op.type === 'delete';
                const isIns = op.type === 'insert';
                return (
                  <div
                    key={idx}
                    className={`flex items-start text-xs ${
                      isIns
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : isDel
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]">
                      {op.origIndex || ''}
                    </span>
                    <span className="w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]">
                      {op.modIndex || ''}
                    </span>
                    <span className={`w-6 py-1 select-none text-center font-bold shrink-0 ${isIns ? 'text-emerald-500' : isDel ? 'text-rose-500' : ''}`}>
                      {isIns ? '+' : isDel ? '-' : ' '}
                    </span>
                    <pre className="py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all">
                      {isIns ? op.modLine : op.origLine}
                    </pre>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
