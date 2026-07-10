import { Check } from "lucide-react";
import { pricing } from "@/content/pricing";
export function PricingGrid() { return <div className="pricing-grid">{pricing.map((item, i) => <article key={item.name} className={`pricing-card ${item.featured ? "featured" : ""}`}><span className="plan-label">方案 0{i+1}</span><h3>{item.name}</h3><div className="rate"><strong>{item.rate}</strong><small>{item.unit}</small></div><p className="starting">{item.price}</p><ul>{item.features.map(f => <li key={f}><Check size={16}/>{f}</li>)}</ul></article>)}</div>; }
