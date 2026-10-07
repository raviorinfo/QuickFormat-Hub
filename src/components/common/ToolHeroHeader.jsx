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
    <div className={`relative pb-6 border-b border-slate-200/80 dark:border-white/10 ${className}`}>
      {/* Subtle Ambient Backlight Glow */}
      <div className="absolute -top-6 left-1/4 w-96 h-28 bg-sky-500/10 dark:bg-sky-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          {/* Eyebrow Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-500 shadow-sm shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            {category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                {category}
              </span>
            )}
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                {badge}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Air-Gapped & Client-Side</span>
            </div>
          </div>

          {/* H1 Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Global Action Cluster */}
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
