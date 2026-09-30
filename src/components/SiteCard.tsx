import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Card } from "@/lib/view";
import { AccuracyBadge, StatusBadge, TraditionChip } from "./Badges";

export function SiteCard({ card, tradName }: { card: Card; tradName: (s: string) => string }) {
  const place = [card.city, card.state].filter((v, i, a) => v && a.indexOf(v) === i).join(", ");
  return (
    <article
      className="flex flex-col gap-2 rounded-lg border p-4"
      style={{
        borderColor: "var(--rule)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h3 className="font-display text-xl leading-tight font-semibold">
        <Link
          href={`/site/${card.slug}/`}
          className="underline-offset-4 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {card.name}
        </Link>
      </h3>
      {card.nameDevanagari && (
        <p lang="sa" className="font-sanskrit text-sm" style={{ color: "var(--text-soft)" }}>
          {card.nameDevanagari}
        </p>
      )}
      <p className="text-sm" style={{ color: "var(--text-soft)" }}>
        {place}
      </p>
      <p className="text-sm">{card.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
        {card.traditions.map((tr) => (
          <TraditionChip key={tr} slug={tr} name={tradName(tr)} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusBadge status={card.status} />
        <AccuracyBadge accuracy={card.accuracy} />
        {card.contentState !== "published" && (
          <span className="text-xs" style={{ color: "var(--text-soft)" }}>
            {t("card.draft")}
          </span>
        )}
      </div>
    </article>
  );
}
