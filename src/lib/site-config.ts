export const SITE_NAME = "Tirtha Atlas";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tirtha.cp5.in";
// Indexing stays off until the owner sets NEXT_PUBLIC_INDEXING=on for launch.
export const INDEXING_ON = process.env.NEXT_PUBLIC_INDEXING === "on";
export const PUBLISHER = { name: "Adarsh Singh", org: "Relic Studios" };
export const CORRECTIONS_EMAIL = "dams.pvt@gmail.com";
export const BOUNDARY_NOTE =
  "Boundaries follow Natural Earth's India point-of-view dataset and are shown for orientation only. They are not authoritative.";
