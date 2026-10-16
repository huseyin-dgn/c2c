import Story from '@/components/Story';
import AboutSection from '@/components/AboutSection';
import UseCasesSection from '@/components/UseCasesSection';
import DevelopmentSection from '@/components/DevelopmentSection';
import ProcessTimeline from '@/components/ProcessTimeline';
import SectionHeading from '@/components/SectionHeading';
import TechnicalApproach from '@/components/TechnicalApproach';
import TeamSection from '@/components/TeamSection';
import ContactSection from '@/components/ContactSection';
export default function Home() {
  return (
    <>
      <Story />
      <div className="capabilities-strip">
        <div className="container">
          <span>PROBLEMDEN ÇALIŞAN SİSTEME</span>
          <p>
            Yapay zekâ <i /> Bilgisayarlı görü <i /> Otomasyon <i /> Özel yazılım
          </p>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
      <AboutSection />
      <DevelopmentSection />
      <UseCasesSection />
      <section className="section process-section container">
        <SectionHeading
          label="NASIL ÇALIŞIYORUZ?"
          title="Belirsizlikten,"
          accent="net bir yol haritasına."
          description="Her aşaması anlaşılır, çıktısı tanımlı bir geliştirme süreci. Sürecin adımlarını keşfedin."
        />
        <ProcessTimeline />
      </section>
      <TechnicalApproach />
      <TeamSection />
      <ContactSection />
    </>
  );
}
