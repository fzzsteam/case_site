/** 万象元生页面用到的线性图标，统一 24 视窗、currentColor 描边。 */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconCompass({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z" />
    </svg>
  );
}

export function IconPen({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
      <path d="m20.5 12.5-6 6L12 19l.5-2.5 6-6a1.4 1.4 0 0 1 2 2Z" />
    </svg>
  );
}

export function IconPlay({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5z" />
    </svg>
  );
}

export function IconSpark({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 11 10.1 9z" />
      <path d="M18.5 4v3M20 5.5h-3" />
    </svg>
  );
}

export function IconCheck({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2.4} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconArrow({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2} aria-hidden>
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  );
}

export function IconClose({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconZoom({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={1.9} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M11 8.6v4.8M8.6 11h4.8" />
    </svg>
  );
}

export function IconShield({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M12 3 5 5.8v5.5c0 4.2 2.9 7.6 7 9.2 4.1-1.6 7-5 7-9.2V5.8z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  );
}

export function IconChip({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
    </svg>
  );
}

export function IconLink({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M10.5 13.5a3.6 3.6 0 0 0 5.2.3l2.4-2.4a3.6 3.6 0 0 0-5.1-5.1L11.6 7.7" />
      <path d="M13.5 10.5a3.6 3.6 0 0 0-5.2-.3l-2.4 2.4a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4" />
    </svg>
  );
}

export function IconLab({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M10 3v6.2L4.9 17A2 2 0 0 0 6.6 20h10.8a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path d="M9 3h6M7.6 14.6h8.8" />
    </svg>
  );
}

export const BADGE_ICONS = {
  shield: IconShield,
  chip: IconChip,
  link: IconLink,
  lab: IconLab,
};
