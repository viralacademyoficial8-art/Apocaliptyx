// src/components/ThemeProvider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'red' | 'purple' | 'blue' | 'green' | 'yellow' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: AccentColor;
  storageKey?: string;
  accentStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultAccent = 'red',
  storageKey = 'apocaliptyx-theme',
  accentStorageKey = 'apocaliptyx-accent',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>(defaultAccent);
  const [mounted, setMounted] = useState(false);

  // Cargar tema y color de acento guardados
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedAccent = localStorage.getItem(accentStorageKey) as AccentColor | null;
      if (savedAccent && ['red', 'purple', 'blue', 'green', 'yellow', 'orange'].includes(savedAccent)) {
        setAccentColorState(savedAccent);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, [storageKey, accentStorageKey]);

  // Resolver tema actual y aplicar clase a <html>
  useEffect(() => {
    const root = document.documentElement;

    const resolveTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        const systemTheme: 'dark' | 'light' = systemPrefersDark ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        return systemTheme;
      }

      setResolvedTheme(theme);
      return theme;
    };

    const current = resolveTheme();

    root.classList.remove('light', 'dark');
    root.classList.add(current);

    // Si está en modo sistema, escuchar cambios
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const newTheme: 'dark' | 'light' = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Aplicar color de acento a <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // ignore
    }
  };

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
    try {
      localStorage.setItem(accentStorageKey, newColor);
    } catch {
      // ignore
    }
  };

  // Evitar flash de tema incorrecto
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Default values for SSR and when context is not available
const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  accentColor: 'red',
  setAccentColor: () => {},
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Return default values during SSR or when outside ThemeProvider
  // This prevents build errors during static generation
  if (!ctx) {
    return defaultThemeContext;
  }
  return ctx;
}
