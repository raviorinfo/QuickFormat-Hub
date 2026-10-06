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
  Link2Off
} from 'lucide-react';
import {
  computeLineDiff,
  SAMPLE_DIFF_ORIGINAL,
  SAMPLE_DIFF_MODIFIED,
} from '../../utils/diffEngine';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { fireConfetti } from '../../utils/confetti';

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
    toast.info('Swapped Original and Modified texts');
  };

  // Clear all
  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
    toast.info('Cleared text inputs');
  };

  // Load sample code
  const handleLoadSample = () => {
    setOriginalText(SAMPLE_DIFF_ORIGINAL);
    setModifiedText(SAMPLE_DIFF_MODIFIED);
    toast.success('Sample configuration diff loaded');
  };

  // Generate Diff Report text
  const getReportText = () => {
    const reportLines = [
      `--- Original (${diffResult.stats.deletions} deletions)`,
      `+++ Modified (${diffResult.stats.additions} additions)`,
      `@@ Summary: ${diffResult.stats.additions} added, ${diffResult.stats.deletions} deleted, ${diffResult.stats.unchanged} unchanged @@\n`,
    ];

    diffResult.operations.forEach((op) => {
      if (op.type === 'delete') {
        reportLines.push(`- ${op.origLine}`);
      } else if (op.type === 'insert') {
        reportLines.push(`+ ${op.modLine}`);
      } else {
        reportLines.push(`  ${op.origLine}`);
      }
    });

    return reportLines.join('\n');
  };

  // Download Patch file
  const handleDownloadPatch = () => {
    const patchContent = [
      `# QuickFormat Hub Unified Diff Patch`,
      `# Generated at: ${new Date().toISOString()}`,
      `--- original.txt`,
      `+++ modified.txt`,
      `@@ -${diffResult.stats.deletions} +${diffResult.stats.additions} @@`,
      ...diffResult.operations.map((op) => {
        if (op.type === 'delete') return `-${op.origLine}`;
        if (op.type === 'insert') return `+${op.modLine}`;
        return ` ${op.origLine}`;
      }),
    ].join('\n');

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
    toast.success('Downloaded .patch file!');
  };

  return (
    <div className="space-y-6">
      {/* Tool Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Myers LCS Diff Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Text & Code Difference Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare snippets side-by-side or inline with visual additions (green), deletions (red), and intra-line highlights.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={getReportText}
            label="Copy Diff"
            copiedLabel="Diff Copied!"
            variant="default"
          />

          <button
            onClick={handleDownloadPatch}
            id="btn-download-patch"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Patch</span>
          </button>

          <button
            onClick={handleSwap}
            id="btn-swap-diff"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            title="Swap Original and Modified texts"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </button>
        </div>
      </div>

      {/* Difference Stats & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        {/* Statistics Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
            <Plus className="w-3.5 h-3.5" />
            {diffResult.stats.additions} Additions
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
            <Minus className="w-3.5 h-3.5" />
            {diffResult.stats.deletions} Deletions
          </span>
          <span className="hidden sm:inline text-slate-500">
            {diffResult.stats.unchanged} unchanged lines
          </span>
        </div>

        {/* View Mode & Diff Options */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Synchronized Scroll Toggle */}
          <button
            onClick={() => setSyncScroll(!syncScroll)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              syncScroll
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
            title={syncScroll ? 'Synchronized scroll active' : 'Independent scrolling'}
          >
            {syncScroll ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5 text-slate-400" />}
            <span>Sync Scroll</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Inline (Unified)</span>
            </button>
          </div>

          {/* Whitespace Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span>Ignore Whitespace</span>
          </label>

          {/* Case Sensitivity */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span>Ignore Case</span>
          </label>
        </div>
      </div>

      {/* Inputs Section (Collapsible / Dual Textareas) */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* Left: Original Text Input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Original Text"
            badge="Baseline"
            linesCount={originalText ? originalText.split('\n').length : 0}
            charsCount={originalText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          />
          <textarea
            ref={origTextareaRef}
            onScroll={() => handleScroll('orig')}
            id="diff-original-textarea"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste baseline text or code here..."
            rows={8}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed ${fontSizeClass}`}
            spellCheck={false}
          />
        </div>

        {/* Right: Modified Text Input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Modified Text"
            badge="Target"
            linesCount={modifiedText ? modifiedText.split('\n').length : 0}
            charsCount={modifiedText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            <button
              onClick={handleLoadSample}
              className="text-[11px] text-brand-500 hover:text-brand-400 font-medium px-2 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
            >
              Sample Data
            </button>
            <button
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear both inputs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>
          <textarea
            ref={modTextareaRef}
            onScroll={() => handleScroll('mod')}
            id="diff-modified-textarea"
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text or code here..."
            rows={8}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed ${fontSizeClass}`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Rendered Diff Visualizer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
        <WindowHeader
          title="Diff Comparison View"
          badge={viewMode === 'split' ? 'Side-by-Side' : 'Inline Unified'}
          linesCount={diffResult.operations.length}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
        />

        {/* DIFF CONTENT VIEW */}
        <div className="overflow-x-auto max-h-[560px] font-mono text-xs leading-relaxed select-text">
          {viewMode === 'split' ? (
            /* SIDE-BY-SIDE SPLIT VIEW */
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <th className="w-12 text-center py-1.5 border-r border-slate-200 dark:border-slate-800 font-normal">
                    Orig
                  </th>
                  <th className="w-1/2 text-left px-3 py-1.5 border-r border-slate-200 dark:border-slate-800 font-medium">
                    Original
                  </th>
                  <th className="w-12 text-center py-1.5 border-r border-slate-200 dark:border-slate-800 font-normal">
                    Mod
                  </th>
                  <th className="w-1/2 text-left px-3 py-1.5 font-medium">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {diffResult.sideBySide.map((row, idx) => {
                  const leftIsDel = row.leftType === 'delete';
                  const rightIsIns = row.rightType === 'insert';

                  return (
                    <tr key={idx} className="hover:brightness-95 dark:hover:brightness-110">
                      {/* Left Line Number */}
                      <td
                        className={`text-center py-1 select-none border-r border-slate-200 dark:border-slate-800 text-[11px] ${
                          leftIsDel
                            ? 'bg-rose-500/15 text-rose-500 font-bold'
                            : 'text-slate-400 bg-slate-50 dark:bg-slate-900/50'
                        }`}
                      >
                        {row.leftNum || ''}
                      </td>

                      {/* Left Content */}
                      <td
                        className={`px-3 py-1 border-r border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-all ${
                          leftIsDel
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                            : 'text-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {row.wordDiff?.leftChunks ? (
                          row.wordDiff.leftChunks.map((chunk, cIdx) => (
                            <span
                              key={cIdx}
                              className={
                                chunk.type === 'delete'
                                  ? 'bg-rose-500/30 text-rose-900 dark:text-rose-100 rounded px-0.5 font-semibold'
                                  : ''
                              }
                            >
                              {chunk.text}
                            </span>
                          ))
                        ) : (
                          row.leftContent
                        )}
                      </td>

                      {/* Right Line Number */}
                      <td
                        className={`text-center py-1 select-none border-r border-slate-200 dark:border-slate-800 text-[11px] ${
                          rightIsIns
                            ? 'bg-emerald-500/15 text-emerald-500 font-bold'
                            : 'text-slate-400 bg-slate-50 dark:bg-slate-900/50'
                        }`}
                      >
                        {row.rightNum || ''}
                      </td>

                      {/* Right Content */}
                      <td
                        className={`px-3 py-1 whitespace-pre-wrap break-all ${
                          rightIsIns
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {row.wordDiff?.rightChunks ? (
                          row.wordDiff.rightChunks.map((chunk, cIdx) => (
                            <span
                              key={cIdx}
                              className={
                                chunk.type === 'insert'
                                  ? 'bg-emerald-500/30 text-emerald-900 dark:text-emerald-100 rounded px-0.5 font-semibold'
                                  : ''
                              }
                            >
                              {chunk.text}
                            </span>
                          ))
                        ) : (
                          row.rightContent
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* UNIFIED / INLINE VIEW */
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {diffResult.operations.map((op, idx) => {
                const isAdd = op.type === 'insert';
                const isDel = op.type === 'delete';

                return (
                  <div
                    key={idx}
                    className={`flex items-start px-2 py-0.5 ${
                      isAdd
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : isDel
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                        : 'text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right pr-2 select-none text-slate-400 text-[11px]">
                      {op.origIndex || ''}
                    </span>
                    <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-400 text-[11px]">
                      {op.modIndex || ''}
                    </span>
                    <span
                      className={`w-5 shrink-0 text-center select-none font-bold ${
                        isAdd
                          ? 'text-emerald-500'
                          : isDel
                          ? 'text-rose-500'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {isAdd ? '+' : isDel ? '-' : ' '}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {isAdd ? op.modLine : op.origLine}
                    </span>
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
