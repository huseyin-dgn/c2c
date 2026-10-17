# Ürünlerimiz — örnek çözüm kataloğu

## Kapsam

Katalog yalnızca `/urunlerimiz` adresine eklenmiştir. `/projeler` (Neler Geliştiriyoruz?) sayfasının kaynağı, bağlı bileşenleri ve tasarımı değiştirilmemiştir. İki bağımsız route ve üst menüde iki ayrı bağlantı bulunur. Paylaşılan mevcut dosyalardan yalnızca `components/SiteHeader.tsx` değişmiştir: yeni bağlantı ve dar masaüstü genişliklerinde bağlantıların sığmasını sağlayan küçük bir CSS modülü eklenmiştir.

Ana sayfa, Hero/işlemci/anakart, PC donanım keşfi, fabrika güvenlik senaryosu, endüstriyel kalite simülasyonu, diğer içerikler, iletişim formu ve backend byte bazında başlangıç durumundadır. Başlangıç manifesti `C:/Users/hdgn5/AppData/Local/Temp/c2c-products-before-vp31f1gk/` altında; karşılaştırma sonucu `artifacts/products/protection-report.json` içindedir. Mevcut commit edilmemiş değişiklikler silinmemiştir. Git geçmişi değiştirilmemiştir.

## Bilgi yapısı

Merkezi veri `lib/product-concepts.ts` içindedir. Dört kategorinin her biri iki konsept içerir:

1. Akıllı Güvenlik ve Görüntü Analizi: Yasak Alan ve Bölge İhlali Tespiti; Baret ve Koruyucu Ekipman Kontrolü.
2. Endüstriyel Görüntü İşleme: Hatalı Ürün ve Parça Tespiti; Ürün Sayımı ve Sınıflandırma.
3. Akıllı Operasyon ve Otomasyon: Forklift ve Yaya Risk Analizi; Makine Çalışma ve Duruş Takibi.
4. Özel Yazılım ve Entegrasyon: Üretim, Kalite ve Operasyon Yönetim Platformu; ERP / PLC / API Entegrasyonları.

Kategoriler bölüm bağlantılarıyla erişilir. Sekiz kartın tamamı sayfada görünür; filtre veya kaydırma bandı arkasında saklanmaz. Masaüstünde kategori başına iki sütun, mobilde tek sütun kullanılır. Her kartta görsel, kategori, başlık, özet ve Detayı İncele düğmesi vardır; kart yüzeyi de bu düğmeye bağlı olarak açılır. Fotoğraf büyümesi ve ok hareketi ölçülüdür.

Girişte Örnek çözüm konseptleri ifadesi ve tamamlanmış referans/satışa hazır ürün olmadığı açıklaması vardır. Her detayda aynı kapsam notu tekrarlanır. Örnekler kesin performans veya sahada uygulanmış sistem iddiası içermez.

## Detay penceresi

`ProductDetailModal.tsx`, yerel HTML `dialog.showModal()` kullanır. Üst katman sayesinde arka sayfa etkileşime kapanır; ESC, panel dışına tıklama veya 44 px kapatma düğmesiyle kapanır. Arka sayfanın kaydırması kilitlenir ve kapanınca önceki stile döner. Odak açan karta geri verilir. Uzun içerik panel içinde kayar; kapatma satırı her zaman görünür kalır. Reduced-motion altında açılış animasyonu ve kart hareketi devre dışıdır.

Her detay başlık, kısa özet, çözülen problem, üç adımlı olası işleyiş, kullanım alanları, beklenen çıktılar, altyapı/entegrasyon ihtiyaçları ve örnek senaryo notu içerir. Bu ihtiyacı konuşalım bağlantısı mevcut iletişim sayfasını uygun `alan` parametresiyle açar; forma veya backend'e değişiklik yapılmaz.

Sayfa sonundaki Sizin de bir proje fikriniz mi var? alanı sekiz konsept dışındaki ihtiyaçları da açıkça davet eder. Bizimle iletişime geçin bağlantısı `/iletisim` adresine gider.

## Görsel kaynağı

Sekiz görsel özgün, AI ile üretilmiş, fotoğraf gerçekçiliğinde temsili sahnelerdir. Bunlar gerçek müşteri kurulumu veya çalışan ürün fotoğrafı değildir. Görseller bu katalog için `imagegen` becerisiyle üretilmiştir; alan güvenliği görselinde önceki görevde aynı beceriyle oluşturulan özgün fabrika karesi yeniden kullanılmıştır. Dış stok sitesi veya runtime CDN bağımlılığı yoktur.

WebP dosyaları `public/images/products/` altındadır. Next Image responsive boyutlar ve lazy loading kullanır. Orijinaller `C:/Users/hdgn5/.codex/generated_images/01a1460d-4396-7723-bc70-aa10d4ec49bd/` dizinindedir:

- intrusion.webp: exec-a1064c25-86d1-49b5-ab1c-14f8e415734a.png
- ppe.webp: exec-f41d8dd2-7fa8-4742-bda4-379177d4a294.png
- quality.webp: exec-87da9d12-b246-48f7-ab25-1b8e8fadbefc.png
- counting.webp: exec-977680c6-042c-48f7-acd2-7c84815eb479.png
- forklift.webp: exec-0a50a4c9-3f88-4484-8315-53cd1fad71ff.png
- machine.webp: exec-e348059a-fc17-4580-9dd8-95081a831fed.png
- platform.webp: exec-e358b33a-1987-44a4-8e14-fbe2d54b5dce.png
- integration.webp: exec-796fa14e-5aac-48e7-af85-579f6925a89d.png

## Dosyalar

Değişen mevcut dosya:

- components/SiteHeader.tsx

Eklenen kaynaklar:

- app/urunlerimiz/page.tsx
- components/ProductCatalog.tsx
- components/ProductDetailModal.tsx
- components/ProductCatalog.module.css
- components/SiteHeaderProducts.module.css
- lib/product-concepts.ts
- public/images/products/ altında sekiz WebP görseli
- scripts/products-qa.mjs
- docs/product-catalog.md

Tarayıcı raporu, ekran görüntüleri ve kapsam koruma raporu `artifacts/products/` altındadır.

## Doğrulama sonucu

- `npm run typecheck`, `npm run lint`, `npm test` (26/26) ve `npm run build`: geçti.
- `scripts/products-qa.mjs`: geliştirme ve production sunucuda geçti. Üretim raporu `artifacts/products/production/report.json`.
- 1440, 1024, 768, 393 ve 320 px genişlikte kategori başına iki konsept, toplam sekiz kart ve bütün görseller doğrulandı. 40 detay açılışı; her birinin içerik alanları, ESC/dışarı tıklama/kapatma, odak dönüşü, arka planın inert olması, kaydırma kilidinin geri alınması, panel içi taşma ve CTA kontrol edildi.
- Üst menü dar masaüstünde iletişim bağlantısıyla çakışmıyor; mobil menü iki ayrı sayfa bağlantısını gösteriyor. `/projeler` eski başlığı ve içeriğiyle açılıyor; yeni katalog yalnızca `/urunlerimiz` altında.
- Reduced-motion açılış animasyonunu kapatıyor. Sayfa ve detaylarda yatay taşma yok; çalışma zamanı hatası alınmadı.
- Ekran görüntüleri gerçek tarayıcıdan alınıp incelendi. Tam sayfa çekiminde ekran dışındaki lazy görsellerin de boyanması için yalnızca test sırasında eager decode yapılır; ürün kodundaki lazy loading korunur.
- Görsel galeri: `artifacts/products/index.html`. Üretim sürümü, masaüstü ve mobil detay görüntüleri dahil edilmiştir.

Bilinen sınırlar: Görseller işlevsel kamera çıktısı veya mevcut müşteri sahası değildir. Yazılım ekranı temsili bir görseldir; çalışan platform arayüzü iddiası taşımaz. Uygulanabilirlik, veri ve saha koşullarıyla ayrıca değerlendirilir. Yeni sayfa mevcut iletişim formuna bağlanır; formun mevcut gönderim yapılandırması bu görevde değiştirilmemiştir.
