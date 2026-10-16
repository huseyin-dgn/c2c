import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '@/lib/content';
import SectionHeading from './SectionHeading';
export function ProjectVisual({ type }: { type: string }) {
  return (
    <div className={`project-visual project-${type}`} aria-hidden="true">
      {type === 'vision' ? (
        <>
          <div className="vision-grid" />
          <div className="vision-track track-one">
            <span>PERSON 01</span>
            <i />
          </div>
          <div className="vision-track track-two">
            <span>PERSON 02</span>
            <i />
          </div>
          <div className="vision-roi">INTERACTION ROI</div>
          <div className="visual-caption">
            <i /> MOTION → DETECTION → CLASSIFICATION
          </div>
        </>
      ) : type === 'network' ? (
        <>
          <div className="network-layers">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ '--layer': i } as React.CSSProperties}>
                {[0, 1, 2, 3].map((j) => (
                  <span key={j} />
                ))}
              </div>
            ))}
          </div>
          <span className="visual-caption">INPUT / RESIDUAL / ATTENTION / OUTPUT</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 500 240" className="chart-art">
            <path
              d="M40 30V205H465 M40 160H465 M40 115H465 M40 70H465"
              fill="none"
              stroke="#6b8661"
            />
            {Array.from({ length: 28 }, (_, i) => (
              <circle
                key={i}
                cx={55 + i * 14}
                cy={183 - i * 4.5 + Math.sin(i * 3.2) * 22}
                r="3"
                fill="#b4c0af"
              />
            ))}
            <path d="M50 184Q250 154 450 45" fill="none" stroke="#c8a968" strokeWidth="3" />
          </svg>
          <span className="visual-caption">DATA / REGRESSION / PREDICTION</span>
        </>
      )}
    </div>
  );
}
export function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <Link href={`/projeler/${project.slug}`} className="project-card">
      <ProjectVisual type={project.visual} />
      <div className="project-info">
        <div className="project-category">
          <span>{project.category}</span>
          <ArrowUpRight size={22} />
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
export default function ProjectsSection() {
  return (
    <section className="section projects-section" id="projeler">
      <div className="container">
        <SectionHeading
          label="TEKNİK ÇALIŞMALAR"
          title="Fikirden koda."
          accent="İncelenebilir çalışmalar."
          description="Ekip üyelerinin açık kaynak projelerinden seçkiler. Yaklaşımı, mimariyi ve kaynak kodunu keşfedin."
        />
        <div className="project-grid">
          {projects.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <div className="section-end">
          <span>Açık kaynak · Kaynaklarıyla doğrulanabilir</span>
          <Link href="/projeler" className="text-link">
            Tüm çalışmaları inceleyin <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
