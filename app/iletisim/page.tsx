
import { ArrowUpRight, Check } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import ContactModeSwitcher from '@/components/ContactModeSwitcher';
import { contactConfigured } from '@/lib/contact';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata(
  'İletişim',
  'C2C Mühendislik ile genel iletişim, iş birliği ve proje geliştirme talepleriniz için iletişime geçin.',
  '/iletisim',
);

const founders = [
  {
    name: 'Hüseyin Doğan',
    linkedin:
      'https://www.linkedin.com/in/huseyin-dogan-47136333b/',
  },
  {
    name: 'İlker Akbal',
    linkedin:
      'https://www.linkedin.com/in/ilker-akbal-b963ab25a/',
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    alan?: string | string[];
    tur?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const selectedArea =
    typeof params.alan === 'string' ? params.alan : '';

  const requestedMode =
    typeof params.tur === 'string' ? params.tur : '';

  const initialMode =
    selectedArea || requestedMode === 'proje'
      ? 'project'
      : 'general';

  const enabled = contactConfigured();

  return (
    <>
      <PageIntro
        label="İLETİŞİM"
        title="Bizimle iletişime geçin."
        accent="İhtiyaçlarınızı birlikte değerlendirelim."
        description="Genel sorularınız, iş birliği talepleriniz ve yazılım geliştirme projeleriniz için bizimle iletişime geçebilirsiniz."
      />

      <section className="container contact-page">
        <aside className="contact-aside">
          <span className="eyebrow">
            C2C MÜHENDİSLİK
          </span>

          <h2>
            İletişimin
            <br />
            doğru başlangıç noktası.
          </h2>

          <p>
            Genel bir konuda bilgi almak veya
            teknik bir proje hakkında görüşmek
            için size uygun iletişim seçeneğini
            kullanabilirsiniz.
          </p>

          <ul>
            {[
              'Genel sorular ve iş birliği talepleri',
              'Yazılım ve teknoloji geliştirme projeleri',
              'Teknik ihtiyaçların değerlendirilmesi',
            ].map((item) => (
              <li key={item}>
                <Check size={17} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <p>
            Formlarda parola, erişim anahtarı
            veya hassas kişisel veri paylaşmayın.
          </p>

          <div className="contact-github">
            <span className="eyebrow">KURUCU EKİP</span>

            {founders.map((founder) => (
              <a
                key={founder.name}
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {founder.name} / LinkedIn
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </aside>

        <ContactModeSwitcher
          enabled={enabled}
          selectedArea={selectedArea}
          initialMode={initialMode}
        />
      </section>
    </>
  );
}
