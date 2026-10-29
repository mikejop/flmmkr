import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { PluginsLanding } from '@/components/plugins/PluginsLanding';
import { PluginsI18nProvider } from '@/components/plugins/i18n/context';
import { detectPluginsLocale, PLUGINS_LOCALE_COOKIE } from '@/components/plugins/i18n/locales';
import { SITE_CONFIG } from '@/config/siteConfig';

const PAGE_URL = `${SITE_CONFIG.seo.url}/plugins`;
// Imagem de compartilhamento: o False Color em uso (1200x630, JPG para funcionar em todas as redes).
const OG_IMAGE = { url: '/plugins/og-plugins.jpg', width: 1200, height: 630, alt: 'Plugin False Color da FLMMKR aplicado na viewer do DaVinci Resolve' };
const TITLE = 'FLMMKR Plugins';
const DESCRIPTION =
  'Plugins gratuitos para DaVinci Resolve, compatíveis com a versão gratuita: False Color, Skin e Social. Em produção: Chronus, Fibo e Kine.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  applicationName: TITLE,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'FLMMKR',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'pt_BR',
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

export default async function PluginsPage() {
  // Idioma: escolha salva > país do IP (Vercel) > idioma do computador > português.
  const [h, c] = await Promise.all([headers(), cookies()]);
  const locale = detectPluginsLocale({
    cookie: c.get(PLUGINS_LOCALE_COOKIE)?.value,
    country: h.get('x-vercel-ip-country'),
    acceptLanguage: h.get('accept-language'),
    userAgent: h.get('user-agent'),
  });
  return (
    <PluginsI18nProvider initialLocale={locale}>
      <PluginsLanding />
    </PluginsI18nProvider>
  );
}
