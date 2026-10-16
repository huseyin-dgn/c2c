export const developmentAreas = [
  {
    slug: 'goruntu-isleme', kind: 'vision', label: 'GÜVENLİK KAMERASI & GÖRÜNTÜ İŞLEME',
    title: 'Kamera kaydından,\nanlamlı olaya.',
    description: 'Yetkili kamera akışlarını analiz eden; belirlenen kurallara göre olay adaylarını kaydeden, sayım yapan ve operatöre bildirim üreten sistemler geliştiriyoruz.',
    applications: ['Alan ihlali ve yetkisiz giriş', 'Kişi ve araç sayımı', 'Şüpheli hareket için olay adayları', 'Nesne bırakma / kaldırma', 'Kask, baret ve yelek kontrolü', 'Vardiya ve personel akışlarının takibi'],
    constraint: 'Kamera açısı, ışık ve saha koşullarıyla birlikte değerlendirilir. Kritik olaylar insan incelemesine sunulur; biyometrik kimlik tespiti varsayılmaz.',
    input: 'Kamera akışı', output: 'Olay kaydı & bildirim',
  },
  {
    slug: 'ozel-yazilim', kind: 'industrial', label: 'ENDÜSTRİYEL & OPERASYONEL SİSTEMLER',
    title: 'Üretimin içinde,\nölçülebilir kontrol.',
    description: 'Ürün ve parça görüntülerini işleyen, kalite kontrol sonuçlarını kaydeden ve operasyon verisini raporlayan yazılım sistemleri tasarlıyoruz.',
    applications: ['Hatalı ürün ve görsel kusur adayları', 'Parça eksikliği kontrolü', 'Sayım ve sınıflandırma', 'Kalite kontrol otomasyonu', 'Süreç takibi ve raporlama'],
    constraint: 'Ürün çeşitliliği, örnek veri ve kabul kriterleriyle sınanır. Model çıktıları doğrudan kalite garantisi olarak sunulmaz.',
    input: 'Ürün & operasyon verisi', output: 'İnceleme kaydı & rapor',
  },
  {
    slug: 'otomasyon', kind: 'software', label: 'ÖZEL YAZILIM & OTOMASYON',
    title: 'İşinize uyan yazılım.\nBirbirine bağlı sistemler.',
    description: 'Hazır araçların yetmediği iş kuralları için özel uygulamalar, veri işleme servisleri ve mevcut araçlarınız arasında kontrollü entegrasyonlar geliştiriyoruz.',
    applications: ['Şirket içi özel yazılım sistemleri', 'Veri analizi ve raporlama araçları', 'Süreç otomasyonu', 'API ve sistem entegrasyonu', 'Kuruma özel algoritma geliştirme'],
    constraint: 'Veri sahipliği, erişim sınırları ve hata durumları tasarımın başında tanımlanır. Çözüm, mevcut iş akışınıza göre şekillenir.',
    input: 'İş kuralı & veri', output: 'Çalışan uygulama & entegrasyon',
  },
] as const;
