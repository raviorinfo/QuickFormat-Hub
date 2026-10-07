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
  color = 'sky', // 'sky' | 'emerald' | 'amber' | 'purple' | 'rose'
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

  const accentColors = {
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  }[color] || 'text-sky-500 bg-sky-500/10 border-sky-500/20';

  return (
    <div
      onClick={copyable ? handleCopy : undefined}
      className={`glass-panel p-4 rounded-2xl relative overflow-hidden transition-all duration-200 group border border-slate-200/80 dark:border-slate-800/80 ${
        copyable ? 'cursor-pointer hover:border-brand-500/40 hover:-translate-y-0.5 shadow-sm hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${accentColors}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
            {label}
          </span>
        </div>

        {/* Copy Indicator */}
        {copyable && (
          <div className="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-bounce" />
            ) : (
              <Copy className="w-3.5 h-3.5 group-hover:text-brand-500 transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate block">
          {value || '—'}
        </span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 truncate">
          {subtext}
        </span>
      )}
    </div>
  );
}
