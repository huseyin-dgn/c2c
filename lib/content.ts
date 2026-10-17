
/*
 * C2C Mühendislik
 * Merkezi Türkçe site içerikleri
 */

// KURUCU EKİP

export const team = [
  {
    name: 'İlker Akbal',
    initials: 'İA',
    linkedin:
      'https://www.linkedin.com/in/ilker-akbal-b963ab25a/',
  },
  {
    name: 'Hüseyin Doğan',
    initials: 'HD',
    linkedin:
      'https://www.linkedin.com/in/huseyin-dogan-47136333b/',
  },
];

// ÇÖZÜMLERİMİZ

export const solutions = [
  {
    slug: 'yapay-zeka',
    title: 'Yapay zekâ destekli veri analizi.',
    name: 'Yapay Zekâ ve Makine Öğrenmesi',
    icon: 'brain',
    description:
      'İşletmelerin verilerini analiz ederek tahminleme, anomali tespiti ve karar destek süreçlerine yönelik makine öğrenmesi sistemleri geliştiriyoruz.',
    examples: [
      'Talep ve operasyon tahminleme',
      'Anomali tespiti ve veri analizi',
      'Karar destek ve sınıflandırma sistemleri',
    ],
    approach:
      'Veri yapısını, kalitesini ve iş hedeflerini değerlendirerek uygun algoritmaları belirliyoruz. Modelleri tanımlanmış başarı kriterleri doğrultusunda test ediyor, sonuçları mevcut iş süreçleriyle uyumlu şekilde ele alıyoruz.',
  },
  {
    slug: 'goruntu-isleme',
    title: 'Görsel verilerden operasyonel bilgi.',
    name: 'Görüntü İşleme ve Bilgisayarlı Görü',
    icon: 'scan',
    description:
      'Kamera görüntülerinin analiz edilmesi, nesnelerin tespit edilmesi ve görsel kontrol süreçlerinin otomatikleştirilmesine yönelik yazılım sistemleri geliştiriyoruz.',
    examples: [
      'Endüstriyel görsel kalite kontrol',
      'Nesne tespiti, sayım ve sınıflandırma',
      'Alan ihlali ve olay analizi',
    ],
    approach:
      'Kamera konumu, aydınlatma, görüntü kalitesi ve işlem süresi gereksinimlerini değerlendiriyoruz. Bilgisayarlı görü modellerini çalışma ortamına uygun biçimde tasarlıyor, tespit sonuçlarını ölçülebilir kriterlerle doğruluyoruz.',
  },
  {
    slug: 'siber-guvenlik',
    title: 'Güvenlik odaklı yazılım mimarileri.',
    name: 'Güvenlik Odaklı Yazılım Sistemleri',
    icon: 'shield',
    description:
      'Yazılım sistemlerinde güvenli veri işleme, erişim kontrolü, olay kayıtları ve izlenebilirlik gereksinimlerini dikkate alan çözümler tasarlıyoruz.',
    examples: [
      'Güvenlik olaylarının kayıt ve analizi',
      'Yetkilendirme ve erişim kontrolü',
      'Güvenli API ve servis geliştirme',
    ],
    approach:
      'Sistem bileşenlerini, veri akışlarını ve erişim yetkilerini analiz ediyoruz. Girdi doğrulama, güvenli yapılandırma, hata yönetimi ve kayıt mekanizmalarını yazılım mimarisinin bir parçası olarak değerlendiriyoruz.',
  },
  {
    slug: 'otomasyon',
    title: 'Entegre ve otomatik iş süreçleri.',
    name: 'Otomasyon ve Sistem Entegrasyonu',
    icon: 'workflow',
    description:
      'Tekrarlanan operasyonel işlemleri azaltmaya ve farklı yazılım sistemleri arasında kontrollü veri akışı oluşturmaya yönelik otomasyon çözümleri geliştiriyoruz.',
    examples: [
      'İş akışı ve süreç otomasyonu',
      'API ve kurumsal sistem entegrasyonları',
      'Veri aktarımı ve operasyonel izleme',
    ],
    approach:
      'Mevcut yazılım altyapısını, veri kaynaklarını ve iş kurallarını inceliyoruz. Entegrasyon süreçlerini hata yönetimi, veri tutarlılığı ve izlenebilirlik gereksinimlerine uygun biçimde tasarlıyoruz.',
  },
  {
    slug: 'ozel-yazilim',
    title: 'İhtiyaçlara özel yazılım sistemleri.',
    name: 'Özel Yazılım ve Algoritma Geliştirme',
    icon: 'code',
    description:
      'Standart yazılımların karşılamadığı teknik gereksinimler için işletmeye özel uygulamalar, algoritmalar ve veri işleme sistemleri geliştiriyoruz.',
    examples: [
      'Kuruma özel web ve yönetim uygulamaları',
      'Algoritma ve veri işleme servisleri',
      'Operasyon takip ve raporlama sistemleri',
    ],
    approach:
      'İş gereksinimlerini ve mevcut altyapıyı değerlendirerek yazılım mimarisini oluşturuyoruz. Modüler geliştirme, test edilebilirlik, bakım kolaylığı ve entegrasyon gereksinimlerini proje kapsamına göre ele alıyoruz.',
  },
] as const;

// EKİP ÇALIŞMALARI

export const projects = [
  {
    slug: 'motionfighter',
    title: 'MotionFighter',
    subtitle: 'Hareketten anlamlı olaya.',
    category: 'Bilgisayarlı görü',
    owner: 'Hüseyin Doğan',
    visual: 'vision',
    tags: ['Python', 'YOLO', 'OpenCV', 'PyTorch'],
    description:
      'Hareket analizi, kişi tespiti ve zamansal sınıflandırmayı bir araya getiren çok aşamalı video analiz çalışması.',
    source:
      'https://github.com/huseyin-dgn/MotionFighter-for-YOLO',
    steps: [
      'Hareket analizi',
      'Kişi tespiti & ROI',
      'Pose etkileşim kontrolü',
      '3D CNN sınıflandırma',
    ],
    detail:
      'Depodaki README; hareket tabanlı ön filtreleme, YOLO ile kişi tespiti, etkileşim bölgesi çıkarımı, pose kontrolü ve 3D CNN zamansal sınıflandırma akışını belgeliyor. Mimari, her karede ağır model çalıştırmak yerine ilgili olaylara odaklanmayı hedefliyor.',
    limitation:
      'Açık kaynak bir ekip üyesi çalışmasıdır. Burada bağımsız performans doğrulaması veya müşteri uygulaması iddiası sunulmaz.',
  },
  {
    slug: 'hyso',
    title: 'Hyso',
    subtitle: 'Modüler öğrenme mimarisi.',
    category: 'Derin öğrenme',
    owner: 'Hüseyin Doğan',
    visual: 'network',
    tags: ['Python', 'PyTorch', 'CNN', 'CBAM'],
    description:
      'CNN, bottleneck residual ve dikkat bloklarıyla görüntü sınıflandırma deneyleri için geliştirilen kütüphane.',
    source: 'https://github.com/huseyin-dgn/hyso',
    steps: [
      'Veri hazırlama',
      'CNN & residual bloklar',
      'CBAM dikkat',
      'Eğitim & değerlendirme',
    ],
    detail:
      'README; CNN ve bottleneck residual blokları, CBAM dikkat yapısı, veri artırma, fit arayüzü ve eğitim callback desteğini açıklıyor. Erken durdurma, model kontrol noktası ve öğrenme oranı zamanlayıcısı belgelenmiş özellikler arasında.',
    limitation:
      'Araştırma ve geliştirme çalışmasıdır. Bağımsız bir ticari ürün veya tamamlanmış müşteri projesi olarak sunulmaz.',
  },
  {
    slug: 'co2-emission',
    title: 'CO₂ Emission',
    subtitle: 'Veriyle kurulan öngörü.',
    category: 'Makine öğrenmesi',
    owner: 'İlker Akbal',
    visual: 'chart',
    tags: ['Python', 'scikit-learn', 'pandas'],
    description:
      'Motor ve yakıt tüketimi verileriyle doğrusal ve polinomsal regresyon modellerini karşılaştıran tahmin çalışması.',
    source:
      'https://github.com/ilker-Akbal/CO2_Emission',
    steps: [
      'Veri ön işleme',
      'Keşifsel analiz',
      'Regresyon modelleri',
      'Model karşılaştırma',
    ],
    detail:
      'Depodaki README; araç motor özellikleri ve yakıt tüketimi verileriyle CO₂ emisyonu tahminini açıklıyor. Veri hazırlama, keşifsel analiz, polinom derecesi seçimi ve doğrusal/polinomsal regresyon karşılaştırması çalışma akışını oluşturuyor.',
    limitation:
      'Eğitim ve deney amaçlı açık kaynak çalışmasıdır. Sonuçlar saha başarısı, ticari referans veya garanti olarak sunulmaz.',
  },
] as const;

// NASIL ÇALIŞIYORUZ?

export const processSteps = [
  {
    title: 'İhtiyaç analizi',
    label: 'Gereksinimleri belirliyoruz.',
    description:
      'Projenin hedeflerini, mevcut iş akışlarını ve teknik altyapısını değerlendiriyoruz. Kapsamı, kısıtları ve kabul kriterlerini netleştiriyoruz.',
    output:
      'Gereksinimler · Proje kapsamı · Kabul kriterleri',
  },
  {
    title: 'Çözüm tasarımı',
    label: 'Teknik mimariyi oluşturuyoruz.',
    description:
      'Sistem mimarisini, veri akışlarını ve teknoloji seçeneklerini değerlendiriyoruz. Uygulanabilirliği ve olası teknik riskleri tasarım aşamasında ele alıyoruz.',
    output:
      'Sistem mimarisi · Fizibilite · Teknik plan',
  },
  {
    title: 'Geliştirme ve test',
    label: 'Geliştiriyor ve doğruluyoruz.',
    description:
      'Yazılım bileşenlerini belirlenen gereksinimlere göre geliştiriyoruz. İşlevsellik, doğruluk ve performansı uygun test senaryolarıyla değerlendiriyoruz.',
    output:
      'Yazılım bileşenleri · Test sonuçları · Teknik belgeler',
  },
  {
    title: 'Entegrasyon',
    label: 'Mevcut sistemlere uyarlıyoruz.',
    description:
      'Geliştirilen çözümün mevcut altyapıyla uyumunu değerlendiriyoruz. Veri akışlarını, hata senaryolarını ve sistemin kullanım koşullarını kontrol ediyoruz.',
    output:
      'Sistem entegrasyonu · Kontroller · Kullanım belgeleri',
  },
];

// SEKTÖREL KULLANIM SENARYOLARI

export const useCases = [
  {
    sector: 'ÜRETİM & KALİTE',
    title: 'Görsel kalite kontrol.',
    description:
      'Üretim hattındaki görsel kusur adaylarının belirlenmesi ve operatör incelemesi için işaretlenmesi.',
    input: 'Kamera görüntüsü',
    output: 'Kusur adayı & inceleme kaydı',
    slug: 'goruntu-isleme',
  },
  {
    sector: 'GÜVENLİK & İZLEME',
    title: 'Kamera tabanlı olay analizi.',
    description:
      'Tanımlanmış alanlardaki ihlal adaylarının analiz edilmesi ve ilgili olayların bildirim için önceliklendirilmesi.',
    input: 'Yetkili kamera akışı',
    output: 'Olay kaydı & bildirim',
    slug: 'goruntu-isleme',
  },
  {
    sector: 'OPERASYON & OTOMASYON',
    title: 'İş süreçlerinin otomasyonu.',
    description:
      'Farklı yazılım sistemleri arasında veri aktarımı ve tekrarlanan operasyonel kontrollerin otomatikleştirilmesi.',
    input: 'API & operasyon verisi',
    output: 'Bağlantılı iş akışı',
    slug: 'otomasyon',
  },
];
