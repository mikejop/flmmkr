import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.seo.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/private/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'DeepSeekBot',
          'GrokBot',
          'Bytespider',
          'CCBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
