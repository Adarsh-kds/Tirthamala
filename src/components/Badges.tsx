import { t } from "@/lib/i18n";
import { ACCURACY_LABEL, STATUS_LABEL } from "@/lib/view";

const ICON: Record<string, string> = { verified: "✓", disputed: "≠", "needs-review": "?" };

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
      style={{ borderColor: "var(--rule)", color: "var(--text-soft)" }}
      title={t(`status.${status}.help` as never)}
    >
      <span aria-hidden="true">{ICON[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function AccuracyBadge({ accuracy }: { accuracy: string }) {
  return (
    <span className="text-xs" style={{ color: "var(--text-soft)" }}>
      {ACCURACY_LABEL[accuracy]}
    </span>
  );
}

export function TraditionChip({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: `var(--trad-${slug in TRAD_VAR ? slug : "other"})` }}
      />
      {name}
    </span>
  );
}

const TRAD_VAR: Record<string, true> = Object.fromEntries(
  [
    "shaiva",
    "shakta",
    "vaishnava",
    "ganapatya",
    "kaumara",
    "ayyappa",
    "saura",
    "navagraha",
    "dattatreya",
    "jain",
    "buddhist",
    "sikh",
    "islamic",
    "christian",
    "parsi",
    "other",
  ].map((k) => [k, true]),
);
