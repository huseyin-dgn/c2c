import PageIntro from '@/components/PageIntro';
import DevelopmentSection from '@/components/DevelopmentSection';
import ContactSection from '@/components/ContactSection';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata(
  'Neler Geliştiriyoruz?',
  'Güvenlik kamerası ve görüntü işleme, endüstriyel kontrol, özel yazılım ve otomasyon için geliştirebildiğimiz çözüm alanları.',
  '/projeler',
);
export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        label="NELER GELİŞTİRİYORUZ?"
        title="İhtiyacınızdan başlayan,"
        accent="mühendislik çözümleri."
        description="Kamera analizi, endüstriyel kontrol ve özel yazılım için geliştirebildiğimiz sistemler. Buradaki içerikler çözüm alanlarıdır; tamamlanmış müşteri projeleri olarak sunulmaz."
      />
      <DevelopmentSection standalone />
      <ContactSection />
    </>
  );
}
