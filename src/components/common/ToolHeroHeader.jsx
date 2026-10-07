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
    <div className={`relative pb-3 sm:pb-3.5 mb-3 sm:mb-4 border-b border-slate-200/80 dark:border-white/[0.08] ${className}`}>
      {/* Subtle Ambient Backlight Glow */}
      <div className="absolute -top-4 left-1/4 w-64 h-16 bg-sky-500/10 dark:bg-sky-500/15 blur-2xl rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 max-w-3xl">
          {/* Eyebrow Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Icon && (
              <div className="w-6 h-6 rounded-md bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-500 shadow-2xs shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            {category && (
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                {category}
              </span>
            )}
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                {badge}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Air-Gapped Sandbox</span>
            </div>
          </div>

          {/* H1 Heading */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Global Action Cluster */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
