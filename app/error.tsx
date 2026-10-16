'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container not-found">
      <span className="eyebrow">BEKLENMEYEN BİR HATA</span>
      <h1>Bir bağlantı kesildi.</h1>
      <p>Sayfayı yeniden yükleyerek devam edebilirsiniz.</p>
      <button className="button button-primary" onClick={reset}>
        Yeniden deneyin
      </button>
    </section>
  );
}
