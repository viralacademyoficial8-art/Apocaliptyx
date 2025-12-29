// src/hooks/useTranslation.ts
'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations, getNestedTranslation } from '@/i18n';

export function useTranslation() {
  const { language } = useLanguage();
  const translations = getTranslations(language);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      return getNestedTranslation(translations, key, variables);
    },
    [translations],
  );

  return { t, language };
}
