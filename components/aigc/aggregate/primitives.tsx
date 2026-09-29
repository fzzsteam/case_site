export function SectionHeading({ number, title, eyebrow, description, id }: {
  number: string; title: string; eyebrow?: string; description?: string; id?: string;
}) {
  return <div className="ag-section-heading"><div>
    {eyebrow && <p className="ag-eyebrow">{eyebrow}</p>}
    <h2 id={id}><span className="ag-section-heading__number">{number}<i>/</i></span>{title}</h2>
    {description && <p className="ag-section-heading__description">{description}</p>}
  </div><p className="ag-section-heading__note">用 AI 打开影视内容的新可能<small>MORE STORIES<br />A BRIGHTER TOMORROW</small></p></div>;
}

export function ParticleArt({ className = '', variant = 'wave' }: { className?: string; variant?: 'wave' | 'cloud' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`ag-particle-art ${className}`} src={`/edu/aggregate/particle-${variant}.png`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
  );
}
