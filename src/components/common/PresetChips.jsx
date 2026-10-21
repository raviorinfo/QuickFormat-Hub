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
      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[10px] shrink-0 font-mono">
        <div className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Zap className="w-2.5 h-2.5 text-amber-500" />
        </div>
        <span>{displayLabel}:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((preset) => {
          const isActive = activeId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                playClickSound();
                onSelect(preset);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-xs ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-brand-600 text-white border-sky-400 shadow-sm scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-white/15 hover:border-sky-500'
              }`}
              title={preset.description || `Load ${preset.label}`}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {preset.icon && <preset.icon className="w-3 h-3 opacity-80" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

