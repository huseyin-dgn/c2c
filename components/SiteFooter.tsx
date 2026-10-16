import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './SiteHeader';
import { team } from '@/lib/content';
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand />
        <p>
          Karmaşık problemlere,
          <br />
          düşünülmüş mühendislik.
        </p>
        <div className="footer-links">
          <Link href="/cozumler">Çözümler</Link>
          <Link href="/projeler">Neler geliştiriyoruz?</Link>
          <Link href="/iletisim">İletişim</Link>
        </div>
        <div className="footer-links">
          {team.map((person) => (
            <a key={person.name} href={person.github} target="_blank" rel="noopener noreferrer">
              {person.name} <ArrowUpRight size={13} />
            </a>
          ))}
          <Link href="/kvkk">Veri ve gizlilik</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} C2C Mühendislik</span>
        <span>Bağımsız mühendislik ve teknoloji geliştirme ekibi.</span>
        <span className="footer-location">
          <i /> TÜRKİYE · TR
        </span>
      </div>
    </footer>
  );
}
