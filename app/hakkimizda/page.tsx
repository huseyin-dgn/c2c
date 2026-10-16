import PageIntro from '@/components/PageIntro';
import ContactSection from '@/components/ContactSection';
import AboutSection from '@/components/AboutSection';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata(
  'Hakkımızda',
  'C2C Mühendislik; İlker Akbal ve Hüseyin Doğan tarafından geliştirilen bağımsız mühendislik ve teknoloji ekibi.',
  '/hakkimizda',
);
export default function AboutPage() {
  return (
    <>
      <PageIntro
        label="HAKKIMIZDA"
        title="Meraktan beslenen,"
        accent="mühendislikle ilerleyen."
        description="C2C Mühendislik, teknik problemlere yazılım, algoritma ve yapay zekâ odaklı çözümler geliştirmek için bir araya gelen bağımsız bir ekiptir."
      />
      <AboutSection />
      <section className="container about-statement">
        <span className="eyebrow">NEDEN C2C?</span>
        <div>
          <h2>
            İş akışından başlayıp,
            <br />
            <span>Problemin bütününe bakıyoruz.</span>
          </h2>
          <p>
            Odağımız bir teknoloji listesi sunmak değil; işletmelerin karşılaştığı teknik ihtiyacı
            anlamak ve o ihtiyaca uygun sistemi tasarlamak. Yapay zekâyı, görüntü işlemeyi,
            otomasyonu ve özel yazılımı bu yaklaşımın araçları olarak görüyoruz.
          </p>
          <p>
            Üretim tesisleri, güvenlik ve otomasyon firmaları, teknoloji ekipleri ve AR-GE
            merkezleri için ihtiyaç analiziyle başlayan bir çalışma modeli benimsiyoruz.
          </p>
          <p className="content-note">
            C2C Mühendislik bir marka adıyla çalışan bağımsız geliştirme ekibidir. Henüz resmî
            şirket kuruluşu bulunmamaktadır.
          </p>
        </div>
      </section>
      <ContactSection />
    </>
  );
}
