'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import ptBR from './translations/pt-BR';
import en from './translations/en';
import es from './translations/es';

export type Language = 'pt-BR' | 'en' | 'es';

const translations: Record<Language, Record<string, unknown>> = {
  'pt-BR': ptBR as unknown as Record<string, unknown>,
  'en': en as unknown as Record<string, unknown>,
  'es': es as unknown as Record<string, unknown>,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt-BR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('fisio-language') as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fisio-language', lang);
    document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : lang;
  }, []);

  const t = useCallback(
    (path: string, replacements?: Record<string, string | number>) => {
      const value = getNestedValue(translations[language], path);
      if (value === undefined) {
        const fallback = getNestedValue(translations['pt-BR'], path);
        if (!fallback) return path;
        if (!replacements) return fallback;
        let result = fallback;
        for (const [key, val] of Object.entries(replacements)) {
          result = result.replace(`{${key}}`, String(val));
        }
        return result;
      }
      if (!replacements) return value;
      let result = value;
      for (const [key, val] of Object.entries(replacements)) {
        result = result.replace(`{${key}}`, String(val));
      }
      return result;
    },
    [language],
  );

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'pt-BR', setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
