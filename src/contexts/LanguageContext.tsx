// src/contexts/LanguageContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { LanguageCode, defaultLanguage, languages } from '@/i18n/settings';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = 'apocaliptics-language';

// Detectar idioma del navegador
const detectBrowserLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return defaultLanguage;

  const browserLang = navigator.language.split('-')[0];
  const supportedLang = languages.find((lang) => lang.code === browserLang);

  return supportedLang ? supportedLang.code : defaultLanguage;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar idioma guardado o detectar del navegador
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as
      | LanguageCode
      | null;

    if (savedLanguage && languages.some((l) => l.code === savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const detectedLanguage = detectBrowserLanguage();
      setLanguageState(detectedLanguage);
    }

    setIsHydrated(true);
  }, []);

  // Guardar idioma cuando cambie
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // Actualizar atributo lang inicial
  useEffect(() => {
    if (isHydrated && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language, isHydrated]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
