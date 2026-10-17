# P1.1 — İki QA hatasının HEAD karşılaştırması

İlk bölümler test uyarlamasından önceki incelemenin tarihsel kaydıdır. Son bölüm, sonradan yetkilendirilen QA düzeltmelerini ve yeniden doğrulamayı açıklar.

## İzolasyon ve yöntem

Referans: `HEAD = ebc30c374bb715fde417814c1428c3407d81caa3` (`master`). Orijinal çalışma dizinindeki mevcut P1.1 değişikliklerine dokunulmadı. İnceleme öncesi değiştirilmiş/takipsiz dosyaların SHA-256 manifesti alındı; inceleme sırasında bu dosyaların hiçbirinin içeriği değişmedi.

Geçici, detached worktree: `C:/Users/hdgn5/AppData/Local/Temp/c2c-p11-investigation-e4560e07/head`. Bağımlılıklar mevcut kurulumdan bu dizine kopyalandı. Kopya tamamlandıktan sonra `npm run build` başarılı oldu; HEAD çalışma ağacı temiz kaldı. HEAD production sunucusu 3101, mevcut P1.1 production sunucusu 3100 portunda çalıştırıldı. Tarayıcı testleri aynı Chrome kanalı ve aynı viewport ayarlarıyla, sırayla çalıştırıldı.

`interactive-qa` doğrudan mevcut scriptlerle `QA_WIDTH=1440` kullanılarak tekrarlandı. `vision-qa` için gerçek scriptler değişmeden çalıştırıldı; geçici bir Node preload'u yalnızca tanılama kaydı ekledi. Bu kayıt her 500 ms'de bölümün saati, çalışma durumu, Canvas varlığı, scroll/viewport ve bölüm koordinatlarını okur; assertion, timeout, simülasyon veya renderer ayarlarını değiştirmez.

## Sonuç matrisi

| Test | HEAD production | P1.1 production | Sınıflandırma |
|---|---|---|---|
| `interactive-qa` | 67. satırda `1 !== 0` | 68. satırda `1 !== 0` | Önceden var olan / güncelliğini kaybetmiş test beklentisi |
| `vision-qa` | 34. satırda 9.98 sn bekleyişi, 35000 ms timeout | 35. satırda aynı bekleyiş ve aynı timeout | Önceden var olan kararsız test: resize/scroll/layout eşzamanlama yarışı |

Her iki hata P1.1 öncesindeki gerçek production build'de de tekrarlandı. Bu iki hata için telemetry regresyonu saptanmadı. İki tam script de başarısızdır; ilk hatada durdukları için sonraki test adımları başarılı sayılmamıştır.

## 1. Kamera assertion'ı

`scripts/interactive-qa.mjs:68` aşağıdaki beklentiyi taşır:

```js
assert.equal(await page.locator('#kamera-deneyimi').count(),0,'redundant camera demo is removed');
```

Ancak `app/page.tsx:26` HEAD'de de `<IndustrialVisionDemo />` render eder; bileşen `components/IndustrialVisionDemo.tsx:64` üzerinden `id="kamera-deneyimi"` bölümünü üretir. Gerçek sayı iki sürümde de 1'dir. Testin bölümün kaldırıldığı varsayımı mevcut sayfayla uyuşmuyor. Telemetry alanlarının kapatılması bir DOM bölümünü eklemiyor veya kaldırmıyor.

Her iki tekrar da bu assertion'a kadar Hardware kontrollerini geçti; browser hata listeleri boştu. Assertion kaldırılmadı, beklenti değiştirilmedi ve bölüm silinmedi.

## 2. Vision timeout'u

Beklenen saat, Canvas `data-vision-time` alanı değil, `#kamera-deneyimi` bölümünün UI/simülasyon `data-vision-time` alanıdır. Bu bölüm ve simülasyon döngüsü P1.1'de değiştirilmemiştir.

Nedensel zincir:

1. Script 5.8 sn'ye ulaşır ve simülasyonu duraklatır. Capture, ürün kimliği, kusur işareti ve pause kontrolleri iki sürümde de geçer.
2. `fullShot()` ekran görüntüsü almak için viewport'u `1440×1050` → `1440×1425` → `1440×1050` değiştirir (`scripts/vision-qa.mjs:16–21`).
3. Son viewport değişiminden hemen sonra `focus()` scroll konumunu hesaplar. Script, resize sonrası ScrollTrigger pin ölçülerinin yerleşmesini beklemiyor. `canvas[data-vision-time]` varlığı, sayfa yerleşiminin tamamlandığını kanıtlamaz.
4. Üstteki viewport'a bağlı pin alanları yenilenince bölümün belge konumu yaklaşık 3525 px değişir. Scroll eski konumda kalır: `scrollY=15773`, bölüm üst kenarı `-3405.25 px`, görünür oran 0.
5. `lib/use-activity.ts:9–11` görünmezliği bildirir. `components/IndustrialVisionDemo.tsx:35` simülasyon rAF döngüsünü durdurur; 82. satır görünmez Canvas'ı kaldırır. Bu, mevcut offscreen davranışıdır.
6. UI'de playing niyeti sürer (`Duraklat` düğmesi), ama etkin çalışma `false` olur. Saat ilerleyemediği için 9.98 sn beklentisi timeout'a gider. Timeout'u uzatmak görünürlük sorununu çözmez.

Timeout sonundaki ölçümler:

| Alan | HEAD | P1.1 |
|---|---:|---:|
| UI simülasyon zamanı | 6.127 sn | 6.104 sn |
| `visionRunning` | false | false |
| Canvas bağlı mı? | hayır | hayır |
| Bölüm üst kenarı | -3405.25 px | -3405.25 px |
| Scroll konumu | 15773 px | 15773 px |
| `document.hidden` | false | false |

Bu tekrarlarda neden düşük FPS veya eksik telemetry değildir; test, görünmezlik nedeniyle askıya alınmış bir simülasyonun ilerlemesini beklemektedir. Resize ve pin refresh zamanlaması testin davranışını etkiler.

Ek nedensellik kontrolünde mevcut script ayrı bir kez daha çalıştırıldı. Orijinal 35000 ms timeout'u oluştuktan sonra tanılama preload'u yalnızca bölüme geri scroll etti; saat veya playing state elle değiştirilmedi. Aynı 9.98 sn koşulu 3932 ms içinde sağlandı: UI saati `10.062`, `visionRunning=true`, aktüatör `P-0002`. Sonra orijinal timeout hatası tekrar fırlatıldı; bu deney tam test başarısı olarak sayılmadı. Kayıt: `current-vision-recovery/trace.json`. Bu kontrol, görünmezlik nedeniyle durmanın ve görünür olunca devam etmenin neden zincirini destekler.

`app/page.tsx`, `IndustrialVisionDemo.tsx`, `use-activity.ts`, `use-scroll-layout.ts`, `vision-simulation.ts` ve `industrial-vision.css` dosyalarının HEAD ve mevcut çalışma dizini SHA-256 değerleri birebir aynıdır.

## Değişiklik ve kapsam

P1.1 kaynaklı gerçek bir hata saptanmadığından uygulama veya QA scriptlerinde yeni düzeltme yapılmadı. Bu incelemenin depodaki tek yeni dosyası bu rapordur. Assertion'lar, timeout'lar, DPR, 3D tasarım, animasyonlar, görünürlük ve Canvas yaşam döngüsü değiştirilmedi. Commit veya push oluşturulmadı.

Ham kanıt dizini: `C:/Users/hdgn5/AppData/Local/Temp/c2c-p11-investigation-e4560e07/`. `comparison.json`, `head-interactive/browser-report.json`, `current-interactive/browser-report.json`, `head-vision/trace.json` ve `current-vision/trace.json` karşılaştırmayı içerir. Geçici HEAD worktree'si inceleme için korundu.

## Yetkilendirilen QA uyarlaması

Uygulama kaynakları değiştirilmeden yalnızca şu QA dosyaları güncellendi:

- `scripts/interactive-qa.mjs`: eski bölüm-yok beklentisi yerine tek kamera bölümü, başlık, görünür Canvas, etkin başlatma düğmesi, UI/Canvas saatlerinin ilerlemesi, pozitif draw call, tutarlı pause, bekleme sırasında sabit durum ve reset kontrolleri eklendi. Bu kontroller dört viewport'un tamamında çalışır.
- `scripts/vision-qa.mjs`: screenshot viewport değişimlerinde ortak yerleşim bekleme yardımcısı kullanılır. Zaman bekleyişi artık görünür Canvas, doğal `visionRunning=true` ve hem UI hem Canvas saatinin hedefe ulaşmasını gerektirir. 35000 ms timeout korunur; diğer tüm assertion'lar korunur.
- `scripts/vision-qa-helpers.mjs`: viewport değişince fontları, bölüm geometrisini, scroll konumunu ve pin spacer ölçü/style'larını gözler. Kurulu GSAP'ın 200 ms resize debounce süresinin ardından 300 ms sabit geometri ister, sonra sahneye scroll edip görünür Canvas'ı bekler. Böylece mobilde bilerek yok sayılan yükseklik resize'larında orantılı pin değişimi zorlanmaz. `ScrollTrigger.refresh()` çağrılmaz; simülasyon saati veya görünürlük state'i elle değiştirilmez.

Production build üzerinde son QA sonuçları:

| Kontrol | Sonuç |
|---|---|
| `npm run build` | Başarılı |
| `npx tsc --noEmit` | Başarılı |
| `npm run lint` | Başarılı |
| `npm test` | 27/27 başarılı |
| `node scripts/interactive-qa.mjs` | Başarılı: 375, 768, 1440, 1920 px; tüm mevcut kontroller, yeni kamera kontrolleri, reduced-motion, WebGL fallback ve gerçek context-loss |
| `node scripts/vision-qa.mjs` | Başarılı: masaüstü, 393/320 px mobil, tüm kusur senaryoları, capture/pause/reset, kamera detay görünümü, offscreen/tab-hidden durma-dönüş, reduced-motion |
| `node scripts/telemetry-mode-qa.mjs` | Başarılı: `/`, `measure=0`, `measure=10`, `measure=1`, canlı query değişimi, reload/route back ve fallback kontrolleri |

Interactive ve Vision raporlarında browser hata listeleri boş. Ham sonuçlar `%TEMP%/c2c-p11-final-interactive/browser-report.json` ve `%TEMP%/c2c-p11-final-vision/report.json` dosyalarında. Bu aşamada 3D sahneler, DPR, animasyonlar, ScrollTrigger ve warmup uygulama kodları değiştirilmedi.

Telemetry tekrarının hata listesi de boş; rapor `%TEMP%/c2c-p11-final-telemetry/telemetry.json` dosyasındadır. Normal ziyaret ve kapalı modlarda frame telemetry alanları oluşmadı; renderer telemetry microtask'leri ve ürün JSON serileştirmeleri sıfırdı. Açık modda tüm üç sahnenin ölçüm alanları çalıştı. Yerel perf commit'i `fdc2bd0` olarak oluşturuldu; QA uyarlamaları ayrı commit'e ayrıldı. GitHub'a push yapılmadı.
