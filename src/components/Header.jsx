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
  Link2,
  LayoutGrid,
  PanelLeft,
  Rows3,
  ShoppingBag
} from 'lucide-react';
import { useTheme, ACCENT_THEMES, NAV_VIEWS } from '../context/ThemeContext';
import { ALL_TOOLS } from '../utils/toolsList';
import { BrandLogo } from './BrandLogo';
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
  const { isDark, toggleTheme, accentTheme, setAccentTheme, accentConfig, navView, setNavView } = useTheme();

  // Active dropdown states (only one open at a time)
  const [activeDropdown, setActiveDropdown] = useState(null); // 'Pinned' | 'Settings' | null
  const [selectedRibbonCategory, setSelectedRibbonCategory] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // New Navigation View Controls
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isViewSwitcherOpen, setIsViewSwitcherOpen] = useState(false);
  const [isSiblingSwitcherOpen, setIsSiblingSwitcherOpen] = useState(false);
  const [megaSearchQuery, setMegaSearchQuery] = useState('');

  useEffect(() => {
    setSelectedRibbonCategory(null);
    setIsMegaMenuOpen(false);
    setIsViewSwitcherOpen(false);
    setIsSiblingSwitcherOpen(false);
    setActiveDropdown(null);
  }, [currentPath]);

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
      if (!e.target.closest('#qfh-mega-menu-modal') && !e.target.closest('#qfh-explore-suites-btn')) {
        setIsMegaMenuOpen(false);
      }
      if (!e.target.closest('#qfh-view-switcher-btn') && !e.target.closest('#qfh-view-switcher-popover')) {
        setIsViewSwitcherOpen(false);
      }
      if (!e.target.closest('#qfh-sibling-switcher-btn') && !e.target.closest('#qfh-sibling-switcher-popover')) {
        setIsSiblingSwitcherOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMegaMenuOpen(false);
        setIsViewSwitcherOpen(false);
        setIsSiblingSwitcherOpen(false);
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
    { id: 'Commerce', label: 'Commerce', count: ALL_TOOLS.filter((t) => t.category === 'Commerce').length },
  ];

  const activeRibbonCategory = selectedRibbonCategory || currentTool.category;
  const displayedRibbonTools = activeRibbonCategory === 'Pinned'
    ? ALL_TOOLS.filter((t) => pinnedPaths.includes(t.path))
    : ALL_TOOLS.filter((t) => t.category === activeRibbonCategory);

  const categoryThemes = {
    Data: {
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      dotColor: 'bg-sky-500',
      activeBg: 'bg-sky-500/15 dark:bg-sky-500/20',
      borderColor: 'border-sky-500/30',
      activePillBg: 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/25',
    },
    Security: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-500',
      activeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      activePillBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25',
    },
    Docs: {
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      dotColor: 'bg-purple-500',
      activeBg: 'bg-purple-500/15 dark:bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      activePillBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/25',
    },
    Dev: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-500',
      activeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      activePillBg: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25',
    },
    Commerce: {
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-500',
      activeBg: 'bg-rose-500/15 dark:bg-rose-500/20',
      borderColor: 'border-rose-500/30',
      activePillBg: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/25',
    },
    Pinned: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-500',
      activeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      activePillBg: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25',
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
        className={`sticky top-0 z-40 w-full backdrop-blur-xl studio-header transition-all duration-200 no-print ${
          isScrolled ? 'shadow-md dark:shadow-black/70' : 'shadow-xs'
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
                <BrandLogo className="w-8 h-8" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                      QuickFormat <span className="gradient-text">Hub</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                    {ALL_TOOLS.length} In-Browser Utilities
                  </span>
                </div>
              </a>
            </div>

            {/* 2. Adaptive Navigation Center: Streamlined Mega-Menu, Breadcrumb & Sibling Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {/* "Explore Suites" Button in Streamlined Mode */}
              {navView === 'streamlined' && (
                <button
                  id="qfh-explore-suites-btn"
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsMegaMenuOpen((prev) => !prev);
                    setIsViewSwitcherOpen(false);
                    setIsSiblingSwitcherOpen(false);
                    setActiveDropdown(null);
                  }}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
                    isMegaMenuOpen
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'studio-nav-btn'
                  }`}
                  title="Explore All Tool Suites"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-sky-500 group-hover:rotate-90 transition-transform" />
                  <span>Explore Suites</span>
                  <span className="text-[10px] font-mono opacity-70">({ALL_TOOLS.length})</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Contextual Sibling Tool Breadcrumb */}
              <div className="relative hidden md:flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {currentTool.category === 'Commerce' ? 'Commerce' : currentTool.category === 'Docs' ? 'Docs' : currentTool.category === 'Dev' ? 'Dev & API' : currentTool.category}
                </span>
                <span className="text-slate-300 dark:text-slate-600 font-normal">/</span>
                <button
                  id="qfh-sibling-switcher-btn"
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsSiblingSwitcherOpen((prev) => !prev);
                    setIsMegaMenuOpen(false);
                    setIsViewSwitcherOpen(false);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                  title="Click to jump to another tool in this suite"
                >
                  <CurrentIcon className="w-3.5 h-3.5 text-sky-500" />
                  <span className="max-w-[120px] lg:max-w-[170px] truncate">{currentTool.label}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSiblingSwitcherOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Sibling Tools Dropdown Popover */}
                {isSiblingSwitcherOpen && (
                  <div
                    id="qfh-sibling-switcher-popover"
                    className="absolute left-0 top-full mt-2 w-72 p-2 rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-slide-up space-y-1"
                  >
                    <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                      <span>{currentTool.category} Suite</span>
                      <span className="font-mono">{ALL_TOOLS.filter((t) => t.category === currentTool.category).length} tools</span>
                    </div>
                    {ALL_TOOLS.filter((t) => t.category === currentTool.category).map((tool) => {
                      const Icon = tool.icon;
                      const isCurrent = tool.path === currentPath;
                      const theme = categoryThemes[tool.category] || categoryThemes['Data'];
                      return (
                        <button
                          key={tool.path}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setIsSiblingSwitcherOpen(false);
                            onNavigate(tool.path);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-all ${
                            isCurrent
                              ? 'bg-sky-50 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${theme.bg} ${theme.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{tool.label}</span>
                          </div>
                          {tool.badge && (
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Search Bar Spotlight Trigger (⌘K) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveDropdown(null);
                  setIsMegaMenuOpen(false);
                  setIsViewSwitcherOpen(false);
                  setIsSiblingSwitcherOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border studio-search-btn text-xs shadow-xs group cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
                <span className="flex-1 text-left font-normal truncate">Search {ALL_TOOLS.length} utilities...</span>
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs shrink-0">
                  <Command className="w-2.5 h-2.5 inline" />K
                </span>
              </button>
            </div>

            {/* 4. Navigation View Switcher Control */}
            <div className="relative shrink-0">
              <button
                id="qfh-view-switcher-btn"
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsViewSwitcherOpen((prev) => !prev);
                  setActiveDropdown(null);
                  setIsMegaMenuOpen(false);
                  setIsSiblingSwitcherOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold studio-nav-btn cursor-pointer shadow-xs"
                title="Change Navigation View"
              >
                {navView === 'streamlined' && <LayoutGrid className="w-3.5 h-3.5 text-sky-500" />}
                {navView === 'sidebar' && <PanelLeft className="w-3.5 h-3.5 text-emerald-500" />}
                {navView === 'ribbon' && <Rows3 className="w-3.5 h-3.5 text-purple-500" />}
                <span className="hidden lg:inline capitalize font-medium">{navView} View</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isViewSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* View Switcher Dropdown Popover */}
              {isViewSwitcherOpen && (
                <div
                  id="qfh-view-switcher-popover"
                  className="absolute right-0 top-full mt-2 w-64 p-2 rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-slide-up space-y-1"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    Choose Navigation View
                  </div>
                  {NAV_VIEWS.map((view) => {
                    const isSelected = navView === view.id;
                    const Icon = view.id === 'streamlined' ? LayoutGrid : view.id === 'sidebar' ? PanelLeft : Rows3;
                    return (
                      <button
                        id={`qfh-view-opt-${view.id}`}
                        key={view.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setNavView(view.id);
                          setIsViewSwitcherOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{view.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight mt-0.5">
                            {view.sublabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Streamlined Actions & Controls Deck */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Direction 3 Signature [+ Open ⌵] Capsule Launcher (matches Image 1) */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenCommandPalette();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-200/80 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/[0.12] transition-all cursor-pointer shadow-xs group"
                title="Open Command Launcher (Ctrl+K)"
              >
                <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm leading-none group-hover:scale-110 transition-transform">+</span>
                <span className="font-semibold">Open</span>
                <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Load Sample Data Button */}
              <button
                type="button"
                onClick={handleLoadSample}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  sampleLoaded
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'studio-nav-btn'
                }`}
                title="Quickly load sample data into active tool"
              >
                {sampleLoaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Loaded</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sample</span>
                  </>
                )}
              </button>

              {/* Pin Current Tool Button */}
              <button
                type="button"
                onClick={(e) => togglePin(currentPath, e)}
                className={`w-8 h-8 rounded-lg border studio-nav-btn transition-colors hidden sm:flex items-center justify-center cursor-pointer shadow-xs ${
                  pinnedPaths.includes(currentPath)
                    ? 'text-amber-500 border-amber-400 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/10'
                    : ''
                }`}
                title={pinnedPaths.includes(currentPath) ? 'Unpin current tool' : 'Pin current tool to favorites'}
              >
                <Star className={`w-4 h-4 ${pinnedPaths.includes(currentPath) ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              {/* Dark / Light Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  toggleTheme();
                }}
                aria-label="Toggle Color Theme"
                className="w-8 h-8 rounded-lg border studio-nav-btn flex items-center justify-center transition-all cursor-pointer shadow-xs"
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
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    activeDropdown === 'Settings'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                      : 'studio-nav-btn'
                  }`}
                  title="Studio Controls & Preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Studio Settings Popover */}
                {activeDropdown === 'Settings' && (
                  <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-slide-up space-y-3">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
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
                                  ? 'border-slate-900 dark:border-sky-400 bg-slate-100 dark:bg-sky-500/15 text-slate-900 dark:text-white font-bold'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
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

                    {/* Navigation Layout Preference */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Navigation Layout</span>
                        <span className="text-[10px] font-mono text-sky-500 capitalize">{navView}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {NAV_VIEWS.map((v) => {
                          const isSelected = navView === v.id;
                          const Icon = v.id === 'streamlined' ? LayoutGrid : v.id === 'sidebar' ? PanelLeft : Rows3;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setNavView(v.id);
                              }}
                              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-xs'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="truncate">{v.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preferences Quick Toggles */}
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {/* Audio FX Toggle */}
                      <button
                        type="button"
                        onClick={handleSoundToggle}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
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
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
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
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
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
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-[10px]">
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
                className="lg:hidden p-1.5 rounded-lg border studio-nav-btn flex items-center justify-center cursor-pointer shadow-xs"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Sub-Navigation Ribbon (Only in 'ribbon' view for zero-redundancy) */}
        {navView === 'ribbon' && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#070b16] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-9 gap-3">
                
                {/* Left: Category Switcher Tabs */}
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar py-0.5">
                  {pinnedPaths.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedRibbonCategory('Pinned');
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeRibbonCategory === 'Pinned'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Favorites</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                        {pinnedPaths.length}
                      </span>
                    </button>
                  )}

                  {categories.map((cat) => {
                    const isCatActive = activeRibbonCategory === cat.id;
                    const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat.id);
                    const theme = categoryThemes[cat.id];

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setSelectedRibbonCategory(cat.id);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          isCatActive
                            ? `${theme.activeBg} ${theme.color} border ${theme.borderColor} font-bold shadow-2xs`
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                        <span>{cat.label}</span>
                        <span className="text-[9px] font-mono opacity-60">
                          {toolsInCat.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Vertical Separator */}
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

                {/* Right: Tools in Active Category (Fast 1-Click Jumping) */}
                <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar py-0.5">
                  {displayedRibbonTools.map((tool) => {
                    const isToolActive = tool.path === currentPath;
                    const Icon = tool.icon;
                    const theme = categoryThemes[tool.category] || categoryThemes['Data'];

                    return (
                      <button
                        key={tool.path}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onNavigate(tool.path);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                          isToolActive
                            ? `${theme.activePillBg} text-white font-bold shadow-xs`
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] font-medium'
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{tool.label}</span>
                        {tool.badge && !isToolActive && (
                          <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
                            {tool.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full Bento Mega-Menu Modal / Popover Overlay (for Streamlined View) */}
      {isMegaMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-16 px-3 sm:px-6 pb-6 overflow-y-auto no-print">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsMegaMenuOpen(false)}
          />
          <div
            id="qfh-mega-menu-modal"
            className="relative w-full max-w-6xl rounded-3xl bg-white dark:bg-[#080d19] border border-slate-200 dark:border-slate-700 shadow-2xl p-5 sm:p-7 z-10 animate-slide-up space-y-5"
          >
            {/* Mega-Menu Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40">
                    All {ALL_TOOLS.length} Utilities
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Platform Tool Suite Directory
                  </h2>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                  100% private, client-side browser utilities with zero latency.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Filter ${ALL_TOOLS.length} tools...`}
                    value={megaSearchQuery}
                    onChange={(e) => setMegaSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#0c1222] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close Directory (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 5-Column Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {categories.map((cat) => {
                const theme = categoryThemes[cat.id];
                const toolsInCat = ALL_TOOLS.filter((t) => {
                  if (t.category !== cat.id) return false;
                  if (!megaSearchQuery) return true;
                  const q = megaSearchQuery.toLowerCase();
                  return t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
                });

                if (toolsInCat.length === 0) return null;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-[#0b1020] border border-slate-200 dark:border-slate-800 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {cat.id === 'Docs' ? 'Docs & Text' : cat.id === 'Dev' ? 'Dev & API' : cat.id === 'Commerce' ? 'Commerce' : cat.id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {toolsInCat.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {toolsInCat.map((tool) => {
                        const Icon = tool.icon;
                        const isCurrent = tool.path === currentPath;

                        return (
                          <button
                            key={tool.path}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setIsMegaMenuOpen(false);
                              onNavigate(tool.path);
                            }}
                            className={`w-full group text-left flex items-start gap-2 p-1.5 rounded-xl transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold'
                                : 'hover:bg-white dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 hover:shadow-xs'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  {tool.label}
                                </span>
                                {tool.badge && (
                                  <span className="text-[8px] font-mono font-bold px-1 rounded bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30 shrink-0">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-1 leading-tight mt-0.5 font-medium">
                                {tool.desc}
                              </p>
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
        </div>
      )}

      {/* Clean Mobile Slide-Out Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-white dark:bg-[#080d1a] h-full shadow-2xl flex flex-col z-10 animate-slide-up border-l border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandLogo className="w-8 h-8" />
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
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0c1324] border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400"
              >
                <Search className="w-3.5 h-3.5 text-sky-500" />
                <span>Search all {ALL_TOOLS.length} tools...</span>
                <span className="ml-auto font-mono text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 rounded">⌘K</span>
              </button>

              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1324] border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Quick Actions</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="p-1.5 rounded-lg text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Load Sample"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Toggle Audio"
                  >
                    {soundOn ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Toggle Theme"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  </button>
                </div>
              </div>

              {/* Navigation View Switcher in Mobile Drawer */}
              <div className="pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                  Navigation Layout
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {NAV_VIEWS.map((v) => {
                    const isSelected = navView === v.id;
                    const Icon = v.id === 'streamlined' ? LayoutGrid : v.id === 'sidebar' ? PanelLeft : Rows3;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setNavView(v.id);
                        }}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{v.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
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
                      <span>{cat.id === 'Docs' ? 'Docs & Text' : cat.id === 'Dev' ? 'Dev & API' : cat.id === 'Commerce' ? 'Commerce & Retail' : cat.id}</span>
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
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b14] flex items-center justify-between text-[11px] text-slate-500">
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
