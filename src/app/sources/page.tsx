import type { Metadata } from "next";
import { Page } from "@/components/Prose";
import { getCircuits, getSites } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "The source hierarchy the Tirtha Atlas uses, and every publisher it currently cites.",
  alternates: { canonical: "/sources/" },
};

export default function Sources() {
  const counts = new Map<string, { n: number; types: Set<string> }>();
  for (const x of [
    ...getSites().flatMap((s) => s.sources),
    ...getCircuits().flatMap((c) => c.sources),
  ]) {
    let host = x.url;
    try {
      host = new URL(x.url).hostname.replace(/^www\./, "");
    } catch {}
    const cur = counts.get(host) ?? { n: 0, types: new Set<string>() };
    cur.n++;
    cur.types.add(x.type);
    counts.set(host, cur);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
  return (
    <Page title="Sources" crumb="Sources">
      <h2>Source hierarchy</h2>
      <ul>
        <li>
          <strong>Primary and scholarly:</strong> scriptural texts, the Archaeological Survey of
          India, inscriptions, academic works, gazetteers.
        </li>
        <li>
          <strong>Official:</strong> temple trusts and boards, state tourism departments, UNESCO,
          government ministries.
        </li>
        <li>
          <strong>Reputable secondary:</strong> established encyclopedias, respected books and
          museums.
        </li>
        <li>
          <strong>Leads only:</strong> Wikipedia, blogs, travel sites and forums. These point us to
          better sources and never verify a page alone.
        </li>
      </ul>
      <h2>Publishers currently cited</h2>
      <p>
        Counts are citations across all pages. Many official Indian sites block automated reading,
        which is one reason many pages are still marked as needing review.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Cited source domains</caption>
          <thead>
            <tr>
              <th scope="col" className="py-1 pr-4">
                Domain
              </th>
              <th scope="col" className="py-1 pr-4">
                Citations
              </th>
              <th scope="col" className="py-1">
                Kinds
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([host, v]) => (
              <tr key={host} className="border-t" style={{ borderColor: "var(--rule)" }}>
                <td className="py-1 pr-4">{host}</td>
                <td className="py-1 pr-4">{v.n}</td>
                <td className="py-1">{[...v.types].join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
