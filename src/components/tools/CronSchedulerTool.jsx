import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Layers,
  ArrowRight,
  Globe,
  Timer,
  CalendarDays
} from 'lucide-react';
import { parseCronExpression, CRON_PRESETS } from '../../utils/cronParser';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';

const STUDIO_CRON_PRESETS = CRON_PRESETS.map((p) => ({
  id: p.cron,
  label: p.label,
  description: p.cron,
  cron: p.cron
}));

export function CronSchedulerTool() {
  const toast = useToast();
  const [cronInput, setCronInput] = useState('0 9 * * 1-5');
  const [activePreset, setActivePreset] = useState('0 9 * * 1-5');

  const parsed = useMemo(() => parseCronExpression(cronInput), [cronInput]);

  const handleSelectPreset = (preset) => {
    setCronInput(preset.cron);
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" schedule`);
  };

  const nextRunRelative = useMemo(() => {
    if (!parsed.valid || !parsed.nextRuns || parsed.nextRuns.length === 0) return 'Invalid';
    const next = parsed.nextRuns[0];
    const diffMs = next.getTime() - Date.now();
    if (diffMs <= 0) return 'Imminent';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `in ${days}d ${diffHours % 24}h`;
    }
    if (diffHours > 0) return `in ${diffHours}h ${diffMins}m`;
    return `in ${diffMins}m`;
  }, [parsed]);

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Clock}
        category="Dev & Automation"
        badge="POSIX Standard"
        title="Cron Expression Visualizer & Translator"
        description="Translate 5-part cron syntax into clear human language, dissect field parameters, and preview deterministic upcoming execution timestamps in real-time."
        actions={
          <CopyButton
            text={cronInput}
            label="Copy Cron Expression"
            copiedLabel="Cron Copied!"
            variant="primary"
          />
        }
      />

      {/* Preset Chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={STUDIO_CRON_PRESETS}
          activeId={activePreset}
          onSelect={handleSelectPreset}
          label="Production Schedules"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Globe className="w-3.5 h-3.5 text-sky-500" />
          <span>{Intl.DateTimeFormat().resolvedOptions().timeZone || 'Browser Timezone'}</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Timer}
          label="Schedule Status"
          value={parsed.valid ? 'Syntax Valid' : 'Syntax Error'}
          subtext={parsed.valid ? 'UNIX 5-Field standard' : 'Check field inputs'}
          color={parsed.valid ? 'emerald' : 'rose'}
        />
        <StatCard
          icon={Activity}
          label="Next Execution"
          value={nextRunRelative}
          subtext="Deterministic countdown"
          color="sky"
        />
        <StatCard
          icon={CalendarDays}
          label="Recurrence Depth"
          value={parsed.valid && parsed.nextRuns ? `${parsed.nextRuns.length} Runs` : '0 Runs'}
          subtext="Computed in memory"
          color="purple"
        />
        <StatCard
          icon={Globe}
          label="Active Timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local UTC'}
          subtext="Client system context"
          color="amber"
        />
      </div>

      {/* Main Expression Input & Human Translation Banner */}
      <div className="rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
        <WindowHeader
          title="Cron Expression Editor"
          badge="5-Field UNIX"
        />

        <div className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:w-1/2">
              <input
                type="text"
                value={cronInput}
                onChange={(e) => {
                  setCronInput(e.target.value);
                  setActivePreset(null);
                }}
                placeholder="* * * * *"
                className="w-full px-5 py-4 font-mono text-xl font-extrabold code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-center tracking-widest transition-all shadow-inner"
              />
            </div>

            {/* Plain English Translation Pill */}
            <div className={`w-full lg:flex-1 p-4 rounded-xl border flex items-center gap-3.5 transition-all shadow-xs ${
              parsed.valid
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-950 dark:text-rose-100'
            }`}>
              {parsed.valid ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className={`text-[10px] font-bold block uppercase tracking-wider font-mono ${
                  parsed.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {parsed.valid ? 'Plain English Translation' : 'Validation Error'}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {parsed.valid ? parsed.humanText : parsed.error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Anatomy Breakdown Cards */}
      {parsed.valid && parsed.parts && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-center transition-all hover:border-sky-500/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">1. Minute (0-59)</span>
            <span className="font-mono text-xl font-extrabold text-sky-500">{parsed.parts.min}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-center transition-all hover:border-sky-500/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">2. Hour (0-23)</span>
            <span className="font-mono text-xl font-extrabold text-purple-500">{parsed.parts.hour}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-center transition-all hover:border-sky-500/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">3. Day of Mo (1-31)</span>
            <span className="font-mono text-xl font-extrabold text-amber-500">{parsed.parts.dom}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-center transition-all hover:border-sky-500/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">4. Month (1-12)</span>
            <span className="font-mono text-xl font-extrabold text-emerald-500">{parsed.parts.mon}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-center col-span-2 sm:col-span-1 transition-all hover:border-sky-500/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">5. Day of Wk (0-6)</span>
            <span className="font-mono text-xl font-extrabold text-rose-500">{parsed.parts.dow}</span>
          </div>
        </div>
      )}

      {/* Calculated Next Run Occurrences Timeline */}
      {parsed.valid && parsed.nextRuns && parsed.nextRuns.length > 0 && (
        <div className="rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane">
          <WindowHeader
            title="Scheduled Execution Timeline"
            badge="Next 6 Occurrences"
          />

          <div className="p-4 sm:p-6 divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-xs">
            {parsed.nextRuns.map((date, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.03] px-3.5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Immediate Next
                    </span>
                  )}
                </div>

                <span className="text-slate-400 text-[11px] font-mono">
                  ISO: {date.toISOString().replace('T', ' ').slice(0, 16)} UTC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
