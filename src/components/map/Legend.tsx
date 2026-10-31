import { t } from "@/lib/i18n";

export function Legend() {
  return (
    <div
      className="mt-4 border-t pt-3 text-xs"
      style={{ borderColor: "var(--rule)", color: "var(--text-soft)" }}
    >
      <p className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: "var(--text-soft)" }}
        />{" "}
        {t("legend.exact")}
      </p>
      <p className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full border-2"
          style={{ borderColor: "var(--text-soft)" }}
        />{" "}
        {t("legend.approx")}
      </p>
      <p className="mt-1">{t("legend.colour")}</p>
    </div>
  );
}
