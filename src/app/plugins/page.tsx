import type { Metadata } from 'next';
import { PluginsLanding } from '@/components/plugins/PluginsLanding';
import { SITE_CONFIG } from '@/config/siteConfig';

const PAGE_URL = `${SITE_CONFIG.seo.url}/plugins`;
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
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function PluginsPage() {
  return <PluginsLanding />;
}
