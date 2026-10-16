'use client';
import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { processSteps } from '@/lib/content';
export default function ProcessTimeline() {
  const [active, setActive] = useState(0);
  return (
    <div className="process-timeline">
      <div className="process-tabs" role="tablist" aria-label="Mühendislik süreci">
        {processSteps.map((step, i) => (
          <button
            key={step.title}
            id={`process-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls={`process-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(event) => {
              let next = i;
              if (event.key === 'ArrowRight') next = (i + 1) % 4;
              else if (event.key === 'ArrowLeft') next = (i + 3) % 4;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = 3;
              else return;
              event.preventDefault();
              setActive(next);
              document.getElementById(`process-tab-${next}`)?.focus();
            }}
          >
            <span className="process-index">0{i + 1}</span>
            <span>{step.title}</span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      {processSteps.map((step, i) => (
        <div
          key={step.title}
          id={`process-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`process-tab-${i}`}
          hidden={active !== i}
          tabIndex={0}
          className="process-panel"
        >
          <div>
            <h3>{step.label}</h3>
            <p>{step.description}</p>
            <span className="process-output">
              <Check size={16} />
              {step.output}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
