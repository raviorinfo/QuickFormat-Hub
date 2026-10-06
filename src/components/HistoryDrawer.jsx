import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { getHistory, clearAllHistory, deleteHistoryEntry } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';

export function HistoryDrawer({ isOpen, onClose, onNavigate }) {
  const toast = useToast();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setHistoryItems(getHistory());
    }
  }, [isOpen]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all local history? This cannot be undone.')) {
      clearAllHistory();
      setHistoryItems([]);
      toast.info('Scratchpad history wiped clean');
    }
  };

  const handleDeleteItem = (id) => {
    const updated = deleteHistoryEntry(id);
    setHistoryItems(updated);
  };

  const handleRestore = (item) => {
    onNavigate(item.toolPath);
    onClose();
    toast.success(`Switched to ${item.toolPath}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Scratchpad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Stored exclusively in your local browser storage.</span>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">No recent operations yet</p>
              <p className="text-xs text-slate-500">
                Your actions and conversions will appear here for easy quick access.
              </p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-brand-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono">
                    {item.toolPath}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px]">{item.timestamp}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-mono text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  {item.preview}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-brand-500 hover:bg-brand-500/10 transition-colors"
                  >
                    <span>Open Tool</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Clear All */}
        {historyItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
            <span className="text-xs text-slate-500">{historyItems.length} stored entries</span>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Nuke / Clear All</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
