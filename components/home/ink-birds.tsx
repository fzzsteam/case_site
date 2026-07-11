const birds = [
  { x: 8, y: 65, scale: 1, delay: 0 }, { x: 88, y: 25, scale: .74, delay: .16 },
  { x: 164, y: 78, scale: .55, delay: .3 }, { x: 238, y: 38, scale: .66, delay: .44 },
  { x: 312, y: 88, scale: .42, delay: .56 },
];

export function InkBirds() {
  return <svg className="story-birds" viewBox="0 0 400 140" aria-hidden="true">
    {birds.map((bird, index) => <g key={index} className={`sketch-bird sketch-bird-${index}`} style={{ "--bird-delay": `${bird.delay}s` } as React.CSSProperties} transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`}>
      <path className="sketch-wing wing-a" d="M2 18c11-13 22-15 34-2" />
      <path className="sketch-wing wing-b" d="M36 16c12-10 24-9 36 3" />
    </g>)}
  </svg>;
}
