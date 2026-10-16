'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Info, LoaderCircle } from 'lucide-react';
import { solutions } from '@/lib/content';
export default function ContactForm({
  enabled,
  selectedArea,
}: {
  enabled: boolean;
  selectedArea: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  return (
    <div className="contact-form-wrap">
      {!enabled && (
        <div className="form-notice">
          <Info size={19} />
          <div>
            <strong>Gönderim henüz açık değil.</strong>
            <p>
              Formu inceleyebilir ve proje özetinizi hazırlayabilirsiniz. İletişim altyapısı ve
              aydınlatma metni tamamlandığında talep gönderimi açılacak. Yazdıklarınız kaydedilmez
              veya iletilmez.
            </p>
          </div>
        </div>
      )}
      <form
        className="contact-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!enabled || status === 'sending') return;
          const form = event.currentTarget;
          const values = new FormData(form);
          setStatus('sending');
          setMessage('');
          try {
            const response = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: values.get('name'),
                company: values.get('company'),
                email: values.get('email'),
                phone: values.get('phone'),
                area: values.get('area'),
                message: values.get('message'),
                website: values.get('website'),
                startedAt: startedAt.current,
                acknowledged: values.get('acknowledged') === 'on',
              }),
            });
            const result = await response.json();
            if (!response.ok || result.accepted !== true)
              throw new Error(result.error || 'Gönderim onayı alınamadı.');
            setStatus('success');
            setMessage('Talebiniz gönderim sağlayıcısı tarafından kabul edildi.');
            form.reset();
            startedAt.current = Date.now();
          } catch (error) {
            setStatus('error');
            setMessage(
              error instanceof Error ? error.message : 'Gönderim sırasında bir sorun oluştu.',
            );
          }
        }}
      >
        <div className="form-row">
          <label htmlFor="name">
            Ad Soyad <span>*</span>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Adınız ve soyadınız"
            />
          </label>
          <label htmlFor="company">
            Şirket / Kurum <span>*</span>
            <input
              id="company"
              name="company"
              required
              minLength={2}
              maxLength={160}
              autoComplete="organization"
              placeholder="Kurumunuzun adı"
            />
          </label>
        </div>
        <div className="form-row">
          <label htmlFor="email">
            E-posta <span>*</span>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="siz@kurumunuz.com"
            />
          </label>
          <label htmlFor="phone">
            Telefon <small>İsteğe bağlı</small>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              placeholder="+90"
            />
          </label>
        </div>
        <label htmlFor="area">
          Çözüm alanı <small>İsteğe bağlı</small>
          <select
            id="area"
            name="area"
            defaultValue={solutions.some((x) => x.slug === selectedArea) ? selectedArea : ''}
          >
            <option value="">Birlikte belirleyelim</option>
            {solutions.map((solution) => (
              <option key={solution.slug} value={solution.slug}>
                {solution.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="message">
          Projeniz veya probleminiz <span>*</span>
          <textarea
            id="message"
            name="message"
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            placeholder="Çözmek istediğiniz problemi, mevcut sisteminizi ve hedeflediğiniz sonucu kısaca anlatın…"
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">
            Web sitesi
            <input id="website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" name="acknowledged" required disabled={!enabled} />
          <span>
            <Link href="/kvkk" target="_blank" rel="noopener noreferrer">
              Veri işleme bilgilendirmesini
            </Link>{' '}
            okudum.
          </span>
        </label>
        <button
          type="submit"
          className="button button-primary form-submit"
          disabled={!enabled || status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <LoaderCircle size={17} className="spin" /> Gönderiliyor…
            </>
          ) : (
            <>
              Proje Talebini Gönder <ArrowUpRight size={18} />
            </>
          )}
        </button>
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`form-status ${status}`}
          aria-live="polite"
        >
          {message || (!enabled ? 'Gönderim yapılandırması bekleniyor.' : '* Zorunlu alanlar')}
        </p>
      </form>
    </div>
  );
}
