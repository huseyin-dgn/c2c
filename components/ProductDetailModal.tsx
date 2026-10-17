'use client';
import { useEffect, useRef, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import { conceptCategories, conceptDisclosure, type ProductConcept } from '@/lib/product-concepts';
import styles from './ProductCatalog.module.css';

export default function ProductDetailModal({ concept, onClose }: { concept: ProductConcept; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const outside = useRef(false);
  const category = conceptCategories.find(item => item.id === concept.category)!;
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  const isOutside = (event: PointerEvent<HTMLDialogElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  };
  return <dialog ref={dialog} className={styles.dialog} aria-modal="true" aria-labelledby="concept-detail-title" aria-describedby="concept-detail-summary"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onPointerDown={event => { outside.current = isOutside(event); }}
    onPointerUp={event => { if (outside.current && isOutside(event)) onClose(); outside.current = false; }}>
    <div className={styles.dialogBar}><span>ÖRNEK ÇÖZÜM KONSEPTİ <i /> {concept.code} / 08</span><button type="button" onClick={onClose} aria-label="Detay penceresini kapat"><X size={21} strokeWidth={1.4} /></button></div>
    <div className={styles.dialogScroll}>
      <div className={styles.detailImage}><Image src={concept.image} alt={concept.imageAlt} fill decoding="sync" loading="eager" sizes="(max-width: 767px) calc(100vw - 16px), (max-width: 1036px) calc(100vw - 76px), 960px" style={{ objectPosition: concept.imagePosition }} /><span>TEMSİLİ GÖRSEL</span></div>
      <div className={styles.detailBody}>
        <span className={styles.detailCategory}>{category.title}</span>
        <h2 id="concept-detail-title">{concept.title}</h2>
        <p id="concept-detail-summary" className={styles.detailSummary}>{concept.summary}</p>
        <section className={styles.detailProblem}><span className={styles.detailLabel}>01 / ÇÖZDÜĞÜ PROBLEM</span><p>{concept.problem}</p></section>
        <section className={styles.detailApproach}><h3>Nasıl çalışabilir?</h3><ol>{concept.approach.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol></section>
        <div className={styles.detailColumns}>
          <section><h3>Kullanım alanları</h3><ul className={styles.useCases}>{concept.uses.map(use => <li key={use}>{use}</li>)}</ul></section>
          <section><h3>Beklenen çıktılar</h3><ul className={styles.outputs}>{concept.outputs.map(output => <li key={output}>{output}</li>)}</ul></section>
        </div>
        <section className={styles.infrastructure}><span className={styles.detailLabel}>ALTYAPI VE ENTEGRASYON</span><p>{concept.infrastructure}</p></section>
        <div className={styles.detailFooter}><p>{conceptDisclosure} Kapsam ve uygulanabilirlik, ihtiyaç analizi ve saha koşullarıyla birlikte belirlenir.</p><Link href={`/iletisim?alan=${concept.area}`}>Bu ihtiyacı konuşalım <ArrowUpRight size={18} strokeWidth={1.3} /></Link></div>
      </div>
    </div>
  </dialog>;
}
