# C2C — IHS saten titanyum-gümüş materyali

Başlangıç commit'i: `b7d2462`; başlangıç Git durumu temizdi. Geri dönüş etiketi: `checkpoint/ihs-satin-before-b7d2462`.

Yalnızca IHS materyali ve üç IHS yüzey haritası düzenlendi. Açılış posterleri aynı sahneden yeniden üretildi. Yeni özellik, tasarım, ışık, geometri veya animasyon eklenmedi.

## Görsel değişiklik

| IHS ayarı | Önce | Sonra |
|---|---|---|
| Materyal temel tonu | #e0e2d9 | #b4bac0 |
| Albedo haritası temel tonu | #c4c6be | #b8bdc0 |
| Metalness | 0,98 | 0,97 |
| Roughness çarpanı | 0,75 | 0,92 |
| Roughness haritası tabanı | 0,4 | 0,5 |
| Environment yansıma yoğunluğu | 1,1 | 0,72 |
| Normal ölçeği | 0,16 | 0,20 |
| C2C lazer tonunun harita opaklığı | 0,65 | 0,30 |

Soğuk gümüş temel ton ve daha düşük yansıma yoğunluğu, geniş beyaz parlamayı azaltır. Roughness değeri haritayla çarpılır; 0,92 tek başına nihai yüzey roughness'i değildir. Yüzeyde ince yönlü fırçalama korunup rastgele mikro gürültü azaltıldı. C2C aynı yüzey haritasına düşük kontrastla işlenir; yeni etiket veya parlayan katman yoktur. Mevcut Standard materyal tipi ve shader özellikleri korunur.

## Aynı açıdan karşılaştırma

375, 768, 1440 ve 1920 px genişliklerinde başlangıç, kapalı CPU yakın planı, açık iç yapı ve final kadrajı önce/sonra kaydedildi. Kamera, target, ölçek, katman koordinatları, draw call, üçgen, program ve texture sayıları karşılaştırıldı. Kamera/layer dataset değerleri eşit; gerçek kamera–CPU uzaklık farkı 0,001 sahne birimi altında. Normal sayfalarda JavaScript hatası yok. Son görüntüler production sunucusunda gerçek headless Chrome / WebGL ile alındı; kişisel Chrome profili kullanılmadı.

Kapak üst yüzeyinin projekte edilen iç alanında sRGB görüntü luma ve beyaza yakın piksel örneklemi:

| Genişlik | Luma önce → sonra | RGB kanallarının tümü >235 olan piksel oranı önce → sonra |
|---|---:|---:|
| 375 | 208.5 → 202.7 | %9.3 → %0.0 |
| 768 | 208.3 → 202.7 | %9.3 → %0.0 |
| 1440 | 208.7 → 195.3 | %8.8 → %0.0 |
| 1920 | 208.5 → 195.2 | %8.7 → %0.0 |

Bu görüntü karşılaştırması fiziksel fotometri veya alaşım ölçümü değildir. Görsel ton, kenar çizgileri, fırça dokusu ve lazer işareti aynı kamera açılarıyla ayrıca gözle incelendi.

## Kapsam ve performans

ProcessorModel dosyası, IHS materyalinin tek satırı dışında başlangıç commit'iyle aynı. Kamera/scroll zamanlaması, açılma-kapanma, final geri çekilme, dolgu ışığı, ana ışık ve environment değişmedi. CPU iç katmanları, anakart GLB/dokuları, diğer bölümler ve CSS kaynakları değişmedi. Kaynak karşılaştırması [kapsam kaydında](artifacts/ihs-satin/preservation.json).

- TypeScript: **PASS** — typecheck ve son production build TypeScript aşaması.
- ESLint: **PASS** — sıfır uyarı.
- Production build: **PASS** — 17 sayfa.
- Dört viewport / dört aynı açı: **PASS**, normal çalışma JavaScript hatası yok.
- Render bütçesi aynı: 32 draw call; mobil 18.535 / masaüstü 107.523 üçgen; mobil 6 / masaüstü 8 program; mobil 14 / masaüstü 15 texture.
- Renk haritası 1024px, normal/roughness haritaları 256px olarak kaldı. Üç kapak haritası toplamı 110.934 → 79.449 byte; yaklaşık 31 KB azaldı. Yeni texture, model veya shader özelliği yok.

Lighthouse 12.8.2 production ölçümleri, diğer tarayıcı testleri kapalıyken sıralı çalıştırıldı:

| Koşu | Performance | Accessibility | Best Practices | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| desktop | 95 | 100 | 100 | 1.5 s | 50 ms | 0 |
| mobile | 88 | 100 | 100 | 3.8 s | 100 ms | 0 |

Önceki kayıtlı değerler masaüstü 93/95, mobil 88; eski commit için bu oturumda yeni Lighthouse koşusu yapılmadı. Belirgin bir render bütçesi artışı yoktur. Fiziksel telefon FPS / pil / sıcaklık ölçümü yapılmadı.

## Kanıtlar

- [Aynı açıda önce/sonra galerisi](artifacts/ihs-satin/index.html)
- [1440 px önce kapak](artifacts/ihs-satin/before/1440-lid-crop.png) / [sonra kapak](artifacts/ihs-satin/after/1440-lid-crop.png)
- [Önce ham kamera verisi](artifacts/ihs-satin/before/capture.json) / [sonra](artifacts/ihs-satin/after/capture.json)
- [Desktop Lighthouse](artifacts/ihs-satin/lighthouse/desktop.report.html) / [mobile](artifacts/ihs-satin/lighthouse/mobile.report.html)

Tekrar üretim: `node scripts/bake-hero-surfaces.mjs --metal-only`; development sunucusu açıkken `node scripts/bake-hero-posters.mjs`. Büyük karşılaştırma dosyaları gitignored artifacts dizinindedir. Bu çalışma IHS materyal rötuşuyla tamamlanmıştır.
