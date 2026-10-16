import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function ContactSection() {
  return (
    <section className="contact-section">
      <div className="container contact-inner">
        <span className="eyebrow">
          <i className="status-dot" /> BİRLİKTE GELİŞTİRELİM
        </span>
        <h2>
          Çözülmesi gereken
          <br />
          teknik bir <span>probleminiz mi var?</span>
        </h2>
        <div className="contact-bottom">
          <p>
            İhtiyacınızı bizimle paylaşın. Size uygun mühendislik yaklaşımını birlikte
            değerlendirelim.
          </p>
          <Link href="/iletisim" className="button button-light">
            Projenizi Anlatın <ArrowUpRight size={21} />
          </Link>
        </div>
        <span className="contact-watermark" aria-hidden="true">
          c2c
        </span>
      </div>
    </section>
  );
}
