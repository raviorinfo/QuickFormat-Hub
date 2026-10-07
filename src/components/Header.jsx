import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Sun,
  Moon,
  ChevronDown,
  History,
  DownloadCloud,
  Search,
  Volume2,
  VolumeX,
  Keyboard,
  Command,
  Sparkles,
  ShieldCheck,
  Check,
  Star,
  Menu,
  X,
  Lock,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
  ExternalLink,
  Layers,
  Filter
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ALL_TOOLS } from '../utils/toolsList';
import {
  initSoundPreference,
  toggleSoundPreference,
  playClickSound
} from '../utils/audioFeedback';

const DEFAULT_PINNED = ['/json-to-csv', '/json-viewer', '/jwt-inspector', '/security-headers'];

export function Header({
  currentPath,
  onNavigate,
  onOpenCommandPalette,
  onOpenHistory,
  onOpenShortcuts,
}) {
  const { isDark, toggleTheme } = useTheme();

  // Mega-menu and Mobile Drawer state
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [megaSearch, setMegaSearch] = useState('');
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);

  // Pinned favorites in localStorage
  const [pinnedPaths, setPinnedPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('qf_pinned_tools');
      return saved ? JSON.parse(saved) : DEFAULT_PINNED;
    } catch {
      return DEFAULT_PINNED;
    }
  });

  // Recently visited tools
  const [recentPaths, setRecentPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('qf_recent_tools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Category state for sub-nav
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const found = ALL_TOOLS.find((t) => t.path === currentPath);
    return found ? found.category : 'Data';
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [soundOn, setSoundOn] = useState(false);

  const megaMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const privacyRef = useRef(null);

  // Sync category if path changes
  useEffect(() => {
    const found = ALL_TOOLS.find((t) => t.path === currentPath);
    if (found && selectedCategory !== 'Pinned' && selectedCategory !== found.category) {
      setSelectedCategory(found.category);
    }

    // Update recent paths list
    try {
      const saved = JSON.parse(localStorage.getItem('qf_recent_tools') || '[]');
      const filtered = [currentPath, ...saved.filter((p) => p !== currentPath)].slice(0, 5);
      setRecentPaths(filtered);
      localStorage.setItem('qf_recent_tools', JSON.stringify(filtered));
    } catch {
      // ignore storage errors
    }
  }, [currentPath]);

  // Click outside listener for MegaMenu and Privacy tooltip
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setIsMegaMenuOpen(false);
      }
      if (privacyRef.current && !privacyRef.current.contains(e.target)) {
        setShowPrivacyTooltip(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsMobileDrawerOpen(false);
        setShowPrivacyTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Autofocus mega-menu search input on open
  useEffect(() => {
    if (isMegaMenuOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setMegaSearch('');
    }
  }, [isMegaMenuOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Audio preference sync
  useEffect(() => {
    setSoundOn(initSoundPreference());
  }, []);

  const handleSoundToggle = () => {
    const next = toggleSoundPreference();
    setSoundOn(next);
  };

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };

  // Toggle Pin tool
  const togglePin = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    playClickSound();
    setPinnedPaths((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      try {
        localStorage.setItem('qf_pinned_tools', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const categories = [
    { id: 'Pinned', label: 'Pinned', count: pinnedPaths.length, icon: Star },
    { id: 'Data', label: 'Data', count: ALL_TOOLS.filter((t) => t.category === 'Data').length },
    { id: 'Security', label: 'Security', count: ALL_TOOLS.filter((t) => t.category === 'Security').length },
    { id: 'Docs', label: 'Docs & Text', count: ALL_TOOLS.filter((t) => t.category === 'Docs').length },
    { id: 'Dev', label: 'Dev & API', count: ALL_TOOLS.filter((t) => t.category === 'Dev').length },
  ];

  const categoryThemes = {
    Data: {
      color: 'text-sky-500 dark:text-sky-400',
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      border: 'border-sky-500/20',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    Security: {
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    Docs: {
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      border: 'border-purple-500/20',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    Dev: {
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  };

  // Filtered tools in secondary bar
  const activeSubNavTools = useMemo(() => {
    if (selectedCategory === 'Pinned') {
      const pinned = ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path));
      return pinned.length > 0 ? pinned : ALL_TOOLS.slice(0, 4);
    }
    return ALL_TOOLS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory, pinnedPaths]);

  // Filtered tools in Mega-Menu search
  const filteredMegaTools = useMemo(() => {
    const q = megaSearch.trim().toLowerCase();
    if (!q) return ALL_TOOLS;
    return ALL_TOOLS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        (t.desc && t.desc.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }, [megaSearch]);

  const currentTool = ALL_TOOLS.find((t) => t.path === currentPath) || ALL_TOOLS[0];
  const CurrentIcon = currentTool.icon;
  const isCurrentPinned = pinnedPaths.includes(currentPath);

  // Recent tools objects for quick jump strip (exclude current path)
  const recentToolItems = useMemo(() => {
    return recentPaths
      .filter((p) => p !== currentPath)
      .slice(0, 3)
      .map((p) => ALL_TOOLS.find((t) => t.path === p))
      .filter(Boolean);
  }, [recentPaths, currentPath]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/85 dark:bg-[#060911]/90 border-b border-slate-200/80 dark:border-white/[0.08] transition-colors duration-200 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Row: Brand, Mega-Menu Trigger, Privacy Pill, Spotlight & Action Deck */}
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Left Deck: Logo & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <a
                href="/json-to-csv"
                onClick={(e) => {
                  e.preventDefault();
                  playClickSound();
                  onNavigate('/json-to-csv');
                }}
                className="flex items-center gap-2.5 group focus:outline-none cursor-pointer select-none"
              >
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/50 group-hover:scale-105 transition-all duration-300">
                    <div className="w-full h-full bg-[#060911]/30 backdrop-blur-xs rounded-[10px] flex items-center justify-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#060911]" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                      QuickFormat <span className="gradient-text">Hub</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 tracking-wider">
                      STUDIO
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                    100% In-Browser • 19 Utilities
                  </span>
                </div>
              </a>

              {/* Air-Gapped Trust Status Pill (Popover trigger) */}
              <div className="relative hidden lg:block" ref={privacyRef}>
                <button
                  type="button"
                  onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all cursor-pointer"
                  title="Click to view Client-Side Privacy Guarantee"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Air-Gapped</span>
                </button>

                {showPrivacyTooltip && (
                  <div className="absolute left-0 top-full mt-2 w-80 p-3.5 rounded-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/[0.1] shadow-2xl z-50 text-left animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        100% Client-Side Privacy
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                      Zero data packets leave your computer. All cryptographic hashing, conversions, parsing, and regex evaluations execute locally in your browser memory.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[10px] text-slate-400 font-mono">
                      <span>• No Remote Database</span>
                      <span>• No Tracking</span>
                      <span>• Offline PWA</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Deck: Studio Mega-Menu Selector Button */}
            <div className="relative shrink-0" ref={megaMenuRef}>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsMegaMenuOpen(!isMegaMenuOpen);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  isMegaMenuOpen
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200/90 dark:border-white/[0.08] bg-slate-50/90 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 hover:border-sky-500/50 hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
                title="Open Studio Mega-Menu with all 19 tools"
              >
                <div className="w-5 h-5 rounded-md bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                  <CurrentIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="leading-tight truncate max-w-[120px] font-bold text-slate-900 dark:text-white">
                    {currentTool.label}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                    {currentTool.category}
                  </div>
                </div>
                <span className="sm:hidden font-semibold max-w-[100px] truncate">{currentTool.label}</span>

                <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-200 dark:border-white/[0.08]">
                  <span className="hidden md:inline-flex text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    19 Tools
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isMegaMenuOpen ? 'rotate-180 text-sky-500' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Mega-Menu Floating Studio Popover */}
              {isMegaMenuOpen && (
                <div className="fixed sm:absolute left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 top-20 sm:top-full sm:mt-2 w-auto sm:w-[740px] lg:w-[860px] max-h-[82vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl p-4 sm:p-5 z-50 animate-slide-up">
                  {/* Top Bar inside Mega-Menu: Live Filter & Quick Stats */}
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={megaSearch}
                        onChange={(e) => setMegaSearch(e.target.value)}
                        placeholder="Search all 19 tools by name, description, or keyword..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                      />
                      {megaSearch && (
                        <button
                          type="button"
                          onClick={() => setMegaSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="hidden sm:inline font-mono text-[11px] bg-slate-100 dark:bg-white/[0.06] px-2 py-1 rounded-md">
                        ESC to close
                      </span>
                    </div>
                  </div>

                  {/* Mega-Menu Grid: 4 Categorized Columns OR Filtered Search Results */}
                  {megaSearch.trim() ? (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Search Results ({filteredMegaTools.length} match{filteredMegaTools.length === 1 ? '' : 'es'})
                      </div>
                      {filteredMegaTools.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No developer utilities matching "<span className="text-slate-600 dark:text-slate-300 font-semibold">{megaSearch}</span>"
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {filteredMegaTools.map((tool) => {
                            const Icon = tool.icon;
                            const isSelected = tool.path === currentPath;
                            const isPinned = pinnedPaths.includes(tool.path);
                            const tTheme = categoryThemes[tool.category] || categoryThemes.Data;
                            return (
                              <div
                                key={tool.path}
                                onClick={() => {
                                  playClickSound();
                                  setIsMegaMenuOpen(false);
                                  onNavigate(tool.path);
                                }}
                                className={`group flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-sky-500/10 border-sky-500/40'
                                    : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-sky-500/30'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg ${tTheme.bg} ${tTheme.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {tool.label}
                                    </span>
                                    {tool.badge && (
                                      <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                                        {tool.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                    {tool.desc || `${tool.category} utility`}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => togglePin(tool.path, e)}
                                  className={`p-1 rounded-md transition-colors ${
                                    isPinned
                                      ? 'text-amber-500 hover:text-amber-600'
                                      : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                                  }`}
                                  title={isPinned ? 'Unpin from navbar' : 'Pin to navbar'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500' : ''}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {['Data', 'Security', 'Docs', 'Dev'].map((cat) => {
                        const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat);
                        const cTheme = categoryThemes[cat];
                        return (
                          <div key={cat} className="flex flex-col">
                            {/* Category Header */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${cTheme.bg} ring-1 ${cTheme.border}`} />
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                  {cat === 'Docs' ? 'Docs & Text' : cat === 'Dev' ? 'Dev & API' : cat}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
                                {toolsInCat.length}
                              </span>
                            </div>

                            {/* Tool list in Category */}
                            <div className="space-y-1.5 flex-1">
                              {toolsInCat.map((tool) => {
                                const Icon = tool.icon;
                                const isSelected = tool.path === currentPath;
                                const isPinned = pinnedPaths.includes(tool.path);
                                return (
                                  <div
                                    key={tool.path}
                                    onClick={() => {
                                      playClickSound();
                                      setIsMegaMenuOpen(false);
                                      onNavigate(tool.path);
                                    }}
                                    className={`group flex items-start gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400'
                                        : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]'
                                    }`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-lg ${cTheme.bg} ${cTheme.color} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                          {tool.label}
                                        </span>
                                        {tool.badge && (
                                          <span className="text-[8px] font-mono font-extrabold px-1 rounded bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                                            {tool.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug mt-0.5">
                                        {tool.desc}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => togglePin(tool.path, e)}
                                      className={`p-1 rounded-md opacity-60 group-hover:opacity-100 transition-all ${
                                        isPinned
                                          ? 'text-amber-500 opacity-100'
                                          : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                                      }`}
                                      title={isPinned ? 'Unpin from quick bar' : 'Pin to quick bar'}
                                    >
                                      <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-500' : ''}`} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Mega-Menu Bottom Bar: Studio info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Click the star on any tool to pin it to your quick-access navbar.</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      <span>19 Client-Side Utilities</span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          onOpenCommandPalette();
                        }}
                        className="text-sky-500 hover:underline flex items-center gap-1"
                      >
                        <Command className="w-2.5 h-2.5 inline" />K Spotlight
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Studio Spotlight Search Trigger (Ctrl+K) */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenCommandPalette();
              }}
              className="flex-1 max-w-sm hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.03] text-xs text-slate-500 dark:text-slate-400 hover:border-sky-500/50 hover:bg-white dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-xs group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="flex-1 text-left font-normal truncate">Quick search tools, actions & guides...</span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 shadow-xs">
                <Command className="w-2.5 h-2.5 inline" />K
              </span>
            </button>

            {/* Unified Action Deck (Capsule Group) */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] backdrop-blur-md">
              {/* Current Tool Pin/Unpin Toggle */}
              <button
                type="button"
                onClick={(e) => togglePin(currentPath, e)}
                className={`p-1.5 rounded-lg transition-colors hidden sm:flex ${
                  isCurrentPinned
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
                title={isCurrentPinned ? 'Unpin current tool from quick bar' : 'Pin current tool to quick bar'}
              >
                <Star className={`w-4 h-4 ${isCurrentPinned ? 'fill-amber-500' : ''}`} />
              </button>

              {/* PWA Install Button if available */}
              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold hover:bg-sky-500 hover:text-white transition-all mr-1"
                  title="Install QuickFormat Hub as Desktop / Mobile App"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install</span>
                </button>
              )}

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenCommandPalette();
                }}
                aria-label="Search"
                className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Scratchpad History Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenHistory();
                }}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
                title="Recent Scratchpad History"
              >
                <History className="w-4 h-4" />
              </button>

              {/* Keyboard Shortcuts Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenShortcuts();
                }}
                aria-label="Keyboard Shortcuts"
                className="hidden sm:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Sound FX Audio Toggle */}
              <button
                type="button"
                onClick={handleSoundToggle}
                aria-label="Toggle UI Audio Effects"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
                title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
              >
                {soundOn ? (
                  <Volume2 className="w-4 h-4 text-sky-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  toggleTheme();
                }}
                aria-label="Toggle Color Theme"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-200"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Mobile Drawer Trigger Hamburger Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsMobileDrawerOpen(true);
                }}
                aria-label="Open Navigation Menu"
                className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Sub-Navigation Row: Clean Categories + Contextual Tool Switcher + Recents */}
          <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-white/[0.06]">
            
            {/* Left: Categorized Segment Selector */}
            <div className="flex items-center gap-1 shrink-0 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06]">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-white/[0.1] text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {Icon ? (
                      <Icon className={`w-3 h-3 ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                    ) : null}
                    <span>{cat.label}</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-200/70 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] shrink-0" />

            {/* Middle: Active Tools within Current Category (Clean, No 19-tool horizontal cramming) */}
            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
              {activeSubNavTools.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    id={`nav-tab-${item.path.replace('/', '')}`}
                    onClick={(e) => {
                      e.preventDefault();
                      playClickSound();
                      onNavigate(item.path);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                      isActive
                        ? 'btn-primary shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Right: Quick Recents Strip on Large Screens */}
            {recentToolItems.length > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200/60 dark:border-white/[0.06] text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 text-sky-500" />
                  Recent:
                </span>
                {recentToolItems.map((rec) => {
                  const RecIcon = rec.icon;
                  return (
                    <button
                      key={rec.path}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onNavigate(rec.path);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors text-[11px] font-medium truncate max-w-[110px]"
                      title={`Jump back to ${rec.label}`}
                    >
                      <RecIcon className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                      <span className="truncate">{rec.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-[#080d1a] h-full shadow-2xl flex flex-col z-10 animate-slide-up border-l border-slate-200 dark:border-white/[0.1] overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    QuickFormat <span className="gradient-text">Hub</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">19 Utilities Studio</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Action Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400"
              >
                <Search className="w-3.5 h-3.5 text-sky-500" />
                <span>Search tools or commands...</span>
                <span className="ml-auto font-mono text-[10px] bg-white dark:bg-white/[0.1] px-1 rounded">⌘K</span>
              </button>

              {/* Quick Preferences Bar in Drawer */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Settings</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                    title="Toggle Audio FX"
                  >
                    {soundOn ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                    title="Toggle Theme"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenHistory();
                    }}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                    title="Scratchpad History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pinned Tools Section */}
            {pinnedPaths.length > 0 && (
              <div className="p-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>Pinned Favorites</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path)).map((tool) => {
                    const PIcon = tool.icon;
                    const isSelected = tool.path === currentPath;
                    return (
                      <button
                        key={tool.path}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsMobileDrawerOpen(false);
                          onNavigate(tool.path);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <PIcon className="w-3 h-3 shrink-0" />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categorized Tools List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {['Data', 'Security', 'Docs', 'Dev'].map((cat) => {
                const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat);
                const cTheme = categoryThemes[cat];
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                      <span>{cat === 'Docs' ? 'Docs & Text' : cat === 'Dev' ? 'Dev & API' : cat}</span>
                      <span className="font-mono text-[9px]">{toolsInCat.length}</span>
                    </div>
                    <div className="space-y-1">
                      {toolsInCat.map((tool) => {
                        const Icon = tool.icon;
                        const isSelected = tool.path === currentPath;
                        const isPinned = pinnedPaths.includes(tool.path);
                        return (
                          <div
                            key={tool.path}
                            onClick={() => {
                              playClickSound();
                              setIsMobileDrawerOpen(false);
                              onNavigate(tool.path);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-500 text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : `${cTheme.bg} ${cTheme.color}`
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{tool.label}</span>
                              {tool.badge && !isSelected && (
                                <span className="text-[8px] font-mono font-bold px-1 rounded bg-sky-500/10 text-sky-500">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => togglePin(tool.path, e)}
                              className={`p-1 rounded-md ${
                                isPinned
                                  ? 'text-amber-500'
                                  : isSelected
                                  ? 'text-white/60 hover:text-white'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-500' : ''}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser Privacy</span>
              </div>
              <span className="font-mono text-[10px]">v2.6 Studio</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
