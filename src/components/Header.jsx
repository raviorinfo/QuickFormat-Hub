import React, { useState, useEffect } from 'react';
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
  Keyboard
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [soundOn, setSoundOn] = useState(false);

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

  const categories = ['All', 'Data', 'Security', 'Docs', 'Dev'];

  const filteredTools =
    selectedCategory === 'All'
      ? ALL_TOOLS
      : ALL_TOOLS.filter((t) => t.category === selectedCategory);

  const currentTool = ALL_TOOLS.find((t) => t.path === currentPath) || ALL_TOOLS[0];
  const CurrentIcon = currentTool.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/json-to-csv"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/json-to-csv');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  QuickFormat <span className="text-brand-500 font-extrabold">Hub</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                  13 Client-Side Utilities
                </span>
              </div>
            </a>
          </div>

          {/* Quick Search Bar / Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-xs text-slate-400 hover:border-brand-500/50 hover:text-slate-600 dark:hover:text-slate-200 transition-all max-w-xs w-full"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span className="flex-1 text-left">Search tools & actions...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Right Controls: Install PWA, History, Dropdown & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button if available */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500 hover:text-white transition-colors"
                title="Install QuickFormat Hub as Desktop / Mobile App"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Scratchpad History Button */}
            <button
              onClick={onOpenHistory}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
              title="Recent Scratchpad History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Quick Tool Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 transition-colors"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden lg:inline">{currentTool.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-slide-up max-h-96 overflow-y-auto"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    All Utilities (13 Total)
                  </div>
                  {ALL_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    const isSelected = tool.path === currentPath;
                    return (
                      <button
                        key={tool.path}
                        onClick={() => onNavigate(tool.path)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          isSelected
                            ? 'bg-brand-500/10 text-brand-500 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate">{tool.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{tool.category}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Trigger Button */}
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              className="hidden sm:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Sound FX Audio Synthesizer Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label="Toggle UI Audio Effects"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-colors"
              title={soundOn ? 'Mute Sound Effects' : 'Enable Web Audio Clicks'}
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
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500/40 transition-all duration-200"
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

        {/* Scrollable Category & Tool Bar */}
        <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-200 dark:bg-slate-800 text-brand-500 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>

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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
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
