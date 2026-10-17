
'use client';

import { useState } from 'react';
import {
  MessageSquare,
  ClipboardList,
  ArrowUpRight,
  Info,
} from 'lucide-react';

import ContactForm from './ContactForm';
import styles from './ContactModeSwitcher.module.css';

type Mode = 'general' | 'project';

type Props = {
  enabled: boolean;
  selectedArea: string;
  initialMode: Mode;
};

export default function ContactModeSwitcher({
  enabled,
  selectedArea,
  initialMode,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className={styles.wrapper}>
      <div className={styles.modeHeading}>
        <span className={styles.eyebrow}>
          İLETİŞİM TÜRÜ
        </span>

        <h2>Size nasıl yardımcı olabiliriz?</h2>

        <p>
          İletişim nedeninize uygun formu seçerek
          devam edebilirsiniz.
        </p>
      </div>

      <div
        className={styles.modeGrid}
        role="group"
        aria-label="İletişim türü"
      >
        <button
          type="button"
          className={`${styles.modeCard} ${
            mode === 'general' ? styles.active : ''
          }`}
          aria-pressed={mode === 'general'}
          onClick={() => setMode('general')}
        >
          <MessageSquare
            size={23}
            strokeWidth={1.6}
            aria-hidden="true"
          />

          <strong>Genel İletişim</strong>
          <span>
            Sorularınız ve iş birliği talepleriniz.
          </span>
        </button>

        <button
          type="button"
          className={`${styles.modeCard} ${
            mode === 'project' ? styles.active : ''
          }`}
          aria-pressed={mode === 'project'}
          onClick={() => setMode('project')}
        >
          <ClipboardList
            size={23}
            strokeWidth={1.6}
            aria-hidden="true"
          />

          <strong>Proje Talebi</strong>
          <span>
            Yazılım, yapay zekâ ve teknik projeleriniz.
          </span>
        </button>
      </div>

      {mode === 'general' ? (
        <GeneralContactForm />
      ) : (
        <div className={styles.projectForm}>
          <ContactForm
            enabled={enabled}
            selectedArea={selectedArea}
          />
        </div>
      )}
    </div>
  );
}

function GeneralContactForm() {
  return (
    <div className={styles.generalForm}>
      <div className={styles.formHeading}>
        <span className={styles.eyebrow}>
          GENEL İLETİŞİM
        </span>

        <h3>Mesajınızı iletin.</h3>

        <p>
          Genel sorularınız ve iş birliği
          konularındaki mesajlarınız için
          aşağıdaki alanları kullanabilirsiniz.
        </p>
      </div>

      <div className={styles.notice} role="status">
        <Info size={19} aria-hidden="true" />

        <p>
          Genel iletişim formunun gönderim altyapısı
          henüz etkin değil. Mesajlar kaydedilmez
          veya iletilmez.
        </p>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span>Ad Soyad</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Adınız soyadınız"
              maxLength={120}
              required
            />
          </label>

          <label className={styles.field}>
            <span>E-posta</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@firma.com"
              maxLength={254}
              required
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Konu</span>
          <input
            type="text"
            name="subject"
            placeholder="Mesajınızın konusu"
            maxLength={150}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Mesajınız</span>
          <textarea
            name="message"
            rows={6}
            placeholder="Mesajınızı buraya yazabilirsiniz."
            maxLength={5000}
            required
          />
        </label>

        <p className={styles.privacy}>
          Lütfen parola, erişim anahtarı veya
          hassas kişisel veri paylaşmayın.
          {' '}
          <a href="/kvkk">
            Veri işleme bilgilendirmesi
            <ArrowUpRight
              size={13}
              aria-hidden="true"
            />
          </a>
        </p>

        <button
          type="submit"
          className={styles.submit}
          disabled
        >
          Mesajı Gönder
          <ArrowUpRight
            size={18}
            aria-hidden="true"
          />
        </button>

        <p className={styles.disabledNote}>
          Gönderim yapılandırması bekleniyor.
        </p>
      </form>
    </div>
  );
}
