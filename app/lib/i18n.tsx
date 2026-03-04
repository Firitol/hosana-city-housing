'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import am from '@/locales/am.json';

type Locale = 'en' | 'am';
interface I18nContextType { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string; }
const I18nContext = createContext<I18nContextType | undefined>(undefined);
const translations: Record<Locale, any> = { en, am };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    const saved = localStorage.getItem('hosana_locale') as Locale;
    if (saved && ['en', 'am'].includes(saved)) setLocale(saved);
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) { value = value?.[k]; }
    return value || key;
  };

  const handleSetLocale = (newLocale: Locale) => { setLocale(newLocale); localStorage.setItem('hosana_locale', newLocale); };

  return <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
