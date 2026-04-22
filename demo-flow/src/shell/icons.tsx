/** Rail icons — hand-tuned 18×18 strokes that match packages/design artboard. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function GridIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <rect x="2" y="2" width="6" height="6" rx="1.2" />
      <rect x="10" y="2" width="6" height="6" rx="1.2" />
      <rect x="2" y="10" width="6" height="6" rx="1.2" />
      <rect x="10" y="10" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export function FolderIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M2.5 5.25c0-.69.56-1.25 1.25-1.25h3L8.25 5.75h5.5c.69 0 1.25.56 1.25 1.25v6.25c0 .69-.56 1.25-1.25 1.25H3.75c-.69 0-1.25-.56-1.25-1.25V5.25z" />
    </svg>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M3 4.5c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H7.5L4.5 15v-3c-.83 0-1.5-.67-1.5-1.5v-6z" />
    </svg>
  );
}

export function SparkleIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M9 1.5l1.8 4.7 4.7 1.8-4.7 1.8L9 14.5l-1.8-4.7L2.5 8l4.7-1.8L9 1.5z" />
      <path d="M14.25 11l.5 1.25 1.25.5-1.25.5-.5 1.25-.5-1.25-1.25-.5 1.25-.5.5-1.25z" strokeWidth={1.2} />
    </svg>
  );
}

export function RobotIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <rect x="3" y="5.5" width="12" height="9" rx="2" />
      <path d="M9 5.5V3M9 3a1 1 0 1 1 0-.01" />
      <circle cx="6.5" cy="9.5" r="1" strokeWidth={1.4} />
      <circle cx="11.5" cy="9.5" r="1" strokeWidth={1.4} />
      <path d="M6.5 12.25h5" strokeWidth={1.2} />
    </svg>
  );
}

export function PlugIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M4.5 2.5v2.5m3-2.5v2.5" />
      <rect x="3.5" y="5" width="5" height="4" rx="1.2" />
      <path d="M6 9v2.2a2.2 2.2 0 0 0 2.2 2.2H10" />
      <path d="M10 11.5h4.5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H13" />
    </svg>
  );
}

export function HelixIcon(p: IconProps) {
  // DNA-esque — used for Memory
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M5 2c0 3 8 4 8 7s-8 4-8 7" strokeWidth={1.3} />
      <path d="M13 2c0 3-8 4-8 7s8 4 8 7" strokeWidth={1.3} />
      <path d="M5.7 5.5h6.6M5.7 12.5h6.6" strokeWidth={1.2} />
    </svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...p}>
      <path d="M8 2v12M2 8h12" />
    </svg>
  );
}

export function ShieldCheckIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M9 2L2.5 5v4.5c0 3.5 2.6 6.3 6.5 7 3.9-.7 6.5-3.5 6.5-7V5L9 2z" />
      <path d="M6.5 9l2 2 3.5-4" strokeWidth={1.4} />
    </svg>
  );
}

export function BarsIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <path d="M3 15V9.5M7 15V4M11 15v-6.5M15 15v-9" />
    </svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 18 18" {...p}>
      <circle cx="9" cy="9" r="2.25" strokeWidth={1.4} />
      <path d="M9 2.5v1.8M9 13.7v1.8M15.5 9h-1.8M4.3 9H2.5M13.65 4.35l-1.28 1.28M5.63 12.37l-1.28 1.28M13.65 13.65l-1.28-1.28M5.63 5.63L4.35 4.35" strokeWidth={1.3} />
    </svg>
  );
}

export function ChevronDown(p: IconProps) {
  return (
    <svg viewBox="0 0 10 10" {...p}>
      <path d="M2 3.75l3 3 3-3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <svg viewBox="0 0 10 10" {...p}>
      <path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 9 9" {...p}>
      <path d="M1.5 1.5l6 6M7.5 1.5l-6 6" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  );
}

export function PaneLeftIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 15 15" {...p}>
      <rect x="1.5" y="2.5" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth={1.2} />
      <line x1="6" y1="2.5" x2="6" y2="12.5" stroke="currentColor" strokeWidth={1.2} />
    </svg>
  );
}

export function PaneRightIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 15 15" {...p}>
      <rect x="1.5" y="2.5" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth={1.2} />
      <line x1="9.5" y1="2.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth={1.2} />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...p}>
      <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth={1.4} />
      <path d="M9.25 9.25l3 3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}
