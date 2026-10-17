
import Link from 'next/link';
import ContactSection from '@/components/ContactSection';
import { pageMetadata } from '@/lib/site';
import styles from './page.module.css';

export const metadata = pageMetadata(
  'Hakkımızda',
  'C2C Mühendislik, bilgisayar mühendisliği odağında yapay zekâ, görüntü işleme, otomasyon ve özel yazılım sistemleri geliştirmeye odaklanan bir mühendislik ekibidir.',
  '/hakkimizda',
);

const founders = [
  {
    name: 'Hüseyin Doğan',
    initials: 'HD',
    linkedin:
      'https://www.linkedin.com/in/huseyin-dogan-47136333b/',
  },
  {
    name: 'İlker Akbal',
    initials: 'İA',
    linkedin:
      'https://www.linkedin.com/in/ilker-akbal-b963ab25a/',
  },
];

const disciplines = [
  {
    title: 'Yapay Zekâ ve Görüntü İşleme',
    description:
      'Görüntü analizi, nesne tespiti, sınıflandırma ve kamera tabanlı izleme sistemleri.',
  },
  {
    title: 'Endüstriyel Sistemler ve Otomasyon',
    description:
      'Üretim süreçlerinin izlenmesi, görsel kalite kontrol ve operasyonel veri analizi.',
  },
  {
    title: 'Özel Yazılım Geliştirme',
    description:
      'İşletmelerin gereksinimlerine yönelik web uygulamaları, yönetim sistemleri ve veri işleme servisleri.',
  },
  {
    title: 'Sistem ve API Entegrasyonları',
    description:
      'Mevcut yazılım altyapıları arasında veri alışverişi, servis entegrasyonu ve süreç otomasyonu.',
  },
];

export default function AboutPage() {
  return (
    <>
      <main className={styles.page}>
        {/* HERO */}
        <section className={styles.hero}>
          <div
            className={styles.heroAura}
            aria-hidden="true"
          />

          <div className={styles.container}>
            <nav
              className={styles.breadcrumb}
              aria-label="Sayfa konumu"
            >
              <Link href="/">C2C MÜHENDİSLİK</Link>
              <span>/</span>
              <span>HAKKIMIZDA</span>
            </nav>

            <div className={styles.heroGrid}>
              <div>
                <p className={styles.kicker}>
                  <span
                    className={styles.kickerLine}
                    aria-hidden="true"
                  />
                  HAKKIMIZDA
                </p>

                <h1 className={styles.heroTitle}>
                  Bilgisayar
                  <br />
                  mühendisliğiyle
                  <br />
                  <em>teknoloji geliştiriyoruz.</em>
                </h1>
              </div>

              <div className={styles.heroSide}>
                <span
                  className={styles.heroRule}
                  aria-hidden="true"
                />

                <p>
                  C2C Mühendislik; yazılım geliştirme,
                  yapay zekâ, görüntü işleme ve otomasyon
                  alanlarına odaklanan, iki bilgisayar
                  mühendisinden oluşan bir ekiptir.
                </p>

                <Link
                  href="#kurucu-ekip"
                  className={styles.textLinkLight}
                >
                  Ekibimizi tanıyın
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* BİZ KİMİZ */}
        <section
          className={styles.introSection}
          aria-labelledby="intro-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionGrid}>
              <div className={styles.sectionSide}>
                <span className={styles.sectionNum}>
                  01 / BİZ KİMİZ?
                </span>
              </div>

              <div>
                <h2
                  id="intro-title"
                  className={styles.sectionTitle}
                >
                  Mühendislik bilgimizi,
                  <br />
                  <em>uygulanabilir sistemlere</em>
                  <br />
                  dönüştürüyoruz.
                </h2>

                <p className={styles.largeCopy}>
                  C2C Mühendislik, bilgisayar mühendisleri
                  Hüseyin Doğan ve İlker Akbal tarafından
                  oluşturulmuş bir mühendislik ekibidir.
                </p>

                <p className={styles.bodyCopy}>
                  Yazılım, algoritma ve sistem tasarımı
                  alanlarındaki çalışmalarımızı;
                  işletmelerin teknik gereksinimlerine
                  yönelik çözümler geliştirmeye
                  odaklıyoruz. İhtiyaç analizi, teknik
                  uygulanabilirlik ve mevcut sistemlerle
                  uyum, geliştirme yaklaşımımızın
                  temelini oluşturuyor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KURUCU EKİP */}
        <section
          id="kurucu-ekip"
          className={styles.teamSection}
          aria-labelledby="team-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeadingRow}>
              <div>
                <span className={styles.sectionNum}>
                  02 / KURUCU EKİP
                </span>

                <h2
                  id="team-title"
                  className={styles.sectionTitle}
                >
                  Ekibimizin
                  <br />
                  <em>arkasındaki mühendisler.</em>
                </h2>
              </div>

              <p className={styles.headingNote}>
                Bilgisayar mühendisliği altyapısıyla
                yazılım ve teknoloji geliştirmeye
                odaklanan kurucu ekip.
              </p>
            </div>

            <div className={styles.teamGrid}>
              {founders.map((founder, index) => (
                <article
                  key={founder.name}
                  className={styles.founderCard}
                >
                  <div className={styles.cardVisual}>
                    <span
                      className={styles.visualCircle}
                      aria-hidden="true"
                    />

                    <span
                      className={styles.visualCorner}
                    >
                      C2C / {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={styles.cardInitials}
                      aria-hidden="true"
                    >
                      {founder.initials}
                    </span>

                    <span
                      className={styles.visualTrack}
                      aria-hidden="true"
                    />
                  </div>

                  <div className={styles.cardInfo}>
                    <div>
                      <span className={styles.cardEyebrow}>
                        KURUCU / BİLGİSAYAR MÜHENDİSİ
                      </span>

                      <h3>{founder.name}</h3>

                      <p>Bilgisayar Mühendisi</p>
                    </div>

                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkedinLink}
                      aria-label={`${founder.name} LinkedIn profilini aç`}
                    >
                      LinkedIn ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ÇALIŞMA ALANLARI */}
        <section
          className={styles.disciplinesSection}
          aria-labelledby="disciplines-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionGrid}>
              <div className={styles.sectionSide}>
                <span className={styles.sectionNum}>
                  03 / ÇALIŞMA ALANLARIMIZ
                </span>
              </div>

              <div>
                <h2
                  id="disciplines-title"
                  className={styles.sectionTitle}
                >
                  Yazılım ve
                  <br />
                  <em>akıllı sistemler.</em>
                </h2>

                <div className={styles.disciplineList}>
                  {disciplines.map((item, index) => (
                    <article
                      key={item.title}
                      className={styles.disciplineItem}
                    >
                      <span
                        className={styles.disciplineIndex}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>

                      <span
                        className={styles.disciplineArrow}
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </article>
                  ))}
                </div>

                <Link
                  href="/projeler"
                  className={styles.textLinkDark}
                >
                  Neler geliştiriyoruz?
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MÜHENDİSLİK YAKLAŞIMI */}
        <section
          className={styles.approachSection}
          aria-labelledby="approach-title"
        >
          <div className={styles.container}>
            <span className={styles.sectionNum}>
              04 / MÜHENDİSLİK YAKLAŞIMIMIZ
            </span>

            <div className={styles.approachGrid}>
              <h2
                id="approach-title"
                className={styles.sectionTitle}
              >
                Gereksinimden
                <br />
                <em>sistem tasarımına.</em>
              </h2>

              <div className={styles.approachCopy}>
                <p>
                  Her projeyi teknik gereksinimler,
                  mevcut altyapı ve hedeflenen çıktılar
                  üzerinden değerlendiriyoruz.
                  Geliştirme sürecinde mimari tasarım,
                  güvenlik, performans ve sürdürülebilirliği
                  birlikte ele alıyoruz.
                </p>

                <Link
                  href="/yaklasim"
                  className={styles.textLinkLight}
                >
                  Yaklaşımımızı inceleyin
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ContactSection />
    </>
  );
}
