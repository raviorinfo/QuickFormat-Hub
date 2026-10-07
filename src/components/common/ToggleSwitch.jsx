import React from 'react';
import { playClickSound } from '../../utils/audioFeedback';

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description = null,
  id = null,
  disabled = false,
  size = 'md', // 'sm' | 'md'
  color = 'sky', // 'sky' | 'emerald' | 'purple'
}) {
  const switchId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

  const handleToggle = () => {
    if (disabled) return;
    playClickSound();
    onChange(!checked);
  };

  const isSmall = size === 'sm';

  const colorClasses = {
    sky: 'bg-sky-500 shadow-sky-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    purple: 'bg-purple-500 shadow-purple-500/30',
  }[color] || 'bg-sky-500 shadow-sky-500/30';

  return (
    <div
      onClick={handleToggle}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      role="switch"
      aria-checked={checked}
      id={switchId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      {/* Animated Switch Track */}
      <div
        className={`relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
          isSmall ? 'h-4 w-7' : 'h-5 w-9'
        } ${
          checked
            ? `${colorClasses} shadow-sm`
            : 'bg-slate-300 dark:bg-slate-800'
        }`}
      >
        {/* Sliding Knob */}
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            isSmall
              ? `h-3 w-3 mt-0.5 ml-0.5 ${checked ? 'translate-x-3' : 'translate-x-0'}`
              : `h-4 w-4 mt-0.5 ml-0.5 ${checked ? 'translate-x-4' : 'translate-x-0'}`
          }`}
        />
      </div>

      {/* Label and optional description */}
      {label && (
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {label}
          </span>
          {description && (
            <span className="text-[11px] text-slate-400 leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
