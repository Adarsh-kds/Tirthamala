import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  shaiva: (
    <>
      <path d="M12 22V5" />
      <path d="M12 2.5 10.9 5h2.2z" />
      <path d="M6.5 4.5c0 3.6 2.3 5.5 5.5 5.5s5.5-1.9 5.5-5.5" />
      <path d="M6.5 4.5 5.7 3M17.5 4.5l.8-1.5" />
      <path d="M10 14h4l-4 3.6h4z" />
    </>
  ),
  shakta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.3 8.2h11.4L12 18.2z" />
      <circle cx="12" cy="11.4" r="1" fill="currentColor" />
    </>
  ),
  vaishnava: (
    <>
      <path d="M7 3.5V12a5 5 0 0 0 10 0V3.5" />
      <path d="M12 7v13" />
      <path d="M9 21h6" />
    </>
  ),
  ganapatya: (
    <>
      <path d="M12 3c-1.2 3.2-6 6.8-6 11a6 6 0 0 0 12 0c0-4.2-4.8-7.8-6-11z" />
      <path d="M12 3v17M9.2 8.5c-.2 3.6.6 7.6 2.8 11.5M14.8 8.5c.2 3.6-.6 7.6-2.8 11.5" />
    </>
  ),
  kaumara: (
    <>
      <path d="M12 22V11" />
      <path d="M12 2c3.2 3 3.6 6.2 0 9-3.6-2.8-3.2-6 0-9z" />
      <path d="M9.4 13.2h5.2" />
    </>
  ),
  ayyappa: (
    <>
      <path d="M3 20.5h18" />
      <path d="M4.5 20.5 12 7l7.5 13.5" />
      <path d="M9.5 20.5v-2h5v2M10.7 18.5v-2h2.6v2" />
      <circle cx="12" cy="3.6" r="1.1" fill="currentColor" />
    </>
  ),
  saura: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  navagraha: (
    <>
      {[6, 12, 18].flatMap((y) =>
        [6, 12, 18].map((x) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={x === 12 && y === 12 ? 2.4 : 1.5}
            fill={x === 12 && y === 12 ? "none" : "currentColor"}
          />
        )),
      )}
    </>
  ),
  dattatreya: (
    <>
      <path d="M9 4.5h6" />
      <path d="M10 4.5v3.2a5.6 5.6 0 1 0 4 0V4.5" />
      <path d="M16.8 12.4 20.5 10" />
    </>
  ),
  jain: (
    <>
      <path d="M8 13V8.5a1.2 1.2 0 0 1 2.4 0V6.8a1.2 1.2 0 0 1 2.4 0v.7a1.2 1.2 0 0 1 2.4 0v1.4a1.2 1.2 0 0 1 2.4 0V15a6 6 0 0 1-6 6h-.4a5 5 0 0 1-4.3-2.5L5 14.2a1.2 1.2 0 0 1 2-1.3L8 14" />
      <circle cx="12.9" cy="15" r="2" />
    </>
  ),
  buddhist: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.3 4.3M13.4 13.4l4.3 4.3M6.3 17.7l4.3-4.3M13.4 10.6l4.3-4.3" />
    </>
  ),
  sikh: (
    <>
      <circle cx="12" cy="13" r="4.4" />
      <path d="M12 3.5v17M10.9 6 12 3.5 13.1 6" />
      <path d="M5.4 7.5c-1.7 5.2.8 10.4 6.1 12.5M18.6 7.5c1.7 5.2-.8 10.4-6.1 12.5" />
    </>
  ),
  islamic: (
    <>
      <path d="M5.5 21V11.5C5.5 7.3 12 4.8 12 3c0 1.8 6.5 4.3 6.5 8.5V21" />
      <path d="M9.2 21v-6.5a2.8 2.8 0 0 1 5.6 0V21" />
      <path d="M3.5 21h17" />
    </>
  ),
  christian: <path d="M12 3v18M7 8.5h10" />,
  parsi: (
    <>
      <path d="M8 21h8M9.6 21l.9-3.6h3l.9 3.6M7 17.4h10" />
      <path d="M12 15.4c-2.4 0-3.6-1.9-3.1-4 .4-1.6 2-2.4 2-5.2 2.1 1.5 4.6 3.6 4.1 6.4-.3 1.7-1.4 2.8-3 2.8z" />
    </>
  ),
  other: (
    <path d="M3 8.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 17.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  ),
};

export function TraditionIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[slug] ?? ICONS.other}
    </svg>
  );
}
