import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import ContactSection from '@/components/ContactSection';
import { solutions } from '@/lib/content';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata(
  'Çözümlerimiz',
  'Yapay zekâ, bilgisayarlı görü, güvenlik, otomasyon ve özel yazılım için ihtiyaca özel mühendislik yaklaşımları.',
  '/cozumler',
);
export default function SolutionsPage() {
  return (
    <>
      <PageIntro
        label="ÇÖZÜMLERİMİZ"
        title="Her problem farklı."
        accent="Çözümü de öyle olmalı."
        description="Önce ihtiyacınızı anlarız. Ardından doğru veriyi, algoritmayı ve yazılım mimarisini bir araya getiririz."
      />
      <div className="container solution-details">
        {solutions.map((solution, i) => (
          <section id={solution.slug} className="solution-detail" key={solution.slug}>
            <span className="detail-index">0{i + 1}</span>
            <div>
              <span className="eyebrow">{solution.name}</span>
              <h2>{solution.title}</h2>
              <p className="detail-lead">{solution.description}</p>
              <p>{solution.approach}</p>
              <Link className="text-link" href={`/iletisim?alan=${solution.slug}`}>
                Bu alanda projenizi anlatın <ArrowUpRight size={17} />
              </Link>
            </div>
            <aside>
              <span className="eyebrow">ÖRNEK UYGULAMALAR</span>
              <ul>
                {solution.examples.map((example) => (
                  <li key={example}>
                    <Check size={16} />
                    {example}
                  </li>
                ))}
              </ul>
              <span className="content-note">
                Uygulanabilirlik, ihtiyaç analiziyle değerlendirilir.
              </span>
            </aside>
          </section>
        ))}
      </div>
      <ContactSection />
    </>
  );
}
