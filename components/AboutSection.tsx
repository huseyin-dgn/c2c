import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import MotionSection from './MotionSection';
import { team } from '@/lib/content';

export default function AboutSection() {
  return <MotionSection motionKey="about" className="about-editorial section" id="bizi-taniyin">
    <div className="container">
      <div className="about-editorial-heading">
        <span className="eyebrow" data-motion="copy">BİZİ TANIYIN</span>
        <h2 data-motion="heading">Teknolojiden önce<br /><em>problemi anlıyoruz.</em></h2>
      </div>
      <div className="about-editorial-body">
        <div className="about-wordmark" data-motion="visual" aria-hidden="true">c<span>2</span>c<svg viewBox="0 0 480 65" fill="none"><path data-draw d="M5 32H175L205 10H278L308 32H475" stroke="currentColor" /><circle cx="5" cy="32" r="4" fill="currentColor" /><circle cx="475" cy="32" r="4" fill="currentColor" /></svg></div>
        <div className="about-editorial-copy">
          <p className="about-lead" data-motion="copy">Bilgisayar mühendisliği geçmişine sahip iki kişilik bağımsız bir ekibiz. İşletmelerin teknik problemlerini analiz eder, çözüm tasarlar ve geliştiririz.</p>
          <div className="about-short-blocks">
            <div data-motion="copy"><h3>Ne geliştiriyoruz?</h3><p>Yapay zekâ ve görüntü işleme sistemleri, operasyon araçları, otomasyon ve ihtiyaca özel yazılım.</p></div>
            <div data-motion="copy"><h3>Nereden başlıyoruz?</h3><p>Mevcut veriden, iş akışınızdan ve teknik sınırlarınızdan. Teknolojiyi, çözülmesi gereken probleme göre seçiyoruz.</p></div>
          </div>
          <Link href="/hakkimizda" className="text-link">Ekibi ve yaklaşımımızı tanıyın <ArrowUpRight size={17} /></Link>
        </div>
      </div>
      <div className="about-engineers" data-motion="copy">{team.map(person=><div key={person.name}><h3>{person.name}</h3><p>Tokat Gaziosmanpaşa Üniversitesi<br />Bilgisayar Mühendisliği mezunu</p><a className="text-link" href={person.github} target="_blank" rel="noopener noreferrer">GitHub çalışmalarını inceleyin ↗</a></div>)}</div>
    </div>
  </MotionSection>;
}
