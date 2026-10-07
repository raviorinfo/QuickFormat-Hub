import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  History,
  DownloadCloud,
  Search,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  Sparkles,
  Command
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/80 dark:bg-[#060911]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Row: Logo, Command Bar, Quick Actions */}
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/json-to-csv"
              onClick={(e) => {
                e.preventDefault();
                playClickSound();
                onNavigate('/json-to-csv');
              }}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/45 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#060911]/20 backdrop-blur-xs rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    QuickFormat <span className="gradient-text">Hub</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-500 border border-brand-500/20 uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  100% In-Browser Utilities
                </span>
              </div>
            </a>
          </div>

          {/* Quick Tool Selector Popover (Compact on mobile, quick jump) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-850 transition-all shadow-xs"
              title="Browse all 13 tools"
            >
              <CurrentIcon className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="font-semibold max-w-[120px] sm:max-w-none truncate">{currentTool.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 z-50 animate-slide-up max-h-[460px] overflow-y-auto"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Developer Utilities</span>
                  <span className="text-brand-500 font-mono">13 Total</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
                  {['Data', 'Security', 'Docs', 'Dev'].map((cat) => {
                    const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat);
                    return (
                      <div key={cat} className="py-2 first:pt-0 last:pb-0">
                        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                                  isSelected
                                    ? 'bg-brand-500 text-white font-bold shadow-xs'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                <span className="flex-1 truncate">{tool.label}</span>
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

          {/* Spotlight Search Trigger (Ctrl+K) */}
          <button
            onClick={() => {
              playClickSound();
              onOpenCommandPalette();
            }}
            className="flex-1 max-w-sm hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span className="flex-1 text-left font-normal truncate">Quick search tools & actions...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
              Ctrl+K
            </kbd>
          </button>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA Install Button if available */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500 hover:text-white transition-all shadow-xs"
                title="Install QuickFormat Hub as Desktop / Mobile App"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Mobile Search Button */}
            <button
              onClick={() => {
                playClickSound();
                onOpenCommandPalette();
              }}
              aria-label="Search"
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Scratchpad History Button */}
            <button
              onClick={() => {
                playClickSound();
                onOpenHistory();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-colors"
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
              className="hidden sm:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Sound FX Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label="Toggle UI Audio Effects"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-colors"
              title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-brand-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                playClickSound();
                toggleTheme();
              }}
              aria-label="Toggle Color Theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Secondary Category & Tool Pill Bar */}
        <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-slate-800/60">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 shrink-0 p-0.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/60">
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
                      ? 'bg-white dark:bg-slate-800 text-brand-500 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>

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
                      ? 'bg-brand-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
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
