import type { Metadata } from "next";
import { Page } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Tirthamala uses no analytics, no advertising and no cookies.",
  alternates: { canonical: "/privacy/" },
};

export default function Privacy() {
  return (
    <Page title="Privacy" crumb="Privacy">
      <p>
        The atlas is a static website. It has no accounts, no advertising, no analytics and no
        third-party trackers, and it does not set cookies.
      </p>
      <ul>
        <li>
          If you choose a light or dark theme, your choice is stored in your own browser (local
          storage) so it can be remembered. It is never sent anywhere.
        </li>
        <li>
          Fonts, map data and boundaries are served from this site itself. The map does not request
          tiles from outside services.
        </li>
        <li>Links to source pages lead to other websites, which have their own policies.</li>
        <li>
          If you email a correction, your message is read by the publisher and used only to respond
          and update the atlas.
        </li>
      </ul>
    </Page>
  );
}
