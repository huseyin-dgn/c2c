import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { solutions } from '@/lib/content';
import SectionHeading from './SectionHeading';
function SolutionEntry({
  solution,
}: {
  solution: (typeof solutions)[number];
}) {
  return (
    <Link className="solution-entry" href={`/cozumler#${solution.slug}`}>
      <span className="solution-name">{solution.name}</span>
      <div>
        <h3>{solution.title}</h3>
        <p>{solution.description}</p>
      </div>
      <ArrowUpRight size={22} strokeWidth={1.2} />
    </Link>
  );
}
export default function SolutionsSection() {
  return (
    <section className="section solutions-section" id="cozumler">
      <div className="container">
        <SectionHeading
          label="ÇÖZÜM ALANLARIMIZ"
          title="Teknoloji bir araç."
          accent="Asıl mesele, çözüm."
          description="Veriyi analiz eder, kamera akışlarını işler, mevcut sistemleri birbirine bağlarız. Gerektiğinde ihtiyacınıza özel yazılım geliştiririz."
        />
        <div className="solution-grid">
          {solutions.map((solution) => (
            <SolutionEntry key={solution.slug} solution={solution} />
          ))}
          <div className="solution-prompt">
            <h3>
              Sizin probleminiz{' '}
              <br />
              hangisi?
            </h3>
            <Link href="/iletisim" className="text-link">
              Birlikte değerlendirelim <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
