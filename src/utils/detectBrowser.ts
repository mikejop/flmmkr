export type SocialPlatform = 'instagram' | 'tiktok' | 'other';

export interface SocialBrowserDetection {
  platform: SocialPlatform;
  isInAppBrowser: boolean;
}

/**
 * Identifica se o visitante está utilizando um navegador interno do Instagram ou TikTok
 * analisando o User-Agent e o Referrer (quando disponíveis).
 *
 * @param userAgent User-Agent opcional (passado no servidor ou via navigator.userAgent no client)
 * @param referrer Referrer opcional (passado no servidor ou via document.referrer no client)
 */
export function detectSocialBrowser(
  userAgent?: string,
  referrer?: string
): SocialBrowserDetection {
  let ua = '';
  let ref = '';

  if (typeof window !== 'undefined') {
    ua = userAgent || window.navigator?.userAgent || '';
    ref = referrer || document.referrer || '';
  } else {
    ua = userAgent || '';
    ref = referrer || '';
  }

  const uaLower = ua.toLowerCase();
  const refLower = ref.toLowerCase();

  // 1. Sinais do Instagram no User-Agent
  // O Instagram no iOS/Android costuma incluir 'Instagram', 'FBAN', 'FBAV', 'InstagramApp', 'FB_IAB'
  const isInstagramUA =
    uaLower.includes('instagram') ||
    uaLower.includes('fban') ||
    uaLower.includes('fbav') ||
    uaLower.includes('fb_iab');

  // Sinais do Instagram no Referrer
  const isInstagramRef =
    refLower.includes('instagram.com') || refLower.includes('l.instagram.com');

  // 2. Sinais do TikTok no User-Agent
  // O TikTok costuma incluir 'tiktok', 'musical_ly', 'bytedancewebview', 'bytedance', 'trill', 'snssdk'
  const isTikTokUA =
    uaLower.includes('tiktok') ||
    uaLower.includes('musical_ly') ||
    uaLower.includes('bytedancewebview') ||
    uaLower.includes('bytedance') ||
    uaLower.includes('trill') ||
    uaLower.includes('snssdk');

  // Sinais do TikTok no Referrer
  const isTikTokRef =
    refLower.includes('tiktok.com') || refLower.includes('linktr.ee/tiktok');

  // Avaliação com prioridade de User-Agent e reforço por Referrer
  if (isInstagramUA || (isInstagramRef && uaLower.includes('mobile'))) {
    return {
      platform: 'instagram',
      isInAppBrowser: true
    };
  }

  if (isTikTokUA || (isTikTokRef && uaLower.includes('mobile'))) {
    return {
      platform: 'tiktok',
      isInAppBrowser: true
    };
  }

  // Fallback seguro para navegação comum
  return {
    platform: 'other',
    isInAppBrowser: false
  };
}
