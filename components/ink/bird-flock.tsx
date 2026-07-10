export function BirdFlock() {
  return <svg className="bird-flock" viewBox="0 0 1000 360" aria-hidden="true">
    {[0,1,2,3,4].map((bird) => <g key={bird} className={`bird bird-${bird}`}><path d="M-7 2 Q0 -5 7 2 Q13 -4 20 1" /></g>)}
  </svg>;
}
