
import PageIntro from '@/components/PageIntro';
import ProcessTimeline from '@/components/ProcessTimeline';
import TechnicalApproach from '@/components/TechnicalApproach';
import ContactSection from '@/components/ContactSection';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata(
  'Nasıl Çalışıyoruz?',
  'C2C Mühendislik, ihtiyaç analizinden teknik tasarıma, yazılım geliştirmeden test ve entegrasyona uzanan sistematik bir mühendislik yaklaşımı benimser.',
  '/yaklasim',
);

export default function ApproachPage() {
  return (
    <>
      <PageIntro
        label="NASIL ÇALIŞIYORUZ?"
        title="İhtiyacı analiz ediyor,"
        accent="çözümü mühendislikle geliştiriyoruz."
        description="Her projeyi teknik gereksinimler, mevcut altyapı ve hedeflenen çıktılar doğrultusunda ele alıyoruz. Analiz, tasarım, geliştirme, test ve entegrasyon aşamalarını sistematik bir süreç olarak planlıyoruz."
      />

      <section
        className="container approach-page"
        aria-label="Proje geliştirme sürecimiz"
      >
        <ProcessTimeline />
      </section>

      <TechnicalApproach />

      <ContactSection />
    </>
  );
}
