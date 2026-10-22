import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  Sparkles,
  Layers,
  ShieldCheck,
  FolderTree,
  Pin
} from 'lucide-react';
import { ALL_TOOLS } from '../utils/toolsList';
import { playClickSound } from '../utils/audioFeedback';

export function SidebarNav({ currentPath, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('qfh_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [filterQuery, setFilterQuery] = useState('');

  // Pinned favorites from localStorage
  const [pinnedPaths, setPinnedPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('qf_pinned_tools');
      return saved ? JSON.parse(saved) : ['/barcode-generator', '/price-tag-creator', '/qr-code-generator', '/json-to-csv'];
    } catch {
      return ['/barcode-generator', '/price-tag-creator', '/qr-code-generator', '/json-to-csv'];
    }
  });

  const toggleCollapse = () => {
    playClickSound();
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('qfh_sidebar_collapsed', String(next));
      return next;
    });
  };

  const categories = [
    { id: 'Commerce', label: 'Commerce & Retail', badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { id: 'Data', label: 'Data Suite', badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
    { id: 'Security', label: 'Security Vault', badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { id: 'Docs', label: 'Docs & Text', badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { id: 'Dev', label: 'Dev & API Suite', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ];

  const filteredTools = ALL_TOOLS.filter((t) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] transition-all duration-200 no-print select-none shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header inside Sidebar: Title + Collapse Toggle */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Tool Explorer
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">({ALL_TOOLS.length})</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <FolderTree className="w-4 h-4 text-sky-500" />
          </div>
        )}

        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter search bar (when expanded) */}
      {!isCollapsed && (
        <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter tools..."
              className="w-full text-xs pl-8 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c1222] text-slate-900 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      {/* Scrollable Tool Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
        {/* Pinned Favorites Section */}
        {pinnedPaths.length > 0 && !filterQuery && (
          <div>
            {!isCollapsed ? (
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 mb-1 font-mono">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500" />
                  Favorites
                </span>
                <span>{pinnedPaths.length}</span>
              </div>
            ) : (
              <div className="w-full flex justify-center mb-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </div>
            )}

            <div className="space-y-0.5">
              {ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path)).map((tool) => {
                const Icon = tool.icon;
                const isSelected = tool.path === currentPath;

                return (
                  <button
                    key={tool.path}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onNavigate(tool.path);
                    }}
                    className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shadow-xs border border-amber-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={tool.label}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                    {!isCollapsed && <span className="truncate">{tool.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Suites */}
        {categories.map((cat) => {
          const toolsInCat = filteredTools.filter((t) => t.category === cat.id);
          if (toolsInCat.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-1">
              {!isCollapsed ? (
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 px-2 font-mono">
                  <span>{cat.label}</span>
                  <span className="text-[9px] font-mono opacity-60">{toolsInCat.length}</span>
                </div>
              ) : (
                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2" />
              )}

              <div className="space-y-0.5">
                {toolsInCat.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = tool.path === currentPath;

                  return (
                    <button
                      key={tool.path}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onNavigate(tool.path);
                      }}
                      className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white font-bold shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={`${tool.label} — ${tool.desc}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-sky-500'}`} />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate text-left">{tool.label}</span>
                          {tool.badge && (
                            <span
                              className={`text-[8px] font-mono font-bold px-1 rounded ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {tool.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info inside sidebar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-mono font-semibold">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Air-Gapped
          </span>
          <span>v2.8</span>
        </div>
      )}
    </aside>
  );
}
