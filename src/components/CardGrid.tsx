import type { Card } from "@/lib/view";
import { getTraditions } from "@/lib/data";
import { SiteCard } from "./SiteCard";

export function CardGrid({ cards }: { cards: Card[] }) {
  const trads = getTraditions();
  const nameOf = (s: string) => trads.find((t) => t.slug === s)?.name ?? s;
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <li key={c.slug} className="flex">
          <div className="flex-1">
            <SiteCard card={c} tradName={nameOf} />
          </div>
        </li>
      ))}
    </ul>
  );
}
