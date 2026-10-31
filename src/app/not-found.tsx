import { IntentLink } from "@/components/IntentLink";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-accent text-4xl font-semibold">{t("notFound.title")}</h1>
      <p className="text-text-soft mt-4">{t("notFound.body")}</p>
      <p className="mt-6">
        <IntentLink href="/" className="underline">
          {t("notFound.back")}
        </IntentLink>
      </p>
    </main>
  );
}
