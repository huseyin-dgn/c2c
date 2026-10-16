import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { projects } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return [
    '',
    '/cozumler',
    '/projeler',
    '/yaklasim',
    '/hakkimizda',
    '/iletisim',
    '/kvkk',
    ...projects.map((project) => `/projeler/${project.slug}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
