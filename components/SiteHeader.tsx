'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
export function Brand() {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="c2c. MÜHENDİSLİK ENGINEERING & TECHNOLOGY — ana sayfa"
    >
      <span className="brand-mark" aria-hidden="true">
        c<span>2</span>c<span className="brand-dot">.</span>
      </span>{' '}
      <span className="brand-name" aria-hidden="true">
        MÜHENDİSLİK{' '}<span>ENGINEERING & TECHNOLOGY</span>
      </span>
    </Link>
  );
}
const links = [
  ['/cozumler', 'Çözümler'],
  ['/projeler', 'Neler geliştiriyoruz?'],
  ['/yaklasim', 'Yaklaşımımız'],
  ['/hakkimizda', 'Hakkımızda'],
];
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Ana menü">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" href="/iletisim">
          Projenizi Anlatın <ArrowUpRight size={16} />
        </Link>
        <button
          ref={button}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav id="mobile-menu" className="mobile-nav" hidden={!open} aria-label="Mobil menü">
        {[...links, ['/iletisim', 'Projenizi Anlatın']].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={pathname.startsWith(href) ? 'page' : undefined}
          >
            {label}
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
