# C2C — Görev 1.3: final kamera ve dolgu ışığı

Başlangıç: `f5147a1`. Git durumu başlangıçta temizdi; güvenli geri dönüş etiketi `checkpoint/hero-finale-before-f5147a1`. Kişisel Chrome oturumu kullanılmadı. Testler ayrı headless Chrome 155.0.8059.80 oturumlarında gerçek WebGL / AMD Radeon ANGLE üzerinde çalıştı. Geliştirme: http://localhost:3000, production test sunucusu: http://localhost:3100.

## Kamera ne zaman dönüyor?

Kapak, yeni toplam Hero scroll ilerlemesinin **%86,96** noktasında tamamen kapanır. Kamera kısa bir kapalı beklemeden sonra **%88,70** noktasında geri çekilmeye başlar; son **%11,30** boyunca tek bir smoothstep hareketiyle başlangıç anakart kadrajına döner. İşlemci açıkken veya kapanırken geri çekilme yoktur.

Önceki kapanış son ana kadar sürdüğü için kapanış sıkıştırılmadı: mevcut açılma, birleşme, katman lift'leri, yerleşme ve kapak kapanış eğrileri aynen korunarak Hero sonuna %15 ek scroll mesafesi ayrıldı. Pin mesafesi masaüstünde 4 → 4,6 viewport yüksekliği, mobilde 3,5 → 4,025 viewport yüksekliği oldu. Önceki mekanik ve metin geçişleri aynı mutlak scroll mesafelerinde gerçekleşir; yalnızca toplam ilerlemedeki yüzdeleri değişir. GSAP scrub 0,65 korunur.

Kamera X/Y/Z birlikte geri döner; mevcut CPU gövdesini izleyen lookAt korunur. FOV 39°, zoom 1 ve model ölçeği 0,84 / 1 olarak sabittir. Ek dönüş veya ikinci yaklaşma yoktur. Son pozda kamera, target, parent dönüşü ve kapalı CPU başlangıç pozuna döner. Geri scroll aynı sırayı tersine oynatır.

## Işıkta ne değişti?

Hero'ya `[1, 2.5, 5]` yönünden, `0.45` yoğunluğunda nötr ivory ön dolgu ışığı eklendi. Işık gölge üretmez; yeni shadow map veya gölge pass'i oluşturmaz. Mevcut ana ışık, rim, ortam yansıması, metal kapak ve silikon materyalleri değişmedi. Arka plan, geometri, roughness haritaları ve renk token'ları değiştirilmedi.

Aynı başlangıç kadrajındaki sabit ekran bölgelerinde görüntü luma değeri alt PCB'de %1,71–2,30, bağlantı bölgesinde %1,97–2,26 arttı. Arka plan örneklerindeki değişim %0. Bu yalnızca screenshot sRGB luma karşılaştırmasıdır, fiziksel fotometri değildir. Aynı açık CPU pozu ayrıca görsel olarak karşılaştırıldı; metal stüdyo yansıması ve die okunabilirliği korunuyor. Açılış posterleri yeni dolgu ışığıyla tekrar üretildi.

## Gerçek tarayıcı sonuçları

Her genişlikte 23 ileri ve 23 geri örnek kontrol edildi. İstenen **%0 / %30 / %60 / %80 / %90 / %100** ekranları, ayrıca tam kapanış ve kamera başlangıç sınırları kaydedildi. Final geri çekilmesindeki her örnekte bütün layer koordinatları ve paket lift'i sıfır; kamera uzaklığı yalnızca artıyor ve görünür CPU genişliği yalnızca azalıyor. CPU projeksiyonu dört viewport'ta da ekran içinde. İleri/geri boyut toleransı 0,4 px, mesafe toleransı 0,004 sahne birimi. Bunlar gerçek mesh/kamera projeksiyonlarıdır.

| Ekran | İlk/son CPU genişlik farkı | İlk/son merkez farkı X/Y | Kapanışa kadar kamera mesafe farkı | Draw call | Üçgen |
|---|---:|---:|---:|---:|---:|
| 375 × 812 | <0,01 px | 0.0000 / 0.0010 px | 0.000020 | 32 | 18535 |
| 768 × 1024 | <0,01 px | 0.0000 / 0.0010 px | 0.000000 | 32 | 18535 |
| 1440 × 900 | <0,01 px | 0.0000 / 0.0010 px | 0.000000 | 32 | 107523 |
| 1920 × 1080 | <0,01 px | 0.0000 / 0.0010 px | 0.000000 | 32 | 107523 |

Yakın plan mesafesi kapanış ve kapalı bekleme boyunca sabit kalıyor. Final, başlangıçtaki genel anakart kompozisyonuyla eşleşiyor. Geometri/üçgen/draw call sayıları başlangıç sürümüyle aynıdır. Üç SPA gezinme döngüsünde her dönüşte 8 program / 31 geometri / 15 texture sayısı sabit kaldı; her çıkışta 120 buffer / 15 texture / 7 program gerçekten silindi.

| Kontrol | Sonuç |
|---|---|
| TypeScript | PASS |
| ESLint, sıfır uyarı | PASS |
| Birim testleri | PASS — 18/18; orijinal süreler, kapak sonrası bekleme, tek dolly, easing ve reverse |
| Production build | PASS — 17 sayfa |
| 375 / 768 / 1440 / 1920 kamera ve katmanlar | PASS — ileri/geri ve iki gerçek sınır çevresinde ölçümler |
| Genel görsel regresyon | PASS — dört viewport; menü, Escape, klavye, pin temizliği, route dönüşü, idle |
| Reduced-motion / WebGL denied / context loss | PASS — anlamlı fallback ve canvas/pin temizliği |
| GPU kaynak temizliği | PASS — üç gerçek client-side gezinme döngüsü |
| Teşhis paneli | PASS — development gerçek test düğmesi; production ?debug=1 altında gizli |
| HTTP / projeler / SEO / güvenlik | PASS — 10 route, 503/405, proje 404, dört SEO varlığı; dört güvenlik hash'i aynı |
| Korunan kapsam | PASS — GLB, CPU varlıkları, materyaller, CSS, diğer bölümler, backend ve SEO kaynakları değişmedi |
| Fiziksel telefon FPS / ısınma / pil | NOT TESTED — viewport simülasyonu fiziksel cihaz ölçümü değildir |

Genel görsel regresyonun ilk koşusunda ara pozun yuvarlanmış separation değerleri 0,488 / 0,489 olarak farklı okundu. Test, integer CSS scroll konumu ve üç basamaklı dataset hassasiyetine uygun 0,002 mekanik / 0,02 kamera toleransı ve daha sıkı progress beklemesiyle güncellendi. Tekrar koşusu dört viewport'ta geçti; uygulamanın katman hareketleri değiştirilmedi. Saf hareket fonksiyonunun reverse eşitliği birim testinde tam eşitlikle, kamera kadrajı ayrıca yukarıdaki projeksiyon toleransıyla doğrulanır.

## Lighthouse

Önceki kayıtlı aralık desktop **94–95**, mobile **84–88**; Accessibility / Best Practices 100. Yeni ölçümler production üzerinde Lighthouse 12.8.2 ile, diğer tarayıcı testleri kapalıyken sıralı çalıştırıldı. Eski commit bu oturumda yeniden Lighthouse ile ölçülmedi. Bütün yeni koşular:

| Koşu | Performance | Accessibility | Best Practices | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| desktop | 93 | 100 | 100 | 1.5 s | 120 ms | 0 |
| desktop-repeat | 95 | 100 | 100 | 1.5 s | 60 ms | 0 |
| mobile | 88 | 100 | 100 | 3.8 s | 100 ms | 0 |

Mobil önceki aralığın üst sınırı olan 88'i koruyor. Masaüstü ilk koşusu 93 ile önceki alt sınırın 1 puan altında; tekrar sonucu da tabloda gösterildi. Önceki skorların her koşuda tam korunmuş olduğu iddia edilmez. Ağır model, postprocessing veya ek gerçek zamanlı gölge eklenmedi; poster-first yükleme, GLB/DPR/LOD optimizasyonları, baked environment ve GPU cleanup korundu.

## Kanıtlar

- [Önce/sonra galerisi, aynı pozda ışık karşılaştırması ve bütün aşamalar](artifacts/hero-finale/index.html)
- [Tam ileri / geri Hero videosu](artifacts/hero-finale/recording/c2c-processor-hero.webm)
- [Ham tarayıcı/kamera verisi](artifacts/hero-finale/after/browser.json), [kadraj ve ışık özeti](artifacts/hero-finale/summary.json), [GPU cleanup](artifacts/hero-finale/after/resources.json), [kapsam koruma](artifacts/hero-finale/preservation.json)
- [Desktop Lighthouse](artifacts/hero-finale/lighthouse/desktop.report.html), [desktop tekrar](artifacts/hero-finale/lighthouse/desktop-repeat.report.html), [mobile](artifacts/hero-finale/lighthouse/mobile.report.html)

Tekrar: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Production sunucusuyla `node scripts/hero-finale-qa.mjs`, `node scripts/processor-qa.mjs`, `node scripts/hero-resources-qa.mjs`. Kanıt galerisi: `node scripts/hero-finale-evidence.mjs`. Video: `RECORD_DIR=artifacts/hero-finale/recording node scripts/record-processor.mjs` (ortam değişkeni sözdizimi shell'e göre ayarlanır). Büyük test kanıtları gitignored artifacts dizinindedir.
