import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';
import { LESSON_SEO, LESSON_SEO_PUBLISHED, LESSON_SEO_UPDATED_AT } from '@/data/lessonSeo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.seo.url;
  const lastModDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastModDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cursos`,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/prisma2/download`,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => {
    const isMainProduct = product.slug === 'color-master-produto';
    return {
      url: `${baseUrl}/produtos/${product.slug}`,
      lastModified: lastModDate,
      changeFrequency: isMainProduct ? 'daily' : 'weekly',
      priority: isMainProduct ? 1.0 : product.isAvailable ? 0.8 : 0.6,
    };
  });

  // Prévias públicas das aulas (a área de membros em si não é indexável).
  const lessonPages: MetadataRoute.Sitemap = (LESSON_SEO_PUBLISHED ? LESSON_SEO : []).map((lesson) => ({
    url: `${baseUrl}/aulas/${lesson.moduleSlug}/${lesson.slug}`,
    lastModified: new Date(LESSON_SEO_UPDATED_AT),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const indexPage: MetadataRoute.Sitemap = LESSON_SEO_PUBLISHED
    ? [{ url: `${baseUrl}/aulas`, lastModified: new Date(LESSON_SEO_UPDATED_AT), changeFrequency: 'weekly', priority: 0.9 }]
    : [];

  return [...staticPages, ...indexPage, ...productPages, ...lessonPages];
}
