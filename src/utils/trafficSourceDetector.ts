/**
 * Comprehensive Traffic Source, Device & AI Platform Detector
 * 
 * Accurately classifies traffic into:
 * - Direct
 * - Social Networks & Messaging Apps (WhatsApp, Instagram, TikTok, YouTube, LinkedIn, Reddit, etc.)
 * - Search Engines (Google, Bing, DuckDuckGo, etc.)
 * - Artificial Intelligence Platforms (ChatGPT, Gemini, Grok, DeepSeek, Z-AI, Claude, Perplexity, Copilot, etc.)
 * - Device categories (Mobile, Tablet, Desktop) and Browsers (including In-App WebViews)
 */

export type TrafficCategory = 'direct' | 'social_app' | 'search_engine' | 'ai_platform' | 'referral';

export interface TrafficAttribution {
  category: TrafficCategory;
  sourceName: string;
  referrer: string;
  landingPath: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface DeviceClassification {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  isInAppBrowser: boolean;
}

export interface VisitorTelemetryPayload {
  visitorId: string;
  deviceFingerprint: string; // Deterministic hardware fingerprint (MAC representation)
  attribution: TrafficAttribution;
  device: DeviceClassification;
  screenResolution?: string;
  timestamp: string;
}

/**
 * Classify traffic source based on Referrer URL and Query Parameters
 */
export function detectTrafficSource(
  referrerUrl = '',
  currentUrlOrQuery = ''
): TrafficAttribution {
  let ref = (referrerUrl || '').toLowerCase().trim();
  let queryStr = '';

  // Extract query params from URL or query string
  if (currentUrlOrQuery.includes('?')) {
    queryStr = currentUrlOrQuery.split('?')[1] || '';
  } else {
    queryStr = currentUrlOrQuery;
  }

  const params = new URLSearchParams(queryStr);
  const utmSource = params.get('utm_source')?.toLowerCase() || '';
  const utmMedium = params.get('utm_medium')?.toLowerCase() || '';
  const utmCampaign = params.get('utm_campaign') || undefined;
  const utmTerm = params.get('utm_term') || undefined;
  const utmContent = params.get('utm_content') || undefined;
  const gclid = params.get('gclid');
  const fbclid = params.get('fbclid');
  const ttclid = params.get('ttclid');
  const msclkid = params.get('msclkid');
  const refParam = params.get('ref')?.toLowerCase() || '';

  let pathname = '/';
  try {
    if (currentUrlOrQuery.startsWith('http')) {
      pathname = new URL(currentUrlOrQuery).pathname;
    } else if (currentUrlOrQuery.startsWith('/')) {
      pathname = currentUrlOrQuery.split('?')[0];
    }
  } catch {}

  // 1. VERIFICAR INTELIGÊNCIA ARTIFICIAL (AI PLATFORMS)
  // ChatGPT / OpenAI
  if (
    ref.includes('chatgpt.com') ||
    ref.includes('chat.openai.com') ||
    utmSource.includes('chatgpt') ||
    utmSource.includes('openai')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'ChatGPT',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'chatgpt',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Google Gemini / Bard
  if (
    ref.includes('gemini.google.com') ||
    ref.includes('bard.google.com') ||
    utmSource.includes('gemini') ||
    utmSource.includes('bard')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Gemini',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'gemini',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Grok / xAI
  if (
    ref.includes('grok.com') ||
    ref.includes('x.ai') ||
    utmSource.includes('grok') ||
    utmSource.includes('xai')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Grok',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'grok',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // DeepSeek
  if (
    ref.includes('deepseek.com') ||
    ref.includes('chat.deepseek.com') ||
    utmSource.includes('deepseek')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'DeepSeek',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'deepseek',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Z-AI / ZAI
  if (
    ref.includes('z.ai') ||
    ref.includes('zai.com') ||
    ref.includes('z-ai.com') ||
    utmSource.includes('z-ai') ||
    utmSource.includes('zai')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Z-AI',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'z-ai',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Claude / Anthropic
  if (
    ref.includes('claude.ai') ||
    ref.includes('anthropic.com') ||
    utmSource.includes('claude') ||
    utmSource.includes('anthropic')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Claude',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'claude',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Perplexity AI
  if (
    ref.includes('perplexity.ai') ||
    utmSource.includes('perplexity')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Perplexity',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'perplexity',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Microsoft Copilot
  if (
    ref.includes('copilot.microsoft.com') ||
    ref.includes('edgeservices.bing.com/edgesvc/chat') ||
    utmSource.includes('copilot')
  ) {
    return {
      category: 'ai_platform',
      sourceName: 'Copilot',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'copilot',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Outras AIs (Qualquer domínio .ai, subdomínio chat.* ou parâmetros de AI)
  if (
    ref.includes('meta.ai') ||
    ref.includes('poe.com') ||
    ref.includes('phind.com') ||
    ref.includes('you.com') ||
    ref.includes('mistral.ai') ||
    ref.includes('character.ai') ||
    utmSource.includes('ai') ||
    utmSource.includes('gpt') ||
    utmSource.includes('llm') ||
    (ref.match(/\.ai(\/|$)/) && !ref.includes('openai.com'))
  ) {
    let customAiName = 'Outra IA';
    if (ref.includes('meta.ai')) customAiName = 'Meta AI';
    else if (ref.includes('poe.com')) customAiName = 'Poe AI';
    else if (ref.includes('phind.com')) customAiName = 'Phind AI';
    else if (ref.includes('you.com')) customAiName = 'You.com AI';
    else if (ref.includes('mistral.ai')) customAiName = 'Mistral AI';
    else if (utmSource) customAiName = `IA (${utmSource})`;

    return {
      category: 'ai_platform',
      sourceName: customAiName,
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'ai',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // 2. VERIFICAR APPS DE MENSAGENS E REDES SOCIAIS
  // WhatsApp
  if (
    ref.includes('whatsapp') ||
    ref.includes('l.wl.co') ||
    ref.includes('api.whatsapp.com') ||
    ref.includes('web.whatsapp.com') ||
    utmSource.includes('whatsapp') ||
    refParam.includes('whatsapp')
  ) {
    return {
      category: 'social_app',
      sourceName: 'WhatsApp',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'whatsapp',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Instagram
  if (
    ref.includes('instagram.com') ||
    ref.includes('l.instagram.com') ||
    utmSource.includes('instagram') ||
    refParam.includes('instagram')
  ) {
    return {
      category: 'social_app',
      sourceName: 'Instagram',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'instagram',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // TikTok
  if (
    ref.includes('tiktok.com') ||
    ref.includes('linktr.ee/tiktok') ||
    ttclid ||
    utmSource.includes('tiktok') ||
    refParam.includes('tiktok')
  ) {
    return {
      category: 'social_app',
      sourceName: 'TikTok',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'tiktok',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // YouTube
  if (
    ref.includes('youtube.com') ||
    ref.includes('youtu.be') ||
    utmSource.includes('youtube') ||
    refParam.includes('youtube')
  ) {
    return {
      category: 'social_app',
      sourceName: 'YouTube',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'youtube',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // LinkedIn
  if (
    ref.includes('linkedin.com') ||
    ref.includes('lnkd.in') ||
    utmSource.includes('linkedin') ||
    refParam.includes('linkedin')
  ) {
    return {
      category: 'social_app',
      sourceName: 'LinkedIn',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'linkedin',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Reddit
  if (
    ref.includes('reddit.com') ||
    ref.includes('redd.it') ||
    utmSource.includes('reddit') ||
    refParam.includes('reddit')
  ) {
    return {
      category: 'social_app',
      sourceName: 'Reddit',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'reddit',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Twitter / X
  if (
    ref.includes('t.co') ||
    ref.includes('twitter.com') ||
    ref.includes('x.com') ||
    utmSource.includes('twitter') ||
    utmSource.includes('x')
  ) {
    return {
      category: 'social_app',
      sourceName: 'Twitter / X',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'twitter',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Facebook
  if (
    ref.includes('facebook.com') ||
    ref.includes('l.facebook.com') ||
    ref.includes('fb.me') ||
    fbclid ||
    utmSource.includes('facebook')
  ) {
    return {
      category: 'social_app',
      sourceName: 'Facebook',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'facebook',
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // 3. MECANISMOS DE BUSCA (SEARCH ENGINES)
  // Google Search
  if (
    ref.includes('google.') ||
    ref.includes('android-app://com.google.android.googlequicksearchbox') ||
    gclid ||
    utmSource.includes('google')
  ) {
    return {
      category: 'search_engine',
      sourceName: 'Google Search',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || (gclid ? 'google_ads' : 'google_organic'),
      utmMedium: utmMedium || (gclid ? 'cpc' : 'organic'),
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // Bing Search
  if (
    ref.includes('bing.com') ||
    msclkid ||
    utmSource.includes('bing')
  ) {
    return {
      category: 'search_engine',
      sourceName: 'Bing Search',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || (msclkid ? 'bing_ads' : 'bing_organic'),
      utmMedium: utmMedium || (msclkid ? 'cpc' : 'organic'),
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // DuckDuckGo
  if (
    ref.includes('duckduckgo.com') ||
    utmSource.includes('duckduckgo')
  ) {
    return {
      category: 'search_engine',
      sourceName: 'DuckDuckGo',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource: utmSource || 'duckduckgo',
      utmMedium: utmMedium || 'organic',
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  // 4. TRÁFEGO DIRETO VS REFERRAL
  // Se não tem referrer nem parâmetros UTM ou é do próprio site
  const isInternalReferrer =
    ref.includes('flmmkr.site') ||
    ref.includes('localhost') ||
    ref.includes('vercel.app');

  if (!ref || isInternalReferrer) {
    if (utmSource) {
      return {
        category: 'referral',
        sourceName: `Campanha (${utmSource})`,
        referrer: referrerUrl,
        landingPath: pathname,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent
      };
    }

    return {
      category: 'direct',
      sourceName: 'Direto (Digitou URL ou Favoritos)',
      referrer: '',
      landingPath: pathname
    };
  }

  // Outro site externo (Referral geral)
  try {
    const domain = new URL(referrerUrl).hostname.replace(/^www\./, '');
    return {
      category: 'referral',
      sourceName: domain,
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  } catch {
    return {
      category: 'referral',
      sourceName: 'Link Externo',
      referrer: referrerUrl,
      landingPath: pathname,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }
}

/**
 * Classify device, OS and Browser from User-Agent string
 */
export function classifyDeviceAndBrowser(userAgent: string): DeviceClassification {
  if (!userAgent) {
    return {
      deviceType: 'desktop',
      os: 'Desconhecido',
      browser: 'Navegador Padrão',
      isInAppBrowser: false
    };
  }

  const ua = userAgent.toLowerCase();

  // 1. Detectar In-App Browsers (WebViews)
  let isInApp = false;
  let inAppBrowserName = '';

  if (ua.includes('instagram') || ua.includes('fban') || ua.includes('fbav') || ua.includes('fb_iab')) {
    isInApp = true;
    inAppBrowserName = 'Instagram In-App';
  } else if (ua.includes('tiktok') || ua.includes('bytedance') || ua.includes('trill') || ua.includes('snssdk')) {
    isInApp = true;
    inAppBrowserName = 'TikTok In-App';
  } else if (ua.includes('whatsapp')) {
    isInApp = true;
    inAppBrowserName = 'WhatsApp In-App';
  } else if (ua.includes('linkedinapp')) {
    isInApp = true;
    inAppBrowserName = 'LinkedIn In-App';
  }

  // 2. Detectar Tipo de Dispositivo
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    deviceType = 'tablet';
  } else if (
    ua.includes('iphone') ||
    ua.includes('ipod') ||
    (ua.includes('android') && ua.includes('mobile')) ||
    ua.includes('windows phone')
  ) {
    deviceType = 'mobile';
  }

  // 3. Detectar Sistema Operacional (OS)
  let os = 'Outro';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // 4. Detectar Navegador
  let browser = inAppBrowserName || 'Navegador Web';
  if (!inAppBrowserName) {
    if (ua.includes('edg/') || ua.includes('edge/')) {
      browser = 'Microsoft Edge';
    } else if (ua.includes('samsungbrowser')) {
      browser = 'Samsung Internet';
    } else if (ua.includes('opr/') || ua.includes('opera/')) {
      browser = 'Opera';
    } else if (ua.includes('brave')) {
      browser = 'Brave';
    } else if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
      browser = 'Google Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    }
  }

  return {
    deviceType,
    os,
    browser,
    isInAppBrowser: isInApp
  };
}
