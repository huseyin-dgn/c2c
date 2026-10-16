// Turkish content is isolated here so a future locale can use the same components.
export const team = [
  {
    name: 'İlker Akbal',
    initials: 'İA',
    github: 'https://github.com/ilker-Akbal',
  },
  {
    name: 'Hüseyin Doğan',
    initials: 'HD',
    github: 'https://github.com/huseyin-dgn',
  },
];
export const solutions = [
  {
    slug: 'yapay-zeka',
    title: 'Veriden karara.',
    name: 'Yapay zekâ & makine öğrenmesi',
    icon: 'brain',
    description: 'Verinizi anlamlı öngörülere dönüştüren, ihtiyacınıza göre tasarlanan modeller.',
    examples: ['Talep ve süreç tahminleme', 'Anomali analizi', 'Karar destek sistemleri'],
    approach:
      'Veri kalitesini ve problemin ölçülebilirliğini inceleriz. Basit bir referans modelle başlayıp uygun öğrenme yaklaşımını karşılaştırmalı deneylerle belirleriz.',
  },
  {
    slug: 'goruntu-isleme',
    title: 'Görüntüden içgörüye.',
    name: 'Görüntü işleme & bilgisayarlı görü',
    icon: 'scan',
    description:
      'Kamera akışlarını ve görsel verileri, işlem yapılabilir bilgiye dönüştüren sistemler.',
    examples: ['Görsel kalite kontrol', 'Nesne tanıma ve sayım', 'Alan ihlali analizi'],
    approach:
      'Kamera konumu, ışık, veri çeşitliliği ve gecikme sınırlarını birlikte değerlendiririz. Model çıktısını gerçek operasyon koşullarında test edilebilir bir akışa yerleştiririz.',
  },
  {
    slug: 'siber-guvenlik',
    title: 'Güven, tasarımla başlar.',
    name: 'Güvenlik odaklı yazılım sistemleri',
    icon: 'shield',
    description:
      'Güvenliği geliştirme sürecinin bir parçası yapan, izlenebilir yazılım yaklaşımları.',
    examples: ['Güvenlik loglarının analizi', 'Olay sınıflandırma', 'Güvenli servis tasarımı'],
    approach:
      'Veri akışlarını ve erişim sınırlarını tanımlarız. En az yetki, girdi doğrulama ve güvenli varsayılanlar ilkelerini çözüm mimarisine dahil ederiz.',
  },
  {
    slug: 'otomasyon',
    title: 'Sistemler birlikte çalışsın.',
    name: 'Otomasyon & sistem entegrasyonu',
    icon: 'workflow',
    description:
      'Tekrarlanan işleri azaltan, mevcut araçlarınız arasında veri akışını sağlayan bağlantılar.',
    examples: [
      'İş akışı otomasyonu',
      'API ve sistem bağlantıları',
      'Mevcut sisteme AI entegrasyonu',
    ],
    approach:
      'Mevcut sistemlerin arayüzlerini, hata durumlarını ve veri sahipliğini inceleriz. Tekrar denenebilir, izlenebilir ve kontrollü entegrasyon akışları tasarlarız.',
  },
  {
    slug: 'ozel-yazilim',
    title: 'Probleminize özel kod.',
    name: 'Özel yazılım & algoritma geliştirme',
    icon: 'code',
    description: 'Hazır araçların yetmediği noktada, işinizin mantığına göre geliştirilen yazılım.',
    examples: ['Özel algoritmalar', 'Operasyon araçları', 'Veri işleme servisleri'],
    approach:
      'İş kurallarını ve kabul kriterlerini açık hale getiririz. Modüler bileşenler, anlamlı testler ve belgelenmiş arayüzlerle sürdürülebilir bir temel kurarız.',
  },
] as const;
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
    source: 'https://github.com/huseyin-dgn/MotionFighter-for-YOLO',
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
    steps: ['Veri hazırlama', 'CNN & residual bloklar', 'CBAM dikkat', 'Eğitim & değerlendirme'],
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
    source: 'https://github.com/ilker-Akbal/CO2_Emission',
    steps: ['Veri ön işleme', 'Keşifsel analiz', 'Regresyon modelleri', 'Model karşılaştırma'],
    detail:
      'Depodaki README; araç motor özellikleri ve yakıt tüketimi verileriyle CO₂ emisyonu tahminini açıklıyor. Veri hazırlama, keşifsel analiz, polinom derecesi seçimi ve doğrusal/polinomsal regresyon karşılaştırması çalışma akışını oluşturuyor.',
    limitation:
      'Eğitim ve deney amaçlı açık kaynak çalışmasıdır. Sonuçlar saha başarısı, ticari referans veya garanti olarak sunulmaz.',
  },
] as const;
export const processSteps = [
  {
    title: 'İhtiyaç analizi',
    label: 'Doğru soruyla başlarız.',
    description:
      'İş hedefinizi, teknik probleminizi ve mevcut altyapınızı anlarız. Varsayımları ve kısıtları birlikte görünür hale getiririz.',
    output: 'Problem tanımı · Kapsam · Kabul kriterleri',
  },
  {
    title: 'Çözüm tasarımı',
    label: 'Önce sistemi kurarız.',
    description:
      'Veri akışlarını, mimariyi ve teknoloji seçeneklerini değerlendiririz. Riskli varsayımları küçük prototiplerle sınarız.',
    output: 'Mimari tasarım · Fizibilite · Teknik yol haritası',
  },
  {
    title: 'Geliştirme ve test',
    label: 'Ölçer, geliştirir, doğrularız.',
    description:
      'Çözümü modüler adımlarla geliştiririz. Algoritmaları ve entegrasyonları belirlenen kabul kriterlerine göre test ederiz.',
    output: 'Çalışan bileşenler · Test çıktıları · Teknik belgeler',
  },
  {
    title: 'Entegrasyon',
    label: 'Gerçek sisteme bağlarız.',
    description:
      'Çözümü mevcut iş akışınıza kontrollü biçimde entegre ederiz. Hata senaryolarını, izlemeyi ve devri birlikte planlarız.',
    output: 'Entegrasyon · İzleme planı · Kullanım belgeleri',
  },
];
export const useCases = [
  {
    sector: 'ÜRETİM & KALİTE',
    title: 'Her ürün, aynı dikkatle.',
    description:
      'Üretim hattındaki görsel kusurları belirlemek ve operatöre inceleme için işaretlemek.',
    input: 'Kamera görüntüsü',
    output: 'Kusur adayı & inceleme kaydı',
    slug: 'goruntu-isleme',
  },
  {
    sector: 'GÜVENLİK & İZLEME',
    title: 'Görüntünün ötesini görün.',
    description:
      'Tanımlanmış bölgelerdeki ihlalleri analiz ederek ilgili olayları önceliklendirmek.',
    input: 'Yetkili kamera akışı',
    output: 'Olay kaydı & bildirim',
    slug: 'goruntu-isleme',
  },
  {
    sector: 'OPERASYON & OTOMASYON',
    title: 'Tekrarlanan işe akıllı akış.',
    description:
      'Birbirinden kopuk araçlar arasında veri aktarımını ve rutin kontrolleri otomatikleştirmek.',
    input: 'API & operasyon verisi',
    output: 'Bağlantılı iş akışı',
    slug: 'otomasyon',
  },
];
