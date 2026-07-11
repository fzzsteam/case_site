const flock = [
  { shape: "soar", x: 8, y: 76, scale: 1 }, { shape: "glide", x: 90, y: 35, scale: .76 },
  { shape: "rise", x: 168, y: 88, scale: .58 }, { shape: "soar", x: 240, y: 42, scale: .68 },
  { shape: "glide", x: 318, y: 94, scale: .48 }, { shape: "rise", x: 372, y: 57, scale: .38 },
];

export function InkBirds() {
  return <svg className="story-birds" viewBox="0 0 450 155" aria-hidden="true">
    <defs>
      <path id="bird-soar" className="bird-silhouette" d="M0 17C10 6 21 4 31 12c4 3 8 4 12 2C55 6 68 8 79 19 64 13 55 15 45 23c-4 3-9 3-13 0C23 15 14 13 0 17Z"/>
      <path id="bird-glide" className="bird-silhouette" d="M1 23C15 17 24 13 34 5c2 9 6 14 12 16 8 2 18-2 31-7-8 12-18 18-30 18-7 0-12-2-16-6-8-6-17-7-30-3Z"/>
      <path id="bird-rise" className="bird-silhouette" d="M2 29C16 21 25 12 33 0c3 13 8 21 15 24 8 3 17 0 29-8-7 14-17 22-29 23-7 1-13-1-18-5-7-6-16-7-28-5Z"/>
    </defs>
    {flock.map((bird, index) => <use key={index} className={`ink-bird ink-bird-${index}`} href={`#bird-${bird.shape}`} transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`} />)}
  </svg>;
}
