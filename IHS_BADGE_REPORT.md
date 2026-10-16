# C2C — IHS marka alanı

Başlangıç: `bc955f4`; Git çalışma ağacı başlangıçta temizdi. Güvenli dönüş etiketi: `checkpoint/ihs-badge-before-bc955f4`.

Yalnızca IHS marka alanı değiştirildi:

- Mevcut 1024px kapak haritasında ortalanmış 208 × 208px kare alan; kapak genişliğinin yaklaşık %20'si, alanının %4'ü.
- Hafif ton farkı ve ince, düşük kontrastlı gravür sınırı.
- C2C yazısı 126px yerine 70px, daha dar harf aralığıyla karenin merkezinde.
- Koyu, düşük kontrastlı baskı ve yalnızca marka alanında hafif matlık. Yeni etiket geometrisi, parıltı veya materyal katmanı yok.
- Kapağın satin gümüş temel rengi, global roughness/metalness, fırça dokusu ve yansıma ayarları korundu.

Uygulamanın **app, components ve lib kaynakları bütünüyle aynı**. Kamera, scroll, açılma/birleşme/final dönüş, ışıklar, anakart, iç yapı, metinler ve layout değiştirilmedi. Yalnızca üç IHS haritası ve üretim tarifi değişti; açılış posterleri yeni marka alanıyla yeniden üretildi. Görsel dil C2C için özgündür, ticari CPU markası veya amblemi kopyalanmadı.

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| TypeScript `tsc --noEmit` | PASS |
| ESLint, sıfır uyarı | PASS |
| Production build | PASS — 17 sayfa |
| 1440 × 900 gerçek tarayıcı | PASS — başlangıç, kapalı CPU yakın planı, iç yapı, final |
| Önce/sonra aynı kamera ve katman koordinatları | PASS |
| Runtime JavaScript hataları | Yok |
| Render bütçesi | Aynı: 32 draw call, 107.523 üçgen, 8 program, 15 texture |
| Diğer uygulama kodları ve model varlıkları | Değişmedi; kaynak kapsam kontrolü yapıldı |

Testler ayrı headless Chrome / WebGL oturumunda yapıldı; kişisel Chrome profili kullanılmadı. Yeni özellik veya diğer Hero düzenlemeleri eklenmedi.

## İstenen çıktılar

1. [Aynı açıdan önce/sonra karşılaştırma](artifacts/ihs-badge/compare-1440.png)
2. [1440px Hero ekran görüntüsü](artifacts/ihs-badge/after/1440-wide.png), [1440px kapak yakın planındaki Hero](artifacts/ihs-badge/after/1440-lid.png)
3. TypeScript / lint / build: yukarıdaki tabloda PASS.

[Bütün karşılaştırma galerisi](artifacts/ihs-badge/index.html) · [önce kamera verileri](artifacts/ihs-badge/before/capture.json) · [sonra kamera verileri](artifacts/ihs-badge/after/capture.json) · [kapsam kontrolü](artifacts/ihs-badge/preservation.json).

Üretim: `node scripts/bake-hero-surfaces.mjs --metal-only`, ardından development sunucusuyla `node scripts/bake-hero-posters.mjs`. Büyük test görüntüleri gitignored artifacts dizinindedir.
