import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/siteConfig';

/**
 * Next.js Robots.txt Generator
 * Configurado rigorosamente para Search Engines e IA Search/Citations (GEO/AEO).
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.seo.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/private/',
          '/api/webhooks/',
          '/_next/',
        ],
      },
      // 1. Buscadores Tradicionais
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot'],
        allow: '/',
      },
      // 2. Assistentes e Buscadores com IA (Citação, Busca em Tempo Real e GEO)
      {
        userAgent: [
          'OAI-SearchBot',   // OpenAI Search (SearchGPT)
          'ChatGPT-User',    // Navegação em tempo real do ChatGPT
          'Claude-SearchBot',// Claude Search / Web browsing
          'Claude-User',     // Ações de usuário no Claude
          'PerplexityBot',   // Perplexity AI Search Crawler
          'Perplexity-User', // Requisições em tempo real do usuário no Perplexity
          'Applebot-Extended'// Apple Intelligence Web Search
        ],
        allow: '/',
      },
      // NOTA OPCIONAL: Se desejar bloquear APENAS o treinamento dos modelos de IA mantendo a citação nos buscadores,
      // descomente as regras abaixo:
      /*
      {
        userAgent: [
          'GPTBot',          // Treinamento de modelos da OpenAI
          'ClaudeBot',        // Treinamento de modelos da Anthropic
          'Google-Extended', // Treinamento Gemini / Vertex AI
          'CCBot',           // Common Crawl (dataset público de IA)
          'Bytespider',      // ByteDance
        ],
        disallow: '/',
      },
      */
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
