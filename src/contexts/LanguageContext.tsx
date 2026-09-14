import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Language, TranslationDictionary } from '../i18n/types';
import { vi } from '../i18n/vi';
import { en } from '../i18n/en';

const LANGUAGE_STORAGE_KEY = 'psm_app_language_v1';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') return saved;
      return 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);
    } catch (e) {
      console.error('Failed to save language to storage', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  }, [language, setLanguage]);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', language);
    } catch {
      // ignore
    }
  }, [language]);

  const t = useMemo<TranslationDictionary>(() => {
    return language === 'en' ? en : vi;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
