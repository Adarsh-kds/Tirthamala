export function Lotus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    >
      <path d="M24 4c4 5 4.5 13 0 21-4.5-8-4-16 0-21z" />
      <path d="M24 25c-3-6-8-10-14-11 1 7 6 11 14 11zM24 25c3-6 8-10 14-11-1 7-6 11-14 11z" />
      <path d="M24 26c-6-1-12-3-18-7 2 5 9 8 18 7zM24 26c6-1 12-3 18-7-2 5-9 8-18 7z" />
      <path d="M12 29h24" />
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className ?? ""}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent-gold)] opacity-70" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-gold)]" />
      <Lotus className="h-5 w-7 text-[var(--accent-gold)]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-gold)]" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent-gold)] opacity-70" />
    </div>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = "center",
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "center" | "left";
}) {
  const c = align === "center";
  return (
    <header className={`reveal ${c ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="font-display mt-2 text-4xl leading-tight font-medium md:text-5xl">
        <span className="gold-text">{title}</span>
      </h2>
      {c && <Divider className="mt-4" />}
      {lede && (
        <p className="mt-4 text-[0.95rem]" style={{ color: "var(--text-soft)" }}>
          {lede}
        </p>
      )}
    </header>
  );
}
