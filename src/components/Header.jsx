import React, { useState, useEffect, useRef } from 'react';
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
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ALL_TOOLS } from '../utils/toolsList';
import {
  initSoundPreference,
  toggleSoundPreference,
  playClickSound
} from '../utils/audioFeedback';

export function Header({
  currentPath,
  onNavigate,
  onOpenCommandPalette,
  onOpenHistory,
  onOpenShortcuts,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const found = ALL_TOOLS.find((t) => t.path === currentPath);
    return found ? found.category : 'All';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const dropdownRef = useRef(null);

  // Sync category if path changes
  useEffect(() => {
    const found = ALL_TOOLS.find((t) => t.path === currentPath);
    if (found && selectedCategory !== 'All' && selectedCategory !== found.category) {
      setSelectedCategory(found.category);
    }
  }, [currentPath]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const categories = [
    { id: 'All', label: 'All Tools', count: 13 },
    { id: 'Data', label: 'Data', count: 4 },
    { id: 'Security', label: 'Security', count: 2 },
    { id: 'Docs', label: 'Docs & Text', count: 3 },
    { id: 'Dev', label: 'Dev & API', count: 4 },
  ];

  const filteredTools =
    selectedCategory === 'All'
      ? ALL_TOOLS
      : ALL_TOOLS.filter((t) => t.category === selectedCategory);

  const currentTool = ALL_TOOLS.find((t) => t.path === currentPath) || ALL_TOOLS[0];
  const CurrentIcon = currentTool.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/85 dark:bg-[#060911]/90 border-b border-slate-200/80 dark:border-white/[0.08] transition-colors duration-200 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Row: Brand, Studio Spotlight Bar, Unified Action Pill Deck */}
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/json-to-csv"
              onClick={(e) => {
                e.preventDefault();
                playClickSound();
                onNavigate('/json-to-csv');
              }}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer select-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/50 group-hover:scale-105 transition-all duration-300">
                  <div className="w-full h-full bg-[#060911]/30 backdrop-blur-xs rounded-[10px] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#060911]" />
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
                  100% In-Browser • Air-Gapped
                </span>
              </div>
            </a>
          </div>

          {/* Quick Tool Selector Popover Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/90 dark:bg-white/[0.04] text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500/50 hover:bg-white dark:hover:bg-white/[0.08] transition-all shadow-xs"
              title="Browse all 13 developer utilities"
            >
              <div className="w-5 h-5 rounded-md bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                <CurrentIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold max-w-[110px] sm:max-w-none truncate">{currentTool.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2.5 z-50 animate-slide-up max-h-[460px] overflow-y-auto"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] mb-1">
                  <span>Developer Utilities Suite</span>
                  <span className="text-sky-500 font-mono">13 Total</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {['Data', 'Security', 'Docs', 'Dev'].map((cat) => {
                    const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat);
                    return (
                      <div key={cat} className="py-2 first:pt-1 last:pb-1">
                        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {cat}
                        </div>
                        <div className="space-y-0.5">
                          {toolsInCat.map((tool) => {
                            const Icon = tool.icon;
                            const isSelected = tool.path === currentPath;
                            return (
                              <button
                                key={tool.path}
                                onClick={() => {
                                  playClickSound();
                                  onNavigate(tool.path);
                                }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                                  isSelected
                                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                <span className="flex-1 truncate">{tool.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
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
          </div>

          {/* Studio Spotlight Search Trigger (Ctrl+K) */}
          <button
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
            {/* PWA Install Button if available */}
            {installPrompt && (
              <button
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

            {/* Divider */}
            <div className="w-px h-4 bg-slate-200 dark:bg-white/[0.08] mx-0.5" />

            {/* Dark / Light Toggle */}
            <button
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
          </div>
        </div>

        {/* Secondary Category & Tool Navigation Pill Bar */}
        <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-white/[0.06]">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 shrink-0 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06]">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-white dark:bg-white/[0.1] text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] shrink-0"></div>

          {/* Active Tools for Category */}
          <div className="flex items-center gap-1.5 shrink-0">
            {filteredTools.map((item) => {
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
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
        </div>
      </div>
    </header>
  );
}
