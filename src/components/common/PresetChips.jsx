import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { playClickSound } from '../../utils/audioFeedback';

export function PresetChips({
  presets,
  onSelect,
  activeId = null,
  label = 'Presets',
  className = '',
}) {
  if (!presets || presets.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap text-xs select-none ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] shrink-0">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>{label}:</span>
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
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25'
                  : 'bg-slate-100/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40'
              }`}
              title={preset.description || `Load ${preset.label}`}
            >
              {preset.icon && <preset.icon className="w-3 h-3 opacity-70" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
