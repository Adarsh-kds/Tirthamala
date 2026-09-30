import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        This path leads nowhere yet
      </h1>
      <p className="mt-4" style={{ color: "var(--text-soft)" }}>
        The page you looked for does not exist. Return to the atlas and continue from there.
      </p>
      <p className="mt-6">
        <Link href="/" className="underline">
          Back to the atlas
        </Link>
      </p>
    </main>
  );
}
