import React, { useState, useMemo } from 'react';
import {
  Clock,
  Copy,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { parseCronExpression, CRON_PRESETS } from '../../utils/cronParser';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function CronSchedulerTool() {
  const toast = useToast();
  const [cronInput, setCronInput] = useState('0 9 * * 1-5');

  const parsed = useMemo(() => parseCronExpression(cronInput), [cronInput]);

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

      {/* Main Expression Input & Human Translation Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
        <WindowHeader
          title="Cron Expression Editor"
          badge="UNIX 5-Field"
        />

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              placeholder="* * * * *"
              className="w-full sm:w-1/2 px-4 py-3 font-mono text-base font-bold bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 text-center tracking-widest"
            />

            {/* Plain English Translation Pill */}
            <div className="w-full sm:flex-1 p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 block uppercase">
                  Plain English Schedule
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {parsed.valid ? parsed.humanText : parsed.error}
                </p>
              </div>
            </div>
          </div>

          {/* Presets Chips */}
          <div className="pt-2">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.cron}
                  onClick={() => setCronInput(preset.cron)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                    cronInput === preset.cron
                      ? 'bg-brand-500 text-white border-brand-500 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {preset.label} <span className="opacity-60 text-[10px] ml-1">({preset.cron})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Field Anatomy Breakdown Cards */}
      {parsed.valid && parsed.parts && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">1. Minute (0-59)</span>
            <span className="font-mono text-base font-bold text-brand-500">{parsed.parts.min}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">2. Hour (0-23)</span>
            <span className="font-mono text-base font-bold text-brand-500">{parsed.parts.hour}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">3. Day of Month (1-31)</span>
            <span className="font-mono text-base font-bold text-brand-500">{parsed.parts.dom}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">4. Month (1-12)</span>
            <span className="font-mono text-base font-bold text-brand-500">{parsed.parts.mon}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">5. Day of Week (0-6)</span>
            <span className="font-mono text-base font-bold text-brand-500">{parsed.parts.dow}</span>
          </div>
        </div>
      )}

      {/* Calculated Next Run Occurrences */}
      {parsed.valid && parsed.nextRuns && parsed.nextRuns.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Scheduled Execution Timestamps"
            badge="Next 6 Runs"
          />

          <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
            {parsed.nextRuns.map((date, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-brand-500">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <span className="text-slate-400 text-[11px]">
                  UTC: {date.toISOString().replace('T', ' ').slice(0, 16)}Z
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
