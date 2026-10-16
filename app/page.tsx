import Story from '@/components/Story';
import AboutSection from '@/components/AboutSection';
import HardwareExperience from '@/components/HardwareExperience';
import CameraDemo from '@/components/CameraDemo';
import SolutionsShowcase from '@/components/SolutionsShowcase';
import ProblemStory from '@/components/ProblemStory';
import ProcessTimeline from '@/components/ProcessTimeline';
import SectionHeading from '@/components/SectionHeading';
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
      <HardwareExperience />
      <CameraDemo />
      <SolutionsShowcase />
      <ProblemStory />
      <section className="section process-section container" id="calisma-sureci">
        <SectionHeading
          label="NASIL ÇALIŞIYORUZ?"
          title="Belirsizlikten,"
          accent="net bir yol haritasına."
          description="Her aşaması anlaşılır, çıktısı tanımlı bir geliştirme süreci. Sürecin adımlarını keşfedin."
        />
        <ProcessTimeline />
      </section>
      <ContactSection />
    </>
  );
}
