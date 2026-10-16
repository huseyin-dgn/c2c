import PageIntro from '@/components/PageIntro';
import ProcessTimeline from '@/components/ProcessTimeline';
import TechnicalApproach from '@/components/TechnicalApproach';
import ContactSection from '@/components/ContactSection';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata(
  'Nasıl Çalışıyoruz?',
  'İhtiyaç analizi, çözüm tasarımı, geliştirme, test ve entegrasyon aşamalarından oluşan mühendislik sürecimiz.',
  '/yaklasim',
);
export default function ApproachPage() {
  return (
    <>
      <PageIntro
        label="YAKLAŞIMIMIZ"
        title="Önce doğru sorular."
        accent="Sonra çalışan sistemler."
        description="Teknolojiden önce problemi konuşuruz. Her adımda kapsamı, varsayımları ve beklenen çıktıları görünür tutarız."
      />
      <section className="container approach-page">
        <ProcessTimeline />
      </section>
      <TechnicalApproach />
      <ContactSection />
    </>
  );
}
