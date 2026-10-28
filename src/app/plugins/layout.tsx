import type { Metadata } from 'next';
import Script from 'next/script';

// Favicon da FLMMKR Plugins: "Fp" no azul do site (#0071e3) sobre fundo branco. Substitui o ícone do site nestas páginas.
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/plugins/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/plugins/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/plugins/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/plugins/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

/** Páginas da FLMMKR Plugins: além do Analytics do site, registram a propriedade própria dos plugins. */
export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="/plugins-analytics.js" strategy="afterInteractive" />
    </>
  );
}
