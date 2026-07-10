import { services } from "@/content/services";
export function ServiceGrid() { return <div className="service-grid">{services.map(({ title, description, icon: Icon }, i) => <article className="service-card" key={title}><span className="card-number">0{i+1}</span><Icon /><h3>{title}</h3><p>{description}</p></article>)}</div>; }
