import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.seo.url;
  const lastModDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cursos`,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/links`,
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

  return [...staticPages, ...productPages];
}
