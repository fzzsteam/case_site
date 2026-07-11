const birds = [
  { x: 0, y: 58, scale: 1 }, { x: 78, y: 18, scale: .72 }, { x: 145, y: 72, scale: .55 },
  { x: 205, y: 35, scale: .82 }, { x: 292, y: 86, scale: .48 },
];

export function InkBirds() {
  return <svg className="story-birds" viewBox="0 0 430 150" aria-hidden="true">
    {birds.map((bird, index) => <g key={index} className={`ink-bird ink-bird-${index}`} transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`}>
      <path className="bird-body" d="M22 14c6-4 14-3 19 1-5 1-8 3-10 6-4 0-7-2-9-7Z" />
      <path className="bird-wing wing-left" d="M27 15C17 3 7 2 0 8c10 1 15 7 22 13" />
      <path className="bird-wing wing-right" d="M32 16C42 5 53 5 62 12c-12-1-18 4-26 10" />
      <path className="bird-tail" d="m23 19-8 8 12-5 5 7 2-9" />
    </g>)}
  </svg>;
}
