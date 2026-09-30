import { Breadcrumbs } from "./Breadcrumbs";

export function Page({
  title,
  crumb,
  children,
}: {
  title: string;
  crumb: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs items={[{ name: crumb }]} />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {title}
      </h1>
      <div className="[&_h2]:font-display mt-4 space-y-4 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </main>
  );
}
