import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { developmentAreas } from '@/lib/development-areas';
import MotionSection from './MotionSection';
import SystemDiagram from './SystemDiagram';

export default function DevelopmentSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section className="development-section" id="gelistirdiklerimiz" aria-label="Neler geliştiriyoruz?">
      {!standalone && <div className="container development-intro" id="cozumler">
        <span className="eyebrow">GELİŞTİREBİLDİĞİMİZ SİSTEMLER</span>
        <h2>Neler <em>geliştiriyoruz?</em></h2>
        <p>Görüntüyü bilgiye, veriyi karara, iş kurallarını çalışan yazılıma dönüştüren çözümler.</p>
      </div>}
      <p className="container development-note">Aşağıdakiler çözüm alanlarımızdır; tamamlanmış müşteri projeleri veya ticari referanslar değildir.</p>
      {developmentAreas.map(area => <MotionSection key={area.kind} motionKey={`development-${area.kind}`} className={`capability-spread capability-${area.kind}`}>
        <div className="container capability-layout">
          <div className="capability-illustration" data-motion="visual"><SystemDiagram kind={area.kind} /><p>{area.input} <span aria-hidden="true">→</span> {area.output}</p></div>
          <div className="capability-copy">
            <span className="eyebrow" data-motion="copy">{area.label}</span>
            <h3 data-motion="heading">{area.title.split('\n').map((line, index) => <span key={line}>{index === 1 ? <em>{line}</em> : line}</span>)}</h3>
            <p className="capability-lead" data-motion="copy">{area.description}</p>
            <ul className="capability-applications">{area.applications.map(item => <li key={item} data-motion="copy">{item}</li>)}</ul>
            <p className="capability-constraint" data-motion="copy">{area.constraint}</p>
            <Link className="text-link" href={`/iletisim?alan=${area.slug}`}>Bu ihtiyacı konuşalım <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </MotionSection>)}
    </section>
  );
}
