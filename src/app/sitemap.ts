import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.seo.url;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cursos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/produtos/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: product.isAvailable ? 0.95 : 0.7,
  }));

  return [...staticPages, ...productPages];
}
