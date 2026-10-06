import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Card } from "@/lib/view";
import { AccuracyBadge, StatusBadge, TraditionChip } from "./Badges";
import { TraditionIcon } from "./motifs/TraditionIcon";

export function SiteCard({ card, tradName }: { card: Card; tradName: (s: string) => string }) {
  const place = [card.city, card.state].filter((v, i, a) => v && a.indexOf(v) === i).join(", ");
  const lead = card.traditions[0] ?? "other";
  return (
    <article className="site-card" style={{ ["--c" as string]: `var(--trad-${lead})` }}>
      <div className="site-card-art" aria-hidden="true">
        <TraditionIcon slug={lead} className="site-card-icon" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={card.status} />
        {card.contentState !== "published" && (
          <span
            className="text-[0.7rem] tracking-wide uppercase"
            style={{ color: "var(--text-soft)" }}
          >
            {t("card.draft")}
          </span>
        )}
      </div>
      <h3 className="font-display mt-3 text-[1.45rem] leading-tight font-semibold">
        <Link href={`/site/${card.slug}/`} className="stretched-link">
          {card.name}
        </Link>
      </h3>
      {card.nameDevanagari && (
        <p
          lang="sa"
          className="font-sanskrit mt-0.5 text-sm"
          style={{ color: "var(--accent-gold)" }}
        >
          {card.nameDevanagari}
        </p>
      )}
      <p className="mt-2 flex items-start gap-1.5 text-xs" style={{ color: "var(--text-soft)" }}>
        <svg
          viewBox="0 0 24 24"
          className="mt-px h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
        {place}
      </p>
      <p className="mt-3 line-clamp-3 text-[0.85rem] leading-relaxed">{card.summary}</p>
      <div
        className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t pt-3"
        style={{ borderColor: "var(--glass-border)" }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {card.traditions.map((tr) => (
            <TraditionChip key={tr} slug={tr} name={tradName(tr)} />
          ))}
        </div>
        <AccuracyBadge accuracy={card.accuracy} />
      </div>
    </article>
  );
}
