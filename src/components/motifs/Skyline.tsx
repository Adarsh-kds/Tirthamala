const n = (v: number) => Math.round(v * 10) / 10;

type Shape = { d: string; ribs?: number[] };

function nagara(cx: number, b: number, w: number, h: number): Shape[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const top = b - 0.9 * h;
  const body =
    `M${n(x0)} ${b}L${n(x0)} ${n(b - 0.16 * h)}` +
    `C${n(x0)} ${n(b - 0.62 * h)} ${n(cx - 0.17 * w)} ${n(b - 0.86 * h)} ${n(cx - 0.13 * w)} ${n(top)}` +
    `L${n(cx + 0.13 * w)} ${n(top)}` +
    `C${n(cx + 0.17 * w)} ${n(b - 0.86 * h)} ${n(x1)} ${n(b - 0.62 * h)} ${n(x1)} ${n(b - 0.16 * h)}` +
    `L${n(x1)} ${b}Z`;
  const ay = b - 0.925 * h;
  const rx = 0.2 * w;
  const ry = 0.035 * h;
  const amalaka = `M${n(cx - rx)} ${n(ay)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(ay)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(ay)}Z`;
  const neck = `M${n(cx - 0.07 * w)} ${n(b - 0.965 * h)}h${n(0.14 * w)}v${n(0.05 * h)}h${n(-0.14 * w)}Z`;
  const kr = Math.max(0.045 * w, 2.5);
  const ky = b - 0.99 * h;
  const kalash = `M${n(cx - kr)} ${n(ky)}a${n(kr)} ${n(kr)} 0 1 0 ${n(2 * kr)} 0a${n(kr)} ${n(kr)} 0 1 0 ${n(-2 * kr)} 0Z`;
  const spire = `M${n(cx - kr * 0.4)} ${n(ky - kr)}L${n(cx)} ${n(ky - kr * 3.2)}L${n(cx + kr * 0.4)} ${n(ky - kr)}Z`;
  const ribs = [0.3, 0.42, 0.54, 0.66, 0.78].map((f) => n(b - f * h));
  return [{ d: body, ribs }, { d: amalaka }, { d: neck }, { d: kalash }, { d: spire }];
}

function flag(cx: number, b: number, w: number, h: number) {
  const base = b - 0.99 * h - Math.max(0.045 * w, 2.5) * 3;
  const pole = `M${n(cx - 0.6)} ${n(base)}h1.2v${n(-0.16 * h)}h-1.2Z`;
  const cloth = `M${n(cx + 0.6)} ${n(base - 0.16 * h)}L${n(cx + 0.6 + Math.max(0.22 * w, 14))} ${n(base - 0.12 * h)}L${n(cx + 0.6)} ${n(base - 0.08 * h)}Z`;
  return { pole, cloth };
}

function mandapa(cx: number, b: number, w: number, h: number) {
  const parts: string[] = [];
  const baseH = 0.42 * h;
  parts.push(`M${n(cx - w / 2)} ${b}v${n(-baseH)}h${n(w)}v${n(baseH)}Z`);
  const tiers = 4;
  const tierH = (0.5 * h) / tiers;
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1.06 - i * 0.2);
    const y = b - baseH - (i + 1) * tierH;
    parts.push(
      `M${n(cx - tw / 2)} ${n(y + tierH)}L${n(cx - tw / 2 + tierH * 0.6)} ${n(y)}h${n(tw - tierH * 1.2)}L${n(cx + tw / 2)} ${n(y + tierH)}Z`,
    );
  }
  const ky = b - 0.95 * h;
  parts.push(`M${n(cx - 4)} ${n(ky)}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z`);
  const windows = [-0.28, 0, 0.28].map((f) => ({
    x: n(cx + f * w - 5),
    y: n(b - baseH * 0.78),
    h: n(baseH * 0.62),
  }));
  return { d: parts.join(""), windows };
}

function gopuram(cx: number, b: number, w: number, h: number) {
  const parts: string[] = [];
  const tiers = 7;
  const tierH = (0.86 * h) / tiers;
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - i * 0.1);
    const y = b - (i + 1) * tierH;
    parts.push(
      `M${n(cx - tw / 2)} ${n(y + tierH)}L${n(cx - tw / 2 + 3)} ${n(y)}h${n(tw - 6)}L${n(cx + tw / 2)} ${n(y + tierH)}Z`,
    );
  }
  const topW = w * 0.36;
  const topY = b - 0.86 * h;
  parts.push(
    `M${n(cx - topW / 2)} ${n(topY)}v${n(-0.06 * h)}q0 ${n(-0.07 * h)} ${n(0.07 * h)} ${n(-0.07 * h)}h${n(topW - 0.14 * h)}q${n(0.07 * h)} 0 ${n(0.07 * h)} ${n(0.07 * h)}v${n(0.06 * h)}Z`,
  );
  const ky = topY - 0.13 * h;
  for (const f of [-0.36, -0.18, 0, 0.18, 0.36]) {
    const x = cx + f * topW;
    parts.push(
      `M${n(x - 2.4)} ${n(ky + 3)}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0ZM${n(x - 0.8)} ${n(ky + 1)}L${n(x)} ${n(ky - 6)}L${n(x + 0.8)} ${n(ky + 1)}Z`,
    );
  }
  const door = { x: n(cx - w * 0.09), y: n(b - h * 0.24), w: n(w * 0.18), h: n(h * 0.24) };
  const ribs = Array.from({ length: tiers }, (_, i) => {
    const tw = w * (1 - i * 0.1) - 10;
    return `M${n(cx - tw / 2)} ${n(b - (i + 1) * tierH + 2)}h${n(tw)}`;
  });
  return { d: parts.join(""), door, ribs };
}

function chhatri(cx: number, b: number, w: number, h: number) {
  const parts: string[] = [];
  const plinth = 0.16 * h;
  parts.push(`M${n(cx - w / 2 - 4)} ${b}v${n(-plinth)}h${n(w + 8)}v${n(plinth)}Z`);
  const colTop = b - 0.62 * h;
  for (const f of [-0.5, -0.17, 0.17, 0.5]) {
    const x = cx + f * (w - 4);
    parts.push(`M${n(x - 1.6)} ${n(b - plinth)}V${n(colTop)}h3.2V${n(b - plinth)}Z`);
  }
  parts.push(`M${n(cx - w / 2 - 3)} ${n(colTop + 3)}h${n(w + 6)}v-3h${n(-w - 6)}Z`);
  const r = w / 2;
  parts.push(`M${n(cx - r)} ${n(colTop)}A${n(r)} ${n(r * 0.95)} 0 0 1 ${n(cx + r)} ${n(colTop)}Z`);
  parts.push(
    `M${n(cx - 1)} ${n(colTop - r * 0.95)}L${n(cx)} ${n(colTop - r * 0.95 - 9)}L${n(cx + 1)} ${n(colTop - r * 0.95)}Z`,
  );
  return parts.join("");
}

function tree(cx: number, b: number, s: number) {
  const blobs = [
    [0, -0.62, 0.42],
    [-0.32, -0.5, 0.3],
    [0.34, -0.52, 0.32],
    [-0.12, -0.86, 0.3],
    [0.18, -0.82, 0.28],
  ];
  const trunk = `M${n(cx - 0.06 * s)} ${b}L${n(cx - 0.04 * s)} ${n(b - 0.5 * s)}h${n(0.08 * s)}L${n(cx + 0.06 * s)} ${b}Z`;
  return (
    trunk +
    blobs
      .map(([x, y, r]) => {
        const px = cx + x * s;
        const py = b + y * s;
        const rr = r * s;
        return `M${n(px - rr)} ${n(py)}a${n(rr)} ${n(rr)} 0 1 0 ${n(2 * rr)} 0a${n(rr)} ${n(rr)} 0 1 0 ${n(-2 * rr)} 0Z`;
      })
      .join("")
  );
}

const B = 300;
const NAGARAS: [number, number, number][] = [
  [1130, 170, 290],
  [1046, 78, 150],
  [1214, 78, 150],
  [1318, 74, 140],
  [452, 62, 122],
  [392, 40, 78],
];
const MANDAPAS: [number, number, number][] = [
  [992, 116, 92],
  [318, 112, 88],
];
const CHHATRIS: [number, number, number][] = [
  [598, 34, 44],
  [720, 46, 58],
  [842, 34, 44],
];
const GOPURAM = gopuram(178, B, 214, 262);
const TREES: [number, number][] = [
  [36, 92],
  [1410, 104],
  [530, 54],
  [910, 60],
];
const FLAGS = [NAGARAS[0], NAGARAS[4], NAGARAS[3]].map(([cx, w, h]) => flag(cx, B, w, h));
const STEPS = [0, 1, 2, 3, 4, 5].map((i) => B + i * 10);
const LAMPS = [
  [262, 303],
  [300, 313],
  [410, 303],
  [520, 323],
  [600, 303],
  [690, 313],
  [770, 303],
  [850, 323],
  [930, 303],
  [1010, 313],
  [1090, 303],
  [1180, 323],
  [1250, 303],
  [1350, 313],
  [140, 323],
  [60, 303],
];

export function Temples({ id, lamps = true }: { id: string; lamps?: boolean }) {
  const nagaraShapes = NAGARAS.map(([cx, w, h]) => nagara(cx, B, w, h));
  const mandapaShapes = MANDAPAS.map(([cx, w, h]) => mandapa(cx, B, w, h));
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className="skyline-svg"
    >
      <defs>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.35" stopColor="#ffc861" />
          <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-door`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffcf73" stopOpacity="0.15" />
          <stop offset="1" stopColor="#ffb14a" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <g fill="var(--temple)">
        {TREES.map(([cx, s]) => (
          <path key={cx} d={tree(cx, B, s)} opacity="0.92" />
        ))}
        <path d={GOPURAM.d} />
        {mandapaShapes.map((m, i) => (
          <path key={i} d={m.d} />
        ))}
        {nagaraShapes.flat().map((s, i) => (
          <path key={i} d={s.d} />
        ))}
        {CHHATRIS.map(([cx, w, h]) => (
          <path key={cx} d={chhatri(cx, B, w, h)} />
        ))}
        <rect x="0" y={B} width="1440" height="60" />
      </g>
      <g stroke="var(--accent-gold)" strokeOpacity="0.16" strokeWidth="1" fill="none">
        {GOPURAM.ribs.map((d) => (
          <path key={d} d={d} />
        ))}
        {STEPS.map((y) => (
          <path key={y} d={`M0 ${y}H1440`} />
        ))}
      </g>
      <g fill={`url(#${id}-door)`}>
        <rect
          x={GOPURAM.door.x}
          y={GOPURAM.door.y}
          width={GOPURAM.door.w}
          height={GOPURAM.door.h}
          rx="10"
        />
        {mandapaShapes.flatMap((m, i) =>
          m.windows.map((w, j) => (
            <rect key={`${i}-${j}`} x={w.x} y={w.y} width="10" height={w.h} rx="5" />
          )),
        )}
      </g>
      {FLAGS.map((f, i) => (
        <g key={i}>
          <path d={f.pole} fill="var(--temple)" />
          <path d={f.cloth} fill="var(--sindoor)" className="flag-wave" />
        </g>
      ))}
      {lamps && (
        <g>
          {LAMPS.map(([x, y], i) => (
            <g key={i} className="lamp" style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}>
              <circle cx={x} cy={y - 2} r="9" fill={`url(#${id}-lamp)`} />
              <circle cx={x} cy={y - 2} r="1.6" fill="#fff6d8" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = rng(108);
const STARS = Array.from({ length: 130 }, (_, i) => ({
  x: n(rand() * 1440),
  y: n(Math.pow(rand(), 1.6) * 520),
  r: n(0.5 + rand() * 1.3),
  o: n(0.35 + rand() * 0.6),
  tw: i % 6 === 0,
}));

export function Stars() {
  return (
    <svg
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fff4d6"
          opacity={s.o}
          className={s.tw ? "twinkle" : undefined}
          style={s.tw ? { animationDelay: `${(i % 7) * 0.6}s` } : undefined}
        />
      ))}
    </svg>
  );
}

const FAR =
  "M0 260L60 214L118 236L190 168L236 196L300 120L352 168L420 140L470 176L540 96L600 150L660 128L720 172L790 110L850 156L912 84L980 150L1040 126L1104 170L1170 102L1236 150L1290 132L1352 176L1440 140V360H0Z";
const SNOW =
  "M276 140L300 120L322 140L310 136L300 146L288 134ZM518 116L540 96L562 116L548 112L540 122L530 110ZM890 104L912 84L934 104L920 100L912 110L902 98ZM1148 122L1170 102L1192 122L1178 118L1170 128L1160 116ZM768 130L790 110L812 130L798 126L790 136L780 124Z";
const NEAR =
  "M0 280C120 240 200 262 300 246S500 214 620 240S860 270 980 238S1220 222 1320 246S1420 262 1440 258V360H0Z";

export function Mountains() {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className="skyline-svg"
    >
      <path d={FAR} fill="var(--hill-far)" />
      <path d={SNOW} fill="#f6ead2" opacity="0.18" />
      <path d={NEAR} fill="var(--hill-near)" />
    </svg>
  );
}
