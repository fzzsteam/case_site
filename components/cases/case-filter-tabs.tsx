export function CaseFilterTabs<T extends string>({ categories, active, onChange, className }: { categories: T[]; active: T; onChange: (value: T) => void; className?: string }) {
  return <div className={className ?? "case-filters"}>
    {categories.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => onChange(item)}>{item}</button>)}
  </div>;
}
