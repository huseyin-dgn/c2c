# C2C — Hero 1.2: yüzey, ışık ve kamera

Tarih: 16 Ekim 2026. Başlangıç: `44ab2a4`; güvenli geri dönüş etiketi: `checkpoint/hero-polish-before-44ab2a4`. Çalışma ağacı başlangıçta temizdi. Yeni bağımlılık eklenmedi.

Geliştirme: http://localhost:3000 — gerçek teşhis paneli: http://localhost:3000/?debug=1. Production test sunucusu: http://localhost:3100. Testler kişisel Chrome profiline erişmeden, ayrı headless Chrome 155.0.8059.80 oturumlarında, AMD Radeon / ANGLE / Direct3D11 üzerinde çalıştırıldı.

## Kamera düzeltmesi

Eski kamera eğrisi ilk hızlı yaklaşmadan sonra Hermite teğetleri nedeniyle yakın plan sınırını aşıp geri dönüyordu. Son keyframe, kapak henüz kapanırken başlangıç uzaklığına dönüyordu. CPU gövdesi yükselirken sabit kalan hedef noktası da kadrajı etkiliyordu. Mobil referansta CPU genişliği %35'te yaklaşık 274 px, %50'de 266 px, %70'te 294 px, kapanış sonunda 139 px idi.

Kamera ilk %25 içinde sınırları aşmayan smoothstep ile tek kez yaklaşır. Sonraki bütün aşamalarda yakın plan korunur; birleşme bitmeden uzaklaşma yapılmaz. Birleşme sonrasında normal pin çıkışı sonraki bölüme geçirir. Yeni bir uzaklaşma veya animasyon aşaması eklenmedi.

Kamera yalnızca Z ekseninde sabitlenmedi: X/Y/Z yaklaşması birlikte düzenlendi. Kamera ve lookAt, paket gövdesinin gerçek dünya koordinatındaki yükselmesini birlikte izler. Hedef, ayrışan parçaların değişken toplam sınırlarına bağlanmadı. Böylece parça açılması sahte bir zoom düzeltmesini tetiklemez. FOV 39°, zoom 1, model ölçeği mobilde 0.84 / masaüstünde 1 olarak sabittir. Parent dönüşü ve mikro pointer etkisi korunur.

GSAP pin, scrub, süreler, metin aşamaları, katman lift değerleri ve kapanış aralıkları değiştirilmedi. 1.001 progress noktasında ayrışma, processing, integration ve rotation değerleri başlangıç commit'iyle birebir karşılaştırıldı: PASS.

## Ölçüm yöntemi ve sonuçları

Gerçek üst altlık mesh'inin geometry bounding box köşeleri, güncel matrixWorld ve perspektif kamera ile ekrana projekte edildi. Bu sabit referans, katman arası boşluğun büyümesini zoom sanmaz. Boyut/merkez CSS pikseli, uzaklık temsili sahne birimidir; parçaların fiziksel ölçüsü iddiası değildir. QA için `?measure=1` gerçek render verilerini canvas dataset'ine yazar; sahte PASS değeri üretmez.

Her genişlikte %0–100 arası 21 ileri ölçüm, %100/%80/%60/%40/%20/%0 geri ölçüm ve altı istenen ekran görüntüsü kaydedildi. %40–%100 bölümü, talep edilen %40–%80 aralığına ek olarak kapanışı da kapsar. İleri/geri boyut ve merkez farkı 0.25 px altında; yaklaşma sırasında boyut artışı, sabit FOV/ölçek, yakın plan alanı ve merkez kararlılığı otomatik doğrulandı: PASS.

| Genişlik | %40–100 CPU genişliği | Genişlik değişimi | Projeksiyon alanı değişimi | Merkez kayması X / Y | Gerçek mesafe değişimi |
|---|---:|---:|---:|---:|---:|
| 375 | 265.35–266.69 px | %0.50 | %1.71 | 1.58 / 0.17 px | 0 |
| 768 | 355.55–357.34 px | %0.50 | %1.71 | 2.12 / 0.23 px | 0 |
| 1440 | 679.84–684.41 px | %0.67 | %1.94 | 5.46 / 0.72 px | 0 |
| 1920 | 815.80–821.29 px | %0.67 | %1.94 | 6.55 / 0.86 px | 0 |

Kalan çok küçük boyut ve merkez farkı, korunan model dönüşünden kaynaklanır; kamera dolly dalgalanması değildir.

| Ekran | Scroll | CPU genişliği önce → sonra | Merkez X, Y (sonra) | Kamera–CPU uzaklığı |
|---|---:|---:|---:|---:|
| 375 | %0 | 138.79 → 138.42 px | 237.93, 561.31 | 19.30 |
| 375 | %20 | 222.86 → 243.88 px | 224.05, 567.13 | 10.94 |
| 375 | %40 | 271.46 → 265.92 px | 219.99, 568.17 | 10.01 |
| 375 | %60 | 284.11 → 265.49 px | 219.54, 568.12 | 10.01 |
| 375 | %80 | 240.12 → 265.65 px | 219.70, 568.14 | 10.01 |
| 375 | %100 | 138.79 → 266.69 px | 220.99, 568.28 | 10.01 |
| 768 | %0 | 185.97 → 185.48 px | 504.39, 702.83 | 19.30 |
| 768 | %20 | 298.81 → 326.97 px | 485.76, 710.63 | 10.93 |
| 768 | %40 | 363.74 → 356.31 px | 480.35, 712.03 | 10.01 |
| 768 | %60 | 380.68 → 355.73 px | 479.74, 711.96 | 10.01 |
| 768 | %80 | 321.99 → 355.95 px | 479.96, 711.98 | 10.01 |
| 768 | %100 | 185.97 → 357.34 px | 481.69, 712.17 | 10.01 |
| 1440 | %0 | 346.78 → 345.84 px | 1092.12, 474.77 | 17.39 |
| 1440 | %20 | 565.90 → 623.51 px | 1081.46, 496.69 | 9.59 |
| 1440 | %40 | 696.23 → 681.71 px | 1075.57, 499.62 | 8.74 |
| 1440 | %60 | 730.98 → 680.28 px | 1074.02, 499.40 | 8.74 |
| 1440 | %80 | 613.50 → 680.81 px | 1074.57, 499.48 | 8.74 |
| 1440 | %100 | 346.78 → 684.41 px | 1079.02, 500.05 | 8.74 |
| 1920 | %0 | 416.14 → 415.01 px | 1456.55, 569.72 | 17.39 |
| 1920 | %20 | 679.08 → 748.20 px | 1443.76, 596.03 | 9.59 |
| 1920 | %40 | 835.47 → 818.05 px | 1436.69, 599.54 | 8.74 |
| 1920 | %60 | 877.17 → 816.33 px | 1434.83, 599.28 | 8.74 |
| 1920 | %80 | 736.20 → 816.97 px | 1435.49, 599.38 | 8.74 |
| 1920 | %100 | 416.14 → 821.29 px | 1440.83, 600.06 | 8.74 |

## Malzeme ve ışık

- Silikon: eşit kareler yerine asimetrik mantık, paylaşılan bellek, yoğun bağlantı ve çevresel arayüz bölgeleri. Albedo/roughness/normal haritaları; masaüstünde ince clearcoat, mobilde daha ucuz Standard materyal. Bunlar temsili makro yüzey bölgeleridir, gözle görünen transistörler değildir.
- IHS: yönlü ince metal finish, yüzeye işlenen düşük kontrastlı C2C işareti; yüzen etiket mesh'i kaldırıldı. Alt tarafta aynı mesh'e birleştirilmiş termal temas yüzeyi. İnce TIM ve laminat bevel'ları tabaka kalınlığıyla sınırlandı.
- Substrate: lehim maskesi altı ince yollar ve die bağlantı alanı. Soket çeliği, ferrit, polimer ve PCB için farklı roughness tepkileri.
- Hero'ya özel nötr üç softbox yansıması çevrimdışı PMREM ile hesaplandı: 71,060 byte gzip. Bağımsız ışık animasyonu, neon, glow veya postprocessing eklenmedi. Diğer interaktif donanım bölümünün ortam varlığı ve görünümü korunur.

Anakartın iki GLB'sindeki 7 mesh'in POSITION, NORMAL, index buffer'ları ve node transform'ları başlangıç sürümüyle byte düzeyinde eşit: PASS. Yalnızca mevcut bileşenlere yüzey haritası için UV eklendi. Anakart yerleşimi/poligonları değişmedi.

## Performans ve kaynaklar

| Kaynak | Önce | Sonra |
|---|---:|---:|
| Render draw call (color pass) | 33 | 32 |
| Mobil üçgen | 18,109 | 18,535 |
| Masaüstü üçgen | 107,097 | 107,523 |
| Mobil ilk görüntü posteri | 6,186 B | 6,762 B |
| Tablet posteri | 9,500 B | 10,106 B |
| Masaüstü posteri | 40,846 B | 41,506 B |

426 üçgenlik sınırlı CPU artışı, IHS altındaki gerçek temas yüzeyi içindir; yeni draw call eklemez. Masaüstü gölge pass'i ayrıca çalışır; gl.info color pass sayısı bütün GPU işini temsil etmez. Renk haritaları 1024px WebP; yüzey/normal haritaları 256px indexed PNG'dir. Kaynaklar [varlık belgesinde](public/models/processor/README.md) açıklanır. Yeni yüzey dokuları canlı sahne yükünü artırır; mobilde kullanıcı scroll niyeti oluşana kadar 3D model ve texture yüklemesi başlamaz.

Poster-first açılış, mobil LOD/DPR sınırı, gölge kapatma, async shader compile, önceden hesaplanmış environment, görünürlük kontrolü ve demand render korunur. Bir saniyelik boşta kontrolde sürekli WebGL render yok: PASS.

Üç client-side gezinme döngüsünde WebGL deleteBuffer/deleteTexture/deleteProgram gerçek çağrıları izlendi. Her döngüde +120 buffer / +15 texture / +7 program silindi. Geri dönüşlerde 8 program / 31 geometri / 15 texture sayısı sabit kaldı. Resize, runtime reduced-motion değişimi ve geri dönüşte tek ScrollTrigger pin: PASS. GPU'da ayrılan texture sayısı önceki 8'den 15'e çıktı; cleanup ve bounded-memory testi gerçek artışı kapsar.

### Lighthouse

Önceki commit'in kayıtlı sonucu desktop 96 / mobile 88, Accessibility 100 / Best Practices 100'dür. Bu başlangıç sonuçları önceki oturum raporundan korundu; bu oturumda eski commit için yeni Lighthouse koşusu yapılmadı. Yeni ölçümler diğer testler bittikten sonra sıralı ve ayrı tarayıcılarda Lighthouse 12.8.2 ile production üzerinde çalıştırıldı. Bütün sonuçlar aşağıdadır; tek iyi koşu seçilmedi.

| Koşu | Performance | Accessibility | Best Practices | LCP | TBT |
|---|---:|---:|---:|---:|---:|
| desktop-after | 94 | 100 | 100 | 1.5 s | 100 ms |
| desktop-repeat | 95 | 100 | 100 | 1.5 s | 50 ms |
| mobile-after | 84 | 100 | 100 | 4.0 s | 180 ms |
| mobile-repeat | 88 | 100 | 100 | 3.8 s | 100 ms |

Önceki skorların her koşuda tam korunması: **FAIL**. Masaüstü 1–2 puan düşük (94–95); mobil 84–88 aralığında, tekrarda önceki 88'e ulaşıyor. Mobilin 50–60 bandına gerilememesi: **PASS**. Accessibility / Best Practices 100 korunması: **PASS**. CLS bütün koşularda 0. İlk mobil transfer 404 KiB → 403 KiB; düşük ilk koşu 3D yükünün açılışa taşındığını göstermiyor. Bu laboratuvar ölçümleri fiziksel mobil cihaz performansı değildir.

## Test durumu

| Kontrol | Sonuç | Kanıt / kapsam |
|---|---|---|
| TypeScript | PASS | typecheck ve production build TypeScript aşaması |
| ESLint | PASS | --max-warnings=0 |
| Birim testleri | PASS | 14/14; kamera monotonluğu, ters yön, mekanik, form/API |
| Production build | PASS | 17 sayfa, bütün route'lar üretildi |
| 375 / 768 / 1440 / 1920 | PASS | 21 ileri + 6 geri ölçüm; 0/20/40/60/80/100 görüntüleri |
| Açılma / birleşme | PASS | gerçek layer koordinatları, %93'te gövde oturmuşken kapak açık |
| Development teşhis paneli | PASS | gerçek beş aşama düğmesi, iptal, renderer, hatalar, HMR |
| Production teşhis gizleme | PASS | normal URL ve ?debug=1: panel yok |
| Reduced-motion / WebGL denied / context loss | PASS | anlamlı poster fallback, pin/canvas temizliği |
| GPU kaynak temizliği | PASS | üç gerçek SPA gezinme döngüsü |
| Genel UI tarayıcı testi | PASS | dört viewport; menü, Escape, klavye, reverse, idle, route cleanup |
| Korunan interaktif bölümler | PASS | 1440px donanım/kamera/vitrin ve fallback regresyonu |
| HTTP / projeler / SEO | PASS | 10 route, link/anchor, API 503/405, proje 404, dört SEO varlığı |
| Backend güvenliği / palet | PASS | dört dosyanın hash'i aynı; 92 renk kontrolü |
| Önceki Lighthouse skorlarının tam korunması | FAIL | yukarıdaki bütün ölçümler ve farklar |
| Fiziksel telefon FPS / ısınma / pil | NOT TESTED | dört viewport masaüstü Chrome ile simüle edildi |
| Ticari CPU ile fiziksel doğruluk sertifikasyonu | NOT TESTED | temsili mühendislik görselleştirmesi |

Yüzey, ışık ve görünür die görüntüleri gözle incelendi. Görsel iyileşme kanıtları aşağıdadır; “tam fotogerçekçilik” otomatik testle kanıtlanmış bir sonuç olarak sunulmaz. Bu inceleme kullanıcının görsel kabulünün yerini tutmaz.

## Kanıtlar ve tekrar çalıştırma

- [Önce/sonra galerisi ve bütün ekranlar](artifacts/hero-polish/index.html)
- [3840 × 2160 açık iç yapı](artifacts/hero-polish/after/interior-4k.png)
- [Doğal piksel silikon kırpımı](artifacts/hero-polish/after/die-native-crop.png) — büyütme veya rötuş yok; renderer DPR sınırı 1.5 korunur.
- [İleri / geri Hero videosu](artifacts/hero-polish/recording/c2c-processor-hero.webm)
- [Ham kamera projeksiyonları](artifacts/hero-polish/after/projection.json), [özet](artifacts/hero-polish/summary.json), [mekanik koruma](artifacts/hero-polish/preservation.json), [GLB koruma](artifacts/hero-polish/board-preservation.json), [GPU cleanup](artifacts/hero-polish/after/resources.json)
- [Desktop Lighthouse](artifacts/hero-polish/lighthouse/desktop-after.report.html), [desktop tekrar](artifacts/hero-polish/lighthouse/desktop-repeat.report.html), [mobile](artifacts/hero-polish/lighthouse/mobile-after.report.html), [mobile tekrar](artifacts/hero-polish/lighthouse/mobile-repeat.report.html)

Varlık üretimi: `node scripts/bake-processor.mjs`, `node scripts/bake-hero-surfaces.mjs`, `node scripts/bake-motherboard.mjs`, `node scripts/bake-hero-studio.mjs`. Görüntü posteri: development sunucusu açıkken `node scripts/bake-hero-posters.mjs`.

Doğrulama: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; production sunucusu açıkken `BASE_URL=http://localhost:3100 node scripts/hero-polish-qa.mjs`, `node scripts/processor-qa.mjs`, `node scripts/hero-resources-qa.mjs`. Kanıt üretimi: `node scripts/hero-polish-evidence.mjs`; video için `RECORD_DIR=artifacts/hero-polish/recording node scripts/record-processor.mjs`. Ortam değişkeni örnekleri shell'e göre ayarlanmalıdır. Büyük kanıt dosyaları gitignored artifacts dizinindedir; kaynak, üreticiler, varlıklar ve bu rapor commit kapsamındadır.

Sayfa yerleşimi, metinler, navigasyon, Story timeline'ı, diğer bölümler, projeler, backend ve SEO kaynakları değiştirilmedi. Paylaşılan Studio API'si korunur; eski ortam dosyası Hero tarafından gereksiz yüklenmesin diye lazy başlatılır, donanım bölümü aynı dosyayı kullanmaya devam eder.
