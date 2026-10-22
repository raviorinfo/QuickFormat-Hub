import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function ToolHeroHeader({
  badge = null,
  category = null,
  title,
  description,
  icon: Icon = null,
  actions = null,
  className = '',
}) {
  return (
    <div className={`relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xs mb-3.5 transition-all ${className}`}>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1 max-w-3xl">
          {/* Eyebrow Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && (
              <div className="w-6 h-6 rounded-md bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            {category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {category}
              </span>
            )}
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {badge}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>100% Client-Side Engine</span>
            </div>
          </div>

          {/* H1 Title */}
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Studio Actions Bar */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

