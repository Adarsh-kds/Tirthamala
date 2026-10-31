import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { t } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconSprite } from "@/components/motifs/TraditionIcon";
import { ScrollToTop } from "@/components/ScrollToTop";
import { INDEXING_ON, SITE_NAME, SITE_URL } from "@/lib/site-config";

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

// Devanagari only; Latin text in Sanskrit spans falls back to Cormorant via the font stack.
const tiro = localFont({
  src: "../fonts/tiro-devanagari-sanskrit-devanagari-400-normal.woff2",
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF",
    },
  ],
});

const sourceSans = localFont({
  src: "../fonts/source-sans-3-latin-wght-normal.woff2",
  weight: "200 900",
  variable: "--font-source-sans",
  display: "swap",
});

const THEME_INIT = `try{if(localStorage.getItem("theme")==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: t("site.title"), template: `%s | ${SITE_NAME}` },
  description: t("site.description"),
  robots: { index: INDEXING_ON, follow: INDEXING_ON },
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${cormorant.variable} ${tiro.variable} ${sourceSans.variable}`}
    >
      <head>
        {/* Runs before first paint; extensions may inject their own <script> here, so skip hydration checks. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <IconSprite />
        <ScrollToTop />
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
