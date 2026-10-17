# C2C Engineering — Production performans testi

17.10.2026. Güncel kodla tek production build; Next start, localhost; Chromium headless. CPU/ağ yavaşlatması yok. Her viewport/senaryoda tek örnek; saha yüzdelikleri değildir. Dev/Turbopack/HMR ölçülmedi.

GPU: ANGLE / Vulkan / SwiftShader, yani yazılımsal GPU. 393 px viewport gerçek telefon performansını temsil etmez. Masaüstü de fiziksel ekran kartı testi değildir.

## Öncelikler

- **KRİTİK:** Bu testte çalışma zamanı hatası, kilitlenen Hero veya navigasyon hatası görülmedi. Aralıklı sorunun kök nedeni kesinleşmedi.
- **ORTA / 1:** Hero scroll rAF aralıkları masaüstünde 497–539 ms, mobil viewport'ta 158–159 ms'ye ulaştı. Bu ortamda belirgin darboğaz var; uygulama JS, sürücü ve GPU maliyetleri kesin olarak ayrıştırılmadı.
- **ORTA / 2:** Hero ilk görünür 3D kare masaüstünde 2,33–2,82 sn; mobilde ilk girdiden sonra 1,96–2,20 sn. LCP, bu 3D hazırlık beklemesini temsil etmiyor.
- **ORTA / 3:** PC ilk hazırlığı masaüstünde 3,24 sn, mobil viewport'ta 2,48 sn. Bölüme atlama, dosya ve GPU hazırlığı birlikte; alt aşamalar ayrı ölçülmedi.
- **DÜŞÜK:** Alt sayfalarda 0–124 ms toplam long-task süresi; belirgin kullanıcı etkisi doğrulanmadı.

Uygulama kodu değiştirilmedi. Doğrulanmış, düşük riskli bir düzeltme seçilemedi. DPR, model, animasyon, navigasyon ve GPU readiness korundu. Performans kazanımı / önce-sonra farkı iddia edilmiyor.

## Ana sayfa

| Viewport / senaryo | LCP ms | CLS | Görünür 3D ms | GPU hazırlığı ms | Pin işareti ms | İlk hazırlık long-task toplam/max ms | Scroll en uzun rAF ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1440 / ilk | 392 | 0,00013 | 2822 | 1494 | 483 | 673 / 320 | 539 |
| 1440 / yenileme | 424 | 0 | 2334 | 1384 | 150 | 533 / 390 | 497 |
| 393 / ilk | 312 | 0,00179 | 2587 | 1236 | 422 | 509 / 187 | 158 |
| 393 / yenileme | 256 | 0,00179 | 2505 | 1525 | 163 | 412 / 275 | 159 |

Görünür 3D zamanı navigasyon başlangıcına göredir; mobilde ilk girdi ayrıca kaydedildi. GPU hazırlığı mevcut prepareMs alanıdır: texture upload, compileAsync, gizli ilk çizim ve GPU fence beklemesi birlikte. Shader derlemesi ayrı ölçülmedi. Pin işareti ilk Hero pin spacer görülme zamanı, refresh CPU süresi değildir. rAF aralıkları ekran sunum süresi veya FPS değildir. Long tasks saf JavaScript CPU yüzdesi olarak yorumlanmamalıdır.

## Diğer sayfalar — ilk ziyaret

| Sayfa | 1440 LCP ms | 393 LCP ms | En yüksek CLS | En yüksek toplam long-task ms |
|---|---:|---:|---:|---:|
| /hakkimizda | 132 | 120 | 0 | 85 |
| /projeler | 124 | 100 | 0 | 58 |
| /urunlerimiz | 112 | 80 | 0 | 0 |
| /cozumler | 152 | 92 | 0 | 124 |
| /yaklasim | 148 | 92 | 0 | 114 |
| /iletisim | 328 | 196 | 0 | 106 |
| /kvkk | 272 | 68 | 0 | 57 |

## Sahne ve işlev kontrolleri

İki genişlikte Hero ilerlemesi, yenileme, logo ile sıfırlama, iletişim sayfasına geçiş ve ana sayfaya dönüş geçti. PC seçimi/ayırma; güvenlik sahnesi alan ihlali uyarısı; endüstriyel simülasyon zaman ilerlemesi doğrulandı. Alt sayfalar HTTP 200; pageerror sayısı 0.

Endüstriyel sahne görünürken üç Canvas bağlıydı. 250 ms örnekleme penceresi:

| Viewport | Hero frame | PC frame | Endüstri frame |
|---|---|---|---|
| 1440 | 1 → 1 | 40 → 40 | 5 → 6 |
| 393 | 20 → 20 | 55 → 55 | 5 → 7 |

Örneklenen pencerede yalnızca görünür sahne ilerledi. Hero'ya dönünce endüstriyel Canvas kaldırıldı; ekran dışındaki PC sayacı sabit kaldı. Güvenlik sahnesi SVG, WebGL kullanmıyor. Bu sonuçlar hazırlıkların hiç çakışmadığı veya tüm zaman aralığında ekran dışı render olmadığı anlamına gelmez. GPU bellek/ısı, fiziksel cihaz performansı ve INP ölçülmedi.

## Doğrulama

Production build, TypeScript ve ESLint başarılı. Testin ilk kamera kontrolü smooth-scroll tamamlanmasını bekleyecek şekilde düzeltildi; kaydedilmiş Hero ölçümleri tekrarlanmadan kalan senaryolara devam edildi. Bu, uygulama düzeltmesi değildir.

Tekrar üretim: production sunucu açıkken `node scripts/performance-audit.mjs`. TEST_BASE_URL ve TEST_ARTIFACT_DIR desteklenir. Ham veriler: performance-audit-2026-10-17.json.

Sonraki ayrı görev: gerçek GPU ve fiziksel telefon üzerinde kısa performans izi; renderer/shader/ana iş parçacığı maliyetlerini ayırıp hedefli düzeltme seçmek.
