import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en } from './en';
import { es, type TranslationCopy } from './es';
import { pt } from './pt';

export type Language = 'es' | 'en' | 'pt';

const LANGUAGE_STORAGE_KEY = 'app-language';

const translations = {
  es,
  en,
  pt,
} as const;

type Copy = TranslationCopy;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (
          storedLanguage === 'es' ||
          storedLanguage === 'en' ||
          storedLanguage === 'pt'
        ) {
          setLanguage(storedLanguage);
        }
      } catch {
        setLanguage('es');
      }
    };

    loadLanguage();
  }, []);

  const handleSetLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => {
      // Keep the in-memory selection even if persistence fails.
    });
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      copy: translations[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};
