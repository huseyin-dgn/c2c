import { ArrowUpRight, Check } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import ContactForm from '@/components/ContactForm';
import { contactConfigured } from '@/lib/contact';
import { team } from '@/lib/content';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata(
  'Projenizi Anlatın',
  'Teknik probleminizi ve proje ihtiyacınızı C2C Mühendislik ile değerlendirmek için başlangıç noktası.',
  '/iletisim',
);
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ alan?: string | string[] }>;
}) {
  const query = await searchParams;
  const selectedArea = typeof query.alan === 'string' ? query.alan : '';
  const enabled = contactConfigured();
  return (
    <>
      <PageIntro
        label="İLETİŞİM / PROJE TALEBİ"
        title="Bir problemle başlayalım."
        accent="Çözümü birlikte düşünelim."
        description="Hazır bir teknik şartnameye ihtiyacınız yok. Ne yapmak istediğinizi ve bugün sizi neyin zorladığını anlatmanız yeterli."
      />
      <section className="container contact-page">
        <aside className="contact-aside">
          <span className="eyebrow">İLK GÖRÜŞMEYE HAZIRLIK</span>
          <h2>
            Doğru başlangıç,
            <br />
            açık bir problem tanımı.
          </h2>
          <ul>
            {[
              'Çözmek istediğiniz teknik problem',
              'Mevcut sistemleriniz ve veri kaynakları',
              'Hedeflediğiniz çıktı ve kısıtlar',
            ].map((item) => (
              <li key={item}>
                <Check size={17} />
                {item}
              </li>
            ))}
          </ul>
          <p>Gizli bilgi, parola, kişisel veri seti veya özel erişim anahtarı paylaşmayın.</p>
          <div className="contact-github">
            <span className="eyebrow">EKİBİ İNCELEYİN</span>
            {team.map((person) => (
              <a href={person.github} key={person.name} target="_blank" rel="noopener noreferrer">
                {person.name} / GitHub <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </aside>
        <ContactForm enabled={enabled} selectedArea={selectedArea} />
      </section>
    </>
  );
}
