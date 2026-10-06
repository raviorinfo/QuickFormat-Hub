import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Copy,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  List
} from 'lucide-react';
import { executeRegex, REGEX_PATTERNS } from '../../utils/regexHelper';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function RegexTesterTool() {
  const toast = useToast();
  const [pattern, setPattern] = useState(REGEX_PATTERNS[0].pattern);
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState(REGEX_PATTERNS[0].sample);
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

  const result = useMemo(() => {
    return executeRegex(pattern, flags, testText);
  }, [pattern, flags, testText]);

  const toggleFlag = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const handleSelectPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.sample);
    toast.success(`Loaded "${preset.name}" regex preset`);
  };

  // Build highlighted markup
  const highlightedHtml = useMemo(() => {
    if (!result.valid || result.matches.length === 0 || !testText) {
      return testText || '';
    }

    let lastIdx = 0;
    const pieces = [];

    result.matches.forEach((m, idx) => {
      if (m.index > lastIdx) {
        pieces.push(testText.slice(lastIdx, m.index));
      }
      pieces.push(
        `<mark class="bg-amber-400/30 text-amber-900 dark:text-amber-200 border-b-2 border-amber-500 font-semibold px-0.5 rounded">${m.matchText}</mark>`
      );
      lastIdx = m.index + m.length;
    });

    if (lastIdx < testText.length) {
      pieces.push(testText.slice(lastIdx));
    }

    return pieces.join('');
  }, [result, testText]);

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Search className="w-4 h-4" />
            <span>Regular Expression Debugger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Regex Tester & Pattern Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test regular expressions with real-time match highlighting, capture group inspectors, and production patterns.
          </p>
        </div>

        {/* Matches Badge & Copy Pattern Button */}
        {result.valid && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-mono text-xs font-bold">
              {result.matches.length} Matches Found
            </span>
            <CopyButton
              text={`/${pattern}/${flags}`}
              label="Copy Regex"
              copiedLabel="Regex Copied!"
              variant="default"
            />
          </div>
        )}
      </div>

      {/* Pattern Bar & Flags */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Regex Input with / delimiter visual */}
          <div className="flex-1 w-full flex items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm">
            <span className="text-slate-400 text-lg font-bold select-none mr-2">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. [a-z0-9]+@[a-z]+\.[a-z]{2,}"
              className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none"
            />
            <span className="text-slate-400 text-lg font-bold select-none ml-2">/</span>
            <span className="text-brand-500 font-bold ml-1">{flags}</span>
          </div>

          {/* Flags Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            {['g', 'i', 'm', 's'].map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`w-8 h-8 rounded-lg font-mono font-bold transition-colors ${
                  flags.includes(f)
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title={`Toggle flag: ${f}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if regex syntax is invalid */}
        {!result.valid && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{result.error}</span>
          </div>
        )}

        {/* Pattern Preset Library */}
        <div className="pt-1">
          <span className="text-xs text-slate-400 block mb-2 font-medium">Common Pattern Presets:</span>
          <div className="flex flex-wrap gap-2">
            {REGEX_PATTERNS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test Textarea & Highlight View */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* Left: Input Text */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Test Input Text"
            badge="String"
            linesCount={testText ? testText.split('\n').length : 0}
            charsCount={testText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          />
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to match against..."
            rows={12}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[300px] ${fontSizeClass}`}
          />
        </div>

        {/* Right: Match Highlights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Live Matched Visualizer"
            badge={`${result.matches.length} Matches`}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          />
          <div
            className={`p-4 font-mono leading-relaxed whitespace-pre-wrap min-h-[300px] overflow-auto text-slate-900 dark:text-slate-100 ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Capture Groups Table */}
      {result.valid && result.matches.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Extracted Matches Table"
            badge={`${result.matches.length} Matches`}
          />
          <div className="p-4 overflow-x-auto max-h-[280px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-12 text-center">#</th>
                  <th className="px-3 py-2 w-20">Index</th>
                  <th className="px-3 py-2">Full Match</th>
                  <th className="px-3 py-2">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.matches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 text-slate-500">{m.index}</td>
                    <td className="px-3 py-2 font-semibold text-brand-600 dark:text-brand-400 break-all">
                      {m.matchText}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {m.groups.length > 0 ? m.groups.join(', ') : <span className="text-slate-400 italic">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
