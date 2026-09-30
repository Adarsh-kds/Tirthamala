import type { Metadata } from "next";
import { Page } from "@/components/Prose";
import { CORRECTIONS_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Corrections",
  description: "How to report an error or suggest a better source for a page in the Tirtha Atlas.",
  alternates: { canonical: "/corrections/" },
};

export default function Corrections() {
  return (
    <Page title="Corrections" crumb="Corrections">
      <p>
        Accuracy is the point of this atlas. If you find an error, a missing variant, a wrong
        location, or a better source, please write to{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`}>{CORRECTIONS_EMAIL}</a>.
      </p>
      <h2>What to include</h2>
      <ul>
        <li>The page address, or the name of the site or circuit.</li>
        <li>
          What should change, and the source that supports it (a link, a book with page number, an
          inscription or an official notice).
        </li>
        <li>For locations, coordinates and where you read them.</li>
      </ul>
      <p>
        Every site page has a &ldquo;report an error&rdquo; link that pre-fills this information.
        Corrections that are supported by a primary or official source are applied first, and the
        page&rsquo;s &ldquo;last checked&rdquo; date is updated.
      </p>
    </Page>
  );
}
