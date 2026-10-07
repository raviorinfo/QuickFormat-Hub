import React, { createContext, useContext, useEffect, useState } from 'react';

export const ACCENT_THEMES = [
  { id: 'sky', label: 'Electric Sky', color: '#0ea5e9', gradient: 'from-sky-500 to-cyan-400', ring: 'ring-sky-400' },
  { id: 'emerald', label: 'Cyber Emerald', color: '#10b981', gradient: 'from-emerald-500 to-teal-400', ring: 'ring-emerald-400' },
  { id: 'violet', label: 'Neon Violet', color: '#8b5cf6', gradient: 'from-violet-500 to-fuchsia-400', ring: 'ring-violet-400' },
  { id: 'amber', label: 'Solar Amber', color: '#f59e0b', gradient: 'from-amber-500 to-orange-400', ring: 'ring-amber-400' },
];

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  accentTheme: 'sky',
  setAccentTheme: () => {},
  accentConfig: ACCENT_THEMES[0],
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('qfh_theme');
    if (saved) {
      return saved === 'dark';
    }
    return true;
  });

  const [accentTheme, setAccentTheme] = useState(() => {
    const saved = localStorage.getItem('qfh_accent');
    return saved && ACCENT_THEMES.some((a) => a.id === saved) ? saved : 'sky';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('qfh_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('qfh_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentTheme);
    localStorage.setItem('qfh_accent', accentTheme);
  }, [accentTheme]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const accentConfig = ACCENT_THEMES.find((a) => a.id === accentTheme) || ACCENT_THEMES[0];

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, accentTheme, setAccentTheme, accentConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

