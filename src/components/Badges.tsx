import { t, type MessageKey } from "@/lib/i18n";

const ICON: Record<string, string> = { verified: "✓", disputed: "≠", "needs-review": "?" };

export const tradColor = (slug: string) => `var(--trad-${slug}, var(--trad-other))`;

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="status-seal"
      data-status={status}
      title={t(`status.${status}.help` as MessageKey)}
    >
      <span aria-hidden="true">{ICON[status]}</span>
      {t(`status.${status}` as MessageKey)}
    </span>
  );
}

export function AccuracyBadge({ accuracy }: { accuracy: string }) {
  return (
    <span className="text-text-soft text-[0.7rem]">{t(`accuracy.${accuracy}` as MessageKey)}</span>
  );
}

export function TraditionChip({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem]">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: tradColor(slug) }}
      />
      {name}
    </span>
  );
}
