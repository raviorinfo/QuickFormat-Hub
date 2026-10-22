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
      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-xs shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-xs ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'bg-white dark:bg-[#0d1527] hover:bg-slate-50 dark:hover:bg-[#162038] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
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

