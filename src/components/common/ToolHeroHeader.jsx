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
    <div className={`relative p-4 sm:p-5 rounded-2xl glass-panel border border-slate-300 dark:border-white/10 shadow-xs dark:shadow-2xl overflow-hidden mb-4 ${className}`}>
      {/* Studio Ambient Multi-Glow Background */}
      <div className="absolute -top-12 -left-10 w-72 h-36 bg-sky-500/10 dark:bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -top-12 -right-10 w-72 h-36 bg-purple-500/10 dark:bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {/* Eyebrow Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            {category && (
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 font-mono">
                {category}
              </span>
            )}
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-slate-100">
                {badge}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Client-Side Engine</span>
            </div>
          </div>

          {/* H1 Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {description && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Studio Actions Bar */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/[0.06]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

