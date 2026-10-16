import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="eyebrow">404 / BAĞLANTI BULUNAMADI</span>
      <h1>
        Bu yol henüz
        <br />
        <span>bir sisteme bağlı değil.</span>
      </h1>
      <p>Aradığınız sayfa bulunamadı. Ana sayfadan devam edebilirsiniz.</p>
      <Link href="/" className="button button-primary">
        Ana sayfaya dönün <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
