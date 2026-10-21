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
    <div className="flex items-center justify-between px-3 sm:px-3.5 py-1.5 bg-[#f1f5f9] dark:bg-[#090e1a] border-b border-slate-300 dark:border-white/10 select-none relative z-10 gap-2">
      {/* Left: Window status & Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Subtle Traffic Light Window Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)] block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)] block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)] block"></span>
        </div>

        {/* Title & Format Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-black tracking-wider text-slate-900 dark:text-white uppercase whitespace-nowrap">
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 shrink-0 shadow-xs">
              {badge}
            </span>
          )}
        </div>

        {/* Counts (Chars / Lines) */}
        {(charsCount !== null || linesCount !== null) && (
          <div className="hidden xl:flex items-center gap-1 text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/10 shrink-0 shadow-xs">
            {linesCount !== null && <span>{linesCount.toLocaleString()} L</span>}
            {linesCount !== null && charsCount !== null && <span className="opacity-40">•</span>}
            {charsCount !== null && <span>{charsCount.toLocaleString()} C</span>}
          </div>
        )}
      </div>

      {/* Right: Actions, Font Scaling, Zen Mode */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Children action buttons (Format, Minify, Upload, etc.) */}
        <div className="flex items-center gap-1">
          {children}
        </div>

        {/* Font size adjuster */}
        {onFontSizeChange && (
          <div className="hidden sm:flex items-center bg-slate-200 dark:bg-white/10 p-0.5 rounded-lg text-xs border border-slate-300 dark:border-white/10">
            <button
              onClick={() => onFontSizeChange('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                fontSize === 'small'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Compact text size"
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                fontSize === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Standard text size"
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Large text size"
            >
              A+
            </button>
          </div>
        )}

        {/* Zen Mode toggle */}
        {onToggleZen && (
          <button
            onClick={onToggleZen}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-white/10 cursor-pointer"
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

