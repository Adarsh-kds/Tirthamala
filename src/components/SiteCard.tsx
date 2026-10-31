import { IntentLink } from "@/components/IntentLink";
import { t } from "@/lib/i18n";
import type { Card } from "@/lib/view";
import { AccuracyBadge, StatusBadge, TraditionChip, tradColor } from "./Badges";
import { PinIcon, TraditionIcon } from "./motifs/TraditionIcon";

export function SiteCard({ card, tradName }: { card: Card; tradName: (s: string) => string }) {
  const place = [card.city, card.state].filter((v, i, a) => v && a.indexOf(v) === i).join(", ");
  const lead = card.traditions[0] ?? "other";
  return (
    <article className="site-card" style={{ ["--c" as string]: tradColor(lead) }}>
      <div className="site-card-art" aria-hidden="true">
        <TraditionIcon slug={lead} className="site-card-icon" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={card.status} />
        {card.contentState !== "published" && (
          <span className="text-text-soft text-[0.7rem] tracking-wide uppercase">
            {t("card.draft")}
          </span>
        )}
      </div>
      <h3 className="font-display mt-3 text-[1.45rem] leading-tight font-semibold">
        <IntentLink href={`/site/${card.slug}/`} className="stretched-link">
          {card.name}
        </IntentLink>
      </h3>
      {card.nameDevanagari && (
        <p lang="sa" className="font-sanskrit text-accent-gold mt-0.5 text-sm">
          {card.nameDevanagari}
        </p>
      )}
      <p className="text-text-soft mt-2 flex items-start gap-1.5 text-xs">
        <PinIcon className="mt-px h-3.5 w-3.5 shrink-0" />
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
