import type { Metadata } from "next";
import { Page } from "@/components/Prose";
import { PUBLISHER, BOUNDARY_NOTE } from "@/lib/site-config";
import { TIER_MIN_WORDS } from "@/lib/tiers";

export const metadata: Metadata = {
  title: "About the atlas and how we verify",
  description:
    "How the Tirtha Atlas researches, sources and labels its pages, and what 'verified', 'sources differ' and 'needs review' mean.",
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <Page title="About the Tirtha Atlas" crumb="About">
      <p>
        The Tirtha Atlas of India is a researched atlas of pilgrimage circuits and sacred sites
        across India and its neighbourhood. It is written by {PUBLISHER.name} at {PUBLISHER.org}.
        Every page is original prose, every claim is tied to a cited source, and anything we could
        not confirm is labelled as such. An honest gap is always preferred to a confident error.
      </p>
      <h2 id="verification">How pages are labelled</h2>
      <ul>
        <li>
          <strong>Verified.</strong> At least two independent sources, at least one of them primary
          or official, and a location confirmed by independent coordinate sources.
        </li>
        <li>
          <strong>Sources differ.</strong> The identity, location or membership of the site is
          genuinely disputed. We show the credible variants with their sources and do not rank them.
        </li>
        <li>
          <strong>Needs review.</strong> We could not meet the bar above. The page says exactly what
          is missing. These pages are drafts and are not offered to search engines.
        </li>
      </ul>
      <p>
        Locations are shown as exact, approximate (within about a kilometre, or a town or complex
        centre), or area only. Approximate locations appear on the map as open rings.
      </p>
      <p>
        Verification notes sometimes mention the &ldquo;seed list&rdquo;. This is the starting list
        of sites and circuits the atlas was built from. It is a list of names to research, not a
        source, and entries from it are corrected wherever research shows it was wrong.
      </p>
      <h2>Legend, history and belief</h2>
      <p>
        Each page keeps tradition and historical record apart. Legends are always attributed to the
        text or tradition that tells them, and historical statements carry a confidence label:
        documented, probable, or traditional account. Where texts or lists disagree, for example on
        which temples belong to a circuit, the disagreement is shown rather than hidden.
      </p>
      <h2>Page depth</h2>
      <p>
        Pages are grouped into three tiers with minimum lengths of {TIER_MIN_WORDS.A},{" "}
        {TIER_MIN_WORDS.B} and {TIER_MIN_WORDS.C} words. A page is published only when it is
        verified and meets its tier minimum; thinner pages stay visible to readers as drafts but are
        hidden from search engines.
      </p>
      <h2>Maps and boundaries</h2>
      <p>
        {BOUNDARY_NOTE} Sites in Nepal, Pakistan, Bangladesh, China (Tibet) and Sri Lanka are
        labelled neutrally by country, with no comment on borders.
      </p>
      <h2>Privacy</h2>
      <p>
        The atlas has no analytics, no advertising and no accounts. See the privacy page for
        details.
      </p>
    </Page>
  );
}
