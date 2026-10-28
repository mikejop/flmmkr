import Script from 'next/script';

/** Páginas da FLMMKR Plugins: além do Analytics do site, registram a propriedade própria dos plugins. */
export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="/plugins-analytics.js" strategy="afterInteractive" />
    </>
  );
}
