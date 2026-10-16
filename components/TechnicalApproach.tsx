import SectionHeading from './SectionHeading';
const principles = [
  {
    title: 'Modüler mimari',
    description: 'Bağımsız geliştirilebilen, test edilebilen ve değiştirilebilen bileşenler.',
  },
  {
    title: 'Doğru algoritma',
    description: 'Problemin yapısına ve veri koşullarına göre seçilen, ölçülebilir yaklaşımlar.',
  },
  {
    title: 'Tasarımda güvenlik',
    description: 'Girdi doğrulama, erişim sınırları ve güvenli varsayılanlar.',
  },
  {
    title: 'Ölçülen performans',
    description: 'Gecikme, kaynak kullanımı ve doğruluk arasında ihtiyaca uygun denge.',
  },
  {
    title: 'Entegrasyon odağı',
    description: 'Mevcut sistemleri ve hata senaryolarını gözeten arayüzler.',
  },
  {
    title: 'Sürdürülebilir kod',
    description: 'Anlaşılır yapı, sürüm kontrolü, anlamlı testler ve teknik belgeler.',
  },
];
export default function TechnicalApproach() {
  return (
    <section className="technical section">
      <div className="container">
        <SectionHeading
          label="TEKNİK YAKLAŞIMIMIZ"
          title="Görünenin arkasında,"
          accent="sağlam bir sistem."
          description="Mimari, güvenlik ve performansı geliştirme sürecinin başından itibaren birlikte ele alırız."
        />
        <ul className="principles-list">
          {principles.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
