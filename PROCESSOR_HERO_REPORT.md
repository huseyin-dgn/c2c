# C2C — Anakarttan işlemciye Hero, görev 1.1

Başlangıç: `1a22441a789c56b98439db66cfa69a4840b41d6a`. Çalışma ağacı başlangıçta temizdi. Güvenli geri dönüş etiketi: `checkpoint/processor-hero-before-1a22441`. Commit edilmemiş kullanıcı çalışması silinmedi.

Uygulama `http://localhost:3000`, production doğrulaması `http://localhost:3100` üzerinde çalışır. Teşhis paneli yalnızca development ortamında `/?debug=1` ile açılır. Kişisel Chrome oturumu kullanılmadı; testler ayrı, headless Chrome oturumlarında yürütüldü.

## 1. Modelin kaynağı ve lisansı

Anakartın CPU çevresini gösteren özgün model, [bake-motherboard.mjs](scripts/bake-motherboard.mjs) ile çevrimdışı üretildi ve iki GLB varyantına aktarıldı. Blender kullanılmadı. Geometri tarayıcıda inşa edilmiyor; GLB önceden hesaplanmış buffer verileri içeriyor. CPU geometrisi de önceden hesaplanmış, sıkıştırılmış bir varlık.

Üçüncü taraf model veya referans görsel kopyalanmadı. [Sketchfab adayının](https://sketchfab.com/3d-models/mother-board-3d-model-99a5f94e130a41c48590d59877f08663) listelemesi değerlendirildi; varlık sayfası 403 verdiğinden dosya/lisans içeriği incelenemedi ve model kullanılmadı. Lisansın uygun olduğu varsayılmadı.

İstenen iki referans görsel bu oturumun ekinde yoktu; ekteki yazılı özelliklerden ilerlenmiştir. Kullanılmayan görsellerin görüldüğü iddia edilmiyor.

Geometri ve dokular bu proje için özgün üretildi. Araçlar mevcut bağımlılıklar olan Three.js (MIT) ve Sharp (Apache-2.0). Varlık açıklamaları: [anakart kaynak belgesi](public/models/motherboard/LICENSE.md), [CPU kaynak belgesi](public/models/processor/README.md). Yeni bağımlılık eklenmedi.

## 2. Eklenen fiziksel ayrıntılar

- Delikli ve katmanlı koyu PCB; yüzeyde baked devre izleri, via temsilleri, keepout çizgileri ve temas gölgeleri.
- Soket yalıtkanı, iç temas yatağı, açık merkezli metal yük çerçevesi, dört bağlantı elemanı ve bükülmüş kilitleme kolu.
- Altı düzenli VRM fazı: MOSFET paketleri, lehim uçları, bobin gövdeleri ve kapasitörler.
- Eşlenmiş pasif bileşen sıraları, kontrolcü paketi ve saat referansı; kenarda anahtarlı bellek bağlantısı kesiti.
- CPU'da basamaklı ve yumuşatılmış IHS, minimal C2C işareti, fırçalanmış metal yüzey, temsili ısıl arayüz, silikon floorplan dokusu, organik altlık ve LGA temasları.

Bileşenler rastgele dağıtılmadı; güç katı, soket keepout alanı, bağlantı sıraları ve decoupling bankaları çevresinde düzenlendi. Malzeme farkları metalness, roughness, düşük yoğunluklu mikro doku ve mevcut baked stüdyo yansımasıyla kuruldu. Neon, parçacık veya hologram eklenmedi.

## 3. CPU ve soket ilişkisi

İşlemci başlangıçta soketin üzerinde, temas yüzeyi iç yatağa bakacak şekilde konumlanır. Metal çerçevenin merkezi IHS için açıktır; kilit kolu paketin dışında kalır. PCB kalınlığı, soket yükseltisi ve paket kalınlığı birbiriyle tutarlı ölçeklerde tanımlandı.

Kesit sırasında paket yalnızca temsili görünürlük için yükselir; anakart yerinde kalır. Bu bir gerçek söküm simülasyonu veya elektriksel olarak doğrulanmış anakart değildir. C2C'nin anakart/işlemci ürettiği iddiası yoktur; sahne altyazısı bunu mühendislik metaforu olarak belirtir.

## 4. Kamera ve scroll

Mevcut GSAP pin, scrub, bölüm süreleri ve dört metin paneli korundu. Görev 1.1'in anakarttan CPU'ya yaklaşma talebine uygun olarak Hero kamera keyframe'leri güncellendi. Kamera ve yaw interpolasyonu sürekli hız geçişlerini korur; büyük dönüşler yapılmaz.

| Scroll | Görüntü |
| --- | --- |
| %0 | CPU sokete oturur; anakart çevresi görünür. |
| %25 | Kontrollü dolly-in; paket henüz açılmaz. |
| %50 | Kapak ve iç katmanlar açılır; silikon görünür. |
| %75 | Alçak, anlaşılır teknik bakış; anakart bağlamı sürer. |
| %100 | Paket yeniden oturur; başlangıç geniş açısı geri gelir. |

Başlangıç ve son kamera/yaw aynıdır. Hareket zamana bağlı rastgele bir simülasyon değil, scroll pozisyonunun deterministik fonksiyonudur. Yukarı kaydırmada aynı konumlar geri alınır.

## 5. Katmanların hareketi

IHS'nin maksimum yerel açıklığı önceki ara tasarımdaki 2,25 birimden 1,04 birime indirildi. Kamera açısı silikonun görünmesini sağlar. Isıl arayüz kapakla birlikte, silikon 0,16 birim, altlık ve temas katmanları daha kısa mesafelerle aynı paket ekseninde hareket eder.

Birleşmede alt paket ve bağlantılar %91'e kadar sokete oturur; kapak %85–100 arasında kapanır. %93 kontrolünde alt katmanlar oturmuşken kapağın hâlâ açık kaldığı gerçek konum verileriyle test edilir. %100'de bütün yerel katman koordinatları başlangıç değerlerine döner.

## 6. Performans ve kaynak yönetimi

Mobil ilk açılışta aynı 3D sahneden alınmış 6.186 baytlık (375 px) veya 9.500 baytlık (tablet) WebP gösterilir. Model/texture dosyaları ilk kaydırmaya kadar istenmez. Bu davranış gerçek tarayıcı resource kayıtlarıyla test edilir. Kaydırma başlayınca canlı sahne hazırlanır; hazır olana kadar poster görünür kalır. Masaüstü 3D'yi ilk açılışta hazırlar.

Mobil anakart GLB'si 90.793 bayt ve 7.976 üçgen; masaüstü GLB'si 814.270 bayt ve 90.820 üçgendir. Anakart yedi materyal grubuna birleştirildi. CPU alt temasları ve iç pasifler instancing kullanır. Mobilde gerçek zamanlı shadow pass yoktur; DPR 1'dir. Masaüstünde sınırlı 1024 px gölge haritası kullanılır.

Mevcut 91.941 baytlık baked stüdyo yansıması, `compileAsync`, demand rendering ve görünürlük kontrolü korundu. Sürekli animasyon döngüsü yoktur. Scroll ve layout tamamen durulduğunda en az bir saniye yeni WebGL frame üretilmemesi test edilir.

| Gerçek renderer ölçümü | Başlangıç mobil | Yeni mobil | Başlangıç masaüstü | Yeni masaüstü |
| --- | ---: | ---: | ---: | ---: |
| `gl.info.render.calls` | 155 | 33 | 179 | 33 |
| Renk geçişi üçgenleri | 24.656 | 18.109 | 25.488 | 107.097 |

Bu sayaçlar render sonrasında okunur. Three.js renk geçişinden önce sayaçlarını sıfırladığından masaüstünün ilave shadow pass'i bu 33'e dahil değildir. Masaüstü geometri artışı anakart ayrıntıları içindir; mobil LOD önceki üçgen bütçesinin altındadır.

Next'in Activity önbelleği sayfayı gizlerken materyal programlarının beklememesi için materyal referansları sahne nesneleri ayrılmadan tutulur ve cleanup sırasında serbest bırakılır. Context-loss dinleyicisi kaldırılır; kasıtlı unmount gerçek WebGL hatası olarak bildirilmez. Baked geometri/texture sahipliği ayrıca temizlenir.

Kaynak testinde üç gerçek istemci navigasyonu boyunca her seferinde 118 buffer, 8 texture ve 6 program silme çağrısı görüldü. Geri dönüşlerde renderer değerleri 7 program, 32 geometri ve 8 texture olarak sabit kaldı. Bu, toplam VRAM'in sıfırlandığı iddiası değildir; tarayıcı/Next önbelleğinin tuttuğu context ve gölge programı sınırlı biçimde kalabilir.

Lighthouse 12.8.2, Chrome 155.0.8059.80, yerel production URL; ölçümler diğer tarayıcı testleri bittikten sonra sırayla çalıştırıldı.

| Ölçüm | Masaüstü | Mobil | Accessibility | Best Practices |
| --- | ---: | ---: | ---: | ---: |
| Önceki kullanıcı raporu | 97 | 57 | 100 | 100 |
| Bu oturumun başlangıç `1a22441` ölçümü | 96 | 67 | 100 | 100 |
| Son ölçüm | **96** | **88** | **100** | **100** |

Mobil LCP 6,6 saniyeden 3,8 saniyeye, TBT 410 ms'den 110 ms'ye indi. Masaüstü LCP 1,3 → 1,4 saniye; TBT 30 → 50 ms. Son mimarinin farklı mobil tekrarları 84–89 aralığındaydı; tabloda en yüksek skor değil son ölçüm kullanıldı. Daha erken, doğrudan WebGL açan CPU ara tasarımı 50 aldı; bu sonuç geçer sayılmadı ve [ham raporu](artifacts/processor/lighthouse/mobile-v1-attempt.report.html) saklandı.

Mobil performansı kötüleştirmeme koşulu bu laboratuvar ölçümlerinde karşılandı. Masaüstü bu oturumun başlangıcıyla aynı; geçmiş raporun bir puan altında. Bu skorlar fiziksel telefon performansı veya tüm ağ koşulları için garanti değildir. [Mobil rapor](artifacts/processor/lighthouse/mobile-after.report.html), [masaüstü rapor](artifacts/processor/lighthouse/desktop-after.report.html).

## 7. Kanıtlar ve testler

[Önce/sonra galerisi](artifacts/processor/index.html) dört genişliğin beş aşamasını içerir. [Tarayıcı videosu](artifacts/processor/recording/c2c-processor-hero.webm) bütün ileri ve ters Hero hareketini gösterir. [Gerçek canvas ölçümleri](artifacts/processor/after/browser.json), [kaynak testi](artifacts/processor/resources.json), [development teşhis testi](artifacts/processor/diagnostics/report.json) ve [production panel testi](artifacts/processor/production-debug/report.json) ayrı kaydedilir.

| Kontrol | Sonuç / kanıt |
| --- | --- |
| TypeScript | `npm run typecheck` geçti. |
| ESLint | `npm run lint` geçti; uyarı yok. |
| Birim testleri | `npm test`: 13/13 geçti; kamera sürekliliği, ters oynatma ve güvenlik testleri dahil. |
| Production build | `npm run build` geçti; 17 sayfa üretildi. |
| 375 / 768 / 1440 / 1920 px | Beş aşama, tam yeniden birleşme, ters kaydırma, taşma kontrolü ve gerçek kamera/layer değerleri geçti. |
| Birleşme sırası | %93'te alt paket oturmuşken kapağın açık kaldığı test edildi. |
| Sonraki bölüme geçiş | Dört genişlikte pin serbest kaldı ve Hakkımızda görünür alana geldi; [ölçümler](artifacts/processor/transition.json). |
| Mobil ilk açılış | Poster yüklendi; scroll öncesi Canvas ve model istekleri yok, scroll sonrası gerçek model var. |
| Reduced-motion | Canvas/pin kaldırıldı; sabit gerçek-sahne görseli ve bütün anlatım görünür. Canlı tercih değişimi de geçti. |
| WebGL yok / context loss | Anlamlı sabit sahne görseli gösterildi; gerçek hata kaydedildi. |
| Teşhis paneli | Beş aşama, iptal, ters oynatma, renderer ve gerçek JS/WebGL hataları geçti. Normal URL'de ve production `?debug=1`'de panel yok. |
| Navigasyon ve GPU temizliği | Üç geçişte buffer/texture/program silmeleri ve sabit kaynak sayıları doğrulandı; pin temizliği geçti. |
| Konsol | Normal test akışlarında uygulama hatası yok. Bilerek tetiklenen hatalar ayrı fallback testlerinde doğrulandı. |
| Diğer donanım bölümleri | 1440 px regresyonunda donanım/kamera/vitrin etkileşimleri, reduced-motion ve context-loss alternatifleri geçti. |
| HTTP / güvenlik | 10 sayfa, bağlantılar, metadata, SSR alternatifi, API 503/405, proje 404 ve SEO varlık kontrolleri geçti. Dört backend/güvenlik dosyası SHA-256 ile değişmemiş. |
| Tam fotogerçekçilik | **Tam karşılanmadı**; aşağıdaki kalite sınırları geçerlidir. |

Yeniden çalıştırma: `node scripts/processor-qa.mjs`, `node scripts/hero-resources-qa.mjs`, `node scripts/diagnostics-qa.mjs`, `node scripts/record-processor.mjs`. Browser QA varsayılan olarak production için 3100 kullanır; kaynak testi için `TEST_BASE_URL`, teşhis testi için development 3000 ayarlanabilir. Görsel kanıtlar yerel `artifacts/processor/` dizinindedir; Git'e uygulama varlıkları, üretim scriptleri ve bu rapor eklenir.

## 8. Devam eden kalite sınırları

Tam fotogerçekçi yarı iletken ürün filmi hedefi **tam karşılandı olarak işaretlenmiyor**. Sonuç, özel modellenmiş ve PBR ile render edilmiş bir mühendislik görselleştirmesidir. Bağlantı yolları ve silikon floorplan temsilidir; üretici CAD'i, ölçülmüş malzeme taraması veya path-traced ürün çekimi kullanılmadı. Mobil LOD'de küçük bileşen kenar detayları azaltılır ve ilk görüntü statiktir.

Gerçek telefon GPU'su, Safari/iOS ve Firefox bu ortamda test edilmedi. Mobil tarayıcı kontrolleri Chrome viewport emülasyonudur; fiziksel cihaz FPS garantisi verilmez. Kullanıcının iki görsel referansı mevcut olmadığından görsel benzerlik karşılaştırması yapılmadı.

Kapsam Hero'dur. `app/`, genel CSS, SEO, iletişim/backend, donanım keşfi, kamera demosu, yatay vitrin, problemden çözüme, Hero dışındaki SVG sistemleri ve Hakkımızda kaynakları değiştirilmedi. Teşhis panelinde yalnızca gerçek mobil poster bekleme durumu eklendi; üretimde hâlâ kapalıdır.
