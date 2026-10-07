import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Copy,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  List,
  Target,
  Hash
} from 'lucide-react';
import { executeRegex, REGEX_PATTERNS } from '../../utils/regexHelper';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';

const STUDIO_REGEX_PRESETS = REGEX_PATTERNS.map((p) => ({
  id: p.name,
  label: p.name,
  description: p.description,
  pattern: p.pattern,
  flags: p.flags,
  sample: p.sample
}));

export function RegexTesterTool() {
  const toast = useToast();
  const [pattern, setPattern] = useState(REGEX_PATTERNS[0].pattern);
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState(REGEX_PATTERNS[0].sample);
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState(REGEX_PATTERNS[0].name);

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
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" regex preset`);
  };

  // Build highlighted markup
  const highlightedHtml = useMemo(() => {
    if (!result.valid || result.matches.length === 0 || !testText) {
      return testText || '';
    }

    let lastIdx = 0;
    const pieces = [];

    result.matches.forEach((m) => {
      if (m.index > lastIdx) {
        pieces.push(testText.slice(lastIdx, m.index));
      }
      pieces.push(
        `<mark class="bg-amber-400/25 text-amber-900 dark:text-amber-200 border-b-2 border-amber-500 font-semibold px-0.5 rounded shadow-xs">${m.matchText}</mark>`
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

        {/* Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={`/${pattern}/${flags}`}
            label="Copy Pattern"
            copiedLabel="Regex Copied!"
            variant="default"
          />
        </div>
      </div>

      {/* Preset Chips */}
      <PresetChips
        presets={STUDIO_REGEX_PRESETS}
        activeId={activePreset}
        onSelect={handleSelectPreset}
        title="Pattern Library"
      />

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Matches"
          value={result.valid ? `${result.matches.length} Occurrences` : '0 Matches'}
          badge={result.valid ? 'Executed' : 'Failed'}
          color={result.valid && result.matches.length > 0 ? 'emerald' : result.valid ? 'slate' : 'rose'}
        />
        <StatCard
          label="Engine Status"
          value={result.valid ? 'Syntax Valid' : 'Syntax Error'}
          badge="ECMAScript RegExp"
          color={result.valid ? 'brand' : 'rose'}
        />
        <StatCard
          label="Active Modifiers"
          value={`/${flags}/`}
          badge={`${flags.length} Flags`}
          color="purple"
        />
        <StatCard
          label="First Match Index"
          value={result.valid && result.matches.length > 0 ? `Char @ ${result.matches[0].index}` : 'None'}
          badge="Offset"
          color="amber"
        />
      </div>

      {/* Pattern Bar & Flags */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Regex Input with / delimiter visual */}
          <div className="flex-1 w-full flex items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-mono text-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <span className="text-slate-400 text-lg font-bold select-none mr-2">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                setActivePreset(null);
              }}
              placeholder="e.g. [a-z0-9]+@[a-z]+\.[a-z]{2,}"
              className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none"
              spellCheck={false}
            />
            <span className="text-slate-400 text-lg font-bold select-none ml-2">/</span>
            <span className="text-brand-500 font-bold ml-1.5">{flags}</span>
          </div>

          {/* Flags Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            {['g', 'i', 'm', 's'].map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`w-9 h-9 rounded-xl font-mono font-bold transition-all ${
                  flags.includes(f)
                    ? 'bg-brand-500 text-white shadow-xs scale-105'
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
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{result.error}</span>
          </div>
        )}
      </div>

      {/* Test Textarea & Highlight View */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* Left: Input Text */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Test Input Text"
            badge="Target String"
            linesCount={testText ? testText.split('\n').length : 0}
            charsCount={testText.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          />
          <textarea
            value={testText}
            onChange={(e) => {
              setTestText(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Enter text to match against..."
            rows={12}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[300px] ${fontSizeClass}`}
            spellCheck={false}
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
            badge={`${result.matches.length} Records`}
          />
          <div className="p-4 overflow-x-auto max-h-[280px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center">#</th>
                  <th className="px-3.5 py-2.5 w-24">Index</th>
                  <th className="px-3.5 py-2.5">Full Match</th>
                  <th className="px-3.5 py-2.5">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.matches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3.5 py-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-3.5 py-2.5 text-slate-500 font-mono">[{m.index}:{m.index + m.length}]</td>
                    <td className="px-3.5 py-2.5 font-bold text-brand-600 dark:text-brand-400 break-all">
                      {m.matchText}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                      {m.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.groups.map((g, gIdx) => (
                            <span key={gIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]">
                              ${gIdx + 1}: {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
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

