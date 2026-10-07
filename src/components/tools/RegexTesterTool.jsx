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
  Hash,
  Activity,
  Layers
} from 'lucide-react';
import { executeRegex, REGEX_PATTERNS } from '../../utils/regexHelper';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
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
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Search}
        category="Dev & Text Processing"
        badge="ECMAScript RegExp"
        title="Regex Tester & Pattern Library"
        description="Test regular expressions in real-time with syntax-highlighted matched tokens, capture group inspectors, modifier flags, and prebuilt patterns."
        actions={
          <CopyButton
            text={`/${pattern}/${flags}`}
            label="Copy Pattern"
            copiedLabel="Regex Copied!"
            variant="primary"
          />
        }
      />

      {/* Preset Chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={STUDIO_REGEX_PRESETS}
          activeId={activePreset}
          onSelect={handleSelectPreset}
          label="Pattern Library"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Real-time zero-backtrack preview</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Total Matches"
          value={result.valid ? `${result.matches.length} Occurrences` : '0 Matches'}
          subtext={result.valid ? 'Active matches' : 'Failed to match'}
          color={result.valid && result.matches.length > 0 ? 'emerald' : result.valid ? 'slate' : 'rose'}
        />
        <StatCard
          icon={Activity}
          label="Engine Status"
          value={result.valid ? 'Syntax Valid' : 'Syntax Error'}
          subtext="V8 RegExp compile"
          color={result.valid ? 'sky' : 'rose'}
        />
        <StatCard
          icon={Layers}
          label="Active Modifiers"
          value={`/${flags}/`}
          subtext={`${flags.length} active flags`}
          color="purple"
        />
        <StatCard
          icon={Hash}
          label="First Match Index"
          value={result.valid && result.matches.length > 0 ? `Char @ ${result.matches[0].index}` : 'None'}
          subtext="Byte offset index"
          color="amber"
        />
      </div>

      {/* Pattern Bar & Flags */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Regex Input with / delimiter visual */}
          <div className="flex-1 w-full flex items-center code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.1] rounded-xl px-4 py-2.5 font-mono text-sm focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
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
            <span className="text-sky-500 font-bold ml-1.5">{flags}</span>
          </div>

          {/* Flags Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            {['g', 'i', 'm', 's'].map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`w-9 h-9 rounded-xl font-mono font-bold transition-all cursor-pointer ${
                  flags.includes(f)
                    ? 'btn-primary shadow-xs'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200/60 dark:border-white/[0.08]'
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
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* Left: Input Text */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
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
          <div className="p-2">
            <textarea
              value={testText}
              onChange={(e) => {
                setTestText(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Enter text to match against..."
              rows={12}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[300px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Match Highlights */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
          <WindowHeader
            title="Live Matched Visualizer"
            badge={`${result.matches.length} Matches`}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          />
          <div
            className={`p-4 font-mono code-viewport bg-slate-50/50 dark:bg-[#050811] leading-relaxed whitespace-pre-wrap min-h-[316px] overflow-auto text-slate-900 dark:text-slate-100 ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Capture Groups Table */}
      {result.valid && result.matches.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
          <WindowHeader
            title="Extracted Matches Table"
            badge={`${result.matches.length} Records`}
          />
          <div className="p-4 overflow-x-auto max-h-[280px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 sticky top-0 border-b border-slate-200 dark:border-white/[0.08]">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center">#</th>
                  <th className="px-3.5 py-2.5 w-24">Index</th>
                  <th className="px-3.5 py-2.5">Full Match</th>
                  <th className="px-3.5 py-2.5">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {result.matches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-sky-500/5 dark:hover:bg-sky-500/5 transition-colors">
                    <td className="px-3.5 py-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-3.5 py-2.5 text-slate-500 font-mono">[{m.index}:{m.index + m.length}]</td>
                    <td className="px-3.5 py-2.5 font-bold text-sky-600 dark:text-sky-400 break-all">
                      {m.matchText}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                      {m.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.groups.map((g, gIdx) => (
                            <span key={gIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] text-[11px]">
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
