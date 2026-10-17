# P1.1 — Production frame telemetry

Kapsam yalnızca üç 3D sahnenin ölçüm amaçlı kare telemetry'sidir. Başlangıçta çalışma ağacı temizdi. Modeller, DPR, materyaller, shader, ışık, kamera, GSAP, ilk etkileşim politikası, GPU hazırlığı ve Canvas yaşam döngüsü değiştirilmedi.

## Uygulama

- `lib/measurement-mode.ts`: canlı `window.location.search` değerini kontrol eder; query değiştiğinde `URLSearchParams.get('measure') === '1'` ile ayrıştırıp sonucu önbelleğe alır. Kare başına URL ayrıştırması yoktur. `pushState`, `replaceState` ve geçmiş navigasyonu bir sonraki çizimde dikkate alınır. Ölçüm kapanınca önceden yazılmış alanlar sabit kalabilir; normal ilk ziyarette oluşmazlar.
- `components/ProcessorModel.tsx`: frame, kamera, katman, assembly, renderer kaynakları, model ve contacts DOM yazımları ölçüm moduna bağlandı. Renderer istatistiği microtask'i yalnızca bu modda oluşturulur; çalışmadan önce mod tekrar kontrol edilir. `publishHeroProjection` aynı açık ölçüm modunda kalır; `measure=10` artık yanlışlıkla etkinleştirmez. Development poster yakalama özelliği korundu.
- `components/HardwareScene.tsx`: yaw, part, explosion, flowFrame, hardwareFrame, camera ve DataRoutes hardwareFlow yazımları ölçüm moduna bağlandı.
- `components/IndustrialVisionScene.tsx`: tüm Canvas vision telemetry alanları ve `JSON.stringify(current.products.map(...))` ölçüm moduna bağlandı. Ürün/aktüatör/bant animasyon hesapları çalışmaya devam eder.

İç frame sayaçları gerçek çizimleri saymaya devam eder; mod açılınca sayaçların anlamı değişmez. `sceneReady`, `prepareMs`, görünürlük, fallback, context-loss ve `hardwareIntro` geçiş sinyalleri korundu. UI/simülasyon bölüm durumları değiştirilmedi. Yeni telemetry verisi veya sunucu/ortam bilgisi dışa aktarılmıyor.

## QA değişiklikleri

`scripts/measurement-url.mjs`, mevcut query ve hash'i koruyarak `measure=1` ekler. Telemetry tüketen şu scriptlerin `goto` çağrıları güncellendi:

- `performance-audit.mjs`, `interactive-qa.mjs`, `startup-readiness-qa.mjs`, `vision-qa.mjs`
- `processor-qa.mjs`, `hero-resources-qa.mjs`, `startup-performance.mjs`
- `visual-qa.mjs`, `creative-qa.mjs`, `diagnostics-qa.mjs`
- `record-creative.mjs`, `record-processor.mjs`, `scroll-recording.mjs`, `bake-hero-posters.mjs`

Logo uygulamada query'yi bilerek temizler. Performans audit'inde test ortamına özel history sarmalayıcısı istemci navigasyonlarında ölçüm parametresini korur; URL beklentileri bu açık moda göre güncellendi. Diğer scriptlerde reload ve geri dönüş aynı ölçüm URL'sini korur. Assertion kaldırılmadı veya gevşetilmedi.

`hero-finale-qa.mjs`, `hero-polish-qa.mjs`, `hero-polish-evidence.mjs` zaten `measure=1` kullanıyor. `industrial-premium-qa.mjs` güvenlik SVG/UI durumlarını kullanıyor; kapatılan Canvas telemetry'sine bağımlı olmadığı için değiştirilmedi.

Yeni `tests/measurement-mode.test.ts` kesin eşleşmeyi, SSR güvenliğini, query değişimini ve 100 çağrıda tek ayrıştırmayı kontrol eder. Yeni `scripts/telemetry-mode-qa.mjs` aynı production sunucusunda normal/açık ölçüm davranışını, canlı query değişikliklerini ve fallback durumlarını doğrular.

## Doğrulama

Production sunucusu: `node node_modules/next/dist/bin/next start --port 3100`. Testlerde `TEST_BASE_URL=http://localhost:3100`. GPU, readiness raporuna göre ANGLE/Vulkan/SwiftShader yazılımsal renderer.

- `npx tsc --noEmit`: başarılı. Yeni testteki URLSearchParams mock constructor tipi düzeltilip kontrol tekrar geçirildi.
- `npm run lint`: başarılı.
- `npm run build`: başarılı; tüm sayfalar üretildi.
- `npm test`: 27 test başarılı.
- `node scripts/startup-readiness-qa.mjs`: başarılı; 393/320 px bekleyen modelin gizliliği, etkileşim öncesi Hero yüklenmemesi, offscreen duruş, aynı Hardware Canvas ile dönüş, erken scroll, masaüstü ileri/geri kamera sekansı, idle, route back, resize ve reduced-motion dönüşü.
- `node scripts/telemetry-mode-qa.mjs`: genişletilmiş tekrar başarılı; dört query senaryosu, canlı pushState/replaceState/geçmiş değişimleri, reload ve iletişim sayfasından geri dönüş, normal modda WebGL-unavailable, gerçek context-loss ve reduced-motion fallback kontrolleri geçti. Rapor ve görseller: `%TEMP%/c2c-telemetry-mode-final/`.
- `node scripts/performance-audit.mjs`: başarılı; 1440 ve 393 px ilk ziyaret/reload, Hero kamera ilerlemesi ve logo ile sıfırlama, Hardware GPU seçimi/ayırma, güvenlik uyarısı, Industrial frame/zaman alanları, iletişim/ana sayfa navigasyonu ve 7 alt sayfanın iki genişlikte kontrolü tamamlandı. Runtime hata listesi boş. Ölçüm modu istemci navigasyonlarında korundu. Ham sonuç: `%TEMP%/c2c-telemetry-audit/audit.json`.
- `QA_WIDTH=1440 node scripts/interactive-qa.mjs`: başarısız. Hardware seçim/ayırma/akış/raycast/pause kontrollerini geçtikten sonra mevcut 68. satırdaki `#kamera-deneyimi` sayısının sıfır olması beklentisinde durdu (gerçek: 1). Aynı assertion HEAD'de de var; değiştirilmeyen `app/page.tsx` bu bölümü render ediyor. Bu beklenti kaldırılmadı ve sayfa değiştirilmedi.
- `node scripts/vision-qa.mjs`: başarısız. Masaüstü capture, kusur işareti, ürün kimliği ve pause kontrolleri geçti; 35. satırdaki 9.98 simülasyon saniyesini bekleme 35000 ms timeout'una takıldı. Browser runtime hatası kaydedilmedi. Neden kesinleştirilmedi; başarılı sayılmadı ve timeout gevşetilmedi.

Son hedefli production karşılaştırmasında `/`, `?measure=0`, `?measure=10`, `?measure=1` senaryolarının tamamı geçti. Üç kapalı senaryoda Canvas frame telemetry alanları yoktu; renderer telemetry microtask ve ürün JSON serileştirme sayıları 0/0 idi. Açık mod örneğinde 10 renderer microtask'i, 11 ürün serileştirmesi görüldü; üç sahnenin tüm eski ölçüm alanları mevcuttu. Bunlar senaryoya bağlı işlem sayılarıdır, performans yüzdeleri değildir. Mod kapatılınca telemetry sabit kalırken simülasyon saati ilerledi.

Normal Hero'nun kapalı/açık katman pozları gözle incelendi. Kapalı Hero pozunun normal ve açık ölçüm modu PNG SHA-256 değerleri aynı: `75A82162F914C8D34505B7403FF8BD59F75EACB77C41C3DC8995089BD071F5DC`. Bu yalnızca örneklenen pozun eşitliğini gösterir. Geometri ve görsel ayarlar kaynak diff'inde korunuyor. Önceki audit ile eş koşullarda zamanlama karşılaştırması yapılmadı; FPS, GPU veya gerçek telefon kazanımı iddia edilmiyor.

Tüm-site visual/creative/diagnostics, processor, resource, kayıt ve poster üretim scriptleri çalıştırılmadı; URL uyarlamaları kod incelemesiyle kontrol edildi. Önceki audit dosyaları değiştirilmedi.

Test hatalarında commit oluşturmama talimatı gereği commit/push yapılmadı.
