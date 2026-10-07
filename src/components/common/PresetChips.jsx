import React from 'react';
import { Sparkles, Zap, ChevronRight } from 'lucide-react';
import { playClickSound } from '../../utils/audioFeedback';

export function PresetChips({
  presets,
  onSelect,
  activeId = null,
  label = 'Presets',
  title = null,
  className = '',
}) {
  if (!presets || presets.length === 0) return null;

  const displayLabel = title || label;

  return (
    <div className={`flex items-center gap-2 flex-wrap text-xs select-none ${className}`}>
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 font-mono">
        <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Zap className="w-2.5 h-2.5 text-amber-500" />
        </div>
        <span>{displayLabel}:</span>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {presets.map((preset) => {
          const isActive = activeId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                playClickSound();
                onSelect(preset);
              }}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center gap-1 border cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-brand-600 text-white border-sky-400 shadow-xs scale-[1.01]'
                  : 'bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-white/10 hover:border-sky-500/40'
              }`}
              title={preset.description || `Load ${preset.label}`}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {preset.icon && <preset.icon className="w-3 h-3 opacity-70" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

