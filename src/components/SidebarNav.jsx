import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  Sparkles,
  Layers,
  ShieldCheck,
  FolderTree,
  Pin,
  Database,
  Lock,
  ShoppingBag,
  FileText,
  Terminal,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { ALL_TOOLS } from '../utils/toolsList';
import { BrandLogo } from './BrandLogo';
import { playClickSound } from '../utils/audioFeedback';

export function SidebarNav({ currentPath, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('qfh_sidebar_collapsed');
      return saved !== null ? saved === 'true' : true; // Default collapsed to match Image 1 Dock!
    } catch {
      return true;
    }
  });

  const [activeSuitePopover, setActiveSuitePopover] = useState(null); // category ID for collapsed flyout
  const [filterQuery, setFilterQuery] = useState('');
  const popoverRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActiveSuitePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close popover when current path changes
  useEffect(() => {
    setActiveSuitePopover(null);
  }, [currentPath]);

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
      setActiveSuitePopover(null);
      return next;
    });
  };

  const currentTool = ALL_TOOLS.find((t) => t.path === currentPath) || ALL_TOOLS[0];
  const activeCategory = currentTool ? currentTool.category : 'Data';

  // Categories matching Direction 3: Aurora Luxe Command Hub
  const suites = [
    {
      id: 'Data',
      label: 'DATA',
      fullLabel: 'Data Suite',
      icon: Database,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-400',
      indicatorBg: 'bg-cyan-400 shadow-[0_0_12px_#00f0ff]',
      glowPill: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      activeClass: 'dock-item-active-data'
    },
    {
      id: 'Security',
      label: 'SECURITY',
      fullLabel: 'Security Vault',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-400',
      indicatorBg: 'bg-emerald-400 shadow-[0_0_12px_#10b981]',
      glowPill: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      activeClass: 'dock-item-active-security'
    },
    {
      id: 'Commerce',
      label: 'COMMERCE',
      fullLabel: 'Commerce & Retail',
      icon: ShoppingBag,
      color: 'text-rose-400',
      activeBorder: 'border-rose-400',
      indicatorBg: 'bg-rose-400 shadow-[0_0_12px_#f43f5e]',
      glowPill: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      activeClass: 'dock-item-active-commerce'
    },
    {
      id: 'Docs',
      label: 'DOCS',
      fullLabel: 'Docs & Text',
      icon: FileText,
      color: 'text-purple-400',
      activeBorder: 'border-purple-400',
      indicatorBg: 'bg-purple-400 shadow-[0_0_12px_#a855f7]',
      glowPill: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      activeClass: 'dock-item-active-docs'
    },
    {
      id: 'Dev',
      label: 'DEV',
      fullLabel: 'Dev & API Suite',
      icon: Terminal,
      color: 'text-amber-400',
      activeBorder: 'border-amber-400',
      indicatorBg: 'bg-amber-400 shadow-[0_0_12px_#f59e0b]',
      glowPill: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      activeClass: 'dock-item-active-dev'
    },
  ];

  const filteredTools = ALL_TOOLS.filter((t) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#040814]/95 backdrop-blur-xl transition-all duration-300 no-print select-none shadow-xl relative z-30 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* 1. Brand Logo at the top of the Left Rail (matches Image 1) */}
      <div className="h-16 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-3 relative">
        <a
          href="/json-to-csv"
          onClick={(e) => {
            e.preventDefault();
            playClickSound();
            onNavigate('/json-to-csv');
          }}
          className="flex items-center gap-2.5 mx-auto focus:outline-none cursor-pointer group"
          title="QuickFormat Hub — Home"
        >
          <div className="relative">
            <BrandLogo className="w-8 h-8 group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-md pointer-events-none group-hover:bg-cyan-400/40 transition-colors" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                QuickFormat
              </span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold -mt-0.5">Command Hub</span>
            </div>
          )}
        </a>
      </div>

      {/* 2. Main Suite Navigation Buttons (Exact Image 1 Vertical Stack) */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-4 space-y-3 relative">
          {suites.map((suite) => {
            const Icon = suite.icon;
            const isActive = activeCategory === suite.id;
            const toolsInSuite = ALL_TOOLS.filter((t) => t.category === suite.id);

            return (
              <div key={suite.id} className="relative w-full flex justify-center group">
                {/* Active Left Indicator Strip (matches Image 1) */}
                {isActive && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 rounded-r-full ${suite.indicatorBg}`}
                  />
                )}

                {/* Dock Suite Button */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveSuitePopover((prev) => (prev === suite.id ? null : suite.id));
                  }}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                    isActive
                      ? `${suite.glowPill} shadow-lg font-bold border`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
                  }`}
                  title={`${suite.fullLabel} (${toolsInSuite.length} tools)`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? `${suite.color} drop-shadow-[0_0_8px_currentColor]` : ''
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] font-black tracking-wider uppercase ${
                      isActive ? suite.color : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {suite.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Expanded Explorer Mode */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter search bar */}
          <div className="p-2.5 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search 27 utilities..."
                className="w-full text-xs pl-8 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Scrollable Categories List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
            {suites.map((suite) => {
              const toolsInCat = filteredTools.filter((t) => t.category === suite.id);
              if (toolsInCat.length === 0) return null;
              const Icon = suite.icon;

              return (
                <div key={suite.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${suite.color}`} />
                      {suite.fullLabel}
                    </span>
                    <span className="text-[9px] font-mono opacity-60">({toolsInCat.length})</span>
                  </div>

                  <div className="space-y-0.5">
                    {toolsInCat.map((tool) => {
                      const ToolIcon = tool.icon;
                      const isSelected = tool.path === currentPath;

                      return (
                        <button
                          key={tool.path}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onNavigate(tool.path);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer relative ${
                            isSelected
                              ? `${suite.activeClass} font-bold shadow-md`
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.06] font-medium'
                          }`}
                        >
                          <ToolIcon className="w-4 h-4 shrink-0" />
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate text-left">{tool.label}</span>
                            {tool.badge && (
                              <span className="text-[8px] font-mono font-bold px-1 rounded bg-white/10 text-slate-300">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Bottom Control Dock (Expand/Collapse toggle matching Image 1 bottom exit icon) */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleCollapse}
          className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center cursor-pointer group"
          title={isCollapsed ? 'Expand Studio Sidebar' : 'Collapse to Command Dock'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform" />
          )}
        </button>

        {!isCollapsed && (
          <div className="w-full text-center text-[10px] font-mono text-slate-400">
            Aurora Luxe Hub v3.0
          </div>
        )}
      </div>

      {/* 4. Flyout Popover for Instant 1-Click Suite Navigation (when in collapsed dock mode) */}
      {isCollapsed && activeSuitePopover && (
        <div
          ref={popoverRef}
          className="absolute left-[76px] top-16 w-64 p-3 rounded-2xl bg-[#090f1f]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl z-50 animate-slide-right space-y-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-black font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
              {suites.find((s) => s.id === activeSuitePopover)?.fullLabel}
            </span>
            <button
              onClick={() => setActiveSuitePopover(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto no-scrollbar">
            {ALL_TOOLS.filter((t) => t.category === activeSuitePopover).map((tool) => {
              const ToolIcon = tool.icon;
              const isSelected = tool.path === currentPath;

              return (
                <button
                  key={tool.path}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveSuitePopover(null);
                    onNavigate(tool.path);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <ToolIcon className="w-4 h-4 shrink-0 text-cyan-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold">{tool.label}</div>
                    <div className="text-[10px] text-slate-400 truncate font-normal">{tool.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
