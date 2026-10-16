import type { Metadata } from 'next';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    ...(siteUrl ? { alternates: { canonical: `${siteUrl}${path}` } } : {}),
    openGraph: {
      title: `${title} | C2C Mühendislik`,
      description,
      locale: 'tr_TR',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'C2C Mühendislik — Problemden çalışan sisteme',
        },
      ],
      ...(siteUrl ? { url: `${siteUrl}${path}` } : {}),
    },
  };
}
