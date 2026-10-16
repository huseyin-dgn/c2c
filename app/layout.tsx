import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './fonts.css';
import './globals.css';
import './editorial.css';
import './interactive.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { siteUrl } from '@/lib/site';
export const viewport: Viewport = { themeColor: '#061f19' };
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || 'http://localhost:3000'),
  ...(siteUrl ? { alternates: { canonical: '/' } } : {}),
  title: {
    default: 'C2C Mühendislik | Problemden Çalışan Sisteme',
    template: '%s | C2C Mühendislik',
  },
  description:
    'Yapay zekâ, görüntü işleme, otomasyon ve özel yazılımla işletmenize özel mühendislik çözümleri geliştiren bağımsız ekip.',
  robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
  openGraph: {
    title: 'C2C Mühendislik',
    description: 'Karmaşık teknik problemlerden çalışan sistemlere.',
    locale: 'tr_TR',
    type: 'website',
    siteName: 'C2C Mühendislik',
  },
  twitter: { card: 'summary_large_image' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'C2C Mühendislik',
    inLanguage: 'tr',
    ...(siteUrl ? { url: siteUrl } : {}),
  };
  return (
    <html lang="tr">
      <head>
        <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-latin-ext.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
      {process.env.NODE_ENV === 'development' && (
          <Script id="c2c-debug-errors" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
            if (new URLSearchParams(location.search).get('debug') === '1') {
              window.__c2cDebugErrors = [];
              const capture = (value) => {
                const errors = window.__c2cDebugErrors;
                const message = value instanceof Error ? value.message : String(value);
                if (errors[errors.length - 1] !== message) errors.push(message);
                if (errors.length > 20) errors.shift();
              };
              addEventListener('error', (event) => {
                if (event.target instanceof HTMLScriptElement) capture('JavaScript yüklenemedi: ' + event.target.src);
                else if (event instanceof ErrorEvent) capture(event.error || event.message);
              }, true);
              addEventListener('unhandledrejection', (event) => capture(event.reason));
            }
          ` }} />
      )}
        <a className="skip-link" href="#main-content">
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  );
}
