'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { localeMeta, PLUGINS_LOCALE_COOKIE, type PluginsLocale } from './locales';
import { pt, type PluginsDict } from './pt';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { hi } from './hi';
import { ar } from './ar';
import { zh } from './zh';

const DICTS: Record<PluginsLocale, PluginsDict> = { pt, en, es, fr, it, hi, ar, zh };

type Ctx = { locale: PluginsLocale; t: PluginsDict; setLocale: (code: PluginsLocale) => void };

const PluginsI18n = createContext<Ctx>({ locale: 'pt', t: pt, setLocale: () => {} });

export function PluginsI18nProvider({ initialLocale, children }: { initialLocale: PluginsLocale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale);

  // O layout raiz declara pt-BR: aqui o <html> passa a refletir o idioma da página (leitores de tela e tradutores).
  useEffect(() => {
    const meta = localeMeta(locale);
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
    return () => {
      document.documentElement.lang = 'pt-BR';
      document.documentElement.dir = 'ltr';
    };
  }, [locale]);

  const setLocale = useCallback((code: PluginsLocale) => {
    setLocaleState(code);
    // Escolha manual vale por 1 ano e vence a detecção por IP.
    document.cookie = `${PLUGINS_LOCALE_COOKIE}=${code}; path=/plugins; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ locale, t: DICTS[locale], setLocale }), [locale, setLocale]);
  return <PluginsI18n.Provider value={value}>{children}</PluginsI18n.Provider>;
}

export const usePluginsI18n = () => useContext(PluginsI18n);
