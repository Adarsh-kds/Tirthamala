import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { t } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { INDEXING_ON, SITE_URL } from "@/lib/site-config";

const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const tiro = localFont({
  src: [
    {
      path: "../fonts/tiro-devanagari-sanskrit-devanagari-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/tiro-devanagari-sanskrit-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-tiro",
  display: "swap",
  preload: false,
});

const sourceSans = localFont({
  src: "../fonts/source-sans-3-latin-wght-normal.woff2",
  weight: "200 900",
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: t("site.title"), template: "%s | Tirtha Atlas" },
  description: t("site.description"),
  robots: { index: INDEXING_ON, follow: INDEXING_ON },
  openGraph: { siteName: "Tirtha Atlas", type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${tiro.variable} ${sourceSans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {t("a11y.skipToContent")}
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
