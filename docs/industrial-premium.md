# İki endüstriyel deneyimin tasarım ve doğrulama notları

## Alan güvenliği — ProblemStory

Mevcut başlık, beş aşama, masaüstü scroll/pin, geri scroll ve erişilebilir adım kontrolleri korunur. Anlatım; görüntü edinimi, kişi/konum, olay koşulu, iş kuralı ve bildirim/kayıt olarak ilerler. Pin mesafesi 1,8 ekran yüksekliğinden 1,45'e iner. Mobilde ve reduced-motion altında aşamalar düğmelerle okunur.

Yeni panoramik fabrika görüntüsünde beton kolon, fiziksel kameranın montaj ayağı, objektif ve kablosu, CNC ekipmanı, zemin ve bariyerler görülür. Ayrı bir alfa kanallı çalışan katmanı, doğal duruşunu koruyarak sınırlı mesafe kat eder. Yürüme iskeleti veya döngüsel dekoratif animasyon kullanılmaz.

Kamera görüş alanı açık renk kesikli bir kapsama; kontrollü alan champagne sınır olarak gösterilir. Çalışanın zemine temas noktası ile poligon kesişimi aynı koordinat sisteminde hesaplanır. Kişi ikinci aşamada alan dışındadır. Üçüncü aşamada sınır geçilerek olay adayı oluşur. Dördüncü aşamada tanımlı kural uyarı üretir. Beşinci aşamada olay kimliği ve kayıt/bildirim durumu görünür. Geri scroll bütün bu durumları geri alır; olay geçmişi veya zamanlayıcı bu akışı yönetmez.

## Ürün kalite kontrolü — IndustrialVisionDemo

Mevcut deterministik `lib/vision-simulation.ts` dosyası değiştirilmemiştir. Üç kusur, ürün kimliği, eşik geçişleri, karar gecikmesi, pnömatik temas, uygun/hatalı sayım, duraklatma ve sıfırlama aynı modelle çalışır.

Sahne; üretim bayı, metal kamera kafası, odak bileziği, montaj bağlantıları, halka aydınlatma gövdesi, motor soğutma kanatları, giriş/çıkış transfer kapakları ve açık ayırma haznesiyle geliştirilir. Transfer kapakları ürünün doğduğu ve havuzdan çıkarıldığı eşikleri örter. Lens ekseni ve fotoelektrik tetik konumu modeldeki kontrol istasyonuna bağlıdır. Görüntü alma vurgusu yalnızca gerçek simülasyon capture olayından sonraki 160 ms içinde görünür.

Kompakt yerleşimde bant ana odak; ivory kamera analizi ikinci odaktır. Beklenen/gözlenen açıklamalar, karar, kararın kaydı ve ilgili ürünün tamamlanan/bekleyen aksiyonu aynı ürün kimliğine bağlıdır. Kamera en son yakalanan ürünü gösterirken ayırıcı önceki ürünü işleyebilir; durum satırı ayırıcının kendi ürün kimliğini açıkça yazar. Altı adımlı küçük süreç satırı ikinci bir dashboard oluşturmaz. Olay paneli son üç kaydı gösterir; modelin sekiz kayıtlık tamponu korunur.

İstasyon / Kontrol detayı düğmeleri yalnızca görüntüleme kamerasını değiştirir. Simülasyon zamanı, ürünler ve sayaçlar değişmez. Mobilde analizin görüntü ve karar bölümleri yan yana, beklenen/gözlenen ve aksiyon altta bulunur. Reduced-motion altında kare güncellemesi ve otomatik hareket kapalıdır; Sonraki olay ile ilerlenir. Görünmez/arka plandaki sekmede simülasyon durur; sahne demand render kullanır.

## Görsel kaynakları

`imagegen` becerisi ile bu görev için üretilen özgün fabrika panoraması ve şeffaf çalışan görseli kullanılır. İndirilen stok görsel, üçüncü taraf model veya harici CDN yoktur. Kaynaklar:

- `C:/Users/hdgn5/.codex/generated_images/01a1460d-4396-7723-bc70-aa10d4ec49bd/exec-4d2a900c-912b-4b9b-8161-a3f6d6303342.png` — fabrika panoraması.
- Aynı dizindeki `exec-ad4f3895-6baa-4c98-b86b-d1fb3eef341a.png` — alfa kanallı çalışan.
- Projeye taşınan optimize WebP dosyaları `public/images/experiences/` altındadır; birlikte yaklaşık 277 KB.
- Three.js geometri ve malzemeleri yerel olarak oluşturulur; mevcut MIT lisanslı RoomEnvironment kullanımı sürer.

## Bilinen sınırlar

Bu iki bölüm gerçekleşmiş müşteri projeleri olarak sunulmaz. Güvenlikte görüntü, kişi ve konumlar önceden belirlenmiştir; kamera kapsaması veya zemin izdüşümü gerçek kamera kalibrasyonu değildir. Çalışan tam yürüme animasyonu yerine kontrollü bir görsel geçiş yapar. Görüntü tabanlı ortamın ışığı dinamik olarak değişmez.

Kalite kontrol sahnesi tarayıcı için optimize edilmiş bir 3D mühendislik anlatımıdır; fotogerçekçi CAD veya fizik çözümü değildir. Kamera analizi, ürünle eşleşen SVG makro gösterimdir; gerçek sensörden alınmış fotoğraf veya AI sonucu değildir. Mobilde gölge haritası kapalıdır; ince kusur için analiz paneli ve ekipman için Kontrol detayı görünümü kullanılır. Performans sayıları yalnızca bu makinedeki yerel ölçümdür.

## Kapsam ve koruma

Başlangıç çalışma ağacı SHA-256 manifesti ve kaynak kopyaları `C:/Users/hdgn5/AppData/Local/Temp/c2c-premium-before-lxeyh0yl/` altında alındı. Hero, ProcessorStudio/ProcessorModel, PC donanımı, çözümler, navigasyon, iletişim, ana sayfa bileşen sırası ve kalite durum makinesi byte bazında korunur. Git reset, checkout, restore, stash, commit veya geçmiş değişikliği yapılmadı. Önceden commit edilmemiş değişiklikler silinmedi.

## Son doğrulama sonuçları

- TypeScript, sıfır uyarı ile ESLint, `npm test` (26/26) ve `npm run build` geçti.
- `scripts/industrial-premium-qa.mjs`, production sunucuda (`localhost:3100`) masaüstü 1440 × 900, 393 px ve 320 px kontrollerini geçti. Beş adım ileri/geri, klavye ve dokunma, kişi/alan geometrisi, uyarı/kayıt sırası ve reduced-motion doğrulandı. Masaüstünde adım kontrollerinin alt sınırı 854 px; mobil hedefler en az 48 px. Yatay taşma ve çalışma zamanı hatası yok.
- `scripts/vision-qa.mjs`, production sunucuda masaüstü ve aynı mobil genişliklerde geçti. Üç kusur, kamera karesi/ürün kimliği, ayırıcı kimliği, tek sayım, duraklatma/devam, tam sıfırlama, arka plan/görünmezlik, klavye, reduced-motion ve kamera görünüm değişimleri doğrulandı. Çıkış kaydı adımının erişilebilirliği ve doğru ürün kimliği ayrıca doğrulandı. WebGL veya tarayıcı hatası yok.
- Son kalite sahnesi ölçümü: 173 draw call, 29.266 üçgen. Bu makinede yaklaşık 143 render/s gözlendi; bu bir başka cihaz için performans garantisi değildir. Duraklatıldığında demand-render karesi sabit kaldı.
- Ekran görüntüleri görsel olarak incelendi. Fabrika ortamı ve fiziksel güvenlik kamerası önceki düz çizime göre daha inandırıcı; kalite istasyonu, düzenli bay bağlamı ve yakın kontrol görünümüyle daha okunabilir. Kalite 3D sahnesinin fotogerçekçi CAD olmadığı sınırı sürer.
- Galeri: `artifacts/industrial-premium/index.html`. JSON raporları aynı dizinin `production-safety/` ve `production-quality/` altındadır. Uzun bölüm ekran görüntülerinde görünürlük korumasının devreye girmemesi için tarayıcı yüksekliği artırılır ve hareketsiz elle ilerletilen durum yakalanır.

## Bu görevde değişen / eklenen dosyalar

Değişen mevcut kaynaklar:

- `components/ProblemStory.tsx`
- `components/IndustrialVisionDemo.tsx`
- `components/IndustrialVisionScene.tsx`
- `components/VisionAnalysis.tsx`
- `components/industrial-vision.css`
- `scripts/vision-qa.mjs`

Eklenen kaynaklar:

- `components/SafetyCameraScene.tsx`
- `components/problem-story.css`
- `lib/security-scenario.ts`
- `tests/security-scenario.test.ts`
- `scripts/industrial-premium-qa.mjs`
- `public/images/experiences/factory-safety.webp`
- `public/images/experiences/safety-worker.webp`
- `docs/industrial-premium.md`

Galeri, koruma manifesti ve tarayıcı kanıtları `artifacts/industrial-premium/` altında üretilmiştir. Başlangıçtan kalan diğer Git farkları bu görevin değişiklikleri değildir. Next.js tarafından yenilenen `next-env.d.ts`, başlangıç SHA-256 özetiyle birebir eşleşen içeriğine korunmuştur.
