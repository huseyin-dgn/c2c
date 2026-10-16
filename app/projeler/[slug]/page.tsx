import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { projects } from '@/lib/content';
import { ProjectVisual } from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';
import { pageMetadata } from '@/lib/site';
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project
    ? pageMetadata(project.title, project.description, `/projeler/${slug}`)
    : { title: 'Proje bulunamadı' };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return (
    <>
      <section className="container project-detail-intro">
        <Link href="/projeler" className="text-link">
          <ArrowLeft size={16} /> Çözüm alanlarımız
        </Link>
        <div className="project-detail-heading">
          <div>
            <span className="eyebrow">{project.category} / AÇIK KAYNAK ÇALIŞMA</span>
            <h1>{project.title}</h1>
            <p>{project.subtitle}</p>
          </div>
          <a
            href={project.source}
            className="button button-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kaynak kodunu inceleyin <ArrowUpRight size={19} />
          </a>
        </div>
        <ProjectVisual type={project.visual} />
        <div className="project-meta">
          <div>
            <span>ÇALIŞMA SAHİBİ</span>
            <p>{project.owner}</p>
          </div>
          <div>
            <span>TEKNOLOJİLER</span>
            <p>{project.tags.join(' / ')}</p>
          </div>
          <div>
            <span>KAYNAK KONTROLÜ</span>
            <p>16 Ekim 2026 · GitHub README</p>
          </div>
        </div>
      </section>
      <section className="container project-detail-body">
        <div>
          <span className="eyebrow">01 / TEKNİK YAKLAŞIM</span>
          <h2>{project.subtitle}</h2>
          <p>{project.detail}</p>
          <p className="content-note">{project.limitation}</p>
          <a
            href={`${project.source}#readme`}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Teknik açıklamanın kaynağı <ArrowUpRight size={16} />
          </a>
        </div>
        <aside>
          <span className="eyebrow">KAVRAMSAL İŞ AKIŞI</span>
          <ol className="pipeline">
            {project.steps.map((step, i) => (
              <li key={step}>
                <span>0{i + 1}</span>
                {step}
                {i !== project.steps.length - 1 && <ArrowRight size={15} />}
              </li>
            ))}
          </ol>
          <p className="content-note">Şema, depodaki açıklamanın görsel özetidir.</p>
        </aside>
      </section>
      <ContactSection />
    </>
  );
}
