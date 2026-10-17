'use client';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { conceptCategories, productConcepts, type ProductConcept } from '@/lib/product-concepts';
import ProductDetailModal from './ProductDetailModal';
import styles from './ProductCatalog.module.css';

export default function ProductCatalog() {
  const [selected, setSelected] = useState<ProductConcept | null>(null);
  const close = useCallback(() => setSelected(null), []);
  return <>
    <nav className={styles.categoryNav} aria-label="Ürün konsepti kategorileri"><div className="container">{conceptCategories.map(category => <a key={category.id} href={`#konsept-${category.id}`}><span>{category.number}</span>{category.short}<ArrowUpRight size={14} strokeWidth={1.3} /></a>)}</div></nav>
    <div className={`container ${styles.categories}`}>
      {conceptCategories.map(category => <section className={styles.category} key={category.id} id={`konsept-${category.id}`} aria-labelledby={`category-${category.id}`} data-concept-category={category.id}>
        <header className={styles.categoryHeading}><div><span className={styles.categoryNumber}>{category.number} / ÇÖZÜM ALANI</span><h2 id={`category-${category.id}`}>{category.title}</h2></div><p>{category.description}</p></header>
        <div className={styles.cards}>{productConcepts.filter(concept => concept.category === category.id).map(concept => <article className={styles.card} key={concept.id} data-concept-id={concept.id}>
          <div className={styles.cardImage}><Image src={concept.image} alt={concept.imageAlt} fill decoding="sync" sizes="(max-width: 767px) 88vw, (max-width: 1530px) 43vw, 640px" style={{ objectPosition: concept.imagePosition }} /><div className={styles.imageCaption}><span>KONSEPT / {concept.code}</span><span>TEMSİLİ GÖRSEL</span></div></div>
          <div className={styles.cardInfo}><span className={styles.cardCategory}>{category.title}</span><h3>{concept.title}</h3><p>{concept.summary}</p><button type="button" className={styles.openDetail} aria-label={`Detayı incele: ${concept.title}`} aria-haspopup="dialog" onClick={() => setSelected(concept)}>Detayı İncele <ArrowUpRight size={20} strokeWidth={1.2} /></button></div>
        </article>)}</div>
      </section>)}
    </div>
    {selected && <ProductDetailModal concept={selected} onClose={close} />}
  </>;
}
