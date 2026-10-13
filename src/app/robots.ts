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
          '/api/',
          '/color-master-produto',
          '/conteudo',
          '/primeiro-acesso',
          '/definir-senha',
          '/_next/',
        ],
      },
      // 1. Buscadores Tradicionais (com foco explícito em Bingbot conforme Webmaster Guidelines)
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/color-master-produto',
          '/conteudo',
          '/primeiro-acesso',
          '/definir-senha',
          '/_next/',
        ],
      },
      {
        userAgent: ['Googlebot', 'Applebot', 'DuckDuckBot', 'YandexBot'],
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
        ],
        allow: '/',
      },
      // 3. Crawlers de TREINAMENTO de modelos de IA: bloqueados (as IAs de busca acima continuam liberadas).
      {
        userAgent: [
          'GPTBot',          // Treinamento de modelos da OpenAI
          'ClaudeBot',       // Treinamento de modelos da Anthropic
          'Google-Extended', // Treinamento Gemini / Vertex AI
          'CCBot',           // Common Crawl (dataset público de IA)
          'Bytespider',      // ByteDance
          'Applebot-Extended', // Apple: uso do conteúdo para treinar modelos (o Applebot de busca segue liberado)
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
