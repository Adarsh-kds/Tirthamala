import type { ReactNode } from "react";
import { t } from "@/lib/i18n";
import type { Source } from "@/lib/schema";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHeading({
  crumbs,
  title,
  large,
}: {
  crumbs: Crumb[];
  title: string;
  large?: boolean;
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <h1
        className={`font-display text-accent mt-4 text-4xl font-semibold ${large ? "md:text-5xl" : ""}`}
      >
        {title}
      </h1>
    </>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10">
      <h2 id={`${id}-h`} className="font-display text-accent text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export const Paras = ({ text }: { text?: string }) =>
  text?.split(/\n{2,}/).map((p, i) => (
    <p key={i} className="mt-3">
      {p}
    </p>
  ));

export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      className="border-accent-gold mt-6 rounded-lg border p-4 text-sm"
      style={{ background: "var(--surface)" }}
    >
      <strong>{t("site.draftTitle")}</strong> {children}
    </aside>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return <p className="mt-3">{t("site.noSources")}</p>;
  return (
    <ol className="mt-3 list-decimal space-y-1 pl-6">
      {sources.map((x, i) => (
        <li key={i} id={`src-${i + 1}`}>
          <a className="underline" href={x.url} rel="noopener noreferrer">
            {x.title}
          </a>
          {x.publisher ? `, ${x.publisher}` : ""}{" "}
          <span className="text-text-soft text-sm">
            ({t(`source.${x.type}`)}; {t("site.accessed")} {x.accessed})
          </span>
        </li>
      ))}
    </ol>
  );
}
