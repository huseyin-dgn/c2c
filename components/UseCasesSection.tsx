import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCases } from '@/lib/content';
import SectionHeading from './SectionHeading';
import MotionSection from './MotionSection';
export default function UseCasesSection() {
  return (
    <MotionSection className="usecases section" motionKey="scenarios">
      <div className="container">
        <div data-motion="heading"><SectionHeading
          label="OLASI UYGULAMALAR"
          title="Gerçek dünya."
          accent="Somut problemler."
          description="Üretim, güvenlik ve operasyon için geliştirebileceğimiz çözüm senaryoları."
        /></div>
        <div className="cases-editorial">
          {useCases.map((item) => (
            <article key={item.title} className="case-essay" data-motion="copy">
                <span className="eyebrow">{item.sector}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="case-transformation" data-motion="visual">
                  <span>{item.input}</span>
                  <ArrowRight size={14} />
                  <span>{item.output}</span>
                </div>
                <Link className="text-link" href={`/cozumler#${item.slug}`}>
                  Çözüm yaklaşımı <ArrowUpRight size={16} />
                </Link>
            </article>
          ))}
        </div>
        <p className="content-note">
          Bu örnekler çözüm senaryolarıdır; tamamlanmış müşteri projeleri değildir.
          Uygulanabilirlik, veri ve saha koşullarıyla birlikte değerlendirilir.
        </p>
      </div>
    </MotionSection>
  );
}
