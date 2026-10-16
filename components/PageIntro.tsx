import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function PageIntro({
  label,
  title,
  accent,
  description,
}: {
  label: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <section className="page-intro container">
      <span className="eyebrow">
        <Link href="/">C2C MÜHENDİSLİK</Link> / {label}
      </span>
      <h1>
        {title}
        <br />
        <span>{accent}</span>
      </h1>
      <div className="intro-bottom">
        <p>{description}</p>
        <span className="intro-symbol" aria-hidden="true">
          <ArrowUpRight size={58} strokeWidth={1} />
        </span>
      </div>
    </section>
  );
}
