# C2C Mühendislik

Türkçe, çok sayfalı B2B mühendislik sitesi. Zümrüt yeşili / ivory editoryal tasarım; App Router, React Server Components, strict TypeScript, Tailwind CSS 4 ve gerçek, sabitlenmiş Three.js / GSAP scrollytelling deneyimi.

Güncel interaktif sürümün uygulama ayrıntıları, kabul matrisi ve ölçümleri [INTERACTIVE_EXPERIENCE_REPORT.md](INTERACTIVE_EXPERIENCE_REPORT.md) içindedir. Başlangıç sürümünün güvenli Git geri dönüş noktası: `cce4bbf`. Önceki `artifacts/creative` ve `VALIDATION.md` kayıtları geçmiş sürümün kanıtlarıdır.

## Çalıştırma

Node.js 22 LTS önerilir (en az 20.9).

```sh
npm ci
npm run dev
```

Yerel adres: http://localhost:3000

Geliştirme ve production derlemesi Turbopack kullanır. Son karşılaştırmada Webpack geliştirme sunucusunda tekrar yükleme sırasında canvas/pin başlangıcı takılırken, aynı kapsamlı tarayıcı testi Turbopack ile localhost:3000 üzerinde geçti. Bu ortamın bulguları ve kişisel Chrome doğrulamasının sınırları `VALIDATION.md` içindedir.

Teşhis paneli: **http://localhost:3000/?debug=1**. Yalnızca geliştirme modunda açılır. WebGL desteğini, gerçek canvas/context durumunu, GSAP trigger sayısını, scroll ve animasyon ilerlemesini, aktif aşamayı, reduced-motion tercihini, renderer ve başlangıç hatalarını gösterir. **Animasyonu Test Et** gerçek sayfayı 10 saniyede beş konuma kaydırır; reduced-motion açıkken kapalıdır.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Sayfalar

| Yol                | İçerik                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `/`                | Cinematic Hero, bizi tanıyın, 7 parçalı donanım keşfi, 4 kamera senaryosu, 5 çözüm vitrini, problem anlatımı, süreç ve CTA |
| `/cozumler`        | Beş çözüm alanı ve örnek uygulamalar                                                              |
| `/projeler`        | Neler geliştiriyoruz? Kamera analizi, endüstriyel kontrol, özel yazılım ve otomasyon              |
| `/projeler/[slug]` | Mevcut MotionFighter, Hyso ve CO₂ Emission teknik çalışma detayları; rotalar korunur              |
| `/yaklasim`        | Klavye destekli süreç zaman çizelgesi ve teknik ilkeler                                           |
| `/hakkimizda`      | Bağımsız ekip modeli ve ekip üyeleri                                                              |
| `/iletisim`        | Yapılandırma durumunu açıkça gösteren proje talep formu                                           |
| `/kvkk`            | Veri işleme durumu ve onaylı aydınlatma için yer                                                  |

## Dosya yapısı

- `app/`: Server Component sayfalar, ortak layout, metadata, sitemap, robots, OG görseli, hata sayfaları ve iletişim API'si.
- `components/Story.tsx`: Dinamik sahne, GSAP scrub, dört anlatı aşaması, WebGL algılama ve hareket kontrolü.
- `components/EngineeringScene.tsx`: Modüler 3D çekirdek, ayrışma/birleşme, bağlantılar, veri paketleri, kamera ve pointer etkileşimi.
- `components/CoreFallback.tsx`: WebGL olmayan, yükleme veya azaltılmış hareket durumunda vektör alternatif.
- `components/ProcessTimeline.tsx`: ARIA tab ilişkileri; ok, Home ve End tuşları.
- `components/*Section.tsx`: Tekrar kullanılabilir ana sayfa bölümleri.
- `app/globals.css`: Tasarım token'ları, responsive düzenler ve hareket tercihleri.
- `lib/content.ts`: Türkçe içerik, çözümler, ekip ve doğrulanmış projeler. Yeni dil için bu katman ayrıştırılabilir; İngilizce çeviri henüz yok.
- `lib/contact-validation.ts`: Sunucuda alan uzunlukları, e-posta, honeypot, zaman ve bilgilendirme kontrolü.
- `lib/contact.ts`: Etkinleştirme kapısı ve paylaşımlı Redis hız sınırı.
- `lib/privacy.ts`: Onaylı gerçek aydınlatma metni için yapılandırma noktası.
- `tests/contact.test.ts`: Form doğrulama ve yapılandırılmamış API davranışı.

## Animasyon ve performans

GSAP Timeline ve ScrollTrigger `pin`, `pinSpacing` ve `scrub: 0.65` kullanarak tek bir sahneyi dört anlatı boyunca sabitler. Beş anahtar konum arasında kamera ve dönüş Hermite eğrisiyle sürekli hızda ilerler; mekanik ayrışma ve birleşme sınırlandırılmış easing kullanır. Model; kılavuz rayları, montaj delikleri, altıgen bağlantılar, işlem modülleri, soğutucu kanatlar, portlar ve havalandırmalı şasiden oluşur. İleri / geri kaydırma aynı yapısal ve kamera durumunu üretir. Yalnızca bağlantılardaki veri akışı zamana bağlıdır ve ayrı düğmeyle duraklatılabilir.

`MotionSection.tsx` hakkımızda alanının ve alt sayfalardaki editorial alanların scroll zaman çizelgelerini yönetir. `SolutionsShowcase` masaüstünde yatay GSAP vitrini, `ProblemStory` tek görselde beş aşamalı süreç sunar. Mobilde ve reduced-motion tercihinde pin kullanılmaz; dikey / elle seçilebilir alternatifler sunulur. `SystemDiagram` çizim tamamlandıktan sonra görünürken sinyal akışı, tarama ve işlem vurguları üretir. İçerik sunucuda görünür gelir; GSAP cleanup sayfa geçişlerinde animasyonları temizler.

Stüdyo yansıması ve özgün Hero plaka geometrisi `public/models/` içinde önceden hesaplanmıştır; shader programları `compileAsync` ile hazırlanır. Yeniden üretmek için `node scripts/bake-studio.mjs` ve `node scripts/bake-core-geometry.mjs` çalıştırılabilir. Inter fontlarının Latin / Latin Extended alt kümeleri aynı lisansla yerel olarak ön yüklenir. Lisanslar varlık klasörlerindedir.

Sahne ayrı chunk olarak yüklenir; alt sayfalar 3D bağımlılıklarını yüklemez. Yerel Inter ve sistem serif fontları üçüncü taraf font isteği gerektirmez. Yedi delikli, pah kırılmış metal katman, devre ayrıntıları ve kapanan dış paneller özgün geometrilerle üretilir. RoomEnvironment / PMREM kontrollü stüdyo yansımalarını sağlar. Geometriler paylaşılır; environment, doku ve buffer kaynakları temizlenir. Mobil/tablette daha az küçük bileşen ve düşük DPR kullanılır. Canvas demand rendering kullanır: kaydırma değişince veya işleme akışı sürerken kare üretir; görünmeyince durur. Azaltılmış harekette canvas ve pin kaldırılır, tüm anlatı normal belge akışında sunulur. WebGL hatası ve context kaybında SVG alternatif gösterilir.

## Görsel doğrulama

`artifacts/interactive/index.html` güncel deneyimin ekran görüntülerini, gerçek tarayıcı videosunu ve Lighthouse bağlantılarını içerir. `artifacts/interactive/production/` yeni etkileşimleri; `artifacts/interactive/hero/` Hero ve rota regresyonunu kaydeder. Önceki galeriler de ilgili `creative`, `final` ve `redesign` klasörlerinde durur.

```sh
# Ayrı terminalde npm run dev ile localhost:3000 açık olmalı.
# Tarayıcı testleri kurulu Google Chrome'u ayrı test profiliyle kullanır.
npm run test:diagnostics
npm run test:visual
npm run test:creative
npm run test:interactive
node scripts/design-audit.mjs
npm run record:scroll
node scripts/create-interactive-gallery.mjs
```

Tarayıcı testleri farklı adreste çalıştırılacaksa `TEST_BASE_URL` kullanılır. `scripts/visual-qa.mjs`; gerçek canvas/kamera verisini, piksel farkını, ters kaydırmayı, taşmayı, klavye ve menüyü, navigasyon cleanup'ını, reduced-motion ve WebGL hata yolunu doğrular. Güncel ölçümler `artifacts/interactive/lighthouse/` içindedir. Fiziksel mobil FPS, bu masaüstü testlerinden çıkarılamaz.

## İletişim entegrasyonu

Varsayılan sürüm **mesaj göndermez**. Gönder butonu devre dışıdır; API 503 döndürür. Alanlara yazmak dışarı veri göndermez ve localStorage kullanılmaz.

Etkinleştirmek için:

1. `.env.example` dosyasını `.env.local` olarak kopyalayın. Gerçek alan adını `NEXT_PUBLIC_SITE_URL` ile belirtin.
2. Resend'de doğrulanmış göndereni `CONTACT_FROM`, gerçek alıcıyı `CONTACT_TO` ve anahtarı `RESEND_API_KEY` ile yapılandırın.
3. Upstash uyumlu Redis REST adresi ve token'ını girin. Hız sınırı tek işlemde INCR / EXPIRE ile IP başına 15 dakikada 5 denemedir. IP, Redis anahtarında SHA-256 ile özetlenir; form içeriği Redis'e yazılmaz.
4. `CONTACT_IP_HEADER` değerini, barındırma proxy'nizin istemci tarafından değiştirilemeyecek şekilde **üzerine yazdığı** gerçek IP başlığına ayarlayın. Doğrudan gelen rastgele X-Forwarded-For başlığına güvenmeyin.
5. Gerçek veri sorumlusu, amaçlar, hukuki sebepler, alıcılar/aktarımlar, saklama, haklar ve başvuru yolunu içeren onaylı aydınlatmayı `lib/privacy.ts` içine ekleyin. Çevre değişkeni tek başına yeterli değildir; `privacyNotice` null olmaktan çıkarılmalıdır.
6. `CONTACT_PRIVACY_APPROVED=true` ve metnin sürümüyle eşleşen `CONTACT_PRIVACY_VERSION` değerini ayarlayıp yeniden derleyin.
7. Kontrollü gerçek teslim testi yapın. Sağlayıcının isteği kabul etmesi, gelen kutusuna teslimi kanıtlamaz. Arayüz yalnızca kabul bilgisini gösterir.

Sunucu Origin kontrolü, 24 KB gerçek akış sınırı, sunucu doğrulaması, honeypot ve zaman kontrolü uygular. Redis hatasında gönderimi kapatır. İçerik düz metin olarak gönderilir. Sağlayıcı reddi, timeout veya eksik onay başarı sayılmaz. Üretimde ters proxy düzeyinde istek/zaman sınırları da yapılandırılmalıdır. Gizli anahtarlar Git'e eklenmez.

## Kaynak ve içerik doğruluğu

16 Ekim 2026'da GitHub API üzerinden iki profilin açık depoları ve aşağıdaki README dosyaları incelendi:

- [MotionFighter-for-YOLO](https://github.com/huseyin-dgn/MotionFighter-for-YOLO): hareket → YOLO / ROI → pose kontrolü → 3D CNN akışı.
- [Hyso](https://github.com/huseyin-dgn/hyso): CNN, bottleneck residual, CBAM, eğitim ve callback desteği.
- [CO2_Emission](https://github.com/ilker-Akbal/CO2_Emission): veri hazırlama ve doğrusal / polinomsal regresyon karşılaştırması.

Bunlar ekip üyelerinin açık kaynak çalışmalarıdır; C2C müşteri projeleri değildir. README'deki performans rakamları bağımsız doğrulanmış sonuçlar olarak aktarılmadı. Kaynak kodlar taşınmadı; açıklamalar özetlendi ve kaynak bağlantıları verildi.

FIGHT'ın üniversitede kullanımı ve multiprocessing bilgisi kullanıcı beyanıdır. FIGHT ile MotionFighter arasında doğrulanmış eşleştirme kurulmadı. Açık depo ve teknik belge sağlanana kadar ayrı not olarak tutulur. Ekip eğitimi kullanıcı tarafından sağlanmıştır. Sahte müşteri, başarı oranı, şirket unvanı, ortaklık, deneyim yılı veya insan fotoğrafı eklenmedi.

## Yayın ve doğrulama sınırları

Gerçek domain verilene kadar robots noindex kalır ve sitemap boş döner; sahte canonical kullanılmaz. `NEXT_PUBLIC_SITE_URL` tanımlandığında gerçek canonical ve sitemap üretilir, indekslemeye izin verilir. OG görseli ve favicon uygulama içinde üretilir. Site yerel repository'de geliştirilmiştir; canlıya dağıtılmamıştır.

Nihai kontrol sonuçları ve kalan doğrulamalar: `VALIDATION.md`. Otomatik kontroller fiziksel mobil performansının veya elle erişilebilirlik denetiminin yerini tutmaz.

Teknik başvurular: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Resend](https://resend.com/docs/api-reference/emails/send-email), [Upstash REST](https://upstash.com/docs/redis/features/restapi).
