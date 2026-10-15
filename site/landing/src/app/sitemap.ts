export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://voicegateway.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ['', '/about', '/privacy'];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
