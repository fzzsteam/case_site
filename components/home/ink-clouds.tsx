import { useId } from "react";

export function InkClouds({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg className={className} viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-wash`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf8ef" stopOpacity=".96"/><stop offset=".62" stopColor="#dce4dc" stopOpacity=".66"/><stop offset="1" stopColor="#aabeb4" stopOpacity=".08"/></linearGradient>
      <linearGradient id={`${id}-pale`} x1="0" x2="1"><stop stopColor="#f8f4ea" stopOpacity=".18"/><stop offset=".45" stopColor="#f8f4ea" stopOpacity=".88"/><stop offset="1" stopColor="#c7d4cc" stopOpacity=".18"/></linearGradient>
      <filter id={`${id}-ink`} x="-10%" y="-25%" width="120%" height="150%"><feTurbulence type="fractalNoise" baseFrequency=".012 .045" numOctaves="3" seed="17" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="B"/><feGaussianBlur stdDeviation=".7"/></filter>
      <filter id={`${id}-soft`} x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <g filter={`url(#${id}-ink)`}>
      <path fill={`url(#${id}-wash)`} d="M-70 292C44 267 77 211 171 218c61-84 164-89 226-19 82-48 179-22 210 51 93-36 185-13 226 54 65-36 147-35 198 18 99-58 232-25 267 60H-70Z"/>
      <path fill={`url(#${id}-pale)`} d="M-24 176c78-5 115-50 181-42 42-61 124-71 177-18 67-31 143-6 164 48 92-24 163 9 186 68-127 18-246 6-369 18-107 10-221 14-339-8Z"/>
      <path fill="#edf1e9" fillOpacity=".48" d="M554 312c65-42 130-35 169 4 50-82 167-86 222-14 78-44 181-22 213 50 72-22 160 2 190 59H506c3-38 18-73 48-99Z"/>
      <path fill="#f9f6ed" fillOpacity=".8" d="M885 144c48-31 102-24 128 11 35-48 106-55 151-13 59-27 125-6 146 42-89 22-191 8-281 19-56 7-112 9-169-3 1-22 9-41 25-56Z"/>
      <path fill="#d7e0d8" fillOpacity=".35" d="M155 334c87-26 162-20 225 19 90-32 197-17 244 49H59c17-34 50-57 96-68Z"/>
    </g>
    <path filter={`url(#${id}-soft)`} fill="#ffffff" fillOpacity=".35" d="M0 344c249-45 430-7 640-15 269-11 465-50 800 18v73H0Z"/>
  </svg>;
}
