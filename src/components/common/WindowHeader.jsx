import React from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Type } from 'lucide-react';

export function WindowHeader({
  title,
  badge,
  charsCount = null,
  linesCount = null,
  onFontSizeChange = null,
  fontSize = 'normal', // 'small' | 'normal' | 'large'
  isZenMode = false,
  onToggleZen = null,
  children,
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/90 dark:bg-slate-850/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md select-none">
      {/* Left: Mac Traffic Lights & Title */}
      <div className="flex items-center gap-3">
        {/* macOS Traffic Light Dots */}
        <div className="flex items-center gap-1.5 group cursor-default">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 border border-rose-600/40 group-hover:brightness-125 transition-all"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-600/40 group-hover:brightness-125 transition-all"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-600/40 group-hover:brightness-125 transition-all"></span>
        </div>

        {/* Title & Format Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {badge}
            </span>
          )}
        </div>

        {/* Counts (Chars / Lines) */}
        {(charsCount !== null || linesCount !== null) && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            {linesCount !== null && <span>{linesCount}L</span>}
            {linesCount !== null && charsCount !== null && <span>•</span>}
            {charsCount !== null && <span>{charsCount.toLocaleString()} ch</span>}
          </div>
        )}
      </div>

      {/* Right: Actions, Font Scaling, Zen Mode */}
      <div className="flex items-center gap-1.5">
        {/* Font size adjuster */}
        {onFontSizeChange && (
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-1">
            <button
              onClick={() => onFontSizeChange('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                fontSize === 'small'
                  ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                fontSize === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                fontSize === 'large'
                  ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Large text"
            >
              A+
            </button>
          </div>
        )}

        {/* Children action buttons (Format, Minify, Upload, etc.) */}
        {children}

        {/* Zen Mode toggle */}
        {onToggleZen && (
          <button
            onClick={onToggleZen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1"
            title={isZenMode ? 'Exit Zen Mode (Esc)' : 'Zen Fullscreen Mode'}
          >
            {isZenMode ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
