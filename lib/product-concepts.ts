export type ProductConcept = {
  id: string; code: string; category: string; title: string; summary: string;
  image: string; imageAlt: string; imagePosition?: string;
  problem: string; approach: string[]; uses: string[]; outputs: string[];
  infrastructure: string; area: 'goruntu-isleme' | 'otomasyon' | 'ozel-yazilim';
};
export const conceptCategories = [
  { id: 'guvenlik', number: '01', title: 'Akıllı Güvenlik ve Görüntü Analizi', short: 'Güvenlik ve analiz', description: 'Görüntüdeki hareketi, tanımlı alan ve güvenlik kurallarıyla birlikte değerlendiren senaryolar.' },
  { id: 'kalite', number: '02', title: 'Endüstriyel Görüntü İşleme', short: 'Görüntü işleme', description: 'Üretim hattındaki parçaları incelemeye, saymaya ve kalite kayıtlarıyla ilişkilendirmeye yönelik kurgular.' },
  { id: 'operasyon', number: '03', title: 'Akıllı Operasyon ve Otomasyon', short: 'Operasyon ve otomasyon', description: 'Sahadaki hareket ve makine durumlarını, operasyonel kararlar için izlenebilir bilgiye dönüştüren yaklaşımlar.' },
  { id: 'yazilim', number: '04', title: 'Özel Yazılım ve Entegrasyon', short: 'Yazılım ve entegrasyon', description: 'İş kurallarını, saha verisini ve mevcut sistemleri bir araya getirmek için tasarlanabilecek yazılım çözümleri.' },
] as const;
export const productConcepts: ProductConcept[] = [
  {
    id: 'bolge-ihlali', code: '01', category: 'guvenlik', title: 'Yasak Alan ve Bölge İhlali Tespiti',
    summary: 'Tanımlanmış riskli veya yetkisiz alanlara girişleri görüntü üzerinden izlemeye ve olay bildirimi oluşturmaya yönelik çözüm.',
    image: '/images/products/intrusion.webp', imageAlt: 'Üretim alanına bakan, kolona monte edilmiş fiziksel güvenlik kamerası ve kontrollü makine çevresi.', imagePosition: '44% center',
    problem: 'Geniş kamera arşivlerinde kontrollü alanlara girişlerin fark edilmesi ve ilgili görüntüye zamanında ulaşılması güç olabilir.',
    approach: ['Yetkili kamera görüntüsünde izlenecek alan, giriş yönü ve zaman koşulları tanımlanabilir.', 'Kişinin konumu ve hareketi, alan sınırıyla karşılaştırılabilir. Yalnızca tanımlı koşul oluştuğunda olay adayı üretilebilir.', 'Olay, operatör incelemesine sunulabilir; bildirim ve kayıt mevcut izleme sistemine aktarılabilir.'],
    uses: ['Üretim tesisleri', 'Makine çevreleri', 'Depo erişim alanları', 'Teknik servis bölgeleri'],
    outputs: ['Alan ve zaman bilgisiyle olay kaydı', 'İlgili görüntüye erişim', 'Operatör bildirimi', 'Alan bazında olay özeti'],
    infrastructure: 'Uygun açı ve ışıkta konumlandırılmış kamera, yetkili görüntü erişimi ve işlem kaynağı gerekir. Bölge geometrisi, saklama süreleri, erişim yetkileri ve bildirim arayüzleri birlikte tanımlanır.', area: 'goruntu-isleme',
  },
  {
    id: 'koruyucu-ekipman', code: '02', category: 'guvenlik', title: 'Baret ve Koruyucu Ekipman Kontrolü',
    summary: 'Baret, yelek ve benzeri zorunlu ekipmanların görünür kullanım durumunu değerlendirmeye yardımcı olabilecek görüntü analizi.',
    image: '/images/products/ppe.webp', imageAlt: 'Baret, koruyucu gözlük ve yelek kullanan bir teknisyen, CNC üretim hücresinin yanında.', imagePosition: '50% 35%',
    problem: 'Farklı alanlardaki koruyucu ekipman kontrollerinin sürekli ve tutarlı biçimde izlenmesi, yoğun operasyonlarda zorlaşabilir.',
    approach: ['Kontrol edilecek ekipman türleri ve bölgeye göre geçerli kurallar belirlenebilir.', 'Görüntüde görülebilen ekipmanlar kişiyle ilişkilendirilerek değerlendirilebilir; örtüşen veya belirsiz görüntüler ayrı tutulabilir.', 'Eksiklik adayları, otomatik kesin hüküm yerine yetkili kişinin inceleyebileceği kayıtlar olarak sunulabilir.'],
    uses: ['Fabrika girişleri', 'Üretim koridorları', 'Bakım alanları', 'Yükleme bölgeleri'],
    outputs: ['Ekipman eksikliği adayı', 'Bölge ve zaman bazlı inceleme kaydı', 'Operatör bildirim kuyruğu', 'Toplu kontrol özeti'],
    infrastructure: 'Ekipmanı yeterli ölçekte gösteren kamera açıları, temsil edici saha görüntüleri ve tanımlı kontrol kuralları gerekir. Işık, örtüşme ve görüş açısı için pilot değerlendirme yapılır; erişim ve kayıt koşulları belirlenir.', area: 'goruntu-isleme',
  },
  {
    id: 'hatali-parca', code: '03', category: 'kalite', title: 'Hatalı Ürün ve Parça Tespiti',
    summary: 'Çizik, eksik delik, yüzey kusuru veya montaj sapması gibi kalite problemlerini belirlemeye yardımcı olabilecek kontrol yapısı.',
    image: '/images/products/quality.webp', imageAlt: 'Endüstriyel kamera ve halka ışık altında, yüzeyinde ince bir çizik bulunan işlenmiş metal flanş.',
    problem: 'Kısa çevrim sürelerinde küçük yüzey veya geometri farklarının tutarlı biçimde kontrol edilmesi ve doğru parçayla eşleştirilmesi zor olabilir.',
    approach: ['Kusur sınıfları, ölçülebilir kabul koşulları ve görüntü alma düzeni örnek parçalarla tanımlanabilir.', 'Tetiklenen görüntüde yüzey, eksik özellik veya montaj konumu incelenebilir; karar ürün kimliğiyle eşleştirilebilir.', 'Sonuç operatöre sunulabilir veya doğrulanmış zamanlama ve uygun arayüzlerle bir ayırma sistemine aktarılabilir.'],
    uses: ['Metal işleme', 'Montaj hatları', 'Plastik parça üretimi', 'Son kalite kontrol'],
    outputs: ['Uygun / inceleme gerekli kararı', 'Kusur türü ve konum kaydı', 'Parçayla eşleşen kalite geçmişi', 'Entegrasyona uygun kontrol sonucu'],
    infrastructure: 'Kararlı ürün konumlandırma, uygun lens ve kontrollü aydınlatma önemlidir. Hat hızı, tetik sensörü, toleranslar ve PLC/ayırıcı arayüzü değerlendirilir. Sonuçlar gerçek kusur örnekleriyle doğrulanır.', area: 'goruntu-isleme',
  },
  {
    id: 'sayim-siniflandirma', code: '04', category: 'kalite', title: 'Ürün Sayımı ve Sınıflandırma',
    summary: 'Hattan geçen ürünleri saymaya, tanımlı ürün sınıflarını ayırmaya ve sonuçları kayıt altına almaya yönelik çözüm.',
    image: '/images/products/counting.webp', imageAlt: 'Bir kamera kontrol kemerinden aralıklı geçen yuvarlak flanşlar ve dikdörtgen metal gövdeler.',
    problem: 'Manuel sayım, ürün çeşitliliği ve vardiya değişimleri; üretim miktarlarının izlenmesini ve kayıtlarla karşılaştırılmasını güçleştirebilir.',
    approach: ['Sayım çizgisi, ürün yönü ve sınıflar üretim akışına göre belirlenebilir.', 'Ürünler takip edilerek tanımlı eşiği geçtiklerinde bir kez sayılabilir; görüntü özelliklerine göre sınıflandırılabilir.', 'Zaman ve sınıf bazında sonuçlar raporlanabilir, üretim emri veya parti kaydıyla eşleştirilebilir.'],
    uses: ['Paketleme hatları', 'Parça besleme', 'Sevkiyat öncesi kontrol', 'Karma ürün akışları'],
    outputs: ['Ürün ve sınıf bazında adet', 'Parti / vardiya özeti', 'Sayım tutarsızlığı bildirimi', 'Kurumsal sisteme aktarılabilir kayıt'],
    infrastructure: 'Ürünlerin ayırt edilebildiği kamera yerleşimi ve yeterli görüntü sıklığı gerekir. Üst üste binme, geri hareket, ürün aralığı ve hat hızı örnek akışlarla test edilir. Mevcut parti/iş emri verisiyle bağlantı planlanabilir.', area: 'goruntu-isleme',
  },
  {
    id: 'forklift-yaya', code: '05', category: 'operasyon', title: 'Forklift ve Yaya Risk Analizi',
    summary: 'Depo ve üretim alanlarında araç-yaya yakınlıklarını izleyerek potansiyel riskli karşılaşmaları değerlendirmeye yönelik senaryo.',
    image: '/images/products/forklift.webp', imageAlt: 'İşaretli araç yolundaki forklift ile bariyerle ayrılan yaya geçidi ve baretli çalışan.',
    problem: 'Yoğun depo trafiğinde tekrarlanan yakınlaşmalar ve kritik geçiş noktaları, yalnızca anlık gözlemle görünür olmayabilir.',
    approach: ['Araç ve yaya güzergâhları, geçiş bölgeleri ve değerlendirme koşulları tanımlanabilir.', 'Takip edilen konumlar, kalibre edilmiş sahne ve zaman bilgisiyle karşılaştırılarak yakınlık olayları değerlendirilebilir.', 'Olay adayları inceleme için kaydedilebilir; yoğunlaşan bölgeler ve zaman aralıkları raporlanabilir.'],
    uses: ['Depo koridorları', 'Yükleme sahaları', 'Üretim lojistiği', 'Araç-yaya kesişimleri'],
    outputs: ['Yakınlık olayı adayı', 'Konum ve zaman bazlı risk özeti', 'İncelenebilir olay görüntüsü', 'Operasyonel iyileştirme için veri'],
    infrastructure: 'Kapsayıcı kamera görüşü, örtüşme analizi ve mesafe yorumları için sahne kalibrasyonu gerekir. Araç tipleri ve saha akışı pilotta değerlendirilir. Çözüm operasyonel karar desteği olarak tasarlanır; fiziksel güvenlik düzeninin yerine konumlandırılmaz.', area: 'goruntu-isleme',
  },
  {
    id: 'makine-durus', code: '06', category: 'operasyon', title: 'Makine Çalışma ve Duruş Takibi',
    summary: 'Makine durumlarını, çalışma aralıklarını ve duruş sürelerini izlenebilir operasyon kayıtlarına dönüştürebilecek takip çözümü.',
    image: '/images/products/machine.webp', imageAlt: 'Durum ışığı ve kontrol konsolu görünen, metal gövdeli CNC üretim makineleri.',
    problem: 'Duruşların başlangıcı, süresi ve nedeni farklı kayıtlarda tutulduğunda üretim kayıplarını tutarlı biçimde değerlendirmek zorlaşabilir.',
    approach: ['Makineye uygun PLC, sensör veya yetkili veri arayüzlerinden durum bilgisi alınabilir.', 'Çalışma ve duruş geçişleri zaman damgasıyla kaydedilebilir; duruş nedeni operatör girdisiyle ilişkilendirilebilir.', 'Makine ve vardiya bazındaki süreler karşılaştırılabilir; tanımlı koşullara göre bildirim oluşturulabilir.'],
    uses: ['CNC atölyeleri', 'Montaj istasyonları', 'Paketleme makineleri', 'Çok makineli üretim alanları'],
    outputs: ['Çalışma / duruş zaman çizelgesi', 'Vardiya bazında süre özeti', 'Sınıflandırılmış duruş kayıtları', 'Uzayan duruş bildirimi'],
    infrastructure: 'Makinenin sunduğu veri erişimi, sinyal anlamları ve zaman eşlemesi incelenir. Gerekirse durum lambası gözlemi veya ek sensör değerlendirilebilir. Planlı/plansız duruş ayrımı ve neden kodları işletmeyle birlikte tanımlanır.', area: 'otomasyon',
  },
  {
    id: 'yonetim-platformu', code: '07', category: 'yazilim', title: 'Üretim, Kalite ve Operasyon Yönetim Platformu',
    summary: 'Üretim verisini, kalite kayıtlarını ve operasyonel iş akışlarını tek noktadan izlemek için tasarlanabilecek özel yazılım platformu.',
    image: '/images/products/platform.webp', imageAlt: 'Üretim sahasının yanındaki çalışma masasında operasyon kayıtlarını gösteren temsili yazılım ekranı.',
    problem: 'Excel dosyaları, saha notları ve farklı uygulamalara dağılan bilgiler; süreç takibini, sorumluluk paylaşımını ve raporlamayı zorlaştırabilir.',
    approach: ['İş kuralları, kullanıcı rolleri ve ortak veri tanımları mevcut süreçlerle birlikte çıkarılabilir.', 'Üretim emri, kalite kontrolü ve aksiyon takibi için ihtiyaca uygun ekranlar ve onay akışları geliştirilebilir.', 'Yetkili kullanıcılar kayıtları izleyebilir, raporlayabilir; uygun arayüzlerle mevcut yazılımlara veri aktarabilir.'],
    uses: ['Üretim yönetimi', 'Kalite ekipleri', 'Operasyon koordinasyonu', 'Çok lokasyonlu işletmeler'],
    outputs: ['Ortak operasyon görünümü', 'İzlenebilir kalite ve aksiyon kaydı', 'Rol bazında erişim', 'İhtiyaca özel raporlar'],
    infrastructure: 'Mevcut veri kaynakları, kullanıcı yapısı, barındırma, yedekleme ve erişim gereksinimleri belirlenir. ERP, saha sistemleri ve raporlama araçlarının erişilebilir arayüzlerine göre entegrasyon kapsamı çıkarılır.', area: 'ozel-yazilim',
  },
  {
    id: 'erp-plc-api', code: '08', category: 'yazilim', title: 'ERP / PLC / API Entegrasyonları',
    summary: 'Makine, saha sistemi ve kurumsal yazılımlar arasında kontrollü, izlenebilir veri akışı kurmaya yönelik özel entegrasyon çözümleri.',
    image: '/images/products/integration.webp', imageAlt: 'Düzenli kablolanmış PLC, endüstriyel ağ anahtarı ve edge bilgisayar içeren otomasyon panosu.',
    problem: 'Birbirinden kopuk sistemler arasında elle veri taşıma; gecikmeye, tutarsız kayıtlara ve tekrar eden işlemlere neden olabilir.',
    approach: ['Kaynak ve hedef sistemlerin arayüzleri, veri sahipliği ve yetkileri incelenebilir.', 'Alan eşlemeleri, veri doğrulama, kuyruklama ve tekrar deneme kurallarıyla bağlantı servisleri tasarlanabilir.', 'Aktarımlar kayıt altına alınabilir; bağlantı kesintileri ve uyumsuz veriler için takip ve bildirim akışları oluşturulabilir.'],
    uses: ['ERP bağlantıları', 'PLC veri toplama', 'Kalite sistemi entegrasyonu', 'API ve raporlama servisleri'],
    outputs: ['Eşlenmiş ve doğrulanmış veri akışı', 'Aktarım ve hata kayıtları', 'Kesinti sonrası tekrar işleme', 'Belgelenmiş sistem arayüzleri'],
    infrastructure: 'Sürüm ve protokol desteği, yetkili ağ erişimi, API/PLC arayüz belgeleri ve test ortamı gerekir. Yazma veya komut iletme ihtiyacı varsa kapsamı, yetkileri ve doğrulaması veri okuma akışından ayrıca tasarlanır.', area: 'otomasyon',
  },
];
export const conceptDisclosure = 'Bu içerik örnek çözüm senaryosudur; tamamlanmış müşteri referansı değildir.';
