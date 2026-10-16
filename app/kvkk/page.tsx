import PageIntro from '@/components/PageIntro';
import { pageMetadata } from '@/lib/site';
import { privacyNotice } from '@/lib/privacy';
export const metadata = pageMetadata(
  'Veri ve Gizlilik',
  'C2C Mühendislik proje talep formunun veri işleme ve yapılandırma durumu.',
  '/kvkk',
);
export default function PrivacyPage() {
  if (privacyNotice)
    return (
      <>
        <PageIntro
          label="VERİ VE GİZLİLİK"
          title="Verileriniz hakkında"
          accent="açık bilgilendirme."
          description={privacyNotice.title}
        />
        <article className="container prose-page">
          {privacyNotice.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p>Sürüm: {privacyNotice.version}</p>
        </article>
      </>
    );
  return (
    <>
      <PageIntro
        label="VERİ VE GİZLİLİK"
        title="Açık iletişim."
        accent="Kontrollü veri paylaşımı."
        description="Proje talep formunun hangi koşullarda etkinleştirileceğini ve bu sürümde verilerinizin nasıl ele alındığını açıklıyoruz."
      />
      <article className="container prose-page">
        <h2>Bu sürümde formun durumu</h2>
        <p>
          İletişim sağlayıcısı ve alıcı bilgileri yapılandırılmadığı sürece form üzerinden veri
          gönderimi yapılmaz. Formda yazdıklarınız kalıcı olarak tarayıcıya kaydedilmez; sayfa
          yenilenirse silinir.
        </p>
        <h2>Gönderim açılmadan önce</h2>
        <p>
          Veri sorumlusunun kimliği ve iletişim bilgileri, işleme amaçları ve hukuki sebepleri, veri
          toplama yöntemi, alıcı grupları ve olası yurt dışı aktarım şartları, saklama süreleri ve
          ilgili kişi haklarına ilişkin başvuru yolu belirlenmeli ve onaylı aydınlatma metni burada
          yayımlanmalıdır.
        </p>
        <p>
          Bu sayfa tamamlanmış bir KVKK aydınlatma metni değildir. Onaylı metin yayımlanıp
          yapılandırmada etkinleştirilene kadar gönderim kapalı tutulur.
        </p>
        <h2>Veri minimizasyonu</h2>
        <p>
          Talebinizi hazırlarken parola, gizli erişim bilgisi, özel nitelikli kişisel veri veya
          üçüncü kişilere ait kişisel veri paylaşmayın. Telefon ve çözüm alanı isteğe bağlıdır.
        </p>
        <h2>Ölçüm ve üçüncü taraflar</h2>
        <p>
          Bu uygulamaya analiz veya reklam izleyicisi eklenmemiştir. GitHub bağlantıları sizi ilgili
          harici hizmete götürür. Canlı barındırma sağlayıcısının teknik günlükleri ve e-posta
          sağlayıcısının veri işleme şartları, yayın öncesi aydınlatmaya dahil edilmelidir.
        </p>
      </article>
    </>
  );
}
