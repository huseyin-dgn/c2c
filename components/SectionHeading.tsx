export default function SectionHeading({
  label,
  title,
  accent,
  description,
}: {
  label: string;
  title: string;
  accent: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>
          {title}
          <br />
          <span className="text-muted">{accent}</span>
        </h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
