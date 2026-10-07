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
  Palette,
  Wifi,
  WifiOff,
  Cpu,
  Settings,
  SlidersHorizontal,
  FileSpreadsheet,
  FileCode,
  ListTree,
  Binary,
  Fingerprint,
  FileText,
  BookOpen,
  GitCompare,
  Database,
  Terminal,
  Link2
} from 'lucide-react';
import { useTheme, ACCENT_THEMES } from '../context/ThemeContext';
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
  const { isDark, toggleTheme, accentTheme, setAccentTheme, accentConfig } = useTheme();

  // Active dropdown states (only one open at a time)
  const [activeDropdown, setActiveDropdown] = useState(null); // 'Data' | 'Security' | 'Docs' | 'Dev' | 'Pinned' | 'Settings' | null
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // Dynamic Scroll & Progress Bar state
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Network & Offline state
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  // Pinned favorites in localStorage
  const [pinnedPaths, setPinnedPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('qf_pinned_tools');
      return saved ? JSON.parse(saved) : DEFAULT_PINNED;
    } catch {
      return DEFAULT_PINNED;
    }
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [soundOn, setSoundOn] = useState(false);

  const headerRef = useRef(null);

  // Scroll listener for reading progress bar and shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollY > 20);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollPercent(pct);
      } else {
        setScrollPercent(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Network Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Alt + 1..5 Keyboard jump shortcuts for pinned tools
  useEffect(() => {
    const handleAltShortcuts = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= pinnedPaths.length) {
          e.preventDefault();
          const target = pinnedPaths[num - 1];
          if (target && target !== currentPath) {
            playClickSound();
            setActiveDropdown(null);
            onNavigate(target);
          }
        }
      }
    };
    window.addEventListener('keydown', handleAltShortcuts);
    return () => window.removeEventListener('keydown', handleAltShortcuts);
  }, [pinnedPaths, currentPath, onNavigate]);

  // Click outside listener to close any open dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  // In-Nav "Load Sample Data" trigger
  const handleLoadSample = () => {
    playClickSound();
    window.dispatchEvent(new CustomEvent('qf:load-sample'));

    const buttons = Array.from(document.querySelectorAll('button'));
    const sampleBtn = buttons.find((b) => {
      const text = b.textContent?.trim().toLowerCase() || '';
      const title = b.getAttribute('title')?.toLowerCase() || '';
      return (
        b.getAttribute('data-sample-trigger') === 'true' ||
        text.includes('sample') ||
        text.includes('example') ||
        title.includes('sample') ||
        title.includes('example')
      );
    });

    if (sampleBtn) {
      sampleBtn.click();
    }

    setSampleLoaded(true);
    setTimeout(() => setSampleLoaded(false), 1800);
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

  const currentTool = ALL_TOOLS.find((t) => t.path === currentPath) || ALL_TOOLS[0];
  const CurrentIcon = currentTool.icon;

  const categories = [
    { id: 'Data', label: 'Data', count: ALL_TOOLS.filter((t) => t.category === 'Data').length },
    { id: 'Security', label: 'Security', count: ALL_TOOLS.filter((t) => t.category === 'Security').length },
    { id: 'Docs', label: 'Docs', count: ALL_TOOLS.filter((t) => t.category === 'Docs').length },
    { id: 'Dev', label: 'Dev & API', count: ALL_TOOLS.filter((t) => t.category === 'Dev').length },
  ];

  const categoryThemes = {
    Data: {
      color: 'text-sky-500 dark:text-sky-400',
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    Security: {
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    Docs: {
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    Dev: {
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  };

  const toggleDropdown = (name) => {
    playClickSound();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/90 dark:bg-[#060911]/92 border-b border-slate-200/80 dark:border-white/[0.08] transition-all duration-200 no-print ${
          isScrolled ? 'shadow-md dark:shadow-black/50' : 'shadow-xs'
        }`}
      >
        {/* Scroll Reading Progress Line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] transition-all duration-150 ease-out z-50 pointer-events-none"
          style={{
            width: `${scrollPercent}%`,
            background: accentConfig.color,
            boxShadow: `0 0 10px ${accentConfig.color}`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2.5 lg:gap-5">
            
            {/* 1. Brand Logo & Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="/json-to-csv"
                onClick={(e) => {
                  e.preventDefault();
                  playClickSound();
                  setActiveDropdown(null);
                  onNavigate('/json-to-csv');
                }}
                className="flex items-center gap-2 group focus:outline-none cursor-pointer select-none"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all duration-200">
                    <div className="w-full h-full bg-[#060911]/30 backdrop-blur-xs rounded-[6px] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#060911]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                      QuickFormat <span className="gradient-text">Hub</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:block -mt-0.5">
                    {ALL_TOOLS.length} In-Browser Utilities
                  </span>
                </div>
              </a>
            </div>

            {/* 2. Primary Category Dropdowns Navigation (Clean, Organized, Zero-Redundancy) */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0">
              {categories.map((cat) => {
                const isOpen = activeDropdown === cat.id;
                const isCurrentCategory = currentTool.category === cat.id;
                const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat.id);
                const theme = categoryThemes[cat.id];

                return (
                  <div key={cat.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(cat.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isOpen
                          ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-2xs'
                          : isCurrentCategory
                          ? 'text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {isCurrentCategory && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20 shrink-0" />
                      )}
                      <span>{cat.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 opacity-100' : ''
                        }`}
                      />
                    </button>

                    {/* Category Dropdown Popover */}
                    {isOpen && (
                      <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-2.5 rounded-2xl bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl z-50 animate-slide-up">
                        <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{cat.id === 'Docs' ? 'Docs & Text' : cat.id === 'Dev' ? 'Dev & API' : cat.id} Suite</span>
                          <span className="font-mono">{toolsInCat.length} tools</span>
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
                                  setActiveDropdown(null);
                                  onNavigate(tool.path);
                                }}
                                className={`group flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-sky-500/10 border border-sky-500/40 text-sky-600 dark:text-sky-400'
                                    : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.06] border border-transparent'
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {tool.label}
                                    </span>
                                    {tool.badge && (
                                      <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
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
                                  className={`p-1 rounded-md transition-all ${
                                    isPinned
                                      ? 'text-amber-500 opacity-100'
                                      : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                                  }`}
                                  title={isPinned ? 'Unpin favorite' : 'Pin to favorites'}
                                >
                                  <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-500' : ''}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pinned Favorites Dropdown Trigger */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => toggleDropdown('Pinned')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeDropdown === 'Pinned'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
                  }`}
                  title="Your Pinned Favorite Utilities"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Favorites</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                    {pinnedPaths.length}
                  </span>
                </button>

                {/* Pinned Utilities Popover */}
                {activeDropdown === 'Pinned' && (
                  <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl z-50 animate-slide-up">
                    <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      <span>Pinned Utilities</span>
                      <span className="font-mono text-slate-400">Alt+1..5</span>
                    </div>

                    <div className="space-y-1">
                      {ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path)).map((tool, idx) => {
                        const Icon = tool.icon;
                        const isSelected = tool.path === currentPath;

                        return (
                          <div
                            key={tool.path}
                            onClick={() => {
                              playClickSound();
                              setActiveDropdown(null);
                              onNavigate(tool.path);
                            }}
                            className={`group flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {tool.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {idx < 5 && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500">
                                  ⌥{idx + 1}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => togglePin(tool.path, e)}
                                className="p-1 text-amber-500 hover:text-slate-400"
                                title="Unpin from favorites"
                              >
                                <Star className="w-3 h-3 fill-amber-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Search Bar Spotlight Trigger (⌘K) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveDropdown(null);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] text-xs text-slate-500 dark:text-slate-400 hover:border-sky-500/50 hover:bg-white dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-2xs group cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform shrink-0" />
                <span className="flex-1 text-left font-normal truncate">Search {ALL_TOOLS.length} tools...</span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
                  <Command className="w-2.5 h-2.5 inline" />K
                </span>
              </button>
            </div>

            {/* 4. Streamlined Actions & Controls Deck */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Load Sample Data Button */}
              <button
                type="button"
                onClick={handleLoadSample}
                className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  sampleLoaded
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-100/80 dark:bg-white/[0.04] hover:bg-sky-500 hover:text-white hover:border-sky-500 border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                }`}
                title="Quickly load sample data into active tool"
              >
                {sampleLoaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Loaded</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sample</span>
                  </>
                )}
              </button>

              {/* Pin Current Tool Button */}
              <button
                type="button"
                onClick={(e) => togglePin(currentPath, e)}
                className={`p-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] transition-colors hidden sm:flex ${
                  pinnedPaths.includes(currentPath)
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/[0.08]'
                }`}
                title={pinnedPaths.includes(currentPath) ? 'Unpin current tool' : 'Pin current tool to favorites'}
              >
                <Star className={`w-4 h-4 ${pinnedPaths.includes(currentPath) ? 'fill-amber-500' : ''}`} />
              </button>

              {/* Dark / Light Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  toggleTheme();
                }}
                aria-label="Toggle Color Theme"
                className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/[0.08] transition-all"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Unified Studio Settings Dropdown (⚙️) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('Settings')}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeDropdown === 'Settings'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Studio Controls & Preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Studio Settings Popover */}
                {activeDropdown === 'Settings' && (
                  <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl z-50 animate-slide-up space-y-3">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] pb-2">
                      Studio Preferences
                    </div>

                    {/* Accent Color Chooser */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Accent Theme Glow</span>
                        <span className="text-[10px] font-mono text-slate-400">{accentConfig.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {ACCENT_THEMES.map((theme) => {
                          const isActive = accentTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setAccentTheme(theme.id);
                              }}
                              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-[10px] font-medium transition-all ${
                                isActive
                                  ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-white/[0.08]'
                                  : 'border-slate-200/60 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full shadow-xs"
                                style={{ background: theme.color }}
                              />
                              <span className="truncate max-w-[50px]">{theme.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preferences Quick Toggles */}
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                      {/* Audio FX Toggle */}
                      <button
                        type="button"
                        onClick={handleSoundToggle}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {soundOn ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                          <span>Audio FX Sounds</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{soundOn ? 'ON' : 'MUTED'}</span>
                      </button>

                      {/* Scratchpad History */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenHistory();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-400" />
                          <span>Scratchpad History</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Drawer</span>
                      </button>

                      {/* Keyboard Shortcuts */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenShortcuts();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Keyboard className="w-4 h-4 text-slate-400" />
                          <span>Shortcuts Cheat Sheet</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">?</span>
                      </button>

                      {/* PWA Install Button if available */}
                      {installPrompt && (
                        <button
                          type="button"
                          onClick={handleInstallApp}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <DownloadCloud className="w-4 h-4" />
                            <span>Install Desktop App</span>
                          </div>
                          <span className="text-[10px] font-mono">PWA</span>
                        </button>
                      )}
                    </div>

                    {/* Air-Gapped Engine Status Pill inside Settings */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04] text-[10px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Air-Gapped Sandbox
                        </span>
                        <span className="font-mono text-emerald-500 font-bold">0ms latency</span>
                      </div>
                      <p className="text-slate-400 leading-tight">
                        Zero server transmission. Computes entirely within your browser's private memory.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Hamburger Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsMobileDrawerOpen(true);
                }}
                aria-label="Open Mobile Navigation"
                className="lg:hidden p-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Mobile Slide-Out Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-white dark:bg-[#080d1a] h-full shadow-2xl flex flex-col z-10 animate-slide-up border-l border-slate-200 dark:border-white/[0.1] overflow-hidden">
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
                  <div className="text-[10px] text-slate-400 font-mono">{ALL_TOOLS.length} Developer Utilities</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Controls */}
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
                <span>Search all {ALL_TOOLS.length} tools...</span>
                <span className="ml-auto font-mono text-[10px] bg-white dark:bg-white/[0.1] px-1 rounded">⌘K</span>
              </button>

              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Quick Actions</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="p-1.5 rounded-lg text-amber-500 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                    title="Load Sample"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                    title="Toggle Audio"
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
                </div>
              </div>
            </div>

            {/* Categorized Tools List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Pinned Tools Section */}
              {pinnedPaths.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 px-1">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>Favorites</span>
                  </div>
                  <div className="space-y-1">
                    {ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path)).map((tool) => {
                      const PIcon = tool.icon;
                      const isSelected = tool.path === currentPath;
                      return (
                        <div
                          key={tool.path}
                          onClick={() => {
                            playClickSound();
                            setIsMobileDrawerOpen(false);
                            onNavigate(tool.path);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <PIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{tool.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => togglePin(tool.path, e)}
                            className="p-1 text-amber-500"
                          >
                            <Star className="w-3 h-3 fill-amber-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All 4 Categories */}
              {categories.map((cat) => {
                const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat.id);
                const theme = categoryThemes[cat.id];

                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                      <span>{cat.id === 'Docs' ? 'Docs & Text' : cat.id === 'Dev' ? 'Dev & API' : cat.id}</span>
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
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500 text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : `${theme.bg} ${theme.color}`
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{tool.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => togglePin(tool.path, e)}
                              className={`p-1 rounded-md ${
                                isPinned
                                  ? 'text-amber-500'
                                  : isSelected
                                  ? 'text-white/60'
                                  : 'text-slate-300 dark:text-slate-600'
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
            <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% In-Browser Privacy
              </span>
              <span className="font-mono text-[10px]">v2.6</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
