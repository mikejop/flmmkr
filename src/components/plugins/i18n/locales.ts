/** Idiomas da FLMMKR Plugins. Português é o padrão; a escolha manual fica num cookie para o servidor já renderizar certo. */

export const PLUGINS_LOCALES = [
  { code: 'pt', name: 'Português', short: 'PT', dir: 'ltr', html: 'pt-BR' },
  { code: 'en', name: 'English', short: 'EN', dir: 'ltr', html: 'en' },
  { code: 'es', name: 'Español', short: 'ES', dir: 'ltr', html: 'es' },
  { code: 'fr', name: 'Français', short: 'FR', dir: 'ltr', html: 'fr' },
  { code: 'it', name: 'Italiano', short: 'IT', dir: 'ltr', html: 'it' },
  { code: 'hi', name: 'हिन्दी', short: 'HI', dir: 'ltr', html: 'hi' },
  { code: 'ar', name: 'العربية', short: 'AR', dir: 'rtl', html: 'ar' },
  { code: 'zh', name: '中文', short: 'ZH', dir: 'ltr', html: 'zh-CN' },
] as const;

export type PluginsLocale = (typeof PLUGINS_LOCALES)[number]['code'];
export const DEFAULT_PLUGINS_LOCALE: PluginsLocale = 'pt';
export const PLUGINS_LOCALE_COOKIE = 'flmmkr_plugins_lang';

export const isPluginsLocale = (v: unknown): v is PluginsLocale => PLUGINS_LOCALES.some((l) => l.code === v);
export const localeMeta = (code: PluginsLocale) => PLUGINS_LOCALES.find((l) => l.code === code) ?? PLUGINS_LOCALES[0];

// País do IP (ISO 3166) → idioma. Países multilíngues (Suíça, Canadá...) ficam de fora e caem no idioma do computador.
const COUNTRY_GROUPS: Record<PluginsLocale, string> = {
  pt: 'BR PT AO MZ CV GW ST TL',
  es: 'ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY PR GQ',
  fr: 'FR BE LU MC SN CI ML BF NE TG BJ GN CD CG CM GA MG HT TD CF DJ KM BI',
  it: 'IT SM VA',
  hi: 'IN',
  ar: 'SA AE EG MA DZ TN LY IQ SY JO LB KW QA BH OM YE SD PS MR',
  zh: 'CN TW HK MO',
  en: 'US GB IE AU NZ ZA NG KE GH JM TT BS BB BZ SG PH MT UG ZM ZW BW NA SL LR GM',
};

const COUNTRY_LOCALE = new Map<string, PluginsLocale>(
  (Object.entries(COUNTRY_GROUPS) as [PluginsLocale, string][]).flatMap(([locale, list]) => list.split(' ').map((c) => [c, locale] as const)),
);

/** Primeiro idioma suportado da lista do navegador (Accept-Language), ou null. */
export function localeFromAcceptLanguage(header: string | null | undefined): PluginsLocale | null {
  if (!header) return null;
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((t) => t.tag && t.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const base = tag.split('-')[0];
    if (isPluginsLocale(base)) return base;
  }
  return null;
}

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview/i;

/**
 * Ordem: escolha salva > país do IP > idioma do computador > padrão.
 * Buscadores sempre veem o português (a página indexada é a /plugins em pt-BR).
 * País identificado mas sem idioma suportado (ex.: Alemanha) e navegador também sem: inglês.
 */
export function detectPluginsLocale(input: {
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
}): PluginsLocale {
  if (isPluginsLocale(input.cookie)) return input.cookie;
  if (input.userAgent && BOT_RE.test(input.userAgent)) return DEFAULT_PLUGINS_LOCALE;
  const country = input.country?.toUpperCase();
  const byIp = country ? COUNTRY_LOCALE.get(country) : undefined;
  if (byIp) return byIp;
  const byBrowser = localeFromAcceptLanguage(input.acceptLanguage);
  if (byBrowser) return byBrowser;
  return country && country !== 'XX' ? 'en' : DEFAULT_PLUGINS_LOCALE;
}
