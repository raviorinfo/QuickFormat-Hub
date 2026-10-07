import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Globe,
  Copy,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  parseTimestampInput,
  MAJOR_TIMEZONES,
} from '../../utils/timestampUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';

export function TimestampConverterTool() {
  const toast = useToast();
  const [currentNow, setCurrentNow] = useState(Date.now());
  const [isLiveClockPaused, setIsLiveClockPaused] = useState(false);
  const [inputValue, setInputValue] = useState(String(Math.floor(Date.now() / 1000)));

  // Live clock ticker
  useEffect(() => {
    if (isLiveClockPaused) return;
    const interval = setInterval(() => {
      setCurrentNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveClockPaused]);

  const parsed = useMemo(() => parseTimestampInput(inputValue), [inputValue]);

  const PRESETS = [
    {
      id: 'now',
      label: 'Right Now',
      description: 'Current real-time Unix timestamp',
      val: () => Math.floor(Date.now() / 1000),
    },
    {
      id: '1h_ago',
      label: '1 Hour Ago',
      description: 'Past timestamp (-3600s)',
      val: () => Math.floor(Date.now() / 1000) - 3600,
    },
    {
      id: '24h_ago',
      label: '24 Hours Ago',
      description: 'Yesterday (-86400s)',
      val: () => Math.floor(Date.now() / 1000) - 86400,
    },
    {
      id: 'y2038',
      label: 'Year 2038 (32-bit limit)',
      description: 'Unix Epoch overflow timestamp (2147483647)',
      val: () => 2147483647,
    },
  ];

  const handleAdjust = (secondsDelta) => {
    if (!parsed || parsed.error) return;
    const nextSec = parsed.seconds + secondsDelta;
    setInputValue(String(nextSec));
    toast.info(`Adjusted by ${secondsDelta > 0 ? `+${secondsDelta}s` : `${secondsDelta}s`}`);
  };

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Clock}
        category="Time & Synchronization"
        badge="POSIX Epoch"
        title="Unix Timestamp & Timezone Converter"
        description="Convert seconds and milliseconds epoch timestamps to ISO 8601, UTC, and local timezones. Includes live real-time clock ticker, relative time, and global city timezone matrices."
        actions={
          <div className="flex items-center gap-2 bg-slate-900/80 dark:bg-black/60 border border-slate-700 dark:border-white/10 px-3.5 py-1.5 rounded-xl font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${isLiveClockPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-slate-400">Current Epoch:</span>
            <span className="font-bold text-white tracking-wider">
              {Math.floor(currentNow / 1000)}
            </span>
            <button
              onClick={() => setIsLiveClockPaused(!isLiveClockPaused)}
              className="text-[10px] text-sky-400 hover:text-sky-300 ml-1 underline cursor-pointer"
            >
              {isLiveClockPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PRESETS}
          onSelect={(p) => {
            const v = p.val();
            setInputValue(String(v));
            toast.success(`Loaded "${p.label}"`);
          }}
          label="Quick Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Globe className="w-3.5 h-3.5 text-sky-500" />
          <span>Local Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Epoch Seconds"
          value={parsed && !parsed.error ? parsed.seconds.toString() : '—'}
          subtext="Standard 10-digit format"
          color="sky"
        />
        <StatCard
          icon={Activity}
          label="Milliseconds"
          value={parsed && !parsed.error ? parsed.milliseconds.toString() : '—'}
          subtext="JavaScript / Java timestamp"
          color="purple"
        />
        <StatCard
          icon={Calendar}
          label="Relative Time"
          value={parsed && !parsed.error ? parsed.relativeText : '—'}
          subtext="From current moment"
          color="emerald"
        />
        <StatCard
          icon={Globe}
          label="Local Time"
          value={parsed && !parsed.error ? parsed.dateObj.toLocaleTimeString() : '—'}
          subtext={parsed && !parsed.error ? parsed.dateObj.toLocaleDateString() : 'Awaiting input'}
          color="amber"
        />
      </div>

      {/* Input Converter Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>Enter Unix Timestamp or Human Date</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports epoch seconds (1791350000), milliseconds, ISO 8601 strings, or standard dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputValue(String(Math.floor(Date.now() / 1000)))}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Set to Current Time
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1791350000 or 2026-10-07T06:30:00Z..."
            className="flex-1 px-4 py-2.5 font-mono text-sm bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
          />
          <CopyButton
            text={() => inputValue}
            label="Copy"
            copiedLabel="Copied!"
            variant="default"
          />
        </div>

        {/* Timestamp Math Quick-Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-xs">
          <span className="text-slate-400 font-medium">Quick Adjust:</span>
          <button onClick={() => handleAdjust(-3600)} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
            -1 Hour
          </button>
          <button onClick={() => handleAdjust(-86400)} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
            -1 Day
          </button>
          <button onClick={() => handleAdjust(3600)} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
            +1 Hour
          </button>
          <button onClick={() => handleAdjust(86400)} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
            +1 Day
          </button>
          <button onClick={() => handleAdjust(604800)} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
            +1 Week
          </button>
        </div>

        {parsed?.error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{parsed.error}</span>
          </div>
        )}
      </div>

      {/* Formatted Date Formats Breakdown */}
      {parsed && !parsed.error && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Standard Formatted Representations</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'ISO 8601 (RFC 3339)', val: parsed.iso8601 },
              { label: 'UTC Format', val: parsed.utcString },
              { label: 'Local System Time', val: parsed.localString },
              { label: 'Relative Offset', val: parsed.relativeText },
            ].map((f) => (
              <div
                key={f.label}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block">{f.label}</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                    {f.val}
                  </span>
                </div>
                <CopyButton text={() => f.val} label="Copy" variant="subtle" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Timezone City Matrix */}
      {parsed && !parsed.error && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>Global Timezone Comparison Matrix</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">8 Key Financial Hubs</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-[#0e1628]/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-white/[0.06]">
                <tr>
                  <th className="px-4 py-2.5">Region / City</th>
                  <th className="px-4 py-2.5">Zone Code</th>
                  <th className="px-4 py-2.5">Localized Date & Time</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono">
                {parsed.timezones.map((tz) => (
                  <tr key={tz.id} className="hover:bg-sky-500/5 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {tz.label}
                    </td>
                    <td className="px-4 py-2.5 text-sky-500 font-semibold">{tz.id}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{tz.formatted}</td>
                    <td className="px-4 py-2.5 text-right font-sans">
                      <CopyButton text={() => tz.formatted} label="Copy" variant="subtle" />
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
