import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'peaceverse-theme';

interface ThemeContextValue {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemeMode(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'system';
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return getSystemPrefersDark() ? 'dark' : 'light';
}

export function applyThemeToDocument(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', resolved === 'dark' ? '#18191A' : '#FFFFFF');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveThemeMode(getStoredThemeMode())
  );

  // Sync DOM immediately on initial mount and whenever themeMode changes
  useEffect(() => {
    const nextResolved = resolveThemeMode(themeMode);
    setResolvedTheme(nextResolved);
    applyThemeToDocument(nextResolved);
  }, [themeMode]);

  // Follow OS/System theme changes live when user selected 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (themeMode === 'system') {
        const nextResolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        applyThemeToDocument(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [themeMode]);

  // Keep synced across browser tabs / windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const nextMode = isValidThemeMode(e.newValue) ? e.newValue : 'system';
        setThemeModeState(nextMode);
        const nextResolved = resolveThemeMode(nextMode);
        setResolvedTheme(nextResolved);
        applyThemeToDocument(nextResolved);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage quota / privacy errors
    }
    const nextResolved = resolveThemeMode(mode);
    setThemeModeState(mode);
    setResolvedTheme(nextResolved);
    applyThemeToDocument(nextResolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
