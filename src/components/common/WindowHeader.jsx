import React from 'react';
import { Maximize2, Minimize2, Terminal, Code2 } from 'lucide-react';

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
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/95 dark:bg-[#0b1120]/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md select-none">
      {/* Left: Terminal status indicator & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Subtle IDE active pulse badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-200/50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <Terminal className="w-3 h-3 text-slate-500 dark:text-slate-400" />
        </div>

        {/* Title & Format Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            {title}
          </span>
          {badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/25 shadow-xs">
              {badge}
            </span>
          )}
        </div>

        {/* Counts (Chars / Lines) */}
        {(charsCount !== null || linesCount !== null) && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
            {linesCount !== null && <span>{linesCount.toLocaleString()} lines</span>}
            {linesCount !== null && charsCount !== null && <span className="opacity-40">•</span>}
            {charsCount !== null && <span>{charsCount.toLocaleString()} chars</span>}
          </div>
        )}
      </div>

      {/* Right: Actions, Font Scaling, Zen Mode */}
      <div className="flex items-center gap-1.5">
        {/* Font size adjuster */}
        {onFontSizeChange && (
          <div className="hidden sm:flex items-center bg-slate-200/60 dark:bg-slate-850 p-0.5 rounded-lg text-xs mr-1 border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => onFontSizeChange('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                fontSize === 'small'
                  ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Compact text size"
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
              title="Standard text size"
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
              title="Large text size"
            >
              A+
            </button>
          </div>
        )}

        {/* Children action buttons (Format, Minify, Upload, etc.) */}
        <div className="flex items-center gap-1">
          {children}
        </div>

        {/* Zen Mode toggle */}
        {onToggleZen && (
          <button
            onClick={onToggleZen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={isZenMode ? 'Exit Zen Focus (Esc)' : 'Zen Fullscreen Focus'}
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
