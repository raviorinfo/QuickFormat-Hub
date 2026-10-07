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
  Globe
} from 'lucide-react';
import { parseCronExpression, CRON_PRESETS } from '../../utils/cronParser';
import { useToast } from '../../context/ToastContext';
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
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Clock className="w-4 h-4" />
            <span>Automated Task Schedule Predictor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cron Expression Visualizer & Translator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Translate 5-part cron syntax into plain English and preview upcoming execution timestamps.
          </p>
        </div>

        {/* Copy Button */}
        <CopyButton
          text={cronInput}
          label="Copy Cron Expression"
          copiedLabel="Cron Copied!"
          variant="primary"
        />
      </div>

      {/* Preset Chips */}
      <PresetChips
        presets={STUDIO_CRON_PRESETS}
        activeId={activePreset}
        onSelect={handleSelectPreset}
        title="Production Schedules"
      />

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Schedule Status"
          value={parsed.valid ? 'Syntax Valid' : 'Syntax Error'}
          badge={parsed.valid ? 'UNIX 5-Field' : 'Invalid'}
          color={parsed.valid ? 'emerald' : 'rose'}
        />
        <StatCard
          label="Next Execution"
          value={nextRunRelative}
          badge="Countdown"
          color="brand"
        />
        <StatCard
          label="Recurrence Depth"
          value={parsed.valid && parsed.nextRuns ? `${parsed.nextRuns.length} Predicted` : '0 Runs'}
          badge="Future Runs"
          color="purple"
        />
        <StatCard
          label="Active Timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local UTC'}
          badge="Browser Context"
          color="amber"
        />
      </div>

      {/* Main Expression Input & Human Translation Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
        <WindowHeader
          title="Cron Expression Editor"
          badge="UNIX Syntax"
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
                className="w-full px-5 py-3.5 font-mono text-lg font-bold bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-center tracking-widest transition-all"
              />
            </div>

            {/* Plain English Translation Pill */}
            <div className={`w-full lg:flex-1 p-4 rounded-xl border flex items-center gap-3 transition-colors ${
              parsed.valid
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-100'
            }`}>
              {parsed.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <div className="min-w-0">
                <span className={`text-[10px] font-bold block uppercase tracking-wider ${
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
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-all hover:border-brand-500/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">1. Minute (0-59)</span>
            <span className="font-mono text-lg font-extrabold text-brand-500">{parsed.parts.min}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-all hover:border-brand-500/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">2. Hour (0-23)</span>
            <span className="font-mono text-lg font-extrabold text-brand-500">{parsed.parts.hour}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-all hover:border-brand-500/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">3. Day of Mo (1-31)</span>
            <span className="font-mono text-lg font-extrabold text-brand-500">{parsed.parts.dom}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-all hover:border-brand-500/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">4. Month (1-12)</span>
            <span className="font-mono text-lg font-extrabold text-brand-500">{parsed.parts.mon}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1 transition-all hover:border-brand-500/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">5. Day of Wk (0-6)</span>
            <span className="font-mono text-lg font-extrabold text-brand-500">{parsed.parts.dow}</span>
          </div>
        </div>
      )}

      {/* Calculated Next Run Occurrences Timeline */}
      {parsed.valid && parsed.nextRuns && parsed.nextRuns.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Scheduled Execution Timeline"
            badge="Next 6 Occurrences"
          />

          <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
            {parsed.nextRuns.map((date, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 px-3 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded">
                    {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
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

