import { ArrowUpRight } from 'lucide-react';
import { team } from '@/lib/content';
import SectionHeading from './SectionHeading';
import MotionSection from './MotionSection';
export default function TeamSection() {
  return (
    <MotionSection className="section team-section" motionKey="team">
      <div className="container">
        <div data-motion="heading"><SectionHeading
          label="EKİBİMİZ"
          title="Aynı merak."
          accent="Ortak mühendislik anlayışı."
          description="Tokat Gaziosmanpaşa Üniversitesi Bilgisayar Mühendisliği mezunu, bağımsız bir teknoloji geliştirme ekibiyiz."
        /></div>
        <div className="team-grid">
          {team.map((person) => (
            <article key={person.name} className="team-card" data-motion="copy">
              <div className="team-avatar" aria-hidden="true" data-motion="visual">
                <span>{person.initials}</span>
              </div>
              <div className="team-info">
                <h3>{person.name}</h3>
                <p>Bilgisayar Mühendisi</p>
                <span>Tokat Gaziosmanpaşa Üniversitesi</span>
                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  GitHub çalışmalarını inceleyin <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
