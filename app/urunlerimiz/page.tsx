import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import ProductCatalog from '@/components/ProductCatalog';
import { pageMetadata } from '@/lib/site';
import styles from '@/components/ProductCatalog.module.css';
export const metadata = pageMetadata('Ürünlerimiz', 'Güvenlik, endüstriyel görüntü işleme, otomasyon ve özel yazılım için dört alanda sekiz örnek çözüm konsepti.', '/urunlerimiz');

export default function ProductsPage() {
  return <div className={styles.page}>
    <section className={`container ${styles.intro}`}>
      <div className={styles.breadcrumb}><Link href="/">C2C MÜHENDİSLİK</Link><span>/</span> ÜRÜNLERİMİZ</div>
      <div className={styles.introTitle}><div><span className={styles.eyebrow}>ÖRNEK ÇÖZÜM KONSEPTLERİ</span><h1>Ürünlerimiz<span>.</span></h1></div><span className={styles.introMark} aria-hidden="true"><ArrowUpRight strokeWidth={.7} /></span></div>
      <div className={styles.introBottom}><p>İşletmelerin gerçek ihtiyaçlarından doğan; görüntü işleme, otomasyon, yapay zekâ ve özel yazılım odaklı mühendislik çözümleri geliştiriyoruz.</p><aside><span>KONSEPTTEN UYGULAMAYA</span><p>Bu katalog, geliştirebileceğimiz çözüm alanlarını ve örnek proje senaryolarını gösterir. İçerikler tamamlanmış müşteri referansı veya satışa hazır ürün değildir. Görseller temsilidir.</p></aside></div>
      <div className={styles.introMeta}><span>04 çözüm alanı <i /> 08 örnek senaryo</span><a href="#konsept-guvenlik">Konseptleri keşfedin <ArrowDown size={16} strokeWidth={1.2} /></a></div>
    </section>
    <ProductCatalog />
    <section className={styles.cta} aria-labelledby="products-cta-title"><div className="container"><span className={styles.eyebrow}>BİR SONRAKİ ÇÖZÜM, SİZİN İHTİYACINIZ OLABİLİR</span><div className={styles.ctaContent}><h2 id="products-cta-title">Sizin de bir<br /><em>proje fikriniz mi var?</em></h2><div><p>Bu sekiz konseptin dışında bir ihtiyacınız da olabilir. Görüntü işleme, yapay zekâ, otomasyon veya özel yazılım alanında size özel bir çözümü birlikte tasarlayabiliriz.</p><Link href="/iletisim">Bizimle iletişime geçin <ArrowUpRight size={21} strokeWidth={1.2} /></Link></div></div></div></section>
  </div>;
}
