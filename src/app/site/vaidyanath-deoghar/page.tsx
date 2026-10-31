import type { Metadata } from "next";
import Link from "next/link";

const destination = "/site/baidyanath-deoghar/";

export const metadata: Metadata = {
  title: "Baidyanath Temple, Deoghar",
  alternates: { canonical: destination },
  robots: { index: false, follow: true },
};

export default function RenamedTemplePage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <Link href={destination}>Baidyanath Temple, Deoghar</Link>
    </main>
  );
}
