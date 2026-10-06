const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (r: number, a: number) => `${r1(r * Math.cos(a))} ${r1(r * Math.sin(a))}`;

function petals(count: number, inner: number, outer: number, spread: number, offset = 0) {
  const d: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = offset + (i / count) * Math.PI * 2;
    const s = (Math.PI / count) * spread;
    const mid = inner + (outer - inner) * 0.55;
    d.push(`M${pt(inner, a)}Q${pt(mid, a - s)} ${pt(outer, a)}Q${pt(mid, a + s)} ${pt(inner, a)}Z`);
  }
  return d.join("");
}

function dots(count: number, r: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = offset + (i / count) * Math.PI * 2;
    return { x: r1(r * Math.cos(a)), y: r1(r * Math.sin(a)) };
  });
}

const OUTER = petals(36, 395, 478, 0.9);
const MIDDLE = petals(24, 268, 380, 1, Math.PI / 24);
const INNER = petals(16, 158, 255, 1);
const CORE = petals(8, 62, 146, 1.15, Math.PI / 8);
const RING_DOTS = dots(72, 388);
const MID_DOTS = dots(48, 262);

export function Mandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-500 -500 1000 1000"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <circle r="492" strokeWidth="1" strokeDasharray="2 10" />
      <circle r="482" strokeWidth="1.2" />
      <path d={OUTER} strokeWidth="1.1" />
      <circle r="392" strokeWidth="0.8" />
      {RING_DOTS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="currentColor" stroke="none" />
      ))}
      <path d={MIDDLE} strokeWidth="1.1" />
      <circle r="265" strokeWidth="1" />
      {MID_DOTS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="currentColor" stroke="none" />
      ))}
      <path d={INNER} strokeWidth="1.1" />
      <circle r="155" strokeWidth="1" strokeDasharray="1 6" />
      <path d={CORE} strokeWidth="1.2" />
      <circle r="58" strokeWidth="1.2" />
    </svg>
  );
}
