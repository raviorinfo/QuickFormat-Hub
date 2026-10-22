import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { playSuccessChime } from '../../utils/audioFeedback';
import { useToast } from '../../context/ToastContext';

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext = null,
  copyable = true,
  badge = null,
  color = 'sky', // 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'brand' | 'slate'
  className = '',
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!copyable || !value) return;

    navigator.clipboard.writeText(String(value));
    setCopied(true);
    playSuccessChime();
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 1800);
  };

  const colorThemes = {
    sky: {
      topBorder: 'from-sky-400 to-blue-500',
      badgeText: 'text-sky-500 dark:text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/20',
      cornerGlow: 'bg-sky-500/10',
    },
    brand: {
      topBorder: 'from-sky-400 to-brand-500',
      badgeText: 'text-brand-500 dark:text-brand-400',
      badgeBg: 'bg-brand-500/10 border-brand-500/20',
      cornerGlow: 'bg-brand-500/10',
    },
    emerald: {
      topBorder: 'from-emerald-400 to-teal-500',
      badgeText: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
      cornerGlow: 'bg-emerald-500/10',
    },
    amber: {
      topBorder: 'from-amber-400 to-orange-500',
      badgeText: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
      cornerGlow: 'bg-amber-500/10',
    },
    purple: {
      topBorder: 'from-purple-400 to-indigo-500',
      badgeText: 'text-purple-500 dark:text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/20',
      cornerGlow: 'bg-purple-500/10',
    },
    rose: {
      topBorder: 'from-rose-400 to-pink-500',
      badgeText: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/20',
      cornerGlow: 'bg-rose-500/10',
    },
    slate: {
      topBorder: 'from-slate-400 to-slate-600',
      badgeText: 'text-slate-400 dark:text-slate-300',
      badgeBg: 'bg-slate-500/10 border-slate-500/20',
      cornerGlow: 'bg-slate-500/5',
    },
  };

  const theme = colorThemes[color] || colorThemes.sky;

  return (
    <div
      onClick={copyable ? handleCopy : undefined}
      className={`p-3 rounded-xl relative overflow-hidden transition-all duration-150 group bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xs ${
        copyable ? 'cursor-pointer hover:border-sky-500/70 dark:hover:border-sky-400/50 hover:shadow-sm' : ''
      } ${className}`}
    >
      {/* Top Luminous Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.topBorder} opacity-90`} />

      <div className="flex items-center justify-between gap-1.5 mb-1 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && (
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${theme.badgeBg}`}>
              <Icon className={`w-2.5 h-2.5 ${theme.badgeText}`} />
            </div>
          )}
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
            {label}
          </span>
        </div>

        {/* Copy Indicator */}
        {copyable && (
          <div className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {copied ? (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Copied</span>
              </span>
            ) : (
              <Copy className="w-3 h-3 hover:text-sky-500 transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-1.5 relative z-10">
        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate block">
          {value !== null && value !== undefined && value !== '' ? value : '—'}
        </span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5 truncate relative z-10">
          {subtext}
        </span>
      )}
    </div>
  );
}

