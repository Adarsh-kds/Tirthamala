import { PageHeading } from "./Article";

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
      <PageHeading crumbs={[{ name: crumb }]} title={title} />
      <div className="[&_h2]:font-display mt-4 space-y-4 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </main>
  );
}
