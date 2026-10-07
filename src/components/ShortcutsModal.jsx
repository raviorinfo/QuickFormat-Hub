import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

export function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open Universal Command Palette & Search' },
    { key: '?', desc: 'Show this Keyboard Shortcuts cheat sheet' },
    { key: 'Ctrl + Enter', desc: 'Prettify / Format / Trigger primary tool action' },
    { key: 'Esc', desc: 'Close modals, drawers, or exit Zen fullscreen mode' },
    { key: 'H', desc: 'Open Recent Scratchpad History drawer' },
    { key: 'T', desc: 'Toggle Dark / Light color mode' },
    { key: 'Ctrl + C', desc: 'Copy selected text or primary output' },
    { key: 'Drag & Drop', desc: 'Drop any file (.json, .csv, .pdf, .md) to auto-route' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-slate-400">Power-user keyboard navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 text-xs"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md font-mono text-[11px] font-bold bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400 font-mono">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border">Esc</kbd> anytime to dismiss
        </div>
      </div>
    </div>
  );
}
