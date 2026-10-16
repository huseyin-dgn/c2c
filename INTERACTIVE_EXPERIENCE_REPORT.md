# C2C Mühendislik — İnteraktif Deneyim Raporu

Tarih: 16 Ekim 2026. Mevcut proje üzerinde çalışıldı; proje yeniden kurulmadı. Başlangıç sürümünün güvenli Git geri dönüş noktası **`cce4bbf`**. Kullanıcı dosyaları silinmedi; kişisel Chrome oturumu kullanılmadı. Testler ayrı Playwright Chrome profilleriyle çalıştı.

**Sonuç:** İşlevsel tarayıcı testleri, TypeScript, lint, 13 birim testi ve production build geçti. Masaüstü Lighthouse hedefi geçti. **Mobil Lighthouse hedefi ve fotogerçekçi donanım varlığı hedefi karşılanmadı.** Bu iki konu tamamlanmış gibi sunulmuyor.

- Geliştirme: http://localhost:3000
- Teşhis: http://localhost:3000/?debug=1 — yalnızca development ortamında.
- Production test sunucusu: http://localhost:3100
- [Görsel galeri ve video](artifacts/interactive/index.html)

## Uygulanan deneyim

Ana sayfa sırası: mevcut cinematic Hero → bağımsız ekip / hakkımızda → donanım keşfi → kamera demonstrasyonu → beş çözüm vitrini → problemden çözüme anlatım → çalışma süreci → iletişim CTA. Tekrarlanan ana sayfa yetkinlik, senaryo ve teknik yaklaşım alanları bu anlatımlarda birleştirildi. Alt sayfalar ve gerçek GitHub çalışma rotaları korundu. Sabit üst menüde iletişim bağlantısı bulunur.

### Donanım keşfi

Yedi kategori; anakart, CPU, GPU, RAM, M.2 SSD, soğutma, güç/I/O. Anakart üzerinde soket, PCIe ve DIMM yuvaları, devre yolları, montaj elemanları ve güç bağlantıları bulunur. CPU ile soğutucu aynı montaj eksenindedir; GPU PCIe konumunda, RAM DIMM yuvalarında, SSD kartın M.2 bölgesindedir. Yerleşim belirli bir üreticinin ölçülendirilmiş CAD modeli değildir.

Mesh raycast hover/click, HTML parça düğmeleriyle dokunma ve klavye seçimi, kamera yaklaşması, diğer parçaların renk/yansıma yoğunluğunu azaltma, seçim sıfırlama ve GSAP ayrılma/birleşme uygulanmıştır. Montajın yatay eksenleri korunur; parçalar kendi dikey montaj ekseninde ayrılır. CPU soğutucunun altında kalır; katmanları görmek için **Parçaları Keşfet** kullanılabilir.

Her parçanın gerçek donanım görevi ve C2C yaklaşımıyla bağlantısı ayrı açıklanır. CPU sıralı işlem, GPU paralel kanallar, RAM bellek bankaları, SSD çift yönlü okuma/yazma, anakart veri yolları, soğutma fan/hava hareketi ve I/O dış bağlantı akışı üretir. Kullanıcı akışı duraklatabilir. Reduced-motion durumunda bilgi ve seçimler korunarak SVG görünüm kullanılır. Ekrandan çıkan donanım Canvas'ı kaldırılır.

### Kamera demonstrasyonu

Dört özgün SVG sahnesi: alan ihlali, kişi/araç sayımı, ekipman kontrolü, üretim kusuru. Nesne konumu, takip işaretleri, olay eşiği ve sayaç aynı `demoFrame` durumundan türetilir. Sayımda merkez çizgiyi geçtiğinde kişi ve araç ayrı olarak bir kez sayılır; geri sarma sayaçları da geri alır. Kusur işareti hareket eden kusurlu ürüne bağlıdır.

Oynat/duraklat/tekrar oynat, senaryo seçimi ve elle ilerleme çubuğu vardır. Oynatma başlangıçta kapalıdır; bölüm görünmez olduğunda durur. **Temsili Teknoloji Demonstrasyonu** etiketi görünürdür. Sahne örnek çizimdir; gerçek video, AI çıkarımı, kamera erişimi veya müşteri doğruluk sonucu değildir.

### Scroll ve SVG sistemi

`SolutionsShowcase` masaüstünde GSAP pin/scrub ile beş tam ekran kompozisyonu yatay ilerletir. Her çözümde problem, geliştirilebilecek çözüm, teknik yaklaşım, diyagram ve ilgili form alanını seçen CTA vardır. Mobil/tablet ve reduced-motion durumunda beş çözüm dikey okunur. Vitrini geç bağlantısı ve doğrudan aşama kontrolleri bulunur.

`ProblemStory` tek kamera görselinde kamera → analiz → olay → kural → bildirim/entegrasyon aşamalarını gösterir. Kişi ve alttaki sinyal scroll ilerlemesine bağlı hareket eder; metin ve işaretler aynı aşamayı izler. Ters scroll desteklenir. Mobil ve reduced-motion durumunda beş aşama düğmeyle seçilir. Örnek Mühendislik Senaryosu etiketi korunur.

`SystemDiagram` beş topolojiyi destekler. Scroll ile bağlantı çizimi, çizim tamamlandıktan sonra sinyal hareketi, endüstriyel tarama ve işlem katmanı vurguları vardır. Görünmeyen diyagramların ticker'ı durur. Düğümler pointer ile, eşdeğer HTML kontrolleri klavye ve dokunmayla seçilir. Minik SVG etiketleri yerine okunabilir HTML açıklamaları kullanılır. Görünmeyen çizimlerin başlangıçta GSAP zaman çizelgesi kurması önlenmiştir.

### Hakkımızda ve form

Ana mesaj “Teknolojiden önce problemi anlıyoruz.” Ekip iki kişilik bağımsız mühendislik ekibi olarak anlatılır. İlker Akbal ve Hüseyin Doğan'ın kullanıcı tarafından verilen üniversite ve GitHub bilgileri korunur; profil kartları yerine editorial satırlar kullanılır. Sahte şirket, ofis, müşteri, sertifika veya başarı sayısı eklenmedi.

Form sırası çözüm alanı → alana göre yardımcı soru/problem özeti → iletişim bilgileri olarak değişti. Sunucu alan adları, doğrulama, honeypot, zaman kontrolü, Origin kontrolü, boyut sınırı, Redis hız sınırı ve KVKK etkinleştirme kapısı korunmuştur. **Gerçek sağlayıcı ve onaylı aydınlatma yapılandırılmadığından gönderim kapalıdır; API 503 döner ve sahte başarı gösterilmez.**

## Değiştirilen dosyalar ve varlıklar

| Dosya / grup | Değişiklik |
| --- | --- |
| `app/page.tsx`, `app/hakkimizda/page.tsx` | Yeni ana sayfa akışı; ekip tekrarının kaldırılması |
| `app/layout.tsx`, `app/fonts.css`, `app/interactive.css` | Tasarım, responsive kurallar, yerel font ön yükleme, sabit CTA |
| `components/HardwareExperience.tsx`, `HardwareScene.tsx`, `HardwareFallback.tsx` | Donanım, seçim, PBR materyaller, GSAP montaj, Canvas/fallback |
| `components/CameraDemo.tsx`, `CameraFrame.tsx` | Dört senaryo, senkron işaretler, oynatma/ilerleme |
| `components/SolutionsShowcase.tsx`, `ProblemStory.tsx` | Yatay çözüm vitrini ve beş aşamalı tek görsel anlatı |
| `components/SystemDiagram.tsx` | Canlı SVG çizim, sinyal, tarama, düğüm seçimi |
| `components/AboutSection.tsx`, `ContactForm.tsx` | Editorial ekip anlatımı, aşamalı form ve yardımcı sorular |
| `components/EngineeringScene.tsx` | Mevcut Hero geometrisinin önceden üretilmiş yüklemesi, ortak stüdyo dokusu, asenkron shader hazırlığı |
| `components/Story.tsx`, `SiteHeader.tsx` | Görünür metin/erişilebilir ad uyumu; ortak scroll refresh isteği |
| `lib/hardware.ts`, `camera-demo.ts`, `solution-showcase.ts` | Teknik içerik, montaj koordinatları, geometriden türeyen demo durumları |
| `lib/use-activity.ts`, `use-scroll-layout.ts` | Görünürlük/hareket tercihi; değişen bölüm boyutlarında toplu scroll ölçümü |
| `public/models/` | Özgün Hero geometri verisi, stüdyo yansıması, manifest ve Three.js lisansı |
| `public/fonts/` | Değiştirilmemiş Inter Latin/Latin Extended dosyaları ve SIL OFL lisansı |
| `scripts/bake-core-geometry.mjs`, `bake-studio.mjs` | Yerel varlık üreticileri; dışarıdan model veya medya indirmez |
| `scripts/interactive-qa.mjs`, `create-interactive-gallery.mjs` | Yeni etkileşim testleri ve kanıt galerisi |
| Mevcut `visual-qa`, `diagnostics-qa`, `creative-qa`, `record-creative`, `http-smoke` | Yeni bölüm mimarisine uygun kapsam, Hero Canvas/pin seçicileri, varlık doğrulaması ve kayıt |
| `tests/interactive-models.test.ts`, `eslint.config.mjs`, `package.json`, `README.md` | Davranış testleri, test komutu ve dokümantasyon |

`app/api/contact/route.ts`, `lib/contact.ts`, `lib/contact-validation.ts`, `lib/privacy.ts` başlangıç hash'leriyle aynıdır. `lib/core-motion.ts` ve gerçek proje içerikleri değiştirilmedi. Uygulama bağımlılığı eklenmedi.

## Test kanıtları

| Kontrol | Sonuç / kanıt |
| --- | --- |
| `npm run typecheck` | PASS — 0 TypeScript hatası |
| `npm run lint` | PASS — 0 hata, 0 uyarı |
| `npm test` | PASS — 13/13; sunucu doğrulaması, bot kontrolleri, kapalı gönderim, Hero sürekliliği/sınırları, sayım/olay eşikleri, montaj eksenleri |
| `npm run build` | PASS — Next.js 16.4.2 production derlemesi ve 17 sayfa/varlık üretimi |
| `npm run test:http` | PASS — 10 rota, iç bağlantılar/anchor, metadata, 2 font varlığı, SSR fallback, API 503/405, olmayan proje 404, SEO varlıkları |
| `npm run test:interactive` — production | PASS — [4 genişlikte gerçek etkileşim raporu](artifacts/interactive/production/browser-report.json) |
| `npm run test:visual` — production | PASS — [Hero ileri/geri, piksel farkı, 9 alt rota × 4 genişlik, menü, klavye, fallback](artifacts/interactive/hero/browser-report.json) |
| `npm run test:creative` — production | PASS — [4 genişlikte editorial hareket, runtime reduced-motion ve JavaScript kapalı içerik](artifacts/interactive/editorial/report.json) |
| `npm run test:diagnostics` — development | PASS — [gerçek panel, 5 konum, iptal, hata ve context kaybı](artifacts/interactive/diagnostics/report.json) |
| Production `?debug=1` | PASS — [normal ve debug URL'de panel bulunmuyor](artifacts/interactive/production-debug/report.json) |
| `node scripts/design-audit.mjs` | PASS — 4 backend/güvenlik dosyası değişmedi; 81 renk denetlendi |
| Gerçek tarayıcı videosu / galeri | PASS — 51 görüntü, 1440×900 boyutunda 32.12 s WebM; [metadata](artifacts/interactive/recording/metadata.json), yerel galeride oynatma metadata'sı ve hata dizisi doğrulandı |

Normal kullanımda iki kapsamlı tarayıcı raporunun hata dizileri boştur. WebGL engelleme, `WEBGL_lose_context` ve JavaScript hata olayları ayrı test bağlamlarında bilinçli üretildi; beklenen hata/fallback davranışı olarak doğrulandı.

## Responsive ve erişilebilirlik

| Viewport | Donanım / kamera | Scroll alternatifi | Yatay taşma |
| --- | --- | --- | --- |
| 375 × 812 | 7 parça, 4 senaryo, touch, klavye, oynatma PASS | Dikey vitrin, elle 5 problem aşaması PASS | 0 px |
| 768 × 1024 | 7 parça, 4 senaryo, touch, klavye, oynatma PASS | Dikey vitrin, elle 5 problem aşaması PASS | 0 px |
| 1440 × 900 | 7 parça, mesh üzerinden GPU seçimi, klavye, 4 senaryo PASS | Yatay 5 çözüm + 5 problem aşaması, ters scroll PASS | 0 px |
| 1920 × 1080 | 7 parça, mesh üzerinden GPU seçimi, klavye, 4 senaryo PASS | Yatay 5 çözüm + 5 problem aşaması, ters scroll PASS | 0 px |

Klavye Enter/Space, doğal button/select/range kontrolleri, görünür odak, canlı açıklamalar, mobil menü Escape davranışı ve sayfa geçiş temizliği test edildi. Reduced-motion hem başlangıçta hem çalışma sırasında değiştirildi; Canvas/pin kaldırılırken içerik ve elle seçim korundu. Gerçek WebGL başlatma reddi ve iki sahnenin context kaybı yedek görünümle sonuçlandı. Tam kapsamlı WCAG denetimi veya ekran okuyucu sertifikasyonu yapılmadı.

## Lighthouse ve performans

Lighthouse **12.8.2**, Chrome **155.0.8059.80**, yerel production `localhost:3100`; masaüstü preset ve varsayılan simülasyonlu mobil profil. Bunlar fiziksel telefonda saha ölçümü değildir. Son ölçümler kullanılmıştır; önceki denemeler aynı klasörde ayrı dosyalar halinde durur.

| Profil | Performance | Accessibility | Best Practices | LCP | TBT | Hedef durumu |
| --- | ---: | ---: | ---: | --- | --- | --- |
| [Masaüstü](artifacts/interactive/lighthouse/desktop-verified.report.html) | 97 | 100 | 100 | 1.3 s | 10 ms | PASS: ≥95 / ≥95 / ≥95 |
| [Mobil](artifacts/interactive/lighthouse/mobile-verified.report.html) | 57 | 100 | 100 | 6.3 s | 810 ms | **FAIL: Performance ≥85 karşılanmadı**; diğer ikisi PASS |

İlk ölçüm masaüstü 88 / mobil 50 idi. Runtime PMREM hesabı önceden üretilmiş yaklaşık 92 KB stüdyo varlığına taşındı. Hero'nun aynı plaka geometrisi önceden üretildi: JSON 1,378,196 bayt, gzip yaklaşık 91,665 bayt; production sunucusunda gzip başlığı doğrulandı. Shader programları `compileAsync` ile hazırlanır. Görünmeyen donanım kaldırılır, diyagram tick'leri durur; mobil DPR ve küçük bileşen sayısı azaltılır. Fontlar yereldir; optional gösterim yavaş yüklemede sistem fontunu kullanabilir.

Mobil açılış maliyeti hâlâ yüksektir. Çalışan Hero korunarak yapılan bu iyileştirmeler mobil hedefe ulaşmaya yetmedi. İstemci başlangıcı/3D yükleme kritik yolu sonraki performans çalışmasıdır; bu rapor mobil hedefi geçtiğini iddia etmez. Fiziksel mobil FPS, uzun süreli RAM/VRAM profili ve Safari/Firefox ölçümü **NOT TESTED**.

## Kabul matrisi

| Kriter | Durum | Kanıt / sınır |
| --- | --- | --- |
| Güvenli başlangıç commit'i | PASS | `cce4bbf` |
| Production build | PASS | Son Next build başarılı |
| TypeScript 0 hata | PASS | Son typecheck |
| ESLint 0 hata | PASS | Son lint, uyarı da yok |
| Kritik normal konsol hatası 0 | PASS | İki browser raporunun hata dizileri boş |
| Bozuk iç bağlantı 0 | PASS | 10 rota + fragment/metadata/varlık HTTP kontrolü |
| Mevcut Hero ileri/geri korunması | PASS | 5 konum, kamera/ayrılma/birleşme ve piksel farkı testi |
| En az 7 donanım kategorisi | PASS | Her genişlikte 7 seçim |
| Tüm parçaların seçilebilirliği | PASS | 7 düğme + masaüstünde gerçek mesh raycast/click |
| Hover vurgusu, kamera ve açıklama | PASS | Render edilen seçim/kamera durumu; görsel inceleme |
| En az 5 parçaya özel animasyon | PASS | 7 parçanın gerçek `useFrame` akışı ilerliyor; hareket kodları farklı |
| Exploded View | PASS | Canvas ayrılma değeri 1'e ulaşıyor; ekran görüntüsü |
| Yeniden birleştirme | PASS | Aynı değer 0'a dönüyor |
| Mobil dokunma | PASS | 375/768 touch bağlamı |
| Klavye etkileşimi | PASS | Donanım Enter, SVG Space, süreç ok tuşları, menü Escape |
| Gerçek donanım görevi / metafor ayrımı | PASS | Ayrı başlıklı açıklamalar; içerik incelemesi |
| Fotogerçekçi / high-fidelity üretim varlığı | **FAIL** | Özgün stilize prosedürel model var; fotogerçekçi GLB/CAD varlığı ve malzeme/doku seti yok |
| 4 kamera senaryosu | PASS | Her genişlikte dört görsel/durum |
| Senaryo değişiminde görsel değişimi | PASS | Senaryo SVG'si ve olay durumu değişiyor |
| Play/Pause/Replay | PASS | Gerçek ilerleme artışı, durunca sabit değer, yeniden başlama |
| Tespit işaretleri senkronizasyonu | PASS | Geometriden türeyen eşikler + hareket eden ürüne bağlı işaret |
| Temsili demo etiketi | PASS | Kalıcı görünür etiket; AI/başarı iddiası yok |
| 5 çözüm | PASS | Beş article, ayrı içerik ve iletişim bağlantısı |
| Scroll ile yatay hareket | PASS | Beş gerçek transform konumu ve pin koordinatı |
| Yatay reverse scroll | PASS | İleri/geri aynı transform |
| Mobil alternatif | PASS | Dikey 5 çözüm, bu bölümde pin yok |
| Problem anlatımı 5 aşama | PASS | Masaüstü scroll; mobil/reduced düğmeler |
| Metin/görsel senkronizasyonu | PASS | Aynı phase'den metin, analiz, olay, kural ve bildirim |
| Problem anlatımı reverse | PASS | İleri/geri aşama ve işaret durumu eşit |
| En az 3 animasyonlu diyagram | PASS | Beş görünür diyagramda gerçek akış sayacı ilerliyor |
| Scroll sırasında bağlantı çizimi | PASS | Stroke offset kısmi → 0 → aynı kısmi değere dönüyor |
| Tamamlanan diyagramda sürekli akış | PASS | Scroll sabitken çizim sonrası frame değeri ilerliyor |
| Görünmeyen diyagramın durması | PASS | Ekran dışı frame değeri sabit |
| En az 3 farklı hareket davranışı | PASS | Hat sinyalleri; endüstriyel tarayıcı; farklı faz/hızlarda işlem katmanı vurguları |
| Mobil diyagram okunabilirliği | PASS | HTML başlık/açıklama, 44 px kontroller; 375/768 görsel inceleme |
| Form çözüm seçimi | PASS | Query seçimi ve kullanıcı değişimi |
| Yardımcı metin değişimi | PASS | Görüntü işleme → yapay zekâ geçişi tarayıcıda doğrulandı |
| Geçersiz veri reddi | PASS | `checkValidity=false` ve sunucu doğrulama testleri |
| Backend güvenliği korunması | PASS | Dört dosyanın başlangıç hash'i aynı |
| Yapılandırılmamış gönderimde sahte başarı yok | PASS | Disabled form, API 503 |
| Gerçek Resend/Redis teslim ve hız sınırı entegrasyonu | NOT TESTED | Sağlayıcı / onaylı aydınlatma yapılandırılmadı |
| Editorial ekip anlatımı / gerçek bağlantılar | PASS | İki isim/mezuniyet/GitHub; sahte müşteri/şirket iddiası eklenmedi |
| Sürekli CTA ve scroll çıkışı | PASS | Sabit header, ilgili form linkleri, vitrini/senaryoyu geç bağlantıları |
| Development + debug=1 panel kapısı | PASS | Development normal URL'de yok; production debug URL'de yok |
| Panel gerçek runtime verisi / 5 konum düğmesi | PASS | Beş farklı gerçek kamera durumu, hata enjeksiyonu, reduced ve context kaybı |
| Reduced-motion bilgi koruması | PASS | 5 çözüm, 7 donanım açıklaması, elle demo/aşama seçimi |
| WebGL fallback | PASS | Gerçek context reddi ve loss olayı; seçim/metin erişimi korunuyor |
| 375 / 768 / 1440 / 1920 responsive | PASS | Taşma 0; ekran görüntüleri |
| GSAP/listener/Canvas temizliği | PASS | Cleanup kodu, rota dönüşü/pin sayısı, offscreen unmount testleri |
| Masaüstü Performance ≥95 | PASS | 97 |
| Mobil Performance ≥85 | **FAIL** | 57 |
| Accessibility ≥95 | PASS | İki profilde 100; kapsam Lighthouse ile sınırlı |
| Best Practices ≥95 | PASS | İki profilde 100 |
| Fiziksel mobil / diğer tarayıcılar / tam WCAG / uzun bellek testi | NOT TESTED | Bu ortamda ölçülmedi |

## Varlık kaynakları, lisanslar ve eksikler

- Donanım geometrileri, Hero plaka üreticisi, kamera sahneleri ve teknik SVG'ler proje içinde kodla üretildi. Kaynağı belirsiz GLB, müşteri logosu, stok ekip/ofis fotoğrafı veya video alınmadı.
- Stüdyo verisi Three.js `RoomEnvironment` ve `PMREMGenerator` ile yerelde üretildi; 64 px yüz çözünürlüğünde HalfFloat CubeUV, 336×256 atlas. [Three.js MIT lisansı](public/models/LICENSE-THREE.txt) eklendi.
- Inter Variable Latin ve Latin Extended dosyaları mevcut `@fontsource-variable/inter` paketinden değiştirilmeden alındı. [SIL Open Font License](public/fonts/LICENSE.txt) eklendi. Harici font isteği yoktur.
- **Eksik üretim varlığı:** Fotogerçekçi donanım malzeme/doku seti veya onaylı high-fidelity GLB bulunmuyor. Mevcut model stilize ve eğitsel olarak raporlandı; bu kalite hedefi PASS sayılmadı.
- Gerçek kamera videosu veya AI modeli eklenmedi. Örnek çizim/demonstrasyon talebini karşılayan sahneler vardır; gerçek AI doğruluğu veya saha sonucu ölçülmedi.
- Formun gerçek teslimi için sağlayıcı, Redis, güvenilir proxy IP ayarı ve onaylı aydınlatma metni gerekir. Mevcut kapalı durum korundu.

Kayda erişim: [gerçek tarayıcı scroll videosu](artifacts/interactive/recording/c2c-interactive-scroll.webm). Ekran görüntüleri ve makine raporları galeri altında yer alır. Bu sürüm yayımlanmadı; çalışma yerel proje dosyaları üzerindedir.
