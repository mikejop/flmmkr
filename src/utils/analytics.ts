import { SocialPlatform } from './detectBrowser';

export interface AnalyticsEventParams {
  platform?: SocialPlatform;
  product_id?: string;
  product_name?: string;
  product_url?: string;
  social_name?: string;
  source?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Sistema centralizado de Analytics e Rastreamento de Eventos.
 * Envia para Google Analytics, Meta Pixel e Console em ambiente de desenvolvimento.
 */
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}): void {
  const payload = {
    timestamp: new Date().toISOString(),
    ...params
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${eventName}:`, payload);
  }

  if (typeof window === 'undefined') return;

  // Google Analytics 4 (GA4)
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  // Meta Pixel (fbq)
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, payload);
  }
}

/**
 * Evento específico de clique em Produto
 */
export function trackProductClick(
  productId: string,
  productName: string,
  productUrl: string,
  platform: SocialPlatform
): void {
  trackEvent('product_click', {
    product_id: productId,
    product_name: productName,
    product_url: productUrl,
    social_platform: platform
  });
}

/**
 * Evento específico de clique em Rede Social
 */
export function trackSocialClick(socialName: string, platform: SocialPlatform): void {
  const eventName =
    socialName.toLowerCase() === 'instagram'
      ? 'instagram_click'
      : socialName.toLowerCase() === 'tiktok'
      ? 'tiktok_click'
      : 'social_link_click';

  trackEvent(eventName, {
    social_name: socialName,
    social_platform: platform
  });
}

/**
 * Evento de acesso à página
 */
export function trackPageView(pageType: 'official' | 'social', platform: SocialPlatform): void {
  const eventName = pageType === 'social' ? 'access_social_page' : 'access_official_page';
  trackEvent(eventName, {
    page_type: pageType,
    social_platform: platform
  });
}
