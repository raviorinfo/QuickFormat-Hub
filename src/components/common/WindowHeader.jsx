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
    <div className="flex items-center justify-between px-3 sm:px-3.5 py-1.5 bg-slate-50/90 dark:bg-[#070b14]/90 border-b border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl select-none relative z-10">
      {/* Left: Window status & Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {/* Subtle Traffic Light Window Dots */}
        <div className="flex items-center gap-1.5 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_4px_rgba(244,63,94,0.4)] block"></span>
          <span className="w-2 h-2 rounded-full bg-amber-500/80 shadow-[0_0_4px_rgba(245,158,11,0.4)] block"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.4)] block"></span>
        </div>

        {/* Title & Format Pill */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase truncate">
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs shrink-0">
              {badge}
            </span>
          )}
        </div>

        {/* Counts (Chars / Lines) */}
        {(charsCount !== null || linesCount !== null) && (
          <div className="hidden lg:flex items-center gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-white/5 px-1.5 py-0.2 rounded border border-slate-200 dark:border-white/10 shrink-0">
            {linesCount !== null && <span>{linesCount.toLocaleString()} L</span>}
            {linesCount !== null && charsCount !== null && <span className="opacity-30">•</span>}
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
          <div className="hidden sm:flex items-center bg-slate-200/60 dark:bg-white/5 p-0.5 rounded-lg text-xs border border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => onFontSizeChange('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                fontSize === 'small'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Compact text size"
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                fontSize === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Standard text size"
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 cursor-pointer"
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

